import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { discoverWorkflowFiles } from "./workflow-discovery";

describe("discoverWorkflowFiles", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("finds only .yml and .yaml files under .github/workflows in deterministic order", async () => {
    const sourceRepo = await createTempGitRepo();
    cleanups.push(sourceRepo.cleanup);

    await Promise.all([
      mkdir(join(sourceRepo.repoRoot, ".github", "workflows", "nested"), {
        recursive: true,
      }),
      mkdir(join(sourceRepo.repoRoot, ".github"), {
        recursive: true,
      }),
    ]);
    await Promise.all([
      writeFile(
        join(sourceRepo.repoRoot, ".github", "workflows", "ci.yml"),
        "name: CI\non: push\njobs: {}\n",
        "utf8",
      ),
      writeFile(
        join(sourceRepo.repoRoot, ".github", "workflows", "release.yaml"),
        "name: Release\non: workflow_dispatch\njobs: {}\n",
        "utf8",
      ),
      writeFile(
        join(
          sourceRepo.repoRoot,
          ".github",
          "workflows",
          "nested",
          "nightly.yml",
        ),
        "on:\n  schedule:\n    - cron: '0 0 * * *'\njobs: {}\n",
        "utf8",
      ),
      writeFile(
        join(sourceRepo.repoRoot, ".github", "workflows", "notes.txt"),
        "ignore me\n",
        "utf8",
      ),
      writeFile(
        join(sourceRepo.repoRoot, ".github", "outside.yml"),
        "name: Outside\n",
        "utf8",
      ),
    ]);

    const discovered = await discoverWorkflowFiles(sourceRepo.repoRoot);

    expect(discovered.map((file) => file.path)).toEqual([
      ".github/workflows/ci.yml",
      ".github/workflows/nested/nightly.yml",
      ".github/workflows/release.yaml",
    ]);
    expect(discovered[0]).toMatchObject({
      path: ".github/workflows/ci.yml",
      lineCount: 4,
      sizeBytes: expect.any(Number),
      modifiedAt: expect.any(String),
    });
  });

  it("returns an empty list when .github/workflows is absent", async () => {
    const sourceRepo = await createTempGitRepo();
    cleanups.push(sourceRepo.cleanup);

    const discovered = await discoverWorkflowFiles(sourceRepo.repoRoot);

    expect(discovered).toEqual([]);
  });
});
