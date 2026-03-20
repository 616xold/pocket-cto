import type {
  MissionTaskRecord,
  MissionTaskStatus,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { ApprovalService } from "../approvals/service";
import type { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import type { EvidenceService } from "../evidence/service";
import type { GitHubPublishService } from "../github-app/publish-service";
import { taskStatusChangeReasons } from "./events";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { CodexRuntimeService } from "../runtime-codex/service";
import type { TwinService } from "../twin/service";
import type { ExecutorValidationService } from "../validation";
import type { WorkspaceService } from "../workspaces/service";
import { DiscoveryOrchestratorPhase } from "./discovery-phase";
import type { ExecuteClaimedTaskTurnResult } from "./runtime-phase";
import { OrchestratorRuntimePhase } from "./runtime-phase";
import { buildTaskStatusChangedPayload } from "./events";

export type OrchestratorTickResult =
  | { kind: "idle" }
  | {
      kind: "task_completed";
      stage: "discovery_execution";
      task: MissionTaskRecord;
    }
  | {
      kind: "task_failed";
      error: Error;
      stage: "discovery_execution" | "turn_execution";
      task: MissionTaskRecord;
    }
  | {
      kind: "runtime_failed";
      error: Error;
      stage: "discovery_execution" | "turn_execution";
      task: MissionTaskRecord;
    }
  | {
      kind: "turn_completed";
      task: MissionTaskRecord;
      turn: ExecuteClaimedTaskTurnResult["turn"];
    };

export class OrchestratorService {
  private readonly discoveryPhase: DiscoveryOrchestratorPhase;
  private readonly runtimePhase: OrchestratorRuntimePhase;

  constructor(
    private readonly missionRepository: Pick<
      MissionRepository,
      | "claimNextRunnableTask"
      | "findOldestClaimedTaskReadyForTurn"
      | "findOldestClaimedTaskWithoutThread"
      | "transaction"
      | "updateTaskStatus"
      | "attachCodexThreadId"
      | "attachCodexTurnId"
      | "clearCodexTurnId"
      | "getMissionById"
      | "getLatestPlannerArtifactForExecutor"
      | "getProofBundleByMissionId"
      | "getTaskById"
      | "replaceCodexThreadId"
      | "saveArtifact"
      | "updateTaskSummary"
      | "updateMissionStatus"
      | "upsertProofBundle"
    >,
    private readonly replayService: Pick<
      ReplayService,
      "append" | "taskHasEventType"
    >,
    approvalService: Pick<
      ApprovalService,
      "requestCommandExecutionApproval" | "requestFileChangeApproval"
    >,
    runtimeCodexService: Pick<CodexRuntimeService, "runTurn">,
    evidenceService: Pick<
      EvidenceService,
      | "buildPlannerArtifact"
      | "buildPullRequestArtifact"
      | "buildPlannerTaskSummary"
    >,
    workspaceService: Pick<
      WorkspaceService,
      "ensureTaskWorkspace" | "releaseTaskWorkspaceLease"
    >,
    validationService: Pick<
      ExecutorValidationService,
      "validateExecutorTurn"
    >,
    twinService: Pick<TwinService, "queryRepositoryBlastRadius">,
    githubPublishService: Pick<
      GitHubPublishService,
      "publishValidatedExecutorWorkspace"
    >,
    proofBundleAssembly?: Pick<
      ProofBundleAssemblyService,
      "refreshProofBundle"
    >,
  ) {
    this.discoveryPhase = new DiscoveryOrchestratorPhase(
      missionRepository,
      replayService,
      twinService,
      proofBundleAssembly,
    );
    this.runtimePhase = new OrchestratorRuntimePhase(
      missionRepository,
      replayService,
      approvalService,
      runtimeCodexService,
      evidenceService,
      workspaceService,
      validationService,
      githubPublishService,
      proofBundleAssembly,
    );
  }

  async tick(): Promise<OrchestratorTickResult> {
    const claimedTaskWithoutThread =
      await this.missionRepository.findOldestClaimedTaskWithoutThread();

    if (claimedTaskWithoutThread) {
      return this.executeTaskTurn(claimedTaskWithoutThread);
    }

    const claimedTaskReadyForTurn =
      await this.missionRepository.findOldestClaimedTaskReadyForTurn();

    if (claimedTaskReadyForTurn) {
      return this.executeTaskTurn(claimedTaskReadyForTurn);
    }

    const claimedTask = await this.missionRepository.transaction(
      async (session) => {
        const task = await this.missionRepository.claimNextRunnableTask(session);

        if (!task) {
          return null;
        }

        await this.replayService.append(
          {
            missionId: task.missionId,
            taskId: task.id,
            type: "task.status_changed",
            payload: buildTaskStatusChangedPayload(
              "pending",
              task.status,
              taskStatusChangeReasons.workerClaimed,
            ),
          },
          session,
        );

        return task;
      },
    );

    if (!claimedTask) {
      return { kind: "idle" };
    }

    return this.executeTaskTurn(claimedTask);
  }

  async transitionTaskStatus(input: {
    reason: TaskStatusChangeReason;
    taskId: string;
    to: MissionTaskStatus;
  }) {
    return this.runtimePhase.transitionTaskStatus(input);
  }

  private async executeTaskTurn(
    task: MissionTaskRecord,
  ): Promise<OrchestratorTickResult> {
    const mission = await this.missionRepository.getMissionById(task.missionId);

    if (mission?.type === "discovery" && task.role === "scout") {
      try {
        const completedTask = await this.discoveryPhase.executeClaimedDiscoveryTask(
          task.id,
        );

        if (completedTask.status === "failed" || completedTask.status === "cancelled") {
          return {
            kind: "task_failed",
            error: new Error(
              completedTask.summary ?? "Discovery execution failed",
            ),
            stage: "discovery_execution",
            task: completedTask,
          };
        }

        return {
          kind: "task_completed",
          stage: "discovery_execution",
          task: completedTask,
        };
      } catch (error) {
        const latestTask = await this.missionRepository.getTaskById(task.id);
        const classifiedError = asError(error, "Discovery execution failed");

        if (isControlledTaskFailure(latestTask)) {
          return {
            kind: "task_failed",
            error: classifiedError,
            stage: "discovery_execution",
            task: latestTask,
          };
        }

        return {
          kind: "runtime_failed",
          error: classifiedError,
          stage: "discovery_execution",
          task: latestTask ?? task,
        };
      }
    }

    try {
      const completedTurn = await this.runtimePhase.executeClaimedTaskTurn(task.id);

      return {
        kind: "turn_completed",
        task: completedTurn.task,
        turn: completedTurn.turn,
      };
    } catch (error) {
      const latestTask = await this.missionRepository.getTaskById(task.id);
      const classifiedError = asError(error, "Codex turn execution failed");

      if (isControlledTaskFailure(latestTask)) {
        return {
          kind: "task_failed",
          error: classifiedError,
          stage: "turn_execution",
          task: latestTask,
        };
      }

      return {
        kind: "runtime_failed",
        error: classifiedError,
        stage: "turn_execution",
        task: latestTask ?? task,
      };
    }
  }
}

function asError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function isControlledTaskFailure(
  task: MissionTaskRecord | null,
): task is MissionTaskRecord {
  return task?.status === "failed" && task.codexTurnId === null;
}
