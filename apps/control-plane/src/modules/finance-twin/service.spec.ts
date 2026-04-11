import { describe, expect, it } from "vitest";
import { SourceRegistryService } from "../sources/service";
import { InMemorySourceRepository } from "../sources/repository";
import { InMemorySourceFileStorage } from "../sources/storage";
import {
  FinanceCompanyNotFoundError,
  FinanceTwinUnsupportedSourceError,
} from "./errors";
import { InMemoryFinanceTwinRepository } from "./repository";
import { FinanceTwinService } from "./service";

describe("FinanceTwinService", () => {
  it("syncs one uploaded chart-of-accounts CSV into persisted account-catalog state", async () => {
    const now = () => new Date("2026-04-10T09:15:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "Chart of accounts",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "chart-of-accounts-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        storageKind: "external_url",
        storageRef: "https://example.com/chart-of-accounts",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "chart-of-accounts.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "1100,Petty Cash,asset,current_asset,1000,false,Small cash drawer",
        ].join("\n"),
      ),
    );

    const synced = await financeTwinService.syncCompanySourceFile(
      "acme",
      registered.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    const summary = await financeTwinService.getCompanySummary("acme");
    const accountCatalog = await financeTwinService.getAccountCatalog("acme");

    expect(synced).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      syncRun: {
        status: "succeeded",
        sourceFileId: registered.sourceFile.id,
        extractorKey: "chart_of_accounts_csv",
      },
      companyTotals: {
        reportingPeriodCount: 0,
        ledgerAccountCount: 2,
      },
      latestSuccessfulSlices: {
        chartOfAccounts: {
          coverage: {
            accountCatalogEntryCount: 2,
            lineageCount: 4,
          },
          summary: {
            accountCount: 2,
            activeAccountCount: 1,
            inactiveAccountCount: 1,
            parentLinkedCount: 1,
          },
        },
      },
    });
    expect(summary).toMatchObject({
      company: {
        companyKey: "acme",
      },
      freshness: {
        overall: {
          state: "missing",
        },
        trialBalance: {
          state: "missing",
        },
        chartOfAccounts: {
          state: "fresh",
        },
        generalLedger: {
          state: "missing",
        },
      },
      latestAttemptedSlices: {
        chartOfAccounts: {
          latestSyncRun: {
            id: synced.syncRun.id,
            status: "succeeded",
          },
        },
      },
      companyTotals: {
        reportingPeriodCount: 0,
        ledgerAccountCount: 2,
      },
      latestSuccessfulSlices: {
        chartOfAccounts: {
          coverage: {
            accountCatalogEntryCount: 2,
          },
        },
      },
    });
    expect(accountCatalog).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestSuccessfulSlice: {
        coverage: {
          accountCatalogEntryCount: 2,
          lineageCount: 4,
        },
      },
      freshness: {
        state: "fresh",
      },
      accounts: [
        {
          ledgerAccount: {
            accountCode: "1000",
            accountName: "Cash",
          },
          catalogEntry: {
            detailType: "current_asset",
            description: "Operating cash",
            parentAccountCode: null,
            isActive: true,
          },
        },
        {
          ledgerAccount: {
            accountCode: "1100",
            accountName: "Petty Cash",
          },
          catalogEntry: {
            parentAccountCode: "1000",
            isActive: false,
          },
        },
      ],
    });
  });

  it("syncs one uploaded trial-balance CSV and leaves the other slices missing", async () => {
    const now = () => new Date("2026-04-09T23:15:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "March trial balance",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-trial-balance-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        storageKind: "external_url",
        storageRef: "https://example.com/march-trial-balance",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "march-trial-balance.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-31,125000.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-31,0.00,42000.00,USD,liability",
        ].join("\n"),
      ),
    );

    const synced = await financeTwinService.syncCompanySourceFile(
      "acme",
      registered.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    const summary = await financeTwinService.getCompanySummary("acme");

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "trial_balance_csv",
        status: "succeeded",
      },
      companyTotals: {
        reportingPeriodCount: 1,
        ledgerAccountCount: 2,
      },
      latestSuccessfulSlices: {
        trialBalance: {
          coverage: {
            lineCount: 2,
            lineageCount: 5,
          },
          summary: {
            accountCount: 2,
            lineCount: 2,
            totalDebitAmount: "125000.00",
            totalCreditAmount: "42000.00",
            totalNetAmount: "83000.00",
          },
        },
      },
    });
    expect(summary).toMatchObject({
      freshness: {
        overall: {
          state: "missing",
        },
        trialBalance: {
          state: "fresh",
        },
        chartOfAccounts: {
          state: "missing",
        },
        generalLedger: {
          state: "missing",
        },
      },
      latestSuccessfulSlices: {
        trialBalance: {
          coverage: {
            lineCount: 2,
          },
        },
        chartOfAccounts: {
          coverage: {
            accountCatalogEntryCount: 0,
          },
        },
        generalLedger: {
          coverage: {
            journalEntryCount: 0,
            journalLineCount: 0,
          },
        },
      },
    });
  });

  it("syncs one uploaded general-ledger CSV into persisted journal state", async () => {
    const now = () => new Date("2026-04-11T08:00:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "General ledger",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "general-ledger-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        storageKind: "external_url",
        storageRef: "https://example.com/general-ledger",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "general-ledger.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "journal_id,transaction_date,account_code,account_name,debit,credit,currency_code,memo",
          "J-100,2026-03-31,1000,Cash,100.00,0.00,USD,Seed funding received",
          "J-100,2026-03-31,3000,Common Stock,0.00,100.00,USD,Seed funding received",
          "J-101,2026-04-01,6100,,25.00,0.00,USD,Office expense",
        ].join("\n"),
      ),
    );

    const synced = await financeTwinService.syncCompanySourceFile(
      "acme",
      registered.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    const summary = await financeTwinService.getCompanySummary("acme");
    const generalLedger = await financeTwinService.getGeneralLedger("acme");

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "general_ledger_csv",
        status: "succeeded",
      },
      latestSuccessfulSlices: {
        generalLedger: {
          coverage: {
            journalEntryCount: 2,
            journalLineCount: 3,
            lineageCount: 8,
          },
          summary: {
            journalEntryCount: 2,
            journalLineCount: 3,
            ledgerAccountCount: 3,
            totalDebitAmount: "125.00",
            totalCreditAmount: "100.00",
            earliestEntryDate: "2026-03-31",
            latestEntryDate: "2026-04-01",
            currencyCode: "USD",
          },
        },
      },
    });
    expect(summary).toMatchObject({
      freshness: {
        overall: {
          state: "missing",
        },
        generalLedger: {
          state: "fresh",
        },
      },
      latestAttemptedSlices: {
        generalLedger: {
          latestSyncRun: {
            id: synced.syncRun.id,
            status: "succeeded",
          },
        },
      },
      latestSuccessfulSlices: {
        generalLedger: {
          coverage: {
            journalEntryCount: 2,
            journalLineCount: 3,
            lineageCount: 8,
          },
        },
      },
    });
    expect(generalLedger).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "general_ledger_csv",
      },
      latestSuccessfulSlice: {
        coverage: {
          journalEntryCount: 2,
          journalLineCount: 3,
          lineageCount: 8,
        },
      },
      freshness: {
        state: "fresh",
      },
      entries: [
        {
          journalEntry: {
            externalEntryId: "J-100",
            transactionDate: "2026-03-31",
          },
          lines: [
            {
              ledgerAccount: {
                accountCode: "1000",
                accountName: "Cash",
              },
            },
            {
              ledgerAccount: {
                accountCode: "3000",
                accountName: "Common Stock",
              },
            },
          ],
        },
        {
          journalEntry: {
            externalEntryId: "J-101",
            transactionDate: "2026-04-01",
          },
          lines: [
            {
              ledgerAccount: {
                accountCode: "6100",
                accountName: null,
              },
            },
          ],
        },
      ],
    });
  });

  it("builds a cross-slice company snapshot and scoped lineage drill truthfully", async () => {
    const now = () => new Date("2026-04-11T11:30:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const chartSource = await sourceService.createSource({
      kind: "dataset",
      name: "Chart of accounts",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "chart-of-accounts-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "1111111111111111111111111111111111111111111111111111111111111111",
        storageKind: "external_url",
        storageRef: "https://example.com/chart-of-accounts",
        ingestStatus: "registered",
      },
    });
    const trialBalanceSource = await sourceService.createSource({
      kind: "dataset",
      name: "Trial balance",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "trial-balance-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "2222222222222222222222222222222222222222222222222222222222222222",
        storageKind: "external_url",
        storageRef: "https://example.com/trial-balance",
        ingestStatus: "registered",
      },
    });
    const generalLedgerSource = await sourceService.createSource({
      kind: "dataset",
      name: "General ledger",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "general-ledger-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "3333333333333333333333333333333333333333333333333333333333333333",
        storageKind: "external_url",
        storageRef: "https://example.com/general-ledger",
        ingestStatus: "registered",
      },
    });
    const chartFile = await sourceService.registerSourceFile(
      chartSource.source.id,
      {
        originalFileName: "chart-of-accounts.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "1100,Petty Cash,asset,current_asset,1000,false,Small cash drawer",
          "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
        ].join("\n"),
      ),
    );
    const trialBalanceFile = await sourceService.registerSourceFile(
      trialBalanceSource.source.id,
      {
        originalFileName: "trial-balance.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-31,100.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-31,0.00,40.00,USD,liability",
          "3000,Retained Earnings,2026-03-31,0.00,60.00,USD,equity",
        ].join("\n"),
      ),
    );
    const generalLedgerFile = await sourceService.registerSourceFile(
      generalLedgerSource.source.id,
      {
        originalFileName: "general-ledger.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-04-01,1100,Petty Cash,asset,25.00,0.00,USD,Fund the petty cash drawer",
          "J-100,2026-04-01,1000,Cash,asset,0.00,25.00,USD,Fund the petty cash drawer",
          "J-101,2026-04-02,1000,Cash,asset,50.00,0.00,USD,Customer receipt",
          "J-101,2026-04-02,4000,Revenue,revenue,0.00,50.00,USD,Customer receipt",
        ].join("\n"),
      ),
    );

    await financeTwinService.syncCompanySourceFile("acme", chartFile.sourceFile.id, {
      companyName: "Acme Holdings",
    });
    await financeTwinService.syncCompanySourceFile(
      "acme",
      trialBalanceFile.sourceFile.id,
      {},
    );
    const generalLedgerSync = await financeTwinService.syncCompanySourceFile(
      "acme",
      generalLedgerFile.sourceFile.id,
      {},
    );
    const snapshot = await financeTwinService.getCompanySnapshot("acme");
    const cashRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );
    const pettyCashRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1100",
    );
    const retainedEarningsRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "3000",
    );
    const revenueRow = snapshot.accounts.find(
      (account) => account.ledgerAccount.accountCode === "4000",
    );

    expect(snapshot.sliceAlignment).toMatchObject({
      state: "mixed",
      availableSliceCount: 3,
      implementedSliceCount: 3,
      distinctSourceCount: 3,
      distinctSyncRunCount: 3,
      distinctSourceSnapshotCount: 3,
      sameSource: false,
      sameSyncRun: false,
      sameSourceSnapshot: false,
      reasonCode: "mixed_sources",
    });
    expect(snapshot.coverageSummary).toMatchObject({
      accountRowCount: 5,
      chartOfAccountsAccountCount: 3,
      trialBalanceAccountCount: 3,
      generalLedgerActiveAccountCount: 3,
      accountsPresentInAllImplementedSlicesCount: 1,
      missingFromChartOfAccountsCount: 2,
      missingFromTrialBalanceCount: 2,
      missingFromGeneralLedgerCount: 2,
      inactiveAccountCount: 1,
      inactiveWithGeneralLedgerActivityCount: 1,
    });
    expect(snapshot.latestSuccessfulSlices.trialBalance.coverage).toMatchObject({
      lineCount: 3,
      lineageCount: 7,
      lineageTargetCounts: {
        reportingPeriodCount: 1,
        ledgerAccountCount: 3,
        trialBalanceLineCount: 3,
      },
    });
    expect(snapshot.latestSuccessfulSlices.chartOfAccounts.coverage).toMatchObject({
      accountCatalogEntryCount: 3,
      lineageCount: 6,
      lineageTargetCounts: {
        ledgerAccountCount: 3,
        accountCatalogEntryCount: 3,
      },
    });
    expect(snapshot.latestSuccessfulSlices.generalLedger.coverage).toMatchObject({
      journalEntryCount: 2,
      journalLineCount: 4,
      lineageCount: 9,
      lineageTargetCounts: {
        ledgerAccountCount: 3,
        journalEntryCount: 2,
        journalLineCount: 4,
      },
    });
    expect(snapshot.limitations).toContain(
      "Do not treat this company snapshot as one coherent close package because the latest successful slices are mixed across different registered sources.",
    );
    expect(cashRow).toMatchObject({
      presentInChartOfAccounts: true,
      presentInTrialBalance: true,
      presentInGeneralLedger: true,
      generalLedgerActivity: {
        journalEntryCount: 2,
        journalLineCount: 2,
        totalDebitAmount: "50.00",
        totalCreditAmount: "25.00",
        earliestEntryDate: "2026-04-01",
        latestEntryDate: "2026-04-02",
      },
      activityLineageRef: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
      lineageTargets: {
        ledgerAccount: {
          targetKind: "ledger_account",
        },
        chartOfAccountsEntry: {
          targetKind: "account_catalog_entry",
        },
        trialBalanceLine: {
          targetKind: "trial_balance_line",
        },
      },
    });
    expect(pettyCashRow).toMatchObject({
      presentInChartOfAccounts: true,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      missingFromTrialBalance: true,
      inactiveWithGeneralLedgerActivity: true,
    });
    expect(retainedEarningsRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: true,
      presentInGeneralLedger: false,
      missingFromChartOfAccounts: true,
      missingFromGeneralLedger: true,
    });
    expect(revenueRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      missingFromChartOfAccounts: true,
      missingFromTrialBalance: true,
    });

    expect(cashRow).toBeDefined();

    const ledgerAccountLineage = await financeTwinService.getLineageDrill({
      companyKey: "acme",
      targetKind: "ledger_account",
      targetId: cashRow?.ledgerAccount.id ?? "",
    });
    expect(ledgerAccountLineage.recordCount).toBe(3);
    expect(
      ledgerAccountLineage.records
        .map((record) => record.syncRun.extractorKey)
        .sort(),
    ).toEqual([
      "chart_of_accounts_csv",
      "general_ledger_csv",
      "trial_balance_csv",
    ]);

    const activityLineage =
      await financeTwinService.getGeneralLedgerAccountActivityLineage({
        companyKey: "acme",
        ledgerAccountId: cashRow?.ledgerAccount.id ?? "",
        syncRunId: generalLedgerSync.syncRun.id,
      });

    expect(activityLineage).toMatchObject({
      target: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
      recordCount: 2,
      journalEntryCount: 2,
      journalLineCount: 2,
    });
    expect(activityLineage.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          journalEntry: expect.objectContaining({
            externalEntryId: "J-100",
          }),
          journalEntryLineage: {
            targetKind: "journal_entry",
            syncRunId: generalLedgerSync.syncRun.id,
            targetId: expect.any(String),
          },
          journalLineLineage: {
            targetKind: "journal_line",
            syncRunId: generalLedgerSync.syncRun.id,
            targetId: expect.any(String),
          },
        }),
      ]),
    );

    const journalLineLineage = await financeTwinService.getLineageDrill({
      companyKey: "acme",
      targetKind: "journal_line",
      targetId: activityLineage.records[0]?.journalLineLineage.targetId ?? "",
      syncRunId: generalLedgerSync.syncRun.id,
    });

    expect(journalLineLineage).toMatchObject({
      target: {
        targetKind: "journal_line",
        syncRunId: generalLedgerSync.syncRun.id,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "general_ledger_csv",
            id: generalLedgerSync.syncRun.id,
          },
          sourceFile: {
            originalFileName: "general-ledger.csv",
          },
        },
      ],
    });
  });

  it("builds shared-source reconciliation readiness without faking a balance variance", async () => {
    const now = () => new Date("2026-04-11T12:00:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "March close package",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-close-package-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "f111111111111111111111111111111111111111111111111111111111111111",
        storageKind: "external_url",
        storageRef: "https://example.com/march-close-package",
        ingestStatus: "registered",
      },
    });
    const chartFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "chart-of-accounts.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,account_type,detail_type,parent_account_code,is_active,description",
          "1000,Cash,asset,current_asset,,true,Operating cash",
          "2000,Accounts Payable,liability,current_liability,,true,Supplier balances",
        ].join("\n"),
      ),
    );
    const trialBalanceFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "trial-balance.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,120.00,USD,liability",
        ].join("\n"),
      ),
    );
    const generalLedgerFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "general-ledger.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "journal_id,transaction_date,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-03-15,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
          "J-100,2026-03-15,2000,Accounts Payable,liability,0.00,120.00,USD,Customer receipt",
        ].join("\n"),
      ),
    );

    await financeTwinService.syncCompanySourceFile("acme", chartFile.sourceFile.id, {
      companyName: "Acme Holdings",
    });
    await financeTwinService.syncCompanySourceFile(
      "acme",
      trialBalanceFile.sourceFile.id,
      {},
    );
    const generalLedgerSync = await financeTwinService.syncCompanySourceFile(
      "acme",
      generalLedgerFile.sourceFile.id,
      {},
    );

    const snapshot = await financeTwinService.getCompanySnapshot("acme");
    const reconciliation =
      await financeTwinService.getReconciliationReadiness("acme");
    const cashRow = reconciliation.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );

    expect(snapshot.sliceAlignment).toMatchObject({
      state: "shared_source",
      availableSliceCount: 3,
      implementedSliceCount: 3,
      distinctSourceCount: 1,
      distinctSyncRunCount: 3,
      distinctSourceSnapshotCount: 3,
      sameSource: true,
      sameSyncRun: false,
      sameSourceSnapshot: false,
      reasonCode: "shared_source",
    });
    expect(reconciliation.sliceAlignment).toMatchObject({
      state: "shared_source",
      availableSliceCount: 2,
      implementedSliceCount: 2,
      distinctSourceCount: 1,
      distinctSyncRunCount: 2,
      distinctSourceSnapshotCount: 2,
      sameSource: true,
      sharedSourceId: created.source.id,
      reasonCode: "shared_source",
    });
    expect(snapshot.latestSuccessfulSlices.generalLedger.periodContext).toMatchObject({
      basis: "activity_window_only",
      sourceDeclaredPeriod: null,
      activityWindowEarliestEntryDate: "2026-03-15",
      activityWindowLatestEntryDate: "2026-03-15",
      reasonCode: "activity_window_only",
    });
    expect(reconciliation.comparability).toMatchObject({
      state: "coverage_only",
      basis: "activity_window_only",
      windowRelation: "subset",
      reasonCode: "activity_window_subset",
      trialBalanceWindow: {
        periodStart: "2026-03-01",
        periodEnd: "2026-03-31",
      },
      sourceDeclaredGeneralLedgerPeriod: null,
      generalLedgerWindow: {
        earliestEntryDate: "2026-03-15",
        latestEntryDate: "2026-03-15",
      },
      sameSource: true,
      sameSourceSnapshot: false,
      sameSyncRun: false,
      sharedSourceId: created.source.id,
    });
    expect(reconciliation.coverageSummary).toMatchObject({
      accountRowCount: 2,
      presentInTrialBalanceCount: 2,
      presentInGeneralLedgerCount: 2,
      overlapCount: 2,
      trialBalanceOnlyCount: 0,
      generalLedgerOnlyCount: 0,
    });
    expect(reconciliation.limitations).toContain(
      "This route does not compute a balance variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
    );
    expect(reconciliation.limitations).toContain(
      "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
    );
    expect(cashRow).toMatchObject({
      presentInTrialBalance: true,
      presentInGeneralLedger: true,
      trialBalanceOnly: false,
      generalLedgerOnly: false,
      activityLineageRef: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });
  });

  it("uses explicit source-declared general-ledger period context when the source carries it", async () => {
    const now = () => new Date("2026-04-11T12:00:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: new InMemoryFinanceTwinRepository(),
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "March close package with explicit GL period",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-close-package-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "f222222222222222222222222222222222222222222222222222222222222222",
        storageKind: "external_url",
        storageRef: "https://example.com/march-close-package-explicit-period",
        ingestStatus: "registered",
      },
    });
    const trialBalanceFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "trial-balance.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,period_start,period_end,debit,credit,currency_code,account_type",
          "1000,Cash,2026-03-01,2026-03-31,120.00,0.00,USD,asset",
          "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,120.00,USD,liability",
        ].join("\n"),
      ),
    );
    const generalLedgerFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "general-ledger.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,account_type,debit,credit,currency_code,memo",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,1000,Cash,asset,120.00,0.00,USD,Customer receipt",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,2000,Accounts Payable,liability,0.00,120.00,USD,Customer receipt",
        ].join("\n"),
      ),
    );

    await financeTwinService.syncCompanySourceFile(
      "acme",
      trialBalanceFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    await financeTwinService.syncCompanySourceFile(
      "acme",
      generalLedgerFile.sourceFile.id,
      {},
    );

    const generalLedger = await financeTwinService.getGeneralLedger("acme");
    const reconciliation =
      await financeTwinService.getReconciliationReadiness("acme");

    expect(generalLedger.latestSuccessfulSlice.periodContext).toMatchObject({
      basis: "source_declared_period",
      sourceDeclaredPeriod: {
        contextKind: "period_window",
        periodKey: "2026-03",
        periodStart: "2026-03-01",
        periodEnd: "2026-03-31",
        asOf: null,
      },
      activityWindowEarliestEntryDate: "2026-03-15",
      activityWindowLatestEntryDate: "2026-03-15",
      reasonCode: "source_declared_period_window",
    });
    expect(reconciliation.comparability).toMatchObject({
      state: "window_comparable",
      basis: "source_declared_period",
      windowRelation: "exact_match",
      reasonCode: "source_declared_period_exact_match",
      sourceDeclaredGeneralLedgerPeriod: {
        contextKind: "period_window",
        periodKey: "2026-03",
        periodStart: "2026-03-01",
        periodEnd: "2026-03-31",
        asOf: null,
      },
      generalLedgerWindow: {
        earliestEntryDate: "2026-03-15",
        latestEntryDate: "2026-03-15",
      },
    });
  });

  it("preserves an existing company display name when a later sync omits companyName", async () => {
    const now = () => new Date("2026-04-11T10:00:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeRepository = new InMemoryFinanceTwinRepository();
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: financeRepository,
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "dataset",
      name: "Display name preservation",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "display-name-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        storageKind: "external_url",
        storageRef: "https://example.com/display-name",
        ingestStatus: "registered",
      },
    });
    const firstFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "trial-balance.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_code,account_name,period_end,debit,credit",
          "1000,Cash,2026-03-31,10.00,0.00",
        ].join("\n"),
      ),
    );
    const secondFile = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "general-ledger.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "journal_id,transaction_date,account_code,debit,credit",
          "J-100,2026-03-31,1000,10.00,0.00",
        ].join("\n"),
      ),
    );

    await financeTwinService.syncCompanySourceFile("acme", firstFile.sourceFile.id, {
      companyName: "Acme Holdings",
    });
    await financeTwinService.syncCompanySourceFile("acme", secondFile.sourceFile.id, {});

    await expect(financeTwinService.getCompanySummary("acme")).resolves.toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
    });
  });

  it("rejects unsupported source files before creating finance company state", async () => {
    const now = () => new Date("2026-04-09T23:30:00.000Z");
    const sourceRepository = new InMemorySourceRepository();
    const sourceStorage = new InMemorySourceFileStorage();
    const sourceService = new SourceRegistryService(
      sourceRepository,
      sourceStorage,
      now,
    );
    const financeTwinService = new FinanceTwinService({
      financeTwinRepository: new InMemoryFinanceTwinRepository(),
      sourceFileStorage: sourceStorage,
      sourceRepository,
      now,
    });
    const created = await sourceService.createSource({
      kind: "document",
      name: "Board deck",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "board-deck-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        storageKind: "external_url",
        storageRef: "https://example.com/board-deck",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "board-deck.pdf",
        mediaType: "application/pdf",
        createdBy: "finance-operator",
      },
      Buffer.from("%PDF-1.7 sample bytes"),
    );

    await expect(
      financeTwinService.syncCompanySourceFile("acme", registered.sourceFile.id, {}),
    ).rejects.toBeInstanceOf(FinanceTwinUnsupportedSourceError);
    await expect(financeTwinService.getCompanySummary("acme")).rejects.toBeInstanceOf(
      FinanceCompanyNotFoundError,
    );
  });
});
