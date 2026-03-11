import type { MissionTaskRecord } from "@pocket-cto/domain";

export type WorkspaceRecord = {
  id: string;
  missionId: string;
  taskId: string;
  repo: string;
  rootPath: string;
  branchName: string | null;
  sandboxMode: string;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceTaskTarget = Pick<
  MissionTaskRecord,
  "id" | "missionId" | "role" | "sequence" | "workspaceId"
>;

export type WorkspaceDefinition = {
  branchName: string;
  repo: string;
  rootPath: string;
};

