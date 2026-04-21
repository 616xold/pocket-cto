import type {
  ApprovalRecord,
  MissionApprovalCard,
  ArtifactRecord,
  MissionApprovalSummary,
  MissionArtifactSummary,
  MissionDetailView,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { isFinanceDiscoveryQuestionKind } from "@pocket-cto/domain";
import { buildMissionApprovalCards } from "../approvals/card-formatter";
import { readMissionDiscoveryAnswer } from "./discovery-answer-view";
import { readProofBundleManifest } from "./repository-mappers";
import { readMissionReportingView } from "../reporting/artifact";
import { buildReportingCirculationReadinessViewFromProofBundle } from "../reporting/circulation-readiness";
import { buildReportingPublicationViewFromProofBundle } from "../reporting/publication";
import { buildReportingReleaseRecordViewFromProofBundle } from "../reporting/release-record";
import { buildReportingReleaseReadinessViewFromProofBundle } from "../reporting/release-readiness";

const ARTIFACT_SUMMARY_MAX_LENGTH = 180;

export function buildMissionDetailView(input: {
  approvals: ApprovalRecord[];
  artifacts: ArtifactRecord[];
  liveControl: MissionDetailView["liveControl"];
  mission: MissionRecord;
  proofBundle: ProofBundleManifest;
  tasks: MissionTaskRecord[];
}): MissionDetailView {
  const proofBundle = normalizeProofBundle(input.proofBundle);

  return {
    mission: input.mission,
    tasks: input.tasks,
    proofBundle,
    discoveryAnswer: readMissionDiscoveryAnswer(input.artifacts),
    reporting: readMissionReportingView({
      artifacts: input.artifacts,
      proofBundle,
    }),
    approvals: input.approvals.map(summarizeApproval),
    approvalCards: summarizeApprovalCards(input),
    artifacts: input.artifacts.map(summarizeArtifact),
    liveControl: input.liveControl,
  };
}

function summarizeApproval(approval: ApprovalRecord): MissionApprovalSummary {
  return {
    id: approval.id,
    kind: approval.kind,
    status: approval.status,
    requestedBy: approval.requestedBy,
    resolvedBy: approval.resolvedBy,
    rationale: approval.rationale,
    createdAt: approval.createdAt,
    updatedAt: approval.updatedAt,
  };
}

function summarizeApprovalCards(input: {
  approvals: ApprovalRecord[];
  mission: MissionRecord;
  proofBundle: ProofBundleManifest;
  tasks: MissionTaskRecord[];
}): MissionApprovalCard[] {
  return buildMissionApprovalCards({
    approvals: input.approvals,
    mission: input.mission,
    proofBundle: input.proofBundle,
    tasks: input.tasks,
  });
}

function summarizeArtifact(artifact: ArtifactRecord): MissionArtifactSummary {
  return {
    id: artifact.id,
    kind: artifact.kind,
    taskId: artifact.taskId,
    uri: artifact.uri,
    createdAt: artifact.createdAt,
    summary: readArtifactSummary(artifact),
  };
}

function readArtifactSummary(artifact: ArtifactRecord) {
  const metadataSummary =
    typeof artifact.metadata.summary === "string"
      ? artifact.metadata.summary.trim()
      : null;

  if (metadataSummary) {
    return truncate(metadataSummary);
  }

  if (artifact.kind === "proof_bundle_manifest") {
    const manifest = readProofBundleManifest(artifact.metadata);

    if (!manifest) {
      return "Proof bundle manifest persisted.";
    }

    if (isFinanceProofBundle(manifest)) {
      if (manifest.status === "ready") {
        return `Finance proof bundle ready with ${manifest.artifacts.length} linked artifacts for ${manifest.companyKey ?? "the target company"}.`;
      }

      if (manifest.status === "failed") {
        return `Finance proof bundle failed with ${manifest.evidenceCompleteness.missingArtifactKinds.length} missing final-package artifacts.`;
      }

      if (manifest.status === "incomplete") {
        return `Finance proof bundle incomplete: ${manifest.evidenceCompleteness.missingArtifactKinds.join(", ") || "final evidence still pending"}.`;
      }

      return "Finance proof bundle placeholder manifest persisted.";
    }

    if (manifest.status === "ready") {
      return `Proof bundle ready with ${manifest.artifacts.length} linked artifacts for ${manifest.targetRepoFullName ?? "the target repo"}.`;
    }

    if (manifest.status === "failed") {
      return `Proof bundle failed with ${manifest.evidenceCompleteness.missingArtifactKinds.length} missing final-package artifacts.`;
    }

    if (manifest.status === "incomplete") {
      return `Proof bundle incomplete: ${manifest.evidenceCompleteness.missingArtifactKinds.join(", ") || "final evidence still pending"}.`;
    }

    return "Proof bundle placeholder manifest persisted.";
  }

  const body =
    typeof artifact.metadata.body === "string" ? artifact.metadata.body : null;
  const firstMeaningfulLine = body
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => Boolean(line) && !line.startsWith("#"));

  return firstMeaningfulLine ? truncate(firstMeaningfulLine) : null;
}

function truncate(value: string) {
  if (value.length <= ARTIFACT_SUMMARY_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, ARTIFACT_SUMMARY_MAX_LENGTH - 3).trimEnd()}...`;
}

function isFinanceProofBundle(manifest: ProofBundleManifest) {
  return (
    manifest.reportKind === null &&
    (manifest.companyKey !== null ||
      isFinanceDiscoveryQuestionKind(manifest.questionKind))
  );
}

function normalizeProofBundle(
  proofBundle: ProofBundleManifest,
): ProofBundleManifest {
  const reportPublication =
    buildReportingPublicationViewFromProofBundle({
      evidenceCompleteness: proofBundle.evidenceCompleteness,
      reportKind: proofBundle.reportKind,
      reportPublication: proofBundle.reportPublication,
    }) ?? null;

  return {
    ...proofBundle,
    reportPublication,
    circulationReadiness:
      buildReportingCirculationReadinessViewFromProofBundle({
        circulationReadiness: proofBundle.circulationReadiness,
        evidenceCompleteness: proofBundle.evidenceCompleteness,
        reportKind: proofBundle.reportKind,
      }) ?? null,
    releaseRecord:
      buildReportingReleaseRecordViewFromProofBundle({
        evidenceCompleteness: proofBundle.evidenceCompleteness,
        releaseReadiness: proofBundle.releaseReadiness,
        releaseRecord: proofBundle.releaseRecord,
        reportKind: proofBundle.reportKind,
      }) ?? null,
    releaseReadiness:
      buildReportingReleaseReadinessViewFromProofBundle({
        evidenceCompleteness: proofBundle.evidenceCompleteness,
        releaseReadiness: proofBundle.releaseReadiness,
        reportKind: proofBundle.reportKind,
      }) ?? null,
  };
}
