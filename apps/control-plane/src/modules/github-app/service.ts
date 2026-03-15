import type { GitHubAppConfigResolution } from "./config";
import { GitHubAppNotConfiguredError } from "./errors";
import type { GitHubAppRepository } from "./repository";
import { InMemoryInstallationTokenCache } from "./token-cache";
import type {
  GitHubInstallationAccessToken,
  PersistedGitHubInstallation,
} from "./types";

type GitHubAppClientPort = {
  createInstallationAccessToken(
    installationId: string,
  ): Promise<GitHubInstallationAccessToken>;
  listInstallations(): Promise<
    Array<{
      installationId: string;
      appId: string;
      accountLogin: string;
      accountType: string;
      targetType: string | null;
      targetId: string | null;
      suspendedAt: string | null;
      permissions: Record<string, string>;
    }>
  >;
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

  async listInstallations() {
    this.requireConfigured();
    return this.input.repository.listInstallations();
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

  async getInstallationAccessToken(installationId: string) {
    this.requireConfigured();
    const client = this.requireClient();

    return this.tokenCache.getOrCreate(installationId, async () =>
      client.createInstallationAccessToken(installationId),
    );
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
