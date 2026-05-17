import {
  MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS,
  MCP_TOKEN_NO_LEAKAGE_SURFACES,
  MCP_TOKEN_VALIDATION_FAILURE_MODES,
  MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS,
  MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION,
  MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
  McpAuthMiddlewareDeferredBoundarySchema,
  McpAuthenticatedCompanyBindingBoundarySchema,
  McpClientCompanyKeySelectorOnlyBoundarySchema,
  McpTokenAudienceResourceValidationBoundarySchema,
  McpTokenFailureModeSchema,
  McpTokenFailureTaxonomyBoundarySchema,
  McpTokenNoLeakageBoundarySchema,
  McpTokenParsingDeferredBoundarySchema,
  McpTokenPassthroughForbiddenBoundarySchema,
  McpTokenScopeValidationBoundarySchema,
  McpTokenSessionStorageDeferredBoundarySchema,
  McpTokenValidationDeferredBoundarySchema,
  McpTokenValidationNoRuntimeBoundarySchema,
  McpTokenValidationReadinessProofContractSchema,
  type McpTokenFailureMode,
} from "./read-only-app-mcp-token-validation-contracts";

export * from "./read-only-app-mcp-token-validation-contracts";

export type McpTokenNoLeakageMatch = {
  excerpt: string;
  lineNumber: number;
  pattern: string;
};

export type McpTokenNoLeakageScan = {
  accepted: boolean;
  matches: readonly McpTokenNoLeakageMatch[];
  rejectionReasons: readonly string[];
};

export type McpTokenScopeChallengeValidation = {
  accepted: boolean;
  forbiddenMatches: readonly string[];
  readOnlyLeastPrivilege: boolean;
  rejectionReasons: readonly string[];
  rejectedScopes: readonly string[];
};

export type McpTokenFailureModeContractInput = {
  exampleText?: string;
  failureMode: McpTokenFailureMode;
  runtimeStatusRequested?: boolean;
  tokenMaterialPresent?: boolean;
};

export type McpTokenFailureModeContract = {
  accepted: boolean;
  contractOnly: boolean;
  failureMode: McpTokenFailureMode;
  futureOnlyStatusMapping: "future_400" | "future_401" | "future_403";
  noTokenMaterialAccepted: boolean;
  rejectionReasons: readonly string[];
  runtimeStatusEmitted: boolean;
};

export type McpTokenFailureChallengeReadinessInput = {
  authenticatedCompanyBindingProofAvailable?: boolean;
  canonicalPublicResourceUriProofAvailable?: boolean;
  failureMode: McpTokenFailureMode;
  requestedScopes?: readonly string[];
};

export type McpTokenFailureChallengeReadiness = {
  challengeHeaderEmitted: boolean;
  challengeImplementationReadyNow: boolean;
  contractOnly: boolean;
  failureMode: McpTokenFailureMode;
  futureOnlyStatusMapping: McpTokenFailureModeContract["futureOnlyStatusMapping"];
  readinessReasons: readonly string[];
  refusalAndChallengeSeparated: boolean;
  requiresAuthenticatedCompanyBinding: boolean;
  requiresCanonicalPublicResourceUriProof: boolean;
  scopeChallenge: McpTokenScopeChallengeValidation;
};

export type McpTokenValidationReadinessContractInput = {
  exampleText?: string;
  requestedScopes?: readonly string[];
};

type LeakagePattern = {
  allowSafeAbsenceWording: boolean;
  name: string;
  pattern: RegExp;
};

const openAiApiKeyName = ["OPENAI", "API", "KEY"].join("_");
const leakagePatterns: readonly LeakagePattern[] = [
  {
    allowSafeAbsenceWording: false,
    name: "authorization-bearer-header",
    pattern: /\bauthorization\s*:\s*bearer\s+\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "bearer-token-material",
    pattern:
      /\bbearer\s+(?!scheme\b|challenge\b|resource_metadata\b)[A-Za-z0-9._~+/-]{8,}={0,2}\b/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "basic-token-material",
    pattern: /\bbasic\s+[A-Za-z0-9+/=._-]{8,}\b/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "authorization-header-value",
    pattern: /\bauthorization\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "access-token-field",
    pattern: /\baccess_token\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "refresh-token-field",
    pattern: /\brefresh_token\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "client-secret-field",
    pattern: /\bclient_secret\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "session-material",
    pattern: /\bsession\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "cookie-material",
    pattern: /\bcookie\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "x-api-key-material",
    pattern: /\bx-api-key\s*[:=]\s*\S+/iu,
  },
  {
    allowSafeAbsenceWording: false,
    name: "openai-key-material",
    pattern: new RegExp(`\\b${openAiApiKeyName}\\s*[:=]\\s*\\S+`, "iu"),
  },
  {
    allowSafeAbsenceWording: true,
    name: "openai-key-name",
    pattern: new RegExp(`\\b${openAiApiKeyName}\\b`, "iu"),
  },
  {
    allowSafeAbsenceWording: false,
    name: "openai-sk-material",
    pattern: /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{8,}\b/u,
  },
  {
    allowSafeAbsenceWording: false,
    name: "jwt-like-material",
    pattern:
      /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/u,
  },
  {
    allowSafeAbsenceWording: true,
    name: "raw-finance-example",
    pattern: /\braw finance (?:data|example)s?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "raw-source-example",
    pattern: /\braw source (?:dump|example)s?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "provider-example",
    pattern: /\bprovider (?:credential|example)s?\b/iu,
  },
  {
    allowSafeAbsenceWording: true,
    name: "app-submission-example",
    pattern: /\bapp submission (?:copy|example)s?\b/iu,
  },
];

const scopeDelimiterPattern = /[:./_\-\s]+/u;

export function scanTokenValidationNoLeakage(
  text: string,
): McpTokenNoLeakageScan {
  const matches = text.split("\n").flatMap((line, index) =>
    leakagePatterns.flatMap(({ allowSafeAbsenceWording, name, pattern }) => {
      if (allowSafeAbsenceWording && isSafeAbsenceOrProhibitionText(line)) {
        return [];
      }
      if (!pattern.test(line)) return [];
      return [
        {
          excerpt: line.trim().slice(0, 160),
          lineNumber: index + 1,
          pattern: name,
        },
      ];
    }),
  );

  return {
    accepted: matches.length === 0,
    matches,
    rejectionReasons: [...new Set(matches.map((match) => match.pattern))],
  };
}

export function textHasTokenValidationNoLeakage(text: string) {
  return scanTokenValidationNoLeakage(text).accepted;
}

export function validateTokenScopeChallenge(
  scopes: readonly string[],
): McpTokenScopeChallengeValidation {
  const forbiddenMatches = scopes.filter(
    (scope) => forbiddenScopeTokensFor(scope).length > 0,
  );
  const rejectedScopes = scopes.filter(
    (scope) =>
      !MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES.includes(
        scope as (typeof MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES)[number],
      ),
  );
  const readOnlyLeastPrivilege = rejectedScopes.length === 0;
  const rejectionReasons = [
    forbiddenMatches.length === 0 ? "" : "forbidden_scope_token_detected",
    readOnlyLeastPrivilege ? "" : "scope_not_in_read_only_allowlist",
  ].filter(Boolean);

  return {
    accepted: forbiddenMatches.length === 0 && readOnlyLeastPrivilege,
    forbiddenMatches,
    readOnlyLeastPrivilege,
    rejectionReasons,
    rejectedScopes,
  };
}

export function validateTokenFailureModeContract(
  input: McpTokenFailureModeContractInput,
): McpTokenFailureModeContract {
  const failureMode = McpTokenFailureModeSchema.parse(input.failureMode);
  const leakageScan = scanTokenValidationNoLeakage(input.exampleText ?? "");
  const runtimeStatusEmitted = input.runtimeStatusRequested === true;
  const noTokenMaterialAccepted =
    input.tokenMaterialPresent !== true && leakageScan.accepted;
  const rejectionReasons = [
    runtimeStatusEmitted ? "runtime_status_mapping_requested" : "",
    noTokenMaterialAccepted ? "" : "token_material_rejected",
  ].filter(Boolean);

  return {
    accepted: rejectionReasons.length === 0,
    contractOnly: true,
    failureMode,
    futureOnlyStatusMapping: futureStatusMappingFor(failureMode),
    noTokenMaterialAccepted,
    rejectionReasons,
    runtimeStatusEmitted,
  };
}

export function deriveTokenFailureChallengeReadiness(
  input: McpTokenFailureChallengeReadinessInput,
): McpTokenFailureChallengeReadiness {
  const failureContract = validateTokenFailureModeContract({
    failureMode: input.failureMode,
  });
  const scopeChallenge = validateTokenScopeChallenge(
    input.requestedScopes ?? MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
  );
  const requiresCanonicalPublicResourceUriProof =
    input.failureMode === "wrong_audience" ||
    input.failureMode === "wrong_resource";
  const requiresAuthenticatedCompanyBinding =
    input.failureMode === "wrong_org" ||
    input.failureMode === "token_passthrough_attempt";
  const readinessReasons = [
    "runtime token validation is future-only",
    requiresCanonicalPublicResourceUriProof &&
    input.canonicalPublicResourceUriProofAvailable !== true
      ? "future canonical public MCP resource URI proof is required"
      : "",
    requiresAuthenticatedCompanyBinding &&
    input.authenticatedCompanyBindingProofAvailable !== true
      ? "authenticated user/org/company binding proof is required"
      : "",
    scopeChallenge.accepted ? "" : "read-only least-privilege scope proof failed",
  ].filter(Boolean);

  return {
    challengeHeaderEmitted: false,
    challengeImplementationReadyNow: false,
    contractOnly: true,
    failureMode: failureContract.failureMode,
    futureOnlyStatusMapping: failureContract.futureOnlyStatusMapping,
    readinessReasons,
    refusalAndChallengeSeparated: true,
    requiresAuthenticatedCompanyBinding,
    requiresCanonicalPublicResourceUriProof,
    scopeChallenge,
  };
}

export function buildTokenValidationReadinessContract(
  input: McpTokenValidationReadinessContractInput = {},
) {
  const scopeChallenge = validateTokenScopeChallenge(
    input.requestedScopes ?? MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
  );
  const leakageScan = scanTokenValidationNoLeakage(input.exampleText ?? "");

  if (!scopeChallenge.accepted || !leakageScan.accepted) {
    throw new Error(
      "Token-validation readiness contract is outside FP-0128 scope",
    );
  }

  return {
    accepted: true,
    contracts: buildMcpTokenValidationReadinessContracts(),
    failureModes: [...MCP_TOKEN_VALIDATION_FAILURE_MODES],
    headerEmitted: false,
    leakageScan,
    noRuntimeImplementation: true,
    runtimeBehaviorImplemented: false,
    scopeChallenge,
  };
}

export function buildMcpTokenValidationReadinessContracts() {
  const base = {
    implementationAdded: false,
    localProofOnly: true,
    readOnly: true,
    schemaVersion: MCP_TOKEN_VALIDATION_READINESS_SCHEMA_VERSION,
  };

  return {
    authenticatedCompanyBindingBoundary:
      McpAuthenticatedCompanyBindingBoundarySchema.parse({
        ...base,
        authenticatedCompanyRequired: true,
        authenticatedOrgRequired: true,
        authenticatedUserRequired: true,
        companyBindingRuntimeImplemented: false,
        contractKind: "McpAuthenticatedCompanyBindingBoundary",
        wrongOrgContractOnly: true,
      }),
    authMiddlewareDeferredBoundary:
      McpAuthMiddlewareDeferredBoundarySchema.parse({
        ...base,
        authMiddlewareFutureOnly: true,
        authMiddlewareImplemented: false,
        contractKind: "McpAuthMiddlewareDeferredBoundary",
        currentRoutesMayImportTokenValidationHelpers: false,
        routeGuardImplemented: false,
      }),
    clientCompanyKeySelectorOnlyBoundary:
      McpClientCompanyKeySelectorOnlyBoundarySchema.parse({
        ...base,
        clientCompanyKeyAuthorityAllowed: false,
        clientCompanyKeySelectorOnly: true,
        contractKind: "McpClientCompanyKeySelectorOnlyBoundary",
        failClosedWithoutAuthenticatedBinding: true,
        selectorCannotCreateCompanyBinding: true,
      }),
    noLeakageBoundary: McpTokenNoLeakageBoundarySchema.parse({
      ...base,
      contractKind: "McpTokenNoLeakageBoundary",
      forbiddenMaterials: [...MCP_TOKEN_FORBIDDEN_LEAKAGE_MATERIALS],
      leakageSurfaces: [...MCP_TOKEN_NO_LEAKAGE_SURFACES],
      proofOutputMayContainTokenMaterial: false,
      realTokenExamplesAllowed: false,
      routeResponsesMayContainTokenMaterial: false,
    }),
    noRuntimeBoundary: McpTokenValidationNoRuntimeBoundarySchema.parse({
      ...base,
      contractKind: "McpTokenValidationNoRuntimeBoundary",
      noAuthMiddlewareRuntime: true,
      noDbRuntime: true,
      noMcpRouteRuntimeChange: true,
      noOauthRuntime: true,
      noProtectedResourceMetadataRuntimeChange: true,
      noTokenParsingRuntime: true,
      noTokenSessionRuntime: true,
      noTokenValidationRuntime: true,
      noWwwAuthenticateRuntime: true,
    }),
    passthroughForbiddenBoundary:
      McpTokenPassthroughForbiddenBoundarySchema.parse({
        ...base,
        contractKind: "McpTokenPassthroughForbiddenBoundary",
        downstreamTokenTransitAllowed: false,
        passthroughAttemptFailsClosed: true,
        passthroughAttemptFailureMode: "token_passthrough_attempt",
        tokenPassthroughForbidden: true,
        upstreamTokenTransitAllowed: false,
      }),
    proofContract: McpTokenValidationReadinessProofContractSchema.parse({
      ...base,
      contractKind: "McpTokenValidationReadinessProofContract",
      contractOnly: true,
      noAppSubmission: true,
      noAppsSdkResourceImplementation: true,
      noAuthMiddlewareImplementation: true,
      noDbQueriesAdded: true,
      noDeploymentConfig: true,
      noExternalCommunications: true,
      noFinanceWrite: true,
      noMcpRouteBehaviorChange: true,
      noModelCalls: true,
      noOauthImplementation: true,
      noOpenAiApiCalls: true,
      noOpenAiClientOrKeyUsage: true,
      noPackageScriptsAdded: true,
      noProtectedResourceMetadataRouteBehaviorChange: true,
      noProviderCalls: true,
      noRemoteMcpDeployment: true,
      noSchemaMigrationsAdded: true,
      noSourceMutation: true,
      noTokenParsingImplementation: true,
      noTokenSessionImplementation: true,
      noTokenValidationImplementation: true,
      noWwwAuthenticateRouteBehaviorImplementation: true,
    }),
    tokenAudienceResourceValidationBoundary:
      McpTokenAudienceResourceValidationBoundarySchema.parse({
        ...base,
        audienceValidationRuntimeImplemented: false,
        clientCompanyKeyIsResourceAuthority: false,
        contractKind: "McpTokenAudienceResourceValidationBoundary",
        futureCanonicalPublicMcpResourceUriProofRequired: true,
        localRouteUrlIsTokenAudienceAuthority: false,
        resourceIndicatorRequiredBeforeValidation: true,
        wrongAudienceContractOnly: true,
        wrongResourceContractOnly: true,
      }),
    tokenFailureTaxonomyBoundary:
      McpTokenFailureTaxonomyBoundarySchema.parse({
        ...base,
        contractKind: "McpTokenFailureTaxonomyBoundary",
        failureModes: [...MCP_TOKEN_VALIDATION_FAILURE_MODES],
        futureOnlyStatusMapping: true,
        routeStatusEmittedNow: false,
        taxonomyProofOnly: true,
      }),
    tokenParsingDeferredBoundary:
      McpTokenParsingDeferredBoundarySchema.parse({
        ...base,
        contractKind: "McpTokenParsingDeferredBoundary",
        realTokenParsingImplemented: false,
        tokenDecodingAttemptAllowed: false,
        tokenIntrospectionAttemptAllowed: false,
        tokenParsingFutureOnly: true,
      }),
    tokenScopeValidationBoundary: McpTokenScopeValidationBoundarySchema.parse({
      ...base,
      allowedReadOnlyScopes: [...MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES],
      contractKind: "McpTokenScopeValidationBoundary",
      forbiddenScopeTokens: [...MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS],
      leastPrivilegeRequired: true,
      readOnlyScopesOnly: true,
      scopeChallengeCannotWidenScopes: true,
      scopeValidationRuntimeImplemented: false,
      wrongScopeContractOnly: true,
    }),
    tokenSessionStorageDeferredBoundary:
      McpTokenSessionStorageDeferredBoundarySchema.parse({
        ...base,
        contractKind: "McpTokenSessionStorageDeferredBoundary",
        refreshTokenStorageAllowedNow: false,
        sessionStorageFutureOnly: true,
        sessionStoredNow: false,
        tokenStorageFutureOnly: true,
        tokenStoredNow: false,
      }),
    tokenValidationDeferredBoundary:
      McpTokenValidationDeferredBoundarySchema.parse({
        ...base,
        contractKind: "McpTokenValidationDeferredBoundary",
        routeImplementationPlanRequired: true,
        tokenValidationFutureOnly: true,
        tokenValidationRouteImportAllowed: false,
        tokenValidationRuntimeImplemented: false,
      }),
  };
}

function futureStatusMappingFor(
  failureMode: McpTokenFailureMode,
): McpTokenFailureModeContract["futureOnlyStatusMapping"] {
  if (failureMode === "malformed_token") return "future_400";
  if (failureMode === "wrong_scope" || failureMode === "wrong_org") {
    return "future_403";
  }
  return "future_401";
}

function forbiddenScopeTokensFor(scope: string) {
  const normalized = scope.trim().toLowerCase();
  const segments = normalized
    .split(scopeDelimiterPattern)
    .filter(Boolean)
    .map(normalizeSearchToken);
  const compacted = normalizeSearchToken(normalized);

  return [
    ...new Set(
      MCP_TOKEN_VALIDATION_FORBIDDEN_SCOPE_TOKENS.filter((token) => {
        if (token === "*") return normalized.includes("*");
        const normalizedToken = normalizeSearchToken(token);
        return (
          segments.includes(normalizedToken) || compacted === normalizedToken
        );
      }),
    ),
  ];
}

function normalizeSearchToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}

function isSafeAbsenceOrProhibitionText(line: string) {
  return /\b(?:no|not|never|without|absent|absence|prohibit(?:ed|s)?|forbid(?:den)?|disallow(?:ed)?|reject(?:ed)?|blocked|must not|do not|does not|should not|cannot|can't)\b/iu.test(
    line,
  );
}
