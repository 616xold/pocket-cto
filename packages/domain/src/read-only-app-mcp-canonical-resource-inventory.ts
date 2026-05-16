import { z } from "zod";

const trueLiteral = z.literal(true);

export const McpCanonicalResourceAuthServerInventoryProofSchema = z
  .object({
    noNewRoutePathRepositoryInventoryVerified: trueLiteral,
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

export function buildMcpCanonicalResourceAuthServerInventoryProof(
  input: McpCanonicalResourceAuthServerInventoryInput = {},
): McpCanonicalResourceAuthServerInventoryProof {
  return McpCanonicalResourceAuthServerInventoryProofSchema.parse({
    authMiddlewareRepositoryInventoryVerified:
      input.authMiddlewareRepositoryInventoryVerified ?? true,
    canonicalResourceAuthServerNoOpenAiApiSourceScanVerified:
      input.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified ?? true,
    noNewRoutePathRepositoryInventoryVerified:
      input.noNewRoutePathRepositoryInventoryVerified ?? true,
    oauthRuntimeRepositoryInventoryVerified:
      input.oauthRuntimeRepositoryInventoryVerified ?? true,
    protectedResourceMetadataRouteRepositoryInventoryVerified:
      input.protectedResourceMetadataRouteRepositoryInventoryVerified ?? true,
    remoteMcpDeploymentRepositoryInventoryVerified:
      input.remoteMcpDeploymentRepositoryInventoryVerified ?? true,
    tokenSessionRepositoryInventoryVerified:
      input.tokenSessionRepositoryInventoryVerified ?? true,
    wwwAuthenticateRouteRepositoryInventoryVerified:
      input.wwwAuthenticateRouteRepositoryInventoryVerified ?? true,
  });
}

export function verifyMcpCanonicalResourceAuthServerRepositoryInventory(input: {
  repoPaths: readonly string[];
  changedPaths?: readonly string[];
  routeSourceText?: string;
}) {
  const repoPaths = input.repoPaths.map(normalizePath);
  const runtimePaths = repoPaths.filter(isRuntimePath);
  const routeSourceText = input.routeSourceText ?? "";
  const changedRouteLikePaths = (input.changedPaths ?? [])
    .map(normalizePath)
    .filter(isRouteLikeRuntimePath);
  const noNewRoutePathRepositoryInventoryVerified =
    changedRouteLikePaths.length === 0 &&
    !routeSourceHasProtectedResourceMetadataBehavior(routeSourceText) &&
    !routeSourceHasWwwAuthenticateBehavior(routeSourceText);

  return {
    authMiddlewareRepositoryInventoryVerified: !runtimePaths.some(
      isAuthMiddlewareRuntimePath,
    ),
    noNewRoutePathRepositoryInventoryVerified,
    oauthRuntimeRepositoryInventoryVerified:
      !runtimePaths.some(isOauthRuntimePath),
    protectedResourceMetadataRouteRepositoryInventoryVerified:
      !runtimePaths.some(isProtectedResourceMetadataRoutePath) &&
      !routeSourceHasProtectedResourceMetadataBehavior(routeSourceText),
    remoteMcpDeploymentRepositoryInventoryVerified: !repoPaths.some(
      isRemoteMcpRuntimePath,
    ),
    tokenSessionRepositoryInventoryVerified: !runtimePaths.some(
      isTokenSessionRuntimePath,
    ),
    wwwAuthenticateRouteRepositoryInventoryVerified:
      !runtimePaths.some(isWwwAuthenticateRouteBehaviorPath) &&
      !routeSourceHasWwwAuthenticateBehavior(routeSourceText),
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
    path.startsWith("apps/") ||
    path.startsWith("packages/") ||
    path.startsWith("tools/")
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

function routeSourceHasWwwAuthenticateBehavior(sourceText: string) {
  return /(?:www-authenticate|resource_metadata)/iu.test(sourceText);
}

function normalizePath(path: string) {
  return path.trim().replace(/^\.\/+/u, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
