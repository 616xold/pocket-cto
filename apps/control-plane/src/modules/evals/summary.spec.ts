import { describe, expect, it } from "vitest";
import { formatEvalRunSummary } from "./summary";
import type { EvalRunSummary } from "./types";

describe("eval run summary formatter", () => {
  it("prints dry-run mode clearly", () => {
    const text = formatEvalRunSummary({
      averageOverallScore: 4.8,
      candidateModel: "gpt-5-mini",
      graderModel: "gpt-5-mini",
      provenance: {
        branchName: "main",
        datasetNames: ["planner"],
        gitSha: "abc123def456",
        promptVersions: ["planner-prompt.v1"],
      },
      live: {
        candidate: {
          calls: 0,
          responseIds: [],
          usage: null,
        },
        grader: {
          calls: 0,
          responseIds: [],
          usage: null,
        },
        reference: {
          calls: 0,
          responseIds: [],
          usage: null,
        },
      },
      mode: "dry-run",
      outputFileName: "20260314T100000Z-planner.jsonl",
      outputPath: "/tmp/20260314T100000Z-planner.jsonl",
      runLabel: "planner",
      samples: 1,
    } satisfies EvalRunSummary);

    expect(text).toContain("Mode: dry-run");
    expect(text).toContain("Candidate model: gpt-5-mini");
    expect(text).toContain("Grader model: gpt-5-mini");
    expect(text).toContain("Dataset: planner");
    expect(text).toContain("Prompt version: planner-prompt.v1");
    expect(text).toContain("Git: main @ abc123def456");
    expect(text).toContain("Dry-run: no OpenAI API calls were made.");
  });

  it("prints live proof details when usage metadata is available", () => {
    const text = formatEvalRunSummary({
      averageOverallScore: 4.3,
      candidateModel: "gpt-5-mini",
      graderModel: "gpt-5-mini",
      provenance: {
        branchName: "main",
        datasetNames: ["planner"],
        gitSha: "abc123def456",
        promptVersions: ["planner-prompt.v1"],
      },
      live: {
        candidate: {
          calls: 1,
          responseIds: ["resp_candidate"],
          usage: {
            inputTokens: 110,
            outputTokens: 40,
            totalTokens: 150,
          },
        },
        grader: {
          calls: 1,
          responseIds: ["resp_grader"],
          usage: {
            inputTokens: 90,
            outputTokens: 20,
            totalTokens: 110,
          },
        },
        reference: {
          calls: 0,
          responseIds: [],
          usage: null,
        },
      },
      mode: "live",
      outputFileName: "20260314T100000Z-planner.jsonl",
      outputPath: "/tmp/20260314T100000Z-planner.jsonl",
      runLabel: "planner",
      samples: 1,
    } satisfies EvalRunSummary);

    expect(text).toContain("Mode: live");
    expect(text).toContain("Candidate live proof: 1 call; tokens in/out/total=110/40/150; response ids=resp_candidate");
    expect(text).toContain("Grader live proof: 1 call; tokens in/out/total=90/20/110; response ids=resp_grader");
  });
});
