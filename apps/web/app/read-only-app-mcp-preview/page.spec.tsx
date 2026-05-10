import { existsSync, readdirSync, readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("ReadOnlyAppMcpPreviewPage", () => {
  it("renders the shipped read-only app/MCP preview composition from synthetic props", async () => {
    const html = await renderPreviewPage();

    expect(html).toContain("Pocket CFO read-only app/MCP preview");
    expect(html).toContain("Answer state matrix foundation");
    expect(html).toContain("Answer state: read-only evidence hierarchy");
    expect(html).toContain("Synthetic preview evidence card");
    expect(html).toContain("Citation rail");
    expect(html).toContain("Source anchor panel");
    expect(html).toContain("Freshness: Fresh");
    expect(html).toContain("Privacy boundary");
    expect(html).toContain("No-runtime boundary");
    expect(html).toContain("Synthetic contract-shaped examples only.");
    expect(html).toContain("No web API route, backend route, endpoint, or remote MCP server.");
    expect(html).toContain("No Apps SDK resource, OAuth flow, listing artifact, OpenAI API call, or model call.");
    expect(html).not.toContain("not checked-in sample company data");
  });

  it("renders the local state matrix without widening the component contract", async () => {
    const html = await renderPreviewPage();

    for (const expectedState of [
      "Preview route state matrix",
      "Missing citation refusal",
      "Unsupported evidence refusal",
      "Stale evidence refusal",
      "Conflicting evidence refusal",
      "Prompt-injection warning state",
      "Source export refusal state",
      "Unsafe action refusal state",
      "Empty evidence state",
      "Loading evidence state",
      "Error and unsupported evidence",
      "Privacy boundary",
      "No-runtime boundary",
    ]) {
      expect(html).toContain(expectedState);
    }

    expect(html).toContain("Conflicting evidence refusal boundary");
    expect(html).toContain("Refusal reason: conflicting evidence");
    expect(html).toContain('data-layout="read-only-app-mcp-state-matrix"');
    expect(html).toContain('aria-busy="true"');
  });

  it("proves screenshotless premium visual QA with DOM and style assertions", async () => {
    const html = await renderPreviewPage();

    expect(html).toContain('data-visual-qa="screenshotless"');
    expect(html).toContain('data-typography="h1-28"');
    expect(html).toContain('data-typography="page-header"');
    expect(html).toContain('data-panel-tier="shell"');
    expect(html).toContain('data-panel-tier="panel"');
    expect(html).toContain('data-panel-hierarchy="state-card-grid"');
    expect(html).toContain('data-spacing="18"');
    expect(html).toContain('data-spacing="14"');
    expect(html).toContain("font-size:28px");
    expect(html).toContain("font-size:18px");
    expect(html).toContain("gap:18px");
    expect(html).toContain("gap:14px");
    expect(html).toContain("padding:20px");
    expect(html).toContain(
      "grid-template-columns:repeat(auto-fit, minmax(240px, 1fr))",
    );
    expect(html).toContain('data-responsive="narrow-wide"');
    expect(html).toContain("max-width:1040px");
    expectInOrder(html, [
      "Answer state: read-only evidence hierarchy",
      "Evidence card stack",
      "Citation rail",
      "Source anchor panel",
      "Freshness posture",
      "Limitation callout",
      "Permitted next review steps",
      "Forbidden action posture",
      "Privacy boundary",
      "No-runtime boundary",
    ]);

    for (const labelledState of [
      "Refusal reason: missing citation",
      "Refusal reason: unsupported evidence",
      "Refusal reason: stale evidence",
      "Refusal reason: conflicting evidence",
      "Refusal reason: prompt injection",
      "Refusal reason: source body export request",
      "Refusal reason: unsafe action",
      "Empty evidence state",
      "Loading evidence state",
      "Error reason: unsupported or conflicting evidence",
    ]) {
      expect(html).toContain(labelledState);
    }

    expect(html).not.toContain("<img");
    expect(html).not.toContain("<picture");
    expect(html).not.toContain(".png");
    expect(html).not.toContain(".jpg");
    expect(html).not.toContain(".jpeg");
    expect(html).not.toContain(".webp");
    expect(stripTags(html).toLowerCase()).not.toContain("screenshot");
  });

  it("proves state matrix accessibility with labelled groups and coherent headings", async () => {
    const html = await renderPreviewPage();
    const sectionIds = readAttributeValues(html, "section", "aria-labelledby");
    const headingIds = readHeadingIds(html);
    const allIds = readAllIds(html);
    const headings = readHeadings(html);

    expect(countOccurrences(html, "<main")).toBe(1);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
    expect(new Set(headingIds).size).toBe(headingIds.length);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(html).toContain('aria-label="Read-only preview state matrix groups"');
    expect(html).toContain(
      'aria-label="Refusal and transient state matrix group"',
    );
    expect(html).toContain(
      'aria-label="Privacy and no-runtime state matrix boundary group"',
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-status-label="unsupported or conflicting evidence"');

    expect(headings[0]).toEqual({
      id: "read-only-app-mcp-title",
      level: 1,
      text: "Pocket CFO read-only app/MCP preview",
    });
    for (let index = 1; index < headings.length; index += 1) {
      expect(headings[index]?.level).toBeLessThanOrEqual(
        (headings[index - 1]?.level ?? 0) + 1,
      );
    }
  });

  it("declares local-preview robots metadata without runtime behavior", async () => {
    const mod = await import("./page");

    expect(mod.metadata).toEqual({
      title: "Pocket CFO local read-only app/MCP preview",
      robots: {
        follow: false,
        index: false,
        noarchive: true,
      },
    });
  });

  it("keeps the route free of controls, POST transport, server actions, and fetches", async () => {
    const html = await renderPreviewPage();
    const source = readRouteSource();

    for (const forbiddenMarkup of [
      "<a ",
      "<button",
      "<form",
      "<input",
      "<select",
      "<textarea",
      "role=\"button\"",
      "type=\"submit\"",
      "method=\"post\"",
      "enctype=\"multipart/form-data\"",
    ]) {
      expect(html).not.toContain(forbiddenMarkup);
    }

    expect(source).not.toMatch(/\bfetch\s*\(/u);
    expect(source).not.toMatch(/\bPOST\b/u);

    for (const forbiddenSource of [
      "getControlPlane",
      "getSourceList",
      "getMissionList",
      "use server",
      "export async function POST",
      "NextResponse",
      "FormData",
      "OPENAI_API_KEY",
      "process.env",
      "openai.",
      "from \"openai\"",
      "from 'openai'",
      "from \"next/image\"",
      "from 'next/image'",
      "createOpenAI",
      "appSubmissionStarted",
      "oauthImplemented",
      "redirect_uri",
    ]) {
      expect(source).not.toContain(forbiddenSource);
    }
  });

  it("does not render raw/private field names, advice-like CTA copy, or public assets", async () => {
    const html = await renderPreviewPage();
    const visibleText = stripTags(html).toLowerCase();

    for (const fieldName of forbiddenRenderedFieldNames) {
      expect(html).not.toContain(fieldName);
    }

    for (const forbiddenPhrase of [
      "you should",
      "financial advice",
      "finance advice",
      "recommended action",
      "take action now",
      "generated finance advice",
      "public launch",
      "launch publicly",
      "public demo data",
      "app submission",
    ]) {
      expect(visibleText).not.toContain(forbiddenPhrase);
    }

    for (const forbiddenWord of [
      "approve",
      "send",
      "pay",
      "certify",
      "connect",
      "upload",
      "submit",
    ]) {
      expect(visibleText).not.toMatch(new RegExp(`\\b${forbiddenWord}\\b`, "u"));
    }

    expect(html).not.toContain(".png");
    expect(html).not.toContain(".jpg");
    expect(html).not.toContain(".jpeg");
    expect(html).not.toContain(".webp");
    expect(stripTags(html).toLowerCase()).not.toContain("screenshot");
    expect(html).not.toContain("app submission");
    expect(html).not.toContain("public launch");
    expect(html).not.toContain("<pre");
    expect(routeDirectoryAssets()).toEqual([]);
    expect(routeDirectoryDataFiles()).toEqual([]);
  });

  it("keeps the local route boundary to one page and no adjacent API route", () => {
    const routeFiles = readdirSync(new URL("./", import.meta.url)).filter(
      (name) => !name.endsWith(".spec.tsx"),
    );

    expect(routeFiles).toEqual(["page.tsx"]);
    expect(routeFiles).not.toContain("route.ts");
    expect(routeFiles).not.toContain("route.tsx");
    expect(
      existsSync(new URL("../api/read-only-app-mcp-preview", import.meta.url)),
    ).toBe(false);
    expect(repoPathHits(/apps\/web\/app\/read-only-app-mcp-preview\/route\.tsx?$/u)).toEqual([]);
    expect(repoPathHits(/apps\/web\/app\/api\/read-only-app-mcp-preview/u)).toEqual([]);
  });
});

async function renderPreviewPage() {
  const mod = await import("./page");

  return renderToStaticMarkup(<mod.default />);
}

function readRouteSource() {
  return readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
}

function routeDirectoryAssets() {
  return readdirSync(new URL("./", import.meta.url)).filter((name) =>
    /\.(png|jpe?g|webp|gif|svg)$/iu.test(name),
  );
}

function routeDirectoryDataFiles() {
  return readdirSync(new URL("./", import.meta.url)).filter((name) =>
    /(fixture|sample|demo|source-pack|public).*\.(json|csv|tsv|md|txt)$/iu.test(
      name,
    ),
  );
}

function repoPathHits(pattern: RegExp) {
  return repoFilePaths().filter((path) => pattern.test(path));
}

function expectInOrder(html: string, labels: string[]) {
  let previousIndex = -1;
  for (const label of labels) {
    const nextIndex = html.indexOf(label);
    expect(nextIndex).toBeGreaterThan(previousIndex);
    previousIndex = nextIndex;
  }
}

function readAttributeValues(
  html: string,
  tagName: string,
  attributeName: string,
) {
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*${attributeName}="([^"]+)"`,
    "gu",
  );

  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function readHeadingIds(html: string) {
  return [...html.matchAll(/<h[1-6]\b[^>]*\sid="([^"]+)"/gu)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function readAllIds(html: string) {
  return [...html.matchAll(/\sid="([^"]+)"/gu)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function readHeadings(html: string) {
  const headings = [...html.matchAll(/<h([1-6])\b([^>]*)>(.*?)<\/h\1>/gu)];

  return headings.map((match) => ({
    id: readId(match[2] ?? ""),
    level: Number(match[1] ?? 0),
    text: stripTags(match[3] ?? ""),
  }));
}

function readId(attributes: string) {
  const match = attributes.match(/\sid="([^"]+)"/u);

  return match?.[1] ?? "";
}

function countOccurrences(value: string, pattern: string) {
  return value.split(pattern).length - 1;
}

function repoFilePaths(root = new URL("../../../../", import.meta.url)): string[] {
  const paths: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (
      entry.name === ".git" ||
      entry.name === ".next" ||
      entry.name === ".turbo" ||
      entry.name === "coverage" ||
      entry.name === "dist" ||
      entry.name === "node_modules"
    ) {
      continue;
    }

    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, root);

    if (entry.isDirectory()) {
      paths.push(...repoFilePaths(child));
    } else {
      paths.push(child.pathname.replace(/^.*\/pocket-cto-starter\//u, ""));
    }
  }

  return paths.sort();
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
}

const forbiddenRenderedFieldNames = [
  "rawFullText",
  "rawFileText",
  "fullText",
  "fullFileText",
  "fileContents",
  "unboundedText",
  "originalFullText",
  "sourceText",
  "rawMarkdown",
  "documentText",
  "pageTextDump",
  "privateSourceText",
  "private_source_text",
  "credentials",
  "tokens",
  "oauthMaterial",
  "oauth_material",
  "apiKeys",
  "api_keys",
  "objectStoreDumps",
  "object_store_dumps",
  "databaseDumps",
  "database_dumps",
  "providerCredentials",
  "provider_credentials",
];
