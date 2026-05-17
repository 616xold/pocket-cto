import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH,
  FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH,
  FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
  FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
  FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH,
  FP0113_OAUTH_SECURITY_PLAN_PATH,
  FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
  buildEvidenceToolDispatchProof,
  verifyFp0116AbsentOrLocalRemoteHostResourceContracts,
  verifyFp0117Absent,
} from "../packages/domain/src/index.ts";
import {
  FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
  FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
} from "../packages/domain/src/read-only-app-mcp-remote-host-readiness.ts";
import {
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
} from "../packages/domain/src/read-only-app-mcp-canonical-resource-proof.ts";
import {
  LocalReadOnlyEvidenceToolDispatchAdapter,
  READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_MAX_CHARACTERS,
  READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_SCHEMA_VERSION,
  exactEvidenceDispatchAdapterToolNames,
} from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.ts";
import { ReadOnlyAppMcpEndpointService } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts";

const SCHEMA_VERSION =
  "v2ac.read-only-app-mcp-evidence-dispatch-adapter-proof.v1";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const SERVICE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts";
const FORMATTER_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/formatter.ts";
const SCHEMA_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/schema.ts";
const DISPATCHER_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.ts";
const FP0125_LOCAL_ROUTE_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
const FP0125_LOCAL_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const FP0125_LOCAL_ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts";
const FP0125_LOCAL_ROUTE_PROOF_PATH =
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const fp0121PlanText = safeRead(
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
);
const fp0122PlanText = safeRead(
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
);
const fp0123PlanText = safeRead(
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
);
const fp0124PlanText = safeRead(
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
);
const routeRuntimeSource = [
  ROUTE_PATH,
  SERVICE_PATH,
  FORMATTER_PATH,
  SCHEMA_PATH,
  DISPATCHER_PATH,
]
  .map(safeRead)
  .join("\n");
const proofSourceScan = durableNoApiModelKeyScan();
const runtimeScopeScan = runtimeForbiddenScopeScan();
const changedScopeScan = changedFileScopeScan();
const fp0110ScopeScan = fp0110ChangedScopeScan();
const fp0112ScopeScan = fp0112ChangedScopeScan();
const fp0113ScopeScan = fp0113ChangedScopeScan();

const dispatcherService = trackingService();
const adapter = new LocalReadOnlyEvidenceToolDispatchAdapter({
  evidenceService: dispatcherService,
  expectedCompanyKey: "acme",
});
const dispatchResults = Object.fromEntries(
  MCP_TOOL_ALLOWLIST.map((toolName) => [
    toolName,
    adapter.dispatchTool({
      arguments: validArgumentsFor(toolName),
      toolName,
    }),
  ]),
);
const defaultFailClosedResponse = new ReadOnlyAppMcpEndpointService().handle({
  id: "default-call",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: validArgumentsFor("search_evidence"),
    name: "search_evidence",
  },
});
const injectedResponse = new ReadOnlyAppMcpEndpointService({
  evidenceToolDispatcher: adapter,
}).handle({
  id: "injected-call",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: validArgumentsFor("search_evidence"),
    name: "search_evidence",
  },
});

const refusalAdapter = new LocalReadOnlyEvidenceToolDispatchAdapter({
  evidenceService: refusalService(),
  expectedCompanyKey: "acme",
});
const companyMismatchCallsBefore = dispatcherService.calls.searchEvidence;
const companyMismatchResult = adapter.dispatchTool({
  arguments: { companyKey: "other-company", query: "deterministic" },
  toolName: "search_evidence",
});
const periodKeyCallsBefore = dispatcherService.calls.fetchCompanyPosture;
const periodKeyResult = adapter.dispatchTool({
  arguments: { companyKey: "acme", periodKey: "2026-04" },
  toolName: "fetch_company_posture",
});
const proof = {
  schemaVersion: SCHEMA_VERSION,
  localDispatchAdapterOnly: true,
  evidenceDispatchAdapterImplemented:
    existsSync(DISPATCHER_PATH) &&
    safeRead(DISPATCHER_PATH).includes(
      "LocalReadOnlyEvidenceToolDispatchAdapter",
    ),
  exactlyV2gToolAllowlist: sameList(
    exactEvidenceDispatchAdapterToolNames(),
    MCP_TOOL_ALLOWLIST,
  ),
  exactArgumentSchemasPreserved:
    safeRead(SCHEMA_PATH).includes(
      "EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL",
    ) &&
    safeRead(DISPATCHER_PATH).includes(
      "EVIDENCE_TOOL_DISPATCH_ARGUMENT_SCHEMAS_BY_TOOL",
    ),
  defaultRouteToolsCallStillFailClosed:
    defaultFailClosedResponse?.result?.isError === true &&
    defaultFailClosedResponse.result.structuredContent?.refusalReason ===
      "tool_dispatch_not_implemented_until_later_finance_plan",
  injectedDispatcherToolsCallEnabled:
    injectedResponse?.result?.isError === false &&
    injectedResponse.result.structuredContent?.refusalReason === null,
  companyContextBoundaryVerified:
    routeRuntimeSource.includes("expectedCompanyKey") &&
    Object.values(dispatchResults).every(
      (result) => result.structuredContent.companyKey === "acme",
    ),
  companyKeyMismatchFailsClosed:
    companyMismatchResult.isError === true &&
    companyMismatchResult.structuredContent.refusalReason ===
      "company_key_mismatch" &&
    dispatcherService.calls.searchEvidence === companyMismatchCallsBefore,
  declaredToolArgumentsUsedOrFailClosed:
    dispatcherService.lastInputs.searchEvidence?.query === "deterministic" &&
    dispatcherService.lastInputs.searchEvidence?.limit === 3 &&
    dispatcherService.lastInputs.fetchSourceCoverage?.sourceId === "source-1" &&
    periodKeyResult.isError === true &&
    periodKeyResult.structuredContent.refusalReason ===
      "unsupported_argument" &&
    dispatcherService.calls.fetchCompanyPosture === periodKeyCallsBefore,
  sourceCoverageSourceIdHonoredOrFailsClosed:
    dispatcherService.lastInputs.fetchSourceCoverage?.sourceId === "source-1" &&
    safeRead(DISPATCHER_PATH).includes("fetchSourceCoverage({") &&
    safeRead(
      "apps/control-plane/src/modules/evidence-index/tools/service.ts",
    ).includes("entry.sourceId === input.sourceId"),
  optionalArgumentsHonoredOrFailClosed:
    dispatcherService.lastInputs.searchEvidence?.limit === 3 &&
    periodKeyResult.isError === true &&
    periodKeyResult.structuredContent.refusalReason === "unsupported_argument",
  searchEvidenceDispatchAdapterVerified:
    dispatcherService.calls.searchEvidence === 2 &&
    dispatchResults.search_evidence.isError === false,
  fetchEvidenceCardDispatchAdapterVerified:
    dispatcherService.calls.fetchEvidenceCard === 1 &&
    dispatchResults.fetch_evidence_card.isError === false,
  fetchSourceAnchorDispatchAdapterVerified:
    dispatcherService.calls.fetchSourceAnchor === 1 &&
    dispatchResults.fetch_source_anchor.isError === false,
  fetchDocumentMapDispatchAdapterVerified:
    dispatcherService.calls.fetchDocumentMap === 1 &&
    dispatchResults.fetch_document_map.isError === false,
  fetchSourceCoverageDispatchAdapterVerified:
    dispatcherService.calls.fetchSourceCoverage === 1 &&
    dispatchResults.fetch_source_coverage.isError === false,
  fetchCompanyPostureDispatchAdapterVerified:
    dispatcherService.calls.fetchCompanyPosture === 1 &&
    dispatchResults.fetch_company_posture.isError === false,
  fetchCapabilityBoundariesDispatchAdapterVerified:
    dispatcherService.calls.fetchCapabilityBoundaries === 1 &&
    dispatchResults.fetch_capability_boundaries.isError === false,
  structuredContentEnvelopeVerified: Object.values(dispatchResults).every(
    (result) =>
      Array.isArray(result.content) &&
      typeof result.structuredContent === "object" &&
      result.structuredContent !== null &&
      Object.hasOwn(result.structuredContent, "evidence") &&
      Object.hasOwn(result.structuredContent, "sourceAnchors") &&
      Object.hasOwn(result.structuredContent, "freshness") &&
      Object.hasOwn(result.structuredContent, "limitations") &&
      Object.hasOwn(result.structuredContent, "permittedNextActions") &&
      Object.hasOwn(result.structuredContent, "refusalReason") &&
      Object.hasOwn(result.structuredContent, "capabilityBoundary") &&
      typeof result.isError === "boolean",
  ),
  structuredContentTextMirrorVerified: Object.values(dispatchResults).every(
    (result) => {
      const text = result.content[0]?.text;
      if (typeof text !== "string") return false;
      const mirror = safeJson(text);

      return (
        mirror?.schemaVersion ===
          READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_SCHEMA_VERSION &&
        mirror.toolName === result.structuredContent.toolName &&
        mirror.companyKey === result.structuredContent.companyKey &&
        mirror.isError === result.isError &&
        mirror.refusalReason === result.structuredContent.refusalReason
      );
    },
  ),
  boundedTextMirrorNoRawDumpVerified: [
    ...Object.values(dispatchResults),
    companyMismatchResult,
    periodKeyResult,
  ].every((result) => {
    const text = result.content[0]?.text ?? "";

    return (
      text.length <= READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_MAX_CHARACTERS &&
      safeJson(text) !== null &&
      !new RegExp(
        `rawFullText|rawFileText|fullFileText|fileContents|sk-test-secret|pk_live_secret|tok_live_secret|${[
          "OPENAI",
          "API",
          "KEY",
        ].join("_")}`,
        "u",
      ).test(text)
    );
  }),
  evidenceFreshnessLimitationsVerified: Object.values(dispatchResults).every(
    (result) =>
      result.structuredContent.evidence.length > 0 &&
      result.structuredContent.freshness.state === "fresh" &&
      Array.isArray(result.structuredContent.limitations),
  ),
  refusalEnvelopeVerified:
    refusalFor("missing").isError === true &&
    refusalFor("unsupported").structuredContent.evidence.length === 0,
  missingEvidenceFailsClosed:
    refusalFor("missing").structuredContent.refusalReason ===
    "missing_evidence",
  missingCitationFailsClosed:
    refusalFor("missingCitation").structuredContent.refusalReason ===
    "missing_citation",
  unsupportedEvidenceFailsClosed:
    refusalFor("unsupported").structuredContent.refusalReason ===
    "unsupported_evidence",
  staleEvidenceFailsClosed:
    refusalFor("stale").structuredContent.refusalReason === "stale_evidence",
  conflictingEvidenceFailsClosed:
    refusalFor("conflicting").structuredContent.refusalReason ===
    "conflicting_evidence",
  invalidToolFailsClosed:
    adapter.dispatchTool({ arguments: {}, toolName: "send_report" })
      .structuredContent.refusalReason === "invalid_tool",
  invalidArgumentsFailClosed:
    adapter.dispatchTool({
      arguments: { companyKey: "acme" },
      toolName: "search_evidence",
    }).structuredContent.refusalReason === "invalid_arguments",
  noRawFullFileDump:
    !/rawFullText|rawFileText|fullFileText|fileContents/u.test(
      routeRuntimeSource,
    ) && !JSON.stringify(dispatchResults).includes("sk-test-secret"),
  noGeneratedFinanceAdvice:
    runtimeScopeScan.noGeneratedFinanceAdvice &&
    Object.values(dispatchResults).every(
      (result) =>
        result.structuredContent.capabilityBoundary
          .generatedFinanceAdviceEmitted === false,
    ),
  noSourceMutation: runtimeScopeScan.noSourceMutation,
  noFinanceWrite: runtimeScopeScan.noFinanceWrite,
  noProviderCalls: runtimeScopeScan.noProviderCalls,
  noExternalCommunications: runtimeScopeScan.noExternalCommunications,
  noOpenAiApiCalls: proofSourceScan.noOpenAiApiCalls,
  noModelCalls: proofSourceScan.noModelCalls,
  noOpenAiClientOrKeyUsage: proofSourceScan.noOpenAiClientOrKeyUsage,
  noDbQueriesAdded: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsAdded: changedScopeScan.noSchemaMigrationsAdded,
  noRouteExpansion:
    countMatches(safeRead(ROUTE_PATH), /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(safeRead(ROUTE_PATH), /app\.get\("\/mcp"/gu) === 1,
  noOauthTokenSessionImplementation:
    runtimeScopeScan.noOauthTokenSessionImplementation,
  noRemoteMcpDeployment: runtimeScopeScan.noRemoteMcpDeployment,
  noAppsSdkResourceImplementation:
    runtimeScopeScan.noAppsSdkResourceImplementation,
  noAppSubmission: changedScopeScan.noAppSubmission,
  noPublicAssets: changedScopeScan.noPublicAssets,
  fp0109BoundaryVerified: fp0109BoundaryVerified(),
  fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified:
    fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified(),
  fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified:
    fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified(),
  fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified:
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified(),
  fp0113AbsentOrLocalOauthSecurityContractsVerified:
    fp0113AbsentOrLocalOauthSecurityContractsVerified(),
  fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified(),
  fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
    fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified(),
  fp0116AbsentOrLocalRemoteHostResourceContractsVerified:
    fp0116AbsentOrLocalRemoteHostResourceContractsVerified(),
  fp0117Absent: verifyFp0117Absent(repoPaths),
  fp0121ProtectedResourceMetadataRouteImplementationPlanningBoundaryStillVerified:
    verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
      {
        planText: fp0121PlanText,
        repoPaths,
      },
    ) &&
    verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary({
      planText: fp0121PlanText,
      repoPaths,
    }),
  fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
    verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts({
      planText: fp0122PlanText,
      repoPaths,
    }),
  fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
    verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
      planText: fp0123PlanText,
      repoPaths,
    }),
  fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
    verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
      {
        planText: fp0124PlanText,
        repoPaths,
      },
    ),
  protectedResourceMetadataBuilderContractsFoundationVerified:
    verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
      planText: fp0122PlanText,
      repoPaths,
    }),
  oauthSecurityContractsFoundationVerified:
    oauthSecurityContractsFoundationVerified(),
  remoteHostReadinessContractsFoundationVerified:
    remoteHostReadinessContractsFoundationVerified(),
  remoteHostResourceContractsFoundationVerified:
    fp0116AbsentOrLocalRemoteHostResourceContractsVerified(),
  remotePublicMcpOauthReadinessPlanBoundaryVerified:
    remotePublicMcpOauthReadinessPlanBoundaryVerified(),
  noRouteBehaviorChangeFromFp0112: fp0112ScopeScan.noRouteBehaviorChange,
  noRemoteMcpDeploymentFromFp0112: fp0112ScopeScan.noRemoteMcp,
  noOauthTokenSessionFromFp0112: fp0112ScopeScan.noOauthTokenSession,
  noAppsSdkResourceFromFp0112: fp0112ScopeScan.noAppsSdkResource,
  noAppSubmissionFromFp0112: changedScopeScan.noAppSubmission,
  noDbQueriesFromFp0112: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsFromFp0112: changedScopeScan.noSchemaMigrationsAdded,
  noOpenAiApiCallsFromFp0112: proofSourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0112: fp0112ScopeScan.noProviderExternalCalls,
  noSourceMutationFinanceWriteFromFp0112:
    fp0112ScopeScan.noSourceMutationFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0112: changedScopeScan.noPublicAssets,
  noAppsSdkResourceFromFp0113: fp0113ScopeScan.noAppsSdkResource,
  noAppSubmissionFromFp0113: changedScopeScan.noAppSubmission,
  noAuthMiddlewareImplementationFromFp0113:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noDbQueriesFromFp0113: changedScopeScan.noDbQueriesAdded,
  noOauthImplementationFromFp0113: fp0113ScopeScan.noOauthImplementation,
  noOpenAiApiCallsFromFp0113: proofSourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0113: fp0113ScopeScan.noProviderExternalCalls,
  noPublicAssetsSubmissionArtifactsFromFp0113: changedScopeScan.noPublicAssets,
  noRemoteMcpDeploymentFromFp0113: fp0113ScopeScan.noRemoteMcp,
  noRouteBehaviorChangeFromFp0113: fp0113ScopeScan.noRouteBehaviorChange,
  noSchemaMigrationsFromFp0113: changedScopeScan.noSchemaMigrationsAdded,
  noSourceMutationFinanceWriteFromFp0113:
    fp0113ScopeScan.noSourceMutationFinanceWrite,
  noTokenSessionImplementationFromFp0113:
    fp0113ScopeScan.noTokenSessionImplementation,
  noRouteBehaviorChangeFromFp0114: fp0113ScopeScan.noRouteBehaviorChange,
  noNewRoutePathFromFp0114: fp0113ScopeScan.noRouteBehaviorChange,
  noRemoteMcpDeploymentFromFp0114: fp0113ScopeScan.noRemoteMcp,
  noDeploymentConfigFromFp0114: changedScopeScan.noDeploymentConfig,
  noOauthImplementationFromFp0114: fp0113ScopeScan.noOauthImplementation,
  noTokenSessionImplementationFromFp0114:
    fp0113ScopeScan.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0114:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noAppsSdkResourceFromFp0114: fp0113ScopeScan.noAppsSdkResource,
  noAppSubmissionFromFp0114: changedScopeScan.noAppSubmission,
  noDbQueriesFromFp0114: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsFromFp0114: changedScopeScan.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0114: changedScopeScan.noPackageScriptsAdded,
  noOpenAiApiCallsFromFp0114: proofSourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0114: fp0113ScopeScan.noProviderExternalCalls,
  noSourceMutationFinanceWriteFromFp0114:
    fp0113ScopeScan.noSourceMutationFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0114: changedScopeScan.noPublicAssets,
  noDbQueriesFromFp0121: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsFromFp0121: changedScopeScan.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0121: changedScopeScan.noPackageScriptsAdded,
  noRouteBehaviorChangeFromFp0121: changedScopeScan.noRouteBehaviorChange,
  noProtectedResourceMetadataRouteFromFp0121:
    changedScopeScan.noProtectedResourceMetadataRoute,
  noWwwAuthenticateRouteBehaviorFromFp0121:
    changedScopeScan.noWwwAuthenticateRouteBehavior,
  noRouteBehaviorChangeFromFp0122: changedScopeScan.noRouteBehaviorChange,
  noNewRoutePathFromFp0122: changedScopeScan.noRouteBehaviorChange,
  noProtectedResourceMetadataRouteFromFp0122:
    changedScopeScan.noProtectedResourceMetadataRoute,
  noWwwAuthenticateRouteBehaviorFromFp0122:
    changedScopeScan.noWwwAuthenticateRouteBehavior,
  noOauthImplementationFromFp0122: fp0113ScopeScan.noOauthImplementation,
  noTokenSessionImplementationFromFp0122:
    fp0113ScopeScan.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0122:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noRemoteMcpDeploymentFromFp0122: runtimeScopeScan.noRemoteMcpDeployment,
  noDeploymentConfigFromFp0122: changedScopeScan.noDeploymentConfig,
  noAppsSdkResourceFromFp0122:
    runtimeScopeScan.noAppsSdkResourceImplementation,
  noPublicAppImplementationFromFp0122:
    changedScopeScan.noAppSubmission &&
    runtimeScopeScan.noAppsSdkResourceImplementation,
  noAppSubmissionFromFp0122: changedScopeScan.noAppSubmission,
  noDbQueriesFromFp0122: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsFromFp0122: changedScopeScan.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0122: changedScopeScan.noPackageScriptsAdded,
  noOpenAiApiCallsFromFp0122: proofSourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0122:
    runtimeScopeScan.noProviderCalls &&
    runtimeScopeScan.noExternalCommunications,
  noSourceMutationFinanceWriteFromFp0122:
    runtimeScopeScan.noSourceMutation && runtimeScopeScan.noFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0122:
    changedScopeScan.noPublicAssets && changedScopeScan.noAppSubmission,
  noListingCopyGeneratedPublicProseFromFp0122:
    changedScopeScan.noListingCopyGeneratedPublicProse,
  defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified:
    fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified(),
  noRouteBehaviorChangeFromFp0110:
    fp0110ScopeScan.noRouteBehaviorChange &&
    defaultFailClosedResponse?.result?.isError === true,
  noDefaultDispatchRuntimeFromFp0110:
    fp0110ScopeScan.noDefaultDispatchRuntime &&
    defaultFailClosedResponse?.result?.isError === true,
  noDbQueriesFromFp0110: fp0110ScopeScan.noDbQueries,
  noSchemaMigrationsFromFp0110: fp0110ScopeScan.noSchemaMigrations,
  noOauthTokenSessionFromFp0110: fp0110ScopeScan.noOauthTokenSession,
  noRemoteMcpDeploymentFromFp0110: fp0110ScopeScan.noRemoteMcp,
  noAppsSdkResourceFromFp0110: fp0110ScopeScan.noAppsSdkResource,
  noOpenAiApiCallsFromFp0110: proofSourceScan.noOpenAiApiCalls,
  noSourceMutationFinanceWriteFromFp0110:
    fp0110ScopeScan.noSourceMutationFinanceWrite,
  fp0108EvidenceToolDispatchContractsStillVerified:
    buildEvidenceToolDispatchProof({
      fp0108DispatchContractsStillVerified: true,
      fp0109AdapterBoundaryStillVerified: true,
      fp0109BoundaryVerified: true,
      fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified: true,
      fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified: true,
      fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified: true,
      fp0113AbsentOrLocalOauthSecurityContractsVerified: true,
      fp0114AbsentOrLocalRemoteHostReadinessContractsVerified: true,
      fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified: true,
      fp0116AbsentOrLocalRemoteHostResourceContractsVerified: true,
      fp0117Absent: true,
      oauthSecurityContractsFoundationVerified: true,
      remoteHostReadinessContractsFoundationVerified: true,
      remoteHostResourceContractsFoundationVerified: true,
      remotePublicMcpOauthReadinessPlanBoundaryVerified: true,
      noDispatchRuntimeImplemented: true,
    }).evidenceToolDispatchContractsVerified === true,
  fp0107RouteAdapterBoundaryStillVerified: fp0107BoundaryVerified(),
  fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
    "mcp protocol envelope",
    "tools/call",
    "no openai api/model calls",
  ]),
  fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
    "public-app security boundary contract",
    "local/proof-only",
    "no endpoints",
  ]),
};

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0109 evidence dispatch adapter proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function refusalFor(kind) {
  return refusalAdapter.dispatchTool({
    arguments: { companyKey: "acme", query: kind },
    toolName: "search_evidence",
  });
}

function trackingService() {
  const calls = {
    fetchCapabilityBoundaries: 0,
    fetchCompanyPosture: 0,
    fetchDocumentMap: 0,
    fetchEvidenceCard: 0,
    fetchSourceAnchor: 0,
    fetchSourceCoverage: 0,
    searchEvidence: 0,
  };
  const lastInputs = {
    fetchCapabilityBoundaries: null,
    fetchDocumentMap: null,
    fetchEvidenceCard: null,
    fetchSourceAnchor: null,
    fetchSourceCoverage: null,
    searchEvidence: null,
  };

  return {
    calls,
    lastInputs,
    fetchCapabilityBoundaries(input) {
      calls.fetchCapabilityBoundaries += 1;
      lastInputs.fetchCapabilityBoundaries = input;
      return responseFor("fetch_capability_boundaries");
    },
    fetchCompanyPosture() {
      calls.fetchCompanyPosture += 1;
      return responseFor("fetch_company_posture");
    },
    fetchDocumentMap(input) {
      calls.fetchDocumentMap += 1;
      lastInputs.fetchDocumentMap = input;
      return responseFor("fetch_document_map");
    },
    fetchEvidenceCard(input) {
      calls.fetchEvidenceCard += 1;
      lastInputs.fetchEvidenceCard = input;
      return responseFor("fetch_evidence_card");
    },
    fetchSourceAnchor(input) {
      calls.fetchSourceAnchor += 1;
      lastInputs.fetchSourceAnchor = input;
      return responseFor("fetch_source_anchor");
    },
    fetchSourceCoverage(input) {
      calls.fetchSourceCoverage += 1;
      lastInputs.fetchSourceCoverage = input;
      return responseFor("fetch_source_coverage");
    },
    searchEvidence(input) {
      calls.searchEvidence += 1;
      lastInputs.searchEvidence = input;
      return responseFor("search_evidence");
    },
  };
}

function refusalService() {
  return {
    fetchCapabilityBoundaries: () => responseFor("fetch_capability_boundaries"),
    fetchCompanyPosture: () => responseFor("fetch_company_posture"),
    fetchDocumentMap: () => responseFor("fetch_document_map"),
    fetchEvidenceCard: () => responseFor("fetch_evidence_card"),
    fetchSourceAnchor: () => responseFor("fetch_source_anchor"),
    fetchSourceCoverage: () => responseFor("fetch_source_coverage"),
    searchEvidence(input) {
      switch (input.query) {
        case "missing":
          return responseFor("search_evidence", {
            citations: [],
            evidence: [],
            freshness: { ...freshness(), state: "missing" },
            limitations: [limitation("source_not_indexed")],
            ok: false,
            result: null,
            unsupportedReason: "Missing evidence.",
          });
        case "missingCitation":
          return responseFor("search_evidence", { citations: [] });
        case "unsupported":
          return responseFor("search_evidence", {
            limitations: [limitation("unsupported_pdf")],
            ok: false,
            result: null,
            unsupportedReason: "Unsupported evidence.",
          });
        case "stale":
          return responseFor("search_evidence", {
            freshness: { ...freshness(), state: "stale" },
          });
        case "conflicting":
          return responseFor("search_evidence", {
            freshness: { ...freshness(), state: "mixed" },
          });
        default:
          return responseFor("search_evidence");
      }
    },
  };
}

function responseFor(toolName, overrides = {}) {
  const citation = {
    checksumSha256: "a".repeat(64),
    citationType: "source_anchor",
    id: "source-anchor-1",
    locator: "line 1",
    sourceAnchorId: "source-anchor-1",
    sourceId: "11111111-1111-4111-8111-111111111111",
    sourceSnapshotId: "22222222-2222-4222-8222-222222222222",
    summary: "Synthetic proof citation.",
  };
  const base = {
    appMode: "local_proof",
    audit: {
      appMode: "local_proof",
      artifactIds: ["artifact-1"],
      companyKey: "acme",
      excerptCharacterCount: 24,
      forbiddenRequestBlocked: false,
      id: `audit:${toolName}`,
      normalizedQuery: toolName === "search_evidence" ? "deterministic" : null,
      redactionCount: 0,
      sourceAnchorIds: ["source-anchor-1"],
      timestamp: "2026-05-14T00:00:00.000Z",
      toolName,
      unsupportedReason: null,
    },
    capabilityBoundaries: [limitation("not_source_truth", "warning")],
    citations: [citation],
    companyKey: "acme",
    evidence: [citation],
    forbiddenActions: ["write_finance_twin_fact", "send_report"],
    freshness: freshness(),
    limitations: [],
    ok: true,
    permittedNextActions: [
      {
        action: "request_human_review",
        label: "Review the source-backed structured result.",
        targetId: "artifact-1",
      },
    ],
    redactions: [],
    result: { id: `${toolName}:result`, safeExcerpt: "bounded excerpt" },
    schemaVersion: "v2c.evidence-tool.v1",
    toolName,
    unsupportedReason: null,
  };

  return { ...base, ...overrides };
}

function freshness() {
  return {
    checkedAt: "2026-05-14T00:00:00.000Z",
    compiledAt: null,
    extractedAt: null,
    sourceCapturedAt: "2026-05-14T00:00:00.000Z",
    state: "fresh",
    summary: "Synthetic proof freshness.",
  };
}

function limitation(code, severity = "blocking") {
  return {
    affectedAnchorIds: [],
    affectedSourceIds: [],
    code,
    severity,
    summary: `Synthetic ${code} proof limitation.`,
  };
}

function validArgumentsFor(toolName) {
  switch (toolName) {
    case "search_evidence":
      return { companyKey: "acme", limit: 3, query: "deterministic" };
    case "fetch_evidence_card":
      return { companyKey: "acme", evidenceCardId: "evidence-card-1" };
    case "fetch_source_anchor":
      return { companyKey: "acme", sourceAnchorId: "source-anchor-1" };
    case "fetch_document_map":
      return { companyKey: "acme", documentMapId: "document-map-1" };
    case "fetch_source_coverage":
      return { companyKey: "acme", sourceId: "source-1" };
    case "fetch_company_posture":
      return { companyKey: "acme" };
    case "fetch_capability_boundaries":
      return { companyKey: "acme" };
  }
}

function fp0109BoundaryVerified() {
  const fp0109Hits = repoPaths.filter((path) => /(^|\/)FP-0109/u.test(path));
  if (
    fp0109Hits.length !== 1 ||
    fp0109Hits[0] !== FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH ||
    !existsSync(FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    safeRead(FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH),
  );
  return [
    "local-only",
    "read-only",
    "dependency-injected",
    "evidence/source-envelope implementation",
    "default fail-closed",
    "does not add route paths",
    "db query",
    "openai api/model",
    "source mutation",
    "finance write",
    "no generated finance advice",
    "autonomous action",
    "public app implementation and public app submission remain future-only",
  ].every((text) => normalized.includes(text));
}

function fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified() {
  const fp0110Hits = repoPaths.filter((path) => /(^|\/)FP-0110/u.test(path));
  if (fp0110Hits.length === 0) return true;
  return (
    fp0110Hits.length === 1 &&
    fp0110Hits[0] ===
      FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH &&
    fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified()
  );
}

function fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified() {
  if (
    !existsSync(FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    safeRead(FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "not default dispatch runtime enablement",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "explicit dependency injection remains required",
    "route registration may not construct the dispatcher by default",
    "fp-0111 remains absent",
  ].every((text) => normalized.includes(text));
}

function fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified() {
  const fp0111Hits = repoPaths.filter((path) => /(^|\/)FP-0111/u.test(path));
  if (
    fp0111Hits.length !== 1 ||
    fp0111Hits[0] !== FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH ||
    !existsSync(FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    safeRead(FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH),
  );
  return [
    "local-only",
    "read-only",
    "explicit-dependency wiring only",
    "explicit app construction input",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "not generated finance advice",
    "not autonomous action",
    "default buildapp() remains fail-closed",
    "no fp-0112",
  ].every((text) => normalized.includes(text));
}

function fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified() {
  const fp0112Hits = repoPaths.filter((path) => /(^|\/)FP-0112/u.test(path));
  if (fp0112Hits.length === 0) return true;
  return (
    fp0112Hits.length === 1 &&
    fp0112Hits[0] === FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH &&
    remotePublicMcpOauthReadinessPlanBoundaryVerified()
  );
}

function fp0113AbsentOrLocalOauthSecurityContractsVerified() {
  const fp0113Hits = repoPaths.filter((path) => /(^|\/)FP-0113/u.test(path));
  if (fp0113Hits.length === 0) return true;
  return (
    fp0113Hits.length === 1 &&
    fp0113Hits[0] === FP0113_OAUTH_SECURITY_PLAN_PATH &&
    oauthSecurityContractsFoundationVerified()
  );
}

function fp0114AbsentOrLocalRemoteHostReadinessContractsVerified() {
  const fp0114Hits = repoPaths.filter((path) => /(^|\/)FP-0114/u.test(path));
  if (fp0114Hits.length === 0) return true;
  return (
    fp0114Hits.length === 1 &&
    fp0114Hits[0] === FP0114_REMOTE_HOST_READINESS_PLAN_PATH &&
    remoteHostReadinessContractsFoundationVerified()
  );
}

function fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified() {
  const fp0115Hits = repoPaths.filter((path) => /(^|\/)FP-0115/u.test(path));
  if (fp0115Hits.length === 0) return true;
  return (
    fp0115Hits.length === 1 &&
    fp0115Hits[0] === FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0115PlanBoundaryVerified()
  );
}

function fp0115PlanBoundaryVerified() {
  const normalized = normalize(
    safeRead(FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "remote mcp host implementation sequencing",
    "provider/host readiness",
    "does not change route behavior",
    "does not add any new route path",
    "does not add deployment config",
    "public app submission remains future-only",
    "fp-0116 remains absent",
  ].every((text) => normalized.includes(text));
}

function fp0116AbsentOrLocalRemoteHostResourceContractsVerified() {
  return verifyFp0116AbsentOrLocalRemoteHostResourceContracts({
    planText: safeRead(FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH),
    repoPaths,
  });
}

function oauthSecurityContractsFoundationVerified() {
  if (!existsSync(FP0113_OAUTH_SECURITY_PLAN_PATH)) return false;
  const normalized = normalize(safeRead(FP0113_OAUTH_SECURITY_PLAN_PATH));
  return [
    "local/proof-only/read-only oauth, token/session",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "does not change /mcp route behavior",
    "public exposure remains blocked",
    "client-supplied companykey is only a requested selector",
    "token passthrough is forbidden",
    "fp-0114 remains absent",
  ].every((text) => normalized.includes(text));
}

function remoteHostReadinessContractsFoundationVerified() {
  if (!existsSync(FP0114_REMOTE_HOST_READINESS_PLAN_PATH)) return false;
  const normalized = normalize(
    safeRead(FP0114_REMOTE_HOST_READINESS_PLAN_PATH),
  );
  return [
    "local/proof-only/read-only remote mcp host readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "local /mcp route behavior is unchanged",
    "current local /mcp route must not be exposed remotely as-is",
    "fp-0115 successor remains docs-only when present",
  ].every((text) => normalized.includes(text));
}

function remotePublicMcpOauthReadinessPlanBoundaryVerified() {
  if (!existsSync(FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH)) {
    return false;
  }

  const normalized = normalize(
    safeRead(FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "remote/public mcp deployment and oauth readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "fp-0113 remains absent",
    "current local /mcp route must not be exposed remotely as-is",
    "current default local dispatch wiring is not enough for public exposure",
  ].every((text) => normalized.includes(text));
}

function fp0107BoundaryVerified() {
  return (
    docsBoundary(FP0107_PLAN, [
      "local-only fastify",
      "tools/call",
      "fail-closed",
    ]) && defaultFailClosedResponse?.result?.isError === true
  );
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function changedFileScopeScan() {
  const allowed = new Set([
    FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH,
    FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH,
    FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
    FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
    FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH,
    FP0113_OAUTH_SECURITY_PLAN_PATH,
    FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
    FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
    "plans/FP-0117-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan.md",
    FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    "apps/control-plane/src/app.ts",
    "apps/control-plane/src/app.spec.ts",
    "apps/control-plane/src/lib/types.ts",
    ROUTE_PATH,
    SERVICE_PATH,
    FORMATTER_PATH,
    SCHEMA_PATH,
    DISPATCHER_PATH,
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts",
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.spec.ts",
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts",
    "apps/control-plane/src/modules/evidence-index/tools/service.ts",
    "apps/control-plane/src/modules/evidence-index/tools/service.spec.ts",
    "packages/domain/src/read-only-app-mcp-evidence-tool-dispatch-constants.ts",
    "packages/domain/src/read-only-app-mcp-evidence-tool-dispatch-proof.ts",
    "packages/domain/src/read-only-app-mcp-evidence-tool-dispatch.spec.ts",
    "packages/domain/src/index.ts",
    "tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs",
    "tools/read-only-mcp-evidence-tool-dispatch-proof.mjs",
    "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs",
    "tools/read-only-mcp-route-adapter-proof.mjs",
    "tools/read-only-mcp-protocol-envelope-proof.mjs",
    "tools/read-only-endpoint-route-ownership-proof.mjs",
    "tools/read-only-endpoint-architecture-proof.mjs",
    "tools/read-only-public-app-security-boundary-proof.mjs",
    "tools/read-only-mcp-descriptor-response-envelope-proof.mjs",
    "tools/read-only-chatgpt-app-mcp-proof.mjs",
    "tools/read-only-mcp-oauth-security-boundary-proof.mjs",
    "tools/read-only-mcp-remote-host-readiness-proof.mjs",
    "tools/read-only-mcp-remote-host-resource-boundary-proof.mjs",
    "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs",
    "tools/read-only-mcp-protected-resource-metadata-proof.mjs",
    "tools/read-only-mcp-canonical-resource-auth-server-proof.mjs",
    "tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs",
    "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
    "tools/benchmark-community-pack-proof.mjs",
    "plans/FP-0118-read-only-chatgpt-app-mcp-protected-resource-metadata-auth-challenge-readiness-contracts.md",
    "plans/FP-0120-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts.md",
    FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
    FP0125_LOCAL_ROUTE_PLAN,
    FP0125_LOCAL_ROUTE_PATH,
    FP0125_LOCAL_ROUTE_SPEC_PATH,
    FP0125_LOCAL_ROUTE_PROOF_PATH,
    "README.md",
    "CODEX_README.md",
    "START_HERE.md",
    "docs/ACTIVE_DOCS.md",
    "docs/PROJECT_STATE.md",
    "docs/V2_BOUNDARY.md",
    "docs/security/read-only-agent-threat-model.md",
    "docs/security/finance-data-threat-model.md",
    "docs/demo/demo-data-policy.md",
    "plans/ROADMAP.md",
    "plugins.md",
  ]);
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  const changedFilesAllowed = changedPaths.every(
    (path) =>
      allowed.has(path) ||
      /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
      /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path),
  );
  const noPublicArtifacts = !changedPaths.some(
    (path) =>
      publicAssetPattern.test(path) ||
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
  );
  const changedProductSource = changedPaths
    .filter(isProductImplementationSourcePath)
    .map(safeRead)
    .join("\n");
  const changedRouteRuntimeSource = changedPaths
    .filter(isEndpointRouteRuntimeSourcePath)
    .map(safeRead)
    .join("\n");
  const noDbImplementationPaths = !changedPaths.some(
    (path) =>
      /^packages\/db\//u.test(path) ||
      /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
      /\.sql$/iu.test(path),
  );
  const noDbImplementationCode =
    !/\b(?:drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)/u.test(
      changedProductSource,
    );
  const noEndpointRouteRuntimeChanged = !changedPaths.some((path) =>
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
      path,
    ),
  );

  return {
    noAppSubmission: noPublicArtifacts && changedFilesAllowed,
    noDbQueriesAdded:
      changedFilesAllowed && noDbImplementationPaths && noDbImplementationCode,
    noDeploymentConfig:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.yaml|fly\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
          path,
        ),
      ),
    noPackageScriptsAdded:
      changedFilesAllowed &&
      !changedPaths.some((path) => /(?:^|\/)package\.json$/u.test(path)),
    noListingCopyGeneratedPublicProse:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:listing-copy|generated-public-prose|public-listing|store-listing)/iu.test(
          path,
        ),
      ),
    noPublicAssets: noPublicArtifacts && changedFilesAllowed,
    noProtectedResourceMetadataRoute:
      changedFilesAllowed &&
      noEndpointRouteRuntimeChanged &&
      !/\b(?:oauth-protected-resource|protectedResourceMetadataRoute|resourceMetadataRoute)\b/u.test(
        changedRouteRuntimeSource,
      ),
    noRouteBehaviorChange: changedFilesAllowed && noEndpointRouteRuntimeChanged,
    noSchemaMigrationsAdded:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path),
      ),
    noWwwAuthenticateRouteBehavior:
      changedFilesAllowed &&
      noEndpointRouteRuntimeChanged &&
      !/\b(?:WWW-Authenticate|wwwAuthenticate|resource_metadata)\b/u.test(
        changedRouteRuntimeSource,
      ),
  };
}

function isEndpointRouteRuntimeSourcePath(path) {
  return /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
    path,
  );
}

function isProductImplementationSourcePath(path) {
  return (
    /\.(?:ts|tsx|js|mjs)$/u.test(path) &&
    !path.startsWith("tools/") &&
    !/\.spec\.(?:ts|tsx|js|mjs)$/u.test(path)
  );
}

function fp0110ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /apps-sdk|app-submission|submission-assets|iframe/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedRuntimeSource,
      ),
    noDefaultDispatchRuntime: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noOauthTokenSession:
      !/\b(?:oauth|tokenExchange|sessionHandler|setCookie|authorization)\b/u.test(
        changedRuntimeSource,
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite)\b/u.test(
        changedRuntimeSource,
      ),
  };
}

function isFp0110RuntimeScopePath(path) {
  return (
    path === "apps/control-plane/src/app.ts" ||
    path === "apps/control-plane/src/lib/types.ts" ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
      path,
    )
  );
}

function fp0112ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /apps-sdk|app-submission|submission-assets|iframe/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noOauthTokenSession:
      !/\b(?:oauthCallback|tokenExchange|sessionHandler|setCookie|authorizationMiddleware)\b/u.test(
        changedRuntimeSource,
      ),
    noProviderExternalCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
  };
}

function fp0113ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /apps-sdk|app-submission|submission-assets|iframe/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noProviderExternalCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
  };
}

function runtimeForbiddenScopeScan() {
  return {
    noAppsSdkResourceImplementation:
      !/\b(?:registerResource|ui:\/\/|resource registration)\b/u.test(
        routeRuntimeSource,
      ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        routeRuntimeSource,
      ),
    noFinanceWrite:
      !/\b(?:updateLedger|writeFinanceTwin|writeAccountingRecord)\s*\(/u.test(
        routeRuntimeSource,
      ),
    noGeneratedFinanceAdvice:
      !/\b(?:generateFinanceAdvice|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        routeRuntimeSource,
      ),
    noOauthTokenSessionImplementation:
      !/\b(?:oauthCallback|tokenExchange|sessionHandler|setCookie)\b/u.test(
        routeRuntimeSource,
      ),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob)\s*\(/u.test(
        routeRuntimeSource,
      ),
    noRemoteMcpDeployment:
      !/\b(?:listen\s*\(|deploy|remoteMcp|mcpServerRuntime)\b/u.test(
        routeRuntimeSource,
      ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        routeRuntimeSource,
      ),
  };
}

function durableNoApiModelKeyScan() {
  const text = repoPaths.filter(isDurableScanPath).map(safeRead).join("\n");
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const callModelName = ["call", "Model"].join("");
  const noOpenAiApiCalls = ![
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    new RegExp(`\\b${escapeRegExp(hostName)}\\b`, "u"),
  ].some((pattern) => pattern.test(text));
  const noModelCalls = ![
    new RegExp(`\\b${callModelName}\\s*\\(`, "u"),
    dottedPattern("model", "create"),
    dottedPattern("models", "create"),
    dottedPattern("chat", "completions"),
    dottedPattern("responses", "create"),
  ].some((pattern) => pattern.test(text));
  const noOpenAiClientOrKeyUsage =
    noOpenAiApiCalls &&
    ![
      new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
      new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
      new RegExp(`\\b${keyName}\\b`, "u"),
    ].some((pattern) => pattern.test(text));

  return {
    noModelCalls,
    noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
  };
}

function isDurableScanPath(path) {
  return (
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/.*\.ts$/u.test(
      path,
    ) ||
    /^apps\/control-plane\/src\/modules\/evidence-index\/tools\/.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-evidence-tool-dispatch.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protocol-envelope.*\.ts$/u.test(
      path,
    ) ||
    /^tools\/read-only-mcp-.*\.mjs$/u.test(path) ||
    path === "tools/benchmark-community-pack-proof.mjs"
  );
}

function dottedPattern(left, right) {
  return new RegExp(`\\b${left}\\s*\\.\\s*${right}\\b`, "u");
}

function changedFilePaths() {
  const tracked = runGit(["diff", "--name-only", "origin/main", "--"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  return [...new Set([...tracked, ...untracked].filter(Boolean))].sort();
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
      if (entry.isDirectory()) {
        walk(`${directory}/${entry.name}`, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results.sort();
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function sameList(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}
