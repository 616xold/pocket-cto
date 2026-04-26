import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { MonitorResult } from "@pocket-cto/domain";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleFinanceTwinRepository } from "../finance-twin/drizzle-repository";
import { DrizzleMonitoringRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleMonitoringRepository", () => {
  const financeTwinRepository = new DrizzleFinanceTwinRepository(db);
  const repository = new DrizzleMonitoringRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("keeps idempotent monitor retries on the original result and alert-card timestamp", async () => {
    const company = await financeTwinRepository.upsertCompany({
      companyKey: "acme",
      displayName: "Acme Holdings",
    });
    const first = await repository.upsertMonitorResult(
      buildAlertResult({
        companyId: company.id,
        createdAt: "2026-04-26T12:00:00.000Z",
        id: "11111111-1111-4111-8111-111111111111",
        triggeredBy: "finance-operator",
      }),
    );
    const second = await repository.upsertMonitorResult(
      buildAlertResult({
        companyId: company.id,
        createdAt: "2026-04-26T12:05:00.000Z",
        id: "22222222-2222-4222-8222-222222222222",
        triggeredBy: "finance-controller",
      }),
    );
    const latest = await repository.getLatestMonitorResult({
      companyKey: "acme",
      monitorKind: "cash_posture",
    });

    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.alertCard?.createdAt).toBe(first.alertCard?.createdAt);
    expect(second.triggeredBy).toBe("finance-controller");
    expect(latest?.id).toBe(first.id);
    expect(latest?.alertCard?.createdAt).toBe(first.alertCard?.createdAt);
  });
});

function buildAlertResult(input: {
  companyId: string;
  createdAt: string;
  id: string;
  triggeredBy: string;
}): MonitorResult {
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
    id: input.id,
    companyId: input.companyId,
    companyKey: "acme",
    monitorKind: "cash_posture",
    runKey: "idempotent-missing-source",
    triggeredBy: input.triggeredBy,
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
      "Critical because missing_source condition(s) were detected from stored cash-posture state.",
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
        "Critical because missing_source condition(s) were detected from stored cash-posture state.",
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
      createdAt: input.createdAt,
    },
    createdAt: input.createdAt,
  };
}
