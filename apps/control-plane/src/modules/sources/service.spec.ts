import { describe, expect, it } from "vitest";
import { InMemorySourceRepository } from "./repository";
import { SourceRegistryService } from "./service";
import { InMemorySourceFileStorage } from "./storage";

describe("SourceRegistryService", () => {
  it("creates a source with an initial immutable snapshot and lists it with summary metadata", async () => {
    const repository = new InMemorySourceRepository();
    const storage = new InMemorySourceFileStorage();
    const service = new SourceRegistryService(
      repository,
      storage,
      () => new Date("2026-04-06T23:30:00.000Z"),
    );

    const created = await service.createSource({
      kind: "document",
      name: "March bank statement",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "march-bank-statement.pdf",
        mediaType: "application/pdf",
        sizeBytes: 2048,
        checksumSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        storageKind: "external_url",
        storageRef: "https://example.com/statements/march.pdf",
        ingestStatus: "registered",
      },
    });

    expect(created.source).toMatchObject({
      kind: "document",
      originKind: "manual",
      name: "March bank statement",
      createdBy: "finance-operator",
    });
    expect(created.snapshots).toMatchObject([
      {
        version: 1,
        originalFileName: "march-bank-statement.pdf",
        mediaType: "application/pdf",
        sizeBytes: 2048,
        checksumSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        storageKind: "external_url",
        storageRef: "https://example.com/statements/march.pdf",
        capturedAt: "2026-04-06T23:30:00.000Z",
        ingestStatus: "registered",
      },
    ]);

    const listed = await service.listSources({ limit: 20 });
    const reloaded = await service.getSource(created.source.id);

    expect(listed).toMatchObject({
      limit: 20,
      sourceCount: 1,
      sources: [
        {
          id: created.source.id,
          snapshotCount: 1,
          latestSnapshot: {
            id: created.snapshots[0]?.id,
            version: 1,
          },
        },
      ],
    });
    expect(reloaded).toMatchObject({
      source: {
        id: created.source.id,
        kind: "document",
        originKind: "manual",
        name: "March bank statement",
        createdBy: "finance-operator",
      },
      snapshots: [
        {
          id: created.snapshots[0]?.id,
          version: 1,
        },
      ],
    });
  });

  it("registers a raw source file, stores its bytes, and mirrors the next snapshot summary", async () => {
    const repository = new InMemorySourceRepository();
    const storage = new InMemorySourceFileStorage();
    const service = new SourceRegistryService(
      repository,
      storage,
      () => new Date("2026-04-08T01:10:00.000Z"),
    );
    const created = await service.createSource({
      kind: "document",
      name: "April board deck",
      createdBy: "finance-operator",
      originKind: "manual",
      snapshot: {
        originalFileName: "april-board-deck-link.txt",
        mediaType: "text/plain",
        sizeBytes: 20,
        checksumSha256:
          "1111111111111111111111111111111111111111111111111111111111111111",
        storageKind: "external_url",
        storageRef: "https://example.com/board/april.txt",
        ingestStatus: "registered",
      },
    });

    const registered = await service.registerSourceFile(
      created.source.id,
      {
        originalFileName: "april-board-deck.pdf",
        mediaType: "application/pdf",
        createdBy: "finance-operator",
        capturedAt: "2026-04-07T23:59:00.000Z",
      },
      Buffer.from("april board deck pdf bytes"),
    );

    expect(registered).toMatchObject({
      sourceFile: {
        sourceId: created.source.id,
        originalFileName: "april-board-deck.pdf",
        mediaType: "application/pdf",
        sizeBytes: 26,
        createdBy: "finance-operator",
        storageKind: "object_store",
        capturedAt: "2026-04-07T23:59:00.000Z",
      },
      snapshot: {
        sourceId: created.source.id,
        version: 2,
        originalFileName: "april-board-deck.pdf",
        mediaType: "application/pdf",
        sizeBytes: 26,
        storageKind: "object_store",
        capturedAt: "2026-04-07T23:59:00.000Z",
      },
      provenanceRecords: [
        {
          sourceId: created.source.id,
          kind: "source_file_registered",
          recordedBy: "finance-operator",
          recordedAt: "2026-04-08T01:10:00.000Z",
        },
      ],
    });
    expect(storage.read(registered.sourceFile.storageRef)?.toString()).toBe(
      "april board deck pdf bytes",
    );

    const listedFiles = await service.listSourceFiles(created.source.id);
    const reloadedFile = await service.getSourceFile(registered.sourceFile.id);
    const reloadedSource = await service.getSource(created.source.id);

    expect(listedFiles).toMatchObject({
      sourceId: created.source.id,
      fileCount: 1,
      files: [
        {
          id: registered.sourceFile.id,
          snapshotVersion: 2,
        },
      ],
    });
    expect(reloadedFile).toMatchObject({
      sourceFile: {
        id: registered.sourceFile.id,
      },
      snapshot: {
        id: registered.snapshot.id,
        version: 2,
      },
      provenanceRecords: [
        {
          sourceFileId: registered.sourceFile.id,
        },
      ],
    });
    expect(reloadedSource.snapshots.map((snapshot) => snapshot.version)).toEqual([
      2,
      1,
    ]);
  });
});
