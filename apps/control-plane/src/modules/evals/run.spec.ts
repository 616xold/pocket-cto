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
    });

    const content = await readFile(summary.outputPath, "utf8");
    const [line] = content.trim().split("\n");
    const record = JSON.parse(line ?? "");

    expect(summary.samples).toBe(1);
    expect(summary.runLabel).toBe("planner");
    expect(record.mode).toBe("dry-run");
    expect(record.target).toBe("planner");
    expect(record.candidate.model).toBe("dry-run-fixture");
  });
});
