import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";

export const missionTypeEnum = pgEnum("mission_type", [
  "build",
  "incident",
  "release",
  "discovery",
]);

export const missionStatusEnum = pgEnum("mission_status", [
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

export const missionSourceKindEnum = pgEnum("mission_source_kind", [
  "manual_text",
  "github_issue",
  "github_comment",
  "alert",
  "voice_note",
  "screenshot",
]);

export const missionTaskRoleEnum = pgEnum("mission_task_role", [
  "planner",
  "scout",
  "executor",
  "reviewer",
  "sre",
]);

export const missionTaskStatusEnum = pgEnum("mission_task_status", [
  "pending",
  "claimed",
  "running",
  "blocked",
  "awaiting_approval",
  "succeeded",
  "failed",
  "cancelled",
]);

export const missions = pgTable("missions", {
  id: id(),
  type: missionTypeEnum("type").notNull(),
  status: missionStatusEnum("status").notNull(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  sourceKind: missionSourceKindEnum("source_kind").notNull(),
  sourceRef: text("source_ref"),
  createdBy: text("created_by").notNull().default("operator"),
  primaryRepo: text("primary_repo"),
  replayCursor: integer("replay_cursor").notNull().default(0),
  spec: jsonb("spec").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const missionInputs = pgTable("mission_inputs", {
  id: id(),
  missionId: uuid("mission_id")
    .references(() => missions.id, { onDelete: "cascade" })
    .notNull(),
  rawText: text("raw_text").notNull(),
  compilerName: text("compiler_name").notNull(),
  compilerVersion: text("compiler_version").notNull().default("0.1.0"),
  compilerConfidence: integer("compiler_confidence").notNull().default(0),
  compilerOutput: jsonb("compiler_output"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const missionTasks = pgTable(
  "mission_tasks",
  {
    id: id(),
    missionId: uuid("mission_id")
      .references(() => missions.id, { onDelete: "cascade" })
      .notNull(),
    role: missionTaskRoleEnum("role").notNull(),
    sequence: integer("sequence").notNull(),
    status: missionTaskStatusEnum("status").notNull(),
    dependsOnTaskId: uuid("depends_on_task_id"),
    codexThreadId: text("codex_thread_id"),
    codexTurnId: text("codex_turn_id"),
    workspaceId: uuid("workspace_id"),
    summary: text("summary"),
    attemptCount: integer("attempt_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    dependsOnTaskForeignKey: foreignKey({
      columns: [table.dependsOnTaskId],
      foreignColumns: [table.id],
      name: "mission_tasks_depends_on_task_id_fkey",
    }).onDelete("set null"),
    missionSequenceUnique: uniqueIndex("mission_tasks_mission_sequence_key").on(
      table.missionId,
      table.sequence,
    ),
    codexTurnUnique: uniqueIndex("mission_tasks_codex_turn_id_key")
      .on(table.codexTurnId)
      .where(sql`${table.codexTurnId} is not null`),
    workspaceUnique: uniqueIndex("mission_tasks_workspace_id_key")
      .on(table.workspaceId)
      .where(sql`${table.workspaceId} is not null`),
  }),
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: id(),
    missionId: uuid("mission_id")
      .references(() => missions.id, { onDelete: "cascade" })
      .notNull(),
    taskId: uuid("task_id")
      .references(() => missionTasks.id, { onDelete: "cascade" })
      .notNull(),
    repo: text("repo").notNull(),
    rootPath: text("root_path").notNull(),
    branchName: text("branch_name"),
    sandboxMode: text("sandbox_mode").notNull(),
    leaseOwner: text("lease_owner"),
    leaseExpiresAt: text("lease_expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    taskUnique: uniqueIndex("workspaces_task_id_key").on(table.taskId),
    rootPathUnique: uniqueIndex("workspaces_root_path_key").on(table.rootPath),
    branchUnique: uniqueIndex("workspaces_branch_name_key")
      .on(table.branchName)
      .where(sql`${table.branchName} is not null`),
  }),
);
