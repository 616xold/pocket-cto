import type { GitHubInstallationAccessToken } from "./types";

type TokenFactory = () => Promise<GitHubInstallationAccessToken>;

type CachedToken = {
  expiresAtMs: number;
  token: GitHubInstallationAccessToken;
};

export class InMemoryInstallationTokenCache {
  private readonly cachedTokens = new Map<string, CachedToken>();
  private readonly inflightRefreshes = new Map<
    string,
    Promise<GitHubInstallationAccessToken>
  >();

  constructor(
    private readonly options: {
      now?: () => number;
      refreshSkewMs?: number;
    } = {},
  ) {}

  async getOrCreate(
    installationId: string,
    createToken: TokenFactory,
  ): Promise<GitHubInstallationAccessToken> {
    const cachedToken = this.cachedTokens.get(installationId);

    if (cachedToken && !this.isExpiringSoon(cachedToken.expiresAtMs)) {
      return cachedToken.token;
    }

    const existingRefresh = this.inflightRefreshes.get(installationId);
    if (existingRefresh) {
      return existingRefresh;
    }

    const refreshPromise = createToken()
      .then((token) => {
        this.cachedTokens.set(installationId, {
          expiresAtMs: Date.parse(token.expiresAt),
          token,
        });
        return token;
      })
      .finally(() => {
        this.inflightRefreshes.delete(installationId);
      });

    this.inflightRefreshes.set(installationId, refreshPromise);

    return refreshPromise;
  }

  clear() {
    this.cachedTokens.clear();
    this.inflightRefreshes.clear();
  }

  private isExpiringSoon(expiresAtMs: number) {
    return expiresAtMs - this.getRefreshSkewMs() <= this.getNow()();
  }

  private getNow() {
    return this.options.now ?? Date.now;
  }

  private getRefreshSkewMs() {
    return this.options.refreshSkewMs ?? 60_000;
  }
}
