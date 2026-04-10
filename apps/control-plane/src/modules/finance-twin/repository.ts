import type {
  FinanceAccountCatalogEntryRecord,
  FinanceAccountCatalogEntryView,
  FinanceCompanyRecord,
  FinanceLedgerAccountRecord,
  FinanceReportingPeriodRecord,
  FinanceTrialBalanceLineRecord,
  FinanceTwinExtractorKey,
  FinanceTwinLineageRecord,
  FinanceTwinLineageTargetKind,
  FinanceTwinSyncRunRecord,
  FinanceTwinSyncRunStatus,
} from "@pocket-cto/domain";
import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";

export type UpsertFinanceCompanyInput = {
  companyKey: string;
  displayName: string;
};

export type UpsertFinanceReportingPeriodInput = {
  companyId: string;
  periodKey: string;
  label: string;
  periodStart: string | null;
  periodEnd: string;
};

export type UpsertFinanceLedgerAccountInput = {
  companyId: string;
  accountCode: string;
  accountName: string;
  accountType: string | null;
};

export type StartFinanceTwinSyncRunInput = {
  companyId: string;
  sourceId: string;
  sourceSnapshotId: string;
  sourceFileId: string;
  extractorKey: FinanceTwinExtractorKey;
  startedAt: string;
};

export type FinishFinanceTwinSyncRunInput = {
  syncRunId: string;
  reportingPeriodId: string | null;
  status: FinanceTwinSyncRunStatus;
  completedAt: string;
  stats: Record<string, unknown>;
  errorSummary: string | null;
};

export type UpsertFinanceTrialBalanceLineInput = {
  companyId: string;
  reportingPeriodId: string;
  ledgerAccountId: string;
  syncRunId: string;
  lineNumber: number;
  debitAmount: string;
  creditAmount: string;
  netAmount: string;
  currencyCode: string | null;
  observedAt: string;
};

export type UpsertFinanceAccountCatalogEntryInput = {
  companyId: string;
  ledgerAccountId: string;
  syncRunId: string;
  lineNumber: number;
  detailType: string | null;
  description: string | null;
  parentAccountCode: string | null;
  isActive: boolean | null;
  observedAt: string;
};

export type CreateFinanceTwinLineageInput = {
  companyId: string;
  syncRunId: string;
  targetKind: FinanceTwinLineageTargetKind;
  targetId: string;
  sourceId: string;
  sourceSnapshotId: string;
  sourceFileId: string;
  recordedAt: string;
};

export interface FinanceTwinRepository extends TransactionalRepository {
  getCompanyByKey(
    companyKey: string,
    session?: PersistenceSession,
  ): Promise<FinanceCompanyRecord | null>;
  upsertCompany(
    input: UpsertFinanceCompanyInput,
    session?: PersistenceSession,
  ): Promise<FinanceCompanyRecord>;
  upsertReportingPeriod(
    input: UpsertFinanceReportingPeriodInput,
    session?: PersistenceSession,
  ): Promise<FinanceReportingPeriodRecord>;
  getReportingPeriodById(
    reportingPeriodId: string,
    session?: PersistenceSession,
  ): Promise<FinanceReportingPeriodRecord | null>;
  countReportingPeriodsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<number>;
  upsertLedgerAccount(
    input: UpsertFinanceLedgerAccountInput,
    session?: PersistenceSession,
  ): Promise<FinanceLedgerAccountRecord>;
  countLedgerAccountsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<number>;
  startSyncRun(
    input: StartFinanceTwinSyncRunInput,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord>;
  finishSyncRun(
    input: FinishFinanceTwinSyncRunInput,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord>;
  getLatestSyncRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord | null>;
  getLatestSuccessfulSyncRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord | null>;
  getLatestSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: FinanceTwinExtractorKey,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord | null>;
  getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: FinanceTwinExtractorKey,
    session?: PersistenceSession,
  ): Promise<FinanceTwinSyncRunRecord | null>;
  upsertTrialBalanceLine(
    input: UpsertFinanceTrialBalanceLineInput,
    session?: PersistenceSession,
  ): Promise<FinanceTrialBalanceLineRecord>;
  listTrialBalanceLinesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceTrialBalanceLineRecord[]>;
  upsertAccountCatalogEntry(
    input: UpsertFinanceAccountCatalogEntryInput,
    session?: PersistenceSession,
  ): Promise<FinanceAccountCatalogEntryRecord>;
  listAccountCatalogEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceAccountCatalogEntryView[]>;
  createLineage(
    input: CreateFinanceTwinLineageInput,
    session?: PersistenceSession,
  ): Promise<FinanceTwinLineageRecord>;
  countLineageBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<number>;
}

export class InMemoryFinanceTwinRepository implements FinanceTwinRepository {
  private readonly companies = new Map<string, FinanceCompanyRecord>();
  private readonly companiesByKey = new Map<string, string>();
  private readonly reportingPeriods = new Map<string, FinanceReportingPeriodRecord>();
  private readonly reportingPeriodsByScope = new Map<string, string>();
  private readonly ledgerAccounts = new Map<string, FinanceLedgerAccountRecord>();
  private readonly ledgerAccountsByScope = new Map<string, string>();
  private readonly syncRuns = new Map<string, FinanceTwinSyncRunRecord>();
  private readonly trialBalanceLines = new Map<string, FinanceTrialBalanceLineRecord>();
  private readonly trialBalanceLinesByScope = new Map<string, string>();
  private readonly accountCatalogEntries = new Map<
    string,
    FinanceAccountCatalogEntryRecord
  >();
  private readonly accountCatalogEntriesByScope = new Map<string, string>();
  private readonly lineage = new Map<string, FinanceTwinLineageRecord>();
  private readonly lineageByScope = new Map<string, string>();

  async transaction<T>(operation: (session: PersistenceSession) => Promise<T>) {
    return operation(createMemorySession());
  }

  async getCompanyByKey(companyKey: string) {
    const companyId = this.companiesByKey.get(companyKey);
    return companyId ? (this.companies.get(companyId) ?? null) : null;
  }

  async upsertCompany(input: UpsertFinanceCompanyInput) {
    const existing = await this.getCompanyByKey(input.companyKey);
    const now = new Date().toISOString();
    const company: FinanceCompanyRecord = existing
      ? { ...existing, displayName: input.displayName, updatedAt: now }
      : {
          id: crypto.randomUUID(),
          companyKey: input.companyKey,
          displayName: input.displayName,
          createdAt: now,
          updatedAt: now,
        };

    this.companies.set(company.id, company);
    this.companiesByKey.set(company.companyKey, company.id);
    return company;
  }

  async upsertReportingPeriod(input: UpsertFinanceReportingPeriodInput) {
    const existing = this.reportingPeriods.get(
      this.reportingPeriodsByScope.get(
        `${input.companyId}::${input.periodKey}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const reportingPeriod: FinanceReportingPeriodRecord = existing
      ? {
          ...existing,
          label: input.label,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          periodKey: input.periodKey,
          label: input.label,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          createdAt: now,
          updatedAt: now,
        };

    this.reportingPeriods.set(reportingPeriod.id, reportingPeriod);
    this.reportingPeriodsByScope.set(
      `${input.companyId}::${input.periodKey}`,
      reportingPeriod.id,
    );
    return reportingPeriod;
  }

  async getReportingPeriodById(reportingPeriodId: string) {
    return this.reportingPeriods.get(reportingPeriodId) ?? null;
  }

  async countReportingPeriodsByCompanyId(companyId: string) {
    return [...this.reportingPeriods.values()].filter(
      (period) => period.companyId === companyId,
    ).length;
  }

  async upsertLedgerAccount(input: UpsertFinanceLedgerAccountInput) {
    const existing = this.ledgerAccounts.get(
      this.ledgerAccountsByScope.get(
        `${input.companyId}::${input.accountCode}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const ledgerAccount: FinanceLedgerAccountRecord = existing
      ? {
          ...existing,
          accountName: input.accountName,
          accountType: input.accountType,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          accountCode: input.accountCode,
          accountName: input.accountName,
          accountType: input.accountType,
          createdAt: now,
          updatedAt: now,
        };

    this.ledgerAccounts.set(ledgerAccount.id, ledgerAccount);
    this.ledgerAccountsByScope.set(
      `${input.companyId}::${input.accountCode}`,
      ledgerAccount.id,
    );
    return ledgerAccount;
  }

  async countLedgerAccountsByCompanyId(companyId: string) {
    return [...this.ledgerAccounts.values()].filter(
      (account) => account.companyId === companyId,
    ).length;
  }

  async startSyncRun(input: StartFinanceTwinSyncRunInput) {
    const syncRun: FinanceTwinSyncRunRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      reportingPeriodId: null,
      sourceId: input.sourceId,
      sourceSnapshotId: input.sourceSnapshotId,
      sourceFileId: input.sourceFileId,
      extractorKey: input.extractorKey,
      status: "running",
      startedAt: input.startedAt,
      completedAt: null,
      stats: {},
      errorSummary: null,
      createdAt: input.startedAt,
    };

    this.syncRuns.set(syncRun.id, syncRun);
    return syncRun;
  }

  async finishSyncRun(input: FinishFinanceTwinSyncRunInput) {
    const existing = this.syncRuns.get(input.syncRunId);

    if (!existing) {
      throw new Error(`Finance twin sync run ${input.syncRunId} not found`);
    }

    const syncRun: FinanceTwinSyncRunRecord = {
      ...existing,
      reportingPeriodId: input.reportingPeriodId,
      status: input.status,
      completedAt: input.completedAt,
      stats: input.stats,
      errorSummary: input.errorSummary,
    };

    this.syncRuns.set(syncRun.id, syncRun);
    return syncRun;
  }

  async getLatestSyncRunByCompanyId(companyId: string) {
    return sortSyncRuns(
      [...this.syncRuns.values()].filter((run) => run.companyId === companyId),
    )[0] ?? null;
  }

  async getLatestSuccessfulSyncRunByCompanyId(companyId: string) {
    return (
      sortSyncRuns(
        [...this.syncRuns.values()].filter(
          (run) => run.companyId === companyId && run.status === "succeeded",
        ),
      )[0] ?? null
    );
  }

  async getLatestSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: FinanceTwinExtractorKey,
  ) {
    return (
      sortSyncRuns(
        [...this.syncRuns.values()].filter(
          (run) =>
            run.companyId === companyId && run.extractorKey === extractorKey,
        ),
      )[0] ?? null
    );
  }

  async getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: FinanceTwinExtractorKey,
  ) {
    return (
      sortSyncRuns(
        [...this.syncRuns.values()].filter(
          (run) =>
            run.companyId === companyId &&
            run.extractorKey === extractorKey &&
            run.status === "succeeded",
        ),
      )[0] ?? null
    );
  }

  async upsertTrialBalanceLine(input: UpsertFinanceTrialBalanceLineInput) {
    const existing = this.trialBalanceLines.get(
      this.trialBalanceLinesByScope.get(
        `${input.syncRunId}::${input.ledgerAccountId}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const line: FinanceTrialBalanceLineRecord = existing
      ? {
          ...existing,
          lineNumber: input.lineNumber,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          netAmount: input.netAmount,
          currencyCode: input.currencyCode,
          observedAt: input.observedAt,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          reportingPeriodId: input.reportingPeriodId,
          ledgerAccountId: input.ledgerAccountId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          netAmount: input.netAmount,
          currencyCode: input.currencyCode,
          observedAt: input.observedAt,
          createdAt: now,
          updatedAt: now,
        };

    this.trialBalanceLines.set(line.id, line);
    this.trialBalanceLinesByScope.set(
      `${input.syncRunId}::${input.ledgerAccountId}`,
      line.id,
    );
    return line;
  }

  async listTrialBalanceLinesBySyncRunId(syncRunId: string) {
    return [...this.trialBalanceLines.values()]
      .filter((line) => line.syncRunId === syncRunId)
      .sort((left, right) => left.lineNumber - right.lineNumber);
  }

  async upsertAccountCatalogEntry(input: UpsertFinanceAccountCatalogEntryInput) {
    const existing = this.accountCatalogEntries.get(
      this.accountCatalogEntriesByScope.get(
        `${input.syncRunId}::${input.ledgerAccountId}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const entry: FinanceAccountCatalogEntryRecord = existing
      ? {
          ...existing,
          lineNumber: input.lineNumber,
          detailType: input.detailType,
          description: input.description,
          parentAccountCode: input.parentAccountCode,
          isActive: input.isActive,
          observedAt: input.observedAt,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          ledgerAccountId: input.ledgerAccountId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          detailType: input.detailType,
          description: input.description,
          parentAccountCode: input.parentAccountCode,
          isActive: input.isActive,
          observedAt: input.observedAt,
          createdAt: now,
          updatedAt: now,
        };

    this.accountCatalogEntries.set(entry.id, entry);
    this.accountCatalogEntriesByScope.set(
      `${input.syncRunId}::${input.ledgerAccountId}`,
      entry.id,
    );
    return entry;
  }

  async listAccountCatalogEntriesBySyncRunId(syncRunId: string) {
    return [...this.accountCatalogEntries.values()]
      .filter((entry) => entry.syncRunId === syncRunId)
      .sort((left, right) => left.lineNumber - right.lineNumber)
      .map((catalogEntry) => {
        const ledgerAccount = this.ledgerAccounts.get(catalogEntry.ledgerAccountId);

        if (!ledgerAccount) {
          throw new Error(
            `Ledger account ${catalogEntry.ledgerAccountId} missing for account catalog entry ${catalogEntry.id}`,
          );
        }

        return {
          catalogEntry,
          ledgerAccount,
        };
      });
  }

  async createLineage(input: CreateFinanceTwinLineageInput) {
    const existing = this.lineage.get(
      this.lineageByScope.get(
        `${input.syncRunId}::${input.targetKind}::${input.targetId}`,
      ) ?? "",
    );

    if (existing) {
      return existing;
    }

    const lineage: FinanceTwinLineageRecord = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      syncRunId: input.syncRunId,
      targetKind: input.targetKind,
      targetId: input.targetId,
      sourceId: input.sourceId,
      sourceSnapshotId: input.sourceSnapshotId,
      sourceFileId: input.sourceFileId,
      recordedAt: input.recordedAt,
      createdAt: new Date().toISOString(),
    };

    this.lineage.set(lineage.id, lineage);
    this.lineageByScope.set(
      `${input.syncRunId}::${input.targetKind}::${input.targetId}`,
      lineage.id,
    );
    return lineage;
  }

  async countLineageBySyncRunId(syncRunId: string) {
    return [...this.lineage.values()].filter(
      (lineage) => lineage.syncRunId === syncRunId,
    ).length;
  }
}

function sortSyncRuns(runs: FinanceTwinSyncRunRecord[]) {
  return runs.sort((left, right) => {
    return (
      right.startedAt.localeCompare(left.startedAt) ||
      right.createdAt.localeCompare(left.createdAt) ||
      left.id.localeCompare(right.id)
    );
  });
}
