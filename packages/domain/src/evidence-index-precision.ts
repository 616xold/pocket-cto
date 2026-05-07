import { z } from "zod";
import { CfoWikiDocumentRoleSchema } from "./cfo-wiki";
import {
  DocumentMapSchema,
  SourceAnchorSchema,
} from "./evidence-index-document";
import {
  EvidenceCardSchema,
  EvidenceClaimSchema,
  EvidenceTraceSchema,
} from "./evidence-index-card";
import { SourceCoverageMatrixSchema } from "./evidence-index-coverage";
import {
  EvidenceIndexExtractionMethodSchema,
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexLimitationPostureSchema,
} from "./evidence-index-common";

export const TEXT_PDF_ADAPTER_NAME = "TextPdfAdapter";
export const TEXT_PDF_ADAPTER_VERSION = "v2b-text-pdf-adapter-v1";

export const TextPdfAdapterFailureCodeSchema = z.enum([
  "unsupported_document_role",
  "unsupported_media_type",
  "missing_source_snapshot",
  "missing_source_file",
  "checksum_mismatch",
  "encrypted_pdf",
  "malformed_pdf",
  "no_embedded_text_layer",
  "scan_or_image_only_pdf",
  "ocr_only_content",
  "table_like_region",
  "figure_graphic_chart_region",
  "ambiguous_layout",
  "numeric_ambiguity",
  "vector_only_recall",
  "pageindex_only_navigation",
  "llm_generated_extraction",
  "extraction_failed",
]);

export const PrecisionPageLocatorSchema = z.object({
  pageNumber: z.number().int().positive(),
  pageLabel: z.string().min(1).nullable().default(null),
});

export const PrecisionTextRangeLocatorSchema = z.object({
  pageNumber: z.number().int().positive(),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  startTextOffset: z.number().int().nonnegative(),
  endTextOffset: z.number().int().nonnegative(),
});

export const PrecisionAdapterProvenanceSchema = z.object({
  adapterName: z.literal(TEXT_PDF_ADAPTER_NAME),
  adapterVersion: z.literal(TEXT_PDF_ADAPTER_VERSION),
  parserName: z.literal("pdfjs-dist"),
  parserVersion: z.string().min(1),
  extractionMethod: z.literal("text_pdf_deterministic"),
  extractedAt: z.string().datetime({ offset: true }),
  deterministic: z.literal(true),
  localOnly: z.literal(true),
  ocrUsed: z.literal(false),
  vectorSearchUsed: z.literal(false),
  pageIndexUsed: z.literal(false),
  llmUsed: z.literal(false),
});

export const PrecisionSourceAnchorSchema = SourceAnchorSchema.extend({
  adapterName: z.literal(TEXT_PDF_ADAPTER_NAME),
  adapterVersion: z.literal(TEXT_PDF_ADAPTER_VERSION),
  documentRole: CfoWikiDocumentRoleSchema.nullable(),
  mediaType: z.string().min(1).nullable(),
  pageLocator: PrecisionPageLocatorSchema.nullable().default(null),
  textRangeLocator: PrecisionTextRangeLocatorSchema.nullable().default(null),
});

export const PrecisionDocumentMapSchema = DocumentMapSchema.extend({
  adapterName: z.literal(TEXT_PDF_ADAPTER_NAME),
  adapterVersion: z.literal(TEXT_PDF_ADAPTER_VERSION),
  adapterProvenance: PrecisionAdapterProvenanceSchema.nullable(),
  sourceAnchors: z.array(PrecisionSourceAnchorSchema),
});

export const PrecisionCapabilityBoundarySchema = z.object({
  code: TextPdfAdapterFailureCodeSchema,
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema).min(1),
  permittedNextActions: z.array(z.string().min(1)),
  forbiddenActions: z.array(z.string().min(1)),
});

export const TextPdfAdapterResultSchema = z.object({
  companyKey: z.string().min(1),
  adapterName: z.literal(TEXT_PDF_ADAPTER_NAME),
  adapterVersion: z.literal(TEXT_PDF_ADAPTER_VERSION),
  supportedDocumentRole: z.literal("policy_document"),
  supportedMediaType: z.literal("application/pdf"),
  status: z.enum(["supported", "failed"]),
  failureCode: TextPdfAdapterFailureCodeSchema.nullable(),
  extractionMethod: EvidenceIndexExtractionMethodSchema,
  documentRole: CfoWikiDocumentRoleSchema.nullable(),
  mediaType: z.string().min(1).nullable(),
  documentMap: PrecisionDocumentMapSchema,
  sourceAnchors: z.array(PrecisionSourceAnchorSchema),
  evidenceClaims: z.array(EvidenceClaimSchema),
  evidenceTraces: z.array(EvidenceTraceSchema),
  evidenceCards: z.array(EvidenceCardSchema),
  sourceCoverageMatrix: SourceCoverageMatrixSchema,
  capabilityBoundaries: z.array(PrecisionCapabilityBoundarySchema),
  runtimeBoundary: z.object({
    readOnlyDerived: z.literal(true),
    rawSourcesAuthoritative: z.literal(true),
    financeTwinAuthoritativeForStructuredFacts: z.literal(true),
    cfoWikiCompiledDerived: z.literal(true),
    llmUsed: z.literal(false),
    runtimeCodexUsed: z.literal(false),
    vectorSearchUsed: z.literal(false),
    pageIndexUsed: z.literal(false),
    ocrUsed: z.literal(false),
    sourceMutationCreated: z.literal(false),
    financeWriteCreated: z.literal(false),
    providerCallCreated: z.literal(false),
    certificationCreated: z.literal(false),
    deliveryCreated: z.literal(false),
    autonomousActionCreated: z.literal(false),
  }),
});

export type TextPdfAdapterFailureCode = z.infer<
  typeof TextPdfAdapterFailureCodeSchema
>;
export type PrecisionAdapterProvenance = z.infer<
  typeof PrecisionAdapterProvenanceSchema
>;
export type PrecisionSourceAnchor = z.infer<
  typeof PrecisionSourceAnchorSchema
>;
export type PrecisionDocumentMap = z.infer<
  typeof PrecisionDocumentMapSchema
>;
export type PrecisionCapabilityBoundary = z.infer<
  typeof PrecisionCapabilityBoundarySchema
>;
export type TextPdfAdapterResult = z.infer<typeof TextPdfAdapterResultSchema>;
