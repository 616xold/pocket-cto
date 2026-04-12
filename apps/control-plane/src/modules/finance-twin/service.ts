import {
  FinanceBankAccountInventoryViewSchema,
  FinanceAccountCatalogViewSchema,
  FinanceAccountBridgeReadinessViewSchema,
  FinanceBalanceBridgePrerequisitesViewSchema,
  FinanceCashPostureViewSchema,
  FinanceCollectionsPostureViewSchema,
  FinanceContractsViewSchema,
  FinanceGeneralLedgerActivityLineageViewSchema,
  type FinanceGeneralLedgerBalanceProofView,
  FinanceGeneralLedgerViewSchema,
  FinanceLineageDrillViewSchema,
  FinanceObligationCalendarViewSchema,
  FinancePayablesAgingViewSchema,
  FinancePayablesPostureViewSchema,
  FinanceReceivablesAgingViewSchema,
  FinanceReconciliationReadinessViewSchema,
  FinanceSnapshotViewSchema,
  FinanceTwinCompanySummarySchema,
  FinanceTwinSyncInputSchema,
  FinanceTwinSyncResultSchema,
  type FinanceBankAccountInventoryView,
  type FinanceCashPostureView,
  type FinanceAccountCatalogEntryView,
  type FinanceBalanceBridgePrerequisitesView,
  type FinanceAccountBridgeReadinessView,
  type FinanceAccountCatalogView,
  type FinanceCompanyRecord,
  type FinanceContractRecord,
  type FinanceCollectionsPostureView,
  type FinanceContractsView,
  type FinanceFreshnessSummary,
  type FinanceGeneralLedgerActivityLineageView,
  type FinanceGeneralLedgerBalanceProofRecord,
  type FinanceLineageDrillView,
  type FinanceGeneralLedgerEntryView,
  type FinanceGeneralLedgerView,
  type FinanceLatestSuccessfulBankAccountSummarySlice,
  type FinanceLatestSuccessfulContractMetadataSlice,
  type FinanceLatestSuccessfulPayablesAgingSlice,
  type FinanceLatestSuccessfulReceivablesAgingSlice,
  type FinanceLatestAttemptedSlices,
  type FinanceObligationCalendarView,
  type FinancePayablesAgingBucketKey,
  type FinancePayablesAgingView,
  type FinancePayablesPostureView,
  type FinanceReceivablesAgingBucketKey,
  type FinanceReceivablesAgingView,
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
import type { ContractMetadataExtractionResult } from "./contract-metadata-csv";
import {
  buildContractMetadataSliceSummary,
  buildFinanceContractsView,
} from "./contracts";
import {
  FinanceCompanyNotFoundError,
  FinanceTwinUnsupportedSourceError,
} from "./errors";
import { extractFinanceTwinSource } from "./extractor-dispatch";
import {
  buildFinanceFreshnessView,
  buildFinanceSliceFreshnessSummary,
} from "./freshness";
import { buildGeneralLedgerActivityByAccountId } from "./general-ledger-activity";
import { buildFinanceGeneralLedgerActivityLineageView } from "./general-ledger-activity-lineage";
import { buildFinanceGeneralLedgerBalanceProof } from "./general-ledger-balance-proof";
import { buildFinanceGeneralLedgerBalanceProofView } from "./general-ledger-balance-proof-view";
import {
  buildFinanceGeneralLedgerPeriodContext,
  buildPersistedGeneralLedgerPeriodContextStats,
} from "./general-ledger-period-context";
import {
  buildFinanceLineageRecordViews,
  buildFinanceLineageDrillView,
  buildLineageTargetCounts,
} from "./lineage";
import type { GeneralLedgerExtractionResult } from "./general-ledger-csv";
import { buildFinanceAccountBridgeReadinessView } from "./account-bridge";
import { buildFinanceBalanceBridgePrerequisitesView } from "./balance-bridge-prerequisites";
import { buildFinanceCollectionsPostureView } from "./collections-posture";
import { buildFinanceObligationCalendarView } from "./obligation-calendar";
import { buildFinanceReconciliationReadinessView } from "./reconciliation";
import type {
  FinanceBankAccountSummaryView,
  FinanceContractObligationView,
  FinancePayablesAgingRowView,
  FinanceReceivablesAgingRowView,
  FinanceTrialBalanceLineView,
  FinanceTwinRepository,
} from "./repository";
import { buildFinanceSnapshotView } from "./snapshot";
import {
  buildBankAccountSummarySliceSummary,
  buildFinanceBankAccountInventoryView,
} from "./bank-account-summary";
import type { BankAccountSummaryExtractionResult } from "./bank-account-summary-csv";
import { buildFinanceCashPostureView } from "./cash-posture";
import {
  buildFinancePayablesAgingView,
  buildPayablesAgingSliceSummary,
} from "./payables-aging";
import type { PayablesAgingExtractionResult } from "./payables-aging-csv";
import { buildFinancePayablesPostureView } from "./payables-posture";
import { buildFinanceReceivablesAgingView, buildReceivablesAgingSliceSummary } from "./receivables-aging";
import type { ReceivablesAgingExtractionResult } from "./receivables-aging-csv";
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
  latestGeneralLedgerBalanceProofs: FinanceGeneralLedgerBalanceProofRecord[];
  latestGeneralLedgerAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestGeneralLedgerEntries: FinanceGeneralLedgerEntryView[];
  latestTrialBalanceLineViews: FinanceTrialBalanceLineView[];
  latestSuccessfulSlices: FinanceLatestSuccessfulSlices;
  latestSuccessfulSyncRun: FinanceTwinSyncRunRecord | null;
};

type BankAccountSummaryReadState = {
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulBankAccountSummarySlice;
  summaries: FinanceBankAccountSummaryView[];
};

type ReceivablesAgingReadState = {
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulReceivablesAgingSlice;
  rows: FinanceReceivablesAgingRowView[];
};

type PayablesAgingReadState = {
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulPayablesAgingSlice;
  rows: FinancePayablesAgingRowView[];
};

type ContractMetadataReadState = {
  contracts: FinanceContractRecord[];
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulContractMetadataSlice;
  obligations: FinanceContractObligationView[];
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
    const sourceFile =
      await this.input.sourceRepository.getSourceFileById(sourceFileId);

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
              : extracted.extractorKey === "general_ledger_csv"
              ? await this.persistGeneralLedgerSync({
                  company,
                  extracted: extracted.generalLedger,
                  snapshotId: snapshot.id,
                  sourceFileId: sourceFile.id,
                  sourceId: source.id,
                  syncRun,
                })
              : extracted.extractorKey === "contract_metadata_csv"
                ? await this.persistContractMetadataSync({
                    company,
                    extracted: extracted.contractMetadata,
                    snapshotId: snapshot.id,
                    sourceFileId: sourceFile.id,
                    sourceId: source.id,
                    syncRun,
                  })
              : extracted.extractorKey === "payables_aging_csv"
                ? await this.persistPayablesAgingSync({
                    company,
                    extracted: extracted.payablesAging,
                    snapshotId: snapshot.id,
                    sourceFileId: sourceFile.id,
                    sourceId: source.id,
                    syncRun,
                  })
              : extracted.extractorKey === "receivables_aging_csv"
                ? await this.persistReceivablesAgingSync({
                    company,
                    extracted: extracted.receivablesAging,
                    snapshotId: snapshot.id,
                    sourceFileId: sourceFile.id,
                    sourceId: source.id,
                    syncRun,
                  })
              : await this.persistBankAccountSummarySync({
                  company,
                  extracted: extracted.bankAccountSummary,
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

  async getCompanySummary(
    companyKey: string,
  ): Promise<FinanceTwinCompanySummary> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

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

  async getAccountCatalog(
    companyKey: string,
  ): Promise<FinanceAccountCatalogView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

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

  async getGeneralLedger(
    companyKey: string,
  ): Promise<FinanceGeneralLedgerView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

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
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

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

  async getAccountBridgeReadiness(
    companyKey: string,
  ): Promise<FinanceAccountBridgeReadinessView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);
    return this.buildAccountBridgeReadinessView({
      company,
      readState,
    });
  }

  async getBalanceBridgePrerequisites(
    companyKey: string,
  ): Promise<FinanceBalanceBridgePrerequisitesView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);
    const reconciliation = this.buildReconciliationReadinessView({
      company,
      readState,
    });
    const accountBridge = this.buildAccountBridgeReadinessView({
      company,
      readState,
      reconciliation,
    });

    return FinanceBalanceBridgePrerequisitesViewSchema.parse(
      buildFinanceBalanceBridgePrerequisitesView({
        company,
        chartOfAccountsSlice: readState.latestSuccessfulSlices.chartOfAccounts,
        chartOfAccountsEntries: readState.latestAccountCatalogEntries,
        trialBalanceSlice: readState.latestSuccessfulSlices.trialBalance,
        generalLedgerSlice: readState.latestSuccessfulSlices.generalLedger,
        freshness: readState.freshness,
        trialBalanceLineViews: readState.latestTrialBalanceLineViews,
        generalLedgerBalanceProofs: readState.latestGeneralLedgerBalanceProofs,
        generalLedgerEntries: readState.latestGeneralLedgerEntries,
        sliceAlignment: reconciliation.sliceAlignment,
        comparability: reconciliation.comparability,
        accountBridgeReadiness: accountBridge.bridgeReadiness,
        limitations: FINANCE_TWIN_LIMITATIONS,
      }),
    );
  }

  async getReconciliationReadiness(
    companyKey: string,
  ): Promise<FinanceReconciliationReadinessView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readCompanyState(company);

    return this.buildReconciliationReadinessView({
      company,
      readState,
    });
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
    const generalLedgerSlice = await this.readRequestedGeneralLedgerSlice({
      company,
      readState,
      syncRunId: input.syncRunId,
    });
    const limitations = [...FINANCE_TWIN_LIMITATIONS];

    if (!generalLedgerSlice.latestSuccessfulRun && input.syncRunId === undefined) {
      limitations.push(
        "No successful general-ledger slice exists yet for this activity-lineage drill.",
      );
    }

    if (input.syncRunId && generalLedgerSlice.syncRun === null) {
      limitations.push(
        "The requested sync run is not a successful general-ledger slice for this company.",
      );
    }

    if (
      generalLedgerSlice.syncRun !== null &&
      !generalLedgerSlice.entries.some((entry) =>
        entry.lines.some(
          (line) => line.ledgerAccount.id === input.ledgerAccountId,
        ),
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
        syncRunId: generalLedgerSlice.syncRun?.id ?? null,
        entries: generalLedgerSlice.entries,
        limitations,
      }),
    );
  }

  async getGeneralLedgerAccountBalanceProof(input: {
    companyKey: string;
    ledgerAccountId: string;
    syncRunId?: string;
  }): Promise<FinanceGeneralLedgerBalanceProofView> {
    const company = await this.input.financeTwinRepository.getCompanyByKey(
      input.companyKey,
    );

    if (!company) {
      throw new FinanceCompanyNotFoundError(input.companyKey);
    }

    const readState = await this.readCompanyState(company);
    const generalLedgerSlice = await this.readRequestedGeneralLedgerSlice({
      company,
      readState,
      syncRunId: input.syncRunId,
    });
    const limitations = [
      ...FINANCE_TWIN_LIMITATIONS,
      "This route returns persisted balance-proof rows and lineage only; it does not compute a balance bridge or variance.",
    ];
    const diagnostics: string[] = [];

    if (!generalLedgerSlice.latestSuccessfulRun && input.syncRunId === undefined) {
      limitations.push(
        "No successful general-ledger slice exists yet for this balance-proof drill.",
      );
    }

    if (input.syncRunId && generalLedgerSlice.syncRun === null) {
      limitations.push(
        "The requested sync run is not a successful general-ledger slice for this company.",
      );
    }

    if (
      generalLedgerSlice.syncRun !== null &&
      generalLedgerSlice.latestSuccessfulRun !== null &&
      generalLedgerSlice.syncRun.id !== generalLedgerSlice.latestSuccessfulRun.id
    ) {
      diagnostics.push(
        "This balance-proof drill is scoped to the requested successful general-ledger slice instead of the latest successful general-ledger slice.",
      );
    }

    const generalLedgerActivity =
      buildGeneralLedgerActivityByAccountId(generalLedgerSlice.entries).get(
        input.ledgerAccountId,
      )?.activity ?? null;
    const proofRecord =
      generalLedgerSlice.balanceProofs.find(
        (proof) => proof.ledgerAccountId === input.ledgerAccountId,
      ) ?? null;
    const proof =
      proofRecord === null
        ? null
        : buildFinanceGeneralLedgerBalanceProof({
            generalLedgerActivity,
            sourceBackedBalanceProof: proofRecord,
          });

    let lineageRecords: ReturnType<typeof buildFinanceLineageRecordViews> = [];

    if (proofRecord !== null) {
      const records = await this.input.financeTwinRepository.listLineageByTarget({
        companyId: company.id,
        targetKind: "general_ledger_balance_proof",
        targetId: proofRecord.id,
        syncRunId: proofRecord.syncRunId,
      });

      if (records.length === 0) {
        limitations.push(
          "A persisted general-ledger balance-proof row exists for this account, but no lineage records were found for that proof row.",
        );
      } else {
        const metadata = await this.readLineageMetadata(records);
        lineageRecords = buildFinanceLineageRecordViews({
          records,
          syncRunsById: metadata.syncRunsById,
          sourcesById: metadata.sourcesById,
          sourceSnapshotsById: metadata.sourceSnapshotsById,
          sourceFilesById: metadata.sourceFilesById,
        });
      }
    } else if (generalLedgerSlice.syncRun !== null) {
      limitations.push(
        buildFinanceGeneralLedgerBalanceProof({
          generalLedgerActivity,
          sourceBackedBalanceProof: null,
        }).reasonSummary,
      );
    }

    return buildFinanceGeneralLedgerBalanceProofView({
      company,
      target: {
        ledgerAccountId: input.ledgerAccountId,
        syncRunId: generalLedgerSlice.syncRun?.id ?? null,
      },
      latestSuccessfulGeneralLedgerSlice:
        readState.latestSuccessfulSlices.generalLedger,
      proofRecord,
      proof,
      lineageRecords,
      diagnostics,
      limitations,
    });
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

  async getBankAccounts(
    companyKey: string,
  ): Promise<FinanceBankAccountInventoryView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readBankAccountSummaryState(company);

    return FinanceBankAccountInventoryViewSchema.parse(
      buildFinanceBankAccountInventoryView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        summaries: readState.summaries,
      }),
    );
  }

  async getCashPosture(companyKey: string): Promise<FinanceCashPostureView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readBankAccountSummaryState(company);

    return FinanceCashPostureViewSchema.parse(
      buildFinanceCashPostureView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulBankSummarySlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        summaries: readState.summaries,
      }),
    );
  }

  async getContracts(companyKey: string): Promise<FinanceContractsView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readContractMetadataState(company);

    return FinanceContractsViewSchema.parse(
      buildFinanceContractsView({
        company,
        contracts: readState.contracts,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        obligations: readState.obligations,
      }),
    );
  }

  async getObligationCalendar(
    companyKey: string,
  ): Promise<FinanceObligationCalendarView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readContractMetadataState(company);

    return FinanceObligationCalendarViewSchema.parse(
      buildFinanceObligationCalendarView({
        company,
        contracts: readState.contracts,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulContractMetadataSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        obligations: readState.obligations,
      }),
    );
  }

  async getPayablesAging(companyKey: string): Promise<FinancePayablesAgingView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readPayablesAgingState(company);

    return FinancePayablesAgingViewSchema.parse(
      buildFinancePayablesAgingView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        rows: readState.rows,
      }),
    );
  }

  async getPayablesPosture(
    companyKey: string,
  ): Promise<FinancePayablesPostureView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readPayablesAgingState(company);

    return FinancePayablesPostureViewSchema.parse(
      buildFinancePayablesPostureView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulPayablesAgingSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        rows: readState.rows,
      }),
    );
  }

  async getReceivablesAging(
    companyKey: string,
  ): Promise<FinanceReceivablesAgingView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readReceivablesAgingState(company);

    return FinanceReceivablesAgingViewSchema.parse(
      buildFinanceReceivablesAgingView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        rows: readState.rows,
      }),
    );
  }

  async getCollectionsPosture(
    companyKey: string,
  ): Promise<FinanceCollectionsPostureView> {
    const company =
      await this.input.financeTwinRepository.getCompanyByKey(companyKey);

    if (!company) {
      throw new FinanceCompanyNotFoundError(companyKey);
    }

    const readState = await this.readReceivablesAgingState(company);

    return FinanceCollectionsPostureViewSchema.parse(
      buildFinanceCollectionsPostureView({
        company,
        freshness: readState.freshness,
        latestAttemptedSyncRun: readState.latestAttemptedSyncRun,
        latestSuccessfulReceivablesAgingSlice: readState.latestSuccessfulSlice,
        limitations: FINANCE_TWIN_LIMITATIONS,
        rows: readState.rows,
      }),
    );
  }

  private buildReconciliationReadinessView(input: {
    company: FinanceCompanyRecord;
    readState: CompanyReadState;
  }) {
    return FinanceReconciliationReadinessViewSchema.parse(
      buildFinanceReconciliationReadinessView({
        company: input.company,
        trialBalanceSlice: input.readState.latestSuccessfulSlices.trialBalance,
        generalLedgerSlice:
          input.readState.latestSuccessfulSlices.generalLedger,
        freshness: input.readState.freshness,
        trialBalanceLineViews: input.readState.latestTrialBalanceLineViews,
        generalLedgerEntries: input.readState.latestGeneralLedgerEntries,
        limitations: FINANCE_TWIN_LIMITATIONS,
      }),
    );
  }

  private buildAccountBridgeReadinessView(input: {
    company: FinanceCompanyRecord;
    readState: CompanyReadState;
    reconciliation?: FinanceReconciliationReadinessView;
  }) {
    const reconciliation =
      input.reconciliation ??
      this.buildReconciliationReadinessView({
        company: input.company,
        readState: input.readState,
      });

    return FinanceAccountBridgeReadinessViewSchema.parse(
      buildFinanceAccountBridgeReadinessView({
        company: input.company,
        chartOfAccountsSlice:
          input.readState.latestSuccessfulSlices.chartOfAccounts,
        chartOfAccountsEntries: input.readState.latestAccountCatalogEntries,
        trialBalanceSlice: input.readState.latestSuccessfulSlices.trialBalance,
        generalLedgerSlice:
          input.readState.latestSuccessfulSlices.generalLedger,
        freshness: input.readState.freshness,
        trialBalanceLineViews: input.readState.latestTrialBalanceLineViews,
        generalLedgerEntries: input.readState.latestGeneralLedgerEntries,
        sliceAlignment: reconciliation.sliceAlignment,
        comparability: reconciliation.comparability,
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
        const storedEntry =
          await this.input.financeTwinRepository.upsertJournalEntry(
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

          const storedLine =
            await this.input.financeTwinRepository.upsertJournalLine(
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

      for (const balanceProof of input.extracted.balanceProofs) {
        const storedAccount = ledgerAccounts.get(balanceProof.accountCode);

        if (!storedAccount) {
          throw new Error(
            `Ledger account ${balanceProof.accountCode} was not available for balance-proof persistence`,
          );
        }

        const storedBalanceProof =
          await this.input.financeTwinRepository.upsertGeneralLedgerBalanceProof(
            {
              companyId: input.company.id,
              ledgerAccountId: storedAccount.id,
              syncRunId: input.syncRun.id,
              openingBalanceAmount: balanceProof.openingBalanceAmount,
              openingBalanceSourceColumn:
                balanceProof.openingBalanceSourceColumn,
              openingBalanceLineNumber: balanceProof.openingBalanceLineNumber,
              endingBalanceAmount: balanceProof.endingBalanceAmount,
              endingBalanceSourceColumn: balanceProof.endingBalanceSourceColumn,
              endingBalanceLineNumber: balanceProof.endingBalanceLineNumber,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "general_ledger_balance_proof",
            targetId: storedBalanceProof.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
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
            generalLedgerBalanceProofCount:
              input.extracted.balanceProofs.length,
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

  private async persistReceivablesAgingSync(input: {
    company: FinanceCompanyRecord;
    extracted: ReceivablesAgingExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const recordedAt = this.now().toISOString();
    const customerIdentityKeys = new Set(
      input.extracted.rows.map((row) => row.customerIdentityKey),
    );
    const currencyCodes = new Set(
      input.extracted.rows
        .map((row) => row.currencyCode)
        .filter((currencyCode): currencyCode is string => currencyCode !== null),
    );

    return this.input.financeTwinRepository.transaction(async (session) => {
      const customersByIdentity = new Map<string, { id: string }>();

      for (const customer of input.extracted.customers) {
        if (!customerIdentityKeys.has(customer.identityKey)) {
          continue;
        }

        const storedCustomer = await this.input.financeTwinRepository.upsertCustomer(
          {
            companyId: input.company.id,
            identityKey: customer.identityKey,
            customerLabel: customer.customerLabel,
            externalCustomerId: customer.externalCustomerId,
          },
          session,
        );

        customersByIdentity.set(customer.identityKey, storedCustomer);
        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "customer",
            targetId: storedCustomer.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
      }

      for (const row of input.extracted.rows) {
        const customer = customersByIdentity.get(row.customerIdentityKey);

        if (!customer) {
          throw new Error(
            `Customer ${row.customerIdentityKey} was not available for receivables-aging persistence`,
          );
        }

        const storedRow =
          await this.input.financeTwinRepository.upsertReceivablesAgingRow(
            {
              companyId: input.company.id,
              customerId: customer.id,
              syncRunId: input.syncRun.id,
              rowScopeKey: row.rowScopeKey,
              lineNumber: row.lineNumber,
              sourceLineNumbers: row.sourceLineNumbers.slice().sort((left, right) => {
                return left - right;
              }),
              currencyCode: row.currencyCode,
              asOfDate: row.asOfDate,
              asOfDateSourceColumn: row.asOfDateSourceColumn,
              bucketValues: row.bucketValues,
              observedAt: recordedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "receivables_aging_row",
            targetId: storedRow.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
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
            receivablesAgingCustomerCount: customerIdentityKeys.size,
            receivablesAgingRowCount: input.extracted.rows.length,
            receivablesAgingCurrencyCount: currencyCodes.size,
            datedReceivablesAgingRowCount: input.extracted.rows.filter(
              (row) => row.asOfDate !== null,
            ).length,
            undatedReceivablesAgingRowCount: input.extracted.rows.filter(
              (row) => row.asOfDate === null,
            ).length,
            reportedBucketKeys: input.extracted.reportedBucketKeys,
            ledgerAccountCount,
            reportingPeriodCount,
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async persistContractMetadataSync(input: {
    company: FinanceCompanyRecord;
    extracted: ContractMetadataExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const recordedAt = this.now().toISOString();
    const currencyCodes = new Set(
      input.extracted.contracts
        .map((contract) => contract.currencyCode)
        .filter((currencyCode): currencyCode is string => currencyCode !== null),
    );

    return this.input.financeTwinRepository.transaction(async (session) => {
      const contractsByIdentity = new Map<string, { id: string }>();

      for (const contract of input.extracted.contracts) {
        const storedContract = await this.input.financeTwinRepository.upsertContract(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            contractIdentityKey: contract.contractIdentityKey,
            lineNumber: contract.lineNumber,
            sourceLineNumbers: contract.sourceLineNumbers
              .slice()
              .sort((left, right) => left - right),
            contractLabel: contract.contractLabel,
            externalContractId: contract.externalContractId,
            counterpartyLabel: contract.counterpartyLabel,
            contractType: contract.contractType,
            agreementType: contract.agreementType,
            status: contract.status,
            startDate: contract.startDate,
            effectiveDate: contract.effectiveDate,
            endDate: contract.endDate,
            expirationDate: contract.expirationDate,
            renewalDate: contract.renewalDate,
            noticeDeadline: contract.noticeDeadline,
            nextPaymentDate: contract.nextPaymentDate,
            knownAsOfDates: contract.knownAsOfDates.slice(),
            unknownAsOfObservationCount:
              contract.unknownAsOfObservationCount,
            amount: contract.amount,
            paymentAmount: contract.paymentAmount,
            currencyCode: contract.currencyCode,
            autoRenew: contract.autoRenew,
            sourceFieldMap: contract.sourceFieldMap,
            observedAt: recordedAt,
          },
          session,
        );

        contractsByIdentity.set(contract.contractIdentityKey, storedContract);
        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "contract",
            targetId: storedContract.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
      }

      for (const obligation of input.extracted.obligations) {
        const contract = contractsByIdentity.get(obligation.contractIdentityKey);

        if (!contract) {
          throw new Error(
            `Contract ${obligation.contractIdentityKey} was not available for obligation persistence`,
          );
        }

        const storedObligation =
          await this.input.financeTwinRepository.upsertContractObligation(
            {
              companyId: input.company.id,
              contractId: contract.id,
              syncRunId: input.syncRun.id,
              obligationScopeKey: obligation.obligationScopeKey,
              lineNumber: obligation.lineNumber,
              sourceLineNumbers: obligation.sourceLineNumbers
                .slice()
                .sort((left, right) => left - right),
              obligationType: obligation.obligationType,
              dueDate: obligation.dueDate,
              amount: obligation.amount,
              currencyCode: obligation.currencyCode,
              sourceField: obligation.sourceField,
              observedAt: recordedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "contract_obligation",
            targetId: storedObligation.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
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
            contractCount: input.extracted.contracts.length,
            contractObligationCount: input.extracted.obligations.length,
            contractCurrencyCount: currencyCodes.size,
            datedContractCount: input.extracted.contracts.filter(
              (contract) => contract.knownAsOfDates.length > 0,
            ).length,
            undatedContractCount: input.extracted.contracts.filter(
              (contract) => contract.knownAsOfDates.length === 0,
            ).length,
            ledgerAccountCount,
            reportingPeriodCount,
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async persistPayablesAgingSync(input: {
    company: FinanceCompanyRecord;
    extracted: PayablesAgingExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const recordedAt = this.now().toISOString();
    const vendorIdentityKeys = new Set(
      input.extracted.rows.map((row) => row.vendorIdentityKey),
    );
    const currencyCodes = new Set(
      input.extracted.rows
        .map((row) => row.currencyCode)
        .filter((currencyCode): currencyCode is string => currencyCode !== null),
    );

    return this.input.financeTwinRepository.transaction(async (session) => {
      const vendorsByIdentity = new Map<string, { id: string }>();

      for (const vendor of input.extracted.vendors) {
        if (!vendorIdentityKeys.has(vendor.identityKey)) {
          continue;
        }

        const storedVendor = await this.input.financeTwinRepository.upsertVendor(
          {
            companyId: input.company.id,
            identityKey: vendor.identityKey,
            vendorLabel: vendor.vendorLabel,
            externalVendorId: vendor.externalVendorId,
          },
          session,
        );

        vendorsByIdentity.set(vendor.identityKey, storedVendor);
        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "vendor",
            targetId: storedVendor.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
      }

      for (const row of input.extracted.rows) {
        const vendor = vendorsByIdentity.get(row.vendorIdentityKey);

        if (!vendor) {
          throw new Error(
            `Vendor ${row.vendorIdentityKey} was not available for payables-aging persistence`,
          );
        }

        const storedRow =
          await this.input.financeTwinRepository.upsertPayablesAgingRow(
            {
              companyId: input.company.id,
              vendorId: vendor.id,
              syncRunId: input.syncRun.id,
              rowScopeKey: row.rowScopeKey,
              lineNumber: row.lineNumber,
              sourceLineNumbers: row.sourceLineNumbers.slice().sort((left, right) => {
                return left - right;
              }),
              currencyCode: row.currencyCode,
              asOfDate: row.asOfDate,
              asOfDateSourceColumn: row.asOfDateSourceColumn,
              bucketValues: row.bucketValues,
              observedAt: recordedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "payables_aging_row",
            targetId: storedRow.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
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
            payablesAgingVendorCount: vendorIdentityKeys.size,
            payablesAgingRowCount: input.extracted.rows.length,
            payablesAgingCurrencyCount: currencyCodes.size,
            datedPayablesAgingRowCount: input.extracted.rows.filter(
              (row) => row.asOfDate !== null,
            ).length,
            undatedPayablesAgingRowCount: input.extracted.rows.filter(
              (row) => row.asOfDate === null,
            ).length,
            reportedBucketKeys: input.extracted.reportedBucketKeys,
            ledgerAccountCount,
            reportingPeriodCount,
          },
          errorSummary: null,
        },
        session,
      );
    });
  }

  private async persistBankAccountSummarySync(input: {
    company: FinanceCompanyRecord;
    extracted: BankAccountSummaryExtractionResult;
    snapshotId: string;
    sourceFileId: string;
    sourceId: string;
    syncRun: FinanceTwinSyncRunRecord;
  }) {
    const recordedAt = this.now().toISOString();
    const accountIdentityKeys = new Set(
      input.extracted.summaries.map((summary) => summary.accountIdentityKey),
    );

    return this.input.financeTwinRepository.transaction(async (session) => {
      const bankAccountsByIdentity = new Map<string, { id: string }>();

      for (const account of input.extracted.accounts) {
        if (!accountIdentityKeys.has(account.identityKey)) {
          continue;
        }

        const storedAccount = await this.input.financeTwinRepository.upsertBankAccount(
          {
            companyId: input.company.id,
            identityKey: account.identityKey,
            accountLabel: account.accountLabel,
            institutionName: account.institutionName,
            externalAccountId: account.externalAccountId,
            accountNumberLast4: account.accountNumberLast4,
          },
          session,
        );

        bankAccountsByIdentity.set(account.identityKey, storedAccount);
        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "bank_account",
            targetId: storedAccount.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
      }

      for (const summary of input.extracted.summaries) {
        const bankAccount = bankAccountsByIdentity.get(summary.accountIdentityKey);

        if (!bankAccount) {
          throw new Error(
            `Bank account ${summary.accountIdentityKey} was not available for bank-summary persistence`,
          );
        }

        const storedSummary =
          await this.input.financeTwinRepository.upsertBankAccountSummary(
            {
              companyId: input.company.id,
              bankAccountId: bankAccount.id,
              syncRunId: input.syncRun.id,
              lineNumber: summary.lineNumber,
              balanceType: summary.balanceType,
              balanceAmount: summary.balanceAmount,
              currencyCode: summary.currencyCode,
              asOfDate: summary.asOfDate,
              asOfDateSourceColumn: summary.asOfDateSourceColumn,
              balanceSourceColumn: summary.balanceSourceColumn,
              observedAt: recordedAt,
            },
            session,
          );

        await this.input.financeTwinRepository.createLineage(
          {
            companyId: input.company.id,
            syncRunId: input.syncRun.id,
            targetKind: "bank_account_summary",
            targetId: storedSummary.id,
            sourceId: input.sourceId,
            sourceSnapshotId: input.snapshotId,
            sourceFileId: input.sourceFileId,
            recordedAt,
          },
          session,
        );
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
            bankAccountCount: accountIdentityKeys.size,
            bankAccountSummaryCount: input.extracted.summaries.length,
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
      this.input.financeTwinRepository.countLedgerAccountsByCompanyId(
        company.id,
      ),
      this.input.financeTwinRepository.countReportingPeriodsByCompanyId(
        company.id,
      ),
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
      latestGeneralLedgerBalanceProofs: generalLedgerSlice.balanceProofs,
      latestGeneralLedgerEntries: generalLedgerSlice.entries,
      latestTrialBalanceLineViews: trialBalanceSlice.lineViews,
    };
  }

  private async readBankAccountSummaryState(
    company: FinanceCompanyRecord,
  ): Promise<BankAccountSummaryReadState> {
    const [latestAttemptedSyncRun, latestSuccessfulSyncRun] = await Promise.all([
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "bank_account_summary_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "bank_account_summary_csv",
      ),
    ]);
    const latestSuccessfulSlice =
      await this.readLatestSuccessfulBankAccountSummarySlice(
        latestSuccessfulSyncRun,
      );

    return {
      latestAttemptedSyncRun,
      freshness: buildFinanceSliceFreshnessSummary({
        latestRun: latestAttemptedSyncRun,
        latestSuccessfulRun: latestSuccessfulSyncRun,
        now: this.now(),
        sliceLabel: "bank-account-summary",
      }),
      latestSuccessfulSlice: latestSuccessfulSlice.snapshot,
      summaries: latestSuccessfulSlice.summaries,
    };
  }

  private async readReceivablesAgingState(
    company: FinanceCompanyRecord,
  ): Promise<ReceivablesAgingReadState> {
    const [latestAttemptedSyncRun, latestSuccessfulSyncRun] = await Promise.all([
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "receivables_aging_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "receivables_aging_csv",
      ),
    ]);
    const latestSuccessfulSlice =
      await this.readLatestSuccessfulReceivablesAgingSlice(
        latestSuccessfulSyncRun,
      );

    return {
      latestAttemptedSyncRun,
      freshness: buildFinanceSliceFreshnessSummary({
        latestRun: latestAttemptedSyncRun,
        latestSuccessfulRun: latestSuccessfulSyncRun,
        now: this.now(),
        sliceLabel: "receivables-aging",
      }),
      latestSuccessfulSlice: latestSuccessfulSlice.snapshot,
      rows: latestSuccessfulSlice.rows,
    };
  }

  private async readPayablesAgingState(
    company: FinanceCompanyRecord,
  ): Promise<PayablesAgingReadState> {
    const [latestAttemptedSyncRun, latestSuccessfulSyncRun] = await Promise.all([
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "payables_aging_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "payables_aging_csv",
      ),
    ]);
    const latestSuccessfulSlice =
      await this.readLatestSuccessfulPayablesAgingSlice(
        latestSuccessfulSyncRun,
      );

    return {
      latestAttemptedSyncRun,
      freshness: buildFinanceSliceFreshnessSummary({
        latestRun: latestAttemptedSyncRun,
        latestSuccessfulRun: latestSuccessfulSyncRun,
        now: this.now(),
        sliceLabel: "payables-aging",
      }),
      latestSuccessfulSlice: latestSuccessfulSlice.snapshot,
      rows: latestSuccessfulSlice.rows,
    };
  }

  private async readContractMetadataState(
    company: FinanceCompanyRecord,
  ): Promise<ContractMetadataReadState> {
    const [latestAttemptedSyncRun, latestSuccessfulSyncRun] = await Promise.all([
      this.input.financeTwinRepository.getLatestSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "contract_metadata_csv",
      ),
      this.input.financeTwinRepository.getLatestSuccessfulSyncRunByCompanyIdAndExtractorKey(
        company.id,
        "contract_metadata_csv",
      ),
    ]);
    const latestSuccessfulSlice =
      await this.readLatestSuccessfulContractMetadataSlice(
        latestSuccessfulSyncRun,
      );

    return {
      contracts: latestSuccessfulSlice.contracts,
      latestAttemptedSyncRun,
      freshness: buildFinanceSliceFreshnessSummary({
        latestRun: latestAttemptedSyncRun,
        latestSuccessfulRun: latestSuccessfulSyncRun,
        now: this.now(),
        sliceLabel: "contract-metadata",
      }),
      latestSuccessfulSlice: latestSuccessfulSlice.snapshot,
      obligations: latestSuccessfulSlice.obligations,
    };
  }

  private async readRequestedGeneralLedgerSlice(input: {
    company: FinanceCompanyRecord;
    readState: CompanyReadState;
    syncRunId?: string;
  }) {
    const latestSuccessfulRun =
      input.readState.latestSuccessfulSlices.generalLedger.latestSyncRun;
    const requestedSyncRun = input.syncRunId
      ? await this.input.financeTwinRepository.getSyncRunById(input.syncRunId)
      : latestSuccessfulRun;
    const syncRun =
      requestedSyncRun &&
      requestedSyncRun.companyId === input.company.id &&
      requestedSyncRun.extractorKey === "general_ledger_csv" &&
      requestedSyncRun.status === "succeeded"
        ? requestedSyncRun
        : null;

    if (syncRun === null) {
      return {
        latestSuccessfulRun,
        syncRun: null,
        entries: [] as FinanceGeneralLedgerEntryView[],
        balanceProofs: [] as FinanceGeneralLedgerBalanceProofRecord[],
      };
    }

    if (input.syncRunId === undefined || syncRun.id === latestSuccessfulRun?.id) {
      return {
        latestSuccessfulRun,
        syncRun,
        entries: input.readState.latestGeneralLedgerEntries,
        balanceProofs: input.readState.latestGeneralLedgerBalanceProofs,
      };
    }

    const [entries, balanceProofs] = await Promise.all([
      this.input.financeTwinRepository.listGeneralLedgerEntriesBySyncRunId(
        syncRun.id,
      ),
      this.input.financeTwinRepository.listGeneralLedgerBalanceProofsBySyncRunId(
        syncRun.id,
      ),
    ]);

    return {
      latestSuccessfulRun,
      syncRun,
      entries,
      balanceProofs,
    };
  }

  private async readLineageMetadata(
    records: {
      sourceFileId: string;
      sourceId: string;
      sourceSnapshotId: string;
      syncRunId: string;
    }[],
  ) {
    const syncRunIds = Array.from(
      new Set(records.map((record) => record.syncRunId)),
    );
    const sourceIds = Array.from(
      new Set(records.map((record) => record.sourceId)),
    );
    const sourceSnapshotIds = Array.from(
      new Set(records.map((record) => record.sourceSnapshotId)),
    );
    const sourceFileIds = Array.from(
      new Set(records.map((record) => record.sourceFileId)),
    );
    const [syncRuns, sources, sourceSnapshots, sourceFiles] = await Promise.all(
      [
        Promise.all(
          syncRunIds.map(async (syncRunId) => {
            const syncRun =
              await this.input.financeTwinRepository.getSyncRunById(syncRunId);

            if (!syncRun) {
              throw new Error(
                `Finance twin sync run ${syncRunId} was not found`,
              );
            }

            return syncRun;
          }),
        ),
        Promise.all(
          sourceIds.map(async (sourceId) => {
            const source =
              await this.input.sourceRepository.getSourceById(sourceId);

            if (!source) {
              throw new Error(
                `Finance twin lineage source ${sourceId} was not found`,
              );
            }

            return source;
          }),
        ),
        Promise.all(
          sourceSnapshotIds.map(async (sourceSnapshotId) => {
            const sourceSnapshot =
              await this.input.sourceRepository.getSnapshotById(
                sourceSnapshotId,
              );

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
      ],
    );

    return {
      syncRunsById: new Map(
        syncRuns.map(
          (syncRun) =>
            [syncRun.id, syncRun] satisfies [string, FinanceTwinSyncRunRecord],
        ),
      ),
      sourcesById: new Map(
        sources.map(
          (source) => [source.id, source] satisfies [string, SourceRecord],
        ),
      ),
      sourceSnapshotsById: new Map(
        sourceSnapshots.map(
          (sourceSnapshot) =>
            [sourceSnapshot.id, sourceSnapshot] satisfies [
              string,
              SourceSnapshotRecord,
            ],
        ),
      ),
      sourceFilesById: new Map(
        sourceFiles.map(
          (sourceFile) =>
            [sourceFile.id, sourceFile] satisfies [string, SourceFileRecord],
        ),
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
        balanceProofs: [],
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

    const [entries, lineages, balanceProofs] = await Promise.all([
      this.input.financeTwinRepository.listGeneralLedgerEntriesBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listGeneralLedgerBalanceProofsBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const journalLineCount = entries.reduce(
      (count, entry) => count + entry.lines.length,
      0,
    );
    const summary =
      entries.length > 0 ? buildGeneralLedgerSummary(entries) : null;

    return {
      balanceProofs,
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

  private async readLatestSuccessfulBankAccountSummarySlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        summaries: [] as FinanceBankAccountSummaryView[],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            bankAccountCount: 0,
            summaryRowCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [summaries, lineages] = await Promise.all([
      this.input.financeTwinRepository.listBankAccountSummaryViewsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const bankAccountCount = new Set(
      summaries.map((summary) => summary.bankAccount.id),
    ).size;

    return {
      summaries,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          bankAccountCount,
          summaryRowCount: summaries.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary:
          summaries.length > 0
            ? buildBankAccountSummarySliceSummary(summaries)
            : null,
      },
    };
  }

  private async readLatestSuccessfulReceivablesAgingSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        rows: [] as FinanceReceivablesAgingRowView[],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            customerCount: 0,
            rowCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [rows, lineages] = await Promise.all([
      this.input.financeTwinRepository.listReceivablesAgingRowViewsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const customerCount = new Set(rows.map((row) => row.customer.id)).size;

    return {
      rows,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          customerCount,
          rowCount: rows.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary:
          rows.length > 0
            ? buildReceivablesAgingSliceSummary({
                reportedBucketKeys: readReceivablesAgingReportedBucketKeys(
                  latestSuccessfulRun.stats,
                ),
                rows,
              })
            : null,
      },
    };
  }

  private async readLatestSuccessfulPayablesAgingSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        rows: [] as FinancePayablesAgingRowView[],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            vendorCount: 0,
            rowCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [rows, lineages] = await Promise.all([
      this.input.financeTwinRepository.listPayablesAgingRowViewsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);
    const vendorCount = new Set(rows.map((row) => row.vendor.id)).size;

    return {
      rows,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          vendorCount,
          rowCount: rows.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary:
          rows.length > 0
            ? buildPayablesAgingSliceSummary({
                reportedBucketKeys: readPayablesAgingReportedBucketKeys(
                  latestSuccessfulRun.stats,
                ),
                rows,
              })
            : null,
      },
    };
  }

  private async readLatestSuccessfulContractMetadataSlice(
    latestSuccessfulRun: FinanceTwinSyncRunRecord | null,
  ) {
    if (!latestSuccessfulRun) {
      return {
        contracts: [] as FinanceContractRecord[],
        obligations: [] as FinanceContractObligationView[],
        snapshot: {
          latestSource: null,
          latestSyncRun: null,
          coverage: {
            contractCount: 0,
            obligationCount: 0,
            lineageCount: 0,
            lineageTargetCounts: buildLineageTargetCounts([]),
          },
          summary: null,
        },
      };
    }

    const [contracts, obligations, lineages] = await Promise.all([
      this.input.financeTwinRepository.listContractsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listContractObligationViewsBySyncRunId(
        latestSuccessfulRun.id,
      ),
      this.input.financeTwinRepository.listLineageBySyncRunId(
        latestSuccessfulRun.id,
      ),
    ]);

    return {
      contracts,
      obligations,
      snapshot: {
        latestSource: buildSourceRef(latestSuccessfulRun),
        latestSyncRun: latestSuccessfulRun,
        coverage: {
          contractCount: contracts.length,
          obligationCount: obligations.length,
          lineageCount: lineages.length,
          lineageTargetCounts: buildLineageTargetCounts(lineages),
        },
        summary:
          contracts.length > 0
            ? buildContractMetadataSliceSummary({
                contracts,
                obligations,
              })
            : null,
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

function readReceivablesAgingReportedBucketKeys(
  stats: Record<string, unknown>,
): FinanceReceivablesAgingBucketKey[] {
  const reportedBucketKeys = stats.reportedBucketKeys;

  if (!Array.isArray(reportedBucketKeys)) {
    return [];
  }

  return reportedBucketKeys.filter(isReceivablesAgingBucketKey);
}

function readPayablesAgingReportedBucketKeys(
  stats: Record<string, unknown>,
): FinancePayablesAgingBucketKey[] {
  const reportedBucketKeys = stats.reportedBucketKeys;

  if (!Array.isArray(reportedBucketKeys)) {
    return [];
  }

  return reportedBucketKeys.filter(isPayablesAgingBucketKey);
}

function isReceivablesAgingBucketKey(
  value: unknown,
): value is FinanceReceivablesAgingBucketKey {
  return (
    value === "current" ||
    value === "0_30" ||
    value === "1_30" ||
    value === "31_60" ||
    value === "61_90" ||
    value === "91_120" ||
    value === "120_plus" ||
    value === "over_90" ||
    value === "over_120" ||
    value === "past_due" ||
    value === "total"
  );
}

function isPayablesAgingBucketKey(
  value: unknown,
): value is FinancePayablesAgingBucketKey {
  return (
    value === "current" ||
    value === "0_30" ||
    value === "1_30" ||
    value === "31_60" ||
    value === "61_90" ||
    value === "91_120" ||
    value === "120_plus" ||
    value === "over_90" ||
    value === "over_120" ||
    value === "past_due" ||
    value === "total"
  );
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
