import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getSourceDetail = vi.fn();
const getSourceFileList = vi.fn();
const getSourceIngestRunList = vi.fn();

vi.mock("../../../lib/api", () => ({
  getSourceDetail,
  getSourceFileList,
  getSourceIngestRunList,
}));

vi.mock("../../../components/source-file-upload-form", () => ({
  SourceFileUploadForm() {
    return <div>source-file-upload-form</div>;
  },
}));

vi.mock("../../../components/source-file-list", () => ({
  SourceFileList(props: {
    files: Array<{ originalFileName: string }>;
  }) {
    return (
      <div>
        {props.files.map((file) => (
          <article key={file.originalFileName}>{file.originalFileName}</article>
        ))}
      </div>
    );
  },
}));

vi.mock("../../../components/source-ingest-run-list", () => ({
  SourceIngestRunList(props: {
    runs: Array<{ fileName: string }>;
  }) {
    return (
      <div>
        {props.runs.map((run) => (
          <article key={run.fileName}>{run.fileName}</article>
        ))}
      </div>
    );
  },
}));

describe("SourceDetailPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders source summary, file ledger, and ingest history", async () => {
    getSourceDetail.mockResolvedValue({
      source: {
        createdAt: "2026-04-09T09:00:00.000Z",
        createdBy: "finance-operator",
        description: "Monthly cash flow workbook.",
        id: "11111111-1111-4111-8111-111111111111",
        kind: "spreadsheet",
        name: "Cash flow workbook",
        originKind: "manual",
        updatedAt: "2026-04-09T09:05:00.000Z",
      },
      snapshots: [
        {
          capturedAt: "2026-04-09T09:05:00.000Z",
          checksumSha256:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          createdAt: "2026-04-09T09:05:00.000Z",
          id: "22222222-2222-4222-8222-222222222222",
          ingestErrorSummary: null,
          ingestStatus: "ready",
          mediaType: "text/csv",
          originalFileName: "cash-flow.csv",
          sizeBytes: 512,
          sourceId: "11111111-1111-4111-8111-111111111111",
          storageKind: "object_store",
          storageRef: "sources/cash-flow.csv",
          updatedAt: "2026-04-09T09:10:00.000Z",
          version: 2,
        },
      ],
    });
    getSourceFileList.mockResolvedValue({
      fileCount: 1,
      sourceId: "11111111-1111-4111-8111-111111111111",
      files: [
        {
          capturedAt: "2026-04-09T09:05:00.000Z",
          checksumSha256:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          createdAt: "2026-04-09T09:05:00.000Z",
          createdBy: "finance-operator",
          id: "33333333-3333-4333-8333-333333333333",
          mediaType: "text/csv",
          originalFileName: "cash-flow.csv",
          sizeBytes: 512,
          snapshotVersion: 2,
          sourceId: "11111111-1111-4111-8111-111111111111",
          sourceSnapshotId: "22222222-2222-4222-8222-222222222222",
          storageKind: "object_store",
          storageRef: "sources/cash-flow.csv",
        },
      ],
    });
    getSourceIngestRunList.mockResolvedValue({
      ingestRuns: [
        {
          completedAt: "2026-04-09T09:12:00.000Z",
          createdAt: "2026-04-09T09:12:00.000Z",
          errorCount: 0,
          errors: [],
          id: "44444444-4444-4444-8444-444444444444",
          inputChecksumSha256:
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          parserSelection: {
            fileExtension: ".csv",
            matchedBy: "file_extension",
            mediaType: "text/csv",
            parserKey: "csv_tabular",
            sourceKind: "spreadsheet",
          },
          receiptSummary: {
            kind: "csv_tabular",
            columnCount: 2,
            header: ["month", "cash"],
            rowCount: 3,
            sampleRows: [["Jan", "100"]],
          },
          sourceFileId: "33333333-3333-4333-8333-333333333333",
          sourceId: "11111111-1111-4111-8111-111111111111",
          sourceSnapshotId: "22222222-2222-4222-8222-222222222222",
          startedAt: "2026-04-09T09:11:00.000Z",
          status: "ready",
          storageKind: "object_store",
          storageRef: "sources/cash-flow.csv",
          updatedAt: "2026-04-09T09:12:00.000Z",
          warningCount: 0,
          warnings: [],
        },
      ],
      runCount: 1,
      sourceFileId: "33333333-3333-4333-8333-333333333333",
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(
      await mod.default({
        params: Promise.resolve({
          sourceId: "11111111-1111-4111-8111-111111111111",
        }),
      }),
    );

    expect(getSourceDetail).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(getSourceFileList).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(getSourceIngestRunList).toHaveBeenCalledWith(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(html).toContain("Cash flow workbook");
    expect(html).toContain("source-file-upload-form");
    expect(html).toContain("cash-flow.csv");
    expect(html).toContain("Deterministic receipt history");
  });
});
