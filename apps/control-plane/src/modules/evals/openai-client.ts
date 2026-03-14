import type { EvalProviderMetadata, EvalProviderUsage } from "./types";

type ResponseFormat =
  | {
      kind: "json_schema";
      schema: Record<string, unknown>;
      schemaName: string;
    }
  | {
      kind: "text";
    };

export class OpenAIResponsesClient {
  constructor(private readonly apiKey: string) {}

  async generate(input: {
    format: ResponseFormat;
    model: string;
    prompt: string;
  }): Promise<{
    output: unknown;
    provider: EvalProviderMetadata;
    text: string;
  }> {
    const { payload, requestId } = await this.request({
      input: input.prompt,
      model: input.model,
      store: false,
      ...(input.format.kind === "json_schema"
        ? {
            text: {
              format: {
                name: input.format.schemaName,
                schema: input.format.schema,
                strict: true,
                type: "json_schema",
              },
            },
          }
        : {}),
    });

    const text = extractOutputText(payload);

    if (!text) {
      throw new Error("OpenAI response did not include any text output.");
    }

    const provider = buildProviderMetadata({
      payload,
      requestId,
      requestedModel: input.model,
    });

    if (input.format.kind === "json_schema") {
      return {
        output: extractJsonOutput(payload, text),
        provider,
        text,
      };
    }

    return {
      output: text,
      provider,
      text,
    };
  }

  private async request(body: Record<string, unknown>) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await formatOpenAIError(response));
    }

    return {
      payload: (await response.json()) as Record<string, unknown>,
      requestId: response.headers.get("x-request-id"),
    };
  }
}

async function formatOpenAIError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    const message = payload.error?.message;

    return message
      ? `OpenAI API request failed (${response.status}): ${message}`
      : `OpenAI API request failed with status ${response.status}.`;
  } catch {
    return `OpenAI API request failed with status ${response.status}.`;
  }
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const textBlocks: string[] = [];

  if (!Array.isArray(payload.output)) {
    return "";
  }

  for (const item of payload.output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const block of content) {
      if (!block || typeof block !== "object") {
        continue;
      }

      const typedBlock = block as { text?: unknown; type?: unknown };

      if (
        (typedBlock.type === "output_text" || typedBlock.type === "text") &&
        typeof typedBlock.text === "string"
      ) {
        textBlocks.push(typedBlock.text);
      }
    }
  }

  return textBlocks.join("\n").trim();
}

function extractJsonOutput(payload: Record<string, unknown>, fallbackText: string) {
  const jsonBlock = findJsonBlock(payload);

  if (jsonBlock) {
    return jsonBlock;
  }

  return JSON.parse(fallbackText) as unknown;
}

function findJsonBlock(payload: Record<string, unknown>) {
  if (!Array.isArray(payload.output)) {
    return null;
  }

  for (const item of payload.output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const block of content) {
      if (!block || typeof block !== "object") {
        continue;
      }

      const typedBlock = block as { json?: unknown; type?: unknown };

      if (typedBlock.type === "output_json" && typedBlock.json !== undefined) {
        return typedBlock.json;
      }
    }
  }

  return null;
}

function buildProviderMetadata(input: {
  payload: Record<string, unknown>;
  requestId: string | null;
  requestedModel: string;
}): EvalProviderMetadata {
  return {
    provider: "openai-responses",
    requestId: input.requestId,
    requestedModel: input.requestedModel,
    resolvedModel:
      typeof input.payload.model === "string" ? input.payload.model : null,
    responseId: typeof input.payload.id === "string" ? input.payload.id : null,
    usage: extractUsage(input.payload.usage),
  };
}

function extractUsage(rawUsage: unknown): EvalProviderUsage | null {
  if (!rawUsage || typeof rawUsage !== "object") {
    return null;
  }

  const usage = rawUsage as Record<string, unknown>;
  const inputTokens = asOptionalNumber(usage.input_tokens);
  const outputTokens = asOptionalNumber(usage.output_tokens);
  const totalTokens = asOptionalNumber(usage.total_tokens);

  if (
    inputTokens === null &&
    outputTokens === null &&
    totalTokens === null
  ) {
    return null;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

function asOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
