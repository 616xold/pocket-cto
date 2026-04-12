import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sourceFiles, sourceSnapshots, sources } from "./sources";
import { createdAt, id, updatedAt } from "./shared";

export const financeTwinExtractorKeyEnum = pgEnum(
  "finance_twin_extractor_key",
  [
    "trial_balance_csv",
    "chart_of_accounts_csv",
    "general_ledger_csv",
    "bank_account_summary_csv",
    "receivables_aging_csv",
    "payables_aging_csv",
  ],
);

export const financeTwinSyncRunStatusEnum = pgEnum(
  "finance_twin_sync_run_status",
  ["running", "succeeded", "failed"],
);

export const financeTwinLineageTargetKindEnum = pgEnum(
  "finance_twin_lineage_target_kind",
  [
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
  ],
);

export const financeBankBalanceTypeEnum = pgEnum(
  "finance_bank_balance_type",
  ["statement_or_ledger", "available", "unspecified"],
);

type FinanceReceivablesAgingBucketValueJson = {
  amount: string;
  bucketClass: string;
  bucketKey: string;
  sourceColumn: string;
};

type FinancePayablesAgingBucketValueJson = {
  amount: string;
  bucketClass: string;
  bucketKey: string;
  sourceColumn: string;
};

export const financeCompanies = pgTable(
  "finance_companies",
  {
    id: id(),
    companyKey: text("company_key").notNull(),
    displayName: text("display_name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyKeyUnique: uniqueIndex("finance_companies_company_key_key").on(
      table.companyKey,
    ),
  }),
);

export const financeReportingPeriods = pgTable(
  "finance_reporting_periods",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    periodKey: text("period_key").notNull(),
    label: text("label").notNull(),
    periodStart: date("period_start"),
    periodEnd: date("period_end").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyPeriodUnique: uniqueIndex(
      "finance_reporting_periods_company_period_key_key",
    ).on(table.companyId, table.periodKey),
    companyPeriodEndIndex: index(
      "finance_reporting_periods_company_period_end_idx",
    ).on(table.companyId, table.periodEnd),
  }),
);

export const financeLedgerAccounts = pgTable(
  "finance_ledger_accounts",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    accountCode: text("account_code").notNull(),
    accountName: text("account_name"),
    accountType: text("account_type"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyAccountCodeUnique: uniqueIndex(
      "finance_ledger_accounts_company_account_code_key",
    ).on(table.companyId, table.accountCode),
    companyAccountIndex: index("finance_ledger_accounts_company_id_idx").on(
      table.companyId,
    ),
  }),
);

export const financeBankAccounts = pgTable(
  "finance_bank_accounts",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    identityKey: text("identity_key").notNull(),
    accountLabel: text("account_label").notNull(),
    institutionName: text("institution_name"),
    externalAccountId: text("external_account_id"),
    accountNumberLast4: text("account_number_last4"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyIdentityUnique: uniqueIndex(
      "finance_bank_accounts_company_identity_key_key",
    ).on(table.companyId, table.identityKey),
    companyAccountLabelIndex: index(
      "finance_bank_accounts_company_account_label_idx",
    ).on(table.companyId, table.accountLabel),
  }),
);

export const financeCustomers = pgTable(
  "finance_customers",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    identityKey: text("identity_key").notNull(),
    customerLabel: text("customer_label").notNull(),
    externalCustomerId: text("external_customer_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyIdentityUnique: uniqueIndex(
      "finance_customers_company_identity_key_key",
    ).on(table.companyId, table.identityKey),
    companyCustomerLabelIndex: index(
      "finance_customers_company_customer_label_idx",
    ).on(table.companyId, table.customerLabel),
  }),
);

export const financeVendors = pgTable(
  "finance_vendors",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    identityKey: text("identity_key").notNull(),
    vendorLabel: text("vendor_label").notNull(),
    externalVendorId: text("external_vendor_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyIdentityUnique: uniqueIndex(
      "finance_vendors_company_identity_key_key",
    ).on(table.companyId, table.identityKey),
    companyVendorLabelIndex: index("finance_vendors_company_vendor_label_idx").on(
      table.companyId,
      table.vendorLabel,
    ),
  }),
);

export const financeTwinSyncRuns = pgTable(
  "finance_twin_sync_runs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    reportingPeriodId: uuid("reporting_period_id").references(
      () => financeReportingPeriods.id,
      {
        onDelete: "set null",
      },
    ),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    sourceSnapshotId: uuid("source_snapshot_id")
      .references(() => sourceSnapshots.id, { onDelete: "cascade" })
      .notNull(),
    sourceFileId: uuid("source_file_id")
      .references(() => sourceFiles.id, { onDelete: "cascade" })
      .notNull(),
    extractorKey: financeTwinExtractorKeyEnum("extractor_key").notNull(),
    status: financeTwinSyncRunStatusEnum("status").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    stats: jsonb("stats").notNull().default({}),
    errorSummary: text("error_summary"),
    createdAt: createdAt(),
  },
  (table) => ({
    companyCreatedAtIndex: index("finance_twin_sync_runs_company_id_idx").on(
      table.companyId,
      table.createdAt,
    ),
    sourceFileCreatedAtIndex: index(
      "finance_twin_sync_runs_source_file_id_idx",
    ).on(table.sourceFileId, table.createdAt),
  }),
);

export const financeBankAccountSummaries = pgTable(
  "finance_bank_account_summaries",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    bankAccountId: uuid("bank_account_id")
      .references(() => financeBankAccounts.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    lineNumber: integer("line_number").notNull(),
    balanceType: financeBankBalanceTypeEnum("balance_type").notNull(),
    balanceAmount: numeric("balance_amount", {
      precision: 18,
      scale: 2,
    }).notNull(),
    currencyCode: text("currency_code"),
    asOfDate: date("as_of_date"),
    asOfDateSourceColumn: text("as_of_date_source_column"),
    balanceSourceColumn: text("balance_source_column").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunBankAccountBalanceTypeUnique: uniqueIndex(
      "finance_bank_account_summaries_sync_run_account_balance_type_key",
    ).on(table.syncRunId, table.bankAccountId, table.balanceType),
    companySyncIndex: index(
      "finance_bank_account_summaries_company_sync_idx",
    ).on(table.companyId, table.syncRunId),
    bankAccountIndex: index(
      "finance_bank_account_summaries_bank_account_id_idx",
    ).on(table.bankAccountId),
  }),
);

export const financeReceivablesAgingRows = pgTable(
  "finance_receivables_aging_rows",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    customerId: uuid("customer_id")
      .references(() => financeCustomers.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    rowScopeKey: text("row_scope_key").notNull(),
    lineNumber: integer("line_number").notNull(),
    sourceLineNumbers: jsonb("source_line_numbers").$type<number[]>().notNull(),
    currencyCode: text("currency_code"),
    asOfDate: date("as_of_date"),
    asOfDateSourceColumn: text("as_of_date_source_column"),
    bucketValues: jsonb("bucket_values")
      .$type<FinanceReceivablesAgingBucketValueJson[]>()
      .notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunCustomerScopeUnique: uniqueIndex(
      "finance_receivables_aging_rows_sync_run_customer_scope_key",
    ).on(table.syncRunId, table.customerId, table.rowScopeKey),
    companySyncIndex: index(
      "finance_receivables_aging_rows_company_sync_idx",
    ).on(table.companyId, table.syncRunId),
    customerIndex: index("finance_receivables_aging_rows_customer_id_idx").on(
      table.customerId,
    ),
  }),
);

export const financePayablesAgingRows = pgTable(
  "finance_payables_aging_rows",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    vendorId: uuid("vendor_id")
      .references(() => financeVendors.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    rowScopeKey: text("row_scope_key").notNull(),
    lineNumber: integer("line_number").notNull(),
    sourceLineNumbers: jsonb("source_line_numbers").$type<number[]>().notNull(),
    currencyCode: text("currency_code"),
    asOfDate: date("as_of_date"),
    asOfDateSourceColumn: text("as_of_date_source_column"),
    bucketValues: jsonb("bucket_values")
      .$type<FinancePayablesAgingBucketValueJson[]>()
      .notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunVendorScopeUnique: uniqueIndex(
      "finance_payables_aging_rows_sync_run_vendor_scope_key",
    ).on(table.syncRunId, table.vendorId, table.rowScopeKey),
    companySyncIndex: index("finance_payables_aging_rows_company_sync_idx").on(
      table.companyId,
      table.syncRunId,
    ),
    vendorIndex: index("finance_payables_aging_rows_vendor_id_idx").on(
      table.vendorId,
    ),
  }),
);

export const financeAccountCatalogEntries = pgTable(
  "finance_account_catalog_entries",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    ledgerAccountId: uuid("ledger_account_id")
      .references(() => financeLedgerAccounts.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    lineNumber: integer("line_number").notNull(),
    detailType: text("detail_type"),
    description: text("description"),
    parentAccountCode: text("parent_account_code"),
    isActive: boolean("is_active"),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunLedgerAccountUnique: uniqueIndex(
      "finance_account_catalog_entries_sync_run_ledger_account_key",
    ).on(table.syncRunId, table.ledgerAccountId),
    companySyncIndex: index(
      "finance_account_catalog_entries_company_sync_idx",
    ).on(table.companyId, table.syncRunId),
  }),
);

export const financeTrialBalanceLines = pgTable(
  "finance_trial_balance_lines",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    reportingPeriodId: uuid("reporting_period_id")
      .references(() => financeReportingPeriods.id, { onDelete: "cascade" })
      .notNull(),
    ledgerAccountId: uuid("ledger_account_id")
      .references(() => financeLedgerAccounts.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    lineNumber: integer("line_number").notNull(),
    debitAmount: numeric("debit_amount", { precision: 18, scale: 2 }).notNull(),
    creditAmount: numeric("credit_amount", {
      precision: 18,
      scale: 2,
    }).notNull(),
    netAmount: numeric("net_amount", { precision: 18, scale: 2 }).notNull(),
    currencyCode: text("currency_code"),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunLedgerAccountUnique: uniqueIndex(
      "finance_trial_balance_lines_sync_run_ledger_account_key",
    ).on(table.syncRunId, table.ledgerAccountId),
    companyPeriodIndex: index(
      "finance_trial_balance_lines_company_period_idx",
    ).on(table.companyId, table.reportingPeriodId),
  }),
);

export const financeJournalEntries = pgTable(
  "finance_journal_entries",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    externalEntryId: text("external_entry_id").notNull(),
    transactionDate: date("transaction_date").notNull(),
    entryDescription: text("entry_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunExternalEntryUnique: uniqueIndex(
      "finance_journal_entries_sync_run_external_entry_key",
    ).on(table.syncRunId, table.externalEntryId),
    companySyncIndex: index("finance_journal_entries_company_sync_idx").on(
      table.companyId,
      table.syncRunId,
    ),
    companyDateIndex: index("finance_journal_entries_company_date_idx").on(
      table.companyId,
      table.transactionDate,
    ),
  }),
);

export const financeJournalLines = pgTable(
  "finance_journal_lines",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    journalEntryId: uuid("journal_entry_id")
      .references(() => financeJournalEntries.id, { onDelete: "cascade" })
      .notNull(),
    ledgerAccountId: uuid("ledger_account_id")
      .references(() => financeLedgerAccounts.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    lineNumber: integer("line_number").notNull(),
    debitAmount: numeric("debit_amount", { precision: 18, scale: 2 }).notNull(),
    creditAmount: numeric("credit_amount", {
      precision: 18,
      scale: 2,
    }).notNull(),
    currencyCode: text("currency_code"),
    lineDescription: text("line_description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunLineNumberUnique: uniqueIndex(
      "finance_journal_lines_sync_run_line_number_key",
    ).on(table.syncRunId, table.lineNumber),
    journalEntryIndex: index("finance_journal_lines_journal_entry_id_idx").on(
      table.journalEntryId,
      table.lineNumber,
    ),
    companySyncIndex: index("finance_journal_lines_company_sync_idx").on(
      table.companyId,
      table.syncRunId,
    ),
  }),
);

export const financeGeneralLedgerBalanceProofs = pgTable(
  "finance_general_ledger_balance_proofs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    ledgerAccountId: uuid("ledger_account_id")
      .references(() => financeLedgerAccounts.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    openingBalanceAmount: numeric("opening_balance_amount", {
      precision: 18,
      scale: 2,
    }),
    openingBalanceSourceColumn: text("opening_balance_source_column"),
    openingBalanceLineNumber: integer("opening_balance_line_number"),
    endingBalanceAmount: numeric("ending_balance_amount", {
      precision: 18,
      scale: 2,
    }),
    endingBalanceSourceColumn: text("ending_balance_source_column"),
    endingBalanceLineNumber: integer("ending_balance_line_number"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    syncRunLedgerAccountUnique: uniqueIndex(
      "finance_general_ledger_balance_proofs_sync_run_ledger_account_key",
    ).on(table.syncRunId, table.ledgerAccountId),
    companySyncIndex: index(
      "finance_general_ledger_balance_proofs_company_sync_idx",
    ).on(table.companyId, table.syncRunId),
    ledgerAccountIndex: index(
      "finance_general_ledger_balance_proofs_ledger_account_idx",
    ).on(table.ledgerAccountId),
  }),
);

export const financeTwinLineage = pgTable(
  "finance_twin_lineage",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    syncRunId: uuid("sync_run_id")
      .references(() => financeTwinSyncRuns.id, { onDelete: "cascade" })
      .notNull(),
    targetKind: financeTwinLineageTargetKindEnum("target_kind").notNull(),
    targetId: uuid("target_id").notNull(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    sourceSnapshotId: uuid("source_snapshot_id")
      .references(() => sourceSnapshots.id, { onDelete: "cascade" })
      .notNull(),
    sourceFileId: uuid("source_file_id")
      .references(() => sourceFiles.id, { onDelete: "cascade" })
      .notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (table) => ({
    syncRunTargetUnique: uniqueIndex(
      "finance_twin_lineage_sync_run_target_key",
    ).on(table.syncRunId, table.targetKind, table.targetId),
    targetLookupIndex: index("finance_twin_lineage_target_lookup_idx").on(
      table.targetKind,
      table.targetId,
    ),
    sourceSnapshotIndex: index(
      "finance_twin_lineage_source_snapshot_id_idx",
    ).on(table.sourceSnapshotId),
  }),
);
