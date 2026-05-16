import { z } from "zod";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
} from "./read-only-app-mcp-remote-host-resource-contracts";
import { buildMcpCanonicalResourceAuthServerContracts } from "./read-only-app-mcp-canonical-resource-builders";
import {
  buildMcpOauthImplementationSequencingInventoryProof,
  McpOauthImplementationSequencingInventoryProofSchema,
  type McpOauthImplementationSequencingInventoryProofInput,
} from "./read-only-app-mcp-oauth-implementation-sequencing-inventory";

const trueLiteral = z.literal(true);

export const McpOauthImplementationSequencingProofSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
    ),
    localProofOnly: trueLiteral,
    docsAndPlanProofGateOnly: trueLiteral,
    oauthImplementationSequencingPlanBoundaryVerified: trueLiteral,
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
      trueLiteral,
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
      trueLiteral,
    fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
      trueLiteral,
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
      trueLiteral,
    fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
      trueLiteral,
    fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
      trueLiteral,
    fp0123Absent: trueLiteral,
    protectedResourceMetadataBuilderContractsFoundationVerified: trueLiteral,
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      trueLiteral,
    canonicalResourceAuthServerContractsFoundationVerified: trueLiteral,
    protectedResourceMetadataContractsFoundationVerified: trueLiteral,
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
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: trueLiteral,
    noRouteBehaviorChangeFromFp0117: trueLiteral,
    noNewRoutePathFromFp0117: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0117: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0117: trueLiteral,
    noOauthImplementationFromFp0117: trueLiteral,
    noTokenSessionImplementationFromFp0117: trueLiteral,
    noAuthMiddlewareImplementationFromFp0117: trueLiteral,
    noRemoteMcpDeploymentFromFp0117: trueLiteral,
    noDeploymentConfigFromFp0117: trueLiteral,
    noAppsSdkResourceFromFp0117: trueLiteral,
    noAppSubmissionFromFp0117: trueLiteral,
    noDbQueriesFromFp0117: trueLiteral,
    noSchemaMigrationsFromFp0117: trueLiteral,
    noPackageScriptsFromFp0117: trueLiteral,
    noOpenAiApiCallsFromFp0117: trueLiteral,
    noProviderExternalCallsFromFp0117: trueLiteral,
    noSourceMutationFinanceWriteFromFp0117: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0117: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0117: trueLiteral,
    noRouteBehaviorChangeFromFp0118: trueLiteral,
    noNewRoutePathFromFp0118: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0118: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0118: trueLiteral,
    noOauthImplementationFromFp0118: trueLiteral,
    noTokenSessionImplementationFromFp0118: trueLiteral,
    noAuthMiddlewareImplementationFromFp0118: trueLiteral,
    noRemoteMcpDeploymentFromFp0118: trueLiteral,
    noDeploymentConfigFromFp0118: trueLiteral,
    noAppsSdkResourceFromFp0118: trueLiteral,
    noAppSubmissionFromFp0118: trueLiteral,
    noDbQueriesFromFp0118: trueLiteral,
    noSchemaMigrationsFromFp0118: trueLiteral,
    noPackageScriptsFromFp0118: trueLiteral,
    noOpenAiApiCallsFromFp0118: trueLiteral,
    noProviderExternalCallsFromFp0118: trueLiteral,
    noSourceMutationFinanceWriteFromFp0118: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0118: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0118: trueLiteral,
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
    planningTextIncludesProtectedResourceMetadata: trueLiteral,
    planningTextIncludesWwwAuthenticateResourceMetadata: trueLiteral,
    planningTextIncludesAuthorizationServerDiscovery: trueLiteral,
    planningTextIncludesScopeChallenge: trueLiteral,
    planningTextIncludesAudienceResourceValidation: trueLiteral,
    planningTextIncludesTokenFailureModes: trueLiteral,
    planningTextIncludesNoTokenPassthrough: trueLiteral,
    planningTextIncludesAuthenticatedCompanyBinding: trueLiteral,
    fp0116RemoteHostResourceBoundaryStillVerified: trueLiteral,
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0114RemoteHostReadinessBoundaryStillVerified: trueLiteral,
    fp0113OauthSecurityBoundaryStillVerified: trueLiteral,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: trueLiteral,
    fp0111DefaultLocalDispatchWiringStillVerified: trueLiteral,
    fp0109AdapterBoundaryStillVerified: trueLiteral,
    fp0108DispatchContractsStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    publicAppImplementationFutureOnly: trueLiteral,
    publicAppSubmissionFutureOnly: trueLiteral,
  })
  .merge(McpOauthImplementationSequencingInventoryProofSchema)
  .strict();

export type McpOauthImplementationSequencingProof = z.infer<
  typeof McpOauthImplementationSequencingProofSchema
>;

export function buildMcpOauthImplementationSequencingProof(
  input: Partial<{
    oauthImplementationSequencingPlanBoundaryVerified: boolean;
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified: boolean;
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified: boolean;
    fp0119AbsentOrDocsOnlyProtectedResourceMetadataRouteSequencingPlanVerified:
      boolean;
    fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified: boolean;
    fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified:
      boolean;
    fp0122AbsentOrLocalProtectedResourceMetadataBuilderContractsVerified:
      boolean;
    fp0123Absent: boolean;
    protectedResourceMetadataBuilderContractsFoundationVerified: boolean;
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      boolean;
    canonicalResourceAuthServerContractsFoundationVerified: boolean;
    protectedResourceMetadataContractsFoundationVerified: boolean;
    noRouteBehaviorChangeFromFp0121: boolean;
    noNewRoutePathFromFp0121: boolean;
    noProtectedResourceMetadataRouteFromFp0121: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0121: boolean;
    noOauthImplementationFromFp0121: boolean;
    noTokenSessionImplementationFromFp0121: boolean;
    noAuthMiddlewareImplementationFromFp0121: boolean;
    noRemoteMcpDeploymentFromFp0121: boolean;
    noDeploymentConfigFromFp0121: boolean;
    noAppsSdkResourceFromFp0121: boolean;
    noPublicAppImplementationFromFp0121: boolean;
    noAppSubmissionFromFp0121: boolean;
    noDbQueriesFromFp0121: boolean;
    noSchemaMigrationsFromFp0121: boolean;
    noPackageScriptsFromFp0121: boolean;
    noFixturesSampleDataSourcePacksFromFp0121: boolean;
    noOpenAiApiCallsFromFp0121: boolean;
    noProviderExternalCallsFromFp0121: boolean;
    noSourceMutationFinanceWriteFromFp0121: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0121: boolean;
    noListingCopyGeneratedPublicProseFromFp0121: boolean;
    noRouteBehaviorChangeFromFp0122: boolean;
    noNewRoutePathFromFp0122: boolean;
    noProtectedResourceMetadataRouteFromFp0122: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0122: boolean;
    noOauthImplementationFromFp0122: boolean;
    noTokenSessionImplementationFromFp0122: boolean;
    noAuthMiddlewareImplementationFromFp0122: boolean;
    noRemoteMcpDeploymentFromFp0122: boolean;
    noDeploymentConfigFromFp0122: boolean;
    noAppsSdkResourceFromFp0122: boolean;
    noPublicAppImplementationFromFp0122: boolean;
    noAppSubmissionFromFp0122: boolean;
    noDbQueriesFromFp0122: boolean;
    noSchemaMigrationsFromFp0122: boolean;
    noPackageScriptsFromFp0122: boolean;
    noOpenAiApiCallsFromFp0122: boolean;
    noProviderExternalCallsFromFp0122: boolean;
    noSourceMutationFinanceWriteFromFp0122: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0122: boolean;
    noListingCopyGeneratedPublicProseFromFp0122: boolean;
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: boolean;
    noRouteBehaviorChangeFromFp0117: boolean;
    noNewRoutePathFromFp0117: boolean;
    noProtectedResourceMetadataRouteFromFp0117: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0117: boolean;
    noOauthImplementationFromFp0117: boolean;
    noTokenSessionImplementationFromFp0117: boolean;
    noAuthMiddlewareImplementationFromFp0117: boolean;
    noRemoteMcpDeploymentFromFp0117: boolean;
    noDeploymentConfigFromFp0117: boolean;
    noAppsSdkResourceFromFp0117: boolean;
    noAppSubmissionFromFp0117: boolean;
    noDbQueriesFromFp0117: boolean;
    noSchemaMigrationsFromFp0117: boolean;
    noPackageScriptsFromFp0117: boolean;
    noOpenAiApiCallsFromFp0117: boolean;
    noProviderExternalCallsFromFp0117: boolean;
    noSourceMutationFinanceWriteFromFp0117: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0117: boolean;
    noListingCopyGeneratedPublicProseFromFp0117: boolean;
    noRouteBehaviorChangeFromFp0118: boolean;
    noNewRoutePathFromFp0118: boolean;
    noProtectedResourceMetadataRouteFromFp0118: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0118: boolean;
    noOauthImplementationFromFp0118: boolean;
    noTokenSessionImplementationFromFp0118: boolean;
    noAuthMiddlewareImplementationFromFp0118: boolean;
    noRemoteMcpDeploymentFromFp0118: boolean;
    noDeploymentConfigFromFp0118: boolean;
    noAppsSdkResourceFromFp0118: boolean;
    noAppSubmissionFromFp0118: boolean;
    noDbQueriesFromFp0118: boolean;
    noSchemaMigrationsFromFp0118: boolean;
    noPackageScriptsFromFp0118: boolean;
    noOpenAiApiCallsFromFp0118: boolean;
    noProviderExternalCallsFromFp0118: boolean;
    noSourceMutationFinanceWriteFromFp0118: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0118: boolean;
    noListingCopyGeneratedPublicProseFromFp0118: boolean;
    noRouteBehaviorChangeFromFp0120: boolean;
    noNewRoutePathFromFp0120: boolean;
    noProtectedResourceMetadataRouteFromFp0120: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0120: boolean;
    noOauthImplementationFromFp0120: boolean;
    noTokenSessionImplementationFromFp0120: boolean;
    noAuthMiddlewareImplementationFromFp0120: boolean;
    noRemoteMcpDeploymentFromFp0120: boolean;
    noDeploymentConfigFromFp0120: boolean;
    noAppsSdkResourceFromFp0120: boolean;
    noAppSubmissionFromFp0120: boolean;
    noDbQueriesFromFp0120: boolean;
    noSchemaMigrationsFromFp0120: boolean;
    noPackageScriptsFromFp0120: boolean;
    noOpenAiApiCallsFromFp0120: boolean;
    noProviderExternalCallsFromFp0120: boolean;
    noSourceMutationFinanceWriteFromFp0120: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0120: boolean;
    planningTextIncludesProtectedResourceMetadata: boolean;
    planningTextIncludesWwwAuthenticateResourceMetadata: boolean;
    planningTextIncludesAuthorizationServerDiscovery: boolean;
    planningTextIncludesScopeChallenge: boolean;
    planningTextIncludesAudienceResourceValidation: boolean;
    planningTextIncludesTokenFailureModes: boolean;
    planningTextIncludesNoTokenPassthrough: boolean;
    planningTextIncludesAuthenticatedCompanyBinding: boolean;
    fp0116RemoteHostResourceBoundaryStillVerified: boolean;
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: boolean;
    fp0114RemoteHostReadinessBoundaryStillVerified: boolean;
    fp0113OauthSecurityBoundaryStillVerified: boolean;
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: boolean;
    fp0111DefaultLocalDispatchWiringStillVerified: boolean;
    fp0109AdapterBoundaryStillVerified: boolean;
    fp0108DispatchContractsStillVerified: boolean;
    fp0107RouteAdapterBoundaryStillVerified: boolean;
    fp0106ProtocolEnvelopeBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
    publicAppImplementationFutureOnly: boolean;
    publicAppSubmissionFutureOnly: boolean;
  }> &
    McpOauthImplementationSequencingInventoryProofInput = {},
): McpOauthImplementationSequencingProof {
  return McpOauthImplementationSequencingProofSchema.parse({
    docsAndPlanProofGateOnly: true,
    ...buildMcpOauthImplementationSequencingInventoryProof(input),
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0108DispatchContractsStillVerified:
      input.fp0108DispatchContractsStillVerified ?? true,
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
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
      input.fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified ??
      true,
    fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified:
      input.fp0118AbsentOrLocalProtectedResourceMetadataContractsVerified ??
      true,
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
    fp0123Absent: input.fp0123Absent ?? true,
    protectedResourceMetadataBuilderContractsFoundationVerified:
      input.protectedResourceMetadataBuilderContractsFoundationVerified ?? true,
    protectedResourceMetadataRouteImplementationPlanningBoundaryVerified:
      input.protectedResourceMetadataRouteImplementationPlanningBoundaryVerified ??
      true,
    localProofOnly: true,
    noAppSubmissionFromFp0121: input.noAppSubmissionFromFp0121 ?? true,
    noAppsSdkResourceFromFp0121:
      input.noAppsSdkResourceFromFp0121 ?? true,
    noAuthMiddlewareImplementationFromFp0121:
      input.noAuthMiddlewareImplementationFromFp0121 ?? true,
    noDbQueriesFromFp0121: input.noDbQueriesFromFp0121 ?? true,
    noDeploymentConfigFromFp0121:
      input.noDeploymentConfigFromFp0121 ?? true,
    noFixturesSampleDataSourcePacksFromFp0121:
      input.noFixturesSampleDataSourcePacksFromFp0121 ?? true,
    noListingCopyGeneratedPublicProseFromFp0121:
      input.noListingCopyGeneratedPublicProseFromFp0121 ?? true,
    noRouteBehaviorChangeFromFp0122:
      input.noRouteBehaviorChangeFromFp0122 ?? true,
    noNewRoutePathFromFp0122: input.noNewRoutePathFromFp0122 ?? true,
    noProtectedResourceMetadataRouteFromFp0122:
      input.noProtectedResourceMetadataRouteFromFp0122 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0122:
      input.noWwwAuthenticateRouteBehaviorFromFp0122 ?? true,
    noOauthImplementationFromFp0122:
      input.noOauthImplementationFromFp0122 ?? true,
    noTokenSessionImplementationFromFp0122:
      input.noTokenSessionImplementationFromFp0122 ?? true,
    noAuthMiddlewareImplementationFromFp0122:
      input.noAuthMiddlewareImplementationFromFp0122 ?? true,
    noRemoteMcpDeploymentFromFp0122:
      input.noRemoteMcpDeploymentFromFp0122 ?? true,
    noDeploymentConfigFromFp0122:
      input.noDeploymentConfigFromFp0122 ?? true,
    noAppsSdkResourceFromFp0122:
      input.noAppsSdkResourceFromFp0122 ?? true,
    noPublicAppImplementationFromFp0122:
      input.noPublicAppImplementationFromFp0122 ?? true,
    noAppSubmissionFromFp0122: input.noAppSubmissionFromFp0122 ?? true,
    noDbQueriesFromFp0122: input.noDbQueriesFromFp0122 ?? true,
    noSchemaMigrationsFromFp0122:
      input.noSchemaMigrationsFromFp0122 ?? true,
    noPackageScriptsFromFp0122:
      input.noPackageScriptsFromFp0122 ?? true,
    noOpenAiApiCallsFromFp0122:
      input.noOpenAiApiCallsFromFp0122 ?? true,
    noProviderExternalCallsFromFp0122:
      input.noProviderExternalCallsFromFp0122 ?? true,
    noSourceMutationFinanceWriteFromFp0122:
      input.noSourceMutationFinanceWriteFromFp0122 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0122:
      input.noPublicAssetsSubmissionArtifactsFromFp0122 ?? true,
    noListingCopyGeneratedPublicProseFromFp0122:
      input.noListingCopyGeneratedPublicProseFromFp0122 ?? true,
    noNewRoutePathFromFp0121:
      input.noNewRoutePathFromFp0121 ?? true,
    noOauthImplementationFromFp0121:
      input.noOauthImplementationFromFp0121 ?? true,
    noOpenAiApiCallsFromFp0121:
      input.noOpenAiApiCallsFromFp0121 ?? true,
    noPackageScriptsFromFp0121:
      input.noPackageScriptsFromFp0121 ?? true,
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
    noSchemaMigrationsFromFp0121:
      input.noSchemaMigrationsFromFp0121 ?? true,
    noSourceMutationFinanceWriteFromFp0121:
      input.noSourceMutationFinanceWriteFromFp0121 ?? true,
    noTokenSessionImplementationFromFp0121:
      input.noTokenSessionImplementationFromFp0121 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0121:
      input.noWwwAuthenticateRouteBehaviorFromFp0121 ?? true,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      input.fp0120CanonicalResourceAuthServerBoundaryStillVerified ?? true,
    noAppSubmissionFromFp0117: input.noAppSubmissionFromFp0117 ?? true,
    noAppsSdkResourceFromFp0117: input.noAppsSdkResourceFromFp0117 ?? true,
    noAuthMiddlewareImplementationFromFp0117:
      input.noAuthMiddlewareImplementationFromFp0117 ?? true,
    noDbQueriesFromFp0117: input.noDbQueriesFromFp0117 ?? true,
    noDeploymentConfigFromFp0117: input.noDeploymentConfigFromFp0117 ?? true,
    noListingCopyGeneratedPublicProseFromFp0117:
      input.noListingCopyGeneratedPublicProseFromFp0117 ?? true,
    noAppSubmissionFromFp0118: input.noAppSubmissionFromFp0118 ?? true,
    noAppsSdkResourceFromFp0118:
      input.noAppsSdkResourceFromFp0118 ?? true,
    noAuthMiddlewareImplementationFromFp0118:
      input.noAuthMiddlewareImplementationFromFp0118 ?? true,
    noDbQueriesFromFp0118: input.noDbQueriesFromFp0118 ?? true,
    noDeploymentConfigFromFp0118:
      input.noDeploymentConfigFromFp0118 ?? true,
    noListingCopyGeneratedPublicProseFromFp0118:
      input.noListingCopyGeneratedPublicProseFromFp0118 ?? true,
    noAppSubmissionFromFp0120: input.noAppSubmissionFromFp0120 ?? true,
    noAppsSdkResourceFromFp0120:
      input.noAppsSdkResourceFromFp0120 ?? true,
    noAuthMiddlewareImplementationFromFp0120:
      input.noAuthMiddlewareImplementationFromFp0120 ?? true,
    noDbQueriesFromFp0120: input.noDbQueriesFromFp0120 ?? true,
    noDeploymentConfigFromFp0120:
      input.noDeploymentConfigFromFp0120 ?? true,
    noNewRoutePathFromFp0120: input.noNewRoutePathFromFp0120 ?? true,
    noOauthImplementationFromFp0120:
      input.noOauthImplementationFromFp0120 ?? true,
    noOpenAiApiCallsFromFp0120:
      input.noOpenAiApiCallsFromFp0120 ?? true,
    noPackageScriptsFromFp0120:
      input.noPackageScriptsFromFp0120 ?? true,
    noProtectedResourceMetadataRouteFromFp0120:
      input.noProtectedResourceMetadataRouteFromFp0120 ?? true,
    noProviderExternalCallsFromFp0120:
      input.noProviderExternalCallsFromFp0120 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0120:
      input.noPublicAssetsSubmissionArtifactsFromFp0120 ?? true,
    noRemoteMcpDeploymentFromFp0120:
      input.noRemoteMcpDeploymentFromFp0120 ?? true,
    noRouteBehaviorChangeFromFp0120:
      input.noRouteBehaviorChangeFromFp0120 ?? true,
    noSchemaMigrationsFromFp0120:
      input.noSchemaMigrationsFromFp0120 ?? true,
    noSourceMutationFinanceWriteFromFp0120:
      input.noSourceMutationFinanceWriteFromFp0120 ?? true,
    noTokenSessionImplementationFromFp0120:
      input.noTokenSessionImplementationFromFp0120 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0120:
      input.noWwwAuthenticateRouteBehaviorFromFp0120 ?? true,
    noNewRoutePathFromFp0118: input.noNewRoutePathFromFp0118 ?? true,
    noOauthImplementationFromFp0118:
      input.noOauthImplementationFromFp0118 ?? true,
    noOpenAiApiCallsFromFp0118: input.noOpenAiApiCallsFromFp0118 ?? true,
    noPackageScriptsFromFp0118:
      input.noPackageScriptsFromFp0118 ?? true,
    noProtectedResourceMetadataRouteFromFp0118:
      input.noProtectedResourceMetadataRouteFromFp0118 ?? true,
    noProviderExternalCallsFromFp0118:
      input.noProviderExternalCallsFromFp0118 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0118:
      input.noPublicAssetsSubmissionArtifactsFromFp0118 ?? true,
    noRemoteMcpDeploymentFromFp0118:
      input.noRemoteMcpDeploymentFromFp0118 ?? true,
    noRouteBehaviorChangeFromFp0118:
      input.noRouteBehaviorChangeFromFp0118 ?? true,
    noSchemaMigrationsFromFp0118:
      input.noSchemaMigrationsFromFp0118 ?? true,
    noSourceMutationFinanceWriteFromFp0118:
      input.noSourceMutationFinanceWriteFromFp0118 ?? true,
    noTokenSessionImplementationFromFp0118:
      input.noTokenSessionImplementationFromFp0118 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0118:
      input.noWwwAuthenticateRouteBehaviorFromFp0118 ?? true,
    noNewRoutePathFromFp0117: input.noNewRoutePathFromFp0117 ?? true,
    noOauthImplementationFromFp0117:
      input.noOauthImplementationFromFp0117 ?? true,
    noOpenAiApiCallsFromFp0117: input.noOpenAiApiCallsFromFp0117 ?? true,
    noPackageScriptsFromFp0117: input.noPackageScriptsFromFp0117 ?? true,
    noProtectedResourceMetadataRouteFromFp0117:
      input.noProtectedResourceMetadataRouteFromFp0117 ?? true,
    noProviderExternalCallsFromFp0117:
      input.noProviderExternalCallsFromFp0117 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0117:
      input.noPublicAssetsSubmissionArtifactsFromFp0117 ?? true,
    noRemoteMcpDeploymentFromFp0117:
      input.noRemoteMcpDeploymentFromFp0117 ?? true,
    noRouteBehaviorChangeFromFp0117:
      input.noRouteBehaviorChangeFromFp0117 ?? true,
    noSchemaMigrationsFromFp0117: input.noSchemaMigrationsFromFp0117 ?? true,
    noSourceMutationFinanceWriteFromFp0117:
      input.noSourceMutationFinanceWriteFromFp0117 ?? true,
    noTokenSessionImplementationFromFp0117:
      input.noTokenSessionImplementationFromFp0117 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0117:
      input.noWwwAuthenticateRouteBehaviorFromFp0117 ?? true,
    oauthImplementationSequencingPlanBoundaryVerified:
      input.oauthImplementationSequencingPlanBoundaryVerified ?? true,
    planningTextIncludesAuthenticatedCompanyBinding:
      input.planningTextIncludesAuthenticatedCompanyBinding ?? true,
    planningTextIncludesAudienceResourceValidation:
      input.planningTextIncludesAudienceResourceValidation ?? true,
    planningTextIncludesAuthorizationServerDiscovery:
      input.planningTextIncludesAuthorizationServerDiscovery ?? true,
    planningTextIncludesNoTokenPassthrough:
      input.planningTextIncludesNoTokenPassthrough ?? true,
    planningTextIncludesProtectedResourceMetadata:
      input.planningTextIncludesProtectedResourceMetadata ?? true,
    planningTextIncludesScopeChallenge:
      input.planningTextIncludesScopeChallenge ?? true,
    planningTextIncludesTokenFailureModes:
      input.planningTextIncludesTokenFailureModes ?? true,
    planningTextIncludesWwwAuthenticateResourceMetadata:
      input.planningTextIncludesWwwAuthenticateResourceMetadata ?? true,
    protectedResourceMetadataContractsFoundationVerified:
      input.protectedResourceMetadataContractsFoundationVerified ?? true,
    publicAppImplementationFutureOnly:
      input.publicAppImplementationFutureOnly ?? true,
    publicAppSubmissionFutureOnly: input.publicAppSubmissionFutureOnly ?? true,
    schemaVersion: MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
  });
}

export function verifyFp0117OauthImplementationSequencingPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0117Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0117/u.test(path),
  );
  return (
    fp0117Hits.length === 1 &&
    fp0117Hits[0] === FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0117PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0117Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0117/u.test(path),
  );
  if (fp0117Hits.length === 0) return true;
  return (
    fp0117Hits.length === 1 &&
    fp0117Hits[0] === FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0117PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0118Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => /(^|\/)FP-0118/u.test(path));
}

export function verifyFp0117PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding: normalized.includes(
      "authenticated company binding",
    ),
    planningTextIncludesAudienceResourceValidation: normalized.includes(
      "audience/resource validation",
    ),
    planningTextIncludesAuthorizationServerDiscovery: normalized.includes(
      "authorization-server discovery",
    ),
    planningTextIncludesNoTokenPassthrough:
      normalized.includes("no token passthrough") ||
      normalized.includes("token passthrough prohibition"),
    planningTextIncludesProtectedResourceMetadata: normalized.includes(
      "protected-resource metadata",
    ),
    planningTextIncludesScopeChallenge: normalized.includes("scope challenge"),
    planningTextIncludesTokenFailureModes:
      normalized.includes(
        "missing/expired/malformed/wrong-audience/wrong-scope/wrong-org",
      ) || normalized.includes("token failure modes"),
    planningTextIncludesWwwAuthenticateResourceMetadata: normalized.includes(
      "www-authenticate resource_metadata",
    ),
  };
}

function fp0117PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  const topics = verifyFp0117PlanningTextRequiredTopics(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility",
      "oauth/token/session/auth implementation sequencing",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not add protected-resource metadata routes",
      "does not implement www-authenticate behavior",
      "does not change /mcp route behavior",
      "does not add route paths",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "public app submission remains future-only",
      "fp-0118 remains absent",
      "token storage",
      "redaction",
      "revocation",
      "rotation",
      "replay",
      "provider-neutral",
      "canonical public resource uri",
      "companykey",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(topics).every(Boolean)
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
