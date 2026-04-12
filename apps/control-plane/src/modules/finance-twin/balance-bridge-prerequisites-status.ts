import type {
  FinanceAccountBridgeReadinessStatus,
  FinanceBalanceBridgePrerequisitesCoverageSummary,
  FinanceBalanceBridgePrerequisitesStatus,
  FinanceLatestSuccessfulChartOfAccountsSlice,
  FinanceLatestSuccessfulGeneralLedgerSlice,
  FinanceLatestSuccessfulTrialBalanceSlice,
  FinanceSliceAlignmentView,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";

export function buildBalanceBridgePrerequisitesStatus(input: {
  accountBridgeReadiness: FinanceAccountBridgeReadinessStatus;
  coverageSummary: FinanceBalanceBridgePrerequisitesCoverageSummary;
  sliceAlignment: FinanceSliceAlignmentView;
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
}): FinanceBalanceBridgePrerequisitesStatus {
  const baseContext = {
    basis: input.accountBridgeReadiness.basis,
    windowRelation: input.accountBridgeReadiness.windowRelation,
    sameSource: input.sliceAlignment.sameSource,
    sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
    sameSyncRun: input.sliceAlignment.sameSyncRun,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
  };
  const prerequisites = {
    hasSuccessfulTrialBalanceSlice:
      input.trialBalanceSlice.latestSyncRun !== null,
    hasSuccessfulGeneralLedgerSlice:
      input.generalLedgerSlice.latestSyncRun !== null,
    matchedPeriodAccountBridgeReady:
      input.accountBridgeReadiness.state === "matched_period_ready",
    anySourceBackedGeneralLedgerBalanceProof:
      input.coverageSummary.prereqReadyAccountCount > 0,
  };

  if (
    input.trialBalanceSlice.latestSyncRun === null ||
    input.generalLedgerSlice.latestSyncRun === null
  ) {
    return {
      state: "missing_slice",
      reasonCode: "balance_bridge_missing_slice",
      reasonSummary:
        "Balance-bridge prerequisites require successful trial-balance and general-ledger slices before account-level proof can be evaluated.",
      ...baseContext,
      prerequisites,
    };
  }

  if (input.accountBridgeReadiness.state !== "matched_period_ready") {
    return {
      state: "not_prereq_ready",
      reasonCode: "balance_bridge_account_bridge_not_ready",
      reasonSummary: input.accountBridgeReadiness.reasonSummary,
      ...baseContext,
      prerequisites,
    };
  }

  if (input.coverageSummary.matchedPeriodAccountBridgeReadyCount === 0) {
    return {
      state: "not_prereq_ready",
      reasonCode: "balance_bridge_no_account_overlap",
      reasonSummary:
        "Matched-period account-bridge readiness exists at route level, but no ledger account appears in both the latest successful trial-balance and general-ledger slices, so balance-bridge prerequisites stop at missing overlap.",
      ...baseContext,
      prerequisites,
    };
  }

  if (input.coverageSummary.prereqReadyAccountCount === 0) {
    return {
      state: "not_prereq_ready",
      reasonCode: "balance_bridge_missing_balance_proof",
      reasonSummary:
        "Matched-period account overlap exists, but none of those accounts include source-backed general-ledger opening-balance or ending-balance proof in the persisted Finance Twin state, so this route stops at blocked prerequisites rather than inventing a balance bridge.",
      ...baseContext,
      prerequisites,
    };
  }

  return {
    state: "source_backed_balance_prereq_ready",
    reasonCode: "balance_bridge_source_backed_prereq_ready",
    reasonSummary:
      "One or more matched-period overlapping accounts include source-backed general-ledger opening-balance or ending-balance proof, so account-level balance bridge discussion can proceed for those accounts without implying a company-level variance.",
    ...baseContext,
    prerequisites,
  };
}

export function buildBalanceBridgePrerequisitesLimitations(input: {
  balanceBridgePrerequisites: FinanceBalanceBridgePrerequisitesStatus;
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSlice;
  chartOfAccountsSourceId: string | null;
  existing: string[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  sharedSourceId: string | null;
  sliceAlignment: FinanceSliceAlignmentView;
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}): string[] {
  const limitations = [...input.existing];

  if (input.chartOfAccountsSlice.latestSyncRun === null) {
    limitations.push(
      "No successful chart-of-accounts slice exists yet for this balance-bridge-prerequisites view, so chart-of-accounts enrichment is unavailable.",
    );
  }

  if (input.trialBalanceSlice.latestSyncRun === null) {
    limitations.push(
      "No successful trial-balance slice exists yet for this balance-bridge-prerequisites view.",
    );
  }

  if (input.generalLedgerSlice.latestSyncRun === null) {
    limitations.push(
      "No successful general-ledger slice exists yet for this balance-bridge-prerequisites view.",
    );
  }

  limitations.push(
    "This route does not compute a direct balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals, and general-ledger activity totals do not prove opening or ending balances.",
  );

  if (input.sliceAlignment.state === "mixed") {
    limitations.push(
      "Do not treat this balance-bridge-prerequisites view as single-source proof because the latest successful trial-balance and general-ledger slices come from different registered sources.",
    );
  }

  if (
    input.sharedSourceId !== null &&
    input.chartOfAccountsSourceId !== null &&
    input.chartOfAccountsSourceId !== input.sharedSourceId
  ) {
    limitations.push(
      "The latest successful chart-of-accounts slice comes from a different registered source than the latest successful trial-balance and general-ledger slices, so chart-of-accounts diagnostics here are enrichment rather than single-source balance proof.",
    );
  }

  if (
    input.balanceBridgePrerequisites.state !==
    "source_backed_balance_prereq_ready"
  ) {
    limitations.push(input.balanceBridgePrerequisites.reasonSummary);
  }

  return dedupeMessages(limitations);
}
