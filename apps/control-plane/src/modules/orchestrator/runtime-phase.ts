import type {
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { EvidenceService } from "../evidence/service";
import { persistPlannerTurnEvidence } from "../evidence/planner-output";
import {
  buildRuntimeStartedMissionStatusChangedPayload,
} from "../missions/events";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import {
  buildReadOnlyTurnPolicy,
} from "../runtime-codex/config";
import {
  buildRuntimeItemCompletedPayload,
  buildRuntimeItemStartedPayload,
  buildRuntimeThreadReplacedPayload,
  buildRuntimeThreadStartedPayload,
  buildRuntimeTurnCompletedPayload,
  buildRuntimeTurnStartedPayload,
} from "../runtime-codex/events";
import {
  loadPlannerPromptContext,
  type PlannerPromptContext,
} from "../runtime-codex/planner-context";
import { buildPlannerTurnInput } from "../runtime-codex/planner-prompt";
import type { CodexRuntimeService } from "../runtime-codex/service";
import { buildReadOnlyTurnInput } from "../runtime-codex/turn-input";
import type {
  RuntimeCodexBootstrapResult,
  RuntimeCodexItemLifecycleEvent,
  RuntimeCodexRunTurnResult,
  RuntimeCodexThreadReplacedEvent,
  RuntimeTurnRecoveryStrategy,
} from "../runtime-codex/types";
import type { WorkspaceService } from "../workspaces/service";
import {
  buildTaskStatusChangedPayload,
  taskStatusChangeReasons,
} from "./events";

export type ExecuteClaimedTaskTurnResult = {
  task: MissionTaskRecord;
  turn: RuntimeCodexRunTurnResult;
};

export class OrchestratorRuntimePhase {
  constructor(
    private readonly missionRepository: Pick<
      MissionRepository,
      | "attachCodexThreadId"
      | "attachCodexTurnId"
      | "clearCodexTurnId"
      | "getMissionById"
      | "getProofBundleByMissionId"
      | "getTaskById"
      | "replaceCodexThreadId"
      | "saveArtifact"
      | "transaction"
      | "updateTaskSummary"
      | "updateMissionStatus"
      | "updateTaskStatus"
      | "upsertProofBundle"
    >,
    private readonly replayService: Pick<
      ReplayService,
      "append" | "taskHasEventType"
    >,
    private readonly runtimeCodexService: Pick<CodexRuntimeService, "runTurn">,
    private readonly evidenceService: Pick<
      EvidenceService,
      | "attachPlannerArtifactToProofBundle"
      | "buildPlannerArtifact"
      | "buildPlannerTaskSummary"
    >,
    private readonly workspaceService: Pick<
      WorkspaceService,
      "ensureTaskWorkspace" | "releaseTaskWorkspaceLease"
    >,
  ) {}

  async executeClaimedTaskTurn(
    taskId: string,
  ): Promise<ExecuteClaimedTaskTurnResult> {
    const task = await this.getRequiredTask(taskId);

    if (task.status !== "claimed") {
      throw new Error(`Task ${taskId} must be claimed before turn start`);
    }

    if (task.codexTurnId) {
      throw new Error(`Task ${taskId} already has an active Codex turn`);
    }

    const mission = await this.getRequiredMission(task.missionId);
    const proofBundle = await this.missionRepository.getProofBundleByMissionId(
      mission.id,
    );
    const hasPriorTurnStarted = await this.replayService.taskHasEventType(
      task.id,
      "runtime.turn_started",
    );
    const readOnlyPolicy = buildReadOnlyTurnPolicy();
    const workspace = await this.workspaceService.ensureTaskWorkspace({
      sandboxMode: "read-only",
      task,
    });
    const plannerContext =
      task.role === "planner"
        ? await loadPlannerPromptContext({
            mission,
            task,
            workspace,
          })
        : null;
    const turn = await this.runtimeCodexService.runTurn(
      {
        approvalPolicy: readOnlyPolicy.approvalPolicy,
        cwd: workspace.rootPath,
        hasPriorTurnStarted,
        input: plannerContext
          ? buildPlannerTurnInput(plannerContext)
          : buildReadOnlyTurnInput({
              mission,
              proofBundle,
              task,
            }),
        sandboxPolicy: readOnlyPolicy.sandboxPolicy,
        threadId: task.codexThreadId,
      },
      {
        onThreadReplaced: async (event) => {
          await this.handleThreadReplaced(taskId, event);
        },
        onThreadStarted: async (event) => {
          await this.handleThreadStarted(taskId, event);
        },
        onTurnStarted: async (event) => {
          await this.handleTurnStarted(
            taskId,
            event.turnId,
            event.threadId,
            event.recoveryStrategy,
          );
        },
        onItemStarted: async (event) => {
          await this.appendRuntimeItemEvent(taskId, event, "runtime.item_started");
        },
        onItemCompleted: async (event) => {
          await this.appendRuntimeItemEvent(
            taskId,
            event,
            "runtime.item_completed",
          );
        },
      },
    );

    const updatedTask = await this.handleTurnCompleted(
      taskId,
      turn,
      plannerContext,
    );

    return {
      task: updatedTask,
      turn,
    };
  }

  async transitionTaskStatus(input: {
    reason: TaskStatusChangeReason;
    taskId: string;
    to: MissionTaskStatus;
  }) {
    return this.missionRepository.transaction(async (session) => {
      const currentTask = await this.getRequiredTask(input.taskId, session);

      if (currentTask.status === input.to) {
        return currentTask;
      }

      const updatedTask = await this.missionRepository.updateTaskStatus(
        input.taskId,
        input.to,
        session,
      );

      await this.appendTaskStatusChanged(
        updatedTask,
        currentTask.status,
        updatedTask.status,
        input.reason,
        session,
      );

      if (isTerminalTaskStatus(updatedTask.status)) {
        await this.workspaceService.releaseTaskWorkspaceLease(
          updatedTask.id,
          session,
        );
      }

      return updatedTask;
    });
  }

  private async handleThreadReplaced(
    taskId: string,
    event: RuntimeCodexThreadReplacedEvent,
  ) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);

      if (task.status !== "claimed") {
        throw new Error(
          `Task ${taskId} changed state before thread replacement persistence: ${task.status}`,
        );
      }

      const updatedTask = await this.missionRepository.replaceCodexThreadId(
        taskId,
        event.oldThreadId,
        event.newThreadId,
        session,
      );

      await this.replayService.append(
        {
          missionId: updatedTask.missionId,
          taskId,
          type: "runtime.thread_replaced",
          payload: buildRuntimeThreadReplacedPayload({
            missionId: updatedTask.missionId,
            newThreadId: event.newThreadId,
            oldThreadId: event.oldThreadId,
            reasonCode: event.reasonCode,
            taskId,
          }),
        },
        session,
      );

      return updatedTask;
    });
  }

  private async handleThreadStarted(
    taskId: string,
    bootstrap: RuntimeCodexBootstrapResult,
  ) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);

      if (task.status !== "claimed") {
        throw new Error(
          `Task ${taskId} changed state before thread persistence: ${task.status}`,
        );
      }

      let persistedTask = task;

      if (task.codexThreadId === null) {
        persistedTask = await this.missionRepository.attachCodexThreadId(
          taskId,
          bootstrap.threadId,
          session,
        );
      } else if (task.codexThreadId !== bootstrap.threadId) {
        throw new Error(
          `Task ${taskId} thread mismatch at thread start: expected ${task.codexThreadId}, got ${bootstrap.threadId}`,
        );
      }

      await this.replayService.append(
        {
          missionId: persistedTask.missionId,
          taskId: persistedTask.id,
          type: "runtime.thread_started",
          payload: buildRuntimeThreadStartedPayload({
            cwd: bootstrap.cwd,
            model: bootstrap.model,
            modelProvider: bootstrap.modelProvider,
            serviceName: bootstrap.serviceName,
            taskId: persistedTask.id,
            threadId: bootstrap.threadId,
          }),
        },
        session,
      );

      return persistedTask;
    });
  }

  private async handleTurnStarted(
    taskId: string,
    turnId: string,
    threadId: string,
    recoveryStrategy: RuntimeTurnRecoveryStrategy,
  ) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);
      const mission = await this.getRequiredMission(task.missionId, session);

      if (task.codexTurnId === turnId && task.status === "running") {
        return task;
      }

      if (task.status !== "claimed") {
        throw new Error(
          `Task ${taskId} changed state before turn start persistence: ${task.status}`,
        );
      }

      if (task.codexThreadId !== threadId) {
        throw new Error(
          `Task ${taskId} thread mismatch at turn start: expected ${task.codexThreadId ?? "null"}, got ${threadId}`,
        );
      }

      const taskWithTurn = await this.missionRepository.attachCodexTurnId(
        taskId,
        turnId,
        session,
      );

      await this.replayService.append(
        {
          missionId: task.missionId,
          taskId,
          type: "runtime.turn_started",
          payload: buildRuntimeTurnStartedPayload({
            missionId: task.missionId,
            recoveryStrategy,
            taskId,
            threadId,
            turnId,
          }),
        },
        session,
      );

      if (mission.status === "queued") {
        const runningMission = await this.missionRepository.updateMissionStatus(
          mission.id,
          "running",
          session,
        );

        await this.replayService.append(
          {
            missionId: mission.id,
            type: "mission.status_changed",
            payload: buildRuntimeStartedMissionStatusChangedPayload(
              mission.status,
              runningMission.status,
            ),
          },
          session,
        );
      }

      const runningTask = await this.missionRepository.updateTaskStatus(
        taskId,
        "running",
        session,
      );

      await this.appendTaskStatusChanged(
        runningTask,
        task.status,
        runningTask.status,
        taskStatusChangeReasons.runtimeTurnStarted,
        session,
      );

      return {
        ...runningTask,
        codexTurnId: taskWithTurn.codexTurnId,
      };
    });
  }

  private async appendRuntimeItemEvent(
    taskId: string,
    event: RuntimeCodexItemLifecycleEvent,
    type: "runtime.item_started" | "runtime.item_completed",
  ) {
    const task = await this.getRequiredTask(taskId);

    await this.replayService.append({
      missionId: task.missionId,
      taskId,
      type,
      payload:
        type === "runtime.item_started"
          ? buildRuntimeItemStartedPayload({
              itemId: event.itemId,
              itemType: event.itemType,
              missionId: task.missionId,
              taskId,
              threadId: event.threadId,
              turnId: event.turnId,
            })
          : buildRuntimeItemCompletedPayload({
              itemId: event.itemId,
              itemType: event.itemType,
              missionId: task.missionId,
              taskId,
              threadId: event.threadId,
              turnId: event.turnId,
            }),
    });
  }

  private async handleTurnCompleted(
    taskId: string,
    turn: RuntimeCodexRunTurnResult,
    plannerContext: PlannerPromptContext | null,
  ) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);

      if (task.status !== "running") {
        throw new Error(
          `Task ${taskId} changed state before turn completion persistence: ${task.status}`,
        );
      }

      if (task.codexThreadId !== turn.threadId) {
        throw new Error(
          `Task ${taskId} thread mismatch at turn completion: expected ${task.codexThreadId ?? "null"}, got ${turn.threadId}`,
        );
      }

      if (task.codexTurnId !== turn.turnId) {
        throw new Error(
          `Task ${taskId} turn mismatch at completion: expected ${task.codexTurnId ?? "null"}, got ${turn.turnId}`,
        );
      }

      await this.replayService.append(
        {
          missionId: task.missionId,
          taskId,
          type: "runtime.turn_completed",
          payload: buildRuntimeTurnCompletedPayload({
            missionId: task.missionId,
            status: turn.status,
            taskId,
            threadId: turn.threadId,
            turnId: turn.turnId,
          }),
        },
        session,
      );

      await this.missionRepository.clearCodexTurnId(taskId, session);

      const nextStatus: MissionTaskStatus =
        turn.status === "completed" ? "succeeded" : "failed";
      const reason =
        turn.status === "completed"
          ? taskStatusChangeReasons.runtimeTurnCompleted
          : taskStatusChangeReasons.runtimeTurnFailed;
      const updatedTask = await this.missionRepository.updateTaskStatus(
        taskId,
        nextStatus,
        session,
      );

      await this.appendTaskStatusChanged(
        updatedTask,
        task.status,
        updatedTask.status,
        reason,
        session,
      );

      const taskWithPlannerEvidence = await persistPlannerTurnEvidence({
        deps: {
          evidenceService: this.evidenceService,
          missionRepository: this.missionRepository,
          replayService: this.replayService,
        },
        plannerContext,
        session,
        task: updatedTask,
        turn,
      });

      await this.workspaceService.releaseTaskWorkspaceLease(taskId, session);

      return taskWithPlannerEvidence;
    });
  }

  private async appendTaskStatusChanged(
    task: MissionTaskRecord,
    from: MissionTaskStatus,
    to: MissionTaskStatus,
    reason: TaskStatusChangeReason,
    session: PersistenceSession,
  ) {
    await this.replayService.append(
      {
        missionId: task.missionId,
        taskId: task.id,
        type: "task.status_changed",
        payload: buildTaskStatusChangedPayload(from, to, reason),
      },
      session,
    );
  }

  private async getRequiredMission(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<MissionRecord> {
    const mission = await this.missionRepository.getMissionById(
      missionId,
      session,
    );

    if (!mission) {
      throw new Error(`Mission ${missionId} not found`);
    }

    return mission;
  }

  private async getRequiredTask(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<MissionTaskRecord> {
    const task = await this.missionRepository.getTaskById(taskId, session);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return task;
  }
}

function isTerminalTaskStatus(status: MissionTaskStatus) {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}
