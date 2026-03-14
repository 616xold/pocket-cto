import { loadEnv, type Env } from "@pocket-cto/config";
import { createDb, type Db } from "@pocket-cto/db";
import type {
  AppContainer,
  EmbeddedWorkerContainer,
  OperatorControlAvailability,
  ServerContainer,
  WorkerContainer,
} from "./lib/types";
import { DrizzleApprovalRepository } from "./modules/approvals/drizzle-repository";
import { InMemoryApprovalRepository } from "./modules/approvals/repository";
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

type KernelMode = "api_only" | "embedded_worker" | "standalone_worker";
type ServerControlMode = Extract<KernelMode, "api_only" | "embedded_worker">;
type ServerContainerFactories = {
  createApiOnlyContainer: () => Promise<AppContainer>;
  createEmbeddedWorkerContainer: () => Promise<EmbeddedWorkerContainer>;
};

type SharedKernel = {
  approvalService: ApprovalService;
  missionService: MissionService;
  missionRepository: ConstructorParameters<typeof MissionService>[1];
  replayService: ReplayService;
  runtimeControlService: RuntimeControlService;
  liveSessionRegistry: InMemoryRuntimeSessionRegistry;
  worker: OrchestratorWorker | null;
};

export function resolveServerControlMode(
  env: Pick<Env, "CONTROL_PLANE_EMBEDDED_WORKER">,
): ServerControlMode {
  return env.CONTROL_PLANE_EMBEDDED_WORKER ? "embedded_worker" : "api_only";
}

export async function createServerContainer(input?: {
  env?: Pick<Env, "CONTROL_PLANE_EMBEDDED_WORKER">;
  factories?: Partial<ServerContainerFactories>;
}): Promise<ServerContainer> {
  const mode = resolveServerControlMode(input?.env ?? loadEnv());
  const createApiOnlyContainer =
    input?.factories?.createApiOnlyContainer ?? createContainer;
  const createEmbeddedWorkerContainer =
    input?.factories?.createEmbeddedWorkerContainer ??
    createEmbeddedWorkerContainerFactory;

  return mode === "embedded_worker"
    ? await createEmbeddedWorkerContainer()
    : await createApiOnlyContainer();
}

export async function createContainer(): Promise<AppContainer> {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);
  const kernel = await buildDrizzleKernel({
    db,
    env,
    mode: "api_only",
  });

  return toAppContainer(kernel, {
    enabled: false,
    limitation: "single_process_only",
    mode: "api_only",
  });
}

export async function createEmbeddedWorkerContainer(): Promise<EmbeddedWorkerContainer> {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);
  const kernel = await buildDrizzleKernel({
    db,
    env,
    mode: "embedded_worker",
  });

  return {
    ...toAppContainer(kernel, {
      enabled: true,
      limitation: "single_process_only",
      mode: "embedded_worker",
    }),
    worker: getRequiredWorker(kernel),
  };
}

async function createEmbeddedWorkerContainerFactory() {
  return createEmbeddedWorkerContainer();
}

export async function createWorkerContainer(): Promise<WorkerContainer> {
  const env = loadEnv();
  const db = createDb(env.DATABASE_URL);
  const kernel = await buildDrizzleKernel({
    db,
    env,
    mode: "standalone_worker",
  });

  return {
    liveControl: {
      enabled: true,
      limitation: "single_process_only",
      mode: "standalone_worker",
    },
    worker: getRequiredWorker(kernel),
  };
}

export function createInMemoryContainer(): AppContainer {
  const kernel = buildSharedKernel({
    approvalRepository: new InMemoryApprovalRepository(),
    missionRepository: new InMemoryMissionRepository(),
    replayRepository: new InMemoryReplayRepository(),
  });

  return toAppContainer(kernel, {
    enabled: false,
    limitation: "single_process_only",
    mode: "api_only",
  });
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

async function buildDrizzleKernel(input: {
  db: Db;
  env: Env;
  mode: KernelMode;
}) {
  const kernel = buildSharedKernel({
    approvalRepository: new DrizzleApprovalRepository(input.db),
    missionRepository: new DrizzleMissionRepository(input.db),
    replayRepository: new DrizzleReplayRepository(input.db),
  });

  if (input.mode === "api_only") {
    return kernel;
  }

  return {
    ...kernel,
    worker: await buildWorker({
      env: input.env,
      kernel,
      workspaceRepository: new DrizzleWorkspaceRepository(input.db),
    }),
  } satisfies SharedKernel;
}

function buildSharedKernel(input: {
  approvalRepository: ConstructorParameters<typeof ApprovalService>[0];
  missionRepository: ConstructorParameters<typeof MissionService>[1];
  replayRepository: ConstructorParameters<typeof ReplayService>[0];
}): SharedKernel {
  const replayService = new ReplayService(
    input.replayRepository,
    input.missionRepository,
  );
  const liveSessionRegistry = new InMemoryRuntimeSessionRegistry();
  const approvalService = new ApprovalService(
    input.approvalRepository,
    input.missionRepository,
    replayService,
    liveSessionRegistry,
  );
  const runtimeControlService = new RuntimeControlService(
    input.missionRepository,
    replayService,
    approvalService,
    liveSessionRegistry,
  );
  const evidenceService = new EvidenceService();
  const missionService = new MissionService(
    new StubMissionCompiler(),
    input.missionRepository,
    replayService,
    evidenceService,
    {
      approvalReader: approvalService,
    },
  );

  return {
    approvalService,
    liveSessionRegistry,
    missionService,
    missionRepository: input.missionRepository,
    replayService,
    runtimeControlService,
    worker: null,
  };
}

async function buildWorker(input: {
  env: Env;
  kernel: SharedKernel;
  workspaceRepository: DrizzleWorkspaceRepository;
}) {
  const gitManager = new LocalWorkspaceGitManager();
  const workspaceService = new WorkspaceService(
    input.workspaceRepository,
    gitManager,
    await resolveWorkspaceServiceConfig({
      env: input.env,
      gitManager,
      processCwd: process.cwd(),
    }),
  );
  const runtimeCodexService = new CodexRuntimeService(
    new RuntimeCodexAdapter(resolveCodexRuntimeClientOptions(input.env)),
    resolveCodexThreadDefaults(input.env, process.cwd()),
    input.kernel.liveSessionRegistry,
  );
  const validationService = new LocalExecutorValidationService(
    new LocalWorkspaceValidationGitClient(),
  );
  const orchestratorService = new OrchestratorService(
    input.kernel.missionRepository,
    input.kernel.replayService,
    input.kernel.approvalService,
    runtimeCodexService,
    new EvidenceService(),
    workspaceService,
    validationService,
  );

  return new OrchestratorWorker(orchestratorService, {
    approvalService: input.kernel.approvalService,
    runtimeControlService: input.kernel.runtimeControlService,
  });
}

function toAppContainer(
  kernel: SharedKernel,
  liveControl: OperatorControlAvailability,
): AppContainer {
  return {
    missionService: kernel.missionService,
    operatorControl: {
      approvalService: kernel.approvalService,
      liveControl,
      runtimeControlService: kernel.runtimeControlService,
    },
    replayService: kernel.replayService,
  };
}

function getRequiredWorker(kernel: SharedKernel) {
  if (!kernel.worker) {
    throw new Error("Worker was not configured for this container");
  }

  return kernel.worker;
}
