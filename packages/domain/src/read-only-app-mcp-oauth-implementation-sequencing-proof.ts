import { z } from "zod";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
} from "./read-only-app-mcp-remote-host-resource-contracts";
import {
  buildMcpOauthImplementationSequencingInventoryProof,
  McpOauthImplementationSequencingInventoryProofSchema,
  type McpOauthImplementationSequencingInventoryProofInput,
} from "./read-only-app-mcp-oauth-implementation-sequencing-inventory";

const trueLiteral = z.literal(true);

export const McpOauthImplementationSequencingProofSchema = z
  .object({
    schemaVersion: z.literal(
      MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
    ),
    localProofOnly: trueLiteral,
    docsAndPlanProofGateOnly: trueLiteral,
    oauthImplementationSequencingPlanBoundaryVerified: trueLiteral,
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
      trueLiteral,
    fp0118Absent: trueLiteral,
    noRouteBehaviorChangeFromFp0117: trueLiteral,
    noNewRoutePathFromFp0117: trueLiteral,
    noProtectedResourceMetadataRouteFromFp0117: trueLiteral,
    noWwwAuthenticateRouteBehaviorFromFp0117: trueLiteral,
    noOauthImplementationFromFp0117: trueLiteral,
    noTokenSessionImplementationFromFp0117: trueLiteral,
    noAuthMiddlewareImplementationFromFp0117: trueLiteral,
    noRemoteMcpDeploymentFromFp0117: trueLiteral,
    noDeploymentConfigFromFp0117: trueLiteral,
    noAppsSdkResourceFromFp0117: trueLiteral,
    noAppSubmissionFromFp0117: trueLiteral,
    noDbQueriesFromFp0117: trueLiteral,
    noSchemaMigrationsFromFp0117: trueLiteral,
    noPackageScriptsFromFp0117: trueLiteral,
    noOpenAiApiCallsFromFp0117: trueLiteral,
    noProviderExternalCallsFromFp0117: trueLiteral,
    noSourceMutationFinanceWriteFromFp0117: trueLiteral,
    noPublicAssetsSubmissionArtifactsFromFp0117: trueLiteral,
    noListingCopyGeneratedPublicProseFromFp0117: trueLiteral,
    planningTextIncludesProtectedResourceMetadata: trueLiteral,
    planningTextIncludesWwwAuthenticateResourceMetadata: trueLiteral,
    planningTextIncludesAuthorizationServerDiscovery: trueLiteral,
    planningTextIncludesScopeChallenge: trueLiteral,
    planningTextIncludesAudienceResourceValidation: trueLiteral,
    planningTextIncludesTokenFailureModes: trueLiteral,
    planningTextIncludesNoTokenPassthrough: trueLiteral,
    planningTextIncludesAuthenticatedCompanyBinding: trueLiteral,
    fp0116RemoteHostResourceBoundaryStillVerified: trueLiteral,
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0114RemoteHostReadinessBoundaryStillVerified: trueLiteral,
    fp0113OauthSecurityBoundaryStillVerified: trueLiteral,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: trueLiteral,
    fp0111DefaultLocalDispatchWiringStillVerified: trueLiteral,
    fp0109AdapterBoundaryStillVerified: trueLiteral,
    fp0108DispatchContractsStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    publicAppImplementationFutureOnly: trueLiteral,
    publicAppSubmissionFutureOnly: trueLiteral,
  })
  .merge(McpOauthImplementationSequencingInventoryProofSchema)
  .strict();

export type McpOauthImplementationSequencingProof = z.infer<
  typeof McpOauthImplementationSequencingProofSchema
>;

export function buildMcpOauthImplementationSequencingProof(
  input: Partial<{
    oauthImplementationSequencingPlanBoundaryVerified: boolean;
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified: boolean;
    fp0118Absent: boolean;
    noRouteBehaviorChangeFromFp0117: boolean;
    noNewRoutePathFromFp0117: boolean;
    noProtectedResourceMetadataRouteFromFp0117: boolean;
    noWwwAuthenticateRouteBehaviorFromFp0117: boolean;
    noOauthImplementationFromFp0117: boolean;
    noTokenSessionImplementationFromFp0117: boolean;
    noAuthMiddlewareImplementationFromFp0117: boolean;
    noRemoteMcpDeploymentFromFp0117: boolean;
    noDeploymentConfigFromFp0117: boolean;
    noAppsSdkResourceFromFp0117: boolean;
    noAppSubmissionFromFp0117: boolean;
    noDbQueriesFromFp0117: boolean;
    noSchemaMigrationsFromFp0117: boolean;
    noPackageScriptsFromFp0117: boolean;
    noOpenAiApiCallsFromFp0117: boolean;
    noProviderExternalCallsFromFp0117: boolean;
    noSourceMutationFinanceWriteFromFp0117: boolean;
    noPublicAssetsSubmissionArtifactsFromFp0117: boolean;
    noListingCopyGeneratedPublicProseFromFp0117: boolean;
    planningTextIncludesProtectedResourceMetadata: boolean;
    planningTextIncludesWwwAuthenticateResourceMetadata: boolean;
    planningTextIncludesAuthorizationServerDiscovery: boolean;
    planningTextIncludesScopeChallenge: boolean;
    planningTextIncludesAudienceResourceValidation: boolean;
    planningTextIncludesTokenFailureModes: boolean;
    planningTextIncludesNoTokenPassthrough: boolean;
    planningTextIncludesAuthenticatedCompanyBinding: boolean;
    fp0116RemoteHostResourceBoundaryStillVerified: boolean;
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified: boolean;
    fp0114RemoteHostReadinessBoundaryStillVerified: boolean;
    fp0113OauthSecurityBoundaryStillVerified: boolean;
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: boolean;
    fp0111DefaultLocalDispatchWiringStillVerified: boolean;
    fp0109AdapterBoundaryStillVerified: boolean;
    fp0108DispatchContractsStillVerified: boolean;
    fp0107RouteAdapterBoundaryStillVerified: boolean;
    fp0106ProtocolEnvelopeBoundaryStillVerified: boolean;
    fp0100PublicSecurityBoundaryStillVerified: boolean;
    publicAppImplementationFutureOnly: boolean;
    publicAppSubmissionFutureOnly: boolean;
  }> &
    McpOauthImplementationSequencingInventoryProofInput = {},
): McpOauthImplementationSequencingProof {
  return McpOauthImplementationSequencingProofSchema.parse({
    docsAndPlanProofGateOnly: true,
    ...buildMcpOauthImplementationSequencingInventoryProof(input),
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
    fp0111DefaultLocalDispatchWiringStillVerified:
      input.fp0111DefaultLocalDispatchWiringStillVerified ?? true,
    fp0112RemotePublicOauthReadinessBoundaryStillVerified:
      input.fp0112RemotePublicOauthReadinessBoundaryStillVerified ?? true,
    fp0113OauthSecurityBoundaryStillVerified:
      input.fp0113OauthSecurityBoundaryStillVerified ?? true,
    fp0114RemoteHostReadinessBoundaryStillVerified:
      input.fp0114RemoteHostReadinessBoundaryStillVerified ?? true,
    fp0115RemoteHostImplementationSequencingBoundaryStillVerified:
      input.fp0115RemoteHostImplementationSequencingBoundaryStillVerified ??
      true,
    fp0116RemoteHostResourceBoundaryStillVerified:
      input.fp0116RemoteHostResourceBoundaryStillVerified ?? true,
    fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified:
      input.fp0117AbsentOrDocsOnlyOauthImplementationSequencingPlanVerified ??
      true,
    fp0118Absent: input.fp0118Absent ?? true,
    localProofOnly: true,
    noAppSubmissionFromFp0117: input.noAppSubmissionFromFp0117 ?? true,
    noAppsSdkResourceFromFp0117: input.noAppsSdkResourceFromFp0117 ?? true,
    noAuthMiddlewareImplementationFromFp0117:
      input.noAuthMiddlewareImplementationFromFp0117 ?? true,
    noDbQueriesFromFp0117: input.noDbQueriesFromFp0117 ?? true,
    noDeploymentConfigFromFp0117: input.noDeploymentConfigFromFp0117 ?? true,
    noListingCopyGeneratedPublicProseFromFp0117:
      input.noListingCopyGeneratedPublicProseFromFp0117 ?? true,
    noNewRoutePathFromFp0117: input.noNewRoutePathFromFp0117 ?? true,
    noOauthImplementationFromFp0117:
      input.noOauthImplementationFromFp0117 ?? true,
    noOpenAiApiCallsFromFp0117: input.noOpenAiApiCallsFromFp0117 ?? true,
    noPackageScriptsFromFp0117: input.noPackageScriptsFromFp0117 ?? true,
    noProtectedResourceMetadataRouteFromFp0117:
      input.noProtectedResourceMetadataRouteFromFp0117 ?? true,
    noProviderExternalCallsFromFp0117:
      input.noProviderExternalCallsFromFp0117 ?? true,
    noPublicAssetsSubmissionArtifactsFromFp0117:
      input.noPublicAssetsSubmissionArtifactsFromFp0117 ?? true,
    noRemoteMcpDeploymentFromFp0117:
      input.noRemoteMcpDeploymentFromFp0117 ?? true,
    noRouteBehaviorChangeFromFp0117:
      input.noRouteBehaviorChangeFromFp0117 ?? true,
    noSchemaMigrationsFromFp0117: input.noSchemaMigrationsFromFp0117 ?? true,
    noSourceMutationFinanceWriteFromFp0117:
      input.noSourceMutationFinanceWriteFromFp0117 ?? true,
    noTokenSessionImplementationFromFp0117:
      input.noTokenSessionImplementationFromFp0117 ?? true,
    noWwwAuthenticateRouteBehaviorFromFp0117:
      input.noWwwAuthenticateRouteBehaviorFromFp0117 ?? true,
    oauthImplementationSequencingPlanBoundaryVerified:
      input.oauthImplementationSequencingPlanBoundaryVerified ?? true,
    planningTextIncludesAuthenticatedCompanyBinding:
      input.planningTextIncludesAuthenticatedCompanyBinding ?? true,
    planningTextIncludesAudienceResourceValidation:
      input.planningTextIncludesAudienceResourceValidation ?? true,
    planningTextIncludesAuthorizationServerDiscovery:
      input.planningTextIncludesAuthorizationServerDiscovery ?? true,
    planningTextIncludesNoTokenPassthrough:
      input.planningTextIncludesNoTokenPassthrough ?? true,
    planningTextIncludesProtectedResourceMetadata:
      input.planningTextIncludesProtectedResourceMetadata ?? true,
    planningTextIncludesScopeChallenge:
      input.planningTextIncludesScopeChallenge ?? true,
    planningTextIncludesTokenFailureModes:
      input.planningTextIncludesTokenFailureModes ?? true,
    planningTextIncludesWwwAuthenticateResourceMetadata:
      input.planningTextIncludesWwwAuthenticateResourceMetadata ?? true,
    publicAppImplementationFutureOnly:
      input.publicAppImplementationFutureOnly ?? true,
    publicAppSubmissionFutureOnly: input.publicAppSubmissionFutureOnly ?? true,
    schemaVersion: MCP_OAUTH_IMPLEMENTATION_SEQUENCING_SCHEMA_VERSION,
  });
}

export function verifyFp0117OauthImplementationSequencingPlanBoundary(input: {
  repoPaths: readonly string[];
  planText: string;
}) {
  const fp0117Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0117/u.test(path),
  );
  return (
    fp0117Hits.length === 1 &&
    fp0117Hits[0] === FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0117PlanTextBoundaryVerified(input.planText)
  );
}

export function verifyFp0117AbsentOrDocsOnlyOauthImplementationSequencingPlan(input: {
  repoPaths: readonly string[];
  planText?: string;
}) {
  const fp0117Hits = input.repoPaths.filter((path) =>
    /(^|\/)FP-0117/u.test(path),
  );
  if (fp0117Hits.length === 0) return true;
  return (
    fp0117Hits.length === 1 &&
    fp0117Hits[0] === FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0117PlanTextBoundaryVerified(input.planText ?? "")
  );
}

export function verifyFp0118Absent(repoPaths: readonly string[]) {
  return !repoPaths.some((path) => /(^|\/)FP-0118/u.test(path));
}

export function verifyFp0117PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    planningTextIncludesAuthenticatedCompanyBinding: normalized.includes(
      "authenticated company binding",
    ),
    planningTextIncludesAudienceResourceValidation: normalized.includes(
      "audience/resource validation",
    ),
    planningTextIncludesAuthorizationServerDiscovery: normalized.includes(
      "authorization-server discovery",
    ),
    planningTextIncludesNoTokenPassthrough:
      normalized.includes("no token passthrough") ||
      normalized.includes("token passthrough prohibition"),
    planningTextIncludesProtectedResourceMetadata: normalized.includes(
      "protected-resource metadata",
    ),
    planningTextIncludesScopeChallenge: normalized.includes("scope challenge"),
    planningTextIncludesTokenFailureModes:
      normalized.includes(
        "missing/expired/malformed/wrong-audience/wrong-scope/wrong-org",
      ) || normalized.includes("token failure modes"),
    planningTextIncludesWwwAuthenticateResourceMetadata: normalized.includes(
      "www-authenticate resource_metadata",
    ),
  };
}

function fp0117PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  const topics = verifyFp0117PlanningTextRequiredTopics(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility",
      "oauth/token/session/auth implementation sequencing",
      "does not implement oauth",
      "does not implement token/session",
      "does not implement auth middleware",
      "does not add protected-resource metadata routes",
      "does not implement www-authenticate behavior",
      "does not change /mcp route behavior",
      "does not add route paths",
      "does not deploy remote mcp",
      "does not add deployment config",
      "does not add apps sdk resources",
      "public app submission remains future-only",
      "fp-0118 remains absent",
      "token storage",
      "redaction",
      "revocation",
      "rotation",
      "replay",
      "provider-neutral",
      "canonical public resource uri",
      "companykey",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(topics).every(Boolean)
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/`/gu, "");
}
