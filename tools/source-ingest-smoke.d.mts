import type { Buffer } from "node:buffer";

export type SourceSmokeMode = "registry" | "ingest";

export type SourceSmokeKind =
  | "document"
  | "spreadsheet"
  | "dataset"
  | "image"
  | "archive"
  | "other";

export interface SourceSmokeOptions {
  createdBy: string;
  mode: SourceSmokeMode;
  sourceKind: SourceSmokeKind;
  sourceName: string | null;
}

export interface SourceSmokeFixture {
  createdBy: string;
  mode: SourceSmokeMode;
  runTag: string;
  sourceKind: SourceSmokeKind;
  sourceName: string;
  seed: {
    body: Buffer;
    mediaType: string;
    originalFileName: string;
  };
  upload: {
    body: Buffer;
    mediaType: string;
    originalFileName: string;
  };
}

export function parseSourceSmokeArgs(argv: string[]): SourceSmokeOptions;
export function buildSourceSmokeFixture(
  input: SourceSmokeOptions & { runTag: string },
): SourceSmokeFixture;
