import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";
import { TwinService } from "./service";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("TwinService test suite sync", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("persists stable test_suite entities from manifest test scripts and reruns without duplicating them", async () => {
    const sourceRepo = await createTwinSourceRepo(repoFullName, {
      files: {
        "package.json": JSON.stringify(
          {
            name: "repo-root",
            private: true,
            workspaces: ["apps/*"],
            scripts: {
              build: "tsc -b",
              test: "vitest run",
            },
          },
          null,
          2,
        ),
        "apps/web/package.json": JSON.stringify(
          {
            name: "@pocket-cto/web",
            private: true,
            scripts: {
              dev: "next dev",
              "test:e2e": "playwright test",
              test: "vitest run",
            },
          },
          null,
          2,
        ),
      },
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryMetadata(repoFullName);
    const firstResult = await service.syncRepositoryTestSuites(repoFullName);
    const firstEntities = await service.listRepositoryEntities(repoFullName);
    const firstSuiteIds = new Map(
      firstEntities.entities
        .filter((entity) => entity.kind === "test_suite")
        .map((entity) => [entity.stableKey, entity.id]),
    );

    await service.syncRepositoryTestSuites(repoFullName);

    const secondEntities = await service.listRepositoryEntities(repoFullName);
    const secondSuiteIds = new Map(
      secondEntities.entities
        .filter((entity) => entity.kind === "test_suite")
        .map((entity) => [entity.stableKey, entity.id]),
    );
    const view = await service.getRepositoryTestSuites(repoFullName);

    expect(firstResult).toMatchObject({
      testSuiteState: "test_suites_available",
      testSuiteCount: 3,
      mappedJobCount: 0,
      unmappedJobCount: 0,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(sortStableKeys(firstSuiteIds.keys())).toEqual([
      "apps/web/package.json#script:test",
      "apps/web/package.json#script:test:e2e",
      "package.json#script:test",
    ]);
    expect(normalizeSuiteIdMap(secondSuiteIds)).toEqual(
      normalizeSuiteIdMap(firstSuiteIds),
    );
    expect(
      secondEntities.entities.filter((entity) => entity.kind === "test_suite"),
    ).toHaveLength(3);
    expect(view).toMatchObject({
      testSuiteState: "test_suites_available",
      counts: {
        testSuiteCount: 3,
        mappedJobCount: 0,
        unmappedJobCount: 0,
      },
    });
    expect(sortSuiteIdentities(view.testSuites)).toEqual([
      {
        manifestPath: "apps/web/package.json",
        scriptKey: "test",
      },
      {
        manifestPath: "apps/web/package.json",
        scriptKey: "test:e2e",
      },
      {
        manifestPath: "package.json",
        scriptKey: "test",
      },
    ]);
  });

  it("maps obvious workflow job invocations to suites and keeps opaque jobs unmapped", async () => {
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
          "  web-e2e:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm --filter @pocket-cto/web test:e2e",
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
            workspaces: ["apps/*"],
            scripts: {
              "ci:integration-db": "pnpm test",
              test: "vitest run",
            },
          },
          null,
          2,
        ),
        "apps/web/package.json": JSON.stringify(
          {
            name: "@pocket-cto/web",
            private: true,
            scripts: {
              "test:e2e": "playwright test",
            },
          },
          null,
          2,
        ),
      },
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryMetadata(repoFullName);
    await service.syncRepositoryWorkflows(repoFullName);
    const result = await service.syncRepositoryTestSuites(repoFullName);
    const summary = await service.getRepositoryCiSummary(repoFullName);

    expect(result).toMatchObject({
      testSuiteCount: 2,
      jobCount: 3,
      mappedJobCount: 2,
      unmappedJobCount: 1,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(summary).toMatchObject({
      workflowState: "workflows_available",
      testSuiteState: "test_suites_available",
      counts: {
        workflowFileCount: 1,
        workflowCount: 1,
        jobCount: 3,
        testSuiteCount: 2,
        mappedJobCount: 2,
        unmappedJobCount: 1,
      },
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
    expect(sortSuiteSummaries(summary.testSuites)).toEqual([
      {
        manifestPath: "apps/web/package.json",
        scriptKey: "test:e2e",
        matchedJobKeys: ["web-e2e"],
      },
      {
        manifestPath: "package.json",
        scriptKey: "test",
        matchedJobKeys: ["root-test"],
      },
    ]);
  });
});

function sortStableKeys(keys: Iterable<string>) {
  return [...keys].sort((left, right) => left.localeCompare(right));
}

function normalizeSuiteIdMap(suiteIds: Map<string, string>) {
  return [...suiteIds.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function sortSuiteIdentities(
  testSuites: Array<{ manifestPath: string; scriptKey: string }>,
) {
  return [...testSuites]
    .map((testSuite) => ({
      manifestPath: testSuite.manifestPath,
      scriptKey: testSuite.scriptKey,
    }))
    .sort(compareSuiteIdentity);
}

function sortSuiteSummaries(
  testSuites: Array<{
    manifestPath: string;
    scriptKey: string;
    matchedJobs: Array<{ jobKey: string }>;
  }>,
) {
  return [...testSuites]
    .map((testSuite) => ({
      manifestPath: testSuite.manifestPath,
      scriptKey: testSuite.scriptKey,
      matchedJobKeys: testSuite.matchedJobs.map((job) => job.jobKey).sort(),
    }))
    .sort(compareSuiteIdentity);
}

function compareSuiteIdentity(
  left: { manifestPath: string; scriptKey: string },
  right: { manifestPath: string; scriptKey: string },
) {
  return (
    left.manifestPath.localeCompare(right.manifestPath) ||
    left.scriptKey.localeCompare(right.scriptKey)
  );
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
          lastSyncedAt: "2026-03-19T03:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T03:00:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-19T03:00:00.000Z") + tick++ * 1000),
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
