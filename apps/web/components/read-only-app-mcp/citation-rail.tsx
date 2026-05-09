import React from "react";
import { bodyStyle, colors, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpCitation } from "./types";
import { ReadOnlyList, SectionHeading } from "./ui";

type CitationRailProps = {
  citations: ReadOnlyAppMcpCitation[];
};

export function CitationRail({ citations }: CitationRailProps) {
  return (
    <aside aria-labelledby="read-only-citations-title" style={compactPanelStyle}>
      <SectionHeading
        eyebrow="Citations"
        id="read-only-citations-title"
        summary="Every positive evidence display keeps a citation and bounded excerpt posture visible."
        title="Citation rail"
      />
      <ReadOnlyList
        emptyLabel="No citations are available for this state."
        items={citations}
        renderItem={(citation) => (
          <div style={{ borderLeft: `3px solid ${colors.proof}`, paddingLeft: 10 }}>
            <p style={strongBodyStyle}>{citation.summary}</p>
            <p style={bodyStyle}>
              Citation <code>{citation.citationId}</code>, anchor{" "}
              <code>{citation.sourceAnchorId}</code>, {citation.locator}
            </p>
            <p style={bodyStyle}>
              Bounded excerpt only: {citation.boundedExcerptOnly ? "yes" : "no"}
            </p>
          </div>
        )}
      />
    </aside>
  );
}
