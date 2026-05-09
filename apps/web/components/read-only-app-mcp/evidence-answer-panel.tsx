import React from "react";
import { FreshnessBadge } from "./freshness-badge";
import {
  bodyStyle,
  colors,
  strongBodyStyle,
  twoColumnGridStyle,
} from "./styles";
import type { ReadOnlyAppMcpAnswer } from "./types";
import { ReadOnlyPanel, SectionHeading } from "./ui";

type EvidenceAnswerPanelProps = {
  answer: ReadOnlyAppMcpAnswer;
};

export function EvidenceAnswerPanel({ answer }: EvidenceAnswerPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-answer-title">
      <div
        style={{
          alignItems: "start",
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <SectionHeading
          eyebrow="Answer status"
          id="read-only-answer-title"
          summary={answer.summary}
          title={answer.title}
        />
        <FreshnessBadge freshness={answer.freshness} />
      </div>
      <dl style={twoColumnGridStyle}>
        <div>
          <dt style={bodyStyle}>Status</dt>
          <dd style={strongBodyStyle}>{answer.statusLabel}</dd>
        </div>
        <div>
          <dt style={bodyStyle}>Evidence cards</dt>
          <dd style={strongBodyStyle}>{answer.evidenceCount}</dd>
        </div>
      </dl>
      <p style={{ ...bodyStyle, borderTop: `1px solid ${colors.line}`, paddingTop: 12 }}>
        This panel displays stored evidence posture only. It does not create a
        finance conclusion or trigger a tool call.
      </p>
    </ReadOnlyPanel>
  );
}
