import { z } from "zod";

export const MissionTaskRoleSchema = z.enum([
  "planner",
  "scout",
  "executor",
  "reviewer",
  "sre",
]);

export const MissionTaskStatusSchema = z.enum([
  "pending",
  "claimed",
  "running",
  "blocked",
  "awaiting_approval",
  "succeeded",
  "failed",
  "cancelled",
]);

export const MissionTaskRecordSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  role: MissionTaskRoleSchema,
  sequence: z.number().int().nonnegative(),
  status: MissionTaskStatusSchema,
  attemptCount: z.number().int().nonnegative(),
  codexThreadId: z.string().nullable(),
  codexTurnId: z.string().nullable(),
  workspaceId: z.string().uuid().nullable(),
  dependsOnTaskId: z.string().uuid().nullable(),
  summary: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MissionTaskRole = z.infer<typeof MissionTaskRoleSchema>;
export type MissionTaskStatus = z.infer<typeof MissionTaskStatusSchema>;
export type MissionTaskRecord = z.infer<typeof MissionTaskRecordSchema>;
