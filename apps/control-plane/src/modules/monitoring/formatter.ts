import type {
  MonitorAlertCondition,
  MonitorAlertSeverity,
  MonitorProofBundlePosture,
} from "@pocket-cto/domain";

type MonitorFormatterCopy = {
  coverageProofSummary: string;
  dataQualityProofSummary: string;
  failedProofSummary: string;
  lineageNoun: string;
  missingProofSummary: string;
  noAlertRationale: string;
  noLineageSummary: string;
  sourceBackedProofSummary: string;
  staleProofSummary: string;
  stateLabel: string;
};

const SEVERITY_RANK: Record<MonitorAlertSeverity, number> = {
  none: 0,
  info: 1,
  warning: 2,
  critical: 3,
};

const CASH_POSTURE_COPY: MonitorFormatterCopy = {
  coverageProofSummary:
    "The monitor proof is source-backed but limited by bank-account-summary coverage gaps.",
  dataQualityProofSummary:
    "The monitor proof is source-backed but limited by cash-posture data-quality diagnostics.",
  failedProofSummary:
    "The monitor proof is limited because the latest attempted bank-account-summary source failed.",
  lineageNoun: "bank-account-summary",
  missingProofSummary:
    "The monitor proof is limited because no successful bank-account-summary source backs the cash posture.",
  noAlertRationale:
    "No alert because no F6A cash-posture source, freshness, coverage, or data-quality conditions were detected.",
  noLineageSummary:
    "No bank-account-summary source lineage is available for this monitor result.",
  sourceBackedProofSummary:
    "The monitor result is backed by the latest stored bank-account-summary source lineage.",
  staleProofSummary:
    "The monitor proof is source-backed but limited by stale cash-posture source freshness.",
  stateLabel: "cash-posture",
};

export const COLLECTIONS_PRESSURE_COPY: MonitorFormatterCopy = {
  coverageProofSummary:
    "The monitor proof is source-backed but limited by receivables-aging coverage gaps.",
  dataQualityProofSummary:
    "The monitor proof is source-backed but limited by collections-posture data-quality diagnostics.",
  failedProofSummary:
    "The monitor proof is limited because the latest attempted receivables-aging source failed.",
  lineageNoun: "receivables-aging",
  missingProofSummary:
    "The monitor proof is limited because no successful receivables-aging source backs the collections posture.",
  noAlertRationale:
    "No alert because no F6C collections-pressure source, freshness, coverage, data-quality, or overdue-concentration conditions were detected.",
  noLineageSummary:
    "No receivables-aging source lineage is available for this monitor result.",
  sourceBackedProofSummary:
    "The monitor result is backed by the latest stored receivables-aging source lineage.",
  staleProofSummary:
    "The monitor proof is source-backed but limited by stale receivables-aging source freshness.",
  stateLabel: "collections-pressure",
};

export const PAYABLES_PRESSURE_COPY: MonitorFormatterCopy = {
  coverageProofSummary:
    "The monitor proof is source-backed but limited by payables-aging coverage gaps.",
  dataQualityProofSummary:
    "The monitor proof is source-backed but limited by payables-posture data-quality diagnostics.",
  failedProofSummary:
    "The monitor proof is limited because the latest attempted payables-aging source failed.",
  lineageNoun: "payables-aging",
  missingProofSummary:
    "The monitor proof is limited because no successful payables-aging source backs the payables posture.",
  noAlertRationale:
    "No alert because no F6D payables-pressure source, freshness, coverage, data-quality, or overdue-concentration conditions were detected.",
  noLineageSummary:
    "No payables-aging source lineage is available for this monitor result.",
  sourceBackedProofSummary:
    "The monitor result is backed by the latest stored payables-aging source lineage.",
  staleProofSummary:
    "The monitor proof is source-backed but limited by stale payables-aging source freshness.",
  stateLabel: "payables-pressure",
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
  copy?: MonitorFormatterCopy;
  severity: MonitorAlertSeverity;
}) {
  const copy = input.copy ?? CASH_POSTURE_COPY;

  if (input.conditions.length === 0) {
    return copy.noAlertRationale;
  }

  const conditionKinds = Array.from(
    new Set(input.conditions.map((condition) => condition.kind)),
  ).join(", ");

  return `${formatSeverity(input.severity)} because ${conditionKinds} condition(s) were detected from stored ${copy.stateLabel} state.`;
}

export function buildProofBundlePosture(
  conditions: MonitorAlertCondition[],
  copy: MonitorFormatterCopy = CASH_POSTURE_COPY,
): MonitorProofBundlePosture {
  if (conditions.some((condition) => condition.kind === "missing_source")) {
    return {
      state: "limited_by_missing_source",
      summary: copy.missingProofSummary,
    };
  }

  if (conditions.some((condition) => condition.kind === "failed_source")) {
    return {
      state: "limited_by_failed_source",
      summary: copy.failedProofSummary,
    };
  }

  if (conditions.some((condition) => condition.kind === "stale_source")) {
    return {
      state: "limited_by_stale_source",
      summary: copy.staleProofSummary,
    };
  }

  if (conditions.some((condition) => condition.kind === "coverage_gap")) {
    return {
      state: "limited_by_coverage_gap",
      summary: copy.coverageProofSummary,
    };
  }

  if (conditions.some((condition) => condition.kind === "data_quality_gap")) {
    return {
      state: "limited_by_data_quality_gap",
      summary: copy.dataQualityProofSummary,
    };
  }

  return {
    state: "source_backed",
    summary: copy.sourceBackedProofSummary,
  };
}

export function formatSourceLineageSummary(
  lineageCount: number,
  copy: MonitorFormatterCopy = CASH_POSTURE_COPY,
) {
  if (lineageCount === 0) {
    return copy.noLineageSummary;
  }

  return `${lineageCount} ${copy.lineageNoun} lineage record(s) back this monitor result.`;
}

function formatSeverity(severity: MonitorAlertSeverity) {
  return severity
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
