import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  MCP_WWW_AUTHENTICATE_FP0127_PLAN_PREFIX,
  MCP_WWW_AUTHENTICATE_FP0128_PLAN_PREFIX,
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
