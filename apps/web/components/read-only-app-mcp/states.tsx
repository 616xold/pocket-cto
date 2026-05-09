import React from "react";
import { RefusalPanel } from "./refusal-panel";
import { bodyStyle, colors, compactPanelStyle, stackStyle } from "./styles";
import type {
  ReadOnlyAppMcpFreshness,
  ReadOnlyAppMcpRefusal,
} from "./types";
import { ReadOnlyPanel, SectionHeading } from "./ui";

type SharedStateProps = {
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

export function PromptInjectionWarningState({ summary }: SharedStateProps) {
  const refusal = buildRefusalState(
    "prompt_injection",
    "Prompt-injection warning",
    summary ??
      "Source instructions are treated as untrusted evidence text and are not followed.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function MissingCitationRefusalState({ summary }: SharedStateProps) {
  const refusal = buildRefusalState(
    "missing_citation",
    "Missing citation refusal",
    summary ??
      "The UI fails closed when an answer cannot point to a bounded citation and source anchor.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function UnsupportedEvidenceRefusalState({
  summary,
}: SharedStateProps) {
  const refusal = buildRefusalState(
    "unsupported_evidence",
    "Unsupported evidence refusal",
    summary ??
      "Unsupported evidence cannot be rendered as a supported answer; review must resolve it first.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function StaleEvidenceRefusalState({ summary }: SharedStateProps) {
  const refusal = buildRefusalState(
    "stale_evidence",
    "Stale evidence refusal",
    summary ??
      "Stale evidence remains a limitation until freshness is re-established by a future host.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function UnsafeActionRefusalState({ summary }: SharedStateProps) {
  const refusal = buildRefusalState(
    "unsafe_action",
    "Unsafe action refusal",
    summary ??
      "Requests to send, approve, mutate, connect, submit, or otherwise act are refused.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function RawFullFileDumpRefusalState({ summary }: SharedStateProps) {
  const refusal = buildRefusalState(
    "raw_full_file_dump_request",
    "Raw full-file dump refused",
    summary ??
      "Requests for raw full-file or page dumps fail closed. The UI only displays bounded citation posture.",
  );

  return <RefusalPanel refusal={refusal} />;
}

export function EmptyEvidenceState({ summary }: SharedStateProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-empty-evidence-title">
      <SectionHeading
        eyebrow="Empty state"
        id="read-only-empty-evidence-title"
        summary={
          summary ??
          "No evidence cards, citations, or source anchors are available for this local proof state."
        }
        title="Empty evidence state"
      />
      <p style={bodyStyle}>
        The component stays quiet and does not invent evidence, sources, or
        finance conclusions.
      </p>
    </ReadOnlyPanel>
  );
}

export function LoadingEvidenceState({ summary }: SharedStateProps) {
  return (
    <section
      aria-busy="true"
      aria-labelledby="read-only-loading-evidence-title"
      style={compactPanelStyle}
    >
      <div style={stackStyle}>
        <SectionHeading
          eyebrow="Loading state"
          id="read-only-loading-evidence-title"
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

export function ErrorAndUnsupportedState({ summary }: SharedStateProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-error-unsupported-title">
      <SectionHeading
        eyebrow="Error and unsupported state"
        id="read-only-error-unsupported-title"
        summary={
          summary ??
          "The response cannot be displayed as supported evidence. The UI fails closed."
        }
        title="Error and unsupported evidence"
      />
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
