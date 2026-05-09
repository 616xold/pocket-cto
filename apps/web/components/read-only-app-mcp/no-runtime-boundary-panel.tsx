import React from "react";
import { bodyStyle, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpBoundary } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type NoRuntimeBoundaryPanelProps = {
  boundary: ReadOnlyAppMcpBoundary;
};

export function NoRuntimeBoundaryPanel({
  boundary,
}: NoRuntimeBoundaryPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-no-runtime-boundary-title">
      <SectionHeading
        eyebrow="No-runtime boundary"
        id="read-only-no-runtime-boundary-title"
        summary={boundary.summary}
        title={boundary.title}
      />
      <ReadOnlyList
        emptyLabel="No no-runtime boundary items were recorded."
        items={boundary.items}
        renderItem={(item) => (
          <div style={compactPanelStyle}>
            <p style={strongBodyStyle}>{item}</p>
            <p style={bodyStyle}>No route, endpoint, tool call, or deployment is implied.</p>
          </div>
        )}
      />
    </ReadOnlyPanel>
  );
}
