import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RuntimeCodexAdapter } from "./adapter";
import { buildReadOnlyTurnPolicy } from "./config";
import { InMemoryRuntimeSessionRegistry } from "./live-session-registry";
import { CodexRuntimeService } from "./service";

const fixturePath = fileURLToPath(
  new URL(
    "../../../../../packages/testkit/src/runtime/fake-codex-app-server.mjs",
    import.meta.url,
  ),
);

describe("CodexRuntimeService", () => {
  it("surfaces the final completed agent message text from a planner-style turn", async () => {
    const readOnlyPolicy = buildReadOnlyTurnPolicy("planner");
    const service = createRuntimeService();

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
      taskId: crypto.randomUUID(),
      threadId: null,
    });

    expect(result.completedAgentMessages).toHaveLength(1);
    expect(result.completedAgentMessages[0]).toMatchObject({
      itemId: "item_agent_1",
      turnId: "turn_fake_123",
    });
    expect(result.completedTextOutputs.map((output) => output.itemType)).toEqual([
      "plan",
      "agentMessage",
    ]);
    expect(result.finalAgentMessageText).toContain("## Objective understanding");
    expect(result.finalAgentMessageText).toContain("## Validation plan");
  });

  it("captures ordered completed textual outputs for plan-only and multi-text planner turns", async () => {
    const readOnlyPolicy = buildReadOnlyTurnPolicy("planner");
    const planOnlyService = createRuntimeService(["--mode", "plan-only"]);
    const multiTextService = createRuntimeService(["--mode", "multi-text"]);

    const [planOnlyResult, multiTextResult] = await Promise.all([
      planOnlyService.runTurn({
        approvalPolicy: readOnlyPolicy.approvalPolicy,
        cwd: "/tmp/pocket-cto-runtime-service-plan-only",
        hasPriorTurnStarted: false,
        input: [
          {
            type: "text",
            text: "Produce a planner handoff without changing files.",
            text_elements: [],
          },
        ],
        sandboxPolicy: readOnlyPolicy.sandboxPolicy,
        taskId: crypto.randomUUID(),
        threadId: null,
      }),
      multiTextService.runTurn({
        approvalPolicy: readOnlyPolicy.approvalPolicy,
        cwd: "/tmp/pocket-cto-runtime-service-multi-text",
        hasPriorTurnStarted: false,
        input: [
          {
            type: "text",
            text: "Produce a planner handoff without changing files.",
            text_elements: [],
          },
        ],
        sandboxPolicy: readOnlyPolicy.sandboxPolicy,
        taskId: crypto.randomUUID(),
        threadId: null,
      }),
    ]);

    expect(planOnlyResult.completedTextOutputs).toMatchObject([
      {
        itemId: "item_plan_1",
        itemType: "plan",
        turnId: "turn_fake_123",
      },
    ]);
    expect(planOnlyResult.completedAgentMessages).toEqual([]);
    expect(planOnlyResult.finalAgentMessageText).toBeNull();

    expect(
      multiTextResult.completedTextOutputs.map((output) => output.itemType),
    ).toEqual(["plan", "plan", "agentMessage", "agentMessage"]);
    expect(multiTextResult.completedTextOutputs[0]?.text).toContain(
      "Repository scan complete.",
    );
    expect(multiTextResult.completedTextOutputs[2]?.text).toContain(
      "## Objective understanding",
    );
    expect(multiTextResult.completedAgentMessages).toHaveLength(2);
  });
});

function createRuntimeService(fixtureArgs: string[] = []) {
  return new CodexRuntimeService(
    new RuntimeCodexAdapter({
      command: process.execPath,
      args: [fixturePath, ...fixtureArgs],
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
    new InMemoryRuntimeSessionRegistry(),
  );
}
