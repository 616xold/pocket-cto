import type {
  CfoWikiPageKey,
  FinanceDiscoveryStoredStateQuestionKind,
} from "@pocket-cto/domain";

export type FinanceDiscoveryTwinReadKey =
  | "bankAccounts"
  | "cashPosture"
  | "collectionsPosture"
  | "contracts"
  | "obligationCalendar"
  | "payablesAging"
  | "payablesPosture"
  | "receivablesAging"
  | "spendItems"
  | "spendPosture";

export type FinanceDiscoveryRouteDefinition = {
  key: string;
  label: string;
  readKey: FinanceDiscoveryTwinReadKey;
  routePathSuffix: string;
  title: string;
};

export type FinanceDiscoveryFamilyDefinition = {
  answerTitle: string;
  baselineLimitations: string[];
  displayLabel: string;
  questionKind: FinanceDiscoveryStoredStateQuestionKind;
  relatedRoutes: FinanceDiscoveryRouteDefinition[];
  relatedWikiPageKeys: CfoWikiPageKey[];
  titleVerb: "Assess" | "Review";
};

export const FINANCE_DISCOVERY_FAMILY_REGISTRY = {
  cash_posture: {
    answerTitle: "Cash posture answer",
    baselineLimitations: [
      "This answer reads stored bank-account inventory and cash-posture state only; it does not perform FX conversion, cash forecasting, transaction-level review, or bank reconciliation.",
    ],
    displayLabel: "cash posture",
    questionKind: "cash_posture",
    relatedRoutes: [
      {
        key: "cash_posture_route",
        label: "Cash posture",
        readKey: "cashPosture",
        routePathSuffix: "cash-posture",
        title: "Cash posture route",
      },
      {
        key: "bank_account_inventory_route",
        label: "Bank account inventory",
        readKey: "bankAccounts",
        routePathSuffix: "bank-accounts",
        title: "Bank account inventory route",
      },
    ],
    relatedWikiPageKeys: [
      "metrics/cash-posture",
      "concepts/cash",
      "company/overview",
    ],
    titleVerb: "Assess",
  },
  collections_pressure: {
    answerTitle: "Collections pressure answer",
    baselineLimitations: [
      "This answer reads stored receivables-aging and collections-posture state only; it does not infer invoice disputes, expected payment timing, reserve logic, or DSO.",
    ],
    displayLabel: "collections pressure",
    questionKind: "collections_pressure",
    relatedRoutes: [
      {
        key: "collections_posture_route",
        label: "Collections posture",
        readKey: "collectionsPosture",
        routePathSuffix: "collections-posture",
        title: "Collections posture route",
      },
      {
        key: "receivables_aging_route",
        label: "Receivables aging",
        readKey: "receivablesAging",
        routePathSuffix: "receivables-aging",
        title: "Receivables aging route",
      },
    ],
    relatedWikiPageKeys: [
      "metrics/collections-posture",
      "metrics/receivables-aging",
      "concepts/receivables",
      "company/overview",
    ],
    titleVerb: "Review",
  },
  payables_pressure: {
    answerTitle: "Payables pressure answer",
    baselineLimitations: [
      "This answer reads stored payables-aging and payables-posture state only; it does not infer bill disputes, expected payment timing, reserve logic, or DPO.",
    ],
    displayLabel: "payables pressure",
    questionKind: "payables_pressure",
    relatedRoutes: [
      {
        key: "payables_posture_route",
        label: "Payables posture",
        readKey: "payablesPosture",
        routePathSuffix: "payables-posture",
        title: "Payables posture route",
      },
      {
        key: "payables_aging_route",
        label: "Payables aging",
        readKey: "payablesAging",
        routePathSuffix: "payables-aging",
        title: "Payables aging route",
      },
    ],
    relatedWikiPageKeys: [
      "metrics/payables-posture",
      "metrics/payables-aging",
      "concepts/payables",
      "company/overview",
    ],
    titleVerb: "Review",
  },
  spend_posture: {
    answerTitle: "Spend posture answer",
    baselineLimitations: [
      "This answer reads stored spend-item inventory and spend-posture state only; it does not perform policy lookup, policy scoring, reimbursement inference, accrual logic, or payment forecasting.",
    ],
    displayLabel: "spend posture",
    questionKind: "spend_posture",
    relatedRoutes: [
      {
        key: "spend_posture_route",
        label: "Spend posture",
        readKey: "spendPosture",
        routePathSuffix: "spend-posture",
        title: "Spend posture route",
      },
      {
        key: "spend_items_route",
        label: "Spend items",
        readKey: "spendItems",
        routePathSuffix: "spend-items",
        title: "Spend items route",
      },
    ],
    relatedWikiPageKeys: [
      "metrics/spend-posture",
      "concepts/spend",
      "company/overview",
    ],
    titleVerb: "Review",
  },
  obligation_calendar_review: {
    answerTitle: "Obligation calendar answer",
    baselineLimitations: [
      "This answer reads stored contract inventory and obligation-calendar state only; it does not parse clauses, infer legal obligations, forecast payments, or evaluate covenant logic.",
    ],
    displayLabel: "obligation calendar",
    questionKind: "obligation_calendar_review",
    relatedRoutes: [
      {
        key: "obligation_calendar_route",
        label: "Obligation calendar",
        readKey: "obligationCalendar",
        routePathSuffix: "obligation-calendar",
        title: "Obligation calendar route",
      },
      {
        key: "contracts_route",
        label: "Contracts",
        readKey: "contracts",
        routePathSuffix: "contracts",
        title: "Contracts route",
      },
    ],
    relatedWikiPageKeys: [
      "metrics/obligation-calendar",
      "concepts/contract-obligations",
      "company/overview",
    ],
    titleVerb: "Review",
  },
} satisfies Record<
  FinanceDiscoveryStoredStateQuestionKind,
  FinanceDiscoveryFamilyDefinition
>;

export function getFinanceDiscoveryFamily(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
) {
  return FINANCE_DISCOVERY_FAMILY_REGISTRY[questionKind];
}

export function listFinanceDiscoveryFamilies() {
  return Object.values(FINANCE_DISCOVERY_FAMILY_REGISTRY);
}

export function buildFinanceDiscoveryMissionTitle(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
  companyKey: string,
) {
  const family = getFinanceDiscoveryFamily(questionKind);
  return `${family.titleVerb} ${family.displayLabel} for ${companyKey}`;
}

export function buildFinanceDiscoveryMissionObjective(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
  companyKey: string,
) {
  const family = getFinanceDiscoveryFamily(questionKind);
  return `Answer the stored ${family.displayLabel} question for ${companyKey} from persisted Finance Twin and CFO Wiki state only.`;
}
