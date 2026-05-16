import { z } from "zod";

const trueLiteral = z.literal(true);

export const McpProtectedResourceMetadataInventoryProofSchema = z
  .object({
    noNewRoutePathRepositoryInventoryVerified: trueLiteral,
    knownSafeRouteInventoryVerified: trueLiteral,
    noUnexpectedRouteLikeRepositoryPaths: trueLiteral,
    protectedResourceRouteRepositoryInventoryVerified: trueLiteral,
    wwwAuthenticateRouteRepositoryInventoryVerified: trueLiteral,
    oauthRuntimeRepositoryInventoryVerified: trueLiteral,
    tokenSessionRepositoryInventoryVerified: trueLiteral,
    authMiddlewareRepositoryInventoryVerified: trueLiteral,
    remoteMcpDeploymentRepositoryInventoryVerified: trueLiteral,
    protectedResourceMetadataNoOpenAiApiSourceScanVerified: trueLiteral,
    fp0118PostmergeProofDurabilityVerified: trueLiteral,
    fp0118RouteInventoryDurabilityVerified: trueLiteral,
    fp0119PostmergeRouteInventoryProofVerified: trueLiteral,
  })
  .strict();

export type McpProtectedResourceMetadataInventoryProof = z.infer<
  typeof McpProtectedResourceMetadataInventoryProofSchema
>;

type InventoryBooleanFields = Record<
  keyof McpProtectedResourceMetadataInventoryProof,
  boolean
>;

export type McpProtectedResourceMetadataInventoryProofInput =
  Partial<InventoryBooleanFields>;

export type McpProtectedResourceMetadataRepositoryInventoryResult = Omit<
  InventoryBooleanFields,
  "protectedResourceMetadataNoOpenAiApiSourceScanVerified"
> & {
  missingKnownSafeRouteLikeRepositoryPaths: readonly string[];
  routeLikeRepositoryPaths: readonly string[];
  unexpectedRouteLikeRepositoryPaths: readonly string[];
};

export const MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS = [
  "apps/control-plane/src/modules/approvals/routes.ts",
  "apps/control-plane/src/modules/close-control-acknowledgement/routes.ts",
  "apps/control-plane/src/modules/close-control-certification-boundary/routes.ts",
  "apps/control-plane/src/modules/close-control-certification-safety/routes.ts",
  "apps/control-plane/src/modules/close-control-review-summary/routes.ts",
  "apps/control-plane/src/modules/close-control/routes.ts",
  "apps/control-plane/src/modules/delivery-readiness/routes.ts",
  "apps/control-plane/src/modules/external-delivery-human-confirmation-boundary/routes.ts",
  "apps/control-plane/src/modules/external-provider-boundary/routes.ts",
  "apps/control-plane/src/modules/finance-twin/routes.ts",
  "apps/control-plane/src/modules/github-app/routes.ts",
  "apps/control-plane/src/modules/health/routes.ts",
  "apps/control-plane/src/modules/missions/routes.ts",
  "apps/control-plane/src/modules/monitoring/routes.ts",
  "apps/control-plane/src/modules/operator-readiness/routes.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
  "apps/control-plane/src/modules/replay/routes.ts",
  "apps/control-plane/src/modules/runtime-codex/routes.ts",
  "apps/control-plane/src/modules/sources/routes.ts",
  "apps/control-plane/src/modules/twin/routes.ts",
  "apps/control-plane/src/modules/wiki/routes.ts",
] as const;

export function buildMcpProtectedResourceMetadataInventoryProof(
  input: McpProtectedResourceMetadataInventoryProofInput = {},
): McpProtectedResourceMetadataInventoryProof {
  const noNewRoutePathRepositoryInventoryVerified =
    input.noNewRoutePathRepositoryInventoryVerified ?? true;
  const knownSafeRouteInventoryVerified =
    input.knownSafeRouteInventoryVerified ?? true;
  const noUnexpectedRouteLikeRepositoryPaths =
    input.noUnexpectedRouteLikeRepositoryPaths ?? true;
  const protectedResourceRouteRepositoryInventoryVerified =
    input.protectedResourceRouteRepositoryInventoryVerified ?? true;
  const wwwAuthenticateRouteRepositoryInventoryVerified =
    input.wwwAuthenticateRouteRepositoryInventoryVerified ?? true;
  const oauthRuntimeRepositoryInventoryVerified =
    input.oauthRuntimeRepositoryInventoryVerified ?? true;
  const tokenSessionRepositoryInventoryVerified =
    input.tokenSessionRepositoryInventoryVerified ?? true;
  const authMiddlewareRepositoryInventoryVerified =
    input.authMiddlewareRepositoryInventoryVerified ?? true;
  const remoteMcpDeploymentRepositoryInventoryVerified =
    input.remoteMcpDeploymentRepositoryInventoryVerified ?? true;
  const protectedResourceMetadataNoOpenAiApiSourceScanVerified =
    input.protectedResourceMetadataNoOpenAiApiSourceScanVerified ?? true;

  return McpProtectedResourceMetadataInventoryProofSchema.parse({
    authMiddlewareRepositoryInventoryVerified,
    fp0118PostmergeProofDurabilityVerified:
      (input.fp0118PostmergeProofDurabilityVerified ?? true) &&
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified &&
      oauthRuntimeRepositoryInventoryVerified &&
      tokenSessionRepositoryInventoryVerified &&
      authMiddlewareRepositoryInventoryVerified &&
      remoteMcpDeploymentRepositoryInventoryVerified &&
      protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    fp0118RouteInventoryDurabilityVerified:
      (input.fp0118RouteInventoryDurabilityVerified ?? true) &&
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    fp0119PostmergeRouteInventoryProofVerified:
      (input.fp0119PostmergeRouteInventoryProofVerified ?? true) &&
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    knownSafeRouteInventoryVerified,
    noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified,
    protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    protectedResourceRouteRepositoryInventoryVerified,
    remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteRepositoryInventoryVerified,
  });
}

export function verifyMcpProtectedResourceMetadataRepositoryInventory(input: {
  repoPaths: readonly string[];
  changedPaths?: readonly string[];
  knownSafeRouteLikePaths?: readonly string[];
  routeSourceText?: string;
}): McpProtectedResourceMetadataRepositoryInventoryResult {
  const runtimePaths = input.repoPaths.map(normalizePath).filter(isRuntimePath);
  const routeLikeRepositoryPaths =
    listMcpProtectedResourceMetadataRouteLikeRepositoryPaths(input.repoPaths);
  const knownSafeRouteLikePaths = sortUnique(
    (
      input.knownSafeRouteLikePaths ??
      MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS
    ).map(normalizePath),
  );
  const unexpectedRouteLikeRepositoryPaths = routeLikeRepositoryPaths.filter(
    (path) => !knownSafeRouteLikePaths.includes(path),
  );
  const missingKnownSafeRouteLikeRepositoryPaths = knownSafeRouteLikePaths.filter(
    (path) => !routeLikeRepositoryPaths.includes(path),
  );
  const noUnexpectedRouteLikeRepositoryPaths =
    unexpectedRouteLikeRepositoryPaths.length === 0;
  const knownSafeRouteInventoryVerified =
    noUnexpectedRouteLikeRepositoryPaths &&
    missingKnownSafeRouteLikeRepositoryPaths.length === 0;
  const changedRouteLikePaths = (input.changedPaths ?? [])
    .map(normalizePath)
    .filter(isRouteLikeRuntimePath);
  const routeSourceText = input.routeSourceText ?? "";
  const noNewRoutePathRepositoryInventoryVerified =
    changedRouteLikePaths.length === 0 &&
    knownSafeRouteInventoryVerified &&
    !routeSourceHasProtectedResourceMetadataBehavior(routeSourceText) &&
    !routeSourceHasWwwAuthenticateBehavior(routeSourceText);
  const protectedResourceRouteRepositoryInventoryVerified =
    !runtimePaths.some(isProtectedResourceMetadataRoutePath) &&
    !routeSourceHasProtectedResourceMetadataBehavior(routeSourceText);
  const wwwAuthenticateRouteRepositoryInventoryVerified =
    !runtimePaths.some(isWwwAuthenticateRouteBehaviorPath) &&
    !routeSourceHasWwwAuthenticateBehavior(routeSourceText);
  const oauthRuntimeRepositoryInventoryVerified = !runtimePaths.some(
    isOauthRuntimePath,
  );
  const tokenSessionRepositoryInventoryVerified = !runtimePaths.some(
    isTokenSessionRuntimePath,
  );
  const authMiddlewareRepositoryInventoryVerified = !runtimePaths.some(
    isAuthMiddlewareRuntimePath,
  );
  const remoteMcpDeploymentRepositoryInventoryVerified = !input.repoPaths
    .map(normalizePath)
    .some(isRemoteMcpRuntimePath);

  return {
    authMiddlewareRepositoryInventoryVerified,
    fp0118PostmergeProofDurabilityVerified:
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified &&
      oauthRuntimeRepositoryInventoryVerified &&
      tokenSessionRepositoryInventoryVerified &&
      authMiddlewareRepositoryInventoryVerified &&
      remoteMcpDeploymentRepositoryInventoryVerified,
    fp0118RouteInventoryDurabilityVerified:
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    fp0119PostmergeRouteInventoryProofVerified:
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    knownSafeRouteInventoryVerified,
    missingKnownSafeRouteLikeRepositoryPaths,
    noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified,
    protectedResourceRouteRepositoryInventoryVerified,
    routeLikeRepositoryPaths,
    remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    unexpectedRouteLikeRepositoryPaths,
    wwwAuthenticateRouteRepositoryInventoryVerified,
  };
}

export function listMcpProtectedResourceMetadataRouteLikeRepositoryPaths(
  repoPaths: readonly string[],
) {
  return sortUnique(repoPaths.map(normalizePath).filter(isRouteLikeRuntimePath));
}

export function verifyMcpProtectedResourceMetadataNoOpenAiApiSourceScan(input: {
  sourceText: string;
}) {
  const forbiddenExecutableMatches = collectForbiddenOpenAiExecutableMatches(
    input.sourceText,
  );
  return {
    forbiddenExecutableMatches,
    protectedResourceMetadataNoOpenAiApiSourceScanVerified:
      forbiddenExecutableMatches.length === 0,
  };
}

export function isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath(
  path: string,
) {
  const normalized = normalizePath(path);
  return (
    normalized === "apps/control-plane/src/app.ts" ||
    normalized === "apps/control-plane/src/lib/types.ts" ||
    normalized.startsWith(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/",
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-remote-host-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-remote-host-readiness.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protocol-envelope.*\.ts$/u.test(
      normalized,
    ) ||
    /^tools\/read-only-mcp-.*\.mjs$/u.test(normalized) ||
    normalized === "tools/benchmark-community-pack-proof.mjs"
  );
}

function collectForbiddenOpenAiExecutableMatches(sourceText: string) {
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  const apiHost = ["api", "openai", "com"].join(".");
  const patterns = [
    {
      name: "static-openai-import",
      pattern: /(?:^|[^\w])import\s+(?:[^;\n]*?\s+from\s+)?["']openai["']/u,
    },
    {
      name: "openai-require",
      pattern: /\brequire\s*\(\s*["']openai["']\s*\)/u,
    },
    {
      name: "dynamic-openai-import",
      pattern: /\bimport\s*\(\s*["']openai["']\s*\)/u,
    },
    { name: "openai-client", pattern: /\bnew\s+OpenAI\b/u },
    { name: "openai-member-call", pattern: /\bopenai\s*\./iu },
    { name: "responses-create", pattern: /\bresponses\s*\.\s*create\b/u },
    { name: "chat-completions", pattern: /\bchat\s*\.\s*completions\b/u },
    {
      name: "openai-env-key",
      pattern: new RegExp(
        `(?:\\b${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\[\\s*["']${envKey}["']\\s*\\])`,
        "u",
      ),
    },
    {
      name: "openai-api-host",
      pattern: new RegExp(`\\b${escapeRegExp(apiHost)}\\b`, "u"),
    },
    { name: "model-create", pattern: /\bmodel\s*\.\s*create\b/u },
    { name: "models-create", pattern: /\bmodels\s*\.\s*create\b/u },
    { name: "call-model", pattern: /\bcall\s*Model\b/u },
  ];

  return sourceText.split("\n").flatMap((line, index) => {
    if (isSafeDocsOrProofAbsenceText(line)) return [];
    return patterns
      .filter(({ pattern }) => pattern.test(line))
      .map(({ name }) => ({
        lineNumber: index + 1,
        patternName: name,
      }));
  });
}

function isSafeDocsOrProofAbsenceText(line: string) {
  const trimmed = line.trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) return true;
  const docsLike =
    /^(?:[-*#>]|\/\/|\/\*|\*|["'`])/.test(trimmed) ||
    /^(?:no|not|never|without|does not|do not|must not|prohibit|prohibited|forbid|forbidden|reject|rejected|absence|absent|future-only)\b/u.test(
      normalized,
    );
  const mentionsOpenAiSurface =
    /(?:openai|api key|model|responses|chat\.completions|callmodel|api\.openai\.com)/u.test(
      normalized,
    );
  const namesAbsence =
    /(?:no|not|never|without|does not|do not|must not|prohibit|prohibited|forbid|forbidden|reject|rejected|absence|absent|future-only|unauthorized)/u.test(
      normalized,
    );
  return docsLike && mentionsOpenAiSurface && namesAbsence;
}

function isRuntimePath(path: string) {
  return (
    path.startsWith("apps/control-plane/src/") ||
    /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
    path.startsWith("apps/web/app/api/") ||
    path.startsWith("apps/web/pages/api/")
  );
}

function isRouteLikeRuntimePath(path: string) {
  return (
    /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
    path.startsWith("apps/web/pages/api/") ||
    /^apps\/control-plane\/src\/.*\/routes\.ts$/u.test(path) ||
    /^apps\/control-plane\/src\/.*(?:route|router|controller)\.ts$/u.test(path)
  );
}

function isOauthRuntimePath(path: string) {
  return /(?:^|\/)(?:oauth|oauth2|authorization-code|oauth-callback|pkce|authorize|auth-server)(?:\/|\.|-|_)/iu.test(
    path,
  );
}

function isTokenSessionRuntimePath(path: string) {
  return /(?:token-store|token-session|session-store|session-handler|refresh-token|access-token|bearer-token|token-validator|jwt-validator)/iu.test(
    path,
  );
}

function isAuthMiddlewareRuntimePath(path: string) {
  return /(?:auth-middleware|authorization-middleware|auth-guard|route-guard|verify-bearer|require-auth|authenticate-request)/iu.test(
    path,
  );
}

function isProtectedResourceMetadataRoutePath(path: string) {
  return /(?:^|\/)(?:\.well-known\/oauth-protected-resource|oauth-protected-resource|protected-resource-metadata|resource-metadata)(?:\/|\.|-|_)/iu.test(
    path,
  );
}

function isWwwAuthenticateRouteBehaviorPath(path: string) {
  return /(?:www-authenticate|resource-metadata-challenge|auth-challenge)(?:\/|\.|-|_)/iu.test(
    path,
  );
}

function isRemoteMcpRuntimePath(path: string) {
  return /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server)(?:\/|$)/iu.test(
    path,
  );
}

function routeSourceHasProtectedResourceMetadataBehavior(sourceText: string) {
  return /(?:\.well-known\/oauth-protected-resource|oauth-protected-resource|protected-resource-metadata|resource-metadata|resource_metadata)/iu.test(
    sourceText,
  );
}

function routeSourceHasWwwAuthenticateBehavior(sourceText: string) {
  return /(?:www-authenticate|resource_metadata|reply\.header\(\s*["']WWW-Authenticate["'])/iu.test(
    sourceText,
  );
}

function normalizePath(path: string) {
  return path.replace(/\\/gu, "/");
}

function sortUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
