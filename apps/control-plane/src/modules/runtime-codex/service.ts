import type { CodexAppServerClient } from "@pocket-cto/codex-runtime";
import type { RuntimeCodexClientFactory } from "./adapter";
import {
  isDirectTurnStartThreadMissingError,
  isResumeUnavailableError,
  preFirstTurnReplacementReason,
} from "./resume-fallback";
import {
  initializeRuntimeClient,
  observeTurnLifecycle,
} from "./turn-lifecycle";
import type { InMemoryRuntimeSessionRegistry } from "./live-session-registry";
import type {
  RuntimeCodexBootstrapInput,
  RuntimeCodexBootstrapResult,
  RuntimeCodexRunTurnInput,
  RuntimeCodexRunTurnObserver,
  RuntimeCodexRunTurnResult,
  RuntimeCodexThreadDefaults,
} from "./types";

export class CodexRuntimeService {
  constructor(
    private readonly clientFactory: RuntimeCodexClientFactory,
    private readonly defaults: RuntimeCodexThreadDefaults,
    private readonly liveSessionRegistry: Pick<
      InMemoryRuntimeSessionRegistry,
      | "clearResolvedRequest"
      | "closeTaskSession"
      | "openTaskSession"
      | "updateThreadId"
      | "updateTurnId"
    >,
  ) {}

  async bootstrapThread(
    input: RuntimeCodexBootstrapInput = {},
  ): Promise<RuntimeCodexBootstrapResult> {
    const client = this.clientFactory.createClient();

    try {
      const initializeResult = await initializeRuntimeClient(client, this.defaults);
      return await this.startThread(client, input, initializeResult.userAgent);
    } finally {
      await client.stop();
    }
  }

  async runTurn(
    input: RuntimeCodexRunTurnInput,
    observer: RuntimeCodexRunTurnObserver = {},
  ): Promise<RuntimeCodexRunTurnResult> {
    const client = this.clientFactory.createClient();
    this.liveSessionRegistry.openTaskSession({
      interrupt: async ({ threadId, turnId }) => {
        await client.interruptTurn({
          threadId,
          turnId,
        });
      },
      taskId: input.taskId,
      threadId: input.threadId ?? null,
    });
    const sessionObserver = this.wrapSessionObserver(input.taskId, observer);

    try {
      const initializeResult = await initializeRuntimeClient(client, this.defaults);

      if (!input.threadId) {
        return await this.runTurnOnNewThread(
          client,
          input,
          sessionObserver,
          initializeResult.userAgent,
        );
      }

      return await this.runTurnOnPersistedThread(
        client,
        input,
        sessionObserver,
        initializeResult.userAgent,
      );
    } finally {
      this.liveSessionRegistry.closeTaskSession(input.taskId);
      await client.stop();
    }
  }

  private async runTurnOnNewThread(
    client: CodexAppServerClient,
    input: RuntimeCodexRunTurnInput,
    observer: RuntimeCodexRunTurnObserver,
    userAgent: string,
  ) {
    return observeTurnLifecycle({
      client,
      observer,
      start: async ({ emitThreadStarted, execution }) => {
        const bootstrap = await this.startThread(client, {
          cwd: input.cwd ?? undefined,
          model: input.model ?? undefined,
        }, userAgent);

        execution.recoveryStrategy = "same_session_bootstrap";
        execution.threadId = bootstrap.threadId;
        await emitThreadStarted(bootstrap);

        const turnStart = await client.startTurn(
          this.buildTurnStartParams({
            ...input,
            threadId: bootstrap.threadId,
          }),
        );

        execution.turnId = turnStart.turn.id;
      },
    });
  }

  private async runTurnOnPersistedThread(
    client: CodexAppServerClient,
    input: RuntimeCodexRunTurnInput,
    observer: RuntimeCodexRunTurnObserver,
    userAgent: string,
  ) {
    const threadId = getRequiredThreadId(input.threadId);

    try {
      return await observeTurnLifecycle({
        client,
        observer,
        start: async ({ execution }) => {
          execution.recoveryStrategy = "resumed_thread";
          execution.threadId = threadId;
          await client.resumeThread({
            threadId,
            persistExtendedHistory: false,
          });

          const turnStart = await client.startTurn(
            this.buildTurnStartParams({
              ...input,
              threadId,
            }),
          );

          execution.turnId = turnStart.turn.id;
        },
      });
    } catch (resumeError) {
      if (!input.hasPriorTurnStarted && isResumeUnavailableError(resumeError)) {
        return this.recoverFirstTurnAfterResumeGap(
          client,
          input,
          observer,
          threadId,
          userAgent,
        );
      }

      throw resumeError;
    }
  }

  private async recoverFirstTurnAfterResumeGap(
    client: CodexAppServerClient,
    input: RuntimeCodexRunTurnInput,
    observer: RuntimeCodexRunTurnObserver,
    oldThreadId: string,
    userAgent: string,
  ) {
    try {
      return await observeTurnLifecycle({
        client,
        observer,
        start: async ({ execution }) => {
          execution.recoveryStrategy = "direct_turn_start";
          execution.threadId = oldThreadId;

          const turnStart = await client.startTurn(
            this.buildTurnStartParams({
              ...input,
              threadId: oldThreadId,
            }),
          );

          execution.turnId = turnStart.turn.id;
        },
      });
    } catch (directTurnError) {
      if (!isDirectTurnStartThreadMissingError(directTurnError)) {
        throw directTurnError;
      }
    }

    return observeTurnLifecycle({
      client,
      observer,
      start: async ({ emitThreadReplaced, emitThreadStarted, execution }) => {
        const bootstrap = await this.startThread(client, {
          cwd: input.cwd ?? undefined,
          model: input.model ?? undefined,
        }, userAgent);

        execution.recoveryStrategy = "replacement_thread";
        execution.threadId = bootstrap.threadId;
        await emitThreadReplaced({
          newThreadId: bootstrap.threadId,
          oldThreadId,
          reasonCode: preFirstTurnReplacementReason,
        });
        await emitThreadStarted(bootstrap);

        const turnStart = await client.startTurn(
          this.buildTurnStartParams({
            ...input,
            threadId: bootstrap.threadId,
          }),
        );

        execution.turnId = turnStart.turn.id;
      },
    });
  }

  private async startThread(
    client: CodexAppServerClient,
    input: RuntimeCodexBootstrapInput,
    userAgent: string,
  ): Promise<RuntimeCodexBootstrapResult> {
    const cwd = input.cwd ?? this.defaults.cwd;
    const model = input.model ?? this.defaults.model;
    const serviceName = input.serviceName ?? this.defaults.serviceName;
    const threadStart = await client.startThread({
      approvalPolicy: this.defaults.approvalPolicy,
      cwd,
      experimentalRawEvents: false,
      model,
      persistExtendedHistory: false,
      sandbox: this.defaults.sandbox,
      serviceName,
    });

    return {
      approvalPolicy: threadStart.approvalPolicy,
      cwd: threadStart.cwd,
      model: threadStart.model,
      modelProvider: threadStart.modelProvider,
      sandbox: threadStart.sandbox,
      serviceName,
      thread: threadStart.thread,
      threadId: threadStart.thread.id,
      userAgent,
    };
  }

  private buildTurnStartParams(input: RuntimeCodexRunTurnInput & { threadId: string }) {
    return {
      threadId: input.threadId,
      input: input.input,
      ...(input.cwd ? { cwd: input.cwd } : {}),
      ...(input.approvalPolicy
        ? { approvalPolicy: input.approvalPolicy }
        : {}),
      ...(input.sandboxPolicy ? { sandboxPolicy: input.sandboxPolicy } : {}),
      ...(input.model ? { model: input.model } : {}),
    };
  }

  private wrapSessionObserver(
    taskId: string,
    observer: RuntimeCodexRunTurnObserver,
  ): RuntimeCodexRunTurnObserver {
    return {
      ...observer,
      onServerRequestResolved: async (event) => {
        this.liveSessionRegistry.clearResolvedRequest(taskId, event.requestId);
        await observer.onServerRequestResolved?.(event);
      },
      onThreadStarted: async (event) => {
        this.liveSessionRegistry.updateThreadId(taskId, event.threadId);
        await observer.onThreadStarted?.(event);
      },
      onTurnStarted: async (event) => {
        this.liveSessionRegistry.updateThreadId(taskId, event.threadId);
        this.liveSessionRegistry.updateTurnId(taskId, event.turnId);
        await observer.onTurnStarted?.(event);
      },
    };
  }
}

function getRequiredThreadId(threadId: string | null | undefined) {
  if (!threadId) {
    throw new Error("A persisted thread id is required for this runtime path");
  }

  return threadId;
}
