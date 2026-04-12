import {
  FinanceSpendItemsViewSchema,
  type FinanceCardExpenseSliceSummary,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulCardExpenseSlice,
  type FinanceSpendItemsView,
  type FinanceSpendRowRecord,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";

export function buildCardExpenseSliceSummary(input: {
  rows: FinanceSpendRowRecord[];
}): FinanceCardExpenseSliceSummary {
  const currencyCodes = new Set<string>();

  for (const row of input.rows) {
    if (row.currencyCode) {
      currencyCodes.add(row.currencyCode);
    }
  }

  return {
    rowCount: input.rows.length,
    datedRowCount: input.rows.filter(hasAnyExplicitDate).length,
    undatedRowCount: input.rows.filter((row) => !hasAnyExplicitDate(row)).length,
    currencyCount: currencyCodes.size,
    rowsWithExplicitRowIdentityCount: input.rows.filter(
      (row) => row.explicitRowIdentity !== null,
    ).length,
    rowsWithReportedAmountCount: input.rows.filter((row) => row.amount !== null)
      .length,
    rowsWithPostedAmountCount: input.rows.filter(
      (row) => row.postedAmount !== null,
    ).length,
    rowsWithTransactionAmountCount: input.rows.filter(
      (row) => row.transactionAmount !== null,
    ).length,
    rowsWithTransactionDateCount: input.rows.filter(
      (row) => row.transactionDate !== null,
    ).length,
    rowsWithPostedDateCount: input.rows.filter((row) => row.postedDate !== null)
      .length,
  };
}

export function buildFinanceSpendItemsView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulCardExpenseSlice;
  limitations: string[];
  rows: FinanceSpendRowRecord[];
}): FinanceSpendItemsView {
  const diagnostics = buildDiagnostics(input.rows);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulSlice.latestSyncRun === null) {
    limitations.push(
      "No successful card-expense slice exists yet for this company.",
    );
  }

  limitations.push(
    "This route only exposes persisted explicit spend-export fields from the latest successful card-expense slice; it does not infer spend from the general ledger, vague documents, or ingest receipt previews.",
  );
  limitations.push(
    "Generic amount, date, and weak status helpers stay source-labeled in this slice: amount is not upgraded into posted or settled spend, and status, state, reimbursable, or pending are not upgraded into approval, reimbursement, or policy conclusions.",
  );
  limitations.push(
    "This route does not add receipt parsing, policy scoring, reimbursement inference, accrual logic, or payment forecasting.",
  );

  return FinanceSpendItemsViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulSlice: input.latestSuccessfulSlice,
    freshness: input.freshness,
    rowCount: input.rows.length,
    rows: input.rows.map((spendRow) => ({
      spendRow,
      lineageRef: {
        targetKind: "spend_row",
        targetId: spendRow.id,
        syncRunId: spendRow.syncRunId,
      },
    })),
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildDiagnostics(rows: FinanceSpendRowRecord[]) {
  const diagnostics: string[] = [];

  if (rows.some((row) => row.explicitRowIdentity === null)) {
    diagnostics.push(
      "One or more persisted spend rows do not include an explicit row identity, so those rows remain separate line-backed records and are not deduped heuristically.",
    );
  }

  if (rows.some((row) => row.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted spend rows do not include an explicit currency code.",
    );
  }

  if (rows.some((row) => !hasAnyExplicitDate(row))) {
    diagnostics.push(
      "One or more persisted spend rows do not include any explicit source date.",
    );
  }

  if (
    rows.some(
      (row) =>
        row.amount !== null &&
        (row.postedAmount !== null || row.transactionAmount !== null),
    )
  ) {
    diagnostics.push(
      "One or more persisted spend rows include both generic amount and more specific amount fields, so each amount stays separated by its explicit source label.",
    );
  }

  return dedupeMessages(diagnostics);
}

function hasAnyExplicitDate(row: FinanceSpendRowRecord) {
  return (
    row.transactionDate !== null ||
    row.postedDate !== null ||
    row.expenseDate !== null ||
    row.reportDate !== null ||
    row.asOfDate !== null
  );
}
