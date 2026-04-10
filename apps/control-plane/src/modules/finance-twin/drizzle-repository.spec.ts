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
    expect(await repository.getReportingPeriodById(reportingPeriod.id)).toMatchObject({
      id: reportingPeriod.id,
      periodEnd: "2026-03-31",
    });
    expect(await repository.countReportingPeriodsByCompanyId(company.id)).toBe(1);
    expect(await repository.countLedgerAccountsByCompanyId(company.id)).toBe(1);
    expect(await repository.listTrialBalanceLinesBySyncRunId(syncRun.id)).toMatchObject([
      {
        id: line.id,
        debitAmount: "125000.00",
      },
    ]);
    expect(await repository.countLineageBySyncRunId(syncRun.id)).toBe(1);
    expect(await repository.getLatestSyncRunByCompanyId(company.id)).toMatchObject({
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
});
