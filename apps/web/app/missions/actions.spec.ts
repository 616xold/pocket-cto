import { afterEach, describe, expect, it, vi } from "vitest";

const createAnalysisMission = vi.fn();
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
  createAnalysisMission,
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
    createAnalysisMission.mockResolvedValue({
      mission: {
        id: missionId,
      },
    });

    const mod = await import("./actions");
    await mod.submitDiscoveryMissionIntake(buildDiscoveryFormData());

    expect(createAnalysisMission).toHaveBeenCalledWith({
      companyKey: "acme",
      questionKind: "collections_pressure",
      operatorPrompt: "Review collections pressure from stored state.",
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

  it("passes explicit policy source scope through the discovery intake action", async () => {
    createAnalysisMission.mockResolvedValue({
      mission: {
        id: missionId,
      },
    });

    const mod = await import("./actions");
    await mod.submitDiscoveryMissionIntake(buildPolicyLookupDiscoveryFormData());

    expect(createAnalysisMission).toHaveBeenCalledWith({
      companyKey: "acme",
      operatorPrompt: "Which approval thresholds apply to travel spend?",
      policySourceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      questionKind: "policy_lookup",
      requestedBy: "Local web operator",
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
  formData.set("companyKey", "acme");
  formData.set("questionKind", "collections_pressure");
  formData.set("operatorPrompt", "Review collections pressure from stored state.");
  formData.set("requestedBy", "Local web operator");
  return formData;
}

function buildPolicyLookupDiscoveryFormData() {
  const formData = new FormData();
  formData.set("companyKey", "acme");
  formData.set("questionKind", "policy_lookup");
  formData.set("policySourceId", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  formData.set(
    "operatorPrompt",
    "Which approval thresholds apply to travel spend?",
  );
  formData.set("requestedBy", "Local web operator");
  return formData;
}
