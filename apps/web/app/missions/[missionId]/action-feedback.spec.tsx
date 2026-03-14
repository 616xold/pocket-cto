import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  buildApprovalActionResult,
  buildInterruptActionResult,
} from "../../../lib/operator-actions";
import { ActionFeedback } from "./action-feedback";

describe("ActionFeedback", () => {
  it("renders approval success feedback clearly", () => {
    const html = renderToStaticMarkup(
      <ActionFeedback
        result={buildApprovalActionResult("accept", "Alicia", {
          ok: true,
          statusCode: 200,
          data: {},
        })}
      />,
    );

    expect(html).toContain(
      "Approval accepted by Alicia. Mission detail refreshed.",
    );
  });

  it("renders interrupt success feedback clearly", () => {
    const html = renderToStaticMarkup(
      <ActionFeedback
        result={buildInterruptActionResult("Alicia", {
          ok: true,
          statusCode: 200,
          data: {},
        })}
      />,
    );

    expect(html).toContain(
      "Interrupt requested by Alicia. Mission detail refreshed.",
    );
  });

  it("renders live-control-unavailable failures clearly", () => {
    const html = renderToStaticMarkup(
      <ActionFeedback
        result={buildApprovalActionResult("accept", "Alicia", {
          ok: false,
          statusCode: 501,
          errorCode: "live_control_unavailable",
          message: "Live approval and interrupt control is unavailable in this process",
        })}
      />,
    );

    expect(html).toContain(
      "Live control is unavailable in this process. Run `pnpm dev:embedded` to enable approval resolution and task interrupts.",
    );
  });

  it("renders already-resolved conflicts clearly", () => {
    const html = renderToStaticMarkup(
      <ActionFeedback
        result={buildApprovalActionResult("accept", "Alicia", {
          ok: false,
          statusCode: 409,
          errorCode: "approval_conflict",
          message: "Approval 22222222-2222-4222-8222-222222222222 is already approved",
        })}
      />,
    );

    expect(html).toContain(
      "This approval is no longer pending. Refresh the mission detail to review the current decision trace.",
    );
  });

  it("renders missing-live-turn conflicts clearly", () => {
    const html = renderToStaticMarkup(
      <ActionFeedback
        result={buildInterruptActionResult("Alicia", {
          ok: false,
          statusCode: 409,
          errorCode: "task_conflict",
          message:
            "Task 33333333-3333-4333-8333-333333333333 has no active live turn to interrupt",
        })}
      />,
    );

    expect(html).toContain(
      "No active live turn is available for this task anymore. Refresh the mission detail to confirm the current task state.",
    );
  });
});
