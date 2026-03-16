import React from "react";
import type { MissionListItem } from "@pocket-cto/domain";
import { MissionListCard } from "./mission-list-card";

type MissionListProps = {
  emptyHeading?: string;
  emptyMessage?: string;
  missions: MissionListItem[];
};

export function MissionList({
  emptyHeading = "No missions yet",
  emptyMessage = "Create one from text to start the operator flow.",
  missions,
}: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="mission-list-empty">
        <h3>{emptyHeading}</h3>
        <p className="muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mission-list">
      {missions.map((mission) => (
        <MissionListCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
}
