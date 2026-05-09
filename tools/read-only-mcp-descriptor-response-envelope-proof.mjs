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
const FP0090_PLAN =
  "plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md";
const FP0091_PLAN =
  "plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md";
const fp0088Boundary = fp0088DocsOnlyBoundary();
const fp0089Boundary = fp0089DocsOnlyBoundary();
const fp0090Boundary = fp0090DocsOnlyBoundary();
const fp0091Boundary = fp0091LocalUiComponentBoundary();
const fp0092Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0092/u.test(path),
);

const proof = AppMcpDescriptorEnvelopeProofSchema.parse(
  buildAppMcpDescriptorEnvelopeProof({
    fp0088AbsentOrDocsOnlyBoundaryVerified:
      fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
    fp0089AbsentOrDocsOnlyBoundaryVerified:
      fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
    fp0090AbsentOrDocsOnlyBoundaryVerified:
      fp0090Boundary.absentOrDocsOnlyBoundaryVerified,
    fp0091AbsentOrLocalUiComponentBoundaryVerified:
      fp0091Boundary.absentOrLocalUiComponentBoundaryVerified,
    fp0092Absent,
    premiumUiSecurityPlanBoundaryVerified:
      fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
    premiumUiDesignSystemPlanBoundaryVerified:
      fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
    premiumUiImplementationPlanBoundaryVerified:
      fp0090Boundary.premiumUiImplementationPlanBoundaryVerified,
    premiumUiComponentFoundationVerified:
      fp0091Boundary.premiumUiComponentFoundationVerified,
    noUiImplementationFromFp0088:
      fp0088Boundary.noUiImplementationFromFp0088,
    noUiImplementationFromFp0089:
      fp0089Boundary.noUiImplementationFromFp0089,
    noAppsSdkIframeFromFp0089:
      fp0089Boundary.noAppsSdkIframeFromFp0089,
    noUiCodeFromFp0090: fp0090Boundary.noUiCodeFromFp0090,
    noAppsSdkIframeFromFp0090:
      fp0090Boundary.noAppsSdkIframeFromFp0090,
    noEndpointOauthSubmissionFromFp0088:
      fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
    noEndpointOauthSubmissionFromFp0089:
      fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
    noEndpointOauthSubmissionFromFp0090:
      fp0090Boundary.noEndpointOauthSubmissionFromFp0090,
    noPublicAppImplementationFromFp0090:
      fp0090Boundary.noPublicAppImplementationFromFp0090,
    noRoutesFromFp0091: fp0091Boundary.noRoutesFromFp0091,
    noEndpointsFromFp0091: fp0091Boundary.noEndpointsFromFp0091,
    noAppsSdkIframeFromFp0091: fp0091Boundary.noAppsSdkIframeFromFp0091,
    noOauthSubmissionFromFp0091:
      fp0091Boundary.noOauthSubmissionFromFp0091,
    noPublicAppImplementationFromFp0091:
      fp0091Boundary.noPublicAppImplementationFromFp0091,
    noOpenAiApiCallsFromFp0091:
      fp0091Boundary.noOpenAiApiCallsFromFp0091,
    noSourceMutationFinanceWriteFromFp0091:
      fp0091Boundary.noSourceMutationFinanceWriteFromFp0091,
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

function fp0090DocsOnlyBoundary() {
  const fp0090PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0090/u.test(path),
  );

  if (fp0090PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0090: true,
      noEndpointOauthSubmissionFromFp0090: true,
      noPublicAppImplementationFromFp0090: true,
      noUiCodeFromFp0090: true,
      premiumUiImplementationPlanBoundaryVerified: true,
    };
  }

  if (fp0090PathHits.length !== 1 || fp0090PathHits[0] !== FP0090_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0090: false,
      noEndpointOauthSubmissionFromFp0090: false,
      noPublicAppImplementationFromFp0090: false,
      noUiCodeFromFp0090: false,
      premiumUiImplementationPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0090_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0090 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui implementation master-plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no public app implementation",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiImplementationPlanBoundaryVerified = [
    "future ui implementation boundary",
    "screenshot review before merge",
    "accessibility acceptance criteria",
    "evidence hierarchy acceptance",
    "no action-looking controls for forbidden actions",
    "no raw text dump panels",
    "no advice-like ctas",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "evidencecardstack",
    "citationrail",
    "sourceanchordrawer",
    "freshnessbadge",
    "limitationcallout",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
    "apps/web/components/read-only-app-mcp",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiCodeFromFp0090 = [
    "does not authorize ui code yet",
    "this is not ui implementation",
    "future implementation slice may add ui components only if it remains local/proof-only/read-only",
    "no ui code was added",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0090 = [
    "does not authorize apps sdk iframe/ui code yet",
    "no apps sdk iframe/ui",
    "apps sdk iframe/ui implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0090 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "no endpoint implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noPublicAppImplementationFromFp0090 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation remains future-only",
    "public app implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0090,
    noEndpointOauthSubmissionFromFp0090,
    noPublicAppImplementationFromFp0090,
    noUiCodeFromFp0090,
    premiumUiImplementationPlanBoundaryVerified,
  };
}

function fp0091LocalUiComponentBoundary() {
  const fp0091PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0091/u.test(path),
  );
  const absentBoundary = {
    absentOrLocalUiComponentBoundaryVerified: true,
    noAppsSdkIframeFromFp0091: true,
    noEndpointsFromFp0091: true,
    noOauthSubmissionFromFp0091: true,
    noOpenAiApiCallsFromFp0091: true,
    noPublicAppImplementationFromFp0091: true,
    noRoutesFromFp0091: true,
    noSourceMutationFinanceWriteFromFp0091: true,
    premiumUiComponentFoundationVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0091PathHits.length === 0) return absentBoundary;
  if (fp0091PathHits.length !== 1 || fp0091PathHits[0] !== FP0091_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0091_PLAN, "utf8").toLowerCase();
  const componentSource = repoFilePaths()
    .filter((path) => path.startsWith("apps/web/components/read-only-app-mcp/"))
    .filter((path) => /\.(ts|tsx)$/u.test(path))
    .filter((path) => !/\.(spec|test)\.tsx?$/u.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .toLowerCase();
  const normalizedComponentSource = componentSource.replace(/[^a-z0-9]+/gu, "");
  const componentFilesVerified =
    componentSource.length > 0 &&
    [
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "evidencecardstack",
      "citationrail",
      "sourceanchorpanel",
      "freshnessbadge",
      "freshnesssummarypanel",
      "limitationcallout",
      "permittednextactionspanel",
      "forbiddenactionspanel",
      "privacyboundarypanel",
      "noruntimeboundarypanel",
      "promptinjectionwarningstate",
      "rawfullfiledumprefusalstate",
      "emptyevidencestate",
      "loadingevidencestate",
      "errorandunsupportedstate",
    ].every((name) => normalizedComponentSource.includes(name));
  const premiumUiComponentFoundationVerified =
    componentFilesVerified &&
    [
      "this slice writes actual ui component code",
      "strictly local, proof-only, read-only, and component-only",
      "local react components",
      "apps/web/components/read-only-app-mcp",
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "citationrail",
      "sourceanchorpanel",
      "errorandunsupportedstate",
    ].every((requiredText) => lower.includes(requiredText));
  const noRoutesFromFp0091 =
    ["does not add routes", "no app routes"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp"),
    );
  const noEndpointsFromFp0091 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp"),
    );
  const noAppsSdkIframeFromFp0091 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lower.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0091 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lower.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0091 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lower.includes(requiredText));
  const noOpenAiApiCallsFromFp0091 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lower.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0091 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lower.includes(requiredText),
    );

  return {
    absentOrLocalUiComponentBoundaryVerified:
      premiumUiComponentFoundationVerified &&
      noRoutesFromFp0091 &&
      noEndpointsFromFp0091 &&
      noAppsSdkIframeFromFp0091 &&
      noOauthSubmissionFromFp0091 &&
      noPublicAppImplementationFromFp0091 &&
      noOpenAiApiCallsFromFp0091 &&
      noSourceMutationFinanceWriteFromFp0091,
    noAppsSdkIframeFromFp0091,
    noEndpointsFromFp0091,
    noOauthSubmissionFromFp0091,
    noOpenAiApiCallsFromFp0091,
    noPublicAppImplementationFromFp0091,
    noRoutesFromFp0091,
    noSourceMutationFinanceWriteFromFp0091,
    premiumUiComponentFoundationVerified,
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
