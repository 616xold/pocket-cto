import { afterEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const resolveMissionApproval = vi.fn();
const interruptMissionTask = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("../../../lib/api", () => ({
  interruptMissionTask,
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
