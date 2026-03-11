import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import { loadPlannerPromptContext } from "./planner-context";
import { buildPlannerTurnInput } from "./planner-prompt";
import type { WorkspaceRecord } from "../workspaces";

const tempDirs: string[] = [];

describe("planner prompt builder", () => {
  afterEach(async () => {
    while (tempDirs.length > 0) {
      const directory = tempDirs.pop();
      if (directory) {
        await rm(directory, { force: true, recursive: true });
      }
    }
  });

  it("includes the mission contract, read-only rules, and required planner sections", async () => {
    const workspaceRoot = await createTempWorkspace();
    const context = await loadPlannerPromptContext({
      mission: buildMissionRecord(),
      task: buildPlannerTaskRecord(),
      workspace: buildWorkspaceRecord(workspaceRoot),
    });

    const input = getTextInput(buildPlannerTurnInput(context));

    expect(input.text).toContain("Objective: Add passkey sign-in without breaking email login");
    expect(input.text).toContain("Acceptance criteria:");
    expect(input.text).toContain("Evidence requirements:");
    expect(input.text).toContain("Do not create, edit, rename, delete, or stage files.");
    expect(input.text).toContain("Do not apply patches or modify git state.");
    expect(input.text).toContain("Do not request approvals for mutation");
    expect(input.text).toContain("## Objective understanding");
    expect(input.text).toContain("## Proposed steps");
    expect(input.text).toContain("## Handoff notes");
  });

  it("injects a bounded WORKFLOW.md excerpt when the workspace root contains one", async () => {
    const workspaceRoot = await createTempWorkspace();
    await writeFile(
      join(workspaceRoot, "WORKFLOW.md"),
      [
        "---",
        "name: test-workflow",
        "---",
        "",
        "# Workflow contract",
        "",
        "1. keep work read-only until approved",
        "2. update the active ExecPlan",
        "3. run validation before completion",
      ].join("\n"),
      "utf8",
    );

    const context = await loadPlannerPromptContext({
      mission: buildMissionRecord(),
      task: buildPlannerTaskRecord(),
      workspace: buildWorkspaceRecord(workspaceRoot),
    });
    const input = getTextInput(buildPlannerTurnInput(context));

    expect(context.workflowPolicy).toMatchObject({
      path: join(workspaceRoot, "WORKFLOW.md"),
    });
    expect(context.workflowPolicy?.excerpt).toContain("keep work read-only until approved");
    expect(input.text).toContain("Repository workflow policy excerpt");
    expect(input.text).toContain("run validation before completion");
  });
});

function getTextInput(
  input: ReturnType<typeof buildPlannerTurnInput>,
) {
  const [firstInput] = input;

  if (!firstInput || firstInput.type !== "text") {
    throw new Error("Planner prompt did not produce text input");
  }

  return firstInput;
}

async function createTempWorkspace() {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cto-planner-prompt-"));
  tempDirs.push(directory);
  return directory;
}

function buildMissionRecord(): MissionRecord {
  return {
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
        allowedPaths: ["apps/web", "packages/domain"],
        targetBranch: "main",
      },
      acceptance: [
        "users can sign in with passkeys",
        "existing email login still works",
      ],
      riskBudget: {
        sandboxMode: "patch-only",
        maxWallClockMinutes: 60,
        maxCostUsd: 10,
        allowNetwork: false,
        requiresHumanApprovalFor: ["merge"],
      },
      deliverables: ["plan", "proof_bundle"],
      evidenceRequirements: ["test report", "rollback note"],
    },
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  };
}

function buildPlannerTaskRecord(): MissionTaskRecord {
  return {
    id: "3b3fc6e9-4ef0-484b-a4ac-c81851d86f6e",
    missionId: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
    role: "planner",
    sequence: 0,
    status: "claimed",
    attemptCount: 1,
    codexThreadId: null,
    codexTurnId: null,
    workspaceId: "75716c4c-cadf-4bc6-94a5-6c42a213b3a5",
    dependsOnTaskId: null,
    summary: null,
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  };
}

function buildWorkspaceRecord(rootPath: string): WorkspaceRecord {
  return {
    id: "75716c4c-cadf-4bc6-94a5-6c42a213b3a5",
    missionId: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
    taskId: "3b3fc6e9-4ef0-484b-a4ac-c81851d86f6e",
    repo: "/tmp/source-repo",
    rootPath,
    branchName: "pocket-cto/0f35cae6/0-planner",
    sandboxMode: "read-only",
    leaseOwner: "worker:test",
    leaseExpiresAt: "2026-03-11T01:00:00.000Z",
    isActive: true,
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  };
}
