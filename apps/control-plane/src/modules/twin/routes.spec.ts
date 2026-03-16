import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { GitHubRepositoryNotFoundError } from "../github-app/errors";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { registerTwinRoutes } from "./routes";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const repoFullName = "616xold/pocket-cto";
const execFile = promisify(execFileCallback);

describe("twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];
  let service: TwinService;

  beforeEach(async () => {
    service = createTwinService();
    await seedTwinState(service);
  });

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("returns repo-scoped twin entities and edges with repository context", async () => {
    const app = await createTwinApp(apps, service);

    const entitiesResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/entities",
    });
    const edgesResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/edges",
    });

    expect(entitiesResponse.statusCode).toBe(200);
    expect(entitiesResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
        installationId: "12345",
        defaultBranch: "main",
        writeReadiness: {
          ready: true,
          failureCode: null,
        },
      },
      entityCount: 2,
      entities: [
        {
          kind: "package",
          stableKey: "packages/domain",
        },
        {
          kind: "service",
          stableKey: "auth-api",
        },
      ],
    });
    expect(edgesResponse.statusCode).toBe(200);
    expect(edgesResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      edgeCount: 1,
      edges: [
        {
          kind: "depends_on",
          repoFullName,
        },
      ],
    });
  });

  it("returns sync runs newest-first for the repository", async () => {
    const app = await createTwinApp(apps, service);

    const response = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/runs",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      runCount: 2,
      runs: [
        {
          extractor: "relationship_sync",
          startedAt: "2026-03-16T23:10:00.000Z",
        },
        {
          extractor: "repository_metadata",
          startedAt: "2026-03-16T23:00:00.000Z",
        },
      ],
    });
  });

  it("syncs repository metadata and returns a concise stored summary", async () => {
    const sourceRepo = await createMetadataSourceRepo(repoFullName);
    cleanups.push(sourceRepo.cleanup);
    const metadataService = createTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
      useRealMetadataSync: true,
    });
    const app = await createTwinApp(apps, metadataService);

    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/metadata-sync",
    });
    const summaryResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/summary",
    });

    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      syncRun: {
        status: "succeeded",
      },
      entityCountsByKind: {
        package_manifest: 1,
      },
    });
    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
        defaultBranch: "main",
      },
      latestRun: {
        status: "succeeded",
      },
      metadata: {
        repository: {
          fullName: repoFullName,
        },
        rootReadme: {
          path: "README.md",
        },
        manifests: [
          {
            path: "package.json",
            packageName: "pocket-cto",
          },
        ],
      },
    });
  });

  it("returns the existing repository-not-found error when the registry has no matching repo", async () => {
    const notFoundService = createTwinService({
      getRepository: vi.fn(async (_fullName: string) => {
        throw new GitHubRepositoryNotFoundError("unknown/missing");
      }),
    });
    const app = await createTwinApp(apps, notFoundService);

    const response = await app.inject({
      method: "GET",
      url: "/twin/repositories/unknown/missing/entities",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_repository_not_found",
        message: "GitHub repository not found",
      },
    });
  });
});

async function createTwinApp(
  apps: FastifyInstance[],
  service: TwinService,
) {
  const app = Fastify();
  registerHttpErrorHandler(app);
  await registerTwinRoutes(app, {
    twinService: service,
  });
  apps.push(app);
  return app;
}

function createTwinService(overrides?: {
  configuredSourceRepoRoot?: string;
  getRepository?: ReturnType<typeof vi.fn>;
  resolveWritableRepository?: ReturnType<typeof vi.fn>;
  useRealMetadataSync?: boolean;
}) {
  return new TwinService({
    metadataExtractor: new LocalTwinRepositoryMetadataExtractor(),
    repository: new InMemoryTwinRepository(),
    repositoryRegistry: {
      getRepository:
        overrides?.getRepository ??
        vi.fn(async (fullName: string) => ({
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
            lastSyncedAt: "2026-03-16T22:55:00.000Z",
            removedFromInstallationAt: null,
            updatedAt: "2026-03-16T22:55:00.000Z",
          },
          writeReadiness: {
            ready: true,
            failureCode: null,
          },
        })),
      resolveWritableRepository:
        overrides?.resolveWritableRepository ??
        vi.fn(async () => ({
          installation: {
            installationId: "12345",
          },
          repository: {
            fullName: repoFullName,
          },
        })),
    },
    sourceResolver: new LocalTwinRepositorySourceResolver({
      configuredSourceRepoRoot:
        overrides?.configuredSourceRepoRoot ??
        (overrides?.useRealMetadataSync ? process.cwd() : null),
      processCwd: process.cwd(),
    }),
    now: () => new Date("2026-03-16T22:55:00.000Z"),
  });
}

async function seedTwinState(service: TwinService) {
  const repositoryRun = await service.startSyncRun({
    repoFullName,
    extractor: "repository_metadata",
    startedAt: "2026-03-16T23:00:00.000Z",
  });
  const olderServiceEntity = await service.upsertEntity({
    repoFullName,
    kind: "service",
    stableKey: "auth-api",
    title: "Auth API",
    observedAt: "2026-03-16T23:01:00.000Z",
    sourceRunId: repositoryRun.id,
  });
  const newerPackageEntity = await service.upsertEntity({
    repoFullName,
    kind: "package",
    stableKey: "packages/domain",
    title: "@pocket-cto/domain",
    observedAt: "2026-03-16T23:02:00.000Z",
    sourceRunId: repositoryRun.id,
  });
  await service.finishSyncRun({
    runId: repositoryRun.id,
    status: "succeeded",
    completedAt: "2026-03-16T23:03:00.000Z",
  });

  const relationshipRun = await service.startSyncRun({
    repoFullName,
    extractor: "relationship_sync",
    startedAt: "2026-03-16T23:10:00.000Z",
  });
  await service.upsertEdge({
    repoFullName,
    kind: "depends_on",
    fromEntityId: olderServiceEntity.id,
    toEntityId: newerPackageEntity.id,
    observedAt: "2026-03-16T23:11:00.000Z",
    sourceRunId: relationshipRun.id,
  });
}

async function createMetadataSourceRepo(fullName: string) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );
  await Promise.all([
    mkdir(join(sourceRepo.repoRoot, "apps", "control-plane"), {
      recursive: true,
    }),
    writeFile(
      join(sourceRepo.repoRoot, "README.md"),
      "# Pocket CTO\n\nRoute summary fixture.\n",
      "utf8",
    ),
    writeFile(
      join(sourceRepo.repoRoot, "package.json"),
      JSON.stringify(
        {
          name: "pocket-cto",
          private: true,
          scripts: {
            test: "vitest run",
          },
        },
        null,
        2,
      ),
      "utf8",
    ),
  ]);

  return sourceRepo;
}
