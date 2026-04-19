import type {
  CreateDiligencePacketMissionInput,
  FinancePolicySourceScopeSummary,
  MissionSpec,
  MissionSourceKind,
  ReportingMissionInput,
} from "@pocket-cto/domain";
import {
  CreateDiligencePacketMissionInputSchema,
  readFinanceDiscoveryQuestionKindLabel,
} from "@pocket-cto/domain";
import { AppHttpError } from "../../lib/http-errors";
import type { MissionCompilationResult } from "./compiler";
import { readMissionReportingView } from "../reporting/artifact";
import type { MissionRepository } from "./repository";

const DILIGENCE_PACKET_INTAKE_COMPILER: MissionCompilationResult = {
  compilerName: "typed-diligence-packet-intake",
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
    deliverables: ["diligence_packet", "proof_bundle"],
    evidenceRequirements: ["stored reporting evidence"],
  },
};

type DiligencePacketCreationSource = {
  companyKey: string | null;
  policySourceId: string | null;
  policySourceScope: FinancePolicySourceScopeSummary | null;
  questionKind: ReportingMissionInput["questionKind"];
  sourceDiscoveryMissionId: string;
  sourceReportingMissionId: string;
};

export async function buildDiligencePacketMissionCreationInput(
  rawInput: CreateDiligencePacketMissionInput,
  deps: {
    missionRepository: Pick<
      MissionRepository,
      "getMissionById" | "getProofBundleByMissionId" | "listArtifactsByMissionId"
    >;
  },
) {
  const input = CreateDiligencePacketMissionInputSchema.parse(rawInput);
  const source = await resolveDiligencePacketCreationSource(
    input.sourceReportingMissionId,
    deps,
  );
  const reportingRequest = buildDiligencePacketMissionInput(source);
  const spec = buildDiligencePacketMissionSpec(reportingRequest);

  return {
    compilation: {
      ...DILIGENCE_PACKET_INTAKE_COMPILER,
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
        sourceReportingMissionId: input.sourceReportingMissionId,
        reportKind: "diligence_packet",
      },
      null,
      2,
    ),
    sourceKind: "manual_reporting" as MissionSourceKind,
    sourceRef: null,
    spec,
  };
}

async function resolveDiligencePacketCreationSource(
  sourceReportingMissionId: string,
  deps: {
    missionRepository: Pick<
      MissionRepository,
      "getMissionById" | "getProofBundleByMissionId" | "listArtifactsByMissionId"
    >;
  },
): Promise<DiligencePacketCreationSource> {
  const sourceMission = await deps.missionRepository.getMissionById(
    sourceReportingMissionId,
  );

  if (!sourceMission) {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} does not exist.`,
    );
  }

  if (sourceMission.type !== "reporting") {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Mission ${sourceReportingMissionId} is ${sourceMission.type}, not a reporting mission.`,
    );
  }

  if (sourceMission.status !== "succeeded") {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} must have status \`succeeded\` before draft diligence-packet reporting can start.`,
    );
  }

  const [artifacts, sourceProofBundle] = await Promise.all([
    deps.missionRepository.listArtifactsByMissionId(sourceReportingMissionId),
    deps.missionRepository.getProofBundleByMissionId(sourceReportingMissionId),
  ]);

  if (!sourceProofBundle) {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} has no persisted proof bundle.`,
    );
  }

  const reportingView = readMissionReportingView({
    artifacts,
    proofBundle: sourceProofBundle,
  });

  if (!reportingView) {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} has no persisted reporting view.`,
    );
  }

  if (reportingView.reportKind !== "finance_memo") {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} has report kind ${reportingView.reportKind}, not finance_memo.`,
    );
  }

  if (!reportingView.financeMemo || !reportingView.evidenceAppendix) {
    throw createInvalidRequestError(
      "sourceReportingMissionId",
      `Reporting mission ${sourceReportingMissionId} must store both finance_memo and evidence_appendix artifacts before draft diligence-packet reporting can start.`,
    );
  }

  return {
    companyKey: reportingView.companyKey,
    policySourceId: reportingView.policySourceId,
    policySourceScope: reportingView.policySourceScope,
    questionKind: reportingView.questionKind,
    sourceDiscoveryMissionId: reportingView.sourceDiscoveryMissionId,
    sourceReportingMissionId,
  };
}

function buildDiligencePacketMissionInput(
  input: DiligencePacketCreationSource,
): ReportingMissionInput {
  return {
    sourceDiscoveryMissionId: input.sourceDiscoveryMissionId,
    sourceReportingMissionId: input.sourceReportingMissionId,
    reportKind: "diligence_packet",
    companyKey: input.companyKey,
    questionKind: input.questionKind,
    policySourceId: input.policySourceId,
    policySourceScope: input.policySourceScope,
  };
}

function buildDiligencePacketMissionSpec(
  input: ReportingMissionInput,
): MissionSpec {
  return {
    type: "reporting",
    title: buildDiligencePacketMissionTitle(input),
    objective: buildDiligencePacketMissionObjective(input),
    repos: [],
    constraints: {
      mustNot: [
        "do not invoke the codex runtime",
        "do not read generic chat text or freeform diligence-packet prompts",
        "do not invent or restate finance facts beyond stored reporting evidence",
        "do not hide stale, partial, missing, or conflicting stored evidence",
        "do not add approval workflow, release workflow, filing, export, PDF export, or slide export",
      ],
      allowedPaths: [],
    },
    acceptance: [
      "persist one draft diligence_packet artifact",
      "refresh the reporting proof bundle with source reporting lineage, linked appendix posture, freshness, and limitations",
      "compile only from the completed source reporting mission and its stored finance memo plus evidence appendix",
    ],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: ["diligence_packet", "proof_bundle"],
    evidenceRequirements: [
      "stored finance_memo artifact",
      "stored evidence_appendix artifact",
      "stored source reporting proof bundle",
      "stored related route paths and related CFO Wiki page keys",
      "stored freshness posture and visible limitations",
    ],
    input: {
      reportingRequest: input,
    },
  };
}

function buildDiligencePacketMissionTitle(input: ReportingMissionInput) {
  const companySegment = input.companyKey ?? "the scoped company";

  if (input.questionKind) {
    return `Draft diligence packet for ${companySegment} from ${readFinanceDiscoveryQuestionKindLabel(input.questionKind).toLowerCase()} reporting`;
  }

  return `Draft diligence packet for ${companySegment}`;
}

function buildDiligencePacketMissionObjective(input: ReportingMissionInput) {
  return `Compile one draft diligence packet from completed reporting mission ${input.sourceReportingMissionId} and its stored finance memo plus evidence appendix only.`;
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
