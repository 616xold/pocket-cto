import type { SourceFileRecord } from "@pocket-cto/domain";
import {
  extractChartOfAccountsCsv,
  looksLikeChartOfAccountsCsv,
  supportsChartOfAccountsCsvSource,
  type ChartOfAccountsExtractionResult,
} from "./chart-of-accounts-csv";
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
      extractorKey: "chart_of_accounts_csv";
      chartOfAccounts: ChartOfAccountsExtractionResult;
    };

export function supportsFinanceTwinSourceFile(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  return (
    supportsTrialBalanceCsvSource(sourceFile) ||
    supportsChartOfAccountsCsvSource(sourceFile)
  );
}

export function extractFinanceTwinSource(input: {
  body: Buffer;
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">;
}): FinanceTwinExtraction | null {
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
