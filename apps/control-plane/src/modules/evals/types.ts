export const evalDimensions = [
  "constraintCompliance",
  "clarity",
  "evidenceReadiness",
  "actionability",
] as const;

export const evalBackends = [
  "openai_responses",
  "codex_subscription",
] as const;

export type EvalDimension = (typeof evalDimensions)[number];
export type EvalBackend = (typeof evalBackends)[number];

export type DimensionScores = Record<EvalDimension, number>;

export type EvalMode = "dry-run" | "live";
export type EvalModelClientFormat =
  | {
      kind: "json_schema";
      schema: Record<string, unknown>;
      schemaName: string;
    }
  | {
      kind: "text";
    };

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

export type OpenAIResponsesProviderMetadata = {
  backend: "openai_responses";
  codexVersion: null;
  proofMode: "api_key";
  provider: "openai-responses";
  requestId: string | null;
  requestedModel: string;
  resolvedModel: string | null;
  responseId: string | null;
  threadId: null;
  transport: "openai_responses_api";
  turnId: null;
  userAgent: null;
  usage: EvalProviderUsage | null;
};

export type CodexSubscriptionProviderMetadata = {
  backend: "codex_subscription";
  codexVersion: string | null;
  proofMode: "local_codex_subscription" | "unknown";
  provider: "codex-subscription";
  requestId: null;
  requestedModel: string;
  resolvedModel: string | null;
  responseId: null;
  threadId: string | null;
  transport: "codex_app_server";
  turnId: string | null;
  userAgent: string | null;
  usage: null;
};

export type EvalProviderMetadata =
  | OpenAIResponsesProviderMetadata
  | CodexSubscriptionProviderMetadata;

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
  backends: EvalBackend[];
  codexVersions: string[];
  calls: number;
  proofModes: string[];
  responseIds: string[];
  threadIds: string[];
  transports: string[];
  turnIds: string[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null;
};

export type EvalRunSummary = {
  averageOverallScore: number;
  backend: EvalBackend;
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
