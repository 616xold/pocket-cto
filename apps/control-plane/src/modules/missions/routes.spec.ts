import { afterEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app";
import { createInMemoryContainer } from "../../bootstrap";
import type { AppContainer } from "../../lib/types";

describe("mission reporting action routes", () => {
  const apps: FastifyInstance[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("POST /missions/reporting/board-packets defaults requestedBy and returns 201", async () => {
    const createBoardPacket = vi.fn(async () => ({
      mission: {
        id: "33333333-3333-4333-8333-333333333333",
      },
    }));
    const app = await createTestApp(apps, {
      createBoardPacket:
        createBoardPacket as unknown as AppContainer["missionService"]["createBoardPacket"],
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/reporting/board-packets",
      payload: {
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(createBoardPacket).toHaveBeenCalledWith({
      requestedBy: "operator",
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("POST /missions/reporting/lender-updates defaults requestedBy and returns 201", async () => {
    const createLenderUpdate = vi.fn(async () => ({
      mission: {
        id: "44444444-4444-4444-8444-444444444444",
      },
    }));
    const app = await createTestApp(apps, {
      createLenderUpdate:
        createLenderUpdate as unknown as AppContainer["missionService"]["createLenderUpdate"],
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/reporting/lender-updates",
      payload: {
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(createLenderUpdate).toHaveBeenCalledWith({
      requestedBy: "operator",
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("POST /missions/reporting/diligence-packets defaults requestedBy and returns 201", async () => {
    const createDiligencePacket = vi.fn(async () => ({
      mission: {
        id: "55555555-5555-4555-8555-555555555555",
      },
    }));
    const app = await createTestApp(apps, {
      createDiligencePacket:
        createDiligencePacket as unknown as AppContainer["missionService"]["createDiligencePacket"],
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/reporting/diligence-packets",
      payload: {
        sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(createDiligencePacket).toHaveBeenCalledWith({
      requestedBy: "operator",
      sourceReportingMissionId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("POST /missions/:missionId/reporting/filed-artifacts defaults filedBy and returns 201", async () => {
    const fileDraftArtifacts = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      publication: {
        storedDraft: true,
        filedMemo: null,
        filedEvidenceAppendix: null,
        latestMarkdownExport: null,
        summary:
          "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. No markdown export run has been recorded yet.",
      },
    }));
    const app = await createTestApp(apps, {
      fileDraftArtifacts,
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/11111111-1111-4111-8111-111111111111/reporting/filed-artifacts",
      payload: {},
    });

    expect(response.statusCode).toBe(201);
    expect(fileDraftArtifacts).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        filedBy: "operator",
      },
    );
  });

  it("POST /missions/:missionId/reporting/export defaults triggeredBy and returns 201", async () => {
    const exportMarkdownBundle = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      companyKey: "acme",
      publication: {
        storedDraft: true,
        filedMemo: null,
        filedEvidenceAppendix: null,
        latestMarkdownExport: {
          exportRunId: "22222222-2222-4222-8222-222222222222",
          status: "succeeded" as const,
          completedAt: "2026-04-18T13:06:00.000Z",
          includesLatestFiledArtifacts: true,
        },
        summary:
          "Draft memo and evidence appendix are stored. Neither draft artifact has been filed into the CFO Wiki yet. Markdown export run 22222222-2222-4222-8222-222222222222 includes the latest filed report pages.",
      },
    }));
    const app = await createTestApp(apps, {
      exportMarkdownBundle,
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/11111111-1111-4111-8111-111111111111/reporting/export",
      payload: {},
    });

    expect(response.statusCode).toBe(201);
    expect(exportMarkdownBundle).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        triggeredBy: "operator",
      },
    );
  });

  it("POST /missions/:missionId/reporting/release-approval defaults requestedBy and returns 201", async () => {
    const requestReleaseApproval = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      approvalId: "22222222-2222-4222-8222-222222222222",
      created: true,
      approvalStatus: "pending" as const,
      releaseApprovalStatus: "pending_review" as const,
      releaseReady: false,
    }));
    const app = await createTestApp(apps, {
      requestReleaseApproval,
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/11111111-1111-4111-8111-111111111111/reporting/release-approval",
      payload: {},
    });

    expect(response.statusCode).toBe(201);
    expect(requestReleaseApproval).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        requestedBy: "operator",
      },
    );
  });

  it("POST /missions/:missionId/reporting/circulation-approval defaults requestedBy and returns 201", async () => {
    const requestCirculationApproval = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      approvalId: "22222222-2222-4222-8222-222222222222",
      created: true,
      approvalStatus: "pending" as const,
      circulationApprovalStatus: "pending_review" as const,
      circulationReady: false,
    }));
    const app = await createTestApp(apps, {
      requestCirculationApproval,
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/11111111-1111-4111-8111-111111111111/reporting/circulation-approval",
      payload: {},
    });

    expect(response.statusCode).toBe(201);
    expect(requestCirculationApproval).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        requestedBy: "operator",
      },
    );
  });

  it("POST /missions/:missionId/reporting/release-log returns 201 with the supplied release details", async () => {
    const recordReleaseLog = vi.fn(async () => ({
      missionId: "11111111-1111-4111-8111-111111111111",
      approvalId: "22222222-2222-4222-8222-222222222222",
      created: true,
      releaseRecord: {
        released: true,
        releasedAt: "2026-04-20T09:10:00.000Z",
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        approvalId: "22222222-2222-4222-8222-222222222222",
        summary:
          "External release was logged by finance-operator at 2026-04-20T09:10:00.000Z via email. Release note: Sent from treasury mailbox after approval..",
      },
    }));
    const app = await createTestApp(apps, {
      recordReleaseLog,
    });

    const response = await app.inject({
      method: "POST",
      url: "/missions/11111111-1111-4111-8111-111111111111/reporting/release-log",
      payload: {
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(recordReleaseLog).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        releasedBy: "finance-operator",
        releaseChannel: "email",
        releaseNote: "Sent from treasury mailbox after approval.",
        releasedAt: null,
      },
    );
  });
});

async function createTestApp(
  apps: FastifyInstance[],
  overrides: Partial<AppContainer["missionReportingActionsService"]> &
    Partial<
      Pick<
        AppContainer["missionService"],
        "createBoardPacket" | "createDiligencePacket" | "createLenderUpdate"
      >
    >,
) {
  const container = createInMemoryContainer();

  if (overrides.createBoardPacket) {
    container.missionService.createBoardPacket = overrides.createBoardPacket;
  }

  if (overrides.createLenderUpdate) {
    container.missionService.createLenderUpdate = overrides.createLenderUpdate;
  }

  if (overrides.createDiligencePacket) {
    container.missionService.createDiligencePacket =
      overrides.createDiligencePacket;
  }

  if (overrides.exportMarkdownBundle) {
    container.missionReportingActionsService.exportMarkdownBundle =
      overrides.exportMarkdownBundle;
  }

  if (overrides.fileDraftArtifacts) {
    container.missionReportingActionsService.fileDraftArtifacts =
      overrides.fileDraftArtifacts;
  }

  if (overrides.requestCirculationApproval) {
    container.missionReportingActionsService.requestCirculationApproval =
      overrides.requestCirculationApproval;
  }

  if (overrides.requestReleaseApproval) {
    container.missionReportingActionsService.requestReleaseApproval =
      overrides.requestReleaseApproval;
  }

  if (overrides.recordReleaseLog) {
    container.missionReportingActionsService.recordReleaseLog =
      overrides.recordReleaseLog;
  }

  const app = await buildApp({ container });
  apps.push(app);
  return app;
}
