import React from "react";
import type { SourceSummary } from "@pocket-cto/domain";
import { SourceSummaryCard } from "./source-summary-card";

type SourceListProps = {
  emptyHeading?: string;
  emptyMessage?: string;
  sources: SourceSummary[];
};

export function SourceList({
  emptyHeading = "No sources registered yet",
  emptyMessage = "Register a source reference to start the operator inventory.",
  sources,
}: SourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="mission-list-empty">
        <h3>{emptyHeading}</h3>
        <p className="muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="source-list">
      {sources.map((source) => (
        <SourceSummaryCard key={source.id} source={source} />
      ))}
    </div>
  );
}
