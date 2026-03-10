import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./shared";
import { missions, missionTasks } from "./missions";

export const replayEventTypeEnum = pgEnum("replay_event_type", [
  "mission.created",
  "mission.status_changed",
  "task.created",
  "task.status_changed",
  "artifact.created",
  "approval.requested",
  "approval.resolved",
  "runtime.thread_replaced",
  "runtime.thread_started",
  "runtime.turn_started",
  "runtime.turn_completed",
  "runtime.item_started",
  "runtime.item_completed",
]);

export const outboxStatusEnum = pgEnum("outbox_status", [
  "pending",
  "processing",
  "delivered",
  "failed",
]);

export const replayEvents = pgTable(
  "replay_events",
  {
    id: id(),
    missionId: uuid("mission_id")
      .references(() => missions.id, { onDelete: "cascade" })
      .notNull(),
    taskId: uuid("task_id").references(() => missionTasks.id, {
      onDelete: "set null",
    }),
    sequence: integer("sequence").notNull(),
    type: replayEventTypeEnum("type").notNull(),
    actor: text("actor").notNull().default("system"),
    occurredAt: text("occurred_at").notNull(),
    payload: jsonb("payload").notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    missionSequenceUnique: uniqueIndex("replay_events_mission_sequence_key").on(
      table.missionId,
      table.sequence,
    ),
  }),
);

export const outboxEvents = pgTable("outbox_events", {
  id: id(),
  missionId: uuid("mission_id").references(() => missions.id, {
    onDelete: "cascade",
  }),
  topic: text("topic").notNull(),
  payload: jsonb("payload").notNull().default({}),
  status: outboxStatusEnum("status").notNull().default("pending"),
  lastError: text("last_error"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
