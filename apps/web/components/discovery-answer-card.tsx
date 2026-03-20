import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import { StatusPill } from "./status-pill";

type DiscoveryAnswerCardProps = {
  answer: MissionDetailView["discoveryAnswer"];
  mission: MissionDetailView["mission"];
};

export function DiscoveryAnswerCard({
  answer,
  mission,
}: DiscoveryAnswerCardProps) {
  const discoveryQuestion = mission.spec.input?.discoveryQuestion ?? null;
  const repoFullName =
    answer?.repoFullName ?? discoveryQuestion?.repoFullName ?? mission.primaryRepo;
  const questionKind = answer?.questionKind ?? discoveryQuestion?.questionKind;
  const changedPaths =
    answer?.changedPaths ??
    discoveryQuestion?.changedPaths ??
    mission.spec.constraints.allowedPaths;

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Discovery answer</p>
          <h2>Stored blast-radius evidence</h2>
        </div>
        {answer ? (
          <StatusPill
            label={answer.freshnessRollup.state}
            tone={readFreshnessTone(answer.freshnessRollup.state)}
          />
        ) : null}
      </div>

      <p className="muted">
        {answer
          ? answer.freshnessRollup.reasonSummary
          : "The mission has been created, but no durable discovery answer artifact is stored yet. The scout task may still be running, or the mission may have failed before answer persistence."}
      </p>

      {answer ? (
        <p className="mission-summary-copy">{answer.answerSummary}</p>
      ) : null}

      <div className="meta-grid">
        <div>
          <dt>Repo</dt>
          <dd>{repoFullName ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Question kind</dt>
          <dd>{questionKind ?? "Not recorded yet."}</dd>
        </div>
        <div>
          <dt>Freshness</dt>
          <dd>{answer?.freshnessRollup.state ?? "pending_answer"}</dd>
        </div>
        <div>
          <dt>Limitations</dt>
          <dd>{answer?.limitations.length ?? 0}</dd>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Changed paths</h3>
        {changedPaths.length > 0 ? (
          <ul className="list-clean">
            {changedPaths.map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No changed paths were recorded for this mission.</p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Impacted directories</h3>
        {answer ? (
          answer.impactedDirectories.length > 0 ? (
            <ul className="list-clean">
              {answer.impactedDirectories.map((directory) => (
                <li key={directory.path}>
                  <code>{directory.path}</code> ·{" "}
                  {formatOwnershipSummary(
                    directory.ownershipState,
                    directory.effectiveOwners,
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No impacted directories were stored.</p>
          )
        ) : (
          <p className="muted">
            Impacted directories will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Impacted manifests</h3>
        {answer ? (
          answer.impactedManifests.length > 0 ? (
            <ul className="list-clean">
              {answer.impactedManifests.map((manifest) => (
                <li key={manifest.path}>
                  <code>{manifest.path}</code> ·{" "}
                  {formatOwnershipSummary(
                    manifest.ownershipState,
                    manifest.effectiveOwners,
                  )}{" "}
                  · suites {manifest.relatedTestSuiteCount} · mapped CI jobs{" "}
                  {manifest.relatedMappedCiJobCount}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No impacted manifests were stored.</p>
          )
        ) : (
          <p className="muted">
            Impacted manifests will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related test suites</h3>
        {answer ? (
          answer.relatedTestSuites.length > 0 ? (
            <ul className="list-clean">
              {answer.relatedTestSuites.map((suite) => (
                <li key={suite.stableKey}>
                  <code>{suite.manifestPath}</code> · <code>{suite.scriptKey}</code>{" "}
                  · matched jobs {suite.matchedJobs.length}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related test suites were stored.</p>
          )
        ) : (
          <p className="muted">
            Related test suites will appear after a discovery answer artifact is
            stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Related mapped CI jobs</h3>
        {answer ? (
          answer.relatedMappedCiJobs.length > 0 ? (
            <ul className="list-clean">
              {answer.relatedMappedCiJobs.map((job) => (
                <li key={job.jobStableKey}>
                  {job.workflowName} · <code>{job.jobKey}</code> · manifests{" "}
                  {job.manifestPaths.length}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related mapped CI jobs were stored.</p>
          )
        ) : (
          <p className="muted">
            Related mapped CI jobs will appear after a discovery answer artifact
            is stored.
          </p>
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Limitations</h3>
        {answer ? (
          answer.limitations.length > 0 ? (
            <ul className="list-clean">
              {answer.limitations.map((limitation) => (
                <li key={`${limitation.code}:${limitation.summary}`}>
                  <strong>{limitation.code}</strong> · {limitation.summary}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No explicit limitations were recorded.</p>
          )
        ) : (
          <p className="muted">
            Limitations will appear after a discovery answer artifact is stored.
          </p>
        )}
      </div>
    </section>
  );
}

function formatOwnershipSummary(
  ownershipState: "owned" | "unowned" | "unknown",
  effectiveOwners: string[],
) {
  if (ownershipState === "owned" && effectiveOwners.length > 0) {
    return `owners ${effectiveOwners.join(", ")}`;
  }

  if (ownershipState === "unowned") {
    return "no effective owners stored";
  }

  return "ownership unknown";
}

function readFreshnessTone(state: string) {
  return state === "fresh" ? ("good" as const) : ("warn" as const);
}
