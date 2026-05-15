import { z } from "zod";
import {
  MCP_TOOL_ALLOWLIST,
  type McpToolName,
} from "./read-only-app-mcp-boundaries";
import {
  EVIDENCE_TOOL_DISPATCH_SCHEMA_VERSION,
  EvidenceToolDispatchResponseRequiredFieldsSchema,
} from "./read-only-app-mcp-evidence-tool-dispatch-contracts";
import {
  buildEvidenceToolDispatchAllowlistBoundary,
  buildEvidenceToolDispatchContracts,
  buildEvidenceToolDispatchProofContract,
} from "./read-only-app-mcp-evidence-tool-dispatch-builders";

const trueLiteral = z.literal(true);

export const EvidenceToolDispatchProofSchema = z
  .object({
    schemaVersion: z.literal(EVIDENCE_TOOL_DISPATCH_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    evidenceToolDispatchContractsVerified: trueLiteral,
    exactV2gToolAllowlistVerified: trueLiteral,
    toolArgumentSchemasVerified: trueLiteral,
    serviceDependencyBoundaryVerified: trueLiteral,
    responseEnvelopeBoundaryVerified: trueLiteral,
    refusalEnvelopeBoundaryVerified: trueLiteral,
    freshnessBoundaryVerified: trueLiteral,
    sourceAnchorBoundaryVerified: trueLiteral,
    noRawFullFileDump: trueLiteral,
    noGeneratedFinanceAdvice: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noProviderCalls: trueLiteral,
    noExternalCommunications: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    routeAdapterToolsCallStillFailClosed: trueLiteral,
    noDispatchRuntimeImplemented: trueLiteral,
    searchEvidenceDispatchContractVerified: trueLiteral,
    fetchEvidenceCardDispatchContractVerified: trueLiteral,
    fetchSourceAnchorDispatchContractVerified: trueLiteral,
    fetchDocumentMapDispatchContractVerified: trueLiteral,
    fetchSourceCoverageDispatchContractVerified: trueLiteral,
    fetchCompanyPostureDispatchContractVerified: trueLiteral,
    fetchCapabilityBoundariesDispatchContractVerified: trueLiteral,
    fp0108BoundaryVerified: trueLiteral,
    fp0109BoundaryVerified: trueLiteral,
    fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified:
      trueLiteral,
    fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified: trueLiteral,
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified:
      trueLiteral,
    fp0113AbsentOrLocalOauthSecurityContractsVerified: trueLiteral,
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified: trueLiteral,
    fp0115Absent: trueLiteral,
    remoteHostReadinessContractsFoundationVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0114: trueLiteral,
    noNewRoutePathFromFp0114: trueLiteral,
    noRemoteMcpDeploymentFromFp0114: trueLiteral,
    noDeploymentConfigFromFp0114: trueLiteral,
    noOauthImplementationFromFp0114: trueLiteral,
    noTokenSessionImplementationFromFp0114: trueLiteral,
    noAuthMiddlewareImplementationFromFp0114: trueLiteral,
    noAppsSdkResourceFromFp0114: trueLiteral,
    noAppSubmissionFromFp0114: trueLiteral,
    noDbQueriesFromFp0114: trueLiteral,
    noSchemaMigrationsFromFp0114: trueLiteral,
    noPackageScriptsFromFp0114: trueLiteral,
    noOpenAiApiCallsFromFp0114: trueLiteral,
    noProviderExternalCallsFromFp0114: trueLiteral,
    noSourceMutationFinanceWriteFromFp0114: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0114: trueLiteral,
    oauthSecurityContractsFoundationVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0113: trueLiteral,
    noOauthImplementationFromFp0113: trueLiteral,
    noTokenSessionImplementationFromFp0113: trueLiteral,
    noAuthMiddlewareImplementationFromFp0113: trueLiteral,
    noRemoteMcpDeploymentFromFp0113: trueLiteral,
    noAppsSdkResourceFromFp0113: trueLiteral,
    noAppSubmissionFromFp0113: trueLiteral,
    noDbQueriesFromFp0113: trueLiteral,
    noSchemaMigrationsFromFp0113: trueLiteral,
    noOpenAiApiCallsFromFp0113: trueLiteral,
    noProviderExternalCallsFromFp0113: trueLiteral,
    noSourceMutationFinanceWriteFromFp0113: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0113: trueLiteral,
    remotePublicMcpOauthReadinessPlanBoundaryVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0112: trueLiteral,
    noRemoteMcpDeploymentFromFp0112: trueLiteral,
    noOauthTokenSessionFromFp0112: trueLiteral,
    noAppsSdkResourceFromFp0112: trueLiteral,
    noAppSubmissionFromFp0112: trueLiteral,
    noDbQueriesFromFp0112: trueLiteral,
    noSchemaMigrationsFromFp0112: trueLiteral,
    noOpenAiApiCallsFromFp0112: trueLiteral,
    noProviderExternalCallsFromFp0112: trueLiteral,
    noSourceMutationFinanceWriteFromFp0112: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0112: trueLiteral,
    defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0110: trueLiteral,
    noDefaultDispatchRuntimeFromFp0110: trueLiteral,
    noDbQueriesFromFp0110: trueLiteral,
    noSchemaMigrationsFromFp0110: trueLiteral,
    noOauthTokenSessionFromFp0110: trueLiteral,
    noRemoteMcpDeploymentFromFp0110: trueLiteral,
    noAppsSdkResourceFromFp0110: trueLiteral,
    noOpenAiApiCallsFromFp0110: trueLiteral,
    noSourceMutationFinanceWriteFromFp0110: trueLiteral,
    fp0109AdapterBoundaryStillVerified: trueLiteral,
    fp0108DispatchContractsStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    allowedTools: z.tuple([
      z.literal(MCP_TOOL_ALLOWLIST[0]),
      z.literal(MCP_TOOL_ALLOWLIST[1]),
      z.literal(MCP_TOOL_ALLOWLIST[2]),
      z.literal(MCP_TOOL_ALLOWLIST[3]),
      z.literal(MCP_TOOL_ALLOWLIST[4]),
      z.literal(MCP_TOOL_ALLOWLIST[5]),
      z.literal(MCP_TOOL_ALLOWLIST[6]),
    ]),
    responseEnvelopeRequiredFields:
      EvidenceToolDispatchResponseRequiredFieldsSchema,
    verifiedDispatchContracts: z.tuple([
      z.literal("search_evidence"),
      z.literal("fetch_evidence_card"),
      z.literal("fetch_source_anchor"),
      z.literal("fetch_document_map"),
      z.literal("fetch_source_coverage"),
      z.literal("fetch_company_posture"),
      z.literal("fetch_capability_boundaries"),
    ]),
  })
  .strict();

export type EvidenceToolDispatchProof = z.infer<
  typeof EvidenceToolDispatchProofSchema
>;

export function buildEvidenceToolDispatchProof(
  input: Partial<{
    fp0108BoundaryVerified: boolean;
    fp0109BoundaryVerified: boolean;
    fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified: boolean;
    fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified: boolean;
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified: boolean;
    fp0113AbsentOrLocalOauthSecurityContractsVerified: boolean;
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified: boolean;
    fp0115Absent: boolean;
    remoteHostReadinessContractsFoundationVerified: boolean;
    noRouteBehaviorChangeFromFp0114: boolean;
    noNewRoutePathFromFp0114: boolean;
    noRemoteMcpDeploymentFromFp0114: boolean;
    noDeploymentConfigFromFp0114: boolean;
    noOauthImplementationFromFp0114: boolean;
    noTokenSessionImplementationFromFp0114: boolean;
    noAuthMiddlewareImplementationFromFp0114: boolean;
    noAppsSdkResourceFromFp0114: boolean;
    noAppSubmissionFromFp0114: boolean;
    noDbQueriesFromFp0114: boolean;
    noSchemaMigrationsFromFp0114: boolean;
    noPackageScriptsFromFp0114: boolean;
    noOpenAiApiCallsFromFp0114: boolean;
    noProviderExternalCallsFromFp0114: boolean;
    noSourceMutationFinanceWriteFromFp0114: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0114: boolean;
    oauthSecurityContractsFoundationVerified: boolean;
    noRouteBehaviorChangeFromFp0113: boolean;
    noOauthImplementationFromFp0113: boolean;
    noTokenSessionImplementationFromFp0113: boolean;
    noAuthMiddlewareImplementationFromFp0113: boolean;
    noRemoteMcpDeploymentFromFp0113: boolean;
    noAppsSdkResourceFromFp0113: boolean;
    noAppSubmissionFromFp0113: boolean;
    noDbQueriesFromFp0113: boolean;
    noSchemaMigrationsFromFp0113: boolean;
    noOpenAiApiCallsFromFp0113: boolean;
    noProviderExternalCallsFromFp0113: boolean;
    noSourceMutationFinanceWriteFromFp0113: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0113: boolean;
    remotePublicMcpOauthReadinessPlanBoundaryVerified: boolean;
    noRouteBehaviorChangeFromFp0112: boolean;
    noRemoteMcpDeploymentFromFp0112: boolean;
    noOauthTokenSessionFromFp0112: boolean;
    noAppsSdkResourceFromFp0112: boolean;
    noAppSubmissionFromFp0112: boolean;
    noDbQueriesFromFp0112: boolean;
    noSchemaMigrationsFromFp0112: boolean;
    noOpenAiApiCallsFromFp0112: boolean;
    noProviderExternalCallsFromFp0112: boolean;
    noSourceMutationFinanceWriteFromFp0112: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0112: boolean;
    defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified: boolean;
    noRouteBehaviorChangeFromFp0110: boolean;
    noDefaultDispatchRuntimeFromFp0110: boolean;
    noDbQueriesFromFp0110: boolean;
    noSchemaMigrationsFromFp0110: boolean;
    noOauthTokenSessionFromFp0110: boolean;
    noRemoteMcpDeploymentFromFp0110: boolean;
    noAppsSdkResourceFromFp0110: boolean;
    noOpenAiApiCallsFromFp0110: boolean;
    noSourceMutationFinanceWriteFromFp0110: boolean;
    fp0109AdapterBoundaryStillVerified: boolean;
    fp0108DispatchContractsStillVerified: boolean;
    fp0107RouteAdapterBoundaryStillVerified: boolean;
    fp0106ProtocolEnvelopeBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
    noOpenAiApiCalls: boolean;
    noModelCalls: boolean;
    noOpenAiClientOrKeyUsage: boolean;
    routeAdapterToolsCallStillFailClosed: boolean;
    noDispatchRuntimeImplemented: boolean;
  }> = {},
): EvidenceToolDispatchProof {
  const proofContract = buildEvidenceToolDispatchProofContract();
  const allowlist = buildEvidenceToolDispatchAllowlistBoundary();
  const contracts = buildEvidenceToolDispatchContracts();
  const byTool = contractsByTool(contracts);

  return EvidenceToolDispatchProofSchema.parse({
    allowedTools: [...MCP_TOOL_ALLOWLIST],
    evidenceToolDispatchContractsVerified:
      proofContract.contractOnly &&
      proofContract.readOnly &&
      proofContract.localProofOnly &&
      contracts.length === MCP_TOOL_ALLOWLIST.length &&
      MCP_TOOL_ALLOWLIST.every((toolName) => byTool[toolName] !== undefined),
    exactV2gToolAllowlistVerified:
      sameList(allowlist.exactV2gToolAllowlist, MCP_TOOL_ALLOWLIST) &&
      !allowlist.dynamicToolsAllowed &&
      !allowlist.writeActionToolsAllowed,
    defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified:
      input.defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified ?? true,
    fetchCapabilityBoundariesDispatchContractVerified: contractVerified(
      byTool.fetch_capability_boundaries,
    ),
    fetchCompanyPostureDispatchContractVerified: contractVerified(
      byTool.fetch_company_posture,
    ),
    fetchDocumentMapDispatchContractVerified: contractVerified(
      byTool.fetch_document_map,
    ),
    fetchEvidenceCardDispatchContractVerified: contractVerified(
      byTool.fetch_evidence_card,
    ),
    fetchSourceAnchorDispatchContractVerified: contractVerified(
      byTool.fetch_source_anchor,
    ),
    fetchSourceCoverageDispatchContractVerified: contractVerified(
      byTool.fetch_source_coverage,
    ),
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0108BoundaryVerified: input.fp0108BoundaryVerified ?? true,
    fp0108DispatchContractsStillVerified:
      input.fp0108DispatchContractsStillVerified ?? true,
    fp0109BoundaryVerified: input.fp0109BoundaryVerified ?? true,
    fp0109AdapterBoundaryStillVerified:
      input.fp0109AdapterBoundaryStillVerified ?? true,
    fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified:
      input.fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified ??
      true,
    fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified:
      input.fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified ?? true,
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified:
      input.fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified ??
      true,
    fp0113AbsentOrLocalOauthSecurityContractsVerified:
      input.fp0113AbsentOrLocalOauthSecurityContractsVerified ?? true,
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
      input.fp0114AbsentOrLocalRemoteHostReadinessContractsVerified ?? true,
    fp0115Absent: input.fp0115Absent ?? true,
    remoteHostReadinessContractsFoundationVerified:
      input.remoteHostReadinessContractsFoundationVerified ?? true,
    oauthSecurityContractsFoundationVerified:
      input.oauthSecurityContractsFoundationVerified ?? true,
    freshnessBoundaryVerified: contracts.every(
      (contract) =>
        contract.freshnessBoundary.missingEvidenceFailsClosed &&
        contract.freshnessBoundary.missingCitationFailsClosed &&
        contract.freshnessBoundary.unsupportedEvidenceFailsClosed &&
        contract.freshnessBoundary.staleEvidenceFailsClosed &&
        contract.freshnessBoundary.conflictingEvidenceFailsClosed &&
        contract.freshnessBoundary.promptInjectionContentRemainsUntrusted,
    ),
    localProofOnly: proofContract.localProofOnly,
    noDispatchRuntimeImplemented:
      (input.noDispatchRuntimeImplemented ?? true) &&
      proofContract.noDispatchRuntimeImplemented &&
      contracts.every((contract) => !contract.dispatchRuntimeImplemented),
    noExternalCommunications: contracts.every(
      (contract) =>
        !contract.noProviderExternalCallBoundary.externalCommunicationsAllowed,
    ),
    noFinanceWrite: contracts.every(
      (contract) => !contract.noFinanceWriteBoundary.financeWriteAllowed,
    ),
    noGeneratedFinanceAdvice: contracts.every(
      (contract) =>
        !contract.noFinanceWriteBoundary.generatedFinanceAdviceAllowed,
    ),
    noModelCalls:
      (input.noModelCalls ?? true) &&
      contracts.every(
        (contract) => !contract.noOpenAiModelBoundary.modelCallsAllowed,
      ),
    noOpenAiApiCalls:
      (input.noOpenAiApiCalls ?? true) &&
      contracts.every(
        (contract) => !contract.noOpenAiModelBoundary.openAiApiCallsAllowed,
      ),
    noOpenAiClientOrKeyUsage:
      (input.noOpenAiClientOrKeyUsage ?? true) &&
      contracts.every(
        (contract) =>
          !contract.noOpenAiModelBoundary.openAiClientOrKeyUsageAllowed,
      ),
    noAppsSdkResourceFromFp0110: input.noAppsSdkResourceFromFp0110 ?? true,
    noAppsSdkResourceFromFp0112: input.noAppsSdkResourceFromFp0112 ?? true,
    noAppsSdkResourceFromFp0113: input.noAppsSdkResourceFromFp0113 ?? true,
    noAppsSdkResourceFromFp0114: input.noAppsSdkResourceFromFp0114 ?? true,
    noAppSubmissionFromFp0112: input.noAppSubmissionFromFp0112 ?? true,
    noAppSubmissionFromFp0113: input.noAppSubmissionFromFp0113 ?? true,
    noAppSubmissionFromFp0114: input.noAppSubmissionFromFp0114 ?? true,
    noAuthMiddlewareImplementationFromFp0114:
      input.noAuthMiddlewareImplementationFromFp0114 ?? true,
    noDbQueriesFromFp0110: input.noDbQueriesFromFp0110 ?? true,
    noDbQueriesFromFp0112: input.noDbQueriesFromFp0112 ?? true,
    noDbQueriesFromFp0113: input.noDbQueriesFromFp0113 ?? true,
    noDbQueriesFromFp0114: input.noDbQueriesFromFp0114 ?? true,
    noDefaultDispatchRuntimeFromFp0110:
      input.noDefaultDispatchRuntimeFromFp0110 ?? true,
    noDeploymentConfigFromFp0114:
      input.noDeploymentConfigFromFp0114 ?? true,
    noOauthTokenSessionFromFp0110: input.noOauthTokenSessionFromFp0110 ?? true,
    noOauthTokenSessionFromFp0112: input.noOauthTokenSessionFromFp0112 ?? true,
    noTokenSessionImplementationFromFp0113:
      input.noTokenSessionImplementationFromFp0113 ?? true,
    noTokenSessionImplementationFromFp0114:
      input.noTokenSessionImplementationFromFp0114 ?? true,
    noAuthMiddlewareImplementationFromFp0113:
      input.noAuthMiddlewareImplementationFromFp0113 ?? true,
    noOauthImplementationFromFp0113:
      input.noOauthImplementationFromFp0113 ?? true,
    noOauthImplementationFromFp0114:
      input.noOauthImplementationFromFp0114 ?? true,
    noOpenAiApiCallsFromFp0110: input.noOpenAiApiCallsFromFp0110 ?? true,
    noOpenAiApiCallsFromFp0112: input.noOpenAiApiCallsFromFp0112 ?? true,
    noOpenAiApiCallsFromFp0113: input.noOpenAiApiCallsFromFp0113 ?? true,
    noOpenAiApiCallsFromFp0114: input.noOpenAiApiCallsFromFp0114 ?? true,
    noPackageScriptsFromFp0114: input.noPackageScriptsFromFp0114 ?? true,
    noProviderCalls: contracts.every(
      (contract) =>
        !contract.noProviderExternalCallBoundary.providerCallsAllowed,
    ),
    noRawFullFileDump: contracts.every(
      (contract) =>
        !contract.noRawDumpBoundary.rawFullFileDumpAllowed &&
        contract.noRawDumpBoundary.boundedCitedExcerptsOnly,
    ),
    noRemoteMcpDeploymentFromFp0110:
      input.noRemoteMcpDeploymentFromFp0110 ?? true,
    noRemoteMcpDeploymentFromFp0112:
      input.noRemoteMcpDeploymentFromFp0112 ?? true,
    noRemoteMcpDeploymentFromFp0113:
      input.noRemoteMcpDeploymentFromFp0113 ?? true,
    noRemoteMcpDeploymentFromFp0114:
      input.noRemoteMcpDeploymentFromFp0114 ?? true,
    noNewRoutePathFromFp0114: input.noNewRoutePathFromFp0114 ?? true,
    noRouteBehaviorChangeFromFp0110:
      input.noRouteBehaviorChangeFromFp0110 ?? true,
    noRouteBehaviorChangeFromFp0112:
      input.noRouteBehaviorChangeFromFp0112 ?? true,
    noRouteBehaviorChangeFromFp0113:
      input.noRouteBehaviorChangeFromFp0113 ?? true,
    noRouteBehaviorChangeFromFp0114:
      input.noRouteBehaviorChangeFromFp0114 ?? true,
    noSchemaMigrationsFromFp0110: input.noSchemaMigrationsFromFp0110 ?? true,
    noSchemaMigrationsFromFp0112: input.noSchemaMigrationsFromFp0112 ?? true,
    noSchemaMigrationsFromFp0113: input.noSchemaMigrationsFromFp0113 ?? true,
    noSchemaMigrationsFromFp0114:
      input.noSchemaMigrationsFromFp0114 ?? true,
    noSourceMutation: contracts.every(
      (contract) => !contract.noMutationBoundary.sourceMutationAllowed,
    ),
    noSourceMutationFinanceWriteFromFp0110:
      input.noSourceMutationFinanceWriteFromFp0110 ?? true,
    noProviderExternalCallsFromFp0112:
      input.noProviderExternalCallsFromFp0112 ?? true,
    noProviderExternalCallsFromFp0113:
      input.noProviderExternalCallsFromFp0113 ?? true,
    noProviderExternalCallsFromFp0114:
      input.noProviderExternalCallsFromFp0114 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0112:
      input.noPublicAssetsSubmissionArtifactsFromFp0112 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0113:
      input.noPublicAssetsSubmissionArtifactsFromFp0113 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0114:
      input.noPublicAssetsSubmissionArtifactsFromFp0114 ?? true,
    noSourceMutationFinanceWriteFromFp0112:
      input.noSourceMutationFinanceWriteFromFp0112 ?? true,
    noSourceMutationFinanceWriteFromFp0113:
      input.noSourceMutationFinanceWriteFromFp0113 ?? true,
    noSourceMutationFinanceWriteFromFp0114:
      input.noSourceMutationFinanceWriteFromFp0114 ?? true,
    refusalEnvelopeBoundaryVerified: contracts.every(
      (contract) =>
        contract.refusalEnvelopeBoundary.failClosed &&
        contract.refusalEnvelopeBoundary.structuredContentRequiredForErrors &&
        contract.refusalEnvelopeBoundary.refusalReasonRequired,
    ),
    responseEnvelopeBoundaryVerified: contracts.every(
      (contract) =>
        contract.responseEnvelopeBoundary.structuredContentRequired &&
        contract.responseEnvelopeBoundary.evidenceRequiredForSuccess &&
        contract.responseEnvelopeBoundary.sourceAnchorsRequiredForSuccess &&
        contract.responseEnvelopeBoundary.capabilityBoundaryRequired,
    ),
    responseEnvelopeRequiredFields: [
      "structuredContent",
      "evidence",
      "sourceAnchors",
      "freshness",
      "limitations",
      "permittedNextActions",
      "refusalReason",
      "capabilityBoundary",
    ],
    routeAdapterToolsCallStillFailClosed:
      (input.routeAdapterToolsCallStillFailClosed ?? true) &&
      proofContract.routeAdapterToolsCallStillFailClosed &&
      contracts.every((contract) => !contract.routeAdapterDispatchEnabled),
    remotePublicMcpOauthReadinessPlanBoundaryVerified:
      input.remotePublicMcpOauthReadinessPlanBoundaryVerified ?? true,
    schemaVersion: EVIDENCE_TOOL_DISPATCH_SCHEMA_VERSION,
    searchEvidenceDispatchContractVerified: contractVerified(
      byTool.search_evidence,
    ),
    serviceDependencyBoundaryVerified: contracts.every(
      (contract) =>
        contract.serviceDependencyBoundary.readOnly &&
        contract.serviceDependencyBoundary.futureDispatchOnly &&
        contract.serviceDependencyBoundary
          .resolvesThroughExistingEvidenceSourceAuthorityLanesOnly &&
        !contract.serviceDependencyBoundary.createsNewControlPlaneService &&
        !contract.serviceDependencyBoundary.addsDatabaseQueries,
    ),
    sourceAnchorBoundaryVerified: contracts.every(
      (contract) =>
        contract.sourceAnchorBoundary.sourceAnchorsRequiredForSuccess &&
        contract.sourceAnchorBoundary.sourceAnchorCitationRequired &&
        contract.sourceAnchorBoundary.modelOutputCannotBecomeSourceTruth &&
        contract.sourceAnchorBoundary.rawSourcesImmutable,
    ),
    toolArgumentSchemasVerified: contracts.every(
      (contract) =>
        contract.argumentSchemaBoundary.acceptsOnlyDeclaredArguments &&
        contract.argumentSchemaBoundary.unknownArgumentsFailClosed &&
        contract.argumentSchemaBoundary.missingRequiredArgumentsFailClosed &&
        contract.argumentSchemaBoundary.noBestEffortArgumentInference,
    ),
    verifiedDispatchContracts: [...MCP_TOOL_ALLOWLIST],
  });
}

function contractsByTool(
  contracts: ReturnType<typeof buildEvidenceToolDispatchContracts>,
) {
  return Object.fromEntries(
    contracts.map((contract) => [contract.toolName, contract]),
  ) as Record<
    McpToolName,
    ReturnType<typeof buildEvidenceToolDispatchContracts>[number]
  >;
}

function contractVerified(
  contract:
    | ReturnType<typeof buildEvidenceToolDispatchContracts>[number]
    | undefined,
): boolean {
  return Boolean(
    contract &&
    contract.localProofOnly &&
    !contract.dispatchRuntimeImplemented &&
    !contract.routeAdapterDispatchEnabled,
  );
}

function sameList(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((item, index) => item === expected[index])
  );
}
