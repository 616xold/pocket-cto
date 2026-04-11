import {
  FinanceAccountCatalogViewSchema,
  FinanceGeneralLedgerActivityLineageViewSchema,
  FinanceGeneralLedgerViewSchema,
  FinanceLineageDrillViewSchema,
  FinanceReconciliationReadinessViewSchema,
  FinanceSnapshotViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
  FinanceTwinSyncResultSchema,
  type FinanceAccountCatalogEntryView,
  type FinanceAccountCatalogView,
  type FinanceCompanyRecord,
  type FinanceGeneralLedgerActivityLineageView,
  type FinanceLineageDrillView,
  type FinanceGeneralLedgerEntryView,
  type FinanceGeneralLedgerView,
  type FinanceLatestAttemptedSlices,
  type FinanceReconciliationReadinessView,
  type FinanceLatestSuccessfulSlices,
  type FinanceSnapshotView,
  type FinanceTwinLineageTargetKind,
  type FinanceTwinCompanySummary,
  type FinanceTwinSyncInput,
  type FinanceTwinSyncResult,
  type FinanceTwinSyncRunRecord,
  type SourceFileRecord,
  type SourceRecord,
  type SourceSnapshotRecord,
} from "@pocket-cto/domain";
import {
  SourceFileNotFoundError,
  SourceNotFoundError,
} from "../sources/errors";
import type { SourceRepository } from "../sources/repository";
import type { SourceFileStorage } from "../sources/storage";
import type { ChartOfAccountsExtractionResult } from "./chart-of-accounts-csv";
import {
  FinanceCompanyNotFoundError,
  FinanceTwinUnsupportedSourceError,
} from "./errors";
import { extractFinanceTwinSource } from "./extractor-dispatch";
import { buildFinanceFreshnessView } from "./freshness";
import { buildFinanceGeneralLedgerActivityLineageView } from "./general-ledger-activity-lineage";
import {
  buildFinanceGeneralLedgerPeriodContext,
  buildPersistedGeneralLedgerPeriodContextStats,
} from "./general-ledger-period-context";
import { buildFinanceLineageDrillView, buildLineageTargetCounts } from "./lineage";
import type { GeneralLedgerExtractionResult } from "./general-ledger-csv";
import { buildFinanceReconciliationReadinessView } from "./reconciliation";
import type {
  FinanceTrialBalanceLineView,
  FinanceTwinRepository,
} from "./repository";
import { buildFinanceSnapshotView } from "./snapshot";
import {
  buildChartOfAccountsSummary,
  buildGeneralLedgerSummary,
  buildTrialBalanceSummary,
  FINANCE_TWIN_LIMITATIONS,
} from "./summary";
import type { TrialBalanceExtractionResult } from "./trial-balance-csv";

const MAX_ERROR_SUMMARY_LENGTH = 500;

type CompanyReadState = {
  companyTotals: {
    ledgerAccountCount: number;
    reportingPeriodCount: number;
  };
  freshness: ReturnType<typeof buildFinanceFreshnessView>;
  latestAccountCatalogEntries: FinanceAccountCatalogEntryView[];
  latestAttemptedSlices: FinanceLatestAttemptedSlices;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestChartOfAccountsAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestGeneralLedgerAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestGeneralLedgerEntries: FinanceGeneralLedgerEntryView[];
  latestTrialBalanceLineViews: FinanceTrialBalanceLineView[];
  latestSuccessfulSlices: FinanceLatestSuccessfulSlices;
  latestSuccessfulSyncRun: FinanceTwinSyncRunRecord | null;
};

export class FinanceTwinService {
  private readonly now: () => Date;

  constructor(
    private readonly input: {
      financeTwinRepository: FinanceTwinRepository;
      sourceFileStorage: SourceFileStorage;
      sourceRepository: Pick<
        SourceRepository,
        "getSnapshotById" | "getSourceById" | "getSourceFileById"
      >;
      now?: () => Date;
    },
  ) {
    this.now = input.now ?? (() => new Date());
  }

  async syncCompanySourceFile(
    companyKey: string,
    sourceFileId: string,
    input: FinanceTwinSyncInput,
  ): Promise<FinanceTwinSyncResult> {
    const parsedInput = FinanceTwinSyncInputSchema.parse(input);
    const sourceFile = await this.input.sourceRepository.getSourceFileById(
      sourceFileId,
    );

    if (!sourceFile) {
      throw new SourceFileNotFoundError(sourceFileId);
    }

    const [source, snapshot] = await Promise.all([
      this.input.sourceRepository.getSourceById(sourceFile.sourceId),
      this.input.sourceRepository.getSnapshotById(sourceFile.sourceSnapshotId),
    ]);

    if (!source) {
      throw new SourceNotFoundError(sourceFile.sourceId);
    }

    if (!snapshot) {
      throw new Error(
        `Source file ${sourceFile.id} is missing its linked source snapshot`,
      );
    }

    const body = await this.input.sourceFileStorage.read(sourceFile.storageRef);
    const extracted = extractFinanceTwinSource({
      body,
      sourceFile,
    });

    if (!extracted) {
      throw new FinanceTwinUnsupportedSourceError(sourceFile.id);
    }

    const existingCompany =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);
    const company = await this.input.financeTwinRepository.upsertCompany({
      companyKey,
      displayName: resolveCompanyDisplayName({
        companyKey,
        companyName: parsedInput.companyName,
        existingCompany,
      }),
    });
    const startedAt = this.now().toISOString();
    const syncRun = await this.input.financeTwinRepository.startSyncRun({
      companyId: company.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      extractorKey: extracted.extractorKey,
      startedAt,
    });

    try {
      const finalizedRun =
        extracted.extractorKey === "trial_balance_csv"
          ? await this.persistTrialBalanceSync({
              company,
              extracted: extracted.trialBalance,
              snapshotId: snapshot.id,
              sourceFileId: sourceFile.id,
              sourceId: source.id,
              syncRun,
            })
          : extracted.extractorKey === "chart_of_accounts_csv"
            ? await this.persistChartOfAccountsSync({
                company,
                extracted: extracted.chartOfAccounts,
                snapshotId: snapshot.id,
                sourceFileId: sourceFile.id,
                sourceId: source.id,
                syncRun,
              })
            : await this.persistGeneralLedgerSync({
                company,
                extracted: extracted.generalLedger,
                snapshotId: snapshot.id,
                sourceFileId: sourceFile.id,
                sourceId: source.id,
                syncRun,
              });
      const readState = await this.readCompanyState(company);

      return FinanceTwinSyncResultSchema.parse({
        company,
        syncRun: finalizedRun,
        freshness: readState.freshness,
        companyTotals: readState.companyTotals,
        latestAttemptedSlices: readState.latestAttemptedSlices,
        latestSuccessfulSlices: readState.latestSuccessfulSlices,
        limitations: FINANCE_TWIN_LIMITATIONS,
      });
    } catch (error) {
      const failedAt = this.now().toISOString();

      await this.input.financeTwinRepository.finishSyncRun({
        syncRunId: syncRun.id,
        reportingPeriodId: null,
        status: "failed",
        completedAt: failedAt,
        stats: {},
        errorSummary: summarizeError(error),
      });

      throw error;
    }
  }

  async getCompanySummary(companyKey: string): Promise<FinanceTwinCompanySummary> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return FinanceTwinCompanySummarySchema.parse({
      company,
      latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
      latestSuccessfulSyncRun: readState.latestSuccessfulSyncRun,
      freshness: readState.freshness,
      companyTotals: readState.companyTotals,
      latestAttemptedSlices: readState.latestAttemptedSlices,
      latestSuccessfulSlices: readState.latestSuccessfulSlices,
      limitations: FINANCE_TWIN_LIMITATIONS,
    });
  }

  async getAccountCatalog(companyKey: string): Promise<FinanceAccountCatalogView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return FinanceAccountCatalogViewSchema.parse({
      company,
      latestAttemptedSyncRun: readState.latestChartOfAccountsAttemptedSyncRun,
      latestSuccessfulSlice: readState.latestSuccessfulSlices.chartOfAccounts,
      freshness: readState.freshness.chartOfAccounts,
      accounts: readState.latestAccountCatalogEntries,
      limitations: FINANCE_TWIN_LIMITATIONS,
    });
  }

  async getGeneralLedger(companyKey: string): Promise<FinanceGeneralLedgerView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return FinanceGeneralLedgerViewSchema.parse({
      company,
      latestAttemptedSyncRun: readState.latestGeneralLedgerAttemptedSyncRun,
      latestSuccessfulSlice: readState.latestSuccessfulSlices.generalLedger,
      freshness: readState.freshness.generalLedger,
      entries: readState.latestGeneralLedgerEntries,
      limitations: FINANCE_TWIN_LIMITATIONS,
    });
  }

  async getCompanySnapshot(companyKey: string): Promise<FinanceSnapshotView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return FinanceSnapshotViewSchema.parse(
      buildFinanceSnapshotView({
        company,
        companyTotals: readState.companyTotals,
        freshness: readState.freshness,
        latestAttemptedSlices: readState.latestAttemptedSlices,
        latestSuccessfulSlices: readState.latestSuccessfulSlices,
        chartOfAccountsEntries: readState.latestAccountCatalogEntries,
        trialBalanceLineViews: readState.latestTrialBalanceLineViews,
        generalLedgerEntries: readState.latestGeneralLedgerEntries,
        limitations: FINANCE_TWIN_LIMITATIONS,
      }),
    );
  }

  async getReconciliationReadiness(
    companyKey: string,
  ): Promise<FinanceReconciliationReadinessView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return FinanceReconciliationReadinessViewSchema.parse(
      buildFinanceReconciliationReadinessView({
        company,
        trialBalanceSlice: readState.latestSuccessfulSlices.trialBalance,
        generalLedgerSlice: readState.latestSuccessfulSlices.generalLedger,
        freshness: readState.freshness,
        trialBalanceLineViews: readState.latestTrialBalanceLineViews,
        generalLedgerEntries: readState.latestGeneralLedgerEntries,
        limitations: FINANCE_TWIN_LIMITATIONS,
      }),
    );
  }

  async getGeneralLedgerAccountActivityLineage(input: {
    companyKey: string;
    ledgerAccountId: string;
    syncRunId?: string;
  }): Promise<FinanceGeneralLedgerActivityLineageView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      input.companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(input.companyKey);
    }

    const readState = await this.readCompanyState(company);
    const latestSuccessfulRun =
      readState.latestSuccessfulSlices.generalLedger.latestSyncRun;
    const latestSuccessfulEntries = readState.latestGeneralLedgerEntries;
    const requestedSyncRun = input.syncRunId
      ? await this.input.financeTwinRepository.getSyncRunById(input.syncRunId)
      : latestSuccessfulRun;
    const syncRun =
      requestedSyncRun &&
      requestedSyncRun.companyId === company.id &&
      requestedSyncRun.extractorKey === "general_ledger_csv" &&
      requestedSyncRun.status === "succeeded"
        ? requestedSyncRun
        : null;
    const entries =
      syncRun === null
        ? []
        : input.syncRunId === undefined || syncRun.id === latestSuccessfulRun?.id
          ? latestSuccessfulEntries
          : await this.input.financeTwinRepository.listGeneralLedgerEntriesBySyncRunId(
              syncRun.id,
            );
    const limitations = [...FINANCE_TWIN_LIMITATIONS];

    if (!latestSuccessfulRun && input.syncRunId === undefined) {
      limitations.push(
        "No successful general-ledger slice exists yet for this activity-lineage drill.",
      );
    }

    if (input.syncRunId && syncRun === null) {
      limitations.push(
        "The requested sync run is not a successful general-ledger slice for this company.",
      );
    }

    if (
      syncRun !== null &&
      !entries.some((entry) =>
        entry.lines.some((line) => line.ledgerAccount.id === input.ledgerAccountId),
      )
    ) {
      limitations.push(
        "No journal-line activity for this ledger account was found in the requested general-ledger slice.",
      );
    }

    return FinanceGeneralLedgerActivityLineageViewSchema.parse(
      buildFinanceGeneralLedgerActivityLineageView({
        company,
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: syncRun?.id ?? null,
        entries,
        limitations,
      }),
    );
  }

  async getLineageDrill(input: {
    companyKey: string;
    syncRunId?: string;
    targetId: string;
    targetKind: FinanceTwinLineageTargetKind;
  }): Promise<FinanceLineageDrillView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      input.companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(input.companyKey);
    }

    const records = await this.input.financeTwinRepository.listLineageByTarget({
      companyId: company.id,
      targetKind: input.targetKind,
      targetId: input.targetId,
      syncRunId: input.syncRunId,
    });
    const metadata = await this.readLineageMetadata(records);

    return FinanceLineageDrillViewSchema.parse(
      buildFinanceLineageDrillView({
        company,
        target: {
          targetKind: input.targetKind,
          targetId: input.targetId,
          syncRunId: input.syncRunId ?? null,
        },
        records,
        syncRunsById: metadata.syncRunsById,
        sourcesById: metadata.sourcesById,
        sourceSnapshotsById: metadata.sourceSnapshotsById,
        sourceFilesById: metadata.sourceFilesById,
        limitations: FINANCE_TWIN_LIMITATIONS,
      }),
    );
  }

  private async persistTrialBalanceSync(input: {
    company: FinanceCompanyRecord;
    extracted: TrialBalanceExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const observedAt = this.now().toISOString();

    return this.input.financeTwinRepository.transaction(async (session) => {
      const reportingPeriod =
        await this.input.financeTwinRepository.upsertReportingPeriod(
          {
            companyId: input.company.id,
            periodKey: input.extracted.reportingPeriod.periodKey,
            label: input.extracted.reportingPeriod.label,
            periodStart: input.extracted.reportingPeriod.periodStart,
            periodEnd: input.extracted.reportingPeriod.periodEnd,
          },
          session,
        );

      await this.input.financeTwinRepository.createLineage(
        {
          companyId: input.company.id,
          syncRunId: input.syncRun.id,
          targetKind: "reporting_period",
          targetId: reportingPeriod.id,
          sourceId: input.sourceId,
          sourceSnapshotId: input.snapshotId,
          sourceFileId: input.sourceFileId,
          recordedAt: observedAt,
        },
        session,
      );

      const ledgerAccounts = new Map<string, { id: string }>();

      for (const account of input.extracted.accounts) {
        const storedAccount =
          await this.input.financeTwinRepository.upsertLedgerAccount(
            {
              companyId: input.company.id,
              accountCode: account.accountCode,
              accountName: account.accountName,
              accountType: account.accountType,
              extractorKey: "trial_balance_csv",
            },
            session,
          );

        ledgerAccounts.set(account.accountCode, storedAccount);
        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "ledger_account",
            targetId: storedAccount.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt: observedAt,
          },
          session,
        );
      }

      for (const line of input.extracted.lines) {
        const ledgerAccount = ledgerAccounts.get(line.accountCode);

        if (!ledgerAccount) {
          throw new Error(
            `Ledger account ${line.accountCode} was not available for line persistence`,
          );
        }

        const storedLine =
          await this.input.financeTwinRepository.upsertTrialBalanceLine(
            {
              companyId: input.company.id,
              reportingPeriodId: reportingPeriod.id,
              ledgerAccountId: ledgerAccount.id,
              syncRunId: input.syncRun.id,
              lineNumber: line.lineNumber,
              debitAmount: line.debitAmount,
              creditAmount: line.creditAmount,
              netAmount: line.netAmount,
              currencyCode: line.currencyCode,
              observedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "trial_balance_line",
            targetId: storedLine.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt: observedAt,
          },
          session,
        );
      }

      const reportingPeriodCount =
        await this.input.financeTwinRepository.countReportingPeriodsByCompanyId(
          input.company.id,
          session,
        );
      const ledgerAccountCount =
        await this.input.financeTwinRepository.countLedgerAccountsByCompanyId(
          input.company.id,
          session,
        );

      return this.input.financeTwinRepository.finishSyncRun(
        {
          syncRunId: input.syncRun.id,
          reportingPeriodId: reportingPeriod.id,
          status: "succeeded",
          completedAt: observedAt,
          stats: {
            ledgerAccountCount,
            reportingPeriodCount,
            trialBalanceLineCount: input.extracted.lines.length,
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async persistChartOfAccountsSync(input: {
    company: FinanceCompanyRecord;
    extracted: ChartOfAccountsExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const observedAt = this.now().toISOString();

    return this.input.financeTwinRepository.transaction(async (session) => {
      for (const account of input.extracted.accounts) {
        const storedAccount =
          await this.input.financeTwinRepository.upsertLedgerAccount(
            {
              companyId: input.company.id,
              accountCode: account.accountCode,
              accountName: account.accountName,
              accountType: account.accountType,
              extractorKey: "chart_of_accounts_csv",
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "ledger_account",
            targetId: storedAccount.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt: observedAt,
          },
          session,
        );

        const storedCatalogEntry =
          await this.input.financeTwinRepository.upsertAccountCatalogEntry(
            {
              companyId: input.company.id,
              ledgerAccountId: storedAccount.id,
              syncRunId: input.syncRun.id,
              lineNumber: account.lineNumber,
              detailType: account.detailType,
              description: account.description,
              parentAccountCode: account.parentAccountCode,
              isActive: account.isActive,
              observedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "account_catalog_entry",
            targetId: storedCatalogEntry.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt: observedAt,
          },
          session,
        );
      }

      const reportingPeriodCount =
        await this.input.financeTwinRepository.countReportingPeriodsByCompanyId(
          input.company.id,
          session,
        );
      const ledgerAccountCount =
        await this.input.financeTwinRepository.countLedgerAccountsByCompanyId(
          input.company.id,
          session,
        );

      return this.input.financeTwinRepository.finishSyncRun(
        {
          syncRunId: input.syncRun.id,
          reportingPeriodId: null,
          status: "succeeded",
          completedAt: observedAt,
          stats: {
            accountCatalogEntryCount: input.extracted.accounts.length,
            ledgerAccountCount,
            reportingPeriodCount,
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async persistGeneralLedgerSync(input: {
    company: FinanceCompanyRecord;
    extracted: GeneralLedgerExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const recordedAt = this.now().toISOString();

    return this.input.financeTwinRepository.transaction(async (session) => {
      const ledgerAccounts = new Map<string, { id: string }>();
      const lineagedLedgerAccountIds = new Set<string>();
      let journalLineCount = 0;

      for (const entry of input.extracted.entries) {
        const storedEntry = await this.input.financeTwinRepository.upsertJournalEntry(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            externalEntryId: entry.externalEntryId,
            transactionDate: entry.transactionDate,
            entryDescription: entry.entryDescription,
          },
          session,
        );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "journal_entry",
            targetId: storedEntry.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );

        for (const line of entry.lines) {
          let storedAccount = ledgerAccounts.get(line.accountCode);

          if (!storedAccount) {
            storedAccount =
              await this.input.financeTwinRepository.upsertLedgerAccount(
                {
                  companyId: input.company.id,
                  accountCode: line.accountCode,
                  accountName: line.accountName,
                  accountType: line.accountType,
                  extractorKey: "general_ledger_csv",
                },
                session,
              );
            ledgerAccounts.set(line.accountCode, storedAccount);
          }

          if (!lineagedLedgerAccountIds.has(storedAccount.id)) {
            await this.input.financeTwinRepository.createLineage(
              {
                companyId: input.company.id,
                syncRunId: input.syncRun.id,
                targetKind: "ledger_account",
                targetId: storedAccount.id,
                sourceId: input.sourceId,
                sourceSnapshotId: input.snapshotId,
                sourceFileId: input.sourceFileId,
                recordedAt,
              },
              session,
            );
            lineagedLedgerAccountIds.add(storedAccount.id);
          }

          const storedLine = await this.input.financeTwinRepository.upsertJournalLine(
            {
              companyId: input.company.id,
              journalEntryId: storedEntry.id,
              ledgerAccountId: storedAccount.id,
              syncRunId: input.syncRun.id,
              lineNumber: line.lineNumber,
              debitAmount: line.debitAmount,
              creditAmount: line.creditAmount,
              currencyCode: line.currencyCode,
              lineDescription: line.lineDescription,
            },
            session,
          );

          await this.input.financeTwinRepository.createLineage(
            {
              companyId: input.company.id,
              syncRunId: input.syncRun.id,
              targetKind: "journal_line",
              targetId: storedLine.id,
              sourceId: input.sourceId,
              sourceSnapshotId: input.snapshotId,
              sourceFileId: input.sourceFileId,
              recordedAt,
            },
            session,
          );
          journalLineCount += 1;
        }
      }

      const [reportingPeriodCount, ledgerAccountCount] = await Promise.all([
        this.input.financeTwinRepository.countReportingPeriodsByCompanyId(
          input.company.id,
          session,
        ),
        this.input.financeTwinRepository.countLedgerAccountsByCompanyId(
          input.company.id,
          session,
        ),
      ]);

      return this.input.financeTwinRepository.finishSyncRun(
        {
          syncRunId: input.syncRun.id,
          reportingPeriodId: null,
          status: "succeeded",
          completedAt: recordedAt,
          stats: {
            journalEntryCount: input.extracted.entries.length,
            journalLineCount,
            ledgerAccountCount,
            reportingPeriodCount,
            ...buildPersistedGeneralLedgerPeriodContextStats({
              sourceDeclaredPeriod: input.extracted.sourceDeclaredPeriod,
            }),
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async readCompanyState(
    company: FinanceCompanyRecord,
  ): Promise<CompanyReadState> {
    const [
      latestAttemptedSyncRun,
      latestSuccessfulSyncRun,
      trialBalanceLatestRun,
      trialBalanceLatestSuccessfulRun,
      chartOfAccountsLatestRun,
      chartOfAccountsLatestSuccessfulRun,
      generalLedgerLatestRun,
      generalLedgerLatestSuccessfulRun,
      ledgerAccountCount,
      reportingPeriodCount,
    ] = await Promise.all([
      this.input.financeTwinRepository.getLatestSyncRunByCompanyId(company.id),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyId(
        company.id,
      ),
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "trial_balance_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "trial_balance_csv",
      ),
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "chart_of_accounts_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "chart_of_accounts_csv",
      ),
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "general_ledger_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "general_ledger_csv",
      ),
      this.input.financeTwinRepository.countLedgerAccountsByCompanyId(company.id),
      this.input.financeTwinRepository.countReportingPeriodsByCompanyId(company.id),
    ]);

    const [trialBalanceSlice, chartOfAccountsSlice, generalLedgerSlice] =
      await Promise.all([
        this.readLatestSuccessfulTrialBalanceSlice(
          trialBalanceLatestSuccessfulRun,
        ),
        this.readLatestSuccessfulChartOfAccountsSlice(
          chartOfAccountsLatestSuccessfulRun,
        ),
        this.readLatestSuccessfulGeneralLedgerSlice(
          generalLedgerLatestSuccessfulRun,
        ),
      ]);

    return {
      latestAttemptedSyncRun,
      latestChartOfAccountsAttemptedSyncRun: chartOfAccountsLatestRun,
      latestGeneralLedgerAttemptedSyncRun: generalLedgerLatestRun,
      latestSuccessfulSyncRun,
      freshness: buildFinanceFreshnessView({
        trialBalance: {
          latestRun: trialBalanceLatestRun,
          latestSuccessfulRun: trialBalanceLatestSuccessfulRun,
        },
        chartOfAccounts: {
          latestRun: chartOfAccountsLatestRun,
          latestSuccessfulRun: chartOfAccountsLatestSuccessfulRun,
        },
        generalLedger: {
          latestRun: generalLedgerLatestRun,
          latestSuccessfulRun: generalLedgerLatestSuccessfulRun,
        },
        now: this.now(),
      }),
      companyTotals: {
        ledgerAccountCount,
        reportingPeriodCount,
      },
      latestAttemptedSlices: {
        trialBalance: buildAttemptedSlice(trialBalanceLatestRun),
        chartOfAccounts: buildAttemptedSlice(chartOfAccountsLatestRun),
        generalLedger: buildAttemptedSlice(generalLedgerLatestRun),
      },
      latestSuccessfulSlices: {
        trialBalance: trialBalanceSlice.snapshot,
        chartOfAccounts: chartOfAccountsSlice.snapshot,
        generalLedger: generalLedgerSlice.snapshot,
      },
      latestAccountCatalogEntries: chartOfAccountsSlice.accounts,
      latestGeneralLedgerEntries: generalLedgerSlice.entries,
      latestTrialBalanceLineViews: trialBalanceSlice.lineViews,
    };
  }

  private async readLineageMetadata(records: {
    sourceFileId: string;
    sourceId: string;
    sourceSnapshotId: string;
    syncRunId: string;
  }[]) {
    const syncRunIds = Array.from(new Set(records.map((record) => record.syncRunId)));
    const sourceIds = Array.from(new Set(records.map((record) => record.sourceId)));
    const sourceSnapshotIds = Array.from(
      new Set(records.map((record) => record.sourceSnapshotId)),
    );
    const sourceFileIds = Array.from(
      new Set(records.map((record) => record.sourceFileId)),
    );
    const [syncRuns, sources, sourceSnapshots, sourceFiles] = await Promise.all([
      Promise.all(
        syncRunIds.map(async (syncRunId) => {
          const syncRun = await this.input.financeTwinRepository.getSyncRunById(
            syncRunId,
          );

          if (!syncRun) {
            throw new Error(`Finance twin sync run ${syncRunId} was not found`);
          }

          return syncRun;
        }),
      ),
      Promise.all(
        sourceIds.map(async (sourceId) => {
          const source = await this.input.sourceRepository.getSourceById(sourceId);

          if (!source) {
            throw new Error(`Finance twin lineage source ${sourceId} was not found`);
          }

          return source;
        }),
      ),
      Promise.all(
        sourceSnapshotIds.map(async (sourceSnapshotId) => {
          const sourceSnapshot =
            await this.input.sourceRepository.getSnapshotById(sourceSnapshotId);

          if (!sourceSnapshot) {
            throw new Error(
              `Finance twin lineage snapshot ${sourceSnapshotId} was not found`,
            );
          }

          return sourceSnapshot;
        }),
      ),
      Promise.all(
        sourceFileIds.map(async (sourceFileId) => {
          const sourceFile =
            await this.input.sourceRepository.getSourceFileById(sourceFileId);

          if (!sourceFile) {
            throw new Error(
              `Finance twin lineage source file ${sourceFileId} was not found`,
            );
          }

          return sourceFile;
        }),
      ),
    ]);

    return {
      syncRunsById: new Map(
        syncRuns.map((syncRun) => [syncRun.id, syncRun] satisfies [
          string,
          FinanceTwinSyncRunRecord,
        ]),
      ),
      sourcesById: new Map(
        sources.map((source) => [source.id, source] satisfies [
          string,
          SourceRecord,
        ]),
      ),
      sourceSnapshotsById: new Map(
        sourceSnapshots.map((sourceSnapshot) => [
          sourceSnapshot.id,
          sourceSnapshot,
        ] satisfies [string, SourceSnapshotRecord]),
      ),
      sourceFilesById: new Map(
        sourceFiles.map((sourceFile) => [sourceFile.id, sourceFile] satisfies [
          string,
          SourceFileRecord,
        ]),
      ),
    };
  }

  private async readLatestSuccessfulTrialBalanceSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun?.reportingPeriodId) {
      return {
        lineViews: [],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          reportingPeriod: null,
          coverage: {
            lineCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [reportingPeriod, lineViews, lineages] = await Promise.all([
      this.input.financeTwinRepository.getReportingPeriodById(
        latestSuccessfulRun.reportingPeriodId,
      ),
      this.input.financeTwinRepository.listTrialBalanceLineViewsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const lines = lineViews.map((lineView) => lineView.trialBalanceLine);

    return {
      lineViews,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        reportingPeriod,
        coverage: {
          lineCount: lines.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary: lines.length > 0 ? buildTrialBalanceSummary(lines) : null,
      },
    };
  }

  private async readLatestSuccessfulChartOfAccountsSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        accounts: [],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            accountCatalogEntryCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [accounts, lineages] = await Promise.all([
      this.input.financeTwinRepository.listAccountCatalogEntriesBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);

    return {
      accounts,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          accountCatalogEntryCount: accounts.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary:
          accounts.length > 0 ? buildChartOfAccountsSummary(accounts) : null,
      },
    };
  }

  private async readLatestSuccessfulGeneralLedgerSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        entries: [],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            journalEntryCount: 0,
            journalLineCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          periodContext: buildFinanceGeneralLedgerPeriodContext({
            latestSuccessfulRun: null,
            summary: null,
          }),
          summary: null,
        },
      };
    }

    const [entries, lineages] = await Promise.all([
      this.input.financeTwinRepository.listGeneralLedgerEntriesBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const journalLineCount = entries.reduce(
      (count, entry) => count + entry.lines.length,
      0,
    );
    const summary = entries.length > 0 ? buildGeneralLedgerSummary(entries) : null;

    return {
      entries,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          journalEntryCount: entries.length,
          journalLineCount,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        periodContext: buildFinanceGeneralLedgerPeriodContext({
          latestSuccessfulRun,
          summary,
        }),
        summary,
      },
    };
  }
}

function buildAttemptedSlice(syncRun: FinanceTwinSyncRunRecord | null) {
  return {
    latestSource: buildSourceRef(syncRun),
    latestSyncRun: syncRun,
  };
}

function buildSourceRef(syncRun: FinanceTwinSyncRunRecord | null) {
  if (!syncRun) {
    return null;
  }

  return {
    sourceId: syncRun.sourceId,
    sourceSnapshotId: syncRun.sourceSnapshotId,
    sourceFileId: syncRun.sourceFileId,
    syncRunId: syncRun.id,
  };
}

function resolveCompanyDisplayName(input: {
  companyKey: string;
  companyName?: string;
  existingCompany: FinanceCompanyRecord | null;
}) {
  const explicitName = input.companyName?.trim();

  if (explicitName) {
    return explicitName;
  }

  if (input.existingCompany?.displayName) {
    return input.existingCompany.displayName;
  }

  return buildDefaultCompanyName(input.companyKey);
}

function buildDefaultCompanyName(companyKey: string) {
  return companyKey
    .split(/[-_]+/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown finance sync failure";

  return message.slice(0, MAX_ERROR_SUMMARY_LENGTH);
}
