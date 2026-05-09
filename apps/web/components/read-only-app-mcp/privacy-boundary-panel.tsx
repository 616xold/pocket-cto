import React from "react";
import { bodyStyle, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpBoundary } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type PrivacyBoundaryPanelProps = {
  boundary: ReadOnlyAppMcpBoundary;
};

export function PrivacyBoundaryPanel({ boundary }: PrivacyBoundaryPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-privacy-boundary-title">
      <SectionHeading
        eyebrow="Privacy boundary"
        id="read-only-privacy-boundary-title"
        summary={boundary.summary}
        title={boundary.title}
      />
      <ReadOnlyList
        emptyLabel="No privacy boundary items were recorded."
        items={boundary.items}
        renderItem={(item) => (
          <div style={compactPanelStyle}>
            <p style={strongBodyStyle}>{item}</p>
            <p style={bodyStyle}>Displayed as local proof posture only.</p>
          </div>
        )}
      />
    </ReadOnlyPanel>
  );
}
