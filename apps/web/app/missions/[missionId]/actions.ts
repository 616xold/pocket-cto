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
  recordReportingCirculationLogCorrection,
  recordReportingCirculationLog,
  recordReportingReleaseLog,
  requestReportingCirculationApproval,
  requestReportingReleaseApproval,
  resolveMissionApproval,
} from "../../../lib/api";
import {
  buildApprovalActionResult,
  buildExportReportingMarkdownActionResult,
  buildFileReportingArtifactsActionResult,
  buildInterruptActionResult,
  buildRecordReportingCirculationLogCorrectionActionResult,
  buildRecordReportingCirculationLogActionResult,
  buildRecordReportingReleaseLogActionResult,
  buildRequestReportingCirculationApprovalActionResult,
  buildRequestReportingReleaseApprovalActionResult,
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

const requestReportingReleaseApprovalFormSchema = z.object({
  missionId: z.string().uuid(),
  reportKind: z.preprocess(
    (value) => value ?? "lender_update",
    z.enum(["lender_update", "diligence_packet"]),
  ),
  requestedBy: z.string().trim().min(1),
});

const requestReportingCirculationApprovalFormSchema = z.object({
  missionId: z.string().uuid(),
  reportKind: z.preprocess(
    (value) => value ?? "board_packet",
    z.literal("board_packet"),
  ),
  requestedBy: z.string().trim().min(1),
});

const recordReportingReleaseLogFormSchema = z.object({
  missionId: z.string().uuid(),
  reportKind: z.preprocess(
    (value) => value ?? "lender_update",
    z.enum(["lender_update", "diligence_packet"]),
  ),
  releasedBy: z.string().trim().min(1),
  releaseChannel: z.string().trim().min(1),
  releaseNote: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
});
const recordReportingCirculationLogFormSchema = z.object({
  missionId: z.string().uuid(),
  reportKind: z.preprocess(
    (value) => value ?? "board_packet",
    z.literal("board_packet"),
  ),
  circulatedBy: z.string().trim().min(1),
  circulationChannel: z.string().trim().min(1),
  circulationNote: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
});
const recordReportingCirculationLogCorrectionFormSchema = z.object({
  missionId: z.string().uuid(),
  reportKind: z.preprocess(
    (value) => value ?? "board_packet",
    z.literal("board_packet"),
  ),
  correctionKey: z.string().trim().min(1),
  correctedBy: z.string().trim().min(1),
  correctionReason: z.string().trim().min(1),
  circulatedAt: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().datetime({ offset: true }).optional(),
  ),
  circulationChannel: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  circulationNote: z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
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

  return buildApprovalActionResult(input.decision, input.resolvedBy, result);
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

export async function submitRequestReportingReleaseApproval(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = requestReportingReleaseApprovalFormSchema.parse({
    missionId: formData.get("missionId"),
    reportKind: formData.get("reportKind"),
    requestedBy: formData.get("requestedBy"),
  });

  const result = await requestReportingReleaseApproval({
    missionId: input.missionId,
    requestedBy: input.requestedBy,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildRequestReportingReleaseApprovalActionResult(
    input.requestedBy,
    input.reportKind,
    result,
  );
}

export async function submitRequestReportingCirculationApproval(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = requestReportingCirculationApprovalFormSchema.parse({
    missionId: formData.get("missionId"),
    reportKind: formData.get("reportKind"),
    requestedBy: formData.get("requestedBy"),
  });

  const result = await requestReportingCirculationApproval({
    missionId: input.missionId,
    requestedBy: input.requestedBy,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildRequestReportingCirculationApprovalActionResult(
    input.requestedBy,
    input.reportKind,
    result,
  );
}

export async function submitRecordReportingReleaseLog(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = recordReportingReleaseLogFormSchema.parse({
    missionId: formData.get("missionId"),
    reportKind: formData.get("reportKind"),
    releasedBy: formData.get("releasedBy"),
    releaseChannel: formData.get("releaseChannel"),
    releaseNote: formData.get("releaseNote"),
  });

  const result = await recordReportingReleaseLog({
    missionId: input.missionId,
    releasedBy: input.releasedBy,
    releaseChannel: input.releaseChannel,
    releaseNote: input.releaseNote ?? null,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildRecordReportingReleaseLogActionResult(
    input.releasedBy,
    input.reportKind,
    result,
  );
}

export async function submitRecordReportingCirculationLog(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = recordReportingCirculationLogFormSchema.parse({
    missionId: formData.get("missionId"),
    reportKind: formData.get("reportKind"),
    circulatedBy: formData.get("circulatedBy"),
    circulationChannel: formData.get("circulationChannel"),
    circulationNote: formData.get("circulationNote"),
  });

  const result = await recordReportingCirculationLog({
    missionId: input.missionId,
    circulatedBy: input.circulatedBy,
    circulationChannel: input.circulationChannel,
    circulationNote: input.circulationNote ?? null,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildRecordReportingCirculationLogActionResult(
    input.circulatedBy,
    input.reportKind,
    result,
  );
}

export async function submitRecordReportingCirculationLogCorrection(
  _previousState: MissionActionState,
  formData: FormData,
) {
  const input = recordReportingCirculationLogCorrectionFormSchema.parse({
    missionId: formData.get("missionId"),
    reportKind: formData.get("reportKind"),
    correctionKey: formData.get("correctionKey"),
    correctedBy: formData.get("correctedBy"),
    correctionReason: formData.get("correctionReason"),
    circulatedAt: formData.get("circulatedAt"),
    circulationChannel: formData.get("circulationChannel"),
    circulationNote: formData.get("circulationNote"),
  });

  const result = await recordReportingCirculationLogCorrection({
    missionId: input.missionId,
    correctionKey: input.correctionKey,
    correctedBy: input.correctedBy,
    correctionReason: input.correctionReason,
    circulatedAt: input.circulatedAt ?? null,
    circulationChannel: input.circulationChannel ?? null,
    circulationNote: input.circulationNote ?? null,
  });

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/missions");
    revalidatePath(`/missions/${input.missionId}`);
  }

  return buildRecordReportingCirculationLogCorrectionActionResult(
    input.correctedBy,
    input.reportKind,
    result,
  );
}
