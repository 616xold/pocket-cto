import { describe, expect, it, vi } from "vitest";
import { EvalEnvSchema } from "@pocket-cto/config";
import {
  CodexSubscriptionEvalClient,
  createMockCodexSubscriptionTurnResult,
} from "./codex-subscription-client";

describe("codex subscription eval client", () => {
  it("can be mocked cleanly and records honest codex backend proof", async () => {
    const runner = vi.fn().mockResolvedValue(
      createMockCodexSubscriptionTurnResult({
        requestedModel: "gpt-5.4",
        resolvedModel: "gpt-5.4-mini",
        text: "final codex answer",
        threadId: "thread_eval_1",
        turnId: "turn_eval_1",
        userAgent: "codex/2.3.4",
      }),
    );
    const client = new CodexSubscriptionEvalClient(
      EvalEnvSchema.parse({
        EVAL_BACKEND: "codex_subscription",
        EVALS_ENABLED: true,
      }),
      runner,
      "/tmp/pocket-cto",
    );

    const result = await client.generate({
      format: {
        kind: "text",
      },
      model: "gpt-5.4",
      prompt: "Explain the planner result.",
    });

    expect(runner).toHaveBeenCalledWith({
      cwd: "/tmp/pocket-cto",
      env: expect.any(Object),
      model: "gpt-5.4",
      prompt: "Explain the planner result.",
    });
    expect(result).toEqual({
      output: "final codex answer",
      provider: {
        backend: "codex_subscription",
        codexVersion: "2.3.4",
        proofMode: "local_codex_subscription",
        provider: "codex-subscription",
        requestId: null,
        requestedModel: "gpt-5.4",
        resolvedModel: "gpt-5.4-mini",
        responseId: null,
        threadId: "thread_eval_1",
        transport: "codex_app_server",
        turnId: "turn_eval_1",
        usage: null,
        userAgent: "codex/2.3.4",
      },
      text: "final codex answer",
    });
  });

  it("parses structured JSON output from the mocked codex backend", async () => {
    const client = new CodexSubscriptionEvalClient(
      EvalEnvSchema.parse({
        EVAL_BACKEND: "codex_subscription",
        EVALS_ENABLED: true,
      }),
      vi.fn().mockResolvedValue(
        createMockCodexSubscriptionTurnResult({
          text: '```json\n{"overallScore":4.5,"verdict":"strong"}\n```',
        }),
      ),
    );

    const result = await client.generate({
      format: {
        kind: "json_schema",
        schema: {
          type: "object",
        },
        schemaName: "mock_grader",
      },
      model: "gpt-5.4-mini",
      prompt: "Return grader JSON.",
    });

    expect(result.output).toEqual({
      overallScore: 4.5,
      verdict: "strong",
    });
  });
});
