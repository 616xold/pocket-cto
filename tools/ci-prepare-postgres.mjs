import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(
  new URL("../packages/db/package.json", import.meta.url),
);
const { Client } = require("pg");

const REQUIRED_URLS = ["DATABASE_URL", "TEST_DATABASE_URL"];
const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 1_000;
const TEST_DATABASE_SUFFIX = "_test";

async function main() {
  loadNearestEnvFile();

  const targetUrls = REQUIRED_URLS.map((name) => {
    const value = process.env[name]?.trim();
    if (!value) {
      throw new Error(`${name} is required for CI Postgres preparation.`);
    }

    return {
      name,
      parsed: parseDatabaseUrl(value, name),
    };
  });

  const testTarget = targetUrls.find(
    (entry) => entry.name === "TEST_DATABASE_URL",
  );
  if (!testTarget) {
    throw new Error("TEST_DATABASE_URL is required for CI Postgres preparation.");
  }

  const testDatabaseName = getDatabaseName(
    testTarget.parsed,
    "TEST_DATABASE_URL",
  );
  if (!testDatabaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(
      `TEST_DATABASE_URL must target a dedicated *_test database. Received "${testDatabaseName}".`,
    );
  }

  const targetsByAdminUrl = new Map();
  for (const target of targetUrls) {
    const databaseName = getDatabaseName(target.parsed, target.name);
    const adminUrl = getAdminDatabaseUrl(target.parsed);
    const existingTargets = targetsByAdminUrl.get(adminUrl) ?? new Set();
    existingTargets.add(databaseName);
    targetsByAdminUrl.set(adminUrl, existingTargets);
  }

  for (const [adminUrl, databaseNames] of targetsByAdminUrl) {
    await waitForPostgres(adminUrl);
    await ensureDatabases(adminUrl, [...databaseNames].sort());
  }
}

function loadNearestEnvFile() {
  if (typeof process.loadEnvFile !== "function") {
    return;
  }

  let currentDirectory = process.cwd();

  while (true) {
    const envPath = join(currentDirectory, ".env");
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
      return;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return;
    }

    currentDirectory = parentDirectory;
  }
}

function parseDatabaseUrl(value, variableName) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid Postgres connection URL.`);
  }
}

function getDatabaseName(parsedDatabaseUrl, variableName) {
  const databaseName = parsedDatabaseUrl.pathname.replace(/^\/+/, "");
  if (!databaseName) {
    throw new Error(`${variableName} must include a database name.`);
  }

  return databaseName;
}

function getAdminDatabaseUrl(parsedDatabaseUrl) {
  const adminUrl = new URL(parsedDatabaseUrl.toString());
  adminUrl.pathname = "/postgres";
  return adminUrl.toString();
}

async function waitForPostgres(connectionString) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      await client.end();
      console.log(
        `Postgres is ready after ${attempt} attempt${attempt === 1 ? "" : "s"}.`,
      );
      return;
    } catch (error) {
      await closeQuietly(client);

      if (attempt === MAX_ATTEMPTS) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Postgres did not become ready after ${MAX_ATTEMPTS} attempts: ${message}`,
        );
      }

      console.log(
        `Waiting for Postgres (${attempt}/${MAX_ATTEMPTS}) before preparing CI databases...`,
      );
      await delay(RETRY_DELAY_MS);
    }
  }
}

async function ensureDatabases(connectionString, databaseNames) {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const databaseName of databaseNames) {
      const existing = await client.query(
        "select 1 from pg_database where datname = $1",
        [databaseName],
      );

      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`Database already exists: ${databaseName}`);
        continue;
      }

      console.log(`Creating database: ${databaseName}`);
      await client.query(`create database ${quoteIdentifier(databaseName)}`);
    }
  } finally {
    await closeQuietly(client);
  }
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function closeQuietly(client) {
  try {
    await client.end();
  } catch {
    // Ignore connection close errors while retrying readiness checks.
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
