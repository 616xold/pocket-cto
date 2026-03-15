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

export class GitHubWebhookNotConfiguredError extends Error {
  constructor(readonly missing: string[]) {
    super("GitHub webhook ingress is not configured");
    this.name = "GitHubWebhookNotConfiguredError";
  }
}

export class GitHubWebhookMissingSignatureError extends Error {
  constructor() {
    super("GitHub webhook signature header is missing");
    this.name = "GitHubWebhookMissingSignatureError";
  }
}

export class GitHubWebhookBadSignatureError extends Error {
  constructor() {
    super("GitHub webhook signature is invalid");
    this.name = "GitHubWebhookBadSignatureError";
  }
}

export class GitHubWebhookMissingDeliveryIdError extends Error {
  constructor() {
    super("GitHub delivery id header is missing");
    this.name = "GitHubWebhookMissingDeliveryIdError";
  }
}

export class GitHubWebhookMissingEventNameError extends Error {
  constructor() {
    super("GitHub event name header is missing");
    this.name = "GitHubWebhookMissingEventNameError";
  }
}

export class GitHubWebhookPayloadParseError extends Error {
  constructor() {
    super("GitHub webhook payload must be valid JSON");
    this.name = "GitHubWebhookPayloadParseError";
  }
}
