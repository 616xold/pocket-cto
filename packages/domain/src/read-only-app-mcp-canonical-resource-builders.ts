import {
  MCP_AUTH_SERVER_SELECTION_STATUS,
  MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION,
  MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH,
  MCP_CANONICAL_RESOURCE_DECISION_STATUS,
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  McpAuthorizationServersReadinessBoundarySchema,
  McpAuthServerProviderNeutralBoundarySchema,
  McpCanonicalPublicResourceUriBoundarySchema,
  McpCanonicalResourceAuthServerProofContractSchema,
  McpCanonicalUriDecisionDeferredBoundarySchema,
  McpCanonicalUriHttpsExactStableBoundarySchema,
  McpCanonicalUriNoQueryFragmentBoundarySchema,
  McpCanonicalUriNoSelectorAuthorityBoundarySchema,
  McpNoLocalTunnelAuthorityBoundarySchema,
  McpNoRouteRuntimeBoundarySchema,
  McpProtectedResourceRoutePathDerivationBoundarySchema,
  McpResourceIndicatorBoundarySchema,
  McpWwwAuthenticateMetadataUrlBoundarySchema,
  type McpCanonicalResourceAuthServerContractKind,
} from "./read-only-app-mcp-canonical-resource-contracts";

export function buildMcpCanonicalResourceAuthServerContracts() {
  return {
    authServerProviderNeutralBoundary:
      McpAuthServerProviderNeutralBoundarySchema.parse({
        ...base("McpAuthServerProviderNeutralBoundary"),
        authorizationServerSelected: false,
        deploymentProviderConfigAllowed: false,
        providerCallsAllowed: false,
        providerNeutral: true,
        providerSelected: false,
      }),
    authorizationServersReadinessBoundary:
      McpAuthorizationServersReadinessBoundarySchema.parse({
        ...base("McpAuthorizationServersReadinessBoundary"),
        authorizationServerProviderSelected: false,
        authorizationServerSelectionStatus: MCP_AUTH_SERVER_SELECTION_STATUS,
        authorizationServersMustBeNonEmpty: true,
        authorizationServersRequiredBeforeImplementation: true,
      }),
    canonicalPublicResourceUriBoundary:
      McpCanonicalPublicResourceUriBoundarySchema.parse({
        ...base("McpCanonicalPublicResourceUriBoundary"),
        canonicalPublicResourceUriDecisionStatus:
          MCP_CANONICAL_RESOURCE_DECISION_STATUS,
        canonicalPublicResourceUriRequiredBeforeRouteImplementation: true,
        canonicalPublicResourceUriSelected: false,
        noCompanyKeyUserOrgSelectorUrl: true,
        noWorkspaceTenantTemplateUrl: true,
        publicResourceIdentifierMustBeCanonical: true,
      }),
    canonicalUriDecisionDeferredBoundary:
      McpCanonicalUriDecisionDeferredBoundarySchema.parse({
        ...base("McpCanonicalUriDecisionDeferredBoundary"),
        canonicalUriDecisionDeferred: true,
        exactStableHttpsValueProved: false,
        productionHostProviderSelected: false,
        routeImplementationBlockedUntilCanonicalUri: true,
      }),
    canonicalUriHttpsExactStableBoundary:
      McpCanonicalUriHttpsExactStableBoundarySchema.parse({
        ...base("McpCanonicalUriHttpsExactStableBoundary"),
        exactValueRequired: true,
        httpsRequired: true,
        localHostAllowed: false,
        localTunnelAllowed: false,
        placeholderAllowed: false,
        stablePublicAuthorityRequired: true,
      }),
    canonicalUriNoQueryFragmentBoundary:
      McpCanonicalUriNoQueryFragmentBoundarySchema.parse({
        ...base("McpCanonicalUriNoQueryFragmentBoundary"),
        fragmentAllowed: false,
        queryStringAllowed: false,
      }),
    canonicalUriNoSelectorAuthorityBoundary:
      McpCanonicalUriNoSelectorAuthorityBoundarySchema.parse({
        ...base("McpCanonicalUriNoSelectorAuthorityBoundary"),
        clientSelectedAuthorityAllowed: false,
        companyKeyInUriAllowed: false,
        unauthenticatedSelectorAuthorityAllowed: false,
        userOrgSelectorsInUriAllowed: false,
        workspaceTenantTemplateUrlAllowed: false,
      }),
    noLocalTunnelAuthorityBoundary:
      McpNoLocalTunnelAuthorityBoundarySchema.parse({
        ...base("McpNoLocalTunnelAuthorityBoundary"),
        localTunnelAuthorityRejected: true,
        localTunnelCountsAsCanonicalPublicUri: false,
        localTunnelCountsAsPublicDeploymentProof: false,
        localTunnelCountsAsSubmissionProof: false,
      }),
    noRouteRuntimeBoundary: McpNoRouteRuntimeBoundarySchema.parse({
      ...base("McpNoRouteRuntimeBoundary"),
      noAppsSdkResourceRuntime: true,
      noDbRuntime: true,
      noDeploymentConfig: true,
      noOauthTokenSessionAuthMiddleware: true,
      noProtectedResourceMetadataRouteAdded: true,
      noPublicAppRuntime: true,
      noRemoteMcpDeployment: true,
      noWwwAuthenticateRouteBehaviorAdded: true,
    }),
    proofContract: McpCanonicalResourceAuthServerProofContractSchema.parse({
      ...base("McpCanonicalResourceAuthServerProofContract"),
      contractOnly: true,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noDbQueriesAdded: true,
      noDeploymentConfig: true,
      noExternalCommunications: true,
      noFinanceWrite: true,
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
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenSessionImplementation: true,
      noWwwAuthenticateRouteBehaviorImplementation: true,
    }),
    resourceIndicatorBoundary: McpResourceIndicatorBoundarySchema.parse({
      ...base("McpResourceIndicatorBoundary"),
      accessTokenAudienceResourceValidationRequired: true,
      resourceParameterMustEqualCanonicalResourceUri: true,
      resourceParameterRequiredInAuthorizationRequests: true,
      resourceParameterRequiredInTokenRequests: true,
      tokenPassthroughAllowed: false,
    }),
    routePathDerivationBoundary:
      McpProtectedResourceRoutePathDerivationBoundarySchema.parse({
        ...base("McpProtectedResourceRoutePathDerivationBoundary"),
        currentLikelyCanonicalResourcePath:
          MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH,
        currentLikelyDerivedRoutePath:
          `${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}${MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH}`,
        hostRootDerivedRoutePath:
          MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
        rfc9728WellKnownPath: MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
        routeImplementationAdded: false,
        routePathDerivedFromCanonicalResourceUri: true,
      }),
    wwwAuthenticateMetadataUrlBoundary:
      McpWwwAuthenticateMetadataUrlBoundarySchema.parse({
        ...base("McpWwwAuthenticateMetadataUrlBoundary"),
        missingInvalidTokenChallengeFutureOnly: true,
        resourceMetadataUrlMustEqualDerivedMetadataUrl: true,
        wwwAuthenticateRouteBehaviorImplemented: false,
      }),
  };
}

export function allMcpCanonicalResourceAuthServerContractsParse(
  contracts: ReturnType<typeof buildMcpCanonicalResourceAuthServerContracts>,
) {
  return (
    McpCanonicalResourceAuthServerProofContractSchema.safeParse(
      contracts.proofContract,
    ).success &&
    McpCanonicalPublicResourceUriBoundarySchema.safeParse(
      contracts.canonicalPublicResourceUriBoundary,
    ).success &&
    McpCanonicalUriDecisionDeferredBoundarySchema.safeParse(
      contracts.canonicalUriDecisionDeferredBoundary,
    ).success &&
    McpCanonicalUriHttpsExactStableBoundarySchema.safeParse(
      contracts.canonicalUriHttpsExactStableBoundary,
    ).success &&
    McpCanonicalUriNoSelectorAuthorityBoundarySchema.safeParse(
      contracts.canonicalUriNoSelectorAuthorityBoundary,
    ).success &&
    McpCanonicalUriNoQueryFragmentBoundarySchema.safeParse(
      contracts.canonicalUriNoQueryFragmentBoundary,
    ).success &&
    McpResourceIndicatorBoundarySchema.safeParse(
      contracts.resourceIndicatorBoundary,
    ).success &&
    McpAuthorizationServersReadinessBoundarySchema.safeParse(
      contracts.authorizationServersReadinessBoundary,
    ).success &&
    McpAuthServerProviderNeutralBoundarySchema.safeParse(
      contracts.authServerProviderNeutralBoundary,
    ).success &&
    McpProtectedResourceRoutePathDerivationBoundarySchema.safeParse(
      contracts.routePathDerivationBoundary,
    ).success &&
    McpWwwAuthenticateMetadataUrlBoundarySchema.safeParse(
      contracts.wwwAuthenticateMetadataUrlBoundary,
    ).success &&
    McpNoLocalTunnelAuthorityBoundarySchema.safeParse(
      contracts.noLocalTunnelAuthorityBoundary,
    ).success &&
    McpNoRouteRuntimeBoundarySchema.safeParse(
      contracts.noRouteRuntimeBoundary,
    ).success
  );
}

function base(contractKind: McpCanonicalResourceAuthServerContractKind) {
  return {
    contractKind,
    implementationAdded: false,
    localProofOnly: true,
    readOnly: true,
    schemaVersion: MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION,
  };
}
