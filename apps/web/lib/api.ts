import {
  ApprovalRecordSchema,
  CfoWikiCompanySourceListViewSchema,
  CreateBoardPacketMissionInputSchema,
  CreateDiligencePacketMissionInputSchema,
  CreateDiscoveryMissionInputSchema,
  CreateLenderUpdateMissionInputSchema,
  CreateReportingMissionInputSchema,
  CreateSourceInputSchema,
  ExportReportingMissionMarkdownInputSchema,
  FileReportingMissionArtifactsInputSchema,
  GitHubIssueIntakeListViewSchema,
  GitHubIssueMissionCreateResultSchema,
  MissionDetailViewSchema,
  MissionListViewSchema,
  MissionRecordSchema,
  MissionSourceKindSchema,
  MissionStatusSchema,
  MissionTaskRecordSchema,
  OperatorControlAvailabilitySchema,
  ProofBundleManifestSchema,
  RecordReportingCirculationLogCorrectionInputSchema,
  RecordReportingCirculationLogCorrectionResultSchema,
  RecordReportingCirculationLogInputSchema,
  RecordReportingCirculationLogResultSchema,
  RecordReportingReleaseLogInputSchema,
  RecordReportingReleaseLogResultSchema,
  RequestReportCirculationApprovalInputSchema,
  RequestReportCirculationApprovalResultSchema,
  RequestReportReleaseApprovalInputSchema,
  RequestReportReleaseApprovalResultSchema,
  ReportingFiledArtifactsResultSchema,
  ReportingMarkdownExportResultSchema,
  SourceDetailViewSchema,
  SourceFileDetailViewSchema,
  SourceFileListViewSchema,
  SourceIngestRunDetailViewSchema,
  SourceIngestRunListViewSchema,
  SourceListViewSchema,
} from "@pocket-cto/domain";
import type {
  ApprovalDecision,
  MissionSourceKind,
  MissionStatus,
} from "@pocket-cto/domain";
import type {
  CfoWikiCompanySourceListView,
  CreateDiscoveryMissionInput,
  CreateSourceInput,
  SourceDetailView,
  SourceFileDetailView,
  SourceFileListView,
  SourceIngestRunDetailView,
  SourceIngestRunListView,
  SourceListView,
} from "@pocket-cto/domain";
import { z } from "zod";
import {
  controlPlaneActionErrorResponseSchema,
  type ControlPlaneMutationResult,
} from "./operator-actions";

const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  now: z.string(),
});
type ControlPlaneHealth = z.output<typeof healthSchema>;

const missionDetailSchema = MissionDetailViewSchema;
type MissionDetail = z.output<typeof missionDetailSchema>;

const missionListSchema = MissionListViewSchema;
type MissionList = z.output<typeof missionListSchema>;

const sourceListSchema = SourceListViewSchema;
const cfoWikiCompanySourceListSchema = CfoWikiCompanySourceListViewSchema;

const sourceDetailSchema = SourceDetailViewSchema;

const sourceFileListSchema = SourceFileListViewSchema;

const sourceFileDetailSchema = SourceFileDetailViewSchema;

const sourceIngestRunListSchema = SourceIngestRunListViewSchema;

const sourceIngestRunDetailSchema = SourceIngestRunDetailViewSchema;

const githubIssueIntakeListSchema = GitHubIssueIntakeListViewSchema;
type GitHubIssueIntakeList = z.output<typeof githubIssueIntakeListSchema>;

const githubIssueMissionCreateResultSchema =
  GitHubIssueMissionCreateResultSchema;
type GitHubIssueMissionCreateResult = z.output<
  typeof githubIssueMissionCreateResultSchema
>;

const liveControlSchema = OperatorControlAvailabilitySchema;

const createMissionResponseSchema = z.object({
  mission: MissionRecordSchema,
  proofBundle: ProofBundleManifestSchema,
  tasks: z.array(MissionTaskRecordSchema),
});

const missionApprovalsSchema = z.object({
  approvals: z.array(ApprovalRecordSchema),
  liveControl: liveControlSchema,
});
type MissionApprovals = z.output<typeof missionApprovalsSchema>;

const resolveApprovalResponseSchema = z.object({
  approval: ApprovalRecordSchema,
  liveControl: liveControlSchema,
});

const interruptTaskResponseSchema = z.object({
  interrupt: z.object({
    cancelledApprovals: z.array(ApprovalRecordSchema).default([]),
    taskId: z.string().uuid(),
    threadId: z.string(),
    turnId: z.string(),
  }),
  liveControl: liveControlSchema,
});

type ControlPlaneUrlEnv = {
  CONTROL_PLANE_URL?: string;
  NEXT_PUBLIC_CONTROL_PLANE_URL?: string;
};

export function resolveControlPlaneUrl(
  env: ControlPlaneUrlEnv = {
    CONTROL_PLANE_URL: process.env.CONTROL_PLANE_URL,
    NEXT_PUBLIC_CONTROL_PLANE_URL: process.env.NEXT_PUBLIC_CONTROL_PLANE_URL,
  },
) {
  return (
    env.NEXT_PUBLIC_CONTROL_PLANE_URL ??
    env.CONTROL_PLANE_URL ??
    "http://localhost:4000"
  );
}

async function fetchJson<TSchema extends z.ZodTypeAny>(
  input: string,
  schema: TSchema,
): Promise<z.output<TSchema> | null> {
  try {
    const response = await fetch(`${resolveControlPlaneUrl()}${input}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return schema.parse(json);
  } catch {
    return null;
  }
}

async function postJson<TSchema extends z.ZodTypeAny>(
  input: string,
  body: unknown,
  schema: TSchema,
): Promise<ControlPlaneMutationResult<z.output<TSchema>>> {
  let response: Response;

  try {
    response = await fetch(`${resolveControlPlaneUrl()}${input}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      errorCode: "request_failed",
      message: "Control-plane request failed",
    };
  }

  if (!response.ok) {
    const errorJson = await readJson(response);
    const parsedError =
      controlPlaneActionErrorResponseSchema.safeParse(errorJson);

    if (parsedError.success) {
      return {
        ok: false,
        statusCode: response.status,
        errorCode: parsedError.data.error.code,
        message: parsedError.data.error.message,
      };
    }

    return {
      ok: false,
      statusCode: response.status,
      errorCode: "request_failed",
      message: `Control-plane request failed (${response.status})`,
    };
  }

  return {
    ok: true,
    statusCode: response.status,
    data: schema.parse(await response.json()),
  };
}

export async function getControlPlaneHealth(): Promise<ControlPlaneHealth> {
  return (
    (await fetchJson("/health", healthSchema)) ?? {
      ok: false,
      service: "unreachable",
      now: new Date().toISOString(),
    }
  );
}

export async function getMissionDetail(
  missionId: string,
): Promise<MissionDetail | null> {
  return fetchJson(`/missions/${missionId}`, missionDetailSchema);
}

export async function getMissionList(input?: {
  limit?: number;
  sourceKind?: MissionSourceKind;
  status?: MissionStatus;
}): Promise<MissionList | null> {
  const search = new URLSearchParams();

  if (typeof input?.limit === "number") {
    search.set("limit", String(input.limit));
  }

  if (input?.status) {
    search.set("status", MissionStatusSchema.parse(input.status));
  }

  if (input?.sourceKind) {
    search.set("sourceKind", MissionSourceKindSchema.parse(input.sourceKind));
  }

  const suffix = search.size > 0 ? `?${search.toString()}` : "";
  return fetchJson(`/missions${suffix}`, missionListSchema);
}

export async function getSourceList(input?: {
  limit?: number;
}): Promise<SourceListView | null> {
  const search = new URLSearchParams();

  if (typeof input?.limit === "number") {
    search.set("limit", String(input.limit));
  }

  const suffix = search.size > 0 ? `?${search.toString()}` : "";
  return fetchJson(`/sources${suffix}`, sourceListSchema);
}

export async function getCfoWikiCompanySourceList(
  companyKey: string,
): Promise<CfoWikiCompanySourceListView | null> {
  const normalizedCompanyKey = companyKey.trim();

  if (!normalizedCompanyKey) {
    return null;
  }

  return fetchJson(
    `/cfo-wiki/companies/${encodeURIComponent(normalizedCompanyKey)}/sources`,
    cfoWikiCompanySourceListSchema,
  );
}

export async function getSourceDetail(
  sourceId: string,
): Promise<SourceDetailView | null> {
  return fetchJson(
    `/sources/${encodeURIComponent(sourceId)}`,
    sourceDetailSchema,
  );
}

export async function getSourceFileList(
  sourceId: string,
): Promise<SourceFileListView | null> {
  return fetchJson(
    `/sources/${encodeURIComponent(sourceId)}/files`,
    sourceFileListSchema,
  );
}

export async function getSourceFileDetail(
  sourceFileId: string,
): Promise<SourceFileDetailView | null> {
  return fetchJson(
    `/sources/files/${encodeURIComponent(sourceFileId)}`,
    sourceFileDetailSchema,
  );
}

export async function getSourceIngestRunList(
  sourceFileId: string,
): Promise<SourceIngestRunListView | null> {
  return fetchJson(
    `/sources/files/${encodeURIComponent(sourceFileId)}/ingest-runs`,
    sourceIngestRunListSchema,
  );
}

export async function getSourceIngestRunDetail(
  ingestRunId: string,
): Promise<SourceIngestRunDetailView | null> {
  return fetchJson(
    `/sources/ingest-runs/${encodeURIComponent(ingestRunId)}`,
    sourceIngestRunDetailSchema,
  );
}

export async function getGitHubIssueIntakeList(): Promise<GitHubIssueIntakeList | null> {
  return fetchJson("/github/intake/issues", githubIssueIntakeListSchema);
}

export async function getMissionApprovals(
  missionId: string,
): Promise<MissionApprovals | null> {
  return fetchJson(`/missions/${missionId}/approvals`, missionApprovalsSchema);
}

export async function createMissionFromText(input: {
  requestedBy: string;
  sourceKind?: MissionSourceKind;
  sourceRef?: string | null;
  text: string;
}) {
  return postJsonStrict(
    "/missions/text",
    {
      requestedBy: input.requestedBy,
      sourceKind: input.sourceKind,
      sourceRef: input.sourceRef ?? undefined,
      text: input.text,
    },
    createMissionResponseSchema,
  );
}

export async function createDiscoveryMission(
  input: CreateDiscoveryMissionInput,
) {
  return createAnalysisMission(input);
}

export async function createAnalysisMission(
  input: CreateDiscoveryMissionInput,
) {
  return postJsonStrict(
    "/missions/analysis",
    CreateDiscoveryMissionInputSchema.parse(input),
    createMissionResponseSchema,
  );
}

export async function createReportingMission(
  input: z.input<typeof CreateReportingMissionInputSchema>,
) {
  return postJsonStrict(
    "/missions/reporting",
    CreateReportingMissionInputSchema.parse(input),
    createMissionResponseSchema,
  );
}

export async function createBoardPacketMission(
  input: z.input<typeof CreateBoardPacketMissionInputSchema>,
) {
  return postJsonStrict(
    "/missions/reporting/board-packets",
    CreateBoardPacketMissionInputSchema.parse(input),
    createMissionResponseSchema,
  );
}

export async function createLenderUpdateMission(
  input: z.input<typeof CreateLenderUpdateMissionInputSchema>,
) {
  return postJsonStrict(
    "/missions/reporting/lender-updates",
    CreateLenderUpdateMissionInputSchema.parse(input),
    createMissionResponseSchema,
  );
}

export async function createDiligencePacketMission(
  input: z.input<typeof CreateDiligencePacketMissionInputSchema>,
) {
  return postJsonStrict(
    "/missions/reporting/diligence-packets",
    CreateDiligencePacketMissionInputSchema.parse(input),
    createMissionResponseSchema,
  );
}

export async function exportReportingMissionMarkdown(input: {
  missionId: string;
  triggeredBy: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/export`,
    ExportReportingMissionMarkdownInputSchema.parse({
      triggeredBy: input.triggeredBy,
    }),
    ReportingMarkdownExportResultSchema,
  );
}

export async function fileReportingMissionArtifacts(input: {
  filedBy: string;
  missionId: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/filed-artifacts`,
    FileReportingMissionArtifactsInputSchema.parse({
      filedBy: input.filedBy,
    }),
    ReportingFiledArtifactsResultSchema,
  );
}

export async function requestReportingReleaseApproval(input: {
  missionId: string;
  requestedBy: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/release-approval`,
    RequestReportReleaseApprovalInputSchema.parse({
      requestedBy: input.requestedBy,
    }),
    RequestReportReleaseApprovalResultSchema,
  );
}

export async function requestReportingCirculationApproval(input: {
  missionId: string;
  requestedBy: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/circulation-approval`,
    RequestReportCirculationApprovalInputSchema.parse({
      requestedBy: input.requestedBy,
    }),
    RequestReportCirculationApprovalResultSchema,
  );
}

export async function recordReportingReleaseLog(input: {
  missionId: string;
  releasedAt?: string | null;
  releasedBy: string;
  releaseChannel: string;
  releaseNote?: string | null;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/release-log`,
    RecordReportingReleaseLogInputSchema.parse({
      releasedAt: input.releasedAt ?? null,
      releasedBy: input.releasedBy,
      releaseChannel: input.releaseChannel,
      releaseNote: input.releaseNote ?? null,
    }),
    RecordReportingReleaseLogResultSchema,
  );
}

export async function recordReportingCirculationLog(input: {
  circulatedAt?: string | null;
  circulatedBy: string;
  circulationChannel: string;
  circulationNote?: string | null;
  missionId: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/circulation-log`,
    RecordReportingCirculationLogInputSchema.parse({
      circulatedAt: input.circulatedAt ?? null,
      circulatedBy: input.circulatedBy,
      circulationChannel: input.circulationChannel,
      circulationNote: input.circulationNote ?? null,
    }),
    RecordReportingCirculationLogResultSchema,
  );
}

export async function recordReportingCirculationLogCorrection(input: {
  circulatedAt?: string | null;
  circulationChannel?: string | null;
  circulationNote?: string | null;
  correctedAt?: string | null;
  correctedBy: string;
  correctionKey: string;
  correctionReason: string;
  missionId: string;
}) {
  return postJson(
    `/missions/${encodeURIComponent(input.missionId)}/reporting/circulation-log-correction`,
    RecordReportingCirculationLogCorrectionInputSchema.parse({
      correctionKey: input.correctionKey,
      correctedAt: input.correctedAt ?? null,
      correctedBy: input.correctedBy,
      correctionReason: input.correctionReason,
      circulatedAt: input.circulatedAt ?? null,
      circulationChannel: input.circulationChannel ?? null,
      circulationNote: input.circulationNote ?? null,
    }),
    RecordReportingCirculationLogCorrectionResultSchema,
  );
}

export async function createSource(input: CreateSourceInput) {
  return postJsonStrict(
    "/sources",
    CreateSourceInputSchema.parse(input),
    sourceDetailSchema,
  );
}

export async function uploadSourceFile(input: {
  sourceId: string;
  originalFileName: string;
  mediaType: string;
  createdBy: string;
  capturedAt?: string;
  body: Uint8Array;
}) {
  const search = new URLSearchParams({
    createdBy: input.createdBy,
    mediaType: input.mediaType,
    originalFileName: input.originalFileName,
  });

  if (input.capturedAt) {
    search.set("capturedAt", input.capturedAt);
  }

  const response = await fetch(
    `${resolveControlPlaneUrl()}/sources/${encodeURIComponent(input.sourceId)}/files?${search.toString()}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
      },
      body: toArrayBuffer(input.body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Control-plane request failed (${response.status})`);
  }

  return sourceFileDetailSchema.parse(await response.json());
}

export async function ingestSourceFile(input: { sourceFileId: string }) {
  return postJsonStrict(
    `/sources/files/${encodeURIComponent(input.sourceFileId)}/ingest`,
    {},
    sourceIngestRunDetailSchema,
  );
}

export async function createMissionFromGitHubIssueDelivery(input: {
  deliveryId: string;
}): Promise<GitHubIssueMissionCreateResult> {
  return postJsonStrict(
    `/github/intake/issues/${encodeURIComponent(input.deliveryId)}/create-mission`,
    {},
    githubIssueMissionCreateResultSchema,
  );
}

export async function resolveMissionApproval(input: {
  approvalId: string;
  decision: ApprovalDecision;
  rationale?: string | null;
  resolvedBy: string;
}) {
  return postJson(
    `/approvals/${input.approvalId}/resolve`,
    {
      decision: input.decision,
      rationale: input.rationale ?? undefined,
      resolvedBy: input.resolvedBy,
    },
    resolveApprovalResponseSchema,
  );
}

export async function interruptMissionTask(input: {
  rationale?: string | null;
  requestedBy: string;
  taskId: string;
}) {
  return postJson(
    `/tasks/${input.taskId}/interrupt`,
    {
      rationale: input.rationale ?? undefined,
      requestedBy: input.requestedBy,
    },
    interruptTaskResponseSchema,
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function postJsonStrict<TSchema extends z.ZodTypeAny>(
  input: string,
  body: unknown,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  const response = await fetch(`${resolveControlPlaneUrl()}${input}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Control-plane request failed (${response.status})`);
  }

  return schema.parse(await response.json());
}

function toArrayBuffer(value: Uint8Array) {
  const buffer = new ArrayBuffer(value.byteLength);
  new Uint8Array(buffer).set(value);
  return buffer;
}
