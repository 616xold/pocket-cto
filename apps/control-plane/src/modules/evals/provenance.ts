import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { EvalTarget } from "./dataset";
import type { EvalRecordProvenance } from "./types";
import { getRepoRoot } from "./paths";

const execFileAsync = promisify(execFile);

export type EvalRepoProvenance = {
  branchName: string | null;
  gitSha: string | null;
};

export async function loadEvalRepoProvenance(
  cwd = getRepoRoot(),
): Promise<EvalRepoProvenance> {
  const [gitSha, branchName] = await Promise.all([
    readGitValue(["rev-parse", "HEAD"], cwd),
    readGitValue(["branch", "--show-current"], cwd),
  ]);

  return {
    branchName,
    gitSha,
  };
}

export function buildEvalRecordProvenance(input: {
  datasetName: EvalTarget;
  promptVersion: string;
  repo: EvalRepoProvenance;
}): EvalRecordProvenance {
  return {
    branchName: input.repo.branchName,
    datasetName: input.datasetName,
    gitSha: input.repo.gitSha,
    promptVersion: input.promptVersion,
  };
}

async function readGitValue(args: string[], cwd: string) {
  try {
    const result = await execFileAsync("git", args, {
      cwd,
    });
    const value = result.stdout.trim();
    return value ? value : null;
  } catch {
    return null;
  }
}
