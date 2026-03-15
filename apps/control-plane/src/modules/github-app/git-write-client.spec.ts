import { appendFile, readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import {
  createTempGitRepo,
} from "../workspaces/test-git";
import {
  GitHubWorkspaceNoChangesError,
} from "./errors";
import { LocalGitHubWriteClient } from "./git-write-client";

describe("LocalGitHubWriteClient", () => {
  it("creates a local commit for validated workspace changes", async () => {
    const sourceRepo = await createTempGitRepo();

    try {
      await appendFile(
        `${sourceRepo.repoRoot}/README.md`,
        "executor change\n",
        "utf8",
      );

      const client = new LocalGitHubWriteClient();
      const result = await client.createCommit({
        commitMessage: "pocket-cto: test commit",
        workspaceRoot: sourceRepo.repoRoot,
      });
      const headMessage = await readGitValue(sourceRepo.repoRoot, [
        "log",
        "-1",
        "--format=%s",
      ]);

      expect(result.commitSha).toMatch(/^[0-9a-f]{40}$/);
      expect(headMessage).toBe("pocket-cto: test commit");
    } finally {
      await sourceRepo.cleanup();
    }
  });

  it("fails explicitly when there are no commit-ready changes", async () => {
    const sourceRepo = await createTempGitRepo();

    try {
      const client = new LocalGitHubWriteClient();

      await expect(
        client.createCommit({
          commitMessage: "pocket-cto: no-op",
          workspaceRoot: sourceRepo.repoRoot,
        }),
      ).rejects.toBeInstanceOf(GitHubWorkspaceNoChangesError);
    } finally {
      await sourceRepo.cleanup();
    }
  });

  it("uses git plus process-local auth config for https pushes without leaking tokens into args", async () => {
    const runner = vi.fn().mockResolvedValue({
      stderr: "",
      stdout: "",
    });
    const client = new LocalGitHubWriteClient(runner);

    await client.pushBranch({
      branchName: "pocket-cto/mission/1-executor",
      installationToken: "installation-token-123",
      remoteUrl: "https://github.com/616xold/pocket-cto.git",
      repoFullName: "616xold/pocket-cto",
      workspaceRoot: "/tmp/workspace",
    });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith(
      "/tmp/workspace",
      [
        "push",
        "--porcelain",
        "https://github.com/616xold/pocket-cto.git",
        "HEAD:refs/heads/pocket-cto/mission/1-executor",
      ],
      expect.objectContaining({
        env: expect.objectContaining({
          GIT_CONFIG_COUNT: "1",
          GIT_CONFIG_KEY_0:
            "http.https://github.com/616xold/pocket-cto.git.extraheader",
          GIT_TERMINAL_PROMPT: "0",
        }),
      }),
    );

    const args = runner.mock.calls[0]?.[1] ?? [];
    const env = runner.mock.calls[0]?.[2]?.env ?? {};

    expect(args.join(" ")).not.toContain("installation-token-123");
    expect(args.join(" ")).not.toContain("gh ");
    expect(String(env.GIT_CONFIG_VALUE_0)).toContain("AUTHORIZATION: Basic ");
    expect(String(env.GIT_CONFIG_VALUE_0)).not.toContain(
      "installation-token-123",
    );
  });

  it("does not rely on gh CLI or PAT shortcuts in the write implementation", async () => {
    const [gitWriteSource, publishServiceSource] = await Promise.all([
      readFile(new URL("./git-write-client.ts", import.meta.url), "utf8"),
      readFile(new URL("./publish-service.ts", import.meta.url), "utf8"),
    ]);
    const combined = `${gitWriteSource}\n${publishServiceSource}`;

    expect(combined).not.toContain('execFile("gh"');
    expect(combined).not.toContain("personal access token");
    expect(combined).not.toContain(" PAT ");
  });
});

async function readGitValue(cwd: string, args: string[]) {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const result = await run("git", args, {
    cwd,
  });

  return result.stdout.trim();
}
