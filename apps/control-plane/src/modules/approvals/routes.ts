import type { FastifyInstance } from "fastify";
import { LiveControlUnavailableError } from "../../lib/http-errors";
import type { AppContainer } from "../../lib/types";
import { ApprovalNotFoundError } from "./errors";
import {
  approvalIdParamsSchema,
  missionApprovalsParamsSchema,
  resolveApprovalBodySchema,
} from "./schema";

export async function registerApprovalRoutes(
  app: FastifyInstance,
  deps: Pick<AppContainer, "operatorControl">,
) {
  app.get("/missions/:missionId/approvals", async (request) => {
    const { missionId } = missionApprovalsParamsSchema.parse(request.params);

    return {
      approvals: await deps.operatorControl.approvalService.listMissionApprovals(
        missionId,
      ),
      liveControl: deps.operatorControl.liveControl,
    };
  });

  app.post("/approvals/:approvalId/resolve", async (request) => {
    const { approvalId } = approvalIdParamsSchema.parse(request.params);
    const body = resolveApprovalBodySchema.parse(request.body);

    if (!deps.operatorControl.liveControl.enabled) {
      const approval = await deps.operatorControl.approvalService
        .getApprovalById(approvalId)
        .catch((error) => {
          if (error instanceof ApprovalNotFoundError) {
            return null;
          }

          throw error;
        });

      if (
        !approval ||
        (approval.kind !== "report_release" &&
          approval.kind !== "report_circulation")
      ) {
        throw new LiveControlUnavailableError();
      }
    }

    return {
      approval: await deps.operatorControl.approvalService.resolveApproval({
        approvalId,
        decision: body.decision,
        rationale: body.rationale ?? null,
        resolvedBy: body.resolvedBy,
      }),
      liveControl: deps.operatorControl.liveControl,
    };
  });
}
