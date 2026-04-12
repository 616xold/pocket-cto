import {
  FinanceReceivablesAgingViewSchema,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulReceivablesAgingSlice,
  type FinanceReceivablesAgingBucketKey,
  type FinanceReceivablesAgingInventoryRow,
  type FinanceReceivablesAgingSliceSummary,
  type FinanceReceivablesAgingView,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import {
  compareReceivablesAgingBucketKeys,
  isReceivablesAgingPartialRollupBucketKey,
} from "./receivables-aging-buckets";
import { formatMoney, parseMoney } from "./summary";
import type { FinanceReceivablesAgingRowView } from "./repository";

export function buildReceivablesAgingSliceSummary(input: {
  reportedBucketKeys: FinanceReceivablesAgingBucketKey[];
  rows: FinanceReceivablesAgingRowView[];
}): FinanceReceivablesAgingSliceSummary {
  const currencyCodes = new Set<string>();

  for (const row of input.rows) {
    if (row.receivablesAgingRow.currencyCode) {
      currencyCodes.add(row.receivablesAgingRow.currencyCode);
    }
  }

  return {
    customerCount: new Set(input.rows.map((row) => row.customer.id)).size,
    rowCount: input.rows.length,
    datedRowCount: input.rows.filter(
      (row) => row.receivablesAgingRow.asOfDate !== null,
    ).length,
    undatedRowCount: input.rows.filter(
      (row) => row.receivablesAgingRow.asOfDate === null,
    ).length,
    currencyCount: currencyCodes.size,
    reportedBucketKeys: input.reportedBucketKeys
      .slice()
      .sort(compareReceivablesAgingBucketKeys),
  };
}

export function buildFinanceReceivablesAgingView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulReceivablesAgingSlice;
  limitations: string[];
  rows: FinanceReceivablesAgingRowView[];
}): FinanceReceivablesAgingView {
  const rows = buildInventoryRows(input.rows);
  const diagnostics = buildReceivablesAgingDiagnostics(input.rows);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulSlice.latestSyncRun === null) {
    limitations.push(
      "No successful receivables-aging slice exists yet for this company.",
    );
  }

  limitations.push(
    "This route only exposes persisted receivables-aging rows from the latest successful receivables-aging slice; it does not include invoice-level detail, expected collection timing, DSO, or reserve logic.",
  );
  limitations.push(
    "Exact aging bucket labels are preserved from the source-backed extractor and are not silently upgraded into a universal bucket scheme.",
  );
  limitations.push(
    "Reported receivables amounts remain grouped by reported currency; this route does not perform FX conversion or emit one company-wide receivables total.",
  );

  return FinanceReceivablesAgingViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulSlice: input.latestSuccessfulSlice,
    freshness: input.freshness,
    customerCount: new Set(input.rows.map((row) => row.customer.id)).size,
    rows,
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildInventoryRows(
  rows: FinanceReceivablesAgingRowView[],
): FinanceReceivablesAgingInventoryRow[] {
  return rows
    .slice()
    .sort((left, right) => {
      return (
        left.customer.customerLabel.localeCompare(right.customer.customerLabel) ||
        (left.receivablesAgingRow.currencyCode ?? "").localeCompare(
          right.receivablesAgingRow.currencyCode ?? "",
        ) ||
        (left.receivablesAgingRow.asOfDate ?? "").localeCompare(
          right.receivablesAgingRow.asOfDate ?? "",
        ) ||
        left.receivablesAgingRow.lineNumber - right.receivablesAgingRow.lineNumber
      );
    })
    .map((row) => ({
      customer: row.customer,
      receivablesAgingRow: row.receivablesAgingRow,
      reportedTotalAmount: readExactBucketAmount(row, "total"),
      lineageRef: {
        targetKind: "receivables_aging_row",
        targetId: row.receivablesAgingRow.id,
        syncRunId: row.receivablesAgingRow.syncRunId,
      },
    }));
}

function buildReceivablesAgingDiagnostics(rows: FinanceReceivablesAgingRowView[]) {
  const diagnostics: string[] = [];
  const explicitDates = new Set<string>();

  for (const row of rows) {
    if (row.receivablesAgingRow.asOfDate) {
      explicitDates.add(row.receivablesAgingRow.asOfDate);
    }
  }

  if (rows.some((row) => row.receivablesAgingRow.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted receivables-aging rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (rows.some((row) => row.receivablesAgingRow.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted receivables-aging rows do not include an explicit as-of date.",
    );
  }

  if (explicitDates.size > 1) {
    diagnostics.push(
      "The latest successful receivables-aging slice spans multiple explicit as-of dates.",
    );
  }

  if (
    rows.some((row) =>
      row.receivablesAgingRow.bucketValues.some((bucketValue) =>
        isReceivablesAgingPartialRollupBucketKey(bucketValue.bucketKey),
      ),
    )
  ) {
    diagnostics.push(
      "One or more persisted receivables-aging rows include partial rollup buckets such as over_90 or over_120 that do not describe the full past-due balance on their own.",
    );
  }

  return dedupeMessages(diagnostics);
}

function readExactBucketAmount(
  row: FinanceReceivablesAgingRowView,
  bucketKey: FinanceReceivablesAgingBucketKey,
) {
  const bucketValue = row.receivablesAgingRow.bucketValues.find(
    (entry) => entry.bucketKey === bucketKey,
  );

  return bucketValue ? formatMoney(parseMoney(bucketValue.amount)) : null;
}
