"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  interruptMissionTask,
  resolveMissionApproval,
} from "../../../lib/api";
import {
  buildApprovalActionResult,
  buildInterruptActionResult,
  type MissionActionState,
} from "../../../lib/operator-actions";

const approvalResolutionFormSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(["accept", "decline"]),
  missionId: z.string().uuid(),
  resolvedBy: z.string().trim().min(1),
});

const taskInterruptFormSchema = z.object({
  missionId: z.string().uuid(),
  requestedBy: z.string().trim().min(1),
  taskId: z.string().uuid(),
});

export async function submitApprovalResolution(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = approvalResolutionFormSchema.parse({
    approvalId: formData.get("approvalId"),
    decision: formData.get("decision"),
    missionId: formData.get("missionId"),
    resolvedBy: formData.get("resolvedBy"),
  });

  const result = await resolveMissionApproval({
    approvalId: input.approvalId,
    decision: input.decision,
    resolvedBy: input.resolvedBy,
  });

  if (result.ok) {
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildApprovalActionResult(
    input.decision,
    input.resolvedBy,
    result,
  );
}

export async function submitTaskInterrupt(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = taskInterruptFormSchema.parse({
    missionId: formData.get("missionId"),
    requestedBy: formData.get("requestedBy"),
    taskId: formData.get("taskId"),
  });

  const result = await interruptMissionTask({
    requestedBy: input.requestedBy,
    taskId: input.taskId,
  });

  if (result.ok) {
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildInterruptActionResult(input.requestedBy, result);
}
