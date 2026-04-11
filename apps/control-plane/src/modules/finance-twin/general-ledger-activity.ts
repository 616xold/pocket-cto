import type {
  FinanceGeneralLedgerActivity,
  FinanceGeneralLedgerEntryView,
  FinanceLedgerAccountRecord,
} from "@pocket-cto/domain";
import { formatMoney, parseMoney } from "./summary";

export type GeneralLedgerActivityByAccount = Map<
  string,
  {
    activity: FinanceGeneralLedgerActivity;
    ledgerAccount: FinanceLedgerAccountRecord;
  }
>;

export function buildGeneralLedgerActivityByAccountId(
  entries: FinanceGeneralLedgerEntryView[],
): GeneralLedgerActivityByAccount {
  const activityByAccountId = new Map<
    string,
    {
      earliestEntryDate: string;
      journalEntryIds: Set<string>;
      journalLineCount: number;
      latestEntryDate: string;
      ledgerAccount: FinanceLedgerAccountRecord;
      totalCredit: bigint;
      totalDebit: bigint;
    }
  >();

  for (const entry of entries) {
    for (const line of entry.lines) {
      const existing = activityByAccountId.get(line.ledgerAccount.id);
      const activity =
        existing ?? {
          ledgerAccount: line.ledgerAccount,
          journalEntryIds: new Set<string>(),
          journalLineCount: 0,
          totalDebit: 0n,
          totalCredit: 0n,
          earliestEntryDate: entry.journalEntry.transactionDate,
          latestEntryDate: entry.journalEntry.transactionDate,
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
        },
      },
    ]),
  );
}
