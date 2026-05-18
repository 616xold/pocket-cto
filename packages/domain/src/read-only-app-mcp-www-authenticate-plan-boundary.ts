import {
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  MCP_WWW_AUTHENTICATE_FP0127_PLAN_PREFIX,
  MCP_WWW_AUTHENTICATE_FP0128_PLAN_PREFIX,
  MCP_WWW_AUTHENTICATE_FP0129_PLAN_PREFIX,
  MCP_WWW_AUTHENTICATE_FP0130_PLAN_PREFIX,
  MCP_WWW_AUTHENTICATE_FP0131_PLAN_PREFIX,
} from "./read-only-app-mcp-www-authenticate-contracts";

type Fp0127BoundaryInput =
  | readonly string[]
  | {
      planText?: string;
      repoPaths: readonly string[];
    };

export function verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0127Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0127_PLAN_PREFIX,
  );
  if (fp0127Hits.length === 0) return true;

  return (
    fp0127Hits.length === 1 &&
    fp0127Hits[0] ===
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH &&
    typeof planText === "string" &&
    fp0127PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0127Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0127_PLAN_PREFIX,
  );

  return (
    fp0127Hits.length === 1 &&
    fp0127Hits[0] ===
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH &&
    typeof planText === "string" &&
    fp0127PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0128Absent(repoPaths: readonly string[]) {
  return (
    fpPlanHits(repoPaths, MCP_WWW_AUTHENTICATE_FP0128_PLAN_PREFIX).length === 0
  );
}

export function verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0129Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0129_PLAN_PREFIX,
  );
  if (fp0129Hits.length === 0) return true;

  return (
    fp0129Hits.length === 1 &&
    fp0129Hits[0] ===
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    typeof planText === "string" &&
    fp0129PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0129Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0129_PLAN_PREFIX,
  );

  return (
    fp0129Hits.length === 1 &&
    fp0129Hits[0] ===
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    typeof planText === "string" &&
    fp0129PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0130Absent(repoPaths: readonly string[]) {
  return (
    fpPlanHits(repoPaths, MCP_WWW_AUTHENTICATE_FP0130_PLAN_PREFIX).length === 0
  );
}

export function verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0130Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0130_PLAN_PREFIX,
  );
  if (fp0130Hits.length === 0) return true;

  return (
    fp0130Hits.length === 1 &&
    fp0130Hits[0] ===
      FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH &&
    typeof planText === "string" &&
    fp0130PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0130LocalMissingTokenChallengeImplementationBoundary(
  input: Fp0127BoundaryInput,
) {
  const { planText, repoPaths } = normalizeFp0127BoundaryInput(input);
  const fp0130Hits = fpPlanHits(
    repoPaths,
    MCP_WWW_AUTHENTICATE_FP0130_PLAN_PREFIX,
  );

  return (
    fp0130Hits.length === 1 &&
    fp0130Hits[0] ===
      FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH &&
    typeof planText === "string" &&
    fp0130PlanTextBoundaryVerified(planText)
  );
}

export function verifyFp0131Absent(repoPaths: readonly string[]) {
  return (
    fpPlanHits(repoPaths, MCP_WWW_AUTHENTICATE_FP0131_PLAN_PREFIX).length === 0
  );
}

export function verifyFp0127PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    appsSdkSubmissionFutureOnly:
      normalized.includes("apps sdk resources") &&
      normalized.includes("app submission"),
    bearerResourceMetadata:
      normalized.includes("bearer") && normalized.includes("resource_metadata"),
    contractOnlyChallengePosture:
      normalized.includes("missing-token") &&
      normalized.includes("invalid-token") &&
      normalized.includes("contract-only"),
    exactLocalReference: normalized.includes(
      "/.well-known/oauth-protected-resource/mcp",
    ),
    fp0128Absent: normalized.includes("fp-0128 remains absent"),
    noMcpBehaviorChange: normalized.includes("does not change `/mcp`"),
    noOpenAiProviderSourceFinance:
      normalized.includes("openai api/model calls") &&
      normalized.includes("provider calls") &&
      normalized.includes("source mutation") &&
      normalized.includes("finance writes"),
    noRuntimeAuth:
      normalized.includes("does not emit www-authenticate headers") &&
      normalized.includes("does not implement oauth") &&
      normalized.includes("token validation") &&
      normalized.includes("auth middleware"),
    protectedResourceMetadataTied:
      normalized.includes("protected-resource metadata") &&
      normalized.includes("metadata url decision"),
    publicCanonicalUrlFuture: normalized.includes(
      "future canonical public url proof",
    ),
    scopeGuardrails:
      normalized.includes("read-only") &&
      normalized.includes("least-privilege") &&
      normalized.includes("write, admin, mutation, offline, provider"),
    tokenFailureFutureLane:
      normalized.includes("malformed") &&
      normalized.includes("expired") &&
      normalized.includes("wrong-audience") &&
      normalized.includes("wrong-scope") &&
      normalized.includes("wrong-org") &&
      normalized.includes("revoked") &&
      normalized.includes("replayed") &&
      normalized.includes("future token-validation lane"),
  };
}

export function verifyFp0129PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    appsSdkSubmissionFutureOnly:
      normalized.includes("apps sdk resources") &&
      normalized.includes("app submission"),
    docsProofOnly:
      normalized.includes("docs-and-plan plus proof-gate compatibility") &&
      normalized.includes("does not implement `www-authenticate` headers"),
    fp0130Absent: normalized.includes("fp-0130 remains absent"),
    invalidTokenSequencing:
      normalized.includes("invalid-token challenge behavior") &&
      normalized.includes("must not implement semantic token validation"),
    jsonRpcRefusalSeparated:
      normalized.includes("json-rpc refusal semantics") &&
      normalized.includes("separate from auth challenge emission"),
    laterTokenRuntimeLane:
      normalized.includes("malformed") &&
      normalized.includes("expired") &&
      normalized.includes("wrong-audience") &&
      normalized.includes("wrong-resource") &&
      normalized.includes("wrong-scope") &&
      normalized.includes("wrong-org") &&
      normalized.includes("revoked") &&
      normalized.includes("replayed") &&
      normalized.includes("token-passthrough-attempt") &&
      normalized.includes("later token-validation runtime lane"),
    missingTokenSequencing:
      normalized.includes("missing-token challenge behavior") &&
      normalized.includes("first future implementation candidate"),
    noMcpRouteBehaviorChange:
      normalized.includes("does not change `/mcp`") ||
      normalized.includes("no `/mcp` route behavior changed"),
    noOpenAiProviderSourceFinance:
      normalized.includes("openai api/model calls") &&
      normalized.includes("provider calls") &&
      normalized.includes("source mutation") &&
      normalized.includes("finance writes"),
    noRouteRuntime:
      normalized.includes("no www-authenticate route behavior") &&
      normalized.includes("no route path is added"),
    noTokenRuntime:
      normalized.includes("no token validation runtime") &&
      normalized.includes("token parsing runtime") &&
      normalized.includes("auth middleware"),
    protectedResourceMetadataUnchanged: normalized.includes(
      "protected-resource metadata route behavior remains unchanged",
    ),
    publicCanonicalUrlBlocked:
      normalized.includes("public runtime challenge references are blocked") &&
      normalized.includes("canonical public url proof"),
  };
}

export function verifyFp0130PlanningTextRequiredTopics(planText: string) {
  const normalized = normalize(planText);
  return {
    authorizationPresentFailsClosed:
      normalized.includes("authorization") &&
      (normalized.includes("fail closed") ||
        normalized.includes("fail-closed")) &&
      (normalized.includes("does not implement token validation") ||
        normalized.includes("no-token-validation-runtime") ||
        normalized.includes("not token validation")),
    defaultBehaviorUnchanged:
      normalized.includes("default `buildapp()`") &&
      normalized.includes("default `/mcp` behavior remain unchanged"),
    explicitDependencyOnly:
      normalized.includes("explicit app/container dependency") ||
      normalized.includes("explicit dependency"),
    localMissingTokenOnly:
      normalized.includes("local-only") &&
      normalized.includes("read-only") &&
      normalized.includes("missing-token-only"),
    noOpenAiProviderSourceFinance:
      normalized.includes("openai api/model work") &&
      normalized.includes("provider work") &&
      normalized.includes("source mutation") &&
      normalized.includes("finance write"),
    noRuntimeAuthExpansion:
      normalized.includes("not token validation") &&
      normalized.includes("token parsing") &&
      normalized.includes("oauth") &&
      normalized.includes("auth middleware"),
    protectedResourceMetadataUnchanged: normalized.includes(
      "protected-resource metadata route behavior remains unchanged",
    ),
    resourceMetadataReference: normalized.includes(
      "/.well-known/oauth-protected-resource/mcp",
    ),
    validationLadder:
      normalized.includes("read-only-mcp-www-authenticate-missing-token-challenge-proof") &&
      normalized.includes("pnpm ci:repro:current"),
  };
}

function fp0127PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "local/proof-only/read-only contract foundation",
      "future www-authenticate `resource_metadata` auth-challenge behavior",
      "pure domain contracts",
      "does not emit www-authenticate headers",
      "does not change `/mcp`",
      "does not expand the protected-resource metadata route",
      "future route implementation now has a bounded contract",
      "no raw sources, source snapshots",
      "no mission state changes",
      "no route/runtime module may import or call these helpers",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0127PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function fp0129PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "docs-and-plan plus proof-gate compatibility master plan",
      "future `www-authenticate` `resource_metadata` challenge implementation",
      "does not implement `www-authenticate` headers",
      "change any route",
      "validate tokens",
      "parse real tokens",
      "implement oauth",
      "auth middleware",
      "protected-resource metadata route behavior remains unchanged",
      "challenge emission is an http auth boundary",
      "route emission requires an explicit later implementation finance plan",
      "no raw sources, source snapshots",
      "no mission state changes",
      "no route/runtime module may import or call these helpers",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0129PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function fp0130PlanTextBoundaryVerified(planText: string) {
  const normalized = normalize(planText);
  return (
    [
      "first narrow implementation slice",
      "bounded `401 unauthorized` `www-authenticate: bearer` challenge",
      "only when app construction explicitly supplies",
      "default `buildapp()` and default `/mcp` behavior remain unchanged",
      "not token validation",
      "token parsing",
      "token/session storage",
      "auth middleware",
      "no new route path",
      "protected-resource metadata route behavior remains unchanged",
      "requests with any `authorization` header fail closed",
      "does not parse, decode, validate, introspect, store, forward, or rely on the header value",
      "source snapshots",
      "does not create mission state changes",
      "fp-0131 remains absent",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    Object.values(verifyFp0130PlanningTextRequiredTopics(planText)).every(
      Boolean,
    )
  );
}

function normalizeFp0127BoundaryInput(input: Fp0127BoundaryInput): {
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
