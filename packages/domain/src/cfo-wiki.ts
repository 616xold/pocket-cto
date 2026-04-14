import { z } from "zod";
import {
  SourceChecksumSha256Schema,
  SourceFileRecordSchema,
  SourceRecordSchema,
  SourceSnapshotRecordSchema,
} from "./source-registry";

export const CfoWikiPageKindSchema = z.enum([
  "index",
  "log",
  "company_overview",
  "period_index",
  "source_coverage",
  "source_digest",
  "concept",
  "metric_definition",
  "policy",
  "filed_artifact",
]);

export const CfoWikiPageOwnershipKindSchema = z.enum([
  "compiler_owned",
  "filed_artifact",
]);

export const CfoWikiDocumentRoleSchema = z.enum([
  "general_document",
  "policy_document",
  "board_material",
  "lender_document",
]);

export const CfoWikiDocumentExtractStatusSchema = z.enum([
  "extracted",
  "unsupported",
  "failed",
]);

export const CfoWikiDocumentKindSchema = z.enum([
  "markdown_text",
  "plain_text",
  "pdf_text",
  "unsupported_document",
]);

export const CfoWikiPageTemporalStatusSchema = z.enum([
  "current",
  "historical",
  "superseded",
]);

export const CfoWikiRefKindSchema = z.enum([
  "twin_fact",
  "source_excerpt",
  "compiled_inference",
  "ambiguous",
]);

export const CfoWikiLinkKindSchema = z.enum(["navigation", "related"]);

export const CfoWikiRefTargetKindSchema = z.enum([
  "company",
  "reporting_period",
  "source_snapshot",
  "source_file",
  "finance_slice",
]);

export const CfoWikiCompileRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const CfoWikiCompileTriggerKindSchema = z.enum(["manual"]);

export const CfoWikiLintRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const CfoWikiExportRunStatusSchema = z.enum([
  "running",
  "succeeded",
  "failed",
]);

export const CfoWikiLintFindingKindSchema = z.enum([
  "missing_refs",
  "uncited_numeric_claim",
  "orphan_page",
  "stale_page",
  "broken_link",
  "unsupported_document_gap",
  "duplicate_title",
]);

export const CfoWikiFreshnessStateSchema = z.enum([
  "fresh",
  "stale",
  "missing",
  "mixed",
  "failed",
]);

export const CfoWikiPageKeySchema = z
  .string()
  .trim()
  .regex(
    /^(?:index|log|company\/overview|sources\/coverage|filed\/[a-z0-9][a-z0-9._-]*|concepts\/[a-z0-9][a-z0-9._-]*|metrics\/[a-z0-9][a-z0-9._-]*|policies\/[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}|periods\/[a-z0-9][a-z0-9._-]*\/index|sources\/[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}\/snapshots\/[1-9]\d*)$/u,
    "Expected an F3 canonical CFO Wiki page key",
  );

export const CfoWikiHeadingOutlineEntrySchema = z.object({
  depth: z.number().int().min(1).max(6),
  text: z.string().min(1),
});

export const CfoWikiExcerptBlockSchema = z.object({
  heading: z.string().min(1).nullable(),
  text: z.string().min(1),
});

export const CfoWikiCompileRunStatsSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const CfoWikiFreshnessSummarySchema = z.object({
  state: CfoWikiFreshnessStateSchema,
  summary: z.string().min(1),
});

export const CfoWikiFiledArtifactMetadataSchema = z.object({
  filedAt: z.string().datetime({ offset: true }),
  filedBy: z.string().min(1),
  provenanceKind: z.literal("manual_markdown_artifact"),
  provenanceSummary: z.string().min(1),
});

export const CfoWikiCompileRunRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  status: CfoWikiCompileRunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  triggeredBy: z.string().min(1),
  triggerKind: CfoWikiCompileTriggerKindSchema,
  compilerVersion: z.string().min(1),
  stats: CfoWikiCompileRunStatsSchema,
  errorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiSourceBindingRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  sourceId: z.string().uuid(),
  includeInCompile: z.boolean(),
  documentRole: CfoWikiDocumentRoleSchema.nullable(),
  boundBy: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiDocumentExtractRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  sourceId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  sourceFileId: z.string().uuid().nullable(),
  extractStatus: CfoWikiDocumentExtractStatusSchema,
  documentKind: CfoWikiDocumentKindSchema,
  title: z.string().min(1).nullable(),
  headingOutline: z.array(CfoWikiHeadingOutlineEntrySchema),
  excerptBlocks: z.array(CfoWikiExcerptBlockSchema),
  extractedText: z.string().nullable(),
  renderedMarkdown: z.string().nullable(),
  warnings: z.array(z.string().min(1)),
  errorSummary: z.string().nullable(),
  parserVersion: z.string().min(1),
  inputChecksumSha256: SourceChecksumSha256Schema,
  extractedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  compileRunId: z.string().uuid().nullable(),
  pageKey: CfoWikiPageKeySchema,
  pageKind: CfoWikiPageKindSchema,
  ownershipKind: CfoWikiPageOwnershipKindSchema,
  temporalStatus: CfoWikiPageTemporalStatusSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  markdownBody: z.string().min(1),
  freshnessSummary: CfoWikiFreshnessSummarySchema,
  limitations: z.array(z.string().min(1)),
  lastCompiledAt: z.string().datetime({ offset: true }),
  filedMetadata: CfoWikiFiledArtifactMetadataSchema.nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageLinkRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  compileRunId: z.string().uuid(),
  fromPageId: z.string().uuid(),
  toPageId: z.string().uuid(),
  linkKind: CfoWikiLinkKindSchema,
  label: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageRefRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  compileRunId: z.string().uuid(),
  pageId: z.string().uuid(),
  refKind: CfoWikiRefKindSchema,
  targetKind: CfoWikiRefTargetKindSchema,
  targetId: z.string().min(1),
  label: z.string().min(1),
  locator: z.string().nullable(),
  excerpt: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageInventoryEntrySchema = z.object({
  pageKey: CfoWikiPageKeySchema,
  markdownPath: z.string().min(1),
  pageKind: CfoWikiPageKindSchema,
  temporalStatus: CfoWikiPageTemporalStatusSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  freshnessSummary: CfoWikiFreshnessSummarySchema,
  limitations: z.array(z.string().min(1)),
  lastCompiledAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageLinkViewSchema = CfoWikiPageLinkRecordSchema.extend({
  toPageKey: CfoWikiPageKeySchema,
  toMarkdownPath: z.string().min(1),
  toTitle: z.string().min(1),
});

export const CfoWikiPageBacklinkViewSchema =
  CfoWikiPageLinkRecordSchema.extend({
    fromPageKey: CfoWikiPageKeySchema,
    fromMarkdownPath: z.string().min(1),
    fromTitle: z.string().min(1),
  });

export const CfoWikiPageKindCountsSchema = z.object({
  index: z.number().int().nonnegative(),
  log: z.number().int().nonnegative(),
  company_overview: z.number().int().nonnegative(),
  period_index: z.number().int().nonnegative(),
  source_coverage: z.number().int().nonnegative(),
  source_digest: z.number().int().nonnegative(),
  concept: z.number().int().nonnegative(),
  metric_definition: z.number().int().nonnegative(),
  policy: z.number().int().nonnegative(),
  filed_artifact: z.number().int().nonnegative(),
});

export const CfoWikiCompileRequestSchema = z.object({
  triggeredBy: z.string().trim().min(1).default("operator"),
});

export const CfoWikiLintRequestSchema = z.object({
  triggeredBy: z.string().trim().min(1).default("operator"),
});

export const CfoWikiExportRequestSchema = z.object({
  triggeredBy: z.string().trim().min(1).default("operator"),
});

export const CfoWikiBindSourceRequestSchema = z.object({
  boundBy: z.string().trim().min(1).default("operator"),
  includeInCompile: z.boolean().default(true),
  documentRole: CfoWikiDocumentRoleSchema.nullable().optional(),
});

export const CfoWikiCreateFiledPageRequestSchema = z.object({
  title: z.string().trim().min(1),
  markdownBody: z.string().trim().min(1),
  filedBy: z.string().trim().min(1),
  provenanceSummary: z
    .string()
    .trim()
    .min(1)
    .default("Manually filed markdown artifact."),
});

export const CfoWikiLintRunRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  status: CfoWikiLintRunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  triggeredBy: z.string().min(1),
  linterVersion: z.string().min(1),
  stats: CfoWikiCompileRunStatsSchema,
  errorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiLintFindingRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  lintRunId: z.string().uuid(),
  pageId: z.string().uuid().nullable(),
  pageKey: CfoWikiPageKeySchema.nullable(),
  pageTitle: z.string().min(1).nullable(),
  findingKind: CfoWikiLintFindingKindSchema,
  message: z.string().min(1),
  details: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime({ offset: true }),
});

export const CfoWikiLintFindingCountsSchema = z.object({
  missing_refs: z.number().int().nonnegative(),
  uncited_numeric_claim: z.number().int().nonnegative(),
  orphan_page: z.number().int().nonnegative(),
  stale_page: z.number().int().nonnegative(),
  broken_link: z.number().int().nonnegative(),
  unsupported_document_gap: z.number().int().nonnegative(),
  duplicate_title: z.number().int().nonnegative(),
});

export const CfoWikiExportFileSchema = z.object({
  path: z.string().min(1),
  contentType: z.enum(["text/markdown", "application/json"]),
  sha256: SourceChecksumSha256Schema,
  sizeBytes: z.number().int().nonnegative(),
  body: z.string(),
});

export const CfoWikiExportManifestPageSchema = z.object({
  pageKey: CfoWikiPageKeySchema,
  markdownPath: z.string().min(1),
  pageKind: CfoWikiPageKindSchema,
  ownershipKind: CfoWikiPageOwnershipKindSchema,
  temporalStatus: CfoWikiPageTemporalStatusSchema,
  title: z.string().min(1),
});

export const CfoWikiExportManifestSchema = z.object({
  bundleRootPath: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  indexPath: z.string().min(1),
  logPath: z.string().min(1),
  pageCount: z.number().int().nonnegative(),
  fileCount: z.number().int().nonnegative(),
  limitations: z.array(z.string().min(1)),
  pages: z.array(CfoWikiExportManifestPageSchema),
});

export const CfoWikiExportRunRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  status: CfoWikiExportRunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  triggeredBy: z.string().min(1),
  exporterVersion: z.string().min(1),
  bundleRootPath: z.string().min(1),
  pageCount: z.number().int().nonnegative(),
  fileCount: z.number().int().nonnegative(),
  manifest: CfoWikiExportManifestSchema.nullable(),
  files: z.array(CfoWikiExportFileSchema),
  errorSummary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CfoWikiPageDetailSchema = CfoWikiPageRecordSchema.extend({
  markdownPath: z.string().min(1),
});

export const CfoWikiPageViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  page: CfoWikiPageDetailSchema,
  links: z.array(CfoWikiPageLinkViewSchema),
  backlinks: z.array(CfoWikiPageBacklinkViewSchema),
  refs: z.array(CfoWikiPageRefRecordSchema),
  latestCompileRun: CfoWikiCompileRunRecordSchema.nullable(),
  freshnessSummary: CfoWikiFreshnessSummarySchema,
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiCompanySummarySchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  latestSuccessfulCompileRun: CfoWikiCompileRunRecordSchema.nullable(),
  pageCount: z.number().int().nonnegative(),
  pageCountsByKind: CfoWikiPageKindCountsSchema,
  pages: z.array(CfoWikiPageInventoryEntrySchema),
  freshnessSummary: CfoWikiFreshnessSummarySchema.nullable(),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiBoundSourceSummarySchema = z.object({
  binding: CfoWikiSourceBindingRecordSchema,
  source: SourceRecordSchema,
  latestSnapshot: SourceSnapshotRecordSchema.nullable(),
  latestSourceFile: SourceFileRecordSchema.nullable(),
  latestExtract: CfoWikiDocumentExtractRecordSchema.nullable(),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiSourceBindingViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  source: CfoWikiBoundSourceSummarySchema,
});

export const CfoWikiCompanySourceListViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  sourceCount: z.number().int().nonnegative(),
  sources: z.array(CfoWikiBoundSourceSummarySchema),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiCompileResultSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  compileRun: CfoWikiCompileRunRecordSchema,
  changedPageKeys: z.array(CfoWikiPageKeySchema),
  pageInventory: z.array(CfoWikiPageInventoryEntrySchema),
  pageCount: z.number().int().nonnegative(),
  pageCountsByKind: CfoWikiPageKindCountsSchema,
  freshnessSummary: CfoWikiFreshnessSummarySchema.nullable(),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiLintSummarySchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  latestLintRun: CfoWikiLintRunRecordSchema.nullable(),
  findingCount: z.number().int().nonnegative(),
  findingCountsByKind: CfoWikiLintFindingCountsSchema,
  findings: z.array(CfoWikiLintFindingRecordSchema),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiExportListViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  exportCount: z.number().int().nonnegative(),
  exports: z.array(CfoWikiExportRunRecordSchema),
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiExportDetailViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  exportRun: CfoWikiExportRunRecordSchema,
  limitations: z.array(z.string().min(1)),
});

export const CfoWikiFiledPageListViewSchema = z.object({
  companyId: z.string().uuid(),
  companyKey: z.string().min(1),
  companyDisplayName: z.string().min(1),
  pageCount: z.number().int().nonnegative(),
  pages: z.array(CfoWikiPageInventoryEntrySchema),
  limitations: z.array(z.string().min(1)),
});

export function buildCfoWikiMarkdownPath(pageKey: CfoWikiPageKey) {
  return pageKey === "index" || pageKey === "log" ? `${pageKey}.md` : `${pageKey}.md`;
}

export function buildCfoWikiSourceDigestPageKey(
  sourceId: string,
  version: number,
): CfoWikiPageKey {
  return CfoWikiPageKeySchema.parse(`sources/${sourceId}/snapshots/${version}`);
}

export function buildCfoWikiConceptPageKey(conceptKey: string): CfoWikiPageKey {
  return CfoWikiPageKeySchema.parse(`concepts/${conceptKey}`);
}

export function buildCfoWikiMetricDefinitionPageKey(
  metricKey: string,
): CfoWikiPageKey {
  return CfoWikiPageKeySchema.parse(`metrics/${metricKey}`);
}

export function buildCfoWikiPolicyPageKey(sourceId: string): CfoWikiPageKey {
  return CfoWikiPageKeySchema.parse(`policies/${sourceId}`);
}

export function buildCfoWikiFiledPageKey(slug: string): CfoWikiPageKey {
  return CfoWikiPageKeySchema.parse(`filed/${slug}`);
}

export type CfoWikiPageKind = z.infer<typeof CfoWikiPageKindSchema>;
export type CfoWikiPageOwnershipKind = z.infer<
  typeof CfoWikiPageOwnershipKindSchema
>;
export type CfoWikiDocumentRole = z.infer<typeof CfoWikiDocumentRoleSchema>;
export type CfoWikiDocumentExtractStatus = z.infer<
  typeof CfoWikiDocumentExtractStatusSchema
>;
export type CfoWikiDocumentKind = z.infer<typeof CfoWikiDocumentKindSchema>;
export type CfoWikiPageTemporalStatus = z.infer<
  typeof CfoWikiPageTemporalStatusSchema
>;
export type CfoWikiRefKind = z.infer<typeof CfoWikiRefKindSchema>;
export type CfoWikiLinkKind = z.infer<typeof CfoWikiLinkKindSchema>;
export type CfoWikiRefTargetKind = z.infer<typeof CfoWikiRefTargetKindSchema>;
export type CfoWikiCompileRunStatus = z.infer<
  typeof CfoWikiCompileRunStatusSchema
>;
export type CfoWikiCompileTriggerKind = z.infer<
  typeof CfoWikiCompileTriggerKindSchema
>;
export type CfoWikiLintRunStatus = z.infer<typeof CfoWikiLintRunStatusSchema>;
export type CfoWikiExportRunStatus = z.infer<
  typeof CfoWikiExportRunStatusSchema
>;
export type CfoWikiLintFindingKind = z.infer<
  typeof CfoWikiLintFindingKindSchema
>;
export type CfoWikiFreshnessState = z.infer<
  typeof CfoWikiFreshnessStateSchema
>;
export type CfoWikiPageKey = z.infer<typeof CfoWikiPageKeySchema>;
export type CfoWikiCompileRunStats = z.infer<
  typeof CfoWikiCompileRunStatsSchema
>;
export type CfoWikiFreshnessSummary = z.infer<
  typeof CfoWikiFreshnessSummarySchema
>;
export type CfoWikiFiledArtifactMetadata = z.infer<
  typeof CfoWikiFiledArtifactMetadataSchema
>;
export type CfoWikiCompileRunRecord = z.infer<
  typeof CfoWikiCompileRunRecordSchema
>;
export type CfoWikiSourceBindingRecord = z.infer<
  typeof CfoWikiSourceBindingRecordSchema
>;
export type CfoWikiHeadingOutlineEntry = z.infer<
  typeof CfoWikiHeadingOutlineEntrySchema
>;
export type CfoWikiExcerptBlock = z.infer<typeof CfoWikiExcerptBlockSchema>;
export type CfoWikiDocumentExtractRecord = z.infer<
  typeof CfoWikiDocumentExtractRecordSchema
>;
export type CfoWikiPageRecord = z.infer<typeof CfoWikiPageRecordSchema>;
export type CfoWikiPageLinkRecord = z.infer<typeof CfoWikiPageLinkRecordSchema>;
export type CfoWikiPageRefRecord = z.infer<typeof CfoWikiPageRefRecordSchema>;
export type CfoWikiPageInventoryEntry = z.infer<
  typeof CfoWikiPageInventoryEntrySchema
>;
export type CfoWikiPageLinkView = z.infer<typeof CfoWikiPageLinkViewSchema>;
export type CfoWikiPageBacklinkView = z.infer<
  typeof CfoWikiPageBacklinkViewSchema
>;
export type CfoWikiPageKindCounts = z.infer<
  typeof CfoWikiPageKindCountsSchema
>;
export type CfoWikiCompileRequest = z.infer<typeof CfoWikiCompileRequestSchema>;
export type CfoWikiLintRequest = z.infer<typeof CfoWikiLintRequestSchema>;
export type CfoWikiExportRequest = z.infer<typeof CfoWikiExportRequestSchema>;
export type CfoWikiBindSourceRequest = z.infer<
  typeof CfoWikiBindSourceRequestSchema
>;
export type CfoWikiCreateFiledPageRequest = z.infer<
  typeof CfoWikiCreateFiledPageRequestSchema
>;
export type CfoWikiPageDetail = z.infer<typeof CfoWikiPageDetailSchema>;
export type CfoWikiPageView = z.infer<typeof CfoWikiPageViewSchema>;
export type CfoWikiCompanySummary = z.infer<typeof CfoWikiCompanySummarySchema>;
export type CfoWikiBoundSourceSummary = z.infer<
  typeof CfoWikiBoundSourceSummarySchema
>;
export type CfoWikiSourceBindingView = z.infer<
  typeof CfoWikiSourceBindingViewSchema
>;
export type CfoWikiCompanySourceListView = z.infer<
  typeof CfoWikiCompanySourceListViewSchema
>;
export type CfoWikiCompileResult = z.infer<typeof CfoWikiCompileResultSchema>;
export type CfoWikiLintRunRecord = z.infer<typeof CfoWikiLintRunRecordSchema>;
export type CfoWikiLintFindingRecord = z.infer<
  typeof CfoWikiLintFindingRecordSchema
>;
export type CfoWikiLintFindingCounts = z.infer<
  typeof CfoWikiLintFindingCountsSchema
>;
export type CfoWikiLintSummary = z.infer<typeof CfoWikiLintSummarySchema>;
export type CfoWikiExportFile = z.infer<typeof CfoWikiExportFileSchema>;
export type CfoWikiExportManifestPage = z.infer<
  typeof CfoWikiExportManifestPageSchema
>;
export type CfoWikiExportManifest = z.infer<
  typeof CfoWikiExportManifestSchema
>;
export type CfoWikiExportRunRecord = z.infer<
  typeof CfoWikiExportRunRecordSchema
>;
export type CfoWikiExportListView = z.infer<
  typeof CfoWikiExportListViewSchema
>;
export type CfoWikiExportDetailView = z.infer<
  typeof CfoWikiExportDetailViewSchema
>;
export type CfoWikiFiledPageListView = z.infer<
  typeof CfoWikiFiledPageListViewSchema
>;
