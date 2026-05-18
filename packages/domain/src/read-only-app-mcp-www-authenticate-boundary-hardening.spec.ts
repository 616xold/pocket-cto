import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
  FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
  verifyFp0129AbsentOrDocsOnlyWwwAuthenticateChallengeImplementationSequencingPlan,
  verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary,
  verifyFp0130Absent,
  verifyFp0130LocalMissingTokenChallengeImplementationBoundary,
  verifyFp0131Absent,
} from "./read-only-app-mcp-www-authenticate";
import { FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH } from "./read-only-app-mcp-token-validation";
import { verifyFp0128TokenValidationReadinessContractsBoundary } from "./read-only-app-mcp-token-validation-proof";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH,
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
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
} from "./read-only-app-mcp-remote-host-resource";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const mcpRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";
const metadataRoutePath =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const fp0107PlanPath =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const fp0106PlanPath =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const fp0100PlanPath =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";

describe("FP-0127 WWW-Authenticate route and prior-boundary hardening", () => {
  it("limits route WWW-Authenticate behavior to the FP-0130 explicit missing-token challenge", () => {
    const routeSources = routeLikeRuntimePaths().map((path) => safeRead(path));
    const executableRouteSource = routeSources.join("\n");

    expect(executableRouteSource).toMatch(/WWW-Authenticate/u);
    expect(executableRouteSource).toMatch(
      /readOnlyAppMcpLocalProofGatedMissingTokenChallenge/u,
    );
    expect(executableRouteSource).not.toMatch(
      /\b(?:oauthCallback|tokenStore|sessionStore|authMiddleware|validateToken|verifyToken|verifyBearer|jwtVerify|decodeJwt|parseJwt)\s*\(/u,
    );
    expect(countMatches(safeRead(mcpRoutePath), /app\.post\("\/mcp"/gu)).toBe(
      1,
    );
    expect(countMatches(safeRead(mcpRoutePath), /app\.get\("\/mcp"/gu)).toBe(1);
  });

  it("accepts exact FP-0128 token-readiness contracts and keeps prior plan boundaries intact", () => {
    const repoPaths = repoFilePaths();

    expect(
      verifyFp0128TokenValidationReadinessContractsBoundary({
        planText: safeRead(
          FP0128_TOKEN_VALIDATION_READINESS_CONTRACTS_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
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
      verifyFp0129WwwAuthenticateChallengeImplementationSequencingPlanBoundary({
        planText: safeRead(
          FP0129_WWW_AUTHENTICATE_CHALLENGE_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0130Absent(repoPaths)).toBe(false);
    expect(
      verifyFp0130LocalMissingTokenChallengeImplementationBoundary({
        planText: safeRead(
          FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0131Absent(repoPaths)).toBe(true);
    expect(repoPaths.filter((path) => path.includes("FP-0127"))).toEqual([
      FP0127_WWW_AUTHENTICATE_AUTH_CHALLENGE_CONTRACTS_PLAN_PATH,
    ]);
    expect(
      verifyFp0126WwwAuthenticateAuthChallengeSequencingPlanBoundary({
        planText: safeRead(
          FP0126_WWW_AUTHENTICATE_AUTH_CHALLENGE_SEQUENCING_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      docsBoundary(
        FP0125_PROTECTED_RESOURCE_METADATA_LOCAL_ROUTE_IMPLEMENTATION_PLAN_PATH,
        [
          "local-only/read-only",
          "/.well-known/oauth-protected-resource/mcp",
          "does not implement www-authenticate behavior",
        ],
      ),
    ).toBe(true);
    expect(
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: safeRead(
          FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
        ),
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText: safeRead(
          FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
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
      docsBoundary(fp0107PlanPath, ["local/control-plane", "post /mcp"]),
    ).toBe(true);
    expect(
      docsBoundary(fp0106PlanPath, [
        "mcp protocol envelope",
        "tools/call",
        "openai api/model calls",
      ]),
    ).toBe(true);
    expect(
      docsBoundary(fp0100PlanPath, [
        "public-app security boundary",
        "local/proof-only",
        "no endpoints",
      ]),
    ).toBe(true);
    expect(safeRead(metadataRoutePath)).not.toMatch(/WWW-Authenticate/iu);
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

function routeLikeRuntimePaths() {
  return repoFilePaths().filter(
    (path) =>
      /^apps\/control-plane\/src\/.*\/routes\.ts$/u.test(path) ||
      /^apps\/control-plane\/src\/.*(?:route|router|controller)\.ts$/u.test(
        path,
      ) ||
      /^apps\/web\/app\/(?:.*\/)?route\.ts$/u.test(path),
  );
}

function docsBoundary(path: string, requiredTexts: readonly string[]) {
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(normalize(requiredText)),
  );
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[`'"]/gu, "").replace(/\s+/gu, " ");
}
