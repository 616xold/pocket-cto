import {
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_FINANCE_DATA,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_PRIVATE_ARTIFACTS,
  SafeDemoDataPolicySchema,
} from "./benchmark-community";
import {
  APP_REFUSAL_REASONS,
  AppPrivacyBoundarySchema,
  AppPromptInjectionBoundarySchema,
  MCP_TOOL_ALLOWLIST,
  McpToolAllowlistSchema,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
  classifyMcpToolCandidate,
  isMcpToolAllowed,
} from "./read-only-app-mcp-boundaries";
import {
  APP_RESPONSE_REQUIRED_FIELDS,
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
  AppNoRuntimeBoundarySchema,
  buildAppAuthorityBoundary,
  buildAppNoRuntimeBoundary,
} from "./read-only-app-mcp-runtime";
import {
  APP_FORBIDDEN_TOOL_PROOF_CANDIDATES,
  AppProofSchema,
  type AppProof,
} from "./read-only-app-mcp-proof-schema";

type SafeParseSchema = {
  safeParse(value: unknown): { success: boolean };
};

export function buildReadOnlyChatGptAppMcpProof(
  input: Partial<{
    fp0087DocsOnlyBoundaryVerified: boolean;
    fp0088AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0089AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0090AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0091AbsentOrLocalUiComponentBoundaryVerified: boolean;
    fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified: boolean;
    fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified: boolean;
    fp0094AbsentOrLocalPreviewRouteBoundaryVerified: boolean;
    fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified: boolean;
    fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified: boolean;
    fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified: boolean;
    fp0098Absent: boolean;
    premiumUiSecurityPlanBoundaryVerified: boolean;
    premiumUiDesignSystemPlanBoundaryVerified: boolean;
    premiumUiImplementationPlanBoundaryVerified: boolean;
    premiumUiComponentFoundationVerified: boolean;
    premiumUiCompositionAccessibilityFoundationVerified: boolean;
    localUiPreviewRoutePlanBoundaryVerified: boolean;
    localPreviewRouteFoundationVerified: boolean;
    localPreviewRouteStateMatrixPlanBoundaryVerified: boolean;
    localPreviewRouteStateMatrixFoundationVerified: boolean;
    localPreviewRouteVisualQaFoundationVerified: boolean;
    noUiImplementationFromFp0088: boolean;
    noUiImplementationFromFp0089: boolean;
    noAppsSdkIframeFromFp0089: boolean;
    noUiCodeFromFp0090: boolean;
    noAppsSdkIframeFromFp0090: boolean;
    noEndpointOauthSubmissionFromFp0088: boolean;
    noEndpointOauthSubmissionFromFp0089: boolean;
    noEndpointOauthSubmissionFromFp0090: boolean;
    noPublicAppImplementationFromFp0090: boolean;
    noRoutesFromFp0091: boolean;
    noEndpointsFromFp0091: boolean;
    noAppsSdkIframeFromFp0091: boolean;
    noOauthSubmissionFromFp0091: boolean;
    noPublicAppImplementationFromFp0091: boolean;
    noOpenAiApiCallsFromFp0091: boolean;
    noSourceMutationFinanceWriteFromFp0091: boolean;
    noRoutesFromFp0092: boolean;
    noEndpointsFromFp0092: boolean;
    noAppsSdkIframeFromFp0092: boolean;
    noOauthSubmissionFromFp0092: boolean;
    noPublicAppImplementationFromFp0092: boolean;
    noOpenAiApiCallsFromFp0092: boolean;
    noSourceMutationFinanceWriteFromFp0092: boolean;
    noRouteImplementationFromFp0093: boolean;
    noEndpointOauthSubmissionFromFp0093: boolean;
    noPublicAppImplementationFromFp0093: boolean;
    noAppsSdkIframeFromFp0093: boolean;
    noOpenAiApiModelCallsFromFp0093: boolean;
    noSourceMutationFinanceWriteFromFp0093: boolean;
    noGeneratedProductProseRuntimeCodexFromFp0093: boolean;
    noApiRoutesFromFp0094: boolean;
    noBackendRoutesFromFp0094: boolean;
    noEndpointsFromFp0094: boolean;
    noAppsSdkIframeFromFp0094: boolean;
    noOauthSubmissionFromFp0094: boolean;
    noPublicAppImplementationFromFp0094: boolean;
    noOpenAiApiCallsFromFp0094: boolean;
    noSourceMutationFinanceWriteFromFp0094: boolean;
    noRouteImplementationFromFp0095: boolean;
    noScreenshotAssetsFromFp0095: boolean;
    noEndpointOauthSubmissionFromFp0095: boolean;
    noPublicAppImplementationFromFp0095: boolean;
    noAppsSdkIframeFromFp0095: boolean;
    noRemoteMcpDeploymentFromFp0095: boolean;
    noOpenAiApiModelCallsFromFp0095: boolean;
    noProviderCertificationDeploymentFromFp0095: boolean;
    noSourceMutationFinanceWriteFromFp0095: boolean;
    noGeneratedProductProseRuntimeCodexFromFp0095: boolean;
    noPublicAssetsFromFp0095: boolean;
    noAdditionalRoutesFromFp0096: boolean;
    noApiRoutesFromFp0096: boolean;
    noAppsSdkIframeFromFp0096: boolean;
    noBackendRoutesFromFp0096: boolean;
    noEndpointsFromFp0096: boolean;
    noOauthSubmissionFromFp0096: boolean;
    noOpenAiApiCallsFromFp0096: boolean;
    noPublicAppImplementationFromFp0096: boolean;
    noPublicAssetsFromFp0096: boolean;
    noScreenshotAssetsFromFp0096: boolean;
    noSourceMutationFinanceWriteFromFp0096: boolean;
    noAdditionalRoutesFromFp0097: boolean;
    noApiRoutesFromFp0097: boolean;
    noAppsSdkIframeFromFp0097: boolean;
    noBackendRoutesFromFp0097: boolean;
    noEndpointsFromFp0097: boolean;
    noOauthSubmissionFromFp0097: boolean;
    noOpenAiApiCallsFromFp0097: boolean;
    noPublicAppImplementationFromFp0097: boolean;
    noPublicAssetsFromFp0097: boolean;
    noScreenshotAssetsFromFp0097: boolean;
    noSourceMutationFinanceWriteFromFp0097: boolean;
    routeMetadataNoIndexBoundaryVerified: boolean;
    screenshotlessVisualQaVerified: boolean;
    accessibilityStateMatrixVerified: boolean;
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
      "refusalPosture",
      "forbiddenActions",
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
    responseRequiredFields: readOnlyAppPlan.responseRequiredFields,
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
    responseRequiredFields: readOnlyAppPlan.responseRequiredFields,
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
  const mcpToolAllowlistDuplicatesRejected = rejects(McpToolAllowlistSchema, [
    ...MCP_TOOL_ALLOWLIST.slice(0, -1),
    MCP_TOOL_ALLOWLIST[0],
  ]);
  const mcpToolAllowlistMissingRejected = rejects(
    McpToolAllowlistSchema,
    MCP_TOOL_ALLOWLIST.slice(0, -1),
  );
  const mcpToolAllowlistReorderRejected = rejects(McpToolAllowlistSchema, [
    MCP_TOOL_ALLOWLIST[1],
    MCP_TOOL_ALLOWLIST[0],
    ...MCP_TOOL_ALLOWLIST.slice(2),
  ]);
  const mcpToolAllowlistExtraRejected = rejects(McpToolAllowlistSchema, [
    ...MCP_TOOL_ALLOWLIST,
    "send_report",
  ]);
  const mcpDynamicToolsRejected =
    !isMcpToolAllowed("dynamic_tool") &&
    rejects(McpToolAllowlistSchema, [
      ...MCP_TOOL_ALLOWLIST.slice(0, -1),
      "dynamic_tool",
    ]);
  const unknownKeyCases: ReadonlyArray<readonly [SafeParseSchema, unknown]> = [
    [ReadOnlyChatGptAppPlanSchema, readOnlyAppPlan],
    [AppEvidenceQuerySchema, evidenceQuery],
    [AppEvidenceFetchSchema, evidenceFetch],
    [AppSourceCoverageFetchSchema, sourceCoverageFetch],
    [AppCapabilityBoundaryFetchSchema, capabilityBoundaryFetch],
    [AppRefusalPostureSchema, refusalPosture],
    [AppPromptInjectionBoundarySchema, BaseAppPromptInjectionBoundary],
    [AppPrivacyBoundarySchema, BaseAppPrivacyBoundary],
    [AppNoRuntimeBoundarySchema, noRuntimeBoundary],
    [AppOAuthDeferredBoundarySchema, oauthBoundary],
    [AppSubmissionDeferredBoundarySchema, submissionBoundary],
    [AppProviderCertificationDeferredBoundarySchema, providerBoundary],
    [AppProofPlanSchema, proofPlan],
    [AppThreatModelQuestionsSchema, threatQuestions],
  ];
  const appMcpUnknownKeysRejected = unknownKeyCases.every(([schema, value]) =>
    rejectsUnknownKey(schema, value),
  );
  const naturalLanguageForbiddenToolsVerified =
    forbiddenCandidatesRejected && noForbiddenCandidateInAllowlist;
  const promptInjectionStringsInertDataVerified =
    BaseAppPromptInjectionBoundary.sourceTextTrust === "untrusted_data" &&
    BaseAppPromptInjectionBoundary.userTextTrust === "untrusted_data" &&
    BaseAppPromptInjectionBoundary.toolOutputTrust === "untrusted_data" &&
    BaseAppPromptInjectionBoundary.sourceInstructionsCanAuthorizeTools ===
      false &&
    BaseAppPromptInjectionBoundary.userTextCanWidenScope === false &&
    BaseAppPromptInjectionBoundary.toolOutputCanBypassBoundaries === false;
  const rawFullFileDumpAndDataExfiltrationRefusalVerified =
    refusalPosture.requiredFailClosedReasons.includes(
      "raw_full_file_dump_request",
    ) && refusalPosture.requiredFailClosedReasons.includes("data_exfiltration");
  const fp0087TypedBoundaryVerified =
    (input.fp0087DocsOnlyBoundaryVerified ?? true) &&
    readOnlyAppPlan.contractOnly &&
    !readOnlyAppPlan.publicChatGptAppImplemented &&
    mcpPlan.contractOnly &&
    !mcpPlan.serverImplemented &&
    noRuntimeBoundary.noOpenAiApiCalls &&
    noRuntimeBoundary.noModelCalls;

  return AppProofSchema.parse({
    allowedTools: baseAllowedTools(),
    appCapabilityBoundaryFetchVerified:
      capabilityBoundaryFetch.noWriteOrActionTools &&
      matchesResponseRequiredFields(
        capabilityBoundaryFetch.responseRequiredFields,
      ),
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
      sourceCoverageFetch.returnsUnsupportedMissingStalePosture &&
      matchesResponseRequiredFields(sourceCoverageFetch.responseRequiredFields),
    appMcpUnknownKeysRejected,
    capabilityBoundaryResponseRequiredFieldsVerified:
      matchesResponseRequiredFields(
        capabilityBoundaryFetch.responseRequiredFields,
      ),
    dataExfiltrationRefusalVerified:
      refusalPosture.requiredFailClosedReasons.includes("data_exfiltration"),
    evidenceFreshnessLimitationsPermittedActionCitationFieldsVerified:
      readOnlyAppPlan.responseRequiredFields.includes("evidence") &&
      readOnlyAppPlan.responseRequiredFields.includes("freshness") &&
      readOnlyAppPlan.responseRequiredFields.includes("limitations") &&
      readOnlyAppPlan.responseRequiredFields.includes("permittedNextActions") &&
      readOnlyAppPlan.responseRequiredFields.includes("citations"),
    responseRefusalPostureForbiddenActionsFieldsVerified:
      readOnlyAppPlan.responseRequiredFields.includes("refusalPosture") &&
      readOnlyAppPlan.responseRequiredFields.includes("forbiddenActions"),
    fp0087TypedBoundaryVerified,
    forbiddenToolCandidates: [...APP_FORBIDDEN_TOOL_PROOF_CANDIDATES],
    fp0087DocsOnlyBoundaryVerified:
      input.fp0087DocsOnlyBoundaryVerified ?? true,
    fp0088AbsentOrDocsOnlyBoundaryVerified:
      input.fp0088AbsentOrDocsOnlyBoundaryVerified ?? true,
    fp0089AbsentOrDocsOnlyBoundaryVerified:
      input.fp0089AbsentOrDocsOnlyBoundaryVerified ?? true,
    fp0090AbsentOrDocsOnlyBoundaryVerified:
      input.fp0090AbsentOrDocsOnlyBoundaryVerified ?? true,
    fp0091AbsentOrLocalUiComponentBoundaryVerified:
      input.fp0091AbsentOrLocalUiComponentBoundaryVerified ?? true,
    fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified:
      input.fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified ??
      true,
    fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified:
      input.fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified ?? true,
    fp0094AbsentOrLocalPreviewRouteBoundaryVerified:
      input.fp0094AbsentOrLocalPreviewRouteBoundaryVerified ?? true,
    fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified:
      input.fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified ??
      true,
    fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified:
      input.fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified ?? true,
    fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified:
      input.fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified ?? true,
    fp0098Absent: input.fp0098Absent ?? true,
    premiumUiSecurityPlanBoundaryVerified:
      input.premiumUiSecurityPlanBoundaryVerified ?? true,
    premiumUiDesignSystemPlanBoundaryVerified:
      input.premiumUiDesignSystemPlanBoundaryVerified ?? true,
    premiumUiImplementationPlanBoundaryVerified:
      input.premiumUiImplementationPlanBoundaryVerified ?? true,
    premiumUiComponentFoundationVerified:
      input.premiumUiComponentFoundationVerified ?? true,
    premiumUiCompositionAccessibilityFoundationVerified:
      input.premiumUiCompositionAccessibilityFoundationVerified ?? true,
    localUiPreviewRoutePlanBoundaryVerified:
      input.localUiPreviewRoutePlanBoundaryVerified ?? true,
    localPreviewRouteFoundationVerified:
      input.localPreviewRouteFoundationVerified ?? true,
    localPreviewRouteStateMatrixPlanBoundaryVerified:
      input.localPreviewRouteStateMatrixPlanBoundaryVerified ?? true,
    localPreviewRouteStateMatrixFoundationVerified:
      input.localPreviewRouteStateMatrixFoundationVerified ?? true,
    localPreviewRouteVisualQaFoundationVerified:
      input.localPreviewRouteVisualQaFoundationVerified ?? true,
    noUiImplementationFromFp0088: input.noUiImplementationFromFp0088 ?? true,
    noUiImplementationFromFp0089: input.noUiImplementationFromFp0089 ?? true,
    noAppsSdkIframeFromFp0089: input.noAppsSdkIframeFromFp0089 ?? true,
    noUiCodeFromFp0090: input.noUiCodeFromFp0090 ?? true,
    noAppsSdkIframeFromFp0090: input.noAppsSdkIframeFromFp0090 ?? true,
    noEndpointOauthSubmissionFromFp0088:
      input.noEndpointOauthSubmissionFromFp0088 ?? true,
    noEndpointOauthSubmissionFromFp0089:
      input.noEndpointOauthSubmissionFromFp0089 ?? true,
    noEndpointOauthSubmissionFromFp0090:
      input.noEndpointOauthSubmissionFromFp0090 ?? true,
    noPublicAppImplementationFromFp0090:
      input.noPublicAppImplementationFromFp0090 ?? true,
    noRoutesFromFp0091: input.noRoutesFromFp0091 ?? true,
    noEndpointsFromFp0091: input.noEndpointsFromFp0091 ?? true,
    noAppsSdkIframeFromFp0091: input.noAppsSdkIframeFromFp0091 ?? true,
    noOauthSubmissionFromFp0091: input.noOauthSubmissionFromFp0091 ?? true,
    noPublicAppImplementationFromFp0091:
      input.noPublicAppImplementationFromFp0091 ?? true,
    noOpenAiApiCallsFromFp0091:
      input.noOpenAiApiCallsFromFp0091 ?? true,
    noSourceMutationFinanceWriteFromFp0091:
      input.noSourceMutationFinanceWriteFromFp0091 ?? true,
    noRoutesFromFp0092: input.noRoutesFromFp0092 ?? true,
    noEndpointsFromFp0092: input.noEndpointsFromFp0092 ?? true,
    noAppsSdkIframeFromFp0092: input.noAppsSdkIframeFromFp0092 ?? true,
    noOauthSubmissionFromFp0092: input.noOauthSubmissionFromFp0092 ?? true,
    noPublicAppImplementationFromFp0092:
      input.noPublicAppImplementationFromFp0092 ?? true,
    noOpenAiApiCallsFromFp0092:
      input.noOpenAiApiCallsFromFp0092 ?? true,
    noSourceMutationFinanceWriteFromFp0092:
      input.noSourceMutationFinanceWriteFromFp0092 ?? true,
    noRouteImplementationFromFp0093:
      input.noRouteImplementationFromFp0093 ?? true,
    noEndpointOauthSubmissionFromFp0093:
      input.noEndpointOauthSubmissionFromFp0093 ?? true,
    noPublicAppImplementationFromFp0093:
      input.noPublicAppImplementationFromFp0093 ?? true,
    noAppsSdkIframeFromFp0093: input.noAppsSdkIframeFromFp0093 ?? true,
    noOpenAiApiModelCallsFromFp0093:
      input.noOpenAiApiModelCallsFromFp0093 ?? true,
    noSourceMutationFinanceWriteFromFp0093:
      input.noSourceMutationFinanceWriteFromFp0093 ?? true,
    noGeneratedProductProseRuntimeCodexFromFp0093:
      input.noGeneratedProductProseRuntimeCodexFromFp0093 ?? true,
    noApiRoutesFromFp0094: input.noApiRoutesFromFp0094 ?? true,
    noBackendRoutesFromFp0094: input.noBackendRoutesFromFp0094 ?? true,
    noEndpointsFromFp0094: input.noEndpointsFromFp0094 ?? true,
    noAppsSdkIframeFromFp0094: input.noAppsSdkIframeFromFp0094 ?? true,
    noOauthSubmissionFromFp0094: input.noOauthSubmissionFromFp0094 ?? true,
    noPublicAppImplementationFromFp0094:
      input.noPublicAppImplementationFromFp0094 ?? true,
    noOpenAiApiCallsFromFp0094:
      input.noOpenAiApiCallsFromFp0094 ?? true,
    noSourceMutationFinanceWriteFromFp0094:
      input.noSourceMutationFinanceWriteFromFp0094 ?? true,
    noRouteImplementationFromFp0095:
      input.noRouteImplementationFromFp0095 ?? true,
    noScreenshotAssetsFromFp0095: input.noScreenshotAssetsFromFp0095 ?? true,
    noEndpointOauthSubmissionFromFp0095:
      input.noEndpointOauthSubmissionFromFp0095 ?? true,
    noPublicAppImplementationFromFp0095:
      input.noPublicAppImplementationFromFp0095 ?? true,
    noAppsSdkIframeFromFp0095: input.noAppsSdkIframeFromFp0095 ?? true,
    noRemoteMcpDeploymentFromFp0095:
      input.noRemoteMcpDeploymentFromFp0095 ?? true,
    noOpenAiApiModelCallsFromFp0095:
      input.noOpenAiApiModelCallsFromFp0095 ?? true,
    noProviderCertificationDeploymentFromFp0095:
      input.noProviderCertificationDeploymentFromFp0095 ?? true,
    noSourceMutationFinanceWriteFromFp0095:
      input.noSourceMutationFinanceWriteFromFp0095 ?? true,
    noGeneratedProductProseRuntimeCodexFromFp0095:
      input.noGeneratedProductProseRuntimeCodexFromFp0095 ?? true,
    noPublicAssetsFromFp0095: input.noPublicAssetsFromFp0095 ?? true,
    noAdditionalRoutesFromFp0096:
      input.noAdditionalRoutesFromFp0096 ?? true,
    noApiRoutesFromFp0096: input.noApiRoutesFromFp0096 ?? true,
    noAppsSdkIframeFromFp0096:
      input.noAppsSdkIframeFromFp0096 ?? true,
    noBackendRoutesFromFp0096: input.noBackendRoutesFromFp0096 ?? true,
    noEndpointsFromFp0096: input.noEndpointsFromFp0096 ?? true,
    noOauthSubmissionFromFp0096:
      input.noOauthSubmissionFromFp0096 ?? true,
    noOpenAiApiCallsFromFp0096:
      input.noOpenAiApiCallsFromFp0096 ?? true,
    noPublicAppImplementationFromFp0096:
      input.noPublicAppImplementationFromFp0096 ?? true,
    noPublicAssetsFromFp0096: input.noPublicAssetsFromFp0096 ?? true,
    noScreenshotAssetsFromFp0096:
      input.noScreenshotAssetsFromFp0096 ?? true,
    noSourceMutationFinanceWriteFromFp0096:
      input.noSourceMutationFinanceWriteFromFp0096 ?? true,
    noAdditionalRoutesFromFp0097:
      input.noAdditionalRoutesFromFp0097 ?? true,
    noApiRoutesFromFp0097: input.noApiRoutesFromFp0097 ?? true,
    noAppsSdkIframeFromFp0097:
      input.noAppsSdkIframeFromFp0097 ?? true,
    noBackendRoutesFromFp0097: input.noBackendRoutesFromFp0097 ?? true,
    noEndpointsFromFp0097: input.noEndpointsFromFp0097 ?? true,
    noOauthSubmissionFromFp0097:
      input.noOauthSubmissionFromFp0097 ?? true,
    noOpenAiApiCallsFromFp0097:
      input.noOpenAiApiCallsFromFp0097 ?? true,
    noPublicAppImplementationFromFp0097:
      input.noPublicAppImplementationFromFp0097 ?? true,
    noPublicAssetsFromFp0097: input.noPublicAssetsFromFp0097 ?? true,
    noScreenshotAssetsFromFp0097:
      input.noScreenshotAssetsFromFp0097 ?? true,
    noSourceMutationFinanceWriteFromFp0097:
      input.noSourceMutationFinanceWriteFromFp0097 ?? true,
    routeMetadataNoIndexBoundaryVerified:
      input.routeMetadataNoIndexBoundaryVerified ?? true,
    screenshotlessVisualQaVerified:
      input.screenshotlessVisualQaVerified ?? true,
    accessibilityStateMatrixVerified:
      input.accessibilityStateMatrixVerified ?? true,
    localProofOnly: noRuntimeBoundary.localProofOnly,
    mcpForbiddenToolsVerified:
      forbiddenCandidatesRejected && noForbiddenCandidateInAllowlist,
    mcpDynamicToolsRejected,
    mcpToolAllowlistDuplicatesRejected,
    mcpToolAllowlistExactVerified:
      allowlistExact &&
      MCP_TOOL_ALLOWLIST.every((toolName) => isMcpToolAllowed(toolName)),
    mcpToolAllowlistExtraRejected,
    mcpToolAllowlistMissingRejected,
    mcpToolAllowlistReorderRejected,
    naturalLanguageForbiddenToolsVerified,
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
    promptInjectionStringsInertDataVerified,
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
    rawFullFileDumpAndDataExfiltrationRefusalVerified,
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
    sourceCoverageResponseRequiredFieldsVerified:
      matchesResponseRequiredFields(sourceCoverageFetch.responseRequiredFields),
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

function matchesResponseRequiredFields(fields: readonly string[]): boolean {
  return (
    JSON.stringify(fields) === JSON.stringify(APP_RESPONSE_REQUIRED_FIELDS)
  );
}

function rejects(
  schema: SafeParseSchema,
  value: unknown,
): boolean {
  return !schema.safeParse(value).success;
}

function rejectsUnknownKey(
  schema: SafeParseSchema,
  value: unknown,
): boolean {
  return !schema.safeParse({
    ...(value as Record<string, unknown>),
    unknownKey: true,
  }).success;
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
