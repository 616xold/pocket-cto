const FRESHNESS_LABELS = {
  failed: "Failed",
  fresh: "Fresh",
  missing: "Missing",
  mixed: "Mixed",
  never_synced: "Never synced",
  pending_answer: "Pending answer",
  stale: "Stale",
} as const;

export function readFreshnessLabel(state: string | null | undefined) {
  if (!state) {
    return "Not recorded yet.";
  }

  return (
    FRESHNESS_LABELS[state as keyof typeof FRESHNESS_LABELS] ??
    state
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
