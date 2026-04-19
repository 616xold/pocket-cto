import { describe, expect, it } from "vitest";
import {
  CreateMissionFromTextInputSchema,
  MissionSpecSchema,
} from "./mission";

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

  it("allows repo-free finance discovery specs", () => {
    const spec = MissionSpecSchema.parse({
      type: "discovery",
      title: "Assess cash posture for acme",
      objective: "Answer the stored cash posture question for acme.",
      repos: [],
      acceptance: ["persist one durable finance discovery answer artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["discovery_answer", "proof_bundle"],
    });

    expect(spec.repos).toEqual([]);
  });

  it("parses a reporting mission spec with a typed reporting request", () => {
    const spec = MissionSpecSchema.parse({
      type: "reporting",
      title: "Draft finance memo for acme",
      objective:
        "Compile one draft finance memo plus one linked evidence appendix from stored discovery evidence only.",
      repos: [],
      acceptance: ["persist one draft finance_memo artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId: "11111111-1111-4111-8111-111111111111",
          sourceReportingMissionId: null,
          reportKind: "finance_memo",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    });

    expect(spec.type).toBe("reporting");
    expect(spec.input?.reportingRequest?.reportKind).toBe("finance_memo");
  });
});
