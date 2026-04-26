import type {
  FinanceCashPostureView,
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
} from "./formatter";

export function evaluateCashPostureMonitor(cashPosture: FinanceCashPostureView) {
  const conditions = buildConditions(cashPosture);
  const severity = chooseHighestSeverity(conditions);
  const sourceFreshnessPosture = buildSourceFreshnessPosture(cashPosture);
  const sourceLineageRefs = buildSourceLineageRefs(cashPosture);
  const deterministicSeverityRationale = buildSeverityRationale({
    conditions,
    severity,
  });
  const limitations = buildLimitations(cashPosture.limitations);
  const proofBundlePosture = buildProofBundlePosture(conditions);
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
        "F6A monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary,
    severity,
    sourceFreshnessPosture,
    sourceLineageRefs,
    sourceLineageSummary: formatSourceLineageSummary(
      sourceLineageRefs.reduce((sum, ref) => sum + ref.lineageCount, 0),
    ),
    status,
  };
}

function buildConditions(
  cashPosture: FinanceCashPostureView,
): MonitorAlertCondition[] {
  const conditions: MonitorAlertCondition[] = [];

  switch (cashPosture.freshness.state) {
    case "missing":
      conditions.push(
        parseCondition({
          kind: "missing_source",
          severity: "critical",
          summary: "No successful bank-account-summary slice exists yet.",
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
            "The latest attempted bank-account-summary sync failed before producing current cash-posture state.",
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
            "The latest successful bank-account-summary slice is older than the freshness window.",
          evidencePath: "freshness.state",
        }),
      );
      break;
    case "fresh":
      break;
  }

  if (
    cashPosture.coverageSummary.bankAccountCount === 0 ||
    cashPosture.coverageSummary.reportedBalanceCount === 0
  ) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "critical",
        summary:
          "Cash posture has no bank accounts or reported balances from the stored bank-account-summary slice.",
        evidencePath: "coverageSummary",
      }),
    );
  }

  for (const diagnostic of cashPosture.diagnostics) {
    conditions.push(
      parseCondition({
        kind: "data_quality_gap",
        severity: classifyDiagnosticSeverity(diagnostic),
        summary: diagnostic,
        evidencePath: "diagnostics",
      }),
    );
  }

  return conditions;
}

function parseCondition(input: MonitorAlertCondition) {
  return MonitorAlertConditionSchema.parse(input);
}

function classifyDiagnosticSeverity(diagnostic: string) {
  const lower = diagnostic.toLowerCase();

  if (
    lower.includes("as-of date") ||
    lower.includes("multiple explicit") ||
    lower.includes("dated and undated")
  ) {
    return "warning" as const;
  }

  return "info" as const;
}

function buildSourceFreshnessPosture(
  cashPosture: FinanceCashPostureView,
): MonitorSourceFreshnessPosture {
  return MonitorSourceFreshnessPostureSchema.parse({
    state: cashPosture.freshness.state,
    latestAttemptedSyncRunId: cashPosture.latestAttemptedSyncRun?.id ?? null,
    latestSuccessfulSyncRunId:
      cashPosture.latestSuccessfulBankSummarySlice.latestSyncRun?.id ?? null,
    latestSuccessfulSource:
      cashPosture.latestSuccessfulBankSummarySlice.latestSource,
    missingSource: cashPosture.freshness.state === "missing",
    failedSource: cashPosture.freshness.state === "failed",
    summary: cashPosture.freshness.latestSyncRunId
      ? cashPosture.freshness.state === "fresh"
        ? "The latest successful bank-account-summary source is fresh."
        : cashPosture.freshness.state === "stale"
          ? "The latest successful bank-account-summary source is stale."
          : "The latest bank-account-summary source is not usable."
      : "No successful bank-account-summary source is stored for cash posture.",
  });
}

function buildSourceLineageRefs(
  cashPosture: FinanceCashPostureView,
): MonitorSourceLineageRef[] {
  const latestSource = cashPosture.latestSuccessfulBankSummarySlice.latestSource;

  if (!latestSource) {
    return [];
  }

  const coverage = cashPosture.latestSuccessfulBankSummarySlice.coverage;

  return [
    MonitorSourceLineageRefSchema.parse({
      ...latestSource,
      targetKind: coverage.lineageCount > 0 ? "bank_account_summary" : null,
      targetId: null,
      lineageCount: coverage.lineageCount,
      lineageTargetCounts: coverage.lineageTargetCounts,
      summary:
        "Latest successful bank-account-summary source lineage for cash posture.",
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
    "F6A cash-posture monitoring evaluates stored source, freshness, coverage, and diagnostic posture only; it does not calculate runway, burn, covenant risk, cash targets, or cash recommendations.",
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
    ? "Review cash-posture source coverage and refresh bank-account-summary ingest if needed before relying on the monitor result."
    : "Review latest cash-posture source lineage during normal operator review; no F6A cash-posture alert is warranted by stored conditions.";
}
