import { execFile as execFileCallback } from "node:child_process";
import { realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { parseGitHubRepoFullNameFromRemoteUrl } from "../apps/control-plane/src/modules/twin/source-resolver.ts";
import { loadNearestEnvFile } from "./m2-exit-utils.mjs";

const execFile = promisify(execFileCallback);

const QUESTION_KIND = "auth_change";
const REQUIRED_LIVE_ENV = [
  "DATABASE_URL",
  "ARTIFACT_S3_ENDPOINT",
  "ARTIFACT_S3_BUCKET",
  "ARTIFACT_S3_ACCESS_KEY",
  "ARTIFACT_S3_SECRET_KEY",
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY_BASE64",
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
];

async function main() {
  loadNearestEnvFile();

  const options = parseSmokeArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );

  if (!options.repoFullName) {
    throw new Error("--repo-full-name is required.");
  }

  if (options.changedPaths.length === 0) {
    throw new Error("Provide at least one explicit --changed-path.");
  }

  const missingEnv = findMissingEnv(REQUIRED_LIVE_ENV);
  if (missingEnv.length > 0) {
    throw new Error(
      `Live M3.7 blast-radius smoke requires configured env vars: ${missingEnv.join(", ")}`,
    );
  }

  const sourceCheck = await resolveSourceCheck(
    options.repoFullName,
    options.sourceRepoRoot ?? process.env.POCKET_CTO_SOURCE_REPO_ROOT ?? null,
  );

  if (
    sourceCheck.proofMode === "refreshed_live_state" &&
    sourceCheck.resolvedSourceRepoRoot
  ) {
    process.env.POCKET_CTO_SOURCE_REPO_ROOT =
      sourceCheck.resolvedSourceRepoRoot;
  }

  const app = await buildApp();
  app.log.level = "silent";

  try {
    const repoRoutePath = toTwinRepositoryPath(options.repoFullName);
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
    const blastRadius = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/blast-radius/query`,
      payload: {
        questionKind: QUESTION_KIND,
        changedPaths: options.changedPaths,
      },
    });
    const freshness = await injectJson(app, {
      method: "GET",
      url: `${repoRoutePath}/freshness`,
    });

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          repository: {
            fullName:
              blastRadius.repository?.fullName ??
              freshness.repository?.fullName ??
              options.repoFullName,
            defaultBranch:
              blastRadius.repository?.defaultBranch ??
              freshness.repository?.defaultBranch ??
              null,
          },
          questionKind: QUESTION_KIND,
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
          blastRadius: {
            changedPaths: blastRadius.queryEcho?.changedPaths ?? options.changedPaths,
            impactedManifestCount: blastRadius.impactedManifests?.length ?? 0,
            impactedDirectoryCount: blastRadius.impactedDirectories?.length ?? 0,
            ownerCount: countUniqueOwners(blastRadius.ownersByTarget),
            relatedTestSuiteCount: blastRadius.relatedTestSuites?.length ?? 0,
            relatedMappedCiJobCount: blastRadius.relatedMappedCiJobs?.length ?? 0,
            freshnessRollup:
              blastRadius.freshness?.rollup?.state ??
              freshness.rollup?.state ??
              null,
            limitationCount: blastRadius.limitations?.length ?? 0,
            limitationCodes: Array.isArray(blastRadius.limitations)
              ? blastRadius.limitations.map((entry) => entry.code)
              : [],
            unmatchedPaths: blastRadius.unmatchedPaths ?? [],
            answerSummary: blastRadius.answerSummary ?? null,
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

function parseSmokeArgs(argv) {
  const parsed = {
    changedPaths: [],
    repoFullName: null,
    sourceRepoRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];

    if (!entry?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${entry}`);
    }

    const [rawKey, inlineValue] = entry.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];

    if (value === undefined) {
      throw new Error(`Missing value for --${rawKey}`);
    }

    if (inlineValue === undefined) {
      index += 1;
    }

    if (rawKey === "changed-path") {
      const changedPath = value.trim();

      if (changedPath.length === 0) {
        throw new Error("--changed-path must not be empty.");
      }

      parsed.changedPaths.push(changedPath);
      continue;
    }

    if (rawKey === "repo-full-name") {
      parsed.repoFullName = value.trim();
      continue;
    }

    if (rawKey === "source-repo-root") {
      parsed.sourceRepoRoot = value.trim();
      continue;
    }

    throw new Error(`Unexpected argument: --${rawKey}`);
  }

  parsed.changedPaths = [...new Set(parsed.changedPaths)];

  return parsed;
}

function findMissingEnv(requiredEnv) {
  return requiredEnv.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

function countUniqueOwners(ownersByTarget) {
  const uniqueOwners = new Set();

  for (const target of ownersByTarget ?? []) {
    for (const owner of target.effectiveOwners ?? []) {
      uniqueOwners.add(owner);
    }
  }

  return uniqueOwners.size;
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
