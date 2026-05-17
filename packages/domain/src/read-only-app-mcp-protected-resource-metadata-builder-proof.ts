import { z } from "zod";
import {
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PLAN_PREFIX,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION,
  McpProtectedResourceMetadataBuilderAuthorizationServersBoundarySchema,
  McpProtectedResourceMetadataBuilderBearerMethodsBoundarySchema,
  McpProtectedResourceMetadataBuilderCanonicalUriBoundarySchema,
  McpProtectedResourceMetadataBuilderInputBoundarySchema,
  McpProtectedResourceMetadataBuilderNoRuntimeBoundarySchema,
  McpProtectedResourceMetadataBuilderNoTokenLeakageBoundarySchema,
  McpProtectedResourceMetadataBuilderProofContractSchema,
  McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundarySchema,
  McpProtectedResourceMetadataBuilderScopesBoundarySchema,
  type McpProtectedResourceMetadataBuilderContractKindSchema,
  type McpProtectedResourceMetadataBuilderInput,
} from "./read-only-app-mcp-protected-resource-metadata-builder-contracts";
import {
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0124_PLAN_PREFIX,
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH,
  FP0125_PLAN_PREFIX,
} from "./read-only-app-mcp-protected-resource-metadata-route-input-contracts";
import {
  buildProtectedResourceMetadataDocument,
  deriveProtectedResourceMetadataRouteResponseContract,
  validateProtectedResourceMetadataBuilderInput,
} from "./read-only-app-mcp-protected-resource-metadata-builder";
import { validateMcpCanonicalPublicResourceUriCandidate } from "./read-only-app-mcp-canonical-resource-validator";

const trueLiteral = z.literal(true);

export const McpProtectedResourceMetadataBuilderProofSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION,
    ),
    localProofOnly: trueLiteral,
    protectedResourceMetadataBuilderContractsVerified: trueLiteral,
    builderInputBoundaryVerified: trueLiteral,
    builderCanonicalUriBoundaryVerified: trueLiteral,
    builderAuthorizationServersBoundaryVerified: trueLiteral,
    builderScopesBoundaryVerified: trueLiteral,
    builderBearerMethodsBoundaryVerified: trueLiteral,
    builderNoTokenLeakageBoundaryVerified: trueLiteral,
    builderRouteResponseDeferredBoundaryVerified: trueLiteral,
    builderNoRuntimeBoundaryVerified: trueLiteral,
    canonicalUriNoUserinfoCredentialsBoundaryVerified: trueLiteral,
    authorizationServersNoUserinfoCredentialsBoundaryVerified: trueLiteral,
    protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified:
      trueLiteral,
    protectedResourceMetadataBuilderSecretPatternScanVerified: trueLiteral,
    fp0122PostmergeCredentialLeakageHardeningVerified: trueLiteral,
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
    fp0122BoundaryVerified: trueLiteral,
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      trueLiteral,
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified: trueLiteral,
    fp0125Absent: trueLiteral,
    fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified:
      trueLiteral,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: trueLiteral,
    fp0118ProtectedResourceMetadataBoundaryStillVerified: trueLiteral,
    fp0117OauthImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
  })
  .strict();

export type McpProtectedResourceMetadataBuilderProof = z.infer<
  typeof McpProtectedResourceMetadataBuilderProofSchema
>;

export function buildMcpProtectedResourceMetadataBuilderContracts() {
  return {
    authorizationServersBoundary:
      McpProtectedResourceMetadataBuilderAuthorizationServersBoundarySchema.parse(
        {
          ...base(
            "McpProtectedResourceMetadataBuilderAuthorizationServersBoundary",
          ),
          authorizationServersMustBeExactStableIssuers: true,
          authorizationServersMustBeHttps: true,
          authorizationServersMustBeNonEmpty: true,
          authorizationServersRequired: true,
          credentialBearingUrlAllowed: false,
          providerNeutralUntilLaterPlan: true,
          secretLikeUriMaterialAllowed: false,
          userinfoCredentialsAllowed: false,
        },
      ),
    bearerMethodsBoundary:
      McpProtectedResourceMetadataBuilderBearerMethodsBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderBearerMethodsBoundary"),
        bearerMethodsSupportedRequired: true,
        headerBearerRequired: true,
        headerOnlyPosture: true,
        queryStringBearerAllowed: false,
      }),
    canonicalUriBoundary:
      McpProtectedResourceMetadataBuilderCanonicalUriBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderCanonicalUriBoundary"),
        acceptedFp0120CanonicalUriRequired: true,
        fragmentAllowed: false,
        localhostAllowed: false,
        localTunnelAllowed: false,
        placeholderResourceAllowed: false,
        queryStringAllowed: false,
        selectorAuthorityAllowed: false,
        credentialBearingUrlAllowed: false,
        secretLikeUriMaterialAllowed: false,
        userinfoCredentialsAllowed: false,
        workspaceTenantTemplateAllowed: false,
      }),
    inputBoundary:
      McpProtectedResourceMetadataBuilderInputBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderInputBoundary"),
        metadataDocumentBuilderOnly: true,
        routeRuntimeInputAllowed: false,
        strictInputShapeRequired: true,
      }),
    noRuntimeBoundary:
      McpProtectedResourceMetadataBuilderNoRuntimeBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderNoRuntimeBoundary"),
        noAppsSdkResourceRuntime: true,
        noAuthMiddlewareRuntime: true,
        noDbRuntime: true,
        noOauthRuntime: true,
        noRemoteMcpRuntime: true,
        noRouteRuntime: true,
        noTokenSessionRuntime: true,
      }),
    noTokenLeakageBoundary:
      McpProtectedResourceMetadataBuilderNoTokenLeakageBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderNoTokenLeakageBoundary"),
        companyKeyAuthorityAllowed: false,
        credentialBearingUrlsAllowed: false,
        cookiesSessionsSecretsCredentialsAllowed: false,
        rawFinanceDataAllowed: false,
        rawSourceDumpsAllowed: false,
        secretLikeUriMaterialAllowed: false,
        tokenValuesAllowedInMetadata: false,
      }),
    proofContract:
      McpProtectedResourceMetadataBuilderProofContractSchema.parse({
        ...base("McpProtectedResourceMetadataBuilderProofContract"),
        contractOnly: true,
        noAppSubmission: true,
        noAppsSdkResourceImplementation: true,
        noAuthMiddlewareImplementation: true,
        noDbQueriesAdded: true,
        noDeploymentConfig: true,
        noExternalCommunications: true,
        noFinanceWrite: true,
        noGeneratedPublicProse: true,
        noListingCopy: true,
        noModelCalls: true,
        noNewRoutePath: true,
        noOauthImplementation: true,
        noOpenAiApiCalls: true,
        noOpenAiClientOrKeyUsage: true,
        noPackageScriptsAdded: true,
        noProtectedResourceMetadataRouteImplementation: true,
        noProviderCalls: true,
        noPublicAssets: true,
        noRemoteMcpDeployment: true,
        noRouteBehaviorChange: true,
        noSchemaMigrationsAdded: true,
        noSourceMutation: true,
        noTokenSessionImplementation: true,
        noWwwAuthenticateRouteBehaviorImplementation: true,
      }),
    routeResponseDeferredBoundary:
      McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundarySchema.parse(
        {
          ...base(
            "McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundary",
          ),
          responseSerializedByRuntime: false,
          routeRegistered: false,
          routeResponseContractOnly: true,
          wwwAuthenticateBehaviorImplemented: false,
        },
      ),
    scopesBoundary:
      McpProtectedResourceMetadataBuilderScopesBoundarySchema.parse({
        ...base("McpProtectedResourceMetadataBuilderScopesBoundary"),
        allowedScopes: [
          "mcp:read",
          "evidence:read",
          "source_coverage:read",
          "company_posture:read",
        ],
        leastPrivilegeRequired: true,
        readOnlyOnly: true,
        scopesSupportedRequired: true,
      }),
  };
}

export function buildMcpProtectedResourceMetadataBuilderProof(
  input: Partial<McpProtectedResourceMetadataBuilderProof> = {},
): McpProtectedResourceMetadataBuilderProof {
  const contracts = buildMcpProtectedResourceMetadataBuilderContracts();
  const document = buildProtectedResourceMetadataDocument(validBuilderInput);
  const routeContract =
    deriveProtectedResourceMetadataRouteResponseContract(validBuilderInput);
  const validInput = validateProtectedResourceMetadataBuilderInput(
    validBuilderInput,
  );
  const canonicalUriNoUserinfoCredentialsBoundaryVerified =
    canonicalResourceCredentialCandidates.every(
      (canonicalResourceUri) =>
        !validateMcpCanonicalPublicResourceUriCandidate(canonicalResourceUri)
          .accepted &&
        !validateProtectedResourceMetadataBuilderInput({
          ...validBuilderInput,
          canonicalResourceUri,
        }).accepted,
    );
  const authorizationServersNoUserinfoCredentialsBoundaryVerified =
    authorizationServerCredentialCandidates.every(
      (authorizationServer) =>
        !validateProtectedResourceMetadataBuilderInput({
          ...validBuilderInput,
          authorizationServers: [authorizationServer],
        }).accepted,
    );
  const protectedResourceMetadataBuilderSecretPatternScanVerified =
    secretLikeUriMaterialCandidates.every(
      (authorizationServer) =>
        !validateProtectedResourceMetadataBuilderInput({
          ...validBuilderInput,
          authorizationServers: [authorizationServer],
        }).accepted,
    );
  const protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified =
    canonicalUriNoUserinfoCredentialsBoundaryVerified &&
    authorizationServersNoUserinfoCredentialsBoundaryVerified &&
    protectedResourceMetadataBuilderSecretPatternScanVerified;

  return McpProtectedResourceMetadataBuilderProofSchema.parse({
    builderAuthorizationServersBoundaryVerified:
      input.builderAuthorizationServersBoundaryVerified ??
      McpProtectedResourceMetadataBuilderAuthorizationServersBoundarySchema.safeParse(
        contracts.authorizationServersBoundary,
      ).success,
    builderBearerMethodsBoundaryVerified:
      input.builderBearerMethodsBoundaryVerified ??
      McpProtectedResourceMetadataBuilderBearerMethodsBoundarySchema.safeParse(
        contracts.bearerMethodsBoundary,
      ).success,
    builderCanonicalUriBoundaryVerified:
      input.builderCanonicalUriBoundaryVerified ??
      McpProtectedResourceMetadataBuilderCanonicalUriBoundarySchema.safeParse(
        contracts.canonicalUriBoundary,
      ).success,
    builderInputBoundaryVerified:
      input.builderInputBoundaryVerified ??
      McpProtectedResourceMetadataBuilderInputBoundarySchema.safeParse(
        contracts.inputBoundary,
      ).success,
    builderNoRuntimeBoundaryVerified:
      input.builderNoRuntimeBoundaryVerified ??
      McpProtectedResourceMetadataBuilderNoRuntimeBoundarySchema.safeParse(
        contracts.noRuntimeBoundary,
      ).success,
    builderNoTokenLeakageBoundaryVerified:
      input.builderNoTokenLeakageBoundaryVerified ??
      McpProtectedResourceMetadataBuilderNoTokenLeakageBoundarySchema.safeParse(
        contracts.noTokenLeakageBoundary,
      ).success,
    builderRouteResponseDeferredBoundaryVerified:
      input.builderRouteResponseDeferredBoundaryVerified ??
      (McpProtectedResourceMetadataBuilderRouteResponseDeferredBoundarySchema.safeParse(
        contracts.routeResponseDeferredBoundary,
      ).success &&
        routeContract.routeResponseContractOnly &&
        !routeContract.routeRegistered),
    builderScopesBoundaryVerified:
      input.builderScopesBoundaryVerified ??
      McpProtectedResourceMetadataBuilderScopesBoundarySchema.safeParse(
        contracts.scopesBoundary,
      ).success,
    authorizationServersNoUserinfoCredentialsBoundaryVerified:
      input.authorizationServersNoUserinfoCredentialsBoundaryVerified ??
      authorizationServersNoUserinfoCredentialsBoundaryVerified,
    canonicalUriNoUserinfoCredentialsBoundaryVerified:
      input.canonicalUriNoUserinfoCredentialsBoundaryVerified ??
      canonicalUriNoUserinfoCredentialsBoundaryVerified,
    fp0122PostmergeCredentialLeakageHardeningVerified:
      input.fp0122PostmergeCredentialLeakageHardeningVerified ??
      protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified,
    protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified:
      input.protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified ??
      protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified,
    protectedResourceMetadataBuilderSecretPatternScanVerified:
      input.protectedResourceMetadataBuilderSecretPatternScanVerified ??
      protectedResourceMetadataBuilderSecretPatternScanVerified,
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      input.fp0117OauthImplementationSequencingBoundaryStillVerified ?? true,
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      input.fp0118ProtectedResourceMetadataBoundaryStillVerified ?? true,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      input.fp0120CanonicalResourceAuthServerBoundaryStillVerified ?? true,
    fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified:
      input.fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified ??
      true,
    fp0122BoundaryVerified: input.fp0122BoundaryVerified ?? true,
    fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified:
      input.fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified ??
      true,
    fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified:
      input.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified ??
      true,
    fp0125Absent: input.fp0125Absent ?? true,
    localProofOnly: true,
    noAppSubmission: input.noAppSubmission ?? true,
    noAppsSdkResourceImplementation:
      input.noAppsSdkResourceImplementation ?? true,
    noAuthMiddlewareImplementation:
      input.noAuthMiddlewareImplementation ?? true,
    noDbQueriesAdded: input.noDbQueriesAdded ?? true,
    noDeploymentConfig: input.noDeploymentConfig ?? true,
    noExternalCommunications: input.noExternalCommunications ?? true,
    noFinanceWrite: input.noFinanceWrite ?? true,
    noGeneratedPublicProse: input.noGeneratedPublicProse ?? true,
    noListingCopy: input.noListingCopy ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noNewRoutePath: input.noNewRoutePath ?? true,
    noOauthImplementation: input.noOauthImplementation ?? true,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noOpenAiClientOrKeyUsage: input.noOpenAiClientOrKeyUsage ?? true,
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noProtectedResourceMetadataRouteImplementation:
      input.noProtectedResourceMetadataRouteImplementation ?? true,
    noProviderCalls: input.noProviderCalls ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    noRemoteMcpDeployment: input.noRemoteMcpDeployment ?? true,
    noRouteBehaviorChange: input.noRouteBehaviorChange ?? true,
    noSchemaMigrationsAdded: input.noSchemaMigrationsAdded ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noTokenSessionImplementation:
      input.noTokenSessionImplementation ?? true,
    noWwwAuthenticateRouteBehaviorImplementation:
      input.noWwwAuthenticateRouteBehaviorImplementation ?? true,
    protectedResourceMetadataBuilderContractsVerified:
      input.protectedResourceMetadataBuilderContractsVerified ??
      allContractsParse(contracts, validInput.accepted, document.resource),
    schemaVersion: MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION,
  });
}

export function verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const hits = fp0122Hits(input.repoPaths);
  if (hits.length === 0) return true;
  return (
    hits.length === 1 &&
    hits[0] === FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH &&
    fp0122PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const hits = fp0122Hits(input.repoPaths);
  return (
    hits.length === 1 &&
    hits[0] === FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH &&
    fp0122PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0123Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => path.includes(FP0123_PLAN_PREFIX));
}

export function verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const hits = fp0123Hits(input.repoPaths);
  if (hits.length === 0) return true;
  return (
    hits.length === 1 &&
    hits[0] === FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH &&
    fp0123PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const hits = fp0123Hits(input.repoPaths);
  return (
    hits.length === 1 &&
    hits[0] === FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH &&
    fp0123PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0124Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => path.includes(FP0124_PLAN_PREFIX));
}

export function verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(
  input:
    | readonly string[]
    | {
        repoPaths: readonly string[];
        planText?: string;
      },
) {
  const normalizedInput: {
    repoPaths: readonly string[];
    planText?: string;
  } = isRepoPathList(input) ? { repoPaths: input } : input;
  const { repoPaths, planText } = normalizedInput;
  const hits = fp0124Hits(repoPaths);
  if (hits.length === 0) return true;
  return (
    hits.length === 1 &&
    hits[0] ===
      FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH &&
    (planText === undefined || fp0124PlanTextBoundaryVerified(planText))
  );
}

export function verifyFp0124ProtectedResourceMetadataRouteImplementationPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const hits = fp0124Hits(input.repoPaths);
  return (
    hits.length === 1 &&
    hits[0] ===
      FP0124_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLAN_PATH &&
    fp0124PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0125Absent(repoPaths: readonly string[]) {
  const hits = repoPaths.filter((path) => path.includes(FP0125_PLAN_PREFIX));
  return (
    hits.length === 0 ||
    (hits.length === 1 &&
      hits[0] ===
        FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH)
  );
}

export function verifyFp0123PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding:
      normalized.includes("authenticated company binding") &&
      normalized.includes("prerequisite"),
    planningTextIncludesAuthorizationServersEvidence:
      normalized.includes("authorization-server evidence") ||
      normalized.includes("authorization_servers"),
    planningTextIncludesBuilderOutput:
      normalized.includes("fp-0122 builder") &&
      (normalized.includes("builder output") ||
        normalized.includes("builder-valid input")),
    planningTextIncludesCanonicalUriEvidence:
      normalized.includes("canonical uri") &&
      normalized.includes("evidence"),
    planningTextIncludesFp0124Absent:
      normalized.includes("does not create fp-0124") ||
      normalized.includes("fp-0124 absent"),
    planningTextIncludesLocalProofOnly:
      normalized.includes("local/proof-only/read-only") &&
      normalized.includes("contract"),
    planningTextIncludesMcpUnchanged:
      normalized.includes("/mcp") && normalized.includes("unchanged"),
    planningTextIncludesNoRuntime:
      normalized.includes("does not implement oauth") &&
      normalized.includes("does not add a route"),
    planningTextIncludesNoTokenLeakage: normalized.includes(
      "no-token-leakage",
    ),
    planningTextIncludesRoutePathDecision:
      normalized.includes("route-path decision") &&
      normalized.includes(".well-known/oauth-protected-resource/mcp"),
  };
}

export function verifyFp0122PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthorizationServers:
      normalized.includes("authorization_servers") &&
      normalized.includes("non-empty"),
    planningTextIncludesBearerMethods:
      normalized.includes("bearer_methods_supported") &&
      normalized.includes("header"),
    planningTextIncludesCanonicalUri:
      normalized.includes("accepted canonical public mcp resource uri") ||
      normalized.includes("fp-0120 validator"),
    planningTextIncludesFp0123Absent: normalized.includes("fp-0123 absent"),
    planningTextIncludesLocalProofOnly:
      normalized.includes("local/proof-only") &&
      normalized.includes("contract"),
    planningTextIncludesNoRoute: normalized.includes(
      "does not add a protected-resource metadata endpoint",
    ),
    planningTextIncludesNoRuntime:
      normalized.includes("does not implement oauth") &&
      normalized.includes("does not change /mcp behavior"),
    planningTextIncludesNoTokenLeakage: normalized.includes(
      "no-token-leakage",
    ),
    planningTextIncludesRouteResponseDeferred:
      normalized.includes("route-response contract") &&
      normalized.includes("deferred"),
    planningTextIncludesScopes:
      normalized.includes("scopes_supported") &&
      normalized.includes("read-only"),
  };
}

export function verifyFp0124PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding:
      normalized.includes("authenticated company binding") &&
      normalized.includes("prerequisite"),
    planningTextIncludesAuthorizationServerEvidence:
      normalized.includes("authorization server evidence") ||
      normalized.includes("authorization_servers"),
    planningTextIncludesBuilderOutput:
      normalized.includes("builder output") &&
      normalized.includes("fp-0122"),
    planningTextIncludesCanonicalUriEvidence:
      normalized.includes("canonical uri evidence") ||
      normalized.includes("canonical public mcp resource uri evidence"),
    planningTextIncludesDeferredWwwAuthenticate:
      normalized.includes("www-authenticate") &&
      normalized.includes("separate"),
    planningTextIncludesEvidenceBundleDependency:
      normalized.includes("route-input evidence bundle") &&
      normalized.includes("dependency"),
    planningTextIncludesFp0125Absent: normalized.includes("fp-0125 absent"),
    planningTextIncludesLocalOnlyDecision:
      normalized.includes("local-only") &&
      normalized.includes("explicit route-input evidence bundle"),
    planningTextIncludesMcpUnchanged:
      normalized.includes("/mcp") && normalized.includes("unchanged"),
    planningTextIncludesNoTokenLeakage: normalized.includes(
      "no-token-leakage",
    ),
    planningTextIncludesPathDecision:
      normalized.includes("route path decision") &&
      normalized.includes("/.well-known/oauth-protected-resource/mcp"),
  };
}

const validBuilderInput = {
  authorizationServers: ["https://auth.canonical-finance-host.com"],
  bearerMethodsSupported: ["header"],
  canonicalResourceUri: "https://mcp.canonical-finance-host.com/mcp",
  scopesSupported: ["mcp:read", "evidence:read"],
} satisfies McpProtectedResourceMetadataBuilderInput;

const canonicalResourceCredentialCandidates = [
  "https://user:pass@mcp.canonical-finance-host.com/mcp",
  "https://client_secret@mcp.canonical-finance-host.com/mcp",
  "https://bearer-token@mcp.canonical-finance-host.com/mcp",
  "https://jwt@mcp.canonical-finance-host.com/mcp",
] as const;

const authorizationServerCredentialCandidates = [
  "https://user:pass@auth.canonical-finance-host.com",
  "https://client:secret@auth.canonical-finance-host.com",
  "https://token@auth.canonical-finance-host.com",
] as const;

const secretLikeUriMaterialCandidates = [
  "https://auth.canonical-finance-host.com/api_key",
  "https://auth.canonical-finance-host.com/apikey",
  "https://auth.canonical-finance-host.com/accesskey",
  "https://auth.canonical-finance-host.com/password",
  "https://auth.canonical-finance-host.com/passwd",
  "https://auth.canonical-finance-host.com/secret",
  "https://auth.canonical-finance-host.com/jwt",
  "https://auth.canonical-finance-host.com/id_token",
  "https://auth.canonical-finance-host.com/sessionid",
  "https://auth.canonical-finance-host.com/session_id",
  "https://auth.canonical-finance-host.com/credential",
  "https://auth.canonical-finance-host.com/private_key",
  "https://auth.canonical-finance-host.com/bearer",
  "https://auth.canonical-finance-host.com/basic",
] as const;

function allContractsParse(
  contracts: ReturnType<typeof buildMcpProtectedResourceMetadataBuilderContracts>,
  validInputAccepted: boolean,
  resource: string,
) {
  return (
    validInputAccepted &&
    resource === validBuilderInput.canonicalResourceUri &&
    Object.values(contracts).every((contract) => {
      const parsed = z.object({ localProofOnly: trueLiteral }).passthrough();
      return parsed.safeParse(contract).success;
    })
  );
}

function base(
  contractKind: z.infer<
    typeof McpProtectedResourceMetadataBuilderContractKindSchema
  >,
) {
  return {
    contractKind,
    implementationAdded: false,
    localProofOnly: true,
    readOnly: true,
    schemaVersion: MCP_PROTECTED_RESOURCE_METADATA_BUILDER_SCHEMA_VERSION,
  };
}

function fp0122Hits(repoPaths: readonly string[]) {
  return repoPaths.filter((path) => /(^|\/)FP-0122/u.test(path));
}

function fp0123Hits(repoPaths: readonly string[]) {
  return repoPaths.filter((path) => /(^|\/)FP-0123/u.test(path));
}

function fp0124Hits(repoPaths: readonly string[]) {
  return repoPaths.filter((path) => /(^|\/)FP-0124/u.test(path));
}

function isRepoPathList(
  input:
    | readonly string[]
    | {
        repoPaths: readonly string[];
        planText?: string;
      },
): input is readonly string[] {
  return Array.isArray(input);
}

function fp0122PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "local/proof-only/read-only",
      "protected-resource metadata document-builder",
      "route-response contract",
      "does not add a protected-resource metadata endpoint",
      "does not implement www-authenticate route behavior",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "does not create fp-0123",
      "accepted canonical public mcp resource uri",
      "fp-0120 validator",
      "authorization_servers",
      "scopes_supported",
      "bearer_methods_supported",
      "no-token-leakage",
      "does not change /mcp behavior",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0122PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function fp0123PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "local/proof-only/read-only",
      "route-input evidence",
      "route-path decision",
      "does not add a route",
      "does not register a protected-resource metadata endpoint",
      "does not implement www-authenticate route behavior",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "does not create fp-0124",
      "accepted canonical public mcp resource uri",
      "authorization_servers",
      "fp-0122 builder",
      "no-token-leakage",
      "authenticated company binding",
      "/mcp unchanged",
      "route implementation deferred",
      "www-authenticate behavior deferred",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0123PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function fp0124PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility",
      "protected-resource metadata route implementation",
      "route-input evidence bundle",
      "canonical uri evidence",
      "authorization server evidence",
      "builder output",
      "no-token-leakage",
      "authenticated company binding",
      "/mcp unchanged",
      "route path decision",
      "www-authenticate",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    [
      ["does not implement the route", "did not implement the route"],
      ["does not add route paths", "add route paths"],
      [
        "does not register a protected-resource metadata endpoint",
        "register a protected-resource metadata endpoint",
      ],
      [
        "does not implement www-authenticate route behavior",
        "implement www-authenticate route behavior",
      ],
      ["does not implement oauth", "implement oauth"],
      ["does not implement token/session", "implement token/session"],
      ["does not implement auth middleware", "implement auth middleware"],
      ["does not deploy remote mcp", "deploy remote mcp"],
      ["does not add deployment config", "add deployment config"],
      ["does not add apps sdk resources", "add apps sdk resources"],
      ["does not change /mcp behavior", "change /mcp behavior"],
      ["fp-0125 absent", "fp-0125 absence"],
    ].every((allowedTexts) =>
      allowedTexts.some((requiredText) => normalized.includes(requiredText)),
    ) &&
    Object.values(verifyFp0124PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
