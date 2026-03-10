import type {
  CodexAppServerClient,
  CodexRuntimeEvent,
  KnownServerNotification,
} from "@pocket-cto/codex-runtime";
import type {
  RuntimeCodexBootstrapResult,
  RuntimeCodexItemLifecycleEvent,
  RuntimeCodexRunTurnObserver,
  RuntimeCodexRunTurnResult,
  RuntimeCodexThreadReplacedEvent,
  RuntimeTurnRecoveryStrategy,
  RuntimeCodexThreadDefaults,
} from "./types";

type TurnExecutionState = {
  recoveryStrategy: RuntimeTurnRecoveryStrategy | null;
  threadId: string | null;
  turnId: string | null;
};

export async function initializeRuntimeClient(
  client: CodexAppServerClient,
  defaults: RuntimeCodexThreadDefaults,
) {
  await client.start();

  const initializeResult = await client.initialize({
    clientInfo: defaults.clientInfo,
    capabilities: {
      experimentalApi: false,
    },
  });

  await client.initialized();

  return initializeResult;
}

export async function observeTurnLifecycle(input: {
  client: CodexAppServerClient;
  observer: RuntimeCodexRunTurnObserver;
  start: (helpers: {
    emitThreadReplaced(
      event: RuntimeCodexThreadReplacedEvent,
    ): Promise<void>;
    emitThreadStarted(
      event: RuntimeCodexBootstrapResult,
    ): Promise<void>;
    execution: TurnExecutionState;
  }) => Promise<void>;
}): Promise<RuntimeCodexRunTurnResult> {
  const lifecycleItems: RuntimeCodexItemLifecycleEvent[] = [];
  const execution: TurnExecutionState = {
    recoveryStrategy: null,
    threadId: null,
    turnId: null,
  };
  let settled = false;
  let resolveTurn!: (result: RuntimeCodexRunTurnResult) => void;
  let rejectTurn!: (error: Error) => void;
  let notificationChain = Promise.resolve();
  const terminalTurn = new Promise<RuntimeCodexRunTurnResult>(
    (resolve, reject) => {
      resolveTurn = resolve;
      rejectTurn = reject;
    },
  );

  const resolveOnce = (result: RuntimeCodexRunTurnResult) => {
    if (settled) {
      return;
    }

    settled = true;
    resolveTurn(result);
  };

  const rejectOnce = (error: unknown) => {
    if (settled) {
      return;
    }

    settled = true;
    rejectTurn(asError(error, "Codex turn lifecycle failed"));
  };

  const queueNotification = (operation: () => Promise<void> | void) => {
    notificationChain = notificationChain
      .then(async () => {
        if (settled) {
          return;
        }

        await operation();
      })
      .catch((error) => {
        rejectOnce(error);
      });
  };

  const unsubscribe = input.client.onEvent((event) => {
    handleTurnEvent({
      event,
      execution,
      lifecycleItems,
      observer: input.observer,
      onReject: rejectOnce,
      onResolve: resolveOnce,
      queueNotification,
    });
  });

  try {
    await input.start({
      emitThreadReplaced: async (event) => {
        await input.observer.onThreadReplaced?.(event);
      },
      emitThreadStarted: async (event) => {
        await input.observer.onThreadStarted?.(event);
      },
      execution,
    });

    return await terminalTurn;
  } finally {
    unsubscribe();
  }
}

function handleTurnEvent(input: {
  event: CodexRuntimeEvent;
  execution: TurnExecutionState;
  lifecycleItems: RuntimeCodexItemLifecycleEvent[];
  observer: RuntimeCodexRunTurnObserver;
  onReject: (error: unknown) => void;
  onResolve: (result: RuntimeCodexRunTurnResult) => void;
  queueNotification: (operation: () => Promise<void> | void) => void;
}) {
  if (input.event.kind === "protocol_error") {
    input.onReject(input.event.error);
    return;
  }

  if (input.event.kind === "exit") {
    input.onReject(
      new Error(
        `Codex app server exited before the turn reached terminal state (code=${input.event.code ?? "null"}, signal=${input.event.signal ?? "null"})`,
      ),
    );
    return;
  }

  if (input.event.kind !== "notification") {
    return;
  }

  const notification = input.event.notification;

  if (!isTurnLifecycleNotification(notification)) {
    return;
  }

  switch (notification.method) {
    case "turn/started": {
      if (notification.params.threadId !== input.execution.threadId) {
        return;
      }

      input.queueNotification(async () => {
        input.execution.turnId = notification.params.turn.id;
        await input.observer.onTurnStarted?.({
          recoveryStrategy: getRequiredRecoveryStrategy(input.execution),
          threadId: notification.params.threadId,
          turnId: notification.params.turn.id,
        });
      });
      return;
    }
    case "item/started": {
      if (!matchesItemNotification(notification, input.execution)) {
        return;
      }

      input.queueNotification(async () => {
        const observed = {
          itemId: notification.params.item.id,
          itemType: notification.params.item.type,
          phase: "started" as const,
          threadId: notification.params.threadId,
          turnId: notification.params.turnId,
        };
        input.lifecycleItems.push(observed);
        await input.observer.onItemStarted?.(observed);
      });
      return;
    }
    case "item/completed": {
      if (!matchesItemNotification(notification, input.execution)) {
        return;
      }

      input.queueNotification(async () => {
        const observed = {
          itemId: notification.params.item.id,
          itemType: notification.params.item.type,
          phase: "completed" as const,
          threadId: notification.params.threadId,
          turnId: notification.params.turnId,
        };
        input.lifecycleItems.push(observed);
        await input.observer.onItemCompleted?.(observed);
      });
      return;
    }
    case "turn/completed": {
      if (
        notification.params.threadId !== input.execution.threadId ||
        (input.execution.turnId !== null &&
          notification.params.turn.id !== input.execution.turnId)
      ) {
        return;
      }

      input.queueNotification(() => {
        input.execution.turnId = notification.params.turn.id;
        input.onResolve({
          firstItemType: input.lifecycleItems[0]?.itemType ?? null,
          items: [...input.lifecycleItems],
          lastItemType:
            input.lifecycleItems[input.lifecycleItems.length - 1]?.itemType ??
            null,
          recoveryStrategy: getRequiredRecoveryStrategy(input.execution),
          status: asTerminalTurnStatus(notification.params.turn.status),
          threadId: notification.params.threadId,
          turnId: notification.params.turn.id,
        });
      });
      return;
    }
    default:
      return;
  }
}

function matchesItemNotification(
  notification:
    | {
        method: "item/started";
        params: { threadId: string; turnId: string };
      }
    | {
        method: "item/completed";
        params: { threadId: string; turnId: string };
      },
  execution: TurnExecutionState,
) {
  return (
    notification.params.threadId === execution.threadId &&
    (execution.turnId === null || notification.params.turnId === execution.turnId)
  );
}

function getRequiredRecoveryStrategy(
  execution: TurnExecutionState,
): RuntimeTurnRecoveryStrategy {
  if (!execution.recoveryStrategy) {
    throw new Error("Turn recovery strategy was not established before runtime events");
  }

  return execution.recoveryStrategy;
}

function asTerminalTurnStatus(status: string) {
  switch (status) {
    case "completed":
    case "interrupted":
    case "failed":
      return status;
    default:
      throw new Error(`Unexpected non-terminal turn status: ${status}`);
  }
}

function asError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

function isTurnLifecycleNotification(
  notification: KnownServerNotification | { method: string; params?: unknown },
): notification is KnownServerNotification {
  return [
    "turn/started",
    "item/started",
    "item/completed",
    "turn/completed",
  ].includes(notification.method);
}
