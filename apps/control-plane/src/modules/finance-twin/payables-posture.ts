import {
  FinancePayablesPostureViewSchema,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulPayablesAgingSlice,
  type FinancePayablesAgingBucketKey,
  type FinancePayablesPostureCurrencyBucket,
  type FinancePayablesPostureExactBucketTotal,
  type FinancePayablesPostureView,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import {
  comparePayablesAgingBucketKeys,
  isPayablesAgingDetailBucketKey,
  isPayablesAgingPartialRollupBucketKey,
} from "./payables-aging-buckets";
import { formatMoney, parseMoney } from "./summary";
import type { FinancePayablesAgingRowView } from "./repository";

type RowAnalysis = {
  currentAmount: bigint | null;
  exactBucketTotals: FinancePayablesPostureExactBucketTotal[];
  pastDueAmount: bigint | null;
  pastDueBasis:
    | "detail_buckets"
    | "explicit_past_due"
    | "none"
    | "partial_only"
    | "total_detail_conflict";
  totalAmount: bigint | null;
  totalBasis: "explicit_total" | "current_plus_past_due" | "none";
};

export function buildFinancePayablesPostureView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulPayablesAgingSlice: FinanceLatestSuccessfulPayablesAgingSlice;
  limitations: string[];
  rows: FinancePayablesAgingRowView[];
}): FinancePayablesPostureView {
  const analyses = input.rows.map((row) => ({
    analysis: analyzeRow(row),
    row,
  }));
  const currencyBuckets = buildCurrencyBuckets(analyses);
  const diagnostics = buildDiagnostics(analyses, currencyBuckets);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulPayablesAgingSlice.latestSyncRun === null) {
    limitations.push(
      "No successful payables-aging slice exists yet for this company.",
    );
  }

  limitations.push(
    "Payables posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide payables total.",
  );
  limitations.push(
    "Convenience totalPayables and pastDueBucketTotal fields only use explicit non-overlapping totals that are present in the persisted payables-aging slice; rows without a full source-backed basis are left out rather than guessed.",
  );
  limitations.push(
    "Exact aging bucket labels are preserved from the source-backed extractor and are not silently normalized into one universal aging scheme.",
  );
  limitations.push(
    "This route does not include bill-level detail, expected payment timing, DPO, reserve logic, or accrual logic.",
  );

  return FinancePayablesPostureViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulPayablesAgingSlice: input.latestSuccessfulPayablesAgingSlice,
    freshness: input.freshness,
    currencyBuckets,
    coverageSummary: {
      vendorCount: new Set(input.rows.map((row) => row.vendor.id)).size,
      rowCount: input.rows.length,
      currencyBucketCount: currencyBuckets.length,
      datedRowCount: input.rows.filter(
        (row) => row.payablesAgingRow.asOfDate !== null,
      ).length,
      undatedRowCount: input.rows.filter(
        (row) => row.payablesAgingRow.asOfDate === null,
      ).length,
      rowsWithExplicitTotalCount: analyses.filter(
        ({ analysis }) => analysis.totalBasis === "explicit_total",
      ).length,
      rowsWithCurrentBucketCount: analyses.filter(
        ({ analysis }) => analysis.currentAmount !== null,
      ).length,
      rowsWithComputablePastDueCount: analyses.filter(
        ({ analysis }) =>
          analysis.pastDueBasis === "explicit_past_due" ||
          analysis.pastDueBasis === "detail_buckets",
      ).length,
      rowsWithPartialPastDueOnlyCount: analyses.filter(
        ({ analysis }) => analysis.pastDueBasis === "partial_only",
      ).length,
    },
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildCurrencyBuckets(
  rows: Array<{ analysis: RowAnalysis; row: FinancePayablesAgingRowView }>,
): FinancePayablesPostureCurrencyBucket[] {
  const buckets = new Map<
    string,
    {
      currentBucketTotal: bigint;
      currency: string | null;
      explicitDates: Set<string>;
      exactBucketTotals: Map<
        FinancePayablesAgingBucketKey,
        {
          bucketClass: FinancePayablesPostureExactBucketTotal["bucketClass"];
          totalAmount: bigint;
        }
      >;
      pastDueBucketTotal: bigint;
      totalPayables: bigint;
      vendorDateState: Map<string, { hasDated: boolean; hasUndated: boolean }>;
      vendorIds: Set<string>;
    }
  >();

  for (const entry of rows) {
    const currencyKey = entry.row.payablesAgingRow.currencyCode ?? "__unknown__";
    const bucket =
      buckets.get(currencyKey) ?? {
        currentBucketTotal: 0n,
        currency: entry.row.payablesAgingRow.currencyCode,
        explicitDates: new Set<string>(),
        exactBucketTotals: new Map(),
        pastDueBucketTotal: 0n,
        totalPayables: 0n,
        vendorDateState: new Map<string, { hasDated: boolean; hasUndated: boolean }>(),
        vendorIds: new Set<string>(),
      };

    bucket.vendorIds.add(entry.row.vendor.id);
    const vendorDateState = bucket.vendorDateState.get(entry.row.vendor.id) ?? {
      hasDated: false,
      hasUndated: false,
    };

    if (entry.row.payablesAgingRow.asOfDate) {
      vendorDateState.hasDated = true;
      bucket.explicitDates.add(entry.row.payablesAgingRow.asOfDate);
    } else {
      vendorDateState.hasUndated = true;
    }
    bucket.vendorDateState.set(entry.row.vendor.id, vendorDateState);

    if (entry.analysis.currentAmount !== null) {
      bucket.currentBucketTotal += entry.analysis.currentAmount;
    }

    if (entry.analysis.pastDueAmount !== null) {
      bucket.pastDueBucketTotal += entry.analysis.pastDueAmount;
    }

    if (entry.analysis.totalAmount !== null) {
      bucket.totalPayables += entry.analysis.totalAmount;
    }

    for (const exactBucketTotal of entry.analysis.exactBucketTotals) {
      const existing = bucket.exactBucketTotals.get(exactBucketTotal.bucketKey) ?? {
        bucketClass: exactBucketTotal.bucketClass,
        totalAmount: 0n,
      };
      existing.totalAmount += parseMoney(exactBucketTotal.totalAmount);
      bucket.exactBucketTotals.set(exactBucketTotal.bucketKey, existing);
    }

    buckets.set(currencyKey, bucket);
  }

  return Array.from(buckets.values())
    .sort((left, right) => (left.currency ?? "").localeCompare(right.currency ?? ""))
    .map((bucket) => {
      const explicitDates = Array.from(bucket.explicitDates).sort();
      const exactBucketTotals = Array.from(bucket.exactBucketTotals.entries())
        .sort((left, right) => comparePayablesAgingBucketKeys(left[0], right[0]))
        .map(([bucketKey, value]) => ({
          bucketKey,
          bucketClass: value.bucketClass,
          totalAmount: formatMoney(value.totalAmount),
        }));
      const datedVendorCount = Array.from(bucket.vendorDateState.values()).filter(
        (state) => state.hasDated,
      ).length;
      const undatedVendorCount = Array.from(bucket.vendorDateState.values()).filter(
        (state) => !state.hasDated && state.hasUndated,
      ).length;

      return {
        currency: bucket.currency,
        totalPayables: formatMoney(bucket.totalPayables),
        currentBucketTotal: formatMoney(bucket.currentBucketTotal),
        pastDueBucketTotal: formatMoney(bucket.pastDueBucketTotal),
        exactBucketTotals,
        vendorCount: bucket.vendorIds.size,
        datedVendorCount,
        undatedVendorCount,
        mixedAsOfDates: bucket.explicitDates.size > 1,
        earliestAsOfDate: explicitDates[0] ?? null,
        latestAsOfDate: explicitDates[explicitDates.length - 1] ?? null,
      } satisfies FinancePayablesPostureCurrencyBucket;
    });
}

function buildDiagnostics(
  rows: Array<{ analysis: RowAnalysis; row: FinancePayablesAgingRowView }>,
  currencyBuckets: FinancePayablesPostureCurrencyBucket[],
) {
  const diagnostics: string[] = [];
  const pastDueBases = new Set(rows.map(({ analysis }) => analysis.pastDueBasis));

  if (rows.some(({ row }) => row.payablesAgingRow.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted payables-aging rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (rows.some(({ row }) => row.payablesAgingRow.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted payables-aging rows do not include an explicit as-of date.",
    );
  }

  if (currencyBuckets.some((bucket) => bucket.mixedAsOfDates)) {
    diagnostics.push(
      "One or more payables-posture currency buckets span multiple explicit as-of dates.",
    );
  }

  if (
    currencyBuckets.some(
      (bucket) => bucket.datedVendorCount > 0 && bucket.undatedVendorCount > 0,
    )
  ) {
    diagnostics.push(
      "One or more payables-posture currency buckets include both dated and undated vendor aging rows.",
    );
  }

  if (pastDueBases.has("partial_only")) {
    diagnostics.push(
      "One or more persisted payables-aging rows only expose partial past-due rollups such as over_90 or over_120, so those rows are excluded from the convenience pastDueBucketTotal.",
    );
  }

  if (pastDueBases.has("total_detail_conflict")) {
    diagnostics.push(
      "One or more persisted payables-aging rows report both explicit past_due totals and detailed overdue buckets that disagree, so those rows are excluded from the convenience pastDueBucketTotal.",
    );
  }

  if (pastDueBases.has("explicit_past_due") && pastDueBases.has("detail_buckets")) {
    diagnostics.push(
      "The latest successful payables-aging slice mixes explicit past_due totals and detailed overdue bucket rows; exact bucket totals stay source-labeled while the convenience pastDueBucketTotal uses only non-overlapping row-level bases.",
    );
  }

  if (rows.some(({ analysis }) => analysis.totalBasis === "none")) {
    diagnostics.push(
      "One or more persisted payables-aging rows do not expose a full total payables basis, so the convenience totalPayables field remains partial to rows with explicit totals or explicit current-plus-past-due coverage.",
    );
  }

  return dedupeMessages(diagnostics);
}

function analyzeRow(row: FinancePayablesAgingRowView): RowAnalysis {
  const exactBucketTotals: FinancePayablesPostureExactBucketTotal[] =
    row.payablesAgingRow.bucketValues.map((bucketValue) => ({
      bucketKey: bucketValue.bucketKey,
      bucketClass: bucketValue.bucketClass,
      totalAmount: bucketValue.amount,
    }));
  const currentAmount = readBucketAmount(row, "current");
  const explicitPastDueAmount = readBucketAmount(row, "past_due");
  const detailAmounts = row.payablesAgingRow.bucketValues.filter((bucketValue) =>
    isPayablesAgingDetailBucketKey(bucketValue.bucketKey),
  );
  const detailPastDueAmount =
    detailAmounts.length > 0
      ? detailAmounts.reduce((total, bucketValue) => {
          return total + parseMoney(bucketValue.amount);
        }, 0n)
      : null;
  const partialRollupPresent = row.payablesAgingRow.bucketValues.some((bucketValue) =>
    isPayablesAgingPartialRollupBucketKey(bucketValue.bucketKey),
  );
  const explicitTotalAmount = readBucketAmount(row, "total");
  const pastDueAmount =
    explicitPastDueAmount !== null
      ? detailPastDueAmount !== null && detailPastDueAmount !== explicitPastDueAmount
        ? null
        : explicitPastDueAmount
      : detailPastDueAmount;
  const pastDueBasis =
    explicitPastDueAmount !== null
      ? detailPastDueAmount !== null && detailPastDueAmount !== explicitPastDueAmount
        ? "total_detail_conflict"
        : "explicit_past_due"
      : detailPastDueAmount !== null
        ? "detail_buckets"
        : partialRollupPresent
          ? "partial_only"
          : "none";
  const totalAmount =
    explicitTotalAmount !== null
      ? explicitTotalAmount
      : currentAmount !== null && pastDueAmount !== null
        ? currentAmount + pastDueAmount
        : null;

  return {
    currentAmount,
    exactBucketTotals,
    pastDueAmount,
    pastDueBasis,
    totalAmount,
    totalBasis:
      explicitTotalAmount !== null
        ? "explicit_total"
        : currentAmount !== null && pastDueAmount !== null
          ? "current_plus_past_due"
          : "none",
  };
}

function readBucketAmount(
  row: FinancePayablesAgingRowView,
  bucketKey: FinancePayablesPostureExactBucketTotal["bucketKey"],
) {
  const bucketValue = row.payablesAgingRow.bucketValues.find(
    (entry) => entry.bucketKey === bucketKey,
  );

  return bucketValue ? parseMoney(bucketValue.amount) : null;
}
