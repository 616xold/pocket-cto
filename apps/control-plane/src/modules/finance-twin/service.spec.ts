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

  it("syncs one uploaded bank-account-summary CSV into persisted bank inventory and truthful cash-posture reads", async () => {
    const now = () => new Date("2026-04-12T10:00:00.000Z");
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
      name: "Bank account summary",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "bank-account-summary-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "abababababababababababababababababababababababababababababababab",
        storageKind: "external_url",
        storageRef: "https://example.com/bank-account-summary",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "bank-account-summary.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "account_name,bank,last4,statement_balance,available_balance,current_balance,currency,as_of",
          "Operating Checking,First National,1234,1200.00,1000.00,,USD,2026-04-10",
          "Payroll Reserve,First National,5678,,,250.00,USD,",
          "Treasury Sweep,First National,9012,,400.00,,USD,2026-04-11",
          "Euro Operating,Euro Bank,9999,300.00,,,EUR,2026-04-09",
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
    const bankAccounts = await financeTwinService.getBankAccounts("acme");
    const cashPosture = await financeTwinService.getCashPosture("acme");

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "bank_account_summary_csv",
        status: "succeeded",
      },
    });
    expect(bankAccounts).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "bank_account_summary_csv",
      },
      latestSuccessfulSlice: {
        coverage: {
          bankAccountCount: 4,
          summaryRowCount: 5,
          lineageCount: 9,
          lineageTargetCounts: {
            bankAccountCount: 4,
            bankAccountSummaryCount: 5,
          },
        },
        summary: {
          bankAccountCount: 4,
          summaryRowCount: 5,
          statementOrLedgerBalanceCount: 2,
          availableBalanceCount: 2,
          unspecifiedBalanceCount: 1,
          datedBalanceCount: 4,
          undatedBalanceCount: 1,
          currencyCount: 2,
        },
      },
      freshness: {
        state: "fresh",
      },
      accountCount: 4,
    });
    const operatingChecking = bankAccounts.accounts.find(
      (account) => account.bankAccount.accountLabel === "Operating Checking",
    );
    const payrollReserve = bankAccounts.accounts.find(
      (account) => account.bankAccount.accountLabel === "Payroll Reserve",
    );

    expect(operatingChecking).toMatchObject({
      bankAccount: {
        accountLabel: "Operating Checking",
        institutionName: "First National",
        accountNumberLast4: "1234",
      },
      currencyCodes: ["USD"],
      knownAsOfDates: ["2026-04-10"],
      unknownAsOfDateBalanceCount: 0,
      hasMixedAsOfDates: false,
    });
    expect(operatingChecking?.reportedBalances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          summary: expect.objectContaining({
            balanceType: "statement_or_ledger",
            balanceAmount: "1200.00",
          }),
          lineageRef: {
            targetKind: "bank_account_summary",
            targetId: expect.any(String),
            syncRunId: synced.syncRun.id,
          },
        }),
        expect.objectContaining({
          summary: expect.objectContaining({
            balanceType: "available",
            balanceAmount: "1000.00",
          }),
          lineageRef: {
            targetKind: "bank_account_summary",
            targetId: expect.any(String),
            syncRunId: synced.syncRun.id,
          },
        }),
      ]),
    );
    expect(payrollReserve).toMatchObject({
      bankAccount: {
        accountLabel: "Payroll Reserve",
      },
      knownAsOfDates: [],
      unknownAsOfDateBalanceCount: 1,
    });
    expect(payrollReserve?.reportedBalances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          summary: expect.objectContaining({
            balanceType: "unspecified",
            balanceAmount: "250.00",
          }),
        }),
      ]),
    );
    expect(cashPosture).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "bank_account_summary_csv",
      },
      latestSuccessfulBankSummarySlice: {
        coverage: {
          bankAccountCount: 4,
          summaryRowCount: 5,
        },
      },
      freshness: {
        state: "fresh",
      },
      coverageSummary: {
        bankAccountCount: 4,
        reportedBalanceCount: 5,
        statementOrLedgerBalanceCount: 2,
        availableBalanceCount: 2,
        unspecifiedBalanceCount: 1,
        datedBalanceCount: 4,
        undatedBalanceCount: 1,
        currencyBucketCount: 2,
        mixedAsOfDateCurrencyBucketCount: 1,
      },
      currencyBuckets: [
        {
          currency: "EUR",
          statementOrLedgerBalanceTotal: "300.00",
          availableBalanceTotal: "0.00",
          unspecifiedBalanceTotal: "0.00",
          accountCount: 1,
          datedAccountCount: 1,
          undatedAccountCount: 0,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-09",
          latestAsOfDate: "2026-04-09",
        },
        {
          currency: "USD",
          statementOrLedgerBalanceTotal: "1200.00",
          availableBalanceTotal: "1400.00",
          unspecifiedBalanceTotal: "250.00",
          accountCount: 3,
          datedAccountCount: 2,
          undatedAccountCount: 1,
          mixedAsOfDates: true,
          earliestAsOfDate: "2026-04-10",
          latestAsOfDate: "2026-04-11",
        },
      ],
    });
    expect(cashPosture.diagnostics).toEqual(
      expect.arrayContaining([
        "One or more persisted bank-summary balances came from ambiguous generic balance fields and remain in the unspecified bucket.",
        "One or more persisted bank-summary balances do not include an explicit as-of date.",
        "One or more cash-posture currency buckets span multiple explicit as-of dates.",
        "One or more cash-posture currency buckets include both dated and undated bank balances.",
      ]),
    );
    expect(cashPosture.limitations).toEqual(
      expect.arrayContaining([
        "Cash posture is grouped by reported currency only; this route does not perform FX conversion or emit one company-wide cash total.",
        "Statement-or-ledger, available, and unspecified balances are kept in separate totals and are not merged into one unlabeled cash figure.",
      ]),
    );
  });

  it("syncs one uploaded receivables-aging CSV into persisted receivables and truthful collections-posture reads", async () => {
    const now = () => new Date("2026-04-12T12:00:00.000Z");
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
      name: "Receivables aging",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "receivables-aging-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd",
        storageKind: "external_url",
        storageRef: "https://example.com/receivables-aging",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "receivables-aging.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "customer_name,customer_id,currency,as_of,current,31_60,past_due,total",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
          "Alpha Co,C-100,USD,2026-04-30,100.00,20.00,20.00,120.00",
          "Beta Co,C-200,USD,,,,80.00,80.00",
          "Gamma Co,C-300,EUR,2026-04-29,50.00,,,50.00",
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
    const receivablesAging =
      await financeTwinService.getReceivablesAging("acme");
    const collectionsPosture =
      await financeTwinService.getCollectionsPosture("acme");
    const alphaRow = receivablesAging.rows.find(
      (row) => row.customer.customerLabel === "Alpha Co",
    );
    const lineage = await financeTwinService.getLineageDrill({
      companyKey: "acme",
      targetKind: "receivables_aging_row",
      targetId: alphaRow?.receivablesAgingRow.id ?? "",
      syncRunId: synced.syncRun.id,
    });

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "receivables_aging_csv",
        status: "succeeded",
      },
    });
    expect(receivablesAging).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "receivables_aging_csv",
      },
      latestSuccessfulSlice: {
        coverage: {
          customerCount: 3,
          rowCount: 3,
          lineageCount: 6,
          lineageTargetCounts: {
            customerCount: 3,
            receivablesAgingRowCount: 3,
          },
        },
        summary: {
          customerCount: 3,
          rowCount: 3,
          datedRowCount: 2,
          undatedRowCount: 1,
          currencyCount: 2,
          reportedBucketKeys: ["current", "31_60", "past_due", "total"],
        },
      },
      freshness: {
        state: "fresh",
      },
      customerCount: 3,
    });
    expect(alphaRow).toMatchObject({
      customer: {
        customerLabel: "Alpha Co",
        externalCustomerId: "C-100",
      },
      receivablesAgingRow: {
        currencyCode: "USD",
        asOfDate: "2026-04-30",
        sourceLineNumbers: [2, 3],
      },
      reportedTotalAmount: "120.00",
      lineageRef: {
        targetKind: "receivables_aging_row",
        syncRunId: synced.syncRun.id,
      },
    });
    expect(collectionsPosture).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "receivables_aging_csv",
      },
      latestSuccessfulReceivablesAgingSlice: {
        coverage: {
          customerCount: 3,
          rowCount: 3,
        },
      },
      freshness: {
        state: "fresh",
      },
      coverageSummary: {
        customerCount: 3,
        rowCount: 3,
        currencyBucketCount: 2,
        datedRowCount: 2,
        undatedRowCount: 1,
        rowsWithExplicitTotalCount: 3,
        rowsWithCurrentBucketCount: 2,
        rowsWithComputablePastDueCount: 2,
        rowsWithPartialPastDueOnlyCount: 0,
      },
      currencyBuckets: [
        {
          currency: "EUR",
          totalReceivables: "50.00",
          currentBucketTotal: "50.00",
          pastDueBucketTotal: "0.00",
          customerCount: 1,
          datedCustomerCount: 1,
          undatedCustomerCount: 0,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-29",
          latestAsOfDate: "2026-04-29",
        },
        {
          currency: "USD",
          totalReceivables: "200.00",
          currentBucketTotal: "100.00",
          pastDueBucketTotal: "100.00",
          customerCount: 2,
          datedCustomerCount: 1,
          undatedCustomerCount: 1,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-30",
          latestAsOfDate: "2026-04-30",
        },
      ],
    });
    expect(collectionsPosture.diagnostics).toEqual(
      expect.arrayContaining([
        "One or more persisted receivables-aging rows do not include an explicit as-of date.",
        "One or more collections-posture currency buckets include both dated and undated customer aging rows.",
      ]),
    );
    expect(lineage).toMatchObject({
      target: {
        targetKind: "receivables_aging_row",
        targetId: alphaRow?.receivablesAgingRow.id,
        syncRunId: synced.syncRun.id,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "receivables_aging_csv",
            id: synced.syncRun.id,
          },
          sourceFile: {
            originalFileName: "receivables-aging.csv",
          },
        },
      ],
    });
  });

  it("syncs one uploaded payables-aging CSV into persisted payables and truthful payables-posture reads", async () => {
    const now = () => new Date("2026-04-12T12:00:00.000Z");
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
      name: "Payables aging",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "payables-aging-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "efefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef",
        storageKind: "external_url",
        storageRef: "https://example.com/payables-aging",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "payables-aging.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "vendor_name,vendor_id,currency,as_of,current,31_60,past_due,total",
          "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
          "Paper Supply Co,V-100,USD,2026-04-30,100.00,20.00,,120.00",
          "Cloud Hosting,V-200,USD,,,,80.00,80.00",
          "Office Lease,V-300,EUR,2026-04-29,50.00,,,50.00",
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
    const payablesAging = await financeTwinService.getPayablesAging("acme");
    const payablesPosture = await financeTwinService.getPayablesPosture("acme");
    const paperSupplyRow = payablesAging.rows.find(
      (row) => row.vendor.vendorLabel === "Paper Supply Co",
    );
    const lineage = await financeTwinService.getLineageDrill({
      companyKey: "acme",
      targetKind: "payables_aging_row",
      targetId: paperSupplyRow?.payablesAgingRow.id ?? "",
      syncRunId: synced.syncRun.id,
    });

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "payables_aging_csv",
        status: "succeeded",
      },
    });
    expect(payablesAging).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "payables_aging_csv",
      },
      latestSuccessfulSlice: {
        coverage: {
          vendorCount: 3,
          rowCount: 3,
          lineageCount: 6,
          lineageTargetCounts: {
            vendorCount: 3,
            payablesAgingRowCount: 3,
          },
        },
        summary: {
          vendorCount: 3,
          rowCount: 3,
          datedRowCount: 2,
          undatedRowCount: 1,
          currencyCount: 2,
          reportedBucketKeys: ["current", "31_60", "past_due", "total"],
        },
      },
      freshness: {
        state: "fresh",
      },
      vendorCount: 3,
    });
    expect(paperSupplyRow).toMatchObject({
      vendor: {
        vendorLabel: "Paper Supply Co",
        externalVendorId: "V-100",
      },
      payablesAgingRow: {
        currencyCode: "USD",
        asOfDate: "2026-04-30",
        sourceLineNumbers: [2, 3],
      },
      reportedTotalAmount: "120.00",
      lineageRef: {
        targetKind: "payables_aging_row",
        syncRunId: synced.syncRun.id,
      },
    });
    expect(payablesPosture).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestAttemptedSyncRun: {
        id: synced.syncRun.id,
        extractorKey: "payables_aging_csv",
      },
      latestSuccessfulPayablesAgingSlice: {
        coverage: {
          vendorCount: 3,
          rowCount: 3,
        },
      },
      freshness: {
        state: "fresh",
      },
      coverageSummary: {
        vendorCount: 3,
        rowCount: 3,
        currencyBucketCount: 2,
        datedRowCount: 2,
        undatedRowCount: 1,
        rowsWithExplicitTotalCount: 3,
        rowsWithCurrentBucketCount: 2,
        rowsWithComputablePastDueCount: 2,
        rowsWithPartialPastDueOnlyCount: 0,
      },
      currencyBuckets: [
        {
          currency: "EUR",
          totalPayables: "50.00",
          currentBucketTotal: "50.00",
          pastDueBucketTotal: "0.00",
          vendorCount: 1,
          datedVendorCount: 1,
          undatedVendorCount: 0,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-29",
          latestAsOfDate: "2026-04-29",
        },
        {
          currency: "USD",
          totalPayables: "200.00",
          currentBucketTotal: "100.00",
          pastDueBucketTotal: "100.00",
          vendorCount: 2,
          datedVendorCount: 1,
          undatedVendorCount: 1,
          mixedAsOfDates: false,
          earliestAsOfDate: "2026-04-30",
          latestAsOfDate: "2026-04-30",
        },
      ],
    });
    expect(payablesPosture.diagnostics).toEqual(
      expect.arrayContaining([
        "One or more persisted payables-aging rows do not include an explicit as-of date.",
        "One or more payables-posture currency buckets include both dated and undated vendor aging rows.",
        "The latest successful payables-aging slice mixes explicit past_due totals and detailed overdue bucket rows; exact bucket totals stay source-labeled while the convenience pastDueBucketTotal uses only non-overlapping row-level bases.",
      ]),
    );
    expect(payablesPosture.limitations).toEqual(
      expect.arrayContaining([
        "Payables posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide payables total.",
      ]),
    );
    expect(lineage).toMatchObject({
      target: {
        targetKind: "payables_aging_row",
        targetId: paperSupplyRow?.payablesAgingRow.id,
        syncRunId: synced.syncRun.id,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "payables_aging_csv",
            id: synced.syncRun.id,
          },
          sourceFile: {
            originalFileName: "payables-aging.csv",
          },
        },
      ],
    });
  });

  it("syncs one uploaded contract-metadata CSV into persisted contracts and truthful obligation-calendar reads", async () => {
    const now = () => new Date("2026-04-12T12:00:00.000Z");
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
      name: "Contract metadata",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "contract-metadata-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "abababababababababababababababababababababababababababababababab",
        storageKind: "external_url",
        storageRef: "https://example.com/contracts",
        ingestStatus: "registered",
      },
    });
    const registered = await sourceService.registerSourceFile(
      created.source.id,
      {
        originalFileName: "contract-metadata.csv",
        mediaType: "text/csv",
        createdBy: "finance-operator",
      },
      Buffer.from(
        [
          "contract_id,contract_name,counterparty,contract_type,status,renewal_date,notice_deadline,next_payment_date,payment_amount,amount,currency,as_of,end_date,auto_renew",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "C-100,Master Services Agreement,Acme Customer,msa,active,2026-11-01,2026-10-01,2026-05-15,500.00,12000.00,USD,2026-04-30,2026-12-31,true",
          "L-200,Office Lease,Landlord LLC,lease,active,,,2026-06-01,,24000.00,EUR,2026-04-29,2027-01-31,false",
          "S-300,Support Agreement,Service Partner,services,active,,,2026-05-20,250.00,3000.00,GBP,2026-04-28,,true",
          "NDA-1,NDA,Partner Co,confidentiality,draft,,,,,,GBP,,,",
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
    const contracts = await financeTwinService.getContracts("acme");
    const obligationCalendar =
      await financeTwinService.getObligationCalendar("acme");
    const msaContract = contracts.contracts.find(
      (row) => row.contract.externalContractId === "C-100",
    );
    const scheduledPayment = obligationCalendar.upcomingObligations.find(
      (row) =>
        row.contract.externalContractId === "L-200" &&
        row.obligationType === "scheduled_payment",
    );
    const lineage = await financeTwinService.getLineageDrill({
      companyKey: "acme",
      targetKind: "contract_obligation",
      targetId:
        obligationCalendar.upcomingObligations.find(
          (row) =>
            row.contract.externalContractId === "C-100" &&
            row.obligationType === "renewal",
        )?.lineageRef.targetId ?? "",
      syncRunId: synced.syncRun.id,
    });

    expect(synced).toMatchObject({
      syncRun: {
        extractorKey: "contract_metadata_csv",
        status: "succeeded",
      },
    });
    expect(contracts).toMatchObject({
      company: {
        companyKey: "acme",
        displayName: "Acme Holdings",
      },
      latestSuccessfulSlice: {
        coverage: {
          contractCount: 4,
          obligationCount: 7,
          lineageCount: 11,
          lineageTargetCounts: {
            contractCount: 4,
            contractObligationCount: 7,
          },
        },
        summary: {
          contractCount: 4,
          obligationCount: 7,
          datedContractCount: 3,
          undatedContractCount: 1,
          currencyCount: 3,
        },
      },
      freshness: {
        state: "fresh",
      },
      contractCount: 4,
    });
    expect(msaContract).toMatchObject({
      contract: {
        contractLabel: "Master Services Agreement",
        externalContractId: "C-100",
        knownAsOfDates: ["2026-04-30"],
        sourceLineNumbers: [2, 3],
        amount: "12000.00",
        paymentAmount: "500.00",
        autoRenew: true,
      },
      explicitObligationCount: 4,
      lineageRef: {
        targetKind: "contract",
        syncRunId: synced.syncRun.id,
      },
    });
    expect(obligationCalendar).toMatchObject({
      company: {
        companyKey: "acme",
      },
      latestSuccessfulContractMetadataSlice: {
        coverage: {
          contractCount: 4,
          obligationCount: 7,
        },
      },
      freshness: {
        state: "fresh",
      },
      coverageSummary: {
        contractCount: 4,
        obligationCount: 7,
        currencyBucketCount: 3,
        obligationsWithExplicitAmountCount: 2,
        obligationsWithoutExplicitAmountCount: 5,
      },
      currencyBuckets: [
        {
          currency: null,
          obligationCount: 5,
          obligationsWithExplicitAmountCount: 0,
          obligationsWithoutExplicitAmountCount: 5,
        },
        {
          currency: "GBP",
          obligationCount: 1,
          obligationsWithExplicitAmountCount: 1,
          obligationsWithoutExplicitAmountCount: 0,
          explicitAmountTotal: "250.00",
        },
        {
          currency: "USD",
          obligationCount: 1,
          obligationsWithExplicitAmountCount: 1,
          obligationsWithoutExplicitAmountCount: 0,
          explicitAmountTotal: "500.00",
        },
      ],
    });
    expect(scheduledPayment).toMatchObject({
      contract: {
        externalContractId: "L-200",
      },
      obligationType: "scheduled_payment",
      amount: null,
      currency: null,
      sourceField: "next_payment_date",
    });
    expect(obligationCalendar.diagnostics).toEqual(
      expect.arrayContaining([
        "One or more persisted contracts do not include an explicit observation date.",
        "One or more explicit contract obligations do not include an explicit amount.",
        "One or more contracts report a generic amount alongside next_payment_date, so the obligation calendar leaves that scheduled-payment amount null unless payment_amount is explicit.",
        "One or more persisted contracts include a generic end_date field that remains labeled as end_date rather than being upgraded into expiration semantics.",
      ]),
    );
    expect(lineage).toMatchObject({
      target: {
        targetKind: "contract_obligation",
        syncRunId: synced.syncRun.id,
      },
      recordCount: 1,
      records: [
        {
          syncRun: {
            extractorKey: "contract_metadata_csv",
            id: synced.syncRun.id,
          },
          sourceFile: {
            originalFileName: "contract-metadata.csv",
          },
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

    await financeTwinService.syncCompanySourceFile(
      "acme",
      chartFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
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
    expect(snapshot.latestSuccessfulSlices.trialBalance.coverage).toMatchObject(
      {
        lineCount: 3,
        lineageCount: 7,
        lineageTargetCounts: {
          reportingPeriodCount: 1,
          ledgerAccountCount: 3,
          trialBalanceLineCount: 3,
        },
      },
    );
    expect(
      snapshot.latestSuccessfulSlices.chartOfAccounts.coverage,
    ).toMatchObject({
      accountCatalogEntryCount: 3,
      lineageCount: 6,
      lineageTargetCounts: {
        ledgerAccountCount: 3,
        accountCatalogEntryCount: 3,
      },
    });
    expect(
      snapshot.latestSuccessfulSlices.generalLedger.coverage,
    ).toMatchObject({
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

    await financeTwinService.syncCompanySourceFile(
      "acme",
      chartFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
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
    expect(snapshot.diagnostics).toContain(
      snapshot.sliceAlignment.reasonSummary,
    );
    expect(snapshot.limitations).not.toContain(
      snapshot.sliceAlignment.reasonSummary,
    );
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
    expect(
      snapshot.latestSuccessfulSlices.generalLedger.periodContext,
    ).toMatchObject({
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
    expect(reconciliation.diagnostics).toContain(
      "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
    );
    expect(reconciliation.limitations).not.toContain(
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

  it("builds matched-period account-bridge readiness with chart diagnostics and no fake numeric bridge", async () => {
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
      name: "March close package with matched-period bridge inputs",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-close-package-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "f333333333333333333333333333333333333333333333333333333333333333",
        storageKind: "external_url",
        storageRef: "https://example.com/march-close-package-bridge",
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
          "3000,Archived Clearing,liability,current_liability,,false,Legacy clearing account",
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
          "2000,Accounts Payable,2026-03-01,2026-03-31,0.00,90.00,USD,liability",
          "4000,Deferred Revenue,2026-03-01,2026-03-31,0.00,30.00,USD,liability",
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
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,3000,Archived Clearing,liability,0.00,50.00,USD,Customer receipt",
          "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,5000,Product Revenue,income,0.00,70.00,USD,Customer receipt",
        ].join("\n"),
      ),
    );

    await financeTwinService.syncCompanySourceFile(
      "acme",
      chartFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
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

    const accountBridge =
      await financeTwinService.getAccountBridgeReadiness("acme");
    const balanceBridgePrerequisites =
      await financeTwinService.getBalanceBridgePrerequisites("acme");
    const archivedClearingRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "3000",
    );
    const deferredRevenueRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "4000",
    );
    const productRevenueRow = accountBridge.accounts.find(
      (account) => account.ledgerAccount.accountCode === "5000",
    );

    expect(accountBridge.bridgeReadiness).toMatchObject({
      state: "matched_period_ready",
      reasonCode: "account_bridge_matched_period_ready",
      basis: "source_declared_period",
      windowRelation: "exact_match",
      sameSource: true,
      sameSourceSnapshot: false,
      sameSyncRun: false,
      sharedSourceId: created.source.id,
    });
    expect(accountBridge.coverageSummary).toMatchObject({
      accountRowCount: 5,
      presentInChartOfAccountsCount: 3,
      presentInTrialBalanceCount: 3,
      presentInGeneralLedgerCount: 3,
      overlapCount: 1,
      trialBalanceOnlyCount: 2,
      generalLedgerOnlyCount: 2,
      missingFromChartOfAccountsCount: 2,
      inactiveWithGeneralLedgerActivityCount: 1,
    });
    expect(accountBridge.limitations).toContain(
      "This route does not compute a direct account balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
    );
    expect(accountBridge.diagnostics).toContain(
      "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
    );
    expect(accountBridge.limitations).not.toContain(
      "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
    );
    expect(balanceBridgePrerequisites.balanceBridgePrerequisites).toMatchObject(
      {
        state: "not_prereq_ready",
        reasonCode: "balance_bridge_missing_balance_proof",
        basis: "source_declared_period",
        windowRelation: "exact_match",
        sameSource: true,
        sameSourceSnapshot: false,
        sameSyncRun: false,
        sharedSourceId: created.source.id,
        prerequisites: {
          hasSuccessfulTrialBalanceSlice: true,
          hasSuccessfulGeneralLedgerSlice: true,
          matchedPeriodAccountBridgeReady: true,
          anySourceBackedGeneralLedgerBalanceProof: false,
        },
      },
    );
    expect(balanceBridgePrerequisites.diagnostics).toContain(
      "The latest successful trial-balance and general-ledger slices share one registered source, but span different uploaded file snapshots and sync runs. Under the current per-file upload flow, sameSourceSnapshot and sameSyncRun are diagnostic fields rather than expected positive comparison signals.",
    );
    expect(balanceBridgePrerequisites.limitations).toContain(
      "This route does not compute a direct balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals, and general-ledger activity totals do not prove opening or ending balances.",
    );
    expect(balanceBridgePrerequisites.limitations).toContain(
      "Matched-period account overlap exists, but none of those accounts include source-backed general-ledger opening-balance or ending-balance proof in the persisted Finance Twin state, so this route stops at blocked prerequisites rather than inventing a balance bridge.",
    );
    expect(archivedClearingRow).toMatchObject({
      presentInChartOfAccounts: true,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      generalLedgerOnly: true,
      inactiveWithGeneralLedgerActivity: true,
      activityLineageRef: {
        ledgerAccountId: archivedClearingRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });
    expect(deferredRevenueRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: true,
      presentInGeneralLedger: false,
      trialBalanceOnly: true,
      missingFromChartOfAccounts: true,
    });
    expect(productRevenueRow).toMatchObject({
      presentInChartOfAccounts: false,
      presentInTrialBalance: false,
      presentInGeneralLedger: true,
      generalLedgerOnly: true,
      missingFromChartOfAccounts: true,
      activityLineageRef: {
        ledgerAccountId: productRevenueRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
    });
    expect(
      balanceBridgePrerequisites.accounts.find(
        (account) => account.ledgerAccount.accountCode === "1000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: true,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_balance_proof",
      generalLedgerBalanceProof: {
        proofBasis: "activity_only_no_balance_proof",
        openingBalanceEvidencePresent: false,
        endingBalanceEvidencePresent: false,
      },
      balanceProofLineageRef: null,
    });
    expect(
      balanceBridgePrerequisites.accounts.find(
        (account) => account.ledgerAccount.accountCode === "4000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: false,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_general_ledger_overlap",
    });
    expect(
      balanceBridgePrerequisites.accounts.find(
        (account) => account.ledgerAccount.accountCode === "5000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: false,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_trial_balance_overlap",
    });

    const cashRow = balanceBridgePrerequisites.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );
    const cashBalanceProof =
      await financeTwinService.getGeneralLedgerAccountBalanceProof({
        companyKey: "acme",
        ledgerAccountId: cashRow?.ledgerAccount.id ?? "",
        syncRunId: generalLedgerSync.syncRun.id,
      });

    expect(cashBalanceProof).toMatchObject({
      target: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
        syncRunId: generalLedgerSync.syncRun.id,
      },
      proof: null,
      lineage: null,
      limitations: expect.arrayContaining([
        "The latest successful general-ledger slice only provides activity totals for this account; it does not expose source-backed opening-balance or ending-balance proof.",
      ]),
    });
  });

  it("lights up source-backed balance proof only when explicit opening or ending balance fields exist", async () => {
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
      name: "March close package with explicit balance proof",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-close-package-link.txt",
        mediaType: "text/plain",
        sizeBytes: 18,
        checksumSha256:
          "f343333333333333333333333333333333333333333333333333333333333333",
        storageKind: "external_url",
        storageRef: "https://example.com/march-close-package-balance-proof",
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
    await financeTwinService.syncCompanySourceFile(
      "acme",
      chartFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    await financeTwinService.syncCompanySourceFile(
      "acme",
      trialBalanceFile.sourceFile.id,
      {},
    );
    await financeTwinService.syncCompanySourceFile(
      "acme",
      (
        await sourceService.registerSourceFile(
          created.source.id,
          {
            originalFileName: "general-ledger.csv",
            mediaType: "text/csv",
            createdBy: "finance-operator",
          },
          Buffer.from(
            [
              "journal_id,transaction_date,period_start,period_end,period_key,account_code,account_name,account_type,debit,credit,opening_balance,closing_balance,currency_code,memo",
              "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,1000,Cash,asset,120.00,0.00,30.00,150.00,USD,Customer receipt",
              "J-100,2026-03-15,2026-03-01,2026-03-31,2026-03,5000,Product Revenue,income,0.00,120.00,,,USD,Customer receipt",
            ].join("\n"),
          ),
        )
      ).sourceFile.id,
      {},
    );

    const balanceBridgePrerequisites =
      await financeTwinService.getBalanceBridgePrerequisites("acme");

    expect(balanceBridgePrerequisites.balanceBridgePrerequisites).toMatchObject(
      {
        state: "source_backed_balance_prereq_ready",
        reasonCode: "balance_bridge_source_backed_prereq_ready",
        basis: "source_declared_period",
        windowRelation: "exact_match",
        prerequisites: {
          hasSuccessfulTrialBalanceSlice: true,
          hasSuccessfulGeneralLedgerSlice: true,
          matchedPeriodAccountBridgeReady: true,
          anySourceBackedGeneralLedgerBalanceProof: true,
        },
      },
    );
    expect(balanceBridgePrerequisites.coverageSummary).toMatchObject({
      matchedPeriodAccountBridgeReadyCount: 1,
      accountsWithOpeningBalanceProofCount: 1,
      accountsWithEndingBalanceProofCount: 1,
      accountsBlockedByMissingOverlapCount: 2,
      accountsBlockedByMissingBalanceProofCount: 0,
      prereqReadyAccountCount: 1,
    });
    expect(balanceBridgePrerequisites.limitations).toContain(
      "This route does not compute a direct balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals, and general-ledger activity totals do not prove opening or ending balances.",
    );
    expect(balanceBridgePrerequisites.limitations).not.toContain(
      "Matched-period account overlap exists, but none of those accounts include source-backed general-ledger opening-balance or ending-balance proof in the persisted Finance Twin state, so this route stops at blocked prerequisites rather than inventing a balance bridge.",
    );
    expect(
      balanceBridgePrerequisites.accounts.find(
        (account) => account.ledgerAccount.accountCode === "1000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: true,
      balanceBridgePrereqReady: true,
      blockedReasonCode: null,
      generalLedgerBalanceProof: {
        proofBasis: "source_backed_balance_field",
        openingBalanceAmount: "30.00",
        endingBalanceAmount: "150.00",
        openingBalanceEvidencePresent: true,
        endingBalanceEvidencePresent: true,
        openingBalanceSourceColumn: "opening_balance",
        openingBalanceLineNumber: 2,
        endingBalanceSourceColumn: "closing_balance",
        endingBalanceLineNumber: 2,
        reasonCode: "source_backed_opening_and_ending_balance_proof",
      },
      balanceProofLineageRef: {
        targetKind: "general_ledger_balance_proof",
        targetId: expect.any(String),
      },
    });
    expect(
      balanceBridgePrerequisites.accounts.find(
        (account) => account.ledgerAccount.accountCode === "2000",
      ),
    ).toMatchObject({
      matchedPeriodAccountBridgeReady: false,
      balanceBridgePrereqReady: false,
      blockedReasonCode: "balance_bridge_missing_general_ledger_overlap",
    });

    const cashRow = balanceBridgePrerequisites.accounts.find(
      (account) => account.ledgerAccount.accountCode === "1000",
    );
    const cashBalanceProof =
      await financeTwinService.getGeneralLedgerAccountBalanceProof({
        companyKey: "acme",
        ledgerAccountId: cashRow?.ledgerAccount.id ?? "",
      });

    expect(cashBalanceProof).toMatchObject({
      target: {
        ledgerAccountId: cashRow?.ledgerAccount.id,
      },
      proof: {
        record: {
          ledgerAccountId: cashRow?.ledgerAccount.id,
          openingBalanceAmount: "30.00",
          endingBalanceAmount: "150.00",
          openingBalanceSourceColumn: "opening_balance",
          endingBalanceSourceColumn: "closing_balance",
        },
        balanceProof: {
          proofBasis: "source_backed_balance_field",
          proofSource:
            "Opening balance came from the explicit opening_balance column on row 2. Ending balance came from the explicit closing_balance column on row 2.",
          reasonCode: "source_backed_opening_and_ending_balance_proof",
        },
      },
      lineage: {
        target: cashRow?.balanceProofLineageRef,
        recordCount: 1,
        records: [
          {
            syncRun: {
              extractorKey: "general_ledger_csv",
            },
            sourceFile: {
              originalFileName: "general-ledger.csv",
            },
          },
        ],
      },
    });
    expect(cashBalanceProof.proof?.lineageRef).toEqual(
      cashRow?.balanceProofLineageRef,
    );
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

    await financeTwinService.syncCompanySourceFile(
      "acme",
      firstFile.sourceFile.id,
      {
        companyName: "Acme Holdings",
      },
    );
    await financeTwinService.syncCompanySourceFile(
      "acme",
      secondFile.sourceFile.id,
      {},
    );

    await expect(
      financeTwinService.getCompanySummary("acme"),
    ).resolves.toMatchObject({
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
      financeTwinService.syncCompanySourceFile(
        "acme",
        registered.sourceFile.id,
        {},
      ),
    ).rejects.toBeInstanceOf(FinanceTwinUnsupportedSourceError);
    await expect(
      financeTwinService.getCompanySummary("acme"),
    ).rejects.toBeInstanceOf(FinanceCompanyNotFoundError);
  });
});
