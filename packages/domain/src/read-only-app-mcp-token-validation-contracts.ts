import { z } from "zod";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION =
  "v2av.read-only-app-mcp-token-validation-readiness.v1";

export const FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH =
  "plans/FP-0128-read-only-chatgpt-app-mcp-token-validation-failure-readiness-contracts.md";

export const MCP_TOKEN_VALIDATION_FP0128_PLAN_PREFIX = "FP-0128";
export const MCP_TOKEN_VALIDATION_FP0129_PLAN_PREFIX = "FP-0129";

export const MCP_TOKEN_VALIDATION_FAILURE_MODES = [
  "missing_token",
  "invalid_token",
  "malformed_token",
  "expired_token",
  "wrong_audience",
  "wrong_resource",
  "wrong_scope",
  "wrong_org",
  "revoked_token",
  "replayed_token",
  "token_passthrough_attempt",
] as const;

export const MCP_TOKEN_VALIDATION_CONTRACT_ONLY_FAILURE_MODES = [
  ...MCP_TOKEN_VALIDATION_FAILURE_MODES,
] as const;

export const MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES = [
  "mcp:read",
  "evidence:read",
] as const;

export const MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS = [
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

export const MCP_TOKEN_NO_LEAKAGE_SURFACES = [
  "logs",
  "ui_props",
  "metadata_examples",
  "evidence",
  "structured_tool_results",
  "docs_examples",
  "proof_outputs",
  "error_messages",
  "challenge_examples",
  "route_responses",
] as const;

export const MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS = [
  "bearer_material",
  "basic_material",
  "authorization_header_values",
  "access_token_fields",
  "refresh_token_fields",
  "client_secret_fields",
  "session_material",
  "cookie_material",
  "api_key_material",
  "openai_key_material",
  "jwt_like_material",
  "raw_finance_examples",
  "raw_source_examples",
  "provider_examples",
  "app_submission_examples",
] as const;

export const McpTokenFailureModeSchema = z.enum(
  MCP_TOKEN_VALIDATION_FAILURE_MODES,
);

export type McpTokenFailureMode = z.infer<typeof McpTokenFailureModeSchema>;

export const McpTokenValidationContractKindSchema = z.enum([
  "McpTokenValidationReadinessProofContract",
  "McpTokenValidationDeferredBoundary",
  "McpTokenParsingDeferredBoundary",
  "McpTokenSessionStorageDeferredBoundary",
  "McpAuthMiddlewareDeferredBoundary",
  "McpTokenFailureTaxonomyBoundary",
  "McpTokenAudienceResourceValidationBoundary",
  "McpTokenScopeValidationBoundary",
  "McpAuthenticatedCompanyBindingBoundary",
  "McpClientCompanyKeySelectorOnlyBoundary",
  "McpTokenPassthroughForbiddenBoundary",
  "McpTokenNoLeakageBoundary",
  "McpTokenValidationNoRuntimeBoundary",
]);

export type McpTokenValidationContractKind = z.infer<
  typeof McpTokenValidationContractKindSchema
>;

const BaseTokenValidationContractSchema = z
  .object({
    schemaVersion: z.literal(MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION),
    contractKind: McpTokenValidationContractKindSchema,
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpTokenValidationReadinessProofContractSchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenValidationReadinessProofContract"),
    contractOnly: trueLiteral,
    noTokenValidationImplementation: trueLiteral,
    noTokenParsingImplementation: trueLiteral,
    noTokenSessionImplementation: trueLiteral,
    noAuthMiddlewareImplementation: trueLiteral,
    noWwwAuthenticateRouteBehaviorImplementation: trueLiteral,
    noMcpRouteBehaviorChange: trueLiteral,
    noProtectedResourceMetadataRouteBehaviorChange: trueLiteral,
    noOauthImplementation: trueLiteral,
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
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const McpTokenValidationDeferredBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenValidationDeferredBoundary"),
    tokenValidationFutureOnly: trueLiteral,
    tokenValidationRuntimeImplemented: falseLiteral,
    tokenValidationRouteImportAllowed: falseLiteral,
    routeImplementationPlanRequired: trueLiteral,
  }).strict();

export const McpTokenParsingDeferredBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenParsingDeferredBoundary"),
    tokenParsingFutureOnly: trueLiteral,
    realTokenParsingImplemented: falseLiteral,
    tokenDecodingAttemptAllowed: falseLiteral,
    tokenIntrospectionAttemptAllowed: falseLiteral,
  }).strict();

export const McpTokenSessionStorageDeferredBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenSessionStorageDeferredBoundary"),
    tokenStorageFutureOnly: trueLiteral,
    sessionStorageFutureOnly: trueLiteral,
    tokenStoredNow: falseLiteral,
    sessionStoredNow: falseLiteral,
    refreshTokenStorageAllowedNow: falseLiteral,
  }).strict();

export const McpAuthMiddlewareDeferredBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpAuthMiddlewareDeferredBoundary"),
    authMiddlewareFutureOnly: trueLiteral,
    authMiddlewareImplemented: falseLiteral,
    routeGuardImplemented: falseLiteral,
    currentRoutesMayImportTokenValidationHelpers: falseLiteral,
  }).strict();

export const McpTokenFailureTaxonomyBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenFailureTaxonomyBoundary"),
    failureModes: z.tuple([
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[0]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[1]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[2]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[3]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[4]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[5]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[6]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[7]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[8]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[9]),
      z.literal(MCP_TOKEN_VALIDATION_FAILURE_MODES[10]),
    ]),
    taxonomyProofOnly: trueLiteral,
    futureOnlyStatusMapping: trueLiteral,
    routeStatusEmittedNow: falseLiteral,
  }).strict();

export const McpTokenAudienceResourceValidationBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenAudienceResourceValidationBoundary"),
    futureCanonicalPublicMcpResourceUriProofRequired: trueLiteral,
    resourceIndicatorRequiredBeforeValidation: trueLiteral,
    audienceValidationRuntimeImplemented: falseLiteral,
    wrongAudienceContractOnly: trueLiteral,
    wrongResourceContractOnly: trueLiteral,
    localRouteUrlIsTokenAudienceAuthority: falseLiteral,
    clientCompanyKeyIsResourceAuthority: falseLiteral,
  }).strict();

export const McpTokenScopeValidationBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenScopeValidationBoundary"),
    scopeValidationRuntimeImplemented: falseLiteral,
    wrongScopeContractOnly: trueLiteral,
    leastPrivilegeRequired: trueLiteral,
    readOnlyScopesOnly: trueLiteral,
    scopeChallengeCannotWidenScopes: trueLiteral,
    allowedReadOnlyScopes: z.tuple([
      z.literal(MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES[0]),
      z.literal(MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES[1]),
    ]),
    forbiddenScopeTokens: z.tuple([
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[0]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[1]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[2]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[3]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[4]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[5]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[6]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[7]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[8]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[9]),
      z.literal(MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS[10]),
    ]),
  }).strict();

export const McpAuthenticatedCompanyBindingBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpAuthenticatedCompanyBindingBoundary"),
    authenticatedUserRequired: trueLiteral,
    authenticatedOrgRequired: trueLiteral,
    authenticatedCompanyRequired: trueLiteral,
    wrongOrgContractOnly: trueLiteral,
    companyBindingRuntimeImplemented: falseLiteral,
  }).strict();

export const McpClientCompanyKeySelectorOnlyBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpClientCompanyKeySelectorOnlyBoundary"),
    clientCompanyKeySelectorOnly: trueLiteral,
    clientCompanyKeyAuthorityAllowed: falseLiteral,
    failClosedWithoutAuthenticatedBinding: trueLiteral,
    selectorCannotCreateCompanyBinding: trueLiteral,
  }).strict();

export const McpTokenPassthroughForbiddenBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenPassthroughForbiddenBoundary"),
    tokenPassthroughForbidden: trueLiteral,
    passthroughAttemptFailureMode: z.literal("token_passthrough_attempt"),
    passthroughAttemptFailsClosed: trueLiteral,
    upstreamTokenTransitAllowed: falseLiteral,
    downstreamTokenTransitAllowed: falseLiteral,
  }).strict();

export const McpTokenNoLeakageBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenNoLeakageBoundary"),
    leakageSurfaces: z.tuple([
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[0]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[1]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[2]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[3]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[4]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[5]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[6]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[7]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[8]),
      z.literal(MCP_TOKEN_NO_LEAKAGE_SURFACES[9]),
    ]),
    forbiddenMaterials: z.tuple([
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[0]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[1]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[2]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[3]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[4]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[5]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[6]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[7]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[8]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[9]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[10]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[11]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[12]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[13]),
      z.literal(MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS[14]),
    ]),
    realTokenExamplesAllowed: falseLiteral,
    proofOutputMayContainTokenMaterial: falseLiteral,
    routeResponsesMayContainTokenMaterial: falseLiteral,
  }).strict();

export const McpTokenValidationNoRuntimeBoundarySchema =
  BaseTokenValidationContractSchema.extend({
    contractKind: z.literal("McpTokenValidationNoRuntimeBoundary"),
    noTokenValidationRuntime: trueLiteral,
    noTokenParsingRuntime: trueLiteral,
    noTokenSessionRuntime: trueLiteral,
    noAuthMiddlewareRuntime: trueLiteral,
    noWwwAuthenticateRuntime: trueLiteral,
    noMcpRouteRuntimeChange: trueLiteral,
    noProtectedResourceMetadataRuntimeChange: trueLiteral,
    noOauthRuntime: trueLiteral,
    noDbRuntime: trueLiteral,
  }).strict();

export type McpTokenValidationReadinessProofContract = z.infer<
  typeof McpTokenValidationReadinessProofContractSchema
>;
export type McpTokenValidationDeferredBoundary = z.infer<
  typeof McpTokenValidationDeferredBoundarySchema
>;
export type McpTokenParsingDeferredBoundary = z.infer<
  typeof McpTokenParsingDeferredBoundarySchema
>;
export type McpTokenSessionStorageDeferredBoundary = z.infer<
  typeof McpTokenSessionStorageDeferredBoundarySchema
>;
export type McpAuthMiddlewareDeferredBoundary = z.infer<
  typeof McpAuthMiddlewareDeferredBoundarySchema
>;
export type McpTokenFailureTaxonomyBoundary = z.infer<
  typeof McpTokenFailureTaxonomyBoundarySchema
>;
export type McpTokenAudienceResourceValidationBoundary = z.infer<
  typeof McpTokenAudienceResourceValidationBoundarySchema
>;
export type McpTokenScopeValidationBoundary = z.infer<
  typeof McpTokenScopeValidationBoundarySchema
>;
export type McpAuthenticatedCompanyBindingBoundary = z.infer<
  typeof McpAuthenticatedCompanyBindingBoundarySchema
>;
export type McpClientCompanyKeySelectorOnlyBoundary = z.infer<
  typeof McpClientCompanyKeySelectorOnlyBoundarySchema
>;
export type McpTokenPassthroughForbiddenBoundary = z.infer<
  typeof McpTokenPassthroughForbiddenBoundarySchema
>;
export type McpTokenNoLeakageBoundary = z.infer<
  typeof McpTokenNoLeakageBoundarySchema
>;
export type McpTokenValidationNoRuntimeBoundary = z.infer<
  typeof McpTokenValidationNoRuntimeBoundarySchema
>;
