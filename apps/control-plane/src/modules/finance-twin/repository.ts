import type {
  FinanceAccountCatalogEntryRecord,
  FinanceAccountCatalogEntryView,
  FinanceBankAccountRecord,
  FinanceBankAccountSummaryRecord,
  FinanceBankBalanceType,
  FinanceCompanyRecord,
  FinanceCustomerRecord,
  FinanceGeneralLedgerEntryView,
  FinanceGeneralLedgerBalanceProofRecord,
  FinanceJournalEntryRecord,
  FinanceJournalLineRecord,
  FinanceJournalLineView,
  FinanceLedgerAccountRecord,
  FinancePayablesAgingBucketValue,
  FinancePayablesAgingRowRecord,
  FinanceReceivablesAgingBucketValue,
  FinanceReceivablesAgingRowRecord,
  FinanceReportingPeriodRecord,
  FinanceTrialBalanceLineRecord,
  FinanceTwinExtractorKey,
  FinanceTwinLineageRecord,
  FinanceTwinLineageTargetKind,
  FinanceTwinSyncRunRecord,
  FinanceTwinSyncRunStatus,
  FinanceVendorRecord,
} from "@pocket-cto/domain";
import {
  createMemorySession,
  type PersistenceSession,
  type TransactionalRepository,
} from "../../lib/persistence";
import { mergeLedgerAccountMasterState } from "./account-master";

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
  accountName: string | null;
  accountType: string | null;
  extractorKey: FinanceTwinExtractorKey;
};

export type UpsertFinanceBankAccountInput = {
  companyId: string;
  identityKey: string;
  accountLabel: string;
  institutionName: string | null;
  externalAccountId: string | null;
  accountNumberLast4: string | null;
};

export type UpsertFinanceCustomerInput = {
  companyId: string;
  identityKey: string;
  customerLabel: string;
  externalCustomerId: string | null;
};

export type UpsertFinanceVendorInput = {
  companyId: string;
  identityKey: string;
  vendorLabel: string;
  externalVendorId: string | null;
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

export type UpsertFinanceJournalEntryInput = {
  companyId: string;
  syncRunId: string;
  externalEntryId: string;
  transactionDate: string;
  entryDescription: string | null;
};

export type UpsertFinanceJournalLineInput = {
  companyId: string;
  journalEntryId: string;
  ledgerAccountId: string;
  syncRunId: string;
  lineNumber: number;
  debitAmount: string;
  creditAmount: string;
  currencyCode: string | null;
  lineDescription: string | null;
};

export type UpsertFinanceGeneralLedgerBalanceProofInput = {
  companyId: string;
  ledgerAccountId: string;
  syncRunId: string;
  openingBalanceAmount: string | null;
  openingBalanceSourceColumn: string | null;
  openingBalanceLineNumber: number | null;
  endingBalanceAmount: string | null;
  endingBalanceSourceColumn: string | null;
  endingBalanceLineNumber: number | null;
};

export type UpsertFinanceBankAccountSummaryInput = {
  companyId: string;
  bankAccountId: string;
  syncRunId: string;
  lineNumber: number;
  balanceType: FinanceBankBalanceType;
  balanceAmount: string;
  currencyCode: string | null;
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  balanceSourceColumn: string;
  observedAt: string;
};

export type UpsertFinanceReceivablesAgingRowInput = {
  companyId: string;
  customerId: string;
  syncRunId: string;
  rowScopeKey: string;
  lineNumber: number;
  sourceLineNumbers: number[];
  currencyCode: string | null;
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  bucketValues: FinanceReceivablesAgingBucketValue[];
  observedAt: string;
};

export type UpsertFinancePayablesAgingRowInput = {
  companyId: string;
  vendorId: string;
  syncRunId: string;
  rowScopeKey: string;
  lineNumber: number;
  sourceLineNumbers: number[];
  currencyCode: string | null;
  asOfDate: string | null;
  asOfDateSourceColumn: string | null;
  bucketValues: FinancePayablesAgingBucketValue[];
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

export type FinanceTrialBalanceLineView = {
  ledgerAccount: FinanceLedgerAccountRecord;
  trialBalanceLine: FinanceTrialBalanceLineRecord;
};

export type FinanceBankAccountSummaryView = {
  bankAccount: FinanceBankAccountRecord;
  summary: FinanceBankAccountSummaryRecord;
};

export type FinanceReceivablesAgingRowView = {
  customer: FinanceCustomerRecord;
  receivablesAgingRow: FinanceReceivablesAgingRowRecord;
};

export type FinancePayablesAgingRowView = {
  vendor: FinanceVendorRecord;
  payablesAgingRow: FinancePayablesAgingRowRecord;
};

export type ListFinanceTwinLineageByTargetInput = {
  companyId: string;
  targetKind: FinanceTwinLineageTargetKind;
  targetId: string;
  syncRunId?: string;
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
  upsertBankAccount(
    input: UpsertFinanceBankAccountInput,
    session?: PersistenceSession,
  ): Promise<FinanceBankAccountRecord>;
  upsertCustomer(
    input: UpsertFinanceCustomerInput,
    session?: PersistenceSession,
  ): Promise<FinanceCustomerRecord>;
  upsertVendor(
    input: UpsertFinanceVendorInput,
    session?: PersistenceSession,
  ): Promise<FinanceVendorRecord>;
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
  getSyncRunById(
    syncRunId: string,
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
  listTrialBalanceLineViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceTrialBalanceLineView[]>;
  upsertAccountCatalogEntry(
    input: UpsertFinanceAccountCatalogEntryInput,
    session?: PersistenceSession,
  ): Promise<FinanceAccountCatalogEntryRecord>;
  listAccountCatalogEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceAccountCatalogEntryView[]>;
  upsertJournalEntry(
    input: UpsertFinanceJournalEntryInput,
    session?: PersistenceSession,
  ): Promise<FinanceJournalEntryRecord>;
  listJournalEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceJournalEntryRecord[]>;
  upsertJournalLine(
    input: UpsertFinanceJournalLineInput,
    session?: PersistenceSession,
  ): Promise<FinanceJournalLineRecord>;
  upsertGeneralLedgerBalanceProof(
    input: UpsertFinanceGeneralLedgerBalanceProofInput,
    session?: PersistenceSession,
  ): Promise<FinanceGeneralLedgerBalanceProofRecord>;
  upsertBankAccountSummary(
    input: UpsertFinanceBankAccountSummaryInput,
    session?: PersistenceSession,
  ): Promise<FinanceBankAccountSummaryRecord>;
  upsertReceivablesAgingRow(
    input: UpsertFinanceReceivablesAgingRowInput,
    session?: PersistenceSession,
  ): Promise<FinanceReceivablesAgingRowRecord>;
  upsertPayablesAgingRow(
    input: UpsertFinancePayablesAgingRowInput,
    session?: PersistenceSession,
  ): Promise<FinancePayablesAgingRowRecord>;
  listJournalLineViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceJournalLineView[]>;
  listBankAccountSummaryViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceBankAccountSummaryView[]>;
  listReceivablesAgingRowViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceReceivablesAgingRowView[]>;
  listPayablesAgingRowViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinancePayablesAgingRowView[]>;
  listGeneralLedgerEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceGeneralLedgerEntryView[]>;
  listGeneralLedgerBalanceProofsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceGeneralLedgerBalanceProofRecord[]>;
  createLineage(
    input: CreateFinanceTwinLineageInput,
    session?: PersistenceSession,
  ): Promise<FinanceTwinLineageRecord>;
  countLineageBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<number>;
  listLineageBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ): Promise<FinanceTwinLineageRecord[]>;
  listLineageByTarget(
    input: ListFinanceTwinLineageByTargetInput,
    session?: PersistenceSession,
  ): Promise<FinanceTwinLineageRecord[]>;
}

export class InMemoryFinanceTwinRepository implements FinanceTwinRepository {
  private readonly companies = new Map<string, FinanceCompanyRecord>();
  private readonly companiesByKey = new Map<string, string>();
  private readonly reportingPeriods = new Map<
    string,
    FinanceReportingPeriodRecord
  >();
  private readonly reportingPeriodsByScope = new Map<string, string>();
  private readonly ledgerAccounts = new Map<
    string,
    FinanceLedgerAccountRecord
  >();
  private readonly ledgerAccountsByScope = new Map<string, string>();
  private readonly bankAccounts = new Map<string, FinanceBankAccountRecord>();
  private readonly bankAccountsByScope = new Map<string, string>();
  private readonly customers = new Map<string, FinanceCustomerRecord>();
  private readonly customersByScope = new Map<string, string>();
  private readonly vendors = new Map<string, FinanceVendorRecord>();
  private readonly vendorsByScope = new Map<string, string>();
  private readonly syncRuns = new Map<string, FinanceTwinSyncRunRecord>();
  private readonly trialBalanceLines = new Map<
    string,
    FinanceTrialBalanceLineRecord
  >();
  private readonly trialBalanceLinesByScope = new Map<string, string>();
  private readonly accountCatalogEntries = new Map<
    string,
    FinanceAccountCatalogEntryRecord
  >();
  private readonly accountCatalogEntriesByScope = new Map<string, string>();
  private readonly journalEntries = new Map<
    string,
    FinanceJournalEntryRecord
  >();
  private readonly journalEntriesByScope = new Map<string, string>();
  private readonly journalLines = new Map<string, FinanceJournalLineRecord>();
  private readonly journalLinesByScope = new Map<string, string>();
  private readonly generalLedgerBalanceProofs = new Map<
    string,
    FinanceGeneralLedgerBalanceProofRecord
  >();
  private readonly generalLedgerBalanceProofsByScope = new Map<
    string,
    string
  >();
  private readonly bankAccountSummaries = new Map<
    string,
    FinanceBankAccountSummaryRecord
  >();
  private readonly bankAccountSummariesByScope = new Map<string, string>();
  private readonly receivablesAgingRows = new Map<
    string,
    FinanceReceivablesAgingRowRecord
  >();
  private readonly receivablesAgingRowsByScope = new Map<string, string>();
  private readonly payablesAgingRows = new Map<string, FinancePayablesAgingRowRecord>();
  private readonly payablesAgingRowsByScope = new Map<string, string>();
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
    const existingId =
      this.ledgerAccountsByScope.get(
        `${input.companyId}::${input.accountCode}`,
      ) ?? null;
    const existing = existingId
      ? (this.ledgerAccounts.get(existingId) ?? null)
      : null;
    const now = new Date().toISOString();
    const merged = mergeLedgerAccountMasterState({
      existing,
      extractorKey: input.extractorKey,
      incoming: {
        accountName: input.accountName,
        accountType: input.accountType,
      },
    });
    const ledgerAccount: FinanceLedgerAccountRecord = existing
      ? {
          ...existing,
          accountName: merged.accountName,
          accountType: merged.accountType,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          accountCode: input.accountCode,
          accountName: merged.accountName,
          accountType: merged.accountType,
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

  async upsertBankAccount(input: UpsertFinanceBankAccountInput) {
    const existingId =
      this.bankAccountsByScope.get(`${input.companyId}::${input.identityKey}`) ??
      null;
    const existing = existingId
      ? (this.bankAccounts.get(existingId) ?? null)
      : null;
    const now = new Date().toISOString();
    const bankAccount: FinanceBankAccountRecord = existing
      ? {
          ...existing,
          accountLabel: input.accountLabel,
          institutionName: input.institutionName,
          externalAccountId: input.externalAccountId,
          accountNumberLast4: input.accountNumberLast4,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          accountLabel: input.accountLabel,
          institutionName: input.institutionName,
          externalAccountId: input.externalAccountId,
          accountNumberLast4: input.accountNumberLast4,
          createdAt: now,
          updatedAt: now,
        };

    this.bankAccounts.set(bankAccount.id, bankAccount);
    this.bankAccountsByScope.set(
      `${input.companyId}::${input.identityKey}`,
      bankAccount.id,
    );
    return bankAccount;
  }

  async upsertCustomer(input: UpsertFinanceCustomerInput) {
    const existingId =
      this.customersByScope.get(`${input.companyId}::${input.identityKey}`) ??
      null;
    const existing = existingId ? (this.customers.get(existingId) ?? null) : null;
    const now = new Date().toISOString();
    const customer: FinanceCustomerRecord = existing
      ? {
          ...existing,
          customerLabel: input.customerLabel,
          externalCustomerId: input.externalCustomerId,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          customerLabel: input.customerLabel,
          externalCustomerId: input.externalCustomerId,
          createdAt: now,
          updatedAt: now,
        };

    this.customers.set(customer.id, customer);
    this.customersByScope.set(
      `${input.companyId}::${input.identityKey}`,
      customer.id,
    );
    return customer;
  }

  async upsertVendor(input: UpsertFinanceVendorInput) {
    const existingId =
      this.vendorsByScope.get(`${input.companyId}::${input.identityKey}`) ?? null;
    const existing = existingId ? (this.vendors.get(existingId) ?? null) : null;
    const now = new Date().toISOString();
    const vendor: FinanceVendorRecord = existing
      ? {
          ...existing,
          vendorLabel: input.vendorLabel,
          externalVendorId: input.externalVendorId,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          vendorLabel: input.vendorLabel,
          externalVendorId: input.externalVendorId,
          createdAt: now,
          updatedAt: now,
        };

    this.vendors.set(vendor.id, vendor);
    this.vendorsByScope.set(
      `${input.companyId}::${input.identityKey}`,
      vendor.id,
    );
    return vendor;
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
    return (
      sortSyncRuns(
        [...this.syncRuns.values()].filter(
          (run) => run.companyId === companyId,
        ),
      )[0] ?? null
    );
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

  async getSyncRunById(syncRunId: string) {
    return this.syncRuns.get(syncRunId) ?? null;
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

  async listTrialBalanceLineViewsBySyncRunId(syncRunId: string) {
    return [...this.trialBalanceLines.values()]
      .filter((line) => line.syncRunId === syncRunId)
      .sort((left, right) => left.lineNumber - right.lineNumber)
      .map((trialBalanceLine) => {
        const ledgerAccount = this.ledgerAccounts.get(
          trialBalanceLine.ledgerAccountId,
        );

        if (!ledgerAccount) {
          throw new Error(
            `Ledger account ${trialBalanceLine.ledgerAccountId} missing for trial-balance line ${trialBalanceLine.id}`,
          );
        }

        return {
          ledgerAccount,
          trialBalanceLine,
        };
      });
  }

  async upsertAccountCatalogEntry(
    input: UpsertFinanceAccountCatalogEntryInput,
  ) {
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
        const ledgerAccount = this.ledgerAccounts.get(
          catalogEntry.ledgerAccountId,
        );

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

  async upsertJournalEntry(input: UpsertFinanceJournalEntryInput) {
    const existing = this.journalEntries.get(
      this.journalEntriesByScope.get(
        `${input.syncRunId}::${input.externalEntryId}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const journalEntry: FinanceJournalEntryRecord = existing
      ? {
          ...existing,
          transactionDate: input.transactionDate,
          entryDescription: input.entryDescription,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          syncRunId: input.syncRunId,
          externalEntryId: input.externalEntryId,
          transactionDate: input.transactionDate,
          entryDescription: input.entryDescription,
          createdAt: now,
          updatedAt: now,
        };

    this.journalEntries.set(journalEntry.id, journalEntry);
    this.journalEntriesByScope.set(
      `${input.syncRunId}::${input.externalEntryId}`,
      journalEntry.id,
    );
    return journalEntry;
  }

  async listJournalEntriesBySyncRunId(syncRunId: string) {
    return [...this.journalEntries.values()]
      .filter((entry) => entry.syncRunId === syncRunId)
      .sort((left, right) => {
        return (
          left.transactionDate.localeCompare(right.transactionDate) ||
          left.externalEntryId.localeCompare(right.externalEntryId)
        );
      });
  }

  async upsertJournalLine(input: UpsertFinanceJournalLineInput) {
    const existing = this.journalLines.get(
      this.journalLinesByScope.get(`${input.syncRunId}::${input.lineNumber}`) ??
        "",
    );
    const now = new Date().toISOString();
    const journalLine: FinanceJournalLineRecord = existing
      ? {
          ...existing,
          journalEntryId: input.journalEntryId,
          ledgerAccountId: input.ledgerAccountId,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          currencyCode: input.currencyCode,
          lineDescription: input.lineDescription,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          journalEntryId: input.journalEntryId,
          ledgerAccountId: input.ledgerAccountId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          currencyCode: input.currencyCode,
          lineDescription: input.lineDescription,
          createdAt: now,
          updatedAt: now,
        };

    this.journalLines.set(journalLine.id, journalLine);
    this.journalLinesByScope.set(
      `${input.syncRunId}::${input.lineNumber}`,
      journalLine.id,
    );
    return journalLine;
  }

  async upsertGeneralLedgerBalanceProof(
    input: UpsertFinanceGeneralLedgerBalanceProofInput,
  ) {
    const existing = this.generalLedgerBalanceProofs.get(
      this.generalLedgerBalanceProofsByScope.get(
        `${input.syncRunId}::${input.ledgerAccountId}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const balanceProof: FinanceGeneralLedgerBalanceProofRecord = existing
      ? {
          ...existing,
          openingBalanceAmount: input.openingBalanceAmount,
          openingBalanceSourceColumn: input.openingBalanceSourceColumn,
          openingBalanceLineNumber: input.openingBalanceLineNumber,
          endingBalanceAmount: input.endingBalanceAmount,
          endingBalanceSourceColumn: input.endingBalanceSourceColumn,
          endingBalanceLineNumber: input.endingBalanceLineNumber,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          ledgerAccountId: input.ledgerAccountId,
          syncRunId: input.syncRunId,
          openingBalanceAmount: input.openingBalanceAmount,
          openingBalanceSourceColumn: input.openingBalanceSourceColumn,
          openingBalanceLineNumber: input.openingBalanceLineNumber,
          endingBalanceAmount: input.endingBalanceAmount,
          endingBalanceSourceColumn: input.endingBalanceSourceColumn,
          endingBalanceLineNumber: input.endingBalanceLineNumber,
          createdAt: now,
          updatedAt: now,
        };

    this.generalLedgerBalanceProofs.set(balanceProof.id, balanceProof);
    this.generalLedgerBalanceProofsByScope.set(
      `${input.syncRunId}::${input.ledgerAccountId}`,
      balanceProof.id,
    );
    return balanceProof;
  }

  async upsertBankAccountSummary(input: UpsertFinanceBankAccountSummaryInput) {
    const existing = this.bankAccountSummaries.get(
      this.bankAccountSummariesByScope.get(
        `${input.syncRunId}::${input.bankAccountId}::${input.balanceType}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const summary: FinanceBankAccountSummaryRecord = existing
      ? {
          ...existing,
          lineNumber: input.lineNumber,
          balanceAmount: input.balanceAmount,
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          balanceSourceColumn: input.balanceSourceColumn,
          observedAt: input.observedAt,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          bankAccountId: input.bankAccountId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          balanceType: input.balanceType,
          balanceAmount: input.balanceAmount,
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          balanceSourceColumn: input.balanceSourceColumn,
          observedAt: input.observedAt,
          createdAt: now,
          updatedAt: now,
        };

    this.bankAccountSummaries.set(summary.id, summary);
    this.bankAccountSummariesByScope.set(
      `${input.syncRunId}::${input.bankAccountId}::${input.balanceType}`,
      summary.id,
    );
    return summary;
  }

  async upsertReceivablesAgingRow(input: UpsertFinanceReceivablesAgingRowInput) {
    const existing = this.receivablesAgingRows.get(
      this.receivablesAgingRowsByScope.get(
        `${input.syncRunId}::${input.customerId}::${input.rowScopeKey}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const row: FinanceReceivablesAgingRowRecord = existing
      ? {
          ...existing,
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers.slice(),
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues.slice(),
          observedAt: input.observedAt,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          customerId: input.customerId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers.slice(),
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues.slice(),
          observedAt: input.observedAt,
          createdAt: now,
          updatedAt: now,
        };

    this.receivablesAgingRows.set(row.id, row);
    this.receivablesAgingRowsByScope.set(
      `${input.syncRunId}::${input.customerId}::${input.rowScopeKey}`,
      row.id,
    );
    return row;
  }

  async upsertPayablesAgingRow(input: UpsertFinancePayablesAgingRowInput) {
    const existing = this.payablesAgingRows.get(
      this.payablesAgingRowsByScope.get(
        `${input.syncRunId}::${input.vendorId}::${input.rowScopeKey}`,
      ) ?? "",
    );
    const now = new Date().toISOString();
    const row: FinancePayablesAgingRowRecord = existing
      ? {
          ...existing,
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers.slice(),
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues.slice(),
          observedAt: input.observedAt,
          updatedAt: now,
        }
      : {
          id: crypto.randomUUID(),
          companyId: input.companyId,
          vendorId: input.vendorId,
          syncRunId: input.syncRunId,
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers.slice(),
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues.slice(),
          observedAt: input.observedAt,
          createdAt: now,
          updatedAt: now,
        };

    this.payablesAgingRows.set(row.id, row);
    this.payablesAgingRowsByScope.set(
      `${input.syncRunId}::${input.vendorId}::${input.rowScopeKey}`,
      row.id,
    );
    return row;
  }

  async listJournalLineViewsBySyncRunId(syncRunId: string) {
    return [...this.journalLines.values()]
      .filter((line) => line.syncRunId === syncRunId)
      .sort((left, right) => left.lineNumber - right.lineNumber)
      .map((journalLine) => {
        const ledgerAccount = this.ledgerAccounts.get(
          journalLine.ledgerAccountId,
        );

        if (!ledgerAccount) {
          throw new Error(
            `Ledger account ${journalLine.ledgerAccountId} missing for journal line ${journalLine.id}`,
          );
        }

        return {
          journalLine,
          ledgerAccount,
        };
      });
  }

  async listBankAccountSummaryViewsBySyncRunId(syncRunId: string) {
    return [...this.bankAccountSummaries.values()]
      .filter((summary) => summary.syncRunId === syncRunId)
      .sort((left, right) => {
        return (
          left.lineNumber - right.lineNumber ||
          left.balanceType.localeCompare(right.balanceType)
        );
      })
      .map((summary) => {
        const bankAccount = this.bankAccounts.get(summary.bankAccountId);

        if (!bankAccount) {
          throw new Error(
            `Bank account ${summary.bankAccountId} missing for bank summary ${summary.id}`,
          );
        }

        return {
          bankAccount,
          summary,
        };
      });
  }

  async listReceivablesAgingRowViewsBySyncRunId(syncRunId: string) {
    return [...this.receivablesAgingRows.values()]
      .filter((row) => row.syncRunId === syncRunId)
      .sort((left, right) => {
        const leftCustomer = this.customers.get(left.customerId);
        const rightCustomer = this.customers.get(right.customerId);
        return (
          (leftCustomer?.customerLabel ?? "").localeCompare(
            rightCustomer?.customerLabel ?? "",
          ) ||
          (left.currencyCode ?? "").localeCompare(right.currencyCode ?? "") ||
          (left.asOfDate ?? "").localeCompare(right.asOfDate ?? "") ||
          left.lineNumber - right.lineNumber
        );
      })
      .map((receivablesAgingRow) => {
        const customer = this.customers.get(receivablesAgingRow.customerId);

        if (!customer) {
          throw new Error(
            `Customer ${receivablesAgingRow.customerId} missing for receivables-aging row ${receivablesAgingRow.id}`,
          );
        }

        return {
          customer,
          receivablesAgingRow,
        };
      });
  }

  async listPayablesAgingRowViewsBySyncRunId(syncRunId: string) {
    return [...this.payablesAgingRows.values()]
      .filter((row) => row.syncRunId === syncRunId)
      .sort((left, right) => {
        const leftVendor = this.vendors.get(left.vendorId);
        const rightVendor = this.vendors.get(right.vendorId);
        return (
          (leftVendor?.vendorLabel ?? "").localeCompare(
            rightVendor?.vendorLabel ?? "",
          ) ||
          (left.currencyCode ?? "").localeCompare(right.currencyCode ?? "") ||
          (left.asOfDate ?? "").localeCompare(right.asOfDate ?? "") ||
          left.lineNumber - right.lineNumber
        );
      })
      .map((payablesAgingRow) => {
        const vendor = this.vendors.get(payablesAgingRow.vendorId);

        if (!vendor) {
          throw new Error(
            `Vendor ${payablesAgingRow.vendorId} missing for payables-aging row ${payablesAgingRow.id}`,
          );
        }

        return {
          vendor,
          payablesAgingRow,
        };
      });
  }

  async listGeneralLedgerEntriesBySyncRunId(syncRunId: string) {
    const [entries, lineViews] = await Promise.all([
      this.listJournalEntriesBySyncRunId(syncRunId),
      this.listJournalLineViewsBySyncRunId(syncRunId),
    ]);
    const linesByJournalEntryId = new Map<string, FinanceJournalLineView[]>();

    for (const lineView of lineViews) {
      const lines =
        linesByJournalEntryId.get(lineView.journalLine.journalEntryId) ?? [];
      lines.push(lineView);
      linesByJournalEntryId.set(lineView.journalLine.journalEntryId, lines);
    }

    return entries.map((journalEntry) => ({
      journalEntry,
      lines:
        linesByJournalEntryId
          .get(journalEntry.id)
          ?.sort(
            (left, right) =>
              left.journalLine.lineNumber - right.journalLine.lineNumber,
          ) ?? [],
    }));
  }

  async listGeneralLedgerBalanceProofsBySyncRunId(syncRunId: string) {
    return [...this.generalLedgerBalanceProofs.values()]
      .filter((proof) => proof.syncRunId === syncRunId)
      .sort((left, right) => {
        return (
          (left.openingBalanceLineNumber ?? left.endingBalanceLineNumber ?? 0) -
            (right.openingBalanceLineNumber ??
              right.endingBalanceLineNumber ??
              0) || left.ledgerAccountId.localeCompare(right.ledgerAccountId)
        );
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

  async listLineageBySyncRunId(syncRunId: string) {
    return [...this.lineage.values()]
      .filter((lineage) => lineage.syncRunId === syncRunId)
      .sort((left, right) => {
        return (
          left.targetKind.localeCompare(right.targetKind) ||
          left.targetId.localeCompare(right.targetId)
        );
      });
  }

  async listLineageByTarget(input: ListFinanceTwinLineageByTargetInput) {
    return [...this.lineage.values()]
      .filter((lineage) => {
        return (
          lineage.companyId === input.companyId &&
          lineage.targetKind === input.targetKind &&
          lineage.targetId === input.targetId &&
          (input.syncRunId === undefined ||
            lineage.syncRunId === input.syncRunId)
        );
      })
      .sort((left, right) => {
        return (
          right.recordedAt.localeCompare(left.recordedAt) ||
          right.createdAt.localeCompare(left.createdAt) ||
          right.id.localeCompare(left.id)
        );
      });
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
