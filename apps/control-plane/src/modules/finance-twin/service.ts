import {
  FinanceAccountCatalogViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
  FinanceTwinSyncResultSchema,
  type FinanceAccountCatalogEntryView,
  type FinanceAccountCatalogView,
  type FinanceCompanyRecord,
  type FinanceLatestSuccessfulSlices,
  type FinanceTwinCompanySummary,
  type FinanceTwinSyncInput,
  type FinanceTwinSyncResult,
  type FinanceTwinSyncRunRecord,
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
  FinanceTwinExtractionError,
  FinanceTwinUnsupportedSourceError,
} from "./errors";
import { extractFinanceTwinSource } from "./extractor-dispatch";
import { buildFinanceFreshnessView } from "./freshness";
import type { FinanceTwinRepository } from "./repository";
import {
  buildChartOfAccountsSummary,
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
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestChartOfAccountsAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
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

    const company = await this.input.financeTwinRepository.upsertCompany({
      companyKey,
      displayName:
        parsedInput.companyName?.trim() || buildDefaultCompanyName(companyKey),
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
          : await this.persistChartOfAccountsSync({
              company,
              extracted: extracted.chartOfAccounts,
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
      this.input.financeTwinRepository.countLedgerAccountsByCompanyId(company.id),
      this.input.financeTwinRepository.countReportingPeriodsByCompanyId(company.id),
    ]);

    const [trialBalanceSlice, chartOfAccountsSlice] = await Promise.all([
      this.readLatestSuccessfulTrialBalanceSlice(trialBalanceLatestSuccessfulRun),
      this.readLatestSuccessfulChartOfAccountsSlice(
        chartOfAccountsLatestSuccessfulRun,
      ),
    ]);

    return {
      latestAttemptedSyncRun,
      latestChartOfAccountsAttemptedSyncRun: chartOfAccountsLatestRun,
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
        now: this.now(),
      }),
      companyTotals: {
        ledgerAccountCount,
        reportingPeriodCount,
      },
      latestSuccessfulSlices: {
        trialBalance: trialBalanceSlice.snapshot,
        chartOfAccounts: chartOfAccountsSlice.snapshot,
      },
      latestAccountCatalogEntries: chartOfAccountsSlice.accounts,
    };
  }

  private async readLatestSuccessfulTrialBalanceSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun?.reportingPeriodId) {
      return {
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          reportingPeriod: null,
          coverage: {
            lineCount: 0,
            lineageCount: 0,
          },
          summary: null,
        },
      };
    }

    const [reportingPeriod, lines, lineageCount] = await Promise.all([
      this.input.financeTwinRepository.getReportingPeriodById(
        latestSuccessfulRun.reportingPeriodId,
      ),
      this.input.financeTwinRepository.listTrialBalanceLinesBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.countLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);

    return {
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        reportingPeriod,
        coverage: {
          lineCount: lines.length,
          lineageCount,
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
          },
          summary: null,
        },
      };
    }

    const [accounts, lineageCount] = await Promise.all([
      this.input.financeTwinRepository.listAccountCatalogEntriesBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.countLineageBySyncRunId(
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
          lineageCount,
        },
        summary:
          accounts.length > 0 ? buildChartOfAccountsSummary(accounts) : null,
      },
    };
  }
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

function buildDefaultCompanyName(companyKey: string) {
  return companyKey
    .split(/[-_]+/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeError(error: unknown) {
  const message =
    error instanceof FinanceTwinUnsupportedSourceError
      ? error.message
      : error instanceof FinanceTwinExtractionError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Finance twin sync failed";

  return message.slice(0, MAX_ERROR_SUMMARY_LENGTH);
}
