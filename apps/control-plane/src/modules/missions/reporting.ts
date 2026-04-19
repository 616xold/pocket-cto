import type {
  CreateReportingMissionInput,
  FinanceDiscoveryAnswerArtifactMetadata,
  FinancePolicySourceScopeSummary,
  MissionSpec,
  MissionSourceKind,
  ReportingMissionInput,
} from "@pocket-cto/domain";
import {
  CreateReportingMissionInputSchema,
  isFinanceDiscoveryAnswerArtifactMetadata,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { AppHttpError } from "../../lib/http-errors";
import type { MissionCompilationResult } from "./compiler";
import { readMissionDiscoveryAnswer } from "./discovery-answer-view";
import type { MissionRepository } from "./repository";

const REPORTING_INTAKE_COMPILER: MissionCompilationResult = {
  compilerName: "typed-reporting-intake",
  compilerVersion: "0.1.0",
  confidence: 100,
  spec: {
    type: "reporting",
    title: "placeholder",
    objective: "placeholder",
    repos: [],
    constraints: {
      mustNot: [],
      allowedPaths: [],
    },
    acceptance: ["placeholder"],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
    evidenceRequirements: ["stored discovery answer"],
  },
};

type ReportingCreationSource = {
  companyKey: string | null;
  discoveryAnswer: FinanceDiscoveryAnswerArtifactMetadata;
  policySourceId: string | null;
  policySourceScope: FinancePolicySourceScopeSummary | null;
  questionKind: FinanceDiscoveryAnswerArtifactMetadata["questionKind"];
  sourceDiscoveryMissionId: string;
};

export async function buildReportingMissionCreationInput(
  rawInput: CreateReportingMissionInput,
  deps: {
    missionRepository: Pick<
      MissionRepository,
      "getMissionById" | "getProofBundleByMissionId" | "listArtifactsByMissionId"
    >;
  },
) {
  const input = CreateReportingMissionInputSchema.parse(rawInput);
  const source = await resolveReportingCreationSource(
    input.sourceDiscoveryMissionId,
    deps,
  );
  const reportingRequest = buildReportingMissionInput(source, input.reportKind);
  const spec = buildReportingMissionSpec(reportingRequest);

  return {
    compilation: {
      ...REPORTING_INTAKE_COMPILER,
      spec,
    } satisfies MissionCompilationResult,
    compilerOutput: {
      reportingRequest,
      spec,
    } satisfies Record<string, unknown>,
    createdBy: input.requestedBy,
    primaryRepo: null,
    rawText: JSON.stringify(
      {
        sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
        reportKind: input.reportKind,
      },
      null,
      2,
    ),
    sourceKind: "manual_reporting" as MissionSourceKind,
    sourceRef: null,
    spec,
  };
}

async function resolveReportingCreationSource(
  sourceDiscoveryMissionId: string,
  deps: {
    missionRepository: Pick<
      MissionRepository,
      "getMissionById" | "getProofBundleByMissionId" | "listArtifactsByMissionId"
    >;
  },
): Promise<ReportingCreationSource> {
  const sourceMission = await deps.missionRepository.getMissionById(
    sourceDiscoveryMissionId,
  );

  if (!sourceMission) {
    throw createInvalidRequestError(
      "sourceDiscoveryMissionId",
      `Discovery mission ${sourceDiscoveryMissionId} does not exist.`,
    );
  }

  if (sourceMission.type !== "discovery") {
    throw createInvalidRequestError(
      "sourceDiscoveryMissionId",
      `Mission ${sourceDiscoveryMissionId} is ${sourceMission.type}, not a discovery mission.`,
    );
  }

  if (sourceMission.status !== "succeeded") {
    throw createInvalidRequestError(
      "sourceDiscoveryMissionId",
      `Discovery mission ${sourceDiscoveryMissionId} must have status \`succeeded\` before draft reporting can start.`,
    );
  }

  const artifacts = await deps.missionRepository.listArtifactsByMissionId(
    sourceDiscoveryMissionId,
  );
  const discoveryAnswer = readMissionDiscoveryAnswer(artifacts);

  if (!discoveryAnswer) {
    throw createInvalidRequestError(
      "sourceDiscoveryMissionId",
      `Discovery mission ${sourceDiscoveryMissionId} has no stored discovery answer artifact.`,
    );
  }

  if (!isFinanceDiscoveryAnswerArtifactMetadata(discoveryAnswer)) {
    throw createInvalidRequestError(
      "sourceDiscoveryMissionId",
      `Discovery mission ${sourceDiscoveryMissionId} does not have a finance discovery answer that F5A reporting can compile.`,
    );
  }

  const sourceProofBundle =
    await deps.missionRepository.getProofBundleByMissionId(sourceDiscoveryMissionId);

  return {
    companyKey: discoveryAnswer.companyKey,
    discoveryAnswer,
    policySourceId:
      discoveryAnswer.policySourceId ??
      sourceProofBundle?.policySourceId ??
      null,
    policySourceScope:
      discoveryAnswer.policySourceScope ??
      sourceProofBundle?.policySourceScope ??
      null,
    questionKind: discoveryAnswer.questionKind,
    sourceDiscoveryMissionId,
  };
}

function buildReportingMissionInput(
  input: ReportingCreationSource,
  reportKind: CreateReportingMissionInput["reportKind"],
): ReportingMissionInput {
  return {
    sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
    sourceReportingMissionId: null,
    reportKind,
    companyKey: input.companyKey,
    questionKind: input.questionKind,
    policySourceId: input.policySourceId,
    policySourceScope: input.policySourceScope,
  };
}

function buildReportingMissionSpec(input: ReportingMissionInput): MissionSpec {
  return {
    type: "reporting",
    title: buildReportingMissionTitle(input),
    objective: buildReportingMissionObjective(input),
    repos: [],
    constraints: {
      mustNot: [
        "do not invoke the codex runtime",
        "do not read generic chat text or freeform memo prompts",
        "do not invent or restate finance facts beyond stored discovery evidence",
        "do not hide stale, partial, missing, or conflicting stored evidence",
        "do not add release workflow, approvals, wiki filing, packet specialization, PDF export, or slide export",
      ],
      allowedPaths: [],
    },
    acceptance: [
      "persist one draft finance_memo artifact",
      "persist one linked evidence_appendix artifact",
      "refresh the reporting proof bundle with source discovery lineage, draft status, freshness, limitations, and appendix presence",
      "compile only from the completed source discovery mission and its stored evidence",
    ],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: ["finance_memo", "evidence_appendix", "proof_bundle"],
    evidenceRequirements: [
      "stored discovery_answer artifact",
      "stored source discovery proof bundle when available",
      "stored related route paths and related CFO Wiki page keys",
      "stored freshness posture and visible limitations",
    ],
    input: {
      reportingRequest: input,
    },
  };
}

function buildReportingMissionTitle(input: ReportingMissionInput) {
  const companySegment = input.companyKey ?? "the scoped company";

  if (input.questionKind) {
    return `Draft finance memo for ${companySegment} from ${readFinanceDiscoveryQuestionKindLabel(input.questionKind).toLowerCase()} discovery`;
  }

  return `Draft finance memo for ${companySegment}`;
}

function buildReportingMissionObjective(input: ReportingMissionInput) {
  return `Compile one draft finance memo plus one linked evidence appendix from completed discovery mission ${input.sourceDiscoveryMissionId} and its stored evidence only.`;
}

function createInvalidRequestError(path: string, message: string) {
  return new AppHttpError(400, {
    error: {
      code: "invalid_request",
      message: "Invalid request",
      details: [
        {
          path,
          message,
        },
      ],
    },
  });
}
