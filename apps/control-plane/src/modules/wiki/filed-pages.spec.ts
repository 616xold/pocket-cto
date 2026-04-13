import { describe, expect, it } from "vitest";
import { buildFiledPageInput } from "./filed-pages";

describe("buildFiledPageInput", () => {
  it("creates a filed artifact page with explicit provenance metadata", () => {
    const page = buildFiledPageInput({
      existingPages: [],
      filedAt: "2026-04-13T12:10:00.000Z",
      request: {
        title: "Board Deck Notes",
        markdownBody: "Collections remain tight.",
        filedBy: "finance-operator",
        provenanceSummary: "Filed after board review.",
      },
    });

    expect(page.pageKey).toBe("filed/board-deck-notes");
    expect(page.pageKind).toBe("filed_artifact");
    expect(page.ownershipKind).toBe("filed_artifact");
    expect(page.filedMetadata).toMatchObject({
      filedBy: "finance-operator",
      provenanceSummary: "Filed after board review.",
    });
    expect(page.markdownBody).toContain("## Filed Markdown Body");
  });
});
