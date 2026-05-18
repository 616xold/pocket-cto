import { FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH } from "./read-only-app-mcp-token-validation-contracts";
import {
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
} from "./read-only-app-mcp-www-authenticate-contracts";
import {
  collectForbiddenOpenAiExecutableMatches,
  hasAppsSdkRuntimeSource,
  hasAuthRuntimeSource,
  hasFinanceWriteSource,
  hasProviderExternalSource,
  hasSourceMutationSource,
  isRouteLikeRuntimePath,
  noAppSubmissionPathChanges,
  noAppsSdkPathChanges,
  noDbSchemaMigrationChanges,
  noDeploymentConfigChanges,
  noDeploymentPublicAssetRepositoryPaths,
  noPackageScriptChanges,
  noPublicAssetPathChanges,
  normalizePath,
  normalizeSourceTextByPath,
  sortUnique,
} from "./read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules";

export const FP0128_TOKEN_VALIDATION_ALLOWED_CHANGED_PATHS = [
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  "apps/control-plane/src/app.ts",
  "apps/control-plane/src/app.spec.ts",
  "apps/control-plane/src/lib/types.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts",
  "packages/domain/src/index.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-contracts.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-inventory.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-proof.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.spec.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-inventory.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-inventory.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-inventory.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-boundary-hardening.spec.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-contracts.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-missing-token-challenge.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-plan-boundary.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-proof.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.spec.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata.spec.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-proof.ts",
  "tools/read-only-mcp-token-validation-readiness-proof.mjs",
  "tools/read-only-mcp-canonical-resource-auth-server-proof.mjs",
  "tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs",
  "tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
  "tools/read-only-mcp-protocol-envelope-proof.mjs",
  "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs",
  "tools/read-only-mcp-route-adapter-proof.mjs",
  "tools/read-only-endpoint-route-ownership-proof.mjs",
  "tools/read-only-endpoint-architecture-proof.mjs",
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

export type McpTokenValidationInventoryMatch = {
  excerpt: string;
  lineNumber: number;
  path: string;
  patternName: string;
};

const FP0130_MCP_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

export type McpTokenValidationReadinessDurabilityScanInput = {
  repoPaths: readonly string[];
  dirtyPaths?: readonly string[];
  branchDiffPaths?: readonly string[];
  headDiffPaths?: readonly string[];
  sourceTextByPath?: Readonly<Record<string, string>>;
};

export function verifyMcpTokenValidationReadinessDurabilityScan(
  input: McpTokenValidationReadinessDurabilityScanInput,
) {
  const dirtyPaths = sortUnique((input.dirtyPaths ?? []).map(normalizePath));
  const branchDiffPaths = sortUnique(
    (input.branchDiffPaths ?? []).map(normalizePath),
  );
  const headDiffPaths = sortUnique(
    (input.headDiffPaths ?? []).map(normalizePath),
  );
  const combinedChangedPaths = sortUnique([
    ...branchDiffPaths,
    ...headDiffPaths,
    ...dirtyPaths,
  ]);
  const repoPaths = sortUnique(input.repoPaths.map(normalizePath));
  const sourceTextByPath = normalizeSourceTextByPath(
    input.sourceTextByPath ?? {},
  );
  const executableInventoryText = inventoryExecutableSourceText(
    sourceTextByPath,
    combinedChangedPaths,
  );
  const routeRuntimeEntries = Object.entries(sourceTextByPath).filter(
    ([path]) => isMcpTokenValidationRouteRuntimeInventoryPath(path),
  );
  const routeRuntimeSource = routeRuntimeEntries
    .map(([, sourceText]) => sourceText)
    .join("\n");
  const routeRuntimeMatches =
    collectTokenValidationRouteRuntimeMatches(routeRuntimeEntries);
  const routeImportMatches = routeRuntimeMatches.filter(
    (match) => match.patternName === "token-validation-helper-import",
  );
  const wwwAuthenticateRuntimeMatches = routeRuntimeMatches.filter(
    (match) => match.patternName === "www-authenticate-route-behavior",
  );
  const disallowedWwwAuthenticateRuntimeMatches =
    wwwAuthenticateRuntimeMatches.filter(
      (match) =>
        !isAllowedFp0130MissingTokenWwwAuthenticateRouteMatch(match),
    );
  const routeRuntimeMatchesWithoutAllowedWwwAuthenticate =
    routeRuntimeMatches.filter(
      (match) =>
        !isAllowedFp0130MissingTokenWwwAuthenticateRouteMatch(match),
    );
  const authRuntimeMatches = routeRuntimeMatches.filter(
    (match) =>
      match.patternName === "auth-runtime-helper" ||
      match.patternName === "oauth-token-exchange-helper",
  );
  const forbiddenOpenAiSourceMatches = collectForbiddenOpenAiExecutableMatches(
    executableInventoryText,
  );
  const tokenValidationBranchDiffScopeVerified =
    combinedChangedPaths.every(isFp0128TokenValidationAllowedChangedPath) &&
    noPackageScriptChanges(combinedChangedPaths) &&
    noDbSchemaMigrationChanges(combinedChangedPaths) &&
    noDeploymentConfigChanges(combinedChangedPaths) &&
    noPublicAssetPathChanges(combinedChangedPaths) &&
    noAppsSdkPathChanges(combinedChangedPaths) &&
    noAppSubmissionPathChanges(combinedChangedPaths);
  const routeLikeRepositoryPaths = sortUnique(
    repoPaths.filter(isRouteLikeRuntimePath),
  );
  const runtimeRepositoryPaths = repoPaths.filter(isRuntimeInventoryPath);
  const tokenValidationNoCurrentRouteImportsVerified =
    routeImportMatches.length === 0;
  const tokenValidationNoRouteRuntimeRepositoryInventoryVerified =
    routeRuntimeMatchesWithoutAllowedWwwAuthenticate.length === 0 &&
    !routeLikeRepositoryPaths.some(isUnexpectedTokenValidationRoutePath);
  const tokenValidationNoWwwAuthenticateRuntimeRepositoryInventoryVerified =
    disallowedWwwAuthenticateRuntimeMatches.length === 0 &&
    !routeLikeRepositoryPaths.some(isWwwAuthenticateRouteBehaviorPath);
  const tokenValidationWwwAuthenticateRuntimeLimitedToFp0130MissingTokenChallengeVerified =
    disallowedWwwAuthenticateRuntimeMatches.length === 0 &&
    !routeLikeRepositoryPaths.some(isWwwAuthenticateRouteBehaviorPath);
  const tokenValidationNoAuthRuntimeRepositoryInventoryVerified =
    authRuntimeMatches.length === 0 &&
    !runtimeRepositoryPaths.some(isAuthRuntimePath) &&
    !hasAuthRuntimeSource(routeRuntimeSource);
  const tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified =
    noDeploymentPublicAssetRepositoryPaths(repoPaths) &&
    noDeploymentConfigChanges(combinedChangedPaths) &&
    noPublicAssetPathChanges(combinedChangedPaths) &&
    noAppsSdkPathChanges(combinedChangedPaths) &&
    noAppSubmissionPathChanges(combinedChangedPaths) &&
    !hasAppsSdkRuntimeSource(executableInventoryText);
  const tokenValidationNoOpenAiSourceScanVerified =
    forbiddenOpenAiSourceMatches.length === 0;
  const noProviderExternalSourceVerified = !hasProviderExternalSource(
    executableInventoryText,
  );
  const noSourceMutationVerified = !hasSourceMutationSource(
    executableInventoryText,
  );
  const noFinanceWriteVerified = !hasFinanceWriteSource(
    executableInventoryText,
  );
  const tokenValidationRepositoryInventoryVerified =
    tokenValidationNoRouteRuntimeRepositoryInventoryVerified &&
    tokenValidationNoCurrentRouteImportsVerified &&
    tokenValidationNoWwwAuthenticateRuntimeRepositoryInventoryVerified &&
    tokenValidationNoAuthRuntimeRepositoryInventoryVerified &&
    tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified &&
    tokenValidationNoOpenAiSourceScanVerified &&
    tokenValidationWwwAuthenticateRuntimeLimitedToFp0130MissingTokenChallengeVerified &&
    noProviderExternalSourceVerified &&
    noSourceMutationVerified &&
    noFinanceWriteVerified;
  const fp0128PostmergeProofDurabilityVerified =
    tokenValidationBranchDiffScopeVerified &&
    tokenValidationRepositoryInventoryVerified;

  return {
    authRuntimeMatches,
    branchDiffPaths,
    combinedChangedPaths,
    dirtyPaths,
    disallowedWwwAuthenticateRuntimeMatches,
    forbiddenOpenAiSourceMatches,
    fp0128PostmergeProofDurabilityVerified,
    headDiffPaths,
    noDbSchemaMigrationChangesVerified:
      noDbSchemaMigrationChanges(combinedChangedPaths),
    noFinanceWriteVerified,
    noPackageScriptsAdded: noPackageScriptChanges(combinedChangedPaths),
    noProviderExternalSourceVerified,
    noSourceMutationVerified,
    routeImportMatches,
    routeLikeRepositoryPaths,
    routeRuntimeMatches,
    routeRuntimeMatchesWithoutAllowedWwwAuthenticate,
    tokenValidationBranchDiffScopeVerified,
    tokenValidationNoAuthRuntimeRepositoryInventoryVerified,
    tokenValidationNoCurrentRouteImportsVerified,
    tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified,
    tokenValidationNoOpenAiSourceScanVerified,
    tokenValidationNoRouteRuntimeRepositoryInventoryVerified,
    tokenValidationNoWwwAuthenticateRuntimeRepositoryInventoryVerified,
    tokenValidationWwwAuthenticateRuntimeLimitedToFp0130MissingTokenChallengeVerified,
    tokenValidationRepositoryInventoryVerified,
    wwwAuthenticateRuntimeMatches,
  };
}

export function isFp0128TokenValidationAllowedChangedPath(path: string) {
  const normalized = normalizePath(path);
  return (
    FP0128_TOKEN_VALIDATION_ALLOWED_CHANGED_PATHS.includes(
      normalized as (typeof FP0128_TOKEN_VALIDATION_ALLOWED_CHANGED_PATHS)[number],
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-token-validation.*\.ts$/u.test(
      normalized,
    )
  );
}

export function isMcpTokenValidationSourceInventoryPath(path: string) {
  const normalized = normalizePath(path);
  if (/\.spec\.ts$/u.test(normalized)) return false;
  return (
    isMcpTokenValidationRouteRuntimeInventoryPath(normalized) ||
    /^packages\/domain\/src\/read-only-app-mcp-token-validation.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-implementation-sequencing.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-canonical-resource.*\.ts$/u.test(
      normalized,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-public-security.*\.ts$/u.test(
      normalized,
    ) ||
    /^tools\/read-only-mcp-.*\.mjs$/u.test(normalized) ||
    normalized === "tools/benchmark-community-pack-proof.mjs"
  );
}

function collectTokenValidationRouteRuntimeMatches(
  routeRuntimeEntries: readonly (readonly [string, string])[],
) {
  return routeRuntimeEntries.flatMap(([path, sourceText]) =>
    sourceText.split("\n").flatMap((line, index) =>
      tokenValidationRouteRuntimePatterns
        .filter(({ pattern }) => pattern.test(line))
        .map(({ name }) => ({
          excerpt: line.trim().slice(0, 160),
          lineNumber: index + 1,
          path,
          patternName: name,
        })),
    ),
  );
}

const tokenValidationRouteRuntimePatterns = [
  {
    name: "token-validation-helper-import",
    pattern: /read-only-app-mcp-token-validation/u,
  },
  {
    name: "auth-runtime-helper",
    pattern:
      /\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer|authMiddleware|setCookie|tokenStore|sessionStore|refreshTokenStore)\b/u,
  },
  {
    name: "oauth-token-exchange-helper",
    pattern:
      /\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\b/u,
  },
  {
    name: "www-authenticate-route-behavior",
    pattern:
      /(?:WWW-Authenticate|www-authenticate|resource_metadata\s*=|reply\.header\(\s*["']WWW-Authenticate["'])/iu,
  },
] as const;

function inventoryExecutableSourceText(
  sourceTextByPath: Readonly<Record<string, string>>,
  combinedChangedPaths: readonly string[],
) {
  const changedPathSet = new Set(combinedChangedPaths.map(normalizePath));
  return Object.entries(sourceTextByPath)
    .filter(
      ([path]) =>
        isMcpTokenValidationSourceInventoryPath(path) ||
        (changedPathSet.has(path) && isExecutablePath(path)),
    )
    .map(([, sourceText]) => sourceText)
    .join("\n");
}

function isMcpTokenValidationRouteRuntimeInventoryPath(path: string) {
  const normalized = normalizePath(path);
  return (
    normalized === "apps/control-plane/src/app.ts" ||
    isRouteLikeRuntimePath(normalized) ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?!.*\.spec\.ts$).*\.ts$/u.test(
      normalized,
    )
  );
}

function isExecutablePath(path: string) {
  return /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path) && !/\.spec\.ts$/u.test(path);
}

function isRuntimeInventoryPath(path: string) {
  return (
    !/\.spec\.ts$/u.test(path) &&
    (path.startsWith("apps/control-plane/src/") ||
      /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
      path.startsWith("apps/web/app/api/") ||
      path.startsWith("apps/web/pages/api/"))
  );
}

function isUnexpectedTokenValidationRoutePath(path: string) {
  return (
    isRouteLikeRuntimePath(path) &&
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\//u.test(
      path,
    ) &&
    ![
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts",
    ].includes(path)
  );
}

function isWwwAuthenticateRouteBehaviorPath(path: string) {
  return /(?:www-authenticate|resource-metadata-challenge|auth-challenge)(?:\/|\.|-|_)/iu.test(
    path,
  );
}

function isAllowedFp0130MissingTokenWwwAuthenticateRouteMatch(
  match: McpTokenValidationInventoryMatch,
) {
  return (
    match.path === FP0130_MCP_ROUTE_PATH &&
    match.patternName === "www-authenticate-route-behavior" &&
    /(?:reply\s*)?\.header\(\s*["']WWW-Authenticate["']\s*,\s*challenge\.wwwAuthenticate\s*\)/u.test(
      match.excerpt,
    )
  );
}

function isAuthRuntimePath(path: string) {
  return /(?:oauth|oauth2|authorization-code|oauth-callback|pkce|authorize|auth-server|token-store|token-session|session-store|session-handler|refresh-token|access-token|bearer-token|token-validator|jwt-validator|auth-middleware|authorization-middleware|auth-guard|route-guard|verify-bearer|require-auth|authenticate-request)/iu.test(
    path,
  );
}
