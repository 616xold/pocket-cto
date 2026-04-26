"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createOrOpenMonitorInvestigation } from "../../lib/api";

const createOrOpenInvestigationFormSchema = z.object({
  companyKey: z.string().trim().min(1),
  monitorResultId: z.string().uuid(),
  requestedBy: z.string().trim().min(1),
});

export async function submitCreateOrOpenMonitorInvestigation(
  formData: FormData,
) {
  const input = createOrOpenInvestigationFormSchema.parse({
    companyKey: formData.get("companyKey"),
    monitorResultId: formData.get("monitorResultId"),
    requestedBy: formData.get("requestedBy"),
  });
  const result = await createOrOpenMonitorInvestigation(input);

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath("/monitoring");
  redirect(`/missions/${result.mission.id}`);
}
