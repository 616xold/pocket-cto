import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
  FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
  McpProtectedResourceMetadataBuilderDocumentSchema,
  McpProtectedResourceMetadataBuilderProofSchema,
  McpProtectedResourceMetadataRouteResponseContractSchema,
  buildMcpProtectedResourceMetadataBuilderProof,
  buildProtectedResourceMetadataDocument,
  deriveProtectedResourceMetadataRouteResponseContract,
  validateProtectedResourceMetadataBuilderInput,
  verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts,
  verifyFp0122PlanningTextRequiredTopics,
  verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary,
  verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts,
  verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary,
  verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan,
  type McpProtectedResourceMetadataBuilderInput,
} from "./read-only-app-mcp-protected-resource-metadata";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const validInput = {
  authorizationServers: ["https://auth.canonical-finance-host.com"],
  bearerMethodsSupported: ["header"],
  canonicalResourceUri: "https://mcp.canonical-finance-host.com/mcp",
  scopesSupported: ["mcp:read", "evidence:read"],
} satisfies McpProtectedResourceMetadataBuilderInput;

describe("FP-0122 protected-resource metadata document-builder contracts", () => {
  it("accepts exactly one FP-0122 path and exactly one FP-0123 route-input path while FP-0124 remains absent", () => {
    const repoPaths = repoFilePaths();
    const planText = safeRead(
      FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    );
    const fp0123PlanText = safeRead(
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    );
    const fp0122Hits = repoPaths.filter((path) => /(^|\/)FP-0122/u.test(path));
    const fp0123Hits = repoPaths.filter((path) => /(^|\/)FP-0123/u.test(path));

    expect(fp0122Hits).toEqual([
      FP0122_PROTECTED_RESOURCE_METADATA_BUILDER_PLAN_PATH,
    ]);
    expect(fp0123Hits).toEqual([
      FP0123_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_PLAN_PATH,
    ]);
    expect(
      verifyFp0122AbsentOrLocalProtectedResourceMetadataBuilderContracts({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0122ProtectedResourceMetadataBuilderContractsBoundary({
        planText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      Object.values(verifyFp0122PlanningTextRequiredTopics(planText)).every(
        Boolean,
      ),
    ).toBe(true);
    expect(
      verifyFp0123AbsentOrLocalProtectedResourceMetadataRouteInputContracts({
        planText: fp0123PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(
      verifyFp0123ProtectedResourceMetadataRouteInputContractsBoundary({
        planText: fp0123PlanText,
        repoPaths,
      }),
    ).toBe(true);
    expect(verifyFp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlan(repoPaths)).toBe(true);
  });

  it("builds a bounded metadata document only from accepted inputs", () => {
    const document = buildProtectedResourceMetadataDocument(validInput);
    const validation = validateProtectedResourceMetadataBuilderInput(validInput);

    expect(validation.accepted).toBe(true);
    expect(document).toEqual({
      resource: "https://mcp.canonical-finance-host.com/mcp",
      authorization_servers: ["https://auth.canonical-finance-host.com"],
      scopes_supported: ["mcp:read", "evidence:read"],
      bearer_methods_supported: ["header"],
    });
    expect(Object.keys(document)).toEqual([
      "resource",
      "authorization_servers",
      "scopes_supported",
      "bearer_methods_supported",
    ]);
    expect(
      McpProtectedResourceMetadataBuilderDocumentSchema.safeParse(document)
        .success,
    ).toBe(true);
  });

  it("fails closed for invalid canonical public MCP resource URI candidates", () => {
    const rejectedCanonicalUris = [
      "",
      "https://your-mcp.example.com/mcp",
      "http://mcp.canonical-finance-host.com/mcp",
      "https://localhost:3000/mcp",
      "https://pocket-cfo.ngrok-free.app/mcp",
      "https://mcp.canonical-finance-host.com/mcp?companyKey=acme",
      "https://mcp.canonical-finance-host.com/mcp#fragment",
      "https://mcp.canonical-finance-host.com/workspace/acme/mcp",
      "https://mcp.canonical-finance-host.com/{tenant}/mcp",
      "https://mcp.canonical-finance-host.com/companyKey/acme/mcp",
      "https://mcp.canonical-finance-host.com/user/sohaib/mcp",
      "https://mcp.canonical-finance-host.com/org/acme/mcp",
    ];

    for (const canonicalResourceUri of rejectedCanonicalUris) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        canonicalResourceUri,
      });

      expect(validation.accepted, canonicalResourceUri).toBe(false);
      expect(
        validation.rejectionReasons.includes(
          canonicalResourceUri === ""
            ? "input_shape_invalid"
            : "canonical_resource_uri_unaccepted",
        ),
      ).toBe(true);
    }
  });

  it("fails closed for canonicalResourceUri URL username and password credentials", () => {
    const validation = validateProtectedResourceMetadataBuilderInput({
      ...validInput,
      canonicalResourceUri:
        "https://user:pass@mcp.canonical-finance-host.com/mcp",
    });

    expect(validation.accepted).toBe(false);
    expect(validation.canonicalUriAccepted).toBe(false);
    expect(validation.rejectionReasons).toContain(
      "canonical_resource_uri_unaccepted",
    );
  });

  it("fails closed for canonicalResourceUri secret-like userinfo", () => {
    for (const canonicalResourceUri of [
      "https://client_secret@mcp.canonical-finance-host.com/mcp",
      "https://bearer-token@mcp.canonical-finance-host.com/mcp",
      "https://jwt@mcp.canonical-finance-host.com/mcp",
    ]) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        canonicalResourceUri,
      });

      expect(validation.accepted, canonicalResourceUri).toBe(false);
      expect(validation.canonicalUriAccepted).toBe(false);
    }
  });

  it("requires provider-neutral HTTPS authorization_servers", () => {
    const rejectedAuthorizationServers = [
      [],
      ["http://auth.canonical-finance-host.com"],
      ["https://auth.canonical-finance-host.com?token=abc"],
      ["https://auth.canonical-finance-host.com#fragment"],
      ["https://auth0.example.com"],
      ["https://tenant.okta.com/oauth2/default"],
      ["https://localhost:4444"],
      ["https://auth.canonical-finance-host.com/{tenant}"],
    ];

    for (const authorizationServers of rejectedAuthorizationServers) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        authorizationServers,
      });

      expect(validation.accepted, authorizationServers.join(",")).toBe(false);
      expect(
        validation.rejectionReasons.some((reason) =>
          [
            "input_shape_invalid",
            "authorization_servers_unaccepted",
            "token_or_private_material_detected",
          ].includes(reason),
        ),
      ).toBe(true);
    }
  });

  it("fails closed for authorization_servers URL username and password credentials", () => {
    for (const authorizationServer of [
      "https://user:pass@auth.canonical-finance-host.com",
      "https://client:secret@auth.canonical-finance-host.com",
    ]) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        authorizationServers: [authorizationServer],
      });

      expect(validation.accepted, authorizationServer).toBe(false);
      expect(validation.authorizationServersAccepted).toBe(false);
      expect(validation.rejectionReasons).toContain(
        "authorization_servers_unaccepted",
      );
    }
  });

  it("fails closed for authorization_servers secret-like userinfo", () => {
    const validation = validateProtectedResourceMetadataBuilderInput({
      ...validInput,
      authorizationServers: ["https://token@auth.canonical-finance-host.com"],
    });

    expect(validation.accepted).toBe(false);
    expect(validation.authorizationServersAccepted).toBe(false);
    expect(validation.rejectionReasons).toContain(
      "authorization_servers_unaccepted",
    );
  });

  it("fails closed for authorization_servers secret-like path fragments", () => {
    for (const token of [
      "api_key",
      "apikey",
      "accesskey",
      "password",
      "passwd",
      "secret",
      "jwt",
      "id_token",
      "sessionid",
      "session_id",
      "credential",
      "private_key",
      "bearer",
      "basic",
    ]) {
      const authorizationServer = `https://auth.canonical-finance-host.com/${token}`;
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        authorizationServers: [authorizationServer],
      });

      expect(validation.accepted, authorizationServer).toBe(false);
      expect(validation.authorizationServersAccepted).toBe(false);
    }
  });

  it("requires read-only scopes and header-only bearer methods", () => {
    const rejectedInputs = [
      { scopesSupported: ["finance:write"] },
      { scopesSupported: ["finance:*"] },
      { scopesSupported: ["admin:read"] },
      { scopesSupported: ["offline_access"] },
      { bearerMethodsSupported: ["query"] },
      { bearerMethodsSupported: ["header", "query"] },
      { bearerMethodsSupported: ["header", "body"] },
    ];

    for (const rejected of rejectedInputs) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        ...rejected,
      });

      expect(validation.accepted, JSON.stringify(rejected)).toBe(false);
    }
  });

  it("prohibits tokens, cookies, sessions, secrets, raw dumps, and companyKey authority", () => {
    const rejectedInputs = [
      {
        authorizationServers: [
          "https://auth.canonical-finance-host.com/token=abc",
        ],
      },
      {
        authorizationServers: [
          "https://auth.canonical-finance-host.com/session_token",
        ],
      },
      {
        authorizationServers: [
          "https://auth.canonical-finance-host.com/cookie=abc",
        ],
      },
      {
        authorizationServers: [
          "https://auth.canonical-finance-host.com/client_secret",
        ],
      },
      {
        canonicalResourceUri:
          "https://mcp.canonical-finance-host.com/companyKey/acme/mcp",
      },
      { scopesSupported: ["raw source:read"] },
    ];

    for (const rejected of rejectedInputs) {
      const validation = validateProtectedResourceMetadataBuilderInput({
        ...validInput,
        ...rejected,
      });

      expect(validation.accepted, JSON.stringify(rejected)).toBe(false);
      expect(
        validation.noTokenLeakageAccepted && validation.canonicalUriAccepted,
      ).not.toBe(true);
    }
  });

  it("derives only a deferred route-response contract and registers no route", () => {
    const routeContract = deriveProtectedResourceMetadataRouteResponseContract(
      validInput,
    );
    const routeSource = safeRead(
      "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
    );

    expect(routeContract.routeResponseContractOnly).toBe(true);
    expect(routeContract.routeRegistered).toBe(false);
    expect(routeContract.routeBehaviorImplemented).toBe(false);
    expect(routeContract.wwwAuthenticateBehaviorImplemented).toBe(false);
    expect(
      McpProtectedResourceMetadataRouteResponseContractSchema.safeParse(
        routeContract,
      ).success,
    ).toBe(true);
    expect(routeSource.match(/app\.post\("\/mcp"/gu)?.length).toBe(1);
    expect(routeSource.match(/app\.get\("\/mcp"/gu)?.length).toBe(1);
    expect(routeSource).not.toMatch(/oauth-protected-resource|resource_metadata/iu);
    expect(routeSource.match(/WWW-Authenticate/gu)?.length).toBe(1);
  });

  it("keeps route files limited to the FP-0130 missing-token seam in this branch", () => {
    const changedRouteFiles = changedFilePaths().filter((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    );

    expect([
      [],
      ["apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts"],
    ]).toContainEqual(changedRouteFiles);
  });

  it("proves local no-runtime posture and prior boundaries remain intact", () => {
    const proof = buildMcpProtectedResourceMetadataBuilderProof();

    expect(proof.protectedResourceMetadataBuilderContractsVerified).toBe(true);
    expect(proof.canonicalUriNoUserinfoCredentialsBoundaryVerified).toBe(true);
    expect(
      proof.authorizationServersNoUserinfoCredentialsBoundaryVerified,
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataBuilderNoCredentialBearingUrlsVerified,
    ).toBe(true);
    expect(
      proof.protectedResourceMetadataBuilderSecretPatternScanVerified,
    ).toBe(true);
    expect(proof.fp0122PostmergeCredentialLeakageHardeningVerified).toBe(true);
    expect(proof.builderRouteResponseDeferredBoundaryVerified).toBe(true);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
    expect(proof.noProtectedResourceMetadataRouteImplementation).toBe(true);
    expect(proof.noWwwAuthenticateRouteBehaviorImplementation).toBe(true);
    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noAppSubmission).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPackageScriptsAdded).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
    expect(
      proof.fp0123AbsentOrLocalProtectedResourceMetadataRouteInputContractsVerified,
    ).toBe(true);
    expect(proof.fp0124AbsentOrDocsOnlyProtectedResourceMetadataRouteImplementationPlanVerified).toBe(true);
    expect(
      proof.fp0121ProtectedResourceMetadataRoutePlanningBoundaryStillVerified,
    ).toBe(true);
    expect(proof.fp0120CanonicalResourceAuthServerBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0118ProtectedResourceMetadataBoundaryStillVerified).toBe(
      true,
    );
    expect(
      proof.fp0117OauthImplementationSequencingBoundaryStillVerified,
    ).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
    expect(
      McpProtectedResourceMetadataBuilderProofSchema.safeParse({
        ...proof,
        noRouteBehaviorChange: false,
      }).success,
    ).toBe(false);
  });
});

function repoFilePaths() {
  const results: string[] = [];
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);

  function walk(directory: string, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) walk(absolutePath, relativePath);
      else results.push(relativePath);
    }
  }

  walk(repoRoot);
  return results.sort();
}

function safeRead(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function changedFilePaths() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.replace(/^.. /u, "").replace(/.* -> /u, "").trim())
    .sort();
}
