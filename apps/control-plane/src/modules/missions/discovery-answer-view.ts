import type {
  ArtifactRecord,
  DiscoveryAnswerArtifactMetadata,
} from "@pocket-cto/domain";
import { readDiscoveryAnswerArtifactMetadata } from "../evidence/discovery-answer";

export function readMissionDiscoveryAnswer(
  artifacts: ArtifactRecord[],
): DiscoveryAnswerArtifactMetadata | null {
  const latestDiscoveryAnswerArtifact =
    [...artifacts]
      .filter((artifact) => artifact.kind === "discovery_answer")
      .sort(
        (left, right) =>
          right.createdAt.localeCompare(left.createdAt) ||
          right.id.localeCompare(left.id),
      )[0] ?? null;

  return readDiscoveryAnswerArtifactMetadata(latestDiscoveryAnswerArtifact);
}
