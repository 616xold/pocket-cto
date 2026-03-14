import { and, asc, count, eq } from "drizzle-orm";
import { approvals, type Db } from "@pocket-cto/db";
import type { ApprovalRecord } from "@pocket-cto/domain";
import {
  getDbExecutor as getSessionExecutor,
  type PersistenceSession,
} from "../../lib/persistence";
import type {
  ApprovalRepository,
  CreateApprovalInput,
  UpdateApprovalInput,
} from "./repository";

export class DrizzleApprovalRepository implements ApprovalRepository {
  constructor(private readonly db: Db) {}

  async createApproval(input: CreateApprovalInput, session?: PersistenceSession) {
    const executor = this.getExecutor(session);
    const [createdApproval] = await executor
      .insert(approvals)
      .values({
        kind: input.kind,
        missionId: input.missionId,
        payload: input.payload,
        requestedBy: input.requestedBy,
        status: input.status ?? "pending",
        taskId: input.taskId,
      })
      .returning();

    return mapApprovalRow(
      getRequiredRow(createdApproval, "Approval insert did not return a row"),
    );
  }

  async getApprovalById(
    approvalId: string,
    session?: PersistenceSession,
  ): Promise<ApprovalRecord | null> {
    const executor = this.getExecutor(session);
    const [approval] = await executor
      .select()
      .from(approvals)
      .where(eq(approvals.id, approvalId))
      .limit(1);

    return approval ? mapApprovalRow(approval) : null;
  }

  async countPendingApprovalsByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [result] = await executor
      .select({ count: count() })
      .from(approvals)
      .where(
        and(eq(approvals.missionId, missionId), eq(approvals.status, "pending")),
      );

    return result?.count ?? 0;
  }

  async listApprovalsByMissionId(
    missionId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(approvals)
      .where(eq(approvals.missionId, missionId))
      .orderBy(asc(approvals.createdAt), asc(approvals.id));

    return rows.map(mapApprovalRow);
  }

  async listPendingApprovalsByTaskId(
    taskId: string,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const rows = await executor
      .select()
      .from(approvals)
      .where(and(eq(approvals.taskId, taskId), eq(approvals.status, "pending")));

    return rows.map(mapApprovalRow);
  }

  async updateApproval(
    input: UpdateApprovalInput,
    session?: PersistenceSession,
  ) {
    const executor = this.getExecutor(session);
    const [updatedApproval] = await executor
      .update(approvals)
      .set({
        payload: input.payload,
        rationale: input.rationale ?? null,
        resolvedBy: input.resolvedBy ?? null,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(approvals.id, input.approvalId))
      .returning();

    return mapApprovalRow(
      getRequiredRow(updatedApproval, `Approval ${input.approvalId} was not updated`),
    );
  }

  private getExecutor(session?: PersistenceSession) {
    return getSessionExecutor(session) ?? this.db;
  }
}

function getRequiredRow<T>(row: T | undefined, message: string): T {
  if (!row) {
    throw new Error(message);
  }

  return row;
}

function mapApprovalRow(row: typeof approvals.$inferSelect): ApprovalRecord {
  return {
    id: row.id,
    kind: row.kind,
    missionId: row.missionId,
    payload: asRecord(row.payload),
    rationale: row.rationale ?? null,
    requestedBy: row.requestedBy,
    resolvedBy: row.resolvedBy ?? null,
    status: row.status,
    taskId: row.taskId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
