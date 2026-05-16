import { z } from "zod";
import { MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION } from "./read-only-app-mcp-canonical-resource-contracts";
import { McpCanonicalResourceAuthServerInventoryProofSchema } from "./read-only-app-mcp-canonical-resource-inventory";

const trueLiteral = z.literal(true);

export const McpCanonicalResourceAuthServerProofSchema = z
  .object({
    schemaVersion: z.literal(MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    canonicalResourceAuthServerContractsVerified: trueLiteral,
    canonicalPublicResourceUriBoundaryVerified: trueLiteral,
    canonicalUriDecisionDeferredBoundaryVerified: trueLiteral,
    canonicalUriHttpsExactStableBoundaryVerified: trueLiteral,
    canonicalUriNoSelectorAuthorityBoundaryVerified: trueLiteral,
    canonicalUriNoQueryFragmentBoundaryVerified: trueLiteral,
    resourceIndicatorBoundaryVerified: trueLiteral,
    authorizationServersReadinessBoundaryVerified: trueLiteral,
    authServerProviderNeutralBoundaryVerified: trueLiteral,
    protectedResourceRoutePathDerivationBoundaryVerified: trueLiteral,
    wwwAuthenticateMetadataUrlBoundaryVerified: trueLiteral,
    noLocalTunnelAuthorityBoundaryVerified: trueLiteral,
    noRouteRuntimeBoundaryVerified: trueLiteral,
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
    fp0120BoundaryVerified: trueLiteral,
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
    fp0119ProtectedResourceRouteSequencingBoundaryStillVerified: trueLiteral,
    fp0118ProtectedResourceMetadataBoundaryStillVerified: trueLiteral,
    fp0117OauthImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0116RemoteHostResourceBoundaryStillVerified: trueLiteral,
    fp0113OauthSecurityBoundaryStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
  })
  .merge(McpCanonicalResourceAuthServerInventoryProofSchema)
  .strict();

export type McpCanonicalResourceAuthServerProof = z.infer<
  typeof McpCanonicalResourceAuthServerProofSchema
>;
