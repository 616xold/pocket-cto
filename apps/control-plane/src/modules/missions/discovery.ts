import { posix } from "node:path";
import type {
  CreateDiscoveryMissionInput,
  MissionSpec,
  MissionSourceKind,
} from "@pocket-cto/domain";
import {
  CreateDiscoveryMissionInputSchema,
  DiscoveryMissionQuestionSchema,
} from "@pocket-cto/domain";
import type { MissionCompilationResult } from "./compiler";

const DISCOVERY_INTAKE_COMPILER: MissionCompilationResult = {
  compilerName: "typed-discovery-intake",
  compilerVersion: "0.1.0",
  confidence: 100,
  spec: {
    type: "discovery",
    title: "placeholder",
    objective: "placeholder",
    repos: ["placeholder"],
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

export function buildDiscoveryMissionCreationInput(rawInput: CreateDiscoveryMissionInput) {
  const input = CreateDiscoveryMissionInputSchema.parse(rawInput);
  const question = DiscoveryMissionQuestionSchema.parse({
    repoFullName: input.repoFullName.trim(),
    questionKind: input.questionKind,
    changedPaths: normalizeChangedPaths(input.changedPaths),
  });
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
    primaryRepo: question.repoFullName,
    rawText: JSON.stringify(question, null, 2),
    sourceKind: "manual_discovery" as MissionSourceKind,
    sourceRef: null,
    spec,
  };
}

function buildDiscoveryMissionSpec(input: {
  repoFullName: string;
  questionKind: CreateDiscoveryMissionInput["questionKind"];
  changedPaths: string[];
}): MissionSpec {
  const title = buildDiscoveryTitle(input.repoFullName, input.questionKind);
  const objective = buildDiscoveryObjective(input.repoFullName, input.changedPaths);

  return {
    type: "discovery",
    title,
    objective,
    repos: [input.repoFullName],
    constraints: {
      mustNot: [
        "do not invoke the codex runtime",
        "do not resync the engineering twin during execution",
        "do not hide stale, failed, or missing twin state",
      ],
      allowedPaths: input.changedPaths,
    },
    acceptance: [
      "persist one durable discovery answer artifact",
      "surface impacted directories, manifests, owners, related test suites, and mapped CI jobs when stored state supports them",
      "surface freshness posture and limitations honestly",
    ],
    riskBudget: {
      sandboxMode: "read-only",
      maxWallClockMinutes: 5,
      maxCostUsd: 1,
      allowNetwork: false,
      requiresHumanApprovalFor: [],
    },
    deliverables: ["discovery_answer", "proof_bundle"],
    evidenceRequirements: [
      "stored twin blast-radius answer",
      "freshness limitations",
    ],
    input: {
      discoveryQuestion: input,
    },
  };
}

function buildDiscoveryTitle(
  repoFullName: string,
  questionKind: CreateDiscoveryMissionInput["questionKind"],
) {
  switch (questionKind) {
    case "auth_change":
      return `Assess auth-change blast radius for ${repoFullName}`;
  }
}

function buildDiscoveryObjective(repoFullName: string, changedPaths: string[]) {
  const renderedPaths = changedPaths.join(", ");
  return `Answer the stored auth-change blast radius for ${repoFullName} across: ${renderedPaths}.`;
}

function normalizeChangedPaths(paths: string[]) {
  return [...new Set(paths.map(normalizeRepoRelativePath))];
}

function normalizeRepoRelativePath(path: string) {
  const normalized = posix.normalize(path.trim().replaceAll("\\", "/"));
  const withoutDotPrefix = normalized.startsWith("./")
    ? normalized.slice(2)
    : normalized;
  return withoutDotPrefix === "." ? "" : withoutDotPrefix;
}
