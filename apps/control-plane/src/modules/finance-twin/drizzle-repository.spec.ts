import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleSourceRepository } from "../sources/drizzle-repository";
import { DrizzleFinanceTwinRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleFinanceTwinRepository", () => {
  const sourceRepository = new DrizzleSourceRepository(db);
  const repository = new DrizzleFinanceTwinRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("persists finance companies, sync runs, trial-balance lines, and lineage", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "Trial balance export",
      description: "March trial balance",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "trial-balance.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/trial-balance.csv",
      capturedAt: "2026-04-09T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "trial-balance.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/trial-balance.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-09T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const reportingPeriod = await repository.upsertReportingPeriod({
      companyId: company.id,
      periodKey: "2026-03-31",
      label: "Trial balance as of 2026-03-31",
      periodStart: null,
      periodEnd: "2026-03-31",
    });
    const ledgerAccount = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash",
      accountType: "asset",
      extractorKey: "trial_balance_csv",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "trial_balance_csv",
      startedAt: "2026-04-09T00:10:00.000Z",
    });
    const line = await repository.upsertTrialBalanceLine({
      companyId: company.id,
      reportingPeriodId: reportingPeriod.id,
      ledgerAccountId: ledgerAccount.id,
      syncRunId: syncRun.id,
      lineNumber: 2,
      debitAmount: "125000.00",
      creditAmount: "0.00",
      netAmount: "125000.00",
      currencyCode: "USD",
      observedAt: "2026-04-09T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "trial_balance_line",
      targetId: line.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-09T00:10:01.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: reportingPeriod.id,
      status: "succeeded",
      completedAt: "2026-04-09T00:10:03.000Z",
      stats: {
        trialBalanceLineCount: 1,
      },
      errorSummary: null,
    });

    expect(await repository.getCompanyByKey("acme")).toMatchObject({
      id: company.id,
      displayName: "Acme Holdings",
    });
    expect(
      await repository.getReportingPeriodById(reportingPeriod.id),
    ).toMatchObject({
      id: reportingPeriod.id,
      periodEnd: "2026-03-31",
    });
    expect(await repository.countReportingPeriodsByCompanyId(company.id)).toBe(
      1,
    );
    expect(await repository.countLedgerAccountsByCompanyId(company.id)).toBe(1);
    expect(
      await repository.listTrialBalanceLinesBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        id: line.id,
        debitAmount: "125000.00",
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(1);
    expect(
      await repository.getLatestSyncRunByCompanyId(company.id),
    ).toMatchObject({
      id: finalized.id,
      status: "succeeded",
    });
    expect(
      await repository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "trial_balance_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      reportingPeriodId: reportingPeriod.id,
    });
  });

  it("persists chart-of-accounts entries and returns them joined with ledger accounts", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "Chart of accounts export",
      description: "April account catalog",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "chart-of-accounts.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/chart-of-accounts.csv",
      capturedAt: "2026-04-10T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "chart-of-accounts.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/chart-of-accounts.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-10T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const ledgerAccount = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash",
      accountType: "asset",
      extractorKey: "chart_of_accounts_csv",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "chart_of_accounts_csv",
      startedAt: "2026-04-10T00:10:00.000Z",
    });
    const entry = await repository.upsertAccountCatalogEntry({
      companyId: company.id,
      ledgerAccountId: ledgerAccount.id,
      syncRunId: syncRun.id,
      lineNumber: 2,
      detailType: "current_asset",
      description: "Operating cash",
      parentAccountCode: null,
      isActive: true,
      observedAt: "2026-04-10T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "account_catalog_entry",
      targetId: entry.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-10T00:10:01.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: null,
      status: "succeeded",
      completedAt: "2026-04-10T00:10:03.000Z",
      stats: {
        accountCatalogEntryCount: 1,
      },
      errorSummary: null,
    });

    expect(
      await repository.listAccountCatalogEntriesBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        ledgerAccount: {
          accountCode: "1000",
          accountName: "Cash",
        },
        catalogEntry: {
          detailType: "current_asset",
          description: "Operating cash",
          isActive: true,
        },
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(1);
  expect(
      await repository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "chart_of_accounts_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      status: "succeeded",
    });
  });

  it("persists bank-account summaries and returns joined bank-account views", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "Bank account summary export",
      description: "Daily cash position",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "bank-account-summary.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/bank-account-summary.csv",
      capturedAt: "2026-04-12T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "bank-account-summary.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/bank-account-summary.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-12T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const bankAccount = await repository.upsertBankAccount({
      companyId: company.id,
      identityKey: "label_last4:operating_checking|1234",
      accountLabel: "Operating Checking",
      institutionName: "First National",
      externalAccountId: null,
      accountNumberLast4: "1234",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "bank_account_summary_csv",
      startedAt: "2026-04-12T00:10:00.000Z",
    });
    const summary = await repository.upsertBankAccountSummary({
      companyId: company.id,
      bankAccountId: bankAccount.id,
      syncRunId: syncRun.id,
      lineNumber: 2,
      balanceType: "statement_or_ledger",
      balanceAmount: "1200.00",
      currencyCode: "USD",
      asOfDate: "2026-04-10",
      asOfDateSourceColumn: "as_of",
      balanceSourceColumn: "statement_balance",
      observedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "bank_account",
      targetId: bankAccount.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "bank_account_summary",
      targetId: summary.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: null,
      status: "succeeded",
      completedAt: "2026-04-12T00:10:03.000Z",
      stats: {
        bankAccountCount: 1,
        bankAccountSummaryCount: 1,
      },
      errorSummary: null,
    });

    expect(
      await repository.listBankAccountSummaryViewsBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        bankAccount: {
          id: bankAccount.id,
          accountLabel: "Operating Checking",
          institutionName: "First National",
          accountNumberLast4: "1234",
        },
        summary: {
          id: summary.id,
          balanceType: "statement_or_ledger",
          balanceAmount: "1200.00",
          currencyCode: "USD",
          asOfDate: "2026-04-10",
          balanceSourceColumn: "statement_balance",
        },
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(2);
    expect(
      await repository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "bank_account_summary_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      extractorKey: "bank_account_summary_csv",
      status: "succeeded",
    });
  });

  it("persists receivables-aging customers and rows with joined latest-snapshot reads", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "Receivables aging export",
      description: "Collections posture",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "receivables-aging.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/receivables-aging.csv",
      capturedAt: "2026-04-12T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "receivables-aging.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/receivables-aging.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-12T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const customer = await repository.upsertCustomer({
      companyId: company.id,
      identityKey: "customer_id:c-100",
      customerLabel: "Alpha Co",
      externalCustomerId: "C-100",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "receivables_aging_csv",
      startedAt: "2026-04-12T00:10:00.000Z",
    });
    const row = await repository.upsertReceivablesAgingRow({
      companyId: company.id,
      customerId: customer.id,
      syncRunId: syncRun.id,
      rowScopeKey: "USD::2026-04-30",
      lineNumber: 2,
      sourceLineNumbers: [2, 3],
      currencyCode: "USD",
      asOfDate: "2026-04-30",
      asOfDateSourceColumn: "as_of",
      bucketValues: [
        {
          bucketKey: "current",
          bucketClass: "current",
          amount: "100.00",
          sourceColumn: "current",
        },
        {
          bucketKey: "past_due",
          bucketClass: "past_due_total",
          amount: "20.00",
          sourceColumn: "past_due",
        },
        {
          bucketKey: "total",
          bucketClass: "total",
          amount: "120.00",
          sourceColumn: "total",
        },
      ],
      observedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "customer",
      targetId: customer.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "receivables_aging_row",
      targetId: row.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: null,
      status: "succeeded",
      completedAt: "2026-04-12T00:10:03.000Z",
      stats: {
        receivablesAgingCustomerCount: 1,
        receivablesAgingRowCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
      },
      errorSummary: null,
    });

    expect(
      await repository.listReceivablesAgingRowViewsBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        customer: {
          id: customer.id,
          customerLabel: "Alpha Co",
          externalCustomerId: "C-100",
        },
        receivablesAgingRow: {
          id: row.id,
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          sourceLineNumbers: [2, 3],
        },
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(2);
    expect(
      await repository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "receivables_aging_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      extractorKey: "receivables_aging_csv",
      status: "succeeded",
    });
  });

  it("persists payables-aging vendors and rows with joined latest-snapshot reads", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "Payables aging export",
      description: "Payables posture",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "payables-aging.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "edededededededededededededededededededededededededededededededed",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/payables-aging.csv",
      capturedAt: "2026-04-12T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "payables-aging.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "edededededededededededededededededededededededededededededededed",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/payables-aging.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-12T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const vendor = await repository.upsertVendor({
      companyId: company.id,
      identityKey: "vendor_id:v-100",
      vendorLabel: "Paper Supply Co",
      externalVendorId: "V-100",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "payables_aging_csv",
      startedAt: "2026-04-12T00:10:00.000Z",
    });
    const row = await repository.upsertPayablesAgingRow({
      companyId: company.id,
      vendorId: vendor.id,
      syncRunId: syncRun.id,
      rowScopeKey: "USD::2026-04-30",
      lineNumber: 2,
      sourceLineNumbers: [2, 3],
      currencyCode: "USD",
      asOfDate: "2026-04-30",
      asOfDateSourceColumn: "as_of",
      bucketValues: [
        {
          bucketKey: "current",
          bucketClass: "current",
          amount: "100.00",
          sourceColumn: "current",
        },
        {
          bucketKey: "past_due",
          bucketClass: "past_due_total",
          amount: "20.00",
          sourceColumn: "past_due",
        },
        {
          bucketKey: "total",
          bucketClass: "total",
          amount: "120.00",
          sourceColumn: "total",
        },
      ],
      observedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "vendor",
      targetId: vendor.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "payables_aging_row",
      targetId: row.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-12T00:10:01.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: null,
      status: "succeeded",
      completedAt: "2026-04-12T00:10:03.000Z",
      stats: {
        payablesAgingVendorCount: 1,
        payablesAgingRowCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
      },
      errorSummary: null,
    });

    expect(
      await repository.listPayablesAgingRowViewsBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        vendor: {
          id: vendor.id,
          vendorLabel: "Paper Supply Co",
          externalVendorId: "V-100",
        },
        payablesAgingRow: {
          id: row.id,
          currencyCode: "USD",
          asOfDate: "2026-04-30",
          sourceLineNumbers: [2, 3],
        },
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(2);
    expect(
      await repository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "payables_aging_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      extractorKey: "payables_aging_csv",
      status: "succeeded",
    });
  });

  it("persists general-ledger journal entries and lines with joined latest-snapshot reads", async () => {
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "General ledger export",
      description: "April journal detail",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "general-ledger.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/general-ledger.csv",
      capturedAt: "2026-04-11T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "general-ledger.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/general-ledger.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-11T00:00:00.000Z",
    });
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const cashAccount = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash",
      accountType: "asset",
      extractorKey: "general_ledger_csv",
    });
    const equityAccount = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "3000",
      accountName: "Common Stock",
      accountType: "equity",
      extractorKey: "general_ledger_csv",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "general_ledger_csv",
      startedAt: "2026-04-11T00:10:00.000Z",
    });
    const journalEntry = await repository.upsertJournalEntry({
      companyId: company.id,
      syncRunId: syncRun.id,
      externalEntryId: "J-100",
      transactionDate: "2026-04-11",
      entryDescription: "Seed funding",
    });
    const firstLine = await repository.upsertJournalLine({
      companyId: company.id,
      journalEntryId: journalEntry.id,
      ledgerAccountId: cashAccount.id,
      syncRunId: syncRun.id,
      lineNumber: 2,
      debitAmount: "100.00",
      creditAmount: "0.00",
      currencyCode: "USD",
      lineDescription: "Cash received",
    });
    const secondLine = await repository.upsertJournalLine({
      companyId: company.id,
      journalEntryId: journalEntry.id,
      ledgerAccountId: equityAccount.id,
      syncRunId: syncRun.id,
      lineNumber: 3,
      debitAmount: "0.00",
      creditAmount: "100.00",
      currencyCode: "USD",
      lineDescription: "Equity issued",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "journal_entry",
      targetId: journalEntry.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-11T00:10:01.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "journal_line",
      targetId: firstLine.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-11T00:10:02.000Z",
    });
    await repository.createLineage({
      companyId: company.id,
      syncRunId: syncRun.id,
      targetKind: "journal_line",
      targetId: secondLine.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      recordedAt: "2026-04-11T00:10:03.000Z",
    });
    const finalized = await repository.finishSyncRun({
      syncRunId: syncRun.id,
      reportingPeriodId: null,
      status: "succeeded",
      completedAt: "2026-04-11T00:10:04.000Z",
      stats: {
        journalEntryCount: 1,
        journalLineCount: 2,
      },
      errorSummary: null,
    });

    expect(
      await repository.listJournalEntriesBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        id: journalEntry.id,
        externalEntryId: "J-100",
        entryDescription: "Seed funding",
      },
    ]);
    expect(
      await repository.listJournalLineViewsBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        ledgerAccount: {
          accountCode: "1000",
          accountName: "Cash",
        },
        journalLine: {
          id: firstLine.id,
          debitAmount: "100.00",
        },
      },
      {
        ledgerAccount: {
          accountCode: "3000",
          accountName: "Common Stock",
        },
        journalLine: {
          id: secondLine.id,
          creditAmount: "100.00",
        },
      },
    ]);
    expect(
      await repository.listGeneralLedgerEntriesBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        journalEntry: {
          id: journalEntry.id,
          externalEntryId: "J-100",
        },
        lines: [
          {
            journalLine: {
              id: firstLine.id,
            },
          },
          {
            journalLine: {
              id: secondLine.id,
            },
          },
        ],
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(3);
    expect(
      await repository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "general_ledger_csv",
      ),
    ).toMatchObject({
      id: finalized.id,
      status: "succeeded",
    });
  });

  it("persists source-backed general-ledger balance proofs by sync run", async () => {
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const ledgerAccount = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash",
      accountType: "asset",
      extractorKey: "general_ledger_csv",
    });
    const source = await sourceRepository.createSource({
      kind: "dataset",
      originKind: "manual",
      name: "General ledger export",
      description: "March journal detail",
      createdBy: "finance-operator",
    });
    const snapshot = await sourceRepository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "general-ledger.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/general-ledger.csv",
      capturedAt: "2026-04-12T00:00:00.000Z",
      ingestStatus: "ready",
    });
    const sourceFile = await sourceRepository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "general-ledger.csv",
      mediaType: "text/csv",
      sizeBytes: 512,
      checksumSha256:
        "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      storageKind: "object_store",
      storageRef: "s3://bucket/sources/general-ledger.csv",
      createdBy: "finance-operator",
      capturedAt: "2026-04-12T00:00:00.000Z",
    });
    const syncRun = await repository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: "general_ledger_csv",
      startedAt: "2026-04-12T00:10:00.000Z",
    });
    const proof = await repository.upsertGeneralLedgerBalanceProof({
      companyId: company.id,
      ledgerAccountId: ledgerAccount.id,
      syncRunId: syncRun.id,
      openingBalanceAmount: "90.00",
      openingBalanceSourceColumn: "opening_balance",
      openingBalanceLineNumber: 2,
      endingBalanceAmount: "100.00",
      endingBalanceSourceColumn: "closing_balance",
      endingBalanceLineNumber: 2,
    });

    expect(
      await repository.listGeneralLedgerBalanceProofsBySyncRunId(syncRun.id),
    ).toMatchObject([
      {
        id: proof.id,
        ledgerAccountId: ledgerAccount.id,
        openingBalanceAmount: "90.00",
        openingBalanceSourceColumn: "opening_balance",
        openingBalanceLineNumber: 2,
        endingBalanceAmount: "100.00",
        endingBalanceSourceColumn: "closing_balance",
        endingBalanceLineNumber: 2,
      },
    ]);
  });

  it("lets chart-of-accounts metadata override lower-authority slices without later degradation", async () => {
    const company = await repository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });

    const seeded = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: null,
      accountType: null,
      extractorKey: "general_ledger_csv",
    });
    expect(seeded).toMatchObject({
      accountCode: "1000",
      accountName: null,
      accountType: null,
    });

    const authoritative = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash and Cash Equivalents",
      accountType: "asset",
      extractorKey: "chart_of_accounts_csv",
    });
    expect(authoritative).toMatchObject({
      accountName: "Cash and Cash Equivalents",
      accountType: "asset",
    });

    const nonAuthoritative = await repository.upsertLedgerAccount({
      companyId: company.id,
      accountCode: "1000",
      accountName: "Cash",
      accountType: "expense",
      extractorKey: "trial_balance_csv",
    });
    expect(nonAuthoritative).toMatchObject({
      accountName: "Cash and Cash Equivalents",
      accountType: "asset",
    });
  });
});
