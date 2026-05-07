import { z } from "zod";
import { FinanceCompanyKeySchema } from "./finance-twin";

export const EvidenceIndexIdSchema = z.string().trim().min(1).max(240);

export const EvidenceIndexExtractionMethodSchema = z.enum([
  "source_metadata",
  "markdown_text_deterministic",
  "plain_text_deterministic",
  "cfo_wiki_document_extract",
  "finance_twin_lineage",
  "cfo_wiki_ref",
  "text_pdf_deterministic",
  "unsupported_pdf",
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
]);

export const EvidenceIndexFreshnessStateSchema = z.enum([
  "fresh",
  "stale",
  "missing",
  "mixed",
  "failed",
]);

export const EvidenceIndexCoverageStatusSchema = z.enum([
  "supported",
  "unsupported",
  "stale",
  "missing",
  "not_indexed",
  "failed",
]);

export const EvidenceIndexLifecycleStatusSchema = z.enum([
  "current",
  "historical",
  "superseded",
  "unsupported",
  "failed",
]);

export const EvidenceIndexLocatorKindSchema = z.enum([
  "source_metadata",
  "line_range",
  "section_range",
  "synthetic_text_segment",
  "pdf_page",
  "pdf_text_range",
  "unsupported_boundary",
]);

export const EvidenceIndexLimitationCodeSchema = z.enum([
  "unsupported_pdf",
  "unsupported_scan",
  "unsupported_image_only",
  "unsupported_no_text_layer",
  "encrypted_pdf",
  "malformed_pdf",
  "unsupported_ocr_only",
  "unsupported_vector_only",
  "unsupported_pageindex",
  "unsupported_llm",
  "unsupported_table",
  "unsupported_figure",
  "unsupported_graphics",
  "ambiguous_layout",
  "numeric_ambiguity",
  "markdown_table_semantics_unsupported",
  "synthetic_text_segment_not_pdf_page",
  "missing_source_snapshot",
  "missing_source_file",
  "missing_document_extract",
  "checksum_mismatch",
  "source_not_indexed",
  "source_kind_unsupported",
  "extraction_failed",
  "stale_source",
  "not_source_truth",
]);

export const EvidenceIndexLimitationPostureSchema = z.object({
  code: EvidenceIndexLimitationCodeSchema,
  severity: z.enum(["blocking", "warning"]),
  summary: z.string().min(1),
  affectedAnchorIds: z.array(EvidenceIndexIdSchema).default([]),
  affectedSourceIds: z.array(z.string().uuid()).default([]),
});

export const EvidenceIndexFreshnessPostureSchema = z.object({
  state: EvidenceIndexFreshnessStateSchema,
  summary: z.string().min(1),
  checkedAt: z.string().datetime({ offset: true }),
  sourceCapturedAt: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .default(null),
  extractedAt: z.string().datetime({ offset: true }).nullable().default(null),
  compiledAt: z.string().datetime({ offset: true }).nullable().default(null),
});

export const EvidenceIndexLocatorSchema = z.object({
  kind: EvidenceIndexLocatorKindSchema,
  value: z.string().min(1),
  startLine: z.number().int().positive().nullable().default(null),
  endLine: z.number().int().positive().nullable().default(null),
  sectionTitle: z.string().min(1).nullable().default(null),
});

export const PermittedNextActionSchema = z.object({
  action: z.enum([
    "inspect_source",
    "open_cfo_wiki_page",
    "open_finance_twin_ref",
    "rerun_existing_compile",
    "run_existing_source_pack_proof",
    "request_human_review",
  ]),
  label: z.string().min(1),
  targetId: z.string().min(1).nullable().default(null),
});

export const EvidenceIndexCompanyScopedSchema = z.object({
  companyKey: FinanceCompanyKeySchema,
});

export type EvidenceIndexExtractionMethod = z.infer<
  typeof EvidenceIndexExtractionMethodSchema
>;
export type EvidenceIndexCoverageStatus = z.infer<
  typeof EvidenceIndexCoverageStatusSchema
>;
export type EvidenceIndexFreshnessPosture = z.infer<
  typeof EvidenceIndexFreshnessPostureSchema
>;
export type EvidenceIndexLimitationPosture = z.infer<
  typeof EvidenceIndexLimitationPostureSchema
>;
export type EvidenceIndexLocator = z.infer<typeof EvidenceIndexLocatorSchema>;
export type PermittedNextAction = z.infer<typeof PermittedNextActionSchema>;
