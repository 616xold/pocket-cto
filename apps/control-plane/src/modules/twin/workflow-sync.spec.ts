import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";
const workflowSyncTestTimeoutMs = 15_000;

describe("TwinService workflow sync", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("succeeds truthfully with zero workflow files", async () => {
    const sourceRepo = await createWorkflowSourceRepo(repoFullName, []);
    cleanups.push(sourceRepo.cleanup);
    const service = createWorkflowTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });

    const result = await service.syncRepositoryWorkflows(repoFullName);
    const view = await service.getRepositoryWorkflows(repoFullName);
    const runs = await service.listRepositoryRuns(repoFullName);

    expect(result).toMatchObject({
      workflowState: "no_workflow_files",
      workflowFileCount: 0,
      workflowCount: 0,
      jobCount: 0,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(view).toMatchObject({
      workflowState: "no_workflow_files",
      counts: {
        workflowFileCount: 0,
        workflowCount: 0,
        jobCount: 0,
      },
      workflows: [],
    });
    expect(runs.runs[0]).toMatchObject({
      id: result.syncRun.id,
      status: "succeeded",
      stats: {
        workflowFileCount: 0,
        workflowCount: 0,
        jobCount: 0,
      },
    });
  }, workflowSyncTestTimeoutMs);

  it("uses a deterministic workflow name fallback when the workflow YAML omits name", async () => {
    const sourceRepo = await createWorkflowSourceRepo(repoFullName, [
      {
        path: ".github/workflows/release.yml",
        content: [
          "on:",
          "  push:",
          "    branches: [main]",
          "  workflow_dispatch:",
          "jobs:",
          "  build:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - uses: actions/checkout@v4",
          "      - run: pnpm build",
          "",
        ].join("\n"),
      },
    ]);
    cleanups.push(sourceRepo.cleanup);
    const service = createWorkflowTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });

    await service.syncRepositoryWorkflows(repoFullName);
    const view = await service.getRepositoryWorkflows(repoFullName);

    expect(view).toMatchObject({
      workflowState: "workflows_available",
      counts: {
        workflowFileCount: 1,
        workflowCount: 1,
        jobCount: 1,
      },
      workflows: [
        {
          file: {
            path: ".github/workflows/release.yml",
          },
          workflow: {
            name: null,
            resolvedName: "release",
            stableKey: ".github/workflows/release.yml#file",
            triggerSummary: {
              eventNames: ["push", "workflow_dispatch"],
              hasWorkflowDispatch: true,
            },
          },
          jobs: [
            {
              key: "build",
              runsOn: {
                labels: ["ubuntu-latest"],
              },
              steps: [
                {
                  kind: "uses",
                  value: "actions/checkout@v4",
                },
                {
                  kind: "run",
                  value: "pnpm build",
                },
              ],
            },
          ],
        },
      ],
    });
  }, workflowSyncTestTimeoutMs);

  it("persists jobs with stable keys and reruns without duplicating them", async () => {
    const expectedJobStableKeys = [
      ".github/workflows/ci.yml#job:lint",
      ".github/workflows/ci.yml#job:test",
    ];
    const sourceRepo = await createWorkflowSourceRepo(repoFullName, [
      {
        path: ".github/workflows/ci.yml",
        content: [
          "name: CI",
          "on: [push, pull_request]",
          "jobs:",
          "  lint:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm lint",
          "  test:",
          "    runs-on: ubuntu-latest",
          "    needs: lint",
          "    steps:",
          "      - run: pnpm test",
          "",
        ].join("\n"),
      },
    ]);
    cleanups.push(sourceRepo.cleanup);
    const service = createWorkflowTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });

    await service.syncRepositoryWorkflows(repoFullName);
    const firstEntities = await service.listRepositoryEntities(repoFullName);
    const firstJobs = firstEntities.entities.filter(
      (entity) => entity.kind === "ci_job",
    );
    const firstJobIds = new Map(
      firstJobs.map((entity) => [entity.stableKey, entity.id]),
    );

    await service.syncRepositoryWorkflows(repoFullName);

    const secondEntities = await service.listRepositoryEntities(repoFullName);
    const secondJobs = secondEntities.entities.filter(
      (entity) => entity.kind === "ci_job",
    );
    const secondJobIds = new Map(
      secondJobs.map((entity) => [entity.stableKey, entity.id]),
    );
    const view = await service.getRepositoryWorkflows(repoFullName);
    const runs = await service.listRepositoryRuns(repoFullName);

    expect(firstJobs).toHaveLength(expectedJobStableKeys.length);
    // Entity listing order is not the contract here; stable keys and IDs are.
    expect([...firstJobIds.keys()].sort()).toEqual(expectedJobStableKeys);
    expect(firstJobIds.get(".github/workflows/ci.yml#job:lint")).toEqual(
      expect.any(String),
    );
    expect(firstJobIds.get(".github/workflows/ci.yml#job:test")).toEqual(
      expect.any(String),
    );
    expect(secondJobIds).toEqual(firstJobIds);
    expect(secondJobs).toHaveLength(expectedJobStableKeys.length);
    expect(runs.runCount).toBe(2);
    expect(view).toMatchObject({
      counts: {
        workflowFileCount: 1,
        workflowCount: 1,
        jobCount: 2,
      },
      workflows: [
        {
          jobs: [
            {
              key: "lint",
              stableKey: ".github/workflows/ci.yml#job:lint",
            },
            {
              key: "test",
              stableKey: ".github/workflows/ci.yml#job:test",
              needs: ["lint"],
            },
          ],
        },
      ],
    });
  }, workflowSyncTestTimeoutMs);
});

function createWorkflowTwinService(input: {
  configuredSourceRepoRoot: string;
}) {
  let tick = 0;

  return new TwinService({
    metadataExtractor: new LocalTwinRepositoryMetadataExtractor(),
    repository: new InMemoryTwinRepository(),
    repositoryRegistry: {
      getRepository: vi.fn(async (fullName: string) => {
        return {
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
            lastSyncedAt: "2026-03-19T02:00:00.000Z",
            removedFromInstallationAt: null,
            updatedAt: "2026-03-19T02:00:00.000Z",
          },
          writeReadiness: {
            ready: true,
            failureCode: null,
          },
        };
      }),
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
      configuredSourceRepoRoot: input.configuredSourceRepoRoot,
      processCwd: process.cwd(),
    }),
    now: () => new Date(Date.parse("2026-03-19T02:00:00.000Z") + tick++ * 1000),
  });
}

async function createWorkflowSourceRepo(
  fullName: string,
  workflowFiles: Array<{ content: string; path: string }>,
) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );

  for (const workflowFile of workflowFiles) {
    await mkdir(join(sourceRepo.repoRoot, dirname(workflowFile.path)), {
      recursive: true,
    });
    await writeFile(
      join(sourceRepo.repoRoot, workflowFile.path),
      workflowFile.content,
      "utf8",
    );
  }

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}
