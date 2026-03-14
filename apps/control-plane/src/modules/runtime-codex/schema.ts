import { z } from "zod";

export const interruptTaskParamsSchema = z.object({
  taskId: z.string().uuid(),
});

export const interruptTaskBodySchema = z.object({
  rationale: z.string().trim().min(1).nullable().optional(),
  requestedBy: z.string().trim().min(1),
});
