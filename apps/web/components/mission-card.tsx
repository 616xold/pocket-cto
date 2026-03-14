import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import { StatusPill } from "./status-pill";

type MissionCardProps = Pick<
  MissionDetailView,
  "approvals" | "artifacts" | "liveControl" | "mission" | "proofBundle" | "tasks"
>;

export function MissionCard({
  approvals,
  artifacts,
  liveControl,
  mission,
  proofBundle,
  tasks,
}: MissionCardProps) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  return (
    <div className="mission-grid">
      <section className="card">
        <div className="mission-header">
          <div>
            <p className="kicker">Mission detail</p>
            <h1>{mission.title}</h1>
            <p className="lede">{mission.objective}</p>
          </div>
          <StatusPill label={mission.status} tone={readStatusTone(mission.status)} />
        </div>

        <div className="meta-grid">
          <div>
            <dt>Mission type</dt>
            <dd>{mission.type}</dd>
          </div>
          <div>
            <dt>Primary repo</dt>
            <dd>{mission.primaryRepo ?? "not assigned"}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{mission.createdAt}</dd>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Run graph snapshot</h2>
        <div className="stack">
          {tasks.map((task) => (
            <div key={task.id} className="task-row">
              <div>
                <strong>
                  Task {task.sequence} · {task.role}
                </strong>
              </div>
              <StatusPill label={task.status} tone={readStatusTone(task.status)} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Approvals</h2>
        <p className="muted">
          {liveControl.enabled
            ? `Live control is enabled in ${liveControl.mode} mode, so pending approvals can be resolved from the operator surface.`
            : `Live control is unavailable in ${liveControl.mode} mode, but the persisted approval ledger still reflects the current backend state.`}
        </p>

        <div className="stack" style={{ marginTop: 18 }}>
          {approvals.length > 0 ? (
            approvals.map((approval) => (
              <div key={approval.id} className="task-row">
                <div>
                  <strong>{approval.kind}</strong>
                  <p className="muted" style={{ marginTop: 4 }}>
                    Requested by {approval.requestedBy} at {approval.createdAt}
                  </p>
                  {approval.resolvedBy ? (
                    <p className="muted" style={{ marginTop: 4 }}>
                      Resolved by {approval.resolvedBy} at {approval.updatedAt}
                    </p>
                  ) : null}
                  {approval.rationale ? (
                    <p className="muted" style={{ marginTop: 4 }}>
                      Rationale: {approval.rationale}
                    </p>
                  ) : null}
                </div>
                <StatusPill label={approval.status} tone={readStatusTone(approval.status)} />
              </div>
            ))
          ) : (
            <p className="muted">No persisted approvals for this mission yet.</p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Artifact ledger</h2>
        <p className="muted">
          Artifacts are ordered oldest-first so the operator can follow the
          persisted evidence trail from placeholder proof bundle through later
          planner and executor outputs.
        </p>

        <div className="stack" style={{ marginTop: 18 }}>
          {artifacts.length > 0 ? (
            artifacts.map((artifact) => {
              const task = artifact.taskId ? taskById.get(artifact.taskId) : null;

              return (
                <div key={artifact.id} className="task-row">
                  <div>
                    <strong>{artifact.kind}</strong>
                    <p className="muted" style={{ marginTop: 4 }}>
                      {task
                        ? `Task ${task.sequence} · ${task.role}`
                        : "Mission-level artifact"}{" "}
                      · {artifact.createdAt}
                    </p>
                    <p className="muted" style={{ marginTop: 4 }}>
                      {artifact.summary ?? "No concise artifact summary was stored."}
                    </p>
                    <p className="muted" style={{ marginTop: 4 }}>
                      {artifact.uri}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted">No persisted artifacts for this mission yet.</p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Proof bundle</h2>
        <div className="meta-grid">
          <div>
            <dt>Status</dt>
            <dd>{proofBundle.status}</dd>
          </div>
          <div>
            <dt>Objective</dt>
            <dd>{proofBundle.objective}</dd>
          </div>
          <div>
            <dt>Change summary</dt>
            <dd>{proofBundle.changeSummary || "Pending evidence generation."}</dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd>{proofBundle.verificationSummary || "Pending validation."}</dd>
          </div>
          <div>
            <dt>Risk</dt>
            <dd>{proofBundle.riskSummary || "Pending risk summary."}</dd>
          </div>
          <div>
            <dt>Rollback</dt>
            <dd>{proofBundle.rollbackSummary || "Pending rollback note."}</dd>
          </div>
        </div>

        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Decision trace</h3>
          {proofBundle.decisionTrace.length > 0 ? (
            <ul className="list-clean">
              {proofBundle.decisionTrace.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">Decision trace has not been recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function readStatusTone(status: string) {
  if (status === "succeeded" || status === "approved" || status === "ready") {
    return "good" as const;
  }

  if (
    status === "failed" ||
    status === "declined" ||
    status === "cancelled" ||
    status === "expired"
  ) {
    return "warn" as const;
  }

  return "default" as const;
}
