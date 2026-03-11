import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export async function createTempGitRepo() {
  const repoRoot = await mkdtemp(join(tmpdir(), "pocket-cto-source-repo-"));

  await execFile("git", ["init", "-q"], {
    cwd: repoRoot,
  });
  await execFile("git", ["config", "user.email", "codex@example.com"], {
    cwd: repoRoot,
  });
  await execFile("git", ["config", "user.name", "Codex"], {
    cwd: repoRoot,
  });
  await writeFile(join(repoRoot, "README.md"), "temp repo\n");
  await execFile("git", ["add", "README.md"], {
    cwd: repoRoot,
  });
  await execFile("git", ["commit", "-q", "-m", "init"], {
    cwd: repoRoot,
  });

  return {
    async cleanup() {
      await rm(repoRoot, {
        force: true,
        recursive: true,
      });
    },
    repoRoot: await realpath(repoRoot),
  };
}

export async function createTempWorkspaceRoot() {
  const workspaceRoot = await mkdtemp(join(tmpdir(), "pocket-cto-workspaces-"));

  return {
    async cleanup() {
      await rm(workspaceRoot, {
        force: true,
        recursive: true,
      });
    },
    workspaceRoot: await realpath(workspaceRoot),
  };
}

export async function listWorktreePaths(repoRoot: string) {
  const { stdout } = await execFile("git", ["worktree", "list", "--porcelain"], {
    cwd: repoRoot,
  });

  return stdout
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length).trim());
}

export async function readCurrentBranch(cwd: string) {
  const { stdout } = await execFile("git", ["branch", "--show-current"], {
    cwd,
  });

  return stdout.trim();
}
