import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import { getWebOperatorIdentity } from "../../../lib/operator-identity";
import {
  ApprovalActionForm,
  TaskInterruptForm,
} from "./mission-action-forms";

type MissionActionsProps = Pick<
  MissionDetailView,
  "approvals" | "liveControl" | "mission" | "tasks"
>;

export function MissionActions({
  approvals,
  liveControl,
  mission,
  tasks,
}: MissionActionsProps) {
  const operatorIdentity = getWebOperatorIdentity();
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending",
  );
  const runningTasks = tasks.filter((task) => task.status === "running");
  const controlsUnavailable = !liveControl.enabled;

  return (
    <section className="card">
      <h2>Operator actions</h2>
      <p className="muted">
        {controlsUnavailable
          ? `Actions are unavailable while the control-plane server is running in ${liveControl.mode} mode. Run pnpm dev:embedded to enable local approval resolution and task interrupts.`
          : "These controls call the current approval-resolution and task-interrupt routes, then refresh the mission detail without optimistic updates."}
      </p>
      <p className="muted" style={{ marginTop: 10 }}>
        Actions are recorded as <code>{operatorIdentity}</code>. Set{" "}
        <code>POCKET_CTO_WEB_OPERATOR_NAME</code> in your local env if you want
        a different operator label in approval and interrupt records.
      </p>

      <div className="stack" style={{ marginTop: 18 }}>
        {pendingApprovals.length === 0 ? (
          <p className="muted">No pending approvals need a decision.</p>
        ) : (
          pendingApprovals.map((approval) => (
            <div key={approval.id} className="task-row">
              <div>
                <strong>{approval.kind}</strong>
                <p className="muted" style={{ marginTop: 4 }}>
                  Requested by {approval.requestedBy} at {approval.createdAt}
                </p>
              </div>

              <ApprovalActionForm
                approvalId={approval.id}
                disabled={controlsUnavailable}
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
