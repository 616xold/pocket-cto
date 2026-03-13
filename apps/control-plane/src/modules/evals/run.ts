import { loadEvalEnv, type EvalEnv } from "@pocket-cto/config";
import type {
  CompilerEvalDatasetItem,
  ExecutorEvalDatasetItem,
  PlannerEvalDatasetItem,
} from "./dataset";
import {
  loadCompilerEvalDataset,
  loadExecutorEvalDataset,
  loadPlannerEvalDataset,
} from "./dataset";
import {
  buildDryRunModelAssessment,
  combineAssessments,
  gradeWithModel,
  loadEvalRubric,
} from "./grader";
import { OpenAIResponsesClient } from "./openai-client";
import {
  buildCompilerPromptEnvelope,
  buildExecutorPromptEnvelope,
  buildPlannerPromptEnvelope,
} from "./prompt-sources";
import { evaluateCompilerOutput, evaluateTextOutput } from "./rules";
import { parseEvalCliArgs, expandEvalTargets } from "./args";
import { assertLiveEvalEnabled, resolveEvalRunConfig } from "./config";
import type { EvalResultRecord } from "./types";
import { createPromptRecord, summarizeResults, writeEvalResults } from "./writer";

export async function runEvalCommand(
  argv: string[],
  options?: {
    env?: EvalEnv;
    outputDirectory?: string;
  },
) {
  const args = parseEvalCliArgs(argv);
  const env = options?.env ?? loadEvalEnv();
  const config = resolveEvalRunConfig({
    args,
    env,
  });

  assertLiveEvalEnabled({
    apiKey: config.apiKey,
    dryRun: config.dryRun,
    env,
  });

  const startedAt = new Date().toISOString();
  const rubric = await loadEvalRubric();
  const targets = expandEvalTargets(args.target);
  const client = config.dryRun
    ? null
    : new OpenAIResponsesClient(config.apiKey as string);
  const records: EvalResultRecord[] = [];

  for (const target of targets) {
    if (target === "planner") {
      const dataset = await loadPlannerEvalDataset();
      const selectedItems = dataset.slice(0, config.limit ?? dataset.length);

      for (const item of selectedItems) {
        records.push(
          await runPlannerItem({
            client,
            config,
            item,
            rubric,
            startedAt,
          }),
        );
      }

      continue;
    }

    if (target === "executor") {
      const dataset = await loadExecutorEvalDataset();
      const selectedItems = dataset.slice(0, config.limit ?? dataset.length);

      for (const item of selectedItems) {
        records.push(
          await runExecutorItem({
            client,
            config,
            item,
            rubric,
            startedAt,
          }),
        );
      }

      continue;
    }

    const dataset = await loadCompilerEvalDataset();
    const selectedItems = dataset.slice(0, config.limit ?? dataset.length);

    for (const item of selectedItems) {
      records.push(
        await runCompilerItem({
          client,
          config,
          item,
          rubric,
          startedAt,
        }),
      );
    }
  }

  const timestamp = new Date().toISOString();
  const outputPath = await writeEvalResults({
    outputDirectory: options?.outputDirectory,
    records,
    runLabel: args.target,
    timestamp,
  });

  return {
    ...summarizeResults({
      outputPath,
      records,
      runLabel: args.target,
    }),
    records,
  };
}

async function runPlannerItem(input: {
  client: OpenAIResponsesClient | null;
  config: ReturnType<typeof resolveEvalRunConfig>;
  item: PlannerEvalDatasetItem;
  rubric: Awaited<ReturnType<typeof loadEvalRubric>>;
  startedAt: string;
}): Promise<EvalResultRecord> {
  const prompt = createPromptRecord(buildPlannerPromptEnvelope(input.item));
  const candidate = input.config.dryRun
    ? buildDryRunCandidate(input.item.dryRunOutput)
    : await runLiveCandidate({
        client: input.client,
        format: {
          kind: "text",
        },
        model: input.config.candidateModel,
        prompt: prompt.text,
      });
  const reference = input.config.useReference
    ? await runOptionalReference({
        client: input.client,
        dryRun: input.config.dryRun,
        dryRunOutput: input.item.dryRunOutput,
        model: input.config.referenceModel,
        prompt: prompt.text,
      })
    : null;
  const rule = evaluateTextOutput({
    expectations: input.item.expectations,
    output: candidate.text,
  });
  const grader = input.config.dryRun
    ? buildDryRunModelAssessment(rule)
    : await gradeWithModel({
        candidateModel: input.config.candidateModel,
        candidateOutputText: candidate.text,
        client: input.client as OpenAIResponsesClient,
        expectations: input.item.expectations,
        graderModel: input.config.graderModel,
        itemId: input.item.id,
        promptSource: prompt.source,
        promptText: prompt.text,
        referenceOutputText: reference?.text ?? null,
        rubric: input.rubric,
        ruleAssessment: rule,
        target: "planner",
      });
  const combined = combineAssessments({
    model: grader,
    rule,
  });

  return buildResultRecord({
    candidate,
    candidateModel: input.config.dryRun
      ? "dry-run-fixture"
      : input.config.candidateModel,
    combined,
    grader,
    itemId: input.item.id,
    mode: input.config.dryRun ? "dry-run" : "live",
    notes: mergeNotes(rule.notes, grader.notes, input.item.notes),
    prompt,
    reference,
    referenceModel:
      input.config.useReference && reference
        ? input.config.dryRun
          ? "dry-run-reference"
          : input.config.referenceModel
        : null,
    rubric: input.rubric,
    rule,
    startedAt: input.startedAt,
    target: "planner",
  });
}

async function runExecutorItem(input: {
  client: OpenAIResponsesClient | null;
  config: ReturnType<typeof resolveEvalRunConfig>;
  item: ExecutorEvalDatasetItem;
  rubric: Awaited<ReturnType<typeof loadEvalRubric>>;
  startedAt: string;
}): Promise<EvalResultRecord> {
  const prompt = createPromptRecord(buildExecutorPromptEnvelope(input.item));
  const candidate = input.config.dryRun
    ? buildDryRunCandidate(input.item.dryRunOutput)
    : await runLiveCandidate({
        client: input.client,
        format: {
          kind: "text",
        },
        model: input.config.candidateModel,
        prompt: prompt.text,
      });
  const reference = input.config.useReference
    ? await runOptionalReference({
        client: input.client,
        dryRun: input.config.dryRun,
        dryRunOutput: input.item.dryRunOutput,
        model: input.config.referenceModel,
        prompt: prompt.text,
      })
    : null;
  const rule = evaluateTextOutput({
    expectations: input.item.expectations,
    output: candidate.text,
  });
  const grader = input.config.dryRun
    ? buildDryRunModelAssessment(rule)
    : await gradeWithModel({
        candidateModel: input.config.candidateModel,
        candidateOutputText: candidate.text,
        client: input.client as OpenAIResponsesClient,
        expectations: input.item.expectations,
        graderModel: input.config.graderModel,
        itemId: input.item.id,
        promptSource: prompt.source,
        promptText: prompt.text,
        referenceOutputText: reference?.text ?? null,
        rubric: input.rubric,
        ruleAssessment: rule,
        target: "executor",
      });
  const combined = combineAssessments({
    model: grader,
    rule,
  });

  return buildResultRecord({
    candidate,
    candidateModel: input.config.dryRun
      ? "dry-run-fixture"
      : input.config.candidateModel,
    combined,
    grader,
    itemId: input.item.id,
    mode: input.config.dryRun ? "dry-run" : "live",
    notes: mergeNotes(rule.notes, grader.notes, input.item.notes),
    prompt,
    reference,
    referenceModel:
      input.config.useReference && reference
        ? input.config.dryRun
          ? "dry-run-reference"
          : input.config.referenceModel
        : null,
    rubric: input.rubric,
    rule,
    startedAt: input.startedAt,
    target: "executor",
  });
}

async function runCompilerItem(input: {
  client: OpenAIResponsesClient | null;
  config: ReturnType<typeof resolveEvalRunConfig>;
  item: CompilerEvalDatasetItem;
  rubric: Awaited<ReturnType<typeof loadEvalRubric>>;
  startedAt: string;
}): Promise<EvalResultRecord> {
  const compilerEnvelope = buildCompilerPromptEnvelope(input.item);
  const prompt = createPromptRecord(compilerEnvelope);
  const candidate = input.config.dryRun
    ? buildDryRunCandidate(
        JSON.stringify(input.item.dryRunOutput, null, 2),
        input.item.dryRunOutput,
      )
    : await runLiveCandidate({
        client: input.client,
        format: compilerEnvelope.format,
        model: input.config.candidateModel,
        prompt: prompt.text,
      });
  const reference = input.config.useReference
    ? await runOptionalReference({
        client: input.client,
        dryRun: input.config.dryRun,
        dryRunOutput: JSON.stringify(input.item.dryRunOutput, null, 2),
        dryRunStructuredOutput: input.item.dryRunOutput,
        format: compilerEnvelope.format,
        model: input.config.referenceModel,
        prompt: prompt.text,
      })
    : null;
  const rule = evaluateCompilerOutput({
    expectations: input.item.expectations,
    output: candidate.output,
    outputText: candidate.text,
  });
  const grader = input.config.dryRun
    ? buildDryRunModelAssessment(rule)
    : await gradeWithModel({
        candidateModel: input.config.candidateModel,
        candidateOutputText: candidate.text,
        client: input.client as OpenAIResponsesClient,
        expectations: input.item.expectations,
        graderModel: input.config.graderModel,
        itemId: input.item.id,
        promptSource: prompt.source,
        promptText: prompt.text,
        referenceOutputText: reference?.text ?? null,
        rubric: input.rubric,
        ruleAssessment: rule,
        target: "compiler",
      });
  const combined = combineAssessments({
    model: grader,
    rule,
  });

  return buildResultRecord({
    candidate,
    candidateModel: input.config.dryRun
      ? "dry-run-fixture"
      : input.config.candidateModel,
    combined,
    grader,
    itemId: input.item.id,
    mode: input.config.dryRun ? "dry-run" : "live",
    notes: mergeNotes(rule.notes, grader.notes, input.item.notes),
    prompt,
    reference,
    referenceModel:
      input.config.useReference && reference
        ? input.config.dryRun
          ? "dry-run-reference"
          : input.config.referenceModel
        : null,
    rubric: input.rubric,
    rule,
    startedAt: input.startedAt,
    target: "compiler",
  });
}

function buildDryRunCandidate(text: string, output: unknown = text) {
  return {
    output,
    text,
  };
}

async function runLiveCandidate(input: {
  client: OpenAIResponsesClient | null;
  format:
    | {
        kind: "json_schema";
        schema: Record<string, unknown>;
        schemaName: string;
      }
    | {
        kind: "text";
      };
  model: string;
  prompt: string;
}) {
  if (!input.client) {
    throw new Error("Live candidate execution requires an OpenAI client.");
  }

  return input.client.generate({
    format: input.format,
    model: input.model,
    prompt: input.prompt,
  });
}

async function runOptionalReference(input: {
  client: OpenAIResponsesClient | null;
  dryRun: boolean;
  dryRunOutput: string;
  dryRunStructuredOutput?: unknown;
  format?:
    | {
        kind: "json_schema";
        schema: Record<string, unknown>;
        schemaName: string;
      }
    | {
        kind: "text";
      };
  model: string;
  prompt: string;
}) {
  if (input.dryRun) {
    return buildDryRunCandidate(
      input.dryRunOutput,
      input.dryRunStructuredOutput ?? input.dryRunOutput,
    );
  }

  return runLiveCandidate({
    client: input.client,
    format: input.format ?? {
      kind: "text",
    },
    model: input.model,
    prompt: input.prompt,
  });
}

function buildResultRecord(input: {
  candidate: {
    output: unknown;
    text: string;
  };
  candidateModel: string;
  combined: ReturnType<typeof combineAssessments>;
  grader: Awaited<ReturnType<typeof gradeWithModel>> | ReturnType<typeof buildDryRunModelAssessment>;
  itemId: string;
  mode: "dry-run" | "live";
  notes: string[];
  prompt: ReturnType<typeof createPromptRecord>;
  reference: {
    output: unknown;
    text: string;
  } | null;
  referenceModel: string | null;
  rubric: Awaited<ReturnType<typeof loadEvalRubric>>;
  rule: ReturnType<typeof evaluateCompilerOutput> | ReturnType<typeof evaluateTextOutput>;
  startedAt: string;
  target: "planner" | "executor" | "compiler";
}): EvalResultRecord {
  const timestamp = new Date().toISOString();

  return {
    candidate: {
      model: input.candidateModel,
      output: input.candidate.output,
      text: input.candidate.text,
    },
    combined: input.combined,
    completedAt: timestamp,
    grader: input.grader,
    itemId: input.itemId,
    mode: input.mode,
    notes: input.notes,
    prompt: input.prompt,
    reference: input.reference
      ? {
          model: input.referenceModel ?? "unknown-reference-model",
          output: input.reference.output,
          text: input.reference.text,
        }
      : null,
    rubric: {
      path: input.rubric.path,
      sha256: input.rubric.sha256,
    },
    rule: input.rule,
    startedAt: input.startedAt,
    target: input.target,
    timestamp,
  };
}

function mergeNotes(...groups: Array<string[] | string | undefined>) {
  const notes = groups.flatMap((group) =>
    typeof group === "string" ? [group] : group ?? [],
  );

  return Array.from(new Set(notes)).slice(0, 8);
}
