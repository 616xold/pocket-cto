import {
  FinanceGeneralLedgerBalanceProofSchema,
  type FinanceGeneralLedgerActivity,
  type FinanceGeneralLedgerBalanceProof,
} from "@pocket-cto/domain";

export function buildFinanceGeneralLedgerBalanceProof(input: {
  generalLedgerActivity: FinanceGeneralLedgerActivity | null;
}): FinanceGeneralLedgerBalanceProof {
  if (input.generalLedgerActivity === null) {
    return FinanceGeneralLedgerBalanceProofSchema.parse({
      openingBalanceAmount: null,
      endingBalanceAmount: null,
      openingBalanceEvidencePresent: false,
      endingBalanceEvidencePresent: false,
      proofBasis: "no_general_ledger_activity",
      proofSource: null,
      reasonCode: "missing_general_ledger_activity",
      reasonSummary:
        "No general-ledger activity is present for this account in the latest successful general-ledger slice, so source-backed balance proof is unavailable.",
    });
  }

  // F2H stays truthful by reporting the absence of source-backed balance proof
  // rather than inferring opening or ending balances from activity totals.
  return FinanceGeneralLedgerBalanceProofSchema.parse({
    openingBalanceAmount: null,
    endingBalanceAmount: null,
    openingBalanceEvidencePresent: false,
    endingBalanceEvidencePresent: false,
    proofBasis: "activity_only_no_balance_proof",
    proofSource: null,
    reasonCode: "activity_only_no_balance_proof",
    reasonSummary:
      "The latest successful general-ledger slice only provides activity totals for this account; it does not expose source-backed opening-balance or ending-balance proof.",
  });
}

export function hasSourceBackedBalanceProof(
  balanceProof: FinanceGeneralLedgerBalanceProof,
) {
  return (
    balanceProof.openingBalanceEvidencePresent ||
    balanceProof.endingBalanceEvidencePresent
  );
}
