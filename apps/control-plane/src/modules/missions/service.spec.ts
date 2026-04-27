import { describe, expect, it } from "vitest";
import {
  FINANCE_DISCOVERY_STORED_STATE_QUESTION_KINDS,
  type ApprovalRecord,
  type CfoWikiCompanySourceListView,
  type MonitorResult,
  type ProofBundleManifest,
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
  monitorResultReader?: {
    getMonitorResultById(monitorResultId: string): Promise<unknown | null>;
  };
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
        monitorResultReader: options?.monitorResultReader,
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

  it("creates or opens one taskless monitor-alert investigation mission from a persisted alert", async () => {
    const alertResult = buildAlertMonitorResult();
    const { replayService, repository, service } = createService({
      monitorResultReader: {
        async getMonitorResultById(monitorResultId) {
          expect(monitorResultId).toBe(alertResult.id);
          return alertResult;
        },
      },
    });

    const first = await service.createOrOpenMonitorInvestigation({
      monitorResultId: alertResult.id,
      companyKey: "acme",
      requestedBy: "finance-operator",
    });
    const second = await service.createOrOpenMonitorInvestigation({
      monitorResultId: alertResult.id,
      companyKey: "acme",
      requestedBy: "finance-operator",
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.mission.id).toBe(first.mission.id);
    expect(first.mission).toMatchObject({
      type: "discovery",
      status: "succeeded",
      title: "Investigate cash-posture alert for acme",
      sourceKind: "alert",
      sourceRef: `pocket-cfo://monitor-results/${alertResult.id}`,
      primaryRepo: null,
    });
    expect(first.tasks).toEqual([]);
    expect(first.proofBundle).toMatchObject({
      status: "ready",
      companyKey: "acme",
      questionKind: null,
      reportKind: null,
      monitorInvestigation: {
        monitorResultId: alertResult.id,
        companyKey: "acme",
        monitorKind: "cash_posture",
        monitorResultStatus: "alert",
        alertSeverity: "critical",
        sourceLineageSummary:
          "No bank-account-summary source lineage is available.",
        proofBundlePosture: {
          state: "limited_by_missing_source",
        },
        runtimeBoundary: {
          monitorRerunUsed: false,
          runtimeCodexUsed: false,
          deliveryActionUsed: false,
          scheduledAutomationUsed: false,
          reportArtifactCreated: false,
          approvalCreated: false,
          autonomousFinanceActionUsed: false,
        },
      },
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: [],
        missingArtifactKinds: [],
      },
    });

    const events = await replayService.listByMissionId(first.mission.id);
    expect(events.map((event) => event.type)).toEqual([
      "mission.created",
      "mission.status_changed",
      "artifact.created",
    ]);
    expect(events[1]?.payload).toEqual({
      from: "planned",
      to: "succeeded",
      reason: "monitor_investigation_handoff_ready",
    });
    expect(await repository.claimNextRunnableTask()).toBeNull();
  });

  it("creates or opens one taskless collections monitor-alert investigation mission from a persisted alert", async () => {
    const alertResult = buildCollectionsAlertMonitorResult();
    const { replayService, repository, service } = createService({
      monitorResultReader: {
        async getMonitorResultById(monitorResultId) {
          expect(monitorResultId).toBe(alertResult.id);
          return alertResult;
        },
      },
    });

    const first = await service.createOrOpenMonitorInvestigation({
      monitorResultId: alertResult.id,
      companyKey: "acme",
      requestedBy: "finance-operator",
    });
    const second = await service.createOrOpenMonitorInvestigation({
      monitorResultId: alertResult.id,
      companyKey: "acme",
      requestedBy: "finance-operator",
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.mission.id).toBe(first.mission.id);
    expect(first.mission).toMatchObject({
      type: "discovery",
      status: "succeeded",
      title: "Investigate collections-pressure alert for acme",
      sourceKind: "alert",
      sourceRef: `pocket-cfo://monitor-results/${alertResult.id}`,
      primaryRepo: null,
    });
    expect(first.mission.objective).toContain(
      "Manual monitor-alert investigation handoff",
    );
    expect(first.tasks).toEqual([]);
    expect(first.proofBundle).toMatchObject({
      status: "ready",
      companyKey: "acme",
      questionKind: null,
      reportKind: null,
      monitorInvestigation: {
        monitorResultId: alertResult.id,
        companyKey: "acme",
        monitorKind: "collections_pressure",
        monitorResultStatus: "alert",
        alertSeverity: "warning",
        conditionSummaries: [
          "USD receivables are 60.00% past due based on source-backed totals.",
        ],
        sourceLineageSummary:
          "3 receivables-aging lineage record(s) back this monitor result.",
        proofBundlePosture: {
          state: "source_backed",
        },
        runtimeBoundary: {
          monitorRerunUsed: false,
          runtimeCodexUsed: false,
          deliveryActionUsed: false,
          scheduledAutomationUsed: false,
          reportArtifactCreated: false,
          approvalCreated: false,
          autonomousFinanceActionUsed: false,
        },
      },
      evidenceCompleteness: {
        status: "complete",
        expectedArtifactKinds: [],
        missingArtifactKinds: [],
      },
    });

    const events = await replayService.listByMissionId(first.mission.id);
    expect(events.map((event) => event.type)).toEqual([
      "mission.created",
      "mission.status_changed",
      "artifact.created",
    ]);
    expect(await repository.claimNextRunnableTask()).toBeNull();
  });

  it("rejects missing, non-alert, unsupported, and alert-card-less monitor results", async () => {
    const alertResult = buildAlertMonitorResult();
    const collectionsAlertResult = buildCollectionsAlertMonitorResult();
    const cases: Array<{
      expectedPath: string;
      result: unknown | null;
    }> = [
      {
        expectedPath: "monitorResultId",
        result: null,
      },
      {
        expectedPath: "monitorResultId",
        result: {
          ...collectionsAlertResult,
          alertCard: null,
          conditions: [],
          severity: "none",
          status: "no_alert",
        } satisfies MonitorResult,
      },
      {
        expectedPath: "monitorKind",
        result: {
          ...alertResult,
          monitorKind: "payables_pressure",
        },
      },
      {
        expectedPath: "monitorKind",
        result: {
          ...alertResult,
          monitorKind: "policy_covenant_threshold",
        },
      },
      {
        expectedPath: "monitorResultId",
        result: {
          ...alertResult,
          alertCard: null,
        },
      },
    ];

    for (const testCase of cases) {
      const { service } = createService({
        monitorResultReader: {
          async getMonitorResultById() {
            return testCase.result;
          },
        },
      });

      await expect(
        service.createOrOpenMonitorInvestigation({
          monitorResultId: alertResult.id,
          companyKey: "acme",
          requestedBy: "finance-operator",
        }),
      ).rejects.toMatchObject({
        body: {
          error: {
            details: [
              {
                path: testCase.expectedPath,
              },
            ],
          },
        },
        statusCode: 400,
      });
    }
  });

  it("rejects monitor investigation requests for the wrong company", async () => {
    const alertResult = buildAlertMonitorResult();
    const { service } = createService({
      monitorResultReader: {
        async getMonitorResultById() {
          return alertResult;
        },
      },
    });

    await expect(
      service.createOrOpenMonitorInvestigation({
        monitorResultId: alertResult.id,
        companyKey: "other-company",
        requestedBy: "finance-operator",
      }),
    ).rejects.toMatchObject({
      body: {
        error: {
          details: [
            {
              path: "companyKey",
            },
          ],
        },
      },
      statusCode: 400,
    });
  });

  it("rejects wrong-company monitor investigation opens even after the alert mission exists", async () => {
    const alertResult = buildAlertMonitorResult();
    const { service } = createService({
      monitorResultReader: {
        async getMonitorResultById() {
          return alertResult;
        },
      },
    });

    await service.createOrOpenMonitorInvestigation({
      monitorResultId: alertResult.id,
      companyKey: "acme",
      requestedBy: "finance-operator",
    });

    await expect(
      service.createOrOpenMonitorInvestigation({
        monitorResultId: alertResult.id,
        companyKey: "other-company",
        requestedBy: "finance-operator",
      }),
    ).rejects.toMatchObject({
      body: {
        error: {
          details: [
            {
              path: "companyKey",
            },
          ],
        },
      },
      statusCode: 400,
    });
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

  it("creates reporting missions only from a succeeded finance discovery mission with stored evidence", async () => {
    const { replayService, repository, service } = createService();
    const source = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "cash_posture",
      operatorPrompt: "Review cash posture from stored state.",
      requestedBy: "operator",
    });
    const scoutTask = source.tasks[0]!;

    await repository.updateTaskStatus(scoutTask.id, "succeeded");
    await repository.updateMissionStatus(source.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceDiscoveryAnswerArtifact({
        missionId: source.mission.id,
        taskId: scoutTask.id,
      }),
    );

    const created = await service.createReporting({
      sourceDiscoveryMissionId: source.mission.id,
      reportKind: "finance_memo",
      requestedBy: "finance-operator",
    });

    expect(created.mission.type).toBe("reporting");
    expect(created.mission.sourceKind).toBe("manual_reporting");
    expect(created.mission.primaryRepo).toBeNull();
    expect(created.mission.spec.input?.reportingRequest).toEqual({
      sourceDiscoveryMissionId: source.mission.id,
      sourceReportingMissionId: null,
      reportKind: "finance_memo",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
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
    ).toEqual(["finance_memo", "evidence_appendix"]);
    expect(created.proofBundle.reportKind).toBe("finance_memo");
    expect(created.proofBundle.sourceDiscoveryMissionId).toBe(
      source.mission.id,
    );

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.slice(-4).map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
  });

  it("creates board-packet reporting missions only from a succeeded finance-memo reporting mission with stored memo and appendix artifacts", async () => {
    const { replayService, repository, service } = createService();
    const source = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "cash_posture",
      operatorPrompt: "Review cash posture from stored state.",
      requestedBy: "operator",
    });
    const sourceScoutTask = source.tasks[0]!;

    await repository.updateTaskStatus(sourceScoutTask.id, "succeeded");
    await repository.updateMissionStatus(source.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceDiscoveryAnswerArtifact({
        missionId: source.mission.id,
        taskId: sourceScoutTask.id,
      }),
    );

    const reporting = await service.createReporting({
      sourceDiscoveryMissionId: source.mission.id,
      reportKind: "finance_memo",
      requestedBy: "finance-operator",
    });
    const reportingScoutTask = reporting.tasks[0]!;

    await repository.updateTaskStatus(reportingScoutTask.id, "succeeded");
    await repository.updateMissionStatus(reporting.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceMemoReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.saveArtifact(
      buildEvidenceAppendixReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.upsertProofBundle(
      buildReadyFinanceMemoProofBundle({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
      }),
    );

    const created = await service.createBoardPacket({
      requestedBy: "finance-operator",
      sourceReportingMissionId: reporting.mission.id,
    });

    expect(created.mission.type).toBe("reporting");
    expect(created.mission.sourceKind).toBe("manual_reporting");
    expect(created.mission.spec.input?.reportingRequest).toEqual({
      sourceDiscoveryMissionId: source.mission.id,
      sourceReportingMissionId: reporting.mission.id,
      reportKind: "board_packet",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
    });
    expect(created.proofBundle.reportKind).toBe("board_packet");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      reporting.mission.id,
    );
    expect(
      created.proofBundle.evidenceCompleteness.expectedArtifactKinds,
    ).toEqual(["board_packet"]);

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.slice(-4).map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
  });

  it("creates lender-update reporting missions only from a succeeded finance-memo reporting mission with stored memo and appendix artifacts", async () => {
    const { replayService, repository, service } = createService();
    const source = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "cash_posture",
      operatorPrompt: "Review cash posture from stored state.",
      requestedBy: "operator",
    });
    const sourceScoutTask = source.tasks[0]!;

    await repository.updateTaskStatus(sourceScoutTask.id, "succeeded");
    await repository.updateMissionStatus(source.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceDiscoveryAnswerArtifact({
        missionId: source.mission.id,
        taskId: sourceScoutTask.id,
      }),
    );

    const reporting = await service.createReporting({
      sourceDiscoveryMissionId: source.mission.id,
      reportKind: "finance_memo",
      requestedBy: "finance-operator",
    });
    const reportingScoutTask = reporting.tasks[0]!;

    await repository.updateTaskStatus(reportingScoutTask.id, "succeeded");
    await repository.updateMissionStatus(reporting.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceMemoReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.saveArtifact(
      buildEvidenceAppendixReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.upsertProofBundle(
      buildReadyFinanceMemoProofBundle({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
      }),
    );

    const created = await service.createLenderUpdate({
      requestedBy: "finance-operator",
      sourceReportingMissionId: reporting.mission.id,
    });

    expect(created.mission.type).toBe("reporting");
    expect(created.mission.sourceKind).toBe("manual_reporting");
    expect(created.mission.spec.input?.reportingRequest).toEqual({
      sourceDiscoveryMissionId: source.mission.id,
      sourceReportingMissionId: reporting.mission.id,
      reportKind: "lender_update",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
    });
    expect(created.proofBundle.reportKind).toBe("lender_update");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      reporting.mission.id,
    );
    expect(
      created.proofBundle.evidenceCompleteness.expectedArtifactKinds,
    ).toEqual(["lender_update"]);

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.slice(-4).map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
  });

  it("creates diligence-packet reporting missions only from a succeeded finance-memo reporting mission with stored memo and appendix artifacts", async () => {
    const { replayService, repository, service } = createService();
    const source = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "cash_posture",
      operatorPrompt: "Review cash posture from stored state.",
      requestedBy: "operator",
    });
    const sourceScoutTask = source.tasks[0]!;

    await repository.updateTaskStatus(sourceScoutTask.id, "succeeded");
    await repository.updateMissionStatus(source.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceDiscoveryAnswerArtifact({
        missionId: source.mission.id,
        taskId: sourceScoutTask.id,
      }),
    );

    const reporting = await service.createReporting({
      sourceDiscoveryMissionId: source.mission.id,
      reportKind: "finance_memo",
      requestedBy: "finance-operator",
    });
    const reportingScoutTask = reporting.tasks[0]!;

    await repository.updateTaskStatus(reportingScoutTask.id, "succeeded");
    await repository.updateMissionStatus(reporting.mission.id, "succeeded");
    await repository.saveArtifact(
      buildFinanceMemoReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.saveArtifact(
      buildEvidenceAppendixReportingArtifact({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
        taskId: reportingScoutTask.id,
      }),
    );
    await repository.upsertProofBundle(
      buildReadyFinanceMemoProofBundle({
        missionId: reporting.mission.id,
        sourceDiscoveryMissionId: source.mission.id,
      }),
    );

    const created = await service.createDiligencePacket({
      requestedBy: "finance-operator",
      sourceReportingMissionId: reporting.mission.id,
    });

    expect(created.mission.type).toBe("reporting");
    expect(created.mission.sourceKind).toBe("manual_reporting");
    expect(created.mission.spec.input?.reportingRequest).toEqual({
      sourceDiscoveryMissionId: source.mission.id,
      sourceReportingMissionId: reporting.mission.id,
      reportKind: "diligence_packet",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
    });
    expect(created.proofBundle.reportKind).toBe("diligence_packet");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      reporting.mission.id,
    );
    expect(
      created.proofBundle.evidenceCompleteness.expectedArtifactKinds,
    ).toEqual(["diligence_packet"]);

    const events = await replayService.listByMissionId(created.mission.id);
    expect(events.slice(-4).map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
  });

  it("rejects reporting creation when the source mission is not a completed discovery mission", async () => {
    const { service } = createService();
    const buildMission = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    await expect(
      service.createReporting({
        sourceDiscoveryMissionId: buildMission.mission.id,
        reportKind: "finance_memo",
        requestedBy: "finance-operator",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      body: {
        error: {
          details: [
            {
              path: "sourceDiscoveryMissionId",
              message: `Mission ${buildMission.mission.id} is build, not a discovery mission.`,
            },
          ],
        },
      },
    });
  });

  it("rejects reporting creation when the discovery answer artifact is missing", async () => {
    const { repository, service } = createService();
    const source = await service.createDiscovery({
      companyKey: "acme",
      questionKind: "cash_posture",
      requestedBy: "operator",
    });
    const scoutTask = source.tasks[0]!;

    await repository.updateTaskStatus(scoutTask.id, "succeeded");
    await repository.updateMissionStatus(source.mission.id, "succeeded");

    await expect(
      service.createReporting({
        sourceDiscoveryMissionId: source.mission.id,
        reportKind: "finance_memo",
        requestedBy: "finance-operator",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      body: {
        error: {
          details: [
            {
              path: "sourceDiscoveryMissionId",
              message: `Discovery mission ${source.mission.id} has no stored discovery answer artifact.`,
            },
          ],
        },
      },
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
        requiresLiveControl: true,
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

    const firstExecutorTask = first.tasks.find(
      (task) => task.role === "executor",
    );

    expect(firstExecutorTask).toBeDefined();

    await repository.updateMissionStatus(first.mission.id, "succeeded");
    await repository.updateTaskStatus(firstExecutorTask?.id ?? "", "succeeded");

    const firstBundle = await repository.getProofBundleByMissionId(
      first.mission.id,
    );
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

function buildFinanceDiscoveryAnswerArtifact(input: {
  missionId: string;
  taskId: string;
}) {
  return {
    kind: "discovery_answer" as const,
    metadata: {
      source: "stored_finance_twin_and_cfo_wiki",
      summary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      companyKey: "acme",
      questionKind: "cash_posture",
      policySourceId: null,
      policySourceScope: null,
      answerSummary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      freshnessPosture: {
        state: "stale",
        reasonSummary:
          "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      },
      limitations: [
        "Working-capital timing remains approximate because no payment calendar inference is performed.",
      ],
      relatedRoutes: [
        {
          label: "Cash posture",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
        {
          label: "Bank accounts",
          routePath: "/finance-twin/companies/acme/bank-accounts",
        },
      ],
      relatedWikiPages: [
        {
          pageKey: "metrics/cash-posture",
          title: "Cash posture",
        },
      ],
      evidenceSections: [
        {
          key: "cash_posture_route",
          title: "Cash posture route-backed evidence",
          summary: "Stored Finance Twin cash posture output.",
          routePath: "/finance-twin/companies/acme/cash-posture",
        },
      ],
      bodyMarkdown: "# Cash posture\n",
      structuredData: {},
    },
    missionId: input.missionId,
    mimeType: "application/json",
    taskId: input.taskId,
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/discovery-answer`,
  };
}

function buildFinanceMemoReportingArtifact(input: {
  missionId: string;
  sourceDiscoveryMissionId: string;
  taskId: string;
}) {
  return {
    kind: "finance_memo" as const,
    metadata: {
      source: "stored_discovery_evidence",
      summary:
        "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
      reportKind: "finance_memo" as const,
      draftStatus: "draft_only" as const,
      sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
      companyKey: "acme",
      questionKind: "cash_posture" as const,
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
          artifactId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          kind: "discovery_answer" as const,
        },
      ],
      bodyMarkdown:
        "# Draft Finance Memo\n\n## Memo Summary\n\nCash posture remains constrained.",
    },
    missionId: input.missionId,
    mimeType: "text/markdown",
    taskId: input.taskId,
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/finance-memo`,
  };
}

function buildEvidenceAppendixReportingArtifact(input: {
  missionId: string;
  sourceDiscoveryMissionId: string;
  taskId: string;
}) {
  return {
    kind: "evidence_appendix" as const,
    metadata: {
      source: "stored_discovery_evidence",
      summary:
        "Evidence appendix for source discovery mission 11111111-1111-4111-8111-111111111111.",
      reportKind: "finance_memo" as const,
      draftStatus: "draft_only" as const,
      sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
      companyKey: "acme",
      questionKind: "cash_posture" as const,
      policySourceId: null,
      policySourceScope: null,
      appendixSummary:
        "Stored evidence appendix for discovery mission 11111111-1111-4111-8111-111111111111.",
      freshnessSummary:
        "Cash posture remains stale because the latest bank account summary sync is older than the freshness threshold.",
      limitationsSummary:
        "This memo is draft-only and carries source discovery freshness and limitation posture forward.",
      limitations: [
        "Working-capital timing remains approximate because no payment calendar inference is performed.",
      ],
      relatedRoutePaths: ["/finance-twin/companies/acme/cash-posture"],
      relatedWikiPageKeys: ["metrics/cash-posture"],
      sourceArtifacts: [
        {
          artifactId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          kind: "discovery_answer" as const,
        },
      ],
      bodyMarkdown:
        "# Evidence Appendix\n\n## Source Discovery Lineage\n\nStored lineage.",
    },
    missionId: input.missionId,
    mimeType: "text/markdown",
    taskId: input.taskId,
    uri: `pocket-cto://missions/${input.missionId}/tasks/${input.taskId}/evidence-appendix`,
  };
}

function buildReadyFinanceMemoProofBundle(input: {
  missionId: string;
  sourceDiscoveryMissionId: string;
}): ProofBundleManifest {
  return {
    missionId: input.missionId,
    missionTitle: "Draft finance memo for acme from cash posture discovery",
    objective:
      "Compile one draft finance memo plus one linked evidence appendix from completed discovery mission and its stored evidence only.",
    sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
    sourceReportingMissionId: null,
    companyKey: "acme",
    questionKind: "cash_posture",
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    reportKind: "finance_memo",
    reportDraftStatus: "draft_only",
    reportPublication: {
      storedDraft: true,
      filedMemo: null,
      filedEvidenceAppendix: null,
      latestMarkdownExport: null,
      summary:
        "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
    },
    reportSummary:
      "Cash posture remains constrained by stale bank coverage and visible working-capital gaps.",
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
      "This memo is draft-only, carries source discovery freshness and limitations forward, and has no release or approval workflow in F5A.",
    rollbackSummary:
      "No release side effect was produced; rerun only after the stored discovery evidence is refreshed first.",
    latestApproval: null,
    circulationRecord: null,
    circulationChronology: null,
    circulationReadiness: null,
    releaseRecord: null,
    releaseReadiness: null,
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
    artifactIds: [],
    artifacts: [],
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
  };
}

function buildAlertMonitorResult(): MonitorResult {
  const sourceFreshnessPosture = {
    state: "missing" as const,
    latestAttemptedSyncRunId: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulSource: null,
    missingSource: true,
    failedSource: false,
    summary: "No successful bank-account-summary source is stored.",
  };
  const proofBundlePosture = {
    state: "limited_by_missing_source" as const,
    summary:
      "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
  };

  return {
    id: "66666666-6666-4666-8666-666666666666",
    companyId: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    monitorKind: "cash_posture",
    runKey: "cash_posture:acme:missing-source",
    triggeredBy: "finance-operator",
    status: "alert",
    severity: "critical",
    conditions: [
      {
        kind: "missing_source",
        severity: "critical",
        summary: "No successful bank-account-summary slice exists.",
        evidencePath: "freshness.state",
      },
    ],
    sourceFreshnessPosture,
    sourceLineageRefs: [],
    deterministicSeverityRationale:
      "Critical because missing_source was detected from stored cash-posture freshness.",
    limitations: [
      "The monitor reports source posture only and does not infer runway.",
    ],
    proofBundlePosture,
    replayPosture: {
      state: "not_appended",
      reason:
        "F6A monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary: {
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      investigationMissionCreated: false,
      autonomousFinanceActionUsed: false,
      summary:
        "The result was produced by deterministic stored-state evaluation only.",
    },
    humanReviewNextStep:
      "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
    alertCard: {
      companyKey: "acme",
      monitorKind: "cash_posture",
      status: "alert",
      severity: "critical",
      deterministicSeverityRationale:
        "Critical because missing_source was detected from stored cash-posture freshness.",
      conditionSummaries: ["No successful bank-account-summary slice exists."],
      sourceFreshnessPosture,
      sourceLineageRefs: [],
      sourceLineageSummary:
        "No bank-account-summary source lineage is available.",
      limitations: [
        "The monitor reports source posture only and does not infer runway.",
      ],
      proofBundlePosture,
      humanReviewNextStep:
        "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
      createdAt: "2026-04-26T12:00:00.000Z",
    },
    createdAt: "2026-04-26T12:00:00.000Z",
  };
}

function buildCollectionsAlertMonitorResult(): MonitorResult {
  const sourceFreshnessPosture = {
    state: "fresh" as const,
    latestAttemptedSyncRunId: "55555555-5555-4555-8555-555555555555",
    latestSuccessfulSyncRunId: "55555555-5555-4555-8555-555555555555",
    latestSuccessfulSource: {
      sourceId: "22222222-2222-4222-8222-222222222222",
      sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
      sourceFileId: "44444444-4444-4444-8444-444444444444",
      syncRunId: "55555555-5555-4555-8555-555555555555",
    },
    missingSource: false,
    failedSource: false,
    summary: "The latest successful receivables-aging source is fresh.",
  };
  const sourceLineageRefs = [
    {
      sourceId: "22222222-2222-4222-8222-222222222222",
      sourceSnapshotId: "33333333-3333-4333-8333-333333333333",
      sourceFileId: "44444444-4444-4444-8444-444444444444",
      syncRunId: "55555555-5555-4555-8555-555555555555",
      targetKind: "receivables_aging_row" as const,
      targetId: null,
      lineageCount: 3,
      lineageTargetCounts: {
        reportingPeriodCount: 0,
        ledgerAccountCount: 0,
        bankAccountCount: 0,
        bankAccountSummaryCount: 0,
        customerCount: 1,
        receivablesAgingRowCount: 1,
        vendorCount: 0,
        payablesAgingRowCount: 0,
        contractCount: 0,
        contractObligationCount: 0,
        spendRowCount: 0,
        trialBalanceLineCount: 0,
        accountCatalogEntryCount: 0,
        journalEntryCount: 0,
        journalLineCount: 0,
        generalLedgerBalanceProofCount: 0,
      },
      summary:
        "Latest successful receivables-aging source lineage for collections pressure.",
    },
  ];
  const proofBundlePosture = {
    state: "source_backed" as const,
    summary:
      "The monitor result is backed by the latest stored receivables-aging source lineage.",
  };

  return {
    id: "77777777-7777-4777-8777-777777777777",
    companyId: "11111111-1111-4111-8111-111111111111",
    companyKey: "acme",
    monitorKind: "collections_pressure",
    runKey: "collections_pressure:acme:source-backed-overdue",
    triggeredBy: "finance-operator",
    status: "alert",
    severity: "warning",
    conditions: [
      {
        kind: "overdue_concentration",
        severity: "warning",
        summary:
          "USD receivables are 60.00% past due based on source-backed totals.",
        evidencePath: "currencyBuckets[USD].pastDueShare",
      },
    ],
    sourceFreshnessPosture,
    sourceLineageRefs,
    deterministicSeverityRationale:
      "Warning because overdue_concentration condition(s) were detected from stored collections-pressure state.",
    limitations: [
      "F6C collections-pressure monitoring evaluates stored receivables-aging posture only.",
    ],
    proofBundlePosture,
    replayPosture: {
      state: "not_appended",
      reason:
        "F6C monitor results are persisted company-scoped records and are not appended to mission replay.",
    },
    runtimeBoundary: {
      runtimeCodexUsed: false,
      deliveryActionUsed: false,
      investigationMissionCreated: false,
      autonomousFinanceActionUsed: false,
      summary:
        "The result was produced by deterministic stored-state evaluation only.",
    },
    humanReviewNextStep: "Review collections alert source posture.",
    alertCard: {
      companyKey: "acme",
      monitorKind: "collections_pressure",
      status: "alert",
      severity: "warning",
      deterministicSeverityRationale:
        "Warning because overdue_concentration condition(s) were detected from stored collections-pressure state.",
      conditionSummaries: [
        "USD receivables are 60.00% past due based on source-backed totals.",
      ],
      sourceFreshnessPosture,
      sourceLineageRefs,
      sourceLineageSummary:
        "3 receivables-aging lineage record(s) back this monitor result.",
      limitations: [
        "F6C collections-pressure monitoring evaluates stored receivables-aging posture only.",
      ],
      proofBundlePosture,
      humanReviewNextStep: "Review collections alert source posture.",
      createdAt: "2026-04-26T12:00:00.000Z",
    },
    createdAt: "2026-04-26T12:00:00.000Z",
  };
}
