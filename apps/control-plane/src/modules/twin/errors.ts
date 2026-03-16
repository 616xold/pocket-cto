export const twinSourceUnavailableReasons = [
  "source_root_unavailable",
  "remote_unavailable",
  "remote_unrecognized",
  "repo_mismatch",
] as const;

export type TwinSourceUnavailableReason =
  (typeof twinSourceUnavailableReasons)[number];

export class TwinSourceUnavailableError extends Error {
  constructor(
    readonly requestedRepoFullName: string,
    readonly reason: TwinSourceUnavailableReason,
    readonly sourcePath: string,
    readonly resolvedRepoRoot: string | null,
    readonly actualRepoFullName: string | null = null,
  ) {
    super(buildMessage(requestedRepoFullName, reason, sourcePath, actualRepoFullName));
    this.name = "TwinSourceUnavailableError";
  }
}

function buildMessage(
  requestedRepoFullName: string,
  reason: TwinSourceUnavailableReason,
  sourcePath: string,
  actualRepoFullName: string | null,
) {
  switch (reason) {
    case "source_root_unavailable":
      return `Twin source repository is unavailable at ${sourcePath}`;
    case "remote_unavailable":
      return `Twin source repository at ${sourcePath} is missing a readable origin remote`;
    case "remote_unrecognized":
      return `Twin source repository at ${sourcePath} does not resolve to a GitHub owner/repo`;
    case "repo_mismatch":
      return `Twin source repository ${actualRepoFullName ?? "unknown"} does not match requested ${requestedRepoFullName}`;
  }
}
