import { execFile as execFileCallback } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempGitRepo } from "../workspaces/test-git";
import { LocalTwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { InMemoryTwinRepository } from "./repository";
import { TwinService } from "./service";
import { LocalTwinRepositorySourceResolver } from "./source-resolver";

const execFile = promisify(execFileCallback);
const repoFullName = "616xold/pocket-cto";

describe("TwinService docs sync", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("succeeds truthfully for repos with zero approved docs", async () => {
    const sourceRepo = await createDocsSourceRepo(repoFullName, {
      "package.json": JSON.stringify(
        {
          name: "pocket-cto",
        },
        null,
        2,
      ),
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createDocsTwinService(sourceRepo.repoRoot);

    const result = await service.syncRepositoryDocs(repoFullName);
    const docs = await service.getRepositoryDocs(repoFullName);
    const sections = await service.getRepositoryDocSections(repoFullName);

    expect(result).toMatchObject({
      docsState: "no_docs",
      docFileCount: 0,
      docSectionCount: 0,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(docs).toMatchObject({
      docsState: "no_docs",
      counts: {
        docFileCount: 0,
        docSectionCount: 0,
      },
      docs: [],
    });
    expect(sections).toMatchObject({
      docsState: "no_docs",
      counts: {
        docFileCount: 0,
        docSectionCount: 0,
      },
      sections: [],
    });
  });

  it("reruns docs sync by upserting the same files and sections instead of duplicating", async () => {
    const sourceRepo = await createDocsSourceRepo(repoFullName, {
      "README.md": [
        "# Pocket CTO",
        "",
        "Mission control for software delivery.",
        "",
        "## Product boundary",
        "",
        "Single operator first.",
        "",
      ].join("\n"),
      "docs/architecture/overview.md": [
        "# Overview",
        "",
        "Architecture summary.",
        "",
        "## Twin",
        "",
        "Docs indexing lives here.",
        "",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const service = createDocsTwinService(sourceRepo.repoRoot);

    await service.syncRepositoryDocs(repoFullName);
    const firstEntities = await service.listRepositoryEntities(repoFullName);
    const firstDocEntityIds = new Map(
      firstEntities.entities
        .filter(
          (entity) =>
            entity.kind === "doc_file" || entity.kind === "doc_section",
        )
        .map((entity) => [`${entity.kind}::${entity.stableKey}`, entity.id]),
    );

    const secondResult = await service.syncRepositoryDocs(repoFullName);
    const secondEntities = await service.listRepositoryEntities(repoFullName);
    const secondDocEntityIds = new Map(
      secondEntities.entities
        .filter(
          (entity) =>
            entity.kind === "doc_file" || entity.kind === "doc_section",
        )
        .map((entity) => [`${entity.kind}::${entity.stableKey}`, entity.id]),
    );

    expect(secondResult).toMatchObject({
      docsState: "docs_available",
      docFileCount: 2,
      docSectionCount: 4,
    });
    expect(secondDocEntityIds).toEqual(firstDocEntityIds);
    expect(
      secondEntities.entities.filter((entity) => entity.kind === "doc_file"),
    ).toHaveLength(2);
    expect(
      secondEntities.entities.filter((entity) => entity.kind === "doc_section"),
    ).toHaveLength(4);
  });
});

function createDocsTwinService(configuredSourceRepoRoot: string) {
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
          lastSyncedAt: "2026-03-19T14:15:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T14:15:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-19T14:15:00.000Z") + tick++ * 1000),
  });
}

async function createDocsSourceRepo(
  fullName: string,
  files: Record<string, string>,
) {
  const sourceRepo = await createTempGitRepo();

  await execFile(
    "git",
    ["remote", "add", "origin", `https://github.com/${fullName}.git`],
    {
      cwd: sourceRepo.repoRoot,
    },
  );

  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(sourceRepo.repoRoot, dirname(path)), {
      recursive: true,
    });
    await writeFile(join(sourceRepo.repoRoot, path), content, "utf8");
  }

  if (!Object.hasOwn(files, "README.md")) {
    await rm(join(sourceRepo.repoRoot, "README.md"), {
      force: true,
    });
  }

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}
