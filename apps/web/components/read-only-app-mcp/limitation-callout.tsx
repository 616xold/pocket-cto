import React from "react";
import { bodyStyle, colors, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpLimitation } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type LimitationCalloutProps = {
  limitations: ReadOnlyAppMcpLimitation[];
};

export function LimitationCallout({ limitations }: LimitationCalloutProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-limitations-title">
      <SectionHeading
        eyebrow="Limitations"
        id="read-only-limitations-title"
        summary="Limitations are displayed with text labels and severity, not by color alone."
        title="Limitation callout"
      />
      <ReadOnlyList
        emptyLabel="No limitations are available for this envelope."
        items={limitations}
        renderItem={(limitation) => (
          <div style={{ ...compactPanelStyle, borderColor: colors.warning }}>
            <p style={strongBodyStyle}>
              {limitation.severity}: {limitation.code}
            </p>
            <p style={bodyStyle}>{limitation.summary}</p>
          </div>
        )}
      />
    </ReadOnlyPanel>
  );
}
