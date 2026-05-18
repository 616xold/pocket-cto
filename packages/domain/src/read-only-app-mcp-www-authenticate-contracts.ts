import { z } from "zod";
import { MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH } from "./read-only-app-mcp-protected-resource-metadata-route-input-contracts";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_WWW_AUTHENTICATE_AUTH_CHALLENGE_SCHEMA_VERSION =
  "v2au.read-only-app-mcp-www-authenticate-auth-challenge.v1";

export const FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH =
  "plans/FP-0127-read-only-chatgpt-app-mcp-www-authenticate-auth-challenge-contracts-foundation.md";

export const FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH =
  "plans/FP-0129-read-only-chatgpt-app-mcp-www-authenticate-challenge-implementation-sequencing-master-plan.md";

export const FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH =
  "plans/FP-0130-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation.md";

export const MCP_WWW_AUTHENTICATE_FP0127_PLAN_PREFIX = "FP-0127";
export const MCP_WWW_AUTHENTICATE_FP0128_PLAN_PREFIX = "FP-0128";
export const MCP_WWW_AUTHENTICATE_FP0129_PLAN_PREFIX = "FP-0129";
export const MCP_WWW_AUTHENTICATE_FP0130_PLAN_PREFIX = "FP-0130";
export const MCP_WWW_AUTHENTICATE_FP0131_PLAN_PREFIX = "FP-0131";

export const MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME = "Bearer" as const;
export const MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER =
  "resource_metadata" as const;
export const MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE =
  MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH;

export const MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES = [
  "mcp:read",
  "evidence:read",
] as const;

export const MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS = [
  "write",
  "admin",
  "mutation",
  "offline",
  "offline_access",
  "provider",
  "delete",
  "update",
  "create",
  "all",
  "*",
] as const;

export const MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES = [
  "missing_token",
  "invalid_token",
  "malformed_token",
  "expired_token",
  "wrong_audience",
  "wrong_scope",
  "wrong_org",
  "revoked_token",
  "replayed_token",
] as const;

export const MCP_WWW_AUTHENTICATE_CONTRACT_ONLY_CHALLENGE_CASES = [
  "missing_token",
  "invalid_token",
] as const;

export const MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES = [
  "token_values",
  "cookies",
  "sessions",
  "credentials",
  "client_secrets",
  "authorization_headers",
  "raw_finance_data",
  "raw_source_dumps",
  "company_key_authority",
  "prompt_text",
  "proof_internals",
  "provider_credentials",
  "openai_keys",
  "app_submission_copy",
] as const;

export const McpWwwAuthenticateAuthChallengeContractKindSchema = z.enum([
  "McpWwwAuthenticateAuthChallengeProofContract",
  "McpWwwAuthenticateChallengeDeferredBoundary",
  "McpWwwAuthenticateBearerChallengeShapeBoundary",
  "McpWwwAuthenticateResourceMetadataReferenceBoundary",
  "McpWwwAuthenticateLocalVsPublicResourceMetadataBoundary",
  "McpWwwAuthenticateMissingTokenChallengeBoundary",
  "McpWwwAuthenticateInvalidTokenChallengeBoundary",
  "McpWwwAuthenticateTokenFailureModeBoundary",
  "McpWwwAuthenticateScopeChallengeBoundary",
  "McpWwwAuthenticateNoTokenLeakageBoundary",
  "McpWwwAuthenticateMcpBehaviorUnchangedBoundary",
  "McpWwwAuthenticateNoRuntimeBoundary",
]);

export type McpWwwAuthenticateAuthChallengeContractKind = z.infer<
  typeof McpWwwAuthenticateAuthChallengeContractKindSchema
>;

const BaseWwwAuthenticateContractSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_WWW_AUTHENTICATE_AUTH_CHALLENGE_SCHEMA_VERSION,
    ),
    contractKind: McpWwwAuthenticateAuthChallengeContractKindSchema,
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpWwwAuthenticateAuthChallengeProofContractSchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateAuthChallengeProofContract"),
    contractOnly: trueLiteral,
    noHttpHeaderEmission: trueLiteral,
    noRouteBehaviorChange: trueLiteral,
    noProtectedResourceMetadataRouteBehaviorChange: trueLiteral,
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
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noProviderCalls: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const McpWwwAuthenticateChallengeDeferredBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateChallengeDeferredBoundary"),
    challengeBehaviorFutureOnly: trueLiteral,
    challengeHeaderEmittedByAnyRoute: falseLiteral,
    challengeEmissionAuthorizedNow: falseLiteral,
    routeImplementationPlanRequired: trueLiteral,
  }).strict();

export const McpWwwAuthenticateBearerChallengeShapeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateBearerChallengeShapeBoundary"),
    requiredScheme: z.literal(MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME),
    resourceMetadataParameterRequired: trueLiteral,
    headerStringBuilt: falseLiteral,
  }).strict();

export const McpWwwAuthenticateResourceMetadataReferenceBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal(
      "McpWwwAuthenticateResourceMetadataReferenceBoundary",
    ),
    metadataUrlDecisionRequired: trueLiteral,
    resourceMetadataReferenceExact: trueLiteral,
    localReference: z.literal(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    ),
    publicReferenceImplemented: falseLiteral,
  }).strict();

export const McpWwwAuthenticateLocalVsPublicResourceMetadataBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal(
      "McpWwwAuthenticateLocalVsPublicResourceMetadataBoundary",
    ),
    localProofMayReferenceLocalMetadataRoutePath: trueLiteral,
    localReferenceIsPublicCanonicalUrl: falseLiteral,
    publicRuntimeRequiresFutureCanonicalPublicUrlProof: trueLiteral,
    publicRuntimeReferenceAllowedNow: falseLiteral,
  }).strict();

export const McpWwwAuthenticateMissingTokenChallengeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateMissingTokenChallengeBoundary"),
    missingTokenChallengeContractOnly: trueLiteral,
    missingTokenRuntimeChallengeImplemented: falseLiteral,
    missingTokenChallengeRequiresResourceMetadata: trueLiteral,
  }).strict();

export const McpWwwAuthenticateInvalidTokenChallengeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateInvalidTokenChallengeBoundary"),
    invalidTokenChallengeContractOnly: trueLiteral,
    invalidTokenRuntimeChallengeImplemented: falseLiteral,
    tokenValidationRuntimeRequiredBeforeImplementation: trueLiteral,
  }).strict();

export const McpWwwAuthenticateTokenFailureModeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateTokenFailureModeBoundary"),
    failureModes: z.tuple([
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[0]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[1]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[2]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[3]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[4]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[5]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[6]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[7]),
      z.literal(MCP_WWW_AUTHENTICATE_TOKEN_FAILURE_MODES[8]),
    ]),
    tokenFailureModesFutureTokenValidationLane: trueLiteral,
    malformedExpiredAudienceScopeOrgRevokedReplayedFutureOnly: trueLiteral,
  }).strict();

export const McpWwwAuthenticateScopeChallengeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateScopeChallengeBoundary"),
    scopeChallengeContractOnly: trueLiteral,
    scopeChallengeCannotCreateOrWidenScopes: trueLiteral,
    leastPrivilegeRequired: trueLiteral,
    readOnlyScopesOnly: trueLiteral,
    allowedScopeChallenges: z.tuple([
      z.literal(MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES[0]),
      z.literal(MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES[1]),
    ]),
    forbiddenScopeTokens: z.tuple([
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[0]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[1]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[2]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[3]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[4]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[5]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[6]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[7]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[8]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[9]),
      z.literal(MCP_WWW_AUTHENTICATE_FORBIDDEN_SCOPE_TOKENS[10]),
    ]),
  }).strict();

export const McpWwwAuthenticateNoTokenLeakageBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateNoTokenLeakageBoundary"),
    forbiddenLeakageSurfaces: z.tuple([
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[0]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[1]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[2]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[3]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[4]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[5]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[6]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[7]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[8]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[9]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[10]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[11]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[12]),
      z.literal(MCP_WWW_AUTHENTICATE_NO_LEAKAGE_SURFACES[13]),
    ]),
    examplesMayContainTokenValues: falseLiteral,
    examplesMayContainRawFinanceData: falseLiteral,
    examplesMayContainAppSubmissionCopy: falseLiteral,
  }).strict();

export const McpWwwAuthenticateMcpBehaviorUnchangedBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateMcpBehaviorUnchangedBoundary"),
    initializeChallengeAuthorized: falseLiteral,
    pingChallengeAuthorized: falseLiteral,
    toolsListChallengeAuthorized: falseLiteral,
    toolsCallChallengeAuthorized: falseLiteral,
    getMcp405Preserved: trueLiteral,
    notification202Preserved: trueLiteral,
    originBoundaryPreserved: trueLiteral,
    localDispatchPreserved: trueLiteral,
  }).strict();

export const McpWwwAuthenticateNoRuntimeBoundarySchema =
  BaseWwwAuthenticateContractSchema.extend({
    contractKind: z.literal("McpWwwAuthenticateNoRuntimeBoundary"),
    noWwwAuthenticateRuntime: trueLiteral,
    noProtectedResourceMetadataRouteRuntimeChange: trueLiteral,
    noOauthRuntime: trueLiteral,
    noTokenValidationRuntime: trueLiteral,
    noTokenSessionRuntime: trueLiteral,
    noAuthMiddlewareRuntime: trueLiteral,
    noRemoteMcpRuntime: trueLiteral,
    noAppsSdkResourceRuntime: trueLiteral,
    noDbRuntime: trueLiteral,
  }).strict();

export const McpWwwAuthenticateChallengeReferenceModeSchema = z.enum([
  "local_proof_metadata_route_path",
  "public_runtime_canonical_url",
]);

export type McpWwwAuthenticateChallengeReferenceMode = z.infer<
  typeof McpWwwAuthenticateChallengeReferenceModeSchema
>;
