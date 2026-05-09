import React from "react";
import { badgeStyle } from "./styles";
import type { ReadOnlyAppMcpFreshness, ReadOnlyAppMcpTone } from "./types";

type FreshnessBadgeProps = {
  freshness: ReadOnlyAppMcpFreshness;
};

export function FreshnessBadge({ freshness }: FreshnessBadgeProps) {
  const label = readFreshnessLabel(freshness.state);

  return (
    <span
      aria-label={`Freshness: ${label}. ${freshness.summary}`}
      style={badgeStyle(readFreshnessTone(freshness))}
    >
      Freshness: {label}
    </span>
  );
}

function readFreshnessLabel(state: ReadOnlyAppMcpFreshness["state"]) {
  if (state === "fresh") return "Fresh";
  if (state === "stale") return "Stale";
  if (state === "unsupported") return "Unsupported";
  return "Missing";
}

function readFreshnessTone(
  freshness: ReadOnlyAppMcpFreshness,
): ReadOnlyAppMcpTone {
  if (freshness.state === "fresh") return "fresh";
  if (freshness.state === "stale") return "warning";
  if (freshness.state === "unsupported") return "danger";
  return "proof";
}
