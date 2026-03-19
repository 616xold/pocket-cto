import { describe, expect, it } from "vitest";
import { parseDocumentationFile } from "./docs-parser";
import { extractRunbookDocument } from "./runbook-parser";

describe("runbook parser", () => {
  it("extracts deterministic runbook steps from fenced shell blocks and safe command bullets", () => {
    const content = [
      "# Local development",
      "",
      "## Bootstrap",
      "",
      "```bash",
      "pnpm install",
      "# comment that should be ignored",
      "DATABASE_URL=postgres://localhost/pocket_cto \\",
      "TEST_DATABASE_URL=postgres://localhost/pocket_cto_test \\",
      "node tools/ci-prepare-postgres.mjs",
      "```",
      "",
      "- `curl http://localhost:4000/health`",
      "",
      "## Verify",
      "",
      "```shell",
      "git status --short",
      "docker compose up -d",
      "```",
      "",
    ].join("\n");
    const discoveredFile = {
      content,
      lineCount: content.split(/\r?\n/).length,
      modifiedAt: "2026-03-19T16:10:00.000Z",
      path: "docs/ops/local-dev.md",
      sizeBytes: Buffer.byteLength(content, "utf8"),
    };
    const parsedFile = parseDocumentationFile(discoveredFile);

    const first = extractRunbookDocument({
      classificationReason: "docs_ops_path",
      discoveredFile,
      parsedFile,
    });
    const second = extractRunbookDocument({
      classificationReason: "docs_ops_path",
      discoveredFile,
      parsedFile,
    });

    expect(second).toEqual(first);
    expect(first.steps).toEqual([
      {
        commandFamily: "pnpm",
        commandText: "pnpm install",
        headingContext: "Local development > Bootstrap",
        ordinal: 1,
        purposeLabel: "Bootstrap",
        sourceDocPath: "docs/ops/local-dev.md",
        stableKey: "docs/ops/local-dev.md#step:1",
      },
      {
        commandFamily: "node",
        commandText: [
          "DATABASE_URL=postgres://localhost/pocket_cto \\",
          "TEST_DATABASE_URL=postgres://localhost/pocket_cto_test \\",
          "node tools/ci-prepare-postgres.mjs",
        ].join("\n"),
        headingContext: "Local development > Bootstrap",
        ordinal: 2,
        purposeLabel: "Bootstrap",
        sourceDocPath: "docs/ops/local-dev.md",
        stableKey: "docs/ops/local-dev.md#step:2",
      },
      {
        commandFamily: "curl",
        commandText: "curl http://localhost:4000/health",
        headingContext: "Local development > Bootstrap",
        ordinal: 3,
        purposeLabel: "Bootstrap",
        sourceDocPath: "docs/ops/local-dev.md",
        stableKey: "docs/ops/local-dev.md#step:3",
      },
      {
        commandFamily: "git",
        commandText: "git status --short",
        headingContext: "Local development > Verify",
        ordinal: 4,
        purposeLabel: "Verify",
        sourceDocPath: "docs/ops/local-dev.md",
        stableKey: "docs/ops/local-dev.md#step:4",
      },
      {
        commandFamily: "docker",
        commandText: "docker compose up -d",
        headingContext: "Local development > Verify",
        ordinal: 5,
        purposeLabel: "Verify",
        sourceDocPath: "docs/ops/local-dev.md",
        stableKey: "docs/ops/local-dev.md#step:5",
      },
    ]);
  });
});
