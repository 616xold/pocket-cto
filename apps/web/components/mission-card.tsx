import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import {
  isFinanceDiscoveryQuestion,
  isFinanceDiscoveryQuestionKind,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { ApprovalCardList } from "./approval-card-list";
import { DiscoveryAnswerCard } from "./discovery-answer-card";
import { readFreshnessLabel } from "./freshness-label";
import { StatusPill } from "./status-pill";

type MissionCardProps = Pick<
  MissionDetailView,
  | "approvalCards"
  | "artifacts"
  | "discoveryAnswer"
  | "liveControl"
  | "mission"
  | "proofBundle"
  | "tasks"
>;

export function MissionCard({
  approvalCards,
  artifacts,
  discoveryAnswer,
  liveControl,
  mission,
  proofBundle,
  tasks,
}: MissionCardProps) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const discoveryQuestion = mission.spec.input?.discoveryQuestion ?? null;
  const financeDiscoveryQuestion = isFinanceDiscoveryQuestion(discoveryQuestion)
    ? discoveryQuestion
    : null;
  const financeProofBundle = isFinanceProofBundle(proofBundle);

  return (
    <div className="mission-grid">
      <section className="card">
        <div className="mission-header">
          <div>
            <p className="kicker">Mission detail</p>
            <h1>{mission.title}</h1>
            <p className="lede">{mission.objective}</p>
          </div>
          <StatusPill
            label={mission.status}
            tone={readStatusTone(mission.status)}
          />
        </div>

        <div className="meta-grid">
          {financeDiscoveryQuestion ? (
            <>
              <div>
                <dt>Mission type</dt>
                <dd>{mission.type}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{financeDiscoveryQuestion.companyKey}</dd>
              </div>
              <div>
                <dt>Question kind</dt>
                <dd>
                  {readFinanceDiscoveryQuestionKindLabel(
                    financeDiscoveryQuestion.questionKind,
                  )}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Mission type</dt>
                <dd>{mission.type}</dd>
              </div>
              <div>
                <dt>Primary repo</dt>
                <dd>{mission.primaryRepo ?? "not assigned"}</dd>
              </div>
            </>
          )}
          <div>
            <dt>Created</dt>
            <dd>{mission.createdAt}</dd>
          </div>
        </div>
      </section>

      {mission.type === "discovery" || discoveryAnswer ? (
        <DiscoveryAnswerCard answer={discoveryAnswer} mission={mission} />
      ) : null}

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
              <StatusPill
                label={task.status}
                tone={readStatusTone(task.status)}
              />
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
          <ApprovalCardList approvalCards={approvalCards} />
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
              const task = artifact.taskId
                ? taskById.get(artifact.taskId)
                : null;

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
                      {artifact.summary ??
                        "No concise artifact summary was stored."}
                    </p>
                    <p className="muted" style={{ marginTop: 4 }}>
                      {artifact.uri}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted">
              No persisted artifacts for this mission yet.
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Proof bundle</h2>
        <p className="muted">{buildProofBundleReadinessMessage(proofBundle)}</p>

        <div className="meta-grid">
          <div>
            <dt>Status</dt>
            <dd>{proofBundle.status}</dd>
          </div>
          <div>
            <dt>Completeness</dt>
            <dd>{proofBundle.evidenceCompleteness.status}</dd>
          </div>
          {financeProofBundle ? (
            <>
              <div>
                <dt>Company</dt>
                <dd>{proofBundle.companyKey ?? "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Question kind</dt>
                <dd>
                  {proofBundle.questionKind &&
                  isFinanceDiscoveryQuestionKind(proofBundle.questionKind)
                    ? readFinanceDiscoveryQuestionKindLabel(
                        proofBundle.questionKind,
                      )
                    : "Not recorded yet."}
                </dd>
              </div>
              <div>
                <dt>Freshness</dt>
                <dd>{readFreshnessLabel(proofBundle.freshnessState)}</dd>
              </div>
              <div>
                <dt>Related routes</dt>
                <dd>{proofBundle.relatedRoutePaths?.length ?? 0}</dd>
              </div>
              <div>
                <dt>Related wiki pages</dt>
                <dd>{proofBundle.relatedWikiPageKeys?.length ?? 0}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Target repo</dt>
                <dd>{proofBundle.targetRepoFullName ?? "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd>{proofBundle.branchName ?? "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Pull request</dt>
                <dd>
                  {proofBundle.pullRequestUrl &&
                  proofBundle.pullRequestNumber ? (
                    <a
                      href={proofBundle.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      #{proofBundle.pullRequestNumber}
                    </a>
                  ) : (
                    "Not recorded yet."
                  )}
                </dd>
              </div>
            </>
          )}
          <div>
            <dt>Replay events</dt>
            <dd>{proofBundle.replayEventCount}</dd>
          </div>
          <div>
            <dt>Latest approval</dt>
            <dd>
              {proofBundle.latestApproval
                ? `${proofBundle.latestApproval.kind} · ${proofBundle.latestApproval.status}`
                : "No approvals recorded."}
            </dd>
          </div>
          <div>
            <dt>Change summary</dt>
            <dd>{proofBundle.changeSummary || "Not recorded yet."}</dd>
          </div>
          {financeProofBundle ? (
            <>
              <div>
                <dt>Answer summary</dt>
                <dd>{proofBundle.answerSummary || "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Freshness posture</dt>
                <dd>{proofBundle.freshnessSummary || "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Limitations</dt>
                <dd>{proofBundle.limitationsSummary || "Not recorded yet."}</dd>
              </div>
            </>
          ) : null}
          <div>
            <dt>Validation</dt>
            <dd>{proofBundle.validationSummary || "Not recorded yet."}</dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd>{proofBundle.verificationSummary || "Not recorded yet."}</dd>
          </div>
          <div>
            <dt>Risk</dt>
            <dd>{proofBundle.riskSummary || "Not recorded yet."}</dd>
          </div>
          <div>
            <dt>Rollback</dt>
            <dd>{proofBundle.rollbackSummary || "Not recorded yet."}</dd>
          </div>
        </div>

        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Missing evidence</h3>
          {proofBundle.evidenceCompleteness.notes.length > 0 ? (
            <ul className="list-clean">
              {proofBundle.evidenceCompleteness.notes.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">The final-package evidence set is complete.</p>
          )}
        </div>

        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Key timestamps</h3>
          <ul className="list-clean">
            <li>Mission created: {proofBundle.timestamps.missionCreatedAt}</li>
            {financeProofBundle ? (
              <li>
                Latest artifact:{" "}
                {proofBundle.timestamps.latestArtifactAt ?? "Not recorded yet."}
              </li>
            ) : (
              <>
                <li>
                  Planner evidence:{" "}
                  {proofBundle.timestamps.latestPlannerEvidenceAt ??
                    "Not recorded yet."}
                </li>
                <li>
                  Executor evidence:{" "}
                  {proofBundle.timestamps.latestExecutorEvidenceAt ??
                    "Not recorded yet."}
                </li>
                <li>
                  Pull request:{" "}
                  {proofBundle.timestamps.latestPullRequestAt ??
                    "Not recorded yet."}
                </li>
              </>
            )}
            <li>
              Latest approval:{" "}
              {proofBundle.timestamps.latestApprovalAt ??
                "No approvals recorded."}
            </li>
          </ul>
        </div>

        {financeProofBundle ? (
          <>
            <div className="stack" style={{ marginTop: 18 }}>
              <h3>Related routes</h3>
              {(proofBundle.relatedRoutePaths?.length ?? 0) > 0 ? (
                <ul className="list-clean">
                  {(proofBundle.relatedRoutePaths ?? []).map((routePath) => (
                    <li key={routePath}>
                      <code>{routePath}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No related routes were recorded.</p>
              )}
            </div>

            <div className="stack" style={{ marginTop: 18 }}>
              <h3>Related CFO Wiki pages</h3>
              {(proofBundle.relatedWikiPageKeys?.length ?? 0) > 0 ? (
                <ul className="list-clean">
                  {(proofBundle.relatedWikiPageKeys ?? []).map((pageKey) => (
                    <li key={pageKey}>
                      <code>{pageKey}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  No related CFO Wiki pages were recorded.
                </p>
              )}
            </div>
          </>
        ) : null}

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

function buildProofBundleReadinessMessage(
  proofBundle: MissionCardProps["proofBundle"],
) {
  if (isFinanceProofBundle(proofBundle)) {
    if (proofBundle.status === "ready") {
      return "The proof bundle now reads like a finance-ready answer package with stored routes, wiki context, freshness posture, and visible limitations linked together.";
    }

    if (proofBundle.status === "failed") {
      return "The current finance bundle is non-decision-ready. Review the persisted freshness posture, limitations, and mission evidence before retrying.";
    }

    if (proofBundle.status === "incomplete") {
      return "The bundle is partially assembled, but the final finance-ready evidence package is still missing one or more required artifacts.";
    }

    return "The finance proof bundle is still at the placeholder stage and has not yet accumulated meaningful persisted evidence.";
  }

  if (proofBundle.status === "ready") {
    return "The proof bundle now reads like a final GitHub-aware decision package with planner, validation, and PR evidence linked together.";
  }

  if (proofBundle.status === "failed") {
    return "The current bundle is non-shippable. Review the validation, approval, and runtime evidence before retrying.";
  }

  if (proofBundle.status === "incomplete") {
    return "The bundle is partially assembled, but the final GitHub-first evidence package is still missing one or more required artifacts.";
  }

  return "The proof bundle is still at the placeholder stage and has not yet accumulated meaningful persisted evidence.";
}

function isFinanceProofBundle(proofBundle: MissionCardProps["proofBundle"]) {
  return (
    proofBundle.companyKey !== null ||
    isFinanceDiscoveryQuestionKind(proofBundle.questionKind)
  );
}
