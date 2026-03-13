import type { EvalEnv } from "@pocket-cto/config";
import type { EvalCliArgs } from "./args";

export type EvalRunConfig = {
  apiKey: string | null;
  candidateModel: string;
  dryRun: boolean;
  graderModel: string;
  limit: number | null;
  referenceModel: string;
  useReference: boolean;
};

export function resolveEvalRunConfig(input: {
  args: EvalCliArgs;
  env: EvalEnv;
}): EvalRunConfig {
  return {
    apiKey: normalizeOptionalString(input.env.OPENAI_API_KEY),
    candidateModel: input.env.OPENAI_EVAL_MODEL,
    dryRun: input.args.dryRun,
    graderModel: input.env.OPENAI_EVAL_GRADER_MODEL,
    limit: input.args.limit,
    referenceModel: input.env.OPENAI_EVAL_REFERENCE_MODEL,
    useReference: input.args.withReference,
  };
}

export function assertLiveEvalEnabled(input: {
  apiKey: string | null;
  dryRun: boolean;
  env: EvalEnv;
}) {
  if (input.dryRun) {
    return;
  }

  if (!input.env.OPENAI_EVALS_ENABLED) {
    throw new Error(
      "Live evals are disabled. Set OPENAI_EVALS_ENABLED=true or rerun with --dry-run.",
    );
  }

  if (!input.apiKey) {
    throw new Error(
      "Live evals require OPENAI_API_KEY. Add the key or rerun with --dry-run.",
    );
  }
}

function normalizeOptionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
