import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
  type FinanceDiscoveryStoredStateQuestionKind,
} from "@pocket-cto/domain";
import type {
  ApprovalRecord,
  ArtifactRecord,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { assembleProofBundleManifest } from "./proof-bundle-assembly";
import { EvidenceService } from "./service";

const missionId = "11111111-1111-4111-8111-111111111111";
const plannerTaskId = "22222222-2222-4222-8222-222222222222";
const executorTaskId = "33333333-3333-4333-8333-333333333333";
const scoutTaskId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("assembleProofBundleManifest", () => {
  it("yields a ready proof bundle for a planner plus executor plus PR path", () => {
    const mission = buildMission();
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "44444444-4444-4444-8444-444444444444",
          kind: "plan",
          taskId: plannerTaskId,
          createdAt: "2026-03-15T21:00:00.000Z",
          metadata: {
            summary: "Planner captured the implementation plan.",
          },
        }),
        buildArtifact({
          id: "55555555-5555-4555-8555-555555555555",
          kind: "diff_summary",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:10:00.000Z",
          metadata: {
            summary:
              "Workspace changes touched README.md and apps/web/page.tsx.",
          },
        }),
        buildArtifact({
          id: "66666666-6666-4666-8666-666666666666",
          kind: "test_report",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:11:00.000Z",
          metadata: {
            summary:
              "Local executor validation passed. Validation passed for README.md (+1 more) and a clean git diff check.",
          },
        }),
        buildArtifact({
          id: "77777777-7777-4777-8777-777777777777",
          kind: "pr_link",
          taskId: executorTaskId,
          uri: "https://github.com/616xold/pocket-cto/pull/77",
          createdAt: "2026-03-15T21:12:00.000Z",
          metadata: {
            branchName:
              "pocket-cto/11111111-1111-4111-8111-111111111111/1-executor",
            draft: true,
            prNumber: 77,
            prUrl: "https://github.com/616xold/pocket-cto/pull/77",
            publishedAt: "2026-03-15T21:12:00.000Z",
            repoFullName: "616xold/pocket-cto",
            summary:
              "Draft PR #77 opened for 616xold/pocket-cto from pocket-cto/11111111-1111-4111-8111-111111111111/1-executor into main.",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 18,
      tasks: buildTasks({
        executorStatus: "succeeded",
        plannerStatus: "succeeded",
      }),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.evidenceCompleteness.status).toBe("complete");
    expect(manifest.targetRepoFullName).toBe("616xold/pocket-cto");
    expect(manifest.branchName).toBe(
      "pocket-cto/11111111-1111-4111-8111-111111111111/1-executor",
    );
    expect(manifest.pullRequestNumber).toBe(77);
    expect(manifest.pullRequestUrl).toBe(
      "https://github.com/616xold/pocket-cto/pull/77",
    );
    expect(manifest.validationSummary).toContain(
      "Local executor validation passed",
    );
    expect(manifest.verificationSummary).toContain("draft PR #77");
    expect(manifest.artifacts).toEqual([
      {
        id: "44444444-4444-4444-8444-444444444444",
        kind: "plan",
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        kind: "diff_summary",
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        kind: "test_report",
      },
      {
        id: "77777777-7777-4777-8777-777777777777",
        kind: "pr_link",
      },
    ]);
  });

  it("yields an incomplete proof bundle when expected evidence is still missing", () => {
    const mission = buildMission();
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "44444444-4444-4444-8444-444444444444",
          kind: "plan",
          taskId: plannerTaskId,
          createdAt: "2026-03-15T21:00:00.000Z",
          metadata: {
            summary: "Planner captured the implementation plan.",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 7,
      tasks: buildTasks({
        executorStatus: "pending",
        plannerStatus: "succeeded",
      }),
    });

    expect(manifest.status).toBe("incomplete");
    expect(manifest.evidenceCompleteness.status).toBe("partial");
    expect(manifest.evidenceCompleteness.missingArtifactKinds).toEqual([
      "diff_summary",
      "test_report",
      "pr_link",
    ]);
    expect(manifest.verificationSummary).toContain("executor validation");
  });

  it("yields a failed proof bundle for a non-shippable executor path", () => {
    const mission = buildMission();
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "44444444-4444-4444-8444-444444444444",
          kind: "plan",
          taskId: plannerTaskId,
          createdAt: "2026-03-15T21:00:00.000Z",
        }),
        buildArtifact({
          id: "66666666-6666-4666-8666-666666666666",
          kind: "test_report",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:11:00.000Z",
          metadata: {
            summary:
              "Local executor validation failed: the executor turn completed without changing any files.",
          },
        }),
        buildArtifact({
          id: "88888888-8888-4888-8888-888888888888",
          kind: "log_excerpt",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:11:30.000Z",
          metadata: {
            summary:
              "Captured executor failure excerpts from runtime output and local validation.",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 11,
      tasks: buildTasks({
        executorStatus: "failed",
        executorSummary:
          "Executor completed validated workspace changes, but GitHub publish failed: branch protection blocked the push.",
        plannerStatus: "succeeded",
      }),
    });

    expect(manifest.status).toBe("failed");
    expect(manifest.evidenceCompleteness.status).toBe("partial");
    expect(manifest.validationSummary).toContain(
      "Local executor validation failed",
    );
    expect(manifest.verificationSummary).toContain("non-shippable");
    expect(manifest.rollbackSummary).toContain("Retry");
  });

  it("carries the latest approval summary into the manifest", () => {
    const mission = buildMission();
    const manifest = assembleProofBundleManifest({
      approvals: [
        {
          id: "99999999-9999-4999-8999-999999999999",
          kind: "file_change",
          missionId,
          payload: {},
          rationale: "Need a human check before publish",
          requestedBy: "system",
          resolvedBy: "operator",
          status: "approved",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:05:00.000Z",
          updatedAt: "2026-03-15T21:06:00.000Z",
        } satisfies ApprovalRecord,
      ],
      artifacts: [],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 5,
      tasks: buildTasks({
        executorStatus: "awaiting_approval",
        plannerStatus: "succeeded",
      }),
    });

    expect(manifest.latestApproval).toMatchObject({
      id: "99999999-9999-4999-8999-999999999999",
      kind: "file_change",
      status: "approved",
      resolvedBy: "operator",
    });
  });

  it("yields a ready proof bundle for a successful discovery answer artifact", () => {
    const mission = buildDiscoveryMission();
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          kind: "discovery_answer",
          taskId: scoutTaskId,
          createdAt: "2026-03-20T09:02:00.000Z",
          metadata: {
            source: "stored_twin_blast_radius_query",
            summary:
              "Stored twin state shows apps/control-plane as the main auth-change blast radius with stale workflow freshness.",
            answerSummary:
              "Stored twin state shows apps/control-plane as the main auth-change blast radius with stale workflow freshness.",
            repoFullName: "616xold/pocket-cto",
            questionKind: "auth_change",
            changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
            impactedDirectories: [
              {
                path: "apps/control-plane",
                label: "Control plane",
                classification: "application_group",
                matchedChangedPaths: [
                  "apps/control-plane/src/modules/github-app/auth.ts",
                ],
                ownershipState: "unknown",
                effectiveOwners: [],
                appliedRule: null,
              },
            ],
            impactedManifests: [],
            ownersByTarget: [],
            relatedTestSuites: [],
            relatedMappedCiJobs: [],
            freshness: {
              rollup: {
                state: "stale",
                scorePercent: 72,
                latestRunStatus: "succeeded",
                ageSeconds: 7200,
                staleAfterSeconds: 3600,
                reasonCode: "stale_twin_state",
                reasonSummary:
                  "Stored twin state is stale for: workflows, testSuites.",
                freshSliceCount: 4,
                staleSliceCount: 2,
                failedSliceCount: 0,
                neverSyncedSliceCount: 0,
                blockingSlices: ["workflows", "testSuites"],
              },
              slices: {
                metadata: createFreshnessSlice("fresh"),
                ownership: createFreshnessSlice("fresh"),
                workflows: createFreshnessSlice("stale"),
                testSuites: createFreshnessSlice("stale"),
                docs: createFreshnessSlice("fresh"),
                runbooks: createFreshnessSlice("fresh"),
              },
            },
            freshnessRollup: {
              state: "stale",
              scorePercent: 72,
              latestRunStatus: "succeeded",
              ageSeconds: 7200,
              staleAfterSeconds: 3600,
              reasonCode: "stale_twin_state",
              reasonSummary:
                "Stored twin state is stale for: workflows, testSuites.",
              freshSliceCount: 4,
              staleSliceCount: 2,
              failedSliceCount: 0,
              neverSyncedSliceCount: 0,
              blockingSlices: ["workflows", "testSuites"],
            },
            limitations: [
              {
                code: "repository_freshness_stale",
                summary: "Stored workflow and test-suite state is stale.",
                changedPaths: [],
                targetPaths: [],
                manifestPaths: [],
                jobKeys: [],
                reasonCodes: [],
                sliceNames: ["workflows", "testSuites"],
              },
            ],
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 9,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "discovery_answer",
    ]);
    expect(manifest.evidenceCompleteness.presentArtifactKinds).toEqual([
      "discovery_answer",
    ]);
    expect(manifest.changeSummary).toContain("apps/control-plane");
    expect(manifest.validationSummary).toContain("stored twin state");
    expect(manifest.verificationSummary).toContain("stored freshness");
    expect(manifest.rollbackSummary).toContain("No code, branch, pull request");
  });

  it.each(FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS)(
    "yields a finance-ready proof bundle for %s",
    (questionKind) => {
      const mission = buildFinanceDiscoveryMission(questionKind);
      const manifest = assembleProofBundleManifest({
        approvals: [],
        artifacts: [
          buildArtifact({
            id: readFinanceArtifactId(questionKind),
            kind: "discovery_answer",
            taskId: scoutTaskId,
            createdAt: "2026-04-15T09:02:00.000Z",
            metadata: buildFinanceDiscoveryAnswerMetadata(questionKind),
          }),
        ],
        existingBundle: buildPlaceholderBundle(mission),
        mission,
        replayEventCount: 7,
        tasks: buildDiscoveryTasks("succeeded"),
      });

      expect(manifest.status).toBe("ready");
      expect(manifest.companyKey).toBe("acme");
      expect(manifest.questionKind).toBe(questionKind);
      expect(manifest.targetRepoFullName).toBeNull();
      expect(manifest.relatedRoutePaths.length).toBe(2);
      expect(manifest.relatedWikiPageKeys.length).toBeGreaterThanOrEqual(1);
      expect(manifest.answerSummary).toContain("Stored");
      expect(manifest.freshnessSummary).toContain("Stored");
      expect(manifest.limitationsSummary.length).toBeGreaterThan(0);
    },
  );

  it("carries mixed freshness posture from the stored finance answer into the proof bundle summary", () => {
    const mission = buildFinanceDiscoveryMission("collections_pressure");
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: readFinanceArtifactId("collections_pressure"),
          kind: "discovery_answer",
          taskId: scoutTaskId,
          createdAt: "2026-04-15T09:05:00.000Z",
          metadata: buildFinanceDiscoveryAnswerMetadata(
            "collections_pressure",
            {
              reasonSummary:
                "Required Finance Twin reads for collections pressure do not agree for acme. Collections posture is Fresh: Stored collections posture state is fresh. Receivables aging is Stale: Stored receivables-aging coverage is stale relative to the freshness threshold.",
              state: "mixed",
            },
          ),
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 8,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.freshnessState).toBe("mixed");
    expect(manifest.freshnessSummary).toContain(
      "Required Finance Twin reads for collections pressure do not agree for acme.",
    );
    expect(manifest.verificationSummary).toContain(
      "Review the stored freshness, route-backed evidence, and visible limitations before acting on the answer.",
    );
  });

  it("surfaces stale required-read limitations in the finance proof-bundle summary", () => {
    const mission = buildFinanceDiscoveryMission("collections_pressure");
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: readFinanceArtifactId("collections_pressure"),
          kind: "discovery_answer",
          taskId: scoutTaskId,
          createdAt: "2026-04-15T09:05:30.000Z",
          metadata: buildFinanceDiscoveryAnswerMetadata(
            "collections_pressure",
            {
              reasonSummary:
                "Required Finance Twin reads for collections pressure do not agree for acme. Collections posture is Fresh: Stored collections posture state is fresh. Receivables aging is Stale: Stored receivables-aging coverage is stale relative to the freshness threshold.",
              state: "mixed",
            },
            [
              "Required Finance Twin read Receivables aging is stale for acme: Stored receivables-aging coverage is stale relative to the freshness threshold.",
              "Visible limitations remain preserved.",
            ],
          ),
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 8,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.freshnessState).toBe("mixed");
    expect(manifest.limitationsSummary).toContain(
      "Required Finance Twin read Receivables aging is stale for acme",
    );
  });

  it("surfaces missing or failed required-read limitations in the finance proof-bundle summary", () => {
    const mission = buildFinanceDiscoveryMission("payables_pressure");
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: readFinanceArtifactId("payables_pressure"),
          kind: "discovery_answer",
          taskId: scoutTaskId,
          createdAt: "2026-04-15T09:06:00.000Z",
          metadata: buildFinanceDiscoveryAnswerMetadata(
            "payables_pressure",
            {
              reasonSummary:
                "Required Finance Twin reads for payables pressure do not agree for acme. Payables posture is Fresh: Stored finance slice state is fresh. Payables aging is Failed: The latest payables-aging sync failed after an earlier successful snapshot was stored.",
              state: "mixed",
            },
            [
              "Required Finance Twin read Payables aging is in failed freshness posture for acme: The latest payables-aging sync failed after an earlier successful snapshot was stored.",
              "Visible limitations remain preserved.",
            ],
          ),
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 9,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.freshnessState).toBe("mixed");
    expect(manifest.limitationsSummary).toContain(
      "Required Finance Twin read Payables aging is in failed freshness posture for acme",
    );
  });

  it("yields a finance-ready proof bundle for source-scoped policy lookup", () => {
    const policySourceId = "22222222-2222-4222-8222-222222222222";
    const mission = buildPolicyLookupDiscoveryMission(policySourceId);
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa6",
          kind: "discovery_answer",
          taskId: scoutTaskId,
          createdAt: "2026-04-15T09:07:00.000Z",
          metadata: buildPolicyLookupDiscoveryAnswerMetadata(policySourceId),
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 10,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.companyKey).toBe("acme");
    expect(manifest.questionKind).toBe("policy_lookup");
    expect(manifest.policySourceId).toBe(policySourceId);
    expect(manifest.policySourceScope).toMatchObject({
      sourceName: "Travel and expense policy",
      documentRole: "policy_document",
      includeInCompile: true,
      latestExtractStatus: "extracted",
      latestSnapshotVersion: 2,
    });
    expect(manifest.relatedRoutePaths).toEqual([
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`policies/${policySourceId}`)}`,
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`sources/${policySourceId}/snapshots/2`)}`,
      `/cfo-wiki/companies/acme/pages/${encodeURIComponent("concepts/policy-corpus")}`,
    ]);
    expect(manifest.relatedWikiPageKeys).toEqual([
      `policies/${policySourceId}`,
      `sources/${policySourceId}/snapshots/2`,
      "concepts/policy-corpus",
    ]);
    expect(manifest.answerSummary).toContain(policySourceId);
    expect(manifest.verificationSummary).toContain(
      `policy source ${policySourceId}`,
    );
    expect(manifest.verificationSummary).toContain(
      "Review the stored policy page",
    );
  });

  it("yields a ready reporting proof bundle when memo and appendix artifacts are stored", () => {
    const sourceDiscoveryMissionId = "88888888-8888-4888-8888-888888888888";
    const mission = buildReportingMission(sourceDiscoveryMissionId);
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
          kind: "finance_memo",
          taskId: scoutTaskId,
          createdAt: "2026-04-18T12:02:00.000Z",
          metadata: {
            source: "stored_discovery_evidence",
            summary:
              "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
            reportKind: "finance_memo",
            draftStatus: "draft_only",
            sourceDiscoveryMissionId,
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
            relatedRoutePaths: [
              "/finance-twin/companies/acme/cash-posture",
              "/finance-twin/companies/acme/bank-accounts",
            ],
            relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
            sourceArtifacts: [
              {
                artifactId: "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
                kind: "discovery_answer",
              },
            ],
            bodyMarkdown: "# Draft Finance Memo\n\n## Memo Summary\n",
          },
        }),
        buildArtifact({
          id: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
          kind: "evidence_appendix",
          taskId: scoutTaskId,
          createdAt: "2026-04-18T12:03:00.000Z",
          metadata: {
            source: "stored_discovery_evidence",
            summary:
              "Evidence appendix for source discovery mission 88888888-8888-4888-8888-888888888888.",
            reportKind: "finance_memo",
            draftStatus: "draft_only",
            sourceDiscoveryMissionId,
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            appendixSummary:
              "Stored evidence appendix for discovery mission 88888888-8888-4888-8888-888888888888.",
            freshnessSummary:
              "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
            limitationsSummary:
              "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
            limitations: [
              "Working-capital timing remains approximate because no payment calendar inference is performed.",
            ],
            relatedRoutePaths: [
              "/finance-twin/companies/acme/cash-posture",
              "/finance-twin/companies/acme/bank-accounts",
            ],
            relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
            sourceArtifacts: [
              {
                artifactId: "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
                kind: "discovery_answer",
              },
            ],
            bodyMarkdown: "# Evidence Appendix\n\n## Source Discovery Lineage\n",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      reportPublication: {
        storedDraft: true,
        filedMemo: {
          artifactKind: "finance_memo",
          pageKey:
            "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
          title:
            "Draft finance memo for acme (11111111-1111-4111-8111-111111111111)",
          filedAt: "2026-04-18T12:04:00.000Z",
          filedBy: "finance-operator",
          provenanceSummary:
            "Draft-only reporting artifact filed into the CFO Wiki.",
        },
        filedEvidenceAppendix: {
          artifactKind: "evidence_appendix",
          pageKey:
            "filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix",
          title:
            "Evidence appendix for acme draft finance memo (11111111-1111-4111-8111-111111111111)",
          filedAt: "2026-04-18T12:04:30.000Z",
          filedBy: "finance-operator",
          provenanceSummary:
            "Draft-only reporting artifact filed into the CFO Wiki.",
        },
        latestMarkdownExport: {
          exportRunId: "11111111-cccc-4ccc-8ccc-cccccccccccc",
          status: "succeeded",
          completedAt: "2026-04-18T12:05:00.000Z",
          includesLatestFiledArtifacts: true,
        },
        summary:
          "Draft memo and evidence appendix are stored. Both filed pages exist in the CFO Wiki: `filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo` and `filed/reporting-11111111-1111-4111-8111-111111111111-evidence_appendix`. Markdown export run 11111111-cccc-4ccc-8ccc-cccccccccccc includes the latest filed report pages.",
      },
      replayEventCount: 8,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.reportKind).toBe("finance_memo");
    expect(manifest.sourceDiscoveryMissionId).toBe(sourceDiscoveryMissionId);
    expect(manifest.appendixPresent).toBe(true);
    expect(manifest.reportPublication?.filedMemo?.pageKey).toBe(
      "filed/reporting-11111111-1111-4111-8111-111111111111-finance_memo",
    );
    expect(
      manifest.reportPublication?.latestMarkdownExport?.includesLatestFiledArtifacts,
    ).toBe(true);
    expect(manifest.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "finance_memo",
      "evidence_appendix",
    ]);
    expect(manifest.status).toBe("ready");
    expect(manifest.verificationSummary).toContain("linked evidence appendix");
    expect(manifest.riskSummary).toContain("draft-only");
  });

  it("yields a ready board-packet proof bundle when board-packet evidence is stored", () => {
    const sourceDiscoveryMissionId = "88888888-8888-4888-8888-888888888888";
    const sourceReportingMissionId = "99999999-9999-4999-8999-999999999999";
    const mission = buildBoardPacketMission(
      sourceDiscoveryMissionId,
      sourceReportingMissionId,
    );
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "11111111-dddd-4ddd-8ddd-dddddddddddd",
          kind: "board_packet",
          taskId: scoutTaskId,
          createdAt: "2026-04-19T12:03:00.000Z",
          metadata: {
            source: "stored_reporting_evidence",
            summary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            reportKind: "board_packet",
            draftStatus: "draft_only",
            sourceReportingMissionId,
            sourceDiscoveryMissionId,
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
            relatedRoutePaths: [
              "/finance-twin/companies/acme/cash-posture",
              "/finance-twin/companies/acme/bank-accounts",
            ],
            relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
            sourceFinanceMemo: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Board Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 9,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.reportKind).toBe("board_packet");
    expect(manifest.sourceReportingMissionId).toBe(sourceReportingMissionId);
    expect(manifest.reportPublication).toBeNull();
    expect(manifest.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "board_packet",
    ]);
    expect(manifest.validationSummary).toBe(
      "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
    );
    expect(manifest.riskSummary).toContain(
      "does not add approval, release, PDF, or slide workflow in F5C1",
    );
    expect(manifest.decisionTrace[0]).toContain(
      "persisted board-packet evidence",
    );
  });

  it("yields a ready lender-update proof bundle when lender-update evidence is stored", () => {
    const sourceDiscoveryMissionId = "88888888-8888-4888-8888-888888888888";
    const sourceReportingMissionId = "99999999-9999-4999-8999-999999999999";
    const mission = buildLenderUpdateMission(
      sourceDiscoveryMissionId,
      sourceReportingMissionId,
    );
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "11111111-eeee-4eee-8eee-eeeeeeeeeeee",
          kind: "lender_update",
          taskId: scoutTaskId,
          createdAt: "2026-04-19T12:33:00.000Z",
          metadata: {
            source: "stored_reporting_evidence",
            summary:
              "Draft lender update for acme from the completed cash posture reporting mission.",
            reportKind: "lender_update",
            draftStatus: "draft_only",
            sourceReportingMissionId,
            sourceDiscoveryMissionId,
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            updateSummary:
              "Draft lender update for acme from the completed cash posture reporting mission.",
            freshnessSummary:
              "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
            limitationsSummary:
              "This lender update is draft-only and carries source reporting freshness and limitations forward.",
            relatedRoutePaths: [
              "/finance-twin/companies/acme/cash-posture",
              "/finance-twin/companies/acme/bank-accounts",
            ],
            relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
            sourceFinanceMemo: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Lender Update\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 9,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.reportKind).toBe("lender_update");
    expect(manifest.sourceReportingMissionId).toBe(sourceReportingMissionId);
    expect(manifest.reportPublication).toBeNull();
    expect(manifest.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "lender_update",
    ]);
    expect(manifest.validationSummary).toBe(
      "Draft lender update was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
    );
    expect(manifest.riskSummary).toContain(
      "does not add approval, release, diligence, PDF, or slide workflow in F5C2",
    );
    expect(manifest.decisionTrace[0]).toContain(
      "persisted lender-update evidence",
    );
  });

  it("yields a ready diligence-packet proof bundle when diligence-packet evidence is stored", () => {
    const sourceDiscoveryMissionId = "88888888-8888-4888-8888-888888888888";
    const sourceReportingMissionId = "99999999-9999-4999-8999-999999999999";
    const mission = buildDiligencePacketMission(
      sourceDiscoveryMissionId,
      sourceReportingMissionId,
    );
    const manifest = assembleProofBundleManifest({
      approvals: [],
      artifacts: [
        buildArtifact({
          id: "11111111-ffff-4fff-8fff-ffffffffffff",
          kind: "diligence_packet",
          taskId: scoutTaskId,
          createdAt: "2026-04-19T13:03:00.000Z",
          metadata: {
            source: "stored_reporting_evidence",
            summary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            reportKind: "diligence_packet",
            draftStatus: "draft_only",
            sourceReportingMissionId,
            sourceDiscoveryMissionId,
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
            relatedRoutePaths: [
              "/finance-twin/companies/acme/cash-posture",
              "/finance-twin/companies/acme/bank-accounts",
            ],
            relatedWikiPageKeys: ["metrics/cash-posture", "concepts/cash"],
            sourceFinanceMemo: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "11111111-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Diligence Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
        }),
      ],
      existingBundle: buildPlaceholderBundle(mission),
      mission,
      replayEventCount: 9,
      tasks: buildDiscoveryTasks("succeeded"),
    });

    expect(manifest.status).toBe("ready");
    expect(manifest.reportKind).toBe("diligence_packet");
    expect(manifest.sourceReportingMissionId).toBe(sourceReportingMissionId);
    expect(manifest.reportPublication).toBeNull();
    expect(manifest.evidenceCompleteness.expectedArtifactKinds).toEqual([
      "diligence_packet",
    ]);
    expect(manifest.validationSummary).toBe(
      "Draft diligence packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
    );
    expect(manifest.riskSummary).toContain(
      "does not add approval, release, PDF, or slide workflow in F5C3",
    );
    expect(manifest.decisionTrace[0]).toContain(
      "persisted diligence-packet evidence",
    );
  });
});

function buildMission(): MissionRecord {
  return {
    id: missionId,
    type: "build",
    status: "running",
    title: "Implement passkeys for sign-in",
    objective: "Ship passkeys without breaking email login.",
    sourceKind: "manual_text",
    sourceRef: null,
    createdBy: "operator",
    primaryRepo: "web",
    spec: {
      type: "build",
      title: "Implement passkeys for sign-in",
      objective: "Ship passkeys without breaking email login.",
      repos: ["web"],
      constraints: {
        allowedPaths: [],
        mustNot: [],
      },
      acceptance: ["Ship passkeys without breaking email login."],
      riskBudget: {
        sandboxMode: "patch-only",
        maxWallClockMinutes: 30,
        maxCostUsd: 5,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["Open a decision-ready proof bundle."],
      evidenceRequirements: ["proof bundle"],
    },
    createdAt: "2026-03-15T21:00:00.000Z",
    updatedAt: "2026-03-15T21:00:00.000Z",
  };
}

function buildDiscoveryMission(): MissionRecord {
  return {
    id: missionId,
    type: "discovery",
    status: "succeeded",
    title: "Assess auth-change blast radius for 616xold/pocket-cto",
    objective:
      "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
    sourceKind: "manual_discovery",
    sourceRef: null,
    createdBy: "operator",
    primaryRepo: "616xold/pocket-cto",
    spec: {
      type: "discovery",
      title: "Assess auth-change blast radius for 616xold/pocket-cto",
      objective:
        "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
      repos: ["616xold/pocket-cto"],
      constraints: {
        allowedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
        mustNot: [],
      },
      acceptance: ["Persist one durable discovery answer artifact."],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["discovery_answer", "proof_bundle"],
      evidenceRequirements: ["stored twin blast-radius answer"],
      input: {
        discoveryQuestion: {
          repoFullName: "616xold/pocket-cto",
          questionKind: "auth_change",
          changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
        },
      },
    },
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:03:00.000Z",
  };
}

function buildFinanceDiscoveryMission(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
): MissionRecord {
  return {
    id: missionId,
    type: "discovery",
    status: "succeeded",
    title: `Review ${questionKind} for acme`,
    objective: `Answer the stored ${questionKind} question for acme from persisted Finance Twin and CFO Wiki state only.`,
    sourceKind: "manual_discovery",
    sourceRef: null,
    createdBy: "operator",
    primaryRepo: null,
    spec: {
      type: "discovery",
      title: `Review ${questionKind} for acme`,
      objective: `Answer the stored ${questionKind} question for acme from persisted Finance Twin and CFO Wiki state only.`,
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [],
      },
      acceptance: ["Persist one durable discovery answer artifact."],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["discovery_answer", "proof_bundle"],
      evidenceRequirements: ["stored finance discovery answer"],
      input: {
        discoveryQuestion: {
          companyKey: "acme",
          questionKind,
        },
      },
    },
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:03:00.000Z",
  };
}

function buildFinanceDiscoveryAnswerMetadata(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
  freshnessPosture?: {
    reasonSummary: string;
    state: "failed" | "fresh" | "missing" | "mixed" | "stale";
  },
  limitations = ["Visible limitations remain preserved."],
) {
  const routesByQuestionKind: Record<
    FinanceDiscoveryStoredStateQuestionKind,
    Array<{ label: string; routePath: string }>
  > = {
    cash_posture: [
      {
        label: "Cash posture",
        routePath: "/finance-twin/companies/acme/cash-posture",
      },
      {
        label: "Bank account inventory",
        routePath: "/finance-twin/companies/acme/bank-accounts",
      },
    ],
    collections_pressure: [
      {
        label: "Collections posture",
        routePath: "/finance-twin/companies/acme/collections-posture",
      },
      {
        label: "Receivables aging",
        routePath: "/finance-twin/companies/acme/receivables-aging",
      },
    ],
    payables_pressure: [
      {
        label: "Payables posture",
        routePath: "/finance-twin/companies/acme/payables-posture",
      },
      {
        label: "Payables aging",
        routePath: "/finance-twin/companies/acme/payables-aging",
      },
    ],
    spend_posture: [
      {
        label: "Spend posture",
        routePath: "/finance-twin/companies/acme/spend-posture",
      },
      {
        label: "Spend items",
        routePath: "/finance-twin/companies/acme/spend-items",
      },
    ],
    obligation_calendar_review: [
      {
        label: "Obligation calendar",
        routePath: "/finance-twin/companies/acme/obligation-calendar",
      },
      {
        label: "Contracts",
        routePath: "/finance-twin/companies/acme/contracts",
      },
    ],
  };

  return {
    source: "stored_finance_twin_and_cfo_wiki",
    summary: `Stored ${questionKind} is available with limitations.`,
    companyKey: "acme",
    questionKind,
    policySourceScope: null,
    answerSummary: `Stored ${questionKind} is available with limitations.`,
    freshnessPosture: freshnessPosture ?? {
      state: "stale",
      reasonSummary: "Stored finance slice state is stale.",
    },
    limitations,
    relatedRoutes: routesByQuestionKind[questionKind],
    relatedWikiPages: [
      {
        pageKey: "company/overview",
        title: "Company overview",
      },
    ],
    evidenceSections: [
      {
        key: `${questionKind}_route`,
        title: `${questionKind} route`,
        summary: "Stored route-backed evidence.",
        routePath: routesByQuestionKind[questionKind][0]?.routePath,
      },
    ],
    bodyMarkdown: `# ${questionKind}\n\nStored finance answer.`,
    structuredData: {},
  };
}

function readFinanceArtifactId(
  questionKind: FinanceDiscoveryStoredStateQuestionKind,
) {
  switch (questionKind) {
    case "cash_posture":
      return "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
    case "collections_pressure":
      return "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
    case "payables_pressure":
      return "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
    case "spend_posture":
      return "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa4";
    case "obligation_calendar_review":
      return "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaa5";
  }
}

function buildPolicyLookupDiscoveryMission(policySourceId: string): MissionRecord {
  return {
    id: missionId,
    type: "discovery",
    status: "succeeded",
    title: `Review policy lookup for acme from ${policySourceId}`,
    objective: `Answer the stored policy lookup question for acme from scoped policy source ${policySourceId}, persisted CFO Wiki state, and bound-source metadata only.`,
    sourceKind: "manual_discovery",
    sourceRef: null,
    createdBy: "operator",
    primaryRepo: null,
    spec: {
      type: "discovery",
      title: `Review policy lookup for acme from ${policySourceId}`,
      objective: `Answer the stored policy lookup question for acme from scoped policy source ${policySourceId}, persisted CFO Wiki state, and bound-source metadata only.`,
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [],
      },
      acceptance: ["Persist one durable discovery answer artifact."],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["discovery_answer", "proof_bundle"],
      evidenceRequirements: ["stored finance discovery answer"],
      input: {
        discoveryQuestion: {
          companyKey: "acme",
          questionKind: "policy_lookup",
          policySourceId,
        },
      },
    },
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-15T09:03:00.000Z",
  };
}

function buildReportingMission(sourceDiscoveryMissionId: string): MissionRecord {
  return {
    id: missionId,
    type: "reporting",
    status: "succeeded",
    title: "Draft finance memo for acme from cash posture discovery",
    objective: `Compile one draft finance memo plus one linked evidence appendix from completed discovery mission ${sourceDiscoveryMissionId} and its stored evidence only.`,
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft finance memo for acme from cash posture discovery",
      objective: `Compile one draft finance memo plus one linked evidence appendix from completed discovery mission ${sourceDiscoveryMissionId} and its stored evidence only.`,
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: ["do not invoke the codex runtime"],
      },
      acceptance: [
        "persist one draft finance_memo artifact",
        "persist one linked evidence_appendix artifact",
      ],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
      evidenceRequirements: ["stored discovery_answer artifact"],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
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
  };
}

function buildBoardPacketMission(
  sourceDiscoveryMissionId: string,
  sourceReportingMissionId: string,
): MissionRecord {
  return {
    id: missionId,
    type: "reporting",
    status: "succeeded",
    title: "Draft board packet for acme from cash posture reporting",
    objective:
      "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft board packet for acme from cash posture reporting",
      objective:
        "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [
          "do not invoke the codex runtime",
          "do not add approval workflow, release workflow, lender packets, diligence packets, PDF export, or slide export",
        ],
      },
      acceptance: ["persist one draft board_packet artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["board_packet", "proof_bundle"],
      evidenceRequirements: [
        "stored finance_memo artifact",
        "stored evidence_appendix artifact",
      ],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
          sourceReportingMissionId,
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
  };
}

function buildLenderUpdateMission(
  sourceDiscoveryMissionId: string,
  sourceReportingMissionId: string,
): MissionRecord {
  return {
    id: missionId,
    type: "reporting",
    status: "running",
    title: "Draft lender update for acme from cash posture reporting",
    objective:
      "Compile one draft lender update from completed reporting mission and its stored finance memo plus evidence appendix only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft lender update for acme from cash posture reporting",
      objective:
        "Compile one draft lender update from completed reporting mission and its stored finance memo plus evidence appendix only.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [],
      },
      acceptance: ["persist one draft lender_update artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["lender_update", "proof_bundle"],
      evidenceRequirements: [
        "stored finance_memo artifact",
        "stored evidence_appendix artifact",
      ],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
          sourceReportingMissionId,
          reportKind: "lender_update",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    },
    createdAt: "2026-04-19T12:30:00.000Z",
    updatedAt: "2026-04-19T12:30:00.000Z",
  };
}

function buildDiligencePacketMission(
  sourceDiscoveryMissionId: string,
  sourceReportingMissionId: string,
): MissionRecord {
  return {
    id: missionId,
    type: "reporting",
    status: "running",
    title: "Draft diligence packet for acme from cash posture reporting",
    objective:
      "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
    sourceKind: "manual_reporting",
    sourceRef: null,
    createdBy: "finance-operator",
    primaryRepo: null,
    spec: {
      type: "reporting",
      title: "Draft diligence packet for acme from cash posture reporting",
      objective:
        "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
      repos: [],
      constraints: {
        allowedPaths: [],
        mustNot: [
          "do not invoke the codex runtime",
          "do not add approval workflow, release workflow, filing, export, PDF export, or slide export",
        ],
      },
      acceptance: ["persist one draft diligence_packet artifact"],
      riskBudget: {
        sandboxMode: "read-only",
        maxWallClockMinutes: 5,
        maxCostUsd: 1,
        allowNetwork: false,
        requiresHumanApprovalFor: [],
      },
      deliverables: ["diligence_packet", "proof_bundle"],
      evidenceRequirements: [
        "stored finance_memo artifact",
        "stored evidence_appendix artifact",
      ],
      input: {
        reportingRequest: {
          sourceDiscoveryMissionId,
          sourceReportingMissionId,
          reportKind: "diligence_packet",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
        },
      },
    },
    createdAt: "2026-04-19T13:00:00.000Z",
    updatedAt: "2026-04-19T13:00:00.000Z",
  };
}

function buildPolicyLookupDiscoveryAnswerMetadata(policySourceId: string) {
  return {
    source: "stored_finance_twin_and_cfo_wiki",
    summary: `Stored policy lookup for acme is scoped to policy source ${policySourceId}. Travel and expense policy sets explicit approval thresholds for higher-value spend.`,
    companyKey: "acme",
    questionKind: "policy_lookup",
    policySourceId,
    policySourceScope: {
      policySourceId,
      sourceName: "Travel and expense policy",
      documentRole: "policy_document",
      includeInCompile: true,
      latestExtractStatus: "extracted",
      latestSnapshotVersion: 2,
    },
    answerSummary: `Stored policy lookup for acme is scoped to policy source ${policySourceId}. Travel and expense policy sets explicit approval thresholds for higher-value spend.`,
    freshnessPosture: {
      state: "fresh" as const,
      reasonSummary: "Compiled policy page freshness is current.",
    },
    limitations: [
      `This answer is scoped only to policy source ${policySourceId}; it does not search across other policies or unrelated company documents.`,
      "Visible limitations remain preserved.",
    ],
    relatedRoutes: [
      {
        label: "Scoped policy page",
        routePath: `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`policies/${policySourceId}`)}`,
      },
      {
        label: "Scoped source digest page",
        routePath: `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`sources/${policySourceId}/snapshots/2`)}`,
      },
      {
        label: "Policy corpus concept page",
        routePath: `/cfo-wiki/companies/acme/pages/${encodeURIComponent("concepts/policy-corpus")}`,
      },
    ],
    relatedWikiPages: [
      {
        pageKey: `policies/${policySourceId}`,
        title: "Travel and expense policy",
      },
      {
        pageKey: `sources/${policySourceId}/snapshots/2`,
        title: "Travel and expense policy digest",
      },
      {
        pageKey: "concepts/policy-corpus",
        title: "Policy corpus",
      },
    ],
    evidenceSections: [
      {
        key: "scoped_policy_page",
        title: "Scoped policy page",
        summary: "Compiled policy page evidence remains source-scoped.",
        routePath: `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`policies/${policySourceId}`)}`,
        pageKey: `policies/${policySourceId}`,
      },
    ],
    bodyMarkdown: "# Policy lookup answer\n\nStored policy answer.",
    structuredData: {},
  };
}

function buildTasks(input: {
  executorStatus: MissionTaskRecord["status"];
  executorSummary?: string | null;
  plannerStatus: MissionTaskRecord["status"];
}): MissionTaskRecord[] {
  return [
    {
      id: plannerTaskId,
      missionId,
      role: "planner",
      sequence: 0,
      status: input.plannerStatus,
      attemptCount: 1,
      codexThreadId: "thread_planner_1",
      codexTurnId: null,
      workspaceId: null,
      dependsOnTaskId: null,
      summary: "Planner captured the implementation plan.",
      createdAt: "2026-03-15T21:00:00.000Z",
      updatedAt: "2026-03-15T21:01:00.000Z",
    },
    {
      id: executorTaskId,
      missionId,
      role: "executor",
      sequence: 1,
      status: input.executorStatus,
      attemptCount: 1,
      codexThreadId: "thread_executor_1",
      codexTurnId: null,
      workspaceId: null,
      dependsOnTaskId: plannerTaskId,
      summary: input.executorSummary ?? "Executor summary placeholder.",
      createdAt: "2026-03-15T21:02:00.000Z",
      updatedAt: "2026-03-15T21:12:00.000Z",
    },
  ];
}

function buildDiscoveryTasks(
  scoutStatus: MissionTaskRecord["status"],
): MissionTaskRecord[] {
  return [
    {
      id: scoutTaskId,
      missionId,
      role: "scout",
      sequence: 0,
      status: scoutStatus,
      attemptCount: 1,
      codexThreadId: null,
      codexTurnId: null,
      workspaceId: null,
      dependsOnTaskId: null,
      summary:
        "Stored twin state shows apps/control-plane as the main auth-change blast radius with stale workflow freshness.",
      createdAt: "2026-03-20T09:00:00.000Z",
      updatedAt: "2026-03-20T09:03:00.000Z",
    },
  ];
}

function buildArtifact(
  input: Partial<ArtifactRecord> &
    Pick<ArtifactRecord, "id" | "kind"> & { createdAt: string },
): ArtifactRecord {
  return {
    id: input.id,
    missionId,
    taskId: input.taskId ?? null,
    kind: input.kind,
    uri:
      input.uri ??
      `pocket-cto://missions/${missionId}/artifacts/${input.kind}/${input.id}`,
    mimeType: input.mimeType ?? "application/json",
    sha256: input.sha256 ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  };
}

function buildPlaceholderBundle(mission: MissionRecord): ProofBundleManifest {
  return new EvidenceService().createPlaceholder(mission);
}

function createFreshnessSlice(state: "fresh" | "stale") {
  return {
    state,
    scorePercent: state === "stale" ? 72 : 100,
    latestRunStatus: "succeeded" as const,
    ageSeconds: state === "stale" ? 7200 : 10,
    staleAfterSeconds: 3600,
    reasonCode: state === "stale" ? "stale_twin_state" : "fresh",
    reasonSummary:
      state === "stale"
        ? "Stored twin state is stale for this slice."
        : "Stored twin state is fresh.",
    latestRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    latestCompletedAt: "2026-03-20T09:00:00.000Z",
    latestSuccessfulRunId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    latestSuccessfulCompletedAt: "2026-03-20T09:00:00.000Z",
  };
}
