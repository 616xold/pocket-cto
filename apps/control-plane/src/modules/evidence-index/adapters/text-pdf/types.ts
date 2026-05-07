import type {
  CfoWikiDocumentRole,
  EvidenceCard,
  EvidenceClaim,
  EvidenceIndexExtractionMethod,
  EvidenceIndexFreshnessPosture,
  EvidenceIndexLimitationPosture,
  EvidenceIndexWikiRef,
  EvidenceTrace,
  PrecisionDocumentMap,
  PrecisionSourceAnchor,
  SourceCoverageMatrix,
  SourceFileRecord,
  SourceKind,
  SourceRecord,
  SourceSnapshotRecord,
  TextPdfAdapterFailureCode,
} from "@pocket-cto/domain";

export type TextPdfAdapterSourceInput = {
  body: Buffer | Uint8Array | null;
  companyKey: string;
  documentRole: CfoWikiDocumentRole | null;
  freshnessOverride?: EvidenceIndexFreshnessPosture;
  generatedAt: string;
  latestSnapshot: SourceSnapshotRecord | null;
  latestSourceFile: SourceFileRecord | null;
  limitations?: string[];
  source: Pick<SourceRecord, "id" | "kind" | "name"> & {
    kind: SourceKind;
  };
  wikiRefs?: EvidenceIndexWikiRef[];
};

export type TextPdfPageLine = {
  endTextOffset: number;
  lineNumber: number;
  pageNumber: number;
  startTextOffset: number;
  text: string;
};

export type TextPdfPage = {
  lines: TextPdfPageLine[];
  pageNumber: number;
  text: string;
  textItemCount: number;
};

export type TextPdfExtraction = {
  pageCount: number;
  pages: TextPdfPage[];
  parserVersion: string;
};

export type TextPdfFailure = {
  code: TextPdfAdapterFailureCode;
  extractionMethod: EvidenceIndexExtractionMethod;
  limitationCode: EvidenceIndexLimitationPosture["code"];
  summary: string;
};

export type TextPdfRuntimeBoundary = {
  readOnlyDerived: true;
  rawSourcesAuthoritative: true;
  financeTwinAuthoritativeForStructuredFacts: true;
  cfoWikiCompiledDerived: true;
  llmUsed: false;
  runtimeCodexUsed: false;
  vectorSearchUsed: false;
  pageIndexUsed: false;
  ocrUsed: false;
  sourceMutationCreated: false;
  financeWriteCreated: false;
  providerCallCreated: false;
  certificationCreated: false;
  deliveryCreated: false;
  autonomousActionCreated: false;
};

export type BuiltTextPdfArtifacts = {
  documentMap: PrecisionDocumentMap;
  evidenceCards: EvidenceCard[];
  evidenceClaims: EvidenceClaim[];
  evidenceTraces: EvidenceTrace[];
  sourceAnchors: PrecisionSourceAnchor[];
  sourceCoverageMatrix: SourceCoverageMatrix;
};
