import type { UserInput } from "@pocket-cto/codex-runtime";
import { buildExecutorTurnInput } from "../runtime-codex/executor-prompt";
import { buildPlannerTurnInput } from "../runtime-codex/planner-prompt";
import type {
  CompilerEvalDatasetItem,
  ExecutorEvalDatasetItem,
  PlannerEvalDatasetItem,
} from "./dataset";

export type PromptEnvelope =
  | {
      format: {
        kind: "json_schema";
        schema: Record<string, unknown>;
        schemaName: string;
      };
      source: string;
      target: "compiler";
      text: string;
      version: string;
    }
  | {
      format: {
        kind: "text";
      };
      source: string;
      target: "planner" | "executor";
      text: string;
      version: string;
    };

export function buildPlannerPromptEnvelope(
  item: PlannerEvalDatasetItem,
): PromptEnvelope {
  return {
    format: {
      kind: "text",
    },
    source:
      "apps/control-plane/src/modules/runtime-codex/planner-prompt.ts#buildPlannerTurnInput",
    target: "planner",
    text: flattenUserInput(buildPlannerTurnInput(item.context)),
    version: "planner-prompt.v1",
  };
}

export function buildExecutorPromptEnvelope(
  item: ExecutorEvalDatasetItem,
): PromptEnvelope {
  return {
    format: {
      kind: "text",
    },
    source:
      "apps/control-plane/src/modules/runtime-codex/executor-prompt.ts#buildExecutorTurnInput",
    target: "executor",
    text: flattenUserInput(buildExecutorTurnInput(item.context)),
    version: "executor-prompt.v1",
  };
}

export function buildCompilerPromptEnvelope(
  item: CompilerEvalDatasetItem,
): PromptEnvelope {
  const lines = [
    "You are the Pocket CTO mission compiler.",
    "Convert the operator request into one JSON object that matches the MissionSpec contract.",
    "",
    "Return JSON only. Do not wrap the object in markdown fences.",
    "",
    "MissionSpec requirements:",
    '- type: one of "build", "incident", "release", or "discovery"',
    "- title: concise human-readable mission title",
    "- objective: clear objective sentence aligned to the operator request",
    "- repos: one or more repo identifiers",
    "- constraints.mustNot: explicit forbidden actions or scope limits",
    "- constraints.allowedPaths: repo-relative paths when the request narrows scope",
    "- constraints.targetBranch: omit or provide a branch name when the request implies one",
    "- acceptance: one or more observable acceptance criteria",
    "- riskBudget.sandboxMode: one of read-only, patch-only, merge-eligible, deploy-eligible",
    "- riskBudget.maxWallClockMinutes: positive integer",
    "- riskBudget.maxCostUsd: positive number",
    "- riskBudget.allowNetwork: boolean",
    "- riskBudget.requiresHumanApprovalFor: list of actions that need approval",
    "- deliverables: one or more concrete outputs",
    "- evidenceRequirements: zero or more verification artifacts or proofs",
    "",
    "Operator request:",
    item.inputText,
  ];

  return {
    format: {
      kind: "json_schema",
      schema: missionSpecJsonSchema,
      schemaName: "mission_spec_eval",
    },
    source: "apps/control-plane/src/modules/evals/prompt-sources.ts#compiler.v1",
    target: "compiler",
    text: lines.join("\n"),
    version: "mission-compiler-eval.v1",
  };
}

function flattenUserInput(inputs: UserInput[]) {
  return inputs
    .map((input) => (input.type === "text" ? input.text : ""))
    .filter(Boolean)
    .join("\n\n");
}

const missionSpecJsonSchema = {
  additionalProperties: false,
  properties: {
    acceptance: {
      items: {
        type: "string",
      },
      minItems: 1,
      type: "array",
    },
    constraints: {
      additionalProperties: false,
      properties: {
        allowedPaths: {
          items: {
            type: "string",
          },
          type: "array",
        },
        mustNot: {
          items: {
            type: "string",
          },
          type: "array",
        },
        targetBranch: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
      },
      required: ["mustNot", "allowedPaths", "targetBranch"],
      type: "object",
    },
    deliverables: {
      items: {
        type: "string",
      },
      minItems: 1,
      type: "array",
    },
    evidenceRequirements: {
      items: {
        type: "string",
      },
      type: "array",
    },
    objective: {
      minLength: 1,
      type: "string",
    },
    repos: {
      items: {
        type: "string",
      },
      minItems: 1,
      type: "array",
    },
    riskBudget: {
      additionalProperties: false,
      properties: {
        allowNetwork: {
          type: "boolean",
        },
        maxCostUsd: {
          exclusiveMinimum: 0,
          type: "number",
        },
        maxWallClockMinutes: {
          exclusiveMinimum: 0,
          type: "integer",
        },
        requiresHumanApprovalFor: {
          items: {
            type: "string",
          },
          type: "array",
        },
        sandboxMode: {
          enum: ["read-only", "patch-only", "merge-eligible", "deploy-eligible"],
          type: "string",
        },
      },
      required: [
        "sandboxMode",
        "maxWallClockMinutes",
        "maxCostUsd",
        "allowNetwork",
        "requiresHumanApprovalFor",
      ],
      type: "object",
    },
    title: {
      minLength: 1,
      type: "string",
    },
    type: {
      enum: ["build", "incident", "release", "discovery"],
      type: "string",
    },
  },
  required: [
    "type",
    "title",
    "objective",
    "repos",
    "constraints",
    "acceptance",
    "riskBudget",
    "deliverables",
    "evidenceRequirements",
  ],
  type: "object",
} satisfies Record<string, unknown>;
