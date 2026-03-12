import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { CodexAppServerClient } from "./client";
import {
  ThreadResumeParamsSchema,
  ThreadStartParamsSchema,
  readAgentMessageThreadItem,
  readTextualThreadItem,
  type KnownServerNotification,
} from "./protocol";

const fixturePath = fileURLToPath(
  new URL("../../testkit/src/runtime/fake-codex-app-server.mjs", import.meta.url),
);

describe("codex runtime protocol", () => {
  afterEach(async () => {
    await delay(10);
  });

  it("parses thread lifecycle payloads with stable defaults", () => {
    const parsed = ThreadStartParamsSchema.parse({
      cwd: "/tmp/project",
      model: "gpt-5.2-codex",
      sandbox: "workspace-write",
    });
    const resume = ThreadResumeParamsSchema.parse({
      threadId: "thread_fake_123",
    });

    expect(parsed.experimentalRawEvents).toBe(false);
    expect(parsed.persistExtendedHistory).toBe(false);
    expect(resume.persistExtendedHistory).toBe(false);
  });

  it("reads completed textual thread items for planner-relevant output types", () => {
    expect(
      readTextualThreadItem({
        type: "plan",
        id: "item_plan_1",
        text: "Inspect repository state and propose next steps.",
      }),
    ).toMatchObject({
      type: "plan",
      id: "item_plan_1",
      text: expect.stringContaining("Inspect repository state"),
    });

    expect(
      readTextualThreadItem({
        type: "agentMessage",
        id: "item_agent_1",
        text: "## Objective understanding\nKeep the planner read-only.",
        phase: null,
      }),
    ).toMatchObject({
      type: "agentMessage",
      id: "item_agent_1",
      text: expect.stringContaining("## Objective understanding"),
    });

    expect(
      readTextualThreadItem({
        type: "commandExecution",
        id: "item_command_1",
      }),
    ).toBeNull();
  });

  it("bootstraps, resumes, and streams structural turn lifecycle over stdio", async () => {
    const client = new CodexAppServerClient({
      command: process.execPath,
      args: [fixturePath],
    });
    const notifications: KnownServerNotification[] = [];
    const events: Array<{ kind: string; method?: string }> = [];
    const unsubscribe = client.onEvent((event) => {
      if (event.kind === "notification") {
        const notification = event.notification;
        if (isObservedNotification(notification)) {
          notifications.push(notification);
        }
      }
      events.push({
        kind: event.kind,
        method:
          event.kind === "notification"
            ? event.notification.method
            : undefined,
      });
    });

    await Promise.all([client.start(), client.start()]);

    const initializeResult = await client.initialize({
      clientInfo: {
        name: "pocket-cto-control-plane",
        title: "Pocket CTO Control Plane",
        version: "0.1.0",
      },
      capabilities: {
        experimentalApi: false,
      },
    });
    await client.initialized();

    const threadStartResult = await client.startThread({
      approvalPolicy: "untrusted",
      cwd: "/tmp/pocket-cto",
      experimentalRawEvents: false,
      model: "gpt-5.2-codex",
      persistExtendedHistory: false,
      sandbox: "workspace-write",
      serviceName: "pocket-cto-control-plane",
    });
    const resumedThread = await client.resumeThread({
      threadId: threadStartResult.thread.id,
      persistExtendedHistory: false,
    });
    const turnStartResult = await client.startTurn({
      threadId: threadStartResult.thread.id,
      approvalPolicy: "never",
      input: [
        {
          type: "text",
          text: "Inspect only. Do not change files.",
          text_elements: [],
        },
      ],
      sandboxPolicy: {
        type: "readOnly",
        access: {
          type: "fullAccess",
        },
        networkAccess: false,
      },
    });

    await delay(80);
    await client.stop();
    unsubscribe();

    expect(initializeResult).toEqual({
      userAgent: "fake-codex-app-server/1.0.0",
    });
    expect(threadStartResult).toMatchObject({
      thread: {
        id: "thread_fake_123",
        cwd: "/tmp/pocket-cto",
        source: "appServer",
      },
      model: "gpt-5.2-codex",
      modelProvider: "openai",
      cwd: "/tmp/pocket-cto",
      approvalPolicy: "untrusted",
    });
    expect(resumedThread.thread.id).toBe("thread_fake_123");
    expect(turnStartResult).toMatchObject({
      turn: {
        id: "turn_fake_123",
        status: "inProgress",
      },
    });
    expect(
      events.some((event) => event.kind === "notification"),
    ).toBeTruthy();
    expect(
      events.some((event) => event.method === "thread/started"),
    ).toBeTruthy();
    expect(events.some((event) => event.method === "turn/started")).toBeTruthy();
    expect(events.some((event) => event.method === "turn/completed")).toBeTruthy();
    expect(events.some((event) => event.method === "item/started")).toBeTruthy();
    expect(events.some((event) => event.method === "item/completed")).toBeTruthy();
    expect(events.some((event) => event.kind === "stderr")).toBeTruthy();
    expect(events.some((event) => event.kind === "exit")).toBeTruthy();

    const itemStarted = notifications.find(
      (notification) => notification.method === "item/started",
    );
    const itemCompleted = notifications.find(
      (notification) =>
        notification.method === "item/completed" &&
        notification.params.item.type === "agentMessage",
    );
    const turnCompleted = notifications.find(
      (notification) => notification.method === "turn/completed",
    );

    expect(itemStarted).toMatchObject({
      method: "item/started",
      params: {
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
        item: {
          id: "item_plan_1",
          type: "plan",
        },
      },
    });
    expect(itemCompleted).toMatchObject({
      method: "item/completed",
      params: {
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
        item: {
          id: "item_agent_1",
          type: "agentMessage",
        },
      },
    });
    if (!itemCompleted || itemCompleted.method !== "item/completed") {
      throw new Error("Expected an item/completed notification for agentMessage");
    }
    expect(readAgentMessageThreadItem(itemCompleted.params.item)).toMatchObject({
      id: "item_agent_1",
      text: expect.stringContaining("## Objective understanding"),
    });
    expect(turnCompleted).toMatchObject({
      method: "turn/completed",
      params: {
        threadId: "thread_fake_123",
        turn: {
          id: "turn_fake_123",
          status: "completed",
        },
      },
    });
  });

  it("parses failed terminal turns and terminal-interaction notifications", async () => {
    const client = new CodexAppServerClient({
      command: process.execPath,
      args: [fixturePath, "--mode", "turn-completed-failed"],
    });
    const notifications: KnownServerNotification[] = [];
    const unsubscribe = client.onEvent((event) => {
      if (event.kind === "notification") {
        const notification = event.notification;
        if (isObservedNotification(notification)) {
          notifications.push(notification);
        }
      }
    });

    await client.initialize({
      clientInfo: {
        name: "pocket-cto-control-plane",
        title: "Pocket CTO Control Plane",
        version: "0.1.0",
      },
      capabilities: {
        experimentalApi: false,
      },
    });
    await client.initialized();
    await client.resumeThread({
      threadId: "thread_fake_123",
      persistExtendedHistory: false,
    });
    await client.startTurn({
      threadId: "thread_fake_123",
      input: [
        {
          type: "text",
          text: "Read-only failure test.",
          text_elements: [],
        },
      ],
    });

    await delay(80);
    await client.stop();
    unsubscribe();

    expect(notifications).toContainEqual(
      expect.objectContaining({
        method: "item/commandExecution/terminalInteraction",
        params: expect.objectContaining({
          itemId: "item_command_1",
          processId: "pty_1",
        }),
      }),
    );
    expect(notifications).toContainEqual(
      expect.objectContaining({
        method: "turn/completed",
        params: expect.objectContaining({
          turn: expect.objectContaining({
            id: "turn_fake_123",
            status: "failed",
          }),
        }),
      }),
    );
  });

  it("surfaces resume-gap failures and still allows direct turn/start when the runtime supports it", async () => {
    const sessionA = new CodexAppServerClient({
      command: process.execPath,
      args: [
        fixturePath,
        "--mode",
        "resume-gap-direct-turn-success",
        "--thread-id",
        "thread_gap_1",
      ],
    });

    await sessionA.initialize({
      clientInfo: {
        name: "pocket-cto-control-plane",
        title: "Pocket CTO Control Plane",
        version: "0.1.0",
      },
      capabilities: {
        experimentalApi: false,
      },
    });
    await sessionA.initialized();
    const startedThread = await sessionA.startThread({
      approvalPolicy: "untrusted",
      cwd: "/tmp/pocket-cto",
      experimentalRawEvents: false,
      model: "gpt-5.2-codex",
      persistExtendedHistory: false,
      sandbox: "workspace-write",
      serviceName: "pocket-cto-control-plane",
    });
    await sessionA.stop();

    const sessionB = new CodexAppServerClient({
      command: process.execPath,
      args: [
        fixturePath,
        "--mode",
        "resume-gap-direct-turn-success",
        "--thread-id",
        "thread_gap_1",
      ],
    });

    await sessionB.initialize({
      clientInfo: {
        name: "pocket-cto-control-plane",
        title: "Pocket CTO Control Plane",
        version: "0.1.0",
      },
      capabilities: {
        experimentalApi: false,
      },
    });
    await sessionB.initialized();

    await expect(
      sessionB.resumeThread({
        threadId: startedThread.thread.id,
        persistExtendedHistory: false,
      }),
    ).rejects.toMatchObject({
      code: -32600,
      method: "thread/resume",
    });

    const turnStart = await sessionB.startTurn({
      threadId: startedThread.thread.id,
      approvalPolicy: "never",
      input: [
        {
          type: "text",
          text: "Read-only direct turn/start recovery.",
          text_elements: [],
        },
      ],
      sandboxPolicy: {
        type: "readOnly",
        access: {
          type: "fullAccess",
        },
        networkAccess: false,
      },
    });

    await delay(80);
    await sessionB.stop();

    expect(turnStart.turn.id).toBe("turn_fake_123");
  });
});

function isObservedNotification(
  notification: KnownServerNotification | { method: string; params?: unknown },
): notification is KnownServerNotification {
  return [
    "thread/started",
    "turn/started",
    "turn/completed",
    "item/started",
    "item/completed",
    "item/commandExecution/terminalInteraction",
    "error",
  ].includes(notification.method);
}
