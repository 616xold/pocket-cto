import { describe, expect, it, vi } from "vitest";
import {
  GitHubRepositoryArchivedError,
  GitHubRepositoryDisabledError,
  GitHubRepositoryInactiveError,
  GitHubRepositoryInstallationUnavailableError,
} from "../github-app/errors";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const repoFullName = "616xold/pocket-cto";
const repositoryDetail = {
  repository: {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    installationId: "12345",
    githubRepositoryId: "100",
    fullName: repoFullName,
    ownerLogin: "616xold",
    name: "pocket-cto",
    defaultBranch: "main",
    visibility: "private" as const,
    archived: false,
    disabled: false,
    isActive: true,
    language: "TypeScript",
    lastSyncedAt: "2026-03-16T22:00:00.000Z",
    removedFromInstallationAt: null,
    updatedAt: "2026-03-16T22:00:00.000Z",
  },
  writeReadiness: {
    ready: true,
    failureCode: null,
  },
};

describe("TwinService", () => {
  it("starts and finishes a sync run for a writable repository", async () => {
    const service = createTwinService();

    const run = await service.startSyncRun({
      repoFullName,
      extractor: "synthetic_metadata",
      startedAt: "2026-03-16T22:40:00.000Z",
      stats: {
        repositoryCount: 1,
      },
    });
    const finished = await service.finishSyncRun({
      runId: run.id,
      status: "succeeded",
      completedAt: "2026-03-16T22:41:00.000Z",
      stats: {
        entityCount: 2,
      },
    });

    expect(run).toMatchObject({
      repoFullName,
      extractor: "synthetic_metadata",
      status: "running",
      startedAt: "2026-03-16T22:40:00.000Z",
      stats: {
        repositoryCount: 1,
      },
    });
    expect(finished).toMatchObject({
      id: run.id,
      status: "succeeded",
      completedAt: "2026-03-16T22:41:00.000Z",
      stats: {
        entityCount: 2,
      },
    });
  });

  it("keeps edge writes repo-scoped by rejecting endpoints from another repository", async () => {
    const service = createTwinService();

    const sameRepoEntity = await service.upsertEntity({
      repoFullName,
      kind: "service",
      stableKey: "auth-api",
      title: "Auth API",
      observedAt: "2026-03-16T22:50:00.000Z",
    });
    const otherRepoEntity = await service.upsertEntity({
      repoFullName: "616xold/pocket-cto-web",
      kind: "service",
      stableKey: "web-app",
      title: "Web App",
      observedAt: "2026-03-16T22:50:30.000Z",
    });

    await expect(
      service.upsertEdge({
        repoFullName,
        kind: "depends_on",
        fromEntityId: sameRepoEntity.id,
        toEntityId: otherRepoEntity.id,
        observedAt: "2026-03-16T22:51:00.000Z",
      }),
    ).rejects.toThrow(
      `Twin entity ${otherRepoEntity.id} belongs to 616xold/pocket-cto-web, expected ${repoFullName}`,
    );
  });

  it.each([
    [
      "inactive repository",
      new GitHubRepositoryInactiveError(repoFullName),
    ],
    [
      "archived repository",
      new GitHubRepositoryArchivedError(repoFullName),
    ],
    [
      "disabled repository",
      new GitHubRepositoryDisabledError(repoFullName),
    ],
    [
      "installation unavailable repository",
      new GitHubRepositoryInstallationUnavailableError(repoFullName, "12345"),
    ],
  ])(
    "surfaces truthful repo-readiness failures for %s when starting a sync run",
    async (_label, error) => {
      const service = createTwinService({
        resolveWritableRepository: vi.fn(async () => {
          throw error;
        }),
      });

      await expect(
        service.startSyncRun({
          repoFullName,
          extractor: "synthetic_metadata",
        }),
      ).rejects.toBe(error);
    },
  );
});

function createTwinService(overrides?: {
  getRepository?: ReturnType<typeof vi.fn>;
  resolveWritableRepository?: ReturnType<typeof vi.fn>;
}) {
  return new TwinService({
    metadataExtractor: new LocalTwinRepositoryMetadataExtractor(),
    repository: new InMemoryTwinRepository(),
    repositoryRegistry: {
      getRepository:
        overrides?.getRepository ??
        vi.fn(async (fullName: string) => {
          if (fullName === repoFullName) {
            return repositoryDetail;
          }

          return {
            ...repositoryDetail,
            repository: {
              ...repositoryDetail.repository,
              fullName,
              name: fullName.split("/")[1] ?? fullName,
            },
          };
        }),
      resolveWritableRepository:
        overrides?.resolveWritableRepository ??
        vi.fn(async () => {
          return {
            installation: {
              installationId: "12345",
            },
            repository: {
              fullName: repoFullName,
            },
          };
        }),
    },
    sourceResolver: new LocalTwinRepositorySourceResolver({
      configuredSourceRepoRoot: null,
      processCwd: process.cwd(),
    }),
    now: () => new Date("2026-03-16T22:45:00.000Z"),
  });
}
