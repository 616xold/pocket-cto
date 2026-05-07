import {
  TEXT_PDF_ADAPTER_NAME,
  TEXT_PDF_ADAPTER_VERSION,
  TextPdfAdapterResultSchema,
  type TextPdfAdapterResult,
} from "@pocket-cto/domain";
import {
  buildFailedTextPdfArtifacts,
  buildSupportedTextPdfArtifacts,
} from "./artifacts";
import { TEXT_PDF_RUNTIME_BOUNDARY } from "./boundaries";
import {
  checksumPdfBytes,
  extractDeterministicPdfText,
} from "./extractor";
import {
  detectPostExtractionFailure,
  detectPreExtractionFailure,
  mapExtractionError,
} from "./quality-gates";
import type { TextPdfAdapterSourceInput } from "./types";

export class TextPdfAdapter {
  async inspect(input: TextPdfAdapterSourceInput): Promise<TextPdfAdapterResult> {
    const mediaType =
      input.latestSnapshot?.mediaType ?? input.latestSourceFile?.mediaType ?? null;
    const preExtractionFailure = detectPreExtractionFailure({
      bytes: input.body,
      documentRole: input.documentRole,
      expectedChecksum: input.latestSnapshot?.checksumSha256 ?? null,
      mediaType,
      sourceFileId: input.latestSourceFile?.id ?? null,
      sourceSnapshotId: input.latestSnapshot?.id ?? null,
    });

    if (preExtractionFailure) {
      return this.failed(input, preExtractionFailure);
    }

    const body = input.body!;
    const checksum = checksumPdfBytes(body);

    if (
      checksum !== input.latestSnapshot?.checksumSha256 ||
      checksum !== input.latestSourceFile?.checksumSha256
    ) {
      return this.failed(input, "checksum_mismatch");
    }

    try {
      const extraction = await extractDeterministicPdfText(body);
      const postExtractionFailure = detectPostExtractionFailure({
        bytes: body,
        extraction,
      });

      if (postExtractionFailure) {
        return this.failed(input, postExtractionFailure);
      }

      return this.supported(input, extraction);
    } catch (error) {
      return this.failed(
        input,
        mapExtractionError(error instanceof Error ? error : new Error(String(error))),
      );
    }
  }

  private supported(
    input: TextPdfAdapterSourceInput,
    extraction: Parameters<typeof buildSupportedTextPdfArtifacts>[0]["extraction"],
  ) {
    const artifacts = buildSupportedTextPdfArtifacts({
      extraction,
      generatedAt: input.generatedAt,
      sourceInput: input,
    });

    return TextPdfAdapterResultSchema.parse({
      ...artifacts,
      adapterName: TEXT_PDF_ADAPTER_NAME,
      adapterVersion: TEXT_PDF_ADAPTER_VERSION,
      capabilityBoundaries: artifacts.sourceCoverageMatrix.capabilityBoundaries.map(
        (limitation) => ({
          code: boundaryCodeForLimitation(limitation.code),
          extractionMethod: limitationToExtractionMethod(limitation.code),
          forbiddenActions: [],
          freshness: artifacts.documentMap.sourceDocument.freshness,
          limitations: [limitation],
          permittedNextActions: [],
        }),
      ),
      companyKey: input.companyKey,
      documentRole: input.documentRole,
      extractionMethod: "text_pdf_deterministic",
      failureCode: null,
      mediaType:
        input.latestSnapshot?.mediaType ?? input.latestSourceFile?.mediaType ?? null,
      runtimeBoundary: TEXT_PDF_RUNTIME_BOUNDARY,
      status: "supported",
      supportedDocumentRole: "policy_document",
      supportedMediaType: "application/pdf",
    });
  }

  private failed(
    input: TextPdfAdapterSourceInput,
    failureCode: NonNullable<TextPdfAdapterResult["failureCode"]>,
  ) {
    const artifacts = buildFailedTextPdfArtifacts({
      failureCode,
      generatedAt: input.generatedAt,
      sourceInput: input,
    });

    return TextPdfAdapterResultSchema.parse({
      ...artifacts,
      adapterName: TEXT_PDF_ADAPTER_NAME,
      adapterVersion: TEXT_PDF_ADAPTER_VERSION,
      capabilityBoundaries: artifacts.sourceCoverageMatrix.capabilityBoundaries.map(
        (limitation) => ({
          code: boundaryCodeForLimitation(limitation.code),
          extractionMethod: limitationToExtractionMethod(limitation.code),
          forbiddenActions: [],
          freshness: artifacts.documentMap.sourceDocument.freshness,
          limitations: [limitation],
          permittedNextActions: [],
        }),
      ),
      companyKey: input.companyKey,
      documentRole: input.documentRole,
      extractionMethod: artifacts.documentMap.extractionMethod,
      failureCode,
      mediaType:
        input.latestSnapshot?.mediaType ?? input.latestSourceFile?.mediaType ?? null,
      runtimeBoundary: TEXT_PDF_RUNTIME_BOUNDARY,
      status: "failed",
      supportedDocumentRole: "policy_document",
      supportedMediaType: "application/pdf",
    });
  }
}

export function inspectTextPdfSource(input: TextPdfAdapterSourceInput) {
  return new TextPdfAdapter().inspect(input);
}

function boundaryCodeForLimitation(code: string) {
  if (code === "unsupported_no_text_layer") return "no_embedded_text_layer";
  if (code === "encrypted_pdf") return "encrypted_pdf";
  if (code === "malformed_pdf") return "malformed_pdf";
  if (code === "ambiguous_layout") return "ambiguous_layout";
  if (code === "numeric_ambiguity") return "numeric_ambiguity";
  if (code === "unsupported_vector_only") return "vector_only_recall";
  if (code === "unsupported_pageindex") return "pageindex_only_navigation";
  if (code === "unsupported_llm") return "llm_generated_extraction";
  if (code === "unsupported_ocr_only") return "ocr_only_content";
  if (code === "unsupported_table") return "table_like_region";
  if (code === "unsupported_graphics" || code === "unsupported_figure") {
    return "figure_graphic_chart_region";
  }
  return "scan_or_image_only_pdf";
}

function limitationToExtractionMethod(code: string) {
  if (code === "unsupported_no_text_layer") return "unsupported_no_text_layer";
  if (code === "encrypted_pdf") return "unsupported_encrypted_pdf";
  if (code === "malformed_pdf") return "unsupported_malformed_pdf";
  if (code === "ambiguous_layout" || code === "numeric_ambiguity") {
    return "unsupported_ambiguous_layout";
  }
  if (code === "unsupported_vector_only") return "unsupported_vector_only";
  if (code === "unsupported_pageindex") return "unsupported_pageindex";
  if (code === "unsupported_llm") return "unsupported_llm";
  if (code === "unsupported_ocr_only") return "unsupported_ocr_only";
  if (code === "unsupported_table") return "unsupported_table";
  if (code === "unsupported_graphics" || code === "unsupported_figure") {
    return "unsupported_figure";
  }
  return "unsupported_image_only";
}
