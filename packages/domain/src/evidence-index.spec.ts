import { describe, expect, it } from "vitest";
import {
  DocumentMapSchema,
  EvidenceCardSchema,
  PrecisionSourceAnchorSchema,
  SourceCoverageMatrixSchema,
  TEXT_PDF_ADAPTER_NAME,
  TEXT_PDF_ADAPTER_VERSION,
} from "./evidence-index";

const checkedAt = "2026-05-07T18:30:00.000Z";
const sourceId = "11111111-1111-4111-8111-111111111111";
const snapshotId = "22222222-2222-4222-8222-222222222222";
const sourceFileId = "33333333-3333-4333-8333-333333333333";
const checksum =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function freshness() {
  return {
    checkedAt,
    compiledAt: null,
    extractedAt: checkedAt,
    sourceCapturedAt: checkedAt,
    state: "fresh" as const,
    summary: "Fresh deterministic source extract.",
  };
}

function sourceAnchor() {
  return {
    checksumSha256: checksum,
    companyKey: "acme",
    extractionMethod: "markdown_text_deterministic" as const,
    freshness: freshness(),
    id: "anchor:source-section",
    lifecycleStatus: "current" as const,
    limitations: [],
    locator: {
      endLine: 3,
      kind: "section_range" as const,
      sectionTitle: "Cash",
      startLine: 1,
      value: "lines:1-3",
    },
    sourceDocumentId: "source-document:acme:source:snapshot",
    sourceFileId,
    sourceId,
    sourceSnapshotId: snapshotId,
    storageKind: "object_store" as const,
    storageRef: "s3://bucket/source.md",
  };
}

describe("evidence index domain schemas", () => {
  it("parses deterministic document maps with source anchors and line locators", () => {
    const anchor = sourceAnchor();
    const parsed = DocumentMapSchema.parse({
      companyKey: "acme",
      coverageStatus: "supported",
      extractionMethod: "markdown_text_deterministic",
      id: "document-map:source",
      limitations: [],
      sourceAnchors: [anchor],
      sourceDocument: {
        capturedAt: checkedAt,
        checksumSha256: checksum,
        companyKey: "acme",
        documentRole: "board_material",
        extractionMethod: "markdown_text_deterministic",
        freshness: freshness(),
        id: anchor.sourceDocumentId,
        lifecycleStatus: "current",
        limitations: [],
        mediaType: "text/markdown",
        sourceFileId,
        sourceId,
        sourceKind: "document",
        sourceSnapshotId: snapshotId,
        storageKind: "object_store",
        storageRef: "s3://bucket/source.md",
      },
      sourceFigures: [],
      sourcePages: [],
      sourceSections: [
        {
          anchorId: anchor.id,
          endLine: 3,
          excerpt: "Cash remains source backed.",
          id: "section:cash",
          limitations: [],
          order: 0,
          startLine: 1,
          title: "Cash",
        },
      ],
      sourceTables: [],
    });

    expect(parsed.sourceSections[0]?.startLine).toBe(1);
    expect(parsed.sourceAnchors[0]?.checksumSha256).toBe(checksum);
  });

  it("parses evidence cards without turning anchors into source truth", () => {
    const anchor = sourceAnchor();
    const parsed = EvidenceCardSchema.parse({
      claimText: "Deterministic V2A source anchors are available.",
      claimType: "document_map_anchor",
      companyKey: "acme",
      confidence: {
        method: "markdown_text_deterministic",
        summary: "Deterministic extract used.",
      },
      evidence: {
        evidenceTraces: [],
        financeTwinRefs: [],
        sourceAnchors: [anchor],
        wikiRefs: [{ pageKey: "sources/coverage", summary: "Coverage page." }],
      },
      extractionMethod: "markdown_text_deterministic",
      financeTwinRefs: [],
      forbiddenActions: ["mutate_raw_source", "write_finance_twin_fact"],
      freshness: freshness(),
      id: "evidence-card:source",
      limitations: [
        {
          affectedAnchorIds: [],
          affectedSourceIds: [sourceId],
          code: "not_source_truth",
          severity: "warning",
          summary: "EvidenceIndex is a read-only anchor layer.",
        },
      ],
      permittedNextActions: [
        {
          action: "inspect_source",
          label: "Inspect source.",
          targetId: sourceId,
        },
      ],
      sourceAnchors: [anchor],
      wikiRefs: [{ pageKey: "sources/coverage", summary: "Coverage page." }],
    });

    expect(parsed.limitations[0]?.code).toBe("not_source_truth");
    expect(parsed.forbiddenActions).toContain("mutate_raw_source");
  });

  it("parses a coverage matrix with fail-closed unsupported capabilities", () => {
    const parsed = SourceCoverageMatrixSchema.parse({
      capabilityBoundaries: [
        {
          affectedAnchorIds: [],
          affectedSourceIds: [],
          code: "unsupported_pdf",
          severity: "blocking",
          summary: "PDF handling is out of scope.",
        },
        {
          affectedAnchorIds: [],
          affectedSourceIds: [],
          code: "unsupported_graphics",
          severity: "blocking",
          summary: "Graphics handling is out of scope.",
        },
        {
          affectedAnchorIds: [],
          affectedSourceIds: [],
          code: "ambiguous_layout",
          severity: "blocking",
          summary: "Ambiguous layout handling is out of scope.",
        },
      ],
      companyKey: "acme",
      entries: [
        {
          coverageStatus: "unsupported",
          documentRole: "lender_document",
          freshness: freshness(),
          limitations: [],
          mediaType: "application/pdf",
          sourceFileId,
          sourceId,
          sourceKind: "document",
          sourceSnapshotId: snapshotId,
          supportedMethods: [],
          unsupportedMethods: ["unsupported_pdf", "unsupported_ocr_only"],
        },
      ],
      generatedAt: checkedAt,
    });

    expect(parsed.entries[0]?.coverageStatus).toBe("unsupported");
    expect(parsed.entries[0]?.unsupportedMethods).toContain("unsupported_pdf");
    expect(
      parsed.capabilityBoundaries.map((boundary) => boundary.code),
    ).toEqual(
      expect.arrayContaining(["unsupported_graphics", "ambiguous_layout"]),
    );
  });

  it("parses V2B precision anchors with adapter provenance and PDF locators", () => {
    const parsed = PrecisionSourceAnchorSchema.parse({
      ...sourceAnchor(),
      adapterName: TEXT_PDF_ADAPTER_NAME,
      adapterVersion: TEXT_PDF_ADAPTER_VERSION,
      documentRole: "policy_document",
      extractionMethod: "text_pdf_deterministic",
      locator: {
        endLine: 1,
        kind: "pdf_text_range",
        sectionTitle: null,
        startLine: 1,
        value: "page:1:line:1",
      },
      mediaType: "application/pdf",
      pageLocator: {
        pageLabel: "page 1",
        pageNumber: 1,
      },
      textRangeLocator: {
        endLine: 1,
        endTextOffset: 42,
        pageNumber: 1,
        startLine: 1,
        startTextOffset: 0,
      },
    });

    expect(parsed.adapterName).toBe("TextPdfAdapter");
    expect(parsed.pageLocator?.pageNumber).toBe(1);
    expect(parsed.textRangeLocator?.startTextOffset).toBe(0);
  });
});
