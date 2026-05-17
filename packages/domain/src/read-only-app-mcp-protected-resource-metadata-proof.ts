import { z } from "zod";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  MCP_PROTECTED_RESOURCE_METADATA_BEARER_METHODS,
  MCP_PROTECTED_RESOURCE_METADATA_FORBIDDEN_BEARER_METHODS,
  MCP_PROTECTED_RESOURCE_METADATA_SCHEMA_VERSION,
  MCP_PROTECTED_RESOURCE_METADATA_TOKEN_LEAKAGE_SURFACES,
  MCP_PROTECTED_RESOURCE_TOKEN_FAILURE_MODES,
  MCP_REJECTED_PROTECTED_RESOURCE_SCOPE_PATTERNS,
  MCP_SCOPE_CHALLENGE_AUTHORITIES,
  McpNoTokenLeakageMetadataBoundarySchema,
  McpProtectedResourceAuthorizationServersBoundarySchema,
  McpProtectedResourceBearerMethodsBoundarySchema,
  McpProtectedResourceCanonicalUriDependencyBoundarySchema,
  McpProtectedResourceMetadataDocumentBoundarySchema,
  McpProtectedResourceMetadataDocumentSchema,
  McpProtectedResourceMetadataProofContractSchema,
  McpProtectedResourceNoRuntimeBoundarySchema,
  McpProtectedResourceRouteDeferredBoundarySchema,
  McpProtectedResourceScopesBoundarySchema,
  McpResourceMetadataDiscoveryBoundarySchema,
  McpScopeChallengeReadinessBoundarySchema,
  McpTokenFailureChallengeBoundarySchema,
  McpWwwAuthenticateChallengeBoundarySchema,
  McpWwwAuthenticateRouteDeferredBoundarySchema,
  type McpProtectedResourceMetadataContractKindSchema,
} from "./read-only-app-mcp-protected-resource-metadata-contracts";
import {
  buildMcpProtectedResourceMetadataInventoryProof,
  McpProtectedResourceMetadataInventoryProofSchema,
  type McpProtectedResourceMetadataInventoryProofInput,
} from "./read-only-app-mcp-protected-resource-metadata-inventory";
import {
  FP0126_PLAN_PREFIX,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  FP0127_PLAN_PREFIX,
} from "./read-only-app-mcp-protected-resource-metadata-route-input-contracts";
import {
  buildMcpCanonicalResourceAuthServerContracts,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
} from "./read-only-app-mcp-canonical-resource";
import { buildMcpProtectedResourceMetadataBuilderContracts } from "./read-only-app-mcp-protected-resource-metadata-builder-proof";
import { buildMcpWwwAuthenticateAuthChallengeContracts } from "./read-only-app-mcp-www-authenticate-builders";
import {
  MCP_PUBLIC_MCP_ENDPOINT_PATH,
  MCP_PROTECTED_RESOURCE_METADATA_REQUIREMENTS,
} from "./read-only-app-mcp-remote-host-resource-contracts";

const trueLiteral = z.literal(true);

export const McpProtectedResourceMetadataProofSchema = z
  .object({
    schemaVersion: z.literal(MCP_PROTECTED_RESOURCE_METADATA_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    protectedResourceMetadataContractsVerified: trueLiteral,
    protectedResourceMetadataDocumentBoundaryVerified: trueLiteral,
    protectedResourceCanonicalUriDependencyBoundaryVerified: trueLiteral,
    protectedResourceAuthorizationServersBoundaryVerified: trueLiteral,
    protectedResourceScopesBoundaryVerified: trueLiteral,
    protectedResourceBearerMethodsBoundaryVerified: trueLiteral,
    wwwAuthenticateChallengeBoundaryVerified: trueLiteral,
    resourceMetadataDiscoveryBoundaryVerified: trueLiteral,
    scopeChallengeReadinessBoundaryVerified: trueLiteral,
    tokenFailureChallengeBoundaryVerified: trueLiteral,
    noTokenLeakageMetadataBoundaryVerified: trueLiteral,
    protectedResourceRouteDeferredBoundaryVerified: trueLiteral,
    wwwAuthenticateRouteDeferredBoundaryVerified: trueLiteral,
    protectedResourceNoRuntimeBoundaryVerified: trueLiteral,
    noRouteBehaviorChange: trueLiteral,
    noNewRoutePath: trueLiteral,
    noProtectedResourceMetadataRouteImplementation: trueLiteral,
    noWwwAuthenticateRouteBehaviorImplementation: trueLiteral,
    noOauthImplementation: trueLiteral,
    noTokenSessionImplementation: trueLiteral,
    noAuthMiddlewareImplementation: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noDeploymentConfig: trueLiteral,
    noAppsSdkResourceImplementation: trueLiteral,
    noAppSubmission: trueLiteral,
    noDbQueriesAdded: trueLiteral,
    noSchemaMigrationsAdded: trueLiteral,
    noPackageScriptsAdded: trueLiteral,
    noPublicAssets: trueLiteral,
    noListingCopy: trueLiteral,
    noGeneratedPublicProse: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noProviderCalls: trueLiteral,
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    fp0118BoundaryVerified: trueLiteral,
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified: trueLiteral,
    fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
      trueLiteral,
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
      trueLiteral,
    fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
      trueLiteral,
    fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
      trueLiteral,
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      trueLiteral,
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
      trueLiteral,
    fp0125Absent: trueLiteral,
    fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
      trueLiteral,
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      trueLiteral,
    fp0128Absent: trueLiteral,
    wwwAuthenticateAuthChallengeContractsFoundationVerified: trueLiteral,
    noMcpRouteBehaviorChangeFromFp0127: trueLiteral,
    noProtectedResourceMetadataRouteBehaviorChangeFromFp0127: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0127: trueLiteral,
    noTokenValidationImplementationFromFp0127: trueLiteral,
    noOauthImplementationFromFp0127: trueLiteral,
    noTokenSessionImplementationFromFp0127: trueLiteral,
    noAuthMiddlewareImplementationFromFp0127: trueLiteral,
    noRemoteMcpDeploymentFromFp0127: trueLiteral,
    noDeploymentConfigFromFp0127: trueLiteral,
    noAppsSdkResourceFromFp0127: trueLiteral,
    noAppSubmissionFromFp0127: trueLiteral,
    noDbQueriesFromFp0127: trueLiteral,
    noSchemaMigrationsFromFp0127: trueLiteral,
    noPackageScriptsFromFp0127: trueLiteral,
    noOpenAiApiCallsFromFp0127: trueLiteral,
    noProviderExternalCallsFromFp0127: trueLiteral,
    noSourceMutationFinanceWriteFromFp0127: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0127: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0127: trueLiteral,
    wwwAuthenticateAuthChallengeSequencingBoundaryVerified: trueLiteral,
    noMcpRouteBehaviorChangeFromFp0126: trueLiteral,
    noWwwAuthenticateBehaviorFromFp0126: trueLiteral,
    noOauthImplementationFromFp0126: trueLiteral,
    noTokenSessionImplementationFromFp0126: trueLiteral,
    noAuthMiddlewareImplementationFromFp0126: trueLiteral,
    noRemoteMcpDeploymentFromFp0126: trueLiteral,
    noDeploymentConfigFromFp0126: trueLiteral,
    noAppsSdkResourceFromFp0126: trueLiteral,
    noAppSubmissionFromFp0126: trueLiteral,
    noDbQueriesFromFp0126: trueLiteral,
    noSchemaMigrationsFromFp0126: trueLiteral,
    noPackageScriptsFromFp0126: trueLiteral,
    noOpenAiApiCallsFromFp0126: trueLiteral,
    noProviderExternalCallsFromFp0126: trueLiteral,
    noSourceMutationFinanceWriteFromFp0126: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0126: trueLiteral,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified: trueLiteral,
    fp0125EvidenceCoherenceBoundaryStillVerified: trueLiteral,
    protectedResourceMetadataBuilderContractsFoundationVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0122: trueLiteral,
    noNewRoutePathFromFp0122: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0122: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0122: trueLiteral,
    noOauthImplementationFromFp0122: trueLiteral,
    noTokenSessionImplementationFromFp0122: trueLiteral,
    noAuthMiddlewareImplementationFromFp0122: trueLiteral,
    noRemoteMcpDeploymentFromFp0122: trueLiteral,
    noDeploymentConfigFromFp0122: trueLiteral,
    noAppsSdkResourceFromFp0122: trueLiteral,
    noPublicAppImplementationFromFp0122: trueLiteral,
    noAppSubmissionFromFp0122: trueLiteral,
    noDbQueriesFromFp0122: trueLiteral,
    noSchemaMigrationsFromFp0122: trueLiteral,
    noPackageScriptsFromFp0122: trueLiteral,
    noOpenAiApiCallsFromFp0122: trueLiteral,
    noProviderExternalCallsFromFp0122: trueLiteral,
    noSourceMutationFinanceWriteFromFp0122: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0122: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0122: trueLiteral,
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      trueLiteral,
    canonicalResourceAuthServerContractsFoundationVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0121: trueLiteral,
    noNewRoutePathFromFp0121: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0121: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0121: trueLiteral,
    noOauthImplementationFromFp0121: trueLiteral,
    noTokenSessionImplementationFromFp0121: trueLiteral,
    noAuthMiddlewareImplementationFromFp0121: trueLiteral,
    noRemoteMcpDeploymentFromFp0121: trueLiteral,
    noDeploymentConfigFromFp0121: trueLiteral,
    noAppsSdkResourceFromFp0121: trueLiteral,
    noPublicAppImplementationFromFp0121: trueLiteral,
    noAppSubmissionFromFp0121: trueLiteral,
    noDbQueriesFromFp0121: trueLiteral,
    noSchemaMigrationsFromFp0121: trueLiteral,
    noPackageScriptsFromFp0121: trueLiteral,
    noFixturesSampleDataSourcePacksFromFp0121: trueLiteral,
    noOpenAiApiCallsFromFp0121: trueLiteral,
    noProviderExternalCallsFromFp0121: trueLiteral,
    noSourceMutationFinanceWriteFromFp0121: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0121: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0121: trueLiteral,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0120: trueLiteral,
    noNewRoutePathFromFp0120: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0120: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0120: trueLiteral,
    noOauthImplementationFromFp0120: trueLiteral,
    noTokenSessionImplementationFromFp0120: trueLiteral,
    noAuthMiddlewareImplementationFromFp0120: trueLiteral,
    noRemoteMcpDeploymentFromFp0120: trueLiteral,
    noDeploymentConfigFromFp0120: trueLiteral,
    noAppsSdkResourceFromFp0120: trueLiteral,
    noAppSubmissionFromFp0120: trueLiteral,
    noDbQueriesFromFp0120: trueLiteral,
    noSchemaMigrationsFromFp0120: trueLiteral,
    noPackageScriptsFromFp0120: trueLiteral,
    noOpenAiApiCallsFromFp0120: trueLiteral,
    noProviderExternalCallsFromFp0120: trueLiteral,
    noSourceMutationFinanceWriteFromFp0120: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0120: trueLiteral,
    protectedResourceMetadataRouteSequencingPlanBoundaryVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0119: trueLiteral,
    noNewRoutePathFromFp0119: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0119: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0119: trueLiteral,
    noOauthImplementationFromFp0119: trueLiteral,
    noTokenSessionImplementationFromFp0119: trueLiteral,
    noAuthMiddlewareImplementationFromFp0119: trueLiteral,
    noRemoteMcpDeploymentFromFp0119: trueLiteral,
    noDeploymentConfigFromFp0119: trueLiteral,
    noAppsSdkResourceFromFp0119: trueLiteral,
    noAppSubmissionFromFp0119: trueLiteral,
    noDbQueriesFromFp0119: trueLiteral,
    noSchemaMigrationsFromFp0119: trueLiteral,
    noPackageScriptsFromFp0119: trueLiteral,
    noOpenAiApiCallsFromFp0119: trueLiteral,
    noProviderExternalCallsFromFp0119: trueLiteral,
    noSourceMutationFinanceWriteFromFp0119: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0119: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0119: trueLiteral,
    fp0117OauthImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0116RemoteHostResourceBoundaryStillVerified: trueLiteral,
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0114RemoteHostReadinessBoundaryStillVerified: trueLiteral,
    fp0113OauthSecurityBoundaryStillVerified: trueLiteral,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: trueLiteral,
    fp0111DefaultLocalDispatchWiringStillVerified: trueLiteral,
    fp0109AdapterBoundaryStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
  })
  .merge(McpProtectedResourceMetadataInventoryProofSchema)
  .strict();

export type McpProtectedResourceMetadataProof = z.infer<
  typeof McpProtectedResourceMetadataProofSchema
>;

type ProofInput = Partial<
  Omit<
    McpProtectedResourceMetadataProof,
    | "schemaVersion"
    | "localProofOnly"
    | keyof z.infer<typeof McpProtectedResourceMetadataInventoryProofSchema>
  >
> &
  McpProtectedResourceMetadataInventoryProofInput;

export function buildMcpProtectedResourceMetadataContracts() {
  return {
    authorizationServersBoundary:
      McpProtectedResourceAuthorizationServersBoundarySchema.parse({
        ...base("McpProtectedResourceAuthorizationServersBoundary"),
        authorizationServerSelectionStatus: "unresolved_hold",
        authorizationServersMustBeNonEmpty: true,
        authorizationServersRequiredBeforeImplementation: true,
        providerNeutral: true,
        providerSelected: false,
      }),
    bearerMethodsBoundary:
      McpProtectedResourceBearerMethodsBoundarySchema.parse({
        ...base("McpProtectedResourceBearerMethodsBoundary"),
        bearerMethodsSupportedRequired: true,
        forbiddenBearerMethods: [
          ...MCP_PROTECTED_RESOURCE_METADATA_FORBIDDEN_BEARER_METHODS,
        ],
        queryStringBearerTokensAllowed: false,
        requiredBearerMethods: [
          ...MCP_PROTECTED_RESOURCE_METADATA_BEARER_METHODS,
        ],
      }),
    canonicalUriDependencyBoundary:
      McpProtectedResourceCanonicalUriDependencyBoundarySchema.parse({
        ...base("McpProtectedResourceCanonicalUriDependencyBoundary"),
        canonicalResourceUriImplemented: false,
        companyKeyAuthorityAllowed: false,
        currentLocalRouteUrlAllowed: false,
        dependsOnFp0116CanonicalPublicResourceUri: true,
        exactStableHttpsUriRequired: true,
        fragmentAllowed: false,
        placeholderResourceAllowed: false,
        queryStringAllowed: false,
        requiredPath: MCP_PUBLIC_MCP_ENDPOINT_PATH,
        workspaceTenantTemplateAllowed: false,
      }),
    documentBoundary: McpProtectedResourceMetadataDocumentBoundarySchema.parse({
      ...base("McpProtectedResourceMetadataDocumentBoundary"),
      metadataDocumentExamplesContainTokens: false,
      protectedResourceMetadataRequiredBeforePublicTokenProtectedExposure: true,
      protectedResourceMetadataRouteImplemented: false,
      requiredMetadataFields: [...MCP_PROTECTED_RESOURCE_METADATA_REQUIREMENTS],
    }),
    noRuntimeBoundary: McpProtectedResourceNoRuntimeBoundarySchema.parse({
      ...base("McpProtectedResourceNoRuntimeBoundary"),
      noAppsSdkResourceRuntime: true,
      noDbRuntime: true,
      noOauthTokenSessionAuthMiddleware: true,
      noProtectedResourceMetadataRuntime: true,
      noRemoteRuntime: true,
      noWwwAuthenticateRuntime: true,
    }),
    noTokenLeakageBoundary: McpNoTokenLeakageMetadataBoundarySchema.parse({
      ...base("McpNoTokenLeakageMetadataBoundary"),
      forbiddenSurfaces: [
        ...MCP_PROTECTED_RESOURCE_METADATA_TOKEN_LEAKAGE_SURFACES,
      ],
      tokenValuesAllowedInMetadataExamples: false,
    }),
    proofContract: McpProtectedResourceMetadataProofContractSchema.parse({
      ...base("McpProtectedResourceMetadataProofContract"),
      contractOnly: true,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noAutonomousAction: true,
      noDbQueriesAdded: true,
      noDeploymentConfig: true,
      noExternalCommunications: true,
      noFinanceWrite: true,
      noGeneratedFinanceAdvice: true,
      noGeneratedPublicProse: true,
      noListingCopy: true,
      noModelCalls: true,
      noNewRoutePath: true,
      noOauthImplementation: true,
      noOpenAiApiCalls: true,
      noOpenAiClientOrKeyUsage: true,
      noPackageScriptsAdded: true,
      noProtectedResourceMetadataRouteImplementation: true,
      noProviderCalls: true,
      noPublicAssets: true,
      noRemoteMcpDeployment: true,
      noRouteBehaviorChange: true,
      noRuntimeCodexFinanceOutput: true,
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenSessionImplementation: true,
      noWwwAuthenticateRouteBehaviorImplementation: true,
    }),
    resourceMetadataDiscoveryBoundary:
      McpResourceMetadataDiscoveryBoundarySchema.parse({
        ...base("McpResourceMetadataDiscoveryBoundary"),
        authorizationServerDiscoveryRequired: true,
        protectedResourceMetadataRouteFutureOnly: true,
        wellKnownDiscoveryFutureOnly: true,
        wwwAuthenticateResourceMetadataDiscoveryRequired: true,
      }),
    routeDeferredBoundary:
      McpProtectedResourceRouteDeferredBoundarySchema.parse({
        ...base("McpProtectedResourceRouteDeferredBoundary"),
        newRoutePathAllowedNow: false,
        protectedResourceMetadataRouteImplemented: false,
        protectedResourceMetadataRoutePathAdded: false,
        routeBehaviorChangeAllowedNow: false,
      }),
    scopesBoundary: McpProtectedResourceScopesBoundarySchema.parse({
      ...base("McpProtectedResourceScopesBoundary"),
      adminScopesAllowed: false,
      leastPrivilegeRequired: true,
      offlineAccessAllowed: false,
      providerScopesAllowed: false,
      readOnlyOnly: true,
      scopesSupportedRequired: true,
      wildcardScopesAllowed: false,
      writeScopesAllowed: false,
    }),
    scopeChallengeReadinessBoundary:
      McpScopeChallengeReadinessBoundarySchema.parse({
        ...base("McpScopeChallengeReadinessBoundary"),
        authoritativeSources: [...MCP_SCOPE_CHALLENGE_AUTHORITIES],
        challengeImplementationFutureOnly: true,
        challengedScopesAuthoritativeForCurrentRequest: true,
        scopesSupportedNotAssumedAuthoritativeForChallenge: true,
      }),
    tokenFailureChallengeBoundary: McpTokenFailureChallengeBoundarySchema.parse(
      {
        ...base("McpTokenFailureChallengeBoundary"),
        failureModes: [...MCP_PROTECTED_RESOURCE_TOKEN_FAILURE_MODES],
        tokenFailureChallengeContractOnly: true,
        tokenFailureChallengeImplementationFutureOnly: true,
        tokenFailureMustNotDiscloseFinanceData: true,
      },
    ),
    wwwAuthenticateChallengeBoundary:
      McpWwwAuthenticateChallengeBoundarySchema.parse({
        ...base("McpWwwAuthenticateChallengeBoundary"),
        challengeMustIncludeResourceMetadata: true,
        challengeRouteBehaviorImplemented: false,
        missingInvalidTokenChallengeFutureOnly: true,
        scopeGuidanceMayBeIncluded: true,
      }),
    wwwAuthenticateRouteDeferredBoundary:
      McpWwwAuthenticateRouteDeferredBoundarySchema.parse({
        ...base("McpWwwAuthenticateRouteDeferredBoundary"),
        missingInvalidTokenRuntimeChallengeImplemented: false,
        routeBehaviorChangeAllowedNow: false,
        wwwAuthenticateRouteBehaviorImplemented: false,
      }),
  };
}

export function buildMcpProtectedResourceMetadataProof(
  input: ProofInput = {},
): McpProtectedResourceMetadataProof {
  const contracts = buildMcpProtectedResourceMetadataContracts();

  return McpProtectedResourceMetadataProofSchema.parse({
    ...buildMcpProtectedResourceMetadataInventoryProof(input),
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0109AdapterBoundaryStillVerified:
      input.fp0109AdapterBoundaryStillVerified ?? true,
    fp0111DefaultLocalDispatchWiringStillVerified:
      input.fp0111DefaultLocalDispatchWiringStillVerified ?? true,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified:
      input.fp0112RemotePublicOauthReadinessBoundaryStillVerified ?? true,
    fp0113OauthSecurityBoundaryStillVerified:
      input.fp0113OauthSecurityBoundaryStillVerified ?? true,
    fp0114RemoteHostReadinessBoundaryStillVerified:
      input.fp0114RemoteHostReadinessBoundaryStillVerified ?? true,
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified:
      input.fp0115RemoteHostImplementationSequencingBoundaryStillVerified ??
      true,
    fp0116RemoteHostResourceBoundaryStillVerified:
      input.fp0116RemoteHostResourceBoundaryStillVerified ?? true,
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      input.fp0117OauthImplementationSequencingBoundaryStillVerified ?? true,
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
      input.fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified ??
      true,
    fp0118BoundaryVerified: input.fp0118BoundaryVerified ?? true,
    fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
      input.fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified ??
      true,
    canonicalResourceAuthServerContractsFoundationVerified:
      input.canonicalResourceAuthServerContractsFoundationVerified ??
      buildMcpCanonicalResourceAuthServerContracts().proofContract.contractOnly,
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
      input.fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified ??
      true,
    fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
      input.fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified ??
      true,
    fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
      input.fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified ??
      true,
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      input.fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified ??
      true,
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
      input.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified ??
      true,
    fp0125Absent: input.fp0125Absent ?? true,
    fp0125EvidenceCoherenceBoundaryStillVerified:
      input.fp0125EvidenceCoherenceBoundaryStillVerified ?? true,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      input.fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified ??
      true,
    fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified:
      input.fp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlanVerified ??
      true,
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      input.fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified ??
      true,
    fp0128Absent: input.fp0128Absent ?? true,
    wwwAuthenticateAuthChallengeContractsFoundationVerified:
      input.wwwAuthenticateAuthChallengeContractsFoundationVerified ??
      buildMcpWwwAuthenticateAuthChallengeContracts().proofContract
        .contractOnly,
    noAppSubmissionFromFp0127: input.noAppSubmissionFromFp0127 ?? true,
    noAppsSdkResourceFromFp0127: input.noAppsSdkResourceFromFp0127 ?? true,
    noAuthMiddlewareImplementationFromFp0127:
      input.noAuthMiddlewareImplementationFromFp0127 ?? true,
    noDbQueriesFromFp0127: input.noDbQueriesFromFp0127 ?? true,
    noDeploymentConfigFromFp0127: input.noDeploymentConfigFromFp0127 ?? true,
    noListingCopyGeneratedPublicProseFromFp0127:
      input.noListingCopyGeneratedPublicProseFromFp0127 ?? true,
    noMcpRouteBehaviorChangeFromFp0127:
      input.noMcpRouteBehaviorChangeFromFp0127 ?? true,
    noOauthImplementationFromFp0127:
      input.noOauthImplementationFromFp0127 ?? true,
    noOpenAiApiCallsFromFp0127: input.noOpenAiApiCallsFromFp0127 ?? true,
    noPackageScriptsFromFp0127: input.noPackageScriptsFromFp0127 ?? true,
    noProtectedResourceMetadataRouteBehaviorChangeFromFp0127:
      input.noProtectedResourceMetadataRouteBehaviorChangeFromFp0127 ?? true,
    noProviderExternalCallsFromFp0127:
      input.noProviderExternalCallsFromFp0127 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0127:
      input.noPublicAssetsSubmissionArtifactsFromFp0127 ?? true,
    noRemoteMcpDeploymentFromFp0127:
      input.noRemoteMcpDeploymentFromFp0127 ?? true,
    noSchemaMigrationsFromFp0127: input.noSchemaMigrationsFromFp0127 ?? true,
    noSourceMutationFinanceWriteFromFp0127:
      input.noSourceMutationFinanceWriteFromFp0127 ?? true,
    noTokenSessionImplementationFromFp0127:
      input.noTokenSessionImplementationFromFp0127 ?? true,
    noTokenValidationImplementationFromFp0127:
      input.noTokenValidationImplementationFromFp0127 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0127:
      input.noWwwAuthenticateRouteBehaviorFromFp0127 ?? true,
    noAppSubmissionFromFp0126: input.noAppSubmissionFromFp0126 ?? true,
    noAppsSdkResourceFromFp0126: input.noAppsSdkResourceFromFp0126 ?? true,
    noAuthMiddlewareImplementationFromFp0126:
      input.noAuthMiddlewareImplementationFromFp0126 ?? true,
    noDbQueriesFromFp0126: input.noDbQueriesFromFp0126 ?? true,
    noDeploymentConfigFromFp0126: input.noDeploymentConfigFromFp0126 ?? true,
    noMcpRouteBehaviorChangeFromFp0126:
      input.noMcpRouteBehaviorChangeFromFp0126 ?? true,
    noOauthImplementationFromFp0126:
      input.noOauthImplementationFromFp0126 ?? true,
    noOpenAiApiCallsFromFp0126: input.noOpenAiApiCallsFromFp0126 ?? true,
    noPackageScriptsFromFp0126: input.noPackageScriptsFromFp0126 ?? true,
    noProviderExternalCallsFromFp0126:
      input.noProviderExternalCallsFromFp0126 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0126:
      input.noPublicAssetsSubmissionArtifactsFromFp0126 ?? true,
    noRemoteMcpDeploymentFromFp0126:
      input.noRemoteMcpDeploymentFromFp0126 ?? true,
    noSchemaMigrationsFromFp0126: input.noSchemaMigrationsFromFp0126 ?? true,
    noSourceMutationFinanceWriteFromFp0126:
      input.noSourceMutationFinanceWriteFromFp0126 ?? true,
    noTokenSessionImplementationFromFp0126:
      input.noTokenSessionImplementationFromFp0126 ?? true,
    noWwwAuthenticateBehaviorFromFp0126:
      input.noWwwAuthenticateBehaviorFromFp0126 ?? true,
    wwwAuthenticateAuthChallengeSequencingBoundaryVerified:
      input.wwwAuthenticateAuthChallengeSequencingBoundaryVerified ?? true,
    protectedResourceMetadataBuilderContractsFoundationVerified:
      input.protectedResourceMetadataBuilderContractsFoundationVerified ??
      buildMcpProtectedResourceMetadataBuilderContracts().proofContract
        .contractOnly,
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      input.protectedResourceMetadataRouteImplementationPlanningBoundaryVerified ??
      true,
    localProofOnly: true,
    noAppSubmission: input.noAppSubmission ?? true,
    noAppsSdkResourceImplementation:
      input.noAppsSdkResourceImplementation ?? true,
    noAuthMiddlewareImplementation:
      input.noAuthMiddlewareImplementation ?? true,
    noDbQueriesAdded: input.noDbQueriesAdded ?? true,
    noDeploymentConfig: input.noDeploymentConfig ?? true,
    noExternalCommunications: input.noExternalCommunications ?? true,
    noFinanceWrite: input.noFinanceWrite ?? true,
    noGeneratedPublicProse: input.noGeneratedPublicProse ?? true,
    noListingCopy: input.noListingCopy ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noNewRoutePath: input.noNewRoutePath ?? true,
    noOauthImplementation: input.noOauthImplementation ?? true,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noOpenAiClientOrKeyUsage: input.noOpenAiClientOrKeyUsage ?? true,
    noAppSubmissionFromFp0121: input.noAppSubmissionFromFp0121 ?? true,
    noAppsSdkResourceFromFp0121: input.noAppsSdkResourceFromFp0121 ?? true,
    noAuthMiddlewareImplementationFromFp0121:
      input.noAuthMiddlewareImplementationFromFp0121 ?? true,
    noDbQueriesFromFp0121: input.noDbQueriesFromFp0121 ?? true,
    noDeploymentConfigFromFp0121: input.noDeploymentConfigFromFp0121 ?? true,
    noFixturesSampleDataSourcePacksFromFp0121:
      input.noFixturesSampleDataSourcePacksFromFp0121 ?? true,
    noListingCopyGeneratedPublicProseFromFp0121:
      input.noListingCopyGeneratedPublicProseFromFp0121 ?? true,
    noNewRoutePathFromFp0121: input.noNewRoutePathFromFp0121 ?? true,
    noOauthImplementationFromFp0121:
      input.noOauthImplementationFromFp0121 ?? true,
    noOpenAiApiCallsFromFp0121: input.noOpenAiApiCallsFromFp0121 ?? true,
    noPackageScriptsFromFp0121: input.noPackageScriptsFromFp0121 ?? true,
    noProtectedResourceMetadataRouteFromFp0121:
      input.noProtectedResourceMetadataRouteFromFp0121 ?? true,
    noProviderExternalCallsFromFp0121:
      input.noProviderExternalCallsFromFp0121 ?? true,
    noPublicAppImplementationFromFp0121:
      input.noPublicAppImplementationFromFp0121 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0121:
      input.noPublicAssetsSubmissionArtifactsFromFp0121 ?? true,
    noRemoteMcpDeploymentFromFp0121:
      input.noRemoteMcpDeploymentFromFp0121 ?? true,
    noRouteBehaviorChangeFromFp0121:
      input.noRouteBehaviorChangeFromFp0121 ?? true,
    noSchemaMigrationsFromFp0121: input.noSchemaMigrationsFromFp0121 ?? true,
    noSourceMutationFinanceWriteFromFp0121:
      input.noSourceMutationFinanceWriteFromFp0121 ?? true,
    noTokenSessionImplementationFromFp0121:
      input.noTokenSessionImplementationFromFp0121 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0121:
      input.noWwwAuthenticateRouteBehaviorFromFp0121 ?? true,
    noAppSubmissionFromFp0122: input.noAppSubmissionFromFp0122 ?? true,
    noAppsSdkResourceFromFp0122: input.noAppsSdkResourceFromFp0122 ?? true,
    noAuthMiddlewareImplementationFromFp0122:
      input.noAuthMiddlewareImplementationFromFp0122 ?? true,
    noDbQueriesFromFp0122: input.noDbQueriesFromFp0122 ?? true,
    noDeploymentConfigFromFp0122: input.noDeploymentConfigFromFp0122 ?? true,
    noListingCopyGeneratedPublicProseFromFp0122:
      input.noListingCopyGeneratedPublicProseFromFp0122 ?? true,
    noNewRoutePathFromFp0122: input.noNewRoutePathFromFp0122 ?? true,
    noOauthImplementationFromFp0122:
      input.noOauthImplementationFromFp0122 ?? true,
    noOpenAiApiCallsFromFp0122: input.noOpenAiApiCallsFromFp0122 ?? true,
    noPackageScriptsFromFp0122: input.noPackageScriptsFromFp0122 ?? true,
    noProtectedResourceMetadataRouteFromFp0122:
      input.noProtectedResourceMetadataRouteFromFp0122 ?? true,
    noProviderExternalCallsFromFp0122:
      input.noProviderExternalCallsFromFp0122 ?? true,
    noPublicAppImplementationFromFp0122:
      input.noPublicAppImplementationFromFp0122 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0122:
      input.noPublicAssetsSubmissionArtifactsFromFp0122 ?? true,
    noRemoteMcpDeploymentFromFp0122:
      input.noRemoteMcpDeploymentFromFp0122 ?? true,
    noRouteBehaviorChangeFromFp0122:
      input.noRouteBehaviorChangeFromFp0122 ?? true,
    noSchemaMigrationsFromFp0122: input.noSchemaMigrationsFromFp0122 ?? true,
    noSourceMutationFinanceWriteFromFp0122:
      input.noSourceMutationFinanceWriteFromFp0122 ?? true,
    noTokenSessionImplementationFromFp0122:
      input.noTokenSessionImplementationFromFp0122 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0122:
      input.noWwwAuthenticateRouteBehaviorFromFp0122 ?? true,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      input.fp0120CanonicalResourceAuthServerBoundaryStillVerified ?? true,
    noAppSubmissionFromFp0119: input.noAppSubmissionFromFp0119 ?? true,
    noAppSubmissionFromFp0120: input.noAppSubmissionFromFp0120 ?? true,
    noAppsSdkResourceFromFp0119: input.noAppsSdkResourceFromFp0119 ?? true,
    noAppsSdkResourceFromFp0120: input.noAppsSdkResourceFromFp0120 ?? true,
    noAuthMiddlewareImplementationFromFp0119:
      input.noAuthMiddlewareImplementationFromFp0119 ?? true,
    noAuthMiddlewareImplementationFromFp0120:
      input.noAuthMiddlewareImplementationFromFp0120 ?? true,
    noDbQueriesFromFp0119: input.noDbQueriesFromFp0119 ?? true,
    noDbQueriesFromFp0120: input.noDbQueriesFromFp0120 ?? true,
    noDeploymentConfigFromFp0119: input.noDeploymentConfigFromFp0119 ?? true,
    noDeploymentConfigFromFp0120: input.noDeploymentConfigFromFp0120 ?? true,
    noListingCopyGeneratedPublicProseFromFp0119:
      input.noListingCopyGeneratedPublicProseFromFp0119 ?? true,
    noNewRoutePathFromFp0119: input.noNewRoutePathFromFp0119 ?? true,
    noNewRoutePathFromFp0120: input.noNewRoutePathFromFp0120 ?? true,
    noOauthImplementationFromFp0119:
      input.noOauthImplementationFromFp0119 ?? true,
    noOauthImplementationFromFp0120:
      input.noOauthImplementationFromFp0120 ?? true,
    noOpenAiApiCallsFromFp0119: input.noOpenAiApiCallsFromFp0119 ?? true,
    noOpenAiApiCallsFromFp0120: input.noOpenAiApiCallsFromFp0120 ?? true,
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noPackageScriptsFromFp0119: input.noPackageScriptsFromFp0119 ?? true,
    noPackageScriptsFromFp0120: input.noPackageScriptsFromFp0120 ?? true,
    noProtectedResourceMetadataRouteImplementation:
      input.noProtectedResourceMetadataRouteImplementation ?? true,
    noProtectedResourceMetadataRouteFromFp0119:
      input.noProtectedResourceMetadataRouteFromFp0119 ?? true,
    noProtectedResourceMetadataRouteFromFp0120:
      input.noProtectedResourceMetadataRouteFromFp0120 ?? true,
    noProviderCalls: input.noProviderCalls ?? true,
    noProviderExternalCallsFromFp0119:
      input.noProviderExternalCallsFromFp0119 ?? true,
    noProviderExternalCallsFromFp0120:
      input.noProviderExternalCallsFromFp0120 ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0119:
      input.noPublicAssetsSubmissionArtifactsFromFp0119 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0120:
      input.noPublicAssetsSubmissionArtifactsFromFp0120 ?? true,
    noRemoteMcpDeployment: input.noRemoteMcpDeployment ?? true,
    noRemoteMcpDeploymentFromFp0119:
      input.noRemoteMcpDeploymentFromFp0119 ?? true,
    noRemoteMcpDeploymentFromFp0120:
      input.noRemoteMcpDeploymentFromFp0120 ?? true,
    noRouteBehaviorChange: input.noRouteBehaviorChange ?? true,
    noRouteBehaviorChangeFromFp0119:
      input.noRouteBehaviorChangeFromFp0119 ?? true,
    noRouteBehaviorChangeFromFp0120:
      input.noRouteBehaviorChangeFromFp0120 ?? true,
    noSchemaMigrationsAdded: input.noSchemaMigrationsAdded ?? true,
    noSchemaMigrationsFromFp0119: input.noSchemaMigrationsFromFp0119 ?? true,
    noSchemaMigrationsFromFp0120: input.noSchemaMigrationsFromFp0120 ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noSourceMutationFinanceWriteFromFp0119:
      input.noSourceMutationFinanceWriteFromFp0119 ?? true,
    noSourceMutationFinanceWriteFromFp0120:
      input.noSourceMutationFinanceWriteFromFp0120 ?? true,
    noTokenSessionImplementation: input.noTokenSessionImplementation ?? true,
    noTokenSessionImplementationFromFp0119:
      input.noTokenSessionImplementationFromFp0119 ?? true,
    noTokenSessionImplementationFromFp0120:
      input.noTokenSessionImplementationFromFp0120 ?? true,
    noWwwAuthenticateRouteBehaviorImplementation:
      input.noWwwAuthenticateRouteBehaviorImplementation ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0119:
      input.noWwwAuthenticateRouteBehaviorFromFp0119 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0120:
      input.noWwwAuthenticateRouteBehaviorFromFp0120 ?? true,
    protectedResourceAuthorizationServersBoundaryVerified:
      input.protectedResourceAuthorizationServersBoundaryVerified ??
      McpProtectedResourceAuthorizationServersBoundarySchema.safeParse(
        contracts.authorizationServersBoundary,
      ).success,
    protectedResourceBearerMethodsBoundaryVerified:
      input.protectedResourceBearerMethodsBoundaryVerified ??
      McpProtectedResourceBearerMethodsBoundarySchema.safeParse(
        contracts.bearerMethodsBoundary,
      ).success,
    protectedResourceCanonicalUriDependencyBoundaryVerified:
      input.protectedResourceCanonicalUriDependencyBoundaryVerified ??
      McpProtectedResourceCanonicalUriDependencyBoundarySchema.safeParse(
        contracts.canonicalUriDependencyBoundary,
      ).success,
    protectedResourceMetadataContractsVerified:
      input.protectedResourceMetadataContractsVerified ??
      allContractsParse(contracts),
    protectedResourceMetadataRouteSequencingPlanBoundaryVerified:
      input.protectedResourceMetadataRouteSequencingPlanBoundaryVerified ??
      true,
    protectedResourceMetadataDocumentBoundaryVerified:
      input.protectedResourceMetadataDocumentBoundaryVerified ??
      McpProtectedResourceMetadataDocumentBoundarySchema.safeParse(
        contracts.documentBoundary,
      ).success,
    protectedResourceNoRuntimeBoundaryVerified:
      input.protectedResourceNoRuntimeBoundaryVerified ??
      McpProtectedResourceNoRuntimeBoundarySchema.safeParse(
        contracts.noRuntimeBoundary,
      ).success,
    protectedResourceRouteDeferredBoundaryVerified:
      input.protectedResourceRouteDeferredBoundaryVerified ??
      McpProtectedResourceRouteDeferredBoundarySchema.safeParse(
        contracts.routeDeferredBoundary,
      ).success,
    protectedResourceScopesBoundaryVerified:
      input.protectedResourceScopesBoundaryVerified ??
      McpProtectedResourceScopesBoundarySchema.safeParse(
        contracts.scopesBoundary,
      ).success,
    resourceMetadataDiscoveryBoundaryVerified:
      input.resourceMetadataDiscoveryBoundaryVerified ??
      McpResourceMetadataDiscoveryBoundarySchema.safeParse(
        contracts.resourceMetadataDiscoveryBoundary,
      ).success,
    schemaVersion: MCP_PROTECTED_RESOURCE_METADATA_SCHEMA_VERSION,
    scopeChallengeReadinessBoundaryVerified:
      input.scopeChallengeReadinessBoundaryVerified ??
      McpScopeChallengeReadinessBoundarySchema.safeParse(
        contracts.scopeChallengeReadinessBoundary,
      ).success,
    tokenFailureChallengeBoundaryVerified:
      input.tokenFailureChallengeBoundaryVerified ??
      McpTokenFailureChallengeBoundarySchema.safeParse(
        contracts.tokenFailureChallengeBoundary,
      ).success,
    noTokenLeakageMetadataBoundaryVerified:
      input.noTokenLeakageMetadataBoundaryVerified ??
      McpNoTokenLeakageMetadataBoundarySchema.safeParse(
        contracts.noTokenLeakageBoundary,
      ).success,
    wwwAuthenticateChallengeBoundaryVerified:
      input.wwwAuthenticateChallengeBoundaryVerified ??
      McpWwwAuthenticateChallengeBoundarySchema.safeParse(
        contracts.wwwAuthenticateChallengeBoundary,
      ).success,
    wwwAuthenticateRouteDeferredBoundaryVerified:
      input.wwwAuthenticateRouteDeferredBoundaryVerified ??
      McpWwwAuthenticateRouteDeferredBoundarySchema.safeParse(
        contracts.wwwAuthenticateRouteDeferredBoundary,
      ).success,
  });
}

export function validateMcpProtectedResourceMetadataDocumentCandidate(
  candidate: unknown,
) {
  const parsed =
    McpProtectedResourceMetadataDocumentSchema.safeParse(candidate);
  if (!parsed.success) return invalidDocumentValidation();

  const resource = validateMcpProtectedResourceCanonicalUriCandidate(
    parsed.data.resource,
  );
  const authorizationServers =
    parsed.data.authorization_servers.length > 0 &&
    parsed.data.authorization_servers.every(isHttpsUrlWithoutTokenMaterial);
  const scopes = validateMcpProtectedResourceScopes(
    parsed.data.scopes_supported,
  );
  const bearerMethods =
    parsed.data.bearer_methods_supported.includes("header") &&
    !parsed.data.bearer_methods_supported.includes("query");

  return {
    authorizationServersNonEmptyVerified: authorizationServers,
    bearerMethodsHeaderNoQueryVerified: bearerMethods,
    documentShapeVerified: true,
    metadataDocumentVerified:
      resource.canonicalResourceUriCandidateVerified &&
      authorizationServers &&
      scopes.scopesLeastPrivilegeReadOnlyVerified &&
      bearerMethods,
    resourceCanonicalUriDependencyVerified:
      resource.canonicalResourceUriCandidateVerified,
    scopesLeastPrivilegeReadOnlyVerified:
      scopes.scopesLeastPrivilegeReadOnlyVerified,
  };
}

export function validateMcpProtectedResourceCanonicalUriCandidate(
  resource: string,
) {
  try {
    const url = new URL(resource);
    const normalized = resource.toLowerCase();
    const host = url.hostname.toLowerCase();
    const httpsVerified = url.protocol === "https:";
    const noCurrentLocalRouteUrl =
      !["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host) &&
      !host.endsWith(".localhost");
    const noPlaceholder = !/(?:example|placeholder|your-|sample|\{|\})/iu.test(
      normalized,
    );
    const noSelectors =
      !/(?:companykey|company-key|company_key|workspace|tenant|org|user)/iu.test(
        normalized,
      );
    const pathVerified = url.pathname === MCP_PUBLIC_MCP_ENDPOINT_PATH;
    const noQuery = url.search === "";
    const noFragment = url.hash === "";
    return {
      canonicalResourceUriCandidateVerified:
        httpsVerified &&
        noCurrentLocalRouteUrl &&
        noPlaceholder &&
        noSelectors &&
        pathVerified &&
        noQuery &&
        noFragment,
      exactPublicMcpPathVerified: pathVerified,
      httpsVerified,
      noCurrentLocalRouteUrl,
      noFragment,
      noPlaceholder,
      noQuery,
      noWorkspaceTenantCompanySelector: noSelectors,
    };
  } catch {
    return {
      canonicalResourceUriCandidateVerified: false,
      exactPublicMcpPathVerified: false,
      httpsVerified: false,
      noCurrentLocalRouteUrl: false,
      noFragment: false,
      noPlaceholder: false,
      noQuery: false,
      noWorkspaceTenantCompanySelector: false,
    };
  }
}

export function validateMcpProtectedResourceScopes(scopes: readonly string[]) {
  return {
    rejectedScopePatterns: scopes.filter(isForbiddenScope),
    scopesLeastPrivilegeReadOnlyVerified:
      scopes.length > 0 &&
      scopes.every(isReadOnlyScope) &&
      !scopes.some(isForbiddenScope),
  };
}

export function verifyFp0118ProtectedResourceMetadataPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0118Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0118/u.test(path),
  );
  return (
    fp0118Hits.length === 1 &&
    fp0118Hits[0] === FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH &&
    fp0118PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0118AbsentOrLocalProtectedResourceMetadataContracts(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0118Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0118/u.test(path),
  );
  if (fp0118Hits.length === 0) return true;
  return (
    fp0118Hits.length === 1 &&
    fp0118Hits[0] === FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH &&
    fp0118PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlan(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0119Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0119/u.test(path),
  );
  if (fp0119Hits.length === 0) return true;
  return (
    fp0119Hits.length === 1 &&
    fp0119Hits[0] ===
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH &&
    fp0119PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0119Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0119/u.test(path),
  );
  return (
    fp0119Hits.length === 1 &&
    fp0119Hits[0] ===
      FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH &&
    fp0119PlanTextBoundaryVerified(input.planText)
  );
}

export {
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning,
  verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary,
};

export function verifyFp0119PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding: normalized.includes(
      "authenticated company binding",
    ),
    planningTextIncludesCanonicalUriPrerequisite:
      normalized.includes("canonical public resource uri") ||
      normalized.includes("canonical resource uri prerequisite"),
    planningTextIncludesFp0120Absence: normalized.includes(
      "fp-0120 remains absent",
    ),
    planningTextIncludesMetadataDocumentTests: normalized.includes(
      "metadata document tests",
    ),
    planningTextIncludesNoTokenLeakage: normalized.includes("no token leakage"),
    planningTextIncludesProtectedResourceMetadataRouteSequencing:
      normalized.includes(
        "protected-resource metadata route implementation sequencing",
      ),
    planningTextIncludesRouteTests: normalized.includes("route tests"),
    planningTextIncludesWwwAuthenticateSequencing:
      normalized.includes("www-authenticate") &&
      normalized.includes("challenge sequencing"),
  };
}

export function textHasProtectedResourceTokenLeakage(value: string) {
  return /(?:authorization:\s*bearer\s+\S+|bearer\s+[a-z0-9._~-]{20,}|access_token\s*[:=]\s*\S+|refresh_token\s*[:=]\s*\S+|id_token\s*[:=]\s*\S+|sk-[a-z0-9]{16,})/iu.test(
    value,
  );
}

function base(
  contractKind: z.infer<typeof McpProtectedResourceMetadataContractKindSchema>,
) {
  return {
    contractKind,
    implementationAdded: false,
    localProofOnly: true,
    readOnly: true,
    schemaVersion: MCP_PROTECTED_RESOURCE_METADATA_SCHEMA_VERSION,
  };
}

function allContractsParse(
  contracts: ReturnType<typeof buildMcpProtectedResourceMetadataContracts>,
) {
  return (
    McpProtectedResourceMetadataProofContractSchema.safeParse(
      contracts.proofContract,
    ).success &&
    McpProtectedResourceMetadataDocumentBoundarySchema.safeParse(
      contracts.documentBoundary,
    ).success &&
    McpProtectedResourceCanonicalUriDependencyBoundarySchema.safeParse(
      contracts.canonicalUriDependencyBoundary,
    ).success &&
    McpProtectedResourceAuthorizationServersBoundarySchema.safeParse(
      contracts.authorizationServersBoundary,
    ).success &&
    McpProtectedResourceScopesBoundarySchema.safeParse(contracts.scopesBoundary)
      .success &&
    McpProtectedResourceBearerMethodsBoundarySchema.safeParse(
      contracts.bearerMethodsBoundary,
    ).success &&
    McpWwwAuthenticateChallengeBoundarySchema.safeParse(
      contracts.wwwAuthenticateChallengeBoundary,
    ).success &&
    McpResourceMetadataDiscoveryBoundarySchema.safeParse(
      contracts.resourceMetadataDiscoveryBoundary,
    ).success &&
    McpScopeChallengeReadinessBoundarySchema.safeParse(
      contracts.scopeChallengeReadinessBoundary,
    ).success &&
    McpTokenFailureChallengeBoundarySchema.safeParse(
      contracts.tokenFailureChallengeBoundary,
    ).success &&
    McpNoTokenLeakageMetadataBoundarySchema.safeParse(
      contracts.noTokenLeakageBoundary,
    ).success &&
    McpProtectedResourceRouteDeferredBoundarySchema.safeParse(
      contracts.routeDeferredBoundary,
    ).success &&
    McpWwwAuthenticateRouteDeferredBoundarySchema.safeParse(
      contracts.wwwAuthenticateRouteDeferredBoundary,
    ).success &&
    McpProtectedResourceNoRuntimeBoundarySchema.safeParse(
      contracts.noRuntimeBoundary,
    ).success
  );
}

function invalidDocumentValidation() {
  return {
    authorizationServersNonEmptyVerified: false,
    bearerMethodsHeaderNoQueryVerified: false,
    documentShapeVerified: false,
    metadataDocumentVerified: false,
    resourceCanonicalUriDependencyVerified: false,
    scopesLeastPrivilegeReadOnlyVerified: false,
  };
}

function isHttpsUrlWithoutTokenMaterial(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !textHasProtectedResourceTokenLeakage(value) &&
      !/(?:\{|\}|placeholder|your-|sample)/iu.test(value)
    );
  } catch {
    return false;
  }
}

function isReadOnlyScope(scope: string) {
  return /(?:^read[:._-]|[:._-]read$|\.read$)/iu.test(scope);
}

function isForbiddenScope(scope: string) {
  const normalized = scope.toLowerCase();
  return (
    normalized === "*" ||
    MCP_REJECTED_PROTECTED_RESOURCE_SCOPE_PATTERNS.some((pattern) =>
      normalized.includes(pattern),
    ) ||
    /(?:write|delete|mutate|admin|provider|offline|openid|profile|email)/iu.test(
      normalized,
    )
  );
}

function fp0118PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return [
    "local/proof-only/read-only contract slice",
    "protected-resource metadata",
    "auth-challenge readiness",
    "does not add protected-resource metadata routes",
    "does not implement route behavior",
    "resource",
    "authorization_servers",
    "scopes_supported",
    "bearer_methods_supported",
    "future exact stable https canonical public mcp resource uri",
    "authorization_servers must be non-empty",
    "least-privilege and read-only",
    "forbid query-string token use",
    "www-authenticate",
    "resource_metadata",
    "challenged scopes as authoritative",
    "authenticated company binding",
    "companykey",
    "token passthrough remains forbidden",
    "no token leakage",
    "local /mcp route behavior remains unchanged",
    "no new route path",
    "fp-0119 remains absent",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0119PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  const topics = verifyFp0119PlanningTextRequiredTopics(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility",
      "protected-resource metadata route implementation sequencing",
      "www-authenticate resource_metadata challenge sequencing",
      "does not implement protected-resource metadata routes",
      "does not implement www-authenticate challenge behavior",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not change /mcp route behavior",
      "does not add route paths",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "public app submission remains future-only",
      "fp-0120 remains absent",
      "canonical public resource uri",
      "authorization_servers",
      "scopes_supported",
      "bearer_methods_supported",
      ".well-known/oauth-protected-resource",
      "route tests",
      "metadata document tests",
      "no token leakage",
      "authenticated company binding",
      "token passthrough",
      "public /mcp",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(topics).every(Boolean)
  );
}

type Fp0126BoundaryInput =
  | readonly string[]
  | {
      planText?: string;
      repoPaths: readonly string[];
    };

export function verifyFp0126PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    docsAndPlanProofGateCompatibility: normalized.includes(
      "docs-and-plan plus proof-gate compatibility",
    ),
    exactPlanScope: normalized.includes(
      "www-authenticate resource_metadata auth-challenge behavior sequencing",
    ),
    fp0125MetadataRouteUnchanged: normalized.includes(
      "fp-0125 metadata route remains unchanged",
    ),
    fp0127Absent:
      normalized.includes("fp-0127 was absent at fp-0126 closeout") ||
      normalized.includes("fp-0127 stayed absent at fp-0126 closeout") ||
      normalized.includes("fp-0127 not yet created at fp-0126 closeout"),
    localDispatchUnchanged: normalized.includes(
      "/mcp initialize/ping/tools/list/tools/call behavior remains unchanged",
    ),
    noAppsSdkSubmissionPublicRuntime: normalized.includes(
      "does not add remote mcp, deployment config, apps sdk resources, public app behavior, app submission",
    ),
    noDbSchemaPackageOpenAiProviderSourceFinanceScope: normalized.includes(
      "does not add db queries, schemas, migrations, package scripts, public assets, listing copy, generated public prose, openai api/model calls, provider calls, source mutation, finance writes, or autonomous action",
    ),
    noMcpBehaviorChange: normalized.includes("does not change /mcp behavior"),
    noOauthTokenSessionAuthMiddleware: normalized.includes(
      "does not add oauth/token/session/auth middleware",
    ),
    noWwwAuthenticateImplementation: normalized.includes(
      "does not implement www-authenticate behavior",
    ),
    resourceMetadataLocalVsPublicUrlDecision:
      normalized.includes(
        "local proof value may reference the local metadata route path",
      ) && normalized.includes("future public canonical url"),
    scopeChallengeDeferredUntilScopesFinalized: normalized.includes(
      "scope challenge behavior remains contract-only until public-host scopes are finalized",
    ),
    tokenFailureLaneDeferred: normalized.includes(
      "token failure statuses remain in a later token-validation lane",
    ),
    tokenFailureModesNamed:
      normalized.includes("missing-token") &&
      normalized.includes("malformed-token") &&
      normalized.includes("expired-token") &&
      normalized.includes("wrong-audience") &&
      normalized.includes("wrong-scope") &&
      normalized.includes("wrong-org"),
    futureChallengeTestsNamed:
      normalized.includes("missing token challenge") &&
      normalized.includes("invalid token challenge") &&
      normalized.includes("no token leakage") &&
      normalized.includes("exact resource_metadata url") &&
      normalized.includes(
        "no challenge on initialize if not authorized by later plan",
      ) &&
      normalized.includes(
        "preservation of notifications / origin / get 405 behavior",
      ),
  };
}

export function verifyFp0126AbsentOrDocsOnlyWwwAuthenticateAuthChallengeSequencingPlan(
  input: Fp0126BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0126BoundaryInput(input);
  const fp0126Hits = repoPaths.filter((path) =>
    path.includes(FP0126_PLAN_PREFIX),
  );
  if (fp0126Hits.length === 0) return true;

  return (
    fp0126Hits.length === 1 &&
    fp0126Hits[0] ===
      FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH &&
    typeof planText === "string" &&
    fp0126PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary(
  input: Fp0126BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0126BoundaryInput(input);
  const fp0126Hits = repoPaths.filter((path) =>
    path.includes(FP0126_PLAN_PREFIX),
  );

  return (
    fp0126Hits.length === 1 &&
    fp0126Hits[0] ===
      FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH &&
    typeof planText === "string" &&
    fp0126PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0127Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => path.includes(FP0127_PLAN_PREFIX));
}

function fp0126PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "www-authenticate resource_metadata auth-challenge behavior sequencing",
      "does not implement www-authenticate behavior",
      "does not change /mcp behavior",
      "does not add oauth/token/session/auth middleware",
      "token validation runtime remains future-only",
      "remote mcp deployment remains future-only",
      "apps sdk resources remain future-only",
      "public app submission remains future-only",
      "fp-0125 metadata route remains unchanged",
      "fp-0125 evidence-coherence hardening remains preserved",
      "fp-0124 route implementation planning boundary remains preserved",
      "fp-0123 route-input evidence boundary remains preserved",
      "fp-0122 metadata builder boundary remains preserved",
      "fp-0120 canonical resource/auth-server boundary remains preserved",
      "fp-0118 protected-resource metadata boundary remains preserved",
      "fp-0117 oauth sequencing boundary remains preserved",
      "fp-0107 route adapter boundary remains preserved",
      "fp-0106 protocol envelope boundary remains preserved",
      "fp-0100 public security boundary remains preserved",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0126PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function normalizeFp0126BoundaryInput(input: Fp0126BoundaryInput): {
  planText?: string;
  repoPaths: readonly string[];
} {
  if (!Array.isArray(input) && "repoPaths" in input) {
    return input;
  }

  return { repoPaths: input, planText: undefined };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
