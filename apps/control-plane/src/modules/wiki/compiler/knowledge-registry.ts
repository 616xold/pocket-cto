import {
  buildCfoWikiConceptPageKey,
  buildCfoWikiMetricDefinitionPageKey,
  type CfoWikiPageKey,
  type FinanceTwinExtractorKey,
} from "@pocket-cto/domain";

export const WIKI_CONCEPT_KEYS = [
  "cash",
  "receivables",
  "payables",
  "spend",
  "contract-obligations",
  "policy-corpus",
] as const;

export const WIKI_METRIC_KEYS = [
  "cash-posture",
  "receivables-aging",
  "collections-posture",
  "payables-aging",
  "payables-posture",
  "spend-posture",
  "obligation-calendar",
] as const;

export type WikiConceptKey = (typeof WIKI_CONCEPT_KEYS)[number];
export type WikiMetricKey = (typeof WIKI_METRIC_KEYS)[number];

export type WikiConceptDefinition = {
  conceptKey: WikiConceptKey;
  extractorKeys: FinanceTwinExtractorKey[];
  foundationPageKeys: CfoWikiPageKey[];
  includeAllPolicyPages: boolean;
  includePolicySourceDigests: boolean;
  limitations: string[];
  missingCoverageNote: string;
  relatedMetricKeys: WikiMetricKey[];
  scope: string;
  title: string;
};

export type WikiMetricDefinition = {
  extractorKeys: FinanceTwinExtractorKey[];
  foundationPageKeys: CfoWikiPageKey[];
  freshnessRules: string[];
  limitations: string[];
  measureMeaning: string;
  metricKey: WikiMetricKey;
  nonGoals: string[];
  relatedConceptKeys: WikiConceptKey[];
  routePath: string;
  supportSummary: string;
  title: string;
};

const FOUNDATION_PAGE_KEYS = ["company/overview", "sources/coverage"] as const;

export const WIKI_CONCEPT_DEFINITIONS: WikiConceptDefinition[] = [
  {
    conceptKey: "cash",
    extractorKeys: ["bank_account_summary_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: false,
    includePolicySourceDigests: false,
    limitations: [
      "This concept does not claim treasury forecasting, FX normalization, transaction-level bank activity, or bank-reconciliation coverage.",
    ],
    missingCoverageNote:
      "Cash coverage stays limited until a bank-account-summary-backed Finance Twin slice is stored successfully for this company.",
    relatedMetricKeys: ["cash-posture"],
    scope:
      "Cash in Pocket CFO currently means the stored bank-account inventory and cash-posture coverage backed by deterministic bank-account-summary sync state.",
    title: "Cash",
  },
  {
    conceptKey: "receivables",
    extractorKeys: ["receivables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: false,
    includePolicySourceDigests: false,
    limitations: [
      "This concept does not claim invoice-level collections workflow, reserve logic, expected cash timing, or DSO that is not already route-backed.",
    ],
    missingCoverageNote:
      "Receivables coverage stays limited until a receivables-aging-backed Finance Twin slice is stored successfully for this company.",
    relatedMetricKeys: ["receivables-aging", "collections-posture"],
    scope:
      "Receivables in Pocket CFO currently mean the stored receivables-aging inventory and the collections-posture family derived from that same deterministic slice.",
    title: "Receivables",
  },
  {
    conceptKey: "payables",
    extractorKeys: ["payables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: false,
    includePolicySourceDigests: false,
    limitations: [
      "This concept does not claim bill-level workflow, expected payment timing, reserve logic, or DPO that is not already route-backed.",
    ],
    missingCoverageNote:
      "Payables coverage stays limited until a payables-aging-backed Finance Twin slice is stored successfully for this company.",
    relatedMetricKeys: ["payables-aging", "payables-posture"],
    scope:
      "Payables in Pocket CFO currently mean the stored payables-aging inventory and the payables-posture family derived from that same deterministic slice.",
    title: "Payables",
  },
  {
    conceptKey: "spend",
    extractorKeys: ["card_expense_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: false,
    includePolicySourceDigests: false,
    limitations: [
      "This concept does not claim reimbursement workflow, accrual accounting, payment forecasting, or policy scoring beyond the stored spend slice.",
    ],
    missingCoverageNote:
      "Spend coverage stays limited until a card-expense-backed Finance Twin slice is stored successfully for this company.",
    relatedMetricKeys: ["spend-posture"],
    scope:
      "Spend in Pocket CFO currently means the stored spend-item inventory and spend-posture coverage backed by deterministic card-expense sync state.",
    title: "Spend",
  },
  {
    conceptKey: "contract-obligations",
    extractorKeys: ["contract_metadata_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: false,
    includePolicySourceDigests: false,
    limitations: [
      "This concept does not claim clause parsing, covenant interpretation, payment forecasting, or legal conclusions beyond the stored contract-metadata slice.",
    ],
    missingCoverageNote:
      "Contract-obligation coverage stays limited until a contract-metadata-backed Finance Twin slice is stored successfully for this company.",
    relatedMetricKeys: ["obligation-calendar"],
    scope:
      "Contract obligations in Pocket CFO currently mean the stored contract inventory and obligation-calendar family derived from deterministic contract-metadata sync state.",
    title: "Contract Obligations",
  },
  {
    conceptKey: "policy-corpus",
    extractorKeys: [],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    includeAllPolicyPages: true,
    includePolicySourceDigests: true,
    limitations: [
      "The policy corpus stays limited to explicitly bound `policy_document` sources and their stored deterministic extracts.",
      "This concept does not interpret obligations, approvals, controls, or legal conclusions from weak document signals.",
    ],
    missingCoverageNote:
      "No explicit `policy_document` sources are currently bound into compile for this company.",
    relatedMetricKeys: [],
    scope:
      "The policy corpus in Pocket CFO is the explicit set of bound `policy_document` sources compiled into current policy pages plus their related source-digest history.",
    title: "Policy Corpus",
  },
];

export const WIKI_METRIC_DEFINITIONS: WikiMetricDefinition[] = [
  {
    metricKey: "cash-posture",
    extractorKeys: ["bank_account_summary_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored bank-account-summary sync freshness for the company.",
      "If no successful bank-account-summary sync exists, the page stays missing instead of inventing numeric posture.",
    ],
    limitations: [
      "The definition page describes the supported measure family only; it is not itself the live cash-posture answer.",
    ],
    measureMeaning:
      "Cash posture is the current bank-account balance posture family backed by deterministic bank-account-summary sync state.",
    nonGoals: [
      "No FX normalization.",
      "No bank reconciliation claims.",
      "No transaction-detail timeline.",
    ],
    relatedConceptKeys: ["cash"],
    routePath: "/finance-twin/companies/:companyKey/cash-posture",
    supportSummary:
      "Supported by stored bank-account summaries, related bank-account inventory, and source-linked sync lineage.",
    title: "Cash Posture",
  },
  {
    metricKey: "receivables-aging",
    extractorKeys: ["receivables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored receivables-aging sync freshness for the company.",
      "If no successful receivables-aging sync exists, the page stays missing instead of inventing aging coverage.",
    ],
    limitations: [
      "The definition page describes the supported aging family only; it does not replace the route-backed receivables-aging view.",
    ],
    measureMeaning:
      "Receivables aging is the current receivables bucket inventory backed by deterministic receivables-aging sync state.",
    nonGoals: [
      "No invoice-level workflow inference.",
      "No reserve logic.",
      "No DSO claims beyond route-backed coverage.",
    ],
    relatedConceptKeys: ["receivables"],
    routePath: "/finance-twin/companies/:companyKey/receivables-aging",
    supportSummary:
      "Supported by stored receivables-aging rows, customer identity resolution, and source-linked sync lineage.",
    title: "Receivables Aging",
  },
  {
    metricKey: "collections-posture",
    extractorKeys: ["receivables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored receivables-aging sync freshness because collections posture is derived from that slice.",
      "If the receivables-aging slice is missing or failed, collections posture stays missing or failed too.",
    ],
    limitations: [
      "The definition page describes the supported posture family only; it is not itself the live collections answer.",
    ],
    measureMeaning:
      "Collections posture is the current collections view derived from stored receivables-aging coverage for the company.",
    nonGoals: [
      "No expected cash-timing inference.",
      "No collector workflow scoring.",
      "No unsupported reserve logic.",
    ],
    relatedConceptKeys: ["receivables"],
    routePath: "/finance-twin/companies/:companyKey/collections-posture",
    supportSummary:
      "Supported by the same stored receivables-aging slice that powers the route-backed collections-posture view.",
    title: "Collections Posture",
  },
  {
    metricKey: "payables-aging",
    extractorKeys: ["payables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored payables-aging sync freshness for the company.",
      "If no successful payables-aging sync exists, the page stays missing instead of inventing aging coverage.",
    ],
    limitations: [
      "The definition page describes the supported aging family only; it does not replace the route-backed payables-aging view.",
    ],
    measureMeaning:
      "Payables aging is the current payables bucket inventory backed by deterministic payables-aging sync state.",
    nonGoals: [
      "No bill-workflow inference.",
      "No expected payment-timing forecast.",
      "No DPO claims beyond route-backed coverage.",
    ],
    relatedConceptKeys: ["payables"],
    routePath: "/finance-twin/companies/:companyKey/payables-aging",
    supportSummary:
      "Supported by stored payables-aging rows, vendor identity resolution, and source-linked sync lineage.",
    title: "Payables Aging",
  },
  {
    metricKey: "payables-posture",
    extractorKeys: ["payables_aging_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored payables-aging sync freshness because payables posture is derived from that slice.",
      "If the payables-aging slice is missing or failed, payables posture stays missing or failed too.",
    ],
    limitations: [
      "The definition page describes the supported posture family only; it is not itself the live payables answer.",
    ],
    measureMeaning:
      "Payables posture is the current payables view derived from stored payables-aging coverage for the company.",
    nonGoals: [
      "No payment-forecasting logic.",
      "No unsupported reserve logic.",
      "No vendor-workflow scoring.",
    ],
    relatedConceptKeys: ["payables"],
    routePath: "/finance-twin/companies/:companyKey/payables-posture",
    supportSummary:
      "Supported by the same stored payables-aging slice that powers the route-backed payables-posture view.",
    title: "Payables Posture",
  },
  {
    metricKey: "spend-posture",
    extractorKeys: ["card_expense_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored card-expense sync freshness for the company.",
      "If no successful card-expense sync exists, the page stays missing instead of inventing spend coverage.",
    ],
    limitations: [
      "The definition page describes the supported posture family only; it is not itself the live spend answer.",
    ],
    measureMeaning:
      "Spend posture is the current spend view backed by deterministic card-expense sync state and related spend-item inventory.",
    nonGoals: [
      "No reimbursement inference.",
      "No accrual logic.",
      "No payment forecasting.",
    ],
    relatedConceptKeys: ["spend"],
    routePath: "/finance-twin/companies/:companyKey/spend-posture",
    supportSummary:
      "Supported by stored spend rows, route-backed spend-item inventory, and source-linked sync lineage.",
    title: "Spend Posture",
  },
  {
    metricKey: "obligation-calendar",
    extractorKeys: ["contract_metadata_csv"],
    foundationPageKeys: [...FOUNDATION_PAGE_KEYS],
    freshnessRules: [
      "This definition follows the latest stored contract-metadata sync freshness for the company.",
      "If no successful contract-metadata sync exists, the page stays missing instead of inventing obligation timing.",
    ],
    limitations: [
      "The definition page describes the supported obligation-calendar family only; it is not itself the live obligation answer.",
    ],
    measureMeaning:
      "Obligation calendar is the current upcoming-obligation family derived from deterministic contract-metadata sync state.",
    nonGoals: [
      "No clause parsing.",
      "No covenant or legal interpretation.",
      "No payment forecasting beyond explicit stored fields.",
    ],
    relatedConceptKeys: ["contract-obligations"],
    routePath: "/finance-twin/companies/:companyKey/obligation-calendar",
    supportSummary:
      "Supported by stored contract records, explicit obligation rows, and source-linked contract-metadata sync lineage.",
    title: "Obligation Calendar",
  },
];

export function buildConceptPageTitle(
  companyDisplayName: string,
  definition: WikiConceptDefinition,
) {
  return `${companyDisplayName} ${definition.title} Concept`;
}

export function buildMetricDefinitionPageTitle(
  companyDisplayName: string,
  definition: WikiMetricDefinition,
) {
  return `${companyDisplayName} ${definition.title} Metric Definition`;
}

export function findWikiConceptDefinition(conceptKey: WikiConceptKey) {
  return WIKI_CONCEPT_DEFINITIONS.find(
    (definition) => definition.conceptKey === conceptKey,
  );
}

export function findWikiMetricDefinition(metricKey: WikiMetricKey) {
  return WIKI_METRIC_DEFINITIONS.find(
    (definition) => definition.metricKey === metricKey,
  );
}

export function listConceptPageKeys() {
  return WIKI_CONCEPT_DEFINITIONS.map((definition) =>
    buildCfoWikiConceptPageKey(definition.conceptKey),
  );
}

export function listMetricDefinitionPageKeys() {
  return WIKI_METRIC_DEFINITIONS.map((definition) =>
    buildCfoWikiMetricDefinitionPageKey(definition.metricKey),
  );
}
