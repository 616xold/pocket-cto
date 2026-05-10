import type { z } from "zod";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
} from "./read-only-app-mcp-boundaries";
import type { PublicAppSecurityContractKindSchema } from "./read-only-app-mcp-public-security-contracts";
import {
  PUBLIC_APP_AUDIT_LOGGING_QUESTIONS,
  PUBLIC_APP_CONSENT_RBAC_QUESTIONS,
  PUBLIC_APP_SECURITY_SCHEMA_VERSION,
  PublicAppAppsSdkResourceDeferredBoundarySchema,
  PublicAppAuditLoggingQuestionsSchema,
  PublicAppConsentAndRbacQuestionsSchema,
  PublicAppDataExfiltrationBoundarySchema,
  PublicAppEndpointDeferredBoundarySchema,
  PublicAppMcpDescriptorDriftBoundarySchema,
  PublicAppOAuthDeferredBoundarySchema,
  PublicAppPlatformBoundarySchema,
  PublicAppPrivacyNoRealFinanceDataBoundarySchema,
  PublicAppPromptInjectionBoundarySchema,
  PublicAppPublicVisibilityDeferredBoundarySchema,
  PublicAppRawDumpRefusalBoundarySchema,
  PublicAppRemoteMcpDeferredBoundarySchema,
  PublicAppSecurityThreatModelContractSchema,
  PublicAppSubmissionDeferredBoundarySchema,
  PublicAppToolAllowlistDriftBoundarySchema,
  PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema,
  PublicAppWriteActionImpossibleBoundarySchema,
} from "./read-only-app-mcp-public-security-contracts";

export function buildPublicAppSecurityContracts() {
  return {
    appsSdkResourceDeferredBoundary:
      PublicAppAppsSdkResourceDeferredBoundarySchema.parse(baseDeferred(
        "PublicAppAppsSdkResourceDeferredBoundary",
      )),
    auditLoggingQuestions: PublicAppAuditLoggingQuestionsSchema.parse({
      ...base("PublicAppAuditLoggingQuestions"),
      implementationStarted: false,
      questionListOnly: true,
      questions: [...PUBLIC_APP_AUDIT_LOGGING_QUESTIONS],
    }),
    consentAndRbacQuestions: PublicAppConsentAndRbacQuestionsSchema.parse({
      ...base("PublicAppConsentAndRbacQuestions"),
      implementationStarted: false,
      questionListOnly: true,
      questions: [...PUBLIC_APP_CONSENT_RBAC_QUESTIONS],
    }),
    dataExfiltrationBoundary: PublicAppDataExfiltrationBoundarySchema.parse({
      ...base("PublicAppDataExfiltrationBoundary"),
      broadExportAllowed: false,
      credentialTokenOauthMaterialAllowed: false,
      failClosed: true,
      fullSourceTextAllowed: false,
      objectStoreDatabaseDumpAllowed: false,
      rawPrivateDataExfiltrationAllowed: false,
      requiresBoundedCitedExcerpts: true,
    }),
    endpointDeferredBoundary: PublicAppEndpointDeferredBoundarySchema.parse(
      baseDeferred("PublicAppEndpointDeferredBoundary"),
    ),
    mcpDescriptorDriftBoundary:
      PublicAppMcpDescriptorDriftBoundarySchema.parse({
        ...base("PublicAppMcpDescriptorDriftBoundary"),
        descriptorAllowlistMustMatchToolAllowlist: true,
        descriptorDriftFailsClosed: true,
        descriptorInputOutputMustRemainStrict: true,
        descriptorUse: "local_proof_contract_only",
        liveServerDescriptorAllowed: false,
      }),
    oauthDeferredBoundary: PublicAppOAuthDeferredBoundarySchema.parse(
      baseDeferred("PublicAppOAuthDeferredBoundary"),
    ),
    platformBoundary: PublicAppPlatformBoundarySchema.parse({
      ...base("PublicAppPlatformBoundary"),
      appSubmissionListingPublicAssetsDeferred: true,
      appsSdkResourceImplementationDeferred: true,
      endpointWorkDeferred: true,
      noAppSubmission: true,
      noAppsSdkResourcesAdded: true,
      noEndpointsAdded: true,
      noFinanceWrite: true,
      noListingCopy: true,
      noModelCalls: true,
      noOauth: true,
      noOpenAiApiCalls: true,
      noPublicAssets: true,
      noRemoteMcpDeployment: true,
      noRoutesAdded: true,
      noSourceMutation: true,
      oauthTokenSessionWorkDeferred: true,
      publicAppImplementationDeferred: true,
      remoteMcpDeploymentDeferred: true,
    }),
    privacyNoRealFinanceDataBoundary:
      PublicAppPrivacyNoRealFinanceDataBoundarySchema.parse({
        ...base("PublicAppPrivacyNoRealFinanceDataBoundary"),
        noCopiedOrLightlyAnonymizedRealFinanceData: true,
        noFixturesAdded: true,
        noPublicDemoSourcePacks: true,
        noRealFinanceData: true,
        noSampleDataAdded: true,
        screenshotsOrPublicAssetsAllowed: false,
        sourcePackMutationAllowed: false,
      }),
    promptInjectionBoundary: PublicAppPromptInjectionBoundarySchema.parse({
      ...base("PublicAppPromptInjectionBoundary"),
      appMcpMetadataTrust: "untrusted_data",
      instructionOverrideRefuses: true,
      modelVisibleContextTrust: "untrusted_data",
      promptInjectionDisplayedAsData: true,
      sourceInstructionsCanAuthorizeTools: false,
      sourceTextTrust: "untrusted_data",
      toolOutputCanBypassBoundaries: false,
      toolOutputTrust: "untrusted_data",
      userTextCanWidenScope: false,
      userTextTrust: "untrusted_data",
    }),
    publicVisibilityDeferredBoundary:
      PublicAppPublicVisibilityDeferredBoundarySchema.parse({
        ...base("PublicAppPublicVisibilityDeferredBoundary"),
        appSubmissionArtifactsDeferred: true,
        listingCopyDeferred: true,
        publicAssetsDeferred: true,
        publicDirectoryListingStarted: false,
        publicVisibilityDeferred: true,
        requiresLaterSubmissionPlan: true,
      }),
    rawDumpRefusalBoundary: PublicAppRawDumpRefusalBoundarySchema.parse({
      ...base("PublicAppRawDumpRefusalBoundary"),
      boundedExcerptsOnly: true,
      failClosed: true,
      fullSourceTextOutputAllowed: false,
      rawFullFileDumpsAllowed: false,
      refusesSourcePackDumpRequests: true,
      requiresCitations: true,
    }),
    remoteMcpDeferredBoundary:
      PublicAppRemoteMcpDeferredBoundarySchema.parse(
        baseDeferred("PublicAppRemoteMcpDeferredBoundary"),
      ),
    securityThreatModelContract:
      PublicAppSecurityThreatModelContractSchema.parse({
        ...base("PublicAppSecurityThreatModelContract"),
        dataExfiltrationRequestsFailClosed: true,
        noAutonomousAction: true,
        noGeneratedFinanceAdvice: true,
        promptInjectionTreatedAsUntrustedData: true,
        rawDumpRequestsFailClosed: true,
        unsupportedStaleConflictingEvidenceRefuses: true,
        writeActionsImpossible: true,
      }),
    submissionDeferredBoundary: PublicAppSubmissionDeferredBoundarySchema.parse(
      baseDeferred("PublicAppSubmissionDeferredBoundary"),
    ),
    toolAllowlistDriftBoundary:
      PublicAppToolAllowlistDriftBoundarySchema.parse({
        ...base("PublicAppToolAllowlistDriftBoundary"),
        allowedTools: [...MCP_TOOL_ALLOWLIST],
        allowlistExpansionRequiresFuturePlan: true,
        dynamicToolsAllowed: false,
        renamedWriteToolsRejected: true,
        toolAllowlistDriftFailsClosed: true,
      }),
    unsupportedStaleConflictingEvidenceRefusalBoundary:
      PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema.parse({
        ...base(
          "PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundary",
        ),
        conflictingEvidenceRefuses: true,
        failClosed: true,
        generatedFinanceAdviceAllowed: false,
        requiredRefusalReasons: [
          "unsupported_evidence",
          "stale_evidence",
          "conflicting_evidence",
        ],
        requiresFreshnessLimitations: true,
        staleEvidenceRefuses: true,
        unsupportedEvidenceRefuses: true,
      }),
    writeActionImpossibleBoundary:
      PublicAppWriteActionImpossibleBoundarySchema.parse({
        ...base("PublicAppWriteActionImpossibleBoundary"),
        forbiddenTools: [...MCP_FORBIDDEN_TOOL_NAMES],
        noAutonomousAction: true,
        noFinanceWrite: true,
        noProviderPaymentCustomerContact: true,
        noSourceMutation: true,
        writeModifyToolsAllowed: false,
      }),
  };
}

function base(contractKind: z.infer<typeof PublicAppSecurityContractKindSchema>) {
  return {
    contractKind,
    localProofOnly: true,
    publicAppImplemented: false,
    schemaVersion: PUBLIC_APP_SECURITY_SCHEMA_VERSION,
  };
}

function baseDeferred(
  contractKind: z.infer<typeof PublicAppSecurityContractKindSchema>,
) {
  return {
    ...base(contractKind),
    deferred: true,
    implemented: false,
    requiresLaterFinancePlan: true,
    requiresLaterSecurityReview: true,
  };
}
