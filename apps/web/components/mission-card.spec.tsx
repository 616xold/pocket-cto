import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MissionCard } from "./mission-card";

describe("MissionCard", () => {
  it("renders approval and artifact sections without the stale mission-spine placeholder copy", () => {
    const html = renderToStaticMarkup(
      <MissionCard
        approvals={[
          {
            createdAt: "2026-03-14T10:01:00.000Z",
            id: "22222222-2222-4222-8222-222222222222",
            kind: "file_change",
            rationale: null,
            requestedBy: "system",
            resolvedBy: null,
            status: "pending",
            updatedAt: "2026-03-14T10:01:00.000Z",
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
          artifactIds: [
            "66666666-6666-4666-8666-666666666666",
            "77777777-7777-4777-8777-777777777777",
          ],
          changeSummary: "Updated the mission detail read model for approvals and artifacts.",
          decisionTrace: [
            "Executor task 1 produced diff_summary artifact 77777777-7777-4777-8777-777777777777.",
          ],
          missionId: "11111111-1111-4111-8111-111111111111",
          objective: "Ship passkeys without breaking email login.",
          replayEventCount: 14,
          riskSummary: "Action controls still require embedded-worker mode.",
          rollbackSummary: "Disable the action panel and fall back to the API route surface.",
          status: "ready",
          verificationSummary: "API parsing and render tests cover the new view.",
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
    expect(html).toContain("Proof bundle ready with 3 linked artifacts.");
    expect(html).not.toContain(
      "No approval trace yet. This is expected during the mission-spine milestone.",
    );
  });
});
