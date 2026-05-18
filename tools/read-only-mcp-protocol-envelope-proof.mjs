import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FP0106_MCP_PROTOCOL_ENVELOPE_PLAN_PATH,
  McpProtocolProofSchema,
  buildMcpProtocolProof,
  inspectEndpointRouteOwnershipRepositoryInventory,
} from "../packages/domain/src/index.ts";

const FP0105_PLAN =
  "plans/FP-0105-read-only-chatgpt-app-mcp-endpoint-route-ownership-transport-adapter-proof-contracts.md";
const FP0104_PLAN =
  "plans/FP-0104-read-only-chatgpt-app-mcp-endpoint-implementation-readiness-and-inventory-master-plan.md";
const FP0103_PLAN =
  "plans/FP-0103-read-only-chatgpt-app-mcp-endpoint-architecture-proof-contracts-foundation.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0113_PLAN =
  "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md";
const fp0123RouteInputSourceScanExcludedPaths = new Set([
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
]);
const FP0125_LOCAL_ROUTE_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
const FP0125_LOCAL_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const FP0125_LOCAL_ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts";
const FP0125_LOCAL_ROUTE_PROOF_PATH =
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs";
const FP0128_TOKEN_VALIDATION_READINESS_PLAN =
  "plans/FP-0128-read-only-chatgpt-app-mcp-token-validation-failure-readiness-contracts.md";
const FP0128_TOKEN_VALIDATION_READINESS_PROOF_PATH =
  "tools/read-only-mcp-token-validation-readiness-proof.mjs";
const FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH =
  "plans/FP-0130-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation.md";
const FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_PROOF_PATH =
  "tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const changedRuntime = changedRuntimeSurfaceBoundary();
const publicAssets = publicAssetSubmissionBoundary();
const sourceScan = proofSourceNoOpenAiApiModelKeyScan();
const fp0106 = fp0106ProtocolEnvelopeBoundary();
const endpointRuntimeInventory = endpointRuntimeRepositoryInventory();

const proof = McpProtocolProofSchema.parse(
  buildMcpProtocolProof({
    endpointRuntimeRepositoryInventoryVerified:
      endpointRuntimeInventory.endpointRuntimeRepositoryInventoryVerified,
    fp0100PublicSecurityBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0100_PLAN,
      [
        "public-app security boundary contract",
        "local/proof-only",
        "no endpoints",
      ],
    ),
    fp0103EndpointArchitectureBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0103_PLAN,
      [
        "endpoint architecture proof contracts",
        "local/proof-only",
        "does not authorize endpoint implementation",
      ],
    ),
    fp0104EndpointReadinessBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0104_PLAN,
      [
        "endpoint implementation readiness",
        "exact future endpoint inventory",
        "| /mcp |",
      ],
    ),
    fp0105RouteOwnershipBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0105_PLAN,
      [
        "endpoint route ownership and transport-adapter proof-contract",
        "apps/control-plane fastify",
        "does not authorize endpoint implementation",
      ],
    ),
    fp0106BoundaryVerified: fp0106.fp0106BoundaryVerified,
    fp0107Absent: fp0107Absent(),
    noAppSubmission: publicAssets.noAppSubmission,
    noAppsSdkResourceImplementation:
      changedRuntime.noAppsSdkResourceImplementation,
    noEndpointImplementation: changedRuntime.noEndpointImplementation,
    noFinanceWrite: fp0106.noSourceMutationFinanceWriteFromFp0106,
    noListingCopy: publicAssets.noListingCopy,
    noModelCalls: sourceScan.noModelCalls,
    noOauthTokenSessionImplementation:
      changedRuntime.noOauthTokenSessionImplementation,
    noOpenAiApiCalls: sourceScan.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage: sourceScan.noOpenAiClientOrKeyUsage,
    noPublicAssets: publicAssets.noPublicAssets,
    noPublicChatGptAppImplementation:
      fp0106.noPublicAppImplementationFromFp0106,
    noRemoteMcpServerImplementation:
      changedRuntime.noRemoteMcpServerImplementation,
    noRouteImplementation: changedRuntime.noRouteImplementation,
    noSourceMutation: fp0106.noSourceMutationFinanceWriteFromFp0106,
    noWebApiBackendControlPlaneRouteImplementation:
      changedRuntime.noWebApiBackendControlPlaneRouteImplementation,
    noWriteActionTools: fp0106.noWriteActionToolsFromFp0106,
    publicAppProofGateNoOpenAiApiSourceScanVerified:
      sourceScan.publicAppProofGateNoOpenAiApiSourceScanVerified,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0106 MCP protocol envelope proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0106ProtocolEnvelopeBoundary() {
  const fp0106Hits = repoPaths.filter((path) => /(^|\/)FP-0106/u.test(path));
  const failed = {
    fp0106BoundaryVerified: false,
    mcpProtocolAcceptedMethodsVerified: false,
    mcpProtocolEnvelopeProofContractsFoundationVerified: false,
    mcpProtocolEvidenceEnvelopeVerified: false,
    mcpProtocolMethodCompatibilityWithOfficialSpecVerified: false,
    mcpProtocolPingBoundaryVerified: false,
    mcpProtocolReadOnlyToolDispatchVerified: false,
    mcpProtocolRefusalEnvelopeVerified: false,
    noApiBackendRoutesFromFp0106: false,
    noAppSubmissionFromFp0106: false,
    noAppsSdkResourceFromFp0106: false,
    noEndpointImplementationFromFp0106: false,
    noOpenAiApiCallsFromFp0106: false,
    noOauthTokenSessionImplementationFromFp0106: false,
    noPublicAppImplementationFromFp0106: false,
    noPublicAssetsSubmissionArtifactsFromFp0106: false,
    noRemoteMcpImplementationOrDeploymentFromFp0106: false,
    noRouteImplementationFromFp0106: false,
    noSourceMutationFinanceWriteFromFp0106: false,
    noWriteActionToolsFromFp0106: false,
  };

  if (
    fp0106Hits.length !== 1 ||
    fp0106Hits[0] !== FP0106_MCP_PROTOCOL_ENVELOPE_PLAN_PATH ||
    !existsSync(FP0106_MCP_PROTOCOL_ENVELOPE_PLAN_PATH)
  ) {
    return failed;
  }

  const normalized = normalize(
    readFileSync(FP0106_MCP_PROTOCOL_ENVELOPE_PLAN_PATH, "utf8"),
  );
  const changedRuntimeClear = changedRuntimeSurfaceBoundary();
  const publicAssetsClear = publicAssetSubmissionBoundary();
  const sourceScan = proofSourceNoOpenAiApiModelKeyScan();
  const mcpProtocolEnvelopeProofContractsFoundationVerified = [
    "fp-0106 is not implementation",
    "local/proof-only/read-only mcp protocol envelope and tool-dispatch contract work",
    "fp-0106 defines future mcp protocol envelope and read-only tool-dispatch proof contracts only",
    "fp-0106 keeps fp-0107 absent",
    "mcpprotocolenvelopeproofcontract",
    "mcpprotocolpathboundary",
    "mcpprotocoltransportboundary",
    "mcpprotocolacceptedmethodsboundary",
    "mcpprotocolpingboundary",
    "mcpprotocolmethodcompatibilitywithofficialspecboundary",
    "mcpprotocolrejectedmethodsboundary",
    "mcpprotocolinitializeboundary",
    "mcpprotocoltoolslistboundary",
    "mcpprotocoltoolscallboundary",
    "mcpprotocolreadonlytoolallowlistboundary",
    "mcpprotocoltoolschemaboundary",
    "mcpprotocolstructuredcontentboundary",
    "mcpprotocolevidenceenvelopeboundary",
    "mcpprotocolrefusalenvelopeboundary",
    "mcpprotocolargumentvalidationboundary",
    "mcpprotocolinvalidtoolfailclosedboundary",
    "mcpprotocolauthdeferredboundary",
    "mcpprotocolloggingredactionboundary",
    "mcpprotocolnorouteimplementationboundary",
    "mcpprotocolnoruntimeimplementationboundary",
    "mcpprotocolnoopenaiapimodelcallsboundary",
    "mcpprotocolproof",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolAcceptedMethodsVerified = [
    "initialize",
    "notifications/initialized",
    "tools/list",
    "tools/call",
    "liveness utility method",
    "ping",
    "all other methods must fail closed",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolPingBoundaryVerified = [
    "ping",
    "future protocol liveness request",
    "established mcp session",
    "empty json-rpc result",
    "must not dispatch to tools",
    "must not dispatch to evidence services",
    "must not dispatch to finance twin",
    "must not dispatch to cfo wiki",
    "no source mutation",
    "no finance write",
    "no openai api/model calls",
    "no external communications",
    "remains unimplemented in this correction",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolMethodCompatibilityWithOfficialSpecVerified = [
    "official model context protocol",
    "ping",
    "not a rejected method",
    "unknown non-ping methods still fail closed",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolReadOnlyToolDispatchVerified = [
    "search_evidence",
    "fetch_evidence_card",
    "fetch_source_anchor",
    "fetch_document_map",
    "fetch_source_coverage",
    "fetch_company_posture",
    "fetch_capability_boundaries",
    "dynamic tools and tool drift remain forbidden",
    "invalid tool names fail closed",
    "invalid arguments fail closed",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolEvidenceEnvelopeVerified = [
    "evidence",
    "source anchors",
    "freshness",
    "limitations",
    "permitted next actions",
    "capability boundary",
  ].every((requiredText) => normalized.includes(requiredText));
  const mcpProtocolRefusalEnvelopeVerified = [
    "refusal reason",
    "must not leak raw source files",
    "token values",
    "full evidence dumps",
    "provider credentials",
  ].every((requiredText) => normalized.includes(requiredText));
  const noEndpointImplementationFromFp0106 =
    normalized.includes("fp-0106 does not authorize endpoint implementation") &&
    changedRuntimeClear.noEndpointImplementation;
  const noRouteImplementationFromFp0106 =
    normalized.includes("fp-0106 does not authorize route implementation") &&
    normalized.includes("no route file may be created in fp-0106") &&
    changedRuntimeClear.noRouteImplementation;
  const noApiBackendRoutesFromFp0106 =
    normalized.includes(
      "fp-0106 does not authorize web api/backend/control-plane route implementation",
    ) && changedRuntimeClear.noWebApiBackendControlPlaneRouteImplementation;
  const noOauthTokenSessionImplementationFromFp0106 =
    normalized.includes(
      "fp-0106 does not authorize oauth/token/session implementation",
    ) && changedRuntimeClear.noOauthTokenSessionImplementation;
  const noRemoteMcpImplementationOrDeploymentFromFp0106 =
    normalized.includes(
      "fp-0106 does not authorize remote mcp server implementation or deployment",
    ) && changedRuntimeClear.noRemoteMcpServerImplementation;
  const noAppsSdkResourceFromFp0106 =
    normalized.includes(
      "fp-0106 does not authorize apps sdk iframe/resource implementation",
    ) && changedRuntimeClear.noAppsSdkResourceImplementation;
  const noAppSubmissionFromFp0106 =
    normalized.includes("fp-0106 does not authorize app submission") &&
    publicAssetsClear.noAppSubmission;
  const noOpenAiApiCallsFromFp0106 =
    normalized.includes("fp-0106 does not authorize openai api/model calls") &&
    sourceScan.publicAppProofGateNoOpenAiApiSourceScanVerified;
  const noSourceMutationFinanceWriteFromFp0106 =
    normalized.includes("no source mutation") &&
    normalized.includes("no finance write");
  const noPublicAppImplementationFromFp0106 = normalized.includes(
    "fp-0106 does not authorize public chatgpt app implementation",
  );
  const noWriteActionToolsFromFp0106 =
    normalized.includes("no write-action tools") ||
    normalized.includes("no write-action tool");
  const noPublicAssetsSubmissionArtifactsFromFp0106 =
    normalized.includes("no screenshots") &&
    normalized.includes("no generated images") &&
    normalized.includes("no public assets") &&
    normalized.includes("no listing copy") &&
    normalized.includes("no app-submission artifacts") &&
    publicAssetsClear.allClear;

  return {
    fp0106BoundaryVerified:
      mcpProtocolEnvelopeProofContractsFoundationVerified &&
      mcpProtocolAcceptedMethodsVerified &&
      mcpProtocolPingBoundaryVerified &&
      mcpProtocolMethodCompatibilityWithOfficialSpecVerified &&
      mcpProtocolReadOnlyToolDispatchVerified &&
      mcpProtocolEvidenceEnvelopeVerified &&
      mcpProtocolRefusalEnvelopeVerified &&
      noEndpointImplementationFromFp0106 &&
      noRouteImplementationFromFp0106 &&
      noApiBackendRoutesFromFp0106 &&
      noOauthTokenSessionImplementationFromFp0106 &&
      noRemoteMcpImplementationOrDeploymentFromFp0106 &&
      noAppsSdkResourceFromFp0106 &&
      noAppSubmissionFromFp0106 &&
      noOpenAiApiCallsFromFp0106 &&
      noSourceMutationFinanceWriteFromFp0106 &&
      noPublicAssetsSubmissionArtifactsFromFp0106 &&
      noPublicAppImplementationFromFp0106 &&
      noWriteActionToolsFromFp0106,
    mcpProtocolAcceptedMethodsVerified,
    mcpProtocolEnvelopeProofContractsFoundationVerified,
    mcpProtocolEvidenceEnvelopeVerified,
    mcpProtocolMethodCompatibilityWithOfficialSpecVerified,
    mcpProtocolPingBoundaryVerified,
    mcpProtocolReadOnlyToolDispatchVerified,
    mcpProtocolRefusalEnvelopeVerified,
    noApiBackendRoutesFromFp0106,
    noAppSubmissionFromFp0106,
    noAppsSdkResourceFromFp0106,
    noEndpointImplementationFromFp0106,
    noOpenAiApiCallsFromFp0106,
    noOauthTokenSessionImplementationFromFp0106,
    noPublicAppImplementationFromFp0106,
    noPublicAssetsSubmissionArtifactsFromFp0106,
    noRemoteMcpImplementationOrDeploymentFromFp0106,
    noRouteImplementationFromFp0106,
    noSourceMutationFinanceWriteFromFp0106,
    noWriteActionToolsFromFp0106,
  };
}

function changedRuntimeSurfaceBoundary() {
  const forbiddenChangedPaths = changedPaths
    .filter(
      (path) =>
        !isAllowedFp0107LocalRouteAdapterPath(path) &&
        !isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) &&
        !isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path),
    )
    .filter((path) =>
      [
        /^apps\/web\/app\//u,
        /^apps\/web\/pages\//u,
        /^apps\/web\/api\//u,
        /^apps\/control-plane\//u,
        /^packages\/api\//u,
        /^packages\/server\//u,
        /^packages\/backend\//u,
        /^packages\/db\//u,
      ].some((pattern) => pattern.test(path)),
    );
  const allClear = forbiddenChangedPaths.length === 0;

  return {
    allClear,
    noAppsSdkResourceImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedMcpProtocolProofPath(path) &&
          /apps-sdk|app-submission|submission-assets|iframe/iu.test(path),
      ),
    noEndpointImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedMcpProtocolProofPath(path) && endpointRuntimePath(path),
      ),
    noOauthTokenSessionImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedMcpProtocolProofPath(path) &&
          /oauth|token|session/iu.test(path),
      ),
    noRemoteMcpServerImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedMcpProtocolProofPath(path) &&
          /remote-mcp|mcp-server|deploy|deployment/iu.test(path),
      ),
    noRouteImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedFp0107LocalRouteAdapterPath(path) &&
          /(^|\/)route\.ts$/u.test(path),
      ),
    noWebApiBackendControlPlaneRouteImplementation: allClear,
  };
}

function isAllowedMcpProtocolProofPath(path) {
  return (
    isAllowedFp0107LocalRouteAdapterPath(path) ||
    isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) ||
    path === FP0106_MCP_PROTOCOL_ENVELOPE_PLAN_PATH ||
    path === FP0112_PLAN ||
    path === FP0113_PLAN ||
    path === FP0128_TOKEN_VALIDATION_READINESS_PLAN ||
    path === FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH ||
    path ===
      "plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md" ||
    path ===
      "plans/FP-0117-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan.md" ||
    isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path) ||
    path === "packages/domain/src/index.ts" ||
    path === "tools/read-only-mcp-oauth-security-boundary-proof.mjs" ||
    path === "tools/read-only-mcp-remote-host-readiness-proof.mjs" ||
    path === "tools/read-only-mcp-protocol-envelope-proof.mjs" ||
    path === "tools/read-only-endpoint-route-ownership-proof.mjs" ||
    path === "tools/read-only-endpoint-architecture-proof.mjs" ||
    path === "tools/read-only-public-app-security-boundary-proof.mjs" ||
    path === "tools/read-only-mcp-descriptor-response-envelope-proof.mjs" ||
    path === "tools/read-only-chatgpt-app-mcp-proof.mjs" ||
    path === "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs" ||
    path === FP0128_TOKEN_VALIDATION_READINESS_PROOF_PATH ||
    path === FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_PROOF_PATH ||
    path === "tools/benchmark-community-pack-proof.mjs" ||
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    isAllowedStaleDocRefreshPath(path)
  );
}

function isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) {
  return /^apps\/control-plane\/src\/modules\/evidence-index\/tools\/service(?:\.spec)?\.ts$/u.test(
    path,
  );
}

function isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path) {
  return (
    path === FP0125_LOCAL_ROUTE_PLAN ||
    path === FP0125_LOCAL_ROUTE_PATH ||
    path === FP0125_LOCAL_ROUTE_SPEC_PATH ||
    path === FP0125_LOCAL_ROUTE_PROOF_PATH
  );
}

function isAllowedStaleDocRefreshPath(path) {
  return [
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
  ].includes(path);
}

function publicAssetSubmissionBoundary() {
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  const forbidden = changedPaths.filter(
    (path) =>
      publicAssetPattern.test(path) ||
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
  );
  const allClear = forbidden.length === 0;

  return {
    allClear,
    noAppSubmission: allClear,
    noListingCopy: allClear,
    noPublicAssets: allClear,
  };
}

function docsOnlyPlanBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(readFileSync(path, "utf8"));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function fp0107Absent() {
  const fp0107Hits = repoPaths.filter((path) => /(^|\/)FP-0107/u.test(path));
  return (
    fp0107Hits.length === 0 ||
    (fp0107Hits.length === 1 &&
      fp0107Hits[0] ===
        "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md")
  );
}

function isAllowedFp0107LocalRouteAdapterPath(path) {
  return (
    path ===
      "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md" ||
    path ===
      "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md" ||
    path === "apps/control-plane/src/app.ts" ||
    path === "apps/control-plane/src/app.spec.ts" ||
    path === "apps/control-plane/src/lib/types.ts" ||
    path === "tools/read-only-mcp-route-adapter-proof.mjs" ||
    path === "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs" ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|schema|formatter|service|evidence-dispatcher)(?:\.spec)?\.ts$/u.test(
      path,
    )
  );
}

function endpointRuntimeRepositoryInventory() {
  const files = repoPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|json)$/u.test(path))
    .map((path) => ({ path, source: safeRead(path) }));
  return inspectEndpointRouteOwnershipRepositoryInventory(files);
}

function proofSourceNoOpenAiApiModelKeyScan() {
  const sourceText = readPublicAppProofGateSourceText();
  const noOpenAiApiCalls = !hasCodeLevelOpenAiIntegration(sourceText);
  const noModelCalls = !hasCodeLevelModelIntegration(sourceText);
  const noOpenAiClientOrKeyUsage =
    noOpenAiApiCalls && !hasCodeLevelOpenAiClientOrKeyUsage(sourceText);

  return {
    noModelCalls,
    noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
    publicAppProofGateNoOpenAiApiSourceScanVerified:
      noOpenAiApiCalls && noModelCalls && noOpenAiClientOrKeyUsage,
  };
}

function readPublicAppProofGateSourceText() {
  return repoPaths
    .filter(isPublicAppProofGateSourceSurface)
    .filter(
      (path) =>
        !path.endsWith(".spec.ts") &&
        !fp0123RouteInputSourceScanExcludedPaths.has(path),
    )
    .map((path) => safeRead(path))
    .join("\n");
}

function isPublicAppProofGateSourceSurface(path) {
  return (
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    /^tools\/(?:read-only|benchmark-community).*\.mjs$/u.test(path)
  );
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function hasCodeLevelOpenAiIntegration(sourceText) {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const checks = [
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    dottedPattern("responses", "create"),
    dottedPattern("chat", "completions"),
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
    new RegExp(`\\b${escapeRegExp(hostName)}\\b`, "u"),
    new RegExp(`\\bfetch\\s*\\(\\s*["'][^"']*${escapeRegExp(hostName)}`, "u"),
  ];

  return checks.some((check) => check.test(sourceText));
}

function hasCodeLevelOpenAiClientOrKeyUsage(sourceText) {
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  return [
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
  ].some((check) => check.test(sourceText));
}

function hasCodeLevelModelIntegration(sourceText) {
  const modelCallName = ["call", "Model"].join("");
  return [
    wordPattern(modelCallName),
    dottedPattern("model", "create"),
    dottedPattern("models", "create"),
    dottedPattern("chat", "completions"),
  ].some((check) => check.test(sourceText));
}

function endpointRuntimePath(path) {
  return (
    /(^|\/)route\.ts$/u.test(path) ||
    /endpoint|mcp-server|remote-mcp|oauth|session|token/iu.test(path)
  );
}

function dottedPattern(left, right) {
  return new RegExp(`\\b${left}\\s*\\.\\s*${right}\\b`, "u");
}

function wordPattern(name) {
  return new RegExp(`\\b${name}\\b`, "u");
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function changedFilePaths() {
  const tracked = runGit(["diff", "--name-only", "origin/main", "--"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  return [...new Set([...tracked, ...untracked].filter(Boolean))].sort();
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
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
