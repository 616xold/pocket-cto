import {
  FinanceSnapshotViewSchema,
  type FinanceAccountCatalogEntryView,
  type FinanceCompanyRecord,
  type FinanceCompanyTotals,
  type FinanceFreshnessView,
  type FinanceGeneralLedgerActivity,
  type FinanceGeneralLedgerEntryView,
  type FinanceLatestAttemptedSlices,
  type FinanceLatestSuccessfulSlices,
  type FinanceSnapshotAccountRow,
  type FinanceSnapshotView,
} from "@pocket-cto/domain";
import type { FinanceTrialBalanceLineView } from "./repository";
import { formatMoney, parseMoney } from "./summary";

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
  const sliceAlignment = buildSliceAlignment(input.latestSuccessfulSlices);
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
  generalLedgerActivityByAccountId: Map<
    string,
    {
      activity: FinanceGeneralLedgerActivity;
      ledgerAccount: FinanceTrialBalanceLineView["ledgerAccount"];
    }
  >;
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
          generalLedger:
            presentInGeneralLedger &&
            input.latestSuccessfulSlices.generalLedger.latestSyncRun
              ? {
                  targetKind: "ledger_account",
                  targetId: ledgerAccount.id,
                  syncRunId: input.latestSuccessfulSlices.generalLedger.latestSyncRun.id,
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

function buildSliceAlignment(latestSuccessfulSlices: FinanceLatestSuccessfulSlices) {
  const availableSources = [
    latestSuccessfulSlices.trialBalance.latestSource,
    latestSuccessfulSlices.chartOfAccounts.latestSource,
    latestSuccessfulSlices.generalLedger.latestSource,
  ].filter((source): source is NonNullable<typeof source> => source !== null);
  const distinctSyncRunIds = new Set(
    availableSources.map((source) => source.syncRunId),
  );
  const distinctSourceSnapshotIds = new Set(
    availableSources.map((source) => source.sourceSnapshotId),
  );
  const sameSyncRun =
    availableSources.length > 0 && distinctSyncRunIds.size === 1;
  const sameSourceSnapshot =
    availableSources.length > 0 && distinctSourceSnapshotIds.size === 1;
  const sharedSyncRunId =
    sameSyncRun ? (availableSources[0]?.syncRunId ?? null) : null;
  const sharedSourceSnapshotId = sameSourceSnapshot
    ? (availableSources[0]?.sourceSnapshotId ?? null)
    : null;
  const availableSliceCount = availableSources.length;

  if (availableSliceCount === 0) {
    return {
      state: "empty",
      implementedSliceCount: IMPLEMENTED_SLICE_COUNT,
      availableSliceCount,
      distinctSyncRunCount: 0,
      distinctSourceSnapshotCount: 0,
      sameSyncRun: false,
      sameSourceSnapshot: false,
      sharedSyncRunId: null,
      sharedSourceSnapshotId: null,
      reasonCode: "no_successful_slices",
      reasonSummary:
        "No implemented finance slice has completed a successful sync for this company yet.",
    } as const;
  }

  if (availableSliceCount < IMPLEMENTED_SLICE_COUNT) {
    return {
      state: "partial",
      implementedSliceCount: IMPLEMENTED_SLICE_COUNT,
      availableSliceCount,
      distinctSyncRunCount: distinctSyncRunIds.size,
      distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
      sameSyncRun,
      sameSourceSnapshot,
      sharedSyncRunId,
      sharedSourceSnapshotId,
      reasonCode: "missing_successful_slice",
      reasonSummary:
        "The company snapshot is partial because one or more implemented finance slices do not have a successful sync yet.",
    } as const;
  }

  if (sameSyncRun && sameSourceSnapshot) {
    return {
      state: "aligned",
      implementedSliceCount: IMPLEMENTED_SLICE_COUNT,
      availableSliceCount,
      distinctSyncRunCount: distinctSyncRunIds.size,
      distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
      sameSyncRun,
      sameSourceSnapshot,
      sharedSyncRunId,
      sharedSourceSnapshotId,
      reasonCode: "shared_sync_run",
      reasonSummary:
        "The latest successful trial-balance, chart-of-accounts, and general-ledger slices all came from the same sync run and source snapshot.",
    } as const;
  }

  return {
    state: "mixed",
    implementedSliceCount: IMPLEMENTED_SLICE_COUNT,
    availableSliceCount,
    distinctSyncRunCount: distinctSyncRunIds.size,
    distinctSourceSnapshotCount: distinctSourceSnapshotIds.size,
    sameSyncRun,
    sameSourceSnapshot,
    sharedSyncRunId,
    sharedSourceSnapshotId,
    reasonCode: sameSourceSnapshot
      ? "mixed_sync_runs"
      : "mixed_source_snapshots",
    reasonSummary: sameSourceSnapshot
      ? "The latest successful finance slices share one source snapshot but span different sync runs."
      : "The latest successful finance slices are mixed across different source snapshots and sync runs.",
  } as const;
}

function buildSnapshotLimitations(input: {
  existing: string[];
  sliceAlignment: ReturnType<typeof buildSliceAlignment>;
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

  if (input.sliceAlignment.state === "mixed") {
    limitations.push(
      "Do not treat this company snapshot as one coherent close package because the latest successful slices are mixed.",
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

function buildGeneralLedgerActivityByAccountId(
  entries: FinanceGeneralLedgerEntryView[],
) {
  const activityByAccountId = new Map<
    string,
    {
      earliestEntryDate: string;
      journalEntryIds: Set<string>;
      journalLineCount: number;
      latestEntryDate: string;
      ledgerAccount: FinanceTrialBalanceLineView["ledgerAccount"];
      totalCredit: bigint;
      totalDebit: bigint;
    }
  >();

  for (const entry of entries) {
    for (const line of entry.lines) {
      const existing = activityByAccountId.get(line.ledgerAccount.id);
      const activity =
        existing ??
        {
          earliestEntryDate: entry.journalEntry.transactionDate,
          journalEntryIds: new Set<string>(),
          journalLineCount: 0,
          latestEntryDate: entry.journalEntry.transactionDate,
          ledgerAccount: line.ledgerAccount,
          totalCredit: 0n,
          totalDebit: 0n,
        };

      activity.journalEntryIds.add(entry.journalEntry.id);
      activity.journalLineCount += 1;
      activity.totalDebit += parseMoney(line.journalLine.debitAmount);
      activity.totalCredit += parseMoney(line.journalLine.creditAmount);
      if (entry.journalEntry.transactionDate < activity.earliestEntryDate) {
        activity.earliestEntryDate = entry.journalEntry.transactionDate;
      }
      if (entry.journalEntry.transactionDate > activity.latestEntryDate) {
        activity.latestEntryDate = entry.journalEntry.transactionDate;
      }

      activityByAccountId.set(line.ledgerAccount.id, activity);
    }
  }

  return new Map(
    Array.from(activityByAccountId.entries()).map(([ledgerAccountId, activity]) => [
      ledgerAccountId,
      {
        ledgerAccount: activity.ledgerAccount,
        activity: {
          journalEntryCount: activity.journalEntryIds.size,
          journalLineCount: activity.journalLineCount,
          totalDebitAmount: formatMoney(activity.totalDebit),
          totalCreditAmount: formatMoney(activity.totalCredit),
          earliestEntryDate: activity.earliestEntryDate,
          latestEntryDate: activity.latestEntryDate,
        } satisfies FinanceGeneralLedgerActivity,
      },
    ]),
  );
}
