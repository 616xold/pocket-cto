import { describe, expect, it } from "vitest";
import { InMemorySourceRepository } from "./repository";
import { SourceRegistryService } from "./service";

describe("SourceRegistryService", () => {
  it("creates a source with an initial immutable snapshot and lists it with summary metadata", async () => {
    const repository = new InMemorySourceRepository();
    const service = new SourceRegistryService(
      repository,
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
});
