import { readFinanceDiscoveryQuestionKindLabel } from "@pocket-cto/domain";
import type {
  CompiledLenderUpdateArtifacts,
  SourceReportingBundle,
} from "./types";

export function compileLenderUpdateArtifacts(
  source: SourceReportingBundle,
): CompiledLenderUpdateArtifacts {
  const financeMemo = source.sourceReportingView.financeMemo;
  const updateSummary = buildUpdateSummary(source);

  return {
    reportKind: "lender_update",
    lenderUpdate: {
      source: "stored_reporting_evidence",
      summary: updateSummary,
      reportKind: "lender_update",
      draftStatus: "draft_only",
      sourceReportingMissionId: source.sourceReportingMission.id,
      sourceDiscoveryMissionId: source.sourceReportingView.sourceDiscoveryMissionId,
      companyKey: financeMemo.companyKey,
      questionKind: financeMemo.questionKind,
      policySourceId: financeMemo.policySourceId,
      policySourceScope: financeMemo.policySourceScope,
      updateSummary,
      freshnessSummary: financeMemo.freshnessSummary,
      limitationsSummary: financeMemo.limitationsSummary,
      relatedRoutePaths: financeMemo.relatedRoutePaths,
      relatedWikiPageKeys: financeMemo.relatedWikiPageKeys,
      sourceFinanceMemo: {
        artifactId: source.sourceFinanceMemoArtifactId,
        kind: "finance_memo",
      },
      sourceEvidenceAppendix: {
        artifactId: source.sourceEvidenceAppendixArtifactId,
        kind: "evidence_appendix",
      },
      bodyMarkdown: buildLenderUpdateMarkdown(source),
    },
  };
}

function buildLenderUpdateMarkdown(source: SourceReportingBundle) {
  const financeMemo = source.sourceReportingView.financeMemo;
  const evidenceAppendix = source.sourceReportingView.evidenceAppendix;
  const questionKindLabel = financeMemo.questionKind
    ? readFinanceDiscoveryQuestionKindLabel(financeMemo.questionKind)
    : null;
  const lines = [
    "# Draft Lender Update",
    "",
    "## Draft Review Posture",
    "",
    "- Status: draft_only",
    "- Report kind: lender_update",
    `- Source reporting mission: ${source.sourceReportingMission.id}`,
    `- Source reporting proof bundle status: ${source.sourceProofBundle.status}`,
    `- Source discovery mission: ${source.sourceReportingView.sourceDiscoveryMissionId}`,
    `- Linked finance memo artifact: ${source.sourceFinanceMemoArtifactId}`,
    `- Linked evidence appendix artifact: ${source.sourceEvidenceAppendixArtifactId}`,
    `- Company: ${financeMemo.companyKey ?? "Not recorded"}`,
  ];

  if (questionKindLabel) {
    lines.push(`- Source question kind: ${questionKindLabel}`);
  }

  if (financeMemo.policySourceId) {
    lines.push(`- Policy source scope: ${financeMemo.policySourceId}`);
  }

  lines.push(
    "",
    "## Update Summary",
    "",
    buildUpdateSummary(source),
    "",
    "## Freshness Summary",
    "",
    financeMemo.freshnessSummary,
    "",
    "## Limitations Summary",
    "",
    financeMemo.limitationsSummary,
    "",
    "## Related Route Paths",
    "",
    ...renderCodeList(financeMemo.relatedRoutePaths),
    "",
    "## Related CFO Wiki Page Keys",
    "",
    ...renderCodeList(financeMemo.relatedWikiPageKeys),
    "",
    "## Linked Evidence Appendix Posture",
    "",
    `- Appendix summary: ${evidenceAppendix.appendixSummary}`,
    `- Appendix freshness: ${evidenceAppendix.freshnessSummary}`,
    `- Appendix limitations summary: ${evidenceAppendix.limitationsSummary}`,
    `- Appendix remains stored on source reporting mission ${source.sourceReportingMission.id}.`,
    "",
    "## Source Finance Memo Draft",
    "",
    financeMemo.bodyMarkdown,
  );

  return lines.join("\n");
}

function buildUpdateSummary(source: SourceReportingBundle) {
  const financeMemo = source.sourceReportingView.financeMemo;
  const companySegment = financeMemo.companyKey ?? "the scoped company";
  const questionSegment = financeMemo.questionKind
    ? readFinanceDiscoveryQuestionKindLabel(financeMemo.questionKind).toLowerCase()
    : "finance";

  return `Draft lender update for ${companySegment} from the completed ${questionSegment} reporting mission. ${financeMemo.memoSummary}`;
}

function renderCodeList(items: string[]) {
  if (items.length === 0) {
    return ["- None recorded"];
  }

  return items.map((item) => `- \`${item}\``);
}
