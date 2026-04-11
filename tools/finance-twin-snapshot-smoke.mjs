import { createHash } from "node:crypto";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createContainer } from "../apps/control-plane/src/bootstrap.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile } from "./m2-exit-utils.mjs";

const DEFAULT_COMPANY_KEY = "local-finance-snapshot-smoke-company";
const DEFAULT_COMPANY_NAME = "Local Finance Snapshot Smoke Company";
const DEFAULT_CREATED_BY = "finance-snapshot-smoke";
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
      note: "Seed snapshot for the packaged finance snapshot smoke.",
      requestedBy: "finance_snapshot_smoke",
      runTag: input.runTag,
    },
    null,
    2,
  );

  return {
    companyKey: input.companyKey,
    companyName: input.companyName,
    createdBy: input.createdBy,
    chartOfAccounts: {
      linkName: `chart-of-accounts-link-${input.runTag}.txt`,
      sourceName: `Chart of accounts smoke ${input.runTag}`,
      uploadName: `chart-of-accounts-${input.runTag}.csv`,
      uploadText: [
        "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
        "1000,Cash,asset,current_asset,,true,Operating cash",
        "1100,Petty Cash,asset,current_asset,1000,false,Small cash drawer",
        "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
      ].join("\n"),
      capturedAt: "2026-04-11T00:00:00.000Z",
      storageRef: `https://example.com/chart-of-accounts/${input.runTag}`,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      seed: {
        body: Buffer.from(`${seedText}\n`, "utf8"),
        mediaType: "application/json",
        originalFileName: `finance-snapshot-chart-seed-${input.runTag}.json`,
      },
    },
    trialBalance: {
      linkName: `trial-balance-link-${input.runTag}.txt`,
      sourceName: `Trial balance smoke ${input.runTag}`,
      uploadName: `trial-balance-${input.runTag}.csv`,
      uploadText: [
        "account_code,account_name,period_end,debit,credit,currency_code,account_type",
        "1000,Cash,2026-03-31,100.00,0.00,USD,asset",
        "2000,Accounts Payable,2026-03-31,0.00,40.00,USD,liability",
        "3000,Retained Earnings,2026-03-31,0.00,60.00,USD,equity",
      ].join("\n"),
      capturedAt: "2026-04-11T00:05:00.000Z",
      storageRef: `https://example.com/trial-balance/${input.runTag}`,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      seed: {
        body: Buffer.from(`${seedText}\n`, "utf8"),
        mediaType: "application/json",
        originalFileName: `finance-snapshot-trial-balance-seed-${input.runTag}.json`,
      },
    },
    generalLedger: {
      linkName: `general-ledger-link-${input.runTag}.txt`,
      sourceName: `General ledger smoke ${input.runTag}`,
      uploadName: `general-ledger-${input.runTag}.csv`,
      uploadText: [
        "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
        "J-100,2026-04-01,1100,Petty Cash,asset,25.00,0.00,USD,Fund the petty cash drawer",
        "J-100,2026-04-01,1000,Cash,asset,0.00,25.00,USD,Fund the petty cash drawer",
        "J-101,2026-04-02,1000,Cash,asset,50.00,0.00,USD,Customer receipt",
        "J-101,2026-04-02,4000,Revenue,revenue,0.00,50.00,USD,Customer receipt",
      ].join("\n"),
      capturedAt: "2026-04-11T00:10:00.000Z",
      storageRef: `https://example.com/general-ledger/${input.runTag}`,
      checksumSha256:
        "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      seed: {
        body: Buffer.from(`${seedText}\n`, "utf8"),
        mediaType: "application/json",
        originalFileName: `finance-snapshot-general-ledger-seed-${input.runTag}.json`,
      },
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

    const chart = await createFinanceSourceFile(app, fixture.chartOfAccounts);
    const trialBalance = await createFinanceSourceFile(app, fixture.trialBalance);
    const generalLedger = await createFinanceSourceFile(app, fixture.generalLedger);

    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {
        companyName: fixture.companyName,
      },
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${chart.sourceFile.id}/sync`,
    });
    await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {},
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${trialBalance.sourceFile.id}/sync`,
    });
    const generalLedgerSync = await injectJson(app, {
      expectedStatus: 201,
      method: "POST",
      payload: {},
      url: `/finance-twin/companies/${fixture.companyKey}/source-files/${generalLedger.sourceFile.id}/sync`,
    });

    const snapshot = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/snapshot`,
    });
    const cashRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );
    const lineage = await injectJson(app, {
      expectedStatus: 200,
      method: "GET",
      url: `/finance-twin/companies/${fixture.companyKey}/lineage/ledger_account/${cashRow?.ledgerAccount.id ?? ""}?${new URLSearchParams({
        syncRunId: generalLedgerSync.syncRun.id,
      }).toString()}`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          company: {
            companyKey: snapshot.company.companyKey,
            displayName: snapshot.company.displayName,
          },
          sliceAlignment: snapshot.sliceAlignment,
          coverageSummary: snapshot.coverageSummary,
          latestSuccessfulSlices: snapshot.latestSuccessfulSlices,
          accounts: snapshot.accounts.map((account) => ({
            accountCode: account.ledgerAccount.accountCode,
            accountName: account.ledgerAccount.accountName,
            presentInChartOfAccounts: account.presentInChartOfAccounts,
            presentInTrialBalance: account.presentInTrialBalance,
            presentInGeneralLedger: account.presentInGeneralLedger,
            missingFromChartOfAccounts: account.missingFromChartOfAccounts,
            missingFromTrialBalance: account.missingFromTrialBalance,
            missingFromGeneralLedger: account.missingFromGeneralLedger,
            inactiveWithGeneralLedgerActivity:
              account.inactiveWithGeneralLedgerActivity,
          })),
          scopedLineage: lineage.records.map((record) => ({
            targetKind: record.lineage.targetKind,
            targetId: record.lineage.targetId,
            syncRunId: record.syncRun.id,
            extractorKey: record.syncRun.extractorKey,
            sourceFileName: record.sourceFile.originalFileName,
            sourceSnapshotId: record.sourceSnapshot.id,
          })),
          limitations: snapshot.limitations,
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

async function createFinanceSourceFile(app, fixture) {
  const seedSnapshot = await writeSeedSnapshot(fixture.seed);
  const created = await injectJson(app, {
    expectedStatus: 201,
    method: "POST",
    payload: {
      createdBy: fixture.createdBy ?? DEFAULT_CREATED_BY,
      description: "Packaged finance snapshot smoke source.",
      kind: "dataset",
      name: fixture.sourceName,
      snapshot: {
        capturedAt: fixture.capturedAt,
        checksumSha256: seedSnapshot.checksumSha256,
        mediaType: fixture.seed.mediaType,
        originalFileName: fixture.linkName,
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
    payload: Buffer.from(`${fixture.uploadText}\n`, "utf8"),
    url: `/sources/${sourceId}/files?${new URLSearchParams({
      capturedAt: fixture.capturedAt,
      createdBy: fixture.createdBy ?? DEFAULT_CREATED_BY,
      mediaType: "text/csv",
      originalFileName: fixture.uploadName,
    }).toString()}`,
  });

  return {
    sourceId,
    sourceFile: {
      id: requireUuid(uploaded?.sourceFile?.id, "source file id"),
    },
  };
}

async function writeSeedSnapshot(seed) {
  const directory = await mkdtemp(
    join(tmpdir(), "pocket-cfo-finance-snapshot-smoke-"),
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
