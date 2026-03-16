import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";

export const twinEntityTypeEnum = pgEnum("twin_entity_type", [
  "repository",
  "service",
  "package",
  "owner",
  "testSuite",
  "ciJob",
  "runbook",
  "dashboard",
  "flag",
  "doc",
]);

export const twinFreshnessStatusEnum = pgEnum("twin_freshness_status", [
  "fresh",
  "stale",
  "unknown",
]);

export const twinSyncRunStatusEnum = pgEnum("twin_sync_run_status", [
  "running",
  "succeeded",
  "failed",
]);

export const twinSyncRuns = pgTable("twin_sync_runs", {
  id: id(),
  repoFullName: text("repo_full_name").notNull(),
  extractor: text("extractor").notNull(),
  status: twinSyncRunStatusEnum("status").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  stats: jsonb("stats").notNull().default({}),
  errorSummary: text("error_summary"),
  createdAt: createdAt(),
});

export const twinEntities = pgTable("twin_entities", {
  id: id(),
  type: twinEntityTypeEnum("type").notNull(),
  key: text("key").notNull(),
  title: text("title").notNull(),
  repo: text("repo"),
  freshnessStatus: twinFreshnessStatusEnum("freshness_status")
    .notNull()
    .default("unknown"),
  lastObservedAt: text("last_observed_at"),
  metadata: jsonb("metadata").notNull().default({}),
  repoFullName: text("repo_full_name").notNull(),
  kind: text("kind").notNull(),
  stableKey: text("stable_key").notNull(),
  summary: text("summary"),
  payload: jsonb("payload").notNull().default({}),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  staleAfter: timestamp("stale_after", { withTimezone: true }),
  sourceRunId: uuid("source_run_id").references(() => twinSyncRuns.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => ({
  repoKindStableKeyUnique: uniqueIndex(
    "twin_entities_repo_full_name_kind_stable_key_key",
  ).on(table.repoFullName, table.kind, table.stableKey),
}));

export const twinEdges = pgTable("twin_edges", {
  id: id(),
  fromEntityId: uuid("from_entity_id")
    .references(() => twinEntities.id, { onDelete: "cascade" })
    .notNull(),
  toEntityId: uuid("to_entity_id")
    .references(() => twinEntities.id, { onDelete: "cascade" })
    .notNull(),
  relationType: text("relation_type").notNull(),
  sourceRef: text("source_ref"),
  weight: integer("weight").notNull().default(1),
  repoFullName: text("repo_full_name").notNull(),
  kind: text("kind").notNull(),
  payload: jsonb("payload").notNull().default({}),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  sourceRunId: uuid("source_run_id").references(() => twinSyncRuns.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => ({
  repoKindEndpointsUnique: uniqueIndex(
    "twin_edges_repo_full_name_kind_from_to_key",
  ).on(table.repoFullName, table.kind, table.fromEntityId, table.toEntityId),
}));
