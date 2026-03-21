import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(moduleDir, "../../../../..");

describe("M3 discovery closeout docs", () => {
  it("documents the packaged isolated discovery smoke command in the local-dev guide, exit report, and active ExecPlan", () => {
    const localDevGuide = readFileSync(
      resolve(repoRoot, "docs/ops/local-dev.md"),
      "utf8",
    );
    const exitReport = readFileSync(
      resolve(repoRoot, "docs/ops/m3-exit-report.md"),
      "utf8",
    );
    const execPlan = readFileSync(
      resolve(
        repoRoot,
        "plans/EP-0029-discovery-mission-ui-proof-and-m3-closeout.md",
      ),
      "utf8",
    );

    expect(localDevGuide).toContain("pnpm smoke:m3-discovery:live");
    expect(localDevGuide).toContain("--isolate-db");
    expect(exitReport).toContain("pnpm smoke:m3-discovery:live");
    expect(exitReport).toContain("--isolate-db");
    expect(execPlan).toContain("pnpm smoke:m3-discovery:live");
    expect(execPlan).toContain("--isolate-db");
    expect(execPlan).toContain("tools/m3-discovery-mission-smoke.mjs");
  });
});
