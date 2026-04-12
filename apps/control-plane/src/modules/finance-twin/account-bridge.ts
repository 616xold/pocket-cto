import {
  FinanceAccountBridgeReadinessViewSchema,
  type FinanceAccountBridgeAccountRow,
  type FinanceAccountBridgeCoverageSummary,
  type FinanceAccountBridgeReadinessStatus,
  type FinanceAccountBridgeReadinessView,
  type FinanceAccountCatalogEntryView,
  type FinanceCompanyRecord,
  type FinanceFreshnessView,
  type FinanceGeneralLedgerEntryView,
  type FinanceLatestSuccessfulChartOfAccountsSlice,
  type FinanceLatestSuccessfulGeneralLedgerSlice,
  type FinanceLatestSuccessfulTrialBalanceSlice,
  type FinanceLedgerAccountRecord,
  type FinanceReconciliationComparabilityView,
  type FinanceSliceAlignmentView,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import {
  buildGeneralLedgerActivityByAccountId,
  type GeneralLedgerActivityByAccount,
} from "./general-ledger-activity";
import { buildSharedSourceDiagnostics, dedupeMessages } from "./diagnostics";

export function buildFinanceAccountBridgeReadinessView(input: {
  chartOfAccountsEntries: FinanceAccountCatalogEntryView[];
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSlice;
  company: FinanceCompanyRecord;
  comparability: FinanceReconciliationComparabilityView;
  freshness: FinanceFreshnessView;
  generalLedgerEntries: FinanceGeneralLedgerEntryView[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  limitations: string[];
  sliceAlignment: FinanceSliceAlignmentView;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}): FinanceAccountBridgeReadinessView {
  const generalLedgerActivityByAccountId =
    buildGeneralLedgerActivityByAccountId(input.generalLedgerEntries);
  const accounts = buildAccountBridgeRows({
    chartOfAccountsEntries: input.chartOfAccountsEntries,
    chartOfAccountsSlice: input.chartOfAccountsSlice,
    generalLedgerActivityByAccountId,
    generalLedgerSlice: input.generalLedgerSlice,
    trialBalanceLineViews: input.trialBalanceLineViews,
  });
  const bridgeReadiness = buildBridgeReadiness({
    comparability: input.comparability,
    generalLedgerSlice: input.generalLedgerSlice,
    sliceAlignment: input.sliceAlignment,
    trialBalanceSlice: input.trialBalanceSlice,
  });
  const limitations = buildAccountBridgeLimitations({
    bridgeReadiness,
    chartOfAccountsSlice: input.chartOfAccountsSlice,
    existing: input.limitations,
    sliceAlignment: input.sliceAlignment,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
    chartOfAccountsSourceId:
      input.chartOfAccountsSlice.latestSource?.sourceId ?? null,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
  });
  const diagnostics = buildSharedSourceDiagnostics(input.sliceAlignment);

  return FinanceAccountBridgeReadinessViewSchema.parse({
    company: input.company,
    chartOfAccountsSlice: input.chartOfAccountsSlice,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
    freshness: input.freshness,
    sliceAlignment: input.sliceAlignment,
    comparability: input.comparability,
    bridgeReadiness,
    coverageSummary: buildCoverageSummary(accounts),
    accounts,
    diagnostics,
    limitations,
  });
}

function buildAccountBridgeRows(input: {
  chartOfAccountsEntries: FinanceAccountCatalogEntryView[];
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSlice;
  generalLedgerActivityByAccountId: GeneralLedgerActivityByAccount;
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}) {
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
  const ledgerAccountsById = new Map<string, FinanceLedgerAccountRecord>();
  const chartOfAccountsAvailable =
    input.chartOfAccountsSlice.latestSyncRun !== null;

  for (const entry of input.chartOfAccountsEntries) {
    ledgerAccountsById.set(entry.ledgerAccount.id, entry.ledgerAccount);
  }

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
      const chartOfAccountsEntry =
        chartOfAccountsByAccountId.get(ledgerAccount.id) ?? null;
      const trialBalanceLineView =
        trialBalanceByAccountId.get(ledgerAccount.id) ?? null;
      const generalLedgerActivity =
        input.generalLedgerActivityByAccountId.get(ledgerAccount.id)
          ?.activity ?? null;
      const presentInChartOfAccounts = chartOfAccountsEntry !== null;
      const presentInTrialBalance = trialBalanceLineView !== null;
      const presentInGeneralLedger = generalLedgerActivity !== null;

      return {
        ledgerAccount,
        chartOfAccountsEntry: chartOfAccountsEntry?.catalogEntry ?? null,
        trialBalanceLine: trialBalanceLineView?.trialBalanceLine ?? null,
        generalLedgerActivity,
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
        activityLineageRef:
          presentInGeneralLedger && input.generalLedgerSlice.latestSyncRun
            ? {
                ledgerAccountId: ledgerAccount.id,
                syncRunId: input.generalLedgerSlice.latestSyncRun.id,
              }
            : null,
      } satisfies FinanceAccountBridgeAccountRow;
    });
}

function buildCoverageSummary(
  accounts: FinanceAccountBridgeAccountRow[],
): FinanceAccountBridgeCoverageSummary {
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
  };
}

function buildBridgeReadiness(input: {
  comparability: FinanceReconciliationComparabilityView;
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  sliceAlignment: FinanceSliceAlignmentView;
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}): FinanceAccountBridgeReadinessStatus {
  const baseContext = {
    basis: input.comparability.basis,
    windowRelation: input.comparability.windowRelation,
    sameSource: input.sliceAlignment.sameSource,
    sameSourceSnapshot: input.sliceAlignment.sameSourceSnapshot,
    sameSyncRun: input.sliceAlignment.sameSyncRun,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
  };
  const sourceDeclaredPeriod =
    input.generalLedgerSlice.periodContext.sourceDeclaredPeriod;

  if (
    input.trialBalanceSlice.latestSyncRun === null ||
    input.generalLedgerSlice.latestSyncRun === null
  ) {
    return {
      state: "missing_slice",
      reasonCode: "account_bridge_missing_slice",
      reasonSummary:
        "Matched-period account-bridge readiness requires successful trial-balance and general-ledger slices.",
      ...baseContext,
    };
  }

  if (input.sliceAlignment.state !== "shared_source") {
    return {
      state: "not_bridge_ready",
      reasonCode:
        input.sliceAlignment.state === "mixed"
          ? "account_bridge_mixed_sources"
          : "account_bridge_alignment_not_shared_source",
      reasonSummary:
        input.sliceAlignment.state === "mixed"
          ? "Matched-period account-bridge readiness requires the latest successful trial-balance and general-ledger slices to share one registered source."
          : "Matched-period account-bridge readiness requires the latest successful trial-balance and general-ledger slices to align to one registered source.",
      ...baseContext,
    };
  }

  if (input.comparability.basis !== "source_declared_period") {
    return {
      state: "not_bridge_ready",
      reasonCode: "account_bridge_basis_not_source_declared_period",
      reasonSummary:
        "Matched-period account-bridge readiness requires explicit source-declared general-ledger period context rather than activity-window-only or missing context.",
      ...baseContext,
    };
  }

  if (sourceDeclaredPeriod?.contextKind !== "period_window") {
    return {
      state: "not_bridge_ready",
      reasonCode: "account_bridge_period_context_not_period_window",
      reasonSummary:
        "Matched-period account-bridge readiness requires a full source-declared general-ledger period window with both period start and period end.",
      ...baseContext,
    };
  }

  if (input.comparability.windowRelation !== "exact_match") {
    return {
      state: "not_bridge_ready",
      reasonCode: buildWindowRelationReasonCode(
        input.comparability.windowRelation,
      ),
      reasonSummary: buildWindowRelationReasonSummary(
        input.comparability.windowRelation,
      ),
      ...baseContext,
    };
  }

  return {
    state: "matched_period_ready",
    reasonCode: "account_bridge_matched_period_ready",
    reasonSummary:
      "The latest successful trial-balance and general-ledger slices share one registered source and an exact matching source-declared period window, so account-level overlap and unmatched diagnostics can be discussed safely without claiming a numeric bridge or variance.",
    ...baseContext,
  };
}

function buildWindowRelationReasonCode(
  windowRelation: FinanceReconciliationComparabilityView["windowRelation"],
) {
  switch (windowRelation) {
    case "subset":
      return "account_bridge_window_subset";
    case "outside":
      return "account_bridge_window_outside";
    case "unknown":
      return "account_bridge_window_unknown";
    case "exact_match":
      return "account_bridge_window_exact_match";
  }
}

function buildWindowRelationReasonSummary(
  windowRelation: FinanceReconciliationComparabilityView["windowRelation"],
) {
  switch (windowRelation) {
    case "subset":
      return "Matched-period account-bridge readiness requires the source-declared general-ledger period window to exactly match the latest trial-balance reporting window, not merely fit inside it.";
    case "outside":
      return "Matched-period account-bridge readiness requires the source-declared general-ledger period window to stay inside the latest trial-balance reporting window.";
    case "unknown":
      return "Matched-period account-bridge readiness requires enough source-declared period detail to judge an exact window match.";
    case "exact_match":
      return "The source-declared general-ledger period window exactly matches the latest trial-balance reporting window.";
  }
}

function buildAccountBridgeLimitations(input: {
  bridgeReadiness: FinanceAccountBridgeReadinessStatus;
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSlice;
  chartOfAccountsSourceId: string | null;
  existing: string[];
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSlice;
  sharedSourceId: string | null;
  sliceAlignment: FinanceSliceAlignmentView;
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSlice;
}) {
  const limitations = [...input.existing];

  if (input.chartOfAccountsSlice.latestSyncRun === null) {
    limitations.push(
      "No successful chart-of-accounts slice exists yet for this account-bridge view, so chart-of-accounts enrichment is unavailable.",
    );
  }

  if (input.trialBalanceSlice.latestSyncRun === null) {
    limitations.push(
      "No successful trial-balance slice exists yet for this account-bridge view.",
    );
  }

  if (input.generalLedgerSlice.latestSyncRun === null) {
    limitations.push(
      "No successful general-ledger slice exists yet for this account-bridge view.",
    );
  }

  limitations.push(
    "This route does not compute a direct account balance bridge or variance because trial-balance ending balances are not equivalent to general-ledger activity totals.",
  );

  if (input.sliceAlignment.state === "mixed") {
    limitations.push(
      "Do not treat this account-bridge view as single-source proof because the latest successful trial-balance and general-ledger slices come from different registered sources.",
    );
  }

  if (
    input.sharedSourceId !== null &&
    input.chartOfAccountsSourceId !== null &&
    input.chartOfAccountsSourceId !== input.sharedSourceId
  ) {
    limitations.push(
      "The latest successful chart-of-accounts slice comes from a different registered source than the latest successful trial-balance and general-ledger slices, so chart-of-accounts diagnostics here are enrichment rather than single-source bridge proof.",
    );
  }

  if (input.bridgeReadiness.state !== "matched_period_ready") {
    limitations.push(input.bridgeReadiness.reasonSummary);
  }

  return dedupeMessages(limitations);
}
