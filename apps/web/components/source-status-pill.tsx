import React from "react";
import type {
  SourceIngestRunStatus,
  SourceSnapshotIngestStatus,
} from "@pocket-cto/domain";
import { readSourceStatusTone } from "../lib/source-formatters";
import { StatusPill } from "./status-pill";

type SourceStatusPillProps = {
  labelPrefix?: string;
  status: SourceIngestRunStatus | SourceSnapshotIngestStatus;
};

export function SourceStatusPill({
  labelPrefix,
  status,
}: SourceStatusPillProps) {
  const label = labelPrefix ? `${labelPrefix}: ${status}` : status;
  return <StatusPill label={label} tone={readSourceStatusTone(status)} />;
}
