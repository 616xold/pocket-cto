import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import { isFinanceDiscoveryAnswerArtifactMetadata } from "@pocket-cto/domain";
import { getWebOperatorIdentity } from "../../../lib/operator-identity";
import {
  ApprovalActionForm,
  CreateBoardPacketForm,
  CreateDiligencePacketForm,
  CreateLenderUpdateForm,
  CreateReportForm,
  ExportReportingMarkdownForm,
  FileReportingArtifactsForm,
  RecordReportingReleaseLogForm,
  RequestReportingReleaseApprovalForm,
  TaskInterruptForm,
} from "./mission-action-forms";

type MissionActionsProps = Pick<
  MissionDetailView,
  | "approvalCards"
  | "discoveryAnswer"
  | "liveControl"
  | "mission"
  | "reporting"
  | "tasks"
>;

export function MissionActions({
  approvalCards,
  discoveryAnswer,
  liveControl,
  mission,
  reporting,
  tasks,
}: MissionActionsProps) {
  const operatorIdentity = getWebOperatorIdentity();
  const pendingApprovals = approvalCards.filter(
    (approval) => approval.status === "pending",
  );
  const runningTasks = tasks.filter((task) => task.status === "running");
  const controlsUnavailable = !liveControl.enabled;
  const canCreateDraftFinanceMemo =
    mission.type === "discovery" &&
    mission.status === "succeeded" &&
    isFinanceDiscoveryAnswerArtifactMetadata(discoveryAnswer);
  const canCreateDraftBoardPacket =
    mission.type === "reporting" &&
    mission.status === "succeeded" &&
    reporting?.reportKind === "finance_memo" &&
    Boolean(reporting.financeMemo && reporting.evidenceAppendix);
  const canCreateDraftLenderUpdate = canCreateDraftBoardPacket;
  const canCreateDraftDiligencePacket = canCreateDraftBoardPacket;
  const canFileDraftArtifacts =
    mission.type === "reporting" &&
    mission.status === "succeeded" &&
    reporting?.reportKind === "finance_memo" &&
    Boolean(reporting?.publication?.storedDraft) &&
    !(
      reporting?.publication?.filedMemo &&
      reporting.publication.filedEvidenceAppendix
    );
  const canExportMarkdownBundle =
    mission.type === "reporting" &&
    mission.status === "succeeded" &&
    reporting?.reportKind === "finance_memo" &&
    Boolean(
      reporting?.publication?.filedMemo &&
      reporting.publication.filedEvidenceAppendix,
    );
  const canRequestReportReleaseApproval =
    mission.type === "reporting" &&
    mission.status === "succeeded" &&
    ((reporting?.reportKind === "lender_update" &&
      Boolean(reporting?.lenderUpdate)) ||
      (reporting?.reportKind === "diligence_packet" &&
        Boolean(reporting?.diligencePacket))) &&
    reporting.releaseReadiness?.releaseApprovalStatus === "not_requested";
  const canRecordReportingReleaseLog =
    mission.type === "reporting" &&
    mission.status === "succeeded" &&
    ((reporting?.reportKind === "lender_update" &&
      Boolean(reporting.lenderUpdate)) ||
      (reporting?.reportKind === "diligence_packet" &&
        Boolean(reporting.diligencePacket))) &&
    reporting.releaseReadiness?.releaseApprovalStatus ===
      "approved_for_release" &&
    reporting.releaseRecord?.released !== true;
  const reportingFollowOnOutOfScopeNote =
    reporting?.reportKind === "board_packet"
      ? "Board packet missions remain draft-only in F5C1. Filing, markdown export, approval, release, PDF, and slide actions stay out of scope here."
      : "Reporting follow-on actions are available only from completed finance memo missions in the shipped F5A through F5C4D path.";

  return (
    <section className="card">
      <h2>Operator actions</h2>
      <p className="muted" style={{ marginTop: 10 }}>
        Actions are recorded as <code>{operatorIdentity}</code>. Set{" "}
        <code>POCKET_CTO_WEB_OPERATOR_NAME</code> in your local env if you want
        a different operator label in approval and interrupt records.
      </p>

      {canCreateDraftFinanceMemo ? (
        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Create reporting</h3>
          <p className="muted">
            Create one draft-only finance memo and one linked evidence appendix
            from this completed discovery mission and its stored evidence.
          </p>
          <CreateReportForm
            operatorIdentity={operatorIdentity}
            sourceDiscoveryMissionId={mission.id}
          />
        </div>
      ) : null}

      {mission.type === "reporting" ? (
        <div className="stack" style={{ marginTop: 18 }}>
          <h3>Reporting follow-on</h3>
          {canCreateDraftBoardPacket ? (
            <>
              <p className="muted">
                Create one draft-only board packet from this completed finance
                memo reporting mission and its stored memo plus evidence
                appendix only.
              </p>
              <CreateBoardPacketForm
                operatorIdentity={operatorIdentity}
                sourceReportingMissionId={mission.id}
              />
              <p className="muted">
                Create one draft-only lender update from this completed finance
                memo reporting mission and its stored memo plus evidence
                appendix only.
              </p>
              {canCreateDraftLenderUpdate ? (
                <CreateLenderUpdateForm
                  operatorIdentity={operatorIdentity}
                  sourceReportingMissionId={mission.id}
                />
              ) : null}
              <p className="muted">
                Create one draft-only diligence packet from this completed
                finance memo reporting mission and its stored memo plus evidence
                appendix only.
              </p>
              {canCreateDraftDiligencePacket ? (
                <CreateDiligencePacketForm
                  operatorIdentity={operatorIdentity}
                  sourceReportingMissionId={mission.id}
                />
              ) : null}
            </>
          ) : null}
          {reporting?.reportKind === "finance_memo" ? (
            <>
              <p className="muted">
                Filing and export remain explicit operator actions. They reuse
                the existing CFO Wiki filed-page and markdown export seams
                without changing the stored draft artifacts or F5A proof
                readiness.
              </p>
              {canFileDraftArtifacts ? (
                <FileReportingArtifactsForm
                  missionId={mission.id}
                  operatorIdentity={operatorIdentity}
                />
              ) : reporting?.publication?.storedDraft ? (
                <p className="muted">
                  Draft memo and appendix are already filed into the CFO Wiki.
                </p>
              ) : (
                <p className="muted">
                  Draft filing becomes available once the reporting mission has
                  both stored artifacts and a company scope.
                </p>
              )}
              {canExportMarkdownBundle ? (
                <ExportReportingMarkdownForm
                  missionId={mission.id}
                  operatorIdentity={operatorIdentity}
                />
              ) : (
                <p className="muted">
                  Markdown export becomes available after both draft artifacts
                  are filed into the CFO Wiki.
                </p>
              )}
            </>
          ) : reporting?.reportKind === "lender_update" ? (
            <>
              <p className="muted">
                This first real F5C4B slice keeps lender updates delivery-free
                and runtime-free, but it does allow one persisted
                release-approval path plus one external release-log path from
                one completed lender-update reporting mission with one stored
                lender_update artifact.
              </p>
              {canRequestReportReleaseApproval ? (
                <RequestReportingReleaseApprovalForm
                  missionId={mission.id}
                  operatorIdentity={operatorIdentity}
                  reportKind="lender_update"
                />
              ) : canRecordReportingReleaseLog ? (
                <>
                  <p className="muted">
                    Pocket CFO still does not send or distribute the lender
                    update. This action only records that release happened
                    externally after approval.
                  </p>
                  <RecordReportingReleaseLogForm
                    missionId={mission.id}
                    operatorIdentity={operatorIdentity}
                    reportKind="lender_update"
                  />
                </>
              ) : (
                <p className="muted">
                  {reporting?.releaseRecord?.summary ??
                    reporting?.releaseReadiness?.summary ??
                    "Release approval becomes available once the stored lender update is present and no prior release approval request exists for this mission."}
                </p>
              )}
            </>
          ) : reporting?.reportKind === "diligence_packet" ? (
            <>
              <p className="muted">
                This first real F5C4D slice keeps diligence packets
                delivery-free and runtime-free, but it does allow one
                persisted release-approval path plus one external release-log
                path from one completed diligence-packet reporting mission with
                one stored diligence_packet artifact. Board circulation, PDF,
                and slide actions stay out of scope here.
              </p>
              {canRequestReportReleaseApproval ? (
                <RequestReportingReleaseApprovalForm
                  missionId={mission.id}
                  operatorIdentity={operatorIdentity}
                  reportKind="diligence_packet"
                />
              ) : canRecordReportingReleaseLog ? (
                <>
                  <p className="muted">
                    Pocket CFO still does not send or distribute the diligence
                    packet. This action only records that release happened
                    externally after approval.
                  </p>
                  <RecordReportingReleaseLogForm
                    missionId={mission.id}
                    operatorIdentity={operatorIdentity}
                    reportKind="diligence_packet"
                  />
                </>
              ) : (
                <p className="muted">
                  {reporting?.releaseRecord?.summary ??
                    reporting?.releaseReadiness?.summary ??
                    "Release approval becomes available once the stored diligence packet is present and no prior release approval request exists for this mission."}
                </p>
              )}
            </>
          ) : (
            <p className="muted">{reportingFollowOnOutOfScopeNote}</p>
          )}
        </div>
      ) : null}

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Approvals and interrupts</h3>
        <p className="muted">
          {controlsUnavailable
            ? `Task interrupts and runtime-backed approval resolution are unavailable while the control-plane server is running in ${liveControl.mode} mode. Persisted report release approvals still resolve without live control.`
            : "These controls call the current approval-resolution and task-interrupt routes, then refresh the mission detail without optimistic updates."}
        </p>
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        {pendingApprovals.length === 0 ? (
          <p className="muted">No pending approvals need a decision.</p>
        ) : (
          pendingApprovals.map((approval) => (
            <div key={approval.approvalId} className="task-row">
              <div>
                <strong>{approval.title}</strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  Requested by {approval.requestedBy} at {approval.requestedAt}
                </p>
                <p className="muted" style={{ marginTop: 4 }}>
                  {approval.summary}
                </p>
              </div>

              <ApprovalActionForm
                approvalId={approval.approvalId}
                disabled={controlsUnavailable && approval.requiresLiveControl}
                missionId={mission.id}
                operatorIdentity={operatorIdentity}
              />
            </div>
          ))
        )}
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        <h3>Interrupt active tasks</h3>
        {runningTasks.length === 0 ? (
          <p className="muted">No running tasks expose an interrupt action.</p>
        ) : (
          runningTasks.map((task) => (
            <div key={task.id} className="task-row">
              <div>
                <strong>
                  Task {task.sequence} · {task.role}
                </strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  Status: {task.status}
                </p>
              </div>

              <TaskInterruptForm
                disabled={controlsUnavailable}
                missionId={mission.id}
                operatorIdentity={operatorIdentity}
                taskId={task.id}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
