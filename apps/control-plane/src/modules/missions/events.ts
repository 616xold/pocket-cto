import type { MissionStatus } from "@pocket-cto/domain";

export const missionStatusChangeReasons = {
  runtimeTurnStarted: "runtime_turn_started",
  tasksMaterialized: "tasks_materialized",
} as const;

export type MissionStatusChangedPayload = {
  from: MissionStatus;
  to: MissionStatus;
  reason: (typeof missionStatusChangeReasons)[keyof typeof missionStatusChangeReasons];
};

export function buildQueuedMissionStatusChangedPayload(
  from: MissionStatus,
  to: MissionStatus,
): MissionStatusChangedPayload {
  return {
    from,
    to,
    reason: missionStatusChangeReasons.tasksMaterialized,
  };
}

export function buildRuntimeStartedMissionStatusChangedPayload(
  from: MissionStatus,
  to: MissionStatus,
): MissionStatusChangedPayload {
  return {
    from,
    to,
    reason: missionStatusChangeReasons.runtimeTurnStarted,
  };
}
