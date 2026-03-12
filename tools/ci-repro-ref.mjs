import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildCiEnv,
  gitOutput,
  isPostgresReachable,
  runGit,
  runStep,
  writeCleanTreeBaseline,
} from "./ci-repro-shared.mjs";

function parseArgs(argv) {
  const options = {
    ref: "HEAD",
    repeat: 1,
    step: "all",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--ref") {
      options.ref = argv[index + 1] ?? options.ref;
      index += 1;
      continue;
    }

    if (token === "--repeat") {
      const repeat = Number(argv[index + 1] ?? "1");
      if (!Number.isInteger(repeat) || repeat < 1) {
        throw new Error("--repeat must be a positive integer.");
      }

      options.repeat = repeat;
      index += 1;
      continue;
    }

    if (token === "--step") {
      const step = argv[index + 1] ?? options.step;
      if (!["all", "static", "integration-db"].includes(step)) {
        throw new Error('--step must be one of "all", "static", or "integration-db".');
      }

      options.step = step;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return options;
}

async function main() {
  const { ref, repeat, step } = parseArgs(process.argv.slice(2));
  const repoRoot = resolveGitRoot();
  const resolvedRef = gitOutput(repoRoot, ["rev-parse", ref]);
  const shouldRunStatic = step === "all" || step === "static";
  const shouldRunIntegration = step === "all" || step === "integration-db";

  console.log(
    `Reproducing ref ${ref} (${resolvedRef}) ${repeat} time${repeat === 1 ? "" : "s"} with step "${step}".`,
  );

  let lastWorktreePath = null;
  for (let iteration = 1; iteration <= repeat; iteration += 1) {
    const tempRoot = mkdtempSync(join(tmpdir(), "pocket-cto-ci-ref-"));
    const worktreePath = join(tempRoot, "repo");
    const baselinePath = join(tempRoot, "clean-tree-baseline.json");
    const workspaceRoot = join(tempRoot, "workspaces");
    lastWorktreePath = worktreePath;

    console.log(`\n--- Iteration ${iteration}/${repeat}`);
    console.log(`Temp worktree: ${worktreePath}`);

    runGit(repoRoot, ["worktree", "add", "--detach", worktreePath, resolvedRef]);
    writeCleanTreeBaseline(worktreePath, baselinePath);

    const env = buildCiEnv({
      worktreePath,
      workspaceRoot,
      baselinePath,
    });

    runStep(
      "pnpm install --frozen-lockfile",
      worktreePath,
      env,
      ["install", "--frozen-lockfile"],
      worktreePath,
    );

    if (shouldRunStatic) {
      runStep("pnpm ci:static", worktreePath, env, ["ci:static"], worktreePath);
    }

    if (shouldRunIntegration) {
      const databaseUrl = env.TEST_DATABASE_URL ?? env.DATABASE_URL;
      if (!databaseUrl || !(await isPostgresReachable(databaseUrl))) {
        throw new Error(
          `Postgres is not reachable for integration reproduction. Temp worktree: ${worktreePath}`,
        );
      }

      runStep(
        "pnpm ci:integration-db",
        worktreePath,
        env,
        ["ci:integration-db"],
        worktreePath,
      );
    }
  }

  console.log(
    `Ref reproduction succeeded for ${resolvedRef}. Last temp worktree: ${lastWorktreePath}`,
  );
}

function resolveGitRoot() {
  return resolve(gitOutput(process.cwd(), ["rev-parse", "--show-toplevel"]));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
