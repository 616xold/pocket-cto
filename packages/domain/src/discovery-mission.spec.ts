import { describe, expect, it } from "vitest";
import {
  CreateDiscoveryMissionInputSchema,
  DiscoveryAnswerArtifactMetadataSchema,
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
  readFinanceDiscoveryQuestionKindLabel,
  readFreshnessLabel,
} from "./discovery-mission";

describe("Discovery mission domain schemas", () => {
  it("parses all supported typed company-scoped finance discovery intakes", () => {
    for (const questionKind of FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS) {
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
    expect(readFinanceDiscoveryQuestionKindLabel("policy_lookup")).toBe(
      "Policy lookup",
    );
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

  it("requires policySourceId for policy lookup discovery intake", () => {
    const parsed = CreateDiscoveryMissionInputSchema.parse({
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId: "11111111-1111-4111-8111-111111111111",
      operatorPrompt: "Review the travel policy from stored state.",
      requestedBy: "finance-operator",
    });

    expect(parsed).toEqual({
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId: "11111111-1111-4111-8111-111111111111",
      operatorPrompt: "Review the travel policy from stored state.",
      requestedBy: "finance-operator",
    });

    expect(() =>
      CreateDiscoveryMissionInputSchema.parse({
        companyKey: "acme",
        questionKind: "policy_lookup",
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
      policySourceScope: null,
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
    expect(parsed.policySourceId).toBeNull();
  });

  it("parses a policy lookup discovery answer artifact with explicit source scope", () => {
    const parsed = DiscoveryAnswerArtifactMetadataSchema.parse({
      source: "stored_finance_twin_and_cfo_wiki",
      summary: "Stored policy lookup is scoped and limited by extract posture.",
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId: "11111111-1111-4111-8111-111111111111",
      policySourceScope: {
        policySourceId: "11111111-1111-4111-8111-111111111111",
        sourceName: "Travel and expense policy",
        documentRole: "policy_document",
        includeInCompile: true,
        latestExtractStatus: "failed",
        latestSnapshotVersion: 2,
      },
      answerSummary:
        "Stored policy lookup for acme is scoped to policy source 11111111-1111-4111-8111-111111111111. The compiled policy page remains limited by a missing deterministic extract.",
      freshnessPosture: {
        state: "missing",
        reasonSummary:
          "No persisted deterministic extract exists yet for the latest bound policy snapshot.",
      },
      limitations: [
        "This answer is scoped only to the requested policy source and does not search across unrelated policies.",
      ],
      relatedRoutes: [
        {
          label: "Scoped policy page",
          routePath:
            "/cfo-wiki/companies/acme/pages/policies%2F11111111-1111-4111-8111-111111111111",
        },
      ],
      relatedWikiPages: [
        {
          pageKey: "concepts/policy-corpus",
          title: "Policy Corpus",
        },
      ],
      evidenceSections: [
        {
          key: "bound_source_status",
          title: "Bound source status",
          summary: "Latest extract status is missing.",
          routePath: "/cfo-wiki/companies/acme/sources",
        },
      ],
      bodyMarkdown:
        "# Policy lookup answer\n\nStored policy lookup is scoped and limited.",
      structuredData: {
        policySourceId: "11111111-1111-4111-8111-111111111111",
      },
    });

    expect(parsed.questionKind).toBe("policy_lookup");
    if (parsed.questionKind !== "policy_lookup") {
      throw new Error("Expected the parsed answer metadata to stay policy-scoped.");
    }
    expect(parsed.policySourceId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.policySourceScope?.sourceName).toBe("Travel and expense policy");
  });
});
