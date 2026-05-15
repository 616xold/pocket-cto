import type { OperatorControlAvailability as DomainOperatorControlAvailability } from "@pocket-cto/domain";
import type { ApprovalService } from "../modules/approvals/service";
import type { CloseControlAcknowledgementService } from "../modules/close-control-acknowledgement/service";
import type { CloseControlCertificationBoundaryService } from "../modules/close-control-certification-boundary/service";
import type { CloseControlCertificationSafetyService } from "../modules/close-control-certification-safety/service";
import type { CloseControlReviewSummaryService } from "../modules/close-control-review-summary/service";
import type { CloseControlService } from "../modules/close-control/service";
import type { DeliveryReadinessService } from "../modules/delivery-readiness/service";
import type { ExternalDeliveryHumanConfirmationBoundaryService } from "../modules/external-delivery-human-confirmation-boundary/service";
import type { ExternalProviderBoundaryService } from "../modules/external-provider-boundary/service";
import type { CfoWikiService } from "../modules/wiki/service";
import type { FinanceTwinService } from "../modules/finance-twin/service";
import type { GitHubAppService } from "../modules/github-app/service";
import type { GitHubIssueIntakeService } from "../modules/github-app/issue-intake-service";
import type { GitHubWebhookService } from "../modules/github-app/webhook-service";
import type { MissionService } from "../modules/missions/service";
import type { MonitoringService } from "../modules/monitoring/service";
import type { MissionReportingActionsService } from "../modules/missions/reporting-actions";
import type { OperatorReadinessService } from "../modules/operator-readiness/service";
import type { OrchestratorWorker } from "../modules/orchestrator/worker";
import type { ReadOnlyAppMcpEndpointService } from "../modules/read-only-app-mcp-endpoint/service";
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
  | "createAnalysis"
  | "createBoardPacket"
  | "createDiligencePacket"
  | "createDiscovery"
  | "createLenderUpdate"
  | "createOrOpenMonitorInvestigation"
  | "createReporting"
  | "createFromText"
  | "getMissionDetail"
  | "listMissions"
>;

export type MissionReportingActionServicePort = Pick<
  MissionReportingActionsService,
  | "exportMarkdownBundle"
  | "fileDraftArtifacts"
  | "recordCirculationLogCorrection"
  | "recordCirculationLog"
  | "recordReleaseLog"
  | "requestCirculationApproval"
  | "requestReleaseApproval"
>;

export type MonitoringServicePort = Pick<
  MonitoringService,
  | "getLatestCashPostureMonitorResult"
  | "getLatestCollectionsPressureMonitorResult"
  | "getLatestPayablesPressureMonitorResult"
  | "getLatestPolicyCovenantThresholdMonitorResult"
  | "runCashPostureMonitor"
  | "runCollectionsPressureMonitor"
  | "runPayablesPressureMonitor"
  | "runPolicyCovenantThresholdMonitor"
>;

export type CloseControlServicePort = Pick<CloseControlService, "getChecklist">;

export type CloseControlAcknowledgementServicePort = Pick<
  CloseControlAcknowledgementService,
  "getAcknowledgementReadiness"
>;

export type CloseControlReviewSummaryServicePort = Pick<
  CloseControlReviewSummaryService,
  "getReviewSummary"
>;

export type CloseControlCertificationBoundaryServicePort = Pick<
  CloseControlCertificationBoundaryService,
  "getCertificationBoundary"
>;

export type CloseControlCertificationSafetyServicePort = Pick<
  CloseControlCertificationSafetyService,
  "getCertificationSafety"
>;

export type OperatorReadinessServicePort = Pick<
  OperatorReadinessService,
  "getReadiness"
>;

export type DeliveryReadinessServicePort = Pick<
  DeliveryReadinessService,
  "getDeliveryReadiness"
>;

export type ExternalProviderBoundaryServicePort = Pick<
  ExternalProviderBoundaryService,
  "getExternalProviderBoundary"
>;

export type ExternalDeliveryHumanConfirmationBoundaryServicePort = Pick<
  ExternalDeliveryHumanConfirmationBoundaryService,
  "getHumanConfirmationBoundary"
>;

export type ReplayServicePort = Pick<ReplayService, "getMissionEvents">;

export type ReadOnlyAppMcpEndpointServicePort = Pick<
  ReadOnlyAppMcpEndpointService,
  "handle"
>;

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
  | "bindCompanySource"
  | "compileCompanyWiki"
  | "createFiledPage"
  | "exportCompanyWiki"
  | "getCompanySummary"
  | "getCompanyExport"
  | "getIndexPage"
  | "getLatestLint"
  | "getLogPage"
  | "listCompanySources"
  | "listCompanyExports"
  | "listFiledPages"
  | "getPage"
  | "runCompanyLint"
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
  closeControlAcknowledgementService: CloseControlAcknowledgementServicePort;
  closeControlCertificationBoundaryService?: CloseControlCertificationBoundaryServicePort;
  closeControlCertificationSafetyService?: CloseControlCertificationSafetyServicePort;
  closeControlReviewSummaryService: CloseControlReviewSummaryServicePort;
  closeControlService: CloseControlServicePort;
  deliveryReadinessService?: DeliveryReadinessServicePort;
  externalDeliveryHumanConfirmationBoundaryService?: ExternalDeliveryHumanConfirmationBoundaryServicePort;
  externalProviderBoundaryService?: ExternalProviderBoundaryServicePort;
  githubAppService: GitHubAppServicePort;
  githubIssueIntakeService: GitHubIssueIntakeServicePort;
  githubWebhookService: GitHubWebhookServicePort;
  cfoWikiService: CfoWikiServicePort;
  financeTwinService: FinanceTwinServicePort;
  missionService: MissionServicePort;
  missionReportingActionsService: MissionReportingActionServicePort;
  monitoringService?: MonitoringServicePort;
  operatorReadinessService: OperatorReadinessServicePort;
  readOnlyAppMcpEndpointService?: ReadOnlyAppMcpEndpointServicePort;
  operatorControl: {
    approvalService: Pick<
      ApprovalService,
      "getApprovalById" | "listMissionApprovals" | "resolveApproval"
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
