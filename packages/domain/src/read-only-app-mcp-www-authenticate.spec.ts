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
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  MCP_WWW_AUTHENTICATE_ALLOWED_SCOPE_CHALLENGES,
  MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
  MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
  MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
  MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
  McpWwwAuthenticateAuthChallengeProofSchema,
  buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency,
  buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse,
  buildMcpWwwAuthenticateAuthChallengeContracts,
  buildMcpWwwAuthenticateAuthChallengeProof,
  buildMcpWwwAuthenticateMissingTokenChallengeResponse,
  verifyFp0127AbsentOrLocalWwwAuthenticateAuthChallengeContracts,
  verifyFp0127PlanningTextRequiredTopics,
  verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary,
  verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan,
  verifyFp0129PlanningTextRequiredTopics,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130Absent,
  verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation,
  verifyFp0130LocalMissingTokenChallengeImplementationBoundary,
  verifyFp0130PlanningTextRequiredTopics,
  verifyFp0131Absent,
} from "./read-only-app-mcp-www-authenticate";
import { FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH } from "./read-only-app-mcp-token-validation";
import {
  verifyFp0128AbsentOrLocalTokenValidationReadinessContracts,
  verifyFp0128TokenValidationReadinessContractsBoundary,
} from "./read-only-app-mcp-token-validation-proof";
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
  it("accepts exact FP-0127/FP-0128/FP-0129 plans and the exact FP-0130 local missing-token implementation plan while FP-0131 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    );
    const fp0128PlanText = safeRead(
      FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
    );
    const fp0129PlanText = safeRead(
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    );
    const fp0130PlanText = safeRead(
      FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
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
    expect(
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText: fp0128PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText: fp0128PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(repoPaths.filter((path) => /(^|\/)FP-0129/u.test(path))).toEqual([
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    ]);
    expect(
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: fp0129PlanText,
          repoPaths,
        },
      ),
    ).toBe(true);
    expect(
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: fp0129PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0130Absent(repoPaths)).toBe(false);
    expect(repoPaths.filter((path) => /(^|\/)FP-0130/u.test(path))).toEqual([
      FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
    ]);
    expect(
      verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation({
        planText: fp0130PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0130LocalMissingTokenChallengeImplementationBoundary({
        planText: fp0130PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0131Absent(repoPaths)).toBe(true);
    expect(
      Object.values(
        verifyFp0130PlanningTextRequiredTopics(fp0130PlanText),
      ).every(Boolean),
    ).toBe(true);
    expect(
      Object.values(
        verifyFp0129PlanningTextRequiredTopics(fp0129PlanText),
      ).every(Boolean),
    ).toBe(true);
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
      verifyFp0128AbsentOrLocalTokenValidationReadinessContracts({
        planText: fp0128PlanText,
        repoPaths: [
          ...repoPaths,
          "plans/FP-0128-read-only-chatgpt-app-mcp-auth-runtime.md",
        ],
      }),
    ).toBe(false);
    expect(
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: fp0129PlanText,
          repoPaths: [...repoPaths, "plans/FP-0129-runtime.md"],
        },
      ),
    ).toBe(false);
    expect(
      verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation({
        planText: fp0130PlanText,
        repoPaths: [...repoPaths, "plans/FP-0130-runtime.md"],
      }),
    ).toBe(false);
    expect(verifyFp0131Absent([...repoPaths, "plans/FP-0131-runtime.md"])).toBe(
      false,
    );
  });

  it("records FP-0129 sequencing plus FP-0130 explicit missing-token challenge boundaries without token runtime scope", () => {
    const planText = safeRead(
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    ).toLowerCase();
    const proof = buildMcpWwwAuthenticateAuthChallengeProof({
      fp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlanVerified: true,
      fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified: true,
      fp0130LocalMissingTokenChallengeImplementationBoundaryVerified: true,
      fp0131Absent: true,
      wwwAuthenticateChallengeImplementationSequencingPlanBoundaryVerified: true,
    });

    expect(planText).toContain(
      "missing-token challenge behavior may be the first future implementation candidate",
    );
    expect(planText).toContain(
      "invalid-token challenge behavior must not implement semantic token validation",
    );
    for (const mode of [
      "malformed",
      "expired",
      "wrong-audience",
      "wrong-resource",
      "wrong-scope",
      "wrong-org",
      "revoked",
      "replayed",
      "token-passthrough-attempt",
    ]) {
      expect(planText).toContain(mode);
    }
    expect(planText).toContain("later token-validation runtime lane");
    expect(planText).toContain(
      "public runtime challenge references are blocked",
    );
    expect(planText).toContain("canonical public url proof");
    expect(planText).toContain("json-rpc refusal semantics");
    expect(planText).toContain("separate from auth challenge emission");
    expect(planText).toContain(
      "protected-resource metadata route behavior remains unchanged",
    );
    expect(planText).toContain("route emission requires an explicit later");
    expect(proof.noMcpRouteBehaviorChange).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteBehaviorChange).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(proof.noTokenValidationImplementation).toBe(true);
    expect(proof.noOauthImplementation).toBe(true);
    expect(
      proof.fp0130AbsentOrLocalMissingTokenChallengeImplementationVerified,
    ).toBe(true);
    expect(
      proof.fp0130LocalMissingTokenChallengeImplementationBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0131Absent).toBe(true);
  });

  it("builds Bearer resource_metadata contract data without runtime header behavior", () => {
    const contract = buildWwwAuthenticateAuthChallengeContract();
    const proof = buildMcpWwwAuthenticateAuthChallengeProof();
    const contracts = buildMcpWwwAuthenticateAuthChallengeContracts();

    expect(contract.headerEmitted).toBe(false);
    expect(contract.challengeScheme).toBe(
      MCP_WWW_AUTHENTICATE_CHALLENGE_SCHEME,
    );
    expect(contract.resourceMetadataParameter).toBe(
      MCP_WWW_AUTHENTICATE_RESOURCE_METADATA_PARAMETER,
    );
    expect(contract.referenceContract.reference).toBe(
      MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
    );
    expect(contract.referenceContract.runtimeHeaderEmissionAllowed).toBe(false);
    expect(contracts.bearerChallengeShapeBoundary.headerStringBuilt).toBe(
      false,
    );
    expect(proof.wwwAuthenticateNoRuntimeBoundaryVerified).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(
      McpWwwAuthenticateAuthChallengeProofSchema.safeParse(proof).success,
    ).toBe(true);
    expect(
      McpWwwAuthenticateAuthChallengeProofSchema.safeParse({
        ...proof,
        noOauthImplementation: false,
      }).success,
    ).toBe(false);
  });

  it("builds the exact local proof-gated missing-token challenge dependency and bounded responses", () => {
    const dependency =
      buildMcpWwwAuthenticateLocalProofGatedMissingTokenChallengeDependency();
    const missingTokenResponse =
      buildMcpWwwAuthenticateMissingTokenChallengeResponse(dependency);
    const authorizationPresentResponse =
      buildMcpWwwAuthenticateAuthorizationHeaderNoValidationResponse();

    expect(dependency).toMatchObject({
      authorizationHeaderBehavior:
        "fail_closed_no_token_validation_runtime",
      explicitDependencyOnly: true,
      localOnly: true,
      missingTokenOnly: true,
      noAuthMiddlewareImplementation: true,
      noOauthImplementation: true,
      noProtectedResourceMetadataRouteBehaviorChange: true,
      noTokenMaterialInChallenge: true,
      noTokenParsingRuntime: true,
      noTokenSessionStorage: true,
      noTokenValidationRuntime: true,
      proofGated: true,
      readOnly: true,
      resourceMetadataReference:
        MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      wwwAuthenticate: MCP_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_HEADER,
    });
    expect(missingTokenResponse).toEqual({
      body: {
        error: "authorization_required",
        explicitDependencyOnly: true,
        localOnly: true,
        message:
          "Authorization is required for this local read-only MCP preview.",
        missingTokenOnly: true,
        readOnly: true,
        resourceMetadata:
          MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE,
      },
      statusCode: 401,
      wwwAuthenticate: `Bearer resource_metadata="${MCP_WWW_AUTHENTICATE_LOCAL_RESOURCE_METADATA_REFERENCE}"`,
    });
    expect(authorizationPresentResponse).toEqual({
      body: {
        error: "token_validation_runtime_not_implemented",
        failClosed: true,
        localOnly: true,
        message:
          "Authorization was supplied, but this local read-only MCP preview does not implement token validation.",
        noTokenParsingRuntime: true,
        noTokenValidationRuntime: true,
        readOnly: true,
      },
      statusCode: 401,
    });
    expect(
      textHasWwwAuthenticateNoTokenLeakage(
        `${missingTokenResponse.wwwAuthenticate}\n${JSON.stringify(
          missingTokenResponse.body,
        )}\n${JSON.stringify(authorizationPresentResponse.body)}`,
      ),
    ).toBe(true);
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
    expect(textHasWwwAuthenticateNoTokenLeakage("raw finance data")).toBe(
      false,
    );
    expect(textHasWwwAuthenticateNoTokenLeakage("app submission copy")).toBe(
      false,
    );
  });

  it("proves /mcp and protected-resource metadata route sources remain token/OAuth runtime free", () => {
    const mcpRouteSource = safeRead(mcpRoutePath);
    const metadataRouteSource = safeRead(metadataRoutePath);
    const executableSource = `${mcpRouteSource}\n${metadataRouteSource}`;

    expect(countMatches(mcpRouteSource, /app\.post\("\/mcp"/gu)).toBe(1);
    expect(countMatches(mcpRouteSource, /app\.get\("\/mcp"/gu)).toBe(1);
    expect(mcpRouteSource).toMatch(/WWW-Authenticate/u);
    expect(mcpRouteSource).toMatch(
      /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u,
    );
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
