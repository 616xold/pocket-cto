import { describe, expect, it } from "vitest";
import { buildExecutorTurnPolicy, buildReadOnlyTurnPolicy } from "./config";

describe("runtime turn policy builders", () => {
  it("keeps the existing read-only policy for planner and non-executor turns", () => {
    const policy = buildReadOnlyTurnPolicy("planner");

    expect(policy.approvalPolicy).toBe("never");
    expect(policy.sandboxPolicy).toMatchObject({
      type: "readOnly",
      networkAccess: false,
    });
  });

  it("builds a workspace-write executor policy constrained to the task workspace root", () => {
    const policy = buildExecutorTurnPolicy(
      "executor",
      "/tmp/pocket-cto-executor-policy-workspace",
    );

    expect(policy.approvalPolicy).toBe("on-request");
    expect(policy.sandboxPolicy).toEqual({
      type: "workspaceWrite",
      writableRoots: ["/tmp/pocket-cto-executor-policy-workspace"],
      readOnlyAccess: {
        type: "fullAccess",
      },
      networkAccess: false,
      excludeTmpdirEnvVar: false,
      excludeSlashTmp: false,
    });
  });
});
