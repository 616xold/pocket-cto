import type {
  FinancePayablesAgingBucketClass,
  FinancePayablesAgingBucketKey,
} from "@pocket-cto/domain";
import { describe, expect, it } from "vitest";
import { buildFinancePayablesPostureView } from "./payables-posture";
import type { FinancePayablesAgingRowView } from "./repository";

describe("payables posture", () => {
  it("summarizes per-currency payables truthfully across mixed dates and mixed bucket semantics", () => {
    const view = buildFinancePayablesPostureView({
      company: {
        id: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        displayName: "Acme Holdings",
        createdAt: "2026-04-12T00:00:00.000Z",
        updatedAt: "2026-04-12T00:00:00.000Z",
      },
      freshness: {
        state: "fresh",
        latestSyncRunId: "77777777-7777-4777-8777-777777777777",
        latestSyncStatus: "succeeded",
        latestCompletedAt: "2026-04-12T09:00:00.000Z",
        latestSuccessfulSyncRunId: "77777777-7777-4777-8777-777777777777",
        latestSuccessfulCompletedAt: "2026-04-12T09:00:00.000Z",
        ageSeconds: 60,
        staleAfterSeconds: 86400,
        reasonCode: "latest_successful_sync_fresh",
        reasonSummary:
          "The latest successful payables-aging sync is within the 24 hour freshness window.",
      },
      latestAttemptedSyncRun: {
        id: "77777777-7777-4777-8777-777777777777",
        companyId: "11111111-1111-4111-8111-111111111111",
        reportingPeriodId: null,
        sourceId: "22222222-2222-4222-8222-222222222222",
        sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
        sourceFileId: "44444444-4444-4444-8444-444444444444",
        extractorKey: "payables_aging_csv",
        status: "succeeded",
        startedAt: "2026-04-12T08:59:00.000Z",
        completedAt: "2026-04-12T09:00:00.000Z",
        stats: {
          reportedBucketKeys: ["current", "31_60", "over_90", "past_due", "total"],
        },
        errorSummary: null,
        createdAt: "2026-04-12T08:59:00.000Z",
      },
      latestSuccessfulPayablesAgingSlice: {
        latestSource: null,
        latestSyncRun: null,
        coverage: {
          vendorCount: 0,
          rowCount: 0,
          lineageCount: 0,
          lineageTargetCounts: {
            reportingPeriodCount: 0,
            ledgerAccountCount: 0,
            bankAccountCount: 0,
            bankAccountSummaryCount: 0,
            customerCount: 0,
            vendorCount: 0,
            receivablesAgingRowCount: 0,
            payablesAgingRowCount: 0,
            contractCount: 0,
            contractObligationCount: 0,
            trialBalanceLineCount: 0,
            accountCatalogEntryCount: 0,
            journalEntryCount: 0,
            journalLineCount: 0,
            generalLedgerBalanceProofCount: 0,
          },
        },
        summary: null,
      },
      limitations: ["Base finance-twin limitations."],
      rows: [
        buildRow({
          rowId: "aaaaaaa1-1111-4111-8111-111111111111",
          vendorId: "v1111111-1111-4111-8111-111111111111",
          vendorLabel: "Paper Supply Co",
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          bucketValues: [
            ["current", "current", "100.00"],
            ["31_60", "past_due_detail", "20.00"],
            ["total", "total", "120.00"],
          ],
        }),
        buildRow({
          rowId: "aaaaaaa2-1111-4111-8111-111111111111",
          vendorId: "v2222222-1111-4111-8111-111111111111",
          vendorLabel: "Cloud Hosting",
          currencyCode: "USD",
          asOfDate: null,
          bucketValues: [
            ["past_due", "past_due_total", "80.00"],
            ["total", "total", "80.00"],
          ],
        }),
        buildRow({
          rowId: "aaaaaaa3-1111-4111-8111-111111111111",
          vendorId: "v3333333-1111-4111-8111-111111111111",
          vendorLabel: "Payroll Processor",
          currencyCode: "USD",
          asOfDate: "2026-05-01",
          bucketValues: [["over_90", "past_due_partial_rollup", "15.00"]],
        }),
        buildRow({
          rowId: "aaaaaaa4-1111-4111-8111-111111111111",
          vendorId: "v4444444-1111-4111-8111-111111111111",
          vendorLabel: "Freight Partner",
          currencyCode: "USD",
          asOfDate: "2026-04-28",
          bucketValues: [
            ["current", "current", "10.00"],
            ["31_60", "past_due_detail", "5.00"],
            ["past_due", "past_due_total", "7.00"],
            ["total", "total", "17.00"],
          ],
        }),
        buildRow({
          rowId: "aaaaaaa5-1111-4111-8111-111111111111",
          vendorId: "v5555555-1111-4111-8111-111111111111",
          vendorLabel: "Office Lease",
          currencyCode: "EUR",
          asOfDate: "2026-04-29",
          bucketValues: [
            ["current", "current", "50.00"],
            ["past_due", "past_due_total", "10.00"],
            ["total", "total", "60.00"],
          ],
        }),
      ],
    });

    expect(view.coverageSummary).toMatchObject({
      vendorCount: 5,
      rowCount: 5,
      currencyBucketCount: 2,
      datedRowCount: 4,
      undatedRowCount: 1,
      rowsWithExplicitTotalCount: 4,
      rowsWithCurrentBucketCount: 3,
      rowsWithComputablePastDueCount: 3,
      rowsWithPartialPastDueOnlyCount: 1,
    });
    expect(view.currencyBuckets).toEqual([
      {
        currency: "EUR",
        totalPayables: "60.00",
        currentBucketTotal: "50.00",
        pastDueBucketTotal: "10.00",
        exactBucketTotals: [
          {
            bucketKey: "current",
            bucketClass: "current",
            totalAmount: "50.00",
          },
          {
            bucketKey: "past_due",
            bucketClass: "past_due_total",
            totalAmount: "10.00",
          },
          {
            bucketKey: "total",
            bucketClass: "total",
            totalAmount: "60.00",
          },
        ],
        vendorCount: 1,
        datedVendorCount: 1,
        undatedVendorCount: 0,
        mixedAsOfDates: false,
        earliestAsOfDate: "2026-04-29",
        latestAsOfDate: "2026-04-29",
      },
      {
        currency: "USD",
        totalPayables: "217.00",
        currentBucketTotal: "110.00",
        pastDueBucketTotal: "100.00",
        exactBucketTotals: [
          {
            bucketKey: "current",
            bucketClass: "current",
            totalAmount: "110.00",
          },
          {
            bucketKey: "31_60",
            bucketClass: "past_due_detail",
            totalAmount: "25.00",
          },
          {
            bucketKey: "over_90",
            bucketClass: "past_due_partial_rollup",
            totalAmount: "15.00",
          },
          {
            bucketKey: "past_due",
            bucketClass: "past_due_total",
            totalAmount: "87.00",
          },
          {
            bucketKey: "total",
            bucketClass: "total",
            totalAmount: "217.00",
          },
        ],
        vendorCount: 4,
        datedVendorCount: 3,
        undatedVendorCount: 1,
        mixedAsOfDates: true,
        earliestAsOfDate: "2026-04-28",
        latestAsOfDate: "2026-05-01",
      },
    ]);
    expect(view.diagnostics).toEqual(
      expect.arrayContaining([
        "One or more persisted payables-aging rows do not include an explicit as-of date.",
        "One or more payables-posture currency buckets span multiple explicit as-of dates.",
        "One or more payables-posture currency buckets include both dated and undated vendor aging rows.",
        "One or more persisted payables-aging rows only expose partial past-due rollups such as over_90 or over_120, so those rows are excluded from the convenience pastDueBucketTotal.",
        "One or more persisted payables-aging rows report both explicit past_due totals and detailed overdue buckets that disagree, so those rows are excluded from the convenience pastDueBucketTotal.",
        "The latest successful payables-aging slice mixes explicit past_due totals and detailed overdue bucket rows; exact bucket totals stay source-labeled while the convenience pastDueBucketTotal uses only non-overlapping row-level bases.",
        "One or more persisted payables-aging rows do not expose a full total payables basis, so the convenience totalPayables field remains partial to rows with explicit totals or explicit current-plus-past-due coverage.",
      ]),
    );
    expect(view.limitations).toEqual(
      expect.arrayContaining([
        "Payables posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide payables total.",
        "This route does not include bill-level detail, expected payment timing, DPO, reserve logic, or accrual logic.",
      ]),
    );
  });
});

function buildRow(input: {
  asOfDate: string | null;
  bucketValues: Array<
    [FinancePayablesAgingBucketKey, FinancePayablesAgingBucketClass, string]
  >;
  currencyCode: string | null;
  rowId: string;
  vendorId: string;
  vendorLabel: string;
}): FinancePayablesAgingRowView {
  return {
    vendor: {
      id: input.vendorId,
      companyId: "11111111-1111-4111-8111-111111111111",
      vendorLabel: input.vendorLabel,
      externalVendorId: null,
      createdAt: "2026-04-12T00:00:00.000Z",
      updatedAt: "2026-04-12T00:00:00.000Z",
    },
    payablesAgingRow: {
      id: input.rowId,
      companyId: "11111111-1111-4111-8111-111111111111",
      vendorId: input.vendorId,
      syncRunId: "77777777-7777-4777-8777-777777777777",
      lineNumber: 2,
      sourceLineNumbers: [2],
      currencyCode: input.currencyCode,
      asOfDate: input.asOfDate,
      asOfDateSourceColumn: input.asOfDate === null ? null : "as_of",
      bucketValues: input.bucketValues.map(([bucketKey, bucketClass, amount]) => ({
        bucketKey,
        bucketClass,
        amount,
        sourceColumn: bucketKey,
      })),
      observedAt: "2026-04-12T09:00:00.000Z",
      createdAt: "2026-04-12T09:00:00.000Z",
      updatedAt: "2026-04-12T09:00:00.000Z",
    },
  };
}
