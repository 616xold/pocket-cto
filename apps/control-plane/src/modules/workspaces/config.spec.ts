import { describe, expect, it } from "vitest";
import {
  buildDefaultWorkspaceRoot,
  resolveWorkspaceServiceConfig,
} from "./config";

describe("resolveWorkspaceServiceConfig", () => {
  const sourceRepoRoot = "/tmp/pocket-cto/source-repo";

  it("derives a default workspace root outside the resolved source repo", async () => {
    const config = await resolveWorkspaceServiceConfig({
      env: {
        POCKET_CTO_SOURCE_REPO_ROOT: sourceRepoRoot,
        WORKSPACE_ROOT: "",
      },
      gitManager: {
        resolveRepoRoot: async () => sourceRepoRoot,
      },
      leaseOwner: "pocket-cto-worker:test:1",
      processCwd: "/tmp/pocket-cto/worker-cwd",
    });

    expect(config.sourceRepoRoot).toBe(sourceRepoRoot);
    expect(config.workspaceRoot).toBe(buildDefaultWorkspaceRoot(sourceRepoRoot));
    expect(config.workspaceRoot.startsWith(`${sourceRepoRoot}/`)).toBe(false);
    expect(config.workspaceRoot).not.toBe(sourceRepoRoot);
  });

  it("rejects a workspace root nested inside the source repo", async () => {
    await expect(
      resolveWorkspaceServiceConfig({
        env: {
          POCKET_CTO_SOURCE_REPO_ROOT: sourceRepoRoot,
          WORKSPACE_ROOT: "source-repo/.workspaces",
        },
        gitManager: {
          resolveRepoRoot: async () => sourceRepoRoot,
        },
        leaseOwner: "pocket-cto-worker:test:1",
        processCwd: "/tmp/pocket-cto/worker-cwd",
      }),
    ).rejects.toThrow(
      `Resolved workspace root ${sourceRepoRoot}/.workspaces must sit outside source repo root ${sourceRepoRoot}.`,
    );
  });

  it("rejects a workspace root equal to the source repo", async () => {
    await expect(
      resolveWorkspaceServiceConfig({
        env: {
          POCKET_CTO_SOURCE_REPO_ROOT: sourceRepoRoot,
          WORKSPACE_ROOT: sourceRepoRoot,
        },
        gitManager: {
          resolveRepoRoot: async () => sourceRepoRoot,
        },
        leaseOwner: "pocket-cto-worker:test:1",
        processCwd: "/tmp/pocket-cto/worker-cwd",
      }),
    ).rejects.toThrow(
      `Resolved workspace root ${sourceRepoRoot} must not equal source repo root ${sourceRepoRoot}.`,
    );
  });

  it("resolves a relative external workspace root against the source repo parent", async () => {
    const config = await resolveWorkspaceServiceConfig({
      env: {
        POCKET_CTO_SOURCE_REPO_ROOT: sourceRepoRoot,
        WORKSPACE_ROOT: "task-workspaces",
      },
      gitManager: {
        resolveRepoRoot: async () => sourceRepoRoot,
      },
      leaseOwner: "pocket-cto-worker:test:1",
      processCwd: "/tmp/pocket-cto/worker-cwd",
    });

    expect(config.workspaceRoot).toBe("/tmp/pocket-cto/task-workspaces");
  });
});
