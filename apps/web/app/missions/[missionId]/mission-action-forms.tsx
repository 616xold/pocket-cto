"use client";

import React, { useActionState } from "react";
import {
  INITIAL_MISSION_ACTION_STATE,
  type MissionActionState,
} from "../../../lib/operator-actions";
import {
  submitExportReportingMissionMarkdown,
  submitFileReportingMissionArtifacts,
  submitApprovalResolution,
  submitCreateDraftBoardPacket,
  submitCreateDraftDiligencePacket,
  submitCreateDraftFinanceMemo,
  submitCreateDraftLenderUpdate,
  submitRecordReportingCirculationLogCorrection,
  submitRecordReportingCirculationLog,
  submitRecordReportingReleaseLog,
  submitRequestReportingCirculationApproval,
  submitRequestReportingReleaseApproval,
  submitTaskInterrupt,
} from "./actions";
import { ActionFeedback } from "./action-feedback";
import { ActionSubmitButton } from "./action-submit-button";

type ApprovalActionFormProps = {
  approvalId: string;
  disabled: boolean;
  missionId: string;
  operatorIdentity: string;
};

type TaskInterruptFormProps = {
  disabled: boolean;
  missionId: string;
  operatorIdentity: string;
  taskId: string;
};

type CreateReportFormProps = {
  operatorIdentity: string;
  sourceDiscoveryMissionId: string;
};

type CreateBoardPacketFormProps = {
  operatorIdentity: string;
  sourceReportingMissionId: string;
};

type CreateLenderUpdateFormProps = {
  operatorIdentity: string;
  sourceReportingMissionId: string;
};

type CreateDiligencePacketFormProps = {
  operatorIdentity: string;
  sourceReportingMissionId: string;
};

type ExportReportingMarkdownFormProps = {
  missionId: string;
  operatorIdentity: string;
};

type FileReportingArtifactsFormProps = {
  missionId: string;
  operatorIdentity: string;
};

type RequestReportingReleaseApprovalFormProps = {
  missionId: string;
  operatorIdentity: string;
  reportKind: "lender_update" | "diligence_packet";
};

type RequestReportingCirculationApprovalFormProps = {
  missionId: string;
  operatorIdentity: string;
  reportKind: "board_packet";
};

type RecordReportingReleaseLogFormProps = {
  missionId: string;
  operatorIdentity: string;
  reportKind: "lender_update" | "diligence_packet";
};

type RecordReportingCirculationLogFormProps = {
  missionId: string;
  operatorIdentity: string;
  reportKind: "board_packet";
};

type RecordReportingCirculationLogCorrectionFormProps = {
  missionId: string;
  operatorIdentity: string;
  reportKind: "board_packet";
};

export function ApprovalActionForm({
  approvalId,
  disabled,
  missionId,
  operatorIdentity,
}: ApprovalActionFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitApprovalResolution,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="approvalId" type="hidden" value={approvalId} />
        <input name="resolvedBy" type="hidden" value={operatorIdentity} />

        <div className="button-row">
          <ActionSubmitButton
            className="action-button"
            disabled={disabled}
            label="Approve"
            name="decision"
            pendingLabel="Submitting..."
            value="accept"
          />
          <ActionSubmitButton
            className="action-button secondary"
            disabled={disabled}
            label="Decline"
            name="decision"
            pendingLabel="Submitting..."
            value="decline"
          />
        </div>
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function TaskInterruptForm({
  disabled,
  missionId,
  operatorIdentity,
  taskId,
}: TaskInterruptFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitTaskInterrupt,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="requestedBy" type="hidden" value={operatorIdentity} />
        <input name="taskId" type="hidden" value={taskId} />

        <ActionSubmitButton
          className="action-button secondary"
          disabled={disabled}
          label="Interrupt task"
          pendingLabel="Requesting interrupt..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function CreateReportForm({
  operatorIdentity,
  sourceDiscoveryMissionId,
}: CreateReportFormProps) {
  return (
    <form action={submitCreateDraftFinanceMemo} className="stack">
      <input
        name="sourceDiscoveryMissionId"
        type="hidden"
        value={sourceDiscoveryMissionId}
      />
      <input name="requestedBy" type="hidden" value={operatorIdentity} />

      <ActionSubmitButton
        className="action-button"
        label="Create draft finance memo"
        pendingLabel="Creating draft memo..."
      />
    </form>
  );
}

export function CreateBoardPacketForm({
  operatorIdentity,
  sourceReportingMissionId,
}: CreateBoardPacketFormProps) {
  return (
    <form action={submitCreateDraftBoardPacket} className="stack">
      <input
        name="sourceReportingMissionId"
        type="hidden"
        value={sourceReportingMissionId}
      />
      <input name="requestedBy" type="hidden" value={operatorIdentity} />

      <ActionSubmitButton
        className="action-button"
        label="Create draft board packet"
        pendingLabel="Creating board packet..."
      />
    </form>
  );
}

export function CreateLenderUpdateForm({
  operatorIdentity,
  sourceReportingMissionId,
}: CreateLenderUpdateFormProps) {
  return (
    <form action={submitCreateDraftLenderUpdate} className="stack">
      <input
        name="sourceReportingMissionId"
        type="hidden"
        value={sourceReportingMissionId}
      />
      <input name="requestedBy" type="hidden" value={operatorIdentity} />

      <ActionSubmitButton
        className="action-button"
        label="Create draft lender update"
        pendingLabel="Creating lender update..."
      />
    </form>
  );
}

export function CreateDiligencePacketForm({
  operatorIdentity,
  sourceReportingMissionId,
}: CreateDiligencePacketFormProps) {
  return (
    <form action={submitCreateDraftDiligencePacket} className="stack">
      <input
        name="sourceReportingMissionId"
        type="hidden"
        value={sourceReportingMissionId}
      />
      <input name="requestedBy" type="hidden" value={operatorIdentity} />

      <ActionSubmitButton
        className="action-button"
        label="Create draft diligence packet"
        pendingLabel="Creating diligence packet..."
      />
    </form>
  );
}

export function FileReportingArtifactsForm({
  missionId,
  operatorIdentity,
}: FileReportingArtifactsFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitFileReportingMissionArtifacts,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="filedBy" type="hidden" value={operatorIdentity} />

        <ActionSubmitButton
          className="action-button"
          label="File draft memo into CFO Wiki"
          pendingLabel="Filing draft artifacts..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function ExportReportingMarkdownForm({
  missionId,
  operatorIdentity,
}: ExportReportingMarkdownFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitExportReportingMissionMarkdown,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="triggeredBy" type="hidden" value={operatorIdentity} />

        <ActionSubmitButton
          className="action-button secondary"
          label="Export markdown bundle"
          pendingLabel="Exporting markdown bundle..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function RequestReportingReleaseApprovalForm({
  missionId,
  operatorIdentity,
  reportKind,
}: RequestReportingReleaseApprovalFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitRequestReportingReleaseApproval,
    INITIAL_MISSION_ACTION_STATE,
  );
  const releaseApprovalLabel =
    reportKind === "diligence_packet"
      ? "Request diligence packet release approval"
      : "Request lender update release approval";
  const pendingLabel =
    reportKind === "diligence_packet"
      ? "Requesting diligence packet release approval..."
      : "Requesting lender update release approval...";

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="reportKind" type="hidden" value={reportKind} />
        <input name="requestedBy" type="hidden" value={operatorIdentity} />

        <ActionSubmitButton
          className="action-button"
          label={releaseApprovalLabel}
          pendingLabel={pendingLabel}
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function RequestReportingCirculationApprovalForm({
  missionId,
  operatorIdentity,
  reportKind,
}: RequestReportingCirculationApprovalFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitRequestReportingCirculationApproval,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="reportKind" type="hidden" value={reportKind} />
        <input name="requestedBy" type="hidden" value={operatorIdentity} />

        <ActionSubmitButton
          className="action-button"
          label="Request board packet circulation approval"
          pendingLabel="Requesting board packet circulation approval..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function RecordReportingReleaseLogForm({
  missionId,
  operatorIdentity,
  reportKind,
}: RecordReportingReleaseLogFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitRecordReportingReleaseLog,
    INITIAL_MISSION_ACTION_STATE,
  );
  const releaseLogLabel =
    reportKind === "diligence_packet"
      ? "Record diligence packet as released"
      : "Record lender update as released";
  const pendingLabel =
    reportKind === "diligence_packet"
      ? "Recording diligence release..."
      : "Recording lender release...";

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="releasedBy" type="hidden" value={operatorIdentity} />
        <input name="reportKind" type="hidden" value={reportKind} />

        <label className="stack" htmlFor={`release-channel-${missionId}`}>
          <span>Release channel</span>
          <input
            className="text-input"
            defaultValue="email"
            id={`release-channel-${missionId}`}
            name="releaseChannel"
            required
            type="text"
          />
        </label>

        <label className="stack" htmlFor={`release-note-${missionId}`}>
          <span>Release note</span>
          <textarea
            className="text-input"
            id={`release-note-${missionId}`}
            name="releaseNote"
            placeholder="Optional context about the externally completed release."
            rows={3}
          />
        </label>

        <ActionSubmitButton
          className="action-button"
          label={releaseLogLabel}
          pendingLabel={pendingLabel}
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function RecordReportingCirculationLogForm({
  missionId,
  operatorIdentity,
  reportKind,
}: RecordReportingCirculationLogFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitRecordReportingCirculationLog,
    INITIAL_MISSION_ACTION_STATE,
  );

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="circulatedBy" type="hidden" value={operatorIdentity} />
        <input name="reportKind" type="hidden" value={reportKind} />

        <label className="stack" htmlFor={`circulation-channel-${missionId}`}>
          <span>Circulation channel</span>
          <input
            className="text-input"
            defaultValue="email"
            id={`circulation-channel-${missionId}`}
            name="circulationChannel"
            required
            type="text"
          />
        </label>

        <label className="stack" htmlFor={`circulation-note-${missionId}`}>
          <span>Circulation note</span>
          <textarea
            className="text-input"
            id={`circulation-note-${missionId}`}
            name="circulationNote"
            placeholder="Optional context about the externally completed circulation."
            rows={3}
          />
        </label>

        <ActionSubmitButton
          className="action-button"
          label="Record board packet as circulated"
          pendingLabel="Recording board circulation..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}

export function RecordReportingCirculationLogCorrectionForm({
  missionId,
  operatorIdentity,
  reportKind,
}: RecordReportingCirculationLogCorrectionFormProps) {
  const [result, formAction] = useActionState<MissionActionState, FormData>(
    submitRecordReportingCirculationLogCorrection,
    INITIAL_MISSION_ACTION_STATE,
  );
  const [correctionKey] = React.useState(() => crypto.randomUUID());

  return (
    <div className="action-cluster">
      <form action={formAction} className="stack">
        <input name="missionId" type="hidden" value={missionId} />
        <input name="correctedBy" type="hidden" value={operatorIdentity} />
        <input name="reportKind" type="hidden" value={reportKind} />
        <input name="correctionKey" type="hidden" value={correctionKey} />

        <label className="stack" htmlFor={`correction-reason-${missionId}`}>
          <span>Correction reason</span>
          <textarea
            className="text-input"
            id={`correction-reason-${missionId}`}
            name="correctionReason"
            placeholder="Why does the stored circulation record need a chronology correction?"
            required
            rows={3}
          />
        </label>

        <label
          className="stack"
          htmlFor={`corrected-circulated-at-${missionId}`}
        >
          <span>Correct circulated at</span>
          <input
            className="text-input"
            id={`corrected-circulated-at-${missionId}`}
            name="circulatedAt"
            placeholder="2026-04-22T12:00:00+00:00"
            type="text"
          />
        </label>

        <label
          className="stack"
          htmlFor={`corrected-circulated-by-${missionId}`}
        >
          <span>Correct circulated-by actor</span>
          <input
            className="text-input"
            id={`corrected-circulated-by-${missionId}`}
            name="circulatedBy"
            placeholder="board-chair@example.com"
            type="text"
          />
        </label>

        <label
          className="stack"
          htmlFor={`corrected-circulation-channel-${missionId}`}
        >
          <span>Correct circulation channel</span>
          <input
            className="text-input"
            id={`corrected-circulation-channel-${missionId}`}
            name="circulationChannel"
            placeholder="email"
            type="text"
          />
        </label>

        <label
          className="stack"
          htmlFor={`corrected-circulation-note-${missionId}`}
        >
          <span>Correct circulation note</span>
          <textarea
            className="text-input"
            id={`corrected-circulation-note-${missionId}`}
            name="circulationNote"
            placeholder="Optional corrected note. Leave any field blank to keep the current effective value."
            rows={3}
          />
        </label>

        <label
          className="stack"
          htmlFor={`clear-circulation-note-${missionId}`}
        >
          <span>Clear effective circulation note</span>
          <input
            id={`clear-circulation-note-${missionId}`}
            name="clearCirculationNote"
            type="checkbox"
            value="on"
          />
          <span className="muted">
            Use this only to remove the current effective note. Leave the
            corrected note blank when this is checked.
          </span>
        </label>

        <ActionSubmitButton
          className="action-button"
          label="Correct board packet circulation record"
          pendingLabel="Recording circulation correction..."
        />
      </form>

      <ActionFeedback result={result} />
    </div>
  );
}
