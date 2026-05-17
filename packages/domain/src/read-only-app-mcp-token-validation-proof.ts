import { z } from "zod";
import {
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  MCP_TOKEN_VALIDATION_FAILURE_MODES,
  MCP_TOKEN_VALIDATION_FP0128_PLAN_PREFIX,
  MCP_TOKEN_VALIDATION_FP0129_PLAN_PREFIX,
  MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION,
} from "./read-only-app-mcp-token-validation-contracts";
import {
  buildMcpTokenValidationReadinessContracts,
  deriveTokenFailureChallengeReadiness,
  scanTokenValidationNoLeakage,
  validateTokenFailureModeContract,
  validateTokenScopeChallenge,
} from "./read-only-app-mcp-token-validation";

const trueLiteral = z.literal(true);

export const McpTokenValidationReadinessProofSchema = z
  .object({
    schemaVersion: z.literal(MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    tokenValidationReadinessContractsVerified: trueLiteral,
    tokenValidationDeferredBoundaryVerified: trueLiteral,
    tokenParsingDeferredBoundaryVerified: trueLiteral,
    tokenSessionStorageDeferredBoundaryVerified: trueLiteral,
    authMiddlewareDeferredBoundaryVerified: trueLiteral,
    tokenFailureTaxonomyBoundaryVerified: trueLiteral,
    tokenAudienceResourceValidationBoundaryVerified: trueLiteral,
    tokenScopeValidationBoundaryVerified: trueLiteral,
    authenticatedCompanyBindingBoundaryVerified: trueLiteral,
    clientCompanyKeySelectorOnlyBoundaryVerified: trueLiteral,
    tokenPassthroughForbiddenBoundaryVerified: trueLiteral,
    tokenNoLeakageBoundaryVerified: trueLiteral,
    tokenValidationNoRuntimeBoundaryVerified: trueLiteral,
    noMcpRouteBehaviorChange: trueLiteral,
    noProtectedResourceMetadataRouteBehaviorChange: trueLiteral,
    noWwwAuthenticateRouteBehaviorImplementation: trueLiteral,
    noTokenValidationImplementation: trueLiteral,
    noTokenParsingImplementation: trueLiteral,
    noTokenSessionImplementation: trueLiteral,
    noAuthMiddlewareImplementation: trueLiteral,
    noOauthImplementation: trueLiteral,
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
    fp0128BoundaryVerified: trueLiteral,
    fp0129Absent: trueLiteral,
    fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified: trueLiteral,
    fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified:
      trueLiteral,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified: trueLiteral,
    fp0125EvidenceCoherenceBoundaryStillVerified: trueLiteral,
    fp0123RouteInputEvidenceBoundaryStillVerified: trueLiteral,
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified: trueLiteral,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified: trueLiteral,
    fp0118ProtectedResourceMetadataBoundaryStillVerified: trueLiteral,
    fp0117OauthImplementationSequencingBoundaryStillVerified: trueLiteral,
    fp0107RouteAdapterBoundaryStillVerified: trueLiteral,
    fp0106ProtocolEnvelopeBoundaryStillVerified: trueLiteral,
    fp0100PublicSecurityBoundaryStillVerified: trueLiteral,
    tokenFailureModesComplete: trueLiteral,
    tokenFailureStatusMappingFutureOnly: trueLiteral,
    tokenFailureChallengeReadinessContractOnly: trueLiteral,
    audienceResourceValidationRequiresFutureCanonicalPublicMcpUriProof:
      trueLiteral,
    scopeChallengeReadOnlyLeastPrivilegeVerified: trueLiteral,
    scopeChallengeCannotWidenScopesVerified: trueLiteral,
    authenticatedCompanyBindingPrerequisiteVerified: trueLiteral,
    companyKeySelectorOnlyVerified: trueLiteral,
    tokenPassthroughAttemptFailsClosedVerified: trueLiteral,
    noCurrentRouteImportsTokenValidationHelpers: trueLiteral,
    noRealTokenExamplesCommitted: trueLiteral,
    safeAbsenceWordingAllowed: trueLiteral,
  })
  .strict();

export type McpTokenValidationReadinessProof = z.infer<
  typeof McpTokenValidationReadinessProofSchema
>;

export type McpTokenValidationReadinessProofInput = Partial<
  Omit<McpTokenValidationReadinessProof, "schemaVersion" | "localProofOnly">
>;

type Fp0128BoundaryInput =
  | readonly string[]
  | {
      planText?: string;
      repoPaths: readonly string[];
    };

export function buildMcpTokenValidationReadinessProof(
  input: McpTokenValidationReadinessProofInput = {},
): McpTokenValidationReadinessProof {
  const contracts = buildMcpTokenValidationReadinessContracts();

  return McpTokenValidationReadinessProofSchema.parse({
    schemaVersion: MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION,
    localProofOnly: true,
    tokenValidationReadinessContractsVerified:
      input.tokenValidationReadinessContractsVerified ??
      contracts.proofContract.contractOnly,
    tokenValidationDeferredBoundaryVerified:
      input.tokenValidationDeferredBoundaryVerified ??
      contracts.tokenValidationDeferredBoundary.tokenValidationFutureOnly,
    tokenParsingDeferredBoundaryVerified:
      input.tokenParsingDeferredBoundaryVerified ??
      contracts.tokenParsingDeferredBoundary.tokenParsingFutureOnly,
    tokenSessionStorageDeferredBoundaryVerified:
      input.tokenSessionStorageDeferredBoundaryVerified ??
      contracts.tokenSessionStorageDeferredBoundary.tokenStorageFutureOnly,
    authMiddlewareDeferredBoundaryVerified:
      input.authMiddlewareDeferredBoundaryVerified ??
      contracts.authMiddlewareDeferredBoundary.authMiddlewareFutureOnly,
    tokenFailureTaxonomyBoundaryVerified:
      input.tokenFailureTaxonomyBoundaryVerified ??
      contracts.tokenFailureTaxonomyBoundary.taxonomyProofOnly,
    tokenAudienceResourceValidationBoundaryVerified:
      input.tokenAudienceResourceValidationBoundaryVerified ??
      contracts.tokenAudienceResourceValidationBoundary
        .futureCanonicalPublicMcpResourceUriProofRequired,
    tokenScopeValidationBoundaryVerified:
      input.tokenScopeValidationBoundaryVerified ??
      contracts.tokenScopeValidationBoundary.readOnlyScopesOnly,
    authenticatedCompanyBindingBoundaryVerified:
      input.authenticatedCompanyBindingBoundaryVerified ??
      contracts.authenticatedCompanyBindingBoundary.authenticatedCompanyRequired,
    clientCompanyKeySelectorOnlyBoundaryVerified:
      input.clientCompanyKeySelectorOnlyBoundaryVerified ??
      contracts.clientCompanyKeySelectorOnlyBoundary.clientCompanyKeySelectorOnly,
    tokenPassthroughForbiddenBoundaryVerified:
      input.tokenPassthroughForbiddenBoundaryVerified ??
      contracts.passthroughForbiddenBoundary.tokenPassthroughForbidden,
    tokenNoLeakageBoundaryVerified:
      input.tokenNoLeakageBoundaryVerified ??
      !contracts.noLeakageBoundary.realTokenExamplesAllowed,
    tokenValidationNoRuntimeBoundaryVerified:
      input.tokenValidationNoRuntimeBoundaryVerified ??
      contracts.noRuntimeBoundary.noTokenValidationRuntime,
    noMcpRouteBehaviorChange: input.noMcpRouteBehaviorChange ?? true,
    noProtectedResourceMetadataRouteBehaviorChange:
      input.noProtectedResourceMetadataRouteBehaviorChange ?? true,
    noWwwAuthenticateRouteBehaviorImplementation:
      input.noWwwAuthenticateRouteBehaviorImplementation ?? true,
    noTokenValidationImplementation:
      input.noTokenValidationImplementation ?? true,
    noTokenParsingImplementation: input.noTokenParsingImplementation ?? true,
    noTokenSessionImplementation: input.noTokenSessionImplementation ?? true,
    noAuthMiddlewareImplementation:
      input.noAuthMiddlewareImplementation ?? true,
    noOauthImplementation: input.noOauthImplementation ?? true,
    noRemoteMcpDeployment: input.noRemoteMcpDeployment ?? true,
    noDeploymentConfig: input.noDeploymentConfig ?? true,
    noAppsSdkResourceImplementation:
      input.noAppsSdkResourceImplementation ?? true,
    noAppSubmission: input.noAppSubmission ?? true,
    noDbQueriesAdded: input.noDbQueriesAdded ?? true,
    noSchemaMigrationsAdded: input.noSchemaMigrationsAdded ?? true,
    noPackageScriptsAdded: input.noPackageScriptsAdded ?? true,
    noPublicAssets: input.noPublicAssets ?? true,
    noListingCopy: input.noListingCopy ?? true,
    noGeneratedPublicProse: input.noGeneratedPublicProse ?? true,
    noOpenAiApiCalls: input.noOpenAiApiCalls ?? true,
    noModelCalls: input.noModelCalls ?? true,
    noOpenAiClientOrKeyUsage: input.noOpenAiClientOrKeyUsage ?? true,
    noProviderCalls: input.noProviderCalls ?? true,
    noExternalCommunications: input.noExternalCommunications ?? true,
    noSourceMutation: input.noSourceMutation ?? true,
    noFinanceWrite: input.noFinanceWrite ?? true,
    fp0128BoundaryVerified: input.fp0128BoundaryVerified ?? true,
    fp0129Absent: input.fp0129Absent ?? true,
    fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified:
      input.fp0127WwwAuthenticateAuthChallengeBoundaryStillVerified ?? true,
    fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified:
      input.fp0126WwwAuthenticateAuthChallengeSequencingBoundaryStillVerified ??
      true,
    fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified:
      input.fp0125ProtectedResourceMetadataLocalRouteBoundaryStillVerified ??
      true,
    fp0125EvidenceCoherenceBoundaryStillVerified:
      input.fp0125EvidenceCoherenceBoundaryStillVerified ?? true,
    fp0123RouteInputEvidenceBoundaryStillVerified:
      input.fp0123RouteInputEvidenceBoundaryStillVerified ?? true,
    fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified:
      input.fp0122ProtectedResourceMetadataBuilderBoundaryStillVerified ?? true,
    fp0120CanonicalResourceAuthServerBoundaryStillVerified:
      input.fp0120CanonicalResourceAuthServerBoundaryStillVerified ?? true,
    fp0118ProtectedResourceMetadataBoundaryStillVerified:
      input.fp0118ProtectedResourceMetadataBoundaryStillVerified ?? true,
    fp0117OauthImplementationSequencingBoundaryStillVerified:
      input.fp0117OauthImplementationSequencingBoundaryStillVerified ?? true,
    fp0107RouteAdapterBoundaryStillVerified:
      input.fp0107RouteAdapterBoundaryStillVerified ?? true,
    fp0106ProtocolEnvelopeBoundaryStillVerified:
      input.fp0106ProtocolEnvelopeBoundaryStillVerified ?? true,
    fp0100PublicSecurityBoundaryStillVerified:
      input.fp0100PublicSecurityBoundaryStillVerified ?? true,
    tokenFailureModesComplete: input.tokenFailureModesComplete ?? true,
    tokenFailureStatusMappingFutureOnly:
      input.tokenFailureStatusMappingFutureOnly ?? true,
    tokenFailureChallengeReadinessContractOnly:
      input.tokenFailureChallengeReadinessContractOnly ?? true,
    audienceResourceValidationRequiresFutureCanonicalPublicMcpUriProof:
      input.audienceResourceValidationRequiresFutureCanonicalPublicMcpUriProof ??
      true,
    scopeChallengeReadOnlyLeastPrivilegeVerified:
      input.scopeChallengeReadOnlyLeastPrivilegeVerified ?? true,
    scopeChallengeCannotWidenScopesVerified:
      input.scopeChallengeCannotWidenScopesVerified ?? true,
    authenticatedCompanyBindingPrerequisiteVerified:
      input.authenticatedCompanyBindingPrerequisiteVerified ?? true,
    companyKeySelectorOnlyVerified: input.companyKeySelectorOnlyVerified ?? true,
    tokenPassthroughAttemptFailsClosedVerified:
      input.tokenPassthroughAttemptFailsClosedVerified ?? true,
    noCurrentRouteImportsTokenValidationHelpers:
      input.noCurrentRouteImportsTokenValidationHelpers ?? true,
    noRealTokenExamplesCommitted: input.noRealTokenExamplesCommitted ?? true,
    safeAbsenceWordingAllowed: input.safeAbsenceWordingAllowed ?? true,
  });
}

export function verifyFp0128AbsentOrLocalTokenValidationReadinessContracts(
  input: Fp0128BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0128BoundaryInput(input);
  const fp0128Hits = fpPlanHits(
    repoPaths,
    MCP_TOKEN_VALIDATION_FP0128_PLAN_PREFIX,
  );
  if (fp0128Hits.length === 0) return true;

  return (
    fp0128Hits.length === 1 &&
    fp0128Hits[0] === FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH &&
    typeof planText === "string" &&
    fp0128PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0128TokenValidationReadinessContractsBoundary(
  input: Fp0128BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0128BoundaryInput(input);
  const fp0128Hits = fpPlanHits(
    repoPaths,
    MCP_TOKEN_VALIDATION_FP0128_PLAN_PREFIX,
  );

  return (
    fp0128Hits.length === 1 &&
    fp0128Hits[0] === FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH &&
    typeof planText === "string" &&
    fp0128PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0129Absent(repoPaths: readonly string[]) {
  return (
    fpPlanHits(repoPaths, MCP_TOKEN_VALIDATION_FP0129_PLAN_PREFIX).length === 0
  );
}

export function verifyFp0128PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    allFailureModes: MCP_TOKEN_VALIDATION_FAILURE_MODES.every((mode) =>
      modeMentioned(normalized, mode),
    ),
    audienceResourcePrerequisites:
      normalized.includes("audience/resource validation") &&
      normalized.includes("canonical public mcp resource uri proof"),
    authMiddlewareDeferred: normalized.includes("auth middleware remains"),
    companyBinding:
      normalized.includes("authenticated user/org/company binding") &&
      normalized.includes("companykey remains selector-only"),
    fp0129Absent: normalized.includes("fp-0129 remains absent"),
    localProofOnly:
      normalized.includes("local/proof-only/read-only") &&
      normalized.includes("pure domain contracts"),
    noRouteRuntime:
      normalized.includes("change `/mcp`") &&
      normalized.includes("emit www-authenticate headers"),
    noTokenRuntime:
      normalized.includes("does not validate tokens") &&
      normalized.includes("parse real tokens") &&
      normalized.includes("store tokens"),
    noOpenAiProviderSourceFinance:
      normalized.includes("openai api/model calls") &&
      normalized.includes("provider calls") &&
      normalized.includes("source mutation") &&
      normalized.includes("finance writes"),
    noTokenLeakage:
      normalized.includes("no token leakage") &&
      normalized.includes("no real token examples"),
    passthroughForbidden: normalized.includes("token passthrough is forbidden"),
    scopeLeastPrivilege:
      normalized.includes("least-privilege read-only scopes") &&
      normalized.includes("cannot create, widen"),
  };
}

export function verifyTokenValidationFailureModeContracts() {
  return MCP_TOKEN_VALIDATION_FAILURE_MODES.every(
    (failureMode) =>
      validateTokenFailureModeContract({ failureMode }).accepted,
  );
}

export function verifyTokenValidationChallengeReadinessContracts() {
  const wrongAudience =
    deriveTokenFailureChallengeReadiness({
      failureMode: "wrong_audience",
    });
  const wrongResource =
    deriveTokenFailureChallengeReadiness({
      failureMode: "wrong_resource",
    });
  const wrongScope = deriveTokenFailureChallengeReadiness({
    failureMode: "wrong_scope",
    requestedScopes: ["mcp:read", "evidence:read"],
  });
  const passthrough = deriveTokenFailureChallengeReadiness({
    failureMode: "token_passthrough_attempt",
  });

  return (
    wrongAudience.requiresCanonicalPublicResourceUriProof &&
    wrongResource.requiresCanonicalPublicResourceUriProof &&
    wrongScope.scopeChallenge.accepted &&
    passthrough.requiresAuthenticatedCompanyBinding &&
    [wrongAudience, wrongResource, wrongScope, passthrough].every(
      (readiness) =>
        readiness.contractOnly &&
        readiness.challengeHeaderEmitted === false &&
        readiness.challengeImplementationReadyNow === false &&
        readiness.refusalAndChallengeSeparated,
    )
  );
}

export function verifyTokenValidationNoLeakageExamples() {
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const safeExamples = [
    "No token values, sessions, cookies, authorization material, or raw finance data appear in examples.",
    `${keyName} must be absent from proof examples.`,
    "Bearer scheme references are allowed only as scheme names without token material.",
  ];
  const leakingExamples = [
    ["Authorization", ":", "Bearer", "synthetic-token-material"].join(" "),
    ["Bearer", "synthetic-token-material"].join(" "),
    ["Basic", "synthetic-basic-material"].join(" "),
    ["access_token", "=", "synthetic-token-material"].join(""),
    ["refresh_token", "=", "synthetic-token-material"].join(""),
    ["client_secret", "=", "synthetic-secret-material"].join(""),
    ["session", "=", "synthetic-session-material"].join(""),
    ["cookie", ":", "synthetic-cookie-material"].join(" "),
    ["x-api-key", ":", "synthetic-key-material"].join(" "),
    [keyName, "=", "synthetic-key-material"].join(""),
    ["sk", "-synthetic-key-material"].join(""),
    [
      "eyJsyntheticHeader",
      "eyJsyntheticPayload",
      "syntheticSignature",
    ].join("."),
    "raw finance data",
    "raw source dump",
    "provider credential",
    "app submission copy",
  ];

  return (
    safeExamples.every(
      (example) => scanTokenValidationNoLeakage(example).accepted,
    ) &&
    leakingExamples.every(
      (example) => !scanTokenValidationNoLeakage(example).accepted,
    )
  );
}

export function verifyTokenValidationScopeChallengeContracts() {
  const allowed = validateTokenScopeChallenge(["mcp:read", "evidence:read"]);
  const forbidden = [
    "finance:write",
    "admin.read",
    "mutation/source",
    "offline access",
    "provider_read",
    "*",
  ].every(
    (scope) =>
      !validateTokenScopeChallenge([scope]).accepted &&
      validateTokenScopeChallenge([scope]).forbiddenMatches.includes(scope),
  );
  const unlistedReadLike = validateTokenScopeChallenge(["finance:read"]);

  return (
    allowed.accepted &&
    allowed.readOnlyLeastPrivilege &&
    forbidden &&
    !unlistedReadLike.accepted &&
    unlistedReadLike.rejectedScopes.includes("finance:read")
  );
}

function fp0128PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "local/proof-only/read-only contract foundation",
      "token-validation failure-mode and auth-challenge readiness",
      "pure domain contracts",
      "does not validate tokens",
      "parse real tokens",
      "store tokens",
      "emit www-authenticate headers",
      "change `/mcp`",
      "change the protected-resource metadata route",
      "no route/runtime module may import or call these helpers",
      "no raw sources, source snapshots",
      "no mission state changes",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0128PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function normalizeFp0128BoundaryInput(input: Fp0128BoundaryInput): {
  planText?: string;
  repoPaths: readonly string[];
} {
  if ("repoPaths" in input) {
    return input;
  }
  return { repoPaths: input };
}

function fpPlanHits(repoPaths: readonly string[], planPrefix: string) {
  return repoPaths
    .map((path) => path.replace(/\\/gu, "/"))
    .filter((path) => path.includes(planPrefix));
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/gu, " ").trim();
}

function modeMentioned(normalizedText: string, mode: string) {
  const hyphenated = mode.replace(/_/gu, "-");
  const spaced = mode.replace(/_/gu, " ");
  return (
    normalizedText.includes(mode) ||
    normalizedText.includes(hyphenated) ||
    normalizedText.includes(spaced)
  );
}
