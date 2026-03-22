import { type EvalEnv } from "@pocket-cto/config";
import type { EvalTarget } from "./dataset";
import { runEvalCommand } from "./run";
import type { EvalProviderCallSummary } from "./types";

export async function runPlannerSmokeCommand(input?: {
  argv?: string[];
  env?: EvalEnv;
  outputDirectory?: string;
}): Promise<Awaited<ReturnType<typeof runEvalCommand>>> {
  return runSmokeEvalCommand("planner", input);
}

export async function runExecutorSmokeCommand(input?: {
  argv?: string[];
  env?: EvalEnv;
  outputDirectory?: string;
}): Promise<Awaited<ReturnType<typeof runEvalCommand>>> {
  return runSmokeEvalCommand("executor", input);
}

async function runSmokeEvalCommand(
  target: EvalTarget,
  input?: {
    argv?: string[];
    env?: EvalEnv;
    outputDirectory?: string;
  },
) {
  const summary = await runEvalCommand(
    [target, "--limit", "1", ...(input?.argv ?? [])],
    {
      env: input?.env,
      outputDirectory: input?.outputDirectory,
      requireLive: true,
    },
  );

  const candidateProven = hasBackendProof(summary.live.candidate);
  const graderProven = hasBackendProof(summary.live.grader);

  if (!candidateProven && !graderProven) {
    throw new Error(
      `${capitalize(target)} smoke eval did not capture any backend proof metadata. Live smoke requires response ids or thread/turn ids.`,
    );
  }

  return summary;
}

function hasBackendProof(summary: EvalProviderCallSummary) {
  return (
    summary.responseIds.length > 0 ||
    summary.threadIds.length > 0 ||
    summary.turnIds.length > 0
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase().concat(value.slice(1));
}
