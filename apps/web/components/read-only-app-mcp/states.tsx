import React from "react";
import {
  createReadOnlyAppMcpSectionId,
  type ReadOnlyAppMcpHeadingLevel,
} from "./ids";
import { RefusalPanel } from "./refusal-panel";
import { bodyStyle, colors, compactPanelStyle, stackStyle } from "./styles";
import type {
  ReadOnlyAppMcpFreshness,
  ReadOnlyAppMcpRefusal,
} from "./types";
import { ReadOnlyPanel, SectionHeading } from "./ui";

type SharedStateProps = {
  headingLevel?: ReadOnlyAppMcpHeadingLevel;
  sectionIdScope?: string;
  summary?: string;
};

const freshProof: ReadOnlyAppMcpFreshness = {
  checkedAt: "2026-05-09T00:00:00.000Z",
  failClosedIfStale: true,
  state: "fresh",
  summary: "Local proof state uses no runtime call.",
};

function buildRefusalState(
  reason: ReadOnlyAppMcpRefusal["reason"],
  title: string,
  summary: string,
): ReadOnlyAppMcpRefusal {
  return {
    freshness: freshProof,
    reason,
    summary,
    title,
  };
}

export function PromptInjectionWarningState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "prompt_injection",
    "Prompt-injection warning",
    summary ??
      "Source instructions are treated as untrusted evidence text and are not followed.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function MissingCitationRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "missing_citation",
    "Missing citation refusal",
    summary ??
      "The UI fails closed when an answer cannot point to a bounded citation and source anchor.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function UnsupportedEvidenceRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "unsupported_evidence",
    "Unsupported evidence refusal",
    summary ??
      "Unsupported evidence cannot be rendered as a supported answer; review must resolve it first.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function StaleEvidenceRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "stale_evidence",
    "Stale evidence refusal",
    summary ??
      "Stale evidence remains a limitation until freshness is re-established by a future host.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function ConflictingEvidenceRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "conflicting_evidence",
    "Conflicting evidence refusal",
    summary ??
      "Conflicting evidence fails closed until a human resolves the source posture.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function UnsafeActionRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "unsafe_action",
    "Unsafe action refusal",
    summary ??
      "External release, mutation, provider setup, filing, or other action requests are refused.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function RawFullFileDumpRefusalState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "raw_full_file_dump_request",
    "Source export request refused",
    summary ??
      "Requests for full source-body exports fail closed. The UI only displays bounded citation posture.",
  );

  return (
    <RefusalPanel
      headingLevel={headingLevel}
      refusal={refusal}
      sectionIdScope={sectionIdScope}
    />
  );
}

export function EmptyEvidenceState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const titleId = createReadOnlyAppMcpSectionId({
    scope: sectionIdScope,
    section: "empty-evidence",
  });

  return (
    <ReadOnlyPanel labelledBy={titleId}>
      <SectionHeading
        eyebrow="Empty state"
        headingLevel={headingLevel}
        id={titleId}
        summary={
          summary ??
          "No evidence cards, citations, or source anchors are available for this local proof state."
        }
        title="Empty evidence state"
      />
      <p
        data-state-kind="empty"
        data-status-label="Empty evidence state"
        style={bodyStyle}
      >
        The component stays quiet and does not invent evidence, sources, or
        finance conclusions.
      </p>
    </ReadOnlyPanel>
  );
}

export function LoadingEvidenceState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const titleId = createReadOnlyAppMcpSectionId({
    scope: sectionIdScope,
    section: "loading-evidence",
  });

  return (
    <section
      aria-busy="true"
      aria-labelledby={titleId}
      data-panel-tier="panel"
      data-spacing="10"
      data-state-kind="loading"
      data-status-label="Loading evidence state"
      style={compactPanelStyle}
    >
      <div style={stackStyle}>
        <SectionHeading
          eyebrow="Loading state"
          headingLevel={headingLevel}
          id={titleId}
          summary={
            summary ??
            "A future host can show this while waiting for local evidence posture."
          }
          title="Loading evidence state"
        />
        <div
          aria-hidden="true"
          style={{
            background: colors.soft,
            border: `1px solid ${colors.line}`,
            borderRadius: 8,
            height: 12,
            maxWidth: 360,
          }}
        />
        <p style={bodyStyle}>No fetch or model call is started by this component.</p>
      </div>
    </section>
  );
}

export function ErrorAndUnsupportedState({
  headingLevel,
  sectionIdScope,
  summary,
}: SharedStateProps) {
  const titleId = createReadOnlyAppMcpSectionId({
    scope: sectionIdScope,
    section: "error-unsupported",
  });

  return (
    <ReadOnlyPanel labelledBy={titleId}>
      <SectionHeading
        eyebrow="Error and unsupported state"
        headingLevel={headingLevel}
        id={titleId}
        summary={
          summary ??
          "The response cannot be displayed as supported evidence. The UI fails closed."
        }
        title="Error and unsupported evidence"
      />
      <p
        data-state-kind="error"
        data-status-label="unsupported or conflicting evidence"
        style={{ ...bodyStyle, color: colors.danger, fontWeight: 700 }}
      >
        Error reason: unsupported or conflicting evidence.
      </p>
      <p
        style={{
          ...bodyStyle,
          background: colors.warningSoft,
          border: `1px solid ${colors.warning}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        Unsupported, missing, stale, or malformed evidence remains a review
        limitation, not a generated answer.
      </p>
    </ReadOnlyPanel>
  );
}
