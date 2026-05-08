import React from "react";
import type {
  EvidenceIndexLimitationPosture,
  SourceCoverageMatrix,
} from "@pocket-cto/domain";
import { StatusPill } from "../status-pill";

type SourceCoverageMatrixViewProps = {
  freshnessLegend: string[];
  limitations: EvidenceIndexLimitationPosture[];
  matrix: SourceCoverageMatrix | null;
  sourceCount: number | null;
  sourceInventorySummary: string;
  statusLegend: string[];
};

export function SourceCoverageMatrixView({
  freshnessLegend,
  limitations,
  matrix,
  sourceCount,
  sourceInventorySummary,
  statusLegend,
}: SourceCoverageMatrixViewProps) {
  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Source Coverage Matrix</p>
          <h2>Coverage posture</h2>
        </div>
        <StatusPill
          label={matrix ? "loaded" : "missing"}
          tone={matrix ? "good" : "warn"}
        />
      </div>

      <p className="muted">{sourceInventorySummary}</p>

      <dl className="meta-grid" style={{ marginTop: 18 }}>
        <div>
          <dt>Displayed source records</dt>
          <dd>{sourceCount ?? "unknown"}</dd>
        </div>
        <div>
          <dt>Coverage entries</dt>
          <dd>{matrix?.entries.length ?? 0}</dd>
        </div>
        <div>
          <dt>Generated at</dt>
          <dd>{matrix?.generatedAt ?? "not loaded"}</dd>
        </div>
      </dl>

      {matrix ? (
        <div style={{ overflowX: "auto", marginTop: 18 }}>
          <table className="atlas-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Role</th>
                <th>Freshness</th>
                <th>Methods</th>
                <th>Limitations</th>
              </tr>
            </thead>
            <tbody>
              {matrix.entries.map((entry) => (
                <tr key={entry.sourceId}>
                  <td>
                    <code>{entry.sourceId}</code>
                  </td>
                  <td>{entry.coverageStatus}</td>
                  <td>{entry.documentRole ?? "not recorded"}</td>
                  <td>{entry.freshness.state}</td>
                  <td>
                    {entry.supportedMethods.length > 0
                      ? entry.supportedMethods.join(", ")
                      : entry.unsupportedMethods.join(", ")}
                  </td>
                  <td>
                    {entry.limitations.length > 0
                      ? entry.limitations
                          .map((limitation) => limitation.code)
                          .join(", ")
                      : "none"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <MissingCoverageState
          freshnessLegend={freshnessLegend}
          limitations={limitations}
          statusLegend={statusLegend}
        />
      )}
    </section>
  );
}

function MissingCoverageState(input: {
  freshnessLegend: string[];
  limitations: EvidenceIndexLimitationPosture[];
  statusLegend: string[];
}) {
  return (
    <div className="stack" style={{ marginTop: 18 }}>
      <h3>Unsupported, missing, and stale states</h3>
      <p className="muted">
        The atlas keeps absence visible. It does not coerce missing coverage
        into supported claims.
      </p>
      <dl className="meta-grid">
        <div>
          <dt>Coverage states</dt>
          <dd>{input.statusLegend.join(", ")}</dd>
        </div>
        <div>
          <dt>Freshness states</dt>
          <dd>{input.freshnessLegend.join(", ")}</dd>
        </div>
      </dl>
      <ul className="list-clean">
        {input.limitations.map((limitation) => (
          <li key={limitation.code}>
            <strong>{limitation.severity}</strong> - {limitation.code} -{" "}
            {limitation.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
