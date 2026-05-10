import React from "react";
import { FreshnessBadge } from "./freshness-badge";
import {
  createReadOnlyAppMcpSectionId,
  type ReadOnlyAppMcpHeadingLevel,
} from "./ids";
import { bodyStyle, colors, stackStyle } from "./styles";
import type { ReadOnlyAppMcpRefusal } from "./types";
import { ReadOnlyPanel, SectionHeading } from "./ui";

type RefusalPanelProps = {
  headingLevel?: ReadOnlyAppMcpHeadingLevel;
  refusal: ReadOnlyAppMcpRefusal;
  sectionIdScope?: string;
};

export function RefusalPanel({
  headingLevel,
  refusal,
  sectionIdScope,
}: RefusalPanelProps) {
  const headingId = createReadOnlyAppMcpSectionId({
    scope: sectionIdScope,
    section: "refusal",
    suffix: `${refusal.title}-${refusal.reason}`,
  });

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
          headingLevel={headingLevel}
          id={headingId}
          summary={refusal.summary}
          title={refusal.title}
        />
        <FreshnessBadge freshness={refusal.freshness} />
      </div>
      <div
        data-state-kind="refusal"
        data-status-label={readReasonLabel(refusal.reason)}
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
    return "source body export request";
  }
  if (reason === "prompt_injection") {
    return "prompt injection";
  }
  return reason.replaceAll("_", " ");
}
