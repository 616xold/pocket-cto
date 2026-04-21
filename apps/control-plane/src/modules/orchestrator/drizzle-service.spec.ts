import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { and, count, eq } from "drizzle-orm";
import { approvals, artifacts, missions, workspaces } from "@pocket-cto/db";
import type { MissionRecord, ReplayEvent } from "@pocket-cto/domain";
import { buildApp } from "../../app";
import type { AppContainer } from "../../lib/types";
import { DrizzleApprovalRepository } from "../approvals/drizzle-repository";
import { ApprovalService } from "../approvals/service";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { waitForValue } from "../../test/wait-for";
import { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import { EvidenceService } from "../evidence/service";
import type { FinanceDiscoveryService } from "../finance-discovery/service";
import { GitHubAppService } from "../github-app/service";
import { InMemoryInstallationTokenCache } from "../github-app/token-cache";
import { DrizzleGitHubAppRepository } from "../github-app/drizzle-repository";
import { LocalGitHubWriteClient } from "../github-app/git-write-client";
import type { GitHubPublishService } from "../github-app/publish-service";
import { GitHubPublishService as RealGitHubPublishService } from "../github-app/publish-service";
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
const execFile = promisify(execFileCallback);
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
      runtimeCodexService: createBlockedRuntimeService(
        turnStarted,
        releaseTurn,
      ),
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

    const activeDetail = await missionService.getMissionDetail(
      created.mission.id,
    );
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

    const activeReplay = await replayService.getMissionEvents(
      created.mission.id,
    );
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

    const replayEvents = await replayService.getMissionEvents(
      created.mission.id,
    );
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
      "proof_bundle.refreshed",
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

    const awaitingReplay = await replayService.getMissionEvents(
      created.mission.id,
    );
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

    const finalReplay = await replayService.getMissionEvents(
      created.mission.id,
    );
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
    const approvalResolvedEvent = getRequiredReplayEvent(
      finalReplay,
      (event) =>
        event.type === "approval.resolved" &&
        readArtifactMetadata(event.payload).decision === "accept",
    );
    const taskResumedEvent = getRequiredReplayEvent(
      finalReplay,
      (event) =>
        event.type === "task.status_changed" &&
        readArtifactMetadata(event.payload).reason === "approval_resolved",
    );
    const missionResumedEvent = getRequiredReplayEvent(
      finalReplay,
      (event) =>
        event.type === "mission.status_changed" &&
        readArtifactMetadata(event.payload).reason === "approval_resolved",
    );
    const resumedTurnItem = getRequiredReplayEvent(
      finalReplay,
      (event) =>
        event.type === "runtime.item_started" &&
        event.sequence > taskResumedEvent.sequence,
    );

    expect(approvalResolvedEvent.sequence).toBeLessThan(
      taskResumedEvent.sequence,
    );
    expect(approvalResolvedEvent.sequence).toBeLessThan(
      missionResumedEvent.sequence,
    );
    expect(taskResumedEvent.sequence).toBeLessThan(resumedTurnItem.sequence);
    expect(missionResumedEvent.sequence).toBeLessThan(resumedTurnItem.sequence);
  });

  it("lists pending approvals and resolves them through the embedded HTTP control surface", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "file-change-approval",
      },
    });
    cleanups.push(harness.cleanup);
    const app = await buildApp({
      container: harness.appContainer,
    });
    cleanups.push(async () => {
      await app.close();
    });
    const { missionService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Resolve a persisted approval through the embedded HTTP control path",
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
    const beforeResolve = await waitForTaskStatus(
      missionService,
      created.mission.id,
      executorTask.id,
      "awaiting_approval",
    );
    const listResponse = await app.inject({
      method: "GET",
      url: `/missions/${created.mission.id}/approvals`,
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toMatchObject({
      approvals: [
        expect.objectContaining({
          id: pendingApproval.id,
          kind: "file_change",
          status: "pending",
        }),
      ],
      liveControl: {
        enabled: true,
        limitation: "single_process_only" as const,
        mode: "embedded_worker" as const,
      },
    });
    expect(beforeResolve.mission.status).toBe("awaiting_approval");

    const resolveResponse = await app.inject({
      method: "POST",
      url: `/approvals/${pendingApproval.id}/resolve`,
      payload: {
        decision: "accept",
        rationale: "Approve through HTTP",
        resolvedBy: "operator",
      },
    });

    expect(resolveResponse.statusCode).toBe(200);
    expect(resolveResponse.json()).toMatchObject({
      approval: {
        id: pendingApproval.id,
        status: "approved",
      },
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

  it("interrupts an active turn through the embedded HTTP control surface", async () => {
    const harness = await createHarness({
      fixtureOptions: {
        mode: "interruptible-turn",
      },
    });
    cleanups.push(harness.cleanup);
    const app = await buildApp({
      container: harness.appContainer,
    });
    cleanups.push(async () => {
      await app.close();
    });
    const { missionService, worker } = harness;
    const created = await missionService.createFromText({
      text: "Interrupt the active task through the HTTP control path",
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

    const interruptResponse = await app.inject({
      method: "POST",
      url: `/tasks/${plannerTask.id}/interrupt`,
      payload: {
        rationale: "Stop through HTTP",
        requestedBy: "operator",
      },
    });

    expect(interruptResponse.statusCode).toBe(200);
    expect(interruptResponse.json()).toMatchObject({
      interrupt: {
        cancelledApprovals: [],
        taskId: plannerTask.id,
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
      },
      liveControl: {
        enabled: true,
        limitation: "single_process_only" as const,
        mode: "embedded_worker" as const,
      },
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
      tick.turn.items.some(
        (item: RuntimeCodexRunTurnResult["items"][number]) =>
          item.itemType === "commandExecution",
      ),
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
    const replayEvents = await replayService.getMissionEvents(
      created.mission.id,
    );

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
      summary:
        "Plan the passkey work without changing files and preserve the existing email-login path.",
    });
    expect(detail.proofBundle.artifactIds).toContain(planArtifact!.id);
    expect(detail.proofBundle.decisionTrace).toContain(
      `Planner task 0 produced plan artifact ${planArtifact!.id}.`,
    );
    expect(
      replayEvents.filter((event) => event.type === "artifact.created"),
    ).toHaveLength(2);
    expect(replayEvents.at(-1)).toMatchObject({
      type: "proof_bundle.refreshed",
      payload: {
        artifactCount: 1,
        missingArtifactKinds: ["diff_summary", "test_report", "pr_link"],
        missionId: created.mission.id,
        status: "incomplete",
        trigger: "planner_evidence",
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
    const replayEvents = await replayService.getMissionEvents(
      created.mission.id,
    );

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
      type: "proof_bundle.refreshed",
      payload: {
        artifactCount: 1,
        missingArtifactKinds: ["diff_summary", "test_report", "pr_link"],
        missionId: created.mission.id,
        status: "incomplete",
        trigger: "planner_evidence",
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
    const missionArtifacts = await getArtifactsForMission(created.mission.id);
    const diffSummaryArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "diff_summary",
    );
    const testReportArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "test_report",
    );
    const replayEvents = await executorHarness.replayService.getMissionEvents(
      created.mission.id,
    );
    const executorWorkspace = await getWorkspaceByTaskId(created.tasks[1]!.id);

    expect(detail.tasks[1]).toMatchObject({
      id: created.tasks[1]!.id,
      status: "succeeded",
      summary: expect.stringContaining("Validation passed"),
    });
    expect(detail.mission.status).toBe("succeeded");
    expect(planArtifact?.id).toBeDefined();
    expect(diffSummaryArtifact).toBeDefined();
    expect(testReportArtifact).toBeDefined();
    expect(readArtifactMetadata(diffSummaryArtifact?.metadata)).toMatchObject({
      changedPaths: ["README.md"],
      diffCheckPassed: true,
      source: "executor_validation",
      threadId: "thread_executor_1",
      turnId: "turn_executor_1",
      validationStatus: "passed",
    });
    expect(readArtifactMetadata(testReportArtifact?.metadata)).toMatchObject({
      diffCheckPassed: true,
      source: "executor_validation",
      threadId: "thread_executor_1",
      turnId: "turn_executor_1",
      validationStatus: "passed",
    });
    expect(detail.proofBundle).toMatchObject({
      status: "ready",
    });
    expect(detail.proofBundle.artifactIds).toEqual(
      expect.arrayContaining([
        planArtifact!.id,
        diffSummaryArtifact!.id,
        testReportArtifact!.id,
      ]),
    );
    expect(detail.proofBundle.changeSummary).toContain("README.md");
    expect(detail.proofBundle.verificationSummary).toContain(
      "Local executor validation passed",
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: null,
        type: "mission.status_changed",
        payload: {
          from: "running",
          reason: "task_terminalized",
          to: "succeeded",
        },
      }),
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "artifact.created",
        payload: {
          artifactId: diffSummaryArtifact!.id,
          kind: "diff_summary",
        },
      }),
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "artifact.created",
        payload: {
          artifactId: testReportArtifact!.id,
          kind: "test_report",
        },
      }),
    );
    const executorCompletedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "task.status_changed" &&
        readArtifactMetadata(event.payload).reason === "runtime_turn_completed",
    );
    const diffArtifactCreatedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "artifact.created" &&
        readArtifactMetadata(event.payload).kind === "diff_summary",
    );
    const testArtifactCreatedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "artifact.created" &&
        readArtifactMetadata(event.payload).kind === "test_report",
    );
    expect(executorCompletedEvent.sequence).toBeLessThan(
      diffArtifactCreatedEvent.sequence,
    );
    expect(diffArtifactCreatedEvent.sequence).toBeLessThan(
      testArtifactCreatedEvent.sequence,
    );
    expect(
      await readFile(join(executorWorkspace!.rootPath, "README.md"), "utf8"),
    ).toContain("executor change");
  });

  it("publishes a successful executor run to a draft PR and persists the pr_link artifact", async () => {
    const sourceRepo = await createTempGitRepo();
    const workspaceRoot = await createTempWorkspaceRoot();
    const remote = await createTempBareRemote();
    cleanups.push(sourceRepo.cleanup, workspaceRoot.cleanup, remote.cleanup);

    const draftPullRequest = vi.fn().mockResolvedValue({
      draft: true,
      html_url: "https://github.com/616xold/pocket-cto/pull/77",
      number: 77,
    });
    const publishService = await createRealGitHubPublishService({
      createDraftPullRequest: draftPullRequest,
      remoteUrl: remote.remoteUrl,
    });
    const plannerHarness = await createHarness({
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    });
    const created = await plannerHarness.missionService.createFromText({
      text: "Publish a README change through the GitHub App flow",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    await setMissionAllowedPaths(created.mission.id, created.mission.spec, [
      "README.md",
    ]);
    await setMissionPrimaryRepo(
      created.mission.id,
      created.mission.spec,
      "pocket-cto",
    );
    await seedWritableRepository("616xold/pocket-cto");

    await plannerHarness.worker.run({
      log: silentLog(),
      pollIntervalMs: 1,
      runOnce: true,
    });

    const executorHarness = await createHarness({
      githubPublishService: publishService,
      runtimeCodexService: createFileWritingRuntimeService({
        finalReportText: [
          "## Intended change",
          "Apply the planner handoff to README and prepare it for operator review.",
          "",
          "## Files changed",
          "- README.md",
          "",
          "## Validations run",
          "- git diff --check",
          "",
          "## Remaining risks",
          "- review the published draft PR before merge",
          "",
          "## Operator handoff",
          "- ready for draft PR review",
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
      },
    });

    const detail = await executorHarness.missionService.getMissionDetail(
      created.mission.id,
    );
    const missionArtifacts = await getArtifactsForMission(created.mission.id);
    const prLinkArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "pr_link",
    );
    const replayEvents = await executorHarness.replayService.getMissionEvents(
      created.mission.id,
    );
    const branchName = `pocket-cto/${created.mission.id}/1-executor`;

    expect(detail.mission.status).toBe("succeeded");
    expect(prLinkArtifact).toBeDefined();
    expect(readArtifactMetadata(prLinkArtifact?.metadata)).toMatchObject({
      baseBranch: "main",
      branchName,
      draft: true,
      headBranch: branchName,
      prNumber: 77,
      prUrl: "https://github.com/616xold/pocket-cto/pull/77",
      repoFullName: "616xold/pocket-cto",
      source: "github_app_publish",
    });
    expect(detail.proofBundle.artifactIds).toContain(prLinkArtifact!.id);
    expect(detail.proofBundle.decisionTrace).toContain(
      `Executor task 1 opened draft PR #77 for 616xold/pocket-cto from branch ${branchName}.`,
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "artifact.created",
        payload: {
          artifactId: prLinkArtifact!.id,
          kind: "pr_link",
        },
      }),
    );
    expect(await remoteBranchExists(remote.remoteUrl, branchName)).toBe(true);
    expect(await readRemoteBranchSubject(remote.remoteUrl, branchName)).toBe(
      `pocket-cto: mission ${created.mission.id} task 1-executor`,
    );
    expect(draftPullRequest).toHaveBeenCalledWith(
      "installation-token-123",
      "616xold/pocket-cto",
      expect.objectContaining({
        baseBranch: "main",
        headBranch: branchName,
      }),
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

    await harness.missionRepository.updateTaskStatus(
      plannerTask.id,
      "succeeded",
    );
    await harness.missionRepository.updateTaskStatus(
      executorTask.id,
      "claimed",
    );

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

    const detail = await harness.missionService.getMissionDetail(
      created.mission.id,
    );
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
    const missionArtifacts = await getArtifactsForMission(created.mission.id);
    const diffSummaryArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "diff_summary",
    );
    const testReportArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "test_report",
    );
    const logExcerptArtifact = missionArtifacts.find(
      (artifact) => artifact.kind === "log_excerpt",
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
    expect(detail.mission.status).toBe("failed");
    expect(diffSummaryArtifact).toBeUndefined();
    expect(testReportArtifact).toBeDefined();
    expect(logExcerptArtifact).toBeDefined();
    expect(readArtifactMetadata(testReportArtifact?.metadata)).toMatchObject({
      failureCode: "no_changes",
      source: "executor_validation",
      validationStatus: "failed",
    });
    expect(readArtifactMetadata(logExcerptArtifact?.metadata)).toMatchObject({
      source: "runtime_executor_output",
      terminalTaskStatus: "failed",
      validationStatus: "failed",
    });
    expect(detail.proofBundle).toMatchObject({
      status: "failed",
    });
    expect(detail.proofBundle.artifactIds).toEqual(
      expect.arrayContaining([testReportArtifact!.id, logExcerptArtifact!.id]),
    );
    expect(detail.proofBundle.verificationSummary).toContain(
      "Local executor validation failed",
    );
    expect(detail.proofBundle.rollbackSummary).toContain("Safe fallback");
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: null,
        type: "mission.status_changed",
        payload: {
          from: "running",
          reason: "task_terminalized",
          to: "failed",
        },
      }),
    );
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
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "artifact.created",
        payload: {
          artifactId: testReportArtifact!.id,
          kind: "test_report",
        },
      }),
    );
    expect(replayEvents).toContainEqual(
      expect.objectContaining({
        taskId: created.tasks[1]!.id,
        type: "artifact.created",
        payload: {
          artifactId: logExcerptArtifact!.id,
          kind: "log_excerpt",
        },
      }),
    );
    const executorFailedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "task.status_changed" &&
        readArtifactMetadata(event.payload).reason === "executor_no_changes",
    );
    const testArtifactCreatedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "artifact.created" &&
        readArtifactMetadata(event.payload).kind === "test_report",
    );
    const logArtifactCreatedEvent = getRequiredReplayEvent(
      replayEvents,
      (event) =>
        event.taskId === created.tasks[1]!.id &&
        event.type === "artifact.created" &&
        readArtifactMetadata(event.payload).kind === "log_excerpt",
    );
    expect(executorFailedEvent.sequence).toBeLessThan(
      testArtifactCreatedEvent.sequence,
    );
    expect(testArtifactCreatedEvent.sequence).toBeLessThan(
      logArtifactCreatedEvent.sequence,
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
    const { missionService: failureMissionService, worker: failureWorker } =
      failureHarness;
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
    const { missionRepository, missionService, replayService, worker } =
      harness;
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
    await missionRepository.attachCodexThreadId(
      recoverableTask.id,
      "thread_gap_1",
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
        codexThreadId: "thread_gap_1",
      },
      turn: {
        recoveryStrategy: "direct_turn_start",
        threadId: "thread_gap_1",
        turnId: "turn_fake_123",
      },
    });

    const pendingDetail = await missionService.getMissionDetail(
      pendingMission.mission.id,
    );
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
    const { missionRepository, missionService, replayService, worker } =
      harness;
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

    const pendingDetail = await missionService.getMissionDetail(
      pendingMission.mission.id,
    );
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
    const { missionRepository, missionService, replayService, worker } =
      harness;
    const mission = await missionService.createFromText({
      text: "Do not replace a post-turn task",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const task = mission.tasks[0]!;

    await missionRepository.updateTaskStatus(task.id, "claimed");
    await missionRepository.attachCodexThreadId(
      task.id,
      "thread_do_not_replace_1",
    );
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

    const replayEvents = await replayService.getMissionEvents(
      mission.mission.id,
    );
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
  githubPublishService?: Pick<
    GitHubPublishService,
    "publishValidatedExecutorWorkspace"
  >;
  financeDiscoveryService?: Pick<FinanceDiscoveryService, "answerQuestion">;
  runtimeCodexService?: Pick<CodexRuntimeService, "runTurn">;
  sourceRepoRoot?: string;
  twinService?: {
    queryRepositoryBlastRadius: () => Promise<{
      repository: {
        fullName: string;
        installationId: string;
        defaultBranch: string;
        archived: boolean | null;
        disabled: boolean | null;
        isActive: boolean;
        writeReadiness: {
          ready: boolean;
          failureCode: null;
        };
      };
      queryEcho: {
        questionKind: "auth_change";
        changedPaths: string[];
      };
      unmatchedPaths: string[];
      impactedDirectories: Array<{
        path: string;
        label: string;
        classification: string;
        matchedChangedPaths: string[];
        ownershipState: "unknown";
        effectiveOwners: string[];
        appliedRule: null;
      }>;
      impactedManifests: [];
      ownersByTarget: [];
      relatedTestSuites: [];
      relatedMappedCiJobs: [];
      ciCoverageLimitations: [];
      freshness: {
        rollup: {
          state: "fresh";
          scorePercent: number;
          latestRunStatus: "succeeded";
          ageSeconds: number;
          staleAfterSeconds: number;
          reasonCode: string;
          reasonSummary: string;
          freshSliceCount: number;
          staleSliceCount: number;
          failedSliceCount: number;
          neverSyncedSliceCount: number;
          blockingSlices: [];
        };
        slices: ReturnType<typeof createTwinFreshnessSlices>;
      };
      limitations: [];
      answerSummary: string;
    }>;
  };
  validationService?: Pick<
    LocalExecutorValidationService,
    "validateExecutorTurn"
  >;
  workspaceRoot?: string;
}) {
  const sourceRepo = options?.sourceRepoRoot ? null : await createTempGitRepo();
  const workspaceRoot = options?.workspaceRoot
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
  const proofBundleAssembly = new ProofBundleAssemblyService({
    approvalRepository,
    missionRepository,
    replayService,
  });
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
    proofBundleAssembly,
  );
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    approvalService,
    runtimeCodexService,
    new EvidenceService(),
    workspaceService,
    options?.validationService ??
      new LocalExecutorValidationService(
        new LocalWorkspaceValidationGitClient(),
      ),
    options?.financeDiscoveryService ?? {
      async answerQuestion() {
        throw new Error("answerQuestion should not be called in this test");
      },
    },
    {
      async compileDraftReport() {
        throw new Error("compileDraftReport should not be called in this test");
      },
    },
    options?.twinService ?? {
      async queryRepositoryBlastRadius() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          queryEcho: {
            questionKind: "auth_change",
            changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
          },
          unmatchedPaths: [],
          impactedDirectories: [
            {
              path: "apps",
              label: "Apps",
              classification: "application_group",
              matchedChangedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
              ownershipState: "unknown" as const,
              effectiveOwners: [],
              appliedRule: null,
            },
          ],
          impactedManifests: [],
          ownersByTarget: [],
          relatedTestSuites: [],
          relatedMappedCiJobs: [],
          ciCoverageLimitations: [],
          freshness: {
            rollup: {
              state: "fresh" as const,
              scorePercent: 100,
              latestRunStatus: "succeeded" as const,
              ageSeconds: 10,
              staleAfterSeconds: 3600,
              reasonCode: "fresh",
              reasonSummary: "Stored twin state is fresh.",
              freshSliceCount: 6,
              staleSliceCount: 0,
              failedSliceCount: 0,
              neverSyncedSliceCount: 0,
              blockingSlices: [],
            },
            slices: createTwinFreshnessSlices(),
          },
          limitations: [],
          answerSummary:
            "Stored twin state shows apps as the only impacted directory for this auth change.",
        };
      },
    },
    options?.githubPublishService ?? {
      async publishValidatedExecutorWorkspace(
        input: Parameters<
          GitHubPublishService["publishValidatedExecutorWorkspace"]
        >[0],
      ) {
        return {
          baseBranch: "main",
          branchName:
            input.workspace.branchName ?? "pocket-cto/mission-123/1-executor",
          commitMessage: `pocket-cto: mission ${input.mission.id} task ${input.task.sequence}-${input.task.role}`,
          commitSha: "0123456789abcdef0123456789abcdef01234567",
          draft: true,
          headBranch:
            input.workspace.branchName ?? "pocket-cto/mission-123/1-executor",
          prBody: "stub pull request body",
          prNumber: 42,
          prTitle: `Pocket CTO: ${input.mission.title}`,
          prUrl: "https://github.com/616xold/pocket-cto/pull/42",
          publishedAt: "2026-03-15T00:00:00.000Z",
          repoFullName: input.mission.primaryRepo ?? "616xold/pocket-cto",
        };
      },
    },
    proofBundleAssembly,
  );
  const runtimeControlService = new RuntimeControlService(
    missionRepository,
    replayService,
    approvalService,
    liveSessionRegistry,
  );

  return {
    appContainer: {
      githubAppService: {
        async getRepository() {
          return {
            repository: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              installationId: "12345",
              githubRepositoryId: "100",
              fullName: "616xold/pocket-cto",
              ownerLogin: "616xold",
              name: "pocket-cto",
              defaultBranch: "main",
              visibility: "private" as const,
              archived: false,
              disabled: false,
              isActive: true,
              language: "TypeScript",
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              removedFromInstallationAt: null,
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          };
        },
        async listInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              createdAt: "2026-03-15T00:00:00.000Z",
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
            repositories: [],
          };
        },
        async listInstallations() {
          return [];
        },
        async listRepositories() {
          return {
            repositories: [],
          };
        },
        async resolveWritableRepository() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              createdAt: "2026-03-15T00:00:00.000Z",
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
            repository: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              installationId: "12345",
              installationRefId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              githubRepositoryId: "100",
              fullName: "616xold/pocket-cto",
              ownerLogin: "616xold",
              name: "pocket-cto",
              defaultBranch: "main",
              isPrivate: true,
              archived: false,
              disabled: false,
              isActive: true,
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              removedFromInstallationAt: null,
              language: "TypeScript",
              createdAt: "2026-03-15T00:00:00.000Z",
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
          };
        },
        async syncInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T00:00:00.000Z",
              createdAt: "2026-03-15T00:00:00.000Z",
              updatedAt: "2026-03-15T00:00:00.000Z",
            },
            syncedAt: "2026-03-15T00:00:00.000Z",
            syncedRepositoryCount: 0,
            activeRepositoryCount: 0,
            inactiveRepositoryCount: 0,
          };
        },
        async syncInstallations() {
          return {
            installations: [],
            syncedAt: "2026-03-15T00:00:00.000Z",
            syncedCount: 0,
          };
        },
        async syncRepositories() {
          return {
            installations: [],
            syncedAt: "2026-03-15T00:00:00.000Z",
            syncedInstallationCount: 0,
            syncedRepositoryCount: 0,
          };
        },
      },
      githubWebhookService: {
        async getDelivery() {
          return {
            delivery: {
              deliveryId: "delivery-test",
              eventName: "installation",
              action: "created",
              installationId: "12345",
              handledAs: "installation_state_updated" as const,
              receivedAt: "2026-03-15T00:00:00.000Z",
              persistedAt: "2026-03-15T00:00:00.000Z",
              payloadPreview: {
                accountLogin: "616xold",
                accountType: "Organization",
                targetType: "Organization",
              },
            },
          };
        },
        async ingest() {
          return {
            accepted: true as const,
            duplicate: false,
            deliveryId: "delivery-test",
            eventName: "installation",
            action: "created",
            handledAs: "installation_state_updated" as const,
            persistedAt: "2026-03-15T00:00:00.000Z",
          };
        },
        async listDeliveries() {
          return {
            deliveries: [],
          };
        },
      },
      githubIssueIntakeService: {
        async createMissionFromDelivery() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async listIssues() {
          return {
            issues: [],
          };
        },
      },
      financeTwinService: {
        async getBalanceBridgePrerequisites() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getAccountBridgeReadiness() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getAccountCatalog() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getBankAccounts() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCashPosture() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCollectionsPosture() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getPayablesAging() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getPayablesPosture() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCompanySnapshot() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getGeneralLedger() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getGeneralLedgerAccountBalanceProof() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getGeneralLedgerAccountActivityLineage() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCompanySummary() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getLineageDrill() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getReceivablesAging() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getReconciliationReadiness() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async syncCompanySourceFile() {
          throw new Error("Not implemented in orchestrator harness");
        },
      },
      cfoWikiService: {
        async bindCompanySource() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async compileCompanyWiki() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async createFiledPage() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async exportCompanyWiki() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCompanyExport() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getCompanySummary() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getIndexPage() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getLatestLint() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getLogPage() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getPage() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async listCompanyExports() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async listCompanySources() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async listFiledPages() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async runCompanyLint() {
          throw new Error("Not implemented in orchestrator harness");
        },
      } as AppContainer["cfoWikiService"],
      missionService,
      missionReportingActionsService: {
        async exportMarkdownBundle() {
          throw new Error(
            "exportMarkdownBundle should not be called in orchestrator harness",
          );
        },
        async fileDraftArtifacts() {
          throw new Error(
            "fileDraftArtifacts should not be called in orchestrator harness",
          );
        },
        async recordReleaseLog() {
          throw new Error(
            "recordReleaseLog should not be called in orchestrator harness",
          );
        },
        async requestReleaseApproval() {
          throw new Error(
            "requestReleaseApproval should not be called in orchestrator harness",
          );
        },
        async requestCirculationApproval() {
          throw new Error(
            "requestCirculationApproval should not be called in orchestrator harness",
          );
        },
      } as AppContainer["missionReportingActionsService"],
      operatorControl: {
        approvalService,
        liveControl: {
          enabled: true,
          limitation: "single_process_only" as const,
          mode: "embedded_worker" as const,
        },
        runtimeControlService,
      },
      replayService,
      sourceService: {
        async createSource() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getSource() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getSourceFile() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async getSourceIngestRun() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async ingestSourceFile() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async listSourceFiles() {
          return {
            fileCount: 0,
            files: [],
            sourceId: "00000000-0000-4000-8000-000000000000",
          };
        },
        async listSourceIngestRuns() {
          return {
            ingestRuns: [],
            runCount: 0,
            sourceFileId: "00000000-0000-4000-8000-000000000000",
          };
        },
        async listSources() {
          return {
            limit: 20,
            sourceCount: 0,
            sources: [],
          };
        },
        async registerSourceFile() {
          throw new Error("Not implemented in orchestrator harness");
        },
      },
      twinService: {
        async finishSyncRun() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async queryRepositoryBlastRadius() {
          throw new Error(
            "queryRepositoryBlastRadius should not be called in orchestrator harness",
          );
        },
        async getRepositoryDocSections() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            docsState: "not_synced" as const,
            counts: {
              docFileCount: 0,
              docSectionCount: 0,
            },
            sections: [],
          };
        },
        async getRepositoryRunbooks() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            freshness: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 86_400,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful runbooks sync has been recorded yet.",
            },
            runbookState: "not_synced" as const,
            counts: {
              runbookDocumentCount: 0,
              runbookStepCount: 0,
              commandFamilyCounts: {},
            },
            runbooks: [],
          };
        },
        async getRepositoryDocs() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            freshness: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 86_400,
              reasonCode: "not_synced",
              reasonSummary: "No successful docs sync has been recorded yet.",
            },
            docsState: "not_synced" as const,
            counts: {
              docFileCount: 0,
              docSectionCount: 0,
            },
            docs: [],
          };
        },
        async getRepositoryFreshness() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            rollup: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 21_600,
              reasonCode: "rollup_never_synced",
              reasonSummary:
                "No successful twin snapshot exists yet for: metadata, ownership, workflows, test suites, docs, runbooks.",
              freshSliceCount: 0,
              staleSliceCount: 0,
              failedSliceCount: 0,
              neverSyncedSliceCount: 6,
              blockingSlices: [
                "metadata",
                "ownership",
                "workflows",
                "testSuites",
                "docs",
                "runbooks",
              ] as Array<
                | "metadata"
                | "ownership"
                | "workflows"
                | "testSuites"
                | "docs"
                | "runbooks"
              >,
            },
            slices: {
              metadata: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 21_600,
                reasonCode: "not_synced",
                reasonSummary:
                  "No successful repository metadata sync has been recorded yet.",
              },
              ownership: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 43_200,
                reasonCode: "not_synced",
                reasonSummary:
                  "No successful ownership sync has been recorded yet.",
              },
              workflows: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 43_200,
                reasonCode: "not_synced",
                reasonSummary:
                  "No successful workflows sync has been recorded yet.",
              },
              testSuites: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 43_200,
                reasonCode: "not_synced",
                reasonSummary:
                  "No successful test suites sync has been recorded yet.",
              },
              docs: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 86_400,
                reasonCode: "not_synced",
                reasonSummary: "No successful docs sync has been recorded yet.",
              },
              runbooks: {
                state: "never_synced" as const,
                scorePercent: 0,
                latestRunId: null,
                latestRunStatus: null,
                latestCompletedAt: null,
                latestSuccessfulRunId: null,
                latestSuccessfulCompletedAt: null,
                ageSeconds: null,
                staleAfterSeconds: 86_400,
                reasonCode: "not_synced",
                reasonSummary:
                  "No successful runbooks sync has been recorded yet.",
              },
            },
          };
        },
        async getRepositoryOwners() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            codeownersFile: null,
            ownerCount: 0,
            owners: [],
          };
        },
        async getRepositoryMetadataSummary() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            freshness: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 21_600,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful repository metadata sync has been recorded yet.",
            },
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
            metadata: {
              repository: null,
              defaultBranch: null,
              rootReadme: null,
              manifests: [],
              directories: [],
            },
          };
        },
        async getRepositoryWorkflows() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            workflowState: "not_synced" as const,
            counts: {
              workflowFileCount: 0,
              workflowCount: 0,
              jobCount: 0,
            },
            workflows: [],
          };
        },
        async getRepositoryTestSuites() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            testSuiteState: "not_synced" as const,
            counts: {
              testSuiteCount: 0,
              mappedJobCount: 0,
              unmappedJobCount: 0,
            },
            testSuites: [],
            unmappedJobs: [],
          };
        },
        async getRepositoryCiSummary() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestWorkflowRun: null,
            latestTestSuiteRun: null,
            freshness: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 43_200,
              reasonCode: "rollup_never_synced",
              reasonSummary:
                "No successful twin snapshot exists yet for: workflows, test suites.",
            },
            workflowState: "not_synced" as const,
            testSuiteState: "not_synced" as const,
            counts: {
              workflowFileCount: 0,
              workflowCount: 0,
              jobCount: 0,
              testSuiteCount: 0,
              mappedJobCount: 0,
              unmappedJobCount: 0,
            },
            testSuites: [],
            unmappedJobs: [],
          };
        },
        async getRepositoryOwnershipSummary() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            freshness: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunStatus: null,
              ageSeconds: null,
              staleAfterSeconds: 43_200,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful ownership sync has been recorded yet.",
            },
            ownershipState: "not_synced" as const,
            codeownersFile: null,
            counts: {
              ruleCount: 0,
              ownerCount: 0,
              directoryCount: 0,
              manifestCount: 0,
              ownedDirectoryCount: 0,
              ownedManifestCount: 0,
              unownedDirectoryCount: 0,
              unownedManifestCount: 0,
            },
            ownedDirectories: [],
            ownedManifests: [],
            unownedDirectories: [],
            unownedManifests: [],
          };
        },
        async getRepositoryOwnershipRules() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            latestRun: null,
            codeownersFile: null,
            ruleCount: 0,
            ownerCount: 0,
            rules: [],
          };
        },
        async listRepositoryEdges() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            edgeCount: 0,
            edges: [],
          };
        },
        async listRepositoryEntities() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            entityCount: 0,
            entities: [],
          };
        },
        async listRepositoryRuns() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            runCount: 0,
            runs: [],
          };
        },
        async startSyncRun() {
          return {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            repoFullName: "616xold/pocket-cto",
            extractor: "synthetic",
            status: "running" as const,
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: null,
            stats: {},
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          };
        },
        async syncRepositoryMetadata() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              repoFullName: "616xold/pocket-cto",
              extractor: "repository_metadata",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
          };
        },
        async syncRepositoryWorkflows() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              repoFullName: "616xold/pocket-cto",
              extractor: "repository_workflows",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
                workflowFileCount: 0,
                workflowCount: 0,
                jobCount: 0,
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            workflowState: "no_workflow_files" as const,
            workflowFileCount: 0,
            workflowCount: 0,
            jobCount: 0,
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
          };
        },
        async syncRepositoryTestSuites() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              repoFullName: "616xold/pocket-cto",
              extractor: "repository_test_suites",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
                jobCount: 0,
                testSuiteCount: 0,
                mappedJobCount: 0,
                unmappedJobCount: 0,
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            testSuiteState: "no_test_suites" as const,
            testSuiteCount: 0,
            jobCount: 0,
            mappedJobCount: 0,
            unmappedJobCount: 0,
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
          };
        },
        async syncRepositoryDocs() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
              repoFullName: "616xold/pocket-cto",
              extractor: "repository_docs",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
                docFileCount: 0,
                docSectionCount: 0,
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            docsState: "no_docs" as const,
            docFileCount: 0,
            docSectionCount: 0,
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
          };
        },
        async syncRepositoryRunbooks() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
              repoFullName: "616xold/pocket-cto",
              extractor: "repository_runbooks",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
                runbookDocumentCount: 0,
                runbookStepCount: 0,
                commandFamilyCounts: {},
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            runbookState: "no_runbooks" as const,
            runbookDocumentCount: 0,
            runbookStepCount: 0,
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
            commandFamilyCounts: {},
          };
        },
        async syncRepositoryOwnership() {
          return {
            repository: {
              fullName: "616xold/pocket-cto",
              installationId: "12345",
              defaultBranch: "main",
              archived: false,
              disabled: false,
              isActive: true,
              writeReadiness: {
                ready: true,
                failureCode: null,
              },
            },
            syncRun: {
              id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              repoFullName: "616xold/pocket-cto",
              extractor: "codeowners_ownership",
              status: "succeeded" as const,
              startedAt: "2026-03-15T00:00:00.000Z",
              completedAt: "2026-03-15T00:01:00.000Z",
              stats: {
                entityCount: 0,
                edgeCount: 0,
                codeownersFileCount: 0,
                ruleCount: 0,
                ownerCount: 0,
              },
              errorSummary: null,
              createdAt: "2026-03-15T00:00:00.000Z",
            },
            codeownersFilePath: null,
            ruleCount: 0,
            ownerCount: 0,
            entityCount: 0,
            edgeCount: 0,
            entityCountsByKind: {},
            edgeCountsByKind: {},
          };
        },
        async upsertEdge() {
          throw new Error("Not implemented in orchestrator harness");
        },
        async upsertEntity() {
          throw new Error("Not implemented in orchestrator harness");
        },
      },
    },
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

function createTwinFreshnessSlices() {
  return {
    metadata: createTwinFreshnessSlice(),
    ownership: createTwinFreshnessSlice(),
    workflows: createTwinFreshnessSlice(),
    testSuites: createTwinFreshnessSlice(),
    docs: createTwinFreshnessSlice(),
    runbooks: createTwinFreshnessSlice(),
  };
}

function createTwinFreshnessSlice() {
  return {
    state: "fresh" as const,
    scorePercent: 100,
    latestRunStatus: "succeeded" as const,
    ageSeconds: 10,
    staleAfterSeconds: 3600,
    reasonCode: "fresh",
    reasonSummary: "Stored twin state is fresh.",
    latestRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    latestCompletedAt: "2026-03-20T00:15:00.000Z",
    latestSuccessfulRunId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    latestSuccessfulCompletedAt: "2026-03-20T00:15:00.000Z",
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

async function getArtifactsForMission(missionId: string) {
  return db.select().from(artifacts).where(eq(artifacts.missionId, missionId));
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
  return waitForValue({
    description: `task ${taskId} to persist a pending approval`,
    inspect: async () => {
      const rows = await db
        .select({
          id: approvals.id,
          status: approvals.status,
          taskId: approvals.taskId,
          updatedAt: approvals.updatedAt,
        })
        .from(approvals)
        .where(eq(approvals.taskId, taskId));

      return rows.map((approval) => ({
        ...approval,
        updatedAt: approval.updatedAt.toISOString(),
      }));
    },
    read: async () => {
      const [approval] = await db
        .select()
        .from(approvals)
        .where(
          and(eq(approvals.taskId, taskId), eq(approvals.status, "pending")),
        )
        .limit(1);

      return approval
        ? {
            ...approval,
            createdAt: approval.createdAt.toISOString(),
            updatedAt: approval.updatedAt.toISOString(),
          }
        : null;
    },
  });
}

async function waitForTaskStatus(
  missionService: MissionService,
  missionId: string,
  taskId: string,
  status: string,
) {
  return waitForValue({
    description: `task ${taskId} to reach status ${status}`,
    inspect: async () => {
      const detail = await missionService.getMissionDetail(missionId);
      const task = detail.tasks.find((candidate) => candidate.id === taskId);

      return {
        missionStatus: detail.mission.status,
        taskStatus: task?.status ?? null,
      };
    },
    read: async () => {
      const detail = await missionService.getMissionDetail(missionId);
      const task = detail.tasks.find((candidate) => candidate.id === taskId);

      return task?.status === status ? detail : null;
    },
  });
}

function getRequiredReplayEvent(
  events: ReplayEvent[],
  predicate: (event: ReplayEvent) => boolean,
) {
  const event = events.find(predicate);

  if (!event) {
    throw new Error("Expected replay event was not found");
  }

  return event;
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

async function setMissionPrimaryRepo(
  missionId: string,
  spec: MissionRecord["spec"],
  primaryRepo: string,
) {
  await db
    .update(missions)
    .set({
      primaryRepo,
      spec: {
        ...spec,
        repos: [primaryRepo],
      },
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId));
}

async function seedWritableRepository(fullName: string) {
  const repository = new DrizzleGitHubAppRepository(db);
  const [ownerLogin, name] = fullName.split("/");

  await repository.upsertInstallation({
    installationId: "12345",
    appId: "98765",
    accountLogin: ownerLogin ?? "616xold",
    accountType: "Organization",
    targetType: "Organization",
    targetId: "6161234",
    suspendedAt: null,
    permissions: {
      contents: "write",
      metadata: "read",
      pull_requests: "write",
    },
  });
  await repository.upsertInstallationRepositories({
    installationId: "12345",
    lastSyncedAt: "2026-03-15T00:00:00.000Z",
    repositories: [
      {
        githubRepositoryId: "100",
        fullName,
        ownerLogin: ownerLogin ?? "616xold",
        name: name ?? "pocket-cto",
        defaultBranch: "main",
        isPrivate: true,
        archived: false,
        disabled: false,
        language: "TypeScript",
      },
    ],
  });
}

async function createRealGitHubPublishService(input: {
  createDraftPullRequest: ReturnType<typeof vi.fn>;
  remoteUrl: string;
}) {
  const repository = new DrizzleGitHubAppRepository(db);
  const githubAppService = new GitHubAppService({
    client: {
      createInstallationAccessToken: vi.fn().mockResolvedValue({
        expiresAt: "2026-03-16T00:00:00.000Z",
        installationId: "12345",
        permissions: {
          contents: "write",
          metadata: "read",
          pull_requests: "write",
        },
        token: "installation-token-123",
      }),
      listInstallationRepositories: vi.fn(),
      listInstallations: vi.fn(),
    },
    config: {
      status: "configured",
      config: {
        apiBaseUrl: "https://api.github.com",
        appId: "98765",
        clientId: null,
        clientSecret: null,
        privateKeyBase64: Buffer.from("unused").toString("base64"),
      },
    },
    repository,
    tokenCache: new InMemoryInstallationTokenCache(),
  });

  return new RealGitHubPublishService({
    apiClient: {
      branchExists: vi.fn().mockResolvedValue(false),
      createDraftPullRequest: input.createDraftPullRequest,
    },
    gitClient: new LocalGitHubWriteClient(),
    remoteUrlFactory: () => input.remoteUrl,
    targetResolver: githubAppService,
  });
}

async function createTempBareRemote() {
  const remoteRoot = await mkdtemp(join(tmpdir(), "pocket-cto-remote-"));
  await execFile("git", ["init", "--bare", "-q", remoteRoot]);

  return {
    async cleanup() {
      await rm(remoteRoot, {
        force: true,
        recursive: true,
      });
    },
    remoteUrl: await realpath(remoteRoot),
  };
}

async function remoteBranchExists(remoteUrl: string, branchName: string) {
  try {
    await execFile("git", [
      "--git-dir",
      remoteUrl,
      "show-ref",
      "--verify",
      "--quiet",
      `refs/heads/${branchName}`,
    ]);

    return true;
  } catch {
    return false;
  }
}

async function readRemoteBranchSubject(remoteUrl: string, branchName: string) {
  const result = await execFile("git", [
    "--git-dir",
    remoteUrl,
    "log",
    "-1",
    "--format=%s",
    branchName,
  ]);

  return result.stdout.trim();
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
