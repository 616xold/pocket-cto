import { z } from "zod";
import { PersistedGitHubInstallationSchema } from "./types";

export const GitHubInstallationParamsSchema = z.object({
  installationId: z.string().min(1),
});

export const GitHubRepositoryParamsSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export const syncGitHubInstallationsBodySchema = z.object({}).passthrough();
export const syncGitHubRepositoriesBodySchema = z.object({}).passthrough();

export const GitHubRepositorySummarySchema = z.object({
  id: z.string().uuid(),
  installationId: z.string().min(1),
  githubRepositoryId: z.string().min(1),
  fullName: z.string().min(1),
  ownerLogin: z.string().min(1),
  name: z.string().min(1),
  defaultBranch: z.string().min(1),
  visibility: z.enum(["private", "public"]).nullable(),
  archived: z.boolean().nullable(),
  disabled: z.boolean().nullable(),
  isActive: z.boolean(),
  language: z.string().nullable(),
  lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
  removedFromInstallationAt: z.string().datetime({ offset: true }).nullable(),
  updatedAt: z.string().datetime({ offset: true }),
});

export const GitHubRepositoryWriteReadinessFailureCodeSchema = z.enum([
  "inactive",
  "archived",
  "disabled",
  "installation_unavailable",
]);

export const GitHubRepositoryWriteReadinessSchema = z.object({
  ready: z.boolean(),
  failureCode: GitHubRepositoryWriteReadinessFailureCodeSchema.nullable(),
});

export const listGitHubInstallationsResponseSchema = z.object({
  installations: z.array(PersistedGitHubInstallationSchema),
});

export const syncGitHubInstallationsResponseSchema = z.object({
  installations: z.array(PersistedGitHubInstallationSchema),
  syncedAt: z.string().datetime({ offset: true }),
  syncedCount: z.number().int().nonnegative(),
});

export const listGitHubRepositoriesResponseSchema = z.object({
  repositories: z.array(GitHubRepositorySummarySchema),
});

export const getGitHubRepositoryResponseSchema = z.object({
  repository: GitHubRepositorySummarySchema,
  writeReadiness: GitHubRepositoryWriteReadinessSchema,
});

export const listGitHubInstallationRepositoriesResponseSchema = z.object({
  installation: PersistedGitHubInstallationSchema,
  repositories: z.array(GitHubRepositorySummarySchema),
});

export const syncGitHubInstallationRepositoriesResponseSchema = z.object({
  installation: PersistedGitHubInstallationSchema,
  syncedAt: z.string().datetime({ offset: true }),
  syncedRepositoryCount: z.number().int().nonnegative(),
  activeRepositoryCount: z.number().int().nonnegative(),
  inactiveRepositoryCount: z.number().int().nonnegative(),
});

export const syncGitHubRepositoriesResponseSchema = z.object({
  installations: z.array(syncGitHubInstallationRepositoriesResponseSchema),
  syncedAt: z.string().datetime({ offset: true }),
  syncedInstallationCount: z.number().int().nonnegative(),
  syncedRepositoryCount: z.number().int().nonnegative(),
});

export type GitHubRepositorySummary = z.infer<
  typeof GitHubRepositorySummarySchema
>;
export type GitHubRepositoryWriteReadinessFailureCode = z.infer<
  typeof GitHubRepositoryWriteReadinessFailureCodeSchema
>;
export type GitHubRepositoryWriteReadiness = z.infer<
  typeof GitHubRepositoryWriteReadinessSchema
>;
export type GitHubRepositoryDetailResult = z.infer<
  typeof getGitHubRepositoryResponseSchema
>;
export type GitHubRepositoryListResult = z.infer<
  typeof listGitHubRepositoriesResponseSchema
>;
export type GitHubInstallationRepositoryListResult = z.infer<
  typeof listGitHubInstallationRepositoriesResponseSchema
>;
export type GitHubInstallationRepositorySyncResult = z.infer<
  typeof syncGitHubInstallationRepositoriesResponseSchema
>;
export type SyncGitHubRepositoriesResult = z.infer<
  typeof syncGitHubRepositoriesResponseSchema
>;

export function parseGitHubInstallationParams(params: unknown) {
  return GitHubInstallationParamsSchema.parse(params);
}

export function parseGitHubRepositoryParams(params: unknown) {
  return GitHubRepositoryParamsSchema.parse(params);
}
