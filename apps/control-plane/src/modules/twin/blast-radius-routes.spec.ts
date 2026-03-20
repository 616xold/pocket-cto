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

describe("blast radius twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("answers a stored blast-radius query conservatively from the existing twin", async () => {
    const sourceRepo = await createTwinSourceRepo(repoFullName, {
      files: {
        ".github/CODEOWNERS": [
          "apps/ @platform",
          "apps/web/ @web-team",
          "",
        ].join("\n"),
        ".github/workflows/ci.yml": [
          "name: CI",
          "on: [push]",
          "jobs:",
          "  web-auth:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm -C apps/web test:auth",
          "  opaque:",
          "    runs-on: ubuntu-latest",
          "    steps:",
          "      - run: pnpm ci:integration-db",
          "",
        ].join("\n"),
        "apps/web/package.json": JSON.stringify(
          {
            name: "@web/app",
            private: true,
            scripts: {
              "test:auth": "vitest run auth",
            },
          },
          null,
          2,
        ),
        "apps/web/lib/auth.ts": "export const auth = true;\n",
        "packages/domain/package.json": JSON.stringify(
          {
            name: "@domain/core",
            private: false,
            scripts: {
              test: "vitest run",
            },
          },
          null,
          2,
        ),
        "packages/domain/src/twin.ts": "export const twin = true;\n",
      },
    });
    cleanups.push(sourceRepo.cleanup);
    const app = await createTwinApp(
      apps,
      createTwinService(sourceRepo.repoRoot),
    );

    for (const url of [
      "/twin/repositories/616xold/pocket-cto/metadata-sync",
      "/twin/repositories/616xold/pocket-cto/ownership-sync",
      "/twin/repositories/616xold/pocket-cto/workflows-sync",
      "/twin/repositories/616xold/pocket-cto/test-suites-sync",
    ]) {
      expect(
        await app.inject({
          method: "POST",
          url,
        }),
      ).toHaveProperty("statusCode", 200);
    }

    const response = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/blast-radius/query",
      payload: {
        questionKind: "auth_change",
        changedPaths: [
          "apps/web/lib/auth.ts",
          "packages/domain/src/twin.ts",
          "scripts/unknown.ts",
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      queryEcho: {
        questionKind: "auth_change",
        changedPaths: [
          "apps/web/lib/auth.ts",
          "packages/domain/src/twin.ts",
          "scripts/unknown.ts",
        ],
      },
      unmatchedPaths: ["scripts/unknown.ts"],
      impactedDirectories: [
        {
          path: "apps",
          ownershipState: "owned",
          effectiveOwners: ["@platform"],
        },
        {
          path: "packages",
          ownershipState: "unowned",
          effectiveOwners: [],
        },
      ],
      impactedManifests: [
        {
          path: "apps/web/package.json",
          ownershipState: "owned",
          effectiveOwners: ["@web-team"],
          relatedTestSuiteCount: 1,
          relatedMappedCiJobCount: 1,
        },
        {
          path: "packages/domain/package.json",
          ownershipState: "unowned",
          effectiveOwners: [],
          relatedTestSuiteCount: 1,
          relatedMappedCiJobCount: 0,
        },
      ],
      relatedMappedCiJobs: [
        {
          jobKey: "web-auth",
          manifestPaths: ["apps/web/package.json"],
          scriptKeys: ["test:auth"],
        },
      ],
      ciCoverageLimitations: [
        {
          code: "manifest_without_mapped_ci_jobs",
          manifestPaths: ["packages/domain/package.json"],
        },
        {
          code: "repo_has_unmapped_ci_jobs",
          jobKeys: ["opaque"],
          reasonCodes: ["no_test_invocation"],
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
          lastSyncedAt: "2026-03-20T00:15:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-20T00:15:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-20T00:15:00.000Z") + tick++ * 1000),
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

  return sourceRepo;
}
