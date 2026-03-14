import type { EvalEnv } from "@pocket-cto/config";
import type { EvalCliArgs } from "./args";

export type EvalLiveGuardState = {
  apiKey: string | null;
  apiKeyPresent: boolean;
  defaultMode: "dry-run" | "live";
  evalsEnabled: boolean;
  liveReady: boolean;
};

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
  const liveGuard = resolveEvalLiveGuardState(input.env);

  return {
    apiKey: liveGuard.apiKey,
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

export function resolveEvalLiveGuardState(env: EvalEnv): EvalLiveGuardState {
  const apiKey = normalizeOptionalString(env.OPENAI_API_KEY);

  return {
    apiKey,
    apiKeyPresent: apiKey !== null,
    defaultMode: env.OPENAI_EVALS_ENABLED && apiKey ? "live" : "dry-run",
    evalsEnabled: env.OPENAI_EVALS_ENABLED,
    liveReady: env.OPENAI_EVALS_ENABLED && apiKey !== null,
  };
}

export function maskApiKey(apiKey: string | null) {
  if (!apiKey) {
    return null;
  }

  return `***${apiKey.slice(-4)}`;
}

function normalizeOptionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
