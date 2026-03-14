import type { ApprovalDecision } from "@pocket-cto/domain";
import { z } from "zod";

export const controlPlaneActionErrorCodeSchema = z.enum([
  "approval_conflict",
  "approval_not_found",
  "internal_error",
  "invalid_request",
  "live_control_unavailable",
  "mission_not_found",
  "task_conflict",
  "task_not_found",
]);

export const controlPlaneActionErrorResponseSchema = z.object({
  error: z.object({
    code: controlPlaneActionErrorCodeSchema,
    message: z.string(),
  }),
});

export type ControlPlaneActionErrorCode = z.output<
  typeof controlPlaneActionErrorCodeSchema
>;

export type ControlPlaneMutationResult<TData> =
  | {
      ok: true;
      statusCode: number;
      data: TData;
    }
  | {
      ok: false;
      statusCode?: number;
      errorCode: ControlPlaneActionErrorCode | "request_failed";
      message: string;
    };

export type MissionActionKind = "resolve_approval" | "interrupt_task";

export type MissionActionResult =
  | {
      ok: true;
      kind: MissionActionKind;
      message: string;
      statusCode: number;
    }
  | {
      ok: false;
      kind: MissionActionKind;
      message: string;
      statusCode?: number;
      errorCode: ControlPlaneActionErrorCode | "request_failed";
    };

export type MissionActionState = MissionActionResult | null;

export const INITIAL_MISSION_ACTION_STATE: MissionActionState = null;

export function buildApprovalActionResult(
  decision: ApprovalDecision,
  operatorName: string,
  result: ControlPlaneMutationResult<unknown>,
): MissionActionResult {
  if (result.ok) {
    return {
      ok: true,
      kind: "resolve_approval",
      message: `Approval ${decision === "accept" ? "accepted" : "declined"} by ${operatorName}. Mission detail refreshed.`,
      statusCode: result.statusCode,
    };
  }

  return {
    ok: false,
    kind: "resolve_approval",
    message: describeFailure("resolve_approval", result),
    statusCode: result.statusCode,
    errorCode: result.errorCode,
  };
}

export function buildInterruptActionResult(
  operatorName: string,
  result: ControlPlaneMutationResult<unknown>,
): MissionActionResult {
  if (result.ok) {
    return {
      ok: true,
      kind: "interrupt_task",
      message: `Interrupt requested by ${operatorName}. Mission detail refreshed.`,
      statusCode: result.statusCode,
    };
  }

  return {
    ok: false,
    kind: "interrupt_task",
    message: describeFailure("interrupt_task", result),
    statusCode: result.statusCode,
    errorCode: result.errorCode,
  };
}

function describeFailure(
  kind: MissionActionKind,
  failure: Extract<ControlPlaneMutationResult<unknown>, { ok: false }>,
) {
  switch (failure.errorCode) {
    case "live_control_unavailable":
      return "Live control is unavailable in this process. Run `pnpm dev:embedded` to enable approval resolution and task interrupts.";
    case "approval_conflict":
      return withRouteReason(
        "This approval is no longer pending. Refresh the mission detail to review the current decision trace.",
        failure.message,
      );
    case "approval_not_found":
      return "This approval no longer exists in the current mission view. Refresh the page to load the latest state.";
    case "task_conflict":
      if (failure.message.toLowerCase().includes("no active live turn")) {
        return "No active live turn is available for this task anymore. Refresh the mission detail to confirm the current task state.";
      }

      return withRouteReason(
        "The active turn could not be interrupted cleanly. Refresh the mission detail and try again only if the task is still running.",
        failure.message,
      );
    case "task_not_found":
      return "This task no longer exists in the current mission view. Refresh the page to load the latest state.";
    case "mission_not_found":
      return "This mission could not be found anymore. Return to the mission list and reopen it.";
    case "invalid_request":
      return "The submitted action payload was invalid. Refresh the page and try again.";
    case "internal_error":
      return withRouteReason(
        "The control plane reported an internal error while processing this action.",
        failure.message,
      );
    case "request_failed":
      return kind === "resolve_approval"
        ? "The web app could not reach the control plane to resolve this approval. Confirm the local services are running and try again."
        : "The web app could not reach the control plane to interrupt this task. Confirm the local services are running and try again.";
  }
}

function withRouteReason(summary: string, routeMessage: string) {
  if (routeMessage.length === 0 || routeMessage === summary) {
    return summary;
  }

  return `${summary} (${routeMessage})`;
}
