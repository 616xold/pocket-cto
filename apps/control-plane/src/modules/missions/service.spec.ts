import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
  type ApprovalRecord,
  type CfoWikiCompanySourceListView,
} from "@pocket-cto/domain";
import { InMemoryMissionRepository } from "./repository";
import { StubMissionCompiler } from "./compiler";
import { InMemoryReplayRepository } from "../replay/repository";
import { ReplayService } from "../replay/service";
import { EvidenceService } from "../evidence/service";
import { MissionService } from "./service";

function createService(options?: {
  companySources?: CfoWikiCompanySourceListView;
  listMissionApprovals?: (missionId: string) => Promise<ApprovalRecord[]>;
}) {
  const repository = new InMemoryMissionRepository();
  const replayRepository = new InMemoryReplayRepository();
  const replayService = new ReplayService(replayRepository, repository);
  const evidenceService = new EvidenceService();
  const compiler = new StubMissionCompiler();

  return {
    replayService,
    repository,
    service: new MissionService(
      compiler,
      repository,
      replayService,
      evidenceService,
      {
        approvalReader: {
          async listMissionApprovals(missionId) {
            return (await options?.listMissionApprovals?.(missionId)) ?? [];
          },
        },
        cfoWikiService: {
          async listCompanySources() {
            return (
              options?.companySources ?? {
                companyId: "11111111-1111-4111-8111-111111111111",
                companyKey: "acme",
                companyDisplayName: "Acme",
                sourceCount: 0,
                sources: [],
                limitations: [],
              }
            );
          },
        },
      },
    ),
  };
}

describe("MissionService", () => {
  it("creates a mission, tasks, and replay events from text", async () => {
    const { service, replayService } = createService();

    const created = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    expect(created.mission.title).toContain("Implement passkeys");
    expect(created.mission.status).toBe("queued");
    expect(created.tasks.length).toBe(2);
    expect(created.proofBundle.status).toBe("placeholder");

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(events[3]?.payload).toEqual({
      from: "planned",
      to: "queued",
      reason: "tasks_materialized",
    });
  });

  it("overrides the stub repo target when text intake specifies a primary repo", async () => {
    const { service } = createService();

    const created = await service.createFromText({
      primaryRepo: "acme/web",
      requestedBy: "operator",
      sourceKind: "manual_text",
      text: "Implement passkeys for sign-in",
    });

    expect(created.mission.primaryRepo).toBe("acme/web");
    expect(created.mission.spec.repos).toEqual(["acme/web"]);
  });

  it("creates a GitHub issue mission with truthful source and repo overrides", async () => {
    const { service } = createService();

    const created = await service.createFromGitHubIssue({
      issueTitle: "Ship issue intake",
      issueBody: "Turn the stored issue envelope into a build mission.",
      primaryRepo: "acme/web",
      requestedBy: "octo-operator",
      sourceRef: "https://github.com/acme/web/issues/42",
    });

    expect(created.mission.sourceKind).toBe("github_issue");
    expect(created.mission.sourceRef).toBe(
      "https://github.com/acme/web/issues/42",
    );
    expect(created.mission.primaryRepo).toBe("acme/web");
    expect(created.mission.spec.repos).toEqual(["acme/web"]);
    expect(created.mission.title).toBe("Ship issue intake");
    expect(created.mission.objective).toContain(
      "Turn the stored issue envelope into a build mission.",
    );
  });

  it("creates typed finance analysis missions for every supported family", async () => {
    const { replayService, service } = createService();

    for (const questionKind of FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS) {
      const created = await service.createDiscovery({
        companyKey: "acme",
        questionKind,
        operatorPrompt: `Review ${questionKind} from stored state.`,
        requestedBy: "operator",
      });

      expect(created.mission.type).toBe("discovery");
      expect(created.mission.sourceKind).toBe("manual_discovery");
      expect(created.mission.primaryRepo).toBeNull();
      expect(created.mission.spec.repos).toEqual([]);
      expect(created.mission.spec.constraints.allowedPaths).toEqual([]);
      expect(created.mission.spec.input?.discoveryQuestion).toEqual({
        companyKey: "acme",
        questionKind,
        operatorPrompt: `Review ${questionKind} from stored state.`,
      });
      expect(created.tasks).toMatchObject([
        {
          role: "scout",
          sequence: 0,
          status: "pending",
        },
      ]);
      expect(
        created.proofBundle.evidenceCompleteness.expectedArtifactKinds,
      ).toEqual(["discovery_answer"]);
      expect(created.proofBundle.companyKey).toBe("acme");
      expect(created.proofBundle.questionKind).toBe(questionKind);

      const events = await replayService.listByMissionId(created.mission.id);
      expect(events.slice(-4).map((event) => event.type)).toEqual([
        "mission.created",
        "task.created",
        "mission.status_changed",
        "artifact.created",
      ]);
    }
  });

  it("creates scoped policy lookup missions only for explicitly bound policy_document sources", async () => {
    const policySourceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const { replayService, service } = createService({
      companySources: {
        companyId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        companyDisplayName: "Acme",
        sourceCount: 1,
        sources: [
          {
            binding: {
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              companyId: "11111111-1111-4111-8111-111111111111",
              sourceId: policySourceId,
              includeInCompile: true,
              documentRole: "policy_document",
              boundBy: "finance-operator",
              createdAt: "2026-04-15T00:00:00.000Z",
              updatedAt: "2026-04-15T00:00:00.000Z",
            },
            source: {
              id: policySourceId,
              kind: "document",
              name: "Travel policy",
              description: null,
              originKind: "manual",
              createdBy: "finance-operator",
              createdAt: "2026-04-15T00:00:00.000Z",
              updatedAt: "2026-04-15T00:00:00.000Z",
            },
            latestSnapshot: null,
            latestSourceFile: null,
            latestExtract: null,
            limitations: [],
          },
        ],
        limitations: [],
      },
    });

    const created = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId,
      operatorPrompt: "Review the scoped travel policy from stored state.",
      requestedBy: "operator",
    });

    expect(created.mission.title).toContain(policySourceId);
    expect(created.mission.spec.input?.discoveryQuestion).toEqual({
      companyKey: "acme",
      questionKind: "policy_lookup",
      policySourceId,
      operatorPrompt: "Review the scoped travel policy from stored state.",
    });
    expect(created.proofBundle.policySourceId).toBe(policySourceId);

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.slice(-4).map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
  });

  it("rejects policy lookup missions when the source is unknown or not policy_document", async () => {
    const nonPolicySourceId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const { service } = createService({
      companySources: {
        companyId: "11111111-1111-4111-8111-111111111111",
        companyKey: "acme",
        companyDisplayName: "Acme",
        sourceCount: 1,
        sources: [
          {
            binding: {
              id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
              companyId: "11111111-1111-4111-8111-111111111111",
              sourceId: nonPolicySourceId,
              includeInCompile: true,
              documentRole: "general_document",
              boundBy: "finance-operator",
              createdAt: "2026-04-15T00:00:00.000Z",
              updatedAt: "2026-04-15T00:00:00.000Z",
            },
            source: {
              id: nonPolicySourceId,
              kind: "document",
              name: "Operating memo",
              description: null,
              originKind: "manual",
              createdBy: "finance-operator",
              createdAt: "2026-04-15T00:00:00.000Z",
              updatedAt: "2026-04-15T00:00:00.000Z",
            },
            latestSnapshot: null,
            latestSourceFile: null,
            latestExtract: null,
            limitations: [],
          },
        ],
        limitations: [],
      },
    });

    await expect(
      service.createDiscovery({
        companyKey: "acme",
        questionKind: "policy_lookup",
        policySourceId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        requestedBy: "operator",
      }),
    ).rejects.toMatchObject({
      body: {
        error: {
          details: [
            {
              message:
                "Policy source eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee is not bound for company acme.",
              path: "policySourceId",
            },
          ],
        },
      },
      message: "Invalid request",
      statusCode: 400,
    });

    await expect(
      service.createDiscovery({
        companyKey: "acme",
        questionKind: "policy_lookup",
        policySourceId: nonPolicySourceId,
        requestedBy: "operator",
      }),
    ).rejects.toMatchObject({
      body: {
        error: {
          details: [
            {
              message: `Policy source ${nonPolicySourceId} is bound for company acme, but not as a \`policy_document\`.`,
              path: "policySourceId",
            },
          ],
        },
      },
      message: "Invalid request",
      statusCode: 400,
    });
  });

  it("returns summary-shaped approvals, approval cards, and artifacts in mission detail", async () => {
    const approval: ApprovalRecord = {
      createdAt: "2026-03-14T10:00:00.000Z",
      id: "44444444-4444-4444-8444-444444444444",
      kind: "file_change",
      missionId: "11111111-1111-4111-8111-111111111111",
      payload: {
        requestId: "approval_file_change_1",
      },
      rationale: null,
      requestedBy: "system",
      resolvedBy: null,
      status: "pending",
      taskId: "33333333-3333-4333-8333-333333333333",
      updatedAt: "2026-03-14T10:00:00.000Z",
    };
    const { repository, service } = createService({
      async listMissionApprovals() {
        return [approval];
      },
    });
    const created = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const executorTask = created.tasks.find((task) => task.role === "executor");

    expect(executorTask).toBeDefined();

    await repository.saveArtifact({
      kind: "diff_summary",
      metadata: {
        summary: "Workspace changes touched README.md and apps/web/lib/api.ts.",
      },
      missionId: created.mission.id,
      mimeType: "text/markdown",
      taskId: executorTask?.id,
      uri: `pocket-cto://missions/${created.mission.id}/tasks/${executorTask?.id}/diff-summary`,
    });

    const detail = await service.getMissionDetail(created.mission.id);

    expect(detail.approvals).toEqual([
      {
        createdAt: "2026-03-14T10:00:00.000Z",
        id: "44444444-4444-4444-8444-444444444444",
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:00:00.000Z",
      },
    ]);
    expect(detail.approvalCards).toEqual([
      {
        actionHint:
          "Review the requested file-edit scope, then approve only if this task should change those files.",
        approvalId: "44444444-4444-4444-8444-444444444444",
        kind: "file_change",
        requestedAt: "2026-03-14T10:00:00.000Z",
        requestedBy: "system",
        repoContext: {
          repoLabel: created.mission.primaryRepo ?? "repo context pending",
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
        task: null,
        title: "Approve workspace file changes",
      },
    ]);
    expect(detail.artifacts.map((artifact) => artifact.kind).sort()).toEqual([
      "diff_summary",
      "proof_bundle_manifest",
    ]);
    expect(
      detail.artifacts.find((artifact) => artifact.kind === "diff_summary")
        ?.summary,
    ).toContain("README.md");
  });

  it("lists newest-first mission summaries and applies status, source-kind, and limit filters", async () => {
    const approvalsByMissionId = new Map<string, ApprovalRecord[]>();
    const { repository, service } = createService({
      async listMissionApprovals(missionId) {
        return approvalsByMissionId.get(missionId) ?? [];
      },
    });

    const first = await service.createFromText({
      text: "Ship the first mission",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });
    const second = await service.createFromText({
      text: "Sync the GitHub issue mission",
      sourceKind: "github_issue",
      requestedBy: "operator",
      sourceRef: "https://github.com/acme/web/issues/19",
    });

    const firstExecutorTask = first.tasks.find((task) => task.role === "executor");

    expect(firstExecutorTask).toBeDefined();

    await repository.updateMissionStatus(first.mission.id, "succeeded");
    await repository.updateTaskStatus(firstExecutorTask?.id ?? "", "succeeded");

    const firstBundle = await repository.getProofBundleByMissionId(first.mission.id);
    expect(firstBundle).not.toBeNull();

    await repository.upsertProofBundle({
      ...firstBundle!,
      pullRequestNumber: 19,
      pullRequestUrl: "https://github.com/acme/web/pull/19",
      status: "ready",
      timestamps: {
        ...firstBundle!.timestamps,
        latestPullRequestAt: "2026-03-16T01:03:00.000Z",
      },
    });

    approvalsByMissionId.set(first.mission.id, [
      {
        createdAt: "2026-03-16T01:02:00.000Z",
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        kind: "command",
        missionId: first.mission.id,
        payload: {},
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        taskId: firstExecutorTask?.id ?? null,
        updatedAt: "2026-03-16T01:02:00.000Z",
      },
    ]);

    const unfiltered = await service.listMissions();

    expect(unfiltered.filters).toEqual({
      limit: 20,
      sourceKind: null,
      status: null,
    });
    expect(unfiltered.missions.map((mission) => mission.id)).toEqual([
      second.mission.id,
      first.mission.id,
    ]);
    expect(unfiltered.missions[0]).toMatchObject({
      id: second.mission.id,
      latestTask: {
        role: "executor",
        sequence: 1,
        status: "pending",
      },
      proofBundleStatus: "placeholder",
      sourceKind: "github_issue",
    });
    expect(unfiltered.missions[1]).toMatchObject({
      id: first.mission.id,
      latestTask: {
        role: "executor",
        sequence: 1,
        status: "succeeded",
      },
      pendingApprovalCount: 1,
      proofBundleStatus: "ready",
      pullRequestNumber: 19,
      pullRequestUrl: "https://github.com/acme/web/pull/19",
      sourceKind: "manual_text",
      status: "succeeded",
    });

    const filteredBySourceKind = await service.listMissions({
      sourceKind: "github_issue",
    });

    expect(filteredBySourceKind.missions.map((mission) => mission.id)).toEqual([
      second.mission.id,
    ]);

    const filteredByStatus = await service.listMissions({
      limit: 1,
      status: "succeeded",
    });

    expect(filteredByStatus.filters).toEqual({
      limit: 1,
      sourceKind: null,
      status: "succeeded",
    });
    expect(filteredByStatus.missions.map((mission) => mission.id)).toEqual([
      first.mission.id,
    ]);
  });
});
