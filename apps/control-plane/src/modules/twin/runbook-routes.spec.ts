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

describe("runbook twin routes", () => {
  const apps: FastifyInstance[] = [];
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  });

  it("returns stored runbook documents and steps clearly from the latest runbooks sync snapshot", async () => {
    const sourceRepo = await createRunbookSourceRepo(repoFullName, {
      "START_HERE.md": [
        "# Start here",
        "",
        "## First run in Codex",
        "",
        "```bash",
        "pnpm dev",
        "```",
        "",
      ].join("\n"),
      "docs/ops/local-dev.md": [
        "# Local development",
        "",
        "## Health",
        "",
        "- `curl http://localhost:4000/health`",
        "",
      ].join("\n"),
    });
    cleanups.push(sourceRepo.cleanup);
    const app = await createTwinApp(
      apps,
      createRunbookTwinService(sourceRepo.repoRoot),
    );

    const docsSyncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/docs-sync",
    });
    const syncResponse = await app.inject({
      method: "POST",
      url: "/twin/repositories/616xold/pocket-cto/runbooks-sync",
    });
    const runbooksResponse = await app.inject({
      method: "GET",
      url: "/twin/repositories/616xold/pocket-cto/runbooks",
    });

    expect(docsSyncResponse.statusCode).toBe(200);
    expect(syncResponse.statusCode).toBe(200);
    expect(syncResponse.json()).toMatchObject({
      runbookState: "runbooks_available",
      runbookDocumentCount: 2,
      runbookStepCount: 2,
      commandFamilyCounts: {
        curl: 1,
        pnpm: 1,
      },
      syncRun: {
        status: "succeeded",
      },
    });
    expect(runbooksResponse.statusCode).toBe(200);
    const payload = runbooksResponse.json();

    expect(payload).toMatchObject({
      repository: {
        fullName: repoFullName,
      },
      runbookState: "runbooks_available",
      counts: {
        runbookDocumentCount: 2,
        runbookStepCount: 2,
        commandFamilyCounts: {
          curl: 1,
          pnpm: 1,
        },
      },
    });

    expect(payload.runbooks).toHaveLength(2);
    expect(
      payload.runbooks.find(
        (runbook: { path: string }) => runbook.path === "START_HERE.md",
      ),
    ).toMatchObject({
      path: "START_HERE.md",
      classificationReason: "start_here_root",
      stepCount: 1,
      commandFamilyCounts: {
        pnpm: 1,
      },
      steps: [
        {
          ordinal: 1,
          headingContext: "Start here > First run in Codex",
          commandText: "pnpm dev",
          commandFamily: "pnpm",
        },
      ],
    });
    expect(
      payload.runbooks.find(
        (runbook: { path: string }) => runbook.path === "docs/ops/local-dev.md",
      ),
    ).toMatchObject({
      path: "docs/ops/local-dev.md",
      classificationReason: "docs_ops_path",
      stepCount: 1,
      commandFamilyCounts: {
        curl: 1,
      },
      steps: [
        {
          ordinal: 1,
          headingContext: "Local development > Health",
          commandText: "curl http://localhost:4000/health",
          commandFamily: "curl",
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

function createRunbookTwinService(configuredSourceRepoRoot: string) {
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
          lastSyncedAt: "2026-03-19T17:10:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-19T17:10:00.000Z",
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
    now: () => new Date(Date.parse("2026-03-19T17:10:00.000Z") + tick++ * 1000),
  });
}

async function createRunbookSourceRepo(
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
