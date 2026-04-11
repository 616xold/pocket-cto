import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-finance-reconciliation-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Finance Reconciliation Smoke Company";
const DEFAULT_CREATED_BY = "finance-reconciliation-smoke";
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
      note: "Seed snapshot for the packaged finance reconciliation smoke.",
      requestedBy: "finance_reconciliation_smoke",
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
      sourceName: `Reconciliation smoke ${input.runTag}`,
      capturedAt: "2026-04-11T00:00:00.000Z",
      storageRef: `https://example.com/reconciliation/${input.runTag}`,
      seed: {
        body: Buffer.from(`${seedText}\n`, "utf8"),
        mediaType: "application/json",
        originalFileName: `finance-reconciliation-seed-${input.runTag}.json`,
      },
    },
    chartOfAccounts: {
      uploadName: `chart-of-accounts-${input.runTag}.csv`,
      capturedAt: "2026-04-11T00:05:00.000Z",
      uploadText: [
        "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
        "1000,Cash,asset,current_asset,,true,Operating cash",
        "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
      ].join("\n"),
    },
    trialBalance: {
      uploadName: `trial-balance-${input.runTag}.csv`,
      capturedAt: "2026-04-11T00:10:00.000Z",
      uploadText: [
        "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
        "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
        "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,120.00,USD,liability",
      ].join("\n"),
    },
    generalLedger: {
      uploadName: `general-ledger-${input.runTag}.csv`,
      capturedAt: "2026-04-11T00:15:00.000Z",
      uploadText: [
        "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
        "J-100,2026-03-15,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
        "J-100,2026-03-15,2000,Accounts Payable,liability,0.00,120.00,USD,Customer receipt",
      ].join("\n"),
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
  let app = null;

  try {
    const container = await createContainer();
    app = await buildApp({ container });
    app.log.level = "silent";

    const source = await createSharedSource(app, fixture);
    const chartFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.chartOfAccounts.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.chartOfAccounts.uploadName,
      uploadText: fixture.chartOfAccounts.uploadText,
    });
    const trialBalanceFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.trialBalance.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.trialBalance.uploadName,
      uploadText: fixture.trialBalance.uploadText,
    });
    const generalLedgerFile = await createSourceFile(app, source.source.id, {
      capturedAt: fixture.generalLedger.capturedAt,
      createdBy: fixture.createdBy,
      originalFileName: fixture.generalLedger.uploadName,
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
    const generalLedgerSync = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {},
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${generalLedgerFile.sourceFile.id}/sync`,
    });
    const reconciliation = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/reconciliation/trial-balance-vs-general-ledger`,
    });
    const cashRow = reconciliation.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );
    const activityLineage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/general-ledger/accounts/${cashRow?.ledgerAccount.id ?? ""}/lineage?${new URLSearchParams({
        syncRunId: cashRow?.activityLineageRef?.syncRunId ?? generalLedgerSync.syncRun.id,
      }).toString()}`,
    });
    const journalLineLineage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/lineage/journal_line/${activityLineage.records[0]?.journalLineLineage?.targetId ?? ""}?${new URLSearchParams({
        syncRunId: generalLedgerSync.syncRun.id,
      }).toString()}`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: reconciliation.company.companyKey,
            displayName: reconciliation.company.displayName,
          },
          sliceAlignment: reconciliation.sliceAlignment,
          comparability: reconciliation.comparability,
          coverageSummary: reconciliation.coverageSummary,
          accounts: reconciliation.accounts.map((account) => ({
            accountCode: account.ledgerAccount.accountCode,
            presentInTrialBalance: account.presentInTrialBalance,
            presentInGeneralLedger: account.presentInGeneralLedger,
            trialBalanceOnly: account.trialBalanceOnly,
            generalLedgerOnly: account.generalLedgerOnly,
            activityLineageRef: account.activityLineageRef,
          })),
          activityLineage: activityLineage.records.map((record) => ({
            journalEntryId: record.journalEntry.id,
            journalLineId: record.journalLine.id,
            journalEntryTargetId: record.journalEntryLineage.targetId,
            journalLineTargetId: record.journalLineLineage.targetId,
          })),
          journalLineLineage: journalLineLineage.records.map((record) => ({
            targetKind: record.lineage.targetKind,
            targetId: record.lineage.targetId,
            syncRunId: record.syncRun.id,
            extractorKey: record.syncRun.extractorKey,
            sourceFileName: record.sourceFile.originalFileName,
            sourceSnapshotId: record.sourceSnapshot.id,
          })),
          limitations: reconciliation.limitations,
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
      description: "Packaged finance reconciliation smoke source.",
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
    join(tmpdir(), "pocket-cfo-finance-reconciliation-smoke-"),
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

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  await main();
}
