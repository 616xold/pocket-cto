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
    const { DiscoveryMissionIntakeForm } =
      await import("./discovery-mission-intake-form");
    const html = renderToStaticMarkup(<DiscoveryMissionIntakeForm />);

    expect(html).toContain("Policy lookup");
    expect(html).toContain("Cash posture");
    expect(html).toContain("Collections pressure");
    expect(html).toContain("Payables pressure");
    expect(html).toContain("Spend posture");
    expect(html).toContain("Obligation calendar review");
    expect(html).toContain("Choose a finance question kind");
    expect(html).toContain(
      "What finance posture should I review from stored state, and which evidence gaps matter most?",
    );
    expect(html).toContain("Local web operator");
  });

  it("renders an explicit policy source field when policy lookup is preselected", async () => {
    const { DiscoveryMissionIntakeForm } =
      await import("./discovery-mission-intake-form");
    const html = renderToStaticMarkup(
      <DiscoveryMissionIntakeForm initialQuestionKind="policy_lookup" />,
    );

    expect(html).toContain("Policy source");
    expect(html).toContain("Enter a company key to load bound policy documents");
    expect(html).toContain(
      "Which scoped policy page should I review from stored state, and what limitations or extract gaps remain visible?",
    );
    expect(html).toContain("policy_document");
    expect(html).toContain("policySourceId");
  });
});
