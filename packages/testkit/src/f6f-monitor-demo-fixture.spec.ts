import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const fixtureRoot = join(process.cwd(), "fixtures", "f6f-monitor-demo-stack");

describe("F6F monitor demo fixture", () => {
  it("keeps a static source-backed expected-output contract", () => {
    const expected = JSON.parse(
      readFileSync(join(fixtureRoot, "expected-monitor-results.json"), "utf8"),
    ) as {
      demoCompany: { companyKey: string };
      monitorResults: Record<string, { monitorKind: string }>;
      sourceFiles: Array<{ path: string }>;
      cashInvestigationHandoff: { expected: boolean; monitorKind: string };
      collectionsInvestigationHandoff: {
        expected: boolean;
        monitorKind: string;
      };
      absenceAssertions: Record<string, boolean>;
    };

    expect(expected.demoCompany.companyKey).toBe("demo-monitor-stack");
    expect(Object.keys(expected.monitorResults).sort()).toEqual([
      "cash_posture",
      "collections_pressure",
      "payables_pressure",
      "policy_covenant_threshold",
    ]);
    expect(expected.cashInvestigationHandoff).toMatchObject({
      expected: true,
      monitorKind: "cash_posture",
    });
    expect(expected.collectionsInvestigationHandoff).toMatchObject({
      expected: true,
      monitorKind: "collections_pressure",
    });
    expect(expected.absenceAssertions).toMatchObject({
      payablesOrPolicyInvestigationsCreated: false,
      reportArtifactsCreated: false,
      approvalsCreated: false,
      deliveryOutboxEventsCreated: false,
      runtimeCodexThreadsCreated: false,
      paymentInstructionsCreated: false,
      newMonitorFamilyAdded: false,
      newDiscoveryFamilyAdded: false,
    });

    for (const sourceFile of expected.sourceFiles) {
      const body = readFileSync(join(fixtureRoot, sourceFile.path), "utf8");
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });
});
