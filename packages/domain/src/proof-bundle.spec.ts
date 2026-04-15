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
    expect(parsed.targetRepoFullName).toBeNull();
  });
});
