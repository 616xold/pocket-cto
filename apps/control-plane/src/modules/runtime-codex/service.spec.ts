import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RuntimeCodexAdapter } from "./adapter";
import { buildReadOnlyTurnPolicy } from "./config";
import { CodexRuntimeService } from "./service";

const fixturePath = fileURLToPath(
  new URL(
    "../../../../../packages/testkit/src/runtime/fake-codex-app-server.mjs",
    import.meta.url,
  ),
);

describe("CodexRuntimeService", () => {
  it("surfaces the final completed agent message text from a planner-style turn", async () => {
    const readOnlyPolicy = buildReadOnlyTurnPolicy();
    const service = new CodexRuntimeService(
      new RuntimeCodexAdapter({
        command: process.execPath,
        args: [fixturePath],
      }),
      {
        clientInfo: {
          name: "pocket-cto-control-plane",
          title: "Pocket CTO Control Plane",
          version: "0.1.0",
        },
        approvalPolicy: "untrusted",
        cwd: "/tmp/pocket-cto-runtime-service",
        model: "gpt-5.2-codex",
        sandbox: "workspace-write",
        serviceName: "pocket-cto-control-plane",
      },
    );

    const result = await service.runTurn({
      approvalPolicy: readOnlyPolicy.approvalPolicy,
      cwd: "/tmp/pocket-cto-runtime-service",
      hasPriorTurnStarted: false,
      input: [
        {
          type: "text",
          text: "Produce a read-only planner handoff with explicit sections.",
          text_elements: [],
        },
      ],
      sandboxPolicy: readOnlyPolicy.sandboxPolicy,
      threadId: null,
    });

    expect(result.completedAgentMessages).toHaveLength(1);
    expect(result.completedAgentMessages[0]).toMatchObject({
      itemId: "item_agent_1",
      turnId: "turn_fake_123",
    });
    expect(result.finalAgentMessageText).toContain("## Objective understanding");
    expect(result.finalAgentMessageText).toContain("## Validation plan");
  });
});
