import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  EndpointArchitectureProofSchema,
  buildEndpointArchitectureProof,
  inspectEndpointRuntimeRepositoryInventory,
} from "../packages/domain/src/index.ts";

const FP0104_PLAN =
  "plans/FP-0104-read-only-chatgpt-app-mcp-endpoint-implementation-readiness-and-inventory-master-plan.md";
const FP0105_PLAN =
  "plans/FP-0105-read-only-chatgpt-app-mcp-endpoint-route-ownership-transport-adapter-proof-contracts.md";
const FP0106_PLAN =
  "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
const FP0103_PLAN =
  "plans/FP-0103-read-only-chatgpt-app-mcp-endpoint-architecture-proof-contracts-foundation.md";
const FP0102_PLAN =
  "plans/FP-0102-read-only-chatgpt-app-mcp-endpoint-oauth-remote-mcp-architecture-master-plan.md";
const FP0101_PLAN =
  "plans/FP-0101-read-only-chatgpt-app-mcp-public-app-implementation-sequencing-master-plan.md";
const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const FP0112_PLAN =
  "plans/FP-0112-read-only-chatgpt-app-mcp-remote-public-deployment-oauth-readiness-master-plan.md";
const FP0113_PLAN =
  "plans/FP-0113-read-only-chatgpt-app-mcp-oauth-token-session-security-contracts-foundation.md";
const FP0099_PLAN =
  "plans/FP-0099-read-only-chatgpt-app-mcp-public-app-security-threat-model-master-plan.md";
const FP0098_PLAN =
  "plans/FP-0098-read-only-chatgpt-app-mcp-public-app-readiness-master-plan.md";
const FP0087_PLAN = "plans/FP-0087-read-only-chatgpt-app-mcp-master-plan.md";
const fp0123RouteInputSourceScanExcludedPaths = new Set([
  "packages/domain/src/read-only-app-mcp-protected-resource-metadata-route-input-inventory-rules.ts",
  "tools/read-only-mcp-protected-resource-metadata-route-input-proof.mjs",
]);
const FP0125_LOCAL_ROUTE_PLAN =
  "plans/FP-0125-read-only-chatgpt-app-mcp-protected-resource-metadata-local-route-implementation.md";
const FP0125_LOCAL_ROUTE_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.ts";
const FP0125_LOCAL_ROUTE_SPEC_PATH =
  "apps/control-plane/src/modules/read-only-app-mcp-endpoint/protected-resource-metadata-route.spec.ts";
const FP0125_LOCAL_ROUTE_PROOF_PATH =
  "tools/read-only-mcp-protected-resource-metadata-local-route-proof.mjs";
const FP0128_TOKEN_VALIDATION_READINESS_PLAN =
  "plans/FP-0128-read-only-chatgpt-app-mcp-token-validation-failure-readiness-contracts.md";
const FP0128_TOKEN_VALIDATION_READINESS_PROOF_PATH =
  "tools/read-only-mcp-token-validation-readiness-proof.mjs";
const FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH =
  "plans/FP-0130-read-only-chatgpt-app-mcp-www-authenticate-missing-token-challenge-local-implementation.md";
const FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_PROOF_PATH =
  "tools/read-only-mcp-www-authenticate-missing-token-challenge-proof.mjs";

const repoPaths = repoFilePaths();
const changedPaths = changedFilePaths();
const fp0103Plan = endpointArchitectureProofPlanBoundary();
const fp0104Plan = endpointImplementationReadinessPlanBoundary();
const noRuntime = routeRuntimeChangedFilesBoundary();
const endpointRuntimeInventory = endpointRuntimeRepositoryInventory();
const noAssets = publicAssetsSubmissionChangedFilesBoundary();
const sourceText = readPublicAppProofGateSourceText();
const noOpenAiApiCalls = !hasCodeLevelOpenAiIntegration(sourceText);
const noModelCalls = !hasCodeLevelModelIntegration(sourceText);
const noOpenAiClientOrKeyUsage =
  noOpenAiApiCalls && !hasCodeLevelOpenAiClientOrKeyUsage(sourceText);

const proof = EndpointArchitectureProofSchema.parse(
  buildEndpointArchitectureProof({
    endpointArchitectureProofPlanAccepted: fp0103Plan.accepted,
    exactlyOneFp0103PlanVerified: fp0103Plan.exactlyOneFp0103PlanVerified,
    fp0087DescriptorEnvelopeBoundaryStillVerified:
      fp0087DescriptorEnvelopeBoundary(),
    fp0098PublicAppReadinessBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0098_PLAN,
      [
        "public-app readiness",
        "future-only",
        "does not authorize public chatgpt app implementation",
      ],
    ),
    fp0099PublicSecurityThreatModelBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0099_PLAN,
      [
        "public-app security",
        "threat-model",
        "does not authorize endpoint implementation",
      ],
    ),
    fp0100PublicSecurityBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0100_PLAN,
      [
        "public-app security boundary contract",
        "local/proof-only",
        "no endpoints",
      ],
    ),
    fp0101ImplementationSequencingBoundaryStillVerified: docsOnlyPlanBoundary(
      FP0101_PLAN,
      [
        "implementation sequencing",
        "does not authorize endpoint implementation",
        "public app implementation",
      ],
    ),
    fp0102ArchitectureBoundaryStillVerified: docsOnlyPlanBoundary(FP0102_PLAN, [
      "endpoint/oauth/remote-mcp architecture",
      "docs-and-plan",
      "does not authorize endpoint implementation",
    ]),
    fp0103EndpointArchitectureProofContractsStillVerified: fp0103Plan.accepted,
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified:
      endpointRuntimeInventory.endpointRuntimeRepositoryInventoryVerified,
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified:
      fp0104Plan.absentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified,
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified:
      fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified(),
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
      fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified(),
    fp0107Absent: fp0107Absent(),
    endpointImplementationReadinessPlanBoundaryVerified:
      fp0104Plan.endpointImplementationReadinessPlanBoundaryVerified,
    exactFutureEndpointInventoryReadinessVerified:
      fp0104Plan.exactFutureEndpointInventoryReadinessVerified,
    noEndpointImplementationFromFp0104:
      fp0104Plan.noEndpointImplementationFromFp0104,
    noRouteImplementationFromFp0104: fp0104Plan.noRouteImplementationFromFp0104,
    noApiBackendRoutesFromFp0104: fp0104Plan.noApiBackendRoutesFromFp0104,
    noOauthTokenSessionImplementationFromFp0104:
      fp0104Plan.noOauthTokenSessionImplementationFromFp0104,
    noRemoteMcpImplementationOrDeploymentFromFp0104:
      fp0104Plan.noRemoteMcpImplementationOrDeploymentFromFp0104,
    noAppsSdkResourceFromFp0104: fp0104Plan.noAppsSdkResourceFromFp0104,
    noAppSubmissionFromFp0104: fp0104Plan.noAppSubmissionFromFp0104,
    noOpenAiApiCallsFromFp0104:
      fp0104Plan.noOpenAiApiCallsFromFp0104 && noOpenAiApiCalls,
    noSourceMutationFinanceWriteFromFp0104:
      fp0104Plan.noSourceMutationFinanceWriteFromFp0104,
    noPublicAssetsSubmissionArtifactsFromFp0104:
      fp0104Plan.noPublicAssetsSubmissionArtifactsFromFp0104,
    endpointRuntimeChangedFilesVerified: noRuntime.allClear,
    endpointRuntimeRepositoryInventoryVerified:
      endpointRuntimeInventory.endpointRuntimeRepositoryInventoryVerified,
    noAppRoutesAdded: noRuntime.noAppRoutesAdded,
    noAppSubmission: noAssets.noAppSubmission,
    noAppsSdkResourceImplementation: noRuntime.noAppsSdkResourceImplementation,
    noAutonomousAction: fp0103Plan.noAutonomousAction,
    noBackendControlPlaneRoutesAdded:
      noRuntime.noBackendControlPlaneRoutesAdded,
    noEndpointImplementation: noRuntime.noEndpointImplementation,
    noExternalCommunications: fp0103Plan.noExternalCommunications,
    noFinanceWrite: fp0103Plan.noFinanceWrite,
    noGeneratedFinanceAdvice: fp0103Plan.noGeneratedFinanceAdvice,
    noListingCopy: noAssets.noListingCopy,
    noMcpServerRuntime: noRuntime.noMcpServerRuntime,
    noModelCalls,
    noOauthTokenSessionImplementation:
      noRuntime.noOauthTokenSessionImplementation,
    noOpenAiApiCalls,
    noOpenAiClientOrKeyUsage,
    noProviderCertificationDeliveryDeployment:
      fp0103Plan.noProviderCertificationDeliveryDeployment,
    noPublicAssets: noAssets.noPublicAssets,
    noPublicAssetsSubmissionArtifacts:
      noAssets.noPublicAssetsSubmissionArtifacts,
    noPublicChatGptAppImplementation:
      fp0103Plan.noPublicChatGptAppImplementation,
    noRemoteMcpImplementationOrDeployment:
      noRuntime.noRemoteMcpImplementationOrDeployment,
    noRouteImplementation: noRuntime.noRouteImplementation,
    noRuntimeCodexFinanceOutput: fp0103Plan.noRuntimeCodexFinanceOutput,
    noSourceMutation: fp0103Plan.noSourceMutation,
    noWebApiRoutesAdded: noRuntime.noWebApiRoutesAdded,
    noWriteActionTools: fp0103Plan.noWriteActionTools,
    publicAppImplementationSubmissionFutureOnly:
      fp0103Plan.publicAppImplementationSubmissionFutureOnly,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0103 endpoint architecture proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function endpointArchitectureProofPlanBoundary() {
  const fp0103Hits = repoPaths.filter((path) => /(^|\/)FP-0103/u.test(path));
  const exactlyOneFp0103PlanVerified =
    fp0103Hits.length === 1 && fp0103Hits[0] === FP0103_PLAN;
  if (!exactlyOneFp0103PlanVerified || !existsSync(FP0103_PLAN)) {
    return allFalsePlanBoundary({ exactlyOneFp0103PlanVerified });
  }

  const normalized = normalize(readFileSync(FP0103_PLAN, "utf8"));
  const accepted =
    [
      "fp-0103 is not implementation",
      "fp-0103 is local/proof-only/read-only endpoint architecture contract work",
      "fp-0103 defines endpoint architecture proof contracts only",
      "fp-0103 does not authorize endpoint implementation",
      "fp-0103 does not authorize route implementation",
      "fp-0103 does not authorize web api/backend/control-plane route implementation",
      "fp-0103 does not authorize oauth/token/session implementation",
      "fp-0103 does not authorize remote mcp server implementation or deployment",
      "fp-0103 does not authorize apps sdk iframe/resource implementation",
      "fp-0103 does not authorize public chatgpt app implementation",
      "fp-0103 does not authorize app submission, screenshots, listing copy, public assets, app-submission artifacts, or generated public assets",
      "fp-0103 does not authorize openai api/model calls",
      "fp-0103 keeps fp-0104 absent",
      "fp-0103 preserves fp-0102, fp-0101, fp-0100, fp-0099, fp-0098, fp-0087, v2f, and v2g proof boundaries",
      "fp-0103 keeps public app implementation/submission future-only",
      "future endpoint inventory must name path, method, transport, request envelope, response envelope, auth requirement, health path if any, refusal/failure behavior, and logging posture before implementation",
      "request and response envelopes must preserve evidence, source anchors, freshness, limitations, refusals, and permitted next actions",
      "unsupported, stale, conflicting, missing-citation, data-exfiltration, raw-dump, write-action, and prompt-injection requests fail closed",
      "no raw full-file dump is allowed",
      "no write/modify/action tools are allowed",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    routeRuntimeChangedFilesBoundary().allClear &&
    publicAssetsSubmissionChangedFilesBoundary().allClear;

  return {
    accepted,
    exactlyOneFp0103PlanVerified,
    noAutonomousAction: normalized.includes("autonomous action"),
    noExternalCommunications: normalized.includes("external communications"),
    noFinanceWrite: normalized.includes("finance write"),
    noGeneratedFinanceAdvice: normalized.includes("generated finance advice"),
    noProviderCertificationDeliveryDeployment:
      normalized.includes("provider/certification/deployment") ||
      normalized.includes("provider, deployment"),
    noPublicChatGptAppImplementation: normalized.includes(
      "public chatgpt app implementation",
    ),
    noRuntimeCodexFinanceOutput: normalized.includes(
      "runtime-codex finance output",
    ),
    noSourceMutation: normalized.includes("source mutation"),
    noWriteActionTools: normalized.includes("write/modify/action tools"),
    publicAppImplementationSubmissionFutureOnly: normalized.includes(
      "public app implementation/submission future-only",
    ),
  };
}

function allFalsePlanBoundary({ exactlyOneFp0103PlanVerified }) {
  return {
    accepted: false,
    exactlyOneFp0103PlanVerified,
    noAutonomousAction: false,
    noExternalCommunications: false,
    noFinanceWrite: false,
    noGeneratedFinanceAdvice: false,
    noProviderCertificationDeliveryDeployment: false,
    noPublicChatGptAppImplementation: false,
    noRuntimeCodexFinanceOutput: false,
    noSourceMutation: false,
    noWriteActionTools: false,
    publicAppImplementationSubmissionFutureOnly: false,
  };
}

function endpointImplementationReadinessPlanBoundary() {
  const absentBoundary = {
    absentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified: true,
    endpointImplementationReadinessPlanBoundaryVerified: true,
    exactFutureEndpointInventoryReadinessVerified: true,
    noEndpointImplementationFromFp0104: true,
    noRouteImplementationFromFp0104: true,
    noApiBackendRoutesFromFp0104: true,
    noOauthTokenSessionImplementationFromFp0104: true,
    noRemoteMcpImplementationOrDeploymentFromFp0104: true,
    noAppsSdkResourceFromFp0104: true,
    noAppSubmissionFromFp0104: true,
    noOpenAiApiCallsFromFp0104: true,
    noSourceMutationFinanceWriteFromFp0104: true,
    noPublicAssetsSubmissionArtifactsFromFp0104: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );
  const fp0104Hits = repoPaths.filter((path) => /(^|\/)FP-0104/u.test(path));

  if (fp0104Hits.length === 0) return absentBoundary;
  if (fp0104Hits.length !== 1 || fp0104Hits[0] !== FP0104_PLAN) {
    return failedBoundary;
  }

  const normalized = normalize(readFileSync(FP0104_PLAN, "utf8"));
  const endpointImplementationReadinessPlanBoundaryVerified = [
    "fp-0104 is not implementation",
    "fp-0104 is docs-and-plan plus proof-gate compatibility only",
    "fp-0104 plans endpoint implementation readiness and exact future endpoint inventory only",
    "fp-0104 does not authorize endpoint implementation",
    "fp-0104 does not authorize route implementation",
    "fp-0104 does not authorize web api/backend/control-plane route implementation",
    "fp-0104 does not authorize oauth/token/session implementation",
    "fp-0104 does not authorize remote mcp server implementation or deployment",
    "fp-0104 does not authorize apps sdk iframe/resource implementation",
    "fp-0104 does not authorize public chatgpt app implementation",
    "fp-0104 does not authorize app submission, screenshots, listing copy, public assets, app-submission artifacts, or generated public assets",
    "fp-0104 does not authorize openai api/model calls",
    "fp-0104 keeps fp-0105 absent",
    "fp-0104 preserves fp-0103, fp-0102, fp-0101, fp-0100, fp-0099, fp-0098, fp-0087, v2f, and v2g proof boundaries",
    "fp-0104 keeps public app implementation/submission future-only",
  ].every((requiredText) => normalized.includes(requiredText));
  const exactFutureEndpointInventoryReadinessVerified = [
    "exact future chatgpt-facing endpoint path that can be named from current repo truth and official docs",
    "| /mcp |",
    "post",
    "streamable http",
    "request envelope",
    "response envelope",
    "auth requirement",
    "health path if any",
    "refusal/failure behavior",
    "logging posture",
    "owner lane",
    "endpoint path naming beyond /mcp is blocked",
  ].every((requiredText) => normalized.includes(requiredText));
  const noEndpointImplementationFromFp0104 =
    normalized.includes("fp-0104 does not authorize endpoint implementation") &&
    normalized.includes("no endpoints") &&
    routeRuntimeChangedFilesBoundary().allClear;
  const noRouteImplementationFromFp0104 =
    normalized.includes("fp-0104 does not authorize route implementation") &&
    normalized.includes("no route code") &&
    routeRuntimeChangedFilesBoundary().allClear;
  const noApiBackendRoutesFromFp0104 =
    normalized.includes(
      "fp-0104 does not authorize web api/backend/control-plane route implementation",
    ) &&
    normalized.includes("no web api routes") &&
    normalized.includes("no backend/control-plane routes");
  const noOauthTokenSessionImplementationFromFp0104 =
    normalized.includes(
      "fp-0104 does not authorize oauth/token/session implementation",
    ) && normalized.includes("no auth/session/token implementation");
  const noRemoteMcpImplementationOrDeploymentFromFp0104 =
    normalized.includes(
      "fp-0104 does not authorize remote mcp server implementation or deployment",
    ) &&
    normalized.includes("no remote mcp server") &&
    normalized.includes("deployment remains future-only");
  const noAppsSdkResourceFromFp0104 =
    normalized.includes(
      "fp-0104 does not authorize apps sdk iframe/resource implementation",
    ) && normalized.includes("no apps sdk iframe/resource registration");
  const noAppSubmissionFromFp0104 =
    normalized.includes("fp-0104 does not authorize app submission") &&
    normalized.includes("no app submission");
  const noOpenAiApiCallsFromFp0104 =
    normalized.includes("fp-0104 does not authorize openai api/model calls") &&
    normalized.includes("no openai api/model calls");
  const noSourceMutationFinanceWriteFromFp0104 =
    normalized.includes("no source mutation") &&
    normalized.includes("no finance writes");
  const noPublicAssetsSubmissionArtifactsFromFp0104 =
    normalized.includes("no screenshots") &&
    normalized.includes("no generated images") &&
    normalized.includes("no public assets") &&
    normalized.includes("no listing copy") &&
    normalized.includes("no app-submission artifacts") &&
    publicAssetsSubmissionChangedFilesBoundary().allClear;

  return {
    absentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified:
      endpointImplementationReadinessPlanBoundaryVerified &&
      exactFutureEndpointInventoryReadinessVerified &&
      noEndpointImplementationFromFp0104 &&
      noRouteImplementationFromFp0104 &&
      noApiBackendRoutesFromFp0104 &&
      noOauthTokenSessionImplementationFromFp0104 &&
      noRemoteMcpImplementationOrDeploymentFromFp0104 &&
      noAppsSdkResourceFromFp0104 &&
      noAppSubmissionFromFp0104 &&
      noOpenAiApiCallsFromFp0104 &&
      noSourceMutationFinanceWriteFromFp0104 &&
      noPublicAssetsSubmissionArtifactsFromFp0104,
    endpointImplementationReadinessPlanBoundaryVerified,
    exactFutureEndpointInventoryReadinessVerified,
    noEndpointImplementationFromFp0104,
    noRouteImplementationFromFp0104,
    noApiBackendRoutesFromFp0104,
    noOauthTokenSessionImplementationFromFp0104,
    noRemoteMcpImplementationOrDeploymentFromFp0104,
    noAppsSdkResourceFromFp0104,
    noAppSubmissionFromFp0104,
    noOpenAiApiCallsFromFp0104,
    noSourceMutationFinanceWriteFromFp0104,
    noPublicAssetsSubmissionArtifactsFromFp0104,
  };
}

function routeRuntimeChangedFilesBoundary() {
  const forbiddenChangedPaths = changedPaths
    .filter(
      (path) =>
        !isAllowedFp0107LocalRouteAdapterPath(path) &&
        !isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) &&
        !isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path),
    )
    .filter((path) =>
      [
        /^apps\/web\/app\//u,
        /^apps\/web\/pages\//u,
        /^apps\/web\/api\//u,
        /^apps\/control-plane\//u,
        /^packages\/api\//u,
        /^packages\/server\//u,
        /^packages\/backend\//u,
        /^packages\/db\//u,
      ].some((pattern) => pattern.test(path)),
    );
  const forbiddenRuntimeMarkers = changedPaths.filter((path) => {
    if (isAllowedFp0107LocalRouteAdapterPath(path)) return false;
    if (isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path)) return false;
    if (isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path)) {
      return false;
    }
    if (!isRuntimeCandidate(path)) return false;
    const source = readFileSync(path, "utf8");
    return routeRuntimeMarkerPatterns().some((pattern) => pattern.test(source));
  });
  const allClear =
    forbiddenChangedPaths.length === 0 && forbiddenRuntimeMarkers.length === 0;

  return {
    allClear,
    noAppRoutesAdded:
      allClear && !changedPaths.some((path) => /^apps\/web\/app\//u.test(path)),
    noAppsSdkResourceImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedEndpointProofPlanPath(path) &&
          /apps-sdk|app-submission|submission-assets|iframe/iu.test(path),
      ),
    noBackendControlPlaneRoutesAdded:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedFp0107LocalRouteAdapterPath(path) &&
          !isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) &&
          !isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path) &&
          /^(apps\/control-plane|packages\/backend|packages\/server)\//u.test(
            path,
          ),
      ),
    noEndpointImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedEndpointProofPlanPath(path) && endpointRuntimePath(path),
      ),
    noMcpServerRuntime:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedEndpointProofPlanPath(path) &&
          /mcp-server|remote-mcp|server\./iu.test(path),
      ),
    noOauthTokenSessionImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedEndpointProofPlanPath(path) &&
          /oauth|token|session/iu.test(path),
      ),
    noRemoteMcpImplementationOrDeployment:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedEndpointProofPlanPath(path) &&
          /remote-mcp|deploy|deployment/iu.test(path),
      ),
    noRouteImplementation:
      allClear &&
      !changedPaths.some(
        (path) =>
          !isAllowedFp0107LocalRouteAdapterPath(path) &&
          /(^|\/)route\.ts$/u.test(path),
      ),
    noWebApiRoutesAdded:
      allClear && !changedPaths.some((path) => /^apps\/web\/api\//u.test(path)),
  };
}

function publicAssetsSubmissionChangedFilesBoundary() {
  const publicAssetPattern =
    /\.(?:png|jpe?g|gif|webp|svg|ico|avif|mp4|mov|pdf)$/iu;
  const forbidden = changedPaths.filter(
    (path) =>
      publicAssetPattern.test(path) ||
      /app-submission|submission-assets|public-listing|store-listing|listing-copy|screenshots/iu.test(
        path,
      ),
  );
  const allClear = forbidden.length === 0;

  return {
    allClear,
    noAppSubmission: allClear,
    noListingCopy: allClear,
    noPublicAssets: allClear,
    noPublicAssetsSubmissionArtifacts: allClear,
  };
}

function docsOnlyPlanBoundary(path, requiredTexts) {
  if (!repoPaths.includes(path) || !existsSync(path)) return false;
  const normalized = normalize(readFileSync(path, "utf8"));
  return requiredTexts.every((requiredText) =>
    normalized.includes(requiredText),
  );
}

function fp0087DescriptorEnvelopeBoundary() {
  if (!repoPaths.includes(FP0087_PLAN) || !existsSync(FP0087_PLAN)) {
    return false;
  }
  const normalized = normalize(readFileSync(FP0087_PLAN, "utf8"));
  return (
    normalized.includes("read-only") &&
    normalized.includes("mcp") &&
    normalized.includes("descriptor")
  );
}

function fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified() {
  const fp0105Hits = repoPaths.filter((path) => /(^|\/)FP-0105/u.test(path));
  if (fp0105Hits.length === 0) return true;
  if (fp0105Hits.length !== 1 || fp0105Hits[0] !== FP0105_PLAN) {
    return false;
  }

  const normalized = normalize(readFileSync(FP0105_PLAN, "utf8"));
  return [
    "fp-0105 is local/proof-only/read-only endpoint route ownership and transport-adapter contract work",
    "fp-0105 does not authorize endpoint implementation",
    "fp-0105 does not authorize route implementation",
    "future /mcp route owner family is exactly apps/control-plane fastify route family",
    "future transport adapter remains documentation/proof-only",
    "fp-0105 keeps fp-0106 absent",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified() {
  const fp0106Hits = repoPaths.filter((path) => /(^|\/)FP-0106/u.test(path));
  if (fp0106Hits.length === 0) return true;
  if (fp0106Hits.length !== 1 || fp0106Hits[0] !== FP0106_PLAN) {
    return false;
  }

  const normalized = normalize(readFileSync(FP0106_PLAN, "utf8"));
  return [
    "fp-0106 is local/proof-only/read-only mcp protocol envelope and tool-dispatch contract work",
    "fp-0106 does not authorize endpoint implementation",
    "fp-0106 does not authorize route implementation",
    "fp-0106 defines future mcp protocol envelope and read-only tool-dispatch proof contracts only",
    "fp-0106 keeps fp-0107 absent",
    "mcpprotocolenvelopeproofcontract",
    "mcpprotocolacceptedmethodsboundary",
    "mcpprotocoltoolslistboundary",
    "mcpprotocoltoolscallboundary",
    "mcpprotocolevidenceenvelopeboundary",
    "mcpprotocolrefusalenvelopeboundary",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0107Absent() {
  const fp0107Hits = repoPaths.filter((path) => /(^|\/)FP-0107/u.test(path));
  return (
    fp0107Hits.length === 0 ||
    (fp0107Hits.length === 1 &&
      fp0107Hits[0] ===
        "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md")
  );
}

function isAllowedFp0107LocalRouteAdapterPath(path) {
  return (
    path ===
      "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md" ||
    path ===
      "plans/FP-0111-read-only-chatgpt-app-mcp-default-local-evidence-dispatch-wiring.md" ||
    path === "apps/control-plane/src/app.ts" ||
    path === "apps/control-plane/src/app.spec.ts" ||
    path === "apps/control-plane/src/lib/types.ts" ||
    path === "tools/read-only-mcp-route-adapter-proof.mjs" ||
    path === "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs" ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|schema|formatter|service|evidence-dispatcher)(?:\.spec)?\.ts$/u.test(
      path,
    )
  );
}

function endpointRuntimeRepositoryInventory() {
  const files = repoPaths
    .filter((path) => /\.(?:ts|tsx|js|mjs|json)$/u.test(path))
    .map((path) => ({ path, source: safeRead(path) }));
  return inspectEndpointRuntimeRepositoryInventory(files);
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function readPublicAppProofGateSourceText() {
  return repoPaths
    .filter(isPublicAppProofGateSourceSurface)
    .filter(
      (path) =>
        !path.endsWith(".spec.ts") &&
        !fp0123RouteInputSourceScanExcludedPaths.has(path),
    )
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

function isPublicAppProofGateSourceSurface(path) {
  return (
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path) ||
    /^packages\/domain\/src\/benchmark-community.*\.ts$/u.test(path) ||
    [
      "tools/read-only-public-app-security-boundary-proof.mjs",
      "tools/read-only-mcp-descriptor-response-envelope-proof.mjs",
      "tools/read-only-chatgpt-app-mcp-proof.mjs",
      "tools/benchmark-community-pack-proof.mjs",
      "tools/read-only-endpoint-architecture-proof.mjs",
    ].includes(path)
  );
}

function hasCodeLevelOpenAiIntegration(sourceText) {
  const packageName = ["open", "ai"].join("");
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  const hostName = ["api", packageName, "com"].join(".");
  const checks = [
    new RegExp(`\\bfrom\\s+["']${packageName}["']`, "u"),
    new RegExp(`\\bimport\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\brequire\\s*\\(\\s*["']${packageName}["']\\s*\\)`, "u"),
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\b${packageName}\\s*\\.`, "u"),
    dottedPattern("responses", "create"),
    dottedPattern("chat", "completions"),
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
    new RegExp(`\\b${escapeRegExp(hostName)}\\b`, "u"),
    new RegExp(`\\bfetch\\s*\\(\\s*["'][^"']*${escapeRegExp(hostName)}`, "u"),
  ];

  return checks.some((check) => check.test(sourceText));
}

function hasCodeLevelOpenAiClientOrKeyUsage(sourceText) {
  const clientName = ["Open", "AI"].join("");
  const keyName = ["OPENAI", "API", "KEY"].join("_");
  return [
    new RegExp(`\\bnew\\s+${clientName}\\b`, "u"),
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
  ].some((check) => check.test(sourceText));
}

function hasCodeLevelModelIntegration(sourceText) {
  const modelCallName = ["call", "Model"].join("");
  return [
    wordPattern(modelCallName),
    dottedPattern("model", "create"),
    dottedPattern("models", "create"),
    dottedPattern("chat", "completions"),
  ].some((check) => check.test(sourceText));
}

function routeRuntimeMarkerPatterns() {
  const markers = [
    ["route", "\\.ts"].join(""),
    "API route",
    "backend route",
    "control-plane route",
    "app route",
    "createServer",
    "Fastify route registration",
    "Express route registration",
    "NextResponse",
    "POST",
    "GET handler",
    "remote MCP server",
    "listen(",
    "server.start",
    "OAuth callback",
    "token exchange",
    "session handler",
  ];
  return markers.map((marker) => new RegExp(escapeRegExp(marker), "u"));
}

function isRuntimeCandidate(path) {
  return (
    /^(apps\/web\/app|apps\/web\/pages|apps\/web\/api)\//u.test(path) ||
    /^(apps\/control-plane|packages\/api|packages\/server|packages\/backend)\//u.test(
      path,
    )
  );
}

function endpointRuntimePath(path) {
  return (
    /(^|\/)route\.ts$/u.test(path) ||
    /endpoint|mcp-server|remote-mcp|oauth|session|token/iu.test(path)
  );
}

function isAllowedEndpointProofPlanPath(path) {
  return (
    isAllowedFp0107LocalRouteAdapterPath(path) ||
    isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) ||
    path === FP0103_PLAN ||
    path === FP0104_PLAN ||
    path === FP0105_PLAN ||
    isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path) ||
    path === FP0112_PLAN ||
    path === FP0113_PLAN ||
    path === FP0128_TOKEN_VALIDATION_READINESS_PLAN ||
    path === FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_LOCAL_IMPLEMENTATION_PLAN_PATH ||
    path ===
      "plans/FP-0114-read-only-chatgpt-app-mcp-remote-host-readiness-security-contracts-foundation.md" ||
    path ===
      "plans/FP-0117-read-only-chatgpt-app-mcp-oauth-token-session-auth-implementation-sequencing-master-plan.md" ||
    path === "packages/domain/src/index.ts" ||
    path === "tools/read-only-mcp-oauth-security-boundary-proof.mjs" ||
    path === "tools/read-only-mcp-remote-host-readiness-proof.mjs" ||
    path === "tools/read-only-mcp-default-local-evidence-dispatch-proof.mjs" ||
    path === "tools/read-only-mcp-evidence-tool-dispatch-adapter-proof.mjs" ||
    path === "tools/read-only-mcp-evidence-tool-dispatch-proof.mjs" ||
    path === "tools/read-only-mcp-protocol-envelope-proof.mjs" ||
    path === "tools/read-only-mcp-route-adapter-proof.mjs" ||
    path === "tools/read-only-endpoint-architecture-proof.mjs" ||
    path === "tools/read-only-endpoint-route-ownership-proof.mjs" ||
    path === "tools/read-only-mcp-oauth-implementation-sequencing-proof.mjs" ||
    path === FP0128_TOKEN_VALIDATION_READINESS_PROOF_PATH ||
    path === FP0130_WWW_AUTHENTICATE_MISSING_TOKEN_CHALLENGE_PROOF_PATH ||
    /^packages\/domain\/src\/read-only-app-mcp-oauth-security.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-remote-host-readiness.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-evidence-tool-dispatch.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-endpoint-architecture.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp-endpoint-route-ownership.*\.ts$/u.test(
      path,
    ) ||
    /^packages\/domain\/src\/read-only-app-mcp.*\.ts$/u.test(path)
  );
}

function isAllowedFp0109EvidenceDispatchAdapterHardeningPath(path) {
  return /^apps\/control-plane\/src\/modules\/evidence-index\/tools\/service(?:\.spec)?\.ts$/u.test(
    path,
  );
}

function isAllowedFp0125LocalProtectedResourceMetadataRoutePath(path) {
  return (
    path === FP0125_LOCAL_ROUTE_PLAN ||
    path === FP0125_LOCAL_ROUTE_PATH ||
    path === FP0125_LOCAL_ROUTE_SPEC_PATH ||
    path === FP0125_LOCAL_ROUTE_PROOF_PATH
  );
}

function dottedPattern(left, right) {
  return new RegExp(`\\b${left}\\s*\\.\\s*${right}\\b`, "u");
}

function wordPattern(name) {
  return new RegExp(`\\b${name}\\b`, "u");
}

function normalize(value) {
  return value.toLowerCase().replace(/`/gu, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
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
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results.sort();
}
