import {
  spawn,
  type ChildProcessWithoutNullStreams,
  type SpawnOptionsWithoutStdio,
} from "node:child_process";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import EventEmitter from "eventemitter3";
import type { ZodType } from "zod";
import {
  CodexAppServerRequestError,
  CodexAppServerServerRequestRejectedError,
} from "./errors";
import {
  InitializeParamsSchema,
  InitializeResponseSchema,
  JsonRpcErrorSchema,
  JsonRpcNotificationSchema,
  JsonRpcSuccessSchema,
  JsonRpcRequestSchema,
  KnownServerRequestSchema,
  KnownServerNotificationSchema,
  ThreadResumeParamsSchema,
  ThreadResumeResponseSchema,
  ThreadStartParamsSchema,
  ThreadStartResponseSchema,
  TurnInterruptParamsSchema,
  TurnInterruptResponseSchema,
  TurnStartParamsSchema,
  TurnStartResponseSchema,
  type InitializeParams,
  type InitializeResponse,
  type JsonRpcRequest,
  type KnownServerRequest,
  type KnownServerNotification,
  type ThreadResumeParams,
  type ThreadResumeResponse,
  type ThreadStartParams,
  type ThreadStartResponse,
  type TurnInterruptParams,
  type TurnInterruptResponse,
  type TurnStartParams,
  type TurnStartResponse,
  parseKnownServerRequestResult,
} from "./protocol";

type PendingRequest = {
  method: string;
  reject: (reason: unknown) => void;
  resolve: (value: unknown) => void;
  resultSchema: ZodType<unknown>;
};

export type CodexRuntimeNotificationEvent = {
  kind: "notification";
  notification: KnownServerNotification | { method: string; params?: unknown };
};

export type CodexRuntimeProtocolErrorEvent = {
  kind: "protocol_error";
  error: Error;
  line: string;
};

export type CodexRuntimeEvent =
  | CodexRuntimeNotificationEvent
  | CodexRuntimeProtocolErrorEvent
  | { kind: "exit"; code: number | null; signal: NodeJS.Signals | null }
  | { kind: "stderr"; line: string };

export type CodexAppServerServerRequestHandler = (
  request: KnownServerRequest | JsonRpcRequest,
) => Promise<unknown> | unknown;

export type CodexRuntimeClientOptions = {
  args: string[];
  command: string;
  cwd?: string;
  stopTimeoutMs?: number;
};

export class CodexAppServerClient {
  private readonly events = new EventEmitter<{
    event: [CodexRuntimeEvent];
  }>();

  private process?: ChildProcessWithoutNullStreams;
  private startPromise?: Promise<void>;
  private stopPromise?: Promise<void>;
  private stdoutBuffer = "";
  private stderrBuffer = "";
  private readonly pending = new Map<string, PendingRequest>();
  private exitPromise: Promise<void> = Promise.resolve();
  private serverRequestHandler?: CodexAppServerServerRequestHandler;

  constructor(private readonly options: CodexRuntimeClientOptions) {}

  onEvent(listener: (event: CodexRuntimeEvent) => void) {
    this.events.on("event", listener);
    return () => this.events.off("event", listener);
  }

  setServerRequestHandler(handler?: CodexAppServerServerRequestHandler) {
    this.serverRequestHandler = handler;
  }

  async start() {
    if (this.process) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.doStart();

    try {
      await this.startPromise;
    } finally {
      this.startPromise = undefined;
    }
  }

  async initialize(params: InitializeParams): Promise<InitializeResponse> {
    const parsedParams = InitializeParamsSchema.parse(params);
    return this.request(
      "initialize",
      parsedParams,
      InitializeResponseSchema,
    );
  }

  async initialized() {
    await this.start();
    this.write({
      method: "initialized",
    });
  }

  async startThread(
    params: ThreadStartParams,
  ): Promise<ThreadStartResponse> {
    const parsedParams = ThreadStartParamsSchema.parse(params);
    return this.request(
      "thread/start",
      parsedParams,
      ThreadStartResponseSchema,
    );
  }

  async resumeThread(
    params: ThreadResumeParams,
  ): Promise<ThreadResumeResponse> {
    const parsedParams = ThreadResumeParamsSchema.parse(params);
    return this.request(
      "thread/resume",
      parsedParams,
      ThreadResumeResponseSchema,
    );
  }

  async startTurn(params: TurnStartParams): Promise<TurnStartResponse> {
    const parsedParams = TurnStartParamsSchema.parse(params);
    return this.request("turn/start", parsedParams, TurnStartResponseSchema);
  }

  async interruptTurn(
    params: TurnInterruptParams,
  ): Promise<TurnInterruptResponse> {
    const parsedParams = TurnInterruptParamsSchema.parse(params);
    return this.request(
      "turn/interrupt",
      parsedParams,
      TurnInterruptResponseSchema,
    );
  }

  async stop() {
    if (!this.process) {
      return;
    }

    if (this.stopPromise) {
      return this.stopPromise;
    }

    const child = this.process;
    const exitPromise = this.exitPromise;
    this.stopPromise = this.doStop(child, exitPromise);

    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = undefined;
    }
  }

  private async doStart() {
    const child = spawn(this.options.command, this.options.args, {
      ...(this.options.cwd ? { cwd: this.options.cwd } : {}),
      stdio: "pipe",
    } satisfies SpawnOptionsWithoutStdio);

    this.process = child;
    this.stdoutBuffer = "";
    this.stderrBuffer = "";
    this.exitPromise = new Promise((resolve) => {
      child.once("close", (code, signal) => {
        this.handleProcessClose(code, signal);
        resolve();
      });
    });

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => this.handleStdout(chunk));
    child.stderr.on("data", (chunk: string) => this.handleStderr(chunk));
    child.once("error", (error) => {
      this.handleProtocolFailure(
        asError(error, "Codex app server process failed"),
        "",
      );
    });
  }

  private async doStop(
    child: ChildProcessWithoutNullStreams,
    exitPromise: Promise<void>,
  ) {
    if (child.exitCode !== null || child.signalCode !== null) {
      await exitPromise;
      return;
    }

    child.kill("SIGTERM");

    const didExit = await Promise.race([
      exitPromise.then(() => true),
      delay(this.options.stopTimeoutMs ?? 1_000).then(() => false),
    ]);

    if (didExit) {
      return;
    }

    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
    }

    await exitPromise;
  }

  private async request<TResult>(
    method: string,
    params: unknown,
    resultSchema: ZodType<TResult>,
  ): Promise<TResult> {
    await this.start();

    const id = randomUUID();
    const payload: JsonRpcRequest = {
      id,
      method,
      params,
    };

    return new Promise<TResult>((resolve, reject) => {
      this.pending.set(id, {
        method,
        reject,
        resolve: (value) => resolve(value as TResult),
        resultSchema: resultSchema as ZodType<unknown>,
      });

      try {
        this.write(payload);
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  private write(payload: Record<string, unknown>) {
    if (!this.process) {
      throw new Error("Codex app server is not started");
    }

    this.process.stdin.write(`${JSON.stringify(payload)}\n`);
  }

  private handleStdout(chunk: string) {
    this.stdoutBuffer += chunk;

    while (true) {
      const newlineIndex = this.stdoutBuffer.indexOf("\n");
      if (newlineIndex === -1) {
        break;
      }

      const line = this.stdoutBuffer.slice(0, newlineIndex);
      this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);

      if (!line.trim()) {
        continue;
      }

      this.handleStdoutLine(line);
    }
  }

  private handleStderr(chunk: string) {
    this.stderrBuffer += chunk;

    while (true) {
      const newlineIndex = this.stderrBuffer.indexOf("\n");
      if (newlineIndex === -1) {
        break;
      }

      const line = this.stderrBuffer.slice(0, newlineIndex);
      this.stderrBuffer = this.stderrBuffer.slice(newlineIndex + 1);

      if (!line.trim()) {
        continue;
      }

      this.events.emit("event", { kind: "stderr", line });
    }
  }

  private handleStdoutLine(line: string) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(line);
    } catch (error) {
      this.handleProtocolFailure(
        new Error(
          `Failed to parse Codex app server stdout as JSON: ${line}`,
          {
            cause: error,
          },
        ),
        line,
      );
      return;
    }

    const success = JsonRpcSuccessSchema.safeParse(parsed);
    if (success.success) {
      const key = String(success.data.id);
      const pending = this.pending.get(key);

      if (!pending) {
        this.handleProtocolFailure(
          new Error(
            `Received unexpected JSON-RPC success for id ${success.data.id}`,
          ),
          line,
        );
        return;
      }

      this.pending.delete(key);

      try {
        pending.resolve(pending.resultSchema.parse(success.data.result));
      } catch (error) {
        pending.reject(
          new Error(
            `Failed to parse ${pending.method} response: ${formatErrorMessage(
              error,
            )}`,
            {
              cause: error,
            },
          ),
        );
      }

      return;
    }

    const error = JsonRpcErrorSchema.safeParse(parsed);
    if (error.success) {
      if (error.data.id === undefined || error.data.id === null) {
        this.rejectPending(
          new Error(
            `Codex app server returned an unbound JSON-RPC error (${error.data.error.code}): ${error.data.error.message}`,
          ),
        );
        return;
      }

      const key = String(error.data.id);
      const pending = this.pending.get(key);

      if (!pending) {
        this.handleProtocolFailure(
          new Error(
            `Received unexpected JSON-RPC error for id ${error.data.id}: ${error.data.error.message}`,
          ),
          line,
        );
        return;
      }

      this.pending.delete(key);
      pending.reject(
        new CodexAppServerRequestError({
          code: error.data.error.code,
          data: error.data.error.data,
          message: error.data.error.message,
          method: pending.method,
        }),
      );
      return;
    }

    const knownServerRequest = KnownServerRequestSchema.safeParse(parsed);
    if (knownServerRequest.success) {
      this.handleServerRequest(knownServerRequest.data);
      return;
    }

    const serverRequest = JsonRpcRequestSchema.safeParse(parsed);
    if (serverRequest.success) {
      this.handleServerRequest(serverRequest.data);
      return;
    }

    const knownNotification = KnownServerNotificationSchema.safeParse(parsed);
    if (knownNotification.success) {
      this.events.emit("event", {
        kind: "notification",
        notification: knownNotification.data,
      });
      return;
    }

    const notification = JsonRpcNotificationSchema.safeParse(parsed);
    if (notification.success) {
      this.events.emit("event", {
        kind: "notification",
        notification: {
          method: notification.data.method,
          params: notification.data.params,
        },
      });
      return;
    }

    this.handleProtocolFailure(
      new Error(`Unrecognized Codex app server message: ${line}`),
      line,
    );
  }

  private handleProcessClose(
    code: number | null,
    signal: NodeJS.Signals | null,
  ) {
    this.flushStderrBuffer();

    if (this.stdoutBuffer.trim()) {
      this.handleProtocolFailure(
        new Error(
          `Codex app server exited with an incomplete stdout line: ${this.stdoutBuffer.trim()}`,
        ),
        this.stdoutBuffer.trim(),
      );
      this.stdoutBuffer = "";
    }

    this.process = undefined;
    this.events.emit("event", {
      kind: "exit",
      code,
      signal,
    });

    this.rejectPending(
      new Error(
        `Codex app server exited before all pending requests completed (code=${code ?? "null"}, signal=${signal ?? "null"})`,
      ),
    );
  }

  private flushStderrBuffer() {
    const line = this.stderrBuffer.trim();
    this.stderrBuffer = "";

    if (!line) {
      return;
    }

    this.events.emit("event", { kind: "stderr", line });
  }

  private handleProtocolFailure(error: Error, line: string) {
    this.events.emit("event", {
      kind: "protocol_error",
      error,
      line,
    });

    this.rejectPending(error);

    if (this.process && this.process.exitCode === null) {
      this.process.kill("SIGTERM");
    }
  }

  private rejectPending(error: Error) {
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }

    this.pending.clear();
  }

  private handleServerRequest(request: KnownServerRequest | JsonRpcRequest) {
    const handler = this.serverRequestHandler;

    if (!handler) {
      this.writeJsonRpcError({
        code: -32601,
        id: request.id,
        message: `Unhandled server request: ${request.method}`,
      });
      return;
    }

    void Promise.resolve()
      .then(() => handler(request))
      .then((result) => {
        this.writeJsonRpcSuccess(request, result);
      })
      .catch((error) => {
        this.writeJsonRpcError(buildServerRequestErrorPayload(request.id, error));
      });
  }

  private writeJsonRpcSuccess(
    request: KnownServerRequest | JsonRpcRequest,
    result: unknown,
  ) {
    const validatedResult = isKnownServerRequest(request)
      ? parseKnownServerRequestResult(request.method, result)
      : result;

    this.write({
      id: request.id,
      result: validatedResult,
    });
  }

  private writeJsonRpcError(input: {
    code: number;
    data?: unknown;
    id: string | number;
    message: string;
  }) {
    this.write({
      id: input.id,
      error: {
        code: input.code,
        ...(input.data === undefined ? {} : { data: input.data }),
        message: input.message,
      },
    });
  }
}

function asError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function formatErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function buildServerRequestErrorPayload(
  id: string | number,
  error: unknown,
) {
  if (error instanceof CodexAppServerServerRequestRejectedError) {
    return {
      code: error.code,
      data: error.data,
      id,
      message: error.message,
    };
  }

  return {
    code: -32603,
    id,
    message: error instanceof Error ? error.message : String(error),
  };
}

function isKnownServerRequest(
  request: KnownServerRequest | JsonRpcRequest,
): request is KnownServerRequest {
  const parsed = KnownServerRequestSchema.safeParse(request);
  return parsed.success;
}
