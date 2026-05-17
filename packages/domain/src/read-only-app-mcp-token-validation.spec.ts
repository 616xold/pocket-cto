import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
} from "./read-only-app-mcp-remote-host-resource";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
} from "./read-only-app-mcp-protected-resource-metadata";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
} from "./read-only-app-mcp-canonical-resource";
import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
} from "./read-only-app-mcp-www-authenticate";
import {
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  MCP_TOKEN_VALIDATION_FAILURE_MODES,
  MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
  buildTokenValidationReadinessContract,
  deriveTokenFailureChallengeReadiness,
  scanTokenValidationNoLeakage,
  validateTokenFailureModeContract,
  validateTokenScopeChallenge,
} from "./read-only-app-mcp-token-validation";
import {
  McpTokenValidationReadinessProofSchema,
  buildMcpTokenValidationReadinessProof,
  verifyFp0128AbsentOrLocalTokenValidationReadinessContracts,
  verifyFp0128PlanningTextRequiredTopics,
  verifyFp0128TokenValidationReadinessContractsBoundary,
  verifyFp0129Absent,
  verifyTokenValidationChallengeReadinessContracts,
  verifyTokenValidationFailureModeContracts,
  verifyTokenValidationNoLeakageExamples,
  verifyTokenValidationScopeChallengeContracts,
} from "./read-only-app-mcp-token-validation-proof";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const fp0123RouteInputPlanPath =
  "plans/FP-0123-read-only-chatgpt-app-mcp-protected-resource-metadata-route-input-evidence-contracts.md";
const fp0122BuilderPlanPath =
  "plans/FP-0122-read-only-chatgpt-app-mcp-protected-resource-metadata-document-builder-contracts.md";
const mcpRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const metadataRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const appPath = "apps/control-plane/src/app.ts";

describe("FP-0128 token-validation failure readiness contracts", () => {
  it("accepts exactly one FP-0128 local proof plan while FP-0129 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH);
    const fp0128Hits = repoPaths.filter((path) => /(^|\/)FP-0128/u.test(path));

    expect(fp0128Hits).toEqual([
      FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
    ]);
    expect(
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0129Absent(repoPaths)).toBe(true);
    expect(
      Object.values(verifyFp0128PlanningTextRequiredTopics(planText)).every(
        Boolean,
      ),
    ).toBe(true);
    expect(
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText,
        repoPaths: [...repoPaths, "plans/FP-0128-duplicate.md"],
      }),
    ).toBe(false);
    expect(
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText,
        repoPaths: [
          ...repoPaths.filter((path) => !/(^|\/)FP-0128/u.test(path)),
          "plans/FP-0128-read-only-chatgpt-app-mcp-runtime-token-validation.md",
        ],
      }),
    ).toBe(false);
    expect(verifyFp0129Absent([...repoPaths, "plans/FP-0129-runtime-auth.md"]))
      .toBe(false);
  });

  it("models all required failure modes as proof-only contracts", () => {
    const contract = buildTokenValidationReadinessContract();
    const proof = buildMcpTokenValidationReadinessProof();

    expect(contract.failureModes).toEqual([
      "missing_token",
      "invalid_token",
      "malformed_token",
      "expired_token",
      "wrong_audience",
      "wrong_resource",
      "wrong_scope",
      "wrong_org",
      "revoked_token",
      "replayed_token",
      "token_passthrough_attempt",
    ]);
    expect(MCP_TOKEN_VALIDATION_FAILURE_MODES).toEqual(contract.failureModes);
    expect(verifyTokenValidationFailureModeContracts()).toBe(true);
    expect(proof.tokenFailureTaxonomyBoundaryVerified).toBe(true);
    expect(McpTokenValidationReadinessProofSchema.safeParse(proof).success).toBe(
      true,
    );
    expect(
      McpTokenValidationReadinessProofSchema.safeParse({
        ...proof,
        noTokenValidationImplementation: false,
      }).success,
    ).toBe(false);
  });

  it("keeps token validation, parsing, session storage, auth middleware, and challenges unimplemented", () => {
    const proof = buildMcpTokenValidationReadinessProof();
    const readiness = deriveTokenFailureChallengeReadiness({
      failureMode: "missing_token",
    });

    expect(proof.tokenValidationDeferredBoundaryVerified).toBe(true);
    expect(proof.tokenParsingDeferredBoundaryVerified).toBe(true);
    expect(proof.tokenSessionStorageDeferredBoundaryVerified).toBe(true);
    expect(proof.authMiddlewareDeferredBoundaryVerified).toBe(true);
    expect(proof.tokenValidationNoRuntimeBoundaryVerified).toBe(true);
    expect(readiness.contractOnly).toBe(true);
    expect(readiness.challengeImplementationReadyNow).toBe(false);
    expect(readiness.challengeHeaderEmitted).toBe(false);
    expect(readiness.refusalAndChallengeSeparated).toBe(true);
  });

  it("requires future canonical public MCP URI proof for audience and resource failures", () => {
    const wrongAudience = deriveTokenFailureChallengeReadiness({
      failureMode: "wrong_audience",
    });
    const wrongResource = deriveTokenFailureChallengeReadiness({
      failureMode: "wrong_resource",
    });

    expect(wrongAudience.requiresCanonicalPublicResourceUriProof).toBe(true);
    expect(wrongResource.requiresCanonicalPublicResourceUriProof).toBe(true);
    expect(wrongAudience.challengeImplementationReadyNow).toBe(false);
    expect(wrongResource.challengeImplementationReadyNow).toBe(false);
    expect(wrongAudience.futureOnlyStatusMapping).toBe("future_401");
    expect(wrongResource.futureOnlyStatusMapping).toBe("future_401");
    expect(verifyTokenValidationChallengeReadinessContracts()).toBe(true);
  });

  it("keeps scope challenge read-only, least-privilege, and non-widening", () => {
    const accepted = validateTokenScopeChallenge(MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES);
    const forbiddenScopes = [
      "finance:write",
      "admin.read",
      "mutation/source",
      "offline access",
      "provider_read",
      "*",
    ];
    const unlistedReadLike = validateTokenScopeChallenge(["finance:read"]);

    expect(accepted.accepted).toBe(true);
    expect(accepted.readOnlyLeastPrivilege).toBe(true);
    for (const scope of forbiddenScopes) {
      const validation = validateTokenScopeChallenge([scope]);
      expect(validation.accepted, scope).toBe(false);
      expect(validation.forbiddenMatches, scope).toEqual([scope]);
    }
    expect(unlistedReadLike.accepted).toBe(false);
    expect(unlistedReadLike.rejectedScopes).toEqual(["finance:read"]);
    expect(verifyTokenValidationScopeChallengeContracts()).toBe(true);
  });

  it("keeps companyKey selector-only and requires authenticated company binding", () => {
    const wrongOrg = deriveTokenFailureChallengeReadiness({
      failureMode: "wrong_org",
    });
    const passthrough = deriveTokenFailureChallengeReadiness({
      failureMode: "token_passthrough_attempt",
    });
    const proof = buildMcpTokenValidationReadinessProof();

    expect(wrongOrg.requiresAuthenticatedCompanyBinding).toBe(true);
    expect(passthrough.requiresAuthenticatedCompanyBinding).toBe(true);
    expect(proof.authenticatedCompanyBindingPrerequisiteVerified).toBe(true);
    expect(proof.companyKeySelectorOnlyVerified).toBe(true);
    expect(proof.tokenPassthroughAttemptFailsClosedVerified).toBe(true);
  });

  it("rejects token material examples while allowing safe absence wording", () => {
    const keyName = ["OPENAI", "API", "KEY"].join("_");
    const safeText = [
      "No token values, sessions, cookies, authorization material, raw finance data, raw source dumps, provider credentials, or app submission copy appear in examples.",
      `${keyName} must be absent from proof examples.`,
      "Bearer scheme references are contract labels only.",
    ].join("\n");
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

    expect(scanTokenValidationNoLeakage(safeText).accepted).toBe(true);
    for (const text of leakingExamples) {
      const scan = scanTokenValidationNoLeakage(text);
      expect(scan.accepted, text).toBe(false);
      expect(scan.matches.length, text).toBeGreaterThan(0);
    }
    expect(verifyTokenValidationNoLeakageExamples()).toBe(true);
  });

  it("fails token failure contracts closed when runtime status or token material is requested", () => {
    expect(
      validateTokenFailureModeContract({
        failureMode: "expired_token",
      }).accepted,
    ).toBe(true);
    expect(
      validateTokenFailureModeContract({
        failureMode: "expired_token",
        runtimeStatusRequested: true,
      }).accepted,
    ).toBe(false);
    expect(
      validateTokenFailureModeContract({
        exampleText: ["Bearer", "synthetic-token-material"].join(" "),
        failureMode: "invalid_token",
      }).accepted,
    ).toBe(false);
  });

  it("proves current routes do not import token-validation helpers or runtime auth behavior", () => {
    const routeSources = [mcpRoutePath, metadataRoutePath, appPath]
      .map(safeRead)
      .join("\n");

    expect(routeSources).not.toMatch(/read-only-app-mcp-token-validation/u);
    expect(routeSources).not.toMatch(
      /\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer|authMiddleware|setCookie)\b/u,
    );
    expect(routeSources).not.toMatch(/WWW-Authenticate/iu);
    expect(countMatches(safeRead(mcpRoutePath), /app\.post\("\/mcp"/gu)).toBe(
      1,
    );
    expect(countMatches(safeRead(mcpRoutePath), /app\.get\("\/mcp"/gu)).toBe(1);
  });

  it("keeps FP-0127, FP-0126, FP-0125-adjacent, and prior boundaries intact", () => {
    const repoPaths = repoFilePaths();

    expect(
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: safeRead(FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: safeRead(FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: safeRead(fp0123RouteInputPlanPath),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: safeRead(fp0122BuilderPlanPath),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0120CanonicalResourceAuthServerPlanBoundary({
        planText: safeRead(FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0118ProtectedResourceMetadataPlanBoundary({
        planText: safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      safeRead(
        "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md",
      ),
    ).toContain("local/proof-only");
  });
});

function safeRead(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function repoFilePaths(dir = repoRoot, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const absolutePath = join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return repoFilePaths(absolutePath, relativePath);
    return [relativePath];
  });
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}
