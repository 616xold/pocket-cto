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
import { buildSharedSourceDiagnostics, dedupeMessages } from "./diagnostics";
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
  const generalLedgerActivityByAccountId =
    buildGeneralLedgerActivityByAccountId(input.generalLedgerEntries);
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
  const diagnostics = buildSharedSourceDiagnostics(sliceAlignment);

  return FinanceReconciliationReadinessViewSchema.parse({
    company: input.company,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
    freshness: buildReconciliationFreshnessView(input.freshness),
    sliceAlignment,
    comparability,
    coverageSummary: buildCoverageSummary(accounts),
    accounts,
    diagnostics,
    limitations,
  });
}

function buildReconciliationAccounts(input: {
  generalLedgerActivityByAccountId: GeneralLedgerActivityByAccount;
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}) {
  const trialBalanceByAccountId = new Map(
    input.trialBalanceLineViews.map((lineView) => [
      lineView.ledgerAccount.id,
      lineView,
    ]),
  );
  const ledgerAccountsById = new Map<string, FinanceLedgerAccountRecord>();

  for (const lineView of input.trialBalanceLineViews) {
    ledgerAccountsById.set(lineView.ledgerAccount.id, lineView.ledgerAccount);
  }

  for (const [
    ledgerAccountId,
    activity,
  ] of input.generalLedgerActivityByAccountId) {
    ledgerAccountsById.set(ledgerAccountId, activity.ledgerAccount);
  }

  return Array.from(ledgerAccountsById.values())
    .sort((left, right) => left.accountCode.localeCompare(right.accountCode))
    .map((ledgerAccount) => {
      const trialBalanceLineView =
        trialBalanceByAccountId.get(ledgerAccount.id) ?? null;
      const generalLedgerActivity =
        input.generalLedgerActivityByAccountId.get(ledgerAccount.id)
          ?.activity ?? null;
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
      (account) =>
        account.presentInTrialBalance && account.presentInGeneralLedger,
    ).length,
    trialBalanceOnlyCount: accounts.filter(
      (account) => account.trialBalanceOnly,
    ).length,
    generalLedgerOnlyCount: accounts.filter(
      (account) => account.generalLedgerOnly,
    ).length,
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
  const basis = input.generalLedgerSlice.periodContext.basis;
  const sourceDeclaredGeneralLedgerPeriod =
    input.generalLedgerSlice.periodContext.sourceDeclaredPeriod;
  const windowRelation = resolveWindowRelation({
    basis,
    generalLedgerWindow,
    sourceDeclaredGeneralLedgerPeriod,
    trialBalanceWindow,
  });
  const baseContext = {
    basis,
    windowRelation,
    trialBalanceWindow,
    sourceDeclaredGeneralLedgerPeriod,
    generalLedgerWindow,
    sameSource: input.sliceAlignment.sameSource,
    sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
    sameSyncRun: input.sliceAlignment.sameSyncRun,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
    sharedSourceSnapshotId: input.sliceAlignment.sharedSourceSnapshotId,
    sharedSyncRunId: input.sliceAlignment.sharedSyncRunId,
  };

  if (
    input.trialBalanceSlice.latestSyncRun === null ||
    input.generalLedgerSlice.latestSyncRun === null
  ) {
    return {
      state: "missing_slice",
      ...baseContext,
      reasonCode: "missing_successful_slice",
      reasonSummary:
        "The latest successful trial-balance or general-ledger slice is missing, so this route can only report readiness gaps.",
    };
  }

  if (!trialBalanceWindow) {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "missing_trial_balance_window_context",
      reasonSummary:
        "The latest successful trial-balance slice is missing reporting-window context, so this route can only report readiness gaps.",
    };
  }

  if (basis === "missing_context") {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "missing_general_ledger_period_context",
      reasonSummary:
        "The latest successful general-ledger slice does not expose explicit source-declared period context or an activity window, so this route stays at readiness only.",
    };
  }

  if (windowRelation === "outside") {
    return {
      state: "not_comparable",
      ...baseContext,
      reasonCode:
        basis === "source_declared_period"
          ? "source_declared_period_outside"
          : "activity_window_outside",
      reasonSummary:
        basis === "source_declared_period"
          ? "The latest successful general-ledger slice includes explicit source-declared period context that falls outside the latest trial-balance reporting window."
          : "The observed general-ledger activity window falls outside the latest trial-balance reporting window.",
    };
  }

  if (basis === "source_declared_period" && windowRelation === "exact_match") {
    return {
      state: "window_comparable",
      ...baseContext,
      reasonCode: "source_declared_period_exact_match",
      reasonSummary:
        "The latest successful general-ledger slice includes explicit source-declared period context that exactly matches the latest trial-balance reporting window.",
    };
  }

  if (basis === "source_declared_period" && windowRelation === "subset") {
    return {
      state: "window_comparable",
      ...baseContext,
      reasonCode: "source_declared_period_subset",
      reasonSummary:
        "The latest successful general-ledger slice includes explicit source-declared period context that fits inside the latest trial-balance reporting window.",
    };
  }

  if (basis === "activity_window_only" && windowRelation === "exact_match") {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "activity_window_exact_match",
      reasonSummary:
        "The observed general-ledger activity window exactly matches the latest trial-balance reporting window, but the general-ledger slice does not include explicit source-declared period context.",
    };
  }

  if (basis === "activity_window_only" && windowRelation === "subset") {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "activity_window_subset",
      reasonSummary:
        "The observed general-ledger activity window fits inside the latest trial-balance reporting window, but the general-ledger slice does not include explicit source-declared period context.",
    };
  }

  if (basis === "source_declared_period") {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "source_declared_period_unknown",
      reasonSummary:
        "The latest successful general-ledger slice includes explicit source-declared period context, but not enough source-declared dates to judge its full relation to the latest trial-balance reporting window.",
    };
  }

  if (trialBalanceWindow.periodStart === null) {
    return {
      state: "coverage_only",
      ...baseContext,
      reasonCode: "trial_balance_period_start_missing",
      reasonSummary:
        "The latest trial-balance slice does not include a period start, so this route stays at coverage and readiness instead of claiming a comparable period relation.",
    };
  }

  return {
    state: "coverage_only",
    ...baseContext,
    reasonCode: "activity_window_unknown",
    reasonSummary:
      "The general-ledger slice only exposes activity-window evidence, so this route cannot judge a stronger period-scoped relation.",
  };
}

function resolveWindowRelation(input: {
  basis: FinanceReconciliationComparabilityView["basis"];
  generalLedgerWindow: FinanceReconciliationComparabilityView["generalLedgerWindow"];
  sourceDeclaredGeneralLedgerPeriod: FinanceReconciliationComparabilityView["sourceDeclaredGeneralLedgerPeriod"];
  trialBalanceWindow: FinanceReconciliationComparabilityView["trialBalanceWindow"];
}): FinanceReconciliationComparabilityView["windowRelation"] {
  if (!input.trialBalanceWindow) {
    return "unknown";
  }

  if (input.basis === "source_declared_period") {
    const sourceDeclaredPeriod = input.sourceDeclaredGeneralLedgerPeriod;

    if (!sourceDeclaredPeriod) {
      return "unknown";
    }

    switch (sourceDeclaredPeriod.contextKind) {
      case "period_window":
        return compareWindowBounds({
          comparisonEnd: sourceDeclaredPeriod.periodEnd,
          comparisonStart: sourceDeclaredPeriod.periodStart,
          trialBalanceEnd: input.trialBalanceWindow.periodEnd,
          trialBalanceStart: input.trialBalanceWindow.periodStart,
        });
      case "period_end_only":
        return compareSingleDate({
          trialBalanceWindow: input.trialBalanceWindow,
          value: sourceDeclaredPeriod.periodEnd,
        });
      case "as_of":
        return compareSingleDate({
          trialBalanceWindow: input.trialBalanceWindow,
          value: sourceDeclaredPeriod.asOf,
        });
      case "period_key_only":
        return "unknown";
    }
  }

  if (input.basis === "activity_window_only") {
    if (!input.generalLedgerWindow) {
      return "unknown";
    }

    return compareWindowBounds({
      comparisonEnd: input.generalLedgerWindow.latestEntryDate,
      comparisonStart: input.generalLedgerWindow.earliestEntryDate,
      trialBalanceEnd: input.trialBalanceWindow.periodEnd,
      trialBalanceStart: input.trialBalanceWindow.periodStart,
    });
  }

  return "unknown";
}

function compareWindowBounds(input: {
  comparisonEnd: string | null;
  comparisonStart: string | null;
  trialBalanceEnd: string;
  trialBalanceStart: string | null;
}): FinanceReconciliationComparabilityView["windowRelation"] {
  if (
    !input.comparisonStart ||
    !input.comparisonEnd ||
    !input.trialBalanceStart
  ) {
    return "unknown";
  }

  if (
    input.comparisonStart < input.trialBalanceStart ||
    input.comparisonEnd > input.trialBalanceEnd
  ) {
    return "outside";
  }

  if (
    input.comparisonStart === input.trialBalanceStart &&
    input.comparisonEnd === input.trialBalanceEnd
  ) {
    return "exact_match";
  }

  return "subset";
}

function compareSingleDate(input: {
  trialBalanceWindow: NonNullable<
    FinanceReconciliationComparabilityView["trialBalanceWindow"]
  >;
  value: string | null;
}): FinanceReconciliationComparabilityView["windowRelation"] {
  if (!input.value || input.trialBalanceWindow.periodStart === null) {
    return "unknown";
  }

  if (
    input.value < input.trialBalanceWindow.periodStart ||
    input.value > input.trialBalanceWindow.periodEnd
  ) {
    return "outside";
  }

  return "unknown";
}

function buildReconciliationFreshnessView(
  freshness: FinanceFreshnessView,
): FinanceReconciliationFreshnessView {
  const trialBalance = freshness.trialBalance;
  const generalLedger = freshness.generalLedger;
  const overallState = selectCombinedState([trialBalance, generalLedger]);
  const latestCompletedAt =
    selectLatestIso([
      trialBalance.latestCompletedAt,
      generalLedger.latestCompletedAt,
    ]) ?? null;
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

  if (input.sliceAlignment.state === "mixed") {
    limitations.push(
      "Do not treat this reconciliation view as single-source proof because the latest successful trial-balance and general-ledger slices come from different registered sources.",
    );
  }

  if (
    input.comparability.state === "coverage_only" ||
    input.comparability.state === "not_comparable" ||
    input.comparability.state === "missing_slice"
  ) {
    limitations.push(input.comparability.reasonSummary);
  }

  return dedupeMessages(limitations);
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

function selectLatestId(
  values: Array<{ id: string | null; iso: string | null }>,
) {
  return (
    values
      .filter((value): value is { id: string; iso: string } => {
        return value.id !== null && value.iso !== null;
      })
      .sort((left, right) => right.iso.localeCompare(left.iso))[0]?.id ?? null
  );
}

function selectLatestStatus(
  values: Array<{
    iso: string | null;
    status: FinanceFreshnessSummary["latestSyncStatus"];
  }>,
) {
  return (
    values
      .filter(
        (
          value,
        ): value is {
          iso: string;
          status: FinanceFreshnessSummary["latestSyncStatus"];
        } => value.iso !== null,
      )
      .sort((left, right) => right.iso.localeCompare(left.iso))[0]?.status ??
    null
  );
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
