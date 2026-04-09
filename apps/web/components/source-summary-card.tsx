import React from "react";
import type { SourceSummary } from "@pocket-cto/domain";
import Link from "next/link";
import type { Route } from "next";
import {
  formatBytes,
  formatSourceDate,
  shortenChecksum,
} from "../lib/source-formatters";
import { SourceStatusPill } from "./source-status-pill";

type SourceSummaryCardProps = {
  source: SourceSummary;
};

export function SourceSummaryCard({ source }: SourceSummaryCardProps) {
  const latestSnapshot = source.latestSnapshot;

  return (
    <article className="source-summary-card">
      <div className="source-summary-header">
        <div>
          <p className="kicker">Source inventory</p>
          <h3 className="card-title">{source.name}</h3>
        </div>
        <Link href={`/sources/${source.id}` as Route} className="button outline">
          Open detail
        </Link>
      </div>

      {source.description ? (
        <p className="source-summary-copy">{source.description}</p>
      ) : (
        <p className="muted">
          No operator description recorded for this source yet.
        </p>
      )}

      <div className="source-meta-grid">
        <div>
          <dt>Kind</dt>
          <dd>{source.kind}</dd>
        </div>
        <div>
          <dt>Origin</dt>
          <dd>{source.originKind}</dd>
        </div>
        <div>
          <dt>Snapshots</dt>
          <dd>{source.snapshotCount}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatSourceDate(source.updatedAt)}</dd>
        </div>
      </div>

      {latestSnapshot ? (
        <div className="source-latest-snapshot">
          <div className="button-row" style={{ marginBottom: 12 }}>
            <SourceStatusPill
              labelPrefix={`Snapshot v${latestSnapshot.version}`}
              status={latestSnapshot.ingestStatus}
            />
          </div>

          <div className="source-meta-grid">
            <div>
              <dt>Latest file</dt>
              <dd>{latestSnapshot.originalFileName}</dd>
            </div>
            <div>
              <dt>Media type</dt>
              <dd>{latestSnapshot.mediaType}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{formatBytes(latestSnapshot.sizeBytes)}</dd>
            </div>
            <div>
              <dt>Captured</dt>
              <dd>{formatSourceDate(latestSnapshot.capturedAt)}</dd>
            </div>
            <div>
              <dt>Checksum</dt>
              <dd>
                <code>{shortenChecksum(latestSnapshot.checksumSha256)}</code>
              </dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>{latestSnapshot.storageKind}</dd>
            </div>
          </div>

          {latestSnapshot.ingestErrorSummary ? (
            <p className="source-note warn">
              Latest ingest limitation: {latestSnapshot.ingestErrorSummary}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="source-note">
          No snapshot summary exists yet. Register or upload a source file to
          begin the ingest trail.
        </p>
      )}
    </article>
  );
}
