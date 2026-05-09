import React from "react";
import { bodyStyle, compactPanelStyle, strongBodyStyle } from "./styles";
import type { ReadOnlyAppMcpPermittedNextAction } from "./types";
import { ReadOnlyList, ReadOnlyPanel, SectionHeading } from "./ui";

type PermittedNextActionsPanelProps = {
  actions: ReadOnlyAppMcpPermittedNextAction[];
};

export function PermittedNextActionsPanel({
  actions,
}: PermittedNextActionsPanelProps) {
  return (
    <ReadOnlyPanel labelledBy="read-only-permitted-actions-title">
      <SectionHeading
        eyebrow="Permitted next actions"
        id="read-only-permitted-actions-title"
        summary="These are static review steps. They do not submit, send, approve, or mutate anything."
        title="Permitted next review steps"
      />
      <ReadOnlyList
        emptyLabel="No permitted next review steps are available."
        items={actions}
        renderItem={(action) => (
          <div style={compactPanelStyle}>
            <p style={strongBodyStyle}>{action.label}</p>
            <p style={bodyStyle}>{action.summary}</p>
            <p style={bodyStyle}>
              Static action label: <code>{action.action}</code>
            </p>
          </div>
        )}
      />
    </ReadOnlyPanel>
  );
}
