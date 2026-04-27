import { z } from "zod";
import { CfoWikiFreshnessStateSchema, CfoWikiPageKeySchema } from "./cfo-wiki";
import {
  FinanceCompanyKeySchema,
  FinanceFreshnessStateSchema,
  FinanceLineageTargetCountsSchema,
  FinanceTwinLineageTargetKindSchema,
  FinanceTwinSourceRefSchema,
} from "./finance-twin";

export const MonitorKindSchema = z.enum([
  "cash_posture",
  "collections_pressure",
  "payables_pressure",
  "policy_covenant_threshold",
]);

export const MonitorInvestigationMonitorKindSchema = z.enum([
  "cash_posture",
  "collections_pressure",
]);

export const MonitorResultStatusSchema = z.enum(["no_alert", "alert"]);

export const MonitorAlertSeveritySchema = z.enum([
  "none",
  "info",
  "warning",
  "critical",
]);

export const MonitorAlertConditionKindSchema = z.enum([
  "missing_source",
  "failed_source",
  "stale_source",
  "coverage_gap",
  "overdue_concentration",
  "data_quality_gap",
  "threshold_breach",
  "threshold_approaching",
]);

export const MonitorProofBundlePostureStateSchema = z.enum([
  "source_backed",
  "limited_by_missing_source",
  "limited_by_failed_source",
  "limited_by_stale_source",
  "limited_by_coverage_gap",
  "limited_by_data_quality_gap",
]);

export const MonitorReplayPostureStateSchema = z.enum(["not_appended"]);

export const MonitorRuntimeBoundarySchema = z
  .object({
    runtimeCodexUsed: z.literal(false),
    deliveryActionUsed: z.literal(false),
    investigationMissionCreated: z.literal(false),
    autonomousFinanceActionUsed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorSourceFreshnessPostureSchema = z
  .object({
    state: FinanceFreshnessStateSchema,
    latestAttemptedSyncRunId: z.string().uuid().nullable(),
    latestSuccessfulSyncRunId: z.string().uuid().nullable(),
    latestSuccessfulSource: FinanceTwinSourceRefSchema.nullable(),
    missingSource: z.boolean(),
    failedSource: z.boolean(),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorFinanceTwinSourceLineageRefSchema = z
  .object({
    sourceId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    sourceFileId: z.string().uuid(),
    syncRunId: z.string().uuid(),
    targetKind: FinanceTwinLineageTargetKindSchema.nullable(),
    targetId: z.string().uuid().nullable(),
    lineageCount: z.number().int().nonnegative(),
    lineageTargetCounts: FinanceLineageTargetCountsSchema,
    summary: z.string().min(1),
  })
  .strict();

export const MonitorPolicySourceLineageRefSchema = z
  .object({
    lineageKind: z.literal("policy_source"),
    sourceId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid().nullable(),
    sourceFileId: z.string().uuid().nullable(),
    policyPageKey: CfoWikiPageKeySchema.nullable(),
    compileRunId: z.string().uuid().nullable(),
    documentRole: z.literal("policy_document"),
    extractStatus: z.enum(["extracted", "unsupported", "failed"]).nullable(),
    freshnessState: CfoWikiFreshnessStateSchema.nullable(),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorPolicyThresholdFactLineageRefSchema = z
  .object({
    lineageKind: z.literal("policy_threshold_fact"),
    thresholdId: z.string().min(1),
    sourceId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid().nullable(),
    sourceFileId: z.string().uuid().nullable(),
    policyPageKey: CfoWikiPageKeySchema.nullable(),
    compileRunId: z.string().uuid().nullable(),
    excerpt: z.string().min(1),
    metricKey: z.enum([
      "collections_past_due_share",
      "payables_past_due_share",
    ]),
    comparator: z.enum(["<=", "<", ">=", ">"]),
    thresholdValue: z.number().finite(),
    unit: z.literal("percent"),
    extractionRuleVersion: z.string().min(1),
    limitations: z.array(z.string().min(1)),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorComparableActualLineageRefSchema = z
  .object({
    lineageKind: z.literal("finance_twin_actual"),
    metricKey: z.enum([
      "collections_past_due_share",
      "payables_past_due_share",
    ]),
    actualValue: z.number().finite(),
    unit: z.literal("percent"),
    sourceId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    sourceFileId: z.string().uuid(),
    syncRunId: z.string().uuid(),
    targetKind: FinanceTwinLineageTargetKindSchema,
    targetId: z.string().uuid().nullable(),
    lineageCount: z.number().int().nonnegative(),
    lineageTargetCounts: FinanceLineageTargetCountsSchema,
    freshnessState: FinanceFreshnessStateSchema,
    basisSummary: z.string().min(1),
    limitations: z.array(z.string().min(1)),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorSourceLineageRefSchema = z.union([
  MonitorFinanceTwinSourceLineageRefSchema,
  MonitorPolicySourceLineageRefSchema,
  MonitorPolicyThresholdFactLineageRefSchema,
  MonitorComparableActualLineageRefSchema,
]);

export const MonitorAlertConditionSchema = z
  .object({
    kind: MonitorAlertConditionKindSchema,
    severity: MonitorAlertSeveritySchema.exclude(["none"]),
    summary: z.string().min(1),
    evidencePath: z.string().min(1),
  })
  .strict();

export const MonitorProofBundlePostureSchema = z
  .object({
    state: MonitorProofBundlePostureStateSchema,
    summary: z.string().min(1),
  })
  .strict();

export const MonitorReplayPostureSchema = z
  .object({
    state: MonitorReplayPostureStateSchema,
    reason: z.string().min(1),
  })
  .strict();

export const MonitorAlertCardSchema = z
  .object({
    companyKey: FinanceCompanyKeySchema,
    monitorKind: MonitorKindSchema,
    status: z.literal("alert"),
    severity: MonitorAlertSeveritySchema.exclude(["none"]),
    deterministicSeverityRationale: z.string().min(1),
    conditionSummaries: z.array(z.string().min(1)).min(1),
    sourceFreshnessPosture: MonitorSourceFreshnessPostureSchema,
    sourceLineageRefs: z.array(MonitorSourceLineageRefSchema).default([]),
    sourceLineageSummary: z.string().min(1),
    limitations: z.array(z.string().min(1)),
    proofBundlePosture: MonitorProofBundlePostureSchema,
    humanReviewNextStep: z.string().min(1),
    createdAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const CreateMonitorInvestigationMissionInputSchema = z
  .object({
    monitorResultId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const MonitorInvestigationRuntimeBoundarySchema = z
  .object({
    monitorResultRuntimeBoundary: MonitorRuntimeBoundarySchema,
    monitorRerunUsed: z.literal(false),
    runtimeCodexUsed: z.literal(false),
    deliveryActionUsed: z.literal(false),
    scheduledAutomationUsed: z.literal(false),
    reportArtifactCreated: z.literal(false),
    approvalCreated: z.literal(false),
    autonomousFinanceActionUsed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();

export const MonitorInvestigationSeedSchema = z
  .object({
    monitorResultId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    monitorKind: MonitorInvestigationMonitorKindSchema,
    monitorResultStatus: z.literal("alert"),
    alertSeverity: MonitorAlertSeveritySchema.exclude(["none"]),
    deterministicSeverityRationale: z.string().min(1),
    conditions: z.array(MonitorAlertConditionSchema).min(1),
    conditionSummaries: z.array(z.string().min(1)).min(1),
    sourceFreshnessPosture: MonitorSourceFreshnessPostureSchema,
    sourceLineageRefs: z.array(MonitorSourceLineageRefSchema),
    sourceLineageSummary: z.string().min(1),
    limitations: z.array(z.string().min(1)).min(1),
    proofBundlePosture: MonitorProofBundlePostureSchema,
    humanReviewNextStep: z.string().min(1),
    runtimeBoundary: MonitorInvestigationRuntimeBoundarySchema,
    sourceRef: z.string().min(1),
    monitorResultCreatedAt: z.string().datetime({ offset: true }),
    alertCardCreatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const MonitorResultSchema = z
  .object({
    id: z.string().uuid(),
    companyId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    monitorKind: MonitorKindSchema,
    runKey: z.string().min(1),
    triggeredBy: z.string().min(1),
    status: MonitorResultStatusSchema,
    severity: MonitorAlertSeveritySchema,
    conditions: z.array(MonitorAlertConditionSchema),
    sourceFreshnessPosture: MonitorSourceFreshnessPostureSchema,
    sourceLineageRefs: z.array(MonitorSourceLineageRefSchema),
    deterministicSeverityRationale: z.string().min(1),
    limitations: z.array(z.string().min(1)),
    proofBundlePosture: MonitorProofBundlePostureSchema,
    replayPosture: MonitorReplayPostureSchema,
    runtimeBoundary: MonitorRuntimeBoundarySchema,
    humanReviewNextStep: z.string().min(1),
    alertCard: MonitorAlertCardSchema.nullable(),
    createdAt: z.string().datetime({ offset: true }),
  })
  .strict()
  .superRefine((result, context) => {
    if (result.status === "no_alert") {
      if (result.severity !== "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "no_alert monitor results must use severity none",
          path: ["severity"],
        });
      }

      if (result.conditions.length > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "no_alert monitor results must not include alert conditions",
          path: ["conditions"],
        });
      }

      if (result.alertCard !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "no_alert monitor results must not include an alert card",
          path: ["alertCard"],
        });
      }
    }

    if (result.status === "alert") {
      if (result.severity === "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "alert monitor results must use a non-none severity",
          path: ["severity"],
        });
      }

      if (result.conditions.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "alert monitor results must include at least one condition",
          path: ["conditions"],
        });
      }

      if (result.alertCard === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "alert monitor results must include an alert card",
          path: ["alertCard"],
        });
      }
    }
  });

export const MonitorRunResultSchema = z
  .object({
    monitorResult: MonitorResultSchema,
    alertCard: MonitorAlertCardSchema.nullable(),
  })
  .strict();

export const MonitorLatestResultSchema = z
  .object({
    companyKey: FinanceCompanyKeySchema,
    monitorKind: MonitorKindSchema,
    monitorResult: MonitorResultSchema.nullable(),
    alertCard: MonitorAlertCardSchema.nullable(),
  })
  .strict();

export type MonitorKind = z.infer<typeof MonitorKindSchema>;
export type MonitorInvestigationMonitorKind = z.infer<
  typeof MonitorInvestigationMonitorKindSchema
>;
export type MonitorResultStatus = z.infer<typeof MonitorResultStatusSchema>;
export type MonitorAlertSeverity = z.infer<typeof MonitorAlertSeveritySchema>;
export type MonitorAlertConditionKind = z.infer<
  typeof MonitorAlertConditionKindSchema
>;
export type MonitorProofBundlePostureState = z.infer<
  typeof MonitorProofBundlePostureStateSchema
>;
export type MonitorRuntimeBoundary = z.infer<
  typeof MonitorRuntimeBoundarySchema
>;
export type MonitorSourceFreshnessPosture = z.infer<
  typeof MonitorSourceFreshnessPostureSchema
>;
export type MonitorFinanceTwinSourceLineageRef = z.infer<
  typeof MonitorFinanceTwinSourceLineageRefSchema
>;
export type MonitorPolicySourceLineageRef = z.infer<
  typeof MonitorPolicySourceLineageRefSchema
>;
export type MonitorPolicyThresholdFactLineageRef = z.infer<
  typeof MonitorPolicyThresholdFactLineageRefSchema
>;
export type MonitorComparableActualLineageRef = z.infer<
  typeof MonitorComparableActualLineageRefSchema
>;
export type MonitorSourceLineageRef = z.infer<
  typeof MonitorSourceLineageRefSchema
>;
export type MonitorAlertCondition = z.infer<typeof MonitorAlertConditionSchema>;
export type MonitorProofBundlePosture = z.infer<
  typeof MonitorProofBundlePostureSchema
>;
export type MonitorReplayPosture = z.infer<typeof MonitorReplayPostureSchema>;
export type MonitorAlertCard = z.infer<typeof MonitorAlertCardSchema>;
export type CreateMonitorInvestigationMissionInput = z.infer<
  typeof CreateMonitorInvestigationMissionInputSchema
>;
export type MonitorInvestigationRuntimeBoundary = z.infer<
  typeof MonitorInvestigationRuntimeBoundarySchema
>;
export type MonitorInvestigationSeed = z.infer<
  typeof MonitorInvestigationSeedSchema
>;
export type MonitorResult = z.infer<typeof MonitorResultSchema>;
export type MonitorRunResult = z.infer<typeof MonitorRunResultSchema>;
export type MonitorLatestResult = z.infer<typeof MonitorLatestResultSchema>;
