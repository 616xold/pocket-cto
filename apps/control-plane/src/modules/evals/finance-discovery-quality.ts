import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { getEvalResultsDirectory, getRepoRoot } from "./paths";
import {
  loadEvalRepoProvenance,
  type EvalRepoProvenance,
} from "./provenance";

const execFileAsync = promisify(execFile);

const defaultRunLabel = "finance-discovery-quality";
const smokeCommandArgs = [
  "smoke:finance-discovery-quality:local",
  "--",
  "--json",
] as const;

export const financeDiscoveryQualityFamilies = [
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "spend_posture",
  "obligation_calendar_review",
  "policy_lookup",
] as const;

export type FinanceDiscoveryQualityFamily =
  (typeof financeDiscoveryQualityFamilies)[number];

export type FinanceDiscoveryQualityAssertion = {
  id: string;
  label: string;
  passed: boolean;
};

export type FinanceDiscoveryQualityPolicySourceScope = {
  documentRole: string;
  includeInCompile: boolean;
  latestExtractStatus: string | null;
  latestSnapshotVersion: number | null;
  policySourceId: string;
  sourceName: string;
};

export type FinanceDiscoveryQualitySmokeCase = {
  answerSummary: string;
  assertions: FinanceDiscoveryQualityAssertion[];
  caseLabel: string;
  freshness: {
    reasonSummary: string;
    state: string | null;
  };
  missionId: string;
  policySourceScope?: FinanceDiscoveryQualityPolicySourceScope;
  proofBundleStatus: string;
  questionKind: FinanceDiscoveryQualityFamily;
  unsupported: boolean;
};

export type FinanceDiscoveryQualitySmokeSummary = {
  allAssertionsPassed: boolean;
  assertionTotals: {
    passed: number;
    total: number;
  };
  cases: FinanceDiscoveryQualitySmokeCase[];
  company: {
    companyKey: string;
    displayName: string;
  };
  familiesCovered: FinanceDiscoveryQualityFamily[];
  generatedAt: string;
  humanSummary: string;
  runTag: string | null;
  schemaVersion: string;
};

export type FinanceDiscoveryQualityReport = {
  assertionTotals: {
    passed: number;
    total: number;
  };
  caseCount: number;
  cases: FinanceDiscoveryQualitySmokeCase[];
  familiesCovered: FinanceDiscoveryQualityFamily[];
  git: EvalRepoProvenance;
  humanSummary: string;
  runLabel: string;
  schemaVersion: string;
  smoke: {
    command: string;
    generatedAt: string | null;
    outputPath: string;
  };
  status: "failed" | "passed";
  timestamp: string;
  errorMessage: string | null;
};

export type FinanceDiscoveryQualityRunResult = {
  outputPath: string;
  report: FinanceDiscoveryQualityReport;
};

type FinanceDiscoveryQualityExecCommand = (
  file: string,
  args: string[],
  options: {
    cwd: string;
  },
) => Promise<{
  stderr: string;
  stdout: string;
}>;

export class FinanceDiscoveryQualityCommandError extends Error {
  constructor(readonly result: FinanceDiscoveryQualityRunResult) {
    super(result.report.humanSummary);
    this.name = "FinanceDiscoveryQualityCommandError";
  }
}

export function getFinanceDiscoveryQualitySmokeCommand() {
  return `pnpm ${smokeCommandArgs.join(" ")}`;
}

export function parseFinanceDiscoveryQualitySmokeSummary(raw: string) {
  const parsed = JSON.parse(
    extractJsonDocument(raw),
  ) as Partial<FinanceDiscoveryQualitySmokeSummary>;

  if (!Array.isArray(parsed.cases)) {
    throw new Error(
      "finance-discovery-quality smoke output did not include structured cases.",
    );
  }

  const cases = parsed.cases.map((entry) => ({
    answerSummary: entry.answerSummary ?? "",
    assertions: Array.isArray(entry.assertions)
      ? entry.assertions.map((assertion) => ({
          id: assertion.id,
          label: assertion.label,
          passed: assertion.passed !== false,
        }))
      : [],
    caseLabel: entry.caseLabel ?? entry.questionKind ?? "unknown",
    freshness: {
      reasonSummary: entry.freshness?.reasonSummary ?? "",
      state: entry.freshness?.state ?? null,
    },
    missionId: entry.missionId ?? "",
    policySourceScope: entry.policySourceScope,
    proofBundleStatus: entry.proofBundleStatus ?? "unknown",
    questionKind: entry.questionKind ?? "cash_posture",
    unsupported: entry.unsupported ?? false,
  }));

  const totalAssertions = cases.reduce(
    (sum, entry) => sum + entry.assertions.length,
    0,
  );
  const passedAssertions = cases.reduce(
    (sum, entry) =>
      sum + entry.assertions.filter((assertion) => assertion.passed).length,
    0,
  );

  return {
    allAssertionsPassed:
      parsed.allAssertionsPassed ?? passedAssertions === totalAssertions,
    assertionTotals: {
      passed: parsed.assertionTotals?.passed ?? passedAssertions,
      total: parsed.assertionTotals?.total ?? totalAssertions,
    },
    cases,
    company: {
      companyKey: parsed.company?.companyKey ?? "unknown-company",
      displayName: parsed.company?.displayName ?? "Unknown company",
    },
    familiesCovered:
      parsed.familiesCovered ??
      financeDiscoveryQualityFamilies.filter((family) =>
        cases.some((entry) => entry.questionKind === family),
      ),
    generatedAt: parsed.generatedAt ?? new Date(0).toISOString(),
    humanSummary:
      parsed.humanSummary ??
      buildPassingSummary({
        assertionTotals: {
          passed: passedAssertions,
          total: totalAssertions,
        },
        caseCount: cases.length,
        familiesCovered:
          parsed.familiesCovered ??
          financeDiscoveryQualityFamilies.filter((family) =>
            cases.some((entry) => entry.questionKind === family),
          ),
      }),
    runTag: parsed.runTag ?? null,
    schemaVersion:
      parsed.schemaVersion ?? "finance-discovery-quality-smoke.v1",
  } satisfies FinanceDiscoveryQualitySmokeSummary;
}

export async function runFinanceDiscoveryQualityCommand(options?: {
  execCommand?: FinanceDiscoveryQualityExecCommand;
  outputDirectory?: string;
  repoProvenance?: EvalRepoProvenance;
  runLabel?: string;
  timestamp?: string;
}) {
  const execCommand = options?.execCommand ?? runExecFile;
  const timestamp = options?.timestamp ?? new Date().toISOString();
  const runLabel = options?.runLabel ?? defaultRunLabel;
  const outputDirectory =
    options?.outputDirectory ??
    join(getEvalResultsDirectory(), "finance-discovery-quality");
  const smokeOutputDirectory = join(outputDirectory, "smoke");
  const smokeOutputPath = buildJsonArtifactPath({
    outputDirectory: smokeOutputDirectory,
    runLabel,
    timestamp,
  });
  const repoProvenance =
    options?.repoProvenance ?? (await loadEvalRepoProvenance());
  let report: FinanceDiscoveryQualityReport;

  try {
    const smoke = await execCommand("pnpm", [...smokeCommandArgs], {
      cwd: getRepoRoot(),
    });
    const smokeSummary = parseFinanceDiscoveryQualitySmokeSummary(smoke.stdout);

    await writeJsonArtifact(smokeOutputPath, smokeSummary);

    report = {
      assertionTotals: smokeSummary.assertionTotals,
      caseCount: smokeSummary.cases.length,
      cases: smokeSummary.cases,
      errorMessage: null,
      familiesCovered: smokeSummary.familiesCovered,
      git: repoProvenance,
      humanSummary: smokeSummary.humanSummary,
      runLabel,
      schemaVersion: "finance-discovery-quality-report.v1",
      smoke: {
        command: getFinanceDiscoveryQualitySmokeCommand(),
        generatedAt: smokeSummary.generatedAt,
        outputPath: smokeOutputPath,
      },
      status: smokeSummary.allAssertionsPassed ? "passed" : "failed",
      timestamp,
    };
  } catch (error) {
    report = {
      assertionTotals: {
        passed: 0,
        total: 0,
      },
      caseCount: 0,
      cases: [],
      errorMessage: extractErrorMessage(error),
      familiesCovered: [],
      git: repoProvenance,
      humanSummary: buildFailureSummary(extractErrorMessage(error)),
      runLabel,
      schemaVersion: "finance-discovery-quality-report.v1",
      smoke: {
        command: getFinanceDiscoveryQualitySmokeCommand(),
        generatedAt: null,
        outputPath: smokeOutputPath,
      },
      status: "failed",
      timestamp,
    };
  }

  const outputPath = buildJsonArtifactPath({
    outputDirectory,
    runLabel,
    timestamp,
  });
  await writeJsonArtifact(outputPath, report);

  const result = {
    outputPath,
    report,
  } satisfies FinanceDiscoveryQualityRunResult;

  if (report.status === "failed") {
    throw new FinanceDiscoveryQualityCommandError(result);
  }

  return result;
}

export function formatFinanceDiscoveryQualityReport(
  result: FinanceDiscoveryQualityRunResult,
) {
  const lines = [
    `Finance discovery quality run ${result.report.runLabel}`,
    `Status: ${result.report.status}`,
    `Timestamp: ${result.report.timestamp}`,
    `Git: ${formatGitSummary(result.report.git)}`,
    `Smoke command: ${result.report.smoke.command}`,
    `Families: ${result.report.familiesCovered.join(", ") || "none"}`,
    `Assertions: ${result.report.assertionTotals.passed}/${result.report.assertionTotals.total} passed`,
    `Smoke summary: ${result.report.smoke.outputPath}`,
    `Report: ${result.outputPath}`,
    `Summary: ${result.report.humanSummary}`,
  ];

  for (const entry of result.report.cases) {
    lines.push(
      `${formatCaseLabel(entry)}: ${entry.assertions.filter((assertion) => assertion.passed).length}/${entry.assertions.length} passed; freshness=${entry.freshness.state ?? "unknown"}; proof=${entry.proofBundleStatus}`,
    );
  }

  if (result.report.errorMessage) {
    lines.push(`Error: ${result.report.errorMessage}`);
  }

  return lines.join("\n").concat("\n");
}

function buildPassingSummary(input: {
  assertionTotals: {
    passed: number;
    total: number;
  };
  caseCount: number;
  familiesCovered: FinanceDiscoveryQualityFamily[];
}) {
  return `Passed deterministic finance discovery quality proof for ${input.familiesCovered.length} shipped families across ${input.caseCount} smoke cases with ${input.assertionTotals.passed}/${input.assertionTotals.total} quality assertions green.`;
}

function buildFailureSummary(errorMessage: string) {
  return `Finance discovery quality proof failed before a finance-native report could confirm the shipped smoke assertions: ${errorMessage}`;
}

function buildJsonArtifactPath(input: {
  outputDirectory: string;
  runLabel: string;
  timestamp: string;
}) {
  const compactTimestamp = input.timestamp
    .replace(/[:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/-/g, "");
  const safeLabel = input.runLabel.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

  return join(input.outputDirectory, `${compactTimestamp}-${safeLabel}.json`);
}

async function writeJsonArtifact(filePath: string, value: unknown) {
  await mkdir(dirname(filePath), {
    recursive: true,
  });
  await writeFile(filePath, JSON.stringify(value, null, 2).concat("\n"), "utf8");
}

async function runExecFile(
  file: string,
  args: string[],
  options: {
    cwd: string;
  },
) {
  const result = await execFileAsync(file, args, {
    cwd: options.cwd,
  });

  return {
    stderr: result.stderr,
    stdout: result.stdout,
  };
}

function extractErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("stderr" in error && typeof error.stderr === "string" && error.stderr.trim()) {
      return error.stderr.trim();
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return String(error);
}

function extractJsonDocument(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      "finance-discovery-quality smoke output did not include a JSON payload.",
    );
  }

  return trimmed.slice(start, end + 1);
}

function formatCaseLabel(entry: FinanceDiscoveryQualitySmokeCase) {
  if (entry.questionKind !== "policy_lookup") {
    return entry.questionKind;
  }

  return entry.unsupported
    ? "policy_lookup (unsupported scope)"
    : "policy_lookup (supported scope)";
}

function formatGitSummary(git: EvalRepoProvenance) {
  if (git.branchName && git.gitSha) {
    return `${git.branchName} @ ${git.gitSha.slice(0, 12)}`;
  }

  if (git.gitSha) {
    return git.gitSha.slice(0, 12);
  }

  if (git.branchName) {
    return git.branchName;
  }

  return "unavailable";
}
