import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../app/missions/actions", () => ({
  submitDiscoveryMissionIntake: "/missions/analysis",
}));

vi.mock("../lib/operator-identity", () => ({
  getWebOperatorIdentity() {
    return "Local web operator";
  },
}));

describe("DiscoveryMissionIntakeForm", () => {
  it("renders every supported finance discovery family in the intake select", async () => {
    const { DiscoveryMissionIntakeForm } = await import(
      "./discovery-mission-intake-form"
    );
    const html = renderToStaticMarkup(<DiscoveryMissionIntakeForm />);

    expect(html).toContain("cash_posture");
    expect(html).toContain("collections_pressure");
    expect(html).toContain("payables_pressure");
    expect(html).toContain("spend_posture");
    expect(html).toContain("obligation_calendar_review");
    expect(html).toContain("Local web operator");
  });
});
