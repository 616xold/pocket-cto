import type {
  ApprovalRecord,
  ArtifactKind,
  ArtifactRecord,
  CfoWikiPageKey,
  DiscoveryAnswerArtifactMetadata,
  DiscoveryMissionQuestion,
  FinancePolicySourceScopeSummary,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleArtifactSummary,
  ProofBundleLatestApproval,
  ProofBundleManifest,
  ProofBundleTimestamps,
} from "@pocket-cto/domain";
import { readDiscoveryAnswerArtifactMetadata } from "./discovery-answer";
import { normalizeSentence, truncate } from "./text";

const SUMMARY_MAX_LENGTH = 240;

type ProofBundleLatestArtifacts = {
  discoveryAnswer: ArtifactRecord | null;
  diffSummary: ArtifactRecord | null;
  logExcerpt: ArtifactRecord | null;
  plan: ArtifactRecord | null;
  pullRequest: ArtifactRecord | null;
  testReport: ArtifactRecord | null;
};

export type ProofBundleAssemblyFacts = {
  artifactIds: string[];
  artifacts: ProofBundleArtifactSummary[];
  branchName: string | null;
  changeSummary: string | null;
  companyKey: string | null;
  discoveryAnswerSummary: string | null;
  decisionTrace: string[];
  freshnessState: ProofBundleManifest["freshnessState"];
  freshnessSummary: string | null;
  latestApproval: ProofBundleLatestApproval | null;
  latestArtifacts: ProofBundleLatestArtifacts;
  latestExecutorTask: MissionTaskRecord | null;
  latestPlannerTask: MissionTaskRecord | null;
  latestScoutTask: MissionTaskRecord | null;
  limitationsSummary: string | null;
  missionType: MissionRecord["type"];
  presentArtifactKinds: ArtifactKind[];
  pullRequestIsDraft: boolean | null;
  pullRequestNumber: number | null;
  pullRequestUrl: string | null;
  policySourceId: string | null;
  policySourceScope: FinancePolicySourceScopeSummary | null;
  questionKind: ProofBundleManifest["questionKind"];
  relatedRoutePaths: string[];
  relatedWikiPageKeys: CfoWikiPageKey[];
  riskSummary: string | null;
  rollbackSummary: string | null;
  targetRepoFullName: string | null;
  timestamps: ProofBundleTimestamps;
  validationSummary: string | null;
};

export function deriveProofBundleAssemblyFacts(input: {
  approvals: ApprovalRecord[];
  artifacts: ArtifactRecord[];
  existingBundle: ProofBundleManifest | null;
  mission: MissionRecord;
  tasks: MissionTaskRecord[];
}): ProofBundleAssemblyFacts {
  const taskById = new Map(input.tasks.map((task) => [task.id, task]));
  const evidenceArtifacts = input.artifacts.filter(
    (artifact) => artifact.kind !== "proof_bundle_manifest",
  );
  const hasCurrentExecutionEvidence = evidenceArtifacts.some((artifact) =>
    [
      "diff_summary",
      "discovery_answer",
      "test_report",
      "log_excerpt",
      "pr_link",
    ].includes(artifact.kind),
  );
  const latestArtifacts = readLatestArtifacts(evidenceArtifacts);
  const discoveryAnswerMetadata = readDiscoveryAnswerArtifactMetadata(
    latestArtifacts.discoveryAnswer,
  );
  const latestApproval = readLatestApproval(input.approvals);
  const latestPlannerTask = readLatestTaskByRole(input.tasks, "planner");
  const latestExecutorTask = readLatestTaskByRole(input.tasks, "executor");
  const latestScoutTask = readLatestTaskByRole(input.tasks, "scout");
  const discoveryQuestion = input.mission.spec.input?.discoveryQuestion ?? null;
  const targetRepoFullName =
    (isLegacyDiscoveryAnswerMetadata(discoveryAnswerMetadata)
      ? discoveryAnswerMetadata.repoFullName
      : null) ??
    readMetadataString(latestArtifacts.pullRequest?.metadata, "repoFullName") ??
    readFullRepoName(input.mission.primaryRepo) ??
    input.existingBundle?.targetRepoFullName ??
    null;
  const branchName =
    readMetadataString(latestArtifacts.pullRequest?.metadata, "branchName") ??
    readMetadataString(latestArtifacts.pullRequest?.metadata, "headBranch") ??
    input.existingBundle?.branchName ??
    null;
  const pullRequestNumber =
    readMetadataPositiveInt(latestArtifacts.pullRequest?.metadata, "prNumber") ??
    input.existingBundle?.pullRequestNumber ??
    null;
  const pullRequestUrl =
    readMetadataUrl(latestArtifacts.pullRequest?.metadata, "prUrl") ??
    latestArtifacts.pullRequest?.uri ??
    input.existingBundle?.pullRequestUrl ??
    null;
  const pullRequestIsDraft =
    typeof latestArtifacts.pullRequest?.metadata.draft === "boolean"
      ? latestArtifacts.pullRequest.metadata.draft
      : null;

  return {
    artifactIds: evidenceArtifacts.map((artifact) => artifact.id),
    artifacts: evidenceArtifacts.map((artifact) => ({
      id: artifact.id,
      kind: artifact.kind,
    })),
    branchName,
    changeSummary:
      discoveryAnswerMetadata?.answerSummary ??
      readArtifactSummary(latestArtifacts.diffSummary) ??
      normalizeSentence(latestScoutTask?.summary ?? null) ??
      normalizeSentence(latestExecutorTask?.summary ?? null) ??
      normalizeSentence(input.existingBundle?.changeSummary ?? null),
    companyKey:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.companyKey
        : null) ??
      (isFinanceDiscoveryQuestion(discoveryQuestion)
        ? discoveryQuestion.companyKey
        : null) ??
      input.existingBundle?.companyKey ??
      null,
    discoveryAnswerSummary: discoveryAnswerMetadata?.answerSummary ?? null,
    decisionTrace: buildDecisionTrace({
      artifacts: evidenceArtifacts,
      latestApproval,
      latestExecutorTask,
      latestPlannerTask,
      latestScoutTask,
      pullRequestArtifact: latestArtifacts.pullRequest,
      taskById,
    }),
    freshnessState:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.freshnessPosture.state
        : null) ??
      input.existingBundle?.freshnessState ??
      null,
    freshnessSummary:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.freshnessPosture.reasonSummary
        : null) ??
      normalizeSentence(input.existingBundle?.freshnessSummary ?? null),
    latestApproval,
    latestArtifacts,
    latestExecutorTask,
    latestPlannerTask,
    latestScoutTask,
    limitationsSummary:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? summarizeLimitations(discoveryAnswerMetadata.limitations)
        : null) ??
      normalizeSentence(input.existingBundle?.limitationsSummary ?? null),
    missionType: input.mission.type,
    presentArtifactKinds: readPresentArtifactKinds(evidenceArtifacts),
    pullRequestIsDraft,
    pullRequestNumber,
    pullRequestUrl,
    policySourceId:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.policySourceId ?? null
        : null) ??
      (isPolicyLookupDiscoveryQuestion(discoveryQuestion)
        ? discoveryQuestion.policySourceId
        : null) ??
      input.existingBundle?.policySourceId ??
      null,
    policySourceScope:
      readFinancePolicySourceScope(discoveryAnswerMetadata) ??
      input.existingBundle?.policySourceScope ??
      null,
    questionKind:
      discoveryAnswerMetadata?.questionKind ??
      discoveryQuestion?.questionKind ??
      input.existingBundle?.questionKind ??
      null,
    relatedRoutePaths:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.relatedRoutes.map((route) => route.routePath)
        : null) ??
      input.existingBundle?.relatedRoutePaths ??
      [],
    relatedWikiPageKeys:
      (isFinanceDiscoveryAnswerMetadata(discoveryAnswerMetadata)
        ? discoveryAnswerMetadata.relatedWikiPages.map((page) => page.pageKey)
        : null) ??
      input.existingBundle?.relatedWikiPageKeys ??
      [],
    riskSummary:
      readArtifactSummary(latestArtifacts.logExcerpt) ??
      (!hasCurrentExecutionEvidence
        ? normalizeSentence(input.existingBundle?.riskSummary ?? null)
        : null),
    rollbackSummary: !hasCurrentExecutionEvidence
      ? normalizeSentence(input.existingBundle?.rollbackSummary ?? null)
      : null,
    targetRepoFullName,
    timestamps: buildProofBundleTimestamps({
      artifacts: evidenceArtifacts,
      latestApproval,
      mission: input.mission,
      pullRequestArtifact: latestArtifacts.pullRequest,
    }),
    validationSummary:
      readArtifactSummary(latestArtifacts.testReport) ??
      normalizeSentence(input.existingBundle?.validationSummary ?? null),
  };
}

function readLatestArtifacts(
  artifacts: ArtifactRecord[],
): ProofBundleLatestArtifacts {
  return {
    discoveryAnswer: readLatestArtifactByKind(artifacts, "discovery_answer"),
    diffSummary: readLatestArtifactByKind(artifacts, "diff_summary"),
    logExcerpt: readLatestArtifactByKind(artifacts, "log_excerpt"),
    plan: readLatestArtifactByKind(artifacts, "plan"),
    pullRequest: readLatestArtifactByKind(artifacts, "pr_link"),
    testReport: readLatestArtifactByKind(artifacts, "test_report"),
  };
}

function readLatestTaskByRole(
  tasks: MissionTaskRecord[],
  role: MissionTaskRecord["role"],
) {
  return (
    [...tasks]
      .filter((task) => task.role === role)
      .sort(
        (left, right) =>
          left.sequence - right.sequence || left.id.localeCompare(right.id),
      )
      .at(-1) ?? null
  );
}

function isFinanceDiscoveryAnswerMetadata(
  metadata: DiscoveryAnswerArtifactMetadata | null,
): metadata is Extract<
  DiscoveryAnswerArtifactMetadata,
  { source: "stored_finance_twin_and_cfo_wiki" }
> {
  return metadata?.source === "stored_finance_twin_and_cfo_wiki";
}

function isLegacyDiscoveryAnswerMetadata(
  metadata: DiscoveryAnswerArtifactMetadata | null,
): metadata is Extract<
  DiscoveryAnswerArtifactMetadata,
  { source: "stored_twin_blast_radius_query" }
> {
  return metadata?.source === "stored_twin_blast_radius_query";
}

function isFinanceDiscoveryQuestion(
  question: DiscoveryMissionQuestion | null,
): question is Extract<DiscoveryMissionQuestion, { companyKey: string }> {
  return typeof question === "object" && question !== null && "companyKey" in question;
}

function isPolicyLookupDiscoveryQuestion(
  question: DiscoveryMissionQuestion | null,
): question is Extract<DiscoveryMissionQuestion, { policySourceId: string }> {
  return typeof question === "object" && question !== null && "policySourceId" in question;
}

function summarizeLimitations(limitations: string[]) {
  const normalized = limitations.filter((entry) => entry.trim().length > 0);

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length === 1) {
    return normalized[0];
  }

  return `${normalized[0]} ${normalized.length - 1} additional limitation${normalized.length === 2 ? "" : "s"} remain visible.`;
}

function readFinancePolicySourceScope(
  metadata: DiscoveryAnswerArtifactMetadata | null,
): FinancePolicySourceScopeSummary | null {
  if (!isFinanceDiscoveryAnswerMetadata(metadata)) {
    return null;
  }

  if (metadata.policySourceScope) {
    return metadata.policySourceScope;
  }

  if (metadata.policySourceId === null) {
    return null;
  }

  const boundSource = metadata.structuredData.boundSource;

  if (
    typeof boundSource !== "object" ||
    boundSource === null ||
    Array.isArray(boundSource)
  ) {
    return null;
  }

  const boundSourceRecord = boundSource as Record<string, unknown>;
  const sourceName = readMetadataString(boundSourceRecord, "sourceName");
  const documentRole = readMetadataString(boundSourceRecord, "documentRole");
  const includeInCompile = readMetadataBoolean(
    boundSourceRecord,
    "includeInCompile",
  );
  const latestExtractStatus = readMetadataString(
    boundSourceRecord,
    "latestExtractStatus",
  );
  const latestSnapshotVersion = readMetadataPositiveInt(
    boundSourceRecord,
    "latestSnapshotVersion",
  );

  return {
    policySourceId: metadata.policySourceId,
    sourceName,
    documentRole:
      documentRole === null ? null : (documentRole as FinancePolicySourceScopeSummary["documentRole"]),
    includeInCompile,
    latestExtractStatus:
      latestExtractStatus === null
        ? null
        : (latestExtractStatus as FinancePolicySourceScopeSummary["latestExtractStatus"]),
    latestSnapshotVersion,
  };
}

function readLatestApproval(
  approvals: ApprovalRecord[],
): ProofBundleLatestApproval | null {
  const latestApproval =
    [...approvals]
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .at(-1) ?? null;

  if (!latestApproval) {
    return null;
  }

  return {
    id: latestApproval.id,
    kind: latestApproval.kind,
    status: latestApproval.status,
    requestedBy: latestApproval.requestedBy,
    resolvedBy: latestApproval.resolvedBy,
    rationale: latestApproval.rationale,
    createdAt: latestApproval.createdAt,
    updatedAt: latestApproval.updatedAt,
  };
}

function buildDecisionTrace(input: {
  artifacts: ArtifactRecord[];
  latestApproval: ProofBundleLatestApproval | null;
  latestExecutorTask: MissionTaskRecord | null;
  latestPlannerTask: MissionTaskRecord | null;
  latestScoutTask: MissionTaskRecord | null;
  pullRequestArtifact: ArtifactRecord | null;
  taskById: Map<string, MissionTaskRecord>;
}) {
  const lines: string[] = [];

  if (input.latestPlannerTask) {
    const planArtifact = input.artifacts.find((artifact) => artifact.kind === "plan");

    if (planArtifact) {
      lines.push(
        `Planner task ${input.latestPlannerTask.sequence} produced plan artifact ${planArtifact.id}.`,
      );
    }
  }

  if (input.latestExecutorTask) {
    const executorArtifacts = input.artifacts.filter(
      (artifact) =>
        artifact.taskId === input.latestExecutorTask?.id &&
        artifact.kind !== "plan",
    );

    if (executorArtifacts.length > 0) {
      lines.push(
        `Executor task ${input.latestExecutorTask.sequence} terminalized as ${input.latestExecutorTask.status} with persisted evidence.`,
      );
    }
  }

  if (input.latestScoutTask) {
    const scoutArtifacts = input.artifacts.filter(
      (artifact) =>
        artifact.taskId === input.latestScoutTask?.id &&
        artifact.kind === "discovery_answer",
    );

    if (scoutArtifacts.length > 0) {
      lines.push(
        `Scout task ${input.latestScoutTask.sequence} terminalized as ${input.latestScoutTask.status} with persisted discovery evidence.`,
      );
    }
  }

  for (const artifact of input.artifacts) {
    if (artifact.kind === "plan") {
      continue;
    }

    const task = artifact.taskId ? input.taskById.get(artifact.taskId) : null;
    const taskPrefix = task
      ? `${capitalizeRole(task.role)} task ${task.sequence}`
      : "Mission";

    lines.push(`${taskPrefix} produced ${artifact.kind} artifact ${artifact.id}.`);
  }

  if (input.pullRequestArtifact) {
    const repoFullName = readMetadataString(
      input.pullRequestArtifact.metadata,
      "repoFullName",
    );
    const branchName =
      readMetadataString(input.pullRequestArtifact.metadata, "branchName") ??
      readMetadataString(input.pullRequestArtifact.metadata, "headBranch");
    const prNumber = readMetadataPositiveInt(
      input.pullRequestArtifact.metadata,
      "prNumber",
    );
    const draft =
      typeof input.pullRequestArtifact.metadata.draft === "boolean"
        ? input.pullRequestArtifact.metadata.draft
        : true;

    if (repoFullName && branchName && prNumber) {
      lines.push(
        `Executor task ${input.latestExecutorTask?.sequence ?? "?"} opened ${draft ? "draft " : ""}PR #${prNumber} for ${repoFullName} from branch ${branchName}.`,
      );
    }
  }

  if (input.latestApproval) {
    const resolution =
      input.latestApproval.resolvedBy !== null
        ? ` by ${input.latestApproval.resolvedBy}`
        : "";

    lines.push(
      `Latest approval ${input.latestApproval.kind} is ${input.latestApproval.status}${resolution}.`,
    );
  }

  return lines.filter(
    (line, index, allLines) => allLines.indexOf(line) === index,
  );
}

function buildProofBundleTimestamps(input: {
  artifacts: ArtifactRecord[];
  latestApproval: ProofBundleLatestApproval | null;
  mission: MissionRecord;
  pullRequestArtifact: ArtifactRecord | null;
}): ProofBundleTimestamps {
  const latestPlannerEvidenceAt =
    readLatestArtifactByKind(input.artifacts, "plan")?.createdAt ?? null;
  const latestExecutorEvidenceAt =
    [
      readLatestArtifactByKind(input.artifacts, "diff_summary")?.createdAt ?? null,
      readLatestArtifactByKind(input.artifacts, "test_report")?.createdAt ?? null,
      readLatestArtifactByKind(input.artifacts, "log_excerpt")?.createdAt ?? null,
    ]
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;
  const latestPullRequestAt =
    readMetadataString(input.pullRequestArtifact?.metadata, "publishedAt") ??
    input.pullRequestArtifact?.createdAt ??
    null;
  const latestArtifactAt = input.artifacts.at(-1)?.createdAt ?? null;

  return {
    missionCreatedAt: input.mission.createdAt,
    latestPlannerEvidenceAt,
    latestExecutorEvidenceAt,
    latestPullRequestAt,
    latestApprovalAt: input.latestApproval?.updatedAt ?? null,
    latestArtifactAt,
  };
}

function readLatestArtifactByKind(
  artifacts: ArtifactRecord[],
  kind: ArtifactKind,
) {
  return (
    [...artifacts]
      .filter((artifact) => artifact.kind === kind)
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .at(-1) ?? null
  );
}

function readPresentArtifactKinds(artifacts: ArtifactRecord[]) {
  return Array.from(new Set(artifacts.map((artifact) => artifact.kind))).sort();
}

function readArtifactSummary(artifact: ArtifactRecord | null) {
  const summary = readMetadataString(artifact?.metadata, "summary");
  return summary ? truncate(normalizeSentence(summary) ?? summary, SUMMARY_MAX_LENGTH) : null;
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readMetadataPositiveInt(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];

  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^[1-9]\d*$/.test(value)) {
    return Number(value);
  }

  return null;
}

function readMetadataBoolean(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "boolean" ? value : null;
}

function readMetadataUrl(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = readMetadataString(metadata, key);

  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function readFullRepoName(value: string | null) {
  if (!value || !value.includes("/")) {
    return null;
  }

  return value;
}

function capitalizeRole(role: MissionTaskRecord["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
