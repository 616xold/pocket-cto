import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DeliveryReadinessResult } from "@pocket-cto/domain";
import { DeliveryReadinessCard } from "./delivery-readiness-card";

describe("DeliveryReadinessCard", () => {
  it("renders delivery-readiness targets, evidence posture, review steps, and no-send boundary facts", () => {
    const html = renderToStaticMarkup(
      <DeliveryReadinessCard readiness={buildReadiness()} />,
    );

    expect(html).toContain("F6M delivery-readiness boundary");
    expect(html).toContain("acme");
    expect(html).toContain("needs_review_before_delivery");
    expect(html).toContain("monitor_posture_target");
    expect(html).toContain("acknowledgement_readiness_target");
    expect(html).toContain("source_backed");
    expect(html).toContain("limited_by_coverage_gap");
    expect(html).toContain("Human-review next step");
    expect(html).toContain(
      "internal_review_only_no_send_no_provider_no_outbox",
    );
    expect(html).toContain("notificationProviderCalled");
    expect(html).toContain("generatedNotificationProseCreated");
    expect(html).toContain("sourceMutationCreated");
    expect(html).toContain("false");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<a ");

    for (const forbiddenButtonLabel of [
      "Send",
      "Notify",
      "Publish",
      "Deliver",
      "Schedule",
      "Approve",
      "Create report",
      "Create mission",
      "Pay",
      "Book journal",
      "File tax",
      "Contact customer",
      "Collect payment",
      "Ask Codex",
      "Remediate",
      "Rerun monitor",
    ]) {
      expect(html).not.toContain(`<button>${forbiddenButtonLabel}</button>`);
    }
  });

  it("renders a quiet empty posture when no delivery readiness is available", () => {
    const html = renderToStaticMarkup(
      <DeliveryReadinessCard readiness={null} />,
    );

    expect(html).toContain("No delivery-readiness posture");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
  });
});

function buildReadiness(): DeliveryReadinessResult {
  return {
    companyKey: "acme",
    generatedAt: "2026-04-28T12:00:00.000Z",
    aggregateStatus: "needs_review_before_delivery",
    deliveryReadinessTargets: [
      {
        targetKey:
          "operator-readiness:item:monitor:cash_posture:11111111-1111-4111-8111-111111111111",
        targetKind: "monitor_posture_target",
        status: "needs_review_before_delivery",
        evidenceBasis: {
          basisKind: "monitor_posture",
          summary: "Monitor posture is derived from F6J operator readiness.",
          refs: [],
        },
        sourceLineageRefs: [],
        sourcePosture: {
          state: "source_backed",
          summary: "Monitor source posture is source-backed.",
          missingSource: false,
          refs: [],
        },
        freshnessSummary: {
          state: "fresh",
          summary: "Monitor source freshness is fresh.",
          latestObservedAt: "2026-04-28T12:00:00.000Z",
        },
        limitations: [
          "This target is internal delivery-readiness posture only and no send occurred.",
        ],
        proofPosture: {
          state: "limited_by_coverage_gap",
          summary: "Monitor proof posture needs review.",
        },
        humanReviewNextStep:
          "Review monitor posture before any future delivery review.",
        relatedOperatorReadinessItemKey:
          "monitor:cash_posture:11111111-1111-4111-8111-111111111111",
        relatedAcknowledgementTargetKey: null,
        relatedMonitorKind: "cash_posture",
        relatedChecklistItemFamily: null,
      },
      {
        targetKey: "acknowledgement-readiness:aggregate",
        targetKind: "acknowledgement_readiness_target",
        status: "ready_for_delivery_review",
        evidenceBasis: {
          basisKind: "acknowledgement_readiness_posture",
          summary: "Acknowledgement posture is derived from F6K readiness.",
          refs: [],
        },
        sourceLineageRefs: [],
        sourcePosture: {
          state: "source_backed",
          summary: "Acknowledgement source posture is available.",
          missingSource: false,
          refs: [],
        },
        freshnessSummary: {
          state: "fresh",
          summary: "Acknowledgement freshness is current.",
          latestObservedAt: "2026-04-28T12:00:00.000Z",
        },
        limitations: [
          "Acknowledgement target remains internal review posture.",
        ],
        proofPosture: {
          state: "source_backed",
          summary: "Acknowledgement proof is source-backed.",
        },
        humanReviewNextStep:
          "Review acknowledgement posture before any future delivery review.",
        relatedOperatorReadinessItemKey: null,
        relatedAcknowledgementTargetKey: "close-control:checklist-aggregate",
        relatedMonitorKind: null,
        relatedChecklistItemFamily: null,
      },
    ],
    evidenceSummary:
      "Delivery readiness is derived from F6J and F6K posture only.",
    limitations: [
      "Delivery readiness is internal review posture and no send occurred.",
    ],
    runtimeActionBoundary: {
      runtimeCodexUsed: false,
      deliveryCreated: false,
      outboxSendCreated: false,
      notificationProviderCalled: false,
      emailSent: false,
      slackSent: false,
      smsSent: false,
      webhookCalled: false,
      reportCreated: false,
      approvalCreated: false,
      missionCreated: false,
      monitorRunTriggered: false,
      monitorResultCreated: false,
      sourceMutationCreated: false,
      generatedNotificationProseCreated: false,
      accountingWriteCreated: false,
      bankWriteCreated: false,
      taxFilingCreated: false,
      legalAdviceGenerated: false,
      policyAdviceGenerated: false,
      paymentInstructionCreated: false,
      collectionInstructionCreated: false,
      customerContactInstructionCreated: false,
      autonomousActionCreated: false,
      summary:
        "Delivery readiness rendering is internal review only and no send occurred.",
      replayImplication:
        "The delivery-readiness result is not appended to mission replay in this F6M slice.",
    },
  };
}
