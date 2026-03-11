import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { missionTasks, missions, workspaces } from "@pocket-cto/db";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleWorkspaceRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleWorkspaceRepository", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("keeps workspaces.task_id and mission_tasks.workspace_id aligned", async () => {
    const missionId = randomUUID();
    const taskId = randomUUID();
    const repository = new DrizzleWorkspaceRepository(db);

    await db.insert(missions).values({
      createdBy: "operator",
      id: missionId,
      objective: "Verify workspace linkage integrity",
      sourceKind: "manual_text",
      spec: {},
      status: "queued",
      title: "Verify workspace linkage integrity",
      type: "build",
    });
    await db.insert(missionTasks).values({
      id: taskId,
      missionId,
      role: "planner",
      sequence: 0,
      status: "claimed",
    });

    const workspace = await repository.createWorkspace({
      branchName: `pocket-cto/${missionId}/0-planner`,
      leaseExpiresAt: "2026-03-11T02:00:00.000Z",
      leaseOwner: "pocket-cto-worker:test:789",
      missionId,
      repo: "/tmp/source-repo",
      rootPath: `/tmp/pocket-cto-workspaces/${missionId}/0-planner`,
      sandboxMode: "read-only",
      taskId,
    });

    await repository.activateWorkspaceLease({
      leaseExpiresAt: "2026-03-11T02:15:00.000Z",
      leaseOwner: "pocket-cto-worker:test:789",
      sandboxMode: "read-only",
      taskId,
      workspaceId: workspace.id,
    });

    const [[taskRow], [workspaceRow]] = await Promise.all([
      db
        .select()
        .from(missionTasks)
        .where(eq(missionTasks.id, taskId))
        .limit(1),
      db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspace.id))
        .limit(1),
    ]);

    expect(workspaceRow).toMatchObject({
      id: workspace.id,
      taskId,
    });
    expect(taskRow).toMatchObject({
      id: taskId,
      workspaceId: workspace.id,
    });
  });
});
