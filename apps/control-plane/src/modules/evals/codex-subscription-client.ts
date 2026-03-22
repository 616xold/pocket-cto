import { randomUUID } from "node:crypto";
import type { SandboxPolicy, UserInput } from "@pocket-cto/codex-runtime";
import type { EvalEnv } from "@pocket-cto/config";
import { RuntimeCodexAdapter } from "../runtime-codex/adapter";
import { splitShellWords } from "../runtime-codex/config";
import {
  initializeRuntimeClient,
  observeTurnLifecycle,
} from "../runtime-codex/turn-lifecycle";
import type { RuntimeCodexBootstrapResult } from "../runtime-codex/types";
import { getRepoRoot } from "./paths";
import type { EvalModelClient, EvalModelGenerateInput } from "./model-client";
import type {
  CodexSubscriptionProviderMetadata,
  EvalOutputRecord,
} from "./types";

const evalCodexServiceName = "pocket-cto-evals";

export type CodexSubscriptionTurnResult = {
  requestedModel: string;
  resolvedModel: string | null;
  text: string;
  threadId: string | null;
  turnId: string | null;
  userAgent: string | null;
};

export type CodexSubscriptionTurnRunner = (input: {
  cwd?: string;
  env: EvalEnv;
  model: string;
  prompt: string;
}) => Promise<CodexSubscriptionTurnResult>;

export class CodexSubscriptionEvalClient implements EvalModelClient {
  constructor(
    private readonly env: EvalEnv,
    private readonly runner: CodexSubscriptionTurnRunner = runCodexSubscriptionTurn,
    private readonly cwd = getRepoRoot(),
  ) {}

  async generate(
    input: EvalModelGenerateInput,
  ): Promise<Pick<EvalOutputRecord, "output" | "provider" | "text">> {
    const prompt =
      input.format.kind === "json_schema"
        ? buildCodexStructuredPrompt({
            prompt: input.prompt,
            schema: input.format.schema,
            schemaName: input.format.schemaName,
          })
        : input.prompt;

    const result = await this.runner({
      cwd: this.cwd,
      env: this.env,
      model: input.model,
      prompt,
    });

    const provider = buildCodexProviderMetadata(result);

    if (input.format.kind === "json_schema") {
      return {
        output: extractCodexJsonOutput(result.text),
        provider,
        text: result.text,
      };
    }

    return {
      output: result.text,
      provider,
      text: result.text,
    };
  }
}

export async function runCodexSubscriptionTurn(input: {
  cwd?: string;
  env: EvalEnv;
  model: string;
  prompt: string;
}): Promise<CodexSubscriptionTurnResult> {
  const cwd = input.cwd ?? getRepoRoot();
  const tokens = [
    ...splitShellWords(input.env.CODEX_APP_SERVER_COMMAND),
    ...splitShellWords(input.env.CODEX_APP_SERVER_ARGS),
  ];
  const [command, ...args] = tokens;

  if (!command) {
    throw new Error("CODEX_APP_SERVER_COMMAND resolved to an empty command.");
  }

  const client = new RuntimeCodexAdapter({
    args,
    command,
  }).createClient();
  let bootstrapResult: RuntimeCodexBootstrapResult | null = null;

  try {
    const initializeResult = await initializeRuntimeClient(client, {
      approvalPolicy: "never",
      clientInfo: {
        name: "pocket-cto-evals",
        title: "Pocket CTO Evals",
        version: "0.1.0",
      },
      cwd,
      model: input.model,
      sandbox: "read-only",
      serviceName: evalCodexServiceName,
    });

    const result = await observeTurnLifecycle({
      client,
      observer: {
        onCommandExecutionApprovalRequest() {
          throw new Error(
            "codex_subscription evals do not allow command execution approvals.",
          );
        },
        onFileChangeApprovalRequest() {
          throw new Error(
            "codex_subscription evals do not allow file-change approvals.",
          );
        },
        onPermissionsApprovalRequest() {
          throw new Error(
            "codex_subscription evals do not allow permissions approvals.",
          );
        },
      },
      start: async ({ emitThreadStarted, execution }) => {
        const threadStart = await client.startThread({
          approvalPolicy: "never",
          cwd,
          experimentalRawEvents: false,
          model: input.model,
          persistExtendedHistory: false,
          sandbox: "read-only",
          serviceName: evalCodexServiceName,
        });

        bootstrapResult = {
          approvalPolicy: threadStart.approvalPolicy,
          cwd: threadStart.cwd,
          model: threadStart.model,
          modelProvider: threadStart.modelProvider,
          sandbox: threadStart.sandbox,
          serviceName: evalCodexServiceName,
          thread: threadStart.thread,
          threadId: threadStart.thread.id,
          userAgent: initializeResult.userAgent,
        };
        execution.recoveryStrategy = "same_session_bootstrap";
        execution.threadId = bootstrapResult.threadId;
        await emitThreadStarted(bootstrapResult);

        const turnStart = await client.startTurn({
          approvalPolicy: "never",
          input: buildEvalPromptInput(input.prompt),
          model: input.model,
          sandboxPolicy: buildCodexEvalSandboxPolicy(),
          threadId: bootstrapResult.threadId,
        });

        execution.turnId = turnStart.turn.id;
      },
    });

    if (result.status !== "completed") {
      throw new Error(
        `Codex subscription eval turn did not complete successfully (status=${result.status}).`,
      );
    }

    const text = extractFinalCodexText(result);

    if (!text) {
      throw new Error(
        "Codex subscription eval turn completed without any final textual output.",
      );
    }

    const bootstrap = bootstrapResult ?? {
      model: input.model,
      threadId: null,
      userAgent: null,
    };

    return {
      requestedModel: input.model,
      resolvedModel: bootstrap.model,
      text,
      threadId: result.threadId ?? bootstrap.threadId,
      turnId: result.turnId,
      userAgent: bootstrap.userAgent,
    };
  } finally {
    await client.stop();
  }
}

function buildEvalPromptInput(prompt: string): UserInput[] {
  return [
    {
      text: prompt,
      text_elements: [],
      type: "text",
    },
  ];
}

function buildCodexEvalSandboxPolicy(): SandboxPolicy {
  return {
    access: {
      type: "fullAccess",
    },
    networkAccess: false,
    type: "readOnly",
  };
}

function extractFinalCodexText(input: {
  completedTextOutputs: Array<{ text: string }>;
  finalAgentMessageText: string | null;
}) {
  const explicitFinal = input.finalAgentMessageText?.trim();

  if (explicitFinal) {
    return explicitFinal;
  }

  const fallback = input.completedTextOutputs[input.completedTextOutputs.length - 1];
  return fallback?.text?.trim() ? fallback.text.trim() : "";
}

function buildCodexStructuredPrompt(input: {
  prompt: string;
  schema: Record<string, unknown>;
  schemaName: string;
}) {
  return [
    input.prompt,
    "",
    "Return only valid JSON.",
    `The JSON must satisfy schema "${input.schemaName}".`,
    "Do not wrap the JSON in markdown fences or explanatory prose.",
    "Schema:",
    JSON.stringify(input.schema, null, 2),
  ].join("\n");
}

function extractCodexJsonOutput(text: string) {
  const trimmed = text.trim();

  for (const candidate of buildJsonCandidates(trimmed)) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Codex subscription backend returned text that could not be parsed as JSON: ${trimmed.slice(0, 200)}`,
  );
}

function buildJsonCandidates(text: string) {
  const candidates = [text];
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1];

  if (fenced) {
    candidates.push(fenced.trim());
  }

  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");

  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.push(text.slice(objectStart, objectEnd + 1));
  }

  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    candidates.push(text.slice(arrayStart, arrayEnd + 1));
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

function buildCodexProviderMetadata(
  result: CodexSubscriptionTurnResult,
): CodexSubscriptionProviderMetadata {
  return {
    backend: "codex_subscription",
    codexVersion: extractCodexVersion(result.userAgent),
    proofMode: "local_codex_subscription",
    provider: "codex-subscription",
    requestId: null,
    requestedModel: result.requestedModel,
    resolvedModel: result.resolvedModel,
    responseId: null,
    threadId: result.threadId,
    transport: "codex_app_server",
    turnId: result.turnId,
    userAgent: result.userAgent,
    usage: null,
  };
}

function extractCodexVersion(userAgent: string | null) {
  const match = userAgent?.match(/codex[^/]*\/([^\s]+)/i);
  return match?.[1] ?? null;
}

export function createMockCodexSubscriptionTurnResult(
  overrides: Partial<CodexSubscriptionTurnResult> = {},
): CodexSubscriptionTurnResult {
  return {
    requestedModel: "gpt-5.4",
    resolvedModel: "gpt-5.4",
    text: "mock codex output",
    threadId: `thread_${randomUUID()}`,
    turnId: `turn_${randomUUID()}`,
    userAgent: "codex/1.0.0",
    ...overrides,
  };
}
