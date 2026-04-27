import { describe, expect, it } from "vitest";
import {
  FinancePayablesPostureViewSchema,
  type FinancePayablesPostureCurrencyBucket,
  type FinancePayablesPostureView,
} from "@pocket-cto/domain";
import { evaluatePayablesPressureMonitor } from "./payables-evaluator";

const companyId = "11111111-1111-4111-8111-111111111111";
const sourceId = "22222222-2222-4222-8222-222222222222";
const sourceSnapshotId = "33333333-3333-4333-8333-333333333333";
const sourceFileId = "44444444-4444-4444-8444-444444444444";
const syncRunId = "55555555-5555-4555-8555-555555555555";
const failedSyncRunId = "66666666-6666-4666-8666-666666666666";
const now = "2026-04-26T12:00:00.000Z";

describe("payables pressure evaluator", () => {
  it("maps missing payables-aging source posture to a critical alert", () => {
    const evaluated = evaluatePayablesPressureMonitor(
      buildPayablesPosture({ freshnessState: "missing" }),
    );

    expect(evaluated.status).toBe("alert");
    expect(evaluated.severity).toBe("critical");
    expect(evaluated.conditions.map((condition) => condition.kind)).toEqual([
      "missing_source",
      "coverage_gap",
    ]);
    expect(evaluated.sourceFreshnessPosture).toMatchObject({
      state: "missing",
      missingSource: true,
      latestSuccessfulSource: null,
      latestSuccessfulSyncRunId: null,
    });
    expect(evaluated.proofBundlePosture.state).toBe(
      "limited_by_missing_source",
    );
    expect(evaluated.runtimeBoundary).toMatchObject({
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      investigationMissionCreated: false,
      autonomousFinanceActionUsed: false,
    });
  });

  it("maps failed and stale source freshness deterministically", () => {
    const failed = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        failedLatestRun: true,
        freshnessState: "failed",
      }),
    );
    const stale = evaluatePayablesPressureMonitor(
      buildPayablesPosture({ freshnessState: "stale" }),
    );

    expect(failed.conditions[0]).toMatchObject({
      kind: "failed_source",
      severity: "critical",
      evidencePath: "freshness.state",
    });
    expect(failed.sourceFreshnessPosture).toMatchObject({
      state: "failed",
      failedSource: true,
      latestAttemptedSyncRunId: failedSyncRunId,
      latestSuccessfulSyncRunId: syncRunId,
    });
    expect(failed.proofBundlePosture.state).toBe("limited_by_failed_source");
    expect(stale.conditions[0]).toMatchObject({
      kind: "stale_source",
      severity: "warning",
      evidencePath: "freshness.state",
    });
    expect(stale.proofBundlePosture.state).toBe("limited_by_stale_source");
  });

  it("reports coverage and data-quality gaps instead of computing partial ratios", () => {
    const evaluated = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        coverageSummary: {
          vendorCount: 1,
          rowCount: 1,
          currencyBucketCount: 1,
          datedRowCount: 1,
          undatedRowCount: 0,
          rowsWithExplicitTotalCount: 0,
          rowsWithCurrentBucketCount: 0,
          rowsWithComputablePastDueCount: 0,
          rowsWithPartialPastDueOnlyCount: 1,
        },
        diagnostics: [
          "One or more persisted payables-aging rows only expose partial past-due rollups such as over_90 or over_120, so those rows are excluded from the convenience pastDueBucketTotal.",
          "One or more persisted payables-aging rows do not expose a full total payables basis, so the convenience totalPayables field remains partial to rows with explicit totals or explicit current-plus-past-due coverage.",
        ],
        freshnessState: "fresh",
        currencyBuckets: [
          buildBucket({
            current: "0.00",
            pastDue: "0.00",
            total: "0.00",
            exactBucketTotals: [
              {
                bucketKey: "over_90",
                bucketClass: "past_due_partial_rollup",
                totalAmount: "25.00",
              },
            ],
          }),
        ],
      }),
    );

    expect(evaluated.status).toBe("alert");
    expect(evaluated.severity).toBe("warning");
    expect(evaluated.conditions.map((condition) => condition.kind)).toEqual([
      "coverage_gap",
      "coverage_gap",
      "coverage_gap",
      "data_quality_gap",
      "data_quality_gap",
    ]);
    expect(
      evaluated.conditions.some(
        (condition) => condition.kind === "overdue_concentration",
      ),
    ).toBe(false);
    expect(evaluated.proofBundlePosture.state).toBe("limited_by_coverage_gap");
  });

  it("blocks overdue concentration when diagnostics report conflicting past-due basis", () => {
    const conflictingDiagnostic =
      "One or more persisted payables-aging rows report both explicit past_due totals and detailed overdue buckets that disagree, so those rows are excluded from the convenience pastDueBucketTotal.";
    const evaluated = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        currencyBuckets: [
          buildBucket({
            current: "20.00",
            exactBucketTotals: [
              {
                bucketKey: "current",
                bucketClass: "current",
                totalAmount: "20.00",
              },
              {
                bucketKey: "31_60",
                bucketClass: "past_due_detail",
                totalAmount: "40.00",
              },
              {
                bucketKey: "past_due",
                bucketClass: "past_due_total",
                totalAmount: "80.00",
              },
              {
                bucketKey: "total",
                bucketClass: "total",
                totalAmount: "100.00",
              },
            ],
            pastDue: "80.00",
            total: "100.00",
          }),
        ],
        diagnostics: [conflictingDiagnostic],
        freshnessState: "fresh",
      }),
    );

    expect(evaluated.status).toBe("alert");
    expect(evaluated.severity).toBe("warning");
    expect(evaluated.conditions).toEqual([
      expect.objectContaining({
        kind: "data_quality_gap",
        severity: "warning",
        summary: conflictingDiagnostic,
      }),
    ]);
    expect(
      evaluated.conditions.some(
        (condition) => condition.kind === "overdue_concentration",
      ),
    ).toBe(false);
    expect(evaluated.proofBundlePosture.state).toBe(
      "limited_by_data_quality_gap",
    );
  });

  it("allows overdue concentration when explicit and detailed past-due buckets agree", () => {
    const evaluated = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        currencyBuckets: [
          buildBucket({
            current: "20.00",
            exactBucketTotals: [
              {
                bucketKey: "current",
                bucketClass: "current",
                totalAmount: "20.00",
              },
              {
                bucketKey: "31_60",
                bucketClass: "past_due_detail",
                totalAmount: "30.00",
              },
              {
                bucketKey: "61_90",
                bucketClass: "past_due_detail",
                totalAmount: "50.00",
              },
              {
                bucketKey: "past_due",
                bucketClass: "past_due_total",
                totalAmount: "80.00",
              },
              {
                bucketKey: "total",
                bucketClass: "total",
                totalAmount: "100.00",
              },
            ],
            pastDue: "80.00",
            total: "100.00",
          }),
        ],
        freshnessState: "fresh",
      }),
    );

    expect(evaluated.status).toBe("alert");
    expect(evaluated.severity).toBe("critical");
    expect(evaluated.conditions).toEqual([
      expect.objectContaining({
        kind: "overdue_concentration",
        severity: "critical",
        summary:
          "USD payables are 80.00% past due based on source-backed totals.",
      }),
    ]);
  });

  it("blocks overdue concentration when total denominator basis is missing", () => {
    const missingTotalDiagnostic =
      "One or more persisted payables-aging rows do not expose a full total payables basis, so the convenience totalPayables field remains partial to rows with explicit totals or explicit current-plus-past-due coverage.";
    const evaluated = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        coverageSummary: {
          vendorCount: 1,
          rowCount: 1,
          currencyBucketCount: 1,
          datedRowCount: 1,
          undatedRowCount: 0,
          rowsWithExplicitTotalCount: 0,
          rowsWithCurrentBucketCount: 1,
          rowsWithComputablePastDueCount: 1,
          rowsWithPartialPastDueOnlyCount: 0,
        },
        currencyBuckets: [
          buildBucket({
            current: "20.00",
            exactBucketTotals: [
              {
                bucketKey: "current",
                bucketClass: "current",
                totalAmount: "20.00",
              },
              {
                bucketKey: "past_due",
                bucketClass: "past_due_total",
                totalAmount: "80.00",
              },
            ],
            pastDue: "80.00",
            total: "0.00",
          }),
        ],
        diagnostics: [missingTotalDiagnostic],
        freshnessState: "fresh",
      }),
    );

    expect(evaluated.status).toBe("alert");
    expect(evaluated.conditions.map((condition) => condition.kind)).toEqual([
      "coverage_gap",
      "coverage_gap",
      "data_quality_gap",
    ]);
    expect(
      evaluated.conditions.some(
        (condition) => condition.kind === "overdue_concentration",
      ),
    ).toBe(false);
  });

  it("computes overdue concentration only from source-backed totals", () => {
    const warning = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        currencyBuckets: [
          buildBucket({
            current: "40.00",
            pastDue: "60.00",
            total: "100.00",
          }),
        ],
        freshnessState: "fresh",
      }),
    );
    const critical = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        currencyBuckets: [
          buildBucket({
            current: "20.00",
            pastDue: "80.00",
            total: "100.00",
          }),
        ],
        freshnessState: "fresh",
      }),
    );
    const clean = evaluatePayablesPressureMonitor(
      buildPayablesPosture({
        currencyBuckets: [
          buildBucket({
            current: "100.00",
            pastDue: "0.00",
            total: "100.00",
          }),
        ],
        freshnessState: "fresh",
      }),
    );

    expect(warning).toMatchObject({
      status: "alert",
      severity: "warning",
      proofBundlePosture: {
        state: "source_backed",
      },
    });
    expect(warning.conditions).toEqual([
      expect.objectContaining({
        kind: "overdue_concentration",
        severity: "warning",
        summary:
          "USD payables are 60.00% past due based on source-backed totals.",
      }),
    ]);
    expect(warning.deterministicSeverityRationale).toBe(
      "Warning because overdue_concentration condition(s) were detected from stored payables-pressure state.",
    );
    expect(warning.sourceLineageRefs[0]).toMatchObject({
      sourceId,
      sourceSnapshotId,
      sourceFileId,
      syncRunId,
      targetKind: "payables_aging_row",
      lineageCount: 3,
    });
    expect(critical.severity).toBe("critical");
    expect(critical.conditions[0]).toMatchObject({
      kind: "overdue_concentration",
      severity: "critical",
    });
    expect(clean).toMatchObject({
      status: "no_alert",
      severity: "none",
      conditions: [],
      proofBundlePosture: {
        state: "source_backed",
      },
    });
    expect(clean.deterministicSeverityRationale).toBe(
      "No alert because no F6D payables-pressure source, freshness, coverage, data-quality, or overdue-concentration conditions were detected.",
    );
  });
});

function buildPayablesPosture(input: {
  coverageSummary?: FinancePayablesPostureView["coverageSummary"];
  currencyBuckets?: FinancePayablesPostureCurrencyBucket[];
  diagnostics?: string[];
  failedLatestRun?: boolean;
  freshnessState: "missing" | "fresh" | "stale" | "failed";
}): FinancePayablesPostureView {
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
  const currencyBuckets = hasSource
    ? (input.currencyBuckets ?? [
        buildBucket({
          current: "80.00",
          pastDue: "20.00",
          total: "100.00",
        }),
      ])
    : [];

  return FinancePayablesPostureViewSchema.parse({
    company: {
      id: companyId,
      companyKey: "acme",
      displayName: "Acme Holdings",
      createdAt: now,
      updatedAt: now,
    },
    latestAttemptedSyncRun: latestAttemptedRun,
    latestSuccessfulPayablesAgingSlice: {
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
        vendorCount: hasSource ? 1 : 0,
        rowCount: hasSource ? 1 : 0,
        lineageCount: hasSource ? 3 : 0,
        lineageTargetCounts: hasSource
          ? {
              vendorCount: 1,
              payablesAgingRowCount: 1,
            }
          : {},
      },
      summary: hasSource
        ? {
            vendorCount: 1,
            rowCount: 1,
            datedRowCount: 1,
            undatedRowCount: 0,
            currencyCount: 1,
            reportedBucketKeys: ["current", "past_due", "total"],
          }
        : null,
    },
    freshness: buildFreshness({
      latestAttemptedRun,
      latestSuccessfulRun,
      state: input.freshnessState,
    }),
    currencyBuckets,
    coverageSummary: input.coverageSummary ?? {
      vendorCount: hasSource ? 1 : 0,
      rowCount: hasSource ? 1 : 0,
      currencyBucketCount: hasSource ? 1 : 0,
      datedRowCount: hasSource ? 1 : 0,
      undatedRowCount: 0,
      rowsWithExplicitTotalCount: hasSource ? 1 : 0,
      rowsWithCurrentBucketCount: hasSource ? 1 : 0,
      rowsWithComputablePastDueCount: hasSource ? 1 : 0,
      rowsWithPartialPastDueOnlyCount: 0,
    },
    diagnostics: input.diagnostics ?? [],
    limitations: [
      "Payables posture stays grouped by reported currency only; this route does not perform FX conversion.",
    ],
  });
}

function buildBucket(input: {
  current: string;
  exactBucketTotals?: FinancePayablesPostureCurrencyBucket["exactBucketTotals"];
  pastDue: string;
  total: string;
}): FinancePayablesPostureCurrencyBucket {
  return {
    currency: "USD",
    totalPayables: input.total,
    currentBucketTotal: input.current,
    pastDueBucketTotal: input.pastDue,
    exactBucketTotals: input.exactBucketTotals ?? [
      {
        bucketKey: "current",
        bucketClass: "current",
        totalAmount: input.current,
      },
      {
        bucketKey: "past_due",
        bucketClass: "past_due_total",
        totalAmount: input.pastDue,
      },
      {
        bucketKey: "total",
        bucketClass: "total",
        totalAmount: input.total,
      },
    ],
    vendorCount: 1,
    datedVendorCount: 1,
    undatedVendorCount: 0,
    mixedAsOfDates: false,
    earliestAsOfDate: "2026-04-26",
    latestAsOfDate: "2026-04-26",
  };
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
    extractorKey: "payables_aging_csv" as const,
    status: input.status,
    startedAt: "2026-04-26T10:50:00.000Z",
    completedAt: input.completedAt,
    stats: {},
    errorSummary:
      input.status === "failed" ? "Could not parse payables-aging rows." : null,
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
    reasonSummary: `Synthetic ${input.state} payables-posture freshness.`,
  };
}
