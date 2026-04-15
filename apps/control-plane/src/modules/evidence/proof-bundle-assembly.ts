import type {
  ApprovalRecord,
  ArtifactKind,
  ArtifactRecord,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
  ProofBundleRefreshTrigger,
  ProofBundleStatus,
} from "@pocket-cto/domain";
import {
  ProofBundleManifestSchema,
  isFinanceDiscoveryQuestionKind,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { ApprovalRepository } from "../approvals/repository";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import {
  deriveProofBundleAssemblyFacts,
  type ProofBundleAssemblyFacts,
} from "./proof-bundle-summary";
import { truncate } from "./text";

const BUILD_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = [
  "plan",
  "diff_summary",
  "test_report",
  "pr_link",
];
const DISCOVERY_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = ["discovery_answer"];

const SUMMARY_MAX_LENGTH = 240;

type ProofBundleAssemblyDeps = {
  approvalRepository: Pick<ApprovalRepository, "listApprovalsByMissionId">;
  missionRepository: Pick<
    MissionRepository,
    | "getMissionById"
    | "getProofBundleByMissionId"
    | "getTasksByMissionId"
    | "listArtifactsByMissionId"
    | "saveProofBundle"
    | "upsertProofBundle"
  >;
  replayService: Pick<ReplayService, "append" | "countByMissionId">;
};

export class ProofBundleAssemblyService {
  constructor(private readonly deps: ProofBundleAssemblyDeps) {}

  async refreshProofBundle(input: {
    missionId: string;
    session?: PersistenceSession;
    trigger: ProofBundleRefreshTrigger;
  }): Promise<ProofBundleManifest> {
    const mission = await this.deps.missionRepository.getMissionById(
      input.missionId,
      input.session,
    );

    if (!mission) {
      throw new Error(`Mission ${input.missionId} not found for proof-bundle refresh`);
    }

    const tasks = await this.deps.missionRepository.getTasksByMissionId(
      input.missionId,
      input.session,
    );
    const existingBundle =
      await this.deps.missionRepository.getProofBundleByMissionId(
        input.missionId,
        input.session,
      );
    const artifacts = await this.deps.missionRepository.listArtifactsByMissionId(
      input.missionId,
      input.session,
    );
    const approvals = await this.deps.approvalRepository.listApprovalsByMissionId(
      input.missionId,
      input.session,
    );
    const replayEventCount = await this.deps.replayService.countByMissionId(
      input.missionId,
      input.session,
    );

    const currentManifest = assembleProofBundleManifest({
      approvals,
      existingBundle,
      mission,
      replayEventCount,
      tasks,
      artifacts,
    });

    if (existingBundle && proofBundleManifestEquals(existingBundle, currentManifest)) {
      return existingBundle;
    }

    const nextManifest = assembleProofBundleManifest({
      approvals,
      artifacts,
      existingBundle,
      mission,
      replayEventCount: replayEventCount + 1,
      tasks,
    });

    if (!existingBundle) {
      const artifact = await this.deps.missionRepository.saveProofBundle(
        nextManifest,
        input.session,
      );

      await this.deps.replayService.append(
        {
          missionId: input.missionId,
          type: "artifact.created",
          payload: {
            artifactId: artifact.id,
            kind: artifact.kind,
          },
        },
        input.session,
      );

      return nextManifest;
    }

    await this.deps.missionRepository.upsertProofBundle(nextManifest, input.session);
    await this.deps.replayService.append(
      {
        missionId: input.missionId,
        type: "proof_bundle.refreshed",
        payload: {
          artifactCount: nextManifest.artifacts.length,
          missionId: input.missionId,
          missingArtifactKinds: nextManifest.evidenceCompleteness.missingArtifactKinds,
          status: nextManifest.status,
          trigger: input.trigger,
        },
      },
      input.session,
    );

    return nextManifest;
  }
}

export function assembleProofBundleManifest(input: {
  approvals: ApprovalRecord[];
  artifacts: ArtifactRecord[];
  existingBundle: ProofBundleManifest | null;
  mission: MissionRecord;
  replayEventCount: number;
  tasks: MissionTaskRecord[];
}): ProofBundleManifest {
  const facts = deriveProofBundleAssemblyFacts({
    approvals: input.approvals,
    artifacts: input.artifacts,
    existingBundle: input.existingBundle,
    mission: input.mission,
    tasks: input.tasks,
  });
  const evidenceCompleteness = buildEvidenceCompleteness(facts);
  const status = buildProofBundleStatus({
    evidenceCompleteness,
    facts,
    mission: input.mission,
  });

  return ProofBundleManifestSchema.parse({
    missionId: input.mission.id,
    missionTitle: input.mission.title,
    objective: input.mission.objective,
    companyKey: facts.companyKey,
    questionKind: facts.questionKind,
    answerSummary: facts.discoveryAnswerSummary ?? "",
    freshnessState: facts.freshnessState,
    freshnessSummary: facts.freshnessSummary ?? "",
    limitationsSummary: facts.limitationsSummary ?? "",
    relatedRoutePaths: facts.relatedRoutePaths,
    relatedWikiPageKeys: facts.relatedWikiPageKeys,
    targetRepoFullName: facts.targetRepoFullName,
    branchName: facts.branchName,
    pullRequestNumber: facts.pullRequestNumber,
    pullRequestUrl: facts.pullRequestUrl,
    changeSummary: buildChangeSummary(status, facts),
    validationSummary: buildValidationSummary(status, facts),
    verificationSummary: buildVerificationSummary(status, facts),
    riskSummary: buildRiskSummary(status, facts),
    rollbackSummary: buildRollbackSummary(status, facts),
    latestApproval: facts.latestApproval,
    evidenceCompleteness,
    decisionTrace: facts.decisionTrace,
    artifactIds: facts.artifactIds,
    artifacts: facts.artifacts,
    replayEventCount: input.replayEventCount,
    timestamps: facts.timestamps,
    status,
  });
}

function buildEvidenceCompleteness(facts: ProofBundleAssemblyFacts) {
  const expectedArtifactKinds = readExpectedArtifactKinds(facts);
  const presentArtifactKinds = expectedArtifactKinds.filter((kind) =>
    facts.presentArtifactKinds.includes(kind),
  );
  const missingArtifactKinds = expectedArtifactKinds.filter(
    (kind) => !presentArtifactKinds.includes(kind),
  );
  const notes = missingArtifactKinds.map((kind) => readMissingArtifactNote(kind));

  if (facts.latestApproval?.status === "pending") {
    notes.push("A runtime approval is still pending.");
  }

  if (
    facts.latestApproval &&
    ["declined", "cancelled", "expired"].includes(facts.latestApproval.status)
  ) {
    notes.push("The latest approval did not resolve to a shippable posture.");
  }

  return {
    status:
      presentArtifactKinds.length === 0
        ? "missing"
        : missingArtifactKinds.length === 0
          ? "complete"
          : "partial",
    expectedArtifactKinds,
    presentArtifactKinds,
    missingArtifactKinds,
    notes,
  } satisfies ProofBundleManifest["evidenceCompleteness"];
}

function buildProofBundleStatus(input: {
  evidenceCompleteness: ProofBundleManifest["evidenceCompleteness"];
  facts: ProofBundleAssemblyFacts;
  mission: MissionRecord;
}): ProofBundleStatus {
  const hasTaskFailure = isDiscoveryMission(input.mission)
    ? input.facts.latestScoutTask?.status === "failed" ||
      input.facts.latestScoutTask?.status === "cancelled"
    : input.facts.latestPlannerTask?.status === "failed" ||
      input.facts.latestExecutorTask?.status === "failed" ||
      input.facts.latestExecutorTask?.status === "cancelled";
  const hasMissionFailure = ["failed", "cancelled"].includes(input.mission.status);
  const hasRejectedApproval =
    input.facts.latestApproval !== null &&
    ["declined", "cancelled", "expired"].includes(input.facts.latestApproval.status);
  const hasPendingApproval = input.facts.latestApproval?.status === "pending";
  const hasMeaningfulEvidence =
    input.facts.artifacts.length > 0 || input.facts.latestApproval !== null;
  const hasReadyArtifacts =
    input.evidenceCompleteness.missingArtifactKinds.length === 0 &&
    (isDiscoveryMission(input.mission)
      ? input.facts.latestScoutTask?.status === "succeeded"
      : input.facts.latestExecutorTask?.status === "succeeded");

  if (hasTaskFailure || hasMissionFailure || hasRejectedApproval) {
    return "failed";
  }

  if (!hasMeaningfulEvidence) {
    return "placeholder";
  }

  if (hasReadyArtifacts && !hasPendingApproval) {
    return "ready";
  }

  return "incomplete";
}

function buildChangeSummary(
  status: ProofBundleStatus,
  facts: ProofBundleAssemblyFacts,
) {
  if (facts.changeSummary) {
    return facts.changeSummary;
  }

  if (isFinanceDiscoveryFacts(facts) && facts.latestScoutTask) {
    if (status === "failed" && facts.latestScoutTask.summary) {
      return truncate(facts.latestScoutTask.summary, SUMMARY_MAX_LENGTH);
    }

    return "Finance discovery execution is still pending a stored answer artifact.";
  }

  if (facts.missionType === "discovery" && facts.latestScoutTask) {
    if (status === "failed" && facts.latestScoutTask.summary) {
      return truncate(facts.latestScoutTask.summary, SUMMARY_MAX_LENGTH);
    }

    return "Discovery execution is still pending a stored answer artifact.";
  }

  if (status === "failed" && facts.latestExecutorTask?.summary) {
    return truncate(facts.latestExecutorTask.summary, SUMMARY_MAX_LENGTH);
  }

  if (facts.latestPlannerTask) {
    return "Planner evidence is persisted, but executor change evidence is not complete yet.";
  }

  return "";
}

function buildValidationSummary(
  status: ProofBundleStatus,
  facts: ProofBundleAssemblyFacts,
) {
  if (facts.validationSummary) {
    return facts.validationSummary;
  }

  if (isFinanceDiscoveryFacts(facts) && facts.latestScoutTask) {
    if (status === "ready") {
      return "Finance discovery answer was assembled deterministically from stored Finance Twin and CFO Wiki state without running the Codex runtime.";
    }

    if (status === "incomplete") {
      return "Finance discovery answer evidence is still pending from the stored Finance Twin and CFO Wiki path.";
    }

    if (status === "failed") {
      return "No finance discovery answer could be persisted for this mission.";
    }

    return "";
  }

  if (facts.missionType === "discovery" && facts.latestScoutTask) {
    if (status === "ready") {
      return "Discovery answer was assembled from stored twin state without running the Codex runtime.";
    }

    if (status === "incomplete") {
      return "Discovery answer evidence is still pending from the stored twin query path.";
    }

    if (status === "failed") {
      return "No stored-twin discovery answer could be persisted for this mission.";
    }

    return "";
  }

  if (status === "ready" || status === "incomplete") {
    return "Pending local executor validation evidence.";
  }

  if (status === "failed") {
    return "No passing local executor validation evidence was persisted.";
  }

  return "";
}

function buildVerificationSummary(
  status: ProofBundleStatus,
  facts: ProofBundleAssemblyFacts,
) {
  if (isFinanceDiscoveryFacts(facts) && facts.latestScoutTask) {
    if (status === "ready" && facts.discoveryAnswerSummary) {
      return truncate(
        `${facts.discoveryAnswerSummary} Review the stored freshness, route-backed evidence, and visible limitations before acting on the answer.`,
        SUMMARY_MAX_LENGTH,
      );
    }

    if (status === "failed") {
      return "The stored Finance Twin and CFO Wiki state could not produce a truthful finance discovery answer for this mission.";
    }

    if (status === "incomplete") {
      return "Finance discovery execution has not yet persisted its answer artifact.";
    }

    return "";
  }

  if (facts.missionType === "discovery" && facts.latestScoutTask) {
    if (status === "ready" && facts.discoveryAnswerSummary) {
      return truncate(
        `${facts.discoveryAnswerSummary} Review the stored freshness and limitation details before acting on the answer.`,
        SUMMARY_MAX_LENGTH,
      );
    }

    if (status === "failed") {
      return "The stored twin could not produce a truthful discovery answer for this mission.";
    }

    if (status === "incomplete") {
      return "Discovery execution has not yet persisted its answer artifact.";
    }

    return "";
  }

  if (
    status === "ready" &&
    facts.pullRequestNumber &&
    facts.targetRepoFullName &&
    facts.pullRequestUrl
  ) {
    return truncate(
      `Local executor validation passed and ${facts.pullRequestIsDraft ? "draft " : ""}PR #${facts.pullRequestNumber} for ${facts.targetRepoFullName} is linked for operator review.`,
      SUMMARY_MAX_LENGTH,
    );
  }

  if (facts.latestApproval?.status === "pending") {
    return "A runtime approval is still pending, so the proof bundle is not final yet.";
  }

  if (status === "failed") {
    if (facts.validationSummary) {
      return truncate(
        `${facts.validationSummary} This mission is currently non-shippable; inspect the validation and log artifacts before retrying.`,
        SUMMARY_MAX_LENGTH,
      );
    }

    return "The latest mission posture is non-shippable; inspect the validation and log artifacts before retrying.";
  }

  if (facts.validationSummary && !facts.pullRequestUrl) {
    return "Validation evidence is persisted, but GitHub pull request evidence is still missing.";
  }

  if (facts.latestPlannerTask) {
    return "Planner evidence is persisted, but executor validation has not finished yet.";
  }

  return "";
}

function buildRiskSummary(
  status: ProofBundleStatus,
  facts: ProofBundleAssemblyFacts,
) {
  if (facts.riskSummary) {
    return facts.riskSummary;
  }

  if (isFinanceDiscoveryFacts(facts) && facts.latestScoutTask) {
    if (status === "failed") {
      return "The finance discovery answer is currently unavailable; inspect the mission timeline and stored freshness posture before retrying.";
    }

    if (status === "incomplete") {
      return "Finance readiness depends entirely on stored Finance Twin and CFO Wiki state, and one durable answer artifact still needs to be persisted.";
    }

    if (status === "ready") {
      return "The answer is grounded only in stored Finance Twin and CFO Wiki state, so stale, partial, or missing evidence must be weighed before taking follow-up action.";
    }

    return "";
  }

  if (facts.missionType === "discovery" && facts.latestScoutTask) {
    if (status === "failed") {
      return "The discovery answer is currently unavailable; inspect the mission timeline and twin freshness posture before retrying.";
    }

    if (status === "incomplete") {
      return "Discovery readiness depends entirely on stored twin state and one durable answer artifact still being persisted.";
    }

    if (status === "ready") {
      return "The answer is grounded only in stored twin state, so stale or missing slices must be weighed before taking follow-up action.";
    }

    return "";
  }

  if (facts.latestApproval?.status === "pending") {
    return "A gated runtime action is still awaiting operator approval.";
  }

  if (status === "failed") {
    return "The mission is currently non-shippable until the failing executor, approval, or publish step is retried.";
  }

  if (status === "incomplete") {
    return isFinanceDiscoveryFacts(facts)
      ? "The proof bundle is still missing evidence required for a final finance-ready decision."
      : "The proof bundle is still missing evidence required for a final GitHub-ready decision.";
  }

  if (facts.pullRequestUrl) {
    return "Review the linked pull request and validation artifacts before any manual merge or follow-up.";
  }

  return "";
}

function buildRollbackSummary(
  status: ProofBundleStatus,
  facts: ProofBundleAssemblyFacts,
) {
  if (facts.rollbackSummary) {
    return facts.rollbackSummary;
  }

  if (isFinanceDiscoveryFacts(facts) && facts.latestScoutTask) {
    if (status === "failed") {
      return "Safe fallback: refresh the relevant finance-twin slices and CFO Wiki compile truthfully, then retry the finance discovery mission; no code or GitHub changes were produced.";
    }

    if (status === "incomplete") {
      return "Wait for the stored finance discovery answer artifact before relying on this mission for operator follow-up.";
    }

    if (status === "ready") {
      return "No code, branch, pull request, or deploy side effect was produced; retry only if the stored finance evidence needs to be refreshed.";
    }

    return "";
  }

  if (facts.missionType === "discovery" && facts.latestScoutTask) {
    if (status === "failed") {
      return "Safe fallback: refresh the relevant twin slices truthfully, then retry the discovery mission; no code or GitHub changes were produced.";
    }

    if (status === "incomplete") {
      return "Wait for the stored discovery answer artifact before relying on this mission for operator follow-up.";
    }

    if (status === "ready") {
      return "No code, branch, pull request, or deploy side effect was produced; retry only if the stored twin needs fresher evidence.";
    }

    return "";
  }

  if (facts.pullRequestUrl) {
    return "Close or supersede the linked pull request branch before retrying; no automatic merge or deploy has occurred.";
  }

  if (status === "failed") {
    return "Safe fallback: inspect the validation and log artifacts. Retry the blocked planner or executor step after fixing the issue; no merged GitHub change was produced.";
  }

  if (status === "incomplete") {
    return "Wait for the missing evidence before taking manual follow-up on the workspace or branch.";
  }

  return "";
}

function readMissingArtifactNote(kind: ArtifactKind) {
  switch (kind) {
    case "plan":
      return "Planner evidence is missing.";
    case "discovery_answer":
      return "Discovery answer evidence is missing.";
    case "diff_summary":
      return "Change-summary evidence is missing.";
    case "test_report":
      return "Validation evidence is missing.";
    case "pr_link":
      return "GitHub pull request evidence is missing.";
    default:
      return `${kind} evidence is missing.`;
  }
}

function proofBundleManifestEquals(
  left: ProofBundleManifest,
  right: ProofBundleManifest,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isDiscoveryMission(mission: MissionRecord) {
  return mission.type === "discovery";
}

function isFinanceDiscoveryFacts(facts: ProofBundleAssemblyFacts) {
  return (
    facts.companyKey !== null ||
    isFinanceDiscoveryQuestionKind(facts.questionKind)
  );
}

function readExpectedArtifactKinds(facts: ProofBundleAssemblyFacts) {
  return facts.missionType === "discovery"
    ? DISCOVERY_EXPECTED_ARTIFACT_KINDS
    : BUILD_EXPECTED_ARTIFACT_KINDS;
}
