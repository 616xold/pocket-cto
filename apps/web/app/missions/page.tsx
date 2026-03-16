import React from "react";
import Link from "next/link";
import { MissionIntakeForm } from "../../components/mission-intake-form";
import { MissionList } from "../../components/mission-list";
import { getMissionList } from "../../lib/api";

export default async function MissionsPage() {
  const missionList = await getMissionList({ limit: 20 });

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Mission list</p>
        <h1>Recent missions, newest first.</h1>
        <p className="lede">
          This surface stays summary-shaped on purpose. Start from text, scan
          mission status and proof posture, then open the existing detail page
          when you need the full evidence bundle.
        </p>
        <div className="button-row">
          <Link href="/" className="button outline">
            Back to operator home
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <h2>Start from text</h2>
          <p className="muted">
            One text box is enough for M2. The existing mission compiler still
            owns mission shaping; this page only creates and redirects.
          </p>
          <MissionIntakeForm buttonLabel="Create and open mission" />
        </article>

        <article className="card status-card">
          <h2>List rules</h2>
          <ul className="list-clean">
            <li>Newest-first mission cards</li>
            <li>Summary-shaped payload from `GET /missions`</li>
            <li>Proof-bundle status and pending approvals at a glance</li>
            <li>Mission detail stays the evidence-heavy drill-down</li>
          </ul>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="kicker">Missions</p>
            <h2>Summary cards</h2>
          </div>
          <p className="muted">
            Showing latest {missionList?.filters.limit ?? 20} missions.
          </p>
        </div>

        {missionList ? (
          <MissionList
            emptyHeading="No missions have been created yet"
            emptyMessage="Use the text box above to create one and jump straight into mission detail."
            missions={missionList.missions}
          />
        ) : (
          <p className="muted">
            The control plane is not reachable yet, so mission summaries could
            not be loaded.
          </p>
        )}
      </section>
    </main>
  );
}
