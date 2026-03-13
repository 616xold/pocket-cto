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
  scores: DimensionScores;
  verdict: "strong" | "mixed" | "weak";
};

export type CombinedAssessment = {
  overallScore: number;
  scores: DimensionScores;
};

export type EvalResultRecord = {
  candidate: {
    model: string;
    output: unknown;
    text: string;
  };
  combined: CombinedAssessment;
  completedAt: string;
  grader: ModelAssessment;
  itemId: string;
  mode: EvalMode;
  notes: string[];
  prompt: EvalPromptRecord;
  reference: {
    model: string;
    output: unknown;
    text: string;
  } | null;
  rubric: {
    path: string;
    sha256: string;
  };
  rule: RuleAssessment;
  startedAt: string;
  target: "planner" | "executor" | "compiler";
  timestamp: string;
};
