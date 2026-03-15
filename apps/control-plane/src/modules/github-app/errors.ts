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

export class GitHubInstallationNotFoundError extends Error {
  constructor(readonly installationId: string) {
    super("GitHub installation not found");
    this.name = "GitHubInstallationNotFoundError";
  }
}

export class GitHubRepositoryNotFoundError extends Error {
  constructor(readonly fullName: string) {
    super("GitHub repository not found");
    this.name = "GitHubRepositoryNotFoundError";
  }
}

export class GitHubRepositoryInactiveError extends Error {
  constructor(readonly fullName: string) {
    super("GitHub repository is inactive");
    this.name = "GitHubRepositoryInactiveError";
  }
}

export class GitHubRepositoryArchivedError extends Error {
  constructor(readonly fullName: string) {
    super("GitHub repository is archived");
    this.name = "GitHubRepositoryArchivedError";
  }
}

export class GitHubRepositoryDisabledError extends Error {
  constructor(readonly fullName: string) {
    super("GitHub repository is disabled");
    this.name = "GitHubRepositoryDisabledError";
  }
}

export class GitHubRepositoryInstallationUnavailableError extends Error {
  constructor(
    readonly fullName: string,
    readonly installationId: string | null,
  ) {
    super("GitHub repository installation is unavailable");
    this.name = "GitHubRepositoryInstallationUnavailableError";
  }
}

export class GitHubMissionRepositoryMissingError extends Error {
  constructor(readonly missionId: string) {
    super("Mission does not resolve to a writable repository");
    this.name = "GitHubMissionRepositoryMissingError";
  }
}

export class GitHubWorkspaceBranchMissingError extends Error {
  constructor(readonly taskId: string) {
    super("Workspace is missing a deterministic branch name");
    this.name = "GitHubWorkspaceBranchMissingError";
  }
}

export class GitHubBranchAlreadyExistsError extends Error {
  constructor(
    readonly repoFullName: string,
    readonly branchName: string,
  ) {
    super("GitHub branch already exists");
    this.name = "GitHubBranchAlreadyExistsError";
  }
}

export class GitHubWorkspaceNoChangesError extends Error {
  constructor(readonly workspaceRoot: string) {
    super("Workspace has no commit-ready changes");
    this.name = "GitHubWorkspaceNoChangesError";
  }
}

export class GitHubBranchPushError extends Error {
  constructor(
    readonly repoFullName: string,
    readonly branchName: string,
    readonly causeMessage: string,
  ) {
    super(
      `GitHub branch push failed for ${repoFullName} ${branchName}: ${causeMessage}`,
    );
    this.name = "GitHubBranchPushError";
  }
}

export class GitHubPullRequestCreateError extends Error {
  constructor(
    readonly repoFullName: string,
    readonly branchName: string,
    readonly baseBranch: string,
    readonly causeMessage: string,
  ) {
    super(
      `GitHub draft pull request creation failed for ${repoFullName} ${branchName} -> ${baseBranch}: ${causeMessage}`,
    );
    this.name = "GitHubPullRequestCreateError";
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

export class GitHubWebhookDeliveryNotFoundError extends Error {
  constructor(readonly deliveryId: string) {
    super("GitHub webhook delivery not found");
    this.name = "GitHubWebhookDeliveryNotFoundError";
  }
}
