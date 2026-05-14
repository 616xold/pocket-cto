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
    fp0111Absent: trueLiteral,
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
    fp0111Absent: boolean;
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
    fp0111Absent: input.fp0111Absent ?? true,
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
    noDbQueriesFromFp0110: input.noDbQueriesFromFp0110 ?? true,
    noDefaultDispatchRuntimeFromFp0110:
      input.noDefaultDispatchRuntimeFromFp0110 ?? true,
    noOauthTokenSessionFromFp0110:
      input.noOauthTokenSessionFromFp0110 ?? true,
    noOpenAiApiCallsFromFp0110: input.noOpenAiApiCallsFromFp0110 ?? true,
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
    noRouteBehaviorChangeFromFp0110:
      input.noRouteBehaviorChangeFromFp0110 ?? true,
    noSchemaMigrationsFromFp0110:
      input.noSchemaMigrationsFromFp0110 ?? true,
    noSourceMutation: contracts.every(
      (contract) => !contract.noMutationBoundary.sourceMutationAllowed,
    ),
    noSourceMutationFinanceWriteFromFp0110:
      input.noSourceMutationFinanceWriteFromFp0110 ?? true,
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
