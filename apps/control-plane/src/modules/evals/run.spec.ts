import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EvalEnvSchema } from "@pocket-cto/config";
import { describe, expect, it } from "vitest";
import { runEvalCommand } from "./run";

describe("runEvalCommand", () => {
  it("supports dry-run execution without a live API key", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));
    const summary = await runEvalCommand(["planner", "--dry-run", "--limit", "1"], {
      env: EvalEnvSchema.parse({
        OPENAI_EVALS_ENABLED: false,
      }),
      outputDirectory,
      repoProvenance: {
        branchName: "main",
        gitSha: "abc123def456",
      },
    });

    const content = await readFile(summary.outputPath, "utf8");
    const [line] = content.trim().split("\n");
    const record = JSON.parse(line ?? "");

    expect(summary.samples).toBe(1);
    expect(summary.runLabel).toBe("planner");
    expect(summary.mode).toBe("dry-run");
    expect(summary.candidateModel).toBe("gpt-5-mini");
    expect(summary.graderModel).toBe("gpt-5-mini");
    expect(summary.provenance).toEqual({
      branchName: "main",
      datasetNames: ["planner"],
      gitSha: "abc123def456",
      promptVersions: ["planner-prompt.v1"],
    });
    expect(record.mode).toBe("dry-run");
    expect(record.target).toBe("planner");
    expect(record.candidate.model).toBe("dry-run-fixture");
    expect(record.candidate.provider).toBeNull();
    expect(record.grader.provider).toBeNull();
    expect(record.provenance).toEqual({
      branchName: "main",
      datasetName: "planner",
      gitSha: "abc123def456",
      promptVersion: "planner-prompt.v1",
    });
  });
});
