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
      freshness: {
        state: "fresh",
        latestRunStatus: "succeeded",
        staleAfterSeconds: 21_600,
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

  it("syncs repository ownership and returns stored rules and owners cleanly", async () => {
    const sourceRepo = await createOwnershipSourceRepo(repoFullName);
    cleanups.push(sourceRepo.cleanup);
    const ownershipService = createTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });
    const app = await createTwinApp(apps, ownershipService);

    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/ownership-sync",
    });
    const rulesResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/ownership-rules",
    });
    const ownersResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/owners",
    });

    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      codeownersFilePath: ".github/CODEOWNERS",
      ruleCount: 2,
      ownerCount: 2,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(rulesResponse.statusCode).toBe(200);
    expect(rulesResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      codeownersFile: {
        path: ".github/CODEOWNERS",
      },
      ruleCount: 2,
      ownerCount: 2,
      rules: [
        {
          ordinal: 1,
          rawPattern: "*",
          normalizedOwners: ["@platform"],
        },
        {
          ordinal: 2,
          rawPattern: "docs/",
          normalizedOwners: ["@platform", "@runtime/team"],
        },
      ],
    });
    expect(ownersResponse.statusCode).toBe(200);
    expect(ownersResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      codeownersFile: {
        path: ".github/CODEOWNERS",
      },
      ownerCount: 2,
      owners: [
        {
          handle: "@platform",
          assignedRuleCount: 2,
        },
        {
          handle: "@runtime/team",
          assignedRuleCount: 1,
        },
      ],
    });
  });

  it("returns a concise stored ownership summary for manifests and directories", async () => {
    const sourceRepo = await createEffectiveOwnershipSourceRepo(repoFullName);
    cleanups.push(sourceRepo.cleanup);
    const ownershipService = createTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });
    const app = await createTwinApp(apps, ownershipService);

    const metadataSyncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/metadata-sync",
    });
    const ownershipSyncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/ownership-sync",
    });
    const summaryResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/ownership-summary",
    });

    expect(metadataSyncResponse.statusCode).toBe(200);
    expect(ownershipSyncResponse.statusCode).toBe(200);
    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      freshness: {
        state: "fresh",
        latestRunStatus: "succeeded",
        staleAfterSeconds: 43_200,
      },
      ownershipState: "effective_ownership_available",
      codeownersFile: {
        path: ".github/CODEOWNERS",
      },
      counts: {
        directoryCount: 2,
        manifestCount: 2,
        ownedDirectoryCount: 1,
        ownedManifestCount: 1,
        unownedDirectoryCount: 1,
        unownedManifestCount: 1,
      },
      ownedDirectories: [
        {
          path: "apps",
          effectiveOwners: ["@apps-team"],
          appliedRule: {
            rawPattern: "apps/",
          },
        },
      ],
      ownedManifests: [
        {
          path: "apps/web/package.json",
          effectiveOwners: ["@web-team"],
          appliedRule: {
            rawPattern: "apps/web/package.json",
          },
        },
      ],
      unownedDirectories: [
        {
          path: "docs",
        },
      ],
      unownedManifests: [
        {
          path: "package.json",
          packageName: "pocket-cto",
        },
      ],
    });
  });

  it("returns conservative repository freshness with per-slice states", async () => {
    const app = await createTwinApp(apps, service);

    const response = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/freshness",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      rollup: {
        state: "never_synced",
        scorePercent: 0,
        neverSyncedSliceCount: 5,
        blockingSlices: [
          "ownership",
          "workflows",
          "testSuites",
          "docs",
          "runbooks",
        ],
      },
      slices: {
        metadata: {
          state: "fresh",
          latestRunStatus: "succeeded",
          staleAfterSeconds: 21_600,
        },
        ownership: {
          state: "never_synced",
          latestRunStatus: null,
          staleAfterSeconds: 43_200,
        },
        workflows: {
          state: "never_synced",
          latestRunStatus: null,
          staleAfterSeconds: 43_200,
        },
        testSuites: {
          state: "never_synced",
          latestRunStatus: null,
          staleAfterSeconds: 43_200,
        },
        docs: {
          state: "never_synced",
          latestRunStatus: null,
          staleAfterSeconds: 86_400,
        },
        runbooks: {
          state: "never_synced",
          latestRunStatus: null,
          staleAfterSeconds: 86_400,
        },
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

async function createTwinApp(apps: FastifyInstance[], service: TwinService) {
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

async function createOwnershipSourceRepo(fullName: string) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );
  await mkdir(join(sourceRepo.repoRoot, ".github"), {
    recursive: true,
  });
  await writeFile(
    join(sourceRepo.repoRoot, ".github", "CODEOWNERS"),
    ["# Ownership", "* @Platform", "docs/ @Platform @Runtime/Team"].join("\n"),
    "utf8",
  );

  return sourceRepo;
}

async function createEffectiveOwnershipSourceRepo(fullName: string) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );
  await Promise.all([
    mkdir(join(sourceRepo.repoRoot, ".github"), {
      recursive: true,
    }),
    mkdir(join(sourceRepo.repoRoot, "apps", "web"), {
      recursive: true,
    }),
    mkdir(join(sourceRepo.repoRoot, "docs"), {
      recursive: true,
    }),
  ]);
  await Promise.all([
    writeFile(
      join(sourceRepo.repoRoot, ".github", "CODEOWNERS"),
      ["apps/ @Apps-Team", "apps/web/package.json @Web-Team"].join("\n"),
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
    writeFile(
      join(sourceRepo.repoRoot, "apps", "web", "package.json"),
      JSON.stringify(
        {
          name: "web-app",
          private: true,
          scripts: {
            dev: "next dev",
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
