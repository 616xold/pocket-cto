import type { JsonRpcId } from "@pocket-cto/codex-runtime";
import type {
  ApprovalRecord,
  ReportCirculationApprovalPayload,
  ReportReleaseApprovalPayload,
  RuntimeApprovalRequestMethod,
} from "@pocket-cto/domain";
import {
  ReportCirculationApprovalPayloadSchema,
  ReportReleaseApprovalPayloadSchema,
} from "@pocket-cto/domain";

export type RuntimeApprovalPayload = {
  details: Record<string, unknown>;
  itemId: string | null;
  requestId: JsonRpcId;
  requestMethod: RuntimeApprovalRequestMethod;
  taskId: string;
  threadId: string;
  turnId: string;
};

export function readRuntimeApprovalPayload(
  approval: ApprovalRecord,
): RuntimeApprovalPayload {
  const requestId = approval.payload.requestId;
  const requestMethod = approval.payload.requestMethod;
  const threadId = approval.payload.threadId;
  const turnId = approval.payload.turnId;

  if (
    (typeof requestId !== "string" && typeof requestId !== "number") ||
    (requestMethod !== "item/commandExecution/requestApproval" &&
      requestMethod !== "item/fileChange/requestApproval" &&
      requestMethod !== "item/permissions/requestApproval") ||
    typeof threadId !== "string" ||
    typeof turnId !== "string" ||
    !approval.taskId
  ) {
    throw new Error(`Approval ${approval.id} does not contain a valid runtime payload`);
  }

  return {
    details:
      approval.payload.details &&
      typeof approval.payload.details === "object" &&
      !Array.isArray(approval.payload.details)
        ? (approval.payload.details as Record<string, unknown>)
        : {},
    itemId:
      typeof approval.payload.itemId === "string"
        ? approval.payload.itemId
        : null,
    requestId,
    requestMethod,
    taskId: approval.taskId,
    threadId,
    turnId,
  };
}

export function withApprovalContinuationFailurePayload(
  approval: ApprovalRecord,
  input: {
    attemptedAt: string;
    errorMessage: string;
  },
) {
  return {
    ...approval.payload,
    liveContinuation: {
      attemptedAt: input.attemptedAt,
      errorMessage: input.errorMessage,
      status: "delivery_failed",
    },
  };
}

export function readReportReleaseApprovalPayload(
  approval: ApprovalRecord,
): ReportReleaseApprovalPayload {
  try {
    return ReportReleaseApprovalPayloadSchema.parse(approval.payload);
  } catch {
    throw new Error(
      `Approval ${approval.id} does not contain a valid report-release payload`,
    );
  }
}

export function readReportCirculationApprovalPayload(
  approval: ApprovalRecord,
): ReportCirculationApprovalPayload {
  try {
    return ReportCirculationApprovalPayloadSchema.parse(approval.payload);
  } catch {
    throw new Error(
      `Approval ${approval.id} does not contain a valid report-circulation payload`,
    );
  }
}
