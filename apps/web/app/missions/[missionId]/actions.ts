"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createBoardPacketMission,
  createDiligencePacketMission,
  createLenderUpdateMission,
  createReportingMission,
  exportReportingMissionMarkdown,
  fileReportingMissionArtifacts,
  interruptMissionTask,
  resolveMissionApproval,
} from "../../../lib/api";
import {
  buildApprovalActionResult,
  buildExportReportingMarkdownActionResult,
  buildFileReportingArtifactsActionResult,
  buildInterruptActionResult,
  type MissionActionState,
} from "../../../lib/operator-actions";

const approvalResolutionFormSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(["accept", "decline"]),
  missionId: z.string().uuid(),
  resolvedBy: z.string().trim().min(1),
});

const taskInterruptFormSchema = z.object({
  missionId: z.string().uuid(),
  requestedBy: z.string().trim().min(1),
  taskId: z.string().uuid(),
});

const createDraftFinanceMemoFormSchema = z.object({
  requestedBy: z.string().trim().min(1),
  sourceDiscoveryMissionId: z.string().uuid(),
});

const createDraftBoardPacketFormSchema = z.object({
  requestedBy: z.string().trim().min(1),
  sourceReportingMissionId: z.string().uuid(),
});

const createDraftLenderUpdateFormSchema = z.object({
  requestedBy: z.string().trim().min(1),
  sourceReportingMissionId: z.string().uuid(),
});

const createDraftDiligencePacketFormSchema = z.object({
  requestedBy: z.string().trim().min(1),
  sourceReportingMissionId: z.string().uuid(),
});

const fileReportingMissionArtifactsFormSchema = z.object({
  filedBy: z.string().trim().min(1),
  missionId: z.string().uuid(),
});

const exportReportingMissionMarkdownFormSchema = z.object({
  missionId: z.string().uuid(),
  triggeredBy: z.string().trim().min(1),
});

export async function submitApprovalResolution(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = approvalResolutionFormSchema.parse({
    approvalId: formData.get("approvalId"),
    decision: formData.get("decision"),
    missionId: formData.get("missionId"),
    resolvedBy: formData.get("resolvedBy"),
  });

  const result = await resolveMissionApproval({
    approvalId: input.approvalId,
    decision: input.decision,
    resolvedBy: input.resolvedBy,
  });

  if (result.ok) {
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildApprovalActionResult(
    input.decision,
    input.resolvedBy,
    result,
  );
}

export async function submitTaskInterrupt(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = taskInterruptFormSchema.parse({
    missionId: formData.get("missionId"),
    requestedBy: formData.get("requestedBy"),
    taskId: formData.get("taskId"),
  });

  const result = await interruptMissionTask({
    requestedBy: input.requestedBy,
    taskId: input.taskId,
  });

  if (result.ok) {
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildInterruptActionResult(input.requestedBy, result);
}

export async function submitCreateDraftFinanceMemo(formData: FormData) {
  const input = createDraftFinanceMemoFormSchema.parse({
    requestedBy: formData.get("requestedBy"),
    sourceDiscoveryMissionId: formData.get("sourceDiscoveryMissionId"),
  });

  const created = await createReportingMission({
    requestedBy: input.requestedBy,
    reportKind: "finance_memo",
    sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath(`/missions/${input.sourceDiscoveryMissionId}`);
  redirect(`/missions/${created.mission.id}`);
}

export async function submitCreateDraftBoardPacket(formData: FormData) {
  const input = createDraftBoardPacketFormSchema.parse({
    requestedBy: formData.get("requestedBy"),
    sourceReportingMissionId: formData.get("sourceReportingMissionId"),
  });

  const created = await createBoardPacketMission({
    requestedBy: input.requestedBy,
    sourceReportingMissionId: input.sourceReportingMissionId,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath(`/missions/${input.sourceReportingMissionId}`);
  redirect(`/missions/${created.mission.id}`);
}

export async function submitCreateDraftLenderUpdate(formData: FormData) {
  const input = createDraftLenderUpdateFormSchema.parse({
    requestedBy: formData.get("requestedBy"),
    sourceReportingMissionId: formData.get("sourceReportingMissionId"),
  });

  const created = await createLenderUpdateMission({
    requestedBy: input.requestedBy,
    sourceReportingMissionId: input.sourceReportingMissionId,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath(`/missions/${input.sourceReportingMissionId}`);
  redirect(`/missions/${created.mission.id}`);
}

export async function submitCreateDraftDiligencePacket(formData: FormData) {
  const input = createDraftDiligencePacketFormSchema.parse({
    requestedBy: formData.get("requestedBy"),
    sourceReportingMissionId: formData.get("sourceReportingMissionId"),
  });

  const created = await createDiligencePacketMission({
    requestedBy: input.requestedBy,
    sourceReportingMissionId: input.sourceReportingMissionId,
  });

  revalidatePath("/");
  revalidatePath("/missions");
  revalidatePath(`/missions/${input.sourceReportingMissionId}`);
  redirect(`/missions/${created.mission.id}`);
}

export async function submitExportReportingMissionMarkdown(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = exportReportingMissionMarkdownFormSchema.parse({
    missionId: formData.get("missionId"),
    triggeredBy: formData.get("triggeredBy"),
  });

  const result = await exportReportingMissionMarkdown({
    missionId: input.missionId,
    triggeredBy: input.triggeredBy,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildExportReportingMarkdownActionResult(input.triggeredBy, result);
}

export async function submitFileReportingMissionArtifacts(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = fileReportingMissionArtifactsFormSchema.parse({
    filedBy: formData.get("filedBy"),
    missionId: formData.get("missionId"),
  });

  const result = await fileReportingMissionArtifacts({
    filedBy: input.filedBy,
    missionId: input.missionId,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildFileReportingArtifactsActionResult(input.filedBy, result);
}
