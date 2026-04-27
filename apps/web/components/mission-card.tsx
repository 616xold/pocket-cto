import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import {
  isFinanceDiscoveryAnswerArtifactMetadata,
  isFinanceDiscoveryQuestion,
  isFinanceDiscoveryQuestionKind,
  readFinanceDiscoveryQuestionKindLabel,
  readReportingMissionReportKindLabel,
} from "@pocket-cto/domain";
import { ApprovalCardList } from "./approval-card-list";
import { DiscoveryAnswerCard } from "./discovery-answer-card";
import { PolicySourceScopeFields } from "./policy-source-scope-fields";
import { ReportingOutputCard } from "./reporting-output-card";
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
  | "reporting"
  | "tasks"
>;

export function MissionCard({
  approvalCards,
  artifacts,
  discoveryAnswer,
  liveControl,
  mission,
  proofBundle,
  reporting,
  tasks,
}: MissionCardProps) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const discoveryQuestion = mission.spec.input?.discoveryQuestion ?? null;
  const financeDiscoveryQuestion = isFinanceDiscoveryQuestion(discoveryQuestion)
    ? discoveryQuestion
    : null;
  const financeDiscoveryAnswer = isFinanceDiscoveryAnswerArtifactMetadata(
    discoveryAnswer,
  )
    ? discoveryAnswer
    : null;
  const reportingView = reporting;
  const monitorInvestigation =
    proofBundle.monitorInvestigation ??
    mission.spec.input?.monitorInvestigation ??
    null;
  const reportingPublication =
    reportingView?.publication ?? proofBundle.reportPublication ?? null;
  const circulationChronology =
    reportingView?.circulationChronology ?? proofBundle.circulationChronology;
  const circulationRecord =
    reportingView?.circulationRecord ?? proofBundle.circulationRecord;
  const effectiveCirculationRecord =
    circulationChronology?.effectiveRecord ?? circulationRecord;
  const isDiligencePacket = proofBundle.reportKind === "diligence_packet";
  const isBoardPacket = proofBundle.reportKind === "board_packet";
  const isLenderUpdate = proofBundle.reportKind === "lender_update";
  const supportsCirculationApproval = isBoardPacket;
  const supportsReleaseApproval = isLenderUpdate || isDiligencePacket;
  const supportsReleaseLog = isLenderUpdate || isDiligencePacket;
  const isSpecializedReporting =
    isBoardPacket || isLenderUpdate || isDiligencePacket;
  const reportProofBundle =
    proofBundle.reportKind !== null || reportingView !== null;
  const monitorInvestigationProofBundle = monitorInvestigation !== null;
  const financeProofBundle =
    !monitorInvestigationProofBundle &&
    !reportProofBundle &&
    isFinanceProofBundle(proofBundle);
  const policySourceScope =
    reportingView?.policySourceScope ??
    financeDiscoveryAnswer?.policySourceScope ??
    proofBundle.policySourceScope ??
    null;

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
          {monitorInvestigation ? (
            <>
              <div>
                <dt>Mission type</dt>
                <dd>{mission.type}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{monitorInvestigation.companyKey}</dd>
              </div>
              <div>
                <dt>Monitor kind</dt>
                <dd>{monitorInvestigation.monitorKind}</dd>
              </div>
              <div>
                <dt>Monitor result</dt>
                <dd>{monitorInvestigation.monitorResultId}</dd>
              </div>
              <div>
                <dt>Alert severity</dt>
                <dd>{monitorInvestigation.alertSeverity}</dd>
              </div>
              <div>
                <dt>Freshness</dt>
                <dd>
                  {readFreshnessLabel(
                    monitorInvestigation.sourceFreshnessPosture.state,
                  )}
                </dd>
              </div>
            </>
          ) : reportingView ? (
            <>
              <div>
                <dt>Mission type</dt>
                <dd>{mission.type}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{reportingView.companyKey ?? "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Report kind</dt>
                <dd>
                  {readReportingMissionReportKindLabel(
                    reportingView.reportKind,
                  )}
                </dd>
              </div>
              <div>
                <dt>Source discovery mission</dt>
                <dd>
                  <a
                    href={`/missions/${reportingView.sourceDiscoveryMissionId}`}
                  >
                    {reportingView.sourceDiscoveryMissionId}
                  </a>
                </dd>
              </div>
              {isSpecializedReporting ? (
                <div>
                  <dt>Source reporting mission</dt>
                  <dd>
                    {reportingView.sourceReportingMissionId ? (
                      <a
                        href={`/missions/${reportingView.sourceReportingMissionId}`}
                      >
                        {reportingView.sourceReportingMissionId}
                      </a>
                    ) : (
                      "Not recorded yet."
                    )}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Draft posture</dt>
                <dd>{reportingView.draftStatus}</dd>
              </div>
              {supportsCirculationApproval ? (
                <>
                  <div>
                    <dt>Circulation approval</dt>
                    <dd>
                      {reportingView.circulationReadiness
                        ?.circulationApprovalStatus ?? "not_requested"}
                    </dd>
                  </div>
                  <div>
                    <dt>Circulation ready</dt>
                    <dd>
                      {reportingView.circulationReadiness?.circulationReady
                        ? "Yes"
                        : "No"}
                    </dd>
                  </div>
                  <div>
                    <dt>Circulation logged</dt>
                    <dd>{circulationRecord?.circulated ? "Yes" : "No"}</dd>
                  </div>
                  <div>
                    <dt>Original circulated by</dt>
                    <dd>
                      {circulationRecord?.circulatedBy ?? "Not logged yet."}
                    </dd>
                  </div>
                  <div>
                    <dt>Effective circulated by</dt>
                    <dd>
                      {effectiveCirculationRecord?.circulatedBy ??
                        "Not logged yet."}
                    </dd>
                  </div>
                  <div>
                    <dt>Correction count</dt>
                    <dd>{circulationChronology?.correctionCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Approval requested</dt>
                    <dd>
                      {reportingView.circulationReadiness?.requestedAt ??
                        "Not requested yet."}
                    </dd>
                  </div>
                  <div>
                    <dt>Approval resolved</dt>
                    <dd>
                      {reportingView.circulationReadiness?.resolvedAt ??
                        "Not resolved yet."}
                    </dd>
                  </div>
                  <div>
                    <dt>Latest correction</dt>
                    <dd>
                      {circulationChronology?.latestCorrectionSummary ??
                        "No corrections recorded."}
                    </dd>
                  </div>
                </>
              ) : null}
              {supportsReleaseApproval ? (
                <>
                  <div>
                    <dt>Release approval</dt>
                    <dd>
                      {reportingView.releaseReadiness?.releaseApprovalStatus ??
                        "not_requested"}
                    </dd>
                  </div>
                  <div>
                    <dt>Release ready</dt>
                    <dd>
                      {reportingView.releaseReadiness?.releaseReady
                        ? "Yes"
                        : "No"}
                    </dd>
                  </div>
                  {supportsReleaseLog ? (
                    <div>
                      <dt>Release logged</dt>
                      <dd>
                        {reportingView.releaseRecord?.released ? "Yes" : "No"}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : financeDiscoveryQuestion ? (
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
              {financeDiscoveryQuestion.questionKind === "policy_lookup" ? (
                <PolicySourceScopeFields
                  fallbackPolicySourceId={
                    financeDiscoveryQuestion.policySourceId
                  }
                  scope={policySourceScope}
                />
              ) : null}
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

      {monitorInvestigation ? (
        <MonitorInvestigationCard seed={monitorInvestigation} />
      ) : reportingView ? (
        <ReportingOutputCard
          proofBundle={proofBundle}
          reporting={reportingView}
        />
      ) : mission.type === "discovery" || discoveryAnswer ? (
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
          {monitorInvestigationProofBundle && monitorInvestigation ? (
            <>
              <div>
                <dt>Company</dt>
                <dd>{monitorInvestigation.companyKey}</dd>
              </div>
              <div>
                <dt>Monitor kind</dt>
                <dd>{monitorInvestigation.monitorKind}</dd>
              </div>
              <div>
                <dt>Monitor result</dt>
                <dd>{monitorInvestigation.monitorResultId}</dd>
              </div>
              <div>
                <dt>Alert severity</dt>
                <dd>{monitorInvestigation.alertSeverity}</dd>
              </div>
              <div>
                <dt>Source freshness</dt>
                <dd>
                  {readFreshnessLabel(
                    monitorInvestigation.sourceFreshnessPosture.state,
                  )}
                </dd>
              </div>
              <div>
                <dt>Proof posture</dt>
                <dd>{monitorInvestigation.proofBundlePosture.state}</dd>
              </div>
            </>
          ) : reportProofBundle ? (
            <>
              <div>
                <dt>Company</dt>
                <dd>{proofBundle.companyKey ?? "Not recorded yet."}</dd>
              </div>
              <div>
                <dt>Report kind</dt>
                <dd>
                  {proofBundle.reportKind
                    ? readReportingMissionReportKindLabel(
                        proofBundle.reportKind,
                      )
                    : "Not recorded yet."}
                </dd>
              </div>
              <div>
                <dt>Draft posture</dt>
                <dd>{proofBundle.reportDraftStatus ?? "Not recorded yet."}</dd>
              </div>
              {supportsReleaseApproval ? (
                <>
                  <div>
                    <dt>Release approval</dt>
                    <dd>
                      {proofBundle.releaseReadiness?.releaseApprovalStatus ??
                        "not_requested"}
                    </dd>
                  </div>
                  <div>
                    <dt>Release ready</dt>
                    <dd>
                      {proofBundle.releaseReadiness?.releaseReady
                        ? "Yes"
                        : "No"}
                    </dd>
                  </div>
                  <div>
                    <dt>Release posture</dt>
                    <dd>
                      {proofBundle.releaseReadiness?.summary ??
                        "Release approval posture has not been recorded yet."}
                    </dd>
                  </div>
                  {isLenderUpdate ? (
                    <>
                      <div>
                        <dt>Release logged</dt>
                        <dd>
                          {proofBundle.releaseRecord?.released ? "Yes" : "No"}
                        </dd>
                      </div>
                      <div>
                        <dt>Release record</dt>
                        <dd>
                          {proofBundle.releaseRecord?.summary ??
                            "No external release has been logged yet."}
                        </dd>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
              {supportsCirculationApproval ? (
                <>
                  <div>
                    <dt>Circulation record</dt>
                    <dd>
                      {proofBundle.circulationRecord?.summary ??
                        "No external circulation has been logged yet."}
                    </dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>Source discovery mission</dt>
                <dd>
                  {proofBundle.sourceDiscoveryMissionId ?? "Not recorded yet."}
                </dd>
              </div>
              {isSpecializedReporting ? (
                <div>
                  <dt>Source reporting mission</dt>
                  <dd>
                    {proofBundle.sourceReportingMissionId ??
                      "Not recorded yet."}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Source question kind</dt>
                <dd>
                  {proofBundle.questionKind &&
                  isFinanceDiscoveryQuestionKind(proofBundle.questionKind)
                    ? readFinanceDiscoveryQuestionKindLabel(
                        proofBundle.questionKind,
                      )
                    : "Not recorded yet."}
                </dd>
              </div>
              {isSpecializedReporting ? (
                <div>
                  <dt>Linked appendix posture</dt>
                  <dd>
                    {proofBundle.appendixPresent
                      ? "Linked from the source reporting mission."
                      : "Linked appendix posture not recorded yet."}
                  </dd>
                </div>
              ) : (
                <>
                  <div>
                    <dt>Publication posture</dt>
                    <dd>
                      {reportingPublication?.summary ??
                        "Draft reporting publication posture has not been recorded yet."}
                    </dd>
                  </div>
                  <div>
                    <dt>Memo page</dt>
                    <dd>
                      {reportingPublication?.filedMemo?.pageKey ?? "Not filed"}
                    </dd>
                  </div>
                  <div>
                    <dt>Appendix page</dt>
                    <dd>
                      {reportingPublication?.filedEvidenceAppendix?.pageKey ??
                        "Not filed"}
                    </dd>
                  </div>
                  <div>
                    <dt>Markdown export</dt>
                    <dd>
                      {reportingPublication?.latestMarkdownExport
                        ? reportingPublication.latestMarkdownExport
                            .includesLatestFiledArtifacts
                          ? `Run ${reportingPublication.latestMarkdownExport.exportRunId}`
                          : `Run ${reportingPublication.latestMarkdownExport.exportRunId} (predates latest filing)`
                        : "No export run recorded"}
                    </dd>
                  </div>
                </>
              )}
              {proofBundle.questionKind === "policy_lookup" ||
              proofBundle.policySourceId ? (
                <PolicySourceScopeFields
                  fallbackPolicySourceId={proofBundle.policySourceId}
                  scope={proofBundle.policySourceScope}
                />
              ) : null}
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
              <div>
                <dt>
                  {isSpecializedReporting ? "Linked appendix" : "Appendix"}
                </dt>
                <dd>
                  {proofBundle.appendixPresent
                    ? isSpecializedReporting
                      ? "Linked"
                      : "Stored"
                    : "Pending"}
                </dd>
              </div>
            </>
          ) : financeProofBundle ? (
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
              {proofBundle.questionKind === "policy_lookup" ||
              proofBundle.policySourceId ? (
                <PolicySourceScopeFields
                  fallbackPolicySourceId={proofBundle.policySourceId}
                  scope={proofBundle.policySourceScope}
                />
              ) : null}
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
          {monitorInvestigationProofBundle && monitorInvestigation ? (
            <>
              <div>
                <dt>Freshness posture</dt>
                <dd>{monitorInvestigation.sourceFreshnessPosture.summary}</dd>
              </div>
              <div>
                <dt>Lineage summary</dt>
                <dd>{monitorInvestigation.sourceLineageSummary}</dd>
              </div>
              <div>
                <dt>Limitations</dt>
                <dd>{monitorInvestigation.limitations.join(" ")}</dd>
              </div>
            </>
          ) : reportProofBundle ? (
            <>
              <div>
                <dt>Report summary</dt>
                <dd>{proofBundle.reportSummary || "Not recorded yet."}</dd>
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
          ) : financeProofBundle ? (
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
            {reportProofBundle ||
            financeProofBundle ||
            monitorInvestigationProofBundle ? (
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

        {reportProofBundle ||
        financeProofBundle ||
        monitorInvestigationProofBundle ? (
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

function MonitorInvestigationCard(input: {
  seed: NonNullable<MissionCardProps["proofBundle"]["monitorInvestigation"]>;
}) {
  const seed = input.seed;

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="kicker">Monitor alert source</p>
          <h2>
            Stored {readMonitorInvestigationMonitorLabel(seed.monitorKind)}{" "}
            alert
          </h2>
        </div>
        <StatusPill
          label={seed.alertSeverity}
          tone={seed.alertSeverity === "critical" ? "warn" : "default"}
        />
      </div>

      <p className="muted">{seed.deterministicSeverityRationale}</p>

      <div className="meta-grid">
        <div>
          <dt>Source ref</dt>
          <dd>{seed.sourceRef}</dd>
        </div>
        <div>
          <dt>Freshness state</dt>
          <dd>{readFreshnessLabel(seed.sourceFreshnessPosture.state)}</dd>
        </div>
        <div>
          <dt>Lineage refs</dt>
          <dd>{seed.sourceLineageRefs.length}</dd>
        </div>
        <div>
          <dt>Proof posture</dt>
          <dd>{seed.proofBundlePosture.state}</dd>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Conditions</h3>
        <ul className="list-clean">
          {seed.conditions.map((condition) => (
            <li key={`${condition.kind}:${condition.summary}`}>
              <strong>{condition.kind}</strong> · {condition.summary}
            </li>
          ))}
        </ul>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Source posture</h3>
        <p className="muted">{seed.sourceFreshnessPosture.summary}</p>
        <p className="muted">{seed.sourceLineageSummary}</p>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Limitations</h3>
        <ul className="list-clean">
          {seed.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Human review next step</h3>
        <p className="muted">{seed.humanReviewNextStep}</p>
      </div>
    </section>
  );
}

function readMonitorInvestigationMonitorLabel(
  monitorKind: NonNullable<
    MissionCardProps["proofBundle"]["monitorInvestigation"]
  >["monitorKind"],
) {
  if (monitorKind === "collections_pressure") {
    return "collections-pressure";
  }

  return "cash-posture";
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
  if (proofBundle.monitorInvestigation) {
    if (proofBundle.status === "ready") {
      return "The proof bundle is a monitor-alert investigation handoff package sourced from the stored monitor result, with freshness, lineage, limitations, proof posture, and human review next step preserved.";
    }

    return "The monitor-alert investigation proof posture is incomplete. Review the stored monitor result before relying on this mission.";
  }

  if (proofBundle.reportKind === "diligence_packet") {
    if (proofBundle.status === "ready") {
      return "The proof bundle now reads like a draft diligence-packet review package with source reporting lineage, linked appendix posture, carried freshness, and visible limitations tied together.";
    }

    if (proofBundle.status === "failed") {
      return "The current draft diligence-packet bundle is non-decision-ready. Review the source reporting lineage, linked appendix posture, and mission evidence before retrying.";
    }

    if (proofBundle.status === "incomplete") {
      return "The bundle is partially assembled, but the draft diligence-packet package is still missing its stored diligence_packet artifact.";
    }

    return "The diligence-packet proof bundle is still at the placeholder stage and has not yet accumulated persisted packet evidence.";
  }

  if (proofBundle.reportKind === "board_packet") {
    if (proofBundle.status === "ready") {
      return "The proof bundle now reads like a draft board-packet review package with source reporting lineage, linked appendix posture, carried freshness, and visible limitations tied together.";
    }

    if (proofBundle.status === "failed") {
      return "The current draft board-packet bundle is non-decision-ready. Review the source reporting lineage, linked appendix posture, and mission evidence before retrying.";
    }

    if (proofBundle.status === "incomplete") {
      return "The bundle is partially assembled, but the draft board-packet package is still missing its stored board_packet artifact.";
    }

    return "The board-packet proof bundle is still at the placeholder stage and has not yet accumulated persisted packet evidence.";
  }

  if (proofBundle.reportKind === "lender_update") {
    if (proofBundle.status === "ready") {
      return "The proof bundle now reads like a draft lender-update review package with source reporting lineage, linked appendix posture, carried freshness, and visible limitations tied together.";
    }

    if (proofBundle.status === "failed") {
      return "The current draft lender-update bundle is non-decision-ready. Review the source reporting lineage, linked appendix posture, and mission evidence before retrying.";
    }

    if (proofBundle.status === "incomplete") {
      return "The bundle is partially assembled, but the draft lender-update package is still missing its stored lender_update artifact.";
    }

    return "The lender-update proof bundle is still at the placeholder stage and has not yet accumulated persisted packet evidence.";
  }

  if (proofBundle.reportKind) {
    if (proofBundle.status === "ready") {
      return "The proof bundle now reads like a draft reporting package with source discovery lineage, memo summary, appendix linkage, freshness posture, and visible limitations tied together.";
    }

    if (proofBundle.status === "failed") {
      return "The current draft reporting bundle is non-decision-ready. Review the source discovery lineage, carried limitations, and mission evidence before retrying.";
    }

    if (proofBundle.status === "incomplete") {
      return "The bundle is partially assembled, but the draft reporting package is still missing the memo or appendix artifact.";
    }

    return "The reporting proof bundle is still at the placeholder stage and has not yet accumulated draft memo evidence.";
  }

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
    proofBundle.reportKind === null &&
    proofBundle.monitorInvestigation === null &&
    (proofBundle.companyKey !== null ||
      isFinanceDiscoveryQuestionKind(proofBundle.questionKind))
  );
}
