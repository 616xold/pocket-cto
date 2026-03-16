"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMissionFromText } from "../../lib/api";

const missionTextIntakeSchema = z.object({
  requestedBy: z.string().trim().min(1),
  text: z.string().trim().min(1),
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
