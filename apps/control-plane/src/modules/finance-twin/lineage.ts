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
  bankAccountCount: 0,
  bankAccountSummaryCount: 0,
  customerCount: 0,
  receivablesAgingRowCount: 0,
  vendorCount: 0,
  payablesAgingRowCount: 0,
  contractCount: 0,
  contractObligationCount: 0,
  trialBalanceLineCount: 0,
  accountCatalogEntryCount: 0,
  journalEntryCount: 0,
  journalLineCount: 0,
  generalLedgerBalanceProofCount: 0,
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
      case "bank_account":
        counts.bankAccountCount += 1;
        break;
      case "bank_account_summary":
        counts.bankAccountSummaryCount += 1;
        break;
      case "customer":
        counts.customerCount += 1;
        break;
      case "receivables_aging_row":
        counts.receivablesAgingRowCount += 1;
        break;
      case "vendor":
        counts.vendorCount += 1;
        break;
      case "payables_aging_row":
        counts.payablesAgingRowCount += 1;
        break;
      case "contract":
        counts.contractCount += 1;
        break;
      case "contract_obligation":
        counts.contractObligationCount += 1;
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
      case "general_ledger_balance_proof":
        counts.generalLedgerBalanceProofCount += 1;
        break;
    }
  }

  return counts;
}

export function buildFinanceLineageRecordViews(input: {
  records: FinanceTwinLineageRecord[];
  sourceFilesById: Map<string, SourceFileRecord>;
  sourcesById: Map<string, SourceRecord>;
  sourceSnapshotsById: Map<string, SourceSnapshotRecord>;
  syncRunsById: Map<string, FinanceTwinSyncRunRecord>;
}): FinanceLineageRecordView[] {
  return input.records.map((record) => {
    const syncRun = input.syncRunsById.get(record.syncRunId);
    const source = input.sourcesById.get(record.sourceId);
    const sourceSnapshot = input.sourceSnapshotsById.get(
      record.sourceSnapshotId,
    );
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
  const records = buildFinanceLineageRecordViews({
    records: input.records,
    syncRunsById: input.syncRunsById,
    sourcesById: input.sourcesById,
    sourceSnapshotsById: input.sourceSnapshotsById,
    sourceFilesById: input.sourceFilesById,
  });

  return FinanceLineageDrillViewSchema.parse({
    company: input.company,
    target: input.target,
    recordCount: records.length,
    records,
    limitations: input.limitations,
  });
}
