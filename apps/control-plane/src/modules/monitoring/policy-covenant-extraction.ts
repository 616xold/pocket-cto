import type {
  PolicyCovenantThresholdExtraction,
  PolicyCovenantThresholdPageState,
  SupportedMetricKey,
  ThresholdComparator,
  ThresholdFact,
  ThresholdExtractionIssue,
} from "./policy-covenant-types";
import {
  POLICY_THRESHOLD_EXTRACTION_RULE_VERSION,
  SUPPORTED_METRIC_KEYS,
} from "./policy-covenant-types";

export function extractPolicyCovenantThresholdFacts(input: {
  policyPages: PolicyCovenantThresholdPageState[];
}): PolicyCovenantThresholdExtraction {
  const issues: ThresholdExtractionIssue[] = [];
  const facts: ThresholdFact[] = [];

  for (const policyPage of input.policyPages) {
    if (policyPage.source.latestExtract?.extractStatus !== "extracted") {
      continue;
    }

    for (const candidate of readThresholdCandidateLines(policyPage)) {
      const parsed = parseThresholdLine(candidate.line);
      const evidencePath = `${candidate.path}.line`;

      if (parsed.status === "malformed") {
        issues.push({
          evidencePath,
          summary: `Policy source ${policyPage.source.source.id} contains a Pocket CFO threshold line outside the exact F6E grammar: ${candidate.line}`,
        });
        continue;
      }

      if (parsed.status === "unsupported_metric") {
        issues.push({
          evidencePath,
          summary: `Policy source ${policyPage.source.source.id} uses unsupported F6E threshold metric ${parsed.metricKey}.`,
        });
        continue;
      }

      if (parsed.status === "unsupported_unit") {
        issues.push({
          evidencePath,
          summary: `Policy source ${policyPage.source.source.id} uses unsupported F6E threshold unit ${parsed.unit}.`,
        });
        continue;
      }

      facts.push({
        comparator: parsed.comparator,
        compileRunId: policyPage.page?.latestCompileRun?.id ?? null,
        excerpt: candidate.line,
        extractionRuleVersion: POLICY_THRESHOLD_EXTRACTION_RULE_VERSION,
        limitations: [
          "Only exact `Pocket CFO threshold: <metric_key> <operator> <value> <unit>` lines are parsed in F6E.",
          "The threshold fact is deterministic human-review posture only and does not interpret contract meaning or perform external finance actions.",
        ],
        metricKey: parsed.metricKey,
        policyPageKey: policyPage.pageKey,
        source: policyPage.source,
        thresholdId: buildThresholdId({
          lineIndex: candidate.index,
          metricKey: parsed.metricKey,
          sourceId: policyPage.source.source.id,
        }),
        thresholdValue: parsed.thresholdValue,
        unit: "percent",
      });
    }
  }

  const dedupedFacts = dedupeFacts(facts);
  const conflictingMetricKeys = findConflictingMetricKeys(dedupedFacts);

  for (const metricKey of conflictingMetricKeys) {
    issues.push({
      evidencePath: `thresholdFacts[${metricKey}]`,
      summary: `Multiple conflicting exact threshold facts were found for ${metricKey}; F6E will not infer which one controls.`,
    });
  }

  return {
    conflictingMetricKeys,
    facts: dedupedFacts,
    issues: dedupeExtractionIssues(issues),
  };
}

function parseThresholdLine(line: string):
  | {
      status: "ok";
      comparator: ThresholdComparator;
      metricKey: SupportedMetricKey;
      thresholdValue: number;
      unit: "percent";
    }
  | { status: "malformed" }
  | { status: "unsupported_metric"; metricKey: string }
  | { status: "unsupported_unit"; unit: string } {
  const match =
    /^Pocket CFO threshold:\s+([a-z_]+)\s*(<=|<|>=|>)\s*([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z]+)$/u.exec(
      line.trim(),
    );

  if (!match?.[1] || !match[2] || !match[3] || !match[4]) {
    return { status: "malformed" };
  }

  if (!isSupportedMetricKey(match[1])) {
    return { status: "unsupported_metric", metricKey: match[1] };
  }

  const unit = match[4].toLowerCase();

  if (unit !== "percent") {
    return { status: "unsupported_unit", unit: match[4] };
  }

  return {
    status: "ok",
    comparator: match[2] as ThresholdComparator,
    metricKey: match[1],
    thresholdValue: Number(match[3]),
    unit: "percent",
  };
}

function isSupportedMetricKey(value: string): value is SupportedMetricKey {
  return SUPPORTED_METRIC_KEYS.includes(value as SupportedMetricKey);
}

function readThresholdCandidateLines(pageState: PolicyCovenantThresholdPageState) {
  const lines: Array<{ index: number; line: string; path: string }> = [];
  const seen = new Set<string>();
  const pushLine = (line: string, path: string) => {
    const normalized = normalizeThresholdCandidateLine(line);

    if (!normalized.startsWith("Pocket CFO threshold:")) {
      return;
    }

    const key = `${path}:${normalized}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    lines.push({
      index: lines.length + 1,
      line: normalized,
      path,
    });
  };

  for (const [index, line] of splitLines(
    pageState.source.latestExtract?.extractedText ?? "",
  ).entries()) {
    pushLine(
      line,
      `policyExtracts[${pageState.source.source.id}].extractedText[${index + 1}]`,
    );
  }

  for (const [index, line] of splitLines(
    pageState.source.latestExtract?.renderedMarkdown ?? "",
  ).entries()) {
    pushLine(
      line,
      `policyExtracts[${pageState.source.source.id}].renderedMarkdown[${index + 1}]`,
    );
  }

  for (const [index, block] of (
    pageState.source.latestExtract?.excerptBlocks ?? []
  ).entries()) {
    pushLine(
      block.text,
      `policyExtracts[${pageState.source.source.id}].excerptBlocks[${index + 1}]`,
    );
  }

  for (const [index, line] of splitLines(
    pageState.page?.page.markdownBody ?? "",
  ).entries()) {
    pushLine(
      line,
      `policyPages[${pageState.pageKey}].markdownBody[${index + 1}]`,
    );
  }

  return lines;
}

function normalizeThresholdCandidateLine(line: string) {
  return line.trim().replace(/^-\s+/u, "");
}

function splitLines(value: string) {
  return value.split(/\r?\n/u).map((line) => line.trim());
}

function dedupeFacts(facts: ThresholdFact[]) {
  const byKey = new Map<string, ThresholdFact>();

  for (const fact of facts) {
    const key = [
      fact.source.source.id,
      fact.metricKey,
      fact.comparator,
      fact.thresholdValue,
      fact.unit,
    ].join(":");

    if (!byKey.has(key)) {
      byKey.set(key, fact);
    }
  }

  return [...byKey.values()];
}

function dedupeExtractionIssues(issues: ThresholdExtractionIssue[]) {
  const bySummary = new Map<string, ThresholdExtractionIssue>();

  for (const issue of issues) {
    if (!bySummary.has(issue.summary)) {
      bySummary.set(issue.summary, issue);
    }
  }

  return [...bySummary.values()];
}

function findConflictingMetricKeys(facts: ThresholdFact[]) {
  const signaturesByMetric = new Map<SupportedMetricKey, Set<string>>();

  for (const fact of facts) {
    const signatures = signaturesByMetric.get(fact.metricKey) ?? new Set<string>();
    signatures.add(`${fact.comparator}:${fact.thresholdValue}:${fact.unit}`);
    signaturesByMetric.set(fact.metricKey, signatures);
  }

  return new Set(
    [...signaturesByMetric.entries()]
      .filter(([, signatures]) => signatures.size > 1)
      .map(([metricKey]) => metricKey),
  );
}

function buildThresholdId(input: {
  lineIndex: number;
  metricKey: SupportedMetricKey;
  sourceId: string;
}) {
  return `${input.sourceId}:${input.metricKey}:${input.lineIndex}`;
}
