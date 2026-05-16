import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  McpProtectedResourceMetadataProofSchema,
  buildMcpProtectedResourceMetadataProof,
  isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath,
  textHasProtectedResourceTokenLeakage,
  verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan,
  verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123Absent,
  verifyMcpProtectedResourceMetadataNoOpenAiApiSourceScan,
  verifyMcpProtectedResourceMetadataRepositoryInventory,
} from "../packages/domain/src/index.ts";

const FP0116_PLAN =
  "plans/FP-0116-read-only-chatgpt-app-mcp-remote-host-owner-canonical-uri-resource-metadata-contracts.md";
const FP0115_PLAN =
  "plans/FP-0115-read-only-chatgpt-app-mcp-remote-host-implementation-sequencing-master-plan.md";
const FP0114_PLAN =
  "plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md";
const FP0113_PLAN =
  "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0111_PLAN =
  "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md";
const FP0109_PLAN =
  "plans/FP-0109-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-adapter-implementation.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const fp0117PlanText = safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH);
const fp0118PlanText = safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH);
const fp0119PlanText = safeRead(
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
);
const fp0120PlanText = safeRead(FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH);
const fp0121PlanText = safeRead(
  FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH,
);
const fp0122PlanText = safeRead(
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
);
const scopeScan = changedScopeScan();
const changedSourceScan = noExecutableApiModelKeyUsage(
  readChangedExecutableSource(),
);
const repositoryInventory =
  verifyMcpProtectedResourceMetadataRepositoryInventory({
    changedPaths,
    repoPaths,
    routeSourceText: safeRead(ROUTE_PATH),
  });
const durableSourceScan = verifyMcpProtectedResourceMetadataNoOpenAiApiSourceScan(
  {
    sourceText: readProtectedResourceMetadataProofSourceText(),
  },
);

const proof = McpProtectedResourceMetadataProofSchema.parse(
  buildMcpProtectedResourceMetadataProof({
    authMiddlewareRepositoryInventoryVerified:
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "mcp protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local/control-plane", "post /mcp"]) &&
      localRouteShapeStillVerified(),
    fp0109AdapterBoundaryStillVerified: docsBoundary(FP0109_PLAN, [
      "local-only",
      "dependency-injected",
      "default fail-closed",
    ]),
    fp0111DefaultLocalDispatchWiringStillVerified: docsBoundary(FP0111_PLAN, [
      "explicit app construction",
      "default fail-closed",
    ]),
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: docsBoundary(
      FP0112_PLAN,
      [
        "remote/public mcp deployment and oauth readiness",
        "current local /mcp route must not be exposed remotely as-is",
      ],
    ),
    fp0113OauthSecurityBoundaryStillVerified: docsBoundary(FP0113_PLAN, [
      "oauth/token/session security",
      "token passthrough is forbidden",
      "companykey",
    ]),
    fp0114RemoteHostReadinessBoundaryStillVerified: docsBoundary(FP0114_PLAN, [
      "remote mcp host readiness",
      "canonical mcp resource uri",
      "current local /mcp route must not be exposed remotely as-is",
    ]),
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: docsBoundary(
      FP0115_PLAN,
      [
        "remote mcp host implementation sequencing",
        "provider/host readiness",
        "remote mcp host implementation cannot start from current repo truth",
      ],
    ),
    fp0116RemoteHostResourceBoundaryStillVerified: docsBoundary(FP0116_PLAN, [
      "remote host owner",
      "canonical resource uri",
      "protected-resource metadata",
    ]),
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan({
        planText: fp0117PlanText,
        repoPaths,
      }) &&
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: fp0117PlanText,
        repoPaths,
      }),
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
      verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts({
        planText: fp0118PlanText,
        repoPaths,
      }),
    fp0118BoundaryVerified: verifyFp0118ProtectedResourceMetadataPlanBoundary({
      planText: fp0118PlanText,
      repoPaths,
    }),
    fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
      verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan({
        planText: fp0119PlanText,
        repoPaths,
      }),
    canonicalResourceAuthServerContractsFoundationVerified:
      verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
        planText: fp0120PlanText,
        repoPaths,
      }),
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
      verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
        planText: fp0120PlanText,
        repoPaths,
      }),
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
    fp0123Absent: verifyFp0123Absent(repoPaths),
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
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: fp0120PlanText,
        repoPaths,
      }),
    fp0118PostmergeProofDurabilityVerified:
      repositoryInventory.fp0118PostmergeProofDurabilityVerified &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    fp0118RouteInventoryDurabilityVerified:
      repositoryInventory.fp0118RouteInventoryDurabilityVerified,
    fp0119PostmergeRouteInventoryProofVerified:
      repositoryInventory.fp0119PostmergeRouteInventoryProofVerified,
    knownSafeRouteInventoryVerified:
      repositoryInventory.knownSafeRouteInventoryVerified,
    noAppSubmission: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0121: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0122: scopeScan.noAppSubmission,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResource,
    noAppsSdkResourceFromFp0121: scopeScan.noAppsSdkResource,
    noAppsSdkResourceFromFp0122: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementation:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0121:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0122:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesAdded: scopeScan.noDbQueries,
    noDbQueriesFromFp0121: scopeScan.noDbQueries,
    noDbQueriesFromFp0122: scopeScan.noDbQueries,
    noDeploymentConfig: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0121: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0122: scopeScan.noDeploymentConfig,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noFinanceWrite: scopeScan.noFinanceWrite,
    noGeneratedPublicProse: scopeScan.noGeneratedPublicProse,
    noFixturesSampleDataSourcePacksFromFp0121:
      scopeScan.noFixturesSampleDataSourcePacks,
    noListingCopy: scopeScan.noListingCopy,
    noListingCopyGeneratedPublicProseFromFp0121:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noListingCopyGeneratedPublicProseFromFp0122:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noModelCalls:
      changedSourceScan.noModelCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noNewRoutePath:
      scopeScan.noNewRoutePath &&
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0121:
      scopeScan.noNewRoutePath &&
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0122:
      scopeScan.noNewRoutePath &&
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noOauthImplementation:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0121:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0122:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    noOpenAiApiCalls:
      changedSourceScan.noOpenAiApiCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0121:
      changedSourceScan.noOpenAiApiCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0122:
      changedSourceScan.noOpenAiApiCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noOpenAiClientOrKeyUsage:
      changedSourceScan.noOpenAiClientOrKeyUsage &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0121: scopeScan.noPackageScripts,
    noAppSubmissionFromFp0119: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0120: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0119: scopeScan.noAppsSdkResource,
    noAppsSdkResourceFromFp0120: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0119:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noAuthMiddlewareImplementationFromFp0120:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0119: scopeScan.noDbQueries,
    noDbQueriesFromFp0120: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0119: scopeScan.noDeploymentConfig,
    noDeploymentConfigFromFp0120: scopeScan.noDeploymentConfig,
    noListingCopyGeneratedPublicProseFromFp0119:
      scopeScan.noListingCopy && scopeScan.noGeneratedPublicProse,
    noNewRoutePathFromFp0119:
      scopeScan.noNewRoutePath &&
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noNewRoutePathFromFp0120:
      scopeScan.noNewRoutePath &&
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified &&
      localRouteShapeStillVerified(),
    noOauthImplementationFromFp0119:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    noOauthImplementationFromFp0120:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0119:
      changedSourceScan.noOpenAiApiCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noOpenAiApiCallsFromFp0120:
      changedSourceScan.noOpenAiApiCalls &&
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    noPackageScriptsAdded: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0119: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0120: scopeScan.noPackageScripts,
    noPackageScriptsFromFp0122: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteImplementation:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0119:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0120:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0121:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    noProtectedResourceMetadataRouteFromFp0122:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    noProviderCalls: scopeScan.noProviderCalls,
    noProviderExternalCallsFromFp0119:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noProviderExternalCallsFromFp0120:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noProviderExternalCallsFromFp0121:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noProviderExternalCallsFromFp0122:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssets: scopeScan.noPublicAssets,
    noPublicAppImplementationFromFp0121:
      scopeScan.noPublicAppImplementation,
    noPublicAppImplementationFromFp0122:
      scopeScan.noPublicAppImplementation,
    noPublicAssetsSubmissionArtifactsFromFp0119:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0120:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0121:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0122:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeployment:
      scopeScan.noRemoteMcpDeployment &&
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0119:
      scopeScan.noRemoteMcpDeployment &&
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0120:
      scopeScan.noRemoteMcpDeployment &&
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0121:
      scopeScan.noRemoteMcpDeployment &&
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRemoteMcpDeploymentFromFp0122:
      scopeScan.noRemoteMcpDeployment &&
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    noRouteBehaviorChange:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0119:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0120:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0121:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noRouteBehaviorChangeFromFp0122:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0119: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0120: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0121: scopeScan.noSchemaMigrations,
    noSchemaMigrationsFromFp0122: scopeScan.noSchemaMigrations,
    noSourceMutation: scopeScan.noSourceMutation,
    noSourceMutationFinanceWriteFromFp0119:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0120:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0121:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0122:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementation:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0119:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0120:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0121:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noTokenSessionImplementationFromFp0122:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorImplementation:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0119:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0120:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0121:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0122:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    noNewRoutePathRepositoryInventoryVerified:
      repositoryInventory.noNewRoutePathRepositoryInventoryVerified,
    noUnexpectedRouteLikeRepositoryPaths:
      repositoryInventory.noUnexpectedRouteLikeRepositoryPaths,
    oauthRuntimeRepositoryInventoryVerified:
      repositoryInventory.oauthRuntimeRepositoryInventoryVerified,
    protectedResourceMetadataNoOpenAiApiSourceScanVerified:
      durableSourceScan.protectedResourceMetadataNoOpenAiApiSourceScanVerified,
    protectedResourceRouteRepositoryInventoryVerified:
      repositoryInventory.protectedResourceRouteRepositoryInventoryVerified,
    protectedResourceMetadataRouteSequencingPlanBoundaryVerified:
      verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary({
        planText: fp0119PlanText,
        repoPaths,
      }),
    remoteMcpDeploymentRepositoryInventoryVerified:
      repositoryInventory.remoteMcpDeploymentRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified:
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteRepositoryInventoryVerified:
      repositoryInventory.wwwAuthenticateRouteRepositoryInventoryVerified,
  }),
);

const proofJson = JSON.stringify(proof, null, 2);
if (textHasProtectedResourceTokenLeakage(proofJson)) {
  throw new Error("FP-0118 proof output contains token-like material");
}

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(
      `FP-0118 protected-resource metadata proof failed: ${key}`,
    );
  }
}

console.log(proofJson);

function readProtectedResourceMetadataProofSourceText() {
  return repoPaths
    .filter(isFp0118ProtectedResourceMetadataNoOpenAiProofSourcePath)
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
        /(?:apps-sdk|app-submission|submission-assets)/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\s*\(?/u.test(
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
    noNewRoutePath: !changedPaths.some(isRouteLikeRuntimePath),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPackageScripts:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProtectedResourceMetadataRoute:
      !changedPaths.some(isProtectedResourceMetadataRouteLikePath) &&
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
    noRouteBehaviorChange: !changedPaths.some(isRouteLikeRuntimePath),
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
      !changedPaths.some(isWwwAuthenticateRouteLikePath) &&
      !/www-authenticate|resource_metadata/iu.test(changedRouteSource),
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
    !/resource_metadata|oauth-protected-resource|www-authenticate/iu.test(
      routeSource,
    )
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
    .map((line) => line.replace(/^.. /u, "").replace(/.* -> /u, "").trim());
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

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}
