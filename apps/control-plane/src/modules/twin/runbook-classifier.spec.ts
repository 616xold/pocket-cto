import { describe, expect, it } from "vitest";
import { parseDocumentationFile } from "./docs-parser";
import { classifyRunbookDocuments } from "./runbook-classifier";

describe("runbook classifier", () => {
  it("classifies the conservative runbook scope deterministically", () => {
    const classified = classifyRunbookDocuments([
      createParsedFile("AGENTS.md", "# Agents\n\nRepository instructions.\n"),
      createParsedFile(
        "README.md",
        [
          "# Pocket CTO",
          "",
          "Evidence-native mission control.",
          "",
          "## Local development",
          "",
          "Run the stack locally.",
          "",
        ].join("\n"),
      ),
      createParsedFile(
        "START_HERE.md",
        "# Start here\n\n## First run\n\n```text\nPrompt\n```\n",
      ),
      createParsedFile("WORKFLOW.md", "# Workflow\n\n## Intent\n\nNotes.\n"),
      createParsedFile("docs/architecture/overview.md", "# Overview\n\nNotes.\n"),
      createParsedFile(
        "docs/ops/local-dev.md",
        "# Local dev\n\n## Commands\n\nNotes.\n",
      ),
    ]);

    expect(
      classified.map((candidate) => ({
        classificationReason: candidate.classificationReason,
        path: candidate.file.path,
      })),
    ).toEqual([
      {
        classificationReason: "docs_ops_path",
        path: "docs/ops/local-dev.md",
      },
      {
        classificationReason: "readme_operational_heading",
        path: "README.md",
      },
      {
        classificationReason: "start_here_root",
        path: "START_HERE.md",
      },
      {
        classificationReason: "workflow_root",
        path: "WORKFLOW.md",
      },
    ]);
  });
});

function createParsedFile(path: string, content: string) {
  return parseDocumentationFile({
    content,
    lineCount: content.split(/\r?\n/).length,
    modifiedAt: "2026-03-19T16:00:00.000Z",
    path,
    sizeBytes: Buffer.byteLength(content, "utf8"),
  });
}
