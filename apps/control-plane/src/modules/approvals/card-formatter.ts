import type {
  ApprovalRecord,
  MissionApprovalCard,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import {
  isReportCirculationApprovalPayload,
  isReportReleaseApprovalPayload,
  readReportCirculationApprovalReportKindLabel,
  readReportReleaseApprovalReportKindLabel,
} from "@pocket-cto/domain";

type BuildMissionApprovalCardsInput = {
  approvals: ApprovalRecord[];
  mission: Pick<MissionRecord, "primaryRepo">;
  proofBundle: Pick<
    ProofBundleManifest,
    "branchName" | "pullRequestNumber" | "pullRequestUrl" | "targetRepoFullName"
  >;
  tasks: MissionTaskRecord[];
};

type ApprovalCardContext = {
  repoContext: MissionApprovalCard["repoContext"];
  task: MissionApprovalCard["task"];
};

const SUMMARY_MAX_LENGTH = 220;
const TITLE_MAX_LENGTH = 72;

export function buildMissionApprovalCards(
  input: BuildMissionApprovalCardsInput,
): MissionApprovalCard[] {
  const taskById = new Map(input.tasks.map((task) => [task.id, task]));

  return input.approvals.map((approval) =>
    buildMissionApprovalCard({
      approval,
      context: {
        repoContext: buildRepoContext(input.mission, input.proofBundle),
        task: buildTaskContext(taskById.get(approval.taskId ?? "")),
      },
    }),
  );
}

export function buildMissionApprovalCard(input: {
  approval: ApprovalRecord;
  context: ApprovalCardContext;
}): MissionApprovalCard {
  const details = readDetails(input.approval);

  switch (input.approval.kind) {
    case "file_change":
      return buildFileChangeCard(input.approval, details, input.context);
    case "command":
      return buildCommandCard(input.approval, details, input.context);
    case "network_escalation":
      return buildNetworkEscalationCard(input.approval, details, input.context);
    case "report_circulation":
      return buildReportCirculationCard(input.approval, input.context);
    case "report_release":
      return buildReportReleaseCard(input.approval, input.context);
    default:
      return buildFallbackCard(input.approval, details, input.context);
  }
}

function buildFileChangeCard(
  approval: ApprovalRecord,
  details: Record<string, unknown>,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const grantRoot = readDetailString(details, "grantRoot");
  const reason = readDetailString(details, "reason");

  return buildCard(approval, context, {
    actionHint:
      "Review the requested file-edit scope, then approve only if this task should change those files.",
    summary: joinCompact([
      grantRoot
        ? `Allow file edits under ${formatPathLabel(grantRoot)}.`
        : "Allow file edits in the task workspace.",
      reason
        ? `Why it matters: ${normalizeSentence(reason)}`
        : "Why it matters: the runtime needs workspace write access to continue.",
    ]),
    title: grantRoot
      ? `Approve file changes in ${formatPathLabel(grantRoot)}`
      : "Approve workspace file changes",
  });
}

function buildCommandCard(
  approval: ApprovalRecord,
  details: Record<string, unknown>,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const command = readDetailString(details, "command");
  const cwd = readDetailString(details, "cwd");
  const reason = readDetailString(details, "reason");

  return buildCard(approval, context, {
    actionHint:
      "Review the command and working directory before approving execution.",
    summary: joinCompact([
      command
        ? `Run ${truncate(command, 96)}.`
        : "Run a runtime command for this task.",
      cwd ? `Working directory: ${formatPathLabel(cwd)}.` : null,
      reason
        ? `Why it matters: ${normalizeSentence(reason)}`
        : "Why it matters: the runtime paused before executing a command.",
    ]),
    title: command
      ? `Approve command: ${truncate(command, TITLE_MAX_LENGTH)}`
      : "Approve runtime command",
  });
}

function buildNetworkEscalationCard(
  approval: ApprovalRecord,
  details: Record<string, unknown>,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const command = readDetailString(details, "command");
  const reason = readDetailString(details, "reason");
  const networkHint = readNetworkHint(details);

  return buildCard(approval, context, {
    actionHint:
      "Approve only if this task should use network access or adjust network policy to finish the requested work.",
    summary: joinCompact([
      command
        ? `Allow networked command ${truncate(command, 88)}.`
        : "Allow a network-enabled runtime action for this task.",
      networkHint,
      reason
        ? `Why it matters: ${normalizeSentence(reason)}`
        : "Why it matters: the runtime requested network capability that was not already allowed.",
    ]),
    title: command
      ? `Approve networked command: ${truncate(command, 56)}`
      : "Approve network escalation",
  });
}

function buildFallbackCard(
  approval: ApprovalRecord,
  details: Record<string, unknown>,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const reason = readDetailString(details, "reason");
  const kindLabel = humanizeKind(approval.kind);

  return buildCard(approval, context, {
    actionHint:
      "Review the persisted approval trace before deciding because this approval kind does not have richer card copy yet.",
    summary: joinCompact([
      `Pocket CTO persisted a ${kindLabel.toLowerCase()} request, but this formatter does not yet know how to summarize its payload in more detail.`,
      reason ? `Stored reason: ${normalizeSentence(reason)}` : null,
    ]),
    title: `Review ${kindLabel}`,
  });
}

function buildReportReleaseCard(
  approval: ApprovalRecord,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const payload = isReportReleaseApprovalPayload(approval.payload)
    ? approval.payload
    : null;
  const releaseRecord = payload?.releaseRecord ?? null;
  const reportLabel = payload
    ? readReportReleaseApprovalReportKindLabel(payload.reportKind)
    : "Report";
  const reportLabelLower = reportLabel.toLowerCase();
  const reportSummaryLabelLower =
    payload?.reportKind === "lender_update" ? "lender-update" : reportLabelLower;

  if (payload && releaseRecord) {
    return buildCard(approval, context, {
      actionHint:
        `This card records an external release log only. Pocket CFO did not send or distribute the ${reportLabelLower}.`,
      requiresLiveControl: false,
      summary: joinCompact([
        `External ${reportSummaryLabelLower} release is logged for ${payload.companyKey}.`,
        releaseRecord.summary,
        `Original approval trace remains anchored to report_release approval ${approval.id}.`,
      ]),
      title: `${reportLabel} release logged for ${payload.companyKey}`,
    });
  }

  return buildCard(approval, context, {
    actionHint:
      `Review the stored ${reportLabelLower} summary, freshness, and limitations before deciding whether this draft is approved for release. This slice records posture only and does not deliver the report.`,
    requiresLiveControl: false,
    summary: payload
      ? joinCompact([
          `Review ${reportLabelLower} release readiness for ${payload.companyKey}.`,
          `Summary: ${normalizeSentence(payload.summary)}`,
          `Freshness: ${normalizeSentence(payload.freshnessSummary)}`,
          `Limitations: ${normalizeSentence(payload.limitationsSummary)}`,
        ])
      : "Review release readiness for a stored draft report. This approval kind carries finance reporting evidence instead of runtime task context.",
    title: payload
      ? `Review ${reportLabelLower} release approval for ${payload.companyKey}`
      : "Review report release approval",
  });
}

function buildReportCirculationCard(
  approval: ApprovalRecord,
  context: ApprovalCardContext,
): MissionApprovalCard {
  const payload = isReportCirculationApprovalPayload(approval.payload)
    ? approval.payload
    : null;
  const circulationRecord = payload?.circulationRecord ?? null;
  const circulationCorrections = payload?.circulationCorrections ?? [];
  const latestCorrection = circulationCorrections.at(-1) ?? null;
  const reportLabel = payload
    ? readReportCirculationApprovalReportKindLabel(payload.reportKind)
    : "Report";
  const reportLabelLower = reportLabel.toLowerCase();

  if (payload && circulationRecord && circulationCorrections.length > 0) {
    return buildCard(approval, context, {
      actionHint:
        `This card records external circulation chronology only. Pocket CFO did not send or distribute the ${reportLabelLower}.`,
      requiresLiveControl: false,
      summary: joinCompact([
        `External ${reportLabelLower} circulation was logged for ${payload.companyKey}, and ${circulationCorrections.length} append-only correction${circulationCorrections.length === 1 ? "" : "s"} ${circulationCorrections.length === 1 ? "has" : "have"} been recorded afterward.`,
        `Original approval trace remains anchored to report_circulation approval ${approval.id}.`,
        circulationRecord.summary,
        latestCorrection?.summary ?? null,
      ]),
      title: `${reportLabel} circulation corrected for ${payload.companyKey}`,
    });
  }

  if (payload && circulationRecord) {
    return buildCard(approval, context, {
      actionHint:
        `This card records an external circulation log only. Pocket CFO did not send or distribute the ${reportLabelLower}.`,
      requiresLiveControl: false,
      summary: joinCompact([
        `External ${reportLabelLower} circulation is logged for ${payload.companyKey}.`,
        `Original approval trace remains anchored to report_circulation approval ${approval.id}.`,
        circulationRecord.summary,
      ]),
      title: `${reportLabel} circulation logged for ${payload.companyKey}`,
    });
  }

  return buildCard(approval, context, {
    actionHint:
      `Review the stored ${reportLabelLower} summary, freshness, and limitations before deciding whether this draft is approved for internal circulation. This slice records posture only and does not deliver the packet.`,
    requiresLiveControl: false,
    summary: payload
      ? joinCompact([
          `Review ${reportLabelLower} circulation readiness for ${payload.companyKey}.`,
          `Summary: ${normalizeSentence(payload.summary)}`,
          `Freshness: ${normalizeSentence(payload.freshnessSummary)}`,
          `Limitations: ${normalizeSentence(payload.limitationsSummary)}`,
        ])
      : "Review internal circulation readiness for a stored draft report. This approval kind carries finance reporting evidence instead of runtime task context.",
    title: payload
      ? `Review ${reportLabelLower} circulation approval for ${payload.companyKey}`
      : "Review report circulation approval",
  });
}

function buildCard(
  approval: ApprovalRecord,
  context: ApprovalCardContext,
  input: {
    actionHint: string;
    requiresLiveControl?: boolean;
    summary: string;
    title: string;
  },
): MissionApprovalCard {
  return {
    actionHint: approval.status === "pending" ? input.actionHint : null,
    approvalId: approval.id,
    kind: approval.kind,
    requestedAt: approval.createdAt,
    requestedBy: approval.requestedBy,
    requiresLiveControl: input.requiresLiveControl ?? true,
    repoContext: context.repoContext,
    resolutionSummary:
      approval.status === "pending" ? null : buildResolutionSummary(approval),
    resolvedAt: approval.status === "pending" ? null : approval.updatedAt,
    resolvedBy: approval.status === "pending" ? null : approval.resolvedBy,
    status: approval.status,
    summary: truncate(input.summary, SUMMARY_MAX_LENGTH),
    task: context.task,
    title: truncate(input.title, TITLE_MAX_LENGTH),
  };
}

function buildTaskContext(
  task: MissionTaskRecord | null | undefined,
): MissionApprovalCard["task"] {
  if (!task) {
    return null;
  }

  return {
    id: task.id,
    label: `Task ${task.sequence} · ${task.role}`,
    role: task.role,
    sequence: task.sequence,
  };
}

function buildRepoContext(
  mission: Pick<MissionRecord, "primaryRepo">,
  proofBundle: Pick<
    ProofBundleManifest,
    "branchName" | "pullRequestNumber" | "pullRequestUrl" | "targetRepoFullName"
  >,
): MissionApprovalCard["repoContext"] {
  const repoLabel =
    proofBundle.targetRepoFullName ?? mission.primaryRepo ?? null;

  if (
    !repoLabel &&
    !proofBundle.branchName &&
    !proofBundle.pullRequestNumber &&
    !proofBundle.pullRequestUrl
  ) {
    return null;
  }

  return {
    repoLabel: repoLabel ?? "repo context pending",
    branchName: proofBundle.branchName,
    pullRequestNumber: proofBundle.pullRequestNumber,
    pullRequestUrl: proofBundle.pullRequestUrl,
  };
}

function buildResolutionSummary(approval: ApprovalRecord) {
  const actor = approval.resolvedBy ?? "system";
  const rationale = approval.rationale
    ? ` Rationale: ${normalizeSentence(approval.rationale)}`
    : "";

  return `${humanizeStatus(approval.status)} by ${actor} at ${approval.updatedAt}.${rationale}`;
}

function readDetails(approval: ApprovalRecord) {
  const details = approval.payload.details;

  return details && typeof details === "object" && !Array.isArray(details)
    ? (details as Record<string, unknown>)
    : {};
}

function readDetailString(details: Record<string, unknown>, key: string) {
  const value = details[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNetworkHint(details: Record<string, unknown>) {
  const hasNetworkContext = details.networkApprovalContext != null;
  const additionalPermissions =
    details.additionalPermissions &&
    typeof details.additionalPermissions === "object" &&
    !Array.isArray(details.additionalPermissions)
      ? (details.additionalPermissions as Record<string, unknown>)
      : null;
  const hasNetworkPermission = additionalPermissions?.network != null;
  const amendments = Array.isArray(details.proposedNetworkPolicyAmendments)
    ? details.proposedNetworkPolicyAmendments.length
    : 0;

  if (amendments > 0) {
    return `The runtime proposed ${amendments} network policy amendment${amendments === 1 ? "" : "s"}.`;
  }

  if (hasNetworkPermission || hasNetworkContext) {
    return "The runtime requested additional network capability for this step.";
  }

  return null;
}

function formatPathLabel(value: string) {
  const parts = value.split("/").filter(Boolean);

  if (parts.length <= 3) {
    return value;
  }

  return `.../${parts.slice(-3).join("/")}`;
}

function humanizeKind(kind: ApprovalRecord["kind"]) {
  return kind.replaceAll("_", " ");
}

function humanizeStatus(status: ApprovalRecord["status"]) {
  switch (status) {
    case "approved":
      return "Approved";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "pending":
      return "Pending";
  }
}

function joinCompact(parts: Array<string | null>) {
  return parts.filter(Boolean).join(" ");
}

function normalizeSentence(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return trimmed;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 3).trimEnd()}...`;
}
