import type { OperatorControlAvailability as DomainOperatorControlAvailability } from "@pocket-cto/domain";
import type { ApprovalService } from "../modules/approvals/service";
import type { GitHubAppService } from "../modules/github-app/service";
import type { GitHubWebhookService } from "../modules/github-app/webhook-service";
import type { MissionService } from "../modules/missions/service";
import type { OrchestratorWorker } from "../modules/orchestrator/worker";
import type { ReplayService } from "../modules/replay/service";
import type { RuntimeControlService } from "../modules/runtime-codex/control-service";

export type OperatorControlAvailability = DomainOperatorControlAvailability;

export type GitHubAppServicePort = Pick<
  GitHubAppService,
  | "getRepository"
  | "listInstallations"
  | "listInstallationRepositories"
  | "listRepositories"
  | "resolveWritableRepository"
  | "syncInstallationRepositories"
  | "syncInstallations"
  | "syncRepositories"
>;

export type GitHubWebhookServicePort = Pick<
  GitHubWebhookService,
  "getDelivery" | "ingest" | "listDeliveries"
>;

export type MissionServicePort = Pick<
  MissionService,
  "createFromText" | "getMissionDetail"
>;

export type ReplayServicePort = Pick<ReplayService, "getMissionEvents">;

export type AppContainer = {
  githubAppService: GitHubAppServicePort;
  githubWebhookService: GitHubWebhookServicePort;
  missionService: MissionServicePort;
  operatorControl: {
    approvalService: Pick<
      ApprovalService,
      "listMissionApprovals" | "resolveApproval"
    >;
    liveControl: OperatorControlAvailability;
    runtimeControlService: Pick<
      RuntimeControlService,
      "interruptActiveTurn"
    >;
  };
  replayService: ReplayServicePort;
};

export type EmbeddedWorkerContainer = AppContainer & {
  worker: OrchestratorWorker;
};

export type ServerContainer = AppContainer | EmbeddedWorkerContainer;

export type WorkerContainer = {
  liveControl: OperatorControlAvailability;
  worker: OrchestratorWorker;
};
