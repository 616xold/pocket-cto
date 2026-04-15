import type {
  CreateDiscoveryMissionInput,
  FinanceDiscoveryQuestion,
  FinancePolicyLookupQuestion,
  MissionSpec,
  MissionSourceKind,
} from "@pocket-cto/domain";
import {
  CreateDiscoveryMissionInputSchema,
  FinanceDiscoveryQuestionSchema,
} from "@pocket-cto/domain";
import { AppHttpError } from "../../lib/http-errors";
import type { MissionCompilationResult } from "./compiler";
import {
  buildFinanceDiscoveryMissionObjective,
  buildFinanceDiscoveryMissionTitle,
  getFinanceDiscoveryFamily,
} from "../finance-discovery/family-registry";
import { resolvePolicyLookupSource } from "../finance-discovery/policy-lookup";
import type { CfoWikiService } from "../wiki/service";

const DISCOVERY_INTAKE_COMPILER: MissionCompilationResult = {
  compilerName: "typed-discovery-intake",
  compilerVersion: "0.1.0",
  confidence: 100,
  spec: {
    type: "discovery",
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
    deliverables: ["discovery_answer", "proof_bundle"],
    evidenceRequirements: ["stored twin blast-radius answer"],
  },
};

export async function buildDiscoveryMissionCreationInput(
  rawInput: CreateDiscoveryMissionInput,
  deps?: {
    cfoWikiService?: Pick<CfoWikiService, "listCompanySources">;
  },
) {
  const input = CreateDiscoveryMissionInputSchema.parse(rawInput);
  const question = FinanceDiscoveryQuestionSchema.parse({
    companyKey: input.companyKey.trim(),
    questionKind: input.questionKind,
    operatorPrompt: input.operatorPrompt?.trim() || null,
    ...(input.questionKind === "policy_lookup"
      ? {
          policySourceId: input.policySourceId,
        }
      : {}),
  });
  await validateDiscoveryMissionQuestion(question, deps);
  const spec = buildDiscoveryMissionSpec(question);

  return {
    compilation: {
      ...DISCOVERY_INTAKE_COMPILER,
      spec,
    } satisfies MissionCompilationResult,
    compilerOutput: {
      discoveryQuestion: question,
      spec,
    } satisfies Record<string, unknown>,
    createdBy: input.requestedBy,
    primaryRepo: null,
    rawText: JSON.stringify(question, null, 2),
    sourceKind: "manual_discovery" as MissionSourceKind,
    sourceRef: null,
    spec,
  };
}

async function validateDiscoveryMissionQuestion(
  question: FinanceDiscoveryQuestion,
  deps?: {
    cfoWikiService?: Pick<CfoWikiService, "listCompanySources">;
  },
) {
  if (question.questionKind !== "policy_lookup") {
    return;
  }

  const cfoWikiService = deps?.cfoWikiService;

  if (!cfoWikiService) {
    throw new Error(
      "Policy lookup mission intake requires a CFO Wiki source reader",
    );
  }

  const sourceList = await cfoWikiService.listCompanySources(question.companyKey);
  const resolution = resolvePolicyLookupSource(
    sourceList.sources,
    question.policySourceId,
  );

  if (resolution.status === "missing") {
    throw createInvalidRequestError(
      "policySourceId",
      `Policy source ${question.policySourceId} is not bound for company ${question.companyKey}.`,
    );
  }

  if (resolution.status === "not_policy_document") {
    throw createInvalidRequestError(
      "policySourceId",
      `Policy source ${question.policySourceId} is bound for company ${question.companyKey}, but not as a \`policy_document\`.`,
    );
  }
}

function buildDiscoveryMissionSpec(input: FinanceDiscoveryQuestion): MissionSpec {
  const title =
    input.questionKind === "policy_lookup"
      ? buildPolicyLookupMissionTitle(input)
      : buildFinanceDiscoveryMissionTitle(input.questionKind, input.companyKey);
  const objective =
    input.questionKind === "policy_lookup"
      ? buildPolicyLookupMissionObjective(input)
      : buildFinanceDiscoveryMissionObjective(input.questionKind, input.companyKey);
  const evidenceRequirements =
    input.questionKind === "policy_lookup"
      ? [
          `compiled CFO Wiki page policies/${input.policySourceId}`,
          "same-source CFO Wiki digest pages when useful",
          "concepts/policy-corpus when useful",
          "bound-source metadata and latest deterministic extract status",
        ]
      : buildStoredStateEvidenceRequirements(input);
  const mustNot =
    input.questionKind === "policy_lookup"
      ? [
          "do not invoke the codex runtime",
          "do not resync the finance twin during execution",
          "do not recompile the CFO Wiki during execution",
          "do not add generic finance chat or freeform answer generation",
          "do not widen beyond the explicit policySourceId scope",
          "do not search unrelated policy pages or generic document corpora",
          "do not hide stale, partial, failed, or missing stored state",
        ]
      : [
          "do not invoke the codex runtime",
          "do not resync the finance twin during execution",
          "do not recompile the CFO Wiki during execution",
          "do not add generic finance chat or freeform answer generation",
          "do not hide stale, partial, failed, or missing stored state",
        ];

  return {
    type: "discovery",
    title,
    objective,
    repos: [],
    constraints: {
      mustNot,
      allowedPaths: [],
    },
    acceptance: [
      "persist one durable discovery answer artifact",
      "persist one finance-ready proof bundle",
      "surface freshness posture, limitations, related routes, related CFO Wiki pages, and structured evidence sections honestly",
      ...(input.questionKind === "policy_lookup"
        ? ["keep policySourceId scope explicit in the mission, answer, and proof bundle"]
        : []),
    ],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: ["discovery_answer", "proof_bundle"],
    evidenceRequirements,
    input: {
      discoveryQuestion: input,
    },
  };
}

function buildStoredStateEvidenceRequirements(
  input: Exclude<FinanceDiscoveryQuestion, FinancePolicyLookupQuestion>,
) {
  const family = getFinanceDiscoveryFamily(input.questionKind);

  return [
    ...family.relatedRoutes.map(
      (route) => `stored finance-twin ${route.routePathSuffix} route`,
    ),
    "stored CFO Wiki pages when present",
    "freshness and limitation posture",
  ];
}

function buildPolicyLookupMissionTitle(input: FinancePolicyLookupQuestion) {
  return `Review policy lookup for ${input.companyKey} from ${input.policySourceId}`;
}

function buildPolicyLookupMissionObjective(input: FinancePolicyLookupQuestion) {
  return `Answer the stored policy lookup question for ${input.companyKey} from scoped policy source ${input.policySourceId}, persisted CFO Wiki state, and bound-source metadata only.`;
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
