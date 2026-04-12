import {
  FinanceCollectionsPostureViewSchema,
  type FinanceCollectionsPostureCurrencyBucket,
  type FinanceCollectionsPostureExactBucketTotal,
  type FinanceCollectionsPostureView,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulReceivablesAgingSlice,
  type FinanceReceivablesAgingBucketKey,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import {
  compareReceivablesAgingBucketKeys,
  isReceivablesAgingDetailBucketKey,
  isReceivablesAgingPartialRollupBucketKey,
} from "./receivables-aging-buckets";
import { formatMoney, parseMoney } from "./summary";
import type { FinanceReceivablesAgingRowView } from "./repository";

type RowAnalysis = {
  currentAmount: bigint | null;
  exactBucketTotals: FinanceCollectionsPostureExactBucketTotal[];
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

export function buildFinanceCollectionsPostureView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulReceivablesAgingSlice: FinanceLatestSuccessfulReceivablesAgingSlice;
  limitations: string[];
  rows: FinanceReceivablesAgingRowView[];
}): FinanceCollectionsPostureView {
  const analyses = input.rows.map((row) => ({
    analysis: analyzeRow(row),
    row,
  }));
  const currencyBuckets = buildCurrencyBuckets(analyses);
  const diagnostics = buildDiagnostics(analyses, currencyBuckets);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulReceivablesAgingSlice.latestSyncRun === null) {
    limitations.push(
      "No successful receivables-aging slice exists yet for this company.",
    );
  }

  limitations.push(
    "Collections posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide receivables total.",
  );
  limitations.push(
    "Convenience totalReceivables and pastDueBucketTotal fields only use explicit non-overlapping totals that are present in the persisted receivables-aging slice; rows without a full source-backed basis are left out rather than guessed.",
  );
  limitations.push(
    "Exact aging bucket labels are preserved from the source-backed extractor and are not silently normalized into one universal aging scheme.",
  );
  limitations.push(
    "This route does not include invoice-level detail, expected collection timing, DSO, reserve logic, or bad-debt forecasting.",
  );

  return FinanceCollectionsPostureViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulReceivablesAgingSlice:
      input.latestSuccessfulReceivablesAgingSlice,
    freshness: input.freshness,
    currencyBuckets,
    coverageSummary: {
      customerCount: new Set(input.rows.map((row) => row.customer.id)).size,
      rowCount: input.rows.length,
      currencyBucketCount: currencyBuckets.length,
      datedRowCount: input.rows.filter(
        (row) => row.receivablesAgingRow.asOfDate !== null,
      ).length,
      undatedRowCount: input.rows.filter(
        (row) => row.receivablesAgingRow.asOfDate === null,
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
  rows: Array<{ analysis: RowAnalysis; row: FinanceReceivablesAgingRowView }>,
): FinanceCollectionsPostureCurrencyBucket[] {
  const buckets = new Map<
    string,
    {
      currentBucketTotal: bigint;
      currency: string | null;
      customerDateState: Map<string, { hasDated: boolean; hasUndated: boolean }>;
      customerIds: Set<string>;
      exactBucketTotals: Map<
        FinanceReceivablesAgingBucketKey,
        { bucketClass: FinanceCollectionsPostureExactBucketTotal["bucketClass"]; totalAmount: bigint }
      >;
      explicitDates: Set<string>;
      pastDueBucketTotal: bigint;
      totalReceivables: bigint;
    }
  >();

  for (const entry of rows) {
    const currencyKey = entry.row.receivablesAgingRow.currencyCode ?? "__unknown__";
    const bucket =
      buckets.get(currencyKey) ?? {
        currentBucketTotal: 0n,
        currency: entry.row.receivablesAgingRow.currencyCode,
        customerDateState: new Map<
          string,
          { hasDated: boolean; hasUndated: boolean }
        >(),
        customerIds: new Set<string>(),
        exactBucketTotals: new Map(),
        explicitDates: new Set<string>(),
        pastDueBucketTotal: 0n,
        totalReceivables: 0n,
      };

    bucket.customerIds.add(entry.row.customer.id);
    const customerDateState = bucket.customerDateState.get(entry.row.customer.id) ?? {
      hasDated: false,
      hasUndated: false,
    };

    if (entry.row.receivablesAgingRow.asOfDate) {
      customerDateState.hasDated = true;
      bucket.explicitDates.add(entry.row.receivablesAgingRow.asOfDate);
    } else {
      customerDateState.hasUndated = true;
    }
    bucket.customerDateState.set(entry.row.customer.id, customerDateState);

    if (entry.analysis.currentAmount !== null) {
      bucket.currentBucketTotal += entry.analysis.currentAmount;
    }

    if (entry.analysis.pastDueAmount !== null) {
      bucket.pastDueBucketTotal += entry.analysis.pastDueAmount;
    }

    if (entry.analysis.totalAmount !== null) {
      bucket.totalReceivables += entry.analysis.totalAmount;
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
        .sort((left, right) => compareReceivablesAgingBucketKeys(left[0], right[0]))
        .map(([bucketKey, value]) => ({
          bucketKey,
          bucketClass: value.bucketClass,
          totalAmount: formatMoney(value.totalAmount),
        }));
      const datedCustomerCount = Array.from(bucket.customerDateState.values()).filter(
        (state) => state.hasDated,
      ).length;
      const undatedCustomerCount = Array.from(
        bucket.customerDateState.values(),
      ).filter((state) => !state.hasDated && state.hasUndated).length;

      return {
        currency: bucket.currency,
        totalReceivables: formatMoney(bucket.totalReceivables),
        currentBucketTotal: formatMoney(bucket.currentBucketTotal),
        pastDueBucketTotal: formatMoney(bucket.pastDueBucketTotal),
        exactBucketTotals,
        customerCount: bucket.customerIds.size,
        datedCustomerCount,
        undatedCustomerCount,
        mixedAsOfDates: bucket.explicitDates.size > 1,
        earliestAsOfDate: explicitDates[0] ?? null,
        latestAsOfDate: explicitDates[explicitDates.length - 1] ?? null,
      } satisfies FinanceCollectionsPostureCurrencyBucket;
    });
}

function buildDiagnostics(
  rows: Array<{ analysis: RowAnalysis; row: FinanceReceivablesAgingRowView }>,
  currencyBuckets: FinanceCollectionsPostureCurrencyBucket[],
) {
  const diagnostics: string[] = [];
  const pastDueBases = new Set(rows.map(({ analysis }) => analysis.pastDueBasis));

  if (rows.some(({ row }) => row.receivablesAgingRow.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted receivables-aging rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (rows.some(({ row }) => row.receivablesAgingRow.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted receivables-aging rows do not include an explicit as-of date.",
    );
  }

  if (currencyBuckets.some((bucket) => bucket.mixedAsOfDates)) {
    diagnostics.push(
      "One or more collections-posture currency buckets span multiple explicit as-of dates.",
    );
  }

  if (
    currencyBuckets.some(
      (bucket) => bucket.datedCustomerCount > 0 && bucket.undatedCustomerCount > 0,
    )
  ) {
    diagnostics.push(
      "One or more collections-posture currency buckets include both dated and undated customer aging rows.",
    );
  }

  if (pastDueBases.has("partial_only")) {
    diagnostics.push(
      "One or more persisted receivables-aging rows only expose partial past-due rollups such as over_90 or over_120, so those rows are excluded from the convenience pastDueBucketTotal.",
    );
  }

  if (pastDueBases.has("total_detail_conflict")) {
    diagnostics.push(
      "One or more persisted receivables-aging rows report both explicit past_due totals and detailed overdue buckets that disagree, so those rows are excluded from the convenience pastDueBucketTotal.",
    );
  }

  if (pastDueBases.has("explicit_past_due") && pastDueBases.has("detail_buckets")) {
    diagnostics.push(
      "The latest successful receivables-aging slice mixes explicit past_due totals and detailed overdue bucket rows; exact bucket totals stay source-labeled while the convenience pastDueBucketTotal uses only non-overlapping row-level bases.",
    );
  }

  if (rows.some(({ analysis }) => analysis.totalBasis === "none")) {
    diagnostics.push(
      "One or more persisted receivables-aging rows do not expose a full total receivables basis, so the convenience totalReceivables field remains partial to rows with explicit totals or explicit current-plus-past-due coverage.",
    );
  }

  return dedupeMessages(diagnostics);
}

function analyzeRow(row: FinanceReceivablesAgingRowView): RowAnalysis {
  const exactBucketTotals: FinanceCollectionsPostureExactBucketTotal[] =
    row.receivablesAgingRow.bucketValues.map((bucketValue) => ({
      bucketKey: bucketValue.bucketKey,
      bucketClass: bucketValue.bucketClass,
      totalAmount: bucketValue.amount,
    }));
  const currentAmount = readBucketAmount(row, "current");
  const explicitPastDueAmount = readBucketAmount(row, "past_due");
  const detailAmounts = row.receivablesAgingRow.bucketValues.filter((bucketValue) =>
    isReceivablesAgingDetailBucketKey(bucketValue.bucketKey),
  );
  const detailPastDueAmount =
    detailAmounts.length > 0
      ? detailAmounts.reduce((total, bucketValue) => {
          return total + parseMoney(bucketValue.amount);
        }, 0n)
      : null;
  const partialRollupPresent = row.receivablesAgingRow.bucketValues.some((bucketValue) =>
    isReceivablesAgingPartialRollupBucketKey(bucketValue.bucketKey),
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
  row: FinanceReceivablesAgingRowView,
  bucketKey: FinanceCollectionsPostureExactBucketTotal["bucketKey"],
) {
  const bucketValue = row.receivablesAgingRow.bucketValues.find(
    (entry) => entry.bucketKey === bucketKey,
  );

  return bucketValue ? parseMoney(bucketValue.amount) : null;
}
