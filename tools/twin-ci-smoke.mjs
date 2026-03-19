import { isAbsolute } from "node:path";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { loadNearestEnvFile, parseArgs } from "./m2-exit-utils.mjs";

const DEFAULT_REPO_FULL_NAME = "616xold/pocket-cto";

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
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
    const workflowSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/workflows-sync`,
    });
    const testSuiteSync = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/test-suites-sync`,
    });
    const ciSummary = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/ci-summary`,
    });
    const counts = ciSummary?.counts ?? {};

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
          metadataSync: {
            runId: metadataSync.syncRun?.id ?? null,
            status: metadataSync.syncRun?.status ?? null,
          },
          repository: {
            fullName: ciSummary.repository?.fullName ?? repoFullName,
          },
          workflowSync: {
            runId: workflowSync.syncRun?.id ?? null,
            status: workflowSync.syncRun?.status ?? null,
            workflowFileCount: workflowSync.workflowFileCount ?? 0,
            workflowCount: workflowSync.workflowCount ?? 0,
            jobCount: workflowSync.jobCount ?? 0,
          },
          testSuiteSync: {
            runId: testSuiteSync.syncRun?.id ?? null,
            status: testSuiteSync.syncRun?.status ?? null,
            testSuiteCount: testSuiteSync.testSuiteCount ?? 0,
            mappedJobCount: testSuiteSync.mappedJobCount ?? 0,
            unmappedJobCount: testSuiteSync.unmappedJobCount ?? 0,
          },
          ciSummary: {
            latestWorkflowRunId: ciSummary.latestWorkflowRun?.id ?? null,
            latestTestSuiteRunId: ciSummary.latestTestSuiteRun?.id ?? null,
            workflowState: ciSummary.workflowState ?? null,
            testSuiteState: ciSummary.testSuiteState ?? null,
            workflowFileCount: counts.workflowFileCount ?? 0,
            workflowCount: counts.workflowCount ?? 0,
            jobCount: counts.jobCount ?? 0,
            testSuiteCount: counts.testSuiteCount ?? 0,
            mappedJobCount: counts.mappedJobCount ?? 0,
            unmappedJobCount: counts.unmappedJobCount ?? 0,
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
