import { describe, expect, it } from "vitest";
import { evaluateTextOutput } from "./rules";

describe("text eval rules", () => {
  it("treats hyphen and space as equivalent for phrase matching", () => {
    const result = evaluateTextOutput({
      expectations: {
        actionabilitySignals: ["validation"],
        evidenceSignals: ["test report"],
        forbiddenPhrases: [],
        mustMention: ["email login", "apps/web"],
        requiredSections: ["Objective understanding"],
      },
      output:
        "## Objective understanding\nPreserve the existing EMAIL-login fallback in apps/web.\nValidation stays explicit in the test report.",
    });

    expect(result.notes).not.toContain("Missing expected topic: email login.");
    expect(result.checks.passed).toBe(result.checks.total);
  });

  it("does not over-normalize unrelated phrases into a match", () => {
    const result = evaluateTextOutput({
      expectations: {
        actionabilitySignals: [],
        evidenceSignals: [],
        forbiddenPhrases: [],
        mustMention: ["email login"],
        requiredSections: ["Objective understanding"],
      },
      output: "## Objective understanding\nPreserve the existing email portal flow.",
    });

    expect(result.notes).toContain("Missing expected topic: email login.");
  });
});
