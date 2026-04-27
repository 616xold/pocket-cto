import type {
  FinanceCollectionsPostureCurrencyBucket,
  FinanceCollectionsPostureView,
  MonitorAlertCondition,
  MonitorRuntimeBoundary,
  MonitorSourceFreshnessPosture,
  MonitorSourceLineageRef,
} from "@pocket-cto/domain";
import {
  MonitorAlertConditionSchema,
  MonitorRuntimeBoundarySchema,
  MonitorSourceFreshnessPostureSchema,
  MonitorSourceLineageRefSchema,
} from "@pocket-cto/domain";
import {
  buildProofBundlePosture,
  buildSeverityRationale,
  chooseHighestSeverity,
  COLLECTIONS_PRESSURE_COPY,
  formatSourceLineageSummary,
} from "./formatter";

export function evaluateCollectionsPressureMonitor(
  collectionsPosture: FinanceCollectionsPostureView,
) {
  const conditions = buildConditions(collectionsPosture);
  const severity = chooseHighestSeverity(conditions);
  const sourceFreshnessPosture =
    buildSourceFreshnessPosture(collectionsPosture);
  const sourceLineageRefs = buildSourceLineageRefs(collectionsPosture);
  const deterministicSeverityRationale = buildSeverityRationale({
    conditions,
    copy: COLLECTIONS_PRESSURE_COPY,
    severity,
  });
  const limitations = buildLimitations(collectionsPosture.limitations);
  const proofBundlePosture = buildProofBundlePosture(
    conditions,
    COLLECTIONS_PRESSURE_COPY,
  );
  const runtimeBoundary = buildRuntimeBoundary();
  const status = conditions.length > 0 ? "alert" : "no_alert";

  return {
    conditions,
    deterministicSeverityRationale,
    humanReviewNextStep: buildHumanReviewNextStep(status),
    limitations,
    proofBundlePosture,
    replayPosture: {
      state: "not_appended" as const,
      reason:
        "F6C monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary,
    severity,
    sourceFreshnessPosture,
    sourceLineageRefs,
    sourceLineageSummary: formatSourceLineageSummary(
      sourceLineageRefs.reduce((sum, ref) => sum + ref.lineageCount, 0),
      COLLECTIONS_PRESSURE_COPY,
    ),
    status,
  };
}

function buildConditions(
  collectionsPosture: FinanceCollectionsPostureView,
): MonitorAlertCondition[] {
  const conditions: MonitorAlertCondition[] = [];

  switch (collectionsPosture.freshness.state) {
    case "missing":
      conditions.push(
        parseCondition({
          kind: "missing_source",
          severity: "critical",
          summary: "No successful receivables-aging slice exists yet.",
          evidencePath: "freshness.state",
        }),
      );
      break;
    case "failed":
      conditions.push(
        parseCondition({
          kind: "failed_source",
          severity: "critical",
          summary:
            "The latest attempted receivables-aging sync failed before producing current collections-posture state.",
          evidencePath: "freshness.state",
        }),
      );
      break;
    case "stale":
      conditions.push(
        parseCondition({
          kind: "stale_source",
          severity: "warning",
          summary:
            "The latest successful receivables-aging slice is older than the freshness window.",
          evidencePath: "freshness.state",
        }),
      );
      break;
    case "fresh":
      break;
  }

  conditions.push(...buildCoverageConditions(collectionsPosture));

  for (const diagnostic of collectionsPosture.diagnostics) {
    conditions.push(
      parseCondition({
        kind: "data_quality_gap",
        severity: classifyDiagnosticSeverity(diagnostic),
        summary: diagnostic,
        evidencePath: "diagnostics",
      }),
    );
  }

  conditions.push(...buildOverdueConcentrationConditions(collectionsPosture));

  return conditions;
}

function buildCoverageConditions(
  collectionsPosture: FinanceCollectionsPostureView,
): MonitorAlertCondition[] {
  const coverage = collectionsPosture.coverageSummary;
  const conditions: MonitorAlertCondition[] = [];

  if (
    coverage.rowCount === 0 ||
    coverage.customerCount === 0 ||
    coverage.currencyBucketCount === 0
  ) {
    return [
      parseCondition({
        kind: "coverage_gap",
        severity: "critical",
        summary:
          "Collections posture has no receivables-aging rows, customers, or currency buckets from a stored receivables-aging slice.",
        evidencePath: "coverageSummary",
      }),
    ];
  }

  if (
    !collectionsPosture.currencyBuckets.some(
      (bucket) => parseAmountCents(bucket.totalReceivables) > 0n,
    )
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Collections posture has receivables-aging rows but no positive source-backed total receivables basis.",
        evidencePath: "currencyBuckets.totalReceivables",
      }),
    );
  }

  if (coverage.rowsWithComputablePastDueCount === 0) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Collections posture has no computable source-backed past-due basis.",
        evidencePath: "coverageSummary.rowsWithComputablePastDueCount",
      }),
    );
  } else if (
    coverage.rowsWithComputablePastDueCount < coverage.rowCount ||
    coverage.rowsWithPartialPastDueOnlyCount > 0
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Collections posture has only partial source-backed past-due coverage, so overdue concentration is limited.",
        evidencePath: "coverageSummary.rowsWithComputablePastDueCount",
      }),
    );
  }

  if (
    collectionsPosture.currencyBuckets.some(
      (bucket) =>
        bucket.customerCount > 0 && parseAmountCents(bucket.totalReceivables) <= 0n,
    )
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "One or more collections-posture currency buckets lack a computable total receivables denominator.",
        evidencePath: "currencyBuckets.totalReceivables",
      }),
    );
  }

  return conditions;
}

function buildOverdueConcentrationConditions(
  collectionsPosture: FinanceCollectionsPostureView,
): MonitorAlertCondition[] {
  return collectionsPosture.currencyBuckets.flatMap((bucket) => {
    if (!canComputePastDueShare(collectionsPosture, bucket)) {
      return [];
    }

    const totalReceivables = parseAmountCents(bucket.totalReceivables);
    const pastDueTotal = parseAmountCents(bucket.pastDueBucketTotal);
    const severity =
      pastDueTotal * 100n >= totalReceivables * 75n
        ? "critical"
        : pastDueTotal * 100n >= totalReceivables * 50n
          ? "warning"
          : null;

    if (!severity) {
      return [];
    }

    const currencyLabel = bucket.currency ?? "unknown currency";

    return [
      parseCondition({
        kind: "overdue_concentration",
        severity,
        summary: `${currencyLabel} receivables are ${formatShare(pastDueTotal, totalReceivables)} past due based on source-backed totals.`,
        evidencePath: `currencyBuckets[${currencyLabel}].pastDueShare`,
      }),
    ];
  });
}

function canComputePastDueShare(
  collectionsPosture: FinanceCollectionsPostureView,
  bucket: FinanceCollectionsPostureCurrencyBucket,
) {
  const coverage = collectionsPosture.coverageSummary;
  const totalReceivables = parseAmountCents(bucket.totalReceivables);

  if (hasUnsafePastDueShareDiagnostics(collectionsPosture.diagnostics)) {
    return false;
  }

  if (totalReceivables <= 0n) {
    return false;
  }

  if (
    coverage.rowsWithPartialPastDueOnlyCount > 0 ||
    coverage.rowsWithComputablePastDueCount !== coverage.rowCount
  ) {
    return false;
  }

  return hasComputablePastDueBasis(bucket) && hasComputableTotalBasis(bucket);
}

const UNSAFE_PAST_DUE_SHARE_DIAGNOSTIC_PATTERNS = [
  "report both explicit past_due totals and detailed overdue buckets that disagree",
  "mixes explicit past_due totals and detailed overdue bucket rows",
  "only expose partial past-due rollups",
  "do not expose a full total receivables basis",
  "do not include an explicit as-of date",
  "span multiple explicit as-of dates",
  "include both dated and undated customer aging rows",
] as const;

function hasUnsafePastDueShareDiagnostics(diagnostics: string[]) {
  return diagnostics.some((diagnostic) => {
    const lower = diagnostic.toLowerCase();

    return UNSAFE_PAST_DUE_SHARE_DIAGNOSTIC_PATTERNS.some((pattern) =>
      lower.includes(pattern),
    );
  });
}

function hasComputablePastDueBasis(
  bucket: FinanceCollectionsPostureCurrencyBucket,
) {
  const pastDueBucketTotal = parseAmountCents(bucket.pastDueBucketTotal);

  if (pastDueBucketTotal <= 0n) {
    return false;
  }

  const explicitPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_total")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);

  if (explicitPastDueTotal === pastDueBucketTotal) {
    return true;
  }

  const detailedPastDueTotal = bucket.exactBucketTotals
    .filter((entry) => entry.bucketClass === "past_due_detail")
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);

  return detailedPastDueTotal === pastDueBucketTotal;
}

function hasComputableTotalBasis(bucket: FinanceCollectionsPostureCurrencyBucket) {
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

function parseCondition(input: MonitorAlertCondition) {
  return MonitorAlertConditionSchema.parse(input);
}

function classifyDiagnosticSeverity(diagnostic: string) {
  const lower = diagnostic.toLowerCase();

  if (
    lower.includes("unknown-currency") ||
    lower.includes("as-of date") ||
    lower.includes("multiple explicit") ||
    lower.includes("mixes explicit past_due totals") ||
    lower.includes("dated and undated") ||
    lower.includes("partial past-due") ||
    lower.includes("disagree") ||
    lower.includes("do not expose a full total")
  ) {
    return "warning" as const;
  }

  return "info" as const;
}

function buildSourceFreshnessPosture(
  collectionsPosture: FinanceCollectionsPostureView,
): MonitorSourceFreshnessPosture {
  return MonitorSourceFreshnessPostureSchema.parse({
    state: collectionsPosture.freshness.state,
    latestAttemptedSyncRunId: collectionsPosture.latestAttemptedSyncRun?.id ?? null,
    latestSuccessfulSyncRunId:
      collectionsPosture.latestSuccessfulReceivablesAgingSlice.latestSyncRun?.id ??
      null,
    latestSuccessfulSource:
      collectionsPosture.latestSuccessfulReceivablesAgingSlice.latestSource,
    missingSource: collectionsPosture.freshness.state === "missing",
    failedSource: collectionsPosture.freshness.state === "failed",
    summary: collectionsPosture.freshness.latestSyncRunId
      ? collectionsPosture.freshness.state === "fresh"
        ? "The latest successful receivables-aging source is fresh."
        : collectionsPosture.freshness.state === "stale"
          ? "The latest successful receivables-aging source is stale."
          : "The latest receivables-aging source is not usable."
      : "No successful receivables-aging source is stored for collections posture.",
  });
}

function buildSourceLineageRefs(
  collectionsPosture: FinanceCollectionsPostureView,
): MonitorSourceLineageRef[] {
  const latestSource =
    collectionsPosture.latestSuccessfulReceivablesAgingSlice.latestSource;

  if (!latestSource) {
    return [];
  }

  const coverage =
    collectionsPosture.latestSuccessfulReceivablesAgingSlice.coverage;

  return [
    MonitorSourceLineageRefSchema.parse({
      ...latestSource,
      targetKind: coverage.lineageCount > 0 ? "receivables_aging_row" : null,
      targetId: null,
      lineageCount: coverage.lineageCount,
      lineageTargetCounts: coverage.lineageTargetCounts,
      summary:
        "Latest successful receivables-aging source lineage for collections pressure.",
    }),
  ];
}

function buildLimitations(limitations: string[]) {
  return [
    ...limitations.filter(
      (limitation) =>
        limitation !==
        "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
    ),
    "F6C collections-pressure monitoring evaluates stored receivables-aging freshness, coverage, diagnostics, and source-backed overdue concentration only; it does not infer collection timing, DSO, reserves, bad-debt forecasts, customer concentration, or recommendations.",
  ];
}

function buildRuntimeBoundary(): MonitorRuntimeBoundary {
  return MonitorRuntimeBoundarySchema.parse({
    runtimeCodexUsed: false,
    deliveryActionUsed: false,
    investigationMissionCreated: false,
    autonomousFinanceActionUsed: false,
    summary:
      "The result was produced by deterministic stored-state evaluation only.",
  });
}

function buildHumanReviewNextStep(status: "alert" | "no_alert") {
  return status === "alert"
    ? "Review receivables-aging source coverage, freshness, limitations, and collections posture before any external collections action."
    : "Review latest receivables-aging source lineage during normal operator review; no F6C collections-pressure alert is warranted by stored conditions.";
}

function parseAmountCents(value: string) {
  const sign = value.startsWith("-") ? -1n : 1n;
  const normalized = value.replace(/^-/, "");
  const [whole = "0", fraction = "00"] = normalized.split(".");

  return sign * (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2)));
}

function formatShare(numerator: bigint, denominator: bigint) {
  const basisPoints = (numerator * 10000n) / denominator;
  const whole = basisPoints / 100n;
  const fraction = (basisPoints % 100n).toString().padStart(2, "0");

  return `${whole}.${fraction}%`;
}
