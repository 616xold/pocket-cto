import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { and, count, eq } from "drizzle-orm";
import { artifacts, workspaces } from "@pocket-cto/db";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { EvidenceService } from "../evidence/service";
import { StubMissionCompiler } from "../missions/compiler";
import { DrizzleMissionRepository } from "../missions/drizzle-repository";
import { MissionService } from "../missions/service";
import { DrizzleReplayRepository } from "../replay/drizzle-repository";
import { ReplayService } from "../replay/service";
import { RuntimeCodexAdapter } from "../runtime-codex/adapter";
import {
  resolveCodexRuntimeClientOptions,
  resolveCodexThreadDefaults,
} from "../runtime-codex/config";
import { CodexRuntimeService } from "../runtime-codex/service";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
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
      source: "runtime_codex_planner",
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
      | "thread-start-error"
      | "turn-completed-failed"
      | "turn-start-error"
      | "resume-gap-direct-turn-success"
      | "resume-gap-direct-turn-failed";
    threadId?: string;
  };
  runtimeCodexService?: Pick<CodexRuntimeService, "runTurn">;
  sourceRepoRoot?: string;
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

  const missionRepository = new DrizzleMissionRepository(db);
  const replayRepository = new DrizzleReplayRepository(db);
  const workspaceRepository = new DrizzleWorkspaceRepository(db);
  const replayService = new ReplayService(replayRepository, missionRepository);
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
    );
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    runtimeCodexService,
    new EvidenceService(),
    workspaceService,
  );

  return {
    async cleanup() {
      await workspaceRoot?.cleanup();
      await sourceRepo?.cleanup();
    },
    missionRepository,
    missionService,
    replayService,
    sourceRepoRoot,
    workspaceRoot: resolvedWorkspaceRoot,
    worker: new OrchestratorWorker(orchestratorService),
  };
}

function buildFixtureArgs(options?: {
  mode?:
    | "success"
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

function readArtifactMetadata(metadata: unknown) {
  return typeof metadata === "object" && metadata !== null
    ? (metadata as Record<string, unknown>)
    : {};
}
