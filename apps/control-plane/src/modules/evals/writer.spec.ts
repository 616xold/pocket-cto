import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { writeEvalResults } from "./writer";

describe("eval result writer", () => {
  it("writes JSONL records into the requested output directory", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));
    const filePath = await writeEvalResults({
      outputDirectory,
      records: [
        {
          candidate: {
            model: "dry-run-fixture",
            output: "candidate output",
            provider: {
              backend: "openai_responses",
              codexVersion: null,
              proofMode: "api_key",
              provider: "openai-responses",
              requestId: "req_123",
              requestedModel: "gpt-5-mini",
              resolvedModel: "gpt-5-mini-2026-03-01",
              responseId: "resp_123",
              threadId: null,
              transport: "openai_responses_api",
              turnId: null,
              userAgent: null,
              usage: {
                inputTokens: 120,
                outputTokens: 45,
                totalTokens: 165,
              },
            },
            text: "candidate output",
          },
          combined: {
            overallScore: 4.2,
            scores: {
              actionability: 4,
              clarity: 4.5,
              constraintCompliance: 4,
              evidenceReadiness: 4.5,
            },
          },
          completedAt: "2026-03-13T19:30:00.000Z",
          grader: {
            model: "gpt-5-mini",
            notes: ["grader note"],
            overallScore: 4.2,
            provider: {
              backend: "openai_responses",
              codexVersion: null,
              proofMode: "api_key",
              provider: "openai-responses",
              requestId: "req_789",
              requestedModel: "gpt-5-mini",
              resolvedModel: "gpt-5-mini-2026-03-01",
              responseId: "resp_789",
              threadId: null,
              transport: "openai_responses_api",
              turnId: null,
              userAgent: null,
              usage: {
                inputTokens: 90,
                outputTokens: 25,
                totalTokens: 115,
              },
            },
            scores: {
              actionability: 4,
              clarity: 4.5,
              constraintCompliance: 4,
              evidenceReadiness: 4.5,
            },
            verdict: "strong",
          },
          itemId: "planner-passkeys-readonly",
          mode: "live",
          notes: ["note"],
          prompt: {
            sha256: "abc",
            source: "planner-prompt.ts",
            text: "prompt body",
            version: "planner-prompt.v1",
          },
          provenance: {
            branchName: "main",
            datasetName: "planner",
            gitSha: "abc123def456",
            promptVersion: "planner-prompt.v1",
          },
          reference: {
            model: "gpt-5-codex",
            output: "reference output",
            provider: {
              backend: "openai_responses",
              codexVersion: null,
              proofMode: "api_key",
              provider: "openai-responses",
              requestId: "req_456",
              requestedModel: "gpt-5-codex",
              resolvedModel: "gpt-5-codex-2026-03-01",
              responseId: "resp_456",
              threadId: null,
              transport: "openai_responses_api",
              turnId: null,
              userAgent: null,
              usage: {
                inputTokens: 130,
                outputTokens: 40,
                totalTokens: 170,
              },
            },
            text: "reference output",
          },
          rubric: {
            path: "evals/rubrics/quality-rubric.md",
            sha256: "def",
          },
          rule: {
            checks: {
              passed: 4,
              total: 5,
            },
            notes: [],
            scores: {
              actionability: 4,
              clarity: 4.5,
              constraintCompliance: 4,
              evidenceReadiness: 4.5,
            },
          },
          startedAt: "2026-03-13T19:29:00.000Z",
          target: "planner",
          timestamp: "2026-03-13T19:30:00.000Z",
        },
      ],
      runLabel: "planner",
      timestamp: "2026-03-13T19:30:00.000Z",
    });

    const content = await readFile(filePath, "utf8");
    const [line] = content.trim().split("\n");

    expect(filePath).toContain(outputDirectory);
    expect(line).toBeTruthy();
    expect(JSON.parse(line ?? "")).toMatchObject({
      candidate: {
        provider: {
          responseId: "resp_123",
          usage: {
            totalTokens: 165,
          },
        },
      },
      grader: {
        provider: {
          responseId: "resp_789",
        },
      },
      itemId: "planner-passkeys-readonly",
      mode: "live",
      provenance: {
        datasetName: "planner",
        gitSha: "abc123def456",
      },
      reference: {
        provider: {
          responseId: "resp_456",
        },
      },
      target: "planner",
    });
  });

  it("persists codex backend proof metadata without inventing response ids", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));
    const filePath = await writeEvalResults({
      outputDirectory,
      records: [
        {
          candidate: {
            model: "gpt-5.4",
            output: "candidate output",
            provider: {
              backend: "codex_subscription",
              codexVersion: "2.3.4",
              proofMode: "local_codex_subscription",
              provider: "codex-subscription",
              requestId: null,
              requestedModel: "gpt-5.4",
              resolvedModel: "gpt-5.4",
              responseId: null,
              threadId: "thread_eval_1",
              transport: "codex_app_server",
              turnId: "turn_eval_1",
              usage: null,
              userAgent: "codex/2.3.4",
            },
            text: "candidate output",
          },
          combined: {
            overallScore: 3.8,
            scores: {
              actionability: 4,
              clarity: 3.5,
              constraintCompliance: 4,
              evidenceReadiness: 3.5,
            },
          },
          completedAt: "2026-03-22T10:00:00.000Z",
          grader: {
            model: "gpt-5.4-mini",
            notes: [],
            overallScore: 3.8,
            provider: null,
            scores: {
              actionability: 4,
              clarity: 3.5,
              constraintCompliance: 4,
              evidenceReadiness: 3.5,
            },
            verdict: "mixed",
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
            branchName: "main",
            datasetName: "planner",
            gitSha: "abc123def456",
            promptVersion: "planner-prompt.v1",
          },
          reference: null,
          rubric: {
            path: "evals/rubrics/quality-rubric.md",
            sha256: "def",
          },
          rule: {
            checks: {
              passed: 4,
              total: 5,
            },
            notes: [],
            scores: {
              actionability: 4,
              clarity: 3.5,
              constraintCompliance: 4,
              evidenceReadiness: 3.5,
            },
          },
          startedAt: "2026-03-22T09:59:00.000Z",
          target: "planner",
          timestamp: "2026-03-22T10:00:00.000Z",
        },
      ],
      runLabel: "planner",
      timestamp: "2026-03-22T10:00:00.000Z",
    });

    const content = await readFile(filePath, "utf8");
    const [line] = content.trim().split("\n");

    expect(JSON.parse(line ?? "")).toMatchObject({
      candidate: {
        provider: {
          backend: "codex_subscription",
          codexVersion: "2.3.4",
          responseId: null,
          threadId: "thread_eval_1",
          transport: "codex_app_server",
          turnId: "turn_eval_1",
          usage: null,
        },
      },
    });
  });
});
