"use server";

import { CreateDiscoveryMissionInputSchema } from "@pocket-cto/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createDiscoveryMission,
  createMissionFromGitHubIssueDelivery,
  createMissionFromText,
} from "../../lib/api";

const missionTextIntakeSchema = z.object({
  requestedBy: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

const githubIssueMissionCreateSchema = z.object({
  deliveryId: z.string().trim().min(1),
});

const discoveryMissionIntakeFormSchema = z.object({
  changedPaths: z.string().trim().min(1),
  questionKind: z.literal("auth_change"),
  repoFullName: z.string().trim().min(1),
  requestedBy: z.string().trim().min(1),
});

export async function submitMissionTextIntake(formData: FormData) {
  const input = missionTextIntakeSchema.parse({
    requestedBy: formData.get("requestedBy"),
    text: formData.get("text"),
  });

  const created = await createMissionFromText({
    requestedBy: input.requestedBy,
    text: input.text,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  redirect(`/missions/${created.mission.id}`);
}

export async function submitDiscoveryMissionIntake(formData: FormData) {
  const rawInput = discoveryMissionIntakeFormSchema.parse({
    changedPaths: formData.get("changedPaths"),
    questionKind: formData.get("questionKind"),
    repoFullName: formData.get("repoFullName"),
    requestedBy: formData.get("requestedBy"),
  });
  const input = CreateDiscoveryMissionInputSchema.parse({
    repoFullName: rawInput.repoFullName,
    questionKind: rawInput.questionKind,
    changedPaths: normalizeChangedPaths(rawInput.changedPaths),
    requestedBy: rawInput.requestedBy,
  });
  const created = await createDiscoveryMission(input);

  revalidatePath("/");
  revalidatePath("/missions");
  redirect(`/missions/${created.mission.id}`);
}

export async function submitGitHubIssueMissionCreate(formData: FormData) {
  const input = githubIssueMissionCreateSchema.parse({
    deliveryId: formData.get("deliveryId"),
  });
  const created = await createMissionFromGitHubIssueDelivery({
    deliveryId: input.deliveryId,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  redirect(`/missions/${created.mission.id}`);
}

function normalizeChangedPaths(value: string) {
  return [...new Set(value.split(/[\n,]/u).map((entry) => entry.trim()).filter(Boolean))];
}
