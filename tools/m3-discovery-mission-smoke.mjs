import { execFile as execFileCallback } from "node:child_process";
import { realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { promisify } from "node:util";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { parseGitHubRepoFullNameFromRemoteUrl } from "../apps/control-plane/src/modules/twin/source-resolver.ts";
import { loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const execFile = promisify(execFileCallback);

const QUESTION_KIND = "auth_change";
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
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
  {
    routeSuffix: "docs-sync",
    sliceName: "docs",
  },
  {
    routeSuffix: "runbooks-sync",
    sliceName: "runbooks",
  },
];
const SILENT_LOGGER = {
  error() {},
  info() {},
};

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
      `Live M3 discovery smoke requires configured env vars: ${missingEnv.join(", ")}`,
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

  const container = await createEmbeddedWorkerContainer();
  const app = await buildApp({ container });
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
    const created = await injectJson(app, {
      method: "POST",
      url: "/missions/discovery",
      payload: {
        repoFullName: options.repoFullName,
        questionKind: QUESTION_KIND,
        changedPaths: options.changedPaths,
        requestedBy: options.requestedBy,
      },
    });
    const detail = await pollMissionDetail({
      app,
      missionId: created.mission.id,
      worker: container.worker,
    });
    const discoveryAnswer = detail.discoveryAnswer ?? null;
    const discoveryAnswerArtifact =
      detail.artifacts.find((artifact) => artifact.kind === "discovery_answer") ??
      null;

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          repository: {
            fullName:
              discoveryAnswer?.repoFullName ??
              detail.proofBundle.targetRepoFullName ??
              detail.mission.primaryRepo ??
              options.repoFullName,
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
          mission: {
            id: detail.mission.id,
            status: detail.mission.status,
            sourceKind: detail.mission.sourceKind,
            scoutTaskStatus:
              detail.tasks.find((task) => task.role === "scout")?.status ?? null,
            proofBundleStatus: detail.proofBundle.status,
            artifactId: discoveryAnswerArtifact?.id ?? null,
          },
          discoveryAnswer: {
            changedPaths:
              discoveryAnswer?.changedPaths ?? options.changedPaths,
            impactedManifestCount:
              discoveryAnswer?.impactedManifests.length ?? 0,
            impactedDirectoryCount:
              discoveryAnswer?.impactedDirectories.length ?? 0,
            ownerCount: countUniqueOwners(discoveryAnswer?.ownersByTarget ?? []),
            relatedTestSuiteCount:
              discoveryAnswer?.relatedTestSuites.length ?? 0,
            relatedMappedCiJobCount:
              discoveryAnswer?.relatedMappedCiJobs.length ?? 0,
            freshnessRollup:
              discoveryAnswer?.freshnessRollup.state ?? null,
            freshnessReason:
              discoveryAnswer?.freshnessRollup.reasonSummary ?? null,
            limitationCount: discoveryAnswer?.limitations.length ?? 0,
            answerSummary: discoveryAnswer?.answerSummary ?? null,
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
    requestedBy: "m3-discovery-smoke",
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

    if (rawKey === "requested-by") {
      parsed.requestedBy = value.trim();
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

  for (const target of ownersByTarget) {
    for (const owner of target.effectiveOwners ?? []) {
      uniqueOwners.add(owner);
    }
  }

  return uniqueOwners.size;
}

async function pollMissionDetail(input) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    await input.worker.run({
      log: SILENT_LOGGER,
      pollIntervalMs: 1,
      runOnce: true,
    });

    const detail = await injectJson(input.app, {
      method: "GET",
      url: `/missions/${input.missionId}`,
    });

    if (
      isTerminalMissionStatus(detail.mission.status) &&
      detail.tasks.every((task) => isTerminalTaskStatus(task.status))
    ) {
      return detail;
    }

    await wait(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Mission ${input.missionId} did not reach a terminal state within ${MAX_POLLS} polls.`,
  );
}

function isTerminalMissionStatus(status) {
  return ["succeeded", "failed", "cancelled"].includes(status);
}

function isTerminalTaskStatus(status) {
  return ["succeeded", "failed", "cancelled"].includes(status);
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

function toTwinRepositoryPath(repoFullName) {
  const [owner, repo] = repoFullName.split("/", 2);

  if (!owner || !repo) {
    throw new Error(
      `--repo-full-name must be in owner/repo form. Received: ${repoFullName}`,
    );
  }

  return `/twin/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

async function refreshTwinSlices(app, repoRoutePath) {
  const results = {};

  for (const route of REFRESH_ROUTES) {
    const result = await injectJson(app, {
      method: "POST",
      url: `${repoRoutePath}/${route.routeSuffix}`,
      payload: {},
    });

    results[route.sliceName] = {
      runId: result.syncRun?.id ?? null,
      status: result.syncRun?.status ?? null,
    };
  }

  return results;
}

async function injectJson(app, request) {
  const response = await app.inject(request);

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `${request.method} ${request.url} failed with ${response.statusCode}: ${response.body}`,
    );
  }

  return response.json();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
