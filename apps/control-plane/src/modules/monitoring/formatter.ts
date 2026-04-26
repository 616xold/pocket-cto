import type {
  MonitorAlertCondition,
  MonitorAlertSeverity,
  MonitorProofBundlePosture,
} from "@pocket-cto/domain";

const SEVERITY_RANK: Record<MonitorAlertSeverity, number> = {
  none: 0,
  info: 1,
  warning: 2,
  critical: 3,
};

export function chooseHighestSeverity(
  conditions: MonitorAlertCondition[],
): MonitorAlertSeverity {
  return conditions.reduce<MonitorAlertSeverity>((highest, condition) => {
    return SEVERITY_RANK[condition.severity] > SEVERITY_RANK[highest]
      ? condition.severity
      : highest;
  }, "none");
}

export function buildSeverityRationale(input: {
  conditions: MonitorAlertCondition[];
  severity: MonitorAlertSeverity;
}) {
  if (input.conditions.length === 0) {
    return "No alert because no F6A cash-posture source, freshness, coverage, or data-quality conditions were detected.";
  }

  const conditionKinds = Array.from(
    new Set(input.conditions.map((condition) => condition.kind)),
  ).join(", ");

  return `${formatSeverity(input.severity)} because ${conditionKinds} condition(s) were detected from stored cash-posture state.`;
}

export function buildProofBundlePosture(
  conditions: MonitorAlertCondition[],
): MonitorProofBundlePosture {
  if (conditions.some((condition) => condition.kind === "missing_source")) {
    return {
      state: "limited_by_missing_source",
      summary:
        "The monitor proof is limited because no successful bank-account-summary source backs the cash posture.",
    };
  }

  if (conditions.some((condition) => condition.kind === "failed_source")) {
    return {
      state: "limited_by_failed_source",
      summary:
        "The monitor proof is limited because the latest attempted bank-account-summary source failed.",
    };
  }

  if (conditions.some((condition) => condition.kind === "stale_source")) {
    return {
      state: "limited_by_stale_source",
      summary:
        "The monitor proof is source-backed but limited by stale cash-posture source freshness.",
    };
  }

  if (conditions.some((condition) => condition.kind === "coverage_gap")) {
    return {
      state: "limited_by_coverage_gap",
      summary:
        "The monitor proof is source-backed but limited by bank-account-summary coverage gaps.",
    };
  }

  if (conditions.some((condition) => condition.kind === "data_quality_gap")) {
    return {
      state: "limited_by_data_quality_gap",
      summary:
        "The monitor proof is source-backed but limited by cash-posture data-quality diagnostics.",
    };
  }

  return {
    state: "source_backed",
    summary:
      "The monitor result is backed by the latest stored bank-account-summary source lineage.",
  };
}

export function formatSourceLineageSummary(lineageCount: number) {
  if (lineageCount === 0) {
    return "No bank-account-summary source lineage is available for this monitor result.";
  }

  return `${lineageCount} bank-account-summary lineage record(s) back this monitor result.`;
}

function formatSeverity(severity: MonitorAlertSeverity) {
  return severity
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
