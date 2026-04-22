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
      policySourceScope: null,
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
      policySourceScope: {
        policySourceId: "22222222-2222-4222-8222-222222222222",
        sourceName: "Travel and expense policy",
        documentRole: "policy_document",
        includeInCompile: true,
        latestExtractStatus: "failed",
        latestSnapshotVersion: 2,
      },
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
    expect(parsed.policySourceId).toBe("22222222-2222-4222-8222-222222222222");
    expect(parsed.policySourceScope?.latestExtractStatus).toBe("failed");
  });

  it("parses a reporting proof bundle with source discovery lineage", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Draft finance memo for acme from cash posture discovery",
      objective:
        "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      sourceReportingMissionId: null,
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "finance_memo",
      reportDraftStatus: "draft_only",
      reportSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      reportPublication: {
        storedDraft: true,
        filedMemo: null,
        filedEvidenceAppendix: null,
        latestMarkdownExport: null,
        summary:
          "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
      },
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
      relatedRoutePaths: [
        "/finance-twin/companies/acme/cash-posture",
        "/finance-twin/companies/acme/bank-accounts",
      ],
      relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      validationSummary:
        "Draft finance memo and evidence appendix were compiled deterministically from stored discovery evidence without running the Codex runtime.",
      verificationSummary:
        "Review the linked evidence appendix, carried-forward freshness, and visible limitations before sharing this draft.",
      riskSummary:
        "This memo is draft-only, carries source discovery freshness and limitations forward, and has no release workflow in F5A.",
      rollbackSummary:
        "No release side effect was produced; rerun only after the stored discovery evidence is refreshed first.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["finance_memo", "evidence_appendix"],
        presentArtifactKinds: ["finance_memo", "evidence_appendix"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted reporting evidence.",
      ],
      artifactIds: [
        "33333333-3333-4333-8333-333333333333",
        "44444444-4444-4444-8444-444444444444",
      ],
      artifacts: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          kind: "finance_memo",
        },
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "evidence_appendix",
        },
      ],
      replayEventCount: 8,
      timestamps: {
        missionCreatedAt: "2026-04-18T12:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-18T12:03:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.reportKind).toBe("finance_memo");
    expect(parsed.sourceDiscoveryMissionId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(parsed.reportPublication?.storedDraft).toBe(true);
    expect(parsed.appendixPresent).toBe(true);
  });

  it("parses a board-packet proof bundle with source reporting lineage", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Draft board packet for acme from cash posture reporting",
      objective:
        "Compile one draft board packet from completed reporting mission 33333333-3333-4333-8333-333333333333 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "board_packet",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      circulationReadiness: {
        circulationApprovalStatus: "approved_for_circulation",
        circulationReady: true,
        approvalId: "55555555-5555-4555-8555-555555555555",
        approvalStatus: "approved",
        requestedAt: "2026-04-19T12:04:00.000Z",
        requestedBy: "finance-operator",
        resolvedAt: "2026-04-19T12:06:00.000Z",
        resolvedBy: "finance-reviewer",
        rationale: "Approved for internal circulation.",
        summary:
          "Circulation approval was granted by finance-reviewer; the stored board packet is approved for internal circulation.",
      },
      circulationRecord: {
        circulated: true,
        circulatedAt: "2026-04-19T12:10:00.000Z",
        circulatedBy: "finance-operator",
        circulationChannel: "email",
        circulationNote: "Circulated after approval from the finance mailbox.",
        approvalId: "55555555-5555-4555-8555-555555555555",
        summary:
          "External circulation was logged by finance-operator at 2026-04-19T12:10:00.000Z via email. Circulation note: Circulated after approval from the finance mailbox.",
      },
      circulationChronology: {
        hasCorrections: true,
        correctionCount: 1,
        latestCorrectionSummary:
          "Circulation record correction was appended by finance-operator at 2026-04-19T12:15:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: The original log captured draft completion time.",
        latestCorrection: {
          correctionKey: "board-circulation-correction-1",
          correctedAt: "2026-04-19T12:15:00.000Z",
          correctedBy: "finance-operator",
          correctionReason:
            "The original log captured draft completion time.",
          circulatedAt: "2026-04-19T12:12:00.000Z",
          circulatedBy: "board-chair@example.com",
          circulationChannel: null,
          circulationNote: null,
          effectiveRecord: {
            source: "latest_correction",
            circulated: true,
            circulatedAt: "2026-04-19T12:12:00.000Z",
            circulatedBy: "board-chair@example.com",
            circulationChannel: "email",
            circulationNote:
              "Circulated after approval from the finance mailbox.",
            approvalId: "55555555-5555-4555-8555-555555555555",
            summary:
              "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:15:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
          },
          summary:
            "Circulation record correction was appended by finance-operator at 2026-04-19T12:15:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: The original log captured draft completion time.",
        },
        effectiveRecord: {
          source: "latest_correction",
          circulated: true,
          circulatedAt: "2026-04-19T12:12:00.000Z",
          circulatedBy: "board-chair@example.com",
          circulationChannel: "email",
          circulationNote:
            "Circulated after approval from the finance mailbox.",
          approvalId: "55555555-5555-4555-8555-555555555555",
          summary:
            "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:15:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
        },
        corrections: [
          {
            correctionKey: "board-circulation-correction-1",
            correctedAt: "2026-04-19T12:15:00.000Z",
            correctedBy: "finance-operator",
            correctionReason:
              "The original log captured draft completion time.",
            circulatedAt: "2026-04-19T12:12:00.000Z",
            circulatedBy: "board-chair@example.com",
            circulationChannel: null,
            circulationNote: null,
            effectiveRecord: {
              source: "latest_correction",
              circulated: true,
              circulatedAt: "2026-04-19T12:12:00.000Z",
              circulatedBy: "board-chair@example.com",
              circulationChannel: "email",
              circulationNote:
                "Circulated after approval from the finance mailbox.",
              approvalId: "55555555-5555-4555-8555-555555555555",
              summary:
                "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:15:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
            },
            summary:
              "Circulation record correction was appended by finance-operator at 2026-04-19T12:15:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: The original log captured draft completion time.",
          },
        ],
        summary:
          "1 circulation correction has been appended. The latest effective circulation fact reflects the correction logged by finance-operator at 2026-04-19T12:15:00.000Z.",
      },
      reportSummary:
        "Draft board packet for acme from the completed cash posture reporting mission.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This board packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: [
        "/finance-twin/companies/acme/cash-posture",
        "/finance-twin/companies/acme/bank-accounts",
      ],
      relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft board packet for acme from the completed cash posture reporting mission.",
      validationSummary:
        "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
      verificationSummary:
        "Draft board packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
      riskSummary:
        "This board packet is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, PDF, or slide workflow in F5C1.",
      rollbackSummary:
        "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft board-packet compilation; no release, send, or wiki filing side effect was produced.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["board_packet"],
        presentArtifactKinds: ["board_packet"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted board-packet evidence.",
      ],
      artifactIds: ["44444444-4444-4444-8444-444444444444"],
      artifacts: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "board_packet",
        },
      ],
      replayEventCount: 9,
      timestamps: {
        missionCreatedAt: "2026-04-19T12:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-19T12:03:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.reportKind).toBe("board_packet");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(
      parsed.circulationReadiness?.circulationApprovalStatus,
    ).toBe("approved_for_circulation");
    expect(parsed.circulationRecord?.circulated).toBe(true);
    expect(parsed.circulationRecord?.circulationChannel).toBe("email");
    expect(parsed.circulationChronology?.hasCorrections).toBe(true);
    expect(parsed.circulationChronology?.correctionCount).toBe(1);
    expect(parsed.circulationChronology?.effectiveRecord?.circulatedAt).toBe(
      "2026-04-19T12:12:00.000Z",
    );
    expect(parsed.circulationChronology?.effectiveRecord?.circulatedBy).toBe(
      "board-chair@example.com",
    );
    expect(parsed.reportPublication).toBeNull();
    expect(parsed.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "board_packet",
    ]);
  });

  it("parses a lender-update proof bundle with source reporting lineage", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Draft lender update for acme from cash posture reporting",
      objective:
        "Compile one draft lender update from completed reporting mission 33333333-3333-4333-8333-333333333333 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "lender_update",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      reportSummary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This lender update is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: [
        "/finance-twin/companies/acme/cash-posture",
        "/finance-twin/companies/acme/bank-accounts",
      ],
      relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft lender update for acme from the completed cash posture reporting mission.",
      validationSummary:
        "Draft lender update was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
      verificationSummary:
        "Draft lender update for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
      riskSummary:
        "This lender update is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, diligence, PDF, or slide workflow in F5C2.",
      rollbackSummary:
        "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft lender-update compilation; no release, send, or wiki filing side effect was produced.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["lender_update"],
        presentArtifactKinds: ["lender_update"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted lender-update evidence.",
      ],
      artifactIds: ["44444444-4444-4444-8444-444444444444"],
      artifacts: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "lender_update",
        },
      ],
      replayEventCount: 9,
      timestamps: {
        missionCreatedAt: "2026-04-19T12:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-19T12:03:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.reportKind).toBe("lender_update");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.reportPublication).toBeNull();
    expect(parsed.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "lender_update",
    ]);
  });

  it("parses a diligence-packet proof bundle with source reporting lineage", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle:
        "Draft diligence packet for acme from cash posture reporting",
      objective:
        "Compile one draft diligence packet from completed reporting mission 33333333-3333-4333-8333-333333333333 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
      sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "diligence_packet",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      reportSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
      relatedRoutePaths: [
        "/finance-twin/companies/acme/cash-posture",
        "/finance-twin/companies/acme/bank-accounts",
      ],
      relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission.",
      validationSummary:
        "Draft diligence packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
      verificationSummary:
        "Draft diligence packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
      riskSummary:
        "This diligence packet is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, PDF, or slide workflow in F5C3.",
      rollbackSummary:
        "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft diligence-packet compilation; no release, send, or wiki filing side effect was produced.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["diligence_packet"],
        presentArtifactKinds: ["diligence_packet"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted diligence-packet evidence.",
      ],
      artifactIds: ["44444444-4444-4444-8444-444444444444"],
      artifacts: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "diligence_packet",
        },
      ],
      replayEventCount: 9,
      timestamps: {
        missionCreatedAt: "2026-04-19T12:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: "2026-04-19T12:03:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.reportKind).toBe("diligence_packet");
    expect(parsed.sourceReportingMissionId).toBe(
      "33333333-3333-4333-8333-333333333333",
    );
    expect(parsed.reportPublication).toBeNull();
    expect(parsed.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "diligence_packet",
    ]);
  });

  it("parses lender-update release-readiness posture without redefining proof readiness", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Draft lender update for acme from cash posture reporting",
      objective:
        "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "lender_update",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      releaseReadiness: {
        releaseApprovalStatus: "approved_for_release",
        releaseReady: true,
        approvalId: "44444444-4444-4444-8444-444444444444",
        approvalStatus: "approved",
        requestedAt: "2026-04-20T08:10:00.000Z",
        requestedBy: "finance-operator",
        resolvedAt: "2026-04-20T08:12:00.000Z",
        resolvedBy: "finance-reviewer",
        rationale: "The stored lender update is ready for external release.",
        summary:
          "Release approval was granted by finance-reviewer; the stored lender update is approved for release, but no delivery has been recorded.",
      },
      reportSummary:
        "Draft lender update for acme from the completed finance memo.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This lender update remains delivery-free even after approval.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft lender update for acme from the completed finance memo.",
      validationSummary:
        "Draft lender update was compiled deterministically without runtime drafting.",
      verificationSummary:
        "Review carried-forward freshness, limitations, and release-readiness posture before sharing this draft.",
      riskSummary:
        "This lender update is approved for release from a persisted review path, but actual delivery remains out of scope in F5C4A.",
      rollbackSummary:
        "No actual release side effect was produced; this slice only records approved-for-release posture.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["lender_update"],
        presentArtifactKinds: ["lender_update"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted lender-update evidence.",
        "Latest lender-update release approval is approved_for_release.",
      ],
      artifactIds: ["55555555-5555-4555-8555-555555555555"],
      artifacts: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          kind: "lender_update",
        },
      ],
      replayEventCount: 9,
      timestamps: {
        missionCreatedAt: "2026-04-20T08:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: "2026-04-20T08:12:00.000Z",
        latestArtifactAt: "2026-04-20T08:05:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.status).toBe("ready");
    expect(parsed.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "lender_update",
    ]);
  });

  it("parses diligence-packet release-readiness posture without introducing a release record", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle:
        "Draft diligence packet for acme from cash posture reporting",
      objective:
        "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "diligence_packet",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      releaseRecord: null,
      releaseReadiness: {
        releaseApprovalStatus: "approved_for_release",
        releaseReady: true,
        approvalId: "44444444-4444-4444-8444-444444444444",
        approvalStatus: "approved",
        requestedAt: "2026-04-21T08:10:00.000Z",
        requestedBy: "finance-operator",
        resolvedAt: "2026-04-21T08:12:00.000Z",
        resolvedBy: "finance-reviewer",
        rationale: "The stored diligence packet is ready for external release.",
        summary:
          "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
      },
      reportSummary:
        "Draft diligence packet for acme from the completed finance memo.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free even after approval.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft diligence packet for acme from the completed finance memo.",
      validationSummary:
        "Draft diligence packet was compiled deterministically without runtime drafting.",
      verificationSummary:
        "Review carried-forward freshness, limitations, and release-readiness posture before sharing this draft.",
      riskSummary:
        "This diligence packet is approved for release from a persisted review path, but actual delivery, board circulation, PDF, and slide workflows remain out of scope in F5C4D, and release logging stays explicit and separate.",
      rollbackSummary:
        "No actual release side effect was produced; this slice only records approved-for-release posture.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["diligence_packet"],
        presentArtifactKinds: ["diligence_packet"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted diligence-packet evidence.",
        "Latest diligence packet release approval is approved_for_release.",
      ],
      artifactIds: ["55555555-5555-4555-8555-555555555555"],
      artifacts: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          kind: "diligence_packet",
        },
      ],
      replayEventCount: 9,
      timestamps: {
        missionCreatedAt: "2026-04-21T08:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: "2026-04-21T08:12:00.000Z",
        latestArtifactAt: "2026-04-21T08:05:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.status).toBe("ready");
    expect(parsed.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "diligence_packet",
    ]);
    expect(parsed.releaseRecord).toBeNull();
  });

  it("parses diligence-packet release-record posture separately from release readiness", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle:
        "Draft diligence packet for acme from cash posture reporting",
      objective:
        "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "diligence_packet",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      releaseRecord: {
        released: true,
        releasedAt: "2026-04-21T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "secure_portal",
        releaseNote: "Released after diligence counsel review.",
        approvalId: "44444444-4444-4444-8444-444444444444",
        summary:
          "External release was logged by finance-operator at 2026-04-21T09:10:00.000Z via secure_portal. Release note: Released after diligence counsel review..",
      },
      releaseReadiness: {
        releaseApprovalStatus: "approved_for_release",
        releaseReady: true,
        approvalId: "44444444-4444-4444-8444-444444444444",
        approvalStatus: "approved",
        requestedAt: "2026-04-21T08:10:00.000Z",
        requestedBy: "finance-operator",
        resolvedAt: "2026-04-21T08:12:00.000Z",
        resolvedBy: "finance-reviewer",
        rationale: "The stored diligence packet is ready for external release.",
        summary:
          "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
      },
      reportSummary:
        "Draft diligence packet for acme from the completed finance memo.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This diligence packet remains delivery-free even after approval.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft diligence packet for acme from the completed finance memo.",
      validationSummary:
        "Draft diligence packet was compiled deterministically without runtime drafting.",
      verificationSummary:
        "An operator-entered external release log is present while Pocket CFO still did not send or distribute the diligence packet.",
      riskSummary:
        "This diligence packet has one persisted external release record linked to an approved release-review trace, but Pocket CFO still did not send, distribute, publish, start board circulation, generate PDF, or generate slides in F5C4D.",
      rollbackSummary:
        "No system send, distribute, publish, board circulation, PDF export, or slide export side effect was produced; this slice only records an operator-entered external release log against the approved diligence packet.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["diligence_packet"],
        presentArtifactKinds: ["diligence_packet"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted diligence-packet evidence.",
        "Latest diligence packet release approval is approved_for_release.",
        "An external release log is attached to the approved report_release record.",
      ],
      artifactIds: ["55555555-5555-4555-8555-555555555555"],
      artifacts: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          kind: "diligence_packet",
        },
      ],
      replayEventCount: 10,
      timestamps: {
        missionCreatedAt: "2026-04-21T08:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: "2026-04-21T09:10:00.000Z",
        latestArtifactAt: "2026-04-21T08:05:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.releaseRecord?.released).toBe(true);
    expect(parsed.releaseRecord?.releaseChannel).toBe("secure_portal");
  });

  it("parses lender-update release-record posture separately from release readiness", () => {
    const parsed = ProofBundleManifestSchema.parse({
      missionId: "11111111-1111-4111-8111-111111111111",
      missionTitle: "Draft lender update for acme from cash posture reporting",
      objective:
        "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
      sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
      sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary: "",
      reportKind: "lender_update",
      reportDraftStatus: "draft_only",
      reportPublication: null,
      releaseRecord: {
        released: true,
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        approvalId: "44444444-4444-4444-8444-444444444444",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
      },
      releaseReadiness: {
        releaseApprovalStatus: "approved_for_release",
        releaseReady: true,
        approvalId: "44444444-4444-4444-8444-444444444444",
        approvalStatus: "approved",
        requestedAt: "2026-04-20T08:10:00.000Z",
        requestedBy: "finance-operator",
        resolvedAt: "2026-04-20T08:12:00.000Z",
        resolvedBy: "finance-reviewer",
        rationale: "The stored lender update is ready for external release.",
        summary:
          "Release approval was granted by finance-reviewer; the stored lender update is approved for release, but no delivery has been recorded.",
      },
      reportSummary:
        "Draft lender update for acme from the completed finance memo.",
      appendixPresent: true,
      freshnessState: "stale",
      freshnessSummary:
        "Cash posture remains stale because bank coverage is stale.",
      limitationsSummary:
        "This lender update remains delivery-free even after approval.",
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      targetRepoFullName: null,
      branchName: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      changeSummary:
        "Draft lender update for acme from the completed finance memo.",
      validationSummary:
        "Draft lender update was compiled deterministically without runtime drafting.",
      verificationSummary:
        "An operator-entered external release log is present while Pocket CFO still did not send or distribute the lender update.",
      riskSummary:
        "The release log records external delivery timing only; the system still did not send or publish the lender update itself.",
      rollbackSummary:
        "No system-side release action occurred, so rollback remains documentation-only.",
      latestApproval: null,
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: ["lender_update"],
        presentArtifactKinds: ["lender_update"],
        missingArtifactKinds: [],
        notes: [],
      },
      decisionTrace: [
        "Scout task 0 terminalized as succeeded with persisted lender-update evidence.",
        "Latest lender-update release approval is approved_for_release.",
        "An external release log is attached to the approved report_release record.",
      ],
      artifactIds: ["55555555-5555-4555-8555-555555555555"],
      artifacts: [
        {
          id: "55555555-5555-4555-8555-555555555555",
          kind: "lender_update",
        },
      ],
      replayEventCount: 10,
      timestamps: {
        missionCreatedAt: "2026-04-20T08:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: "2026-04-20T09:10:00.000Z",
        latestArtifactAt: "2026-04-20T08:05:00.000Z",
      },
      status: "ready",
    });

    expect(parsed.releaseReadiness?.releaseReady).toBe(true);
    expect(parsed.releaseRecord?.released).toBe(true);
    expect(parsed.releaseRecord?.releaseChannel).toBe("email");
  });
});
