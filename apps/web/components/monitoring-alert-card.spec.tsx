import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MonitorAlertCard } from "@pocket-cto/domain";
import { MonitoringAlertCard } from "./monitoring-alert-card";

describe("MonitoringAlertCard", () => {
  it("renders source-backed cash-posture alert posture with a manual investigation action", () => {
    const html = renderToStaticMarkup(
      <MonitoringAlertCard
        alertCard={buildAlertCard()}
        monitorResultId="66666666-6666-4666-8666-666666666666"
        requestedBy="finance-operator"
      />,
    );

    expect(html).toContain("Cash posture monitor");
    expect(html).toContain("acme");
    expect(html).toContain("cash_posture");
    expect(html).toContain("Critical");
    expect(html).toContain(
      "Critical because stored cash-posture conditions include missing_source.",
    );
    expect(html).toContain(
      "No successful bank-account-summary slice exists yet.",
    );
    expect(html).toContain("Freshness state");
    expect(html).toContain("Lineage refs");
    expect(html).toContain(
      "No successful bank-account-summary source is stored.",
    );
    expect(html).toContain(
      "No bank-account-summary source lineage is available.",
    );
    expect(html).toContain("limited_by_missing_source");
    expect(html).toContain("Human review next step");
    expect(html).toContain("Create/open investigation");
    expect(html).toContain("66666666-6666-4666-8666-666666666666");

    for (const forbidden of [
      "send",
      "notify",
      "email",
      "slack",
      "publish",
      "pay",
      "book journal",
      "file tax",
    ]) {
      expect(html.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("returns no markup when no alert card is present", () => {
    const html = renderToStaticMarkup(<MonitoringAlertCard alertCard={null} />);

    expect(html).toBe("");
  });

  it("renders a collections-pressure alert without an investigation action", () => {
    const html = renderToStaticMarkup(
      <MonitoringAlertCard
        alertCard={{
          ...buildAlertCard(),
          monitorKind: "collections_pressure",
          deterministicSeverityRationale:
            "Warning because overdue_concentration condition(s) were detected from stored collections-pressure state.",
          conditionSummaries: [
            "USD receivables are 60.00% past due based on source-backed totals.",
          ],
          sourceFreshnessPosture: {
            ...buildAlertCard().sourceFreshnessPosture,
            summary: "The latest successful receivables-aging source is fresh.",
          },
          sourceLineageRefs: [
            {
              sourceId: "22222222-2222-4222-8222-222222222222",
              sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
              sourceFileId: "44444444-4444-4444-8444-444444444444",
              syncRunId: "55555555-5555-4555-8555-555555555555",
              targetKind: "receivables_aging_row",
              targetId: null,
              lineageCount: 3,
              lineageTargetCounts: {
                ...emptyLineageTargetCounts,
                customerCount: 1,
                receivablesAgingRowCount: 1,
              },
              summary:
                "Latest successful receivables-aging source lineage for collections pressure.",
            },
          ],
          sourceLineageSummary:
            "3 receivables-aging lineage record(s) back this monitor result.",
          proofBundlePosture: {
            state: "source_backed",
            summary:
              "The monitor result is backed by the latest stored receivables-aging source lineage.",
          },
          humanReviewNextStep:
            "Review receivables-aging source coverage and collections posture before any external collections action.",
        }}
        monitorResultId="77777777-7777-4777-8777-777777777777"
        requestedBy="finance-operator"
      />,
    );

    expect(html).toContain("Collections pressure monitor");
    expect(html).toContain("collections_pressure");
    expect(html).toContain("overdue_concentration");
    expect(html).toContain("3 receivables-aging lineage record");
    expect(html).not.toContain("Create/open investigation");
    expect(html.toLowerCase()).not.toContain("send");
    expect(html.toLowerCase()).not.toContain("notify");
  });

  it("renders a payables-pressure alert without investigation or payment actions", () => {
    const html = renderToStaticMarkup(
      <MonitoringAlertCard
        alertCard={{
          ...buildAlertCard(),
          monitorKind: "payables_pressure",
          deterministicSeverityRationale:
            "Critical because overdue_concentration condition(s) were detected from stored payables-pressure state.",
          conditionSummaries: [
            "USD payables are 80.00% past due based on source-backed totals.",
          ],
          sourceFreshnessPosture: {
            ...buildAlertCard().sourceFreshnessPosture,
            summary: "The latest successful payables-aging source is fresh.",
          },
          sourceLineageRefs: [
            {
              sourceId: "22222222-2222-4222-8222-222222222222",
              sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
              sourceFileId: "44444444-4444-4444-8444-444444444444",
              syncRunId: "55555555-5555-4555-8555-555555555555",
              targetKind: "payables_aging_row",
              targetId: null,
              lineageCount: 3,
              lineageTargetCounts: {
                ...emptyLineageTargetCounts,
                vendorCount: 1,
                payablesAgingRowCount: 1,
              },
              summary:
                "Latest successful payables-aging source lineage for payables pressure.",
            },
          ],
          sourceLineageSummary:
            "3 payables-aging lineage record(s) back this monitor result.",
          proofBundlePosture: {
            state: "source_backed",
            summary:
              "The monitor result is backed by the latest stored payables-aging source lineage.",
          },
          humanReviewNextStep:
            "Review payables-aging source coverage and payables posture before any external vendor or payment action.",
        }}
        monitorResultId="88888888-8888-4888-8888-888888888888"
        requestedBy="finance-operator"
      />,
    );

    expect(html).toContain("Payables pressure monitor");
    expect(html).toContain("payables_pressure");
    expect(html).toContain("overdue_concentration");
    expect(html).toContain("3 payables-aging lineage record");
    expect(html).not.toContain("Create/open investigation");

    for (const forbidden of [
      "send",
      "notify",
      "email",
      "slack",
      "publish",
      "payment instruction",
      "vendor-payment recommendation",
      "book journal",
      "file tax",
    ]) {
      expect(html.toLowerCase()).not.toContain(forbidden);
    }
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
    sourceLineageRefs: [],
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

const emptyLineageTargetCounts = {
  reportingPeriodCount: 0,
  ledgerAccountCount: 0,
  bankAccountCount: 0,
  bankAccountSummaryCount: 0,
  customerCount: 0,
  receivablesAgingRowCount: 0,
  vendorCount: 0,
  payablesAgingRowCount: 0,
  contractCount: 0,
  contractObligationCount: 0,
  spendRowCount: 0,
  trialBalanceLineCount: 0,
  accountCatalogEntryCount: 0,
  journalEntryCount: 0,
  journalLineCount: 0,
  generalLedgerBalanceProofCount: 0,
};
