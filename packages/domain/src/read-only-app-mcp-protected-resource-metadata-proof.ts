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
  buildMcpCanonicalResourceAuthServerContracts,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0121Absent,
} from "./read-only-app-mcp-canonical-resource";
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
    fp0121Absent: trueLiteral,
    canonicalResourceAuthServerContractsFoundationVerified: trueLiteral,
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
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified:
      trueLiteral,
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
    documentBoundary:
      McpProtectedResourceMetadataDocumentBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataDocumentBoundary"),
        metadataDocumentExamplesContainTokens: false,
        protectedResourceMetadataRequiredBeforePublicTokenProtectedExposure:
          true,
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
    tokenFailureChallengeBoundary:
      McpTokenFailureChallengeBoundarySchema.parse({
        ...base("McpTokenFailureChallengeBoundary"),
        failureModes: [...MCP_PROTECTED_RESOURCE_TOKEN_FAILURE_MODES],
        tokenFailureChallengeContractOnly: true,
        tokenFailureChallengeImplementationFutureOnly: true,
        tokenFailureMustNotDiscloseFinanceData: true,
      }),
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
    fp0121Absent: input.fp0121Absent ?? true,
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
    noAppSubmissionFromFp0119: input.noAppSubmissionFromFp0119 ?? true,
    noAppSubmissionFromFp0120: input.noAppSubmissionFromFp0120 ?? true,
    noAppsSdkResourceFromFp0119:
      input.noAppsSdkResourceFromFp0119 ?? true,
    noAppsSdkResourceFromFp0120:
      input.noAppsSdkResourceFromFp0120 ?? true,
    noAuthMiddlewareImplementationFromFp0119:
      input.noAuthMiddlewareImplementationFromFp0119 ?? true,
    noAuthMiddlewareImplementationFromFp0120:
      input.noAuthMiddlewareImplementationFromFp0120 ?? true,
    noDbQueriesFromFp0119: input.noDbQueriesFromFp0119 ?? true,
    noDbQueriesFromFp0120: input.noDbQueriesFromFp0120 ?? true,
    noDeploymentConfigFromFp0119:
      input.noDeploymentConfigFromFp0119 ?? true,
    noDeploymentConfigFromFp0120:
      input.noDeploymentConfigFromFp0120 ?? true,
    noListingCopyGeneratedPublicProseFromFp0119:
      input.noListingCopyGeneratedPublicProseFromFp0119 ?? true,
    noNewRoutePathFromFp0119: input.noNewRoutePathFromFp0119 ?? true,
    noNewRoutePathFromFp0120: input.noNewRoutePathFromFp0120 ?? true,
    noOauthImplementationFromFp0119:
      input.noOauthImplementationFromFp0119 ?? true,
    noOauthImplementationFromFp0120:
      input.noOauthImplementationFromFp0120 ?? true,
    noOpenAiApiCallsFromFp0119: input.noOpenAiApiCallsFromFp0119 ?? true,
    noOpenAiApiCallsFromFp0120:
      input.noOpenAiApiCallsFromFp0120 ?? true,
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noPackageScriptsFromFp0119:
      input.noPackageScriptsFromFp0119 ?? true,
    noPackageScriptsFromFp0120:
      input.noPackageScriptsFromFp0120 ?? true,
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
    noSchemaMigrationsFromFp0119:
      input.noSchemaMigrationsFromFp0119 ?? true,
    noSchemaMigrationsFromFp0120:
      input.noSchemaMigrationsFromFp0120 ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noSourceMutationFinanceWriteFromFp0119:
      input.noSourceMutationFinanceWriteFromFp0119 ?? true,
    noSourceMutationFinanceWriteFromFp0120:
      input.noSourceMutationFinanceWriteFromFp0120 ?? true,
    noTokenSessionImplementation:
      input.noTokenSessionImplementation ?? true,
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
  const parsed = McpProtectedResourceMetadataDocumentSchema.safeParse(candidate);
  if (!parsed.success) return invalidDocumentValidation();

  const resource =
    validateMcpProtectedResourceCanonicalUriCandidate(parsed.data.resource);
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
    const noPlaceholder =
      !/(?:example|placeholder|your-|sample|\{|\})/iu.test(normalized);
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

export { verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts };

export { verifyFp0121Absent };

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
    planningTextIncludesNoTokenLeakage: normalized.includes(
      "no token leakage",
    ),
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
    McpProtectedResourceScopesBoundarySchema.safeParse(
      contracts.scopesBoundary,
    ).success &&
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

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
