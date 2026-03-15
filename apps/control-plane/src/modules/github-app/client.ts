import { GITHUB_API_BASE_URL } from "./config";
import type { GitHubAppAuth } from "./auth";
import { GitHubAppRequestError } from "./errors";
import {
  GitHubInstallationAccessTokenApiSchema,
  GitHubInstallationApiSchema,
  type GitHubInstallationApi,
  type GitHubInstallationAccessToken,
  type GitHubInstallationSnapshot,
} from "./types";

type GitHubFetch = typeof fetch;

const GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";
const INSTALLATIONS_PAGE_SIZE = 100;

export class GitHubAppClient {
  private readonly apiBaseUrl: string;
  private readonly fetcher: GitHubFetch;

  constructor(
    private readonly auth: Pick<GitHubAppAuth, "createAppAuthorizationHeader">,
    options: {
      apiBaseUrl?: string;
      fetcher?: GitHubFetch;
    } = {},
  ) {
    this.apiBaseUrl = options.apiBaseUrl ?? GITHUB_API_BASE_URL;
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  }

  async listInstallations(): Promise<GitHubInstallationSnapshot[]> {
    const installations: GitHubInstallationSnapshot[] = [];
    let page = 1;

    while (true) {
      const payload = await this.requestJson(
        "GET",
        `/app/installations?per_page=${INSTALLATIONS_PAGE_SIZE}&page=${page}`,
      );
      const parsed = GitHubInstallationApiSchema.array().parse(payload);

      installations.push(...parsed.map(mapGitHubInstallation));

      if (parsed.length < INSTALLATIONS_PAGE_SIZE) {
        return installations;
      }

      page += 1;
    }
  }

  async createInstallationAccessToken(
    installationId: string,
  ): Promise<GitHubInstallationAccessToken> {
    const payload = await this.requestJson(
      "POST",
      `/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
      {},
    );
    const parsed = GitHubInstallationAccessTokenApiSchema.parse(payload);

    return {
      installationId,
      token: parsed.token,
      expiresAt: parsed.expires_at,
      permissions: parsed.permissions,
    };
  }

  private async requestJson(
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
  ) {
    const url = new URL(path, this.apiBaseUrl).toString();

    let response: Response;
    try {
      response = await this.fetcher(url, {
        method,
        headers: {
          Accept: GITHUB_ACCEPT_HEADER,
          Authorization: this.auth.createAppAuthorizationHeader(),
          "Content-Type": "application/json",
          "User-Agent": "pocket-cto-control-plane",
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new GitHubAppRequestError(method, url, 0, {
        message: error instanceof Error ? error.message : "Unknown fetch error",
      });
    }

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw new GitHubAppRequestError(method, url, response.status, payload);
    }

    return payload;
  }
}

async function parseResponseBody(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function mapGitHubInstallation(
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
