import { isAbsolute } from "node:path";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { loadNearestEnvFile, parseArgs } from "./m2-exit-utils.mjs";

const DEFAULT_REPO_FULL_NAME = "616xold/pocket-cto";

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(process.argv.slice(2).filter((entry) => entry !== "--"));
  const repoFullName = options.repoFullName ?? DEFAULT_REPO_FULL_NAME;
  const sourceRepoRoot =
    options.sourceRepoRoot ?? process.env.POCKET_CTO_SOURCE_REPO_ROOT;

  if (!sourceRepoRoot) {
    throw new Error(
      "Set POCKET_CTO_SOURCE_REPO_ROOT or pass --source-repo-root to a local checkout of the requested repository.",
    );
  }

  if (!isAbsolute(sourceRepoRoot)) {
    throw new Error(
      `--source-repo-root must be absolute. Received: ${sourceRepoRoot}`,
    );
  }

  process.env.POCKET_CTO_SOURCE_REPO_ROOT = sourceRepoRoot;

  const app = await buildApp();

  try {
    const repoRoutePath = toTwinRepositoryPath(repoFullName);
    const installationsSync = await injectJson(app, {
      method: "POST",
      url: "/github/installations/sync",
      payload: {},
    });
    const repositoriesSync = await injectJson(app, {
      method: "POST",
      url: "/github/repositories/sync",
      payload: {},
    });
    const metadataSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/metadata-sync`,
    });
    const summary = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/summary`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sourceRepoRoot,
          installationsSync: {
            syncedAt: installationsSync.syncedAt ?? null,
            syncedCount: installationsSync.syncedCount ?? null,
          },
          repositoriesSync: {
            syncedAt: repositoriesSync.syncedAt ?? null,
            syncedInstallationCount:
              repositoriesSync.syncedInstallationCount ?? null,
            syncedRepositoryCount:
              repositoriesSync.syncedRepositoryCount ?? null,
          },
          repository: {
            fullName: summary.repository?.fullName ?? repoFullName,
            defaultBranch:
              summary.metadata?.defaultBranch?.name ??
              summary.repository?.defaultBranch ??
              null,
          },
          metadataSync: {
            runId: metadataSync.syncRun?.id ?? null,
            status: metadataSync.syncRun?.status ?? null,
            entityCount: metadataSync.entityCount ?? null,
            edgeCount: metadataSync.edgeCount ?? null,
            entityCountsByKind: metadataSync.entityCountsByKind ?? {},
            edgeCountsByKind: metadataSync.edgeCountsByKind ?? {},
          },
          summary: {
            latestRunId: summary.latestRun?.id ?? null,
            latestRunStatus: summary.latestRun?.status ?? null,
            entityCount: summary.entityCount ?? null,
            edgeCount: summary.edgeCount ?? null,
            entityCountsByKind: summary.entityCountsByKind ?? {},
            edgeCountsByKind: summary.edgeCountsByKind ?? {},
            rootReadmePath: summary.metadata?.rootReadme?.path ?? null,
            manifestCount: Array.isArray(summary.metadata?.manifests)
              ? summary.metadata.manifests.length
              : 0,
            workspaceDirectoryCount: Array.isArray(summary.metadata?.directories)
              ? summary.metadata.directories.length
              : 0,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

async function injectJson(app, request) {
  const response = await app.inject(request);
  const text = response.body ?? "";

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${request.method} ${request.url} failed with ${response.statusCode}: ${text}`,
    );
  }

  return text.length > 0 ? JSON.parse(text) : null;
}

function toTwinRepositoryPath(repoFullName) {
  const [owner, repo] = repoFullName.split("/", 2);

  if (!owner || !repo) {
    throw new Error(
      `--repo-full-name must be in owner/repo form. Received: ${repoFullName}`,
    );
  }

  return `/twin/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
