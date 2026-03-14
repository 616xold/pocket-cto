import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadEvalEnv, type EvalEnv } from "@pocket-cto/config";
import { maskApiKey, resolveEvalLiveGuardState } from "./config";
import { getEvalResultsDirectory } from "./paths";

export type EvalApiKeySource = "loaded .env" | "shell env" | "unknown";

export type EvalDoctorReport = {
  apiKey: {
    masked: string | null;
    present: boolean;
    source: EvalApiKeySource | null;
  };
  candidateModel: string;
  defaultMode: "dry-run" | "live";
  defaultRunBehavior: "dry-run-required" | "live";
  evalsEnabled: boolean;
  graderModel: string;
  referenceModel: string;
  resultsDirectory: string;
};

export function createEvalDoctorReport(input?: {
  apiKeySource?: EvalApiKeySource;
  cwd?: string;
  env?: EvalEnv;
  rawEnv?: NodeJS.ProcessEnv;
  resultsDirectory?: string;
}): EvalDoctorReport {
  const rawEnvBeforeLoad = input?.rawEnv ?? { ...process.env };
  const env = input?.env ?? loadEvalEnv();
  const liveGuard = resolveEvalLiveGuardState(env);
  const apiKeySource =
    input?.apiKeySource ??
    detectApiKeySource({
      cwd: input?.cwd ?? process.cwd(),
      loadedApiKey: liveGuard.apiKey,
      rawEnv: rawEnvBeforeLoad,
    });

  return {
    apiKey: {
      masked: maskApiKey(liveGuard.apiKey),
      present: liveGuard.apiKeyPresent,
      source: apiKeySource,
    },
    candidateModel: env.OPENAI_EVAL_MODEL,
    defaultMode: liveGuard.defaultMode,
    defaultRunBehavior: liveGuard.liveReady ? "live" : "dry-run-required",
    evalsEnabled: liveGuard.evalsEnabled,
    graderModel: env.OPENAI_EVAL_GRADER_MODEL,
    referenceModel: env.OPENAI_EVAL_REFERENCE_MODEL,
    resultsDirectory: input?.resultsDirectory ?? getEvalResultsDirectory(),
  };
}

export function formatEvalDoctorReport(report: EvalDoctorReport) {
  const lines = [
    "Eval doctor",
    `OPENAI_API_KEY: ${report.apiKey.present ? `present (${report.apiKey.masked})` : "missing"}`,
    `OPENAI_API_KEY source: ${report.apiKey.source ?? "unavailable"}`,
    `OPENAI_EVALS_ENABLED: ${report.evalsEnabled ? "true" : "false"}`,
    `Candidate model: ${report.candidateModel}`,
    `Grader model: ${report.graderModel}`,
    `Reference model: ${report.referenceModel}`,
    `Default mode: ${report.defaultMode}`,
    `Results directory: ${report.resultsDirectory}`,
  ];

  if (report.defaultRunBehavior === "dry-run-required") {
    lines.push(
      "Live evals are not fully enabled, so standard eval commands still need --dry-run until OPENAI_API_KEY is present and OPENAI_EVALS_ENABLED=true.",
    );
  }

  return lines.join("\n").concat("\n");
}

function detectApiKeySource(input: {
  cwd: string;
  loadedApiKey: string | null;
  rawEnv: NodeJS.ProcessEnv;
}): EvalApiKeySource | null {
  if (!input.loadedApiKey) {
    return null;
  }

  const shellApiKey = normalizeOptionalString(input.rawEnv.OPENAI_API_KEY);

  if (shellApiKey === input.loadedApiKey) {
    return "shell env";
  }

  return detectLoadedEnvSource({
    cwd: input.cwd,
    loadedApiKey: input.loadedApiKey,
  });
}

function detectLoadedEnvSource(input: {
  cwd: string;
  loadedApiKey: string;
}): EvalApiKeySource {
  const envPath = findNearestEnvPath(input.cwd);

  if (!envPath) {
    return "unknown";
  }

  try {
    const envFileApiKey = readOpenAiKeyFromEnvFile(envPath);
    return envFileApiKey === input.loadedApiKey ? "loaded .env" : "unknown";
  } catch {
    return "unknown";
  }
}

function findNearestEnvPath(cwd: string) {
  let currentDirectory = cwd;

  while (true) {
    const envPath = join(currentDirectory, ".env");

    if (existsSync(envPath)) {
      return envPath;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}

function readOpenAiKeyFromEnvFile(envPath: string) {
  const file = readFileSync(envPath, "utf8");
  const match = file.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)\s*$/m);

  if (!match?.[1]) {
    return null;
  }

  const rawValue = match[1].trim();
  const unquoted =
    rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : rawValue.startsWith("'") && rawValue.endsWith("'")
        ? rawValue.slice(1, -1)
        : rawValue;

  return normalizeOptionalString(unquoted);
}

function normalizeOptionalString(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
