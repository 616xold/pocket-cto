import React from "react";
import type {
  EvidenceIndexLimitationPosture,
  ForbiddenToolAction,
} from "@pocket-cto/domain";
import { StatusPill } from "../status-pill";

type CapabilityBoundaryPanelProps = {
  forbiddenActions: ForbiddenToolAction[];
  limitations: EvidenceIndexLimitationPosture[];
};

export function CapabilityBoundaryPanel({
  forbiddenActions,
  limitations,
}: CapabilityBoundaryPanelProps) {
  return (
    <section className="card status-card">
      <div className="section-head">
        <div>
          <p className="kicker">Capability boundary</p>
          <h2>No write or action controls</h2>
        </div>
        <StatusPill label="Read-only" tone="good" />
      </div>

      <p className="muted">
        Atlas inspection is limited to navigation and evidence review. The UI
        registers no tools, forms, provider calls, source mutation, finance
        writes, report release, certification, generated advice, or autonomous
        remediation controls.
      </p>

      <dl className="meta-grid" style={{ marginTop: 18 }}>
        <div>
          <dt>Write tools registered</dt>
          <dd>none</dd>
        </div>
        <div>
          <dt>Forbidden actions surfaced</dt>
          <dd>{forbiddenActions.length}</dd>
        </div>
        <div>
          <dt>Blocking limitations</dt>
          <dd>
            {
              limitations.filter(
                (limitation) => limitation.severity === "blocking",
              ).length
            }
          </dd>
        </div>
      </dl>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Forbidden actions</h3>
        <p className="muted">
          These contract actions are displayed as blocked text only.
        </p>
        <ul className="list-clean">
          {forbiddenActions.map((action) => (
            <li key={action}>
              <code>{action}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
