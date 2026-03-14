import type {
  ApprovalRecord,
  ArtifactRecord,
  MissionApprovalSummary,
  MissionArtifactSummary,
  MissionDetailView,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { readProofBundleManifest } from "./repository-mappers";

const ARTIFACT_SUMMARY_MAX_LENGTH = 180;

export function buildMissionDetailView(input: {
  approvals: ApprovalRecord[];
  artifacts: ArtifactRecord[];
  liveControl: MissionDetailView["liveControl"];
  mission: MissionRecord;
  proofBundle: ProofBundleManifest;
  tasks: MissionTaskRecord[];
}): MissionDetailView {
  return {
    mission: input.mission,
    tasks: input.tasks,
    proofBundle: input.proofBundle,
    approvals: input.approvals.map(summarizeApproval),
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

    return manifest.status === "ready"
      ? `Proof bundle ready with ${manifest.artifactIds.length} linked artifacts.`
      : "Proof bundle placeholder manifest persisted.";
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
