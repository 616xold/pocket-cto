import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  McpProtectedResourceMetadataBuilderProofSchema,
  buildMcpProtectedResourceMetadataBuilderProof,
  textHasProtectedResourceMetadataBuilderTokenLeakage,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
} from "../packages/domain/src/index.ts";

const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const FP0125_LOCAL_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

const allowedChangedPaths = new Set([
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md",
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  "apps/control-plane/src/app.ts",
  "apps/control-plane/src/app.spec.ts",
  "apps/control-plane/src/lib/types.ts",
  ROUTE_PATH,
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.spec.ts",
  FP0125_LOCAL_ROUTE_PATH,
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder-contracts.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-builder.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-contracts.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-inventory.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof-schema.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-inventory.ts",
  "packages/domain/src/read-only-app-mcp-canonical-resource-proof.spec.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-proof.ts",
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata.spec.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-proof.ts",
  "packages/domain/src/read-only-app-mcp-oauth-implementation-sequencing-inventory.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-builders.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-contracts.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-missing-token-challenge.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-plan-boundary.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-proof.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate.spec.ts",
  "packages/domain/src/read-only-app-mcp-www-authenticate-boundary-hardening.spec.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-contracts.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-inventory.ts",
  "packages/domain/src/read-only-app-mcp-token-validation-proof.ts",
  "packages/domain/src/read-only-app-mcp-token-validation.spec.ts",
  "packages/domain/src/read-only-app-mcp-remote-host-resource.spec.ts",
  "packages/domain/src/index.ts",
  "tools/read-only-mcp-protected-resource-metadata-builder-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs",
  "tools/read-only-mcp-canonical-resource-auth-server-proof.mjs",
  "tools/read-only-mcp-protected-resource-metadata-proof.mjs",
  "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs",
  "tools/read-only-mcp-www-authenticate-auth-challenge-proof.mjs",
  "tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs",
  "tools/read-only-mcp-token-validation-readiness-proof.mjs",
  "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs",
  "tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs",
  "tools/read-only-mcp-route-adapter-proof.mjs",
  "tools/read-only-mcp-evidence-tool-dispatch-proof.mjs",
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
]);

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const changedSource = readChangedExecutableSource();
const fp0122PlanText = safeRead(
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
);
const fp0123PlanText = safeRead(
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
);
const fp0124PlanText = safeRead(
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
);
const fp0121PlanText = safeRead(
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
);
const routeSource = safeRead(ROUTE_PATH);
const scopeScan = changedScopeScan(changedSource, routeSource);
const proof = McpProtectedResourceMetadataBuilderProofSchema.parse(
  buildMcpProtectedResourceMetadataBuilderProof({
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local-only", "post /mcp"]) &&
      localRouteShapeStillVerified(),
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
        repoPaths,
      }),
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      verifyFp0118ProtectedResourceMetadataPlanBoundary({
        planText: safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH),
        repoPaths,
      }),
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: safeRead(FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH),
        repoPaths,
      }),
    fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified:
      verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
        {
          planText: fp0121PlanText,
          repoPaths,
        },
      ) &&
      verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary({
        planText: fp0121PlanText,
        repoPaths,
      }),
    fp0122BoundaryVerified:
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: fp0122PlanText,
        repoPaths,
      }),
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
        planText: fp0123PlanText,
        repoPaths,
      }),
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
      verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
        {
          planText: fp0124PlanText,
          repoPaths,
        },
      ),
    noAppSubmission: scopeScan.noAppSubmission,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementation: scopeScan.noAuthMiddlewareImplementation,
    noDbQueriesAdded: scopeScan.noDbQueries,
    noDeploymentConfig: scopeScan.noDeploymentConfig,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noFinanceWrite: scopeScan.noFinanceWrite,
    noGeneratedPublicProse: scopeScan.noGeneratedPublicProse,
    noListingCopy: scopeScan.noListingCopy,
    noModelCalls: scopeScan.noModelCalls,
    noNewRoutePath: scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementation: scopeScan.noOauthImplementation,
    noOpenAiApiCalls: scopeScan.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage: scopeScan.noOpenAiClientOrKeyUsage,
    noPackageScriptsAdded: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteImplementation:
      scopeScan.noProtectedResourceMetadataRoute &&
      localRouteShapeStillVerified(),
    noProviderCalls: scopeScan.noProviderCalls,
    noPublicAssets: scopeScan.noPublicAssets,
    noRemoteMcpDeployment: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChange:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrations,
    noSourceMutation: scopeScan.noSourceMutation,
    noTokenSessionImplementation: scopeScan.noTokenSessionImplementation,
    noWwwAuthenticateRouteBehaviorImplementation:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      localRouteShapeStillVerified(),
  }),
);

if (
  textHasProtectedResourceMetadataBuilderTokenLeakage(JSON.stringify(proof))
) {
  throw new Error("FP-0122 builder proof output leaked token-like material");
}

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(
      `FP-0122 protected-resource metadata builder proof failed: ${key}`,
    );
  }
}

console.log(JSON.stringify(proof, null, 2));

function changedScopeScan(changedExecutableSource, currentRouteSource) {
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  const routeRuntimePattern =
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u;
  const changedFilesAllowed = changedPaths.every(
    (path) =>
      allowedChangedPaths.has(path) ||
      /^packages\/domain\/src\/read-only-app-mcp-protected-resource-metadata-builder.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-(?:canonical-resource|protected-resource-metadata|oauth-implementation-sequencing|remote-host-resource|oauth-security|remote-host-readiness|evidence-tool-dispatch|protocol-envelope|endpoint-route-ownership|endpoint-architecture|public-security).*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-www-authenticate.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/read-only-app-mcp-token-validation.*\.ts$/u.test(
        path,
      ) ||
      /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path),
  );
  const routeLikeRuntimeChangeLimitedToFp0130MissingTokenChallenge =
    changedPaths
      .filter(
        (path) =>
          routeRuntimePattern.test(path) ||
          (isRouteLikeRuntimePath(path) && path !== FP0125_LOCAL_ROUTE_PATH),
      )
      .every((path) => path === ROUTE_PATH) && localRouteShapeStillVerified();

  return {
    noAppSubmission:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
          path,
        ),
      ),
    noAppsSdkResource:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:apps-sdk|app-submission|submission-assets)/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\s*\(?/u.test(
        changedExecutableSource,
      ),
    noAuthMiddlewareImplementation:
      changedFilesAllowed &&
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noDbQueries:
      changedFilesAllowed &&
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedExecutableSource,
      ),
    noDeploymentConfig:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
          path,
        ),
      ),
    noExternalCommunications:
      changedFilesAllowed &&
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedExecutableSource,
      ),
    noFinanceWrite:
      changedFilesAllowed &&
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        changedExecutableSource,
      ),
    noGeneratedPublicProse:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:generated-public-prose|public-listing|store-listing|listing-copy)/iu.test(
          path,
        ),
      ),
    noListingCopy:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:listing-copy|public-listing|store-listing)/iu.test(path),
      ),
    noModelCalls:
      changedFilesAllowed &&
      !/\b(?:responses\.create|chat\.completions|openai\.responses|openai\.chat|model\s*:)/iu.test(
        changedExecutableSource,
      ),
    noNewRoutePath:
      changedFilesAllowed &&
      routeLikeRuntimeChangeLimitedToFp0130MissingTokenChallenge,
    noOauthImplementation:
      changedFilesAllowed &&
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedExecutableSource,
      ),
    noOpenAiApiCalls:
      changedFilesAllowed &&
      !new RegExp(
        `\\b(?:openai\\s*\\(|${["new", "openai"].join(" ")}|responses\\.create|chat\\.completions|client\\.responses)\\b`,
        "iu",
      ).test(changedExecutableSource),
    noOpenAiClientOrKeyUsage:
      changedFilesAllowed &&
      !new RegExp(
        `\\b(?:${["OPENAI", "API", "KEY"].join("_")}|${["new", "OpenAI"].join(
          " ",
        )}|process\\.env\\.${["OPENAI", "API"].join("_")})\\b`,
        "u",
      ).test(changedExecutableSource),
    noPackageScripts:
      changedFilesAllowed &&
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProtectedResourceMetadataRoute:
      changedFilesAllowed &&
      routeLikeRuntimeChangeLimitedToFp0130MissingTokenChallenge &&
      !changedPaths.some(
        (path) =>
          isProtectedResourceMetadataRouteLikePath(path) &&
          path !== FP0125_LOCAL_ROUTE_PATH,
      ) &&
      !/oauth-protected-resource|resource_metadata|protectedResourceMetadataRoute/iu.test(
        currentRouteSource,
      ),
    noProviderCalls:
      changedFilesAllowed &&
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPublicAssets:
      changedFilesAllowed &&
      !changedPaths.some((path) => publicAssetPattern.test(path)),
    noRemoteMcpDeployment:
      changedFilesAllowed &&
      !changedPaths.some((path) =>
        /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server|vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|Dockerfile|docker-compose\.ya?ml)$/iu.test(
          path,
        ),
      ) &&
      !/\b(?:remoteMcpRuntime|mcpServerRuntime|startRemoteMcp|listen\s*\(|deploy\s*\()\b/u.test(
        changedExecutableSource,
      ),
    noRouteBehaviorChange:
      changedFilesAllowed &&
      routeLikeRuntimeChangeLimitedToFp0130MissingTokenChallenge,
    noSchemaMigrations:
      changedFilesAllowed &&
      !changedPaths.some(
        (path) =>
          /^packages\/db\//u.test(path) ||
          /(?:^|\/)migrations?\//iu.test(path) ||
          /\.(?:sql)$/iu.test(path),
      ),
    noSourceMutation:
      changedFilesAllowed &&
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        changedExecutableSource,
      ),
    noTokenSessionImplementation:
      changedFilesAllowed &&
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noWwwAuthenticateRouteBehavior:
      changedFilesAllowed &&
      routeLikeRuntimeChangeLimitedToFp0130MissingTokenChallenge &&
      !/resource_metadata/iu.test(currentRouteSource),
  };
}

function isRouteLikeRuntimePath(path) {
  return (
    /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path) ||
    path.startsWith("apps/web/pages/api/") ||
    /^apps\/control-plane\/src\/.*\/routes\.ts$/u.test(path) ||
    /^apps\/control-plane\/src\/.*(?:route|router|controller)\.ts$/u.test(path)
  );
}

function isProtectedResourceMetadataRouteLikePath(path) {
  return (
    isRouteLikeRuntimePath(path) &&
    /(?:\.well-known\/oauth-protected-resource|oauth-protected-resource|protected-resource-metadata|resource-metadata|resource_metadata)/iu.test(
      path,
    )
  );
}

function localRouteShapeStillVerified() {
  const source = safeRead(ROUTE_PATH);
  const noWwwAuthenticateRuntime = !/www-authenticate/iu.test(source);
  const fp0130WwwAuthenticateRuntime =
    countMatches(
      source,
      /\.header\("WWW-Authenticate", challenge\.wwwAuthenticate\)/gu,
    ) === 1 &&
    source.includes("readOnlyAppMcpLocalProofGatedMissingTokenChallenge") &&
    source.includes(
      "assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency",
    );

  return (
    countMatches(source, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(source, /app\.get\("\/mcp"/gu) === 1 &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(source) &&
    !/resource_metadata|oauth-protected-resource/iu.test(source) &&
    (noWwwAuthenticateRuntime || fp0130WwwAuthenticateRuntime)
  );
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function readChangedExecutableSource() {
  return changedPaths
    .filter(
      (path) =>
        /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path) &&
        !path.startsWith("tools/") &&
        !/^packages\/domain\/src\/.*inventory.*\.ts$/u.test(path) &&
        !/^packages\/domain\/src\/.*proof.*\.ts$/u.test(path) &&
        path !==
          "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts" &&
        !path.endsWith(".spec.ts"),
    )
    .map(safeRead)
    .join("\n");
}

function changedFilePaths() {
  const status = execFileSync(
    "git",
    ["status", "--short", "--untracked-files=all"],
    {
      encoding: "utf8",
    },
  );
  return status
    .split("\n")
    .filter((line) => line.trim())
    .map((line) =>
      line
        .replace(/^.. /u, "")
        .replace(/.* -> /u, "")
        .trim(),
    )
    .sort();
}

function repoFilePaths() {
  const results = [];
  const skipped = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skipped.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) walk(absolutePath, relativePath);
      else results.push(relativePath);
    }
  }

  walk(process.cwd());
  return results.sort();
}

function safeRead(relativePath) {
  return readFileSync(relativePath, "utf8");
}

function countMatches(text, pattern) {
  return text.match(pattern)?.length ?? 0;
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}
