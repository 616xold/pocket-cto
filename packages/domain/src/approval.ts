import { z } from "zod";
import { FinanceCompanyKeySchema } from "./finance-twin";

export const ApprovalKindSchema = z.enum([
  "command",
  "file_change",
  "merge",
  "deploy",
  "rollback",
  "network_escalation",
  "report_release",
  "report_circulation",
]);

export const ApprovalStatusSchema = z.enum([
  "pending",
  "approved",
  "declined",
  "cancelled",
  "expired",
]);

export const ApprovalDecisionSchema = z.enum([
  "accept",
  "accept_for_session",
  "decline",
  "cancel",
]);

export const RuntimeApprovalRequestMethodSchema = z.enum([
  "item/commandExecution/requestApproval",
  "item/fileChange/requestApproval",
  "item/permissions/requestApproval",
]);

export const REPORT_RELEASE_APPROVAL_REPORT_KINDS = [
  "lender_update",
  "diligence_packet",
] as const;
export const REPORT_CIRCULATION_APPROVAL_REPORT_KINDS = [
  "board_packet",
] as const;

export const ReportReleaseApprovalReportKindSchema = z.enum(
  REPORT_RELEASE_APPROVAL_REPORT_KINDS,
);
export const ReportCirculationApprovalReportKindSchema = z.enum(
  REPORT_CIRCULATION_APPROVAL_REPORT_KINDS,
);

export const REPORT_RELEASE_APPROVAL_REPORT_KIND_LABELS = {
  lender_update: "Lender update",
  diligence_packet: "Diligence packet",
} satisfies Record<
  (typeof REPORT_RELEASE_APPROVAL_REPORT_KINDS)[number],
  string
>;
export const REPORT_CIRCULATION_APPROVAL_REPORT_KIND_LABELS = {
  board_packet: "Board packet",
} satisfies Record<
  (typeof REPORT_CIRCULATION_APPROVAL_REPORT_KINDS)[number],
  string
>;

export const ReportReleaseApprovalResolutionSchema = z
  .object({
    decision: ApprovalDecisionSchema,
    rationale: z.string().nullable().default(null),
    resolvedBy: z.string().min(1),
  })
  .strict();
export const ReportCirculationApprovalResolutionSchema =
  ReportReleaseApprovalResolutionSchema;

export const ReportReleaseApprovalReleaseRecordSchema = z
  .object({
    releasedAt: z.string().datetime({ offset: true }),
    releasedBy: z.string().min(1),
    releaseChannel: z.string().min(1),
    releaseNote: z.string().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportCirculationApprovalCirculationRecordSchema = z
  .object({
    circulatedAt: z.string().datetime({ offset: true }),
    circulatedBy: z.string().min(1),
    circulationChannel: z.string().min(1),
    circulationNote: z.string().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportCirculationApprovalCirculationCorrectionSchema = z
  .object({
    correctionKey: z.string().min(1),
    correctedAt: z.string().datetime({ offset: true }),
    correctedBy: z.string().min(1),
    correctionReason: z.string().min(1),
    circulatedAt: z.string().datetime({ offset: true }).nullable().default(null),
    circulationChannel: z.string().min(1).nullable().default(null),
    circulationNote: z.string().min(1).nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();

export const ReportReleaseApprovalPayloadSchema = z
  .object({
    missionId: z.string().uuid(),
    reportKind: ReportReleaseApprovalReportKindSchema,
    sourceReportingMissionId: z.string().uuid(),
    sourceDiscoveryMissionId: z.string().uuid(),
    artifactId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    draftOnlyStatus: z.literal("draft_only"),
    summary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    resolution: ReportReleaseApprovalResolutionSchema.nullable().default(null),
    releaseRecord:
      ReportReleaseApprovalReleaseRecordSchema.nullable().default(null),
  })
  .strict();
export const ReportCirculationApprovalPayloadSchema = z
  .object({
    missionId: z.string().uuid(),
    reportKind: ReportCirculationApprovalReportKindSchema,
    sourceReportingMissionId: z.string().uuid(),
    sourceDiscoveryMissionId: z.string().uuid(),
    artifactId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    draftOnlyStatus: z.literal("draft_only"),
    summary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    resolution:
      ReportCirculationApprovalResolutionSchema.nullable().default(null),
    circulationRecord:
      ReportCirculationApprovalCirculationRecordSchema.nullable().default(null),
    circulationCorrections: z
      .array(ReportCirculationApprovalCirculationCorrectionSchema)
      .default([]),
  })
  .strict();

export const ApprovalRecordSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  kind: ApprovalKindSchema,
  status: ApprovalStatusSchema,
  requestedBy: z.string(),
  resolvedBy: z.string().nullable(),
  rationale: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApprovalKind = z.infer<typeof ApprovalKindSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type RuntimeApprovalRequestMethod = z.infer<
  typeof RuntimeApprovalRequestMethodSchema
>;
export type ReportReleaseApprovalReportKind = z.infer<
  typeof ReportReleaseApprovalReportKindSchema
>;
export type ReportCirculationApprovalReportKind = z.infer<
  typeof ReportCirculationApprovalReportKindSchema
>;
export type ReportReleaseApprovalResolution = z.infer<
  typeof ReportReleaseApprovalResolutionSchema
>;
export type ReportCirculationApprovalResolution = z.infer<
  typeof ReportCirculationApprovalResolutionSchema
>;
export type ReportReleaseApprovalReleaseRecord = z.infer<
  typeof ReportReleaseApprovalReleaseRecordSchema
>;
export type ReportCirculationApprovalCirculationRecord = z.infer<
  typeof ReportCirculationApprovalCirculationRecordSchema
>;
export type ReportCirculationApprovalCirculationCorrection = z.infer<
  typeof ReportCirculationApprovalCirculationCorrectionSchema
>;
export type ReportReleaseApprovalPayload = z.infer<
  typeof ReportReleaseApprovalPayloadSchema
>;
export type ReportCirculationApprovalPayload = z.infer<
  typeof ReportCirculationApprovalPayloadSchema
>;
export type ApprovalRecord = z.infer<typeof ApprovalRecordSchema>;

export function isReportReleaseApprovalPayload(
  value: unknown,
): value is ReportReleaseApprovalPayload {
  return ReportReleaseApprovalPayloadSchema.safeParse(value).success;
}

export function isReportCirculationApprovalPayload(
  value: unknown,
): value is ReportCirculationApprovalPayload {
  return ReportCirculationApprovalPayloadSchema.safeParse(value).success;
}

export function readReportReleaseApprovalReportKindLabel(
  reportKind: ReportReleaseApprovalReportKind,
) {
  return REPORT_RELEASE_APPROVAL_REPORT_KIND_LABELS[reportKind];
}

export function readReportCirculationApprovalReportKindLabel(
  reportKind: ReportCirculationApprovalReportKind,
) {
  return REPORT_CIRCULATION_APPROVAL_REPORT_KIND_LABELS[reportKind];
}
