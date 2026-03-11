import { hostname } from "node:os";
import { isAbsolute, resolve } from "node:path";
import type { Env } from "@pocket-cto/config";
import type { WorkspaceGitManager } from "./git-manager";

type WorkspaceEnv = Pick<Env, "POCKET_CTO_SOURCE_REPO_ROOT" | "WORKSPACE_ROOT">;

export type WorkspaceServiceConfig = {
  leaseDurationMs: number;
  leaseOwner: string;
  sourceRepoRoot: string;
  workspaceRoot: string;
};

export const defaultWorkspaceLeaseDurationMs = 15 * 60_000;

export async function resolveWorkspaceServiceConfig(input: {
  env: WorkspaceEnv;
  gitManager: Pick<WorkspaceGitManager, "resolveRepoRoot">;
  processCwd: string;
  leaseOwner?: string;
  leaseDurationMs?: number;
}): Promise<WorkspaceServiceConfig> {
  const sourceRepoCandidate =
    normalizeSourceRepoRoot(input.env.POCKET_CTO_SOURCE_REPO_ROOT) ??
    input.processCwd;

  return {
    leaseDurationMs:
      input.leaseDurationMs ?? defaultWorkspaceLeaseDurationMs,
    leaseOwner: input.leaseOwner ?? buildWorkspaceLeaseOwner(),
    sourceRepoRoot: await input.gitManager.resolveRepoRoot(sourceRepoCandidate),
    workspaceRoot: resolve(input.processCwd, input.env.WORKSPACE_ROOT),
  };
}

export function buildWorkspaceLeaseOwner() {
  return `pocket-cto-worker:${hostname()}:${process.pid}`;
}

function normalizeSourceRepoRoot(candidate: string | null | undefined) {
  const trimmed = candidate?.trim();

  if (!trimmed) {
    return null;
  }

  if (!isAbsolute(trimmed)) {
    throw new Error(
      `POCKET_CTO_SOURCE_REPO_ROOT must be absolute, received: ${trimmed}`,
    );
  }

  return resolve(trimmed);
}

