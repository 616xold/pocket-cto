import type { SourceFileRecord } from "@pocket-cto/domain";
import {
  extractBankAccountSummaryCsv,
  looksLikeBankAccountSummaryCsv,
  supportsBankAccountSummaryCsvSource,
  type BankAccountSummaryExtractionResult,
} from "./bank-account-summary-csv";
import {
  extractChartOfAccountsCsv,
  looksLikeChartOfAccountsCsv,
  supportsChartOfAccountsCsvSource,
  type ChartOfAccountsExtractionResult,
} from "./chart-of-accounts-csv";
import {
  extractContractMetadataCsv,
  looksLikeContractMetadataCsv,
  supportsContractMetadataCsvSource,
  type ContractMetadataExtractionResult,
} from "./contract-metadata-csv";
import {
  extractGeneralLedgerCsv,
  looksLikeGeneralLedgerCsv,
  supportsGeneralLedgerCsvSource,
  type GeneralLedgerExtractionResult,
} from "./general-ledger-csv";
import {
  extractPayablesAgingCsv,
  looksLikePayablesAgingCsv,
  supportsPayablesAgingCsvSource,
  type PayablesAgingExtractionResult,
} from "./payables-aging-csv";
import {
  extractReceivablesAgingCsv,
  looksLikeReceivablesAgingCsv,
  supportsReceivablesAgingCsvSource,
  type ReceivablesAgingExtractionResult,
} from "./receivables-aging-csv";
import {
  extractTrialBalanceCsv,
  looksLikeTrialBalanceCsv,
  supportsTrialBalanceCsvSource,
  type TrialBalanceExtractionResult,
} from "./trial-balance-csv";

export type FinanceTwinExtraction =
  | {
      extractorKey: "trial_balance_csv";
      trialBalance: TrialBalanceExtractionResult;
    }
  | {
      extractorKey: "bank_account_summary_csv";
      bankAccountSummary: BankAccountSummaryExtractionResult;
    }
  | {
      extractorKey: "receivables_aging_csv";
      receivablesAging: ReceivablesAgingExtractionResult;
    }
  | {
      extractorKey: "payables_aging_csv";
      payablesAging: PayablesAgingExtractionResult;
    }
  | {
      extractorKey: "contract_metadata_csv";
      contractMetadata: ContractMetadataExtractionResult;
    }
  | {
      extractorKey: "general_ledger_csv";
      generalLedger: GeneralLedgerExtractionResult;
    }
  | {
      extractorKey: "chart_of_accounts_csv";
      chartOfAccounts: ChartOfAccountsExtractionResult;
    };

export function supportsFinanceTwinSourceFile(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return (
    supportsTrialBalanceCsvSource(sourceFile) ||
    supportsGeneralLedgerCsvSource(sourceFile) ||
    supportsChartOfAccountsCsvSource(sourceFile) ||
    supportsBankAccountSummaryCsvSource(sourceFile) ||
    supportsReceivablesAgingCsvSource(sourceFile) ||
    supportsPayablesAgingCsvSource(sourceFile) ||
    supportsContractMetadataCsvSource(sourceFile)
  );
}

export function extractFinanceTwinSource(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): FinanceTwinExtraction | null {
  if (looksLikeGeneralLedgerCsv(input)) {
    return {
      extractorKey: "general_ledger_csv",
      generalLedger: extractGeneralLedgerCsv(input),
    };
  }

  if (looksLikeBankAccountSummaryCsv(input)) {
    return {
      extractorKey: "bank_account_summary_csv",
      bankAccountSummary: extractBankAccountSummaryCsv(input),
    };
  }

  if (looksLikePayablesAgingCsv(input)) {
    return {
      extractorKey: "payables_aging_csv",
      payablesAging: extractPayablesAgingCsv(input),
    };
  }

  if (looksLikeContractMetadataCsv(input)) {
    return {
      extractorKey: "contract_metadata_csv",
      contractMetadata: extractContractMetadataCsv(input),
    };
  }

  if (looksLikeReceivablesAgingCsv(input)) {
    return {
      extractorKey: "receivables_aging_csv",
      receivablesAging: extractReceivablesAgingCsv(input),
    };
  }

  if (looksLikeTrialBalanceCsv(input)) {
    return {
      extractorKey: "trial_balance_csv",
      trialBalance: extractTrialBalanceCsv(input),
    };
  }

  if (looksLikeChartOfAccountsCsv(input)) {
    return {
      extractorKey: "chart_of_accounts_csv",
      chartOfAccounts: extractChartOfAccountsCsv(input),
    };
  }

  return null;
}
