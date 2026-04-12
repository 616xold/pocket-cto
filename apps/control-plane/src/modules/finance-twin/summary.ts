import type {
  FinanceAccountCatalogEntryView,
  FinanceGeneralLedgerEntryView,
  FinanceTrialBalanceLineRecord,
} from "@pocket-cto/domain";

export const FINANCE_TWIN_LIMITATIONS = [
  "The current finance-twin surface covers deterministic trial-balance CSV, chart-of-accounts CSV, general-ledger CSV, bank-account-summary CSV, receivables-aging CSV, and payables-aging CSV extraction, plus additive summary, snapshot, bank-account inventory, cash-posture, receivables-aging, collections-posture, payables-aging, payables-posture, reconciliation, account-bridge, balance-bridge-prerequisites, period-context, source-backed general-ledger balance-proof, and balance-proof lineage drill read models.",
  "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
];

export function buildTrialBalanceSummary(
  lines: FinanceTrialBalanceLineRecord[],
) {
  let totalDebit = 0n;
  let totalCredit = 0n;
  let totalNet = 0n;
  const currencyCodes = new Set<string>();

  for (const line of lines) {
    totalDebit += parseMoney(line.debitAmount);
    totalCredit += parseMoney(line.creditAmount);
    totalNet += parseMoney(line.netAmount);
    if (line.currencyCode) {
      currencyCodes.add(line.currencyCode);
    }
  }

  return {
    accountCount: new Set(lines.map((line) => line.ledgerAccountId)).size,
    lineCount: lines.length,
    totalDebitAmount: formatMoney(totalDebit),
    totalCreditAmount: formatMoney(totalCredit),
    totalNetAmount: formatMoney(totalNet),
    currencyCode:
      currencyCodes.size === 1 ? (Array.from(currencyCodes)[0] ?? null) : null,
  };
}

export function buildChartOfAccountsSummary(
  accounts: FinanceAccountCatalogEntryView[],
) {
  return {
    accountCount: accounts.length,
    activeAccountCount: accounts.filter(
      (account) => account.catalogEntry.isActive === true,
    ).length,
    inactiveAccountCount: accounts.filter(
      (account) => account.catalogEntry.isActive === false,
    ).length,
    parentLinkedCount: accounts.filter(
      (account) => account.catalogEntry.parentAccountCode !== null,
    ).length,
  };
}

export function buildGeneralLedgerSummary(
  entries: FinanceGeneralLedgerEntryView[],
) {
  let totalDebit = 0n;
  let totalCredit = 0n;
  let earliestEntryDate: string | null = null;
  let latestEntryDate: string | null = null;
  let journalLineCount = 0;
  const ledgerAccountIds = new Set<string>();
  const currencyCodes = new Set<string>();

  for (const entry of entries) {
    const entryDate = entry.journalEntry.transactionDate;

    if (earliestEntryDate === null || entryDate < earliestEntryDate) {
      earliestEntryDate = entryDate;
    }

    if (latestEntryDate === null || entryDate > latestEntryDate) {
      latestEntryDate = entryDate;
    }

    for (const line of entry.lines) {
      journalLineCount += 1;
      ledgerAccountIds.add(line.ledgerAccount.id);
      totalDebit += parseMoney(line.journalLine.debitAmount);
      totalCredit += parseMoney(line.journalLine.creditAmount);
      if (line.journalLine.currencyCode) {
        currencyCodes.add(line.journalLine.currencyCode);
      }
    }
  }

  if (!earliestEntryDate || !latestEntryDate) {
    throw new Error(
      "General-ledger summary requires at least one journal entry",
    );
  }

  return {
    journalEntryCount: entries.length,
    journalLineCount,
    ledgerAccountCount: ledgerAccountIds.size,
    totalDebitAmount: formatMoney(totalDebit),
    totalCreditAmount: formatMoney(totalCredit),
    earliestEntryDate,
    latestEntryDate,
    currencyCode:
      currencyCodes.size === 1 ? (Array.from(currencyCodes)[0] ?? null) : null,
  };
}

export function parseMoney(value: string) {
  const normalized = value.startsWith("-") ? value.slice(1) : value;
  const [wholePart = "0", fractionalPart = "00"] = normalized.split(".");
  const cents =
    BigInt(wholePart) * 100n + BigInt((fractionalPart + "00").slice(0, 2));

  return value.startsWith("-") ? -cents : cents;
}

export function formatMoney(cents: bigint) {
  const absolute = cents < 0n ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "-" : ""}${whole.toString()}.${fraction}`;
}
