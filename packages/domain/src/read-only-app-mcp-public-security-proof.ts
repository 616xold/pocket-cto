import { z } from "zod";
import { MCP_TOOL_ALLOWLIST } from "./read-only-app-mcp-boundaries";
import { buildPublicAppSecurityContracts } from "./read-only-app-mcp-public-security-builders";
import {
  PUBLIC_APP_SECURITY_SCHEMA_VERSION,
  PUBLIC_APP_AUDIT_LOGGING_QUESTIONS,
  PUBLIC_APP_CONSENT_RBAC_QUESTIONS,
  PUBLIC_APP_REQUIRED_EVIDENCE_REFUSAL_REASONS,
} from "./read-only-app-mcp-public-security-contracts";

const trueLiteral = z.literal(true);

export const PublicAppSecurityProofSchema = z
  .object({
    schemaVersion: z.literal(PUBLIC_APP_SECURITY_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    publicAppSecurityThreatModelContractVerified: trueLiteral,
    platformBoundaryVerified: trueLiteral,
    promptInjectionBoundaryVerified: trueLiteral,
    dataExfiltrationBoundaryVerified: trueLiteral,
    rawDumpRefusalBoundaryVerified: trueLiteral,
    writeActionImpossibleBoundaryVerified: trueLiteral,
    toolAllowlistDriftBoundaryVerified: trueLiteral,
    mcpDescriptorDriftBoundaryVerified: trueLiteral,
    endpointDeferredBoundaryVerified: trueLiteral,
    remoteMcpDeferredBoundaryVerified: trueLiteral,
    oauthDeferredBoundaryVerified: trueLiteral,
    appsSdkResourceDeferredBoundaryVerified: trueLiteral,
    submissionDeferredBoundaryVerified: trueLiteral,
    publicVisibilityDeferredBoundaryVerified: trueLiteral,
    consentAndRbacQuestionsVerified: trueLiteral,
    auditLoggingQuestionsVerified: trueLiteral,
    privacyNoRealFinanceDataBoundaryVerified: trueLiteral,
    unsupportedStaleConflictingEvidenceRefusalBoundaryVerified: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noRoutesAdded: trueLiteral,
    noEndpointsAdded: trueLiteral,
    noAppsSdkResourcesAdded: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noOauth: trueLiteral,
    noAppSubmission: trueLiteral,
    noPublicAssets: trueLiteral,
    noListingCopy: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noAutonomousAction: trueLiteral,
    noWriteModifyTools: trueLiteral,
    publicAppImplementationDeferred: trueLiteral,
    rawDumpAndDataExfiltrationFailClosed: trueLiteral,
    promptInjectionIsUntrustedData: trueLiteral,
    noRealFinanceDataOrPublicDemoSourcePacks: trueLiteral,
    localPreviewRouteExists: trueLiteral,
    routeMetadataNoIndexBoundaryVerified: trueLiteral,
    localPreviewRouteRemainsLocalNoindexOnly: trueLiteral,
    requiredEvidenceRefusalReasonsVerified: trueLiteral,
    publicSecurityNoOpenAiApiSourceScanVerified: trueLiteral,
    v2gDescriptorEnvelopeAllowlistReadOnly: trueLiteral,
    fp0100BoundaryVerified: trueLiteral,
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      trueLiteral,
    fp0102Absent: trueLiteral,
    publicAppImplementationSequencingPlanBoundaryVerified: trueLiteral,
    noEndpointImplementationFromFp0101: trueLiteral,
    noOauthImplementationFromFp0101: trueLiteral,
    noRemoteMcpDeploymentFromFp0101: trueLiteral,
    noAppsSdkResourceFromFp0101: trueLiteral,
    noAppSubmissionFromFp0101: trueLiteral,
    noOpenAiApiCallsFromFp0101: trueLiteral,
    noSourceMutationFinanceWriteFromFp0101: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0101: trueLiteral,
    allowedTools: z.tuple([
      z.literal(MCP_TOOL_ALLOWLIST[0]),
      z.literal(MCP_TOOL_ALLOWLIST[1]),
      z.literal(MCP_TOOL_ALLOWLIST[2]),
      z.literal(MCP_TOOL_ALLOWLIST[3]),
      z.literal(MCP_TOOL_ALLOWLIST[4]),
      z.literal(MCP_TOOL_ALLOWLIST[5]),
      z.literal(MCP_TOOL_ALLOWLIST[6]),
    ]),
    consentAndRbacQuestionCount: z.literal(
      PUBLIC_APP_CONSENT_RBAC_QUESTIONS.length,
    ),
    auditLoggingQuestionCount: z.literal(
      PUBLIC_APP_AUDIT_LOGGING_QUESTIONS.length,
    ),
  })
  .strict();

export function buildPublicAppSecurityProof(
  input: Partial<{
    noRoutesAdded: boolean;
    noEndpointsAdded: boolean;
    noAppsSdkResourcesAdded: boolean;
    noOpenAiApiCalls: boolean;
    noModelCalls: boolean;
    noPublicAssets: boolean;
    noListingCopy: boolean;
    localPreviewRouteExists: boolean;
    routeMetadataNoIndexBoundaryVerified: boolean;
    localPreviewRouteRemainsLocalNoindexOnly: boolean;
    publicSecurityNoOpenAiApiSourceScanVerified: boolean;
    fp0100BoundaryVerified: boolean;
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified: boolean;
    fp0102Absent: boolean;
    publicAppImplementationSequencingPlanBoundaryVerified: boolean;
    noEndpointImplementationFromFp0101: boolean;
    noOauthImplementationFromFp0101: boolean;
    noRemoteMcpDeploymentFromFp0101: boolean;
    noAppsSdkResourceFromFp0101: boolean;
    noAppSubmissionFromFp0101: boolean;
    noOpenAiApiCallsFromFp0101: boolean;
    noSourceMutationFinanceWriteFromFp0101: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0101: boolean;
  }> = {},
) {
  const contracts = buildPublicAppSecurityContracts();
  const platform = contracts.platformBoundary;
  const promptInjection = contracts.promptInjectionBoundary;
  const dataExfiltration = contracts.dataExfiltrationBoundary;
  const rawDump = contracts.rawDumpRefusalBoundary;
  const writeAction = contracts.writeActionImpossibleBoundary;
  const toolAllowlist = contracts.toolAllowlistDriftBoundary;
  const descriptorDrift = contracts.mcpDescriptorDriftBoundary;
  const privacy = contracts.privacyNoRealFinanceDataBoundary;
  const evidenceRefusal =
    contracts.unsupportedStaleConflictingEvidenceRefusalBoundary;
  const localPreviewRouteExists = input.localPreviewRouteExists ?? true;
  const routeMetadataNoIndexBoundaryVerified =
    input.routeMetadataNoIndexBoundaryVerified ?? true;
  const requiredEvidenceRefusalReasonsVerified =
    JSON.stringify(evidenceRefusal.requiredRefusalReasons) ===
    JSON.stringify(PUBLIC_APP_REQUIRED_EVIDENCE_REFUSAL_REASONS);
  const publicSecurityNoOpenAiApiSourceScanVerified =
    input.publicSecurityNoOpenAiApiSourceScanVerified ?? true;

  return PublicAppSecurityProofSchema.parse({
    allowedTools: [...MCP_TOOL_ALLOWLIST],
    appsSdkResourceDeferredBoundaryVerified:
      contracts.appsSdkResourceDeferredBoundary.deferred &&
      !contracts.appsSdkResourceDeferredBoundary.implemented,
    auditLoggingQuestionCount: PUBLIC_APP_AUDIT_LOGGING_QUESTIONS.length,
    auditLoggingQuestionsVerified:
      contracts.auditLoggingQuestions.questionListOnly &&
      !contracts.auditLoggingQuestions.implementationStarted,
    consentAndRbacQuestionCount: PUBLIC_APP_CONSENT_RBAC_QUESTIONS.length,
    consentAndRbacQuestionsVerified:
      contracts.consentAndRbacQuestions.questionListOnly &&
      !contracts.consentAndRbacQuestions.implementationStarted,
    dataExfiltrationBoundaryVerified:
      dataExfiltration.failClosed &&
      !dataExfiltration.rawPrivateDataExfiltrationAllowed,
    endpointDeferredBoundaryVerified:
      contracts.endpointDeferredBoundary.deferred &&
      !contracts.endpointDeferredBoundary.implemented,
    fp0100BoundaryVerified: input.fp0100BoundaryVerified ?? true,
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      input
        .fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified ??
      true,
    fp0102Absent: input.fp0102Absent ?? true,
    publicAppImplementationSequencingPlanBoundaryVerified:
      input.publicAppImplementationSequencingPlanBoundaryVerified ?? true,
    noEndpointImplementationFromFp0101:
      input.noEndpointImplementationFromFp0101 ?? true,
    noOauthImplementationFromFp0101:
      input.noOauthImplementationFromFp0101 ?? true,
    noRemoteMcpDeploymentFromFp0101:
      input.noRemoteMcpDeploymentFromFp0101 ?? true,
    noAppsSdkResourceFromFp0101:
      input.noAppsSdkResourceFromFp0101 ?? true,
    noAppSubmissionFromFp0101: input.noAppSubmissionFromFp0101 ?? true,
    noOpenAiApiCallsFromFp0101:
      input.noOpenAiApiCallsFromFp0101 ?? true,
    noSourceMutationFinanceWriteFromFp0101:
      input.noSourceMutationFinanceWriteFromFp0101 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0101:
      input.noPublicAssetsSubmissionArtifactsFromFp0101 ?? true,
    localPreviewRouteExists,
    routeMetadataNoIndexBoundaryVerified,
    localPreviewRouteRemainsLocalNoindexOnly:
      input.localPreviewRouteRemainsLocalNoindexOnly ??
      (localPreviewRouteExists && routeMetadataNoIndexBoundaryVerified),
    localProofOnly: contracts.securityThreatModelContract.localProofOnly,
    mcpDescriptorDriftBoundaryVerified:
      descriptorDrift.descriptorUse === "local_proof_contract_only" &&
      !descriptorDrift.liveServerDescriptorAllowed,
    noAppSubmission: platform.noAppSubmission,
    noAppsSdkResourcesAdded: input.noAppsSdkResourcesAdded ?? true,
    noAutonomousAction: writeAction.noAutonomousAction,
    noEndpointsAdded: input.noEndpointsAdded ?? true,
    noFinanceWrite: platform.noFinanceWrite,
    noListingCopy: input.noListingCopy ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noOauth: platform.noOauth,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    publicSecurityNoOpenAiApiSourceScanVerified,
    noRealFinanceDataOrPublicDemoSourcePacks:
      privacy.noRealFinanceData && privacy.noPublicDemoSourcePacks,
    noRemoteMcpDeployment: platform.noRemoteMcpDeployment,
    noRoutesAdded: input.noRoutesAdded ?? true,
    noSourceMutation: platform.noSourceMutation,
    noWriteModifyTools: !writeAction.writeModifyToolsAllowed,
    oauthDeferredBoundaryVerified:
      contracts.oauthDeferredBoundary.deferred &&
      !contracts.oauthDeferredBoundary.implemented,
    platformBoundaryVerified:
      platform.endpointWorkDeferred &&
      platform.oauthTokenSessionWorkDeferred &&
      platform.publicAppImplementationDeferred,
    privacyNoRealFinanceDataBoundaryVerified:
      privacy.noRealFinanceData && !privacy.sourcePackMutationAllowed,
    promptInjectionBoundaryVerified:
      promptInjection.sourceTextTrust === "untrusted_data" &&
      !promptInjection.sourceInstructionsCanAuthorizeTools,
    promptInjectionIsUntrustedData:
      promptInjection.userTextTrust === "untrusted_data" &&
      promptInjection.toolOutputTrust === "untrusted_data",
    publicAppImplementationDeferred: platform.publicAppImplementationDeferred,
    publicAppSecurityThreatModelContractVerified:
      contracts.securityThreatModelContract
        .promptInjectionTreatedAsUntrustedData &&
      contracts.securityThreatModelContract.writeActionsImpossible,
    publicVisibilityDeferredBoundaryVerified:
      contracts.publicVisibilityDeferredBoundary.publicVisibilityDeferred &&
      !contracts.publicVisibilityDeferredBoundary.publicDirectoryListingStarted,
    rawDumpAndDataExfiltrationFailClosed:
      dataExfiltration.failClosed && rawDump.failClosed,
    rawDumpRefusalBoundaryVerified:
      rawDump.failClosed && !rawDump.rawFullFileDumpsAllowed,
    requiredEvidenceRefusalReasonsVerified,
    remoteMcpDeferredBoundaryVerified:
      contracts.remoteMcpDeferredBoundary.deferred &&
      !contracts.remoteMcpDeferredBoundary.implemented,
    schemaVersion: PUBLIC_APP_SECURITY_SCHEMA_VERSION,
    submissionDeferredBoundaryVerified:
      contracts.submissionDeferredBoundary.deferred &&
      !contracts.submissionDeferredBoundary.implemented,
    toolAllowlistDriftBoundaryVerified:
      JSON.stringify(toolAllowlist.allowedTools) ===
        JSON.stringify(MCP_TOOL_ALLOWLIST) &&
      !toolAllowlist.dynamicToolsAllowed,
    unsupportedStaleConflictingEvidenceRefusalBoundaryVerified:
      evidenceRefusal.failClosed &&
      evidenceRefusal.unsupportedEvidenceRefuses &&
      evidenceRefusal.staleEvidenceRefuses &&
      evidenceRefusal.conflictingEvidenceRefuses &&
      requiredEvidenceRefusalReasonsVerified,
    v2gDescriptorEnvelopeAllowlistReadOnly:
      descriptorDrift.descriptorAllowlistMustMatchToolAllowlist,
    writeActionImpossibleBoundaryVerified:
      !writeAction.writeModifyToolsAllowed &&
      writeAction.noSourceMutation &&
      writeAction.noFinanceWrite,
  });
}

export type PublicAppSecurityProof = z.infer<
  typeof PublicAppSecurityProofSchema
>;
