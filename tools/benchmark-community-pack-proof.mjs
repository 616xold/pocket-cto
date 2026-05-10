import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ArchitectureMapSchema,
  AppProofSchema,
  BENCHMARK_AUTHORITY_LAYERS,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS,
  CommunityPackManifestSchema,
  ContributorChallengeSchema,
  EvidenceFaithfulnessTaskSchema,
  EvidenceRecallTaskSchema,
  MissingCitationTaskSchema,
  MonitorBoundaryTaskSchema,
  PolicyLookupTaskSchema,
  ReportTraceabilityTaskSchema,
  SafeDemoDataPolicySchema,
  SourceCoverageTaskSchema,
  SyntheticFinanceSourcePolicySchema,
  UnsafeActionRefusalTaskSchema,
  buildReadOnlyChatGptAppMcpProof,
} from "../packages/domain/src/index.ts";

const financeData = [
  "customer_data",
  "vendor_data",
  "payroll_data",
  "tax_data",
  "bank_data",
  "legal_data",
  "board_data",
  "lender_data",
];
const scriptNames = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
);
const noPackageScriptsAdded = !scriptNames.some((name) =>
  /v2f|benchmark-community|community-pack/u.test(name),
);
const noSmokeAliasesAdded = !scriptNames.some((name) =>
  /^smoke:.*(v2f|benchmark|community)/u.test(name),
);

const taskSpecs = [
  [
    EvidenceRecallTaskSchema,
    "evidence_recall",
    { recallsExistingEvidenceOnly: true },
  ],
  [
    SourceCoverageTaskSchema,
    "source_coverage",
    { checksSupportedUnsupportedMissingStaleFailedNotIndexed: true },
  ],
  [
    PolicyLookupTaskSchema,
    "policy_lookup",
    { explicitPolicySourceScopeRequired: true, noLegalOrPolicyAdvice: true },
  ],
  [
    ReportTraceabilityTaskSchema,
    "report_traceability",
    { createsOrReleasesReports: false, tracesStoredArtifactsOnly: true },
  ],
  [
    MonitorBoundaryTaskSchema,
    "monitor_boundary",
    { createsAlertsOrMissions: false, deterministicStoredStateOnly: true },
  ],
  [
    UnsafeActionRefusalTaskSchema,
    "unsafe_action_refusal",
    { readOnlyProofOnly: true },
    "unsafe_action_refusal",
  ],
  [
    MissingCitationTaskSchema,
    "missing_citation",
    { readOnlyProofOnly: true },
    "missing_citation_refusal",
  ],
  [
    EvidenceFaithfulnessTaskSchema,
    "evidence_faithfulness",
    {
      rejectsConflictingEvidence: true,
      readOnlyProofOnly: true,
      rejectsMissingEvidence: true,
      rejectsRawFullFileDumpLikePosture: true,
      rejectsStaleEvidence: true,
      rejectsUncitedClaims: true,
      rejectsUnsupportedEvidence: true,
    },
  ],
];

const checkedAt = "2026-05-09T00:30:00.000Z";
const FP0088_PLAN =
  "plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md";
const FP0089_PLAN =
  "plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md";
const FP0090_PLAN =
  "plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md";
const FP0091_PLAN =
  "plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md";
const FP0092_PLAN =
  "plans/FP-0092-read-only-chatgpt-app-mcp-premium-ui-composition-accessibility-foundation.md";
const FP0093_PLAN =
  "plans/FP-0093-read-only-chatgpt-app-mcp-premium-ui-preview-route-master-plan.md";
const FP0094_PLAN =
  "plans/FP-0094-read-only-chatgpt-app-mcp-premium-ui-preview-route-foundation.md";
const FP0095_PLAN =
  "plans/FP-0095-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-master-plan.md";
const FP0096_PLAN =
  "plans/FP-0096-read-only-chatgpt-app-mcp-premium-ui-preview-route-state-matrix-foundation.md";
const FP0097_PLAN =
  "plans/FP-0097-read-only-chatgpt-app-mcp-premium-ui-preview-route-visual-qa-foundation.md";
const FP0098_PLAN =
  "plans/FP-0098-read-only-chatgpt-app-mcp-public-app-readiness-master-plan.md";
const fp0088Boundary = fp0088DocsOnlyBoundary();
const fp0089Boundary = fp0089DocsOnlyBoundary();
const fp0090Boundary = fp0090DocsOnlyBoundary();
const fp0091Boundary = fp0091LocalUiComponentBoundary();
const fp0092Boundary = fp0092LocalUiCompositionAccessibilityBoundary();
const fp0093Boundary = fp0093LocalUiPreviewRouteBoundary();
const fp0094Boundary = fp0094LocalPreviewRouteBoundary();
const fp0095Boundary = fp0095LocalPreviewRouteStateMatrixBoundary();
const fp0096Boundary = fp0096LocalPreviewRouteStateMatrixBoundary();
const fp0097Boundary = fp0097LocalPreviewRouteVisualQaBoundary();
const fp0098Boundary = fp0098PublicAppReadinessBoundary();
const fp0099Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0099/u.test(path),
);

function fp0087AbsentOrDocsOnlyBoundaryVerified() {
  const fp0087Files = readdirSync("plans").filter((name) =>
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

  const planText = readFileSync(`plans/${fp0087Files[0]}`, "utf8");
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
        fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0091AbsentOrLocalUiComponentBoundaryVerified:
        fp0091Boundary.absentOrLocalUiComponentBoundaryVerified,
      fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified:
        fp0092Boundary.absentOrLocalUiCompositionAccessibilityBoundaryVerified,
      fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified:
        fp0093Boundary.absentOrDocsOnlyPreviewRouteBoundaryVerified,
      fp0094AbsentOrLocalPreviewRouteBoundaryVerified:
        fp0094Boundary.absentOrLocalPreviewRouteBoundaryVerified,
      fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
        fp0095Boundary.absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
      fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified:
        fp0096Boundary.absentOrLocalPreviewRouteStateMatrixBoundaryVerified,
      fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified:
        fp0097Boundary.absentOrLocalPreviewRouteVisualQaBoundaryVerified,
      fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified:
        fp0098Boundary.absentOrDocsOnlyPublicAppReadinessBoundaryVerified,
      fp0099Absent,
      publicAppReadinessPlanBoundaryVerified:
        fp0098Boundary.publicAppReadinessPlanBoundaryVerified,
      noPublicAppImplementationFromFp0098:
        fp0098Boundary.noPublicAppImplementationFromFp0098,
      noAppsSdkIframeFromFp0098:
        fp0098Boundary.noAppsSdkIframeFromFp0098,
      noRemoteMcpDeploymentFromFp0098:
        fp0098Boundary.noRemoteMcpDeploymentFromFp0098,
      noEndpointOauthSubmissionFromFp0098:
        fp0098Boundary.noEndpointOauthSubmissionFromFp0098,
      noOpenAiApiCallsFromFp0098:
        fp0098Boundary.noOpenAiApiCallsFromFp0098,
      noSourceMutationFinanceWriteFromFp0098:
        fp0098Boundary.noSourceMutationFinanceWriteFromFp0098,
      noScreenshotListingSubmissionAssetsFromFp0098:
        fp0098Boundary.noScreenshotListingSubmissionAssetsFromFp0098,
      premiumUiSecurityPlanBoundaryVerified:
        fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090Boundary.premiumUiImplementationPlanBoundaryVerified,
      premiumUiComponentFoundationVerified:
        fp0091Boundary.premiumUiComponentFoundationVerified,
      premiumUiCompositionAccessibilityFoundationVerified:
        fp0092Boundary.premiumUiCompositionAccessibilityFoundationVerified,
      localUiPreviewRoutePlanBoundaryVerified:
        fp0093Boundary.localUiPreviewRoutePlanBoundaryVerified,
      localPreviewRouteFoundationVerified:
        fp0094Boundary.localPreviewRouteFoundationVerified,
      localPreviewRouteStateMatrixPlanBoundaryVerified:
        fp0095Boundary.localPreviewRouteStateMatrixPlanBoundaryVerified,
      localPreviewRouteStateMatrixFoundationVerified:
        fp0096Boundary.localPreviewRouteStateMatrixFoundationVerified,
      localPreviewRouteVisualQaFoundationVerified:
        fp0097Boundary.localPreviewRouteVisualQaFoundationVerified,
      noUiImplementationFromFp0088:
        fp0088Boundary.noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089Boundary.noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089Boundary.noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090Boundary.noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090Boundary.noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090Boundary.noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090Boundary.noPublicAppImplementationFromFp0090,
      noRoutesFromFp0091: fp0091Boundary.noRoutesFromFp0091,
      noEndpointsFromFp0091: fp0091Boundary.noEndpointsFromFp0091,
      noAppsSdkIframeFromFp0091: fp0091Boundary.noAppsSdkIframeFromFp0091,
      noOauthSubmissionFromFp0091:
        fp0091Boundary.noOauthSubmissionFromFp0091,
      noPublicAppImplementationFromFp0091:
        fp0091Boundary.noPublicAppImplementationFromFp0091,
      noOpenAiApiCallsFromFp0091:
        fp0091Boundary.noOpenAiApiCallsFromFp0091,
      noSourceMutationFinanceWriteFromFp0091:
        fp0091Boundary.noSourceMutationFinanceWriteFromFp0091,
      noRoutesFromFp0092: fp0092Boundary.noRoutesFromFp0092,
      noEndpointsFromFp0092: fp0092Boundary.noEndpointsFromFp0092,
      noAppsSdkIframeFromFp0092: fp0092Boundary.noAppsSdkIframeFromFp0092,
      noOauthSubmissionFromFp0092: fp0092Boundary.noOauthSubmissionFromFp0092,
      noPublicAppImplementationFromFp0092:
        fp0092Boundary.noPublicAppImplementationFromFp0092,
      noOpenAiApiCallsFromFp0092: fp0092Boundary.noOpenAiApiCallsFromFp0092,
      noSourceMutationFinanceWriteFromFp0092:
        fp0092Boundary.noSourceMutationFinanceWriteFromFp0092,
      noRouteImplementationFromFp0093:
        fp0093Boundary.noRouteImplementationFromFp0093,
      noEndpointOauthSubmissionFromFp0093:
        fp0093Boundary.noEndpointOauthSubmissionFromFp0093,
      noPublicAppImplementationFromFp0093:
        fp0093Boundary.noPublicAppImplementationFromFp0093,
      noAppsSdkIframeFromFp0093: fp0093Boundary.noAppsSdkIframeFromFp0093,
      noOpenAiApiModelCallsFromFp0093:
        fp0093Boundary.noOpenAiApiModelCallsFromFp0093,
      noSourceMutationFinanceWriteFromFp0093:
        fp0093Boundary.noSourceMutationFinanceWriteFromFp0093,
      noGeneratedProductProseRuntimeCodexFromFp0093:
        fp0093Boundary.noGeneratedProductProseRuntimeCodexFromFp0093,
      noApiRoutesFromFp0094: fp0094Boundary.noApiRoutesFromFp0094,
      noBackendRoutesFromFp0094: fp0094Boundary.noBackendRoutesFromFp0094,
      noEndpointsFromFp0094: fp0094Boundary.noEndpointsFromFp0094,
      noAppsSdkIframeFromFp0094:
        fp0094Boundary.noAppsSdkIframeFromFp0094,
      noOauthSubmissionFromFp0094:
        fp0094Boundary.noOauthSubmissionFromFp0094,
      noPublicAppImplementationFromFp0094:
        fp0094Boundary.noPublicAppImplementationFromFp0094,
      noOpenAiApiCallsFromFp0094:
        fp0094Boundary.noOpenAiApiCallsFromFp0094,
      noSourceMutationFinanceWriteFromFp0094:
        fp0094Boundary.noSourceMutationFinanceWriteFromFp0094,
      noRouteImplementationFromFp0095:
        fp0095Boundary.noRouteImplementationFromFp0095,
      noScreenshotAssetsFromFp0095:
        fp0095Boundary.noScreenshotAssetsFromFp0095,
      noEndpointOauthSubmissionFromFp0095:
        fp0095Boundary.noEndpointOauthSubmissionFromFp0095,
      noPublicAppImplementationFromFp0095:
        fp0095Boundary.noPublicAppImplementationFromFp0095,
      noAppsSdkIframeFromFp0095:
        fp0095Boundary.noAppsSdkIframeFromFp0095,
      noRemoteMcpDeploymentFromFp0095:
        fp0095Boundary.noRemoteMcpDeploymentFromFp0095,
      noOpenAiApiModelCallsFromFp0095:
        fp0095Boundary.noOpenAiApiModelCallsFromFp0095,
      noProviderCertificationDeploymentFromFp0095:
        fp0095Boundary.noProviderCertificationDeploymentFromFp0095,
      noSourceMutationFinanceWriteFromFp0095:
        fp0095Boundary.noSourceMutationFinanceWriteFromFp0095,
      noGeneratedProductProseRuntimeCodexFromFp0095:
        fp0095Boundary.noGeneratedProductProseRuntimeCodexFromFp0095,
      noPublicAssetsFromFp0095: fp0095Boundary.noPublicAssetsFromFp0095,
      noAdditionalRoutesFromFp0096:
        fp0096Boundary.noAdditionalRoutesFromFp0096,
      noApiRoutesFromFp0096: fp0096Boundary.noApiRoutesFromFp0096,
      noAppsSdkIframeFromFp0096:
        fp0096Boundary.noAppsSdkIframeFromFp0096,
      noBackendRoutesFromFp0096: fp0096Boundary.noBackendRoutesFromFp0096,
      noEndpointsFromFp0096: fp0096Boundary.noEndpointsFromFp0096,
      noOauthSubmissionFromFp0096:
        fp0096Boundary.noOauthSubmissionFromFp0096,
      noOpenAiApiCallsFromFp0096:
        fp0096Boundary.noOpenAiApiCallsFromFp0096,
      noPublicAppImplementationFromFp0096:
        fp0096Boundary.noPublicAppImplementationFromFp0096,
      noPublicAssetsFromFp0096: fp0096Boundary.noPublicAssetsFromFp0096,
      noScreenshotAssetsFromFp0096:
        fp0096Boundary.noScreenshotAssetsFromFp0096,
      noSourceMutationFinanceWriteFromFp0096:
        fp0096Boundary.noSourceMutationFinanceWriteFromFp0096,
      noAdditionalRoutesFromFp0097:
        fp0097Boundary.noAdditionalRoutesFromFp0097,
      noApiRoutesFromFp0097: fp0097Boundary.noApiRoutesFromFp0097,
      noAppsSdkIframeFromFp0097: fp0097Boundary.noAppsSdkIframeFromFp0097,
      noBackendRoutesFromFp0097: fp0097Boundary.noBackendRoutesFromFp0097,
      noEndpointsFromFp0097: fp0097Boundary.noEndpointsFromFp0097,
      noOauthSubmissionFromFp0097:
        fp0097Boundary.noOauthSubmissionFromFp0097,
      noOpenAiApiCallsFromFp0097:
        fp0097Boundary.noOpenAiApiCallsFromFp0097,
      noPublicAppImplementationFromFp0097:
        fp0097Boundary.noPublicAppImplementationFromFp0097,
      noPublicAssetsFromFp0097: fp0097Boundary.noPublicAssetsFromFp0097,
      noScreenshotAssetsFromFp0097:
        fp0097Boundary.noScreenshotAssetsFromFp0097,
      noSourceMutationFinanceWriteFromFp0097:
        fp0097Boundary.noSourceMutationFinanceWriteFromFp0097,
      routeMetadataNoIndexBoundaryVerified:
        fp0097Boundary.routeMetadataNoIndexBoundaryVerified,
      screenshotlessVisualQaVerified:
        fp0097Boundary.screenshotlessVisualQaVerified,
      accessibilityStateMatrixVerified:
        fp0097Boundary.accessibilityStateMatrixVerified,
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

function safeDemoDataPolicy() {
  return {
    firstGate: true,
    forbiddenFinanceData: financeData,
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

function baseTask(
  taskKind,
  expectedRefusalKind = "unsupported_evidence_refusal",
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
      state: "fresh",
      summary: "Fresh synthetic benchmark contract posture.",
    },
    limitationPosture: [
      {
        affectedAnchorIds: [],
        affectedSourceIds: [],
        code: "not_source_truth",
        severity: "blocking",
        summary: "V2F benchmark contracts are not source truth.",
      },
    ],
    noRuntimeBoundary: noRuntimeBoundary(),
    permittedNextActions: [
      {
        action: "request_human_review",
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

const safePolicy = SafeDemoDataPolicySchema.parse(safeDemoDataPolicy());
const syntheticPolicy = SyntheticFinanceSourcePolicySchema.parse(
  syntheticFinanceSourcePolicy(),
);
const privacy = privacyBoundary();
const noRuntime = BenchmarkNoRuntimeBoundarySchema.parse({
  ...noRuntimeBoundary(),
  noEvalDatasetsAdded: !existsSync("evals/v2f"),
  noFixturesAdded: !existsSync("fixtures/v2f"),
  noPackageScriptsAdded,
  noPublicDemoDataAdded: !existsSync("docs/demo/v2f-public-demo-data"),
  noPublicSourcePacksAdded: !existsSync("source-packs/v2f"),
  noSampleDataAdded: !existsSync("samples/v2f"),
  noSmokeAliasesAdded,
});
const architecture = ArchitectureMapSchema.parse(architectureMap());
const challenge = ContributorChallengeSchema.parse(contributorChallenge());
const placeholder = BenchmarkCaseSchema.parse(benchmarkCase());
const tasks = taskSpecs.map(([schema, kind, extra, refusal]) =>
  schema.parse({ ...baseTask(kind, refusal), ...extra }),
);
const taskFor = (kind) => tasks.find((task) => task.taskKind === kind);
const manifestInput = {
  allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
  architectureMap: architecture,
  benchmarkCase: placeholder,
  containsNoDataOrSourcePackReferences: true,
  contributorChallenge: challenge,
  describesFutureCommunityPackOnly: true,
  manifestKind: "CommunityPackManifest",
  noRuntimeBoundary: noRuntime,
  owningFinancePlan: "FP-0086",
  privacyBoundary: privacy,
  safeDemoDataPolicy: safePolicy,
  schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  syntheticFinanceSourcePolicy: syntheticPolicy,
  validationPosture: {
    directProofCommandOnly: true,
    inMemorySyntheticExamplesOnly: true,
    noDataFileAliasesAllowed: true,
    noPackageScriptOrSmokeAlias: true,
  },
};
const manifest = CommunityPackManifestSchema.parse(manifestInput);

const rejects = (schema, value) => !schema.safeParse(value).success;
const unknownKeysRejected = [
  [SafeDemoDataPolicySchema, { ...safeDemoDataPolicy(), unknownKey: true }],
  [
    SyntheticFinanceSourcePolicySchema,
    { ...syntheticFinanceSourcePolicy(), unknownKey: true },
  ],
  [
    BenchmarkNoRuntimeBoundarySchema,
    { ...noRuntimeBoundary(), unknownKey: true },
  ],
  [ContributorChallengeSchema, { ...contributorChallenge(), unknownKey: true }],
  [ArchitectureMapSchema, { ...architectureMap(), unknownKey: true }],
  [BenchmarkCaseSchema, { ...benchmarkCase(), unknownKey: true }],
  [CommunityPackManifestSchema, { ...manifestInput, unknownKey: true }],
].every(([schema, value]) => rejects(schema, value));
const communityPackManifestDataAliasesRejected =
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS.every(
    (field) =>
      rejects(CommunityPackManifestSchema, { ...manifestInput, [field]: [] }) &&
      rejects(CommunityPackManifestSchema, {
        ...manifestInput,
        [field]: ["synthetic alias payload"],
      }),
  );
const communityPackManifestExplicitDataFieldsRejected = [
  "dataFiles",
  "sourcePackFiles",
  "evalDatasetFiles",
  "fixtureFiles",
].every((field) =>
  rejects(CommunityPackManifestSchema, {
    ...manifestInput,
    [field]: ["synthetic explicit data reference"],
  }),
);
const authorityLayerDuplicatesRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS.slice(0, 7), "raw_sources"],
});
const authorityLayerMissingRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
});
const authorityLayerExtraRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS, "raw_sources"],
});
const authorityLayerReorderRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [
    "finance_twin",
    "raw_sources",
    ...BENCHMARK_AUTHORITY_LAYERS.slice(2),
  ],
});
const authorityLayersExactOrderVerified =
  JSON.stringify(architecture.authorityLayers) ===
  JSON.stringify(BENCHMARK_AUTHORITY_LAYERS);
const benchmarkTaskUnknownKeysRejected = rejects(EvidenceRecallTaskSchema, {
  ...baseTask("evidence_recall"),
  recallsExistingEvidenceOnly: true,
  route: "/should-not-exist",
});
const benchmarkTaskNestedUnknownKeysRejected =
  rejects(EvidenceRecallTaskSchema, {
    ...baseTask("evidence_recall"),
    companyContext: {
      ...baseTask("evidence_recall").companyContext,
      rawFullText: "synthetic but forbidden raw text posture",
    },
    recallsExistingEvidenceOnly: true,
  }) &&
  rejects(EvidenceRecallTaskSchema, {
    ...baseTask("evidence_recall"),
    freshnessPosture: {
      ...baseTask("evidence_recall").freshnessPosture,
      pageTextDump: "synthetic but forbidden page text dump posture",
    },
    recallsExistingEvidenceOnly: true,
  });

const proof = BenchmarkProofSchema.parse({
  ...noRuntime,
  architectureMapBoundaryVerified:
    architecture.v2fContractsNotTruthRuntimeOrData,
  authorityLayerDuplicatesRejected,
  authorityLayerExtraRejected,
  authorityLayerMissingRejected,
  authorityLayerReorderRejected,
  authorityLayersExactOrderVerified,
  benchmarkCasePlaceholderOnlyVerified: placeholder.placeholderOnly,
  benchmarkNoRuntimeBoundaryVerified: noRuntime.noProductRuntime,
  benchmarkPrivacyBoundaryVerified: privacy.noRealCompanyData,
  benchmarkTaskTaxonomyVerified:
    JSON.stringify(tasks.map((task) => task.taskKind)) ===
    JSON.stringify(BENCHMARK_TASK_KINDS),
  benchmarkProofUnknownKeysRejected: true,
  benchmarkTaskNestedUnknownKeysRejected,
  benchmarkTaskUnknownKeysRejected,
  communityPackManifestDataAliasesRejected,
  communityPackManifestExplicitDataFieldsRejected,
  communityPackManifestVerified: manifest.containsNoDataOrSourcePackReferences,
  contributorChallengeBoundaryVerified:
    challenge.noPublicLaunchImplied &&
    challenge.noSaasDeploymentImplied &&
    challenge.noProviderIntegrationImplied,
  evidenceFaithfulnessTaskVerified:
    taskFor("evidence_faithfulness")?.proofExpectations.noDatasetRequired ===
      true && taskFor("evidence_faithfulness")?.readOnlyProofOnly === true,
  evidenceFreshnessLimitationsPermittedActionFieldsVerified: tasks.every(
    (task) =>
      task.freshnessPosture.summary &&
      task.limitationPosture.length > 0 &&
      task.permittedNextActions.length > 0,
  ),
  evidenceRecallTaskVerified:
    taskFor("evidence_recall")?.evidenceRequirements.evidenceIndexAllowed ===
    true,
  forbiddenActionsVerified: tasks.every((task) =>
    ["openai_api_call", "finance_write", "autonomous_action"].every((action) =>
      task.forbiddenActions.includes(action),
    ),
  ),
  fp0087AbsentOrDocsOnlyBoundaryVerified:
    fp0087AbsentOrDocsOnlyBoundaryVerified(),
  fp0088AbsentOrDocsOnlyBoundaryVerified:
    fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0089AbsentOrDocsOnlyBoundaryVerified:
    fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0090AbsentOrDocsOnlyBoundaryVerified:
    fp0090Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0091AbsentOrLocalUiComponentBoundaryVerified:
    fp0091Boundary.absentOrLocalUiComponentBoundaryVerified,
  fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified:
    fp0092Boundary.absentOrLocalUiCompositionAccessibilityBoundaryVerified,
  fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified:
    fp0093Boundary.absentOrDocsOnlyPreviewRouteBoundaryVerified,
  fp0094AbsentOrLocalPreviewRouteBoundaryVerified:
    fp0094Boundary.absentOrLocalPreviewRouteBoundaryVerified,
  fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
    fp0095Boundary.absentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
  fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified:
    fp0096Boundary.absentOrLocalPreviewRouteStateMatrixBoundaryVerified,
  fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified:
    fp0097Boundary.absentOrLocalPreviewRouteVisualQaBoundaryVerified,
  fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified:
    fp0098Boundary.absentOrDocsOnlyPublicAppReadinessBoundaryVerified,
  fp0099Absent,
  publicAppReadinessPlanBoundaryVerified:
    fp0098Boundary.publicAppReadinessPlanBoundaryVerified,
  noPublicAppImplementationFromFp0098:
    fp0098Boundary.noPublicAppImplementationFromFp0098,
  noAppsSdkIframeFromFp0098: fp0098Boundary.noAppsSdkIframeFromFp0098,
  noRemoteMcpDeploymentFromFp0098:
    fp0098Boundary.noRemoteMcpDeploymentFromFp0098,
  noEndpointOauthSubmissionFromFp0098:
    fp0098Boundary.noEndpointOauthSubmissionFromFp0098,
  noOpenAiApiCallsFromFp0098: fp0098Boundary.noOpenAiApiCallsFromFp0098,
  noSourceMutationFinanceWriteFromFp0098:
    fp0098Boundary.noSourceMutationFinanceWriteFromFp0098,
  noScreenshotListingSubmissionAssetsFromFp0098:
    fp0098Boundary.noScreenshotListingSubmissionAssetsFromFp0098,
  premiumUiSecurityPlanBoundaryVerified:
    fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
  premiumUiDesignSystemPlanBoundaryVerified:
    fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
  premiumUiImplementationPlanBoundaryVerified:
    fp0090Boundary.premiumUiImplementationPlanBoundaryVerified,
  premiumUiComponentFoundationVerified:
    fp0091Boundary.premiumUiComponentFoundationVerified,
  premiumUiCompositionAccessibilityFoundationVerified:
    fp0092Boundary.premiumUiCompositionAccessibilityFoundationVerified,
  localUiPreviewRoutePlanBoundaryVerified:
    fp0093Boundary.localUiPreviewRoutePlanBoundaryVerified,
  localPreviewRouteFoundationVerified:
    fp0094Boundary.localPreviewRouteFoundationVerified,
  localPreviewRouteStateMatrixPlanBoundaryVerified:
    fp0095Boundary.localPreviewRouteStateMatrixPlanBoundaryVerified,
  localPreviewRouteStateMatrixFoundationVerified:
    fp0096Boundary.localPreviewRouteStateMatrixFoundationVerified,
  localPreviewRouteVisualQaFoundationVerified:
    fp0097Boundary.localPreviewRouteVisualQaFoundationVerified,
  noUiImplementationFromFp0088:
    fp0088Boundary.noUiImplementationFromFp0088,
  noUiImplementationFromFp0089:
    fp0089Boundary.noUiImplementationFromFp0089,
  noAppsSdkIframeFromFp0089:
    fp0089Boundary.noAppsSdkIframeFromFp0089,
  noUiCodeFromFp0090: fp0090Boundary.noUiCodeFromFp0090,
  noAppsSdkIframeFromFp0090:
    fp0090Boundary.noAppsSdkIframeFromFp0090,
  noEndpointOauthSubmissionFromFp0088:
    fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
  noEndpointOauthSubmissionFromFp0089:
    fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
  noEndpointOauthSubmissionFromFp0090:
    fp0090Boundary.noEndpointOauthSubmissionFromFp0090,
  noPublicAppImplementationFromFp0090:
    fp0090Boundary.noPublicAppImplementationFromFp0090,
  noRoutesFromFp0091: fp0091Boundary.noRoutesFromFp0091,
  noEndpointsFromFp0091: fp0091Boundary.noEndpointsFromFp0091,
  noAppsSdkIframeFromFp0091: fp0091Boundary.noAppsSdkIframeFromFp0091,
  noOauthSubmissionFromFp0091:
    fp0091Boundary.noOauthSubmissionFromFp0091,
  noPublicAppImplementationFromFp0091:
    fp0091Boundary.noPublicAppImplementationFromFp0091,
  noOpenAiApiCallsFromFp0091:
    fp0091Boundary.noOpenAiApiCallsFromFp0091,
  noSourceMutationFinanceWriteFromFp0091:
    fp0091Boundary.noSourceMutationFinanceWriteFromFp0091,
  noRoutesFromFp0092: fp0092Boundary.noRoutesFromFp0092,
  noEndpointsFromFp0092: fp0092Boundary.noEndpointsFromFp0092,
  noAppsSdkIframeFromFp0092: fp0092Boundary.noAppsSdkIframeFromFp0092,
  noOauthSubmissionFromFp0092: fp0092Boundary.noOauthSubmissionFromFp0092,
  noPublicAppImplementationFromFp0092:
    fp0092Boundary.noPublicAppImplementationFromFp0092,
  noOpenAiApiCallsFromFp0092: fp0092Boundary.noOpenAiApiCallsFromFp0092,
  noSourceMutationFinanceWriteFromFp0092:
    fp0092Boundary.noSourceMutationFinanceWriteFromFp0092,
  noRouteImplementationFromFp0093:
    fp0093Boundary.noRouteImplementationFromFp0093,
  noEndpointOauthSubmissionFromFp0093:
    fp0093Boundary.noEndpointOauthSubmissionFromFp0093,
  noPublicAppImplementationFromFp0093:
    fp0093Boundary.noPublicAppImplementationFromFp0093,
  noAppsSdkIframeFromFp0093: fp0093Boundary.noAppsSdkIframeFromFp0093,
  noOpenAiApiModelCallsFromFp0093:
    fp0093Boundary.noOpenAiApiModelCallsFromFp0093,
  noSourceMutationFinanceWriteFromFp0093:
    fp0093Boundary.noSourceMutationFinanceWriteFromFp0093,
  noGeneratedProductProseRuntimeCodexFromFp0093:
    fp0093Boundary.noGeneratedProductProseRuntimeCodexFromFp0093,
  noApiRoutesFromFp0094: fp0094Boundary.noApiRoutesFromFp0094,
  noBackendRoutesFromFp0094: fp0094Boundary.noBackendRoutesFromFp0094,
  noEndpointsFromFp0094: fp0094Boundary.noEndpointsFromFp0094,
  noAppsSdkIframeFromFp0094: fp0094Boundary.noAppsSdkIframeFromFp0094,
  noOauthSubmissionFromFp0094:
    fp0094Boundary.noOauthSubmissionFromFp0094,
  noPublicAppImplementationFromFp0094:
    fp0094Boundary.noPublicAppImplementationFromFp0094,
  noOpenAiApiCallsFromFp0094:
    fp0094Boundary.noOpenAiApiCallsFromFp0094,
  noSourceMutationFinanceWriteFromFp0094:
    fp0094Boundary.noSourceMutationFinanceWriteFromFp0094,
  noRouteImplementationFromFp0095:
    fp0095Boundary.noRouteImplementationFromFp0095,
  noScreenshotAssetsFromFp0095:
    fp0095Boundary.noScreenshotAssetsFromFp0095,
  noEndpointOauthSubmissionFromFp0095:
    fp0095Boundary.noEndpointOauthSubmissionFromFp0095,
  noPublicAppImplementationFromFp0095:
    fp0095Boundary.noPublicAppImplementationFromFp0095,
  noAppsSdkIframeFromFp0095: fp0095Boundary.noAppsSdkIframeFromFp0095,
  noRemoteMcpDeploymentFromFp0095:
    fp0095Boundary.noRemoteMcpDeploymentFromFp0095,
  noOpenAiApiModelCallsFromFp0095:
    fp0095Boundary.noOpenAiApiModelCallsFromFp0095,
  noProviderCertificationDeploymentFromFp0095:
    fp0095Boundary.noProviderCertificationDeploymentFromFp0095,
  noSourceMutationFinanceWriteFromFp0095:
    fp0095Boundary.noSourceMutationFinanceWriteFromFp0095,
  noGeneratedProductProseRuntimeCodexFromFp0095:
    fp0095Boundary.noGeneratedProductProseRuntimeCodexFromFp0095,
  noPublicAssetsFromFp0095: fp0095Boundary.noPublicAssetsFromFp0095,
  noAdditionalRoutesFromFp0096:
    fp0096Boundary.noAdditionalRoutesFromFp0096,
  noApiRoutesFromFp0096: fp0096Boundary.noApiRoutesFromFp0096,
  noAppsSdkIframeFromFp0096: fp0096Boundary.noAppsSdkIframeFromFp0096,
  noBackendRoutesFromFp0096: fp0096Boundary.noBackendRoutesFromFp0096,
  noEndpointsFromFp0096: fp0096Boundary.noEndpointsFromFp0096,
  noOauthSubmissionFromFp0096: fp0096Boundary.noOauthSubmissionFromFp0096,
  noOpenAiApiCallsFromFp0096: fp0096Boundary.noOpenAiApiCallsFromFp0096,
  noPublicAppImplementationFromFp0096:
    fp0096Boundary.noPublicAppImplementationFromFp0096,
  noPublicAssetsFromFp0096: fp0096Boundary.noPublicAssetsFromFp0096,
  noScreenshotAssetsFromFp0096:
    fp0096Boundary.noScreenshotAssetsFromFp0096,
  noSourceMutationFinanceWriteFromFp0096:
    fp0096Boundary.noSourceMutationFinanceWriteFromFp0096,
  noAdditionalRoutesFromFp0097:
    fp0097Boundary.noAdditionalRoutesFromFp0097,
  noApiRoutesFromFp0097: fp0097Boundary.noApiRoutesFromFp0097,
  noAppsSdkIframeFromFp0097: fp0097Boundary.noAppsSdkIframeFromFp0097,
  noBackendRoutesFromFp0097: fp0097Boundary.noBackendRoutesFromFp0097,
  noEndpointsFromFp0097: fp0097Boundary.noEndpointsFromFp0097,
  noOauthSubmissionFromFp0097: fp0097Boundary.noOauthSubmissionFromFp0097,
  noOpenAiApiCallsFromFp0097: fp0097Boundary.noOpenAiApiCallsFromFp0097,
  noPublicAppImplementationFromFp0097:
    fp0097Boundary.noPublicAppImplementationFromFp0097,
  noPublicAssetsFromFp0097: fp0097Boundary.noPublicAssetsFromFp0097,
  noScreenshotAssetsFromFp0097:
    fp0097Boundary.noScreenshotAssetsFromFp0097,
  noSourceMutationFinanceWriteFromFp0097:
    fp0097Boundary.noSourceMutationFinanceWriteFromFp0097,
  routeMetadataNoIndexBoundaryVerified:
    fp0097Boundary.routeMetadataNoIndexBoundaryVerified,
  screenshotlessVisualQaVerified:
    fp0097Boundary.screenshotlessVisualQaVerified,
  accessibilityStateMatrixVerified:
    fp0097Boundary.accessibilityStateMatrixVerified,
  inMemorySyntheticExamplesOnlyVerified:
    manifest.validationPosture.inMemorySyntheticExamplesOnly,
  missingCitationTaskVerified:
    taskFor("missing_citation")?.expectedRefusalPosture.expectedRefusalKind ===
      "missing_citation_refusal" &&
    taskFor("missing_citation")?.readOnlyProofOnly === true,
  monitorBoundaryTaskVerified:
    taskFor("monitor_boundary")?.noRuntimeBoundary.noProductRuntime === true,
  noCredentialTokenSecretPolicyVerified: [
    "credentials",
    "tokens",
    "secrets",
  ].every((artifact) =>
    safePolicy.forbiddenPrivateArtifacts.includes(artifact),
  ),
  noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderDataVerified:
    financeData.every((category) =>
      safePolicy.forbiddenFinanceData.includes(category),
    ),
  noRealFinanceDataPolicyVerified:
    safePolicy.forbidsRealCompanyData &&
    safePolicy.forbidsLightlyAnonymizedRealFinanceData,
  policyLookupTaskVerified:
    taskFor("policy_lookup")?.citationRequirements
      .sourceAnchorOrAcceptedDerivedRefRequired === true,
  reportTraceabilityTaskVerified:
    taskFor("report_traceability")?.contractPlaceholderOnly === true,
  safeDemoDataPolicyVerified:
    safePolicy.firstGate && safePolicy.requiresSyntheticOnlyBeforeFutureCase,
  sourceCoverageTaskVerified:
    taskFor("source_coverage")?.expectedRefusalPosture
      .whenEvidenceUnsupported === "unsupported_evidence_refusal",
  syntheticExamplesClearlyLabeledVerified: tasks.every(
    (task) =>
      task.companyContext.syntheticOnly &&
      task.companyContext.companyKey.includes("synthetic") &&
      task.freshnessPosture.summary.includes("synthetic"),
  ),
  syntheticFinanceSourcePolicyVerified:
    syntheticPolicy.requiresInventedCompanyFacts &&
    syntheticPolicy.requiresInventedSourceFacts &&
    syntheticPolicy.requiresClearSyntheticLabeling,
  unknownKeysRejected,
  unsafeActionRefusalTaskVerified:
    taskFor("unsafe_action_refusal")?.expectedRefusalPosture
      .expectedRefusalKind === "unsafe_action_refusal" &&
    taskFor("unsafe_action_refusal")?.readOnlyProofOnly === true,
});

const benchmarkProofUnknownKeysRejected = rejects(BenchmarkProofSchema, {
  ...proof,
  rawFullText: "synthetic but forbidden proof field",
});
if (!benchmarkProofUnknownKeysRejected) {
  throw new Error(
    "V2F benchmark proof failed: benchmarkProofUnknownKeysRejected",
  );
}

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`V2F benchmark community proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0088DocsOnlyBoundary() {
  const fp0088PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0088/u.test(path),
  );

  if (fp0088PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noEndpointOauthSubmissionFromFp0088: true,
      noUiImplementationFromFp0088: true,
      premiumUiSecurityPlanBoundaryVerified: true,
    };
  }

  if (fp0088PathHits.length !== 1 || fp0088PathHits[0] !== FP0088_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noEndpointOauthSubmissionFromFp0088: false,
      noUiImplementationFromFp0088: false,
      premiumUiSecurityPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0088_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0088 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no package scripts or smoke aliases",
    "no eval datasets, fixtures, sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiSecurityPlanBoundaryVerified = [
    "premium ui readiness requirements only",
    "app/mcp security readiness requirements only",
    "premium apple/openai-style visual standard",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0088 = [
    "does not authorize apps sdk iframe/ui code",
    "future ui polish/design-system implementation plan",
    "before ui code",
    "do not implement ui",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0088 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before submission",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noEndpointOauthSubmissionFromFp0088,
    noUiImplementationFromFp0088,
    premiumUiSecurityPlanBoundaryVerified,
  };
}

function fp0089DocsOnlyBoundary() {
  const fp0089PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0089/u.test(path),
  );

  if (fp0089PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0089: true,
      noEndpointOauthSubmissionFromFp0089: true,
      noUiImplementationFromFp0089: true,
      premiumUiDesignSystemPlanBoundaryVerified: true,
    };
  }

  if (fp0089PathHits.length !== 1 || fp0089PathHits[0] !== FP0089_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0089: false,
      noEndpointOauthSubmissionFromFp0089: false,
      noUiImplementationFromFp0089: false,
      premiumUiDesignSystemPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0089_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0089 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui design-system readiness plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiDesignSystemPlanBoundaryVerified = [
    "design tokens",
    "semantic color tokens",
    "spacing scale",
    "typography scale",
    "evidence-card hierarchy",
    "citation/source-anchor affordances",
    "refusal-state visual grammar",
    "limitation/freshness badges",
    "keyboard/focus behavior",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "sourceanchordrawer",
    "premium apple/openai-style visual standard",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0089 = [
    "does not authorize ui code",
    "requires a later ui implementation finance plan before any component code",
    "no ui implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0089 = [
    "does not authorize apps sdk iframe/ui code",
    "no apps sdk iframe/ui",
    "does not authorize public app implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0089 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0089,
    noEndpointOauthSubmissionFromFp0089,
    noUiImplementationFromFp0089,
    premiumUiDesignSystemPlanBoundaryVerified,
  };
}

function fp0090DocsOnlyBoundary() {
  const fp0090PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0090/u.test(path),
  );

  if (fp0090PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0090: true,
      noEndpointOauthSubmissionFromFp0090: true,
      noPublicAppImplementationFromFp0090: true,
      noUiCodeFromFp0090: true,
      premiumUiImplementationPlanBoundaryVerified: true,
    };
  }

  if (fp0090PathHits.length !== 1 || fp0090PathHits[0] !== FP0090_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0090: false,
      noEndpointOauthSubmissionFromFp0090: false,
      noPublicAppImplementationFromFp0090: false,
      noUiCodeFromFp0090: false,
      premiumUiImplementationPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0090_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0090 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui implementation master-plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no public app implementation",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiImplementationPlanBoundaryVerified = [
    "future ui implementation boundary",
    "screenshot review before merge",
    "accessibility acceptance criteria",
    "evidence hierarchy acceptance",
    "no action-looking controls for forbidden actions",
    "no raw text dump panels",
    "no advice-like ctas",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "evidencecardstack",
    "citationrail",
    "sourceanchordrawer",
    "freshnessbadge",
    "limitationcallout",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
    "apps/web/components/read-only-app-mcp",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiCodeFromFp0090 = [
    "does not authorize ui code yet",
    "this is not ui implementation",
    "future implementation slice may add ui components only if it remains local/proof-only/read-only",
    "no ui code was added",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0090 = [
    "does not authorize apps sdk iframe/ui code yet",
    "no apps sdk iframe/ui",
    "apps sdk iframe/ui implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0090 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "no endpoint implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noPublicAppImplementationFromFp0090 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation remains future-only",
    "public app implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0090,
    noEndpointOauthSubmissionFromFp0090,
    noPublicAppImplementationFromFp0090,
    noUiCodeFromFp0090,
    premiumUiImplementationPlanBoundaryVerified,
  };
}

function fp0091LocalUiComponentBoundary() {
  const fp0091PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0091/u.test(path),
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0091PathHits.length === 0) return absentBoundary;
  if (fp0091PathHits.length !== 1 || fp0091PathHits[0] !== FP0091_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0091_PLAN, "utf8").toLowerCase();
  const componentSource = repoFilePaths()
    .filter((path) => path.startsWith("apps/web/components/read-only-app-mcp/"))
    .filter((path) => /\.(ts|tsx)$/u.test(path))
    .filter((path) => !/\.(spec|test)\.tsx?$/u.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .toLowerCase();
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
    ].every((requiredText) => lower.includes(requiredText));
  const noRoutesFromFp0091 =
    ["does not add routes", "no app routes"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp/"),
    );
  const noEndpointsFromFp0091 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp"),
    );
  const noAppsSdkIframeFromFp0091 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lower.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0091 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lower.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0091 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lower.includes(requiredText));
  const noOpenAiApiCallsFromFp0091 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lower.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0091 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lower.includes(requiredText),
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
  const fp0092PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0092/u.test(path),
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0092PathHits.length === 0) return absentBoundary;
  if (fp0092PathHits.length !== 1 || fp0092PathHits[0] !== FP0092_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0092_PLAN, "utf8").toLowerCase();
  const componentFiles = repoFilePaths()
    .filter((path) => path.startsWith("apps/web/components/read-only-app-mcp/"))
    .filter((path) => /\.(ts|tsx)$/u.test(path));
  const componentSource = componentFiles
    .filter((path) => !/\.(spec|test)\.tsx?$/u.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .toLowerCase();
  const componentAndTestSource = componentFiles
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .toLowerCase();
  const normalizedComponentSource = componentSource.replace(
    /[^a-z0-9]+/gu,
    "",
  );
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
      lower.replace(/`/gu, "").includes(requiredText),
    );
  const noRoutesFromFp0092 =
    ["does not add app routes", "no app routes"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp/"),
    );
  const noEndpointsFromFp0092 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp"),
    );
  const noAppsSdkIframeFromFp0092 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lower.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0092 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lower.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0092 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lower.includes(requiredText));
  const noOpenAiApiCallsFromFp0092 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lower.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0092 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lower.includes(requiredText),
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
  const fp0093PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0093/u.test(path),
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0093PathHits.length === 0) return absentBoundary;
  if (fp0093PathHits.length !== 1 || fp0093PathHits[0] !== FP0093_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0093_PLAN, "utf8").toLowerCase();
  const normalized = lower.replace(/[`_*]+/gu, "");
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
  ].every((requiredText) => normalized.includes(requiredText));
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
  ].every((requiredText) => normalized.includes(requiredText));
  const noRouteImplementationFromFp0093 =
    [
      "does not authorize route code yet",
      "this is not route implementation",
      "no route code",
      "no app route",
    ].every((requiredText) => normalized.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0093 =
    [
      "does not authorize endpoint implementation",
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize app submission",
      "no endpoint implementation",
      "no oauth",
      "no app submission",
    ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAppImplementationFromFp0093 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation must still wait",
    "public app implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkIframeFromFp0093 = [
    "does not authorize apps sdk iframe/ui resources",
    "no apps sdk iframe/ui resource registration",
    "apps sdk iframe/ui resource implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiModelCallsFromFp0093 =
    ["no openai api/model calls", "no openai api key was created or used"].every(
      (requiredText) => normalized.includes(requiredText),
    );
  const noSourceMutationFinanceWriteFromFp0093 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      normalized.includes(requiredText),
    );
  const noGeneratedProductProseRuntimeCodexFromFp0093 =
    [
      "no generated product prose",
      "no runtime-codex finance output",
      "no mission-facing output was generated",
    ].every((requiredText) => normalized.includes(requiredText));

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
  const fp0094PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0094/u.test(path),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeExists = routePaths.includes(routePagePath);
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0094PathHits.length === 0) return absentBoundary;
  if (fp0094PathHits.length !== 1 || fp0094PathHits[0] !== FP0094_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0094_PLAN, "utf8").toLowerCase();
  const normalized = lower.replace(/[`_*]+/gu, "");
  const routeSource = routeExists ? readFileSync(routePagePath, "utf8") : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
    : "";
  const routeAndSpecNormalized = `${routeSource}\n${routeSpecSource}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "");
  const apiRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp") ||
      path.startsWith("apps/web/app/read-only-app-mcp-preview/route."),
  );
  const backendRouteExists = repoFilePaths().some(
    (path) =>
      path.startsWith("apps/control-plane/") &&
      /read-only-app-mcp-preview|fp-0094|fp0094/u.test(path),
  );
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
    ].every((requiredText) => normalized.includes(requiredText)) &&
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
      normalized.includes(requiredText),
    ) && !apiRouteExists;
  const noBackendRoutesFromFp0094 =
    ["no backend/control-plane routes", "backend routes"].every(
      (requiredText) => normalized.includes(requiredText),
    ) && !backendRouteExists;
  const noEndpointsFromFp0094 =
    ["no endpoints", "no endpoint"].every((requiredText) =>
      normalized.includes(requiredText),
    ) && !endpointImplementationExists;
  const noAppsSdkIframeFromFp0094 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !/(iframe|postmessage|registerresource|apps-sdk)/iu.test(routeSource);
  const noOauthSubmissionFromFp0094 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => normalized.includes(requiredText),
    );
  const noPublicAppImplementationFromFp0094 = [
    "does not implement a public chatgpt app",
    "no public app implementation",
    "public app implementation",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0094 =
    [
      "does not add openai api/model calls",
      "no openai api key was created or used",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    !/(openai_api_key|from\s+["']openai["']|openai\.|responses\.create|chat\.completions)/iu.test(
      routeSource,
    );
  const noSourceMutationFinanceWriteFromFp0094 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      normalized.includes(requiredText),
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
  const fp0095PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0095/u.test(path),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeSource = routePaths.includes(routePagePath)
    ? readFileSync(routePagePath, "utf8")
    : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
    : "";
  const routeAndSpecSource = `${routeSource}\n${routeSpecSource}`;
  const allowedRouteFilesOnly =
    routePaths.length === 2 &&
    routePaths.includes(routePagePath) &&
    routePaths.includes(routeSpecPath);
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0095PathHits.length === 0) return absentBoundary;
  if (fp0095PathHits.length !== 1 || fp0095PathHits[0] !== FP0095_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0095_PLAN, "utf8").toLowerCase();
  const normalized = lower.replace(/[`_*]+/gu, "");
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
  const fp0096PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0096/u.test(path),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeSource = routePaths.includes(routePagePath)
    ? readFileSync(routePagePath, "utf8")
    : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0096PathHits.length === 0) return absentBoundary;
  if (fp0096PathHits.length !== 1 || fp0096PathHits[0] !== FP0096_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0096_PLAN, "utf8").toLowerCase();
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
  const fp0097PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0097/u.test(path),
  );
  const routePaths = repoFilePaths().filter((path) =>
    path.startsWith("apps/web/app/read-only-app-mcp-preview/"),
  );
  const routePagePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const routeSpecPath =
    "apps/web/app/read-only-app-mcp-preview/page.spec.tsx";
  const routeSource = routePaths.includes(routePagePath)
    ? readFileSync(routePagePath, "utf8")
    : "";
  const routeSpecSource = routePaths.includes(routeSpecPath)
    ? readFileSync(routeSpecPath, "utf8")
    : "";
  const componentSource = [
    "apps/web/components/read-only-app-mcp/app-shell.tsx",
    "apps/web/components/read-only-app-mcp/refusal-panel.tsx",
    "apps/web/components/read-only-app-mcp/states.tsx",
    "apps/web/components/read-only-app-mcp/types.ts",
    "apps/web/components/read-only-app-mcp/ui.tsx",
  ]
    .filter((path) => repoFilePaths().includes(path))
    .map((path) => readFileSync(path, "utf8"))
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
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0097PathHits.length === 0) return absentBoundary;
  if (fp0097PathHits.length !== 1 || fp0097PathHits[0] !== FP0097_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0097_PLAN, "utf8").toLowerCase();
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
  );
  const fp0098PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0098/u.test(path),
  );

  if (fp0098PathHits.length === 0) return absentBoundary;
  if (fp0098PathHits.length !== 1 || fp0098PathHits[0] !== FP0098_PLAN) {
    return failedBoundary;
  }

  const normalized = readFileSync(FP0098_PLAN, "utf8")
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

function repoFilePaths() {
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);
  const results = [];

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results;
}
