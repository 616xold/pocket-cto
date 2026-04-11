import {
  FinanceSnapshotViewSchema,
  type FinanceAccountCatalogEntryView,
  type FinanceCompanyRecord,
  type FinanceCompanyTotals,
  type FinanceFreshnessView,
  type FinanceGeneralLedgerEntryView,
  type FinanceLatestAttemptedSlices,
  type FinanceLatestSuccessfulSlices,
  type FinanceSnapshotAccountRow,
  type FinanceSnapshotView,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import {
  buildGeneralLedgerActivityByAccountId,
  type GeneralLedgerActivityByAccount,
} from "./general-ledger-activity";
import { buildFinanceSliceAlignment } from "./slice-alignment";

const IMPLEMENTED_SLICE_COUNT = 3;

type SliceAvailability = {
  chartOfAccounts: boolean;
  generalLedger: boolean;
  trialBalance: boolean;
};

export function buildFinanceSnapshotView(input: {
  chartOfAccountsEntries: FinanceAccountCatalogEntryView[];
  company: FinanceCompanyRecord;
  companyTotals: FinanceCompanyTotals;
  freshness: FinanceFreshnessView;
  generalLedgerEntries: FinanceGeneralLedgerEntryView[];
  latestAttemptedSlices: FinanceLatestAttemptedSlices;
  latestSuccessfulSlices: FinanceLatestSuccessfulSlices;
  limitations: string[];
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}): FinanceSnapshotView {
  const sliceAvailability = resolveSliceAvailability(input.latestSuccessfulSlices);
  const generalLedgerActivityByAccountId = buildGeneralLedgerActivityByAccountId(
    input.generalLedgerEntries,
  );
  const accounts = buildSnapshotAccounts({
    chartOfAccountsEntries: input.chartOfAccountsEntries,
    generalLedgerActivityByAccountId,
    latestSuccessfulSlices: input.latestSuccessfulSlices,
    sliceAvailability,
    trialBalanceLineViews: input.trialBalanceLineViews,
  });
  const sliceAlignment = buildFinanceSliceAlignment({
    latestSources: [
      input.latestSuccessfulSlices.trialBalance.latestSource,
      input.latestSuccessfulSlices.chartOfAccounts.latestSource,
      input.latestSuccessfulSlices.generalLedger.latestSource,
    ],
    implementedSliceCount: IMPLEMENTED_SLICE_COUNT,
    subjectLabel: "finance slices",
    viewLabel: "company snapshot",
  });
  const limitations = buildSnapshotLimitations({
    existing: input.limitations,
    sliceAlignment,
    sliceAvailability,
  });

  return FinanceSnapshotViewSchema.parse({
    company: input.company,
    companyTotals: input.companyTotals,
    freshness: input.freshness,
    latestAttemptedSlices: input.latestAttemptedSlices,
    latestSuccessfulSlices: input.latestSuccessfulSlices,
    sliceAlignment,
    coverageSummary: buildCoverageSummary(accounts),
    accounts,
    limitations,
  });
}

function buildSnapshotAccounts(input: {
  chartOfAccountsEntries: FinanceAccountCatalogEntryView[];
  generalLedgerActivityByAccountId: GeneralLedgerActivityByAccount;
  latestSuccessfulSlices: FinanceLatestSuccessfulSlices;
  sliceAvailability: SliceAvailability;
  trialBalanceLineViews: FinanceTrialBalanceLineView[];
}) {
  const accountCatalogByAccountId = new Map(
    input.chartOfAccountsEntries.map((entry) => [entry.ledgerAccount.id, entry]),
  );
  const trialBalanceByAccountId = new Map(
    input.trialBalanceLineViews.map((lineView) => [lineView.ledgerAccount.id, lineView]),
  );
  const ledgerAccountsById = new Map<string, FinanceSnapshotAccountRow["ledgerAccount"]>();

  for (const entry of input.chartOfAccountsEntries) {
    ledgerAccountsById.set(entry.ledgerAccount.id, entry.ledgerAccount);
  }

  for (const lineView of input.trialBalanceLineViews) {
    ledgerAccountsById.set(lineView.ledgerAccount.id, lineView.ledgerAccount);
  }

  for (const [ledgerAccountId, activity] of input.generalLedgerActivityByAccountId) {
    ledgerAccountsById.set(ledgerAccountId, activity.ledgerAccount);
  }

  return Array.from(ledgerAccountsById.values())
    .sort((left, right) => left.accountCode.localeCompare(right.accountCode))
    .map((ledgerAccount) => {
      const chartOfAccountsEntry =
        accountCatalogByAccountId.get(ledgerAccount.id) ?? null;
      const trialBalanceLineView = trialBalanceByAccountId.get(ledgerAccount.id) ?? null;
      const generalLedgerActivity =
        input.generalLedgerActivityByAccountId.get(ledgerAccount.id)?.activity ?? null;
      const presentInChartOfAccounts = chartOfAccountsEntry !== null;
      const presentInTrialBalance = trialBalanceLineView !== null;
      const presentInGeneralLedger = generalLedgerActivity !== null;
      const inactiveWithGeneralLedgerActivity =
        chartOfAccountsEntry?.catalogEntry.isActive === false && presentInGeneralLedger;

      return {
        ledgerAccount,
        chartOfAccountsEntry: chartOfAccountsEntry?.catalogEntry ?? null,
        trialBalanceLine: trialBalanceLineView?.trialBalanceLine ?? null,
        generalLedgerActivity,
        presentInChartOfAccounts,
        presentInTrialBalance,
        presentInGeneralLedger,
        missingFromChartOfAccounts:
          input.sliceAvailability.chartOfAccounts && !presentInChartOfAccounts,
        missingFromTrialBalance:
          input.sliceAvailability.trialBalance && !presentInTrialBalance,
        missingFromGeneralLedger:
          input.sliceAvailability.generalLedger && !presentInGeneralLedger,
        inactiveWithGeneralLedgerActivity,
        activityLineageRef:
          presentInGeneralLedger &&
          input.latestSuccessfulSlices.generalLedger.latestSyncRun
            ? {
                ledgerAccountId: ledgerAccount.id,
                syncRunId: input.latestSuccessfulSlices.generalLedger.latestSyncRun.id,
              }
            : null,
        lineageTargets: {
          ledgerAccount: {
            targetKind: "ledger_account",
            targetId: ledgerAccount.id,
            syncRunId: null,
          },
          chartOfAccountsEntry: chartOfAccountsEntry
            ? {
                targetKind: "account_catalog_entry",
                targetId: chartOfAccountsEntry.catalogEntry.id,
                syncRunId: chartOfAccountsEntry.catalogEntry.syncRunId,
              }
            : null,
          trialBalanceLine: trialBalanceLineView
            ? {
                targetKind: "trial_balance_line",
                targetId: trialBalanceLineView.trialBalanceLine.id,
                syncRunId: trialBalanceLineView.trialBalanceLine.syncRunId,
              }
            : null,
        },
      } satisfies FinanceSnapshotAccountRow;
    });
}

function buildCoverageSummary(accounts: FinanceSnapshotAccountRow[]) {
  return {
    accountRowCount: accounts.length,
    chartOfAccountsAccountCount: accounts.filter(
      (account) => account.presentInChartOfAccounts,
    ).length,
    trialBalanceAccountCount: accounts.filter(
      (account) => account.presentInTrialBalance,
    ).length,
    generalLedgerActiveAccountCount: accounts.filter(
      (account) => account.presentInGeneralLedger,
    ).length,
    accountsPresentInAllImplementedSlicesCount: accounts.filter((account) => {
      return (
        account.presentInChartOfAccounts &&
        account.presentInTrialBalance &&
        account.presentInGeneralLedger
      );
    }).length,
    missingFromChartOfAccountsCount: accounts.filter(
      (account) => account.missingFromChartOfAccounts,
    ).length,
    missingFromTrialBalanceCount: accounts.filter(
      (account) => account.missingFromTrialBalance,
    ).length,
    missingFromGeneralLedgerCount: accounts.filter(
      (account) => account.missingFromGeneralLedger,
    ).length,
    inactiveAccountCount: accounts.filter(
      (account) => account.chartOfAccountsEntry?.isActive === false,
    ).length,
    inactiveWithGeneralLedgerActivityCount: accounts.filter(
      (account) => account.inactiveWithGeneralLedgerActivity,
    ).length,
  };
}

function buildSnapshotLimitations(input: {
  existing: string[];
  sliceAlignment: FinanceSnapshotView["sliceAlignment"];
  sliceAvailability: SliceAvailability;
}) {
  const limitations = [...input.existing];

  if (!input.sliceAvailability.chartOfAccounts) {
    limitations.push(
      "No successful chart-of-accounts slice exists yet for this company snapshot.",
    );
  }

  if (!input.sliceAvailability.trialBalance) {
    limitations.push(
      "No successful trial-balance slice exists yet for this company snapshot.",
    );
  }

  if (!input.sliceAvailability.generalLedger) {
    limitations.push(
      "No successful general-ledger slice exists yet for this company snapshot.",
    );
  }

  if (input.sliceAlignment.state === "partial") {
    limitations.push(input.sliceAlignment.reasonSummary);
  }

  if (
    input.sliceAlignment.state === "shared_source" &&
    (!input.sliceAlignment.sameSourceSnapshot || !input.sliceAlignment.sameSyncRun)
  ) {
    limitations.push(input.sliceAlignment.reasonSummary);
  }

  if (input.sliceAlignment.state === "mixed") {
    limitations.push(
      "Do not treat this company snapshot as one coherent close package because the latest successful slices are mixed across different registered sources.",
    );
  }

  return Array.from(new Set(limitations));
}

function resolveSliceAvailability(
  latestSuccessfulSlices: FinanceLatestSuccessfulSlices,
): SliceAvailability {
  return {
    chartOfAccounts: latestSuccessfulSlices.chartOfAccounts.latestSyncRun !== null,
    generalLedger: latestSuccessfulSlices.generalLedger.latestSyncRun !== null,
    trialBalance: latestSuccessfulSlices.trialBalance.latestSyncRun !== null,
  };
}
