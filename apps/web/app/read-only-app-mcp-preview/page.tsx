import type { Metadata } from "next";
import React from "react";
import {
  AppShell,
  EmptyEvidenceState,
  ErrorAndUnsupportedState,
  LoadingEvidenceState,
  NoRuntimeBoundaryPanel,
  PrivacyBoundaryPanel,
  ReadOnlyAppMcpExperienceFrame,
  RefusalPanel,
  type ReadOnlyAppMcpCitation,
  type ReadOnlyAppMcpEvidenceCard,
  type ReadOnlyAppMcpForbiddenAction,
  type ReadOnlyAppMcpFreshness,
  type ReadOnlyAppMcpLimitation,
  type ReadOnlyAppMcpPermittedNextAction,
  type ReadOnlyAppMcpRefusal,
  type ReadOnlyAppMcpSourceAnchor,
} from "../../components/read-only-app-mcp";
import {
  bodyStyle,
  colors,
  stackStyle,
  twoColumnGridStyle,
} from "../../components/read-only-app-mcp/styles";
import { SectionHeading } from "../../components/read-only-app-mcp/ui";

export const metadata: Metadata = {
  title: "Pocket CFO local read-only app/MCP preview",
  robots: {
    follow: false,
    index: false,
    noarchive: true,
  },
};

const previewFreshness: ReadOnlyAppMcpFreshness = {
  checkedAt: "2026-05-09T23:32:41.000Z",
  failClosedIfStale: true,
  state: "fresh",
  summary:
    "Synthetic local preview freshness posture; no runtime evidence lookup is performed.",
};

const previewLimitations: ReadOnlyAppMcpLimitation[] = [
  {
    code: "local_preview_only",
    severity: "info",
    summary:
      "This page is a local read-only preview over synthetic contract-shaped props.",
  },
  {
    code: "bounded_excerpt_only",
    severity: "warning",
    summary:
      "The preview demonstrates bounded citation posture without displaying a full source body.",
  },
];

const previewCitations: ReadOnlyAppMcpCitation[] = [
  {
    boundedExcerptOnly: true,
    citationId: "synthetic-preview-citation-1",
    locator: "synthetic lines 1-3",
    sourceAnchorId: "synthetic-preview-anchor-1",
    summary:
      "Synthetic bounded citation summary for local preview rendering only.",
  },
];

const previewEvidenceCards: ReadOnlyAppMcpEvidenceCard[] = [
  {
    citations: previewCitations,
    evidenceCardId: "synthetic-preview-evidence-card-1",
    freshness: previewFreshness,
    limitations: previewLimitations,
    sourceAnchorIds: ["synthetic-preview-anchor-1"],
    summary:
      "Synthetic evidence-card posture used only to render the local read-only preview route.",
    title: "Synthetic preview evidence card",
  },
];

const previewSourceAnchors: ReadOnlyAppMcpSourceAnchor[] = [
  {
    checksumSha256:
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    locator: "synthetic lines 1-3",
    sourceAnchorId: "synthetic-preview-anchor-1",
    sourceId: "synthetic-preview-source-1",
    summary:
      "Synthetic source-anchor summary; the preview does not display a full source body.",
    title: "Synthetic preview source anchor",
  },
];

const previewPermittedNextActions: ReadOnlyAppMcpPermittedNextAction[] = [
  {
    action: "request_human_review",
    label: "Human evidence review only",
    summary:
      "A human may compare the cited synthetic preview posture outside this page.",
  },
];

const previewForbiddenActions: ReadOnlyAppMcpForbiddenAction[] = [
  {
    action: "external_release",
    reason: "External release remains future-plan-only.",
  },
  {
    action: "finance_write",
    reason: "Finance writes are unavailable in this read-only preview.",
  },
  {
    action: "provider_call",
    reason: "Provider activity remains outside this local route foundation.",
  },
];

const previewPrivacyBoundary = {
  items: [
    "Synthetic contract-shaped examples only.",
    "No real finance data or private company artifacts.",
    "No private secrets or provider access material.",
  ],
  summary:
    "The route renders local proof props only; it is not source truth.",
  title: "Privacy boundary",
};

const previewNoRuntimeBoundary = {
  items: [
    "No data fetch, API call, or mutation transport.",
    "No form, button, file-input control, or server action.",
    "No web API route, backend route, endpoint, or remote MCP server.",
    "No Apps SDK resource, OAuth flow, listing artifact, OpenAI API call, or model call.",
  ],
  summary:
    "The preview route renders existing local components with in-memory props only.",
  title: "No-runtime boundary",
};

const stalePreviewFreshness: ReadOnlyAppMcpFreshness = {
  checkedAt: "2026-05-09T23:32:41.000Z",
  failClosedIfStale: true,
  state: "stale",
  summary:
    "Synthetic stale posture; a supported answer would fail closed until evidence freshness is restored.",
};

const unsupportedPreviewFreshness: ReadOnlyAppMcpFreshness = {
  checkedAt: "2026-05-09T23:32:41.000Z",
  failClosedIfStale: true,
  state: "unsupported",
  summary:
    "Synthetic unsupported posture; no generated answer is rendered from unsupported evidence.",
};

const missingPreviewFreshness: ReadOnlyAppMcpFreshness = {
  checkedAt: "2026-05-09T23:32:41.000Z",
  failClosedIfStale: true,
  state: "missing",
  summary:
    "Synthetic missing posture; source anchors and bounded citations are required before an answer is supported.",
};

const stateMatrixRefusals: ReadOnlyAppMcpRefusal[] = [
  {
    freshness: missingPreviewFreshness,
    reason: "missing_citation",
    summary:
      "The route fails closed when an answer cannot point to a bounded citation and source anchor.",
    title: "Missing citation refusal",
  },
  {
    freshness: unsupportedPreviewFreshness,
    reason: "unsupported_evidence",
    summary:
      "Unsupported evidence stays visible as a limitation rather than becoming an answer.",
    title: "Unsupported evidence refusal",
  },
  {
    freshness: stalePreviewFreshness,
    reason: "stale_evidence",
    summary:
      "Stale evidence blocks an answer until a future host re-establishes freshness.",
    title: "Stale evidence refusal",
  },
  {
    freshness: previewFreshness,
    reason: "conflicting_evidence",
    summary:
      "Conflicting evidence fails closed until source posture is resolved by a human.",
    title: "Conflicting evidence refusal",
  },
  {
    freshness: previewFreshness,
    reason: "prompt_injection",
    summary:
      "Instructions found in source text stay inert and cannot widen tool or action scope.",
    title: "Prompt-injection warning state",
  },
  {
    freshness: previewFreshness,
    reason: "raw_full_file_dump_request",
    summary:
      "Full source-body export requests are refused; the route shows bounded citation posture only.",
    title: "Source export refusal state",
  },
  {
    freshness: previewFreshness,
    reason: "unsafe_action",
    summary:
      "Mutation, external release, provider, filing, payment, and customer-contact requests are refused.",
    title: "Unsafe action refusal state",
  },
];

export default function ReadOnlyAppMcpPreviewPage() {
  return (
    <AppShell
      subtitle="Local proof-only route preview for the shipped read-only app/MCP UI composition and state matrix."
      title="Pocket CFO read-only app/MCP preview"
    >
      <ReadOnlyAppMcpExperienceFrame
        citations={previewCitations}
        evidenceCards={previewEvidenceCards}
        forbiddenActions={previewForbiddenActions}
        freshness={previewFreshness}
        limitations={previewLimitations}
        noRuntimeBoundary={previewNoRuntimeBoundary}
        permittedNextActions={previewPermittedNextActions}
        privacyBoundary={previewPrivacyBoundary}
        scopeId="local-preview-answer-state"
        sourceAnchors={previewSourceAnchors}
        status={{
          answer: {
            evidenceCount: previewEvidenceCards.length,
            freshness: previewFreshness,
            statusLabel: "Evidence-backed preview",
            summary:
              "Synthetic evidence, citations, freshness, limitations, and boundaries are visible before any later app work.",
            title: "Answer state: read-only evidence hierarchy",
          },
          kind: "answer",
        }}
        summary="One local page renders the shipped FP-0091 and FP-0092 component composition without transport or mutation behavior."
        title="Answer state matrix foundation"
      />
      <section
        aria-labelledby="local-preview-state-matrix-title"
        data-layout="read-only-app-mcp-state-matrix"
        data-spacing="10"
        data-visual-qa="screenshotless"
        data-responsive="narrow-wide"
        aria-label="Read-only preview state matrix groups"
        style={stackStyle}
      >
        <SectionHeading
          eyebrow="Local state matrix"
          headingLevel={2}
          id="local-preview-state-matrix-title"
          summary="Synthetic local-only states prove refusal, empty, loading, error, privacy, and no-runtime posture without fetching data or creating actions."
          title="Preview route state matrix"
        />
        <div
          aria-label="Refusal and transient state matrix group"
          data-panel-hierarchy="state-card-grid"
          data-spacing="14"
          style={twoColumnGridStyle}
        >
          {stateMatrixRefusals.map((refusal) => (
            <RefusalPanel
              headingLevel={3}
              key={refusal.reason}
              refusal={refusal}
              sectionIdScope={`local-preview-${refusal.reason}`}
            />
          ))}
          <EmptyEvidenceState
            headingLevel={3}
            sectionIdScope="local-preview-empty-evidence"
            summary="No synthetic evidence cards, citations, or source anchors are available for this matrix state."
          />
          <LoadingEvidenceState
            headingLevel={3}
            sectionIdScope="local-preview-loading-evidence"
            summary="A future host may render loading posture, but this route starts no request."
          />
          <ErrorAndUnsupportedState
            headingLevel={3}
            sectionIdScope="local-preview-error-unsupported"
            summary="Unsupported, malformed, or conflicting evidence fails closed with text-labelled reasons."
          />
        </div>
        <section
          aria-labelledby="local-preview-conflicting-evidence-note-title"
          style={{
            background: colors.warningSoft,
            border: `1px solid ${colors.warning}`,
            borderRadius: 8,
            padding: 14,
          }}
        >
          <SectionHeading
            eyebrow="Conflict support boundary"
            headingLevel={3}
            id="local-preview-conflicting-evidence-note-title"
            summary="V2G proof posture records conflicting evidence as fail-closed, and this local component contract now renders it as a text-labelled refusal state."
            title="Conflicting evidence refusal boundary"
          />
          <p style={bodyStyle}>
            FP-0097 keeps conflicting evidence read-only and local. It displays
            a refusal reason label without creating a new tool, endpoint, or
            runtime action.
          </p>
        </section>
        <div
          aria-label="Privacy and no-runtime state matrix boundary group"
          data-layout="read-only-app-mcp-state-boundary-grid"
          data-responsive="narrow-wide"
          data-spacing="14"
          style={twoColumnGridStyle}
        >
          <PrivacyBoundaryPanel
            boundary={previewPrivacyBoundary}
            headingLevel={3}
            sectionIdScope="local-preview-state-privacy"
          />
          <NoRuntimeBoundaryPanel
            boundary={previewNoRuntimeBoundary}
            headingLevel={3}
            sectionIdScope="local-preview-state-no-runtime"
          />
        </div>
      </section>
    </AppShell>
  );
}
