import React from "react";
import Link from "next/link";
import type { MissionListItem } from "@pocket-cto/domain";
import {
  isFinanceDiscoveryQuestionKind,
  readFinanceDiscoveryQuestionKindLabel,
  readReportingMissionReportKindLabel,
} from "@pocket-cto/domain";
import { PolicySourceScopeFields } from "./policy-source-scope-fields";
import { readFreshnessLabel } from "./freshness-label";
import { StatusPill } from "./status-pill";

type MissionListCardProps = {
  mission: MissionListItem;
};

export function MissionListCard({ mission }: MissionListCardProps) {
  const isReportingMission = mission.reportKind !== null;
  const isDiligencePacket = mission.reportKind === "diligence_packet";
  const isBoardPacket = mission.reportKind === "board_packet";
  const isLenderUpdate = mission.reportKind === "lender_update";
  const effectiveCirculationRecord =
    mission.circulationChronology?.effectiveRecord ?? mission.circulationRecord;
  const supportsCirculationApproval = isBoardPacket;
  const supportsReleaseApproval = isLenderUpdate || isDiligencePacket;
  const supportsReleaseLog = isLenderUpdate || isDiligencePacket;
  const isSpecializedReporting =
    isBoardPacket || isLenderUpdate || isDiligencePacket;
  const isFinanceMission = mission.companyKey !== null;
  const questionKindLabel =
    mission.questionKind && isFinanceDiscoveryQuestionKind(mission.questionKind)
      ? readFinanceDiscoveryQuestionKindLabel(mission.questionKind)
      : mission.questionKind;

  return (
    <article className="mission-summary-card">
      <div className="mission-summary-header">
        <div>
          <p className="kicker" style={{ marginBottom: 6 }}>
            {humanizeLabel(mission.sourceKind)}
          </p>
          <h3 className="card-title">
            <Link href={`/missions/${mission.id}`} className="link-inline">
              {mission.title}
            </Link>
          </h3>
        </div>
        <StatusPill
          label={mission.status}
          tone={readMissionTone(mission.status)}
        />
      </div>

      <p className="mission-summary-copy">{mission.objectiveExcerpt}</p>

      {(mission.reportSummary ?? mission.answerSummary) ? (
        <p className="muted mission-summary-inline">
          {mission.reportSummary ?? mission.answerSummary}
        </p>
      ) : null}

      {mission.reportPublication?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.reportPublication.summary}
        </p>
      ) : null}

      {mission.releaseReadiness?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.releaseReadiness.summary}
        </p>
      ) : null}

      {mission.circulationReadiness?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.circulationReadiness.summary}
        </p>
      ) : null}

      {mission.circulationRecord?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.circulationRecord.summary}
        </p>
      ) : null}

      {mission.circulationChronology?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.circulationChronology.summary}
        </p>
      ) : null}

      {mission.releaseRecord?.summary ? (
        <p className="muted mission-summary-inline">
          {mission.releaseRecord.summary}
        </p>
      ) : null}

      {mission.sourceRef ? (
        <p className="muted mission-summary-inline">
          Source: {mission.sourceRef}
        </p>
      ) : null}

      <dl className="mission-summary-meta">
        {isReportingMission ? (
          <>
            <div>
              <dt>Company</dt>
              <dd>{mission.companyKey}</dd>
            </div>
            <div>
              <dt>Report kind</dt>
              <dd>
                {mission.reportKind
                  ? readReportingMissionReportKindLabel(mission.reportKind)
                  : "Pending report kind"}
              </dd>
            </div>
            <div>
              <dt>Source question</dt>
              <dd>{questionKindLabel ?? "Pending question"}</dd>
            </div>
            <div>
              <dt>Draft posture</dt>
              <dd>{mission.reportDraftStatus ?? "Not recorded yet."}</dd>
            </div>
            <div>
              <dt>{isSpecializedReporting ? "Linked appendix" : "Appendix"}</dt>
              <dd>
                {mission.appendixPresent
                  ? isSpecializedReporting
                    ? "Linked"
                    : "Stored"
                  : "Pending"}
              </dd>
            </div>
            {isSpecializedReporting ? (
              <div>
                <dt>Source reporting</dt>
                <dd>
                  {mission.sourceReportingMissionId ?? "Not recorded yet."}
                </dd>
              </div>
            ) : (
              <>
                <div>
                  <dt>Memo page</dt>
                  <dd>
                    {mission.reportPublication?.filedMemo?.pageKey ??
                      "Not filed"}
                  </dd>
                </div>
                <div>
                  <dt>Appendix page</dt>
                  <dd>
                    {mission.reportPublication?.filedEvidenceAppendix
                      ?.pageKey ?? "Not filed"}
                  </dd>
                </div>
                <div>
                  <dt>Markdown export</dt>
                  <dd>
                    {mission.reportPublication?.latestMarkdownExport
                      ? mission.reportPublication.latestMarkdownExport
                          .includesLatestFiledArtifacts
                        ? "Recorded"
                        : "Recorded before latest filing"
                      : "Not exported"}
                  </dd>
                </div>
              </>
            )}
            {supportsReleaseApproval ? (
              <>
                <div>
                  <dt>Release approval</dt>
                  <dd>
                    {mission.releaseReadiness?.releaseApprovalStatus ??
                      "not_requested"}
                  </dd>
                </div>
                <div>
                  <dt>Release ready</dt>
                  <dd>
                    {mission.releaseReadiness?.releaseReady ? "Yes" : "No"}
                  </dd>
                </div>
                {supportsReleaseLog ? (
                  <div>
                    <dt>Release logged</dt>
                    <dd>{mission.releaseRecord?.released ? "Yes" : "No"}</dd>
                  </div>
                ) : null}
              </>
            ) : null}
            {supportsCirculationApproval ? (
              <>
                <div>
                  <dt>Circulation approval</dt>
                  <dd>
                    {mission.circulationReadiness?.circulationApprovalStatus ??
                      "not_requested"}
                  </dd>
                </div>
                <div>
                  <dt>Circulation ready</dt>
                  <dd>
                    {mission.circulationReadiness?.circulationReady
                      ? "Yes"
                      : "No"}
                  </dd>
                </div>
                <div>
                  <dt>Circulation logged</dt>
                  <dd>
                    {mission.circulationRecord?.circulated ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt>Original circulated by</dt>
                  <dd>
                    {mission.circulationRecord?.circulatedBy ??
                      "Not logged yet."}
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
                  <dd>{mission.circulationChronology?.correctionCount ?? 0}</dd>
                </div>
              </>
            ) : null}
            <div>
              <dt>Source discovery</dt>
              <dd>{mission.sourceDiscoveryMissionId ?? "Not recorded yet."}</dd>
            </div>
            <div>
              <dt>Freshness</dt>
              <dd>
                {readFreshnessLabel(mission.freshnessState ?? "pending_answer")}
              </dd>
            </div>
          </>
        ) : isFinanceMission ? (
          <>
            <div>
              <dt>Company</dt>
              <dd>{mission.companyKey}</dd>
            </div>
            <div>
              <dt>Question kind</dt>
              <dd>{questionKindLabel ?? "Pending question"}</dd>
            </div>
            {mission.questionKind === "policy_lookup" ||
            mission.policySourceId ? (
              <PolicySourceScopeFields
                fallbackPolicySourceId={mission.policySourceId}
                scope={mission.policySourceScope}
              />
            ) : null}
            <div>
              <dt>Freshness</dt>
              <dd>
                {readFreshnessLabel(mission.freshnessState ?? "pending_answer")}
              </dd>
            </div>
          </>
        ) : (
          <div>
            <dt>Repo</dt>
            <dd>{mission.primaryRepo ?? "Pending repo target"}</dd>
          </div>
        )}
        <div>
          <dt>Created</dt>
          <dd>{mission.createdAt}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{mission.updatedAt}</dd>
        </div>
      </dl>

      <div className="mission-summary-badges">
        <StatusPill
          label={`proof ${mission.proofBundleStatus}`}
          tone={readProofTone(mission.proofBundleStatus)}
        />
        {mission.pendingApprovalCount > 0 ? (
          <StatusPill
            label={`${mission.pendingApprovalCount} pending approval${mission.pendingApprovalCount === 1 ? "" : "s"}`}
            tone="warn"
          />
        ) : (
          <StatusPill label="no pending approvals" />
        )}
      </div>

      <div className="mission-summary-footer">
        <p className="muted" style={{ marginBottom: 0 }}>
          {readLatestTaskLabel(mission)}
        </p>
        <div className="button-row">
          {mission.pullRequestUrl && mission.pullRequestNumber ? (
            <a
              className="button outline"
              href={mission.pullRequestUrl}
              rel="noreferrer"
              target="_blank"
            >
              PR #{mission.pullRequestNumber}
            </a>
          ) : null}
          <Link href={`/missions/${mission.id}`} className="button outline">
            Open mission
          </Link>
        </div>
      </div>
    </article>
  );
}

function readLatestTaskLabel(mission: MissionListItem) {
  if (!mission.latestTask) {
    return "Task materialization is still pending.";
  }

  return `Latest task: Task ${mission.latestTask.sequence} · ${mission.latestTask.role} · ${mission.latestTask.status}`;
}

function humanizeLabel(value: string) {
  return value.replaceAll("_", " ");
}

function readMissionTone(status: MissionListItem["status"]) {
  if (status === "succeeded") {
    return "good" as const;
  }

  if (status === "failed" || status === "cancelled") {
    return "warn" as const;
  }

  return "default" as const;
}

function readProofTone(status: MissionListItem["proofBundleStatus"]) {
  if (status === "ready") {
    return "good" as const;
  }

  if (status === "failed") {
    return "warn" as const;
  }

  return "default" as const;
}
