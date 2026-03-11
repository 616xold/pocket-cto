import { execFile as execFileCallback } from "node:child_process";
import { access, mkdir, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export interface WorkspaceGitManager {
  ensureWorktree(input: {
    branchName: string;
    repoRoot: string;
    worktreePath: string;
  }): Promise<void>;

  resolveRepoRoot(cwd: string): Promise<string>;
}

export class LocalWorkspaceGitManager implements WorkspaceGitManager {
  async resolveRepoRoot(cwd: string) {
    const { stdout } = await this.runGit(cwd, [
      "rev-parse",
      "--show-toplevel",
    ]);

    const repoRoot = stdout.trim();

    if (!repoRoot) {
      throw new Error(`Git repo root resolution returned empty output for ${cwd}`);
    }

    return resolve(repoRoot);
  }

  async ensureWorktree(input: {
    branchName: string;
    repoRoot: string;
    worktreePath: string;
  }) {
    const repoRoot = await this.resolveRepoRoot(input.repoRoot);
    const worktreePath = resolve(input.worktreePath);

    await mkdir(dirname(worktreePath), { recursive: true });

    if (await pathExists(worktreePath)) {
      await this.assertExistingWorktree({
        branchName: input.branchName,
        repoRoot,
        worktreePath,
      });
      return;
    }

    const branchExists = await this.gitCommandSucceeds(repoRoot, [
      "show-ref",
      "--verify",
      "--quiet",
      `refs/heads/${input.branchName}`,
    ]);
    const args = branchExists
      ? ["worktree", "add", worktreePath, input.branchName]
      : ["worktree", "add", "-b", input.branchName, worktreePath, "HEAD"];

    await this.runGit(repoRoot, args);
    await this.assertExistingWorktree({
      branchName: input.branchName,
      repoRoot,
      worktreePath,
    });
  }

  private async assertExistingWorktree(input: {
    branchName: string;
    repoRoot: string;
    worktreePath: string;
  }) {
    const actualWorktreeRoot = await this.resolveRepoRoot(input.worktreePath);
    const [expectedWorktreePath, actualWorktreePath] = await Promise.all([
      realpath(input.worktreePath),
      realpath(actualWorktreeRoot),
    ]);

    if (actualWorktreePath !== expectedWorktreePath) {
      throw new Error(
        `Workspace path ${input.worktreePath} is not a git worktree root`,
      );
    }

    const actualBranch = await this.readBranchName(input.worktreePath);
    if (actualBranch !== input.branchName) {
      throw new Error(
        `Workspace path ${input.worktreePath} is on ${actualBranch || "detached HEAD"}, expected ${input.branchName}`,
      );
    }

    const [expectedCommonDir, actualCommonDir] = await Promise.all([
      this.readGitCommonDir(input.repoRoot),
      this.readGitCommonDir(input.worktreePath),
    ]);

    if (expectedCommonDir !== actualCommonDir) {
      throw new Error(
        `Workspace path ${input.worktreePath} is attached to ${actualCommonDir}, expected ${expectedCommonDir}`,
      );
    }
  }

  private async readBranchName(cwd: string) {
    const { stdout } = await this.runGit(cwd, ["branch", "--show-current"]);
    return stdout.trim();
  }

  private async readGitCommonDir(cwd: string) {
    const { stdout } = await this.runGit(cwd, ["rev-parse", "--git-common-dir"]);
    return realpath(resolve(cwd, stdout.trim()));
  }

  private async runGit(cwd: string, args: string[]) {
    try {
      return await execFile("git", args, {
        cwd,
      });
    } catch (error) {
      throw new Error(
        `Git command failed in ${cwd}: git ${args.join(" ")}\n${formatExecError(error)}`,
      );
    }
  }

  private async gitCommandSucceeds(cwd: string, args: string[]) {
    try {
      await execFile("git", args, {
        cwd,
      });
      return true;
    } catch {
      return false;
    }
  }
}

function formatExecError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "stderr" in error &&
    typeof error.stderr === "string"
  ) {
    return error.stderr.trim();
  }

  return String(error);
}

async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
