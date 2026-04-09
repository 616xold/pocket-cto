import React from "react";
import type {
  SourceFileSummary,
  SourceIngestRunSummary,
} from "@pocket-cto/domain";
import { formatBytes, formatSourceDate, shortenChecksum } from "../lib/source-formatters";
import { SourceStatusPill } from "./source-status-pill";
import { submitSourceFileIngest } from "../app/sources/actions";

type SourceFileListProps = {
  emptyMessage?: string;
  runsByFileId: Map<string, SourceIngestRunSummary[]>;
  sourceId: string;
  files: SourceFileSummary[];
};

export function SourceFileList({
  emptyMessage = "No raw files have been uploaded for this source yet.",
  runsByFileId,
  sourceId,
  files,
}: SourceFileListProps) {
  if (files.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="source-file-list">
      {files.map((file) => {
        const runs = runsByFileId.get(file.id) ?? [];
        const latestRun = runs[0] ?? null;

        return (
          <article key={file.id} className="source-file-card" id={`file-${file.id}`}>
            <div className="source-summary-header">
              <div>
                <h3 className="card-title">{file.originalFileName}</h3>
                <p className="muted" style={{ marginBottom: 0, marginTop: 6 }}>
                  Snapshot v{file.snapshotVersion} · {file.mediaType}
                </p>
              </div>
              {latestRun ? (
                <SourceStatusPill
                  labelPrefix="Latest ingest"
                  status={latestRun.status}
                />
              ) : (
                <SourceStatusPill labelPrefix="Ingest" status="registered" />
              )}
            </div>

            <div className="source-meta-grid">
              <div>
                <dt>Captured</dt>
                <dd>{formatSourceDate(file.capturedAt)}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{formatBytes(file.sizeBytes)}</dd>
              </div>
              <div>
                <dt>Storage</dt>
                <dd>{file.storageKind}</dd>
              </div>
              <div>
                <dt>Checksum</dt>
                <dd>
                  <code>{shortenChecksum(file.checksumSha256)}</code>
                </dd>
              </div>
            </div>

            <p className="muted" style={{ marginTop: 14 }}>
              <code>{file.storageRef}</code>
            </p>

            {latestRun ? (
              <p className="source-note">
                Parser {latestRun.parserSelection.parserKey} matched by{" "}
                {latestRun.parserSelection.matchedBy}. Warnings:{" "}
                {latestRun.warningCount}. Errors: {latestRun.errorCount}.
              </p>
            ) : (
              <p className="source-note">
                No ingest runs yet. Upload is durable, but Finance Twin and Wiki
                writes remain out of scope for this F1 slice.
              </p>
            )}

            <form action={submitSourceFileIngest} className="inline-action-form">
              <input type="hidden" name="sourceFileId" value={file.id} />
              <input type="hidden" name="sourceId" value={sourceId} />
              <button className="action-button" type="submit">
                Trigger ingest
              </button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
