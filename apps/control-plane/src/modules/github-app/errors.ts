export class GitHubAppNotConfiguredError extends Error {
  constructor(readonly missing: string[]) {
    super("GitHub App credentials are not configured");
    this.name = "GitHubAppNotConfiguredError";
  }
}

export class GitHubAppConfigurationError extends Error {
  constructor(message: string, readonly detail?: string | null) {
    super(detail ? `${message}: ${detail}` : message);
    this.name = "GitHubAppConfigurationError";
  }
}

export class GitHubAppAuthError extends GitHubAppConfigurationError {
  constructor(message: string, detail?: string | null) {
    super(message, detail);
    this.name = "GitHubAppAuthError";
  }
}

export class GitHubAppRequestError extends Error {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly statusCode: number,
    readonly responseBody: unknown,
  ) {
    super(`GitHub App request failed for ${method} ${url} with ${statusCode}`);
    this.name = "GitHubAppRequestError";
  }
}
