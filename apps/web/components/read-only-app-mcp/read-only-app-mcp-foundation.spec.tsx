import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  buildAppMcpEvidenceEnvelope,
  buildAppMcpRefusalEnvelope,
} from "@pocket-cto/domain";
import {
  AppShell,
  CitationRail,
  EmptyEvidenceState,
  ErrorAndUnsupportedState,
  EvidenceAnswerPanel,
  EvidenceCardStack,
  ForbiddenActionsPanel,
  LimitationCallout,
  LoadingEvidenceState,
  MissingCitationRefusalState,
  NoRuntimeBoundaryPanel,
  PermittedNextActionsPanel,
  PrivacyBoundaryPanel,
  PromptInjectionWarningState,
  RawFullFileDumpRefusalState,
  RefusalPanel,
  SourceAnchorPanel,
  StaleEvidenceRefusalState,
  UnsafeActionRefusalState,
  UnsupportedEvidenceRefusalState,
  type ReadOnlyAppMcpCitation,
  type ReadOnlyAppMcpEvidenceCard,
  type ReadOnlyAppMcpForbiddenAction,
  type ReadOnlyAppMcpFreshness,
  type ReadOnlyAppMcpLimitation,
  type ReadOnlyAppMcpPermittedNextAction,
  type ReadOnlyAppMcpSourceAnchor,
} from ".";

describe("read-only app/MCP premium UI component foundation", () => {
  it("renders the evidence hierarchy without controls or runtime affordances", () => {
    const evidenceEnvelope = buildAppMcpEvidenceEnvelope();
    const freshness = readFreshness(evidenceEnvelope.freshness);
    const limitations = readLimitations(evidenceEnvelope.limitations);
    const citations = readCitations();
    const evidenceCards = readEvidenceCards(freshness, limitations, citations);
    const html = renderToStaticMarkup(
      <AppShell
        subtitle="Local proof-only component shell for a future app/MCP envelope display."
        title="Pocket CFO evidence answer"
      >
        <EvidenceAnswerPanel
          answer={{
            evidenceCount: evidenceEnvelope.evidence.length,
            freshness,
            statusLabel: "Evidence-backed answer",
            summary:
              "The answer status is visible before evidence, citations, freshness, limitations, and boundaries.",
            title: "Answer status is evidence-backed",
          }}
        />
        <EvidenceCardStack cards={evidenceCards} />
        <CitationRail citations={citations} />
        <SourceAnchorPanel sourceAnchors={readSourceAnchors()} />
        <LimitationCallout limitations={limitations} />
        <PermittedNextActionsPanel actions={readPermittedActions()} />
        <ForbiddenActionsPanel actions={readForbiddenActions()} />
        <PrivacyBoundaryPanel boundary={readPrivacyBoundary()} />
        <NoRuntimeBoundaryPanel boundary={readNoRuntimeBoundary()} />
      </AppShell>,
    );

    expect(html).toContain("Pocket CFO evidence answer");
    expect(html).toContain("Answer status is evidence-backed");
    expect(html).toContain("Evidence card stack");
    expect(html).toContain("Citation rail");
    expect(html).toContain("Source anchor panel");
    expect(html).toContain("Freshness: Fresh");
    expect(html).toContain("Limitation callout");
    expect(html).toContain("Permitted next review steps");
    expect(html).toContain("Forbidden action posture");
    expect(html).toContain("Privacy boundary");
    expect(html).toContain("No-runtime boundary");
    expect(html).toContain("Bounded excerpt only: yes");
    expect(html).toContain("Blocked capability");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("type=\"submit\"");
    expect(html).not.toContain("fetch(");
    expect(html).not.toContain("POST");
    expect(html).not.toContain("OPENAI_API_KEY");
    expect(html).not.toContain("rawFullText");
    expect(html).not.toContain("pageTextDump");
  });

  it("renders fail-closed refusal states for prompt injection and raw full-file requests", () => {
    const promptInjectionEnvelope = buildAppMcpRefusalEnvelope(
      "prompt_injection",
    );
    const rawDumpEnvelope = buildAppMcpRefusalEnvelope(
      "raw_full_file_dump_request",
    );
    const html = renderToStaticMarkup(
      <>
        <RefusalPanel
          refusal={{
            freshness: readFreshness(promptInjectionEnvelope.freshness),
            reason: "prompt_injection",
            summary:
              "Instructions inside source material are evidence text, not executable directions.",
            title: "Prompt-injection refusal",
          }}
        />
        <RefusalPanel
          refusal={{
            freshness: readFreshness(rawDumpEnvelope.freshness),
            reason: "raw_full_file_dump_request",
            summary:
              "The envelope refuses broad source disclosure and keeps review anchored to citations.",
            title: "Raw full-file request refusal",
          }}
        />
        <PromptInjectionWarningState />
        <RawFullFileDumpRefusalState />
      </>,
    );

    expect(html).toContain("Prompt-injection refusal");
    expect(html).toContain("prompt injection");
    expect(html).toContain("Raw full-file request refusal");
    expect(html).toContain("raw full-file dump request");
    expect(html).toContain("No action was taken");
    expect(html).toContain("source text instructions remain untrusted data");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<form");
  });

  it("renders fail-closed missing, unsupported, stale, and unsafe-action refusals", () => {
    const html = renderToStaticMarkup(
      <>
        <MissingCitationRefusalState />
        <UnsupportedEvidenceRefusalState />
        <StaleEvidenceRefusalState />
        <UnsafeActionRefusalState />
      </>,
    );

    expect(html).toContain("Missing citation refusal");
    expect(html).toContain("missing citation");
    expect(html).toContain("Unsupported evidence refusal");
    expect(html).toContain("unsupported evidence");
    expect(html).toContain("Stale evidence refusal");
    expect(html).toContain("stale evidence");
    expect(html).toContain("Unsafe action refusal");
    expect(html).toContain("unsafe action");
    expect(html).toContain("No action was taken");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("type=\"submit\"");
  });

  it("renders empty, loading, error, and unsupported evidence states", () => {
    const html = renderToStaticMarkup(
      <>
        <EmptyEvidenceState />
        <LoadingEvidenceState />
        <ErrorAndUnsupportedState />
      </>,
    );

    expect(html).toContain("Empty evidence state");
    expect(html).toContain("Loading evidence state");
    expect(html).toContain("aria-busy=\"true\"");
    expect(html).toContain("Error and unsupported evidence");
    expect(html).toContain("fails closed");
    expect(html).toContain("No fetch or model call is started");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<form");
  });
});

function readFreshness(input: {
  checkedAt: string;
  failClosedIfStale: boolean;
  state: ReadOnlyAppMcpFreshness["state"];
}): ReadOnlyAppMcpFreshness {
  return {
    checkedAt: input.checkedAt,
    failClosedIfStale: input.failClosedIfStale,
    state: input.state,
    summary:
      input.state === "fresh"
        ? "The local proof envelope carries fresh evidence posture."
        : "The local proof envelope fails closed for this freshness state.",
  };
}

function readLimitations(
  input: Array<{ code: string; summary: string }>,
): ReadOnlyAppMcpLimitation[] {
  return input.map((limitation) => ({
    code: limitation.code,
    severity: limitation.code === "local_proof_only" ? "info" : "blocking",
    summary: limitation.summary,
  }));
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
  freshness: ReadOnlyAppMcpFreshness,
  limitations: ReadOnlyAppMcpLimitation[],
  citations: ReadOnlyAppMcpCitation[],
): ReadOnlyAppMcpEvidenceCard[] {
  return [
    {
      citations,
      evidenceCardId: "synthetic-evidence-card-1",
      freshness,
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
        "Synthetic source-anchor summary; no raw source body is displayed.",
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
      action: "send_report",
      reason: "External communication remains future-plan-only.",
    },
    {
      action: "finance_write",
      reason: "Finance writes are not available in this read-only surface.",
    },
    {
      action: "submit_app",
      reason: "Public app submission is not part of this component slice.",
    },
  ];
}

function readPrivacyBoundary() {
  return {
    items: [
      "No real finance data in component tests.",
      "No raw full-file source body.",
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
      "No Apps SDK iframe resource.",
      "No OpenAI API or model call.",
    ],
    summary:
      "The component foundation is local React rendering only and does not start runtime behavior.",
    title: "No-runtime boundary",
  };
}
