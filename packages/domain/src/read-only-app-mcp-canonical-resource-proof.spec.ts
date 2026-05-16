import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH,
  McpAuthorizationServersReadinessBoundarySchema,
  McpCanonicalResourceAuthServerProofSchema,
  McpNoRouteRuntimeBoundarySchema,
  buildMcpCanonicalResourceAuthServerContracts,
  buildMcpCanonicalResourceAuthServerProof,
  isFp0120CanonicalResourceAuthServerProofSourcePath,
  verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts,
  verifyFp0120CanonicalResourceAuthServerPlanBoundary,
  verifyFp0121Absent,
  verifyMcpCanonicalResourceAuthServerNoOpenAiApiSourceScan,
  verifyMcpCanonicalResourceAuthServerRepositoryInventory,
} from "./read-only-app-mcp-canonical-resource";
import {
  FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH,
  FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
  verifyFp0118ProtectedResourceMetadataPlanBoundary,
  verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary,
} from "./read-only-app-mcp-protected-resource-metadata";
import {
  FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH,
  verifyFp0116RemoteHostResourcePlanBoundary,
  verifyFp0117OauthImplementationSequencingPlanBoundary,
} from "./read-only-app-mcp-remote-host-resource";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function verified(value: boolean): true {
  expect(value).toBe(true);
  return true;
}

describe("FP-0120 canonical resource/auth-server readiness contracts", () => {
  it("accepts exactly one FP-0120 path while FP-0121 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH);
    const fp0120Hits = repoPaths.filter((path) => /(^|\/)FP-0120/u.test(path));
    const fp0121Hits = repoPaths.filter((path) => /(^|\/)FP-0121/u.test(path));
    const proof = buildMcpCanonicalResourceAuthServerProof({
      fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified:
        verified(
          verifyFp0120AbsentOrLocalCanonicalResourceAuthServerContracts({
            planText,
            repoPaths,
          }),
        ),
      fp0120BoundaryVerified: verified(
        verifyFp0120CanonicalResourceAuthServerPlanBoundary({
          planText,
          repoPaths,
        }),
      ),
      fp0121Absent: verified(verifyFp0121Absent(repoPaths)),
    });

    expect(fp0120Hits).toEqual([FP0120_CANONICAL_RESOURCE_AUTH_SERVER_PLAN_PATH]);
    expect(fp0121Hits).toEqual([]);
    expect(proof.fp0120BoundaryVerified).toBe(true);
    expect(
      proof.fp0120AbsentOrLocalCanonicalResourceAuthServerContractsVerified,
    ).toBe(true);
    expect(proof.fp0121Absent).toBe(true);
    expect(
      McpCanonicalResourceAuthServerProofSchema.safeParse({
        ...proof,
        fp0121Absent: false,
      }).success,
    ).toBe(false);
  });

  it("keeps FP-0120 local/proof-only and route-runtime-free", () => {
    const contracts = buildMcpCanonicalResourceAuthServerContracts();
    const proof = buildMcpCanonicalResourceAuthServerProof();

    expect(McpCanonicalResourceAuthServerProofSchema.safeParse(proof).success).toBe(
      true,
    );
    expect(proof.localProofOnly).toBe(true);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteImplementation).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noDeploymentConfig).toBe(true);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPackageScriptsAdded).toBe(true);
    expect(proof.noOpenAiClientOrKeyUsage).toBe(true);
    expect(
      McpNoRouteRuntimeBoundarySchema.safeParse(
        contracts.noRouteRuntimeBoundary,
      ).success,
    ).toBe(true);
  });

  it("requires auth servers but keeps provider selection unresolved", () => {
    const contracts = buildMcpCanonicalResourceAuthServerContracts();

    expect(
      contracts.authorizationServersReadinessBoundary
        .authorizationServersMustBeNonEmpty,
    ).toBe(true);
    expect(
      contracts.authorizationServersReadinessBoundary
        .authorizationServerProviderSelected,
    ).toBe(false);
    expect(
      contracts.authServerProviderNeutralBoundary.providerNeutral,
    ).toBe(true);
    expect(contracts.authServerProviderNeutralBoundary.providerSelected).toBe(
      false,
    );
    expect(
      McpAuthorizationServersReadinessBoundarySchema.safeParse({
        ...contracts.authorizationServersReadinessBoundary,
        authorizationServersMustBeNonEmpty: false,
      }).success,
    ).toBe(false);
  });

  it("proves no real route file, OAuth, token/session, auth middleware, or remote deployment was added", () => {
    const inventory = verifyMcpCanonicalResourceAuthServerRepositoryInventory({
      repoPaths: repoFilePaths(),
      routeSourceText: safeRead(
        "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
      ),
    });
    const proof = buildMcpCanonicalResourceAuthServerProof({
      authMiddlewareRepositoryInventoryVerified:
        inventory.authMiddlewareRepositoryInventoryVerified,
      noNewRoutePathRepositoryInventoryVerified:
        inventory.noNewRoutePathRepositoryInventoryVerified,
      oauthRuntimeRepositoryInventoryVerified:
        inventory.oauthRuntimeRepositoryInventoryVerified,
      protectedResourceMetadataRouteRepositoryInventoryVerified:
        inventory.protectedResourceMetadataRouteRepositoryInventoryVerified,
      remoteMcpDeploymentRepositoryInventoryVerified:
        inventory.remoteMcpDeploymentRepositoryInventoryVerified,
      tokenSessionRepositoryInventoryVerified:
        inventory.tokenSessionRepositoryInventoryVerified,
      wwwAuthenticateRouteRepositoryInventoryVerified:
        inventory.wwwAuthenticateRouteRepositoryInventoryVerified,
    });

    expect(inventory).toMatchObject({
      authMiddlewareRepositoryInventoryVerified: true,
      noNewRoutePathRepositoryInventoryVerified: true,
      oauthRuntimeRepositoryInventoryVerified: true,
      protectedResourceMetadataRouteRepositoryInventoryVerified: true,
      remoteMcpDeploymentRepositoryInventoryVerified: true,
      tokenSessionRepositoryInventoryVerified: true,
      wwwAuthenticateRouteRepositoryInventoryVerified: true,
    });
    expect(proof.noRouteRuntimeBoundaryVerified).toBe(true);
  });

  it("rejects simulated route/runtime expansion and provider public assets", () => {
    expect(
      verifyMcpCanonicalResourceAuthServerRepositoryInventory({
        repoPaths: [
          "apps/web/app/.well-known/oauth-protected-resource/mcp/route.ts",
        ],
      }).protectedResourceMetadataRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpCanonicalResourceAuthServerRepositoryInventory({
        repoPaths: [],
        routeSourceText:
          'reply.header("WWW-Authenticate", "Bearer resource_metadata=...")',
      }).wwwAuthenticateRouteRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpCanonicalResourceAuthServerRepositoryInventory({
        repoPaths: [
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/oauth.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/token-session-store.ts",
          "apps/control-plane/src/modules/read-only-app-mcp-endpoint/auth-middleware.ts",
          "apps/remote-mcp-server/index.ts",
        ],
      }),
    ).toMatchObject({
      authMiddlewareRepositoryInventoryVerified: false,
      oauthRuntimeRepositoryInventoryVerified: false,
      remoteMcpDeploymentRepositoryInventoryVerified: false,
      tokenSessionRepositoryInventoryVerified: false,
    });
  });

  it("preserves FP-0119, FP-0118, FP-0117, FP-0116, and prior security boundaries", () => {
    const repoPaths = repoFilePaths();
    const proof = buildMcpCanonicalResourceAuthServerProof({
      fp0100PublicSecurityBoundaryStillVerified: expectVerified(
        docsBoundary(
          "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md",
          ["public-app security boundary", "local/proof-only"],
        ),
      ),
      fp0106ProtocolEnvelopeBoundaryStillVerified: expectVerified(
        docsBoundary(
          "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md",
          ["protocol envelope", "tools/call"],
        ),
      ),
      fp0107RouteAdapterBoundaryStillVerified: expectVerified(
        docsBoundary(
          "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md",
          ["local-only", "post /mcp"],
        ),
      ),
      fp0116RemoteHostResourceBoundaryStillVerified: expectVerified(
        verifyFp0116RemoteHostResourcePlanBoundary({
          planText: safeRead(FP0116_REMOTE_HOST_RESOURCE_PLAN_PATH),
          repoPaths,
        }),
      ),
      fp0117OauthImplementationSequencingBoundaryStillVerified: expectVerified(
        verifyFp0117OauthImplementationSequencingPlanBoundary({
          planText: safeRead(FP0117_OAUTH_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
          repoPaths,
        }),
      ),
      fp0118ProtectedResourceMetadataBoundaryStillVerified: expectVerified(
        verifyFp0118ProtectedResourceMetadataPlanBoundary({
          planText: safeRead(FP0118_PROTECTED_RESOURCE_METADATA_PLAN_PATH),
          repoPaths,
        }),
      ),
      fp0119ProtectedResourceRouteSequencingBoundaryStillVerified: expectVerified(
        verifyFp0119ProtectedResourceMetadataRouteSequencingPlanBoundary({
          planText: safeRead(
            FP0119_PROTECTED_RESOURCE_METADATA_ROUTE_SEQUENCING_PLAN_PATH,
          ),
          repoPaths,
        }),
      ),
    });

    expect(proof.fp0119ProtectedResourceRouteSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0118ProtectedResourceMetadataBoundaryStillVerified).toBe(true);
    expect(proof.fp0117OauthImplementationSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0116RemoteHostResourceBoundaryStillVerified).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
  });

  it("scans FP-0120 proof sources for executable OpenAI/API/model/key usage", () => {
    const sourceScan = verifyMcpCanonicalResourceAuthServerNoOpenAiApiSourceScan({
      sourceText: repoFilePaths()
        .filter(isFp0120CanonicalResourceAuthServerProofSourcePath)
        .map(safeRead)
        .join("\n"),
    });

    expect(sourceScan.forbiddenExecutableMatches).toEqual([]);
    expect(
      sourceScan.canonicalResourceAuthServerNoOpenAiApiSourceScanVerified,
    ).toBe(true);
  });
});

function repoFilePaths() {
  const paths: string[] = [];
  const visit = (relativeDir: string) => {
    for (const entry of readdirSync(join(repoRoot, relativeDir), {
      withFileTypes: true,
    })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) visit(relativePath);
      else paths.push(relativePath);
    }
  };
  visit("");
  return paths.sort();
}

function safeRead(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function docsBoundary(relativePath: string, requiredText: readonly string[]) {
  const normalized = safeRead(relativePath).toLowerCase().replace(/`/gu, "");
  return requiredText.every((text) => normalized.includes(text));
}

function expectVerified(value: boolean): true {
  expect(value).toBe(true);
  return true;
}
