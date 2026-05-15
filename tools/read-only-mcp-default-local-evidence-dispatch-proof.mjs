import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0113_OAUTH_SECURITY_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
} from "../packages/domain/src/index.ts";
import { FP0114_REMOTE_HOST_READINESS_PLAN_PATH } from "../packages/domain/src/read-only-app-mcp-remote-host-readiness.ts";
import { buildApp } from "../apps/control-plane/src/app.ts";
import { createInMemoryContainer } from "../apps/control-plane/src/bootstrap.ts";
import {
  LocalReadOnlyEvidenceToolDispatchAdapter,
  READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_MAX_CHARACTERS,
  READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_SCHEMA_VERSION,
} from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.ts";
import { ReadOnlyAppMcpEndpointService } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts";

const SCHEMA_VERSION =
  "v2ae.read-only-mcp-default-local-evidence-dispatch-wiring-proof.v1";
const FP0111_PLAN =
  "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0110_PLAN =
  "plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md";
const FP0109_PLAN =
  "plans/FP-0109-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-adapter-implementation.md";
const FP0108_PLAN =
  "plans/FP-0108-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-contracts.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const APP_PATH = "apps/control-plane/src/app.ts";
const TYPES_PATH = "apps/control-plane/src/lib/types.ts";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const SERVICE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts";
const DISPATCHER_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/evidence-dispatcher.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const routeSource = safeRead(ROUTE_PATH);
const appSource = safeRead(APP_PATH);
const typesSource = safeRead(TYPES_PATH);
const endpointRuntimeSource = [
  ROUTE_PATH,
  SERVICE_PATH,
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/formatter.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/schema.ts",
  DISPATCHER_PATH,
]
  .map(safeRead)
  .join("\n");
const appWiringSource = [APP_PATH, TYPES_PATH].map(safeRead).join("\n");
const proofSourceScan = durableNoApiModelKeyScan();
const changedScopeScan = changedScopeBoundary();
const runtimeForbiddenScan = runtimeForbiddenScopeScan();
const fp0112ScopeScan = fp0112ChangedScopeScan();
const fp0113ScopeScan = fp0113ChangedScopeScan();

const defaultApp = await buildApp({ container: createInMemoryContainer() });
const defaultToolCall = await injectJson(defaultApp, {
  id: "default-call",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: validArgumentsFor("search_evidence"),
    name: "search_evidence",
  },
});
const getMcpResponse = await defaultApp.inject({
  headers: {
    accept: "text/event-stream",
  },
  method: "GET",
  url: "/mcp",
});
const notificationResponse = await defaultApp.inject({
  method: "POST",
  payload: {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  },
  url: "/mcp",
});
const invalidOriginResponse = await injectJson(
  defaultApp,
  {
    id: "bad-origin",
    jsonrpc: "2.0",
    method: "initialize",
  },
  {
    origin: "https://attacker.example",
  },
);
const toolsListResponse = await injectJson(defaultApp, {
  id: "tools-list",
  jsonrpc: "2.0",
  method: "tools/list",
});
await defaultApp.close();

const injectedEvidenceService = trackingService();
const injectedEndpointService = new ReadOnlyAppMcpEndpointService({
  evidenceToolDispatcher: new LocalReadOnlyEvidenceToolDispatchAdapter({
    evidenceService: injectedEvidenceService,
    expectedCompanyKey: "acme",
  }),
});
const injectedApp = await buildApp({
  container: {
    ...createInMemoryContainer(),
    readOnlyAppMcpEndpointService: injectedEndpointService,
  },
});
const injectedToolCall = await injectJson(injectedApp, {
  id: "injected-call",
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    arguments: validArgumentsFor("search_evidence"),
    name: "search_evidence",
  },
});
await injectedApp.close();

const adapterService = trackingService();
const adapter = new LocalReadOnlyEvidenceToolDispatchAdapter({
  evidenceService: adapterService,
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
const companyMismatchCallsBefore = adapterService.calls.searchEvidence;
const companyMismatchResult = adapter.dispatchTool({
  arguments: { companyKey: "other-company", query: "cash posture" },
  toolName: "search_evidence",
});

const proof = {
  schemaVersion: SCHEMA_VERSION,
  localDefaultDispatchWiringOnly: true,
  explicitAppConstructionDependencyVerified:
    typesSource.includes("readOnlyAppMcpEndpointService?:") &&
    appSource.includes("container.readOnlyAppMcpEndpointService") &&
    appSource.includes("registerReadOnlyAppMcpEndpointRoutes(app, {"),
  buildAppDefaultRouteStillFailClosed:
    defaultToolCall.statusCode === 200 &&
    defaultToolCall.body?.result?.isError === true &&
    defaultToolCall.body?.result?.structuredContent?.refusalReason ===
      "tool_dispatch_not_implemented_until_later_finance_plan",
  buildAppInjectedDispatcherEnablesLocalDispatch:
    injectedToolCall.statusCode === 200 &&
    injectedToolCall.body?.result?.isError === false &&
    injectedToolCall.body?.result?.structuredContent?.toolName ===
      "search_evidence" &&
    injectedEvidenceService.calls.searchEvidence === 1,
  routeFileDoesNotConstructEvidenceService:
    !routeSource.includes("ReadOnlyEvidenceToolService") &&
    !routeSource.includes("LocalReadOnlyEvidenceToolDispatchAdapter") &&
    !routeSource.includes("evidence-index/tools") &&
    !/new\s+ReadOnlyEvidenceToolService\b/u.test(routeSource),
  noNewRoutePath:
    countMatches(routeSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(routeSource, /app\.get\("\/mcp"/gu) === 1 &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(routeSource),
  getMcpBehaviorUnchanged:
    getMcpResponse.statusCode === 405 &&
    getMcpResponse.headers.allow === "POST" &&
    getMcpResponse.body === "" &&
    !String(getMcpResponse.headers["content-type"] ?? "").includes(
      "text/event-stream",
    ),
  notification202BehaviorUnchanged:
    notificationResponse.statusCode === 202 && notificationResponse.body === "",
  originBoundaryUnchanged:
    invalidOriginResponse.statusCode === 403 &&
    invalidOriginResponse.body?.failClosed === true &&
    invalidOriginResponse.body?.localRouteAdapterOnly === true,
  exactV2gToolAllowlistPreserved:
    sameList(
      toolsListResponse.body?.result?.tools?.map((tool) => tool.name) ?? [],
      MCP_TOOL_ALLOWLIST,
    ) && sameList(Object.keys(dispatchResults), MCP_TOOL_ALLOWLIST),
  companyKeyBoundaryStillVerified:
    companyMismatchResult.isError === true &&
    companyMismatchResult.structuredContent.refusalReason ===
      "company_key_mismatch" &&
    adapterService.calls.searchEvidence === companyMismatchCallsBefore,
  sourceCoverageSourceIdBoundaryStillVerified:
    adapterService.lastInputs.fetchSourceCoverage?.sourceId === "source-1" &&
    safeRead(DISPATCHER_PATH).includes("fetchSourceCoverage({"),
  structuredContentTextMirrorStillVerified: Object.values(
    dispatchResults,
  ).every((result) => {
    const text = result.content[0]?.text ?? "";
    const mirror = safeJson(text);

    return (
      text.length <= READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_MAX_CHARACTERS &&
      mirror?.schemaVersion ===
        READ_ONLY_EVIDENCE_DISPATCH_TEXT_MIRROR_SCHEMA_VERSION &&
      mirror.toolName === result.structuredContent.toolName &&
      mirror.companyKey === result.structuredContent.companyKey &&
      mirror.isError === result.isError
    );
  }),
  noDbQueriesAdded: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsAdded: changedScopeScan.noSchemaMigrationsAdded,
  noPackageScriptsAdded: changedScopeScan.noPackageScriptsAdded,
  noFixturesDatasetsSamplesSourcePacks:
    changedScopeScan.noFixturesDatasetsSamplesSourcePacks,
  noOauthTokenSessionImplementation:
    runtimeForbiddenScan.noOauthTokenSessionImplementation,
  noRemoteMcpDeployment: runtimeForbiddenScan.noRemoteMcpDeployment,
  noAppsSdkResourceImplementation:
    runtimeForbiddenScan.noAppsSdkResourceImplementation,
  noAppSubmission: changedScopeScan.noAppSubmission,
  noPublicAssets: changedScopeScan.noPublicAssets,
  noOpenAiApiCalls: proofSourceScan.noOpenAiApiCalls,
  noModelCalls: proofSourceScan.noModelCalls,
  noOpenAiClientOrKeyUsage: proofSourceScan.noOpenAiClientOrKeyUsage,
  noProviderCalls: runtimeForbiddenScan.noProviderCalls,
  noExternalCommunications: runtimeForbiddenScan.noExternalCommunications,
  noSourceMutation: runtimeForbiddenScan.noSourceMutation,
  noFinanceWrite: runtimeForbiddenScan.noFinanceWrite,
  noGeneratedFinanceAdvice: runtimeForbiddenScan.noGeneratedFinanceAdvice,
  fp0111BoundaryVerified: fp0111BoundaryVerified(),
  fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified:
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified(),
  fp0113AbsentOrLocalOauthSecurityContractsVerified:
    fp0113AbsentOrLocalOauthSecurityContractsVerified(),
  fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified(),
  fp0115Absent: fp0115Absent(),
  oauthSecurityContractsFoundationVerified:
    oauthSecurityContractsFoundationVerified(),
  remoteHostReadinessContractsFoundationVerified:
    remoteHostReadinessContractsFoundationVerified(),
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
  noRouteBehaviorChangeFromFp0114: changedScopeScan.noRouteBehaviorChange,
  noNewRoutePathFromFp0114: changedScopeScan.noRouteBehaviorChange,
  noRemoteMcpDeploymentFromFp0114: runtimeForbiddenScan.noRemoteMcpDeployment,
  noDeploymentConfigFromFp0114: changedScopeScan.noDeploymentConfig,
  noOauthImplementationFromFp0114: fp0113ScopeScan.noOauthImplementation,
  noTokenSessionImplementationFromFp0114:
    fp0113ScopeScan.noTokenSessionImplementation,
  noAuthMiddlewareImplementationFromFp0114:
    fp0113ScopeScan.noAuthMiddlewareImplementation,
  noAppsSdkResourceFromFp0114:
    runtimeForbiddenScan.noAppsSdkResourceImplementation,
  noAppSubmissionFromFp0114: changedScopeScan.noAppSubmission,
  noDbQueriesFromFp0114: changedScopeScan.noDbQueriesAdded,
  noSchemaMigrationsFromFp0114: changedScopeScan.noSchemaMigrationsAdded,
  noPackageScriptsFromFp0114: changedScopeScan.noPackageScriptsAdded,
  noOpenAiApiCallsFromFp0114: proofSourceScan.noOpenAiApiCalls,
  noProviderExternalCallsFromFp0114:
    fp0113ScopeScan.noProviderExternalCalls,
  noSourceMutationFinanceWriteFromFp0114:
    fp0113ScopeScan.noSourceMutationFinanceWrite,
  noPublicAssetsSubmissionArtifactsFromFp0114: changedScopeScan.noPublicAssets,
  fp0110DefaultDispatchPlanBoundaryStillVerified:
    fp0110DefaultDispatchPlanBoundaryStillVerified(),
  fp0109AdapterBoundaryStillVerified: docsBoundary(FP0109_PLAN, [
    "local-only",
    "dependency-injected",
    "default fail-closed",
    "openai api/model",
    "source mutation",
    "finance write",
  ]),
  fp0108DispatchContractsStillVerified: docsBoundary(FP0108_PLAN, [
    "evidence tool dispatch contracts",
    "does not change route behavior",
    "no db query",
    "no openai api/model call",
  ]),
  fp0107RouteAdapterBoundaryStillVerified: docsBoundary(FP0107_PLAN, [
    "local-only fastify",
    "post /mcp",
    "tools/call stays fail-closed",
  ]),
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
    throw new Error(
      `FP-0111 default local evidence dispatch proof failed: ${key}`,
    );
  }
}

console.log(JSON.stringify(proof, null, 2));

async function injectJson(app, payload, headers = {}) {
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

function responseFor(toolName) {
  const citation = {
    checksumSha256: "a".repeat(64),
    citationType: "source_anchor",
    id: "source-anchor-1",
    locator: "line 1",
    sourceAnchorId: "source-anchor-1",
    sourceId: "source-1",
    sourceSnapshotId: "source-snapshot-1",
    summary: "Synthetic proof citation.",
  };

  return {
    appMode: "local_proof",
    audit: {
      appMode: "local_proof",
      artifactIds: ["artifact-1"],
      companyKey: "acme",
      excerptCharacterCount: 24,
      forbiddenRequestBlocked: false,
      id: `audit:${toolName}`,
      normalizedQuery: toolName === "search_evidence" ? "cash posture" : null,
      redactionCount: 0,
      sourceAnchorIds: ["source-anchor-1"],
      timestamp: "2026-05-15T00:00:00.000Z",
      toolName,
      unsupportedReason: null,
    },
    capabilityBoundaries: [limitation("not_source_truth", "warning")],
    citations: [citation],
    companyKey: "acme",
    evidence: [citation],
    forbiddenActions: ["write_finance_twin_fact", "send_report"],
    freshness: {
      checkedAt: "2026-05-15T00:00:00.000Z",
      compiledAt: null,
      extractedAt: null,
      sourceCapturedAt: "2026-05-15T00:00:00.000Z",
      state: "fresh",
      summary: "Synthetic proof freshness.",
    },
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
    result: { artifactId: `${toolName}:artifact`, artifactKind: "proof" },
    schemaVersion: "v2c.evidence-tool.v1",
    toolName,
    unsupportedReason: null,
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
      return { companyKey: "acme", limit: 3, query: "cash posture" };
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
    default:
      throw new Error(`Unexpected tool ${toolName}`);
  }
}

function fp0111BoundaryVerified() {
  const hits = repoPaths.filter((path) => /(^|\/)FP-0111/u.test(path));
  if (
    hits.length !== 1 ||
    hits[0] !== FP0111_PLAN ||
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
  ].every((text) => normalized.includes(text));
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

function fp0115Absent() {
  return !repoPaths.some((path) => /(^|\/)FP-0115/u.test(path));
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
  const normalized = normalize(safeRead(FP0114_REMOTE_HOST_READINESS_PLAN_PATH));
  return [
    "local/proof-only/read-only remote mcp host readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "local /mcp route behavior is unchanged",
    "current local /mcp route must not be exposed remotely as-is",
    "fp-0115 remains absent",
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

function fp0110DefaultDispatchPlanBoundaryStillVerified() {
  return docsBoundary(FP0110_PLAN, [
    "docs-and-plan plus proof-gate compatibility",
    "not default dispatch runtime enablement",
    "explicit dependency injection remains required",
    "fp-0111 remains absent",
  ]);
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function changedScopeBoundary() {
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  const appRuntimeChangedCode = changedPaths
    .filter(isAppRuntimeWiringPath)
    .map(safeRead)
    .join("\n");
  return {
    noAppSubmission: !changedPaths.some((path) =>
      /app-submission|submission-assets|public-listing|store-listing|listing-copy/iu.test(
        path,
      ),
    ),
    noDbQueriesAdded:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        appRuntimeChangedCode,
      ),
    noFixturesDatasetsSamplesSourcePacks: !changedPaths.some((path) =>
      /(?:^|\/)(?:fixtures?|datasets?|sample-data|source-packs?)(?:\/|$)/iu.test(
        path,
      ),
    ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.yaml|fly\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noPackageScriptsAdded:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noPublicAssets: !changedPaths.some((path) => publicAssetPattern.test(path)),
    noRouteBehaviorChange: !changedPaths.some(isAppRuntimeWiringPath),
    noSchemaMigrationsAdded: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
  };
}

function isAppRuntimeWiringPath(path) {
  return (
    path === APP_PATH ||
    path === TYPES_PATH ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
      path,
    )
  );
}

function runtimeForbiddenScopeScan() {
  const source = [endpointRuntimeSource, appWiringSource].join("\n");
  return {
    noAppsSdkResourceImplementation:
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        source,
      ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        source,
      ),
    noFinanceWrite:
      !/\b(?:updateLedger|writeFinanceTwin|writeAccountingRecord)\s*\(/u.test(
        source,
      ),
    noGeneratedFinanceAdvice:
      !/\b(?:generateFinanceAdvice|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        source,
      ),
    noOauthTokenSessionImplementation:
      !/\b(?:oauthCallback|tokenExchange|sessionHandler|setCookie)\b/u.test(
        source,
      ),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob)\s*\(/u.test(
        source,
      ),
    noRemoteMcpDeployment:
      !/\b(?:listen\s*\(|deploy|remoteMcp|mcpServerRuntime)\b/u.test(source),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        source,
      ),
  };
}

function fp0112ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isAppRuntimeWiringPath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
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
    noRouteBehaviorChange: !changedPaths.some(isAppRuntimeWiringPath),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
  };
}

function fp0113ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isAppRuntimeWiringPath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
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
    noRouteBehaviorChange: !changedPaths.some(isAppRuntimeWiringPath),
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
    path === APP_PATH ||
    path === TYPES_PATH ||
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

function dottedPattern(left, right) {
  return new RegExp(`\\b${left}\\s*\\.\\s*${right}\\b`, "u");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function normalize(source) {
  return source.toLowerCase().replace(/`/gu, "");
}
