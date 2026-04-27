import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  MonitorInvestigationSeedSchema,
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
        limitations: ["Cash posture is grouped by reported currency only."],
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

  it("accepts a source-backed collections pressure alert without widening investigation seeds", () => {
    const parsed = MonitorResultSchema.parse({
      id: "99999999-9999-4999-8999-999999999999",
      companyId,
      companyKey: "acme",
      monitorKind: "collections_pressure",
      runKey: "collections_pressure:acme:source-backed-overdue",
      triggeredBy: "operator",
      status: "alert",
      severity: "warning",
      conditions: [
        {
          kind: "overdue_concentration",
          severity: "warning",
          summary:
            "USD receivables are 60.00% past due based on source-backed totals.",
          evidencePath: "currencyBuckets[USD].pastDueShare",
        },
      ],
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
        summary: "The latest successful receivables-aging source is fresh.",
      },
      sourceLineageRefs: [
        {
          sourceId,
          sourceSnapshotId,
          sourceFileId,
          syncRunId,
          targetKind: "receivables_aging_row",
          targetId: null,
          lineageCount: 3,
          lineageTargetCounts: {
            customerCount: 1,
            receivablesAgingRowCount: 1,
          },
          summary:
            "Latest successful receivables-aging source lineage for collections pressure.",
        },
      ],
      deterministicSeverityRationale:
        "Warning because overdue_concentration condition(s) were detected from stored collections-pressure state.",
      limitations: [
        "F6C collections-pressure monitoring evaluates stored receivables-aging posture only.",
      ],
      proofBundlePosture: {
        state: "source_backed",
        summary:
          "The monitor result is backed by the latest stored receivables-aging source lineage.",
      },
      replayPosture: {
        state: "not_appended",
        reason:
          "F6C monitor results are company-scoped records and are not mission replay events.",
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
        "Review receivables-aging source coverage and collections posture before acting outside Pocket CFO.",
      alertCard: {
        companyKey: "acme",
        monitorKind: "collections_pressure",
        status: "alert",
        severity: "warning",
        deterministicSeverityRationale:
          "Warning because overdue_concentration condition(s) were detected from stored collections-pressure state.",
        conditionSummaries: [
          "USD receivables are 60.00% past due based on source-backed totals.",
        ],
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
          summary: "The latest successful receivables-aging source is fresh.",
        },
        sourceLineageRefs: [
          {
            sourceId,
            sourceSnapshotId,
            sourceFileId,
            syncRunId,
            targetKind: "receivables_aging_row",
            targetId: null,
            lineageCount: 3,
            lineageTargetCounts: {
              customerCount: 1,
              receivablesAgingRowCount: 1,
            },
            summary:
              "Latest successful receivables-aging source lineage for collections pressure.",
          },
        ],
        sourceLineageSummary:
          "3 receivables-aging lineage record(s) back this monitor result.",
        limitations: [
          "F6C collections-pressure monitoring evaluates stored receivables-aging posture only.",
        ],
        proofBundlePosture: {
          state: "source_backed",
          summary:
            "The monitor result is backed by the latest stored receivables-aging source lineage.",
        },
        humanReviewNextStep:
          "Review receivables-aging source coverage and collections posture before acting outside Pocket CFO.",
        createdAt: now,
      },
      createdAt: now,
    });

    expect(parsed.monitorKind).toBe("collections_pressure");
    expect(parsed.conditions[0]?.kind).toBe("overdue_concentration");
    expect(parsed.alertCard?.sourceLineageRefs).toHaveLength(1);

    const seed = MonitorInvestigationSeedSchema.safeParse({
      monitorResultId: parsed.id,
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResultStatus: "alert",
      alertSeverity: "warning",
      deterministicSeverityRationale: parsed.deterministicSeverityRationale,
      conditions: parsed.conditions,
      conditionSummaries: parsed.alertCard?.conditionSummaries ?? [],
      sourceFreshnessPosture: parsed.sourceFreshnessPosture,
      sourceLineageRefs: parsed.sourceLineageRefs,
      sourceLineageSummary: parsed.alertCard?.sourceLineageSummary ?? "",
      limitations: parsed.limitations,
      proofBundlePosture: parsed.proofBundlePosture,
      humanReviewNextStep: parsed.humanReviewNextStep,
      runtimeBoundary: {
        monitorResultRuntimeBoundary: parsed.runtimeBoundary,
        monitorRerunUsed: false,
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        scheduledAutomationUsed: false,
        reportArtifactCreated: false,
        approvalCreated: false,
        autonomousFinanceActionUsed: false,
        summary: "Invalid collections handoff.",
      },
      sourceRef: `pocket-cfo://monitor-results/${parsed.id}`,
      monitorResultCreatedAt: parsed.createdAt,
      alertCardCreatedAt: parsed.alertCard?.createdAt ?? now,
    });

    expect(seed.success).toBe(false);
  });

  it("accepts a source-backed payables pressure alert without widening investigation seeds", () => {
    const parsed = MonitorResultSchema.parse({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      companyId,
      companyKey: "acme",
      monitorKind: "payables_pressure",
      runKey: "payables_pressure:acme:source-backed-overdue",
      triggeredBy: "operator",
      status: "alert",
      severity: "critical",
      conditions: [
        {
          kind: "overdue_concentration",
          severity: "critical",
          summary:
            "USD payables are 80.00% past due based on source-backed totals.",
          evidencePath: "currencyBuckets[USD].pastDueShare",
        },
      ],
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
        summary: "The latest successful payables-aging source is fresh.",
      },
      sourceLineageRefs: [
        {
          sourceId,
          sourceSnapshotId,
          sourceFileId,
          syncRunId,
          targetKind: "payables_aging_row",
          targetId: null,
          lineageCount: 3,
          lineageTargetCounts: {
            vendorCount: 1,
            payablesAgingRowCount: 1,
          },
          summary:
            "Latest successful payables-aging source lineage for payables pressure.",
        },
      ],
      deterministicSeverityRationale:
        "Critical because overdue_concentration condition(s) were detected from stored payables-pressure state.",
      limitations: [
        "F6D payables-pressure monitoring evaluates stored payables-aging posture only.",
      ],
      proofBundlePosture: {
        state: "source_backed",
        summary:
          "The monitor result is backed by the latest stored payables-aging source lineage.",
      },
      replayPosture: {
        state: "not_appended",
        reason:
          "F6D monitor results are company-scoped records and are not mission replay events.",
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
        "Review payables-aging source coverage and payables posture before any external vendor or payment action.",
      alertCard: {
        companyKey: "acme",
        monitorKind: "payables_pressure",
        status: "alert",
        severity: "critical",
        deterministicSeverityRationale:
          "Critical because overdue_concentration condition(s) were detected from stored payables-pressure state.",
        conditionSummaries: [
          "USD payables are 80.00% past due based on source-backed totals.",
        ],
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
          summary: "The latest successful payables-aging source is fresh.",
        },
        sourceLineageRefs: [
          {
            sourceId,
            sourceSnapshotId,
            sourceFileId,
            syncRunId,
            targetKind: "payables_aging_row",
            targetId: null,
            lineageCount: 3,
            lineageTargetCounts: {
              vendorCount: 1,
              payablesAgingRowCount: 1,
            },
            summary:
              "Latest successful payables-aging source lineage for payables pressure.",
          },
        ],
        sourceLineageSummary:
          "3 payables-aging lineage record(s) back this monitor result.",
        limitations: [
          "F6D payables-pressure monitoring evaluates stored payables-aging posture only.",
        ],
        proofBundlePosture: {
          state: "source_backed",
          summary:
            "The monitor result is backed by the latest stored payables-aging source lineage.",
        },
        humanReviewNextStep:
          "Review payables-aging source coverage and payables posture before any external vendor or payment action.",
        createdAt: now,
      },
      createdAt: now,
    });

    expect(parsed.monitorKind).toBe("payables_pressure");
    expect(parsed.conditions[0]?.kind).toBe("overdue_concentration");
    expect(parsed.alertCard?.sourceLineageRefs).toHaveLength(1);

    const seed = MonitorInvestigationSeedSchema.safeParse({
      monitorResultId: parsed.id,
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResultStatus: "alert",
      alertSeverity: "critical",
      deterministicSeverityRationale: parsed.deterministicSeverityRationale,
      conditions: parsed.conditions,
      conditionSummaries: parsed.alertCard?.conditionSummaries ?? [],
      sourceFreshnessPosture: parsed.sourceFreshnessPosture,
      sourceLineageRefs: parsed.sourceLineageRefs,
      sourceLineageSummary: parsed.alertCard?.sourceLineageSummary ?? "",
      limitations: parsed.limitations,
      proofBundlePosture: parsed.proofBundlePosture,
      humanReviewNextStep: parsed.humanReviewNextStep,
      runtimeBoundary: {
        monitorResultRuntimeBoundary: parsed.runtimeBoundary,
        monitorRerunUsed: false,
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        scheduledAutomationUsed: false,
        reportArtifactCreated: false,
        approvalCreated: false,
        autonomousFinanceActionUsed: false,
        summary: "Invalid payables handoff.",
      },
      sourceRef: `pocket-cfo://monitor-results/${parsed.id}`,
      monitorResultCreatedAt: parsed.createdAt,
      alertCardCreatedAt: parsed.alertCard?.createdAt ?? now,
    });

    expect(seed.success).toBe(false);
  });

  it("parses a deterministic alert investigation seed from stored monitor evidence", () => {
    const parsed = MonitorInvestigationSeedSchema.parse({
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
      monitorResultCreatedAt: now,
      alertCardCreatedAt: now,
    });

    expect(parsed.monitorResultStatus).toBe("alert");
    expect(parsed.runtimeBoundary.monitorRerunUsed).toBe(false);
    expect(parsed.runtimeBoundary.runtimeCodexUsed).toBe(false);
    expect(parsed.runtimeBoundary.deliveryActionUsed).toBe(false);
    expect(parsed.runtimeBoundary.reportArtifactCreated).toBe(false);
    expect(parsed.runtimeBoundary.approvalCreated).toBe(false);
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
