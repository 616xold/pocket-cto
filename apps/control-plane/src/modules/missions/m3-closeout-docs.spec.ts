import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDir, "../../../../..");

describe("M3 discovery closeout docs", () => {
  it("keeps the historical isolated discovery proof in the Pocket CTO archive and marks it reference-only in the active docs boundary", () => {
    const activeDocs = readFileSync(
      resolve(repoRoot, "docs/ACTIVE_DOCS.md"),
      "utf8",
    );
    const exitReport = readFileSync(
      resolve(repoRoot, "docs/archive/pocket-cto/ops/m3-exit-report.md"),
      "utf8",
    );
    const execPlan = readFileSync(
      resolve(
        repoRoot,
        "docs/archive/pocket-cto/plans/EP-0029-discovery-mission-ui-proof-and-m3-closeout.md",
      ),
      "utf8",
    );

    expect(exitReport).toContain("pnpm smoke:m3-discovery:live");
    expect(exitReport).toContain("--isolate-db");
    expect(execPlan).toContain("pnpm smoke:m3-discovery:live");
    expect(execPlan).toContain("--isolate-db");
    expect(execPlan).toContain("tools/m3-discovery-mission-smoke.mjs");
    expect(activeDocs).toContain(
      "`docs/archive/pocket-cto/ops/m3-exit-report.md`",
    );
    expect(activeDocs).toContain(
      "`docs/archive/pocket-cto/plans/EP-*.md`",
    );
    expect(activeDocs).toContain("reference-only");
    expect(activeDocs).toContain("archived");
  });
});
