import { describe, expect, it } from "vitest";
import { MissionDetailViewSchema } from "./mission-detail";

describe("Mission detail domain schema", () => {
  it("parses finance discovery mission detail with a stored answer artifact", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "discovery",
        status: "succeeded",
        title: "Review obligation calendar for acme",
        objective: "Answer the stored obligation calendar question for acme.",
        sourceKind: "manual_discovery",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "discovery",
          title: "Review obligation calendar for acme",
          objective: "Answer the stored obligation calendar question for acme.",
          repos: [],
          acceptance: ["persist one durable finance discovery answer artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["discovery_answer", "proof_bundle"],
          input: {
            discoveryQuestion: {
              companyKey: "acme",
              questionKind: "obligation_calendar_review",
            },
          },
        },
        createdAt: "2026-04-14T23:48:00.000Z",
        updatedAt: "2026-04-14T23:49:00.000Z",
      },
      tasks: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          missionId: "11111111-1111-4111-8111-111111111111",
          role: "scout",
          sequence: 0,
          status: "succeeded",
          attemptCount: 1,
          codexThreadId: null,
          codexTurnId: null,
          workspaceId: null,
          dependsOnTaskId: null,
          summary: "Stored obligation calendar review is available with limitations.",
          createdAt: "2026-04-14T23:48:00.000Z",
          updatedAt: "2026-04-14T23:49:00.000Z",
        },
      ],
      proofBundle: {
        missionId: "11111111-1111-4111-8111-111111111111",
        missionTitle: "Review obligation calendar for acme",
        objective: "Answer the stored obligation calendar question for acme.",
        companyKey: "acme",
        questionKind: "obligation_calendar_review",
        policySourceId: null,
        policySourceScope: null,
        answerSummary: "Stored obligation calendar review is available with limitations.",
        freshnessSummary: "Contract metadata coverage is stale.",
        limitationsSummary:
          "No legal interpretation is performed and visible obligation gaps remain preserved.",
        relatedRoutePaths: [
          "/finance-twin/companies/acme/obligation-calendar",
          "/finance-twin/companies/acme/contracts",
        ],
        relatedWikiPageKeys: ["metrics/obligation-calendar"],
        targetRepoFullName: null,
        branchName: null,
        pullRequestNumber: null,
        pullRequestUrl: null,
        changeSummary: "Stored obligation calendar review is available with limitations.",
        validationSummary:
          "Finance discovery answer was assembled deterministically from stored state.",
        verificationSummary:
          "Review freshness and limitation posture before acting on the answer.",
        riskSummary: "Stale bank-summary coverage could leave cash posture outdated.",
        rollbackSummary: "",
        latestApproval: null,
        evidenceCompleteness: {
          status: "complete",
          expectedArtifactKinds: ["discovery_answer"],
          presentArtifactKinds: ["discovery_answer"],
          missingArtifactKinds: [],
          notes: [],
        },
        decisionTrace: ["Scout task 0 produced discovery_answer artifact xyz."],
        artifactIds: ["33333333-3333-4333-8333-333333333333"],
        artifacts: [
          {
            id: "33333333-3333-4333-8333-333333333333",
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
      },
      discoveryAnswer: {
        source: "stored_finance_twin_and_cfo_wiki",
        summary: "Stored obligation calendar review is available with limitations.",
        companyKey: "acme",
        questionKind: "obligation_calendar_review",
        policySourceScope: null,
        answerSummary: "Stored obligation calendar review is available with limitations.",
        freshnessPosture: {
          state: "stale",
          reasonSummary: "Contract metadata coverage is stale.",
        },
        limitations: [
          "No legal interpretation is performed and visible obligation gaps remain preserved.",
        ],
        relatedRoutes: [
          {
            label: "Obligation calendar",
            routePath: "/finance-twin/companies/acme/obligation-calendar",
          },
        ],
        relatedWikiPages: [
          {
            pageKey: "metrics/obligation-calendar",
            title: "Obligation calendar",
          },
        ],
        evidenceSections: [
          {
            key: "obligation-calendar-route",
            title: "Obligation calendar route-backed evidence",
            summary: "Stored Finance Twin obligation calendar route result.",
            routePath: "/finance-twin/companies/acme/obligation-calendar",
          },
        ],
        bodyMarkdown:
          "## Summary\n\nStored obligation calendar review is available with limitations.",
        structuredData: {},
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.discoveryAnswer?.source).toBe(
      "stored_finance_twin_and_cfo_wiki",
    );
    if (parsed.discoveryAnswer?.source !== "stored_finance_twin_and_cfo_wiki") {
      throw new Error("expected finance discovery answer");
    }

    expect(parsed.discoveryAnswer?.companyKey).toBe("acme");
    expect(parsed.proofBundle.questionKind).toBe("obligation_calendar_review");
  });

  it("parses policy lookup mission detail with explicit policy source scope", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "discovery",
        status: "succeeded",
        title:
          "Review policy lookup for acme from 22222222-2222-4222-8222-222222222222",
        objective:
          "Answer the stored policy lookup question for acme from scoped policy source 22222222-2222-4222-8222-222222222222.",
        sourceKind: "manual_discovery",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "discovery",
          title:
            "Review policy lookup for acme from 22222222-2222-4222-8222-222222222222",
          objective:
            "Answer the stored policy lookup question for acme from scoped policy source 22222222-2222-4222-8222-222222222222.",
          repos: [],
          acceptance: [
            "persist one durable finance discovery answer artifact",
          ],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["discovery_answer", "proof_bundle"],
          input: {
            discoveryQuestion: {
              companyKey: "acme",
              questionKind: "policy_lookup",
              policySourceId: "22222222-2222-4222-8222-222222222222",
            },
          },
        },
        createdAt: "2026-04-14T23:48:00.000Z",
        updatedAt: "2026-04-14T23:49:00.000Z",
      },
      tasks: [],
      proofBundle: {
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
          latestExtractStatus: null,
          latestSnapshotVersion: 2,
        },
        answerSummary:
          "Stored policy lookup is limited by a missing deterministic extract.",
        freshnessState: "missing",
        freshnessSummary:
          "No persisted deterministic extract exists yet for the latest bound policy snapshot.",
        limitationsSummary:
          "This answer stays scoped to one policy source and exposes visible extract gaps.",
        relatedRoutePaths: [
          "/cfo-wiki/companies/acme/pages/policies%2F22222222-2222-4222-8222-222222222222",
        ],
        relatedWikiPageKeys: ["concepts/policy-corpus"],
        targetRepoFullName: null,
        branchName: null,
        pullRequestNumber: null,
        pullRequestUrl: null,
        changeSummary:
          "Stored policy lookup is limited by a missing deterministic extract.",
        validationSummary:
          "Finance discovery answer was assembled deterministically from stored state.",
        verificationSummary:
          "Review the stored policy page and extract-status posture before acting.",
        riskSummary:
          "The answer is scoped to one policy source and should not be treated as broader retrieval.",
        rollbackSummary: "",
        latestApproval: null,
        evidenceCompleteness: {
          status: "complete",
          expectedArtifactKinds: ["discovery_answer"],
          presentArtifactKinds: ["discovery_answer"],
          missingArtifactKinds: [],
          notes: [],
        },
        decisionTrace: [],
        artifactIds: ["33333333-3333-4333-8333-333333333333"],
        artifacts: [
          {
            id: "33333333-3333-4333-8333-333333333333",
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
      },
      discoveryAnswer: {
        source: "stored_finance_twin_and_cfo_wiki",
        summary:
          "Stored policy lookup is limited by a missing deterministic extract.",
        companyKey: "acme",
        questionKind: "policy_lookup",
        policySourceId: "22222222-2222-4222-8222-222222222222",
        policySourceScope: {
          policySourceId: "22222222-2222-4222-8222-222222222222",
          sourceName: "Travel and expense policy",
          documentRole: "policy_document",
          includeInCompile: true,
          latestExtractStatus: null,
          latestSnapshotVersion: 2,
        },
        answerSummary:
          "Stored policy lookup is limited by a missing deterministic extract.",
        freshnessPosture: {
          state: "missing",
          reasonSummary:
            "No persisted deterministic extract exists yet for the latest bound policy snapshot.",
        },
        limitations: [
          "This answer stays scoped to one policy source and exposes visible extract gaps.",
        ],
        relatedRoutes: [
          {
            label: "Scoped policy page",
            routePath:
              "/cfo-wiki/companies/acme/pages/policies%2F22222222-2222-4222-8222-222222222222",
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
        bodyMarkdown: "# Policy lookup answer",
        structuredData: {
          policySourceId: "22222222-2222-4222-8222-222222222222",
        },
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.proofBundle.policySourceId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(parsed.discoveryAnswer?.questionKind).toBe("policy_lookup");
    expect(parsed.proofBundle.policySourceScope?.sourceName).toBe(
      "Travel and expense policy",
    );
  });

  it("parses reporting mission detail with memo and appendix metadata", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "reporting",
        status: "succeeded",
        title: "Draft finance memo for acme from cash posture discovery",
        objective:
          "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title: "Draft finance memo for acme from cash posture discovery",
          objective:
            "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission 22222222-2222-4222-8222-222222222222.",
          repos: [],
          acceptance: ["persist one draft finance_memo artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
              sourceReportingMissionId: null,
              reportKind: "finance_memo",
              companyKey: "acme",
              questionKind: "cash_posture",
              policySourceId: null,
              policySourceScope: null,
            },
          },
        },
        createdAt: "2026-04-18T12:00:00.000Z",
        updatedAt: "2026-04-18T12:03:00.000Z",
      },
      tasks: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          missionId: "11111111-1111-4111-8111-111111111111",
          role: "scout",
          sequence: 0,
          status: "succeeded",
          attemptCount: 1,
          codexThreadId: null,
          codexTurnId: null,
          workspaceId: null,
          dependsOnTaskId: null,
          summary:
            "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
          createdAt: "2026-04-18T12:00:00.000Z",
          updatedAt: "2026-04-18T12:03:00.000Z",
        },
      ],
      proofBundle: {
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
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
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
          "44444444-4444-4444-8444-444444444444",
          "55555555-5555-4555-8555-555555555555",
        ],
        artifacts: [
          {
            id: "44444444-4444-4444-8444-444444444444",
            kind: "finance_memo",
          },
          {
            id: "55555555-5555-4555-8555-555555555555",
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
      },
      discoveryAnswer: null,
      reporting: {
        reportKind: "finance_memo",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: null,
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        boardPacket: null,
        publication: {
          storedDraft: true,
          filedMemo: null,
          filedEvidenceAppendix: null,
          latestMarkdownExport: null,
          summary:
            "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
        },
        financeMemo: {
          source: "stored_discovery_evidence",
          summary:
            "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
          reportKind: "finance_memo",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          memoSummary:
            "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
          freshnessSummary:
            "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
          limitationsSummary:
            "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceArtifacts: [
            {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "discovery_answer",
            },
          ],
          bodyMarkdown: "# Draft Finance Memo\n",
        },
        evidenceAppendix: {
          source: "stored_discovery_evidence",
          summary:
            "Evidence appendix for source discovery mission 22222222-2222-4222-8222-222222222222.",
          reportKind: "finance_memo",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          appendixSummary:
            "Stored evidence appendix for discovery mission 22222222-2222-4222-8222-222222222222.",
          freshnessSummary:
            "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
          limitationsSummary:
            "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
          limitations: [
            "The source discovery proof bundle is incomplete with missing evidence kinds: discovery_answer.",
          ],
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceArtifacts: [
            {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "discovery_answer",
            },
          ],
          bodyMarkdown: "# Evidence Appendix\n",
        },
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.reportKind).toBe("finance_memo");
    expect(parsed.reporting?.appendixPresent).toBe(true);
    expect(parsed.reporting?.publication?.storedDraft).toBe(true);
    expect(parsed.proofBundle.reportSummary).toContain("Cash posture");
  });

  it("parses board-packet reporting mission detail with source-report lineage", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        type: "reporting",
        status: "succeeded",
        title: "Draft board packet for acme from cash posture reporting",
        objective:
          "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title: "Draft board packet for acme from cash posture reporting",
          objective:
            "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
          repos: [],
          acceptance: ["persist one draft board_packet artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["board_packet", "proof_bundle"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
              sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
              reportKind: "board_packet",
              companyKey: "acme",
              questionKind: "cash_posture",
              policySourceId: null,
              policySourceScope: null,
            },
          },
        },
        createdAt: "2026-04-19T12:00:00.000Z",
        updatedAt: "2026-04-19T12:03:00.000Z",
      },
      tasks: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          role: "scout",
          sequence: 0,
          status: "succeeded",
          attemptCount: 1,
          codexThreadId: null,
          codexTurnId: null,
          workspaceId: null,
          dependsOnTaskId: null,
          summary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:03:00.000Z",
        },
      ],
      proofBundle: {
        missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        missionTitle: "Draft board packet for acme from cash posture reporting",
        objective:
          "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        answerSummary: "",
        reportKind: "board_packet",
        reportDraftStatus: "draft_only",
        reportPublication: null,
        circulationReadiness: {
          circulationApprovalStatus: "not_requested",
          circulationReady: false,
          approvalId: null,
          approvalStatus: null,
          requestedAt: null,
          requestedBy: null,
          resolvedAt: null,
          resolvedBy: null,
          rationale: null,
          summary:
            "Stored board packet exists, but circulation approval has not been requested yet.",
        },
        reportSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        appendixPresent: true,
        freshnessState: "stale",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This board packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        targetRepoFullName: null,
        branchName: null,
        pullRequestNumber: null,
        pullRequestUrl: null,
        changeSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        validationSummary:
          "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
        verificationSummary:
          "Draft board packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, and board-packet circulation posture before sharing this draft internally.",
        riskSummary:
          "This board packet is draft-only, carries source-report freshness and limitations forward, and does not add actual circulation logging, delivery, PDF, or slide workflow in F5C4E.",
        rollbackSummary:
          "No circulation approval, circulation log, send, wiki filing, PDF export, or slide export side effect was produced; rerun only if the stored source reporting evidence should be refreshed first.",
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
        artifactIds: ["cccccccc-cccc-4ccc-8ccc-cccccccccccc"],
        artifacts: [
          {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
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
      },
      discoveryAnswer: null,
      reporting: {
        reportKind: "board_packet",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This board packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        financeMemo: null,
        evidenceAppendix: null,
        boardPacket: {
          source: "stored_reporting_evidence",
          summary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          reportKind: "board_packet",
          draftStatus: "draft_only",
          sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          packetSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          freshnessSummary:
            "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
          limitationsSummary:
            "This board packet is draft-only and carries source reporting freshness and limitations forward.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceFinanceMemo: {
            artifactId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            kind: "finance_memo",
          },
          sourceEvidenceAppendix: {
            artifactId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            kind: "evidence_appendix",
          },
          bodyMarkdown:
            "# Draft Board Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
        },
        publication: null,
        circulationReadiness: {
          circulationApprovalStatus: "not_requested",
          circulationReady: false,
          approvalId: null,
          approvalStatus: null,
          requestedAt: null,
          requestedBy: null,
          resolvedAt: null,
          resolvedBy: null,
          rationale: null,
          summary:
            "Stored board packet exists, but circulation approval has not been requested yet.",
        },
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.reportKind).toBe("board_packet");
    expect(parsed.reporting?.sourceReportingMissionId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.reporting?.boardPacket?.sourceFinanceMemo.kind).toBe(
      "finance_memo",
    );
    expect(
      parsed.reporting?.circulationReadiness?.circulationApprovalStatus,
    ).toBe("not_requested");
    expect(parsed.proofBundle.evidenceCompleteness.expectedArtifactKinds).toEqual(
      ["board_packet"],
    );
  });

  it("parses board-packet reporting mission detail with a persisted circulation record", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        type: "reporting",
        status: "succeeded",
        title: "Draft board packet for acme from cash posture reporting",
        objective:
          "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title: "Draft board packet for acme from cash posture reporting",
          objective:
            "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
          repos: [],
          constraints: {
            mustNot: [],
            allowedPaths: [],
          },
          acceptance: ["persist one durable board-packet artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["board_packet", "proof_bundle"],
          evidenceRequirements: ["stored board-packet artifact"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId:
                "22222222-2222-4222-8222-222222222222",
              sourceReportingMissionId:
                "11111111-1111-4111-8111-111111111111",
              reportKind: "board_packet",
              companyKey: "acme",
              questionKind: "cash_posture",
            },
          },
        },
        createdAt: "2026-04-19T12:00:00.000Z",
        updatedAt: "2026-04-19T12:03:00.000Z",
      },
      tasks: [],
      proofBundle: {
        missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        missionTitle: "Draft board packet for acme from cash posture reporting",
        objective:
          "Compile one draft board packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        answerSummary: "",
        reportKind: "board_packet",
        reportDraftStatus: "draft_only",
        reportSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
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
          circulationNote:
            "Circulated after approval from the finance mailbox.",
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
        releaseRecord: null,
        releaseReadiness: null,
        appendixPresent: true,
        freshnessState: "stale",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This board packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        targetRepoFullName: null,
        branchName: null,
        pullRequestNumber: null,
        pullRequestUrl: null,
        changeSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        validationSummary:
          "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
        verificationSummary:
          "Draft board packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, visible limitations, approval trace, and external circulation-record posture before relying on this circulated draft.",
        riskSummary:
          "This board packet has one persisted external circulation record linked to an approved circulation-review trace, but Pocket CFO still did not send, distribute, publish, generate PDF, or generate slides in F5C4F.",
        rollbackSummary:
          "No system circulation, send, wiki filing, PDF export, or slide export side effect was produced; this slice only records an operator-entered external circulation log against the approved board packet.",
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
          "External circulation was logged by finance-operator at 2026-04-19T12:10:00.000Z via email. Circulation note: Circulated after approval from the finance mailbox.",
        ],
        artifactIds: ["dddddddd-dddd-4ddd-8ddd-dddddddddddd"],
        artifacts: [
          {
            id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            kind: "board_packet",
          },
        ],
        replayEventCount: 11,
        timestamps: {
          missionCreatedAt: "2026-04-19T12:00:00.000Z",
          latestPlannerEvidenceAt: null,
          latestExecutorEvidenceAt: null,
          latestPullRequestAt: null,
          latestApprovalAt: "2026-04-19T12:10:00.000Z",
          latestArtifactAt: "2026-04-19T12:03:00.000Z",
        },
        status: "ready",
      },
      reporting: {
        reportKind: "board_packet",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Draft board packet for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This board packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        financeMemo: null,
        evidenceAppendix: null,
        boardPacket: {
          source: "stored_reporting_evidence",
          summary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          reportKind: "board_packet",
          draftStatus: "draft_only",
          sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          packetSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          freshnessSummary:
            "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
          limitationsSummary:
            "This board packet is draft-only and carries source reporting freshness and limitations forward.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceFinanceMemo: {
            artifactId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            kind: "finance_memo",
          },
          sourceEvidenceAppendix: {
            artifactId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            kind: "evidence_appendix",
          },
          bodyMarkdown:
            "# Draft Board Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
        },
        lenderUpdate: null,
        diligencePacket: null,
        publication: null,
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
          circulationNote:
            "Circulated after approval from the finance mailbox.",
          approvalId: "55555555-5555-4555-8555-555555555555",
          summary:
            "External circulation was logged by finance-operator at 2026-04-19T12:10:00.000Z via email. Circulation note: Circulated after approval from the finance mailbox.",
        },
        circulationChronology: {
          hasCorrections: true,
          correctionCount: 1,
          latestCorrectionSummary:
            "Circulation record correction was appended by finance-operator at 2026-04-19T12:20:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: Corrected the original send timestamp after mailbox review.",
          latestCorrection: {
            correctionKey: "board-packet-correction-1",
            correctedAt: "2026-04-19T12:20:00.000Z",
            correctedBy: "finance-operator",
            correctionReason:
              "Corrected the original send timestamp after mailbox review",
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
                "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:20:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
            },
            summary:
              "Circulation record correction was appended by finance-operator at 2026-04-19T12:20:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: Corrected the original send timestamp after mailbox review.",
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
              "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:20:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
          },
          corrections: [
            {
              correctionKey: "board-packet-correction-1",
              correctedAt: "2026-04-19T12:20:00.000Z",
              correctedBy: "finance-operator",
              correctionReason:
                "Corrected the original send timestamp after mailbox review",
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
                  "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-19T12:20:00.000Z: circulated by board-chair@example.com at 2026-04-19T12:12:00.000Z via email. Effective note: Circulated after approval from the finance mailbox.",
              },
              summary:
                "Circulation record correction was appended by finance-operator at 2026-04-19T12:20:00.000Z. Corrected values: circulatedAt -> 2026-04-19T12:12:00.000Z; circulatedBy -> board-chair@example.com. Reason: Corrected the original send timestamp after mailbox review.",
            },
          ],
          summary:
            "1 circulation correction has been appended. The latest effective circulation fact reflects the correction logged by finance-operator at 2026-04-19T12:20:00.000Z.",
        },
        releaseRecord: null,
        releaseReadiness: null,
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.circulationRecord?.circulated).toBe(true);
    expect(parsed.reporting?.circulationRecord?.circulationChannel).toBe("email");
    expect(parsed.reporting?.circulationChronology?.correctionCount).toBe(1);
    expect(parsed.reporting?.circulationChronology?.effectiveRecord?.circulatedAt).toBe(
      "2026-04-19T12:12:00.000Z",
    );
    expect(parsed.reporting?.circulationChronology?.effectiveRecord?.circulatedBy).toBe(
      "board-chair@example.com",
    );
    expect(parsed.proofBundle.circulationRecord?.circulated).toBe(true);
  });

  it("parses diligence-packet reporting mission detail with source-report lineage", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        type: "reporting",
        status: "succeeded",
        title: "Draft diligence packet for acme from cash posture reporting",
        objective:
          "Compile one draft diligence packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title: "Draft diligence packet for acme from cash posture reporting",
          objective:
            "Compile one draft diligence packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
          repos: [],
          acceptance: ["persist one draft diligence_packet artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["diligence_packet", "proof_bundle"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
              sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
              reportKind: "diligence_packet",
              companyKey: "acme",
              questionKind: "cash_posture",
              policySourceId: null,
              policySourceScope: null,
            },
          },
        },
        createdAt: "2026-04-19T12:00:00.000Z",
        updatedAt: "2026-04-19T12:03:00.000Z",
      },
      tasks: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          role: "scout",
          sequence: 0,
          status: "succeeded",
          attemptCount: 1,
          codexThreadId: null,
          codexTurnId: null,
          workspaceId: null,
          dependsOnTaskId: null,
          summary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          createdAt: "2026-04-19T12:00:00.000Z",
          updatedAt: "2026-04-19T12:03:00.000Z",
        },
      ],
      proofBundle: {
        missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        missionTitle: "Draft diligence packet for acme from cash posture reporting",
        objective:
          "Compile one draft diligence packet from completed reporting mission 11111111-1111-4111-8111-111111111111 and its stored finance memo plus evidence appendix.",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
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
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
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
        artifactIds: ["cccccccc-cccc-4ccc-8ccc-cccccccccccc"],
        artifacts: [
          {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
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
      },
      discoveryAnswer: null,
      reporting: {
        reportKind: "diligence_packet",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Draft diligence packet for acme from the completed cash posture reporting mission.",
        freshnessSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
        limitationsSummary:
          "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        financeMemo: null,
        evidenceAppendix: null,
        boardPacket: null,
        lenderUpdate: null,
        diligencePacket: {
          source: "stored_reporting_evidence",
          summary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          packetSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary:
            "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
          limitationsSummary:
            "This diligence packet is draft-only and carries source reporting freshness and limitations forward.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceFinanceMemo: {
            artifactId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            kind: "finance_memo",
          },
          sourceEvidenceAppendix: {
            artifactId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            kind: "evidence_appendix",
          },
          bodyMarkdown:
            "# Draft Diligence Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
        },
        publication: null,
      },
      approvals: [],
      approvalCards: [],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.reportKind).toBe("diligence_packet");
    expect(parsed.reporting?.sourceReportingMissionId).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parsed.reporting?.diligencePacket?.sourceFinanceMemo.kind).toBe(
      "finance_memo",
    );
    expect(parsed.proofBundle.evidenceCompleteness.expectedArtifactKinds).toEqual(
      ["diligence_packet"],
    );
  });

  it("parses lender-update mission detail with persisted release approval posture", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "reporting",
        status: "succeeded",
        title: "Draft lender update for acme from cash posture reporting",
        objective:
          "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title: "Draft lender update for acme from cash posture reporting",
          objective:
            "Compile one draft lender update from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
          repos: [],
          acceptance: ["persist one lender_update artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["lender_update", "proof_bundle"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
              sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
              reportKind: "lender_update",
              companyKey: "acme",
              questionKind: "cash_posture",
              policySourceId: null,
              policySourceScope: null,
            },
          },
        },
        createdAt: "2026-04-20T08:00:00.000Z",
        updatedAt: "2026-04-20T08:12:00.000Z",
      },
      tasks: [],
      proofBundle: {
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
        reportSummary:
          "Draft lender update for acme from the completed finance memo.",
        reportPublication: null,
        releaseReadiness: {
          releaseApprovalStatus: "pending_review",
          releaseReady: false,
          approvalId: "44444444-4444-4444-8444-444444444444",
          approvalStatus: "pending",
          requestedAt: "2026-04-20T08:10:00.000Z",
          requestedBy: "finance-operator",
          resolvedAt: null,
          resolvedBy: null,
          rationale: null,
          summary:
            "Release approval was requested by finance-operator; the stored lender update is not yet approved for release.",
        },
        appendixPresent: true,
        freshnessState: "stale",
        freshnessSummary:
          "Cash posture remains stale because bank coverage is stale.",
        limitationsSummary:
          "This lender update remains delivery-free while review is pending.",
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
          "This lender update stays draft-only until a persisted release approval is granted.",
        rollbackSummary:
          "No actual release side effect was produced; this slice only records pending review posture.",
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
          "Latest lender-update release approval is pending_review.",
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
          latestApprovalAt: "2026-04-20T08:10:00.000Z",
          latestArtifactAt: "2026-04-20T08:05:00.000Z",
        },
        status: "ready",
      },
      discoveryAnswer: null,
      reporting: {
        reportKind: "lender_update",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
        sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Draft lender update for acme from the completed finance memo.",
        freshnessSummary:
          "Cash posture remains stale because bank coverage is stale.",
        limitationsSummary:
          "This lender update remains delivery-free while review is pending.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        financeMemo: null,
        evidenceAppendix: null,
        boardPacket: null,
        lenderUpdate: {
          source: "stored_reporting_evidence",
          summary:
            "Draft lender update for acme from the completed finance memo.",
          reportKind: "lender_update",
          draftStatus: "draft_only",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          updateSummary:
            "Draft lender update for acme from the completed finance memo.",
          freshnessSummary:
            "Cash posture remains stale because bank coverage is stale.",
          limitationsSummary:
            "This lender update remains delivery-free while review is pending.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceFinanceMemo: {
            artifactId: "66666666-6666-4666-8666-666666666666",
            kind: "finance_memo",
          },
          sourceEvidenceAppendix: {
            artifactId: "77777777-7777-4777-8777-777777777777",
            kind: "evidence_appendix",
          },
          bodyMarkdown:
            "# Draft Lender Update\n\n## Release Review Posture\n\n- Status: draft_only",
        },
        diligencePacket: null,
        publication: null,
        releaseReadiness: {
          releaseApprovalStatus: "pending_review",
          releaseReady: false,
          approvalId: "44444444-4444-4444-8444-444444444444",
          approvalStatus: "pending",
          requestedAt: "2026-04-20T08:10:00.000Z",
          requestedBy: "finance-operator",
          resolvedAt: null,
          resolvedBy: null,
          rationale: null,
          summary:
            "Release approval was requested by finance-operator; the stored lender update is not yet approved for release.",
        },
      },
      approvals: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "report_release",
          status: "pending",
          requestedBy: "finance-operator",
          resolvedBy: null,
          rationale: null,
          createdAt: "2026-04-20T08:10:00.000Z",
          updatedAt: "2026-04-20T08:10:00.000Z",
        },
      ],
      approvalCards: [
        {
          actionHint:
            "Review the stored lender update summary, freshness, and limitations before deciding whether this draft is approved for release. This slice records posture only and does not deliver the report.",
          approvalId: "44444444-4444-4444-8444-444444444444",
          kind: "report_release",
          requestedAt: "2026-04-20T08:10:00.000Z",
          requestedBy: "finance-operator",
          requiresLiveControl: false,
          repoContext: null,
          resolutionSummary: null,
          resolvedAt: null,
          resolvedBy: null,
          status: "pending",
          summary:
            "Review lender update release readiness for acme. Summary: Draft lender update for acme from the completed finance memo. Freshness: Cash posture remains stale because bank coverage is stale. Limitations: This lender update remains delivery-free while review is pending.",
          task: null,
          title: "Review lender update release approval for acme",
        },
      ],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.releaseReadiness?.releaseApprovalStatus).toBe(
      "pending_review",
    );
    expect(parsed.approvalCards[0]?.requiresLiveControl).toBe(false);
  });

  it("parses diligence-packet mission detail with approved release-readiness posture and no release record", () => {
    const parsed = MissionDetailViewSchema.parse({
      mission: {
        id: "11111111-1111-4111-8111-111111111111",
        type: "reporting",
        status: "succeeded",
        title:
          "Draft diligence packet for acme from cash posture reporting",
        objective:
          "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
        sourceKind: "manual_reporting",
        sourceRef: null,
        createdBy: "finance-operator",
        primaryRepo: null,
        spec: {
          type: "reporting",
          title:
            "Draft diligence packet for acme from cash posture reporting",
          objective:
            "Compile one draft diligence packet from completed reporting mission 22222222-2222-4222-8222-222222222222 and its stored finance memo plus evidence appendix.",
          repos: [],
          acceptance: ["persist one diligence_packet artifact"],
          riskBudget: {
            sandboxMode: "read-only",
            maxWallClockMinutes: 5,
            maxCostUsd: 1,
            allowNetwork: false,
            requiresHumanApprovalFor: [],
          },
          deliverables: ["diligence_packet", "proof_bundle"],
          input: {
            reportingRequest: {
              sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
              sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
              reportKind: "diligence_packet",
              companyKey: "acme",
              questionKind: "cash_posture",
              policySourceId: null,
              policySourceScope: null,
            },
          },
        },
        createdAt: "2026-04-21T08:00:00.000Z",
        updatedAt: "2026-04-21T08:12:00.000Z",
      },
      tasks: [],
      proofBundle: {
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
        reportSummary:
          "Draft diligence packet for acme from the completed finance memo.",
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
          rationale: "Looks release-ready.",
          summary:
            "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
        },
        appendixPresent: true,
        freshnessState: "stale",
        freshnessSummary:
          "Cash posture remains stale because bank coverage is stale.",
        limitationsSummary:
          "This diligence packet remains delivery-free while approval and external release-log posture stay explicit in F5C4D.",
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
          "No actual release side effect was produced; this slice only records review posture.",
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
        replayEventCount: 10,
        timestamps: {
          missionCreatedAt: "2026-04-21T08:00:00.000Z",
          latestPlannerEvidenceAt: null,
          latestExecutorEvidenceAt: null,
          latestPullRequestAt: null,
          latestApprovalAt: "2026-04-21T08:12:00.000Z",
          latestArtifactAt: "2026-04-21T08:05:00.000Z",
        },
        status: "ready",
      },
      discoveryAnswer: null,
      reporting: {
        reportKind: "diligence_packet",
        draftStatus: "draft_only",
        sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
        sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
        companyKey: "acme",
        questionKind: "cash_posture",
        policySourceId: null,
        policySourceScope: null,
        reportSummary:
          "Draft diligence packet for acme from the completed finance memo.",
        freshnessSummary:
          "Cash posture remains stale because bank coverage is stale.",
        limitationsSummary:
          "This diligence packet remains delivery-free while approval and external release-log posture stay explicit in F5C4D.",
        relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
        relatedWikiPageKeys: ["metrics/cash-posture"],
        appendixPresent: true,
        financeMemo: null,
        evidenceAppendix: null,
        boardPacket: null,
        lenderUpdate: null,
        diligencePacket: {
          source: "stored_reporting_evidence",
          summary:
            "Draft diligence packet for acme from the completed finance memo.",
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceReportingMissionId: "22222222-2222-4222-8222-222222222222",
          sourceDiscoveryMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          packetSummary:
            "Draft diligence packet for acme from the completed finance memo.",
          freshnessSummary:
            "Cash posture remains stale because bank coverage is stale.",
          limitationsSummary:
            "This diligence packet remains delivery-free while approval and external release-log posture stay explicit in F5C4D.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          sourceFinanceMemo: {
            artifactId: "66666666-6666-4666-8666-666666666666",
            kind: "finance_memo",
          },
          sourceEvidenceAppendix: {
            artifactId: "77777777-7777-4777-8777-777777777777",
            kind: "evidence_appendix",
          },
          bodyMarkdown:
            "# Draft Diligence Packet\n\n## Release Review Posture\n\n- Status: draft_only",
        },
        publication: null,
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
          rationale: "Looks release-ready.",
          summary:
            "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
        },
      },
      approvals: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          kind: "report_release",
          status: "approved",
          requestedBy: "finance-operator",
          resolvedBy: "finance-reviewer",
          rationale: "Looks release-ready.",
          createdAt: "2026-04-21T08:10:00.000Z",
          updatedAt: "2026-04-21T08:12:00.000Z",
        },
      ],
      approvalCards: [
        {
          actionHint: null,
          approvalId: "44444444-4444-4444-8444-444444444444",
          kind: "report_release",
          requestedAt: "2026-04-21T08:10:00.000Z",
          requestedBy: "finance-operator",
          requiresLiveControl: false,
          repoContext: null,
          resolutionSummary:
            "Approved by finance-reviewer at 2026-04-21T08:12:00.000Z. Rationale: Looks release-ready.",
          resolvedAt: "2026-04-21T08:12:00.000Z",
          resolvedBy: "finance-reviewer",
          status: "approved",
          summary:
            "Review diligence packet release readiness for acme. Summary: Draft diligence packet for acme from the completed finance memo. Freshness: Cash posture remains stale because bank coverage is stale. Limitations: This diligence packet remains delivery-free while approval and external release-log posture stay explicit in F5C4D.",
          task: null,
          title: "Review diligence packet release approval for acme",
        },
      ],
      artifacts: [],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });

    expect(parsed.reporting?.reportKind).toBe("diligence_packet");
    expect(parsed.reporting?.releaseReadiness?.releaseApprovalStatus).toBe(
      "approved_for_release",
    );
    expect(parsed.reporting?.releaseRecord).toBeNull();
    expect(parsed.approvalCards[0]?.requiresLiveControl).toBe(false);
  });
});
