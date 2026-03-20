import { jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";
import { missions, missionTasks } from "./missions";

export const artifactKindEnum = pgEnum("artifact_kind", [
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

export const approvalKindEnum = pgEnum("approval_kind", [
  "command",
  "file_change",
  "merge",
  "deploy",
  "rollback",
  "network_escalation",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "declined",
  "cancelled",
  "expired",
]);

export const artifacts = pgTable("artifacts", {
  id: id(),
  missionId: uuid("mission_id")
    .references(() => missions.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id").references(() => missionTasks.id, {
    onDelete: "set null",
  }),
  kind: artifactKindEnum("kind").notNull(),
  uri: text("uri").notNull(),
  mimeType: text("mime_type"),
  sha256: text("sha256"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const approvals = pgTable("approvals", {
  id: id(),
  missionId: uuid("mission_id")
    .references(() => missions.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id").references(() => missionTasks.id, {
    onDelete: "set null",
  }),
  kind: approvalKindEnum("kind").notNull(),
  status: approvalStatusEnum("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull().default("system"),
  resolvedBy: text("resolved_by"),
  rationale: text("rationale"),
  payload: jsonb("payload").notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
