import type { TextPdfAdapterFailureCode } from "@pocket-cto/domain";
import type { TextPdfExtraction, TextPdfPageLine } from "./types";

export function detectPreExtractionFailure(input: {
  bytes: Buffer | Uint8Array | null;
  documentRole: string | null;
  expectedChecksum: string | null;
  mediaType: string | null;
  sourceFileId: string | null;
  sourceSnapshotId: string | null;
}) {
  if (input.documentRole !== "policy_document") {
    return "unsupported_document_role" satisfies TextPdfAdapterFailureCode;
  }

  if (input.mediaType !== "application/pdf") {
    return "unsupported_media_type" satisfies TextPdfAdapterFailureCode;
  }

  if (!input.sourceSnapshotId) {
    return "missing_source_snapshot" satisfies TextPdfAdapterFailureCode;
  }

  if (!input.sourceFileId || !input.bytes) {
    return "missing_source_file" satisfies TextPdfAdapterFailureCode;
  }

  if (hasEncryptedPdfMarker(input.bytes)) {
    return "encrypted_pdf" satisfies TextPdfAdapterFailureCode;
  }

  if (!input.expectedChecksum) {
    return "checksum_mismatch" satisfies TextPdfAdapterFailureCode;
  }

  return null;
}

export function detectPostExtractionFailure(input: {
  bytes: Buffer | Uint8Array;
  extraction: TextPdfExtraction;
}): TextPdfAdapterFailureCode | null {
  const lines = input.extraction.pages.flatMap((page) => page.lines);
  const fullText = lines.map((line) => line.text).join("\n");
  const hasText = fullText.trim().length > 0;
  const hasImageMarker = hasPdfImageMarker(input.bytes);

  if (!hasText && hasImageMarker) return "scan_or_image_only_pdf";
  if (!hasText) return "no_embedded_text_layer";
  if (hasImageMarker) return "figure_graphic_chart_region";
  if (lines.some(isTableLikeLine)) return "table_like_region";
  if (hasRawAmbiguousSpacing(input.bytes)) return "ambiguous_layout";
  if (hasAmbiguousLayout(lines)) return "ambiguous_layout";
  if (hasNumericAmbiguity(fullText)) return "numeric_ambiguity";

  return null;
}

export function mapExtractionError(error: Error): TextPdfAdapterFailureCode {
  if (/password|encrypted/i.test(`${error.name} ${error.message}`)) {
    return "encrypted_pdf";
  }

  if (/invalid|malformed|missing|xref|trailer|pdf/i.test(error.message)) {
    return "malformed_pdf";
  }

  return "extraction_failed";
}

function hasEncryptedPdfMarker(bytes: Buffer | Uint8Array) {
  return asciiPreview(bytes).includes("/Encrypt");
}

function hasPdfImageMarker(bytes: Buffer | Uint8Array) {
  const text = asciiPreview(bytes);
  return text.includes("/Subtype /Image") || text.includes("/Image");
}

function isTableLikeLine(line: TextPdfPageLine) {
  const text = line.text.trim();
  return (
    /^\|.+\|$/u.test(text) ||
    /\b(?:amount|metric|threshold|value)\b.+\b(?:amount|metric|threshold|value)\b/iu.test(
      text,
    )
  );
}

function hasAmbiguousLayout(lines: TextPdfPageLine[]) {
  return lines.some((line) => /\s{6,}/u.test(line.text));
}

function hasRawAmbiguousSpacing(bytes: Buffer | Uint8Array) {
  return /[A-Za-z]\s{6,}[A-Za-z]/u.test(asciiPreview(bytes));
}

function hasNumericAmbiguity(text: string) {
  return /(?:[$€£]?\d[\d,.]*%?|\d+(?:\.\d+)?x)\b/u.test(text);
}

function asciiPreview(bytes: Buffer | Uint8Array) {
  return Buffer.from(bytes).toString("latin1");
}
