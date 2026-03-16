import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { twinEdges, twinEntities, twinSyncRuns } from "@pocket-cto/db";
import { eq } from "drizzle-orm";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleTwinRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleTwinRepository", () => {
  const repository = new DrizzleTwinRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("upserts one twin entity per repo, kind, and stable key and preserves observedAt or staleAfter round-trips", async () => {
    const run = await repository.startSyncRun({
      repoFullName: "616xold/pocket-cto",
      extractor: "repository_metadata",
      startedAt: "2026-03-16T22:10:00.000Z",
      stats: {
        repositoryCount: 1,
      },
    });

    const created = await repository.upsertEntity({
      repoFullName: "616xold/pocket-cto",
      kind: "service",
      stableKey: "auth-api",
      title: "Auth API",
      summary: "Initial snapshot",
      payload: {
        path: "apps/control-plane",
      },
      observedAt: "2026-03-16T22:11:00.000Z",
      staleAfter: "2026-03-17T22:11:00.000Z",
      sourceRunId: run.id,
    });
    const updated = await repository.upsertEntity({
      repoFullName: "616xold/pocket-cto",
      kind: "service",
      stableKey: "auth-api",
      title: "Auth API",
      summary: "Updated snapshot",
      payload: {
        path: "apps/control-plane",
        ownership: "platform",
      },
      observedAt: "2026-03-16T22:12:00.000Z",
      staleAfter: "2026-03-18T22:12:00.000Z",
      sourceRunId: run.id,
    });

    const listed = await repository.listRepositoryEntities("616xold/pocket-cto");
    const [row] = await db.select().from(twinEntities);

    expect(updated.id).toBe(created.id);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      id: created.id,
      repoFullName: "616xold/pocket-cto",
      kind: "service",
      stableKey: "auth-api",
      summary: "Updated snapshot",
      observedAt: "2026-03-16T22:12:00.000Z",
      staleAfter: "2026-03-18T22:12:00.000Z",
      sourceRunId: run.id,
      payload: {
        path: "apps/control-plane",
        ownership: "platform",
      },
    });
    expect(row).toMatchObject({
      id: created.id,
      repoFullName: "616xold/pocket-cto",
      kind: "service",
      stableKey: "auth-api",
      repo: "616xold/pocket-cto",
      type: "service",
      key: "auth-api",
      sourceRunId: run.id,
    });
    expect(row?.observedAt.toISOString()).toBe("2026-03-16T22:12:00.000Z");
    expect(row?.staleAfter?.toISOString()).toBe("2026-03-18T22:12:00.000Z");
  });

  it("upserts one twin edge per repo, kind, and endpoint pair and keeps edges repo-scoped", async () => {
    const run = await repository.startSyncRun({
      repoFullName: "616xold/pocket-cto",
      extractor: "relationship_sync",
      startedAt: "2026-03-16T22:20:00.000Z",
    });
    const fromEntity = await repository.upsertEntity({
      repoFullName: "616xold/pocket-cto",
      kind: "service",
      stableKey: "auth-api",
      title: "Auth API",
      observedAt: "2026-03-16T22:20:30.000Z",
    });
    const toEntity = await repository.upsertEntity({
      repoFullName: "616xold/pocket-cto",
      kind: "package",
      stableKey: "packages/domain",
      title: "@pocket-cto/domain",
      observedAt: "2026-03-16T22:20:45.000Z",
    });
    await repository.upsertEntity({
      repoFullName: "616xold/pocket-cto-web",
      kind: "service",
      stableKey: "web-app",
      title: "Web App",
      observedAt: "2026-03-16T22:20:50.000Z",
    });

    const created = await repository.upsertEdge({
      repoFullName: "616xold/pocket-cto",
      kind: "depends_on",
      fromEntityId: fromEntity.id,
      toEntityId: toEntity.id,
      payload: {
        reason: "imports",
      },
      observedAt: "2026-03-16T22:21:00.000Z",
      sourceRunId: run.id,
    });
    const updated = await repository.upsertEdge({
      repoFullName: "616xold/pocket-cto",
      kind: "depends_on",
      fromEntityId: fromEntity.id,
      toEntityId: toEntity.id,
      payload: {
        reason: "imports",
        strength: "hard",
      },
      observedAt: "2026-03-16T22:22:00.000Z",
      sourceRunId: run.id,
    });

    const repoEdges = await repository.listRepositoryEdges("616xold/pocket-cto");
    const otherRepoEdges = await repository.listRepositoryEdges(
      "616xold/pocket-cto-web",
    );
    const [row] = await db.select().from(twinEdges);

    expect(updated.id).toBe(created.id);
    expect(repoEdges).toHaveLength(1);
    expect(otherRepoEdges).toHaveLength(0);
    expect(repoEdges[0]).toMatchObject({
      id: created.id,
      repoFullName: "616xold/pocket-cto",
      kind: "depends_on",
      fromEntityId: fromEntity.id,
      toEntityId: toEntity.id,
      observedAt: "2026-03-16T22:22:00.000Z",
      sourceRunId: run.id,
      payload: {
        reason: "imports",
        strength: "hard",
      },
    });
    expect(row).toMatchObject({
      id: created.id,
      repoFullName: "616xold/pocket-cto",
      kind: "depends_on",
      relationType: "depends_on",
      sourceRunId: run.id,
    });
  });

  it("records sync-run start and finish state and lists runs newest-first", async () => {
    const older = await repository.startSyncRun({
      repoFullName: "616xold/pocket-cto",
      extractor: "repository_metadata",
      startedAt: "2026-03-16T21:59:00.000Z",
      stats: {
        entityCount: 1,
      },
    });
    const newer = await repository.startSyncRun({
      repoFullName: "616xold/pocket-cto",
      extractor: "ownership_metadata",
      startedAt: "2026-03-16T22:30:00.000Z",
      stats: {
        entityCount: 2,
      },
    });

    const finished = await repository.finishSyncRun({
      runId: newer.id,
      status: "failed",
      completedAt: "2026-03-16T22:31:00.000Z",
      stats: {
        entityCount: 2,
        edgeCount: 1,
      },
      errorSummary: "Synthetic extractor failure",
    });

    const runs = await repository.listRepositoryRuns("616xold/pocket-cto");
    const [newerRow] = await db
      .select()
      .from(twinSyncRuns)
      .where(eq(twinSyncRuns.id, newer.id));

    expect(finished).toMatchObject({
      id: newer.id,
      status: "failed",
      completedAt: "2026-03-16T22:31:00.000Z",
      errorSummary: "Synthetic extractor failure",
      stats: {
        entityCount: 2,
        edgeCount: 1,
      },
    });
    expect(runs.map((run) => run.id)).toEqual([newer.id, older.id]);
    expect(newerRow?.completedAt?.toISOString()).toBe(
      "2026-03-16T22:31:00.000Z",
    );
  });
});
