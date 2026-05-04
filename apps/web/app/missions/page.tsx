import React from "react";
import Link from "next/link";
import type { Route } from "next";
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
        <h1>Mission operations for deterministic finance work.</h1>
        <p className="lede">
          Review stored missions and start only the existing typed intake paths.
          Mission outputs remain derived from stored evidence; this page does
          not add provider setup, delivery, certification, legal or audit
          opinions, payment behavior, runtime-Codex finance drafting, generated
          customer-contact instructions, or autonomous actions.
        </p>
        <div className="button-row">
          <Link href="/" className="button outline">
            Back to operator home
          </Link>
          <Link href={"/sources" as Route} className="button outline">
            Open source inventory
          </Link>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <h2>Start from text</h2>
          <p className="muted">
            The existing mission compiler still owns mission shaping. This page
            only creates and redirects, and it now sits beside the source-first
            evidence path rather than ahead of it.
          </p>
          <MissionIntakeForm buttonLabel="Create and open mission" />
        </article>

        <article className="card">
          <h2>Start finance analysis</h2>
          <p className="muted">
            Ask one stored deterministic finance question when mission work is
            actually needed. This page only submits the typed payload and
            redirects.
          </p>
          <DiscoveryMissionIntakeForm buttonLabel="Create and open analysis mission" />
        </article>
      </section>

      <section className="card status-card">
        <h2>List rules</h2>
        <ul className="list-clean">
          <li>Source inventory remains the primary evidence surface</li>
          <li>Newest-first mission cards</li>
          <li>Text and typed finance analysis intake stay separate</li>
          <li>
            Proof-bundle status and pending approvals stay visible at a glance
          </li>
          <li>Mission detail stays the evidence-heavy drill-down</li>
          <li>
            Provider, delivery, certification, and legal/audit actions remain
            out of scope here
          </li>
        </ul>
      </section>

      <section className="card" id="github-issue-intake">
        <div className="section-head">
          <div>
            <p className="kicker">Legacy GitHub connector</p>
            <h2>Persisted issue envelopes</h2>
          </div>
          <p className="muted">
            Latest stored `issues` deliveries, preserved as a secondary intake
            path instead of the product center.
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
            The control plane is not reachable yet, so GitHub issue intake could
            not be loaded.
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
