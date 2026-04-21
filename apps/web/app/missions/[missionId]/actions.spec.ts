import { afterEach, describe, expect, it, vi } from "vitest";

const createReportingMission = vi.fn();
const createBoardPacketMission = vi.fn();
const createDiligencePacketMission = vi.fn();
const createLenderUpdateMission = vi.fn();
const exportReportingMissionMarkdown = vi.fn();
const fileReportingMissionArtifacts = vi.fn();
const revalidatePath = vi.fn();
const redirect = vi.fn();
const resolveMissionApproval = vi.fn();
const interruptMissionTask = vi.fn();
const requestReportingReleaseApproval = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("../../../lib/api", () => ({
  createBoardPacketMission,
  createDiligencePacketMission,
  createLenderUpdateMission,
  createReportingMission,
  exportReportingMissionMarkdown,
  fileReportingMissionArtifacts,
  interruptMissionTask,
  requestReportingReleaseApproval,
  resolveMissionApproval,
}));

const missionId = "11111111-1111-4111-8111-111111111111";
const approvalId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";

describe("mission server actions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns success feedback and revalidates after approval resolution", async () => {
    resolveMissionApproval.mockResolvedValue({
      ok: true,
      statusCode: 200,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitApprovalResolution(
      null,
      buildApprovalFormData({
        decision: "accept",
        resolvedBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "resolve_approval",
      message: "Approval accepted by Alicia. Mission detail refreshed.",
      statusCode: 200,
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/missions/${missionId}`);
  });

  it("returns success feedback and revalidates after an interrupt request", async () => {
    interruptMissionTask.mockResolvedValue({
      ok: true,
      statusCode: 200,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitTaskInterrupt(
      null,
      buildInterruptFormData({
        requestedBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "interrupt_task",
      message: "Interrupt requested by Alicia. Mission detail refreshed.",
      statusCode: 200,
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/missions/${missionId}`);
  });

  it("returns typed failure feedback instead of throwing on normal route failures", async () => {
    resolveMissionApproval.mockResolvedValue({
      ok: false,
      statusCode: 501,
      errorCode: "live_control_unavailable",
      message: "Live approval and interrupt control is unavailable in this process",
    });

    const mod = await import("./actions");
    const result = await mod.submitApprovalResolution(
      null,
      buildApprovalFormData({
        decision: "accept",
        resolvedBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: false,
      kind: "resolve_approval",
      message:
        "Live control is unavailable in this process. Run `pnpm dev:embedded` to enable approval resolution and task interrupts.",
      statusCode: 501,
      errorCode: "live_control_unavailable",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("creates a reporting mission, revalidates mission surfaces, and redirects to detail", async () => {
    createReportingMission.mockResolvedValue({
      mission: {
        id: "44444444-4444-4444-8444-444444444444",
      },
    });

    const mod = await import("./actions");
    await mod.submitCreateDraftFinanceMemo(
      buildCreateDraftFinanceMemoFormData({
        requestedBy: "Alicia",
      }),
    );

    expect(createReportingMission).toHaveBeenCalledWith({
      requestedBy: "Alicia",
      reportKind: "finance_memo",
      sourceDiscoveryMissionId: missionId,
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
    expect(redirect).toHaveBeenCalledWith(
      "/missions/44444444-4444-4444-8444-444444444444",
    );
  });

  it("creates a board-packet mission, revalidates mission surfaces, and redirects to detail", async () => {
    createBoardPacketMission.mockResolvedValue({
      mission: {
        id: "55555555-5555-4555-8555-555555555555",
      },
    });

    const mod = await import("./actions");
    await mod.submitCreateDraftBoardPacket(
      buildCreateDraftBoardPacketFormData({
        requestedBy: "Alicia",
      }),
    );

    expect(createBoardPacketMission).toHaveBeenCalledWith({
      requestedBy: "Alicia",
      sourceReportingMissionId: missionId,
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
    expect(redirect).toHaveBeenCalledWith(
      "/missions/55555555-5555-4555-8555-555555555555",
    );
  });

  it("creates a diligence-packet mission, revalidates mission surfaces, and redirects to detail", async () => {
    createDiligencePacketMission.mockResolvedValue({
      mission: {
        id: "66666666-6666-4666-8666-666666666666",
      },
    });

    const mod = await import("./actions");
    await mod.submitCreateDraftDiligencePacket(
      buildCreateDraftDiligencePacketFormData({
        requestedBy: "Alicia",
      }),
    );

    expect(createDiligencePacketMission).toHaveBeenCalledWith({
      requestedBy: "Alicia",
      sourceReportingMissionId: missionId,
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
    expect(redirect).toHaveBeenCalledWith(
      "/missions/66666666-6666-4666-8666-666666666666",
    );
  });

  it("files reporting artifacts, revalidates mission surfaces, and returns success feedback", async () => {
    fileReportingMissionArtifacts.mockResolvedValue({
      ok: true,
      statusCode: 201,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitFileReportingMissionArtifacts(
      null,
      buildFileReportingArtifactsFormData({
        filedBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "file_reporting_artifacts",
      message:
        "Draft memo and evidence appendix filed by Alicia. Mission detail refreshed.",
      statusCode: 201,
    });
    expect(fileReportingMissionArtifacts).toHaveBeenCalledWith({
      filedBy: "Alicia",
      missionId,
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
  });

  it("exports reporting markdown, revalidates mission surfaces, and returns success feedback", async () => {
    exportReportingMissionMarkdown.mockResolvedValue({
      ok: true,
      statusCode: 201,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitExportReportingMissionMarkdown(
      null,
      buildExportReportingMissionMarkdownFormData({
        triggeredBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "export_reporting_markdown",
      message: "Markdown bundle exported by Alicia. Mission detail refreshed.",
      statusCode: 201,
    });
    expect(exportReportingMissionMarkdown).toHaveBeenCalledWith({
      missionId,
      triggeredBy: "Alicia",
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
  });

  it("requests lender-update release approval, revalidates mission surfaces, and returns success feedback", async () => {
    requestReportingReleaseApproval.mockResolvedValue({
      ok: true,
      statusCode: 201,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitRequestReportingReleaseApproval(
      null,
      buildRequestReportingReleaseApprovalFormData({
        requestedBy: "Alicia",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "request_reporting_release_approval",
      message:
        "Lender update release approval requested by Alicia. Mission detail refreshed.",
      statusCode: 201,
    });
    expect(requestReportingReleaseApproval).toHaveBeenCalledWith({
      missionId,
      requestedBy: "Alicia",
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(revalidatePath).toHaveBeenNthCalledWith(3, `/missions/${missionId}`);
  });

  it("requests diligence-packet release approval and returns report-kind-specific feedback", async () => {
    requestReportingReleaseApproval.mockResolvedValue({
      ok: true,
      statusCode: 201,
      data: {},
    });

    const mod = await import("./actions");
    const result = await mod.submitRequestReportingReleaseApproval(
      null,
      buildRequestReportingReleaseApprovalFormData({
        requestedBy: "Alicia",
        reportKind: "diligence_packet",
      }),
    );

    expect(result).toEqual({
      ok: true,
      kind: "request_reporting_release_approval",
      message:
        "Diligence packet release approval requested by Alicia. Mission detail refreshed.",
      statusCode: 201,
    });
    expect(requestReportingReleaseApproval).toHaveBeenCalledWith({
      missionId,
      requestedBy: "Alicia",
    });
  });
});

function buildApprovalFormData(input: {
  decision: "accept" | "decline";
  resolvedBy: string;
}) {
  const formData = new FormData();
  formData.set("approvalId", approvalId);
  formData.set("decision", input.decision);
  formData.set("missionId", missionId);
  formData.set("resolvedBy", input.resolvedBy);
  return formData;
}

function buildInterruptFormData(input: { requestedBy: string }) {
  const formData = new FormData();
  formData.set("missionId", missionId);
  formData.set("requestedBy", input.requestedBy);
  formData.set("taskId", taskId);
  return formData;
}

function buildCreateDraftFinanceMemoFormData(input: { requestedBy: string }) {
  const formData = new FormData();
  formData.set("requestedBy", input.requestedBy);
  formData.set("sourceDiscoveryMissionId", missionId);
  return formData;
}

function buildCreateDraftBoardPacketFormData(input: { requestedBy: string }) {
  const formData = new FormData();
  formData.set("requestedBy", input.requestedBy);
  formData.set("sourceReportingMissionId", missionId);
  return formData;
}

function buildCreateDraftDiligencePacketFormData(input: {
  requestedBy: string;
}) {
  const formData = new FormData();
  formData.set("requestedBy", input.requestedBy);
  formData.set("sourceReportingMissionId", missionId);
  return formData;
}

function buildExportReportingMissionMarkdownFormData(input: {
  triggeredBy: string;
}) {
  const formData = new FormData();
  formData.set("missionId", missionId);
  formData.set("triggeredBy", input.triggeredBy);
  return formData;
}

function buildFileReportingArtifactsFormData(input: { filedBy: string }) {
  const formData = new FormData();
  formData.set("missionId", missionId);
  formData.set("filedBy", input.filedBy);
  return formData;
}

function buildRequestReportingReleaseApprovalFormData(input: {
  requestedBy: string;
  reportKind?: "lender_update" | "diligence_packet";
}) {
  const formData = new FormData();
  formData.set("missionId", missionId);
  formData.set("requestedBy", input.requestedBy);
  if (input.reportKind) {
    formData.set("reportKind", input.reportKind);
  }
  return formData;
}
