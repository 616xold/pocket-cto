import {
  FinanceBankAccountInventoryViewSchema,
  type FinanceBankAccountInventoryRow,
  type FinanceBankAccountInventoryView,
  type FinanceBankAccountSummarySliceSummary,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulBankAccountSummarySlice,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import type { FinanceBankAccountSummaryView } from "./repository";

export function buildBankAccountSummarySliceSummary(
  summaries: FinanceBankAccountSummaryView[],
): FinanceBankAccountSummarySliceSummary {
  const bankAccountIds = new Set<string>();
  const currencyCodes = new Set<string>();

  for (const summary of summaries) {
    bankAccountIds.add(summary.bankAccount.id);
    if (summary.summary.currencyCode) {
      currencyCodes.add(summary.summary.currencyCode);
    }
  }

  return {
    bankAccountCount: bankAccountIds.size,
    summaryRowCount: summaries.length,
    statementOrLedgerBalanceCount: summaries.filter(
      (summary) => summary.summary.balanceType === "statement_or_ledger",
    ).length,
    availableBalanceCount: summaries.filter(
      (summary) => summary.summary.balanceType === "available",
    ).length,
    unspecifiedBalanceCount: summaries.filter(
      (summary) => summary.summary.balanceType === "unspecified",
    ).length,
    datedBalanceCount: summaries.filter(
      (summary) => summary.summary.asOfDate !== null,
    ).length,
    undatedBalanceCount: summaries.filter(
      (summary) => summary.summary.asOfDate === null,
    ).length,
    currencyCount: currencyCodes.size,
  };
}

export function buildFinanceBankAccountInventoryView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulBankAccountSummarySlice;
  limitations: string[];
  summaries: FinanceBankAccountSummaryView[];
}): FinanceBankAccountInventoryView {
  const accounts = buildBankAccountInventoryRows(input.summaries);
  const diagnostics = buildInventoryDiagnostics(accounts, input.summaries);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulSlice.latestSyncRun === null) {
    limitations.push(
      "No successful bank-account-summary slice exists yet for this company.",
    );
  }

  limitations.push(
    "This route only exposes persisted bank-account summary rows from the latest successful bank-summary slice; it does not include bank transactions or reconciliation state.",
  );
  limitations.push(
    "Ambiguous generic balance fields remain in the unspecified bucket and are not relabeled as statement, ledger, or available balances.",
  );

  return FinanceBankAccountInventoryViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulSlice: input.latestSuccessfulSlice,
    freshness: input.freshness,
    accountCount: accounts.length,
    accounts,
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildBankAccountInventoryRows(
  summaries: FinanceBankAccountSummaryView[],
): FinanceBankAccountInventoryRow[] {
  const rowsByBankAccountId = new Map<string, FinanceBankAccountSummaryView[]>();

  for (const summary of summaries) {
    const rows = rowsByBankAccountId.get(summary.bankAccount.id) ?? [];
    rows.push(summary);
    rowsByBankAccountId.set(summary.bankAccount.id, rows);
  }

  return Array.from(rowsByBankAccountId.values())
    .sort((left, right) => {
      return (
        left[0]?.bankAccount.accountLabel.localeCompare(
          right[0]?.bankAccount.accountLabel ?? "",
        ) ?? 0
      );
    })
    .map((group) => {
      const bankAccount = group[0]?.bankAccount;

      if (!bankAccount) {
        throw new Error("Bank-account inventory group was unexpectedly empty");
      }

      const knownAsOfDates = Array.from(
        new Set(
          group
            .map((summary) => summary.summary.asOfDate)
            .filter((value): value is string => value !== null),
        ),
      ).sort();
      const currencyCodes = Array.from(
        new Set(
          group
            .map((summary) => summary.summary.currencyCode)
            .filter((value): value is string => value !== null),
        ),
      ).sort();

      return {
        bankAccount,
        reportedBalances: group
          .slice()
          .sort((left, right) => {
            return (
              left.summary.lineNumber - right.summary.lineNumber ||
              left.summary.balanceType.localeCompare(right.summary.balanceType)
            );
          })
          .map((summary) => ({
            summary: summary.summary,
            lineageRef: {
              targetKind: "bank_account_summary" as const,
              targetId: summary.summary.id,
              syncRunId: summary.summary.syncRunId,
            },
          })),
        currencyCodes,
        knownAsOfDates,
        unknownAsOfDateBalanceCount: group.filter(
          (summary) => summary.summary.asOfDate === null,
        ).length,
        hasMixedAsOfDates: knownAsOfDates.length > 1,
      } satisfies FinanceBankAccountInventoryRow;
    });
}

function buildInventoryDiagnostics(
  accounts: FinanceBankAccountInventoryRow[],
  summaries: FinanceBankAccountSummaryView[],
) {
  const diagnostics: string[] = [];

  if (summaries.some((summary) => summary.summary.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted bank-summary balances are missing an explicit currency code.",
    );
  }

  if (accounts.some((account) => account.hasMixedAsOfDates)) {
    diagnostics.push(
      "One or more bank accounts include multiple explicit as-of dates across reported balance families in the latest successful bank-summary slice.",
    );
  }

  if (summaries.some((summary) => summary.summary.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted bank-summary balances do not include an explicit as-of date.",
    );
  }

  return dedupeMessages(diagnostics);
}
