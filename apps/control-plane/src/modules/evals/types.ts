export const evalDimensions = [
  "constraintCompliance",
  "clarity",
  "evidenceReadiness",
  "actionability",
] as const;

export type EvalDimension = (typeof evalDimensions)[number];

export type DimensionScores = Record<EvalDimension, number>;

export type EvalMode = "dry-run" | "live";

export type EvalPromptRecord = {
  sha256: string;
  source: string;
  text: string;
  version: string;
};

export type EvalRecordProvenance = {
  branchName: string | null;
  datasetName: string;
  gitSha: string | null;
  promptVersion: string;
};

export type EvalProviderUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export type EvalProviderMetadata = {
  provider: "openai-responses";
  requestId: string | null;
  requestedModel: string;
  resolvedModel: string | null;
  responseId: string | null;
  usage: EvalProviderUsage | null;
};

export type EvalOutputRecord = {
  model: string;
  output: unknown;
  provider: EvalProviderMetadata | null;
  text: string;
};

export type RuleAssessment = {
  checks: {
    passed: number;
    total: number;
  };
  notes: string[];
  scores: DimensionScores;
};

export type ModelAssessment = {
  model: string | null;
  notes: string[];
  overallScore: number;
  provider: EvalProviderMetadata | null;
  scores: DimensionScores;
  verdict: "strong" | "mixed" | "weak";
};

export type CombinedAssessment = {
  overallScore: number;
  scores: DimensionScores;
};

export type EvalResultRecord = {
  candidate: EvalOutputRecord;
  combined: CombinedAssessment;
  completedAt: string;
  grader: ModelAssessment;
  itemId: string;
  mode: EvalMode;
  notes: string[];
  prompt: EvalPromptRecord;
  provenance: EvalRecordProvenance;
  reference: EvalOutputRecord | null;
  rubric: {
    path: string;
    sha256: string;
  };
  rule: RuleAssessment;
  startedAt: string;
  target: "planner" | "executor" | "compiler";
  timestamp: string;
};

export type EvalProviderCallSummary = {
  calls: number;
  responseIds: string[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null;
};

export type EvalRunSummary = {
  averageOverallScore: number;
  candidateModel: string;
  graderModel: string;
  provenance: {
    branchName: string | null;
    datasetNames: string[];
    gitSha: string | null;
    promptVersions: string[];
  };
  live: {
    candidate: EvalProviderCallSummary;
    grader: EvalProviderCallSummary;
    reference: EvalProviderCallSummary;
  };
  mode: EvalMode;
  outputFileName: string;
  outputPath: string;
  runLabel: string;
  samples: number;
};
