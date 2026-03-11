import { hostname } from "node:os";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
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
  const sourceRepoRoot = await input.gitManager.resolveRepoRoot(sourceRepoCandidate);
  const workspaceRoot = resolveWorkspaceRoot({
    configuredWorkspaceRoot: input.env.WORKSPACE_ROOT,
    sourceRepoRoot,
  });

  return {
    leaseDurationMs:
      input.leaseDurationMs ?? defaultWorkspaceLeaseDurationMs,
    leaseOwner: input.leaseOwner ?? buildWorkspaceLeaseOwner(),
    sourceRepoRoot,
    workspaceRoot,
  };
}

export function buildWorkspaceLeaseOwner() {
  return `pocket-cto-worker:${hostname()}:${process.pid}`;
}

export function buildDefaultWorkspaceRoot(sourceRepoRoot: string) {
  const normalizedSourceRepoRoot = resolve(sourceRepoRoot);

  return resolve(
    dirname(normalizedSourceRepoRoot),
    `${basename(normalizedSourceRepoRoot)}.workspaces`,
  );
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

function resolveWorkspaceRoot(input: {
  configuredWorkspaceRoot: string | null | undefined;
  sourceRepoRoot: string;
}) {
  const sourceRepoRoot = resolve(input.sourceRepoRoot);
  const configuredWorkspaceRoot = input.configuredWorkspaceRoot?.trim() ?? "";
  const workspaceRoot = configuredWorkspaceRoot
    ? resolveConfiguredWorkspaceRoot(configuredWorkspaceRoot, sourceRepoRoot)
    : buildDefaultWorkspaceRoot(sourceRepoRoot);

  assertWorkspaceRootSafe({
    sourceRepoRoot,
    workspaceRoot,
  });

  return workspaceRoot;
}

function resolveConfiguredWorkspaceRoot(
  configuredWorkspaceRoot: string,
  sourceRepoRoot: string,
) {
  if (isAbsolute(configuredWorkspaceRoot)) {
    return resolve(configuredWorkspaceRoot);
  }

  return resolve(dirname(sourceRepoRoot), configuredWorkspaceRoot);
}

function assertWorkspaceRootSafe(input: {
  sourceRepoRoot: string;
  workspaceRoot: string;
}) {
  const sourceRepoRoot = resolve(input.sourceRepoRoot);
  const workspaceRoot = resolve(input.workspaceRoot);
  const recommendedWorkspaceRoot = buildDefaultWorkspaceRoot(sourceRepoRoot);
  const relativePath = relative(sourceRepoRoot, workspaceRoot);

  if (relativePath === "") {
    throw new Error(
      [
        `Resolved workspace root ${workspaceRoot} must not equal source repo root ${sourceRepoRoot}.`,
        `Set WORKSPACE_ROOT to a path outside ${sourceRepoRoot} or leave it blank to use ${recommendedWorkspaceRoot}.`,
      ].join(" "),
    );
  }

  if (!relativePath.startsWith("..") && !isAbsolute(relativePath)) {
    throw new Error(
      [
        `Resolved workspace root ${workspaceRoot} must sit outside source repo root ${sourceRepoRoot}.`,
        `Nested workspace roots are not supported for local dogfooding.`,
        `Set WORKSPACE_ROOT to a path outside ${sourceRepoRoot} or leave it blank to use ${recommendedWorkspaceRoot}.`,
      ].join(" "),
    );
  }
}
