import { loadEnv } from "@pocket-cto/config";
import { createDb } from "@pocket-cto/db";
import type { AppContainer, WorkerContainer } from "./lib/types";
import { DrizzleApprovalRepository } from "./modules/approvals/drizzle-repository";
import { ApprovalService } from "./modules/approvals/service";
import { EvidenceService } from "./modules/evidence/service";
import { StubMissionCompiler } from "./modules/missions/compiler";
import { DrizzleMissionRepository } from "./modules/missions/drizzle-repository";
import { InMemoryMissionRepository } from "./modules/missions/repository";
import { MissionService } from "./modules/missions/service";
import { OrchestratorService } from "./modules/orchestrator/service";
import { OrchestratorWorker } from "./modules/orchestrator/worker";
import { DrizzleReplayRepository } from "./modules/replay/drizzle-repository";
import { InMemoryReplayRepository } from "./modules/replay/repository";
import { ReplayService } from "./modules/replay/service";
import { RuntimeCodexAdapter } from "./modules/runtime-codex/adapter";
import { RuntimeControlService } from "./modules/runtime-codex/control-service";
import {
  resolveCodexRuntimeClientOptions,
  resolveCodexThreadDefaults,
} from "./modules/runtime-codex/config";
import { InMemoryRuntimeSessionRegistry } from "./modules/runtime-codex/live-session-registry";
import { CodexRuntimeService } from "./modules/runtime-codex/service";
import {
  buildDefaultWorkspaceRoot,
  DrizzleWorkspaceRepository,
  InMemoryWorkspaceRepository,
  LocalWorkspaceGitManager,
  resolveWorkspaceServiceConfig,
  WorkspaceService,
} from "./modules/workspaces";
import {
  LocalExecutorValidationService,
  LocalWorkspaceValidationGitClient,
} from "./modules/validation";

export async function createContainer(): Promise<AppContainer> {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);

  return buildAppContainer({
    missionRepository: new DrizzleMissionRepository(db),
    replayRepository: new DrizzleReplayRepository(db),
  });
}

export async function createWorkerContainer(): Promise<WorkerContainer> {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);
  const missionRepository = new DrizzleMissionRepository(db);
  const approvalRepository = new DrizzleApprovalRepository(db);
  const replayRepository = new DrizzleReplayRepository(db);
  const workspaceRepository = new DrizzleWorkspaceRepository(db);
  const replayService = new ReplayService(replayRepository, missionRepository);
  const evidenceService = new EvidenceService();
  const liveSessionRegistry = new InMemoryRuntimeSessionRegistry();
  const gitManager = new LocalWorkspaceGitManager();
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    gitManager,
    await resolveWorkspaceServiceConfig({
      env,
      gitManager,
      processCwd: process.cwd(),
    }),
  );

  const runtimeCodexService = new CodexRuntimeService(
    new RuntimeCodexAdapter(resolveCodexRuntimeClientOptions(env)),
    resolveCodexThreadDefaults(env, process.cwd()),
    liveSessionRegistry,
  );
  const validationService = new LocalExecutorValidationService(
    new LocalWorkspaceValidationGitClient(),
  );
  const approvalService = new ApprovalService(
    approvalRepository,
    missionRepository,
    replayService,
    liveSessionRegistry,
  );
  const runtimeControlService = new RuntimeControlService(
    missionRepository,
    replayService,
    approvalService,
    liveSessionRegistry,
  );

  return {
    worker: new OrchestratorWorker(
      new OrchestratorService(
        missionRepository,
        replayService,
        approvalService,
        runtimeCodexService,
        evidenceService,
        workspaceService,
        validationService,
      ),
      {
        approvalService,
        runtimeControlService,
      },
    ),
  };
}

export function createInMemoryContainer(): AppContainer {
  return buildAppContainer({
    missionRepository: new InMemoryMissionRepository(),
    replayRepository: new InMemoryReplayRepository(),
  });
}

function buildAppContainer(deps: {
  missionRepository: ConstructorParameters<typeof MissionService>[1];
  replayRepository: ConstructorParameters<typeof ReplayService>[0];
}) {
  const replayService = new ReplayService(
    deps.replayRepository,
    deps.missionRepository,
  );
  const evidenceService = new EvidenceService();
  const missionCompiler = new StubMissionCompiler();

  return {
    missionService: new MissionService(
      missionCompiler,
      deps.missionRepository,
      replayService,
      evidenceService,
    ),
    replayService,
  };
}

export function createInMemoryWorkspaceService() {
  return new WorkspaceService(
    new InMemoryWorkspaceRepository(),
    {
      async ensureWorktree() {},
    },
    {
      leaseDurationMs: 15 * 60_000,
      leaseOwner: "pocket-cto-worker:test:0",
      sourceRepoRoot: process.cwd(),
      workspaceRoot: buildDefaultWorkspaceRoot(process.cwd()),
    },
  );
}
