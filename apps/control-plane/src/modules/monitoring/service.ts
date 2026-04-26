import {
  MonitorLatestResultSchema,
  MonitorResultSchema,
  MonitorRunResultSchema,
  type FinanceCashPostureView,
  type MonitorAlertCard,
} from "@pocket-cto/domain";
import type { FinanceTwinServicePort } from "../../lib/types";
import { evaluateCashPostureMonitor } from "./evaluator";
import type { MonitoringRepository } from "./repository";

type MonitoringServiceDeps = {
  financeTwinService: Pick<FinanceTwinServicePort, "getCashPosture">;
  monitoringRepository: MonitoringRepository;
};

export class MonitoringService {
  constructor(private readonly deps: MonitoringServiceDeps) {}

  async runCashPostureMonitor(input: {
    companyKey: string;
    runKey?: string | null;
    triggeredBy: string;
  }) {
    const cashPosture = await this.deps.financeTwinService.getCashPosture(
      input.companyKey,
    );
    const evaluated = evaluateCashPostureMonitor(cashPosture);
    const createdAt = new Date().toISOString();
    const runKey = input.runKey ?? buildDefaultRunKey(cashPosture, evaluated);
    const alertCard =
      evaluated.status === "alert"
        ? buildAlertCard({
            companyKey: cashPosture.company.companyKey,
            createdAt,
            evaluated,
          })
        : null;

    const monitorResult = MonitorResultSchema.parse({
      id: crypto.randomUUID(),
      alertCard,
      companyId: cashPosture.company.id,
      companyKey: cashPosture.company.companyKey,
      conditions: evaluated.conditions,
      createdAt,
      deterministicSeverityRationale:
        evaluated.deterministicSeverityRationale,
      humanReviewNextStep: evaluated.humanReviewNextStep,
      limitations: evaluated.limitations,
      monitorKind: "cash_posture",
      proofBundlePosture: evaluated.proofBundlePosture,
      replayPosture: evaluated.replayPosture,
      runKey,
      runtimeBoundary: evaluated.runtimeBoundary,
      severity: evaluated.severity,
      sourceFreshnessPosture: evaluated.sourceFreshnessPosture,
      sourceLineageRefs: evaluated.sourceLineageRefs,
      status: evaluated.status,
      triggeredBy: input.triggeredBy,
    });
    const persisted =
      await this.deps.monitoringRepository.upsertMonitorResult(monitorResult);

    return MonitorRunResultSchema.parse({
      monitorResult: persisted,
      alertCard: persisted.alertCard,
    });
  }

  async getLatestCashPostureMonitorResult(companyKey: string) {
    const monitorResult =
      await this.deps.monitoringRepository.getLatestMonitorResult({
        companyKey,
        monitorKind: "cash_posture",
      });

    return MonitorLatestResultSchema.parse({
      alertCard: monitorResult?.alertCard ?? null,
      companyKey,
      monitorKind: "cash_posture",
      monitorResult,
    });
  }
}

function buildAlertCard(input: {
  companyKey: string;
  createdAt: string;
  evaluated: ReturnType<typeof evaluateCashPostureMonitor>;
}): MonitorAlertCard {
  return {
    companyKey: input.companyKey,
    monitorKind: "cash_posture",
    status: "alert",
    severity: input.evaluated.severity === "none" ? "info" : input.evaluated.severity,
    deterministicSeverityRationale:
      input.evaluated.deterministicSeverityRationale,
    conditionSummaries: input.evaluated.conditions.map(
      (condition) => condition.summary,
    ),
    sourceFreshnessPosture: input.evaluated.sourceFreshnessPosture,
    sourceLineageSummary: input.evaluated.sourceLineageSummary,
    limitations: input.evaluated.limitations,
    proofBundlePosture: input.evaluated.proofBundlePosture,
    humanReviewNextStep: input.evaluated.humanReviewNextStep,
    createdAt: input.createdAt,
  };
}

function buildDefaultRunKey(
  cashPosture: FinanceCashPostureView,
  evaluated: ReturnType<typeof evaluateCashPostureMonitor>,
) {
  const sourceKey =
    cashPosture.latestSuccessfulBankSummarySlice.latestSyncRun?.id ??
    cashPosture.latestAttemptedSyncRun?.id ??
    "no-bank-account-summary-sync";
  const conditionKey =
    evaluated.conditions.length > 0
      ? evaluated.conditions.map((condition) => condition.kind).join("+")
      : "clear";

  return [
    "cash_posture",
    cashPosture.company.companyKey,
    sourceKey,
    cashPosture.freshness.state,
    conditionKey,
  ].join(":");
}
