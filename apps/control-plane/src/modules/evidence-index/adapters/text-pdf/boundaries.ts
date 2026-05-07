import type {
  EvidenceIndexExtractionMethod,
  EvidenceIndexFreshnessPosture,
  PrecisionCapabilityBoundary,
  TextPdfAdapterFailureCode,
} from "@pocket-cto/domain";
import {
  TEXT_PDF_ADAPTER_NAME,
  TEXT_PDF_ADAPTER_VERSION,
} from "@pocket-cto/domain";
import { buildLimitation } from "../../limitations";
import type { TextPdfFailure, TextPdfRuntimeBoundary } from "./types";

export const TEXT_PDF_RUNTIME_BOUNDARY: TextPdfRuntimeBoundary = {
  autonomousActionCreated: false,
  certificationCreated: false,
  cfoWikiCompiledDerived: true,
  deliveryCreated: false,
  financeTwinAuthoritativeForStructuredFacts: true,
  financeWriteCreated: false,
  llmUsed: false,
  ocrUsed: false,
  pageIndexUsed: false,
  providerCallCreated: false,
  rawSourcesAuthoritative: true,
  readOnlyDerived: true,
  runtimeCodexUsed: false,
  sourceMutationCreated: false,
  vectorSearchUsed: false,
};

export const TEXT_PDF_FORBIDDEN_ACTIONS = [
  "mutate_raw_source",
  "write_finance_twin_fact",
  "write_accounting_record",
  "move_money_or_create_payment_instruction",
  "file_tax_or_create_legal_advice",
  "call_provider_or_create_provider_job",
  "send_or_release_external_communication",
  "certify_close_or_create_assurance",
  "run_llm_summarization",
  "run_ocr",
  "run_vector_search",
  "run_pageindex_navigation",
  "take_autonomous_action",
];

export const TEXT_PDF_UNSUPPORTED_METHODS: EvidenceIndexExtractionMethod[] = [
  "unsupported_scan",
  "unsupported_image_only",
  "unsupported_no_text_layer",
  "unsupported_encrypted_pdf",
  "unsupported_malformed_pdf",
  "unsupported_checksum_mismatch",
  "unsupported_table",
  "unsupported_figure",
  "unsupported_graphics",
  "unsupported_ambiguous_layout",
  "unsupported_vector_only",
  "unsupported_ocr_only",
  "unsupported_pageindex",
  "unsupported_llm",
];

const FAILURE_BY_CODE: Record<TextPdfAdapterFailureCode, TextPdfFailure> = {
  ambiguous_layout: {
    code: "ambiguous_layout",
    extractionMethod: "unsupported_ambiguous_layout",
    limitationCode: "ambiguous_layout",
    summary:
      "The PDF text layer has ambiguous reading order, so TextPdfAdapter failed closed.",
  },
  checksum_mismatch: {
    code: "checksum_mismatch",
    extractionMethod: "unsupported_checksum_mismatch",
    limitationCode: "checksum_mismatch",
    summary:
      "The supplied bytes do not match the stored source checksum, so TextPdfAdapter failed closed.",
  },
  encrypted_pdf: {
    code: "encrypted_pdf",
    extractionMethod: "unsupported_encrypted_pdf",
    limitationCode: "encrypted_pdf",
    summary:
      "Encrypted or password-protected PDFs are unsupported in V2B.",
  },
  extraction_failed: {
    code: "extraction_failed",
    extractionMethod: "unsupported_malformed_pdf",
    limitationCode: "extraction_failed",
    summary:
      "TextPdfAdapter could not deterministically extract the PDF text layer.",
  },
  figure_graphic_chart_region: {
    code: "figure_graphic_chart_region",
    extractionMethod: "unsupported_figure",
    limitationCode: "unsupported_graphics",
    summary:
      "Figure, graphic, or chart regions remain unsupported in V2B.",
  },
  llm_generated_extraction: {
    code: "llm_generated_extraction",
    extractionMethod: "unsupported_llm",
    limitationCode: "unsupported_llm",
    summary:
      "LLM-generated extraction is not a permitted TextPdfAdapter source.",
  },
  malformed_pdf: {
    code: "malformed_pdf",
    extractionMethod: "unsupported_malformed_pdf",
    limitationCode: "malformed_pdf",
    summary: "Malformed PDFs are unsupported in V2B.",
  },
  missing_source_file: {
    code: "missing_source_file",
    extractionMethod: "source_metadata",
    limitationCode: "missing_source_file",
    summary:
      "No immutable source file is linked to the latest source snapshot.",
  },
  missing_source_snapshot: {
    code: "missing_source_snapshot",
    extractionMethod: "source_metadata",
    limitationCode: "missing_source_snapshot",
    summary: "No source snapshot is available for TextPdfAdapter.",
  },
  no_embedded_text_layer: {
    code: "no_embedded_text_layer",
    extractionMethod: "unsupported_no_text_layer",
    limitationCode: "unsupported_no_text_layer",
    summary:
      "The PDF has no deterministic embedded text layer, so V2B cannot anchor text.",
  },
  numeric_ambiguity: {
    code: "numeric_ambiguity",
    extractionMethod: "unsupported_ambiguous_layout",
    limitationCode: "numeric_ambiguity",
    summary:
      "Numeric content lacks deterministic unit, period, sign, row/column, or context posture.",
  },
  ocr_only_content: {
    code: "ocr_only_content",
    extractionMethod: "unsupported_ocr_only",
    limitationCode: "unsupported_ocr_only",
    summary: "OCR-only content is unsupported in V2B.",
  },
  pageindex_only_navigation: {
    code: "pageindex_only_navigation",
    extractionMethod: "unsupported_pageindex",
    limitationCode: "unsupported_pageindex",
    summary:
      "PageIndex-only navigation is not a permitted TextPdfAdapter source.",
  },
  scan_or_image_only_pdf: {
    code: "scan_or_image_only_pdf",
    extractionMethod: "unsupported_image_only",
    limitationCode: "unsupported_image_only",
    summary:
      "Scanned or image-only PDFs have no deterministic text layer in V2B.",
  },
  table_like_region: {
    code: "table_like_region",
    extractionMethod: "unsupported_table",
    limitationCode: "unsupported_table",
    summary:
      "Table-like PDF regions remain unsupported and do not produce row or cell claims.",
  },
  unsupported_document_role: {
    code: "unsupported_document_role",
    extractionMethod: "source_metadata",
    limitationCode: "source_not_indexed",
    summary:
      "TextPdfAdapter only targets explicit policy_document sources in V2B.",
  },
  unsupported_media_type: {
    code: "unsupported_media_type",
    extractionMethod: "source_metadata",
    limitationCode: "unsupported_pdf",
    summary:
      "TextPdfAdapter only supports application/pdf sources in V2B.",
  },
  vector_only_recall: {
    code: "vector_only_recall",
    extractionMethod: "unsupported_vector_only",
    limitationCode: "unsupported_vector_only",
    summary:
      "Vector-only recall is not a permitted TextPdfAdapter source.",
  },
};

export function failureFor(code: TextPdfAdapterFailureCode) {
  const failure = FAILURE_BY_CODE[code];

  if (!failure) {
    throw new Error(`Unknown TextPdfAdapter failure code: ${code}`);
  }

  return failure;
}

export function buildFailureLimitation(input: {
  anchorIds?: string[];
  code: TextPdfAdapterFailureCode;
  sourceId: string;
  summary?: string;
}) {
  const failure = failureFor(input.code);

  return buildLimitation({
    affectedAnchorIds: input.anchorIds ?? [],
    affectedSourceIds: [input.sourceId],
    code: failure.limitationCode,
    severity: "blocking",
    summary: input.summary ?? failure.summary,
  });
}

export function buildPrecisionCapabilityBoundaries(input: {
  freshness: EvidenceIndexFreshnessPosture;
  sourceId: string;
}): PrecisionCapabilityBoundary[] {
  const codes: TextPdfAdapterFailureCode[] = [
    "no_embedded_text_layer",
    "scan_or_image_only_pdf",
    "encrypted_pdf",
    "malformed_pdf",
    "ambiguous_layout",
    "table_like_region",
    "figure_graphic_chart_region",
    "numeric_ambiguity",
    "ocr_only_content",
    "vector_only_recall",
    "pageindex_only_navigation",
    "llm_generated_extraction",
  ];

  return codes.map((code) => {
    const failure = failureFor(code);

    return {
      code,
      extractionMethod: failure.extractionMethod,
      forbiddenActions: TEXT_PDF_FORBIDDEN_ACTIONS,
      freshness: input.freshness,
      limitations: [
        buildFailureLimitation({
          code,
          sourceId: input.sourceId,
        }),
      ],
      permittedNextActions: [
        "inspect_source",
        "request_human_review",
        "run_existing_source_pack_proof",
      ],
    };
  });
}

export function buildNotSourceTruthLimitation(input: { sourceId: string }) {
  return buildLimitation({
    affectedSourceIds: [input.sourceId],
    code: "not_source_truth",
    severity: "warning",
    summary:
      `${TEXT_PDF_ADAPTER_NAME} ${TEXT_PDF_ADAPTER_VERSION} emits read-only anchors and traces; raw sources remain authoritative.`,
  });
}
