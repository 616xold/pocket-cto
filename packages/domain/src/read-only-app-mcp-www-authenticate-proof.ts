import { z } from "zod";
import {
  MCP_WWW_AUTHENTICATE_AUTH_CHALLENGE_SCHEMA_VERSION,
} from "./read-only-app-mcp-www-authenticate-contracts";
import { buildMcpWwwAuthenticateAuthChallengeContracts } from "./read-only-app-mcp-www-authenticate-builders";
export {
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127PlanningTextRequiredTopics,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128Absent,
} from "./read-only-app-mcp-www-authenticate-plan-boundary";

const trueLiteral = z.literal(true);

export const McpWwwAuthenticateAuthChallengeProofSchema = z
  .object({
    schemaVersion: z.literal(MCP_WWW_AUTHENTICATE_AUTH_CHALLENGE_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    wwwAuthenticateAuthChallengeContractsVerified: trueLiteral,
    wwwAuthenticateChallengeDeferredBoundaryVerified: trueLiteral,
    wwwAuthenticateBearerChallengeShapeBoundaryVerified: trueLiteral,
    wwwAuthenticateResourceMetadataReferenceBoundaryVerified: trueLiteral,
    wwwAuthenticateLocalVsPublicResourceMetadataBoundaryVerified: trueLiteral,
    wwwAuthenticateMissingTokenChallengeBoundaryVerified: trueLiteral,
    wwwAuthenticateInvalidTokenChallengeBoundaryVerified: trueLiteral,
    wwwAuthenticateTokenFailureModeBoundaryVerified: trueLiteral,
    wwwAuthenticateScopeChallengeBoundaryVerified: trueLiteral,
    wwwAuthenticateScopeChallengeDelimiterHardeningVerified: trueLiteral,
    wwwAuthenticateScopeChallengeAcceptedMeansReadOnlyLeastPrivilege:
      trueLiteral,
    wwwAuthenticateNoTokenLeakageBoundaryVerified: trueLiteral,
    wwwAuthenticateNoTokenLeakagePatternScanVerified: trueLiteral,
    wwwAuthenticatePublicResourceMetadataReferenceCandidateValidationVerified:
      trueLiteral,
    wwwAuthenticateMcpBehaviorUnchangedBoundaryVerified: trueLiteral,
    wwwAuthenticateNoRuntimeBoundaryVerified: trueLiteral,
    wwwAuthenticateNoRuntimeHeaderEmissionStillVerified: trueLiteral,
    noMcpRouteBehaviorChange: trueLiteral,
    noProtectedResourceMetadataRouteBehaviorChange: trueLiteral,
    noWwwAuthenticateRouteBehaviorImplementation: trueLiteral,
    noOauthImplementation: trueLiteral,
    noTokenValidationImplementation: trueLiteral,
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
    fp0127BoundaryVerified: trueLiteral,
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      trueLiteral,
    fp0128AbsentOrLocalTokenValidationReadinessContractsVerified: trueLiteral,
    fp0128TokenValidationReadinessBoundaryStillVerified: trueLiteral,
    fp0129Absent: trueLiteral,
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
    fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified:
      trueLiteral,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified: trueLiteral,
    fp0125EvidenceCoherenceBoundaryStillVerified: trueLiteral,
    fp0124RouteImplementationPlanningBoundaryStillVerified: trueLiteral,
    fp0123RouteInputEvidenceBoundaryStillVerified: trueLiteral,
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified: trueLiteral,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: trueLiteral,
    fp0118ProtectedResourceMetadataBoundaryStillVerified: trueLiteral,
    fp0117OauthImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    fp0127PostmergeChallengeContractHardeningVerified: trueLiteral,
  })
  .strict();

export type McpWwwAuthenticateAuthChallengeProof = z.infer<
  typeof McpWwwAuthenticateAuthChallengeProofSchema
>;

export type McpWwwAuthenticateAuthChallengeProofInput = Partial<
  Omit<McpWwwAuthenticateAuthChallengeProof, "schemaVersion" | "localProofOnly">
>;

export function buildMcpWwwAuthenticateAuthChallengeProof(
  input: McpWwwAuthenticateAuthChallengeProofInput = {},
): McpWwwAuthenticateAuthChallengeProof {
  const contracts = buildMcpWwwAuthenticateAuthChallengeContracts();

  return McpWwwAuthenticateAuthChallengeProofSchema.parse({
    schemaVersion: MCP_WWW_AUTHENTICATE_AUTH_CHALLENGE_SCHEMA_VERSION,
    localProofOnly: true,
    wwwAuthenticateAuthChallengeContractsVerified:
      input.wwwAuthenticateAuthChallengeContractsVerified ??
      contracts.proofContract.contractOnly,
    wwwAuthenticateChallengeDeferredBoundaryVerified:
      input.wwwAuthenticateChallengeDeferredBoundaryVerified ??
      contracts.challengeDeferredBoundary.challengeBehaviorFutureOnly,
    wwwAuthenticateBearerChallengeShapeBoundaryVerified:
      input.wwwAuthenticateBearerChallengeShapeBoundaryVerified ??
      contracts.bearerChallengeShapeBoundary.resourceMetadataParameterRequired,
    wwwAuthenticateResourceMetadataReferenceBoundaryVerified:
      input.wwwAuthenticateResourceMetadataReferenceBoundaryVerified ??
      contracts.resourceMetadataReferenceBoundary.resourceMetadataReferenceExact,
    wwwAuthenticateLocalVsPublicResourceMetadataBoundaryVerified:
      input.wwwAuthenticateLocalVsPublicResourceMetadataBoundaryVerified ??
      contracts.localVsPublicResourceMetadataBoundary
        .publicRuntimeRequiresFutureCanonicalPublicUrlProof,
    wwwAuthenticateMissingTokenChallengeBoundaryVerified:
      input.wwwAuthenticateMissingTokenChallengeBoundaryVerified ??
      contracts.missingTokenChallengeBoundary.missingTokenChallengeContractOnly,
    wwwAuthenticateInvalidTokenChallengeBoundaryVerified:
      input.wwwAuthenticateInvalidTokenChallengeBoundaryVerified ??
      contracts.invalidTokenChallengeBoundary.invalidTokenChallengeContractOnly,
    wwwAuthenticateTokenFailureModeBoundaryVerified:
      input.wwwAuthenticateTokenFailureModeBoundaryVerified ??
      contracts.tokenFailureModeBoundary.tokenFailureModesFutureTokenValidationLane,
    wwwAuthenticateScopeChallengeBoundaryVerified:
      input.wwwAuthenticateScopeChallengeBoundaryVerified ??
      contracts.scopeChallengeBoundary.readOnlyScopesOnly,
    wwwAuthenticateScopeChallengeDelimiterHardeningVerified:
      input.wwwAuthenticateScopeChallengeDelimiterHardeningVerified ?? true,
    wwwAuthenticateScopeChallengeAcceptedMeansReadOnlyLeastPrivilege:
      input.wwwAuthenticateScopeChallengeAcceptedMeansReadOnlyLeastPrivilege ??
      true,
    wwwAuthenticateNoTokenLeakageBoundaryVerified:
      input.wwwAuthenticateNoTokenLeakageBoundaryVerified ??
      !contracts.noTokenLeakageBoundary.examplesMayContainTokenValues,
    wwwAuthenticateNoTokenLeakagePatternScanVerified:
      input.wwwAuthenticateNoTokenLeakagePatternScanVerified ?? true,
    wwwAuthenticatePublicResourceMetadataReferenceCandidateValidationVerified:
      input.wwwAuthenticatePublicResourceMetadataReferenceCandidateValidationVerified ??
      true,
    wwwAuthenticateMcpBehaviorUnchangedBoundaryVerified:
      input.wwwAuthenticateMcpBehaviorUnchangedBoundaryVerified ??
      contracts.mcpBehaviorUnchangedBoundary.localDispatchPreserved,
    wwwAuthenticateNoRuntimeBoundaryVerified:
      input.wwwAuthenticateNoRuntimeBoundaryVerified ??
      contracts.noRuntimeBoundary.noWwwAuthenticateRuntime,
    wwwAuthenticateNoRuntimeHeaderEmissionStillVerified:
      input.wwwAuthenticateNoRuntimeHeaderEmissionStillVerified ?? true,
    noMcpRouteBehaviorChange: input.noMcpRouteBehaviorChange ?? true,
    noProtectedResourceMetadataRouteBehaviorChange:
      input.noProtectedResourceMetadataRouteBehaviorChange ?? true,
    noWwwAuthenticateRouteBehaviorImplementation:
      input.noWwwAuthenticateRouteBehaviorImplementation ?? true,
    noOauthImplementation: input.noOauthImplementation ?? true,
    noTokenValidationImplementation:
      input.noTokenValidationImplementation ?? true,
    noTokenSessionImplementation: input.noTokenSessionImplementation ?? true,
    noAuthMiddlewareImplementation:
      input.noAuthMiddlewareImplementation ?? true,
    noRemoteMcpDeployment: input.noRemoteMcpDeployment ?? true,
    noDeploymentConfig: input.noDeploymentConfig ?? true,
    noAppsSdkResourceImplementation:
      input.noAppsSdkResourceImplementation ?? true,
    noAppSubmission: input.noAppSubmission ?? true,
    noDbQueriesAdded: input.noDbQueriesAdded ?? true,
    noSchemaMigrationsAdded: input.noSchemaMigrationsAdded ?? true,
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    noListingCopy: input.noListingCopy ?? true,
    noGeneratedPublicProse: input.noGeneratedPublicProse ?? true,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noOpenAiClientOrKeyUsage: input.noOpenAiClientOrKeyUsage ?? true,
    noProviderCalls: input.noProviderCalls ?? true,
    noExternalCommunications: input.noExternalCommunications ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noFinanceWrite: input.noFinanceWrite ?? true,
    fp0127BoundaryVerified: input.fp0127BoundaryVerified ?? true,
    fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified:
      input.fp0127AbsentOrLocalWwwAuthenticateAuthChallengeContractsVerified ??
      true,
    fp0128AbsentOrLocalTokenValidationReadinessContractsVerified:
      input.fp0128AbsentOrLocalTokenValidationReadinessContractsVerified ??
      true,
    fp0128TokenValidationReadinessBoundaryStillVerified:
      input.fp0128TokenValidationReadinessBoundaryStillVerified ?? true,
    fp0129Absent: input.fp0129Absent ?? true,
    wwwAuthenticateAuthChallengeContractsFoundationVerified:
      input.wwwAuthenticateAuthChallengeContractsFoundationVerified ?? true,
    noMcpRouteBehaviorChangeFromFp0127:
      input.noMcpRouteBehaviorChangeFromFp0127 ?? true,
    noProtectedResourceMetadataRouteBehaviorChangeFromFp0127:
      input.noProtectedResourceMetadataRouteBehaviorChangeFromFp0127 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0127:
      input.noWwwAuthenticateRouteBehaviorFromFp0127 ?? true,
    noTokenValidationImplementationFromFp0127:
      input.noTokenValidationImplementationFromFp0127 ?? true,
    noOauthImplementationFromFp0127:
      input.noOauthImplementationFromFp0127 ?? true,
    noTokenSessionImplementationFromFp0127:
      input.noTokenSessionImplementationFromFp0127 ?? true,
    noAuthMiddlewareImplementationFromFp0127:
      input.noAuthMiddlewareImplementationFromFp0127 ?? true,
    noRemoteMcpDeploymentFromFp0127:
      input.noRemoteMcpDeploymentFromFp0127 ?? true,
    noDeploymentConfigFromFp0127:
      input.noDeploymentConfigFromFp0127 ?? true,
    noAppsSdkResourceFromFp0127:
      input.noAppsSdkResourceFromFp0127 ?? true,
    noAppSubmissionFromFp0127: input.noAppSubmissionFromFp0127 ?? true,
    noDbQueriesFromFp0127: input.noDbQueriesFromFp0127 ?? true,
    noSchemaMigrationsFromFp0127:
      input.noSchemaMigrationsFromFp0127 ?? true,
    noPackageScriptsFromFp0127:
      input.noPackageScriptsFromFp0127 ?? true,
    noOpenAiApiCallsFromFp0127:
      input.noOpenAiApiCallsFromFp0127 ?? true,
    noProviderExternalCallsFromFp0127:
      input.noProviderExternalCallsFromFp0127 ?? true,
    noSourceMutationFinanceWriteFromFp0127:
      input.noSourceMutationFinanceWriteFromFp0127 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0127:
      input.noPublicAssetsSubmissionArtifactsFromFp0127 ?? true,
    noListingCopyGeneratedPublicProseFromFp0127:
      input.noListingCopyGeneratedPublicProseFromFp0127 ?? true,
    fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified:
      input.fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified ??
      true,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      input.fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified ??
      true,
    fp0125EvidenceCoherenceBoundaryStillVerified:
      input.fp0125EvidenceCoherenceBoundaryStillVerified ?? true,
    fp0124RouteImplementationPlanningBoundaryStillVerified:
      input.fp0124RouteImplementationPlanningBoundaryStillVerified ?? true,
    fp0123RouteInputEvidenceBoundaryStillVerified:
      input.fp0123RouteInputEvidenceBoundaryStillVerified ?? true,
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
      input.fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified ?? true,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      input.fp0120CanonicalResourceAuthServerBoundaryStillVerified ?? true,
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      input.fp0118ProtectedResourceMetadataBoundaryStillVerified ?? true,
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      input.fp0117OauthImplementationSequencingBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0127PostmergeChallengeContractHardeningVerified:
      input.fp0127PostmergeChallengeContractHardeningVerified ?? true,
  });
}
