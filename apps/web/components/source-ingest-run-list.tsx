import React from "react";
import type { SourceIngestRunSummary } from "@pocket-cto/domain";
import {
  formatSourceDate,
  shortenChecksum,
  summarizeReceipt,
} from "../lib/source-formatters";
import { SourceStatusPill } from "./source-status-pill";

export type SourceIngestRunWithFile = {
  fileName: string;
  run: SourceIngestRunSummary;
};

type SourceIngestRunListProps = {
  emptyMessage?: string;
  runs: SourceIngestRunWithFile[];
};

export function SourceIngestRunList({
  emptyMessage = "No ingest runs have been recorded for this source yet.",
  runs,
}: SourceIngestRunListProps) {
  if (runs.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="source-run-list">
      {runs.map(({ fileName, run }) => (
        <article
          key={run.id}
          className="source-run-card"
          id={`ingest-run-${run.id}`}
        >
          <div className="source-summary-header">
            <div>
              <h3 className="card-title">{fileName}</h3>
              <p className="muted" style={{ marginBottom: 0, marginTop: 6 }}>
                {run.parserSelection.parserKey} via{" "}
                {run.parserSelection.matchedBy}
              </p>
            </div>
            <SourceStatusPill labelPrefix="Run" status={run.status} />
          </div>

          <div className="source-meta-grid">
            <div>
              <dt>Started</dt>
              <dd>{formatSourceDate(run.startedAt)}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>
                {run.completedAt ? formatSourceDate(run.completedAt) : "Not finished"}
              </dd>
            </div>
            <div>
              <dt>Warnings</dt>
              <dd>{run.warningCount}</dd>
            </div>
            <div>
              <dt>Errors</dt>
              <dd>{run.errorCount}</dd>
            </div>
            <div>
              <dt>Checksum</dt>
              <dd>
                <code>{shortenChecksum(run.inputChecksumSha256)}</code>
              </dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>{run.storageKind}</dd>
            </div>
          </div>

          <p className="source-note">{summarizeReceipt(run.receiptSummary)}</p>

          {run.errors.length > 0 ? (
            <ul className="list-clean" style={{ marginTop: 12 }}>
              {run.errors.map((error) => (
                <li key={`${run.id}-${error.code}-${error.message}`}>
                  {error.code}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}
