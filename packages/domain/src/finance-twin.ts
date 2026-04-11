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
]);

export const FinanceTwinSyncRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const FinanceTwinLineageTargetKindSchema = z.enum([
  "reporting_period",
  "ledger_account",
  "trial_balance_line",
  "account_catalog_entry",
  "journal_entry",
  "journal_line",
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
  trialBalanceLineCount: 0,
  accountCatalogEntryCount: 0,
  journalEntryCount: 0,
  journalLineCount: 0,
} as const;

export const FinanceLineageTargetCountsSchema = z.object({
  reportingPeriodCount: z.number().int().nonnegative().default(0),
  ledgerAccountCount: z.number().int().nonnegative().default(0),
  trialBalanceLineCount: z.number().int().nonnegative().default(0),
  accountCatalogEntryCount: z.number().int().nonnegative().default(0),
  journalEntryCount: z.number().int().nonnegative().default(0),
  journalLineCount: z.number().int().nonnegative().default(0),
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
  sourceDeclaredPeriod: FinanceGeneralLedgerSourceDeclaredPeriodSchema.nullable(),
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
export type FinanceFreshnessState = z.infer<
  typeof FinanceFreshnessStateSchema
>;
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
export type FinanceGeneralLedgerActivityLineageTarget = z.infer<
  typeof FinanceGeneralLedgerActivityLineageTargetSchema
>;
export type FinanceGeneralLedgerActivityLineageRow = z.infer<
  typeof FinanceGeneralLedgerActivityLineageRowSchema
>;
export type FinanceGeneralLedgerActivityLineageView = z.infer<
  typeof FinanceGeneralLedgerActivityLineageViewSchema
>;
