import { z } from "zod";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION =
  "v2an.read-only-app-mcp-canonical-resource-auth-server.v1";

export const FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH =
  "plans/FP-0120-read-only-chatgpt-app-mcp-canonical-resource-auth-server-readiness-contracts.md";

export const MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH =
  "/.well-known/oauth-protected-resource";

export const MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH = "/mcp";

export const MCP_CANONICAL_RESOURCE_DECISION_STATUS =
  "deferred_until_exact_stable_https_public_uri_proved";

export const MCP_AUTH_SERVER_SELECTION_STATUS = "unresolved_hold";

export const MCP_CANONICAL_RESOURCE_REJECTED_SELECTOR_TOKENS = [
  "companykey",
  "company-key",
  "company_key",
  "workspace",
  "tenant",
  "org",
  "organization",
  "user",
] as const;

export const MCP_CANONICAL_RESOURCE_REJECTED_LOCAL_TUNNEL_HOST_TOKENS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "ngrok",
  "ngrok-free.app",
  "loca.lt",
  "localtunnel",
  "trycloudflare.com",
  "localhost.run",
  "serveo.net",
] as const;

export const MCP_CANONICAL_RESOURCE_REJECTED_CREDENTIAL_URI_TOKENS = [
  "api_key",
  "apikey",
  "accesskey",
  "password",
  "passwd",
  "secret",
  "jwt",
  "id_token",
  "sessionid",
  "session_id",
  "credential",
  "private_key",
  "bearer",
  "basic",
] as const;

export const McpCanonicalResourceAuthServerContractKindSchema = z.enum([
  "McpCanonicalResourceAuthServerProofContract",
  "McpCanonicalPublicResourceUriBoundary",
  "McpCanonicalUriDecisionDeferredBoundary",
  "McpCanonicalUriHttpsExactStableBoundary",
  "McpCanonicalUriNoSelectorAuthorityBoundary",
  "McpCanonicalUriNoQueryFragmentBoundary",
  "McpResourceIndicatorBoundary",
  "McpAuthorizationServersReadinessBoundary",
  "McpAuthServerProviderNeutralBoundary",
  "McpProtectedResourceRoutePathDerivationBoundary",
  "McpWwwAuthenticateMetadataUrlBoundary",
  "McpNoLocalTunnelAuthorityBoundary",
  "McpNoRouteRuntimeBoundary",
]);

const BaseMcpCanonicalResourceContractSchema = z
  .object({
    schemaVersion: z.literal(MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION),
    contractKind: McpCanonicalResourceAuthServerContractKindSchema,
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpCanonicalResourceAuthServerProofContractSchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalResourceAuthServerProofContract"),
    contractOnly: trueLiteral,
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
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noProviderCalls: trueLiteral,
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const McpCanonicalPublicResourceUriBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalPublicResourceUriBoundary"),
    canonicalPublicResourceUriRequiredBeforeRouteImplementation: trueLiteral,
    canonicalPublicResourceUriSelected: falseLiteral,
    canonicalPublicResourceUriDecisionStatus: z.literal(
      MCP_CANONICAL_RESOURCE_DECISION_STATUS,
    ),
    publicResourceIdentifierMustBeCanonical: trueLiteral,
    noWorkspaceTenantTemplateUrl: trueLiteral,
    noCompanyKeyUserOrgSelectorUrl: trueLiteral,
  }).strict();

export const McpCanonicalUriDecisionDeferredBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalUriDecisionDeferredBoundary"),
    productionHostProviderSelected: falseLiteral,
    exactStableHttpsValueProved: falseLiteral,
    canonicalUriDecisionDeferred: trueLiteral,
    routeImplementationBlockedUntilCanonicalUri: trueLiteral,
  }).strict();

export const McpCanonicalUriHttpsExactStableBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalUriHttpsExactStableBoundary"),
    httpsRequired: trueLiteral,
    exactValueRequired: trueLiteral,
    stablePublicAuthorityRequired: trueLiteral,
    placeholderAllowed: falseLiteral,
    localHostAllowed: falseLiteral,
    localTunnelAllowed: falseLiteral,
  }).strict();

export const McpCanonicalUriNoSelectorAuthorityBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalUriNoSelectorAuthorityBoundary"),
    companyKeyInUriAllowed: falseLiteral,
    userOrgSelectorsInUriAllowed: falseLiteral,
    workspaceTenantTemplateUrlAllowed: falseLiteral,
    unauthenticatedSelectorAuthorityAllowed: falseLiteral,
    clientSelectedAuthorityAllowed: falseLiteral,
  }).strict();

export const McpCanonicalUriNoQueryFragmentBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpCanonicalUriNoQueryFragmentBoundary"),
    queryStringAllowed: falseLiteral,
    fragmentAllowed: falseLiteral,
  }).strict();

export const McpResourceIndicatorBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpResourceIndicatorBoundary"),
    resourceParameterRequiredInAuthorizationRequests: trueLiteral,
    resourceParameterRequiredInTokenRequests: trueLiteral,
    resourceParameterMustEqualCanonicalResourceUri: trueLiteral,
    accessTokenAudienceResourceValidationRequired: trueLiteral,
    tokenPassthroughAllowed: falseLiteral,
  }).strict();

export const McpAuthorizationServersReadinessBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpAuthorizationServersReadinessBoundary"),
    authorizationServersRequiredBeforeImplementation: trueLiteral,
    authorizationServersMustBeNonEmpty: trueLiteral,
    authorizationServerSelectionStatus: z.literal(
      MCP_AUTH_SERVER_SELECTION_STATUS,
    ),
    authorizationServerProviderSelected: falseLiteral,
  }).strict();

export const McpAuthServerProviderNeutralBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpAuthServerProviderNeutralBoundary"),
    providerNeutral: trueLiteral,
    providerSelected: falseLiteral,
    authorizationServerSelected: falseLiteral,
    providerCallsAllowed: falseLiteral,
    deploymentProviderConfigAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceRoutePathDerivationBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpProtectedResourceRoutePathDerivationBoundary"),
    routePathDerivedFromCanonicalResourceUri: trueLiteral,
    rfc9728WellKnownPath: z.literal(MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH),
    currentLikelyCanonicalResourcePath: z.literal(
      MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH,
    ),
    currentLikelyDerivedRoutePath: z.literal(
      `${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}${MCP_CANONICAL_RESOURCE_CURRENT_LIKELY_PATH}`,
    ),
    hostRootDerivedRoutePath: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
    ),
    routeImplementationAdded: falseLiteral,
  }).strict();

export const McpWwwAuthenticateMetadataUrlBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateMetadataUrlBoundary"),
    resourceMetadataUrlMustEqualDerivedMetadataUrl: trueLiteral,
    wwwAuthenticateRouteBehaviorImplemented: falseLiteral,
    missingInvalidTokenChallengeFutureOnly: trueLiteral,
  }).strict();

export const McpNoLocalTunnelAuthorityBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpNoLocalTunnelAuthorityBoundary"),
    localTunnelAuthorityRejected: trueLiteral,
    localTunnelCountsAsCanonicalPublicUri: falseLiteral,
    localTunnelCountsAsPublicDeploymentProof: falseLiteral,
    localTunnelCountsAsSubmissionProof: falseLiteral,
  }).strict();

export const McpNoRouteRuntimeBoundarySchema =
  BaseMcpCanonicalResourceContractSchema.extend({
    contractKind: z.literal("McpNoRouteRuntimeBoundary"),
    noProtectedResourceMetadataRouteAdded: trueLiteral,
    noWwwAuthenticateRouteBehaviorAdded: trueLiteral,
    noOauthTokenSessionAuthMiddleware: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noDeploymentConfig: trueLiteral,
    noAppsSdkResourceRuntime: trueLiteral,
    noPublicAppRuntime: trueLiteral,
    noDbRuntime: trueLiteral,
  }).strict();

export type McpCanonicalResourceAuthServerContractKind = z.infer<
  typeof McpCanonicalResourceAuthServerContractKindSchema
>;
