import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { getEvalRubricPath } from "./paths";
import type { OpenAIResponsesClient } from "./openai-client";
import type { DimensionScores, ModelAssessment, RuleAssessment } from "./types";

const graderResponseSchema = z.object({
  notes: z.array(z.string()).default([]),
  overallScore: z.number().min(0).max(5),
  scores: z.object({
    actionability: z.number().min(0).max(5),
    clarity: z.number().min(0).max(5),
    constraintCompliance: z.number().min(0).max(5),
    evidenceReadiness: z.number().min(0).max(5),
  }),
  verdict: z.enum(["strong", "mixed", "weak"]),
});

export async function loadEvalRubric() {
  const path = getEvalRubricPath();
  const text = await readFile(path, "utf8");

  return {
    path,
    sha256: createHash("sha256").update(text).digest("hex"),
    text,
  };
}

export async function gradeWithModel(input: {
  candidateModel: string;
  candidateOutputText: string;
  client: OpenAIResponsesClient;
  expectations: unknown;
  graderModel: string;
  itemId: string;
  promptSource: string;
  promptText: string;
  referenceOutputText: string | null;
  rubric: {
    path: string;
    sha256: string;
    text: string;
  };
  ruleAssessment: RuleAssessment;
  target: "planner" | "executor" | "compiler";
}): Promise<ModelAssessment> {
  const response = await input.client.generate({
    format: {
      kind: "json_schema",
      schema: graderResponseJsonSchema,
      schemaName: "pocket_cto_eval_grader",
    },
    model: input.graderModel,
    prompt: buildGraderPrompt(input),
  });

  const parsed = graderResponseSchema.parse(response.output);

  return {
    model: input.graderModel,
    notes: parsed.notes,
    overallScore: roundOneDecimal(parsed.overallScore),
    provider: response.provider,
    scores: normalizeScores(parsed.scores),
    verdict: parsed.verdict,
  };
}

export function buildDryRunModelAssessment(
  ruleAssessment: RuleAssessment,
): ModelAssessment {
  const overallScore = average(Object.values(ruleAssessment.scores));

  return {
    model: null,
    notes: [
      "Dry-run mode reused the rule-based assessment instead of calling a grader model.",
    ],
    overallScore: roundOneDecimal(overallScore),
    provider: null,
    scores: normalizeScores(ruleAssessment.scores),
    verdict: overallScore >= 4 ? "strong" : overallScore >= 2.5 ? "mixed" : "weak",
  };
}

export function combineAssessments(input: {
  model: ModelAssessment;
  rule: RuleAssessment;
}) {
  const scores = {
    actionability: average([
      input.rule.scores.actionability,
      input.model.scores.actionability,
    ]),
    clarity: average([input.rule.scores.clarity, input.model.scores.clarity]),
    constraintCompliance: average([
      input.rule.scores.constraintCompliance,
      input.model.scores.constraintCompliance,
    ]),
    evidenceReadiness: average([
      input.rule.scores.evidenceReadiness,
      input.model.scores.evidenceReadiness,
    ]),
  } satisfies DimensionScores;

  return {
    overallScore: roundOneDecimal(average(Object.values(scores))),
    scores: normalizeScores(scores),
  };
}

function buildGraderPrompt(input: {
  candidateModel: string;
  candidateOutputText: string;
  expectations: unknown;
  itemId: string;
  promptSource: string;
  promptText: string;
  referenceOutputText: string | null;
  rubric: {
    path: string;
    sha256: string;
    text: string;
  };
  ruleAssessment: RuleAssessment;
  target: "planner" | "executor" | "compiler";
}) {
  return [
    "You are grading one Pocket CTO local eval result.",
    "Use the rubric, the target-specific expectations, the candidate prompt, and the candidate output.",
    "Prefer evidence in the actual output over generous assumptions.",
    "Use the rule-based findings as hints, not as binding truth.",
    "",
    `Target: ${input.target}`,
    `Dataset item id: ${input.itemId}`,
    `Candidate model: ${input.candidateModel}`,
    `Prompt source: ${input.promptSource}`,
    "",
    `Rubric path: ${input.rubric.path}`,
    `Rubric sha256: ${input.rubric.sha256}`,
    "Rubric:",
    input.rubric.text,
    "",
    "Target-specific expectations:",
    JSON.stringify(input.expectations, null, 2),
    "",
    "Rule-based findings:",
    JSON.stringify(input.ruleAssessment, null, 2),
    "",
    "Candidate prompt:",
    input.promptText,
    "",
    "Candidate output:",
    input.candidateOutputText,
    "",
    input.referenceOutputText
      ? `Optional reference output:\n${input.referenceOutputText}\n`
      : "Optional reference output: (not provided)\n",
    "Return scores from 0 to 5 for constraintCompliance, clarity, evidenceReadiness, and actionability.",
    "Overall score should also be 0 to 5.",
    'Set verdict to "strong", "mixed", or "weak".',
    "Notes should be short factual observations, not restatements of the rubric.",
  ].join("\n");
}

const graderResponseJsonSchema = {
  additionalProperties: false,
  properties: {
    notes: {
      items: {
        type: "string",
      },
      type: "array",
    },
    overallScore: {
      maximum: 5,
      minimum: 0,
      type: "number",
    },
    scores: {
      additionalProperties: false,
      properties: {
        actionability: {
          maximum: 5,
          minimum: 0,
          type: "number",
        },
        clarity: {
          maximum: 5,
          minimum: 0,
          type: "number",
        },
        constraintCompliance: {
          maximum: 5,
          minimum: 0,
          type: "number",
        },
        evidenceReadiness: {
          maximum: 5,
          minimum: 0,
          type: "number",
        },
      },
      required: [
        "constraintCompliance",
        "clarity",
        "evidenceReadiness",
        "actionability",
      ],
      type: "object",
    },
    verdict: {
      enum: ["strong", "mixed", "weak"],
      type: "string",
    },
  },
  required: ["scores", "overallScore", "verdict", "notes"],
  type: "object",
} satisfies Record<string, unknown>;

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeScores(scores: DimensionScores) {
  return {
    actionability: roundOneDecimal(scores.actionability),
    clarity: roundOneDecimal(scores.clarity),
    constraintCompliance: roundOneDecimal(scores.constraintCompliance),
    evidenceReadiness: roundOneDecimal(scores.evidenceReadiness),
  };
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
