import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  EvidenceToolDispatchProofSchema,
  FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH,
  FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH,
  FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
  FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
  FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH,
  FP0113_OAUTH_SECURITY_PLAN_PATH,
  MCP_TOOL_ALLOWLIST,
  buildEvidenceToolDispatchProof,
} from "../packages/domain/src/index.ts";
import {
  FP0114_REMOTE_HOST_READINESS_PLAN_PATH,
  FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH,
} from "../packages/domain/src/read-only-app-mcp-remote-host-readiness.ts";
import { ReadOnlyAppMcpEndpointService } from "../apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts";

const FP0107_PLAN =
  "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const sourceText = readChangedCodeSourceText();
const sourceScan = noApiModelClientKeyUsage(sourceText);
const fp0110ScopeScan = fp0110ChangedScopeScan();
const fp0112ScopeScan = fp0112ChangedScopeScan();
const fp0113ScopeScan = fp0113ChangedScopeScan();
const fp0114ScopeScan = fp0114ChangedScopeScan();
const fp0115PlanBoundary =
  fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified();
const proof = EvidenceToolDispatchProofSchema.parse(
  buildEvidenceToolDispatchProof({
    fp0100PublicSecurityBoundaryStillVerified: docsBoundary(FP0100_PLAN, [
      "public-app security boundary contract",
      "local/proof-only",
      "no endpoints",
    ]),
    fp0106ProtocolEnvelopeBoundaryStillVerified: docsBoundary(FP0106_PLAN, [
      "mcp protocol envelope and tool-dispatch proof-contract",
      "tools/call",
      "no openai api/model calls",
    ]),
    fp0107RouteAdapterBoundaryStillVerified:
      fp0107RouteAdapterBoundaryStillVerified(),
    fp0108BoundaryVerified: fp0108BoundaryVerified(),
    fp0108DispatchContractsStillVerified: fp0108BoundaryVerified(),
    fp0109BoundaryVerified: fp0109BoundaryVerified(),
    fp0109AdapterBoundaryStillVerified: fp0109BoundaryVerified(),
    fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified:
      fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified(),
    fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified:
      fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified(),
    fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified:
      fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified(),
    fp0113AbsentOrLocalOauthSecurityContractsVerified:
      fp0113AbsentOrLocalOauthSecurityContractsVerified(),
    fp0114AbsentOrLocalRemoteHostReadinessContractsVerified:
      fp0114AbsentOrLocalRemoteHostReadinessContractsVerified(),
    fp0115AbsentOrDocsOnlyRemoteHostImplementationSequencingPlanVerified:
      fp0115PlanBoundary,
    fp0116Absent: fp0116Absent(),
    oauthSecurityContractsFoundationVerified:
      oauthSecurityContractsFoundationVerified(),
    remoteHostReadinessContractsFoundationVerified:
      remoteHostReadinessContractsFoundationVerified(),
    remotePublicMcpOauthReadinessPlanBoundaryVerified:
      remotePublicMcpOauthReadinessPlanBoundaryVerified(),
    defaultLocalEvidenceDispatchEnablementPlanBoundaryVerified:
      fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified(),
    noAppsSdkResourceFromFp0110: fp0110ScopeScan.noAppsSdkResource,
    noDbQueriesFromFp0110: fp0110ScopeScan.noDbQueries,
    noDefaultDispatchRuntimeFromFp0110: noDispatchRuntimeImplemented(),
    noOauthTokenSessionFromFp0110: fp0110ScopeScan.noOauthTokenSession,
    noOpenAiApiCallsFromFp0110: sourceScan.noOpenAiApiCalls,
    noRemoteMcpDeploymentFromFp0110: fp0110ScopeScan.noRemoteMcp,
    noRouteBehaviorChangeFromFp0110:
      fp0110ScopeScan.noRouteBehaviorChange &&
      routeAdapterToolsCallStillFailClosed(),
    noSchemaMigrationsFromFp0110: fp0110ScopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0110:
      fp0110ScopeScan.noSourceMutationFinanceWrite,
    noAppsSdkResourceFromFp0112: fp0112ScopeScan.noAppsSdkResource,
    noAppSubmissionFromFp0112: fp0112ScopeScan.noAppSubmission,
    noDbQueriesFromFp0112: fp0112ScopeScan.noDbQueries,
    noOauthTokenSessionFromFp0112: fp0112ScopeScan.noOauthTokenSession,
    noOpenAiApiCallsFromFp0112: sourceScan.noOpenAiApiCalls,
    noProviderExternalCallsFromFp0112: fp0112ScopeScan.noProviderExternalCalls,
    noPublicAssetsSubmissionArtifactsFromFp0112:
      fp0112ScopeScan.noPublicAssetsSubmissionArtifacts,
    noAppsSdkResourceFromFp0113: fp0113ScopeScan.noAppsSdkResource,
    noAppSubmissionFromFp0113: fp0113ScopeScan.noAppSubmission,
    noAuthMiddlewareImplementationFromFp0113:
      fp0113ScopeScan.noAuthMiddlewareImplementation,
    noDbQueriesFromFp0113: fp0113ScopeScan.noDbQueries,
    noOauthImplementationFromFp0113: fp0113ScopeScan.noOauthImplementation,
    noOpenAiApiCallsFromFp0113: sourceScan.noOpenAiApiCalls,
    noProviderExternalCallsFromFp0113: fp0113ScopeScan.noProviderExternalCalls,
    noPublicAssetsSubmissionArtifactsFromFp0113:
      fp0113ScopeScan.noPublicAssetsSubmissionArtifacts,
    noRemoteMcpDeploymentFromFp0113: fp0113ScopeScan.noRemoteMcp,
    noRouteBehaviorChangeFromFp0113: fp0113ScopeScan.noRouteBehaviorChange,
    noSchemaMigrationsFromFp0113: fp0113ScopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0113:
      fp0113ScopeScan.noSourceMutationFinanceWrite,
    noTokenSessionImplementationFromFp0113:
      fp0113ScopeScan.noTokenSessionImplementation,
    noAppSubmissionFromFp0114: fp0114ScopeScan.noAppSubmission,
    noAppsSdkResourceFromFp0114: fp0114ScopeScan.noAppsSdkResource,
    noAuthMiddlewareImplementationFromFp0114:
      fp0114ScopeScan.noAuthMiddlewareImplementation,
    noDbQueriesFromFp0114: fp0114ScopeScan.noDbQueries,
    noDeploymentConfigFromFp0114: fp0114ScopeScan.noDeploymentConfig,
    noNewRoutePathFromFp0114: fp0114ScopeScan.noNewRoutePath,
    noOauthImplementationFromFp0114: fp0114ScopeScan.noOauthImplementation,
    noOpenAiApiCallsFromFp0114: sourceScan.noOpenAiApiCalls,
    noPackageScriptsFromFp0114: fp0114ScopeScan.noPackageScripts,
    noProviderExternalCallsFromFp0114: fp0114ScopeScan.noProviderExternalCalls,
    noPublicAssetsSubmissionArtifactsFromFp0114:
      fp0114ScopeScan.noPublicAssetsSubmissionArtifacts,
    noRemoteMcpDeploymentFromFp0114: fp0114ScopeScan.noRemoteMcp,
    noRouteBehaviorChangeFromFp0114: fp0114ScopeScan.noRouteBehaviorChange,
    noSchemaMigrationsFromFp0114: fp0114ScopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0114:
      fp0114ScopeScan.noSourceMutationFinanceWrite,
    noTokenSessionImplementationFromFp0114:
      fp0114ScopeScan.noTokenSessionImplementation,
    noRemoteMcpDeploymentFromFp0112: fp0112ScopeScan.noRemoteMcp,
    noRouteBehaviorChangeFromFp0112: fp0112ScopeScan.noRouteBehaviorChange,
    noSchemaMigrationsFromFp0112: fp0112ScopeScan.noSchemaMigrations,
    noSourceMutationFinanceWriteFromFp0112:
      fp0112ScopeScan.noSourceMutationFinanceWrite,
    noDispatchRuntimeImplemented: noDispatchRuntimeImplemented(),
    noModelCalls: sourceScan.noModelCalls,
    noOpenAiApiCalls: sourceScan.noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage: sourceScan.noOpenAiClientOrKeyUsage,
    routeAdapterToolsCallStillFailClosed:
      routeAdapterToolsCallStillFailClosed(),
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0108 evidence tool dispatch proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0108BoundaryVerified() {
  const fp0108Hits = repoPaths.filter((path) => /(^|\/)FP-0108/u.test(path));
  if (
    fp0108Hits.length !== 1 ||
    fp0108Hits[0] !== FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH ||
    !existsSync(FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    readFileSync(FP0108_EVIDENCE_TOOL_DISPATCH_PLAN_PATH, "utf8"),
  );
  return [
    "local/proof-only/read-only contract foundation",
    "does not change route behavior",
    "does not implement dispatch",
    "tools/call",
    "fail-closed",
    "evidencetooldispatchproofcontract",
    "evidencetooldispatchallowlistboundary",
    "evidencetoolargumentschemaboundary",
    "evidencetoolservicedependencyboundary",
    "evidencetoolresponseenvelopeboundary",
    "evidencetoolrefusalenvelopeboundary",
    "evidencetoolfreshnessboundary",
    "evidencetoolsourceanchorboundary",
    "evidencetoolnorawdumpboundary",
    "evidencetoolnomutationboundary",
    "evidencetoolnofinancewriteboundary",
    "evidencetoolnoproviderexternalcallboundary",
    "evidencetoolnoopenaimodelboundary",
    "evidencetooldispatchproof",
    "no dispatch runtime",
    "no route behavior",
    "no db query",
    "no openai api/model call",
    "source mutation",
    "no finance write",
    "no generated finance advice",
    "autonomous action",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0109BoundaryVerified() {
  const fp0109Hits = repoPaths.filter((path) => /(^|\/)FP-0109/u.test(path));
  if (
    fp0109Hits.length !== 1 ||
    fp0109Hits[0] !== FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH ||
    !existsSync(FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    readFileSync(FP0109_EVIDENCE_DISPATCH_ADAPTER_PLAN_PATH, "utf8"),
  );
  return [
    "local-only",
    "read-only",
    "dependency-injected",
    "evidence/source-envelope implementation",
    "default fail-closed",
    "does not add route paths",
    "db query",
    "openai api/model",
    "source mutation",
    "finance write",
    "no generated finance advice",
    "autonomous action",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0110AbsentOrDocsOnlyDefaultLocalDispatchEnablementPlanVerified() {
  const fp0110Hits = repoPaths.filter((path) => /(^|\/)FP-0110/u.test(path));
  if (fp0110Hits.length === 0) return true;
  return (
    fp0110Hits.length === 1 &&
    fp0110Hits[0] ===
      FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH &&
    fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified()
  );
}

function fp0110DefaultLocalEvidenceDispatchEnablementPlanBoundaryVerified() {
  if (
    !existsSync(FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    readFileSync(
      FP0110_DEFAULT_LOCAL_EVIDENCE_DISPATCH_ENABLEMENT_PLAN_PATH,
      "utf8",
    ),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "not default dispatch runtime enablement",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "explicit dependency injection remains required",
    "route registration may not construct the dispatcher by default",
    "fp-0111 remains absent",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0111DefaultLocalEvidenceDispatchWiringBoundaryVerified() {
  const fp0111Hits = repoPaths.filter((path) => /(^|\/)FP-0111/u.test(path));
  if (
    fp0111Hits.length !== 1 ||
    fp0111Hits[0] !== FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH ||
    !existsSync(FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH)
  ) {
    return false;
  }

  const normalized = normalize(
    readFileSync(
      FP0111_DEFAULT_LOCAL_EVIDENCE_DISPATCH_WIRING_PLAN_PATH,
      "utf8",
    ),
  );
  return [
    "local-only",
    "read-only",
    "explicit-dependency wiring only",
    "explicit app construction input",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not oauth implementation",
    "not token/session implementation",
    "not remote mcp deployment",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "not generated finance advice",
    "not autonomous action",
    "default buildapp() remains fail-closed",
    "no fp-0112",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0112AbsentOrDocsOnlyRemotePublicMcpOauthReadinessPlanVerified() {
  const fp0112Hits = repoPaths.filter((path) => /(^|\/)FP-0112/u.test(path));
  if (fp0112Hits.length === 0) return true;
  return (
    fp0112Hits.length === 1 &&
    fp0112Hits[0] === FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH &&
    remotePublicMcpOauthReadinessPlanBoundaryVerified()
  );
}

function fp0113AbsentOrLocalOauthSecurityContractsVerified() {
  const fp0113Hits = repoPaths.filter((path) => /(^|\/)FP-0113/u.test(path));
  if (fp0113Hits.length === 0) return true;
  return (
    fp0113Hits.length === 1 &&
    fp0113Hits[0] === FP0113_OAUTH_SECURITY_PLAN_PATH &&
    oauthSecurityContractsFoundationVerified()
  );
}

function fp0114AbsentOrLocalRemoteHostReadinessContractsVerified() {
  const fp0114Hits = repoPaths.filter((path) => /(^|\/)FP-0114/u.test(path));
  if (fp0114Hits.length === 0) return true;
  return (
    fp0114Hits.length === 1 &&
    fp0114Hits[0] === FP0114_REMOTE_HOST_READINESS_PLAN_PATH &&
    remoteHostReadinessContractsFoundationVerified()
  );
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
  const normalized = normalize(
    safeRead(FP0115_REMOTE_HOST_IMPLEMENTATION_SEQUENCING_PLAN_PATH),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "remote mcp host implementation sequencing",
    "provider/host readiness",
    "does not change route behavior",
    "does not add any new route path",
    "does not add deployment config",
    "public app submission remains future-only",
    "fp-0116 remains absent",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0116Absent() {
  return !repoPaths.some((path) => /(^|\/)FP-0116/u.test(path));
}

function oauthSecurityContractsFoundationVerified() {
  if (!existsSync(FP0113_OAUTH_SECURITY_PLAN_PATH)) return false;
  const normalized = normalize(safeRead(FP0113_OAUTH_SECURITY_PLAN_PATH));
  return [
    "local/proof-only/read-only oauth, token/session",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "does not change /mcp route behavior",
    "public exposure remains blocked",
    "client-supplied companykey is only a requested selector",
    "token passthrough is forbidden",
    "fp-0114 remains absent",
  ].every((requiredText) => normalized.includes(requiredText));
}

function remoteHostReadinessContractsFoundationVerified() {
  if (!existsSync(FP0114_REMOTE_HOST_READINESS_PLAN_PATH)) return false;
  const normalized = normalize(safeRead(FP0114_REMOTE_HOST_READINESS_PLAN_PATH));
  return [
    "local/proof-only/read-only remote mcp host readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not auth middleware",
    "local /mcp route behavior is unchanged",
    "current local /mcp route must not be exposed remotely as-is",
    "fp-0115 successor remains docs-only when present",
  ].every((requiredText) => normalized.includes(requiredText));
}

function remotePublicMcpOauthReadinessPlanBoundaryVerified() {
  if (!existsSync(FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH)) {
    return false;
  }

  const normalized = normalize(
    safeRead(FP0112_REMOTE_PUBLIC_MCP_OAUTH_READINESS_PLAN_PATH),
  );
  return [
    "docs-and-plan plus proof-gate compatibility",
    "remote/public mcp deployment and oauth readiness",
    "not remote mcp deployment",
    "not oauth implementation",
    "not token/session implementation",
    "not apps sdk iframe/resource implementation",
    "not public chatgpt app implementation",
    "not app submission",
    "not route expansion",
    "not a new endpoint",
    "not db query implementation",
    "not schema or migration work",
    "not openai api/model integration",
    "not source mutation",
    "not a finance write",
    "fp-0113 remains absent",
    "current local /mcp route must not be exposed remotely as-is",
    "current default local dispatch wiring is not enough for public exposure",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0107RouteAdapterBoundaryStillVerified() {
  return (
    existsSync(FP0107_PLAN) &&
    docsBoundary(FP0107_PLAN, [
      "local-only fastify",
      "tools/call",
      "fail-closed",
    ]) &&
    routeAdapterToolsCallStillFailClosed()
  );
}

function routeAdapterToolsCallStillFailClosed() {
  const service = new ReadOnlyAppMcpEndpointService();

  return MCP_TOOL_ALLOWLIST.every((toolName) => {
    const response = service.handle({
      id: `fp0108-${toolName}`,
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: validArgumentsFor(toolName),
        name: toolName,
      },
    });
    const structuredContent = response?.result?.structuredContent;
    return (
      response?.result?.isError === true &&
      structuredContent?.toolName === toolName &&
      structuredContent?.capabilityBoundary?.toolDispatchImplemented ===
        false &&
      structuredContent?.refusalReason ===
        "tool_dispatch_not_implemented_until_later_finance_plan"
    );
  });
}

function noDispatchRuntimeImplemented() {
  const fp0109SourceCoverageShimPaths = new Set([
    "apps/control-plane/src/modules/evidence-index/tools/service.ts",
    "apps/control-plane/src/modules/evidence-index/tools/service.spec.ts",
  ]);
  const runtimeSource = [
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/service.ts",
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/routes.ts",
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/formatter.ts",
    "apps/control-plane/src/modules/read-only-app-mcp-endpoint/schema.ts",
  ]
    .map(safeRead)
    .join("\n");

  return (
    !runtimeSource.includes("ReadOnlyEvidenceToolService") &&
    !runtimeSource.includes("buildEvidenceToolDispatch") &&
    !runtimeSource.includes("evidence-index/tools/service") &&
    !changedPaths.some(
      (path) =>
        /^apps\/control-plane\/src\/modules\/evidence-index\/tools\//u.test(
          path,
        ) && !fp0109SourceCoverageShimPaths.has(path),
    )
  );
}

function validArgumentsFor(toolName) {
  switch (toolName) {
    case "search_evidence":
      return { companyKey: "acme", limit: 3, query: "cash posture" };
    case "fetch_evidence_card":
      return { companyKey: "acme", evidenceCardId: "evidence-card-1" };
    case "fetch_source_anchor":
      return { companyKey: "acme", sourceAnchorId: "source-anchor-1" };
    case "fetch_document_map":
      return { companyKey: "acme", documentMapId: "document-map-1" };
    case "fetch_source_coverage":
      return { companyKey: "acme", sourceId: "source-1" };
    case "fetch_company_posture":
      return { companyKey: "acme", periodKey: "2026-04" };
    case "fetch_capability_boundaries":
      return { companyKey: "acme" };
  }
}

function docsBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(readFileSync(path, "utf8"));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function readChangedCodeSourceText() {
  return changedPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|cjs)$/u.test(path))
    .map(safeRead)
    .join("\n");
}

function fp0110ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
    .map(safeRead)
    .join("\n");
  return {
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedRuntimeSource,
      ),
    noOauthTokenSession:
      !/\b(?:oauth|tokenExchange|sessionHandler|setCookie|authorization)\b/u.test(
        changedRuntimeSource,
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite)\b/u.test(
        changedRuntimeSource,
      ),
  };
}

function isFp0110RuntimeScopePath(path) {
  return (
    path === "apps/control-plane/src/app.ts" ||
    path === "apps/control-plane/src/lib/types.ts" ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
      path,
    )
  );
}

function fp0112ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
    .map(safeRead)
    .join("\n");
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  return {
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noAppSubmission: !changedPaths.some((path) =>
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
    ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedRuntimeSource,
      ),
    noOauthTokenSession:
      !/\b(?:oauthCallback|tokenExchange|sessionHandler|setCookie|authorizationMiddleware)\b/u.test(
        changedRuntimeSource,
      ),
    noProviderExternalCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noPublicAssetsSubmissionArtifacts: !changedPaths.some(
      (path) =>
        publicAssetPattern.test(path) ||
        /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
          path,
        ),
    ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
  };
}

function fp0113ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
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
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedRuntimeSource,
      ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noProviderExternalCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noPublicAssetsSubmissionArtifacts:
      !changedPaths.some((path) => publicAssetPattern.test(path)) &&
      !changedPaths.some((path) =>
        /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
          path,
        ),
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
  };
}

function fp0114ChangedScopeScan() {
  const changedRuntimeSource = changedPaths
    .filter(isFp0110RuntimeScopePath)
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
    noAppsSdkResource:
      !changedPaths.some((path) => /apps-sdk|resource|iframe/iu.test(path)) &&
      !/\b(?:registerResource|ui:\/\/|componentResource|iframe)\b/u.test(
        changedRuntimeSource,
      ),
    noAuthMiddlewareImplementation:
      !/\b(?:authMiddleware|authorizationMiddleware|routeGuard|verifyBearer|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noDbQueries:
      !changedPaths.some((path) => /^packages\/db\//u.test(path)) &&
      !/\b(?:drizzle|select\s*\(|insert\s*\(|update\s*\(|delete\s*\(|sql`)\b/u.test(
        changedRuntimeSource,
      ),
    noDeploymentConfig: !changedPaths.some((path) =>
      /(?:^|\/)(?:vercel\.json|netlify\.toml|render\.yaml|fly\.toml|Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/.*\.ya?ml)$/iu.test(
        path,
      ),
    ),
    noNewRoutePath: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noOauthImplementation:
      !/\b(?:oauthCallback|authorizeUrl|tokenExchange|authorizationCode|pkceVerifier)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noPackageScripts: !changedPaths.some((path) => path === "package.json"),
    noProviderExternalCalls:
      !/\b(?:providerConnect|callProvider|createProviderJob|sendEmail|sendReport|contactCustomer|externalMessage)\s*\(/u.test(
        changedRuntimeSource,
      ),
    noPublicAssetsSubmissionArtifacts:
      !changedPaths.some((path) => publicAssetPattern.test(path)) &&
      !changedPaths.some((path) =>
        /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
          path,
        ),
      ),
    noRemoteMcp: !/\b(?:remoteMcp|mcpServerRuntime|listen\s*\(|deploy)\b/u.test(
      changedRuntimeSource,
    ),
    noRouteBehaviorChange: !changedPaths.some((path) =>
      /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|service|formatter|schema|evidence-dispatcher)\.ts$/u.test(
        path,
      ),
    ),
    noSchemaMigrations: !changedPaths.some(
      (path) =>
        /(?:^|\/)(?:migrations?|drizzle)\//iu.test(path) ||
        /(?:drizzle|migration)\.(?:ts|js|mjs|sql)$/iu.test(path),
    ),
    noSourceMutationFinanceWrite:
      !/\b(?:uploadSource|mutateSource|rewriteSource|deleteSource|writeFinanceTwin|updateLedger|financeWrite|generatedFinanceAdviceAllowed:\s*true)\b/u.test(
        changedRuntimeSource,
      ),
    noTokenSessionImplementation:
      !/\b(?:tokenStore|sessionStore|sessionHandler|refreshTokenStore|setCookie)\s*\(/u.test(
        changedRuntimeSource,
      ),
  };
}

function noApiModelClientKeyUsage(text) {
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

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
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
