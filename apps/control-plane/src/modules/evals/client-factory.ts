import type { EvalEnv } from "@pocket-cto/config";
import { CodexSubscriptionEvalClient } from "./codex-subscription-client";
import type { EvalModelClient } from "./model-client";
import { OpenAIResponsesClient } from "./openai-client";
import type { EvalBackend } from "./types";

export function createEvalModelClient(input: {
  apiKey: string | null;
  backend: EvalBackend;
  env: EvalEnv;
}): EvalModelClient {
  switch (input.backend) {
    case "openai_responses": {
      if (!input.apiKey) {
        throw new Error(
          "OpenAI-backed evals require OPENAI_API_KEY before a live client can be created.",
        );
      }

      return new OpenAIResponsesClient(input.apiKey);
    }
    case "codex_subscription":
      return new CodexSubscriptionEvalClient(input.env);
    default:
      return assertNever(input.backend);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported eval backend: ${value}`);
}
