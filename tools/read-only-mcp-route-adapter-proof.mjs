import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  FP0113_OAUTH_SECURITY_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
  buildMcpToolDescriptorContracts,
  verifyFp0116AbsentOrLocalRemoteHostResourceContracts,
  verifyFp0117Absent,
} from "../packages/domain/src/index.ts";
import {
  FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
  FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
} from "../packages/domain/src/read-only-app-mcp-remote-host-readiness.ts";
import {
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
} from "../packages/domain/src/read-only-app-mcp-canonical-resource-proof.ts";
import { registerReadOnlyAppMcpEndpointRoutes } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const requireFromControlPlane = createRequire(
  new URL("../apps/control-plane/package.json", import.meta.url),
);
const Fastify = requireFromControlPlane("fastify");
const SCHEMA_VERSION = "v2aa.read-only-app-mcp-local-route-adapter.v1";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0108_PLAN =
  "plans/FP-0108-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-contracts.md";
const FP0109_PLAN =
  "plans/FP-0109-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-adapter-implementation.md";
const FP0110_PLAN =
  "plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md";
const FP0111_PLAN =
  "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0105_PLAN =
  "plans/FP-0105-read-only-chatgpt-app-mcp-endpoint-route-ownership-transport-adapter-proof-contracts.md";
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
const EVIDENCE_DISPATCHER_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.ts";
const ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts";
const SERVICE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.spec.ts";
const EVIDENCE_DISPATCHER_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.spec.ts";
const EVIDENCE_TOOL_SERVICE_PATH =
  "apps/control-plane/src/modules/evidence-index/tools/service.ts";
const EVIDENCE_TOOL_SERVICE_SPEC_PATH =
  "apps/control-plane/src/modules/evidence-index/tools/service.spec.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const routeAdapterFiles = [
  ROUTE_PATH,
  SERVICE_PATH,
  FORMATTER_PATH,
  SCHEMA_PATH,
  EVIDENCE_DISPATCHER_PATH,
  ROUTE_SPEC_PATH,
  SERVICE_SPEC_PATH,
  EVIDENCE_DISPATCHER_SPEC_PATH,
];
const routeSource = safeRead(ROUTE_PATH);
const runtimeSource = [
  ROUTE_PATH,
  SERVICE_PATH,
  FORMATTER_PATH,
  SCHEMA_PATH,
  EVIDENCE_DISPATCHER_PATH,
]
  .map(safeRead)
  .join("\n");
const app = Fastify();
await registerReadOnlyAppMcpEndpointRoutes(app);

const initializeResponse = await injectJson({
  id: "init-1",
  jsonrpc: "2.0",
  method: "initialize",
});
const pingResponse = await injectJson({
  id: "ping-1",
  jsonrpc: "2.0",
  method: "ping",
});
const initializedNotificationResponse = await app.inject({
  method: "POST",
  payload: {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  },
  url: "/mcp",
});
const toolsListResponse = await injectJson({
  id: "tools-1",
  jsonrpc: "2.0",
  method: "tools/list",
});
const unknownMethodResponse = await injectJson({
  id: "bad-method",
  jsonrpc: "2.0",
  method: "resources/list",
});
const invalidToolResponse = await injectJson({
  id: "bad-tool",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: {},
    name: "send_report",
  },
});
const invalidArgumentsResponse = await injectJson({
  id: "bad-args",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: {
      companyKey: "acme",
    },
    name: "search_evidence",
  },
});
const malformedResponse = await injectJson({
  id: "bad-envelope",
  method: "initialize",
});
const getResponse = await app.inject({
  headers: {
    accept: "text/event-stream",
  },
  method: "GET",
  url: "/mcp",
});
const invalidOriginResponse = await injectJson(
  {
    id: "bad-origin",
    jsonrpc: "2.0",
    method: "initialize",
  },
  {
    origin: "https://attacker.example",
  },
);
const invalidOriginGetResponse = await app.inject({
  headers: {
    accept: "text/event-stream",
    origin: "https://attacker.example",
  },
  method: "GET",
  url: "/mcp",
});
const localhostOriginResponse = await injectJson(
  {
    id: "localhost-origin",
    jsonrpc: "2.0",
    method: "initialize",
  },
  {
    origin: "http://localhost:3000",
  },
);
const loopbackOriginResponse = await injectJson(
  {
    id: "loopback-origin",
    jsonrpc: "2.0",
    method: "initialize",
  },
  {
    origin: "http://127.0.0.1:3000",
  },
);
const toolCallResponses = await Promise.all(
  MCP_TOOL_ALLOWLIST.map((toolName) =>
    injectJson({
      id: `call-${toolName}`,
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: validArgumentsFor(toolName),
        name: toolName,
      },
    }),
  ),
);

await app.close();

const routeRegistrationCount = countMatches(
  routeSource,
  /app\.post\("\/mcp"/gu,
);
const getRouteRegistrationCount = countMatches(
  routeSource,
  /app\.get\("\/mcp"/gu,
);
const toolNames = toolsListResponse.body.result.tools.map((tool) => tool.name);
const toolAnnotations = toolsListResponse.body.result.tools.map(
  (tool) => tool.annotations,
);
const descriptorAnnotations = buildMcpToolDescriptorContracts().map(
  (descriptor) => descriptor.annotations,
);
const changedFileBoundary = changedFilesAreAllowed();
const publicAssetBoundary = noPublicAssetsBoundary();
const sourceScan = noApiModelClientKeyUsage();
const runtimeForbiddenScan = runtimeForbiddenScopeScan();
const fp0110ScopeScan = fp0110ChangedScopeScan();
const fp0112ScopeScan = fp0112ChangedScopeScan();
const fp0113ScopeScan = fp0113ChangedScopeScan();

const proof = {
  schemaVersion: SCHEMA_VERSION,
  localRouteAdapterOnly: true,
  mcpRouteAdapterImplemented:
    routeRegistrationCount === 1 &&
    getRouteRegistrationCount === 1 &&
    appRouteRegisteredInApp(),
  exactlyOneMcpRoutePath:
    routeRegistrationCount === 1 &&
    getRouteRegistrationCount === 1 &&
    routeSource.includes('app.post("/mcp"') &&
    routeSource.includes('app.get("/mcp"'),
  postMcpOnly:
    routeRegistrationCount === 1 &&
    getResponse.statusCode === 405 &&
    getResponse.headers.allow === "POST",
  noGetMcp:
    getResponse.statusCode === 405 &&
    getResponse.headers.allow === "POST" &&
    !String(getResponse.headers["content-type"] ?? "").includes(
      "text/event-stream",
    ),
  getMcpHandledAsSseUnavailable:
    getRouteRegistrationCount === 1 &&
    getResponse.statusCode === 405 &&
    getResponse.headers.allow === "POST" &&
    getResponse.body === "",
  noSseStreamImplemented:
    !String(getResponse.headers["content-type"] ?? "").includes(
      "text/event-stream",
    ) &&
    !/\b(?:text\/event-stream|ReadableStream|SSEServerTransport|reply\.raw\.write)\b/u.test(
      runtimeSource,
    ),
  initializeHandled:
    initializeResponse.statusCode === 200 &&
    initializeResponse.body.result?.capabilities?.tools?.listChanged === false,
  pingHandled:
    pingResponse.statusCode === 200 &&
    JSON.stringify(pingResponse.body.result) === "{}",
  initializedNotificationHandled:
    initializedNotificationResponse.statusCode === 202 &&
    initializedNotificationResponse.body === "",
  notificationAcceptedReturns202NoBody:
    initializedNotificationResponse.statusCode === 202 &&
    initializedNotificationResponse.body === "",
  originValidationBoundaryVerified:
    initializeResponse.statusCode === 200 &&
    localhostOriginResponse.statusCode === 200 &&
    loopbackOriginResponse.statusCode === 200 &&
    invalidOriginResponse.statusCode === 403 &&
    invalidOriginGetResponse.statusCode === 403,
  invalidOriginFailsClosed:
    invalidOriginResponse.statusCode === 403 &&
    invalidOriginResponse.body?.failClosed === true &&
    invalidOriginResponse.body?.localRouteAdapterOnly === true &&
    invalidOriginGetResponse.statusCode === 403 &&
    JSON.parse(invalidOriginGetResponse.body).failClosed === true,
  streamableHttpTransportBoundaryVerified:
    routeRegistrationCount === 1 &&
    getRouteRegistrationCount === 1 &&
    getResponse.statusCode === 405 &&
    initializedNotificationResponse.statusCode === 202 &&
    !String(getResponse.headers["content-type"] ?? "").includes(
      "text/event-stream",
    ) &&
    invalidOriginResponse.statusCode === 403,
  toolsListReturnsExactV2gAllowlist:
    sameList(toolNames, MCP_TOOL_ALLOWLIST) &&
    JSON.stringify(toolAnnotations) === JSON.stringify(descriptorAnnotations),
  toolsCallFailClosedUntilDispatchPlan: toolCallResponses.every(
    (response, index) =>
      response.statusCode === 200 &&
      response.body.result?.isError === true &&
      response.body.result?.structuredContent?.toolName ===
        MCP_TOOL_ALLOWLIST[index] &&
      response.body.result?.structuredContent?.capabilityBoundary
        ?.toolDispatchImplemented === false,
  ),
  invalidMethodFailsClosed:
    unknownMethodResponse.body.error?.code === -32601 &&
    unknownMethodResponse.body.error?.data?.failClosed === true,
  invalidToolFailsClosed:
    invalidToolResponse.body.error?.code === -32602 &&
    invalidToolResponse.body.error?.data?.failClosed === true,
  invalidArgumentsFailClosed:
    invalidArgumentsResponse.body.error?.code === -32602 &&
    invalidArgumentsResponse.body.error?.data?.failClosed === true,
  structuredJsonRpcErrorsVerified:
    malformedResponse.body.jsonrpc === "2.0" &&
    malformedResponse.body.id === null &&
    malformedResponse.body.error?.code === -32600 &&
    unknownMethodResponse.body.jsonrpc === "2.0" &&
    invalidToolResponse.body.jsonrpc === "2.0",
  responseEnvelopeBoundaryPreserved: toolCallResponses.every(
    (response) =>
      response.body.result?.structuredContent?.evidence &&
      response.body.result?.structuredContent?.freshness &&
      response.body.result?.structuredContent?.limitations &&
      response.body.result?.structuredContent?.capabilityBoundary,
  ),
  noRawFullFileDump: !/rawFullText|rawFileText|fullFileText|fileContents/u.test(
    runtimeSource,
  ),
  noGeneratedFinanceAdvice:
    !/\b(?:generateFinanceAdvice|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
      runtimeSource,
    ),
  noSourceMutation: runtimeForbiddenScan.noSourceMutation,
  noFinanceWrite: runtimeForbiddenScan.noFinanceWrite,
  noProviderCalls: runtimeForbiddenScan.noProviderCalls,
  noExternalCommunications: runtimeForbiddenScan.noExternalCommunications,
  noOpenAiApiCalls: sourceScan.noOpenAiApiCalls,
  noModelCalls: sourceScan.noModelCalls,
  noOpenAiClientOrKeyUsage: sourceScan.noOpenAiClientOrKeyUsage,
  noOauthTokenSessionImplementation:
    runtimeForbiddenScan.noOauthTokenSessionImplementation,
  noRemoteMcpDeployment: runtimeForbiddenScan.noRemoteMcpDeployment,
  noAppsSdkResourceImplementation:
    runtimeForbiddenScan.noAppsSdkResourceImplementation,
  noAppSubmission: publicAssetBoundary.noAppSubmission,
  noPublicAssets: publicAssetBoundary.noPublicAssets,
  fp0107BoundaryVerified: fp0107BoundaryVerified() && changedFileBoundary,
  fp0108EvidenceToolDispatchContractBoundaryVerified:
    fp0108EvidenceToolDispatchContractBoundaryVerified(),
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
  noAppSubmissionFromFp0112: publicAssetBoundary.noAppSubmission,
  noDbQueriesFromFp0112: fp0112ScopeScan.noDbQueries,
  noSchemaMigrationsFromFp0112: fp0112ScopeScan.noSchemaMigrations,
  noOpenAiApiCallsFromFp0112: sourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0112: fp0112ScopeScan.noProviderExternalCalls,
  noSourceMutationFinanceWriteFromFp0112:
    fp0112ScopeScan.noSourceMutationFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0112:
    publicAssetBoundary.noPublicAssets,
  noAppsSdkResourceFromFp0113: fp0113ScopeScan.noAppsSdkResource,
  noAppSubmissionFromFp0113: publicAssetBoundary.noAppSubmission,
  noAuthMiddlewareImplementationFromFp0113:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noDbQueriesFromFp0113: fp0113ScopeScan.noDbQueries,
  noOauthImplementationFromFp0113: fp0113ScopeScan.noOauthImplementation,
  noOpenAiApiCallsFromFp0113: sourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0113: fp0113ScopeScan.noProviderExternalCalls,
  noPublicAssetsSubmissionArtifactsFromFp0113:
    publicAssetBoundary.noPublicAssets,
  noRemoteMcpDeploymentFromFp0113: fp0113ScopeScan.noRemoteMcp,
  noRouteBehaviorChangeFromFp0113: fp0113ScopeScan.noRouteBehaviorChange,
  noSchemaMigrationsFromFp0113: fp0113ScopeScan.noSchemaMigrations,
  noSourceMutationFinanceWriteFromFp0113:
    fp0113ScopeScan.noSourceMutationFinanceWrite,
  noTokenSessionImplementationFromFp0113:
    fp0113ScopeScan.noTokenSessionImplementation,
  noRouteBehaviorChangeFromFp0114: fp0113ScopeScan.noRouteBehaviorChange,
  noNewRoutePathFromFp0114: fp0113ScopeScan.noRouteBehaviorChange,
  noRemoteMcpDeploymentFromFp0114: fp0113ScopeScan.noRemoteMcp,
  noDeploymentConfigFromFp0114: !changedPaths.some((path) =>
    /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.yaml|fly\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
      path,
    ),
  ),
  noOauthImplementationFromFp0114: fp0113ScopeScan.noOauthImplementation,
  noTokenSessionImplementationFromFp0114:
    fp0113ScopeScan.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0114:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noAppsSdkResourceFromFp0114: fp0113ScopeScan.noAppsSdkResource,
  noAppSubmissionFromFp0114: publicAssetBoundary.noAppSubmission,
  noDbQueriesFromFp0114: fp0113ScopeScan.noDbQueries,
  noSchemaMigrationsFromFp0114: fp0113ScopeScan.noSchemaMigrations,
  noPackageScriptsFromFp0114: !changedPaths.some((path) =>
    /(?:^|\/)package\.json$/u.test(path),
  ),
  noOpenAiApiCallsFromFp0114: sourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0114: fp0113ScopeScan.noProviderExternalCalls,
  noSourceMutationFinanceWriteFromFp0114:
    fp0113ScopeScan.noSourceMutationFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0114:
    publicAssetBoundary.noPublicAssets,
  defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified:
    fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified(),
  noRouteBehaviorChangeFromFp0110:
    fp0110ScopeScan.noRouteBehaviorChange &&
    toolCallResponses.every(
      (response) => response.body.result?.isError === true,
    ),
  noDefaultDispatchRuntimeFromFp0110:
    fp0110ScopeScan.noDefaultDispatchRuntime &&
    toolCallResponses.every(
      (response) => response.body.result?.isError === true,
    ),
  noDbQueriesFromFp0110: fp0110ScopeScan.noDbQueries,
  noSchemaMigrationsFromFp0110: fp0110ScopeScan.noSchemaMigrations,
  noOauthTokenSessionFromFp0110: fp0110ScopeScan.noOauthTokenSession,
  noRemoteMcpDeploymentFromFp0110: fp0110ScopeScan.noRemoteMcp,
  noAppsSdkResourceFromFp0110: fp0110ScopeScan.noAppsSdkResource,
  noOpenAiApiCallsFromFp0110: sourceScan.noOpenAiApiCalls,
  noSourceMutationFinanceWriteFromFp0110:
    fp0110ScopeScan.noSourceMutationFinanceWrite,
  fp0106ProtocolEnvelopeBoundaryStillVerified: fp0106BoundaryStillVerified(),
  fp0105RouteOwnershipBoundaryStillVerified: fp0105BoundaryStillVerified(),
  fp0100PublicSecurityBoundaryStillVerified: fp0100BoundaryStillVerified(),
};

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0107 MCP route adapter proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

async function injectJson(payload, headers = {}) {
  const response = await app.inject({
    headers,
    method: "POST",
    payload,
    url: "/mcp",
  });
  return {
    body: response.body ? JSON.parse(response.body) : null,
    statusCode: response.statusCode,
  };
}

function validArgumentsFor(toolName) {
  switch (toolName) {
    case "search_evidence":
      return {
        companyKey: "acme",
        limit: 3,
        query: "cash posture",
      };
    case "fetch_evidence_card":
      return {
        companyKey: "acme",
        evidenceCardId: "evidence-card-1",
      };
    case "fetch_source_anchor":
      return {
        companyKey: "acme",
        sourceAnchorId: "source-anchor-1",
      };
    case "fetch_document_map":
      return {
        companyKey: "acme",
        documentMapId: "document-map-1",
      };
    case "fetch_source_coverage":
      return {
        companyKey: "acme",
        sourceId: "source-1",
      };
    case "fetch_company_posture":
      return {
        companyKey: "acme",
        periodKey: "2026-04",
      };
    case "fetch_capability_boundaries":
      return {
        companyKey: "acme",
      };
    default:
      throw new Error(`Unexpected tool name ${toolName}`);
  }
}

function appRouteRegisteredInApp() {
  const appSource = safeRead("apps/control-plane/src/app.ts");
  return (
    appSource.includes("registerReadOnlyAppMcpEndpointRoutes") &&
    appSource.includes("./modules/read-only-app-mcp-endpoint/routes")
  );
}

function fp0107BoundaryVerified() {
  const fp0107Hits = repoPaths.filter((path) => /(^|\/)FP-0107/u.test(path));
  if (
    fp0107Hits.length !== 1 ||
    fp0107Hits[0] !== FP0107_PLAN ||
    !existsSync(FP0107_PLAN)
  ) {
    return false;
  }

  const normalized = normalize(safeRead(FP0107_PLAN));
  return [
    "local-only",
    "fastify",
    "post /mcp",
    "tools/call stays fail-closed",
    "not oauth implementation",
    "not token/session implementation",
    "remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not app submission",
    "openai api/model calls",
    "source mutation",
    "finance write",
    "fp-0108 remains absent",
  ].every((text) => normalized.includes(text));
}

function fp0108EvidenceToolDispatchContractBoundaryVerified() {
  const fp0108Hits = repoPaths.filter((path) => /(^|\/)FP-0108/u.test(path));
  if (fp0108Hits.length === 0) return true;
  if (
    fp0108Hits.length !== 1 ||
    fp0108Hits[0] !== FP0108_PLAN ||
    !existsSync(FP0108_PLAN)
  ) {
    return false;
  }

  const normalized = normalize(safeRead(FP0108_PLAN));
  return [
    "local/proof-only/read-only",
    "evidence tool dispatch contracts",
    "does not change route behavior",
    "does not implement tools/call dispatch",
    "tools/call remains fail-closed",
    "no dispatch runtime",
    "no route behavior change",
    "no db query",
    "no openai api/model call",
    "source mutation",
    "no finance write",
    "no autonomous action",
    "public app implementation remains future-only",
    "public app submission remains future-only",
  ].every((text) => normalized.includes(text));
}

function fp0109BoundaryVerified() {
  const fp0109Hits = repoPaths.filter((path) => /(^|\/)FP-0109/u.test(path));
  if (
    fp0109Hits.length !== 1 ||
    fp0109Hits[0] !== FP0109_PLAN ||
    !existsSync(FP0109_PLAN)
  ) {
    return false;
  }

  const normalized = normalize(safeRead(FP0109_PLAN));
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
    "public app implementation and public app submission remain future-only",
  ].every((text) => normalized.includes(text));
}

function fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified() {
  const fp0110Hits = repoPaths.filter((path) => /(^|\/)FP-0110/u.test(path));
  if (fp0110Hits.length === 0) return true;
  return (
    fp0110Hits.length === 1 &&
    fp0110Hits[0] === FP0110_PLAN &&
    fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified()
  );
}

function fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified() {
  if (!existsSync(FP0110_PLAN)) return false;
  const normalized = normalize(safeRead(FP0110_PLAN));
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
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified() {
  const fp0111Hits = repoPaths.filter((path) => /(^|\/)FP-0111/u.test(path));
  if (
    fp0111Hits.length !== 1 ||
    fp0111Hits[0] !== FP0111_PLAN ||
    !existsSync(FP0111_PLAN)
  ) {
    return false;
  }
  const normalized = normalize(safeRead(FP0111_PLAN));
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
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified() {
  const fp0112Hits = repoPaths.filter((path) => /(^|\/)FP-0112/u.test(path));
  if (fp0112Hits.length === 0) return true;
  return (
    fp0112Hits.length === 1 &&
    fp0112Hits[0] === FP0112_PLAN &&
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
  return docsBoundary(FP0112_PLAN, [
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
  ]);
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function fp0106BoundaryStillVerified() {
  if (!existsSync(FP0106_PLAN)) return false;
  const normalized = normalize(safeRead(FP0106_PLAN));
  return [
    "fp-0106 is local/proof-only/read-only mcp protocol envelope",
    "ping",
    "empty json-rpc result",
    "tool-dispatch proof contracts",
    "fp-0106 does not authorize route implementation",
  ].every((text) => normalized.includes(text));
}

function fp0105BoundaryStillVerified() {
  if (!existsSync(FP0105_PLAN)) return false;
  const normalized = normalize(safeRead(FP0105_PLAN));
  return [
    "endpoint route ownership and transport-adapter proof-contract",
    "apps/control-plane fastify",
    "future /mcp route owner family",
    "does not authorize endpoint implementation",
  ].every((text) => normalized.includes(text));
}

function fp0100BoundaryStillVerified() {
  if (!existsSync(FP0100_PLAN)) return false;
  const normalized = normalize(safeRead(FP0100_PLAN));
  return [
    "public-app security boundary contract",
    "local/proof-only",
    "no endpoints",
  ].every((text) => normalized.includes(text));
}

function changedFilesAreAllowed() {
  const allowed = new Set([
    FP0107_PLAN,
    FP0108_PLAN,
    FP0109_PLAN,
    FP0110_PLAN,
    FP0111_PLAN,
    FP0112_PLAN,
    FP0113_OAUTH_SECURITY_PLAN_PATH,
    FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
    FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
    "plans/FP-0117-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan.md",
    "plans/FP-0118-read-only-chatgpt-app-mcp-protected-resource-metadata-auth-challenge-readiness-contracts.md",
    FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
    "plans/FP-0120-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts.md",
    FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
    FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    ROUTE_PATH,
    SERVICE_PATH,
    FORMATTER_PATH,
    SCHEMA_PATH,
    EVIDENCE_DISPATCHER_PATH,
    ROUTE_SPEC_PATH,
    SERVICE_SPEC_PATH,
    EVIDENCE_DISPATCHER_SPEC_PATH,
    EVIDENCE_TOOL_SERVICE_PATH,
    EVIDENCE_TOOL_SERVICE_SPEC_PATH,
    "apps/control-plane/src/app.ts",
    "apps/control-plane/src/app.spec.ts",
    "apps/control-plane/src/lib/types.ts",
    "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs",
    "tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs",
    "tools/read-only-mcp-route-adapter-proof.mjs",
    "tools/read-only-mcp-evidence-tool-dispatch-proof.mjs",
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
    "tools/benchmark-community-pack-proof.mjs",
    "packages/domain/src/index.ts",
    "packages/domain/src/benchmark-community.spec.ts",
    "packages/domain/src/read-only-app-mcp-endpoint-architecture-proof.ts",
    "packages/domain/src/read-only-app-mcp-endpoint-architecture.spec.ts",
    "packages/domain/src/read-only-app-mcp-endpoint-route-ownership-inventory.ts",
    "packages/domain/src/read-only-app-mcp-endpoint-route-ownership-proof.ts",
    "packages/domain/src/read-only-app-mcp-endpoint-route-ownership.spec.ts",
    "packages/domain/src/read-only-app-mcp-protocol-envelope-proof.ts",
    "packages/domain/src/read-only-app-mcp-protocol-envelope.spec.ts",
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
    "plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md",
    "plugins.md",
  ]);

  return changedPaths.every(
    (path) =>
      allowed.has(path) ||
      /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path),
  );
}

function noPublicAssetsBoundary() {
  const forbidden = changedPaths.filter(
    (path) =>
      /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu.test(path) ||
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
  );
  const clear = forbidden.length === 0;
  return {
    noAppSubmission: clear,
    noPublicAssets: clear,
  };
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
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
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
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
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
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
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
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
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
        runtimeSource,
      ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        runtimeSource,
      ),
    noFinanceWrite:
      !/\b(?:updateLedger|writeFinanceTwin|writeAccountingRecord)\s*\(/u.test(
        runtimeSource,
      ),
    noOauthTokenSessionImplementation:
      !/\b(?:oauthCallback|tokenExchange|sessionHandler|setCookie)\b/u.test(
        runtimeSource,
      ),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob)\s*\(/u.test(
        runtimeSource,
      ),
    noRemoteMcpDeployment:
      !/\b(?:listen\s*\(|deploy|remoteMcp|mcpServerRuntime)\b/u.test(
        runtimeSource,
      ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        runtimeSource,
      ),
  };
}

function noApiModelClientKeyUsage() {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const sourceText = runtimeSource;
  const noOpenAiApiCalls = ![
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    new RegExp(`\\b${hostName}\\b`, "u"),
  ].some((pattern) => pattern.test(sourceText));
  const noModelCalls = ![
    /\bcallModel\b/u,
    /\bmodel\s*\.\s*create\b/u,
    /\bmodels\s*\.\s*create\b/u,
    /\bchat\s*\.\s*completions\b/u,
    /\bresponses\s*\.\s*create\b/u,
  ].some((pattern) => pattern.test(sourceText));
  const noOpenAiClientOrKeyUsage =
    noOpenAiApiCalls &&
    ![
      new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
      new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
      new RegExp(`\\b${keyName}\\b`, "u"),
    ].some((pattern) => pattern.test(sourceText));

  return {
    noModelCalls,
    noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
  };
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
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results.sort();
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function sameList(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}
