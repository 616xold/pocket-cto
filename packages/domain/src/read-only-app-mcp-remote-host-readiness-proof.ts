import { buildMcpRemoteHostReadinessContracts } from "./read-only-app-mcp-remote-host-readiness-builders";
import {
  MCP_REMOTE_HOST_CANONICAL_PATH,
  MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
  MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
} from "./read-only-app-mcp-remote-host-readiness-contracts";
import { McpRemoteHostReadinessProofSchema } from "./read-only-app-mcp-remote-host-readiness-proof-schema";

export function buildMcpRemoteHostReadinessProof(
  input: Partial<{
    noRouteBehaviorChange: boolean;
    noNewRoutePath: boolean;
    noRemoteMcpDeployment: boolean;
    noOauthImplementation: boolean;
    noTokenSessionImplementation: boolean;
    noAuthMiddlewareImplementation: boolean;
    noAppsSdkResourceImplementation: boolean;
    noAppSubmission: boolean;
    noDbQueriesAdded: boolean;
    noSchemaMigrationsAdded: boolean;
    noPackageScriptsAdded: boolean;
    noPublicAssets: boolean;
    noOpenAiApiCalls: boolean;
    noModelCalls: boolean;
    noOpenAiClientOrKeyUsage: boolean;
    noProviderCalls: boolean;
    noExternalCommunications: boolean;
    noSourceMutation: boolean;
    noFinanceWrite: boolean;
    fp0114BoundaryVerified: boolean;
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified: boolean;
    fp0115Absent: boolean;
    fp0113OauthSecurityBoundaryStillVerified: boolean;
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: boolean;
    fp0111DefaultLocalDispatchWiringStillVerified: boolean;
    fp0110DefaultDispatchPlanBoundaryStillVerified: boolean;
    fp0109AdapterBoundaryStillVerified: boolean;
    fp0108DispatchContractsStillVerified: boolean;
    fp0107RouteAdapterBoundaryStillVerified: boolean;
    fp0106ProtocolEnvelopeBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
  }> = {},
) {
  const contracts = buildMcpRemoteHostReadinessContracts();
  const proof = contracts.proofContract;
  const remote = contracts.remoteDeploymentDeferredBoundary;
  const inventory = contracts.remoteHostInventoryBoundary;
  const canonical = contracts.canonicalResourceUriBoundary;
  const path = contracts.remoteMcpPathBoundary;
  const httpsTls = contracts.httpsTlsFutureRequirementBoundary;
  const transport = contracts.streamableHttpTransportBoundary;
  const sse = contracts.getSseDeferredBoundary;
  const origin = contracts.originValidationBoundary;
  const cors = contracts.corsPolicyBoundary;
  const csp = contracts.cspResourcePolicyBoundary;
  const rateLimit = contracts.rateLimitAbuseControlBoundary;
  const logging = contracts.loggingRedactionBoundary;
  const observability = contracts.observabilityAuditCorrelationBoundary;
  const rollback = contracts.rollbackIncidentResponseBoundary;
  const health = contracts.healthReadinessDeferredBoundary;
  const financeData = contracts.noRealFinanceDataPublicDemoBoundary;
  const oauth = contracts.oauthSecurityPrerequisiteBoundary;
  const runtime = contracts.noRemoteRuntimeBoundary;

  const noRouteBehaviorChange =
    (input.noRouteBehaviorChange ?? true) && proof.noRouteBehaviorChange;
  const noNewRoutePath = (input.noNewRoutePath ?? true) && proof.noNewRoutePath;
  const noRemoteMcpDeployment =
    (input.noRemoteMcpDeployment ?? true) && proof.noRemoteMcpDeployment;
  const noOauthImplementation =
    (input.noOauthImplementation ?? true) && proof.noOauthImplementation;
  const noTokenSessionImplementation =
    (input.noTokenSessionImplementation ?? true) &&
    proof.noTokenSessionImplementation;
  const noAuthMiddlewareImplementation =
    (input.noAuthMiddlewareImplementation ?? true) &&
    proof.noAuthMiddlewareImplementation;
  const noAppsSdkResourceImplementation =
    (input.noAppsSdkResourceImplementation ?? true) &&
    proof.noAppsSdkResourceImplementation;
  const noAppSubmission =
    (input.noAppSubmission ?? true) && proof.noAppSubmission;
  const noDbQueriesAdded =
    (input.noDbQueriesAdded ?? true) && proof.noDbQueriesAdded;
  const noSchemaMigrationsAdded =
    (input.noSchemaMigrationsAdded ?? true) && proof.noSchemaMigrationsAdded;
  const noPackageScriptsAdded =
    (input.noPackageScriptsAdded ?? true) && proof.noPackageScriptsAdded;
  const noPublicAssets =
    (input.noPublicAssets ?? true) && proof.noPublicAssets;
  const noOpenAiApiCalls =
    (input.noOpenAiApiCalls ?? true) && proof.noOpenAiApiCalls;
  const noModelCalls = (input.noModelCalls ?? true) && proof.noModelCalls;
  const noOpenAiClientOrKeyUsage =
    (input.noOpenAiClientOrKeyUsage ?? true) &&
    proof.noOpenAiClientOrKeyUsage;
  const noProviderCalls =
    (input.noProviderCalls ?? true) && proof.noProviderCalls;
  const noExternalCommunications =
    (input.noExternalCommunications ?? true) &&
    proof.noExternalCommunications;
  const noSourceMutation =
    (input.noSourceMutation ?? true) && proof.noSourceMutation;
  const noFinanceWrite =
    (input.noFinanceWrite ?? true) && proof.noFinanceWrite;

  return McpRemoteHostReadinessProofSchema.parse({
    canonicalResourceUriBoundaryVerified:
      canonical.exactCanonicalResourceUriRequired &&
      !canonical.canonicalUriImplementationAdded &&
      !canonical.placeholdersAcceptedForRemoteImplementation &&
      canonical.httpsSchemeRequired &&
      !canonical.fragmentAllowed &&
      !canonical.queryStringAllowed,
    corsPolicyBoundaryVerified:
      cors.explicitCorsPolicyRequiredBeforeRemoteExposure &&
      !cors.wildcardOriginAllowed &&
      !cors.credentialsWithoutExplicitOriginAllowed &&
      cors.preflightPolicyRequired,
    cspResourcePolicyBoundaryVerified:
      csp.cspRequiredBeforeAppsSdkResources &&
      csp.resourceDomainAllowlistRequired &&
      csp.frameAncestorsPolicyRequired &&
      !csp.appsSdkResourceImplementationAdded,
    forbiddenExposureCategories: [
      ...MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
    ],
    forbiddenLogCategories: [...MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES],
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
    fp0110DefaultDispatchPlanBoundaryStillVerified:
      input.fp0110DefaultDispatchPlanBoundaryStillVerified ?? true,
    fp0111DefaultLocalDispatchWiringStillVerified:
      input.fp0111DefaultLocalDispatchWiringStillVerified ?? true,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified:
      input.fp0112RemotePublicOauthReadinessBoundaryStillVerified ?? true,
    fp0113OauthSecurityBoundaryStillVerified:
      input.fp0113OauthSecurityBoundaryStillVerified ?? true,
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
      input.fp0114AbsentOrLocalRemoteHostReadinessContractsVerified ?? true,
    fp0114BoundaryVerified: input.fp0114BoundaryVerified ?? true,
    fp0115Absent: input.fp0115Absent ?? true,
    getSseDeferredBoundaryVerified:
      sse.deferred &&
      !sse.getSseStreamingImplemented &&
      sse.getMcpStillSseUnavailable &&
      sse.futurePlanRequiredToOpenSse,
    healthReadinessDeferredBoundaryVerified:
      health.deferred &&
      !health.healthReadinessRouteAdded &&
      health.healthReadinessChecksFutureOnly &&
      health.noNewHealthRoute,
    httpsTlsFutureRequirementBoundaryVerified:
      httpsTls.stableHttpsHostRequired &&
      httpsTls.tlsRequired &&
      !httpsTls.plainHttpRemoteExposureAllowed &&
      httpsTls.localHttpOnlyAllowedForLocalDevelopment,
    localProofOnly: proof.localProofOnly,
    loggingRedactionBoundaryVerified:
      logging.redactionRequired &&
      !logging.rawSensitiveLoggingAllowed &&
      sameList(
        logging.forbiddenLogCategories,
        MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
      ),
    noAppSubmission,
    noAppSubmissionFromFp0114: noAppSubmission,
    noAppsSdkResourceFromFp0114: noAppsSdkResourceImplementation,
    noAppsSdkResourceImplementation,
    noAuthMiddlewareImplementation,
    noAuthMiddlewareImplementationFromFp0114: noAuthMiddlewareImplementation,
    noDbQueriesAdded,
    noDbQueriesFromFp0114: noDbQueriesAdded,
    noDeploymentConfigFromFp0114: runtime.noDeploymentConfig,
    noExternalCommunications,
    noFinanceWrite,
    noModelCalls,
    noNewRoutePath,
    noNewRoutePathFromFp0114: noNewRoutePath,
    noOauthImplementation,
    noOauthImplementationFromFp0114: noOauthImplementation,
    noOpenAiApiCalls,
    noOpenAiApiCallsFromFp0114: noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
    noPackageScriptsAdded,
    noPackageScriptsFromFp0114: noPackageScriptsAdded,
    noProviderCalls,
    noProviderExternalCallsFromFp0114:
      noProviderCalls && noExternalCommunications,
    noPublicAssets,
    noPublicAssetsSubmissionArtifactsFromFp0114:
      noPublicAssets && noAppSubmission,
    noRealFinanceDataPublicDemoBoundaryVerified:
      financeData.noRealFinanceData &&
      financeData.noPublicDemoData &&
      financeData.noRawDumps &&
      financeData.noSourcePacks &&
      financeData.noPrivateFinanceDataExposure &&
      sameList(
        financeData.forbiddenExposureCategories,
        MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
      ),
    noRemoteMcpDeployment,
    noRemoteMcpDeploymentFromFp0114: noRemoteMcpDeployment,
    noRemoteRuntimeBoundaryVerified:
      runtime.noRemoteRuntime &&
      runtime.noDeploymentConfig &&
      runtime.noExternalHostProvisioned &&
      runtime.localProofOnlyRuntimePosture,
    noRouteBehaviorChange,
    noRouteBehaviorChangeFromFp0114: noRouteBehaviorChange,
    noSchemaMigrationsAdded,
    noSchemaMigrationsFromFp0114: noSchemaMigrationsAdded,
    noSourceMutation,
    noSourceMutationFinanceWriteFromFp0114:
      noSourceMutation && noFinanceWrite,
    noTokenSessionImplementation,
    noTokenSessionImplementationFromFp0114: noTokenSessionImplementation,
    observabilityAuditCorrelationBoundaryVerified:
      observability.auditCorrelationRequired &&
      observability.correlationIdRequired &&
      observability.evidenceProofBoundaryPreserved &&
      !observability.rawFinanceDataInTelemetryAllowed,
    originValidationBoundaryVerified:
      origin.originValidationRequired &&
      origin.invalidOriginMustFailClosed &&
      origin.dnsRebindingMitigationRequired &&
      !origin.wildcardOriginTrustAllowed,
    oauthSecurityPrerequisiteBoundaryVerified:
      oauth.fp0113PrerequisiteRequired &&
      oauth.oauthSecurityContractsMustRemainVerified &&
      oauth.publicExposureBlockedUntilAuthImplemented,
    rateLimitAbuseControlBoundaryVerified:
      rateLimit.rateLimitsRequiredBeforeRemoteExposure &&
      rateLimit.abuseControlsRequiredBeforeRemoteExposure &&
      rateLimit.perIdentityLimitRequired &&
      !rateLimit.unauthenticatedPublicTrafficAllowed,
    remoteDeploymentDeferredBoundaryVerified:
      remote.deferred &&
      !remote.publicHostConfigured &&
      !remote.remoteServerStarted &&
      !remote.deploymentConfigAdded &&
      !remote.currentLocalRouteExposeableAsIs,
    remoteHostInventoryBoundaryVerified:
      inventory.publicExposureInventoryRequired &&
      inventory.stableHttpsHostRequirementRecorded &&
      inventory.dnsHostTrustModelRequired &&
      inventory.noRemoteRuntime,
    remoteHostReadinessContractsFoundationVerified:
      proof.contractOnly && proof.readOnly && !proof.fp0115Created,
    remoteHostReadinessContractsVerified:
      proof.contractOnly && proof.readOnly && !proof.fp0115Created,
    remoteMcpPathBoundaryVerified:
      path.onlyFuturePublicMcpEndpointPath === MCP_REMOTE_HOST_CANONICAL_PATH &&
      !path.routePathAdded &&
      !path.newRoutePathAllowed &&
      !path.getMcpBehaviorChangeAllowed &&
      !path.postMcpBehaviorChangeAllowed,
    rollbackIncidentResponseBoundaryVerified:
      rollback.rollbackPlanRequiredBeforeDeployment &&
      rollback.incidentResponsePlanRequiredBeforeDeployment &&
      rollback.exposureDisableControlRequired &&
      !rollback.remoteDeploymentAllowedWithoutRollback,
    schemaVersion: proof.schemaVersion,
    streamableHttpTransportBoundaryVerified:
      transport.streamableHttpCompatibilityRequired &&
      transport.postJsonRpcCompatibilityRequired &&
      transport.getCompatibilityRequired &&
      transport.singleEndpointPathRequired &&
      transport.sseOptionalButDeferred &&
      !transport.routeBehaviorChangeRequiredNow,
  });
}

function sameList(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
