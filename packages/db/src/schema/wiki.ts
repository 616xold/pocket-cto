import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { financeCompanies } from "./finance-twin";
import { sourceFiles, sourceSnapshots, sources } from "./sources";
import { createdAt, id, updatedAt } from "./shared";

const cfoWikiCompileRunStatuses = ["running", "succeeded", "failed"] as const;
const cfoWikiCompileTriggerKinds = ["manual"] as const;
const cfoWikiPageKinds = [
  "index",
  "log",
  "company_overview",
  "period_index",
  "source_coverage",
  "source_digest",
  "filed_artifact",
] as const;
const cfoWikiPageOwnershipKinds = [
  "compiler_owned",
  "filed_artifact",
] as const;
const cfoWikiLintRunStatuses = ["running", "succeeded", "failed"] as const;
const cfoWikiExportRunStatuses = ["running", "succeeded", "failed"] as const;
const cfoWikiLintFindingKinds = [
  "missing_refs",
  "uncited_numeric_claim",
  "orphan_page",
  "stale_page",
  "broken_link",
  "unsupported_document_gap",
  "duplicate_title",
] as const;
const cfoWikiDocumentRoles = [
  "general_document",
  "policy_document",
  "board_material",
  "lender_document",
] as const;
const cfoWikiDocumentExtractStatuses = [
  "extracted",
  "unsupported",
  "failed",
] as const;
const cfoWikiDocumentKinds = [
  "markdown_text",
  "plain_text",
  "pdf_text",
  "unsupported_document",
] as const;
const cfoWikiPageTemporalStatuses = [
  "current",
  "historical",
  "superseded",
] as const;
const cfoWikiLinkKinds = ["navigation", "related"] as const;
const cfoWikiRefKinds = [
  "twin_fact",
  "source_excerpt",
  "compiled_inference",
  "ambiguous",
] as const;
const cfoWikiRefTargetKinds = [
  "company",
  "reporting_period",
  "source_snapshot",
  "source_file",
  "finance_slice",
] as const;
type CfoWikiCompileRunStatus = (typeof cfoWikiCompileRunStatuses)[number];
type CfoWikiCompileTriggerKind = (typeof cfoWikiCompileTriggerKinds)[number];
type CfoWikiPageKind = (typeof cfoWikiPageKinds)[number];
type CfoWikiPageOwnershipKind = (typeof cfoWikiPageOwnershipKinds)[number];
type CfoWikiLintRunStatus = (typeof cfoWikiLintRunStatuses)[number];
type CfoWikiExportRunStatus = (typeof cfoWikiExportRunStatuses)[number];
type CfoWikiLintFindingKind = (typeof cfoWikiLintFindingKinds)[number];
type CfoWikiDocumentRole = (typeof cfoWikiDocumentRoles)[number];
type CfoWikiDocumentExtractStatus =
  (typeof cfoWikiDocumentExtractStatuses)[number];
type CfoWikiDocumentKind = (typeof cfoWikiDocumentKinds)[number];
type CfoWikiPageTemporalStatus = (typeof cfoWikiPageTemporalStatuses)[number];
type CfoWikiLinkKind = (typeof cfoWikiLinkKinds)[number];
type CfoWikiRefKind = (typeof cfoWikiRefKinds)[number];
type CfoWikiRefTargetKind = (typeof cfoWikiRefTargetKinds)[number];
type CfoWikiFreshnessState =
  | "fresh"
  | "stale"
  | "missing"
  | "mixed"
  | "failed";

type CfoWikiCompileRunStats = Record<string, unknown>;
type CfoWikiFreshnessSummary = {
  state: CfoWikiFreshnessState;
  summary: string;
};
type CfoWikiHeadingOutlineEntry = {
  depth: number;
  text: string;
};
type CfoWikiExcerptBlock = {
  heading: string | null;
  text: string;
};
type CfoWikiFiledArtifactMetadata = {
  filedAt: string;
  filedBy: string;
  provenanceKind: "manual_markdown_artifact";
  provenanceSummary: string;
};
type CfoWikiLintFindingDetails = Record<string, unknown>;
type CfoWikiExportFile = {
  path: string;
  contentType: "text/markdown" | "application/json";
  sha256: string;
  sizeBytes: number;
  body: string;
};
type CfoWikiExportManifestPage = {
  pageKey: string;
  markdownPath: string;
  pageKind: CfoWikiPageKind;
  ownershipKind: CfoWikiPageOwnershipKind;
  temporalStatus: CfoWikiPageTemporalStatus;
  title: string;
};
type CfoWikiExportManifest = {
  bundleRootPath: string;
  generatedAt: string;
  companyKey: string;
  companyDisplayName: string;
  indexPath: string;
  logPath: string;
  pageCount: number;
  fileCount: number;
  limitations: string[];
  pages: CfoWikiExportManifestPage[];
};

export const cfoWikiCompileRunStatusEnum = pgEnum(
  "cfo_wiki_compile_run_status",
  cfoWikiCompileRunStatuses,
);

export const cfoWikiCompileTriggerKindEnum = pgEnum(
  "cfo_wiki_compile_trigger_kind",
  cfoWikiCompileTriggerKinds,
);

export const cfoWikiPageKindEnum = pgEnum("cfo_wiki_page_kind", cfoWikiPageKinds);

export const cfoWikiPageOwnershipKindEnum = pgEnum(
  "cfo_wiki_page_ownership_kind",
  cfoWikiPageOwnershipKinds,
);

export const cfoWikiLintRunStatusEnum = pgEnum(
  "cfo_wiki_lint_run_status",
  cfoWikiLintRunStatuses,
);

export const cfoWikiExportRunStatusEnum = pgEnum(
  "cfo_wiki_export_run_status",
  cfoWikiExportRunStatuses,
);

export const cfoWikiLintFindingKindEnum = pgEnum(
  "cfo_wiki_lint_finding_kind",
  cfoWikiLintFindingKinds,
);

export const cfoWikiDocumentRoleEnum = pgEnum(
  "cfo_wiki_document_role",
  cfoWikiDocumentRoles,
);

export const cfoWikiDocumentExtractStatusEnum = pgEnum(
  "cfo_wiki_document_extract_status",
  cfoWikiDocumentExtractStatuses,
);

export const cfoWikiDocumentKindEnum = pgEnum(
  "cfo_wiki_document_kind",
  cfoWikiDocumentKinds,
);

export const cfoWikiPageTemporalStatusEnum = pgEnum(
  "cfo_wiki_page_temporal_status",
  cfoWikiPageTemporalStatuses,
);

export const cfoWikiLinkKindEnum = pgEnum("cfo_wiki_link_kind", cfoWikiLinkKinds);

export const cfoWikiRefKindEnum = pgEnum("cfo_wiki_ref_kind", cfoWikiRefKinds);

export const cfoWikiRefTargetKindEnum = pgEnum(
  "cfo_wiki_ref_target_kind",
  cfoWikiRefTargetKinds,
);

export const cfoWikiCompileRuns = pgTable(
  "cfo_wiki_compile_runs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    status: cfoWikiCompileRunStatusEnum("status")
      .$type<CfoWikiCompileRunStatus>()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    triggeredBy: text("triggered_by").notNull().default("operator"),
    triggerKind: cfoWikiCompileTriggerKindEnum("trigger_kind")
      .$type<CfoWikiCompileTriggerKind>()
      .notNull()
      .default("manual"),
    compilerVersion: text("compiler_version").notNull(),
    stats: jsonb("stats")
      .$type<CfoWikiCompileRunStats>()
      .notNull()
      .default({}),
    errorSummary: text("error_summary"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyStartedAtIndex: index("cfo_wiki_compile_runs_company_started_idx").on(
      table.companyId,
      table.startedAt,
    ),
    companyRunningUnique: uniqueIndex(
      "cfo_wiki_compile_runs_company_running_key",
    )
      .on(table.companyId)
      .where(sql`${table.status} = 'running'`),
  }),
);

export const cfoWikiPages = pgTable(
  "cfo_wiki_pages",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    compileRunId: uuid("compile_run_id")
      .references(() => cfoWikiCompileRuns.id, { onDelete: "set null" }),
    pageKey: text("page_key").notNull(),
    pageKind: cfoWikiPageKindEnum("page_kind").$type<CfoWikiPageKind>().notNull(),
    ownershipKind: cfoWikiPageOwnershipKindEnum("ownership_kind")
      .$type<CfoWikiPageOwnershipKind>()
      .notNull()
      .default("compiler_owned"),
    temporalStatus: cfoWikiPageTemporalStatusEnum("temporal_status")
      .$type<CfoWikiPageTemporalStatus>()
      .notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    markdownBody: text("markdown_body").notNull(),
    freshnessSummary: jsonb("freshness_summary")
      .$type<CfoWikiFreshnessSummary>()
      .notNull(),
    limitations: jsonb("limitations").$type<string[]>().notNull().default([]),
    lastCompiledAt: timestamp("last_compiled_at", { withTimezone: true }).notNull(),
    filedMetadata: jsonb("filed_metadata").$type<CfoWikiFiledArtifactMetadata>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyPageKeyUnique: uniqueIndex("cfo_wiki_pages_company_page_key_key").on(
      table.companyId,
      table.pageKey,
    ),
    companyPageKindIndex: index("cfo_wiki_pages_company_page_kind_idx").on(
      table.companyId,
      table.pageKind,
    ),
    companyOwnershipIndex: index("cfo_wiki_pages_company_ownership_idx").on(
      table.companyId,
      table.ownershipKind,
    ),
    companyTemporalStatusIndex: index(
      "cfo_wiki_pages_company_temporal_status_idx",
    ).on(table.companyId, table.temporalStatus),
  }),
);

export const cfoWikiSourceBindings = pgTable(
  "cfo_wiki_source_bindings",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    includeInCompile: boolean("include_in_compile").notNull().default(true),
    documentRole: cfoWikiDocumentRoleEnum("document_role").$type<CfoWikiDocumentRole>(),
    boundBy: text("bound_by").notNull().default("operator"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companySourceUnique: uniqueIndex(
      "cfo_wiki_source_bindings_company_source_key",
    ).on(table.companyId, table.sourceId),
    companyIncludeIndex: index(
      "cfo_wiki_source_bindings_company_include_idx",
    ).on(table.companyId, table.includeInCompile),
  }),
);

export const cfoWikiDocumentExtracts = pgTable(
  "cfo_wiki_document_extracts",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    sourceId: uuid("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    sourceSnapshotId: uuid("source_snapshot_id")
      .references(() => sourceSnapshots.id, { onDelete: "cascade" })
      .notNull(),
    sourceFileId: uuid("source_file_id").references(() => sourceFiles.id, {
      onDelete: "set null",
    }),
    extractStatus: cfoWikiDocumentExtractStatusEnum("extract_status")
      .$type<CfoWikiDocumentExtractStatus>()
      .notNull(),
    documentKind: cfoWikiDocumentKindEnum("document_kind")
      .$type<CfoWikiDocumentKind>()
      .notNull(),
    title: text("title"),
    headingOutline: jsonb("heading_outline")
      .$type<CfoWikiHeadingOutlineEntry[]>()
      .notNull()
      .default([]),
    excerptBlocks: jsonb("excerpt_blocks")
      .$type<CfoWikiExcerptBlock[]>()
      .notNull()
      .default([]),
    extractedText: text("extracted_text"),
    renderedMarkdown: text("rendered_markdown"),
    warnings: jsonb("warnings").$type<string[]>().notNull().default([]),
    errorSummary: text("error_summary"),
    parserVersion: text("parser_version").notNull(),
    inputChecksumSha256: text("input_checksum_sha256").notNull(),
    extractedAt: timestamp("extracted_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companySnapshotUnique: uniqueIndex(
      "cfo_wiki_document_extracts_company_snapshot_key",
    ).on(table.companyId, table.sourceSnapshotId),
    companySourceIndex: index("cfo_wiki_document_extracts_company_source_idx").on(
      table.companyId,
      table.sourceId,
    ),
    companyStatusIndex: index("cfo_wiki_document_extracts_company_status_idx").on(
      table.companyId,
      table.extractStatus,
    ),
  }),
);

export const cfoWikiPageLinks = pgTable(
  "cfo_wiki_page_links",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    compileRunId: uuid("compile_run_id")
      .references(() => cfoWikiCompileRuns.id, { onDelete: "cascade" })
      .notNull(),
    fromPageId: uuid("from_page_id")
      .references(() => cfoWikiPages.id, { onDelete: "cascade" })
      .notNull(),
    toPageId: uuid("to_page_id")
      .references(() => cfoWikiPages.id, { onDelete: "cascade" })
      .notNull(),
    linkKind: cfoWikiLinkKindEnum("link_kind").$type<CfoWikiLinkKind>().notNull(),
    label: text("label").notNull(),
    createdAt: createdAt(),
  },
  (table) => ({
    companyFromPageIndex: index("cfo_wiki_page_links_company_from_page_idx").on(
      table.companyId,
      table.fromPageId,
    ),
    companyToPageIndex: index("cfo_wiki_page_links_company_to_page_idx").on(
      table.companyId,
      table.toPageId,
    ),
    companyLinkUnique: uniqueIndex("cfo_wiki_page_links_company_link_key").on(
      table.companyId,
      table.fromPageId,
      table.toPageId,
      table.linkKind,
      table.label,
    ),
  }),
);

export const cfoWikiPageRefs = pgTable(
  "cfo_wiki_page_refs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    compileRunId: uuid("compile_run_id")
      .references(() => cfoWikiCompileRuns.id, { onDelete: "cascade" })
      .notNull(),
    pageId: uuid("page_id")
      .references(() => cfoWikiPages.id, { onDelete: "cascade" })
      .notNull(),
    refKind: cfoWikiRefKindEnum("ref_kind").$type<CfoWikiRefKind>().notNull(),
    targetKind: cfoWikiRefTargetKindEnum("target_kind")
      .$type<CfoWikiRefTargetKind>()
      .notNull(),
    targetId: text("target_id").notNull(),
    label: text("label").notNull(),
    locator: text("locator"),
    excerpt: text("excerpt"),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (table) => ({
    companyPageIndex: index("cfo_wiki_page_refs_company_page_idx").on(
      table.companyId,
      table.pageId,
    ),
    targetLookupIndex: index("cfo_wiki_page_refs_target_lookup_idx").on(
      table.companyId,
      table.targetKind,
      table.targetId,
    ),
  }),
);

export const cfoWikiLintRuns = pgTable(
  "cfo_wiki_lint_runs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    status: cfoWikiLintRunStatusEnum("status").$type<CfoWikiLintRunStatus>().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    triggeredBy: text("triggered_by").notNull().default("operator"),
    linterVersion: text("linter_version").notNull(),
    stats: jsonb("stats").$type<CfoWikiCompileRunStats>().notNull().default({}),
    errorSummary: text("error_summary"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyStartedAtIndex: index("cfo_wiki_lint_runs_company_started_idx").on(
      table.companyId,
      table.startedAt,
    ),
    companyRunningUnique: uniqueIndex("cfo_wiki_lint_runs_company_running_key")
      .on(table.companyId)
      .where(sql`${table.status} = 'running'`),
  }),
);

export const cfoWikiLintFindings = pgTable(
  "cfo_wiki_lint_findings",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    lintRunId: uuid("lint_run_id")
      .references(() => cfoWikiLintRuns.id, { onDelete: "cascade" })
      .notNull(),
    pageId: uuid("page_id").references(() => cfoWikiPages.id, {
      onDelete: "set null",
    }),
    pageKey: text("page_key"),
    pageTitle: text("page_title"),
    findingKind: cfoWikiLintFindingKindEnum("finding_kind")
      .$type<CfoWikiLintFindingKind>()
      .notNull(),
    message: text("message").notNull(),
    details: jsonb("details").$type<CfoWikiLintFindingDetails>().notNull().default({}),
    createdAt: createdAt(),
  },
  (table) => ({
    companyRunIndex: index("cfo_wiki_lint_findings_company_run_idx").on(
      table.companyId,
      table.lintRunId,
    ),
    companyKindIndex: index("cfo_wiki_lint_findings_company_kind_idx").on(
      table.companyId,
      table.findingKind,
    ),
    companyPageKeyIndex: index("cfo_wiki_lint_findings_company_page_key_idx").on(
      table.companyId,
      table.pageKey,
    ),
  }),
);

export const cfoWikiExportRuns = pgTable(
  "cfo_wiki_export_runs",
  {
    id: id(),
    companyId: uuid("company_id")
      .references(() => financeCompanies.id, { onDelete: "cascade" })
      .notNull(),
    status: cfoWikiExportRunStatusEnum("status")
      .$type<CfoWikiExportRunStatus>()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    triggeredBy: text("triggered_by").notNull().default("operator"),
    exporterVersion: text("exporter_version").notNull(),
    bundleRootPath: text("bundle_root_path").notNull(),
    pageCount: integer("page_count").notNull().default(0),
    fileCount: integer("file_count").notNull().default(0),
    manifest: jsonb("manifest").$type<CfoWikiExportManifest>(),
    files: jsonb("files").$type<CfoWikiExportFile[]>().notNull().default([]),
    errorSummary: text("error_summary"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    companyStartedAtIndex: index("cfo_wiki_export_runs_company_started_idx").on(
      table.companyId,
      table.startedAt,
    ),
    companyRunningUnique: uniqueIndex("cfo_wiki_export_runs_company_running_key")
      .on(table.companyId)
      .where(sql`${table.status} = 'running'`),
  }),
);
