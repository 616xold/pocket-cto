import { z } from "zod";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_REMOTE_HOST_READINESS_SCHEMA_VERSION =
  "v2ah.read-only-app-mcp-remote-host-readiness.v1";

export const FP0114_REMOTE_HOST_READINESS_PLAN_PATH =
  "plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md";

export const FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH =
  "plans/FP-0115-read-only-chatgpt-app-mcp-remote-host-implementation-sequencing-master-plan.md";

export const MCP_REMOTE_HOST_CANONICAL_PATH = "/mcp";

export const MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES = [
  "tokens",
  "cookies",
  "sessions",
  "oauth_material",
  "raw_prompts",
  "raw_source_files",
  "evidence_dumps",
  "provider_credentials",
  "object_store_dumps",
  "db_dumps",
  "openai_keys",
  "private_finance_data",
] as const;

export const MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES = [
  "real_finance_data",
  "public_demo_data",
  "raw_dumps",
  "source_packs",
  "private_finance_data",
] as const;

export const McpRemoteHostReadinessContractKindSchema = z.enum([
  "McpRemoteHostReadinessProofContract",
  "McpRemoteDeploymentDeferredBoundary",
  "McpRemoteHostInventoryBoundary",
  "McpCanonicalResourceUriBoundary",
  "McpRemoteMcpPathBoundary",
  "McpHttpsTlsFutureRequirementBoundary",
  "McpStreamableHttpTransportBoundary",
  "McpGetSseDeferredBoundary",
  "McpOriginValidationBoundary",
  "McpCorsPolicyBoundary",
  "McpCspResourcePolicyBoundary",
  "McpRateLimitAbuseControlBoundary",
  "McpLoggingRedactionBoundary",
  "McpObservabilityAuditCorrelationBoundary",
  "McpRollbackIncidentResponseBoundary",
  "McpHealthReadinessDeferredBoundary",
  "McpNoRealFinanceDataPublicDemoBoundary",
  "McpOauthSecurityPrerequisiteBoundary",
  "McpNoRemoteRuntimeBoundary",
]);

const BaseRemoteHostReadinessContractSchema = z
  .object({
    schemaVersion: z.literal(MCP_REMOTE_HOST_READINESS_SCHEMA_VERSION),
    contractKind: McpRemoteHostReadinessContractKindSchema,
    localProofOnly: trueLiteral,
    implementationAdded: falseLiteral,
  })
  .strict();

export const McpRemoteHostReadinessProofContractSchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpRemoteHostReadinessProofContract"),
    contractOnly: trueLiteral,
    readOnly: trueLiteral,
    noRouteBehaviorChange: trueLiteral,
    noNewRoutePath: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noOauthImplementation: trueLiteral,
    noTokenSessionImplementation: trueLiteral,
    noAuthMiddlewareImplementation: trueLiteral,
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
    fp0115Created: falseLiteral,
  }).strict();

function deferredBoundarySchema(
  kind: z.infer<typeof McpRemoteHostReadinessContractKindSchema>,
) {
  return BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal(kind),
    deferred: trueLiteral,
    implemented: falseLiteral,
    requiresLaterFinancePlan: trueLiteral,
  }).strict();
}

export const McpRemoteDeploymentDeferredBoundarySchema =
  deferredBoundarySchema("McpRemoteDeploymentDeferredBoundary").extend({
    publicHostConfigured: falseLiteral,
    remoteServerStarted: falseLiteral,
    deploymentConfigAdded: falseLiteral,
    currentLocalRouteExposeableAsIs: falseLiteral,
  });

export const McpRemoteHostInventoryBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpRemoteHostInventoryBoundary"),
    publicExposureInventoryRequired: trueLiteral,
    stableHttpsHostRequirementRecorded: trueLiteral,
    dnsHostTrustModelRequired: trueLiteral,
    noRemoteRuntime: trueLiteral,
  }).strict();

export const McpCanonicalResourceUriBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpCanonicalResourceUriBoundary"),
    exactCanonicalResourceUriRequired: trueLiteral,
    canonicalUriImplementationAdded: falseLiteral,
    placeholdersAcceptedForRemoteImplementation: falseLiteral,
    httpsSchemeRequired: trueLiteral,
    fragmentAllowed: falseLiteral,
    queryStringAllowed: falseLiteral,
  }).strict();

export const McpRemoteMcpPathBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpRemoteMcpPathBoundary"),
    onlyFuturePublicMcpEndpointPath: z.literal(MCP_REMOTE_HOST_CANONICAL_PATH),
    routePathAdded: falseLiteral,
    newRoutePathAllowed: falseLiteral,
    getMcpBehaviorChangeAllowed: falseLiteral,
    postMcpBehaviorChangeAllowed: falseLiteral,
  }).strict();

export const McpHttpsTlsFutureRequirementBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpHttpsTlsFutureRequirementBoundary"),
    stableHttpsHostRequired: trueLiteral,
    tlsRequired: trueLiteral,
    plainHttpRemoteExposureAllowed: falseLiteral,
    localHttpOnlyAllowedForLocalDevelopment: trueLiteral,
  }).strict();

export const McpStreamableHttpTransportBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpStreamableHttpTransportBoundary"),
    streamableHttpCompatibilityRequired: trueLiteral,
    postJsonRpcCompatibilityRequired: trueLiteral,
    getCompatibilityRequired: trueLiteral,
    singleEndpointPathRequired: trueLiteral,
    sseOptionalButDeferred: trueLiteral,
    routeBehaviorChangeRequiredNow: falseLiteral,
  }).strict();

export const McpGetSseDeferredBoundarySchema = deferredBoundarySchema(
  "McpGetSseDeferredBoundary",
).extend({
  getSseStreamingImplemented: falseLiteral,
  getMcpStillSseUnavailable: trueLiteral,
  futurePlanRequiredToOpenSse: trueLiteral,
});

export const McpOriginValidationBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpOriginValidationBoundary"),
    originValidationRequired: trueLiteral,
    invalidOriginMustFailClosed: trueLiteral,
    dnsRebindingMitigationRequired: trueLiteral,
    wildcardOriginTrustAllowed: falseLiteral,
  }).strict();

export const McpCorsPolicyBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpCorsPolicyBoundary"),
    explicitCorsPolicyRequiredBeforeRemoteExposure: trueLiteral,
    wildcardOriginAllowed: falseLiteral,
    credentialsWithoutExplicitOriginAllowed: falseLiteral,
    preflightPolicyRequired: trueLiteral,
  }).strict();

export const McpCspResourcePolicyBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpCspResourcePolicyBoundary"),
    cspRequiredBeforeAppsSdkResources: trueLiteral,
    resourceDomainAllowlistRequired: trueLiteral,
    frameAncestorsPolicyRequired: trueLiteral,
    appsSdkResourceImplementationAdded: falseLiteral,
  }).strict();

export const McpRateLimitAbuseControlBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpRateLimitAbuseControlBoundary"),
    rateLimitsRequiredBeforeRemoteExposure: trueLiteral,
    abuseControlsRequiredBeforeRemoteExposure: trueLiteral,
    perIdentityLimitRequired: trueLiteral,
    unauthenticatedPublicTrafficAllowed: falseLiteral,
  }).strict();

export const McpLoggingRedactionBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpLoggingRedactionBoundary"),
    redactionRequired: trueLiteral,
    rawSensitiveLoggingAllowed: falseLiteral,
    forbiddenLogCategories: z.tuple([
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[0]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[1]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[2]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[3]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[4]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[5]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[6]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[7]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[8]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[9]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[10]),
      z.literal(MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES[11]),
    ]),
  }).strict();

export const McpObservabilityAuditCorrelationBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpObservabilityAuditCorrelationBoundary"),
    auditCorrelationRequired: trueLiteral,
    correlationIdRequired: trueLiteral,
    evidenceProofBoundaryPreserved: trueLiteral,
    rawFinanceDataInTelemetryAllowed: falseLiteral,
  }).strict();

export const McpRollbackIncidentResponseBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpRollbackIncidentResponseBoundary"),
    rollbackPlanRequiredBeforeDeployment: trueLiteral,
    incidentResponsePlanRequiredBeforeDeployment: trueLiteral,
    exposureDisableControlRequired: trueLiteral,
    remoteDeploymentAllowedWithoutRollback: falseLiteral,
  }).strict();

export const McpHealthReadinessDeferredBoundarySchema = deferredBoundarySchema(
  "McpHealthReadinessDeferredBoundary",
).extend({
  healthReadinessRouteAdded: falseLiteral,
  healthReadinessChecksFutureOnly: trueLiteral,
  noNewHealthRoute: trueLiteral,
});

export const McpNoRealFinanceDataPublicDemoBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpNoRealFinanceDataPublicDemoBoundary"),
    noRealFinanceData: trueLiteral,
    noPublicDemoData: trueLiteral,
    noRawDumps: trueLiteral,
    noSourcePacks: trueLiteral,
    noPrivateFinanceDataExposure: trueLiteral,
    forbiddenExposureCategories: z.tuple([
      z.literal(MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES[0]),
      z.literal(MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES[1]),
      z.literal(MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES[2]),
      z.literal(MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES[3]),
      z.literal(MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES[4]),
    ]),
  }).strict();

export const McpOauthSecurityPrerequisiteBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpOauthSecurityPrerequisiteBoundary"),
    fp0113PrerequisiteRequired: trueLiteral,
    oauthSecurityContractsMustRemainVerified: trueLiteral,
    publicExposureBlockedUntilAuthImplemented: trueLiteral,
  }).strict();

export const McpNoRemoteRuntimeBoundarySchema =
  BaseRemoteHostReadinessContractSchema.extend({
    contractKind: z.literal("McpNoRemoteRuntimeBoundary"),
    noRemoteRuntime: trueLiteral,
    noDeploymentConfig: trueLiteral,
    noExternalHostProvisioned: trueLiteral,
    localProofOnlyRuntimePosture: trueLiteral,
  }).strict();
