import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PublicAppSecurityProofSchema,
  buildPublicAppSecurityProof,
} from "../packages/domain/src/index.ts";

const FP0100_PLAN =
  "plans/FP-0100-read-only-chatgpt-app-mcp-public-app-security-boundary-contracts-foundation.md";

const fp0101Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0101/u.test(path),
);
const noRoutesAdded = noFp0100RouteOrEndpointPaths();
const noEndpointsAdded = noRoutesAdded;
const noAppsSdkResourcesAdded = noFp0100AppsSdkResourcePaths();
const noPublicAssets = noFp0100PublicAssets();
const noListingCopy = noFp0100ListingCopy();
const securitySourceText = readSecuritySourceText();
const noOpenAiApiCalls =
  !/(openai_api_key|from\s+["']openai["']|openai\.|responses\.create|chat\.completions|api\.openai\.com)/iu.test(
    securitySourceText,
  );
const noModelCalls =
  noOpenAiApiCalls &&
  !/(callmodel|model\.create|models\.create|chatcompletions)/iu.test(
    securitySourceText.replace(/[^a-z0-9.]+/giu, ""),
  );
const fp0100Boundary = fp0100PublicAppSecurityBoundary();

const proof = PublicAppSecurityProofSchema.parse(
  buildPublicAppSecurityProof({
    fp0100BoundaryVerified:
      fp0100Boundary.fp0100BoundaryVerified &&
      fp0100Boundary.publicAppSecurityContractsFoundationVerified,
    fp0101Absent,
    localPreviewRouteRemainsLocalNoindexOnly:
      localPreviewRouteRemainsLocalNoindexOnly(),
    noAppsSdkResourcesAdded,
    noEndpointsAdded,
    noListingCopy,
    noModelCalls,
    noOpenAiApiCalls,
    noPublicAssets,
    noRoutesAdded,
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
  const noOauthImplementationFromFp0100 =
    [
      "does not authorize oauth",
      "oauth/token/session work is deferred",
      "no oauth",
    ].every((requiredText) => normalized.includes(requiredText));
  const noRemoteMcpDeploymentFromFp0100 =
    [
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
  const noAppSubmissionFromFp0100 =
    [
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
  const noSourceMutationFinanceWriteFromFp0100 =
    [
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

function localPreviewRouteRemainsLocalNoindexOnly() {
  const routePath = "apps/web/app/read-only-app-mcp-preview/page.tsx";
  if (!repoFilePaths().includes(routePath)) return true;
  const routeSource = readFileSync(routePath, "utf8");
  return (
    /export\s+const\s+metadata/u.test(routeSource) &&
    /robots:\s*\{/u.test(routeSource) &&
    /index:\s*false/u.test(routeSource) &&
    /follow:\s*false/u.test(routeSource) &&
    /noarchive:\s*true/u.test(routeSource)
  );
}

function readSecuritySourceText() {
  return repoFilePaths()
    .filter((path) =>
      /packages\/domain\/src\/read-only-app-mcp-public-security/u.test(path),
    )
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
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
