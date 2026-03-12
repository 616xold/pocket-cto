import type {
  MissionTaskStatus,
  TaskStatusChangeReason,
  TaskStatusChangedPayload,
} from "@pocket-cto/domain";

export const taskStatusChangeReasons = {
  approvalRequested: "approval_requested",
  approvalResolved: "approval_resolved",
  executorMissingPlannerArtifact: "executor_missing_planner_artifact",
  executorNoChanges: "executor_no_changes",
  executorValidationFailed: "executor_validation_failed",
  plannerEvidenceFailed: "planner_evidence_failed",
  runtimeTurnCompleted: "runtime_turn_completed",
  runtimeTurnFailed: "runtime_turn_failed",
  runtimeTurnInterrupted: "runtime_turn_interrupted",
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
