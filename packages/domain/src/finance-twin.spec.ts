import { describe, expect, it } from "vitest";
import {
  FinanceAccountCatalogViewSchema,
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

  it("parses a company summary with explicit company totals and per-slice snapshots", () => {
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
        extractorKey: "chart_of_accounts_csv",
        status: "succeeded",
        startedAt: "2026-04-09T00:10:00.000Z",
        completedAt: "2026-04-09T00:10:03.000Z",
        stats: {
          accountCatalogEntryCount: 2,
        },
        errorSummary: null,
        createdAt: "2026-04-09T00:10:00.000Z",
      },
      latestSuccessfulSyncRun: {
        id: "55555555-5555-4555-8555-555555555555",
        companyId: "11111111-1111-4111-8111-111111111111",
        reportingPeriodId: null,
        sourceId: "22222222-2222-4222-8222-222222222222",
        sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
        sourceFileId: "44444444-4444-4444-8444-444444444444",
        extractorKey: "chart_of_accounts_csv",
        status: "succeeded",
        startedAt: "2026-04-09T00:10:00.000Z",
        completedAt: "2026-04-09T00:10:03.000Z",
        stats: {
          accountCatalogEntryCount: 2,
        },
        errorSummary: null,
        createdAt: "2026-04-09T00:10:00.000Z",
      },
      freshness: {
        overall: {
          state: "missing",
          latestSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-09T00:10:03.000Z",
          latestSuccessfulSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSuccessfulCompletedAt: "2026-04-09T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "implemented_slice_missing",
          reasonSummary: "At least one implemented finance slice has not completed a successful sync yet.",
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
          reasonSummary: "No finance twin sync has been recorded yet for the trial-balance slice.",
        },
        chartOfAccounts: {
          state: "fresh",
          latestSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSyncStatus: "succeeded",
          latestCompletedAt: "2026-04-09T00:10:03.000Z",
          latestSuccessfulSyncRunId: "55555555-5555-4555-8555-555555555555",
          latestSuccessfulCompletedAt: "2026-04-09T00:10:03.000Z",
          ageSeconds: 1,
          staleAfterSeconds: 86400,
          reasonCode: "latest_successful_sync_fresh",
          reasonSummary: "The latest successful chart-of-accounts sync is within the 24 hour freshness window.",
        },
      },
      companyTotals: {
        reportingPeriodCount: 1,
        ledgerAccountCount: 2,
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
            extractorKey: "chart_of_accounts_csv",
            status: "succeeded",
            startedAt: "2026-04-09T00:10:00.000Z",
            completedAt: "2026-04-09T00:10:03.000Z",
            stats: {
              accountCatalogEntryCount: 2,
            },
            errorSummary: null,
            createdAt: "2026-04-09T00:10:00.000Z",
          },
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
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.freshness.chartOfAccounts.state).toBe("fresh");
    expect(parsed.latestSuccessfulSlices.chartOfAccounts.coverage.accountCatalogEntryCount).toBe(2);
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
        reasonSummary: "No finance twin sync has been recorded yet for the chart-of-accounts slice.",
      },
      accounts: [],
      limitations: ["Only deterministic CSV extraction is implemented."],
    });

    expect(parsed.accounts).toHaveLength(0);
  });
});
