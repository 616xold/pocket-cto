import { z } from "zod";

export const CfoWikiPageKindSchema = z.enum([
  "index",
  "log",
  "company_overview",
  "period_index",
  "source_coverage",
]);

export const CfoWikiPageOwnershipKindSchema = z.enum(["compiler_owned"]);

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
    /^(?:index|log|company\/overview|sources\/coverage|periods\/[a-z0-9][a-z0-9._-]*\/index)$/u,
    "Expected an F3A canonical CFO Wiki page key",
  );

export const CfoWikiCompileRunStatsSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const CfoWikiFreshnessSummarySchema = z.object({
  state: CfoWikiFreshnessStateSchema,
  summary: z.string().min(1),
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

export const CfoWikiPageRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  compileRunId: z.string().uuid(),
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

export const CfoWikiPageKindCountsSchema = z.object({
  index: z.number().int().nonnegative(),
  log: z.number().int().nonnegative(),
  company_overview: z.number().int().nonnegative(),
  period_index: z.number().int().nonnegative(),
  source_coverage: z.number().int().nonnegative(),
});

export const CfoWikiCompileRequestSchema = z.object({
  triggeredBy: z.string().trim().min(1).default("operator"),
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

export function buildCfoWikiMarkdownPath(pageKey: CfoWikiPageKey) {
  return pageKey === "index" || pageKey === "log" ? `${pageKey}.md` : `${pageKey}.md`;
}

export type CfoWikiPageKind = z.infer<typeof CfoWikiPageKindSchema>;
export type CfoWikiPageOwnershipKind = z.infer<
  typeof CfoWikiPageOwnershipKindSchema
>;
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
export type CfoWikiCompileRunRecord = z.infer<
  typeof CfoWikiCompileRunRecordSchema
>;
export type CfoWikiPageRecord = z.infer<typeof CfoWikiPageRecordSchema>;
export type CfoWikiPageLinkRecord = z.infer<typeof CfoWikiPageLinkRecordSchema>;
export type CfoWikiPageRefRecord = z.infer<typeof CfoWikiPageRefRecordSchema>;
export type CfoWikiPageInventoryEntry = z.infer<
  typeof CfoWikiPageInventoryEntrySchema
>;
export type CfoWikiPageLinkView = z.infer<typeof CfoWikiPageLinkViewSchema>;
export type CfoWikiPageKindCounts = z.infer<
  typeof CfoWikiPageKindCountsSchema
>;
export type CfoWikiCompileRequest = z.infer<typeof CfoWikiCompileRequestSchema>;
export type CfoWikiPageDetail = z.infer<typeof CfoWikiPageDetailSchema>;
export type CfoWikiPageView = z.infer<typeof CfoWikiPageViewSchema>;
export type CfoWikiCompanySummary = z.infer<typeof CfoWikiCompanySummarySchema>;
export type CfoWikiCompileResult = z.infer<typeof CfoWikiCompileResultSchema>;
