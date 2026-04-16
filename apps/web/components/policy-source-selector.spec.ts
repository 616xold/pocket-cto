import { describe, expect, it } from "vitest";
import {
  buildPolicySourceOptions,
  isPolicySourceSelectorDisabled,
  readPolicySourceSelectorPlaceholder,
} from "./policy-source-selector";

describe("policy-source selector helpers", () => {
  it("filters the company bound-source list to explicit policy documents", () => {
    const options = buildPolicySourceOptions({
      companyId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      companyDisplayName: "Acme",
      sourceCount: 2,
      limitations: [],
      sources: [
        {
          binding: {
            id: "22222222-2222-4222-8222-222222222222",
            companyId: "11111111-1111-4111-8111-111111111111",
            sourceId: "33333333-3333-4333-8333-333333333333",
            includeInCompile: true,
            documentRole: "policy_document",
            boundBy: "operator",
            createdAt: "2026-04-16T12:00:00.000Z",
            updatedAt: "2026-04-16T12:00:00.000Z",
          },
          source: {
            id: "33333333-3333-4333-8333-333333333333",
            createdAt: "2026-04-16T12:00:00.000Z",
            updatedAt: "2026-04-16T12:00:00.000Z",
            name: "Travel and expense policy",
            kind: "document",
            originKind: "manual",
            createdBy: "operator",
            description: "Policy document",
          },
          latestSnapshot: {
            id: "44444444-4444-4444-8444-444444444444",
            sourceId: "33333333-3333-4333-8333-333333333333",
            capturedAt: "2026-04-16T12:00:00.000Z",
            storageKind: "external_url",
            storageRef: "https://example.com/policy",
            mediaType: "text/plain",
            originalFileName: "policy-link.txt",
            sizeBytes: 12,
            checksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            ingestStatus: "registered",
            ingestErrorSummary: null,
            version: 2,
            createdAt: "2026-04-16T12:00:00.000Z",
            updatedAt: "2026-04-16T12:00:00.000Z",
          },
          latestSourceFile: null,
          latestExtract: {
            id: "55555555-5555-4555-8555-555555555555",
            companyId: "11111111-1111-4111-8111-111111111111",
            sourceId: "33333333-3333-4333-8333-333333333333",
            sourceSnapshotId: "44444444-4444-4444-8444-444444444444",
            sourceFileId: null,
            extractStatus: "extracted",
            documentKind: "markdown_text",
            title: "Travel and expense policy",
            headingOutline: [],
            excerptBlocks: [],
            extractedText: "Policy text",
            renderedMarkdown: "# Policy",
            warnings: [],
            errorSummary: null,
            parserVersion: "test",
            inputChecksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            extractedAt: "2026-04-16T12:01:00.000Z",
            createdAt: "2026-04-16T12:01:00.000Z",
            updatedAt: "2026-04-16T12:01:00.000Z",
          },
          limitations: [],
        },
        {
          binding: {
            id: "66666666-6666-4666-8666-666666666666",
            companyId: "11111111-1111-4111-8111-111111111111",
            sourceId: "77777777-7777-4777-8777-777777777777",
            includeInCompile: true,
            documentRole: "board_material",
            boundBy: "operator",
            createdAt: "2026-04-16T12:00:00.000Z",
            updatedAt: "2026-04-16T12:00:00.000Z",
          },
          source: {
            id: "77777777-7777-4777-8777-777777777777",
            createdAt: "2026-04-16T12:00:00.000Z",
            updatedAt: "2026-04-16T12:00:00.000Z",
            name: "Board packet",
            kind: "document",
            originKind: "manual",
            createdBy: "operator",
            description: "Board material",
          },
          latestSnapshot: null,
          latestSourceFile: null,
          latestExtract: null,
          limitations: [],
        },
      ],
    });

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      policySourceId: "33333333-3333-4333-8333-333333333333",
      scope: {
        sourceName: "Travel and expense policy",
        documentRole: "policy_document",
        includeInCompile: true,
        latestExtractStatus: "extracted",
        latestSnapshotVersion: 2,
      },
    });
    expect(options[0]?.label).toContain("Travel and expense policy");
    expect(options[0]?.label).toContain("Extracted");
    expect(options[0]?.label).toContain("snapshot v2");
  });

  it("returns truthful placeholders and disabled states for empty or failed selector posture", () => {
    expect(
      readPolicySourceSelectorPlaceholder({
        companyKey: "",
        status: "idle",
      }),
    ).toBe("Enter a company key to load bound policy documents");
    expect(
      readPolicySourceSelectorPlaceholder({
        companyKey: "acme",
        status: "error",
      }),
    ).toBe("Could not load bound policy documents for this company");
    expect(
      isPolicySourceSelectorDisabled({
        companyKey: "",
        status: "ready",
      }),
    ).toBe(true);
    expect(
      isPolicySourceSelectorDisabled({
        companyKey: "acme",
        status: "ready",
      }),
    ).toBe(false);
  });
});
