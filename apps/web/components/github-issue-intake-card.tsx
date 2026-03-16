import React from "react";
import Link from "next/link";
import type { GitHubIssueIntakeItem } from "@pocket-cto/domain";
import { submitGitHubIssueMissionCreate } from "../app/missions/actions";
import { StatusPill } from "./status-pill";

type GitHubIssueIntakeCardProps = {
  issue: GitHubIssueIntakeItem;
};

export function GitHubIssueIntakeCard({ issue }: GitHubIssueIntakeCardProps) {
  return (
    <article className="issue-intake-card">
      <div className="mission-summary-header">
        <div>
          <p className="kicker" style={{ marginBottom: 6 }}>
            GitHub issue
          </p>
          <h3 className="card-title">
            <a
              href={issue.sourceRef}
              className="link-inline"
              rel="noreferrer"
              target="_blank"
            >
              {issue.issueTitle}
            </a>
          </h3>
        </div>
        <StatusPill label={issue.issueState} tone={readIssueTone(issue.issueState)} />
      </div>

      <p className="mission-summary-copy">
        Repo target: <code>{issue.repoFullName}</code> · Issue #{issue.issueNumber}
      </p>

      <dl className="mission-summary-meta">
        <div>
          <dt>Sender</dt>
          <dd>{issue.senderLogin ?? "GitHub sender unavailable"}</dd>
        </div>
        <div>
          <dt>Comments</dt>
          <dd>{readCommentLabel(issue)}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd>{issue.receivedAt}</dd>
        </div>
      </dl>

      <div className="mission-summary-badges">
        {issue.isBound ? (
          <StatusPill
            label={`mission ${issue.boundMissionStatus ?? "bound"}`}
            tone={readMissionTone(issue.boundMissionStatus)}
          />
        ) : (
          <StatusPill label="unbound" />
        )}
        {issue.hasCommentActivity ? (
          <StatusPill label="comment activity" />
        ) : (
          <StatusPill label="no comment activity" />
        )}
      </div>

      <div className="mission-summary-footer">
        <p className="muted" style={{ marginBottom: 0 }}>
          {issue.isBound && issue.boundMissionId
            ? `Already bound to mission ${issue.boundMissionId}.`
            : "Stored issue envelopes stay durable until you decide to create the mission."}
        </p>
        <div className="button-row">
          <a
            className="button outline"
            href={issue.sourceRef}
            rel="noreferrer"
            target="_blank"
          >
            Open issue
          </a>
          {issue.isBound && issue.boundMissionId ? (
            <Link href={`/missions/${issue.boundMissionId}`} className="button outline">
              Open mission
            </Link>
          ) : (
            <form action={submitGitHubIssueMissionCreate} className="inline-action-form">
              <input type="hidden" name="deliveryId" value={issue.deliveryId} />
              <button className="button primary" type="submit">
                Create mission
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

function readCommentLabel(issue: GitHubIssueIntakeItem) {
  if (issue.commentCount !== null) {
    return `${issue.commentCount} comment${issue.commentCount === 1 ? "" : "s"}`;
  }

  return issue.hasCommentActivity ? "comment activity recorded" : "no comments";
}

function readIssueTone(state: string) {
  return state === "open" ? ("good" as const) : ("default" as const);
}

function readMissionTone(status: GitHubIssueIntakeItem["boundMissionStatus"]) {
  if (status === "succeeded") {
    return "good" as const;
  }

  if (status === "failed" || status === "cancelled") {
    return "warn" as const;
  }

  return "default" as const;
}
