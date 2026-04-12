import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY =
  "local-finance-balance-bridge-prerequisites-smoke-company";
const DEFAULT_COMPANY_NAME =
  "Local Finance Balance Bridge Prerequisites Smoke Company";
const DEFAULT_CREATED_BY = "finance-balance-bridge-prerequisites-smoke";
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
      note: "Seed snapshot for the packaged finance balance-bridge prerequisites smoke.",
      requestedBy: "finance_balance_bridge_prerequisites_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    createdBy: input.createdBy,
    source: {
      sourceName: `Balance bridge prerequisites smoke ${input.runTag}`,
      capturedAt: "2026-04-11T00:00:00.000Z",
      seed: {
        body: Buffer.from(`${seedText}\n`, "utf8"),
        mediaType: "application/json",
        originalFileName: `finance-balance-bridge-prerequisites-seed-${input.runTag}.json`,
      },
    },
    chartOfAccounts: {
      capturedAt: "2026-04-11T00:02:00.000Z",
      originalFileName: `chart-of-accounts-${input.runTag}.csv`,
      uploadText: [
        "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
        "1000,Cash,asset,current_asset,,true,Operating cash",
        "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
        "3000,Archived Clearing,liability,current_liability,,false,Legacy clearing account",
      ].join("\n"),
    },
    trialBalance: {
      capturedAt: "2026-04-11T00:05:00.000Z",
      originalFileName: `trial-balance-${input.runTag}.csv`,
      uploadText: [
        "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
        "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
        "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,90.00,USD,liability",
        "4000,Deferred Revenue,2026-03-01,2026-03-31,0.00,30.00,USD,liability",
      ].join("\n"),
    },
    generalLedger: {
      capturedAt: "2026-04-11T00:10:00.000Z",
      originalFileName: `general-ledger-${input.runTag}.csv`,
      uploadText: [
        "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,account_type,debit,credit,currency_code,memo",
        "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
        "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,3000,Archived Clearing,liability,0.00,50.00,USD,Customer receipt",
        "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,5000,Product Revenue,income,0.00,70.00,USD,Customer receipt",
      ].join("\n"),
    },
  };
}

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
  const runTag = buildRunTag();
  const fixture = buildFixture({
    ...options,
    runTag,
  });
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const source = await createSharedSource(app, fixture);
    const chartFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.chartOfAccounts.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.chartOfAccounts.originalFileName,
      uploadText: fixture.chartOfAccounts.uploadText,
    });
    const trialBalanceFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.trialBalance.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.trialBalance.originalFileName,
      uploadText: fixture.trialBalance.uploadText,
    });
    const generalLedgerFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.generalLedger.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.generalLedger.originalFileName,
      uploadText: fixture.generalLedger.uploadText,
    });

    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${chartFile.sourceFile.id}/sync`,
    });
    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {},
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${trialBalanceFile.sourceFile.id}/sync`,
    });
    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {},
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${generalLedgerFile.sourceFile.id}/sync`,
    });

    const balanceBridgePrerequisites = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/reconciliation/trial-balance-vs-general-ledger/balance-bridge-prerequisites`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: balanceBridgePrerequisites.company,
          accountBridgeReadiness:
            balanceBridgePrerequisites.accountBridgeReadiness,
          balanceBridgePrerequisites:
            balanceBridgePrerequisites.balanceBridgePrerequisites,
          coverageSummary: balanceBridgePrerequisites.coverageSummary,
          accounts: balanceBridgePrerequisites.accounts.map((account) => ({
            accountCode: account.ledgerAccount.accountCode,
            presentInChartOfAccounts: account.presentInChartOfAccounts,
            presentInTrialBalance: account.presentInTrialBalance,
            presentInGeneralLedger: account.presentInGeneralLedger,
            matchedPeriodAccountBridgeReady:
              account.matchedPeriodAccountBridgeReady,
            balanceBridgePrereqReady: account.balanceBridgePrereqReady,
            blockedReasonCode: account.blockedReasonCode,
            generalLedgerBalanceProof: account.generalLedgerBalanceProof,
          })),
          diagnostics: balanceBridgePrerequisites.diagnostics,
          limitations: balanceBridgePrerequisites.limitations,
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

async function createSharedSource(app, fixture) {
  const seedSnapshot = await writeSeedSnapshot(fixture.source.seed);

  return injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: fixture.createdBy,
      description:
        "Packaged finance balance-bridge prerequisites smoke source.",
      kind: "dataset",
      name: fixture.source.sourceName,
      snapshot: {
        capturedAt: fixture.source.capturedAt,
        checksumSha256: seedSnapshot.checksumSha256,
        mediaType: fixture.source.seed.mediaType,
        originalFileName: fixture.source.seed.originalFileName,
        sizeBytes: fixture.source.seed.body.byteLength,
        storageKind: "local_path",
        storageRef: seedSnapshot.storageRef,
      },
    },
    url: "/sources",
  });
}

async function createSourceFile(app, sourceId, input) {
  return injectJson(app, {
    expectedStatus: 201,
    headers: {
      "content-type": "application/octet-stream",
    },
    method: "POST",
    payload: Buffer.from(`${input.uploadText}\n`, "utf8"),
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: input.capturedAt,
      createdBy: input.createdBy,
      mediaType: "text/csv",
      originalFileName: input.originalFileName,
    }).toString()}`,
  });
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-balance-bridge-prerequisites-smoke-"),
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
    payload: input.payload,
    headers: input.headers,
  });

  if (response.statusCode !== input.expectedStatus) {
    throw new Error(
      [
        `Expected ${input.method} ${input.url} to return ${input.expectedStatus},`,
        `received ${response.statusCode}.`,
        response.body,
      ].join(" "),
    );
  }

  return response.json();
}

main().catch(async (error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
        modulePath: MODULE_PATH,
      },
      null,
      2,
    ),
  );
  await closeAllPools();
  process.exitCode = 1;
});
