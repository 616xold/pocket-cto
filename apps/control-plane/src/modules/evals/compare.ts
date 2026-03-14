import { basename } from "node:path";
import type { EvalDimension, EvalResultRecord } from "./types";
import { evalDimensions } from "./types";
import { readEvalResultFile } from "./result-files";

export async function runEvalCompareCommand(argv: string[]) {
  const args = parseCompareArgs(argv);
  const [a, b] = await Promise.all([
    readEvalResultFile(args.a),
    readEvalResultFile(args.b),
  ]);

  return buildEvalCompareReport({
    aPath: a.path,
    aRecords: a.records,
    bPath: b.path,
    bRecords: b.records,
  });
}

export function formatEvalCompareReport(report: EvalCompareReport) {
  const lines = [
    "Eval compare",
    `A: ${report.a.fileName} (${report.a.candidateModel} / ${report.a.graderModel})`,
    `B: ${report.b.fileName} (${report.b.candidateModel} / ${report.b.graderModel})`,
    `Overall score: ${report.a.averageOverallScore} -> ${report.b.averageOverallScore} (${formatDelta(report.overallDelta)})`,
    `Dimensions: ${formatDimensionDeltas(report.dimensionDeltas)}`,
    `Datasets: ${report.a.datasetNames.join(", ")} -> ${report.b.datasetNames.join(", ")}`,
    `Git: ${formatRevision(report.a.branchName, report.a.gitSha)} -> ${formatRevision(report.b.branchName, report.b.gitSha)}`,
  ];

  return lines.join("\n").concat("\n");
}

type EvalCompareArgs = {
  a: string;
  b: string;
};

type EvalCompareSide = {
  averageOverallScore: number;
  branchName: string | null;
  candidateModel: string;
  datasetNames: string[];
  fileName: string;
  gitSha: string | null;
  graderModel: string;
};

export type EvalCompareReport = {
  a: EvalCompareSide;
  b: EvalCompareSide;
  dimensionDeltas: Record<EvalDimension, number>;
  overallDelta: number;
};

export function buildEvalCompareReport(input: {
  aPath: string;
  aRecords: EvalResultRecord[];
  bPath: string;
  bRecords: EvalResultRecord[];
}): EvalCompareReport {
  const a = summarizeCompareSide(input.aPath, input.aRecords);
  const b = summarizeCompareSide(input.bPath, input.bRecords);

  return {
    a,
    b,
    dimensionDeltas: Object.fromEntries(
      evalDimensions.map((dimension) => [
        dimension,
        roundOneDecimal(
          averageDimension(input.bRecords, dimension) -
            averageDimension(input.aRecords, dimension),
        ),
      ]),
    ) as Record<EvalDimension, number>,
    overallDelta: roundOneDecimal(
      b.averageOverallScore - a.averageOverallScore,
    ),
  };
}

function parseCompareArgs(argv: string[]): EvalCompareArgs {
  let a: string | null = null;
  let b: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--a") {
      a = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--b") {
      b = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown compare flag: ${arg}`);
  }

  if (!a || !b) {
    throw new Error("Compare requires --a <file> and --b <file>.");
  }

  return {
    a,
    b,
  };
}

function summarizeCompareSide(
  filePath: string,
  records: EvalResultRecord[],
): EvalCompareSide {
  if (records.length === 0) {
    throw new Error(`Eval result file ${filePath} does not contain any records.`);
  }

  const first = records[0];

  return {
    averageOverallScore: roundOneDecimal(
      records.reduce((sum, record) => sum + record.combined.overallScore, 0) /
        records.length,
    ),
    branchName: first?.provenance.branchName ?? null,
    candidateModel: first?.candidate.model ?? "unknown-candidate-model",
    datasetNames: Array.from(
      new Set(records.map((record) => record.provenance.datasetName)),
    ),
    fileName: basename(filePath),
    gitSha: first?.provenance.gitSha ?? null,
    graderModel: first?.grader.model ?? "dry-run",
  };
}

function averageDimension(records: EvalResultRecord[], dimension: EvalDimension) {
  return records.reduce(
    (sum, record) => sum + record.combined.scores[dimension],
    0,
  ) / records.length;
}

function formatDimensionDeltas(deltas: Record<EvalDimension, number>) {
  return evalDimensions
    .map((dimension) => `${dimension}=${formatDelta(deltas[dimension])}`)
    .join(", ");
}

function formatRevision(branchName: string | null, gitSha: string | null) {
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

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${roundOneDecimal(value)}`;
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
