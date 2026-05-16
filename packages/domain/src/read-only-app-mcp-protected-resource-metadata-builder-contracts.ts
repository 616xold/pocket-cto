import { z } from "zod";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION =
  "v2ap.read-only-app-mcp-protected-resource-metadata-builder.v1";

export const FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH =
  "plans/FP-0122-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts.md";

export const FP0123_PLAN_PREFIX = "FP-0123";

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS = [
  "header",
] as const;

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_PERMITTED_METADATA_FIELDS = [
  "resource",
  "authorization_servers",
  "scopes_supported",
  "bearer_methods_supported",
] as const;

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES = [
  "mcp:read",
  "evidence:read",
  "source_coverage:read",
  "company_posture:read",
] as const;

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_SCOPE_TOKENS = [
  "*",
  "all",
  "admin",
  "delete",
  "manage",
  "mutation",
  "offline_access",
  "provider",
  "update",
  "write",
] as const;

export const MCP_PROTECTED_RESOURCE_METADATA_BUILDER_FORBIDDEN_METADATA_TOKENS = [
  "access_token",
  "authorization: bearer",
  "bearer_token",
  "client_secret",
  "companykey",
  "cookie:",
  "cookie=",
  "oauth_secret",
  "pk_live",
  "pk_test",
  "provider_credential",
  "raw finance",
  "raw source",
  "refresh_token",
  "session_token",
  "set-cookie",
  "sk_live",
  "sk_test",
  "source dump",
  "token=",
] as const;

export const McpProtectedResourceMetadataBuilderContractKindSchema = z.enum([
  "McpProtectedResourceMetadataBuilderProofContract",
  "McpProtectedResourceMetadataBuilderInputBoundary",
  "McpProtectedResourceMetadataBuilderCanonicalUriBoundary",
  "McpProtectedResourceMetadataBuilderAuthorizationServersBoundary",
  "McpProtectedResourceMetadataBuilderScopesBoundary",
  "McpProtectedResourceMetadataBuilderBearerMethodsBoundary",
  "McpProtectedResourceMetadataBuilderNoTokenLeakageBoundary",
  "McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundary",
  "McpProtectedResourceMetadataBuilderNoRuntimeBoundary",
]);

const BaseBuilderContractSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION,
    ),
    contractKind: McpProtectedResourceMetadataBuilderContractKindSchema,
    localProofOnly: trueLiteral,
    readOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpProtectedResourceMetadataBuilderProofContractSchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderProofContract",
    ),
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
    noListingCopy: trueLiteral,
    noGeneratedPublicProse: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noOpenAiClientOrKeyUsage: trueLiteral,
    noProviderCalls: trueLiteral,
    noExternalCommunications: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderInputBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderInputBoundary",
    ),
    strictInputShapeRequired: trueLiteral,
    metadataDocumentBuilderOnly: trueLiteral,
    routeRuntimeInputAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderCanonicalUriBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderCanonicalUriBoundary",
    ),
    acceptedFp0120CanonicalUriRequired: trueLiteral,
    placeholderResourceAllowed: falseLiteral,
    localhostAllowed: falseLiteral,
    localTunnelAllowed: falseLiteral,
    selectorAuthorityAllowed: falseLiteral,
    queryStringAllowed: falseLiteral,
    fragmentAllowed: falseLiteral,
    workspaceTenantTemplateAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderAuthorizationServersBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderAuthorizationServersBoundary",
    ),
    authorizationServersRequired: trueLiteral,
    authorizationServersMustBeNonEmpty: trueLiteral,
    authorizationServersMustBeHttps: trueLiteral,
    authorizationServersMustBeExactStableIssuers: trueLiteral,
    providerNeutralUntilLaterPlan: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderScopesBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal("McpProtectedResourceMetadataBuilderScopesBoundary"),
    scopesSupportedRequired: trueLiteral,
    readOnlyOnly: trueLiteral,
    leastPrivilegeRequired: trueLiteral,
    allowedScopes: z.tuple([
      z.literal(MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES[0]),
      z.literal(MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES[1]),
      z.literal(MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES[2]),
      z.literal(MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES[3]),
    ]),
  }).strict();

export const McpProtectedResourceMetadataBuilderBearerMethodsBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderBearerMethodsBoundary",
    ),
    bearerMethodsSupportedRequired: trueLiteral,
    headerBearerRequired: trueLiteral,
    queryStringBearerAllowed: falseLiteral,
    headerOnlyPosture: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderNoTokenLeakageBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderNoTokenLeakageBoundary",
    ),
    tokenValuesAllowedInMetadata: falseLiteral,
    cookiesSessionsSecretsCredentialsAllowed: falseLiteral,
    rawFinanceDataAllowed: falseLiteral,
    rawSourceDumpsAllowed: falseLiteral,
    companyKeyAuthorityAllowed: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundary",
    ),
    routeResponseContractOnly: trueLiteral,
    routeRegistered: falseLiteral,
    responseSerializedByRuntime: falseLiteral,
    wwwAuthenticateBehaviorImplemented: falseLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderNoRuntimeBoundarySchema =
  BaseBuilderContractSchema.extend({
    contractKind: z.literal(
      "McpProtectedResourceMetadataBuilderNoRuntimeBoundary",
    ),
    noRouteRuntime: trueLiteral,
    noOauthRuntime: trueLiteral,
    noTokenSessionRuntime: trueLiteral,
    noAuthMiddlewareRuntime: trueLiteral,
    noRemoteMcpRuntime: trueLiteral,
    noAppsSdkResourceRuntime: trueLiteral,
    noDbRuntime: trueLiteral,
  }).strict();

export const McpProtectedResourceMetadataBuilderInputSchema = z
  .object({
    authorizationServers: z.array(z.string()).min(1),
    bearerMethodsSupported: z.array(z.enum(["header", "body", "query"])).min(1),
    canonicalResourceUri: z.string().min(1),
    scopesSupported: z.array(z.string()).min(1),
  })
  .strict();

export const McpProtectedResourceMetadataBuilderDocumentSchema = z
  .object({
    resource: z.string(),
    authorization_servers: z.array(z.string()).min(1),
    scopes_supported: z.array(z.string()).min(1),
    bearer_methods_supported: z.array(z.literal("header")).min(1),
  })
  .strict();

export const McpProtectedResourceMetadataRouteResponseContractSchema = z
  .object({
    localProofOnly: trueLiteral,
    routeResponseContractOnly: trueLiteral,
    routeRegistered: falseLiteral,
    routeBehaviorImplemented: falseLiteral,
    wwwAuthenticateBehaviorImplemented: falseLiteral,
    deferredUntilFutureFinancePlan: trueLiteral,
    metadataDocument: McpProtectedResourceMetadataBuilderDocumentSchema,
  })
  .strict();

export type McpProtectedResourceMetadataBuilderInput = z.infer<
  typeof McpProtectedResourceMetadataBuilderInputSchema
>;

export type McpProtectedResourceMetadataBuilderDocument = z.infer<
  typeof McpProtectedResourceMetadataBuilderDocumentSchema
>;

export type McpProtectedResourceMetadataRouteResponseContract = z.infer<
  typeof McpProtectedResourceMetadataRouteResponseContractSchema
>;
