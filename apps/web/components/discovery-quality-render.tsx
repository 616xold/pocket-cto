import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { MissionDetailView, MissionListItem } from "@pocket-cto/domain";
import { DiscoveryAnswerCard } from "./discovery-answer-card";
import { MissionCard } from "./mission-card";
import { MissionListCard } from "./mission-list-card";

type MissionCardRenderInput = Pick<
  MissionDetailView,
  | "approvalCards"
  | "artifacts"
  | "discoveryAnswer"
  | "liveControl"
  | "mission"
  | "proofBundle"
  | "tasks"
>;

export function renderDiscoveryAnswerCardMarkup(input: {
  answer: MissionDetailView["discoveryAnswer"];
  mission: MissionDetailView["mission"];
}) {
  return renderToStaticMarkup(
    <DiscoveryAnswerCard answer={input.answer} mission={input.mission} />,
  );
}

export function renderMissionCardMarkup(input: MissionCardRenderInput) {
  return renderToStaticMarkup(<MissionCard {...input} />);
}

export function renderMissionListCardMarkup(input: {
  mission: MissionListItem;
}) {
  return renderToStaticMarkup(<MissionListCard mission={input.mission} />);
}
