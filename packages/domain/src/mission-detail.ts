import { z } from "zod";
import { ApprovalKindSchema, ApprovalStatusSchema } from "./approval";
import { DiscoveryAnswerArtifactMetadataSchema } from "./discovery-mission";
import { MissionRecordSchema } from "./mission";
import { MissionTaskRecordSchema, MissionTaskRoleSchema } from "./mission-task";
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

export const MissionApprovalCardTaskSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  role: MissionTaskRoleSchema,
  sequence: z.number().int().nonnegative(),
});

export const MissionApprovalCardRepoContextSchema = z.object({
  repoLabel: z.string().min(1),
  branchName: z.string().nullable(),
  pullRequestNumber: z.number().int().positive().nullable(),
  pullRequestUrl: z.string().url().nullable(),
});

export const MissionApprovalCardSchema = z.object({
  actionHint: z.string().nullable(),
  approvalId: z.string().uuid(),
  kind: ApprovalKindSchema,
  requestedAt: z.string(),
  requestedBy: z.string(),
  repoContext: MissionApprovalCardRepoContextSchema.nullable(),
  resolutionSummary: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  status: ApprovalStatusSchema,
  summary: z.string().min(1),
  task: MissionApprovalCardTaskSchema.nullable(),
  title: z.string().min(1),
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
  discoveryAnswer: DiscoveryAnswerArtifactMetadataSchema.nullable().default(null),
  approvals: z.array(MissionApprovalSummarySchema),
  approvalCards: z.array(MissionApprovalCardSchema),
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
export type MissionApprovalCardTask = z.infer<
  typeof MissionApprovalCardTaskSchema
>;
export type MissionApprovalCardRepoContext = z.infer<
  typeof MissionApprovalCardRepoContextSchema
>;
export type MissionApprovalCard = z.infer<typeof MissionApprovalCardSchema>;
export type MissionArtifactSummary = z.infer<
  typeof MissionArtifactSummarySchema
>;
export type MissionDetailView = z.infer<typeof MissionDetailViewSchema>;
