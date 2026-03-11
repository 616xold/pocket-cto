import type { workspaces } from "@pocket-cto/db";
import type { WorkspaceRecord } from "./types";

type WorkspaceRow = typeof workspaces.$inferSelect;

export function mapWorkspaceRow(row: WorkspaceRow): WorkspaceRecord {
  return {
    id: row.id,
    missionId: row.missionId,
    taskId: row.taskId,
    repo: row.repo,
    rootPath: row.rootPath,
    branchName: row.branchName,
    sandboxMode: row.sandboxMode,
    leaseOwner: row.leaseOwner,
    leaseExpiresAt: row.leaseExpiresAt,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

