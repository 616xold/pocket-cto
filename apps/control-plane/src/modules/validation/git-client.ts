import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    const [trackedDiffCheck, untrackedPaths] = await Promise.all([
      this.runGitCheck(workspaceRoot, ["diff", "--check", "--relative", "HEAD", "--"]),
      this.readGitLines(workspaceRoot, ["ls-files", "--others", "--exclude-standard"]),
    ]);
    const untrackedDiffCheck = await this.runUntrackedDiffCheck(
      workspaceRoot,
      untrackedPaths.map(normalizeRelativePath),
    );

    return mergeDiffCheckResults([trackedDiffCheck, untrackedDiffCheck]);
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

  private async runGitCheck(workspaceRoot: string, args: string[]) {
    try {
      await execFile("git", args, {
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

  private async runUntrackedDiffCheck(
    workspaceRoot: string,
    untrackedPaths: string[],
  ) {
    if (untrackedPaths.length === 0) {
      return {
        ok: true,
        output: null,
      };
    }

    const tempDir = await mkdtemp(join(tmpdir(), "pocket-cto-diff-check-"));
    const emptyFilePath = join(tempDir, "empty.txt");
    const outputs: string[] = [];

    await writeFile(emptyFilePath, "", "utf8");

    try {
      for (const untrackedPath of untrackedPaths) {
        try {
          await execFile(
            "git",
            ["diff", "--no-index", "--check", "--relative", "--", emptyFilePath, untrackedPath],
            {
              cwd: workspaceRoot,
            },
          );
        } catch (error) {
          const output = readExecStreams(error);

          if (output) {
            outputs.push(output);
          }
        }
      }
    } finally {
      await rm(tempDir, {
        force: true,
        recursive: true,
      });
    }

    return {
      ok: outputs.length === 0,
      output: outputs.join("\n") || null,
    };
  }
}

function normalizeRelativePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\.\/+/, "").trim();
}

function formatExecError(error: unknown) {
  const output = readExecStreams(error);
  if (output) {
    return output;
  }

  return String(error);
}

function readExecStreams(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const stdout =
      "stdout" in error && typeof error.stdout === "string"
        ? error.stdout.trim()
        : "";
    const stderr =
      "stderr" in error && typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";

    return [stdout, stderr].filter(Boolean).join("\n") || null;
  }

  return null;
}

function mergeDiffCheckResults(
  results: Array<{ ok: boolean; output: string | null }>,
) {
  const output = results
    .map((result) => result.output)
    .filter((result): result is string => Boolean(result))
    .join("\n");

  return {
    ok: results.every((result) => result.ok),
    output: output || null,
  };
}
