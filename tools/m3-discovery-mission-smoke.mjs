import { execFile as execFileCallback } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createEmbeddedWorkerContainer } from "../apps/control-plane/src/bootstrap.ts";
import { parseGitHubRepoFullNameFromRemoteUrl } from "../apps/control-plane/src/modules/twin/source-resolver.ts";
import { closeAllPools } from "../packages/db/src/client.ts";
import { buildRunTag, loadNearestEnvFile, wait } from "./m2-exit-utils.mjs";

const require = createRequire(
  new URL("../packages/db/package.json", import.meta.url),
);
const { Client } = require("pg");

const execFile = promisify(execFileCallback);

const QUESTION_KIND = "auth_change";
const POLL_INTERVAL_MS = 250;
const MAX_POLLS = 40;
const DEFAULT_DB_NAME_PREFIX = "pocket_cto_m3_smoke";
const MAX_DATABASE_NAME_LENGTH = 63;
const ISOLATED_TEST_SUFFIX = "_test";
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
const MODULE_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const CI_PREPARE_POSTGRES_PATH = fileURLToPath(
  new URL("./ci-prepare-postgres.mjs", import.meta.url),
);
const CI_MIGRATE_DATABASES_PATH = fileURLToPath(
  new URL("./ci-migrate-databases.mjs", import.meta.url),
);

async function main() {
  loadNearestEnvFile();

  const options = parseSmokeArgs(
    process.argv.slice(2).filter((entry) => entry !== "--"),
  );
  validateSmokeOptions(options);

  const missingEnv = findMissingEnv(REQUIRED_LIVE_ENV);
  if (missingEnv.length > 0) {
    throw new Error(
      `Live M3 discovery smoke requires configured env vars: ${missingEnv.join(", ")}`,
    );
  }

  let isolation = null;
  let app = null;

  try {
    if (options.isolateDb) {
      isolation = await prepareIsolatedDatabases({
        baseDatabaseUrl: process.env.DATABASE_URL,
        baseTestDatabaseUrl: process.env.TEST_DATABASE_URL ?? null,
        dbNamePrefix: options.dbNamePrefix,
      });
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
    app = await buildApp({ container });
    app.log.level = "silent";

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
    const isolationSummary = isolation;
    const { cleanupStatus, shutdownError } = await shutdownSmoke({
      app,
      isolation,
      preserveIsolatedDatabases: false,
      runSucceeded: true,
    });
    if (shutdownError) {
      throw shutdownError;
    }
    app = null;
    isolation = null;

    console.log(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          databaseIsolation: buildDatabaseIsolationSummary({
            cleanupStatus,
            isolation: isolationSummary,
            mode: options.isolateDb ? "isolated" : "shared",
          }),
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
            changedPaths: discoveryAnswer?.changedPaths ?? options.changedPaths,
            impactedManifestCount:
              discoveryAnswer?.impactedManifests.length ?? 0,
            impactedDirectoryCount:
              discoveryAnswer?.impactedDirectories.length ?? 0,
            ownerCount: countUniqueOwners(discoveryAnswer?.ownersByTarget ?? []),
            relatedTestSuiteCount:
              discoveryAnswer?.relatedTestSuites.length ?? 0,
            relatedMappedCiJobCount:
              discoveryAnswer?.relatedMappedCiJobs.length ?? 0,
            freshnessRollup: discoveryAnswer?.freshnessRollup.state ?? null,
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
  } catch (error) {
    const isolationSummary = isolation;
    const { cleanupStatus, shutdownError } = await shutdownSmoke({
      app,
      isolation,
      preserveIsolatedDatabases: options.keepDbOnFailure,
      runSucceeded: false,
    });
    const resolvedError =
      shutdownError === null
        ? error
        : new Error(
            `${error instanceof Error ? error.message : String(error)} / ${shutdownError.message}`,
          );

    throw new Error(
      buildSmokeFailureMessage({
        cleanupStatus,
        error: resolvedError,
        isolation: isolationSummary,
      }),
    );
  }
}

export function parseSmokeArgs(argv) {
  const parsed = {
    changedPaths: [],
    dbNamePrefix: DEFAULT_DB_NAME_PREFIX,
    isolateDb: false,
    keepDbOnFailure: false,
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

    if (rawKey === "isolate-db") {
      parsed.isolateDb = true;
      continue;
    }

    if (rawKey === "keep-db-on-failure") {
      parsed.keepDbOnFailure = true;
      continue;
    }

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

    if (rawKey === "db-name-prefix") {
      parsed.dbNamePrefix = value.trim();
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

export function buildIsolatedDatabaseConfig(input) {
  const normalizedPrefix = normalizeDatabaseNamePrefix(input.dbNamePrefix);
  const uniqueSuffix = normalizeDatabaseNamePart(
    input.uniqueSuffix ??
      `${buildRunTag()}_${randomUUID().replaceAll("-", "").slice(0, 8)}`,
  );
  const mainDatabaseName = formatDatabaseName({
    prefix: normalizedPrefix,
    suffix: uniqueSuffix,
  });
  const testDatabaseName = `${mainDatabaseName}${ISOLATED_TEST_SUFFIX}`;

  return {
    adminDatabaseUrl: getAdminDatabaseUrl(input.baseDatabaseUrl),
    adminTestDatabaseUrl: getAdminDatabaseUrl(
      input.baseTestDatabaseUrl ?? input.baseDatabaseUrl,
    ),
    databaseName: mainDatabaseName,
    databaseUrl: replaceDatabaseName(input.baseDatabaseUrl, mainDatabaseName),
    testDatabaseName,
    testDatabaseUrl: replaceDatabaseName(
      input.baseTestDatabaseUrl ?? input.baseDatabaseUrl,
      testDatabaseName,
    ),
  };
}

function validateSmokeOptions(options) {
  if (!options.repoFullName) {
    throw new Error("--repo-full-name is required.");
  }

  if (options.changedPaths.length === 0) {
    throw new Error("Provide at least one explicit --changed-path.");
  }

  if (options.keepDbOnFailure && !options.isolateDb) {
    throw new Error("--keep-db-on-failure requires --isolate-db.");
  }
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

async function prepareIsolatedDatabases(input) {
  const config = buildIsolatedDatabaseConfig({
    baseDatabaseUrl: input.baseDatabaseUrl,
    baseTestDatabaseUrl: input.baseTestDatabaseUrl,
    dbNamePrefix: input.dbNamePrefix,
  });
  const previousDatabaseUrl = process.env.DATABASE_URL ?? null;
  const previousTestDatabaseUrl = process.env.TEST_DATABASE_URL ?? null;
  const env = {
    ...process.env,
    DATABASE_URL: config.databaseUrl,
    TEST_DATABASE_URL: config.testDatabaseUrl,
  };

  await execFile(process.execPath, [CI_PREPARE_POSTGRES_PATH], {
    cwd: REPO_ROOT,
    env,
    maxBuffer: 10 * 1024 * 1024,
  });
  await execFile(process.execPath, [CI_MIGRATE_DATABASES_PATH], {
    cwd: REPO_ROOT,
    env,
    maxBuffer: 10 * 1024 * 1024,
  });

  process.env.DATABASE_URL = config.databaseUrl;
  process.env.TEST_DATABASE_URL = config.testDatabaseUrl;

  return {
    adminDatabaseUrl: config.adminDatabaseUrl,
    adminTestDatabaseUrl: config.adminTestDatabaseUrl,
    databaseName: config.databaseName,
    databaseUrl: config.databaseUrl,
    previousDatabaseUrl,
    previousTestDatabaseUrl,
    testDatabaseName: config.testDatabaseName,
    testDatabaseUrl: config.testDatabaseUrl,
  };
}

async function shutdownSmoke(input) {
  const cleanupErrors = [];

  if (input.app) {
    try {
      await input.app.close();
    } catch (error) {
      cleanupErrors.push(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  try {
    await closeAllPools();
  } catch (error) {
    cleanupErrors.push(
      error instanceof Error ? error.message : String(error),
    );
  }

  let cleanupStatus = "not_requested";

  if (input.isolation) {
    try {
      if (input.preserveIsolatedDatabases) {
        cleanupStatus = "preserved_on_failure";
      } else {
        await dropIsolatedDatabases(input.isolation);
        cleanupStatus = input.runSucceeded
          ? "dropped_after_success"
          : "dropped_after_failure";
      }
    } catch (error) {
      cleanupStatus = "cleanup_failed";
      cleanupErrors.push(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      restoreEnvironmentVariables(input.isolation);
    }
  }

  return {
    cleanupStatus,
    shutdownError:
      cleanupErrors.length > 0 ? new Error(cleanupErrors.join(" / ")) : null,
  };
}

async function dropIsolatedDatabases(input) {
  const databasesByAdminUrl = new Map([
    [input.adminDatabaseUrl, new Set([input.databaseName])],
  ]);
  const testDatabases =
    databasesByAdminUrl.get(input.adminTestDatabaseUrl) ?? new Set();
  testDatabases.add(input.testDatabaseName);
  databasesByAdminUrl.set(input.adminTestDatabaseUrl, testDatabases);

  for (const [adminDatabaseUrl, databaseNames] of databasesByAdminUrl) {
    const client = new Client({ connectionString: adminDatabaseUrl });
    await client.connect();

    try {
      for (const databaseName of databaseNames) {
        await client.query(
          "select pg_terminate_backend(pid) from pg_stat_activity where datname = $1 and pid <> pg_backend_pid()",
          [databaseName],
        );
        await client.query(`drop database if exists ${quoteIdentifier(databaseName)}`);
      }
    } finally {
      await client.end();
    }
  }
}

function restoreEnvironmentVariables(input) {
  if (input.previousDatabaseUrl === null) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = input.previousDatabaseUrl;
  }

  if (input.previousTestDatabaseUrl === null) {
    delete process.env.TEST_DATABASE_URL;
  } else {
    process.env.TEST_DATABASE_URL = input.previousTestDatabaseUrl;
  }
}

function buildDatabaseIsolationSummary(input) {
  if (!input.mode || input.mode === "shared") {
    return {
      cleanupStatus: input.cleanupStatus,
      mode: "shared",
    };
  }

  return {
    cleanupStatus: input.cleanupStatus,
    mode: "isolated",
    databaseName: input.isolation?.databaseName ?? null,
    testDatabaseName: input.isolation?.testDatabaseName ?? null,
  };
}

function buildSmokeFailureMessage(input) {
  let message = input.error instanceof Error ? input.error.message : String(input.error);

  if (!input.isolation) {
    return message;
  }

  if (input.cleanupStatus === "preserved_on_failure") {
    return `${message} Isolated databases preserved: ${input.isolation.databaseName}, ${input.isolation.testDatabaseName}.`;
  }

  if (input.cleanupStatus === "cleanup_failed") {
    return `${message} Isolated database cleanup failed for: ${input.isolation.databaseName}, ${input.isolation.testDatabaseName}.`;
  }

  return message;
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

function parseDatabaseUrl(value, variableName) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid Postgres connection URL.`);
  }
}

function getAdminDatabaseUrl(value) {
  const parsed = parseDatabaseUrl(value, "DATABASE_URL");
  parsed.pathname = "/postgres";
  return parsed.toString();
}

function replaceDatabaseName(value, databaseName) {
  const parsed = parseDatabaseUrl(value, "DATABASE_URL");
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
}

function normalizeDatabaseNamePrefix(value) {
  const normalized = normalizeDatabaseNamePart(value).replace(/^_+|_+$/gu, "");

  if (!normalized) {
    throw new Error("--db-name-prefix must contain at least one letter or digit.");
  }

  return normalized;
}

function normalizeDatabaseNamePart(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/gu, "_")
    .replace(/_+/gu, "_");
}

function formatDatabaseName(input) {
  const safeSuffix = input.suffix.replace(/^_+|_+$/gu, "");

  if (!safeSuffix) {
    throw new Error("Database suffix must not be empty.");
  }

  const maxPrefixLength =
    MAX_DATABASE_NAME_LENGTH - safeSuffix.length - ISOLATED_TEST_SUFFIX.length - 1;
  const truncatedPrefix = input.prefix.slice(0, Math.max(maxPrefixLength, 1));
  return `${truncatedPrefix}_${safeSuffix}`.slice(0, MAX_DATABASE_NAME_LENGTH - ISOLATED_TEST_SUFFIX.length);
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

if (process.argv[1] && resolve(process.argv[1]) === MODULE_PATH) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
