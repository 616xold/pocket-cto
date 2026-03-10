import { execFileSync } from "node:child_process";

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

function main() {
  if (!isGitRepo()) {
    throw new Error("ci clean-tree check requires a git checkout.");
  }

  const modifiedPaths = listGitPaths([
    "diff",
    "--name-only",
    "--diff-filter=ACDMRTUXB",
  ]);
  const untrackedPaths = listGitPaths(["ls-files", "--others", "--exclude-standard"]);

  if (modifiedPaths.length === 0 && untrackedPaths.length === 0) {
    console.log("git clean-tree check passed");
    return;
  }

  console.error("git clean-tree check failed");
  printSection("Tracked files changed during CI reproduction:", modifiedPaths);
  printSection("Untracked non-ignored files were created during CI reproduction:", untrackedPaths);
  process.exit(1);
}

main();
