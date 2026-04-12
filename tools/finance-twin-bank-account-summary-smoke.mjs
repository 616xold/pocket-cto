import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-bank-account-summary-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Bank Account Summary Smoke Company";
const DEFAULT_CREATED_BY = "finance-bank-account-summary-smoke";
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
      note: "Seed snapshot for the packaged finance bank-account-summary smoke.",
      requestedBy: "finance_bank_account_summary_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );
  const uploadText = [
    "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
    "Operating Checking,First National,1234,1200.00,1000.00,,USD,2026-04-10",
    "Payroll Reserve,First National,5678,,,250.00,USD,",
    "Treasury Sweep,First National,9012,,400.00,,USD,2026-04-11",
    "Euro Operating,Euro Bank,9999,300.00,,,EUR,2026-04-09",
  ].join("\n");

  return {
    createdBy: input.createdBy,
    companyKey: input.companyKey,
    companyName: input.companyName,
    sourceName: `Bank account summary smoke ${input.runTag}`,
    seed: {
      body: Buffer.from(`${seedText}\n`, "utf8"),
      mediaType: "application/json",
      originalFileName: `finance-bank-account-summary-seed-${input.runTag}.json`,
    },
    upload: {
      body: Buffer.from(`${uploadText}\n`, "utf8"),
      mediaType: "text/csv",
      originalFileName: `bank-account-summary-${input.runTag}.csv`,
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
        description: "Packaged finance bank-account-summary smoke source.",
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
    const [bankAccounts, cashPosture] = await Promise.all([
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/bank-accounts`,
      }),
      injectJson(app, {
        expectedStatus: 200,
        method: "GET",
        url: `/finance-twin/companies/${fixture.companyKey}/cash-posture`,
      }),
    ]);

    if (bankAccounts.accountCount !== 4) {
      throw new Error(
        `Expected four persisted bank accounts, received ${bankAccounts.accountCount}`,
      );
    }

    const usdBucket = cashPosture.currencyBuckets.find(
      (bucket) => bucket.currency === "USD",
    );

    if (!usdBucket) {
      throw new Error("Expected a USD cash-posture bucket");
    }

    if (
      usdBucket.statementOrLedgerBalanceTotal !== "1200.00" ||
      usdBucket.availableBalanceTotal !== "1400.00" ||
      usdBucket.unspecifiedBalanceTotal !== "250.00"
    ) {
      throw new Error(
        `Unexpected USD cash-posture totals: ${JSON.stringify(usdBucket)}`,
      );
    }

    const lineageRef =
      bankAccounts.accounts[0]?.reportedBalances[0]?.lineageRef ?? null;

    if (lineageRef?.targetKind !== "bank_account_summary") {
      throw new Error(
        `Expected bank-account summary lineage ref, received ${JSON.stringify(lineageRef)}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: bankAccounts.company.companyKey,
            displayName: bankAccounts.company.displayName,
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
          bankAccounts: {
            accountCount: bankAccounts.accountCount,
            diagnostics: bankAccounts.diagnostics,
            latestSuccessfulSlice: bankAccounts.latestSuccessfulSlice,
          },
          cashPosture: {
            freshness: cashPosture.freshness,
            coverageSummary: cashPosture.coverageSummary,
            currencyBuckets: cashPosture.currencyBuckets,
            diagnostics: cashPosture.diagnostics,
            limitations: cashPosture.limitations,
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
    join(tmpdir(), "pocket-cfo-finance-bank-account-summary-smoke-"),
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
    headers: input.headers,
    method: input.method,
    payload: input.payload,
    url: input.url,
  });

  if (response.statusCode !== input.expectedStatus) {
    throw new Error(
      `${input.method} ${input.url} failed with ${response.statusCode}: ${response.body}`,
    );
  }

  return response.body ? response.json() : null;
}

function requireUuid(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} missing from response`);
  }

  return value;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
