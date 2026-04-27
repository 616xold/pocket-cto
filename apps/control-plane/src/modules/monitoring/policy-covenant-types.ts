import type {
  CfoWikiBoundSourceSummary,
  CfoWikiPageKey,
  CfoWikiPageView,
  FinanceCollectionsPostureView,
  FinancePayablesPostureView,
  MonitorAlertCondition,
  MonitorComparableActualLineageRef,
} from "@pocket-cto/domain";

export const POLICY_THRESHOLD_EXTRACTION_RULE_VERSION =
  "f6e-policy-threshold-line-v1";

export const SUPPORTED_METRIC_KEYS = [
  "collections_past_due_share",
  "payables_past_due_share",
] as const;

export type SupportedMetricKey = (typeof SUPPORTED_METRIC_KEYS)[number];
export type ThresholdComparator = "<=" | "<" | ">=" | ">";

export type ThresholdFact = {
  comparator: ThresholdComparator;
  compileRunId: string | null;
  excerpt: string;
  extractionRuleVersion: typeof POLICY_THRESHOLD_EXTRACTION_RULE_VERSION;
  limitations: string[];
  metricKey: SupportedMetricKey;
  policyPageKey: CfoWikiPageKey | null;
  source: CfoWikiBoundSourceSummary;
  thresholdId: string;
  thresholdValue: number;
  unit: "percent";
};

export type ThresholdExtractionIssue = {
  evidencePath: string;
  summary: string;
};

export type PolicyCovenantThresholdExtraction = {
  conflictingMetricKeys: Set<SupportedMetricKey>;
  facts: ThresholdFact[];
  issues: ThresholdExtractionIssue[];
};

export type PolicyCovenantThresholdPageState = {
  page: CfoWikiPageView | null;
  pageKey: CfoWikiPageKey;
  source: CfoWikiBoundSourceSummary;
};

export type PolicyCovenantThresholdEvaluationInput = {
  collectionsPosture: FinanceCollectionsPostureView | null;
  company: {
    companyId: string;
    companyKey: string;
  };
  extraction: PolicyCovenantThresholdExtraction;
  payablesPosture: FinancePayablesPostureView | null;
  policyCorpusPage: CfoWikiPageView | null;
  policyPages: PolicyCovenantThresholdPageState[];
  policySources: CfoWikiBoundSourceSummary[];
};

export type ComparableActualResult =
  | {
      actual: {
        lineageRef: MonitorComparableActualLineageRef;
        value: number;
      };
      condition: null;
    }
  | {
      actual: null;
      condition: MonitorAlertCondition;
    };
