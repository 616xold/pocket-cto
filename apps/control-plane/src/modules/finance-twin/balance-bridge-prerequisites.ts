import {
  FinanceBalanceBridgePrerequisitesViewSchema,
  type FinanceAccountBridgeReadinessStatus,
  type FinanceAccountCatalogEntryView,
  type FinanceBalanceBridgePrerequisitesView,
  type FinanceCompanyRecord,
  type FinanceFreshnessView,
  type FinanceGeneralLedgerEntryView,
  type FinanceLatestSuccessfulChartOfAccountsSlice,
  type FinanceLatestSuccessfulGeneralLedgerSlice,
  type FinanceLatestSuccessfulTrialBalanceSlice,
  type FinanceReconciliationComparabilityView,
  type FinanceSliceAlignmentView,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import {
  buildBalanceBridgePrerequisitesAccountRows,
  buildBalanceBridgePrerequisitesCoverageSummary,
} from "./balance-bridge-prerequisites-accounts";
import {
  buildBalanceBridgePrerequisitesLimitations,
  buildBalanceBridgePrerequisitesStatus,
} from "./balance-bridge-prerequisites-status";
import { buildSharedSourceDiagnostics } from "./diagnostics";

export function buildFinanceBalanceBridgePrerequisitesView(input: {
  accountBridgeReadiness: FinanceAccountBridgeReadinessStatus;
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
}): FinanceBalanceBridgePrerequisitesView {
  const accounts = buildBalanceBridgePrerequisitesAccountRows(input);
  const coverageSummary =
    buildBalanceBridgePrerequisitesCoverageSummary(accounts);
  const diagnostics = buildSharedSourceDiagnostics(input.sliceAlignment);
  const balanceBridgePrerequisites = buildBalanceBridgePrerequisitesStatus({
    accountBridgeReadiness: input.accountBridgeReadiness,
    coverageSummary,
    sliceAlignment: input.sliceAlignment,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
  });
  const limitations = buildBalanceBridgePrerequisitesLimitations({
    balanceBridgePrerequisites,
    chartOfAccountsSlice: input.chartOfAccountsSlice,
    chartOfAccountsSourceId:
      input.chartOfAccountsSlice.latestSource?.sourceId ?? null,
    existing: input.limitations,
    sharedSourceId: input.sliceAlignment.sharedSourceId,
    sliceAlignment: input.sliceAlignment,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
  });

  return FinanceBalanceBridgePrerequisitesViewSchema.parse({
    company: input.company,
    chartOfAccountsSlice: input.chartOfAccountsSlice,
    trialBalanceSlice: input.trialBalanceSlice,
    generalLedgerSlice: input.generalLedgerSlice,
    freshness: input.freshness,
    sliceAlignment: input.sliceAlignment,
    comparability: input.comparability,
    accountBridgeReadiness: input.accountBridgeReadiness,
    balanceBridgePrerequisites,
    coverageSummary,
    accounts,
    diagnostics,
    limitations,
  });
}
