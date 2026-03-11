import { afterEach, describe, expect, it } from "vitest";
import { LocalWorkspaceGitManager } from "./git-manager";
import { InMemoryWorkspaceRepository } from "./repository";
import { WorkspaceService } from "./service";
import { createTempGitRepo, createTempWorkspaceRoot, listWorktreePaths, readCurrentBranch } from "./test-git";

const cleanups: Array<() => Promise<void>> = [];

describe("WorkspaceService", () => {
  afterEach(async () => {
    while (cleanups.length > 0) {
      const cleanup = cleanups.pop();
      await cleanup?.();
    }
  });

  it("creates deterministic task worktrees and reuses the same workspace on reacquisition", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const missionId = "11111111-1111-4111-8111-111111111111";
    const taskId = "22222222-2222-4222-8222-222222222222";
    const service = new WorkspaceService(
      new InMemoryWorkspaceRepository(),
      new LocalWorkspaceGitManager(),
      {
        leaseDurationMs: 60_000,
        leaseOwner: "pocket-cto-worker:test:123",
        sourceRepoRoot: sourceRepo.repoRoot,
        workspaceRoot: workspaceRoot.workspaceRoot,
      },
      () => new Date("2026-03-11T00:00:00.000Z"),
    );
    const task = {
      id: taskId,
      missionId,
      role: "planner" as const,
      sequence: 0,
      workspaceId: null,
    };

    const firstWorkspace = await service.ensureTaskWorkspace({
      sandboxMode: "read-only",
      task,
    });
    const secondWorkspace = await service.ensureTaskWorkspace({
      sandboxMode: "read-only",
      task: {
        ...task,
        workspaceId: firstWorkspace.id,
      },
    });

    expect(firstWorkspace).toMatchObject({
      branchName: `pocket-cto/${missionId}/0-planner`,
      repo: sourceRepo.repoRoot,
      rootPath: `${workspaceRoot.workspaceRoot}/${missionId}/0-planner`,
    });
    expect(secondWorkspace.id).toBe(firstWorkspace.id);
    expect(secondWorkspace.rootPath).toBe(firstWorkspace.rootPath);

    const [currentBranch, worktreePaths] = await Promise.all([
      readCurrentBranch(firstWorkspace.rootPath),
      listWorktreePaths(sourceRepo.repoRoot),
    ]);

    expect(currentBranch).toBe(`pocket-cto/${missionId}/0-planner`);
    expect(worktreePaths).toContain(firstWorkspace.rootPath);
    expect(worktreePaths.filter((path) => path === firstWorkspace.rootPath)).toHaveLength(1);
  });
});

