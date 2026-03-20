import { z } from "zod";
import {
  ApprovalDecisionSchema,
  ApprovalKindSchema,
  ApprovalStatusSchema,
  RuntimeApprovalRequestMethodSchema,
} from "./approval";
import { MissionStatusSchema } from "./mission";
import { MissionTaskStatusSchema } from "./mission-task";

export const ReplayEventTypeSchema = z.enum([
  "mission.created",
  "mission.status_changed",
  "task.created",
  "task.status_changed",
  "artifact.created",
  "proof_bundle.refreshed",
  "approval.requested",
  "approval.resolved",
  "runtime.thread_replaced",
  "runtime.thread_started",
  "runtime.turn_interrupt_requested",
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
  "approval_requested",
  "approval_resolved",
  "runtime_turn_started",
  "task_started",
  "task_terminalized",
]);

export const MissionStatusChangedPayloadSchema = z.object({
  from: MissionStatusSchema,
  to: MissionStatusSchema,
  reason: MissionStatusChangeReasonSchema,
});

export const TaskStatusChangeReasonSchema = z.enum([
  "approval_requested",
  "approval_resolved",
  "worker_claimed",
  "task_started",
  "task_completed",
  "runtime_turn_started",
  "runtime_turn_completed",
  "runtime_turn_failed",
  "runtime_turn_interrupted",
  "discovery_query_failed",
  "planner_evidence_failed",
  "executor_missing_planner_artifact",
  "executor_no_changes",
  "executor_validation_failed",
  "executor_publish_failed",
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

export const RuntimeTurnInterruptRequestedPayloadSchema = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  threadId: z.string(),
  turnId: z.string(),
  requestedBy: z.string(),
  rationale: z.string().nullable().default(null),
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

export const ApprovalRequestedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  kind: ApprovalKindSchema,
  requestId: z.union([z.string(), z.number()]),
  requestMethod: RuntimeApprovalRequestMethodSchema,
  threadId: z.string(),
  turnId: z.string(),
  itemId: z.string().nullable().default(null),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const ApprovalResolvedPayloadSchema = z.object({
  approvalId: z.string().uuid(),
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  kind: ApprovalKindSchema,
  status: ApprovalStatusSchema,
  decision: ApprovalDecisionSchema,
  requestId: z.union([z.string(), z.number()]),
  requestMethod: RuntimeApprovalRequestMethodSchema,
  threadId: z.string(),
  turnId: z.string(),
  itemId: z.string().nullable().default(null),
  resolvedBy: z.string().nullable().default(null),
  rationale: z.string().nullable().default(null),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const ProofBundleRefreshTriggerSchema = z.enum([
  "planner_evidence",
  "executor_evidence",
  "discovery_answer",
  "pull_request_link",
  "approval_resolution",
]);

export const ProofBundleRefreshedPayloadSchema = z.object({
  artifactCount: z.number().int().nonnegative(),
  missingArtifactKinds: z.array(z.string()).default([]),
  missionId: z.string().uuid(),
  status: z.enum(["placeholder", "ready", "incomplete", "failed"]),
  trigger: ProofBundleRefreshTriggerSchema,
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
export type RuntimeTurnInterruptRequestedPayload = z.infer<
  typeof RuntimeTurnInterruptRequestedPayloadSchema
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
export type ApprovalRequestedPayload = z.infer<
  typeof ApprovalRequestedPayloadSchema
>;
export type ApprovalResolvedPayload = z.infer<
  typeof ApprovalResolvedPayloadSchema
>;
export type ProofBundleRefreshTrigger = z.infer<
  typeof ProofBundleRefreshTriggerSchema
>;
export type ProofBundleRefreshedPayload = z.infer<
  typeof ProofBundleRefreshedPayloadSchema
>;
