import { describe, expect, it } from "vitest";
import {
  buildCfoWikiConceptPageKey,
  buildCfoWikiPolicyPageKey,
  CfoWikiBoundSourceSummarySchema,
  CfoWikiPageViewSchema,
  FinanceCollectionsPostureViewSchema,
  FinancePayablesPostureViewSchema,
  type CfoWikiBoundSourceSummary,
  type CfoWikiPageKey,
  type CfoWikiPageView,
  type FinanceCollectionsPostureView,
  type FinancePayablesPostureView,
  type MonitorAlertCondition,
} from "@pocket-cto/domain";
import {
  evaluatePolicyCovenantThresholdMonitor,
  extractPolicyCovenantThresholdFacts,
  type PolicyCovenantThresholdEvaluationInput,
} from "./policy-covenant-evaluator";

const now = "2026-04-26T12:00:00.000Z";
const companyId = "11111111-1111-4111-8111-111111111111";
const policySourceId = "22222222-2222-4222-8222-222222222222";
const sourceSnapshotId = "33333333-3333-4333-8333-333333333333";
const sourceFileId = "44444444-4444-4444-8444-444444444444";
const syncRunId = "55555555-5555-4555-8555-555555555555";
const compileRunId = "66666666-6666-4666-8666-666666666666";
const checksum =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const thresholdMappingCases: Array<
  [string, number, MonitorAlertCondition["kind"][]]
> = [
  ["no_alert", 20, []],
  ["threshold_approaching", 45, ["threshold_approaching"]],
  ["threshold_breach", 60, ["threshold_breach"]],
];

describe("evaluatePolicyCovenantThresholdMonitor", () => {
  it("fails closed as missing_source when no included policy_document source exists", () => {
    const result = evaluate(buildInput({ policySources: [], policyPages: [] }));

    expect(conditionKinds(result)).toContain("missing_source");
    expect(result.severity).toBe("critical");
    expect(result.status).toBe("alert");
    expect(result.sourceFreshnessPosture.state).toBe("missing");
    expect(result.proofBundlePosture.state).toBe("limited_by_missing_source");
    expect(result.sourceLineageRefs).toHaveLength(0);
  });

  it("treats failed policy extracts as failed_source instead of threshold advice", () => {
    const source = buildPolicySource({
      extractStatus: "failed",
      extractedText: null,
    });
    const result = evaluate(
      buildInput({
        policyPages: [buildPolicyPageState(source)],
        policySources: [source],
      }),
    );

    expect(conditionKinds(result)).toContain("failed_source");
    expect(result.severity).toBe("critical");
    expect(result.proofBundlePosture.state).toBe("limited_by_failed_source");
  });

  it("treats stale policy page or policy-corpus posture as stale_source", () => {
    const result = evaluate(
      buildInput({
        collectionsPosture: buildCollectionsPosture(60),
        policyCorpusPage: buildPage({
          pageKey: buildCfoWikiConceptPageKey("policy-corpus"),
          pageKind: "concept",
          state: "stale",
        }),
      }),
    );

    expect(conditionKinds(result)).toContain("stale_source");
    expect(conditionKinds(result)).not.toContain("threshold_breach");
    expect(conditionKinds(result)).not.toContain("threshold_approaching");
    expect(result.severity).toBe("warning");
    expect(result.proofBundlePosture.state).toBe("limited_by_stale_source");
    expect(result.sourceLineageRefs.some(isThresholdFactRef)).toBe(true);
    expect(result.sourceLineageRefs.some(isComparableActualRef)).toBe(false);
  });

  it("reports coverage_gap when policy sources lack exact threshold grammar", () => {
    const source = buildPolicySource({
      extractedText: "Payment approvals require controller review.",
    });
    const result = evaluate(
      buildInput({
        policyPages: [buildPolicyPageState(source)],
        policySources: [source],
      }),
    );

    expect(conditionKinds(result)).toEqual(["coverage_gap"]);
    expect(result.severity).toBe("warning");
    expect(result.proofBundlePosture.state).toBe("limited_by_coverage_gap");
  });

  it("parses only exact threshold grammar and fails closed for malformed lines", () => {
    const source = buildPolicySource({
      extractedText:
        "Pocket CFO threshold: collections_past_due_share around 50 percent",
    });
    const extraction = extractPolicyCovenantThresholdFacts({
      policyPages: [buildPolicyPageState(source)],
    });
    const result = evaluate(
      buildInput({
        extraction,
        policyPages: [buildPolicyPageState(source)],
        policySources: [source],
      }),
    );

    expect(extraction.facts).toHaveLength(0);
    expect(conditionKinds(result)).toContain("data_quality_gap");
    expect(conditionKinds(result)).not.toContain("threshold_breach");
  });

  it.each([
    [
      "unsupported metric",
      "Pocket CFO threshold: covenant_leverage_ratio <= 50 percent",
    ],
    [
      "unsupported unit",
      "Pocket CFO threshold: collections_past_due_share <= 50 dollars",
    ],
  ])("reports data_quality_gap for %s", (_name, thresholdLine) => {
    const source = buildPolicySource({ extractedText: thresholdLine });
    const policyPages = [buildPolicyPageState(source)];
    const extraction = extractPolicyCovenantThresholdFacts({ policyPages });
    const result = evaluate(
      buildInput({
        extraction,
        policyPages,
        policySources: [source],
      }),
    );

    expect(extraction.issues).toHaveLength(1);
    expect(conditionKinds(result)).toContain("data_quality_gap");
    expect(
      conditionKinds(result).filter((kind) => kind === "data_quality_gap"),
    ).toHaveLength(1);
    expect(conditionKinds(result)).not.toContain("threshold_breach");
    expect(conditionKinds(result)).not.toContain("threshold_approaching");
  });

  it("reports coverage_gap when a threshold fact lacks comparable actual posture", () => {
    const result = evaluate(buildInput({ collectionsPosture: null }));

    expect(conditionKinds(result)).toContain("coverage_gap");
    expect(result.proofBundlePosture.state).toBe("limited_by_coverage_gap");
    expect(result.sourceLineageRefs.some(isThresholdFactRef)).toBe(true);
    expect(result.sourceLineageRefs.some(isComparableActualRef)).toBe(false);
  });

  it.each(thresholdMappingCases)(
    "maps a source-backed <= threshold to %s deterministically",
    (_label, actualShare, expectedKinds) => {
      const result = evaluate(
        buildInput({
          collectionsPosture: buildCollectionsPosture(actualShare),
        }),
      );

      expect(conditionKinds(result)).toEqual(expectedKinds);
      expect(result.status).toBe(expectedKinds.length > 0 ? "alert" : "no_alert");
      expect(result.severity).toBe(
        expectedKinds.includes("threshold_breach")
          ? "critical"
          : expectedKinds.includes("threshold_approaching")
            ? "warning"
            : "none",
      );
      expect(result.proofBundlePosture.state).toBe("source_backed");
      expect(result.sourceLineageRefs.some(isPolicySourceRef)).toBe(true);
      expect(result.sourceLineageRefs.some(isThresholdFactRef)).toBe(true);
      expect(result.sourceLineageRefs.some(isComparableActualRef)).toBe(true);
    },
  );

  it("uses the symmetric 90 percent proximity rule for minimum thresholds", () => {
    const source = buildPolicySource({
      extractedText:
        "Pocket CFO threshold: payables_past_due_share >= 50 percent",
    });
    const result = evaluate(
      buildInput({
        payablesPosture: buildPayablesPosture(54),
        policyPages: [buildPolicyPageState(source)],
        policySources: [source],
      }),
    );

    expect(conditionKinds(result)).toEqual(["threshold_approaching"]);
  });

  it("exposes freshness, lineage, limitations, proof posture, and review posture", () => {
    const result = evaluate(
      buildInput({ collectionsPosture: buildCollectionsPosture(60) }),
    );

    expect(result.sourceFreshnessPosture).toMatchObject({
      failedSource: false,
      missingSource: false,
      state: "fresh",
    });
    expect(result.sourceLineageSummary).toContain("policy source ref");
    expect(result.limitations.join(" ")).toContain("exact `Pocket CFO threshold");
    expect(result.deterministicSeverityRationale).toContain(
      "threshold_breach condition(s)",
    );
    expect(result.proofBundlePosture.state).toBe("source_backed");
    expect(result.humanReviewNextStep).toContain(
      "Review the cited policy threshold line",
    );
    expect(result.runtimeBoundary).toMatchObject({
      autonomousFinanceActionUsed: false,
      deliveryActionUsed: false,
      investigationMissionCreated: false,
      runtimeCodexUsed: false,
    });
  });
});

function evaluate(input: PolicyCovenantThresholdEvaluationInput) {
  return evaluatePolicyCovenantThresholdMonitor(input);
}

function conditionKinds(result: ReturnType<typeof evaluate>) {
  return result.conditions.map((condition) => condition.kind);
}

function buildInput(
  overrides: Partial<PolicyCovenantThresholdEvaluationInput> = {},
): PolicyCovenantThresholdEvaluationInput {
  const policySource =
    overrides.policySources?.[0] ??
    buildPolicySource({
      extractedText:
        "Pocket CFO threshold: collections_past_due_share <= 50 percent",
    });
  const policyPages = overrides.policyPages ?? [buildPolicyPageState(policySource)];
  const extraction =
    overrides.extraction ??
    extractPolicyCovenantThresholdFacts({
      policyPages,
    });

  return {
    collectionsPosture: buildCollectionsPosture(20),
    company: {
      companyId,
      companyKey: "acme",
    },
    extraction,
    payablesPosture: null,
    policyCorpusPage: buildPage({
      pageKey: buildCfoWikiConceptPageKey("policy-corpus"),
      pageKind: "concept",
    }),
    policyPages,
    policySources: [policySource],
    ...overrides,
  };
}

function buildPolicyPageState(source: CfoWikiBoundSourceSummary) {
  const pageKey = buildCfoWikiPolicyPageKey(source.source.id);

  return {
    page: buildPage({
      markdownBody: source.latestExtract?.renderedMarkdown ?? "Policy page.",
      pageKey,
      pageKind: "policy",
    }),
    pageKey,
    source,
  };
}

function buildPolicySource(input: {
  extractStatus?: "extracted" | "unsupported" | "failed";
  extractedText?: string | null;
}): CfoWikiBoundSourceSummary {
  const extractStatus = input.extractStatus ?? "extracted";
  const extractedText =
    input.extractedText === undefined
      ? "Pocket CFO threshold: collections_past_due_share <= 50 percent"
      : input.extractedText;

  return CfoWikiBoundSourceSummarySchema.parse({
    binding: {
      boundBy: "operator",
      companyId,
      createdAt: now,
      documentRole: "policy_document",
      id: "77777777-7777-4777-8777-777777777777",
      includeInCompile: true,
      sourceId: policySourceId,
      updatedAt: now,
    },
    latestExtract: {
      companyId,
      createdAt: now,
      documentKind: "markdown_text",
      errorSummary: extractStatus === "failed" ? "Extract failed." : null,
      excerptBlocks: extractedText ? [{ heading: null, text: extractedText }] : [],
      extractedAt: now,
      extractedText,
      extractStatus,
      headingOutline: [],
      id: "88888888-8888-4888-8888-888888888888",
      inputChecksumSha256: checksum,
      parserVersion: "test-parser-v1",
      renderedMarkdown: extractedText,
      sourceFileId,
      sourceId: policySourceId,
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
      sourceId: policySourceId,
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
      sourceId: policySourceId,
      sourceSnapshotId,
      storageKind: "local_path",
      storageRef: "/tmp/threshold-policy.md",
    },
    limitations: [],
    source: {
      createdAt: now,
      createdBy: "operator",
      description: "Policy document",
      id: policySourceId,
      kind: "document",
      name: "Threshold policy",
      originKind: "manual",
      updatedAt: now,
    },
  });
}

function buildPage(input: {
  markdownBody?: string;
  pageKey: CfoWikiPageKey;
  pageKind: CfoWikiPageView["page"]["pageKind"];
  state?: CfoWikiPageView["freshnessSummary"]["state"];
}): CfoWikiPageView {
  const state = input.state ?? "fresh";

  return CfoWikiPageViewSchema.parse({
    backlinks: [],
    companyDisplayName: "Acme Holdings",
    companyId,
    companyKey: "acme",
    freshnessSummary: {
      state,
      summary: `Synthetic ${state} wiki page freshness.`,
    },
    latestCompileRun: {
      completedAt: now,
      compilerVersion: "test-compiler-v1",
      companyId,
      createdAt: now,
      errorSummary: null,
      id: compileRunId,
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
      compileRunId,
      createdAt: now,
      filedMetadata: null,
      freshnessSummary: {
        state,
        summary: `Synthetic ${state} policy page freshness.`,
      },
      id: "99999999-9999-4999-8999-999999999999",
      lastCompiledAt: now,
      limitations: [],
      markdownBody: input.markdownBody ?? "Policy page.",
      markdownPath: `${input.pageKey}.md`,
      ownershipKind: "compiler_owned",
      pageKey: input.pageKey,
      pageKind: input.pageKind,
      summary: "Synthetic page.",
      temporalStatus: "current",
      title: "Synthetic page",
      updatedAt: now,
    },
    refs: [],
  });
}

function buildCollectionsPosture(
  pastDueSharePercent: number,
): FinanceCollectionsPostureView {
  const pastDue = formatMoney(pastDueSharePercent);
  const current = formatMoney(100 - pastDueSharePercent);

  return FinanceCollectionsPostureViewSchema.parse({
    company: buildCompany(),
    coverageSummary: {
      currencyBucketCount: 1,
      customerCount: 1,
      datedRowCount: 1,
      rowCount: 1,
      rowsWithComputablePastDueCount: 1,
      rowsWithCurrentBucketCount: 1,
      rowsWithExplicitTotalCount: 1,
      rowsWithPartialPastDueOnlyCount: 0,
      undatedRowCount: 0,
    },
    currencyBuckets: [
      {
        currency: "USD",
        currentBucketTotal: current,
        customerCount: 1,
        datedCustomerCount: 1,
        earliestAsOfDate: "2026-04-26",
        exactBucketTotals: [
          { bucketClass: "current", bucketKey: "current", totalAmount: current },
          {
            bucketClass: "past_due_total",
            bucketKey: "past_due",
            totalAmount: pastDue,
          },
          { bucketClass: "total", bucketKey: "total", totalAmount: "100.00" },
        ],
        latestAsOfDate: "2026-04-26",
        mixedAsOfDates: false,
        pastDueBucketTotal: pastDue,
        totalReceivables: "100.00",
        undatedCustomerCount: 0,
      },
    ],
    diagnostics: [],
    freshness: buildFreshness(),
    latestAttemptedSyncRun: buildSyncRun("receivables_aging_csv"),
    latestSuccessfulReceivablesAgingSlice: {
      coverage: {
        customerCount: 1,
        lineageCount: 3,
        lineageTargetCounts: {
          customerCount: 1,
          receivablesAgingRowCount: 1,
        },
        rowCount: 1,
      },
      latestSource: buildSourceRef(),
      latestSyncRun: buildSyncRun("receivables_aging_csv"),
      summary: {
        currencyCount: 1,
        customerCount: 1,
        datedRowCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
        rowCount: 1,
        undatedRowCount: 0,
      },
    },
    limitations: [],
  });
}

function buildPayablesPosture(
  pastDueSharePercent: number,
): FinancePayablesPostureView {
  const pastDue = formatMoney(pastDueSharePercent);
  const current = formatMoney(100 - pastDueSharePercent);

  return FinancePayablesPostureViewSchema.parse({
    company: buildCompany(),
    coverageSummary: {
      currencyBucketCount: 1,
      datedRowCount: 1,
      rowCount: 1,
      rowsWithComputablePastDueCount: 1,
      rowsWithCurrentBucketCount: 1,
      rowsWithExplicitTotalCount: 1,
      rowsWithPartialPastDueOnlyCount: 0,
      undatedRowCount: 0,
      vendorCount: 1,
    },
    currencyBuckets: [
      {
        currency: "USD",
        currentBucketTotal: current,
        datedVendorCount: 1,
        earliestAsOfDate: "2026-04-26",
        exactBucketTotals: [
          { bucketClass: "current", bucketKey: "current", totalAmount: current },
          {
            bucketClass: "past_due_total",
            bucketKey: "past_due",
            totalAmount: pastDue,
          },
          { bucketClass: "total", bucketKey: "total", totalAmount: "100.00" },
        ],
        latestAsOfDate: "2026-04-26",
        mixedAsOfDates: false,
        pastDueBucketTotal: pastDue,
        totalPayables: "100.00",
        undatedVendorCount: 0,
        vendorCount: 1,
      },
    ],
    diagnostics: [],
    freshness: buildFreshness(),
    latestAttemptedSyncRun: buildSyncRun("payables_aging_csv"),
    latestSuccessfulPayablesAgingSlice: {
      coverage: {
        lineageCount: 3,
        lineageTargetCounts: {
          payablesAgingRowCount: 1,
          vendorCount: 1,
        },
        rowCount: 1,
        vendorCount: 1,
      },
      latestSource: buildSourceRef(),
      latestSyncRun: buildSyncRun("payables_aging_csv"),
      summary: {
        currencyCount: 1,
        datedRowCount: 1,
        reportedBucketKeys: ["current", "past_due", "total"],
        rowCount: 1,
        undatedRowCount: 0,
        vendorCount: 1,
      },
    },
    limitations: [],
  });
}

function buildCompany() {
  return {
    createdAt: now,
    displayName: "Acme Holdings",
    id: companyId,
    companyKey: "acme",
    updatedAt: now,
  };
}

function buildFreshness() {
  return {
    ageSeconds: 3600,
    latestCompletedAt: "2026-04-26T11:00:00.000Z",
    latestSuccessfulCompletedAt: "2026-04-26T11:00:00.000Z",
    latestSuccessfulSyncRunId: syncRunId,
    latestSyncRunId: syncRunId,
    latestSyncStatus: "succeeded" as const,
    reasonCode: "latest_successful_sync_fresh",
    reasonSummary: "Synthetic fresh posture.",
    staleAfterSeconds: 86400,
    state: "fresh" as const,
  };
}

function buildSyncRun(
  extractorKey: "receivables_aging_csv" | "payables_aging_csv",
) {
  return {
    companyId,
    completedAt: "2026-04-26T11:00:00.000Z",
    createdAt: "2026-04-26T11:00:00.000Z",
    errorSummary: null,
    extractorKey,
    id: syncRunId,
    reportingPeriodId: null,
    sourceFileId,
    sourceId: policySourceId,
    sourceSnapshotId,
    startedAt: "2026-04-26T10:50:00.000Z",
    stats: {},
    status: "succeeded" as const,
  };
}

function buildSourceRef() {
  return {
    sourceFileId,
    sourceId: policySourceId,
    sourceSnapshotId,
    syncRunId,
  };
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function isPolicySourceRef(ref: unknown) {
  return (
    typeof ref === "object" &&
    ref !== null &&
    "lineageKind" in ref &&
    ref.lineageKind === "policy_source"
  );
}

function isThresholdFactRef(ref: unknown) {
  return (
    typeof ref === "object" &&
    ref !== null &&
    "lineageKind" in ref &&
    ref.lineageKind === "policy_threshold_fact"
  );
}

function isComparableActualRef(ref: unknown) {
  return (
    typeof ref === "object" &&
    ref !== null &&
    "lineageKind" in ref &&
    ref.lineageKind === "finance_twin_actual"
  );
}
