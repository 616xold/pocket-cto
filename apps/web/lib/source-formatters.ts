import type {
  SourceIngestReceiptSummary,
  SourceIngestRunStatus,
  SourceSnapshotIngestStatus,
} from "@pocket-cto/domain";

type SourceStatus = SourceIngestRunStatus | SourceSnapshotIngestStatus;

export function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function summarizeReceipt(summary: SourceIngestReceiptSummary | null) {
  if (!summary) {
    return "Receipt not available yet.";
  }

  switch (summary.kind) {
    case "csv_tabular":
      return `${summary.rowCount} rows across ${summary.columnCount} columns.`;
    case "markdown_text":
      return `${summary.lineCount} lines with ${summary.headingCount} headings.`;
    case "zip_inventory":
      return `${summary.entryCount} archived entries inventoried.`;
    case "metadata_fallback":
      return summary.note;
  }
}

export function shortenChecksum(checksumSha256: string) {
  return `${checksumSha256.slice(0, 12)}...${checksumSha256.slice(-8)}`;
}

export function readSourceStatusTone(status: SourceStatus) {
  if (status === "ready") {
    return "good" as const;
  }

  if (status === "failed") {
    return "warn" as const;
  }

  return "default" as const;
}
