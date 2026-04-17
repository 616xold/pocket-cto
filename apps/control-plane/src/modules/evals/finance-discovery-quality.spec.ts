import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatFinanceDiscoveryQualityReport,
  getFinanceDiscoveryQualitySmokeCommand,
  parseFinanceDiscoveryQualitySmokeSummary,
  runFinanceDiscoveryQualityCommand,
} from "./finance-discovery-quality";

describe("finance discovery quality eval hook", () => {
  it("parses structured smoke summaries with case assertions", () => {
    const summary = parseFinanceDiscoveryQualitySmokeSummary(
      `> pocket-cto smoke\n${JSON.stringify(createSmokeSummary())}\n`,
    );

    expect(summary.schemaVersion).toBe("finance-discovery-quality-smoke.v1");
    expect(summary.familiesCovered).toEqual([
      "cash_posture",
      "collections_pressure",
      "payables_pressure",
      "spend_posture",
      "obligation_calendar_review",
      "policy_lookup",
    ]);
    expect(summary.assertionTotals).toEqual({
      passed: 16,
      total: 16,
    });
    expect(summary.cases).toHaveLength(7);
    expect(summary.cases[0]?.assertions[0]).toEqual({
      id: "answer_summary_present",
      label: "Answer summary stayed visible.",
      passed: true,
    });
  });

  it("writes a finance-native report without fake model metadata", async () => {
    const outputDirectory = await mkdtemp(
      join(tmpdir(), "pocket-cto-finance-quality-"),
    );
    const result = await runFinanceDiscoveryQualityCommand({
      execCommand: async () => ({
        stderr: "",
        stdout: JSON.stringify(createSmokeSummary()),
      }),
      outputDirectory,
      repoProvenance: {
        branchName: "codex/f4c2-eval-hook-continuation-local-v1",
        gitSha: "abc123def4567890",
      },
      timestamp: "2026-04-17T17:00:00.000Z",
    });

    const content = await readFile(result.outputPath, "utf8");
    const report = JSON.parse(content);

    expect(result.report.status).toBe("passed");
    expect(result.report.smoke.command).toBe(
      "pnpm smoke:finance-discovery-quality:local -- --json",
    );
    expect(result.report.smoke.outputPath).toContain("/smoke/");
    expect(report.familiesCovered).toEqual([
      "cash_posture",
      "collections_pressure",
      "payables_pressure",
      "spend_posture",
      "obligation_calendar_review",
      "policy_lookup",
    ]);
    expect(report.assertionTotals).toEqual({
      passed: 16,
      total: 16,
    });
    expect(report.cases).toHaveLength(7);
    expect(report).not.toHaveProperty("candidate");
    expect(report).not.toHaveProperty("grader");
    expect(JSON.stringify(report)).not.toContain("\"provider\"");
  });

  it("uses the packaged smoke command for the eval hook", async () => {
    const seenCalls: Array<{
      args: string[];
      file: string;
    }> = [];

    await runFinanceDiscoveryQualityCommand({
      execCommand: async (file, args) => {
        seenCalls.push({
          args,
          file,
        });

        return {
          stderr: "",
          stdout: JSON.stringify(createSmokeSummary()),
        };
      },
      outputDirectory: await mkdtemp(
        join(tmpdir(), "pocket-cto-finance-quality-"),
      ),
      repoProvenance: {
        branchName: "main",
        gitSha: "abc123def4567890",
      },
      timestamp: "2026-04-17T17:05:00.000Z",
    });

    expect(getFinanceDiscoveryQualitySmokeCommand()).toBe(
      "pnpm smoke:finance-discovery-quality:local -- --json",
    );
    expect(seenCalls).toEqual([
      {
        args: ["smoke:finance-discovery-quality:local", "--", "--json"],
        file: "pnpm",
      },
    ]);
  });

  it("formats a doc-facing summary with report and smoke paths", async () => {
    const result = await runFinanceDiscoveryQualityCommand({
      execCommand: async () => ({
        stderr: "",
        stdout: JSON.stringify(createSmokeSummary()),
      }),
      outputDirectory: await mkdtemp(
        join(tmpdir(), "pocket-cto-finance-quality-"),
      ),
      repoProvenance: {
        branchName: "main",
        gitSha: "abc123def4567890",
      },
      timestamp: "2026-04-17T17:10:00.000Z",
    });

    const text = formatFinanceDiscoveryQualityReport(result);

    expect(text).toContain("Status: passed");
    expect(text).toContain("Families: cash_posture, collections_pressure, payables_pressure, spend_posture, obligation_calendar_review, policy_lookup");
    expect(text).toContain("Smoke summary:");
    expect(text).toContain("Report:");
    expect(text).toContain("cash_posture: 2/2 passed");
    expect(text).toContain("policy_lookup (unsupported scope): 3/3 passed");
  });
});

function createSmokeSummary() {
  const assertions = [
    {
      id: "answer_summary_present",
      label: "Answer summary stayed visible.",
      passed: true,
    },
    {
      id: "proof_bundle_ready",
      label: "Proof bundle stayed ready.",
      passed: true,
    },
  ];
  const policyAssertions = assertions.concat({
    id: "policy_scope_visible",
    label: "Policy scope stayed visible.",
    passed: true,
  });

  return {
    allAssertionsPassed: true,
    assertionTotals: {
      passed: 16,
      total: 16,
    },
    cases: [
      createCase("cash_posture", "cash_posture", assertions),
      createCase(
        "collections_pressure",
        "collections_pressure",
        assertions,
      ),
      createCase("payables_pressure", "payables_pressure", assertions),
      createCase("spend_posture", "spend_posture", assertions),
      createCase(
        "obligation_calendar_review",
        "obligation_calendar_review",
        assertions,
      ),
      createCase(
        "policy_lookup_supported",
        "policy_lookup",
        policyAssertions,
        false,
      ),
      createCase(
        "policy_lookup_unsupported",
        "policy_lookup",
        policyAssertions,
        true,
      ),
    ],
    company: {
      companyKey: "local-finance-discovery-quality-20260417",
      displayName: "Local Finance Discovery Quality Company 20260417",
    },
    familiesCovered: [
      "cash_posture",
      "collections_pressure",
      "payables_pressure",
      "spend_posture",
      "obligation_calendar_review",
      "policy_lookup",
    ],
    generatedAt: "2026-04-17T17:00:00.000Z",
    humanSummary:
      "Passed deterministic finance discovery quality proof for 6 shipped families across 7 smoke cases with 16/16 quality assertions green.",
    runTag: "20260417170000",
    schemaVersion: "finance-discovery-quality-smoke.v1",
  };
}

function createCase(
  caseLabel: string,
  questionKind:
    | "cash_posture"
    | "collections_pressure"
    | "payables_pressure"
    | "spend_posture"
    | "obligation_calendar_review"
    | "policy_lookup",
  assertions: Array<{
    id: string;
    label: string;
    passed: boolean;
  }>,
  unsupported = false,
) {
  return {
    answerSummary: `Summary for ${caseLabel}`,
    assertions,
    caseLabel,
    freshness: {
      reasonSummary: `Freshness for ${caseLabel}`,
      state: unsupported ? "missing" : "fresh",
    },
    missionId: `${caseLabel}-mission`,
    proofBundleStatus: "ready",
    questionKind,
    unsupported,
  };
}
