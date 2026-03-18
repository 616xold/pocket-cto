import { execFile as execFileCallback } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("TwinService effective ownership", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("reruns effective ownership sync without duplicating manifest or directory edges", async () => {
    const sourceRepo = await createEffectiveOwnershipSourceRepo(repoFullName, {
      codeownersContent: [
        "apps/ @Apps-Team",
        "apps/web/package.json @Web-Team",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createMetadataBackedTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryMetadata(repoFullName);
    await service.syncRepositoryOwnership(repoFullName);
    const firstEffectiveEdgeIds = readEffectiveEdgeIds(
      await service.listRepositoryEdges(repoFullName),
    );

    const secondResult = await service.syncRepositoryOwnership(repoFullName);
    const secondEffectiveEdgeIds = readEffectiveEdgeIds(
      await service.listRepositoryEdges(repoFullName),
    );
    const summary = await service.getRepositoryOwnershipSummary(repoFullName);

    expect(secondResult).toMatchObject({
      codeownersFilePath: ".github/CODEOWNERS",
      syncRun: {
        status: "succeeded",
      },
      edgeCountsByKind: {
        rule_owns_directory: 1,
        rule_owns_manifest: 1,
      },
    });
    expect(secondEffectiveEdgeIds).toEqual(firstEffectiveEdgeIds);
    expect(summary).toMatchObject({
      ownershipState: "effective_ownership_available",
      codeownersFile: {
        path: ".github/CODEOWNERS",
      },
      counts: {
        ruleCount: 2,
        ownerCount: 2,
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
            ordinal: 1,
            rawPattern: "apps/",
          },
        },
      ],
      ownedManifests: [
        {
          path: "apps/web/package.json",
          effectiveOwners: ["@web-team"],
          appliedRule: {
            ordinal: 2,
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

  it("reports stored metadata targets as unowned when no CODEOWNERS file exists", async () => {
    const sourceRepo = await createEffectiveOwnershipSourceRepo(repoFullName, {
      codeownersContent: null,
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createMetadataBackedTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryMetadata(repoFullName);
    const syncResult = await service.syncRepositoryOwnership(repoFullName);
    const summary = await service.getRepositoryOwnershipSummary(repoFullName);

    expect(syncResult).toMatchObject({
      codeownersFilePath: null,
      ruleCount: 0,
      ownerCount: 0,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(summary).toMatchObject({
      ownershipState: "no_codeowners_file",
      codeownersFile: null,
      counts: {
        ruleCount: 0,
        ownerCount: 0,
        directoryCount: 2,
        manifestCount: 2,
        ownedDirectoryCount: 0,
        ownedManifestCount: 0,
        unownedDirectoryCount: 2,
        unownedManifestCount: 2,
      },
      unownedDirectories: [
        {
          path: "apps",
        },
        {
          path: "docs",
        },
      ],
      unownedManifests: [
        {
          path: "apps/web/package.json",
          packageName: "web-app",
        },
        {
          path: "package.json",
          packageName: "pocket-cto",
        },
      ],
    });
  });
});

function createMetadataBackedTwinService(configuredSourceRepoRoot: string) {
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
            lastSyncedAt: "2026-03-18T07:00:00.000Z",
            removedFromInstallationAt: null,
            updatedAt: "2026-03-18T07:00:00.000Z",
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
      configuredSourceRepoRoot,
      processCwd: process.cwd(),
    }),
    now: () =>
      new Date(Date.parse("2026-03-18T07:05:00.000Z") + tick++ * 1000),
  });
}

async function createEffectiveOwnershipSourceRepo(
  fullName: string,
  input: {
    codeownersContent: string | null;
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
      join(sourceRepo.repoRoot, "README.md"),
      "# Pocket CTO\n\nEffective ownership fixture.\n",
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

  if (input.codeownersContent) {
    await writeFile(
      join(sourceRepo.repoRoot, ".github", "CODEOWNERS"),
      input.codeownersContent,
      "utf8",
    );
  }

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}

function readEffectiveEdgeIds(
  view: Awaited<ReturnType<TwinService["listRepositoryEdges"]>>,
) {
  return new Map(
    view.edges
      .filter((edge) =>
        edge.kind === "rule_owns_directory" || edge.kind === "rule_owns_manifest",
      )
      .map((edge) => [`${edge.kind}::${edge.toEntityId}`, edge.id]),
  );
}
