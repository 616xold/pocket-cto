import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { EvalResultRecord } from "./types";
import { getRepoRoot } from "./paths";

export async function readEvalResultFile(filePath: string) {
  const resolvedPath = isAbsolute(filePath)
    ? filePath
    : resolve(getRepoRoot(), filePath);
  const content = await readFile(resolvedPath, "utf8");
  const records = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => normalizeEvalResultRecord(JSON.parse(line) as EvalResultRecord));

  return {
    path: resolvedPath,
    records,
  };
}

function normalizeEvalResultRecord(record: EvalResultRecord): EvalResultRecord {
  if (record.provenance) {
    return record;
  }

  return {
    ...record,
    provenance: {
      branchName: null,
      datasetName: record.target,
      gitSha: null,
      promptVersion: record.prompt?.version ?? "unknown-prompt-version",
    },
  };
}
