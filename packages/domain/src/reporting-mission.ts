import { z } from "zod";
import { ApprovalStatusSchema } from "./approval";
import { CfoWikiExportRunStatusSchema, CfoWikiPageKeySchema } from "./cfo-wiki";
import {
  FinanceDiscoveryQuestionKindSchema,
  FinancePolicySourceScopeSummarySchema,
} from "./discovery-mission";
import { FinanceCompanyKeySchema } from "./finance-twin";

export const REPORTING_MISSION_REPORT_KINDS = [
  "finance_memo",
  "board_packet",
  "lender_update",
  "diligence_packet",
] as const;
export const REPORTING_FILED_ARTIFACT_KINDS = [
  "finance_memo",
  "evidence_appendix",
] as const;

export const ReportingMissionReportKindSchema = z.enum(
  REPORTING_MISSION_REPORT_KINDS,
);

export const ReportingDraftStatusSchema = z.enum(["draft_only"]);
export const ReportingFiledArtifactKindSchema = z.enum(
  REPORTING_FILED_ARTIFACT_KINDS,
);

export const REPORTING_MISSION_REPORT_KIND_LABELS = {
  finance_memo: "Finance memo",
  board_packet: "Board packet",
  lender_update: "Lender update",
  diligence_packet: "Diligence packet",
} satisfies Record<(typeof REPORTING_MISSION_REPORT_KINDS)[number], string>;

export const REPORTING_FILED_ARTIFACT_KIND_LABELS = {
  finance_memo: "Draft memo page",
  evidence_appendix: "Evidence appendix page",
} satisfies Record<(typeof REPORTING_FILED_ARTIFACT_KINDS)[number], string>;

export const CreateReportingMissionInputSchema = z
  .object({
    sourceDiscoveryMissionId: z.string().uuid(),
    reportKind: z.literal("finance_memo"),
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const CreateBoardPacketMissionInputSchema = z
  .object({
    sourceReportingMissionId: z.string().uuid(),
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const CreateLenderUpdateMissionInputSchema = z
  .object({
    sourceReportingMissionId: z.string().uuid(),
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const CreateDiligencePacketMissionInputSchema = z
  .object({
    sourceReportingMissionId: z.string().uuid(),
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const FileReportingMissionArtifactsInputSchema = z
  .object({
    filedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const ExportReportingMissionMarkdownInputSchema = z
  .object({
    triggeredBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const RequestReportReleaseApprovalInputSchema = z
  .object({
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();
export const RequestReportCirculationApprovalInputSchema = z
  .object({
    requestedBy: z.string().trim().min(1).default("operator"),
  })
  .strict();

export const RecordReportingReleaseLogInputSchema = z
  .object({
    releasedAt: z.string().datetime({ offset: true }).nullable().default(null),
    releasedBy: z.string().trim().min(1).default("operator"),
    releaseChannel: z.string().trim().min(1),
    releaseNote: z.string().trim().min(1).nullable().default(null),
  })
  .strict();
export const RecordReportingCirculationLogInputSchema = z
  .object({
    circulatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .default(null),
    circulatedBy: z.string().trim().min(1).default("operator"),
    circulationChannel: z.string().trim().min(1),
    circulationNote: z.string().trim().min(1).nullable().default(null),
  })
  .strict();
export const RecordReportingCirculationLogCorrectionInputSchema = z
  .object({
    correctionKey: z.string().trim().min(1),
    correctedAt: z.string().datetime({ offset: true }).nullable().default(null),
    correctedBy: z.string().trim().min(1).default("operator"),
    correctionReason: z.string().trim().min(1),
    circulatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .default(null),
    circulatedBy: z.string().trim().min(1).nullable().default(null),
    circulationChannel: z.string().trim().min(1).nullable().default(null),
    clearCirculationNote: z.boolean().default(false),
    circulationNote: z.string().trim().min(1).nullable().default(null),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.clearCirculationNote && input.circulationNote !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "A circulation correction cannot both replace and clear the effective note.",
        path: ["clearCirculationNote"],
      });
    }

    if (
      input.circulatedAt === null &&
      input.circulatedBy === null &&
      input.circulationChannel === null &&
      input.circulationNote === null &&
      input.clearCirculationNote === false
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one circulation field or actor must be corrected.",
        path: ["circulatedBy"],
      });
    }
  });

export const ReportingMissionInputSchema = z
  .object({
    sourceDiscoveryMissionId: z.string().uuid(),
    sourceReportingMissionId: z.string().uuid().nullable().default(null),
    reportKind: ReportingMissionReportKindSchema,
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (
      ["board_packet", "lender_update", "diligence_packet"].includes(
        input.reportKind,
      ) &&
      input.sourceReportingMissionId === null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["sourceReportingMissionId"],
      });
    }

    if (
      input.reportKind === "finance_memo" &&
      input.sourceReportingMissionId !== null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Finance memo reporting must start from a completed discovery mission only.",
        path: ["sourceReportingMissionId"],
      });
    }
  });

export const ReportingSourceArtifactKindSchema = z.enum([
  "discovery_answer",
  "proof_bundle_manifest",
]);

export const ReportingSourceArtifactLinkSchema = z
  .object({
    artifactId: z.string().uuid(),
    kind: ReportingSourceArtifactKindSchema,
  })
  .strict();

export const FinanceMemoArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_discovery_evidence"),
    summary: z.string().min(1),
    reportKind: z.literal("finance_memo"),
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceDiscoveryMissionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    memoSummary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    sourceArtifacts: z.array(ReportingSourceArtifactLinkSchema).default([]),
    bodyMarkdown: z.string().min(1),
  })
  .strict();

export const EvidenceAppendixArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_discovery_evidence"),
    summary: z.string().min(1),
    reportKind: z.literal("finance_memo"),
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceDiscoveryMissionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    appendixSummary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    limitations: z.array(z.string().min(1)).default([]),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    sourceArtifacts: z.array(ReportingSourceArtifactLinkSchema).min(1),
    bodyMarkdown: z.string().min(1),
  })
  .strict();

export const ReportingPacketSourceArtifactKindSchema = z.enum([
  "finance_memo",
  "evidence_appendix",
]);

export const ReportingPacketSourceArtifactLinkSchema = z
  .object({
    artifactId: z.string().uuid(),
    kind: ReportingPacketSourceArtifactKindSchema,
  })
  .strict();

export const BoardPacketSourceArtifactKindSchema =
  ReportingPacketSourceArtifactKindSchema;
export const BoardPacketSourceArtifactLinkSchema =
  ReportingPacketSourceArtifactLinkSchema;

export const BoardPacketArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_reporting_evidence"),
    summary: z.string().min(1),
    reportKind: z.literal("board_packet"),
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceReportingMissionId: z.string().uuid(),
    sourceDiscoveryMissionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    packetSummary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    sourceFinanceMemo: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("finance_memo"),
    }),
    sourceEvidenceAppendix: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("evidence_appendix"),
    }),
    bodyMarkdown: z.string().min(1),
  })
  .strict();

export const LenderUpdateArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_reporting_evidence"),
    summary: z.string().min(1),
    reportKind: z.literal("lender_update"),
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceReportingMissionId: z.string().uuid(),
    sourceDiscoveryMissionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    updateSummary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    sourceFinanceMemo: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("finance_memo"),
    }),
    sourceEvidenceAppendix: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("evidence_appendix"),
    }),
    bodyMarkdown: z.string().min(1),
  })
  .strict();

export const DiligencePacketArtifactMetadataSchema = z
  .object({
    source: z.literal("stored_reporting_evidence"),
    summary: z.string().min(1),
    reportKind: z.literal("diligence_packet"),
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceReportingMissionId: z.string().uuid(),
    sourceDiscoveryMissionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    packetSummary: z.string().min(1),
    freshnessSummary: z.string().min(1),
    limitationsSummary: z.string().min(1),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    sourceFinanceMemo: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("finance_memo"),
    }),
    sourceEvidenceAppendix: ReportingPacketSourceArtifactLinkSchema.extend({
      kind: z.literal("evidence_appendix"),
    }),
    bodyMarkdown: z.string().min(1),
  })
  .strict();

export const ReportingFiledArtifactViewSchema = z
  .object({
    artifactKind: ReportingFiledArtifactKindSchema,
    pageKey: CfoWikiPageKeySchema,
    title: z.string().min(1),
    filedAt: z.string().datetime({ offset: true }),
    filedBy: z.string().min(1),
    provenanceSummary: z.string().min(1),
  })
  .strict();

export const ReportingMarkdownExportViewSchema = z
  .object({
    exportRunId: z.string().uuid(),
    status: CfoWikiExportRunStatusSchema,
    completedAt: z.string().datetime({ offset: true }).nullable(),
    includesLatestFiledArtifacts: z.boolean().default(false),
  })
  .strict();

export const ReportingPublicationViewSchema = z
  .object({
    storedDraft: z.boolean().default(false),
    filedMemo: ReportingFiledArtifactViewSchema.nullable().default(null),
    filedEvidenceAppendix:
      ReportingFiledArtifactViewSchema.nullable().default(null),
    latestMarkdownExport:
      ReportingMarkdownExportViewSchema.nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();

export const ReportingReleaseApprovalStatusSchema = z.enum([
  "not_requested",
  "pending_review",
  "approved_for_release",
  "not_approved_for_release",
]);
export const ReportingCirculationApprovalStatusSchema = z.enum([
  "not_requested",
  "pending_review",
  "approved_for_circulation",
  "not_approved_for_circulation",
]);

export const ReportingReleaseReadinessViewSchema = z
  .object({
    releaseApprovalStatus:
      ReportingReleaseApprovalStatusSchema.default("not_requested"),
    releaseReady: z.boolean().default(false),
    approvalId: z.string().uuid().nullable().default(null),
    approvalStatus: ApprovalStatusSchema.nullable().default(null),
    requestedAt: z.string().nullable().default(null),
    requestedBy: z.string().nullable().default(null),
    resolvedAt: z.string().nullable().default(null),
    resolvedBy: z.string().nullable().default(null),
    rationale: z.string().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportingCirculationReadinessViewSchema = z
  .object({
    circulationApprovalStatus:
      ReportingCirculationApprovalStatusSchema.default("not_requested"),
    circulationReady: z.boolean().default(false),
    approvalId: z.string().uuid().nullable().default(null),
    approvalStatus: ApprovalStatusSchema.nullable().default(null),
    requestedAt: z.string().nullable().default(null),
    requestedBy: z.string().nullable().default(null),
    resolvedAt: z.string().nullable().default(null),
    resolvedBy: z.string().nullable().default(null),
    rationale: z.string().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();

export const ReportingReleaseRecordViewSchema = z
  .object({
    released: z.boolean().default(false),
    releasedAt: z.string().datetime({ offset: true }).nullable().default(null),
    releasedBy: z.string().nullable().default(null),
    releaseChannel: z.string().nullable().default(null),
    releaseNote: z.string().nullable().default(null),
    approvalId: z.string().uuid().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportingCirculationRecordViewSchema = z
  .object({
    circulated: z.boolean().default(false),
    circulatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .default(null),
    circulatedBy: z.string().nullable().default(null),
    circulationChannel: z.string().nullable().default(null),
    circulationNote: z.string().nullable().default(null),
    approvalId: z.string().uuid().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportingCirculationEffectiveRecordSourceSchema = z.enum([
  "original_record",
  "latest_correction",
]);
export const ReportingCirculationEffectiveRecordViewSchema = z
  .object({
    source:
      ReportingCirculationEffectiveRecordSourceSchema.default(
        "original_record",
      ),
    circulated: z.boolean().default(false),
    circulatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .default(null),
    circulatedBy: z.string().nullable().default(null),
    circulationChannel: z.string().nullable().default(null),
    circulationNote: z.string().nullable().default(null),
    approvalId: z.string().uuid().nullable().default(null),
    summary: z.string().min(1),
  })
  .strict();
export const ReportingCirculationCorrectionViewSchema = z
  .object({
    correctionKey: z.string().min(1),
    correctedAt: z.string().datetime({ offset: true }),
    correctedBy: z.string().min(1),
    correctionReason: z.string().min(1),
    circulatedAt: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .default(null),
    circulatedBy: z.string().nullable().default(null),
    circulationChannel: z.string().nullable().default(null),
    circulationNote: z.string().nullable().default(null),
    effectiveRecord: ReportingCirculationEffectiveRecordViewSchema,
    summary: z.string().min(1),
  })
  .strict();
export const ReportingCirculationChronologyViewSchema = z
  .object({
    hasCorrections: z.boolean().default(false),
    correctionCount: z.number().int().nonnegative().default(0),
    latestCorrectionSummary: z.string().nullable().default(null),
    latestCorrection:
      ReportingCirculationCorrectionViewSchema.nullable().default(null),
    effectiveRecord:
      ReportingCirculationEffectiveRecordViewSchema.nullable().default(null),
    corrections: z.array(ReportingCirculationCorrectionViewSchema).default([]),
    summary: z.string().min(1),
  })
  .strict();

export const ReportingMissionViewSchema = z
  .object({
    reportKind: ReportingMissionReportKindSchema,
    draftStatus: ReportingDraftStatusSchema.default("draft_only"),
    sourceDiscoveryMissionId: z.string().uuid(),
    sourceReportingMissionId: z.string().uuid().nullable().default(null),
    companyKey: FinanceCompanyKeySchema.nullable().default(null),
    questionKind: FinanceDiscoveryQuestionKindSchema.nullable().default(null),
    policySourceId: z.string().uuid().nullable().default(null),
    policySourceScope:
      FinancePolicySourceScopeSummarySchema.nullable().default(null),
    reportSummary: z.string().nullable().default(null),
    freshnessSummary: z.string().nullable().default(null),
    limitationsSummary: z.string().nullable().default(null),
    relatedRoutePaths: z.array(z.string().min(1)).default([]),
    relatedWikiPageKeys: z.array(CfoWikiPageKeySchema).default([]),
    appendixPresent: z.boolean().default(false),
    financeMemo: FinanceMemoArtifactMetadataSchema.nullable().default(null),
    evidenceAppendix:
      EvidenceAppendixArtifactMetadataSchema.nullable().default(null),
    boardPacket: BoardPacketArtifactMetadataSchema.nullable().default(null),
    lenderUpdate: LenderUpdateArtifactMetadataSchema.nullable().default(null),
    diligencePacket:
      DiligencePacketArtifactMetadataSchema.nullable().default(null),
    publication: ReportingPublicationViewSchema.nullable().default(null),
    circulationReadiness:
      ReportingCirculationReadinessViewSchema.nullable().default(null),
    circulationRecord:
      ReportingCirculationRecordViewSchema.nullable().default(null),
    circulationChronology:
      ReportingCirculationChronologyViewSchema.nullable().default(null),
    releaseRecord: ReportingReleaseRecordViewSchema.nullable().default(null),
    releaseReadiness:
      ReportingReleaseReadinessViewSchema.nullable().default(null),
  })
  .strict();

export const ReportingFiledArtifactsResultSchema = z
  .object({
    missionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    publication: ReportingPublicationViewSchema,
  })
  .strict();

export const ReportingMarkdownExportResultSchema = z
  .object({
    missionId: z.string().uuid(),
    companyKey: FinanceCompanyKeySchema,
    publication: ReportingPublicationViewSchema,
  })
  .strict();

export const RequestReportReleaseApprovalResultSchema = z
  .object({
    missionId: z.string().uuid(),
    approvalId: z.string().uuid(),
    created: z.boolean(),
    approvalStatus: ApprovalStatusSchema,
    releaseApprovalStatus: ReportingReleaseApprovalStatusSchema,
    releaseReady: z.boolean(),
  })
  .strict();
export const RequestReportCirculationApprovalResultSchema = z
  .object({
    missionId: z.string().uuid(),
    approvalId: z.string().uuid(),
    created: z.boolean(),
    approvalStatus: ApprovalStatusSchema,
    circulationApprovalStatus: ReportingCirculationApprovalStatusSchema,
    circulationReady: z.boolean(),
  })
  .strict();

export const RecordReportingReleaseLogResultSchema = z
  .object({
    missionId: z.string().uuid(),
    approvalId: z.string().uuid(),
    created: z.boolean(),
    releaseRecord: ReportingReleaseRecordViewSchema,
  })
  .strict();
export const RecordReportingCirculationLogResultSchema = z
  .object({
    missionId: z.string().uuid(),
    approvalId: z.string().uuid(),
    created: z.boolean(),
    circulationRecord: ReportingCirculationRecordViewSchema,
  })
  .strict();
export const RecordReportingCirculationLogCorrectionResultSchema = z
  .object({
    missionId: z.string().uuid(),
    approvalId: z.string().uuid(),
    created: z.boolean(),
    circulationRecord: ReportingCirculationRecordViewSchema,
    circulationChronology: ReportingCirculationChronologyViewSchema,
  })
  .strict();

export type ReportingMissionReportKind = z.infer<
  typeof ReportingMissionReportKindSchema
>;
export type ReportingDraftStatus = z.infer<typeof ReportingDraftStatusSchema>;
export type ReportingFiledArtifactKind = z.infer<
  typeof ReportingFiledArtifactKindSchema
>;
export type CreateReportingMissionInput = z.infer<
  typeof CreateReportingMissionInputSchema
>;
export type CreateBoardPacketMissionInput = z.infer<
  typeof CreateBoardPacketMissionInputSchema
>;
export type CreateLenderUpdateMissionInput = z.infer<
  typeof CreateLenderUpdateMissionInputSchema
>;
export type CreateDiligencePacketMissionInput = z.infer<
  typeof CreateDiligencePacketMissionInputSchema
>;
export type FileReportingMissionArtifactsInput = z.infer<
  typeof FileReportingMissionArtifactsInputSchema
>;
export type ExportReportingMissionMarkdownInput = z.infer<
  typeof ExportReportingMissionMarkdownInputSchema
>;
export type RequestReportReleaseApprovalInput = z.infer<
  typeof RequestReportReleaseApprovalInputSchema
>;
export type RequestReportCirculationApprovalInput = z.infer<
  typeof RequestReportCirculationApprovalInputSchema
>;
export type RecordReportingCirculationLogInput = z.infer<
  typeof RecordReportingCirculationLogInputSchema
>;
export type RecordReportingCirculationLogCorrectionInput = z.input<
  typeof RecordReportingCirculationLogCorrectionInputSchema
>;
export type RecordReportingReleaseLogInput = z.infer<
  typeof RecordReportingReleaseLogInputSchema
>;
export type ReportingMissionInput = z.infer<typeof ReportingMissionInputSchema>;
export type ReportingSourceArtifactKind = z.infer<
  typeof ReportingSourceArtifactKindSchema
>;
export type ReportingSourceArtifactLink = z.infer<
  typeof ReportingSourceArtifactLinkSchema
>;
export type FinanceMemoArtifactMetadata = z.infer<
  typeof FinanceMemoArtifactMetadataSchema
>;
export type EvidenceAppendixArtifactMetadata = z.infer<
  typeof EvidenceAppendixArtifactMetadataSchema
>;
export type BoardPacketSourceArtifactKind = z.infer<
  typeof BoardPacketSourceArtifactKindSchema
>;
export type BoardPacketSourceArtifactLink = z.infer<
  typeof BoardPacketSourceArtifactLinkSchema
>;
export type ReportingPacketSourceArtifactKind = z.infer<
  typeof ReportingPacketSourceArtifactKindSchema
>;
export type ReportingPacketSourceArtifactLink = z.infer<
  typeof ReportingPacketSourceArtifactLinkSchema
>;
export type BoardPacketArtifactMetadata = z.infer<
  typeof BoardPacketArtifactMetadataSchema
>;
export type LenderUpdateArtifactMetadata = z.infer<
  typeof LenderUpdateArtifactMetadataSchema
>;
export type DiligencePacketArtifactMetadata = z.infer<
  typeof DiligencePacketArtifactMetadataSchema
>;
export type ReportingFiledArtifactView = z.infer<
  typeof ReportingFiledArtifactViewSchema
>;
export type ReportingMarkdownExportView = z.infer<
  typeof ReportingMarkdownExportViewSchema
>;
export type ReportingPublicationView = z.infer<
  typeof ReportingPublicationViewSchema
>;
export type ReportingReleaseApprovalStatus = z.infer<
  typeof ReportingReleaseApprovalStatusSchema
>;
export type ReportingCirculationApprovalStatus = z.infer<
  typeof ReportingCirculationApprovalStatusSchema
>;
export type ReportingReleaseReadinessView = z.infer<
  typeof ReportingReleaseReadinessViewSchema
>;
export type ReportingCirculationReadinessView = z.infer<
  typeof ReportingCirculationReadinessViewSchema
>;
export type ReportingCirculationRecordView = z.infer<
  typeof ReportingCirculationRecordViewSchema
>;
export type ReportingCirculationEffectiveRecordSource = z.infer<
  typeof ReportingCirculationEffectiveRecordSourceSchema
>;
export type ReportingCirculationEffectiveRecordView = z.infer<
  typeof ReportingCirculationEffectiveRecordViewSchema
>;
export type ReportingCirculationCorrectionView = z.infer<
  typeof ReportingCirculationCorrectionViewSchema
>;
export type ReportingCirculationChronologyView = z.infer<
  typeof ReportingCirculationChronologyViewSchema
>;
export type ReportingReleaseRecordView = z.infer<
  typeof ReportingReleaseRecordViewSchema
>;
export type ReportingMissionView = z.infer<typeof ReportingMissionViewSchema>;
export type ReportingFiledArtifactsResult = z.infer<
  typeof ReportingFiledArtifactsResultSchema
>;
export type ReportingMarkdownExportResult = z.infer<
  typeof ReportingMarkdownExportResultSchema
>;
export type RequestReportReleaseApprovalResult = z.infer<
  typeof RequestReportReleaseApprovalResultSchema
>;
export type RequestReportCirculationApprovalResult = z.infer<
  typeof RequestReportCirculationApprovalResultSchema
>;
export type RecordReportingCirculationLogResult = z.infer<
  typeof RecordReportingCirculationLogResultSchema
>;
export type RecordReportingCirculationLogCorrectionResult = z.infer<
  typeof RecordReportingCirculationLogCorrectionResultSchema
>;
export type RecordReportingReleaseLogResult = z.infer<
  typeof RecordReportingReleaseLogResultSchema
>;

export function isFinanceMemoArtifactMetadata(
  value: unknown,
): value is FinanceMemoArtifactMetadata {
  return FinanceMemoArtifactMetadataSchema.safeParse(value).success;
}

export function isEvidenceAppendixArtifactMetadata(
  value: unknown,
): value is EvidenceAppendixArtifactMetadata {
  return EvidenceAppendixArtifactMetadataSchema.safeParse(value).success;
}

export function isBoardPacketArtifactMetadata(
  value: unknown,
): value is BoardPacketArtifactMetadata {
  return BoardPacketArtifactMetadataSchema.safeParse(value).success;
}

export function isLenderUpdateArtifactMetadata(
  value: unknown,
): value is LenderUpdateArtifactMetadata {
  return LenderUpdateArtifactMetadataSchema.safeParse(value).success;
}

export function isDiligencePacketArtifactMetadata(
  value: unknown,
): value is DiligencePacketArtifactMetadata {
  return DiligencePacketArtifactMetadataSchema.safeParse(value).success;
}

export function readReportingMissionReportKindLabel(
  reportKind: ReportingMissionReportKind,
) {
  return REPORTING_MISSION_REPORT_KIND_LABELS[reportKind];
}

export function readReportingFiledArtifactKindLabel(
  artifactKind: ReportingFiledArtifactKind,
) {
  return REPORTING_FILED_ARTIFACT_KIND_LABELS[artifactKind];
}
