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
  McpWwwAuthenticateChallengeReferenceModeSchema,
  McpWwwAuthenticateInvalidTokenChallengeBoundarySchema,
  McpWwwAuthenticateLocalVsPublicResourceMetadataBoundarySchema,
  McpWwwAuthenticateMcpBehaviorUnchangedBoundarySchema,
  McpWwwAuthenticateMissingTokenChallengeBoundarySchema,
  McpWwwAuthenticateNoRuntimeBoundarySchema,
  McpWwwAuthenticateNoTokenLeakageBoundarySchema,
  McpWwwAuthenticateResourceMetadataReferenceBoundarySchema,
  McpWwwAuthenticateScopeChallengeBoundarySchema,
  McpWwwAuthenticateTokenFailureModeBoundarySchema,
  type McpWwwAuthenticateChallengeReferenceMode,
} from "./read-only-app-mcp-www-authenticate-contracts";

export type McpWwwAuthenticateAuthChallengeContractInput = {
  challengeScheme?: string;
  resourceMetadataParameter?: string;
  resourceMetadataReference?: string;
  referenceMode?: McpWwwAuthenticateChallengeReferenceMode;
  publicCanonicalUrlProofAvailable?: boolean;
  runtimeHeaderEmissionRequested?: boolean;
  scopes?: readonly string[];
  exampleText?: string;
};

export type McpWwwAuthenticateResourceMetadataReferenceContract = {
  mode: McpWwwAuthenticateChallengeReferenceMode;
  reference: string | null;
  localProofOnly: boolean;
  publicRuntimeReferenceAllowed: boolean;
  runtimeHeaderEmissionAllowed: boolean;
  reason: string;
};

export function deriveWwwAuthenticateResourceMetadataReferenceContract(
  input: Pick<McpWwwAuthenticateAuthChallengeContractInput, "publicCanonicalUrlProofAvailable" | "referenceMode" | "resourceMetadataReference"> = {},
): McpWwwAuthenticateResourceMetadataReferenceContract {
  const mode = McpWwwAuthenticateChallengeReferenceModeSchema.parse(
    input.referenceMode ?? "local_proof_metadata_route_path",
  );

  if (mode === "local_proof_metadata_route_path") {
    return {
      mode,
      reference: MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      localProofOnly: true,
      publicRuntimeReferenceAllowed: false,
      reason: "local proof may reference the exact local metadata route path",
      runtimeHeaderEmissionAllowed: false,
    };
  }

  const publicReferenceAllowed =
    input.publicCanonicalUrlProofAvailable === true &&
    typeof input.resourceMetadataReference === "string" &&
    input.resourceMetadataReference.startsWith("https://");

  return {
    mode,
    reference: publicReferenceAllowed ? input.resourceMetadataReference! : null,
    localProofOnly: false,
    publicRuntimeReferenceAllowed: publicReferenceAllowed,
    reason: publicReferenceAllowed
      ? "future public canonical URL proof supplied"
      : "public runtime reference is blocked until future canonical public URL proof",
    runtimeHeaderEmissionAllowed: false,
  };
}

export function validateWwwAuthenticateScopeChallenge(scopes: readonly string[]) {
  const normalizedScopes = scopes.map((scope) => scope.toLowerCase());
  const forbiddenMatches = normalizedScopes.filter((scope) =>
    MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS.some((token) =>
      scope === token || scope.includes(`${token}:`) || scope.includes(`:${token}`),
    ),
  );

  return {
    accepted: forbiddenMatches.length === 0,
    forbiddenMatches,
    readOnlyLeastPrivilege: scopes.every((scope) =>
      MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES.includes(
        scope as (typeof MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES)[number],
      ),
    ),
  };
}

export function textHasWwwAuthenticateNoTokenLeakage(text: string) {
  const normalized = text.toLowerCase();
  return !MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES.some((surface) =>
    normalized.includes(surface.replace(/_/gu, " ")),
  );
}

export function validateWwwAuthenticateAuthChallengeContract(
  input: McpWwwAuthenticateAuthChallengeContractInput = {},
) {
  const referenceContract =
    deriveWwwAuthenticateResourceMetadataReferenceContract(input);
  const scopes = input.scopes ?? MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES;
  const scopeChallenge = validateWwwAuthenticateScopeChallenge(scopes);
  const noLeakage = textHasWwwAuthenticateNoTokenLeakage(
    input.exampleText ?? "contract-only missing-token and invalid-token posture",
  );

  return {
    accepted:
      (input.challengeScheme ?? MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME) ===
        MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME &&
      (input.resourceMetadataParameter ??
        MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER) ===
        MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER &&
      referenceContract.runtimeHeaderEmissionAllowed === false &&
      input.runtimeHeaderEmissionRequested !== true &&
      scopeChallenge.accepted &&
      scopeChallenge.readOnlyLeastPrivilege &&
      noLeakage,
    challengeScheme:
      input.challengeScheme ?? MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
    contractOnlyChallengeCases: [...MCP_WWW_AUTHENTICATE_CONTRACT_ONLY_CHALLENGE_CASES],
    noLeakage,
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
