import type { SourceFileRecord } from "@pocket-cto/domain";

const CSV_MEDIA_TYPES = new Set([
  "application/csv",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
]);

export function supportsCsvLikeSource(
  sourceFile: Pick<SourceFileRecord, "mediaType" | "originalFileName">,
) {
  const mediaType = normalizeMediaType(sourceFile.mediaType);
  const fileExtension = getFileExtension(sourceFile.originalFileName);
  return CSV_MEDIA_TYPES.has(mediaType) || fileExtension === "csv";
}

export function decodeCsvText(body: Buffer) {
  return new TextDecoder("utf-8").decode(body).replace(/^\uFEFF/u, "");
}

export function parseCsvRows(text: string) {
  if (text.length === 0) {
    return [] as string[][];
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === undefined) {
      break;
    }

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          currentField += '"';
          index += 1;
          continue;
        }

        inQuotes = false;
        continue;
      }

      currentField += character;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += character;
  }

  if (inQuotes) {
    throw new Error("CSV ended while a quoted field was still open.");
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

export function buildHeaderLookup(header: string[]) {
  return new Map(header.map((value, index) => [normalizeHeader(value), index]));
}

export function getOptionalHeaderIndex(
  headerLookup: Map<string, number>,
  candidateHeaders: string[],
) {
  for (const candidate of candidateHeaders) {
    const index = headerLookup.get(candidate);

    if (index !== undefined) {
      return index;
    }
  }

  return null;
}

export function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot < 0 || lastDot === fileName.length - 1
    ? null
    : fileName.slice(lastDot + 1).toLowerCase();
}

function normalizeMediaType(mediaType: string) {
  return (
    mediaType.split(";")[0]?.trim().toLowerCase() ??
    mediaType.trim().toLowerCase()
  );
}
