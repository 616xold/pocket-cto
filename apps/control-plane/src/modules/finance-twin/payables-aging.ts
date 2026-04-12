import {
  FinancePayablesAgingViewSchema,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulPayablesAgingSlice,
  type FinancePayablesAgingBucketKey,
  type FinancePayablesAgingInventoryRow,
  type FinancePayablesAgingSliceSummary,
  type FinancePayablesAgingView,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import {
  comparePayablesAgingBucketKeys,
  isPayablesAgingPartialRollupBucketKey,
} from "./payables-aging-buckets";
import { formatMoney, parseMoney } from "./summary";
import type { FinancePayablesAgingRowView } from "./repository";

export function buildPayablesAgingSliceSummary(input: {
  reportedBucketKeys: FinancePayablesAgingBucketKey[];
  rows: FinancePayablesAgingRowView[];
}): FinancePayablesAgingSliceSummary {
  const currencyCodes = new Set<string>();

  for (const row of input.rows) {
    if (row.payablesAgingRow.currencyCode) {
      currencyCodes.add(row.payablesAgingRow.currencyCode);
    }
  }

  return {
    vendorCount: new Set(input.rows.map((row) => row.vendor.id)).size,
    rowCount: input.rows.length,
    datedRowCount: input.rows.filter(
      (row) => row.payablesAgingRow.asOfDate !== null,
    ).length,
    undatedRowCount: input.rows.filter(
      (row) => row.payablesAgingRow.asOfDate === null,
    ).length,
    currencyCount: currencyCodes.size,
    reportedBucketKeys: input.reportedBucketKeys
      .slice()
      .sort(comparePayablesAgingBucketKeys),
  };
}

export function buildFinancePayablesAgingView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulPayablesAgingSlice;
  limitations: string[];
  rows: FinancePayablesAgingRowView[];
}): FinancePayablesAgingView {
  const rows = buildInventoryRows(input.rows);
  const diagnostics = buildPayablesAgingDiagnostics(input.rows);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulSlice.latestSyncRun === null) {
    limitations.push(
      "No successful payables-aging slice exists yet for this company.",
    );
  }

  limitations.push(
    "This route only exposes persisted payables-aging rows from the latest successful payables-aging slice; it does not include bill-level detail, expected payment timing, DPO, reserve logic, or accrual logic.",
  );
  limitations.push(
    "Exact aging bucket labels are preserved from the source-backed extractor and are not silently upgraded into a universal bucket scheme.",
  );
  limitations.push(
    "Reported payable amounts remain grouped by reported currency; this route does not perform FX conversion or emit one company-wide payables total.",
  );

  return FinancePayablesAgingViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulSlice: input.latestSuccessfulSlice,
    freshness: input.freshness,
    vendorCount: new Set(input.rows.map((row) => row.vendor.id)).size,
    rows,
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildInventoryRows(
  rows: FinancePayablesAgingRowView[],
): FinancePayablesAgingInventoryRow[] {
  return rows
    .slice()
    .sort((left, right) => {
      return (
        left.vendor.vendorLabel.localeCompare(right.vendor.vendorLabel) ||
        (left.payablesAgingRow.currencyCode ?? "").localeCompare(
          right.payablesAgingRow.currencyCode ?? "",
        ) ||
        (left.payablesAgingRow.asOfDate ?? "").localeCompare(
          right.payablesAgingRow.asOfDate ?? "",
        ) ||
        left.payablesAgingRow.lineNumber - right.payablesAgingRow.lineNumber
      );
    })
    .map((row) => ({
      vendor: row.vendor,
      payablesAgingRow: row.payablesAgingRow,
      reportedTotalAmount: readExactBucketAmount(row, "total"),
      lineageRef: {
        targetKind: "payables_aging_row",
        targetId: row.payablesAgingRow.id,
        syncRunId: row.payablesAgingRow.syncRunId,
      },
    }));
}

function buildPayablesAgingDiagnostics(rows: FinancePayablesAgingRowView[]) {
  const diagnostics: string[] = [];
  const explicitDates = new Set<string>();

  for (const row of rows) {
    if (row.payablesAgingRow.asOfDate) {
      explicitDates.add(row.payablesAgingRow.asOfDate);
    }
  }

  if (rows.some((row) => row.payablesAgingRow.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted payables-aging rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (rows.some((row) => row.payablesAgingRow.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted payables-aging rows do not include an explicit as-of date.",
    );
  }

  if (explicitDates.size > 1) {
    diagnostics.push(
      "The latest successful payables-aging slice spans multiple explicit as-of dates.",
    );
  }

  if (
    rows.some((row) =>
      row.payablesAgingRow.bucketValues.some((bucketValue) =>
        isPayablesAgingPartialRollupBucketKey(bucketValue.bucketKey),
      ),
    )
  ) {
    diagnostics.push(
      "One or more persisted payables-aging rows include partial rollup buckets such as over_90 or over_120 that do not describe the full past-due balance on their own.",
    );
  }

  return dedupeMessages(diagnostics);
}

function readExactBucketAmount(
  row: FinancePayablesAgingRowView,
  bucketKey: FinancePayablesAgingBucketKey,
) {
  const bucketValue = row.payablesAgingRow.bucketValues.find(
    (entry) => entry.bucketKey === bucketKey,
  );

  return bucketValue ? formatMoney(parseMoney(bucketValue.amount)) : null;
}
