import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("TwinService runbook sync", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("succeeds truthfully for classified runbook docs with zero extracted steps", async () => {
    const sourceRepo = await createRunbookSourceRepo(repoFullName, {
      "WORKFLOW.md": [
        "# Pocket CTO workflow",
        "",
        "## Intent",
        "",
        "Track repository rules honestly.",
        "",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createRunbookTwinService(sourceRepo.repoRoot);

    const result = await service.syncRepositoryRunbooks(repoFullName);
    const runbooks = await service.getRepositoryRunbooks(repoFullName);

    expect(result).toMatchObject({
      runbookState: "runbooks_available",
      runbookDocumentCount: 1,
      runbookStepCount: 0,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(runbooks).toMatchObject({
      runbookState: "runbooks_available",
      counts: {
        runbookDocumentCount: 1,
        runbookStepCount: 0,
        commandFamilyCounts: {},
      },
      runbooks: [
        {
          path: "WORKFLOW.md",
          stepCount: 0,
          steps: [],
        },
      ],
    });
  });

  it("reruns runbooks sync by upserting the same documents and steps instead of duplicating", async () => {
    const sourceRepo = await createRunbookSourceRepo(repoFullName, {
      "START_HERE.md": [
        "# Start here",
        "",
        "## First run in Codex",
        "",
        "```bash",
        "pnpm dev",
        "```",
        "",
      ].join("\n"),
      "docs/ops/local-dev.md": [
        "# Local development",
        "",
        "## Bootstrap",
        "",
        "```bash",
        "docker compose up -d",
        "pnpm db:migrate",
        "```",
        "",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createRunbookTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryRunbooks(repoFullName);
    const firstEntities = await service.listRepositoryEntities(repoFullName);
    const firstRunbookEntityIds = new Map(
      firstEntities.entities
        .filter(
          (entity) =>
            entity.kind === "runbook_document" || entity.kind === "runbook_step",
        )
        .map((entity) => [`${entity.kind}::${entity.stableKey}`, entity.id]),
    );

    const secondResult = await service.syncRepositoryRunbooks(repoFullName);
    const secondEntities = await service.listRepositoryEntities(repoFullName);
    const secondRunbookEntityIds = new Map(
      secondEntities.entities
        .filter(
          (entity) =>
            entity.kind === "runbook_document" || entity.kind === "runbook_step",
        )
        .map((entity) => [`${entity.kind}::${entity.stableKey}`, entity.id]),
    );

    expect(secondResult).toMatchObject({
      runbookState: "runbooks_available",
      runbookDocumentCount: 2,
      runbookStepCount: 3,
      commandFamilyCounts: {
        docker: 1,
        pnpm: 2,
      },
    });
    expect(secondRunbookEntityIds).toEqual(firstRunbookEntityIds);
    expect(
      secondEntities.entities.filter((entity) => entity.kind === "runbook_document"),
    ).toHaveLength(2);
    expect(
      secondEntities.entities.filter((entity) => entity.kind === "runbook_step"),
    ).toHaveLength(3);
  });
});

function createRunbookTwinService(configuredSourceRepoRoot: string) {
  let tick = 0;

  return new TwinService({
    metadataExtractor: new LocalTwinRepositoryMetadataExtractor(),
    repository: new InMemoryTwinRepository(),
    repositoryRegistry: {
      getRepository: vi.fn(async (fullName: string) => ({
        repository: {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          installationId: "12345",
          githubRepositoryId: "100",
          fullName,
          ownerLogin: fullName.split("/")[0] ?? "616xold",
          name: fullName.split("/")[1] ?? "pocket-cto",
          defaultBranch: "main",
          visibility: "private" as const,
          archived: false,
          disabled: false,
          isActive: true,
          language: "TypeScript",
          lastSyncedAt: "2026-03-19T17:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T17:00:00.000Z",
        },
        writeReadiness: {
          ready: true,
          failureCode: null,
        },
      })),
      resolveWritableRepository: vi.fn(async () => ({
        installation: {
          installationId: "12345",
        },
        repository: {
          fullName: repoFullName,
        },
      })),
    },
    sourceResolver: new LocalTwinRepositorySourceResolver({
      configuredSourceRepoRoot,
      processCwd: process.cwd(),
    }),
    now: () => new Date(Date.parse("2026-03-19T17:00:00.000Z") + tick++ * 1000),
  });
}

async function createRunbookSourceRepo(
  fullName: string,
  files: Record<string, string>,
) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );

  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(sourceRepo.repoRoot, dirname(path)), {
      recursive: true,
    });
    await writeFile(join(sourceRepo.repoRoot, path), content, "utf8");
  }

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}
