import { z } from "zod";

export const ApprovalKindSchema = z.enum([
  "command",
  "file_change",
  "merge",
  "deploy",
  "rollback",
  "network_escalation",
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
export type ApprovalRecord = z.infer<typeof ApprovalRecordSchema>;
