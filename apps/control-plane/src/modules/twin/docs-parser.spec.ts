import { describe, expect, it } from "vitest";
import { parseDocumentationFile } from "./docs-parser";

describe("docs parser", () => {
  it("extracts headings deterministically and ignores front matter plus fenced code", () => {
    const content = [
      "---",
      "title: ignored front matter",
      "---",
      "# Intro",
      "",
      "Pocket CTO overview.",
      "",
      "## Details",
      "",
      "More detail for the operator.",
      "",
      "```md",
      "# ignored fenced heading",
      "```",
      "",
      "### Duplicate",
      "",
      "First duplicate body.",
      "",
      "### Duplicate",
      "",
      "Second duplicate body.",
      "",
      "Overview",
      "--------",
      "",
      "Setext section body.",
      "",
    ].join("\n");
    const input = {
      content,
      lineCount: content.split(/\r?\n/).length,
      modifiedAt: "2026-03-19T14:00:00.000Z",
      path: "docs/architecture/overview.md",
      sizeBytes: Buffer.byteLength(content, "utf8"),
    };

    const first = parseDocumentationFile(input);
    const second = parseDocumentationFile(input);

    expect(second).toEqual(first);
    expect(first.titleFallback).toBe("Intro");
    expect(first.sections).toMatchObject([
      {
        anchor: "intro",
        contentStartLineIndex: 4,
        endLineIndexExclusive: 7,
        excerpt: "Pocket CTO overview.",
        headingLevel: 1,
        headingPath: "Intro",
        headingText: "Intro",
        ordinal: 1,
        sourceFilePath: "docs/architecture/overview.md",
        stableKey: "docs/architecture/overview.md#section:1",
      },
      {
        anchor: "details",
        contentStartLineIndex: 8,
        endLineIndexExclusive: 15,
        excerpt: "More detail for the operator.",
        headingLevel: 2,
        headingPath: "Intro > Details",
        headingText: "Details",
        ordinal: 2,
        sourceFilePath: "docs/architecture/overview.md",
        stableKey: "docs/architecture/overview.md#section:2",
      },
      {
        anchor: "duplicate",
        contentStartLineIndex: 16,
        endLineIndexExclusive: 19,
        excerpt: "First duplicate body.",
        headingLevel: 3,
        headingPath: "Intro > Details > Duplicate",
        headingText: "Duplicate",
        ordinal: 3,
        sourceFilePath: "docs/architecture/overview.md",
        stableKey: "docs/architecture/overview.md#section:3",
      },
      {
        anchor: "duplicate-1",
        contentStartLineIndex: 20,
        endLineIndexExclusive: 23,
        excerpt: "Second duplicate body.",
        headingLevel: 3,
        headingPath: "Intro > Details > Duplicate",
        headingText: "Duplicate",
        ordinal: 4,
        sourceFilePath: "docs/architecture/overview.md",
        stableKey: "docs/architecture/overview.md#section:4",
      },
      {
        anchor: "overview",
        contentStartLineIndex: 25,
        endLineIndexExclusive: 28,
        excerpt: "Setext section body.",
        headingLevel: 2,
        headingPath: "Intro > Overview",
        headingText: "Overview",
        ordinal: 5,
        sourceFilePath: "docs/architecture/overview.md",
        stableKey: "docs/architecture/overview.md#section:5",
      },
    ]);
  });
});
