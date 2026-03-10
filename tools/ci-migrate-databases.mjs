import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const REQUIRED_URLS = ["DATABASE_URL", "TEST_DATABASE_URL"];
const TEST_DATABASE_SUFFIX = "_test";

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

function readRequiredUrls() {
  loadNearestEnvFile();

  return REQUIRED_URLS.map((name) => {
    const value = process.env[name]?.trim();
    if (!value) {
      throw new Error(`${name} is required for CI database migrations.`);
    }

    return {
      name,
      value,
      parsed: parseDatabaseUrl(value, name),
    };
  });
}

function assertSafeTestDatabaseUrl(databaseTargets) {
  const testTarget = databaseTargets.find(
    (target) => target.name === "TEST_DATABASE_URL",
  );
  if (!testTarget) {
    throw new Error("TEST_DATABASE_URL is required for CI database migrations.");
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
}

function runMigration(databaseTarget) {
  const databaseName = getDatabaseName(databaseTarget.parsed, databaseTarget.name);
  console.log(`Migrating database: ${databaseName}`);

  execFileSync("pnpm", ["--filter", "@pocket-cto/db", "db:migrate"], {
    env: {
      ...process.env,
      DATABASE_URL: databaseTarget.value,
    },
    stdio: "inherit",
  });
}

function main() {
  const databaseTargets = readRequiredUrls();
  assertSafeTestDatabaseUrl(databaseTargets);

  for (const databaseTarget of databaseTargets) {
    runMigration(databaseTarget);
  }
}

main();
