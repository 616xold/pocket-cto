import {
  FinanceReconciliationReadinessViewSchema,
  type FinanceFreshnessSummary,
  type FinanceFreshnessView,
  type FinanceGeneralLedgerEntryView,
  type FinanceLatestSuccessfulGeneralLedgerSlice,
  type FinanceLatestSuccessfulTrialBalanceSlice,
  type FinanceLedgerAccountRecord,
  type FinanceReconciliationAccountRow,
  type FinanceReconciliationComparabilityView,
  type FinanceReconciliationReadinessView,
  type FinanceReconciliationFreshnessView,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import {
  buildGeneralLedgerActivityByAccountId,
  type GeneralLedgerActivityByAccount,
} from "./general-ledger-activity";
import { buildFinanceSliceAlignment } from "./slice-alignment";

export function buildFinanceReconciliationReadinessView(input: {
  company: FinanceReconciliationReadinessView["company"];
  freshness: FinanceFreshnessView;
  generalLedgerEntries: FinanceGeneralLedgerEntryView[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  limitations: string[];
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}): FinanceReconciliationReadinessView {
  const sliceAlignment = buildFinanceSliceAlignment({
    latestSources: [
      input.trialBalanceSlice.latestSource,
      input.generalLedgerSlice.latestSource,
    ],
    implementedSliceCount: 2,
    subjectLabel: "trial-balance and general-ledger slices",
    viewLabel: "reconciliation-readiness view",
  });
  const generalLedgerActivityByAccountId = buildGeneralLedgerActivityByAccountId(
    input.generalLedgerEntries,
  );
  const accounts = buildReconciliationAccounts({
    generalLedgerActivityByAccountId,
    generalLedgerSlice: input.generalLedgerSlice,
    trialBalanceLineViews: input.trialBalanceLineViews,
  });
  const comparability = buildComparability({
    generalLedgerSlice: input.generalLedgerSlice,
    sliceAlignment,
    trialBalanceSlice: input.trialBalanceSlice,
  });
  const limitations = buildReconciliationLimitations({
    comparability,
    existing: input.limitations,
    generalLedgerSlice: input.generalLedgerSlice,
    sliceAlignment,
    trialBalanceSlice: input.trialBalanceSlice,
  });

  return FinanceReconciliationReadinessViewSchema.parse({
    company: input.company,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
    freshness: buildReconciliationFreshnessView(input.freshness),
    sliceAlignment,
    comparability,
    coverageSummary: buildCoverageSummary(accounts),
    accounts,
    limitations,
  });
}

function buildReconciliationAccounts(input: {
  generalLedgerActivityByAccountId: GeneralLedgerActivityByAccount;
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}) {
  const trialBalanceByAccountId = new Map(
    input.trialBalanceLineViews.map((lineView) => [lineView.ledgerAccount.id, lineView]),
  );
  const ledgerAccountsById = new Map<string, FinanceLedgerAccountRecord>();

  for (const lineView of input.trialBalanceLineViews) {
    ledgerAccountsById.set(lineView.ledgerAccount.id, lineView.ledgerAccount);
  }

  for (const [ledgerAccountId, activity] of input.generalLedgerActivityByAccountId) {
    ledgerAccountsById.set(ledgerAccountId, activity.ledgerAccount);
  }

  return Array.from(ledgerAccountsById.values())
    .sort((left, right) => left.accountCode.localeCompare(right.accountCode))
    .map((ledgerAccount) => {
      const trialBalanceLineView = trialBalanceByAccountId.get(ledgerAccount.id) ?? null;
      const generalLedgerActivity =
        input.generalLedgerActivityByAccountId.get(ledgerAccount.id)?.activity ?? null;
      const presentInTrialBalance = trialBalanceLineView !== null;
      const presentInGeneralLedger = generalLedgerActivity !== null;

      return {
        ledgerAccount,
        trialBalanceLine: trialBalanceLineView?.trialBalanceLine ?? null,
        generalLedgerActivity,
        presentInTrialBalance,
        presentInGeneralLedger,
        trialBalanceOnly: presentInTrialBalance && !presentInGeneralLedger,
        generalLedgerOnly: presentInGeneralLedger && !presentInTrialBalance,
        activityLineageRef:
          presentInGeneralLedger && input.generalLedgerSlice.latestSyncRun
            ? {
                ledgerAccountId: ledgerAccount.id,
                syncRunId: input.generalLedgerSlice.latestSyncRun.id,
              }
            : null,
      } satisfies FinanceReconciliationAccountRow;
    });
}

function buildCoverageSummary(accounts: FinanceReconciliationAccountRow[]) {
  return {
    accountRowCount: accounts.length,
    presentInTrialBalanceCount: accounts.filter(
      (account) => account.presentInTrialBalance,
    ).length,
    presentInGeneralLedgerCount: accounts.filter(
      (account) => account.presentInGeneralLedger,
    ).length,
    overlapCount: accounts.filter(
      (account) => account.presentInTrialBalance && account.presentInGeneralLedger,
    ).length,
    trialBalanceOnlyCount: accounts.filter((account) => account.trialBalanceOnly)
      .length,
    generalLedgerOnlyCount: accounts.filter((account) => account.generalLedgerOnly)
      .length,
  };
}

function buildComparability(input: {
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  sliceAlignment: FinanceReconciliationReadinessView["sliceAlignment"];
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}): FinanceReconciliationComparabilityView {
  const trialBalanceWindow = input.trialBalanceSlice.reportingPeriod
    ? {
        periodKey: input.trialBalanceSlice.reportingPeriod.periodKey,
        label: input.trialBalanceSlice.reportingPeriod.label,
        periodStart: input.trialBalanceSlice.reportingPeriod.periodStart,
        periodEnd: input.trialBalanceSlice.reportingPeriod.periodEnd,
      }
    : null;
  const generalLedgerWindow = input.generalLedgerSlice.summary
    ? {
        earliestEntryDate: input.generalLedgerSlice.summary.earliestEntryDate,
        latestEntryDate: input.generalLedgerSlice.summary.latestEntryDate,
      }
    : null;

  if (
    input.trialBalanceSlice.latestSyncRun === null ||
    input.generalLedgerSlice.latestSyncRun === null
  ) {
    return {
      state: "missing_slice",
      reasonCode: "missing_successful_slice",
      reasonSummary:
        "The latest successful trial-balance or general-ledger slice is missing, so this route can only report readiness gaps.",
      trialBalanceWindow,
      generalLedgerWindow,
      sameSource: input.sliceAlignment.sameSource,
      sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
      sameSyncRun: input.sliceAlignment.sameSyncRun,
      sharedSourceId: input.sliceAlignment.sharedSourceId,
      sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
      sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
    };
  }

  if (!trialBalanceWindow || !generalLedgerWindow) {
    return {
      state: "missing_slice",
      reasonCode: "missing_window_context",
      reasonSummary:
        "The latest successful trial-balance or general-ledger slice is missing window context, so this route can only report readiness gaps.",
      trialBalanceWindow,
      generalLedgerWindow,
      sameSource: input.sliceAlignment.sameSource,
      sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
      sameSyncRun: input.sliceAlignment.sameSyncRun,
      sharedSourceId: input.sliceAlignment.sharedSourceId,
      sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
      sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
    };
  }

  if (trialBalanceWindow.periodStart === null) {
    return {
      state: "coverage_only",
      reasonCode: "trial_balance_period_start_missing",
      reasonSummary:
        "The latest trial-balance slice does not include a period start, so this route stays at coverage and readiness instead of claiming a comparable activity window.",
      trialBalanceWindow,
      generalLedgerWindow,
      sameSource: input.sliceAlignment.sameSource,
      sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
      sameSyncRun: input.sliceAlignment.sameSyncRun,
      sharedSourceId: input.sliceAlignment.sharedSourceId,
      sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
      sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
    };
  }

  if (
    generalLedgerWindow.earliestEntryDate < trialBalanceWindow.periodStart ||
    generalLedgerWindow.latestEntryDate > trialBalanceWindow.periodEnd
  ) {
    return {
      state: "not_comparable",
      reasonCode: "window_mismatch",
      reasonSummary:
        "The latest general-ledger activity window falls outside the latest trial-balance reporting window.",
      trialBalanceWindow,
      generalLedgerWindow,
      sameSource: input.sliceAlignment.sameSource,
      sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
      sameSyncRun: input.sliceAlignment.sameSyncRun,
      sharedSourceId: input.sliceAlignment.sharedSourceId,
      sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
      sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
    };
  }

  if (!input.sliceAlignment.sameSource) {
    return {
      state: "coverage_only",
      reasonCode: "mixed_sources",
      reasonSummary:
        "The latest successful trial-balance and general-ledger slices come from different registered sources, so this route stops at coverage and readiness.",
      trialBalanceWindow,
      generalLedgerWindow,
      sameSource: input.sliceAlignment.sameSource,
      sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
      sameSyncRun: input.sliceAlignment.sameSyncRun,
      sharedSourceId: input.sliceAlignment.sharedSourceId,
      sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
      sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
    };
  }

  return {
    state: "window_comparable",
    reasonCode: "shared_source_window_match",
    reasonSummary:
      "The latest successful trial-balance and general-ledger slices share one registered source, and the general-ledger activity window fits inside the trial-balance reporting window.",
    trialBalanceWindow,
    generalLedgerWindow,
    sameSource: input.sliceAlignment.sameSource,
    sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
    sameSyncRun: input.sliceAlignment.sameSyncRun,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
    sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
    sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
  };
}

function buildReconciliationFreshnessView(
  freshness: FinanceFreshnessView,
): FinanceReconciliationFreshnessView {
  const trialBalance = freshness.trialBalance;
  const generalLedger = freshness.generalLedger;
  const overallState = selectCombinedState([trialBalance, generalLedger]);
  const latestCompletedAt =
    selectLatestIso([trialBalance.latestCompletedAt, generalLedger.latestCompletedAt]) ??
    null;
  const latestSuccessfulCompletedAt =
    selectLatestIso([
      trialBalance.latestSuccessfulCompletedAt,
      generalLedger.latestSuccessfulCompletedAt,
    ]) ?? null;

  return {
    overall: {
      state: overallState,
      latestSyncRunId: selectLatestId([
        {
          id: trialBalance.latestSyncRunId,
          iso: trialBalance.latestCompletedAt,
        },
        {
          id: generalLedger.latestSyncRunId,
          iso: generalLedger.latestCompletedAt,
        },
      ]),
      latestSyncStatus: selectLatestStatus([
        {
          iso: trialBalance.latestCompletedAt,
          status: trialBalance.latestSyncStatus,
        },
        {
          iso: generalLedger.latestCompletedAt,
          status: generalLedger.latestSyncStatus,
        },
      ]),
      latestCompletedAt,
      latestSuccessfulSyncRunId: selectLatestId([
        {
          id: trialBalance.latestSuccessfulSyncRunId,
          iso: trialBalance.latestSuccessfulCompletedAt,
        },
        {
          id: generalLedger.latestSuccessfulSyncRunId,
          iso: generalLedger.latestSuccessfulCompletedAt,
        },
      ]),
      latestSuccessfulCompletedAt,
      ageSeconds: selectCombinedAgeSeconds([trialBalance, generalLedger]),
      staleAfterSeconds: Math.max(
        trialBalance.staleAfterSeconds,
        generalLedger.staleAfterSeconds,
      ),
      reasonCode: buildCombinedReasonCode(overallState),
      reasonSummary: buildCombinedReasonSummary(overallState),
    },
    trialBalance,
    generalLedger,
  };
}

function buildReconciliationLimitations(input: {
  comparability: FinanceReconciliationComparabilityView;
  existing: string[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  sliceAlignment: FinanceReconciliationReadinessView["sliceAlignment"];
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}) {
  const limitations = [...input.existing];

  if (input.trialBalanceSlice.latestSyncRun === null) {
    limitations.push(
      "No successful trial-balance slice exists yet for this reconciliation-readiness view.",
    );
  }

  if (input.generalLedgerSlice.latestSyncRun === null) {
    limitations.push(
      "No successful general-ledger slice exists yet for this reconciliation-readiness view.",
    );
  }

  limitations.push(
    "This route does not compute a balance variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
  );

  if (
    input.sliceAlignment.state === "shared_source" &&
    (!input.sliceAlignment.sameSourceSnapshot || !input.sliceAlignment.sameSyncRun)
  ) {
    limitations.push(input.sliceAlignment.reasonSummary);
  }

  if (
    input.comparability.state === "coverage_only" ||
    input.comparability.state === "not_comparable" ||
    input.comparability.state === "missing_slice"
  ) {
    limitations.push(input.comparability.reasonSummary);
  }

  return Array.from(new Set(limitations));
}

function selectCombinedState(summaries: FinanceFreshnessSummary[]) {
  const states = summaries.map((summary) => summary.state);

  if (states.includes("failed")) {
    return "failed";
  }

  if (states.includes("missing")) {
    return "missing";
  }

  if (states.includes("stale")) {
    return "stale";
  }

  return "fresh";
}

function buildCombinedReasonCode(
  state: FinanceFreshnessSummary["state"],
): string {
  switch (state) {
    case "failed":
      return "reconciliation_slice_failed";
    case "missing":
      return "reconciliation_slice_missing";
    case "stale":
      return "reconciliation_slice_stale";
    case "fresh":
      return "reconciliation_slices_fresh";
  }
}

function buildCombinedReasonSummary(
  state: FinanceFreshnessSummary["state"],
): string {
  switch (state) {
    case "failed":
      return "At least one implemented reconciliation-readiness slice has a failed latest sync.";
    case "missing":
      return "At least one implemented reconciliation-readiness slice has not completed a successful sync yet.";
    case "stale":
      return "At least one implemented reconciliation-readiness slice is older than the 24 hour freshness window.";
    case "fresh":
      return "The implemented reconciliation-readiness slices are within the 24 hour freshness window.";
  }
}

function selectLatestIso(values: Array<string | null>) {
  return values
    .filter((value): value is string => value !== null)
    .sort((left, right) => right.localeCompare(left))[0];
}

function selectLatestId(values: Array<{ id: string | null; iso: string | null }>) {
  return values
    .filter((value): value is { id: string; iso: string } => {
      return value.id !== null && value.iso !== null;
    })
    .sort((left, right) => right.iso.localeCompare(left.iso))[0]?.id ?? null;
}

function selectLatestStatus(
  values: Array<{
    iso: string | null;
    status: FinanceFreshnessSummary["latestSyncStatus"];
  }>,
) {
  return values
    .filter((value): value is { iso: string; status: FinanceFreshnessSummary["latestSyncStatus"] } => value.iso !== null)
    .sort((left, right) => right.iso.localeCompare(left.iso))[0]?.status ?? null;
}

function selectCombinedAgeSeconds(summaries: FinanceFreshnessSummary[]) {
  const ages = summaries
    .map((summary) => summary.ageSeconds)
    .filter((value): value is number => value !== null);

  if (ages.length === 0) {
    return null;
  }

  return Math.max(...ages);
}
