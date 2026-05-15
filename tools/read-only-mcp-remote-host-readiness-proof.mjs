import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
  FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
  McpRemoteHostReadinessProofSchema,
  buildMcpRemoteHostReadinessProof,
  verifyMcpRemoteHostReadinessRepositoryInventory,
} from "../packages/domain/src/read-only-app-mcp-remote-host-readiness.ts";

const FP0113_PLAN =
  "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0111_PLAN =
  "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md";
const FP0110_PLAN =
  "plans/FP-0110-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-enablement-master-plan.md";
const FP0109_PLAN =
  "plans/FP-0109-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-adapter-implementation.md";
const FP0108_PLAN =
  "plans/FP-0108-read-only-chatgpt-app-mcp-read-only-evidence-tool-dispatch-contracts.md";
const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const proofSourceText = readProofSourceText();
const sourceScan = noExecutableApiModelKeyUsage(proofSourceText);
const scopeScan = changedScopeScan();
const repositoryInventoryScan = verifyMcpRemoteHostReadinessRepositoryInventory({
  proofSourceText,
  repoPaths,
});
const fp0115PlanBoundary =
  fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified();

const proof = McpRemoteHostReadinessProofSchema.parse(
  buildMcpRemoteHostReadinessProof({
    ...repositoryInventoryScan,
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary contract",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "mcp protocol envelope",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      docsBoundary(FP0107_PLAN, ["local-only fastify", "post /mcp"]) &&
      localRouteShapeStillVerified(),
    fp0108DispatchContractsStillVerified: docsBoundary(FP0108_PLAN, [
      "evidence tool dispatch contracts",
      "does not change route behavior",
      "no openai api/model call",
    ]),
    fp0109AdapterBoundaryStillVerified: docsBoundary(FP0109_PLAN, [
      "local-only",
      "dependency-injected",
      "default fail-closed",
    ]),
    fp0110DefaultDispatchPlanBoundaryStillVerified: docsBoundary(FP0110_PLAN, [
      "docs-and-plan plus proof-gate compatibility",
      "not remote mcp deployment",
    ]),
    fp0111DefaultLocalDispatchWiringStillVerified: docsBoundary(FP0111_PLAN, [
      "explicit-dependency wiring only",
      "default buildapp() remains fail-closed",
    ]),
    fp0112RemotePublicOauthReadinessBoundaryStillVerified: docsBoundary(
      FP0112_PLAN,
      [
        "remote/public mcp deployment and oauth readiness",
        "current local /mcp route must not be exposed remotely as-is",
      ],
    ),
    fp0113OauthSecurityBoundaryStillVerified: docsBoundary(FP0113_PLAN, [
      "local/proof-only/read-only oauth, token/session",
      "token passthrough is forbidden",
      "public exposure remains blocked",
    ]),
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
      fp0114BoundaryVerified(),
    fp0114BoundaryVerified: fp0114BoundaryVerified(),
    fp0114RemoteHostReadinessBoundaryStillVerified: fp0114BoundaryVerified(),
    fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
      fp0115PlanBoundary,
    fp0116Absent: fp0116Absent(),
    remoteHostImplementationSequencingPlanBoundaryVerified: fp0115PlanBoundary,
    noAppSubmission: scopeScan.noAppSubmission,
    noAppSubmissionFromFp0115: scopeScan.noAppSubmission,
    noAppsSdkResourceImplementation: scopeScan.noAppsSdkResourceImplementation,
    noAppsSdkResourceFromFp0115: scopeScan.noAppsSdkResourceImplementation,
    noAuthMiddlewareImplementation: scopeScan.noAuthMiddlewareImplementation,
    noAuthMiddlewareImplementationFromFp0115:
      scopeScan.noAuthMiddlewareImplementation,
    noDbQueriesAdded: scopeScan.noDbQueriesAdded,
    noDbQueriesFromFp0115: scopeScan.noDbQueriesAdded,
    noDeploymentConfigFromFp0115: scopeScan.noRemoteMcpDeployment,
    noExternalCommunications: scopeScan.noExternalCommunications,
    noFinanceWrite: scopeScan.noFinanceWrite,
    noModelCalls: sourceScan.noModelCalls,
    noNewRoutePath: scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noNewRoutePathFromFp0115:
      scopeScan.noNewRoutePath && localRouteShapeStillVerified(),
    noOauthImplementation: scopeScan.noOauthImplementation,
    noOauthImplementationFromFp0115: scopeScan.noOauthImplementation,
    noOpenAiApiCalls: sourceScan.noOpenAiApiCalls,
    noOpenAiApiCallsFromFp0115: sourceScan.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage: sourceScan.noOpenAiClientOrKeyUsage,
    noPackageScriptsAdded: scopeScan.noPackageScriptsAdded,
    noPackageScriptsFromFp0115: scopeScan.noPackageScriptsAdded,
    noProviderCalls: scopeScan.noProviderCalls,
    noProviderExternalCallsFromFp0115:
      scopeScan.noProviderCalls && scopeScan.noExternalCommunications,
    noPublicAssets: scopeScan.noPublicAssets,
    noPublicAssetsSubmissionArtifactsFromFp0115:
      scopeScan.noPublicAssets && scopeScan.noAppSubmission,
    noRemoteMcpDeployment: scopeScan.noRemoteMcpDeployment,
    noRemoteMcpDeploymentFromFp0115: scopeScan.noRemoteMcpDeployment,
    noRouteBehaviorChange: scopeScan.noRouteBehaviorChange,
    noRouteBehaviorChangeFromFp0115: scopeScan.noRouteBehaviorChange,
    noSchemaMigrationsAdded: scopeScan.noSchemaMigrationsAdded,
    noSchemaMigrationsFromFp0115: scopeScan.noSchemaMigrationsAdded,
    noSourceMutation: scopeScan.noSourceMutation,
    noSourceMutationFinanceWriteFromFp0115:
      scopeScan.noSourceMutation && scopeScan.noFinanceWrite,
    noTokenSessionImplementation: scopeScan.noTokenSessionImplementation,
    noTokenSessionImplementationFromFp0115:
      scopeScan.noTokenSessionImplementation,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0114 remote host readiness proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0114BoundaryVerified() {
  const fp0114Hits = repoPaths.filter((path) => /(^|\/)FP-0114/u.test(path));
  if (
    fp0114Hits.length !== 1 ||
    fp0114Hits[0] !== FP0114_REMOTE_HOST_READINESS_PLAN_PATH ||
    !existsSync(FP0114_REMOTE_HOST_READINESS_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(safeRead(FP0114_REMOTE_HOST_READINESS_PLAN_PATH));
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

function fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified() {
  const fp0115Hits = repoPaths.filter((path) => /(^|\/)FP-0115/u.test(path));
  if (fp0115Hits.length === 0) return true;
  return (
    fp0115Hits.length === 1 &&
    fp0115Hits[0] ===
      FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH &&
    fp0115PlanBoundaryVerified()
  );
}

function fp0115PlanBoundaryVerified() {
  if (!existsSync(FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH)) {
    return false;
  }
  const normalized = normalize(
    safeRead(FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
  );

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

function fp0116Absent() {
  return !repoPaths.some((path) => /(^|\/)FP-0116/u.test(path));
}

function localRouteShapeStillVerified() {
  const routeSource = safeRead(ROUTE_PATH);
  return (
    countMatches(routeSource, /app\.post\("\/mcp"/gu) === 1 &&
    countMatches(routeSource, /app\.get\("\/mcp"/gu) === 1 &&
    !/app\.(?:get|post|put|patch|delete)\("\/mcp\//u.test(routeSource)
  );
}

function changedScopeScan() {
  const changedExecutableSource = changedPaths
    .filter(
      (path) =>
        /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path) &&
        !path.endsWith(".spec.ts") &&
        !path.startsWith("tools/") &&
        !path.startsWith("packages/domain/src/read-only-app-mcp-"),
    )
    .map(safeRead)
    .join("\n");
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;

  return {
    noAppSubmission: !changedPaths.some((path) =>
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
    ),
    noAppsSdkResourceImplementation:
      !changedPaths.some((path) =>
        /apps-sdk|app-submission|submission-assets/iu.test(path),
      ) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\s*\(?/u.test(
        changedExecutableSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
    noDbQueriesAdded:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:from\s+["']drizzle|drizzle\s*\(|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedExecutableSource,
      ),
    noExternalCommunications:
      !/\b(?:sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedExecutableSource,
      ),
    noFinanceWrite:
      !/\b(?:writeFinanceTwin|updateLedger|financeWrite|postLedger|createJournalEntry)\s*\(/u.test(
        changedExecutableSource,
      ),
    noNewRoutePath: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPackageScriptsAdded:
      !changedPaths.includes("package.json") &&
      !changedPaths.some((path) => /\/package\.json$/u.test(path)),
    noProviderCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob)\s*\(/u.test(
        changedExecutableSource,
      ),
    noPublicAssets: !changedPaths.some((path) => publicAssetPattern.test(path)),
    noRemoteMcpDeployment:
      !changedPaths.some((path) =>
        /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.yaml|fly\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
          path,
        ),
      ) &&
      !/\b(?:remoteMcpRuntime|mcpServerRuntime|startRemoteMcp|listen\s*\(|deploy\s*\()\b/u.test(
        changedExecutableSource,
      ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrationsAdded: !changedPaths.some(
      (path) =>
        /^packages\/db\//u.test(path) ||
        /(?:^|\/)migrations?\//iu.test(path) ||
        /\.(?:sql)$/iu.test(path),
    ),
    noSourceMutation:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource)\s*\(/u.test(
        changedExecutableSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedExecutableSource,
      ),
  };
}

function readProofSourceText() {
  return repoPaths
    .filter(
      (path) =>
        path === "apps/control-plane/src/app.ts" ||
        path === "apps/control-plane/src/lib/types.ts" ||
        /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\//u.test(
          path,
        ) ||
        /^apps\/control-plane\/src\/modules\/evidence-index\/tools\//u.test(
          path,
        ) ||
        /^packages\/domain\/src\/read-only-app-mcp-remote-host-readiness.*\.ts$/u.test(
          path,
        ) ||
        /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
          path,
        ) ||
        /^packages\/domain\/src\/read-only-app-mcp-evidence-tool-dispatch.*\.ts$/u.test(
          path,
        ) ||
        /^packages\/domain\/src\/read-only-app-mcp-protocol-envelope.*\.ts$/u.test(
          path,
        ) ||
        /^tools\/read-only-mcp-.*\.mjs$/u.test(path) ||
        path === "tools/benchmark-community-pack-proof.mjs",
    )
    .map(safeRead)
    .join("\n");
}

function noExecutableApiModelKeyUsage(text) {
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
  const noOpenAiApiCalls = !apiPatterns.some((pattern) => pattern.test(text));
  const noModelCalls = !modelPatterns.some((pattern) => pattern.test(text));
  const noOpenAiClientOrKeyUsage =
    noOpenAiApiCalls && !keyPatterns.some((pattern) => pattern.test(text));

  return {
    noModelCalls,
    noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
  };
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(safeRead(path));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function changedFilePaths() {
  const tracked = runGit(["diff", "--name-only", "origin/main", "--"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  return [...new Set([...tracked, ...untracked].filter(Boolean))].sort();
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function repoFilePaths() {
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);
  const results = [];

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(`${directory}/${entry.name}`, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results.sort();
}
