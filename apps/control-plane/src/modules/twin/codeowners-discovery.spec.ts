import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { discoverCodeownersFile } from "./codeowners-discovery";

const execFile = promisify(execFileCallback);

describe("discoverCodeownersFile", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("prefers .github/CODEOWNERS over repo-root and docs CODEOWNERS", async () => {
    const sourceRepo = await createTempGitRepo();
    cleanups.push(sourceRepo.cleanup);

    await execFile(
      "git",
      ["remote", "add", "origin", "https://github.com/616xold/pocket-cto.git"],
      {
        cwd: sourceRepo.repoRoot,
      },
    );
    await Promise.all([
      mkdir(join(sourceRepo.repoRoot, ".github"), { recursive: true }),
      mkdir(join(sourceRepo.repoRoot, "docs"), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(sourceRepo.repoRoot, ".github", "CODEOWNERS"), "* @platform\n"),
      writeFile(join(sourceRepo.repoRoot, "CODEOWNERS"), "* @root-owner\n"),
      writeFile(join(sourceRepo.repoRoot, "docs", "CODEOWNERS"), "* @docs-owner\n"),
    ]);

    const discovered = await discoverCodeownersFile(sourceRepo.repoRoot);

    expect(discovered).toMatchObject({
      path: ".github/CODEOWNERS",
      precedenceSlot: "github_dotgithub",
    });
  });

  it("returns null when no CODEOWNERS file exists", async () => {
    const sourceRepo = await createTempGitRepo();
    cleanups.push(sourceRepo.cleanup);

    const discovered = await discoverCodeownersFile(sourceRepo.repoRoot);

    expect(discovered).toBeNull();
  });
});
