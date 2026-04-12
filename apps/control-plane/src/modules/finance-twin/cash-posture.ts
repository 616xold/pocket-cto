import {
  FinanceCashPostureViewSchema,
  type FinanceCashPostureCurrencyBucket,
  type FinanceCashPostureView,
  type FinanceCompanyRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulBankAccountSummarySlice,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import { formatMoney, parseMoney } from "./summary";
import type { FinanceBankAccountSummaryView } from "./repository";

export function buildFinanceCashPostureView(input: {
  company: FinanceCompanyRecord;
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulBankSummarySlice: FinanceLatestSuccessfulBankAccountSummarySlice;
  limitations: string[];
  summaries: FinanceBankAccountSummaryView[];
}): FinanceCashPostureView {
  const currencyBuckets = buildCurrencyBuckets(input.summaries);
  const diagnostics = buildCashPostureDiagnostics(currencyBuckets, input.summaries);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulBankSummarySlice.latestSyncRun === null) {
    limitations.push(
      "No successful bank-account-summary slice exists yet for this company.",
    );
  }

  limitations.push(
    "Cash posture is grouped by reported currency only; this route does not perform FX conversion or emit one company-wide cash total.",
  );
  limitations.push(
    "Statement-or-ledger, available, and unspecified balances are kept in separate totals and are not merged into one unlabeled cash figure.",
  );
  limitations.push(
    "This route summarizes persisted bank-account summary rows only; it does not include bank transaction detail or bank reconciliation state.",
  );

  return FinanceCashPostureViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulBankSummarySlice: input.latestSuccessfulBankSummarySlice,
    freshness: input.freshness,
    currencyBuckets,
    coverageSummary: {
      bankAccountCount: new Set(
        input.summaries.map((summary) => summary.bankAccount.id),
      ).size,
      reportedBalanceCount: input.summaries.length,
      statementOrLedgerBalanceCount: input.summaries.filter(
        (summary) => summary.summary.balanceType === "statement_or_ledger",
      ).length,
      availableBalanceCount: input.summaries.filter(
        (summary) => summary.summary.balanceType === "available",
      ).length,
      unspecifiedBalanceCount: input.summaries.filter(
        (summary) => summary.summary.balanceType === "unspecified",
      ).length,
      datedBalanceCount: input.summaries.filter(
        (summary) => summary.summary.asOfDate !== null,
      ).length,
      undatedBalanceCount: input.summaries.filter(
        (summary) => summary.summary.asOfDate === null,
      ).length,
      currencyBucketCount: currencyBuckets.length,
      mixedAsOfDateCurrencyBucketCount: currencyBuckets.filter(
        (bucket) => bucket.mixedAsOfDates,
      ).length,
    },
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildCurrencyBuckets(
  summaries: FinanceBankAccountSummaryView[],
): FinanceCashPostureCurrencyBucket[] {
  const buckets = new Map<
    string,
    {
      accountIds: Set<string>;
      accountDateState: Map<string, { hasDated: boolean; hasUndated: boolean }>;
      availableBalanceTotal: bigint;
      currency: string | null;
      explicitDates: Set<string>;
      statementOrLedgerBalanceTotal: bigint;
      unspecifiedBalanceTotal: bigint;
    }
  >();

  for (const summary of summaries) {
    const key = summary.summary.currencyCode ?? "__unknown__";
    const bucket =
      buckets.get(key) ?? {
        accountIds: new Set<string>(),
        accountDateState: new Map<
          string,
          { hasDated: boolean; hasUndated: boolean }
        >(),
        availableBalanceTotal: 0n,
        currency: summary.summary.currencyCode,
        explicitDates: new Set<string>(),
        statementOrLedgerBalanceTotal: 0n,
        unspecifiedBalanceTotal: 0n,
      };

    bucket.accountIds.add(summary.bankAccount.id);
    const accountDateState = bucket.accountDateState.get(summary.bankAccount.id) ?? {
      hasDated: false,
      hasUndated: false,
    };

    if (summary.summary.asOfDate) {
      accountDateState.hasDated = true;
      bucket.explicitDates.add(summary.summary.asOfDate);
    } else {
      accountDateState.hasUndated = true;
    }
    bucket.accountDateState.set(summary.bankAccount.id, accountDateState);

    switch (summary.summary.balanceType) {
      case "statement_or_ledger":
        bucket.statementOrLedgerBalanceTotal += parseMoney(
          summary.summary.balanceAmount,
        );
        break;
      case "available":
        bucket.availableBalanceTotal += parseMoney(summary.summary.balanceAmount);
        break;
      case "unspecified":
        bucket.unspecifiedBalanceTotal += parseMoney(summary.summary.balanceAmount);
        break;
    }

    buckets.set(key, bucket);
  }

  return Array.from(buckets.values())
    .sort((left, right) => {
      return (left.currency ?? "").localeCompare(right.currency ?? "");
    })
    .map((bucket) => {
      const explicitDates = Array.from(bucket.explicitDates).sort();
      const earliestAsOfDate = explicitDates[0] ?? null;
      const latestAsOfDate = explicitDates[explicitDates.length - 1] ?? null;
      const datedAccountCount = Array.from(bucket.accountDateState.values()).filter(
        (state) => state.hasDated,
      ).length;
      const undatedAccountCount = Array.from(bucket.accountDateState.values()).filter(
        (state) => !state.hasDated && state.hasUndated,
      ).length;

      return {
        currency: bucket.currency,
        statementOrLedgerBalanceTotal: formatMoney(
          bucket.statementOrLedgerBalanceTotal,
        ),
        availableBalanceTotal: formatMoney(bucket.availableBalanceTotal),
        unspecifiedBalanceTotal: formatMoney(bucket.unspecifiedBalanceTotal),
        accountCount: bucket.accountIds.size,
        datedAccountCount,
        undatedAccountCount,
        mixedAsOfDates: bucket.explicitDates.size > 1,
        earliestAsOfDate,
        latestAsOfDate,
      } satisfies FinanceCashPostureCurrencyBucket;
    });
}

function buildCashPostureDiagnostics(
  currencyBuckets: FinanceCashPostureCurrencyBucket[],
  summaries: FinanceBankAccountSummaryView[],
) {
  const diagnostics: string[] = [];

  if (summaries.some((summary) => summary.summary.currencyCode === null)) {
    diagnostics.push(
      "One or more persisted bank-summary balances are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (summaries.some((summary) => summary.summary.balanceType === "unspecified")) {
    diagnostics.push(
      "One or more persisted bank-summary balances came from ambiguous generic balance fields and remain in the unspecified bucket.",
    );
  }

  if (summaries.some((summary) => summary.summary.asOfDate === null)) {
    diagnostics.push(
      "One or more persisted bank-summary balances do not include an explicit as-of date.",
    );
  }

  if (currencyBuckets.some((bucket) => bucket.mixedAsOfDates)) {
    diagnostics.push(
      "One or more cash-posture currency buckets span multiple explicit as-of dates.",
    );
  }

  if (
    currencyBuckets.some(
      (bucket) => bucket.datedAccountCount > 0 && bucket.undatedAccountCount > 0,
    )
  ) {
    diagnostics.push(
      "One or more cash-posture currency buckets include both dated and undated bank balances.",
    );
  }

  return dedupeMessages(diagnostics);
}
