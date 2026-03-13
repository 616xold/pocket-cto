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
            model: null,
            notes: ["dry-run"],
            overallScore: 4.2,
            scores: {
              actionability: 4,
              clarity: 4.5,
              constraintCompliance: 4,
              evidenceReadiness: 4.5,
            },
            verdict: "strong",
          },
          itemId: "planner-passkeys-readonly",
          mode: "dry-run",
          notes: ["note"],
          prompt: {
            sha256: "abc",
            source: "planner-prompt.ts",
            text: "prompt body",
            version: "planner-prompt.v1",
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
      itemId: "planner-passkeys-readonly",
      mode: "dry-run",
      target: "planner",
    });
  });
});
