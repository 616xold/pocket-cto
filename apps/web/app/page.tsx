import Link from "next/link";
import { MissionIntakeForm } from "../components/mission-intake-form";
import { MissionList } from "../components/mission-list";
import { getControlPlaneHealth, getMissionList } from "../lib/api";

export default async function HomePage() {
  const [health, missionList] = await Promise.all([
    getControlPlaneHealth(),
    getMissionList({ limit: 6 }),
  ]);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Pocket CTO</p>
        <h1>Operator home for evidence-native engineering missions.</h1>
        <p className="lede">
          Create a mission from text, scan recent work, and jump straight into
          the evidence-heavy detail page from here. The home surface stays small
          and summary-shaped so it works cleanly on mobile.
        </p>
        <div className="button-row" style={{ marginTop: 22 }}>
          <Link href={{ pathname: "/missions" }} className="button primary">
            Open mission list
          </Link>
          <Link href="/missions/demo-mission" className="button outline">
            Open demo detail
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <h2>Start from text</h2>
          <p className="muted">
            This minimal intake calls the existing `POST /missions/text`
            backend, preserves the current replay sequence, and redirects into
            mission detail after creation.
          </p>
          <MissionIntakeForm />
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
            <p className="kicker">Recent missions</p>
            <h2>Latest operator work</h2>
          </div>
          <Link href={{ pathname: "/missions" }} className="button outline">
            View all
          </Link>
        </div>

        {missionList ? (
          <MissionList
            emptyHeading="No missions yet"
            emptyMessage="Create one from text to populate the operator home and the mission list."
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
