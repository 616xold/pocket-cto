import type {
  ArtifactRecord,
  ArtifactKind,
  DiscoveryMissionQuestion,
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { ProofBundleManifestSchema } from "@pocket-cto/domain";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { PlannerPromptContext } from "../runtime-codex/planner-context";
import {
  extractMarkdownSection,
  stripMarkdownPrefix,
  truncate,
} from "./text";

export type EvidenceArtifactDraft = {
  kind: ArtifactKind;
  metadata: Record<string, unknown>;
  mimeType: string | null;
  missionId: string;
  sha256: string | null;
  taskId: string | null;
  uri: string;
};

export type PlannerArtifactSourceItem = {
  itemId: string;
  itemType: string;
};

export type PlannerArtifactCapture = {
  body: string;
  captureStrategy: string;
  sourceItems: PlannerArtifactSourceItem[];
};

export class EvidenceService {
  createPlaceholder(mission: MissionRecord): ProofBundleManifest {
    const isDiscoveryMission = mission.type === "discovery";
    const discoveryQuestion = mission.spec.input?.discoveryQuestion;
    const financeCompanyKey =
      isFinanceDiscoveryQuestion(discoveryQuestion) ? discoveryQuestion.companyKey : null;
    const discoveryQuestionKind =
      discoveryQuestion?.questionKind ?? null;
    const policySourceId = isPolicyLookupDiscoveryQuestion(discoveryQuestion)
      ? discoveryQuestion.policySourceId
      : null;

    return ProofBundleManifestSchema.parse({
      missionId: mission.id,
      missionTitle: mission.title,
      objective: mission.objective,
      companyKey: financeCompanyKey,
      questionKind: discoveryQuestionKind,
      policySourceId,
      answerSummary: "",
      freshnessState: null,
      freshnessSummary: "",
      limitationsSummary: "",
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      targetRepoFullName:
        mission.primaryRepo && mission.primaryRepo.includes("/")
          ? mission.primaryRepo
          : null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary: "",
      validationSummary: "",
      verificationSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      latestApproval: null,
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: isDiscoveryMission
          ? ["discovery_answer"]
          : ["plan", "diff_summary", "test_report", "pr_link"],
        presentArtifactKinds: [],
        missingArtifactKinds: isDiscoveryMission
          ? ["discovery_answer"]
          : ["plan", "diff_summary", "test_report", "pr_link"],
        notes: isDiscoveryMission
          ? ["Discovery answer evidence is missing."]
          : [
              "Planner evidence is missing.",
              "Change-summary evidence is missing.",
              "Validation evidence is missing.",
              "GitHub pull request evidence is missing.",
            ],
      },
      decisionTrace: [],
      artifactIds: [],
      artifacts: [],
      replayEventCount: 0,
      timestamps: {
        missionCreatedAt: mission.createdAt,
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      status: "placeholder",
    });
  }

  buildPlannerArtifact(input: {
    mission: MissionRecord;
    plannerCapture: PlannerArtifactCapture;
    plannerContext: PlannerPromptContext;
    summary: string;
    task: MissionTaskRecord;
    turn: RuntimeCodexRunTurnResult;
  }): EvidenceArtifactDraft {
    return {
      missionId: input.mission.id,
      taskId: input.task.id,
      kind: "plan",
      uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/plan`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        body: input.plannerCapture.body,
        captureStrategy: input.plannerCapture.captureStrategy,
        generatedAt: new Date().toISOString(),
        source: "runtime_codex_planner",
        sourceItems: input.plannerCapture.sourceItems,
        summary: input.summary,
        taskRole: input.task.role,
        threadId: input.turn.threadId,
        turnId: input.turn.turnId,
        workspace: input.plannerContext.workspace,
        workflowPolicy: input.plannerContext.workflowPolicy
          ? {
              injected: true,
              path: input.plannerContext.workflowPolicy.path,
              truncated: input.plannerContext.workflowPolicy.truncated,
            }
          : {
              injected: false,
              path: null,
              truncated: false,
            },
      },
    };
  }

  buildPlannerTaskSummary(plannerText: string) {
    const normalized = plannerText.replace(/\r\n/g, "\n").trim();
    const objectiveSection =
      extractMarkdownSection(normalized, "Objective understanding") ??
      extractMarkdownSection(normalized, "Relevant context") ??
      normalized;
    const firstSentence = objectiveSection
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(stripMarkdownPrefix)
      .join(" ");

    return truncate(firstSentence || "Planner completed with a read-only plan.", 240);
  }

  attachPlannerArtifactToProofBundle(
    bundle: ProofBundleManifest,
    input: {
      artifactId: string;
      task: MissionTaskRecord;
    },
  ): ProofBundleManifest {
    const nextArtifactIds = Array.from(
      new Set([...bundle.artifactIds, input.artifactId]),
    );
    const decisionTraceLine = `Planner task ${input.task.sequence} produced plan artifact ${input.artifactId}.`;
    const nextDecisionTrace = bundle.decisionTrace.includes(decisionTraceLine)
      ? bundle.decisionTrace
      : [...bundle.decisionTrace, decisionTraceLine];

    return ProofBundleManifestSchema.parse({
      ...bundle,
      artifactIds: nextArtifactIds,
      decisionTrace: nextDecisionTrace,
    });
  }

  attachRuntimeArtifactsToProofBundle(
    bundle: ProofBundleManifest,
    input: {
      artifacts: Array<Pick<ArtifactRecord, "id" | "kind">>;
      changeSummary: string | null;
      riskSummary: string | null;
      rollbackSummary: string | null;
      task: MissionTaskRecord;
      terminalTaskStatus: MissionTaskStatus;
      verificationSummary: string | null;
    },
  ): ProofBundleManifest {
    const nextArtifactIds = Array.from(
      new Set([...bundle.artifactIds, ...input.artifacts.map((artifact) => artifact.id)]),
    );
    const nextDecisionTrace = appendUniqueDecisionTrace(
      bundle.decisionTrace,
      [
        `Executor task ${input.task.sequence} terminalized as ${input.terminalTaskStatus} with runtime evidence placeholders.`,
        ...input.artifacts.map(
          (artifact) =>
            `Executor task ${input.task.sequence} produced ${artifact.kind} artifact ${artifact.id}.`,
        ),
      ],
    );

    return ProofBundleManifestSchema.parse({
      ...bundle,
      artifactIds: nextArtifactIds,
      changeSummary: input.changeSummary?.trim() || bundle.changeSummary,
      decisionTrace: nextDecisionTrace,
      riskSummary: input.riskSummary?.trim() || bundle.riskSummary,
      rollbackSummary: input.rollbackSummary?.trim() || bundle.rollbackSummary,
      status: input.artifacts.length > 0 ? "ready" : bundle.status,
      verificationSummary:
        input.verificationSummary?.trim() || bundle.verificationSummary,
    });
  }

  buildPullRequestArtifact(input: {
    mission: MissionRecord;
    pr: {
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
  }): EvidenceArtifactDraft {
    return {
      missionId: input.mission.id,
      taskId: input.task.id,
      kind: "pr_link",
      uri: input.pr.prUrl,
      mimeType: "application/json",
      sha256: null,
      metadata: {
        baseBranch: input.pr.baseBranch,
        body: input.pr.prBody,
        branchName: input.pr.branchName,
        commitMessage: input.pr.commitMessage,
        commitSha: input.pr.commitSha,
        draft: input.pr.draft,
        headBranch: input.pr.headBranch,
        prNumber: input.pr.prNumber,
        prTitle: input.pr.prTitle,
        prUrl: input.pr.prUrl,
        publishedAt: input.pr.publishedAt,
        repoFullName: input.pr.repoFullName,
        source: "github_app_publish",
        summary: buildPullRequestArtifactSummary(input.pr),
        taskRole: input.task.role,
      },
    };
  }

  attachPullRequestArtifactToProofBundle(
    bundle: ProofBundleManifest,
    input: {
      artifactId: string;
      pr: {
        branchName: string;
        draft: boolean;
        prNumber: number;
        repoFullName: string;
      };
      task: MissionTaskRecord;
    },
  ): ProofBundleManifest {
    const nextArtifactIds = Array.from(
      new Set([...bundle.artifactIds, input.artifactId]),
    );
    const draftPrefix = input.pr.draft ? "draft " : "";
    const decisionTraceLine = `Executor task ${input.task.sequence} opened ${draftPrefix}PR #${input.pr.prNumber} for ${input.pr.repoFullName} from branch ${input.pr.branchName}.`;
    const nextDecisionTrace = bundle.decisionTrace.includes(decisionTraceLine)
      ? bundle.decisionTrace
      : [...bundle.decisionTrace, decisionTraceLine];

    return ProofBundleManifestSchema.parse({
      ...bundle,
      artifactIds: nextArtifactIds,
      decisionTrace: nextDecisionTrace,
    });
  }
}

function isFinanceDiscoveryQuestion(
  question: DiscoveryMissionQuestion | null | undefined,
): question is Extract<DiscoveryMissionQuestion, { companyKey: string }> {
  return (
    typeof question === "object" && question !== null && "companyKey" in question
  );
}

function isPolicyLookupDiscoveryQuestion(
  question: DiscoveryMissionQuestion | null | undefined,
): question is Extract<DiscoveryMissionQuestion, { policySourceId: string }> {
  return (
    typeof question === "object" &&
    question !== null &&
    "policySourceId" in question
  );
}

function appendUniqueDecisionTrace(existing: string[], lines: string[]) {
  return lines.reduce(
    (trace, line) => (trace.includes(line) ? trace : [...trace, line]),
    existing,
  );
}

function buildPullRequestArtifactSummary(input: {
  baseBranch: string;
  draft: boolean;
  headBranch: string;
  prNumber: number;
  repoFullName: string;
}) {
  const draftPrefix = input.draft ? "Draft PR" : "PR";
  return `${draftPrefix} #${input.prNumber} opened for ${input.repoFullName} from ${input.headBranch} into ${input.baseBranch}.`;
}
