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

describe("docs twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("returns stored docs and sections clearly from the latest docs sync snapshot", async () => {
    const sourceRepo = await createDocsSourceRepo(repoFullName, {
      "README.md": [
        "# Pocket CTO",
        "",
        "Evidence-native mission control.",
        "",
        "## North star",
        "",
        "A text request becomes a persisted mission.",
        "",
      ].join("\n"),
      "docs/architecture/overview.md": [
        "# Overview",
        "",
        "Architecture summary.",
        "",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const app = await createTwinApp(
      apps,
      createDocsTwinService(sourceRepo.repoRoot),
    );

    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/docs-sync",
    });
    const docsResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/docs",
    });
    const sectionsResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/doc-sections",
    });

    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      docsState: "docs_available",
      docFileCount: 2,
      docSectionCount: 3,
      syncRun: {
        status: "succeeded",
      },
    });
    expect(docsResponse.statusCode).toBe(200);
    expect(docsResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      freshness: {
        state: "fresh",
        latestRunStatus: "succeeded",
        staleAfterSeconds: 86_400,
      },
      docsState: "docs_available",
      counts: {
        docFileCount: 2,
        docSectionCount: 3,
      },
      docs: [
        {
          path: "docs/architecture/overview.md",
          title: "Overview",
          headingCount: 1,
        },
        {
          path: "README.md",
          title: "Pocket CTO",
          headingCount: 2,
        },
      ],
    });
    expect(sectionsResponse.statusCode).toBe(200);
    expect(sectionsResponse.json()).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      docsState: "docs_available",
      counts: {
        docFileCount: 2,
        docSectionCount: 3,
      },
      sections: [
        {
          sourceFilePath: "docs/architecture/overview.md",
          headingText: "Overview",
          headingLevel: 1,
          anchor: "overview",
          ordinal: 1,
        },
        {
          sourceFilePath: "README.md",
          headingText: "Pocket CTO",
          headingLevel: 1,
          anchor: "pocket-cto",
          ordinal: 1,
        },
        {
          sourceFilePath: "README.md",
          headingText: "North star",
          headingLevel: 2,
          anchor: "north-star",
          ordinal: 2,
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
          lastSyncedAt: "2026-03-19T14:20:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T14:20:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-19T14:20:00.000Z") + tick++ * 1000),
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

  return {
    cleanup: sourceRepo.cleanup,
    repoRoot: sourceRepo.repoRoot,
  };
}
