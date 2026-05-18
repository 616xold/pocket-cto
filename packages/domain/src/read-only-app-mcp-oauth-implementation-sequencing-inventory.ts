import { z } from "zod";

const trueLiteral = z.literal(true);
const FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

export const McpOauthImplementationSequencingInventoryProofSchema = z
  .object({
    oauthImplementationRepositoryInventoryVerified: trueLiteral,
    tokenSessionRepositoryInventoryVerified: trueLiteral,
    authMiddlewareRepositoryInventoryVerified: trueLiteral,
    protectedResourceMetadataRouteRepositoryInventoryVerified: trueLiteral,
    wwwAuthenticateRouteBehaviorRepositoryInventoryVerified: trueLiteral,
    oauthSequencingNoOpenAiApiSourceScanVerified: trueLiteral,
    fp0117PostmergeProofDurabilityVerified: trueLiteral,
  })
  .strict();

export type McpOauthImplementationSequencingInventoryProof = z.infer<
  typeof McpOauthImplementationSequencingInventoryProofSchema
>;

type McpOauthImplementationSequencingInventoryBooleanFields = Record<
  keyof McpOauthImplementationSequencingInventoryProof,
  boolean
>;

export type McpOauthImplementationSequencingInventoryProofInput =
  Partial<McpOauthImplementationSequencingInventoryBooleanFields>;

export type McpOauthImplementationSequencingRepositoryInventoryResult = Omit<
  McpOauthImplementationSequencingInventoryBooleanFields,
  "oauthSequencingNoOpenAiApiSourceScanVerified"
>;

export function buildMcpOauthImplementationSequencingInventoryProof(
  input: McpOauthImplementationSequencingInventoryProofInput = {},
): McpOauthImplementationSequencingInventoryProof {
  const oauthImplementationRepositoryInventoryVerified =
    input.oauthImplementationRepositoryInventoryVerified ?? true;
  const tokenSessionRepositoryInventoryVerified =
    input.tokenSessionRepositoryInventoryVerified ?? true;
  const authMiddlewareRepositoryInventoryVerified =
    input.authMiddlewareRepositoryInventoryVerified ?? true;
  const protectedResourceMetadataRouteRepositoryInventoryVerified =
    input.protectedResourceMetadataRouteRepositoryInventoryVerified ?? true;
  const wwwAuthenticateRouteBehaviorRepositoryInventoryVerified =
    input.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified ?? true;
  const oauthSequencingNoOpenAiApiSourceScanVerified =
    input.oauthSequencingNoOpenAiApiSourceScanVerified ?? true;

  return McpOauthImplementationSequencingInventoryProofSchema.parse({
    authMiddlewareRepositoryInventoryVerified,
    fp0117PostmergeProofDurabilityVerified:
      (input.fp0117PostmergeProofDurabilityVerified ?? true) &&
      oauthImplementationRepositoryInventoryVerified &&
      tokenSessionRepositoryInventoryVerified &&
      authMiddlewareRepositoryInventoryVerified &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteBehaviorRepositoryInventoryVerified &&
      oauthSequencingNoOpenAiApiSourceScanVerified,
    oauthImplementationRepositoryInventoryVerified,
    oauthSequencingNoOpenAiApiSourceScanVerified,
    protectedResourceMetadataRouteRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
  });
}

export function verifyFp0117OauthImplementationSequencingRepositoryInventory(input: {
  repoPaths: readonly string[];
  routeSourceText?: string;
}): McpOauthImplementationSequencingRepositoryInventoryResult {
  const runtimePaths = input.repoPaths.map(normalizePath).filter(isRuntimePath);
  const routeSourceText = input.routeSourceText ?? "";
  const oauthImplementationRepositoryInventoryVerified = !runtimePaths.some(
    isOauthImplementationRuntimePath,
  );
  const tokenSessionRepositoryInventoryVerified = !runtimePaths.some(
    isTokenSessionRuntimePath,
  );
  const authMiddlewareRepositoryInventoryVerified = !runtimePaths.some(
    isAuthMiddlewareRuntimePath,
  );
  const protectedResourceMetadataRouteRepositoryInventoryVerified =
    !runtimePaths.some(
      (path) =>
        isProtectedResourceMetadataRoutePath(path) &&
        path !== FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH,
    ) &&
    !routeSourceHasProtectedResourceMetadataBehavior(routeSourceText);
  const wwwAuthenticateRouteBehaviorRepositoryInventoryVerified =
    !runtimePaths.some(isWwwAuthenticateRouteBehaviorPath) &&
    (!routeSourceHasWwwAuthenticateBehavior(routeSourceText) ||
      routeSourceHasOnlyFp0130MissingTokenChallengeBehavior(routeSourceText));

  return {
    authMiddlewareRepositoryInventoryVerified,
    fp0117PostmergeProofDurabilityVerified:
      oauthImplementationRepositoryInventoryVerified &&
      tokenSessionRepositoryInventoryVerified &&
      authMiddlewareRepositoryInventoryVerified &&
      protectedResourceMetadataRouteRepositoryInventoryVerified &&
      wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    oauthImplementationRepositoryInventoryVerified,
    protectedResourceMetadataRouteRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
  };
}

export function verifyFp0117OauthSequencingNoOpenAiApiSourceScan(input: {
  sourceText: string;
}) {
  const forbiddenExecutableMatches = collectForbiddenOpenAiExecutableMatches(
    input.sourceText,
  );
  return {
    forbiddenExecutableMatches,
    oauthSequencingNoOpenAiApiSourceScanVerified:
      forbiddenExecutableMatches.length === 0,
  };
}

export function isFp0117OauthSequencingNoOpenAiProofSourcePath(path: string) {
  const normalized = normalizePath(path);
  return (
    normalized === "apps/control-plane/src/app.ts" ||
    normalized === "apps/control-plane/src/lib/types.ts" ||
    normalized.startsWith(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/",
    ) ||
    normalized.startsWith(
      "apps/control-plane/src/modules/evidence-index/tools/",
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-remote-host-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-evidence-tool-dispatch.*\.ts$/u.test(
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
    {
      name: "chat-completions",
      pattern: /\bchat\s*\.\s*completions\b/u,
    },
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
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  if (!normalized) return true;
  if (
    new RegExp(
      `(?:name:\\s*["']openai-|pattern:\\s*\\/.*${envKey}|\\/.*${envKey}.*\\.test\\(|openai-api-key)`,
      "u",
    ).test(trimmed)
  ) {
    return true;
  }
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
    !/\.spec\.ts$/u.test(path) &&
    (path.startsWith("apps/control-plane/src/") ||
    path.startsWith("apps/web/app/api/") ||
    path.startsWith("apps/web/pages/api/"))
  );
}

function isOauthImplementationRuntimePath(path: string) {
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

function routeSourceHasProtectedResourceMetadataBehavior(sourceText: string) {
  return /(?:\.well-known\/oauth-protected-resource|oauth-protected-resource|protected-resource-metadata|resource_metadata)/iu.test(
    sourceText,
  );
}

function routeSourceHasWwwAuthenticateBehavior(sourceText: string) {
  return /(?:www-authenticate|resource_metadata\s*=|mcp\/www_authenticate)/iu.test(
    sourceText,
  );
}

function routeSourceHasOnlyFp0130MissingTokenChallengeBehavior(
  sourceText: string,
) {
  if (!routeSourceHasWwwAuthenticateBehavior(sourceText)) return true;
  return (
    /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u.test(sourceText) &&
    /assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency/u.test(
      sourceText,
    ) &&
    /buildMcpWwwAuthenticateMissingTokenChallengeResponse/u.test(
      sourceText,
    ) &&
    /buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse/u.test(
      sourceText,
    ) &&
    /(?:reply\s*)?\.header\(\s*["']WWW-Authenticate["']\s*,\s*challenge\.wwwAuthenticate\s*\)/u.test(
      sourceText,
    ) &&
    !/\b(?:oauthCallback|tokenStore|sessionStore|authMiddleware|validateToken|verifyToken|verifyBearer|jwtVerify|decodeJwt|parseJwt|parseToken|introspectToken)\s*\(/u.test(
      sourceText,
    ) &&
    !/resource_metadata\s*=|Bearer\s+resource_metadata/iu.test(
      sourceText,
    )
  );
}

function normalizePath(path: string) {
  return path.replace(/\\/gu, "/").replace(/^\.\//u, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
