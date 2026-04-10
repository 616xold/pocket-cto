import type {
  FinanceFreshnessSummary,
  FinanceFreshnessView,
  FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";

const STALE_AFTER_SECONDS = 24 * 60 * 60;

type SliceRuns = {
  latestRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulRun: FinanceTwinSyncRunRecord | null;
};

export function buildFinanceFreshnessView(input: {
  chartOfAccounts: SliceRuns;
  now: Date;
  trialBalance: SliceRuns;
}): FinanceFreshnessView {
  const trialBalance = buildSliceFreshnessSummary({
    now: input.now,
    ...input.trialBalance,
    sliceLabel: "trial-balance",
  });
  const chartOfAccounts = buildSliceFreshnessSummary({
    now: input.now,
    ...input.chartOfAccounts,
    sliceLabel: "chart-of-accounts",
  });

  return {
    overall: buildOverallFreshnessSummary({
      chartOfAccounts,
      now: input.now,
      slices: [input.trialBalance, input.chartOfAccounts],
      trialBalance,
    }),
    trialBalance,
    chartOfAccounts,
  };
}

function buildSliceFreshnessSummary(
  input: SliceRuns & { now: Date; sliceLabel: string },
) {
  const latestCompletedAt = input.latestRun?.completedAt ?? null;
  const latestSuccessfulCompletedAt =
    input.latestSuccessfulRun?.completedAt ??
    input.latestSuccessfulRun?.startedAt ??
    null;
  const ageSeconds = latestSuccessfulCompletedAt
    ? diffSeconds(input.now, latestSuccessfulCompletedAt)
    : null;

  if (!input.latestRun) {
    return {
      state: "missing",
      latestSyncRunId: null,
      latestSyncStatus: null,
      latestCompletedAt: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: STALE_AFTER_SECONDS,
      reasonCode: "not_synced",
      reasonSummary: `No finance twin sync has been recorded yet for the ${input.sliceLabel} slice.`,
    } satisfies FinanceFreshnessSummary;
  }

  if (input.latestRun.status === "failed") {
    return {
      state: "failed",
      latestSyncRunId: input.latestRun.id,
      latestSyncStatus: input.latestRun.status,
      latestCompletedAt,
      latestSuccessfulSyncRunId: input.latestSuccessfulRun?.id ?? null,
      latestSuccessfulCompletedAt,
      ageSeconds,
      staleAfterSeconds: STALE_AFTER_SECONDS,
      reasonCode: "latest_sync_failed",
      reasonSummary: input.latestSuccessfulRun
        ? `The latest ${input.sliceLabel} sync failed after an earlier successful snapshot was stored.`
        : `The latest ${input.sliceLabel} sync failed before any successful finance snapshot was stored.`,
    } satisfies FinanceFreshnessSummary;
  }

  if (!input.latestSuccessfulRun || !latestSuccessfulCompletedAt) {
    return {
      state: "missing",
      latestSyncRunId: input.latestRun.id,
      latestSyncStatus: input.latestRun.status,
      latestCompletedAt,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulCompletedAt: null,
      ageSeconds: null,
      staleAfterSeconds: STALE_AFTER_SECONDS,
      reasonCode: "no_successful_sync",
      reasonSummary: `No successful ${input.sliceLabel} sync has completed yet for this company.`,
    } satisfies FinanceFreshnessSummary;
  }

  const stale =
    ageSeconds !== null && ageSeconds > STALE_AFTER_SECONDS;

  return {
    state: stale ? "stale" : "fresh",
    latestSyncRunId: input.latestRun.id,
    latestSyncStatus: input.latestRun.status,
    latestCompletedAt,
    latestSuccessfulSyncRunId: input.latestSuccessfulRun.id,
    latestSuccessfulCompletedAt,
    ageSeconds,
    staleAfterSeconds: STALE_AFTER_SECONDS,
    reasonCode: stale
      ? "latest_successful_sync_stale"
      : "latest_successful_sync_fresh",
    reasonSummary: stale
      ? `The latest successful ${input.sliceLabel} sync is older than the 24 hour freshness window.`
      : `The latest successful ${input.sliceLabel} sync is within the 24 hour freshness window.`,
  } satisfies FinanceFreshnessSummary;
}

function buildOverallFreshnessSummary(input: {
  chartOfAccounts: FinanceFreshnessSummary;
  now: Date;
  slices: SliceRuns[];
  trialBalance: FinanceFreshnessSummary;
}) {
  const latestRun = selectLatestRun(input.slices.map((slice) => slice.latestRun));
  const latestSuccessfulRun = selectLatestRun(
    input.slices.map((slice) => slice.latestSuccessfulRun),
  );
  const latestCompletedAt = latestRun?.completedAt ?? null;
  const latestSuccessfulCompletedAt =
    latestSuccessfulRun?.completedAt ?? latestSuccessfulRun?.startedAt ?? null;
  const ageSeconds = latestSuccessfulCompletedAt
    ? diffSeconds(input.now, latestSuccessfulCompletedAt)
    : null;
  const sliceStates = [input.trialBalance.state, input.chartOfAccounts.state];
  const state = sliceStates.includes("failed")
    ? "failed"
    : sliceStates.includes("missing")
      ? "missing"
      : sliceStates.includes("stale")
        ? "stale"
        : "fresh";

  return {
    state,
    latestSyncRunId: latestRun?.id ?? null,
    latestSyncStatus: latestRun?.status ?? null,
    latestCompletedAt,
    latestSuccessfulSyncRunId: latestSuccessfulRun?.id ?? null,
    latestSuccessfulCompletedAt,
    ageSeconds,
    staleAfterSeconds: STALE_AFTER_SECONDS,
    reasonCode: buildOverallReasonCode(state),
    reasonSummary: buildOverallReasonSummary(state),
  } satisfies FinanceFreshnessSummary;
}

function buildOverallReasonCode(
  state: FinanceFreshnessSummary["state"],
) {
  switch (state) {
    case "failed":
      return "implemented_slice_failed";
    case "missing":
      return "implemented_slice_missing";
    case "stale":
      return "implemented_slice_stale";
    case "fresh":
      return "implemented_slices_fresh";
  }
}

function buildOverallReasonSummary(
  state: FinanceFreshnessSummary["state"],
) {
  switch (state) {
    case "failed":
      return "At least one implemented finance slice has a failed latest sync.";
    case "missing":
      return "At least one implemented finance slice has not completed a successful sync yet.";
    case "stale":
      return "At least one implemented finance slice is older than the 24 hour freshness window.";
    case "fresh":
      return "The implemented finance slices are within the 24 hour freshness window.";
  }
}

function selectLatestRun(
  runs: Array<FinanceTwinSyncRunRecord | null>,
) {
  return runs
    .filter((run): run is FinanceTwinSyncRunRecord => run !== null)
    .sort((left, right) => {
      return (
        right.startedAt.localeCompare(left.startedAt) ||
        right.createdAt.localeCompare(left.createdAt) ||
        left.id.localeCompare(right.id)
      );
    })[0] ?? null;
}

function diffSeconds(now: Date, earlierIso: string) {
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(earlierIso).getTime()) / 1000),
  );
}
