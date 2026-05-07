import {
  TEXT_PDF_ADAPTER_NAME,
  TEXT_PDF_ADAPTER_VERSION,
  type EvidenceIndexCoverageStatus,
  type EvidenceIndexExtractionMethod,
  type EvidenceIndexFreshnessPosture,
  type EvidenceIndexLimitationPosture,
  type EvidenceIndexSourceDocument,
  type PrecisionAdapterProvenance,
  type PrecisionSourceAnchor,
  type TextPdfAdapterFailureCode,
} from "@pocket-cto/domain";
import { buildLimitation, dedupeLimitations } from "../../limitations";
import { buildFailureLimitation, failureFor } from "./boundaries";
import type { TextPdfAdapterSourceInput } from "./types";

export function buildSupportedSourceDocument(input: {
  generatedAt: string;
  sourceInput: TextPdfAdapterSourceInput;
}) {
  const freshness = buildFreshness({
    extractedAt: input.generatedAt,
    sourceInput: input.sourceInput,
    state: input.sourceInput.freshnessOverride?.state ?? "fresh",
    summary:
      input.sourceInput.freshnessOverride?.summary ??
      "Freshness is derived from the latest stored source snapshot and deterministic text-PDF extraction.",
  });

  return buildSourceDocument({
    coverageStatus: freshness.state === "stale" ? "stale" : "supported",
    extractionMethod: "text_pdf_deterministic",
    freshness,
    limitations: buildBaseLimitations(input.sourceInput),
    sourceInput: input.sourceInput,
  });
}

export function buildFailedSourceDocument(input: {
  failureCode: TextPdfAdapterFailureCode;
  sourceInput: TextPdfAdapterSourceInput;
  summary?: string;
}) {
  const failure = failureFor(input.failureCode);
  const freshness = buildFreshness({
    sourceInput: input.sourceInput,
    state:
      input.failureCode === "missing_source_snapshot" ||
      input.failureCode === "missing_source_file"
        ? "missing"
        : "failed",
    summary: input.summary ?? failure.summary,
  });
  const limitation = buildFailureLimitation({
    code: input.failureCode,
    sourceId: input.sourceInput.source.id,
    summary: input.summary,
  });

  return buildSourceDocument({
    coverageStatus: coverageStatusForFailure(input.failureCode),
    extractionMethod: failure.extractionMethod,
    freshness,
    limitations: dedupeLimitations([
      ...buildBaseLimitations(input.sourceInput),
      limitation,
    ]),
    sourceInput: input.sourceInput,
  });
}

export function buildPrecisionAnchor(input: {
  document: EvidenceIndexSourceDocument;
  idSuffix: string;
  limitationPosture?: EvidenceIndexLimitationPosture[];
  locator: PrecisionSourceAnchor["locator"];
  pageLocator: PrecisionSourceAnchor["pageLocator"];
  textRangeLocator: PrecisionSourceAnchor["textRangeLocator"];
}): PrecisionSourceAnchor {
  return {
    adapterName: TEXT_PDF_ADAPTER_NAME,
    adapterVersion: TEXT_PDF_ADAPTER_VERSION,
    checksumSha256: input.document.checksumSha256,
    companyKey: input.document.companyKey,
    documentRole: input.document.documentRole,
    extractionMethod: input.document.extractionMethod,
    freshness: input.document.freshness,
    id: `${input.document.id}:anchor:${input.idSuffix}`,
    lifecycleStatus: input.document.lifecycleStatus,
    limitations: input.limitationPosture ?? [],
    locator: input.locator,
    mediaType: input.document.mediaType,
    pageLocator: input.pageLocator,
    sourceDocumentId: input.document.id,
    sourceFileId: input.document.sourceFileId,
    sourceId: input.document.sourceId,
    sourceSnapshotId: input.document.sourceSnapshotId,
    storageKind: input.document.storageKind,
    storageRef: input.document.storageRef,
    textRangeLocator: input.textRangeLocator,
  };
}

export function buildAdapterProvenance(input: {
  extractedAt: string;
  parserVersion: string;
}): PrecisionAdapterProvenance {
  return {
    adapterName: TEXT_PDF_ADAPTER_NAME,
    adapterVersion: TEXT_PDF_ADAPTER_VERSION,
    deterministic: true,
    extractedAt: input.extractedAt,
    extractionMethod: "text_pdf_deterministic",
    llmUsed: false,
    localOnly: true,
    ocrUsed: false,
    pageIndexUsed: false,
    parserName: "pdfjs-dist",
    parserVersion: input.parserVersion,
    vectorSearchUsed: false,
  };
}

function buildSourceDocument(input: {
  coverageStatus: EvidenceIndexCoverageStatus;
  extractionMethod: EvidenceIndexExtractionMethod;
  freshness: EvidenceIndexFreshnessPosture;
  limitations: EvidenceIndexLimitationPosture[];
  sourceInput: TextPdfAdapterSourceInput;
}): EvidenceIndexSourceDocument & { coverageStatus: EvidenceIndexCoverageStatus } {
  return {
    capturedAt: input.sourceInput.latestSnapshot?.capturedAt ?? null,
    checksumSha256: input.sourceInput.latestSnapshot?.checksumSha256 ?? null,
    companyKey: input.sourceInput.companyKey,
    coverageStatus: input.coverageStatus,
    documentRole: input.sourceInput.documentRole,
    extractionMethod: input.extractionMethod,
    freshness: input.freshness,
    id: sourceDocumentId(input.sourceInput),
    lifecycleStatus:
      input.coverageStatus === "supported" || input.coverageStatus === "stale"
        ? "current"
        : input.coverageStatus === "missing"
          ? "unsupported"
          : "failed",
    limitations: input.limitations,
    mediaType:
      input.sourceInput.latestSnapshot?.mediaType ??
      input.sourceInput.latestSourceFile?.mediaType ??
      null,
    sourceFileId: input.sourceInput.latestSourceFile?.id ?? null,
    sourceId: input.sourceInput.source.id,
    sourceKind: input.sourceInput.source.kind,
    sourceSnapshotId: input.sourceInput.latestSnapshot?.id ?? null,
    storageKind:
      input.sourceInput.latestSnapshot?.storageKind ??
      input.sourceInput.latestSourceFile?.storageKind ??
      null,
    storageRef:
      input.sourceInput.latestSnapshot?.storageRef ??
      input.sourceInput.latestSourceFile?.storageRef ??
      null,
  };
}

function buildFreshness(input: {
  extractedAt?: string | null;
  sourceInput: TextPdfAdapterSourceInput;
  state: EvidenceIndexFreshnessPosture["state"];
  summary: string;
}): EvidenceIndexFreshnessPosture {
  return {
    checkedAt: input.sourceInput.generatedAt,
    compiledAt: null,
    extractedAt: input.extractedAt ?? null,
    sourceCapturedAt: input.sourceInput.latestSnapshot?.capturedAt ?? null,
    state: input.state,
    summary: input.summary,
  };
}

function buildBaseLimitations(sourceInput: TextPdfAdapterSourceInput) {
  return (sourceInput.limitations ?? []).map((summary) =>
    buildLimitation({
      affectedSourceIds: [sourceInput.source.id],
      code: "not_source_truth",
      severity: "warning",
      summary,
    }),
  );
}

function coverageStatusForFailure(
  code: TextPdfAdapterFailureCode,
): EvidenceIndexCoverageStatus {
  if (code === "missing_source_snapshot" || code === "missing_source_file") {
    return "missing";
  }

  if (code === "unsupported_document_role") return "not_indexed";

  if (
    code === "checksum_mismatch" ||
    code === "malformed_pdf" ||
    code === "extraction_failed"
  ) {
    return "failed";
  }

  return "unsupported";
}

function sourceDocumentId(input: TextPdfAdapterSourceInput) {
  return [
    "text-pdf-source-document",
    input.companyKey,
    input.source.id,
    input.latestSnapshot?.id ?? "missing",
  ].join(":");
}
