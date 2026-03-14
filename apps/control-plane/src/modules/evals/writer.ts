import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getEvalResultsDirectory } from "./paths";
import type { EvalResultRecord } from "./types";

export async function writeEvalResults(input: {
  outputDirectory?: string;
  runLabel: string;
  timestamp: string;
  records: EvalResultRecord[];
}) {
  const outputDirectory = input.outputDirectory ?? getEvalResultsDirectory();
  const filePath = buildResultsFilePath({
    outputDirectory,
    runLabel: input.runLabel,
    timestamp: input.timestamp,
  });

  await mkdir(outputDirectory, {
    recursive: true,
  });
  await writeFile(
    filePath,
    input.records.map((record) => JSON.stringify(record)).join("\n").concat("\n"),
    "utf8",
  );

  return filePath;
}

export function buildResultsFilePath(input: {
  outputDirectory: string;
  runLabel: string;
  timestamp: string;
}) {
  const compactTimestamp = input.timestamp
    .replace(/[:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/-/g, "");
  const safeLabel = input.runLabel.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

  return join(input.outputDirectory, `${compactTimestamp}-${safeLabel}.jsonl`);
}

export function createPromptRecord(input: {
  source: string;
  text: string;
  version: string;
}) {
  return {
    sha256: createHash("sha256").update(input.text).digest("hex"),
    source: input.source,
    text: input.text,
    version: input.version,
  };
}
