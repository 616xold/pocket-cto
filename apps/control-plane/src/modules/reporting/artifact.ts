import type {
  ArtifactRecord,
  BoardPacketArtifactMetadata,
  DiligencePacketArtifactMetadata,
  EvidenceAppendixArtifactMetadata,
  FinanceMemoArtifactMetadata,
  LenderUpdateArtifactMetadata,
  ProofBundleManifest,
  ReportingMissionView,
} from "@pocket-cto/domain";
import {
  BoardPacketArtifactMetadataSchema,
  DiligencePacketArtifactMetadataSchema,
  EvidenceAppendixArtifactMetadataSchema,
  FinanceMemoArtifactMetadataSchema,
  LenderUpdateArtifactMetadataSchema,
  ReportingMissionViewSchema,
} from "@pocket-cto/domain";
import type { EvidenceArtifactDraft } from "../evidence/service";
import { buildReportingPublicationViewFromProofBundle } from "./publication";

export function buildFinanceMemoArtifact(input: {
  memo: FinanceMemoArtifactMetadata;
  missionId: string;
  taskId: string;
}): EvidenceArtifactDraft {
  return {
    missionId: input.missionId,
    taskId: input.taskId,
    kind: "finance_memo",
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/finance-memo`,
    mimeType: "text/markdown",
    sha256: null,
    metadata: input.memo,
  };
}

export function buildEvidenceAppendixArtifact(input: {
  evidenceAppendix: EvidenceAppendixArtifactMetadata;
  missionId: string;
  taskId: string;
}): EvidenceArtifactDraft {
  return {
    missionId: input.missionId,
    taskId: input.taskId,
    kind: "evidence_appendix",
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/evidence-appendix`,
    mimeType: "text/markdown",
    sha256: null,
    metadata: input.evidenceAppendix,
  };
}

export function buildBoardPacketArtifact(input: {
  boardPacket: BoardPacketArtifactMetadata;
  missionId: string;
  taskId: string;
}): EvidenceArtifactDraft {
  return {
    missionId: input.missionId,
    taskId: input.taskId,
    kind: "board_packet",
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/board-packet`,
    mimeType: "text/markdown",
    sha256: null,
    metadata: input.boardPacket,
  };
}

export function buildLenderUpdateArtifact(input: {
  lenderUpdate: LenderUpdateArtifactMetadata;
  missionId: string;
  taskId: string;
}): EvidenceArtifactDraft {
  return {
    missionId: input.missionId,
    taskId: input.taskId,
    kind: "lender_update",
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/lender-update`,
    mimeType: "text/markdown",
    sha256: null,
    metadata: input.lenderUpdate,
  };
}

export function buildDiligencePacketArtifact(input: {
  diligencePacket: DiligencePacketArtifactMetadata;
  missionId: string;
  taskId: string;
}): EvidenceArtifactDraft {
  return {
    missionId: input.missionId,
    taskId: input.taskId,
    kind: "diligence_packet",
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/diligence-packet`,
    mimeType: "text/markdown",
    sha256: null,
    metadata: input.diligencePacket,
  };
}

export function readFinanceMemoArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "finance_memo") {
    return null;
  }

  const parsed = FinanceMemoArtifactMetadataSchema.safeParse(artifact.metadata);
  return parsed.success ? parsed.data : null;
}

export function readEvidenceAppendixArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "evidence_appendix") {
    return null;
  }

  const parsed = EvidenceAppendixArtifactMetadataSchema.safeParse(
    artifact.metadata,
  );
  return parsed.success ? parsed.data : null;
}

export function readBoardPacketArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "board_packet") {
    return null;
  }

  const parsed = BoardPacketArtifactMetadataSchema.safeParse(artifact.metadata);
  return parsed.success ? parsed.data : null;
}

export function readLenderUpdateArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "lender_update") {
    return null;
  }

  const parsed = LenderUpdateArtifactMetadataSchema.safeParse(artifact.metadata);
  return parsed.success ? parsed.data : null;
}

export function readDiligencePacketArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "diligence_packet") {
    return null;
  }

  const parsed = DiligencePacketArtifactMetadataSchema.safeParse(
    artifact.metadata,
  );
  return parsed.success ? parsed.data : null;
}

export function readMissionReportingView(input: {
  artifacts: ArtifactRecord[];
  proofBundle: ProofBundleManifest;
}): ReportingMissionView | null {
  const diligencePacket = readDiligencePacketArtifactMetadata(
    readLatestArtifactByKind(input.artifacts, "diligence_packet"),
  );
  const lenderUpdate = readLenderUpdateArtifactMetadata(
    readLatestArtifactByKind(input.artifacts, "lender_update"),
  );
  const boardPacket = readBoardPacketArtifactMetadata(
    readLatestArtifactByKind(input.artifacts, "board_packet"),
  );
  const financeMemo = readFinanceMemoArtifactMetadata(
    readLatestArtifactByKind(input.artifacts, "finance_memo"),
  );
  const evidenceAppendix = readEvidenceAppendixArtifactMetadata(
    readLatestArtifactByKind(input.artifacts, "evidence_appendix"),
  );
  const reportKind =
    diligencePacket?.reportKind ??
    lenderUpdate?.reportKind ??
    boardPacket?.reportKind ??
    financeMemo?.reportKind ??
    evidenceAppendix?.reportKind ??
    input.proofBundle.reportKind;
  const sourceReportingMissionId =
    diligencePacket?.sourceReportingMissionId ??
    lenderUpdate?.sourceReportingMissionId ??
    boardPacket?.sourceReportingMissionId ??
    input.proofBundle.sourceReportingMissionId;
  const sourceDiscoveryMissionId =
    diligencePacket?.sourceDiscoveryMissionId ??
    lenderUpdate?.sourceDiscoveryMissionId ??
    boardPacket?.sourceDiscoveryMissionId ??
    financeMemo?.sourceDiscoveryMissionId ??
    evidenceAppendix?.sourceDiscoveryMissionId ??
    input.proofBundle.sourceDiscoveryMissionId;

  if (!reportKind || !sourceDiscoveryMissionId) {
    return null;
  }

  return ReportingMissionViewSchema.parse({
    reportKind,
    draftStatus:
      diligencePacket?.draftStatus ??
      boardPacket?.draftStatus ??
      financeMemo?.draftStatus ??
      evidenceAppendix?.draftStatus ??
      input.proofBundle.reportDraftStatus ??
      "draft_only",
    sourceDiscoveryMissionId,
    sourceReportingMissionId,
    companyKey:
      diligencePacket?.companyKey ??
      lenderUpdate?.companyKey ??
      boardPacket?.companyKey ??
      financeMemo?.companyKey ??
      evidenceAppendix?.companyKey ??
      input.proofBundle.companyKey,
    questionKind:
      diligencePacket?.questionKind ??
      lenderUpdate?.questionKind ??
      boardPacket?.questionKind ??
      financeMemo?.questionKind ??
      evidenceAppendix?.questionKind ??
      input.proofBundle.questionKind,
    policySourceId:
      diligencePacket?.policySourceId ??
      lenderUpdate?.policySourceId ??
      boardPacket?.policySourceId ??
      financeMemo?.policySourceId ??
      evidenceAppendix?.policySourceId ??
      input.proofBundle.policySourceId,
    policySourceScope:
      diligencePacket?.policySourceScope ??
      lenderUpdate?.policySourceScope ??
      boardPacket?.policySourceScope ??
      financeMemo?.policySourceScope ??
      evidenceAppendix?.policySourceScope ??
      input.proofBundle.policySourceScope,
    reportSummary:
      diligencePacket?.packetSummary ??
      lenderUpdate?.updateSummary ??
      boardPacket?.packetSummary ??
      financeMemo?.memoSummary ??
      input.proofBundle.reportSummary ??
      null,
    freshnessSummary:
      diligencePacket?.freshnessSummary ??
      lenderUpdate?.freshnessSummary ??
      boardPacket?.freshnessSummary ??
      financeMemo?.freshnessSummary ??
      evidenceAppendix?.freshnessSummary ??
      input.proofBundle.freshnessSummary ??
      null,
    limitationsSummary:
      diligencePacket?.limitationsSummary ??
      lenderUpdate?.limitationsSummary ??
      boardPacket?.limitationsSummary ??
      financeMemo?.limitationsSummary ??
      evidenceAppendix?.limitationsSummary ??
      input.proofBundle.limitationsSummary ??
      null,
    relatedRoutePaths:
      diligencePacket?.relatedRoutePaths ??
      lenderUpdate?.relatedRoutePaths ??
      boardPacket?.relatedRoutePaths ??
      financeMemo?.relatedRoutePaths ??
      evidenceAppendix?.relatedRoutePaths ??
      input.proofBundle.relatedRoutePaths,
    relatedWikiPageKeys:
      diligencePacket?.relatedWikiPageKeys ??
      lenderUpdate?.relatedWikiPageKeys ??
      boardPacket?.relatedWikiPageKeys ??
      financeMemo?.relatedWikiPageKeys ??
      evidenceAppendix?.relatedWikiPageKeys ??
      input.proofBundle.relatedWikiPageKeys,
    appendixPresent:
      diligencePacket !== null ||
      lenderUpdate !== null ||
      boardPacket !== null ||
      evidenceAppendix !== null ||
      input.proofBundle.appendixPresent,
    financeMemo,
    evidenceAppendix,
    boardPacket,
    lenderUpdate,
    diligencePacket,
    publication:
      reportKind === "finance_memo"
        ? (buildReportingPublicationViewFromProofBundle({
            evidenceCompleteness: input.proofBundle.evidenceCompleteness,
            reportKind: input.proofBundle.reportKind,
            reportPublication: input.proofBundle.reportPublication,
          }) ?? null)
        : null,
  });
}

function readLatestArtifactByKind(
  artifacts: ArtifactRecord[],
  kind: ArtifactRecord["kind"],
) {
  return (
    [...artifacts]
      .filter((artifact) => artifact.kind === kind)
      .sort(
        (left, right) =>
          right.createdAt.localeCompare(left.createdAt) ||
          right.id.localeCompare(left.id),
      )[0] ?? null
  );
}
