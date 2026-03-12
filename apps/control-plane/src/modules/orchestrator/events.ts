import type {
  MissionTaskStatus,
  TaskStatusChangeReason,
  TaskStatusChangedPayload,
} from "@pocket-cto/domain";

export const taskStatusChangeReasons = {
  executorMissingPlannerArtifact: "executor_missing_planner_artifact",
  executorValidationFailed: "executor_validation_failed",
  runtimeTurnCompleted: "runtime_turn_completed",
  runtimeTurnFailed: "runtime_turn_failed",
  runtimeTurnStarted: "runtime_turn_started",
  taskCompleted: "task_completed",
  workerClaimed: "worker_claimed",
} as const satisfies Record<string, TaskStatusChangeReason>;

export function buildTaskStatusChangedPayload(
  from: MissionTaskStatus,
  to: MissionTaskStatus,
  reason: TaskStatusChangeReason,
): TaskStatusChangedPayload {
  return {
    from,
    to,
    reason,
  };
}
