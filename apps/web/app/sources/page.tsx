import React from "react";
import Link from "next/link";
import { SourceList } from "../../components/source-list";
import { SourceRegistrationForm } from "../../components/source-registration-form";
import { getControlPlaneHealth, getSourceList } from "../../lib/api";

export default async function SourcesPage() {
  const [health, sourceList] = await Promise.all([
    getControlPlaneHealth(),
    getSourceList({ limit: 20 }),
  ]);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Source inventory</p>
        <h1>Register finance source truth, then inspect files and ingest runs.</h1>
        <p className="lede">
          F1 operator work starts here. Register the source record, upload raw
          bytes on the source detail page, and trigger deterministic ingest
          without claiming Finance Twin, CFO Wiki, reports, or monitoring work
          that has not shipped yet.
        </p>
        <div className="button-row">
          <Link href="/" className="button outline">
            Back to operator home
          </Link>
          <Link href="/missions" className="button outline">
            Open missions
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <h2>Register source truth</h2>
          <p className="muted">
            The current backend creates a source from explicit snapshot
            metadata. That is intentional in F1: register the initial source
            reference honestly, then upload immutable raw files from the detail
            page.
          </p>
          <SourceRegistrationForm />
        </article>

        <article className="card status-card">
          <h2>Current F1 boundary</h2>
          <ul className="list-clean">
            <li>Source inventory, immutable file storage, and ingest receipts</li>
            <li>No Finance Twin UI or writes yet</li>
            <li>No CFO Wiki, reports, or monitoring UI yet</li>
            <li>GitHub remains a legacy connector, not the main operator flow</li>
          </ul>

          <div className="status-list" style={{ marginTop: 20 }}>
            <div>
              <dt>Control plane</dt>
              <dd>{health.ok ? "reachable" : "unreachable"}</dd>
            </div>
            <div>
              <dt>Observed</dt>
              <dd>{health.now}</dd>
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Registered sources</p>
            <h2>Latest source records</h2>
          </div>
          <p className="muted">
            Showing latest {sourceList?.limit ?? 20} sources from the control
            plane.
          </p>
        </div>

        {sourceList ? (
          <SourceList
            emptyHeading="No sources registered yet"
            emptyMessage="Use the form above to register the first finance source truth record."
            sources={sourceList.sources}
          />
        ) : (
          <p className="muted">
            The control plane is not reachable yet, so source inventory could
            not be loaded.
          </p>
        )}
      </section>
    </main>
  );
}
