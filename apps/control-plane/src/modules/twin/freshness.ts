import type {
  TwinFreshnessSlice,
  TwinFreshnessSliceName,
  TwinFreshnessSlices,
  TwinFreshnessState,
  TwinFreshnessSummary,
  TwinRepositoryFreshnessRollup,
  TwinRepositoryFreshnessView,
  TwinRepositorySummary,
  TwinSyncRun,
} from "@pocket-cto/domain";

type EmptySnapshotReason = {
  reasonCode: string;
  summaryFragment: string;
};

const freshnessPolicies: Record<
  TwinFreshnessSliceName,
  { label: string; staleAfterSeconds: number }
> = {
  metadata: {
    label: "repository metadata",
    staleAfterSeconds: 6 * 60 * 60,
  },
  ownership: {
    label: "ownership",
    staleAfterSeconds: 12 * 60 * 60,
  },
  workflows: {
    label: "workflows",
    staleAfterSeconds: 12 * 60 * 60,
  },
  testSuites: {
    label: "test suites",
    staleAfterSeconds: 12 * 60 * 60,
  },
  docs: {
    label: "docs",
    staleAfterSeconds: 24 * 60 * 60,
  },
  runbooks: {
    label: "runbooks",
    staleAfterSeconds: 24 * 60 * 60,
  },
};

const freshnessSliceOrder: TwinFreshnessSliceName[] = [
  "metadata",
  "ownership",
  "workflows",
  "testSuites",
  "docs",
  "runbooks",
];

const freshnessScoreByState: Record<TwinFreshnessState, number> = {
  never_synced: 0,
  fresh: 100,
  stale: 50,
  failed: 0,
};

const rollupPriority: Record<TwinFreshnessState, number> = {
  failed: 0,
  never_synced: 1,
  stale: 2,
  fresh: 3,
};

export function buildTwinFreshnessSlice(input: {
  emptySnapshotReason?: EmptySnapshotReason | null;
  latestRun: TwinSyncRun | null;
  latestSuccessfulRun: TwinSyncRun | null;
  now: Date;
  slice: TwinFreshnessSliceName;
}): TwinFreshnessSlice {
  const policy = freshnessPolicies[input.slice];
  const latestRun = input.latestRun;
  const latestSuccessfulRun = input.latestSuccessfulRun;
  const latestCompletedAt = latestRun?.completedAt ?? null;
  const latestSuccessfulCompletedAt =
    latestSuccessfulRun?.completedAt ?? latestSuccessfulRun?.startedAt ?? null;
  const ageSeconds = latestSuccessfulCompletedAt
    ? diffSeconds(input.now, latestSuccessfulCompletedAt)
    : null;

  if (!latestRun) {
    return {
      state: "never_synced",
      scorePercent: freshnessScoreByState.never_synced,
      latestRunId: null,
      latestRunStatus: null,
      latestCompletedAt: null,
      latestSuccessfulRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: policy.staleAfterSeconds,
      reasonCode: "not_synced",
      reasonSummary: `No successful ${policy.label} sync has been recorded yet.`,
    };
  }

  if (latestRun.status === "failed") {
    return {
      state: "failed",
      scorePercent: freshnessScoreByState.failed,
      latestRunId: latestRun.id,
      latestRunStatus: latestRun.status,
      latestCompletedAt,
      latestSuccessfulRunId: latestSuccessfulRun?.id ?? null,
      latestSuccessfulCompletedAt,
      ageSeconds,
      staleAfterSeconds: policy.staleAfterSeconds,
      reasonCode: "latest_run_failed",
      reasonSummary: latestSuccessfulRun
        ? `Latest ${policy.label} sync failed; the last successful snapshot is ${describeAge(ageSeconds)} old.`
        : `Latest ${policy.label} sync failed before any successful snapshot was stored.`,
    };
  }

  if (!latestSuccessfulRun) {
    return {
      state: "never_synced",
      scorePercent: freshnessScoreByState.never_synced,
      latestRunId: latestRun.id,
      latestRunStatus: latestRun.status,
      latestCompletedAt,
      latestSuccessfulRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: policy.staleAfterSeconds,
      reasonCode:
        latestRun.status === "running" ? "sync_in_progress" : "not_synced",
      reasonSummary:
        latestRun.status === "running"
          ? `A ${policy.label} sync is running, but no successful snapshot exists yet.`
          : `No successful ${policy.label} sync has been recorded yet.`,
    };
  }

  const state =
    ageSeconds !== null && ageSeconds > policy.staleAfterSeconds
      ? "stale"
      : "fresh";
  const summaryPrefix = `Latest successful ${policy.label} snapshot is ${state}.`;

  let reasonCode =
    state === "stale"
      ? "latest_successful_sync_stale"
      : "latest_successful_sync_fresh";
  let reasonSummary =
    state === "stale"
      ? `Latest successful ${policy.label} sync is older than the ${describeDuration(policy.staleAfterSeconds)} freshness window.`
      : `Latest successful ${policy.label} sync is within the ${describeDuration(policy.staleAfterSeconds)} freshness window.`;

  if (
    latestRun.status === "running" &&
    latestRun.id !== latestSuccessfulRun.id
  ) {
    reasonCode = "sync_in_progress";
    reasonSummary = `${summaryPrefix} A newer sync is still running.`;
  } else if (input.emptySnapshotReason) {
    reasonCode = input.emptySnapshotReason.reasonCode;
    reasonSummary = `${summaryPrefix} It ${input.emptySnapshotReason.summaryFragment}`;
  }

  return {
    state,
    scorePercent: freshnessScoreByState[state],
    latestRunId: latestRun.id,
    latestRunStatus: latestRun.status,
    latestCompletedAt,
    latestSuccessfulRunId: latestSuccessfulRun.id,
    latestSuccessfulCompletedAt,
    ageSeconds,
    staleAfterSeconds: policy.staleAfterSeconds,
    reasonCode,
    reasonSummary,
  };
}

export function buildTwinRepositoryFreshnessRollup(input: {
  slices: TwinFreshnessSlices;
}): TwinRepositoryFreshnessRollup {
  return buildTwinFreshnessRollupForEntries(
    freshnessSliceOrder.map((sliceName) => ({
      sliceName,
      slice: input.slices[sliceName],
    })),
  );
}

export function buildTwinFreshnessRollupForEntries(
  entries: Array<{
    sliceName: TwinFreshnessSliceName;
    slice: TwinFreshnessSlice;
  }>,
): TwinRepositoryFreshnessRollup {
  const freshSliceCount = entries.filter(
    (entry) => entry.slice.state === "fresh",
  ).length;
  const staleSliceCount = entries.filter(
    (entry) => entry.slice.state === "stale",
  ).length;
  const failedSliceCount = entries.filter(
    (entry) => entry.slice.state === "failed",
  ).length;
  const neverSyncedSliceCount = entries.filter(
    (entry) => entry.slice.state === "never_synced",
  ).length;
  const blockingSlices = entries
    .filter((entry) => entry.slice.state !== "fresh")
    .map((entry) => entry.sliceName);
  const state = pickRollupState({
    failedSliceCount,
    neverSyncedSliceCount,
    staleSliceCount,
  });
  const representative = pickRepresentativeSlice(entries, state);
  const scorePercent = Math.min(
    ...entries.map((entry) => entry.slice.scorePercent),
  );
  const reasonCode =
    state === "failed"
      ? "rollup_failed"
      : state === "never_synced"
        ? "rollup_never_synced"
        : state === "stale"
          ? "rollup_stale"
          : "rollup_fresh";
  const reasonSummary =
    state === "failed"
      ? `Latest failed twin syncs block freshness for: ${formatSliceNames(blockingSlices.filter((sliceName) => getRequiredEntry(entries, sliceName).slice.state === "failed"))}.`
      : state === "never_synced"
        ? `No successful twin snapshot exists yet for: ${formatSliceNames(blockingSlices.filter((sliceName) => getRequiredEntry(entries, sliceName).slice.state === "never_synced"))}.`
        : state === "stale"
          ? `Stale twin slices are visible for: ${formatSliceNames(blockingSlices.filter((sliceName) => getRequiredEntry(entries, sliceName).slice.state === "stale"))}.`
          : "All scored twin slices are within their freshness windows.";

  return {
    state,
    scorePercent,
    latestRunStatus: representative.latestRunStatus,
    ageSeconds: representative.ageSeconds,
    staleAfterSeconds: representative.staleAfterSeconds,
    reasonCode,
    reasonSummary,
    freshSliceCount,
    staleSliceCount,
    failedSliceCount,
    neverSyncedSliceCount,
    blockingSlices,
  };
}

export function buildTwinFreshnessSummary(
  input: Pick<
    TwinFreshnessSlice | TwinRepositoryFreshnessRollup,
    | "state"
    | "scorePercent"
    | "latestRunStatus"
    | "ageSeconds"
    | "staleAfterSeconds"
    | "reasonCode"
    | "reasonSummary"
  >,
): TwinFreshnessSummary {
  return {
    state: input.state,
    scorePercent: input.scorePercent,
    latestRunStatus: input.latestRunStatus,
    ageSeconds: input.ageSeconds,
    staleAfterSeconds: input.staleAfterSeconds,
    reasonCode: input.reasonCode,
    reasonSummary: input.reasonSummary,
  };
}

export function buildTwinRepositoryFreshnessView(input: {
  repository: TwinRepositorySummary;
  slices: TwinFreshnessSlices;
}): TwinRepositoryFreshnessView {
  return {
    repository: input.repository,
    rollup: buildTwinRepositoryFreshnessRollup({
      slices: input.slices,
    }),
    slices: input.slices,
  };
}

function pickRollupState(input: {
  failedSliceCount: number;
  neverSyncedSliceCount: number;
  staleSliceCount: number;
}): TwinFreshnessState {
  if (input.failedSliceCount > 0) {
    return "failed";
  }

  if (input.neverSyncedSliceCount > 0) {
    return "never_synced";
  }

  if (input.staleSliceCount > 0) {
    return "stale";
  }

  return "fresh";
}

function pickRepresentativeSlice(
  entries: Array<{
    sliceName: TwinFreshnessSliceName;
    slice: TwinFreshnessSlice;
  }>,
  rollupState: TwinFreshnessState,
) {
  const matchingEntries = entries.filter(
    (entry) => entry.slice.state === rollupState,
  );

  if (matchingEntries.length === 0) {
    return entries[0]!.slice;
  }

  return matchingEntries.slice().sort((left, right) => {
    const ageDelta =
      (right.slice.ageSeconds ?? -1) - (left.slice.ageSeconds ?? -1);

    if (ageDelta !== 0) {
      return ageDelta;
    }

    return (
      freshnessSliceOrder.indexOf(left.sliceName) -
      freshnessSliceOrder.indexOf(right.sliceName)
    );
  })[0]!.slice;
}

function diffSeconds(now: Date, isoTimestamp: string) {
  const nowMs = now.getTime();
  const thenMs = Date.parse(isoTimestamp);

  if (Number.isNaN(thenMs)) {
    return null;
  }

  return Math.max(0, Math.floor((nowMs - thenMs) / 1000));
}

function describeAge(ageSeconds: number | null) {
  if (ageSeconds === null) {
    return "unknown";
  }

  return describeDuration(ageSeconds);
}

function describeDuration(seconds: number) {
  if (seconds % 86_400 === 0) {
    return `${seconds / 86_400}d`;
  }

  if (seconds % 3_600 === 0) {
    return `${seconds / 3_600}h`;
  }

  if (seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }

  return `${seconds}s`;
}

function formatSliceNames(sliceNames: TwinFreshnessSliceName[]) {
  return sliceNames.map(formatSliceName).join(", ");
}

function formatSliceName(sliceName: TwinFreshnessSliceName) {
  return sliceName === "testSuites" ? "test suites" : sliceName;
}

export function getTwinFreshnessPolicy(sliceName: TwinFreshnessSliceName) {
  return freshnessPolicies[sliceName];
}

export function compareFreshnessState(
  left: TwinFreshnessState,
  right: TwinFreshnessState,
) {
  return rollupPriority[left] - rollupPriority[right];
}

function getRequiredEntry(
  entries: Array<{
    sliceName: TwinFreshnessSliceName;
    slice: TwinFreshnessSlice;
  }>,
  sliceName: TwinFreshnessSliceName,
) {
  const entry = entries.find((candidate) => candidate.sliceName === sliceName);

  if (!entry) {
    throw new Error(`Twin freshness slice ${sliceName} was not provided`);
  }

  return entry;
}
