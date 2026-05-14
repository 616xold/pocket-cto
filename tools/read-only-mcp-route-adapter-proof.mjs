import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MCP_TOOL_ALLOWLIST,
  buildMcpToolDescriptorContracts,
} from "../packages/domain/src/index.ts";
import { registerReadOnlyAppMcpEndpointRoutes } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const requireFromControlPlane = createRequire(
  new URL("../apps/control-plane/package.json", import.meta.url),
);
const Fastify = requireFromControlPlane("fastify");
const SCHEMA_VERSION = "v2aa.read-only-app-mcp-local-route-adapter.v1";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
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
const ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts";
const SERVICE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.spec.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const routeAdapterFiles = [
  ROUTE_PATH,
  SERVICE_PATH,
  FORMATTER_PATH,
  SCHEMA_PATH,
  ROUTE_SPEC_PATH,
  SERVICE_SPEC_PATH,
];
const routeSource = safeRead(ROUTE_PATH);
const runtimeSource = [ROUTE_PATH, SERVICE_PATH, FORMATTER_PATH, SCHEMA_PATH]
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
  fp0108Absent: !repoPaths.some((path) => /(^|\/)FP-0108/u.test(path)),
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
    ROUTE_PATH,
    SERVICE_PATH,
    FORMATTER_PATH,
    SCHEMA_PATH,
    ROUTE_SPEC_PATH,
    SERVICE_SPEC_PATH,
    "apps/control-plane/src/app.ts",
    "tools/read-only-mcp-route-adapter-proof.mjs",
    "tools/read-only-mcp-protocol-envelope-proof.mjs",
    "tools/read-only-endpoint-route-ownership-proof.mjs",
    "tools/read-only-endpoint-architecture-proof.mjs",
    "tools/read-only-public-app-security-boundary-proof.mjs",
    "tools/read-only-mcp-descriptor-response-envelope-proof.mjs",
    "tools/read-only-chatgpt-app-mcp-proof.mjs",
    "tools/benchmark-community-pack-proof.mjs",
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
