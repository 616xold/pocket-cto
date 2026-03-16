import { describe, expect, it } from "vitest";
import { CreateMissionFromTextInputSchema, MissionSpecSchema } from "./mission";

describe("Mission domain schemas", () => {
  it("parses mission text input", () => {
    const parsed = CreateMissionFromTextInputSchema.parse({
      primaryRepo: "acme/web",
      text: "Implement passkeys for sign-in",
    });

    expect(parsed.primaryRepo).toBe("acme/web");
    expect(parsed.sourceKind).toBe("manual_text");
  });

  it("parses a mission spec", () => {
    const spec = MissionSpecSchema.parse({
      type: "build",
      title: "Implement passkeys",
      objective: "Add passkeys safely",
      repos: ["web"],
      acceptance: ["tests attached"],
      riskBudget: {
        sandboxMode: "patch-only",
        maxWallClockMinutes: 60,
        maxCostUsd: 10,
        allowNetwork: false,
        requiresHumanApprovalFor: ["merge"],
      },
      deliverables: ["plan", "proof_bundle"],
    });

    expect(spec.type).toBe("build");
    expect(spec.repos[0]).toBe("web");
  });
});
