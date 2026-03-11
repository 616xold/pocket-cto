import type {
  MissionTaskRecord,
  MissionTaskStatus,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { EvidenceService } from "../evidence/service";
import { taskStatusChangeReasons } from "./events";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { CodexRuntimeService } from "../runtime-codex/service";
import type { WorkspaceService } from "../workspaces/service";
import type { ExecuteClaimedTaskTurnResult } from "./runtime-phase";
import { OrchestratorRuntimePhase } from "./runtime-phase";
import { buildTaskStatusChangedPayload } from "./events";

export type OrchestratorTickResult =
  | { kind: "idle" }
  | {
      kind: "runtime_failed";
      error: Error;
      stage: "turn_execution";
      task: MissionTaskRecord;
    }
  | {
      kind: "turn_completed";
      task: MissionTaskRecord;
      turn: ExecuteClaimedTaskTurnResult["turn"];
    };

export class OrchestratorService {
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
    runtimeCodexService: Pick<CodexRuntimeService, "runTurn">,
    evidenceService: Pick<
      EvidenceService,
      | "attachPlannerArtifactToProofBundle"
      | "buildPlannerArtifact"
      | "buildPlannerTaskSummary"
    >,
    workspaceService: Pick<
      WorkspaceService,
      "ensureTaskWorkspace" | "releaseTaskWorkspaceLease"
    >,
  ) {
    this.runtimePhase = new OrchestratorRuntimePhase(
      missionRepository,
      replayService,
      runtimeCodexService,
      evidenceService,
      workspaceService,
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
    try {
      const completedTurn = await this.runtimePhase.executeClaimedTaskTurn(task.id);

      return {
        kind: "turn_completed",
        task: completedTurn.task,
        turn: completedTurn.turn,
      };
    } catch (error) {
      return {
        kind: "runtime_failed",
        error: asError(error, "Codex turn execution failed"),
        stage: "turn_execution",
        task,
      };
    }
  }
}

function asError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}
