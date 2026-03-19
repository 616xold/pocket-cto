import { isAbsolute } from "node:path";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { loadNearestEnvFile, parseArgs } from "./m2-exit-utils.mjs";

const DEFAULT_REPO_FULL_NAME = "616xold/pocket-cto";
const REQUIRED_LIVE_ENV = [
  "DATABASE_URL",
  "ARTIFACT_S3_ENDPOINT",
  "ARTIFACT_S3_BUCKET",
  "ARTIFACT_S3_ACCESS_KEY",
  "ARTIFACT_S3_SECRET_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY_BASE64",
];

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
  const repoFullName = options.repoFullName ?? DEFAULT_REPO_FULL_NAME;
  const sourceRepoRoot =
    options.sourceRepoRoot ?? process.env.POCKET_CTO_SOURCE_REPO_ROOT;
  const missingEnv = findMissingEnv(REQUIRED_LIVE_ENV);

  if (missingEnv.length > 0) {
    throw new Error(
      `Live M3.5 smoke requires configured env vars: ${missingEnv.join(", ")}`,
    );
  }

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
  app.log.level = "silent";

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
    const docsSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/docs-sync`,
    });
    const docsView = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/docs`,
    });
    const docSectionsView = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/doc-sections`,
    });
    const runbooksSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/runbooks-sync`,
    });
    const runbooksView = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/runbooks`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          sourceRepoRoot,
          repository: {
            fullName:
              runbooksView.repository?.fullName ??
              docsView.repository?.fullName ??
              repoFullName,
          },
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
          docsSync: {
            runId: docsSync.syncRun?.id ?? null,
            status: docsSync.syncRun?.status ?? null,
            docsState: docsSync.docsState ?? null,
            docFileCount: docsSync.docFileCount ?? 0,
            docSectionCount: docsSync.docSectionCount ?? 0,
          },
          docsView: {
            latestRunId: docsView.latestRun?.id ?? null,
            latestRunStatus: docsView.latestRun?.status ?? null,
            docsState: docsView.docsState ?? null,
            docFileCount: docsView.counts?.docFileCount ?? 0,
            docSectionCount: docsView.counts?.docSectionCount ?? 0,
          },
          docSectionsView: {
            latestRunId: docSectionsView.latestRun?.id ?? null,
            latestRunStatus: docSectionsView.latestRun?.status ?? null,
            docsState: docSectionsView.docsState ?? null,
            docFileCount: docSectionsView.counts?.docFileCount ?? 0,
            docSectionCount: docSectionsView.counts?.docSectionCount ?? 0,
          },
          runbooksSync: {
            runId: runbooksSync.syncRun?.id ?? null,
            status: runbooksSync.syncRun?.status ?? null,
            runbookState: runbooksSync.runbookState ?? null,
            runbookDocumentCount: runbooksSync.runbookDocumentCount ?? 0,
            runbookStepCount: runbooksSync.runbookStepCount ?? 0,
            commandFamilyCounts: runbooksSync.commandFamilyCounts ?? {},
          },
          runbooksView: {
            latestRunId: runbooksView.latestRun?.id ?? null,
            latestRunStatus: runbooksView.latestRun?.status ?? null,
            runbookState: runbooksView.runbookState ?? null,
            runbookDocumentCount:
              runbooksView.counts?.runbookDocumentCount ?? 0,
            runbookStepCount: runbooksView.counts?.runbookStepCount ?? 0,
            commandFamilyCounts: runbooksView.counts?.commandFamilyCounts ?? {},
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

function findMissingEnv(requiredEnv) {
  return requiredEnv.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim().length === 0;
  });
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
