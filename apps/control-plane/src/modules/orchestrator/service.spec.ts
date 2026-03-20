import { setTimeout as delay } from "node:timers/promises";
import type {
  TwinBlastRadiusLimitation,
  TwinFreshnessSlice,
  TwinFreshnessSliceName,
  TwinRepositoryBlastRadiusQueryResult,
  TwinRepositoryFreshnessView,
} from "@pocket-cto/domain";
import { describe, expect, it, vi } from "vitest";
import { InMemoryApprovalRepository } from "../approvals/repository";
import { ApprovalService } from "../approvals/service";
import { readDiscoveryAnswerArtifactMetadata } from "../evidence/discovery-answer";
import { ProofBundleAssemblyService } from "../evidence/proof-bundle-assembly";
import { EvidenceService } from "../evidence/service";
import { GitHubRepositoryNotFoundError } from "../github-app/errors";
import { StubMissionCompiler } from "../missions/compiler";
import { InMemoryMissionRepository } from "../missions/repository";
import { MissionService } from "../missions/service";
import { InMemoryReplayRepository } from "../replay/repository";
import { ReplayService } from "../replay/service";
import { RuntimeControlService } from "../runtime-codex/control-service";
import { InMemoryRuntimeSessionRegistry } from "../runtime-codex/live-session-registry";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { TwinService } from "../twin/service";
import type { ExecutorValidationService } from "../validation";
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

  it("keeps planner turns read-only and runs executor turns with workspace-write policy plus workspace cwd", async () => {
    const observedInputs: Array<{
      approvalPolicy: string | undefined;
      cwd: string | null | undefined;
      sandboxPolicy: unknown;
      text: string;
    }> = [];
    const { missionService, worker } = createHarness({
      runtimeCodexService: {
        async runTurn(input, observer = {}) {
          observedInputs.push({
            approvalPolicy:
              typeof input.approvalPolicy === "string"
                ? input.approvalPolicy
                : undefined,
            cwd: input.cwd,
            sandboxPolicy: input.sandboxPolicy,
            text:
              input.input[0]?.type === "text"
                ? input.input[0].text
                : "",
          });

          return createCompletedTurnResult(input, observer, observedInputs.length);
        },
      },
      validationService: {
        async validateExecutorTurn() {
          return {
            changedPaths: ["README.md"],
            checks: [],
            diffCheckOutput: null,
            diffCheckPassed: true,
            escapedPaths: [],
            failureCode: "none" as const,
            status: "passed" as const,
          };
        },
      },
    });
    const created = await missionService.createFromText({
      text: "Implement passkeys with a planner handoff first",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    await worker.run({
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      pollIntervalMs: 1,
      runOnce: true,
    });
    const secondTick = await worker.run({
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(observedInputs).toHaveLength(2);
    expect(observedInputs[0]).toMatchObject({
      approvalPolicy: "never",
      sandboxPolicy: {
        type: "readOnly",
        networkAccess: false,
      },
    });
    expect(observedInputs[0]?.text).toContain(
      "You are the Pocket CTO planner task. Produce a read-only implementation plan only.",
    );
    expect(observedInputs[1]).toMatchObject({
      approvalPolicy: "on-request",
      sandboxPolicy: {
        type: "workspaceWrite",
        writableRoots: [
          `/tmp/pocket-cto-worker-spec-workspaces/${created.mission.id}/1-executor`,
        ],
        networkAccess: false,
      },
    });
    expect(observedInputs[1]?.cwd).toBe(
      `/tmp/pocket-cto-worker-spec-workspaces/${created.mission.id}/1-executor`,
    );
    expect(observedInputs[1]?.text).toContain(
      "You are the Pocket CTO executor task. Implement the approved change only inside the assigned task workspace.",
    );
    expect(observedInputs[1]?.text).toContain("Planner artifact id:");
    expect(secondTick).toMatchObject({
      kind: "turn_completed",
      task: {
        role: "executor",
        status: "succeeded",
        summary: expect.stringContaining("Validation passed"),
      },
    });
  });

  it("fails executor tasks explicitly when no planner artifact is available", async () => {
    const { missionRepository, missionService, worker } = createHarness();
    const log = {
      error: vi.fn(),
      info: vi.fn(),
    };
    const created = await missionService.createFromText({
      text: "Do not let the executor run without a plan artifact",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;
    const executorTask = created.tasks[1]!;

    await missionRepository.updateTaskStatus(plannerTask.id, "succeeded");
    await missionRepository.updateTaskStatus(executorTask.id, "claimed");

    const tick = await worker.run({
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
        summary: "Executor could not start because no planner plan artifact was available for handoff.",
      },
    });
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

  it("keeps true runtime exceptions classified as runtime_failed", async () => {
    const log = {
      error: vi.fn(),
      info: vi.fn(),
    };
    const { missionService, worker } = createHarness({
      runtimeCodexService: {
        async runTurn() {
          throw new Error("codex transport crashed");
        },
      },
    });
    const created = await missionService.createFromText({
      text: "Surface real runtime failures distinctly",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const plannerTask = created.tasks[0]!;

    const tick = await worker.run({
      log,
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "runtime_failed",
      task: {
        id: plannerTask.id,
        role: "planner",
        status: "claimed",
      },
    });
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        missionId: created.mission.id,
        outcome: "runtime_failed",
        taskId: plannerTask.id,
      }),
      "Worker failed during Codex runtime processing",
    );
  });

  it("executes discovery missions through TwinService, not Codex runtime, and stores a durable answer artifact", async () => {
    const runtimeRunTurn = vi.fn(async () => {
      throw new Error("runtime should not be called for discovery");
    });
    const queryRepositoryBlastRadius = vi.fn(async () =>
      createDiscoveryQueryResult({
        limitations: [
          {
            code: "repository_freshness_stale",
            summary: "Stored workflow and test-suite state is stale.",
            changedPaths: [],
            targetPaths: [],
            manifestPaths: [],
            jobKeys: [],
            reasonCodes: [],
            sliceNames: ["workflows", "testSuites"],
          },
        ],
        rollupState: "stale",
        rollupReasonCode: "stale_twin_state",
        rollupReasonSummary:
          "Stored twin state is stale for: workflows, testSuites.",
      }),
    );
    const { missionRepository, missionService, worker } = createHarness({
      runtimeCodexService: {
        runTurn: runtimeRunTurn,
      },
      twinService: {
        queryRepositoryBlastRadius,
      },
    });
    const created = await missionService.createDiscovery({
      repoFullName: "616xold/pocket-cto",
      questionKind: "auth_change",
      changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
      requestedBy: "operator",
    });

    const tick = await worker.run({
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      pollIntervalMs: 1,
      runOnce: true,
    });

    expect(tick).toMatchObject({
      kind: "task_completed",
      task: {
        role: "scout",
        status: "succeeded",
      },
    });
    expect(runtimeRunTurn).not.toHaveBeenCalled();
    expect(queryRepositoryBlastRadius).toHaveBeenCalledWith(
      "616xold/pocket-cto",
      {
        questionKind: "auth_change",
        changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
      },
    );

    const artifacts = await missionRepository.listArtifactsByMissionId(
      created.mission.id,
    );
    const discoveryArtifact =
      artifacts.find((artifact) => artifact.kind === "discovery_answer") ?? null;
    const metadata = readDiscoveryAnswerArtifactMetadata(discoveryArtifact);
    const detail = await missionService.getMissionDetail(created.mission.id);

    expect(metadata).toMatchObject({
      repoFullName: "616xold/pocket-cto",
      questionKind: "auth_change",
      answerSummary:
        "Stored twin state shows apps as the main impacted directory for this auth change.",
      freshnessRollup: {
        state: "stale",
      },
      limitations: [
        expect.objectContaining({
          code: "repository_freshness_stale",
        }),
      ],
    });
    expect(detail.proofBundle.status).toBe("ready");
    expect(detail.discoveryAnswer).toMatchObject({
      repoFullName: "616xold/pocket-cto",
      questionKind: "auth_change",
      changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
      freshnessRollup: {
        state: "stale",
      },
    });
    expect(detail.artifacts.map((artifact) => artifact.kind)).toEqual([
      "proof_bundle_manifest",
      "discovery_answer",
    ]);
  });

  it("fails discovery missions explicitly when the target repository is unavailable", async () => {
    const runtimeRunTurn = vi.fn(async () => {
      throw new Error("runtime should not be called for discovery");
    });
    const { missionService, worker } = createHarness({
      runtimeCodexService: {
        runTurn: runtimeRunTurn,
      },
      twinService: {
        async queryRepositoryBlastRadius() {
          throw new GitHubRepositoryNotFoundError("missing/repo");
        },
      },
    });
    const created = await missionService.createDiscovery({
      repoFullName: "missing/repo",
      questionKind: "auth_change",
      changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
      requestedBy: "operator",
    });

    const tick = await worker.run({
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
      pollIntervalMs: 1,
      runOnce: true,
    });
    const detail = await missionService.getMissionDetail(created.mission.id);

    expect(tick).toMatchObject({
      kind: "task_failed",
      stage: "discovery_execution",
      task: {
        role: "scout",
        status: "failed",
      },
    });
    expect(runtimeRunTurn).not.toHaveBeenCalled();
    expect(detail.mission.status).toBe("failed");
    expect(detail.tasks[0]).toMatchObject({
      status: "failed",
      summary: "Discovery execution failed: GitHub repository not found",
    });
    expect(detail.proofBundle.status).toBe("failed");
  });
});

function createHarness(options?: {
  runtimeCodexService?: Pick<OrchestratorServiceRuntimeDeps, "runTurn">;
  twinService?: Pick<TwinService, "queryRepositoryBlastRadius">;
  validationService?: Pick<ExecutorValidationService, "validateExecutorTurn">;
}) {
  const missionRepository = new InMemoryMissionRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  const replayRepository = new InMemoryReplayRepository();
  const replayService = new ReplayService(replayRepository, missionRepository);
  const evidenceService = new EvidenceService();
  const missionService = new MissionService(
    new StubMissionCompiler(),
    missionRepository,
    replayService,
    evidenceService,
  );
  const liveSessionRegistry = new InMemoryRuntimeSessionRegistry();
  const proofBundleAssembly = new ProofBundleAssemblyService({
    approvalRepository,
    missionRepository,
    replayService,
  });
  const approvalService = new ApprovalService(
    approvalRepository,
    missionRepository,
    replayService,
    liveSessionRegistry,
    proofBundleAssembly,
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
  const runtimeCodexService =
    options?.runtimeCodexService ??
    {
      async runTurn(input, observer = {}) {
        turnCount += 1;
        return createCompletedTurnResult(
          input,
          observer,
          turnCount,
          input.threadId ?? `thread_${++threadCount}`,
        );
      },
    };
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    approvalService,
    runtimeCodexService,
    evidenceService,
    workspaceService,
    options?.validationService ?? createValidationService(),
    options?.twinService ?? {
      async queryRepositoryBlastRadius() {
        return createDiscoveryQueryResult();
      },
    },
    {
      async publishValidatedExecutorWorkspace() {
        return {
          baseBranch: "main",
          branchName: "pocket-cto/mission-123/1-executor",
          commitMessage: "pocket-cto: mission mission-123 task 1-executor",
          commitSha: "0123456789abcdef0123456789abcdef01234567",
          draft: true,
          headBranch: "pocket-cto/mission-123/1-executor",
          prBody: "stub pull request body",
          prNumber: 42,
          prTitle: "Pocket CTO: stub PR",
          prUrl: "https://github.com/616xold/pocket-cto/pull/42",
          publishedAt: "2026-03-15T00:00:00.000Z",
          repoFullName: "616xold/pocket-cto",
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
    approvalService,
    missionRepository,
    missionService,
    replayService,
    runtimeControlService,
    worker: new OrchestratorWorker(orchestratorService, {
      approvalService,
      runtimeControlService,
    }),
  };
}

type OrchestratorServiceRuntimeDeps = ConstructorParameters<
  typeof OrchestratorService
>[3];

function createFreshnessSlices(): TwinRepositoryFreshnessView["slices"] {
  return {
    metadata: createFreshnessSlice(),
    ownership: createFreshnessSlice(),
    workflows: createFreshnessSlice(),
    testSuites: createFreshnessSlice(),
    docs: createFreshnessSlice(),
    runbooks: createFreshnessSlice(),
  };
}

function createFreshnessSlice(): TwinFreshnessSlice {
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

function createDiscoveryQueryResult(input?: {
  limitations?: TwinBlastRadiusLimitation[];
  rollupReasonCode?: string;
  rollupReasonSummary?: string;
  rollupState?: "failed" | "fresh" | "never_synced" | "stale";
}): TwinRepositoryBlastRadiusQueryResult {
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
      questionKind: "auth_change" as const,
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
        state: input?.rollupState ?? "fresh",
        scorePercent: input?.rollupState === "stale" ? 72 : 100,
        latestRunStatus: "succeeded" as const,
        ageSeconds: 10,
        staleAfterSeconds: 3600,
        reasonCode: input?.rollupReasonCode ?? "fresh",
        reasonSummary:
          input?.rollupReasonSummary ?? "Stored twin state is fresh.",
        freshSliceCount: input?.rollupState === "stale" ? 4 : 6,
        staleSliceCount: input?.rollupState === "stale" ? 2 : 0,
        failedSliceCount: 0,
        neverSyncedSliceCount: 0,
        blockingSlices:
          input?.rollupState === "stale"
            ? (["workflows", "testSuites"] satisfies TwinFreshnessSliceName[])
            : [],
      },
      slices: createFreshnessSlices(),
    },
    limitations: input?.limitations ?? [],
    answerSummary:
      "Stored twin state shows apps as the main impacted directory for this auth change.",
  };
}

async function createCompletedTurnResult(
  input: Parameters<OrchestratorServiceRuntimeDeps["runTurn"]>[0],
  observer: Parameters<OrchestratorServiceRuntimeDeps["runTurn"]>[1],
  turnNumber: number,
  bootstrapThreadId?: string,
): Promise<RuntimeCodexRunTurnResult> {
  const threadId = input.threadId ?? bootstrapThreadId ?? `thread_${turnNumber}`;
  const turnId = `turn_${turnNumber}`;
  const recoveryStrategy = input.threadId
    ? "resumed_thread"
    : "same_session_bootstrap";
  const itemTypes =
    input.input[0]?.type === "text" &&
    input.input[0].text.includes("executor task")
      ? ["agentMessage"]
      : ["plan", "agentMessage"];
  const items = itemTypes.flatMap((itemType) => [
    {
      itemId: `item_${itemType}_${turnNumber}`,
      itemType,
      phase: "started" as const,
      threadId,
      turnId,
    },
    {
      itemId: `item_${itemType}_${turnNumber}`,
      itemType,
      phase: "completed" as const,
      threadId,
      turnId,
    },
  ]);

  if (!input.threadId) {
    await observer?.onThreadStarted?.({
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

  await observer?.onTurnStarted?.({
    recoveryStrategy,
    threadId,
    turnId,
  });

  for (const item of items) {
    if (item.phase === "started") {
      await observer?.onItemStarted?.(item);
    } else {
      await observer?.onItemCompleted?.(item);
    }
  }

  const isExecutor =
    input.input[0]?.type === "text" &&
    input.input[0].text.includes("executor task");

  return {
    completedAgentMessages: [
      {
        itemId: isExecutor
          ? `item_agentMessage_${turnNumber}`
          : `item_agentMessage_${turnNumber}`,
        text: isExecutor
          ? [
              "## Intended change",
              "Apply the planner handoff inside the allowed workspace paths.",
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
            ].join("\n")
          : [
              "## Objective understanding",
              "Inspect the current task without making any changes.",
            ].join("\n"),
        threadId,
        turnId,
      },
    ],
    completedTextOutputs: isExecutor
      ? [
          {
            itemId: `item_agentMessage_${turnNumber}`,
            itemType: "agentMessage",
            text: [
              "## Intended change",
              "Apply the planner handoff inside the allowed workspace paths.",
            ].join("\n"),
            threadId,
            turnId,
          },
        ]
      : [
          {
            itemId: `item_plan_${turnNumber}`,
            itemType: "plan",
            text: "Inspect repository state and propose next steps without changing files.",
            threadId,
            turnId,
          },
          {
            itemId: `item_agentMessage_${turnNumber}`,
            itemType: "agentMessage",
            text: [
              "## Objective understanding",
              "Inspect the current task without making any changes.",
            ].join("\n"),
            threadId,
            turnId,
          },
        ],
    finalAgentMessageText: isExecutor
      ? [
          "## Intended change",
          "Apply the planner handoff inside the allowed workspace paths.",
        ].join("\n")
      : [
          "## Objective understanding",
          "Inspect the current task without making any changes.",
        ].join("\n"),
    firstItemType: items[0]?.itemType ?? null,
    items,
    lastItemType: items[items.length - 1]?.itemType ?? null,
    recoveryStrategy,
    status: "completed",
    threadId,
    turnId,
  };
}

function createValidationService(): Pick<
  ExecutorValidationService,
  "validateExecutorTurn"
> {
  return {
    async validateExecutorTurn() {
      return {
        changedPaths: ["README.md"],
        checks: [],
        diffCheckOutput: null,
        diffCheckPassed: true,
        escapedPaths: [],
        failureCode: "none" as const,
        status: "passed" as const,
      };
    },
  };
}
