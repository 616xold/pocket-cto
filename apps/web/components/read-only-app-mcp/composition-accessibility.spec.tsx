import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  FreshnessBadge,
  LoadingEvidenceState,
  RawFullFileDumpRefusalState,
  ReadOnlyAppMcpEnvelopePreview,
  UnsafeActionRefusalState,
  type ReadOnlyAppMcpCitation,
  type ReadOnlyAppMcpEvidenceCard,
  type ReadOnlyAppMcpForbiddenAction,
  type ReadOnlyAppMcpFreshness,
  type ReadOnlyAppMcpLimitation,
  type ReadOnlyAppMcpPermittedNextAction,
  type ReadOnlyAppMcpSourceAnchor,
} from ".";
import { colors } from "./styles";

describe("read-only app/MCP premium UI composition accessibility foundation", () => {
  it("renders one main landmark through AppShell and unique labelled sections", () => {
    const html = renderPreview();
    const sectionLabelIds = readAttributeValues(html, "section", "aria-labelledby");
    const accessibleNames = sectionLabelIds.map((id) => readElementTextById(html, id));

    expect(countOccurrences(html, "<main")).toBe(1);
    expect(html).toContain('data-layout="read-only-app-mcp-experience-frame"');
    expect(new Set(sectionLabelIds).size).toBe(sectionLabelIds.length);
    expect(accessibleNames.every((name) => name.length > 0)).toBe(true);
    expect(new Set(accessibleNames).size).toBe(accessibleNames.length);
  });

  it("keeps headings in logical order with nested panel heading levels", () => {
    const headings = readHeadings(renderPreview());

    expect(headings.map((heading) => heading.text)).toEqual([
      "Pocket CFO evidence answer",
      "Read-only evidence experience",
      "Answer status is evidence-backed",
      "Evidence card stack",
      "Synthetic evidence card",
      "Citation rail",
      "Source anchor panel",
      "Synthetic source anchor",
      "Freshness posture",
      "Limitation callout",
      "Permitted next review steps",
      "Forbidden action posture",
      "Privacy boundary",
      "No-runtime boundary",
    ]);
    expect(headings.map((heading) => heading.level)).toEqual([
      1, 2, 3, 3, 4, 3, 3, 4, 3, 3, 3, 3, 3, 3,
    ]);
    for (let index = 1; index < headings.length; index += 1) {
      const current = headings[index];
      const previous = headings[index - 1];

      expect(current?.level).toBeLessThanOrEqual(
        (previous?.level ?? 0) + 1,
      );
    }
  });

  it("uses scoped IDs so repeated refusal panels do not collide", () => {
    const html = renderToStaticMarkup(
      <>
        <RawFullFileDumpRefusalState
          headingLevel={3}
          sectionIdScope="first-refusal"
        />
        <RawFullFileDumpRefusalState
          headingLevel={3}
          sectionIdScope="second-refusal"
        />
      </>,
    );
    const sectionLabelIds = readAttributeValues(html, "section", "aria-labelledby");

    expect(sectionLabelIds).toHaveLength(2);
    expect(new Set(sectionLabelIds).size).toBe(2);
    expect(html).toContain("Refusal reason: source body export request");
    expect(html).toContain("Freshness: Fresh");
  });

  it("labels refusal and loading states without relying on color alone", () => {
    const html = renderToStaticMarkup(
      <>
        <UnsafeActionRefusalState headingLevel={3} sectionIdScope="unsafe" />
        <LoadingEvidenceState headingLevel={3} sectionIdScope="loading" />
      </>,
    );

    expect(html).toContain("Refusal reason: unsafe action");
    expect(html).toContain("No action was taken");
    expect(html).toContain("Freshness: Fresh");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading evidence state");
  });

  it("does not render forbidden controls, forms, action transport, or raw private fields", () => {
    const html = renderPreview();

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
      "server action",
      "POST",
      "upload control",
    ]) {
      expect(html).not.toContain(forbiddenMarkup);
    }

    for (const fieldName of forbiddenRawPrivateFieldNames) {
      expect(html).not.toContain(fieldName);
    }
  });

  it("keeps design token contrast and status text labels above color alone", () => {
    const contrastPairs = [
      ["ink/background", colors.ink, colors.background],
      ["ink/panel", colors.ink, colors.panel],
      ["muted/panel", colors.muted, colors.panel],
      ["fresh/freshSoft", colors.fresh, colors.freshSoft],
      ["warning/warningSoft", colors.warning, colors.warningSoft],
      ["danger/dangerSoft", colors.danger, colors.dangerSoft],
      ["proof/proofSoft", colors.proof, colors.proofSoft],
    ] as const;

    for (const [name, foreground, background] of contrastPairs) {
      expect(contrastRatio(foreground, background), name).toBeGreaterThanOrEqual(
        4.5,
      );
    }

    const statusHtml = renderToStaticMarkup(
      <>
        <FreshnessBadge freshness={freshness("fresh")} />
        <FreshnessBadge freshness={freshness("stale")} />
        <FreshnessBadge freshness={freshness("unsupported")} />
        <FreshnessBadge freshness={freshness("missing")} />
      </>,
    );

    expect(statusHtml).toContain("Freshness: Fresh");
    expect(statusHtml).toContain("Freshness: Stale");
    expect(statusHtml).toContain("Freshness: Unsupported");
    expect(statusHtml).toContain("Freshness: Missing");
    expect(renderPreview()).toContain("warning: bounded_excerpt_only");
    expect(renderPreview()).toContain("Blocked capability:");
  });

  it("proves responsive structure with DOM and style assertions only", () => {
    const html = renderPreview();

    expect(html).toContain('data-responsive="narrow-wide"');
    expect(html).toContain('data-layout="read-only-app-mcp-boundary-grid"');
    expect(html).toContain(
      "grid-template-columns:repeat(auto-fit, minmax(240px, 1fr))",
    );
    expect(html).toContain("max-width:1040px");
    expect(html).not.toContain(".png");
    expect(html).not.toContain(".jpg");
    expect(html).not.toContain("screenshot");
  });

  it("keeps copy away from advice-like CTAs and forbidden action prompts", () => {
    const visibleText = stripTags(renderPreview()).toLowerCase();

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

    for (const forbiddenPhrase of [
      "you should",
      "financial advice",
      "finance advice",
      "recommended action",
      "take action now",
      "generated finance advice",
    ]) {
      expect(visibleText).not.toContain(forbiddenPhrase);
    }
  });
});

const forbiddenRawPrivateFieldNames = [
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
];

function renderPreview() {
  const fresh = freshness("fresh");
  const limitations = readLimitations();
  const citations = readCitations();

  return renderToStaticMarkup(
    <ReadOnlyAppMcpEnvelopePreview
      citations={citations}
      evidenceCards={readEvidenceCards(fresh, limitations, citations)}
      forbiddenActions={readForbiddenActions()}
      freshness={fresh}
      limitations={limitations}
      noRuntimeBoundary={readNoRuntimeBoundary()}
      permittedNextActions={readPermittedActions()}
      privacyBoundary={readPrivacyBoundary()}
      scopeId="composition-proof"
      shellSubtitle="Local proof-only component shell for a future app/MCP envelope display."
      shellTitle="Pocket CFO evidence answer"
      sourceAnchors={readSourceAnchors()}
      status={{
        answer: {
          evidenceCount: 1,
          freshness: fresh,
          statusLabel: "Evidence-backed answer",
          summary:
            "The answer status is visible before evidence, citations, freshness, limitations, and boundaries.",
          title: "Answer status is evidence-backed",
        },
        kind: "answer",
      }}
      summary="A local composition proof for evidence hierarchy and accessibility posture."
      title="Read-only evidence experience"
    />,
  );
}

function freshness(
  state: ReadOnlyAppMcpFreshness["state"],
): ReadOnlyAppMcpFreshness {
  return {
    checkedAt: "2026-05-09T00:00:00.000Z",
    failClosedIfStale: true,
    state,
    summary: `Local proof freshness label for ${state} evidence posture.`,
  };
}

function readLimitations(): ReadOnlyAppMcpLimitation[] {
  return [
    {
      code: "bounded_excerpt_only",
      severity: "warning",
      summary: "Only bounded cited excerpts are displayed.",
    },
  ];
}

function readCitations(): ReadOnlyAppMcpCitation[] {
  return [
    {
      boundedExcerptOnly: true,
      citationId: "synthetic-citation-1",
      locator: "lines 1-3",
      sourceAnchorId: "synthetic-anchor-1",
      summary: "Synthetic citation linked to a bounded source anchor.",
    },
  ];
}

function readEvidenceCards(
  fresh: ReadOnlyAppMcpFreshness,
  limitations: ReadOnlyAppMcpLimitation[],
  citations: ReadOnlyAppMcpCitation[],
): ReadOnlyAppMcpEvidenceCard[] {
  return [
    {
      citations,
      evidenceCardId: "synthetic-evidence-card-1",
      freshness: fresh,
      limitations,
      sourceAnchorIds: ["synthetic-anchor-1"],
      summary:
        "Synthetic evidence-card posture used only inside this component test.",
      title: "Synthetic evidence card",
    },
  ];
}

function readSourceAnchors(): ReadOnlyAppMcpSourceAnchor[] {
  return [
    {
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      locator: "lines 1-3",
      sourceAnchorId: "synthetic-anchor-1",
      sourceId: "synthetic-source-1",
      summary:
        "Synthetic source-anchor summary; no full source body is displayed.",
      title: "Synthetic source anchor",
    },
  ];
}

function readPermittedActions(): ReadOnlyAppMcpPermittedNextAction[] {
  return [
    {
      action: "request_human_review",
      label: "Request human evidence review",
      summary:
        "A human may review the cited local evidence outside this component.",
    },
  ];
}

function readForbiddenActions(): ReadOnlyAppMcpForbiddenAction[] {
  return [
    {
      action: "external_release",
      reason: "External release remains future-plan-only.",
    },
    {
      action: "finance_write",
      reason: "Finance writes are not available in this read-only surface.",
    },
    {
      action: "public_listing",
      reason: "Public listing work is not part of this component slice.",
    },
  ];
}

function readPrivacyBoundary() {
  return {
    items: [
      "No real finance data in component tests.",
      "No full-file source body.",
      "No credentials, tokens, OAuth material, or provider keys.",
    ],
    summary:
      "Privacy posture is displayed as static local proof text, not as a public privacy boundary.",
    title: "Privacy boundary",
  };
}

function readNoRuntimeBoundary() {
  return {
    items: [
      "No app route or API route.",
      "No remote MCP server.",
      "No Apps SDK resource.",
      "No model call.",
    ],
    summary:
      "The component foundation is local React rendering only and does not start runtime behavior.",
    title: "No-runtime boundary",
  };
}

function readAttributeValues(html: string, tagName: string, attributeName: string) {
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*${attributeName}="([^"]+)"`,
    "gu",
  );
  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function readHeadings(html: string) {
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/gu)];

  return headings.map((match) => ({
    level: Number(match[1] ?? 0),
    text: stripTags(match[2] ?? ""),
  }));
}

function readElementTextById(html: string, id: string) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(
    `<h[1-6]\\b[^>]*id="${escapedId}"[^>]*>(.*?)<\\/h[1-6]>`,
    "u",
  );
  const match = html.match(pattern);

  return match ? stripTags(match[1] ?? "") : "";
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
}

function countOccurrences(value: string, pattern: string) {
  return value.split(pattern).length - 1;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../gu)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    ) ?? [0, 0, 0];
  const red = channels[0] ?? 0;
  const green = channels[1] ?? 0;
  const blue = channels[2] ?? 0;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
