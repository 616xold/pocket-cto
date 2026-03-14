import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatEvalCompareReport, runEvalCompareCommand } from "./compare";

describe("eval compare helper", () => {
  it("compares stored result files and reports score movement and models", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));
    const fileA = join(outputDirectory, "a.jsonl");
    const fileB = join(outputDirectory, "b.jsonl");

    await writeFile(
      fileA,
      `${JSON.stringify(buildRecord({
        branchName: "main",
        candidateModel: "gpt-5-mini",
        gitSha: "aaaabbbbcccc",
        graderModel: "gpt-5-mini",
        overallScore: 3.5,
        scores: {
          actionability: 3.5,
          clarity: 3,
          constraintCompliance: 4,
          evidenceReadiness: 3.5,
        },
      }))}\n`,
      "utf8",
    );
    await writeFile(
      fileB,
      `${JSON.stringify(buildRecord({
        branchName: "main",
        candidateModel: "gpt-5-mini",
        gitSha: "dddd1111eeee",
        graderModel: "gpt-5-mini",
        overallScore: 4.4,
        scores: {
          actionability: 4.5,
          clarity: 4.2,
          constraintCompliance: 4.4,
          evidenceReadiness: 4.5,
        },
      }))}\n`,
      "utf8",
    );

    const report = await runEvalCompareCommand(["--a", fileA, "--b", fileB]);
    const text = formatEvalCompareReport(report);

    expect(report.overallDelta).toBe(0.9);
    expect(report.dimensionDeltas.actionability).toBe(1);
    expect(text).toContain("Overall score: 3.5 -> 4.4 (+0.9)");
    expect(text).toContain("A: a.jsonl (gpt-5-mini / gpt-5-mini)");
    expect(text).toContain("B: b.jsonl (gpt-5-mini / gpt-5-mini)");
  });
});

function buildRecord(input: {
  branchName: string;
  candidateModel: string;
  gitSha: string;
  graderModel: string;
  overallScore: number;
  scores: {
    actionability: number;
    clarity: number;
    constraintCompliance: number;
    evidenceReadiness: number;
  };
}) {
  return {
    candidate: {
      model: input.candidateModel,
      output: "candidate output",
      provider: null,
      text: "candidate output",
    },
    combined: {
      overallScore: input.overallScore,
      scores: input.scores,
    },
    completedAt: "2026-03-14T02:00:00.000Z",
    grader: {
      model: input.graderModel,
      notes: [],
      overallScore: input.overallScore,
      provider: null,
      scores: input.scores,
      verdict: "strong",
    },
    itemId: "planner-passkeys-readonly",
    mode: "live",
    notes: [],
    prompt: {
      sha256: "abc",
      source: "planner-prompt.ts",
      text: "prompt body",
      version: "planner-prompt.v1",
    },
    provenance: {
      branchName: input.branchName,
      datasetName: "planner",
      gitSha: input.gitSha,
      promptVersion: "planner-prompt.v1",
    },
    reference: null,
    rubric: {
      path: "evals/rubrics/quality-rubric.md",
      sha256: "def",
    },
    rule: {
      checks: {
        passed: 5,
        total: 5,
      },
      notes: [],
      scores: input.scores,
    },
    startedAt: "2026-03-14T01:59:00.000Z",
    target: "planner",
    timestamp: "2026-03-14T02:00:00.000Z",
  };
}
