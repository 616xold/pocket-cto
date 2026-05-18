import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  McpCanonicalResourceAuthServerProofSchema,
  buildMcpCanonicalResourceAuthServerProof,
  isFp0120CanonicalResourceAuthServerProofSourcePath,
  textHasProtectedResourceTokenLeakage,
  verifyFp0116RemoteHostResourcePlanBoundary,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyMcpCanonicalResourceAuthServerNoOpenAiApiSourceScan,
  verifyMcpCanonicalResourceAuthServerRepositoryInventory,
} from "../packages/domain/src/index.ts";

const FP0116_PLAN =
  "plans/FP-0116-read-only-chatgpt-app-mcp-remote-host-owner-canonical-uri-resource-metadata-contracts.md";
const FP0113_PLAN =
  "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md";
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
const fp0123RouteInputSourceScanExcludedPaths = new Set([
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
]);

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const scopeScan = changedScopeScan();
const sourceScan = noExecutableApiModelKeyUsage(readChangedExecutableSource());
const inventory = verifyMcpCanonicalResourceAuthServerRepositoryInventory({
  changedPaths,
  repoPaths,
  routeSourceText: safeRead(ROUTE_PATH),
});
const durableSourceScan =
  verifyMcpCanonicalResourceAuthServerNoOpenAiApiSourceScan({
    sourceText: readCanonicalResourceProofSourceText(),
  });
const fp0120PlanText = safeRead(
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
);
const fp0121PlanText = safeRead(
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
);
const fp0122PlanText = safeRead(
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
);
const fp0123PlanText = safeRead(
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
);

const proof = McpCanonicalResourceAuthServerProofSchema.parse(
  buildMcpCanonicalResourceAuthServerProof({
    authMiddlewareRepositoryInventoryVerified:
      inventory.authMiddlewareRepositoryInventoryVerified,
    canonicalResourceRouteInventoryDurabilityVerified:
      inventory.canonicalResourceRouteInventoryDurabilityVerified,
    canonicalResourceAuthServerNoOpenAiApiSourceScanVerified:
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    canonicalResourceAuthServerContractsFoundationVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: fp0120PlanText,
        repoPaths,
      }),
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
    fp0113OauthSecurityBoundaryStillVerified: docsBoundary(FP0113_PLAN, [
      "token passthrough is forbidden",
      "companykey",
      "public exposure remains blocked",
    ]),
    fp0116RemoteHostResourceBoundaryStillVerified:
      verifyFp0116RemoteHostResourcePlanBoundary({
        planText: safeRead(FP0116_PLAN),
        repoPaths,
      }),
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
    fp0119ProtectedResourceRouteSequencingBoundaryStillVerified:
      verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary({
        planText: safeRead(
          FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
        ),
        repoPaths,
      }),
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
      verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
        planText: fp0120PlanText,
        repoPaths,
      }),
    fp0120BoundaryVerified: verifyFp0120CanonicalResourceAuthServerPlanBoundary(
      {
        planText: fp0120PlanText,
        repoPaths,
      },
    ),
    fp0120PostmergeRouteInventoryProofVerified:
      inventory.fp0120PostmergeRouteInventoryProofVerified,
    fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
      verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(
        {
          planText: fp0121PlanText,
          repoPaths,
        },
      ),
    fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
      verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts({
        planText: fp0122PlanText,
        repoPaths,
      }),
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
        planText: fp0123PlanText,
        repoPaths,
      }),
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified: verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(repoPaths),
    protectedResourceMetadataBuilderContractsFoundationVerified:
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: fp0122PlanText,
        repoPaths,
      }),
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary({
        planText: fp0121PlanText,
        repoPaths,
      }),
    knownSafeRouteInventoryVerified: inventory.knownSafeRouteInventoryVerified,
    noAppSubmission: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0121: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0120: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0122: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0121: scopeScan.noAppsSdkResource,
    noAppsSdkResourceFromFp0120: scopeScan.noAppsSdkResource,
    noAppsSdkResourceFromFp0122: scopeScan.noAppsSdkResource,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementation:
      scopeScan.noAuthMiddlewareImplementation &&
      inventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0120:
      scopeScan.noAuthMiddlewareImplementation &&
      inventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0121:
      scopeScan.noAuthMiddlewareImplementation &&
      inventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0122:
      scopeScan.noAuthMiddlewareImplementation &&
      inventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesAdded: scopeScan.noDbQueries,
    noDbQueriesFromFp0121: scopeScan.noDbQueries,
    noDbQueriesFromFp0120: scopeScan.noDbQueries,
    noDbQueriesFromFp0122: scopeScan.noDbQueries,
    noDeploymentConfig: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0121: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0120: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0122: scopeScan.noDeploymentConfig,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noFinanceWrite: scopeScan.noFinanceWrite,
    noModelCalls:
      sourceScan.noModelCalls &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noNewRoutePath:
      scopeScan.noNewRoutePath &&
      inventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0120:
      scopeScan.noNewRoutePath &&
      inventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0121:
      scopeScan.noNewRoutePath &&
      inventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0122:
      scopeScan.noNewRoutePath &&
      inventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noOauthImplementation:
      scopeScan.noOauthImplementation &&
      inventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0120:
      scopeScan.noOauthImplementation &&
      inventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0121:
      scopeScan.noOauthImplementation &&
      inventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0122:
      scopeScan.noOauthImplementation &&
      inventory.oauthRuntimeRepositoryInventoryVerified,
    noOpenAiApiCalls:
      sourceScan.noOpenAiApiCalls &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0120:
      sourceScan.noOpenAiApiCalls &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0121:
      sourceScan.noOpenAiApiCalls &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0122:
      sourceScan.noOpenAiApiCalls &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noOpenAiClientOrKeyUsage:
      sourceScan.noOpenAiClientOrKeyUsage &&
      durableSourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    noPackageScriptsAdded: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0121: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0120: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0122: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0120:
      scopeScan.noProtectedResourceMetadataRoute &&
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0121:
      scopeScan.noProtectedResourceMetadataRoute &&
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0122:
      scopeScan.noProtectedResourceMetadataRoute &&
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteImplementation:
      scopeScan.noProtectedResourceMetadataRoute &&
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderCalls: scopeScan.noProviderCalls,
    noProviderExternalCallsFromFp0121:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noProviderExternalCallsFromFp0120:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noProviderExternalCallsFromFp0122:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssets: scopeScan.noPublicAssets,
    noPublicAppImplementationFromFp0121: scopeScan.noPublicAppImplementation,
    noPublicAppImplementationFromFp0122: scopeScan.noPublicAppImplementation,
    noFixturesSampleDataSourcePacksFromFp0121:
      scopeScan.noFixturesSampleDataSourcePacks,
    noListingCopyGeneratedPublicProseFromFp0121:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noListingCopyGeneratedPublicProseFromFp0122:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noPublicAssetsSubmissionArtifactsFromFp0121:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0120:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0122:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeployment:
      scopeScan.noRemoteMcpDeployment &&
      inventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0120:
      scopeScan.noRemoteMcpDeployment &&
      inventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0121:
      scopeScan.noRemoteMcpDeployment &&
      inventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0122:
      scopeScan.noRemoteMcpDeployment &&
      inventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRouteBehaviorChange:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0120:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0121:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0122:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0121: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0120: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0122: scopeScan.noSchemaMigrations,
    noSourceMutation: scopeScan.noSourceMutation,
    noSourceMutationFinanceWriteFromFp0120:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0121:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0122:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementation:
      scopeScan.noTokenSessionImplementation &&
      inventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0120:
      scopeScan.noTokenSessionImplementation &&
      inventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0121:
      scopeScan.noTokenSessionImplementation &&
      inventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0122:
      scopeScan.noTokenSessionImplementation &&
      inventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0120:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0121:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0122:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorImplementation:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noNewRoutePathRepositoryInventoryVerified:
      inventory.noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths:
      inventory.noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified:
      inventory.oauthRuntimeRepositoryInventoryVerified,
    protectedResourceMetadataRouteRepositoryInventoryVerified:
      inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    remoteMcpDeploymentRepositoryInventoryVerified:
      inventory.remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified:
      inventory.tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteRepositoryInventoryVerified:
      inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: fp0120PlanText,
        repoPaths,
      }),
  }),
);

const proofJson = JSON.stringify(proof, null, 2);
if (textHasProtectedResourceTokenLeakage(proofJson)) {
  throw new Error("FP-0120 proof output contains token-like material");
}

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(
      `FP-0120 canonical resource/auth-server proof failed: ${key}`,
    );
  }
}

console.log(proofJson);

function readCanonicalResourceProofSourceText() {
  return repoPaths
    .filter(isFp0120CanonicalResourceAuthServerProofSourcePath)
    .filter(
      (path) =>
        !path.endsWith(".spec.ts") &&
        !fp0123RouteInputSourceScanExcludedPaths.has(path),
    )
    .map((path) => `// ${path}\n${safeRead(path)}`)
    .join("\n");
}

function changedScopeScan() {
  const changedExecutableSource = readChangedExecutableSource();
  const changedRouteSource = changedPaths
    .filter((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    )
    .map(safeRead)
    .join("\n");
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;

  return {
    noAppSubmission: !changedPaths.some((path) =>
      /(?:app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots)/iu.test(
        path,
      ),
    ),
    noAppsSdkResource:
      !changedPaths.some((path) =>
        /(?:apps-sdk|app-submission|submission-assets|iframe)/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedExecutableSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedExecutableSource,
      ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedExecutableSource,
      ),
    noFinanceWrite:
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        changedExecutableSource,
      ),
    noFixturesSampleDataSourcePacks: !changedPaths.some((path) =>
      /(?:^|\/)(?:fixtures|samples|sample-data|datasets|source-packs?|public-demo-data)(?:\/|$)/iu.test(
        path,
      ),
    ),
    noGeneratedPublicProse: !changedPaths.some((path) =>
      /(?:generated-public-prose|public-listing|store-listing)/iu.test(path),
    ),
    noListingCopy: !changedPaths.some((path) =>
      /(?:listing-copy|public-listing|store-listing)/iu.test(path),
    ),
    noNewRoutePath:
      !changedPaths.some(
        (path) =>
          isRouteLikeRuntimePath(path) &&
          path !== FP0125_LOCAL_ROUTE_PATH &&
          path !== ROUTE_PATH,
      ) && routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge(),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPackageScripts:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProtectedResourceMetadataRoute:
      !changedPaths.some(
        (path) =>
          isProtectedResourceMetadataRouteLikePath(path) &&
          path !== FP0125_LOCAL_ROUTE_PATH,
      ) &&
      !/protected-resource|oauth-protected-resource|resource_metadata/iu.test(
        changedRouteSource,
      ),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|deploy)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPublicAppImplementation:
      !changedPaths.some((path) =>
        /(?:public-chatgpt-app|chatgpt-app-public|apps-sdk|app-submission|submission-assets)/iu.test(
          path,
        ),
      ) &&
      !/\b(?:publicChatGptApp|registerChatGptApp|submitApp|appsSdk)\b/u.test(
        changedExecutableSource,
      ),
    noPublicAssets: !changedPaths.some((path) => publicAssetPattern.test(path)),
    noRemoteMcpDeployment:
      !changedPaths.some((path) =>
        /(?:^|\/)(?:apps\/remote-mcp-server|remote-mcp|public-mcp|mcp-server|vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|Dockerfile|docker-compose\.ya?ml)$/iu.test(
          path,
        ),
      ) &&
      !/\b(?:remoteMcpRuntime|mcpServerRuntime|startRemoteMcp|listen\s*\(|deploy\s*\()\b/u.test(
        changedExecutableSource,
      ),
    noRouteBehaviorChange:
      !changedPaths.some(
        (path) =>
          isRouteLikeRuntimePath(path) &&
          path !== FP0125_LOCAL_ROUTE_PATH &&
          path !== ROUTE_PATH,
      ) && routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge(),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /^packages\/db\//u.test(path) ||
        /(?:^|\/)migrations?\//iu.test(path) ||
        /\.(?:sql)$/iu.test(path),
    ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        changedExecutableSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noWwwAuthenticateRouteBehavior:
      (!changedPaths.some(isWwwAuthenticateRouteLikePath) ||
        routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge()) &&
      !/resource_metadata\s*=/iu.test(changedRouteSource),
  };
}

function routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge() {
  const routeSource = safeRead(ROUTE_PATH);
  if (!/WWW-Authenticate|www-authenticate/iu.test(routeSource)) return true;
  return (
    /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u.test(routeSource) &&
    /assertMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency/u.test(
      routeSource,
    ) &&
    /buildMcpWwwAuthenticateMissingTokenChallengeResponse/u.test(
      routeSource,
    ) &&
    /buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse/u.test(
      routeSource,
    ) &&
    /(?:reply\s*)?\.header\(\s*["']WWW-Authenticate["']\s*,\s*challenge\.wwwAuthenticate\s*\)/u.test(
      routeSource,
    ) &&
    !/\b(?:oauthCallback|tokenStore|sessionStore|authMiddleware|validateToken|verifyToken|verifyBearer|jwtVerify|decodeJwt|parseJwt|parseToken|introspectToken)\s*\(/u.test(
      routeSource,
    )
  );
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

function isWwwAuthenticateRouteLikePath(path) {
  return (
    isRouteLikeRuntimePath(path) &&
    /(?:www-authenticate|resource-metadata-challenge|auth-challenge|resource_metadata)/iu.test(
      path,
    )
  );
}

function localRouteShapeStillVerified() {
  const routeSource = safeRead(ROUTE_PATH);
  return (
    countMatches(routeSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(routeSource, /app\.get\("\/mcp"/gu) === 1 &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(routeSource) &&
    !/resource_metadata|oauth-protected-resource/iu.test(routeSource) &&
    routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge()
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
        !fp0123RouteInputSourceScanExcludedPaths.has(path) &&
        !path.endsWith(".spec.ts"),
    )
    .map(safeRead)
    .join("\n");
}

function noExecutableApiModelKeyUsage(sourceText) {
  const source = sourceText.toLowerCase();
  return {
    noModelCalls:
      !/\b(?:responses\.create|chat\.completions|openai\.responses|openai\.chat|model\s*:)/u.test(
        source,
      ),
    noOpenAiApiCalls:
      !/\b(?:openai\s*\(|new openai|responses\.create|chat\.completions|client\.responses)\b/u.test(
        source,
      ),
    noOpenAiClientOrKeyUsage:
      !/\b(?:new openai|openai_api_key|process\.env\.openai_api_key|api\.openai\.com)\b/u.test(
        source,
      ),
  };
}

function changedFilePaths() {
  return [...new Set([...committedBranchDiffPaths(), ...worktreeStatusPaths()])]
    .filter(Boolean)
    .sort();
}

function committedBranchDiffPaths() {
  try {
    return execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      encoding: "utf8",
    })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function worktreeStatusPaths() {
  const status = execFileSync(
    "git",
    ["status", "--short", "--untracked-files=all"],
    { encoding: "utf8" },
  );
  return status
    .split("\n")
    .filter((line) => line.trim())
    .map((line) =>
      line
        .replace(/^.. /u, "")
        .replace(/.* -> /u, "")
        .trim(),
    );
}

function repoFilePaths() {
  const results = [];
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
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

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}
