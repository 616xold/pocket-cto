import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionCard } from "./mission-card";

describe("MissionCard", () => {
  it("renders approval and artifact sections without the stale mission-spine placeholder copy", () => {
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[
          {
            actionHint:
              "Review the requested file-edit scope, then approve only if this task should change those files.",
            approvalId: "22222222-2222-4222-8222-222222222222",
            kind: "file_change",
            requestedAt: "2026-03-14T10:01:00.000Z",
            requestedBy: "system",
            repoContext: {
              repoLabel: "web",
              branchName: null,
              pullRequestNumber: null,
              pullRequestUrl: null,
            },
            resolutionSummary: null,
            resolvedAt: null,
            resolvedBy: null,
            status: "pending",
            summary:
              "Allow file edits in the task workspace. Why it matters: the runtime needs workspace write access to continue.",
            task: {
              id: "33333333-3333-4333-8333-333333333333",
              label: "Task 1 · executor",
              role: "executor",
              sequence: 1,
            },
            title: "Approve workspace file changes",
          },
          {
            actionHint: null,
            approvalId: "88888888-8888-4888-8888-888888888888",
            kind: "command",
            requestedAt: "2026-03-14T10:03:00.000Z",
            requestedBy: "system",
            repoContext: {
              repoLabel: "web",
              branchName: "pocket-cto/mission-1/1-executor",
              pullRequestNumber: 19,
              pullRequestUrl: "https://github.com/acme/web/pull/19",
            },
            resolutionSummary:
              "Approved by Alicia at 2026-03-14T10:04:00.000Z. Rationale: Local validation should run before publishing.",
            resolvedAt: "2026-03-14T10:04:00.000Z",
            resolvedBy: "Alicia",
            status: "approved",
            summary:
              "Run pnpm --filter @pocket-cto/web test. Working directory: .../mission-1/apps/web. Why it matters: verify the updated mission detail UI before publishing.",
            task: {
              id: "33333333-3333-4333-8333-333333333333",
              label: "Task 1 · executor",
              role: "executor",
              sequence: 1,
            },
            title: "Approve command: pnpm --filter @pocket-cto/web test",
          },
        ]}
        artifacts={[
          {
            createdAt: "2026-03-14T10:00:00.000Z",
            id: "66666666-6666-4666-8666-666666666666",
            kind: "proof_bundle_manifest",
            summary: "Proof bundle ready with 3 linked artifacts.",
            taskId: null,
            uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/proof-bundle-manifest",
          },
          {
            createdAt: "2026-03-14T10:04:00.000Z",
            id: "77777777-7777-4777-8777-777777777777",
            kind: "diff_summary",
            summary: "Workspace changes touched apps/web and apps/control-plane.",
            taskId: "33333333-3333-4333-8333-333333333333",
            uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/diff-summary",
          },
        ]}
        liveControl={{
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        }}
        discoveryAnswer={null}
        mission={{
          createdAt: "2026-03-14T10:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective: "Ship passkeys without breaking email login.",
          primaryRepo: "web",
          sourceKind: "manual_text",
          sourceRef: null,
          spec: {
            acceptance: ["Ship passkeys without breaking email login."],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: [
              "Updated mission detail route with approvals and artifacts.",
            ],
            evidenceRequirements: ["approval ledger", "artifact ledger"],
            objective: "Ship passkeys without breaking email login.",
            repos: ["web"],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 5,
              maxWallClockMinutes: 30,
              requiresHumanApprovalFor: [],
              sandboxMode: "patch-only",
            },
            title: "Implement passkeys for sign-in",
            type: "build",
          },
          status: "running",
          title: "Implement passkeys for sign-in",
          type: "build",
          updatedAt: "2026-03-14T10:05:00.000Z",
        }}
        proofBundle={{
          artifactIds: ["77777777-7777-4777-8777-777777777777"],
          artifacts: [
            {
              id: "77777777-7777-4777-8777-777777777777",
              kind: "diff_summary",
            },
          ],
          branchName: null,
          changeSummary: "Updated the mission detail read model for approvals and artifacts.",
          decisionTrace: [
            "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
          ],
          evidenceCompleteness: {
            status: "partial",
            expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
            presentArtifactKinds: ["diff_summary"],
            missingArtifactKinds: ["plan", "test_report", "pr_link"],
            notes: [
              "Planner evidence is missing.",
              "Validation evidence is missing.",
              "GitHub pull request evidence is missing.",
            ],
          },
          latestApproval: {
            createdAt: "2026-03-14T10:01:00.000Z",
            id: "22222222-2222-4222-8222-222222222222",
            kind: "file_change",
            rationale: null,
            requestedBy: "system",
            resolvedBy: null,
            status: "pending",
            updatedAt: "2026-03-14T10:01:00.000Z",
          },
          missionId: "11111111-1111-4111-8111-111111111111",
          missionTitle: "Implement passkeys for sign-in",
          objective: "Ship passkeys without breaking email login.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          replayEventCount: 14,
          riskSummary: "Action controls still require embedded-worker mode.",
          rollbackSummary: "Disable the action panel and fall back to the API route surface.",
          status: "incomplete",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-03-14T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: "2026-03-14T10:04:00.000Z",
            latestPullRequestAt: null,
            latestApprovalAt: "2026-03-14T10:01:00.000Z",
            latestArtifactAt: "2026-03-14T10:04:00.000Z",
          },
          validationSummary: "Pending local executor validation evidence.",
          verificationSummary:
            "A runtime approval is still pending, so the proof bundle is not final yet.",
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: "thread_live_1",
            codexTurnId: "turn_live_1",
            createdAt: "2026-03-14T10:00:00.000Z",
            dependsOnTaskId: null,
            id: "33333333-3333-4333-8333-333333333333",
            missionId: "11111111-1111-4111-8111-111111111111",
            role: "executor",
            sequence: 1,
            status: "running",
            summary: "Applying the operator read-model change.",
            updatedAt: "2026-03-14T10:05:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Approvals");
    expect(html).toContain("Artifact ledger");
    expect(html).toContain("Approve workspace file changes");
    expect(html).toContain(
      "Approved by Alicia at 2026-03-14T10:04:00.000Z. Rationale: Local validation should run before publishing.",
    );
    expect(html).toContain("Proof bundle ready with 3 linked artifacts.");
    expect(html).not.toContain(
      "No approval trace yet. This is expected during the mission-spine milestone.",
    );
  });

  it("uses neutral proof-bundle fallback copy instead of pending-publication wording", () => {
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[]}
        artifacts={[]}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        discoveryAnswer={null}
        mission={{
          createdAt: "2026-03-16T10:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective: "Ship a truthful failed proof bundle.",
          primaryRepo: null,
          sourceKind: "manual_text",
          sourceRef: null,
          spec: {
            acceptance: ["Ship a truthful failed proof bundle."],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: ["Proof bundle wording review."],
            evidenceRequirements: ["proof bundle"],
            objective: "Ship a truthful failed proof bundle.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 5,
              maxWallClockMinutes: 30,
              requiresHumanApprovalFor: [],
              sandboxMode: "patch-only",
            },
            title: "Truthful failed proof bundle",
            type: "build",
          },
          status: "failed",
          title: "Truthful failed proof bundle",
          type: "build",
          updatedAt: "2026-03-16T10:05:00.000Z",
        }}
        proofBundle={{
          artifactIds: [],
          artifacts: [],
          branchName: null,
          changeSummary: "",
          decisionTrace: [],
          evidenceCompleteness: {
            status: "partial",
            expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
            presentArtifactKinds: ["test_report"],
            missingArtifactKinds: ["plan", "diff_summary", "pr_link"],
            notes: ["GitHub pull request evidence is missing."],
          },
          latestApproval: null,
          missionId: "11111111-1111-4111-8111-111111111111",
          missionTitle: "Truthful failed proof bundle",
          objective: "Ship a truthful failed proof bundle.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          replayEventCount: 12,
          riskSummary: "",
          rollbackSummary: "",
          status: "failed",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-03-16T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: "2026-03-16T10:04:00.000Z",
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-03-16T10:04:00.000Z",
          },
          validationSummary: "",
          verificationSummary: "",
        }}
        tasks={[]}
      />,
    );

    expect(html).toContain("Not recorded yet.");
    expect(html).not.toContain("Pending PR publication.");
    expect(html).not.toContain("Pending repo resolution.");
  });

  it("renders the stored discovery answer with freshness and limitations prominently", () => {
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[]}
        artifacts={[
          {
            createdAt: "2026-03-20T03:10:00.000Z",
            id: "77777777-7777-4777-8777-777777777777",
            kind: "discovery_answer",
            summary:
              "Stored twin state shows apps as the main impacted directory for this auth change.",
            taskId: "33333333-3333-4333-8333-333333333333",
            uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/discovery-answer",
          },
        ]}
        discoveryAnswer={{
          source: "stored_twin_blast_radius_query",
          summary:
            "Stored twin state shows apps as the main impacted directory for this auth change.",
          repoFullName: "616xold/pocket-cto",
          questionKind: "auth_change",
          changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
          answerSummary:
            "Stored twin state shows apps as the main impacted directory for this auth change.",
          impactedDirectories: [
            {
              path: "apps",
              label: "apps",
              classification: "workspace_directory",
              matchedChangedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
              ownershipState: "unowned",
              effectiveOwners: [],
              appliedRule: null,
            },
          ],
          impactedManifests: [
            {
              path: "apps/control-plane/package.json",
              packageName: "@pocket-cto/control-plane",
              private: null,
              hasWorkspaces: false,
              scriptNames: ["dev", "test"],
              matchedChangedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
              ownershipState: "unknown",
              effectiveOwners: [],
              appliedRule: null,
              relatedTestSuiteCount: 1,
              relatedMappedCiJobCount: 0,
            },
          ],
          ownersByTarget: [],
          relatedTestSuites: [
            {
              stableKey: "suite:apps/control-plane/package.json:test",
              manifestPath: "apps/control-plane/package.json",
              packageName: "@pocket-cto/control-plane",
              scriptKey: "test",
              matchedJobs: [],
              impactedByChangedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
            },
          ],
          relatedMappedCiJobs: [],
          freshness: {
            rollup: {
              state: "stale",
              scorePercent: 50,
              latestRunStatus: "succeeded",
              ageSeconds: 50000,
              staleAfterSeconds: 43200,
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
              metadata: {
                state: "fresh",
                scorePercent: 100,
                latestRunStatus: "succeeded",
                latestRunId: "11111111-1111-4111-8111-111111111111",
                latestCompletedAt: "2026-03-20T03:00:00.000Z",
                latestSuccessfulRunId: "11111111-1111-4111-8111-111111111111",
                latestSuccessfulCompletedAt: "2026-03-20T03:00:00.000Z",
                ageSeconds: 100,
                staleAfterSeconds: 21600,
                reasonCode: "fresh_successful_sync",
                reasonSummary: "Stored metadata is fresh.",
              },
              ownership: {
                state: "fresh",
                scorePercent: 100,
                latestRunStatus: "succeeded",
                latestRunId: "22222222-2222-4222-8222-222222222222",
                latestCompletedAt: "2026-03-20T03:00:00.000Z",
                latestSuccessfulRunId: "22222222-2222-4222-8222-222222222222",
                latestSuccessfulCompletedAt: "2026-03-20T03:00:00.000Z",
                ageSeconds: 100,
                staleAfterSeconds: 43200,
                reasonCode: "fresh_successful_sync",
                reasonSummary: "Stored ownership is fresh.",
              },
              workflows: {
                state: "stale",
                scorePercent: 50,
                latestRunStatus: "succeeded",
                latestRunId: "33333333-3333-4333-8333-333333333333",
                latestCompletedAt: "2026-03-19T12:00:00.000Z",
                latestSuccessfulRunId: "33333333-3333-4333-8333-333333333333",
                latestSuccessfulCompletedAt: "2026-03-19T12:00:00.000Z",
                ageSeconds: 50000,
                staleAfterSeconds: 43200,
                reasonCode: "stale_successful_sync",
                reasonSummary: "Stored workflows are stale.",
              },
              testSuites: {
                state: "stale",
                scorePercent: 50,
                latestRunStatus: "succeeded",
                latestRunId: "44444444-4444-4444-8444-444444444444",
                latestCompletedAt: "2026-03-19T12:00:00.000Z",
                latestSuccessfulRunId: "44444444-4444-4444-8444-444444444444",
                latestSuccessfulCompletedAt: "2026-03-19T12:00:00.000Z",
                ageSeconds: 50000,
                staleAfterSeconds: 43200,
                reasonCode: "stale_successful_sync",
                reasonSummary: "Stored test suites are stale.",
              },
              docs: {
                state: "fresh",
                scorePercent: 100,
                latestRunStatus: "succeeded",
                latestRunId: "55555555-5555-4555-8555-555555555555",
                latestCompletedAt: "2026-03-20T03:00:00.000Z",
                latestSuccessfulRunId: "55555555-5555-4555-8555-555555555555",
                latestSuccessfulCompletedAt: "2026-03-20T03:00:00.000Z",
                ageSeconds: 100,
                staleAfterSeconds: 86400,
                reasonCode: "fresh_successful_sync",
                reasonSummary: "Stored docs are fresh.",
              },
              runbooks: {
                state: "fresh",
                scorePercent: 100,
                latestRunStatus: "succeeded",
                latestRunId: "66666666-6666-4666-8666-666666666666",
                latestCompletedAt: "2026-03-20T03:00:00.000Z",
                latestSuccessfulRunId: "66666666-6666-4666-8666-666666666666",
                latestSuccessfulCompletedAt: "2026-03-20T03:00:00.000Z",
                ageSeconds: 100,
                staleAfterSeconds: 86400,
                reasonCode: "fresh_successful_sync",
                reasonSummary: "Stored runbooks are fresh.",
              },
            },
          },
          freshnessRollup: {
            state: "stale",
            scorePercent: 50,
            latestRunStatus: "succeeded",
            ageSeconds: 50000,
            staleAfterSeconds: 43200,
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
        }}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          createdAt: "2026-03-20T03:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
          primaryRepo: "616xold/pocket-cto",
          sourceKind: "manual_discovery",
          sourceRef: null,
          spec: {
            acceptance: ["persist one durable discovery answer artifact"],
            constraints: {
              allowedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
              mustNot: [],
            },
            deliverables: ["discovery_answer", "proof_bundle"],
            evidenceRequirements: ["stored twin blast-radius answer"],
            input: {
              discoveryQuestion: {
                repoFullName: "616xold/pocket-cto",
                questionKind: "auth_change",
                changedPaths: [
                  "apps/control-plane/src/modules/github-app/auth.ts",
                ],
              },
            },
            objective:
              "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
            repos: ["616xold/pocket-cto"],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Assess auth-change blast radius for 616xold/pocket-cto",
            type: "discovery",
          },
          status: "succeeded",
          title: "Assess auth-change blast radius for 616xold/pocket-cto",
          type: "discovery",
          updatedAt: "2026-03-20T03:10:00.000Z",
        }}
        proofBundle={{
          artifactIds: ["77777777-7777-4777-8777-777777777777"],
          artifacts: [
            {
              id: "77777777-7777-4777-8777-777777777777",
              kind: "discovery_answer",
            },
          ],
          branchName: null,
          changeSummary:
            "Stored twin state shows apps as the main impacted directory for this auth change.",
          decisionTrace: [],
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["discovery_answer"],
            presentArtifactKinds: ["discovery_answer"],
            missingArtifactKinds: [],
            notes: [],
          },
          latestApproval: null,
          missionId: "11111111-1111-4111-8111-111111111111",
          missionTitle: "Assess auth-change blast radius for 616xold/pocket-cto",
          objective:
            "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          replayEventCount: 8,
          riskSummary: "",
          rollbackSummary: "",
          status: "ready",
          targetRepoFullName: "616xold/pocket-cto",
          timestamps: {
            missionCreatedAt: "2026-03-20T03:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-03-20T03:10:00.000Z",
          },
          validationSummary: "",
          verificationSummary:
            "Review the stored freshness and limitation details before acting on the answer.",
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-03-20T03:00:00.000Z",
            dependsOnTaskId: null,
            id: "33333333-3333-4333-8333-333333333333",
            missionId: "11111111-1111-4111-8111-111111111111",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Stored twin state shows apps as the main impacted directory for this auth change.",
            updatedAt: "2026-03-20T03:10:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Stored blast-radius evidence");
    expect(html).toContain("616xold/pocket-cto");
    expect(html).toContain("auth_change");
    expect(html).toContain("Stored workflow and test-suite state is stale.");
    expect(html).toContain("No related mapped CI jobs were stored.");
    expect(html).toContain("apps/control-plane/src/modules/github-app/auth.ts");
  });
});
