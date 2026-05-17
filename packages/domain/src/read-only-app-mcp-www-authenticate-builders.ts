import {
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
  MCP_WWW_AUTHENTICATE_CONTRACT_ONLY_CHALLENGE_CASES,
  MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES,
  MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
  MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES,
  McpWwwAuthenticateAuthChallengeProofContractSchema,
  McpWwwAuthenticateBearerChallengeShapeBoundarySchema,
  McpWwwAuthenticateChallengeDeferredBoundarySchema,
  McpWwwAuthenticateInvalidTokenChallengeBoundarySchema,
  McpWwwAuthenticateLocalVsPublicResourceMetadataBoundarySchema,
  McpWwwAuthenticateMcpBehaviorUnchangedBoundarySchema,
  McpWwwAuthenticateMissingTokenChallengeBoundarySchema,
  McpWwwAuthenticateNoRuntimeBoundarySchema,
  McpWwwAuthenticateNoTokenLeakageBoundarySchema,
  McpWwwAuthenticateResourceMetadataReferenceBoundarySchema,
  McpWwwAuthenticateScopeChallengeBoundarySchema,
  McpWwwAuthenticateTokenFailureModeBoundarySchema,
} from "./read-only-app-mcp-www-authenticate-contracts";
import {
  validateWwwAuthenticateAuthChallengeContractInput,
  validateWwwAuthenticateScopeChallenge,
  type McpWwwAuthenticateAuthChallengeContractInput,
} from "./read-only-app-mcp-www-authenticate-validation";

export {
  deriveWwwAuthenticateResourceMetadataReferenceContract,
  scanWwwAuthenticateNoTokenLeakage,
  textHasWwwAuthenticateNoTokenLeakage,
  validateWwwAuthenticatePublicResourceMetadataReferenceCandidate,
  validateWwwAuthenticateScopeChallenge,
} from "./read-only-app-mcp-www-authenticate-validation";
export type {
  McpWwwAuthenticateAuthChallengeContractInput,
  McpWwwAuthenticateNoTokenLeakageMatch,
  McpWwwAuthenticateNoTokenLeakageScan,
  McpWwwAuthenticatePublicResourceMetadataReferenceCandidateValidation,
  McpWwwAuthenticateResourceMetadataReferenceContract,
  McpWwwAuthenticateScopeChallengeValidation,
} from "./read-only-app-mcp-www-authenticate-validation";

export function validateWwwAuthenticateAuthChallengeContract(
  input: McpWwwAuthenticateAuthChallengeContractInput = {},
) {
  const { challengeShapeAccepted, noLeakageScan, referenceContract } =
    validateWwwAuthenticateAuthChallengeContractInput(input);
  const scopes = input.scopes ?? MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES;
  const scopeChallenge = validateWwwAuthenticateScopeChallenge(scopes);
  const noLeakage = noLeakageScan.accepted;

  return {
    accepted:
      challengeShapeAccepted &&
      referenceContract.runtimeHeaderEmissionAllowed === false &&
      input.runtimeHeaderEmissionRequested !== true &&
      scopeChallenge.accepted &&
      noLeakage,
    challengeScheme:
      input.challengeScheme ?? MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
    contractOnlyChallengeCases: [...MCP_WWW_AUTHENTICATE_CONTRACT_ONLY_CHALLENGE_CASES],
    noLeakage,
    noLeakageScan,
    referenceContract,
    resourceMetadataParameter:
      input.resourceMetadataParameter ??
      MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
    scopeChallenge,
    tokenFailureModes: [...MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES],
  };
}

export function buildWwwAuthenticateAuthChallengeContract(
  input: McpWwwAuthenticateAuthChallengeContractInput = {},
) {
  const validation = validateWwwAuthenticateAuthChallengeContract(input);
  if (!validation.accepted) {
    throw new Error("WWW-Authenticate auth-challenge contract is outside FP-0127 scope");
  }

  return {
    ...validation,
    contracts: buildMcpWwwAuthenticateAuthChallengeContracts(),
    headerEmitted: false,
    runtimeBehaviorImplemented: false,
  };
}

export function buildMcpWwwAuthenticateAuthChallengeContracts() {
  const base = {
    implementationAdded: false,
    localProofOnly: true,
    readOnly: true,
    schemaVersion: "v2au.read-only-app-mcp-www-authenticate-auth-challenge.v1",
  };

  return {
    bearerChallengeShapeBoundary:
      McpWwwAuthenticateBearerChallengeShapeBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateBearerChallengeShapeBoundary",
        headerStringBuilt: false,
        requiredScheme: MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
        resourceMetadataParameterRequired: true,
      }),
    challengeDeferredBoundary:
      McpWwwAuthenticateChallengeDeferredBoundarySchema.parse({
        ...base,
        challengeBehaviorFutureOnly: true,
        challengeEmissionAuthorizedNow: false,
        challengeHeaderEmittedByAnyRoute: false,
        contractKind: "McpWwwAuthenticateChallengeDeferredBoundary",
        routeImplementationPlanRequired: true,
      }),
    invalidTokenChallengeBoundary:
      McpWwwAuthenticateInvalidTokenChallengeBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateInvalidTokenChallengeBoundary",
        invalidTokenChallengeContractOnly: true,
        invalidTokenRuntimeChallengeImplemented: false,
        tokenValidationRuntimeRequiredBeforeImplementation: true,
      }),
    localVsPublicResourceMetadataBoundary:
      McpWwwAuthenticateLocalVsPublicResourceMetadataBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateLocalVsPublicResourceMetadataBoundary",
        localProofMayReferenceLocalMetadataRoutePath: true,
        localReferenceIsPublicCanonicalUrl: false,
        publicRuntimeReferenceAllowedNow: false,
        publicRuntimeRequiresFutureCanonicalPublicUrlProof: true,
      }),
    mcpBehaviorUnchangedBoundary:
      McpWwwAuthenticateMcpBehaviorUnchangedBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateMcpBehaviorUnchangedBoundary",
        getMcp405Preserved: true,
        initializeChallengeAuthorized: false,
        localDispatchPreserved: true,
        notification202Preserved: true,
        originBoundaryPreserved: true,
        pingChallengeAuthorized: false,
        toolsCallChallengeAuthorized: false,
        toolsListChallengeAuthorized: false,
      }),
    missingTokenChallengeBoundary:
      McpWwwAuthenticateMissingTokenChallengeBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateMissingTokenChallengeBoundary",
        missingTokenChallengeContractOnly: true,
        missingTokenChallengeRequiresResourceMetadata: true,
        missingTokenRuntimeChallengeImplemented: false,
      }),
    noRuntimeBoundary: McpWwwAuthenticateNoRuntimeBoundarySchema.parse({
      ...base,
      contractKind: "McpWwwAuthenticateNoRuntimeBoundary",
      noAppsSdkResourceRuntime: true,
      noAuthMiddlewareRuntime: true,
      noDbRuntime: true,
      noOauthRuntime: true,
      noProtectedResourceMetadataRouteRuntimeChange: true,
      noRemoteMcpRuntime: true,
      noTokenSessionRuntime: true,
      noTokenValidationRuntime: true,
      noWwwAuthenticateRuntime: true,
    }),
    noTokenLeakageBoundary:
      McpWwwAuthenticateNoTokenLeakageBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateNoTokenLeakageBoundary",
        examplesMayContainAppSubmissionCopy: false,
        examplesMayContainRawFinanceData: false,
        examplesMayContainTokenValues: false,
        forbiddenLeakageSurfaces: [...MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES],
      }),
    proofContract: McpWwwAuthenticateAuthChallengeProofContractSchema.parse({
      ...base,
      contractKind: "McpWwwAuthenticateAuthChallengeProofContract",
      contractOnly: true,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noDbQueriesAdded: true,
      noDeploymentConfig: true,
      noFinanceWrite: true,
      noModelCalls: true,
      noOauthImplementation: true,
      noOpenAiApiCalls: true,
      noOpenAiClientOrKeyUsage: true,
      noPackageScriptsAdded: true,
      noProtectedResourceMetadataRouteBehaviorChange: true,
      noProviderCalls: true,
      noRemoteMcpDeployment: true,
      noRouteBehaviorChange: true,
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenSessionImplementation: true,
      noTokenValidationImplementation: true,
      noHttpHeaderEmission: true,
    }),
    resourceMetadataReferenceBoundary:
      McpWwwAuthenticateResourceMetadataReferenceBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateResourceMetadataReferenceBoundary",
        localReference: MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
        metadataUrlDecisionRequired: true,
        publicReferenceImplemented: false,
        resourceMetadataReferenceExact: true,
      }),
    scopeChallengeBoundary:
      McpWwwAuthenticateScopeChallengeBoundarySchema.parse({
        ...base,
        allowedScopeChallenges: [...MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES],
        contractKind: "McpWwwAuthenticateScopeChallengeBoundary",
        forbiddenScopeTokens: [...MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS],
        leastPrivilegeRequired: true,
        readOnlyScopesOnly: true,
        scopeChallengeCannotCreateOrWidenScopes: true,
        scopeChallengeContractOnly: true,
      }),
    tokenFailureModeBoundary:
      McpWwwAuthenticateTokenFailureModeBoundarySchema.parse({
        ...base,
        contractKind: "McpWwwAuthenticateTokenFailureModeBoundary",
        failureModes: [...MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES],
        malformedExpiredAudienceScopeOrgRevokedReplayedFutureOnly: true,
        tokenFailureModesFutureTokenValidationLane: true,
      }),
  };
}
