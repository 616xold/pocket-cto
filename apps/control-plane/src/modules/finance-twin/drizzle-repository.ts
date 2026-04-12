import { and, asc, count, desc, eq } from "drizzle-orm";
import {
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
  type Db,
  type DbTransaction,
} from "@pocket-cto/db";
import {
  createDbSession,
  getDbExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import { mergeLedgerAccountMasterState } from "./account-master";
import {
  mapFinanceAccountCatalogEntryRow,
  mapFinanceAccountCatalogEntryViewRow,
  mapFinanceBankAccountRow,
  mapFinanceBankAccountSummaryRow,
  mapFinanceBankAccountSummaryViewRow,
  mapFinanceCompanyRow,
  mapFinanceCustomerRow,
  mapFinanceGeneralLedgerBalanceProofRow,
  mapFinanceJournalEntryRow,
  mapFinanceJournalLineRow,
  mapFinanceJournalLineViewRow,
  mapFinanceLedgerAccountRow,
  mapFinancePayablesAgingRow,
  mapFinancePayablesAgingRowViewRow,
  mapFinanceReceivablesAgingRow,
  mapFinanceReceivablesAgingRowViewRow,
  mapFinanceReportingPeriodRow,
  mapFinanceTrialBalanceLineRow,
  mapFinanceTrialBalanceLineViewRow,
  mapFinanceTwinLineageRow,
  mapFinanceTwinSyncRunRow,
  mapFinanceVendorRow,
} from "./repository-mappers";
import type {
  CreateFinanceTwinLineageInput,
  FinishFinanceTwinSyncRunInput,
  FinanceTwinRepository,
  ListFinanceTwinLineageByTargetInput,
  StartFinanceTwinSyncRunInput,
  UpsertFinanceAccountCatalogEntryInput,
  UpsertFinanceBankAccountInput,
  UpsertFinanceBankAccountSummaryInput,
  UpsertFinanceCompanyInput,
  UpsertFinanceCustomerInput,
  UpsertFinanceGeneralLedgerBalanceProofInput,
  UpsertFinanceJournalEntryInput,
  UpsertFinanceJournalLineInput,
  UpsertFinanceLedgerAccountInput,
  UpsertFinancePayablesAgingRowInput,
  UpsertFinanceReceivablesAgingRowInput,
  UpsertFinanceReportingPeriodInput,
  UpsertFinanceTrialBalanceLineInput,
  UpsertFinanceVendorInput,
} from "./repository";

export class DrizzleFinanceTwinRepository implements FinanceTwinRepository {
  constructor(private readonly db: Db) {}

  async transaction<T>(
    operation: (session: PersistenceSession) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx: DbTransaction) =>
      operation(createDbSession(tx)),
    );
  }

  async getCompanyByKey(companyKey: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeCompanies)
      .where(eq(financeCompanies.companyKey, companyKey))
      .limit(1);

    return row ? mapFinanceCompanyRow(row) : null;
  }

  async upsertCompany(
    input: UpsertFinanceCompanyInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeCompanies)
      .values({
        companyKey: input.companyKey,
        displayName: input.displayName,
      })
      .onConflictDoUpdate({
        target: financeCompanies.companyKey,
        set: {
          displayName: input.displayName,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance company upsert did not return a row");
    }

    return mapFinanceCompanyRow(row);
  }

  async upsertReportingPeriod(
    input: UpsertFinanceReportingPeriodInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeReportingPeriods)
      .values({
        companyId: input.companyId,
        periodKey: input.periodKey,
        label: input.label,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      })
      .onConflictDoUpdate({
        target: [
          financeReportingPeriods.companyId,
          financeReportingPeriods.periodKey,
        ],
        set: {
          label: input.label,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance reporting period upsert did not return a row");
    }

    return mapFinanceReportingPeriodRow(row);
  }

  async getReportingPeriodById(
    reportingPeriodId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeReportingPeriods)
      .where(eq(financeReportingPeriods.id, reportingPeriodId))
      .limit(1);

    return row ? mapFinanceReportingPeriodRow(row) : null;
  }

  async countReportingPeriodsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [result] = await executor
      .select({ count: count() })
      .from(financeReportingPeriods)
      .where(eq(financeReportingPeriods.companyId, companyId));

    return result?.count ?? 0;
  }

  async upsertLedgerAccount(
    input: UpsertFinanceLedgerAccountInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [existingRow] = await executor
      .select()
      .from(financeLedgerAccounts)
      .where(
        and(
          eq(financeLedgerAccounts.companyId, input.companyId),
          eq(financeLedgerAccounts.accountCode, input.accountCode),
        ),
      )
      .limit(1);

    const existing = existingRow
      ? mapFinanceLedgerAccountRow(existingRow)
      : null;
    const merged = mergeLedgerAccountMasterState({
      existing,
      extractorKey: input.extractorKey,
      incoming: {
        accountName: input.accountName,
        accountType: input.accountType,
      },
    });

    if (existingRow) {
      const [row] = await executor
        .update(financeLedgerAccounts)
        .set({
          accountName: merged.accountName,
          accountType: merged.accountType,
          updatedAt: new Date(),
        })
        .where(eq(financeLedgerAccounts.id, existingRow.id))
        .returning();

      if (!row) {
        throw new Error("Finance ledger account update did not return a row");
      }

      return mapFinanceLedgerAccountRow(row);
    }

    const [row] = await executor
      .insert(financeLedgerAccounts)
      .values({
        companyId: input.companyId,
        accountCode: input.accountCode,
        accountName: merged.accountName,
        accountType: merged.accountType,
      })
      .returning();

    if (!row) {
      throw new Error("Finance ledger account insert did not return a row");
    }

    return mapFinanceLedgerAccountRow(row);
  }

  async countLedgerAccountsByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [result] = await executor
      .select({ count: count() })
      .from(financeLedgerAccounts)
      .where(eq(financeLedgerAccounts.companyId, companyId));

    return result?.count ?? 0;
  }

  async upsertBankAccount(
    input: UpsertFinanceBankAccountInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeBankAccounts)
      .values({
        companyId: input.companyId,
        identityKey: input.identityKey,
        accountLabel: input.accountLabel,
        institutionName: input.institutionName,
        externalAccountId: input.externalAccountId,
        accountNumberLast4: input.accountNumberLast4,
      })
      .onConflictDoUpdate({
        target: [financeBankAccounts.companyId, financeBankAccounts.identityKey],
        set: {
          accountLabel: input.accountLabel,
          institutionName: input.institutionName,
          externalAccountId: input.externalAccountId,
          accountNumberLast4: input.accountNumberLast4,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance bank account upsert did not return a row");
    }

    return mapFinanceBankAccountRow(row);
  }

  async upsertCustomer(
    input: UpsertFinanceCustomerInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeCustomers)
      .values({
        companyId: input.companyId,
        identityKey: input.identityKey,
        customerLabel: input.customerLabel,
        externalCustomerId: input.externalCustomerId,
      })
      .onConflictDoUpdate({
        target: [financeCustomers.companyId, financeCustomers.identityKey],
        set: {
          customerLabel: input.customerLabel,
          externalCustomerId: input.externalCustomerId,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance customer upsert did not return a row");
    }

    return mapFinanceCustomerRow(row);
  }

  async upsertVendor(
    input: UpsertFinanceVendorInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeVendors)
      .values({
        companyId: input.companyId,
        identityKey: input.identityKey,
        vendorLabel: input.vendorLabel,
        externalVendorId: input.externalVendorId,
      })
      .onConflictDoUpdate({
        target: [financeVendors.companyId, financeVendors.identityKey],
        set: {
          vendorLabel: input.vendorLabel,
          externalVendorId: input.externalVendorId,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance vendor upsert did not return a row");
    }

    return mapFinanceVendorRow(row);
  }

  async startSyncRun(
    input: StartFinanceTwinSyncRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeTwinSyncRuns)
      .values({
        companyId: input.companyId,
        sourceId: input.sourceId,
        sourceSnapshotId: input.sourceSnapshotId,
        sourceFileId: input.sourceFileId,
        extractorKey: input.extractorKey,
        status: "running",
        startedAt: new Date(input.startedAt),
        stats: {},
      })
      .returning();

    if (!row) {
      throw new Error("Finance twin sync run insert did not return a row");
    }

    return mapFinanceTwinSyncRunRow(row);
  }

  async finishSyncRun(
    input: FinishFinanceTwinSyncRunInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .update(financeTwinSyncRuns)
      .set({
        reportingPeriodId: input.reportingPeriodId,
        status: input.status,
        completedAt: new Date(input.completedAt),
        stats: input.stats,
        errorSummary: input.errorSummary,
      })
      .where(eq(financeTwinSyncRuns.id, input.syncRunId))
      .returning();

    if (!row) {
      throw new Error(`Finance twin sync run ${input.syncRunId} not found`);
    }

    return mapFinanceTwinSyncRunRow(row);
  }

  async getLatestSyncRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeTwinSyncRuns)
      .where(eq(financeTwinSyncRuns.companyId, companyId))
      .orderBy(
        desc(financeTwinSyncRuns.startedAt),
        desc(financeTwinSyncRuns.createdAt),
        desc(financeTwinSyncRuns.id),
      )
      .limit(1);

    return row ? mapFinanceTwinSyncRunRow(row) : null;
  }

  async getLatestSuccessfulSyncRunByCompanyId(
    companyId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeTwinSyncRuns)
      .where(
        and(
          eq(financeTwinSyncRuns.companyId, companyId),
          eq(financeTwinSyncRuns.status, "succeeded"),
        ),
      )
      .orderBy(
        desc(financeTwinSyncRuns.startedAt),
        desc(financeTwinSyncRuns.createdAt),
        desc(financeTwinSyncRuns.id),
      )
      .limit(1);

    return row ? mapFinanceTwinSyncRunRow(row) : null;
  }

  async getLatestSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: StartFinanceTwinSyncRunInput["extractorKey"],
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeTwinSyncRuns)
      .where(
        and(
          eq(financeTwinSyncRuns.companyId, companyId),
          eq(financeTwinSyncRuns.extractorKey, extractorKey),
        ),
      )
      .orderBy(
        desc(financeTwinSyncRuns.startedAt),
        desc(financeTwinSyncRuns.createdAt),
        desc(financeTwinSyncRuns.id),
      )
      .limit(1);

    return row ? mapFinanceTwinSyncRunRow(row) : null;
  }

  async getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
    companyId: string,
    extractorKey: StartFinanceTwinSyncRunInput["extractorKey"],
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeTwinSyncRuns)
      .where(
        and(
          eq(financeTwinSyncRuns.companyId, companyId),
          eq(financeTwinSyncRuns.extractorKey, extractorKey),
          eq(financeTwinSyncRuns.status, "succeeded"),
        ),
      )
      .orderBy(
        desc(financeTwinSyncRuns.startedAt),
        desc(financeTwinSyncRuns.createdAt),
        desc(financeTwinSyncRuns.id),
      )
      .limit(1);

    return row ? mapFinanceTwinSyncRunRow(row) : null;
  }

  async getSyncRunById(syncRunId: string, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .select()
      .from(financeTwinSyncRuns)
      .where(eq(financeTwinSyncRuns.id, syncRunId))
      .limit(1);

    return row ? mapFinanceTwinSyncRunRow(row) : null;
  }

  async upsertTrialBalanceLine(
    input: UpsertFinanceTrialBalanceLineInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeTrialBalanceLines)
      .values({
        companyId: input.companyId,
        reportingPeriodId: input.reportingPeriodId,
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: input.syncRunId,
        lineNumber: input.lineNumber,
        debitAmount: input.debitAmount,
        creditAmount: input.creditAmount,
        netAmount: input.netAmount,
        currencyCode: input.currencyCode,
        observedAt: new Date(input.observedAt),
      })
      .onConflictDoUpdate({
        target: [
          financeTrialBalanceLines.syncRunId,
          financeTrialBalanceLines.ledgerAccountId,
        ],
        set: {
          lineNumber: input.lineNumber,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          netAmount: input.netAmount,
          currencyCode: input.currencyCode,
          observedAt: new Date(input.observedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance trial balance line upsert did not return a row");
    }

    return mapFinanceTrialBalanceLineRow(row);
  }

  async listTrialBalanceLinesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(financeTrialBalanceLines)
      .where(eq(financeTrialBalanceLines.syncRunId, syncRunId))
      .orderBy(asc(financeTrialBalanceLines.lineNumber));

    return rows.map(mapFinanceTrialBalanceLineRow);
  }

  async listTrialBalanceLineViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        trialBalanceLine: financeTrialBalanceLines,
        ledgerAccount: financeLedgerAccounts,
      })
      .from(financeTrialBalanceLines)
      .innerJoin(
        financeLedgerAccounts,
        eq(financeTrialBalanceLines.ledgerAccountId, financeLedgerAccounts.id),
      )
      .where(eq(financeTrialBalanceLines.syncRunId, syncRunId))
      .orderBy(asc(financeTrialBalanceLines.lineNumber));

    return rows.map(mapFinanceTrialBalanceLineViewRow);
  }

  async upsertAccountCatalogEntry(
    input: UpsertFinanceAccountCatalogEntryInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeAccountCatalogEntries)
      .values({
        companyId: input.companyId,
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: input.syncRunId,
        lineNumber: input.lineNumber,
        detailType: input.detailType,
        description: input.description,
        parentAccountCode: input.parentAccountCode,
        isActive: input.isActive,
        observedAt: new Date(input.observedAt),
      })
      .onConflictDoUpdate({
        target: [
          financeAccountCatalogEntries.syncRunId,
          financeAccountCatalogEntries.ledgerAccountId,
        ],
        set: {
          lineNumber: input.lineNumber,
          detailType: input.detailType,
          description: input.description,
          parentAccountCode: input.parentAccountCode,
          isActive: input.isActive,
          observedAt: new Date(input.observedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance account catalog upsert did not return a row");
    }

    return mapFinanceAccountCatalogEntryRow(row);
  }

  async listAccountCatalogEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        catalogEntry: financeAccountCatalogEntries,
        ledgerAccount: financeLedgerAccounts,
      })
      .from(financeAccountCatalogEntries)
      .innerJoin(
        financeLedgerAccounts,
        eq(
          financeAccountCatalogEntries.ledgerAccountId,
          financeLedgerAccounts.id,
        ),
      )
      .where(eq(financeAccountCatalogEntries.syncRunId, syncRunId))
      .orderBy(asc(financeAccountCatalogEntries.lineNumber));

    return rows.map(mapFinanceAccountCatalogEntryViewRow);
  }

  async upsertJournalEntry(
    input: UpsertFinanceJournalEntryInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeJournalEntries)
      .values({
        companyId: input.companyId,
        syncRunId: input.syncRunId,
        externalEntryId: input.externalEntryId,
        transactionDate: input.transactionDate,
        entryDescription: input.entryDescription,
      })
      .onConflictDoUpdate({
        target: [
          financeJournalEntries.syncRunId,
          financeJournalEntries.externalEntryId,
        ],
        set: {
          transactionDate: input.transactionDate,
          entryDescription: input.entryDescription,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance journal entry upsert did not return a row");
    }

    return mapFinanceJournalEntryRow(row);
  }

  async listJournalEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(financeJournalEntries)
      .where(eq(financeJournalEntries.syncRunId, syncRunId))
      .orderBy(
        asc(financeJournalEntries.transactionDate),
        asc(financeJournalEntries.externalEntryId),
      );

    return rows.map(mapFinanceJournalEntryRow);
  }

  async upsertJournalLine(
    input: UpsertFinanceJournalLineInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeJournalLines)
      .values({
        companyId: input.companyId,
        journalEntryId: input.journalEntryId,
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: input.syncRunId,
        lineNumber: input.lineNumber,
        debitAmount: input.debitAmount,
        creditAmount: input.creditAmount,
        currencyCode: input.currencyCode,
        lineDescription: input.lineDescription,
      })
      .onConflictDoUpdate({
        target: [financeJournalLines.syncRunId, financeJournalLines.lineNumber],
        set: {
          journalEntryId: input.journalEntryId,
          ledgerAccountId: input.ledgerAccountId,
          debitAmount: input.debitAmount,
          creditAmount: input.creditAmount,
          currencyCode: input.currencyCode,
          lineDescription: input.lineDescription,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance journal line upsert did not return a row");
    }

    return mapFinanceJournalLineRow(row);
  }

  async upsertGeneralLedgerBalanceProof(
    input: UpsertFinanceGeneralLedgerBalanceProofInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeGeneralLedgerBalanceProofs)
      .values({
        companyId: input.companyId,
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: input.syncRunId,
        openingBalanceAmount: input.openingBalanceAmount,
        openingBalanceSourceColumn: input.openingBalanceSourceColumn,
        openingBalanceLineNumber: input.openingBalanceLineNumber,
        endingBalanceAmount: input.endingBalanceAmount,
        endingBalanceSourceColumn: input.endingBalanceSourceColumn,
        endingBalanceLineNumber: input.endingBalanceLineNumber,
      })
      .onConflictDoUpdate({
        target: [
          financeGeneralLedgerBalanceProofs.syncRunId,
          financeGeneralLedgerBalanceProofs.ledgerAccountId,
        ],
        set: {
          openingBalanceAmount: input.openingBalanceAmount,
          openingBalanceSourceColumn: input.openingBalanceSourceColumn,
          openingBalanceLineNumber: input.openingBalanceLineNumber,
          endingBalanceAmount: input.endingBalanceAmount,
          endingBalanceSourceColumn: input.endingBalanceSourceColumn,
          endingBalanceLineNumber: input.endingBalanceLineNumber,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error(
        "Finance general-ledger balance proof upsert did not return a row",
      );
    }

    return mapFinanceGeneralLedgerBalanceProofRow(row);
  }

  async upsertBankAccountSummary(
    input: UpsertFinanceBankAccountSummaryInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeBankAccountSummaries)
      .values({
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
        observedAt: new Date(input.observedAt),
      })
      .onConflictDoUpdate({
        target: [
          financeBankAccountSummaries.syncRunId,
          financeBankAccountSummaries.bankAccountId,
          financeBankAccountSummaries.balanceType,
        ],
        set: {
          lineNumber: input.lineNumber,
          balanceAmount: input.balanceAmount,
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          balanceSourceColumn: input.balanceSourceColumn,
          observedAt: new Date(input.observedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance bank account summary upsert did not return a row");
    }

    return mapFinanceBankAccountSummaryRow(row);
  }

  async upsertReceivablesAgingRow(
    input: UpsertFinanceReceivablesAgingRowInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financeReceivablesAgingRows)
      .values({
        companyId: input.companyId,
        customerId: input.customerId,
        syncRunId: input.syncRunId,
        rowScopeKey: input.rowScopeKey,
        lineNumber: input.lineNumber,
        sourceLineNumbers: input.sourceLineNumbers,
        currencyCode: input.currencyCode,
        asOfDate: input.asOfDate,
        asOfDateSourceColumn: input.asOfDateSourceColumn,
        bucketValues: input.bucketValues,
        observedAt: new Date(input.observedAt),
      })
      .onConflictDoUpdate({
        target: [
          financeReceivablesAgingRows.syncRunId,
          financeReceivablesAgingRows.customerId,
          financeReceivablesAgingRows.rowScopeKey,
        ],
        set: {
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers,
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues,
          observedAt: new Date(input.observedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error(
        "Finance receivables-aging row upsert did not return a row",
      );
    }

    return mapFinanceReceivablesAgingRow(row);
  }

  async upsertPayablesAgingRow(
    input: UpsertFinancePayablesAgingRowInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [row] = await executor
      .insert(financePayablesAgingRows)
      .values({
        companyId: input.companyId,
        vendorId: input.vendorId,
        syncRunId: input.syncRunId,
        rowScopeKey: input.rowScopeKey,
        lineNumber: input.lineNumber,
        sourceLineNumbers: input.sourceLineNumbers,
        currencyCode: input.currencyCode,
        asOfDate: input.asOfDate,
        asOfDateSourceColumn: input.asOfDateSourceColumn,
        bucketValues: input.bucketValues,
        observedAt: new Date(input.observedAt),
      })
      .onConflictDoUpdate({
        target: [
          financePayablesAgingRows.syncRunId,
          financePayablesAgingRows.vendorId,
          financePayablesAgingRows.rowScopeKey,
        ],
        set: {
          lineNumber: input.lineNumber,
          sourceLineNumbers: input.sourceLineNumbers,
          currencyCode: input.currencyCode,
          asOfDate: input.asOfDate,
          asOfDateSourceColumn: input.asOfDateSourceColumn,
          bucketValues: input.bucketValues,
          observedAt: new Date(input.observedAt),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Finance payables-aging row upsert did not return a row");
    }

    return mapFinancePayablesAgingRow(row);
  }

  async listJournalLineViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        journalLine: financeJournalLines,
        ledgerAccount: financeLedgerAccounts,
      })
      .from(financeJournalLines)
      .innerJoin(
        financeLedgerAccounts,
        eq(financeJournalLines.ledgerAccountId, financeLedgerAccounts.id),
      )
      .where(eq(financeJournalLines.syncRunId, syncRunId))
      .orderBy(asc(financeJournalLines.lineNumber));

    return rows.map(mapFinanceJournalLineViewRow);
  }

  async listBankAccountSummaryViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        bankAccount: financeBankAccounts,
        summary: financeBankAccountSummaries,
      })
      .from(financeBankAccountSummaries)
      .innerJoin(
        financeBankAccounts,
        eq(
          financeBankAccountSummaries.bankAccountId,
          financeBankAccounts.id,
        ),
      )
      .where(eq(financeBankAccountSummaries.syncRunId, syncRunId))
      .orderBy(
        asc(financeBankAccountSummaries.lineNumber),
        asc(financeBankAccountSummaries.balanceType),
      );

    return rows.map(mapFinanceBankAccountSummaryViewRow);
  }

  async listReceivablesAgingRowViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        customer: financeCustomers,
        row: financeReceivablesAgingRows,
      })
      .from(financeReceivablesAgingRows)
      .innerJoin(
        financeCustomers,
        eq(financeReceivablesAgingRows.customerId, financeCustomers.id),
      )
      .where(eq(financeReceivablesAgingRows.syncRunId, syncRunId))
      .orderBy(
        asc(financeCustomers.customerLabel),
        asc(financeReceivablesAgingRows.currencyCode),
        asc(financeReceivablesAgingRows.asOfDate),
        asc(financeReceivablesAgingRows.lineNumber),
      );

    return rows.map(mapFinanceReceivablesAgingRowViewRow);
  }

  async listPayablesAgingRowViewsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select({
        vendor: financeVendors,
        row: financePayablesAgingRows,
      })
      .from(financePayablesAgingRows)
      .innerJoin(
        financeVendors,
        eq(financePayablesAgingRows.vendorId, financeVendors.id),
      )
      .where(eq(financePayablesAgingRows.syncRunId, syncRunId))
      .orderBy(
        asc(financeVendors.vendorLabel),
        asc(financePayablesAgingRows.currencyCode),
        asc(financePayablesAgingRows.asOfDate),
        asc(financePayablesAgingRows.lineNumber),
      );

    return rows.map(mapFinancePayablesAgingRowViewRow);
  }

  async listGeneralLedgerEntriesBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const [entries, lineViews] = await Promise.all([
      this.listJournalEntriesBySyncRunId(syncRunId, session),
      this.listJournalLineViewsBySyncRunId(syncRunId, session),
    ]);
    const linesByJournalEntryId = new Map<
      string,
      ReturnType<typeof mapFinanceJournalLineViewRow>[]
    >();

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

  async listGeneralLedgerBalanceProofsBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(financeGeneralLedgerBalanceProofs)
      .where(eq(financeGeneralLedgerBalanceProofs.syncRunId, syncRunId))
      .orderBy(
        asc(financeGeneralLedgerBalanceProofs.ledgerAccountId),
        asc(financeGeneralLedgerBalanceProofs.openingBalanceLineNumber),
        asc(financeGeneralLedgerBalanceProofs.endingBalanceLineNumber),
      );

    return rows.map(mapFinanceGeneralLedgerBalanceProofRow);
  }

  async createLineage(
    input: CreateFinanceTwinLineageInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const inserted = await executor
      .insert(financeTwinLineage)
      .values({
        companyId: input.companyId,
        syncRunId: input.syncRunId,
        targetKind: input.targetKind,
        targetId: input.targetId,
        sourceId: input.sourceId,
        sourceSnapshotId: input.sourceSnapshotId,
        sourceFileId: input.sourceFileId,
        recordedAt: new Date(input.recordedAt),
      })
      .onConflictDoNothing()
      .returning();

    const row =
      inserted[0] ??
      (
        await executor
          .select()
          .from(financeTwinLineage)
          .where(
            and(
              eq(financeTwinLineage.syncRunId, input.syncRunId),
              eq(financeTwinLineage.targetKind, input.targetKind),
              eq(financeTwinLineage.targetId, input.targetId),
            ),
          )
          .limit(1)
      )[0];

    if (!row) {
      throw new Error("Finance twin lineage insert did not return a row");
    }

    return mapFinanceTwinLineageRow(row);
  }

  async countLineageBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [result] = await executor
      .select({ count: count() })
      .from(financeTwinLineage)
      .where(eq(financeTwinLineage.syncRunId, syncRunId));

    return result?.count ?? 0;
  }

  async listLineageBySyncRunId(
    syncRunId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(financeTwinLineage)
      .where(eq(financeTwinLineage.syncRunId, syncRunId))
      .orderBy(
        asc(financeTwinLineage.targetKind),
        asc(financeTwinLineage.targetId),
      );

    return rows.map(mapFinanceTwinLineageRow);
  }

  async listLineageByTarget(
    input: ListFinanceTwinLineageByTargetInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const clauses = [
      eq(financeTwinLineage.companyId, input.companyId),
      eq(financeTwinLineage.targetKind, input.targetKind),
      eq(financeTwinLineage.targetId, input.targetId),
    ];

    if (input.syncRunId) {
      clauses.push(eq(financeTwinLineage.syncRunId, input.syncRunId));
    }

    const rows = await executor
      .select()
      .from(financeTwinLineage)
      .where(and(...clauses))
      .orderBy(
        desc(financeTwinLineage.recordedAt),
        desc(financeTwinLineage.createdAt),
        desc(financeTwinLineage.id),
      );

    return rows.map(mapFinanceTwinLineageRow);
  }

  private getExecutor(session?: PersistenceSession) {
    return getDbExecutor(session) ?? this.db;
  }
}
