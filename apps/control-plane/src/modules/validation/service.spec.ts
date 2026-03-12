import { describe, expect, it } from "vitest";
import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import { LocalExecutorValidationService } from "./service";
import type { WorkspaceValidationGitClient } from "./git-client";
import type { ExecutorValidationHook } from "./types";

describe("LocalExecutorValidationService", () => {
  it("passes when changed paths stay inside the allowlist and diff check succeeds", async () => {
    const service = new LocalExecutorValidationService(
      createGitClient({
        changedPaths: ["apps/web/login.tsx"],
        diffCheckOutput: null,
        diffCheckOk: true,
      }),
    );

    const result = await service.validateExecutorTurn(buildValidationContext());

    expect(result.status).toBe("passed");
    expect(result.failureCode).toBe("none");
    expect(result.changedPaths).toEqual(["apps/web/login.tsx"]);
    expect(result.escapedPaths).toEqual([]);
    expect(result.diffCheckPassed).toBe(true);
  });

  it("fails when a changed path escapes the allowlist", async () => {
    const service = new LocalExecutorValidationService(
      createGitClient({
        changedPaths: ["apps/api/server.ts"],
        diffCheckOutput: null,
        diffCheckOk: true,
      }),
    );

    const result = await service.validateExecutorTurn(buildValidationContext());

    expect(result.status).toBe("failed");
    expect(result.failureCode).toBe("guardrail_failed");
    expect(result.escapedPaths).toEqual(["apps/api/server.ts"]);
    expect(result.checks[0]).toMatchObject({
      name: "changed_paths",
      status: "failed",
    });
  });

  it("fails when the executor completed without changing any files", async () => {
    const service = new LocalExecutorValidationService(
      createGitClient({
        changedPaths: [],
        diffCheckOutput: null,
        diffCheckOk: true,
      }),
    );

    const result = await service.validateExecutorTurn(buildValidationContext());

    expect(result.status).toBe("failed");
    expect(result.failureCode).toBe("no_changes");
    expect(result.checks[0]).toMatchObject({
      code: "no_changes",
      name: "changed_paths",
      status: "failed",
    });
  });

  it("fails when git diff --check reports a formatting error", async () => {
    const service = new LocalExecutorValidationService(
      createGitClient({
        changedPaths: ["apps/web/login.tsx"],
        diffCheckOutput: "apps/web/login.tsx:1: trailing whitespace.",
        diffCheckOk: false,
      }),
    );

    const result = await service.validateExecutorTurn(buildValidationContext());

    expect(result.status).toBe("failed");
    expect(result.failureCode).toBe("guardrail_failed");
    expect(result.diffCheckPassed).toBe(false);
    expect(result.diffCheckOutput).toContain("trailing whitespace");
    expect(result.checks[1]).toMatchObject({
      name: "git_diff_check",
      status: "failed",
    });
  });

  it("returns a structured failed report when a validation hook throws", async () => {
    const service = new LocalExecutorValidationService(createGitClient({
      changedPaths: ["apps/web/login.tsx"],
      diffCheckOutput: null,
      diffCheckOk: true,
    }), [
      {
        name: "changed_paths",
        async run() {
          throw new Error("git status failed");
        },
      },
      {
        name: "git_diff_check",
        async run() {
          return {
            name: "git_diff_check",
            status: "passed" as const,
            summary: "git diff --check passed.",
          };
        },
      },
    ] satisfies ExecutorValidationHook[]);

    const result = await service.validateExecutorTurn(buildValidationContext());

    expect(result.status).toBe("failed");
    expect(result.failureCode).toBe("guardrail_failed");
    expect(result.checks[0]).toMatchObject({
      code: "hook_error",
      details: {
        error: {
          message: "git status failed",
          name: "Error",
        },
      },
      name: "changed_paths",
      status: "failed",
    });
  });
});

function createGitClient(input: {
  changedPaths: string[];
  diffCheckOk: boolean;
  diffCheckOutput: string | null;
}): WorkspaceValidationGitClient {
  return {
    async collectChangedPaths() {
      return input.changedPaths;
    },
    async runDiffCheck() {
      return {
        ok: input.diffCheckOk,
        output: input.diffCheckOutput,
      };
    },
  };
}

function buildValidationContext() {
  return {
    mission: {
      id: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
      type: "build",
      status: "running",
      title: "Implement passkeys",
      objective: "Add passkey sign-in without breaking email login",
      sourceKind: "manual_text",
      sourceRef: null,
      createdBy: "operator",
      primaryRepo: "web",
      spec: {
        type: "build",
        title: "Implement passkeys",
        objective: "Add passkey sign-in without breaking email login",
        repos: ["web"],
        constraints: {
          mustNot: ["disable email login"],
          allowedPaths: ["apps/web"],
          targetBranch: "main",
        },
        acceptance: ["passkeys work"],
        riskBudget: {
          sandboxMode: "patch-only",
          maxWallClockMinutes: 60,
          maxCostUsd: 10,
          allowNetwork: false,
          requiresHumanApprovalFor: ["merge"],
        },
        deliverables: ["plan", "proof_bundle"],
        evidenceRequirements: ["test report"],
      },
      createdAt: "2026-03-11T00:00:00.000Z",
      updatedAt: "2026-03-11T00:00:00.000Z",
    } satisfies MissionRecord,
    task: {
      id: "c0d4e804-7815-49d8-916a-318152db49c5",
      missionId: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
      role: "executor",
      sequence: 1,
      status: "running",
      attemptCount: 1,
      codexThreadId: "thread_1",
      codexTurnId: "turn_1",
      workspaceId: "75716c4c-cadf-4bc6-94a5-6c42a213b3a5",
      dependsOnTaskId: "3b3fc6e9-4ef0-484b-a4ac-c81851d86f6e",
      summary: null,
      createdAt: "2026-03-11T00:00:00.000Z",
      updatedAt: "2026-03-11T00:00:00.000Z",
    } satisfies MissionTaskRecord,
    workspaceRoot: "/tmp/pocket-cto-executor-validation",
  };
}
