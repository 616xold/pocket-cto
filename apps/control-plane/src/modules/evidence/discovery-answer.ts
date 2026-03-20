import type {
  ArtifactRecord,
  DiscoveryAnswerArtifactMetadata,
  MissionRecord,
  MissionTaskRecord,
  TwinRepositoryBlastRadiusQueryResult,
} from "@pocket-cto/domain";
import { DiscoveryAnswerArtifactMetadataSchema } from "@pocket-cto/domain";
import type { EvidenceArtifactDraft } from "./service";

export function buildDiscoveryAnswerArtifact(input: {
  mission: MissionRecord;
  result: TwinRepositoryBlastRadiusQueryResult;
  task: MissionTaskRecord;
}): EvidenceArtifactDraft {
  const metadata = buildDiscoveryAnswerArtifactMetadata(input.result);

  return {
    missionId: input.mission.id,
    taskId: input.task.id,
    kind: "discovery_answer",
    uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/discovery-answer`,
    mimeType: "application/json",
    sha256: null,
    metadata,
  };
}

export function buildDiscoveryAnswerArtifactMetadata(
  result: TwinRepositoryBlastRadiusQueryResult,
): DiscoveryAnswerArtifactMetadata {
  return DiscoveryAnswerArtifactMetadataSchema.parse({
    source: "stored_twin_blast_radius_query",
    summary: result.answerSummary,
    repoFullName: result.repository.fullName,
    questionKind: result.queryEcho.questionKind,
    changedPaths: result.queryEcho.changedPaths,
    answerSummary: result.answerSummary,
    impactedDirectories: result.impactedDirectories,
    impactedManifests: result.impactedManifests,
    ownersByTarget: result.ownersByTarget,
    relatedTestSuites: result.relatedTestSuites,
    relatedMappedCiJobs: result.relatedMappedCiJobs,
    freshness: result.freshness,
    freshnessRollup: result.freshness.rollup,
    limitations: result.limitations,
  });
}

export function readDiscoveryAnswerArtifactMetadata(
  artifact: Pick<ArtifactRecord, "kind" | "metadata"> | null | undefined,
) {
  if (!artifact || artifact.kind !== "discovery_answer") {
    return null;
  }

  const parsed = DiscoveryAnswerArtifactMetadataSchema.safeParse(artifact.metadata);
  return parsed.success ? parsed.data : null;
}
