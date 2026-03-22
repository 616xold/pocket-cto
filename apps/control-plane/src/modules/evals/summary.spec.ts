import { describe, expect, it } from "vitest";
import { formatEvalRunSummary } from "./summary";
import type { EvalRunSummary } from "./types";

describe("eval run summary formatter", () => {
  it("prints dry-run mode clearly", () => {
    const text = formatEvalRunSummary({
      averageOverallScore: 4.8,
      backend: "openai_responses",
      candidateModel: "gpt-5-mini",
      graderModel: "gpt-5-mini",
      provenance: {
        branchName: "main",
        datasetNames: ["planner"],
        gitSha: "abc123def456",
        promptVersions: ["planner-prompt.v1"],
      },
      live: {
        candidate: createProviderSummary(),
        grader: createProviderSummary(),
        reference: createProviderSummary(),
      },
      mode: "dry-run",
      outputFileName: "20260314T100000Z-planner.jsonl",
      outputPath: "/tmp/20260314T100000Z-planner.jsonl",
      runLabel: "planner",
      samples: 1,
    } satisfies EvalRunSummary);

    expect(text).toContain("Mode: dry-run");
    expect(text).toContain("Backend: openai_responses");
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
      backend: "openai_responses",
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
          backends: ["openai_responses"],
          codexVersions: [],
          calls: 1,
          proofModes: ["api_key"],
          responseIds: ["resp_candidate"],
          threadIds: [],
          transports: ["openai_responses_api"],
          turnIds: [],
          usage: {
            inputTokens: 110,
            outputTokens: 40,
            totalTokens: 150,
          },
        },
        grader: {
          backends: ["openai_responses"],
          codexVersions: [],
          calls: 1,
          proofModes: ["api_key"],
          responseIds: ["resp_grader"],
          threadIds: [],
          transports: ["openai_responses_api"],
          turnIds: [],
          usage: {
            inputTokens: 90,
            outputTokens: 20,
            totalTokens: 110,
          },
        },
        reference: createProviderSummary(),
      },
      mode: "live",
      outputFileName: "20260314T100000Z-planner.jsonl",
      outputPath: "/tmp/20260314T100000Z-planner.jsonl",
      runLabel: "planner",
      samples: 1,
    } satisfies EvalRunSummary);

    expect(text).toContain("Mode: live");
    expect(text).toContain("Candidate live proof: 1 call; backend=openai_responses; transport=openai_responses_api; tokens in/out/total=110/40/150; proof mode=api_key; response ids=resp_candidate");
    expect(text).toContain("Grader live proof: 1 call; backend=openai_responses; transport=openai_responses_api; tokens in/out/total=90/20/110; proof mode=api_key; response ids=resp_grader");
  });

  it("prints codex backend proof details without inventing API token metadata", () => {
    const text = formatEvalRunSummary({
      averageOverallScore: 3.9,
      backend: "codex_subscription",
      candidateModel: "gpt-5.4",
      graderModel: "gpt-5.4-mini",
      provenance: {
        branchName: "main",
        datasetNames: ["planner"],
        gitSha: "abc123def456",
        promptVersions: ["planner-prompt.v1"],
      },
      live: {
        candidate: {
          backends: ["codex_subscription"],
          codexVersions: ["2.3.4"],
          calls: 1,
          proofModes: ["local_codex_subscription"],
          responseIds: [],
          threadIds: ["thread_eval_1"],
          transports: ["codex_app_server"],
          turnIds: ["turn_eval_1"],
          usage: null,
        },
        grader: createProviderSummary(),
        reference: createProviderSummary(),
      },
      mode: "live",
      outputFileName: "20260322T100000Z-planner.jsonl",
      outputPath: "/tmp/20260322T100000Z-planner.jsonl",
      runLabel: "planner",
      samples: 1,
    } satisfies EvalRunSummary);

    expect(text).toContain("Backend: codex_subscription");
    expect(text).toContain("Candidate live proof: 1 call; backend=codex_subscription; transport=codex_app_server; token usage unavailable; proof mode=local_codex_subscription; thread ids=thread_eval_1; turn ids=turn_eval_1; codex versions=2.3.4");
  });
});

function createProviderSummary() {
  return {
    backends: [],
    codexVersions: [],
    calls: 0,
    proofModes: [],
    responseIds: [],
    threadIds: [],
    transports: [],
    turnIds: [],
    usage: null,
  };
}
