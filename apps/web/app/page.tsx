import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { MissionList } from "../components/mission-list";
import { SourceList } from "../components/source-list";
import { getControlPlaneHealth, getMissionList, getSourceList } from "../lib/api";

export default async function HomePage() {
  const [health, missionList, sourceList] = await Promise.all([
    getControlPlaneHealth(),
    getMissionList({ limit: 4 }),
    getSourceList({ limit: 4 }),
  ]);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Pocket CFO</p>
        <h1>Operator home for source-first finance evidence intake.</h1>
        <p className="lede">
          Register finance source truth, upload immutable raw files, and trigger
          deterministic ingest receipts from the operator surface. This F1 home
          stays honest about what exists now: source inventory and ingest
          review, not Finance Twin, CFO Wiki, reports, or monitoring.
        </p>
        <div className="button-row" style={{ marginTop: 22 }}>
          <Link href={"/sources" as Route} className="button primary">
            Open source inventory
          </Link>
          <Link href="/missions" className="button outline">
            Open mission list
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <h2>Current operator flow</h2>
          <ul className="list-clean">
            <li>Register the source record with explicit finance metadata</li>
            <li>Upload raw files immutably on the source detail page</li>
            <li>Trigger ingest and review deterministic receipts</li>
            <li>Keep GitHub and mission work secondary to source truth in F1</li>
          </ul>
        </article>

        <article className="card status-card">
          <h2>Control-plane health</h2>
          {health.ok ? (
            <dl className="status-list">
              <div>
                <dt>Status</dt>
                <dd>reachable</dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>{health.service}</dd>
              </div>
              <div>
                <dt>Observed</dt>
                <dd>{health.now}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              The control plane is not reachable yet. Start it with <code>pnpm
              dev</code> after bootstrapping dependencies.
            </p>
          )}
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Source inventory</p>
            <h2>Latest registered sources</h2>
          </div>
          <Link href={"/sources" as Route} className="button outline">
            View all sources
          </Link>
        </div>

        {sourceList ? (
          <SourceList
            emptyHeading="No finance sources registered yet"
            emptyMessage="Open source inventory to register the first source truth record."
            sources={sourceList.sources}
          />
        ) : (
          <p className="muted">
            The control plane is not reachable yet, so source inventory could
            not be loaded.
          </p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Missions</p>
            <h2>Secondary operator work</h2>
          </div>
          <Link href="/missions" className="button outline">
            Open missions
          </Link>
        </div>

        <p className="muted">
          Missions still exist, but they are no longer the main intake story on
          the home surface. F1 keeps source truth first and treats GitHub as a
          legacy connector rather than the product center.
        </p>

        {missionList ? (
          <MissionList
            emptyHeading="No missions yet"
            emptyMessage="Mission work is available, but F1 now starts with source inventory and ingest."
            missions={missionList.missions}
          />
        ) : (
          <p className="muted">
            The control plane is not reachable yet, so recent mission summaries
            could not be loaded.
          </p>
        )}
      </section>
    </main>
  );
}
