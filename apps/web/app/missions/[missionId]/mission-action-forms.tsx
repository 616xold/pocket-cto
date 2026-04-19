"use client";

import { useActionState } from "react";
import {
  INITIAL_MISSION_ACTION_STATE,
  type MissionActionState,
} from "../../../lib/operator-actions";
import {
  submitExportReportingMissionMarkdown,
  submitFileReportingMissionArtifacts,
  submitApprovalResolution,
  submitCreateDraftBoardPacket,
  submitCreateDraftFinanceMemo,
  submitCreateDraftLenderUpdate,
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

type ExportReportingMarkdownFormProps = {
  missionId: string;
  operatorIdentity: string;
};

type FileReportingArtifactsFormProps = {
  missionId: string;
  operatorIdentity: string;
};

export function ApprovalActionForm({
  approvalId,
  disabled,
  missionId,
  operatorIdentity,
}: ApprovalActionFormProps) {
  const [result, formAction] = useActionState<
    MissionActionState,
    FormData
  >(submitApprovalResolution, INITIAL_MISSION_ACTION_STATE);

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
  const [result, formAction] = useActionState<
    MissionActionState,
    FormData
  >(submitTaskInterrupt, INITIAL_MISSION_ACTION_STATE);

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

export function FileReportingArtifactsForm({
  missionId,
  operatorIdentity,
}: FileReportingArtifactsFormProps) {
  const [result, formAction] = useActionState<
    MissionActionState,
    FormData
  >(submitFileReportingMissionArtifacts, INITIAL_MISSION_ACTION_STATE);

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
  const [result, formAction] = useActionState<
    MissionActionState,
    FormData
  >(submitExportReportingMissionMarkdown, INITIAL_MISSION_ACTION_STATE);

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
