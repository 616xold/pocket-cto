import {
  FinanceObligationCalendarViewSchema,
  type FinanceCompanyRecord,
  type FinanceContractRecord,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulContractMetadataSlice,
  type FinanceObligationCalendarCurrencyBucket,
  type FinanceObligationCalendarRow,
  type FinanceObligationCalendarView,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import type { FinanceContractObligationView } from "./repository";
import { formatMoney, parseMoney } from "./summary";

export function buildFinanceObligationCalendarView(input: {
  company: FinanceCompanyRecord;
  contracts: FinanceContractRecord[];
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulContractMetadataSlice: FinanceLatestSuccessfulContractMetadataSlice;
  limitations: string[];
  obligations: FinanceContractObligationView[];
}): FinanceObligationCalendarView {
  const upcomingObligations = buildRows(input.obligations);
  const currencyBuckets = buildCurrencyBuckets(input.obligations);
  const diagnostics = buildDiagnostics(input.contracts, input.obligations);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulContractMetadataSlice.latestSyncRun === null) {
    limitations.push(
      "No successful contract-metadata slice exists yet for this company.",
    );
  }

  limitations.push(
    "Only explicit date-bearing fields from the persisted contract-metadata slice become obligation rows; missing dates do not create inferred renewals, notice deadlines, expirations, or scheduled payments.",
  );
  limitations.push(
    "The upcomingObligations list is a chronological list of explicit date-bearing contract facts from the latest successful contract-metadata slice; it is not a forecast, legal interpretation, or clause parser.",
  );
  limitations.push(
    "Scheduled-payment amounts only use explicit payment_amount fields; generic contract amount fields are preserved separately on contract inventory rows and are not treated as payment forecasts.",
  );
  limitations.push(
    "Obligation amounts stay grouped by reported currency only; this route does not perform FX conversion or emit one company-wide obligation total.",
  );
  limitations.push(
    "Generic end_date fields remain labeled as end_date rather than being upgraded into expiration semantics.",
  );

  return FinanceObligationCalendarViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulContractMetadataSlice:
      input.latestSuccessfulContractMetadataSlice,
    freshness: input.freshness,
    upcomingObligations,
    currencyBuckets,
    coverageSummary: {
      contractCount: input.contracts.length,
      obligationCount: input.obligations.length,
      currencyBucketCount: currencyBuckets.length,
      datedContractCount: input.contracts.filter(
        (contract) => contract.knownAsOfDates.length > 0,
      ).length,
      undatedContractCount: input.contracts.filter(
        (contract) => contract.knownAsOfDates.length === 0,
      ).length,
      obligationsWithExplicitAmountCount: input.obligations.filter(
        (obligation) => obligation.obligation.amount !== null,
      ).length,
      obligationsWithoutExplicitAmountCount: input.obligations.filter(
        (obligation) => obligation.obligation.amount === null,
      ).length,
      contractsWithRenewalDateCount: input.contracts.filter(
        (contract) => contract.renewalDate !== null,
      ).length,
      contractsWithExpirationDateCount: input.contracts.filter(
        (contract) => contract.expirationDate !== null,
      ).length,
      contractsWithEndDateCount: input.contracts.filter(
        (contract) => contract.endDate !== null,
      ).length,
      contractsWithNoticeDeadlineCount: input.contracts.filter(
        (contract) => contract.noticeDeadline !== null,
      ).length,
      contractsWithScheduledPaymentDateCount: input.contracts.filter(
        (contract) => contract.nextPaymentDate !== null,
      ).length,
    },
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildRows(
  obligations: FinanceContractObligationView[],
): FinanceObligationCalendarRow[] {
  return obligations
    .slice()
    .sort((left, right) => {
      return (
        left.obligation.dueDate.localeCompare(right.obligation.dueDate) ||
        left.contract.contractLabel.localeCompare(right.contract.contractLabel) ||
        left.obligation.lineNumber - right.obligation.lineNumber
      );
    })
    .map((entry) => ({
      contract: {
        contractId: entry.contract.id,
        contractLabel: entry.contract.contractLabel,
        externalContractId: entry.contract.externalContractId,
        counterpartyLabel: entry.contract.counterpartyLabel,
        knownAsOfDates: entry.contract.knownAsOfDates,
        unknownAsOfObservationCount: entry.contract.unknownAsOfObservationCount,
      },
      obligationType: entry.obligation.obligationType,
      dueDate: entry.obligation.dueDate,
      amount: entry.obligation.amount,
      currency: entry.obligation.currencyCode,
      sourceField: entry.obligation.sourceField,
      lineageRef: {
        targetKind: "contract_obligation",
        targetId: entry.obligation.id,
        syncRunId: entry.obligation.syncRunId,
      },
    }));
}

function buildCurrencyBuckets(
  obligations: FinanceContractObligationView[],
): FinanceObligationCalendarCurrencyBucket[] {
  const buckets = new Map<
    string,
    {
      currency: string | null;
      earliestDueDate: string | null;
      explicitAmountTotal: bigint;
      latestDueDate: string | null;
      obligationCount: number;
      obligationsWithExplicitAmountCount: number;
      obligationsWithoutExplicitAmountCount: number;
    }
  >();

  for (const entry of obligations) {
    const currencyKey = entry.obligation.currencyCode ?? "__unknown__";
    const bucket =
      buckets.get(currencyKey) ?? {
        currency: entry.obligation.currencyCode,
        earliestDueDate: null,
        explicitAmountTotal: 0n,
        latestDueDate: null,
        obligationCount: 0,
        obligationsWithExplicitAmountCount: 0,
        obligationsWithoutExplicitAmountCount: 0,
      };

    bucket.obligationCount += 1;
    if (
      bucket.earliestDueDate === null ||
      entry.obligation.dueDate < bucket.earliestDueDate
    ) {
      bucket.earliestDueDate = entry.obligation.dueDate;
    }
    if (
      bucket.latestDueDate === null ||
      entry.obligation.dueDate > bucket.latestDueDate
    ) {
      bucket.latestDueDate = entry.obligation.dueDate;
    }
    if (entry.obligation.amount !== null) {
      bucket.obligationsWithExplicitAmountCount += 1;
      bucket.explicitAmountTotal += parseMoney(entry.obligation.amount);
    } else {
      bucket.obligationsWithoutExplicitAmountCount += 1;
    }

    buckets.set(currencyKey, bucket);
  }

  return Array.from(buckets.values())
    .sort((left, right) => (left.currency ?? "").localeCompare(right.currency ?? ""))
    .map((bucket) => ({
      currency: bucket.currency,
      obligationCount: bucket.obligationCount,
      obligationsWithExplicitAmountCount:
        bucket.obligationsWithExplicitAmountCount,
      obligationsWithoutExplicitAmountCount:
        bucket.obligationsWithoutExplicitAmountCount,
      explicitAmountTotal: formatMoney(bucket.explicitAmountTotal),
      earliestDueDate: bucket.earliestDueDate,
      latestDueDate: bucket.latestDueDate,
    }));
}

function buildDiagnostics(
  contracts: FinanceContractRecord[],
  obligations: FinanceContractObligationView[],
) {
  const diagnostics: string[] = [];

  if (contracts.some((contract) => contract.unknownAsOfObservationCount > 0)) {
    diagnostics.push(
      "One or more persisted contracts do not include an explicit observation date.",
    );
  }

  if (contracts.some((contract) => contract.knownAsOfDates.length > 1)) {
    diagnostics.push(
      "One or more persisted contracts span multiple explicit observation dates.",
    );
  }

  if (obligations.some((obligation) => obligation.obligation.amount === null)) {
    diagnostics.push(
      "One or more explicit contract obligations do not include an explicit amount.",
    );
  }

  if (
    contracts.some(
      (contract) =>
        contract.nextPaymentDate !== null &&
        contract.amount !== null &&
        contract.paymentAmount === null,
    )
  ) {
    diagnostics.push(
      "One or more contracts report a generic amount alongside next_payment_date, so the obligation calendar leaves that scheduled-payment amount null unless payment_amount is explicit.",
    );
  }

  if (
    obligations.some(
      (obligation) =>
        obligation.obligation.amount !== null &&
        obligation.obligation.currencyCode === null,
    )
  ) {
    diagnostics.push(
      "One or more explicit contract obligations are grouped into an unknown-currency bucket because the source did not include a currency code.",
    );
  }

  if (contracts.some((contract) => contract.endDate !== null)) {
    diagnostics.push(
      "One or more persisted contracts include a generic end_date field that remains labeled as end_date rather than being upgraded into expiration semantics.",
    );
  }

  return dedupeMessages(diagnostics);
}
