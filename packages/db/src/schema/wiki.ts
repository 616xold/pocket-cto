import { sql } from "drizzle-orm";
import {
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
import { createdAt, id, updatedAt } from "./shared";

const cfoWikiCompileRunStatuses = ["running", "succeeded", "failed"] as const;
const cfoWikiCompileTriggerKinds = ["manual"] as const;
const cfoWikiPageKinds = [
  "index",
  "log",
  "company_overview",
  "period_index",
  "source_coverage",
] as const;
const cfoWikiPageOwnershipKinds = ["compiler_owned"] as const;
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
      .references(() => cfoWikiCompileRuns.id, { onDelete: "cascade" })
      .notNull(),
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
    companyTemporalStatusIndex: index(
      "cfo_wiki_pages_company_temporal_status_idx",
    ).on(table.companyId, table.temporalStatus),
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
