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
    await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/metadata-sync`,
    });
    const ownershipSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/ownership-sync`,
    });
    const summary = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/ownership-summary`,
    });
    const counts = summary?.counts ?? {};
    const unownedTargetCount =
      (counts.unownedDirectoryCount ?? 0) + (counts.unownedManifestCount ?? 0);

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
          },
          ownershipSync: {
            runId: ownershipSync.syncRun?.id ?? null,
            status: ownershipSync.syncRun?.status ?? null,
            codeownersFilePath: ownershipSync.codeownersFilePath ?? null,
            ruleCount: ownershipSync.ruleCount ?? 0,
            ownerCount: ownershipSync.ownerCount ?? 0,
          },
          ownershipSummary: {
            latestRunId: summary.latestRun?.id ?? null,
            latestRunStatus: summary.latestRun?.status ?? null,
            ownershipState: summary.ownershipState ?? null,
            codeownersFilePath: summary.codeownersFile?.path ?? null,
            ruleCount: counts.ruleCount ?? 0,
            ownerCount: counts.ownerCount ?? 0,
            ownedDirectoryCount: counts.ownedDirectoryCount ?? 0,
            ownedManifestCount: counts.ownedManifestCount ?? 0,
            unownedTargetCount,
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
