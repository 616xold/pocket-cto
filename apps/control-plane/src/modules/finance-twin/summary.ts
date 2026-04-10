import type {
  FinanceAccountCatalogEntryView,
  FinanceTrialBalanceLineRecord,
} from "@pocket-cto/domain";

export const FINANCE_TWIN_LIMITATIONS = [
  "F2B only covers deterministic trial-balance CSV and chart-of-accounts CSV extraction.",
  "CFO Wiki, finance discovery answers, reports, monitoring, and close/control flows are not implemented in this slice.",
];

export function buildTrialBalanceSummary(lines: FinanceTrialBalanceLineRecord[]) {
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

function parseMoney(value: string) {
  const normalized = value.startsWith("-") ? value.slice(1) : value;
  const [wholePart = "0", fractionalPart = "00"] = normalized.split(".");
  const cents =
    BigInt(wholePart) * 100n + BigInt((fractionalPart + "00").slice(0, 2));

  return value.startsWith("-") ? -cents : cents;
}

function formatMoney(cents: bigint) {
  const absolute = cents < 0n ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return `${cents < 0n ? "-" : ""}${whole.toString()}.${fraction}`;
}
