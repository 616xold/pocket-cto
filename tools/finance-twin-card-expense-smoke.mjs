import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-card-expense-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Card Expense Smoke Company";
const DEFAULT_CREATED_BY = "finance-card-expense-smoke";
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
      note: "Seed snapshot for the packaged finance card-expense smoke.",
      requestedBy: "finance_card_expense_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "transaction_id,merchant,vendor,employee,card_name,card_last4,category,memo,amount,posted_amount,transaction_amount,currency,transaction_date,posted_date,expense_date,status,state,reimbursable,pending",
    "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
    "TX-100,Delta Air,,Alex Jones,Corporate Travel,1234,travel,Flight to NYC,500.00,505.00,495.00,USD,2026-04-01,2026-04-03,,submitted,in_review,true,false",
    ",Coffee House,,Alex Jones,Team Card,9876,meals,Team coffee,12.50,,,USD,2026-04-01,,,pending,,false,true",
    "TX-200,Restaurant,,Alex Jones,Team Card,9876,meals,Client dinner,,40.00,39.00,USD,2026-04-02,2026-04-04,,submitted,posted,false,false",
    "EX-300,,Hilton Hotels,,,,travel,Conference stay,200.00,,,EUR,,2026-04-05,2026-04-04,submitted,,false,false",
    "TX-400,Office Depot,,Alex Jones,Office Card,4567,office,Supplies,30.00,,,,,,,,false,false",
  ].join("\n");

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    createdBy: input.createdBy,
    sourceName: `Card expense smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `finance-card-expense-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `card-expense-${input.runTag}.csv`,
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
        description: "Packaged finance card-expense smoke source.",
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
    const [spendItems, spendPosture] = await Promise.all([
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/spend-items`,
      }),
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/spend-posture`,
      }),
    ]);

    if (spendItems.rowCount !== 5) {
      throw new Error(
        `Expected five persisted spend rows, received ${spendItems.rowCount}`,
      );
    }

    const usdBucket = spendPosture.currencyBuckets.find(
      (bucket) => bucket.currency === "USD",
    );
    const unknownBucket = spendPosture.currencyBuckets.find(
      (bucket) => bucket.currency === null,
    );

    if (!usdBucket || usdBucket.postedAmountTotal !== "545.00") {
      throw new Error(`Unexpected USD spend bucket: ${JSON.stringify(usdBucket)}`);
    }

    if (!unknownBucket || unknownBucket.reportedAmountTotal !== "30.00") {
      throw new Error(
        `Unexpected unknown-currency spend bucket: ${JSON.stringify(unknownBucket)}`,
      );
    }

    const lineageRef =
      spendItems.rows.find((row) => row.spendRow.explicitRowIdentity === "TX-100")
        ?.lineageRef ?? null;

    if (lineageRef?.targetKind !== "spend_row") {
      throw new Error(
        `Expected spend-row lineage ref, received ${JSON.stringify(lineageRef)}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: spendItems.company.companyKey,
            displayName: spendItems.company.displayName,
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
          spendItems: {
            rowCount: spendItems.rowCount,
            diagnostics: spendItems.diagnostics,
            latestSuccessfulSlice: spendItems.latestSuccessfulSlice,
            rows: spendItems.rows,
          },
          spendPosture: {
            freshness: spendPosture.freshness,
            coverageSummary: spendPosture.coverageSummary,
            currencyBuckets: spendPosture.currencyBuckets,
            diagnostics: spendPosture.diagnostics,
            limitations: spendPosture.limitations,
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
    join(tmpdir(), "pocket-cfo-finance-card-expense-smoke-"),
  );
  const storageRef = join(directory, seed.originalFileName);

  await writeFile(storageRef, seed.body);

  return {
    checksumSha256: createHash("sha256").update(seed.body).digest("hex"),
    storageRef,
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
      `Expected ${input.expectedStatus} for ${input.method} ${input.url}, received ${response.statusCode}: ${response.body}`,
    );
  }

  return response.json();
}

function requireUuid(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected ${label} to be a non-empty string UUID`);
  }

  return value;
}

const invokedFromCli = process.argv[1]
  ? resolve(process.argv[1]) === MODULE_PATH
  : false;

if (invokedFromCli) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  });
}
