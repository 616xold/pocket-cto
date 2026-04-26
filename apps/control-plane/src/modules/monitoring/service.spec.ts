import { describe, expect, it } from "vitest";
import {
  FinanceCashPostureViewSchema,
  type FinanceCashPostureView,
} from "@pocket-cto/domain";
import { InMemoryMonitoringRepository } from "./repository";
import { MonitoringService } from "./service";

const companyId = "11111111-1111-4111-8111-111111111111";
const sourceId = "22222222-2222-4222-8222-222222222222";
const sourceSnapshotId = "33333333-3333-4333-8333-333333333333";
const sourceFileId = "44444444-4444-4444-8444-444444444444";
const syncRunId = "55555555-5555-4555-8555-555555555555";
const failedSyncRunId = "66666666-6666-4666-8666-666666666666";
const now = "2026-04-26T12:00:00.000Z";

describe("MonitoringService", () => {
  it("persists a critical cash_posture alert from missing source posture without runtime or delivery side effects", async () => {
    const service = buildService(buildCashPosture({ freshnessState: "missing" }));

    const result = await service.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "cash_posture:acme:missing",
      triggeredBy: "finance-operator",
    });

    expect(result.monitorResult).toMatchObject({
      companyKey: "acme",
      monitorKind: "cash_posture",
      status: "alert",
      severity: "critical",
      conditions: [
        {
          kind: "missing_source",
          severity: "critical",
          evidencePath: "freshness.state",
        },
        {
          kind: "coverage_gap",
          severity: "critical",
          evidencePath: "coverageSummary",
        },
      ],
      proofBundlePosture: {
        state: "limited_by_missing_source",
      },
      replayPosture: {
        state: "not_appended",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
      },
      sourceFreshnessPosture: {
        state: "missing",
        missingSource: true,
        failedSource: false,
        latestSuccessfulSyncRunId: null,
        latestSuccessfulSource: null,
      },
      sourceLineageRefs: [],
    });
    expect(result.alertCard).toMatchObject({
      companyKey: "acme",
      monitorKind: "cash_posture",
      status: "alert",
      severity: "critical",
      proofBundlePosture: {
        state: "limited_by_missing_source",
      },
    });
    expect(result.monitorResult.deterministicSeverityRationale).toContain(
      "Critical because missing_source, coverage_gap condition(s) were detected from stored cash-posture state.",
    );
    expect(result.monitorResult.humanReviewNextStep).toContain(
      "Review cash-posture source coverage",
    );
    expect(result.monitorResult.limitations.join(" ")).not.toContain(
      "monitoring, and close/control flows are not implemented",
    );
  });

  it("persists a source-backed no-alert result from fresh clean cash posture", async () => {
    const repository = new InMemoryMonitoringRepository();
    const service = buildService(
      buildCashPosture({ freshnessState: "fresh", cleanSource: true }),
      repository,
    );

    const result = await service.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "cash_posture:acme:clean",
      triggeredBy: "finance-operator",
    });
    const latest = await service.getLatestCashPostureMonitorResult("acme");

    expect(result.monitorResult).toMatchObject({
      companyKey: "acme",
      monitorKind: "cash_posture",
      status: "no_alert",
      severity: "none",
      conditions: [],
      sourceFreshnessPosture: {
        state: "fresh",
        latestAttemptedSyncRunId: syncRunId,
        latestSuccessfulSyncRunId: syncRunId,
        missingSource: false,
        failedSource: false,
      },
      sourceLineageRefs: [
        {
          sourceId,
          sourceSnapshotId,
          sourceFileId,
          syncRunId,
          targetKind: "bank_account_summary",
          lineageCount: 2,
          lineageTargetCounts: {
            bankAccountCount: 1,
            bankAccountSummaryCount: 1,
          },
        },
      ],
      proofBundlePosture: {
        state: "source_backed",
      },
      replayPosture: {
        state: "not_appended",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
      },
      alertCard: null,
    });
    expect(result.monitorResult.deterministicSeverityRationale).toBe(
      "No alert because no F6A cash-posture source, freshness, coverage, or data-quality conditions were detected.",
    );
    expect(result.alertCard).toBeNull();
    expect(latest.monitorResult?.id).toBe(result.monitorResult.id);
    expect(await repository.getLatestMonitorResult({
      companyKey: "missing",
      monitorKind: "cash_posture",
    })).toBeNull();
  });

  it("keeps stale source and data-quality rationale deterministic", async () => {
    const service = buildService(
      buildCashPosture({
        freshnessState: "stale",
        diagnostics: [
          "One or more persisted bank-summary balances do not include an explicit as-of date.",
        ],
      }),
    );

    const result = await service.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "cash_posture:acme:stale-diagnostic",
      triggeredBy: "finance-operator",
    });

    expect(result.monitorResult.status).toBe("alert");
    expect(result.monitorResult.severity).toBe("warning");
    expect(result.monitorResult.conditions.map((condition) => condition.kind)).toEqual([
      "stale_source",
      "data_quality_gap",
    ]);
    expect(result.monitorResult.proofBundlePosture.state).toBe(
      "limited_by_stale_source",
    );
    expect(result.monitorResult.deterministicSeverityRationale).toBe(
      "Warning because stale_source, data_quality_gap condition(s) were detected from stored cash-posture state.",
    );
  });

  it("marks failed source posture as critical and idempotently reuses the run record", async () => {
    const service = buildService(
      buildCashPosture({
        cleanSource: true,
        failedLatestRun: true,
        freshnessState: "failed",
      }),
    );

    const first = await service.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "cash_posture:acme:failed",
      triggeredBy: "finance-operator",
    });
    const second = await service.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "cash_posture:acme:failed",
      triggeredBy: "finance-controller",
    });

    expect(first.monitorResult.id).toBe(second.monitorResult.id);
    expect(second.monitorResult).toMatchObject({
      status: "alert",
      severity: "critical",
      conditions: [
        {
          kind: "failed_source",
          severity: "critical",
        },
      ],
      proofBundlePosture: {
        state: "limited_by_failed_source",
      },
      sourceFreshnessPosture: {
        state: "failed",
        latestAttemptedSyncRunId: failedSyncRunId,
        latestSuccessfulSyncRunId: syncRunId,
        failedSource: true,
      },
      triggeredBy: "finance-controller",
    });
  });
});

function buildService(
  cashPosture: FinanceCashPostureView,
  repository = new InMemoryMonitoringRepository(),
) {
  return new MonitoringService({
    financeTwinService: {
      async getCashPosture(companyKey: string) {
        expect(companyKey).toBe("acme");
        return cashPosture;
      },
    },
    monitoringRepository: repository,
  });
}

function buildCashPosture(input: {
  cleanSource?: boolean;
  diagnostics?: string[];
  failedLatestRun?: boolean;
  freshnessState: "missing" | "fresh" | "stale" | "failed";
}): FinanceCashPostureView {
  const successfulRun = buildSyncRun({
    completedAt:
      input.freshnessState === "stale"
        ? "2026-04-24T09:00:00.000Z"
        : "2026-04-26T11:00:00.000Z",
    id: syncRunId,
    status: "succeeded",
  });
  const failedRun = buildSyncRun({
    completedAt: "2026-04-26T11:30:00.000Z",
    id: failedSyncRunId,
    status: "failed",
  });
  const latestSuccessfulRun =
    input.freshnessState === "missing" ? null : successfulRun;
  const latestAttemptedRun = input.failedLatestRun
    ? failedRun
    : latestSuccessfulRun;
  const hasSource = latestSuccessfulRun !== null;

  return FinanceCashPostureViewSchema.parse({
    company: {
      id: companyId,
      companyKey: "acme",
      displayName: "Acme Holdings",
      createdAt: now,
      updatedAt: now,
    },
    latestAttemptedSyncRun: latestAttemptedRun,
    latestSuccessfulBankSummarySlice: {
      latestSource: hasSource
        ? {
            sourceId,
            sourceSnapshotId,
            sourceFileId,
            syncRunId,
          }
        : null,
      latestSyncRun: latestSuccessfulRun,
      coverage: {
        bankAccountCount: hasSource ? 1 : 0,
        summaryRowCount: hasSource ? 1 : 0,
        lineageCount: hasSource ? 2 : 0,
        lineageTargetCounts: hasSource
          ? {
              bankAccountCount: 1,
              bankAccountSummaryCount: 1,
            }
          : {},
      },
      summary: hasSource
        ? {
            bankAccountCount: 1,
            summaryRowCount: 1,
            statementOrLedgerBalanceCount: 1,
            availableBalanceCount: 0,
            unspecifiedBalanceCount: 0,
            datedBalanceCount: 1,
            undatedBalanceCount: 0,
            currencyCount: 1,
          }
        : null,
    },
    freshness: buildFreshness({
      latestAttemptedRun,
      latestSuccessfulRun,
      state: input.freshnessState,
    }),
    currencyBuckets: hasSource
      ? [
          {
            currency: "USD",
            statementOrLedgerBalanceTotal: "1200.00",
            availableBalanceTotal: "0.00",
            unspecifiedBalanceTotal: "0.00",
            accountCount: 1,
            datedAccountCount: 1,
            undatedAccountCount: 0,
            mixedAsOfDates: false,
            earliestAsOfDate: "2026-04-26",
            latestAsOfDate: "2026-04-26",
          },
        ]
      : [],
    coverageSummary: {
      bankAccountCount: hasSource ? 1 : 0,
      reportedBalanceCount: hasSource ? 1 : 0,
      statementOrLedgerBalanceCount: hasSource ? 1 : 0,
      availableBalanceCount: 0,
      unspecifiedBalanceCount: 0,
      datedBalanceCount: hasSource ? 1 : 0,
      undatedBalanceCount: 0,
      currencyBucketCount: hasSource ? 1 : 0,
      mixedAsOfDateCurrencyBucketCount: 0,
    },
    diagnostics:
      input.diagnostics ??
      (input.cleanSource
        ? []
        : hasSource
          ? [
              "One or more persisted bank-summary balances came from ambiguous generic balance fields and remain in the unspecified bucket.",
            ]
          : []),
    limitations: [
      "Cash posture is grouped by reported currency only; this route does not perform FX conversion.",
    ],
  });
}

function buildSyncRun(input: {
  completedAt: string;
  id: string;
  status: "succeeded" | "failed";
}) {
  return {
    id: input.id,
    companyId,
    reportingPeriodId: null,
    sourceId,
    sourceSnapshotId,
    sourceFileId,
    extractorKey: "bank_account_summary_csv" as const,
    status: input.status,
    startedAt: "2026-04-26T10:50:00.000Z",
    completedAt: input.completedAt,
    stats: {},
    errorSummary:
      input.status === "failed" ? "Could not parse bank-account-summary rows." : null,
    createdAt: input.completedAt,
  };
}

function buildFreshness(input: {
  latestAttemptedRun: ReturnType<typeof buildSyncRun> | null;
  latestSuccessfulRun: ReturnType<typeof buildSyncRun> | null;
  state: "missing" | "fresh" | "stale" | "failed";
}) {
  return {
    state: input.state,
    latestSyncRunId: input.latestAttemptedRun?.id ?? null,
    latestSyncStatus: input.latestAttemptedRun?.status ?? null,
    latestCompletedAt: input.latestAttemptedRun?.completedAt ?? null,
    latestSuccessfulSyncRunId: input.latestSuccessfulRun?.id ?? null,
    latestSuccessfulCompletedAt: input.latestSuccessfulRun?.completedAt ?? null,
    ageSeconds:
      input.state === "missing"
        ? null
        : input.state === "stale"
          ? 172800
          : 3600,
    staleAfterSeconds: 86400,
    reasonCode:
      input.state === "missing"
        ? "not_synced"
        : input.state === "failed"
          ? "latest_sync_failed"
          : input.state === "stale"
            ? "latest_successful_sync_stale"
            : "latest_successful_sync_fresh",
    reasonSummary: `Synthetic ${input.state} cash-posture freshness.`,
  };
}
