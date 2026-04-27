import type {
  FinancePayablesPostureCurrencyBucket,
  FinancePayablesPostureView,
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
  formatSourceLineageSummary,
  PAYABLES_PRESSURE_COPY,
} from "./formatter";

export function evaluatePayablesPressureMonitor(
  payablesPosture: FinancePayablesPostureView,
) {
  const conditions = buildConditions(payablesPosture);
  const severity = chooseHighestSeverity(conditions);
  const sourceFreshnessPosture = buildSourceFreshnessPosture(payablesPosture);
  const sourceLineageRefs = buildSourceLineageRefs(payablesPosture);
  const deterministicSeverityRationale = buildSeverityRationale({
    conditions,
    copy: PAYABLES_PRESSURE_COPY,
    severity,
  });
  const limitations = buildLimitations(payablesPosture.limitations);
  const proofBundlePosture = buildProofBundlePosture(
    conditions,
    PAYABLES_PRESSURE_COPY,
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
        "F6D monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary,
    severity,
    sourceFreshnessPosture,
    sourceLineageRefs,
    sourceLineageSummary: formatSourceLineageSummary(
      sourceLineageRefs.reduce((sum, ref) => sum + ref.lineageCount, 0),
      PAYABLES_PRESSURE_COPY,
    ),
    status,
  };
}

function buildConditions(
  payablesPosture: FinancePayablesPostureView,
): MonitorAlertCondition[] {
  const conditions: MonitorAlertCondition[] = [];

  switch (payablesPosture.freshness.state) {
    case "missing":
      conditions.push(
        parseCondition({
          kind: "missing_source",
          severity: "critical",
          summary: "No successful payables-aging slice exists yet.",
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
            "The latest attempted payables-aging sync failed before producing current payables-posture state.",
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
            "The latest successful payables-aging slice is older than the freshness window.",
          evidencePath: "freshness.state",
        }),
      );
      break;
    case "fresh":
      break;
  }

  conditions.push(...buildCoverageConditions(payablesPosture));

  for (const diagnostic of payablesPosture.diagnostics) {
    conditions.push(
      parseCondition({
        kind: "data_quality_gap",
        severity: classifyDiagnosticSeverity(diagnostic),
        summary: diagnostic,
        evidencePath: "diagnostics",
      }),
    );
  }

  conditions.push(...buildOverdueConcentrationConditions(payablesPosture));

  return conditions;
}

function buildCoverageConditions(
  payablesPosture: FinancePayablesPostureView,
): MonitorAlertCondition[] {
  const coverage = payablesPosture.coverageSummary;
  const conditions: MonitorAlertCondition[] = [];

  if (
    coverage.rowCount === 0 ||
    coverage.vendorCount === 0 ||
    coverage.currencyBucketCount === 0
  ) {
    return [
      parseCondition({
        kind: "coverage_gap",
        severity: "critical",
        summary:
          "Payables posture has no payables-aging rows, vendors, or currency buckets from a stored payables-aging slice.",
        evidencePath: "coverageSummary",
      }),
    ];
  }

  if (
    !payablesPosture.currencyBuckets.some(
      (bucket) => parseAmountCents(bucket.totalPayables) > 0n,
    )
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Payables posture has payables-aging rows but no positive source-backed total payables basis.",
        evidencePath: "currencyBuckets.totalPayables",
      }),
    );
  }

  if (coverage.rowsWithComputablePastDueCount === 0) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Payables posture has no computable source-backed past-due basis.",
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
          "Payables posture has only partial source-backed past-due coverage, so overdue concentration is limited.",
        evidencePath: "coverageSummary.rowsWithComputablePastDueCount",
      }),
    );
  }

  if (
    payablesPosture.currencyBuckets.some(
      (bucket) =>
        bucket.vendorCount > 0 && parseAmountCents(bucket.totalPayables) <= 0n,
    )
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "One or more payables-posture currency buckets lack a computable total payables denominator.",
        evidencePath: "currencyBuckets.totalPayables",
      }),
    );
  }

  return conditions;
}

function buildOverdueConcentrationConditions(
  payablesPosture: FinancePayablesPostureView,
): MonitorAlertCondition[] {
  return payablesPosture.currencyBuckets.flatMap((bucket) => {
    if (!canComputePastDueShare(payablesPosture, bucket)) {
      return [];
    }

    const totalPayables = parseAmountCents(bucket.totalPayables);
    const pastDueTotal = parseAmountCents(bucket.pastDueBucketTotal);
    const severity =
      pastDueTotal * 100n >= totalPayables * 75n
        ? "critical"
        : pastDueTotal * 100n >= totalPayables * 50n
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
        summary: `${currencyLabel} payables are ${formatShare(pastDueTotal, totalPayables)} past due based on source-backed totals.`,
        evidencePath: `currencyBuckets[${currencyLabel}].pastDueShare`,
      }),
    ];
  });
}

function canComputePastDueShare(
  payablesPosture: FinancePayablesPostureView,
  bucket: FinancePayablesPostureCurrencyBucket,
) {
  const coverage = payablesPosture.coverageSummary;
  const totalPayables = parseAmountCents(bucket.totalPayables);

  if (hasUnsafePastDueShareDiagnostics(payablesPosture.diagnostics)) {
    return false;
  }

  if (totalPayables <= 0n) {
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
  "do not expose a full total payables basis",
  "do not include an explicit as-of date",
  "span multiple explicit as-of dates",
  "include both dated and undated vendor aging rows",
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
  bucket: FinancePayablesPostureCurrencyBucket,
) {
  const sourceBackedPastDueTotal = bucket.exactBucketTotals
    .filter(
      (entry) =>
        entry.bucketClass === "past_due_total" ||
        entry.bucketClass === "past_due_detail",
    )
    .reduce((sum, entry) => sum + parseAmountCents(entry.totalAmount), 0n);

  return (
    sourceBackedPastDueTotal > 0n &&
    sourceBackedPastDueTotal === parseAmountCents(bucket.pastDueBucketTotal)
  );
}

function hasComputableTotalBasis(bucket: FinancePayablesPostureCurrencyBucket) {
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
  payablesPosture: FinancePayablesPostureView,
): MonitorSourceFreshnessPosture {
  return MonitorSourceFreshnessPostureSchema.parse({
    state: payablesPosture.freshness.state,
    latestAttemptedSyncRunId:
      payablesPosture.latestAttemptedSyncRun?.id ?? null,
    latestSuccessfulSyncRunId:
      payablesPosture.latestSuccessfulPayablesAgingSlice.latestSyncRun?.id ??
      null,
    latestSuccessfulSource:
      payablesPosture.latestSuccessfulPayablesAgingSlice.latestSource,
    missingSource: payablesPosture.freshness.state === "missing",
    failedSource: payablesPosture.freshness.state === "failed",
    summary: payablesPosture.freshness.latestSyncRunId
      ? payablesPosture.freshness.state === "fresh"
        ? "The latest successful payables-aging source is fresh."
        : payablesPosture.freshness.state === "stale"
          ? "The latest successful payables-aging source is stale."
          : "The latest payables-aging source is not usable."
      : "No successful payables-aging source is stored for payables posture.",
  });
}

function buildSourceLineageRefs(
  payablesPosture: FinancePayablesPostureView,
): MonitorSourceLineageRef[] {
  const latestSource =
    payablesPosture.latestSuccessfulPayablesAgingSlice.latestSource;

  if (!latestSource) {
    return [];
  }

  const coverage = payablesPosture.latestSuccessfulPayablesAgingSlice.coverage;

  return [
    MonitorSourceLineageRefSchema.parse({
      ...latestSource,
      targetKind: coverage.lineageCount > 0 ? "payables_aging_row" : null,
      targetId: null,
      lineageCount: coverage.lineageCount,
      lineageTargetCounts: coverage.lineageTargetCounts,
      summary:
        "Latest successful payables-aging source lineage for payables pressure.",
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
    "F6D payables-pressure monitoring evaluates stored payables-aging freshness, coverage, diagnostics, and source-backed overdue concentration only; it does not infer payment timing, DPO, cash forecasts, accruals, vendor concentration, payment prioritization, payment instructions, or recommendations.",
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
    ? "Review payables-aging source coverage, freshness, limitations, and payables posture before any external vendor or payment action."
    : "Review latest payables-aging source lineage during normal operator review; no F6D payables-pressure alert is warranted by stored conditions.";
}

function parseAmountCents(value: string) {
  const sign = value.startsWith("-") ? -1n : 1n;
  const normalized = value.replace(/^-/, "");
  const [whole = "0", fraction = "00"] = normalized.split(".");

  return (
    sign * (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2)))
  );
}

function formatShare(numerator: bigint, denominator: bigint) {
  const basisPoints = (numerator * 10000n) / denominator;
  const whole = basisPoints / 100n;
  const fraction = (basisPoints % 100n).toString().padStart(2, "0");

  return `${whole}.${fraction}%`;
}
