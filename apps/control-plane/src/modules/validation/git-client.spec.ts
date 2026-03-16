import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { LocalWorkspaceValidationGitClient } from "./git-client";

const execFile = promisify(execFileCallback);

describe("LocalWorkspaceValidationGitClient", () => {
  const directoriesToCleanup: string[] = [];

  afterEach(async () => {
    await Promise.all(
      directoriesToCleanup.splice(0).map((directory) =>
        rm(directory, {
          force: true,
          recursive: true,
        }),
      ),
    );
  });

  it("does not fail diff checks for a clean untracked file", async () => {
    const workspaceRoot = await createTempGitRepo();
    const client = new LocalWorkspaceValidationGitClient();

    await writeFile(
      join(workspaceRoot, "docs", "benchmarks", "seeded-note.md"),
      "Seeded note\n- first bullet\n- second bullet",
      "utf8",
    );

    const result = await client.runDiffCheck(workspaceRoot);

    expect(result).toEqual({
      ok: true,
      output: null,
    });
  });

  it("reports whitespace issues for an untracked file", async () => {
    const workspaceRoot = await createTempGitRepo();
    const client = new LocalWorkspaceValidationGitClient();

    await writeFile(
      join(workspaceRoot, "docs", "benchmarks", "seeded-note.md"),
      "Seeded note  \n",
      "utf8",
    );

    const result = await client.runDiffCheck(workspaceRoot);

    expect(result.ok).toBe(false);
    expect(result.output).toContain("trailing whitespace");
  });

  async function createTempGitRepo() {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "pocket-cto-validation-"));
    directoriesToCleanup.push(workspaceRoot);

    await execFile("git", ["init"], { cwd: workspaceRoot });
    await execFile("git", ["config", "user.name", "Pocket CTO Test"], {
      cwd: workspaceRoot,
    });
    await execFile("git", ["config", "user.email", "test@example.com"], {
      cwd: workspaceRoot,
    });
    await mkdir(join(workspaceRoot, "docs", "benchmarks"), { recursive: true });
    await writeFile(join(workspaceRoot, "README.md"), "Seed repo\n", "utf8");
    await execFile("git", ["add", "README.md"], { cwd: workspaceRoot });
    await execFile("git", ["commit", "-m", "init"], { cwd: workspaceRoot });

    return workspaceRoot;
  }
});
