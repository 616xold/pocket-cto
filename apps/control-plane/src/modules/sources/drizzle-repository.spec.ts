import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleSourceRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleSourceRepository", () => {
  const repository = new DrizzleSourceRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("persists sources and immutable snapshots with summary-friendly queries", async () => {
    const source = await repository.createSource({
      kind: "spreadsheet",
      originKind: "manual",
      name: "Cash flow export",
      description: "April weekly cash flow model export",
      createdBy: "finance-operator",
    });

    const snapshot = await repository.createSnapshot({
      sourceId: source.id,
      version: 1,
      originalFileName: "cash-flow.xlsx",
      mediaType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: 8192,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "local_path",
      storageRef: "/tmp/cash-flow.xlsx",
      capturedAt: "2026-04-06T23:40:00.000Z",
      ingestStatus: "registered",
    });

    const [listedSource] = await repository.listSources({ limit: 20 });
    const storedSnapshots = await repository.listSnapshotsBySourceId(source.id);

    expect(listedSource).toMatchObject({
      id: source.id,
      kind: "spreadsheet",
      name: "Cash flow export",
      description: "April weekly cash flow model export",
    });
    expect(storedSnapshots).toMatchObject([
      {
        id: snapshot.id,
        sourceId: source.id,
        version: 1,
        originalFileName: "cash-flow.xlsx",
        storageKind: "local_path",
        storageRef: "/tmp/cash-flow.xlsx",
      },
    ]);
  });
});
