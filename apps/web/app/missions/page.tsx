import React from "react";
import Link from "next/link";
import { DiscoveryMissionIntakeForm } from "../../components/discovery-mission-intake-form";
import { GitHubIssueIntakeList } from "../../components/github-issue-intake-list";
import { MissionIntakeForm } from "../../components/mission-intake-form";
import { MissionList } from "../../components/mission-list";
import { getGitHubIssueIntakeList, getMissionList } from "../../lib/api";

export default async function MissionsPage() {
  const [missionList, issueIntake] = await Promise.all([
    getMissionList({ limit: 20 }),
    getGitHubIssueIntakeList(),
  ]);

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Mission list</p>
        <h1>Recent missions, newest first.</h1>
        <p className="lede">
          This surface stays summary-shaped on purpose. Start from text or one
          deterministic discovery question, scan mission status and proof
          posture, then open the existing detail page when you need the full
          evidence bundle.
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

        <article className="card">
          <h2>Start discovery</h2>
          <p className="muted">
            Ask one stored auth-change blast-radius question with explicit
            changed paths. This page only submits the typed payload and
            redirects.
          </p>
          <DiscoveryMissionIntakeForm buttonLabel="Create and open discovery mission" />
        </article>
      </section>

      <section className="card status-card">
        <h2>List rules</h2>
        <ul className="list-clean">
          <li>Newest-first mission cards</li>
          <li>Text and deterministic discovery intake stay separate</li>
          <li>Proof-bundle status and pending approvals at a glance</li>
          <li>Mission detail stays the evidence-heavy drill-down</li>
        </ul>
      </section>

      <section className="card" id="github-issue-intake">
        <div className="section-head">
          <div>
            <p className="kicker">GitHub issue intake</p>
            <h2>Persisted issue envelopes</h2>
          </div>
          <p className="muted">
            Latest stored `issues` deliveries, one card per issue identity.
          </p>
        </div>

        {issueIntake ? (
          <GitHubIssueIntakeList
            emptyHeading="No GitHub issues are waiting in intake"
            emptyMessage="Once a signed GitHub issues delivery lands, you can create a build mission from it here."
            issues={issueIntake.issues}
          />
        ) : (
          <p className="muted">
            The control plane is not reachable yet, so GitHub issue intake
            could not be loaded.
          </p>
        )}
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
