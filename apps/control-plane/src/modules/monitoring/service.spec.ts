import { describe, expect, it } from "vitest";
import {
  buildCfoWikiConceptPageKey,
  buildCfoWikiPolicyPageKey,
  CfoWikiBoundSourceSummarySchema,
  CfoWikiPageViewSchema,
  FinanceCashPostureViewSchema,
  type FinanceCashPostureView,
  FinanceCollectionsPostureViewSchema,
  type FinanceCollectionsPostureView,
  FinancePayablesPostureViewSchema,
  type FinancePayablesPostureView,
  type CfoWikiBoundSourceSummary,
  type CfoWikiPageKey,
  type CfoWikiPageView,
} from "@pocket-cto/domain";
import type { CfoWikiServicePort } from "../../lib/types";
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
    const service = buildService(
      buildCashPosture({ freshnessState: "missing" }),
    );

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
    expect(
      await repository.getLatestMonitorResult({
        companyKey: "missing",
        monitorKind: "cash_posture",
      }),
    ).toBeNull();
  });

  it("persists collections_pressure results separately and keeps retries idempotent", async () => {
    const repository = new InMemoryMonitoringRepository();
    const service = buildService(
      buildCashPosture({ freshnessState: "fresh", cleanSource: true }),
      repository,
      buildCollectionsPosture(),
    );

    const first = await service.runCollectionsPressureMonitor({
      companyKey: "acme",
      runKey: "collections_pressure:acme:clean",
      triggeredBy: "finance-operator",
    });
    const second = await service.runCollectionsPressureMonitor({
      companyKey: "acme",
      runKey: "collections_pressure:acme:clean",
      triggeredBy: "finance-controller",
    });
    const latest =
      await service.getLatestCollectionsPressureMonitorResult("acme");

    expect(second.monitorResult.id).toBe(first.monitorResult.id);
    expect(second.monitorResult).toMatchObject({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      status: "no_alert",
      severity: "none",
      conditions: [],
      proofBundlePosture: {
        state: "source_backed",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
      },
      triggeredBy: "finance-controller",
      alertCard: null,
    });
    expect(second.alertCard).toBeNull();
    expect(latest.monitorResult?.id).toBe(first.monitorResult.id);
    expect(
      await repository.getLatestMonitorResult({
        companyKey: "acme",
        monitorKind: "cash_posture",
      }),
    ).toBeNull();
  });

  it("persists payables_pressure results separately and keeps retries idempotent", async () => {
    const repository = new InMemoryMonitoringRepository();
    const service = buildService(
      buildCashPosture({ freshnessState: "fresh", cleanSource: true }),
      repository,
      buildCollectionsPosture(),
      buildPayablesPosture(),
    );

    const first = await service.runPayablesPressureMonitor({
      companyKey: "acme",
      runKey: "payables_pressure:acme:clean",
      triggeredBy: "finance-operator",
    });
    const second = await service.runPayablesPressureMonitor({
      companyKey: "acme",
      runKey: "payables_pressure:acme:clean",
      triggeredBy: "finance-controller",
    });
    const latest = await service.getLatestPayablesPressureMonitorResult("acme");

    expect(second.monitorResult.id).toBe(first.monitorResult.id);
    expect(second.monitorResult).toMatchObject({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      status: "no_alert",
      severity: "none",
      conditions: [],
      proofBundlePosture: {
        state: "source_backed",
      },
      runtimeBoundary: {
        runtimeCodexUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        autonomousFinanceActionUsed: false,
      },
      triggeredBy: "finance-controller",
      alertCard: null,
    });
    expect(second.monitorResult.deterministicSeverityRationale).toBe(
      "No alert because no F6D payables-pressure source, freshness, coverage, data-quality, or overdue-concentration conditions were detected.",
    );
    expect(second.alertCard).toBeNull();
    expect(latest.monitorResult?.id).toBe(first.monitorResult.id);
    expect(
      await repository.getLatestMonitorResult({
        companyKey: "acme",
        monitorKind: "collections_pressure",
      }),
    ).toBeNull();
  });

  it("persists policy_covenant_threshold results without mission or runtime side effects", async () => {
    const repository = new InMemoryMonitoringRepository();
    const service = buildService(
      buildCashPosture({ freshnessState: "fresh", cleanSource: true }),
      repository,
      buildCollectionsPosture(60),
      buildPayablesPosture(),
      buildPolicyWikiService(
        "Pocket CFO threshold: collections_past_due_share <= 50 percent",
      ),
    );

    const first = await service.runPolicyCovenantThresholdMonitor({
      companyKey: "acme",
      runKey: "policy_covenant_threshold:acme:test",
      triggeredBy: "finance-operator",
    });
    const second = await service.runPolicyCovenantThresholdMonitor({
      companyKey: "acme",
      runKey: "policy_covenant_threshold:acme:test",
      triggeredBy: "finance-controller",
    });
    const latest =
      await service.getLatestPolicyCovenantThresholdMonitorResult("acme");

    expect(second.monitorResult.id).toBe(first.monitorResult.id);
    expect(second.monitorResult).toMatchObject({
      alertCard: {
        monitorKind: "policy_covenant_threshold",
        status: "alert",
      },
      companyKey: "acme",
      conditions: [
        {
          kind: "threshold_breach",
          severity: "critical",
        },
      ],
      monitorKind: "policy_covenant_threshold",
      proofBundlePosture: {
        state: "source_backed",
      },
      runtimeBoundary: {
        autonomousFinanceActionUsed: false,
        deliveryActionUsed: false,
        investigationMissionCreated: false,
        runtimeCodexUsed: false,
      },
      status: "alert",
      triggeredBy: "finance-controller",
    });
    expect(second.alertCard?.sourceLineageRefs.length).toBeGreaterThan(0);
    expect(latest.monitorResult?.id).toBe(first.monitorResult.id);
    expect(
      await repository.getLatestMonitorResult({
        companyKey: "acme",
        monitorKind: "payables_pressure",
      }),
    ).toBeNull();
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
    expect(
      result.monitorResult.conditions.map((condition) => condition.kind),
    ).toEqual(["stale_source", "data_quality_gap"]);
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
  collectionsPosture = buildCollectionsPosture(),
  payablesPosture = buildPayablesPosture(),
  cfoWikiService: Pick<CfoWikiServicePort, "getPage" | "listCompanySources"> =
    buildEmptyPolicyWikiService(),
) {
  return new MonitoringService({
    cfoWikiService,
    financeTwinService: {
      async getCashPosture(companyKey: string) {
        expect(companyKey).toBe("acme");
        return cashPosture;
      },
      async getCollectionsPosture(companyKey: string) {
        expect(companyKey).toBe("acme");
        return collectionsPosture;
      },
      async getPayablesPosture(companyKey: string) {
        expect(companyKey).toBe("acme");
        return payablesPosture;
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
      input.status === "failed"
        ? "Could not parse bank-account-summary rows."
        : null,
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

function buildCollectionsPosture(
  pastDueSharePercent = 20,
): FinanceCollectionsPostureView {
  const pastDue = formatMoney(pastDueSharePercent);
  const current = formatMoney(100 - pastDueSharePercent);

  return FinanceCollectionsPostureViewSchema.parse({
    company: {
      id: companyId,
      companyKey: "acme",
      displayName: "Acme Holdings",
      createdAt: now,
      updatedAt: now,
    },
    latestAttemptedSyncRun: buildReceivablesSyncRun(),
    latestSuccessfulReceivablesAgingSlice: {
      latestSource: {
        sourceId,
        sourceSnapshotId,
        sourceFileId,
        syncRunId,
      },
      latestSyncRun: buildReceivablesSyncRun(),
      coverage: {
        customerCount: 1,
        rowCount: 1,
        lineageCount: 3,
        lineageTargetCounts: {
          customerCount: 1,
          receivablesAgingRowCount: 1,
        },
      },
      summary: {
        customerCount: 1,
        rowCount: 1,
        datedRowCount: 1,
        undatedRowCount: 0,
        currencyCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
      },
    },
    freshness: {
      state: "fresh",
      latestSyncRunId: syncRunId,
      latestSyncStatus: "succeeded",
      latestCompletedAt: "2026-04-26T11:00:00.000Z",
      latestSuccessfulSyncRunId: syncRunId,
      latestSuccessfulCompletedAt: "2026-04-26T11:00:00.000Z",
      ageSeconds: 3600,
      staleAfterSeconds: 86400,
      reasonCode: "latest_successful_sync_fresh",
      reasonSummary: "Synthetic fresh collections-posture freshness.",
    },
    currencyBuckets: [
      {
        currency: "USD",
        totalReceivables: "100.00",
        currentBucketTotal: current,
        pastDueBucketTotal: pastDue,
        exactBucketTotals: [
          {
            bucketKey: "current",
            bucketClass: "current",
            totalAmount: current,
          },
          {
            bucketKey: "past_due",
            bucketClass: "past_due_total",
            totalAmount: pastDue,
          },
          {
            bucketKey: "total",
            bucketClass: "total",
            totalAmount: "100.00",
          },
        ],
        customerCount: 1,
        datedCustomerCount: 1,
        undatedCustomerCount: 0,
        mixedAsOfDates: false,
        earliestAsOfDate: "2026-04-26",
        latestAsOfDate: "2026-04-26",
      },
    ],
    coverageSummary: {
      customerCount: 1,
      rowCount: 1,
      currencyBucketCount: 1,
      datedRowCount: 1,
      undatedRowCount: 0,
      rowsWithExplicitTotalCount: 1,
      rowsWithCurrentBucketCount: 1,
      rowsWithComputablePastDueCount: 1,
      rowsWithPartialPastDueOnlyCount: 0,
    },
    diagnostics: [],
    limitations: [
      "Collections posture stays grouped by reported currency only; this route does not perform FX conversion.",
    ],
  });
}

function buildReceivablesSyncRun() {
  return {
    id: syncRunId,
    companyId,
    reportingPeriodId: null,
    sourceId,
    sourceSnapshotId,
    sourceFileId,
    extractorKey: "receivables_aging_csv" as const,
    status: "succeeded" as const,
    startedAt: "2026-04-26T10:50:00.000Z",
    completedAt: "2026-04-26T11:00:00.000Z",
    stats: {},
    errorSummary: null,
    createdAt: "2026-04-26T11:00:00.000Z",
  };
}

function buildPayablesPosture(): FinancePayablesPostureView {
  return FinancePayablesPostureViewSchema.parse({
    company: {
      id: companyId,
      companyKey: "acme",
      displayName: "Acme Holdings",
      createdAt: now,
      updatedAt: now,
    },
    latestAttemptedSyncRun: buildPayablesSyncRun(),
    latestSuccessfulPayablesAgingSlice: {
      latestSource: {
        sourceId,
        sourceSnapshotId,
        sourceFileId,
        syncRunId,
      },
      latestSyncRun: buildPayablesSyncRun(),
      coverage: {
        vendorCount: 1,
        rowCount: 1,
        lineageCount: 3,
        lineageTargetCounts: {
          vendorCount: 1,
          payablesAgingRowCount: 1,
        },
      },
      summary: {
        vendorCount: 1,
        rowCount: 1,
        datedRowCount: 1,
        undatedRowCount: 0,
        currencyCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
      },
    },
    freshness: {
      state: "fresh",
      latestSyncRunId: syncRunId,
      latestSyncStatus: "succeeded",
      latestCompletedAt: "2026-04-26T11:00:00.000Z",
      latestSuccessfulSyncRunId: syncRunId,
      latestSuccessfulCompletedAt: "2026-04-26T11:00:00.000Z",
      ageSeconds: 3600,
      staleAfterSeconds: 86400,
      reasonCode: "latest_successful_sync_fresh",
      reasonSummary: "Synthetic fresh payables-posture freshness.",
    },
    currencyBuckets: [
      {
        currency: "USD",
        totalPayables: "100.00",
        currentBucketTotal: "100.00",
        pastDueBucketTotal: "0.00",
        exactBucketTotals: [
          {
            bucketKey: "current",
            bucketClass: "current",
            totalAmount: "100.00",
          },
          {
            bucketKey: "past_due",
            bucketClass: "past_due_total",
            totalAmount: "0.00",
          },
          {
            bucketKey: "total",
            bucketClass: "total",
            totalAmount: "100.00",
          },
        ],
        vendorCount: 1,
        datedVendorCount: 1,
        undatedVendorCount: 0,
        mixedAsOfDates: false,
        earliestAsOfDate: "2026-04-26",
        latestAsOfDate: "2026-04-26",
      },
    ],
    coverageSummary: {
      vendorCount: 1,
      rowCount: 1,
      currencyBucketCount: 1,
      datedRowCount: 1,
      undatedRowCount: 0,
      rowsWithExplicitTotalCount: 1,
      rowsWithCurrentBucketCount: 1,
      rowsWithComputablePastDueCount: 1,
      rowsWithPartialPastDueOnlyCount: 0,
    },
    diagnostics: [],
    limitations: [
      "Payables posture stays grouped by reported currency only; this route does not perform FX conversion.",
    ],
  });
}

function buildPayablesSyncRun() {
  return {
    id: syncRunId,
    companyId,
    reportingPeriodId: null,
    sourceId,
    sourceSnapshotId,
    sourceFileId,
    extractorKey: "payables_aging_csv" as const,
    status: "succeeded" as const,
    startedAt: "2026-04-26T10:50:00.000Z",
    completedAt: "2026-04-26T11:00:00.000Z",
    stats: {},
    errorSummary: null,
    createdAt: "2026-04-26T11:00:00.000Z",
  };
}

function buildEmptyPolicyWikiService(): Pick<
  CfoWikiServicePort,
  "getPage" | "listCompanySources"
> {
  return {
    async getPage() {
      throw new Error("No CFO Wiki page fixture configured.");
    },
    async listCompanySources(companyKey: string) {
      expect(companyKey).toBe("acme");
      return {
        companyDisplayName: "Acme Holdings",
        companyId,
        companyKey: "acme",
        limitations: [],
        sourceCount: 0,
        sources: [],
      };
    },
  };
}

function buildPolicyWikiService(
  thresholdLine: string,
): Pick<CfoWikiServicePort, "getPage" | "listCompanySources"> {
  const policySource = buildPolicySource(thresholdLine);
  const policyPageKey = buildCfoWikiPolicyPageKey(policySource.source.id);
  const policyCorpusPageKey = buildCfoWikiConceptPageKey("policy-corpus");

  return {
    async getPage(companyKey: string, pageKey: CfoWikiPageKey) {
      expect(companyKey).toBe("acme");

      if (pageKey === policyPageKey) {
        return buildPolicyPage({
          markdownBody: thresholdLine,
          pageKey,
          pageKind: "policy",
        });
      }

      if (pageKey === policyCorpusPageKey) {
        return buildPolicyPage({
          markdownBody: "Policy corpus page.",
          pageKey,
          pageKind: "concept",
        });
      }

      throw new Error(`Unexpected CFO Wiki page ${pageKey}`);
    },
    async listCompanySources(companyKey: string) {
      expect(companyKey).toBe("acme");
      return {
        companyDisplayName: "Acme Holdings",
        companyId,
        companyKey: "acme",
        limitations: [],
        sourceCount: 1,
        sources: [policySource],
      };
    },
  };
}

function buildPolicySource(thresholdLine: string): CfoWikiBoundSourceSummary {
  const checksum =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  return CfoWikiBoundSourceSummarySchema.parse({
    binding: {
      boundBy: "operator",
      companyId,
      createdAt: now,
      documentRole: "policy_document",
      id: "77777777-7777-4777-8777-777777777777",
      includeInCompile: true,
      sourceId,
      updatedAt: now,
    },
    latestExtract: {
      companyId,
      createdAt: now,
      documentKind: "markdown_text",
      errorSummary: null,
      excerptBlocks: [{ heading: null, text: thresholdLine }],
      extractedAt: now,
      extractedText: thresholdLine,
      extractStatus: "extracted",
      headingOutline: [],
      id: "88888888-8888-4888-8888-888888888888",
      inputChecksumSha256: checksum,
      parserVersion: "test-parser-v1",
      renderedMarkdown: thresholdLine,
      sourceFileId,
      sourceId,
      sourceSnapshotId,
      title: "Threshold policy",
      updatedAt: now,
      warnings: [],
    },
    latestSnapshot: {
      capturedAt: now,
      checksumSha256: checksum,
      createdAt: now,
      id: sourceSnapshotId,
      ingestErrorSummary: null,
      ingestStatus: "ready",
      mediaType: "text/markdown",
      originalFileName: "threshold-policy.md",
      sizeBytes: 128,
      sourceId,
      storageKind: "local_path",
      storageRef: "/tmp/threshold-policy.md",
      updatedAt: now,
      version: 1,
    },
    latestSourceFile: {
      capturedAt: now,
      checksumSha256: checksum,
      createdAt: now,
      createdBy: "operator",
      id: sourceFileId,
      mediaType: "text/markdown",
      originalFileName: "threshold-policy.md",
      sizeBytes: 128,
      sourceId,
      sourceSnapshotId,
      storageKind: "local_path",
      storageRef: "/tmp/threshold-policy.md",
    },
    limitations: [],
    source: {
      createdAt: now,
      createdBy: "operator",
      description: "Policy document",
      id: sourceId,
      kind: "document",
      name: "Threshold policy",
      originKind: "manual",
      updatedAt: now,
    },
  });
}

function buildPolicyPage(input: {
  markdownBody: string;
  pageKey: CfoWikiPageKey;
  pageKind: CfoWikiPageView["page"]["pageKind"];
}): CfoWikiPageView {
  return CfoWikiPageViewSchema.parse({
    backlinks: [],
    companyDisplayName: "Acme Holdings",
    companyId,
    companyKey: "acme",
    freshnessSummary: {
      state: "fresh",
      summary: "Synthetic fresh wiki page.",
    },
    latestCompileRun: {
      completedAt: now,
      compilerVersion: "test-compiler-v1",
      companyId,
      createdAt: now,
      errorSummary: null,
      id: "99999999-9999-4999-8999-999999999999",
      startedAt: now,
      stats: {},
      status: "succeeded",
      triggeredBy: "operator",
      triggerKind: "manual",
      updatedAt: now,
    },
    limitations: [],
    links: [],
    page: {
      companyId,
      compileRunId: "99999999-9999-4999-8999-999999999999",
      createdAt: now,
      filedMetadata: null,
      freshnessSummary: {
        state: "fresh",
        summary: "Synthetic fresh policy page.",
      },
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      lastCompiledAt: now,
      limitations: [],
      markdownBody: input.markdownBody,
      markdownPath: `${input.pageKey}.md`,
      ownershipKind: "compiler_owned",
      pageKey: input.pageKey,
      pageKind: input.pageKind,
      summary: "Synthetic policy page.",
      temporalStatus: "current",
      title: "Synthetic policy page",
      updatedAt: now,
    },
    refs: [],
  });
}

function formatMoney(value: number) {
  return value.toFixed(2);
}
