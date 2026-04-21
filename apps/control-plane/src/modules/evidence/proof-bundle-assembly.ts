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
const FINANCE_MEMO_REPORTING_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = [
  "finance_memo",
  "evidence_appendix",
];
const BOARD_PACKET_REPORTING_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = [
  "board_packet",
];
const DILIGENCE_PACKET_REPORTING_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = [
  "diligence_packet",
];
const LENDER_UPDATE_REPORTING_EXPECTED_ARTIFACT_KINDS: ArtifactKind[] = [
  "lender_update",
];

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
  reportingPublicationReader?: {
    readPublicationFacts(input: {
      artifacts: ArtifactRecord[];
      mission: MissionRecord;
      proofBundle: ProofBundleManifest | null;
    }): Promise<{
      publication: ProofBundleManifest["reportPublication"];
    } | null>;
  };
};

export class ProofBundleAssemblyService {
  constructor(private readonly deps: ProofBundleAssemblyDeps) {}

  async refreshProofBundle(input: {
    details?: {
      reportExportRunId?: string | null;
      reportFiledPageKeys?: string[];
      reportPublicationSummary?: string | null;
    };
    missionId: string;
    session?: PersistenceSession;
    trigger: ProofBundleRefreshTrigger;
  }): Promise<ProofBundleManifest> {
    const mission = await this.deps.missionRepository.getMissionById(
      input.missionId,
      input.session,
    );

    if (!mission) {
      throw new Error(
        `Mission ${input.missionId} not found for proof-bundle refresh`,
      );
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
    const artifacts =
      await this.deps.missionRepository.listArtifactsByMissionId(
        input.missionId,
        input.session,
      );
    const approvals =
      await this.deps.approvalRepository.listApprovalsByMissionId(
        input.missionId,
        input.session,
      );
    const replayEventCount = await this.deps.replayService.countByMissionId(
      input.missionId,
      input.session,
    );
    const reportPublication =
      mission.type === "reporting" && this.deps.reportingPublicationReader
        ? ((
            await this.deps.reportingPublicationReader.readPublicationFacts({
              artifacts,
              mission,
              proofBundle: existingBundle,
            })
          )?.publication ?? null)
        : null;

    const currentManifest = assembleProofBundleManifest({
      approvals,
      existingBundle,
      mission,
      replayEventCount,
      reportPublication,
      tasks,
      artifacts,
    });

    if (
      existingBundle &&
      proofBundleManifestEquals(existingBundle, currentManifest)
    ) {
      return existingBundle;
    }

    const nextManifest = assembleProofBundleManifest({
      approvals,
      artifacts,
      existingBundle,
      mission,
      replayEventCount: replayEventCount + 1,
      reportPublication,
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

    await this.deps.missionRepository.upsertProofBundle(
      nextManifest,
      input.session,
    );
    await this.deps.replayService.append(
      {
        missionId: input.missionId,
        type: "proof_bundle.refreshed",
        payload: {
          artifactCount: nextManifest.artifacts.length,
          missionId: input.missionId,
          missingArtifactKinds:
            nextManifest.evidenceCompleteness.missingArtifactKinds,
          reportExportRunId: input.details?.reportExportRunId ?? null,
          reportFiledPageKeys: input.details?.reportFiledPageKeys ?? [],
          reportPublicationSummary:
            input.details?.reportPublicationSummary ??
            nextManifest.reportPublication?.summary ??
            "",
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
  reportPublication?: ProofBundleManifest["reportPublication"];
  tasks: MissionTaskRecord[];
}): ProofBundleManifest {
  const facts = deriveProofBundleAssemblyFacts({
    approvals: input.approvals,
    artifacts: input.artifacts,
    existingBundle: input.existingBundle,
    mission: input.mission,
    reportPublication: input.reportPublication,
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
    sourceDiscoveryMissionId: facts.sourceDiscoveryMissionId,
    sourceReportingMissionId: facts.sourceReportingMissionId,
    companyKey: facts.companyKey,
    questionKind: facts.questionKind,
    policySourceId: facts.policySourceId,
    policySourceScope: facts.policySourceScope,
    answerSummary: facts.discoveryAnswerSummary ?? "",
    reportKind: facts.reportKind,
    reportDraftStatus: facts.reportDraftStatus,
    reportSummary: facts.reportSummary ?? "",
    reportPublication: facts.reportPublication,
    releaseRecord: facts.releaseRecord,
    releaseReadiness: facts.releaseReadiness,
    appendixPresent: facts.appendixPresent,
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
  const notes = missingArtifactKinds.map((kind) =>
    readMissingArtifactNote(kind),
  );

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
  const hasTaskFailure = isScoutOnlyMission(input.mission)
    ? input.facts.latestScoutTask?.status === "failed" ||
      input.facts.latestScoutTask?.status === "cancelled"
    : input.facts.latestPlannerTask?.status === "failed" ||
      input.facts.latestExecutorTask?.status === "failed" ||
      input.facts.latestExecutorTask?.status === "cancelled";
  const hasMissionFailure = ["failed", "cancelled"].includes(
    input.mission.status,
  );
  const hasRejectedApproval =
    input.facts.latestApproval !== null &&
    ["declined", "cancelled", "expired"].includes(
      input.facts.latestApproval.status,
    );
  const hasPendingApproval = input.facts.latestApproval?.status === "pending";
  const hasMeaningfulEvidence =
    input.facts.artifacts.length > 0 || input.facts.latestApproval !== null;
  const hasReadyArtifacts =
    input.evidenceCompleteness.missingArtifactKinds.length === 0 &&
    (isScoutOnlyMission(input.mission)
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

  if (isReportingFacts(facts) && facts.latestScoutTask) {
    if (status === "failed" && facts.latestScoutTask.summary) {
      return truncate(facts.latestScoutTask.summary, SUMMARY_MAX_LENGTH);
    }

    if (isBoardPacketFacts(facts)) {
      return "Draft board packet compilation is still pending persisted board-packet evidence.";
    }

    if (isLenderUpdateFacts(facts)) {
      return "Draft lender-update compilation is still pending persisted lender-update evidence.";
    }

    if (isDiligencePacketFacts(facts)) {
      return "Draft diligence-packet compilation is still pending persisted diligence-packet evidence.";
    }

    return "Draft finance memo compilation is still pending persisted reporting artifacts.";
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

  if (isReportingFacts(facts) && facts.latestScoutTask) {
    if (isBoardPacketFacts(facts)) {
      if (status === "ready") {
        return "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.";
      }

      if (status === "incomplete") {
        return "Draft board packet evidence is still pending from the stored reporting path.";
      }

      if (status === "failed") {
        return "No draft board packet could be persisted for this reporting mission.";
      }

      return "";
    }

    if (isLenderUpdateFacts(facts)) {
      if (status === "ready") {
        return "Draft lender update was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.";
      }

      if (status === "incomplete") {
        return "Draft lender update evidence is still pending from the stored reporting path.";
      }

      if (status === "failed") {
        return "No draft lender update could be persisted for this reporting mission.";
      }

      return "";
    }

    if (isDiligencePacketFacts(facts)) {
      if (status === "ready") {
        return "Draft diligence packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.";
      }

      if (status === "incomplete") {
        return "Draft diligence packet evidence is still pending from the stored reporting path.";
      }

      if (status === "failed") {
        return "No draft diligence packet could be persisted for this reporting mission.";
      }

      return "";
    }

    if (status === "ready") {
      return "Draft finance memo and evidence appendix were compiled deterministically from stored discovery evidence without running the Codex runtime.";
    }

    if (status === "incomplete") {
      return "Draft reporting evidence is still pending from the stored discovery answer path.";
    }

    if (status === "failed") {
      return "No draft finance memo could be persisted for this reporting mission.";
    }

    return "";
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
        facts.policySourceId
          ? `${facts.discoveryAnswerSummary} Review the stored policy page, extract-status posture, and visible limitations for source ${facts.policySourceId} before acting on the answer.`
          : `${facts.discoveryAnswerSummary} Review the stored freshness, route-backed evidence, and visible limitations before acting on the answer.`,
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
    isReportingFacts(facts) &&
    facts.latestScoutTask &&
    status === "ready" &&
    facts.reportSummary
  ) {
    return truncate(
      isBoardPacketFacts(facts)
        ? `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.`
        : isDiligencePacketFacts(facts)
          ? facts.releaseRecord?.released
            ? `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, approval trace, and external release-record posture before relying on this released draft.`
            : facts.releaseReadiness?.releaseReady
              ? `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, and diligence-packet release-readiness posture before sharing this draft.`
              : `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.`
          : isLenderUpdateFacts(facts)
            ? facts.releaseRecord?.released
              ? `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, approval trace, and external release-record posture before relying on this released draft.`
              : `${facts.reportSummary} Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, and lender-update release-readiness posture before sharing this draft.`
            : `${facts.reportSummary} Review the linked evidence appendix, carried-forward freshness, and visible limitations before sharing this draft.`,
      SUMMARY_MAX_LENGTH,
    );
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

  if (isReportingFacts(facts) && facts.latestScoutTask) {
    if (isBoardPacketFacts(facts)) {
      if (status === "failed") {
        return "Draft board packet is currently unavailable; inspect the stored source reporting evidence and reporting task timeline before retrying.";
      }

      if (status === "incomplete") {
        return "Board-packet proof readiness depends on one persisted board_packet artifact compiled from stored finance memo and evidence appendix evidence only.";
      }

      if (status === "ready") {
        return "This board packet is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, PDF, or slide workflow in F5C1.";
      }

      return "";
    }

    if (isLenderUpdateFacts(facts)) {
      if (status === "failed") {
        return "Draft lender update is currently unavailable; inspect the stored source reporting evidence and reporting task timeline before retrying.";
      }

      if (status === "incomplete") {
        return "Lender-update proof readiness depends on one persisted lender_update artifact compiled from stored finance memo and evidence appendix evidence only.";
      }

      if (status === "ready") {
        if (facts.releaseRecord?.released) {
          return "This lender update has one persisted external release record linked to an approved release-review trace, but Pocket CFO still did not send, distribute, publish, generate PDF, or generate slides in F5C4B.";
        }

        if (!facts.releaseReadiness?.approvalId) {
          return "This lender update is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, diligence, PDF, or slide workflow in F5C2.";
        }

        return facts.releaseReadiness?.releaseReady
          ? "This lender update is approved for release from a persisted review path, but actual delivery, diligence, PDF, and slide workflows remain out of scope in F5C4A."
          : "This lender update stays draft-only until a persisted release approval is granted; actual delivery, diligence, PDF, and slide workflows remain out of scope in F5C4A.";
      }

      return "";
    }

    if (isDiligencePacketFacts(facts)) {
      if (status === "failed") {
        return "Draft diligence packet is currently unavailable; inspect the stored source reporting evidence and reporting task timeline before retrying.";
      }

      if (status === "incomplete") {
        return "Diligence-packet proof readiness depends on one persisted diligence_packet artifact compiled from stored finance memo and evidence appendix evidence only.";
      }

      if (status === "ready") {
        if (facts.releaseRecord?.released) {
          return "This diligence packet has one persisted external release record linked to an approved release-review trace, but Pocket CFO still did not send, distribute, publish, start board circulation, generate PDF, or generate slides in F5C4D.";
        }

        if (!facts.releaseReadiness?.approvalId) {
          return "This diligence packet is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, PDF, or slide workflow in F5C3.";
        }

        return facts.releaseReadiness.releaseReady
          ? "This diligence packet is approved for release from a persisted review path, but actual delivery, board circulation, PDF, and slide workflows remain out of scope in F5C4D, and release logging stays explicit and separate."
          : "This diligence packet stays draft-only until a persisted release approval is granted; actual delivery, board circulation, PDF, and slide workflows remain out of scope in F5C4D.";
      }

      return "";
    }

    if (status === "failed") {
      return "Draft reporting is currently unavailable; inspect the stored source discovery evidence and reporting task timeline before retrying.";
    }

    if (status === "incomplete") {
      return "Draft reporting still depends on one persisted finance memo plus one persisted evidence appendix.";
    }

    if (status === "ready") {
      return "This memo is draft-only, carries source discovery freshness and limitations forward, and has no release or approval workflow in F5A.";
    }

    return "";
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

  if (isReportingFacts(facts) && facts.latestScoutTask) {
    if (isBoardPacketFacts(facts)) {
      if (status === "failed") {
        return "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft board-packet compilation; no release, send, or wiki filing side effect was produced.";
      }

      if (status === "incomplete") {
        return "Wait for the stored board_packet artifact before relying on this reporting mission.";
      }

      if (status === "ready") {
        return "No release, approval, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.";
      }

      return "";
    }

    if (isLenderUpdateFacts(facts)) {
      if (status === "failed") {
        return "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft lender-update compilation; no release, send, or wiki filing side effect was produced.";
      }

      if (status === "incomplete") {
        return "Wait for the stored lender_update artifact before relying on this reporting mission.";
      }

      if (status === "ready") {
        if (facts.releaseRecord?.released) {
          return "No system send, distribute, publish, PDF export, or slide export side effect was produced; this slice only records an operator-entered external release log against the approved lender update.";
        }

        if (!facts.releaseReadiness?.approvalId) {
          return "No release, approval, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.";
        }

        return facts.releaseReadiness?.releaseReady
          ? "No actual release, send, wiki filing, PDF export, or slide export side effect was produced; this slice only records approved-for-release posture against the stored lender update."
          : "No actual release, send, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.";
      }

      return "";
    }

    if (isDiligencePacketFacts(facts)) {
      if (status === "failed") {
        return "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft diligence-packet compilation; no release, send, or wiki filing side effect was produced.";
      }

      if (status === "incomplete") {
        return "Wait for the stored diligence_packet artifact before relying on this reporting mission.";
      }

      if (status === "ready") {
        if (facts.releaseRecord?.released) {
          return "No system send, distribute, publish, board circulation, PDF export, or slide export side effect was produced; this slice only records an operator-entered external release log against the approved diligence packet.";
        }

        if (!facts.releaseReadiness?.approvalId) {
          return "No release, approval, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.";
        }

        return facts.releaseReadiness.releaseReady
          ? "No actual release, send, wiki filing, PDF export, or slide export side effect was produced; this slice only records approved-for-release posture against the stored diligence packet."
          : "No actual release, send, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.";
      }

      return "";
    }

    if (status === "failed") {
      return "Safe fallback: refresh or rerun the source discovery mission truthfully, then retry draft memo compilation; no release, send, or wiki filing side effect was produced.";
    }

    if (status === "incomplete") {
      return "Wait for both the finance memo and evidence appendix artifacts before relying on this reporting mission.";
    }

    if (status === "ready") {
      return "No release, approval, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored discovery evidence should be refreshed first.";
    }

    return "";
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
    case "finance_memo":
      return "Draft finance memo evidence is missing.";
    case "evidence_appendix":
      return "Evidence appendix is missing.";
    case "board_packet":
      return "Draft board packet evidence is missing.";
    case "diligence_packet":
      return "Draft diligence packet evidence is missing.";
    case "lender_update":
      return "Draft lender update evidence is missing.";
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

function isScoutOnlyMission(mission: MissionRecord) {
  return mission.type === "discovery" || mission.type === "reporting";
}

function isFinanceDiscoveryFacts(facts: ProofBundleAssemblyFacts) {
  return (
    !isReportingFacts(facts) &&
    (facts.companyKey !== null ||
      isFinanceDiscoveryQuestionKind(facts.questionKind))
  );
}

function isBoardPacketFacts(facts: ProofBundleAssemblyFacts) {
  return facts.reportKind === "board_packet";
}

function isLenderUpdateFacts(facts: ProofBundleAssemblyFacts) {
  return facts.reportKind === "lender_update";
}

function isDiligencePacketFacts(facts: ProofBundleAssemblyFacts) {
  return facts.reportKind === "diligence_packet";
}

function isReportingFacts(facts: ProofBundleAssemblyFacts) {
  return facts.reportKind !== null || facts.sourceDiscoveryMissionId !== null;
}

function readExpectedArtifactKinds(facts: ProofBundleAssemblyFacts) {
  if (facts.missionType === "reporting") {
    if (isBoardPacketFacts(facts)) {
      return BOARD_PACKET_REPORTING_EXPECTED_ARTIFACT_KINDS;
    }

    if (isLenderUpdateFacts(facts)) {
      return LENDER_UPDATE_REPORTING_EXPECTED_ARTIFACT_KINDS;
    }

    if (isDiligencePacketFacts(facts)) {
      return DILIGENCE_PACKET_REPORTING_EXPECTED_ARTIFACT_KINDS;
    }

    return FINANCE_MEMO_REPORTING_EXPECTED_ARTIFACT_KINDS;
  }

  return facts.missionType === "discovery"
    ? DISCOVERY_EXPECTED_ARTIFACT_KINDS
    : BUILD_EXPECTED_ARTIFACT_KINDS;
}
