import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import {
  GitHubBranchPushError,
  GitHubWorkspaceNoChangesError,
} from "./errors";

const execFile = promisify(execFileCallback);
const DEFAULT_COMMIT_AUTHOR_NAME = "Pocket CTO";
const DEFAULT_COMMIT_AUTHOR_EMAIL = "noreply@pocket-cto.local";

type GitCommandResult = {
  stderr: string;
  stdout: string;
};

type GitCommandRunner = (
  cwd: string,
  args: string[],
  options?: {
    env?: NodeJS.ProcessEnv;
  },
) => Promise<GitCommandResult>;

export class LocalGitHubWriteClient {
  constructor(
    private readonly runGitCommand: GitCommandRunner = createDefaultRunner(),
  ) {}

  async createCommit(input: {
    commitMessage: string;
    workspaceRoot: string;
  }): Promise<{
    commitSha: string;
  }> {
    await this.runGit(input.workspaceRoot, ["add", "-A", "--", "."]);

    const status = await this.runGit(input.workspaceRoot, [
      "status",
      "--porcelain",
      "--untracked-files=all",
    ]);

    if (!status.stdout.trim()) {
      throw new GitHubWorkspaceNoChangesError(input.workspaceRoot);
    }

    await this.runGit(
      input.workspaceRoot,
      ["commit", "-m", input.commitMessage],
      {
        env: {
          ...process.env,
          GIT_AUTHOR_EMAIL: DEFAULT_COMMIT_AUTHOR_EMAIL,
          GIT_AUTHOR_NAME: DEFAULT_COMMIT_AUTHOR_NAME,
          GIT_COMMITTER_EMAIL: DEFAULT_COMMIT_AUTHOR_EMAIL,
          GIT_COMMITTER_NAME: DEFAULT_COMMIT_AUTHOR_NAME,
        },
      },
    );

    const revision = await this.runGit(input.workspaceRoot, ["rev-parse", "HEAD"]);
    const commitSha = revision.stdout.trim();

    if (!commitSha) {
      throw new Error(
        `Git commit SHA resolution returned empty output for ${input.workspaceRoot}`,
      );
    }

    return {
      commitSha,
    };
  }

  async pushBranch(input: {
    branchName: string;
    installationToken: string;
    remoteUrl: string;
    repoFullName: string;
    workspaceRoot: string;
  }): Promise<void> {
    try {
      await this.runGit(
        input.workspaceRoot,
        [
          "push",
          "--porcelain",
          input.remoteUrl,
          `HEAD:refs/heads/${input.branchName}`,
        ],
        {
          env: buildPushEnvironment(
            input.remoteUrl,
            input.installationToken,
            process.env,
          ),
        },
      );
    } catch (error) {
      throw new GitHubBranchPushError(
        input.repoFullName,
        input.branchName,
        formatGitError(error),
      );
    }
  }

  private async runGit(
    cwd: string,
    args: string[],
    options?: {
      env?: NodeJS.ProcessEnv;
    },
  ) {
    return this.runGitCommand(cwd, args, options);
  }
}

function createDefaultRunner(): GitCommandRunner {
  return async (cwd, args, options = {}) => {
    const result = await execFile("git", args, {
      cwd,
      env: options.env,
    });

    return {
      stderr: result.stderr,
      stdout: result.stdout,
    };
  };
}

function buildPushEnvironment(
  remoteUrl: string,
  installationToken: string,
  baseEnv: NodeJS.ProcessEnv,
) {
  let env: NodeJS.ProcessEnv = {
    ...baseEnv,
    GIT_TERMINAL_PROMPT: "0",
  };

  if (!/^https?:\/\//.test(remoteUrl)) {
    return env;
  }

  const authHeader = `AUTHORIZATION: Basic ${Buffer.from(
    `x-access-token:${installationToken}`,
  ).toString("base64")}`;

  env = appendGitConfigEnv(
    env,
    `http.${remoteUrl}.extraheader`,
    authHeader,
  );

  return env;
}

function appendGitConfigEnv(
  env: NodeJS.ProcessEnv,
  key: string,
  value: string,
) {
  const count = Number.parseInt(env.GIT_CONFIG_COUNT ?? "0", 10);
  const safeCount = Number.isFinite(count) && count >= 0 ? count : 0;

  return {
    ...env,
    GIT_CONFIG_COUNT: String(safeCount + 1),
    [`GIT_CONFIG_KEY_${safeCount}`]: key,
    [`GIT_CONFIG_VALUE_${safeCount}`]: value,
  };
}

function formatGitError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const stdout =
      "stdout" in error && typeof error.stdout === "string"
        ? error.stdout.trim()
        : "";
    const stderr =
      "stderr" in error && typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message.trim()
        : "";

    return [stdout, stderr, message].filter(Boolean).join("\n") || String(error);
  }

  return String(error);
}
