import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TextPdfAdapter } from "./text-pdf-adapter";
import type { TextPdfAdapterSourceInput } from "./types";

const generatedAt = "2026-05-07T20:30:00.000Z";
const sourceId = "11111111-1111-4111-8111-111111111111";
const snapshotId = "22222222-2222-4222-8222-222222222222";
const sourceFileId = "33333333-3333-4333-8333-333333333333";

describe("TextPdfAdapter", () => {
  it("emits deterministic EvidenceIndex-compatible artifacts for policy text PDFs", async () => {
    const bytes = buildSyntheticPdf({
      texts: ["Policy covenant notice period is thirty days."],
    });
    const adapter = new TextPdfAdapter();
    const first = await adapter.inspect(buildSourceInput(bytes));
    const second = await adapter.inspect(buildSourceInput(bytes));

    expect(first.status).toBe("supported");
    expect(first.failureCode).toBeNull();
    expect(first.extractionMethod).toBe("text_pdf_deterministic");
    expect(first.sourceAnchors[0]).toMatchObject({
      adapterName: "TextPdfAdapter",
      adapterVersion: "v2b-text-pdf-adapter-v1",
      checksumSha256: sha256(bytes),
      documentRole: "policy_document",
      mediaType: "application/pdf",
      pageLocator: { pageNumber: 1 },
      sourceFileId,
      sourceId,
      sourceSnapshotId: snapshotId,
      storageKind: "object_store",
      storageRef: "s3://bucket/policy.pdf",
    });
    expect(first.sourceAnchors.some((anchor) => anchor.textRangeLocator)).toBe(
      true,
    );
    expect(first.documentMap.sourceSections[0]?.excerpt).toContain(
      "Policy covenant notice period",
    );
    expect(first.evidenceCards[0]).toMatchObject({
      forbiddenActions: expect.arrayContaining([
        "mutate_raw_source",
        "write_finance_twin_fact",
        "run_ocr",
        "run_vector_search",
        "run_pageindex_navigation",
      ]),
      permittedNextActions: expect.arrayContaining([
        expect.objectContaining({ action: "inspect_source" }),
        expect.objectContaining({ action: "request_human_review" }),
      ]),
    });
    expect(first.runtimeBoundary).toMatchObject({
      llmUsed: false,
      ocrUsed: false,
      pageIndexUsed: false,
      sourceMutationCreated: false,
      vectorSearchUsed: false,
    });
    expect(JSON.stringify(first.documentMap)).toBe(
      JSON.stringify(second.documentMap),
    );
  });

  it("fails closed for unsupported PDF and source-binding cases", async () => {
    const supportedBytes = buildSyntheticPdf({
      texts: ["Policy covenant notice period is thirty days."],
    });
    const unsupportedCases = [
      [
        "missing_source_snapshot",
        buildSourceInput(supportedBytes, { missingSnapshot: true }),
      ],
      [
        "missing_source_file",
        buildSourceInput(supportedBytes, { missingSourceFile: true }),
      ],
      [
        "checksum_mismatch",
        buildSourceInput(supportedBytes, {
          checksumOverride:
            "f".repeat(64),
        }),
      ],
      [
        "unsupported_media_type",
        buildSourceInput(supportedBytes, { mediaType: "text/plain" }),
      ],
      [
        "unsupported_document_role",
        buildSourceInput(supportedBytes, { documentRole: "board_material" }),
      ],
      [
        "encrypted_pdf",
        buildSourceInput(Buffer.concat([supportedBytes, Buffer.from("/Encrypt")])),
      ],
      ["malformed_pdf", buildSourceInput(Buffer.from("%PDF-1.4 broken"))],
      ["no_embedded_text_layer", buildSourceInput(buildSyntheticPdf({ texts: [] }))],
      [
        "scan_or_image_only_pdf",
        buildSourceInput(buildSyntheticPdf({ includeImage: true, texts: [] })),
      ],
      [
        "table_like_region",
        buildSourceInput(buildSyntheticPdf({ texts: ["Metric | Value"] })),
      ],
      [
        "figure_graphic_chart_region",
        buildSourceInput(
          buildSyntheticPdf({ includeImage: true, texts: ["Policy narrative"] }),
        ),
      ],
      [
        "ambiguous_layout",
        buildSourceInput(buildSyntheticPdf({ texts: ["Policy      Covenant"] })),
      ],
      [
        "numeric_ambiguity",
        buildSourceInput(buildSyntheticPdf({ texts: ["Threshold 1.25"] })),
      ],
    ] as const;

    for (const [failureCode, input] of unsupportedCases) {
      const result = await new TextPdfAdapter().inspect(input);

      expect(result.status, failureCode).toBe("failed");
      expect(result.failureCode, failureCode).toBe(failureCode);
      expect(result.evidenceClaims[0]?.authorityBasis, failureCode).toBe(
        "limitation_boundary",
      );
      expect(result.sourceAnchors[0]?.locator.kind, failureCode).toBe(
        "unsupported_boundary",
      );
      expect(result.runtimeBoundary, failureCode).toMatchObject({
        autonomousActionCreated: false,
        financeWriteCreated: false,
        llmUsed: false,
        ocrUsed: false,
        pageIndexUsed: false,
        providerCallCreated: false,
        sourceMutationCreated: false,
        vectorSearchUsed: false,
      });
    }
  });
});

function buildSourceInput(
  body: Buffer,
  overrides: {
    checksumOverride?: string;
    documentRole?: TextPdfAdapterSourceInput["documentRole"];
    mediaType?: string;
    missingSnapshot?: boolean;
    missingSourceFile?: boolean;
  } = {},
): TextPdfAdapterSourceInput {
  const checksum = overrides.checksumOverride ?? sha256(body);
  const mediaType = overrides.mediaType ?? "application/pdf";

  return {
    body,
    companyKey: "acme",
    documentRole: overrides.documentRole ?? "policy_document",
    generatedAt,
    latestSnapshot: overrides.missingSnapshot
      ? null
      : {
          capturedAt: generatedAt,
          checksumSha256: checksum,
          createdAt: generatedAt,
          id: snapshotId,
          ingestErrorSummary: null,
          ingestStatus: "ready",
          mediaType,
          originalFileName: "policy.pdf",
          sizeBytes: body.byteLength,
          sourceId,
          storageKind: "object_store",
          storageRef: "s3://bucket/policy.pdf",
          updatedAt: generatedAt,
          version: 1,
        },
    latestSourceFile: overrides.missingSourceFile
      ? null
      : {
          capturedAt: generatedAt,
          checksumSha256: checksum,
          createdAt: generatedAt,
          createdBy: "operator",
          id: sourceFileId,
          mediaType,
          originalFileName: "policy.pdf",
          sizeBytes: body.byteLength,
          sourceId,
          sourceSnapshotId: snapshotId,
          storageKind: "object_store",
          storageRef: "s3://bucket/policy.pdf",
        },
    limitations: [],
    source: {
      id: sourceId,
      kind: "document",
      name: "Policy document",
    },
    wikiRefs: [
      {
        pageKey: `sources/${sourceId}/snapshots/1`,
        refKind: "source_excerpt",
        summary: "Derived source page.",
      },
    ],
  };
}

function buildSyntheticPdf(input: {
  includeImage?: boolean;
  texts: string[];
}): Buffer {
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    pageObject(input.includeImage === true),
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  const stream = [
    ...input.texts.map(
      (text, index) =>
        `BT /F1 12 Tf 72 ${720 - index * 18} Td (${escapePdfText(text)}) Tj ET`,
    ),
    input.includeImage ? "q 1 0 0 1 72 650 cm /Im1 Do Q" : "",
  ]
    .filter(Boolean)
    .join("\n");

  objects.push(
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  );

  if (input.includeImage) {
    objects.push(
      "6 0 obj\n<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length 3 >>\nstream\nabc\nendstream\nendobj\n",
    );
  }

  return Buffer.from(writePdf(objects), "binary");
}

function pageObject(includeImage: boolean) {
  const resources = includeImage
    ? "<< /Font << /F1 4 0 R >> /XObject << /Im1 6 0 R >> >>"
    : "<< /Font << /F1 4 0 R >> >>";

  return `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources ${resources} /Contents 5 0 R >>\nendobj\n`;
}

function writePdf(objects: string[]) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  return `${pdf}trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function sha256(body: Buffer) {
  return createHash("sha256").update(body).digest("hex");
}
