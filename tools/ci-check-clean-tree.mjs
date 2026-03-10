import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASELINE_FLAG = "--write-baseline";
const BASELINE_ENV = "CI_CLEAN_TREE_BASELINE_FILE";

function isGitRepo() {
  try {
    const output = execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return output === "true";
  } catch {
    return false;
  }
}

function listGitPaths(args) {
  return execFileSync("git", [...args, "-z"], {
    encoding: "buffer",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
}

function printSection(title, paths) {
  if (paths.length === 0) {
    return;
  }

  console.error(title);
  for (const path of paths) {
    console.error(` - ${path}`);
  }
}

function hashWorktreePath(path) {
  if (!existsSync(path)) {
    return "__missing__";
  }

  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function snapshotPaths(paths) {
  return Object.fromEntries(
    paths.map((path) => [path, hashWorktreePath(path)]),
  );
}

function readBaselineSnapshot() {
  const baselinePath = process.env[BASELINE_ENV];
  if (!baselinePath) {
    return { tracked: {}, untracked: {} };
  }

  return JSON.parse(readFileSync(resolve(baselinePath), "utf8"));
}

function writeBaselineSnapshot(targetPath) {
  const snapshot = captureSnapshot();
  writeFileSync(resolve(targetPath), `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote clean-tree baseline: ${resolve(targetPath)}`);
}

function captureSnapshot() {
  const modifiedPaths = listGitPaths([
    "diff",
    "--name-only",
    "--diff-filter=ACDMRTUXB",
  ]);
  const untrackedPaths = listGitPaths(["ls-files", "--others", "--exclude-standard"]);

  return {
    tracked: snapshotPaths(modifiedPaths),
    untracked: snapshotPaths(untrackedPaths),
  };
}

function diffSnapshotSection(baselineSection, currentSection) {
  const paths = new Set([
    ...Object.keys(baselineSection),
    ...Object.keys(currentSection),
  ]);

  return [...paths].filter((path) => baselineSection[path] !== currentSection[path]).sort();
}

function main() {
  if (!isGitRepo()) {
    throw new Error("ci clean-tree check requires a git checkout.");
  }

  if (process.argv[2] === BASELINE_FLAG) {
    const targetPath = process.argv[3];
    if (!targetPath) {
      throw new Error("ci clean-tree baseline mode requires a target path.");
    }

    writeBaselineSnapshot(targetPath);
    return;
  }

  const baselineSnapshot = readBaselineSnapshot();
  const currentSnapshot = captureSnapshot();
  const modifiedPaths = diffSnapshotSection(
    baselineSnapshot.tracked,
    currentSnapshot.tracked,
  );
  const untrackedPaths = diffSnapshotSection(
    baselineSnapshot.untracked,
    currentSnapshot.untracked,
  );

  if (modifiedPaths.length === 0 && untrackedPaths.length === 0) {
    console.log("git clean-tree check passed");
    return;
  }

  console.error("git clean-tree check failed");
  printSection(
    "Tracked files changed during CI reproduction:",
    modifiedPaths,
  );
  printSection(
    "Untracked non-ignored files changed during CI reproduction:",
    untrackedPaths,
  );
  process.exit(1);
}

main();
