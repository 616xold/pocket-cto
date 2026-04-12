import { loadEnv, resolveTestDatabaseUrl } from "@pocket-cto/config";
import {
  artifacts,
  closeAllPools,
  createDb,
  missionInputs,
  missionTasks,
  missions,
  replayEvents,
} from "@pocket-cto/db";
import type {
  financeAccountCatalogEntries,
  financeBankAccounts,
  financeBankAccountSummaries,
  financeCompanies,
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
  provenanceRecords,
  sourceFiles,
  sourceIngestRuns,
  sourceSnapshots,
  sources,
} from "@pocket-cto/db";
import { count, sql } from "drizzle-orm";

const env = loadEnv();
const testDatabaseUrl = resolveTestDatabaseUrl(env);

export function createTestDb() {
  return createDb(testDatabaseUrl);
}

export function getTestDatabaseUrl() {
  return testDatabaseUrl;
}

export async function resetTestDatabase() {
  const db = createTestDb();

  await db.execute(sql`
    TRUNCATE TABLE
      finance_twin_lineage,
      finance_payables_aging_rows,
      finance_receivables_aging_rows,
      finance_bank_account_summaries,
      finance_general_ledger_balance_proofs,
      finance_journal_lines,
      finance_journal_entries,
      finance_trial_balance_lines,
      finance_account_catalog_entries,
      finance_twin_sync_runs,
      finance_vendors,
      finance_customers,
      finance_bank_accounts,
      finance_ledger_accounts,
      finance_reporting_periods,
      finance_companies,
      twin_edges,
      twin_entities,
      twin_sync_runs,
      source_ingest_runs,
      provenance_records,
      source_files,
      source_snapshots,
      sources,
      github_issue_mission_bindings,
      github_webhook_deliveries,
      repositories,
      github_installations,
      replay_events,
      outbox_events,
      approvals,
      artifacts,
      workspaces,
      mission_tasks,
      mission_inputs,
      missions
    RESTART IDENTITY CASCADE
  `);
}

export async function getMissionPersistenceTableCounts() {
  const db = createTestDb();
  const [
    missionCount,
    missionInputCount,
    missionTaskCount,
    replayEventCount,
    artifactCount,
  ] = await Promise.all([
    selectCount(db, missions),
    selectCount(db, missionInputs),
    selectCount(db, missionTasks),
    selectCount(db, replayEvents),
    selectCount(db, artifacts),
  ]);

  return {
    missions: missionCount,
    missionInputs: missionInputCount,
    missionTasks: missionTaskCount,
    replayEvents: replayEventCount,
    artifacts: artifactCount,
  };
}

export async function closeTestDatabase() {
  await closeAllPools();
}

async function selectCount(
  db: ReturnType<typeof createDb>,
  table:
    | typeof missions
    | typeof missionInputs
    | typeof missionTasks
    | typeof replayEvents
    | typeof artifacts
    | typeof sources
    | typeof sourceSnapshots
    | typeof sourceFiles
    | typeof sourceIngestRuns
    | typeof provenanceRecords
    | typeof financeAccountCatalogEntries
    | typeof financeBankAccounts
    | typeof financeBankAccountSummaries
    | typeof financeCompanies
    | typeof financeCustomers
    | typeof financeReportingPeriods
    | typeof financeLedgerAccounts
    | typeof financeVendors
    | typeof financePayablesAgingRows
    | typeof financeReceivablesAgingRows
    | typeof financeGeneralLedgerBalanceProofs
    | typeof financeJournalEntries
    | typeof financeJournalLines
    | typeof financeTwinSyncRuns
    | typeof financeTrialBalanceLines
    | typeof financeTwinLineage,
) {
  const [result] = await db.select({ count: count() }).from(table);
  return result?.count ?? 0;
}
