import {
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_FINANCE_DATA,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_PRIVATE_ARTIFACTS,
  SafeDemoDataPolicySchema,
} from "./benchmark-community";
import {
  APP_REFUSAL_REASONS,
  MCP_TOOL_ALLOWLIST,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
  classifyMcpToolCandidate,
  isMcpToolAllowed,
} from "./read-only-app-mcp-boundaries";
import {
  APP_THREAT_MODEL_QUESTIONS,
  AppCapabilityBoundaryFetchSchema,
  AppEvidenceFetchSchema,
  AppEvidenceQuerySchema,
  AppOAuthDeferredBoundarySchema,
  AppProofPlanSchema,
  AppProviderCertificationDeferredBoundarySchema,
  AppRefusalPostureSchema,
  AppSourceCoverageFetchSchema,
  AppSubmissionDeferredBoundarySchema,
  AppThreatModelQuestionsSchema,
  BaseAppPrivacyBoundary,
  BaseAppPromptInjectionBoundary,
  ReadOnlyChatGptAppPlanSchema,
  ReadOnlyMcpServerPlanSchema,
  baseAllowedTools,
  baseForbiddenTools,
} from "./read-only-app-mcp-contracts";
import {
  buildAppAuthorityBoundary,
  buildAppNoRuntimeBoundary,
} from "./read-only-app-mcp-runtime";
import {
  APP_FORBIDDEN_TOOL_PROOF_CANDIDATES,
  AppProofSchema,
  type AppProof,
} from "./read-only-app-mcp-proof-schema";

export function buildReadOnlyChatGptAppMcpProof(
  input: Partial<{
    fp0087DocsOnlyBoundaryVerified: boolean;
    fp0088Absent: boolean;
    noPackageScriptsAdded: boolean;
    noSmokeAliasesAdded: boolean;
  }> = {},
): AppProof {
  const noRuntimeBoundary = buildAppNoRuntimeBoundary({
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noSmokeAliasesAdded: input.noSmokeAliasesAdded ?? true,
  });
  const readOnlyAppPlan = ReadOnlyChatGptAppPlanSchema.parse({
    allowedTools: baseAllowedTools(),
    appSubmissionStarted: false,
    appsSdkUiImplemented: false,
    authorityBoundary: buildAppAuthorityBoundary(),
    contractOnly: true,
    forbiddenTools: baseForbiddenTools(),
    hostedToolsAllowed: false,
    localProofOnly: true,
    modelCallsAllowed: false,
    noRuntimeBoundary,
    oauthImplemented: false,
    openAiApiCallsAllowed: false,
    planKind: "ReadOnlyChatGptAppPlan",
    publicChatGptAppImplemented: false,
    responseRequiredFields: [
      "evidence",
      "freshness",
      "limitations",
      "permittedNextActions",
      "citations",
    ],
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const mcpPlan = ReadOnlyMcpServerPlanSchema.parse({
    contractOnly: true,
    endpointsImplemented: false,
    forbiddenTools: baseForbiddenTools(),
    localProofOnly: true,
    noMcpServerRuntime: true,
    noRemoteMcpDeployment: true,
    planKind: "ReadOnlyMcpServerPlan",
    remoteDeploymentImplemented: false,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    serverImplemented: false,
    toolAllowlist: baseAllowedTools(),
  });
  const evidenceQuery = AppEvidenceQuerySchema.parse({
    boundedExcerptsOnly: true,
    maxExcerptCharacters: 240,
    modelCallsAllowed: false,
    openAiApiCallsAllowed: false,
    queryKind: "AppEvidenceQuery",
    queryText: "synthetic evidence posture",
    rawFullFileDumpsAllowed: false,
    readsEvidenceMetadataOnly: true,
    requiresCitations: true,
    responseRequiredFields: readOnlyAppPlan.responseRequiredFields,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    vectorFileSearchAllowed: false,
  });
  const evidenceFetch = AppEvidenceFetchSchema.parse({
    artifactId: "synthetic-evidence-card",
    boundedExcerptsOnly: true,
    existingArtifactOnly: true,
    fetchKind: "evidence_card",
    rawFullFileDumpsAllowed: false,
    requiresCitations: true,
    responseRequiredFields: readOnlyAppPlan.responseRequiredFields,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    sourceMutationAllowed: false,
  });
  const sourceCoverageFetch = AppSourceCoverageFetchSchema.parse({
    createsSourceCoverage: false,
    existingCoverageOnly: true,
    fetchKind: "source_coverage",
    freshness: freshness(),
    limitations: [limitation()],
    mutatesSourcePacks: false,
    returnsFreshnessPosture: true,
    returnsUnsupportedMissingStalePosture: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const capabilityBoundaryFetch = AppCapabilityBoundaryFetchSchema.parse({
    allowedTools: baseAllowedTools(),
    fetchKind: "capability_boundaries",
    forbiddenTools: baseForbiddenTools(),
    noWriteOrActionTools: true,
    permittedNextActions: [humanReviewAction()],
    returnsForbiddenActions: true,
    returnsLimitations: true,
    returnsPermittedNextActions: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const refusalPosture = AppRefusalPostureSchema.parse({
    conflictingEvidenceRefuses: true,
    dataExfiltrationRefuses: true,
    failClosed: true,
    missingCitationRefuses: true,
    promptInjectionRefuses: true,
    rawFullFileDumpRequestRefuses: true,
    realFinanceDataPublicDemoBoundaryRefuses: true,
    requiredFailClosedReasons: [...APP_REFUSAL_REASONS],
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    staleEvidenceRefuses: true,
    unsafeActionRefuses: true,
    unsupportedEvidenceRefuses: true,
  });
  const oauthBoundary = AppOAuthDeferredBoundarySchema.parse({
    oauthDeferred: true,
    oauthImplemented: false,
    requiresLaterFinancePlan: true,
    requiresLaterThreatModel: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const submissionBoundary = AppSubmissionDeferredBoundarySchema.parse({
    appSubmissionDeferred: true,
    appSubmissionStarted: false,
    requiresLaterAppSubmissionFinancePlan: true,
    requiresLocalProofGreen: true,
    requiresPrivacyDocsGreen: true,
    requiresSecurityDocsGreen: true,
    requiresV2fBenchmarkPostureGreen: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const providerBoundary = AppProviderCertificationDeferredBoundarySchema.parse(
    {
      certificationDeferred: true,
      customerContactDeferred: true,
      deliveryDeferred: true,
      externalCommunicationsDeferred: true,
      legalAuditTaxAdviceDeferred: true,
      paymentDeferred: true,
      providerIntegrationDeferred: true,
      schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    },
  );
  const proofPlan = AppProofPlanSchema.parse({
    directProofCommand: "tools/read-only-chatgpt-app-mcp-proof.mjs",
    inMemorySyntheticExamplesOnly: true,
    machineReadableJson: true,
    noPackageScriptOrSmokeAlias: true,
    proofKind: "AppProofPlan",
    provesExactAllowlist: true,
    provesForbiddenTools: true,
    provesNoFixturesDatasetsSampleDataOrSourcePacks: true,
    provesNoOpenAiApiOrModelCalls: true,
    provesRefusalPrivacyNoRuntimeBoundaries: true,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const threatQuestions = AppThreatModelQuestionsSchema.parse({
    contractOnlyQuestionList: true,
    implementationStarted: false,
    questions: [...APP_THREAT_MODEL_QUESTIONS],
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  });
  const safeDemoDataPolicy = SafeDemoDataPolicySchema.parse({
    firstGate: true,
    forbiddenFinanceData: [...SAFE_DEMO_DATA_POLICY_FORBIDDEN_FINANCE_DATA],
    forbiddenPrivateArtifacts: [
      ...SAFE_DEMO_DATA_POLICY_FORBIDDEN_PRIVATE_ARTIFACTS,
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
  });
  const forbiddenCandidatesRejected = APP_FORBIDDEN_TOOL_PROOF_CANDIDATES.every(
    (candidate) =>
      classifyMcpToolCandidate(candidate).forbidden &&
      !isMcpToolAllowed(candidate),
  );
  const noForbiddenCandidateInAllowlist =
    APP_FORBIDDEN_TOOL_PROOF_CANDIDATES.every(
      (candidate) => !MCP_TOOL_ALLOWLIST.includes(candidate as never),
    );
  const allowlistExact =
    JSON.stringify(readOnlyAppPlan.allowedTools) ===
      JSON.stringify(MCP_TOOL_ALLOWLIST) &&
    JSON.stringify(mcpPlan.toolAllowlist) ===
      JSON.stringify(MCP_TOOL_ALLOWLIST);

  return AppProofSchema.parse({
    allowedTools: baseAllowedTools(),
    appCapabilityBoundaryFetchVerified:
      capabilityBoundaryFetch.noWriteOrActionTools,
    appEvidenceFetchVerified:
      evidenceFetch.rawFullFileDumpsAllowed === false &&
      evidenceFetch.sourceMutationAllowed === false,
    appEvidenceQueryVerified:
      evidenceQuery.modelCallsAllowed === false &&
      evidenceQuery.openAiApiCallsAllowed === false &&
      evidenceQuery.rawFullFileDumpsAllowed === false,
    appRefusalPostureVerified:
      refusalPosture.failClosed &&
      refusalPosture.requiredFailClosedReasons.length ===
        APP_REFUSAL_REASONS.length,
    appSourceCoverageFetchVerified:
      sourceCoverageFetch.returnsFreshnessPosture &&
      sourceCoverageFetch.returnsUnsupportedMissingStalePosture,
    dataExfiltrationRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("data_exfiltration"),
    evidenceFreshnessLimitationsPermittedActionCitationFieldsVerified:
      readOnlyAppPlan.responseRequiredFields.includes("evidence") &&
      readOnlyAppPlan.responseRequiredFields.includes("freshness") &&
      readOnlyAppPlan.responseRequiredFields.includes("limitations") &&
      readOnlyAppPlan.responseRequiredFields.includes("permittedNextActions") &&
      readOnlyAppPlan.responseRequiredFields.includes("citations"),
    forbiddenToolCandidates: [...APP_FORBIDDEN_TOOL_PROOF_CANDIDATES],
    fp0087DocsOnlyBoundaryVerified:
      input.fp0087DocsOnlyBoundaryVerified ?? true,
    fp0088Absent: input.fp0088Absent ?? true,
    localProofOnly: noRuntimeBoundary.localProofOnly,
    mcpForbiddenToolsVerified:
      forbiddenCandidatesRejected && noForbiddenCandidateInAllowlist,
    mcpToolAllowlistExactVerified:
      allowlistExact &&
      MCP_TOOL_ALLOWLIST.every((toolName) => isMcpToolAllowed(toolName)),
    missingCitationRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("missing_citation"),
    noAppSubmission: noRuntimeBoundary.noAppSubmission,
    noAppsSdkUi: noRuntimeBoundary.noAppsSdkUi,
    noApproval: noRuntimeBoundary.noApproval,
    noAuditOpinion: noRuntimeBoundary.noAuditOpinion,
    noAutonomousAction: noRuntimeBoundary.noAutonomousAction,
    noCertification: noRuntimeBoundary.noCertification,
    noCustomerContact: noRuntimeBoundary.noCustomerContact,
    noDelivery: noRuntimeBoundary.noDelivery,
    noDeployment: noRuntimeBoundary.noDeployment,
    noEndpointsAdded: noRuntimeBoundary.noEndpointsAdded,
    noEvalDatasetsAdded: noRuntimeBoundary.noEvalDatasetsAdded,
    noExternalCommunications: noRuntimeBoundary.noExternalCommunications,
    noFinanceWrite: noRuntimeBoundary.noFinanceWrite,
    noFixturesAdded: noRuntimeBoundary.noFixturesAdded,
    noGeneratedAdvice: noRuntimeBoundary.noGeneratedAdvice,
    noGeneratedProductProse: noRuntimeBoundary.noGeneratedProductProse,
    noHostedTools: noRuntimeBoundary.noHostedTools,
    noLegalAdvice: noRuntimeBoundary.noLegalAdvice,
    noMcpServerRuntime: noRuntimeBoundary.noMcpServerRuntime,
    noModelCalls: noRuntimeBoundary.noModelCalls,
    noOauth: noRuntimeBoundary.noOauth,
    noOcr: noRuntimeBoundary.noOcr,
    noOpenAiApiCalls: noRuntimeBoundary.noOpenAiApiCalls,
    noPackageScriptsAdded: noRuntimeBoundary.noPackageScriptsAdded,
    noPageIndex: noRuntimeBoundary.noPageIndex,
    noPaymentInstruction: noRuntimeBoundary.noPaymentInstruction,
    noProductRuntime: noRuntimeBoundary.noProductRuntime,
    noProviderCalls: noRuntimeBoundary.noProviderCalls,
    noPublicChatGptApp: noRuntimeBoundary.noPublicChatGptApp,
    noPublicDemoDataAdded: noRuntimeBoundary.noPublicDemoDataAdded,
    noPublicSourcePacksAdded: noRuntimeBoundary.noPublicSourcePacksAdded,
    noRemoteMcpDeployment: noRuntimeBoundary.noRemoteMcpDeployment,
    noReportCirculation: noRuntimeBoundary.noReportCirculation,
    noReportRelease: noRuntimeBoundary.noReportRelease,
    noRoutesAdded: noRuntimeBoundary.noRoutesAdded,
    noRuntimeBoundaryVerified:
      noRuntimeBoundary.noProductRuntime &&
      noRuntimeBoundary.noMcpServerRuntime,
    noRuntimeCodex: noRuntimeBoundary.noRuntimeCodex,
    noSampleDataAdded: noRuntimeBoundary.noSampleDataAdded,
    noSchemaMigrationsAdded: noRuntimeBoundary.noSchemaMigrationsAdded,
    noSmokeAliasesAdded: noRuntimeBoundary.noSmokeAliasesAdded,
    noSourceMutation: noRuntimeBoundary.noSourceMutation,
    noSourcePackMutation: noRuntimeBoundary.noSourcePackMutation,
    noTaxFiling: noRuntimeBoundary.noTaxFiling,
    noUiAdded: noRuntimeBoundary.noUiAdded,
    noVectorFileSearch: noRuntimeBoundary.noVectorFileSearch,
    noRealFinanceDataPostureVerified:
      safeDemoDataPolicy.forbidsRealCompanyData &&
      BaseAppPrivacyBoundary.noRealFinanceDataInPublicDemo,
    oauthDeferredBoundaryVerified:
      oauthBoundary.oauthDeferred && !oauthBoundary.oauthImplemented,
    privacyBoundaryVerified:
      BaseAppPrivacyBoundary.noRawFullFileDumps &&
      BaseAppPrivacyBoundary.noCopiedOrLightlyAnonymizedRealFinanceData,
    promptInjectionBoundaryVerified:
      BaseAppPromptInjectionBoundary.sourceTextTrust === "untrusted_data" &&
      BaseAppPromptInjectionBoundary.toolOutputCanBypassBoundaries === false,
    proofPlanVerified:
      proofPlan.machineReadableJson && proofPlan.inMemorySyntheticExamplesOnly,
    providerCertificationDeferredBoundaryVerified:
      providerBoundary.providerIntegrationDeferred &&
      providerBoundary.certificationDeferred &&
      providerBoundary.paymentDeferred,
    rawFullFileDumpRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes(
        "raw_full_file_dump_request",
      ),
    readOnlyChatGptAppPlanVerified:
      readOnlyAppPlan.contractOnly &&
      !readOnlyAppPlan.publicChatGptAppImplemented,
    readOnlyMcpServerPlanVerified:
      mcpPlan.contractOnly && !mcpPlan.serverImplemented,
    refusalReasons: [...APP_REFUSAL_REASONS],
    safeDemoDataPolicyInheritedVerified:
      safeDemoDataPolicy.firstGate &&
      safeDemoDataPolicy.forbidsLightlyAnonymizedRealFinanceData,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    staleEvidenceRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("stale_evidence"),
    submissionDeferredBoundaryVerified:
      submissionBoundary.appSubmissionDeferred &&
      !submissionBoundary.appSubmissionStarted,
    threatModelQuestionCount: threatQuestions.questions.length,
    threatModelQuestionsVerified:
      threatQuestions.contractOnlyQuestionList &&
      !threatQuestions.implementationStarted,
    unsafeActionRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("unsafe_action"),
    unsupportedEvidenceRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("unsupported_evidence"),
  });
}

function freshness() {
  const checkedAt = "2026-05-09T00:00:00.000Z";
  return {
    checkedAt,
    compiledAt: checkedAt,
    extractedAt: checkedAt,
    sourceCapturedAt: checkedAt,
    state: "fresh" as const,
    summary: "Fresh synthetic V2G contract posture.",
  };
}

function limitation() {
  return {
    affectedAnchorIds: [],
    affectedSourceIds: [],
    code: "not_source_truth" as const,
    severity: "blocking" as const,
    summary: "V2G app/MCP contracts are future wrappers, not source truth.",
  };
}

function humanReviewAction() {
  return {
    action: "request_human_review" as const,
    label: "Review V2G read-only app/MCP contract posture.",
    targetId: "v2g-read-only-app-mcp",
  };
}
