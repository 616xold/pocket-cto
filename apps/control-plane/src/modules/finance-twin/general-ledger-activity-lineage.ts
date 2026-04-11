import {
  FinanceGeneralLedgerActivityLineageViewSchema,
  type FinanceCompanyRecord,
  type FinanceGeneralLedgerActivityLineageView,
  type FinanceGeneralLedgerEntryView,
} from "@pocket-cto/domain";

export function buildFinanceGeneralLedgerActivityLineageView(input: {
  company: FinanceCompanyRecord;
  entries: FinanceGeneralLedgerEntryView[];
  ledgerAccountId: string;
  limitations: string[];
  syncRunId: string | null;
}): FinanceGeneralLedgerActivityLineageView {
  const records = input.entries.flatMap((entry) =>
    entry.lines
      .filter((line) => line.ledgerAccount.id === input.ledgerAccountId)
      .map((line) => ({
        journalEntry: entry.journalEntry,
        journalLine: line.journalLine,
        journalEntryLineage: {
          targetKind: "journal_entry" as const,
          targetId: entry.journalEntry.id,
          syncRunId: input.syncRunId,
        },
        journalLineLineage: {
          targetKind: "journal_line" as const,
          targetId: line.journalLine.id,
          syncRunId: input.syncRunId,
        },
      })),
  );
  const journalEntryCount = new Set(
    records.map((record) => record.journalEntry.id),
  ).size;
  const firstRecord = records[0];
  const activityWindow =
    firstRecord === undefined
      ? null
      : {
          earliestEntryDate: records.reduce(
            (earliest, record) =>
              record.journalEntry.transactionDate < earliest
                ? record.journalEntry.transactionDate
                : earliest,
            firstRecord.journalEntry.transactionDate,
          ),
          latestEntryDate: records.reduce(
            (latest, record) =>
              record.journalEntry.transactionDate > latest
                ? record.journalEntry.transactionDate
                : latest,
            firstRecord.journalEntry.transactionDate,
          ),
        };

  return FinanceGeneralLedgerActivityLineageViewSchema.parse({
    company: input.company,
    target: {
      ledgerAccountId: input.ledgerAccountId,
      syncRunId: input.syncRunId,
    },
    recordCount: records.length,
    journalEntryCount,
    journalLineCount: records.length,
    activityWindow,
    records,
    limitations: Array.from(new Set(input.limitations)),
  });
}
