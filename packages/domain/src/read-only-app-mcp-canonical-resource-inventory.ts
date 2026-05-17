import { z } from "zod";
import {
  MCP_PROTECTED_RESOURCE_METADATA_OPTIONAL_FP0125_ROUTE_LIKE_PATHS,
  MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS,
  listMcpProtectedResourceMetadataRouteLikeRepositoryPaths,
} from "./read-only-app-mcp-protected-resource-metadata-inventory";

const trueLiteral = z.literal(true);

export const MCP_CANONICAL_RESOURCE_AUTH_SERVER_KNOWN_SAFE_ROUTE_LIKE_PATHS = [
  ...MCP_PROTECTED_RESOURCE_METADATA_KNOWN_SAFE_ROUTE_LIKE_PATHS,
] as const;

export const McpCanonicalResourceAuthServerInventoryProofSchema = z
  .object({
    noNewRoutePathRepositoryInventoryVerified: trueLiteral,
    knownSafeRouteInventoryVerified: trueLiteral,
    noUnexpectedRouteLikeRepositoryPaths: trueLiteral,
    canonicalResourceRouteInventoryDurabilityVerified: trueLiteral,
    fp0120PostmergeRouteInventoryProofVerified: trueLiteral,
    protectedResourceMetadataRouteRepositoryInventoryVerified: trueLiteral,
    wwwAuthenticateRouteRepositoryInventoryVerified: trueLiteral,
    oauthRuntimeRepositoryInventoryVerified: trueLiteral,
    tokenSessionRepositoryInventoryVerified: trueLiteral,
    authMiddlewareRepositoryInventoryVerified: trueLiteral,
    remoteMcpDeploymentRepositoryInventoryVerified: trueLiteral,
    canonicalResourceAuthServerNoOpenAiApiSourceScanVerified: trueLiteral,
  })
  .strict();

export type McpCanonicalResourceAuthServerInventoryProof = z.infer<
  typeof McpCanonicalResourceAuthServerInventoryProofSchema
>;

type InventoryBooleans = Record<
  keyof McpCanonicalResourceAuthServerInventoryProof,
  boolean
>;

export type McpCanonicalResourceAuthServerInventoryInput =
  Partial<InventoryBooleans>;

export type McpCanonicalResourceAuthServerRepositoryInventoryResult = Omit<
  InventoryBooleans,
  "canonicalResourceAuthServerNoOpenAiApiSourceScanVerified"
> & {
  missingKnownSafeRouteLikeRepositoryPaths: readonly string[];
  routeLikeRepositoryPaths: readonly string[];
  unexpectedRouteLikeRepositoryPaths: readonly string[];
};

export function buildMcpCanonicalResourceAuthServerInventoryProof(
  input: McpCanonicalResourceAuthServerInventoryInput = {},
): McpCanonicalResourceAuthServerInventoryProof {
  const noNewRoutePathRepositoryInventoryVerified =
    input.noNewRoutePathRepositoryInventoryVerified ?? true;
  const knownSafeRouteInventoryVerified =
    input.knownSafeRouteInventoryVerified ?? true;
  const noUnexpectedRouteLikeRepositoryPaths =
    input.noUnexpectedRouteLikeRepositoryPaths ?? true;
  const protectedResourceMetadataRouteRepositoryInventoryVerified =
    input.protectedResourceMetadataRouteRepositoryInventoryVerified ?? true;
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
  const canonicalResourceAuthServerNoOpenAiApiSourceScanVerified =
    input.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified ?? true;

  return McpCanonicalResourceAuthServerInventoryProofSchema.parse({
    authMiddlewareRepositoryInventoryVerified,
    canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    canonicalResourceRouteInventoryDurabilityVerified:
      (input.canonicalResourceRouteInventoryDurabilityVerified ?? true) &&
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    fp0120PostmergeRouteInventoryProofVerified:
      (input.fp0120PostmergeRouteInventoryProofVerified ?? true) &&
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    knownSafeRouteInventoryVerified,
    noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified,
    protectedResourceMetadataRouteRepositoryInventoryVerified,
    remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteRepositoryInventoryVerified,
  });
}

export function verifyMcpCanonicalResourceAuthServerRepositoryInventory(input: {
  repoPaths: readonly string[];
  changedPaths?: readonly string[];
  knownSafeRouteLikePaths?: readonly string[];
  routeSourceText?: string;
}): McpCanonicalResourceAuthServerRepositoryInventoryResult {
  const repoPaths = input.repoPaths.map(normalizePath);
  const runtimePaths = repoPaths.filter(isRuntimePath);
  const routeLikeRepositoryPaths =
    listMcpProtectedResourceMetadataRouteLikeRepositoryPaths(repoPaths);
  const knownSafeRouteLikePaths = sortUnique(
    (
      input.knownSafeRouteLikePaths ??
      MCP_CANONICAL_RESOURCE_AUTH_SERVER_KNOWN_SAFE_ROUTE_LIKE_PATHS
    ).map(normalizePath),
  );
  const allowedRouteLikePaths = sortUnique([
    ...knownSafeRouteLikePaths,
    ...MCP_PROTECTED_RESOURCE_METADATA_OPTIONAL_FP0125_ROUTE_LIKE_PATHS,
  ]);
  const unexpectedRouteLikeRepositoryPaths = routeLikeRepositoryPaths.filter(
    (path) => !allowedRouteLikePaths.includes(path),
  );
  const missingKnownSafeRouteLikeRepositoryPaths = knownSafeRouteLikePaths.filter(
    (path) => !routeLikeRepositoryPaths.includes(path),
  );
  const noUnexpectedRouteLikeRepositoryPaths =
    unexpectedRouteLikeRepositoryPaths.length === 0;
  const knownSafeRouteInventoryVerified =
    noUnexpectedRouteLikeRepositoryPaths &&
    missingKnownSafeRouteLikeRepositoryPaths.length === 0;
  const routeSourceText = input.routeSourceText ?? "";
  const changedRouteLikePaths = (input.changedPaths ?? [])
    .map(normalizePath)
    .filter(isRouteLikeRuntimePath);
  const unauthorizedChangedRouteLikePaths = changedRouteLikePaths.filter(
    (path) => !isFp0125ProtectedResourceMetadataLocalRoutePath(path),
  );
  const routeSourceHasAllowedFp0125Behavior =
    routeSourceHasProtectedResourceMetadataBehavior(routeSourceText) &&
    routeSourceHasOnlyFp0125ProtectedResourceMetadataBehavior(routeSourceText);
  const noNewRoutePathRepositoryInventoryVerified =
    unauthorizedChangedRouteLikePaths.length === 0 &&
    knownSafeRouteInventoryVerified &&
    (!routeSourceHasProtectedResourceMetadataBehavior(routeSourceText) ||
      routeSourceHasAllowedFp0125Behavior) &&
    !routeSourceHasWwwAuthenticateBehavior(routeSourceText);
  const unauthorizedProtectedResourceRoutePaths = runtimePaths
    .filter(isProtectedResourceMetadataRoutePath)
    .filter((path) => !isFp0125ProtectedResourceMetadataLocalRoutePath(path));
  const protectedResourceMetadataRouteRepositoryInventoryVerified =
    unauthorizedProtectedResourceRoutePaths.length === 0 &&
    (!routeSourceHasProtectedResourceMetadataBehavior(routeSourceText) ||
      routeSourceHasAllowedFp0125Behavior);
  const wwwAuthenticateRouteRepositoryInventoryVerified =
    !runtimePaths.some(isWwwAuthenticateRouteBehaviorPath) &&
    !routeSourceHasWwwAuthenticateBehavior(routeSourceText);
  const oauthRuntimeRepositoryInventoryVerified =
    !runtimePaths.some(isOauthRuntimePath);
  const tokenSessionRepositoryInventoryVerified = !runtimePaths.some(
    isTokenSessionRuntimePath,
  );
  const authMiddlewareRepositoryInventoryVerified = !runtimePaths.some(
    isAuthMiddlewareRuntimePath,
  );
  const remoteMcpDeploymentRepositoryInventoryVerified = !repoPaths.some(
    isRemoteMcpRuntimePath,
  );

  return {
    authMiddlewareRepositoryInventoryVerified,
    canonicalResourceRouteInventoryDurabilityVerified:
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    fp0120PostmergeRouteInventoryProofVerified:
      noNewRoutePathRepositoryInventoryVerified &&
      knownSafeRouteInventoryVerified &&
      noUnexpectedRouteLikeRepositoryPaths &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteRepositoryInventoryVerified,
    knownSafeRouteInventoryVerified,
    missingKnownSafeRouteLikeRepositoryPaths,
    noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified,
    protectedResourceMetadataRouteRepositoryInventoryVerified,
    routeLikeRepositoryPaths,
    remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    unexpectedRouteLikeRepositoryPaths,
    wwwAuthenticateRouteRepositoryInventoryVerified,
  };
}

export function verifyMcpCanonicalResourceAuthServerNoOpenAiApiSourceScan(input: {
  sourceText: string;
}) {
  const forbiddenExecutableMatches = collectForbiddenOpenAiExecutableMatches(
    input.sourceText,
  );

  return {
    canonicalResourceAuthServerNoOpenAiApiSourceScanVerified:
      forbiddenExecutableMatches.length === 0,
    forbiddenExecutableMatches,
  };
}

export function isFp0120CanonicalResourceAuthServerProofSourcePath(path: string) {
  const normalized = normalizePath(path);
  return (
    /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
      normalized,
    ) ||
    /^tools\/read-only-mcp-(?:canonical-resource-auth-server|protected-resource-metadata|oauth-implementation-sequencing).*\.mjs$/u.test(
      normalized,
    )
  );
}

function collectForbiddenOpenAiExecutableMatches(sourceText: string) {
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  const apiHost = ["api", "openai", "com"].join(".");
  const patterns = [
    { name: "openai-import", pattern: /(?:^|[^\w])import\s+[^;\n]*["']openai["']/u },
    { name: "openai-require", pattern: /\brequire\s*\(\s*["']openai["']\s*\)/u },
    { name: "openai-client", pattern: /\bnew\s+OpenAI\b/u },
    { name: "responses-create", pattern: /\bresponses\s*\.\s*create\b/u },
    { name: "chat-completions", pattern: /\bchat\s*\.\s*completions\b/u },
    {
      name: "openai-env-key",
      pattern: new RegExp(
        `(?:\\b${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\[\\s*["']${envKey}["']\\s*\\])`,
        "u",
      ),
    },
    { name: "openai-api-host", pattern: new RegExp(`\\b${escapeRegExp(apiHost)}\\b`, "u") },
    { name: "model-call", pattern: /\b(?:model|models)\s*\.\s*create\b/u },
  ];

  return sourceText.split("\n").flatMap((line, index) =>
    patterns
      .filter(({ pattern }) => pattern.test(line))
      .map(({ name }) => ({
        lineNumber: index + 1,
        patternName: name,
      })),
  );
}

function isRuntimePath(path: string) {
  return (
    !/\.spec\.ts$/u.test(path) &&
    (path.startsWith("apps/") ||
    path.startsWith("packages/") ||
    path.startsWith("tools/"))
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

function isProtectedResourceMetadataRoutePath(path: string) {
  return (
    isRouteLikeRuntimePath(path) &&
    /(?:\.well-known\/oauth-protected-resource|oauth-protected-resource|protected-resource-metadata|resource-metadata|resource_metadata)/iu.test(
      path,
    )
  );
}

function isFp0125ProtectedResourceMetadataLocalRoutePath(path: string) {
  return (
    normalizePath(path) ===
    MCP_PROTECTED_RESOURCE_METADATA_OPTIONAL_FP0125_ROUTE_LIKE_PATHS[0]
  );
}

function isWwwAuthenticateRouteBehaviorPath(path: string) {
  return (
    isRouteLikeRuntimePath(path) &&
    /(?:www-authenticate|resource-metadata-challenge|auth-challenge|resource_metadata)/iu.test(
      path,
    )
  );
}

function isOauthRuntimePath(path: string) {
  return /(?:^|\/)(?:oauth|oidc|pkce|authorization-server|token-exchange)(?:\/|\.|-|$)/iu.test(
    path,
  );
}

function isTokenSessionRuntimePath(path: string) {
  return /(?:token|session|cookie).*(?:store|repository|middleware|service)|(?:store|repository|middleware|service).*(?:token|session|cookie)/iu.test(
    path,
  );
}

function isAuthMiddlewareRuntimePath(path: string) {
  return /(?:auth|authorization).*(?:middleware|guard|strategy)|(?:middleware|guard|strategy).*(?:auth|authorization)/iu.test(
    path,
  );
}

function isRemoteMcpRuntimePath(path: string) {
  return (
    path.startsWith("apps/remote-mcp-server/") ||
    /(?:^|\/)(?:remote-mcp|public-mcp|mcp-server)(?:\/|\.|-|$)/iu.test(path) ||
    /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml)$/iu.test(
      path,
    )
  );
}

function routeSourceHasProtectedResourceMetadataBehavior(sourceText: string) {
  return /(?:oauth-protected-resource|protected-resource-metadata|resource_metadata)/iu.test(
    sourceText,
  );
}

function routeSourceHasOnlyFp0125ProtectedResourceMetadataBehavior(
  sourceText: string,
) {
  const metadataRouteMatches = sourceText.match(
    /\/\.well-known\/oauth-protected-resource(?:\/mcp)?/gu,
  );
  const exactPathOnly =
    metadataRouteMatches?.every(
      (path) => path === "/.well-known/oauth-protected-resource/mcp",
    ) ?? true;

  return (
    sourceText.includes(
      "READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH",
    ) &&
    exactPathOnly &&
    !/app\.(?:post|put|patch|delete)\(\s*READ_ONLY_APP_MCP_PROTECTED_RESOURCE_METADATA_ROUTE_PATH/u.test(
      sourceText,
    )
  );
}

function routeSourceHasWwwAuthenticateBehavior(sourceText: string) {
  return /(?:www-authenticate|resource_metadata\s*=|reply\.header\(\s*["']WWW-Authenticate["'])/iu.test(
    sourceText,
  );
}

function normalizePath(path: string) {
  return path.trim().replace(/^\.\/+/u, "");
}

function sortUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
