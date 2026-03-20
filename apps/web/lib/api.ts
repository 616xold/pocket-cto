import {
  ApprovalRecordSchema,
  CreateDiscoveryMissionInputSchema,
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
} from "@pocket-cto/domain";
import type { ApprovalDecision, MissionSourceKind, MissionStatus } from "@pocket-cto/domain";
import type { CreateDiscoveryMissionInput } from "@pocket-cto/domain";
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

const githubIssueIntakeListSchema = GitHubIssueIntakeListViewSchema;
type GitHubIssueIntakeList = z.output<typeof githubIssueIntakeListSchema>;

const githubIssueMissionCreateResultSchema = GitHubIssueMissionCreateResultSchema;
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
  return (await fetchJson("/health", healthSchema)) ?? {
    ok: false,
    service: "unreachable",
    now: new Date().toISOString(),
  };
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
  return postJsonStrict(
    "/missions/discovery",
    CreateDiscoveryMissionInputSchema.parse(input),
    createMissionResponseSchema,
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
