"use client";

import { useActionState } from "react";
import {
  INITIAL_MISSION_ACTION_STATE,
  type MissionActionState,
} from "../../../lib/operator-actions";
import { submitApprovalResolution, submitTaskInterrupt } from "./actions";
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
