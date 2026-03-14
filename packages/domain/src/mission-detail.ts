import { z } from "zod";
import { ApprovalKindSchema, ApprovalStatusSchema } from "./approval";
import { MissionRecordSchema } from "./mission";
import { MissionTaskRecordSchema } from "./mission-task";
import { ArtifactKindSchema, ProofBundleManifestSchema } from "./proof-bundle";

export const OperatorControlModeSchema = z.enum([
  "api_only",
  "embedded_worker",
  "standalone_worker",
]);

export const OperatorControlAvailabilitySchema = z.object({
  enabled: z.boolean(),
  limitation: z.literal("single_process_only"),
  mode: OperatorControlModeSchema,
});

export const MissionApprovalSummarySchema = z.object({
  id: z.string().uuid(),
  kind: ApprovalKindSchema,
  status: ApprovalStatusSchema,
  requestedBy: z.string(),
  resolvedBy: z.string().nullable(),
  rationale: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MissionArtifactSummarySchema = z.object({
  id: z.string().uuid(),
  kind: ArtifactKindSchema,
  taskId: z.string().uuid().nullable(),
  uri: z.string(),
  createdAt: z.string(),
  summary: z.string().nullable(),
});

export const MissionDetailViewSchema = z.object({
  mission: MissionRecordSchema,
  tasks: z.array(MissionTaskRecordSchema),
  proofBundle: ProofBundleManifestSchema,
  approvals: z.array(MissionApprovalSummarySchema),
  artifacts: z.array(MissionArtifactSummarySchema),
  liveControl: OperatorControlAvailabilitySchema,
});

export type OperatorControlMode = z.infer<typeof OperatorControlModeSchema>;
export type OperatorControlAvailability = z.infer<
  typeof OperatorControlAvailabilitySchema
>;
export type MissionApprovalSummary = z.infer<
  typeof MissionApprovalSummarySchema
>;
export type MissionArtifactSummary = z.infer<
  typeof MissionArtifactSummarySchema
>;
export type MissionDetailView = z.infer<typeof MissionDetailViewSchema>;
