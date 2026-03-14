import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EvalEnvSchema } from "@pocket-cto/config";
import { describe, expect, it } from "vitest";
import { runExecutorSmokeCommand, runPlannerSmokeCommand } from "./smoke";

describe("planner smoke eval", () => {
  it("refuses to run when live mode is not truly enabled", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));

    await expect(
      runPlannerSmokeCommand({
        env: EvalEnvSchema.parse({
          OPENAI_EVALS_ENABLED: false,
        }),
        outputDirectory,
      }),
    ).rejects.toThrow(
      "Live evals are disabled. Set OPENAI_EVALS_ENABLED=true or rerun with --dry-run.",
    );
  });

  it("refuses executor smoke when dry-run is forced", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));

    await expect(
      runExecutorSmokeCommand({
        argv: ["--dry-run"],
        env: EvalEnvSchema.parse({
          OPENAI_API_KEY: "sk-test-1234",
          OPENAI_EVALS_ENABLED: true,
        }),
        outputDirectory,
      }),
    ).rejects.toThrow(
      "Smoke evals require a real live OpenAI call. Remove --dry-run and enable OPENAI_EVALS_ENABLED=true.",
    );
  });
});
