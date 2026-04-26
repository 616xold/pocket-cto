import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MonitorResult } from "@pocket-cto/domain";
import { registerHttpErrorHandler } from "../../lib/http-errors";
import { registerMonitoringRoutes } from "./routes";

describe("monitoring routes", () => {
  const apps: Array<ReturnType<typeof Fastify>> = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("parses cash-posture monitor run input and returns the service read model", async () => {
    const monitorResult = buildMonitorResult();
    const runCashPostureMonitor = vi.fn().mockResolvedValue({
      monitorResult,
      alertCard: monitorResult.alertCard,
    });
    const app = await buildTestApp(apps, {
      runCashPostureMonitor,
      getLatestCashPostureMonitorResult: vi.fn(),
    });

    const response = await app.inject({
      method: "POST",
      url: "/monitoring/companies/acme/cash-posture/run",
      payload: {
        idempotencyKey: "operator-run-1",
        runBy: "finance-operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(runCashPostureMonitor).toHaveBeenCalledWith({
      companyKey: "acme",
      runKey: "operator-run-1",
      triggeredBy: "finance-operator",
    });
    expect(response.json()).toMatchObject({
      monitorResult: {
        monitorKind: "cash_posture",
        status: "alert",
        severity: "critical",
      },
      alertCard: {
        companyKey: "acme",
        status: "alert",
      },
    });
  });

  it("reads the latest persisted cash-posture monitor result for operator UI", async () => {
    const monitorResult = buildMonitorResult();
    const getLatestCashPostureMonitorResult = vi.fn().mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult,
      alertCard: monitorResult.alertCard,
    });
    const app = await buildTestApp(apps, {
      runCashPostureMonitor: vi.fn(),
      getLatestCashPostureMonitorResult,
    });

    const response = await app.inject({
      method: "GET",
      url: "/monitoring/companies/acme/cash-posture/latest",
    });

    expect(response.statusCode).toBe(200);
    expect(getLatestCashPostureMonitorResult).toHaveBeenCalledWith("acme");
    expect(response.json()).toMatchObject({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: {
        status: "alert",
      },
      alertCard: {
        severity: "critical",
      },
    });
  });
});

async function buildTestApp(
  apps: Array<ReturnType<typeof Fastify>>,
  service: {
    getLatestCashPostureMonitorResult: ReturnType<typeof vi.fn>;
    runCashPostureMonitor: ReturnType<typeof vi.fn>;
  },
) {
  const app = Fastify({ logger: false });
  apps.push(app);
  registerHttpErrorHandler(app);
  await registerMonitoringRoutes(app, {
    monitoringService: service,
  });
  return app;
}

function buildMonitorResult(): MonitorResult {
  const createdAt = "2026-04-26T12:00:00.000Z";
  const sourceFreshnessPosture = {
    state: "missing" as const,
    latestAttemptedSyncRunId: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulSource: null,
    missingSource: true,
    failedSource: false,
    summary: "No successful bank-account-summary source is stored.",
  };
  const proofBundlePosture = {
    state: "limited_by_missing_source" as const,
    summary:
      "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
  };

  return {
    id: "11111111-1111-4111-8111-111111111111",
    companyId: "22222222-2222-4222-8222-222222222222",
    companyKey: "acme",
    monitorKind: "cash_posture",
    runKey: "operator-run-1",
    triggeredBy: "finance-operator",
    status: "alert",
    severity: "critical",
    conditions: [
      {
        kind: "missing_source",
        severity: "critical",
        summary: "No successful bank-account-summary slice exists yet.",
        evidencePath: "freshness.state",
      },
    ],
    sourceFreshnessPosture,
    sourceLineageRefs: [],
    deterministicSeverityRationale:
      "Critical because stored cash-posture conditions include missing_source.",
    limitations: [
      "F6A cash-posture monitoring evaluates stored source posture only.",
    ],
    proofBundlePosture,
    replayPosture: {
      state: "not_appended",
      reason:
        "F6A monitor results are persisted company-scoped records and are not appended to mission replay.",
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
        "Critical because stored cash-posture conditions include missing_source.",
      conditionSummaries: [
        "No successful bank-account-summary slice exists yet.",
      ],
      sourceFreshnessPosture,
      sourceLineageSummary:
        "No bank-account-summary source lineage is available.",
      limitations: [
        "F6A cash-posture monitoring evaluates stored source posture only.",
      ],
      proofBundlePosture,
      humanReviewNextStep:
        "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
      createdAt,
    },
    createdAt,
  };
}
