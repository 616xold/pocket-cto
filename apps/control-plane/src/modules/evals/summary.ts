import { basename } from "node:path";
import type {
  EvalBackend,
  EvalProviderCallSummary,
  EvalProviderMetadata,
  EvalResultRecord,
  EvalRunSummary,
} from "./types";

export function buildEvalRunSummary(input: {
  backend: EvalBackend;
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
    backend: input.backend,
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
    `Backend: ${summary.backend}`,
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

  const backends = Array.from(
    new Set(liveProviders.map((provider) => provider.backend)),
  );
  const transports = Array.from(
    new Set(liveProviders.map((provider) => provider.transport)),
  );
  const proofModes = Array.from(
    new Set(liveProviders.map((provider) => provider.proofMode)),
  );
  const threadIds = Array.from(
    new Set(
      liveProviders
        .map((provider) => provider.threadId)
        .filter((threadId): threadId is string => Boolean(threadId)),
    ),
  );
  const turnIds = Array.from(
    new Set(
      liveProviders
        .map((provider) => provider.turnId)
        .filter((turnId): turnId is string => Boolean(turnId)),
    ),
  );
  const codexVersions = Array.from(
    new Set(
      liveProviders
        .map((provider) => provider.codexVersion)
        .filter((version): version is string => Boolean(version)),
    ),
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
    backends,
    codexVersions,
    calls: liveProviders.length,
    proofModes,
    responseIds,
    threadIds,
    transports,
    turnIds,
    usage: hasUsage ? usageTotals : null,
  };
}

function formatProviderSummary(
  label: string,
  summary: EvalProviderCallSummary,
) {
  const details = [
    `${summary.calls} call${summary.calls === 1 ? "" : "s"}`,
    summary.backends.length > 0
      ? `backend=${summary.backends.join(", ")}`
      : "backend unavailable",
    summary.transports.length > 0
      ? `transport=${summary.transports.join(", ")}`
      : "transport unavailable",
    summary.usage
      ? `tokens in/out/total=${summary.usage.inputTokens}/${summary.usage.outputTokens}/${summary.usage.totalTokens}`
      : "token usage unavailable",
  ];

  if (summary.proofModes.length > 0) {
    details.push(`proof mode=${summary.proofModes.join(", ")}`);
  }

  if (summary.responseIds.length > 0) {
    details.push(`response ids=${summary.responseIds.join(", ")}`);
  }

  if (summary.threadIds.length > 0) {
    details.push(`thread ids=${summary.threadIds.join(", ")}`);
  }

  if (summary.turnIds.length > 0) {
    details.push(`turn ids=${summary.turnIds.join(", ")}`);
  }

  if (summary.codexVersions.length > 0) {
    details.push(`codex versions=${summary.codexVersions.join(", ")}`);
  }

  if (
    summary.responseIds.length === 0 &&
    summary.threadIds.length === 0 &&
    summary.turnIds.length === 0
  ) {
    details.push("backend proof ids unavailable");
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
