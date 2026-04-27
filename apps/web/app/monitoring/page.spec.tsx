import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getLatestCashPostureMonitorResult = vi.fn();
const getLatestCollectionsPressureMonitorResult = vi.fn();
const getLatestPayablesPressureMonitorResult = vi.fn();

vi.mock("../../lib/api", () => ({
  getLatestCashPostureMonitorResult,
  getLatestCollectionsPressureMonitorResult,
  getLatestPayablesPressureMonitorResult,
}));

vi.mock("../../components/monitoring-alert-card", () => ({
  MonitoringAlertCard(props: {
    alertCard: { companyKey: string } | null;
    monitorResultId?: string | null;
  }) {
    return props.alertCard ? (
      <article>
        monitoring-alert-card:{props.alertCard.companyKey}:
        {props.monitorResultId}
      </article>
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
      monitorResult: {
        id: "66666666-6666-4666-8666-666666666666",
        status: "alert",
      },
      alertCard: {
        companyKey: "acme",
      },
    });
    getLatestCollectionsPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResult: {
        status: "no_alert",
        severity: "none",
        proofBundlePosture: {
          state: "source_backed",
        },
        deterministicSeverityRationale:
          "No alert because no F6C collections-pressure conditions were detected.",
      },
      alertCard: null,
    });
    getLatestPayablesPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResult: {
        status: "no_alert",
        severity: "none",
        proofBundlePosture: {
          state: "source_backed",
        },
        deterministicSeverityRationale:
          "No alert because no F6D payables-pressure conditions were detected.",
      },
      alertCard: null,
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(
      await mod.default({
        searchParams: Promise.resolve({ companyKey: "acme" }),
      }),
    );

    expect(getLatestCashPostureMonitorResult).toHaveBeenCalledWith("acme");
    expect(getLatestCollectionsPressureMonitorResult).toHaveBeenCalledWith(
      "acme",
    );
    expect(getLatestPayablesPressureMonitorResult).toHaveBeenCalledWith("acme");
    expect(html).toContain("Monitor alert posture for acme.");
    expect(html).toContain(
      "monitoring-alert-card:acme:66666666-6666-4666-8666-666666666666",
    );
    expect(html).toContain("Collections pressure monitor");
    expect(html).toContain("Payables pressure monitor");
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
    getLatestCollectionsPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResult: {
        status: "no_alert",
        severity: "none",
        proofBundlePosture: {
          state: "source_backed",
        },
        deterministicSeverityRationale:
          "No alert because no F6C collections-pressure conditions were detected.",
      },
      alertCard: null,
    });
    getLatestPayablesPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResult: {
        status: "no_alert",
        severity: "none",
        proofBundlePosture: {
          state: "source_backed",
        },
        deterministicSeverityRationale:
          "No alert because no F6D payables-pressure conditions were detected.",
      },
      alertCard: null,
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(getLatestCashPostureMonitorResult).toHaveBeenCalledWith("acme");
    expect(getLatestCollectionsPressureMonitorResult).toHaveBeenCalledWith(
      "acme",
    );
    expect(getLatestPayablesPressureMonitorResult).toHaveBeenCalledWith("acme");
    expect(html).toContain("no_alert");
    expect(html).toContain("source_backed");
    expect(html).not.toContain("monitoring-alert-card");
  });

  it("does not render the alert action shell without an alerting result", async () => {
    getLatestCashPostureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: null,
      alertCard: {
        companyKey: "acme",
      },
    });
    getLatestCollectionsPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResult: null,
      alertCard: {
        companyKey: "acme",
      },
    });
    getLatestPayablesPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResult: null,
      alertCard: {
        companyKey: "acme",
      },
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(html).not.toContain("monitoring-alert-card");
  });

  it("renders a collections alert card without relying on cash handoff behavior", async () => {
    getLatestCashPostureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: null,
      alertCard: null,
    });
    getLatestCollectionsPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResult: {
        id: "77777777-7777-4777-8777-777777777777",
        status: "alert",
      },
      alertCard: {
        companyKey: "acme",
      },
    });
    getLatestPayablesPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResult: null,
      alertCard: null,
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(html).toContain(
      "monitoring-alert-card:acme:77777777-7777-4777-8777-777777777777",
    );
  });

  it("renders a payables alert card without relying on cash handoff behavior", async () => {
    getLatestCashPostureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "cash_posture",
      monitorResult: null,
      alertCard: null,
    });
    getLatestCollectionsPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "collections_pressure",
      monitorResult: null,
      alertCard: null,
    });
    getLatestPayablesPressureMonitorResult.mockResolvedValue({
      companyKey: "acme",
      monitorKind: "payables_pressure",
      monitorResult: {
        id: "88888888-8888-4888-8888-888888888888",
        status: "alert",
      },
      alertCard: {
        companyKey: "acme",
      },
    });

    const mod = await import("./page");
    const html = renderToStaticMarkup(await mod.default({}));

    expect(html).toContain(
      "monitoring-alert-card:acme:88888888-8888-4888-8888-888888888888",
    );
  });
});
