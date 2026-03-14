import { type EvalEnv } from "@pocket-cto/config";
import type { EvalTarget } from "./dataset";
import { runEvalCommand } from "./run";

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

  const candidateProven = summary.live.candidate.responseIds.length > 0;
  const graderProven = summary.live.grader.responseIds.length > 0;

  if (!candidateProven && !graderProven) {
    throw new Error(
      `${capitalize(target)} smoke eval did not capture any OpenAI response ids. Live smoke requires provider metadata proof.`,
    );
  }

  return summary;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase().concat(value.slice(1));
}
