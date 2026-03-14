import { ApprovalDecisionSchema } from "@pocket-cto/domain";
import { z } from "zod";
import { missionIdParamsSchema } from "../missions/schema";

export const missionApprovalsParamsSchema = missionIdParamsSchema;

export const approvalIdParamsSchema = z.object({
  approvalId: z.string().uuid(),
});

export const resolveApprovalBodySchema = z.object({
  decision: ApprovalDecisionSchema,
  rationale: z.string().trim().min(1).nullable().optional(),
  resolvedBy: z.string().trim().min(1),
});
