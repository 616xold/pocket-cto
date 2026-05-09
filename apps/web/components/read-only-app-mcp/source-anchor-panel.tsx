import React from "react";
import { bodyStyle, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpSourceAnchor } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type SourceAnchorPanelProps = {
  sourceAnchors: ReadOnlyAppMcpSourceAnchor[];
};

export function SourceAnchorPanel({ sourceAnchors }: SourceAnchorPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-source-anchors-title">
      <SectionHeading
        eyebrow="Source anchors"
        id="read-only-source-anchors-title"
        summary="Anchors identify where evidence can be reviewed without displaying raw full files."
        title="Source anchor panel"
      />
      <ReadOnlyList
        emptyLabel="No source anchors are available for this state."
        items={sourceAnchors}
        renderItem={(anchor) => (
          <article
            aria-labelledby={`${anchor.sourceAnchorId}-title`}
            style={compactPanelStyle}
          >
            <h3 id={`${anchor.sourceAnchorId}-title`} style={strongBodyStyle}>
              {anchor.title}
            </h3>
            <p style={bodyStyle}>{anchor.summary}</p>
            <p style={bodyStyle}>
              Source <code>{anchor.sourceId}</code>, anchor{" "}
              <code>{anchor.sourceAnchorId}</code>, {anchor.locator}
            </p>
            {anchor.checksumSha256 ? (
              <p style={bodyStyle}>
                Checksum: <code>{anchor.checksumSha256}</code>
              </p>
            ) : null}
          </article>
        )}
      />
    </ReadOnlyPanel>
  );
}
