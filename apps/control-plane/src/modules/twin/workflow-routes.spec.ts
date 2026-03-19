import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { registerTwinRoutes } from "./routes";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("workflow twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("returns stored workflow and job summaries cleanly", async () => {
    const sourceRepo = await createWorkflowSourceRepo(repoFullName, [
      {
        path: ".github/workflows/ci.yml",
        content: [
          "name: CI",
          "on:",
          "  push:",
          "  workflow_dispatch:",
          "jobs:",
          "  lint:",
          "    runs-on: ubuntu-latest",
          "    permissions:",
          "      contents: read",
          "    steps:",
          "      - uses: actions/checkout@v4",
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
    const app = await createTwinApp(
      apps,
      createWorkflowTwinService(sourceRepo.repoRoot),
    );

    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/workflows-sync",
    });
    const workflowsResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/workflows",
    });

    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      workflowState: "workflows_available",
      workflowFileCount: 1,
      workflowCount: 1,
      jobCount: 2,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(workflowsResponse.statusCode).toBe(200);
    expect(workflowsResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      workflowState: "workflows_available",
      counts: {
        workflowFileCount: 1,
        workflowCount: 1,
        jobCount: 2,
      },
      workflows: [
        {
          file: {
            path: ".github/workflows/ci.yml",
          },
          workflow: {
            resolvedName: "CI",
            triggerSummary: {
              eventNames: ["push", "workflow_dispatch"],
            },
          },
          jobs: [
            {
              key: "lint",
              permissions: {
                mode: null,
                scopes: {
                  contents: "read",
                },
              },
              steps: [
                {
                  kind: "uses",
                  value: "actions/checkout@v4",
                },
                {
                  kind: "run",
                  value: "pnpm lint",
                },
              ],
            },
            {
              key: "test",
              needs: ["lint"],
              steps: [
                {
                  kind: "run",
                  value: "pnpm test",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});

async function createTwinApp(apps: FastifyInstance[], service: TwinService) {
  const app = Fastify();
  registerHttpErrorHandler(app);
  await registerTwinRoutes(app, {
    twinService: service,
  });
  apps.push(app);
  return app;
}

function createWorkflowTwinService(configuredSourceRepoRoot: string) {
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
          lastSyncedAt: "2026-03-19T02:15:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T02:15:00.000Z",
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
    now: () => new Date("2026-03-19T02:15:00.000Z"),
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
