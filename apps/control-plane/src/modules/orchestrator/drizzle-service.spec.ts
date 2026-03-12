import { setTimeout as delay } from "node:timers/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { and, count, eq } from "drizzle-orm";
import { approvals, artifacts, missions, workspaces } from "@pocket-cto/db";
import type { MissionRecord } from "@pocket-cto/domain";
import { DrizzleApprovalRepository } from "../approvals/drizzle-repository";
import { ApprovalService } from "../approvals/service";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { EvidenceService } from "../evidence/service";
import { StubMissionCompiler } from "../missions/compiler";
import { DrizzleMissionRepository } from "../missions/drizzle-repository";
import type { CreateArtifactInput } from "../missions/repository";
import { MissionService } from "../missions/service";
import { DrizzleReplayRepository } from "../replay/drizzle-repository";
import { ReplayService } from "../replay/service";
import { RuntimeCodexAdapter } from "../runtime-codex/adapter";
import { RuntimeControlService } from "../runtime-codex/control-service";
import {
  resolveCodexRuntimeClientOptions,
  resolveCodexThreadDefaults,
} from "../runtime-codex/config";
import { InMemoryRuntimeSessionRegistry } from "../runtime-codex/live-session-registry";
import { CodexRuntimeService } from "../runtime-codex/service";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import {
  LocalExecutorValidationService,
  LocalWorkspaceValidationGitClient,
} from "../validation";
import type { ExecutorValidationHook } from "../validation";
import {
  DrizzleWorkspaceRepository,
  LocalWorkspaceGitManager,
  WorkspaceService,
} from "../workspaces";
import {
  createTempGitRepo,
  createTempWorkspaceRoot,
  listWorktreePaths,
  readCurrentBranch,
} from "../workspaces/test-git";
import { OrchestratorService } from "./service";
import { OrchestratorWorker } from "./worker";

const db = createTestDb();
const cleanups: Array<() => Promise<void>> = [];
const fixturePath = fileURLToPath(
  new URL(
    "../../../../../packages/testkit/src/runtime/fake-codex-app-server.mjs",
    import.meta.url,
  ),
);

describe("OrchestratorWorker (DB-backed)", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    while (cleanups.length > 0) {
      const cleanup = cleanups.pop();
      await cleanup?.();
    }
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("starts the first turn in the same tick and persists codex ids while active", async () => {
    const turnStarted = createDeferred<void>();
    const releaseTurn = createDeferred<void>();
    const harness = await createHarness({
      runtimeCodexService: createBlockedRuntimeService(turnStarted, releaseTurn),
    });
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Inspect the repo without changing files",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const turnTick = worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    await turnStarted.promise;

    const activeDetail = await missionService.getMissionDetail(created.mission.id);
    const activeWorkspace = await getWorkspaceByTaskId(plannerTask.id);
    expect(activeDetail.mission.status).toBe("running");
    expect(activeDetail.tasks[0]).toMatchObject({
      id: plannerTask.id,
      status: "running",
      codexThreadId: "thread_blocked_1",
      codexTurnId: "turn_blocked_1",
      workspaceId: activeWorkspace?.id,
    });
    expect(activeWorkspace).toMatchObject({
      branchName: `pocket-cto/${created.mission.id}/0-planner`,
      isActive: true,
      leaseOwner: "pocket-cto-worker:test:456",
      rootPath: `${harness.workspaceRoot}/${created.mission.id}/0-planner`,
      taskId: plannerTask.id,
    });

    const activeReplay = await replayService.getMissionEvents(created.mission.id);
    expect(activeReplay.map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
      "task.status_changed",
      "runtime.thread_started",
      "runtime.turn_started",
      "mission.status_changed",
      "task.status_changed",
    ]);
    expect(activeReplay[6]).toMatchObject({
      type: "runtime.thread_started",
      payload: {
        cwd: activeWorkspace?.rootPath,
      },
    });

    releaseTurn.resolve();

    const completedTick = await turnTick;
    expect(completedTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        status: "succeeded",
        codexTurnId: null,
      },
      turn: {
        recoveryStrategy: "same_session_bootstrap",
        turnId: "turn_blocked_1",
        status: "completed",
      },
    });

    const releasedWorkspace = await getWorkspaceByTaskId(plannerTask.id);
    expect(releasedWorkspace).toMatchObject({
      id: activeWorkspace?.id,
      isActive: false,
      leaseExpiresAt: null,
      leaseOwner: null,
    });
  });

  it("keeps the fake fixture happy path working for same-session bootstrap plus first turn", async () => {
    const harness = await createHarness();
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Inspect the planner task in read-only mode",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        status: "succeeded",
        codexThreadId: "thread_fake_123",
        codexTurnId: null,
      },
      turn: {
        recoveryStrategy: "same_session_bootstrap",
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
        status: "completed",
        firstItemType: "plan",
        lastItemType: "agentMessage",
      },
    });

    const replayEvents = await replayService.getMissionEvents(created.mission.id);
    const persistedWorkspace = await getWorkspaceByTaskId(plannerTask.id);
    expect(replayEvents.map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
      "task.status_changed",
      "runtime.thread_started",
      "runtime.turn_started",
      "mission.status_changed",
      "task.status_changed",
      "runtime.item_started",
      "runtime.item_completed",
      "runtime.item_started",
      "runtime.item_completed",
      "runtime.turn_completed",
      "task.status_changed",
      "artifact.created",
    ]);
    expect(replayEvents[7]).toMatchObject({
      type: "runtime.turn_started",
      payload: {
        recoveryStrategy: "same_session_bootstrap",
      },
    });
    expect(replayEvents[6]).toMatchObject({
      type: "runtime.thread_started",
      payload: {
        cwd: persistedWorkspace?.rootPath,
      },
    });
    expect(persistedWorkspace).toMatchObject({
      branchName: `pocket-cto/${created.mission.id}/0-planner`,
      isActive: false,
      leaseExpiresAt: null,
      leaseOwner: null,
      rootPath: `${harness.workspaceRoot}/${created.mission.id}/0-planner`,
    });

    const [currentBranch, worktreePaths] = await Promise.all([
      readCurrentBranch(persistedWorkspace!.rootPath),
      listWorktreePaths(harness.sourceRepoRoot),
    ]);
    expect(currentBranch).toBe(`pocket-cto/${created.mission.id}/0-planner`);
    expect(worktreePaths).toContain(persistedWorkspace!.rootPath);
  });

  it("persists pending file-change approvals, moves task and mission to awaiting_approval, and resumes the live turn on acceptance", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "file-change-approval",
      },
    });
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Implement the executor change with a file approval gate first",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks[1]!;

    await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorTick = worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });
    let executorTickSettled = false;
    void executorTick.then(() => {
      executorTickSettled = true;
    });

    const pendingApproval = await waitForPendingApproval(executorTask.id);
    const awaitingDetail = await waitForTaskStatus(
      missionService,
      created.mission.id,
      executorTask.id,
      "awaiting_approval",
    );

    expect(awaitingDetail.mission.status).toBe("awaiting_approval");
    expect(pendingApproval).toMatchObject({
      kind: "file_change",
      missionId: created.mission.id,
      status: "pending",
      taskId: executorTask.id,
    });
    expect(readArtifactMetadata(pendingApproval.payload)).toMatchObject({
      itemId: "item_file_change_1",
      requestId: "approval_file_change_1",
      requestMethod: "item/fileChange/requestApproval",
      threadId: "thread_fake_123",
      turnId: "turn_fake_123",
    });

    const awaitingReplay = await replayService.getMissionEvents(created.mission.id);
    expect(awaitingReplay).toContainEqual(
      expect.objectContaining({
        type: "approval.requested",
        payload: expect.objectContaining({
          itemId: "item_file_change_1",
          kind: "file_change",
          requestId: "approval_file_change_1",
          requestMethod: "item/fileChange/requestApproval",
        }),
      }),
    );
    expect(awaitingReplay).toContainEqual(
      expect.objectContaining({
        type: "task.status_changed",
        payload: {
          from: "running",
          to: "awaiting_approval",
          reason: "approval_requested",
        },
      }),
    );
    expect(awaitingReplay).toContainEqual(
      expect.objectContaining({
        type: "mission.status_changed",
        payload: {
          from: "running",
          to: "awaiting_approval",
          reason: "approval_requested",
        },
      }),
    );

    await worker.resolveApproval({
      approvalId: pendingApproval.id,
      decision: "accept",
      rationale: "Scoped workspace write is acceptable",
      resolvedBy: "operator",
    });

    await delay(1);

    const resumedDetail = await missionService.getMissionDetail(created.mission.id);
    const resumedExecutorTask = resumedDetail.tasks.find(
      (task) => task.id === executorTask.id,
    );
    expect(executorTickSettled).toBe(false);
    expect(resumedDetail.mission.status).toBe("running");
    expect(resumedExecutorTask).toMatchObject({
      id: executorTask.id,
      status: "running",
    });

    const completedTick = await executorTick;
    expect(completedTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: executorTask.id,
        status: "succeeded",
      },
      turn: {
        status: "completed",
      },
    });

    const resolvedApproval = await getApprovalById(pendingApproval.id);
    expect(resolvedApproval).toMatchObject({
      id: pendingApproval.id,
      status: "approved",
    });

    const finalReplay = await replayService.getMissionEvents(created.mission.id);
    expect(finalReplay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          decision: "accept",
          status: "approved",
        }),
      }),
    );
    expect(finalReplay).toContainEqual(
      expect.objectContaining({
        type: "task.status_changed",
        payload: {
          from: "awaiting_approval",
          to: "running",
          reason: "approval_resolved",
        },
      }),
    );
    expect(finalReplay).toContainEqual(
      expect.objectContaining({
        type: "mission.status_changed",
        payload: {
          from: "awaiting_approval",
          to: "running",
          reason: "approval_resolved",
        },
      }),
    );
  });

  it("persists declined approvals and lets the live turn finish with a truthful failed outcome", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "file-change-approval",
      },
    });
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Decline the executor file approval and fail honestly",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks[1]!;

    await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorTick = worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const pendingApproval = await waitForPendingApproval(executorTask.id);
    await waitForTaskStatus(
      missionService,
      created.mission.id,
      executorTask.id,
      "awaiting_approval",
    );

    await worker.resolveApproval({
      approvalId: pendingApproval.id,
      decision: "decline",
      rationale: "Do not allow this mutation",
      resolvedBy: "operator",
    });

    const completedTick = await executorTick;
    expect(completedTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: executorTask.id,
        status: "failed",
      },
      turn: {
        status: "failed",
      },
    });

    const resolvedApproval = await getApprovalById(pendingApproval.id);
    expect(resolvedApproval).toMatchObject({
      id: pendingApproval.id,
      status: "declined",
    });

    const replay = await replayService.getMissionEvents(created.mission.id);
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "approval.resolved",
        payload: expect.objectContaining({
          decision: "decline",
          status: "declined",
        }),
      }),
    );
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "task.status_changed",
        payload: {
          from: "awaiting_approval",
          to: "failed",
          reason: "runtime_turn_failed",
        },
      }),
    );
  });

  it("interrupts an active turn through the live registry and terminalizes as runtime_turn_interrupted", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "interruptible-turn",
      },
    });
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Interrupt the live planner turn cleanly",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const plannerTick = worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    await waitForTaskStatus(
      missionService,
      created.mission.id,
      plannerTask.id,
      "running",
    );

    const interrupt = await worker.interruptActiveTurn({
      rationale: "Operator requested stop",
      requestedBy: "operator",
      taskId: plannerTask.id,
    });

    expect(interrupt).toMatchObject({
      cancelledApprovals: [],
      taskId: plannerTask.id,
      threadId: "thread_fake_123",
      turnId: "turn_fake_123",
    });

    const completedTick = await plannerTick;
    expect(completedTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        status: "cancelled",
      },
      turn: {
        status: "interrupted",
      },
    });

    const replay = await replayService.getMissionEvents(created.mission.id);
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "runtime.turn_interrupt_requested",
        payload: expect.objectContaining({
          requestedBy: "operator",
          taskId: plannerTask.id,
          threadId: "thread_fake_123",
          turnId: "turn_fake_123",
        }),
      }),
    );
    expect(replay).toContainEqual(
      expect.objectContaining({
        type: "task.status_changed",
        payload: {
          from: "running",
          to: "cancelled",
          reason: "runtime_turn_interrupted",
        },
      }),
    );
  });

  it("persists a planner plan artifact, updates task summary, and appends replay for it", async () => {
    const harness = await createHarness();
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Plan the passkey implementation without touching files",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        role: "planner",
        status: "succeeded",
      },
      turn: {
        finalAgentMessageText: expect.stringContaining(
          "## Objective understanding",
        ),
        firstItemType: "plan",
        lastItemType: "agentMessage",
      },
    });
    if (tick?.kind !== "turn_completed") {
      throw new Error("Expected a completed planner turn");
    }
    expect(
      tick.turn.items.some((item: RuntimeCodexRunTurnResult["items"][number]) => item.itemType === "commandExecution"),
    ).toBe(false);

    const [planArtifact] = await db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.missionId, created.mission.id),
          eq(artifacts.kind, "plan"),
        ),
      )
      .limit(1);
    const detail = await missionService.getMissionDetail(created.mission.id);
    const replayEvents = await replayService.getMissionEvents(created.mission.id);

    expect(planArtifact).toBeDefined();
    expect(planArtifact).toMatchObject({
      kind: "plan",
      missionId: created.mission.id,
      taskId: plannerTask.id,
      mimeType: "text/markdown",
      uri: `pocket-cto://missions/${created.mission.id}/tasks/${plannerTask.id}/plan`,
    });
    expect(readArtifactMetadata(planArtifact!.metadata)).toMatchObject({
      body: expect.stringContaining("## Proposed steps"),
      captureStrategy: "completed_text_outputs.plan_agent_message.v1",
      source: "runtime_codex_planner",
      sourceItems: [
        {
          itemId: "item_plan_1",
          itemType: "plan",
        },
        {
          itemId: "item_agent_1",
          itemType: "agentMessage",
        },
      ],
      threadId: "thread_fake_123",
      turnId: "turn_fake_123",
      workflowPolicy: {
        injected: false,
        path: null,
        truncated: false,
      },
    });
    expect(detail.tasks[0]).toMatchObject({
      id: plannerTask.id,
      summary: "Plan the passkey work without changing files and preserve the existing email-login path.",
    });
    expect(detail.proofBundle.artifactIds).toContain(planArtifact!.id);
    expect(detail.proofBundle.decisionTrace).toContain(
      `Planner task 0 produced plan artifact ${planArtifact!.id}.`,
    );
    expect(
      replayEvents.filter((event) => event.type === "artifact.created"),
    ).toHaveLength(2);
    expect(replayEvents.at(-1)).toMatchObject({
      type: "artifact.created",
      payload: {
        artifactId: planArtifact!.id,
        kind: "plan",
      },
    });
  });

  it("persists planner evidence when only a completed plan item contains the substantive text", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "plan-only",
      },
    });
    cleanups.push(harness.cleanup);
    const { missionService, replayService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Plan the passkey rollout without touching files",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        role: "planner",
        status: "succeeded",
      },
      turn: {
        completedTextOutputs: [
          expect.objectContaining({
            itemId: "item_plan_1",
            itemType: "plan",
          }),
        ],
        finalAgentMessageText: null,
      },
    });

    const [planArtifact] = await db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.missionId, created.mission.id),
          eq(artifacts.kind, "plan"),
        ),
      )
      .limit(1);
    const detail = await missionService.getMissionDetail(created.mission.id);
    const replayEvents = await replayService.getMissionEvents(created.mission.id);

    expect(planArtifact).toBeDefined();
    expect(readArtifactMetadata(planArtifact!.metadata)).toMatchObject({
      body: buildExpectedPlanOnlyText(),
      captureStrategy: "completed_text_outputs.plan_agent_message.v1",
      sourceItems: [
        {
          itemId: "item_plan_1",
          itemType: "plan",
        },
      ],
    });
    expect(detail.tasks[0]).toMatchObject({
      id: plannerTask.id,
      summary:
        "Plan the passkey rollout without changing files and preserve the existing email-login path.",
    });
    expect(replayEvents.at(-1)).toMatchObject({
      type: "artifact.created",
      payload: {
        artifactId: planArtifact!.id,
        kind: "plan",
      },
    });
  });

  it("combines multiple textual planner outputs deterministically and records ordered source items", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "multi-text",
      },
    });
    cleanups.push(harness.cleanup);
    const { missionService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Combine planner text outputs deterministically",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      turn: {
        completedTextOutputs: [
          expect.objectContaining({ itemId: "item_plan_1", itemType: "plan" }),
          expect.objectContaining({ itemId: "item_plan_2", itemType: "plan" }),
          expect.objectContaining({
            itemId: "item_agent_1",
            itemType: "agentMessage",
          }),
          expect.objectContaining({
            itemId: "item_agent_2",
            itemType: "agentMessage",
          }),
        ],
      },
    });

    const [planArtifact] = await db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.missionId, created.mission.id),
          eq(artifacts.kind, "plan"),
        ),
      )
      .limit(1);
    const detail = await missionService.getMissionDetail(created.mission.id);

    expect(planArtifact).toBeDefined();
    expect(readArtifactMetadata(planArtifact!.metadata)).toMatchObject({
      body: [
        buildExpectedMultiTextPlanBlock(),
        buildExpectedPlannerAgentMessageText(),
      ].join("\n\n"),
      captureStrategy: "completed_text_outputs.plan_agent_message.v1",
      sourceItems: [
        {
          itemId: "item_plan_1",
          itemType: "plan",
        },
        {
          itemId: "item_agent_1",
          itemType: "agentMessage",
        },
      ],
    });
    expect(detail.tasks[0]).toMatchObject({
      id: plannerTask.id,
      summary:
        "Plan the passkey work without changing files and preserve the existing email-login path.",
    });
  });

  it("terminalizes planner tasks when plan artifact persistence fails after runtime completion", async () => {
    class FailingPlanArtifactRepository extends DrizzleMissionRepository {
      override async saveArtifact(
        input: CreateArtifactInput,
        session?: Parameters<DrizzleMissionRepository["saveArtifact"]>[1],
      ) {
        if (input.kind === "plan") {
          throw new Error("plan insert failed");
        }

        return super.saveArtifact(input, session);
      }
    }

    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      missionRepository: new FailingPlanArtifactRepository(db),
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Planner evidence persistence should not strand the task",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        status: "failed",
        codexTurnId: null,
        summary: expect.stringContaining("planner evidence persistence failed"),
      },
    });

    const detail = await plannerHarness.missionService.getMissionDetail(
      created.mission.id,
    );
    const replayEvents = await plannerHarness.replayService.getMissionEvents(
      created.mission.id,
    );
    const workspace = await getWorkspaceByTaskId(plannerTask.id);

    expect(detail.tasks[0]).toMatchObject({
      id: plannerTask.id,
      codexTurnId: null,
      status: "failed",
    });
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: plannerTask.id,
        type: "runtime.turn_completed",
      }),
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: plannerTask.id,
        type: "task.status_changed",
        payload: expect.objectContaining({
          from: "running",
          reason: "planner_evidence_failed",
          to: "failed",
        }),
      }),
    );
    expect(workspace).toMatchObject({
      isActive: false,
      leaseExpiresAt: null,
      leaseOwner: null,
    });
  });

  it("passes executor validation for allowed file changes and updates the executor summary", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Implement passkeys with a guarded executor step",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const planArtifact = await getPlanArtifact(created.mission.id);
    const executorHarness = await createHarness({
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "Apply the planner handoff to the README inside the allowed workspace root.",
          "",
          "## Files changed",
          "- README.md",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- none",
          "",
          "## Operator handoff",
          "- ready for review",
        ].join("\n"),
        writes: [
          {
            path: "README.md",
            text: "temp repo\nexecutor change\n",
          },
        ],
      }),
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const tick = await executorHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "succeeded",
        summary: expect.stringContaining("Validation passed"),
      },
    });
    if (tick?.kind !== "turn_completed") {
      throw new Error("Expected a completed executor turn");
    }
    expect(tick.task.summary).toContain("README.md");
    const detail = await executorHarness.missionService.getMissionDetail(
      created.mission.id,
    );
    const executorWorkspace = await getWorkspaceByTaskId(created.tasks[1]!.id);

    expect(detail.tasks[1]).toMatchObject({
      id: created.tasks[1]!.id,
      status: "succeeded",
      summary: expect.stringContaining("Validation passed"),
    });
    expect(planArtifact?.id).toBeDefined();
    expect(await readFile(join(executorWorkspace!.rootPath, "README.md"), "utf8")).toContain(
      "executor change",
    );
  });

  it("classifies missing planner artifacts as controlled task failures", async () => {
    const harness = await createHarness();
    cleanups.push(harness.cleanup);
    const log = silentLog();
    const created = await harness.missionService.createFromText({
      text: "Do not start the executor without planner handoff evidence",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;
    const executorTask = created.tasks[1]!;

    await harness.missionRepository.updateTaskStatus(plannerTask.id, "succeeded");
    await harness.missionRepository.updateTaskStatus(executorTask.id, "claimed");

    const tick = await harness.worker.run({
      log,
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "task_failed",
      task: {
        id: executorTask.id,
        role: "executor",
        status: "failed",
        codexTurnId: null,
        summary:
          "Executor could not start because no planner plan artifact was available for handoff.",
      },
    });

    const detail = await harness.missionService.getMissionDetail(created.mission.id);
    const replayEvents = await harness.replayService.getMissionEvents(
      created.mission.id,
    );

    expect(detail.tasks[1]).toMatchObject({
      id: executorTask.id,
      codexTurnId: null,
      status: "failed",
    });
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: executorTask.id,
        type: "task.status_changed",
        payload: expect.objectContaining({
          from: "claimed",
          reason: "executor_missing_planner_artifact",
          to: "failed",
        }),
      }),
    );
    expect(log.error).not.toHaveBeenCalled();
    expect(log.info).toHaveBeenCalledWith(
      expect.objectContaining({
        classification: "controlled_failure",
        missionId: created.mission.id,
        outcome: "task_failed",
        taskId: executorTask.id,
      }),
      "Worker terminalized task after controlled failure",
    );
  });

  it("fails executor validation when changed files escape the allowed-path boundary", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Keep executor changes inside README only",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorHarness = await createHarness({
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "Write an out-of-scope note file.",
          "",
          "## Files changed",
          "- notes/outside.md",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- allowlist breach",
          "",
          "## Operator handoff",
          "- blocked by validation",
        ].join("\n"),
        writes: [
          {
            path: "notes/outside.md",
            text: "outside change\n",
          },
        ],
      }),
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const tick = await executorHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "failed",
        summary: expect.stringContaining("Validation failed"),
      },
    });
    if (tick?.kind !== "turn_completed") {
      throw new Error("Expected a completed executor turn");
    }
    expect(tick.task.summary).toContain("notes/outside.md");
  });

  it("fails executor validation when git diff --check reports whitespace issues", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Let executor change README but reject bad diff formatting",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorHarness = await createHarness({
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "Update the README but leave trailing whitespace behind.",
          "",
          "## Files changed",
          "- README.md",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- whitespace cleanup needed",
          "",
          "## Operator handoff",
          "- blocked by validation",
        ].join("\n"),
        writes: [
          {
            path: "README.md",
            text: "temp repo  \nexecutor bad whitespace \n",
          },
        ],
      }),
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const tick = await executorHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "failed",
        summary: expect.stringContaining("git diff --check"),
      },
    });
  });

  it("fails executor turns explicitly when no files changed and still clears runtime state", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Executor no-op turns must not silently pass",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorHarness = await createHarness({
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "No code changes were necessary after inspecting the planner handoff.",
          "",
          "## Files changed",
          "- none",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- implementation still missing",
          "",
          "## Operator handoff",
          "- blocked until real changes are made",
        ].join("\n"),
        writes: [],
      }),
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const tick = await executorHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "failed",
        codexTurnId: null,
        summary: expect.stringContaining("without changing any files"),
      },
    });

    const detail = await executorHarness.missionService.getMissionDetail(
      created.mission.id,
    );
    const replayEvents = await executorHarness.replayService.getMissionEvents(
      created.mission.id,
    );
    const executorWorkspace = await getWorkspaceByTaskId(created.tasks[1]!.id);

    expect(detail.tasks[1]).toMatchObject({
      id: created.tasks[1]!.id,
      codexTurnId: null,
      status: "failed",
    });
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "task.status_changed",
        payload: expect.objectContaining({
          from: "running",
          reason: "executor_no_changes",
          to: "failed",
        }),
      }),
    );
    expect(executorWorkspace).toMatchObject({
      isActive: false,
      leaseExpiresAt: null,
      leaseOwner: null,
    });
  });

  it("terminalizes executor tasks when a validation hook throws unexpectedly", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Validation hook failures should not strand the executor",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const throwingValidationService = new LocalExecutorValidationService(
      new LocalWorkspaceValidationGitClient(),
      [
        {
          name: "changed_paths",
          async run() {
            throw new Error("git status failed");
          },
        },
        {
          name: "git_diff_check",
          async run() {
            return {
              name: "git_diff_check",
              status: "passed" as const,
              summary: "git diff --check passed.",
            };
          },
        },
      ] satisfies ExecutorValidationHook[],
    );
    const executorHarness = await createHarness({
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "Update the README inside the allowed workspace.",
          "",
          "## Files changed",
          "- README.md",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- validation hook error",
          "",
          "## Operator handoff",
          "- blocked by validation",
        ].join("\n"),
        writes: [
          {
            path: "README.md",
            text: "temp repo\nexecutor hook failure\n",
          },
        ],
      }),
      sourceRepoRoot: sourceRepo.repoRoot,
      validationService: throwingValidationService,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const tick = await executorHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "failed",
        codexTurnId: null,
        summary: expect.stringContaining("failed unexpectedly"),
      },
    });

    const detail = await executorHarness.missionService.getMissionDetail(
      created.mission.id,
    );
    const replayEvents = await executorHarness.replayService.getMissionEvents(
      created.mission.id,
    );
    const executorWorkspace = await getWorkspaceByTaskId(created.tasks[1]!.id);

    expect(detail.tasks[1]).toMatchObject({
      id: created.tasks[1]!.id,
      codexTurnId: null,
      status: "failed",
    });
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "task.status_changed",
        payload: expect.objectContaining({
          from: "running",
          reason: "executor_validation_failed",
          to: "failed",
        }),
      }),
    );
    expect(executorWorkspace).toMatchObject({
      isActive: false,
      leaseExpiresAt: null,
      leaseOwner: null,
    });
  });

  it("reuses the same persisted workspace after a failed recovery tick", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup);

    const failureHarness = await createHarness({
      fixtureOptions: {
        mode: "thread-start-error",
      },
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const {
      missionService: failureMissionService,
      worker: failureWorker,
    } = failureHarness;
    const created = await failureMissionService.createFromText({
      text: "Retry the claimed task without duplicating the workspace",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const failedTick = await failureWorker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(failedTick).toMatchObject({
      kind: "runtime_failed",
      task: {
        id: plannerTask.id,
        status: "claimed",
      },
    });

    const firstWorkspace = await getWorkspaceByTaskId(plannerTask.id);
    expect(firstWorkspace).toMatchObject({
      isActive: true,
      leaseOwner: "pocket-cto-worker:test:456",
    });

    const successHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });

    const recoveredTick = await successHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(recoveredTick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: plannerTask.id,
        status: "succeeded",
      },
    });

    const secondWorkspace = await getWorkspaceByTaskId(plannerTask.id);
    expect(secondWorkspace).toMatchObject({
      id: firstWorkspace?.id,
      rootPath: firstWorkspace?.rootPath,
    });
    expect(await countWorkspaces()).toBe(1);
  });

  it("falls back to direct turn/start when thread/resume is unavailable for a pre-first-turn task", async () => {
    const harness = await createHarness({
        fixtureOptions: {
          mode: "resume-gap-direct-turn-success",
          threadId: "thread_gap_1",
        },
      });
    cleanups.push(harness.cleanup);
    const { missionRepository, missionService, replayService, worker } = harness;
    const recoverableMission = await missionService.createFromText({
      text: "Recover the stored thread without replacing it",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const pendingMission = await missionService.createFromText({
      text: "Stay pending until the recoverable task is absorbed",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const recoverableTask = recoverableMission.tasks[0]!;

    await missionRepository.updateTaskStatus(recoverableTask.id, "claimed");
    await missionRepository.attachCodexThreadId(recoverableTask.id, "thread_gap_1");

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: recoverableTask.id,
        status: "succeeded",
        codexThreadId: "thread_gap_1",
      },
      turn: {
        recoveryStrategy: "direct_turn_start",
        threadId: "thread_gap_1",
        turnId: "turn_fake_123",
      },
    });

    const pendingDetail = await missionService.getMissionDetail(pendingMission.mission.id);
    expect(pendingDetail.tasks[0]).toMatchObject({
      status: "pending",
    });

    const replayEvents = await replayService.getMissionEvents(
      recoverableMission.mission.id,
    );
    expect(replayEvents.map((event) => event.type)).not.toContain(
      "runtime.thread_replaced",
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        type: "runtime.turn_started",
        payload: expect.objectContaining({
          recoveryStrategy: "direct_turn_start",
          threadId: "thread_gap_1",
        }),
      }),
    );
  });

  it("replaces the thread for the pre-first-turn gap only after resume and direct turn/start both fail", async () => {
    const harness = await createHarness({
        fixtureOptions: {
          mode: "resume-gap-direct-turn-failed",
          threadId: "thread_gap_replace_1",
        },
      });
    cleanups.push(harness.cleanup);
    const { missionRepository, missionService, replayService, worker } = harness;
    const recoverableMission = await missionService.createFromText({
      text: "Replace the unusable first-turn thread",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const pendingMission = await missionService.createFromText({
      text: "Remain pending while thread replacement happens",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const recoverableTask = recoverableMission.tasks[0]!;

    await missionRepository.updateTaskStatus(recoverableTask.id, "claimed");
    await missionRepository.attachCodexThreadId(
      recoverableTask.id,
      "thread_gap_replace_1",
    );

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "turn_completed",
      task: {
        id: recoverableTask.id,
        status: "succeeded",
        codexThreadId: "thread_gap_replace_1_replacement_1",
      },
      turn: {
        recoveryStrategy: "replacement_thread",
        threadId: "thread_gap_replace_1_replacement_1",
        turnId: "turn_fake_123",
      },
    });

    const pendingDetail = await missionService.getMissionDetail(pendingMission.mission.id);
    expect(pendingDetail.tasks[0]).toMatchObject({
      status: "pending",
    });

    const replayEvents = await replayService.getMissionEvents(
      recoverableMission.mission.id,
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        type: "runtime.thread_replaced",
        payload: expect.objectContaining({
          oldThreadId: "thread_gap_replace_1",
          newThreadId: "thread_gap_replace_1_replacement_1",
          reasonCode: "resume_unavailable",
        }),
      }),
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        type: "runtime.turn_started",
        payload: expect.objectContaining({
          recoveryStrategy: "replacement_thread",
        }),
      }),
    );
  });

  it("does not replace the thread if the task has already emitted runtime.turn_started once", async () => {
    const harness = await createHarness({
        fixtureOptions: {
          mode: "resume-gap-direct-turn-failed",
          threadId: "thread_do_not_replace_1",
        },
      });
    cleanups.push(harness.cleanup);
    const { missionRepository, missionService, replayService, worker } = harness;
    const mission = await missionService.createFromText({
      text: "Do not replace a post-turn task",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const task = mission.tasks[0]!;

    await missionRepository.updateTaskStatus(task.id, "claimed");
    await missionRepository.attachCodexThreadId(task.id, "thread_do_not_replace_1");
    await replayService.append({
      missionId: mission.mission.id,
      taskId: task.id,
      type: "runtime.turn_started",
      payload: {
        missionId: mission.mission.id,
        recoveryStrategy: "resumed_thread",
        taskId: task.id,
        threadId: "thread_do_not_replace_1",
        turnId: "turn_old_1",
      },
    });

    const tick = await worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "runtime_failed",
      task: {
        id: task.id,
        codexThreadId: "thread_do_not_replace_1",
        status: "claimed",
      },
    });

    const detail = await missionService.getMissionDetail(mission.mission.id);
    expect(detail.tasks[0]).toMatchObject({
      codexThreadId: "thread_do_not_replace_1",
      codexTurnId: null,
      status: "claimed",
    });

    const replayEvents = await replayService.getMissionEvents(mission.mission.id);
    expect(replayEvents.map((event) => event.type)).not.toContain(
      "runtime.thread_replaced",
    );
  });
});

async function createHarness(options?: {
  fixtureOptions?: {
    mode?:
      | "success"
      | "plan-only"
      | "multi-text"
      | "file-change-approval"
      | "command-approval"
      | "interruptible-turn"
      | "thread-start-error"
      | "turn-completed-failed"
      | "turn-start-error"
      | "resume-gap-direct-turn-success"
      | "resume-gap-direct-turn-failed";
    threadId?: string;
  };
  missionRepository?: DrizzleMissionRepository;
  runtimeCodexService?: Pick<CodexRuntimeService, "runTurn">;
  sourceRepoRoot?: string;
  validationService?: Pick<
    LocalExecutorValidationService,
    "validateExecutorTurn"
  >;
  workspaceRoot?: string;
}) {
  const sourceRepo =
    options?.sourceRepoRoot
      ? null
      : await createTempGitRepo();
  const workspaceRoot =
    options?.workspaceRoot
      ? null
      : await createTempWorkspaceRoot();
  const sourceRepoRoot = options?.sourceRepoRoot ?? sourceRepo?.repoRoot;
  const resolvedWorkspaceRoot =
    options?.workspaceRoot ?? workspaceRoot?.workspaceRoot;

  if (!sourceRepoRoot || !resolvedWorkspaceRoot) {
    throw new Error("Workspace harness roots were not resolved");
  }

  const missionRepository =
    options?.missionRepository ?? new DrizzleMissionRepository(db);
  const approvalRepository = new DrizzleApprovalRepository(db);
  const replayRepository = new DrizzleReplayRepository(db);
  const workspaceRepository = new DrizzleWorkspaceRepository(db);
  const replayService = new ReplayService(replayRepository, missionRepository);
  const liveSessionRegistry = new InMemoryRuntimeSessionRegistry();
  const missionService = new MissionService(
    new StubMissionCompiler(),
    missionRepository,
    replayService,
    new EvidenceService(),
  );
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    new LocalWorkspaceGitManager(),
    {
      leaseDurationMs: 60_000,
      leaseOwner: "pocket-cto-worker:test:456",
      sourceRepoRoot,
      workspaceRoot: resolvedWorkspaceRoot,
    },
  );
  const runtimeCodexService =
    options?.runtimeCodexService ??
    new CodexRuntimeService(
      new RuntimeCodexAdapter(
        resolveCodexRuntimeClientOptions({
          CODEX_APP_SERVER_COMMAND: process.execPath,
          CODEX_APP_SERVER_ARGS: buildFixtureArgs(options?.fixtureOptions),
          CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
          CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
          CODEX_DEFAULT_SANDBOX: "workspace-write",
          CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-control-plane",
        }),
      ),
      resolveCodexThreadDefaults(
        {
          CODEX_APP_SERVER_COMMAND: process.execPath,
          CODEX_APP_SERVER_ARGS: buildFixtureArgs(options?.fixtureOptions),
          CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
          CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
          CODEX_DEFAULT_SANDBOX: "workspace-write",
          CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-control-plane",
        },
        resolvedWorkspaceRoot,
      ),
      liveSessionRegistry,
    );
  const approvalService = new ApprovalService(
    approvalRepository,
    missionRepository,
    replayService,
    liveSessionRegistry,
  );
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    approvalService,
    runtimeCodexService,
    new EvidenceService(),
    workspaceService,
    options?.validationService ??
      new LocalExecutorValidationService(new LocalWorkspaceValidationGitClient()),
  );
  const runtimeControlService = new RuntimeControlService(
    missionRepository,
    replayService,
    approvalService,
    liveSessionRegistry,
  );

  return {
    async cleanup() {
      await workspaceRoot?.cleanup();
      await sourceRepo?.cleanup();
    },
    missionRepository,
    missionService,
    replayService,
    runtimeControlService,
    sourceRepoRoot,
    workspaceRoot: resolvedWorkspaceRoot,
    worker: new OrchestratorWorker(orchestratorService, {
      approvalService,
      runtimeControlService,
    }),
  };
}

function buildFixtureArgs(options?: {
  mode?:
    | "success"
    | "plan-only"
    | "multi-text"
    | "file-change-approval"
    | "command-approval"
    | "interruptible-turn"
    | "thread-start-error"
    | "turn-completed-failed"
    | "turn-start-error"
    | "resume-gap-direct-turn-success"
    | "resume-gap-direct-turn-failed";
  threadId?: string;
}) {
  const args = [`"${fixturePath}"`];

  if (options?.mode) {
    args.push("--mode", options.mode);
  }

  if (options?.threadId) {
    args.push("--thread-id", options.threadId);
  }

  return args.join(" ");
}

function createBlockedRuntimeService(
  turnStarted: ReturnType<typeof createDeferred<void>>,
  releaseTurn: ReturnType<typeof createDeferred<void>>,
): Pick<CodexRuntimeService, "runTurn"> {
  return {
    async runTurn(input, observer = {}) {
      const threadId = input.threadId ?? "thread_blocked_1";
      const turnId = "turn_blocked_1";

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
            preview: "blocked turn thread",
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
            name: "blocked turn thread",
            turns: [],
          },
          threadId,
          userAgent: "fake-codex/1.0.0",
        });
      }

      await observer.onTurnStarted?.({
        recoveryStrategy: input.threadId
          ? "resumed_thread"
          : "same_session_bootstrap",
        threadId,
        turnId,
      });
      turnStarted.resolve();
      await releaseTurn.promise;

      const items = [
        {
          itemId: "item_plan_blocked",
          itemType: "plan",
          phase: "started" as const,
          threadId,
          turnId,
        },
        {
          itemId: "item_plan_blocked",
          itemType: "plan",
          phase: "completed" as const,
          threadId,
          turnId,
        },
      ];

      await observer.onItemStarted?.(items[0]!);
      await observer.onItemCompleted?.(items[1]!);

      return {
        completedAgentMessages: [],
        completedTextOutputs: [
          {
            itemId: "item_plan_blocked",
            itemType: "plan",
            text: [
              "## Objective understanding",
              "Keep the planner blocked turn read-only while it prepares handoff notes.",
            ].join("\n"),
            threadId,
            turnId,
          },
        ],
        finalAgentMessageText: null,
        firstItemType: "plan",
        items,
        lastItemType: "plan",
        recoveryStrategy: input.threadId
          ? "resumed_thread"
          : "same_session_bootstrap",
        status: "completed",
        threadId,
        turnId,
      } satisfies RuntimeCodexRunTurnResult;
    },
  };
}

function createFileWritingRuntimeService(input: {
  finalReportText: string;
  writes: Array<{
    path: string;
    text: string;
  }>;
}): Pick<CodexRuntimeService, "runTurn"> {
  return {
    async runTurn(turnInput, observer = {}) {
      const threadId = turnInput.threadId ?? "thread_executor_1";
      const turnId = "turn_executor_1";
      const cwd = turnInput.cwd ?? process.cwd();

      if (!turnInput.threadId) {
        await observer.onThreadStarted?.({
          approvalPolicy: "untrusted",
          cwd,
          model: "gpt-5.2-codex",
          modelProvider: "openai",
          sandbox: {
            type: "workspaceWrite",
            writableRoots: [cwd],
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
            preview: "executor test thread",
            ephemeral: false,
            modelProvider: "openai",
            createdAt: 1,
            updatedAt: 1,
            status: {
              type: "idle",
            },
            path: null,
            cwd,
            cliVersion: "0.1.0",
            source: "appServer",
            agentNickname: null,
            agentRole: null,
            gitInfo: null,
            name: "executor test thread",
            turns: [],
          },
          threadId,
          userAgent: "fake-codex/1.0.0",
        });
      }

      await observer.onTurnStarted?.({
        recoveryStrategy: turnInput.threadId
          ? "resumed_thread"
          : "same_session_bootstrap",
        threadId,
        turnId,
      });

      for (const write of input.writes) {
        const filePath = join(cwd, write.path);
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, write.text, "utf8");
      }

      const itemStarted = {
        itemId: "item_agent_executor_1",
        itemType: "agentMessage",
        phase: "started" as const,
        threadId,
        turnId,
      };
      const itemCompleted = {
        ...itemStarted,
        phase: "completed" as const,
      };

      await observer.onItemStarted?.(itemStarted);
      await observer.onItemCompleted?.(itemCompleted);

      return {
        completedAgentMessages: [
          {
            itemId: itemCompleted.itemId,
            text: input.finalReportText,
            threadId,
            turnId,
          },
        ],
        completedTextOutputs: [
          {
            itemId: itemCompleted.itemId,
            itemType: "agentMessage",
            text: input.finalReportText,
            threadId,
            turnId,
          },
        ],
        finalAgentMessageText: input.finalReportText,
        firstItemType: itemStarted.itemType,
        items: [itemStarted, itemCompleted],
        lastItemType: itemCompleted.itemType,
        recoveryStrategy: turnInput.threadId
          ? "resumed_thread"
          : "same_session_bootstrap",
        status: "completed",
        threadId,
        turnId,
      } satisfies RuntimeCodexRunTurnResult;
    },
  };
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

function silentLog() {
  return {
    error: vi.fn(),
    info: vi.fn(),
  };
}

async function getPlanArtifact(missionId: string) {
  const [artifact] = await db
    .select()
    .from(artifacts)
    .where(and(eq(artifacts.missionId, missionId), eq(artifacts.kind, "plan")))
    .limit(1);

  return artifact ?? null;
}

async function countWorkspaces() {
  const [result] = await db.select({ count: count() }).from(workspaces);
  return result?.count ?? 0;
}

async function getWorkspaceByTaskId(taskId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.taskId, taskId))
    .limit(1);

  return workspace
    ? {
        ...workspace,
        createdAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
      }
    : null;
}

async function getApprovalById(approvalId: string) {
  const [approval] = await db
    .select()
    .from(approvals)
    .where(eq(approvals.id, approvalId))
    .limit(1);

  return approval
    ? {
        ...approval,
        createdAt: approval.createdAt.toISOString(),
        updatedAt: approval.updatedAt.toISOString(),
      }
    : null;
}

async function waitForPendingApproval(taskId: string) {
  return waitFor(async () => {
    const [approval] = await db
      .select()
      .from(approvals)
      .where(and(eq(approvals.taskId, taskId), eq(approvals.status, "pending")))
      .limit(1);

    return approval
      ? {
          ...approval,
          createdAt: approval.createdAt.toISOString(),
          updatedAt: approval.updatedAt.toISOString(),
        }
      : null;
  });
}

async function waitForTaskStatus(
  missionService: MissionService,
  missionId: string,
  taskId: string,
  status: string,
) {
  return waitFor(async () => {
    const detail = await missionService.getMissionDetail(missionId);
    const task = detail.tasks.find((candidate) => candidate.id === taskId);

    return task?.status === status ? detail : null;
  });
}

async function waitFor<T>(
  reader: () => Promise<T | null>,
  options?: {
    attempts?: number;
    delayMs?: number;
  },
) {
  const attempts = options?.attempts ?? 100;
  const delayMs = options?.delayMs ?? 10;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await reader();

    if (value !== null) {
      return value;
    }

    await delay(delayMs);
  }

  throw new Error("Timed out waiting for expected value");
}

function readArtifactMetadata(metadata: unknown) {
  return typeof metadata === "object" && metadata !== null
    ? (metadata as Record<string, unknown>)
    : {};
}

async function setMissionAllowedPaths(
  missionId: string,
  spec: MissionRecord["spec"],
  allowedPaths: string[],
) {
  await db
    .update(missions)
    .set({
      spec: {
        ...spec,
        constraints: {
          ...spec.constraints,
          allowedPaths,
        },
      },
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId));
}

function buildExpectedPlanOnlyText() {
  return [
    "## Objective understanding",
    "Plan the passkey rollout without changing files and preserve the existing email-login path.",
    "",
    "## Relevant context",
    "- The repo already separates planner and executor responsibilities.",
    "",
    "## Risks and unknowns",
    "- Auth storage, browser support, and recovery flows still need confirmation.",
    "",
    "## Proposed steps",
    "1. Inspect auth entrypoints and passkey-related domain models.",
    "2. Map UI and API touchpoints before any executor mutation.",
    "3. Define the smallest safe validation set for login continuity.",
    "",
    "## Validation plan",
    "- Keep later executor validation focused on auth and sign-in regression coverage.",
    "",
    "## Handoff notes",
    "- Leave implementation changes to the later executor turn.",
  ].join("\n");
}

function buildExpectedMultiTextPlanBlock() {
  return [
    "Repository scan complete.",
    "- auth and web sign-in paths look like the likely passkey touchpoints.",
    "- executor work should stay bounded to authentication flows.",
  ].join("\n");
}

function buildExpectedPlannerAgentMessageText() {
  return [
    "## Objective understanding",
    "Plan the passkey work without changing files and preserve the existing email-login path.",
    "",
    "## Relevant context",
    "- The repo already has planner and executor tasks.",
    "- WORKFLOW.md requires explicit validation before completion.",
    "",
    "## Risks and unknowns",
    "- Auth touchpoints and test ownership still need confirmation.",
    "",
    "## Proposed steps",
    "1. Inspect the auth entrypoints and existing sign-in flows.",
    "2. Map passkey data and UI changes before any executor mutation.",
    "3. Identify the minimum regression tests needed for email-login continuity.",
    "",
    "## Validation plan",
    "- Run targeted auth and web tests after the later executor turn.",
    "",
    "## Handoff notes",
    "- Keep the later executor constrained to auth and web paths only.",
  ].join("\n");
}
