import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-contract-metadata-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Contract Metadata Smoke Company";
const DEFAULT_CREATED_BY = "finance-contract-metadata-smoke";
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
      note: "Seed snapshot for the packaged finance contract-metadata smoke.",
      requestedBy: "finance_contract_metadata_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "contract_id,contract_name,counterparty,contract_type,status,renewal_date,notice_deadline,next_payment_date,payment_amount,amount,currency,as_of,end_date,auto_renew",
    "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
    "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
    "L-200,Office Lease,Landlord LLC,lease,active,,,2026-06-01,,24000.00,EUR,2026-04-29,2027-01-31,false",
    "S-300,Support Agreement,Service Partner,services,active,,,2026-05-20,250.00,3000.00,GBP,2026-04-28,,true",
    "NDA-1,NDA,Partner Co,confidentiality,draft,,,,,,GBP,,,",
  ].join("\n");

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    createdBy: input.createdBy,
    sourceName: `Contract metadata smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `finance-contract-metadata-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `contract-metadata-${input.runTag}.csv`,
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
        description: "Packaged finance contract-metadata smoke source.",
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
    const [contracts, obligationCalendar] = await Promise.all([
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/contracts`,
      }),
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/obligation-calendar`,
      }),
    ]);

    if (contracts.contractCount !== 4) {
      throw new Error(
        `Expected four persisted contracts, received ${contracts.contractCount}`,
      );
    }

    const usdBucket = obligationCalendar.currencyBuckets.find(
      (bucket) => bucket.currency === "USD",
    );
    const gbpBucket = obligationCalendar.currencyBuckets.find(
      (bucket) => bucket.currency === "GBP",
    );

    if (!usdBucket || usdBucket.explicitAmountTotal !== "500.00") {
      throw new Error(`Unexpected USD obligation bucket: ${JSON.stringify(usdBucket)}`);
    }

    if (!gbpBucket || gbpBucket.explicitAmountTotal !== "250.00") {
      throw new Error(`Unexpected GBP obligation bucket: ${JSON.stringify(gbpBucket)}`);
    }

    const lineageRef = obligationCalendar.upcomingObligations[0]?.lineageRef ?? null;

    if (lineageRef?.targetKind !== "contract_obligation") {
      throw new Error(
        `Expected contract-obligation lineage ref, received ${JSON.stringify(lineageRef)}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: contracts.company.companyKey,
            displayName: contracts.company.displayName,
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
          contracts: {
            contractCount: contracts.contractCount,
            diagnostics: contracts.diagnostics,
            latestSuccessfulSlice: contracts.latestSuccessfulSlice,
            rows: contracts.contracts,
          },
          obligationCalendar: {
            freshness: obligationCalendar.freshness,
            coverageSummary: obligationCalendar.coverageSummary,
            currencyBuckets: obligationCalendar.currencyBuckets,
            diagnostics: obligationCalendar.diagnostics,
            limitations: obligationCalendar.limitations,
            upcomingObligations: obligationCalendar.upcomingObligations,
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
    join(tmpdir(), "pocket-cfo-finance-contract-metadata-smoke-"),
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
