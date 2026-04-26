import { describe, expect, it } from "vitest";
import {
  CreateMissionFromTextInputSchema,
  MissionSpecSchema,
} from "./mission";
import { MonitorInvestigationSeedSchema } from "./monitoring";

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

  it("parses a taskless alert investigation under the discovery mission umbrella", () => {
    const seed = buildMonitorInvestigationSeed();
    const spec = MissionSpecSchema.parse({
      type: "discovery",
      title: "Investigate cash-posture alert for acme",
      objective:
        "Manual F6B investigation handoff from one stored cash_posture alert.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: ["invoke runtime-Codex", "create report artifacts"],
      },
      acceptance: ["open one deterministic alert investigation handoff"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["monitor alert investigation seed"],
      input: {
        monitorInvestigation: seed,
      },
    });

    expect(spec.type).toBe("discovery");
    expect(spec.input?.discoveryQuestion).toBeUndefined();
    expect(spec.input?.monitorInvestigation?.sourceRef).toBe(
      "pocket-cfo://monitor-results/66666666-6666-4666-8666-666666666666",
    );
  });
});

function buildMonitorInvestigationSeed() {
  return MonitorInvestigationSeedSchema.parse({
    monitorResultId: "66666666-6666-4666-8666-666666666666",
    companyKey: "acme",
    monitorKind: "cash_posture",
    monitorResultStatus: "alert",
    alertSeverity: "critical",
    deterministicSeverityRationale:
      "Critical because missing_source was detected from stored cash-posture freshness.",
    conditions: [
      {
        kind: "missing_source",
        severity: "critical",
        summary: "No successful bank-account-summary slice exists.",
        evidencePath: "freshness.state",
      },
    ],
    conditionSummaries: ["No successful bank-account-summary slice exists."],
    sourceFreshnessPosture: {
      state: "missing",
      latestAttemptedSyncRunId: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulSource: null,
      missingSource: true,
      failedSource: false,
      summary: "No successful cash-posture source is stored.",
    },
    sourceLineageRefs: [],
    sourceLineageSummary:
      "No bank-account-summary source lineage is available.",
    limitations: [
      "The monitor reports source posture only and does not infer runway.",
    ],
    proofBundlePosture: {
      state: "limited_by_missing_source",
      summary:
        "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
    },
    humanReviewNextStep:
      "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
    runtimeBoundary: {
      monitorResultRuntimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
        summary:
          "The result was produced by deterministic stored-state evaluation only.",
      },
      monitorRerunUsed: false,
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      scheduledAutomationUsed: false,
      reportArtifactCreated: false,
      approvalCreated: false,
      autonomousFinanceActionUsed: false,
      summary:
        "The handoff opened a deterministic investigation mission without runtime or delivery action.",
    },
    sourceRef:
      "pocket-cfo://monitor-results/66666666-6666-4666-8666-666666666666",
    monitorResultCreatedAt: "2026-04-26T12:00:00.000Z",
    alertCardCreatedAt: "2026-04-26T12:00:00.000Z",
  });
}
