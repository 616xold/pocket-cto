import type { PersistenceSession } from "../../lib/persistence";
import type { GitHubAppConfigResolution } from "./config";
import { GitHubAppNotConfiguredError } from "./errors";
import type { GitHubAppRepository } from "./repository";
import { InMemoryInstallationTokenCache } from "./token-cache";
import type {
  GitHubInstallationAccessToken,
  GitHubInstallationSnapshot,
  GitHubRepositorySnapshot,
  PersistedGitHubInstallation,
  PersistedGitHubRepository,
} from "./types";

type GitHubAppClientPort = {
  createInstallationAccessToken(
    installationId: string,
  ): Promise<GitHubInstallationAccessToken>;
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
    await this.input.repository.upsertInstallation(input.installation, session);

    if (input.repositoriesAdded.length > 0) {
      await this.input.repository.upsertInstallationRepositories(
        {
          installationId: input.installation.installationId,
          repositories: input.repositoriesAdded,
        },
        session,
      );
    }

    if (input.repositoriesRemoved.length > 0) {
      await this.input.repository.removeInstallationRepositories(
        {
          installationId: input.installation.installationId,
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

  async listRepositories(): Promise<PersistedGitHubRepository[]> {
    return this.input.repository.listRepositories();
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
