import {
  MonitorLatestResultSchema,
  MonitorResultSchema,
  MonitorRunResultSchema,
  type FinanceCashPostureView,
  type FinanceCollectionsPostureView,
  type FinancePayablesPostureView,
  type MonitorAlertCard,
  type MonitorKind,
} from "@pocket-cto/domain";
import type { FinanceTwinServicePort } from "../../lib/types";
import { evaluateCollectionsPressureMonitor } from "./collections-evaluator";
import { evaluateCashPostureMonitor } from "./evaluator";
import { evaluatePayablesPressureMonitor } from "./payables-evaluator";
import type { MonitoringRepository } from "./repository";

type MonitoringServiceDeps = {
  financeTwinService: Pick<
    FinanceTwinServicePort,
    "getCashPosture" | "getCollectionsPosture" | "getPayablesPosture"
  >;
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
            monitorKind: "cash_posture",
          })
        : null;

    const monitorResult = MonitorResultSchema.parse({
      id: crypto.randomUUID(),
      alertCard,
      companyId: cashPosture.company.id,
      companyKey: cashPosture.company.companyKey,
      conditions: evaluated.conditions,
      createdAt,
      deterministicSeverityRationale: evaluated.deterministicSeverityRationale,
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

  async runCollectionsPressureMonitor(input: {
    companyKey: string;
    runKey?: string | null;
    triggeredBy: string;
  }) {
    const collectionsPosture =
      await this.deps.financeTwinService.getCollectionsPosture(
        input.companyKey,
      );
    const evaluated = evaluateCollectionsPressureMonitor(collectionsPosture);
    const createdAt = new Date().toISOString();
    const runKey =
      input.runKey ??
      buildDefaultCollectionsRunKey(collectionsPosture, evaluated);
    const alertCard =
      evaluated.status === "alert"
        ? buildAlertCard({
            companyKey: collectionsPosture.company.companyKey,
            createdAt,
            evaluated,
            monitorKind: "collections_pressure",
          })
        : null;

    const monitorResult = MonitorResultSchema.parse({
      id: crypto.randomUUID(),
      alertCard,
      companyId: collectionsPosture.company.id,
      companyKey: collectionsPosture.company.companyKey,
      conditions: evaluated.conditions,
      createdAt,
      deterministicSeverityRationale: evaluated.deterministicSeverityRationale,
      humanReviewNextStep: evaluated.humanReviewNextStep,
      limitations: evaluated.limitations,
      monitorKind: "collections_pressure",
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

  async getLatestCollectionsPressureMonitorResult(companyKey: string) {
    const monitorResult =
      await this.deps.monitoringRepository.getLatestMonitorResult({
        companyKey,
        monitorKind: "collections_pressure",
      });

    return MonitorLatestResultSchema.parse({
      alertCard: monitorResult?.alertCard ?? null,
      companyKey,
      monitorKind: "collections_pressure",
      monitorResult,
    });
  }

  async runPayablesPressureMonitor(input: {
    companyKey: string;
    runKey?: string | null;
    triggeredBy: string;
  }) {
    const payablesPosture =
      await this.deps.financeTwinService.getPayablesPosture(input.companyKey);
    const evaluated = evaluatePayablesPressureMonitor(payablesPosture);
    const createdAt = new Date().toISOString();
    const runKey =
      input.runKey ?? buildDefaultPayablesRunKey(payablesPosture, evaluated);
    const alertCard =
      evaluated.status === "alert"
        ? buildAlertCard({
            companyKey: payablesPosture.company.companyKey,
            createdAt,
            evaluated,
            monitorKind: "payables_pressure",
          })
        : null;

    const monitorResult = MonitorResultSchema.parse({
      id: crypto.randomUUID(),
      alertCard,
      companyId: payablesPosture.company.id,
      companyKey: payablesPosture.company.companyKey,
      conditions: evaluated.conditions,
      createdAt,
      deterministicSeverityRationale: evaluated.deterministicSeverityRationale,
      humanReviewNextStep: evaluated.humanReviewNextStep,
      limitations: evaluated.limitations,
      monitorKind: "payables_pressure",
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

  async getLatestPayablesPressureMonitorResult(companyKey: string) {
    const monitorResult =
      await this.deps.monitoringRepository.getLatestMonitorResult({
        companyKey,
        monitorKind: "payables_pressure",
      });

    return MonitorLatestResultSchema.parse({
      alertCard: monitorResult?.alertCard ?? null,
      companyKey,
      monitorKind: "payables_pressure",
      monitorResult,
    });
  }
}

function buildAlertCard(input: {
  companyKey: string;
  createdAt: string;
  evaluated:
    | ReturnType<typeof evaluateCashPostureMonitor>
    | ReturnType<typeof evaluateCollectionsPressureMonitor>
    | ReturnType<typeof evaluatePayablesPressureMonitor>;
  monitorKind: MonitorKind;
}): MonitorAlertCard {
  return {
    companyKey: input.companyKey,
    monitorKind: input.monitorKind,
    status: "alert",
    severity:
      input.evaluated.severity === "none" ? "info" : input.evaluated.severity,
    deterministicSeverityRationale:
      input.evaluated.deterministicSeverityRationale,
    conditionSummaries: input.evaluated.conditions.map(
      (condition) => condition.summary,
    ),
    sourceFreshnessPosture: input.evaluated.sourceFreshnessPosture,
    sourceLineageRefs: input.evaluated.sourceLineageRefs,
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

function buildDefaultCollectionsRunKey(
  collectionsPosture: FinanceCollectionsPostureView,
  evaluated: ReturnType<typeof evaluateCollectionsPressureMonitor>,
) {
  const sourceKey =
    collectionsPosture.latestSuccessfulReceivablesAgingSlice.latestSyncRun
      ?.id ??
    collectionsPosture.latestAttemptedSyncRun?.id ??
    "no-receivables-aging-sync";
  const conditionKey =
    evaluated.conditions.length > 0
      ? evaluated.conditions.map((condition) => condition.kind).join("+")
      : "clear";

  return [
    "collections_pressure",
    collectionsPosture.company.companyKey,
    sourceKey,
    collectionsPosture.freshness.state,
    conditionKey,
  ].join(":");
}

function buildDefaultPayablesRunKey(
  payablesPosture: FinancePayablesPostureView,
  evaluated: ReturnType<typeof evaluatePayablesPressureMonitor>,
) {
  const sourceKey =
    payablesPosture.latestSuccessfulPayablesAgingSlice.latestSyncRun?.id ??
    payablesPosture.latestAttemptedSyncRun?.id ??
    "no-payables-aging-sync";
  const conditionKey =
    evaluated.conditions.length > 0
      ? evaluated.conditions.map((condition) => condition.kind).join("+")
      : "clear";

  return [
    "payables_pressure",
    payablesPosture.company.companyKey,
    sourceKey,
    payablesPosture.freshness.state,
    conditionKey,
  ].join(":");
}
