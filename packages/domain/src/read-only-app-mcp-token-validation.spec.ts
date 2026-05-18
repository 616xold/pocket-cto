import { existsSync, readdirSync, readFileSync } from "node:fs";
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
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan,
  verifyFp0129PlanningTextRequiredTopics,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130Absent,
  verifyFp0130AbsentOrLocalMissingTokenChallengeImplementation,
  verifyFp0130LocalMissingTokenChallengeImplementationBoundary,
  verifyFp0131Absent,
} from "./read-only-app-mcp-www-authenticate";
import {
  FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
  MCP_TOKEN_VALIDATION_FAILURE_MODES,
  MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
  buildTokenValidationReadinessContract,
  deriveTokenFailureChallengeReadiness,
  isMcpTokenValidationSourceInventoryPath,
  scanTokenValidationNoLeakage,
  validateTokenFailureModeContract,
  validateTokenScopeChallenge,
  verifyMcpTokenValidationReadinessDurabilityScan,
} from "./read-only-app-mcp-token-validation";
import {
  McpTokenValidationReadinessProofSchema,
  buildMcpTokenValidationReadinessProof,
  verifyFp0128AbsentOrLocalTokenValidationReadinessContracts,
  verifyFp0128PlanningTextRequiredTopics,
  verifyFp0128TokenValidationReadinessContractsBoundary,
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
  it("accepts FP-0128/FP-0129 plus exact FP-0130 missing-token implementation while FP-0131 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
    );
    const fp0129PlanText = safeRead(
      FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    );
    const fp0130PlanText = safeRead(
      FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
    );
    const fp0128Hits = repoPaths.filter((path) => /(^|\/)FP-0128/u.test(path));
    const fp0129Hits = repoPaths.filter((path) => /(^|\/)FP-0129/u.test(path));

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
    expect(fp0129Hits).toEqual([
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
        verifyFp0129PlanningTextRequiredTopics(fp0129PlanText),
      ).every(Boolean),
    ).toBe(true);
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
    expect(
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: fp0129PlanText,
          repoPaths: [...repoPaths, "plans/FP-0129-runtime-auth.md"],
        },
      ),
    ).toBe(false);
    expect(
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: fp0129PlanText,
        repoPaths: [
          ...repoPaths.filter((path) => !/(^|\/)FP-0129/u.test(path)),
          "plans/FP-0129-runtime-auth.md",
        ],
      }),
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
    expect(
      McpTokenValidationReadinessProofSchema.safeParse(proof).success,
    ).toBe(true);
    expect(
      McpTokenValidationReadinessProofSchema.safeParse({
        ...proof,
        noTokenValidationImplementation: false,
      }).success,
    ).toBe(false);
  });

  it("keeps token validation, parsing, session storage, auth middleware, and semantic token challenges unimplemented", () => {
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
    const accepted = validateTokenScopeChallenge(
      MCP_TOKEN_VALIDATION_READ_ONLY_SCOPES,
    );
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
      ["eyJsyntheticHeader", "eyJsyntheticPayload", "syntheticSignature"].join(
        ".",
      ),
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

  it("proves current routes do not import token-validation helpers or token/OAuth runtime auth behavior", () => {
    const routeSources = [mcpRoutePath, metadataRoutePath, appPath]
      .map(safeRead)
      .join("\n");

    expect(routeSources).not.toMatch(/read-only-app-mcp-token-validation/u);
    expect(routeSources).not.toMatch(
      /\b(?:validateToken|verifyToken|tokenValidator|jwtVerify|verifyJwt|validateBearer|verifyBearer|authMiddleware|setCookie)\b/u,
    );
    expect(routeSources).toMatch(/WWW-Authenticate/u);
    expect(routeSources).toMatch(
      /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u,
    );
    expect(countMatches(safeRead(mcpRoutePath), /app\.post\("\/mcp"/gu)).toBe(
      1,
    );
    expect(countMatches(safeRead(mcpRoutePath), /app\.get\("\/mcp"/gu)).toBe(1);
  });

  it("keeps FP-0127, FP-0126, FP-0125-adjacent, and prior boundaries intact", () => {
    const repoPaths = repoFilePaths();

    expect(
      verifyFp0127WwwAuthenticateAuthChallengeContractsBoundary({
        planText: safeRead(
          FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: safeRead(
          FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
        ),
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

  it("passes the current durable repository inventory truth", () => {
    const repoPaths = repoFilePaths();
    const scan = verifyMcpTokenValidationReadinessDurabilityScan({
      repoPaths,
      sourceTextByPath: currentInventorySourceTextByPath(repoPaths),
    });

    expect(scan.combinedChangedPaths).toEqual([]);
    expect(scan.tokenValidationBranchDiffScopeVerified).toBe(true);
    expect(scan.tokenValidationRepositoryInventoryVerified).toBe(true);
    expect(scan.tokenValidationNoRouteRuntimeRepositoryInventoryVerified).toBe(
      true,
    );
    expect(scan.tokenValidationNoCurrentRouteImportsVerified).toBe(true);
    expect(
      scan.tokenValidationWwwAuthenticateRuntimeLimitedToFp0130MissingTokenChallengeVerified,
    ).toBe(true);
    expect(scan.tokenValidationNoAuthRuntimeRepositoryInventoryVerified).toBe(
      true,
    );
    expect(
      scan.tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified,
    ).toBe(true);
    expect(scan.tokenValidationNoOpenAiSourceScanVerified).toBe(true);
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(true);
  });

  it("fails simulated committed route imports of token-validation helpers", () => {
    const scan = simulatedCommittedRouteScan(
      `import { validateToken } from "./read-only-app-mcp-token-validation";`,
    );

    expect(scan.tokenValidationNoCurrentRouteImportsVerified).toBe(false);
    expect(scan.tokenValidationRepositoryInventoryVerified).toBe(false);
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(false);
  });

  it("fails simulated committed token-validation helper usage in route source", () => {
    const forbiddenHelpers = [
      "validateToken",
      "verifyToken",
      "jwtVerify",
      "verifyBearer",
      "authMiddleware",
    ];

    for (const helper of forbiddenHelpers) {
      const scan = simulatedCommittedRouteScan(`const runtime = ${helper};`);

      expect(
        scan.tokenValidationNoRouteRuntimeRepositoryInventoryVerified,
      ).toBe(false);
      expect(scan.tokenValidationRepositoryInventoryVerified).toBe(false);
    }
  });

  it("fails simulated committed token/session/cookie storage helpers", () => {
    for (const helper of ["tokenStore", "sessionStore", "setCookie"]) {
      const scan = simulatedCommittedRouteScan(`const runtime = ${helper};`);

      expect(scan.tokenValidationNoAuthRuntimeRepositoryInventoryVerified).toBe(
        false,
      );
      expect(scan.tokenValidationRepositoryInventoryVerified).toBe(false);
    }
  });

  it("fails simulated committed WWW-Authenticate route behavior outside the FP-0130 missing-token seam", () => {
    const scan = simulatedCommittedRouteScan(
      `reply.header("WWW-Authenticate", "Bearer resource_metadata=\\"/.well-known/oauth-protected-resource/mcp\\"");`,
    );

    expect(
      scan.tokenValidationWwwAuthenticateRuntimeLimitedToFp0130MissingTokenChallengeVerified,
    ).toBe(false);
    expect(scan.tokenValidationRepositoryInventoryVerified).toBe(false);
  });

  it("fails simulated committed OAuth callback and token-exchange runtime paths", () => {
    const oauthPath =
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth-callback.ts";
    const repoPaths = [...repoFilePaths(), oauthPath];
    const scan = verifyMcpTokenValidationReadinessDurabilityScan({
      branchDiffPaths: [oauthPath],
      repoPaths,
      sourceTextByPath: {
        ...currentInventorySourceTextByPath(repoPaths),
        [oauthPath]: "export const callback = tokenExchange;",
      },
    });

    expect(scan.tokenValidationNoAuthRuntimeRepositoryInventoryVerified).toBe(
      false,
    );
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(false);
  });

  it("fails simulated committed deployment config paths", () => {
    const scan = simulatedCommittedPathScan("vercel.json");

    expect(scan.tokenValidationBranchDiffScopeVerified).toBe(false);
    expect(
      scan.tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified,
    ).toBe(false);
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(false);
  });

  it("fails simulated committed public asset, listing, and submission paths", () => {
    const forbiddenPaths = [
      "public/app-icon.png",
      "app-submission/listing-copy.md",
      "submission-assets/screenshot.png",
    ];

    for (const path of forbiddenPaths) {
      const scan = simulatedCommittedPathScan(path);

      expect(scan.tokenValidationBranchDiffScopeVerified).toBe(false);
      expect(
        scan.tokenValidationNoDeploymentPublicAssetRepositoryInventoryVerified,
      ).toBe(false);
      expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(false);
    }
  });

  it("fails simulated committed package script changes", () => {
    const scan = simulatedCommittedPathScan("package.json");

    expect(scan.noPackageScriptsAdded).toBe(false);
    expect(scan.tokenValidationBranchDiffScopeVerified).toBe(false);
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(false);
  });

  it("fails simulated executable OpenAI import, API, model, and key usage", () => {
    const scan = simulatedCommittedRouteScan(
      [
        `import OpenAI from "openai";`,
        `const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`,
        `client.responses.create({ model: "gpt-test" });`,
      ].join("\n"),
    );

    expect(scan.tokenValidationNoOpenAiSourceScanVerified).toBe(false);
    expect(scan.forbiddenOpenAiSourceMatches.length).toBeGreaterThan(0);
    expect(scan.tokenValidationRepositoryInventoryVerified).toBe(false);
  });

  it("allows safe docs/proof absence language while preserving FP-0129 absence", () => {
    const repoPaths = repoFilePaths();
    const proofPath =
      "tools/read-only-mcp-token-validation-readiness-proof.mjs";
    const scan = verifyMcpTokenValidationReadinessDurabilityScan({
      branchDiffPaths: [proofPath],
      repoPaths,
      sourceTextByPath: {
        ...currentInventorySourceTextByPath(repoPaths),
        [proofPath]:
          "// No OpenAI API/model calls, keys, provider calls, source mutation, finance writes, or app submission assets are used.",
      },
    });

    expect(scan.tokenValidationNoOpenAiSourceScanVerified).toBe(true);
    expect(scan.fp0128PostmergeProofDurabilityVerified).toBe(true);
    expect(
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: safeRead(
            FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
          ),
          repoPaths,
        },
      ),
    ).toBe(true);
    expect(
      verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan(
        {
          planText: safeRead(
            FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
          ),
          repoPaths: [...repoPaths, "plans/FP-0129-runtime-auth.md"],
        },
      ),
    ).toBe(false);
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

function currentInventorySourceTextByPath(repoPaths: readonly string[]) {
  return Object.fromEntries(
    repoPaths
      .filter(isMcpTokenValidationSourceInventoryPath)
      .filter((path) => existsSync(join(repoRoot, path)))
      .map((path) => [path, safeRead(path)]),
  );
}

function simulatedCommittedRouteScan(routeSource: string) {
  const repoPaths = repoFilePaths();
  return verifyMcpTokenValidationReadinessDurabilityScan({
    branchDiffPaths: [mcpRoutePath],
    repoPaths,
    sourceTextByPath: {
      ...currentInventorySourceTextByPath(repoPaths),
      [mcpRoutePath]: routeSource,
    },
  });
}

function simulatedCommittedPathScan(path: string) {
  const repoPaths = [...repoFilePaths(), path];
  return verifyMcpTokenValidationReadinessDurabilityScan({
    branchDiffPaths: [path],
    repoPaths,
    sourceTextByPath: currentInventorySourceTextByPath(repoPaths),
  });
}
