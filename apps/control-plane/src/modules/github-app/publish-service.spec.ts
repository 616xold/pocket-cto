import { execFile as execFileCallback } from "node:child_process";
import { appendFile, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it, vi } from "vitest";
import { LocalWorkspaceGitManager } from "../workspaces/git-manager";
import {
  createTempGitRepo,
  createTempWorkspaceRoot,
} from "../workspaces/test-git";
import {
  GitHubBranchAlreadyExistsError,
  GitHubBranchPushError,
  GitHubPullRequestCreateError,
  GitHubRepositoryArchivedError,
  GitHubRepositoryDisabledError,
  GitHubRepositoryInactiveError,
  GitHubRepositoryInstallationUnavailableError,
} from "./errors";
import { LocalGitHubWriteClient } from "./git-write-client";
import { GitHubPublishService } from "./publish-service";

const execFile = promisify(execFileCallback);

describe("GitHubPublishService", () => {
  it("publishes validated executor changes to a branch push and draft PR", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    const remote = await createTempBareRemote();

    try {
      const branchName = "pocket-cto/mission-123/1-executor";
      const worktreePath = `${workspaceRoot.workspaceRoot}/mission-123/1-executor`;
      const gitManager = new LocalWorkspaceGitManager();

      await gitManager.ensureWorktree({
        branchName,
        repoRoot: sourceRepo.repoRoot,
        worktreePath,
      });
      await appendFile(join(worktreePath, "README.md"), "executor change\n", "utf8");

      const createDraftPullRequest = vi.fn().mockResolvedValue({
        draft: true,
        html_url: "https://github.com/616xold/pocket-cto/pull/42",
        number: 42,
      });
      const service = createPublishService({
        apiClient: {
          branchExists: vi.fn().mockResolvedValue(false),
          createDraftPullRequest,
        },
        gitClient: new LocalGitHubWriteClient(),
        remoteUrlFactory: () => remote.remoteUrl,
      });

      const result = await service.publishValidatedExecutorWorkspace({
        executorSummary: "Update README and keep local validation green.",
        mission: createMission({
          id: "mission-123",
          primaryRepo: "616xold/pocket-cto",
          title: "Update README",
        }),
        task: createTask(),
        workspace: {
          branchName,
          rootPath: worktreePath,
        },
      });

      expect(result).toMatchObject({
        baseBranch: "main",
        branchName,
        draft: true,
        headBranch: branchName,
        prNumber: 42,
        prUrl: "https://github.com/616xold/pocket-cto/pull/42",
        repoFullName: "616xold/pocket-cto",
      });
      expect(result.commitSha).toMatch(/^[0-9a-f]{40}$/);
      expect(createDraftPullRequest).toHaveBeenCalledWith(
        "installation-token-123",
        "616xold/pocket-cto",
        expect.objectContaining({
          baseBranch: "main",
          headBranch: branchName,
          title: "Pocket CTO: Update README",
        }),
      );
      expect(await remoteBranchExists(remote.remoteUrl, branchName)).toBe(true);
      expect(
        await readRemoteBranchSubject(remote.remoteUrl, branchName),
      ).toBe("pocket-cto: mission mission-123 task 1-executor");
    } finally {
      await Promise.all([
        sourceRepo.cleanup(),
        workspaceRoot.cleanup(),
        remote.cleanup(),
      ]);
    }
  });

  it.each([
    new GitHubRepositoryInactiveError("616xold/pocket-cto"),
    new GitHubRepositoryArchivedError("616xold/pocket-cto"),
    new GitHubRepositoryDisabledError("616xold/pocket-cto"),
    new GitHubRepositoryInstallationUnavailableError(
      "616xold/pocket-cto",
      "12345",
    ),
  ])("fails explicitly when the repo registry rejects the write target: %s", async (error) => {
    const service = createPublishService({
      targetResolver: {
        getInstallationAccessToken: vi.fn(),
        resolveWritableRepository: vi.fn().mockRejectedValue(error),
      },
    });

    await expect(
      service.publishValidatedExecutorWorkspace({
        executorSummary: "Update README.",
        mission: createMission(),
        task: createTask(),
        workspace: {
          branchName: "pocket-cto/mission-123/1-executor",
          rootPath: "/tmp/workspace",
        },
      }),
    ).rejects.toBe(error);
  });

  it("fails explicitly when the deterministic branch already exists remotely", async () => {
    const service = createPublishService({
      apiClient: {
        branchExists: vi.fn().mockResolvedValue(true),
        createDraftPullRequest: vi.fn(),
      },
    });

    await expect(
      service.publishValidatedExecutorWorkspace({
        executorSummary: "Update README.",
        mission: createMission(),
        task: createTask(),
        workspace: {
          branchName: "pocket-cto/mission-123/1-executor",
          rootPath: "/tmp/workspace",
        },
      }),
    ).rejects.toBeInstanceOf(GitHubBranchAlreadyExistsError);
  });

  it("reports push failure honestly and does not attempt PR creation", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();

    try {
      const branchName = "pocket-cto/mission-123/1-executor";
      const worktreePath = `${workspaceRoot.workspaceRoot}/mission-123/1-executor`;
      const gitManager = new LocalWorkspaceGitManager();

      await gitManager.ensureWorktree({
        branchName,
        repoRoot: sourceRepo.repoRoot,
        worktreePath,
      });
      await appendFile(join(worktreePath, "README.md"), "executor change\n", "utf8");

      const createDraftPullRequest = vi.fn();
      const service = createPublishService({
        apiClient: {
          branchExists: vi.fn().mockResolvedValue(false),
          createDraftPullRequest,
        },
        gitClient: new LocalGitHubWriteClient(),
        remoteUrlFactory: () => join(workspaceRoot.workspaceRoot, "missing.git"),
      });

      await expect(
        service.publishValidatedExecutorWorkspace({
          executorSummary: "Update README and keep local validation green.",
          mission: createMission(),
          task: createTask(),
          workspace: {
            branchName,
            rootPath: worktreePath,
          },
        }),
      ).rejects.toBeInstanceOf(GitHubBranchPushError);
      expect(createDraftPullRequest).not.toHaveBeenCalled();
    } finally {
      await Promise.all([sourceRepo.cleanup(), workspaceRoot.cleanup()]);
    }
  });

  it("reports PR creation failure honestly after the branch push succeeds", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    const remote = await createTempBareRemote();

    try {
      const branchName = "pocket-cto/mission-123/1-executor";
      const worktreePath = `${workspaceRoot.workspaceRoot}/mission-123/1-executor`;
      const gitManager = new LocalWorkspaceGitManager();

      await gitManager.ensureWorktree({
        branchName,
        repoRoot: sourceRepo.repoRoot,
        worktreePath,
      });
      await appendFile(join(worktreePath, "README.md"), "executor change\n", "utf8");

      const service = createPublishService({
        apiClient: {
          branchExists: vi.fn().mockResolvedValue(false),
          createDraftPullRequest: vi
            .fn()
            .mockRejectedValue(new Error("PR validation failed")),
        },
        gitClient: new LocalGitHubWriteClient(),
        remoteUrlFactory: () => remote.remoteUrl,
      });

      await expect(
        service.publishValidatedExecutorWorkspace({
          executorSummary: "Update README and keep local validation green.",
          mission: createMission(),
          task: createTask(),
          workspace: {
            branchName,
            rootPath: worktreePath,
          },
        }),
      ).rejects.toBeInstanceOf(GitHubPullRequestCreateError);
      expect(await remoteBranchExists(remote.remoteUrl, branchName)).toBe(true);
    } finally {
      await Promise.all([
        sourceRepo.cleanup(),
        workspaceRoot.cleanup(),
        remote.cleanup(),
      ]);
    }
  });
});

function createPublishService(input?: {
  apiClient?: {
    branchExists(
      installationAccessToken: string,
      repoFullName: string,
      branchName: string,
    ): Promise<boolean>;
    createDraftPullRequest(
      installationAccessToken: string,
      repoFullName: string,
      request: {
        baseBranch: string;
        body: string;
        headBranch: string;
        title: string;
      },
    ): Promise<{
      draft: boolean;
      html_url: string;
      number: number;
    }>;
  };
  gitClient?: LocalGitHubWriteClient;
  remoteUrlFactory?: (repoFullName: string) => string;
  targetResolver?: {
    getInstallationAccessToken(installationId: string): Promise<{
      expiresAt: string;
      installationId: string;
      permissions: Record<string, string>;
      token: string;
    }>;
    resolveWritableRepository(fullName: string): Promise<{
      installation: {
        accountLogin: string;
        accountType: string;
        appId: string;
        createdAt: string;
        id: string;
        installationId: string;
        lastSyncedAt: string;
        permissions: Record<string, string>;
        suspendedAt: string | null;
        targetId: string | null;
        targetType: string | null;
        updatedAt: string;
      };
      repository: {
        archived: boolean | null;
        createdAt: string;
        defaultBranch: string;
        disabled: boolean | null;
        fullName: string;
        githubRepositoryId: string;
        id: string;
        installationId: string;
        installationRefId: string | null;
        isActive: boolean;
        isPrivate: boolean | null;
        language: string | null;
        lastSyncedAt: string | null;
        name: string;
        ownerLogin: string;
        removedFromInstallationAt: string | null;
        updatedAt: string;
      };
    }>;
  };
}) {
  return new GitHubPublishService({
    apiClient:
      input?.apiClient ?? {
        branchExists: vi.fn().mockResolvedValue(false),
        createDraftPullRequest: vi.fn().mockResolvedValue({
          draft: true,
          html_url: "https://github.com/616xold/pocket-cto/pull/42",
          number: 42,
        }),
      },
    gitClient: input?.gitClient ?? new LocalGitHubWriteClient(),
    remoteUrlFactory: input?.remoteUrlFactory,
    targetResolver:
      input?.targetResolver ?? {
        async getInstallationAccessToken() {
          return {
            expiresAt: "2026-03-16T00:00:00.000Z",
            installationId: "12345",
            permissions: {
              contents: "write",
              metadata: "read",
              pull_requests: "write",
            },
            token: "installation-token-123",
          };
        },
        async resolveWritableRepository() {
          return {
            installation: {
              accountLogin: "616xold",
              accountType: "Organization",
              appId: "98765",
              createdAt: "2026-03-15T00:00:00.000Z",
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              permissions: {
                contents: "write",
                metadata: "read",
                pull_requests: "write",
              },
              suspendedAt: null,
              targetId: "6161234",
              targetType: "Organization",
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
            repository: {
              archived: false,
              createdAt: "2026-03-15T00:00:00.000Z",
              defaultBranch: "main",
              disabled: false,
              fullName: "616xold/pocket-cto",
              githubRepositoryId: "100",
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              installationId: "12345",
              installationRefId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              isActive: true,
              isPrivate: true,
              language: "TypeScript",
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              name: "pocket-cto",
              ownerLogin: "616xold",
              removedFromInstallationAt: null,
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
          };
        },
      },
  });
}

function createMission(
  overrides: Partial<{
    id: string;
    objective: string;
    primaryRepo: string | null;
    title: string;
  }> = {},
) {
  return {
    id: overrides.id ?? "mission-123",
    objective: overrides.objective ?? "Update the README copy.",
    primaryRepo: overrides.primaryRepo ?? "616xold/pocket-cto",
    spec: {
      acceptance: ["update README"],
      constraints: {
        allowedPaths: ["README.md"],
        mustNot: [],
      },
      deliverables: ["pull request"],
      evidenceRequirements: ["test report"],
      objective: overrides.objective ?? "Update the README copy.",
      repos: ["616xold/pocket-cto"],
      riskBudget: {
        allowNetwork: false,
        maxCostUsd: 10,
        maxWallClockMinutes: 60,
        requiresHumanApprovalFor: ["merge"],
        sandboxMode: "patch-only" as const,
      },
      title: overrides.title ?? "Update README",
      type: "build" as const,
    },
    title: overrides.title ?? "Update README",
  };
}

function createTask() {
  return {
    id: "task-123",
    role: "executor" as const,
    sequence: 1,
  };
}

async function createTempBareRemote() {
  const remoteRoot = await mkdtemp(join(tmpdir(), "pocket-cto-remote-"));
  await execFile("git", ["init", "--bare", "-q", remoteRoot]);

  return {
    async cleanup() {
      await rm(remoteRoot, {
        force: true,
        recursive: true,
      });
    },
    remoteUrl: await realpath(remoteRoot),
  };
}

async function remoteBranchExists(remoteUrl: string, branchName: string) {
  const result = await execFile("git", [
    "--git-dir",
    remoteUrl,
    "show-ref",
    "--verify",
    "--quiet",
    `refs/heads/${branchName}`,
  ]);

  return result.stderr.trim() === "";
}

async function readRemoteBranchSubject(remoteUrl: string, branchName: string) {
  const result = await execFile("git", [
    "--git-dir",
    remoteUrl,
    "log",
    "-1",
    "--format=%s",
    branchName,
  ]);

  return result.stdout.trim();
}
