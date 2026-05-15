import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
  FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  MCP_REMOTE_HOST_CANONICAL_PATH,
  MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES,
  MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
  McpCanonicalResourceUriBoundarySchema,
  McpCorsPolicyBoundarySchema,
  McpGetSseDeferredBoundarySchema,
  McpLoggingRedactionBoundarySchema,
  McpNoRealFinanceDataPublicDemoBoundarySchema,
  McpRemoteDeploymentDeferredBoundarySchema,
  McpRemoteHostReadinessProofSchema,
  McpRemoteMcpPathBoundarySchema,
  buildMcpRemoteHostReadinessContracts,
  buildMcpRemoteHostReadinessProof,
  verifyMcpRemoteHostReadinessRepositoryInventory,
} from "./read-only-app-mcp-remote-host-readiness";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

describe("FP-0114/FP-0115 read-only MCP remote host readiness contracts", () => {
  it("accepts exact FP-0114 and docs-only FP-0115 plan paths while keeping FP-0116 absent", () => {
    const repoPaths = repoFilePaths();
    const fp0114Hits = repoPaths.filter((path) => /(^|\/)FP-0114/u.test(path));
    const fp0115Hits = repoPaths.filter((path) => /(^|\/)FP-0115/u.test(path));
    const fp0116Hits = repoPaths.filter((path) => /(^|\/)FP-0116/u.test(path));
    const proof = buildMcpRemoteHostReadinessProof({
      fp0114BoundaryVerified:
        fp0114Hits.length === 1 &&
        fp0114Hits[0] === FP0114_REMOTE_HOST_READINESS_PLAN_PATH &&
        fp0114PlanBoundaryVerified(),
      fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
        fp0115Hits.length === 1 &&
        fp0115Hits[0] ===
          FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
        fp0115PlanBoundaryVerified(),
      fp0116Absent: fp0116Hits.length === 0,
      remoteHostImplementationSequencingPlanBoundaryVerified:
        fp0115PlanBoundaryVerified(),
    });

    expect(fp0114Hits).toEqual([FP0114_REMOTE_HOST_READINESS_PLAN_PATH]);
    expect(fp0115Hits).toEqual([
      FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
    ]);
    expect(fp0116Hits).toEqual([]);
    expect(proof.fp0114BoundaryVerified).toBe(true);
    expect(
      proof.fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified,
    ).toBe(true);
    expect(proof.fp0116Absent).toBe(true);
    expect(
      McpRemoteHostReadinessProofSchema.safeParse({
        ...proof,
        fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
          false,
      }).success,
    ).toBe(false);
  });

  it("keeps FP-0114 local/proof-only and rejects remote runtime/deployment scope", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();
    const proof = buildMcpRemoteHostReadinessProof();

    expect(
      McpRemoteDeploymentDeferredBoundarySchema.safeParse(
        contracts.remoteDeploymentDeferredBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.remoteDeploymentDeferredBoundary.remoteServerStarted).toBe(
      false,
    );
    expect(
      contracts.remoteDeploymentDeferredBoundary.deploymentConfigAdded,
    ).toBe(false);
    expect(proof.localProofOnly).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noDeploymentConfigFromFp0114).toBe(true);
    expect(proof.noRemoteRuntimeBoundaryVerified).toBe(true);
  });

  it("preserves local /mcp route behavior and rejects new route paths", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();
    const proof = buildMcpRemoteHostReadinessProof();

    expect(contracts.remoteMcpPathBoundary.onlyFuturePublicMcpEndpointPath).toBe(
      MCP_REMOTE_HOST_CANONICAL_PATH,
    );
    expect(contracts.remoteMcpPathBoundary.routePathAdded).toBe(false);
    expect(contracts.remoteMcpPathBoundary.getMcpBehaviorChangeAllowed).toBe(
      false,
    );
    expect(contracts.remoteMcpPathBoundary.postMcpBehaviorChangeAllowed).toBe(
      false,
    );
    expect(
      McpRemoteMcpPathBoundarySchema.safeParse({
        ...contracts.remoteMcpPathBoundary,
        onlyFuturePublicMcpEndpointPath: "/health",
      }).success,
    ).toBe(false);
    expect(proof.noRouteBehaviorChange).toBe(true);
    expect(proof.noNewRoutePath).toBe(true);
  });

  it("requires HTTPS/TLS, canonical URI, Origin/CORS/CSP, rate limits, logging, observability, rollback, and abuse controls before remote exposure", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();
    const proof = buildMcpRemoteHostReadinessProof();

    expect(contracts.httpsTlsFutureRequirementBoundary.tlsRequired).toBe(true);
    expect(
      contracts.httpsTlsFutureRequirementBoundary.plainHttpRemoteExposureAllowed,
    ).toBe(false);
    expect(
      contracts.canonicalResourceUriBoundary.exactCanonicalResourceUriRequired,
    ).toBe(true);
    expect(
      McpCanonicalResourceUriBoundarySchema.safeParse({
        ...contracts.canonicalResourceUriBoundary,
        placeholdersAcceptedForRemoteImplementation: true,
      }).success,
    ).toBe(false);
    expect(contracts.originValidationBoundary.originValidationRequired).toBe(
      true,
    );
    expect(contracts.corsPolicyBoundary.wildcardOriginAllowed).toBe(false);
    expect(
      McpCorsPolicyBoundarySchema.safeParse({
        ...contracts.corsPolicyBoundary,
        wildcardOriginAllowed: true,
      }).success,
    ).toBe(false);
    expect(contracts.cspResourcePolicyBoundary.frameAncestorsPolicyRequired).toBe(
      true,
    );
    expect(
      contracts.rateLimitAbuseControlBoundary
        .rateLimitsRequiredBeforeRemoteExposure,
    ).toBe(true);
    expect(proof.loggingRedactionBoundaryVerified).toBe(true);
    expect(proof.observabilityAuditCorrelationBoundaryVerified).toBe(true);
    expect(proof.rollbackIncidentResponseBoundaryVerified).toBe(true);
    expect(proof.rateLimitAbuseControlBoundaryVerified).toBe(true);
  });

  it("keeps Streamable HTTP compatibility while deferring GET SSE streaming and health/readiness routes", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();
    const proof = buildMcpRemoteHostReadinessProof();

    expect(
      contracts.streamableHttpTransportBoundary
        .streamableHttpCompatibilityRequired,
    ).toBe(true);
    expect(
      contracts.streamableHttpTransportBoundary.postJsonRpcCompatibilityRequired,
    ).toBe(true);
    expect(contracts.streamableHttpTransportBoundary.getCompatibilityRequired).toBe(
      true,
    );
    expect(contracts.getSseDeferredBoundary.getSseStreamingImplemented).toBe(
      false,
    );
    expect(
      McpGetSseDeferredBoundarySchema.safeParse({
        ...contracts.getSseDeferredBoundary,
        getSseStreamingImplemented: true,
      }).success,
    ).toBe(false);
    expect(contracts.healthReadinessDeferredBoundary.healthReadinessRouteAdded).toBe(
      false,
    );
    expect(proof.getSseDeferredBoundaryVerified).toBe(true);
    expect(proof.healthReadinessDeferredBoundaryVerified).toBe(true);
  });

  it("rejects OAuth/token/session/auth middleware, Apps SDK resources, public app, app submission, data, assets, and source-pack scope", () => {
    const proof = buildMcpRemoteHostReadinessProof();

    expect(proof.noOauthImplementation).toBe(true);
    expect(proof.noTokenSessionImplementation).toBe(true);
    expect(proof.noAuthMiddlewareImplementation).toBe(true);
    expect(proof.noAppsSdkResourceImplementation).toBe(true);
    expect(proof.noAppSubmission).toBe(true);
    expect(proof.noDbQueriesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noPackageScriptsAdded).toBe(true);
    expect(proof.noPublicAssets).toBe(true);
    expect(proof.noRealFinanceDataPublicDemoBoundaryVerified).toBe(true);
    expect(proof.noOauthImplementationFromFp0115).toBe(true);
    expect(proof.noTokenSessionImplementationFromFp0115).toBe(true);
    expect(proof.noAuthMiddlewareImplementationFromFp0115).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0115).toBe(true);
    expect(proof.noAppSubmissionFromFp0115).toBe(true);
  });

  it("requires no real finance data, public demo data, raw dumps, or source packs", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();

    expect(
      contracts.noRealFinanceDataPublicDemoBoundary.forbiddenExposureCategories,
    ).toEqual([...MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES]);
    expect(
      McpNoRealFinanceDataPublicDemoBoundarySchema.safeParse({
        ...contracts.noRealFinanceDataPublicDemoBoundary,
        forbiddenExposureCategories:
          MCP_REMOTE_HOST_FORBIDDEN_EXPOSURE_CATEGORIES.slice(1),
      }).success,
    ).toBe(false);
  });

  it("requires logging redaction for token, source, evidence, provider, dump, key, and private finance categories", () => {
    const contracts = buildMcpRemoteHostReadinessContracts();

    expect(contracts.loggingRedactionBoundary.forbiddenLogCategories).toEqual([
      ...MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES,
    ]);
    expect(
      McpLoggingRedactionBoundarySchema.safeParse({
        ...contracts.loggingRedactionBoundary,
        forbiddenLogCategories: MCP_REMOTE_HOST_LOG_REDACTION_CATEGORIES.slice(
          0,
          -1,
        ),
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
        "proof text may describe that platform keys are prohibited",
      ),
    ).toBe(true);
  });

  it("keeps the durable repository-inventory scan green for current proof sources", () => {
    const inventoryProof = verifyMcpRemoteHostReadinessRepositoryInventory({
      proofSourceText: readRemoteHostReadinessSources(),
      repoPaths: repoFilePaths(),
    });
    const proof = buildMcpRemoteHostReadinessProof({
      ...inventoryProof,
    });

    expect(inventoryProof.remoteDeploymentRepositoryInventoryStillVerified).toBe(
      true,
    );
    expect(inventoryProof.noDeploymentConfigRepositoryInventoryVerified).toBe(
      true,
    );
    expect(inventoryProof.remoteMcpRuntimeRepositoryInventoryStillVerified).toBe(
      true,
    );
    expect(
      inventoryProof.fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
    ).toBe(true);
    expect(
      proof.fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
    ).toBe(true);
  });

  it("fails the durable repository-inventory scan for simulated remote runtime, deployment config, and public asset surfaces", () => {
    expect(
      verifyMcpRemoteHostReadinessRepositoryInventory({
        repoPaths: ["vercel.json"],
      }).noDeploymentConfigRepositoryInventoryVerified,
    ).toBe(false);
    expect(
      verifyMcpRemoteHostReadinessRepositoryInventory({
        repoPaths: ["apps/control-plane/src/remote-mcp/server.ts"],
      }).remoteMcpRuntimeRepositoryInventoryStillVerified,
    ).toBe(false);
    expect(
      verifyMcpRemoteHostReadinessRepositoryInventory({
        repoPaths: ["apps/web/public/mcp-submission/screenshot.png"],
      }).fp0114RemoteHostReadinessPostmergeProofDurabilityVerified,
    ).toBe(false);
    expect(
      verifyMcpRemoteHostReadinessRepositoryInventory({
        repoPaths: ["apps/web/public/listing-copy/generated-public-prose.md"],
      }).remoteMcpRuntimeRepositoryInventoryStillVerified,
    ).toBe(false);
  });

  it("proves prior FP-0113, FP-0112, FP-0111, FP-0109, FP-0107, FP-0106, and FP-0100 boundaries remain intact", () => {
    const proof = buildMcpRemoteHostReadinessProof({
      noOpenAiApiCalls: noExecutableApiModelKeyUsage(
        readRemoteHostReadinessSources(),
      ),
    });

    expect(McpRemoteHostReadinessProofSchema.safeParse(proof).success).toBe(
      true,
    );
    expect(proof.fp0113OauthSecurityBoundaryStillVerified).toBe(true);
    expect(proof.fp0112RemotePublicOauthReadinessBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0111DefaultLocalDispatchWiringStillVerified).toBe(true);
    expect(proof.fp0109AdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0107RouteAdapterBoundaryStillVerified).toBe(true);
    expect(proof.fp0106ProtocolEnvelopeBoundaryStillVerified).toBe(true);
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
  });
});

function fp0114PlanBoundaryVerified() {
  const planPath = join(repoRoot, FP0114_REMOTE_HOST_READINESS_PLAN_PATH);
  if (!existsSync(planPath)) return false;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");

  return [
    "local/proof-only/read-only remote mcp host readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "not a new endpoint",
    "local /mcp route behavior is unchanged",
    "current local /mcp route must not be exposed remotely as-is",
    "stable https host",
    "canonical mcp resource uri",
    "/mcp remains the only future public mcp endpoint path",
    "origin validation remains required",
    "cors policy must be explicit",
    "csp and resource-domain policy must be explicit",
    "rate limits and abuse controls are required",
    "logging redaction must exclude",
    "rollback and incident-response planning must exist",
    "health/readiness checks remain future-only",
    "no real finance data",
    "oauth/security contracts from fp-0113 remain prerequisites",
    "fp-0115 successor remains docs-only when present",
  ].every((text) => normalized.includes(text));
}

function fp0115PlanBoundaryVerified() {
  const planPath = join(
    repoRoot,
    FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  );
  if (!existsSync(planPath)) return false;
  const normalized = readFileSync(planPath, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");

  return [
    "docs-and-plan plus proof-gate compatibility",
    "remote mcp host implementation sequencing",
    "provider/host readiness",
    "does not implement a remote mcp host",
    "does not add deployment config",
    "does not expose the local /mcp route remotely",
    "does not implement oauth",
    "does not implement token/session",
    "does not implement auth middleware",
    "does not change route behavior",
    "does not add any new route path",
    "does not add apps sdk resources",
    "public app submission remains future-only",
    "candidate host/provider analysis",
    "current local /mcp route can not be exposed remotely as-is",
    "fp-0116 remains absent",
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

function readRemoteHostReadinessSources() {
  return repoFilePaths()
    .filter((path) =>
      /^packages\/domain\/src\/read-only-app-mcp-remote-host-readiness.*\.ts$/u.test(
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
