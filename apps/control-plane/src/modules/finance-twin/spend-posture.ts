import {
  FinanceSpendPostureViewSchema,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulCardExpenseSlice,
  type FinanceSpendPostureCurrencyBucket,
  type FinanceSpendPostureView,
  type FinanceSpendRowRecord,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import { formatMoney, parseMoney } from "./summary";

export function buildFinanceSpendPostureView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulCardExpenseSlice: FinanceLatestSuccessfulCardExpenseSlice;
  limitations: string[];
  rows: FinanceSpendRowRecord[];
}): FinanceSpendPostureView {
  const currencyBuckets = buildCurrencyBuckets(input.rows);
  const diagnostics = buildDiagnostics(input.rows, currencyBuckets);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulCardExpenseSlice.latestSyncRun === null) {
    limitations.push(
      "No successful card-expense slice exists yet for this company.",
    );
  }

  limitations.push(
    "Spend posture stays grouped by reported currency only; this route does not perform FX conversion or emit one company-wide spend total.",
  );
  limitations.push(
    "reportedAmountTotal, postedAmountTotal, and transactionAmountTotal stay separated by their explicit source labels; this route does not silently upgrade generic amount into posted, settled, reimbursable, or forecast spend.",
  );
  limitations.push(
    "Mixed or missing source dates remain explicit in the coverage and bucket diagnostics; this route does not claim one unified company-wide spend date or one fake as-of date.",
  );
  limitations.push(
    "Weak status helpers stay weakly labeled here. This route does not infer approval state, reimbursement state, policy violations, fraud, accrual logic, or payment forecasts.",
  );

  return FinanceSpendPostureViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulCardExpenseSlice: input.latestSuccessfulCardExpenseSlice,
    freshness: input.freshness,
    currencyBuckets,
    coverageSummary: {
      rowCount: input.rows.length,
      currencyBucketCount: currencyBuckets.length,
      datedRowCount: input.rows.filter(hasAnyExplicitDate).length,
      undatedRowCount: input.rows.filter((row) => !hasAnyExplicitDate(row)).length,
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
      rowsWithMerchantOrVendorCount: input.rows.filter(
        (row) => row.merchantLabel !== null || row.vendorLabel !== null,
      ).length,
      rowsWithEmployeeOrCardholderCount: input.rows.filter(
        (row) => row.employeeLabel !== null || row.cardholderLabel !== null,
      ).length,
    },
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildCurrencyBuckets(
  rows: FinanceSpendRowRecord[],
): FinanceSpendPostureCurrencyBucket[] {
  const buckets = new Map<
    string,
    {
      currency: string | null;
      datedRowCount: number;
      postedDates: Set<string>;
      postedAmountTotal: bigint;
      reportedAmountTotal: bigint;
      rowCount: number;
      transactionAmountTotal: bigint;
      transactionDates: Set<string>;
      undatedRowCount: number;
    }
  >();

  for (const row of rows) {
    const currencyKey = row.currencyCode ?? "__unknown__";
    const bucket =
      buckets.get(currencyKey) ?? {
        currency: row.currencyCode,
        datedRowCount: 0,
        postedDates: new Set<string>(),
        postedAmountTotal: 0n,
        reportedAmountTotal: 0n,
        rowCount: 0,
        transactionAmountTotal: 0n,
        transactionDates: new Set<string>(),
        undatedRowCount: 0,
      };

    bucket.rowCount += 1;
    if (hasAnyExplicitDate(row)) {
      bucket.datedRowCount += 1;
    } else {
      bucket.undatedRowCount += 1;
    }
    if (row.amount !== null) {
      bucket.reportedAmountTotal += parseMoney(row.amount);
    }
    if (row.postedAmount !== null) {
      bucket.postedAmountTotal += parseMoney(row.postedAmount);
    }
    if (row.transactionAmount !== null) {
      bucket.transactionAmountTotal += parseMoney(row.transactionAmount);
    }
    if (row.postedDate !== null) {
      bucket.postedDates.add(row.postedDate);
    }
    if (row.transactionDate !== null) {
      bucket.transactionDates.add(row.transactionDate);
    }

    buckets.set(currencyKey, bucket);
  }

  return Array.from(buckets.values())
    .sort((left, right) => (left.currency ?? "").localeCompare(right.currency ?? ""))
    .map((bucket) => {
      const postedDates = Array.from(bucket.postedDates).sort();
      const transactionDates = Array.from(bucket.transactionDates).sort();

      return {
        currency: bucket.currency,
        reportedAmountTotal: formatMoney(bucket.reportedAmountTotal),
        postedAmountTotal: formatMoney(bucket.postedAmountTotal),
        transactionAmountTotal: formatMoney(bucket.transactionAmountTotal),
        rowCount: bucket.rowCount,
        datedRowCount: bucket.datedRowCount,
        undatedRowCount: bucket.undatedRowCount,
        mixedPostedDates: bucket.postedDates.size > 1,
        mixedTransactionDates: bucket.transactionDates.size > 1,
        earliestPostedDate: postedDates[0] ?? null,
        latestPostedDate: postedDates[postedDates.length - 1] ?? null,
        earliestTransactionDate: transactionDates[0] ?? null,
        latestTransactionDate: transactionDates[transactionDates.length - 1] ?? null,
      } satisfies FinanceSpendPostureCurrencyBucket;
    });
}

function buildDiagnostics(
  rows: FinanceSpendRowRecord[],
  currencyBuckets: FinanceSpendPostureCurrencyBucket[],
) {
  const diagnostics: string[] = [];

  if (rows.some((row) => row.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted spend rows are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (rows.some((row) => !hasAnyExplicitDate(row))) {
    diagnostics.push(
      "One or more persisted spend rows do not include any explicit source date.",
    );
  }

  if (currencyBuckets.some((bucket) => bucket.mixedPostedDates)) {
    diagnostics.push(
      "One or more spend-posture currency buckets span multiple explicit posted dates.",
    );
  }

  if (currencyBuckets.some((bucket) => bucket.mixedTransactionDates)) {
    diagnostics.push(
      "One or more spend-posture currency buckets span multiple explicit transaction dates.",
    );
  }

  if (
    currencyBuckets.some(
      (bucket) => bucket.datedRowCount > 0 && bucket.undatedRowCount > 0,
    )
  ) {
    diagnostics.push(
      "One or more spend-posture currency buckets include both dated and undated spend rows.",
    );
  }

  if (
    rows.some(
      (row) =>
        row.amount !== null &&
        row.postedAmount === null &&
        row.transactionAmount === null,
    )
  ) {
    diagnostics.push(
      "One or more persisted spend rows only expose a generic amount field, so those values stay in reportedAmountTotal rather than being upgraded into posted or transaction totals.",
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
