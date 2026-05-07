import {
  PrecisionDocumentMapSchema,
  TEXT_PDF_ADAPTER_NAME,
  TEXT_PDF_ADAPTER_VERSION,
  type PrecisionSourceAnchor,
  type TextPdfAdapterFailureCode,
} from "@pocket-cto/domain";
import { buildTextPdfCoverageMatrix } from "./coverage-artifacts";
import { buildTextPdfEvidence } from "./evidence-artifacts";
import {
  buildAdapterProvenance,
  buildFailedSourceDocument,
  buildPrecisionAnchor,
  buildSupportedSourceDocument,
} from "./source-artifacts";
import type {
  BuiltTextPdfArtifacts,
  TextPdfAdapterSourceInput,
  TextPdfExtraction,
} from "./types";

export function buildSupportedTextPdfArtifacts(input: {
  extraction: TextPdfExtraction;
  generatedAt: string;
  sourceInput: TextPdfAdapterSourceInput;
}): BuiltTextPdfArtifacts {
  const sourceDocument = buildSupportedSourceDocument({
    generatedAt: input.generatedAt,
    sourceInput: input.sourceInput,
  });
  const pageAnchors = input.extraction.pages.map((page) =>
    buildPrecisionAnchor({
      document: sourceDocument,
      idSuffix: `page-${page.pageNumber}`,
      locator: {
        endLine: Math.max(page.lines.length, 1),
        kind: "pdf_page",
        sectionTitle: null,
        startLine: 1,
        value: `page:${page.pageNumber}`,
      },
      pageLocator: {
        pageLabel: `page ${page.pageNumber}`,
        pageNumber: page.pageNumber,
      },
      textRangeLocator: null,
    }),
  );
  const sectionAnchors = buildSectionAnchors({
    extraction: input.extraction,
    sourceDocument,
  });
  const documentMap = PrecisionDocumentMapSchema.parse({
    adapterName: TEXT_PDF_ADAPTER_NAME,
    adapterProvenance: buildAdapterProvenance({
      extractedAt: input.generatedAt,
      parserVersion: input.extraction.parserVersion,
    }),
    adapterVersion: TEXT_PDF_ADAPTER_VERSION,
    companyKey: input.sourceInput.companyKey,
    coverageStatus: sourceDocument.coverageStatus,
    extractionMethod: "text_pdf_deterministic",
    id: `${sourceDocument.id}:text-pdf-map`,
    limitations: sourceDocument.limitations,
    sourceAnchors: [...pageAnchors, ...sectionAnchors],
    sourceDocument,
    sourceFigures: [],
    sourcePages: pageAnchors.map((anchor, index) => ({
      anchorId: anchor.id,
      id: `${sourceDocument.id}:page:${index + 1}`,
      label: `PDF page ${index + 1}`,
      limitations: [],
      locator: anchor.locator,
      order: index,
    })),
    sourceSections: buildSourceSections({
      extraction: input.extraction,
      sectionAnchors,
      sourceDocumentId: sourceDocument.id,
    }),
    sourceTables: [],
  });

  return buildArtifacts({
    documentMap,
    failureCode: null,
    sourceInput: input.sourceInput,
  });
}

export function buildFailedTextPdfArtifacts(input: {
  failureCode: TextPdfAdapterFailureCode;
  generatedAt: string;
  sourceInput: TextPdfAdapterSourceInput;
  summary?: string;
}): BuiltTextPdfArtifacts {
  const sourceDocument = buildFailedSourceDocument({
    failureCode: input.failureCode,
    sourceInput: input.sourceInput,
    summary: input.summary,
  });
  const boundaryAnchor = buildPrecisionAnchor({
    document: sourceDocument,
    idSuffix: "boundary",
    limitationPosture: sourceDocument.limitations,
    locator: {
      endLine: null,
      kind: "unsupported_boundary",
      sectionTitle: null,
      startLine: null,
      value: input.failureCode,
    },
    pageLocator: null,
    textRangeLocator: null,
  });
  const documentMap = PrecisionDocumentMapSchema.parse({
    adapterName: TEXT_PDF_ADAPTER_NAME,
    adapterProvenance: null,
    adapterVersion: TEXT_PDF_ADAPTER_VERSION,
    companyKey: input.sourceInput.companyKey,
    coverageStatus: sourceDocument.coverageStatus,
    extractionMethod: sourceDocument.extractionMethod,
    id: `${sourceDocument.id}:text-pdf-map`,
    limitations: sourceDocument.limitations,
    sourceAnchors: [boundaryAnchor],
    sourceDocument,
    sourceFigures: [],
    sourcePages: [],
    sourceSections: [],
    sourceTables: [],
  });

  return buildArtifacts({
    documentMap,
    failureCode: input.failureCode,
    sourceInput: input.sourceInput,
  });
}

function buildArtifacts(input: {
  documentMap: BuiltTextPdfArtifacts["documentMap"];
  failureCode: TextPdfAdapterFailureCode | null;
  sourceInput: TextPdfAdapterSourceInput;
}): BuiltTextPdfArtifacts {
  const evidence = buildTextPdfEvidence(input);

  return {
    documentMap: input.documentMap,
    evidenceCards: evidence.cards,
    evidenceClaims: evidence.claims,
    evidenceTraces: evidence.traces,
    sourceAnchors: input.documentMap.sourceAnchors,
    sourceCoverageMatrix: buildTextPdfCoverageMatrix(input.documentMap),
  };
}

function buildSectionAnchors(input: {
  extraction: TextPdfExtraction;
  sourceDocument: Parameters<typeof buildPrecisionAnchor>[0]["document"];
}) {
  return input.extraction.pages.flatMap((page) =>
    page.lines.map((line) =>
      buildPrecisionAnchor({
        document: input.sourceDocument,
        idSuffix: `page-${line.pageNumber}-line-${line.lineNumber}`,
        locator: {
          endLine: line.lineNumber,
          kind: "pdf_text_range",
          sectionTitle: null,
          startLine: line.lineNumber,
          value: `page:${line.pageNumber}:line:${line.lineNumber}`,
        },
        pageLocator: {
          pageLabel: `page ${line.pageNumber}`,
          pageNumber: line.pageNumber,
        },
        textRangeLocator: {
          endLine: line.lineNumber,
          endTextOffset: line.endTextOffset,
          pageNumber: line.pageNumber,
          startLine: line.lineNumber,
          startTextOffset: line.startTextOffset,
        },
      }),
    ),
  );
}

function buildSourceSections(input: {
  extraction: TextPdfExtraction;
  sectionAnchors: PrecisionSourceAnchor[];
  sourceDocumentId: string;
}) {
  return input.extraction.pages.flatMap((page) =>
    page.lines.map((line, index) => ({
      anchorId:
        input.sectionAnchors.find((anchor) =>
          anchor.id.endsWith(`page-${line.pageNumber}-line-${line.lineNumber}`),
        )?.id ?? input.sectionAnchors[0]!.id,
      endLine: line.lineNumber,
      excerpt: line.text.slice(0, 400),
      id: `${input.sourceDocumentId}:page:${line.pageNumber}:line:${line.lineNumber}`,
      limitations: [],
      order: index,
      startLine: line.lineNumber,
      title: null,
    })),
  );
}
