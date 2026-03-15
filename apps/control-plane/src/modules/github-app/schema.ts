import { z } from "zod";
import { PersistedGitHubInstallationSchema } from "./types";

export const syncGitHubInstallationsBodySchema = z.object({}).passthrough();

export const listGitHubInstallationsResponseSchema = z.object({
  installations: z.array(PersistedGitHubInstallationSchema),
});

export const syncGitHubInstallationsResponseSchema = z.object({
  installations: z.array(PersistedGitHubInstallationSchema),
  syncedAt: z.string().datetime({ offset: true }),
  syncedCount: z.number().int().nonnegative(),
});
