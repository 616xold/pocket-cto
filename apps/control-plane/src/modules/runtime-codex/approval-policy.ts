import type { MissionTaskRole } from "@pocket-cto/domain";
import type { AskForApproval } from "@pocket-cto/codex-runtime";

export function resolveTaskApprovalPolicy(input: {
  role: MissionTaskRole;
  writesWorkspace: boolean;
}): AskForApproval {
  if (input.role === "executor" && input.writesWorkspace) {
    return "on-request";
  }

  return "never";
}
