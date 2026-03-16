import { execFile as execFileCallback } from "node:child_process";
import { realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { TwinSourceUnavailableError } from "./errors";

const execFile = promisify(execFileCallback);

export type TwinResolvedRepositorySource = {
  matchedVia: "configured_source_repo_root" | "process_cwd_repo_root";
  remoteUrl: string;
  repoFullName: string;
  repoRoot: string;
};

export interface TwinRepositorySourceResolver {
  resolveRepositorySource(
    repoFullName: string,
  ): Promise<TwinResolvedRepositorySource>;
}

export class LocalTwinRepositorySourceResolver
  implements TwinRepositorySourceResolver
{
  constructor(
    private readonly input: {
      configuredSourceRepoRoot?: string | null;
      processCwd: string;
    },
  ) {}

  async resolveRepositorySource(
    repoFullName: string,
  ): Promise<TwinResolvedRepositorySource> {
    const candidate = this.getCandidate();
    let resolvedRepoRoot: string | null = null;

    try {
      resolvedRepoRoot = await this.resolveRepoRoot(candidate.path);
    } catch {
      throw new TwinSourceUnavailableError(
        repoFullName,
        "source_root_unavailable",
        candidate.path,
        null,
      );
    }

    const remoteUrl = await this.readOriginRemote(repoFullName, candidate.path, resolvedRepoRoot);
    const actualRepoFullName = parseGitHubRepoFullNameFromRemoteUrl(remoteUrl);

    if (!actualRepoFullName) {
      throw new TwinSourceUnavailableError(
        repoFullName,
        "remote_unrecognized",
        candidate.path,
        resolvedRepoRoot,
      );
    }

    if (actualRepoFullName !== repoFullName) {
      throw new TwinSourceUnavailableError(
        repoFullName,
        "repo_mismatch",
        candidate.path,
        resolvedRepoRoot,
        actualRepoFullName,
      );
    }

    return {
      matchedVia: candidate.matchedVia,
      remoteUrl,
      repoFullName: actualRepoFullName,
      repoRoot: resolvedRepoRoot,
    };
  }

  private getCandidate() {
    const configuredSourceRepoRoot = this.input.configuredSourceRepoRoot?.trim();

    if (configuredSourceRepoRoot) {
      return {
        matchedVia: "configured_source_repo_root" as const,
        path: configuredSourceRepoRoot,
      };
    }

    return {
      matchedVia: "process_cwd_repo_root" as const,
      path: this.input.processCwd,
    };
  }

  private async readOriginRemote(
    repoFullName: string,
    sourcePath: string,
    repoRoot: string,
  ) {
    try {
      const { stdout } = await execFile(
        "git",
        ["remote", "get-url", "origin"],
        {
          cwd: repoRoot,
        },
      );
      const remoteUrl = stdout.trim();

      if (!remoteUrl) {
        throw new Error("empty remote");
      }

      return remoteUrl;
    } catch {
      throw new TwinSourceUnavailableError(
        repoFullName,
        "remote_unavailable",
        sourcePath,
        repoRoot,
      );
    }
  }

  private async resolveRepoRoot(candidatePath: string) {
    const cwd = resolve(candidatePath);
    const { stdout } = await execFile(
      "git",
      ["rev-parse", "--show-toplevel"],
      {
        cwd,
      },
    );
    const repoRoot = stdout.trim();

    if (!repoRoot) {
      throw new Error("Git repo root resolution returned empty output");
    }

    return realpath(repoRoot);
  }
}

export function parseGitHubRepoFullNameFromRemoteUrl(remoteUrl: string) {
  const trimmed = remoteUrl.trim();
  const scpLikeMatch = trimmed.match(/^git@github\.com:(?<path>.+)$/i);

  if (scpLikeMatch?.groups?.path) {
    return normalizeGitHubRepoPath(scpLikeMatch.groups.path);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return null;
  }

  if (!["github.com", "www.github.com"].includes(parsedUrl.hostname)) {
    return null;
  }

  return normalizeGitHubRepoPath(parsedUrl.pathname);
}

function normalizeGitHubRepoPath(pathname: string) {
  const normalizedPath = pathname.replace(/^\/+/, "").replace(/\.git$/i, "");
  const segments = normalizedPath
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length !== 2) {
    return null;
  }

  return `${segments[0]}/${segments[1]}`;
}
