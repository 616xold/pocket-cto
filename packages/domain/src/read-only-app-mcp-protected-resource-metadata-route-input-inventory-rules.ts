import {
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
} from "./read-only-app-mcp-protected-resource-metadata-route-input-contracts";
import { FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH } from "./read-only-app-mcp-token-validation-contracts";
import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
} from "./read-only-app-mcp-www-authenticate-contracts";

export const FP0123_ROUTE_INPUT_ALLOWED_CHANGED_PATHS = [
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  "apps/control-plane/src/app.ts",
  "apps/control-plane/src/app.spec.ts",
  "apps/control-plane/src/lib/types.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts",
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_MODULE_PATH,
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-contracts.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata.spec.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof-schema.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof.spec.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-proof.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-inventory.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-builders.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-contracts.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-proof.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.spec.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-boundary-hardening.spec.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-contracts.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-proof.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.spec.ts",
  "packages/domain/src/read-only-app-mcp-remote-host-resource.spec.ts",
  "packages/domain/src/index.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs",
  "tools/read-only-mcp-canonical-resource-auth-server-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-proof.mjs",
  "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs",
  "tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs",
  "tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs",
  "tools/read-only-mcp-token-validation-readiness-proof.mjs",
  "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs",
  "tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs",
  "tools/read-only-mcp-evidence-tool-dispatch-proof.mjs",
  "tools/read-only-mcp-route-adapter-proof.mjs",
  "tools/read-only-mcp-protocol-envelope-proof.mjs",
  "tools/read-only-endpoint-route-ownership-proof.mjs",
  "tools/read-only-endpoint-architecture-proof.mjs",
  "tools/read-only-public-app-security-boundary-proof.mjs",
  "tools/read-only-mcp-descriptor-response-envelope-proof.mjs",
  "tools/read-only-chatgpt-app-mcp-proof.mjs",
  "tools/read-only-mcp-remote-host-resource-boundary-proof.mjs",
  "tools/benchmark-community-pack-proof.mjs",
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
] as const;

export function isFp0123RouteInputAllowedChangedPath(path: string) {
  return (
    FP0123_ROUTE_INPUT_ALLOWED_CHANGED_PATHS.includes(
      path as (typeof FP0123_ROUTE_INPUT_ALLOWED_CHANGED_PATHS)[number],
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-(?:canonical-resource|oauth-implementation-sequencing|remote-host-resource|oauth-security|remote-host-readiness|evidence-tool-dispatch|protocol-envelope|endpoint-route-ownership|endpoint-architecture|public-security).*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-token-validation.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path)
  );
}

export function collectForbiddenOpenAiExecutableMatches(sourceText: string) {
  const envKey = ["OPENAI", "API", "KEY"].join("_");
  const envPrefix = ["OPENAI", "API"].join("_");
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
        `(?:\\b${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${envKey}\\b|\\bprocess\\s*\\.\\s*env\\s*\\[\\s*["']${envKey}["']\\s*\\]|\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${envPrefix}\\b)`,
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

export function noDeploymentPublicAssetRepositoryPaths(
  paths: readonly string[],
) {
  return (
    !paths.some(isRemoteMcpDeploymentPath) &&
    !paths.some(isCurrentRemoteDeploymentConfigPath) &&
    !paths.some(isAppsSdkResourcePath) &&
    !paths.some(isAppSubmissionPublicAssetPath) &&
    !paths.some(isPublicAssetPath)
  );
}

export function noPackageScriptChanges(paths: readonly string[]) {
  return !paths.some((path) => /(?:^|\/)package\.json$/u.test(path));
}

export function noDbSchemaMigrationChanges(paths: readonly string[]) {
  return !paths.some(
    (path) =>
      /^packages\/db\//u.test(path) ||
      /(?:^|\/)migrations?\//iu.test(path) ||
      /\.(?:sql)$/iu.test(path),
  );
}

export function noDeploymentConfigChanges(paths: readonly string[]) {
  return !paths.some(
    (path) =>
      isHostedDeploymentConfigPath(path) || isRemoteMcpDeploymentPath(path),
  );
}

export function noPublicAssetPathChanges(paths: readonly string[]) {
  return !paths.some(isPublicAssetPath);
}

export function noAppsSdkPathChanges(paths: readonly string[]) {
  return !paths.some(isAppsSdkResourcePath);
}

export function noAppSubmissionPathChanges(paths: readonly string[]) {
  return !paths.some(isAppSubmissionPublicAssetPath);
}

export function hasAuthRuntimeSource(sourceText: string) {
  return /\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier|authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie|tokenStore|sessionStore|sessionHandler|refreshTokenStore)\s*\(/u.test(
    sourceText,
  );
}

export function hasAppsSdkRuntimeSource(sourceText: string) {
  return /(?:\b(?:registerResource|componentResource|iframe)\s*\(|ui:\/\/)/u.test(
    sourceText,
  );
}

export function hasProviderExternalSource(sourceText: string) {
  return /\b(?:providerConnect|callProvider|createProviderJob|deploy|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
    sourceText,
  );
}

export function hasSourceMutationSource(sourceText: string) {
  return /\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
    sourceText,
  );
}

export function hasFinanceWriteSource(sourceText: string) {
  return /\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
    sourceText,
  );
}

export function isRouteLikeRuntimePath(path: string) {
  return (
    /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
    path.startsWith("apps/web/pages/api/") ||
    /^apps\/control-plane\/src\/.*\/routes\.ts$/u.test(path) ||
    /^apps\/control-plane\/src\/.*(?:route|router|controller)\.ts$/u.test(path)
  );
}

export function normalizeSourceTextByPath(
  sourceTextByPath: Readonly<Record<string, string>>,
) {
  return Object.fromEntries(
    Object.entries(sourceTextByPath).map(([path, sourceText]) => [
      normalizePath(path),
      sourceText,
    ]),
  );
}

export function normalizePath(path: string) {
  return path
    .trim()
    .replace(/\\/gu, "/")
    .replace(/^\.\/+/u, "");
}

export function sortUnique(values: readonly string[]) {
  return [...new Set(values)].sort();
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

function isRemoteMcpDeploymentPath(path: string) {
  return /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server)(?:\/|$)/iu.test(
    path,
  );
}

function isHostedDeploymentConfigPath(path: string) {
  return /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
    path,
  );
}

function isCurrentRemoteDeploymentConfigPath(path: string) {
  return /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml)$/iu.test(
    path,
  );
}

function isAppsSdkResourcePath(path: string) {
  return /(?:apps-sdk|appssdk|apps\/sdk|app-submission|submission-assets|iframe|component-resource)/iu.test(
    path,
  );
}

function isAppSubmissionPublicAssetPath(path: string) {
  return /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
    path,
  );
}

function isPublicAssetPath(path: string) {
  return /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu.test(path);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
