import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
  verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary,
} from "./read-only-app-mcp-protected-resource-metadata";
import {
  buildWwwAuthenticateAuthChallengeContract,
  deriveWwwAuthenticateResourceMetadataReferenceContract,
  textHasWwwAuthenticateNoTokenLeakage,
  validateWwwAuthenticateAuthChallengeContract,
  validateWwwAuthenticateScopeChallenge,
} from "./read-only-app-mcp-www-authenticate";
import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
  McpWwwAuthenticateAuthChallengeProofSchema,
  buildMcpWwwAuthenticateAuthChallengeContracts,
  buildMcpWwwAuthenticateAuthChallengeProof,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127PlanningTextRequiredTopics,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0128Absent,
} from "./read-only-app-mcp-www-authenticate";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
} from "./read-only-app-mcp-canonical-resource";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
} from "./read-only-app-mcp-remote-host-resource";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const mcpRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const metadataRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";

describe("FP-0127 WWW-Authenticate auth-challenge contract foundations", () => {
  it("accepts exactly one FP-0127 local proof plan while FP-0128 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    );
    const fp0127Hits = repoPaths.filter((path) => /(^|\/)FP-0127/u.test(path));

    expect(fp0127Hits).toEqual([
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    ]);
    expect(
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0128Absent(repoPaths)).toBe(true);
    expect(
      Object.values(verifyFp0127PlanningTextRequiredTopics(planText)).every(
        Boolean,
      ),
    ).toBe(true);
    expect(
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText,
        repoPaths: [...repoPaths, "plans/FP-0127-duplicate.md"],
      }),
    ).toBe(false);
    expect(
      verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts({
        planText,
        repoPaths: [
          ...repoPaths.filter((path) => !/(^|\/)FP-0127/u.test(path)),
          "plans/FP-0127-read-only-chatgpt-app-mcp-runtime-auth.md",
        ],
      }),
    ).toBe(false);
    expect(
      verifyFp0128Absent([
        ...repoPaths,
        "plans/FP-0128-read-only-chatgpt-app-mcp-auth-runtime.md",
      ]),
    ).toBe(false);
  });

  it("builds Bearer resource_metadata contract data without runtime header behavior", () => {
    const contract = buildWwwAuthenticateAuthChallengeContract();
    const proof = buildMcpWwwAuthenticateAuthChallengeProof();
    const contracts = buildMcpWwwAuthenticateAuthChallengeContracts();

    expect(contract.headerEmitted).toBe(false);
    expect(contract.challengeScheme).toBe(MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME);
    expect(contract.resourceMetadataParameter).toBe(
      MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
    );
    expect(contract.referenceContract.reference).toBe(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    );
    expect(contract.referenceContract.runtimeHeaderEmissionAllowed).toBe(false);
    expect(contracts.bearerChallengeShapeBoundary.headerStringBuilt).toBe(false);
    expect(proof.wwwAuthenticateNoRuntimeBoundaryVerified).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(McpWwwAuthenticateAuthChallengeProofSchema.safeParse(proof).success)
      .toBe(true);
    expect(
      McpWwwAuthenticateAuthChallengeProofSchema.safeParse({
        ...proof,
        noOauthImplementation: false,
      }).success,
    ).toBe(false);
  });

  it("keeps local metadata reference proof-only and blocks public reference until future proof", () => {
    const localReference =
      deriveWwwAuthenticateResourceMetadataReferenceContract();
    const blockedPublicReference =
      deriveWwwAuthenticateResourceMetadataReferenceContract({
        referenceMode: "public_runtime_canonical_url",
        resourceMetadataReference:
          "https://mcp.canonical-finance-host.com/.well-known/oauth-protected-resource/mcp",
      });

    expect(localReference.reference).toBe(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    );
    expect(localReference.localProofOnly).toBe(true);
    expect(localReference.runtimeHeaderEmissionAllowed).toBe(false);
    expect(blockedPublicReference.reference).toBeNull();
    expect(blockedPublicReference.publicRuntimeReferenceAllowed).toBe(false);
  });

  it("keeps token failures and scope challenges contract-only and least privilege", () => {
    const accepted = validateWwwAuthenticateAuthChallengeContract({
      scopes: MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
    });
    const rejectedScope = validateWwwAuthenticateScopeChallenge([
      "mcp:read",
      "finance:write",
      "offline_access",
      "provider:admin",
    ]);

    expect(accepted.accepted).toBe(true);
    expect(accepted.contractOnlyChallengeCases).toEqual([
      "missing_token",
      "invalid_token",
    ]);
    expect(accepted.tokenFailureModes).toEqual([
      "missing_token",
      "invalid_token",
      "malformed_token",
      "expired_token",
      "wrong_audience",
      "wrong_scope",
      "wrong_org",
      "revoked_token",
      "replayed_token",
    ]);
    expect(rejectedScope.accepted).toBe(false);
    expect(rejectedScope.readOnlyLeastPrivilege).toBe(false);
    expect(rejectedScope.forbiddenMatches).toEqual([
      "finance:write",
      "offline_access",
      "provider:admin",
    ]);
  });

  it("rejects challenge example leakage surfaces", () => {
    expect(
      textHasWwwAuthenticateNoTokenLeakage(
        "contract-only missing-token posture with read-only scope guidance",
      ),
    ).toBe(true);
    expect(textHasWwwAuthenticateNoTokenLeakage("token values")).toBe(false);
    expect(textHasWwwAuthenticateNoTokenLeakage("raw finance data")).toBe(false);
    expect(textHasWwwAuthenticateNoTokenLeakage("app submission copy")).toBe(
      false,
    );
  });

  it("proves /mcp and protected-resource metadata route sources remain runtime-auth free", () => {
    const mcpRouteSource = safeRead(mcpRoutePath);
    const metadataRouteSource = safeRead(metadataRoutePath);
    const executableSource = `${mcpRouteSource}\n${metadataRouteSource}`;

    expect(countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu)).toBe(1);
    expect(countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu)).toBe(1);
    expect(mcpRouteSource).not.toMatch(/WWW-Authenticate|resource_metadata/iu);
    expect(metadataRouteSource).not.toMatch(/WWW-Authenticate/iu);
    expect(executableSource).not.toMatch(
      /\b(?:oauthCallback|tokenStore|sessionStore|authMiddleware|validateToken|verifyToken|verifyBearer)\s*\(/u,
    );
  });

  it("keeps FP-0126, FP-0120, and FP-0117 guardrail plans intact", () => {
    const repoPaths = repoFilePaths();

    expect(
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: safeRead(
          FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
        ),
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
      verifyFp0117OauthImplementationSequencingPlanBoundary({
        planText: safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
        repoPaths,
      }),
    ).toBe(true);
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
