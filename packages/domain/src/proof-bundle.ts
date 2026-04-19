import { z } from "zod";
import { ApprovalKindSchema, ApprovalStatusSchema } from "./approval";
import { CfoWikiPageKeySchema } from "./cfo-wiki";
import {
  DiscoveryQuestionKindSchema,
  FinancePolicySourceScopeSummarySchema,
  FinanceDiscoveryFreshnessStateSchema,
} from "./discovery-mission";
import {
  FinanceCompanyKeySchema,
} from "./finance-twin";
import {
  ReportingDraftStatusSchema,
  ReportingPublicationViewSchema,
  ReportingMissionReportKindSchema,
} from "./reporting-mission";

export const ArtifactKindSchema = z.enum([
  "plan",
  "discovery_answer",
  "finance_memo",
  "evidence_appendix",
  "board_packet",
  "lender_update",
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
  sourceDiscoveryMissionId: z.string().uuid().nullable().default(null),
  sourceReportingMissionId: z.string().uuid().nullable().default(null),
  companyKey: FinanceCompanyKeySchema.nullable().default(null),
  questionKind: DiscoveryQuestionKindSchema.nullable().default(null),
  policySourceId: z.string().uuid().nullable().default(null),
  policySourceScope: FinancePolicySourceScopeSummarySchema.nullable().default(
    null,
  ),
  answerSummary: z.string().default(""),
  reportKind: ReportingMissionReportKindSchema.nullable().default(null),
  reportDraftStatus: ReportingDraftStatusSchema.nullable().default(null),
  reportSummary: z.string().default(""),
  reportPublication: ReportingPublicationViewSchema.nullable().default(null),
  appendixPresent: z.boolean().default(false),
  freshnessState: FinanceDiscoveryFreshnessStateSchema.nullable().default(null),
  freshnessSummary: z.string().default(""),
  limitationsSummary: z.string().default(""),
  relatedRoutePaths: z.array(z.string().min(1)).default([]),
  relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
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
