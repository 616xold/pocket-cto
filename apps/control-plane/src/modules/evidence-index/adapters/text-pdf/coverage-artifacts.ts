import {
  SourceCoverageMatrixSchema,
  type EvidenceIndexExtractionMethod,
  type PrecisionDocumentMap,
} from "@pocket-cto/domain";
import {
  buildPrecisionCapabilityBoundaries,
  TEXT_PDF_UNSUPPORTED_METHODS,
} from "./boundaries";

export function buildTextPdfCoverageMatrix(documentMap: PrecisionDocumentMap) {
  return SourceCoverageMatrixSchema.parse({
    capabilityBoundaries: buildPrecisionCapabilityBoundaries({
      freshness: documentMap.sourceDocument.freshness,
      sourceId: documentMap.sourceDocument.sourceId,
    }).flatMap((boundary) => boundary.limitations),
    companyKey: documentMap.companyKey,
    entries: [
      {
        coverageStatus: documentMap.coverageStatus,
        documentRole: documentMap.sourceDocument.documentRole,
        freshness: documentMap.sourceDocument.freshness,
        limitations: documentMap.limitations,
        mediaType: documentMap.sourceDocument.mediaType,
        sourceFileId: documentMap.sourceDocument.sourceFileId,
        sourceId: documentMap.sourceDocument.sourceId,
        sourceKind: documentMap.sourceDocument.sourceKind,
        sourceSnapshotId: documentMap.sourceDocument.sourceSnapshotId,
        supportedMethods:
          documentMap.coverageStatus === "supported" ||
          documentMap.coverageStatus === "stale"
            ? ["source_metadata", "text_pdf_deterministic"]
            : [],
        unsupportedMethods:
          documentMap.coverageStatus === "supported" ||
          documentMap.coverageStatus === "stale"
            ? TEXT_PDF_UNSUPPORTED_METHODS
            : dedupeMethods([
                documentMap.extractionMethod,
                ...TEXT_PDF_UNSUPPORTED_METHODS,
              ]),
      },
    ],
    generatedAt: documentMap.sourceDocument.freshness.checkedAt,
  });
}

function dedupeMethods(methods: EvidenceIndexExtractionMethod[]) {
  return [...new Set(methods)];
}
