import type {
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { EvidenceArtifactDraft, EvidenceService } from "./service";

export type PreparedPullRequestLinkEvidence = {
  artifactDraft: EvidenceArtifactDraft;
  pr: {
    branchName: string;
    draft: boolean;
    prNumber: number;
    repoFullName: string;
  };
};

type PullRequestLinkDeps = {
  evidenceService: Pick<
    EvidenceService,
    "attachPullRequestArtifactToProofBundle" | "buildPullRequestArtifact"
  >;
  missionRepository: Pick<
    MissionRepository,
    | "saveArtifact"
    | "upsertProofBundle"
  >;
  replayService: Pick<ReplayService, "append">;
};

export function preparePullRequestLinkEvidence(input: {
  evidenceService: Pick<EvidenceService, "buildPullRequestArtifact">;
  mission: MissionRecord;
  publishedPullRequest: {
    baseBranch: string;
    branchName: string;
    commitMessage: string;
    commitSha: string;
    draft: boolean;
    headBranch: string;
    prBody: string;
    prNumber: number;
    prTitle: string;
    prUrl: string;
    publishedAt: string;
    repoFullName: string;
  };
  task: MissionTaskRecord;
}): PreparedPullRequestLinkEvidence | null {
  if (input.task.role !== "executor") {
    return null;
  }

  return {
    artifactDraft: input.evidenceService.buildPullRequestArtifact({
      mission: input.mission,
      pr: input.publishedPullRequest,
      task: input.task,
    }),
    pr: {
      branchName: input.publishedPullRequest.branchName,
      draft: input.publishedPullRequest.draft,
      prNumber: input.publishedPullRequest.prNumber,
      repoFullName: input.publishedPullRequest.repoFullName,
    },
  };
}

export async function persistPullRequestLinkEvidence(input: {
  deps: PullRequestLinkDeps;
  preparedEvidence: PreparedPullRequestLinkEvidence;
  proofBundle: ProofBundleManifest | null;
  session: PersistenceSession;
  task: MissionTaskRecord;
}): Promise<void> {
  if (input.task.role !== "executor") {
    return;
  }

  const artifact = await input.deps.missionRepository.saveArtifact(
    input.preparedEvidence.artifactDraft,
    input.session,
  );

  await input.deps.replayService.append(
    {
      missionId: input.task.missionId,
      taskId: input.task.id,
      type: "artifact.created",
      payload: {
        artifactId: artifact.id,
        kind: artifact.kind,
      },
    },
    input.session,
  );

  if (input.proofBundle) {
    await input.deps.missionRepository.upsertProofBundle(
      input.deps.evidenceService.attachPullRequestArtifactToProofBundle(
        input.proofBundle,
        {
          artifactId: artifact.id,
          pr: input.preparedEvidence.pr,
          task: input.task,
        },
      ),
      input.session,
    );
  }
}
