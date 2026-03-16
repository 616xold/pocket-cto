import React from "react";
import Link from "next/link";
import type { MissionListItem } from "@pocket-cto/domain";
import { StatusPill } from "./status-pill";

type MissionListCardProps = {
  mission: MissionListItem;
};

export function MissionListCard({ mission }: MissionListCardProps) {
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

      {mission.sourceRef ? (
        <p className="muted mission-summary-inline">Source: {mission.sourceRef}</p>
      ) : null}

      <dl className="mission-summary-meta">
        <div>
          <dt>Repo</dt>
          <dd>{mission.primaryRepo ?? "Pending repo target"}</dd>
        </div>
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
