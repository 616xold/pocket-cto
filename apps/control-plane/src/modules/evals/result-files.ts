import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { EvalProviderMetadata, EvalResultRecord } from "./types";
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
  return {
    ...record,
    candidate: {
      ...record.candidate,
      provider: normalizeProviderMetadata(record.candidate.provider),
    },
    grader: {
      ...record.grader,
      provider: normalizeProviderMetadata(record.grader.provider),
    },
    provenance: {
      branchName: record.provenance?.branchName ?? null,
      datasetName: record.provenance?.datasetName ?? record.target,
      gitSha: record.provenance?.gitSha ?? null,
      promptVersion:
        record.provenance?.promptVersion ??
        record.prompt?.version ??
        "unknown-prompt-version",
    },
    reference: record.reference
      ? {
          ...record.reference,
          provider: normalizeProviderMetadata(record.reference.provider),
        }
      : null,
  };
}

function normalizeProviderMetadata(
  provider:
    | EvalProviderMetadata
    | {
        requestId?: string | null;
        requestedModel: string;
        resolvedModel: string | null;
        responseId: string | null;
        usage: EvalProviderMetadata["usage"];
      }
    | null
    | undefined,
): EvalProviderMetadata | null {
  if (!provider) {
    return null;
  }

  if ("backend" in provider && "transport" in provider) {
    return provider;
  }

  return {
    backend: "openai_responses",
    codexVersion: null,
    proofMode: "api_key",
    provider: "openai-responses",
    requestId: ("requestId" in provider ? provider.requestId : null) ?? null,
    requestedModel: provider.requestedModel,
    resolvedModel: provider.resolvedModel,
    responseId: provider.responseId,
    threadId: null,
    transport: "openai_responses_api",
    turnId: null,
    userAgent: null,
    usage: provider.usage,
  };
}
