import type {
  ApprovalDecision,
  ApprovalKind,
  ApprovalRequestedPayload,
  ApprovalResolvedPayload,
  ApprovalStatus,
  RuntimeApprovalRequestMethod,
} from "@pocket-cto/domain";

export function buildApprovalRequestedPayload(input: {
  approvalId: string;
  details: Record<string, unknown>;
  itemId: string | null;
  kind: ApprovalKind;
  missionId: string;
  requestId: string | number;
  requestMethod: RuntimeApprovalRequestMethod;
  taskId: string;
  threadId: string;
  turnId: string;
}): ApprovalRequestedPayload {
  return {
    approvalId: input.approvalId,
    details: input.details,
    itemId: input.itemId,
    kind: input.kind,
    missionId: input.missionId,
    requestId: input.requestId,
    requestMethod: input.requestMethod,
    taskId: input.taskId,
    threadId: input.threadId,
    turnId: input.turnId,
  };
}

export function buildApprovalResolvedPayload(input: {
  approvalId: string;
  decision: ApprovalDecision;
  details: Record<string, unknown>;
  itemId: string | null;
  kind: ApprovalKind;
  missionId: string;
  rationale: string | null;
  requestId: string | number;
  requestMethod: RuntimeApprovalRequestMethod;
  resolvedBy: string | null;
  status: ApprovalStatus;
  taskId: string;
  threadId: string;
  turnId: string;
}): ApprovalResolvedPayload {
  return {
    approvalId: input.approvalId,
    decision: input.decision,
    details: input.details,
    itemId: input.itemId,
    kind: input.kind,
    missionId: input.missionId,
    rationale: input.rationale,
    requestId: input.requestId,
    requestMethod: input.requestMethod,
    resolvedBy: input.resolvedBy,
    status: input.status,
    taskId: input.taskId,
    threadId: input.threadId,
    turnId: input.turnId,
  };
}
