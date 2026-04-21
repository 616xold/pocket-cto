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

export const ReportReleaseApprovalReportKindSchema = z.enum(
  REPORT_RELEASE_APPROVAL_REPORT_KINDS,
);

export const REPORT_RELEASE_APPROVAL_REPORT_KIND_LABELS = {
  lender_update: "Lender update",
  diligence_packet: "Diligence packet",
} satisfies Record<
  (typeof REPORT_RELEASE_APPROVAL_REPORT_KINDS)[number],
  string
>;

export const ReportReleaseApprovalResolutionSchema = z
  .object({
    decision: ApprovalDecisionSchema,
    rationale: z.string().nullable().default(null),
    resolvedBy: z.string().min(1),
  })
  .strict();

export const ReportReleaseApprovalReleaseRecordSchema = z
  .object({
    releasedAt: z.string().datetime({ offset: true }),
    releasedBy: z.string().min(1),
    releaseChannel: z.string().min(1),
    releaseNote: z.string().nullable().default(null),
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
export type ReportReleaseApprovalResolution = z.infer<
  typeof ReportReleaseApprovalResolutionSchema
>;
export type ReportReleaseApprovalReleaseRecord = z.infer<
  typeof ReportReleaseApprovalReleaseRecordSchema
>;
export type ReportReleaseApprovalPayload = z.infer<
  typeof ReportReleaseApprovalPayloadSchema
>;
export type ApprovalRecord = z.infer<typeof ApprovalRecordSchema>;

export function isReportReleaseApprovalPayload(
  value: unknown,
): value is ReportReleaseApprovalPayload {
  return ReportReleaseApprovalPayloadSchema.safeParse(value).success;
}

export function readReportReleaseApprovalReportKindLabel(
  reportKind: ReportReleaseApprovalReportKind,
) {
  return REPORT_RELEASE_APPROVAL_REPORT_KIND_LABELS[reportKind];
}
