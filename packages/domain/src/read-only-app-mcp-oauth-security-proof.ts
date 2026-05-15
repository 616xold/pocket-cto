import { buildMcpOauthSecurityContracts } from "./read-only-app-mcp-oauth-security-builders";
import {
  MCP_TOKEN_FAILURE_MODES,
  MCP_TOKEN_LEAKAGE_SURFACES,
} from "./read-only-app-mcp-oauth-security-contracts";
import { McpOauthSecurityProofSchema } from "./read-only-app-mcp-oauth-security-proof-schema";

export function buildMcpOauthSecurityProof(
  input: Partial<{
    noRouteBehaviorChange: boolean;
    noRemoteMcpDeployment: boolean;
    noOauthImplementation: boolean;
    noTokenSessionImplementation: boolean;
    noAuthMiddlewareImplementation: boolean;
    noAppsSdkResourceImplementation: boolean;
    noAppSubmission: boolean;
    noDbQueriesAdded: boolean;
    noSchemaMigrationsAdded: boolean;
    noPublicAssets: boolean;
    noOpenAiApiCalls: boolean;
    noModelCalls: boolean;
    noOpenAiClientOrKeyUsage: boolean;
    noProviderCalls: boolean;
    noExternalCommunications: boolean;
    noSourceMutation: boolean;
    noFinanceWrite: boolean;
    fp0113BoundaryVerified: boolean;
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified: boolean;
    fp0115Absent: boolean;
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: boolean;
    fp0111DefaultLocalDispatchWiringStillVerified: boolean;
    fp0110DefaultDispatchPlanBoundaryStillVerified: boolean;
    fp0109AdapterBoundaryStillVerified: boolean;
    fp0107RouteAdapterBoundaryStillVerified: boolean;
    fp0106ProtocolEnvelopeBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
  }> = {},
) {
  const contracts = buildMcpOauthSecurityContracts();
  const proof = contracts.proofContract;
  const oauth = contracts.oauthImplementationDeferredBoundary;
  const tokenSession = contracts.tokenSessionDeferredBoundary;
  const authMiddleware = contracts.authMiddlewareDeferredBoundary;
  const remote = contracts.remoteDeploymentDeferredBoundary;
  const identity = contracts.userIdentityBoundary;
  const consent = contracts.adminConsentBoundary;
  const orgRbac = contracts.orgRbacBoundary;
  const company = contracts.companyBindingBoundary;
  const selector = contracts.clientCompanyKeySelectorBoundary;
  const scopes = contracts.scopeMinimizationBoundary;
  const audience = contracts.tokenAudienceValidationBoundary;
  const passthrough = contracts.tokenPassthroughForbiddenBoundary;
  const failure = contracts.tokenFailureModeBoundary;
  const refresh = contracts.refreshTokenOfflineAccessBoundary;
  const storage = contracts.tokenStorageRedactionBoundary;
  const rotation = contracts.tokenRevocationRotationBoundary;
  const leakage = contracts.noTokenLeakageBoundary;
  const exposure = contracts.publicExposureBlockedBoundary;
  const financeData = contracts.noRealFinanceDataBoundary;

  return McpOauthSecurityProofSchema.parse({
    adminConsentBoundaryVerified:
      consent.adminOrgConsentReviewRequired &&
      consent.publicAppUsageRequiresApprovedOrg &&
      !consent.consentImplementationAdded,
    authMiddlewareDeferredBoundaryVerified:
      authMiddleware.deferred &&
      !authMiddleware.authMiddlewareAdded &&
      !authMiddleware.routeGuardAdded,
    clientCompanyKeySelectorBoundaryVerified:
      selector.requestedSelectorOnly &&
      !selector.selectorIsAuthority &&
      selector.mismatchFailsClosed &&
      selector.missingAuthenticatedBindingFailsClosed,
    companyBindingBoundaryVerified:
      company.authenticatedUserOrgMembershipRequired &&
      company.companyBindingDerivedServerSide &&
      !company.clientCompanyKeyAuthorityAllowed,
    failureModes: [...MCP_TOKEN_FAILURE_MODES],
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0109AdapterBoundaryStillVerified:
      input.fp0109AdapterBoundaryStillVerified ?? true,
    fp0110DefaultDispatchPlanBoundaryStillVerified:
      input.fp0110DefaultDispatchPlanBoundaryStillVerified ?? true,
    fp0111DefaultLocalDispatchWiringStillVerified:
      input.fp0111DefaultLocalDispatchWiringStillVerified ?? true,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified:
      input.fp0112RemotePublicOauthReadinessBoundaryStillVerified ?? true,
    fp0113BoundaryVerified: input.fp0113BoundaryVerified ?? true,
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
      input.fp0114AbsentOrLocalRemoteHostReadinessContractsVerified ?? true,
    fp0115Absent: input.fp0115Absent ?? true,
    localProofOnly: proof.localProofOnly,
    noAppSubmission: (input.noAppSubmission ?? true) && proof.noAppSubmission,
    noAppsSdkResourceImplementation:
      (input.noAppsSdkResourceImplementation ?? true) &&
      proof.noAppsSdkResourceImplementation,
    noAuthMiddlewareImplementation:
      (input.noAuthMiddlewareImplementation ?? true) &&
      proof.noAuthMiddlewareImplementation,
    noDbQueriesAdded:
      (input.noDbQueriesAdded ?? true) && proof.noDbQueriesAdded,
    noExternalCommunications:
      (input.noExternalCommunications ?? true) &&
      proof.noExternalCommunications,
    noFinanceWrite: (input.noFinanceWrite ?? true) && proof.noFinanceWrite,
    noModelCalls: (input.noModelCalls ?? true) && proof.noModelCalls,
    noOpenAiApiCalls:
      (input.noOpenAiApiCalls ?? true) && proof.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage:
      (input.noOpenAiClientOrKeyUsage ?? true) &&
      proof.noOpenAiClientOrKeyUsage,
    noOauthImplementation:
      (input.noOauthImplementation ?? true) && proof.noOauthImplementation,
    noProviderCalls: (input.noProviderCalls ?? true) && proof.noProviderCalls,
    noPublicAssets: (input.noPublicAssets ?? true) && proof.noPublicAssets,
    noRealFinanceDataBoundaryVerified:
      financeData.noRealFinanceData &&
      financeData.noPublicDemoData &&
      financeData.noRawDumps &&
      financeData.noSourcePacks &&
      financeData.noPrivateFinanceDataExposure,
    noRemoteMcpDeployment:
      (input.noRemoteMcpDeployment ?? true) && proof.noRemoteMcpDeployment,
    noRouteBehaviorChange:
      (input.noRouteBehaviorChange ?? true) && proof.noRouteBehaviorChange,
    noSchemaMigrationsAdded:
      (input.noSchemaMigrationsAdded ?? true) && proof.noSchemaMigrationsAdded,
    noSourceMutation:
      (input.noSourceMutation ?? true) && proof.noSourceMutation,
    noTokenLeakageBoundaryVerified:
      leakage.tokenValuesForbiddenEverywhere &&
      sameList(leakage.forbiddenSurfaces, MCP_TOKEN_LEAKAGE_SURFACES),
    noTokenLeakageSurfaces: [...MCP_TOKEN_LEAKAGE_SURFACES],
    noTokenSessionImplementation:
      (input.noTokenSessionImplementation ?? true) &&
      proof.noTokenSessionImplementation,
    oauthImplementationDeferredBoundaryVerified:
      oauth.deferred &&
      !oauth.authorizationFlowImplemented &&
      !oauth.callbackImplemented &&
      !oauth.tokenExchangeImplemented,
    oauthSecurityContractsVerified:
      proof.contractOnly && proof.readOnly && !proof.fp0114Created,
    orgRbacBoundaryVerified:
      orgRbac.readOnlyRbacRequired &&
      !orgRbac.dynamicToolsAllowed &&
      !orgRbac.writeActionToolsAllowed &&
      !orgRbac.providerActionToolsAllowed,
    publicExposureBlockedBoundaryVerified:
      exposure.publicExposureBlocked &&
      !exposure.localRouteExposeableAsIs &&
      !exposure.remotePublicAccessAllowed &&
      !exposure.routeBehaviorChangeAllowed,
    refreshTokenOfflineAccessBoundaryVerified:
      refresh.refreshTokenPolicyReviewRequired &&
      refresh.offlineAccessPolicyReviewRequired &&
      !refresh.refreshTokenStorageImplemented &&
      !refresh.offlineAccessGranted,
    remoteDeploymentDeferredBoundaryVerified:
      remote.deferred &&
      !remote.publicHostConfigured &&
      !remote.remoteServerStarted &&
      !remote.currentLocalRouteExposeableAsIs,
    schemaVersion: proof.schemaVersion,
    scopeMinimizationBoundaryVerified:
      scopes.exactScopesRequiredBeforeImplementation &&
      scopes.leastPrivilegeRequired &&
      !scopes.wildcardScopesAllowed,
    tokenAudienceValidationBoundaryVerified:
      audience.audienceValidationRequired &&
      audience.resourceValidationRequired &&
      !audience.tokenWithoutIntendedAudienceAccepted,
    tokenFailureModeBoundaryVerified:
      failure.failClosed &&
      sameList(failure.failureModes, MCP_TOKEN_FAILURE_MODES),
    tokenPassthroughForbiddenBoundaryVerified:
      passthrough.tokenPassthroughForbidden &&
      !passthrough.downstreamApiTokenForwardingAllowed &&
      !passthrough.unvalidatedClientTokenAccepted,
    tokenRevocationRotationBoundaryVerified:
      rotation.revocationPolicyRequired &&
      rotation.rotationPolicyRequired &&
      rotation.replayProtectionRequired &&
      !rotation.revocationImplemented &&
      !rotation.rotationImplemented &&
      !rotation.replayProtectionImplemented,
    tokenSessionDeferredBoundaryVerified:
      tokenSession.deferred &&
      !tokenSession.tokenStoreImplemented &&
      !tokenSession.sessionStoreImplemented &&
      !tokenSession.cookieSessionImplemented,
    tokenStorageRedactionBoundaryVerified:
      storage.tokenStorageContractOnly &&
      !storage.tokenStorageImplemented &&
      storage.redactionRequired &&
      !storage.rawTokenLoggingAllowed &&
      !storage.tokenInUiPropsAllowed &&
      !storage.tokenInMetadataAllowed,
    userIdentityBoundaryVerified:
      identity.authenticatedIdentityRequired &&
      !identity.anonymousCustomerEvidenceAllowed &&
      !identity.identityFromModelTextAllowed &&
      !identity.identityFromPromptTextAllowed &&
      !identity.identityFromClientMetadataAllowed,
  });
}

function sameList(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
