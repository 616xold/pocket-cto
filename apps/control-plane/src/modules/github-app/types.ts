import { z } from "zod";

const GitHubIdSchema = z
  .union([z.number().int().nonnegative(), z.string().min(1)])
  .transform((value) => String(value));

export const GitHubPermissionsSchema = z
  .record(z.string().min(1), z.string().min(1))
  .default({});

export const GitHubInstallationAccountSchema = z.object({
  id: GitHubIdSchema,
  login: z.string().min(1),
  type: z.string().min(1),
});

export const GitHubInstallationApiSchema = z.object({
  id: GitHubIdSchema,
  app_id: GitHubIdSchema,
  target_id: GitHubIdSchema.nullable().optional(),
  target_type: z.string().min(1).nullable().optional(),
  account: GitHubInstallationAccountSchema,
  suspended_at: z.string().datetime({ offset: true }).nullable().optional(),
  permissions: GitHubPermissionsSchema,
});

export const GitHubInstallationAccessTokenApiSchema = z.object({
  token: z.string().min(1),
  expires_at: z.string().datetime({ offset: true }),
  permissions: GitHubPermissionsSchema,
});

export const GitHubInstallationSnapshotSchema = z.object({
  installationId: z.string().min(1),
  appId: z.string().min(1),
  accountLogin: z.string().min(1),
  accountType: z.string().min(1),
  targetType: z.string().min(1).nullable(),
  targetId: z.string().min(1).nullable(),
  suspendedAt: z.string().datetime({ offset: true }).nullable(),
  permissions: GitHubPermissionsSchema,
});

export const GitHubInstallationUpsertSchema =
  GitHubInstallationSnapshotSchema.extend({
    lastSyncedAt: z.string().datetime({ offset: true }),
  });

export const PersistedGitHubInstallationSchema =
  GitHubInstallationSnapshotSchema.extend({
    id: z.string().uuid(),
    appId: z.string().min(1).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
    updatedAt: z.string().datetime({ offset: true }),
  });

export const GitHubInstallationAccessTokenSchema = z.object({
  installationId: z.string().min(1),
  token: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
  permissions: GitHubPermissionsSchema,
});

export type GitHubInstallationApi = z.infer<typeof GitHubInstallationApiSchema>;
export type GitHubInstallationAccessTokenApi = z.infer<
  typeof GitHubInstallationAccessTokenApiSchema
>;
export type GitHubInstallationSnapshot = z.infer<
  typeof GitHubInstallationSnapshotSchema
>;
export type GitHubInstallationUpsert = z.infer<
  typeof GitHubInstallationUpsertSchema
>;
export type PersistedGitHubInstallation = z.infer<
  typeof PersistedGitHubInstallationSchema
>;
export type GitHubInstallationAccessToken = z.infer<
  typeof GitHubInstallationAccessTokenSchema
>;
