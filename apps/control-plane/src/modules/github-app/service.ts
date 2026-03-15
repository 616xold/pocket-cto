import type { PersistenceSession } from "../../lib/persistence";
import type { GitHubAppConfigResolution } from "./config";
import {
  GitHubAppNotConfiguredError,
  GitHubInstallationNotFoundError,
  GitHubRepositoryArchivedError,
  GitHubRepositoryDisabledError,
  GitHubRepositoryInactiveError,
  GitHubRepositoryInstallationUnavailableError,
  GitHubRepositoryNotFoundError,
} from "./errors";
import {
  buildGitHubRepositoryDetailResult,
  buildInstallationRepositorySyncResult,
  toGitHubRepositorySummary,
} from "./formatter";
import type { GitHubAppRepository } from "./repository";
import type {
  GitHubRepositoryDetailResult,
  GitHubInstallationRepositoryListResult,
  GitHubInstallationRepositorySyncResult,
  GitHubRepositoryListResult,
  GitHubRepositoryWriteReadinessFailureCode,
  SyncGitHubRepositoriesResult,
} from "./schema";
import { InMemoryInstallationTokenCache } from "./token-cache";
import type {
  GitHubInstallationAccessToken,
  GitHubInstallationSnapshot,
  GitHubRepositorySnapshot,
  PersistedGitHubInstallation,
  PersistedGitHubRepository,
  WritableGitHubRepositoryTarget,
} from "./types";

type GitHubAppClientPort = {
  createInstallationAccessToken(
    installationId: string,
  ): Promise<GitHubInstallationAccessToken>;
  listInstallationRepositories(
    installationAccessToken: string,
  ): Promise<GitHubRepositorySnapshot[]>;
  listInstallations(): Promise<GitHubInstallationSnapshot[]>;
};

export type SyncGitHubInstallationsResult = {
  installations: PersistedGitHubInstallation[];
  syncedAt: string;
  syncedCount: number;
};

export class GitHubAppService {
  private readonly now: () => Date;
  private readonly tokenCache: InMemoryInstallationTokenCache;

  constructor(
    private readonly input: {
      client: GitHubAppClientPort | null;
      config: GitHubAppConfigResolution;
      repository: GitHubAppRepository;
      tokenCache?: InMemoryInstallationTokenCache;
      now?: () => Date;
    },
  ) {
    this.now = input.now ?? (() => new Date());
    this.tokenCache = input.tokenCache ?? new InMemoryInstallationTokenCache();
  }

  async applyInstallationEvent(
    input: {
      action: string;
      installation: GitHubInstallationSnapshot;
    },
    session?: PersistenceSession,
  ) {
    if (input.action === "deleted") {
      await this.input.repository.deleteInstallation(
        input.installation.installationId,
        session,
      );
      return;
    }

    await this.input.repository.upsertInstallation(input.installation, session);
  }

  async applyInstallationRepositoriesEvent(
    input: {
      action: string;
      installation: GitHubInstallationSnapshot;
      repositoriesAdded: GitHubRepositorySnapshot[];
      repositoriesRemoved: string[];
    },
    session?: PersistenceSession,
  ) {
    const syncedAt = this.now().toISOString();

    await this.input.repository.upsertInstallation(input.installation, session);

    if (input.repositoriesAdded.length > 0) {
      await this.input.repository.upsertInstallationRepositories(
        {
          installationId: input.installation.installationId,
          lastSyncedAt: syncedAt,
          repositories: input.repositoriesAdded,
        },
        session,
      );
    }

    if (input.repositoriesRemoved.length > 0) {
      await this.input.repository.markInstallationRepositoriesInactive(
        {
          installationId: input.installation.installationId,
          markedInactiveAt: syncedAt,
          lastSyncedAt: syncedAt,
          githubRepositoryIds: input.repositoriesRemoved,
        },
        session,
      );
    }
  }

  async getInstallationAccessToken(installationId: string) {
    this.requireConfigured();
    const client = this.requireClient();

    return this.tokenCache.getOrCreate(installationId, async () =>
      client.createInstallationAccessToken(installationId),
    );
  }

  async listInstallations() {
    this.requireConfigured();
    return this.input.repository.listInstallations();
  }

  async listRepositories(): Promise<GitHubRepositoryListResult> {
    this.requireConfigured();

    return {
      repositories: (await this.input.repository.listRepositories()).map(
        toGitHubRepositorySummary,
      ),
    };
  }

  async getRepository(fullName: string): Promise<GitHubRepositoryDetailResult> {
    this.requireConfigured();
    const repository = await this.requirePersistedRepository(fullName);
    const installation = await this.input.repository.getInstallationByInstallationId(
      repository.installationId,
    );

    return buildGitHubRepositoryDetailResult({
      repository,
      failureCode: getRepositoryWriteReadinessFailure(repository, installation),
    });
  }

  async listInstallationRepositories(
    installationId: string,
  ): Promise<GitHubInstallationRepositoryListResult> {
    this.requireConfigured();
    const installation = await this.requirePersistedInstallation(installationId);
    const repositories = await this.input.repository.listRepositoriesByInstallation(
      installationId,
    );

    return {
      installation,
      repositories: repositories.map(toGitHubRepositorySummary),
    };
  }

  async syncInstallations(): Promise<SyncGitHubInstallationsResult> {
    this.requireConfigured();
    const client = this.requireClient();
    const syncedAt = this.now().toISOString();
    const installations = await client.listInstallations();

    await this.input.repository.transaction(async (session) => {
      for (const installation of installations) {
        await this.input.repository.upsertInstallation(
          {
            ...installation,
            lastSyncedAt: syncedAt,
          },
          session,
        );
      }
    });

    return {
      installations: await this.input.repository.listInstallations(),
      syncedAt,
      syncedCount: installations.length,
    };
  }

  async syncInstallationRepositories(
    installationId: string,
  ): Promise<GitHubInstallationRepositorySyncResult> {
    this.requireConfigured();
    const installation = await this.requirePersistedInstallation(installationId);
    const client = this.requireClient();
    const syncedAt = this.now().toISOString();
    const accessToken = await this.getInstallationAccessToken(installationId);
    const repositories = await client.listInstallationRepositories(accessToken.token);

    await this.input.repository.transaction(async (session) => {
      await this.reconcileFullInstallationRepositorySync(
        installationId,
        repositories,
        syncedAt,
        session,
      );
    });

    return this.buildInstallationRepositorySyncResult(
      installation,
      installationId,
      repositories.length,
      syncedAt,
    );
  }

  async syncRepositories(): Promise<SyncGitHubRepositoriesResult> {
    this.requireConfigured();
    const installations = await this.input.repository.listInstallations();
    const syncedAt = this.now().toISOString();
    const results: GitHubInstallationRepositorySyncResult[] = [];

    for (const installation of installations) {
      results.push(
        await this.syncInstallationRepositories(installation.installationId),
      );
    }

    return {
      installations: results,
      syncedAt,
      syncedInstallationCount: results.length,
      syncedRepositoryCount: results.reduce(
        (total, installation) => total + installation.syncedRepositoryCount,
        0,
      ),
    };
  }

  async resolveWritableRepository(
    fullName: string,
  ): Promise<WritableGitHubRepositoryTarget> {
    this.requireConfigured();
    const repository = await this.requirePersistedRepository(fullName);
    const installation = await this.input.repository.getInstallationByInstallationId(
      repository.installationId,
    );
    const failureCode = getRepositoryWriteReadinessFailure(
      repository,
      installation,
    );

    if (failureCode === "inactive") {
      throw new GitHubRepositoryInactiveError(fullName);
    }

    if (failureCode === "archived") {
      throw new GitHubRepositoryArchivedError(fullName);
    }

    if (failureCode === "disabled") {
      throw new GitHubRepositoryDisabledError(fullName);
    }

    if (failureCode === "installation_unavailable" || !installation) {
      throw new GitHubRepositoryInstallationUnavailableError(
        fullName,
        repository.installationId,
      );
    }

    return {
      installation,
      repository,
    };
  }

  private async buildInstallationRepositorySyncResult(
    installation: PersistedGitHubInstallation,
    installationId: string,
    syncedRepositoryCount: number,
    syncedAt: string,
  ): Promise<GitHubInstallationRepositorySyncResult> {
    const repositories = await this.input.repository.listRepositoriesByInstallation(
      installationId,
    );

    return buildInstallationRepositorySyncResult({
      installation,
      repositories,
      syncedAt,
      syncedRepositoryCount,
    });
  }

  private async reconcileFullInstallationRepositorySync(
    installationId: string,
    repositories: GitHubRepositorySnapshot[],
    syncedAt: string,
    session: PersistenceSession,
  ) {
    if (repositories.length > 0) {
      await this.input.repository.upsertInstallationRepositories(
        {
          installationId,
          lastSyncedAt: syncedAt,
          repositories,
        },
        session,
      );
    }

    const existingRepositories =
      await this.input.repository.listRepositoriesByInstallation(
        installationId,
        session,
      );
    const syncedRepositoryIds = new Set(
      repositories.map((repository) => repository.githubRepositoryId),
    );
    const missingRepositoryIds = existingRepositories
      .filter(
        (repository) =>
          repository.isActive &&
          !syncedRepositoryIds.has(repository.githubRepositoryId),
      )
      .map((repository) => repository.githubRepositoryId);

    if (missingRepositoryIds.length === 0) {
      return;
    }

    await this.input.repository.markInstallationRepositoriesInactive(
      {
        installationId,
        markedInactiveAt: syncedAt,
        lastSyncedAt: syncedAt,
        githubRepositoryIds: missingRepositoryIds,
      },
      session,
    );
  }

  private async requirePersistedInstallation(installationId: string) {
    const installation =
      await this.input.repository.getInstallationByInstallationId(installationId);

    if (!installation) {
      throw new GitHubInstallationNotFoundError(installationId);
    }

    return installation;
  }

  private async requirePersistedRepository(fullName: string) {
    const repository = await this.input.repository.getRepositoryByFullName(fullName);

    if (!repository) {
      throw new GitHubRepositoryNotFoundError(fullName);
    }

    return repository;
  }

  private requireClient() {
    if (!this.input.client) {
      throw new GitHubAppNotConfiguredError(
        this.input.config.status === "unconfigured"
          ? this.input.config.missing
          : [],
      );
    }

    return this.input.client;
  }

  private requireConfigured() {
    if (this.input.config.status === "unconfigured") {
      throw new GitHubAppNotConfiguredError(this.input.config.missing);
    }

    return this.input.config.config;
  }
}

function getRepositoryWriteReadinessFailure(
  repository: PersistedGitHubRepository,
  installation: PersistedGitHubInstallation | null,
): GitHubRepositoryWriteReadinessFailureCode | null {
  if (repository.archived === true) {
    return "archived";
  }

  if (repository.disabled === true) {
    return "disabled";
  }

  if (!repository.installationId || !installation) {
    return "installation_unavailable";
  }

  if (!repository.isActive) {
    return "inactive";
  }

  return null;
}
