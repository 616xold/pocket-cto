import React from "react";
import { bodyStyle, colors, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpForbiddenAction } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type ForbiddenActionsPanelProps = {
  actions: ReadOnlyAppMcpForbiddenAction[];
};

export function ForbiddenActionsPanel({ actions }: ForbiddenActionsPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-forbidden-actions-title">
      <SectionHeading
        eyebrow="Forbidden actions"
        id="read-only-forbidden-actions-title"
        summary="Forbidden capabilities are text-only blocked posture, never controls."
        title="Forbidden action posture"
      />
      <ReadOnlyList
        emptyLabel="No forbidden actions were recorded."
        items={actions}
        renderItem={(action) => (
          <div style={{ ...compactPanelStyle, borderColor: colors.danger }}>
            <p style={strongBodyStyle}>
              Blocked capability: <code>{action.action}</code>
            </p>
            <p style={bodyStyle}>{action.reason}</p>
          </div>
        )}
      />
    </ReadOnlyPanel>
  );
}
