import {
  buildCfoWikiFiledPageKey,
  type CfoWikiExportRunRecord,
  type CfoWikiPageRecord,
  type ProofBundleManifest,
  type ReportingFiledArtifactKind,
  type ReportingFiledArtifactView,
  type ReportingPublicationView,
} from "@pocket-cto/domain";
import { ReportingPublicationViewSchema } from "@pocket-cto/domain";

type ReportingPublicationInput = {
  filedEvidenceAppendix: CfoWikiPageRecord | null;
  filedMemo: CfoWikiPageRecord | null;
  latestMarkdownExport: CfoWikiExportRunRecord | null;
  storedDraft: boolean;
};

export function buildReportingPublicationView(
  input: ReportingPublicationInput,
): ReportingPublicationView {
  const filedMemo = toReportingFiledArtifactView("finance_memo", input.filedMemo);
  const filedEvidenceAppendix = toReportingFiledArtifactView(
    "evidence_appendix",
    input.filedEvidenceAppendix,
  );
  const latestRelevantFiledAt = [filedMemo?.filedAt, filedEvidenceAppendix?.filedAt]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.localeCompare(left))[0] ?? null;
  const exportCompletedAt = input.latestMarkdownExport?.completedAt ?? null;
  const includesLatestFiledArtifacts =
    input.latestMarkdownExport?.status === "succeeded" &&
    latestRelevantFiledAt !== null &&
    exportCompletedAt !== null &&
    exportCompletedAt >= latestRelevantFiledAt;

  return ReportingPublicationViewSchema.parse({
    storedDraft: input.storedDraft,
    filedMemo,
    filedEvidenceAppendix,
    latestMarkdownExport: input.latestMarkdownExport
      ? {
          exportRunId: input.latestMarkdownExport.id,
          status: input.latestMarkdownExport.status,
          completedAt: exportCompletedAt,
          includesLatestFiledArtifacts,
        }
      : null,
    summary: buildReportingPublicationSummary({
      filedEvidenceAppendix,
      filedMemo,
      includesLatestFiledArtifacts,
      latestMarkdownExportId: input.latestMarkdownExport?.id ?? null,
      storedDraft: input.storedDraft,
    }),
  });
}

export function buildReportingPublicationViewFromProofBundle(
  input: Pick<
    ProofBundleManifest,
    | "evidenceCompleteness"
    | "reportKind"
    | "reportPublication"
  >,
) {
  if (input.reportKind !== "finance_memo") {
    return null;
  }

  const existing = input.reportPublication;
  const storedDraft =
    input.evidenceCompleteness.presentArtifactKinds.includes("finance_memo") &&
    input.evidenceCompleteness.presentArtifactKinds.includes("evidence_appendix");

  return ReportingPublicationViewSchema.parse({
    storedDraft,
    filedMemo: existing?.filedMemo ?? null,
    filedEvidenceAppendix: existing?.filedEvidenceAppendix ?? null,
    latestMarkdownExport: existing?.latestMarkdownExport ?? null,
    summary: buildReportingPublicationSummary({
      filedEvidenceAppendix: existing?.filedEvidenceAppendix ?? null,
      filedMemo: existing?.filedMemo ?? null,
      includesLatestFiledArtifacts:
        existing?.latestMarkdownExport?.includesLatestFiledArtifacts ?? false,
      latestMarkdownExportId:
        existing?.latestMarkdownExport?.exportRunId ?? null,
      storedDraft,
    }),
  });
}

export function buildReportingFiledPageKey(input: {
  artifactKind: ReportingFiledArtifactKind;
  missionId: string;
}) {
  return buildCfoWikiFiledPageKey(`reporting-${input.missionId}-${input.artifactKind}`);
}

export function buildReportingFiledPageTitle(input: {
  artifactKind: ReportingFiledArtifactKind;
  companyKey: string;
  missionId: string;
}) {
  if (input.artifactKind === "finance_memo") {
    return `Draft finance memo for ${input.companyKey} (${input.missionId})`;
  }

  return `Evidence appendix for ${input.companyKey} draft finance memo (${input.missionId})`;
}

export function buildReportingFiledPageProvenanceSummary(input: {
  artifactKind: ReportingFiledArtifactKind;
  sourceDiscoveryMissionId: string;
  reportingMissionId: string;
}) {
  return [
    "Draft-only reporting artifact filed into the CFO Wiki.",
    `Reporting mission: ${input.reportingMissionId}.`,
    `Source discovery mission: ${input.sourceDiscoveryMissionId}.`,
    `Artifact kind: ${input.artifactKind}.`,
  ].join(" ");
}

function buildReportingPublicationSummary(input: {
  filedEvidenceAppendix: ReportingFiledArtifactView | null;
  filedMemo: ReportingFiledArtifactView | null;
  includesLatestFiledArtifacts: boolean;
  latestMarkdownExportId: string | null;
  storedDraft: boolean;
}) {
  const storedSummary = input.storedDraft
    ? "Draft memo and evidence appendix are stored."
    : "Draft memo and evidence appendix are not fully stored yet.";

  const filingSummary = readFilingSummary({
    filedEvidenceAppendix: input.filedEvidenceAppendix,
    filedMemo: input.filedMemo,
  });
  const exportSummary = readExportSummary({
    includesLatestFiledArtifacts: input.includesLatestFiledArtifacts,
    latestMarkdownExportId: input.latestMarkdownExportId,
  });

  return [storedSummary, filingSummary, exportSummary].join(" ");
}

function readFilingSummary(input: {
  filedEvidenceAppendix: ReportingFiledArtifactView | null;
  filedMemo: ReportingFiledArtifactView | null;
}) {
  if (input.filedMemo && input.filedEvidenceAppendix) {
    return `Both filed pages exist in the CFO Wiki: \`${input.filedMemo.pageKey}\` and \`${input.filedEvidenceAppendix.pageKey}\`.`;
  }

  if (input.filedMemo) {
    return `The memo page is filed at \`${input.filedMemo.pageKey}\`, but the appendix page is not filed yet.`;
  }

  if (input.filedEvidenceAppendix) {
    return `The appendix page is filed at \`${input.filedEvidenceAppendix.pageKey}\`, but the memo page is not filed yet.`;
  }

  return "Neither draft artifact has been filed into the CFO Wiki yet.";
}

function readExportSummary(input: {
  includesLatestFiledArtifacts: boolean;
  latestMarkdownExportId: string | null;
}) {
  if (!input.latestMarkdownExportId) {
    return "No markdown export run has been recorded yet.";
  }

  if (input.includesLatestFiledArtifacts) {
    return `Markdown export run ${input.latestMarkdownExportId} includes the latest filed report pages.`;
  }

  return `Markdown export run ${input.latestMarkdownExportId} exists, but it may predate the latest filed report pages.`;
}

function toReportingFiledArtifactView(
  artifactKind: ReportingFiledArtifactKind,
  page: CfoWikiPageRecord | null,
) {
  if (!page?.filedMetadata) {
    return null;
  }

  return {
    artifactKind,
    pageKey: page.pageKey,
    title: page.title,
    filedAt: page.filedMetadata.filedAt,
    filedBy: page.filedMetadata.filedBy,
    provenanceSummary: page.filedMetadata.provenanceSummary,
  } satisfies ReportingFiledArtifactView;
}
