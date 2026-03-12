import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export interface WorkspaceValidationGitClient {
  collectChangedPaths(workspaceRoot: string): Promise<string[]>;
  runDiffCheck(
    workspaceRoot: string,
  ): Promise<{ ok: boolean; output: string | null }>;
}

export class LocalWorkspaceValidationGitClient
  implements WorkspaceValidationGitClient
{
  async collectChangedPaths(workspaceRoot: string) {
    const [diffPaths, untrackedPaths] = await Promise.all([
      this.readGitLines(workspaceRoot, ["diff", "--name-only", "--relative", "HEAD", "--"]),
      this.readGitLines(workspaceRoot, ["ls-files", "--others", "--exclude-standard"]),
    ]);

    return Array.from(
      new Set(
        [...diffPaths, ...untrackedPaths]
          .map(normalizeRelativePath)
          .filter((path) => path.length > 0),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }

  async runDiffCheck(workspaceRoot: string) {
    try {
      await execFile("git", ["diff", "--check", "--relative", "HEAD", "--"], {
        cwd: workspaceRoot,
      });

      return {
        ok: true,
        output: null,
      };
    } catch (error) {
      return {
        ok: false,
        output: formatExecError(error),
      };
    }
  }

  private async readGitLines(workspaceRoot: string, args: string[]) {
    const { stdout } = await execFile("git", args, {
      cwd: workspaceRoot,
    });

    return stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

function normalizeRelativePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\.\/+/, "").trim();
}

function formatExecError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const stdout =
      "stdout" in error && typeof error.stdout === "string"
        ? error.stdout.trim()
        : "";
    const stderr =
      "stderr" in error && typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";

    return [stdout, stderr].filter(Boolean).join("\n") || String(error);
  }

  return String(error);
}
