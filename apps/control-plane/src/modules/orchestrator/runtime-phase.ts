import type {
  MissionRecord,
  MissionTaskRecord,
  MissionTaskStatus,
  ProofBundleManifest,
  TaskStatusChangeReason,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import {
  buildExecutorTaskSummary,
  buildMissingPlannerArtifactSummary,
} from "../evidence/executor-output";
import type { EvidenceService } from "../evidence/service";
import { persistPlannerTurnEvidence } from "../evidence/planner-output";
import {
  buildRuntimeStartedMissionStatusChangedPayload,
} from "../missions/events";
import type { ExecutorPlannerArtifactRecord } from "../missions/planner-artifact";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import {
  buildExecutorTurnPolicy,
  buildReadOnlyTurnPolicy,
} from "../runtime-codex/config";
import {
  loadExecutorPromptContext,
} from "../runtime-codex/executor-context";
import { buildExecutorTurnInput } from "../runtime-codex/executor-prompt";
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
import type { ExecutorValidationService } from "../validation";
import type { WorkspaceRecord } from "../workspaces";
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
      | "getLatestPlannerArtifactForExecutor"
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
    private readonly validationService: Pick<
      ExecutorValidationService,
      "validateExecutorTurn"
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
    const plannerArtifact =
      task.role === "executor"
        ? await this.missionRepository.getLatestPlannerArtifactForExecutor(task.id)
        : null;

    if (task.role === "executor" && !plannerArtifact) {
      await this.failExecutorForMissingPlannerArtifact(task.id);
      throw new Error(
        `Executor task ${task.id} has no planner plan artifact to use as input`,
      );
    }

    const workspace = await this.workspaceService.ensureTaskWorkspace({
      sandboxMode: task.role === "executor" ? "workspace-write" : "read-only",
      task,
    });
    const taskRunPreparation = await this.prepareTaskRun({
      mission,
      plannerArtifact,
      proofBundle,
      task,
      workspace,
    });
    const plannerContext =
      taskRunPreparation.plannerContext;
    const turn = await this.runtimeCodexService.runTurn(
      {
        approvalPolicy: taskRunPreparation.approvalPolicy,
        cwd: workspace.rootPath,
        hasPriorTurnStarted,
        input: taskRunPreparation.input,
        sandboxPolicy: taskRunPreparation.sandboxPolicy,
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
      mission,
      turn,
      plannerContext,
      workspace.rootPath,
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
    mission: MissionRecord,
    turn: RuntimeCodexRunTurnResult,
    plannerContext: PlannerPromptContext | null,
    workspaceRoot: string,
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

      if (turn.status !== "completed") {
        const failedTask = await this.missionRepository.updateTaskStatus(
          taskId,
          "failed",
          session,
        );

        await this.appendTaskStatusChanged(
          failedTask,
          task.status,
          failedTask.status,
          taskStatusChangeReasons.runtimeTurnFailed,
          session,
        );

        await this.workspaceService.releaseTaskWorkspaceLease(taskId, session);

        return failedTask;
      }

      if (task.role === "executor") {
        const validation = await this.validationService.validateExecutorTurn({
          mission,
          task,
          workspaceRoot,
        });
        const summary = buildExecutorTaskSummary({
          turn,
          validation,
        });
        await this.missionRepository.updateTaskSummary(taskId, summary, session);
        const nextStatus: MissionTaskStatus =
          validation.status === "passed" ? "succeeded" : "failed";
        const finalizedTask = await this.missionRepository.updateTaskStatus(
          taskId,
          nextStatus,
          session,
        );

        await this.appendTaskStatusChanged(
          finalizedTask,
          task.status,
          finalizedTask.status,
          validation.status === "passed"
            ? taskStatusChangeReasons.runtimeTurnCompleted
            : taskStatusChangeReasons.executorValidationFailed,
          session,
        );

        await this.workspaceService.releaseTaskWorkspaceLease(taskId, session);

        return finalizedTask;
      }

      const succeededTask = await this.missionRepository.updateTaskStatus(
        taskId,
        "succeeded",
        session,
      );

      await this.appendTaskStatusChanged(
        succeededTask,
        task.status,
        succeededTask.status,
        taskStatusChangeReasons.runtimeTurnCompleted,
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
        task: succeededTask,
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

  private async prepareTaskRun(input: {
    mission: MissionRecord;
    plannerArtifact: ExecutorPlannerArtifactRecord | null;
    proofBundle: ProofBundleManifest | null;
    task: MissionTaskRecord;
    workspace: WorkspaceRecord;
  }) {
    if (input.task.role === "planner") {
      const plannerContext = await loadPlannerPromptContext({
        mission: input.mission,
        task: input.task,
        workspace: input.workspace,
      });
      const readOnlyPolicy = buildReadOnlyTurnPolicy();

      return {
        approvalPolicy: readOnlyPolicy.approvalPolicy,
        input: buildPlannerTurnInput(plannerContext),
        plannerContext,
        sandboxPolicy: readOnlyPolicy.sandboxPolicy,
      };
    }

    if (input.task.role === "executor") {
      if (!input.plannerArtifact) {
        throw new Error(
          `Executor task ${input.task.id} requires a planner artifact before execution`,
        );
      }

      const executorContext = await loadExecutorPromptContext({
        mission: input.mission,
        plannerArtifact: input.plannerArtifact,
        task: input.task,
        workspace: input.workspace,
      });
      const executorPolicy = buildExecutorTurnPolicy(input.workspace.rootPath);

      return {
        approvalPolicy: executorPolicy.approvalPolicy,
        input: buildExecutorTurnInput(executorContext),
        plannerContext: null,
        sandboxPolicy: executorPolicy.sandboxPolicy,
      };
    }

    const readOnlyPolicy = buildReadOnlyTurnPolicy();

    return {
      approvalPolicy: readOnlyPolicy.approvalPolicy,
      input: buildReadOnlyTurnInput({
        mission: input.mission,
        proofBundle: input.proofBundle,
        task: input.task,
      }),
      plannerContext: null,
      sandboxPolicy: readOnlyPolicy.sandboxPolicy,
    };
  }

  private async failExecutorForMissingPlannerArtifact(taskId: string) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);

      if (task.status !== "claimed") {
        return task;
      }

      await this.missionRepository.updateTaskSummary(
        taskId,
        buildMissingPlannerArtifactSummary(),
        session,
      );
      const failedTask = await this.missionRepository.updateTaskStatus(
        taskId,
        "failed",
        session,
      );

      await this.appendTaskStatusChanged(
        failedTask,
        task.status,
        failedTask.status,
        taskStatusChangeReasons.executorMissingPlannerArtifact,
        session,
      );
      await this.workspaceService.releaseTaskWorkspaceLease(taskId, session);

      return failedTask;
    });
  }
}

function isTerminalTaskStatus(status: MissionTaskStatus) {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}
