import React from "react";
import { FreshnessBadge } from "./freshness-badge";
import { bodyStyle, colors, stackStyle } from "./styles";
import type { ReadOnlyAppMcpRefusal } from "./types";
import { ReadOnlyPanel, SectionHeading } from "./ui";

type RefusalPanelProps = {
  refusal: ReadOnlyAppMcpRefusal;
};

export function RefusalPanel({ refusal }: RefusalPanelProps) {
  const headingId = `read-only-refusal-${slugify(
    `${refusal.title}-${refusal.reason}`,
  )}`;

  return (
    <ReadOnlyPanel labelledBy={headingId}>
      <div
        style={{
          alignItems: "start",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <SectionHeading
          eyebrow="Refusal status"
          id={headingId}
          summary={refusal.summary}
          title={refusal.title}
        />
        <FreshnessBadge freshness={refusal.freshness} />
      </div>
      <div
        style={{
          ...stackStyle,
          background: colors.dangerSoft,
          border: `1px solid ${colors.danger}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        <p style={{ ...bodyStyle, color: colors.danger, fontWeight: 700 }}>
          Refusal reason: {readReasonLabel(refusal.reason)}
        </p>
        <p style={bodyStyle}>
          No action was taken, no write tool was planned, and source text
          instructions remain untrusted data.
        </p>
      </div>
    </ReadOnlyPanel>
  );
}

function readReasonLabel(reason: ReadOnlyAppMcpRefusal["reason"]) {
  if (reason === "raw_full_file_dump_request") {
    return "raw full-file dump request";
  }
  if (reason === "prompt_injection") {
    return "prompt injection";
  }
  return reason.replaceAll("_", " ");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}
