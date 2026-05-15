import type { z } from "zod";
import type { McpRemoteHostReadinessContractKindSchema } from "./read-only-app-mcp-remote-host-readiness-contracts";
import {
  MCP_REMOTE_HOST_CANONICAL_PATH,
  MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
  MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
  MCP_REMOTE_HOST_READINESS_SCHEMA_VERSION,
  McpCanonicalResourceUriBoundarySchema,
  McpCorsPolicyBoundarySchema,
  McpCspResourcePolicyBoundarySchema,
  McpGetSseDeferredBoundarySchema,
  McpHealthReadinessDeferredBoundarySchema,
  McpHttpsTlsFutureRequirementBoundarySchema,
  McpLoggingRedactionBoundarySchema,
  McpNoRealFinanceDataPublicDemoBoundarySchema,
  McpNoRemoteRuntimeBoundarySchema,
  McpObservabilityAuditCorrelationBoundarySchema,
  McpOauthSecurityPrerequisiteBoundarySchema,
  McpOriginValidationBoundarySchema,
  McpRateLimitAbuseControlBoundarySchema,
  McpRemoteDeploymentDeferredBoundarySchema,
  McpRemoteHostInventoryBoundarySchema,
  McpRemoteHostReadinessProofContractSchema,
  McpRemoteMcpPathBoundarySchema,
  McpRollbackIncidentResponseBoundarySchema,
  McpStreamableHttpTransportBoundarySchema,
} from "./read-only-app-mcp-remote-host-readiness-contracts";

export function buildMcpRemoteHostReadinessContracts() {
  return {
    canonicalResourceUriBoundary: McpCanonicalResourceUriBoundarySchema.parse({
      ...base("McpCanonicalResourceUriBoundary"),
      canonicalUriImplementationAdded: false,
      exactCanonicalResourceUriRequired: true,
      fragmentAllowed: false,
      httpsSchemeRequired: true,
      placeholdersAcceptedForRemoteImplementation: false,
      queryStringAllowed: false,
    }),
    corsPolicyBoundary: McpCorsPolicyBoundarySchema.parse({
      ...base("McpCorsPolicyBoundary"),
      credentialsWithoutExplicitOriginAllowed: false,
      explicitCorsPolicyRequiredBeforeRemoteExposure: true,
      preflightPolicyRequired: true,
      wildcardOriginAllowed: false,
    }),
    cspResourcePolicyBoundary: McpCspResourcePolicyBoundarySchema.parse({
      ...base("McpCspResourcePolicyBoundary"),
      appsSdkResourceImplementationAdded: false,
      cspRequiredBeforeAppsSdkResources: true,
      frameAncestorsPolicyRequired: true,
      resourceDomainAllowlistRequired: true,
    }),
    getSseDeferredBoundary: McpGetSseDeferredBoundarySchema.parse({
      ...deferred("McpGetSseDeferredBoundary"),
      futurePlanRequiredToOpenSse: true,
      getMcpStillSseUnavailable: true,
      getSseStreamingImplemented: false,
    }),
    healthReadinessDeferredBoundary:
      McpHealthReadinessDeferredBoundarySchema.parse({
        ...deferred("McpHealthReadinessDeferredBoundary"),
        healthReadinessChecksFutureOnly: true,
        healthReadinessRouteAdded: false,
        noNewHealthRoute: true,
      }),
    httpsTlsFutureRequirementBoundary:
      McpHttpsTlsFutureRequirementBoundarySchema.parse({
        ...base("McpHttpsTlsFutureRequirementBoundary"),
        localHttpOnlyAllowedForLocalDevelopment: true,
        plainHttpRemoteExposureAllowed: false,
        stableHttpsHostRequired: true,
        tlsRequired: true,
      }),
    loggingRedactionBoundary: McpLoggingRedactionBoundarySchema.parse({
      ...base("McpLoggingRedactionBoundary"),
      forbiddenLogCategories: [...MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES],
      rawSensitiveLoggingAllowed: false,
      redactionRequired: true,
    }),
    noRealFinanceDataPublicDemoBoundary:
      McpNoRealFinanceDataPublicDemoBoundarySchema.parse({
        ...base("McpNoRealFinanceDataPublicDemoBoundary"),
        forbiddenExposureCategories: [
          ...MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
        ],
        noPrivateFinanceDataExposure: true,
        noPublicDemoData: true,
        noRawDumps: true,
        noRealFinanceData: true,
        noSourcePacks: true,
      }),
    noRemoteRuntimeBoundary: McpNoRemoteRuntimeBoundarySchema.parse({
      ...base("McpNoRemoteRuntimeBoundary"),
      localProofOnlyRuntimePosture: true,
      noDeploymentConfig: true,
      noExternalHostProvisioned: true,
      noRemoteRuntime: true,
    }),
    observabilityAuditCorrelationBoundary:
      McpObservabilityAuditCorrelationBoundarySchema.parse({
        ...base("McpObservabilityAuditCorrelationBoundary"),
        auditCorrelationRequired: true,
        correlationIdRequired: true,
        evidenceProofBoundaryPreserved: true,
        rawFinanceDataInTelemetryAllowed: false,
      }),
    oauthSecurityPrerequisiteBoundary:
      McpOauthSecurityPrerequisiteBoundarySchema.parse({
        ...base("McpOauthSecurityPrerequisiteBoundary"),
        fp0113PrerequisiteRequired: true,
        oauthSecurityContractsMustRemainVerified: true,
        publicExposureBlockedUntilAuthImplemented: true,
      }),
    originValidationBoundary: McpOriginValidationBoundarySchema.parse({
      ...base("McpOriginValidationBoundary"),
      dnsRebindingMitigationRequired: true,
      invalidOriginMustFailClosed: true,
      originValidationRequired: true,
      wildcardOriginTrustAllowed: false,
    }),
    proofContract: McpRemoteHostReadinessProofContractSchema.parse({
      ...base("McpRemoteHostReadinessProofContract"),
      contractOnly: true,
      fp0115Created: false,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noDbQueriesAdded: true,
      noExternalCommunications: true,
      noFinanceWrite: true,
      noModelCalls: true,
      noNewRoutePath: true,
      noOauthImplementation: true,
      noOpenAiApiCalls: true,
      noOpenAiClientOrKeyUsage: true,
      noPackageScriptsAdded: true,
      noProviderCalls: true,
      noPublicAssets: true,
      noRemoteMcpDeployment: true,
      noRouteBehaviorChange: true,
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenSessionImplementation: true,
      readOnly: true,
    }),
    rateLimitAbuseControlBoundary:
      McpRateLimitAbuseControlBoundarySchema.parse({
        ...base("McpRateLimitAbuseControlBoundary"),
        abuseControlsRequiredBeforeRemoteExposure: true,
        perIdentityLimitRequired: true,
        rateLimitsRequiredBeforeRemoteExposure: true,
        unauthenticatedPublicTrafficAllowed: false,
      }),
    remoteDeploymentDeferredBoundary:
      McpRemoteDeploymentDeferredBoundarySchema.parse({
        ...deferred("McpRemoteDeploymentDeferredBoundary"),
        currentLocalRouteExposeableAsIs: false,
        deploymentConfigAdded: false,
        publicHostConfigured: false,
        remoteServerStarted: false,
      }),
    remoteHostInventoryBoundary: McpRemoteHostInventoryBoundarySchema.parse({
      ...base("McpRemoteHostInventoryBoundary"),
      dnsHostTrustModelRequired: true,
      noRemoteRuntime: true,
      publicExposureInventoryRequired: true,
      stableHttpsHostRequirementRecorded: true,
    }),
    remoteMcpPathBoundary: McpRemoteMcpPathBoundarySchema.parse({
      ...base("McpRemoteMcpPathBoundary"),
      getMcpBehaviorChangeAllowed: false,
      newRoutePathAllowed: false,
      onlyFuturePublicMcpEndpointPath: MCP_REMOTE_HOST_CANONICAL_PATH,
      postMcpBehaviorChangeAllowed: false,
      routePathAdded: false,
    }),
    rollbackIncidentResponseBoundary:
      McpRollbackIncidentResponseBoundarySchema.parse({
        ...base("McpRollbackIncidentResponseBoundary"),
        exposureDisableControlRequired: true,
        incidentResponsePlanRequiredBeforeDeployment: true,
        remoteDeploymentAllowedWithoutRollback: false,
        rollbackPlanRequiredBeforeDeployment: true,
      }),
    streamableHttpTransportBoundary:
      McpStreamableHttpTransportBoundarySchema.parse({
        ...base("McpStreamableHttpTransportBoundary"),
        getCompatibilityRequired: true,
        postJsonRpcCompatibilityRequired: true,
        routeBehaviorChangeRequiredNow: false,
        singleEndpointPathRequired: true,
        sseOptionalButDeferred: true,
        streamableHttpCompatibilityRequired: true,
      }),
  };
}

function base(
  contractKind: z.infer<typeof McpRemoteHostReadinessContractKindSchema>,
) {
  return {
    contractKind,
    implementationAdded: false,
    localProofOnly: true,
    schemaVersion: MCP_REMOTE_HOST_READINESS_SCHEMA_VERSION,
  };
}

function deferred(
  contractKind: z.infer<typeof McpRemoteHostReadinessContractKindSchema>,
) {
  return {
    ...base(contractKind),
    deferred: true,
    implemented: false,
    requiresLaterFinancePlan: true,
  };
}
