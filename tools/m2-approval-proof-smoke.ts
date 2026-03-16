import { fileURLToPath } from "node:url";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { DrizzleApprovalRepository } from "../apps/control-plane/src/modules/approvals/drizzle-repository.ts";
import { ApprovalService } from "../apps/control-plane/src/modules/approvals/service.ts";
import { ProofBundleAssemblyService } from "../apps/control-plane/src/modules/evidence/proof-bundle-assembly.ts";
import { EvidenceService } from "../apps/control-plane/src/modules/evidence/service.ts";
import { StubMissionCompiler } from "../apps/control-plane/src/modules/missions/compiler.ts";
import { DrizzleMissionRepository } from "../apps/control-plane/src/modules/missions/drizzle-repository.ts";
import { MissionService } from "../apps/control-plane/src/modules/missions/service.ts";
import { OrchestratorService } from "../apps/control-plane/src/modules/orchestrator/service.ts";
import { OrchestratorWorker } from "../apps/control-plane/src/modules/orchestrator/worker.ts";
import { DrizzleReplayRepository } from "../apps/control-plane/src/modules/replay/drizzle-repository.ts";
import { ReplayService } from "../apps/control-plane/src/modules/replay/service.ts";
import { RuntimeCodexAdapter } from "../apps/control-plane/src/modules/runtime-codex/adapter.ts";
import { RuntimeControlService } from "../apps/control-plane/src/modules/runtime-codex/control-service.ts";
import {
  resolveCodexRuntimeClientOptions,
  resolveCodexThreadDefaults,
} from "../apps/control-plane/src/modules/runtime-codex/config.ts";
import { InMemoryRuntimeSessionRegistry } from "../apps/control-plane/src/modules/runtime-codex/live-session-registry.ts";
import { CodexRuntimeService } from "../apps/control-plane/src/modules/runtime-codex/service.ts";
import {
  DrizzleWorkspaceRepository,
  LocalWorkspaceGitManager,
  WorkspaceService,
} from "../apps/control-plane/src/modules/workspaces/index.ts";
import {
  createTempGitRepo,
  createTempWorkspaceRoot,
} from "../apps/control-plane/src/modules/workspaces/test-git.ts";
import {
  LocalExecutorValidationService,
  LocalWorkspaceValidationGitClient,
} from "../apps/control-plane/src/modules/validation/index.ts";
import {
  closeTestDatabase,
  createTestDb,
  getTestDatabaseUrl,
  resetTestDatabase,
} from "../apps/control-plane/src/test/database.ts";
import { waitForValue } from "../apps/control-plane/src/test/wait-for.ts";

const fixturePath = fileURLToPath(
  new URL("../packages/testkit/src/runtime/fake-codex-app-server.mjs", import.meta.url),
);
const operatorName = "m2-approval-proof-smoke";
const quietLog = {
  error() {},
  info() {},
};

async function main() {
  const harness = await createHarness();
  const abortController = new AbortController();
  const workerRun = harness.worker.run({
    log: quietLog,
    pollIntervalMs: 10,
    runOnce: false,
    signal: abortController.signal,
  });
  const app = await buildApp({
    container: harness.appContainer,
  });
  app.log.level = "fatal";
  const controlPlaneUrl = await app.listen({
    host: "127.0.0.1",
    port: 0,
  });

  try {
    await expectOkJson(`${controlPlaneUrl}/health`, "control-plane health");

    const created = await postJson(`${controlPlaneUrl}/missions/text`, {
      primaryRepo: "616xold/pocket-cto",
      requestedBy: operatorName,
      text: "Implement the executor change with a file approval gate first.",
    });
    const missionId = requireString(created?.mission?.id, "mission id");

    const pendingDetail = await waitForValue({
      description: `mission ${missionId} awaiting approval`,
      inspect: () => getJson(`${controlPlaneUrl}/missions/${missionId}`),
      read: async () => {
        const detail = await expectOkJson(
          `${controlPlaneUrl}/missions/${missionId}`,
          "mission detail before approval resolution",
        );
        const hasPendingCard = Array.isArray(detail.approvalCards)
          ? detail.approvalCards.some((card) => card.status === "pending")
          : false;

        return detail.mission?.status === "awaiting_approval" && hasPendingCard
          ? detail
          : null;
      },
    });

    const approvalsBefore = await expectOkJson(
      `${controlPlaneUrl}/missions/${missionId}/approvals`,
      "approval list before resolution",
    );
    const pendingApproval = Array.isArray(approvalsBefore.approvals)
      ? approvalsBefore.approvals.find((approval) => approval.status === "pending")
      : null;

    if (!pendingApproval?.id) {
      throw new Error(`Mission ${missionId} did not expose a pending approval row.`);
    }

    const pendingCard = Array.isArray(pendingDetail.approvalCards)
      ? pendingDetail.approvalCards.find(
          (card) => card.approvalId === pendingApproval.id && card.status === "pending",
        )
      : null;

    if (!pendingCard) {
      throw new Error(
        `Mission ${missionId} did not expose a pending approval card for ${pendingApproval.id}.`,
      );
    }

    await postJson(`${controlPlaneUrl}/approvals/${pendingApproval.id}/resolve`, {
      decision: "accept",
      rationale: "Fixture-backed local approval proof accepted through HTTP.",
      resolvedBy: operatorName,
    });

    const resolvedDetail = await waitForValue({
      description: `mission ${missionId} completed after approval resolution`,
      inspect: () => getJson(`${controlPlaneUrl}/missions/${missionId}`),
      read: async () => {
        const detail = await expectOkJson(
          `${controlPlaneUrl}/missions/${missionId}`,
          "mission detail after approval resolution",
        );
        const resolvedCard = Array.isArray(detail.approvalCards)
          ? detail.approvalCards.find(
              (card) =>
                card.approvalId === pendingApproval.id && card.status === "approved",
            )
          : null;
        const executorTask = Array.isArray(detail.tasks)
          ? detail.tasks.find((task) => task.id === pendingApproval.taskId)
          : null;

        return detail.mission?.status === "succeeded" &&
          resolvedCard &&
          executorTask?.status === "succeeded"
          ? detail
          : null;
      },
    });

    const approvalsAfter = await expectOkJson(
      `${controlPlaneUrl}/missions/${missionId}/approvals`,
      "approval list after resolution",
    );
    const replay = await expectOkJson(
      `${controlPlaneUrl}/missions/${missionId}/events`,
      "mission replay",
    );
    const resolvedCard = resolvedDetail.approvalCards.find(
      (card) => card.approvalId === pendingApproval.id,
    );
    const finalTask = resolvedDetail.tasks.find(
      (task) => task.id === pendingApproval.taskId,
    );
    const replayTypes = Array.isArray(replay) ? replay.map((event) => event.type) : [];

    if (!replayTypes.includes("approval.requested")) {
      throw new Error(`Mission ${missionId} replay did not include approval.requested.`);
    }

    if (!replayTypes.includes("approval.resolved")) {
      throw new Error(`Mission ${missionId} replay did not include approval.resolved.`);
    }

    if (!resolvedCard) {
      throw new Error(`Mission ${missionId} did not expose a resolved approval card.`);
    }

    if (!finalTask) {
      throw new Error(
        `Mission ${missionId} did not expose task ${pendingApproval.taskId} after approval resolution.`,
      );
    }

    console.log(
      JSON.stringify(
        {
          controlPlaneUrl,
          databaseUrl: getTestDatabaseUrl(),
          finalTaskStatus: finalTask.status,
          missionId,
          mode: "embedded_fake_runtime_approval_replay",
          pendingApprovalCount: Array.isArray(approvalsBefore.approvals)
            ? approvalsBefore.approvals.length
            : 0,
          pendingCardSummary: pendingCard.summary,
          pendingCardTitle: pendingCard.title,
          proof: {
            approvalCardsAfter: resolvedDetail.approvalCards.map(summarizeCard),
            approvalCardsBefore: pendingDetail.approvalCards.map(summarizeCard),
            approvalsAfter: approvalsAfter.approvals,
            approvalsBefore: approvalsBefore.approvals,
            missionStatusAfter: resolvedDetail.mission.status,
            missionStatusBefore: pendingDetail.mission.status,
            replayTail: replayTypes.slice(-8),
          },
          replayEventTypes: replayTypes,
          replayIncludesRequested: true,
          replayIncludesResolved: true,
          requestedTaskId: pendingApproval.taskId,
          resolvedApprovalId: pendingApproval.id,
          resolvedCardSummary: resolvedCard.resolutionSummary,
          resolvedCardTitle: resolvedCard.title,
        },
        null,
        2,
      ),
    );
  } finally {
    abortController.abort();
    await Promise.allSettled([workerRun, app.close()]);
    await harness.cleanup();
  }
}

async function createHarness() {
  await resetTestDatabase();

  const db = createTestDb();
  const sourceRepo = await createTempGitRepo();
  const workspaceRoot = await createTempWorkspaceRoot();
  const missionRepository = new DrizzleMissionRepository(db);
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
  const evidenceService = new EvidenceService();
  const approvalService = new ApprovalService(
    approvalRepository,
    missionRepository,
    replayService,
    liveSessionRegistry,
    proofBundleAssembly,
  );
  const missionService = new MissionService(
    new StubMissionCompiler(),
    missionRepository,
    replayService,
    evidenceService,
    {
      approvalReader: approvalService,
    },
  );
  const workspaceService = new WorkspaceService(
    workspaceRepository,
    new LocalWorkspaceGitManager(),
    {
      leaseDurationMs: 60_000,
      leaseOwner: "pocket-cto-worker:approval-proof",
      sourceRepoRoot: sourceRepo.repoRoot,
      workspaceRoot: workspaceRoot.workspaceRoot,
    },
  );
  const runtimeCodexService = new CodexRuntimeService(
    new RuntimeCodexAdapter(
      resolveCodexRuntimeClientOptions({
        CODEX_APP_SERVER_ARGS: buildFixtureArgs("file-change-approval"),
        CODEX_APP_SERVER_COMMAND: process.execPath,
        CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
        CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
        CODEX_DEFAULT_SANDBOX: "workspace-write",
        CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-control-plane",
      }),
    ),
    resolveCodexThreadDefaults(
      {
        CODEX_APP_SERVER_ARGS: buildFixtureArgs("file-change-approval"),
        CODEX_APP_SERVER_COMMAND: process.execPath,
        CODEX_DEFAULT_APPROVAL_POLICY: "untrusted",
        CODEX_DEFAULT_MODEL: "gpt-5.2-codex",
        CODEX_DEFAULT_SANDBOX: "workspace-write",
        CODEX_DEFAULT_SERVICE_NAME: "pocket-cto-control-plane",
      },
      workspaceRoot.workspaceRoot,
    ),
    liveSessionRegistry,
  );
  const orchestratorService = new OrchestratorService(
    missionRepository,
    replayService,
    approvalService,
    runtimeCodexService,
    evidenceService,
    workspaceService,
    new LocalExecutorValidationService(new LocalWorkspaceValidationGitClient()),
    {
      async publishValidatedExecutorWorkspace(input) {
        return {
          baseBranch: "main",
          branchName:
            input.workspace.branchName ?? `pocket-cto/${input.mission.id}/1-executor`,
          commitMessage: `pocket-cto: mission ${input.mission.id} task ${input.task.sequence}-${input.task.role}`,
          commitSha: "0123456789abcdef0123456789abcdef01234567",
          draft: true,
          headBranch:
            input.workspace.branchName ?? `pocket-cto/${input.mission.id}/1-executor`,
          prBody: "fixture-backed approval proof pull request body",
          prNumber: 42,
          prTitle: `Pocket CTO: ${input.mission.title}`,
          prUrl: "https://github.com/616xold/pocket-cto/pull/42",
          publishedAt: "2026-03-16T00:00:00.000Z",
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
      githubAppService: createGitHubAppServiceStub(),
      githubIssueIntakeService: createGitHubIssueIntakeServiceStub(),
      githubWebhookService: createGitHubWebhookServiceStub(),
      missionService,
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
    },
    async cleanup() {
      await Promise.allSettled([
        closeTestDatabase(),
        sourceRepo.cleanup(),
        workspaceRoot.cleanup(),
      ]);
    },
    worker: new OrchestratorWorker(orchestratorService, {
      approvalService,
      runtimeControlService,
    }),
  };
}

function buildFixtureArgs(mode: "file-change-approval") {
  return [`"${fixturePath}"`, "--mode", mode].join(" ");
}

function summarizeCard(card: { approvalId: string; status: string; summary: string; title: string }) {
  return {
    approvalId: card.approvalId,
    status: card.status,
    summary: card.summary,
    title: card.title,
  };
}

function createGitHubAppServiceStub() {
  return {
    async getRepository() {
      throw new Error("GitHub repository lookup is not part of the approval smoke.");
    },
    async listInstallationRepositories() {
      return { installation: null, repositories: [] };
    },
    async listInstallations() {
      return [];
    },
    async listRepositories() {
      return { repositories: [] };
    },
    async resolveWritableRepository() {
      throw new Error("GitHub repository resolution is not part of the approval smoke.");
    },
    async syncInstallationRepositories() {
      return {
        activeRepositoryCount: 0,
        inactiveRepositoryCount: 0,
        installation: null,
        syncedAt: new Date().toISOString(),
        syncedRepositoryCount: 0,
      };
    },
    async syncInstallations() {
      return {
        installations: [],
        syncedAt: new Date().toISOString(),
        syncedCount: 0,
      };
    },
    async syncRepositories() {
      return {
        installations: [],
        syncedAt: new Date().toISOString(),
        syncedInstallationCount: 0,
        syncedRepositoryCount: 0,
      };
    },
  };
}

function createGitHubWebhookServiceStub() {
  return {
    async getDelivery() {
      throw new Error("GitHub webhook lookup is not part of the approval smoke.");
    },
    async ingest() {
      throw new Error("GitHub webhook ingest is not part of the approval smoke.");
    },
    async listDeliveries() {
      return { deliveries: [] };
    },
  };
}

function createGitHubIssueIntakeServiceStub() {
  return {
    async createMissionFromDelivery() {
      throw new Error("GitHub issue intake is not part of the approval smoke.");
    },
    async listIssues() {
      return { issues: [] };
    },
  };
}

async function expectOkJson(url: string, label: string) {
  const json = await getJson(url);

  if (!json.ok) {
    throw new Error(`${label} failed with ${json.status}.`);
  }

  return json.body;
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function getJson(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  return {
    body: await readJson(response),
    ok: response.ok,
    status: response.status,
  };
}

async function readJson(response: Response) {
  const text = await response.text();
  return text.length === 0 ? null : JSON.parse(text);
}

function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected ${label} to be a non-empty string.`);
  }

  return value;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
