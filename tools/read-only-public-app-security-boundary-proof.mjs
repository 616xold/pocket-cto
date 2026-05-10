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

const fp0101Boundary = fp0101PublicAppImplementationSequencingBoundary();
const fp0102Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0102/u.test(path),
);
const noRoutesAdded = noFp0100RouteOrEndpointPaths();
const noEndpointsAdded = noRoutesAdded;
const noAppsSdkResourcesAdded = noFp0100AppsSdkResourcePaths();
const noPublicAssets = noFp0100PublicAssets();
const noListingCopy = noFp0100ListingCopy();
const securitySourceText = readFp0100SecuritySourceText();
const noOpenAiApiCalls = !hasCodeLevelOpenAiIntegration(securitySourceText);
const noModelCalls =
  noOpenAiApiCalls && !hasCodeLevelModelIntegration(securitySourceText);
const publicSecurityNoOpenAiApiSourceScanVerified =
  noOpenAiApiCalls && noModelCalls;
const fp0100Boundary = fp0100PublicAppSecurityBoundary();
const localPreviewRouteBoundary = verifyLocalPreviewRouteBoundary();

const proof = PublicAppSecurityProofSchema.parse(
  buildPublicAppSecurityProof({
    fp0100BoundaryVerified:
      fp0100Boundary.fp0100BoundaryVerified &&
      fp0100Boundary.publicAppSecurityContractsFoundationVerified,
    fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
      fp0101Boundary
        .absentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified,
    fp0102Absent,
    publicAppImplementationSequencingPlanBoundaryVerified:
      fp0101Boundary.publicAppImplementationSequencingPlanBoundaryVerified,
    noEndpointImplementationFromFp0101:
      fp0101Boundary.noEndpointImplementationFromFp0101,
    noOauthImplementationFromFp0101:
      fp0101Boundary.noOauthImplementationFromFp0101,
    noRemoteMcpDeploymentFromFp0101:
      fp0101Boundary.noRemoteMcpDeploymentFromFp0101,
    noAppsSdkResourceFromFp0101:
      fp0101Boundary.noAppsSdkResourceFromFp0101,
    noAppSubmissionFromFp0101:
      fp0101Boundary.noAppSubmissionFromFp0101,
    noOpenAiApiCallsFromFp0101:
      fp0101Boundary.noOpenAiApiCallsFromFp0101,
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

function noFp0100RouteOrEndpointPaths() {
  return !repoFilePaths().some(
    (path) =>
      /^(apps\/web\/app|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|public-app-security|public-security|security-boundary|endpoint|oauth|remote-mcp/u.test(
        path.toLowerCase(),
      ),
  );
}

function noFp0100AppsSdkResourcePaths() {
  return !repoFilePaths().some(
    (path) =>
      /^(apps\/web|apps\/control-plane)\//u.test(path) &&
      /fp-?0100|apps-sdk|appssdk|register-resource|registerresource|iframe/u.test(
        path.toLowerCase(),
      ),
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

function readFp0100SecuritySourceText() {
  return repoFilePaths()
    .filter(isFp0100SecuritySourceSurface)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

function isFp0100SecuritySourceSurface(path) {
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
    new RegExp(`\\bnew\\s+${clientName}\\s*\\(`, "u"),
    /\bopenai\s*\./u,
    /\bresponses\s*\.\s*create\s*\(/u,
    /\bchat\s*\.\s*completions\s*(?:\.\s*create)?\s*\(/u,
    new RegExp(`\\bprocess\\s*\\.\\s*env\\s*\\.\\s*${keyName}\\b`, "u"),
    new RegExp(`\\b${keyName}\\b`, "u"),
    new RegExp(`\\bfetch\\s*\\(\\s*["'][^"']*${escapeRegExp(hostName)}`, "u"),
  ];

  return checks.some((check) => check.test(sourceText));
}

function hasCodeLevelModelIntegration(sourceText) {
  return [
    /\bcallModel\s*\(/u,
    /\bmodel\s*\.\s*create\s*\(/u,
    /\bmodels\s*\.\s*create\s*\(/u,
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
