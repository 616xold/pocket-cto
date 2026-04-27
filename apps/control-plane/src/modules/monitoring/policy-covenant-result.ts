import type {
  MonitorAlertCondition,
  MonitorPolicySourceLineageRef,
  MonitorPolicyThresholdFactLineageRef,
  MonitorRuntimeBoundary,
  MonitorSourceFreshnessPosture,
  MonitorSourceLineageRef,
} from "@pocket-cto/domain";
import {
  MonitorAlertConditionSchema,
  MonitorPolicySourceLineageRefSchema,
  MonitorPolicyThresholdFactLineageRefSchema,
  MonitorRuntimeBoundarySchema,
  MonitorSourceFreshnessPostureSchema,
} from "@pocket-cto/domain";
import {
  buildProofBundlePosture,
  buildSeverityRationale,
  chooseHighestSeverity,
  POLICY_COVENANT_THRESHOLD_COPY,
} from "./formatter";
import { readComparableActual } from "./policy-covenant-actuals";
import type {
  PolicyCovenantThresholdEvaluationInput,
  ThresholdComparator,
  ThresholdFact,
} from "./policy-covenant-types";

export function evaluatePolicyCovenantThresholdMonitor(
  input: PolicyCovenantThresholdEvaluationInput,
) {
  const conditions = buildConditions(input);
  const severity = chooseHighestSeverity(conditions);
  const sourceFreshnessPosture = buildSourceFreshnessPosture(input, conditions);
  const sourceLineageRefs = buildSourceLineageRefs(input, conditions);
  const deterministicSeverityRationale = buildSeverityRationale({
    conditions,
    copy: POLICY_COVENANT_THRESHOLD_COPY,
    severity,
  });
  const limitations = buildLimitations();
  const proofBundlePosture = buildProofBundlePosture(
    conditions,
    POLICY_COVENANT_THRESHOLD_COPY,
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
        "F6E monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary,
    severity,
    sourceFreshnessPosture,
    sourceLineageRefs,
    sourceLineageSummary: buildSourceLineageSummary(sourceLineageRefs),
    status,
  };
}

function buildConditions(
  input: PolicyCovenantThresholdEvaluationInput,
): MonitorAlertCondition[] {
  const conditions: MonitorAlertCondition[] = [];

  if (input.policySources.length === 0) {
    conditions.push(
      parseCondition({
        kind: "missing_source",
        severity: "critical",
        summary:
          "No included policy_document source is stored for policy/covenant threshold monitoring.",
        evidencePath: "cfoWiki.policySources",
      }),
    );

    return conditions;
  }

  conditions.push(...buildPolicySourceConditions(input));
  conditions.push(...buildExtractionIssueConditions(input.extraction.issues));

  const validFacts = input.extraction.facts.filter(
    (fact) => !input.extraction.conflictingMetricKeys.has(fact.metricKey),
  );

  if (validFacts.length === 0 && input.extraction.issues.length === 0) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "Policy sources are stored, but no exact supported F6E threshold fact could be extracted.",
        evidencePath: "thresholdFacts",
      }),
    );

    return conditions;
  }

  if (hasUnusablePolicySourceCondition(conditions)) {
    return conditions;
  }

  for (const fact of validFacts) {
    const actualResult = readComparableActual({
      collectionsPosture: input.collectionsPosture,
      metricKey: fact.metricKey,
      payablesPosture: input.payablesPosture,
    });

    if (actualResult.condition) {
      conditions.push(actualResult.condition);
      continue;
    }

    const comparison = compareThreshold({
      actualValue: actualResult.actual.value,
      comparator: fact.comparator,
      thresholdValue: fact.thresholdValue,
    });

    if (comparison === "breach") {
      conditions.push(
        parseCondition({
          kind: "threshold_breach",
          severity: "critical",
          summary: `${fact.metricKey} is ${formatPercent(actualResult.actual.value)} percent, breaching the source-backed ${fact.comparator} ${formatThresholdValue(fact.thresholdValue)} percent threshold.`,
          evidencePath: `thresholdFacts[${fact.metricKey}].comparison`,
        }),
      );
    } else if (comparison === "approaching") {
      conditions.push(
        parseCondition({
          kind: "threshold_approaching",
          severity: "warning",
          summary: `${fact.metricKey} is ${formatPercent(actualResult.actual.value)} percent, approaching the source-backed ${fact.comparator} ${formatThresholdValue(fact.thresholdValue)} percent threshold by the deterministic 90 percent proximity rule.`,
          evidencePath: `thresholdFacts[${fact.metricKey}].comparison`,
        }),
      );
    }
  }

  return conditions;
}

function buildPolicySourceConditions(
  input: PolicyCovenantThresholdEvaluationInput,
) {
  const conditions: MonitorAlertCondition[] = [];

  if (!input.policyCorpusPage) {
    conditions.push(
      parseCondition({
        kind: "coverage_gap",
        severity: "warning",
        summary:
          "The CFO Wiki policy-corpus page is not available, so policy threshold posture is incomplete.",
        evidencePath: "cfoWiki.policyCorpusPage",
      }),
    );
  } else if (input.policyCorpusPage.freshnessSummary.state === "stale") {
    conditions.push(
      parseCondition({
        kind: "stale_source",
        severity: "warning",
        summary:
          "The CFO Wiki policy-corpus page is stale for policy/covenant threshold monitoring.",
        evidencePath: "cfoWiki.policyCorpusPage.freshnessSummary.state",
      }),
    );
  } else if (input.policyCorpusPage.freshnessSummary.state === "failed") {
    conditions.push(
      parseCondition({
        kind: "failed_source",
        severity: "critical",
        summary:
          "The CFO Wiki policy-corpus page has failed freshness posture.",
        evidencePath: "cfoWiki.policyCorpusPage.freshnessSummary.state",
      }),
    );
  }

  for (const policyPage of input.policyPages) {
    const sourceId = policyPage.source.source.id;

    if (!policyPage.source.latestSnapshot) {
      conditions.push(
        parseCondition({
          kind: "coverage_gap",
          severity: "warning",
          summary: `Policy source ${sourceId} has no stored source snapshot for threshold monitoring.`,
          evidencePath: `policySources[${sourceId}].latestSnapshot`,
        }),
      );
    }

    if (!policyPage.source.latestExtract) {
      conditions.push(
        parseCondition({
          kind: "coverage_gap",
          severity: "warning",
          summary: `Policy source ${sourceId} has no deterministic extract for threshold monitoring.`,
          evidencePath: `policySources[${sourceId}].latestExtract`,
        }),
      );
    } else if (policyPage.source.latestExtract.extractStatus === "failed") {
      conditions.push(
        parseCondition({
          kind: "failed_source",
          severity: "critical",
          summary: `Policy source ${sourceId} latest deterministic extract failed.`,
          evidencePath: `policySources[${sourceId}].latestExtract.extractStatus`,
        }),
      );
    } else if (policyPage.source.latestExtract.extractStatus === "unsupported") {
      conditions.push(
        parseCondition({
          kind: "coverage_gap",
          severity: "warning",
          summary: `Policy source ${sourceId} latest deterministic extract is unsupported.`,
          evidencePath: `policySources[${sourceId}].latestExtract.extractStatus`,
        }),
      );
    }

    if (!policyPage.page) {
      conditions.push(
        parseCondition({
          kind: "coverage_gap",
          severity: "warning",
          summary: `Compiled policy page ${policyPage.pageKey} is not available for threshold monitoring.`,
          evidencePath: `policyPages[${policyPage.pageKey}]`,
        }),
      );
    } else if (policyPage.page.freshnessSummary.state === "stale") {
      conditions.push(
        parseCondition({
          kind: "stale_source",
          severity: "warning",
          summary: `Compiled policy page ${policyPage.pageKey} is stale for threshold monitoring.`,
          evidencePath: `policyPages[${policyPage.pageKey}].freshnessSummary.state`,
        }),
      );
    } else if (policyPage.page.freshnessSummary.state === "failed") {
      conditions.push(
        parseCondition({
          kind: "failed_source",
          severity: "critical",
          summary: `Compiled policy page ${policyPage.pageKey} has failed freshness posture.`,
          evidencePath: `policyPages[${policyPage.pageKey}].freshnessSummary.state`,
        }),
      );
    }
  }

  return conditions;
}

function buildExtractionIssueConditions(
  issues: PolicyCovenantThresholdEvaluationInput["extraction"]["issues"],
): MonitorAlertCondition[] {
  return issues.map((issue) =>
    parseCondition({
      kind: "data_quality_gap",
      severity: "warning",
      summary: issue.summary,
      evidencePath: issue.evidencePath,
    }),
  );
}

function buildSourceFreshnessPosture(
  input: PolicyCovenantThresholdEvaluationInput,
  conditions: MonitorAlertCondition[],
): MonitorSourceFreshnessPosture {
  const state = conditions.some((condition) => condition.kind === "missing_source")
    ? "missing"
    : conditions.some((condition) => condition.kind === "failed_source")
      ? "failed"
      : conditions.some((condition) => condition.kind === "stale_source")
        ? "stale"
        : "fresh";

  return MonitorSourceFreshnessPostureSchema.parse({
    state,
    latestAttemptedSyncRunId: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulSource: null,
    missingSource: state === "missing",
    failedSource: state === "failed",
    summary: buildFreshnessSummary(input, state),
  });
}

function buildFreshnessSummary(
  input: PolicyCovenantThresholdEvaluationInput,
  state: "missing" | "fresh" | "stale" | "failed",
) {
  if (state === "missing") {
    return "No included policy_document source is available for policy/covenant threshold monitoring.";
  }

  if (state === "failed") {
    return "At least one required CFO Wiki policy source or page has failed posture.";
  }

  if (state === "stale") {
    return "At least one required CFO Wiki policy source or page is stale.";
  }

  return `Stored CFO Wiki policy threshold posture is fresh across ${input.policySources.length} policy source(s).`;
}

function buildSourceLineageRefs(
  input: PolicyCovenantThresholdEvaluationInput,
  conditions: MonitorAlertCondition[],
): MonitorSourceLineageRef[] {
  if (conditions.some((condition) => condition.kind === "missing_source")) {
    return [];
  }

  const refs: MonitorSourceLineageRef[] = input.policyPages.map((pageState) =>
    buildPolicySourceLineageRef(pageState),
  );
  const validFacts = input.extraction.facts.filter(
    (fact) => !input.extraction.conflictingMetricKeys.has(fact.metricKey),
  );

  refs.push(...validFacts.map((fact) => buildThresholdFactLineageRef(fact)));

  if (hasUnusablePolicySourceCondition(conditions)) {
    return refs;
  }

  for (const fact of validFacts) {
    const actual = readComparableActual({
      collectionsPosture: input.collectionsPosture,
      metricKey: fact.metricKey,
      payablesPosture: input.payablesPosture,
    }).actual;

    if (actual) {
      refs.push(actual.lineageRef);
    }
  }

  return refs;
}

function hasUnusablePolicySourceCondition(conditions: MonitorAlertCondition[]) {
  return conditions.some(
    (condition) =>
      condition.kind === "failed_source" || condition.kind === "stale_source",
  );
}

function buildPolicySourceLineageRef(
  pageState: PolicyCovenantThresholdEvaluationInput["policyPages"][number],
): MonitorPolicySourceLineageRef {
  return MonitorPolicySourceLineageRefSchema.parse({
    lineageKind: "policy_source",
    sourceId: pageState.source.source.id,
    sourceSnapshotId: pageState.source.latestSnapshot?.id ?? null,
    sourceFileId: pageState.source.latestSourceFile?.id ?? null,
    policyPageKey: pageState.pageKey,
    compileRunId: pageState.page?.latestCompileRun?.id ?? null,
    documentRole: "policy_document",
    extractStatus: pageState.source.latestExtract?.extractStatus ?? null,
    freshnessState: pageState.page?.freshnessSummary.state ?? null,
    summary: `Policy source ${pageState.source.source.id} is bound as policy_document for F6E threshold posture.`,
  });
}

function buildThresholdFactLineageRef(
  fact: ThresholdFact,
): MonitorPolicyThresholdFactLineageRef {
  return MonitorPolicyThresholdFactLineageRefSchema.parse({
    lineageKind: "policy_threshold_fact",
    thresholdId: fact.thresholdId,
    sourceId: fact.source.source.id,
    sourceSnapshotId: fact.source.latestSnapshot?.id ?? null,
    sourceFileId: fact.source.latestSourceFile?.id ?? null,
    policyPageKey: fact.policyPageKey,
    compileRunId: fact.compileRunId,
    excerpt: fact.excerpt,
    metricKey: fact.metricKey,
    comparator: fact.comparator,
    thresholdValue: fact.thresholdValue,
    unit: fact.unit,
    extractionRuleVersion: fact.extractionRuleVersion,
    limitations: fact.limitations,
    summary: `Threshold fact ${fact.thresholdId} was extracted by exact F6E grammar.`,
  });
}

function buildSourceLineageSummary(refs: MonitorSourceLineageRef[]) {
  if (refs.length === 0) {
    return "No policy threshold or comparable actual lineage is available for this monitor result.";
  }

  const policySourceCount = refs.filter(
    (ref) => "lineageKind" in ref && ref.lineageKind === "policy_source",
  ).length;
  const thresholdFactCount = refs.filter(
    (ref) => "lineageKind" in ref && ref.lineageKind === "policy_threshold_fact",
  ).length;
  const actualCount = refs.filter(
    (ref) => "lineageKind" in ref && ref.lineageKind === "finance_twin_actual",
  ).length;

  return `${policySourceCount} policy source ref(s), ${thresholdFactCount} threshold fact ref(s), and ${actualCount} comparable actual ref(s) back this monitor result.`;
}

function buildLimitations() {
  return [
    "F6E policy/covenant threshold monitoring parses only exact `Pocket CFO threshold: <metric_key> <operator> <value> percent` lines from stored CFO Wiki policy pages or deterministic policy extracts.",
    "F6E supports only collections_past_due_share and payables_past_due_share as first-slice threshold metric keys.",
    "F6E compares thresholds only to explicit stored Finance Twin collections or payables posture with a single source-backed currency basis.",
    "This monitor is deterministic human-review posture only; it does not interpret contract meaning, score covenant risk, or perform external finance actions.",
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
    ? "Review the cited policy threshold line, CFO Wiki source posture, and comparable Finance Twin actual posture before deciding any external action."
    : "Review latest policy threshold and comparable Finance Twin lineage during normal operator review; no F6E policy/covenant threshold alert is warranted by stored conditions.";
}

function compareThreshold(input: {
  actualValue: number;
  comparator: ThresholdComparator;
  thresholdValue: number;
}) {
  const maxThreshold =
    input.comparator === "<=" || input.comparator === "<";

  if (maxThreshold) {
    const breached =
      input.comparator === "<="
        ? input.actualValue > input.thresholdValue
        : input.actualValue >= input.thresholdValue;

    if (breached) {
      return "breach" as const;
    }

    return input.actualValue >= input.thresholdValue * 0.9
      ? ("approaching" as const)
      : ("clear" as const);
  }

  const breached =
    input.comparator === ">="
      ? input.actualValue < input.thresholdValue
      : input.actualValue <= input.thresholdValue;

  if (breached) {
    return "breach" as const;
  }

  return input.actualValue <= input.thresholdValue * 1.1
    ? ("approaching" as const)
    : ("clear" as const);
}

function formatPercent(value: number) {
  return value.toFixed(2);
}

function formatThresholdValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function parseCondition(input: MonitorAlertCondition) {
  return MonitorAlertConditionSchema.parse(input);
}
