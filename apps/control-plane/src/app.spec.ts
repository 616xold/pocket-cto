import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { ProofBundleManifest } from "@pocket-cto/domain";
import { buildApp } from "./app";
import { createInMemoryContainer } from "./bootstrap";
import type { AppContainer } from "./lib/types";
import { ApprovalNotFoundError, ApprovalNotPendingError } from "./modules/approvals/errors";
import {
  GitHubInstallationNotFoundError,
  GitHubIssueIntakeNonIssueDeliveryError,
  GitHubRepositoryNotFoundError,
} from "./modules/github-app/errors";
import { RuntimeActiveTurnNotFoundError } from "./modules/runtime-codex/errors";

const unknownMissionId = "11111111-1111-4111-8111-111111111111";
const unknownApprovalId = "22222222-2222-4222-8222-222222222222";
const unknownTaskId = "33333333-3333-4333-8333-333333333333";

describe("control-plane app", () => {
  const apps: FastifyInstance[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("POST /missions/text returns 201 with mission, tasks, and a proof bundle placeholder", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/text",
      payload: {
        primaryRepo: "acme/web",
        text: "Implement passkeys for sign-in",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      mission: {
        type: "build",
        status: "queued",
        title: "Implement passkeys for sign-in",
        objective: "Implement passkeys for sign-in",
        sourceKind: "manual_text",
        createdBy: "operator",
        primaryRepo: "acme/web",
        spec: {
          repos: ["acme/web"],
        },
      },
      tasks: [
        { role: "planner", sequence: 0, status: "pending" },
        {
          role: "executor",
          sequence: 1,
          status: "pending",
        },
      ],
      proofBundle: {
        status: "placeholder",
        objective: "Implement passkeys for sign-in",
        changeSummary: "",
        verificationSummary: "",
        riskSummary: "",
        rollbackSummary: "",
        decisionTrace: [],
        artifactIds: [],
        replayEventCount: 0,
      },
    });
  });

  it("POST /missions/text returns 400 for an invalid body", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/text",
      payload: {
        text: "",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "text",
            message: "String must contain at least 1 character(s)",
          },
        ],
      },
    });
  });

  it("POST /missions/discovery returns 201 with one scout task and a discovery proof placeholder", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/missions/discovery",
      payload: {
        repoFullName: "616xold/pocket-cto",
        questionKind: "auth_change",
        changedPaths: ["apps/control-plane/src/modules/github-app/auth.ts"],
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      mission: {
        type: "discovery",
        status: "queued",
        title: "Assess auth-change blast radius for 616xold/pocket-cto",
        sourceKind: "manual_discovery",
        createdBy: "operator",
        primaryRepo: "616xold/pocket-cto",
        spec: {
          repos: ["616xold/pocket-cto"],
          constraints: {
            allowedPaths: [
              "apps/control-plane/src/modules/github-app/auth.ts",
            ],
          },
          input: {
            discoveryQuestion: {
              repoFullName: "616xold/pocket-cto",
              questionKind: "auth_change",
              changedPaths: [
                "apps/control-plane/src/modules/github-app/auth.ts",
              ],
            },
          },
        },
      },
      tasks: [{ role: "scout", sequence: 0, status: "pending" }],
      proofBundle: {
        status: "placeholder",
        objective:
          "Answer the stored auth-change blast radius for 616xold/pocket-cto across: apps/control-plane/src/modules/github-app/auth.ts.",
        evidenceCompleteness: {
          expectedArtifactKinds: ["discovery_answer"],
          missingArtifactKinds: ["discovery_answer"],
        },
      },
    });
  });

  it("GET /missions returns newest-first mission summaries with the list contract", async () => {
    const app = await createTestApp(apps);
    const older = await createMission(app, {
      text: "First mission summary",
      requestedBy: "operator",
    });
    const newer = await createMission(app, {
      requestedBy: "operator",
      sourceKind: "github_issue",
      sourceRef: "https://github.com/acme/web/issues/19",
      text: "Second mission summary",
    });

    const response = await app.inject({
      method: "GET",
      url: "/missions",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      filters: {
        limit: 20,
        sourceKind: null,
        status: null,
      },
      missions: [
        {
          id: newer.mission.id,
          latestTask: {
            role: "executor",
            sequence: 1,
            status: "pending",
          },
          objectiveExcerpt: "Second mission summary",
          pendingApprovalCount: 0,
          proofBundleStatus: "placeholder",
          sourceKind: "github_issue",
          sourceRef: "https://github.com/acme/web/issues/19",
          status: "queued",
          title: "Second mission summary",
        },
        {
          id: older.mission.id,
          latestTask: {
            role: "executor",
            sequence: 1,
            status: "pending",
          },
          objectiveExcerpt: "First mission summary",
          pendingApprovalCount: 0,
          proofBundleStatus: "placeholder",
          sourceKind: "manual_text",
          sourceRef: null,
          status: "queued",
          title: "First mission summary",
        },
      ],
    });
  });

  it("GET /missions/:missionId returns mission metadata, approvals, artifacts, and the proof bundle placeholder", async () => {
    const app = await createTestApp(apps);
    const created = await createMission(app);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${created.mission.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      mission: {
        id: created.mission.id,
        status: "queued",
        title: "Implement passkeys for sign-in",
      },
      tasks: [
        { sequence: 0, role: "planner" },
        { sequence: 1, role: "executor" },
      ],
      proofBundle: {
        missionId: created.mission.id,
        status: "placeholder",
      },
      approvals: [],
      approvalCards: [],
      artifacts: [
        {
          kind: "proof_bundle_manifest",
        },
      ],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });
  });

  it("GET /missions/:missionId returns summary-shaped approvals and artifacts in the mission detail read model", async () => {
    const app = await createStubApp(apps, {
      missionService: {
        async createDiscovery() {
          throw new Error("create should not be called");
        },
        async createFromText() {
          throw new Error("create should not be called");
        },
        async getMissionDetail() {
          return {
            mission: {
              createdAt: "2026-03-14T10:00:00.000Z",
              createdBy: "operator",
              id: unknownMissionId,
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
            },
            tasks: [
              {
                attemptCount: 1,
                codexThreadId: "thread_live_1",
                codexTurnId: "turn_live_1",
                createdAt: "2026-03-14T10:00:00.000Z",
                dependsOnTaskId: null,
                id: unknownTaskId,
                missionId: unknownMissionId,
                role: "executor",
                sequence: 1,
                status: "running",
                summary: "Applying runtime diff summary placeholders",
                updatedAt: "2026-03-14T10:05:00.000Z",
                workspaceId: null,
              },
            ],
            proofBundle: {
              ...buildProofBundleFixture({
                artifactIds: ["77777777-7777-4777-8777-777777777777"],
                artifacts: [
                  {
                    id: "77777777-7777-4777-8777-777777777777",
                    kind: "diff_summary",
                  },
                ],
                changeSummary:
                  "Updated the mission detail read model for approvals and artifacts.",
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
                  id: "44444444-4444-4444-8444-444444444444",
                  kind: "file_change",
                  rationale: null,
                  requestedBy: "system",
                  resolvedBy: null,
                  status: "pending",
                  updatedAt: "2026-03-14T10:01:00.000Z",
                },
                replayEventCount: 12,
                riskSummary: "Action controls still require embedded-worker mode.",
                status: "incomplete",
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
              }),
            },
            approvals: [
              {
                createdAt: "2026-03-14T10:01:00.000Z",
                id: "44444444-4444-4444-8444-444444444444",
                kind: "file_change",
                rationale: null,
                requestedBy: "system",
                resolvedBy: null,
                status: "pending",
                updatedAt: "2026-03-14T10:01:00.000Z",
              },
            ],
            approvalCards: [
              {
                actionHint:
                  "Review the requested file-edit scope, then approve only if this task should change those files.",
                approvalId: "44444444-4444-4444-8444-444444444444",
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
                  id: unknownTaskId,
                  label: "Task 1 · executor",
                  role: "executor",
                  sequence: 1,
                },
                title: "Approve workspace file changes",
              },
            ],
            artifacts: [
              {
                createdAt: "2026-03-14T10:00:00.000Z",
                id: "66666666-6666-4666-8666-666666666666",
                kind: "proof_bundle_manifest",
                summary: "Proof bundle ready with 2 linked artifacts.",
                taskId: null,
                uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/proof-bundle-manifest",
              },
              {
                createdAt: "2026-03-14T10:04:00.000Z",
                id: "77777777-7777-4777-8777-777777777777",
                kind: "diff_summary",
                summary: "Workspace changes touched apps/web and apps/control-plane.",
                taskId: unknownTaskId,
                uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/diff-summary",
              },
            ],
            discoveryAnswer: null,
            liveControl: {
              enabled: false,
              limitation: "single_process_only",
              mode: "api_only",
            },
          };
        },
      },
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      mission: {
        createdAt: "2026-03-14T10:00:00.000Z",
        createdBy: "operator",
        id: unknownMissionId,
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
      },
      tasks: [
        {
          attemptCount: 1,
          codexThreadId: "thread_live_1",
          codexTurnId: "turn_live_1",
          createdAt: "2026-03-14T10:00:00.000Z",
          dependsOnTaskId: null,
          id: unknownTaskId,
          missionId: unknownMissionId,
          role: "executor",
          sequence: 1,
          status: "running",
          summary: "Applying runtime diff summary placeholders",
          updatedAt: "2026-03-14T10:05:00.000Z",
          workspaceId: null,
        },
      ],
      proofBundle: {
        ...buildProofBundleFixture({
          artifactIds: ["77777777-7777-4777-8777-777777777777"],
          artifacts: [
            {
              id: "77777777-7777-4777-8777-777777777777",
              kind: "diff_summary",
            },
          ],
          changeSummary:
            "Updated the mission detail read model for approvals and artifacts.",
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
            id: "44444444-4444-4444-8444-444444444444",
            kind: "file_change",
            rationale: null,
            requestedBy: "system",
            resolvedBy: null,
            status: "pending",
            updatedAt: "2026-03-14T10:01:00.000Z",
          },
          replayEventCount: 12,
          riskSummary: "Action controls still require embedded-worker mode.",
          status: "incomplete",
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
        }),
      },
      approvals: [
        {
          createdAt: "2026-03-14T10:01:00.000Z",
          id: "44444444-4444-4444-8444-444444444444",
          kind: "file_change",
          rationale: null,
          requestedBy: "system",
          resolvedBy: null,
          status: "pending",
          updatedAt: "2026-03-14T10:01:00.000Z",
        },
      ],
      approvalCards: [
        {
          actionHint:
            "Review the requested file-edit scope, then approve only if this task should change those files.",
          approvalId: "44444444-4444-4444-8444-444444444444",
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
            id: unknownTaskId,
            label: "Task 1 · executor",
            role: "executor",
            sequence: 1,
          },
          title: "Approve workspace file changes",
        },
      ],
      artifacts: [
        {
          createdAt: "2026-03-14T10:00:00.000Z",
          id: "66666666-6666-4666-8666-666666666666",
          kind: "proof_bundle_manifest",
          summary: "Proof bundle ready with 2 linked artifacts.",
          taskId: null,
          uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/proof-bundle-manifest",
        },
        {
          createdAt: "2026-03-14T10:04:00.000Z",
          id: "77777777-7777-4777-8777-777777777777",
          kind: "diff_summary",
          summary: "Workspace changes touched apps/web and apps/control-plane.",
          taskId: unknownTaskId,
          uri: "pocket-cto://missions/11111111-1111-4111-8111-111111111111/tasks/33333333-3333-4333-8333-333333333333/diff-summary",
        },
      ],
      discoveryAnswer: null,
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("GET /missions/:missionId returns 400 for an invalid mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/missions/not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "missionId",
            message: "Invalid uuid",
          },
        ],
      },
    });
  });

  it("GET /missions/:missionId returns 404 for an unknown mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "mission_not_found",
        message: "Mission not found",
      },
    });
  });

  it("GET /github/installations returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/github/installations",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("GET /github/installations returns persisted installation summaries when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallations() {
          return [
            {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              createdAt: "2026-03-15T10:00:00.000Z",
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
          ];
        },
        async syncInstallations() {
          throw new Error("sync should not be called");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installations: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          installationId: "12345",
          appId: "98765",
          accountLogin: "616xold",
          accountType: "Organization",
          targetType: "Organization",
          targetId: "6161234",
          suspendedAt: null,
          permissions: {
            metadata: "read",
          },
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          createdAt: "2026-03-15T10:00:00.000Z",
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("POST /github/installations/sync returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/sync",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("POST /github/installations/sync delegates to the GitHub App service when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallations() {
          return [];
        },
        async syncInstallations() {
          return {
            installations: [
              {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                installationId: "12345",
                appId: "98765",
                accountLogin: "616xold",
                accountType: "Organization",
                targetType: "Organization",
                targetId: "6161234",
                suspendedAt: null,
                permissions: {
                  metadata: "read",
                },
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                createdAt: "2026-03-15T10:00:00.000Z",
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
            syncedAt: "2026-03-15T10:00:00.000Z",
            syncedCount: 1,
          };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/sync",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installations: [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          installationId: "12345",
          appId: "98765",
          accountLogin: "616xold",
          accountType: "Organization",
          targetType: "Organization",
          targetId: "6161234",
          suspendedAt: null,
          permissions: {
            metadata: "read",
          },
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          createdAt: "2026-03-15T10:00:00.000Z",
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
      syncedAt: "2026-03-15T10:00:00.000Z",
      syncedCount: 1,
    });
  });

  it("GET /github/repositories returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("GET /github/intake/issues returns summary-shaped issue intake items", async () => {
    const app = await createStubApp(apps, {
      githubIssueIntakeService: {
        async listIssues() {
          return {
            issues: [
              {
                deliveryId: "delivery-issue-42",
                repoFullName: "acme/web",
                issueNumber: 42,
                issueTitle: "Ship issue intake",
                issueState: "open",
                senderLogin: "octo-operator",
                sourceRef: "https://github.com/acme/web/issues/42",
                receivedAt: "2026-03-16T01:55:00.000Z",
                commentCount: 2,
                hasCommentActivity: true,
                isBound: true,
                boundMissionId: unknownMissionId,
                boundMissionStatus: "queued",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/intake/issues",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      issues: [
        {
          deliveryId: "delivery-issue-42",
          repoFullName: "acme/web",
          issueNumber: 42,
          issueTitle: "Ship issue intake",
          issueState: "open",
          senderLogin: "octo-operator",
          sourceRef: "https://github.com/acme/web/issues/42",
          receivedAt: "2026-03-16T01:55:00.000Z",
          commentCount: 2,
          hasCommentActivity: true,
          isBound: true,
          boundMissionId: unknownMissionId,
          boundMissionStatus: "queued",
        },
      ],
    });
  });

  it("POST /github/intake/issues/:deliveryId/create-mission returns an explicit conflict for non-issue deliveries", async () => {
    const app = await createStubApp(apps, {
      githubIssueIntakeService: {
        async createMissionFromDelivery(deliveryId: string) {
          throw new GitHubIssueIntakeNonIssueDeliveryError(
            deliveryId,
            "issue_comment",
            "issue_comment_envelope_recorded",
          );
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/intake/issues/delivery-comment/create-mission",
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "github_issue_intake_non_issue_delivery",
        message: "GitHub delivery is not a persisted issues envelope",
      },
    });
  });

  it("GET /github/repositories returns repository summaries when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listRepositories() {
          return {
            repositories: [
              {
                id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                installationId: "12345",
                githubRepositoryId: "100",
                fullName: "616xold/pocket-cto",
                ownerLogin: "616xold",
                name: "pocket-cto",
                defaultBranch: "main",
                visibility: "private",
                archived: false,
                disabled: false,
                isActive: true,
                language: "TypeScript",
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                removedFromInstallationAt: null,
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      repositories: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          installationId: "12345",
          githubRepositoryId: "100",
          fullName: "616xold/pocket-cto",
          ownerLogin: "616xold",
          name: "pocket-cto",
          defaultBranch: "main",
          visibility: "private",
          archived: false,
          disabled: false,
          isActive: true,
          language: "TypeScript",
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("GET /github/repositories/:owner/:repo returns one repository with write readiness", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async getRepository() {
          return {
            repository: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              installationId: "12345",
              githubRepositoryId: "100",
              fullName: "616xold/pocket-cto",
              ownerLogin: "616xold",
              name: "pocket-cto",
              defaultBranch: "main",
              visibility: "private",
              archived: true,
              disabled: false,
              isActive: true,
              language: "TypeScript",
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              removedFromInstallationAt: null,
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
            writeReadiness: {
              ready: false,
              failureCode: "archived",
            },
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories/616xold/pocket-cto",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      repository: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        installationId: "12345",
        githubRepositoryId: "100",
        fullName: "616xold/pocket-cto",
        ownerLogin: "616xold",
        name: "pocket-cto",
        defaultBranch: "main",
        visibility: "private",
        archived: true,
        disabled: false,
        isActive: true,
        language: "TypeScript",
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
        removedFromInstallationAt: null,
        updatedAt: "2026-03-15T10:00:00.000Z",
      },
      writeReadiness: {
        ready: false,
        failureCode: "archived",
      },
    });
  });

  it("GET /github/repositories/:owner/:repo returns 404 for an unknown repository", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async getRepository() {
          throw new GitHubRepositoryNotFoundError("616xold/missing");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/repositories/616xold/missing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_repository_not_found",
        message: "GitHub repository not found",
      },
    });
  });

  it("GET /github/installations/:installationId/repositories returns 404 for an unknown installation", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallationRepositories() {
          throw new GitHubInstallationNotFoundError("99999");
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations/99999/repositories",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "github_installation_not_found",
        message: "GitHub installation not found",
      },
    });
  });

  it("GET /github/installations/:installationId/repositories returns installation-scoped repository summaries", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async listInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T10:00:00.000Z",
              createdAt: "2026-03-15T10:00:00.000Z",
              updatedAt: "2026-03-15T10:00:00.000Z",
            },
            repositories: [
              {
                id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                installationId: "12345",
                githubRepositoryId: "100",
                fullName: "616xold/pocket-cto",
                ownerLogin: "616xold",
                name: "pocket-cto",
                defaultBranch: "main",
                visibility: "private",
                archived: false,
                disabled: false,
                isActive: true,
                language: "TypeScript",
                lastSyncedAt: "2026-03-15T10:00:00.000Z",
                removedFromInstallationAt: null,
                updatedAt: "2026-03-15T10:00:00.000Z",
              },
            ],
          };
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/github/installations/12345/repositories",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installation: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        installationId: "12345",
        appId: "98765",
        accountLogin: "616xold",
        accountType: "Organization",
        targetType: "Organization",
        targetId: "6161234",
        suspendedAt: null,
        permissions: {
          metadata: "read",
        },
        lastSyncedAt: "2026-03-15T10:00:00.000Z",
        createdAt: "2026-03-15T10:00:00.000Z",
        updatedAt: "2026-03-15T10:00:00.000Z",
      },
      repositories: [
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          installationId: "12345",
          githubRepositoryId: "100",
          fullName: "616xold/pocket-cto",
          ownerLogin: "616xold",
          name: "pocket-cto",
          defaultBranch: "main",
          visibility: "private",
          archived: false,
          disabled: false,
          isActive: true,
          language: "TypeScript",
          lastSyncedAt: "2026-03-15T10:00:00.000Z",
          removedFromInstallationAt: null,
          updatedAt: "2026-03-15T10:00:00.000Z",
        },
      ],
    });
  });

  it("POST /github/repositories/sync returns 503 when the GitHub App is unconfigured", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: "/github/repositories/sync",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: {
        code: "github_app_not_configured",
        message: "GitHub App credentials are not configured",
        details: [
          {
            path: "GITHUB_APP_ID",
            message: "Missing required GitHub App env var",
          },
          {
            path: "GITHUB_APP_PRIVATE_KEY_BASE64",
            message: "Missing required GitHub App env var",
          },
        ],
      },
    });
  });

  it("POST /github/installations/:installationId/repositories/sync delegates to the GitHub App service when configured", async () => {
    const app = await createStubApp(apps, {
      githubAppService: {
        async syncInstallationRepositories() {
          return {
            installation: {
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              installationId: "12345",
              appId: "98765",
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
              targetId: "6161234",
              suspendedAt: null,
              permissions: {
                metadata: "read",
              },
              lastSyncedAt: "2026-03-15T09:00:00.000Z",
              createdAt: "2026-03-15T09:00:00.000Z",
              updatedAt: "2026-03-15T09:00:00.000Z",
            },
            syncedAt: "2026-03-15T10:00:00.000Z",
            syncedRepositoryCount: 1,
            activeRepositoryCount: 1,
            inactiveRepositoryCount: 0,
          };
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/github/installations/12345/repositories/sync",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      installation: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        installationId: "12345",
        appId: "98765",
        accountLogin: "616xold",
        accountType: "Organization",
        targetType: "Organization",
        targetId: "6161234",
        suspendedAt: null,
        permissions: {
          metadata: "read",
        },
        lastSyncedAt: "2026-03-15T09:00:00.000Z",
        createdAt: "2026-03-15T09:00:00.000Z",
        updatedAt: "2026-03-15T09:00:00.000Z",
      },
      syncedAt: "2026-03-15T10:00:00.000Z",
      syncedRepositoryCount: 1,
      activeRepositoryCount: 1,
      inactiveRepositoryCount: 0,
    });
  });

  it("GET /missions/:missionId/events returns ordered replay events", async () => {
    const app = await createTestApp(apps);
    const created = await createMission(app);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${created.mission.id}/events`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject([
      { sequence: 1, type: "mission.created" },
      { sequence: 2, type: "task.created" },
      { sequence: 3, type: "task.created" },
      {
        sequence: 4,
        type: "mission.status_changed",
        payload: {
          from: "planned",
          to: "queued",
          reason: "tasks_materialized",
        },
      },
      { sequence: 5, type: "artifact.created" },
    ]);
  });

  it("GET /missions/:missionId/events returns 400 for an invalid mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: "/missions/not-a-uuid/events",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: "invalid_request",
        message: "Invalid request",
        details: [
          {
            path: "missionId",
            message: "Invalid uuid",
          },
        ],
      },
    });
  });

  it("GET /missions/:missionId/events returns 404 for an unknown mission id", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}/events`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "mission_not_found",
        message: "Mission not found",
      },
    });
  });

  it("GET /missions/:missionId/approvals lists approvals and reports that API-only mode cannot control live turns", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [
              {
                createdAt: "2026-03-14T10:00:00.000Z",
                id: "44444444-4444-4444-8444-444444444444",
                kind: "file_change",
                missionId: unknownMissionId,
                payload: {
                  requestId: "approval_file_change_1",
                  requestMethod: "item/fileChange/requestApproval",
                },
                rationale: null,
                requestedBy: "system",
                resolvedBy: null,
                status: "pending",
                taskId: unknownTaskId,
                updatedAt: "2026-03-14T10:00:00.000Z",
              },
            ];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: false,
          limitation: "single_process_only",
          mode: "api_only",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/missions/${unknownMissionId}/approvals`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      approvals: [
        {
          createdAt: "2026-03-14T10:00:00.000Z",
          id: "44444444-4444-4444-8444-444444444444",
          kind: "file_change",
          missionId: unknownMissionId,
          payload: {
            requestId: "approval_file_change_1",
            requestMethod: "item/fileChange/requestApproval",
          },
          rationale: null,
          requestedBy: "system",
          resolvedBy: null,
          status: "pending",
          taskId: unknownTaskId,
          updatedAt: "2026-03-14T10:00:00.000Z",
        },
      ],
      liveControl: {
        enabled: false,
        limitation: "single_process_only",
        mode: "api_only",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 501 when live control is unavailable in this process", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(501);
    expect(response.json()).toEqual({
      error: {
        code: "live_control_unavailable",
        message:
          "Live approval and interrupt control is unavailable in this process",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve uses the embedded control surface when live control is enabled", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval(input) {
            return {
              createdAt: "2026-03-14T10:00:00.000Z",
              id: input.approvalId,
              kind: "file_change",
              missionId: unknownMissionId,
              payload: {
                resolution: {
                  decision: input.decision,
                },
              },
              rationale: input.rationale ?? null,
              requestedBy: "system",
              resolvedBy: input.resolvedBy,
              status: "approved",
              taskId: unknownTaskId,
              updatedAt: "2026-03-14T10:05:00.000Z",
            };
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        rationale: "Looks safe",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      approval: {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: unknownApprovalId,
        kind: "file_change",
        missionId: unknownMissionId,
        payload: {
          resolution: {
            decision: "accept",
          },
        },
        rationale: "Looks safe",
        requestedBy: "system",
        resolvedBy: "operator",
        status: "approved",
        taskId: unknownTaskId,
        updatedAt: "2026-03-14T10:05:00.000Z",
      },
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 404 when the approval does not exist", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new ApprovalNotFoundError(unknownApprovalId);
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "approval_not_found",
        message: "Approval not found",
      },
    });
  });

  it("POST /approvals/:approvalId/resolve returns 409 when the approval is no longer pending", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new ApprovalNotPendingError(unknownApprovalId, "approved");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new Error("interrupt should not be called");
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/approvals/${unknownApprovalId}/resolve`,
      payload: {
        decision: "accept",
        resolvedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "approval_conflict",
        message: `Approval ${unknownApprovalId} is already approved`,
      },
    });
  });

  it("POST /tasks/:taskId/interrupt returns 501 when live control is unavailable in this process", async () => {
    const app = await createTestApp(apps);

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(501);
    expect(response.json()).toEqual({
      error: {
        code: "live_control_unavailable",
        message:
          "Live approval and interrupt control is unavailable in this process",
      },
    });
  });

  it("POST /tasks/:taskId/interrupt uses the embedded control surface when live control is enabled", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn(input) {
            return {
              cancelledApprovals: [],
              taskId: input.taskId,
              threadId: "thread_fake_123",
              turnId: "turn_fake_123",
            };
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        rationale: "Stop this turn",
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      interrupt: {
        cancelledApprovals: [],
        taskId: unknownTaskId,
        threadId: "thread_fake_123",
        turnId: "turn_fake_123",
      },
      liveControl: {
        enabled: true,
        limitation: "single_process_only",
        mode: "embedded_worker",
      },
    });
  });

  it("POST /tasks/:taskId/interrupt returns 409 when the task has no active live turn", async () => {
    const app = await createStubApp(apps, {
      operatorControl: {
        approvalService: {
          async listMissionApprovals() {
            return [];
          },
          async resolveApproval() {
            throw new Error("resolve should not be called");
          },
        },
        liveControl: {
          enabled: true,
          limitation: "single_process_only",
          mode: "embedded_worker",
        },
        runtimeControlService: {
          async interruptActiveTurn() {
            throw new RuntimeActiveTurnNotFoundError(unknownTaskId);
          },
        },
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/tasks/${unknownTaskId}/interrupt`,
      payload: {
        requestedBy: "operator",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "task_conflict",
        message: `Task ${unknownTaskId} has no active live turn to interrupt`,
      },
    });
  });
});

async function createTestApp(apps: FastifyInstance[]) {
  const app = await buildApp({
    container: createInMemoryContainer(),
  });
  apps.push(app);
  return app;
}

async function createStubApp(
  apps: FastifyInstance[],
  overrides: {
    githubAppService?: Partial<AppContainer["githubAppService"]>;
    githubIssueIntakeService?: Partial<AppContainer["githubIssueIntakeService"]>;
    githubWebhookService?: Partial<AppContainer["githubWebhookService"]>;
    missionService?: Partial<AppContainer["missionService"]>;
    operatorControl?: Partial<AppContainer["operatorControl"]>;
    replayService?: Partial<AppContainer["replayService"]>;
    twinService?: Partial<AppContainer["twinService"]>;
  },
) {
  const base = createInMemoryContainer();
  const app = await buildApp({
    container: {
      ...base,
      ...overrides,
      githubAppService: {
        ...base.githubAppService,
        ...overrides.githubAppService,
      },
      githubIssueIntakeService: {
        ...base.githubIssueIntakeService,
        ...overrides.githubIssueIntakeService,
      },
      githubWebhookService:
        {
          ...base.githubWebhookService,
          ...overrides.githubWebhookService,
        },
      missionService: {
        ...base.missionService,
        ...overrides.missionService,
      },
      operatorControl: {
        ...base.operatorControl,
        ...overrides.operatorControl,
      },
      replayService: {
        ...base.replayService,
        ...overrides.replayService,
      },
      twinService: {
        ...base.twinService,
        ...overrides.twinService,
      },
    },
  });
  apps.push(app);
  return app;
}

async function createMission(
  app: FastifyInstance,
  payload?: {
    requestedBy?: string;
    sourceKind?: string;
    sourceRef?: string;
    text?: string;
  },
) {
  const response = await app.inject({
    method: "POST",
    url: "/missions/text",
    payload: {
      requestedBy: payload?.requestedBy ?? "operator",
      sourceKind: payload?.sourceKind,
      sourceRef: payload?.sourceRef,
      text: payload?.text ?? "Implement passkeys for sign-in",
    },
  });

  expect(response.statusCode).toBe(201);

  return response.json() as {
    mission: {
      id: string;
    };
  };
}

function buildProofBundleFixture(
  overrides: Partial<ProofBundleManifest> = {},
): ProofBundleManifest {
  return {
    missionId: unknownMissionId,
    missionTitle: "Implement passkeys for sign-in",
    objective: "Ship passkeys without breaking email login.",
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary: "",
    validationSummary: "",
    verificationSummary: "",
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
    evidenceCompleteness: {
      status: "missing",
      expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
      presentArtifactKinds: [],
      missingArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
      notes: [
        "Planner evidence is missing.",
        "Change-summary evidence is missing.",
        "Validation evidence is missing.",
        "GitHub pull request evidence is missing.",
      ],
      ...overrides.evidenceCompleteness,
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "2026-03-14T10:00:00.000Z",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
      ...overrides.timestamps,
    },
    status: "placeholder",
    ...overrides,
  };
}
