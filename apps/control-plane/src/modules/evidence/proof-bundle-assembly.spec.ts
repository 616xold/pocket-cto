import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_QUESTION_KINDS,
  type FinanceDiscoveryQuestionKind,
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
            summary: "Workspace changes touched README.md and apps/web/page.tsx.",
          },
        }),
        buildArtifact({
          id: "66666666-6666-4666-8666-666666666666",
          kind: "test_report",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:11:00.000Z",
          metadata: {
            summary: "Local executor validation passed. Validation passed for README.md (+1 more) and a clean git diff check.",
          },
        }),
        buildArtifact({
          id: "77777777-7777-4777-8777-777777777777",
          kind: "pr_link",
          taskId: executorTaskId,
          uri: "https://github.com/616xold/pocket-cto/pull/77",
          createdAt: "2026-03-15T21:12:00.000Z",
          metadata: {
            branchName: "pocket-cto/11111111-1111-4111-8111-111111111111/1-executor",
            draft: true,
            prNumber: 77,
            prUrl: "https://github.com/616xold/pocket-cto/pull/77",
            publishedAt: "2026-03-15T21:12:00.000Z",
            repoFullName: "616xold/pocket-cto",
            summary: "Draft PR #77 opened for 616xold/pocket-cto from pocket-cto/11111111-1111-4111-8111-111111111111/1-executor into main.",
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
            summary: "Local executor validation failed: the executor turn completed without changing any files.",
          },
        }),
        buildArtifact({
          id: "88888888-8888-4888-8888-888888888888",
          kind: "log_excerpt",
          taskId: executorTaskId,
          createdAt: "2026-03-15T21:11:30.000Z",
          metadata: {
            summary: "Captured executor failure excerpts from runtime output and local validation.",
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
            changedPaths: [
              "apps/control-plane/src/modules/github-app/auth.ts",
            ],
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

  it.each(FINANCE_DISCOVERY_QUESTION_KINDS)(
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
  questionKind: FinanceDiscoveryQuestionKind,
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
  questionKind: FinanceDiscoveryQuestionKind,
) {
  const routesByQuestionKind: Record<
    FinanceDiscoveryQuestionKind,
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
    answerSummary: `Stored ${questionKind} is available with limitations.`,
    freshnessPosture: {
      state: "stale",
      reasonSummary: "Stored finance slice state is stale.",
    },
    limitations: ["Visible limitations remain preserved."],
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

function readFinanceArtifactId(questionKind: FinanceDiscoveryQuestionKind) {
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
