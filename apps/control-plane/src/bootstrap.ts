import { loadEnv } from "@pocket-cto/config";
import { createDb } from "@pocket-cto/db";
import type { AppContainer, WorkerContainer } from "./lib/types";
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
import {
  resolveCodexRuntimeClientOptions,
  resolveCodexThreadDefaults,
} from "./modules/runtime-codex/config";
import { CodexRuntimeService } from "./modules/runtime-codex/service";
import {
  buildDefaultWorkspaceRoot,
  DrizzleWorkspaceRepository,
  InMemoryWorkspaceRepository,
  LocalWorkspaceGitManager,
  resolveWorkspaceServiceConfig,
  WorkspaceService,
} from "./modules/workspaces";

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
  const replayRepository = new DrizzleReplayRepository(db);
  const workspaceRepository = new DrizzleWorkspaceRepository(db);
  const replayService = new ReplayService(replayRepository, missionRepository);
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
  );

  return {
    worker: new OrchestratorWorker(
      new OrchestratorService(
        missionRepository,
        replayService,
        runtimeCodexService,
        workspaceService,
      ),
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
