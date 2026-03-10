import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const CI_ENV = {
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  TURBO_TELEMETRY_DISABLED: "1",
  NO_COLOR: "1",
  CONTROL_PLANE_PORT: "4000",
  WEB_PORT: "3000",
  PUBLIC_APP_URL: "http://127.0.0.1:3000",
  CONTROL_PLANE_URL: "http://127.0.0.1:4000",
  NEXT_PUBLIC_CONTROL_PLANE_URL: "http://127.0.0.1:4000",
  DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/pocket_cto",
  TEST_DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/pocket_cto_test",
  ARTIFACT_S3_ENDPOINT: "http://127.0.0.1:9000",
  ARTIFACT_S3_REGION: "us-east-1",
  ARTIFACT_S3_BUCKET: "pocket-cto-ci-artifacts",
  ARTIFACT_S3_ACCESS_KEY: "ci-access-key",
  ARTIFACT_S3_SECRET_KEY: "ci-secret-key",
  ARTIFACT_S3_FORCE_PATH_STYLE: "true",
  CODEX_APP_SERVER_COMMAND: "node",
  CODEX_APP_SERVER_ARGS: "--eval process.exit(0)",
  CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
  CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
  CODEX_DEFAULT_SANDBOX: "workspace-write",
  CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-ci",
};

class StepError extends Error {
  constructor(step, exitCode) {
    super(`CI reproduction failed at step "${step}" with exit code ${exitCode}.`);
    this.step = step;
    this.exitCode = exitCode;
  }
}

async function main() {
  const repoRoot = resolveGitRoot();
  const headSha = gitOutput(repoRoot, ["rev-parse", "HEAD"]);
  const tempRoot = mkdtempSync(join(tmpdir(), "pocket-cto-ci-repro-"));
  const worktreePath = join(tempRoot, "repo");
  const patchPath = join(tempRoot, "current.patch");
  const baselinePath = join(tempRoot, "clean-tree-baseline.json");
  const untrackedPaths = gitOutput(repoRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
  ])
    .split("\0")
    .filter(Boolean);
  const patch = execFileSync("git", ["diff", "--binary", "HEAD"], {
    cwd: repoRoot,
    encoding: "buffer",
    stdio: ["ignore", "pipe", "inherit"],
  });

  console.log(`Reproducing current worktree snapshot from ${headSha}`);
  console.log(`Temp worktree: ${worktreePath}`);

  runGit(repoRoot, ["worktree", "add", "--detach", worktreePath, headSha]);

  if (patch.length > 0) {
    writeFileSync(patchPath, patch);
    execFileSync("git", ["apply", patchPath], {
      cwd: worktreePath,
      stdio: ["ignore", "inherit", "inherit"],
    });
  }

  copyUntrackedPaths(repoRoot, worktreePath, untrackedPaths);

  execFileSync(process.execPath, ["tools/ci-check-clean-tree.mjs", "--write-baseline", baselinePath], {
    cwd: worktreePath,
    stdio: ["ignore", "inherit", "inherit"],
  });

  const env = {
    ...process.env,
    ...CI_ENV,
    CI_CLEAN_TREE_BASELINE_FILE: baselinePath,
  };
  runStep("pnpm install --frozen-lockfile", worktreePath, env, [
    "install",
    "--frozen-lockfile",
  ]);
  runStep("pnpm ci:static", worktreePath, env, ["ci:static"]);

  const databaseUrl = env.TEST_DATABASE_URL ?? env.DATABASE_URL;
  if (databaseUrl && (await isPostgresReachable(databaseUrl))) {
    runStep("pnpm ci:integration-db", worktreePath, env, ["ci:integration-db"]);
  } else {
    console.log("Skipping pnpm ci:integration-db because local Postgres is not reachable.");
  }

  console.log(`CI reproduction succeeded. Inspect temp worktree at ${worktreePath}`);
}

function resolveGitRoot() {
  return gitOutput(process.cwd(), ["rev-parse", "--show-toplevel"]);
}

function gitOutput(cwd, args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

function runGit(cwd, args) {
  execFileSync("git", args, {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
  });
}

function copyUntrackedPaths(repoRoot, worktreePath, relativePaths) {
  for (const relativePath of relativePaths) {
    const sourcePath = join(repoRoot, relativePath);
    const targetPath = join(worktreePath, relativePath);
    if (!existsSync(sourcePath)) {
      continue;
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath, { dereference: false, recursive: true });
  }
}

function runStep(step, cwd, env, args) {
  console.log(`\n==> ${step}`);
  const result = spawnSync("pnpm", args, {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new StepError(step, result.status ?? 1);
  }
}

function isPostgresReachable(connectionString) {
  const parsedUrl = new URL(connectionString);
  const host = parsedUrl.hostname;
  const port = Number(parsedUrl.port || "5432");

  return new Promise((resolvePromise) => {
    const socket = net.createConnection({ host, port });

    const settle = (reachable) => {
      socket.removeAllListeners();
      socket.destroy();
      resolvePromise(reachable);
    };

    socket.setTimeout(1_500);
    socket.on("connect", () => settle(true));
    socket.on("timeout", () => settle(false));
    socket.on("error", () => settle(false));
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
