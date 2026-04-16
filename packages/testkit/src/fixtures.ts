import type {
  MissionSpec,
  ProofBundleManifest,
  ReplayEvent,
} from "@pocket-cto/domain";

export function buildMissionFixture(): MissionSpec {
  return {
    type: "build",
    title: "Implement passkeys",
    objective: "Implement passkey sign-in without breaking email login",
    repos: ["web", "auth-service"],
    constraints: {
      mustNot: ["disable email login"],
      allowedPaths: [],
      targetBranch: "main",
    },
    acceptance: [
      "users can register and sign in with passkeys",
      "existing email login still works",
    ],
    riskBudget: {
      sandboxMode: "patch-only",
      maxWallClockMinutes: 60,
      maxCostUsd: 12,
      allowNetwork: false,
      requiresHumanApprovalFor: ["merge"],
    },
    deliverables: ["plan", "pull_request", "proof_bundle", "approval_card"],
    evidenceRequirements: ["test report", "screenshot", "rollback note"],
  };
}

export function proofBundlePlaceholderFixture(
  missionId: string,
): ProofBundleManifest {
  return {
    missionId,
    missionTitle: "",
    objective: "Placeholder objective",
    companyKey: null,
    questionKind: null,
    policySourceId: null,
    policySourceScope: null,
    answerSummary: "",
    freshnessState: null,
    freshnessSummary: "",
    limitationsSummary: "",
    relatedRoutePaths: [],
    relatedWikiPageKeys: [],
    targetRepoFullName: null,
    branchName: null,
    pullRequestNumber: null,
    pullRequestUrl: null,
    changeSummary: "",
    validationSummary: "",
    verificationSummary: "",
    riskSummary: "",
    rollbackSummary: "",
    latestApproval: null,
    evidenceCompleteness: {
      status: "missing",
      expectedArtifactKinds: [],
      presentArtifactKinds: [],
      missingArtifactKinds: [],
      notes: [],
    },
    decisionTrace: [],
    artifactIds: [],
    artifacts: [],
    replayEventCount: 0,
    timestamps: {
      missionCreatedAt: "",
      latestPlannerEvidenceAt: null,
      latestExecutorEvidenceAt: null,
      latestPullRequestAt: null,
      latestApprovalAt: null,
      latestArtifactAt: null,
    },
    status: "placeholder",
  };
}

export function replayEventFixture(missionId: string): ReplayEvent {
  return {
    id: crypto.randomUUID(),
    missionId,
    taskId: null,
    sequence: 1,
    type: "mission.created",
    actor: "system",
    occurredAt: new Date().toISOString(),
    payload: { reason: "fixture" },
  };
}
