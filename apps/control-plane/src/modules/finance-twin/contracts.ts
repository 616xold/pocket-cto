import {
  FinanceContractsViewSchema,
  type FinanceCompanyRecord,
  type FinanceContractInventoryRow,
  type FinanceContractMetadataSliceSummary,
  type FinanceContractRecord,
  type FinanceContractsView,
  type FinanceFreshnessSummary,
  type FinanceLatestSuccessfulContractMetadataSlice,
  type FinanceTwinSyncRunRecord,
} from "@pocket-cto/domain";
import { dedupeMessages } from "./diagnostics";
import type { FinanceContractObligationView } from "./repository";

export function buildContractMetadataSliceSummary(input: {
  contracts: FinanceContractRecord[];
  obligations: FinanceContractObligationView[];
}): FinanceContractMetadataSliceSummary {
  const currencyCodes = new Set<string>();

  for (const contract of input.contracts) {
    if (contract.currencyCode) {
      currencyCodes.add(contract.currencyCode);
    }
  }

  return {
    contractCount: input.contracts.length,
    obligationCount: input.obligations.length,
    datedContractCount: input.contracts.filter(
      (contract) => contract.knownAsOfDates.length > 0,
    ).length,
    undatedContractCount: input.contracts.filter(
      (contract) => contract.knownAsOfDates.length === 0,
    ).length,
    currencyCount: currencyCodes.size,
    contractsWithExplicitAmountCount: input.contracts.filter(
      (contract) => contract.amount !== null,
    ).length,
    contractsWithExplicitPaymentAmountCount: input.contracts.filter(
      (contract) => contract.paymentAmount !== null,
    ).length,
    contractsWithEndDateCount: input.contracts.filter(
      (contract) => contract.endDate !== null,
    ).length,
    contractsWithExpirationDateCount: input.contracts.filter(
      (contract) => contract.expirationDate !== null,
    ).length,
    contractsWithNoticeDeadlineCount: input.contracts.filter(
      (contract) => contract.noticeDeadline !== null,
    ).length,
    contractsWithRenewalDateCount: input.contracts.filter(
      (contract) => contract.renewalDate !== null,
    ).length,
    contractsWithScheduledPaymentDateCount: input.contracts.filter(
      (contract) => contract.nextPaymentDate !== null,
    ).length,
  };
}

export function buildFinanceContractsView(input: {
  company: FinanceCompanyRecord;
  contracts: FinanceContractRecord[];
  freshness: FinanceFreshnessSummary;
  latestAttemptedSyncRun: FinanceTwinSyncRunRecord | null;
  latestSuccessfulSlice: FinanceLatestSuccessfulContractMetadataSlice;
  limitations: string[];
  obligations: FinanceContractObligationView[];
}): FinanceContractsView {
  const diagnostics = buildDiagnostics(input.contracts);
  const limitations = [...input.limitations];

  if (input.latestSuccessfulSlice.latestSyncRun === null) {
    limitations.push(
      "No successful contract-metadata slice exists yet for this company.",
    );
  }

  limitations.push(
    "This route only exposes persisted explicit contract-metadata fields from the latest successful contract-metadata slice; it does not parse clauses, PDFs, or prose into legal conclusions.",
  );
  limitations.push(
    "Generic fields stay generic in this slice: end_date remains end_date, amount remains a reported contract amount, and only explicit payment_amount values are eligible for scheduled-payment obligation amounts.",
  );
  limitations.push(
    "Mixed or missing observation dates remain explicit on each contract row; this route does not claim one unified company-wide contract as-of date.",
  );

  return FinanceContractsViewSchema.parse({
    company: input.company,
    latestAttemptedSyncRun: input.latestAttemptedSyncRun,
    latestSuccessfulSlice: input.latestSuccessfulSlice,
    freshness: input.freshness,
    contractCount: input.contracts.length,
    contracts: buildInventoryRows(input.contracts, input.obligations),
    diagnostics,
    limitations: dedupeMessages(limitations),
  });
}

function buildInventoryRows(
  contracts: FinanceContractRecord[],
  obligations: FinanceContractObligationView[],
): FinanceContractInventoryRow[] {
  const obligationCounts = new Map<string, number>();

  for (const obligation of obligations) {
    obligationCounts.set(
      obligation.contract.id,
      (obligationCounts.get(obligation.contract.id) ?? 0) + 1,
    );
  }

  return contracts
    .slice()
    .sort((left, right) => {
      return (
        left.contractLabel.localeCompare(right.contractLabel) ||
        (left.externalContractId ?? "").localeCompare(
          right.externalContractId ?? "",
        ) ||
        left.lineNumber - right.lineNumber
      );
    })
    .map((contract) => ({
      contract,
      explicitObligationCount: obligationCounts.get(contract.id) ?? 0,
      lineageRef: {
        targetKind: "contract",
        targetId: contract.id,
        syncRunId: contract.syncRunId,
      },
    }));
}

function buildDiagnostics(contracts: FinanceContractRecord[]) {
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

  if (
    contracts.some(
      (contract) =>
        contract.nextPaymentDate !== null &&
        contract.amount !== null &&
        contract.paymentAmount === null,
    )
  ) {
    diagnostics.push(
      "One or more persisted contracts report a generic amount alongside next_payment_date, so that generic amount remains on the contract row and is not upgraded into a scheduled-payment amount.",
    );
  }

  if (contracts.some((contract) => contract.endDate !== null)) {
    diagnostics.push(
      "One or more persisted contracts include a generic end_date field that remains labeled as end_date rather than being upgraded into expiration semantics.",
    );
  }

  return dedupeMessages(diagnostics);
}
