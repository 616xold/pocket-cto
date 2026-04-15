import type {
  FinanceCashPostureCurrencyBucket,
  FinanceCollectionsPostureCurrencyBucket,
  FinanceDiscoveryFreshnessPosture,
  FinanceObligationCalendarCurrencyBucket,
  FinancePayablesPostureCurrencyBucket,
  FinanceSpendPostureCurrencyBucket,
} from "@pocket-cto/domain";
import {
  buildRequiredReadGapLimitations,
  collectRequiredReadPosture,
} from "./required-read-posture";
import type { FinanceDiscoveryAnswerFormatterInput } from "./types";

export function buildFinanceDiscoveryFreshnessPosture(
  input: FinanceDiscoveryAnswerFormatterInput,
): FinanceDiscoveryFreshnessPosture {
  const requiredReadFreshness = collectRequiredReadPosture(input);

  if (requiredReadFreshness.length === 0) {
    return {
      state: "missing",
      reasonSummary: `No Finance Twin reads are configured yet for the ${input.family.displayLabel} family on ${input.question.companyKey}.`,
    };
  }

  const distinctStates = Array.from(
    new Set(requiredReadFreshness.map((entry) => entry.state)),
  );
  const state =
    distinctStates.length === 1 ? distinctStates[0]! : ("mixed" as const);
  const stateSummary =
    state === "mixed"
      ? `Required Finance Twin reads for ${input.family.displayLabel} do not agree for ${input.question.companyKey}.`
      : `All required Finance Twin reads for ${input.family.displayLabel} are ${state} for ${input.question.companyKey}.`;

  return {
    state,
    reasonSummary: `${stateSummary} ${requiredReadFreshness
      .map(
        (entry) => `${entry.label} is ${entry.state}: ${entry.reasonSummary}`,
      )
      .join(" ")}`,
  };
}

export function buildFinanceDiscoveryLimitations(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  const limitations = [
    ...buildRequiredReadGapLimitations(input),
    ...input.extraLimitations,
    ...readCoverageLimitations(input),
    ...Object.values(input.twinReads).flatMap(
      (view) => view?.limitations ?? [],
    ),
    ...input.missingWikiPages.map(
      (pageKey) =>
        `CFO Wiki page ${pageKey} is not available yet for ${input.question.companyKey}.`,
    ),
    ...input.family.baselineLimitations,
  ];

  return Array.from(
    new Set(limitations.filter((entry) => entry.trim().length > 0)),
  );
}

export function buildFinanceDiscoveryAnswerSummary(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  switch (input.question.questionKind) {
    case "cash_posture":
      return buildCashPostureSummary(input);
    case "collections_pressure":
      return buildCollectionsPressureSummary(input);
    case "payables_pressure":
      return buildPayablesPressureSummary(input);
    case "spend_posture":
      return buildSpendPostureSummary(input);
    case "obligation_calendar_review":
      return buildObligationCalendarSummary(input);
  }
}

function readCoverageLimitations(input: FinanceDiscoveryAnswerFormatterInput) {
  switch (input.question.questionKind) {
    case "cash_posture":
      return input.twinReads.cashPosture?.coverageSummary
        .reportedBalanceCount === 0
        ? [
            `No persisted bank-account summary rows are available yet for ${input.question.companyKey}.`,
          ]
        : [];
    case "collections_pressure":
      return input.twinReads.collectionsPosture?.coverageSummary.rowCount === 0
        ? [
            `No persisted receivables-aging rows are available yet for ${input.question.companyKey}.`,
          ]
        : [];
    case "payables_pressure":
      return input.twinReads.payablesPosture?.coverageSummary.rowCount === 0
        ? [
            `No persisted payables-aging rows are available yet for ${input.question.companyKey}.`,
          ]
        : [];
    case "spend_posture":
      return input.twinReads.spendPosture?.coverageSummary.rowCount === 0
        ? [
            `No persisted spend rows are available yet for ${input.question.companyKey}.`,
          ]
        : [];
    case "obligation_calendar_review":
      return input.twinReads.obligationCalendar?.coverageSummary
        .obligationCount === 0
        ? [
            `No persisted contract obligations are available yet for ${input.question.companyKey}.`,
          ]
        : [];
  }
}

function buildCashPostureSummary(input: FinanceDiscoveryAnswerFormatterInput) {
  const cashPosture = input.twinReads.cashPosture;

  if (!cashPosture) {
    return `No stored cash posture is available yet for ${input.question.companyKey}; the answer remains limited to missing-state posture and visible gaps.`;
  }

  if (
    cashPosture.coverageSummary.reportedBalanceCount === 0 ||
    cashPosture.currencyBuckets.length === 0
  ) {
    return `Stored cash posture for ${input.question.companyKey} is limited: no persisted bank-account summary rows are currently available for review.`;
  }

  return buildBucketSummarySentence({
    additionalBucketCount: cashPosture.currencyBuckets.length - 1,
    bucketSummary: buildCashBucketSummary(cashPosture.currencyBuckets[0]),
    companyKey: input.question.companyKey,
    count: cashPosture.coverageSummary.bankAccountCount,
    countLabel: "bank account",
    prefix: "Stored cash posture",
  });
}

function buildCollectionsPressureSummary(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  const collectionsPosture = input.twinReads.collectionsPosture;

  if (!collectionsPosture) {
    return `No stored collections pressure state is available yet for ${input.question.companyKey}; the answer remains limited to missing-state posture and visible gaps.`;
  }

  if (
    collectionsPosture.coverageSummary.rowCount === 0 ||
    collectionsPosture.currencyBuckets.length === 0
  ) {
    return `Stored collections pressure for ${input.question.companyKey} is limited: no persisted receivables-aging rows are currently available for review.`;
  }

  return buildBucketSummarySentence({
    additionalBucketCount: collectionsPosture.currencyBuckets.length - 1,
    bucketSummary: buildCollectionsBucketSummary(
      collectionsPosture.currencyBuckets[0],
    ),
    companyKey: input.question.companyKey,
    count: collectionsPosture.coverageSummary.customerCount,
    countLabel: "customer",
    prefix: "Stored collections pressure",
  });
}

function buildPayablesPressureSummary(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  const payablesPosture = input.twinReads.payablesPosture;

  if (!payablesPosture) {
    return `No stored payables pressure state is available yet for ${input.question.companyKey}; the answer remains limited to missing-state posture and visible gaps.`;
  }

  if (
    payablesPosture.coverageSummary.rowCount === 0 ||
    payablesPosture.currencyBuckets.length === 0
  ) {
    return `Stored payables pressure for ${input.question.companyKey} is limited: no persisted payables-aging rows are currently available for review.`;
  }

  return buildBucketSummarySentence({
    additionalBucketCount: payablesPosture.currencyBuckets.length - 1,
    bucketSummary: buildPayablesBucketSummary(
      payablesPosture.currencyBuckets[0],
    ),
    companyKey: input.question.companyKey,
    count: payablesPosture.coverageSummary.vendorCount,
    countLabel: "vendor",
    prefix: "Stored payables pressure",
  });
}

function buildSpendPostureSummary(input: FinanceDiscoveryAnswerFormatterInput) {
  const spendPosture = input.twinReads.spendPosture;

  if (!spendPosture) {
    return `No stored spend posture is available yet for ${input.question.companyKey}; the answer remains limited to missing-state posture and visible gaps.`;
  }

  if (
    spendPosture.coverageSummary.rowCount === 0 ||
    spendPosture.currencyBuckets.length === 0
  ) {
    return `Stored spend posture for ${input.question.companyKey} is limited: no persisted spend rows are currently available for review.`;
  }

  return buildBucketSummarySentence({
    additionalBucketCount: spendPosture.currencyBuckets.length - 1,
    bucketSummary: buildSpendBucketSummary(spendPosture.currencyBuckets[0]),
    companyKey: input.question.companyKey,
    count: spendPosture.coverageSummary.rowCount,
    countLabel: "spend row",
    prefix: "Stored spend posture",
  });
}

function buildObligationCalendarSummary(
  input: FinanceDiscoveryAnswerFormatterInput,
) {
  const obligationCalendar = input.twinReads.obligationCalendar;

  if (!obligationCalendar) {
    return `No stored obligation calendar is available yet for ${input.question.companyKey}; the answer remains limited to missing-state posture and visible gaps.`;
  }

  if (
    obligationCalendar.coverageSummary.obligationCount === 0 ||
    obligationCalendar.currencyBuckets.length === 0
  ) {
    return `Stored obligation calendar review for ${input.question.companyKey} is limited: no persisted contract obligations are currently available for review.`;
  }

  const firstBucket = obligationCalendar.currencyBuckets[0];
  const additionalBucketCount = obligationCalendar.currencyBuckets.length - 1;
  const additionalBucketSummary =
    additionalBucketCount > 0
      ? ` ${additionalBucketCount} additional currency bucket${pluralize(
          additionalBucketCount,
        )} ${additionalBucketCount === 1 ? "is" : "are"} also present.`
      : "";

  return `Stored obligation calendar review for ${input.question.companyKey} covers ${obligationCalendar.coverageSummary.contractCount} contract${pluralize(
    obligationCalendar.coverageSummary.contractCount,
  )} and ${obligationCalendar.coverageSummary.obligationCount} upcoming obligation${pluralize(
    obligationCalendar.coverageSummary.obligationCount,
  )} across ${obligationCalendar.currencyBuckets.length} currency bucket${pluralize(
    obligationCalendar.currencyBuckets.length,
  )}: ${buildObligationBucketSummary(firstBucket)}.${additionalBucketSummary}`;
}

function buildBucketSummarySentence(input: {
  additionalBucketCount: number;
  bucketSummary: string;
  companyKey: string;
  count: number;
  countLabel: string;
  prefix: string;
}) {
  const additionalBucketSummary =
    input.additionalBucketCount > 0
      ? ` ${input.additionalBucketCount} additional currency bucket${pluralize(
          input.additionalBucketCount,
        )} ${input.additionalBucketCount === 1 ? "is" : "are"} also present.`
      : "";

  return `${input.prefix} for ${input.companyKey} covers ${input.count} ${input.countLabel}${pluralize(
    input.count,
  )} across ${input.additionalBucketCount + 1} currency bucket${pluralize(
    input.additionalBucketCount + 1,
  )}: ${input.bucketSummary}.${additionalBucketSummary}`;
}

function buildCashBucketSummary(
  bucket: FinanceCashPostureCurrencyBucket | undefined,
) {
  if (!bucket) {
    return "no persisted bank-account summary rows are currently available for review";
  }

  const totals = [
    `statement or ledger ${bucket.statementOrLedgerBalanceTotal}`,
    `available ${bucket.availableBalanceTotal}`,
    `unspecified ${bucket.unspecifiedBalanceTotal}`,
  ];

  return `${bucket.currency ?? "Unknown currency"} ${totals.join(", ")}${readDateSummary(
    bucket.earliestAsOfDate,
    bucket.latestAsOfDate,
  )}`;
}

function buildCollectionsBucketSummary(
  bucket: FinanceCollectionsPostureCurrencyBucket | undefined,
) {
  if (!bucket) {
    return "no persisted receivables-aging rows are currently available for review";
  }

  return `${bucket.currency ?? "Unknown currency"} total receivables ${bucket.totalReceivables}, current ${bucket.currentBucketTotal}, past due ${bucket.pastDueBucketTotal}${readDateSummary(
    bucket.earliestAsOfDate,
    bucket.latestAsOfDate,
  )}`;
}

function buildPayablesBucketSummary(
  bucket: FinancePayablesPostureCurrencyBucket | undefined,
) {
  if (!bucket) {
    return "no persisted payables-aging rows are currently available for review";
  }

  return `${bucket.currency ?? "Unknown currency"} total payables ${bucket.totalPayables}, current ${bucket.currentBucketTotal}, past due ${bucket.pastDueBucketTotal}${readDateSummary(
    bucket.earliestAsOfDate,
    bucket.latestAsOfDate,
  )}`;
}

function buildSpendBucketSummary(
  bucket: FinanceSpendPostureCurrencyBucket | undefined,
) {
  if (!bucket) {
    return "no persisted spend rows are currently available for review";
  }

  return `${bucket.currency ?? "Unknown currency"} reported ${bucket.reportedAmountTotal}, posted ${bucket.postedAmountTotal}, transaction ${bucket.transactionAmountTotal}${readDateSummary(
    bucket.earliestPostedDate ?? bucket.earliestTransactionDate,
    bucket.latestPostedDate ?? bucket.latestTransactionDate,
  )}`;
}

function buildObligationBucketSummary(
  bucket: FinanceObligationCalendarCurrencyBucket | undefined,
) {
  if (!bucket) {
    return "no persisted contract obligations are currently available for review";
  }

  return `${bucket.currency ?? "Unknown currency"} ${bucket.obligationCount} obligation${pluralize(
    bucket.obligationCount,
  )} with explicit amount total ${bucket.explicitAmountTotal}${readDateSummary(
    bucket.earliestDueDate,
    bucket.latestDueDate,
  )}`;
}

function readDateSummary(
  earliestDate: string | null,
  latestDate: string | null,
) {
  if (!earliestDate && !latestDate) {
    return "";
  }

  if (earliestDate && earliestDate === latestDate) {
    return ` (as of ${earliestDate})`;
  }

  if (earliestDate && latestDate) {
    return ` (as of ${earliestDate} to ${latestDate})`;
  }

  return "";
}

function pluralize(count: number) {
  return count === 1 ? "" : "s";
}
