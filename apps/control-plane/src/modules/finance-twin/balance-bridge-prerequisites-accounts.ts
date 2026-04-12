import type {
  FinanceAccountBridgeReadinessStatus,
  FinanceAccountCatalogEntryView,
  FinanceBalanceBridgePrerequisitesAccountRow,
  FinanceBalanceBridgePrerequisitesCoverageSummary,
  FinanceGeneralLedgerEntryView,
  FinanceLatestSuccessfulChartOfAccountsSlice,
  FinanceLatestSuccessfulGeneralLedgerSlice,
  FinanceLedgerAccountRecord,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import { buildGeneralLedgerActivityByAccountId } from "./general-ledger-activity";
import {
  buildFinanceGeneralLedgerBalanceProof,
  hasSourceBackedBalanceProof,
} from "./general-ledger-balance-proof";

export function buildBalanceBridgePrerequisitesAccountRows(input: {
  accountBridgeReadiness: FinanceAccountBridgeReadinessStatus;
  chartOfAccountsEntries: FinanceAccountCatalogEntryView[];
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSlice;
  generalLedgerEntries: FinanceGeneralLedgerEntryView[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}): FinanceBalanceBridgePrerequisitesAccountRow[] {
  const chartOfAccountsByAccountId = new Map(
    input.chartOfAccountsEntries.map((entry) => [
      entry.ledgerAccount.id,
      entry,
    ]),
  );
  const trialBalanceByAccountId = new Map(
    input.trialBalanceLineViews.map((lineView) => [
      lineView.ledgerAccount.id,
      lineView,
    ]),
  );
  const generalLedgerActivityByAccountId =
    buildGeneralLedgerActivityByAccountId(input.generalLedgerEntries);
  const ledgerAccountsById = new Map<string, FinanceLedgerAccountRecord>();
  const chartOfAccountsAvailable =
    input.chartOfAccountsSlice.latestSyncRun !== null;
  const bridgeWindowReady =
    input.accountBridgeReadiness.state === "matched_period_ready";

  for (const entry of input.chartOfAccountsEntries) {
    ledgerAccountsById.set(entry.ledgerAccount.id, entry.ledgerAccount);
  }

  for (const lineView of input.trialBalanceLineViews) {
    ledgerAccountsById.set(lineView.ledgerAccount.id, lineView.ledgerAccount);
  }

  for (const [ledgerAccountId, activity] of generalLedgerActivityByAccountId) {
    ledgerAccountsById.set(ledgerAccountId, activity.ledgerAccount);
  }

  return Array.from(ledgerAccountsById.values())
    .sort((left, right) => left.accountCode.localeCompare(right.accountCode))
    .map((ledgerAccount) => {
      const chartOfAccountsEntry =
        chartOfAccountsByAccountId.get(ledgerAccount.id) ?? null;
      const trialBalanceLineView =
        trialBalanceByAccountId.get(ledgerAccount.id) ?? null;
      const generalLedgerActivity =
        generalLedgerActivityByAccountId.get(ledgerAccount.id)?.activity ??
        null;
      const generalLedgerBalanceProof = buildFinanceGeneralLedgerBalanceProof({
        generalLedgerActivity,
      });
      const presentInChartOfAccounts = chartOfAccountsEntry !== null;
      const presentInTrialBalance = trialBalanceLineView !== null;
      const presentInGeneralLedger = generalLedgerActivity !== null;
      const matchedPeriodAccountBridgeReady =
        bridgeWindowReady && presentInTrialBalance && presentInGeneralLedger;
      const balanceBridgePrereqReady =
        matchedPeriodAccountBridgeReady &&
        hasSourceBackedBalanceProof(generalLedgerBalanceProof);
      const blockedReason = resolveBlockedReason({
        accountBridgeReadiness: input.accountBridgeReadiness,
        balanceBridgePrereqReady,
        generalLedgerBalanceProof,
        presentInGeneralLedger,
        presentInTrialBalance,
      });

      return {
        ledgerAccount,
        chartOfAccountsEntry: chartOfAccountsEntry?.catalogEntry ?? null,
        trialBalanceLine: trialBalanceLineView?.trialBalanceLine ?? null,
        generalLedgerActivity,
        generalLedgerBalanceProof,
        presentInChartOfAccounts,
        presentInTrialBalance,
        presentInGeneralLedger,
        trialBalanceOnly: presentInTrialBalance && !presentInGeneralLedger,
        generalLedgerOnly: presentInGeneralLedger && !presentInTrialBalance,
        missingFromChartOfAccounts:
          chartOfAccountsAvailable && !presentInChartOfAccounts,
        inactiveWithGeneralLedgerActivity:
          chartOfAccountsEntry?.catalogEntry.isActive === false &&
          presentInGeneralLedger,
        matchedPeriodAccountBridgeReady,
        balanceBridgePrereqReady,
        blockedReasonCode: blockedReason.code,
        blockedReasonSummary: blockedReason.summary,
        activityLineageRef:
          presentInGeneralLedger && input.generalLedgerSlice.latestSyncRun
            ? {
                ledgerAccountId: ledgerAccount.id,
                syncRunId: input.generalLedgerSlice.latestSyncRun.id,
              }
            : null,
      };
    });
}

function resolveBlockedReason(input: {
  accountBridgeReadiness: FinanceAccountBridgeReadinessStatus;
  balanceBridgePrereqReady: boolean;
  generalLedgerBalanceProof: ReturnType<
    typeof buildFinanceGeneralLedgerBalanceProof
  >;
  presentInGeneralLedger: boolean;
  presentInTrialBalance: boolean;
}) {
  if (input.balanceBridgePrereqReady) {
    return { code: null, summary: null };
  }

  if (!input.presentInTrialBalance && !input.presentInGeneralLedger) {
    return {
      code: "balance_bridge_missing_overlap",
      summary:
        "This account is present only as chart-of-accounts context in the latest successful slices, so there is no trial-balance-versus-general-ledger overlap to evaluate.",
    };
  }

  if (!input.presentInTrialBalance) {
    return {
      code: "balance_bridge_missing_trial_balance_overlap",
      summary:
        "This account is missing from the latest successful trial-balance slice, so balance-bridge prerequisites stop at missing overlap.",
    };
  }

  if (!input.presentInGeneralLedger) {
    return {
      code: "balance_bridge_missing_general_ledger_overlap",
      summary:
        "This account is missing from the latest successful general-ledger slice, so balance-bridge prerequisites stop at missing overlap.",
    };
  }

  if (input.accountBridgeReadiness.state !== "matched_period_ready") {
    return {
      code: "balance_bridge_account_bridge_not_ready",
      summary: input.accountBridgeReadiness.reasonSummary,
    };
  }

  return {
    code: "balance_bridge_missing_balance_proof",
    summary: input.generalLedgerBalanceProof.reasonSummary,
  };
}

export function buildBalanceBridgePrerequisitesCoverageSummary(
  accounts: FinanceBalanceBridgePrerequisitesAccountRow[],
): FinanceBalanceBridgePrerequisitesCoverageSummary {
  return {
    accountRowCount: accounts.length,
    presentInChartOfAccountsCount: accounts.filter(
      (account) => account.presentInChartOfAccounts,
    ).length,
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
    missingFromChartOfAccountsCount: accounts.filter(
      (account) => account.missingFromChartOfAccounts,
    ).length,
    inactiveWithGeneralLedgerActivityCount: accounts.filter(
      (account) => account.inactiveWithGeneralLedgerActivity,
    ).length,
    matchedPeriodAccountBridgeReadyCount: accounts.filter(
      (account) => account.matchedPeriodAccountBridgeReady,
    ).length,
    accountsWithOpeningBalanceProofCount: accounts.filter(
      (account) =>
        account.generalLedgerBalanceProof.openingBalanceEvidencePresent,
    ).length,
    accountsWithEndingBalanceProofCount: accounts.filter(
      (account) =>
        account.generalLedgerBalanceProof.endingBalanceEvidencePresent,
    ).length,
    accountsBlockedByMissingOverlapCount: accounts.filter(
      (account) =>
        account.blockedReasonCode === "balance_bridge_missing_overlap" ||
        account.blockedReasonCode ===
          "balance_bridge_missing_trial_balance_overlap" ||
        account.blockedReasonCode ===
          "balance_bridge_missing_general_ledger_overlap",
    ).length,
    accountsBlockedByMissingBalanceProofCount: accounts.filter(
      (account) =>
        account.blockedReasonCode === "balance_bridge_missing_balance_proof",
    ).length,
    prereqReadyAccountCount: accounts.filter(
      (account) => account.balanceBridgePrereqReady,
    ).length,
  };
}
