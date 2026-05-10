import { z } from "zod";
import {
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_FINANCE_DATA,
  SAFE_DEMO_DATA_POLICY_FORBIDDEN_PRIVATE_ARTIFACTS,
  SafeDemoDataPolicySchema,
} from "./benchmark-community";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
  classifyMcpToolCandidate,
} from "./read-only-app-mcp-boundaries";
import { APP_FORBIDDEN_TOOL_PROOF_CANDIDATES } from "./read-only-app-mcp-proof-schema";
import {
  AppMcpDataExfiltrationEnvelopeSchema,
  AppMcpEvidenceEnvelopeSchema,
  AppMcpMissingCitationEnvelopeSchema,
  AppMcpPromptInjectionEnvelopeSchema,
  AppMcpRawFullFileDumpRefusalEnvelopeSchema,
  AppMcpResponseEnvelopeSchema,
  AppMcpStaleEvidenceEnvelopeSchema,
  AppMcpUnsafeActionEnvelopeSchema,
  AppMcpUnsupportedEvidenceEnvelopeSchema,
  APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS,
  APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  buildAppMcpEvidenceEnvelope,
  buildAppMcpRefusalEnvelope,
  responseEnvelopeRejectsForbiddenFields,
} from "./read-only-app-mcp-envelope";
import {
  McpDescriptorAnnotationsSchema,
  McpDescriptorCapabilityMetadataSchema,
  McpDescriptorInputSchemaContractSchema,
  McpDescriptorOutputSchemaContractSchema,
  buildMcpToolDescriptorContracts,
  descriptorForbiddenFieldsExactVerified,
  descriptorForbiddenToolsExactVerified,
  descriptorInputRejectsForbiddenFields,
  descriptorOutputRequiresEnvelopeFields,
} from "./read-only-app-mcp-descriptor";
import { buildAppNoRuntimeBoundary } from "./read-only-app-mcp-runtime";

const trueLiteral = z.literal(true);

type SafeParseSchema = {
  safeParse(value: unknown): { success: boolean };
};

type McpToolDescriptorContract = ReturnType<
  typeof buildMcpToolDescriptorContracts
>[number];

export const AppMcpDescriptorEnvelopeProofSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    descriptorContractsVerified: trueLiteral,
    descriptorAllowlistExactVerified: trueLiteral,
    descriptorInputSchemasStrictVerified: trueLiteral,
    descriptorOutputSchemasStrictVerified: trueLiteral,
    descriptorReadOnlyAnnotationsVerified: trueLiteral,
    descriptorForbiddenFieldsExactVerified: trueLiteral,
    descriptorForbiddenToolsExactVerified: trueLiteral,
    descriptorRejectsForbiddenActionNames: trueLiteral,
    descriptorNoRuntimeServerVerified: trueLiteral,
    descriptorNoEndpointsVerified: trueLiteral,
    responseEnvelopeVerified: trueLiteral,
    responseEnvelopeRequiredFieldsVerified: trueLiteral,
    responseForbiddenActionsExactVerified: trueLiteral,
    evidenceEnvelopeVerified: trueLiteral,
    refusalEnvelopeVerified: trueLiteral,
    missingCitationEnvelopeVerified: trueLiteral,
    unsupportedEvidenceEnvelopeVerified: trueLiteral,
    staleEvidenceEnvelopeVerified: trueLiteral,
    promptInjectionEnvelopeVerified: trueLiteral,
    dataExfiltrationEnvelopeVerified: trueLiteral,
    rawFullFileDumpRefusalEnvelopeVerified: trueLiteral,
    unsafeActionEnvelopeVerified: trueLiteral,
    rawFullFileDumpFieldsRejected: trueLiteral,
    privateDataFieldsRejected: trueLiteral,
    rawPrivateDataAliasFamilyRejected: trueLiteral,
    forbiddenToolsRejected: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noHostedTools: trueLiteral,
    noVectorFileSearch: trueLiteral,
    noOcr: trueLiteral,
    noPageIndex: trueLiteral,
    noPublicChatGptApp: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noMcpServerRuntime: trueLiteral,
    noAppsSdkUi: trueLiteral,
    noOauth: trueLiteral,
    noAppSubmission: trueLiteral,
    noEndpointsAdded: trueLiteral,
    noRoutesAdded: trueLiteral,
    noUiAdded: trueLiteral,
    noSchemaMigrationsAdded: trueLiteral,
    noPackageScriptsAdded: trueLiteral,
    noSmokeAliasesAdded: trueLiteral,
    noEvalDatasetsAdded: trueLiteral,
    noFixturesAdded: trueLiteral,
    noSampleDataAdded: trueLiteral,
    noPublicDemoDataAdded: trueLiteral,
    noPublicSourcePacksAdded: trueLiteral,
    noSourcePackMutation: trueLiteral,
    noProviderCalls: trueLiteral,
    noCertification: trueLiteral,
    noDelivery: trueLiteral,
    noDeployment: trueLiteral,
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noGeneratedAdvice: trueLiteral,
    noGeneratedProductProse: trueLiteral,
    noRuntimeCodex: trueLiteral,
    noAutonomousAction: trueLiteral,
    safeDemoDataPolicyInheritedVerified: trueLiteral,
    fp0088AbsentOrDocsOnlyBoundaryVerified: trueLiteral,
    fp0089AbsentOrDocsOnlyBoundaryVerified: trueLiteral,
    fp0090AbsentOrDocsOnlyBoundaryVerified: trueLiteral,
    fp0091AbsentOrLocalUiComponentBoundaryVerified: trueLiteral,
    fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified: trueLiteral,
    fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified: trueLiteral,
    fp0094AbsentOrLocalPreviewRouteBoundaryVerified: trueLiteral,
    fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified: trueLiteral,
    fp0096Absent: trueLiteral,
    premiumUiSecurityPlanBoundaryVerified: trueLiteral,
    premiumUiDesignSystemPlanBoundaryVerified: trueLiteral,
    premiumUiImplementationPlanBoundaryVerified: trueLiteral,
    premiumUiComponentFoundationVerified: trueLiteral,
    premiumUiCompositionAccessibilityFoundationVerified: trueLiteral,
    localUiPreviewRoutePlanBoundaryVerified: trueLiteral,
    localPreviewRouteFoundationVerified: trueLiteral,
    localPreviewRouteStateMatrixPlanBoundaryVerified: trueLiteral,
    noUiImplementationFromFp0088: trueLiteral,
    noUiImplementationFromFp0089: trueLiteral,
    noAppsSdkIframeFromFp0089: trueLiteral,
    noUiCodeFromFp0090: trueLiteral,
    noAppsSdkIframeFromFp0090: trueLiteral,
    noEndpointOauthSubmissionFromFp0088: trueLiteral,
    noEndpointOauthSubmissionFromFp0089: trueLiteral,
    noEndpointOauthSubmissionFromFp0090: trueLiteral,
    noPublicAppImplementationFromFp0090: trueLiteral,
    noRoutesFromFp0091: trueLiteral,
    noEndpointsFromFp0091: trueLiteral,
    noAppsSdkIframeFromFp0091: trueLiteral,
    noOauthSubmissionFromFp0091: trueLiteral,
    noPublicAppImplementationFromFp0091: trueLiteral,
    noOpenAiApiCallsFromFp0091: trueLiteral,
    noSourceMutationFinanceWriteFromFp0091: trueLiteral,
    noRoutesFromFp0092: trueLiteral,
    noEndpointsFromFp0092: trueLiteral,
    noAppsSdkIframeFromFp0092: trueLiteral,
    noOauthSubmissionFromFp0092: trueLiteral,
    noPublicAppImplementationFromFp0092: trueLiteral,
    noOpenAiApiCallsFromFp0092: trueLiteral,
    noSourceMutationFinanceWriteFromFp0092: trueLiteral,
    noRouteImplementationFromFp0093: trueLiteral,
    noEndpointOauthSubmissionFromFp0093: trueLiteral,
    noPublicAppImplementationFromFp0093: trueLiteral,
    noAppsSdkIframeFromFp0093: trueLiteral,
    noOpenAiApiModelCallsFromFp0093: trueLiteral,
    noSourceMutationFinanceWriteFromFp0093: trueLiteral,
    noGeneratedProductProseRuntimeCodexFromFp0093: trueLiteral,
    noApiRoutesFromFp0094: trueLiteral,
    noBackendRoutesFromFp0094: trueLiteral,
    noEndpointsFromFp0094: trueLiteral,
    noAppsSdkIframeFromFp0094: trueLiteral,
    noOauthSubmissionFromFp0094: trueLiteral,
    noPublicAppImplementationFromFp0094: trueLiteral,
    noOpenAiApiCallsFromFp0094: trueLiteral,
    noSourceMutationFinanceWriteFromFp0094: trueLiteral,
    noRouteImplementationFromFp0095: trueLiteral,
    noScreenshotAssetsFromFp0095: trueLiteral,
    noEndpointOauthSubmissionFromFp0095: trueLiteral,
    noPublicAppImplementationFromFp0095: trueLiteral,
    noAppsSdkIframeFromFp0095: trueLiteral,
    noRemoteMcpDeploymentFromFp0095: trueLiteral,
    noOpenAiApiModelCallsFromFp0095: trueLiteral,
    noProviderCertificationDeploymentFromFp0095: trueLiteral,
    noSourceMutationFinanceWriteFromFp0095: trueLiteral,
    noGeneratedProductProseRuntimeCodexFromFp0095: trueLiteral,
    noPublicAssetsFromFp0095: trueLiteral,
    descriptorsVerified: z.array(z.string()).length(MCP_TOOL_ALLOWLIST.length),
    responseEnvelopeRequiredFields: z.array(z.string()).min(1),
  })
  .strict();

export function buildAppMcpDescriptorEnvelopeProof(
  input: Partial<{
    fp0088AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0089AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0090AbsentOrDocsOnlyBoundaryVerified: boolean;
    fp0091AbsentOrLocalUiComponentBoundaryVerified: boolean;
    fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified: boolean;
    fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified: boolean;
    fp0094AbsentOrLocalPreviewRouteBoundaryVerified: boolean;
    fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified: boolean;
    fp0096Absent: boolean;
    premiumUiSecurityPlanBoundaryVerified: boolean;
    premiumUiDesignSystemPlanBoundaryVerified: boolean;
    premiumUiImplementationPlanBoundaryVerified: boolean;
    premiumUiComponentFoundationVerified: boolean;
    premiumUiCompositionAccessibilityFoundationVerified: boolean;
    localUiPreviewRoutePlanBoundaryVerified: boolean;
    localPreviewRouteFoundationVerified: boolean;
    localPreviewRouteStateMatrixPlanBoundaryVerified: boolean;
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
    noPackageScriptsAdded: boolean;
    noSmokeAliasesAdded: boolean;
  }> = {},
): AppMcpDescriptorEnvelopeProof {
  const descriptors = buildMcpToolDescriptorContracts();
  const noRuntimeBoundary = buildAppNoRuntimeBoundary({
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noSmokeAliasesAdded: input.noSmokeAliasesAdded ?? true,
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
  const evidenceEnvelope = buildAppMcpEvidenceEnvelope();
  const missingCitation = buildAppMcpRefusalEnvelope("missing_citation");
  const unsupportedEvidence = buildAppMcpRefusalEnvelope(
    "unsupported_evidence",
  );
  const staleEvidence = buildAppMcpRefusalEnvelope("stale_evidence");
  const promptInjection = buildAppMcpRefusalEnvelope("prompt_injection");
  const dataExfiltration = buildAppMcpRefusalEnvelope("data_exfiltration");
  const rawFullFileDump = buildAppMcpRefusalEnvelope(
    "raw_full_file_dump_request",
  );
  const unsafeAction = buildAppMcpRefusalEnvelope("unsafe_action");
  const descriptorNames = descriptors.map((descriptor) => descriptor.toolName);
  const descriptorRejectsRawPrivateAliases = descriptorSurfacesRejectFieldNames(
    descriptors,
    APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  );
  const descriptorRejectsForbiddenActionNames =
    descriptorSurfacesRejectFieldNames(descriptors, MCP_FORBIDDEN_TOOL_NAMES);
  const responseRejectsRawPrivateAliases = responseEnvelopeRejectsFieldNames(
    APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  );
  const responseForbiddenActionsExactVerified =
    responseEnvelopeForbiddenActionsExactVerified(evidenceEnvelope);

  return AppMcpDescriptorEnvelopeProofSchema.parse({
    dataExfiltrationEnvelopeVerified:
      AppMcpDataExfiltrationEnvelopeSchema.safeParse(dataExfiltration).success,
    descriptorAllowlistExactVerified:
      JSON.stringify(descriptorNames) === JSON.stringify(MCP_TOOL_ALLOWLIST),
    descriptorContractsVerified:
      descriptors.length === MCP_TOOL_ALLOWLIST.length,
    descriptorForbiddenFieldsExactVerified: descriptors.every((descriptor) =>
      descriptorForbiddenFieldsExactVerified(descriptor.toolName),
    ),
    descriptorForbiddenToolsExactVerified: descriptors.every((descriptor) =>
      descriptorForbiddenToolsExactVerified(descriptor.toolName),
    ),
    descriptorInputSchemasStrictVerified: descriptors.every(
      (descriptor) =>
        descriptorInputRejectsForbiddenFields(descriptor.toolName) &&
        descriptorForbiddenFieldsExactVerified(descriptor.toolName),
    ),
    descriptorNoEndpointsVerified: descriptors.every(
      (descriptor) => !descriptor.endpointImplemented,
    ),
    descriptorNoRuntimeServerVerified: descriptors.every(
      (descriptor) =>
        !descriptor.serverRuntimeImplemented &&
        !descriptor.usableAsLiveServerDescriptor,
    ),
    descriptorOutputSchemasStrictVerified: descriptors.every((descriptor) =>
      descriptorOutputRequiresEnvelopeFields(descriptor.toolName),
    ),
    descriptorReadOnlyAnnotationsVerified: descriptors.every(
      (descriptor) =>
        descriptor.annotations.readOnlyHint &&
        !descriptor.annotations.destructiveHint &&
        descriptor.capabilityMetadata.readOnly &&
        !descriptor.capabilityMetadata.writesSources &&
        !descriptor.capabilityMetadata.writesFinanceTwin,
    ),
    descriptorRejectsForbiddenActionNames,
    descriptorsVerified: descriptorNames,
    evidenceEnvelopeVerified:
      AppMcpEvidenceEnvelopeSchema.safeParse(evidenceEnvelope).success,
    forbiddenToolsRejected: APP_FORBIDDEN_TOOL_PROOF_CANDIDATES.every(
      (candidate) => classifyMcpToolCandidate(candidate).forbidden,
    ),
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
    fp0096Absent: input.fp0096Absent ?? true,
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
    localProofOnly: noRuntimeBoundary.localProofOnly,
    missingCitationEnvelopeVerified:
      AppMcpMissingCitationEnvelopeSchema.safeParse(missingCitation).success &&
      missingCitation.refusalPosture.failClosed,
    noAppSubmission: noRuntimeBoundary.noAppSubmission,
    noAppsSdkUi: noRuntimeBoundary.noAppsSdkUi,
    noAutonomousAction: noRuntimeBoundary.noAutonomousAction,
    noCertification: noRuntimeBoundary.noCertification,
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
    noMcpServerRuntime: noRuntimeBoundary.noMcpServerRuntime,
    noModelCalls: noRuntimeBoundary.noModelCalls,
    noOauth: noRuntimeBoundary.noOauth,
    noOcr: noRuntimeBoundary.noOcr,
    noOpenAiApiCalls: noRuntimeBoundary.noOpenAiApiCalls,
    noPackageScriptsAdded: noRuntimeBoundary.noPackageScriptsAdded,
    noPageIndex: noRuntimeBoundary.noPageIndex,
    noProviderCalls: noRuntimeBoundary.noProviderCalls,
    noPublicChatGptApp: noRuntimeBoundary.noPublicChatGptApp,
    noPublicDemoDataAdded: noRuntimeBoundary.noPublicDemoDataAdded,
    noPublicSourcePacksAdded: noRuntimeBoundary.noPublicSourcePacksAdded,
    noRemoteMcpDeployment: noRuntimeBoundary.noRemoteMcpDeployment,
    noRoutesAdded: noRuntimeBoundary.noRoutesAdded,
    noRuntimeCodex: noRuntimeBoundary.noRuntimeCodex,
    noSampleDataAdded: noRuntimeBoundary.noSampleDataAdded,
    noSchemaMigrationsAdded: noRuntimeBoundary.noSchemaMigrationsAdded,
    noSmokeAliasesAdded: noRuntimeBoundary.noSmokeAliasesAdded,
    noSourceMutation: noRuntimeBoundary.noSourceMutation,
    noSourcePackMutation: noRuntimeBoundary.noSourcePackMutation,
    noUiAdded: noRuntimeBoundary.noUiAdded,
    noVectorFileSearch: noRuntimeBoundary.noVectorFileSearch,
    privateDataFieldsRejected: responseEnvelopeRejectsForbiddenFields(),
    promptInjectionEnvelopeVerified:
      AppMcpPromptInjectionEnvelopeSchema.safeParse(promptInjection).success &&
      promptInjection.refusalPosture.sourceInstructionsTreatedAsData,
    rawFullFileDumpFieldsRejected: responseEnvelopeRejectsForbiddenFields(),
    rawPrivateDataAliasFamilyRejected:
      descriptorRejectsRawPrivateAliases &&
      responseRejectsRawPrivateAliases &&
      responseEnvelopeRejectsForbiddenFields(),
    rawFullFileDumpRefusalEnvelopeVerified:
      AppMcpRawFullFileDumpRefusalEnvelopeSchema.safeParse(rawFullFileDump)
        .success,
    refusalEnvelopeVerified:
      missingCitation.refusalPosture.refused &&
      missingCitation.refusalPosture.failClosed,
    responseEnvelopeRequiredFields: [
      ...APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS,
    ],
    responseEnvelopeRequiredFieldsVerified:
      APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS.every((field) =>
        Object.prototype.hasOwnProperty.call(evidenceEnvelope, field),
      ),
    responseForbiddenActionsExactVerified,
    responseEnvelopeVerified:
      AppMcpResponseEnvelopeSchema.safeParse(evidenceEnvelope).success &&
      AppMcpResponseEnvelopeSchema.safeParse(missingCitation).success,
    safeDemoDataPolicyInheritedVerified:
      safeDemoDataPolicy.firstGate &&
      safeDemoDataPolicy.forbidsLightlyAnonymizedRealFinanceData,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    staleEvidenceEnvelopeVerified:
      AppMcpStaleEvidenceEnvelopeSchema.safeParse(staleEvidence).success &&
      staleEvidence.freshness.state === "stale",
    unsafeActionEnvelopeVerified:
      AppMcpUnsafeActionEnvelopeSchema.safeParse(unsafeAction).success,
    unsupportedEvidenceEnvelopeVerified:
      AppMcpUnsupportedEvidenceEnvelopeSchema.safeParse(unsupportedEvidence)
        .success,
  });
}

export type AppMcpDescriptorEnvelopeProof = z.infer<
  typeof AppMcpDescriptorEnvelopeProofSchema
>;

function descriptorSurfacesRejectFieldNames(
  descriptors: readonly McpToolDescriptorContract[],
  fieldNames: readonly string[],
): boolean {
  return descriptors.every((descriptor) =>
    fieldNames.every((fieldName) => {
      const schemaChecks: ReadonlyArray<readonly [SafeParseSchema, unknown]> = [
        [
          McpDescriptorAnnotationsSchema,
          { ...descriptor.annotations, [fieldName]: true },
        ],
        [
          McpDescriptorCapabilityMetadataSchema,
          { ...descriptor.capabilityMetadata, [fieldName]: true },
        ],
        [
          McpDescriptorInputSchemaContractSchema,
          {
            ...descriptor.inputSchema,
            fields: [...descriptor.inputSchema.fields, fieldName],
          },
        ],
        [
          McpDescriptorOutputSchemaContractSchema,
          {
            ...descriptor.outputSchema,
            requiredFields: [
              ...descriptor.outputSchema.requiredFields,
              fieldName,
            ],
          },
        ],
      ];
      return schemaChecks.every(
        ([schema, value]) => !schema.safeParse(value).success,
      );
    }),
  );
}

function responseEnvelopeRejectsFieldNames(fieldNames: readonly string[]) {
  const evidenceEnvelope = buildAppMcpEvidenceEnvelope();
  return fieldNames.every((fieldName) => {
    const topLevel = { ...evidenceEnvelope, [fieldName]: "forbidden" };
    const nested = {
      ...evidenceEnvelope,
      evidence: [{ ...evidenceEnvelope.evidence[0], [fieldName]: "forbidden" }],
    };
    return (
      !AppMcpResponseEnvelopeSchema.safeParse(topLevel).success &&
      !AppMcpResponseEnvelopeSchema.safeParse(nested).success
    );
  });
}

function responseEnvelopeForbiddenActionsExactVerified(
  evidenceEnvelope: ReturnType<typeof buildAppMcpEvidenceEnvelope>,
) {
  return (
    sameList(evidenceEnvelope.forbiddenActions, MCP_FORBIDDEN_TOOL_NAMES) &&
    !AppMcpResponseEnvelopeSchema.safeParse({
      ...evidenceEnvelope,
      forbiddenActions: evidenceEnvelope.forbiddenActions.slice(0, -1),
    }).success &&
    !AppMcpResponseEnvelopeSchema.safeParse({
      ...evidenceEnvelope,
      forbiddenActions: [
        evidenceEnvelope.forbiddenActions[1],
        evidenceEnvelope.forbiddenActions[0],
        ...evidenceEnvelope.forbiddenActions.slice(2),
      ],
    }).success
  );
}

function sameList(left: readonly unknown[], right: readonly unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}
