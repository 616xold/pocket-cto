import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-payables-aging-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Payables Aging Smoke Company";
const DEFAULT_CREATED_BY = "finance-payables-aging-smoke";
const MODULE_PATH = fileURLToPath(import.meta.url);

function parseArgs(argv) {
  const options = {
    companyKey: DEFAULT_COMPANY_KEY,
    companyName: DEFAULT_COMPANY_NAME,
    createdBy: DEFAULT_CREATED_BY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];

    if (!entry?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${entry}`);
    }

    const [rawFlag, inlineValue] = entry.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];

    if (inlineValue === undefined) {
      index += 1;
    }

    if (value === undefined) {
      throw new Error(`Missing value for --${rawFlag}`);
    }

    switch (rawFlag) {
      case "company-key":
        options.companyKey = value;
        break;
      case "company-name":
        options.companyName = value;
        break;
      case "created-by":
        options.createdBy = value;
        break;
      default:
        throw new Error(`Unexpected argument: --${rawFlag}`);
    }
  }

  return options;
}

function buildFixture(input) {
  const seedText = JSON.stringify(
    {
      createdBy: input.createdBy,
      note: "Seed snapshot for the packaged finance payables-aging smoke.",
      requestedBy: "finance_payables_aging_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "vendor_name,vendor_id,currency,as_of,current,31_60,past_due,total",
    "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
    "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
    "Cloud Hosting,V-200,USD,,,,80.00,80.00",
    "Office Lease,V-300,EUR,2026-04-29,50.00,,,50.00",
  ].join("\n");

  return {
    createdBy: input.createdBy,
    companyKey: input.companyKey,
    companyName: input.companyName,
    sourceName: `Payables aging smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `finance-payables-aging-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `payables-aging-${input.runTag}.csv`,
    },
  };
}

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"));
  const runTag = buildRunTag();
  const fixture = buildFixture({
    ...options,
    runTag,
  });
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const capturedAt = new Date().toISOString();
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const created = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        createdBy: fixture.createdBy,
        description: "Packaged finance payables-aging smoke source.",
        kind: "dataset",
        name: fixture.sourceName,
        snapshot: {
          capturedAt,
          checksumSha256: seedSnapshot.checksumSha256,
          mediaType: fixture.seed.mediaType,
          originalFileName: fixture.seed.originalFileName,
          sizeBytes: fixture.seed.body.byteLength,
          storageKind: "local_path",
          storageRef: seedSnapshot.storageRef,
        },
      },
      url: "/sources",
    });
    const sourceId = requireUuid(created?.source?.id, "source id");
    const uploaded = await injectJson(app, {
      expectedStatus: 201,
      headers: {
        "content-type": "application/octet-stream",
      },
      method: "POST",
      payload: fixture.upload.body,
      url: `/sources/${sourceId}/files?${new URLSearchParams({
        capturedAt,
        createdBy: fixture.createdBy,
        mediaType: fixture.upload.mediaType,
        originalFileName: fixture.upload.originalFileName,
      }).toString()}`,
    });
    const sourceFileId = requireUuid(uploaded?.sourceFile?.id, "source file id");
    const synced = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${sourceFileId}/sync`,
    });
    const [payablesAging, payablesPosture] = await Promise.all([
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/payables-aging`,
      }),
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/payables-posture`,
      }),
    ]);

    if (payablesAging.vendorCount !== 3) {
      throw new Error(
        `Expected three persisted payables-aging vendors, received ${payablesAging.vendorCount}`,
      );
    }

    const usdBucket = payablesPosture.currencyBuckets.find(
      (bucket) => bucket.currency === "USD",
    );

    if (!usdBucket) {
      throw new Error("Expected a USD payables-posture bucket");
    }

    if (
      usdBucket.totalPayables !== "200.00" ||
      usdBucket.currentBucketTotal !== "100.00" ||
      usdBucket.pastDueBucketTotal !== "100.00"
    ) {
      throw new Error(
        `Unexpected USD payables-posture totals: ${JSON.stringify(usdBucket)}`,
      );
    }

    const lineageRef = payablesAging.rows[0]?.lineageRef ?? null;

    if (lineageRef?.targetKind !== "payables_aging_row") {
      throw new Error(
        `Expected payables-aging lineage ref, received ${JSON.stringify(lineageRef)}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: payablesAging.company.companyKey,
            displayName: payablesAging.company.displayName,
          },
          source: {
            id: sourceId,
            name: created.source.name,
          },
          sourceFile: {
            id: sourceFileId,
            originalFileName: uploaded.sourceFile.originalFileName,
            checksumSha256: uploaded.sourceFile.checksumSha256,
            storageRef: uploaded.sourceFile.storageRef,
          },
          syncRun: {
            id: synced.syncRun.id,
            status: synced.syncRun.status,
            extractorKey: synced.syncRun.extractorKey,
          },
          payablesAging: {
            vendorCount: payablesAging.vendorCount,
            diagnostics: payablesAging.diagnostics,
            latestSuccessfulSlice: payablesAging.latestSuccessfulSlice,
            rows: payablesAging.rows,
          },
          payablesPosture: {
            freshness: payablesPosture.freshness,
            coverageSummary: payablesPosture.coverageSummary,
            currencyBuckets: payablesPosture.currencyBuckets,
            diagnostics: payablesPosture.diagnostics,
            limitations: payablesPosture.limitations,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    if (app) {
      await app.close();
    }

    await closeAllPools();
  }
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-payables-aging-smoke-"),
  );
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256").update(seed.body).digest("hex"),
    storageRef: resolve(storageRef),
  };
}

async function injectJson(app, input) {
  const response = await app.inject({
    method: input.method,
    url: input.url,
    headers: input.headers,
    payload: input.payload,
  });

  if (response.statusCode !== input.expectedStatus) {
    throw new Error(
      `Expected ${input.method} ${input.url} to return ${input.expectedStatus}, received ${response.statusCode}: ${response.body}`,
    );
  }

  return response.json();
}

function requireUuid(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected ${label} to be a non-empty string`);
  }

  return value;
}

main().catch(async (error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        module: MODULE_PATH,
      },
      null,
      2,
    ),
  );

  await closeAllPools();
  process.exitCode = 1;
});
