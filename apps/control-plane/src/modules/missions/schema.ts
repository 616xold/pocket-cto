import { z } from "zod";
import {
  CreateDiscoveryMissionInputSchema,
  CreateMissionFromTextInputSchema,
  MissionSourceKindSchema,
  MissionStatusSchema,
} from "@pocket-cto/domain";

export const createDiscoveryMissionSchema = CreateDiscoveryMissionInputSchema;
export const createMissionFromTextSchema = CreateMissionFromTextInputSchema;

export const missionIdParamsSchema = z.object({
  missionId: z.string().uuid(),
});

export const listMissionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  sourceKind: MissionSourceKindSchema.optional(),
  status: MissionStatusSchema.optional(),
});
