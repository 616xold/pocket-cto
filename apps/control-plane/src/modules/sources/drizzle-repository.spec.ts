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

  it("persists source files and provenance records linked to immutable snapshots", async () => {
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
    const sourceFile = await repository.createSourceFile({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      originalFileName: "cash-flow.xlsx",
      mediaType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sizeBytes: 8192,
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      storageKind: "object_store",
      storageRef:
        "s3://pocket-cto-artifacts/sources/source-id/checksum/cash-flow.xlsx",
      createdBy: "finance-operator",
      capturedAt: "2026-04-06T23:40:00.000Z",
    });
    const provenanceRecord = await repository.createProvenanceRecord({
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      kind: "source_file_registered",
      recordedBy: "finance-operator",
      recordedAt: "2026-04-06T23:40:05.000Z",
    });

    const [listedSource] = await repository.listSources({ limit: 20 });
    const storedSnapshots = await repository.listSnapshotsBySourceId(source.id);
    const [storedSourceFile] = await repository.listSourceFilesBySourceId(
      source.id,
    );
    const [storedProvenanceRecord] =
      await repository.listProvenanceRecordsBySourceFileId(sourceFile.id);
    const latestSnapshotVersion = await repository.getLatestSnapshotVersion(
      source.id,
    );

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
    expect(storedSourceFile).toMatchObject({
      id: sourceFile.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      storageKind: "object_store",
      createdBy: "finance-operator",
    });
    expect(storedProvenanceRecord).toMatchObject({
      id: provenanceRecord.id,
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceFileId: sourceFile.id,
      kind: "source_file_registered",
      recordedBy: "finance-operator",
    });
    expect(latestSnapshotVersion).toBe(1);
  });
});
