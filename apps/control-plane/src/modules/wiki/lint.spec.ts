import { describe, expect, it } from "vitest";
import { lintCfoWikiState } from "./lint";

describe("lintCfoWikiState", () => {
  it("produces deterministic findings for missing refs, uncited numbers, stale pages, and duplicates", () => {
    const pages = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        companyId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        compileRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        pageKey: "index",
        pageKind: "index" as const,
        ownershipKind: "compiler_owned" as const,
        temporalStatus: "current" as const,
        title: "Index",
        summary: "Index summary",
        markdownBody: "# Index\n\nRevenue 200.",
        freshnessSummary: {
          state: "stale" as const,
          summary: "Stale",
        },
        limitations: [],
        lastCompiledAt: "2026-04-13T12:00:00.000Z",
        filedMetadata: null,
        createdAt: "2026-04-13T12:00:00.000Z",
        updatedAt: "2026-04-13T12:00:00.000Z",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        companyId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        compileRunId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        pageKey: "company/overview",
        pageKind: "company_overview" as const,
        ownershipKind: "compiler_owned" as const,
        temporalStatus: "current" as const,
        title: "Index",
        summary: "Overview summary",
        markdownBody: "# Overview",
        freshnessSummary: {
          state: "fresh" as const,
          summary: "Fresh",
        },
        limitations: [],
        lastCompiledAt: "2026-04-13T12:00:00.000Z",
        filedMetadata: null,
        createdAt: "2026-04-13T12:00:00.000Z",
        updatedAt: "2026-04-13T12:00:00.000Z",
      },
    ];
    const linted = lintCfoWikiState({
      backlinksByPageId: new Map(),
      linksByPageId: new Map(),
      pages,
      refsByPageId: new Map(),
    });

    expect(linted.findingCountsByKind.missing_refs).toBe(2);
    expect(linted.findingCountsByKind.uncited_numeric_claim).toBe(1);
    expect(linted.findingCountsByKind.stale_page).toBe(1);
    expect(linted.findingCountsByKind.duplicate_title).toBe(2);
    expect(linted.findings.map((finding) => finding.findingKind)).toEqual(
      expect.arrayContaining([
        "missing_refs",
        "uncited_numeric_claim",
        "stale_page",
        "duplicate_title",
      ]),
    );
  });
});
