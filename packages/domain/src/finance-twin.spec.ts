import { describe, expect, it } from "vitest";
import {
  FinanceAccountCatalogViewSchema,
  FinanceGeneralLedgerViewSchema,
  FinanceLineageDrillViewSchema,
  FinanceSnapshotViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
} from "./finance-twin";

describe("finance twin domain schemas", () => {
  it("parses sync input with an optional company name", () => {
    const parsed = FinanceTwinSyncInputSchema.parse({
      companyName: "Acme Holdings",
    });

    expect(parsed.companyName).toBe("Acme Holdings");
  });

  it("parses a company summary with explicit attempted and successful per-slice semantics", () => {
    const parsed = FinanceTwinCompanySummarySchema.parse({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
      latestAttemptedSyncRun: {
        id: "55555555-5555-4555-8555-555555555555",
        companyId: "11111111-1111-4111-8111-111111111111",
        reportingPeriodId: null,
        sourceId: "22222222-2222-4222-8222-222222222222",
        sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
        sourceFileId: "44444444-4444-4444-8444-444444444444",
        extractorKey: "general_ledger_csv",
        status: "succeeded",
        startedAt: "2026-04-11T00:10:00.000Z",
        completedAt: "2026-04-11T00:10:03.000Z",
        stats: {
          journalEntryCount: 2,
        },
        errorSummary: null,
        createdAt: "2026-04-11T00:10:00.000Z",
      },
      latestSuccessfulSyncRun: {
        id: "55555555-5555-4555-8555-555555555555",
        companyId: "11111111-1111-4111-8111-111111111111",
        reportingPeriodId: null,
        sourceId: "22222222-2222-4222-8222-222222222222",
        sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
        sourceFileId: "44444444-4444-4444-8444-444444444444",
        extractorKey: "general_ledger_csv",
        status: "succeeded",
        startedAt: "2026-04-11T00:10:00.000Z",
        completedAt: "2026-04-11T00:10:03.000Z",
        stats: {
          journalEntryCount: 2,
        },
        errorSummary: null,
        createdAt: "2026-04-11T00:10:00.000Z",
      },
      freshness: {
        overall: {
          state: "missing",
          latestSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:10:03.000Z",
          latestSuccessfulSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSuccessfulCompletedAt: "2026-04-11T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "implemented_slice_missing",
          reasonSummary:
            "At least one implemented finance slice has not completed a successful sync yet.",
        },
        trialBalance: {
          state: "missing",
          latestSyncRunId: null,
          latestSyncStatus: null,
          latestCompletedAt: null,
          latestSuccessfulSyncRunId: null,
          latestSuccessfulCompletedAt: null,
          ageSeconds: null,
          staleAfterSeconds: 86400,
          reasonCode: "not_synced",
          reasonSummary:
            "No finance twin sync has been recorded yet for the trial-balance slice.",
        },
        chartOfAccounts: {
          state: "missing",
          latestSyncRunId: null,
          latestSyncStatus: null,
          latestCompletedAt: null,
          latestSuccessfulSyncRunId: null,
          latestSuccessfulCompletedAt: null,
          ageSeconds: null,
          staleAfterSeconds: 86400,
          reasonCode: "not_synced",
          reasonSummary:
            "No finance twin sync has been recorded yet for the chart-of-accounts slice.",
        },
        generalLedger: {
          state: "fresh",
          latestSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:10:03.000Z",
          latestSuccessfulSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSuccessfulCompletedAt: "2026-04-11T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "latest_successful_sync_fresh",
          reasonSummary:
            "The latest successful general-ledger sync is within the 24 hour freshness window.",
        },
      },
      companyTotals: {
        reportingPeriodCount: 1,
        ledgerAccountCount: 2,
      },
      latestAttemptedSlices: {
        trialBalance: {
          latestSource: null,
          latestSyncRun: null,
        },
        chartOfAccounts: {
          latestSource: null,
          latestSyncRun: null,
        },
        generalLedger: {
          latestSource: {
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "44444444-4444-4444-8444-444444444444",
            syncRunId: "55555555-5555-4555-8555-555555555555",
          },
          latestSyncRun: {
            id: "55555555-5555-4555-8555-555555555555",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "44444444-4444-4444-8444-444444444444",
            extractorKey: "general_ledger_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:10:00.000Z",
            completedAt: "2026-04-11T00:10:03.000Z",
            stats: {
              journalEntryCount: 2,
            },
            errorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
          },
        },
      },
      latestSuccessfulSlices: {
        trialBalance: {
          latestSource: null,
          latestSyncRun: null,
          reportingPeriod: null,
          coverage: {
            lineCount: 0,
            lineageCount: 0,
          },
          summary: null,
        },
        chartOfAccounts: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            accountCatalogEntryCount: 0,
            lineageCount: 0,
          },
          summary: null,
        },
        generalLedger: {
          latestSource: {
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "44444444-4444-4444-8444-444444444444",
            syncRunId: "55555555-5555-4555-8555-555555555555",
          },
          latestSyncRun: {
            id: "55555555-5555-4555-8555-555555555555",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "44444444-4444-4444-8444-444444444444",
            extractorKey: "general_ledger_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:10:00.000Z",
            completedAt: "2026-04-11T00:10:03.000Z",
            stats: {
              journalEntryCount: 2,
            },
            errorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
          },
          coverage: {
            journalEntryCount: 2,
            journalLineCount: 4,
            lineageCount: 6,
          },
          summary: {
            journalEntryCount: 2,
            journalLineCount: 4,
            ledgerAccountCount: 2,
            totalDebitAmount: "100.00",
            totalCreditAmount: "100.00",
            earliestEntryDate: "2026-03-31",
            latestEntryDate: "2026-04-30",
            currencyCode: "USD",
          },
        },
      },
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.freshness.generalLedger.state).toBe("fresh");
    expect(parsed.latestAttemptedSlices.generalLedger.latestSyncRun?.extractorKey).toBe(
      "general_ledger_csv",
    );
  });

  it("parses an account catalog view", () => {
    const parsed = FinanceAccountCatalogViewSchema.parse({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
      latestAttemptedSyncRun: null,
      latestSuccessfulSlice: {
        latestSource: null,
        latestSyncRun: null,
        coverage: {
          accountCatalogEntryCount: 0,
          lineageCount: 0,
        },
        summary: null,
      },
      freshness: {
        state: "missing",
        latestSyncRunId: null,
        latestSyncStatus: null,
        latestCompletedAt: null,
        latestSuccessfulSyncRunId: null,
        latestSuccessfulCompletedAt: null,
        ageSeconds: null,
        staleAfterSeconds: 86400,
        reasonCode: "not_synced",
        reasonSummary:
          "No finance twin sync has been recorded yet for the chart-of-accounts slice.",
      },
      accounts: [],
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.accounts).toHaveLength(0);
  });

  it("parses a general-ledger latest-snapshot view", () => {
    const parsed = FinanceGeneralLedgerViewSchema.parse({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
      latestAttemptedSyncRun: null,
      latestSuccessfulSlice: {
        latestSource: null,
        latestSyncRun: null,
        coverage: {
          journalEntryCount: 0,
          journalLineCount: 0,
          lineageCount: 0,
        },
        summary: null,
      },
      freshness: {
        state: "missing",
        latestSyncRunId: null,
        latestSyncStatus: null,
        latestCompletedAt: null,
        latestSuccessfulSyncRunId: null,
        latestSuccessfulCompletedAt: null,
        ageSeconds: null,
        staleAfterSeconds: 86400,
        reasonCode: "not_synced",
        reasonSummary:
          "No finance twin sync has been recorded yet for the general-ledger slice.",
      },
      entries: [],
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.entries).toHaveLength(0);
  });

  it("parses a cross-slice finance snapshot view", () => {
    const parsed = FinanceSnapshotViewSchema.parse({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
      companyTotals: {
        reportingPeriodCount: 1,
        ledgerAccountCount: 3,
      },
      freshness: {
        overall: {
          state: "fresh",
          latestSyncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:10:03.000Z",
          latestSuccessfulSyncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          latestSuccessfulCompletedAt: "2026-04-11T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "implemented_slices_fresh",
          reasonSummary:
            "The implemented finance slices are within the 24 hour freshness window.",
        },
        trialBalance: {
          state: "fresh",
          latestSyncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:05:03.000Z",
          latestSuccessfulSyncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          latestSuccessfulCompletedAt: "2026-04-11T00:05:03.000Z",
          ageSeconds: 2,
          staleAfterSeconds: 86400,
          reasonCode: "latest_successful_sync_fresh",
          reasonSummary:
            "The latest successful trial-balance sync is within the 24 hour freshness window.",
        },
        chartOfAccounts: {
          state: "fresh",
          latestSyncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:00:03.000Z",
          latestSuccessfulSyncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          latestSuccessfulCompletedAt: "2026-04-11T00:00:03.000Z",
          ageSeconds: 3,
          staleAfterSeconds: 86400,
          reasonCode: "latest_successful_sync_fresh",
          reasonSummary:
            "The latest successful chart-of-accounts sync is within the 24 hour freshness window.",
        },
        generalLedger: {
          state: "fresh",
          latestSyncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-11T00:10:03.000Z",
          latestSuccessfulSyncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          latestSuccessfulCompletedAt: "2026-04-11T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "latest_successful_sync_fresh",
          reasonSummary:
            "The latest successful general-ledger sync is within the 24 hour freshness window.",
        },
      },
      latestAttemptedSlices: {
        trialBalance: {
          latestSource: {
            sourceId: "11111111-2222-4222-8222-222222222222",
            sourceSnapshotId: "11111111-3333-4333-8333-333333333333",
            sourceFileId: "11111111-4444-4444-8444-444444444444",
            syncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
          latestSyncRun: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: "12121212-1212-4121-8121-121212121212",
            sourceId: "11111111-2222-4222-8222-222222222222",
            sourceSnapshotId: "11111111-3333-4333-8333-333333333333",
            sourceFileId: "11111111-4444-4444-8444-444444444444",
            extractorKey: "trial_balance_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:05:00.000Z",
            completedAt: "2026-04-11T00:05:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:05:00.000Z",
          },
        },
        chartOfAccounts: {
          latestSource: {
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "22222222-3333-4333-8333-333333333333",
            sourceFileId: "22222222-4444-4444-8444-444444444444",
            syncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          },
          latestSyncRun: {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "22222222-3333-4333-8333-333333333333",
            sourceFileId: "22222222-4444-4444-8444-444444444444",
            extractorKey: "chart_of_accounts_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:00:00.000Z",
            completedAt: "2026-04-11T00:00:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:00:00.000Z",
          },
        },
        generalLedger: {
          latestSource: {
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            syncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          },
          latestSyncRun: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            extractorKey: "general_ledger_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:10:00.000Z",
            completedAt: "2026-04-11T00:10:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
          },
        },
      },
      latestSuccessfulSlices: {
        trialBalance: {
          latestSource: {
            sourceId: "11111111-2222-4222-8222-222222222222",
            sourceSnapshotId: "11111111-3333-4333-8333-333333333333",
            sourceFileId: "11111111-4444-4444-8444-444444444444",
            syncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
          latestSyncRun: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: "12121212-1212-4121-8121-121212121212",
            sourceId: "11111111-2222-4222-8222-222222222222",
            sourceSnapshotId: "11111111-3333-4333-8333-333333333333",
            sourceFileId: "11111111-4444-4444-8444-444444444444",
            extractorKey: "trial_balance_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:05:00.000Z",
            completedAt: "2026-04-11T00:05:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:05:00.000Z",
          },
          reportingPeriod: {
            id: "12121212-1212-4121-8121-121212121212",
            companyId: "11111111-1111-4111-8111-111111111111",
            periodKey: "2026-03-31",
            label: "Trial balance as of 2026-03-31",
            periodStart: null,
            periodEnd: "2026-03-31",
            createdAt: "2026-04-11T00:05:01.000Z",
            updatedAt: "2026-04-11T00:05:01.000Z",
          },
          coverage: {
            lineCount: 1,
            lineageCount: 3,
            lineageTargetCounts: {
              reportingPeriodCount: 1,
              ledgerAccountCount: 1,
              trialBalanceLineCount: 1,
            },
          },
          summary: {
            accountCount: 1,
            lineCount: 1,
            totalDebitAmount: "100.00",
            totalCreditAmount: "0.00",
            totalNetAmount: "100.00",
            currencyCode: "USD",
          },
        },
        chartOfAccounts: {
          latestSource: {
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "22222222-3333-4333-8333-333333333333",
            sourceFileId: "22222222-4444-4444-8444-444444444444",
            syncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          },
          latestSyncRun: {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "22222222-2222-4222-8222-222222222222",
            sourceSnapshotId: "22222222-3333-4333-8333-333333333333",
            sourceFileId: "22222222-4444-4444-8444-444444444444",
            extractorKey: "chart_of_accounts_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:00:00.000Z",
            completedAt: "2026-04-11T00:00:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:00:00.000Z",
          },
          coverage: {
            accountCatalogEntryCount: 1,
            lineageCount: 2,
            lineageTargetCounts: {
              ledgerAccountCount: 1,
              accountCatalogEntryCount: 1,
            },
          },
          summary: {
            accountCount: 1,
            activeAccountCount: 1,
            inactiveAccountCount: 0,
            parentLinkedCount: 0,
          },
        },
        generalLedger: {
          latestSource: {
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            syncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          },
          latestSyncRun: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            extractorKey: "general_ledger_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:10:00.000Z",
            completedAt: "2026-04-11T00:10:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
          },
          coverage: {
            journalEntryCount: 1,
            journalLineCount: 1,
            lineageCount: 3,
            lineageTargetCounts: {
              ledgerAccountCount: 1,
              journalEntryCount: 1,
              journalLineCount: 1,
            },
          },
          summary: {
            journalEntryCount: 1,
            journalLineCount: 1,
            ledgerAccountCount: 1,
            totalDebitAmount: "50.00",
            totalCreditAmount: "0.00",
            earliestEntryDate: "2026-04-11",
            latestEntryDate: "2026-04-11",
            currencyCode: "USD",
          },
        },
      },
      sliceAlignment: {
        state: "mixed",
        implementedSliceCount: 3,
        availableSliceCount: 3,
        distinctSyncRunCount: 3,
        distinctSourceSnapshotCount: 3,
        sameSyncRun: false,
        sameSourceSnapshot: false,
        sharedSyncRunId: null,
        sharedSourceSnapshotId: null,
        reasonCode: "mixed_source_snapshots",
        reasonSummary:
          "The latest successful finance slices are mixed across different source snapshots and sync runs.",
      },
      coverageSummary: {
        accountRowCount: 1,
        chartOfAccountsAccountCount: 1,
        trialBalanceAccountCount: 1,
        generalLedgerActiveAccountCount: 1,
        accountsPresentInAllImplementedSlicesCount: 1,
        missingFromChartOfAccountsCount: 0,
        missingFromTrialBalanceCount: 0,
        missingFromGeneralLedgerCount: 0,
        inactiveAccountCount: 0,
        inactiveWithGeneralLedgerActivityCount: 0,
      },
      accounts: [
        {
          ledgerAccount: {
            id: "12121212-3434-4343-8343-343434343434",
            companyId: "11111111-1111-4111-8111-111111111111",
            accountCode: "1000",
            accountName: "Cash",
            accountType: "asset",
            createdAt: "2026-04-11T00:00:01.000Z",
            updatedAt: "2026-04-11T00:10:01.000Z",
          },
          chartOfAccountsEntry: {
            id: "13131313-3434-4343-8343-343434343434",
            companyId: "11111111-1111-4111-8111-111111111111",
            ledgerAccountId: "12121212-3434-4343-8343-343434343434",
            syncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            lineNumber: 2,
            detailType: "current_asset",
            description: "Operating cash",
            parentAccountCode: null,
            isActive: true,
            observedAt: "2026-04-11T00:00:01.000Z",
            createdAt: "2026-04-11T00:00:01.000Z",
            updatedAt: "2026-04-11T00:00:01.000Z",
          },
          trialBalanceLine: {
            id: "14141414-3434-4343-8343-343434343434",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: "12121212-1212-4121-8121-121212121212",
            ledgerAccountId: "12121212-3434-4343-8343-343434343434",
            syncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            lineNumber: 2,
            debitAmount: "100.00",
            creditAmount: "0.00",
            netAmount: "100.00",
            currencyCode: "USD",
            observedAt: "2026-04-11T00:05:01.000Z",
            createdAt: "2026-04-11T00:05:01.000Z",
            updatedAt: "2026-04-11T00:05:01.000Z",
          },
          generalLedgerActivity: {
            journalEntryCount: 1,
            journalLineCount: 1,
            totalDebitAmount: "50.00",
            totalCreditAmount: "0.00",
            earliestEntryDate: "2026-04-11",
            latestEntryDate: "2026-04-11",
          },
          presentInChartOfAccounts: true,
          presentInTrialBalance: true,
          presentInGeneralLedger: true,
          missingFromChartOfAccounts: false,
          missingFromTrialBalance: false,
          missingFromGeneralLedger: false,
          inactiveWithGeneralLedgerActivity: false,
          lineageTargets: {
            ledgerAccount: {
              targetKind: "ledger_account",
              targetId: "12121212-3434-4343-8343-343434343434",
              syncRunId: null,
            },
            chartOfAccountsEntry: {
              targetKind: "account_catalog_entry",
              targetId: "13131313-3434-4343-8343-343434343434",
              syncRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            },
            trialBalanceLine: {
              targetKind: "trial_balance_line",
              targetId: "14141414-3434-4343-8343-343434343434",
              syncRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            },
            generalLedger: {
              targetKind: "ledger_account",
              targetId: "12121212-3434-4343-8343-343434343434",
              syncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            },
          },
        },
      ],
      limitations: [
        "F2D only covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV extraction, and additive finance snapshot read models.",
      ],
    });

    expect(parsed.accounts[0]?.generalLedgerActivity?.journalEntryCount).toBe(1);
  });

  it("parses a finance lineage drill view", () => {
    const parsed = FinanceLineageDrillViewSchema.parse({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
      target: {
        targetKind: "ledger_account",
        targetId: "12121212-3434-4343-8343-343434343434",
        syncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      },
      recordCount: 1,
      records: [
        {
          lineage: {
            id: "15151515-1515-4515-8515-151515151515",
            companyId: "11111111-1111-4111-8111-111111111111",
            syncRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            targetKind: "ledger_account",
            targetId: "12121212-3434-4343-8343-343434343434",
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            recordedAt: "2026-04-11T00:10:01.000Z",
            createdAt: "2026-04-11T00:10:01.000Z",
          },
          syncRun: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            companyId: "11111111-1111-4111-8111-111111111111",
            reportingPeriodId: null,
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            sourceFileId: "33333333-4444-4444-8444-444444444444",
            extractorKey: "general_ledger_csv",
            status: "succeeded",
            startedAt: "2026-04-11T00:10:00.000Z",
            completedAt: "2026-04-11T00:10:03.000Z",
            stats: {},
            errorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
          },
          source: {
            id: "33333333-2222-4222-8222-222222222222",
            kind: "dataset",
            originKind: "manual",
            name: "General ledger export",
            description: null,
            createdBy: "finance-operator",
            createdAt: "2026-04-11T00:00:00.000Z",
            updatedAt: "2026-04-11T00:00:00.000Z",
          },
          sourceSnapshot: {
            id: "33333333-3333-4333-8333-333333333333",
            sourceId: "33333333-2222-4222-8222-222222222222",
            version: 1,
            originalFileName: "general-ledger-link.txt",
            mediaType: "text/plain",
            sizeBytes: 18,
            checksumSha256:
              "3333333333333333333333333333333333333333333333333333333333333333",
            storageKind: "external_url",
            storageRef: "https://example.com/general-ledger",
            capturedAt: "2026-04-11T00:10:00.000Z",
            ingestStatus: "registered",
            ingestErrorSummary: null,
            createdAt: "2026-04-11T00:10:00.000Z",
            updatedAt: "2026-04-11T00:10:00.000Z",
          },
          sourceFile: {
            id: "33333333-4444-4444-8444-444444444444",
            sourceId: "33333333-2222-4222-8222-222222222222",
            sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
            originalFileName: "general-ledger.csv",
            mediaType: "text/csv",
            sizeBytes: 512,
            checksumSha256:
              "3333333333333333333333333333333333333333333333333333333333333333",
            storageKind: "object_store",
            storageRef: "s3://bucket/sources/general-ledger.csv",
            createdBy: "finance-operator",
            capturedAt: "2026-04-11T00:10:00.000Z",
            createdAt: "2026-04-11T00:10:00.000Z",
          },
        },
      ],
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.records[0]?.syncRun.extractorKey).toBe("general_ledger_csv");
  });
});
