import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  MonitorResultSchema,
  MonitorRunResultSchema,
} from "./index";

const now = "2026-04-26T12:00:00.000Z";
const companyId = "11111111-1111-4111-8111-111111111111";
const sourceId = "22222222-2222-4222-8222-222222222222";
const sourceSnapshotId = "33333333-3333-4333-8333-333333333333";
const sourceFileId = "44444444-4444-4444-8444-444444444444";
const syncRunId = "55555555-5555-4555-8555-555555555555";

describe("monitoring domain contract", () => {
  it("accepts a source-backed cash posture alert with proof and review posture", () => {
    const parsed = MonitorResultSchema.parse({
      id: "66666666-6666-4666-8666-666666666666",
      companyId,
      companyKey: "acme",
      monitorKind: "cash_posture",
      runKey: "cash_posture:acme:missing-bank-summary",
      triggeredBy: "operator",
      status: "alert",
      severity: "critical",
      conditions: [
        {
          kind: "missing_source",
          severity: "critical",
          summary: "No successful bank-account-summary slice exists.",
          evidencePath: "freshness.state",
        },
      ],
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
      deterministicSeverityRationale:
        "Critical because missing_source was detected from stored cash-posture freshness.",
      limitations: [
        "The monitor reports source posture only and does not infer runway.",
      ],
      proofBundlePosture: {
        state: "limited_by_missing_source",
        summary:
          "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
      },
      replayPosture: {
        state: "not_appended",
        reason:
          "F6A monitor results are company-scoped records and are not mission replay events.",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
        summary:
          "The result was produced by deterministic stored-state evaluation only.",
      },
      humanReviewNextStep:
        "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
      alertCard: {
        companyKey: "acme",
        monitorKind: "cash_posture",
        status: "alert",
        severity: "critical",
        deterministicSeverityRationale:
          "Critical because missing_source was detected from stored cash-posture freshness.",
        conditionSummaries: [
          "No successful bank-account-summary slice exists.",
        ],
        sourceFreshnessPosture: {
          state: "missing",
          latestAttemptedSyncRunId: null,
          latestSuccessfulSyncRunId: null,
          latestSuccessfulSource: null,
          missingSource: true,
          failedSource: false,
          summary: "No successful cash-posture source is stored.",
        },
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
        createdAt: now,
      },
      createdAt: now,
    });

    expect(parsed.monitorKind).toBe("cash_posture");
    expect(parsed.alertCard?.proofBundlePosture.state).toBe(
      "limited_by_missing_source",
    );
    expect(parsed.runtimeBoundary.runtimeCodexUsed).toBe(false);
    expect(parsed.runtimeBoundary.deliveryActionUsed).toBe(false);
    expect(parsed.runtimeBoundary.investigationMissionCreated).toBe(false);
  });

  it("requires no-alert results to avoid alert cards and alert conditions", () => {
    const parsed = MonitorRunResultSchema.parse({
      monitorResult: {
        id: "77777777-7777-4777-8777-777777777777",
        companyId,
        companyKey: "acme",
        monitorKind: "cash_posture",
        runKey: `cash_posture:acme:${syncRunId}`,
        triggeredBy: "operator",
        status: "no_alert",
        severity: "none",
        conditions: [],
        sourceFreshnessPosture: {
          state: "fresh",
          latestAttemptedSyncRunId: syncRunId,
          latestSuccessfulSyncRunId: syncRunId,
          latestSuccessfulSource: {
            sourceId,
            sourceSnapshotId,
            sourceFileId,
            syncRunId,
          },
          missingSource: false,
          failedSource: false,
          summary: "Stored cash-posture source is fresh.",
        },
        sourceLineageRefs: [
          {
            sourceId,
            sourceSnapshotId,
            sourceFileId,
            syncRunId,
            targetKind: "bank_account_summary",
            targetId: null,
            lineageCount: 2,
            lineageTargetCounts: {
              bankAccountCount: 1,
              bankAccountSummaryCount: 1,
            },
            summary: "Latest successful bank-account-summary lineage.",
          },
        ],
        deterministicSeverityRationale:
          "No alert because no F6A cash-posture conditions were detected.",
        limitations: [
          "Cash posture is grouped by reported currency only.",
        ],
        proofBundlePosture: {
          state: "source_backed",
          summary:
            "The monitor result is backed by the latest stored bank-account-summary source lineage.",
        },
        replayPosture: {
          state: "not_appended",
          reason:
            "F6A monitor results are company-scoped records and are not mission replay events.",
        },
        runtimeBoundary: {
          runtimeCodexUsed: false,
          deliveryActionUsed: false,
          investigationMissionCreated: false,
          autonomousFinanceActionUsed: false,
          summary:
            "The result was produced by deterministic stored-state evaluation only.",
        },
        humanReviewNextStep:
          "Review latest cash-posture source lineage during normal operator review.",
        alertCard: null,
        createdAt: now,
      },
      alertCard: null,
    });

    expect(parsed.monitorResult.status).toBe("no_alert");
    expect(parsed.monitorResult.severity).toBe("none");
    expect(parsed.alertCard).toBeNull();
  });

  it("rejects alert results without an alert card", () => {
    const candidate = MonitorResultSchema.safeParse({
      id: "88888888-8888-4888-8888-888888888888",
      companyId,
      companyKey: "acme",
      monitorKind: "cash_posture",
      runKey: "cash_posture:acme:bad",
      triggeredBy: "operator",
      status: "alert",
      severity: "warning",
      conditions: [],
      sourceFreshnessPosture: {
        state: "stale",
        latestAttemptedSyncRunId: syncRunId,
        latestSuccessfulSyncRunId: syncRunId,
        latestSuccessfulSource: {
          sourceId,
          sourceSnapshotId,
          sourceFileId,
          syncRunId,
        },
        missingSource: false,
        failedSource: false,
        summary: "Stored cash-posture source is stale.",
      },
      sourceLineageRefs: [],
      deterministicSeverityRationale: "Invalid alert.",
      limitations: ["Invalid alert."],
      proofBundlePosture: {
        state: "limited_by_stale_source",
        summary: "Invalid alert.",
      },
      replayPosture: {
        state: "not_appended",
        reason:
          "F6A monitor results are company-scoped records and are not mission replay events.",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
        summary:
          "The result was produced by deterministic stored-state evaluation only.",
      },
      humanReviewNextStep: "Review cash-posture source coverage.",
      alertCard: null,
      createdAt: now,
    });

    expect(candidate.success).toBe(false);
  });

  it("does not expand the shipped finance discovery family list", () => {
    expect(FINANCE_DISCOVERY_QUESTION_KINDS).toEqual([
      "cash_posture",
      "collections_pressure",
      "payables_pressure",
      "spend_posture",
      "obligation_calendar_review",
      "policy_lookup",
    ]);
  });
});
