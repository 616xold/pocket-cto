import type {
  financeAccountCatalogEntries,
  financeBankAccounts,
  financeBankAccountSummaries,
  financeCompanies,
  financeContractObligations,
  financeContracts,
  financeCustomers,
  financeGeneralLedgerBalanceProofs,
  financeJournalEntries,
  financeJournalLines,
  financeLedgerAccounts,
  financePayablesAgingRows,
  financeReceivablesAgingRows,
  financeReportingPeriods,
  financeTrialBalanceLines,
  financeTwinLineage,
  financeTwinSyncRuns,
  financeVendors,
} from "@pocket-cto/db";
import {
  FinanceContractObligationRecordSchema,
  FinanceContractSourceFieldMapSchema,
  FinancePayablesAgingBucketValueSchema,
  FinanceReceivablesAgingBucketValueSchema,
  type FinanceAccountCatalogEntryRecord,
  type FinanceAccountCatalogEntryView,
  type FinanceBankAccountRecord,
  type FinanceBankAccountSummaryRecord,
  type FinanceCompanyRecord,
  type FinanceContractObligationRecord,
  type FinanceCustomerRecord,
  type FinanceGeneralLedgerBalanceProofRecord,
  type FinanceJournalEntryRecord,
  type FinanceJournalLineRecord,
  type FinanceJournalLineView,
  type FinanceLedgerAccountRecord,
  type FinancePayablesAgingRowRecord,
  type FinanceReceivablesAgingRowRecord,
  type FinanceReportingPeriodRecord,
  type FinanceTrialBalanceLineRecord,
  type FinanceTwinLineageRecord,
  type FinanceTwinSyncRunRecord,
  type FinanceVendorRecord,
  type FinanceContractRecord,
} from "@pocket-cto/domain";

type FinanceAccountCatalogEntryRow =
  typeof financeAccountCatalogEntries.$inferSelect;
type FinanceBankAccountRow = typeof financeBankAccounts.$inferSelect;
type FinanceBankAccountSummaryRow = typeof financeBankAccountSummaries.$inferSelect;
type FinanceCompanyRow = typeof financeCompanies.$inferSelect;
type FinanceContractObligationRow = typeof financeContractObligations.$inferSelect;
type FinanceContractRow = typeof financeContracts.$inferSelect;
type FinanceCustomerRow = typeof financeCustomers.$inferSelect;
type FinanceGeneralLedgerBalanceProofRow =
  typeof financeGeneralLedgerBalanceProofs.$inferSelect;
type FinanceJournalEntryRow = typeof financeJournalEntries.$inferSelect;
type FinanceJournalLineRow = typeof financeJournalLines.$inferSelect;
type FinanceReportingPeriodRow = typeof financeReportingPeriods.$inferSelect;
type FinanceLedgerAccountRow = typeof financeLedgerAccounts.$inferSelect;
type FinancePayablesAgingRow = typeof financePayablesAgingRows.$inferSelect;
type FinanceReceivablesAgingRow = typeof financeReceivablesAgingRows.$inferSelect;
type FinanceTwinSyncRunRow = typeof financeTwinSyncRuns.$inferSelect;
type FinanceTrialBalanceLineRow = typeof financeTrialBalanceLines.$inferSelect;
type FinanceTwinLineageRow = typeof financeTwinLineage.$inferSelect;
type FinanceVendorRow = typeof financeVendors.$inferSelect;

export function mapFinanceAccountCatalogEntryRow(
  row: FinanceAccountCatalogEntryRow,
): FinanceAccountCatalogEntryRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    ledgerAccountId: row.ledgerAccountId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    detailType: row.detailType,
    description: row.description,
    parentAccountCode: row.parentAccountCode,
    isActive: row.isActive,
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceCompanyRow(
  row: FinanceCompanyRow,
): FinanceCompanyRecord {
  return {
    id: row.id,
    companyKey: row.companyKey,
    displayName: row.displayName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceBankAccountRow(
  row: FinanceBankAccountRow,
): FinanceBankAccountRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    accountLabel: row.accountLabel,
    institutionName: row.institutionName,
    externalAccountId: row.externalAccountId,
    accountNumberLast4: row.accountNumberLast4,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceBankAccountSummaryRow(
  row: FinanceBankAccountSummaryRow,
): FinanceBankAccountSummaryRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    bankAccountId: row.bankAccountId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    balanceType: row.balanceType,
    balanceAmount: row.balanceAmount,
    currencyCode: row.currencyCode,
    asOfDate: row.asOfDate,
    asOfDateSourceColumn: row.asOfDateSourceColumn,
    balanceSourceColumn: row.balanceSourceColumn,
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceCustomerRow(
  row: FinanceCustomerRow,
): FinanceCustomerRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    customerLabel: row.customerLabel,
    externalCustomerId: row.externalCustomerId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceVendorRow(
  row: FinanceVendorRow,
): FinanceVendorRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    vendorLabel: row.vendorLabel,
    externalVendorId: row.externalVendorId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceContractRow(
  row: FinanceContractRow,
): FinanceContractRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    sourceLineNumbers: row.sourceLineNumbers,
    contractLabel: row.contractLabel,
    externalContractId: row.externalContractId,
    counterpartyLabel: row.counterpartyLabel,
    contractType: row.contractType,
    agreementType: row.agreementType,
    status: row.status,
    startDate: row.startDate,
    effectiveDate: row.effectiveDate,
    endDate: row.endDate,
    expirationDate: row.expirationDate,
    renewalDate: row.renewalDate,
    noticeDeadline: row.noticeDeadline,
    nextPaymentDate: row.nextPaymentDate,
    knownAsOfDates: row.knownAsOfDates,
    unknownAsOfObservationCount: row.unknownAsOfObservationCount,
    amount: row.amount,
    paymentAmount: row.paymentAmount,
    currencyCode: row.currencyCode,
    autoRenew: row.autoRenew,
    sourceFieldMap: FinanceContractSourceFieldMapSchema.parse(row.sourceFieldMap),
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceContractObligationRow(
  row: FinanceContractObligationRow,
): FinanceContractObligationRecord {
  return FinanceContractObligationRecordSchema.parse({
    id: row.id,
    companyId: row.companyId,
    contractId: row.contractId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    sourceLineNumbers: row.sourceLineNumbers,
    obligationType: row.obligationType,
    dueDate: row.dueDate,
    amount: row.amount,
    currencyCode: row.currencyCode,
    sourceField: row.sourceField,
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function mapFinanceReceivablesAgingRow(
  row: FinanceReceivablesAgingRow,
): FinanceReceivablesAgingRowRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    customerId: row.customerId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    sourceLineNumbers: row.sourceLineNumbers,
    currencyCode: row.currencyCode,
    asOfDate: row.asOfDate,
    asOfDateSourceColumn: row.asOfDateSourceColumn,
    bucketValues: row.bucketValues.map((bucketValue) =>
      FinanceReceivablesAgingBucketValueSchema.parse(bucketValue),
    ),
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinancePayablesAgingRow(
  row: FinancePayablesAgingRow,
): FinancePayablesAgingRowRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    vendorId: row.vendorId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    sourceLineNumbers: row.sourceLineNumbers,
    currencyCode: row.currencyCode,
    asOfDate: row.asOfDate,
    asOfDateSourceColumn: row.asOfDateSourceColumn,
    bucketValues: row.bucketValues.map((bucketValue) =>
      FinancePayablesAgingBucketValueSchema.parse(bucketValue),
    ),
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceJournalEntryRow(
  row: FinanceJournalEntryRow,
): FinanceJournalEntryRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    syncRunId: row.syncRunId,
    externalEntryId: row.externalEntryId,
    transactionDate: row.transactionDate,
    entryDescription: row.entryDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceGeneralLedgerBalanceProofRow(
  row: FinanceGeneralLedgerBalanceProofRow,
): FinanceGeneralLedgerBalanceProofRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    ledgerAccountId: row.ledgerAccountId,
    syncRunId: row.syncRunId,
    openingBalanceAmount: row.openingBalanceAmount,
    openingBalanceSourceColumn: row.openingBalanceSourceColumn,
    openingBalanceLineNumber: row.openingBalanceLineNumber,
    endingBalanceAmount: row.endingBalanceAmount,
    endingBalanceSourceColumn: row.endingBalanceSourceColumn,
    endingBalanceLineNumber: row.endingBalanceLineNumber,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceJournalLineRow(
  row: FinanceJournalLineRow,
): FinanceJournalLineRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    journalEntryId: row.journalEntryId,
    ledgerAccountId: row.ledgerAccountId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    debitAmount: row.debitAmount,
    creditAmount: row.creditAmount,
    currencyCode: row.currencyCode,
    lineDescription: row.lineDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceReportingPeriodRow(
  row: FinanceReportingPeriodRow,
): FinanceReportingPeriodRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    periodKey: row.periodKey,
    label: row.label,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceLedgerAccountRow(
  row: FinanceLedgerAccountRow,
): FinanceLedgerAccountRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    accountCode: row.accountCode,
    accountName: row.accountName,
    accountType: row.accountType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceTwinSyncRunRow(
  row: FinanceTwinSyncRunRow,
): FinanceTwinSyncRunRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    reportingPeriodId: row.reportingPeriodId,
    sourceId: row.sourceId,
    sourceSnapshotId: row.sourceSnapshotId,
    sourceFileId: row.sourceFileId,
    extractorKey: row.extractorKey,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    stats: row.stats as Record<string, unknown>,
    errorSummary: row.errorSummary,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapFinanceTrialBalanceLineRow(
  row: FinanceTrialBalanceLineRow,
): FinanceTrialBalanceLineRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    reportingPeriodId: row.reportingPeriodId,
    ledgerAccountId: row.ledgerAccountId,
    syncRunId: row.syncRunId,
    lineNumber: row.lineNumber,
    debitAmount: row.debitAmount,
    creditAmount: row.creditAmount,
    netAmount: row.netAmount,
    currencyCode: row.currencyCode,
    observedAt: row.observedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinanceTwinLineageRow(
  row: FinanceTwinLineageRow,
): FinanceTwinLineageRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    syncRunId: row.syncRunId,
    targetKind: row.targetKind,
    targetId: row.targetId,
    sourceId: row.sourceId,
    sourceSnapshotId: row.sourceSnapshotId,
    sourceFileId: row.sourceFileId,
    recordedAt: row.recordedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapFinanceTrialBalanceLineViewRow(input: {
  trialBalanceLine: FinanceTrialBalanceLineRow;
  ledgerAccount: FinanceLedgerAccountRow;
}) {
  return {
    trialBalanceLine: mapFinanceTrialBalanceLineRow(input.trialBalanceLine),
    ledgerAccount: mapFinanceLedgerAccountRow(input.ledgerAccount),
  };
}

export function mapFinanceBankAccountSummaryViewRow(input: {
  bankAccount: FinanceBankAccountRow;
  summary: FinanceBankAccountSummaryRow;
}) {
  return {
    bankAccount: mapFinanceBankAccountRow(input.bankAccount),
    summary: mapFinanceBankAccountSummaryRow(input.summary),
  };
}

export function mapFinanceReceivablesAgingRowViewRow(input: {
  customer: FinanceCustomerRow;
  row: FinanceReceivablesAgingRow;
}) {
  return {
    customer: mapFinanceCustomerRow(input.customer),
    receivablesAgingRow: mapFinanceReceivablesAgingRow(input.row),
  };
}

export function mapFinancePayablesAgingRowViewRow(input: {
  vendor: FinanceVendorRow;
  row: FinancePayablesAgingRow;
}) {
  return {
    vendor: mapFinanceVendorRow(input.vendor),
    payablesAgingRow: mapFinancePayablesAgingRow(input.row),
  };
}

export function mapFinanceContractObligationViewRow(input: {
  contract: FinanceContractRow;
  obligation: FinanceContractObligationRow;
}) {
  return {
    contract: mapFinanceContractRow(input.contract),
    obligation: mapFinanceContractObligationRow(input.obligation),
  };
}

export function mapFinanceAccountCatalogEntryViewRow(input: {
  catalogEntry: FinanceAccountCatalogEntryRow;
  ledgerAccount: FinanceLedgerAccountRow;
}): FinanceAccountCatalogEntryView {
  return {
    catalogEntry: mapFinanceAccountCatalogEntryRow(input.catalogEntry),
    ledgerAccount: mapFinanceLedgerAccountRow(input.ledgerAccount),
  };
}

export function mapFinanceJournalLineViewRow(input: {
  journalLine: FinanceJournalLineRow;
  ledgerAccount: FinanceLedgerAccountRow;
}): FinanceJournalLineView {
  return {
    journalLine: mapFinanceJournalLineRow(input.journalLine),
    ledgerAccount: mapFinanceLedgerAccountRow(input.ledgerAccount),
  };
}
