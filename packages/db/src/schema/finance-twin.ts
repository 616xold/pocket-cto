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
  ["trial_balance_csv", "chart_of_accounts_csv"],
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
    "trial_balance_line",
    "account_catalog_entry",
  ],
);

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
    accountName: text("account_name").notNull(),
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
    companySyncIndex: index("finance_account_catalog_entries_company_sync_idx").on(
      table.companyId,
      table.syncRunId,
    ),
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
    sourceSnapshotIndex: index("finance_twin_lineage_source_snapshot_id_idx").on(
      table.sourceSnapshotId,
    ),
  }),
);
