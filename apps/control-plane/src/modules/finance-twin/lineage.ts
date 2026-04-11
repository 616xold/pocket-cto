import {
  FinanceLineageDrillViewSchema,
  type FinanceCompanyRecord,
  type FinanceLineageDrillView,
  type FinanceLineageLookupRef,
  type FinanceLineageRecordView,
  type FinanceLineageTargetCounts,
  type FinanceTwinLineageRecord,
  type FinanceTwinSyncRunRecord,
  type SourceFileRecord,
  type SourceRecord,
  type SourceSnapshotRecord,
} from "@pocket-cto/domain";

export const EMPTY_FINANCE_LINEAGE_TARGET_COUNTS: FinanceLineageTargetCounts = {
  reportingPeriodCount: 0,
  ledgerAccountCount: 0,
  trialBalanceLineCount: 0,
  accountCatalogEntryCount: 0,
  journalEntryCount: 0,
  journalLineCount: 0,
};

export function buildLineageTargetCounts(
  records: FinanceTwinLineageRecord[],
): FinanceLineageTargetCounts {
  const counts = { ...EMPTY_FINANCE_LINEAGE_TARGET_COUNTS };

  for (const record of records) {
    switch (record.targetKind) {
      case "reporting_period":
        counts.reportingPeriodCount += 1;
        break;
      case "ledger_account":
        counts.ledgerAccountCount += 1;
        break;
      case "trial_balance_line":
        counts.trialBalanceLineCount += 1;
        break;
      case "account_catalog_entry":
        counts.accountCatalogEntryCount += 1;
        break;
      case "journal_entry":
        counts.journalEntryCount += 1;
        break;
      case "journal_line":
        counts.journalLineCount += 1;
        break;
    }
  }

  return counts;
}

export function buildFinanceLineageDrillView(input: {
  company: FinanceCompanyRecord;
  limitations: string[];
  records: FinanceTwinLineageRecord[];
  sourceFilesById: Map<string, SourceFileRecord>;
  sourcesById: Map<string, SourceRecord>;
  sourceSnapshotsById: Map<string, SourceSnapshotRecord>;
  syncRunsById: Map<string, FinanceTwinSyncRunRecord>;
  target: FinanceLineageLookupRef;
}): FinanceLineageDrillView {
  const records = input.records.map((record) => {
    const syncRun = input.syncRunsById.get(record.syncRunId);
    const source = input.sourcesById.get(record.sourceId);
    const sourceSnapshot = input.sourceSnapshotsById.get(record.sourceSnapshotId);
    const sourceFile = input.sourceFilesById.get(record.sourceFileId);

    if (!syncRun || !source || !sourceSnapshot || !sourceFile) {
      throw new Error(
        `Finance lineage drill is missing metadata for target ${record.targetKind}:${record.targetId}`,
      );
    }

    return {
      lineage: record,
      syncRun,
      source,
      sourceSnapshot,
      sourceFile,
    } satisfies FinanceLineageRecordView;
  });

  return FinanceLineageDrillViewSchema.parse({
    company: input.company,
    target: input.target,
    recordCount: records.length,
    records,
    limitations: input.limitations,
  });
}
