import React from "react";
import Link from "next/link";
import type { Route } from "next";
import type { SourceFileSummary, SourceIngestRunSummary } from "@pocket-cto/domain";
import { SourceFileList } from "../../../components/source-file-list";
import {
  SourceIngestRunList,
  type SourceIngestRunWithFile,
} from "../../../components/source-ingest-run-list";
import { SourceFileUploadForm } from "../../../components/source-file-upload-form";
import { SourceStatusPill } from "../../../components/source-status-pill";
import {
  formatBytes,
  formatSourceDate,
  shortenChecksum,
} from "../../../lib/source-formatters";
import {
  getSourceDetail,
  getSourceFileList,
  getSourceIngestRunList,
} from "../../../lib/api";

type SourceDetailPageProps = {
  params: Promise<{ sourceId: string }>;
};

export default async function SourceDetailPage({
  params,
}: SourceDetailPageProps) {
  const { sourceId } = await params;
  const source = await getSourceDetail(sourceId);

  if (!source) {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">Source detail</p>
          <h1>Source detail could not be loaded.</h1>
          <p className="lede">
            The source may be missing, or the control plane may be unavailable.
            F1D keeps that limitation visible instead of rendering a fake empty
            state.
          </p>
          <div className="button-row">
            <Link href={"/sources" as Route} className="button outline">
              Back to source inventory
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const latestSnapshot = source.snapshots[0] ?? null;
  const fileList = await getSourceFileList(sourceId);
  const runResponses = fileList
    ? await Promise.all(
        fileList.files.map(async (file) => ({
          file,
          list: await getSourceIngestRunList(file.id),
        })),
      )
    : [];
  const runsByFileId = new Map<string, SourceIngestRunSummary[]>();
  let ingestRunLookupFailed = false;

  for (const response of runResponses) {
    if (!response.list) {
      ingestRunLookupFailed = true;
      continue;
    }

    runsByFileId.set(response.file.id, response.list.ingestRuns);
  }

  const sourceRuns = flattenSourceRuns(fileList?.files ?? [], runsByFileId);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Source detail</p>
        <h1>{source.source.name}</h1>
        <p className="lede">
          Review the registered source, inspect raw files and ingest receipts,
          and trigger the current deterministic ingest path from the web
          surface. This page stays honest about the F1 boundary: no Finance
          Twin, CFO Wiki, reports, or monitoring writes yet.
        </p>
        <div className="button-row">
          <Link href={"/sources" as Route} className="button outline">
            Back to source inventory
          </Link>
          <Link href="/" className="button outline">
            Operator home
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="kicker">Source record</p>
              <h2>Current summary</h2>
            </div>
            {latestSnapshot ? (
              <SourceStatusPill
                labelPrefix={`Snapshot v${latestSnapshot.version}`}
                status={latestSnapshot.ingestStatus}
              />
            ) : null}
          </div>

          {source.source.description ? (
            <p className="source-summary-copy">{source.source.description}</p>
          ) : (
            <p className="muted">
              No operator description has been recorded for this source.
            </p>
          )}

          <div className="source-meta-grid">
            <div>
              <dt>Kind</dt>
              <dd>{source.source.kind}</dd>
            </div>
            <div>
              <dt>Origin</dt>
              <dd>{source.source.originKind}</dd>
            </div>
            <div>
              <dt>Created by</dt>
              <dd>{source.source.createdBy}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatSourceDate(source.source.createdAt)}</dd>
            </div>
          </div>

          {latestSnapshot ? (
            <div className="stack" style={{ marginTop: 18 }}>
              <h3>Latest snapshot summary</h3>
              <div className="source-meta-grid">
                <div>
                  <dt>File</dt>
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
              No snapshot summary exists yet for this source.
            </p>
          )}
        </article>

        <article className="card">
          <h2>Upload next raw file</h2>
          <p className="muted">
            Uploading here stores immutable bytes through the existing F1B
            source-file path. Ingest remains a second explicit step so operators
            can review the raw-file ledger before parser dispatch runs.
          </p>
          <SourceFileUploadForm sourceId={sourceId} />
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Snapshot history</p>
            <h2>Registered versions</h2>
          </div>
          <p className="muted">{source.snapshots.length} total snapshots</p>
        </div>

        {source.snapshots.length > 0 ? (
          <div className="source-run-list">
            {source.snapshots.map((snapshot) => (
              <article key={snapshot.id} className="source-run-card">
                <div className="source-summary-header">
                  <div>
                    <h3 className="card-title">
                      v{snapshot.version} · {snapshot.originalFileName}
                    </h3>
                    <p className="muted" style={{ marginBottom: 0, marginTop: 6 }}>
                      {snapshot.mediaType}
                    </p>
                  </div>
                  <SourceStatusPill status={snapshot.ingestStatus} />
                </div>

                <div className="source-meta-grid">
                  <div>
                    <dt>Captured</dt>
                    <dd>{formatSourceDate(snapshot.capturedAt)}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{formatBytes(snapshot.sizeBytes)}</dd>
                  </div>
                  <div>
                    <dt>Storage</dt>
                    <dd>{snapshot.storageKind}</dd>
                  </div>
                  <div>
                    <dt>Checksum</dt>
                    <dd>
                      <code>{shortenChecksum(snapshot.checksumSha256)}</code>
                    </dd>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No snapshots recorded for this source yet.</p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Source files</p>
            <h2>Immutable raw-file ledger</h2>
          </div>
          <p className="muted">
            {fileList ? `${fileList.fileCount} stored files` : "File ledger unavailable"}
          </p>
        </div>

        {fileList ? (
          <SourceFileList
            files={fileList.files}
            runsByFileId={runsByFileId}
            sourceId={sourceId}
          />
        ) : (
          <p className="muted">
            Source files could not be loaded from the control plane.
          </p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Ingest runs</p>
            <h2>Deterministic receipt history</h2>
          </div>
          <p className="muted">
            Each ingest run is durable and reviewable. It does not write Finance
            Twin or CFO Wiki state in this slice.
          </p>
        </div>

        {ingestRunLookupFailed ? (
          <p className="source-note warn">
            One or more ingest-run histories could not be loaded. Stored files
            are still shown above so the operator can review raw evidence
            honestly.
          </p>
        ) : null}

        <SourceIngestRunList runs={sourceRuns} />
      </section>
    </main>
  );
}

function flattenSourceRuns(
  files: SourceFileSummary[],
  runsByFileId: Map<string, SourceIngestRunSummary[]>,
): SourceIngestRunWithFile[] {
  const fileNameById = new Map(files.map((file) => [file.id, file.originalFileName]));
  const runs: SourceIngestRunWithFile[] = [];

  for (const [fileId, fileRuns] of runsByFileId.entries()) {
    const fileName = fileNameById.get(fileId) ?? "Unknown source file";

    for (const run of fileRuns) {
      runs.push({
        fileName,
        run,
      });
    }
  }

  return runs.sort((left, right) =>
    right.run.startedAt.localeCompare(left.run.startedAt),
  );
}
