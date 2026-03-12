import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import type { ExecutorPlannerArtifactRecord } from "../missions/planner-artifact";
import type { WorkspaceRecord } from "../workspaces";
import { loadExecutorPromptContext } from "./executor-context";
import { buildExecutorTurnInput } from "./executor-prompt";

const tempDirs: string[] = [];

describe("executor prompt builder", () => {
  afterEach(async () => {
    while (tempDirs.length > 0) {
      const directory = tempDirs.pop();
      if (directory) {
        await rm(directory, { force: true, recursive: true });
      }
    }
  });

  it("includes planner handoff, allowed-path rules, and the required executor report sections", async () => {
    const workspaceRoot = await createTempWorkspace();
    await writeFile(
      join(workspaceRoot, "WORKFLOW.md"),
      [
        "# Workflow contract",
        "",
        "1. keep work inside the assigned workspace",
        "2. run validation before completion",
      ].join("\n"),
      "utf8",
    );
    const context = await loadExecutorPromptContext({
      mission: buildMissionRecord(),
      plannerArtifact: buildPlannerArtifact(),
      task: buildExecutorTaskRecord(),
      workspace: buildWorkspaceRecord(workspaceRoot),
    });

    const input = getTextInput(buildExecutorTurnInput(context));

    expect(input.text).toContain("Objective: Add passkey sign-in without breaking email login");
    expect(input.text).toContain("Planner artifact id: plan-artifact-1");
    expect(input.text).toContain("Resolution strategy: dependency_task");
    expect(input.text).toContain("Planner summary: Preserve email login while adding passkeys.");
    expect(input.text).toContain("## Proposed steps");
    expect(input.text).toContain("You may mutate only these relative paths under the task workspace root: apps/web, packages/domain");
    expect(input.text).toContain("Do not change branches, create commits, push, merge, rebase");
    expect(input.text).toContain("Do not use network access.");
    expect(input.text).toContain("Do not run installs, generators, migrations, package manager commands, or formatters.");
    expect(input.text).toContain("run validation before completion");
    expect(input.text).toContain("## Intended change");
    expect(input.text).toContain("## Files changed");
    expect(input.text).toContain("## Validations run");
    expect(input.text).toContain("## Remaining risks");
    expect(input.text).toContain("## Operator handoff");
  });
});

function getTextInput(
  input: ReturnType<typeof buildExecutorTurnInput>,
) {
  const [firstInput] = input;

  if (!firstInput || firstInput.type !== "text") {
    throw new Error("Executor prompt did not produce text input");
  }

  return firstInput;
}

async function createTempWorkspace() {
  const directory = await mkdtemp(join(tmpdir(), "pocket-cto-executor-prompt-"));
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

function buildExecutorTaskRecord(): MissionTaskRecord {
  return {
    id: "c0d4e804-7815-49d8-916a-318152db49c5",
    missionId: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
    role: "executor",
    sequence: 1,
    status: "claimed",
    attemptCount: 1,
    codexThreadId: null,
    codexTurnId: null,
    workspaceId: "75716c4c-cadf-4bc6-94a5-6c42a213b3a5",
    dependsOnTaskId: "3b3fc6e9-4ef0-484b-a4ac-c81851d86f6e",
    summary: null,
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  };
}

function buildPlannerArtifact(): ExecutorPlannerArtifactRecord {
  return {
    artifactId: "plan-artifact-1",
    body: [
      "## Objective understanding",
      "Plan the passkey work without breaking email login.",
      "",
      "## Proposed steps",
      "1. Update the sign-in page.",
      "2. Add domain wiring for passkeys.",
    ].join("\n"),
    justification: "Using dependency task 0 plan artifact plan-artifact-1.",
    resolution: "dependency_task",
    sourceTaskId: "3b3fc6e9-4ef0-484b-a4ac-c81851d86f6e",
    sourceTaskSequence: 0,
    summary: "Preserve email login while adding passkeys.",
    uri: "pocket-cto://missions/0f35cae6/tasks/plan",
  };
}

function buildWorkspaceRecord(rootPath: string): WorkspaceRecord {
  return {
    id: "75716c4c-cadf-4bc6-94a5-6c42a213b3a5",
    missionId: "0f35cae6-a962-4296-9aa7-a888ed7a460d",
    taskId: "c0d4e804-7815-49d8-916a-318152db49c5",
    repo: "/tmp/source-repo",
    rootPath,
    branchName: "pocket-cto/0f35cae6/1-executor",
    sandboxMode: "workspace-write",
    leaseOwner: "worker:test",
    leaseExpiresAt: "2026-03-11T01:00:00.000Z",
    isActive: true,
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  };
}
