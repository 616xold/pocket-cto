"use server";

import {
  CreateDiscoveryMissionInputSchema,
  FINANCE_DISCOVERY_QUESTION_KINDS,
} from "@pocket-cto/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAnalysisMission,
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
  companyKey: z.string().trim().min(1),
  operatorPrompt: z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().trim().optional(),
  ),
  policySourceId: z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().trim().optional(),
  ),
  questionKind: z.enum(FINANCE_DISCOVERY_QUESTION_KINDS),
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
    companyKey: formData.get("companyKey"),
    operatorPrompt: formData.get("operatorPrompt"),
    policySourceId: formData.get("policySourceId"),
    questionKind: formData.get("questionKind"),
    requestedBy: formData.get("requestedBy"),
  });
  const input = CreateDiscoveryMissionInputSchema.parse({
    companyKey: rawInput.companyKey,
    questionKind: rawInput.questionKind,
    operatorPrompt: rawInput.operatorPrompt?.trim() || undefined,
    ...(rawInput.questionKind === "policy_lookup"
      ? {
          policySourceId: rawInput.policySourceId?.trim() || undefined,
        }
      : {}),
    requestedBy: rawInput.requestedBy,
  });
  const created = await createAnalysisMission(input);

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
