import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ArchitectureMapSchema,
  BENCHMARK_AUTHORITY_LAYERS,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS,
  BenchmarkTaskKindSchema,
  BenchmarkTaskTaxonomySchema,
  CommunityPackManifestSchema,
  ContributorChallengeSchema,
  EvidenceFaithfulnessTaskSchema,
  EvidenceRecallTaskSchema,
  MissingCitationTaskSchema,
  PolicyLookupTaskSchema,
  ReportTraceabilityTaskSchema,
  SafeDemoDataPolicySchema,
  SourceCoverageTaskSchema,
  SyntheticFinanceSourcePolicySchema,
  UnsafeActionRefusalTaskSchema,
  MonitorBoundaryTaskSchema,
} from "./benchmark-community";
import {
  AppProofSchema,
  buildReadOnlyChatGptAppMcpProof,
} from "./read-only-app-mcp";

const checkedAt = "2026-05-09T00:30:00.000Z";
const FP0088_PLAN_FILE =
  "FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md";
const FP0089_PLAN_FILE =
  "FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md";
const FP0090_PLAN_FILE =
  "FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md";
const FP0091_PLAN_FILE =
  "FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md";
const FP0092_PLAN_FILE =
  "FP-0092-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation.md";
const FP0093_PLAN_FILE =
  "FP-0093-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan.md";
const FP0094_PLAN_FILE =
  "FP-0094-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation.md";
const FP0095_PLAN_FILE =
  "FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md";
const FP0096_PLAN_FILE =
  "FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md";
const FP0097_PLAN_FILE =
  "FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md";
const FP0098_PLAN_FILE =
  "FP-0098-read-only-chatgpt-app-mcp-public-app-readiness-master-plan.md";
const FP0099_PLAN_FILE =
  "FP-0099-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan.md";
const FP0100_PLAN_FILE =
  "FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const FP0101_PLAN_FILE =
  "FP-0101-read-only-chatgpt-app-mcp-public-app-implementation-sequencing-master-plan.md";
const FP0102_PLAN_FILE =
  "FP-0102-read-only-chatgpt-app-mcp-endpoint-oauth-remote-mcp-architecture-master-plan.md";

function safeDemoDataPolicy() {
  return {
    firstGate: true,
    forbiddenFinanceData: [
      "customer_data",
      "vendor_data",
      "payroll_data",
      "tax_data",
      "bank_data",
      "legal_data",
      "board_data",
      "lender_data",
    ],
    forbiddenPrivateArtifacts: [
      "credentials",
      "tokens",
      "secrets",
      "oauth_material",
      "provider_credentials",
      "api_keys",
      "object_store_dumps",
      "database_dumps",
      "private_screenshots",
      "private_finance_source_text",
    ],
    forbidsCheckedInSensitiveFinanceData: true,
    forbidsLightlyAnonymizedRealFinanceData: true,
    forbidsRealCompanyData: true,
    noDataFilesCreatedByPolicy: true,
    policyName: "SafeDemoDataPolicy",
    requiresClearSyntheticLabel: true,
    requiresReviewBeforeAnyFutureDataFile: true,
    requiresSyntheticOnlyBeforeFutureCase: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function syntheticFinanceSourcePolicy() {
  return {
    forbidsLightlyAnonymizedRealFinanceData: true,
    forbidsRealCompanyDerivedData: true,
    forbidsSourcePackDerivedPrivateData: true,
    gatedBySafeDemoDataPolicyFirst: true,
    noFutureSampleDemoBenchmarkCaseWithoutPolicy: true,
    policyName: "SyntheticFinanceSourcePolicy",
    requiresClearSyntheticLabeling: true,
    requiresInventedCompanyFacts: true,
    requiresInventedSourceFacts: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function privacyBoundary() {
  return {
    benchmarkArtifactsAreNotSourceTruth: true,
    noCredentialsTokensSecretsOauthProviderKeys: true,
    noLightlyAnonymizedRealFinanceData: true,
    noObjectStoreOrDatabaseDumps: true,
    noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderData: true,
    noPrivateFinanceSourceText: true,
    noPrivateScreenshots: true,
    noRealCompanyData: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function noRuntimeBoundary() {
  return {
    localProofOnly: true,
    noAppSubmission: true,
    noAppsSdkUi: true,
    noAutonomousAction: true,
    noCertification: true,
    noDelivery: true,
    noDeployment: true,
    noEvalDatasetsAdded: true,
    noExternalCommunications: true,
    noFinanceWrite: true,
    noFixturesAdded: true,
    noGeneratedAdvice: true,
    noGeneratedProductProse: true,
    noModelCalls: true,
    noOauth: true,
    noOcr: true,
    noOpenAiApiCalls: true,
    noPackageScriptsAdded: true,
    noPageIndex: true,
    noProductRuntime: true,
    noProviderCalls: true,
    noPublicChatGptApp: true,
    noPublicDemoDataAdded: true,
    noPublicSourcePacksAdded: true,
    noRemoteMcpDeployment: true,
    noRoutesAdded: true,
    noRuntimeCodex: true,
    noSampleDataAdded: true,
    noSchemaMigrationsAdded: true,
    noSmokeAliasesAdded: true,
    noSourceMutation: true,
    noSourcePackMutation: true,
    noUiAdded: true,
    noVectorFileSearch: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function benchmarkCase() {
  return {
    futureCaseRequiresSafeDemoDataPolicy: true,
    futureCaseRequiresSyntheticFinanceSourcePolicy: true,
    noBenchmarkCasesCheckedIn: true,
    noDatasetFile: true,
    noFixtureFile: true,
    noSampleDataFile: true,
    placeholderOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function contributorChallenge() {
  return {
    challengeName: "Synthetic read-only evidence challenge",
    noAutonomousActionImplied: true,
    noCertificationImplied: true,
    noFinanceWritesImplied: true,
    noLegalAuditTaxAdviceImplied: true,
    noProviderIntegrationImplied: true,
    noPublicLaunchImplied: true,
    noSaasDeploymentImplied: true,
    readOnlyProofOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    syntheticOnlyRequiredBeforeAnyFutureData: true,
  };
}

function architectureMap() {
  return {
    authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS],
    benchmarkArtifactsNotProductRuntime: true,
    cfoWikiCompiledDerived: true,
    evidenceIndexReadOnlyAnchorTraceCardCoverageLimitationLayer: true,
    financeTwinAuthoritativeForStructuredFacts: true,
    rawSourcesAuthoritativeForDocumentClaims: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    v2cToolsLocalInternalReadOnlyContract: true,
    v2dAtlasVisualizationOnly: true,
    v2eBoundedOrchestrationLocalInternalProofOnly: true,
    v2fContractsNotTruthRuntimeOrData: true,
  };
}

function baseTask(
  taskKind: (typeof BENCHMARK_TASK_KINDS)[number],
  expectedRefusalKind:
    | "none"
    | "missing_citation_refusal"
    | "unsupported_evidence_refusal"
    | "unsafe_action_refusal" = "unsupported_evidence_refusal",
) {
  return {
    citationRequirements: {
      acceptedDerivedRefKinds: ["evidence_card", "document_map"],
      missingCitationFailsClosed: true,
      positiveClaimsRequireCitation: true,
      sourceAnchorOrAcceptedDerivedRefRequired: true,
    },
    companyContext: { companyKey: "synthetic-company", syntheticOnly: true },
    contractPlaceholderOnly: true,
    evidenceRequirements: {
      cfoWikiCompiledDerived: true,
      evidenceIndexAllowed: true,
      financeTwinStructuredFactsRemainAuthoritative: true,
      noFullFileDumps: true,
      rawSourcesRemainAuthoritative: true,
      v2cEvidenceToolsAllowedReadOnly: true,
    },
    expectedRefusalPosture: {
      expectedRefusalKind,
      whenCitationMissing: "missing_citation_refusal",
      whenEvidenceConflicting: "unsupported_evidence_refusal",
      whenEvidenceMissing: "unsupported_evidence_refusal",
      whenEvidenceStale: "unsupported_evidence_refusal",
      whenEvidenceUnsupported: "unsupported_evidence_refusal",
      whenUnsafeActionRequested: "unsafe_action_refusal",
    },
    forbiddenActions: [
      "upload_source",
      "report_release",
      "provider_call",
      "finance_write",
      "generated_advice",
      "autonomous_action",
      "openai_api_call",
      "model_call",
    ],
    freshnessPosture: {
      checkedAt,
      compiledAt: checkedAt,
      extractedAt: checkedAt,
      sourceCapturedAt: checkedAt,
      state: "fresh" as const,
      summary: "Fresh synthetic benchmark contract posture.",
    },
    limitationPosture: [
      {
        affectedAnchorIds: [],
        affectedSourceIds: [],
        code: "not_source_truth" as const,
        severity: "blocking" as const,
        summary: "V2F benchmark contracts are not source truth.",
      },
    ],
    noRuntimeBoundary: noRuntimeBoundary(),
    permittedNextActions: [
      {
        action: "request_human_review" as const,
        label: "Review benchmark contract posture.",
        targetId: "synthetic-company",
      },
    ],
    privacyBoundary: privacyBoundary(),
    proofExpectations: {
      localProofOnly: true,
      machineReadable: true,
      noDatasetRequired: true,
      noRuntimeBehavior: true,
    },
    readOnlyDefinitionOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    taskKind,
    taskName: `Synthetic ${taskKind} task contract`,
  };
}

function communityPackManifest() {
  return {
    allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
    architectureMap: architectureMap(),
    benchmarkCase: benchmarkCase(),
    containsNoDataOrSourcePackReferences: true,
    contributorChallenge: contributorChallenge(),
    describesFutureCommunityPackOnly: true,
    manifestKind: "CommunityPackManifest",
    noRuntimeBoundary: noRuntimeBoundary(),
    owningFinancePlan: "FP-0086",
    privacyBoundary: privacyBoundary(),
    safeDemoDataPolicy: safeDemoDataPolicy(),
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    syntheticFinanceSourcePolicy: syntheticFinanceSourcePolicy(),
    validationPosture: {
      directProofCommandOnly: true,
      inMemorySyntheticExamplesOnly: true,
      noDataFileAliasesAllowed: true,
      noPackageScriptOrSmokeAlias: true,
    },
  };
}

function fp0087AbsentOrDocsOnlyBoundaryVerified() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0087Files = readdirSync(plansPath).filter((name) =>
    /^FP-0087/u.test(name),
  );

  if (fp0087Files.length === 0) {
    return true;
  }

  if (
    fp0087Files.length !== 1 ||
    fp0087Files[0] !== "FP-0087-read-only-chatgpt-app-mcp-master-plan.md"
  ) {
    return false;
  }

  const planText = readFileSync(`${plansPath}/${fp0087Files[0]}`, "utf8");
  const lowerPlanText = planText.toLowerCase();
  const planBoundaryVerified = [
    "v2g",
    "read-only",
    "chatgpt app/mcp",
    "no app submission",
    "no openai api/model calls",
    "source mutation",
    "finance writes",
    "autonomous action",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const typedProof = AppProofSchema.safeParse(
    buildReadOnlyChatGptAppMcpProof({
      fp0087DocsOnlyBoundaryVerified: planBoundaryVerified,
      fp0088AbsentOrDocsOnlyBoundaryVerified:
        fp0088DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0091AbsentOrLocalUiComponentBoundaryVerified:
        fp0091LocalUiComponentBoundary()
          .absentOrLocalUiComponentBoundaryVerified,
      fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .absentOrLocalUiCompositionAccessibilityBoundaryVerified,
      fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified:
        fp0093LocalUiPreviewRouteBoundary()
          .absentOrDocsOnlyPreviewRouteBoundaryVerified,
      fp0094AbsentOrLocalPreviewRouteBoundaryVerified:
        fp0094LocalPreviewRouteBoundary()
          .absentOrLocalPreviewRouteBoundaryVerified,
      fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
      fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .absentOrLocalPreviewRouteStateMatrixBoundaryVerified,
      fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .absentOrLocalPreviewRouteVisualQaBoundaryVerified,
      fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified:
        fp0098PublicAppReadinessBoundary()
          .absentOrDocsOnlyPublicAppReadinessBoundaryVerified,
      fp0099AbsentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified:
        fp0099PublicAppSecurityThreatModelBoundary()
          .absentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified,
      ...fp0100ReadOnlyAppMcpProofFields(),
      publicAppReadinessPlanBoundaryVerified:
        fp0098PublicAppReadinessBoundary()
          .publicAppReadinessPlanBoundaryVerified,
      noPublicAppImplementationFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noPublicAppImplementationFromFp0098,
      noAppsSdkIframeFromFp0098:
        fp0098PublicAppReadinessBoundary().noAppsSdkIframeFromFp0098,
      noRemoteMcpDeploymentFromFp0098:
        fp0098PublicAppReadinessBoundary().noRemoteMcpDeploymentFromFp0098,
      noEndpointOauthSubmissionFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noEndpointOauthSubmissionFromFp0098,
      noOpenAiApiCallsFromFp0098:
        fp0098PublicAppReadinessBoundary().noOpenAiApiCallsFromFp0098,
      noSourceMutationFinanceWriteFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noSourceMutationFinanceWriteFromFp0098,
      noScreenshotListingSubmissionAssetsFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noScreenshotListingSubmissionAssetsFromFp0098,
      publicAppSecurityThreatModelPlanBoundaryVerified:
        fp0099PublicAppSecurityThreatModelBoundary()
          .publicAppSecurityThreatModelPlanBoundaryVerified,
      noEndpointImplementationFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noEndpointImplementationFromFp0099,
      noOauthImplementationFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noOauthImplementationFromFp0099,
      noRemoteMcpDeploymentFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noRemoteMcpDeploymentFromFp0099,
      noAppsSdkResourceFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noAppsSdkResourceFromFp0099,
      noAppSubmissionFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noAppSubmissionFromFp0099,
      noOpenAiApiCallsFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noOpenAiApiCallsFromFp0099,
      noSourceMutationFinanceWriteFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noSourceMutationFinanceWriteFromFp0099,
      noPublicAssetsSubmissionArtifactsFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noPublicAssetsSubmissionArtifactsFromFp0099,
      premiumUiSecurityPlanBoundaryVerified:
        fp0088DocsOnlyBoundary().premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089DocsOnlyBoundary().premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090DocsOnlyBoundary().premiumUiImplementationPlanBoundaryVerified,
      premiumUiComponentFoundationVerified:
        fp0091LocalUiComponentBoundary().premiumUiComponentFoundationVerified,
      premiumUiCompositionAccessibilityFoundationVerified:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .premiumUiCompositionAccessibilityFoundationVerified,
      localUiPreviewRoutePlanBoundaryVerified:
        fp0093LocalUiPreviewRouteBoundary()
          .localUiPreviewRoutePlanBoundaryVerified,
      localPreviewRouteFoundationVerified:
        fp0094LocalPreviewRouteBoundary().localPreviewRouteFoundationVerified,
      localPreviewRouteStateMatrixPlanBoundaryVerified:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .localPreviewRouteStateMatrixPlanBoundaryVerified,
      localPreviewRouteStateMatrixFoundationVerified:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .localPreviewRouteStateMatrixFoundationVerified,
      localPreviewRouteVisualQaFoundationVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .localPreviewRouteVisualQaFoundationVerified,
      noUiImplementationFromFp0088:
        fp0088DocsOnlyBoundary().noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089DocsOnlyBoundary().noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089DocsOnlyBoundary().noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090DocsOnlyBoundary().noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090DocsOnlyBoundary().noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090DocsOnlyBoundary().noPublicAppImplementationFromFp0090,
      noRoutesFromFp0091: fp0091LocalUiComponentBoundary().noRoutesFromFp0091,
      noEndpointsFromFp0091:
        fp0091LocalUiComponentBoundary().noEndpointsFromFp0091,
      noAppsSdkIframeFromFp0091:
        fp0091LocalUiComponentBoundary().noAppsSdkIframeFromFp0091,
      noOauthSubmissionFromFp0091:
        fp0091LocalUiComponentBoundary().noOauthSubmissionFromFp0091,
      noPublicAppImplementationFromFp0091:
        fp0091LocalUiComponentBoundary().noPublicAppImplementationFromFp0091,
      noOpenAiApiCallsFromFp0091:
        fp0091LocalUiComponentBoundary().noOpenAiApiCallsFromFp0091,
      noSourceMutationFinanceWriteFromFp0091:
        fp0091LocalUiComponentBoundary().noSourceMutationFinanceWriteFromFp0091,
      noRoutesFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary().noRoutesFromFp0092,
      noEndpointsFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary().noEndpointsFromFp0092,
      noAppsSdkIframeFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noAppsSdkIframeFromFp0092,
      noOauthSubmissionFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noOauthSubmissionFromFp0092,
      noPublicAppImplementationFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noPublicAppImplementationFromFp0092,
      noOpenAiApiCallsFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noOpenAiApiCallsFromFp0092,
      noSourceMutationFinanceWriteFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noSourceMutationFinanceWriteFromFp0092,
      noRouteImplementationFromFp0093:
        fp0093LocalUiPreviewRouteBoundary().noRouteImplementationFromFp0093,
      noEndpointOauthSubmissionFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noEndpointOauthSubmissionFromFp0093,
      noPublicAppImplementationFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noPublicAppImplementationFromFp0093,
      noAppsSdkIframeFromFp0093:
        fp0093LocalUiPreviewRouteBoundary().noAppsSdkIframeFromFp0093,
      noOpenAiApiModelCallsFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noOpenAiApiModelCallsFromFp0093,
      noSourceMutationFinanceWriteFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noSourceMutationFinanceWriteFromFp0093,
      noGeneratedProductProseRuntimeCodexFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noGeneratedProductProseRuntimeCodexFromFp0093,
      noApiRoutesFromFp0094:
        fp0094LocalPreviewRouteBoundary().noApiRoutesFromFp0094,
      noBackendRoutesFromFp0094:
        fp0094LocalPreviewRouteBoundary().noBackendRoutesFromFp0094,
      noEndpointsFromFp0094:
        fp0094LocalPreviewRouteBoundary().noEndpointsFromFp0094,
      noAppsSdkIframeFromFp0094:
        fp0094LocalPreviewRouteBoundary().noAppsSdkIframeFromFp0094,
      noOauthSubmissionFromFp0094:
        fp0094LocalPreviewRouteBoundary().noOauthSubmissionFromFp0094,
      noPublicAppImplementationFromFp0094:
        fp0094LocalPreviewRouteBoundary()
          .noPublicAppImplementationFromFp0094,
      noOpenAiApiCallsFromFp0094:
        fp0094LocalPreviewRouteBoundary().noOpenAiApiCallsFromFp0094,
      noSourceMutationFinanceWriteFromFp0094:
        fp0094LocalPreviewRouteBoundary()
          .noSourceMutationFinanceWriteFromFp0094,
      noRouteImplementationFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noRouteImplementationFromFp0095,
      noScreenshotAssetsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noScreenshotAssetsFromFp0095,
      noEndpointOauthSubmissionFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noEndpointOauthSubmissionFromFp0095,
      noPublicAppImplementationFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noPublicAppImplementationFromFp0095,
      noAppsSdkIframeFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noAppsSdkIframeFromFp0095,
      noRemoteMcpDeploymentFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noRemoteMcpDeploymentFromFp0095,
      noOpenAiApiModelCallsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noOpenAiApiModelCallsFromFp0095,
      noProviderCertificationDeploymentFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noProviderCertificationDeploymentFromFp0095,
      noSourceMutationFinanceWriteFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noSourceMutationFinanceWriteFromFp0095,
      noGeneratedProductProseRuntimeCodexFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noGeneratedProductProseRuntimeCodexFromFp0095,
      noPublicAssetsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary().noPublicAssetsFromFp0095,
      noAdditionalRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noAdditionalRoutesFromFp0096,
      noApiRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noApiRoutesFromFp0096,
      noAppsSdkIframeFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noAppsSdkIframeFromFp0096,
      noBackendRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noBackendRoutesFromFp0096,
      noEndpointsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noEndpointsFromFp0096,
      noOauthSubmissionFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noOauthSubmissionFromFp0096,
      noOpenAiApiCallsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noOpenAiApiCallsFromFp0096,
      noPublicAppImplementationFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noPublicAppImplementationFromFp0096,
      noPublicAssetsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noPublicAssetsFromFp0096,
      noScreenshotAssetsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noScreenshotAssetsFromFp0096,
      noSourceMutationFinanceWriteFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noSourceMutationFinanceWriteFromFp0096,
      routeMetadataNoIndexBoundaryVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .routeMetadataNoIndexBoundaryVerified,
      noAdditionalRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noAdditionalRoutesFromFp0097,
      noApiRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noApiRoutesFromFp0097,
      noAppsSdkIframeFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noAppsSdkIframeFromFp0097,
      noBackendRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noBackendRoutesFromFp0097,
      noEndpointsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noEndpointsFromFp0097,
      noOauthSubmissionFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noOauthSubmissionFromFp0097,
      noOpenAiApiCallsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noOpenAiApiCallsFromFp0097,
      noPublicAppImplementationFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .noPublicAppImplementationFromFp0097,
      noPublicAssetsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noPublicAssetsFromFp0097,
      noScreenshotAssetsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noScreenshotAssetsFromFp0097,
      noSourceMutationFinanceWriteFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .noSourceMutationFinanceWriteFromFp0097,
      screenshotlessVisualQaVerified:
        fp0097LocalPreviewRouteVisualQaBoundary().screenshotlessVisualQaVerified,
      accessibilityStateMatrixVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .accessibilityStateMatrixVerified,
    }),
  );

  return (
    typedProof.success &&
    typedProof.data.fp0087DocsOnlyBoundaryVerified &&
    typedProof.data.noPublicChatGptApp &&
    typedProof.data.noRemoteMcpDeployment &&
    typedProof.data.noOpenAiApiCalls
  );
}

function fp0088DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0088Files = readdirSync(plansPath).filter((name) =>
    /^FP-0088/u.test(name),
  );

  if (fp0088Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noEndpointOauthSubmissionFromFp0088: true,
      noUiImplementationFromFp0088: true,
      premiumUiSecurityPlanBoundaryVerified: true,
    };
  }

  if (fp0088Files.length !== 1 || fp0088Files[0] !== FP0088_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noEndpointOauthSubmissionFromFp0088: false,
      noUiImplementationFromFp0088: false,
      premiumUiSecurityPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0088_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0088 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0088: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiImplementationFromFp0088: [
      "does not authorize apps sdk iframe/ui code",
      "future ui polish/design-system implementation plan",
      "do not implement ui",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiSecurityPlanBoundaryVerified: [
      "premium ui readiness requirements only",
      "app/mcp security readiness requirements only",
      "evidenceanswerpanel",
      "privacyboundarypanel",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0089DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0089Files = readdirSync(plansPath).filter((name) =>
    /^FP-0089/u.test(name),
  );

  if (fp0089Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0089: true,
      noEndpointOauthSubmissionFromFp0089: true,
      noUiImplementationFromFp0089: true,
      premiumUiDesignSystemPlanBoundaryVerified: true,
    };
  }

  if (fp0089Files.length !== 1 || fp0089Files[0] !== FP0089_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0089: false,
      noEndpointOauthSubmissionFromFp0089: false,
      noUiImplementationFromFp0089: false,
      premiumUiDesignSystemPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0089_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0089 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "premium ui design-system readiness plan only",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noAppsSdkIframeFromFp0089: [
      "does not authorize apps sdk iframe/ui code",
      "does not authorize public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0089: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize endpoint implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiImplementationFromFp0089: [
      "does not authorize ui code",
      "later ui implementation finance plan before any component code",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiDesignSystemPlanBoundaryVerified: [
      "premium ui design-system readiness plan only",
      "design tokens",
      "semantic color tokens",
      "evidence-card hierarchy",
      "citation/source-anchor affordances",
      "refusal-state visual grammar",
      "keyboard/focus behavior",
      "evidenceanswerpanel",
      "privacyboundarypanel",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0090DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0090Files = readdirSync(plansPath).filter((name) =>
    /^FP-0090/u.test(name),
  );

  if (fp0090Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0090: true,
      noEndpointOauthSubmissionFromFp0090: true,
      noPublicAppImplementationFromFp0090: true,
      noUiCodeFromFp0090: true,
      premiumUiImplementationPlanBoundaryVerified: true,
    };
  }

  if (fp0090Files.length !== 1 || fp0090Files[0] !== FP0090_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0090: false,
      noEndpointOauthSubmissionFromFp0090: false,
      noPublicAppImplementationFromFp0090: false,
      noUiCodeFromFp0090: false,
      premiumUiImplementationPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0090_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0090 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "premium ui implementation master-plan only",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
      "no public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noAppsSdkIframeFromFp0090: [
      "does not authorize apps sdk iframe/ui code yet",
      "apps sdk iframe/ui implementation remains future-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0090: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize endpoint implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noPublicAppImplementationFromFp0090: [
      "does not authorize public app implementation",
      "public chatgpt app implementation remains future-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiCodeFromFp0090: [
      "does not authorize ui code yet",
      "this is not ui implementation",
      "future implementation slice may add ui components only if it remains local/proof-only/read-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiImplementationPlanBoundaryVerified: [
      "future ui implementation boundary",
      "screenshot review before merge",
      "accessibility acceptance criteria",
      "evidence hierarchy acceptance",
      "appshell",
      "evidenceanswerpanel",
      "citationrail",
      "apps/web/components/read-only-app-mcp",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0091LocalUiComponentBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0091Files = readdirSync(plansPath).filter((name) =>
    /^FP-0091/u.test(name),
  );
  const absentBoundary = {
    absentOrLocalUiComponentBoundaryVerified: true,
    noAppsSdkIframeFromFp0091: true,
    noEndpointsFromFp0091: true,
    noOauthSubmissionFromFp0091: true,
    noOpenAiApiCallsFromFp0091: true,
    noPublicAppImplementationFromFp0091: true,
    noRoutesFromFp0091: true,
    noSourceMutationFinanceWriteFromFp0091: true,
    premiumUiComponentFoundationVerified: true,
  };
  const failedBoundary = {
    absentOrLocalUiComponentBoundaryVerified: false,
    noAppsSdkIframeFromFp0091: false,
    noEndpointsFromFp0091: false,
    noOauthSubmissionFromFp0091: false,
    noOpenAiApiCallsFromFp0091: false,
    noPublicAppImplementationFromFp0091: false,
    noRoutesFromFp0091: false,
    noSourceMutationFinanceWriteFromFp0091: false,
    premiumUiComponentFoundationVerified: false,
  };

  if (fp0091Files.length === 0) return absentBoundary;
  if (fp0091Files.length !== 1 || fp0091Files[0] !== FP0091_PLAN_FILE) {
    return failedBoundary;
  }

  const repoRoot = existsSync("plans") ? "." : "../..";
  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0091_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();
  const componentSource = readComponentSource(
    `${repoRoot}/apps/web/components/read-only-app-mcp`,
  ).toLowerCase();
  const normalizedComponentSource = componentSource.replace(/[^a-z0-9]+/gu, "");
  const componentFilesVerified =
    componentSource.length > 0 &&
    [
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "evidencecardstack",
      "citationrail",
      "sourceanchorpanel",
      "freshnessbadge",
      "freshnesssummarypanel",
      "limitationcallout",
      "permittednextactionspanel",
      "forbiddenactionspanel",
      "privacyboundarypanel",
      "noruntimeboundarypanel",
      "promptinjectionwarningstate",
      "rawfullfiledumprefusalstate",
      "emptyevidencestate",
      "loadingevidencestate",
      "errorandunsupportedstate",
    ].every((name) => normalizedComponentSource.includes(name));
  const premiumUiComponentFoundationVerified =
    componentFilesVerified &&
    [
      "this slice writes actual ui component code",
      "strictly local, proof-only, read-only, and component-only",
      "local react components",
      "apps/web/components/read-only-app-mcp",
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "citationrail",
      "sourceanchorpanel",
      "errorandunsupportedstate",
    ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noRoutesFromFp0091 =
    ["does not add routes", "no app routes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !existsSync(`${repoRoot}/apps/web/app/read-only-app-mcp`);
  const noEndpointsFromFp0091 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !existsSync(`${repoRoot}/apps/web/app/api/read-only-app-mcp`);
  const noAppsSdkIframeFromFp0091 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lowerPlanText.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0091 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0091 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noOpenAiApiCallsFromFp0091 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0091 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    );

  return {
    absentOrLocalUiComponentBoundaryVerified:
      premiumUiComponentFoundationVerified &&
      noRoutesFromFp0091 &&
      noEndpointsFromFp0091 &&
      noAppsSdkIframeFromFp0091 &&
      noOauthSubmissionFromFp0091 &&
      noPublicAppImplementationFromFp0091 &&
      noOpenAiApiCallsFromFp0091 &&
      noSourceMutationFinanceWriteFromFp0091,
    noAppsSdkIframeFromFp0091,
    noEndpointsFromFp0091,
    noOauthSubmissionFromFp0091,
    noOpenAiApiCallsFromFp0091,
    noPublicAppImplementationFromFp0091,
    noRoutesFromFp0091,
    noSourceMutationFinanceWriteFromFp0091,
    premiumUiComponentFoundationVerified,
  };
}

function fp0092LocalUiCompositionAccessibilityBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0092Files = readdirSync(plansPath).filter((name) =>
    /^FP-0092/u.test(name),
  );
  const absentBoundary = {
    absentOrLocalUiCompositionAccessibilityBoundaryVerified: true,
    noAppsSdkIframeFromFp0092: true,
    noEndpointsFromFp0092: true,
    noOauthSubmissionFromFp0092: true,
    noOpenAiApiCallsFromFp0092: true,
    noPublicAppImplementationFromFp0092: true,
    noRoutesFromFp0092: true,
    noSourceMutationFinanceWriteFromFp0092: true,
    premiumUiCompositionAccessibilityFoundationVerified: true,
  };
  const failedBoundary = {
    absentOrLocalUiCompositionAccessibilityBoundaryVerified: false,
    noAppsSdkIframeFromFp0092: false,
    noEndpointsFromFp0092: false,
    noOauthSubmissionFromFp0092: false,
    noOpenAiApiCallsFromFp0092: false,
    noPublicAppImplementationFromFp0092: false,
    noRoutesFromFp0092: false,
    noSourceMutationFinanceWriteFromFp0092: false,
    premiumUiCompositionAccessibilityFoundationVerified: false,
  };

  if (fp0092Files.length === 0) return absentBoundary;
  if (fp0092Files.length !== 1 || fp0092Files[0] !== FP0092_PLAN_FILE) {
    return failedBoundary;
  }

  const repoRoot = existsSync("plans") ? "." : "../..";
  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0092_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();
  const componentSource = readComponentSource(
    `${repoRoot}/apps/web/components/read-only-app-mcp`,
  ).toLowerCase();
  const componentAndTestSource = readComponentAndTestSource(
    `${repoRoot}/apps/web/components/read-only-app-mcp`,
  ).toLowerCase();
  const normalizedComponentSource = componentSource.replace(/[^a-z0-9]+/gu, "");
  const normalizedComponentAndTestSource = componentAndTestSource.replace(
    /[^a-z0-9]+/gu,
    "",
  );
  const componentCompositionAccessibilityVerified = [
    "readonlyappmcpenvelopepreview",
    "readonlyappmcpexperienceframe",
    "createreadonlyappmcpsectionid",
    "headinglevel",
    "ariabusy",
    "forbiddenrawprivatefieldnames",
    "contrastratio",
    "dataresponsive",
  ].every((name) => normalizedComponentAndTestSource.includes(name));
  const premiumUiCompositionAccessibilityFoundationVerified =
    componentCompositionAccessibilityVerified &&
    [
      "this slice writes actual ui component/composition code",
      "limited to component composition and accessibility hardening",
      "local read-only ui composition/accessibility hardening",
      "apps/web/components/read-only-app-mcp",
      "readonlyappmcpenvelopepreview",
      "heading-level control",
      "scoped section ids",
      "accessibility tests",
      "contrast/token proof",
    ].every((requiredText) =>
      lowerPlanText.replace(/`/gu, "").includes(requiredText),
    );
  const noRoutesFromFp0092 =
    ["does not add app routes", "no app routes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !existsSync(`${repoRoot}/apps/web/app/read-only-app-mcp`);
  const noEndpointsFromFp0092 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !existsSync(`${repoRoot}/apps/web/app/api/read-only-app-mcp`);
  const noAppsSdkIframeFromFp0092 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lowerPlanText.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0092 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0092 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noOpenAiApiCallsFromFp0092 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0092 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    );

  return {
    absentOrLocalUiCompositionAccessibilityBoundaryVerified:
      premiumUiCompositionAccessibilityFoundationVerified &&
      noRoutesFromFp0092 &&
      noEndpointsFromFp0092 &&
      noAppsSdkIframeFromFp0092 &&
      noOauthSubmissionFromFp0092 &&
      noPublicAppImplementationFromFp0092 &&
      noOpenAiApiCallsFromFp0092 &&
      noSourceMutationFinanceWriteFromFp0092,
    noAppsSdkIframeFromFp0092,
    noEndpointsFromFp0092,
    noOauthSubmissionFromFp0092,
    noOpenAiApiCallsFromFp0092,
    noPublicAppImplementationFromFp0092,
    noRoutesFromFp0092,
    noSourceMutationFinanceWriteFromFp0092,
    premiumUiCompositionAccessibilityFoundationVerified,
  };
}

function fp0093LocalUiPreviewRouteBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0093Files = readdirSync(plansPath).filter((name) =>
    /^FP-0093/u.test(name),
  );
  const absentBoundary = {
    absentOrDocsOnlyPreviewRouteBoundaryVerified: true,
    localUiPreviewRoutePlanBoundaryVerified: true,
    noAppsSdkIframeFromFp0093: true,
    noEndpointOauthSubmissionFromFp0093: true,
    noGeneratedProductProseRuntimeCodexFromFp0093: true,
    noOpenAiApiModelCallsFromFp0093: true,
    noPublicAppImplementationFromFp0093: true,
    noRouteImplementationFromFp0093: true,
    noSourceMutationFinanceWriteFromFp0093: true,
  };
  const failedBoundary = {
    absentOrDocsOnlyPreviewRouteBoundaryVerified: false,
    localUiPreviewRoutePlanBoundaryVerified: false,
    noAppsSdkIframeFromFp0093: false,
    noEndpointOauthSubmissionFromFp0093: false,
    noGeneratedProductProseRuntimeCodexFromFp0093: false,
    noOpenAiApiModelCallsFromFp0093: false,
    noPublicAppImplementationFromFp0093: false,
    noRouteImplementationFromFp0093: false,
    noSourceMutationFinanceWriteFromFp0093: false,
  };

  if (fp0093Files.length === 0) return absentBoundary;
  if (fp0093Files.length !== 1 || fp0093Files[0] !== FP0093_PLAN_FILE) {
    return failedBoundary;
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0093_PLAN_FILE}`,
    "utf8",
  )
    .toLowerCase()
    .replace(/[`_*]+/gu, "");
  const docsOnlyBoundaryVerified = [
    "fp-0093 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "local ui preview route master-plan only",
    "creates no product code",
    "no route code",
    "no app route",
    "no api route",
    "backend routes",
    "no endpoint implementation",
    "no remote mcp server",
    "no apps sdk iframe/ui resource registration",
    "no oauth",
    "no app submission",
    "no public app implementation",
    "no openai api/model calls",
    "no source mutation",
    "no finance writes",
    "no generated product prose",
    "no runtime-codex finance output",
    "no autonomous action",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const localUiPreviewRoutePlanBoundaryVerified = [
    "future local preview route boundary",
    "apps/web/app/read-only-app-mcp-preview/page.tsx",
    "future route implementation slice may add one local read-only web page only",
    "existing fp-0091 and fp-0092 components only",
    "no fetch",
    "no post",
    "no form",
    "no buttons or action-looking forbidden controls",
    "no server action",
    "no api route",
    "backend routes",
    "no raw full-file dump panels",
    "no advice-like cta copy",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noRouteImplementationFromFp0093 =
    [
      "does not authorize route code yet",
      "this is not route implementation",
      "no route code",
      "no app route",
    ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0093 =
    [
      "does not authorize endpoint implementation",
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize app submission",
      "no endpoint implementation",
      "no oauth",
      "no app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noPublicAppImplementationFromFp0093 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation must still wait",
    "public app implementation",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noAppsSdkIframeFromFp0093 = [
    "does not authorize apps sdk iframe/ui resources",
    "no apps sdk iframe/ui resource registration",
    "apps sdk iframe/ui resource implementation",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noOpenAiApiModelCallsFromFp0093 = [
    "no openai api/model calls",
    "no openai api key was created or used",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0093 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    );
  const noGeneratedProductProseRuntimeCodexFromFp0093 =
    [
      "no generated product prose",
      "no runtime-codex finance output",
      "no mission-facing output was generated",
    ].every((requiredText) => lowerPlanText.includes(requiredText));

  return {
    absentOrDocsOnlyPreviewRouteBoundaryVerified:
      docsOnlyBoundaryVerified &&
      localUiPreviewRoutePlanBoundaryVerified &&
      noRouteImplementationFromFp0093 &&
      noEndpointOauthSubmissionFromFp0093 &&
      noPublicAppImplementationFromFp0093 &&
      noAppsSdkIframeFromFp0093 &&
      noOpenAiApiModelCallsFromFp0093 &&
      noSourceMutationFinanceWriteFromFp0093 &&
      noGeneratedProductProseRuntimeCodexFromFp0093,
    localUiPreviewRoutePlanBoundaryVerified,
    noAppsSdkIframeFromFp0093,
    noEndpointOauthSubmissionFromFp0093,
    noGeneratedProductProseRuntimeCodexFromFp0093,
    noOpenAiApiModelCallsFromFp0093,
    noPublicAppImplementationFromFp0093,
    noRouteImplementationFromFp0093,
    noSourceMutationFinanceWriteFromFp0093,
  };
}

function fp0094LocalPreviewRouteBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const repoRoot = existsSync("plans") ? "." : "../..";
  const fp0094Files = readdirSync(plansPath).filter((name) =>
    /^FP-0094/u.test(name),
  );
  const routeDirectory = `${repoRoot}/apps/web/app/read-only-app-mcp-preview`;
  const routePagePath = `${routeDirectory}/page.tsx`;
  const routeSpecPath = `${routeDirectory}/page.spec.tsx`;
  const routePaths = existsSync(routeDirectory)
    ? readdirSync(routeDirectory).map((name) => `${routeDirectory}/${name}`)
    : [];
  const routeExists = existsSync(routePagePath);
  const allowedRouteFilesOnly =
    routePaths.length === 2 &&
    routePaths.includes(routePagePath) &&
    routePaths.includes(routeSpecPath);
  const absentBoundary = {
    absentOrLocalPreviewRouteBoundaryVerified: routePaths.length === 0,
    localPreviewRouteFoundationVerified: routePaths.length === 0,
    noApiRoutesFromFp0094: routePaths.length === 0,
    noAppsSdkIframeFromFp0094: routePaths.length === 0,
    noBackendRoutesFromFp0094: routePaths.length === 0,
    noEndpointsFromFp0094: routePaths.length === 0,
    noOauthSubmissionFromFp0094: routePaths.length === 0,
    noOpenAiApiCallsFromFp0094: routePaths.length === 0,
    noPublicAppImplementationFromFp0094: routePaths.length === 0,
    noSourceMutationFinanceWriteFromFp0094: routePaths.length === 0,
  };
  const failedBoundary = {
    absentOrLocalPreviewRouteBoundaryVerified: false,
    localPreviewRouteFoundationVerified: false,
    noApiRoutesFromFp0094: false,
    noAppsSdkIframeFromFp0094: false,
    noBackendRoutesFromFp0094: false,
    noEndpointsFromFp0094: false,
    noOauthSubmissionFromFp0094: false,
    noOpenAiApiCallsFromFp0094: false,
    noPublicAppImplementationFromFp0094: false,
    noSourceMutationFinanceWriteFromFp0094: false,
  };

  if (fp0094Files.length === 0) return absentBoundary;
  if (fp0094Files.length !== 1 || fp0094Files[0] !== FP0094_PLAN_FILE) {
    return failedBoundary;
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0094_PLAN_FILE}`,
    "utf8",
  )
    .toLowerCase()
    .replace(/[`_*]+/gu, "");
  const routeSource = routeExists ? readFileSync(routePagePath, "utf8") : "";
  const routeSpecSource = existsSync(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
    : "";
  const routeAndSpecNormalized = `${routeSource}\n${routeSpecSource}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "");
  const apiRouteExists =
    existsSync(`${repoRoot}/apps/web/app/api/read-only-app-mcp-preview`) ||
    existsSync(`${routeDirectory}/route.ts`) ||
    existsSync(`${routeDirectory}/route.tsx`);
  const backendRouteExists = readComponentSource(
    `${repoRoot}/apps/control-plane`,
  )
    .toLowerCase()
    .includes("read-only-app-mcp-preview");
  const endpointImplementationExists =
    apiRouteExists ||
    backendRouteExists ||
    /export\s+async\s+function\s+(get|post|put|patch|delete)|nextresponse|fastify\./iu.test(
      routeSource,
    );
  const localPreviewRouteFoundationVerified =
    routeExists &&
    allowedRouteFilesOnly &&
    [
      "fp-0094 is the first route implementation slice",
      "adds exactly one local read-only web page",
      "apps/web/app/read-only-app-mcp-preview/page.tsx",
      "this slice writes actual route code",
      "in-memory synthetic contract-shaped examples",
      "does not fetch data",
      "does not add api endpoints",
      "does not add backend/control-plane routes",
      "does not add remote mcp",
      "does not add oauth",
      "does not add app submission",
      "does not add openai api/model calls",
      "no source mutation",
      "no finance writes",
    ].every((requiredText) => lowerPlanText.includes(requiredText)) &&
    [
      "readonlyappmcpexperienceframe",
      "previewfreshness",
      "syntheticcontractshapedexamplesonly",
      "nodatafetchapicallormutationtransport",
      "noformbuttonfileinputcontrolorserveraction",
    ].every((requiredText) =>
      routeAndSpecNormalized.includes(requiredText),
    );
  const noApiRoutesFromFp0094 =
    ["no web api routes", "does not add api endpoints"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !apiRouteExists;
  const noBackendRoutesFromFp0094 =
    ["no backend/control-plane routes", "backend routes"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    ) && !backendRouteExists;
  const noEndpointsFromFp0094 =
    ["no endpoints", "no endpoint"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    ) && !endpointImplementationExists;
  const noAppsSdkIframeFromFp0094 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lowerPlanText.includes(requiredText)) &&
    !/(iframe|postmessage|registerresource|apps-sdk)/iu.test(routeSource);
  const noOauthSubmissionFromFp0094 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lowerPlanText.includes(requiredText),
    );
  const noPublicAppImplementationFromFp0094 = [
    "does not implement a public chatgpt app",
    "no public app implementation",
    "public app implementation",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const noOpenAiApiCallsFromFp0094 =
    [
      "does not add openai api/model calls",
      "no openai api key was created or used",
    ].every((requiredText) => lowerPlanText.includes(requiredText)) &&
    !/(openai_api_key|from\s+["']openai["']|openai\.|responses\.create|chat\.completions)/iu.test(
      routeSource,
    );
  const noSourceMutationFinanceWriteFromFp0094 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lowerPlanText.includes(requiredText),
    );

  return {
    absentOrLocalPreviewRouteBoundaryVerified:
      localPreviewRouteFoundationVerified &&
      noApiRoutesFromFp0094 &&
      noBackendRoutesFromFp0094 &&
      noEndpointsFromFp0094 &&
      noAppsSdkIframeFromFp0094 &&
      noOauthSubmissionFromFp0094 &&
      noPublicAppImplementationFromFp0094 &&
      noOpenAiApiCallsFromFp0094 &&
      noSourceMutationFinanceWriteFromFp0094,
    localPreviewRouteFoundationVerified,
    noApiRoutesFromFp0094,
    noAppsSdkIframeFromFp0094,
    noBackendRoutesFromFp0094,
    noEndpointsFromFp0094,
    noOauthSubmissionFromFp0094,
    noOpenAiApiCallsFromFp0094,
    noPublicAppImplementationFromFp0094,
    noSourceMutationFinanceWriteFromFp0094,
  };
}

function fp0095LocalPreviewRouteStateMatrixBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const repoRoot = existsSync("plans") ? "." : "../..";
  const fp0095Files = readdirSync(plansPath).filter((name) =>
    /^FP-0095/u.test(name),
  );
  const routeDirectory = `${repoRoot}/apps/web/app/read-only-app-mcp-preview`;
  const routeFiles = existsSync(routeDirectory)
    ? readdirSync(routeDirectory).map((name) =>
        `apps/web/app/read-only-app-mcp-preview/${name}`,
      )
    : [];
  const routePagePath = `${repoRoot}/apps/web/app/read-only-app-mcp-preview/page.tsx`;
  const routeSpecPath = `${repoRoot}/apps/web/app/read-only-app-mcp-preview/page.spec.tsx`;
  const routeSource = existsSync(routePagePath)
    ? readFileSync(routePagePath, "utf8")
    : "";
  const routeSpecSource = existsSync(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
    : "";
  const routeAndSpecSource = `${routeSource}\n${routeSpecSource}`;
  const allowedRouteFilesOnly =
    routeFiles.length === 2 &&
    routeFiles.includes("apps/web/app/read-only-app-mcp-preview/page.tsx") &&
    routeFiles.includes(
      "apps/web/app/read-only-app-mcp-preview/page.spec.tsx",
    );
  const absentBoundary = {
    absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified: true,
    localPreviewRouteStateMatrixPlanBoundaryVerified: true,
    noAppsSdkIframeFromFp0095: true,
    noEndpointOauthSubmissionFromFp0095: true,
    noGeneratedProductProseRuntimeCodexFromFp0095: true,
    noOpenAiApiModelCallsFromFp0095: true,
    noProviderCertificationDeploymentFromFp0095: true,
    noPublicAppImplementationFromFp0095: true,
    noPublicAssetsFromFp0095: true,
    noRemoteMcpDeploymentFromFp0095: true,
    noRouteImplementationFromFp0095: true,
    noScreenshotAssetsFromFp0095: true,
    noSourceMutationFinanceWriteFromFp0095: true,
  };
  const failedBoundary = {
    absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified: false,
    localPreviewRouteStateMatrixPlanBoundaryVerified: false,
    noAppsSdkIframeFromFp0095: false,
    noEndpointOauthSubmissionFromFp0095: false,
    noGeneratedProductProseRuntimeCodexFromFp0095: false,
    noOpenAiApiModelCallsFromFp0095: false,
    noProviderCertificationDeploymentFromFp0095: false,
    noPublicAppImplementationFromFp0095: false,
    noPublicAssetsFromFp0095: false,
    noRemoteMcpDeploymentFromFp0095: false,
    noRouteImplementationFromFp0095: false,
    noScreenshotAssetsFromFp0095: false,
    noSourceMutationFinanceWriteFromFp0095: false,
  };

  if (fp0095Files.length === 0) return absentBoundary;
  if (fp0095Files.length !== 1 || fp0095Files[0] !== FP0095_PLAN_FILE) {
    return failedBoundary;
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0095_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();
  const normalized = lowerPlanText.replace(/[`_*]+/gu, "");
  const apiRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp") ||
      path.startsWith("apps/web/app/read-only-app-mcp-preview/route."),
  );
  const backendRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/control-plane/") &&
      /read-only-app-mcp-preview|state-matrix|fp-0095|fp0095/u.test(path),
  );
  const endpointImplementationExists =
    apiRouteExists ||
    backendRouteExists ||
    /export\s+async\s+function\s+(get|post|put|patch|delete)|nextresponse|fastify\./iu.test(
      routeSource,
    );
  const fp0095AssetPaths = repoFilePaths().filter(
    (path) =>
      /(fp-0095|fp0095|state-matrix|read-only-app-mcp-preview)/iu.test(path) &&
      /\.(png|jpe?g|webp|gif|svg|avif)$/iu.test(path),
  );
  const appSubmissionAssetPaths = repoFilePaths().filter(
    (path) =>
      /(app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ) &&
      /(fp-0095|fp0095|state-matrix|read-only-app-mcp-preview)/iu.test(path),
  );
  const docsOnlyBoundaryVerified = [
    "fp-0095 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "local preview route state-matrix and premium visual qa master-plan only",
    "no route code",
    "no app route",
    "no api route",
    "no backend route",
    "no endpoint implementation",
    "no remote mcp server",
    "no apps sdk iframe/ui resource registration",
    "no oauth",
    "no app submission",
    "no public app implementation",
    "no openai api/model calls",
    "no provider/certification/deployment work",
    "no source mutation",
    "no finance writes",
    "no generated product prose",
    "no runtime-codex finance output",
    "no autonomous action",
    "no screenshot binaries",
    "no generated image assets",
    "no public assets",
  ].every((requiredText) => normalized.includes(requiredText));
  const localPreviewRouteStateMatrixPlanBoundaryVerified =
    [
      "future local read-only preview route state matrix",
      "premium visual qa",
      "noindex/local-only metadata",
      "answer state",
      "missing citation refusal",
      "unsupported evidence refusal",
      "stale evidence refusal",
      "conflicting evidence refusal",
      "prompt-injection warning state",
      "raw full-file dump refusal state",
      "unsafe action refusal state",
      "empty evidence state",
      "loading evidence state",
      "error/unsupported state",
      "privacy/no-runtime boundary state",
      "no fetch",
      "no post",
      "no form",
      "no buttons/action-looking forbidden controls",
      "no server action",
      "no openai api/model call",
      "no screenshot/image/public asset files",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    allowedRouteFilesOnly;
  const noRouteImplementationFromFp0095 =
    [
      "fp-0095 does not authorize route code yet",
      "this is not route implementation",
      "do not add the state matrix yet",
      "no route code",
      "no app route",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    allowedRouteFilesOnly;
  const noEndpointOauthSubmissionFromFp0095 =
    [
      "does not authorize endpoint implementation",
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize app submission",
      "no endpoint implementation",
      "no oauth",
      "no app submission",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !endpointImplementationExists &&
    appSubmissionAssetPaths.length === 0;
  const noPublicAppImplementationFromFp0095 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation must still wait",
    "public app implementation must still wait",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkIframeFromFp0095 =
    [
      "does not authorize apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
      "apps sdk iframe/ui resource implementation",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !/(iframe|postmessage|registerresource|apps-sdk)/iu.test(
      routeAndSpecSource,
    );
  const noRemoteMcpDeploymentFromFp0095 = [
    "does not authorize remote mcp deployment",
    "no remote mcp server",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiModelCallsFromFp0095 =
    ["no openai api/model calls", "no openai api key was created or used"].every(
      (requiredText) => normalized.includes(requiredText),
    ) &&
    !/(openai_api_key|from\s+["']openai["']|openai\.|responses\.create|chat\.completions)/iu.test(
      routeSource,
    );
  const noProviderCertificationDeploymentFromFp0095 =
    [
      "no provider/certification/deployment work",
      "no provider/certification/deployment/external communications",
    ].every((requiredText) => normalized.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0095 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      normalized.includes(requiredText),
    );
  const noGeneratedProductProseRuntimeCodexFromFp0095 =
    [
      "no generated product prose",
      "no runtime-codex finance output",
      "no mission-facing output was generated",
    ].every((requiredText) => normalized.includes(requiredText));
  const noScreenshotAssetsFromFp0095 =
    [
      "do not add screenshots",
      "no screenshot binaries",
      "no generated image assets",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    fp0095AssetPaths.length === 0;
  const noPublicAssetsFromFp0095 =
    [
      "no public listing assets",
      "no app-submission assets",
      "no public assets",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    fp0095AssetPaths.length === 0 &&
    appSubmissionAssetPaths.length === 0;

  return {
    absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
      docsOnlyBoundaryVerified &&
      localPreviewRouteStateMatrixPlanBoundaryVerified &&
      noRouteImplementationFromFp0095 &&
      noScreenshotAssetsFromFp0095 &&
      noEndpointOauthSubmissionFromFp0095 &&
      noPublicAppImplementationFromFp0095 &&
      noAppsSdkIframeFromFp0095 &&
      noRemoteMcpDeploymentFromFp0095 &&
      noOpenAiApiModelCallsFromFp0095 &&
      noProviderCertificationDeploymentFromFp0095 &&
      noSourceMutationFinanceWriteFromFp0095 &&
      noGeneratedProductProseRuntimeCodexFromFp0095 &&
      noPublicAssetsFromFp0095,
    localPreviewRouteStateMatrixPlanBoundaryVerified,
    noAppsSdkIframeFromFp0095,
    noEndpointOauthSubmissionFromFp0095,
    noGeneratedProductProseRuntimeCodexFromFp0095,
    noOpenAiApiModelCallsFromFp0095,
    noProviderCertificationDeploymentFromFp0095,
    noPublicAppImplementationFromFp0095,
    noPublicAssetsFromFp0095,
    noRemoteMcpDeploymentFromFp0095,
    noRouteImplementationFromFp0095,
    noScreenshotAssetsFromFp0095,
    noSourceMutationFinanceWriteFromFp0095,
  };
}

function fp0096LocalPreviewRouteStateMatrixBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const repoRoot = existsSync("plans") ? "." : "../..";
  const fp0096Files = readdirSync(plansPath).filter((name) =>
    /^FP-0096/u.test(name),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeSource = routePaths.includes(routePagePath)
    ? readFileSync(`${repoRoot}/${routePagePath}`, "utf8")
    : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(`${repoRoot}/${routeSpecPath}`, "utf8")
    : "";
  const routeAndSpecSource = `${routeSource}\n${routeSpecSource}`;
  const normalizedRouteAndSpec = routeAndSpecSource.toLowerCase();
  const allowedRouteFilesOnly =
    routePaths.length === 2 &&
    routePaths.includes(routePagePath) &&
    routePaths.includes(routeSpecPath);
  const absentBoundary = {
    absentOrLocalPreviewRouteStateMatrixBoundaryVerified: true,
    localPreviewRouteStateMatrixFoundationVerified: true,
    noAdditionalRoutesFromFp0096: true,
    noApiRoutesFromFp0096: true,
    noAppsSdkIframeFromFp0096: true,
    noBackendRoutesFromFp0096: true,
    noEndpointsFromFp0096: true,
    noOauthSubmissionFromFp0096: true,
    noOpenAiApiCallsFromFp0096: true,
    noPublicAppImplementationFromFp0096: true,
    noPublicAssetsFromFp0096: true,
    noScreenshotAssetsFromFp0096: true,
    noSourceMutationFinanceWriteFromFp0096: true,
    routeMetadataNoIndexBoundaryVerified: true,
  };
  const failedBoundary = {
    absentOrLocalPreviewRouteStateMatrixBoundaryVerified: false,
    localPreviewRouteStateMatrixFoundationVerified: false,
    noAdditionalRoutesFromFp0096: false,
    noApiRoutesFromFp0096: false,
    noAppsSdkIframeFromFp0096: false,
    noBackendRoutesFromFp0096: false,
    noEndpointsFromFp0096: false,
    noOauthSubmissionFromFp0096: false,
    noOpenAiApiCallsFromFp0096: false,
    noPublicAppImplementationFromFp0096: false,
    noPublicAssetsFromFp0096: false,
    noScreenshotAssetsFromFp0096: false,
    noSourceMutationFinanceWriteFromFp0096: false,
    routeMetadataNoIndexBoundaryVerified: false,
  };

  if (fp0096Files.length === 0) return absentBoundary;
  if (fp0096Files.length !== 1 || fp0096Files[0] !== FP0096_PLAN_FILE) {
    return failedBoundary;
  }

  const lower = readFileSync(
    `${plansPath}/${FP0096_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();
  const normalized = lower.replace(/[`_*]+/gu, "");
  const routeMetadataNoIndexBoundaryVerified =
    /export\s+const\s+metadata/u.test(routeSource) &&
    /title:\s*["']pocket cfo local read-only app\/mcp preview["']/iu.test(
      routeSource,
    ) &&
    /robots:\s*\{/u.test(routeSource) &&
    /index:\s*false/u.test(routeSource) &&
    /follow:\s*false/u.test(routeSource) &&
    /noarchive:\s*true/u.test(routeSource);
  const apiRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp") ||
      path.startsWith("apps/web/app/read-only-app-mcp-preview/route."),
  );
  const backendRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/control-plane/") &&
      /read-only-app-mcp-preview|state-matrix|fp-0096|fp0096/u.test(path),
  );
  const endpointImplementationExists =
    apiRouteExists ||
    backendRouteExists ||
    /export\s+async\s+function\s+(get|post|put|patch|delete)|nextresponse|fastify\./iu.test(
      routeSource,
    );
  const screenshotAssetPaths = repoFilePaths().filter(
    (path) =>
      /(fp-0096|fp0096|state-matrix|read-only-app-mcp-preview)/iu.test(path) &&
      /\.(png|jpe?g|webp|gif|svg|avif)$/iu.test(path),
  );
  const publicAssetPaths = repoFilePaths().filter(
    (path) =>
      /(^|\/)public\//u.test(path) &&
      /(fp-0096|fp0096|state-matrix|read-only-app-mcp-preview|app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ),
  );
  const appSubmissionAssetPaths = repoFilePaths().filter(
    (path) =>
      /(app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ) &&
      /(fp-0096|fp0096|state-matrix|read-only-app-mcp-preview)/iu.test(path),
  );
  const localPreviewRouteStateMatrixFoundationVerified =
    [
      "fp-0096",
      "local/proof-only/read-only",
      "existing local read-only preview route",
      "one route extension",
      "in-memory synthetic contract-shaped examples only",
      "answer state",
      "missing citation refusal",
      "unsupported evidence refusal",
      "stale evidence refusal",
      "prompt-injection",
      "raw full-file dump",
      "unsafe action",
      "empty evidence",
      "loading evidence",
      "error/unsupported",
      "privacy/no-runtime",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    [
      "preview route state matrix",
      "answer state: read-only evidence hierarchy",
      "missing citation refusal",
      "unsupported evidence refusal",
      "stale evidence refusal",
      "prompt-injection warning state",
      "source export refusal state",
      "unsafe action refusal state",
      "empty evidence state",
      "loading evidence state",
      "error and unsupported evidence",
      "conflicting evidence refusal boundary",
      "privacy boundary",
      "no-runtime boundary",
    ].every((requiredText) =>
      normalizedRouteAndSpec.includes(requiredText),
    ) &&
    allowedRouteFilesOnly &&
    routeMetadataNoIndexBoundaryVerified;
  const noAdditionalRoutesFromFp0096 =
    allowedRouteFilesOnly &&
    repoFilePaths().filter((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
    ).length === 2;
  const noApiRoutesFromFp0096 =
    ["no web api routes", "no api endpoints"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && !apiRouteExists;
  const noBackendRoutesFromFp0096 =
    ["no backend/control-plane routes", "no backend route"].every(
      (requiredText) => normalized.includes(requiredText),
    ) && !backendRouteExists;
  const noEndpointsFromFp0096 =
    ["no endpoints", "no endpoint"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && !endpointImplementationExists;
  const noAppsSdkIframeFromFp0096 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !/(iframe|postmessage|registerresource|apps-sdk)/iu.test(routeSource);
  const noOauthSubmissionFromFp0096 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => normalized.includes(requiredText),
    ) && appSubmissionAssetPaths.length === 0;
  const noPublicAppImplementationFromFp0096 = [
    "does not implement a public chatgpt app",
    "no public app implementation",
    "public app implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0096 =
    ["does not add openai api/model calls", "no openai api/model call"].every(
      (requiredText) => normalized.includes(requiredText),
    ) &&
    !/(openai_api_key|process\.env|from\s+["']openai["']|openai\.|responses\.create|chat\.completions)/iu.test(
      routeSource,
    );
  const noSourceMutationFinanceWriteFromFp0096 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      normalized.includes(requiredText),
    );
  const noScreenshotAssetsFromFp0096 =
    ["no screenshot", "no generated images"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && screenshotAssetPaths.length === 0;
  const noPublicAssetsFromFp0096 =
    ["no public assets", "no app-submission assets"].every((requiredText) =>
      normalized.includes(requiredText),
    ) &&
    publicAssetPaths.length === 0 &&
    appSubmissionAssetPaths.length === 0;

  return {
    absentOrLocalPreviewRouteStateMatrixBoundaryVerified:
      localPreviewRouteStateMatrixFoundationVerified &&
      noAdditionalRoutesFromFp0096 &&
      noApiRoutesFromFp0096 &&
      noBackendRoutesFromFp0096 &&
      noEndpointsFromFp0096 &&
      noAppsSdkIframeFromFp0096 &&
      noOauthSubmissionFromFp0096 &&
      noPublicAppImplementationFromFp0096 &&
      noOpenAiApiCallsFromFp0096 &&
      noSourceMutationFinanceWriteFromFp0096 &&
      noScreenshotAssetsFromFp0096 &&
      noPublicAssetsFromFp0096 &&
      routeMetadataNoIndexBoundaryVerified,
    localPreviewRouteStateMatrixFoundationVerified,
    noAdditionalRoutesFromFp0096,
    noApiRoutesFromFp0096,
    noAppsSdkIframeFromFp0096,
    noBackendRoutesFromFp0096,
    noEndpointsFromFp0096,
    noOauthSubmissionFromFp0096,
    noOpenAiApiCallsFromFp0096,
    noPublicAppImplementationFromFp0096,
    noPublicAssetsFromFp0096,
    noScreenshotAssetsFromFp0096,
    noSourceMutationFinanceWriteFromFp0096,
    routeMetadataNoIndexBoundaryVerified,
  };
}

function fp0097LocalPreviewRouteVisualQaBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const repoRoot = existsSync("plans") ? "." : "../..";
  const fp0097Files = readdirSync(plansPath).filter((name) =>
    /^FP-0097/u.test(name),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeSource = routePaths.includes(routePagePath)
    ? readFileSync(`${repoRoot}/${routePagePath}`, "utf8")
    : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(`${repoRoot}/${routeSpecPath}`, "utf8")
    : "";
  const componentSource = [
    "apps/web/components/read-only-app-mcp/app-shell.tsx",
    "apps/web/components/read-only-app-mcp/refusal-panel.tsx",
    "apps/web/components/read-only-app-mcp/states.tsx",
    "apps/web/components/read-only-app-mcp/types.ts",
    "apps/web/components/read-only-app-mcp/ui.tsx",
  ]
    .filter((path) => repoFilePaths().includes(path))
    .map((path) => readFileSync(`${repoRoot}/${path}`, "utf8"))
    .join("\n");
  const routeAndSpecSource = `${routeSource}\n${routeSpecSource}\n${componentSource}`;
  const normalizedRouteAndSpec = routeAndSpecSource.toLowerCase();
  const allowedRouteFilesOnly =
    routePaths.length === 2 &&
    routePaths.includes(routePagePath) &&
    routePaths.includes(routeSpecPath);
  const absentBoundary = {
    absentOrLocalPreviewRouteVisualQaBoundaryVerified: true,
    localPreviewRouteVisualQaFoundationVerified: true,
    noAdditionalRoutesFromFp0097: true,
    noApiRoutesFromFp0097: true,
    noAppsSdkIframeFromFp0097: true,
    noBackendRoutesFromFp0097: true,
    noEndpointsFromFp0097: true,
    noOauthSubmissionFromFp0097: true,
    noOpenAiApiCallsFromFp0097: true,
    noPublicAppImplementationFromFp0097: true,
    noPublicAssetsFromFp0097: true,
    noScreenshotAssetsFromFp0097: true,
    noSourceMutationFinanceWriteFromFp0097: true,
    routeMetadataNoIndexBoundaryVerified: true,
    screenshotlessVisualQaVerified: true,
    accessibilityStateMatrixVerified: true,
  };
  const failedBoundary = {
    absentOrLocalPreviewRouteVisualQaBoundaryVerified: false,
    localPreviewRouteVisualQaFoundationVerified: false,
    noAdditionalRoutesFromFp0097: false,
    noApiRoutesFromFp0097: false,
    noAppsSdkIframeFromFp0097: false,
    noBackendRoutesFromFp0097: false,
    noEndpointsFromFp0097: false,
    noOauthSubmissionFromFp0097: false,
    noOpenAiApiCallsFromFp0097: false,
    noPublicAppImplementationFromFp0097: false,
    noPublicAssetsFromFp0097: false,
    noScreenshotAssetsFromFp0097: false,
    noSourceMutationFinanceWriteFromFp0097: false,
    routeMetadataNoIndexBoundaryVerified: false,
    screenshotlessVisualQaVerified: false,
    accessibilityStateMatrixVerified: false,
  };

  if (fp0097Files.length === 0) return absentBoundary;
  if (fp0097Files.length !== 1 || fp0097Files[0] !== FP0097_PLAN_FILE) {
    return failedBoundary;
  }

  const lower = readFileSync(
    `${plansPath}/${FP0097_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();
  const normalized = lower.replace(/[`_*]+/gu, "");
  const routeMetadataNoIndexBoundaryVerified =
    /export\s+const\s+metadata/u.test(routeSource) &&
    /title:\s*["']pocket cfo local read-only app\/mcp preview["']/iu.test(
      routeSource,
    ) &&
    /robots:\s*\{/u.test(routeSource) &&
    /index:\s*false/u.test(routeSource) &&
    /follow:\s*false/u.test(routeSource) &&
    /noarchive:\s*true/u.test(routeSource);
  const apiRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp") ||
      path.startsWith("apps/web/app/read-only-app-mcp-preview/route."),
  );
  const backendRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/control-plane/") &&
      /read-only-app-mcp-preview|visual-qa|fp-0097|fp0097/u.test(path),
  );
  const endpointImplementationExists =
    apiRouteExists ||
    backendRouteExists ||
    /export\s+async\s+function\s+(get|post|put|patch|delete)|nextresponse|fastify\./iu.test(
      routeSource,
    );
  const screenshotAssetPaths = repoFilePaths().filter(
    (path) =>
      /(fp-0097|fp0097|visual-qa|read-only-app-mcp-preview)/iu.test(path) &&
      /\.(png|jpe?g|webp|gif|svg|avif)$/iu.test(path),
  );
  const publicAssetPaths = repoFilePaths().filter(
    (path) =>
      /(^|\/)public\//u.test(path) &&
      /(fp-0097|fp0097|visual-qa|read-only-app-mcp-preview|app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ),
  );
  const appSubmissionAssetPaths = repoFilePaths().filter(
    (path) =>
      /(app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ) &&
      /(fp-0097|fp0097|visual-qa|read-only-app-mcp-preview)/iu.test(path),
  );
  const screenshotlessVisualQaVerified =
    [
      "screenshotless visual qa",
      "typography hierarchy",
      "spacing rhythm",
      "panel hierarchy",
      "evidence cards appear before citations",
      "no status by color alone",
      "narrow/wide layout",
      "no screenshots",
      "no generated images",
      "no public assets",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    [
      "proves screenshotless premium visual qa",
      "data-visual-qa=\"screenshotless\"",
      "data-typography=\"h1-28\"",
      "data-panel-tier=\"shell\"",
      "data-panel-tier=\"panel\"",
      "data-panel-hierarchy=\"state-card-grid\"",
      "data-spacing=\"18\"",
      "data-spacing=\"14\"",
      "data-responsive=\"narrow-wide\"",
      "grid-template-columns:repeat(auto-fit, minmax(240px, 1fr))",
    ].every((requiredText) =>
      normalizedRouteAndSpec.includes(requiredText),
    ) &&
    screenshotAssetPaths.length === 0;
  const accessibilityStateMatrixVerified =
    [
      "exactly one main landmark",
      "unique section ids",
      "no duplicate heading ids",
      "coherent heading order",
      "aria labels for state matrix groups",
      "loading state has aria-busy",
      "refusal/error states include text reason labels",
      "privacy/no-runtime boundaries are labelled",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    [
      "proves state matrix accessibility",
      "aria-label=\"read-only preview state matrix groups\"",
      "aria-label=\"refusal and transient state matrix group\"",
      "aria-label=\"privacy and no-runtime state matrix boundary group\"",
      "aria-busy=\"true\"",
      "refusal reason: conflicting evidence",
      "error reason: unsupported or conflicting evidence",
    ].every((requiredText) =>
      normalizedRouteAndSpec.includes(requiredText),
    );
  const localPreviewRouteVisualQaFoundationVerified =
    [
      "fp-0097",
      "local/proof-only/read-only",
      "existing local read-only preview route",
      "visual qa",
      "accessibility",
      "fp-0096",
      "in-memory synthetic contract-shaped examples",
      "no public app implementation",
      "no openai api/model calls",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    allowedRouteFilesOnly &&
    routeMetadataNoIndexBoundaryVerified &&
    screenshotlessVisualQaVerified &&
    accessibilityStateMatrixVerified;
  const noAdditionalRoutesFromFp0097 =
    allowedRouteFilesOnly &&
    repoFilePaths().filter((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
    ).length === 2;
  const noApiRoutesFromFp0097 =
    ["no web api routes", "no api endpoints"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && !apiRouteExists;
  const noBackendRoutesFromFp0097 =
    ["no backend/control-plane routes", "no backend route"].every(
      (requiredText) => normalized.includes(requiredText),
    ) && !backendRouteExists;
  const noEndpointsFromFp0097 =
    ["no endpoints", "no endpoint"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && !endpointImplementationExists;
  const noAppsSdkIframeFromFp0097 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !/(iframe|postmessage|registerresource|apps-sdk)/iu.test(routeSource);
  const noOauthSubmissionFromFp0097 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => normalized.includes(requiredText),
    ) && appSubmissionAssetPaths.length === 0;
  const noPublicAppImplementationFromFp0097 = [
    "does not implement a public chatgpt app",
    "no public app implementation",
    "public app implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0097 =
    ["does not add openai api/model calls", "no openai api/model call"].every(
      (requiredText) => normalized.includes(requiredText),
    ) &&
    !/(openai_api_key|process\.env|from\s+["']openai["']|openai\.|responses\.create|chat\.completions)/iu.test(
      routeSource,
    );
  const noSourceMutationFinanceWriteFromFp0097 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      normalized.includes(requiredText),
    );
  const noScreenshotAssetsFromFp0097 =
    ["no screenshot", "no generated images"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && screenshotAssetPaths.length === 0;
  const noPublicAssetsFromFp0097 =
    ["no public assets", "no app-submission assets"].every((requiredText) =>
      normalized.includes(requiredText),
    ) &&
    publicAssetPaths.length === 0 &&
    appSubmissionAssetPaths.length === 0;

  return {
    absentOrLocalPreviewRouteVisualQaBoundaryVerified:
      localPreviewRouteVisualQaFoundationVerified &&
      noAdditionalRoutesFromFp0097 &&
      noApiRoutesFromFp0097 &&
      noBackendRoutesFromFp0097 &&
      noEndpointsFromFp0097 &&
      noAppsSdkIframeFromFp0097 &&
      noOauthSubmissionFromFp0097 &&
      noPublicAppImplementationFromFp0097 &&
      noOpenAiApiCallsFromFp0097 &&
      noSourceMutationFinanceWriteFromFp0097 &&
      noScreenshotAssetsFromFp0097 &&
      noPublicAssetsFromFp0097 &&
      routeMetadataNoIndexBoundaryVerified &&
      screenshotlessVisualQaVerified &&
      accessibilityStateMatrixVerified,
    localPreviewRouteVisualQaFoundationVerified,
    noAdditionalRoutesFromFp0097,
    noApiRoutesFromFp0097,
    noAppsSdkIframeFromFp0097,
    noBackendRoutesFromFp0097,
    noEndpointsFromFp0097,
    noOauthSubmissionFromFp0097,
    noOpenAiApiCallsFromFp0097,
    noPublicAppImplementationFromFp0097,
    noPublicAssetsFromFp0097,
    noScreenshotAssetsFromFp0097,
    noSourceMutationFinanceWriteFromFp0097,
    routeMetadataNoIndexBoundaryVerified,
    screenshotlessVisualQaVerified,
    accessibilityStateMatrixVerified,
  };
}

function fp0098PublicAppReadinessBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0098Files = readdirSync(plansPath).filter((name) =>
    /^FP-0098/u.test(name),
  );
  const absentBoundary = {
    absentOrDocsOnlyPublicAppReadinessBoundaryVerified: true,
    publicAppReadinessPlanBoundaryVerified: true,
    noPublicAppImplementationFromFp0098: true,
    noAppsSdkIframeFromFp0098: true,
    noRemoteMcpDeploymentFromFp0098: true,
    noEndpointOauthSubmissionFromFp0098: true,
    noOpenAiApiCallsFromFp0098: true,
    noSourceMutationFinanceWriteFromFp0098: true,
    noScreenshotListingSubmissionAssetsFromFp0098: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  ) as typeof absentBoundary;

  if (fp0098Files.length === 0) return absentBoundary;
  if (fp0098Files.length !== 1 || fp0098Files[0] !== FP0098_PLAN_FILE) {
    return failedBoundary;
  }

  const planPath = `${plansPath}/${FP0098_PLAN_FILE}`;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const readinessRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0098|public-app-readiness|app-submission|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
  const screenshotListingSubmissionAssetPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0098|public-app-readiness|listing|submission|public-asset/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAppReadinessPlanBoundaryVerified =
    [
      "fp-0098 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "public-app readiness/security/submission-boundary",
      "future public app readiness/security/submission-boundary",
      "what exactly becomes visible to chatgpt",
      "which tools remain read-only",
      "how are write/modify actions impossible",
      "how are prompt-injection strings displayed as data",
      "how are bounded excerpts/citations shown",
      "how is no raw full-file dump preserved",
      "how are missing/unsupported/stale/conflicting evidence states shown",
      "how are privacy/no-runtime/no-real-finance-data boundaries visible",
      "what must be true before any endpoint, oauth, remote mcp, apps sdk resource, app submission, or public directory listing",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    readinessRouteOrEndpointPaths.length === 0;
  const noPublicAppImplementationFromFp0098 = [
    "does not authorize public chatgpt app implementation",
    "public app implementation remains future-only",
    "not public chatgpt app implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkIframeFromFp0098 = [
    "does not authorize apps sdk iframe/ui code",
    "does not authorize apps sdk iframe/resource registration",
    "apps sdk/iframe/resource implementation plan before any apps sdk resources",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0098 = [
    "does not authorize remote mcp server deployment",
    "remote mcp deployment remains future-only",
    "threat-model/security implementation plan before endpoint/oauth/remote mcp",
  ].every((requiredText) => normalized.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0098 =
    [
      "does not authorize endpoint implementation",
      "does not authorize oauth implementation",
      "does not authorize app submission",
      "app-submission plan before screenshots, listing copy, review prompts, directory listing, or submission packet",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    readinessRouteOrEndpointPaths.length === 0;
  const noOpenAiApiCallsFromFp0098 = [
    "does not authorize openai api/model calls",
    "no openai api/model calls",
  ].every((requiredText) => normalized.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0098 = [
    "no source mutation",
    "no finance writes",
  ].every((requiredText) => normalized.includes(requiredText));
  const noScreenshotListingSubmissionAssetsFromFp0098 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    screenshotListingSubmissionAssetPaths.length === 0;

  return {
    absentOrDocsOnlyPublicAppReadinessBoundaryVerified:
      publicAppReadinessPlanBoundaryVerified &&
      noPublicAppImplementationFromFp0098 &&
      noAppsSdkIframeFromFp0098 &&
      noRemoteMcpDeploymentFromFp0098 &&
      noEndpointOauthSubmissionFromFp0098 &&
      noOpenAiApiCallsFromFp0098 &&
      noSourceMutationFinanceWriteFromFp0098 &&
      noScreenshotListingSubmissionAssetsFromFp0098,
    publicAppReadinessPlanBoundaryVerified,
    noPublicAppImplementationFromFp0098,
    noAppsSdkIframeFromFp0098,
    noRemoteMcpDeploymentFromFp0098,
    noEndpointOauthSubmissionFromFp0098,
    noOpenAiApiCallsFromFp0098,
    noSourceMutationFinanceWriteFromFp0098,
    noScreenshotListingSubmissionAssetsFromFp0098,
  };
}

function fp0099PublicAppSecurityThreatModelBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0099Files = readdirSync(plansPath).filter((name) =>
    /^FP-0099/u.test(name),
  );
  const absentBoundary = {
    absentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified: true,
    publicAppSecurityThreatModelPlanBoundaryVerified: true,
    noEndpointImplementationFromFp0099: true,
    noOauthImplementationFromFp0099: true,
    noRemoteMcpDeploymentFromFp0099: true,
    noAppsSdkResourceFromFp0099: true,
    noAppSubmissionFromFp0099: true,
    noOpenAiApiCallsFromFp0099: true,
    noSourceMutationFinanceWriteFromFp0099: true,
    noPublicAssetsSubmissionArtifactsFromFp0099: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  ) as typeof absentBoundary;

  if (fp0099Files.length === 0) return absentBoundary;
  if (fp0099Files.length !== 1 || fp0099Files[0] !== FP0099_PLAN_FILE) {
    return failedBoundary;
  }

  const planPath = `${plansPath}/${FP0099_PLAN_FILE}`;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const securityRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0099|security-threat-model|platform-boundary|app-submission|remote-mcp|oauth|endpoint/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAssetsSubmissionArtifactPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0099|security-threat-model|platform-boundary|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAppSecurityThreatModelPlanBoundaryVerified =
    [
      "fp-0099 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "public-app security threat-model and platform-boundary",
      "future public-app/mcp security threat-model and platform-boundary",
      "prompt injection from source text, user text, tool output, and model-visible context",
      "data exfiltration and raw full-file dump requests",
      "write/modify action impossibility",
      "tool allowlist drift",
      "mcp descriptor drift",
      "remote mcp endpoint trust",
      "oauth/token/session storage",
      "user and admin consent",
      "enterprise rbac/action control",
      "app visibility/public directory listing",
      "audit logging and replay/evidence boundaries",
      "no-real-finance-data and privacy posture",
      "unsupported/stale/conflicting evidence refusal",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    securityRouteOrEndpointPaths.length === 0;
  const noEndpointImplementationFromFp0099 =
    [
      "does not authorize endpoint implementation",
      "no endpoint work before threat-model acceptance",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    securityRouteOrEndpointPaths.length === 0;
  const noOauthImplementationFromFp0099 = [
    "does not authorize oauth implementation",
    "no oauth before token/session/privacy review",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0099 = [
    "does not authorize remote mcp server deployment",
    "no remote mcp before host/network/security review",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0099 = [
    "does not authorize apps sdk iframe/resource implementation",
    "no apps sdk iframe/resource before ui/resource security plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppSubmissionFromFp0099 = [
    "does not authorize app submission",
    "no app submission before local proof, app security plan, privacy review, and submission plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0099 = [
    "does not authorize openai api/model calls",
    "no openai api/model calls",
  ].every((requiredText) => normalized.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0099 = [
    "no source mutation",
    "no finance writes",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0099 =
    [
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    publicAssetsSubmissionArtifactPaths.length === 0;

  return {
    absentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified:
      publicAppSecurityThreatModelPlanBoundaryVerified &&
      noEndpointImplementationFromFp0099 &&
      noOauthImplementationFromFp0099 &&
      noRemoteMcpDeploymentFromFp0099 &&
      noAppsSdkResourceFromFp0099 &&
      noAppSubmissionFromFp0099 &&
      noOpenAiApiCallsFromFp0099 &&
      noSourceMutationFinanceWriteFromFp0099 &&
      noPublicAssetsSubmissionArtifactsFromFp0099,
    publicAppSecurityThreatModelPlanBoundaryVerified,
    noEndpointImplementationFromFp0099,
    noOauthImplementationFromFp0099,
    noRemoteMcpDeploymentFromFp0099,
    noAppsSdkResourceFromFp0099,
    noAppSubmissionFromFp0099,
    noOpenAiApiCallsFromFp0099,
    noSourceMutationFinanceWriteFromFp0099,
    noPublicAssetsSubmissionArtifactsFromFp0099,
  };
}

function fp0100ReadOnlyAppMcpProofFields() {
  const fp0100Boundary = fp0100PublicAppSecurityBoundary();
  const fp0101Boundary =
    fp0101PublicAppImplementationSequencingBoundary();
  const fp0102Boundary =
    fp0102EndpointOauthRemoteMcpArchitectureBoundary();

  return {
    fp0100AbsentOrLocalSecurityBoundaryContractsVerified:
      fp0100Boundary.absentOrLocalSecurityBoundaryContractsVerified,
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      fp0101Boundary
        .absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified,
    fp0102AbsentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified:
      fp0102Boundary
        .absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified,
    fp0103Absent: fp0103Absent(),
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified:
      fp0102Boundary.endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    noEndpointImplementationFromFp0102:
      fp0102Boundary.noEndpointImplementationFromFp0102,
    noOauthTokenSessionImplementationFromFp0102:
      fp0102Boundary.noOauthTokenSessionImplementationFromFp0102,
    noRemoteMcpImplementationOrDeploymentFromFp0102:
      fp0102Boundary.noRemoteMcpImplementationOrDeploymentFromFp0102,
    noAppsSdkResourceFromFp0102:
      fp0102Boundary.noAppsSdkResourceFromFp0102,
    noAppSubmissionFromFp0102:
      fp0102Boundary.noAppSubmissionFromFp0102,
    noOpenAiApiCallsFromFp0102:
      fp0102Boundary.noOpenAiApiCallsFromFp0102,
    noSourceMutationFinanceWriteFromFp0102:
      fp0102Boundary.noSourceMutationFinanceWriteFromFp0102,
    noPublicAssetsSubmissionArtifactsFromFp0102:
      fp0102Boundary.noPublicAssetsSubmissionArtifactsFromFp0102,
    fp0101ImplementationSequencingBoundaryStillVerified:
      fp0102Boundary.fp0101ImplementationSequencingBoundaryStillVerified,
    fp0100PublicSecurityBoundaryStillVerified:
      fp0102Boundary.fp0100PublicSecurityBoundaryStillVerified,
    publicAppImplementationSequencingPlanBoundaryVerified:
      fp0101Boundary.publicAppImplementationSequencingPlanBoundaryVerified,
    noEndpointImplementationFromFp0101:
      fp0101Boundary.noEndpointImplementationFromFp0101,
    noOauthImplementationFromFp0101:
      fp0101Boundary.noOauthImplementationFromFp0101,
    noRemoteMcpDeploymentFromFp0101:
      fp0101Boundary.noRemoteMcpDeploymentFromFp0101,
    noAppsSdkResourceFromFp0101:
      fp0101Boundary.noAppsSdkResourceFromFp0101,
    noAppSubmissionFromFp0101:
      fp0101Boundary.noAppSubmissionFromFp0101,
    noOpenAiApiCallsFromFp0101:
      fp0101Boundary.noOpenAiApiCallsFromFp0101,
    noSourceMutationFinanceWriteFromFp0101:
      fp0101Boundary.noSourceMutationFinanceWriteFromFp0101,
    noPublicAssetsSubmissionArtifactsFromFp0101:
      fp0101Boundary.noPublicAssetsSubmissionArtifactsFromFp0101,
    publicAppSecurityContractsFoundationVerified:
      fp0100Boundary.publicAppSecurityContractsFoundationVerified,
    noEndpointImplementationFromFp0100:
      fp0100Boundary.noEndpointImplementationFromFp0100,
    noOauthImplementationFromFp0100:
      fp0100Boundary.noOauthImplementationFromFp0100,
    noRemoteMcpDeploymentFromFp0100:
      fp0100Boundary.noRemoteMcpDeploymentFromFp0100,
    noAppsSdkResourceFromFp0100:
      fp0100Boundary.noAppsSdkResourceFromFp0100,
    noAppSubmissionFromFp0100:
      fp0100Boundary.noAppSubmissionFromFp0100,
    noOpenAiApiCallsFromFp0100:
      fp0100Boundary.noOpenAiApiCallsFromFp0100,
    noSourceMutationFinanceWriteFromFp0100:
      fp0100Boundary.noSourceMutationFinanceWriteFromFp0100,
    noPublicAssetsSubmissionArtifactsFromFp0100:
      fp0100Boundary.noPublicAssetsSubmissionArtifactsFromFp0100,
  };
}

function fp0100PublicAppSecurityBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0100Files = readdirSync(plansPath).filter((name) =>
    /^FP-0100/u.test(name),
  );
  const absentBoundary = {
    absentOrLocalSecurityBoundaryContractsVerified: true,
    publicAppSecurityContractsFoundationVerified: true,
    noEndpointImplementationFromFp0100: true,
    noOauthImplementationFromFp0100: true,
    noRemoteMcpDeploymentFromFp0100: true,
    noAppsSdkResourceFromFp0100: true,
    noAppSubmissionFromFp0100: true,
    noOpenAiApiCallsFromFp0100: true,
    noSourceMutationFinanceWriteFromFp0100: true,
    noPublicAssetsSubmissionArtifactsFromFp0100: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  ) as typeof absentBoundary;

  if (fp0100Files.length === 0) return absentBoundary;
  if (fp0100Files.length !== 1 || fp0100Files[0] !== FP0100_PLAN_FILE) {
    return failedBoundary;
  }

  const planPath = `${plansPath}/${FP0100_PLAN_FILE}`;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const securitySourceText = readFp0100SecuritySourceText();
  const noOpenAiApiCalls = !hasCodeLevelOpenAiIntegration(securitySourceText);
  const noModelCalls =
    noOpenAiApiCalls && !hasCodeLevelModelIntegration(securitySourceText);
  const publicAppSecurityContractsFoundationVerified =
    [
      "local/proof-only/read-only public chatgpt app/mcp security boundary contract foundation",
      "fp-0100 implements only pure domain contracts and direct proof tooling",
      "this is contract/proof work only",
      "authorizes only local proof-only public-app security boundary contracts",
      "publicappsecuritythreatmodelcontract",
      "publicappplatformboundary",
      "publicapppromptinjectionboundary",
      "publicappdataexfiltrationboundary",
      "publicapprawdumprefusalboundary",
      "publicappwriteactionimpossibleboundary",
      "publicapptoolallowlistdriftboundary",
      "publicappmcpdescriptordriftboundary",
      "publicappsecurityproof",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100RouteOrEndpointPaths();
  const noEndpointImplementationFromFp0100 =
    [
      "does not authorize product code",
      "no route code",
      "no app routes",
      "no web api routes",
      "no backend/control-plane routes",
      "no endpoints",
      "endpoint work is deferred",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100RouteOrEndpointPaths();
  const noOauthImplementationFromFp0100 =
    [
      "does not authorize oauth",
      "oauth/token/session work is deferred",
      "no oauth",
    ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0100 =
    [
      "does not authorize remote mcp",
      "remote mcp deployment is deferred",
      "no remote mcp server",
    ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0100 =
    [
      "does not authorize apps sdk iframe/resource registration",
      "apps sdk iframe/resource implementation is deferred",
      "no apps sdk iframe/resource registration",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100AppsSdkResourcePaths();
  const noAppSubmissionFromFp0100 =
    [
      "does not authorize app submission",
      "app submission/listing/public assets are deferred",
      "no app submission",
    ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0100 =
    [
      "does not authorize openai api/model calls",
      "no openai api/model calls",
      "no openai api/model call",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noOpenAiApiCalls &&
    noModelCalls;
  const noSourceMutationFinanceWriteFromFp0100 =
    [
      "no source mutation",
      "no finance writes",
      "no source mutation and no finance writes",
    ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0100 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100PublicAssets() &&
    noFp0100ListingCopy();

  return {
    absentOrLocalSecurityBoundaryContractsVerified:
      publicAppSecurityContractsFoundationVerified &&
      noEndpointImplementationFromFp0100 &&
      noOauthImplementationFromFp0100 &&
      noRemoteMcpDeploymentFromFp0100 &&
      noAppsSdkResourceFromFp0100 &&
      noAppSubmissionFromFp0100 &&
      noOpenAiApiCallsFromFp0100 &&
      noSourceMutationFinanceWriteFromFp0100 &&
      noPublicAssetsSubmissionArtifactsFromFp0100,
    publicAppSecurityContractsFoundationVerified,
    noEndpointImplementationFromFp0100,
    noOauthImplementationFromFp0100,
    noRemoteMcpDeploymentFromFp0100,
    noAppsSdkResourceFromFp0100,
    noAppSubmissionFromFp0100,
    noOpenAiApiCallsFromFp0100,
    noSourceMutationFinanceWriteFromFp0100,
    noPublicAssetsSubmissionArtifactsFromFp0100,
  };
}

function fp0101PublicAppImplementationSequencingBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0101Files = readdirSync(plansPath).filter((name) =>
    /^FP-0101/u.test(name),
  );
  const absentBoundary = {
    absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified: true,
    publicAppImplementationSequencingPlanBoundaryVerified: true,
    noEndpointImplementationFromFp0101: true,
    noOauthImplementationFromFp0101: true,
    noRemoteMcpDeploymentFromFp0101: true,
    noAppsSdkResourceFromFp0101: true,
    noAppSubmissionFromFp0101: true,
    noOpenAiApiCallsFromFp0101: true,
    noSourceMutationFinanceWriteFromFp0101: true,
    noPublicAssetsSubmissionArtifactsFromFp0101: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  ) as typeof absentBoundary;

  if (fp0101Files.length === 0) return absentBoundary;
  if (fp0101Files.length !== 1 || fp0101Files[0] !== FP0101_PLAN_FILE) {
    return failedBoundary;
  }

  const planPath = `${plansPath}/${FP0101_PLAN_FILE}`;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const implementationRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0101|implementation-sequencing|public-app-implementation|endpoint|oauth|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAssetsSubmissionArtifactPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0101|implementation-sequencing|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAppImplementationSequencingPlanBoundaryVerified =
    [
      "fp-0101 is not implementation",
      "fp-0101 is docs-and-plan only",
      "future public-app implementation sequencing/platform-readiness",
      "fp-0101 defines future public-app implementation sequencing only",
      "recommended implementation order",
      "fp-0102 docs/proof-only endpoint/oauth/remote-mcp architecture master plan",
      "later endpoint/oauth contract implementation only after security acceptance",
      "later apps sdk/resource master plan",
      "later apps sdk/resource local proof implementation",
      "later app-submission master plan",
      "later app-submission artifact implementation only after all prior gates",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noEndpointImplementationFromFp0101 =
    [
      "does not authorize endpoint implementation",
      "no endpoint implementation is required",
      "what must be true before endpoint work starts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noOauthImplementationFromFp0101 = [
    "does not authorize oauth implementation",
    "no oauth implementation is required",
    "what must be true before oauth/token/session work starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0101 = [
    "does not authorize remote mcp deployment",
    "no remote mcp implementation is required",
    "what must be true before remote mcp deployment starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0101 = [
    "does not authorize apps sdk iframe/resource implementation",
    "no apps sdk resource implementation is required",
    "what must be true before apps sdk iframe/resource work starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppSubmissionFromFp0101 = [
    "does not authorize app submission",
    "does not authorize app submission, screenshots, listing copy, or public assets",
    "what must be true before app submission/listing/screenshots starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0101 = [
    "does not authorize openai api/model calls",
    "no openai api/model calls are required",
    "no openai api/model call was made",
  ].every((requiredText) => normalized.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0101 = [
    "no source mutation",
    "no finance writes",
    "no finance write or source mutation is required",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0101 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    publicAssetsSubmissionArtifactPaths.length === 0;

  return {
    absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      publicAppImplementationSequencingPlanBoundaryVerified &&
      noEndpointImplementationFromFp0101 &&
      noOauthImplementationFromFp0101 &&
      noRemoteMcpDeploymentFromFp0101 &&
      noAppsSdkResourceFromFp0101 &&
      noAppSubmissionFromFp0101 &&
      noOpenAiApiCallsFromFp0101 &&
      noSourceMutationFinanceWriteFromFp0101 &&
      noPublicAssetsSubmissionArtifactsFromFp0101,
    publicAppImplementationSequencingPlanBoundaryVerified,
    noEndpointImplementationFromFp0101,
    noOauthImplementationFromFp0101,
    noRemoteMcpDeploymentFromFp0101,
    noAppsSdkResourceFromFp0101,
    noAppSubmissionFromFp0101,
    noOpenAiApiCallsFromFp0101,
    noSourceMutationFinanceWriteFromFp0101,
    noPublicAssetsSubmissionArtifactsFromFp0101,
  };
}

function fp0102EndpointOauthRemoteMcpArchitectureBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0102Files = readdirSync(plansPath).filter((name) =>
    /^FP-0102/u.test(name),
  );
  const absentBoundary = {
    absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified: true,
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified: true,
    noEndpointImplementationFromFp0102: true,
    noOauthTokenSessionImplementationFromFp0102: true,
    noRemoteMcpImplementationOrDeploymentFromFp0102: true,
    noAppsSdkResourceFromFp0102: true,
    noAppSubmissionFromFp0102: true,
    noOpenAiApiCallsFromFp0102: true,
    noSourceMutationFinanceWriteFromFp0102: true,
    noPublicAssetsSubmissionArtifactsFromFp0102: true,
    fp0101ImplementationSequencingBoundaryStillVerified: true,
    fp0100PublicSecurityBoundaryStillVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  ) as typeof absentBoundary;

  if (fp0102Files.length === 0) return absentBoundary;
  if (fp0102Files.length !== 1 || fp0102Files[0] !== FP0102_PLAN_FILE) {
    return failedBoundary;
  }

  const planPath = `${plansPath}/${FP0102_PLAN_FILE}`;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const implementationRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0102|endpoint|oauth|remote-mcp|remote-mcp-server|apps-sdk|appssdk/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAssetsSubmissionArtifactPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0102|endpoint|oauth|remote-mcp|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const sourceText = readFp0100SecuritySourceText();
  const sourceScanVerified =
    !hasCodeLevelOpenAiIntegration(sourceText) &&
    !hasCodeLevelModelIntegration(sourceText);
  const endpointOauthRemoteMcpArchitecturePlanBoundaryVerified =
    [
      "fp-0102 is not implementation",
      "fp-0102 is docs-and-plan plus proof-gate compatibility only",
      "fp-0102 plans endpoint/oauth/remote-mcp architecture and security-readiness only",
      "fp-0102 defines future endpoint/oauth/remote-mcp architecture gates only",
      "future mcp endpoint path is documentation-only in this slice",
      "fp-0102 keeps fp-0103 absent",
      "fp-0102 preserves fp-0101",
      "fp-0102 preserves fp-0100",
      "public app implementation and public app submission future-only",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noEndpointImplementationFromFp0102 =
    [
      "does not authorize endpoint implementation",
      "no endpoint implementation is required",
      "no route/api/backend path may be added in fp-0102",
      "no endpoint implementation may be added in fp-0102",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noOauthTokenSessionImplementationFromFp0102 = [
    "does not authorize oauth/token/session implementation",
    "no oauth implementation is required",
    "no token/session implementation is required",
    "oauth is future-only",
    "token/session implementation is future-only",
    "no openai api keys and no openai_api_key usage",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpImplementationOrDeploymentFromFp0102 = [
    "does not authorize remote mcp server implementation or deployment",
    "no remote mcp implementation is required",
    "no remote mcp deployment is required",
    "remote mcp deployment is future-only",
    "stable https host as a future input only",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0102 = [
    "does not authorize apps sdk iframe/resource implementation",
    "no apps sdk resource implementation is required",
    "ui/resource work remains a later apps sdk/resource plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppSubmissionFromFp0102 = [
    "does not authorize app submission",
    "no app submission is required",
    "submission is a later submission master-plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0102 =
    [
      "does not authorize openai api/model calls",
      "no openai api/model calls are required",
      "no openai api/model calls and does not authorize api/model integration",
      "no openai api/model call",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    sourceScanVerified;
  const noSourceMutationFinanceWriteFromFp0102 = [
    "no source mutation",
    "no finance writes",
    "no finance write or source mutation is required",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0102 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
      "no public assets/listing copy/screenshots are required",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    publicAssetsSubmissionArtifactPaths.length === 0;
  const fp0101Boundary =
    fp0101PublicAppImplementationSequencingBoundary();
  const fp0100Boundary = fp0100PublicAppSecurityBoundary();
  const fp0101ImplementationSequencingBoundaryStillVerified =
    fp0101Boundary
      .absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified &&
    fp0101Boundary.publicAppImplementationSequencingPlanBoundaryVerified;
  const fp0100PublicSecurityBoundaryStillVerified =
    fp0100Boundary.absentOrLocalSecurityBoundaryContractsVerified &&
    fp0100Boundary.publicAppSecurityContractsFoundationVerified;

  return {
    absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified:
      endpointOauthRemoteMcpArchitecturePlanBoundaryVerified &&
      noEndpointImplementationFromFp0102 &&
      noOauthTokenSessionImplementationFromFp0102 &&
      noRemoteMcpImplementationOrDeploymentFromFp0102 &&
      noAppsSdkResourceFromFp0102 &&
      noAppSubmissionFromFp0102 &&
      noOpenAiApiCallsFromFp0102 &&
      noSourceMutationFinanceWriteFromFp0102 &&
      noPublicAssetsSubmissionArtifactsFromFp0102 &&
      fp0101ImplementationSequencingBoundaryStillVerified &&
      fp0100PublicSecurityBoundaryStillVerified,
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    noEndpointImplementationFromFp0102,
    noOauthTokenSessionImplementationFromFp0102,
    noRemoteMcpImplementationOrDeploymentFromFp0102,
    noAppsSdkResourceFromFp0102,
    noAppSubmissionFromFp0102,
    noOpenAiApiCallsFromFp0102,
    noSourceMutationFinanceWriteFromFp0102,
    noPublicAssetsSubmissionArtifactsFromFp0102,
    fp0101ImplementationSequencingBoundaryStillVerified,
    fp0100PublicSecurityBoundaryStillVerified,
  };
}

function fp0103Absent() {
  return !repoFilePaths().some((path) => /(^|\/)FP-0103/u.test(path));
}

function noFp0100RouteOrEndpointPaths() {
  return !repoFilePaths().some(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|public-app-security|public-security|security-boundary|endpoint|oauth|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100AppsSdkResourcePaths() {
  return !repoFilePaths().some(
    (path) =>
      /^(apps\/web|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|apps-sdk|appssdk|register-resource|registerresource|iframe/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100PublicAssets() {
  return !repoFilePaths().some(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0100|public-app-security|public-asset|submission|listing/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100ListingCopy() {
  return !repoFilePaths().some(
    (path) =>
      /(app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ) && /fp-?0100|public-app-security/u.test(path.toLowerCase()),
  );
}

function readFp0100SecuritySourceText() {
  const repoRoot = existsSync("plans") ? "." : "../..";

  return repoFilePaths()
    .filter(isFp0100SecuritySourceSurface)
    .map((path) => readFileSync(`${repoRoot}/${path}`, "utf8"))
    .join("\n");
}

function isFp0100SecuritySourceSurface(path: string) {
  return (
    /^packages\/domain\/src\/read-only-app-mcp-public-security.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    [
      "tools/read-only-public-app-security-boundary-proof.mjs",
      "tools/read-only-mcp-descriptor-response-envelope-proof.mjs",
      "tools/read-only-chatgpt-app-mcp-proof.mjs",
      "tools/benchmark-community-pack-proof.mjs",
    ].includes(path)
  );
}

function hasCodeLevelOpenAiIntegration(sourceText: string) {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const checks = [
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\s*\\(`, "u"),
    /\bopenai\s*\./u,
    /\bresponses\s*\.\s*create\s*\(/u,
    /\bchat\s*\.\s*completions\s*(?:\.\s*create)?\s*\(/u,
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
    new RegExp(`\\b${escapeRegExp(hostName)}\\b`, "u"),
    new RegExp(`\\bfetch\\s*\\(\\s*["'][^"']*${escapeRegExp(hostName)}`, "u"),
  ];

  return checks.some((check) => check.test(sourceText));
}

function hasCodeLevelModelIntegration(sourceText: string) {
  return [
    /\bcallModel\s*\(/u,
    /\bmodel\s*\.\s*create\s*\(/u,
    /\bmodels\s*\.\s*create\s*\(/u,
    /\bchatCompletions\s*\(/u,
  ].some((check) => check.test(sourceText));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function repoFilePaths() {
  const repoRoot = existsSync("plans") ? "." : "../..";
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);
  const results: string[] = [];

  function walk(directory: string, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const entryPath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(entryPath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(repoRoot);
  return results;
}

function readComponentSource(directory: string): string {
  if (!existsSync(directory)) return "";

  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) return [readComponentSource(entryPath)];
      if (!/\.(ts|tsx)$/u.test(entry.name)) return [];
      if (/\.(spec|test)\.tsx?$/u.test(entry.name)) return [];
      return [readFileSync(entryPath, "utf8")];
    })
    .join("\n");
}

function readComponentAndTestSource(directory: string): string {
  if (!existsSync(directory)) return "";

  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) return [readComponentAndTestSource(entryPath)];
      if (!/\.(ts|tsx)$/u.test(entry.name)) return [];
      return [readFileSync(entryPath, "utf8")];
    })
    .join("\n");
}

describe("benchmark community pack foundation contracts", () => {
  it("puts SafeDemoDataPolicy first and forbids real or lightly anonymized finance data", () => {
    const safe = SafeDemoDataPolicySchema.parse(safeDemoDataPolicy());
    const synthetic = SyntheticFinanceSourcePolicySchema.parse(
      syntheticFinanceSourcePolicy(),
    );

    expect(safe.firstGate).toBe(true);
    expect(safe.forbidsRealCompanyData).toBe(true);
    expect(safe.forbidsLightlyAnonymizedRealFinanceData).toBe(true);
    expect(safe.forbiddenFinanceData).toEqual(
      expect.arrayContaining([
        "customer_data",
        "vendor_data",
        "payroll_data",
        "tax_data",
        "bank_data",
        "legal_data",
        "board_data",
        "lender_data",
      ]),
    );
    expect(safe.forbiddenPrivateArtifacts).toEqual(
      expect.arrayContaining([
        "credentials",
        "tokens",
        "secrets",
        "oauth_material",
        "provider_credentials",
        "api_keys",
        "object_store_dumps",
        "database_dumps",
        "private_screenshots",
        "private_finance_source_text",
      ]),
    );
    expect(synthetic.gatedBySafeDemoDataPolicyFirst).toBe(true);
    expect(synthetic.requiresInventedCompanyFacts).toBe(true);
    expect(synthetic.requiresInventedSourceFacts).toBe(true);
    expect(synthetic.requiresClearSyntheticLabeling).toBe(true);
  });

  it("rejects partial or duplicated SafeDemoDataPolicy category lists", () => {
    const safe = safeDemoDataPolicy();

    expect(() =>
      SafeDemoDataPolicySchema.parse({
        ...safe,
        forbiddenFinanceData: [
          "customer_data",
          "vendor_data",
          "payroll_data",
          "tax_data",
          "bank_data",
          "legal_data",
          "board_data",
          "customer_data",
        ],
      }),
    ).toThrow();
    expect(() =>
      SafeDemoDataPolicySchema.parse({
        ...safe,
        forbiddenPrivateArtifacts: [
          "credentials",
          "tokens",
          "secrets",
          "oauth_material",
          "provider_credentials",
          "api_keys",
          "object_store_dumps",
          "database_dumps",
          "private_screenshots",
          "credentials",
        ],
      }),
    ).toThrow();
  });

  it("defines only the allowed read-only benchmark task taxonomy", () => {
    expect(BENCHMARK_TASK_KINDS).toEqual([
      "evidence_recall",
      "source_coverage",
      "policy_lookup",
      "report_traceability",
      "monitor_boundary",
      "unsafe_action_refusal",
      "missing_citation",
      "evidence_faithfulness",
    ]);
    expect(
      BENCHMARK_TASK_KINDS.map((kind) => BenchmarkTaskKindSchema.parse(kind)),
    ).toHaveLength(8);
    expect(
      BenchmarkTaskTaxonomySchema.parse([...BENCHMARK_TASK_KINDS]),
    ).toEqual(BENCHMARK_TASK_KINDS);
    expect(() =>
      BenchmarkTaskTaxonomySchema.parse([
        "evidence_recall",
        "source_coverage",
        "policy_lookup",
        "report_traceability",
        "monitor_boundary",
        "unsafe_action_refusal",
        "missing_citation",
        "evidence_recall",
      ]),
    ).toThrow();
  });

  it("rejects unknown keys on V2F boundary-bearing schemas", () => {
    const strictSchemas = [
      [SafeDemoDataPolicySchema, safeDemoDataPolicy()],
      [SyntheticFinanceSourcePolicySchema, syntheticFinanceSourcePolicy()],
      [BenchmarkNoRuntimeBoundarySchema, noRuntimeBoundary()],
      [ContributorChallengeSchema, contributorChallenge()],
      [ArchitectureMapSchema, architectureMap()],
      [BenchmarkCaseSchema, benchmarkCase()],
      [CommunityPackManifestSchema, communityPackManifest()],
    ] as const;

    for (const [schema, sample] of strictSchemas) {
      expect(() =>
        schema.parse({
          ...sample,
          runtimeBehaviorSmuggledThroughUnknownKey: true,
        }),
      ).toThrow();
    }
  });

  it("rejects CommunityPackManifest data, source-pack, raw-text, URL, and example aliases", () => {
    for (const field of COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS) {
      expect(() =>
        CommunityPackManifestSchema.parse({
          ...communityPackManifest(),
          [field]: [],
        }),
      ).toThrow();
      expect(() =>
        CommunityPackManifestSchema.parse({
          ...communityPackManifest(),
          [field]: ["synthetic alias payload"],
        }),
      ).toThrow();
    }
  });

  it("requires the exact V2F architecture authority layer order", () => {
    expect(
      ArchitectureMapSchema.parse(architectureMap()).authorityLayers,
    ).toEqual(BENCHMARK_AUTHORITY_LAYERS);
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [
          ...BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
          "raw_sources",
        ],
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS, "raw_sources"],
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [
          "finance_twin",
          "raw_sources",
          ...BENCHMARK_AUTHORITY_LAYERS.slice(2),
        ],
      }),
    ).toThrow();
  });

  it("parses all task contracts with evidence, freshness, limitations, actions, and refusal posture", () => {
    const tasks = [
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        recallsExistingEvidenceOnly: true,
      }),
      SourceCoverageTaskSchema.parse({
        ...baseTask("source_coverage"),
        checksSupportedUnsupportedMissingStaleFailedNotIndexed: true,
      }),
      PolicyLookupTaskSchema.parse({
        ...baseTask("policy_lookup"),
        explicitPolicySourceScopeRequired: true,
        noLegalOrPolicyAdvice: true,
      }),
      ReportTraceabilityTaskSchema.parse({
        ...baseTask("report_traceability"),
        createsOrReleasesReports: false,
        tracesStoredArtifactsOnly: true,
      }),
      MonitorBoundaryTaskSchema.parse({
        ...baseTask("monitor_boundary"),
        createsAlertsOrMissions: false,
        deterministicStoredStateOnly: true,
      }),
      UnsafeActionRefusalTaskSchema.parse({
        ...baseTask("unsafe_action_refusal", "unsafe_action_refusal"),
        readOnlyProofOnly: true,
      }),
      MissingCitationTaskSchema.parse({
        ...baseTask("missing_citation", "missing_citation_refusal"),
        readOnlyProofOnly: true,
      }),
      EvidenceFaithfulnessTaskSchema.parse({
        ...baseTask("evidence_faithfulness"),
        readOnlyProofOnly: true,
        rejectsConflictingEvidence: true,
        rejectsMissingEvidence: true,
        rejectsRawFullFileDumpLikePosture: true,
        rejectsStaleEvidence: true,
        rejectsUncitedClaims: true,
        rejectsUnsupportedEvidence: true,
      }),
    ];

    expect(tasks.map((task) => task.taskKind)).toEqual(BENCHMARK_TASK_KINDS);
    expect(
      tasks.every(
        (task) =>
          task.readOnlyDefinitionOnly &&
          task.evidenceRequirements.noFullFileDumps &&
          task.freshnessPosture.state === "fresh" &&
          task.limitationPosture.length > 0 &&
          task.permittedNextActions.length > 0 &&
          task.citationRequirements.sourceAnchorOrAcceptedDerivedRefRequired &&
          task.privacyBoundary.noRealCompanyData &&
          task.noRuntimeBoundary.noProductRuntime,
      ),
    ).toBe(true);
  });

  it("rejects unknown keys on benchmark tasks and nested task posture", () => {
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        recallsExistingEvidenceOnly: true,
        route: "/should-not-exist",
      }),
    ).toThrow();
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        companyContext: {
          ...baseTask("evidence_recall").companyContext,
          rawFullText: "synthetic but forbidden raw text posture",
        },
        recallsExistingEvidenceOnly: true,
      }),
    ).toThrow();
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        freshnessPosture: {
          ...baseTask("evidence_recall").freshnessPosture,
          pageTextDump: "synthetic but forbidden page text dump posture",
        },
        recallsExistingEvidenceOnly: true,
      }),
    ).toThrow();
    expect(() =>
      MissingCitationTaskSchema.parse({
        ...baseTask("missing_citation", "missing_citation_refusal"),
        readOnlyProofOnly: true,
        expectedRefusalPosture: {
          ...baseTask("missing_citation", "missing_citation_refusal")
            .expectedRefusalPosture,
          unsafeBypass: true,
        },
      }),
    ).toThrow();
  });

  it("keeps community manifests and benchmark cases as data-free placeholders", () => {
    const manifest = CommunityPackManifestSchema.parse(communityPackManifest());
    const placeholder = BenchmarkCaseSchema.parse(benchmarkCase());

    expect(manifest.containsNoDataOrSourcePackReferences).toBe(true);
    expect(placeholder.placeholderOnly).toBe(true);
    expect(placeholder.noBenchmarkCasesCheckedIn).toBe(true);
  });

  it("proves no-runtime, contributor, architecture, and final proof posture", () => {
    const boundary =
      BenchmarkNoRuntimeBoundarySchema.parse(noRuntimeBoundary());
    const challenge = ContributorChallengeSchema.parse(contributorChallenge());
    const architecture = ArchitectureMapSchema.parse(architectureMap());
    const proof = BenchmarkProofSchema.parse({
      ...boundary,
      architectureMapBoundaryVerified:
        architecture.v2fContractsNotTruthRuntimeOrData,
      authorityLayerDuplicatesRejected: true,
      authorityLayerExtraRejected: true,
      authorityLayerMissingRejected: true,
      authorityLayerReorderRejected: true,
      authorityLayersExactOrderVerified:
        JSON.stringify(architecture.authorityLayers) ===
        JSON.stringify(BENCHMARK_AUTHORITY_LAYERS),
      benchmarkCasePlaceholderOnlyVerified:
        BenchmarkCaseSchema.parse(benchmarkCase()).placeholderOnly,
      benchmarkNoRuntimeBoundaryVerified: boundary.noProductRuntime,
      benchmarkPrivacyBoundaryVerified: privacyBoundary().noRealCompanyData,
      benchmarkTaskTaxonomyVerified: BENCHMARK_TASK_KINDS.length === 8,
      benchmarkProofUnknownKeysRejected: true,
      benchmarkTaskNestedUnknownKeysRejected: true,
      benchmarkTaskUnknownKeysRejected: true,
      communityPackManifestDataAliasesRejected: true,
      communityPackManifestExplicitDataFieldsRejected: true,
      communityPackManifestVerified: true,
      contributorChallengeBoundaryVerified: challenge.noPublicLaunchImplied,
      evidenceFaithfulnessTaskVerified: true,
      evidenceFreshnessLimitationsPermittedActionFieldsVerified: true,
      evidenceRecallTaskVerified: true,
      forbiddenActionsVerified: true,
      fp0087AbsentOrDocsOnlyBoundaryVerified:
        fp0087AbsentOrDocsOnlyBoundaryVerified(),
      fp0088AbsentOrDocsOnlyBoundaryVerified:
        fp0088DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0091AbsentOrLocalUiComponentBoundaryVerified:
        fp0091LocalUiComponentBoundary()
          .absentOrLocalUiComponentBoundaryVerified,
      fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .absentOrLocalUiCompositionAccessibilityBoundaryVerified,
      fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified:
        fp0093LocalUiPreviewRouteBoundary()
          .absentOrDocsOnlyPreviewRouteBoundaryVerified,
      fp0094AbsentOrLocalPreviewRouteBoundaryVerified:
        fp0094LocalPreviewRouteBoundary()
          .absentOrLocalPreviewRouteBoundaryVerified,
      fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
      fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .absentOrLocalPreviewRouteStateMatrixBoundaryVerified,
      fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .absentOrLocalPreviewRouteVisualQaBoundaryVerified,
      fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified:
        fp0098PublicAppReadinessBoundary()
          .absentOrDocsOnlyPublicAppReadinessBoundaryVerified,
      fp0099AbsentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified:
        fp0099PublicAppSecurityThreatModelBoundary()
          .absentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified,
      ...fp0100ReadOnlyAppMcpProofFields(),
      publicAppReadinessPlanBoundaryVerified:
        fp0098PublicAppReadinessBoundary()
          .publicAppReadinessPlanBoundaryVerified,
      noPublicAppImplementationFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noPublicAppImplementationFromFp0098,
      noAppsSdkIframeFromFp0098:
        fp0098PublicAppReadinessBoundary().noAppsSdkIframeFromFp0098,
      noRemoteMcpDeploymentFromFp0098:
        fp0098PublicAppReadinessBoundary().noRemoteMcpDeploymentFromFp0098,
      noEndpointOauthSubmissionFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noEndpointOauthSubmissionFromFp0098,
      noOpenAiApiCallsFromFp0098:
        fp0098PublicAppReadinessBoundary().noOpenAiApiCallsFromFp0098,
      noSourceMutationFinanceWriteFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noSourceMutationFinanceWriteFromFp0098,
      noScreenshotListingSubmissionAssetsFromFp0098:
        fp0098PublicAppReadinessBoundary()
          .noScreenshotListingSubmissionAssetsFromFp0098,
      publicAppSecurityThreatModelPlanBoundaryVerified:
        fp0099PublicAppSecurityThreatModelBoundary()
          .publicAppSecurityThreatModelPlanBoundaryVerified,
      noEndpointImplementationFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noEndpointImplementationFromFp0099,
      noOauthImplementationFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noOauthImplementationFromFp0099,
      noRemoteMcpDeploymentFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noRemoteMcpDeploymentFromFp0099,
      noAppsSdkResourceFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noAppsSdkResourceFromFp0099,
      noAppSubmissionFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noAppSubmissionFromFp0099,
      noOpenAiApiCallsFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noOpenAiApiCallsFromFp0099,
      noSourceMutationFinanceWriteFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noSourceMutationFinanceWriteFromFp0099,
      noPublicAssetsSubmissionArtifactsFromFp0099:
        fp0099PublicAppSecurityThreatModelBoundary()
          .noPublicAssetsSubmissionArtifactsFromFp0099,
      premiumUiSecurityPlanBoundaryVerified:
        fp0088DocsOnlyBoundary().premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089DocsOnlyBoundary().premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090DocsOnlyBoundary().premiumUiImplementationPlanBoundaryVerified,
      premiumUiComponentFoundationVerified:
        fp0091LocalUiComponentBoundary().premiumUiComponentFoundationVerified,
      premiumUiCompositionAccessibilityFoundationVerified:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .premiumUiCompositionAccessibilityFoundationVerified,
      localUiPreviewRoutePlanBoundaryVerified:
        fp0093LocalUiPreviewRouteBoundary()
          .localUiPreviewRoutePlanBoundaryVerified,
      localPreviewRouteFoundationVerified:
        fp0094LocalPreviewRouteBoundary().localPreviewRouteFoundationVerified,
      localPreviewRouteStateMatrixPlanBoundaryVerified:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .localPreviewRouteStateMatrixPlanBoundaryVerified,
      localPreviewRouteStateMatrixFoundationVerified:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .localPreviewRouteStateMatrixFoundationVerified,
      localPreviewRouteVisualQaFoundationVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .localPreviewRouteVisualQaFoundationVerified,
      noUiImplementationFromFp0088:
        fp0088DocsOnlyBoundary().noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089DocsOnlyBoundary().noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089DocsOnlyBoundary().noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090DocsOnlyBoundary().noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090DocsOnlyBoundary().noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090DocsOnlyBoundary().noPublicAppImplementationFromFp0090,
      noRoutesFromFp0091: fp0091LocalUiComponentBoundary().noRoutesFromFp0091,
      noEndpointsFromFp0091:
        fp0091LocalUiComponentBoundary().noEndpointsFromFp0091,
      noAppsSdkIframeFromFp0091:
        fp0091LocalUiComponentBoundary().noAppsSdkIframeFromFp0091,
      noOauthSubmissionFromFp0091:
        fp0091LocalUiComponentBoundary().noOauthSubmissionFromFp0091,
      noPublicAppImplementationFromFp0091:
        fp0091LocalUiComponentBoundary().noPublicAppImplementationFromFp0091,
      noOpenAiApiCallsFromFp0091:
        fp0091LocalUiComponentBoundary().noOpenAiApiCallsFromFp0091,
      noSourceMutationFinanceWriteFromFp0091:
        fp0091LocalUiComponentBoundary().noSourceMutationFinanceWriteFromFp0091,
      noRoutesFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary().noRoutesFromFp0092,
      noEndpointsFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary().noEndpointsFromFp0092,
      noAppsSdkIframeFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noAppsSdkIframeFromFp0092,
      noOauthSubmissionFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noOauthSubmissionFromFp0092,
      noPublicAppImplementationFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noPublicAppImplementationFromFp0092,
      noOpenAiApiCallsFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noOpenAiApiCallsFromFp0092,
      noSourceMutationFinanceWriteFromFp0092:
        fp0092LocalUiCompositionAccessibilityBoundary()
          .noSourceMutationFinanceWriteFromFp0092,
      noRouteImplementationFromFp0093:
        fp0093LocalUiPreviewRouteBoundary().noRouteImplementationFromFp0093,
      noEndpointOauthSubmissionFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noEndpointOauthSubmissionFromFp0093,
      noPublicAppImplementationFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noPublicAppImplementationFromFp0093,
      noAppsSdkIframeFromFp0093:
        fp0093LocalUiPreviewRouteBoundary().noAppsSdkIframeFromFp0093,
      noOpenAiApiModelCallsFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noOpenAiApiModelCallsFromFp0093,
      noSourceMutationFinanceWriteFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noSourceMutationFinanceWriteFromFp0093,
      noGeneratedProductProseRuntimeCodexFromFp0093:
        fp0093LocalUiPreviewRouteBoundary()
          .noGeneratedProductProseRuntimeCodexFromFp0093,
      noApiRoutesFromFp0094:
        fp0094LocalPreviewRouteBoundary().noApiRoutesFromFp0094,
      noBackendRoutesFromFp0094:
        fp0094LocalPreviewRouteBoundary().noBackendRoutesFromFp0094,
      noEndpointsFromFp0094:
        fp0094LocalPreviewRouteBoundary().noEndpointsFromFp0094,
      noAppsSdkIframeFromFp0094:
        fp0094LocalPreviewRouteBoundary().noAppsSdkIframeFromFp0094,
      noOauthSubmissionFromFp0094:
        fp0094LocalPreviewRouteBoundary().noOauthSubmissionFromFp0094,
      noPublicAppImplementationFromFp0094:
        fp0094LocalPreviewRouteBoundary()
          .noPublicAppImplementationFromFp0094,
      noOpenAiApiCallsFromFp0094:
        fp0094LocalPreviewRouteBoundary().noOpenAiApiCallsFromFp0094,
      noSourceMutationFinanceWriteFromFp0094:
        fp0094LocalPreviewRouteBoundary()
          .noSourceMutationFinanceWriteFromFp0094,
      noRouteImplementationFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noRouteImplementationFromFp0095,
      noScreenshotAssetsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noScreenshotAssetsFromFp0095,
      noEndpointOauthSubmissionFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noEndpointOauthSubmissionFromFp0095,
      noPublicAppImplementationFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noPublicAppImplementationFromFp0095,
      noAppsSdkIframeFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noAppsSdkIframeFromFp0095,
      noRemoteMcpDeploymentFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noRemoteMcpDeploymentFromFp0095,
      noOpenAiApiModelCallsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noOpenAiApiModelCallsFromFp0095,
      noProviderCertificationDeploymentFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noProviderCertificationDeploymentFromFp0095,
      noSourceMutationFinanceWriteFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noSourceMutationFinanceWriteFromFp0095,
      noGeneratedProductProseRuntimeCodexFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary()
          .noGeneratedProductProseRuntimeCodexFromFp0095,
      noPublicAssetsFromFp0095:
        fp0095LocalPreviewRouteStateMatrixBoundary().noPublicAssetsFromFp0095,
      noAdditionalRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noAdditionalRoutesFromFp0096,
      noApiRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noApiRoutesFromFp0096,
      noAppsSdkIframeFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noAppsSdkIframeFromFp0096,
      noBackendRoutesFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noBackendRoutesFromFp0096,
      noEndpointsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noEndpointsFromFp0096,
      noOauthSubmissionFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noOauthSubmissionFromFp0096,
      noOpenAiApiCallsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noOpenAiApiCallsFromFp0096,
      noPublicAppImplementationFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noPublicAppImplementationFromFp0096,
      noPublicAssetsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary().noPublicAssetsFromFp0096,
      noScreenshotAssetsFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noScreenshotAssetsFromFp0096,
      noSourceMutationFinanceWriteFromFp0096:
        fp0096LocalPreviewRouteStateMatrixBoundary()
          .noSourceMutationFinanceWriteFromFp0096,
      routeMetadataNoIndexBoundaryVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .routeMetadataNoIndexBoundaryVerified,
      noAdditionalRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noAdditionalRoutesFromFp0097,
      noApiRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noApiRoutesFromFp0097,
      noAppsSdkIframeFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noAppsSdkIframeFromFp0097,
      noBackendRoutesFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noBackendRoutesFromFp0097,
      noEndpointsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noEndpointsFromFp0097,
      noOauthSubmissionFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noOauthSubmissionFromFp0097,
      noOpenAiApiCallsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noOpenAiApiCallsFromFp0097,
      noPublicAppImplementationFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .noPublicAppImplementationFromFp0097,
      noPublicAssetsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noPublicAssetsFromFp0097,
      noScreenshotAssetsFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary().noScreenshotAssetsFromFp0097,
      noSourceMutationFinanceWriteFromFp0097:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .noSourceMutationFinanceWriteFromFp0097,
      screenshotlessVisualQaVerified:
        fp0097LocalPreviewRouteVisualQaBoundary().screenshotlessVisualQaVerified,
      accessibilityStateMatrixVerified:
        fp0097LocalPreviewRouteVisualQaBoundary()
          .accessibilityStateMatrixVerified,
      inMemorySyntheticExamplesOnlyVerified: true,
      missingCitationTaskVerified: true,
      monitorBoundaryTaskVerified: true,
      noCredentialTokenSecretPolicyVerified:
        safeDemoDataPolicy().forbiddenPrivateArtifacts.includes("secrets"),
      noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderDataVerified:
        safeDemoDataPolicy().forbiddenFinanceData.includes("payroll_data"),
      noRealFinanceDataPolicyVerified:
        safeDemoDataPolicy().forbidsRealCompanyData,
      policyLookupTaskVerified: true,
      reportTraceabilityTaskVerified: true,
      safeDemoDataPolicyVerified: true,
      sourceCoverageTaskVerified: true,
      syntheticExamplesClearlyLabeledVerified: true,
      syntheticFinanceSourcePolicyVerified: true,
      unknownKeysRejected: true,
      unsafeActionRefusalTaskVerified: true,
    });

    expect(proof.localProofOnly).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.fp0087AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0088AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0089AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0090AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0091AbsentOrLocalUiComponentBoundaryVerified).toBe(true);
    expect(
      proof.fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified).toBe(true);
    expect(proof.fp0094AbsentOrLocalPreviewRouteBoundaryVerified).toBe(true);
    expect(
      proof.fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0099AbsentOrDocsOnlyPublicAppSecurityThreatModelBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0100AbsentOrLocalSecurityBoundaryContractsVerified,
    ).toBe(true);
    expect(
      proof
        .fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified,
    ).toBe(true);
    expect(
      proof
        .fp0102AbsentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0103Absent).toBe(true);
    expect(
      proof.endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    ).toBe(true);
    expect(proof.noEndpointImplementationFromFp0102).toBe(true);
    expect(proof.noOauthTokenSessionImplementationFromFp0102).toBe(true);
    expect(proof.noRemoteMcpImplementationOrDeploymentFromFp0102).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0102).toBe(true);
    expect(proof.noAppSubmissionFromFp0102).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0102).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0102).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0102).toBe(true);
    expect(proof.fp0101ImplementationSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
    expect(
      proof.publicAppImplementationSequencingPlanBoundaryVerified,
    ).toBe(true);
    expect(proof.noEndpointImplementationFromFp0101).toBe(true);
    expect(proof.noOauthImplementationFromFp0101).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0101).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0101).toBe(true);
    expect(proof.noAppSubmissionFromFp0101).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0101).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0101).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0101).toBe(true);
    expect(proof.publicAppSecurityContractsFoundationVerified).toBe(true);
    expect(proof.noEndpointImplementationFromFp0100).toBe(true);
    expect(proof.noOauthImplementationFromFp0100).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0100).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0100).toBe(true);
    expect(proof.noAppSubmissionFromFp0100).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0100).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0100).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0100).toBe(true);
    expect(proof.publicAppReadinessPlanBoundaryVerified).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0098).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0098).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0098).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0098).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0098).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0098).toBe(true);
    expect(proof.noScreenshotListingSubmissionAssetsFromFp0098).toBe(true);
    expect(proof.publicAppSecurityThreatModelPlanBoundaryVerified).toBe(true);
    expect(proof.noEndpointImplementationFromFp0099).toBe(true);
    expect(proof.noOauthImplementationFromFp0099).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0099).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0099).toBe(true);
    expect(proof.noAppSubmissionFromFp0099).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0099).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0099).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0099).toBe(true);
    expect(proof.premiumUiSecurityPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiDesignSystemPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiImplementationPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiComponentFoundationVerified).toBe(true);
    expect(proof.premiumUiCompositionAccessibilityFoundationVerified).toBe(true);
    expect(proof.localUiPreviewRoutePlanBoundaryVerified).toBe(true);
    expect(proof.localPreviewRouteFoundationVerified).toBe(true);
    expect(proof.localPreviewRouteStateMatrixPlanBoundaryVerified).toBe(true);
    expect(proof.localPreviewRouteStateMatrixFoundationVerified).toBe(true);
    expect(proof.localPreviewRouteVisualQaFoundationVerified).toBe(true);
    expect(proof.noAdditionalRoutesFromFp0096).toBe(true);
    expect(proof.noApiRoutesFromFp0096).toBe(true);
    expect(proof.noBackendRoutesFromFp0096).toBe(true);
    expect(proof.noEndpointsFromFp0096).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0096).toBe(true);
    expect(proof.noOauthSubmissionFromFp0096).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0096).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0096).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0096).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0096).toBe(true);
    expect(proof.noPublicAssetsFromFp0096).toBe(true);
    expect(proof.routeMetadataNoIndexBoundaryVerified).toBe(true);
    expect(proof.noAdditionalRoutesFromFp0097).toBe(true);
    expect(proof.noApiRoutesFromFp0097).toBe(true);
    expect(proof.noBackendRoutesFromFp0097).toBe(true);
    expect(proof.noEndpointsFromFp0097).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0097).toBe(true);
    expect(proof.noOauthSubmissionFromFp0097).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0097).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0097).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0097).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0097).toBe(true);
    expect(proof.noPublicAssetsFromFp0097).toBe(true);
    expect(proof.screenshotlessVisualQaVerified).toBe(true);
    expect(proof.accessibilityStateMatrixVerified).toBe(true);
    expect(proof.noUiImplementationFromFp0088).toBe(true);
    expect(proof.noUiImplementationFromFp0089).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0089).toBe(true);
    expect(proof.noUiCodeFromFp0090).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0090).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0088).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0089).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0090).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0090).toBe(true);
    expect(proof.noRoutesFromFp0091).toBe(true);
    expect(proof.noEndpointsFromFp0091).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0091).toBe(true);
    expect(proof.noOauthSubmissionFromFp0091).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0091).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0091).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0091).toBe(true);
    expect(proof.noRoutesFromFp0092).toBe(true);
    expect(proof.noEndpointsFromFp0092).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0092).toBe(true);
    expect(proof.noOauthSubmissionFromFp0092).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0092).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0092).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0092).toBe(true);
    expect(proof.noRouteImplementationFromFp0093).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0093).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0093).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0093).toBe(true);
    expect(proof.noOpenAiApiModelCallsFromFp0093).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0093).toBe(true);
    expect(proof.noGeneratedProductProseRuntimeCodexFromFp0093).toBe(true);
    expect(proof.noApiRoutesFromFp0094).toBe(true);
    expect(proof.noBackendRoutesFromFp0094).toBe(true);
    expect(proof.noEndpointsFromFp0094).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0094).toBe(true);
    expect(proof.noOauthSubmissionFromFp0094).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0094).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0094).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0094).toBe(true);
    expect(proof.noRouteImplementationFromFp0095).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0095).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0095).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0095).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0095).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0095).toBe(true);
    expect(proof.noOpenAiApiModelCallsFromFp0095).toBe(true);
    expect(proof.noProviderCertificationDeploymentFromFp0095).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0095).toBe(true);
    expect(proof.noGeneratedProductProseRuntimeCodexFromFp0095).toBe(true);
    expect(proof.noPublicAssetsFromFp0095).toBe(true);
    expect(() =>
      BenchmarkProofSchema.parse({
        ...proof,
        rawFullText: "synthetic but forbidden proof field",
      }),
    ).toThrow();
  });

  it("rejects FP-0101/FP-0102 code-level OpenAI API and model patterns", () => {
    const packageName = ["open", "ai"].join("");
    const clientName = ["Open", "AI"].join("");
    const keyName = ["OPENAI", "API", "KEY"].join("_");
    const hostName = ["api", packageName, "com"].join(".");
    const openAiPatterns = [
      `from "${packageName}"`,
      `from '${packageName}'`,
      `require("${packageName}")`,
      `require('${packageName}')`,
      `new ${clientName}()`,
      ["responses", "create({})"].join("."),
      ["chat", "completions", "create({})"].join("."),
      keyName,
      `process.env.${keyName}`,
      `https://${hostName}/v1/responses`,
    ];
    const modelPatterns = [
      ["call", "Model({})"].join(""),
      ["model", "create({})"].join("."),
      ["models", "create({})"].join("."),
      ["chat", "Completions({})"].join(""),
    ];

    for (const pattern of openAiPatterns) {
      expect(hasCodeLevelOpenAiIntegration(pattern)).toBe(true);
    }
    for (const pattern of modelPatterns) {
      expect(hasCodeLevelModelIntegration(pattern)).toBe(true);
    }
    expect(
      hasCodeLevelOpenAiIntegration(
        "No OpenAI API/model calls are authorized in this plan text.",
      ),
    ).toBe(false);
  });
});
