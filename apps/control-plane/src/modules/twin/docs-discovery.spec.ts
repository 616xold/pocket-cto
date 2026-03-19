import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { discoverDocumentationFiles } from "./docs-discovery";

describe("docs discovery", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("discovers only the approved root docs and docs markdown files", async () => {
    const sourceRepo = await createTempGitRepo();
    cleanups.push(sourceRepo.cleanup);

    await writeFiles(sourceRepo.repoRoot, {
      "README.md": "# Repo\n",
      "START_HERE.md": "# Start\n",
      "docs/architecture/overview.md": "# Overview\n",
      "docs/ops/local-dev.md": "# Local Dev\n",
      "docs/evals/2026-03-19.md": "# Eval Result\n",
      "docs/smoke-results/latest.md": "# Smoke Result\n",
      "packages/domain/README.md": "# Package Doc\n",
      "plans/EP-9999.md": "# Plan\n",
      "WORKFLOW.yml": "name: not markdown\n",
    });

    const files = await discoverDocumentationFiles(sourceRepo.repoRoot);

    expect(files.map((file) => file.path)).toEqual([
      "docs/architecture/overview.md",
      "docs/ops/local-dev.md",
      "README.md",
      "START_HERE.md",
    ]);
  });
});

async function writeFiles(repoRoot: string, files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(repoRoot, dirname(path)), {
      recursive: true,
    });
    await writeFile(join(repoRoot, path), content, "utf8");
  }
}
