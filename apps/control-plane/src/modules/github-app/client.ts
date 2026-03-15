import { GITHUB_API_BASE_URL } from "./config";
import type { GitHubAppAuth } from "./auth";
import { GitHubAppRequestError } from "./errors";
import {
  GitHubInstallationAccessTokenApiSchema,
  GitHubInstallationApiSchema,
  type GitHubInstallationAccessToken,
  GitHubInstallationRepositoriesApiSchema,
  type GitHubInstallationSnapshot,
  GitHubPullRequestApiSchema,
  type GitHubRepositorySnapshot,
  type GitHubPullRequestApi,
  mapGitHubInstallationApiToSnapshot,
  mapGitHubRepositoryApiToSnapshot,
} from "./types";

type GitHubFetch = typeof fetch;

const GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";
const INSTALLATIONS_PAGE_SIZE = 100;
const INSTALLATION_REPOSITORIES_PAGE_SIZE = 100;

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
        {
          authorization: this.auth.createAppAuthorizationHeader(),
        },
      );
      const parsed = GitHubInstallationApiSchema.array().parse(payload);

      installations.push(...parsed.map(mapGitHubInstallationApiToSnapshot));

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
      {
        authorization: this.auth.createAppAuthorizationHeader(),
        body: {},
      },
    );
    const parsed = GitHubInstallationAccessTokenApiSchema.parse(payload);

    return {
      installationId,
      token: parsed.token,
      expiresAt: parsed.expires_at,
      permissions: parsed.permissions,
    };
  }

  async listInstallationRepositories(
    installationAccessToken: string,
  ): Promise<GitHubRepositorySnapshot[]> {
    const repositories: GitHubRepositorySnapshot[] = [];
    let page = 1;

    while (true) {
      const payload = await this.requestJson(
        "GET",
        `/installation/repositories?per_page=${INSTALLATION_REPOSITORIES_PAGE_SIZE}&page=${page}`,
        {
          authorization: `Bearer ${installationAccessToken}`,
        },
      );
      const parsed = GitHubInstallationRepositoriesApiSchema.parse(payload);

      repositories.push(
        ...parsed.repositories.map(mapGitHubRepositoryApiToSnapshot),
      );

      if (parsed.repositories.length < INSTALLATION_REPOSITORIES_PAGE_SIZE) {
        return repositories;
      }

      page += 1;
    }
  }

  async branchExists(
    installationAccessToken: string,
    repoFullName: string,
    branchName: string,
  ): Promise<boolean> {
    try {
      await this.requestJson(
        "GET",
        `/repos/${encodeGitHubRepoPath(repoFullName)}/branches/${encodeURIComponent(branchName)}`,
        {
          authorization: `Bearer ${installationAccessToken}`,
        },
      );
      return true;
    } catch (error) {
      if (
        error instanceof GitHubAppRequestError &&
        error.statusCode === 404
      ) {
        return false;
      }

      throw error;
    }
  }

  async createDraftPullRequest(
    installationAccessToken: string,
    repoFullName: string,
    input: {
      baseBranch: string;
      body: string;
      headBranch: string;
      title: string;
    },
  ): Promise<GitHubPullRequestApi> {
    const payload = await this.requestJson(
      "POST",
      `/repos/${encodeGitHubRepoPath(repoFullName)}/pulls`,
      {
        authorization: `Bearer ${installationAccessToken}`,
        body: {
          base: input.baseBranch,
          body: input.body,
          draft: true,
          head: input.headBranch,
          title: input.title,
        },
      },
    );

    return GitHubPullRequestApiSchema.parse(payload);
  }

  private async requestJson(
    method: "GET" | "POST",
    path: string,
    options: {
      authorization: string;
      body?: Record<string, unknown>;
    },
  ) {
    const url = new URL(path, this.apiBaseUrl).toString();

    let response: Response;
    try {
      response = await this.fetcher(url, {
        method,
        headers: {
          Accept: GITHUB_ACCEPT_HEADER,
          Authorization: options.authorization,
          "Content-Type": "application/json",
          "User-Agent": "pocket-cto-control-plane",
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
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

function encodeGitHubRepoPath(fullName: string) {
  return fullName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
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
