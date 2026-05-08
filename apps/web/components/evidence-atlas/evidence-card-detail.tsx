import React from "react";
import type { EvidenceCard } from "@pocket-cto/domain";
import { StatusPill } from "../status-pill";

type EvidenceCardDetailProps = {
  evidenceCard: EvidenceCard | null;
};

export function EvidenceCardDetail({ evidenceCard }: EvidenceCardDetailProps) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Evidence card detail</p>
          <h2>Claim, evidence, freshness, limitations</h2>
        </div>
        <StatusPill
          label={evidenceCard ? evidenceCard.freshness.state : "missing"}
          tone={evidenceCard ? "default" : "warn"}
        />
      </div>

      {evidenceCard ? (
        <div className="stack">
          <p className="mission-summary-copy">{evidenceCard.claimText}</p>
          <dl className="meta-grid">
            <div>
              <dt>Evidence anchors</dt>
              <dd>{evidenceCard.sourceAnchors.length}</dd>
            </div>
            <div>
              <dt>Finance Twin refs</dt>
              <dd>{evidenceCard.financeTwinRefs.length}</dd>
            </div>
            <div>
              <dt>CFO Wiki refs</dt>
              <dd>{evidenceCard.wikiRefs.length}</dd>
            </div>
            <div>
              <dt>Freshness</dt>
              <dd>{evidenceCard.freshness.summary}</dd>
            </div>
          </dl>

          <h3>Limitations</h3>
          <ul className="list-clean">
            {evidenceCard.limitations.map((limitation) => (
              <li key={limitation.code}>
                {limitation.code} - {limitation.summary}
              </li>
            ))}
          </ul>

          <h3>Permitted next actions</h3>
          <ul className="list-clean">
            {evidenceCard.permittedNextActions.map((action) => (
              <li key={`${action.action}-${action.targetId}`}>
                {action.action} - {action.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">
          No EvidenceCard is available through existing web read models. The
          atlas detail panel therefore stays in a missing state instead of
          generating a claim, summary, next action, or finance advice.
        </p>
      )}
    </section>
  );
}
