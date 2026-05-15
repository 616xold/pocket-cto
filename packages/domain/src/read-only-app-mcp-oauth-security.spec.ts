import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MCP_TOOL_ALLOWLIST } from "./read-only-app-mcp";
import {
  FP0113_OAUTH_SECURITY_PLAN_PATH,
  MCP_COMPANY_BINDING_REJECTED_AUTHORITIES,
  MCP_TOKEN_FAILURE_MODES,
  MCP_TOKEN_LEAKAGE_SURFACES,
  McpClientCompanyKeySelectorBoundarySchema,
  McpCompanyBindingBoundarySchema,
  McpNoTokenLeakageBoundarySchema,
  McpOauthImplementationDeferredBoundarySchema,
  McpOauthSecurityProofSchema,
  McpOrgRbacBoundarySchema,
  McpTokenFailureModeBoundarySchema,
  McpTokenPassthroughForbiddenBoundarySchema,
  buildMcpOauthSecurityContracts,
  buildMcpOauthSecurityProof,
} from "./read-only-app-mcp-oauth-security";
import { FP0114_REMOTE_HOST_READINESS_PLAN_PATH } from "./read-only-app-mcp-remote-host-readiness";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FP-0113 read-only MCP OAuth security contracts", () => {
  it("accepts exactly one FP-0113 plan path, permits exact FP-0114, and keeps FP-0115 absent", () => {
    const repoPaths = repoFilePaths();
    const fp0113Hits = repoPaths.filter((path) => /(^|\/)FP-0113/u.test(path));
    const fp0114Hits = repoPaths.filter((path) => /(^|\/)FP-0114/u.test(path));
    const fp0115Hits = repoPaths.filter((path) => /(^|\/)FP-0115/u.test(path));
    const proof = buildMcpOauthSecurityProof({
      fp0113BoundaryVerified:
        fp0113Hits.length === 1 &&
        fp0113Hits[0] === FP0113_OAUTH_SECURITY_PLAN_PATH &&
        fp0113PlanBoundaryVerified(),
      fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
        fp0114Hits.length === 1 &&
        fp0114Hits[0] === FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
      fp0115Absent: fp0115Hits.length === 0,
    });

    expect(fp0113Hits).toEqual([FP0113_OAUTH_SECURITY_PLAN_PATH]);
    expect(fp0114Hits).toEqual([FP0114_REMOTE_HOST_READINESS_PLAN_PATH]);
    expect(fp0115Hits).toEqual([]);
    expect(proof.fp0113BoundaryVerified).toBe(true);
    expect(proof.fp0114AbsentOrLocalRemoteHostReadinessContractsVerified).toBe(
      true,
    );
    expect(proof.fp0115Absent).toBe(true);
    expect(
      McpOauthSecurityProofSchema.safeParse({
        ...proof,
        fp0115Absent: false,
      }).success,
    ).toBe(false);
  });

  it("keeps OAuth, token/session, auth middleware, and remote deployment deferred", () => {
    const contracts = buildMcpOauthSecurityContracts();
    const proof = buildMcpOauthSecurityProof();

    expect(
      McpOauthImplementationDeferredBoundarySchema.safeParse(
        contracts.oauthImplementationDeferredBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.oauthImplementationDeferredBoundary.implemented).toBe(
      false,
    );
    expect(contracts.tokenSessionDeferredBoundary.tokenStoreImplemented).toBe(
      false,
    );
    expect(contracts.tokenSessionDeferredBoundary.sessionStoreImplemented).toBe(
      false,
    );
    expect(contracts.authMiddlewareDeferredBoundary.authMiddlewareAdded).toBe(
      false,
    );
    expect(contracts.remoteDeploymentDeferredBoundary.remoteServerStarted).toBe(
      false,
    );
    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
  });

  it("requires authenticated user/org/company binding and demotes client companyKey to a selector", () => {
    const contracts = buildMcpOauthSecurityContracts();

    expect(
      McpCompanyBindingBoundarySchema.safeParse(
        contracts.companyBindingBoundary,
      ).success,
    ).toBe(true);
    expect(
      contracts.companyBindingBoundary.authenticatedUserOrgMembershipRequired,
    ).toBe(true);
    expect(
      contracts.companyBindingBoundary.clientCompanyKeyAuthorityAllowed,
    ).toBe(false);
    expect(contracts.companyBindingBoundary.rejectedAuthoritySources).toEqual([
      ...MCP_COMPANY_BINDING_REJECTED_AUTHORITIES,
    ]);
    expect(
      McpClientCompanyKeySelectorBoundarySchema.safeParse({
        ...contracts.clientCompanyKeySelectorBoundary,
        selectorIsAuthority: true,
      }).success,
    ).toBe(false);
    expect(contracts.clientCompanyKeySelectorBoundary.mismatchFailsClosed).toBe(
      true,
    );
    expect(
      contracts.clientCompanyKeySelectorBoundary
        .missingAuthenticatedBindingFailsClosed,
    ).toBe(true);
  });

  it("preserves read-only RBAC and rejects Apps SDK resource/public app/submission scope", () => {
    const contracts = buildMcpOauthSecurityContracts();
    const proof = buildMcpOauthSecurityProof();

    expect(contracts.orgRbacBoundary.allowedTools).toEqual([
      ...MCP_TOOL_ALLOWLIST,
    ]);
    expect(contracts.orgRbacBoundary.writeActionToolsAllowed).toBe(false);
    expect(contracts.orgRbacBoundary.providerActionToolsAllowed).toBe(false);
    expect(
      McpOrgRbacBoundarySchema.safeParse({
        ...contracts.orgRbacBoundary,
        allowedTools: [...MCP_TOOL_ALLOWLIST, "send_report"],
      }).success,
    ).toBe(false);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noAppSubmission).toBe(true);
    expect(proof.publicExposureBlockedBoundaryVerified).toBe(true);
  });

  it("forbids token passthrough and fails closed for token failure modes", () => {
    const contracts = buildMcpOauthSecurityContracts();
    const proof = buildMcpOauthSecurityProof();

    expect(
      McpTokenPassthroughForbiddenBoundarySchema.safeParse(
        contracts.tokenPassthroughForbiddenBoundary,
      ).success,
    ).toBe(true);
    expect(
      contracts.tokenPassthroughForbiddenBoundary.tokenPassthroughForbidden,
    ).toBe(true);
    expect(
      contracts.tokenPassthroughForbiddenBoundary
        .downstreamApiTokenForwardingAllowed,
    ).toBe(false);
    expect(contracts.tokenFailureModeBoundary.failureModes).toEqual([
      ...MCP_TOKEN_FAILURE_MODES,
    ]);
    expect(proof.failureModes).toEqual([...MCP_TOKEN_FAILURE_MODES]);
    expect(
      McpTokenFailureModeBoundarySchema.safeParse({
        ...contracts.tokenFailureModeBoundary,
        failureModes: MCP_TOKEN_FAILURE_MODES.slice(0, -1),
      }).success,
    ).toBe(false);
  });

  it("keeps token storage, refresh/offline access, revocation, rotation, and leakage as contract-only", () => {
    const contracts = buildMcpOauthSecurityContracts();

    expect(
      contracts.refreshTokenOfflineAccessBoundary
        .refreshTokenPolicyReviewRequired,
    ).toBe(true);
    expect(
      contracts.refreshTokenOfflineAccessBoundary.offlineAccessGranted,
    ).toBe(false);
    expect(
      contracts.tokenStorageRedactionBoundary.tokenStorageImplemented,
    ).toBe(false);
    expect(contracts.tokenStorageRedactionBoundary.rawTokenLoggingAllowed).toBe(
      false,
    );
    expect(
      contracts.tokenRevocationRotationBoundary.revocationImplemented,
    ).toBe(false);
    expect(contracts.tokenRevocationRotationBoundary.rotationImplemented).toBe(
      false,
    );
    expect(contracts.noTokenLeakageBoundary.forbiddenSurfaces).toEqual([
      ...MCP_TOKEN_LEAKAGE_SURFACES,
    ]);
    expect(
      McpNoTokenLeakageBoundarySchema.safeParse({
        ...contracts.noTokenLeakageBoundary,
        forbiddenSurfaces: MCP_TOKEN_LEAKAGE_SURFACES.slice(1),
      }).success,
    ).toBe(false);
  });

  it("rejects executable OpenAI/API/model/key integration patterns without storing the forbidden literals in fixtures", () => {
    const packageName = ["open", "ai"].join("");
    const clientName = ["Open", "AI"].join("");
    const keyName = ["OPENAI", "API", "KEY"].join("_");
    const hostName = ["api", packageName, "com"].join(".");
    const forbiddenSamples = [
      `from "${packageName}"`,
      `require("${packageName}")`,
      `import("${packageName}")`,
      `new ${clientName}()`,
      `${packageName}.responses`,
      ["responses", "create"].join("."),
      ["chat", "completions"].join("."),
      keyName,
      `process.env.${keyName}`,
      hostName,
      ["model", "create"].join("."),
      ["models", "create"].join("."),
      ["call", "Model"].join(""),
    ];

    for (const sample of forbiddenSamples) {
      expect(noExecutableApiModelKeyUsage(sample)).toBe(false);
    }
    expect(
      noExecutableApiModelKeyUsage(
        "docs say platform tokens are prohibited; no executable client exists",
      ),
    ).toBe(true);
  });

  it("proves no route behavior, data, OpenAI/API/model, provider, source, or finance scope was added", () => {
    const proof = buildMcpOauthSecurityProof({
      noOpenAiApiCalls: noExecutableApiModelKeyUsage(
        readOauthSecuritySources(),
      ),
    });

    expect(McpOauthSecurityProofSchema.safeParse(proof).success).toBe(true);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPublicAssets).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noOpenAiClientOrKeyUsage).toBe(true);
    expect(proof.noProviderCalls).toBe(true);
    expect(proof.noExternalCommunications).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
  });
});

function fp0113PlanBoundaryVerified() {
  const planPath = join(repoRoot, FP0113_OAUTH_SECURITY_PLAN_PATH);
  if (!existsSync(planPath)) return false;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");

  return [
    "local/proof-only/read-only oauth, token/session",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "does not change /mcp route behavior",
    "client-supplied companykey is only a requested selector",
    "token passthrough is forbidden",
    "fp-0114 remains absent",
  ].every((text) => normalized.includes(text));
}

function noExecutableApiModelKeyUsage(text: string) {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const apiPatterns = [
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    new RegExp(`\\b${hostName}\\b`, "u"),
  ];
  const modelPatterns = [
    /\bcallModel\b/u,
    /\bmodel\s*\.\s*create\b/u,
    /\bmodels\s*\.\s*create\b/u,
    /\bchat\s*\.\s*completions\b/u,
    /\bresponses\s*\.\s*create\b/u,
  ];
  const keyPatterns = [
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
  ];

  return (
    !apiPatterns.some((pattern) => pattern.test(text)) &&
    !modelPatterns.some((pattern) => pattern.test(text)) &&
    !keyPatterns.some((pattern) => pattern.test(text))
  );
}

function readOauthSecuritySources() {
  return repoFilePaths()
    .filter((path) =>
      /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
        path,
      ),
    )
    .map((path) => readFileSync(join(repoRoot, path), "utf8"))
    .join("\n");
}

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
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(repoRoot);
  return results.sort();
}
