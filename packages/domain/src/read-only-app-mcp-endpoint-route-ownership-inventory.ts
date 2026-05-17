export type EndpointRouteOwnershipRepositoryInventoryFile = {
  path: string;
  source?: string;
};

const FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

const FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts";

export function inspectEndpointRouteOwnershipRepositoryInventory(
  files: readonly EndpointRouteOwnershipRepositoryInventoryFile[],
) {
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
  file: EndpointRouteOwnershipRepositoryInventoryFile,
): boolean {
  if (isAllowedEndpointProofSurface(file.path)) return false;
  if (isAllowedHistoricalLocalPreviewSurface(file.path)) return false;
  if (isAllowedFp0107LocalRouteAdapterSurface(file)) return false;
  if (isAllowedFp0125LocalProtectedResourceMetadataRouteSurface(file)) {
    return false;
  }
  if (isAllowedShippedNonPublicRouteSurface(file.path)) return false;
  if (isAllowedHistoricalConnectorSurface(file.path)) return false;

  const source = file.source ?? "";
  return (
    looksLikePublicAppEndpointRuntimePath(file.path) ||
    looksLikePublicAppEndpointRuntimeSource(source)
  );
}

function isAllowedFp0125LocalProtectedResourceMetadataRouteSurface(
  file: EndpointRouteOwnershipRepositoryInventoryFile,
): boolean {
  if (file.path === FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_SPEC_PATH) {
    return true;
  }

  if (file.path !== FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH) {
    return false;
  }

  const source = file.source ?? "";
  return (
    source.includes("registerReadOnlyAppMcpProtectedResourceMetadataRoute") &&
    source.includes("READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH") &&
    source.includes('app.get(') &&
    !forbiddenFp0107RouteAdapterRuntimeSource(source) &&
    !/WWW-Authenticate|setCookie|tokenExchange|sessionHandler|listen\s*\(/iu.test(
      source,
    )
  );
}

function isAllowedFp0107LocalRouteAdapterSurface(
  file: EndpointRouteOwnershipRepositoryInventoryFile,
): boolean {
  const routeModule =
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|schema|formatter|service|evidence-dispatcher)(?:\.spec)?\.ts$/u.test(
      file.path,
    );
  const planOrProof =
    file.path ===
      "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md" ||
    file.path === "tools/read-only-mcp-route-adapter-proof.mjs";

  const source = file.source ?? "";
  if (routeModule && file.path.endsWith(".spec.ts")) {
    return true;
  }

  if (routeModule && file.path.endsWith("/routes.ts")) {
    return (
      source.includes("registerReadOnlyAppMcpEndpointRoutes") &&
      source.includes('app.post("/mcp"') &&
      !forbiddenFp0107RouteAdapterRuntimeSource(source)
    );
  }

  if (!routeModule && !planOrProof) return false;

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

function isAllowedEndpointProofSurface(path: string): boolean {
  return (
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    /^tools\/(?:read-only|benchmark-community|bounded-llm|document-precision|evidence-index).*\.mjs$/u.test(
      path,
    ) ||
    /^plans\/FP-0(?:087|098|099|100|101|102|103|104|105)-/u.test(path)
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
    path === "apps/control-plane/src/server.ts" ||
    path === "apps/control-plane/src/app.ts" ||
    path === "apps/control-plane/src/app.spec.ts"
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
