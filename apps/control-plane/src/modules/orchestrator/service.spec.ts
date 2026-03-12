import { setTimeout as delay } from "node:timers/promises";
import { describe, expect, it, vi } from "vitest";
import { EvidenceService } from "../evidence/service";
import { StubMissionCompiler } from "../missions/compiler";
import { InMemoryMissionRepository } from "../missions/repository";
import { MissionService } from "../missions/service";
import { InMemoryReplayRepository } from "../replay/repository";
import { ReplayService } from "../replay/service";
import {
  InMemoryWorkspaceRepository,
  WorkspaceService,
} from "../workspaces";
import { OrchestratorService } from "./service";
import { OrchestratorWorker } from "./worker";

describe("OrchestratorWorker", () => {
  it("recovers claimed tasks before claiming new work", async () => {
    const { missionRepository, missionService, worker } = createHarness();
    const log = {
      error: vi.fn(),
      info: vi.fn(),
    };

    const oldestMission = await missionService.createFromText({
      text: "Recover the oldest claimed task first",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await delay(10);
    const secondMission = await missionService.createFromText({
      text: "Recover the stranded thread next",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await delay(10);
    const newestMission = await missionService.createFromText({
      text: "Do not claim this until claimed work is absorbed",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    const oldestPlanner = oldestMission.tasks[0]!;
    const secondPlanner = secondMission.tasks[0]!;

    await missionRepository.updateTaskStatus(oldestPlanner.id, "claimed");
    await missionRepository.updateTaskStatus(secondPlanner.id, "claimed");
    await missionRepository.attachCodexThreadId(secondPlanner.id, "thread_existing");

    const firstTick = await worker.run({
      log,
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(firstTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: oldestPlanner.id,
        status: "succeeded",
        codexThreadId: "thread_1",
      },
      turn: {
        recoveryStrategy: "same_session_bootstrap",
        threadId: "thread_1",
        turnId: "turn_1",
      },
    });

    const secondTick = await worker.run({
      log,
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(secondTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: secondPlanner.id,
        status: "succeeded",
      },
      turn: {
        recoveryStrategy: "resumed_thread",
        threadId: "thread_existing",
        turnId: "turn_2",
      },
    });

    const newestDetail = await missionService.getMissionDetail(
      newestMission.mission.id,
    );
    expect(newestDetail.tasks[0]).toMatchObject({
      status: "pending",
    });

    const thirdTick = await worker.run({
      log,
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(thirdTick).toMatchObject({
      kind: "turn_completed",
      task: {
        missionId: oldestMission.mission.id,
        status: "succeeded",
      },
    });

    expect(log.error).not.toHaveBeenCalled();
  });

  it("leaves executor turns on the generic non-mutating path without plan artifacts", async () => {
    const { missionRepository, missionService, replayService, worker } = createHarness();
    const created = await missionService.createFromText({
      text: "Keep executor read-only until M1.5",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks[1]!;

    await missionRepository.updateTaskStatus(created.tasks[0]!.id, "succeeded");
    await missionRepository.updateTaskStatus(executorTask.id, "claimed");

    const tick = await worker.run({
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: executorTask.id,
        role: "executor",
        status: "succeeded",
        summary: null,
      },
    });

    const replay = await replayService.getMissionEvents(created.mission.id);
    expect(replay.filter((event) => event.type === "artifact.created")).toHaveLength(1);
  });
});

function createHarness() {
  const missionRepository = new InMemoryMissionRepository();
  const replayRepository = new InMemoryReplayRepository();
  const replayService = new ReplayService(replayRepository, missionRepository);
  const missionService = new MissionService(
    new StubMissionCompiler(),
    missionRepository,
    replayService,
    new EvidenceService(),
  );
  const workspaceService = new WorkspaceService(
    new InMemoryWorkspaceRepository(),
    {
      async ensureWorktree() {},
    },
    {
      leaseDurationMs: 60_000,
      leaseOwner: "pocket-cto-worker:test:123",
      sourceRepoRoot: process.cwd(),
      workspaceRoot: "/tmp/pocket-cto-worker-spec-workspaces",
    },
  );
  let threadCount = 0;
  let turnCount = 0;
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    {
      async runTurn(input, observer = {}) {
        turnCount += 1;
        const threadId = input.threadId ?? `thread_${++threadCount}`;
        const turnId = `turn_${turnCount}`;
        const recoveryStrategy = input.threadId
          ? "resumed_thread"
          : "same_session_bootstrap";
        const items = [
          {
            itemId: `item_plan_${turnCount}`,
            itemType: "plan",
            phase: "started" as const,
            threadId,
            turnId,
          },
          {
            itemId: `item_plan_${turnCount}`,
            itemType: "plan",
            phase: "completed" as const,
            threadId,
            turnId,
          },
          {
            itemId: `item_agent_${turnCount}`,
            itemType: "agentMessage",
            phase: "started" as const,
            threadId,
            turnId,
          },
          {
            itemId: `item_agent_${turnCount}`,
            itemType: "agentMessage",
            phase: "completed" as const,
            threadId,
            turnId,
          },
        ];

        if (!input.threadId) {
          await observer.onThreadStarted?.({
            approvalPolicy: "untrusted",
            cwd: input.cwd ?? process.cwd(),
            model: "gpt-5.2-codex",
            modelProvider: "openai",
            sandbox: {
              type: "workspaceWrite",
              writableRoots: [input.cwd ?? process.cwd()],
              readOnlyAccess: {
                type: "fullAccess",
              },
              networkAccess: false,
              excludeTmpdirEnvVar: false,
              excludeSlashTmp: false,
            },
            serviceName: "pocket-cto-control-plane",
            thread: {
              id: threadId,
              preview: "test thread",
              ephemeral: false,
              modelProvider: "openai",
              createdAt: 1,
              updatedAt: 1,
              status: {
                type: "idle",
              },
              path: null,
              cwd: input.cwd ?? process.cwd(),
              cliVersion: "0.1.0",
              source: "appServer",
              agentNickname: null,
              agentRole: null,
              gitInfo: null,
              name: "test thread",
              turns: [],
            },
            threadId,
            userAgent: "fake-codex/1.0.0",
          });
        }

        await observer.onTurnStarted?.({
          recoveryStrategy,
          threadId,
          turnId,
        });
        await observer.onItemStarted?.(items[0]!);
        await observer.onItemCompleted?.(items[1]!);
        await observer.onItemStarted?.(items[2]!);
        await observer.onItemCompleted?.(items[3]!);

        return {
          completedAgentMessages:
            input.threadId || input.input[0]?.type !== "text"
              ? []
              : [
                  {
                    itemId: `item_agent_${turnCount}`,
                    text: [
                      "## Objective understanding",
                      "Inspect the current task without making any changes.",
                    ].join("\n"),
                    threadId,
                    turnId,
                  },
                ],
          completedTextOutputs:
            input.threadId || input.input[0]?.type !== "text"
              ? []
              : [
                  {
                    itemId: `item_plan_${turnCount}`,
                    itemType: "plan",
                    text: "Inspect repository state and propose next steps without changing files.",
                    threadId,
                    turnId,
                  },
                  {
                    itemId: `item_agent_${turnCount}`,
                    itemType: "agentMessage",
                    text: [
                      "## Objective understanding",
                      "Inspect the current task without making any changes.",
                    ].join("\n"),
                    threadId,
                    turnId,
                  },
                ],
          finalAgentMessageText:
            input.threadId || input.input[0]?.type !== "text"
              ? null
              : [
                  "## Objective understanding",
                  "Inspect the current task without making any changes.",
                ].join("\n"),
          firstItemType: items[0]!.itemType,
          items,
          lastItemType: items[3]!.itemType,
          recoveryStrategy,
          status: "completed",
          threadId,
          turnId,
        };
      },
    },
    new EvidenceService(),
    workspaceService,
  );

  return {
    missionRepository,
    missionService,
    replayService,
    worker: new OrchestratorWorker(orchestratorService),
  };
}
