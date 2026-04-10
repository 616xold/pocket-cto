import { z } from "zod";

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
  accountName: z.string().min(1),
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

export const FinanceCompanyTotalsSchema = z.object({
  reportingPeriodCount: z.number().int().nonnegative(),
  ledgerAccountCount: z.number().int().nonnegative(),
});

export const FinanceTrialBalanceCoverageSchema = z.object({
  lineCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
});

export const FinanceChartOfAccountsCoverageSchema = z.object({
  accountCatalogEntryCount: z.number().int().nonnegative(),
  lineageCount: z.number().int().nonnegative(),
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

export const FinanceLatestSuccessfulSlicesSchema = z.object({
  trialBalance: FinanceLatestSuccessfulTrialBalanceSliceSchema,
  chartOfAccounts: FinanceLatestSuccessfulChartOfAccountsSliceSchema,
});

export const FinanceTwinCompanySummarySchema = z.object({
  company: FinanceCompanyRecordSchema,
  latestAttemptedSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  latestSuccessfulSyncRun: FinanceTwinSyncRunRecordSchema.nullable(),
  freshness: FinanceFreshnessViewSchema,
  companyTotals: FinanceCompanyTotalsSchema,
  latestSuccessfulSlices: FinanceLatestSuccessfulSlicesSchema,
  limitations: z.array(z.string().min(1)),
});

export const FinanceTwinSyncResultSchema = z.object({
  company: FinanceCompanyRecordSchema,
  syncRun: FinanceTwinSyncRunRecordSchema,
  freshness: FinanceFreshnessViewSchema,
  companyTotals: FinanceCompanyTotalsSchema,
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
export type FinanceTwinSyncRunRecord = z.infer<
  typeof FinanceTwinSyncRunRecordSchema
>;
export type FinanceTwinLineageRecord = z.infer<
  typeof FinanceTwinLineageRecordSchema
>;
export type FinanceTwinSyncInput = z.infer<typeof FinanceTwinSyncInputSchema>;
export type FinanceTwinSourceRef = z.infer<typeof FinanceTwinSourceRefSchema>;
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
export type FinanceCompanyTotals = z.infer<typeof FinanceCompanyTotalsSchema>;
export type FinanceTrialBalanceCoverage = z.infer<
  typeof FinanceTrialBalanceCoverageSchema
>;
export type FinanceChartOfAccountsCoverage = z.infer<
  typeof FinanceChartOfAccountsCoverageSchema
>;
export type FinanceLatestSuccessfulTrialBalanceSlice = z.infer<
  typeof FinanceLatestSuccessfulTrialBalanceSliceSchema
>;
export type FinanceLatestSuccessfulChartOfAccountsSlice = z.infer<
  typeof FinanceLatestSuccessfulChartOfAccountsSliceSchema
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
