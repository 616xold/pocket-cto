import {
  RuntimeItemCompletedPayloadSchema,
  RuntimeItemStartedPayloadSchema,
  RuntimeThreadReplacedPayloadSchema,
  RuntimeThreadStartedPayloadSchema,
  RuntimeTurnCompletedPayloadSchema,
  RuntimeTurnStartedPayloadSchema,
  type RuntimeItemCompletedPayload,
  type RuntimeItemStartedPayload,
  type RuntimeThreadReplacedPayload,
  type RuntimeThreadStartedPayload,
  type RuntimeTurnCompletedPayload,
  type RuntimeTurnStartedPayload,
} from "@pocket-cto/domain";

export function buildRuntimeThreadReplacedPayload(input: {
  missionId: string;
  newThreadId: string;
  oldThreadId: string;
  reasonCode: RuntimeThreadReplacedPayload["reasonCode"];
  taskId: string;
}): RuntimeThreadReplacedPayload {
  return RuntimeThreadReplacedPayloadSchema.parse(input);
}

export function buildRuntimeThreadStartedPayload(input: {
  cwd: string;
  model: string | null;
  modelProvider: string | null;
  serviceName: string | null;
  taskId: string;
  threadId: string;
}): RuntimeThreadStartedPayload {
  return RuntimeThreadStartedPayloadSchema.parse(input);
}

export function buildRuntimeTurnStartedPayload(input: {
  missionId: string;
  recoveryStrategy: RuntimeTurnStartedPayload["recoveryStrategy"];
  taskId: string;
  threadId: string;
  turnId: string;
}): RuntimeTurnStartedPayload {
  return RuntimeTurnStartedPayloadSchema.parse(input);
}

export function buildRuntimeTurnCompletedPayload(input: {
  missionId: string;
  status: RuntimeTurnCompletedPayload["status"];
  taskId: string;
  threadId: string;
  turnId: string;
}): RuntimeTurnCompletedPayload {
  return RuntimeTurnCompletedPayloadSchema.parse(input);
}

export function buildRuntimeItemStartedPayload(input: {
  itemId: string;
  itemType: string;
  missionId: string;
  taskId: string;
  threadId: string;
  turnId: string;
}): RuntimeItemStartedPayload {
  return RuntimeItemStartedPayloadSchema.parse(input);
}

export function buildRuntimeItemCompletedPayload(input: {
  itemId: string;
  itemType: string;
  missionId: string;
  taskId: string;
  threadId: string;
  turnId: string;
}): RuntimeItemCompletedPayload {
  return RuntimeItemCompletedPayloadSchema.parse(input);
}
