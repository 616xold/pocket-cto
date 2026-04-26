import { afterEach, describe, expect, it, vi } from "vitest";

const missionId = "11111111-1111-4111-8111-111111111111";
const approvalId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";

describe("web api module", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("falls back to the default control-plane URL when no env override is set", async () => {
    const mod = await loadApiModuleWithEnv({});

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL: undefined,
        CONTROL_PLANE_URL: undefined,
      }),
    ).toBe("http://localhost:4000");
  });

  it("prefers NEXT_PUBLIC_CONTROL_PLANE_URL over CONTROL_PLANE_URL", async () => {
    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
      nextPublicControlPlaneUrl: "http://public-control-plane.example:4100",
    });

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL:
          "http://public-control-plane.example:4100",
        CONTROL_PLANE_URL: "http://control-plane.internal:4200",
      }),
    ).toBe("http://public-control-plane.example:4100");
  });

  it("uses CONTROL_PLANE_URL when NEXT_PUBLIC_CONTROL_PLANE_URL is absent", async () => {
    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
    });

    expect(
      mod.resolveControlPlaneUrl({
        NEXT_PUBLIC_CONTROL_PLANE_URL: undefined,
        CONTROL_PLANE_URL: "http://control-plane.internal:4200",
      }),
    ).toBe("http://control-plane.internal:4200");
  });

  it("parses mission detail with approvals and artifacts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMissionDetailPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const detail = await mod.getMissionDetail(missionId);

    expect(detail).not.toBeNull();
    expect(detail?.approvals).toHaveLength(1);
    expect(detail?.approvalCards).toHaveLength(1);
    expect(detail?.artifacts.map((artifact) => artifact.kind)).toEqual([
      "proof_bundle_manifest",
      "diff_summary",
    ]);
    expect(detail?.liveControl.mode).toBe("embedded_worker");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}`,
      {
        cache: "no-store",
      },
    );
  });

  it("parses the mission-list route and forwards list filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMissionListPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const list = await mod.getMissionList({
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    });

    expect(list).not.toBeNull();
    expect(list?.filters).toEqual({
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    });
    expect(list?.missions.map((mission) => mission.id)).toEqual([
      missionId,
      "44444444-4444-4444-8444-444444444444",
    ]);
    expect(list?.missions[0]).toMatchObject({
      latestTask: {
        role: "executor",
        sequence: 1,
        status: "running",
      },
      pendingApprovalCount: 1,
      proofBundleStatus: "incomplete",
      pullRequestUrl: "https://github.com/acme/web/pull/19",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions?limit=6&status=queued&sourceKind=github_issue`,
      {
        cache: "no-store",
      },
    );
  });

  it("reads the company bound-source list for policy selector loading", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return {
          companyId: "11111111-1111-4111-8111-111111111111",
          companyKey: "acme",
          companyDisplayName: "Acme",
          sourceCount: 1,
          limitations: [],
          sources: [
            {
              binding: {
                id: "22222222-2222-4222-8222-222222222222",
                companyId: "11111111-1111-4111-8111-111111111111",
                sourceId: "33333333-3333-4333-8333-333333333333",
                includeInCompile: true,
                documentRole: "policy_document",
                boundBy: "operator",
                createdAt: "2026-04-16T12:00:00.000Z",
                updatedAt: "2026-04-16T12:00:00.000Z",
              },
              source: {
                id: "33333333-3333-4333-8333-333333333333",
                kind: "document",
                name: "Travel and expense policy",
                description: "Policy document",
                originKind: "manual",
                createdBy: "operator",
                createdAt: "2026-04-16T12:00:00.000Z",
                updatedAt: "2026-04-16T12:00:00.000Z",
              },
              latestSnapshot: null,
              latestSourceFile: null,
              latestExtract: null,
              limitations: [],
            },
          ],
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const sources = await mod.getCfoWikiCompanySourceList("acme");

    expect(sources?.companyKey).toBe("acme");
    expect(sources?.sources[0]?.binding.documentRole).toBe("policy_document");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/cfo-wiki/companies/acme/sources`,
      {
        cache: "no-store",
      },
    );
  });

  it("reads the latest cash-posture monitor result", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildMonitorLatestPayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const latest = await mod.getLatestCashPostureMonitorResult("acme");

    expect(latest?.monitorKind).toBe("cash_posture");
    expect(latest?.monitorResult?.status).toBe("alert");
    expect(latest?.alertCard?.severity).toBe("critical");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/monitoring/companies/acme/cash-posture/latest`,
      {
        cache: "no-store",
      },
    );
  });

  it("posts the cash-posture monitor run route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          monitorResult: buildMonitorResultPayload(),
          alertCard: buildMonitorResultPayload().alertCard,
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.runCashPostureMonitor({
      companyKey: "acme",
      runKey: "operator-run-1",
      triggeredBy: "finance-operator",
    });

    expect(result).toMatchObject({
      ok: true,
      statusCode: 201,
      data: {
        monitorResult: {
          monitorKind: "cash_posture",
          status: "alert",
          severity: "critical",
        },
        alertCard: {
          companyKey: "acme",
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/monitoring/companies/acme/cash-posture/run`,
      {
        body: JSON.stringify({
          runKey: "operator-run-1",
          triggeredBy: "finance-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("parses the GitHub issue intake route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return buildGitHubIssueIntakePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const intake = await mod.getGitHubIssueIntakeList();

    expect(intake).not.toBeNull();
    expect(intake?.issues).toHaveLength(2);
    expect(intake?.issues[0]).toMatchObject({
      deliveryId: "delivery-issue-42",
      repoFullName: "acme/web",
      issueNumber: 42,
      issueTitle: "Ship issue intake",
      hasCommentActivity: true,
      isBound: false,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/github/intake/issues`,
      {
        cache: "no-store",
      },
    );
  });

  it("posts the GitHub issue mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildGitHubIssueMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createMissionFromGitHubIssueDelivery({
      deliveryId: "delivery-issue-42",
    });

    expect(created.outcome).toBe("created");
    expect(created.mission.id).toBe(missionId);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/github/intake/issues/delivery-issue-42/create-mission`,
      {
        body: JSON.stringify({}),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the lender-update release approval route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          approvalId,
          created: true,
          approvalStatus: "pending",
          releaseApprovalStatus: "pending_review",
          releaseReady: false,
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.requestReportingReleaseApproval({
      missionId,
      requestedBy: "finance-operator",
    });

    expect(result).toEqual({
      ok: true,
      statusCode: 201,
      data: {
        missionId,
        approvalId,
        created: true,
        approvalStatus: "pending",
        releaseApprovalStatus: "pending_review",
        releaseReady: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/release-approval`,
      {
        body: JSON.stringify({
          requestedBy: "finance-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the lender-update release-log route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          approvalId,
          created: true,
          releaseRecord: {
            released: true,
            releasedAt: "2026-04-20T09:10:00.000Z",
            releasedBy: "finance-operator",
            releaseChannel: "email",
            releaseNote: "Sent from treasury mailbox after approval.",
            approvalId,
            summary:
              "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
          },
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.recordReportingReleaseLog({
      missionId,
      releasedBy: "finance-operator",
      releaseChannel: "email",
      releaseNote: "Sent from treasury mailbox after approval.",
    });

    expect(result).toEqual({
      ok: true,
      statusCode: 201,
      data: {
        missionId,
        approvalId,
        created: true,
        releaseRecord: {
          released: true,
          releasedAt: "2026-04-20T09:10:00.000Z",
          releasedBy: "finance-operator",
          releaseChannel: "email",
          releaseNote: "Sent from treasury mailbox after approval.",
          approvalId,
          summary:
            "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/release-log`,
      {
        body: JSON.stringify({
          releasedAt: null,
          releasedBy: "finance-operator",
          releaseChannel: "email",
          releaseNote: "Sent from treasury mailbox after approval.",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the board-packet circulation-log route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          approvalId,
          created: true,
          circulationRecord: {
            circulated: true,
            circulatedAt: "2026-04-21T09:10:00.000Z",
            circulatedBy: "finance-operator",
            circulationChannel: "email",
            circulationNote: "Circulated from the finance mailbox after approval.",
            approvalId,
            summary:
              "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
          },
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.recordReportingCirculationLog({
      missionId,
      circulatedBy: "finance-operator",
      circulationChannel: "email",
      circulationNote: "Circulated from the finance mailbox after approval.",
    });

    expect(result).toEqual({
      ok: true,
      statusCode: 201,
      data: {
        missionId,
        approvalId,
        created: true,
        circulationRecord: {
          circulated: true,
          circulatedAt: "2026-04-21T09:10:00.000Z",
          circulatedBy: "finance-operator",
          circulationChannel: "email",
          circulationNote: "Circulated from the finance mailbox after approval.",
          approvalId,
          summary:
            "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/circulation-log`,
      {
        body: JSON.stringify({
          circulatedAt: null,
          circulatedBy: "finance-operator",
          circulationChannel: "email",
          circulationNote: "Circulated from the finance mailbox after approval.",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the board-packet circulation-log-correction route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          approvalId,
          created: true,
          circulationRecord: {
            circulated: true,
            circulatedAt: "2026-04-21T09:10:00.000Z",
            circulatedBy: "finance-operator",
            circulationChannel: "email",
            circulationNote: "Circulated from the finance mailbox after approval.",
            approvalId,
            summary:
              "External circulation was logged by finance-operator at 2026-04-21T09:10:00.000Z via email. Circulation note: Circulated from the finance mailbox after approval.",
          },
          circulationChronology: {
            hasCorrections: true,
            correctionCount: 1,
            latestCorrectionSummary:
              "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedAt -> 2026-04-21T09:12:00.000Z; circulatedBy -> board-chair@example.com; circulationNote -> Corrected after finance mailbox audit. Reason: Corrected the original send timestamp after mailbox review.",
            latestCorrection: {
              correctionKey: "board-packet-correction-1",
              correctedAt: "2026-04-21T09:20:00.000Z",
              correctedBy: "finance-operator",
              correctionReason:
                "Corrected the original send timestamp after mailbox review",
              circulatedAt: "2026-04-21T09:12:00.000Z",
              circulatedBy: "board-chair@example.com",
              circulationChannel: null,
              circulationNote: "Corrected after finance mailbox audit.",
              effectiveRecord: {
                source: "latest_correction",
                circulated: true,
                circulatedAt: "2026-04-21T09:12:00.000Z",
                circulatedBy: "board-chair@example.com",
                circulationChannel: "email",
                circulationNote: "Corrected after finance mailbox audit.",
                approvalId,
                summary:
                  "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:12:00.000Z via email. Effective note: Corrected after finance mailbox audit.",
              },
              summary:
                "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedAt -> 2026-04-21T09:12:00.000Z; circulatedBy -> board-chair@example.com; circulationNote -> Corrected after finance mailbox audit. Reason: Corrected the original send timestamp after mailbox review.",
            },
            effectiveRecord: {
              source: "latest_correction",
              circulated: true,
              circulatedAt: "2026-04-21T09:12:00.000Z",
              circulatedBy: "board-chair@example.com",
              circulationChannel: "email",
              circulationNote: "Corrected after finance mailbox audit.",
              approvalId,
              summary:
                "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:12:00.000Z via email. Effective note: Corrected after finance mailbox audit.",
            },
            corrections: [
              {
                correctionKey: "board-packet-correction-1",
                correctedAt: "2026-04-21T09:20:00.000Z",
                correctedBy: "finance-operator",
                correctionReason:
                  "Corrected the original send timestamp after mailbox review",
                circulatedAt: "2026-04-21T09:12:00.000Z",
                circulatedBy: "board-chair@example.com",
                circulationChannel: null,
                circulationNote: "Corrected after finance mailbox audit.",
                effectiveRecord: {
                  source: "latest_correction",
                  circulated: true,
                  circulatedAt: "2026-04-21T09:12:00.000Z",
                  circulatedBy: "board-chair@example.com",
                  circulationChannel: "email",
                  circulationNote: "Corrected after finance mailbox audit.",
                  approvalId,
                  summary:
                    "Current effective circulation reflects the latest correction logged by finance-operator at 2026-04-21T09:20:00.000Z: circulated by board-chair@example.com at 2026-04-21T09:12:00.000Z via email. Effective note: Corrected after finance mailbox audit.",
                },
                summary:
                  "Circulation record correction was appended by finance-operator at 2026-04-21T09:20:00.000Z. Corrected values: circulatedAt -> 2026-04-21T09:12:00.000Z; circulatedBy -> board-chair@example.com; circulationNote -> Corrected after finance mailbox audit. Reason: Corrected the original send timestamp after mailbox review.",
              },
            ],
            summary:
              "1 circulation correction has been appended. The latest effective circulation fact reflects the correction logged by finance-operator at 2026-04-21T09:20:00.000Z.",
          },
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.recordReportingCirculationLogCorrection({
      missionId,
      correctionKey: "board-packet-correction-1",
      correctedBy: "finance-operator",
      correctionReason:
        "Corrected the original send timestamp after mailbox review",
      circulatedAt: "2026-04-21T09:12:00.000Z",
      circulatedBy: "board-chair@example.com",
      circulationNote: "Corrected after finance mailbox audit.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`Expected successful correction result, got ${result.errorCode}`);
    }
    expect(result.data.circulationChronology.correctionCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/circulation-log-correction`,
      {
        body: JSON.stringify({
          correctionKey: "board-packet-correction-1",
          correctedAt: null,
          correctedBy: "finance-operator",
          correctionReason:
            "Corrected the original send timestamp after mailbox review",
          circulatedAt: "2026-04-21T09:12:00.000Z",
          circulatedBy: "board-chair@example.com",
          circulationChannel: null,
          clearCirculationNote: false,
          circulationNote: "Corrected after finance mailbox audit.",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the board-packet circulation approval route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          approvalId,
          created: true,
          approvalStatus: "pending",
          circulationApprovalStatus: "pending_review",
          circulationReady: false,
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.requestReportingCirculationApproval({
      missionId,
      requestedBy: "finance-operator",
    });

    expect(result).toEqual({
      ok: true,
      statusCode: 201,
      data: {
        missionId,
        approvalId,
        created: true,
        approvalStatus: "pending",
        circulationApprovalStatus: "pending_review",
        circulationReady: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/circulation-approval`,
      {
        body: JSON.stringify({
          requestedBy: "finance-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("posts the finance analysis mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildDiscoveryMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createDiscoveryMission({
      companyKey: "acme",
      questionKind: "spend_posture",
      operatorPrompt: "Review spend posture from stored state.",
      requestedBy: "Local web operator",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("discovery");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/analysis`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      companyKey: "acme",
      operatorPrompt: "Review spend posture from stored state.",
      questionKind: "spend_posture",
      requestedBy: "Local web operator",
    });
  });

  it("posts the source-scoped policy lookup mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildPolicyLookupDiscoveryMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createDiscoveryMission({
      companyKey: "acme",
      operatorPrompt: "Which approval thresholds apply to travel spend?",
      policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      questionKind: "policy_lookup",
      requestedBy: "Local web operator",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("discovery");
    expect(created.mission.spec.input?.discoveryQuestion).toMatchObject({
      companyKey: "acme",
      policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      questionKind: "policy_lookup",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/analysis`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      companyKey: "acme",
      operatorPrompt: "Which approval thresholds apply to travel spend?",
      policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      questionKind: "policy_lookup",
      requestedBy: "Local web operator",
    });
  });

  it("posts the reporting mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildReportingMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createReportingMission({
      requestedBy: "Local web operator",
      reportKind: "finance_memo",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("reporting");
    expect(created.proofBundle.reportKind).toBe("finance_memo");
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/reporting`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      requestedBy: "Local web operator",
      reportKind: "finance_memo",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });
  });

  it("posts the board-packet mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildBoardPacketMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createBoardPacketMission({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("reporting");
    expect(created.proofBundle.reportKind).toBe("board_packet");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/reporting/board-packets`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
  });

  it("posts the lender-update mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildLenderUpdateMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createLenderUpdateMission({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("reporting");
    expect(created.proofBundle.reportKind).toBe("lender_update");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/reporting/lender-updates`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
  });

  it("posts the diligence-packet mission-create route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return buildDiligencePacketMissionCreatePayload();
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const created = await mod.createDiligencePacketMission({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(created.mission.type).toBe("reporting");
    expect(created.proofBundle.reportKind).toBe("diligence_packet");
    expect(created.proofBundle.sourceReportingMissionId).toBe(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/reporting/diligence-packets`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      requestedBy: "Local web operator",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
  });

  it("posts the reporting filed-artifacts route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          companyKey: "acme",
          publication: {
            storedDraft: true,
            filedMemo: {
              artifactKind: "finance_memo",
              pageKey: "filed/reporting-111-finance_memo",
              title: "Draft finance memo",
              filedAt: "2026-04-18T13:05:00.000Z",
              filedBy: "Alicia",
              provenanceSummary: "Draft-only reporting artifact filed.",
            },
            filedEvidenceAppendix: {
              artifactKind: "evidence_appendix",
              pageKey: "filed/reporting-111-evidence_appendix",
              title: "Evidence appendix",
              filedAt: "2026-04-18T13:05:00.000Z",
              filedBy: "Alicia",
              provenanceSummary: "Draft-only reporting artifact filed.",
            },
            latestMarkdownExport: null,
            summary: "Draft memo and evidence appendix are stored and filed.",
          },
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.fileReportingMissionArtifacts({
      filedBy: "Alicia",
      missionId,
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/filed-artifacts`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      filedBy: "Alicia",
    });
  });

  it("posts the reporting export route correctly", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      async json() {
        return {
          missionId,
          companyKey: "acme",
          publication: {
            storedDraft: true,
            filedMemo: {
              artifactKind: "finance_memo",
              pageKey: "filed/reporting-111-finance_memo",
              title: "Draft finance memo",
              filedAt: "2026-04-18T13:05:00.000Z",
              filedBy: "Alicia",
              provenanceSummary: "Draft-only reporting artifact filed.",
            },
            filedEvidenceAppendix: {
              artifactKind: "evidence_appendix",
              pageKey: "filed/reporting-111-evidence_appendix",
              title: "Evidence appendix",
              filedAt: "2026-04-18T13:05:00.000Z",
              filedBy: "Alicia",
              provenanceSummary: "Draft-only reporting artifact filed.",
            },
            latestMarkdownExport: {
              exportRunId: "77777777-7777-4777-8777-777777777777",
              status: "succeeded",
              completedAt: "2026-04-18T13:06:00.000Z",
              includesLatestFiledArtifacts: true,
            },
            summary:
              "Markdown export run includes the latest filed report pages.",
          },
        };
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const result = await mod.exportReportingMissionMarkdown({
      missionId,
      triggeredBy: "Alicia",
    });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mod.resolveControlPlaneUrl()}/missions/${missionId}/reporting/export`,
      expect.objectContaining({
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );
    expect(JSON.parse(String(request.body))).toEqual({
      triggeredBy: "Alicia",
    });
  });

  it("parses the source inventory and detail routes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceListPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceDetailPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceFileListPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceIngestRunListPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceFileDetailPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        async json() {
          return buildSourceIngestRunDetailPayload();
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const sourceList = await mod.getSourceList({ limit: 5 });
    const sourceDetail = await mod.getSourceDetail(missionId);
    const fileList = await mod.getSourceFileList(taskId);
    const runList = await mod.getSourceIngestRunList(approvalId);
    const fileDetail = await mod.getSourceFileDetail(approvalId);
    const runDetail = await mod.getSourceIngestRunDetail(
      "44444444-4444-4444-8444-444444444444",
    );

    expect(sourceList?.sourceCount).toBe(1);
    expect(sourceList?.sources[0]).toMatchObject({
      name: "Board package",
      snapshotCount: 2,
    });
    expect(sourceDetail?.source.name).toBe("Board package");
    expect(fileList?.files[0]?.originalFileName).toBe("board-pack.csv");
    expect(runList?.ingestRuns[0]?.parserSelection.parserKey).toBe(
      "csv_tabular",
    );
    expect(fileDetail?.provenanceRecords[0]?.kind).toBe(
      "source_file_registered",
    );
    expect(runDetail?.ingestRun.status).toBe("ready");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${mod.resolveControlPlaneUrl()}/sources?limit=5`,
      {
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${mod.resolveControlPlaneUrl()}/sources/${missionId}`,
      {
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${mod.resolveControlPlaneUrl()}/sources/${taskId}/files`,
      {
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${mod.resolveControlPlaneUrl()}/sources/files/${approvalId}/ingest-runs`,
      {
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      `${mod.resolveControlPlaneUrl()}/sources/files/${approvalId}`,
      {
        cache: "no-store",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      `${mod.resolveControlPlaneUrl()}/sources/ingest-runs/44444444-4444-4444-8444-444444444444`,
      {
        cache: "no-store",
      },
    );
  });

  it("posts the source registration, upload, and ingest routes correctly", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        async json() {
          return buildSourceDetailPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        async json() {
          return buildSourceFileDetailPayload();
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        async json() {
          return buildSourceIngestRunDetailPayload();
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({});
    const body = Buffer.from("month,cash\nJan,100\n");

    const created = await mod.createSource({
      createdBy: "finance-operator",
      kind: "document",
      name: "Board package",
      originKind: "manual",
      snapshot: {
        checksumSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        ingestStatus: "registered",
        mediaType: "application/pdf",
        originalFileName: "board-pack.pdf",
        sizeBytes: 4096,
        storageKind: "external_url",
        storageRef: "https://example.com/board-pack.pdf",
      },
    });
    const uploaded = await mod.uploadSourceFile({
      body,
      createdBy: "finance-operator",
      mediaType: "text/csv",
      originalFileName: "board-pack.csv",
      sourceId: missionId,
    });
    const ingested = await mod.ingestSourceFile({
      sourceFileId: approvalId,
    });

    expect(created.source.name).toBe("Board package");
    expect(uploaded.sourceFile.originalFileName).toBe("board-pack.csv");
    expect(ingested.ingestRun.parserSelection.parserKey).toBe("csv_tabular");
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${mod.resolveControlPlaneUrl()}/sources`,
      {
        body: JSON.stringify({
          kind: "document",
          originKind: "manual",
          name: "Board package",
          createdBy: "finance-operator",
          snapshot: {
            originalFileName: "board-pack.pdf",
            mediaType: "application/pdf",
            sizeBytes: 4096,
            checksumSha256:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            storageKind: "external_url",
            storageRef: "https://example.com/board-pack.pdf",
            ingestStatus: "registered",
          },
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${mod.resolveControlPlaneUrl()}/sources/${missionId}/files?createdBy=finance-operator&mediaType=text%2Fcsv&originalFileName=board-pack.csv`,
      expect.objectContaining({
        body: expect.any(ArrayBuffer),
        cache: "no-store",
        headers: {
          "content-type": "application/octet-stream",
        },
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${mod.resolveControlPlaneUrl()}/sources/files/${approvalId}/ingest`,
      {
        body: JSON.stringify({}),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
    const uploadCall = fetchMock.mock.calls[1]?.[1];
    expect(uploadCall).toBeDefined();
    expect(Array.from(new Uint8Array(uploadCall?.body as ArrayBuffer))).toEqual(
      Array.from(body),
    );
  });

  it("forms approval-resolution and task-interrupt requests correctly", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        async json() {
          return {
            approval: {
              createdAt: "2026-03-14T10:01:00.000Z",
              id: approvalId,
              kind: "file_change",
              missionId,
              payload: {
                resolution: {
                  decision: "accept",
                },
              },
              rationale: null,
              requestedBy: "system",
              resolvedBy: "web-operator",
              status: "approved",
              taskId,
              updatedAt: "2026-03-14T10:02:00.000Z",
            },
            liveControl: {
              enabled: true,
              limitation: "single_process_only",
              mode: "embedded_worker",
            },
          };
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        async json() {
          return {
            interrupt: {
              cancelledApprovals: [],
              taskId,
              threadId: "thread_live_1",
              turnId: "turn_live_1",
            },
            liveControl: {
              enabled: true,
              limitation: "single_process_only",
              mode: "embedded_worker",
            },
          };
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
      nextPublicControlPlaneUrl: "http://public-control-plane.example:4100",
    });

    const approvalResult = await mod.resolveMissionApproval({
      approvalId,
      decision: "accept",
      resolvedBy: "web-operator",
    });
    const interruptResult = await mod.interruptMissionTask({
      requestedBy: "web-operator",
      taskId,
    });

    expect(approvalResult).toMatchObject({
      ok: true,
      statusCode: 200,
    });
    expect(interruptResult).toMatchObject({
      ok: true,
      statusCode: 200,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://public-control-plane.example:4100/approvals/${approvalId}/resolve`,
      {
        body: JSON.stringify({
          decision: "accept",
          rationale: undefined,
          resolvedBy: "web-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `http://public-control-plane.example:4100/tasks/${taskId}/interrupt`,
      {
        body: JSON.stringify({
          rationale: undefined,
          requestedBy: "web-operator",
        }),
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("returns typed route failures instead of throwing for normal operator-action errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 501,
        async json() {
          return {
            error: {
              code: "live_control_unavailable",
              message:
                "Live approval and interrupt control is unavailable in this process",
            },
          };
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        async json() {
          return {
            error: {
              code: "task_conflict",
              message: `Task ${taskId} has no active live turn to interrupt`,
            },
          };
        },
      });
    vi.stubGlobal("fetch", fetchMock);

    const mod = await loadApiModuleWithEnv({
      controlPlaneUrl: "http://control-plane.internal:4200",
    });

    await expect(
      mod.resolveMissionApproval({
        approvalId,
        decision: "accept",
        resolvedBy: "web-operator",
      }),
    ).resolves.toEqual({
      ok: false,
      statusCode: 501,
      errorCode: "live_control_unavailable",
      message:
        "Live approval and interrupt control is unavailable in this process",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `http://control-plane.internal:4200/approvals/${approvalId}/resolve`,
      expect.any(Object),
    );

    await expect(
      mod.interruptMissionTask({
        requestedBy: "web-operator",
        taskId,
      }),
    ).resolves.toEqual({
      ok: false,
      statusCode: 409,
      errorCode: "task_conflict",
      message: `Task ${taskId} has no active live turn to interrupt`,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `http://control-plane.internal:4200/tasks/${taskId}/interrupt`,
      expect.any(Object),
    );
  });
});

async function loadApiModuleWithEnv(input: {
  controlPlaneUrl?: string;
  nextPublicControlPlaneUrl?: string;
}) {
  vi.resetModules();
  vi.unstubAllEnvs();

  delete process.env.CONTROL_PLANE_URL;
  delete process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;

  if (input.controlPlaneUrl) {
    vi.stubEnv("CONTROL_PLANE_URL", input.controlPlaneUrl);
  }

  if (input.nextPublicControlPlaneUrl) {
    vi.stubEnv(
      "NEXT_PUBLIC_CONTROL_PLANE_URL",
      input.nextPublicControlPlaneUrl,
    );
  }

  return import("./api");
}

function buildMissionDetailPayload() {
  return {
    mission: {
      createdAt: "2026-03-14T10:00:00.000Z",
      createdBy: "operator",
      id: missionId,
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
        id: taskId,
        missionId,
        role: "executor",
        sequence: 1,
        status: "running",
        summary: "Applying the operator read-model change.",
        updatedAt: "2026-03-14T10:05:00.000Z",
        workspaceId: null,
      },
    ],
    proofBundle: {
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
        id: approvalId,
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:01:00.000Z",
      },
      missionId,
      missionTitle: "Implement passkeys for sign-in",
      objective: "Ship passkeys without breaking email login.",
      pullRequestNumber: null,
      pullRequestUrl: null,
      replayEventCount: 14,
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
    },
    approvals: [
      {
        createdAt: "2026-03-14T10:01:00.000Z",
        id: approvalId,
        kind: "file_change",
        rationale: null,
        requestedBy: "system",
        resolvedBy: null,
        status: "pending",
        updatedAt: "2026-03-14T10:01:00.000Z",
      },
    ],
    discoveryAnswer: null,
    reporting: null,
    approvalCards: [
      {
        actionHint:
          "Review the requested file-edit scope, then approve only if this task should change those files.",
        approvalId,
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
          id: taskId,
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
        summary: "Proof bundle incomplete: plan, test_report, pr_link.",
        taskId: null,
        uri: `pocket-cto://missions/${missionId}/proof-bundle-manifest`,
      },
      {
        createdAt: "2026-03-14T10:04:00.000Z",
        id: "77777777-7777-4777-8777-777777777777",
        kind: "diff_summary",
        summary: "Workspace changes touched apps/web and apps/control-plane.",
        taskId,
        uri: `pocket-cto://missions/${missionId}/tasks/${taskId}/diff-summary`,
      },
    ],
    liveControl: {
      enabled: true,
      limitation: "single_process_only",
      mode: "embedded_worker",
    },
  };
}

function buildDiscoveryMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-03-20T03:00:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
      objective:
        "Answer the stored cash posture question for acme from persisted Finance Twin and CFO Wiki state only.",
      primaryRepo: null,
      sourceKind: "manual_discovery",
      sourceRef: null,
      spec: {
        acceptance: [
          "persist one durable discovery answer artifact",
          "persist one finance-ready proof bundle",
          "surface freshness posture, limitations, related routes, related CFO Wiki pages, and structured evidence sections honestly",
        ],
        constraints: {
          allowedPaths: [],
          mustNot: [
            "do not invoke the codex runtime",
            "do not resync the finance twin during execution",
            "do not recompile the CFO Wiki during execution",
            "do not add generic finance chat or freeform answer generation",
            "do not hide stale, partial, failed, or missing stored state",
          ],
        },
        deliverables: ["discovery_answer", "proof_bundle"],
        evidenceRequirements: [
          "stored finance-twin spend-posture route",
          "stored finance-twin spend-items route",
          "stored CFO Wiki pages when present",
          "freshness and limitation posture",
        ],
        input: {
          discoveryQuestion: {
            companyKey: "acme",
            questionKind: "spend_posture",
            operatorPrompt: "Review spend posture from stored state.",
          },
        },
        objective:
          "Answer the stored spend posture question for acme from persisted Finance Twin and CFO Wiki state only.",
        repos: [],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 1,
          maxWallClockMinutes: 5,
          requiresHumanApprovalFor: [],
          sandboxMode: "read-only",
        },
        title: "Review spend posture for acme",
        type: "discovery",
      },
      status: "queued",
      title: "Review spend posture for acme",
      type: "discovery",
      updatedAt: "2026-03-20T03:00:00.000Z",
    },
    proofBundle: {
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["discovery_answer"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["discovery_answer"],
        notes: ["Discovery answer evidence is missing."],
      },
      freshnessState: null,
      freshnessSummary: "",
      answerSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle: "Review spend posture for acme",
      objective:
        "Answer the stored spend posture question for acme from persisted Finance Twin and CFO Wiki state only.",
      sourceDiscoveryMissionId: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "spend_posture",
      replayEventCount: 0,
      reportDraftStatus: null,
      reportKind: null,
      reportSummary: "",
      appendixPresent: false,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      riskSummary: "",
      rollbackSummary: "",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-03-20T03:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-03-20T03:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-03-20T03:00:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildPolicyLookupDiscoveryMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-03-20T03:00:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
      objective:
        "Answer the stored policy lookup question for acme from scoped policy source only.",
      primaryRepo: null,
      sourceKind: "manual_discovery",
      sourceRef: null,
      spec: {
        acceptance: [
          "persist one durable discovery answer artifact",
          "persist one finance-ready proof bundle",
        ],
        constraints: {
          allowedPaths: [],
          mustNot: [
            "do not invoke the codex runtime",
            "do not widen beyond the explicit policySourceId scope",
          ],
        },
        deliverables: ["discovery_answer", "proof_bundle"],
        evidenceRequirements: [
          "scoped policy page",
          "same-source digest history when useful",
          "freshness and limitation posture",
        ],
        input: {
          discoveryQuestion: {
            companyKey: "acme",
            operatorPrompt: "Which approval thresholds apply to travel spend?",
            policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            questionKind: "policy_lookup",
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
        title:
          "Review policy lookup for acme from aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        type: "discovery",
      },
      status: "queued",
      title:
        "Review policy lookup for acme from aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      type: "discovery",
      updatedAt: "2026-03-20T03:00:00.000Z",
    },
    proofBundle: {
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["discovery_answer"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["discovery_answer"],
        notes: ["Discovery answer evidence is missing."],
      },
      freshnessState: null,
      freshnessSummary: "",
      answerSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle:
        "Review policy lookup for acme from aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      objective:
        "Answer the stored policy lookup question for acme from scoped policy source only.",
      sourceDiscoveryMissionId: null,
      policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "policy_lookup",
      replayEventCount: 0,
      reportDraftStatus: null,
      reportKind: null,
      reportSummary: "",
      appendixPresent: false,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      riskSummary: "",
      rollbackSummary: "",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-03-20T03:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-03-20T03:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-03-20T03:00:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildReportingMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-04-18T10:00:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
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
            sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
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
      status: "queued",
      title: "Draft finance memo for acme payables pressure",
      type: "reporting",
      updatedAt: "2026-04-18T10:00:00.000Z",
    },
    proofBundle: {
      answerSummary: "",
      appendixPresent: false,
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["finance_memo", "evidence_appendix"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["finance_memo", "evidence_appendix"],
        notes: [
          "Finance memo evidence is missing.",
          "Evidence appendix is missing.",
        ],
      },
      freshnessState: null,
      freshnessSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle: "Draft finance memo for acme payables pressure",
      objective:
        "Compile one draft finance memo from the stored payables pressure evidence for acme.",
      policySourceId: null,
      policySourceScope: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "payables_pressure",
      replayEventCount: 0,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      reportDraftStatus: "draft_only",
      reportKind: "finance_memo",
      reportSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-04-18T10:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-04-18T10:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-04-18T10:00:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildBoardPacketMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-04-19T10:00:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
      objective:
        "Compile one draft board packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
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
            questionKind: "payables_pressure",
            reportKind: "board_packet",
            sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
        },
        objective:
          "Compile one draft board packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
        repos: [],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 1,
          maxWallClockMinutes: 5,
          requiresHumanApprovalFor: [],
          sandboxMode: "read-only",
        },
        title: "Draft board packet for acme from payables pressure reporting",
        type: "reporting",
      },
      status: "queued",
      title: "Draft board packet for acme from payables pressure reporting",
      type: "reporting",
      updatedAt: "2026-04-19T10:00:00.000Z",
    },
    proofBundle: {
      answerSummary: "",
      appendixPresent: true,
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["board_packet"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["board_packet"],
        notes: ["Draft board packet evidence is missing."],
      },
      freshnessState: null,
      freshnessSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle:
        "Draft board packet for acme from payables pressure reporting",
      objective:
        "Compile one draft board packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
      policySourceId: null,
      policySourceScope: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "payables_pressure",
      replayEventCount: 0,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      reportDraftStatus: "draft_only",
      reportKind: "board_packet",
      reportPublication: null,
      reportSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-04-19T10:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-04-19T10:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-04-19T10:00:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildLenderUpdateMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-04-19T10:30:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
      objective:
        "Compile one draft lender update from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
      primaryRepo: null,
      sourceKind: "manual_reporting",
      sourceRef: null,
      spec: {
        acceptance: ["persist one draft lender_update artifact"],
        constraints: {
          allowedPaths: [],
          mustNot: [
            "do not invoke the codex runtime",
            "do not read generic chat text or freeform lender-update prompts",
            "do not invent or restate finance facts beyond stored reporting evidence",
            "do not hide stale, partial, missing, or conflicting stored evidence",
            "do not add approval workflow, release workflow, diligence packets, PDF export, or slide export",
          ],
        },
        deliverables: ["lender_update", "proof_bundle"],
        evidenceRequirements: [
          "stored finance_memo artifact",
          "stored evidence_appendix artifact",
          "stored source reporting proof bundle",
          "stored related route paths and related CFO Wiki page keys",
          "stored freshness posture and visible limitations",
        ],
        input: {
          reportingRequest: {
            companyKey: "acme",
            policySourceId: null,
            policySourceScope: null,
            questionKind: "payables_pressure",
            reportKind: "lender_update",
            sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
        },
        objective:
          "Compile one draft lender update from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
        repos: [],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 1,
          maxWallClockMinutes: 5,
          requiresHumanApprovalFor: [],
          sandboxMode: "read-only",
        },
        title: "Draft lender update for acme from payables pressure reporting",
        type: "reporting",
      },
      status: "queued",
      title: "Draft lender update for acme from payables pressure reporting",
      type: "reporting",
      updatedAt: "2026-04-19T10:30:00.000Z",
    },
    proofBundle: {
      answerSummary: "",
      appendixPresent: true,
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["lender_update"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["lender_update"],
        notes: ["Draft lender update evidence is missing."],
      },
      freshnessState: null,
      freshnessSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle:
        "Draft lender update for acme from payables pressure reporting",
      objective:
        "Compile one draft lender update from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
      policySourceId: null,
      policySourceScope: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "payables_pressure",
      replayEventCount: 0,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      reportDraftStatus: "draft_only",
      reportKind: "lender_update",
      reportPublication: null,
      reportSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-04-19T10:30:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-04-19T10:30:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-04-19T10:30:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildDiligencePacketMissionCreatePayload() {
  return {
    mission: {
      createdAt: "2026-04-19T11:00:00.000Z",
      createdBy: "Local web operator",
      id: missionId,
      objective:
        "Compile one draft diligence packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
      primaryRepo: null,
      sourceKind: "manual_reporting",
      sourceRef: null,
      spec: {
        acceptance: ["persist one draft diligence_packet artifact"],
        constraints: {
          allowedPaths: [],
          mustNot: [
            "do not invoke the codex runtime",
            "do not read generic chat text or freeform diligence-packet prompts",
            "do not invent or restate finance facts beyond stored reporting evidence",
            "do not hide stale, partial, missing, or conflicting stored evidence",
            "do not add approval workflow, release workflow, filing, export, PDF export, or slide export",
          ],
        },
        deliverables: ["diligence_packet", "proof_bundle"],
        evidenceRequirements: [
          "stored finance_memo artifact",
          "stored evidence_appendix artifact",
          "stored source reporting proof bundle",
          "stored related route paths and related CFO Wiki page keys",
          "stored freshness posture and visible limitations",
        ],
        input: {
          reportingRequest: {
            companyKey: "acme",
            policySourceId: null,
            policySourceScope: null,
            questionKind: "payables_pressure",
            reportKind: "diligence_packet",
            sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          },
        },
        objective:
          "Compile one draft diligence packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
        repos: [],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 1,
          maxWallClockMinutes: 5,
          requiresHumanApprovalFor: [],
          sandboxMode: "read-only",
        },
        title:
          "Draft diligence packet for acme from payables pressure reporting",
        type: "reporting",
      },
      status: "queued",
      title: "Draft diligence packet for acme from payables pressure reporting",
      type: "reporting",
      updatedAt: "2026-04-19T11:00:00.000Z",
    },
    proofBundle: {
      answerSummary: "",
      appendixPresent: true,
      artifactIds: [],
      artifacts: [],
      branchName: null,
      changeSummary: "",
      companyKey: "acme",
      decisionTrace: [],
      evidenceCompleteness: {
        status: "missing",
        expectedArtifactKinds: ["diligence_packet"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["diligence_packet"],
        notes: ["Draft diligence packet evidence is missing."],
      },
      freshnessState: null,
      freshnessSummary: "",
      latestApproval: null,
      limitationsSummary: "",
      missionId,
      missionTitle:
        "Draft diligence packet for acme from payables pressure reporting",
      objective:
        "Compile one draft diligence packet from completed reporting mission bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb and its stored finance memo plus evidence appendix.",
      policySourceId: null,
      policySourceScope: null,
      pullRequestNumber: null,
      pullRequestUrl: null,
      questionKind: "payables_pressure",
      replayEventCount: 0,
      relatedRoutePaths: [],
      relatedWikiPageKeys: [],
      reportDraftStatus: "draft_only",
      reportKind: "diligence_packet",
      reportPublication: null,
      reportSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      sourceDiscoveryMissionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      sourceReportingMissionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      status: "placeholder",
      targetRepoFullName: null,
      timestamps: {
        missionCreatedAt: "2026-04-19T11:00:00.000Z",
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      validationSummary: "",
      verificationSummary: "",
    },
    tasks: [
      {
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        createdAt: "2026-04-19T11:00:00.000Z",
        dependsOnTaskId: null,
        id: taskId,
        missionId,
        role: "scout",
        sequence: 0,
        status: "pending",
        summary: null,
        updatedAt: "2026-04-19T11:00:00.000Z",
        workspaceId: null,
      },
    ],
  };
}

function buildMissionListPayload() {
  return {
    filters: {
      limit: 6,
      sourceKind: "github_issue",
      status: "queued",
    },
    missions: [
      {
        appendixPresent: false,
        answerSummary: null,
        companyKey: null,
        createdAt: "2026-03-14T10:00:00.000Z",
        freshnessState: null,
        id: missionId,
        latestTask: {
          id: taskId,
          role: "executor",
          sequence: 1,
          status: "running",
          updatedAt: "2026-03-14T10:05:00.000Z",
        },
        objectiveExcerpt: "Ship passkeys without breaking email login.",
        pendingApprovalCount: 1,
        policySourceId: null,
        policySourceScope: null,
        primaryRepo: "web",
        proofBundleStatus: "incomplete",
        pullRequestNumber: 19,
        pullRequestUrl: "https://github.com/acme/web/pull/19",
        questionKind: null,
        reportDraftStatus: null,
        reportKind: null,
        reportSummary: null,
        sourceKind: "github_issue",
        sourceDiscoveryMissionId: null,
        sourceRef: "https://github.com/acme/web/issues/19",
        status: "queued",
        title: "Implement passkeys for sign-in",
        updatedAt: "2026-03-14T10:05:00.000Z",
      },
      {
        appendixPresent: false,
        answerSummary: null,
        companyKey: null,
        createdAt: "2026-03-13T09:00:00.000Z",
        freshnessState: null,
        id: "44444444-4444-4444-8444-444444444444",
        latestTask: null,
        objectiveExcerpt: "Draft the rollback notes for a staged release.",
        pendingApprovalCount: 0,
        policySourceId: null,
        policySourceScope: null,
        primaryRepo: "ops",
        proofBundleStatus: "placeholder",
        pullRequestNumber: null,
        pullRequestUrl: null,
        questionKind: null,
        reportDraftStatus: null,
        reportKind: null,
        reportSummary: null,
        sourceKind: "github_issue",
        sourceDiscoveryMissionId: null,
        sourceRef: null,
        status: "queued",
        title: "Prepare rollback notes",
        updatedAt: "2026-03-13T09:00:00.000Z",
      },
    ],
  };
}

function buildSourceListPayload() {
  return {
    limit: 5,
    sourceCount: 1,
    sources: [
      {
        createdAt: "2026-04-09T10:00:00.000Z",
        createdBy: "finance-operator",
        description: "Board package imported from the investor portal.",
        id: missionId,
        kind: "document",
        latestSnapshot: {
          capturedAt: "2026-04-09T10:10:00.000Z",
          checksumSha256:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          createdAt: "2026-04-09T10:10:00.000Z",
          id: taskId,
          ingestErrorSummary: null,
          ingestStatus: "ready",
          mediaType: "application/pdf",
          originalFileName: "board-pack.pdf",
          sizeBytes: 4096,
          sourceId: missionId,
          storageKind: "object_store",
          storageRef: "sources/board-pack.pdf",
          updatedAt: "2026-04-09T10:11:00.000Z",
          version: 2,
        },
        name: "Board package",
        originKind: "manual",
        snapshotCount: 2,
        updatedAt: "2026-04-09T10:11:00.000Z",
      },
    ],
  };
}

function buildSourceDetailPayload() {
  return {
    source: {
      createdAt: "2026-04-09T10:00:00.000Z",
      createdBy: "finance-operator",
      description: "Board package imported from the investor portal.",
      id: missionId,
      kind: "document",
      name: "Board package",
      originKind: "manual",
      updatedAt: "2026-04-09T10:11:00.000Z",
    },
    snapshots: [
      {
        capturedAt: "2026-04-09T10:10:00.000Z",
        checksumSha256:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        createdAt: "2026-04-09T10:10:00.000Z",
        id: taskId,
        ingestErrorSummary: null,
        ingestStatus: "ready",
        mediaType: "application/pdf",
        originalFileName: "board-pack.pdf",
        sizeBytes: 4096,
        sourceId: missionId,
        storageKind: "object_store",
        storageRef: "sources/board-pack.pdf",
        updatedAt: "2026-04-09T10:11:00.000Z",
        version: 2,
      },
    ],
  };
}

function buildSourceFileListPayload() {
  return {
    fileCount: 1,
    sourceId: taskId,
    files: [
      {
        capturedAt: "2026-04-09T10:20:00.000Z",
        checksumSha256:
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        createdAt: "2026-04-09T10:20:00.000Z",
        createdBy: "finance-operator",
        id: approvalId,
        mediaType: "text/csv",
        originalFileName: "board-pack.csv",
        sizeBytes: 512,
        snapshotVersion: 3,
        sourceId: taskId,
        sourceSnapshotId: missionId,
        storageKind: "object_store",
        storageRef: "sources/board-pack.csv",
      },
    ],
  };
}

function buildSourceFileDetailPayload() {
  return {
    provenanceRecords: [
      {
        id: "55555555-5555-4555-8555-555555555555",
        kind: "source_file_registered",
        recordedAt: "2026-04-09T10:20:00.000Z",
        recordedBy: "finance-operator",
        sourceFileId: approvalId,
        sourceId: missionId,
        sourceSnapshotId: taskId,
      },
    ],
    snapshot: {
      capturedAt: "2026-04-09T10:20:00.000Z",
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      createdAt: "2026-04-09T10:20:00.000Z",
      id: taskId,
      ingestErrorSummary: null,
      ingestStatus: "registered",
      mediaType: "text/csv",
      originalFileName: "board-pack.csv",
      sizeBytes: 512,
      sourceId: missionId,
      storageKind: "object_store",
      storageRef: "sources/board-pack.csv",
      updatedAt: "2026-04-09T10:20:00.000Z",
      version: 3,
    },
    sourceFile: {
      capturedAt: "2026-04-09T10:20:00.000Z",
      checksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      createdAt: "2026-04-09T10:20:00.000Z",
      createdBy: "finance-operator",
      id: approvalId,
      mediaType: "text/csv",
      originalFileName: "board-pack.csv",
      sizeBytes: 512,
      sourceId: missionId,
      sourceSnapshotId: taskId,
      storageKind: "object_store",
      storageRef: "sources/board-pack.csv",
    },
  };
}

function buildSourceIngestRunListPayload() {
  return {
    ingestRuns: [buildSourceIngestRunDetailPayload().ingestRun],
    runCount: 1,
    sourceFileId: approvalId,
  };
}

function buildSourceIngestRunDetailPayload() {
  return {
    ingestRun: {
      completedAt: "2026-04-09T10:25:00.000Z",
      createdAt: "2026-04-09T10:25:00.000Z",
      errorCount: 0,
      errors: [],
      id: "44444444-4444-4444-8444-444444444444",
      inputChecksumSha256:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      parserSelection: {
        fileExtension: ".csv",
        matchedBy: "file_extension",
        mediaType: "text/csv",
        parserKey: "csv_tabular",
        sourceKind: "document",
      },
      receiptSummary: {
        kind: "csv_tabular",
        columnCount: 2,
        header: ["month", "cash"],
        rowCount: 3,
        sampleRows: [["Jan", "100"]],
      },
      sourceFileId: approvalId,
      sourceId: missionId,
      sourceSnapshotId: taskId,
      startedAt: "2026-04-09T10:24:00.000Z",
      status: "ready",
      storageKind: "object_store",
      storageRef: "sources/board-pack.csv",
      updatedAt: "2026-04-09T10:25:00.000Z",
      warningCount: 0,
      warnings: [],
    },
  };
}

function buildGitHubIssueIntakePayload() {
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
        isBound: false,
        boundMissionId: null,
        boundMissionStatus: null,
      },
      {
        deliveryId: "delivery-issue-43",
        repoFullName: "acme/ops",
        issueNumber: 43,
        issueTitle: "Already bound issue",
        issueState: "open",
        senderLogin: "octo-reviewer",
        sourceRef: "https://github.com/acme/ops/issues/43",
        receivedAt: "2026-03-16T01:50:00.000Z",
        commentCount: 0,
        hasCommentActivity: false,
        isBound: true,
        boundMissionId: missionId,
        boundMissionStatus: "queued",
      },
    ],
  };
}

function buildMonitorLatestPayload() {
  const monitorResult = buildMonitorResultPayload();

  return {
    companyKey: "acme",
    monitorKind: "cash_posture",
    monitorResult,
    alertCard: monitorResult.alertCard,
  };
}

function buildMonitorResultPayload() {
  const createdAt = "2026-04-26T12:00:00.000Z";
  const sourceFreshnessPosture = {
    state: "missing",
    latestAttemptedSyncRunId: null,
    latestSuccessfulSyncRunId: null,
    latestSuccessfulSource: null,
    missingSource: true,
    failedSource: false,
    summary: "No successful bank-account-summary source is stored.",
  };
  const proofBundlePosture = {
    state: "limited_by_missing_source",
    summary:
      "The monitor proof is limited because no bank-account-summary source backs the cash posture.",
  };

  return {
    id: "11111111-1111-4111-8111-111111111111",
    companyId: "22222222-2222-4222-8222-222222222222",
    companyKey: "acme",
    monitorKind: "cash_posture",
    runKey: "operator-run-1",
    triggeredBy: "finance-operator",
    status: "alert",
    severity: "critical",
    conditions: [
      {
        kind: "missing_source",
        severity: "critical",
        summary: "No successful bank-account-summary slice exists yet.",
        evidencePath: "freshness.state",
      },
    ],
    sourceFreshnessPosture,
    sourceLineageRefs: [],
    deterministicSeverityRationale:
      "Critical because stored cash-posture conditions include missing_source.",
    limitations: [
      "F6A cash-posture monitoring evaluates stored source posture only.",
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
        "Critical because stored cash-posture conditions include missing_source.",
      conditionSummaries: [
        "No successful bank-account-summary slice exists yet.",
      ],
      sourceFreshnessPosture,
      sourceLineageSummary:
        "No bank-account-summary source lineage is available.",
      limitations: [
        "F6A cash-posture monitoring evaluates stored source posture only.",
      ],
      proofBundlePosture,
      humanReviewNextStep:
        "Review cash-posture source coverage and refresh bank-account-summary ingest if needed.",
      createdAt,
    },
    createdAt,
  };
}

function buildGitHubIssueMissionCreatePayload() {
  return {
    outcome: "created",
    mission: {
      createdAt: "2026-03-16T01:56:00.000Z",
      createdBy: "octo-operator",
      id: missionId,
      objective:
        "Ship issue intake\n\nTurn the stored issue envelope into a mission.",
      primaryRepo: "acme/web",
      sourceKind: "github_issue",
      sourceRef: "https://github.com/acme/web/issues/42",
      spec: {
        acceptance: ["produce a plan"],
        constraints: {
          allowedPaths: [],
          mustNot: [],
        },
        deliverables: ["plan", "proof_bundle"],
        evidenceRequirements: ["test report"],
        objective:
          "Ship issue intake\n\nTurn the stored issue envelope into a mission.",
        repos: ["acme/web"],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 10,
          maxWallClockMinutes: 60,
          requiresHumanApprovalFor: ["merge"],
          sandboxMode: "patch-only",
        },
        title: "Ship issue intake",
        type: "build",
      },
      status: "queued",
      title: "Ship issue intake",
      type: "build",
      updatedAt: "2026-03-16T01:56:00.000Z",
    },
    binding: {
      issueId: "700",
      issueNodeId: "I_kwDOIssue700",
      latestSourceDeliveryId: "delivery-issue-42",
      missionId,
      repoFullName: "acme/web",
      issueNumber: 42,
      sourceRef: "https://github.com/acme/web/issues/42",
    },
  };
}
