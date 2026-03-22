import { EvalEnvSchema } from "@pocket-cto/config";
import { describe, expect, it } from "vitest";
import { resolveEvalEnvironment, resolveEvalLiveGuardState } from "./config";

describe("eval config resolution", () => {
  it("prefers generic env keys over legacy eval keys", () => {
    const resolved = resolveEvalEnvironment({
      env: EvalEnvSchema.parse({
        EVALS_ENABLED: true,
        EVAL_BACKEND: "codex_subscription",
        EVAL_GRADER_MODEL: "gpt-5.4-mini",
        EVAL_MODEL: "gpt-5.4",
        EVAL_REFERENCE_MODEL: "gpt-5.4",
        OPENAI_EVALS_ENABLED: false,
        OPENAI_EVAL_GRADER_MODEL: "gpt-5-mini",
        OPENAI_EVAL_MODEL: "gpt-5-mini",
        OPENAI_EVAL_REFERENCE_MODEL: "gpt-5-codex",
      }),
    });

    expect(resolved).toMatchObject({
      backend: "codex_subscription",
      candidateModel: "gpt-5.4",
      evalsEnabled: true,
      graderModel: "gpt-5.4-mini",
      referenceModel: "gpt-5.4",
    });
  });

  it("still accepts legacy eval keys when generic keys are absent", () => {
    const resolved = resolveEvalEnvironment({
      env: EvalEnvSchema.parse({
        OPENAI_API_KEY: "sk-test-1234",
        OPENAI_EVALS_ENABLED: true,
        OPENAI_EVAL_GRADER_MODEL: "gpt-5.4-mini",
        OPENAI_EVAL_MODEL: "gpt-5.4",
        OPENAI_EVAL_REFERENCE_MODEL: "gpt-5.4",
      }),
    });

    expect(resolved).toMatchObject({
      apiKey: "sk-test-1234",
      backend: "openai_responses",
      candidateModel: "gpt-5.4",
      evalsEnabled: true,
      graderModel: "gpt-5.4-mini",
      referenceModel: "gpt-5.4",
    });
  });

  it("uses the new GPT-5.4 eval defaults when neither env family is set", () => {
    const resolved = resolveEvalEnvironment({
      env: EvalEnvSchema.parse({}),
    });

    expect(resolved).toMatchObject({
      backend: "openai_responses",
      candidateModel: "gpt-5.4",
      evalsEnabled: false,
      graderModel: "gpt-5.4-mini",
      referenceModel: "gpt-5.4",
    });
  });

  it("treats codex_subscription as live-ready without requiring an API key", () => {
    const liveGuard = resolveEvalLiveGuardState({
      env: EvalEnvSchema.parse({
        EVALS_ENABLED: true,
        EVAL_BACKEND: "codex_subscription",
      }),
    });

    expect(liveGuard).toMatchObject({
      backend: "codex_subscription",
      defaultMode: "live",
      evalsEnabled: true,
      liveReady: true,
    });
  });
});
