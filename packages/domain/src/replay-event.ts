import { z } from "zod";
import { MissionStatusSchema } from "./mission";
import { MissionTaskStatusSchema } from "./mission-task";

export const ReplayEventTypeSchema = z.enum([
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

export const ReplayEventSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  sequence: z.number().int().positive(),
  type: ReplayEventTypeSchema,
  actor: z.string().default("system"),
  occurredAt: z.string(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const MissionStatusChangeReasonSchema = z.enum([
  "tasks_materialized",
  "runtime_turn_started",
]);

export const MissionStatusChangedPayloadSchema = z.object({
  from: MissionStatusSchema,
  to: MissionStatusSchema,
  reason: MissionStatusChangeReasonSchema,
});

export const TaskStatusChangeReasonSchema = z.enum([
  "worker_claimed",
  "task_completed",
  "runtime_turn_started",
  "runtime_turn_completed",
  "runtime_turn_failed",
]);

export const TaskStatusChangedPayloadSchema = z.object({
  from: MissionTaskStatusSchema,
  to: MissionTaskStatusSchema,
  reason: TaskStatusChangeReasonSchema,
});

export const RuntimeThreadStartedPayloadSchema = z.object({
  cwd: z.string(),
  threadId: z.string(),
  taskId: z.string().uuid(),
  model: z.string().nullable().default(null),
  modelProvider: z.string().nullable().default(null),
  serviceName: z.string().nullable().default(null),
});

export const RuntimeItemTypeSchema = z.string().min(1);

export const RuntimeThreadReplacementReasonSchema = z.enum([
  "resume_unavailable",
]);

export const RuntimeTurnRecoveryStrategySchema = z.enum([
  "same_session_bootstrap",
  "resumed_thread",
  "direct_turn_start",
  "replacement_thread",
]);

export const RuntimeThreadReplacedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  oldThreadId: z.string(),
  newThreadId: z.string(),
  reasonCode: RuntimeThreadReplacementReasonSchema,
});

export const RuntimeTurnTerminalStatusSchema = z.enum([
  "completed",
  "interrupted",
  "failed",
]);

export const RuntimeTurnStartedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  threadId: z.string(),
  turnId: z.string(),
  recoveryStrategy: RuntimeTurnRecoveryStrategySchema,
});

export const RuntimeTurnCompletedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  threadId: z.string(),
  turnId: z.string(),
  status: RuntimeTurnTerminalStatusSchema,
});

export const RuntimeItemStartedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  threadId: z.string(),
  turnId: z.string(),
  itemId: z.string(),
  itemType: RuntimeItemTypeSchema,
});

export const RuntimeItemCompletedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  threadId: z.string(),
  turnId: z.string(),
  itemId: z.string(),
  itemType: RuntimeItemTypeSchema,
});

export type ReplayEventType = z.infer<typeof ReplayEventTypeSchema>;
export type ReplayEvent = z.infer<typeof ReplayEventSchema>;
export type MissionStatusChangeReason = z.infer<
  typeof MissionStatusChangeReasonSchema
>;
export type MissionStatusChangedPayload = z.infer<
  typeof MissionStatusChangedPayloadSchema
>;
export type TaskStatusChangeReason = z.infer<
  typeof TaskStatusChangeReasonSchema
>;
export type TaskStatusChangedPayload = z.infer<
  typeof TaskStatusChangedPayloadSchema
>;
export type RuntimeThreadStartedPayload = z.infer<
  typeof RuntimeThreadStartedPayloadSchema
>;
export type RuntimeItemType = z.infer<typeof RuntimeItemTypeSchema>;
export type RuntimeThreadReplacementReason = z.infer<
  typeof RuntimeThreadReplacementReasonSchema
>;
export type RuntimeTurnRecoveryStrategy = z.infer<
  typeof RuntimeTurnRecoveryStrategySchema
>;
export type RuntimeThreadReplacedPayload = z.infer<
  typeof RuntimeThreadReplacedPayloadSchema
>;
export type RuntimeTurnTerminalStatus = z.infer<
  typeof RuntimeTurnTerminalStatusSchema
>;
export type RuntimeTurnStartedPayload = z.infer<
  typeof RuntimeTurnStartedPayloadSchema
>;
export type RuntimeTurnCompletedPayload = z.infer<
  typeof RuntimeTurnCompletedPayloadSchema
>;
export type RuntimeItemStartedPayload = z.infer<
  typeof RuntimeItemStartedPayloadSchema
>;
export type RuntimeItemCompletedPayload = z.infer<
  typeof RuntimeItemCompletedPayloadSchema
>;
