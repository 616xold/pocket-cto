import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DiscoveryAnswerCard } from "./discovery-answer-card";

describe("DiscoveryAnswerCard", () => {
  it("renders family-specific fallback routes for supported finance discovery questions", () => {
    const html = renderToStaticMarkup(
      <DiscoveryAnswerCard
        answer={null}
        mission={{
          createdAt: "2026-04-15T00:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Answer the stored spend posture question for acme from persisted Finance Twin and CFO Wiki state only.",
          primaryRepo: null,
          sourceKind: "manual_discovery",
          sourceRef: null,
          spec: {
            acceptance: [
              "Persist one durable finance discovery answer artifact.",
            ],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: ["discovery_answer", "proof_bundle"],
            evidenceRequirements: ["stored finance-twin spend-posture route"],
            input: {
              discoveryQuestion: {
                companyKey: "acme",
                questionKind: "spend_posture",
              },
            },
            objective:
              "Answer the stored spend posture question for acme from persisted Finance Twin and CFO Wiki state only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Review spend posture for acme",
            type: "discovery",
          },
          status: "queued",
          title: "Review spend posture for acme",
          type: "discovery",
          updatedAt: "2026-04-15T00:00:00.000Z",
        }}
      />,
    );

    expect(html).toContain("/finance-twin/companies/acme/spend-posture");
    expect(html).toContain("/finance-twin/companies/acme/spend-items");
    expect(html).toContain("Question kind");
    expect(html).toContain("Spend posture");
    expect(html).toContain("Pending answer");
  });

  it("renders stored supported-family answer evidence without cash-only assumptions", () => {
    const html = renderToStaticMarkup(
      <DiscoveryAnswerCard
        answer={{
          source: "stored_finance_twin_and_cfo_wiki",
          summary: "Stored payables pressure is available with limitations.",
          companyKey: "acme",
          questionKind: "payables_pressure",
          answerSummary:
            "Stored payables pressure is available with limitations.",
          freshnessPosture: {
            state: "stale",
            reasonSummary: "Stored payables-aging coverage is stale.",
          },
          limitations: [
            "No payment-timing forecast is performed and visible gaps remain preserved.",
          ],
          relatedRoutes: [
            {
              label: "Payables posture",
              routePath: "/finance-twin/companies/acme/payables-posture",
            },
            {
              label: "Payables aging",
              routePath: "/finance-twin/companies/acme/payables-aging",
            },
          ],
          relatedWikiPages: [
            {
              pageKey: "metrics/payables-posture",
              title: "Payables posture",
            },
            {
              pageKey: "concepts/payables",
              title: "Payables",
            },
          ],
          evidenceSections: [
            {
              key: "payables_posture_route",
              title: "Payables posture route",
              summary: "Stored payables-posture route evidence.",
              routePath: "/finance-twin/companies/acme/payables-posture",
            },
          ],
          bodyMarkdown:
            "# Payables pressure answer\n\nStored payables pressure.",
          structuredData: {},
        }}
        mission={{
          createdAt: "2026-04-15T00:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Answer the stored payables pressure question for acme from persisted Finance Twin and CFO Wiki state only.",
          primaryRepo: null,
          sourceKind: "manual_discovery",
          sourceRef: null,
          spec: {
            acceptance: [
              "Persist one durable finance discovery answer artifact.",
            ],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: ["discovery_answer", "proof_bundle"],
            evidenceRequirements: [
              "stored finance-twin payables-posture route",
            ],
            input: {
              discoveryQuestion: {
                companyKey: "acme",
                questionKind: "payables_pressure",
              },
            },
            objective:
              "Answer the stored payables pressure question for acme from persisted Finance Twin and CFO Wiki state only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Review payables pressure for acme",
            type: "discovery",
          },
          status: "succeeded",
          title: "Review payables pressure for acme",
          type: "discovery",
          updatedAt: "2026-04-15T00:01:00.000Z",
        }}
      />,
    );

    expect(html).toContain("/finance-twin/companies/acme/payables-posture");
    expect(html).toContain("/finance-twin/companies/acme/payables-aging");
    expect(html).toContain("metrics/payables-posture");
    expect(html).toContain("Payables pressure");
    expect(html).toContain("Stale");
    expect(html).not.toContain(">stale<");
    expect(html).not.toContain("/finance-twin/companies/acme/cash-posture");
  });
});
