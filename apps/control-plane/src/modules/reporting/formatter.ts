import type {
  ReportingSourceArtifactLink,
} from "@pocket-cto/domain";
import {
  readFinanceDiscoveryQuestionKindLabel,
  ReportingDraftStatusSchema,
} from "@pocket-cto/domain";
import type {
  CompiledFinanceMemoArtifacts,
  DiscoveryReportingSourceBundle,
} from "./types";

export function compileFinanceMemoArtifacts(
  source: DiscoveryReportingSourceBundle,
): CompiledFinanceMemoArtifacts {
  const sourceArtifacts = buildSourceArtifacts(source);
  const carriedLimitations = buildCarriedLimitations(source);
  const limitationsSummary = summarizeLimitations(carriedLimitations);
  const relatedRoutePaths = source.discoveryAnswer.relatedRoutes.map(
    (route) => route.routePath,
  );
  const relatedWikiPageKeys = source.discoveryAnswer.relatedWikiPages.map(
    (page) => page.pageKey,
  );
  const reportKind = "finance_memo" as const;
  const draftStatus = ReportingDraftStatusSchema.parse("draft_only");
  const memoSummary = source.discoveryAnswer.answerSummary;
  const freshnessSummary = source.discoveryAnswer.freshnessPosture.reasonSummary;

  return {
    reportKind,
    financeMemo: {
      source: "stored_discovery_evidence",
      summary: memoSummary,
      reportKind,
      draftStatus,
      sourceDiscoveryMissionId: source.sourceDiscoveryMission.id,
      companyKey: source.discoveryAnswer.companyKey,
      questionKind: source.discoveryAnswer.questionKind,
      policySourceId: source.discoveryAnswer.policySourceId,
      policySourceScope: source.discoveryAnswer.policySourceScope,
      memoSummary,
      freshnessSummary,
      limitationsSummary,
      relatedRoutePaths,
      relatedWikiPageKeys,
      sourceArtifacts,
      bodyMarkdown: buildFinanceMemoMarkdown({
        draftStatus,
        freshnessSummary,
        memoSummary,
        relatedRoutePaths,
        relatedWikiPageKeys,
        source,
      }),
    },
    evidenceAppendix: {
      source: "stored_discovery_evidence",
      summary: `Evidence appendix for source discovery mission ${source.sourceDiscoveryMission.id}.`,
      reportKind,
      draftStatus,
      sourceDiscoveryMissionId: source.sourceDiscoveryMission.id,
      companyKey: source.discoveryAnswer.companyKey,
      questionKind: source.discoveryAnswer.questionKind,
      policySourceId: source.discoveryAnswer.policySourceId,
      policySourceScope: source.discoveryAnswer.policySourceScope,
      appendixSummary: `Stored evidence appendix for discovery mission ${source.sourceDiscoveryMission.id}.`,
      freshnessSummary,
      limitationsSummary,
      limitations: carriedLimitations,
      relatedRoutePaths,
      relatedWikiPageKeys,
      sourceArtifacts,
      bodyMarkdown: buildEvidenceAppendixMarkdown({
        carriedLimitations,
        freshnessSummary,
        relatedRoutePaths,
        relatedWikiPageKeys,
        source,
      }),
    },
  };
}

function buildFinanceMemoMarkdown(input: {
  draftStatus: "draft_only";
  freshnessSummary: string;
  memoSummary: string;
  relatedRoutePaths: string[];
  relatedWikiPageKeys: string[];
  source: DiscoveryReportingSourceBundle;
}) {
  const lines = [
    "# Draft Finance Memo",
    "",
    "## Draft Posture",
    "",
    `- Status: ${input.draftStatus}`,
    "- Report kind: finance_memo",
    `- Source discovery mission: ${input.source.sourceDiscoveryMission.id}`,
    `- Company: ${input.source.discoveryAnswer.companyKey}`,
  ];

  if (input.source.discoveryAnswer.questionKind) {
    lines.push(
      `- Source question kind: ${readFinanceDiscoveryQuestionKindLabel(input.source.discoveryAnswer.questionKind)}`,
    );
  }

  if (input.source.discoveryAnswer.policySourceId) {
    lines.push(
      `- Policy source scope: ${input.source.discoveryAnswer.policySourceId}`,
    );
  }

  lines.push(
    "",
    "## Memo Summary",
    "",
    input.memoSummary,
    "",
    "## Freshness Summary",
    "",
    input.freshnessSummary,
    "",
    "## Limitations Summary",
    "",
    summarizeLimitations(buildCarriedLimitations(input.source)),
    "",
    "## Related Route Paths",
    "",
    ...renderCodeList(input.relatedRoutePaths),
    "",
    "## Related CFO Wiki Page Keys",
    "",
    ...renderCodeList(input.relatedWikiPageKeys),
    "",
    "## Source Evidence Notes",
    "",
    `- Discovery answer artifact: ${input.source.discoveryAnswerArtifactId}`,
    `- Source proof bundle artifact: ${input.source.sourceProofBundleArtifactId ?? "Not available"}`,
  );

  return lines.join("\n");
}

function buildEvidenceAppendixMarkdown(input: {
  carriedLimitations: string[];
  freshnessSummary: string;
  relatedRoutePaths: string[];
  relatedWikiPageKeys: string[];
  source: DiscoveryReportingSourceBundle;
}) {
  const sourceProofBundleStatus = input.source.sourceProofBundle?.status ?? "missing";
  const lines = [
    "# Evidence Appendix",
    "",
    "## Source Discovery Lineage",
    "",
    `- Source discovery mission: ${input.source.sourceDiscoveryMission.id}`,
    `- Discovery answer artifact: ${input.source.discoveryAnswerArtifactId}`,
    `- Source proof bundle artifact: ${input.source.sourceProofBundleArtifactId ?? "Not available"}`,
    `- Source proof bundle status: ${sourceProofBundleStatus}`,
    "",
    "## Carried Freshness",
    "",
    input.freshnessSummary,
    "",
    "## Carried Limitations",
    "",
    ...renderBulletList(input.carriedLimitations),
    "",
    "## Related Route Paths",
    "",
    ...renderCodeList(input.relatedRoutePaths),
    "",
    "## Related CFO Wiki Page Keys",
    "",
    ...renderCodeList(input.relatedWikiPageKeys),
    "",
    "## Evidence Sections",
    "",
  ];

  for (const section of input.source.discoveryAnswer.evidenceSections) {
    lines.push(`### ${section.title}`, "");
    lines.push(`- Summary: ${section.summary}`);
    if (section.routePath) {
      lines.push(`- Route path: ${section.routePath}`);
    }
    if (section.pageKey) {
      lines.push(`- Wiki page: ${section.pageKey}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

function buildCarriedLimitations(source: DiscoveryReportingSourceBundle) {
  const limitations = [...source.discoveryAnswer.limitations];

  if (!source.sourceProofBundle) {
    limitations.push(
      "The source discovery proof bundle is missing, so this draft memo compiles from the stored discovery answer plus its persisted route and wiki evidence only.",
    );
    return dedupe(limitations);
  }

  if (source.sourceProofBundle.status !== "ready") {
    const missingKinds =
      source.sourceProofBundle.evidenceCompleteness.missingArtifactKinds.join(", ");
    limitations.push(
      missingKinds.length > 0
        ? `The source discovery proof bundle is ${source.sourceProofBundle.status} with missing evidence kinds: ${missingKinds}.`
        : `The source discovery proof bundle is ${source.sourceProofBundle.status}.`,
    );
  }

  return dedupe(limitations);
}

function buildSourceArtifacts(
  source: DiscoveryReportingSourceBundle,
): ReportingSourceArtifactLink[] {
  const artifacts: ReportingSourceArtifactLink[] = [
    {
      artifactId: source.discoveryAnswerArtifactId,
      kind: "discovery_answer",
    },
  ];

  if (source.sourceProofBundleArtifactId) {
    artifacts.push({
      artifactId: source.sourceProofBundleArtifactId,
      kind: "proof_bundle_manifest",
    });
  }

  return artifacts;
}

function summarizeLimitations(limitations: string[]) {
  if (limitations.length === 0) {
    return "No explicit limitations were recorded.";
  }

  if (limitations.length === 1) {
    return limitations[0]!;
  }

  return `${limitations[0]} ${limitations.length - 1} additional limitation${limitations.length === 2 ? "" : "s"} remain visible.`;
}

function renderBulletList(items: string[]) {
  if (items.length === 0) {
    return ["- None recorded"];
  }

  return items.map((item) => `- ${item}`);
}

function renderCodeList(items: string[]) {
  if (items.length === 0) {
    return ["- None recorded"];
  }

  return items.map((item) => `- \`${item}\``);
}

function dedupe(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}
