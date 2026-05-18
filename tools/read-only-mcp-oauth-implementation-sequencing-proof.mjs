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
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  McpOauthImplementationSequencingProofSchema,
  buildMcpOauthImplementationSequencingProof,
  isFp0117OauthSequencingNoOpenAiProofSourcePath,
  verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
  verifyFp0117OauthImplementationSequencingRepositoryInventory,
  verifyFp0117OauthSequencingNoOpenAiApiSourceScan,
  verifyFp0117PlanningTextRequiredTopics,
  verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128AbsentOrLocalTokenValidationReadinessContracts,
  verifyFp0128TokenValidationReadinessContractsBoundary,
  verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation,
  verifyFp0131Absent,
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
const FP0108_PLAN =
  "plans/FP-0108-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-contracts.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const fp0123RouteInputSourceScanExcludedPaths = new Set([
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
]);

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const planText = safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH);
const fp0118PlanText = safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH);
const fp0119PlanText = safeRead(
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
);
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
const fp0126PlanText = safeRead(
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
);
const fp0127PlanText = safeRead(
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
);
const fp0128PlanText = safeRead(
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
);
const fp0129PlanText = safeRead(
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
);
const fp0130PlanText = safeRead(
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
);
const scopeScan = changedScopeScan();
const changedSourceScan = noExecutableApiModelKeyUsage(
  readChangedExecutableSource(),
);
const repositoryInventory =
  verifyFp0117OauthImplementationSequencingRepositoryInventory({
    repoPaths,
    routeSourceText: safeRead(ROUTE_PATH),
  });
const durableSourceScan = verifyFp0117OauthSequencingNoOpenAiApiSourceScan({
  sourceText: readOauthSequencingProofSourceText(),
});
const planningTopics = verifyFp0117PlanningTextRequiredTopics(planText);

const proof = McpOauthImplementationSequencingProofSchema.parse(
  buildMcpOauthImplementationSequencingProof({
    ...planningTopics,
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary contract",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "mcp protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local-only fastify", "post /mcp"]) &&
      localRouteShapeStillVerified(),
    fp0108DispatchContractsStillVerified: docsBoundary(FP0108_PLAN, [
      "evidence tool dispatch contracts",
      "does not change route behavior",
    ]),
    fp0109AdapterBoundaryStillVerified: docsBoundary(FP0109_PLAN, [
      "local-only",
      "dependency-injected",
      "default fail-closed",
    ]),
    fp0111DefaultLocalDispatchWiringStillVerified: docsBoundary(FP0111_PLAN, [
      "explicit app construction",
      "default buildapp() remains fail-closed",
    ]),
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: docsBoundary(
      FP0112_PLAN,
      [
        "remote/public mcp deployment and oauth readiness",
        "current local /mcp route must not be exposed remotely as-is",
      ],
    ),
    fp0113OauthSecurityBoundaryStillVerified: docsBoundary(FP0113_PLAN, [
      "local/proof-only/read-only oauth, token/session",
      "token passthrough is forbidden",
      "public exposure remains blocked",
    ]),
    fp0114RemoteHostReadinessBoundaryStillVerified: docsBoundary(FP0114_PLAN, [
      "local/proof-only/read-only remote mcp host readiness",
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
      "local/proof-only/read-only contract slice",
      "protected-resource metadata",
      "fp-0117 remains absent",
    ]),
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
      verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan({
        planText,
        repoPaths,
      }),
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
      verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts({
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
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
        planText: fp0123PlanText,
        repoPaths,
      }),
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
      verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
        repoPaths,
      ),
    fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
      verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan({
        planText: fp0126PlanText,
        repoPaths,
      }),
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText: fp0127PlanText,
        repoPaths,
      }),
    fp0128AbsentOrLocalTokenValidationReadinessContractsVerified:
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText: fp0128PlanText,
        repoPaths,
      }),
    fp0128TokenValidationReadinessBoundaryStillVerified:
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText: fp0128PlanText,
        repoPaths,
      }),
    fp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlanVerified:
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: fp0129PlanText,
          repoPaths,
        },
      ),
    fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified:
      verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation({
        planText: fp0130PlanText,
        repoPaths,
      }),
    fp0131Absent: verifyFp0131Absent(repoPaths),
    wwwAuthenticateChallengeImplementationSequencingPlanBoundaryVerified:
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: fp0129PlanText,
        repoPaths,
      }),
    wwwAuthenticateAuthChallengeContractsFoundationVerified:
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: fp0127PlanText,
        repoPaths,
      }),
    wwwAuthenticateAuthChallengeSequencingBoundaryVerified:
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: fp0126PlanText,
        repoPaths,
      }),
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      localRouteShapeStillVerified(),
    fp0125EvidenceCoherenceBoundaryStillVerified: docsBoundary(
      "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md",
      [
        "evidence-coherence hardening",
        "semantic agreement between canonical uri evidence",
      ],
    ),
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
    noAppSubmissionFromFp0121: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0121: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0121:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0121: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0121: scopeScan.noDeploymentConfig,
    noFixturesSampleDataSourcePacksFromFp0121:
      scopeScan.noFixturesSampleDataSourcePacks,
    noListingCopyGeneratedPublicProseFromFp0121:
      scopeScan.noListingCopyGeneratedPublicProse,
    noNewRoutePathFromFp0121:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0121:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0121:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0121: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0121:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0121:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAppImplementationFromFp0121: scopeScan.noPublicAppImplementation,
    noPublicAssetsSubmissionArtifactsFromFp0121:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0121: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChangeFromFp0121:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsFromFp0121: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0121:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0121:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0121:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noAppSubmissionFromFp0122: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0122: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0122:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0122: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0122: scopeScan.noDeploymentConfig,
    noListingCopyGeneratedPublicProseFromFp0122:
      scopeScan.noListingCopyGeneratedPublicProse,
    noNewRoutePathFromFp0122:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0122:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0122:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0122: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0122:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0122:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAppImplementationFromFp0122: scopeScan.noPublicAppImplementation,
    noPublicAssetsSubmissionArtifactsFromFp0122:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0122: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChangeFromFp0122:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsFromFp0122: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0122:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0122:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0122:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noAppSubmissionFromFp0126: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0126: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0126:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0126: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0126: scopeScan.noDeploymentConfig,
    noMcpRouteBehaviorChangeFromFp0126:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0126:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0126:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0126: scopeScan.noPackageScripts,
    noProviderExternalCallsFromFp0126:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssetsSubmissionArtifactsFromFp0126:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0126: scopeScan.noRemoteMcpDeployment,
    noSchemaMigrationsFromFp0126: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0126:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0126:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateBehaviorFromFp0126:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noAppSubmissionFromFp0127: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0127: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0127:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0127: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0127: scopeScan.noDeploymentConfig,
    noListingCopyGeneratedPublicProseFromFp0127:
      scopeScan.noListingCopyGeneratedPublicProse,
    noMcpRouteBehaviorChangeFromFp0127:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0127:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0127:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0127: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteBehaviorChangeFromFp0127:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0127:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssetsSubmissionArtifactsFromFp0127:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0127: scopeScan.noRemoteMcpDeployment,
    noSchemaMigrationsFromFp0127: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0127:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0127:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noTokenValidationImplementationFromFp0127:
      scopeScan.noTokenValidationImplementation,
    noWwwAuthenticateRouteBehaviorFromFp0127:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noAppSubmissionFromFp0117: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0117: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0117:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0117: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0117: scopeScan.noDeploymentConfig,
    noListingCopyGeneratedPublicProseFromFp0117:
      scopeScan.noListingCopyGeneratedPublicProse,
    noAppSubmissionFromFp0118: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0118: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0118:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0118: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0118: scopeScan.noDeploymentConfig,
    noListingCopyGeneratedPublicProseFromFp0118:
      scopeScan.noListingCopyGeneratedPublicProse,
    noNewRoutePathFromFp0118:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0118:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0118:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0118: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0118:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0118:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssetsSubmissionArtifactsFromFp0118:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0118: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChangeFromFp0118:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsFromFp0118: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0118:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0118:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0118:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noAppSubmissionFromFp0120: scopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0120: scopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0120:
      scopeScan.noAuthMiddlewareImplementation &&
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    noDbQueriesFromFp0120: scopeScan.noDbQueries,
    noDeploymentConfigFromFp0120: scopeScan.noDeploymentConfig,
    noNewRoutePathFromFp0120:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0120:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0120:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0120: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0120:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0120:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssetsSubmissionArtifactsFromFp0120:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0120: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChangeFromFp0120:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsFromFp0120: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0120:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0120:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0120:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    noNewRoutePathFromFp0117:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementationFromFp0117:
      scopeScan.noOauthImplementation &&
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    noOpenAiApiCallsFromFp0117:
      changedSourceScan.noOpenAiApiCalls &&
      changedSourceScan.noModelCalls &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    noPackageScriptsFromFp0117: scopeScan.noPackageScripts,
    noProtectedResourceMetadataRouteFromFp0117:
      scopeScan.noProtectedResourceMetadataRoute &&
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    noProviderExternalCallsFromFp0117:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssetsSubmissionArtifactsFromFp0117:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeploymentFromFp0117: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChangeFromFp0117:
      scopeScan.noRouteBehaviorChange && localRouteShapeStillVerified(),
    noSchemaMigrationsFromFp0117: scopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0117:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementationFromFp0117:
      scopeScan.noTokenSessionImplementation &&
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    noWwwAuthenticateRouteBehaviorFromFp0117:
      scopeScan.noWwwAuthenticateRouteBehavior &&
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
    authMiddlewareRepositoryInventoryVerified:
      repositoryInventory.authMiddlewareRepositoryInventoryVerified,
    fp0117PostmergeProofDurabilityVerified:
      repositoryInventory.fp0117PostmergeProofDurabilityVerified &&
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    oauthImplementationRepositoryInventoryVerified:
      repositoryInventory.oauthImplementationRepositoryInventoryVerified,
    oauthSequencingNoOpenAiApiSourceScanVerified:
      durableSourceScan.oauthSequencingNoOpenAiApiSourceScanVerified,
    oauthImplementationSequencingPlanBoundaryVerified:
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText,
        repoPaths,
      }),
    protectedResourceMetadataContractsFoundationVerified:
      verifyFp0118ProtectedResourceMetadataPlanBoundary({
        planText: fp0118PlanText,
        repoPaths,
      }),
    publicAppImplementationFutureOnly: docsBoundary(
      FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
      ["public app behavior remains future-only"],
    ),
    publicAppSubmissionFutureOnly: docsBoundary(
      FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
      ["public app submission remains future-only"],
    ),
    protectedResourceMetadataRouteRepositoryInventoryVerified:
      repositoryInventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
    tokenSessionRepositoryInventoryVerified:
      repositoryInventory.tokenSessionRepositoryInventoryVerified,
    wwwAuthenticateRouteBehaviorRepositoryInventoryVerified:
      repositoryInventory.wwwAuthenticateRouteBehaviorRepositoryInventoryVerified,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(
      `FP-0117 OAuth implementation sequencing proof failed: ${key}`,
    );
  }
}

console.log(JSON.stringify(proof, null, 2));

function readOauthSequencingProofSourceText() {
  return repoPaths
    .filter(isFp0117OauthSequencingNoOpenAiProofSourcePath)
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
  const routePathPattern =
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u;

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
    noListingCopyGeneratedPublicProse: !changedPaths.some((path) =>
      /(?:listing-copy|generated-public-prose|public-listing|store-listing)/iu.test(
        path,
      ),
    ),
    noNewRoutePath:
      !changedPaths.some(
        (path) => routePathPattern.test(path) && path !== ROUTE_PATH,
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
        (path) => routePathPattern.test(path) && path !== ROUTE_PATH,
      ) &&
      routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge() &&
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
        (path) => routePathPattern.test(path) && path !== ROUTE_PATH,
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
    noTokenValidationImplementation:
      !/\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer)\s*\(/u.test(
        changedExecutableSource,
      ),
    noWwwAuthenticateRouteBehavior:
      (!changedPaths.some((path) => routePathPattern.test(path)) ||
        routeWwwAuthenticateLimitedToFp0130MissingTokenChallenge()) &&
      !/resource_metadata/iu.test(changedRouteSource),
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
  };
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
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
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
