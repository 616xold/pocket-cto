import { execFileSync, spawnSync } from "node:child_process";
import net from "node:net";

export const CI_ENV = {
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
  ARTIFACT_S3_BUCKET: "pocket-cto-artifacts",
  ARTIFACT_S3_ACCESS_KEY: "minioadmin",
  ARTIFACT_S3_SECRET_KEY: "minioadmin",
  ARTIFACT_S3_FORCE_PATH_STYLE: "true",
  SOURCE_OBJECT_PREFIX: "sources",
  CODEX_APP_SERVER_COMMAND: "node",
  CODEX_APP_SERVER_ARGS: "--eval process.exit(0)",
  CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
  CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
  CODEX_DEFAULT_SANDBOX: "workspace-write",
  CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-ci",
};

export class StepError extends Error {
  constructor(step, exitCode, tempPath) {
    super(
      `CI reproduction failed at step "${step}" with exit code ${exitCode}. Temp worktree: ${tempPath}`,
    );
    this.step = step;
    this.exitCode = exitCode;
    this.tempPath = tempPath;
  }
}

export function buildCiEnv({
  worktreePath,
  workspaceRoot,
  baselinePath,
}) {
  return {
    ...process.env,
    ...CI_ENV,
    WORKSPACE_ROOT: workspaceRoot,
    POCKET_CTO_SOURCE_REPO_ROOT: worktreePath,
    CI_CLEAN_TREE_BASELINE_FILE: baselinePath,
  };
}

export function gitOutput(cwd, args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}

export function runGit(cwd, args) {
  execFileSync("git", args, {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
  });
}

export function runStep(step, cwd, env, args, tempPath) {
  console.log(`\n==> ${step}`);
  const result = spawnSync("pnpm", args, {
    cwd,
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new StepError(step, result.status ?? 1, tempPath);
  }
}

export function writeCleanTreeBaseline(worktreePath, baselinePath) {
  execFileSync(
    process.execPath,
    ["tools/ci-check-clean-tree.mjs", "--write-baseline", baselinePath],
    {
      cwd: worktreePath,
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
}

export function isPostgresReachable(connectionString) {
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
