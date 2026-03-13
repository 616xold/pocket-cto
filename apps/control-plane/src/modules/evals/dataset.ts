import { readFile } from "node:fs/promises";
import { z } from "zod";
import { MissionTaskRoleSchema, MissionTypeSchema } from "@pocket-cto/domain";
import { getEvalDatasetPath } from "./paths";

export const evalTargetSchema = z.enum(["planner", "executor", "compiler"]);

const workflowPolicySchema = z.object({
  excerpt: z.string(),
  path: z.string(),
  truncated: z.boolean(),
});

const riskBudgetSchema = z.object({
  allowNetwork: z.boolean(),
  maxCostUsd: z.number().positive(),
  maxWallClockMinutes: z.number().int().positive(),
  requiresHumanApprovalFor: z.array(z.string()),
  sandboxMode: z.enum([
    "read-only",
    "patch-only",
    "merge-eligible",
    "deploy-eligible",
  ]),
});

const missionConstraintSchema = z.object({
  allowedPaths: z.array(z.string()),
  mustNot: z.array(z.string()),
  targetBranch: z.string().optional(),
});

const promptMissionSchema = z.object({
  acceptance: z.array(z.string()).min(1),
  constraints: missionConstraintSchema,
  evidenceRequirements: z.array(z.string()),
  objective: z.string().min(1),
  type: MissionTypeSchema,
});

const workspaceSchema = z.object({
  branchName: z.string().nullable(),
  repo: z.string().min(1),
  rootPath: z.string().min(1),
});

const taskSchema = z.object({
  role: MissionTaskRoleSchema,
  sequence: z.number().int().nonnegative(),
});

const textExpectationsSchema = z.object({
  actionabilitySignals: z.array(z.string()),
  evidenceSignals: z.array(z.string()),
  forbiddenPhrases: z.array(z.string()),
  mustMention: z.array(z.string()),
  requiredSections: z.array(z.string()).min(1),
});

const compilerExpectationsSchema = z.object({
  expectedAllowedPaths: z.array(z.string()),
  expectedMustNot: z.array(z.string()),
  expectedRepos: z.array(z.string()).min(1),
  expectedType: MissionTypeSchema,
  requiredAcceptancePhrases: z.array(z.string()),
  requiredDeliverables: z.array(z.string()),
  requiredEvidenceRequirements: z.array(z.string()),
});

const plannerDatasetItemSchema = z.object({
  context: z.object({
    mission: promptMissionSchema,
    task: taskSchema,
    workflowPolicy: workflowPolicySchema.nullable(),
    workspace: workspaceSchema,
  }),
  dryRunOutput: z.string().min(1),
  expectations: textExpectationsSchema,
  id: z.string().min(1),
  notes: z.string().optional(),
});

const executorPlannerArtifactSchema = z.object({
  artifactId: z.string().min(1),
  body: z.string().min(1),
  justification: z.string().min(1),
  resolution: z.enum(["dependency_task", "mission_latest_planner"]),
  sourceTaskId: z.string().min(1),
  sourceTaskSequence: z.number().int().nonnegative(),
  summary: z.string().nullable(),
  uri: z.string().min(1),
});

const executorDatasetItemSchema = z.object({
  context: z.object({
    mission: promptMissionSchema,
    plannerArtifact: executorPlannerArtifactSchema,
    task: taskSchema,
    workflowPolicy: workflowPolicySchema.nullable(),
    workspace: workspaceSchema,
  }),
  dryRunOutput: z.string().min(1),
  expectations: textExpectationsSchema,
  id: z.string().min(1),
  notes: z.string().optional(),
});

const compilerDatasetItemSchema = z.object({
  dryRunOutput: z.object({
    acceptance: z.array(z.string()).min(1),
    constraints: missionConstraintSchema,
    deliverables: z.array(z.string()).min(1),
    evidenceRequirements: z.array(z.string()),
    objective: z.string().min(1),
    repos: z.array(z.string()).min(1),
    riskBudget: riskBudgetSchema,
    title: z.string().min(1),
    type: MissionTypeSchema,
  }),
  expectations: compilerExpectationsSchema,
  id: z.string().min(1),
  inputText: z.string().min(1),
  notes: z.string().optional(),
});

export type EvalTarget = z.infer<typeof evalTargetSchema>;
export type TextEvalExpectations = z.infer<typeof textExpectationsSchema>;
export type CompilerEvalExpectations = z.infer<
  typeof compilerExpectationsSchema
>;
export type PlannerEvalDatasetItem = z.infer<typeof plannerDatasetItemSchema>;
export type ExecutorEvalDatasetItem = z.infer<typeof executorDatasetItemSchema>;
export type CompilerEvalDatasetItem = z.infer<typeof compilerDatasetItemSchema>;

export async function loadPlannerEvalDataset() {
  return loadDataset(
    getEvalDatasetPath("planner"),
    z.array(plannerDatasetItemSchema).min(1),
  );
}

export async function loadExecutorEvalDataset() {
  return loadDataset(
    getEvalDatasetPath("executor"),
    z.array(executorDatasetItemSchema).min(1),
  );
}

export async function loadCompilerEvalDataset() {
  return loadDataset(
    getEvalDatasetPath("compiler"),
    z.array(compilerDatasetItemSchema).min(1),
  );
}

async function loadDataset<T>(
  datasetPath: string,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const raw = await readFile(datasetPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return schema.parse(parsed);
}
