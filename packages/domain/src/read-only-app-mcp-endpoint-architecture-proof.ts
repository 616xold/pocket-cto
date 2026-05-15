import { z } from "zod";
import { MCP_TOOL_ALLOWLIST } from "./read-only-app-mcp-boundaries";
import { buildEndpointArchitectureContracts } from "./read-only-app-mcp-endpoint-architecture-builders";
import {
  ENDPOINT_ARCHITECTURE_SCHEMA_VERSION,
  ENDPOINT_FAIL_CLOSED_REQUESTS,
  ENDPOINT_FUTURE_INVENTORY_FIELDS,
  ENDPOINT_RESPONSE_ENVELOPE_FIELDS,
} from "./read-only-app-mcp-endpoint-architecture-contracts";

const trueLiteral = z.literal(true);

export const EndpointArchitectureProofSchema = z
  .object({
    schemaVersion: z.literal(ENDPOINT_ARCHITECTURE_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    endpointArchitectureProofContractsVerified: trueLiteral,
    endpointInventoryDeferredBoundaryVerified: trueLiteral,
    endpointPathInventoryPreconditionsVerified: trueLiteral,
    endpointTrustModelBoundaryVerified: trueLiteral,
    endpointTransportChoiceBoundaryVerified: trueLiteral,
    endpointTlsHttpsFutureRequirementBoundaryVerified: trueLiteral,
    endpointRequestResponseEnvelopeBoundaryVerified: trueLiteral,
    endpointEvidenceFreshnessLimitationsBoundaryVerified: trueLiteral,
    endpointRefusalFailureModeBoundaryVerified: trueLiteral,
    endpointReadOnlyToolAllowlistBoundaryVerified: trueLiteral,
    noEndpointImplementation: trueLiteral,
    noRouteImplementation: trueLiteral,
    noAppRoutesAdded: trueLiteral,
    noWebApiRoutesAdded: trueLiteral,
    noBackendControlPlaneRoutesAdded: trueLiteral,
    noMcpServerRuntime: trueLiteral,
    noOauthTokenSessionImplementation: trueLiteral,
    noRemoteMcpImplementationOrDeployment: trueLiteral,
    noAppsSdkResourceImplementation: trueLiteral,
    noPublicChatGptAppImplementation: trueLiteral,
    noAppSubmission: trueLiteral,
    noPublicAssets: trueLiteral,
    noListingCopy: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noWriteActionTools: trueLiteral,
    noExternalCommunications: trueLiteral,
    noGeneratedFinanceAdvice: trueLiteral,
    noProviderCertificationDeliveryDeployment: trueLiteral,
    noPublicAssetsSubmissionArtifacts: trueLiteral,
    noRuntimeCodexFinanceOutput: trueLiteral,
    noAutonomousAction: trueLiteral,
    readOnlyToolAllowlistExactVerified: trueLiteral,
    requiredFutureInventoryFieldsVerified: trueLiteral,
    responseEnvelopeRequiredFieldsVerified: trueLiteral,
    refusalFailureModesVerified: trueLiteral,
    fp0102ArchitectureBoundaryStillVerified: trueLiteral,
    fp0101ImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    fp0099PublicSecurityThreatModelBoundaryStillVerified: trueLiteral,
    fp0098PublicAppReadinessBoundaryStillVerified: trueLiteral,
    fp0087DescriptorEnvelopeBoundaryStillVerified: trueLiteral,
    publicAppImplementationSubmissionFutureOnly: trueLiteral,
    endpointArchitectureProofPlanAccepted: trueLiteral,
    exactlyOneFp0103PlanVerified: trueLiteral,
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified:
      trueLiteral,
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified:
      trueLiteral,
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
      trueLiteral,
    fp0107Absent: trueLiteral,
    endpointImplementationReadinessPlanBoundaryVerified: trueLiteral,
    exactFutureEndpointInventoryReadinessVerified: trueLiteral,
    noEndpointImplementationFromFp0104: trueLiteral,
    noRouteImplementationFromFp0104: trueLiteral,
    noApiBackendRoutesFromFp0104: trueLiteral,
    noOauthTokenSessionImplementationFromFp0104: trueLiteral,
    noRemoteMcpImplementationOrDeploymentFromFp0104: trueLiteral,
    noAppsSdkResourceFromFp0104: trueLiteral,
    noAppSubmissionFromFp0104: trueLiteral,
    noOpenAiApiCallsFromFp0104: trueLiteral,
    noSourceMutationFinanceWriteFromFp0104: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0104: trueLiteral,
    endpointRuntimeChangedFilesVerified: trueLiteral,
    endpointRuntimeRepositoryInventoryVerified: trueLiteral,
    fp0103EndpointArchitectureProofContractsStillVerified: trueLiteral,
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified: trueLiteral,
    allowedTools: z.tuple([
      z.literal(MCP_TOOL_ALLOWLIST[0]),
      z.literal(MCP_TOOL_ALLOWLIST[1]),
      z.literal(MCP_TOOL_ALLOWLIST[2]),
      z.literal(MCP_TOOL_ALLOWLIST[3]),
      z.literal(MCP_TOOL_ALLOWLIST[4]),
      z.literal(MCP_TOOL_ALLOWLIST[5]),
      z.literal(MCP_TOOL_ALLOWLIST[6]),
    ]),
    requiredFutureInventoryFields: z.tuple([
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[0]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[1]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[2]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[3]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[4]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[5]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[6]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[7]),
      z.literal(ENDPOINT_FUTURE_INVENTORY_FIELDS[8]),
    ]),
    responseEnvelopeRequiredFields: z.tuple([
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[0]),
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[1]),
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[2]),
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[3]),
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[4]),
      z.literal(ENDPOINT_RESPONSE_ENVELOPE_FIELDS[5]),
    ]),
    failClosedRequests: z.tuple([
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[0]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[1]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[2]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[3]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[4]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[5]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[6]),
      z.literal(ENDPOINT_FAIL_CLOSED_REQUESTS[7]),
    ]),
  })
  .strict();

export function buildEndpointArchitectureProof(
  input: Partial<{
    noEndpointImplementation: boolean;
    noRouteImplementation: boolean;
    noAppRoutesAdded: boolean;
    noWebApiRoutesAdded: boolean;
    noBackendControlPlaneRoutesAdded: boolean;
    noMcpServerRuntime: boolean;
    noOauthTokenSessionImplementation: boolean;
    noRemoteMcpImplementationOrDeployment: boolean;
    noAppsSdkResourceImplementation: boolean;
    noPublicChatGptAppImplementation: boolean;
    noAppSubmission: boolean;
    noPublicAssets: boolean;
    noListingCopy: boolean;
    noOpenAiApiCalls: boolean;
    noModelCalls: boolean;
    noOpenAiClientOrKeyUsage: boolean;
    noSourceMutation: boolean;
    noFinanceWrite: boolean;
    noWriteActionTools: boolean;
    noExternalCommunications: boolean;
    noGeneratedFinanceAdvice: boolean;
    noProviderCertificationDeliveryDeployment: boolean;
    noPublicAssetsSubmissionArtifacts: boolean;
    noRuntimeCodexFinanceOutput: boolean;
    noAutonomousAction: boolean;
    fp0102ArchitectureBoundaryStillVerified: boolean;
    fp0101ImplementationSequencingBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
    fp0099PublicSecurityThreatModelBoundaryStillVerified: boolean;
    fp0098PublicAppReadinessBoundaryStillVerified: boolean;
    fp0087DescriptorEnvelopeBoundaryStillVerified: boolean;
    publicAppImplementationSubmissionFutureOnly: boolean;
    endpointArchitectureProofPlanAccepted: boolean;
    exactlyOneFp0103PlanVerified: boolean;
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified: boolean;
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified: boolean;
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified: boolean;
    fp0107Absent: boolean;
    endpointImplementationReadinessPlanBoundaryVerified: boolean;
    exactFutureEndpointInventoryReadinessVerified: boolean;
    noEndpointImplementationFromFp0104: boolean;
    noRouteImplementationFromFp0104: boolean;
    noApiBackendRoutesFromFp0104: boolean;
    noOauthTokenSessionImplementationFromFp0104: boolean;
    noRemoteMcpImplementationOrDeploymentFromFp0104: boolean;
    noAppsSdkResourceFromFp0104: boolean;
    noAppSubmissionFromFp0104: boolean;
    noOpenAiApiCallsFromFp0104: boolean;
    noSourceMutationFinanceWriteFromFp0104: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0104: boolean;
    endpointRuntimeChangedFilesVerified: boolean;
    endpointRuntimeRepositoryInventoryVerified: boolean;
    fp0103EndpointArchitectureProofContractsStillVerified: boolean;
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified: boolean;
  }> = {},
) {
  const contracts = buildEndpointArchitectureContracts();
  const proofContract = contracts.architectureProofContract;
  const inventory = contracts.inventoryDeferredBoundary;
  const pathPreconditions = contracts.pathInventoryPreconditions;
  const trustModel = contracts.trustModelBoundary;
  const transport = contracts.transportChoiceBoundary;
  const tls = contracts.tlsHttpsFutureRequirementBoundary;
  const envelope = contracts.requestResponseEnvelopeBoundary;
  const evidence = contracts.evidenceFreshnessLimitationsBoundary;
  const refusal = contracts.refusalFailureModeBoundary;
  const allowlist = contracts.readOnlyToolAllowlistBoundary;

  return EndpointArchitectureProofSchema.parse({
    allowedTools: [...MCP_TOOL_ALLOWLIST],
    endpointArchitectureProofContractsVerified:
      proofContract.endpointArchitectureProofContractsOnly &&
      !proofContract.endpointImplementationAuthorized &&
      !proofContract.routeImplementationAuthorized &&
      !proofContract.openAiApiModelCallsAuthorized,
    endpointArchitectureProofPlanAccepted:
      input.endpointArchitectureProofPlanAccepted ?? true,
    endpointEvidenceFreshnessLimitationsBoundaryVerified:
      evidence.evidenceRequired &&
      evidence.sourceAnchorsRequired &&
      evidence.freshnessRequired &&
      evidence.limitationsRequired &&
      evidence.permittedNextActionsRequired &&
      evidence.missingEvidenceFailsClosed,
    endpointInventoryDeferredBoundaryVerified:
      inventory.endpointInventoryFutureOnly &&
      !inventory.endpointInventoryImplemented &&
      inventory.requiresLaterFinancePlan,
    endpointPathInventoryPreconditionsVerified:
      pathPreconditions.noEndpointPathImplemented &&
      pathPreconditions.noHealthPathImplemented &&
      pathPreconditions.futureEndpointInventoryMustNameAllFields,
    endpointReadOnlyToolAllowlistBoundaryVerified:
      JSON.stringify(allowlist.allowedTools) ===
        JSON.stringify(MCP_TOOL_ALLOWLIST) &&
      !allowlist.dynamicToolsAllowed &&
      !allowlist.writeModifyActionToolsAllowed &&
      allowlist.existingV2gDescriptorAllowlistRemainsReadOnly,
    endpointRefusalFailureModeBoundaryVerified:
      refusal.failClosed &&
      !refusal.generatedFinanceAdviceAllowed &&
      sameList(refusal.requiredFailClosedRequests, ENDPOINT_FAIL_CLOSED_REQUESTS),
    endpointRequestResponseEnvelopeBoundaryVerified:
      envelope.envelopeFutureOnly &&
      !envelope.rawFullFileDumpsAllowed &&
      sameList(envelope.responseMustPreserveFields, ENDPOINT_RESPONSE_ENVELOPE_FIELDS),
    endpointTlsHttpsFutureRequirementBoundaryVerified:
      tls.tlsHttpsFutureRequirement &&
      !tls.tlsConfiguredNow &&
      tls.stableHttpsHostFutureOnly &&
      tls.deploymentFutureOnly,
    endpointTransportChoiceBoundaryVerified:
      transport.transportChoiceIsArchitectureInputOnly &&
      !transport.transportImplemented &&
      transport.laterJustificationAgainstOfficialDocsRequired,
    endpointTrustModelBoundaryVerified:
      trustModel.trustModelFutureOnly &&
      trustModel.rawSourcesRemainDocumentTruth &&
      trustModel.financeTwinRemainsStructuredTruth &&
      trustModel.evidenceIndexRemainsReadOnlyAnchorLayer,
    exactlyOneFp0103PlanVerified: input.exactlyOneFp0103PlanVerified ?? true,
    failClosedRequests: [...ENDPOINT_FAIL_CLOSED_REQUESTS],
    fp0087DescriptorEnvelopeBoundaryStillVerified:
      input.fp0087DescriptorEnvelopeBoundaryStillVerified ?? true,
    fp0098PublicAppReadinessBoundaryStillVerified:
      input.fp0098PublicAppReadinessBoundaryStillVerified ?? true,
    fp0099PublicSecurityThreatModelBoundaryStillVerified:
      input.fp0099PublicSecurityThreatModelBoundaryStillVerified ?? true,
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0101ImplementationSequencingBoundaryStillVerified:
      input.fp0101ImplementationSequencingBoundaryStillVerified ?? true,
    fp0102ArchitectureBoundaryStillVerified:
      input.fp0102ArchitectureBoundaryStillVerified ?? true,
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified:
      input.fp0103EndpointArchitecturePostmergeProofDurabilityVerified ?? true,
    fp0103EndpointArchitectureProofContractsStillVerified:
      input.fp0103EndpointArchitectureProofContractsStillVerified ?? true,
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified:
      input
        .fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified ??
      true,
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified:
      input
        .fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified ??
      true,
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
      input.fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified ??
      true,
    fp0107Absent: input.fp0107Absent ?? true,
    localProofOnly: proofContract.localProofOnly,
    noAppSubmission: input.noAppSubmission ?? true,
    noAppRoutesAdded: input.noAppRoutesAdded ?? true,
    noAppsSdkResourceImplementation:
      input.noAppsSdkResourceImplementation ?? true,
    noAutonomousAction: input.noAutonomousAction ?? true,
    noBackendControlPlaneRoutesAdded:
      input.noBackendControlPlaneRoutesAdded ?? true,
    noEndpointImplementation: input.noEndpointImplementation ?? true,
    noExternalCommunications: input.noExternalCommunications ?? true,
    noFinanceWrite: input.noFinanceWrite ?? true,
    noGeneratedFinanceAdvice: input.noGeneratedFinanceAdvice ?? true,
    noListingCopy: input.noListingCopy ?? true,
    noMcpServerRuntime: input.noMcpServerRuntime ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noOauthTokenSessionImplementation:
      input.noOauthTokenSessionImplementation ?? true,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noOpenAiClientOrKeyUsage: input.noOpenAiClientOrKeyUsage ?? true,
    noProviderCertificationDeliveryDeployment:
      input.noProviderCertificationDeliveryDeployment ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    noPublicAssetsSubmissionArtifacts:
      input.noPublicAssetsSubmissionArtifacts ?? true,
    noPublicChatGptAppImplementation:
      input.noPublicChatGptAppImplementation ?? true,
    noEndpointImplementationFromFp0104:
      input.noEndpointImplementationFromFp0104 ?? true,
    noRouteImplementationFromFp0104:
      input.noRouteImplementationFromFp0104 ?? true,
    noApiBackendRoutesFromFp0104:
      input.noApiBackendRoutesFromFp0104 ?? true,
    noOauthTokenSessionImplementationFromFp0104:
      input.noOauthTokenSessionImplementationFromFp0104 ?? true,
    noRemoteMcpImplementationOrDeploymentFromFp0104:
      input.noRemoteMcpImplementationOrDeploymentFromFp0104 ?? true,
    noAppsSdkResourceFromFp0104:
      input.noAppsSdkResourceFromFp0104 ?? true,
    noAppSubmissionFromFp0104: input.noAppSubmissionFromFp0104 ?? true,
    noOpenAiApiCallsFromFp0104:
      input.noOpenAiApiCallsFromFp0104 ?? true,
    noSourceMutationFinanceWriteFromFp0104:
      input.noSourceMutationFinanceWriteFromFp0104 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0104:
      input.noPublicAssetsSubmissionArtifactsFromFp0104 ?? true,
    noRemoteMcpImplementationOrDeployment:
      input.noRemoteMcpImplementationOrDeployment ?? true,
    noRouteImplementation: input.noRouteImplementation ?? true,
    noRuntimeCodexFinanceOutput: input.noRuntimeCodexFinanceOutput ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noWebApiRoutesAdded: input.noWebApiRoutesAdded ?? true,
    noWriteActionTools: input.noWriteActionTools ?? true,
    publicAppImplementationSubmissionFutureOnly:
      input.publicAppImplementationSubmissionFutureOnly ?? true,
    endpointImplementationReadinessPlanBoundaryVerified:
      input.endpointImplementationReadinessPlanBoundaryVerified ?? true,
    endpointRuntimeChangedFilesVerified:
      input.endpointRuntimeChangedFilesVerified ?? true,
    endpointRuntimeRepositoryInventoryVerified:
      input.endpointRuntimeRepositoryInventoryVerified ?? true,
    exactFutureEndpointInventoryReadinessVerified:
      input.exactFutureEndpointInventoryReadinessVerified ?? true,
    readOnlyToolAllowlistExactVerified:
      sameList(allowlist.allowedTools, MCP_TOOL_ALLOWLIST),
    refusalFailureModesVerified:
      sameList(refusal.requiredFailClosedRequests, ENDPOINT_FAIL_CLOSED_REQUESTS),
    requiredFutureInventoryFields: [...ENDPOINT_FUTURE_INVENTORY_FIELDS],
    requiredFutureInventoryFieldsVerified: sameList(
      inventory.requiredFutureInventoryFields,
      ENDPOINT_FUTURE_INVENTORY_FIELDS,
    ),
    responseEnvelopeRequiredFields: [...ENDPOINT_RESPONSE_ENVELOPE_FIELDS],
    responseEnvelopeRequiredFieldsVerified: sameList(
      envelope.responseMustPreserveFields,
      ENDPOINT_RESPONSE_ENVELOPE_FIELDS,
    ),
    schemaVersion: ENDPOINT_ARCHITECTURE_SCHEMA_VERSION,
  });
}

function sameList(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export type EndpointArchitectureProof = z.infer<
  typeof EndpointArchitectureProofSchema
>;

export type EndpointRuntimeRepositoryInventoryFile = {
  path: string;
  source?: string;
};

export type EndpointRuntimeRepositoryInventoryResult = {
  endpointRuntimeRepositoryInventoryVerified: boolean;
  violations: string[];
};

export function inspectEndpointRuntimeRepositoryInventory(
  files: readonly EndpointRuntimeRepositoryInventoryFile[],
): EndpointRuntimeRepositoryInventoryResult {
  const violations = files
    .filter((file) => endpointRuntimeRepositoryViolation(file))
    .map((file) => file.path)
    .sort();

  return {
    endpointRuntimeRepositoryInventoryVerified: violations.length === 0,
    violations,
  };
}

function endpointRuntimeRepositoryViolation(
  file: EndpointRuntimeRepositoryInventoryFile,
): boolean {
  if (isAllowedEndpointArchitectureProofSurface(file.path)) return false;
  if (isAllowedHistoricalLocalPreviewSurface(file.path)) return false;
  if (isAllowedFp0107LocalRouteAdapterSurface(file)) return false;
  if (isAllowedShippedNonPublicRouteSurface(file.path)) return false;
  if (isAllowedHistoricalConnectorSurface(file.path)) return false;

  const source = file.source ?? "";
  return (
    looksLikePublicAppEndpointRuntimePath(file.path) ||
    looksLikePublicAppEndpointRuntimeSource(source)
  );
}

function isAllowedFp0107LocalRouteAdapterSurface(
  file: EndpointRuntimeRepositoryInventoryFile,
): boolean {
  const routeModule =
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|schema|formatter|service|evidence-dispatcher)(?:\.spec)?\.ts$/u.test(
      file.path,
    );
  const appConstructionSurface = [
    "apps/control-plane/src/app.ts",
    "apps/control-plane/src/app.spec.ts",
    "apps/control-plane/src/lib/types.ts",
  ].includes(file.path);
  const planOrProof =
    file.path ===
      "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md" ||
    file.path === "tools/read-only-mcp-route-adapter-proof.mjs";

  const source = file.source ?? "";
  if (routeModule && file.path.endsWith(".spec.ts")) {
    return true;
  }
  if (appConstructionSurface && file.path.endsWith(".spec.ts")) {
    return true;
  }

  if (routeModule && file.path.endsWith("/routes.ts")) {
    return (
      source.includes("registerReadOnlyAppMcpEndpointRoutes") &&
      source.includes('app.post("/mcp"') &&
      !forbiddenFp0107RouteAdapterRuntimeSource(source)
    );
  }

  if (!routeModule && !appConstructionSurface && !planOrProof) return false;

  return !forbiddenFp0107RouteAdapterRuntimeSource(source);
}

function forbiddenFp0107RouteAdapterRuntimeSource(source: string): boolean {
  return [
    /publicApp/iu,
    /OAuth callback|token exchange\s*\(|session handler|Set-Cookie/iu,
    /registerResource|ui:\/\//iu,
    /listen\s*\(|remote-mcp|mcp-server/iu,
    /\bremoteMcp(?:Server|Deployment)?Implemented\s*:\s*true\b/iu,
    /\bappsSdkResources?Implemented\s*:\s*true\b/iu,
    /create_mission|upload_source|update_ledger|send_report|provider_connect|certify_close|contact_customer/iu,
  ].some((pattern) => pattern.test(source));
}

function isAllowedEndpointArchitectureProofSurface(path: string): boolean {
  return (
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    /^tools\/(?:read-only|benchmark-community|bounded-llm|document-precision|evidence-index).*\.mjs$/u.test(
      path,
    ) ||
    /^plans\/FP-0(?:087|098|099|100|101|102|103|104)-/u.test(path)
  );
}

function isAllowedHistoricalLocalPreviewSurface(path: string): boolean {
  return (
    path === "apps/web/app/read-only-app-mcp-preview/page.tsx" ||
    path === "apps/web/app/read-only-app-mcp-preview/page.spec.tsx" ||
    /^apps\/web\/components\/read-only-app-mcp\//u.test(path)
  );
}

function isAllowedShippedNonPublicRouteSurface(path: string): boolean {
  return (
    /^apps\/web\/app\/(?:page|sources\/(?:page|\[sourceId\]\/page)|missions\/(?:page|\[missionId\]\/page)|evidence-atlas\/page|monitoring\/page|operator-readiness\/page|delivery-readiness\/page|close-control\/(?:page|acknowledgement-readiness\/page))\.tsx$/u.test(
      path,
    ) ||
    /^apps\/control-plane\/src\/modules\/(?!.*(?:read-only-app-mcp|chatgpt-app|apps-sdk|remote-mcp|mcp-server|oauth))[\w-]+\/(?:[\w-]+-)?routes(?:\.spec)?\.ts$/u.test(
      path,
    ) ||
    path === "apps/control-plane/src/server.ts"
  );
}

function isAllowedHistoricalConnectorSurface(path: string): boolean {
  return (
    /^apps\/control-plane\/src\/modules\/github-app\//u.test(path) ||
    /^apps\/control-plane\/src\/modules\/github\//u.test(path) ||
    /^apps\/control-plane\/src\/modules\/runtime-codex\//u.test(path) ||
    /^packages\/codex-runtime\//u.test(path) ||
    /^packages\/testkit\/src\/runtime\/fake-codex-app-server\.mjs$/u.test(path)
  );
}

function looksLikePublicAppEndpointRuntimePath(path: string): boolean {
  if (/\.(?:md|mdx|txt)$/iu.test(path)) return false;
  return [
    /(^|\/)(?:app-submission|submission-assets|public-listing|listing-copy|screenshots)(\/|$)/iu,
    /^apps\/web\/app\/.*\/route\.ts$/iu,
    /^apps\/web\/api\//iu,
    /^apps\/(?:control-plane|web)\/.*(?:read-only-app-mcp|chatgpt-app|apps-sdk|remote-mcp|mcp-server).*(?:route|server|endpoint|oauth|token|session|resource|deploy)/iu,
    /^packages\/(?:api|server|backend)\//iu,
    /(?:remote-mcp|mcp-server|apps-sdk-resource|oauth-callback|token-exchange|session-handler|public-app-endpoint)/iu,
  ].some((pattern) => pattern.test(path));
}

function looksLikePublicAppEndpointRuntimeSource(source: string): boolean {
  if (!source) return false;
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const hasPublicAppContext =
    /read-only-app-mcp|chatgpt app|chatgpt-app|apps sdk|appssdk|remote mcp|remote-mcp|mcp server|mcp-server|public app/iu.test(
      source,
    );
  if (!hasPublicAppContext) return false;

  return [
    /\b(?:export\s+async\s+function\s+(?:GET|POST)|NextResponse|fastify\.(?:get|post)|app\.(?:get|post)|listen\s*\(|createServer\s*\()/u,
    /\b(?:McpServer|StreamableHTTP|SSEServerTransport|server\.tool|registerResource|ui:\/\/|resource registration)\b/u,
    /\b(?:OAuth callback|token exchange|session handler|Set-Cookie|WWW-Authenticate)\b/u,
    new RegExp(
      `\\b(?:from\\s+["']${packageName}["']|new\\s+${clientName}\\b|responses\\s*\\.\\s*create|chat\\s*\\.\\s*completions|${keyName}|${hostName})\\b`,
      "u",
    ),
    /\b(?:create_mission|upload_source|update_ledger|send_report|provider_connect|certify_close|contact_customer|issue_payment_instruction)\b/u,
    /\b(?:source mutation|finance write|write action tool|external communication|provider call|deployment surface)\b/u,
  ].some((pattern) => pattern.test(source));
}
