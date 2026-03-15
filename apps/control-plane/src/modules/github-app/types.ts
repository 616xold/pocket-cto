import { z } from "zod";

export const GitHubIdSchema = z
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

export const GitHubRepositoryOwnerApiSchema = z.object({
  login: z.string().min(1),
});

export const GitHubRepositoryApiSchema = z.object({
  id: GitHubIdSchema,
  full_name: z.string().min(1),
  name: z.string().min(1),
  owner: GitHubRepositoryOwnerApiSchema,
  default_branch: z.string().min(1).optional(),
  private: z.boolean(),
  archived: z.boolean(),
  disabled: z.boolean(),
  language: z.string().nullable().optional(),
});

export const GitHubInstallationRepositoriesApiSchema = z.object({
  repositories: z.array(GitHubRepositoryApiSchema),
  total_count: z.number().int().nonnegative().optional(),
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

export const GitHubRepositorySnapshotSchema = z.object({
  githubRepositoryId: z.string().min(1),
  fullName: z.string().min(1),
  ownerLogin: z.string().min(1),
  name: z.string().min(1),
  defaultBranch: z.string().min(1),
  isPrivate: z.boolean(),
  archived: z.boolean(),
  disabled: z.boolean(),
  language: z.string().nullable(),
});

export const GitHubInstallationUpsertSchema =
  GitHubInstallationSnapshotSchema.extend({
    lastSyncedAt: z.string().datetime({ offset: true }).optional(),
  });

export const GitHubInstallationRepositoriesUpdateSchema = z.object({
  installationId: z.string().min(1),
  lastSyncedAt: z.string().datetime({ offset: true }).optional(),
  repositories: z.array(GitHubRepositorySnapshotSchema),
});

export const GitHubInstallationRepositoriesMarkInactiveSchema = z.object({
  installationId: z.string().min(1),
  markedInactiveAt: z.string().datetime({ offset: true }),
  lastSyncedAt: z.string().datetime({ offset: true }).optional(),
  githubRepositoryIds: z.array(z.string().min(1)),
});

export const PersistedGitHubInstallationSchema =
  GitHubInstallationSnapshotSchema.extend({
    id: z.string().uuid(),
    appId: z.string().min(1).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
    updatedAt: z.string().datetime({ offset: true }),
  });

export const PersistedGitHubRepositorySchema =
  GitHubRepositorySnapshotSchema.extend({
    id: z.string().uuid(),
    installationId: z.string().min(1),
    installationRefId: z.string().uuid().nullable(),
    isPrivate: z.boolean().nullable(),
    archived: z.boolean().nullable(),
    disabled: z.boolean().nullable(),
    isActive: z.boolean(),
    lastSyncedAt: z.string().datetime({ offset: true }).nullable(),
    removedFromInstallationAt: z.string().datetime({ offset: true }).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  });

export const GitHubInstallationAccessTokenSchema = z.object({
  installationId: z.string().min(1),
  token: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
  permissions: GitHubPermissionsSchema,
});

export type GitHubInstallationApi = z.infer<typeof GitHubInstallationApiSchema>;
export type GitHubRepositoryApi = z.infer<typeof GitHubRepositoryApiSchema>;
export type GitHubInstallationRepositoriesApi = z.infer<
  typeof GitHubInstallationRepositoriesApiSchema
>;
export type GitHubInstallationAccessTokenApi = z.infer<
  typeof GitHubInstallationAccessTokenApiSchema
>;
export type GitHubInstallationSnapshot = z.infer<
  typeof GitHubInstallationSnapshotSchema
>;
export type GitHubRepositorySnapshot = z.infer<
  typeof GitHubRepositorySnapshotSchema
>;
export type GitHubInstallationUpsert = z.infer<
  typeof GitHubInstallationUpsertSchema
>;
export type GitHubInstallationRepositoriesUpdate = z.infer<
  typeof GitHubInstallationRepositoriesUpdateSchema
>;
export type GitHubInstallationRepositoriesMarkInactive = z.infer<
  typeof GitHubInstallationRepositoriesMarkInactiveSchema
>;
export type PersistedGitHubInstallation = z.infer<
  typeof PersistedGitHubInstallationSchema
>;
export type PersistedGitHubRepository = z.infer<
  typeof PersistedGitHubRepositorySchema
>;
export type GitHubInstallationAccessToken = z.infer<
  typeof GitHubInstallationAccessTokenSchema
>;

export function mapGitHubInstallationApiToSnapshot(
  installation: GitHubInstallationApi,
): GitHubInstallationSnapshot {
  return {
    installationId: installation.id,
    appId: installation.app_id,
    accountLogin: installation.account.login,
    accountType: installation.account.type,
    targetType: installation.target_type ?? installation.account.type ?? null,
    targetId: installation.target_id ?? installation.account.id ?? null,
    suspendedAt: installation.suspended_at ?? null,
    permissions: installation.permissions,
  };
}

export function mapGitHubRepositoryApiToSnapshot(
  repository: GitHubRepositoryApi,
): GitHubRepositorySnapshot {
  return {
    githubRepositoryId: repository.id,
    fullName: repository.full_name,
    ownerLogin: repository.owner.login,
    name: repository.name,
    defaultBranch: repository.default_branch ?? "main",
    isPrivate: repository.private,
    archived: repository.archived,
    disabled: repository.disabled,
    language: repository.language ?? null,
  };
}
