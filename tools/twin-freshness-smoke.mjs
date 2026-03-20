import { execFile as execFileCallback } from "node:child_process";
import { realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { parseGitHubRepoFullNameFromRemoteUrl } from "../apps/control-plane/src/modules/twin/source-resolver.ts";
import { loadNearestEnvFile, parseArgs } from "./m2-exit-utils.mjs";

const execFile = promisify(execFileCallback);

const REQUIRED_LIVE_ENV = [
  "DATABASE_URL",
  "ARTIFACT_S3_ENDPOINT",
  "ARTIFACT_S3_BUCKET",
  "ARTIFACT_S3_ACCESS_KEY",
  "ARTIFACT_S3_SECRET_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY_BASE64",
];

const FRESHNESS_SLICE_NAMES = [
  "metadata",
  "ownership",
  "workflows",
  "testSuites",
  "docs",
  "runbooks",
];

const REFRESH_ROUTES = [
  {
    routeSuffix: "metadata-sync",
    sliceName: "metadata",
  },
  {
    routeSuffix: "ownership-sync",
    sliceName: "ownership",
  },
  {
    routeSuffix: "workflows-sync",
    sliceName: "workflows",
  },
  {
    routeSuffix: "test-suites-sync",
    sliceName: "testSuites",
  },
  {
    routeSuffix: "docs-sync",
    sliceName: "docs",
  },
  {
    routeSuffix: "runbooks-sync",
    sliceName: "runbooks",
  },
];

async function main() {
  loadNearestEnvFile();

  const options = parseArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
  const repoFullName = options.repoFullName;

  if (!repoFullName) {
    throw new Error("--repo-full-name is required.");
  }

  const missingEnv = findMissingEnv(REQUIRED_LIVE_ENV);
  if (missingEnv.length > 0) {
    throw new Error(
      `Live M3.6 freshness smoke requires configured env vars: ${missingEnv.join(", ")}`,
    );
  }

  const sourceCheck = await resolveSourceCheck(
    repoFullName,
    options.sourceRepoRoot ?? process.env.POCKET_CTO_SOURCE_REPO_ROOT ?? null,
  );

  if (sourceCheck.proofMode === "refreshed_live_state") {
    process.env.POCKET_CTO_SOURCE_REPO_ROOT =
      sourceCheck.resolvedSourceRepoRoot;
  }

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
    const refreshResults =
      sourceCheck.proofMode === "refreshed_live_state"
        ? await refreshTwinSlices(app, repoRoutePath)
        : null;
    const freshness = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/freshness`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          repository: {
            fullName: freshness.repository?.fullName ?? repoFullName,
            defaultBranch: freshness.repository?.defaultBranch ?? null,
          },
          proofMode: sourceCheck.proofMode,
          proofModeReason: sourceCheck.proofModeReason,
          sourceCheck: {
            requestedSourceRepoRoot: sourceCheck.requestedSourceRepoRoot,
            resolvedSourceRepoRoot: sourceCheck.resolvedSourceRepoRoot,
            actualRepoFullName: sourceCheck.actualRepoFullName,
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
          refreshResults,
          freshness: {
            rollupState: freshness.rollup?.state ?? null,
            rollupScorePercent: freshness.rollup?.scorePercent ?? null,
            blockingSlices: freshness.rollup?.blockingSlices ?? [],
            perSliceStates: buildSliceMap(freshness, "state"),
            latestRunIds: buildSliceMap(freshness, "latestRunId"),
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

async function resolveSourceCheck(repoFullName, sourceRepoRoot) {
  if (!sourceRepoRoot) {
    return {
      proofMode: "stored_state_only",
      proofModeReason: "no_source_repo_root",
      requestedSourceRepoRoot: null,
      resolvedSourceRepoRoot: null,
      actualRepoFullName: null,
    };
  }

  if (!isAbsolute(sourceRepoRoot)) {
    throw new Error(
      `--source-repo-root must be absolute. Received: ${sourceRepoRoot}`,
    );
  }

  let resolvedSourceRepoRoot;
  try {
    resolvedSourceRepoRoot = await resolveRepoRoot(sourceRepoRoot);
  } catch {
    return {
      proofMode: "stored_state_only",
      proofModeReason: "source_root_unavailable",
      requestedSourceRepoRoot: sourceRepoRoot,
      resolvedSourceRepoRoot: null,
      actualRepoFullName: null,
    };
  }

  let remoteUrl;
  try {
    remoteUrl = await readOriginRemote(resolvedSourceRepoRoot);
  } catch {
    return {
      proofMode: "stored_state_only",
      proofModeReason: "remote_unavailable",
      requestedSourceRepoRoot: sourceRepoRoot,
      resolvedSourceRepoRoot,
      actualRepoFullName: null,
    };
  }

  const actualRepoFullName = parseGitHubRepoFullNameFromRemoteUrl(remoteUrl);

  if (!actualRepoFullName) {
    return {
      proofMode: "stored_state_only",
      proofModeReason: "remote_unrecognized",
      requestedSourceRepoRoot: sourceRepoRoot,
      resolvedSourceRepoRoot,
      actualRepoFullName: null,
    };
  }

  if (actualRepoFullName !== repoFullName) {
    return {
      proofMode: "stored_state_only",
      proofModeReason: "repo_mismatch",
      requestedSourceRepoRoot: sourceRepoRoot,
      resolvedSourceRepoRoot,
      actualRepoFullName,
    };
  }

  return {
    proofMode: "refreshed_live_state",
    proofModeReason: "truthful_source_match",
    requestedSourceRepoRoot: sourceRepoRoot,
    resolvedSourceRepoRoot,
    actualRepoFullName,
  };
}

async function resolveRepoRoot(sourceRepoRoot) {
  const cwd = resolve(sourceRepoRoot);
  const { stdout } = await execFile("git", ["rev-parse", "--show-toplevel"], {
    cwd,
  });
  const repoRoot = stdout.trim();

  if (!repoRoot) {
    throw new Error("Git repo root resolution returned empty output");
  }

  return realpath(repoRoot);
}

async function readOriginRemote(repoRoot) {
  const { stdout } = await execFile("git", ["remote", "get-url", "origin"], {
    cwd: repoRoot,
  });
  const remoteUrl = stdout.trim();

  if (!remoteUrl) {
    throw new Error("empty remote");
  }

  return remoteUrl;
}

async function refreshTwinSlices(app, repoRoutePath) {
  const refreshResults = {};

  for (const step of REFRESH_ROUTES) {
    const result = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/${step.routeSuffix}`,
    });

    refreshResults[step.sliceName] = {
      runId: result.syncRun?.id ?? null,
      status: result.syncRun?.status ?? null,
    };
  }

  return refreshResults;
}

function buildSliceMap(freshness, field) {
  const slices = freshness?.slices ?? {};

  return Object.fromEntries(
    FRESHNESS_SLICE_NAMES.map((sliceName) => [
      sliceName,
      slices[sliceName]?.[field] ?? null,
    ]),
  );
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
