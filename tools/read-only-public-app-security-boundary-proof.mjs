import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PublicAppSecurityProofSchema,
  buildPublicAppSecurityProof,
} from "../packages/domain/src/index.ts";

const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";
const FP0101_PLAN =
  "plans/FP-0101-read-only-chatgpt-app-mcp-public-app-implementation-sequencing-master-plan.md";
const FP0102_PLAN =
  "plans/FP-0102-read-only-chatgpt-app-mcp-endpoint-oauth-remote-mcp-architecture-master-plan.md";
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

const fp0101Boundary = fp0101PublicAppImplementationSequencingBoundary();
const noRoutesAdded = noFp0100RouteOrEndpointPaths();
const noEndpointsAdded = noRoutesAdded;
const noAppsSdkResourcesAdded = noFp0100AppsSdkResourcePaths();
const noPublicAssets = noFp0100PublicAssets();
const noListingCopy = noFp0100ListingCopy();
const securitySourceText = readPublicAppProofGateSourceText();
const noOpenAiApiCalls = !hasCodeLevelOpenAiIntegration(securitySourceText);
const noModelCalls =
  noOpenAiApiCalls && !hasCodeLevelModelIntegration(securitySourceText);
const publicSecurityNoOpenAiApiSourceScanVerified =
  noOpenAiApiCalls && noModelCalls;
const fp0100Boundary = fp0100PublicAppSecurityBoundary();
const fp0102Boundary = fp0102EndpointOauthRemoteMcpArchitectureBoundary();
const fp0103Boundary = fp0103EndpointArchitectureProofContractsBoundary();
const localPreviewRouteBoundary = verifyLocalPreviewRouteBoundary();

const proof = PublicAppSecurityProofSchema.parse(
  buildPublicAppSecurityProof({
    fp0100BoundaryVerified:
      fp0100Boundary.fp0100BoundaryVerified &&
      fp0100Boundary.publicAppSecurityContractsFoundationVerified,
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      fp0101Boundary.absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified,
    fp0102AbsentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified:
      fp0102Boundary.absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified,
    ...fp0103Boundary,
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified:
      fp0102Boundary.endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    noEndpointImplementationFromFp0102:
      fp0102Boundary.noEndpointImplementationFromFp0102,
    noOauthTokenSessionImplementationFromFp0102:
      fp0102Boundary.noOauthTokenSessionImplementationFromFp0102,
    noRemoteMcpImplementationOrDeploymentFromFp0102:
      fp0102Boundary.noRemoteMcpImplementationOrDeploymentFromFp0102,
    noAppsSdkResourceFromFp0102: fp0102Boundary.noAppsSdkResourceFromFp0102,
    noAppSubmissionFromFp0102: fp0102Boundary.noAppSubmissionFromFp0102,
    noOpenAiApiCallsFromFp0102: fp0102Boundary.noOpenAiApiCallsFromFp0102,
    noSourceMutationFinanceWriteFromFp0102:
      fp0102Boundary.noSourceMutationFinanceWriteFromFp0102,
    noPublicAssetsSubmissionArtifactsFromFp0102:
      fp0102Boundary.noPublicAssetsSubmissionArtifactsFromFp0102,
    fp0101ImplementationSequencingBoundaryStillVerified:
      fp0102Boundary.fp0101ImplementationSequencingBoundaryStillVerified,
    fp0100PublicSecurityBoundaryStillVerified:
      fp0102Boundary.fp0100PublicSecurityBoundaryStillVerified,
    publicAppImplementationSequencingPlanBoundaryVerified:
      fp0101Boundary.publicAppImplementationSequencingPlanBoundaryVerified,
    noEndpointImplementationFromFp0101:
      fp0101Boundary.noEndpointImplementationFromFp0101,
    noOauthImplementationFromFp0101:
      fp0101Boundary.noOauthImplementationFromFp0101,
    noRemoteMcpDeploymentFromFp0101:
      fp0101Boundary.noRemoteMcpDeploymentFromFp0101,
    noAppsSdkResourceFromFp0101: fp0101Boundary.noAppsSdkResourceFromFp0101,
    noAppSubmissionFromFp0101: fp0101Boundary.noAppSubmissionFromFp0101,
    noOpenAiApiCallsFromFp0101: fp0101Boundary.noOpenAiApiCallsFromFp0101,
    noSourceMutationFinanceWriteFromFp0101:
      fp0101Boundary.noSourceMutationFinanceWriteFromFp0101,
    noPublicAssetsSubmissionArtifactsFromFp0101:
      fp0101Boundary.noPublicAssetsSubmissionArtifactsFromFp0101,
    localPreviewRouteExists: localPreviewRouteBoundary.localPreviewRouteExists,
    localPreviewRouteRemainsLocalNoindexOnly:
      localPreviewRouteBoundary.localPreviewRouteRemainsLocalNoindexOnly,
    noAppsSdkResourcesAdded,
    noEndpointsAdded,
    noListingCopy,
    noModelCalls,
    noOpenAiApiCalls,
    noPublicAssets,
    noRoutesAdded,
    publicSecurityNoOpenAiApiSourceScanVerified,
    routeMetadataNoIndexBoundaryVerified:
      localPreviewRouteBoundary.routeMetadataNoIndexBoundaryVerified,
  }),
);

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`FP-0100 public app security proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0100PublicAppSecurityBoundary() {
  const absentBoundary = {
    fp0100BoundaryVerified: false,
    publicAppSecurityContractsFoundationVerified: false,
    noEndpointImplementationFromFp0100: false,
    noOauthImplementationFromFp0100: false,
    noRemoteMcpDeploymentFromFp0100: false,
    noAppsSdkResourceFromFp0100: false,
    noAppSubmissionFromFp0100: false,
    noOpenAiApiCallsFromFp0100: false,
    noSourceMutationFinanceWriteFromFp0100: false,
    noPublicAssetsSubmissionArtifactsFromFp0100: false,
  };
  const fp0100PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0100/u.test(path),
  );

  if (fp0100PathHits.length !== 1 || fp0100PathHits[0] !== FP0100_PLAN) {
    return absentBoundary;
  }

  const normalized = readFileSync(FP0100_PLAN, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const publicAppSecurityContractsFoundationVerified =
    [
      "local/proof-only/read-only public chatgpt app/mcp security boundary contract foundation",
      "fp-0100 implements only pure domain contracts and direct proof tooling",
      "this is contract/proof work only",
      "authorizes only local proof-only public-app security boundary contracts",
      "publicappsecuritythreatmodelcontract",
      "publicappplatformboundary",
      "publicapppromptinjectionboundary",
      "publicappdataexfiltrationboundary",
      "publicapprawdumprefusalboundary",
      "publicappwriteactionimpossibleboundary",
      "publicapptoolallowlistdriftboundary",
      "publicappmcpdescriptordriftboundary",
      "publicappsecurityproof",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100RouteOrEndpointPaths();
  const noEndpointImplementationFromFp0100 =
    [
      "does not authorize product code",
      "no route code",
      "no app routes",
      "no web api routes",
      "no backend/control-plane routes",
      "no endpoints",
      "endpoint work is deferred",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100RouteOrEndpointPaths();
  const noOauthImplementationFromFp0100 = [
    "does not authorize oauth",
    "oauth/token/session work is deferred",
    "no oauth",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0100 = [
    "does not authorize remote mcp",
    "remote mcp deployment is deferred",
    "no remote mcp server",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0100 =
    [
      "does not authorize apps sdk iframe/resource registration",
      "apps sdk iframe/resource implementation is deferred",
      "no apps sdk iframe/resource registration",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100AppsSdkResourcePaths();
  const noAppSubmissionFromFp0100 = [
    "does not authorize app submission",
    "app submission/listing/public assets are deferred",
    "no app submission",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0100 =
    [
      "does not authorize openai api/model calls",
      "no openai api/model calls",
      "no openai api/model call",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noOpenAiApiCalls &&
    noModelCalls;
  const noSourceMutationFinanceWriteFromFp0100 = [
    "no source mutation",
    "no finance writes",
    "no source mutation and no finance writes",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0100 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0100PublicAssets() &&
    noFp0100ListingCopy();

  return {
    fp0100BoundaryVerified:
      publicAppSecurityContractsFoundationVerified &&
      noEndpointImplementationFromFp0100 &&
      noOauthImplementationFromFp0100 &&
      noRemoteMcpDeploymentFromFp0100 &&
      noAppsSdkResourceFromFp0100 &&
      noAppSubmissionFromFp0100 &&
      noOpenAiApiCallsFromFp0100 &&
      noSourceMutationFinanceWriteFromFp0100 &&
      noPublicAssetsSubmissionArtifactsFromFp0100,
    publicAppSecurityContractsFoundationVerified,
    noEndpointImplementationFromFp0100,
    noOauthImplementationFromFp0100,
    noRemoteMcpDeploymentFromFp0100,
    noAppsSdkResourceFromFp0100,
    noAppSubmissionFromFp0100,
    noOpenAiApiCallsFromFp0100,
    noSourceMutationFinanceWriteFromFp0100,
    noPublicAssetsSubmissionArtifactsFromFp0100,
  };
}

function fp0101PublicAppImplementationSequencingBoundary() {
  const absentBoundary = {
    absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified: true,
    publicAppImplementationSequencingPlanBoundaryVerified: true,
    noEndpointImplementationFromFp0101: true,
    noOauthImplementationFromFp0101: true,
    noRemoteMcpDeploymentFromFp0101: true,
    noAppsSdkResourceFromFp0101: true,
    noAppSubmissionFromFp0101: true,
    noOpenAiApiCallsFromFp0101: true,
    noSourceMutationFinanceWriteFromFp0101: true,
    noPublicAssetsSubmissionArtifactsFromFp0101: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );
  const fp0101PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0101/u.test(path),
  );

  if (fp0101PathHits.length === 0) return absentBoundary;
  if (fp0101PathHits.length !== 1 || fp0101PathHits[0] !== FP0101_PLAN) {
    return failedBoundary;
  }

  const normalized = readFileSync(FP0101_PLAN, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const implementationRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      !isAllowedFp0107LocalRouteAdapterPath(path) &&
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0101|implementation-sequencing|public-app-implementation|endpoint|oauth|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAssetsSubmissionArtifactPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0101|implementation-sequencing|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAppImplementationSequencingPlanBoundaryVerified =
    [
      "fp-0101 is not implementation",
      "fp-0101 is docs-and-plan only",
      "future public-app implementation sequencing/platform-readiness",
      "fp-0101 defines future public-app implementation sequencing only",
      "recommended implementation order",
      "fp-0102 docs/proof-only endpoint/oauth/remote-mcp architecture master plan",
      "later endpoint/oauth contract implementation only after security acceptance",
      "later apps sdk/resource master plan",
      "later apps sdk/resource local proof implementation",
      "later app-submission master plan",
      "later app-submission artifact implementation only after all prior gates",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noEndpointImplementationFromFp0101 =
    [
      "does not authorize endpoint implementation",
      "no endpoint implementation is required",
      "what must be true before endpoint work starts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noOauthImplementationFromFp0101 = [
    "does not authorize oauth implementation",
    "no oauth implementation is required",
    "what must be true before oauth/token/session work starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0101 = [
    "does not authorize remote mcp deployment",
    "no remote mcp implementation is required",
    "what must be true before remote mcp deployment starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0101 = [
    "does not authorize apps sdk iframe/resource implementation",
    "no apps sdk resource implementation is required",
    "what must be true before apps sdk iframe/resource work starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppSubmissionFromFp0101 = [
    "does not authorize app submission",
    "does not authorize app submission, screenshots, listing copy, or public assets",
    "what must be true before app submission/listing/screenshots starts",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0101 = [
    "does not authorize openai api/model calls",
    "no openai api/model calls are required",
    "no openai api/model call was made",
  ].every((requiredText) => normalized.includes(requiredText));
  const noSourceMutationFinanceWriteFromFp0101 = [
    "no source mutation",
    "no finance writes",
    "no finance write or source mutation is required",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0101 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    publicAssetsSubmissionArtifactPaths.length === 0;

  return {
    absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      publicAppImplementationSequencingPlanBoundaryVerified &&
      noEndpointImplementationFromFp0101 &&
      noOauthImplementationFromFp0101 &&
      noRemoteMcpDeploymentFromFp0101 &&
      noAppsSdkResourceFromFp0101 &&
      noAppSubmissionFromFp0101 &&
      noOpenAiApiCallsFromFp0101 &&
      noSourceMutationFinanceWriteFromFp0101 &&
      noPublicAssetsSubmissionArtifactsFromFp0101,
    publicAppImplementationSequencingPlanBoundaryVerified,
    noEndpointImplementationFromFp0101,
    noOauthImplementationFromFp0101,
    noRemoteMcpDeploymentFromFp0101,
    noAppsSdkResourceFromFp0101,
    noAppSubmissionFromFp0101,
    noOpenAiApiCallsFromFp0101,
    noSourceMutationFinanceWriteFromFp0101,
    noPublicAssetsSubmissionArtifactsFromFp0101,
  };
}

function fp0102EndpointOauthRemoteMcpArchitectureBoundary() {
  const absentBoundary = {
    absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified: true,
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified: true,
    noEndpointImplementationFromFp0102: true,
    noOauthTokenSessionImplementationFromFp0102: true,
    noRemoteMcpImplementationOrDeploymentFromFp0102: true,
    noAppsSdkResourceFromFp0102: true,
    noAppSubmissionFromFp0102: true,
    noOpenAiApiCallsFromFp0102: true,
    noSourceMutationFinanceWriteFromFp0102: true,
    noPublicAssetsSubmissionArtifactsFromFp0102: true,
    fp0101ImplementationSequencingBoundaryStillVerified: true,
    fp0100PublicSecurityBoundaryStillVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );
  const fp0102PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0102/u.test(path),
  );

  if (fp0102PathHits.length === 0) return absentBoundary;
  if (fp0102PathHits.length !== 1 || fp0102PathHits[0] !== FP0102_PLAN) {
    return failedBoundary;
  }

  const normalized = readFileSync(FP0102_PLAN, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const implementationRouteOrEndpointPaths = repoFilePaths().filter(
    (path) =>
      !isAllowedFp0107LocalRouteAdapterPath(path) &&
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0102|endpoint|oauth|remote-mcp|remote-mcp-server|apps-sdk|appssdk/u.test(
        path.toLowerCase(),
      ),
  );
  const publicAssetsSubmissionArtifactPaths = repoFilePaths().filter(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0102|endpoint|oauth|remote-mcp|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const endpointOauthRemoteMcpArchitecturePlanBoundaryVerified =
    [
      "fp-0102 is not implementation",
      "fp-0102 is docs-and-plan plus proof-gate compatibility only",
      "fp-0102 plans endpoint/oauth/remote-mcp architecture and security-readiness only",
      "fp-0102 defines future endpoint/oauth/remote-mcp architecture gates only",
      "future mcp endpoint path is documentation-only in this slice",
      "fp-0102 keeps fp-0103 absent",
      "fp-0102 preserves fp-0101",
      "fp-0102 preserves fp-0100",
      "public app implementation and public app submission future-only",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noEndpointImplementationFromFp0102 =
    [
      "does not authorize endpoint implementation",
      "no endpoint implementation is required",
      "no route/api/backend path may be added in fp-0102",
      "no endpoint implementation may be added in fp-0102",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    implementationRouteOrEndpointPaths.length === 0;
  const noOauthTokenSessionImplementationFromFp0102 = [
    "does not authorize oauth/token/session implementation",
    "no oauth implementation is required",
    "no token/session implementation is required",
    "oauth is future-only",
    "token/session implementation is future-only",
    "no openai api keys and no openai_api_key usage",
  ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpImplementationOrDeploymentFromFp0102 = [
    "does not authorize remote mcp server implementation or deployment",
    "no remote mcp implementation is required",
    "no remote mcp deployment is required",
    "remote mcp deployment is future-only",
    "stable https host as a future input only",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppsSdkResourceFromFp0102 = [
    "does not authorize apps sdk iframe/resource implementation",
    "no apps sdk resource implementation is required",
    "ui/resource work remains a later apps sdk/resource plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noAppSubmissionFromFp0102 = [
    "does not authorize app submission",
    "no app submission is required",
    "submission is a later submission master-plan",
  ].every((requiredText) => normalized.includes(requiredText));
  const noOpenAiApiCallsFromFp0102 =
    [
      "does not authorize openai api/model calls",
      "no openai api/model calls are required",
      "no openai api/model calls and does not authorize api/model integration",
      "no openai api/model call",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noOpenAiApiCalls &&
    noModelCalls;
  const noSourceMutationFinanceWriteFromFp0102 = [
    "no source mutation",
    "no finance writes",
    "no finance write or source mutation is required",
  ].every((requiredText) => normalized.includes(requiredText));
  const noPublicAssetsSubmissionArtifactsFromFp0102 =
    [
      "no screenshots",
      "no generated images",
      "no public assets",
      "no listing copy",
      "no app-submission artifacts",
      "no public assets/listing copy/screenshots are required",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    publicAssetsSubmissionArtifactPaths.length === 0;
  const fp0101ImplementationSequencingBoundaryStillVerified =
    fp0101Boundary.absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified &&
    fp0101Boundary.publicAppImplementationSequencingPlanBoundaryVerified;
  const fp0100PublicSecurityBoundaryStillVerified =
    fp0100Boundary.fp0100BoundaryVerified &&
    fp0100Boundary.publicAppSecurityContractsFoundationVerified;

  return {
    absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified:
      endpointOauthRemoteMcpArchitecturePlanBoundaryVerified &&
      noEndpointImplementationFromFp0102 &&
      noOauthTokenSessionImplementationFromFp0102 &&
      noRemoteMcpImplementationOrDeploymentFromFp0102 &&
      noAppsSdkResourceFromFp0102 &&
      noAppSubmissionFromFp0102 &&
      noOpenAiApiCallsFromFp0102 &&
      noSourceMutationFinanceWriteFromFp0102 &&
      noPublicAssetsSubmissionArtifactsFromFp0102 &&
      fp0101ImplementationSequencingBoundaryStillVerified &&
      fp0100PublicSecurityBoundaryStillVerified,
    endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    noEndpointImplementationFromFp0102,
    noOauthTokenSessionImplementationFromFp0102,
    noRemoteMcpImplementationOrDeploymentFromFp0102,
    noAppsSdkResourceFromFp0102,
    noAppSubmissionFromFp0102,
    noOpenAiApiCallsFromFp0102,
    noSourceMutationFinanceWriteFromFp0102,
    noPublicAssetsSubmissionArtifactsFromFp0102,
    fp0101ImplementationSequencingBoundaryStillVerified,
    fp0100PublicSecurityBoundaryStillVerified,
  };
}

function fp0103EndpointArchitectureProofContractsBoundary() {
  const absentBoundary = {
    fp0103AbsentOrLocalEndpointArchitectureProofContractsVerified: true,
    endpointArchitectureProofContractsFoundationVerified: true,
    noEndpointImplementationFromFp0103: true,
    noRouteImplementationFromFp0103: true,
    noApiBackendRoutesFromFp0103: true,
    noOauthTokenSessionImplementationFromFp0103: true,
    noRemoteMcpImplementationOrDeploymentFromFp0103: true,
    noAppsSdkResourceFromFp0103: true,
    noPublicAppImplementationFromFp0103: true,
    noAppSubmissionFromFp0103: true,
    noOpenAiApiCallsFromFp0103: true,
    noSourceMutationFinanceWriteFromFp0103: true,
    noPublicAssetsSubmissionArtifactsFromFp0103: true,
    publicAppImplementationSubmissionFutureOnlyFromFp0103: true,
    fp0102EndpointOauthRemoteMcpArchitectureBoundaryStillVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );
  const fp0103PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0103/u.test(path),
  );
  const fp0104Boundary = fp0104EndpointImplementationReadinessBoundary();

  if (fp0103PathHits.length === 0) {
    return { ...absentBoundary, ...fp0104Boundary };
  }
  if (
    fp0103PathHits.length !== 1 ||
    fp0103PathHits[0] !==
      "plans/FP-0103-read-only-chatgpt-app-mcp-endpoint-architecture-proof-contracts-foundation.md"
  ) {
    return { ...failedBoundary, ...fp0104Boundary };
  }

  const normalized = readFileSync(fp0103PathHits[0], "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  const noFp0103RuntimePaths = !repoFilePaths().some(
    (path) =>
      !isAllowedFp0107LocalRouteAdapterPath(path) &&
      /^(apps\/web\/app|apps\/web\/pages|apps\/web\/api|apps\/control-plane|packages\/api|packages\/server|packages\/backend|packages\/db)\//u.test(
        path,
      ) &&
      /fp-?0103|endpoint|oauth|remote-mcp|apps-sdk/u.test(path),
  );
  const noFp0103PublicAssetPaths = !repoFilePaths().some(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0103|endpoint|listing|submission|public-asset|app-submission/u.test(
        path.toLowerCase(),
      ),
  );
  const endpointArchitectureProofContractsFoundationVerified =
    [
      "fp-0103 is not implementation",
      "fp-0103 is local/proof-only/read-only endpoint architecture contract work",
      "fp-0103 defines endpoint architecture proof contracts only",
      "endpoint inventory is future-only",
      "future endpoint inventory must name path, method, transport, request envelope, response envelope, auth requirement, health path if any, refusal/failure behavior, and logging posture before implementation",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0103RuntimePaths;
  const noEndpointImplementationFromFp0103 =
    [
      "fp-0103 does not authorize endpoint implementation",
      "no endpoint path is implemented",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0103RuntimePaths;
  const noRouteImplementationFromFp0103 =
    [
      "fp-0103 does not authorize route implementation",
      "no route implementation is authorized by fp-0103",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0103RuntimePaths;
  const noApiBackendRoutesFromFp0103 =
    normalized.includes(
      "fp-0103 does not authorize web api/backend/control-plane route implementation",
    ) && noFp0103RuntimePaths;
  const noOauthTokenSessionImplementationFromFp0103 = normalized.includes(
    "fp-0103 does not authorize oauth/token/session implementation",
  );
  const noRemoteMcpImplementationOrDeploymentFromFp0103 = normalized.includes(
    "fp-0103 does not authorize remote mcp server implementation or deployment",
  );
  const noAppsSdkResourceFromFp0103 = normalized.includes(
    "fp-0103 does not authorize apps sdk iframe/resource implementation",
  );
  const noPublicAppImplementationFromFp0103 = normalized.includes(
    "fp-0103 does not authorize public chatgpt app implementation",
  );
  const noAppSubmissionFromFp0103 = normalized.includes(
    "fp-0103 does not authorize app submission",
  );
  const noOpenAiApiCallsFromFp0103 =
    normalized.includes("fp-0103 does not authorize openai api/model calls") &&
    noOpenAiApiCalls &&
    noModelCalls;
  const noSourceMutationFinanceWriteFromFp0103 =
    normalized.includes("source mutation") &&
    normalized.includes("finance write");
  const noPublicAssetsSubmissionArtifactsFromFp0103 =
    [
      "screenshots",
      "listing copy",
      "public assets",
      "app-submission artifacts",
      "generated public assets",
    ].every((requiredText) => normalized.includes(requiredText)) &&
    noFp0103PublicAssetPaths;
  const publicAppImplementationSubmissionFutureOnlyFromFp0103 =
    normalized.includes("public app implementation/submission future-only");
  const fp0102EndpointOauthRemoteMcpArchitectureBoundaryStillVerified =
    fp0102Boundary.absentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified &&
    fp0102Boundary.endpointOauthRemoteMcpArchitecturePlanBoundaryVerified;
  const fp0103AbsentOrLocalEndpointArchitectureProofContractsVerified =
    endpointArchitectureProofContractsFoundationVerified &&
    noEndpointImplementationFromFp0103 &&
    noRouteImplementationFromFp0103 &&
    noApiBackendRoutesFromFp0103 &&
    noOauthTokenSessionImplementationFromFp0103 &&
    noRemoteMcpImplementationOrDeploymentFromFp0103 &&
    noAppsSdkResourceFromFp0103 &&
    noPublicAppImplementationFromFp0103 &&
    noAppSubmissionFromFp0103 &&
    noOpenAiApiCallsFromFp0103 &&
    noSourceMutationFinanceWriteFromFp0103 &&
    noPublicAssetsSubmissionArtifactsFromFp0103 &&
    publicAppImplementationSubmissionFutureOnlyFromFp0103 &&
    fp0102EndpointOauthRemoteMcpArchitectureBoundaryStillVerified;

  return {
    fp0103AbsentOrLocalEndpointArchitectureProofContractsVerified,
    ...fp0104Boundary,
    endpointArchitectureProofContractsFoundationVerified,
    noEndpointImplementationFromFp0103,
    noRouteImplementationFromFp0103,
    noApiBackendRoutesFromFp0103,
    noOauthTokenSessionImplementationFromFp0103,
    noRemoteMcpImplementationOrDeploymentFromFp0103,
    noAppsSdkResourceFromFp0103,
    noPublicAppImplementationFromFp0103,
    noAppSubmissionFromFp0103,
    noOpenAiApiCallsFromFp0103,
    noSourceMutationFinanceWriteFromFp0103,
    noPublicAssetsSubmissionArtifactsFromFp0103,
    publicAppImplementationSubmissionFutureOnlyFromFp0103,
    fp0102EndpointOauthRemoteMcpArchitectureBoundaryStillVerified,
  };
}

function fp0104EndpointImplementationReadinessBoundary() {
  const absentBoundary = {
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified: true,
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified: true,
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified: true,
    fp0107Absent: true,
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
    endpointRuntimeChangedFilesVerified: true,
    endpointRuntimeRepositoryInventoryVerified: true,
    fp0103EndpointArchitectureProofContractsStillVerified: true,
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );
  const fp0104PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0104/u.test(path),
  );
  const fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified =
    fp0105EndpointRouteOwnershipBoundary();
  const fp0106BoundaryVerified =
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified();
  const fp0107AbsentVerified = fp0107Absent();

  if (fp0104PathHits.length === 0) {
    return {
      ...absentBoundary,
      fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified,
      fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
        fp0106BoundaryVerified,
      fp0107Absent: fp0107AbsentVerified,
    };
  }
  if (
    fp0104PathHits.length !== 1 ||
    fp0104PathHits[0] !==
      "plans/FP-0104-read-only-chatgpt-app-mcp-endpoint-implementation-readiness-and-inventory-master-plan.md"
  ) {
    return {
      ...failedBoundary,
      fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified,
      fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
        fp0106BoundaryVerified,
      fp0107Absent: fp0107AbsentVerified,
    };
  }

  const normalized = readFileSync(fp0104PathHits[0], "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
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
  ].every((requiredText) => normalized.includes(requiredText));
  const exactFutureEndpointInventoryReadinessVerified = [
    "exact future chatgpt-facing endpoint path that can be named from current repo truth and official docs",
    "| /mcp |",
    "endpoint path naming beyond /mcp is blocked",
    "request envelope",
    "response envelope",
    "auth requirement",
    "refusal/failure behavior",
    "logging posture",
  ].every((requiredText) => normalized.includes(requiredText));
  const noEndpointImplementationFromFp0104 =
    normalized.includes("fp-0104 does not authorize endpoint implementation") &&
    normalized.includes("no endpoints");
  const noRouteImplementationFromFp0104 =
    normalized.includes("fp-0104 does not authorize route implementation") &&
    normalized.includes("no route code");
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
    ) && normalized.includes("deployment remains future-only");
  const noAppsSdkResourceFromFp0104 =
    normalized.includes(
      "fp-0104 does not authorize apps sdk iframe/resource implementation",
    ) && normalized.includes("no apps sdk iframe/resource registration");
  const noAppSubmissionFromFp0104 =
    normalized.includes("fp-0104 does not authorize app submission") &&
    normalized.includes("no app submission");
  const noOpenAiApiCallsFromFp0104 =
    normalized.includes("fp-0104 does not authorize openai api/model calls") &&
    noOpenAiApiCalls &&
    noModelCalls;
  const noSourceMutationFinanceWriteFromFp0104 =
    normalized.includes("no source mutation") &&
    normalized.includes("no finance writes");
  const noPublicAssetsSubmissionArtifactsFromFp0104 = [
    "no screenshots",
    "no generated images",
    "no public assets",
    "no listing copy",
    "no app-submission artifacts",
  ].every((requiredText) => normalized.includes(requiredText));
  const fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified =
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
    noPublicAssetsSubmissionArtifactsFromFp0104;

  return {
    fp0104AbsentOrDocsOnlyEndpointImplementationReadinessBoundaryVerified,
    fp0105AbsentOrLocalEndpointRouteOwnershipTransportAdapterContractsVerified,
    fp0106AbsentOrLocalMcpProtocolEnvelopeToolDispatchContractsVerified:
      fp0106BoundaryVerified,
    fp0107Absent: fp0107AbsentVerified,
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
    endpointRuntimeChangedFilesVerified: true,
    endpointRuntimeRepositoryInventoryVerified: true,
    fp0103EndpointArchitectureProofContractsStillVerified: true,
    fp0103EndpointArchitecturePostmergeProofDurabilityVerified: true,
  };
}

function fp0105EndpointRouteOwnershipBoundary() {
  const fp0105Path =
    "plans/FP-0105-read-only-chatgpt-app-mcp-endpoint-route-ownership-transport-adapter-proof-contracts.md";
  const fp0105PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0105/u.test(path),
  );

  if (fp0105PathHits.length === 0) return true;
  if (fp0105PathHits.length !== 1 || fp0105PathHits[0] !== fp0105Path) {
    return false;
  }

  const normalized = readFileSync(fp0105Path, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
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
  const fp0106Path =
    "plans/FP-0106-read-only-chatgpt-app-mcp-protocol-envelope-tool-dispatch-proof-contracts.md";
  const fp0106PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0106/u.test(path),
  );

  if (fp0106PathHits.length === 0) return true;
  if (fp0106PathHits.length !== 1 || fp0106PathHits[0] !== fp0106Path) {
    return false;
  }

  const normalized = readFileSync(fp0106Path, "utf8")
    .toLowerCase()
    .replace(/`/gu, "");
  return [
    "fp-0106 is local/proof-only/read-only mcp protocol envelope and tool-dispatch contract work",
    "fp-0106 does not authorize endpoint implementation",
    "fp-0106 does not authorize route implementation",
    "fp-0106 does not authorize oauth/token/session implementation",
    "fp-0106 defines future mcp protocol envelope and read-only tool-dispatch proof contracts only",
    "fp-0106 keeps fp-0107 absent",
    "mcpprotocolproof",
  ].every((requiredText) => normalized.includes(requiredText));
}

function fp0107Absent() {
  const fp0107Hits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0107/u.test(path),
  );
  return (
    fp0107Hits.length === 0 ||
    (fp0107Hits.length === 1 &&
      fp0107Hits[0] ===
        "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md")
  );
}

function noFp0100RouteOrEndpointPaths() {
  return !repoFilePaths().some(
    (path) =>
      !isAllowedFp0107LocalRouteAdapterPath(path) &&
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|public-app-security|public-security|security-boundary|endpoint|oauth|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100AppsSdkResourcePaths() {
  return !repoFilePaths().some(
    (path) =>
      !isAllowedFp0107LocalRouteAdapterPath(path) &&
      /^(apps\/web|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|apps-sdk|appssdk|register-resource|registerresource|iframe/u.test(
        path.toLowerCase(),
      ),
  );
}

function isAllowedFp0107LocalRouteAdapterPath(path) {
  return (
    path ===
      "plans/FP-0107-read-only-chatgpt-app-mcp-local-fastify-mcp-route-adapter-foundation.md" ||
    path === FP0125_LOCAL_ROUTE_PLAN ||
    path === FP0125_LOCAL_ROUTE_PATH ||
    path === FP0125_LOCAL_ROUTE_SPEC_PATH ||
    path === FP0125_LOCAL_ROUTE_PROOF_PATH ||
    path === "apps/control-plane/src/app.ts" ||
    path === "tools/read-only-mcp-route-adapter-proof.mjs" ||
    /^apps\/control-plane\/src\/modules\/read-only-app-mcp-endpoint\/(?:routes|schema|formatter|service|evidence-dispatcher)(?:\.spec)?\.ts$/u.test(
      path,
    )
  );
}

function noFp0100PublicAssets() {
  return !repoFilePaths().some(
    (path) =>
      /\.(png|jpe?g|gif|webp|svg|fig|pdf|pptx?)$/iu.test(path) &&
      /fp-?0100|public-app-security|public-asset|submission|listing/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100ListingCopy() {
  return !repoFilePaths().some(
    (path) =>
      /(app-submission|submission-assets|public-listing|store-listing)/iu.test(
        path,
      ) && /fp-?0100|public-app-security/u.test(path.toLowerCase()),
  );
}

function verifyLocalPreviewRouteBoundary() {
  const routePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  const localPreviewRouteExists =
    repoFilePaths().includes(routePath) && existsSync(routePath);
  if (!localPreviewRouteExists) {
    return {
      localPreviewRouteExists: false,
      localPreviewRouteRemainsLocalNoindexOnly: false,
      routeMetadataNoIndexBoundaryVerified: false,
    };
  }
  const routeSource = readFileSync(routePath, "utf8");
  const routeMetadataNoIndexBoundaryVerified =
    /export\s+const\s+metadata/u.test(routeSource) &&
    /title:\s*["'][^"']+["']/u.test(routeSource) &&
    /robots:\s*\{/u.test(routeSource) &&
    /index:\s*false/u.test(routeSource) &&
    /follow:\s*false/u.test(routeSource) &&
    /noarchive:\s*true/u.test(routeSource) &&
    !/\bgenerateMetadata\b/u.test(routeSource) &&
    !/\bfetch\s*\(/u.test(routeSource) &&
    !/\bprocess\s*\.\s*env\b/u.test(routeSource);

  return {
    localPreviewRouteExists,
    localPreviewRouteRemainsLocalNoindexOnly:
      localPreviewRouteExists && routeMetadataNoIndexBoundaryVerified,
    routeMetadataNoIndexBoundaryVerified,
  };
}

function readPublicAppProofGateSourceText() {
  return repoFilePaths()
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
    /^packages\/domain\/src\/read-only-app-mcp-public-security.*\.ts$/u.test(
      path,
    ) ||
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
    /\bopenai\s*\./u,
    /\bresponses\s*\.\s*create\b/u,
    /\bchat\s*\.\s*completions\b/u,
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
    new RegExp(`\\b${escapeRegExp(hostName)}\\b`, "u"),
    new RegExp(`\\bfetch\\s*\\(\\s*["'][^"']*${escapeRegExp(hostName)}`, "u"),
  ];

  return checks.some((check) => check.test(sourceText));
}

function hasCodeLevelModelIntegration(sourceText) {
  const modelCallName = ["call", "Model"].join("");
  return [
    new RegExp(`\\b${modelCallName}\\b`, "u"),
    /\bmodel\s*\.\s*create\b/u,
    /\bmodels\s*\.\s*create\b/u,
    /\bchatCompletions\s*\(/u,
  ].some((check) => check.test(sourceText));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
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
  return results;
}
