import { basename } from "node:path";
import type {
  EvalProviderCallSummary,
  EvalProviderMetadata,
  EvalResultRecord,
  EvalRunSummary,
} from "./types";

export function buildEvalRunSummary(input: {
  candidateModel: string;
  graderModel: string;
  mode: "dry-run" | "live";
  outputPath: string;
  records: EvalResultRecord[];
  runLabel: string;
}): EvalRunSummary {
  const samples = input.records.length;
  const averageOverallScore =
    samples === 0
      ? 0
      : Math.round(
          (input.records.reduce(
            (sum, record) => sum + record.combined.overallScore,
            0,
          ) /
            samples) *
            10,
        ) / 10;

  return {
    averageOverallScore,
    candidateModel: input.candidateModel,
    graderModel: input.graderModel,
    provenance: {
      branchName: firstNonEmpty(
        input.records.map((record) => record.provenance.branchName),
      ),
      datasetNames: uniqueValues(
        input.records.map((record) => record.provenance.datasetName),
      ),
      gitSha: firstNonEmpty(
        input.records.map((record) => record.provenance.gitSha),
      ),
      promptVersions: uniqueValues(
        input.records.map((record) => record.provenance.promptVersion),
      ),
    },
    live: {
      candidate: summarizeProviderCalls(
        input.records.map((record) => record.candidate.provider),
      ),
      grader: summarizeProviderCalls(
        input.records.map((record) => record.grader.provider),
      ),
      reference: summarizeProviderCalls(
        input.records.map((record) => record.reference?.provider ?? null),
      ),
    },
    mode: input.mode,
    outputFileName: basename(input.outputPath),
    outputPath: input.outputPath,
    runLabel: input.runLabel,
    samples,
  };
}

export function formatEvalRunSummary(summary: EvalRunSummary) {
  const lines = [
    `Eval run ${summary.runLabel}`,
    `Mode: ${summary.mode}`,
    `Candidate model: ${summary.candidateModel}`,
    `Grader model: ${summary.graderModel}`,
    `Dataset: ${summary.provenance.datasetNames.join(", ")}`,
    `Prompt version: ${summary.provenance.promptVersions.join(", ")}`,
    `Git: ${formatGitSummary(summary.provenance.branchName, summary.provenance.gitSha)}`,
    `Samples: ${summary.samples}`,
    `Average score: ${summary.averageOverallScore}`,
    `Results: ${summary.outputPath}`,
  ];

  if (summary.mode === "dry-run") {
    lines.push("Dry-run: no OpenAI API calls were made.");
    return lines.join("\n").concat("\n");
  }

  lines.push(formatProviderSummary("Candidate", summary.live.candidate));
  lines.push(formatProviderSummary("Grader", summary.live.grader));

  if (summary.live.reference.calls > 0) {
    lines.push(formatProviderSummary("Reference", summary.live.reference));
  }

  return lines.join("\n").concat("\n");
}

function summarizeProviderCalls(
  providers: Array<EvalProviderMetadata | null>,
): EvalProviderCallSummary {
  const liveProviders = providers.filter(
    (provider): provider is EvalProviderMetadata => provider !== null,
  );

  const responseIds = Array.from(
    new Set(
      liveProviders
        .map((provider) => provider.responseId)
        .filter((responseId): responseId is string => Boolean(responseId)),
    ),
  );

  const usageTotals = liveProviders.reduce(
    (totals, provider) => ({
      inputTokens: totals.inputTokens + (provider.usage?.inputTokens ?? 0),
      outputTokens: totals.outputTokens + (provider.usage?.outputTokens ?? 0),
      totalTokens: totals.totalTokens + (provider.usage?.totalTokens ?? 0),
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
  );

  const hasUsage = liveProviders.some((provider) => provider.usage !== null);

  return {
    calls: liveProviders.length,
    responseIds,
    usage: hasUsage ? usageTotals : null,
  };
}

function formatProviderSummary(
  label: string,
  summary: EvalProviderCallSummary,
) {
  const details = [
    `${summary.calls} call${summary.calls === 1 ? "" : "s"}`,
    summary.usage
      ? `tokens in/out/total=${summary.usage.inputTokens}/${summary.usage.outputTokens}/${summary.usage.totalTokens}`
      : "token usage unavailable",
  ];

  if (summary.responseIds.length > 0) {
    details.push(`response ids=${summary.responseIds.join(", ")}`);
  } else {
    details.push("response ids unavailable");
  }

  return `${label} live proof: ${details.join("; ")}`;
}

function uniqueValues(values: Array<string | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}

function firstNonEmpty(values: Array<string | null>) {
  return values.find((value): value is string => Boolean(value)) ?? null;
}

function formatGitSummary(branchName: string | null, gitSha: string | null) {
  if (branchName && gitSha) {
    return `${branchName} @ ${gitSha.slice(0, 12)}`;
  }

  if (gitSha) {
    return gitSha.slice(0, 12);
  }

  if (branchName) {
    return branchName;
  }

  return "unavailable";
}
