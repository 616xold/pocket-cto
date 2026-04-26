import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MonitorAlertCard } from "@pocket-cto/domain";
import { MonitoringAlertCard } from "./monitoring-alert-card";

describe("MonitoringAlertCard", () => {
  it("renders source-backed cash-posture alert posture without action controls", () => {
    const html = renderToStaticMarkup(
      <MonitoringAlertCard alertCard={buildAlertCard()} />,
    );

    expect(html).toContain("Cash posture monitor");
    expect(html).toContain("acme");
    expect(html).toContain("cash_posture");
    expect(html).toContain("Critical");
    expect(html).toContain(
      "Critical because stored cash-posture conditions include missing_source.",
    );
    expect(html).toContain("No successful bank-account-summary slice exists yet.");
    expect(html).toContain("Freshness state");
    expect(html).toContain("No successful bank-account-summary source is stored.");
    expect(html).toContain("No bank-account-summary source lineage is available.");
    expect(html).toContain("limited_by_missing_source");
    expect(html).toContain("Human review next step");

    for (const forbidden of [
      "send",
      "notify",
      "email",
      "slack",
      "publish",
      "pay",
      "book journal",
      "file tax",
      "create investigation mission",
    ]) {
      expect(html.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("returns no markup when no alert card is present", () => {
    const html = renderToStaticMarkup(<MonitoringAlertCard alertCard={null} />);

    expect(html).toBe("");
  });
});

function buildAlertCard(): MonitorAlertCard {
  return {
    companyKey: "acme",
    monitorKind: "cash_posture",
    status: "alert",
    severity: "critical",
    deterministicSeverityRationale:
      "Critical because stored cash-posture conditions include missing_source.",
    conditionSummaries: [
      "No successful bank-account-summary slice exists yet.",
    ],
    sourceFreshnessPosture: {
      state: "missing",
      latestAttemptedSyncRunId: null,
      latestSuccessfulSyncRunId: null,
      latestSuccessfulSource: null,
      missingSource: true,
      failedSource: false,
      summary: "No successful bank-account-summary source is stored.",
    },
    sourceLineageSummary:
      "No bank-account-summary source lineage is available.",
    limitations: [
      "F6A cash-posture monitoring evaluates stored source posture only.",
    ],
    proofBundlePosture: {
      state: "limited_by_missing_source",
      summary:
        "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
    },
    humanReviewNextStep:
      "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
    createdAt: "2026-04-26T12:00:00.000Z",
  };
}
