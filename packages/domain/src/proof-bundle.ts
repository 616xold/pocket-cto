import { z } from "zod";
import { ApprovalKindSchema, ApprovalStatusSchema } from "./approval";

export const ArtifactKindSchema = z.enum([
  "plan",
  "discovery_answer",
  "pr_link",
  "diff_summary",
  "test_report",
  "screenshot",
  "benchmark_report",
  "metrics_delta",
  "rollback_note",
  "approval_card",
  "proof_bundle_manifest",
  "replay_bundle",
  "log_excerpt",
]);

export const ProofBundleStatusSchema = z.enum([
  "placeholder",
  "ready",
  "incomplete",
  "failed",
]);

export const ProofBundleArtifactSummarySchema = z.object({
  id: z.string().uuid(),
  kind: ArtifactKindSchema,
});

export const ProofBundleLatestApprovalSchema = z.object({
  id: z.string().uuid(),
  kind: ApprovalKindSchema,
  status: ApprovalStatusSchema,
  requestedBy: z.string(),
  resolvedBy: z.string().nullable(),
  rationale: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProofBundleEvidenceCompletenessStatusSchema = z.enum([
  "missing",
  "partial",
  "complete",
]);

export const ProofBundleEvidenceCompletenessSchema = z.object({
  status: ProofBundleEvidenceCompletenessStatusSchema.default("missing"),
  expectedArtifactKinds: z.array(ArtifactKindSchema).default([]),
  presentArtifactKinds: z.array(ArtifactKindSchema).default([]),
  missingArtifactKinds: z.array(ArtifactKindSchema).default([]),
  notes: z.array(z.string()).default([]),
});

export const ProofBundleTimestampsSchema = z.object({
  missionCreatedAt: z.string().default(""),
  latestPlannerEvidenceAt: z.string().nullable().default(null),
  latestExecutorEvidenceAt: z.string().nullable().default(null),
  latestPullRequestAt: z.string().nullable().default(null),
  latestApprovalAt: z.string().nullable().default(null),
  latestArtifactAt: z.string().nullable().default(null),
});

export const ArtifactRecordSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  kind: ArtifactKindSchema,
  uri: z.string(),
  mimeType: z.string().nullable(),
  sha256: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
});

export const ProofBundleManifestSchema = z.object({
  missionId: z.string().uuid(),
  missionTitle: z.string().default(""),
  objective: z.string(),
  targetRepoFullName: z.string().nullable().default(null),
  branchName: z.string().nullable().default(null),
  pullRequestNumber: z.number().int().positive().nullable().default(null),
  pullRequestUrl: z.string().url().nullable().default(null),
  changeSummary: z.string().default(""),
  validationSummary: z.string().default(""),
  verificationSummary: z.string().default(""),
  riskSummary: z.string().default(""),
  rollbackSummary: z.string().default(""),
  latestApproval: ProofBundleLatestApprovalSchema.nullable().default(null),
  evidenceCompleteness: ProofBundleEvidenceCompletenessSchema.default({}),
  decisionTrace: z.array(z.string()).default([]),
  artifactIds: z.array(z.string().uuid()).default([]),
  artifacts: z.array(ProofBundleArtifactSummarySchema).default([]),
  replayEventCount: z.number().int().nonnegative().default(0),
  timestamps: ProofBundleTimestampsSchema.default({}),
  status: ProofBundleStatusSchema.default("placeholder"),
});

export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;
export type ArtifactRecord = z.infer<typeof ArtifactRecordSchema>;
export type ProofBundleStatus = z.infer<typeof ProofBundleStatusSchema>;
export type ProofBundleArtifactSummary = z.infer<
  typeof ProofBundleArtifactSummarySchema
>;
export type ProofBundleLatestApproval = z.infer<
  typeof ProofBundleLatestApprovalSchema
>;
export type ProofBundleEvidenceCompletenessStatus = z.infer<
  typeof ProofBundleEvidenceCompletenessStatusSchema
>;
export type ProofBundleEvidenceCompleteness = z.infer<
  typeof ProofBundleEvidenceCompletenessSchema
>;
export type ProofBundleTimestamps = z.infer<
  typeof ProofBundleTimestampsSchema
>;
export type ProofBundleManifest = z.infer<typeof ProofBundleManifestSchema>;
