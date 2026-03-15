import type {
  GitHubRepositoryDetailResult,
  GitHubInstallationRepositorySyncResult,
  GitHubRepositorySummary,
  GitHubRepositoryWriteReadiness,
  GitHubRepositoryWriteReadinessFailureCode,
} from "./schema";
import type {
  PersistedGitHubInstallation,
  PersistedGitHubRepository,
} from "./types";

export function toGitHubRepositorySummary(
  repository: PersistedGitHubRepository,
): GitHubRepositorySummary {
  return {
    id: repository.id,
    installationId: repository.installationId,
    githubRepositoryId: repository.githubRepositoryId,
    fullName: repository.fullName,
    ownerLogin: repository.ownerLogin,
    name: repository.name,
    defaultBranch: repository.defaultBranch,
    visibility:
      repository.isPrivate === null
        ? null
        : repository.isPrivate
          ? "private"
          : "public",
    archived: repository.archived,
    disabled: repository.disabled,
    isActive: repository.isActive,
    language: repository.language,
    lastSyncedAt: repository.lastSyncedAt,
    removedFromInstallationAt: repository.removedFromInstallationAt,
    updatedAt: repository.updatedAt,
  };
}

export function buildInstallationRepositorySyncResult(input: {
  installation: PersistedGitHubInstallation;
  repositories: PersistedGitHubRepository[];
  syncedAt: string;
  syncedRepositoryCount: number;
}): GitHubInstallationRepositorySyncResult {
  return {
    installation: input.installation,
    syncedAt: input.syncedAt,
    syncedRepositoryCount: input.syncedRepositoryCount,
    activeRepositoryCount: input.repositories.filter((repository) => repository.isActive)
      .length,
    inactiveRepositoryCount: input.repositories.filter(
      (repository) => !repository.isActive,
    ).length,
  };
}

export function buildGitHubRepositoryDetailResult(input: {
  repository: PersistedGitHubRepository;
  failureCode: GitHubRepositoryWriteReadinessFailureCode | null;
}): GitHubRepositoryDetailResult {
  return {
    repository: toGitHubRepositorySummary(input.repository),
    writeReadiness: toGitHubRepositoryWriteReadiness(input.failureCode),
  };
}

export function toGitHubRepositoryWriteReadiness(
  failureCode: GitHubRepositoryWriteReadinessFailureCode | null,
): GitHubRepositoryWriteReadiness {
  return {
    ready: failureCode === null,
    failureCode,
  };
}
