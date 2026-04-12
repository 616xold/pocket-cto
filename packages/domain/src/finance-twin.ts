import { z } from "zod";
import {
  SourceFileRecordSchema,
  SourceRecordSchema,
  SourceSnapshotRecordSchema,
} from "./source-registry";

export const FinanceTwinJsonObjectSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const FinanceCompanyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9][a-z0-9_-]*$/u,
    "Company key must use lowercase letters, numbers, hyphens, or underscores",
  );

export const FinanceIsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "Expected ISO date in YYYY-MM-DD format");

export const FinanceAmountSchema = z
  .string()
  .regex(/^-?\d+\.\d{2}$/u, "Expected money amount with 2 decimal places");

export const FinanceTwinExtractorKeySchema = z.enum([
  "trial_balance_csv",
  "chart_of_accounts_csv",
  "general_ledger_csv",
  "bank_account_summary_csv",
  "receivables_aging_csv",
  "payables_aging_csv",
]);

export const FinanceTwinSyncRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const FinanceTwinLineageTargetKindSchema = z.enum([
  "reporting_period",
  "ledger_account",
  "bank_account",
  "bank_account_summary",
  "customer",
  "receivables_aging_row",
  "vendor",
  "payables_aging_row",
  "trial_balance_line",
  "account_catalog_entry",
  "journal_entry",
  "journal_line",
  "general_ledger_balance_proof",
]);

export const FinanceFreshnessStateSchema = z.enum([
  "missing",
  "fresh",
  "stale",
  "failed",
]);

export const FinanceFreshnessSliceNameSchema = z.enum([
  "trial_balance",
  "chart_of_accounts",
  "general_ledger",
]);

export const FinanceCompanyRecordSchema = z.object({
  id: z.string().uuid(),
  companyKey: FinanceCompanyKeySchema,
  displayName: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceReportingPeriodRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  periodKey: z.string().min(1),
  label: z.string().min(1),
  periodStart: FinanceIsoDateSchema.nullable(),
  periodEnd: FinanceIsoDateSchema,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceLedgerAccountRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  accountCode: z.string().min(1),
  accountName: z.string().min(1).nullable(),
  accountType: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceAccountCatalogEntryRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  detailType: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  parentAccountCode: z.string().min(1).nullable(),
  isActive: z.boolean().nullable(),
  observedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceTrialBalanceLineRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  reportingPeriodId: z.string().uuid(),
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  debitAmount: FinanceAmountSchema,
  creditAmount: FinanceAmountSchema,
  netAmount: FinanceAmountSchema,
  currencyCode: z.string().min(1).nullable(),
  observedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceJournalEntryRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  externalEntryId: z.string().min(1),
  transactionDate: FinanceIsoDateSchema,
  entryDescription: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceJournalLineRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  journalEntryId: z.string().uuid(),
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  debitAmount: FinanceAmountSchema,
  creditAmount: FinanceAmountSchema,
  currencyCode: z.string().min(1).nullable(),
  lineDescription: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceGeneralLedgerBalanceProofRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  openingBalanceAmount: FinanceAmountSchema.nullable(),
  openingBalanceSourceColumn: z.string().min(1).nullable(),
  openingBalanceLineNumber: z.number().int().positive().nullable(),
  endingBalanceAmount: FinanceAmountSchema.nullable(),
  endingBalanceSourceColumn: z.string().min(1).nullable(),
  endingBalanceLineNumber: z.number().int().positive().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceBankBalanceTypeSchema = z.enum([
  "statement_or_ledger",
  "available",
  "unspecified",
]);

export const FinanceBankAccountRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  accountLabel: z.string().min(1),
  institutionName: z.string().min(1).nullable(),
  externalAccountId: z.string().min(1).nullable(),
  accountNumberLast4: z
    .string()
    .regex(/^\d{4}$/u, "Expected exactly four digits")
    .nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceBankAccountSummaryRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  balanceType: FinanceBankBalanceTypeSchema,
  balanceAmount: FinanceAmountSchema,
  currencyCode: z.string().min(1).nullable(),
  asOfDate: FinanceIsoDateSchema.nullable(),
  asOfDateSourceColumn: z.string().min(1).nullable(),
  balanceSourceColumn: z.string().min(1),
  observedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceCustomerRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  customerLabel: z.string().min(1),
  externalCustomerId: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceVendorRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  vendorLabel: z.string().min(1),
  externalVendorId: z.string().min(1).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceReceivablesAgingBucketKeySchema = z.enum([
  "current",
  "0_30",
  "1_30",
  "31_60",
  "61_90",
  "91_120",
  "120_plus",
  "over_90",
  "over_120",
  "past_due",
  "total",
]);

export const FinanceReceivablesAgingBucketClassSchema = z.enum([
  "current",
  "past_due_detail",
  "past_due_total",
  "past_due_partial_rollup",
  "total",
]);

export const FinanceReceivablesAgingBucketValueSchema = z.object({
  bucketKey: FinanceReceivablesAgingBucketKeySchema,
  bucketClass: FinanceReceivablesAgingBucketClassSchema,
  amount: FinanceAmountSchema,
  sourceColumn: z.string().min(1),
});

export const FinancePayablesAgingBucketKeySchema =
  FinanceReceivablesAgingBucketKeySchema;

export const FinancePayablesAgingBucketClassSchema =
  FinanceReceivablesAgingBucketClassSchema;

export const FinancePayablesAgingBucketValueSchema = z.object({
  bucketKey: FinancePayablesAgingBucketKeySchema,
  bucketClass: FinancePayablesAgingBucketClassSchema,
  amount: FinanceAmountSchema,
  sourceColumn: z.string().min(1),
});

export const FinanceReceivablesAgingRowRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  customerId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  sourceLineNumbers: z.array(z.number().int().positive()).min(1),
  currencyCode: z.string().min(1).nullable(),
  asOfDate: FinanceIsoDateSchema.nullable(),
  asOfDateSourceColumn: z.string().min(1).nullable(),
  bucketValues: z.array(FinanceReceivablesAgingBucketValueSchema).min(1),
  observedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinancePayablesAgingRowRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  vendorId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  lineNumber: z.number().int().positive(),
  sourceLineNumbers: z.array(z.number().int().positive()).min(1),
  currencyCode: z.string().min(1).nullable(),
  asOfDate: FinanceIsoDateSchema.nullable(),
  asOfDateSourceColumn: z.string().min(1).nullable(),
  bucketValues: z.array(FinancePayablesAgingBucketValueSchema).min(1),
  observedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const FinanceTwinSyncRunRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  reportingPeriodId: z.string().uuid().nullable(),
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  sourceFileId: z.string().uuid(),
  extractorKey: FinanceTwinExtractorKeySchema,
  status: FinanceTwinSyncRunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  stats: FinanceTwinJsonObjectSchema,
  errorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
});

export const FinanceTwinLineageRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  syncRunId: z.string().uuid(),
  targetKind: FinanceTwinLineageTargetKindSchema,
  targetId: z.string().uuid(),
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  sourceFileId: z.string().uuid(),
  recordedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
});

export const FinanceTwinSyncInputSchema = z.object({
  companyName: z.string().trim().min(1).max(160).optional(),
});

export const FinanceTwinSourceRefSchema = z.object({
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  sourceFileId: z.string().uuid(),
  syncRunId: z.string().uuid(),
});

const FinanceEmptyLineageTargetCounts = {
  reportingPeriodCount: 0,
  ledgerAccountCount: 0,
  bankAccountCount: 0,
  bankAccountSummaryCount: 0,
  customerCount: 0,
  receivablesAgingRowCount: 0,
  vendorCount: 0,
  payablesAgingRowCount: 0,
  trialBalanceLineCount: 0,
  accountCatalogEntryCount: 0,
  journalEntryCount: 0,
  journalLineCount: 0,
  generalLedgerBalanceProofCount: 0,
} as const;

export const FinanceLineageTargetCountsSchema = z.object({
  reportingPeriodCount: z.number().int().nonnegative().default(0),
  ledgerAccountCount: z.number().int().nonnegative().default(0),
  bankAccountCount: z.number().int().nonnegative().default(0),
  bankAccountSummaryCount: z.number().int().nonnegative().default(0),
  customerCount: z.number().int().nonnegative().default(0),
  receivablesAgingRowCount: z.number().int().nonnegative().default(0),
  vendorCount: z.number().int().nonnegative().default(0),
  payablesAgingRowCount: z.number().int().nonnegative().default(0),
  trialBalanceLineCount: z.number().int().nonnegative().default(0),
  accountCatalogEntryCount: z.number().int().nonnegative().default(0),
  journalEntryCount: z.number().int().nonnegative().default(0),
  journalLineCount: z.number().int().nonnegative().default(0),
  generalLedgerBalanceProofCount: z.number().int().nonnegative().default(0),
});

export const FinanceLineageLookupRefSchema = z.object({
  targetKind: FinanceTwinLineageTargetKindSchema,
  targetId: z.string().uuid(),
  syncRunId: z.string().uuid().nullable(),
});

export const FinanceLatestAttemptedSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
});

export const FinanceFreshnessSummarySchema = z.object({
  state: FinanceFreshnessStateSchema,
  latestSyncRunId: z.string().uuid().nullable(),
  latestSyncStatus: FinanceTwinSyncRunStatusSchema.nullable(),
  latestCompletedAt: z.string().datetime({ offset: true }).nullable(),
  latestSuccessfulSyncRunId: z.string().uuid().nullable(),
  latestSuccessfulCompletedAt: z.string().datetime({ offset: true }).nullable(),
  ageSeconds: z.number().int().nonnegative().nullable(),
  staleAfterSeconds: z.number().int().positive(),
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
});

export const FinanceFreshnessViewSchema = z.object({
  overall: FinanceFreshnessSummarySchema,
  trialBalance: FinanceFreshnessSummarySchema,
  chartOfAccounts: FinanceFreshnessSummarySchema,
  generalLedger: FinanceFreshnessSummarySchema,
});

export const FinanceTrialBalanceSummarySchema = z.object({
  accountCount: z.number().int().nonnegative(),
  lineCount: z.number().int().nonnegative(),
  totalDebitAmount: FinanceAmountSchema,
  totalCreditAmount: FinanceAmountSchema,
  totalNetAmount: FinanceAmountSchema,
  currencyCode: z.string().min(1).nullable(),
});

export const FinanceChartOfAccountsSummarySchema = z.object({
  accountCount: z.number().int().nonnegative(),
  activeAccountCount: z.number().int().nonnegative(),
  inactiveAccountCount: z.number().int().nonnegative(),
  parentLinkedCount: z.number().int().nonnegative(),
});

export const FinanceGeneralLedgerPeriodContextBasisSchema = z.enum([
  "source_declared_period",
  "activity_window_only",
  "missing_context",
]);

export const FinanceGeneralLedgerDeclaredPeriodKindSchema = z.enum([
  "period_window",
  "period_end_only",
  "as_of",
  "period_key_only",
]);

export const FinanceGeneralLedgerSourceDeclaredPeriodSchema = z.object({
  contextKind: FinanceGeneralLedgerDeclaredPeriodKindSchema,
  periodKey: z.string().min(1).nullable(),
  periodStart: FinanceIsoDateSchema.nullable(),
  periodEnd: FinanceIsoDateSchema.nullable(),
  asOf: FinanceIsoDateSchema.nullable(),
});

export const FinanceGeneralLedgerPeriodContextViewSchema = z.object({
  basis: FinanceGeneralLedgerPeriodContextBasisSchema,
  sourceDeclaredPeriod:
    FinanceGeneralLedgerSourceDeclaredPeriodSchema.nullable(),
  activityWindowEarliestEntryDate: FinanceIsoDateSchema.nullable(),
  activityWindowLatestEntryDate: FinanceIsoDateSchema.nullable(),
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
});

export const FinanceGeneralLedgerSummarySchema = z.object({
  journalEntryCount: z.number().int().nonnegative(),
  journalLineCount: z.number().int().nonnegative(),
  ledgerAccountCount: z.number().int().nonnegative(),
  totalDebitAmount: FinanceAmountSchema,
  totalCreditAmount: FinanceAmountSchema,
  earliestEntryDate: FinanceIsoDateSchema,
  latestEntryDate: FinanceIsoDateSchema,
  currencyCode: z.string().min(1).nullable(),
});

export const FinanceCompanyTotalsSchema = z.object({
  reportingPeriodCount: z.number().int().nonnegative(),
  ledgerAccountCount: z.number().int().nonnegative(),
});

export const FinanceTrialBalanceCoverageSchema = z.object({
  lineCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceChartOfAccountsCoverageSchema = z.object({
  accountCatalogEntryCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceGeneralLedgerCoverageSchema = z.object({
  journalEntryCount: z.number().int().nonnegative(),
  journalLineCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceLatestSuccessfulTrialBalanceSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  reportingPeriod: FinanceReportingPeriodRecordSchema.nullable(),
  coverage: FinanceTrialBalanceCoverageSchema,
  summary: FinanceTrialBalanceSummarySchema.nullable(),
});

export const FinanceLatestSuccessfulChartOfAccountsSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  coverage: FinanceChartOfAccountsCoverageSchema,
  summary: FinanceChartOfAccountsSummarySchema.nullable(),
});

export const FinanceLatestSuccessfulGeneralLedgerSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  coverage: FinanceGeneralLedgerCoverageSchema,
  periodContext: FinanceGeneralLedgerPeriodContextViewSchema,
  summary: FinanceGeneralLedgerSummarySchema.nullable(),
});

export const FinanceBankAccountSummarySliceSummarySchema = z.object({
  bankAccountCount: z.number().int().nonnegative(),
  summaryRowCount: z.number().int().nonnegative(),
  statementOrLedgerBalanceCount: z.number().int().nonnegative(),
  availableBalanceCount: z.number().int().nonnegative(),
  unspecifiedBalanceCount: z.number().int().nonnegative(),
  datedBalanceCount: z.number().int().nonnegative(),
  undatedBalanceCount: z.number().int().nonnegative(),
  currencyCount: z.number().int().nonnegative(),
});

export const FinanceBankAccountSummaryCoverageSchema = z.object({
  bankAccountCount: z.number().int().nonnegative(),
  summaryRowCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceLatestSuccessfulBankAccountSummarySliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  coverage: FinanceBankAccountSummaryCoverageSchema,
  summary: FinanceBankAccountSummarySliceSummarySchema.nullable(),
});

export const FinanceReceivablesAgingSliceSummarySchema = z.object({
  customerCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  datedRowCount: z.number().int().nonnegative(),
  undatedRowCount: z.number().int().nonnegative(),
  currencyCount: z.number().int().nonnegative(),
  reportedBucketKeys: z.array(FinanceReceivablesAgingBucketKeySchema),
});

export const FinanceReceivablesAgingCoverageSchema = z.object({
  customerCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceLatestSuccessfulReceivablesAgingSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  coverage: FinanceReceivablesAgingCoverageSchema,
  summary: FinanceReceivablesAgingSliceSummarySchema.nullable(),
});

export const FinancePayablesAgingSliceSummarySchema = z.object({
  vendorCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  datedRowCount: z.number().int().nonnegative(),
  undatedRowCount: z.number().int().nonnegative(),
  currencyCount: z.number().int().nonnegative(),
  reportedBucketKeys: z.array(FinancePayablesAgingBucketKeySchema),
});

export const FinancePayablesAgingCoverageSchema = z.object({
  vendorCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
  lineageTargetCounts: FinanceLineageTargetCountsSchema.optional().default(
    FinanceEmptyLineageTargetCounts,
  ),
});

export const FinanceLatestSuccessfulPayablesAgingSliceSchema = z.object({
  latestSource: FinanceTwinSourceRefSchema.nullable(),
  latestSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  coverage: FinancePayablesAgingCoverageSchema,
  summary: FinancePayablesAgingSliceSummarySchema.nullable(),
});

export const FinanceLatestAttemptedSlicesSchema = z.object({
  trialBalance: FinanceLatestAttemptedSliceSchema,
  chartOfAccounts: FinanceLatestAttemptedSliceSchema,
  generalLedger: FinanceLatestAttemptedSliceSchema,
});

export const FinanceLatestSuccessfulSlicesSchema = z.object({
  trialBalance: FinanceLatestSuccessfulTrialBalanceSliceSchema,
  chartOfAccounts: FinanceLatestSuccessfulChartOfAccountsSliceSchema,
  generalLedger: FinanceLatestSuccessfulGeneralLedgerSliceSchema,
});

export const FinanceTwinCompanySummarySchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  freshness: FinanceFreshnessViewSchema,
  companyTotals: FinanceCompanyTotalsSchema,
  latestAttemptedSlices: FinanceLatestAttemptedSlicesSchema,
  latestSuccessfulSlices: FinanceLatestSuccessfulSlicesSchema,
  limitations: z.array(z.string().min(1)),
});

export const FinanceTwinSyncResultSchema = z.object({
  company: FinanceCompanyRecordSchema,
  syncRun: FinanceTwinSyncRunRecordSchema,
  freshness: FinanceFreshnessViewSchema,
  companyTotals: FinanceCompanyTotalsSchema,
  latestAttemptedSlices: FinanceLatestAttemptedSlicesSchema,
  latestSuccessfulSlices: FinanceLatestSuccessfulSlicesSchema,
  limitations: z.array(z.string().min(1)),
});

export const FinanceAccountCatalogEntryViewSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  catalogEntry: FinanceAccountCatalogEntryRecordSchema,
});

export const FinanceAccountCatalogViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSlice: FinanceLatestSuccessfulChartOfAccountsSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  accounts: z.array(FinanceAccountCatalogEntryViewSchema),
  limitations: z.array(z.string().min(1)),
});

export const FinanceBankAccountSummaryLineageRefSchema =
  FinanceLineageLookupRefSchema;

export const FinanceBankAccountReportedBalanceViewSchema = z.object({
  summary: FinanceBankAccountSummaryRecordSchema,
  lineageRef: FinanceBankAccountSummaryLineageRefSchema,
});

export const FinanceBankAccountInventoryRowSchema = z.object({
  bankAccount: FinanceBankAccountRecordSchema,
  reportedBalances: z.array(FinanceBankAccountReportedBalanceViewSchema),
  currencyCodes: z.array(z.string().min(1)),
  knownAsOfDates: z.array(FinanceIsoDateSchema),
  unknownAsOfDateBalanceCount: z.number().int().nonnegative(),
  hasMixedAsOfDates: z.boolean(),
});

export const FinanceBankAccountInventoryViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSlice: FinanceLatestSuccessfulBankAccountSummarySliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  accountCount: z.number().int().nonnegative(),
  accounts: z.array(FinanceBankAccountInventoryRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceReceivablesAgingLineageRefSchema =
  FinanceLineageLookupRefSchema;

export const FinanceReceivablesAgingInventoryRowSchema = z.object({
  customer: FinanceCustomerRecordSchema,
  receivablesAgingRow: FinanceReceivablesAgingRowRecordSchema,
  reportedTotalAmount: FinanceAmountSchema.nullable(),
  lineageRef: FinanceReceivablesAgingLineageRefSchema,
});

export const FinanceReceivablesAgingViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSlice: FinanceLatestSuccessfulReceivablesAgingSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  customerCount: z.number().int().nonnegative(),
  rows: z.array(FinanceReceivablesAgingInventoryRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinancePayablesAgingLineageRefSchema =
  FinanceLineageLookupRefSchema;

export const FinancePayablesAgingInventoryRowSchema = z.object({
  vendor: FinanceVendorRecordSchema,
  payablesAgingRow: FinancePayablesAgingRowRecordSchema,
  reportedTotalAmount: FinanceAmountSchema.nullable(),
  lineageRef: FinancePayablesAgingLineageRefSchema,
});

export const FinancePayablesAgingViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSlice: FinanceLatestSuccessfulPayablesAgingSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  vendorCount: z.number().int().nonnegative(),
  rows: z.array(FinancePayablesAgingInventoryRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceJournalLineViewSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  journalLine: FinanceJournalLineRecordSchema,
});

export const FinanceGeneralLedgerEntryViewSchema = z.object({
  journalEntry: FinanceJournalEntryRecordSchema,
  lines: z.array(FinanceJournalLineViewSchema),
});

export const FinanceGeneralLedgerActivitySchema = z.object({
  journalEntryCount: z.number().int().nonnegative(),
  journalLineCount: z.number().int().nonnegative(),
  totalDebitAmount: FinanceAmountSchema,
  totalCreditAmount: FinanceAmountSchema,
  earliestEntryDate: FinanceIsoDateSchema,
  latestEntryDate: FinanceIsoDateSchema,
});

export const FinanceGeneralLedgerViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSlice: FinanceLatestSuccessfulGeneralLedgerSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  entries: z.array(FinanceGeneralLedgerEntryViewSchema),
  limitations: z.array(z.string().min(1)),
});

export const FinanceSliceAlignmentViewSchema = z.object({
  state: z.enum(["empty", "partial", "shared_source", "mixed"]),
  implementedSliceCount: z.number().int().positive(),
  availableSliceCount: z.number().int().nonnegative(),
  distinctSourceCount: z.number().int().nonnegative(),
  distinctSyncRunCount: z.number().int().nonnegative(),
  distinctSourceSnapshotCount: z.number().int().nonnegative(),
  sameSource: z.boolean(),
  sameSyncRun: z.boolean(),
  sameSourceSnapshot: z.boolean(),
  sharedSourceId: z.string().uuid().nullable(),
  sharedSyncRunId: z.string().uuid().nullable(),
  sharedSourceSnapshotId: z.string().uuid().nullable(),
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
});

export const FinanceGeneralLedgerActivityLineageRefSchema = z.object({
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid(),
});

export const FinanceSnapshotCoverageSummarySchema = z.object({
  accountRowCount: z.number().int().nonnegative(),
  chartOfAccountsAccountCount: z.number().int().nonnegative(),
  trialBalanceAccountCount: z.number().int().nonnegative(),
  generalLedgerActiveAccountCount: z.number().int().nonnegative(),
  accountsPresentInAllImplementedSlicesCount: z.number().int().nonnegative(),
  missingFromChartOfAccountsCount: z.number().int().nonnegative(),
  missingFromTrialBalanceCount: z.number().int().nonnegative(),
  missingFromGeneralLedgerCount: z.number().int().nonnegative(),
  inactiveAccountCount: z.number().int().nonnegative(),
  inactiveWithGeneralLedgerActivityCount: z.number().int().nonnegative(),
});

export const FinanceSnapshotAccountRowSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  chartOfAccountsEntry: FinanceAccountCatalogEntryRecordSchema.nullable(),
  trialBalanceLine: FinanceTrialBalanceLineRecordSchema.nullable(),
  generalLedgerActivity: FinanceGeneralLedgerActivitySchema.nullable(),
  presentInChartOfAccounts: z.boolean(),
  presentInTrialBalance: z.boolean(),
  presentInGeneralLedger: z.boolean(),
  missingFromChartOfAccounts: z.boolean(),
  missingFromTrialBalance: z.boolean(),
  missingFromGeneralLedger: z.boolean(),
  inactiveWithGeneralLedgerActivity: z.boolean(),
  activityLineageRef: FinanceGeneralLedgerActivityLineageRefSchema.nullable(),
  lineageTargets: z.object({
    ledgerAccount: FinanceLineageLookupRefSchema,
    chartOfAccountsEntry: FinanceLineageLookupRefSchema.nullable(),
    trialBalanceLine: FinanceLineageLookupRefSchema.nullable(),
  }),
});

export const FinanceSnapshotViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  companyTotals: FinanceCompanyTotalsSchema,
  freshness: FinanceFreshnessViewSchema,
  latestAttemptedSlices: FinanceLatestAttemptedSlicesSchema,
  latestSuccessfulSlices: FinanceLatestSuccessfulSlicesSchema,
  sliceAlignment: FinanceSliceAlignmentViewSchema,
  coverageSummary: FinanceSnapshotCoverageSummarySchema,
  accounts: z.array(FinanceSnapshotAccountRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceLineageRecordViewSchema = z.object({
  lineage: FinanceTwinLineageRecordSchema,
  syncRun: FinanceTwinSyncRunRecordSchema,
  source: SourceRecordSchema,
  sourceSnapshot: SourceSnapshotRecordSchema,
  sourceFile: SourceFileRecordSchema,
});

export const FinanceLineageDrillViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  target: FinanceLineageLookupRefSchema,
  recordCount: z.number().int().nonnegative(),
  records: z.array(FinanceLineageRecordViewSchema),
  limitations: z.array(z.string().min(1)),
});

export const FinanceReconciliationFreshnessViewSchema = z.object({
  overall: FinanceFreshnessSummarySchema,
  trialBalance: FinanceFreshnessSummarySchema,
  generalLedger: FinanceFreshnessSummarySchema,
});

export const FinanceTrialBalanceWindowSchema = z.object({
  periodKey: z.string().min(1),
  label: z.string().min(1),
  periodStart: FinanceIsoDateSchema.nullable(),
  periodEnd: FinanceIsoDateSchema,
});

export const FinanceGeneralLedgerWindowSchema = z.object({
  earliestEntryDate: FinanceIsoDateSchema,
  latestEntryDate: FinanceIsoDateSchema,
});

export const FinanceReconciliationWindowRelationSchema = z.enum([
  "exact_match",
  "subset",
  "outside",
  "unknown",
]);

export const FinanceReconciliationComparabilityViewSchema = z.object({
  state: z.enum([
    "missing_slice",
    "not_comparable",
    "coverage_only",
    "window_comparable",
  ]),
  basis: FinanceGeneralLedgerPeriodContextBasisSchema,
  windowRelation: FinanceReconciliationWindowRelationSchema,
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
  trialBalanceWindow: FinanceTrialBalanceWindowSchema.nullable(),
  sourceDeclaredGeneralLedgerPeriod:
    FinanceGeneralLedgerSourceDeclaredPeriodSchema.nullable(),
  generalLedgerWindow: FinanceGeneralLedgerWindowSchema.nullable(),
  sameSource: z.boolean(),
  sameSourceSnapshot: z.boolean(),
  sameSyncRun: z.boolean(),
  sharedSourceId: z.string().uuid().nullable(),
  sharedSourceSnapshotId: z.string().uuid().nullable(),
  sharedSyncRunId: z.string().uuid().nullable(),
});

export const FinanceReconciliationCoverageSummarySchema = z.object({
  accountRowCount: z.number().int().nonnegative(),
  presentInTrialBalanceCount: z.number().int().nonnegative(),
  presentInGeneralLedgerCount: z.number().int().nonnegative(),
  overlapCount: z.number().int().nonnegative(),
  trialBalanceOnlyCount: z.number().int().nonnegative(),
  generalLedgerOnlyCount: z.number().int().nonnegative(),
});

export const FinanceReconciliationAccountRowSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  trialBalanceLine: FinanceTrialBalanceLineRecordSchema.nullable(),
  generalLedgerActivity: FinanceGeneralLedgerActivitySchema.nullable(),
  presentInTrialBalance: z.boolean(),
  presentInGeneralLedger: z.boolean(),
  trialBalanceOnly: z.boolean(),
  generalLedgerOnly: z.boolean(),
  activityLineageRef: FinanceGeneralLedgerActivityLineageRefSchema.nullable(),
});

export const FinanceReconciliationReadinessViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSliceSchema,
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSliceSchema,
  freshness: FinanceReconciliationFreshnessViewSchema,
  sliceAlignment: FinanceSliceAlignmentViewSchema,
  comparability: FinanceReconciliationComparabilityViewSchema,
  coverageSummary: FinanceReconciliationCoverageSummarySchema,
  accounts: z.array(FinanceReconciliationAccountRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceAccountBridgeReadinessStateSchema = z.enum([
  "missing_slice",
  "not_bridge_ready",
  "matched_period_ready",
]);

export const FinanceAccountBridgeReadinessStatusSchema = z.object({
  state: FinanceAccountBridgeReadinessStateSchema,
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
  basis: FinanceGeneralLedgerPeriodContextBasisSchema,
  windowRelation: FinanceReconciliationWindowRelationSchema,
  sameSource: z.boolean(),
  sameSourceSnapshot: z.boolean(),
  sameSyncRun: z.boolean(),
  sharedSourceId: z.string().uuid().nullable(),
});

export const FinanceAccountBridgeCoverageSummarySchema = z.object({
  accountRowCount: z.number().int().nonnegative(),
  presentInChartOfAccountsCount: z.number().int().nonnegative(),
  presentInTrialBalanceCount: z.number().int().nonnegative(),
  presentInGeneralLedgerCount: z.number().int().nonnegative(),
  overlapCount: z.number().int().nonnegative(),
  trialBalanceOnlyCount: z.number().int().nonnegative(),
  generalLedgerOnlyCount: z.number().int().nonnegative(),
  missingFromChartOfAccountsCount: z.number().int().nonnegative(),
  inactiveWithGeneralLedgerActivityCount: z.number().int().nonnegative(),
});

export const FinanceAccountBridgeAccountRowSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  chartOfAccountsEntry: FinanceAccountCatalogEntryRecordSchema.nullable(),
  trialBalanceLine: FinanceTrialBalanceLineRecordSchema.nullable(),
  generalLedgerActivity: FinanceGeneralLedgerActivitySchema.nullable(),
  presentInChartOfAccounts: z.boolean(),
  presentInTrialBalance: z.boolean(),
  presentInGeneralLedger: z.boolean(),
  trialBalanceOnly: z.boolean(),
  generalLedgerOnly: z.boolean(),
  missingFromChartOfAccounts: z.boolean(),
  inactiveWithGeneralLedgerActivity: z.boolean(),
  activityLineageRef: FinanceGeneralLedgerActivityLineageRefSchema.nullable(),
});

export const FinanceAccountBridgeReadinessViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSliceSchema,
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSliceSchema,
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSliceSchema,
  freshness: FinanceFreshnessViewSchema,
  sliceAlignment: FinanceSliceAlignmentViewSchema,
  comparability: FinanceReconciliationComparabilityViewSchema,
  bridgeReadiness: FinanceAccountBridgeReadinessStatusSchema,
  coverageSummary: FinanceAccountBridgeCoverageSummarySchema,
  accounts: z.array(FinanceAccountBridgeAccountRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceGeneralLedgerBalanceProofBasisSchema = z.enum([
  "no_general_ledger_activity",
  "activity_only_no_balance_proof",
  "source_backed_balance_field",
]);

export const FinanceGeneralLedgerBalanceProofSchema = z.object({
  openingBalanceAmount: FinanceAmountSchema.nullable(),
  endingBalanceAmount: FinanceAmountSchema.nullable(),
  openingBalanceEvidencePresent: z.boolean(),
  endingBalanceEvidencePresent: z.boolean(),
  openingBalanceSourceColumn: z.string().min(1).nullable().default(null),
  openingBalanceLineNumber: z
    .number()
    .int()
    .positive()
    .nullable()
    .default(null),
  endingBalanceSourceColumn: z.string().min(1).nullable().default(null),
  endingBalanceLineNumber: z.number().int().positive().nullable().default(null),
  proofBasis: FinanceGeneralLedgerBalanceProofBasisSchema,
  proofSource: z.string().min(1).nullable(),
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
});

export const FinanceGeneralLedgerBalanceProofLineageRefSchema =
  FinanceLineageLookupRefSchema;

export const FinancePersistedGeneralLedgerBalanceProofSchema = z.object({
  record: FinanceGeneralLedgerBalanceProofRecordSchema,
  balanceProof: FinanceGeneralLedgerBalanceProofSchema,
  lineageRef: FinanceGeneralLedgerBalanceProofLineageRefSchema,
});

export const FinanceGeneralLedgerBalanceProofTargetSchema = z.object({
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid().nullable(),
});

export const FinanceGeneralLedgerBalanceProofLineageSchema = z.object({
  target: FinanceGeneralLedgerBalanceProofLineageRefSchema,
  recordCount: z.number().int().nonnegative(),
  records: z.array(FinanceLineageRecordViewSchema),
});

export const FinanceBalanceBridgePrerequisitesStateSchema = z.enum([
  "missing_slice",
  "not_prereq_ready",
  "source_backed_balance_prereq_ready",
]);

export const FinanceBalanceBridgePrerequisitesStatusSchema = z.object({
  state: FinanceBalanceBridgePrerequisitesStateSchema,
  reasonCode: z.string().min(1),
  reasonSummary: z.string().min(1),
  basis: FinanceGeneralLedgerPeriodContextBasisSchema,
  windowRelation: FinanceReconciliationWindowRelationSchema,
  sameSource: z.boolean(),
  sameSourceSnapshot: z.boolean(),
  sameSyncRun: z.boolean(),
  sharedSourceId: z.string().uuid().nullable(),
  prerequisites: z.object({
    hasSuccessfulTrialBalanceSlice: z.boolean(),
    hasSuccessfulGeneralLedgerSlice: z.boolean(),
    matchedPeriodAccountBridgeReady: z.boolean(),
    anySourceBackedGeneralLedgerBalanceProof: z.boolean(),
  }),
});

export const FinanceBalanceBridgePrerequisitesCoverageSummarySchema = z.object({
  accountRowCount: z.number().int().nonnegative(),
  presentInChartOfAccountsCount: z.number().int().nonnegative(),
  presentInTrialBalanceCount: z.number().int().nonnegative(),
  presentInGeneralLedgerCount: z.number().int().nonnegative(),
  overlapCount: z.number().int().nonnegative(),
  trialBalanceOnlyCount: z.number().int().nonnegative(),
  generalLedgerOnlyCount: z.number().int().nonnegative(),
  missingFromChartOfAccountsCount: z.number().int().nonnegative(),
  inactiveWithGeneralLedgerActivityCount: z.number().int().nonnegative(),
  matchedPeriodAccountBridgeReadyCount: z.number().int().nonnegative(),
  accountsWithOpeningBalanceProofCount: z.number().int().nonnegative(),
  accountsWithEndingBalanceProofCount: z.number().int().nonnegative(),
  accountsBlockedByMissingOverlapCount: z.number().int().nonnegative(),
  accountsBlockedByMissingBalanceProofCount: z.number().int().nonnegative(),
  prereqReadyAccountCount: z.number().int().nonnegative(),
});

export const FinanceBalanceBridgePrerequisitesAccountRowSchema = z.object({
  ledgerAccount: FinanceLedgerAccountRecordSchema,
  chartOfAccountsEntry: FinanceAccountCatalogEntryRecordSchema.nullable(),
  trialBalanceLine: FinanceTrialBalanceLineRecordSchema.nullable(),
  generalLedgerActivity: FinanceGeneralLedgerActivitySchema.nullable(),
  generalLedgerBalanceProof: FinanceGeneralLedgerBalanceProofSchema,
  presentInChartOfAccounts: z.boolean(),
  presentInTrialBalance: z.boolean(),
  presentInGeneralLedger: z.boolean(),
  trialBalanceOnly: z.boolean(),
  generalLedgerOnly: z.boolean(),
  missingFromChartOfAccounts: z.boolean(),
  inactiveWithGeneralLedgerActivity: z.boolean(),
  matchedPeriodAccountBridgeReady: z.boolean(),
  balanceBridgePrereqReady: z.boolean(),
  blockedReasonCode: z.string().min(1).nullable(),
  blockedReasonSummary: z.string().min(1).nullable(),
  activityLineageRef: FinanceGeneralLedgerActivityLineageRefSchema.nullable(),
  balanceProofLineageRef:
    FinanceGeneralLedgerBalanceProofLineageRefSchema.nullable(),
});

export const FinanceBalanceBridgePrerequisitesViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  chartOfAccountsSlice: FinanceLatestSuccessfulChartOfAccountsSliceSchema,
  trialBalanceSlice: FinanceLatestSuccessfulTrialBalanceSliceSchema,
  generalLedgerSlice: FinanceLatestSuccessfulGeneralLedgerSliceSchema,
  freshness: FinanceFreshnessViewSchema,
  sliceAlignment: FinanceSliceAlignmentViewSchema,
  comparability: FinanceReconciliationComparabilityViewSchema,
  accountBridgeReadiness: FinanceAccountBridgeReadinessStatusSchema,
  balanceBridgePrerequisites: FinanceBalanceBridgePrerequisitesStatusSchema,
  coverageSummary: FinanceBalanceBridgePrerequisitesCoverageSummarySchema,
  accounts: z.array(FinanceBalanceBridgePrerequisitesAccountRowSchema),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceGeneralLedgerBalanceProofViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  target: FinanceGeneralLedgerBalanceProofTargetSchema,
  latestSuccessfulGeneralLedgerSlice:
    FinanceLatestSuccessfulGeneralLedgerSliceSchema,
  proof: FinancePersistedGeneralLedgerBalanceProofSchema.nullable(),
  lineage: FinanceGeneralLedgerBalanceProofLineageSchema.nullable(),
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceGeneralLedgerActivityLineageTargetSchema = z.object({
  ledgerAccountId: z.string().uuid(),
  syncRunId: z.string().uuid().nullable(),
});

export const FinanceGeneralLedgerActivityLineageRowSchema = z.object({
  journalEntry: FinanceJournalEntryRecordSchema,
  journalLine: FinanceJournalLineRecordSchema,
  journalEntryLineage: FinanceLineageLookupRefSchema,
  journalLineLineage: FinanceLineageLookupRefSchema,
});

export const FinanceGeneralLedgerActivityLineageViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  target: FinanceGeneralLedgerActivityLineageTargetSchema,
  recordCount: z.number().int().nonnegative(),
  journalEntryCount: z.number().int().nonnegative(),
  journalLineCount: z.number().int().nonnegative(),
  activityWindow: FinanceGeneralLedgerWindowSchema.nullable(),
  records: z.array(FinanceGeneralLedgerActivityLineageRowSchema),
  limitations: z.array(z.string().min(1)),
});

export const FinanceCashPostureCurrencyBucketSchema = z.object({
  currency: z.string().min(1).nullable(),
  statementOrLedgerBalanceTotal: FinanceAmountSchema,
  availableBalanceTotal: FinanceAmountSchema,
  unspecifiedBalanceTotal: FinanceAmountSchema,
  accountCount: z.number().int().nonnegative(),
  datedAccountCount: z.number().int().nonnegative(),
  undatedAccountCount: z.number().int().nonnegative(),
  mixedAsOfDates: z.boolean(),
  earliestAsOfDate: FinanceIsoDateSchema.nullable(),
  latestAsOfDate: FinanceIsoDateSchema.nullable(),
});

export const FinanceCashPostureCoverageSummarySchema = z.object({
  bankAccountCount: z.number().int().nonnegative(),
  reportedBalanceCount: z.number().int().nonnegative(),
  statementOrLedgerBalanceCount: z.number().int().nonnegative(),
  availableBalanceCount: z.number().int().nonnegative(),
  unspecifiedBalanceCount: z.number().int().nonnegative(),
  datedBalanceCount: z.number().int().nonnegative(),
  undatedBalanceCount: z.number().int().nonnegative(),
  currencyBucketCount: z.number().int().nonnegative(),
  mixedAsOfDateCurrencyBucketCount: z.number().int().nonnegative(),
});

export const FinanceCashPostureViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulBankSummarySlice:
    FinanceLatestSuccessfulBankAccountSummarySliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  currencyBuckets: z.array(FinanceCashPostureCurrencyBucketSchema),
  coverageSummary: FinanceCashPostureCoverageSummarySchema,
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinanceCollectionsPostureExactBucketTotalSchema = z.object({
  bucketKey: FinanceReceivablesAgingBucketKeySchema,
  bucketClass: FinanceReceivablesAgingBucketClassSchema,
  totalAmount: FinanceAmountSchema,
});

export const FinanceCollectionsPostureCurrencyBucketSchema = z.object({
  currency: z.string().min(1).nullable(),
  totalReceivables: FinanceAmountSchema,
  currentBucketTotal: FinanceAmountSchema,
  pastDueBucketTotal: FinanceAmountSchema,
  exactBucketTotals: z.array(FinanceCollectionsPostureExactBucketTotalSchema),
  customerCount: z.number().int().nonnegative(),
  datedCustomerCount: z.number().int().nonnegative(),
  undatedCustomerCount: z.number().int().nonnegative(),
  mixedAsOfDates: z.boolean(),
  earliestAsOfDate: FinanceIsoDateSchema.nullable(),
  latestAsOfDate: FinanceIsoDateSchema.nullable(),
});

export const FinanceCollectionsPostureCoverageSummarySchema = z.object({
  customerCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  currencyBucketCount: z.number().int().nonnegative(),
  datedRowCount: z.number().int().nonnegative(),
  undatedRowCount: z.number().int().nonnegative(),
  rowsWithExplicitTotalCount: z.number().int().nonnegative(),
  rowsWithCurrentBucketCount: z.number().int().nonnegative(),
  rowsWithComputablePastDueCount: z.number().int().nonnegative(),
  rowsWithPartialPastDueOnlyCount: z.number().int().nonnegative(),
});

export const FinanceCollectionsPostureViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulReceivablesAgingSlice:
    FinanceLatestSuccessfulReceivablesAgingSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  currencyBuckets: z.array(FinanceCollectionsPostureCurrencyBucketSchema),
  coverageSummary: FinanceCollectionsPostureCoverageSummarySchema,
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export const FinancePayablesPostureExactBucketTotalSchema = z.object({
  bucketKey: FinancePayablesAgingBucketKeySchema,
  bucketClass: FinancePayablesAgingBucketClassSchema,
  totalAmount: FinanceAmountSchema,
});

export const FinancePayablesPostureCurrencyBucketSchema = z.object({
  currency: z.string().min(1).nullable(),
  totalPayables: FinanceAmountSchema,
  currentBucketTotal: FinanceAmountSchema,
  pastDueBucketTotal: FinanceAmountSchema,
  exactBucketTotals: z.array(FinancePayablesPostureExactBucketTotalSchema),
  vendorCount: z.number().int().nonnegative(),
  datedVendorCount: z.number().int().nonnegative(),
  undatedVendorCount: z.number().int().nonnegative(),
  mixedAsOfDates: z.boolean(),
  earliestAsOfDate: FinanceIsoDateSchema.nullable(),
  latestAsOfDate: FinanceIsoDateSchema.nullable(),
});

export const FinancePayablesPostureCoverageSummarySchema = z.object({
  vendorCount: z.number().int().nonnegative(),
  rowCount: z.number().int().nonnegative(),
  currencyBucketCount: z.number().int().nonnegative(),
  datedRowCount: z.number().int().nonnegative(),
  undatedRowCount: z.number().int().nonnegative(),
  rowsWithExplicitTotalCount: z.number().int().nonnegative(),
  rowsWithCurrentBucketCount: z.number().int().nonnegative(),
  rowsWithComputablePastDueCount: z.number().int().nonnegative(),
  rowsWithPartialPastDueOnlyCount: z.number().int().nonnegative(),
});

export const FinancePayablesPostureViewSchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulPayablesAgingSlice:
    FinanceLatestSuccessfulPayablesAgingSliceSchema,
  freshness: FinanceFreshnessSummarySchema,
  currencyBuckets: z.array(FinancePayablesPostureCurrencyBucketSchema),
  coverageSummary: FinancePayablesPostureCoverageSummarySchema,
  diagnostics: z.array(z.string().min(1)).default([]),
  limitations: z.array(z.string().min(1)),
});

export type FinanceCompanyKey = z.infer<typeof FinanceCompanyKeySchema>;
export type FinanceIsoDate = z.infer<typeof FinanceIsoDateSchema>;
export type FinanceAmount = z.infer<typeof FinanceAmountSchema>;
export type FinanceTwinExtractorKey = z.infer<
  typeof FinanceTwinExtractorKeySchema
>;
export type FinanceTwinSyncRunStatus = z.infer<
  typeof FinanceTwinSyncRunStatusSchema
>;
export type FinanceTwinLineageTargetKind = z.infer<
  typeof FinanceTwinLineageTargetKindSchema
>;
export type FinanceFreshnessState = z.infer<typeof FinanceFreshnessStateSchema>;
export type FinanceFreshnessSliceName = z.infer<
  typeof FinanceFreshnessSliceNameSchema
>;
export type FinanceCompanyRecord = z.infer<typeof FinanceCompanyRecordSchema>;
export type FinanceReportingPeriodRecord = z.infer<
  typeof FinanceReportingPeriodRecordSchema
>;
export type FinanceLedgerAccountRecord = z.infer<
  typeof FinanceLedgerAccountRecordSchema
>;
export type FinanceAccountCatalogEntryRecord = z.infer<
  typeof FinanceAccountCatalogEntryRecordSchema
>;
export type FinanceTrialBalanceLineRecord = z.infer<
  typeof FinanceTrialBalanceLineRecordSchema
>;
export type FinanceJournalEntryRecord = z.infer<
  typeof FinanceJournalEntryRecordSchema
>;
export type FinanceJournalLineRecord = z.infer<
  typeof FinanceJournalLineRecordSchema
>;
export type FinanceGeneralLedgerBalanceProofRecord = z.infer<
  typeof FinanceGeneralLedgerBalanceProofRecordSchema
>;
export type FinanceBankBalanceType = z.infer<
  typeof FinanceBankBalanceTypeSchema
>;
export type FinanceBankAccountRecord = z.infer<
  typeof FinanceBankAccountRecordSchema
>;
export type FinanceBankAccountSummaryRecord = z.infer<
  typeof FinanceBankAccountSummaryRecordSchema
>;
export type FinanceCustomerRecord = z.infer<typeof FinanceCustomerRecordSchema>;
export type FinanceVendorRecord = z.infer<typeof FinanceVendorRecordSchema>;
export type FinanceReceivablesAgingBucketKey = z.infer<
  typeof FinanceReceivablesAgingBucketKeySchema
>;
export type FinanceReceivablesAgingBucketClass = z.infer<
  typeof FinanceReceivablesAgingBucketClassSchema
>;
export type FinanceReceivablesAgingBucketValue = z.infer<
  typeof FinanceReceivablesAgingBucketValueSchema
>;
export type FinancePayablesAgingBucketKey = z.infer<
  typeof FinancePayablesAgingBucketKeySchema
>;
export type FinancePayablesAgingBucketClass = z.infer<
  typeof FinancePayablesAgingBucketClassSchema
>;
export type FinancePayablesAgingBucketValue = z.infer<
  typeof FinancePayablesAgingBucketValueSchema
>;
export type FinanceReceivablesAgingRowRecord = z.infer<
  typeof FinanceReceivablesAgingRowRecordSchema
>;
export type FinancePayablesAgingRowRecord = z.infer<
  typeof FinancePayablesAgingRowRecordSchema
>;
export type FinanceTwinSyncRunRecord = z.infer<
  typeof FinanceTwinSyncRunRecordSchema
>;
export type FinanceTwinLineageRecord = z.infer<
  typeof FinanceTwinLineageRecordSchema
>;
export type FinanceTwinSyncInput = z.infer<typeof FinanceTwinSyncInputSchema>;
export type FinanceTwinSourceRef = z.infer<typeof FinanceTwinSourceRefSchema>;
export type FinanceLineageTargetCounts = z.infer<
  typeof FinanceLineageTargetCountsSchema
>;
export type FinanceLineageLookupRef = z.infer<
  typeof FinanceLineageLookupRefSchema
>;
export type FinanceLatestAttemptedSlice = z.infer<
  typeof FinanceLatestAttemptedSliceSchema
>;
export type FinanceFreshnessSummary = z.infer<
  typeof FinanceFreshnessSummarySchema
>;
export type FinanceFreshnessView = z.infer<typeof FinanceFreshnessViewSchema>;
export type FinanceTrialBalanceSummary = z.infer<
  typeof FinanceTrialBalanceSummarySchema
>;
export type FinanceChartOfAccountsSummary = z.infer<
  typeof FinanceChartOfAccountsSummarySchema
>;
export type FinanceGeneralLedgerPeriodContextBasis = z.infer<
  typeof FinanceGeneralLedgerPeriodContextBasisSchema
>;
export type FinanceGeneralLedgerDeclaredPeriodKind = z.infer<
  typeof FinanceGeneralLedgerDeclaredPeriodKindSchema
>;
export type FinanceGeneralLedgerSourceDeclaredPeriod = z.infer<
  typeof FinanceGeneralLedgerSourceDeclaredPeriodSchema
>;
export type FinanceGeneralLedgerPeriodContextView = z.infer<
  typeof FinanceGeneralLedgerPeriodContextViewSchema
>;
export type FinanceGeneralLedgerSummary = z.infer<
  typeof FinanceGeneralLedgerSummarySchema
>;
export type FinanceCompanyTotals = z.infer<typeof FinanceCompanyTotalsSchema>;
export type FinanceTrialBalanceCoverage = z.infer<
  typeof FinanceTrialBalanceCoverageSchema
>;
export type FinanceChartOfAccountsCoverage = z.infer<
  typeof FinanceChartOfAccountsCoverageSchema
>;
export type FinanceGeneralLedgerCoverage = z.infer<
  typeof FinanceGeneralLedgerCoverageSchema
>;
export type FinanceLatestSuccessfulTrialBalanceSlice = z.infer<
  typeof FinanceLatestSuccessfulTrialBalanceSliceSchema
>;
export type FinanceLatestSuccessfulChartOfAccountsSlice = z.infer<
  typeof FinanceLatestSuccessfulChartOfAccountsSliceSchema
>;
export type FinanceLatestSuccessfulGeneralLedgerSlice = z.infer<
  typeof FinanceLatestSuccessfulGeneralLedgerSliceSchema
>;
export type FinanceBankAccountSummarySliceSummary = z.infer<
  typeof FinanceBankAccountSummarySliceSummarySchema
>;
export type FinanceBankAccountSummaryCoverage = z.infer<
  typeof FinanceBankAccountSummaryCoverageSchema
>;
export type FinanceLatestSuccessfulBankAccountSummarySlice = z.infer<
  typeof FinanceLatestSuccessfulBankAccountSummarySliceSchema
>;
export type FinanceReceivablesAgingSliceSummary = z.infer<
  typeof FinanceReceivablesAgingSliceSummarySchema
>;
export type FinanceReceivablesAgingCoverage = z.infer<
  typeof FinanceReceivablesAgingCoverageSchema
>;
export type FinanceLatestSuccessfulReceivablesAgingSlice = z.infer<
  typeof FinanceLatestSuccessfulReceivablesAgingSliceSchema
>;
export type FinancePayablesAgingSliceSummary = z.infer<
  typeof FinancePayablesAgingSliceSummarySchema
>;
export type FinancePayablesAgingCoverage = z.infer<
  typeof FinancePayablesAgingCoverageSchema
>;
export type FinanceLatestSuccessfulPayablesAgingSlice = z.infer<
  typeof FinanceLatestSuccessfulPayablesAgingSliceSchema
>;
export type FinanceLatestAttemptedSlices = z.infer<
  typeof FinanceLatestAttemptedSlicesSchema
>;
export type FinanceLatestSuccessfulSlices = z.infer<
  typeof FinanceLatestSuccessfulSlicesSchema
>;
export type FinanceTwinCompanySummary = z.infer<
  typeof FinanceTwinCompanySummarySchema
>;
export type FinanceTwinSyncResult = z.infer<typeof FinanceTwinSyncResultSchema>;
export type FinanceAccountCatalogEntryView = z.infer<
  typeof FinanceAccountCatalogEntryViewSchema
>;
export type FinanceAccountCatalogView = z.infer<
  typeof FinanceAccountCatalogViewSchema
>;
export type FinanceBankAccountSummaryLineageRef = z.infer<
  typeof FinanceBankAccountSummaryLineageRefSchema
>;
export type FinanceBankAccountReportedBalanceView = z.infer<
  typeof FinanceBankAccountReportedBalanceViewSchema
>;
export type FinanceBankAccountInventoryRow = z.infer<
  typeof FinanceBankAccountInventoryRowSchema
>;
export type FinanceBankAccountInventoryView = z.infer<
  typeof FinanceBankAccountInventoryViewSchema
>;
export type FinanceReceivablesAgingLineageRef = z.infer<
  typeof FinanceReceivablesAgingLineageRefSchema
>;
export type FinanceReceivablesAgingInventoryRow = z.infer<
  typeof FinanceReceivablesAgingInventoryRowSchema
>;
export type FinanceReceivablesAgingView = z.infer<
  typeof FinanceReceivablesAgingViewSchema
>;
export type FinancePayablesAgingLineageRef = z.infer<
  typeof FinancePayablesAgingLineageRefSchema
>;
export type FinancePayablesAgingInventoryRow = z.infer<
  typeof FinancePayablesAgingInventoryRowSchema
>;
export type FinancePayablesAgingView = z.infer<
  typeof FinancePayablesAgingViewSchema
>;
export type FinanceJournalLineView = z.infer<
  typeof FinanceJournalLineViewSchema
>;
export type FinanceGeneralLedgerEntryView = z.infer<
  typeof FinanceGeneralLedgerEntryViewSchema
>;
export type FinanceGeneralLedgerActivity = z.infer<
  typeof FinanceGeneralLedgerActivitySchema
>;
export type FinanceGeneralLedgerView = z.infer<
  typeof FinanceGeneralLedgerViewSchema
>;
export type FinanceSliceAlignmentView = z.infer<
  typeof FinanceSliceAlignmentViewSchema
>;
export type FinanceGeneralLedgerActivityLineageRef = z.infer<
  typeof FinanceGeneralLedgerActivityLineageRefSchema
>;
export type FinanceSnapshotCoverageSummary = z.infer<
  typeof FinanceSnapshotCoverageSummarySchema
>;
export type FinanceSnapshotAccountRow = z.infer<
  typeof FinanceSnapshotAccountRowSchema
>;
export type FinanceSnapshotView = z.infer<typeof FinanceSnapshotViewSchema>;
export type FinanceLineageRecordView = z.infer<
  typeof FinanceLineageRecordViewSchema
>;
export type FinanceLineageDrillView = z.infer<
  typeof FinanceLineageDrillViewSchema
>;
export type FinanceReconciliationFreshnessView = z.infer<
  typeof FinanceReconciliationFreshnessViewSchema
>;
export type FinanceTrialBalanceWindow = z.infer<
  typeof FinanceTrialBalanceWindowSchema
>;
export type FinanceGeneralLedgerWindow = z.infer<
  typeof FinanceGeneralLedgerWindowSchema
>;
export type FinanceReconciliationWindowRelation = z.infer<
  typeof FinanceReconciliationWindowRelationSchema
>;
export type FinanceReconciliationComparabilityView = z.infer<
  typeof FinanceReconciliationComparabilityViewSchema
>;
export type FinanceReconciliationCoverageSummary = z.infer<
  typeof FinanceReconciliationCoverageSummarySchema
>;
export type FinanceReconciliationAccountRow = z.infer<
  typeof FinanceReconciliationAccountRowSchema
>;
export type FinanceReconciliationReadinessView = z.infer<
  typeof FinanceReconciliationReadinessViewSchema
>;
export type FinanceAccountBridgeReadinessState = z.infer<
  typeof FinanceAccountBridgeReadinessStateSchema
>;
export type FinanceAccountBridgeReadinessStatus = z.infer<
  typeof FinanceAccountBridgeReadinessStatusSchema
>;
export type FinanceAccountBridgeCoverageSummary = z.infer<
  typeof FinanceAccountBridgeCoverageSummarySchema
>;
export type FinanceAccountBridgeAccountRow = z.infer<
  typeof FinanceAccountBridgeAccountRowSchema
>;
export type FinanceAccountBridgeReadinessView = z.infer<
  typeof FinanceAccountBridgeReadinessViewSchema
>;
export type FinanceGeneralLedgerBalanceProofBasis = z.infer<
  typeof FinanceGeneralLedgerBalanceProofBasisSchema
>;
export type FinanceGeneralLedgerBalanceProof = z.infer<
  typeof FinanceGeneralLedgerBalanceProofSchema
>;
export type FinanceGeneralLedgerBalanceProofLineageRef = z.infer<
  typeof FinanceGeneralLedgerBalanceProofLineageRefSchema
>;
export type FinancePersistedGeneralLedgerBalanceProof = z.infer<
  typeof FinancePersistedGeneralLedgerBalanceProofSchema
>;
export type FinanceGeneralLedgerBalanceProofTarget = z.infer<
  typeof FinanceGeneralLedgerBalanceProofTargetSchema
>;
export type FinanceGeneralLedgerBalanceProofLineage = z.infer<
  typeof FinanceGeneralLedgerBalanceProofLineageSchema
>;
export type FinanceBalanceBridgePrerequisitesState = z.infer<
  typeof FinanceBalanceBridgePrerequisitesStateSchema
>;
export type FinanceBalanceBridgePrerequisitesStatus = z.infer<
  typeof FinanceBalanceBridgePrerequisitesStatusSchema
>;
export type FinanceBalanceBridgePrerequisitesCoverageSummary = z.infer<
  typeof FinanceBalanceBridgePrerequisitesCoverageSummarySchema
>;
export type FinanceBalanceBridgePrerequisitesAccountRow = z.infer<
  typeof FinanceBalanceBridgePrerequisitesAccountRowSchema
>;
export type FinanceBalanceBridgePrerequisitesView = z.infer<
  typeof FinanceBalanceBridgePrerequisitesViewSchema
>;
export type FinanceGeneralLedgerBalanceProofView = z.infer<
  typeof FinanceGeneralLedgerBalanceProofViewSchema
>;
export type FinanceGeneralLedgerActivityLineageTarget = z.infer<
  typeof FinanceGeneralLedgerActivityLineageTargetSchema
>;
export type FinanceGeneralLedgerActivityLineageRow = z.infer<
  typeof FinanceGeneralLedgerActivityLineageRowSchema
>;
export type FinanceGeneralLedgerActivityLineageView = z.infer<
  typeof FinanceGeneralLedgerActivityLineageViewSchema
>;
export type FinanceCashPostureCurrencyBucket = z.infer<
  typeof FinanceCashPostureCurrencyBucketSchema
>;
export type FinanceCashPostureCoverageSummary = z.infer<
  typeof FinanceCashPostureCoverageSummarySchema
>;
export type FinanceCashPostureView = z.infer<
  typeof FinanceCashPostureViewSchema
>;
export type FinanceCollectionsPostureExactBucketTotal = z.infer<
  typeof FinanceCollectionsPostureExactBucketTotalSchema
>;
export type FinanceCollectionsPostureCurrencyBucket = z.infer<
  typeof FinanceCollectionsPostureCurrencyBucketSchema
>;
export type FinanceCollectionsPostureCoverageSummary = z.infer<
  typeof FinanceCollectionsPostureCoverageSummarySchema
>;
export type FinanceCollectionsPostureView = z.infer<
  typeof FinanceCollectionsPostureViewSchema
>;
export type FinancePayablesPostureExactBucketTotal = z.infer<
  typeof FinancePayablesPostureExactBucketTotalSchema
>;
export type FinancePayablesPostureCurrencyBucket = z.infer<
  typeof FinancePayablesPostureCurrencyBucketSchema
>;
export type FinancePayablesPostureCoverageSummary = z.infer<
  typeof FinancePayablesPostureCoverageSummarySchema
>;
export type FinancePayablesPostureView = z.infer<
  typeof FinancePayablesPostureViewSchema
>;
