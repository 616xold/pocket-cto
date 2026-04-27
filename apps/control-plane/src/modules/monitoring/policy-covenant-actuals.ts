import type {
  FinanceCollectionsPostureCurrencyBucket,
  FinanceCollectionsPostureView,
  FinancePayablesPostureCurrencyBucket,
  FinancePayablesPostureView,
  MonitorAlertCondition,
} from "@pocket-cto/domain";
import {
  MonitorAlertConditionSchema,
  MonitorComparableActualLineageRefSchema,
} from "@pocket-cto/domain";
import type {
  ComparableActualResult,
  SupportedMetricKey,
} from "./policy-covenant-types";

export function readComparableActual(input: {
  collectionsPosture: FinanceCollectionsPostureView | null;
  metricKey: SupportedMetricKey;
  payablesPosture: FinancePayablesPostureView | null;
}): ComparableActualResult {
  if (input.metricKey === "collections_past_due_share") {
    return readCollectionsPastDueShare(input.collectionsPosture);
  }

  return readPayablesPastDueShare(input.payablesPosture);
}

function readCollectionsPastDueShare(
  posture: FinanceCollectionsPostureView | null,
): ComparableActualResult {
  if (!posture) {
    return coverageGapActual(
      "collections_past_due_share",
      "No stored collections posture is available for an explicit comparable actual value.",
    );
  }

  if (posture.freshness.state !== "fresh") {
    return coverageGapActual(
      "collections_past_due_share",
      `Collections posture freshness is ${posture.freshness.state}, so F6E will not compare it to a policy threshold.`,
    );
  }

  const unsafeDiagnostic = findUnsafePastDueDiagnostic(posture.diagnostics);
  if (unsafeDiagnostic) {
    return dataQualityGapActual(
      "collections_past_due_share",
      unsafeDiagnostic,
    );
  }

  if (posture.currencyBuckets.length !== 1) {
    return dataQualityGapActual(
      "collections_past_due_share",
      "Collections posture does not have exactly one currency bucket, and F6E does not aggregate cross-currency threshold actuals.",
    );
  }

  if (
    posture.coverageSummary.rowCount === 0 ||
    posture.coverageSummary.rowsWithComputablePastDueCount !==
      posture.coverageSummary.rowCount ||
    posture.coverageSummary.rowsWithPartialPastDueOnlyCount > 0
  ) {
    return coverageGapActual(
      "collections_past_due_share",
      "Collections posture does not have full source-backed past-due coverage for a comparable threshold actual.",
    );
  }

  const bucket = posture.currencyBuckets[0]!;
  const total = parseAmountCents(bucket.totalReceivables);
  const pastDue = parseAmountCents(bucket.pastDueBucketTotal);

  if (
    total <= 0n ||
    !hasComputableCollectionsPastDueBasis(bucket) ||
    !hasComputableCollectionsTotalBasis(bucket)
  ) {
    return coverageGapActual(
      "collections_past_due_share",
      "Collections posture lacks a positive full source-backed denominator or past-due numerator.",
    );
  }

  const source = posture.latestSuccessfulReceivablesAgingSlice.latestSource;
  const syncRun = posture.latestSuccessfulReceivablesAgingSlice.latestSyncRun;

  if (!source || !syncRun) {
    return coverageGapActual(
      "collections_past_due_share",
      "Collections posture lacks latest successful source lineage for a comparable actual.",
    );
  }

  const actualValue = toPercentNumber(pastDue, total);
  const coverage = posture.latestSuccessfulReceivablesAgingSlice.coverage;

  return {
    actual: {
      value: actualValue,
      lineageRef: MonitorComparableActualLineageRefSchema.parse({
        lineageKind: "finance_twin_actual",
        metricKey: "collections_past_due_share",
        actualValue,
        unit: "percent",
        ...source,
        targetKind: "receivables_aging_row",
        targetId: null,
        lineageCount: coverage.lineageCount,
        lineageTargetCounts: coverage.lineageTargetCounts,
        freshnessState: posture.freshness.state,
        basisSummary:
          "collections_past_due_share was computed from one source-backed receivables-aging currency bucket.",
        limitations: sanitizeActualLimitations(posture.limitations),
        summary:
          "Comparable actual collections_past_due_share from stored Finance Twin collections posture.",
      }),
    },
    condition: null,
  };
}

function readPayablesPastDueShare(
  posture: FinancePayablesPostureView | null,
): ComparableActualResult {
  if (!posture) {
    return coverageGapActual(
      "payables_past_due_share",
      "No stored payables posture is available for an explicit comparable actual value.",
    );
  }

  if (posture.freshness.state !== "fresh") {
    return coverageGapActual(
      "payables_past_due_share",
      `Payables posture freshness is ${posture.freshness.state}, so F6E will not compare it to a policy threshold.`,
    );
  }

  const unsafeDiagnostic = findUnsafePastDueDiagnostic(posture.diagnostics);
  if (unsafeDiagnostic) {
    return dataQualityGapActual("payables_past_due_share", unsafeDiagnostic);
  }

  if (posture.currencyBuckets.length !== 1) {
    return dataQualityGapActual(
      "payables_past_due_share",
      "Payables posture does not have exactly one currency bucket, and F6E does not aggregate cross-currency threshold actuals.",
    );
  }

  if (
    posture.coverageSummary.rowCount === 0 ||
    posture.coverageSummary.rowsWithComputablePastDueCount !==
      posture.coverageSummary.rowCount ||
    posture.coverageSummary.rowsWithPartialPastDueOnlyCount > 0
  ) {
    return coverageGapActual(
      "payables_past_due_share",
      "Payables posture does not have full source-backed past-due coverage for a comparable threshold actual.",
    );
  }

  const bucket = posture.currencyBuckets[0]!;
  const total = parseAmountCents(bucket.totalPayables);
  const pastDue = parseAmountCents(bucket.pastDueBucketTotal);

  if (
    total <= 0n ||
    !hasComputablePayablesPastDueBasis(bucket) ||
    !hasComputablePayablesTotalBasis(bucket)
  ) {
    return coverageGapActual(
      "payables_past_due_share",
      "Payables posture lacks a positive full source-backed denominator or past-due numerator.",
    );
  }

  const source = posture.latestSuccessfulPayablesAgingSlice.latestSource;
  const syncRun = posture.latestSuccessfulPayablesAgingSlice.latestSyncRun;

  if (!source || !syncRun) {
    return coverageGapActual(
      "payables_past_due_share",
      "Payables posture lacks latest successful source lineage for a comparable actual.",
    );
  }

  const actualValue = toPercentNumber(pastDue, total);
  const coverage = posture.latestSuccessfulPayablesAgingSlice.coverage;

  return {
    actual: {
      value: actualValue,
      lineageRef: MonitorComparableActualLineageRefSchema.parse({
        lineageKind: "finance_twin_actual",
        metricKey: "payables_past_due_share",
        actualValue,
        unit: "percent",
        ...source,
        targetKind: "payables_aging_row",
        targetId: null,
        lineageCount: coverage.lineageCount,
        lineageTargetCounts: coverage.lineageTargetCounts,
        freshnessState: posture.freshness.state,
        basisSummary:
          "payables_past_due_share was computed from one source-backed payables-aging currency bucket.",
        limitations: sanitizeActualLimitations(posture.limitations),
        summary:
          "Comparable actual payables_past_due_share from stored Finance Twin payables posture.",
      }),
    },
    condition: null,
  };
}

function coverageGapActual(
  metricKey: SupportedMetricKey,
  summary: string,
): ComparableActualResult {
  return {
    actual: null,
    condition: parseCondition({
      kind: "coverage_gap",
      severity: "warning",
      summary,
      evidencePath: `financeTwin.${metricKey}`,
    }),
  };
}

function dataQualityGapActual(
  metricKey: SupportedMetricKey,
  summary: string,
): ComparableActualResult {
  return {
    actual: null,
    condition: parseCondition({
      kind: "data_quality_gap",
      severity: "warning",
      summary,
      evidencePath: `financeTwin.${metricKey}`,
    }),
  };
}

function hasComputableCollectionsPastDueBasis(
  bucket: FinanceCollectionsPostureCurrencyBucket,
) {
  const pastDueBucketTotal = parseAmountCents(bucket.pastDueBucketTotal);
  const explicitPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_total")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);
  const detailedPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_detail")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);

  return (
    pastDueBucketTotal >= 0n &&
    (explicitPastDueTotal === pastDueBucketTotal ||
      detailedPastDueTotal === pastDueBucketTotal)
  );
}

function hasComputableCollectionsTotalBasis(
  bucket: FinanceCollectionsPostureCurrencyBucket,
) {
  const totalReceivables = parseAmountCents(bucket.totalReceivables);
  const explicitTotal = bucket.exactBucketTotals.find(
    (entry) => entry.bucketClass === "total",
  );

  if (
    explicitTotal &&
    parseAmountCents(explicitTotal.totalAmount) === totalReceivables
  ) {
    return true;
  }

  return (
    parseAmountCents(bucket.currentBucketTotal) +
      parseAmountCents(bucket.pastDueBucketTotal) ===
    totalReceivables
  );
}

function hasComputablePayablesPastDueBasis(
  bucket: FinancePayablesPostureCurrencyBucket,
) {
  const pastDueBucketTotal = parseAmountCents(bucket.pastDueBucketTotal);
  const explicitPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_total")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);
  const detailedPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_detail")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);

  return (
    pastDueBucketTotal >= 0n &&
    (explicitPastDueTotal === pastDueBucketTotal ||
      detailedPastDueTotal === pastDueBucketTotal)
  );
}

function hasComputablePayablesTotalBasis(
  bucket: FinancePayablesPostureCurrencyBucket,
) {
  const totalPayables = parseAmountCents(bucket.totalPayables);
  const explicitTotal = bucket.exactBucketTotals.find(
    (entry) => entry.bucketClass === "total",
  );

  if (
    explicitTotal &&
    parseAmountCents(explicitTotal.totalAmount) === totalPayables
  ) {
    return true;
  }

  return (
    parseAmountCents(bucket.currentBucketTotal) +
      parseAmountCents(bucket.pastDueBucketTotal) ===
    totalPayables
  );
}

const UNSAFE_PAST_DUE_SHARE_DIAGNOSTIC_PATTERNS = [
  "report both explicit past_due totals and detailed overdue buckets that disagree",
  "mixes explicit past_due totals and detailed overdue bucket rows",
  "only expose partial past-due rollups",
  "do not expose a full total",
  "do not include an explicit as-of date",
  "span multiple explicit as-of dates",
  "include both dated and undated",
] as const;

function findUnsafePastDueDiagnostic(diagnostics: string[]) {
  return diagnostics.find((diagnostic) => {
    const lower = diagnostic.toLowerCase();
    return UNSAFE_PAST_DUE_SHARE_DIAGNOSTIC_PATTERNS.some((pattern) =>
      lower.includes(pattern),
    );
  });
}

function parseAmountCents(value: string) {
  const sign = value.startsWith("-") ? -1n : 1n;
  const normalized = value.replace(/^-/, "");
  const [whole = "0", fraction = "00"] = normalized.split(".");

  return (
    sign * (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2)))
  );
}

function toPercentNumber(numerator: bigint, denominator: bigint) {
  return Number((numerator * 10000n) / denominator) / 100;
}

function sanitizeActualLimitations(limitations: string[]) {
  return limitations.filter(
    (limitation) =>
      limitation !==
      "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
  );
}

function parseCondition(input: MonitorAlertCondition) {
  return MonitorAlertConditionSchema.parse(input);
}
