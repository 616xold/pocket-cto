import { z } from "zod";
import { MCP_TOOL_ALLOWLIST } from "./read-only-app-mcp-boundaries";
import { buildPublicAppSecurityContracts } from "./read-only-app-mcp-public-security-builders";
import {
  PUBLIC_APP_SECURITY_SCHEMA_VERSION,
  PUBLIC_APP_AUDIT_LOGGING_QUESTIONS,
  PUBLIC_APP_CONSENT_RBAC_QUESTIONS,
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
    localPreviewRouteRemainsLocalNoindexOnly: trueLiteral,
    v2gDescriptorEnvelopeAllowlistReadOnly: trueLiteral,
    fp0100BoundaryVerified: trueLiteral,
    fp0101Absent: trueLiteral,
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
    localPreviewRouteRemainsLocalNoindexOnly: boolean;
    fp0100BoundaryVerified: boolean;
    fp0101Absent: boolean;
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
    fp0101Absent: input.fp0101Absent ?? true,
    localPreviewRouteRemainsLocalNoindexOnly:
      input.localPreviewRouteRemainsLocalNoindexOnly ?? true,
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
      evidenceRefusal.conflictingEvidenceRefuses,
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
