import React from "react";
import type { MissionDetailView } from "@pocket-cto/domain";
import { StatusPill } from "./status-pill";

type ApprovalCardListProps = Pick<MissionDetailView, "approvalCards">;

export function ApprovalCardList({ approvalCards }: ApprovalCardListProps) {
  if (approvalCards.length === 0) {
    return <p className="muted">No persisted approvals for this mission yet.</p>;
  }

  return (
    <>
      {approvalCards.map((approval) => (
        <article key={approval.approvalId} className="task-row">
          <div>
            <p className="kicker" style={{ marginBottom: 6 }}>
              {humanizeKind(approval.kind)}
            </p>
            <strong>{approval.title}</strong>
            <p className="muted" style={{ marginTop: 6 }}>
              {approval.summary}
            </p>
            <p className="muted" style={{ marginTop: 6 }}>
              Requested by {approval.requestedBy} at {approval.requestedAt}
            </p>
            {renderContextLine(approval)}
            {approval.actionHint ? (
              <p className="muted" style={{ marginTop: 6 }}>
                Action hint: {approval.actionHint}
              </p>
            ) : null}
            {!approval.requiresLiveControl && approval.status === "pending" ? (
              <p className="muted" style={{ marginTop: 6 }}>
                This approval resolves from persisted mission state and does not
                require live runtime control.
              </p>
            ) : null}
            {approval.resolutionSummary ? (
              <p className="muted" style={{ marginTop: 6 }}>
                {approval.resolutionSummary}
              </p>
            ) : null}
          </div>
          <StatusPill
            label={approval.status}
            tone={readStatusTone(approval.status)}
          />
        </article>
      ))}
    </>
  );
}

function renderContextLine(
  approval: MissionDetailView["approvalCards"][number],
) {
  const parts = [
    approval.task?.label ?? null,
    approval.repoContext?.repoLabel ?? null,
    approval.repoContext?.branchName ?? null,
    approval.repoContext?.pullRequestNumber
      ? `PR #${approval.repoContext.pullRequestNumber}`
      : null,
  ].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const prUrl = approval.repoContext?.pullRequestUrl;
  const prLabel = approval.repoContext?.pullRequestNumber
    ? `PR #${approval.repoContext.pullRequestNumber}`
    : null;
  const text = parts.join(" · ");

  if (!prUrl || !prLabel) {
    return (
      <p className="muted" style={{ marginTop: 6 }}>
        {text}
      </p>
    );
  }

  return (
    <p className="muted" style={{ marginTop: 6 }}>
      {parts.slice(0, -1).join(" · ")}
      {parts.length > 1 ? " · " : ""}
      <a href={prUrl} target="_blank" rel="noreferrer">
        {prLabel}
      </a>
    </p>
  );
}

function humanizeKind(kind: MissionDetailView["approvalCards"][number]["kind"]) {
  return kind.replaceAll("_", " ");
}

function readStatusTone(status: string) {
  if (status === "approved") {
    return "good" as const;
  }

  if (status === "declined" || status === "cancelled" || status === "expired") {
    return "warn" as const;
  }

  return "default" as const;
}
