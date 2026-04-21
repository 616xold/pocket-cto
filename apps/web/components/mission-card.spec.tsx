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
            requiresLiveControl: true,
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
            requiresLiveControl: true,
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
            summary:
              "Workspace changes touched apps/web and apps/control-plane.",
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
          changeSummary:
            "Updated the mission detail read model for approvals and artifacts.",
          companyKey: null,
          decisionTrace: [
            "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
          ],
          evidenceCompleteness: {
            status: "partial",
            expectedArtifactKinds: [
              "plan",
              "diff_summary",
              "test_report",
              "pr_link",
            ],
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
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          answerSummary: "",
          reportKind: null,
          reportDraftStatus: null,
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: "",
          appendixPresent: false,
          freshnessState: null,
          freshnessSummary: "",
          limitationsSummary: "",
          pullRequestNumber: null,
          pullRequestUrl: null,
          policySourceId: null,
          policySourceScope: null,
          questionKind: null,
          replayEventCount: 14,
          relatedRoutePaths: [],
          relatedWikiPageKeys: [],
          riskSummary: "Action controls still require embedded-worker mode.",
          rollbackSummary:
            "Disable the action panel and fall back to the API route surface.",
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
        reporting={null}
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
          companyKey: null,
          decisionTrace: [],
          evidenceCompleteness: {
            status: "partial",
            expectedArtifactKinds: [
              "plan",
              "diff_summary",
              "test_report",
              "pr_link",
            ],
            presentArtifactKinds: ["test_report"],
            missingArtifactKinds: ["plan", "diff_summary", "pr_link"],
            notes: ["GitHub pull request evidence is missing."],
          },
          latestApproval: null,
          missionId: "11111111-1111-4111-8111-111111111111",
          missionTitle: "Truthful failed proof bundle",
          objective: "Ship a truthful failed proof bundle.",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          answerSummary: "",
          reportKind: null,
          reportDraftStatus: null,
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: "",
          appendixPresent: false,
          freshnessState: null,
          freshnessSummary: "",
          limitationsSummary: "",
          pullRequestNumber: null,
          pullRequestUrl: null,
          policySourceId: null,
          policySourceScope: null,
          questionKind: null,
          replayEventCount: 12,
          relatedRoutePaths: [],
          relatedWikiPageKeys: [],
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
        reporting={null}
        tasks={[]}
      />,
    );

    expect(html).toContain("Not recorded yet.");
    expect(html).not.toContain("Pending PR publication.");
    expect(html).not.toContain("Pending repo resolution.");
  });

  it("humanizes supported finance question kinds in mission detail and proof-bundle blocks", () => {
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[]}
        artifacts={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          createdAt: "2026-04-15T10:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
          primaryRepo: null,
          sourceKind: "manual_discovery",
          sourceRef: null,
          spec: {
            acceptance: [
              "persist one durable finance discovery answer artifact",
            ],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: ["discovery_answer", "proof_bundle"],
            evidenceRequirements: ["stored finance discovery answer"],
            input: {
              discoveryQuestion: {
                companyKey: "acme",
                questionKind: "cash_posture",
              },
            },
            objective:
              "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Assess cash posture for acme",
            type: "discovery",
          },
          status: "succeeded",
          title: "Assess cash posture for acme",
          type: "discovery",
          updatedAt: "2026-04-15T10:05:00.000Z",
        }}
        proofBundle={{
          artifactIds: [],
          artifacts: [],
          branchName: null,
          changeSummary: "Stored cash posture is available with limitations.",
          companyKey: "acme",
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
          missionTitle: "Assess cash posture for acme",
          objective:
            "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          answerSummary: "Stored cash posture is available with limitations.",
          reportKind: null,
          reportDraftStatus: null,
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: "",
          appendixPresent: false,
          freshnessState: "fresh",
          freshnessSummary:
            "All required Finance Twin reads for cash posture are fresh for acme.",
          limitationsSummary: "Visible limitations remain preserved.",
          policySourceId: null,
          policySourceScope: null,
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "cash_posture",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          replayEventCount: 3,
          riskSummary: "",
          rollbackSummary: "",
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-15T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-15T10:05:00.000Z",
          },
          validationSummary: "",
          verificationSummary: "",
        }}
        reporting={null}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-15T10:00:00.000Z",
            dependsOnTaskId: null,
            id: "33333333-3333-4333-8333-333333333333",
            missionId: "11111111-1111-4111-8111-111111111111",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary: "Stored cash posture is available with limitations.",
            updatedAt: "2026-04-15T10:05:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Cash posture");
    expect(html).toContain("Fresh");
    expect(html).not.toContain(">cash_posture<");
    expect(html).not.toContain(">fresh<");
  });

  it("renders explicit policy source scope in mission detail and proof-bundle blocks", () => {
    const policySourceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[]}
        artifacts={[]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          createdAt: "2026-04-15T10:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Answer the stored policy lookup question for acme from scoped policy source only.",
          primaryRepo: null,
          sourceKind: "manual_discovery",
          sourceRef: null,
          spec: {
            acceptance: [
              "persist one durable finance discovery answer artifact",
            ],
            constraints: {
              allowedPaths: [],
              mustNot: [],
            },
            deliverables: ["discovery_answer", "proof_bundle"],
            evidenceRequirements: ["stored scoped policy page"],
            input: {
              discoveryQuestion: {
                companyKey: "acme",
                questionKind: "policy_lookup",
                policySourceId,
              },
            },
            objective:
              "Answer the stored policy lookup question for acme from scoped policy source only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Review policy lookup for acme",
            type: "discovery",
          },
          status: "succeeded",
          title: "Review policy lookup for acme",
          type: "discovery",
          updatedAt: "2026-04-15T10:05:00.000Z",
        }}
        proofBundle={{
          artifactIds: [],
          artifacts: [],
          branchName: null,
          changeSummary:
            "Stored policy lookup is scoped to the requested policy source.",
          companyKey: "acme",
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
          missionTitle: "Review policy lookup for acme",
          objective:
            "Answer the stored policy lookup question for acme from scoped policy source only.",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          answerSummary:
            "Stored policy lookup is scoped to the requested policy source.",
          reportKind: null,
          reportDraftStatus: null,
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: "",
          appendixPresent: false,
          freshnessState: "missing",
          freshnessSummary:
            "Policy source has an unsupported deterministic extract for the latest stored snapshot.",
          limitationsSummary: "Visible limitations remain preserved.",
          policySourceId,
          policySourceScope: {
            policySourceId,
            sourceName: "Travel and expense policy",
            documentRole: "policy_document",
            includeInCompile: true,
            latestExtractStatus: "unsupported",
            latestSnapshotVersion: 2,
          },
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "policy_lookup",
          relatedRoutePaths: [
            `/cfo-wiki/companies/acme/pages/${encodeURIComponent(`policies/${policySourceId}`)}`,
          ],
          relatedWikiPageKeys: [`policies/${policySourceId}`],
          replayEventCount: 3,
          riskSummary: "",
          rollbackSummary: "",
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-15T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-15T10:05:00.000Z",
          },
          validationSummary: "",
          verificationSummary: "",
        }}
        reporting={null}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-15T10:00:00.000Z",
            dependsOnTaskId: null,
            id: "33333333-3333-4333-8333-333333333333",
            missionId: "11111111-1111-4111-8111-111111111111",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Stored policy lookup is scoped to the requested policy source.",
            updatedAt: "2026-04-15T10:05:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Policy lookup");
    expect(html).toContain("Policy source");
    expect(html).toContain(policySourceId);
    expect(html).toContain("Travel and expense policy");
    expect(html).toContain("Policy Document");
    expect(html).toContain("Unsupported");
    expect(html).toContain("v2");
    expect(html).toContain("Missing");
  });

  it("renders reporting output with draft memo lineage and appendix evidence", () => {
    const sourceDiscoveryMissionId = "99999999-9999-4999-8999-999999999999";
    const financeMemoId = "66666666-6666-4666-8666-666666666666";
    const evidenceAppendixId = "88888888-8888-4888-8888-888888888888";
    const discoveryAnswerId = "77777777-7777-4777-8777-777777777777";
    const proofBundleManifestId = "12121212-1212-4212-8212-121212121212";
    const html = renderToStaticMarkup(
      <MissionCard
        approvalCards={[]}
        artifacts={[
          {
            createdAt: "2026-04-18T10:05:00.000Z",
            id: financeMemoId,
            kind: "finance_memo",
            summary: "Draft finance memo summarizing stored payables pressure.",
            taskId: "33333333-3333-4333-8333-333333333333",
            uri: `pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/artifacts/${financeMemoId}`,
          },
          {
            createdAt: "2026-04-18T10:05:00.000Z",
            id: evidenceAppendixId,
            kind: "evidence_appendix",
            summary: "Linked evidence appendix for the draft finance memo.",
            taskId: "33333333-3333-4333-8333-333333333333",
            uri: `pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/artifacts/${evidenceAppendixId}`,
          },
        ]}
        discoveryAnswer={null}
        liveControl={{
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        }}
        mission={{
          createdAt: "2026-04-18T10:00:00.000Z",
          createdBy: "operator",
          id: "11111111-1111-4111-8111-111111111111",
          objective:
            "Compile one draft finance memo from the stored payables pressure evidence for acme.",
          primaryRepo: null,
          sourceKind: "manual_reporting",
          sourceRef: null,
          spec: {
            acceptance: [
              "persist one durable finance memo artifact",
              "persist one linked evidence appendix artifact",
            ],
            constraints: {
              allowedPaths: [],
              mustNot: [
                "do not invoke the codex runtime",
                "do not widen beyond the stored discovery evidence",
              ],
            },
            deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
            evidenceRequirements: [
              "stored discovery answer artifact",
              "stored discovery proof bundle",
            ],
            input: {
              reportingRequest: {
                companyKey: "acme",
                policySourceId: null,
                policySourceScope: null,
                questionKind: "payables_pressure",
                reportKind: "finance_memo",
                sourceDiscoveryMissionId,
                sourceReportingMissionId: null,
              },
            },
            objective:
              "Compile one draft finance memo from the stored payables pressure evidence for acme.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Draft finance memo for acme payables pressure",
            type: "reporting",
          },
          status: "succeeded",
          title: "Draft finance memo for acme payables pressure",
          type: "reporting",
          updatedAt: "2026-04-18T10:05:00.000Z",
        }}
        proofBundle={{
          answerSummary: "",
          appendixPresent: true,
          artifactIds: [financeMemoId, evidenceAppendixId],
          artifacts: [
            {
              id: financeMemoId,
              kind: "finance_memo",
            },
            {
              id: evidenceAppendixId,
              kind: "evidence_appendix",
            },
          ],
          branchName: null,
          changeSummary:
            "Draft finance memo summarizing stored payables pressure with linked evidence appendix.",
          companyKey: "acme",
          decisionTrace: [
            "Reporting scout task persisted finance_memo and evidence_appendix artifacts from stored discovery evidence.",
          ],
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["finance_memo", "evidence_appendix"],
            presentArtifactKinds: ["finance_memo", "evidence_appendix"],
            missingArtifactKinds: [],
            notes: [],
          },
          freshnessState: "stale",
          freshnessSummary:
            "Stored payables aging evidence is stale for acme and is carried forward into the memo draft.",
          latestApproval: null,
          limitationsSummary:
            "Stored payables aging omits one vendor feed and remains scoped to uploaded evidence.",
          missionId: "11111111-1111-4111-8111-111111111111",
          missionTitle: "Draft finance memo for acme payables pressure",
          objective:
            "Compile one draft finance memo from the stored payables pressure evidence for acme.",
          policySourceId: null,
          policySourceScope: null,
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "payables_pressure",
          relatedRoutePaths: ["/finance-twin/companies/acme/payables-aging"],
          relatedWikiPageKeys: ["metrics/payables-aging"],
          replayEventCount: 6,
          reportDraftStatus: "draft_only",
          reportKind: "finance_memo",
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft finance memo summarizing stored payables pressure and carried evidence posture.",
          riskSummary: "",
          rollbackSummary: "",
          sourceDiscoveryMissionId,
          sourceReportingMissionId: null,
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-18T10:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-18T10:05:00.000Z",
          },
          validationSummary: "",
          verificationSummary:
            "Review the linked evidence appendix before sharing the draft memo outside the operator surface.",
        }}
        reporting={{
          appendixPresent: true,
          lenderUpdate: null,
          companyKey: "acme",
          draftStatus: "draft_only",
          evidenceAppendix: {
            appendixSummary:
              "Evidence appendix linking the stored discovery answer and proof bundle.",
            bodyMarkdown:
              "# Evidence appendix\n\n## Linked stored evidence\n- discovery_answer\n- proof_bundle_manifest",
            companyKey: "acme",
            draftStatus: "draft_only",
            freshnessSummary:
              "Stored payables aging evidence is stale for acme and is carried forward into the memo draft.",
            limitations: [
              "Stored payables aging omits one vendor feed.",
              "The memo remains scoped to stored evidence only.",
            ],
            limitationsSummary:
              "Stored payables aging omits one vendor feed and remains scoped to uploaded evidence.",
            policySourceId: null,
            policySourceScope: null,
            questionKind: "payables_pressure",
            relatedRoutePaths: ["/finance-twin/companies/acme/payables-aging"],
            relatedWikiPageKeys: ["metrics/payables-aging"],
            reportKind: "finance_memo",
            source: "stored_discovery_evidence",
            sourceArtifacts: [
              {
                artifactId: discoveryAnswerId,
                kind: "discovery_answer",
              },
              {
                artifactId: proofBundleManifestId,
                kind: "proof_bundle_manifest",
              },
            ],
            sourceDiscoveryMissionId,
            summary:
              "Evidence appendix linking the stored discovery answer and proof bundle.",
          },
          financeMemo: {
            bodyMarkdown:
              "# Finance memo\n\n## Summary\nDraft finance memo summarizing stored payables pressure.",
            companyKey: "acme",
            draftStatus: "draft_only",
            freshnessSummary:
              "Stored payables aging evidence is stale for acme and is carried forward into the memo draft.",
            limitationsSummary:
              "Stored payables aging omits one vendor feed and remains scoped to uploaded evidence.",
            memoSummary:
              "Draft finance memo summarizing stored payables pressure and carried evidence posture.",
            policySourceId: null,
            policySourceScope: null,
            questionKind: "payables_pressure",
            relatedRoutePaths: ["/finance-twin/companies/acme/payables-aging"],
            relatedWikiPageKeys: ["metrics/payables-aging"],
            reportKind: "finance_memo",
            source: "stored_discovery_evidence",
            sourceArtifacts: [
              {
                artifactId: discoveryAnswerId,
                kind: "discovery_answer",
              },
              {
                artifactId: proofBundleManifestId,
                kind: "proof_bundle_manifest",
              },
            ],
            sourceDiscoveryMissionId,
            summary: "Draft finance memo summarizing stored payables pressure.",
          },
          freshnessSummary:
            "Stored payables aging evidence is stale for acme and is carried forward into the memo draft.",
          limitationsSummary:
            "Stored payables aging omits one vendor feed and remains scoped to uploaded evidence.",
          policySourceId: null,
          policySourceScope: null,
          boardPacket: null,
          diligencePacket: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
          questionKind: "payables_pressure",
          relatedRoutePaths: ["/finance-twin/companies/acme/payables-aging"],
          relatedWikiPageKeys: ["metrics/payables-aging"],
          reportKind: "finance_memo",
          reportSummary:
            "Draft finance memo summarizing stored payables pressure and carried evidence posture.",
          sourceDiscoveryMissionId,
          sourceReportingMissionId: null,
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-18T10:00:00.000Z",
            dependsOnTaskId: null,
            id: "33333333-3333-4333-8333-333333333333",
            missionId: "11111111-1111-4111-8111-111111111111",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Draft finance memo summarizing stored payables pressure and carried evidence posture.",
            updatedAt: "2026-04-18T10:05:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Reporting output");
    expect(html).toContain("Finance memo");
    expect(html).toContain("draft_only");
    expect(html).toContain(sourceDiscoveryMissionId);
    expect(html).toContain("Stored");
    expect(html).toContain("/finance-twin/companies/acme/payables-aging");
    expect(html).toContain("metrics/payables-aging");
    expect(html).toContain(discoveryAnswerId);
    expect(html).toContain("Stored payables aging omits one vendor feed.");
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
              allowedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
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
          companyKey: null,
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
          missionTitle:
            "Assess auth-change blast radius for 616xold/pocket-cto",
          objective:
            "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
          sourceDiscoveryMissionId: null,
          sourceReportingMissionId: null,
          answerSummary: "",
          reportKind: null,
          reportDraftStatus: null,
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary: "",
          appendixPresent: false,
          freshnessState: null,
          freshnessSummary: "",
          limitationsSummary: "",
          policySourceId: null,
          policySourceScope: null,
          pullRequestNumber: null,
          pullRequestUrl: null,
          questionKind: "auth_change",
          replayEventCount: 8,
          relatedRoutePaths: [],
          relatedWikiPageKeys: [],
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
        reporting={null}
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

  it("renders board-packet mission detail with source-report lineage and circulation-readiness posture", () => {
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
          createdAt: "2026-04-19T12:00:00.000Z",
          createdBy: "finance-operator",
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          objective:
            "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          primaryRepo: null,
          sourceKind: "manual_reporting",
          sourceRef: null,
          spec: {
            acceptance: ["persist one draft board_packet artifact"],
            constraints: {
              allowedPaths: [],
              mustNot: [
                "do not invoke the codex runtime",
                "do not add approval workflow, release workflow, lender packets, diligence packets, PDF export, or slide export",
              ],
            },
            deliverables: ["board_packet", "proof_bundle"],
            evidenceRequirements: [
              "stored finance_memo artifact",
              "stored evidence_appendix artifact",
            ],
            input: {
              reportingRequest: {
                companyKey: "acme",
                policySourceId: null,
                policySourceScope: null,
                questionKind: "cash_posture",
                reportKind: "board_packet",
                sourceDiscoveryMissionId:
                  "22222222-2222-4222-8222-222222222222",
                sourceReportingMissionId:
                  "33333333-3333-4333-8333-333333333333",
              },
            },
            objective:
              "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title: "Draft board packet for acme from cash posture reporting",
            type: "reporting",
          },
          status: "succeeded",
          title: "Draft board packet for acme from cash posture reporting",
          type: "reporting",
          updatedAt: "2026-04-19T12:03:00.000Z",
        }}
        proofBundle={{
          artifactIds: ["44444444-4444-4444-8444-444444444444"],
          artifacts: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              kind: "board_packet",
            },
          ],
          branchName: null,
          changeSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          companyKey: "acme",
          decisionTrace: [
            "Scout task 0 terminalized as succeeded with persisted board-packet evidence.",
          ],
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["board_packet"],
            presentArtifactKinds: ["board_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          latestApproval: null,
          missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          missionTitle:
            "Draft board packet for acme from cash posture reporting",
          objective:
            "Compile one draft board packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          answerSummary: "",
          reportKind: "board_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          circulationReadiness: {
            circulationApprovalStatus: "approved_for_circulation",
            circulationReady: true,
            approvalId: "77777777-7777-4777-8777-777777777777",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T10:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T10:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Ready for internal board circulation.",
            summary:
              "Circulation approval was granted by finance-reviewer; the stored board packet is approved for internal circulation, but no circulation has been logged.",
          },
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          policySourceId: null,
          policySourceScope: null,
          questionKind: "cash_posture",
          replayEventCount: 9,
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          riskSummary:
            "This board packet remains draft-only, approval-backed for internal circulation only when explicitly granted, and still records no actual circulation, PDF export, slide export, or runtime drafting in F5C4E.",
          rollbackSummary:
            "Safe fallback: resolve or revisit the circulation approval truthfully, then refresh or rerun the source finance-memo reporting mission before recompiling; no actual circulation side effect was produced.",
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-19T12:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-19T12:03:00.000Z",
          },
          validationSummary:
            "Draft board packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
          verificationSummary:
            "Draft board packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
        }}
        reporting={{
          reportKind: "board_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft board packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          appendixPresent: true,
          lenderUpdate: null,
          financeMemo: null,
          evidenceAppendix: null,
          boardPacket: {
            source: "stored_reporting_evidence",
            summary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            reportKind: "board_packet",
            draftStatus: "draft_only",
            sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Board Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
          diligencePacket: null,
          circulationReadiness: {
            circulationApprovalStatus: "approved_for_circulation",
            circulationReady: true,
            approvalId: "77777777-7777-4777-8777-777777777777",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T10:00:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T10:05:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Ready for internal board circulation.",
            summary:
              "Circulation approval was granted by finance-reviewer; the stored board packet is approved for internal circulation, but no circulation has been logged.",
          },
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-19T12:00:00.000Z",
            dependsOnTaskId: null,
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Draft board packet for acme from the completed cash posture reporting mission.",
            updatedAt: "2026-04-19T12:03:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Board packet");
    expect(html).toContain("Source reporting mission");
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Linked appendix posture");
    expect(html).toContain("approved_for_circulation");
    expect(html).toContain("Circulation ready");
    expect(html).toContain("finance-reviewer");
    expect(html).toContain(
      "The proof bundle now reads like a draft board-packet review package",
    );
    expect(html).toContain(
      "records no actual circulation, PDF export, slide export, or runtime drafting in F5C4E",
    );
  });

  it("renders diligence-packet mission detail with source-report lineage and draft-only proof posture", () => {
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
          createdAt: "2026-04-19T13:00:00.000Z",
          createdBy: "finance-operator",
          id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          objective:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          primaryRepo: null,
          sourceKind: "manual_reporting",
          sourceRef: null,
          spec: {
            acceptance: ["persist one draft diligence_packet artifact"],
            constraints: {
              allowedPaths: [],
              mustNot: [
                "do not invoke the codex runtime",
                "do not add approval workflow, release workflow, filing, export, PDF export, or slide export",
              ],
            },
            deliverables: ["diligence_packet", "proof_bundle"],
            evidenceRequirements: [
              "stored finance_memo artifact",
              "stored evidence_appendix artifact",
            ],
            input: {
              reportingRequest: {
                companyKey: "acme",
                policySourceId: null,
                policySourceScope: null,
                questionKind: "cash_posture",
                reportKind: "diligence_packet",
                sourceDiscoveryMissionId:
                  "22222222-2222-4222-8222-222222222222",
                sourceReportingMissionId:
                  "33333333-3333-4333-8333-333333333333",
              },
            },
            objective:
              "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title:
              "Draft diligence packet for acme from cash posture reporting",
            type: "reporting",
          },
          status: "succeeded",
          title: "Draft diligence packet for acme from cash posture reporting",
          type: "reporting",
          updatedAt: "2026-04-19T13:03:00.000Z",
        }}
        proofBundle={{
          artifactIds: ["44444444-4444-4444-8444-444444444444"],
          artifacts: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              kind: "diligence_packet",
            },
          ],
          branchName: null,
          changeSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          companyKey: "acme",
          decisionTrace: [
            "Scout task 0 terminalized as succeeded with persisted diligence-packet evidence.",
          ],
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["diligence_packet"],
            presentArtifactKinds: ["diligence_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          latestApproval: null,
          missionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          missionTitle:
            "Draft diligence packet for acme from cash posture reporting",
          objective:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          answerSummary: "",
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          policySourceId: null,
          policySourceScope: null,
          questionKind: "cash_posture",
          replayEventCount: 9,
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          riskSummary:
            "This diligence packet is draft-only, carries source-report freshness and limitations forward, and does not add approval, release, PDF, or slide workflow in F5C3.",
          rollbackSummary:
            "Safe fallback: refresh or rerun the source finance-memo reporting mission truthfully, then retry draft diligence-packet compilation; no release, send, or wiki filing side effect was produced.",
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-19T13:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: null,
            latestArtifactAt: "2026-04-19T13:03:00.000Z",
          },
          validationSummary:
            "Draft diligence packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
          verificationSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
        }}
        reporting={{
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Diligence Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: null,
          publication: null,
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-19T13:00:00.000Z",
            dependsOnTaskId: null,
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            missionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            updatedAt: "2026-04-19T13:03:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Diligence packet");
    expect(html).toContain("Source reporting mission");
    expect(html).toContain("33333333-3333-4333-8333-333333333333");
    expect(html).toContain("Linked appendix posture");
    expect(html).toContain(
      "The proof bundle now reads like a draft diligence-packet review package",
    );
    expect(html).toContain(
      "does not add approval, release, PDF, or slide workflow in F5C3",
    );
  });

  it("renders diligence-packet mission detail with approved release-readiness posture", () => {
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
          createdAt: "2026-04-21T13:00:00.000Z",
          createdBy: "finance-operator",
          id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
          objective:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          primaryRepo: null,
          sourceKind: "manual_reporting",
          sourceRef: null,
          spec: {
            acceptance: ["persist one draft diligence_packet artifact"],
            constraints: {
              allowedPaths: [],
              mustNot: [
                "do not invoke the codex runtime",
                "do not add release logging, filing, export, PDF export, or slide export",
              ],
            },
            deliverables: ["diligence_packet", "proof_bundle"],
            evidenceRequirements: [
              "stored finance_memo artifact",
              "stored evidence_appendix artifact",
            ],
            input: {
              reportingRequest: {
                companyKey: "acme",
                policySourceId: null,
                policySourceScope: null,
                questionKind: "cash_posture",
                reportKind: "diligence_packet",
                sourceDiscoveryMissionId:
                  "22222222-2222-4222-8222-222222222222",
                sourceReportingMissionId:
                  "33333333-3333-4333-8333-333333333333",
              },
            },
            objective:
              "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
            repos: [],
            riskBudget: {
              allowNetwork: false,
              maxCostUsd: 1,
              maxWallClockMinutes: 5,
              requiresHumanApprovalFor: [],
              sandboxMode: "read-only",
            },
            title:
              "Draft diligence packet for acme from cash posture reporting",
            type: "reporting",
          },
          status: "succeeded",
          title: "Draft diligence packet for acme from cash posture reporting",
          type: "reporting",
          updatedAt: "2026-04-21T13:05:00.000Z",
        }}
        proofBundle={{
          artifactIds: ["44444444-4444-4444-8444-444444444444"],
          artifacts: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              kind: "diligence_packet",
            },
          ],
          branchName: null,
          changeSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          companyKey: "acme",
          decisionTrace: [
            "Scout task 0 terminalized as succeeded with persisted diligence-packet evidence.",
            "Latest diligence packet release approval is approved_for_release.",
          ],
          evidenceCompleteness: {
            status: "complete",
            expectedArtifactKinds: ["diligence_packet"],
            presentArtifactKinds: ["diligence_packet"],
            missingArtifactKinds: [],
            notes: [],
          },
          latestApproval: null,
          missionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
          missionTitle:
            "Draft diligence packet for acme from cash posture reporting",
          objective:
            "Compile one draft diligence packet from completed reporting mission and its stored finance memo plus evidence appendix only.",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          answerSummary: "",
          reportKind: "diligence_packet",
          reportDraftStatus: "draft_only",
          reportPublication: null,
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "55555555-5555-4555-8555-555555555555",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T13:01:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T13:04:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          appendixPresent: true,
          freshnessState: "stale",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
          pullRequestNumber: null,
          pullRequestUrl: null,
          policySourceId: null,
          policySourceScope: null,
          questionKind: "cash_posture",
          replayEventCount: 10,
          relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
          relatedWikiPageKeys: ["metrics/cash-posture"],
          riskSummary:
            "This diligence packet is approved for release from a persisted review path, but actual delivery, board circulation, PDF, and slide workflows remain out of scope in F5C4D, and release logging stays explicit and separate.",
          rollbackSummary:
            "No actual release side effect was produced; this slice only records approved-for-release posture.",
          status: "ready",
          targetRepoFullName: null,
          timestamps: {
            missionCreatedAt: "2026-04-21T13:00:00.000Z",
            latestPlannerEvidenceAt: null,
            latestExecutorEvidenceAt: null,
            latestPullRequestAt: null,
            latestApprovalAt: "2026-04-21T13:04:00.000Z",
            latestArtifactAt: "2026-04-21T13:03:00.000Z",
          },
          validationSummary:
            "Draft diligence packet was compiled deterministically from one completed reporting mission and its stored finance memo plus evidence appendix without running the Codex runtime.",
          verificationSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission. Review the source reporting lineage, linked evidence appendix posture, carried-forward freshness, and visible limitations before sharing this draft.",
        }}
        reporting={{
          reportKind: "diligence_packet",
          draftStatus: "draft_only",
          sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
          sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
          companyKey: "acme",
          questionKind: "cash_posture",
          policySourceId: null,
          policySourceScope: null,
          reportSummary:
            "Draft diligence packet for acme from the completed cash posture reporting mission.",
          freshnessSummary: "Cash posture remains stale.",
          limitationsSummary: "Draft-only posture remains explicit.",
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
            sourceReportingMissionId: "33333333-3333-4333-8333-333333333333",
            sourceDiscoveryMissionId: "22222222-2222-4222-8222-222222222222",
            companyKey: "acme",
            questionKind: "cash_posture",
            policySourceId: null,
            policySourceScope: null,
            packetSummary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            freshnessSummary: "Cash posture remains stale.",
            limitationsSummary: "Draft-only posture remains explicit.",
            relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
            relatedWikiPageKeys: ["metrics/cash-posture"],
            sourceFinanceMemo: {
              artifactId: "55555555-5555-4555-8555-555555555555",
              kind: "finance_memo",
            },
            sourceEvidenceAppendix: {
              artifactId: "66666666-6666-4666-8666-666666666666",
              kind: "evidence_appendix",
            },
            bodyMarkdown:
              "# Draft Diligence Packet\n\n## Draft Review Posture\n\n- Status: draft_only",
          },
          circulationReadiness: null,
          releaseRecord: null,
          releaseReadiness: {
            releaseApprovalStatus: "approved_for_release",
            releaseReady: true,
            approvalId: "55555555-5555-4555-8555-555555555555",
            approvalStatus: "approved",
            requestedAt: "2026-04-21T13:01:00.000Z",
            requestedBy: "finance-operator",
            resolvedAt: "2026-04-21T13:04:00.000Z",
            resolvedBy: "finance-reviewer",
            rationale: "Looks release-ready.",
            summary:
              "Release approval was granted by finance-reviewer; the stored diligence packet is approved for release, but no delivery has been recorded.",
          },
          publication: null,
        }}
        tasks={[
          {
            attemptCount: 1,
            codexThreadId: null,
            codexTurnId: null,
            createdAt: "2026-04-21T13:00:00.000Z",
            dependsOnTaskId: null,
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            missionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            role: "scout",
            sequence: 0,
            status: "succeeded",
            summary:
              "Draft diligence packet for acme from the completed cash posture reporting mission.",
            updatedAt: "2026-04-21T13:03:00.000Z",
            workspaceId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("approved_for_release");
    expect(html).toContain("Release ready");
    expect(html).toContain("no delivery has been recorded");
    expect(html).toContain("Release logged");
    expect(html).toContain("Not logged yet.");
  });
});
