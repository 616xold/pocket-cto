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
import { LocalTwinRepositorySourceResolver } from "./source-resolver";
import { TwinService } from "./service";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("test suite twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("returns stored test suites and ci summary with explicit unmapped jobs", async () => {
    const sourceRepo = await createTwinSourceRepo(repoFullName, {
      files: {
        ".github/workflows/ci.yml": [
          "name: CI",
          "on: [push]",
          "jobs:",
          "  root-test:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm test",
          "  opaque:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm ci:integration-db",
          "",
        ].join("\n"),
        "package.json": JSON.stringify(
          {
            name: "repo-root",
            private: true,
            scripts: {
              "ci:integration-db": "pnpm test",
              test: "vitest run",
              "test:unit": "vitest run --project unit",
            },
          },
          null,
          2,
        ),
      },
    });
    cleanups.push(sourceRepo.cleanup);
    const app = await createTwinApp(
      apps,
      createTwinService(sourceRepo.repoRoot),
    );

    expect(
      await app.inject({
        method: "POST",
        url: "/twin/repositories/616xold/pocket-cto/metadata-sync",
      }),
    ).toHaveProperty("statusCode", 200);
    expect(
      await app.inject({
        method: "POST",
        url: "/twin/repositories/616xold/pocket-cto/workflows-sync",
      }),
    ).toHaveProperty("statusCode", 200);

    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/test-suites-sync",
    });
    const testSuitesResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/test-suites",
    });
    const ciSummaryResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/ci-summary",
    });

    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      testSuiteState: "test_suites_available",
      testSuiteCount: 2,
      jobCount: 2,
      mappedJobCount: 1,
      unmappedJobCount: 1,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(testSuitesResponse.statusCode).toBe(200);
    expect(testSuitesResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      testSuiteState: "test_suites_available",
      counts: {
        testSuiteCount: 2,
        mappedJobCount: 1,
        unmappedJobCount: 1,
      },
      testSuites: [
        {
          manifestPath: "package.json",
          scriptKey: "test",
          matchedJobs: [
            {
              jobKey: "root-test",
            },
          ],
        },
        {
          manifestPath: "package.json",
          scriptKey: "test:unit",
          matchedJobs: [],
        },
      ],
      unmappedJobs: [
        {
          jobKey: "opaque",
          reasonCode: "no_test_invocation",
          reasonSummary:
            "No run command clearly invokes a stored manifest test script.",
          runCommands: ["pnpm ci:integration-db"],
        },
      ],
    });
    expect(ciSummaryResponse.statusCode).toBe(200);
    expect(ciSummaryResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      freshness: {
        state: "fresh",
        latestRunStatus: "succeeded",
        staleAfterSeconds: 43_200,
        reasonCode: "rollup_fresh",
      },
      workflowState: "workflows_available",
      testSuiteState: "test_suites_available",
      counts: {
        workflowFileCount: 1,
        workflowCount: 1,
        jobCount: 2,
        testSuiteCount: 2,
        mappedJobCount: 1,
        unmappedJobCount: 1,
      },
      testSuites: [
        {
          manifestPath: "package.json",
          scriptKey: "test",
        },
        {
          manifestPath: "package.json",
          scriptKey: "test:unit",
        },
      ],
      unmappedJobs: [
        {
          jobKey: "opaque",
          reasonCode: "no_test_invocation",
          reasonSummary:
            "No run command clearly invokes a stored manifest test script.",
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

function createTwinService(configuredSourceRepoRoot: string) {
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
          lastSyncedAt: "2026-03-19T03:15:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T03:15:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-19T03:15:00.000Z") + tick++ * 1000),
  });
}

async function createTwinSourceRepo(
  fullName: string,
  input: {
    files: Record<string, string>;
  },
) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );

  for (const [path, content] of Object.entries(input.files)) {
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
