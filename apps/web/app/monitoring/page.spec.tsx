import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getLatestCashPostureMonitorResult = vi.fn();

vi.mock("../../lib/api", () => ({
  getLatestCashPostureMonitorResult,
}));

vi.mock("../../components/monitoring-alert-card", () => ({
  MonitoringAlertCard(props: { alertCard: { companyKey: string } | null }) {
    return props.alertCard ? (
      <article>monitoring-alert-card:{props.alertCard.companyKey}</article>
    ) : null;
  },
}));

describe("MonitoringPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the latest alert card for the selected company", async () => {
    getLatestCashPostureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: null,
      alertCard: {
        companyKey: "acme",
      },
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(
      await mod.default({ searchParams: Promise.resolve({ companyKey: "acme" }) }),
    );

    expect(getLatestCashPostureMonitorResult).toHaveBeenCalledWith("acme");
    expect(html).toContain("Cash posture alert posture for acme.");
    expect(html).toContain("monitoring-alert-card:acme");
  });

  it("renders a non-alerting latest result without an alert card", async () => {
    getLatestCashPostureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: {
        status: "no_alert",
        severity: "none",
        proofBundlePosture: {
          state: "source_backed",
        },
        deterministicSeverityRationale:
          "No alert because no F6A cash-posture conditions were detected.",
      },
      alertCard: null,
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(getLatestCashPostureMonitorResult).toHaveBeenCalledWith("acme");
    expect(html).toContain("no_alert");
    expect(html).toContain("source_backed");
    expect(html).not.toContain("monitoring-alert-card");
  });
});
