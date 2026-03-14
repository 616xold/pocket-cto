import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EvalEnvSchema } from "@pocket-cto/config";
import { describe, expect, it } from "vitest";
import { createEvalDoctorReport, formatEvalDoctorReport } from "./doctor";

describe("eval doctor", () => {
  it("reports dry-run-required state when the live gate is incomplete", () => {
    const report = createEvalDoctorReport({
      env: EvalEnvSchema.parse({
        OPENAI_EVALS_ENABLED: false,
      }),
      resultsDirectory: "/tmp/evals-results",
    });

    expect(report.apiKey.present).toBe(false);
    expect(report.defaultMode).toBe("dry-run");
    expect(report.defaultRunBehavior).toBe("dry-run-required");

    const text = formatEvalDoctorReport(report);

    expect(text).toContain("OPENAI_API_KEY: missing");
    expect(text).toContain("OPENAI_API_KEY source: unavailable");
    expect(text).toContain("OPENAI_EVALS_ENABLED: false");
    expect(text).toContain("Default mode: dry-run");
    expect(text).toContain("Results directory: /tmp/evals-results");
  });

  it("reports shell env sourcing without exposing the full API key", () => {
    const report = createEvalDoctorReport({
      cwd: "/tmp",
      env: EvalEnvSchema.parse({
        OPENAI_API_KEY: "sk-test-abcdef1234",
        OPENAI_EVALS_ENABLED: true,
      }),
      rawEnv: {
        OPENAI_API_KEY: "sk-test-abcdef1234",
      },
      resultsDirectory: "/tmp/evals-results",
    });

    expect(report.apiKey.present).toBe(true);
    expect(report.apiKey.masked).toBe("***1234");
    expect(report.apiKey.source).toBe("shell env");
    expect(report.defaultMode).toBe("live");
    expect(report.defaultRunBehavior).toBe("live");

    const text = formatEvalDoctorReport(report);

    expect(text).toContain("OPENAI_API_KEY: present (***1234)");
    expect(text).toContain("OPENAI_API_KEY source: shell env");
    expect(text).toContain("OPENAI_EVALS_ENABLED: true");
    expect(text).toContain("Default mode: live");
    expect(text).not.toContain("sk-test-abcdef1234");
  });

  it("detects a key loaded from the local .env file", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "pocket-cto-evals-doctor-"));
    await writeFile(cwd + "/.env", "OPENAI_API_KEY=sk-test-loaded9999\n", "utf8");

    const report = createEvalDoctorReport({
      cwd,
      env: EvalEnvSchema.parse({
        OPENAI_API_KEY: "sk-test-loaded9999",
        OPENAI_EVALS_ENABLED: true,
      }),
      rawEnv: {},
      resultsDirectory: "/tmp/evals-results",
    });

    expect(report.apiKey.source).toBe("loaded .env");
  });
});
