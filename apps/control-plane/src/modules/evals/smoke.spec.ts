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
          EVALS_ENABLED: false,
        }),
        outputDirectory,
      }),
    ).rejects.toThrow(
      "Live evals are disabled. Set EVALS_ENABLED=true (or legacy OPENAI_EVALS_ENABLED=true) or rerun with --dry-run.",
    );
  });

  it("refuses executor smoke when dry-run is forced", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "pocket-cto-evals-"));

    await expect(
      runExecutorSmokeCommand({
        argv: ["--dry-run"],
        env: EvalEnvSchema.parse({
          EVALS_ENABLED: true,
          OPENAI_API_KEY: "sk-test-1234",
        }),
        outputDirectory,
      }),
    ).rejects.toThrow(
      "Smoke evals require a real live eval backend call. Remove --dry-run and enable EVALS_ENABLED=true (or legacy OPENAI_EVALS_ENABLED=true).",
    );
  });
});
