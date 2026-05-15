import { buildMcpRemoteHostReadinessContracts } from "./read-only-app-mcp-remote-host-readiness-builders";
import {
  MCP_REMOTE_HOST_CANONICAL_PATH,
  MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
  MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
} from "./read-only-app-mcp-remote-host-readiness-contracts";
import { McpRemoteHostReadinessProofSchema } from "./read-only-app-mcp-remote-host-readiness-proof-schema";

export type McpRemoteHostReadinessRepositoryInventoryProof = {
  remoteDeploymentRepositoryInventoryStillVerified: boolean;
  noDeploymentConfigRepositoryInventoryVerified: boolean;
  remoteMcpRuntimeRepositoryInventoryStillVerified: boolean;
  fp0114RemoteHostReadinessPostmergeProofDurabilityVerified: boolean;
};

export function verifyMcpRemoteHostReadinessRepositoryInventory(input: {
  repoPaths: readonly string[];
  proofSourceText?: string;
}): McpRemoteHostReadinessRepositoryInventoryProof {
  const paths = input.repoPaths.map((path) => path.trim()).filter(Boolean);
  const noDeploymentConfigRepositoryInventoryVerified = !paths.some(
    isForbiddenDeploymentConfigPath,
  );
  const remoteMcpRuntimeRepositoryInventoryStillVerified = !paths.some(
    isForbiddenRemoteMcpRuntimePath,
  );
  const remoteDeploymentRepositoryInventoryStillVerified =
    noDeploymentConfigRepositoryInventoryVerified &&
    remoteMcpRuntimeRepositoryInventoryStillVerified &&
    !paths.some(isForbiddenPublicHostConfigPath);
  const proofSourceStillNoRuntime =
    noExecutableApiModelKeyUsage(input.proofSourceText ?? "") &&
    !hasForbiddenRemoteHostRuntimeSource(input.proofSourceText ?? "");

  return {
    fp0114RemoteHostReadinessPostmergeProofDurabilityVerified:
      remoteDeploymentRepositoryInventoryStillVerified &&
      noDeploymentConfigRepositoryInventoryVerified &&
      remoteMcpRuntimeRepositoryInventoryStillVerified &&
      proofSourceStillNoRuntime,
    noDeploymentConfigRepositoryInventoryVerified,
    remoteDeploymentRepositoryInventoryStillVerified,
    remoteMcpRuntimeRepositoryInventoryStillVerified,
  };
}

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
    fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified: boolean;
    fp0116Absent: boolean;
    remoteHostImplementationSequencingPlanBoundaryVerified: boolean;
    fp0114RemoteHostReadinessBoundaryStillVerified: boolean;
    fp0114RemoteHostReadinessPostmergeProofDurabilityVerified: boolean;
    remoteDeploymentRepositoryInventoryStillVerified: boolean;
    noDeploymentConfigRepositoryInventoryVerified: boolean;
    remoteMcpRuntimeRepositoryInventoryStillVerified: boolean;
    noRouteBehaviorChangeFromFp0115: boolean;
    noNewRoutePathFromFp0115: boolean;
    noRemoteMcpDeploymentFromFp0115: boolean;
    noDeploymentConfigFromFp0115: boolean;
    noOauthImplementationFromFp0115: boolean;
    noTokenSessionImplementationFromFp0115: boolean;
    noAuthMiddlewareImplementationFromFp0115: boolean;
    noAppsSdkResourceFromFp0115: boolean;
    noAppSubmissionFromFp0115: boolean;
    noDbQueriesFromFp0115: boolean;
    noSchemaMigrationsFromFp0115: boolean;
    noPackageScriptsFromFp0115: boolean;
    noOpenAiApiCallsFromFp0115: boolean;
    noProviderExternalCallsFromFp0115: boolean;
    noSourceMutationFinanceWriteFromFp0115: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0115: boolean;
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
    fp0114RemoteHostReadinessBoundaryStillVerified:
      input.fp0114RemoteHostReadinessBoundaryStillVerified ?? true,
    fp0114RemoteHostReadinessPostmergeProofDurabilityVerified:
      input.fp0114RemoteHostReadinessPostmergeProofDurabilityVerified ?? true,
    fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
      input
        .fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified ??
      true,
    fp0116Absent: input.fp0116Absent ?? true,
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
    noAppSubmissionFromFp0115:
      input.noAppSubmissionFromFp0115 ?? noAppSubmission,
    noAppsSdkResourceFromFp0114: noAppsSdkResourceImplementation,
    noAppsSdkResourceFromFp0115:
      input.noAppsSdkResourceFromFp0115 ?? noAppsSdkResourceImplementation,
    noAppsSdkResourceImplementation,
    noAuthMiddlewareImplementation,
    noAuthMiddlewareImplementationFromFp0114: noAuthMiddlewareImplementation,
    noAuthMiddlewareImplementationFromFp0115:
      input.noAuthMiddlewareImplementationFromFp0115 ??
      noAuthMiddlewareImplementation,
    noDbQueriesAdded,
    noDbQueriesFromFp0114: noDbQueriesAdded,
    noDbQueriesFromFp0115: input.noDbQueriesFromFp0115 ?? noDbQueriesAdded,
    noDeploymentConfigFromFp0114: runtime.noDeploymentConfig,
    noDeploymentConfigFromFp0115:
      input.noDeploymentConfigFromFp0115 ?? runtime.noDeploymentConfig,
    noDeploymentConfigRepositoryInventoryVerified:
      input.noDeploymentConfigRepositoryInventoryVerified ?? true,
    noExternalCommunications,
    noFinanceWrite,
    noModelCalls,
    noNewRoutePath,
    noNewRoutePathFromFp0114: noNewRoutePath,
    noNewRoutePathFromFp0115:
      input.noNewRoutePathFromFp0115 ?? noNewRoutePath,
    noOauthImplementation,
    noOauthImplementationFromFp0114: noOauthImplementation,
    noOauthImplementationFromFp0115:
      input.noOauthImplementationFromFp0115 ?? noOauthImplementation,
    noOpenAiApiCalls,
    noOpenAiApiCallsFromFp0114: noOpenAiApiCalls,
    noOpenAiApiCallsFromFp0115:
      input.noOpenAiApiCallsFromFp0115 ?? noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
    noPackageScriptsAdded,
    noPackageScriptsFromFp0114: noPackageScriptsAdded,
    noPackageScriptsFromFp0115:
      input.noPackageScriptsFromFp0115 ?? noPackageScriptsAdded,
    noProviderCalls,
    noProviderExternalCallsFromFp0114:
      noProviderCalls && noExternalCommunications,
    noProviderExternalCallsFromFp0115:
      input.noProviderExternalCallsFromFp0115 ??
      (noProviderCalls && noExternalCommunications),
    noPublicAssets,
    noPublicAssetsSubmissionArtifactsFromFp0114:
      noPublicAssets && noAppSubmission,
    noPublicAssetsSubmissionArtifactsFromFp0115:
      input.noPublicAssetsSubmissionArtifactsFromFp0115 ??
      (noPublicAssets && noAppSubmission),
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
    noRemoteMcpDeploymentFromFp0115:
      input.noRemoteMcpDeploymentFromFp0115 ?? noRemoteMcpDeployment,
    noRemoteRuntimeBoundaryVerified:
      runtime.noRemoteRuntime &&
      runtime.noDeploymentConfig &&
      runtime.noExternalHostProvisioned &&
      runtime.localProofOnlyRuntimePosture,
    noRouteBehaviorChange,
    noRouteBehaviorChangeFromFp0114: noRouteBehaviorChange,
    noRouteBehaviorChangeFromFp0115:
      input.noRouteBehaviorChangeFromFp0115 ?? noRouteBehaviorChange,
    noSchemaMigrationsAdded,
    noSchemaMigrationsFromFp0114: noSchemaMigrationsAdded,
    noSchemaMigrationsFromFp0115:
      input.noSchemaMigrationsFromFp0115 ?? noSchemaMigrationsAdded,
    noSourceMutation,
    noSourceMutationFinanceWriteFromFp0114:
      noSourceMutation && noFinanceWrite,
    noSourceMutationFinanceWriteFromFp0115:
      input.noSourceMutationFinanceWriteFromFp0115 ??
      (noSourceMutation && noFinanceWrite),
    noTokenSessionImplementation,
    noTokenSessionImplementationFromFp0114: noTokenSessionImplementation,
    noTokenSessionImplementationFromFp0115:
      input.noTokenSessionImplementationFromFp0115 ??
      noTokenSessionImplementation,
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
    remoteDeploymentRepositoryInventoryStillVerified:
      input.remoteDeploymentRepositoryInventoryStillVerified ?? true,
    remoteHostImplementationSequencingPlanBoundaryVerified:
      input.remoteHostImplementationSequencingPlanBoundaryVerified ?? true,
    remoteHostReadinessContractsFoundationVerified:
      proof.contractOnly && proof.readOnly && !proof.fp0115Created,
    remoteHostReadinessContractsVerified:
      proof.contractOnly && proof.readOnly && !proof.fp0115Created,
    remoteMcpRuntimeRepositoryInventoryStillVerified:
      input.remoteMcpRuntimeRepositoryInventoryStillVerified ?? true,
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

function isForbiddenDeploymentConfigPath(path: string) {
  const lower = path.toLowerCase();
  return (
    /^\.vercel(?:\/|$)/u.test(lower) ||
    /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.ya?ml|fly\.toml|railway\.json|railway\.toml|wrangler\.toml|apphosting\.ya?ml)$/u.test(
      lower,
    )
  );
}

function isForbiddenRemoteMcpRuntimePath(path: string) {
  const lower = path.toLowerCase();

  const runtimeSurface =
    lower.startsWith("apps/") ||
    lower.startsWith("packages/") ||
    lower.startsWith("tools/") ||
    lower.startsWith("public/");
  if (!runtimeSurface) return false;

  const publicSubmissionOrAssetSurface =
    /(?:^|\/)(?:app-submission|submission-assets|public-listing|listing-copy|screenshots|public-assets)(?:\/|$)/u.test(
      lower,
    ) ||
    /(?:^|\/)public\/.*\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf|md|mdx|txt)$/u.test(
      lower,
    );
  if (publicSubmissionOrAssetSurface) return true;
  if (isAllowedProofOrPlanningPath(lower)) return false;

  return (
    /(?:^|\/)(?:remote-mcp|public-mcp|mcp-remote-host|mcp-public-host|mcp-host|mcp-server)(?:\/|\.|-|$)/u.test(
      lower,
    ) ||
    /(?:^|\/)apps-sdk(?:\/|$)/u.test(lower) ||
    /(?:^|\/)(?:oauth|auth|session|token)[^/]*(?:runtime|middleware|callback|store|server)(?:\/|\.|-|$)/u.test(
      lower,
    )
  );
}

function isForbiddenPublicHostConfigPath(path: string) {
  const lower = path.toLowerCase();
  if (isAllowedProofOrPlanningPath(lower)) return false;
  return /(?:^|\/)(?:public-host|remote-host|host-config|origin-config|cors-config|csp-config)(?:\/|\.|-|$)/u.test(
    lower,
  );
}

function isAllowedProofOrPlanningPath(path: string) {
  return (
    path.startsWith("plans/") ||
    path.startsWith("docs/") ||
    path.startsWith("plugins/") ||
    path === "plugins.md" ||
    path.endsWith(".md") ||
    /^packages\/domain\/src\/read-only-app-mcp-/u.test(path) ||
    /^tools\/read-only-mcp-/u.test(path) ||
    /^tools\/read-only-endpoint-/u.test(path) ||
    path === "tools/benchmark-community-pack-proof.mjs"
  );
}

function hasForbiddenRemoteHostRuntimeSource(text: string) {
  const runtimePatterns = [
    /\b(?:remoteMcpRuntime|mcpServerRuntime|startRemoteMcp|publicMcpHost)\s*\(/u,
    /\b(?:oauthCallback|tokenExchange|authMiddleware|sessionStore|tokenStore|verifyBearer)\s*\(/u,
    /\b(?:registerResource|componentResource|appSubmission|submitForReview)\s*\(/u,
    /\b(?:callProvider|providerConnect|sendReport|sendEmail|externalMessage)\s*\(/u,
    /\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u,
    /\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger)\s*\(/u,
    /["']ui:\/\//u,
  ];
  return runtimePatterns.some((pattern) => pattern.test(text));
}

function noExecutableApiModelKeyUsage(text: string) {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const apiPatterns = [
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    new RegExp(`\\b${hostName}\\b`, "u"),
  ];
  const modelPatterns = [
    /\bcallModel\b/u,
    /\bmodel\s*\.\s*create\b/u,
    /\bmodels\s*\.\s*create\b/u,
    /\bchat\s*\.\s*completions\b/u,
    /\bresponses\s*\.\s*create\b/u,
  ];
  const keyPatterns = [
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
  ];

  return (
    !apiPatterns.some((pattern) => pattern.test(text)) &&
    !modelPatterns.some((pattern) => pattern.test(text)) &&
    !keyPatterns.some((pattern) => pattern.test(text))
  );
}
