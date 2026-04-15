import { describe, expect, it } from "vitest";
import {
  CreateDiscoveryMissionInputSchema,
  DiscoveryAnswerArtifactMetadataSchema,
  FINANCE_DISCOVERY_QUESTION_KINDS,
  readFinanceDiscoveryQuestionKindLabel,
  readFreshnessLabel,
} from "./discovery-mission";

describe("Discovery mission domain schemas", () => {
  it("parses all supported typed company-scoped finance discovery intakes", () => {
    for (const questionKind of FINANCE_DISCOVERY_QUESTION_KINDS) {
      const parsed = CreateDiscoveryMissionInputSchema.parse({
        companyKey: "acme",
        questionKind,
        operatorPrompt: `Review ${questionKind} from stored state.`,
        requestedBy: "finance-operator",
      });

      expect(parsed).toEqual({
        companyKey: "acme",
        questionKind,
        operatorPrompt: `Review ${questionKind} from stored state.`,
        requestedBy: "finance-operator",
      });
    }
  });

  it("exposes human-readable labels for supported finance discovery families", () => {
    expect(readFinanceDiscoveryQuestionKindLabel("cash_posture")).toBe(
      "Cash posture",
    );
    expect(
      readFinanceDiscoveryQuestionKindLabel("obligation_calendar_review"),
    ).toBe("Obligation calendar review");
  });

  it("exposes human-readable freshness labels for finance artifact copy", () => {
    expect(readFreshnessLabel("stale")).toBe("Stale");
    expect(readFreshnessLabel("pending_answer")).toBe("Pending answer");
    expect(readFreshnessLabel("never_synced")).toBe("Never synced");
    expect(readFreshnessLabel(null)).toBe("Not recorded yet.");
  });

  it("rejects unsupported finance discovery families", () => {
    expect(() =>
      CreateDiscoveryMissionInputSchema.parse({
        companyKey: "acme",
        questionKind: "receivables_aging_review",
        requestedBy: "finance-operator",
      }),
    ).toThrow();
  });

  it("rejects the legacy repo-scoped discovery mission create payload", () => {
    expect(() =>
      CreateDiscoveryMissionInputSchema.parse({
        repoFullName: "616xold/pocket-cfo",
        questionKind: "auth_change",
        changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
        requestedBy: "legacy-operator",
      }),
    ).toThrow();
  });

  it("parses a durable finance discovery answer artifact", () => {
    const parsed = DiscoveryAnswerArtifactMetadataSchema.parse({
      source: "stored_finance_twin_and_cfo_wiki",
      summary: "Cash posture is available but limited by mixed as-of dates.",
      companyKey: "acme",
      questionKind: "cash_posture",
      answerSummary:
        "Stored bank summaries show USD and EUR cash buckets, with mixed as-of dates that should be reviewed before taking action.",
      freshnessPosture: {
        state: "stale",
        reasonSummary:
          "Bank-account summary state is stale relative to the company freshness threshold.",
      },
      limitations: [
        "Cash posture is grouped by reported currency only; no FX conversion is performed.",
      ],
      relatedRoutes: [
        {
          label: "Cash posture",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
      ],
      relatedWikiPages: [
        {
          pageKey: "metrics/cash-posture",
          title: "Cash posture",
        },
      ],
      evidenceSections: [
        {
          key: "cash-posture-route",
          title: "Cash posture route-backed evidence",
          summary: "Read from the stored cash-posture twin view.",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
      ],
      bodyMarkdown:
        "## Summary\n\nStored cash posture is available with limits.",
      structuredData: {
        currencyBucketCount: 2,
      },
    });

    expect(parsed.source).toBe("stored_finance_twin_and_cfo_wiki");
    if (parsed.source !== "stored_finance_twin_and_cfo_wiki") {
      throw new Error("expected finance discovery metadata");
    }

    expect(parsed.questionKind).toBe("cash_posture");
    expect(parsed.relatedWikiPages[0]?.pageKey).toBe("metrics/cash-posture");
  });
});
