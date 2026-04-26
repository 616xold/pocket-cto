import React from "react";
import type { MonitorAlertCard } from "@pocket-cto/domain";
import { StatusPill } from "./status-pill";

type MonitoringAlertCardProps = {
  alertCard: MonitorAlertCard | null;
};

export function MonitoringAlertCard({ alertCard }: MonitoringAlertCardProps) {
  if (!alertCard) {
    return null;
  }

  return (
    <article className="card status-card">
      <div className="section-head">
        <div>
          <p className="kicker">Cash posture monitor</p>
          <h2>{alertCard.companyKey}</h2>
        </div>
        <StatusPill
          label={readSeverityLabel(alertCard.severity)}
          tone={alertCard.severity === "critical" ? "warn" : "default"}
        />
      </div>

      <dl className="meta-grid">
        <div>
          <dt>Monitor kind</dt>
          <dd>{alertCard.monitorKind}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{alertCard.status}</dd>
        </div>
        <div>
          <dt>Freshness state</dt>
          <dd>{alertCard.sourceFreshnessPosture.state}</dd>
        </div>
        <div>
          <dt>Proof posture</dt>
          <dd>{alertCard.proofBundlePosture.state}</dd>
        </div>
      </dl>

      <section className="stack">
        <div>
          <h3>Severity rationale</h3>
          <p className="muted">{alertCard.deterministicSeverityRationale}</p>
        </div>

        <div>
          <h3>Conditions</h3>
          <ul className="list-clean">
            {alertCard.conditionSummaries.map((summary) => (
              <li key={summary}>{summary}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Source posture</h3>
          <p className="muted">{alertCard.sourceFreshnessPosture.summary}</p>
          <p className="muted">{alertCard.sourceLineageSummary}</p>
        </div>

        <div>
          <h3>Limitations</h3>
          <ul className="list-clean">
            {alertCard.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Proof posture</h3>
          <p className="muted">{alertCard.proofBundlePosture.summary}</p>
        </div>

        <div>
          <h3>Human review next step</h3>
          <p className="muted">{alertCard.humanReviewNextStep}</p>
        </div>
      </section>
    </article>
  );
}

function readSeverityLabel(severity: MonitorAlertCard["severity"]) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}
