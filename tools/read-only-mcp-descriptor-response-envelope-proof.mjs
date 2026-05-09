import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AppMcpDescriptorEnvelopeProofSchema,
  buildAppMcpDescriptorEnvelopeProof,
} from "../packages/domain/src/index.ts";

const scriptNames = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
);

const noPackageScriptsAdded = !scriptNames.some((name) =>
  /v2g|read-only.*mcp.*descriptor|descriptor.*envelope|app.*mcp/u.test(name),
);
const noSmokeAliasesAdded = !scriptNames.some((name) =>
  /^smoke:.*(v2g|mcp.*descriptor|descriptor.*envelope|app.*mcp)/u.test(name),
);
const FP0088_PLAN =
  "plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md";
const FP0089_PLAN =
  "plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md";
const fp0088Boundary = fp0088DocsOnlyBoundary();
const fp0089Boundary = fp0089DocsOnlyBoundary();
const fp0090Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0090/u.test(path),
);

const proof = AppMcpDescriptorEnvelopeProofSchema.parse(
  buildAppMcpDescriptorEnvelopeProof({
    fp0088AbsentOrDocsOnlyBoundaryVerified:
      fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
    fp0089AbsentOrDocsOnlyBoundaryVerified:
      fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
    fp0090Absent,
    premiumUiSecurityPlanBoundaryVerified:
      fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
    premiumUiDesignSystemPlanBoundaryVerified:
      fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
    noUiImplementationFromFp0088:
      fp0088Boundary.noUiImplementationFromFp0088,
    noUiImplementationFromFp0089:
      fp0089Boundary.noUiImplementationFromFp0089,
    noAppsSdkIframeFromFp0089:
      fp0089Boundary.noAppsSdkIframeFromFp0089,
    noEndpointOauthSubmissionFromFp0088:
      fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
    noEndpointOauthSubmissionFromFp0089:
      fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
    noPackageScriptsAdded,
    noSmokeAliasesAdded,
  }),
);

console.log(JSON.stringify(proof, null, 2));

function fp0088DocsOnlyBoundary() {
  const fp0088PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0088/u.test(path),
  );

  if (fp0088PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noEndpointOauthSubmissionFromFp0088: true,
      noUiImplementationFromFp0088: true,
      premiumUiSecurityPlanBoundaryVerified: true,
    };
  }

  if (fp0088PathHits.length !== 1 || fp0088PathHits[0] !== FP0088_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noEndpointOauthSubmissionFromFp0088: false,
      noUiImplementationFromFp0088: false,
      premiumUiSecurityPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0088_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0088 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no package scripts or smoke aliases",
    "no eval datasets, fixtures, sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiSecurityPlanBoundaryVerified = [
    "premium ui readiness requirements only",
    "app/mcp security readiness requirements only",
    "premium apple/openai-style visual standard",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0088 = [
    "does not authorize apps sdk iframe/ui code",
    "future ui polish/design-system implementation plan",
    "before ui code",
    "do not implement ui",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0088 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before submission",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noEndpointOauthSubmissionFromFp0088,
    noUiImplementationFromFp0088,
    premiumUiSecurityPlanBoundaryVerified,
  };
}

function fp0089DocsOnlyBoundary() {
  const fp0089PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0089/u.test(path),
  );

  if (fp0089PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0089: true,
      noEndpointOauthSubmissionFromFp0089: true,
      noUiImplementationFromFp0089: true,
      premiumUiDesignSystemPlanBoundaryVerified: true,
    };
  }

  if (fp0089PathHits.length !== 1 || fp0089PathHits[0] !== FP0089_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0089: false,
      noEndpointOauthSubmissionFromFp0089: false,
      noUiImplementationFromFp0089: false,
      premiumUiDesignSystemPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0089_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0089 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui design-system readiness plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiDesignSystemPlanBoundaryVerified = [
    "design tokens",
    "semantic color tokens",
    "spacing scale",
    "typography scale",
    "evidence-card hierarchy",
    "citation/source-anchor affordances",
    "refusal-state visual grammar",
    "limitation/freshness badges",
    "keyboard/focus behavior",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "sourceanchordrawer",
    "premium apple/openai-style visual standard",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0089 = [
    "does not authorize ui code",
    "requires a later ui implementation finance plan before any component code",
    "no ui implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0089 = [
    "does not authorize apps sdk iframe/ui code",
    "no apps sdk iframe/ui",
    "does not authorize public app implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0089 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0089,
    noEndpointOauthSubmissionFromFp0089,
    noUiImplementationFromFp0089,
    premiumUiDesignSystemPlanBoundaryVerified,
  };
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
