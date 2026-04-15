import { describe, expect, it } from "vitest";
import { ProofBundleManifestSchema } from "./proof-bundle";

describe("Proof bundle domain schema", () => {
  it("parses a finance-ready discovery proof bundle without repo or PR fields", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Review collections pressure for acme",
      objective: "Answer the stored collections pressure question for acme.",
      companyKey: "acme",
      questionKind: "collections_pressure",
      policySourceId: null,
      answerSummary:
        "Stored collections pressure highlights overdue receivables buckets with visible limitations.",
      freshnessSummary:
        "Finance discovery is stale because the latest receivables-aging sync is older than the freshness threshold.",
      limitationsSummary:
        "No cash-timing inference is performed and mixed as-of dates remain visible.",
      relatedRoutePaths: [
        "/finance-twin/companies/acme/collections-posture",
        "/finance-twin/companies/acme/receivables-aging",
      ],
      relatedWikiPageKeys: [
        "metrics/collections-posture",
        "concepts/receivables",
      ],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Stored bank summaries show USD and EUR cash buckets, with stale bank coverage notes.",
      validationSummary:
        "Finance discovery answer was assembled deterministically from stored Finance Twin and CFO Wiki state.",
      verificationSummary:
        "Review freshness and limitation posture before acting on the answer.",
      riskSummary:
        "Stale bank-summary coverage could leave the operator looking at an outdated cash posture.",
      rollbackSummary: "",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["discovery_answer"],
        presentArtifactKinds: ["discovery_answer"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: ["Scout task 0 produced discovery_answer artifact abc."],
      artifactIds: ["22222222-2222-4222-8222-222222222222"],
      artifacts: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          kind: "discovery_answer",
        },
      ],
      replayEventCount: 6,
      timestamps: {
        missionCreatedAt: "2026-04-14T23:48:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-14T23:49:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.companyKey).toBe("acme");
    expect(parsed.questionKind).toBe("collections_pressure");
    expect(parsed.policySourceId).toBeNull();
    expect(parsed.targetRepoFullName).toBeNull();
  });

  it("parses a policy lookup proof bundle with explicit source scope", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle:
        "Review policy lookup for acme from 22222222-2222-4222-8222-222222222222",
      objective:
        "Answer the stored policy lookup question for acme from scoped policy source 22222222-2222-4222-8222-222222222222.",
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId: "22222222-2222-4222-8222-222222222222",
      answerSummary:
        "Stored policy lookup is limited by a failed deterministic extract.",
      freshnessState: "failed",
      freshnessSummary:
        "The latest deterministic extract failed for the bound policy source.",
      limitationsSummary:
        "This answer stays scoped to one bound policy source and exposes the failed extract posture.",
      relatedRoutePaths: [
        "/cfo-wiki/companies/acme/pages/policies%2F22222222-2222-4222-8222-222222222222",
      ],
      relatedWikiPageKeys: ["concepts/policy-corpus"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Stored policy lookup is limited by a failed deterministic extract.",
      validationSummary:
        "Finance discovery answer was assembled deterministically from stored Finance Twin and CFO Wiki state.",
      verificationSummary:
        "Review the stored policy page, extract-status posture, and visible limitations before acting.",
      riskSummary:
        "The answer remains limited by scoped policy extract failure and should not be treated as broader policy search.",
      rollbackSummary:
        "Retry only after the bound policy evidence is refreshed truthfully.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["discovery_answer"],
        presentArtifactKinds: ["discovery_answer"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: ["Scout task 0 produced discovery_answer artifact xyz."],
      artifactIds: ["22222222-2222-4222-8222-222222222222"],
      artifacts: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          kind: "discovery_answer",
        },
      ],
      replayEventCount: 7,
      timestamps: {
        missionCreatedAt: "2026-04-14T23:48:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-14T23:49:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.questionKind).toBe("policy_lookup");
    expect(parsed.policySourceId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
  });
});
