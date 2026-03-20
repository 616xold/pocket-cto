import { afterEach, describe, expect, it, vi } from "vitest";

const createDiscoveryMission = vi.fn();
const createMissionFromText = vi.fn();
const createMissionFromGitHubIssueDelivery = vi.fn();
const redirect = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("../../lib/api", () => ({
  createDiscoveryMission,
  createMissionFromGitHubIssueDelivery,
  createMissionFromText,
}));

const missionId = "11111111-1111-4111-8111-111111111111";

describe("mission intake server action", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a mission from text, revalidates list surfaces, and redirects to detail", async () => {
    createMissionFromText.mockResolvedValue({
      mission: {
        id: missionId,
      },
    });

    const mod = await import("./actions");
    await mod.submitMissionTextIntake(buildFormData());

    expect(createMissionFromText).toHaveBeenCalledWith({
      requestedBy: "Local web operator",
      text: "Implement passkeys without breaking email login.",
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(redirect).toHaveBeenCalledWith(`/missions/${missionId}`);
  });

  it("creates a discovery mission, revalidates list surfaces, and redirects to detail", async () => {
    createDiscoveryMission.mockResolvedValue({
      mission: {
        id: missionId,
      },
    });

    const mod = await import("./actions");
    await mod.submitDiscoveryMissionIntake(buildDiscoveryFormData());

    expect(createDiscoveryMission).toHaveBeenCalledWith({
      repoFullName: "616xold/pocket-cto",
      questionKind: "auth_change",
      changedPaths: [
        "apps/control-plane/src/modules/github-app/auth.ts",
        "packages/domain/src/twin.ts",
      ],
      requestedBy: "Local web operator",
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(redirect).toHaveBeenCalledWith(`/missions/${missionId}`);
  });

  it("creates a mission from a GitHub issue delivery, revalidates list surfaces, and redirects to detail", async () => {
    createMissionFromGitHubIssueDelivery.mockResolvedValue({
      mission: {
        id: missionId,
      },
      outcome: "created",
    });

    const mod = await import("./actions");
    await mod.submitGitHubIssueMissionCreate(buildIssueFormData());

    expect(createMissionFromGitHubIssueDelivery).toHaveBeenCalledWith({
      deliveryId: "delivery-issue-42",
    });
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/missions");
    expect(redirect).toHaveBeenCalledWith(`/missions/${missionId}`);
  });
});

function buildFormData() {
  const formData = new FormData();
  formData.set("requestedBy", "Local web operator");
  formData.set("text", "Implement passkeys without breaking email login.");
  return formData;
}

function buildIssueFormData() {
  const formData = new FormData();
  formData.set("deliveryId", "delivery-issue-42");
  return formData;
}

function buildDiscoveryFormData() {
  const formData = new FormData();
  formData.set("repoFullName", "616xold/pocket-cto");
  formData.set("questionKind", "auth_change");
  formData.set(
    "changedPaths",
    "apps/control-plane/src/modules/github-app/auth.ts\npackages/domain/src/twin.ts",
  );
  formData.set("requestedBy", "Local web operator");
  return formData;
}
