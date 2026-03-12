import type {
  ApprovalKind,
  ApprovalRecord,
  ApprovalStatus,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";

export type CreateApprovalInput = {
  kind: ApprovalKind;
  missionId: string;
  payload: Record<string, unknown>;
  requestedBy: string;
  status?: ApprovalStatus;
  taskId: string | null;
};

export type UpdateApprovalInput = {
  approvalId: string;
  payload: Record<string, unknown>;
  rationale?: string | null;
  resolvedBy?: string | null;
  status: ApprovalStatus;
};

export interface ApprovalRepository {
  createApproval(
    input: CreateApprovalInput,
    session?: PersistenceSession,
  ): Promise<ApprovalRecord>;

  getApprovalById(
    approvalId: string,
    session?: PersistenceSession,
  ): Promise<ApprovalRecord | null>;

  countPendingApprovalsByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ): Promise<number>;

  listPendingApprovalsByTaskId(
    taskId: string,
    session?: PersistenceSession,
  ): Promise<ApprovalRecord[]>;

  updateApproval(
    input: UpdateApprovalInput,
    session?: PersistenceSession,
  ): Promise<ApprovalRecord>;
}

export class InMemoryApprovalRepository implements ApprovalRepository {
  private readonly approvals = new Map<string, ApprovalRecord>();

  async createApproval(input: CreateApprovalInput) {
    const now = new Date().toISOString();
    const approval: ApprovalRecord = {
      id: crypto.randomUUID(),
      kind: input.kind,
      missionId: input.missionId,
      payload: input.payload,
      rationale: null,
      requestedBy: input.requestedBy,
      resolvedBy: null,
      status: input.status ?? "pending",
      taskId: input.taskId,
      createdAt: now,
      updatedAt: now,
    };

    this.approvals.set(approval.id, approval);
    return approval;
  }

  async getApprovalById(approvalId: string) {
    return this.approvals.get(approvalId) ?? null;
  }

  async countPendingApprovalsByMissionId(missionId: string) {
    return [...this.approvals.values()].filter(
      (approval) =>
        approval.missionId === missionId && approval.status === "pending",
    ).length;
  }

  async listPendingApprovalsByTaskId(taskId: string) {
    return [...this.approvals.values()].filter(
      (approval) => approval.taskId === taskId && approval.status === "pending",
    );
  }

  async updateApproval(input: UpdateApprovalInput) {
    const existingApproval = this.approvals.get(input.approvalId);

    if (!existingApproval) {
      throw new Error(`Approval ${input.approvalId} not found`);
    }

    const updatedApproval: ApprovalRecord = {
      ...existingApproval,
      payload: input.payload,
      rationale: input.rationale ?? existingApproval.rationale,
      resolvedBy: input.resolvedBy ?? existingApproval.resolvedBy,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };

    this.approvals.set(updatedApproval.id, updatedApproval);
    return updatedApproval;
  }
}
