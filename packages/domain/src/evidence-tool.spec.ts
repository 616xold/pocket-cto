import { describe, expect, it } from "vitest";
import {
  EVIDENCE_TOOL_SCHEMA_VERSION,
  EvidenceSearchResultSchema,
  EvidenceToolResponseSchema,
  ForbiddenToolActionSchema,
  ReadOnlyToolManifestSchema,
} from "./evidence-tool";

const checkedAt = "2026-05-08T08:00:00.000Z";

function freshness() {
  return {
    checkedAt,
    compiledAt: null,
    extractedAt: checkedAt,
    sourceCapturedAt: checkedAt,
    state: "fresh" as const,
    summary: "Fresh local proof evidence.",
  };
}

describe("evidence tool domain schemas", () => {
  it("parses the required read-only tool response envelope", () => {
    const parsed = EvidenceToolResponseSchema.parse({
      appMode: "local_proof",
      audit: {
        appMode: "local_proof",
        artifactIds: ["evidence-card:1"],
        companyKey: "acme",
        excerptCharacterCount: 36,
        forbiddenRequestBlocked: false,
        id: "audit:1",
        normalizedQuery: "policy",
        redactionCount: 0,
        sourceAnchorIds: ["anchor:1"],
        timestamp: checkedAt,
        toolName: "search_evidence",
        unsupportedReason: null,
      },
      capabilityBoundaries: [],
      citations: [
        {
          checksumSha256:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          citationType: "source_anchor",
          id: "anchor:1",
          locator: "lines:1-2",
          sourceAnchorId: "anchor:1",
          sourceId: "11111111-1111-4111-8111-111111111111",
          sourceSnapshotId: "22222222-2222-4222-8222-222222222222",
          summary: "Source anchor citation.",
        },
      ],
      companyKey: "acme",
      evidence: [],
      forbiddenActions: ["write_finance_twin_fact", "take_autonomous_action"],
      freshness: freshness(),
      limitations: [],
      ok: true,
      permittedNextActions: [
        {
          action: "inspect_source",
          label: "Inspect source.",
          targetId: "11111111-1111-4111-8111-111111111111",
        },
      ],
      redactions: [],
      result: [],
      schemaVersion: EVIDENCE_TOOL_SCHEMA_VERSION,
      toolName: "search_evidence",
      unsupportedReason: null,
    });

    expect(parsed.schemaVersion).toBe(EVIDENCE_TOOL_SCHEMA_VERSION);
    expect(parsed.forbiddenActions).toContain("take_autonomous_action");
  });

  it("parses search results with bounded excerpts", () => {
    const parsed = EvidenceSearchResultSchema.parse({
      capabilityBoundarySummary: null,
      documentMapId: "document-map:1",
      evidenceCardId: "evidence-card:1",
      freshness: freshness(),
      id: "result:1",
      limitations: [],
      matchedFields: ["claimText"],
      permittedNextActions: [],
      rank: 1,
      resultKind: "evidence_card",
      safeExcerpts: [
        {
          characterCount: 24,
          citation: {
            citationType: "source_anchor",
            id: "anchor:1",
            summary: "Excerpt citation.",
          },
          redactions: [],
          sourceAnchorId: "anchor:1",
          text: "Policy evidence excerpt.",
          truncated: false,
        },
      ],
      sourceAnchorIds: ["anchor:1"],
      title: "document_map_anchor",
    });

    expect(parsed.safeExcerpts[0]?.truncated).toBe(false);
  });

  it("parses a manifest with read-only tools and no write registration", () => {
    const parsed = ReadOnlyToolManifestSchema.parse({
      appModes: ["local_proof", "internal_developer_mode"],
      forbiddenActions: [
        "create_mission",
        "upload_source",
        "write_finance_twin_fact",
        "take_autonomous_action",
      ],
      localInternalOnly: true,
      noMcpServerStarted: true,
      noWriteToolsRegistered: true,
      schemaVersion: EVIDENCE_TOOL_SCHEMA_VERSION,
      tools: [
        {
          description: "Search existing EvidenceIndex artifacts.",
          name: "search_evidence",
          permissions: ["read_search"],
          readOnly: true,
          safetyBoundary: {
            allowedPermissions: ["read_search"],
            citationPolicy: {
              distinguishDerivedRefs: true,
              sourceAnchorRequiredForPositiveResults: true,
              unsupportedResultsExplainReason: true,
            },
            excerptPolicy: {
              fullFileDumpsAllowed: false,
              maxCharacters: 240,
              requireCitation: true,
              sourceTextTreatedAsUntrustedData: true,
            },
            forbiddenActions: ["write_finance_twin_fact"],
            localInternalOnly: true,
            promptInjectionBoundary: {
              externalUrlFetchingAllowed: false,
              sourceInstructionsIgnored: true,
              sourceTextTreatedAsData: true,
            },
            readOnly: true,
            redactionPolicy: {
              credentialsRedacted: true,
              privateFinanceIdentifiersRedacted: true,
              secretsRedacted: true,
              tokensRedacted: true,
            },
          },
          title: "Search Evidence",
        },
      ],
    });

    expect(parsed.tools.every((tool) => tool.readOnly)).toBe(true);
    expect(ForbiddenToolActionSchema.parse("run_ocr")).toBe("run_ocr");
  });
});
