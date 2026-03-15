import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import type { WorkspaceRecord } from "../workspaces";
import {
  GitHubBranchAlreadyExistsError,
  GitHubMissionRepositoryMissingError,
  GitHubPullRequestCreateError,
  GitHubWorkspaceBranchMissingError,
} from "./errors";
import {
  buildGitHubPublishCommitMessage,
  buildGitHubPublishPullRequestBody,
  buildGitHubPublishPullRequestTitle,
} from "./publish-formatter";
import type {
  GitHubInstallationAccessToken,
  PublishedGitHubPullRequest,
  WritableGitHubRepositoryTarget,
} from "./types";

type GitHubPublishTargetResolver = {
  getInstallationAccessToken(
    installationId: string,
  ): Promise<GitHubInstallationAccessToken>;
  resolveWritableRepository(
    fullName: string,
  ): Promise<WritableGitHubRepositoryTarget>;
};

type GitHubPublishApiClient = {
  branchExists(
    installationAccessToken: string,
    repoFullName: string,
    branchName: string,
  ): Promise<boolean>;
  createDraftPullRequest(
    installationAccessToken: string,
    repoFullName: string,
    input: {
      baseBranch: string;
      body: string;
      headBranch: string;
      title: string;
    },
  ): Promise<{
    draft: boolean;
    html_url: string;
    number: number;
  }>;
};

type GitHubPublishGitClient = {
  createCommit(input: {
    commitMessage: string;
    workspaceRoot: string;
  }): Promise<{
    commitSha: string;
  }>;
  pushBranch(input: {
    branchName: string;
    installationToken: string;
    remoteUrl: string;
    repoFullName: string;
    workspaceRoot: string;
  }): Promise<void>;
};

export class GitHubPublishService {
  private readonly now: () => Date;
  private readonly buildRemoteUrl: (repoFullName: string) => string;

  constructor(
    private readonly input: {
      apiClient: GitHubPublishApiClient | null;
      gitClient: GitHubPublishGitClient;
      now?: () => Date;
      remoteUrlFactory?: (repoFullName: string) => string;
      targetResolver: GitHubPublishTargetResolver;
    },
  ) {
    this.now = input.now ?? (() => new Date());
    this.buildRemoteUrl =
      input.remoteUrlFactory ??
      ((repoFullName) => buildGitHubRepositoryRemoteUrl(repoFullName));
  }

  async publishValidatedExecutorWorkspace(input: {
    executorSummary: string | null;
    mission: Pick<MissionRecord, "id" | "objective" | "primaryRepo" | "spec" | "title">;
    task: Pick<MissionTaskRecord, "id" | "role" | "sequence">;
    workspace: Pick<WorkspaceRecord, "branchName" | "rootPath">;
  }): Promise<PublishedGitHubPullRequest> {
    const repoFullName = resolveMissionRepoFullName(input.mission);

    if (!repoFullName) {
      throw new GitHubMissionRepositoryMissingError(input.mission.id);
    }

    const branchName = input.workspace.branchName?.trim();

    if (!branchName) {
      throw new GitHubWorkspaceBranchMissingError(input.task.id);
    }

    const apiClient = this.requireApiClient();
    const { installation, repository } =
      await this.input.targetResolver.resolveWritableRepository(repoFullName);
    const installationAccessToken =
      await this.input.targetResolver.getInstallationAccessToken(
        installation.installationId,
      );
    const branchExists = await apiClient.branchExists(
      installationAccessToken.token,
      repository.fullName,
      branchName,
    );

    if (branchExists) {
      throw new GitHubBranchAlreadyExistsError(repository.fullName, branchName);
    }

    const commitMessage = buildGitHubPublishCommitMessage({
      mission: input.mission,
      task: input.task,
    });
    const pullRequestTitle = buildGitHubPublishPullRequestTitle({
      mission: input.mission,
    });
    const pullRequestBody = buildGitHubPublishPullRequestBody({
      baseBranch: repository.defaultBranch,
      branchName,
      executorSummary: input.executorSummary,
      mission: input.mission,
      repoFullName: repository.fullName,
      task: input.task,
    });
    const remoteUrl = this.buildRemoteUrl(repository.fullName);
    const commit = await this.input.gitClient.createCommit({
      commitMessage,
      workspaceRoot: input.workspace.rootPath,
    });

    await this.input.gitClient.pushBranch({
      branchName,
      installationToken: installationAccessToken.token,
      remoteUrl,
      repoFullName: repository.fullName,
      workspaceRoot: input.workspace.rootPath,
    });

    try {
      const pullRequest = await apiClient.createDraftPullRequest(
        installationAccessToken.token,
        repository.fullName,
        {
          baseBranch: repository.defaultBranch,
          body: pullRequestBody,
          headBranch: branchName,
          title: pullRequestTitle,
        },
      );

      return {
        baseBranch: repository.defaultBranch,
        branchName,
        commitMessage,
        commitSha: commit.commitSha,
        draft: pullRequest.draft,
        headBranch: branchName,
        prBody: pullRequestBody,
        prNumber: pullRequest.number,
        prTitle: pullRequestTitle,
        prUrl: pullRequest.html_url,
        publishedAt: this.now().toISOString(),
        repoFullName: repository.fullName,
      };
    } catch (error) {
      throw new GitHubPullRequestCreateError(
        repository.fullName,
        branchName,
        repository.defaultBranch,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private requireApiClient() {
    if (!this.input.apiClient) {
      throw new Error("GitHub publish API client is unavailable");
    }

    return this.input.apiClient;
  }
}

function resolveMissionRepoFullName(
  mission: Pick<MissionRecord, "primaryRepo" | "spec">,
) {
  return mission.primaryRepo ?? mission.spec.repos[0] ?? null;
}

function buildGitHubRepositoryRemoteUrl(repoFullName: string) {
  return `https://github.com/${repoFullName}.git`;
}
