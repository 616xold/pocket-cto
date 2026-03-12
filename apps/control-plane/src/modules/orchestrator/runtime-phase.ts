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
  buildExecutorTerminalizationFailureSummary,
  buildMissingPlannerArtifactSummary,
} from "../evidence/executor-output";
import type { EvidenceService } from "../evidence/service";
import type { ApprovalService } from "../approvals/service";
import {
  buildPlannerEvidenceFailureSummary,
  persistPlannerTurnEvidence,
  preparePlannerTurnEvidence,
  type PreparedPlannerTurnEvidence,
} from "../evidence/planner-output";
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

type TurnCompletionOutcome = {
  nextStatus: MissionTaskStatus;
  preparedPlannerEvidence: PreparedPlannerTurnEvidence | null;
  reason: TaskStatusChangeReason;
  summary: string | null;
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
    private readonly approvalService: Pick<
      ApprovalService,
      "requestCommandExecutionApproval" | "requestFileChangeApproval"
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
        taskId: task.id,
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
        onCommandExecutionApprovalRequest: (event) =>
          this.approvalService.requestCommandExecutionApproval({
            taskId,
            ...event,
          }),
        onFileChangeApprovalRequest: (event) =>
          this.approvalService.requestFileChangeApproval({
            taskId,
            ...event,
          }),
      },
    );
    const completionOutcome = await this.resolveTurnCompletionOutcome({
      mission,
      plannerContext,
      proofBundle,
      task,
      turn,
      workspaceRoot: workspace.rootPath,
    });

    const updatedTask = await this.handleTurnCompleted(
      taskId,
      turn,
      task.role,
      completionOutcome,
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
    taskRole: MissionTaskRecord["role"],
    completionOutcome: TurnCompletionOutcome,
  ) {
    try {
      return await this.persistTurnCompletionOutcome(
        taskId,
        turn,
        completionOutcome,
      );
    } catch (error) {
      const fallbackOutcome = this.buildFallbackTurnCompletionOutcome({
        completionOutcome,
        error,
        taskRole,
        turn,
      });

      return this.persistTurnCompletionOutcome(taskId, turn, fallbackOutcome);
    }
  }

  private async resolveTurnCompletionOutcome(input: {
    mission: MissionRecord;
    plannerContext: PlannerPromptContext | null;
    proofBundle: ProofBundleManifest | null;
    task: MissionTaskRecord;
    turn: RuntimeCodexRunTurnResult;
    workspaceRoot: string;
  }): Promise<TurnCompletionOutcome> {
    if (input.turn.status === "interrupted") {
      return {
        nextStatus: "cancelled",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.runtimeTurnInterrupted,
        summary: null,
      };
    }

    if (input.turn.status !== "completed") {
      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.runtimeTurnFailed,
        summary: null,
      };
    }

    if (input.task.role === "executor") {
      return this.resolveExecutorTurnCompletionOutcome(input);
    }

    if (input.task.role === "planner") {
      return this.resolvePlannerTurnCompletionOutcome(input);
    }

    return {
      nextStatus: "succeeded",
      preparedPlannerEvidence: null,
      reason: taskStatusChangeReasons.runtimeTurnCompleted,
      summary: null,
    };
  }

  private async resolveExecutorTurnCompletionOutcome(input: {
    mission: MissionRecord;
    task: MissionTaskRecord;
    turn: RuntimeCodexRunTurnResult;
    workspaceRoot: string;
  }): Promise<TurnCompletionOutcome> {
    try {
      const validation = await this.validationService.validateExecutorTurn({
        mission: input.mission,
        task: input.task,
        workspaceRoot: input.workspaceRoot,
      });
      const summary = buildExecutorTaskSummary({
        turn: input.turn,
        validation,
      });

      return {
        nextStatus: validation.status === "passed" ? "succeeded" : "failed",
        preparedPlannerEvidence: null,
        reason:
          validation.status === "passed"
            ? taskStatusChangeReasons.runtimeTurnCompleted
            : validation.failureCode === "no_changes"
              ? taskStatusChangeReasons.executorNoChanges
              : taskStatusChangeReasons.executorValidationFailed,
        summary,
      };
    } catch (error) {
      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.executorValidationFailed,
        summary: buildExecutorTerminalizationFailureSummary(error),
      };
    }
  }

  private resolvePlannerTurnCompletionOutcome(input: {
    mission: MissionRecord;
    plannerContext: PlannerPromptContext | null;
    proofBundle: ProofBundleManifest | null;
    task: MissionTaskRecord;
    turn: RuntimeCodexRunTurnResult;
  }): TurnCompletionOutcome {
    try {
      const preparedPlannerEvidence = preparePlannerTurnEvidence({
        evidenceService: this.evidenceService,
        mission: input.mission,
        plannerContext: input.plannerContext,
        proofBundle: input.proofBundle,
        task: input.task,
        turn: input.turn,
      });

      return {
        nextStatus: "succeeded",
        preparedPlannerEvidence,
        reason: taskStatusChangeReasons.runtimeTurnCompleted,
        summary: preparedPlannerEvidence?.summary ?? null,
      };
    } catch (error) {
      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.plannerEvidenceFailed,
        summary: buildPlannerEvidenceFailureSummary(error),
      };
    }
  }

  private async persistTurnCompletionOutcome(
    taskId: string,
    turn: RuntimeCodexRunTurnResult,
    completionOutcome: TurnCompletionOutcome,
  ) {
    return this.missionRepository.transaction(async (session) => {
      const task = await this.getRequiredTask(taskId, session);

      this.assertTurnCompletionState(task, turn);

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

      if (completionOutcome.summary !== null) {
        await this.missionRepository.updateTaskSummary(
          taskId,
          completionOutcome.summary,
          session,
        );
      }

      const finalizedTask = await this.missionRepository.updateTaskStatus(
        taskId,
        completionOutcome.nextStatus,
        session,
      );

      await this.appendTaskStatusChanged(
        finalizedTask,
        task.status,
        finalizedTask.status,
        completionOutcome.reason,
        session,
      );

      if (completionOutcome.preparedPlannerEvidence) {
        await persistPlannerTurnEvidence({
          deps: {
            evidenceService: this.evidenceService,
            missionRepository: this.missionRepository,
            replayService: this.replayService,
          },
          preparedEvidence: completionOutcome.preparedPlannerEvidence,
          session,
          task: finalizedTask,
          turn,
        });
      }

      await this.workspaceService.releaseTaskWorkspaceLease(taskId, session);

      return finalizedTask;
    });
  }

  private buildFallbackTurnCompletionOutcome(input: {
    completionOutcome: TurnCompletionOutcome;
    error: unknown;
    taskRole: MissionTaskRecord["role"];
    turn: RuntimeCodexRunTurnResult;
  }): TurnCompletionOutcome {
    if (input.turn.status === "interrupted") {
      return {
        nextStatus: "cancelled",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.runtimeTurnInterrupted,
        summary: input.completionOutcome.summary,
      };
    }

    if (input.turn.status !== "completed") {
      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.runtimeTurnFailed,
        summary: input.completionOutcome.summary,
      };
    }

    if (input.taskRole === "planner") {
      const plannerEvidenceFailed =
        input.completionOutcome.preparedPlannerEvidence !== null ||
        input.completionOutcome.reason === taskStatusChangeReasons.plannerEvidenceFailed;

      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: plannerEvidenceFailed
          ? taskStatusChangeReasons.plannerEvidenceFailed
          : taskStatusChangeReasons.runtimeTurnFailed,
        summary: plannerEvidenceFailed
          ? buildPlannerEvidenceFailureSummary(input.error)
          : input.completionOutcome.summary,
      };
    }

    if (input.taskRole === "executor") {
      if (input.completionOutcome.reason === taskStatusChangeReasons.executorNoChanges) {
        return {
          nextStatus: "failed",
          preparedPlannerEvidence: null,
          reason: taskStatusChangeReasons.executorNoChanges,
          summary: input.completionOutcome.summary,
        };
      }

      return {
        nextStatus: "failed",
        preparedPlannerEvidence: null,
        reason: taskStatusChangeReasons.executorValidationFailed,
        summary: buildExecutorTerminalizationFailureSummary(input.error),
      };
    }

    return {
      nextStatus: "failed",
      preparedPlannerEvidence: null,
      reason: taskStatusChangeReasons.runtimeTurnFailed,
      summary: input.completionOutcome.summary,
    };
  }

  private assertTurnCompletionState(
    task: MissionTaskRecord,
    turn: RuntimeCodexRunTurnResult,
  ) {
    if (task.status !== "running" && task.status !== "awaiting_approval") {
      throw new Error(
        `Task ${task.id} changed state before turn completion persistence: ${task.status}`,
      );
    }

    if (task.codexThreadId !== turn.threadId) {
      throw new Error(
        `Task ${task.id} thread mismatch at turn completion: expected ${task.codexThreadId ?? "null"}, got ${turn.threadId}`,
      );
    }

    if (task.codexTurnId !== turn.turnId) {
      throw new Error(
        `Task ${task.id} turn mismatch at completion: expected ${task.codexTurnId ?? "null"}, got ${turn.turnId}`,
      );
    }
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
      const readOnlyPolicy = buildReadOnlyTurnPolicy(input.task.role);

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
      const executorPolicy = buildExecutorTurnPolicy(
        input.task.role,
        input.workspace.rootPath,
      );

      return {
        approvalPolicy: executorPolicy.approvalPolicy,
        input: buildExecutorTurnInput(executorContext),
        plannerContext: null,
        sandboxPolicy: executorPolicy.sandboxPolicy,
      };
    }

    const readOnlyPolicy = buildReadOnlyTurnPolicy(input.task.role);

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
