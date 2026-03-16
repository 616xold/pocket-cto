import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { TwinSourceUnavailableError } from "./errors";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);

const repoFullName = "616xold/pocket-cto";

describe("TwinService repository metadata sync", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("extracts repository metadata from a temp repo and persists a concise summary", async () => {
    const sourceRepo = await createMetadataSourceRepo(repoFullName);
    cleanups.push(sourceRepo.cleanup);
    const service = createMetadataTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });

    const result = await service.syncRepositoryMetadata(repoFullName);
    const summary = await service.getRepositoryMetadataSummary(repoFullName);
    const runs = await service.listRepositoryRuns(repoFullName);

    expect(result).toMatchObject({
      syncRun: {
        status: "succeeded",
      },
      entityCountsByKind: {
        repository: 1,
        default_branch: 1,
        root_readme: 1,
        package_manifest: 2,
        workspace_directory: 4,
      },
      edgeCountsByKind: {
        repository_has_branch: 1,
        repository_has_readme: 1,
        repository_contains_manifest: 2,
        repository_contains_directory: 4,
      },
    });
    expect(summary).toMatchObject({
      latestRun: {
        id: result.syncRun.id,
        status: "succeeded",
      },
      metadata: {
        repository: {
          fullName: repoFullName,
          defaultBranch: "main",
        },
        defaultBranch: {
          name: "main",
        },
        rootReadme: {
          path: "README.md",
        },
        manifests: [
          {
            path: "package.json",
            packageName: "pocket-cto",
            hasWorkspaces: true,
            scriptNames: ["build", "test"],
          },
          {
            path: "packages/domain/package.json",
            packageName: "@pocket-cto/domain",
            hasWorkspaces: false,
            scriptNames: ["typecheck"],
          },
        ],
        directories: [
          {
            path: "apps",
            label: "Applications",
          },
          {
            path: "docs",
            label: "Documentation",
          },
          {
            path: "packages",
            label: "Packages",
          },
          {
            path: "tools",
            label: "Tools",
          },
        ],
      },
    });
    expect(runs.runs[0]).toMatchObject({
      id: result.syncRun.id,
      status: "succeeded",
      stats: {
        entityCount: 9,
        edgeCount: 8,
        manifestCount: 2,
        directoryCount: 4,
      },
    });
  });

  it("reruns metadata extraction by upserting the same stable entities instead of duplicating", async () => {
    const sourceRepo = await createMetadataSourceRepo(repoFullName);
    cleanups.push(sourceRepo.cleanup);
    const service = createMetadataTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });

    await service.syncRepositoryMetadata(repoFullName);
    const firstEntities = await service.listRepositoryEntities(repoFullName);
    const firstEntityIds = new Map(
      firstEntities.entities.map((entity) => [
        `${entity.kind}::${entity.stableKey}`,
        entity.id,
      ]),
    );

    await service.syncRepositoryMetadata(repoFullName);

    const secondEntities = await service.listRepositoryEntities(repoFullName);
    const secondEntityIds = new Map(
      secondEntities.entities.map((entity) => [
        `${entity.kind}::${entity.stableKey}`,
        entity.id,
      ]),
    );
    const runs = await service.listRepositoryRuns(repoFullName);

    expect(secondEntities.entityCount).toBe(9);
    expect(secondEntityIds).toEqual(firstEntityIds);
    expect(runs.runCount).toBe(2);
  });

  it("marks the sync run failed when the configured local source root points at another repo", async () => {
    const sourceRepo = await createMetadataSourceRepo("another-owner/another-repo");
    cleanups.push(sourceRepo.cleanup);
    const service = createMetadataTwinService({
      configuredSourceRepoRoot: sourceRepo.repoRoot,
    });
    let error: unknown;

    await expect(
      service
        .syncRepositoryMetadata(repoFullName)
        .catch((caughtError: unknown) => {
          error = caughtError;
          throw caughtError;
        }),
    ).rejects.toBeInstanceOf(TwinSourceUnavailableError);
    expect(error).toMatchObject({
      requestedRepoFullName: repoFullName,
      reason: "repo_mismatch",
    });

    const runs = await service.listRepositoryRuns(repoFullName);

    expect(runs.runs[0]).toMatchObject({
      status: "failed",
      errorSummary: expect.stringContaining("does not match requested"),
    });
  });

  it("fails truthfully when the configured local source root is unavailable", async () => {
    const service = createMetadataTwinService({
      configuredSourceRepoRoot: "/tmp/pocket-cto-missing-source-root",
    });
    let error: unknown;

    await expect(
      service
        .syncRepositoryMetadata(repoFullName)
        .catch((caughtError: unknown) => {
          error = caughtError;
          throw caughtError;
        }),
    ).rejects.toBeInstanceOf(TwinSourceUnavailableError);
    expect(error).toMatchObject({
      requestedRepoFullName: repoFullName,
      reason: "source_root_unavailable",
    });

    const runs = await service.listRepositoryRuns(repoFullName);

    expect(runs.runs[0]?.status).toBe("failed");
  });
});

function createMetadataTwinService(input: {
  configuredSourceRepoRoot: string;
}) {
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
            lastSyncedAt: "2026-03-16T22:55:00.000Z",
            removedFromInstallationAt: null,
            updatedAt: "2026-03-16T22:55:00.000Z",
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
    now: () => new Date("2026-03-16T22:55:00.000Z"),
  });
}

async function createMetadataSourceRepo(fullName: string) {
  const sourceRepo = await createTempGitRepo();

  await execFile("git", ["remote", "add", "origin", `https://github.com/${fullName}.git`], {
    cwd: sourceRepo.repoRoot,
  });
  await Promise.all([
    mkdir(join(sourceRepo.repoRoot, "apps", "control-plane"), {
      recursive: true,
    }),
    mkdir(join(sourceRepo.repoRoot, "docs", "ops"), {
      recursive: true,
    }),
    mkdir(join(sourceRepo.repoRoot, "packages", "domain"), {
      recursive: true,
    }),
    mkdir(join(sourceRepo.repoRoot, "tools"), {
      recursive: true,
    }),
  ]);
  await Promise.all([
    writeFile(
      join(sourceRepo.repoRoot, "README.md"),
      "# Pocket CTO\n\nDeterministic metadata extraction.\n",
      "utf8",
    ),
    writeFile(
      join(sourceRepo.repoRoot, "package.json"),
      JSON.stringify(
        {
          name: "pocket-cto",
          private: true,
          scripts: {
            build: "turbo build",
            test: "vitest run",
          },
          workspaces: ["apps/*", "packages/*"],
        },
        null,
        2,
      ),
      "utf8",
    ),
    writeFile(
      join(sourceRepo.repoRoot, "packages", "domain", "package.json"),
      JSON.stringify(
        {
          name: "@pocket-cto/domain",
          private: false,
          scripts: {
            typecheck: "tsc --noEmit",
          },
        },
        null,
        2,
      ),
      "utf8",
    ),
  ]);

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}
