import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  buildCiEnv,
  gitOutput,
  isPostgresReachable,
  runGit,
  runStep,
  writeCleanTreeBaseline,
} from "./ci-repro-shared.mjs";

async function main() {
  const repoRoot = resolveGitRoot();
  const headSha = gitOutput(repoRoot, ["rev-parse", "HEAD"]);
  const tempRoot = mkdtempSync(join(tmpdir(), "pocket-cto-ci-repro-"));
  const worktreePath = join(tempRoot, "repo");
  const patchPath = join(tempRoot, "current.patch");
  const baselinePath = join(tempRoot, "clean-tree-baseline.json");
  const workspaceRoot = join(tempRoot, "workspaces");
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

  writeCleanTreeBaseline(worktreePath, baselinePath);

  const env = buildCiEnv({
    worktreePath,
    workspaceRoot,
    baselinePath,
  });
  runStep("pnpm install --frozen-lockfile", worktreePath, env, [
    "install",
    "--frozen-lockfile",
  ], worktreePath);
  runStep("pnpm ci:static", worktreePath, env, ["ci:static"], worktreePath);

  const databaseUrl = env.TEST_DATABASE_URL ?? env.DATABASE_URL;
  if (databaseUrl && (await isPostgresReachable(databaseUrl))) {
    runStep(
      "pnpm ci:integration-db",
      worktreePath,
      env,
      ["ci:integration-db"],
      worktreePath,
    );
  } else {
    console.log("Skipping pnpm ci:integration-db because local Postgres is not reachable.");
  }

  console.log(`CI reproduction succeeded. Inspect temp worktree at ${worktreePath}`);
}

function resolveGitRoot() {
  return gitOutput(process.cwd(), ["rev-parse", "--show-toplevel"]);
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
