import type {
  MissionSpec,
  MissionStatus,
  MissionTaskRecord,
  MissionTaskStatus,
} from "@pocket-cto/domain";

export function buildInitialTaskRolesForMission(spec: MissionSpec) {
  switch (spec.type) {
    case "build":
      return ["planner", "executor"] as const;
    case "discovery":
      return ["scout"] as const;
    case "incident":
      return ["scout", "executor", "reviewer"] as const;
    case "release":
      return ["planner", "reviewer"] as const;
  }

  const unexpectedType: never = spec.type;
  throw new Error(`Unsupported mission type: ${unexpectedType}`);
}

export function isTerminalTaskStatus(
  status: MissionTaskRecord["status"],
): boolean {
  return ["succeeded", "failed", "cancelled"].includes(status);
}

export function isTaskRunnable(input: {
  missionStatus: MissionStatus;
  taskStatus: MissionTaskStatus;
  dependencyStatus: MissionTaskStatus | null;
}) {
  return (
    ["queued", "running"].includes(input.missionStatus) &&
    input.taskStatus === "pending" &&
    (input.dependencyStatus === null || input.dependencyStatus === "succeeded")
  );
}
