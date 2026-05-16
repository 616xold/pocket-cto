import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION,
  MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH,
  McpAuthorizationServersReadinessBoundarySchema,
  McpAuthServerProviderNeutralBoundarySchema,
  McpCanonicalPublicResourceUriBoundarySchema,
  McpCanonicalUriDecisionDeferredBoundarySchema,
  McpCanonicalUriHttpsExactStableBoundarySchema,
  McpCanonicalUriNoQueryFragmentBoundarySchema,
  McpCanonicalUriNoSelectorAuthorityBoundarySchema,
  McpNoLocalTunnelAuthorityBoundarySchema,
  McpNoRouteRuntimeBoundarySchema,
  McpProtectedResourceRoutePathDerivationBoundarySchema,
  McpResourceIndicatorBoundarySchema,
  McpWwwAuthenticateMetadataUrlBoundarySchema,
} from "./read-only-app-mcp-canonical-resource-contracts";
import {
  allMcpCanonicalResourceAuthServerContractsParse,
  buildMcpCanonicalResourceAuthServerContracts,
} from "./read-only-app-mcp-canonical-resource-builders";
import {
  buildMcpCanonicalResourceAuthServerInventoryProof,
  type McpCanonicalResourceAuthServerInventoryInput,
  type McpCanonicalResourceAuthServerInventoryProof,
} from "./read-only-app-mcp-canonical-resource-inventory";
import { McpCanonicalResourceAuthServerProofSchema } from "./read-only-app-mcp-canonical-resource-proof-schema";
import type { McpCanonicalResourceAuthServerProof } from "./read-only-app-mcp-canonical-resource-proof-schema";
import {
  MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES,
  deriveMcpProtectedResourceMetadataUrl,
  invalidCanonicalUriCandidatesFailClosedBeforeDerivation,
  tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri,
  validateMcpCanonicalPublicResourceUriCandidate,
  validateMcpWwwAuthenticateResourceMetadataUrl,
} from "./read-only-app-mcp-canonical-resource-validator";

type ProofInput = Partial<
  Omit<
    McpCanonicalResourceAuthServerProof,
    | "schemaVersion"
    | "localProofOnly"
    | keyof McpCanonicalResourceAuthServerInventoryProof
  >
> &
  McpCanonicalResourceAuthServerInventoryInput;

const defaultTrueKeys = [
  "noRouteBehaviorChange",
  "noNewRoutePath",
  "noProtectedResourceMetadataRouteImplementation",
  "noWwwAuthenticateRouteBehaviorImplementation",
  "noOauthImplementation",
  "noTokenSessionImplementation",
  "noAuthMiddlewareImplementation",
  "noRemoteMcpDeployment",
  "noDeploymentConfig",
  "noAppsSdkResourceImplementation",
  "noAppSubmission",
  "noDbQueriesAdded",
  "noSchemaMigrationsAdded",
  "noPackageScriptsAdded",
  "noPublicAssets",
  "noOpenAiApiCalls",
  "noModelCalls",
  "noOpenAiClientOrKeyUsage",
  "noProviderCalls",
  "noExternalCommunications",
  "noSourceMutation",
  "noFinanceWrite",
  "fp0120BoundaryVerified",
  "fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified",
  "fp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanningVerified",
  "fp0122Absent",
  "protectedResourceMetadataRouteImplementationPlanningBoundaryVerified",
  "noRouteBehaviorChangeFromFp0121",
  "noNewRoutePathFromFp0121",
  "noProtectedResourceMetadataRouteFromFp0121",
  "noWwwAuthenticateRouteBehaviorFromFp0121",
  "noOauthImplementationFromFp0121",
  "noTokenSessionImplementationFromFp0121",
  "noAuthMiddlewareImplementationFromFp0121",
  "noRemoteMcpDeploymentFromFp0121",
  "noDeploymentConfigFromFp0121",
  "noAppsSdkResourceFromFp0121",
  "noPublicAppImplementationFromFp0121",
  "noAppSubmissionFromFp0121",
  "noDbQueriesFromFp0121",
  "noSchemaMigrationsFromFp0121",
  "noPackageScriptsFromFp0121",
  "noFixturesSampleDataSourcePacksFromFp0121",
  "noOpenAiApiCallsFromFp0121",
  "noProviderExternalCallsFromFp0121",
  "noSourceMutationFinanceWriteFromFp0121",
  "noPublicAssetsSubmissionArtifactsFromFp0121",
  "noListingCopyGeneratedPublicProseFromFp0121",
  "fp0120CanonicalResourceAuthServerBoundaryStillVerified",
  "noRouteBehaviorChangeFromFp0120",
  "noNewRoutePathFromFp0120",
  "noProtectedResourceMetadataRouteFromFp0120",
  "noWwwAuthenticateRouteBehaviorFromFp0120",
  "noOauthImplementationFromFp0120",
  "noTokenSessionImplementationFromFp0120",
  "noAuthMiddlewareImplementationFromFp0120",
  "noRemoteMcpDeploymentFromFp0120",
  "noDeploymentConfigFromFp0120",
  "noAppsSdkResourceFromFp0120",
  "noAppSubmissionFromFp0120",
  "noDbQueriesFromFp0120",
  "noSchemaMigrationsFromFp0120",
  "noPackageScriptsFromFp0120",
  "noOpenAiApiCallsFromFp0120",
  "noProviderExternalCallsFromFp0120",
  "noSourceMutationFinanceWriteFromFp0120",
  "noPublicAssetsSubmissionArtifactsFromFp0120",
  "fp0119ProtectedResourceRouteSequencingBoundaryStillVerified",
  "fp0118ProtectedResourceMetadataBoundaryStillVerified",
  "fp0117OauthImplementationSequencingBoundaryStillVerified",
  "fp0116RemoteHostResourceBoundaryStillVerified",
  "fp0113OauthSecurityBoundaryStillVerified",
  "fp0107RouteAdapterBoundaryStillVerified",
  "fp0106ProtocolEnvelopeBoundaryStillVerified",
  "fp0100PublicSecurityBoundaryStillVerified",
] as const satisfies readonly (keyof McpCanonicalResourceAuthServerProof)[];

export const FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH =
  "plans/FP-0121-read-only-chatgpt-app-mcp-protected-resource-metadata-route-implementation-planning.md";

const VALID_CANONICAL_RESOURCE_URI = "https://mcp.canonical-finance-host.com/mcp";
const VALID_PROTECTED_RESOURCE_METADATA_URL =
  "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp";

export function buildMcpCanonicalResourceAuthServerProof(
  input: ProofInput = {},
): McpCanonicalResourceAuthServerProof {
  const contracts = buildMcpCanonicalResourceAuthServerContracts();
  const derived = deriveMcpProtectedResourceMetadataUrl(
    VALID_CANONICAL_RESOURCE_URI,
  );
  const challenge = validateMcpWwwAuthenticateResourceMetadataUrl({
    canonicalResourceUri: VALID_CANONICAL_RESOURCE_URI,
    resourceMetadataUrl: VALID_PROTECTED_RESOURCE_METADATA_URL,
  });
  const derivationAttempt =
    tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
      VALID_CANONICAL_RESOURCE_URI,
    );
  const canonicalResourceValidation =
    validateMcpCanonicalPublicResourceUriCandidate(VALID_CANONICAL_RESOURCE_URI);
  const invalidDerivation =
    invalidCanonicalUriCandidatesFailClosedBeforeDerivation(
      MCP_CANONICAL_RESOURCE_INVALID_METADATA_DERIVATION_CANDIDATES,
    );
  const queryFragmentSelectorDerivation =
    invalidCanonicalUriCandidatesFailClosedBeforeDerivation([
      "https://mcp.canonical-finance-host.com/mcp?companyKey=acme",
      "https://mcp.canonical-finance-host.com/mcp#fragment",
      "https://mcp.canonical-finance-host.com/companyKey/acme/mcp",
      "https://mcp.canonical-finance-host.com/user/sohaib/mcp",
      "https://mcp.canonical-finance-host.com/org/acme/mcp",
      "https://mcp.canonical-finance-host.com/workspace/acme/mcp",
    ]);

  return McpCanonicalResourceAuthServerProofSchema.parse({
    ...buildMcpCanonicalResourceAuthServerInventoryProof(input),
    ...defaultTrueValues(input),
    authServerProviderNeutralBoundaryVerified:
      input.authServerProviderNeutralBoundaryVerified ??
      McpAuthServerProviderNeutralBoundarySchema.safeParse(
        contracts.authServerProviderNeutralBoundary,
      ).success,
    authorizationServersReadinessBoundaryVerified:
      input.authorizationServersReadinessBoundaryVerified ??
      McpAuthorizationServersReadinessBoundarySchema.safeParse(
        contracts.authorizationServersReadinessBoundary,
      ).success,
    canonicalPublicResourceUriBoundaryVerified:
      input.canonicalPublicResourceUriBoundaryVerified ??
      McpCanonicalPublicResourceUriBoundarySchema.safeParse(
        contracts.canonicalPublicResourceUriBoundary,
      ).success,
    canonicalResourceAuthServerContractsFoundationVerified:
      input.canonicalResourceAuthServerContractsFoundationVerified ??
      contracts.proofContract.contractOnly,
    canonicalResourceAuthServerContractsVerified:
      input.canonicalResourceAuthServerContractsVerified ??
      allMcpCanonicalResourceAuthServerContractsParse(contracts),
    canonicalUriDecisionDeferredBoundaryVerified:
      input.canonicalUriDecisionDeferredBoundaryVerified ??
      McpCanonicalUriDecisionDeferredBoundarySchema.safeParse(
        contracts.canonicalUriDecisionDeferredBoundary,
      ).success,
    canonicalUriHttpsExactStableBoundaryVerified:
      input.canonicalUriHttpsExactStableBoundaryVerified ??
      McpCanonicalUriHttpsExactStableBoundarySchema.safeParse(
        contracts.canonicalUriHttpsExactStableBoundary,
      ).success,
    canonicalUriNoQueryFragmentBoundaryVerified:
      input.canonicalUriNoQueryFragmentBoundaryVerified ??
      McpCanonicalUriNoQueryFragmentBoundarySchema.safeParse(
        contracts.canonicalUriNoQueryFragmentBoundary,
      ).success,
    canonicalUriNoSelectorAuthorityBoundaryVerified:
      input.canonicalUriNoSelectorAuthorityBoundaryVerified ??
      McpCanonicalUriNoSelectorAuthorityBoundarySchema.safeParse(
        contracts.canonicalUriNoSelectorAuthorityBoundary,
      ).success,
    localProofOnly: true,
    invalidCanonicalUriMetadataDerivationFailsClosed:
      input.invalidCanonicalUriMetadataDerivationFailsClosed ??
      invalidDerivation.invalidCanonicalUriMetadataDerivationFailsClosed,
    metadataRouteDerivationRequiresAcceptedCanonicalUri:
      input.metadataRouteDerivationRequiresAcceptedCanonicalUri ??
      (canonicalResourceValidation.accepted &&
        derivationAttempt.derived &&
        derivationAttempt.validation.accepted),
    noLocalTunnelAuthorityBoundaryVerified:
      input.noLocalTunnelAuthorityBoundaryVerified ??
      McpNoLocalTunnelAuthorityBoundarySchema.safeParse(
        contracts.noLocalTunnelAuthorityBoundary,
      ).success,
    noRouteRuntimeBoundaryVerified:
      input.noRouteRuntimeBoundaryVerified ??
      McpNoRouteRuntimeBoundarySchema.safeParse(
        contracts.noRouteRuntimeBoundary,
      ).success,
    protectedResourceRoutePathDerivationBoundaryVerified:
      input.protectedResourceRoutePathDerivationBoundaryVerified ??
      (McpProtectedResourceRoutePathDerivationBoundarySchema.safeParse(
        contracts.routePathDerivationBoundary,
      ).success &&
        derived.metadataRoutePath ===
          `${MCP_PROTECTED_RESOURCE_METADATA_WELL_KNOWN_PATH}/mcp`),
    queryFragmentSelectorCanonicalUriCannotDeriveMetadataUrl:
      input.queryFragmentSelectorCanonicalUriCannotDeriveMetadataUrl ??
      queryFragmentSelectorDerivation.invalidCanonicalUriMetadataDerivationFailsClosed,
    resourceIndicatorBoundaryVerified:
      input.resourceIndicatorBoundaryVerified ??
      McpResourceIndicatorBoundarySchema.safeParse(
        contracts.resourceIndicatorBoundary,
      ).success,
    schemaVersion: MCP_CANONICAL_RESOURCE_AUTH_SERVER_SCHEMA_VERSION,
    wwwAuthenticateMetadataUrlBoundaryVerified:
      input.wwwAuthenticateMetadataUrlBoundaryVerified ??
      (McpWwwAuthenticateMetadataUrlBoundarySchema.safeParse(
        contracts.wwwAuthenticateMetadataUrlBoundary,
      ).success &&
        challenge.canonicalResourceUriAccepted &&
        challenge.resourceMetadataUrlMatchesDerived),
  });
}

export function verifyFp0120CanonicalResourceAuthServerPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0120Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0120/u.test(path),
  );
  return (
    fp0120Hits.length === 1 &&
    fp0120Hits[0] === FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH &&
    fp0120PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0120Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0120/u.test(path),
  );
  if (fp0120Hits.length === 0) return true;
  return (
    fp0120Hits.length === 1 &&
    fp0120Hits[0] === FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH &&
    fp0120PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0121AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanning(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0121Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0121/u.test(path),
  );
  if (fp0121Hits.length === 0) return true;
  return (
    fp0121Hits.length === 1 &&
    fp0121Hits[0] ===
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH &&
    fp0121PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0121ProtectedResourceMetadataRouteImplementationPlanningBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0121Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0121/u.test(path),
  );
  return (
    fp0121Hits.length === 1 &&
    fp0121Hits[0] ===
      FP0121_PROTECTED_RESOURCE_METADATA_ROUTE_IMPLEMENTATION_PLANNING_PLAN_PATH &&
    fp0121PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0122Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => /(^|\/)FP-0122/u.test(path));
}

export function verifyFp0121PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding: normalized.includes(
      "authenticated company binding",
    ),
    planningTextIncludesAuthorizationServersPrerequisite:
      normalized.includes("authorization_servers") &&
      normalized.includes("prerequisite"),
    planningTextIncludesCanonicalUriPrerequisite:
      normalized.includes("canonical uri prerequisite") ||
      normalized.includes("canonical public resource uri prerequisite") ||
      normalized.includes("canonical public mcp resource uri"),
    planningTextIncludesExactRoutePathDecision:
      normalized.includes("exact route path decision") ||
      normalized.includes("root path") ||
      normalized.includes("/.well-known/oauth-protected-resource/mcp"),
    planningTextIncludesFp0122Absence:
      normalized.includes("fp-0122 remains absent") ||
      normalized.includes("fp-0122 absent"),
    planningTextIncludesLocalMcpUnchangedBehavior:
      normalized.includes("/mcp unchanged-behavior") ||
      normalized.includes("local /mcp unchanged-behavior"),
    planningTextIncludesMetadataDocumentTests: normalized.includes(
      "metadata document tests",
    ),
    planningTextIncludesNoTokenLeakage: normalized.includes(
      "no-token-leakage",
    ),
    planningTextIncludesProtectedResourceMetadataRouteReadiness:
      normalized.includes(
        "protected-resource metadata route implementation readiness",
      ),
    planningTextIncludesRouteTests: normalized.includes("route tests"),
    planningTextIncludesWwwAuthenticateSeparate:
      normalized.includes("www-authenticate") &&
      normalized.includes("separate"),
  };
}

export function verifyFp0120PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthorizationServers:
      normalized.includes("authorization_servers"),
    planningTextIncludesCanonicalUriDecisionDeferred:
      normalized.includes("decision deferred") ||
      normalized.includes("canonical uri decision deferred"),
    planningTextIncludesCanonicalUriRequirement: normalized.includes(
      "canonical public mcp resource uri",
    ),
    planningTextIncludesNoLocalTunnelAuthority:
      normalized.includes("local tunnel") &&
      (normalized.includes("rejected") ||
        normalized.includes("authority") ||
        normalized.includes("non-tunnel")),
    planningTextIncludesNoRouteRuntime:
      normalized.includes("no route runtime") ||
      (normalized.includes("protected-resource metadata route") &&
        normalized.includes("does not change /mcp route behavior")),
    planningTextIncludesProviderNeutral:
      normalized.includes("provider-neutral") ||
      normalized.includes("provider neutrality"),
    planningTextIncludesResourceIndicators:
      normalized.includes("resource indicators") ||
      normalized.includes("resource parameter"),
    planningTextIncludesRouteDerivation:
      normalized.includes("rfc 9728") &&
      normalized.includes(".well-known/oauth-protected-resource/mcp"),
    planningTextIncludesWwwAuthenticateMetadataUrl:
      normalized.includes("www-authenticate") &&
      normalized.includes("resource_metadata"),
  };
}

function defaultTrueValues(input: ProofInput) {
  return Object.fromEntries(
    defaultTrueKeys.map((key) => [key, input[key] ?? true]),
  );
}

function fp0120PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "local/proof-only/read-only contract foundation",
      "canonical public mcp resource uri",
      "authorization_servers",
      "rfc 9728",
      ".well-known/oauth-protected-resource/mcp",
      "www-authenticate resource_metadata",
      "provider-neutral",
      "local tunnel",
      "does not implement protected-resource metadata routes",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    normalized.includes("oauth") &&
    normalized.includes("token/session") &&
    normalized.includes("auth middleware") &&
    normalized.includes("www-authenticate behavior") &&
    (normalized.includes("does not change /mcp route behavior") ||
      normalized.includes("no route behavior change")) &&
    (normalized.includes("does not add route paths") ||
      normalized.includes("no new route path")) &&
    (normalized.includes("does not deploy remote mcp") ||
      normalized.includes("remote mcp deployment")) &&
    (normalized.includes("no fp-0121") ||
      normalized.includes("fp-0121 remains absent")) &&
    Object.values(verifyFp0120PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function fp0121PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility",
      "protected-resource metadata route implementation readiness",
      "does not implement the route",
      "does not add route paths",
      "does not implement www-authenticate route behavior",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "does not create fp-0122",
      "canonical uri prerequisite",
      "authorization_servers prerequisite",
      "route tests",
      "metadata document tests",
      "no-token-leakage",
      "/mcp unchanged-behavior",
      "authenticated company binding",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    (normalized.includes("root metadata path") ||
      normalized.includes("root path")) &&
    normalized.includes("/.well-known/oauth-protected-resource/mcp") &&
    normalized.includes("public chatgpt app submission must wait") &&
    Object.values(verifyFp0121PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
