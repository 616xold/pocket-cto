import { z } from "zod";
import { DiscoveryMissionQuestionSchema } from "./discovery-mission";

export const MissionTypeSchema = z.enum([
  "build",
  "incident",
  "release",
  "discovery",
]);

export const MissionStatusSchema = z.enum([
  "draft",
  "planned",
  "queued",
  "running",
  "awaiting_approval",
  "succeeded",
  "failed",
  "cancelled",
  "paused",
]);

export const SandboxModeSchema = z.enum([
  "read-only",
  "patch-only",
  "merge-eligible",
  "deploy-eligible",
]);

export const MissionSourceKindSchema = z.enum([
  "manual_text",
  "manual_discovery",
  "github_issue",
  "github_comment",
  "alert",
  "voice_note",
  "screenshot",
]);

export const MissionSpecInputSchema = z
  .object({
    discoveryQuestion: DiscoveryMissionQuestionSchema.optional(),
  })
  .strict();

export const RiskBudgetSchema = z.object({
  sandboxMode: SandboxModeSchema,
  maxWallClockMinutes: z.number().int().positive(),
  maxCostUsd: z.number().positive(),
  allowNetwork: z.boolean().default(false),
  requiresHumanApprovalFor: z.array(z.string()).default([]),
});

export const MissionConstraintSchema = z.object({
  mustNot: z.array(z.string()).default([]),
  targetBranch: z.string().optional(),
  allowedPaths: z.array(z.string()).default([]),
});

export const MissionSpecSchema = z.object({
  type: MissionTypeSchema,
  title: z.string().min(1),
  objective: z.string().min(1),
  repos: z.array(z.string()).min(1),
  constraints: MissionConstraintSchema.default({
    mustNot: [],
    allowedPaths: [],
  }),
  acceptance: z.array(z.string()).min(1),
  riskBudget: RiskBudgetSchema,
  deliverables: z.array(z.string()).min(1),
  evidenceRequirements: z.array(z.string()).default([]),
  input: MissionSpecInputSchema.optional(),
});

export type MissionType = z.infer<typeof MissionTypeSchema>;
export type MissionStatus = z.infer<typeof MissionStatusSchema>;
export type MissionSourceKind = z.infer<typeof MissionSourceKindSchema>;
export type RiskBudget = z.infer<typeof RiskBudgetSchema>;
export type MissionSpec = z.infer<typeof MissionSpecSchema>;

export const CreateMissionFromTextInputSchema = z.object({
  primaryRepo: z.string().min(1).optional(),
  text: z.string().min(1),
  sourceKind: MissionSourceKindSchema.default("manual_text"),
  sourceRef: z.string().optional(),
  requestedBy: z.string().default("operator"),
});

export type CreateMissionFromTextInput = z.infer<
  typeof CreateMissionFromTextInputSchema
>;

export const MissionRecordSchema = z.object({
  id: z.string().uuid(),
  type: MissionTypeSchema,
  status: MissionStatusSchema,
  title: z.string(),
  objective: z.string(),
  sourceKind: MissionSourceKindSchema,
  sourceRef: z.string().nullable(),
  createdBy: z.string(),
  primaryRepo: z.string().nullable(),
  spec: MissionSpecSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MissionRecord = z.infer<typeof MissionRecordSchema>;
