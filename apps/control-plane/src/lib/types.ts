import type { OperatorControlAvailability as DomainOperatorControlAvailability } from "@pocket-cto/domain";
import type { ApprovalService } from "../modules/approvals/service";
import type { CfoWikiService } from "../modules/wiki/service";
import type { FinanceTwinService } from "../modules/finance-twin/service";
import type { GitHubAppService } from "../modules/github-app/service";
import type { GitHubIssueIntakeService } from "../modules/github-app/issue-intake-service";
import type { GitHubWebhookService } from "../modules/github-app/webhook-service";
import type { MissionService } from "../modules/missions/service";
import type { OrchestratorWorker } from "../modules/orchestrator/worker";
import type { ReplayService } from "../modules/replay/service";
import type { RuntimeControlService } from "../modules/runtime-codex/control-service";
import type { SourceRegistryService } from "../modules/sources/service";
import type { TwinService } from "../modules/twin/service";

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

export type GitHubIssueIntakeServicePort = Pick<
  GitHubIssueIntakeService,
  "createMissionFromDelivery" | "listIssues"
>;

export type MissionServicePort = Pick<
  MissionService,
  "createDiscovery" | "createFromText" | "getMissionDetail" | "listMissions"
>;

export type ReplayServicePort = Pick<ReplayService, "getMissionEvents">;

export type SourceServicePort = Pick<
  SourceRegistryService,
  | "createSource"
  | "getSource"
  | "getSourceFile"
  | "getSourceIngestRun"
  | "ingestSourceFile"
  | "listSourceIngestRuns"
  | "listSourceFiles"
  | "listSources"
  | "registerSourceFile"
>;

export type CfoWikiServicePort = Pick<
  CfoWikiService,
  | "compileCompanyWiki"
  | "getCompanySummary"
  | "getIndexPage"
  | "getLogPage"
  | "getPage"
>;

export type FinanceTwinServicePort = Pick<
  FinanceTwinService,
  | "getBalanceBridgePrerequisites"
  | "getAccountBridgeReadiness"
  | "getAccountCatalog"
  | "getBankAccounts"
  | "getCashPosture"
  | "getCollectionsPosture"
  | "getGeneralLedgerAccountBalanceProof"
  | "getGeneralLedgerAccountActivityLineage"
  | "getCompanySnapshot"
  | "getCompanySummary"
  | "getGeneralLedger"
  | "getPayablesAging"
  | "getPayablesPosture"
  | "getReceivablesAging"
  | "getLineageDrill"
  | "getReconciliationReadiness"
  | "syncCompanySourceFile"
> &
  Partial<
    Pick<
      FinanceTwinService,
      | "getContracts"
      | "getObligationCalendar"
      | "getSpendItems"
      | "getSpendPosture"
    >
  >;

export type TwinServicePort = Pick<
  TwinService,
  | "finishSyncRun"
  | "getRepositoryCiSummary"
  | "queryRepositoryBlastRadius"
  | "getRepositoryDocSections"
  | "getRepositoryDocs"
  | "getRepositoryFreshness"
  | "getRepositoryRunbooks"
  | "getRepositoryOwners"
  | "getRepositoryMetadataSummary"
  | "getRepositoryTestSuites"
  | "getRepositoryWorkflows"
  | "getRepositoryOwnershipRules"
  | "getRepositoryOwnershipSummary"
  | "listRepositoryEdges"
  | "listRepositoryEntities"
  | "listRepositoryRuns"
  | "syncRepositoryMetadata"
  | "syncRepositoryDocs"
  | "syncRepositoryRunbooks"
  | "syncRepositoryTestSuites"
  | "syncRepositoryWorkflows"
  | "syncRepositoryOwnership"
  | "startSyncRun"
  | "upsertEdge"
  | "upsertEntity"
>;

export type AppContainer = {
  githubAppService: GitHubAppServicePort;
  githubIssueIntakeService: GitHubIssueIntakeServicePort;
  githubWebhookService: GitHubWebhookServicePort;
  cfoWikiService: CfoWikiServicePort;
  financeTwinService: FinanceTwinServicePort;
  missionService: MissionServicePort;
  operatorControl: {
    approvalService: Pick<
      ApprovalService,
      "listMissionApprovals" | "resolveApproval"
    >;
    liveControl: OperatorControlAvailability;
    runtimeControlService: Pick<RuntimeControlService, "interruptActiveTurn">;
  };
  replayService: ReplayServicePort;
  sourceService: SourceServicePort;
  twinService: TwinServicePort;
};

export type EmbeddedWorkerContainer = AppContainer & {
  worker: OrchestratorWorker;
};

export type ServerContainer = AppContainer | EmbeddedWorkerContainer;

export type WorkerContainer = {
  liveControl: OperatorControlAvailability;
  worker: OrchestratorWorker;
};
