import type { EvalEnv } from "@pocket-cto/config";
import type { EvalCliArgs } from "./args";
import type { EvalBackend } from "./types";

export type EvalLiveGuardState = {
  apiKey: string | null;
  apiKeyPresent: boolean;
  backend: EvalBackend;
  defaultMode: "dry-run" | "live";
  evalsEnabled: boolean;
  liveReady: boolean;
};

export type EvalRunConfig = {
  apiKey: string | null;
  backend: EvalBackend;
  candidateModel: string;
  dryRun: boolean;
  graderModel: string;
  limit: number | null;
  referenceModel: string;
  useReference: boolean;
};

export type ResolvedEvalEnvironment = {
  apiKey: string | null;
  backend: EvalBackend;
  candidateModel: string;
  evalsEnabled: boolean;
  graderModel: string;
  referenceModel: string;
};

export function resolveEvalRunConfig(input: {
  args: EvalCliArgs;
  env: EvalEnv;
}): EvalRunConfig {
  const resolvedEnv = resolveEvalEnvironment({
    backendOverride: input.args.backend,
    env: input.env,
  });

  return {
    apiKey: resolvedEnv.apiKey,
    backend: resolvedEnv.backend,
    candidateModel: resolvedEnv.candidateModel,
    dryRun: input.args.dryRun,
    graderModel: resolvedEnv.graderModel,
    limit: input.args.limit,
    referenceModel: resolvedEnv.referenceModel,
    useReference: input.args.withReference,
  };
}

export function assertLiveEvalEnabled(input: {
  apiKey: string | null;
  backend?: EvalBackend;
  dryRun: boolean;
  env: EvalEnv;
}) {
  if (input.dryRun) {
    return;
  }

  const resolvedEnv = resolveEvalEnvironment({
    backendOverride: input.backend,
    env: input.env,
  });

  if (!resolvedEnv.evalsEnabled) {
    throw new Error(
      "Live evals are disabled. Set EVALS_ENABLED=true (or legacy OPENAI_EVALS_ENABLED=true) or rerun with --dry-run.",
    );
  }

  if (resolvedEnv.backend === "openai_responses" && !input.apiKey) {
    throw new Error(
      "Live openai_responses evals require OPENAI_API_KEY. Add the key or rerun with --dry-run.",
    );
  }
}

export function resolveEvalEnvironment(input: {
  backendOverride?: EvalBackend | null;
  env: EvalEnv;
}): ResolvedEvalEnvironment {
  const apiKey = normalizeOptionalString(input.env.OPENAI_API_KEY);
  const backend =
    input.backendOverride ??
    input.env.EVAL_BACKEND ??
    "openai_responses";

  return {
    apiKey,
    backend,
    candidateModel:
      normalizeOptionalString(input.env.EVAL_MODEL) ??
      normalizeOptionalString(input.env.OPENAI_EVAL_MODEL) ??
      "gpt-5.4",
    evalsEnabled:
      input.env.EVALS_ENABLED ?? input.env.OPENAI_EVALS_ENABLED ?? false,
    graderModel:
      normalizeOptionalString(input.env.EVAL_GRADER_MODEL) ??
      normalizeOptionalString(input.env.OPENAI_EVAL_GRADER_MODEL) ??
      "gpt-5.4-mini",
    referenceModel:
      normalizeOptionalString(input.env.EVAL_REFERENCE_MODEL) ??
      normalizeOptionalString(input.env.OPENAI_EVAL_REFERENCE_MODEL) ??
      "gpt-5.4",
  };
}

export function resolveEvalLiveGuardState(input: {
  backendOverride?: EvalBackend | null;
  env: EvalEnv;
}): EvalLiveGuardState {
  const resolved = resolveEvalEnvironment(input);
  const apiKeyPresent = resolved.apiKey !== null;
  const liveReady =
    resolved.evalsEnabled &&
    (resolved.backend === "codex_subscription" || apiKeyPresent);

  return {
    apiKey: resolved.apiKey,
    apiKeyPresent,
    backend: resolved.backend,
    defaultMode: liveReady ? "live" : "dry-run",
    evalsEnabled: resolved.evalsEnabled,
    liveReady,
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
