import type { MissionDetailView } from "@pocket-cto/domain";
import { notFound } from "next/navigation";
import { MissionActions } from "./mission-actions";
import { MissionCard } from "../../../components/mission-card";
import { getMissionDetail } from "../../../lib/api";

type MissionPageProps = {
  params: Promise<{ missionId: string }>;
};

export default async function MissionPage({ params }: MissionPageProps) {
  const { missionId } = await params;
  const mission = await getMissionDetail(missionId);

  if (!mission) {
    if (missionId === "demo-mission") {
      const demoMission = buildDemoMissionDetail();

      return (
        <main className="shell">
          <MissionCard
            approvalCards={demoMission.approvalCards}
            artifacts={demoMission.artifacts}
            discoveryAnswer={demoMission.discoveryAnswer}
            liveControl={demoMission.liveControl}
            mission={demoMission.mission}
            proofBundle={demoMission.proofBundle}
            tasks={demoMission.tasks}
          />
          <MissionActions
            approvalCards={demoMission.approvalCards}
            liveControl={demoMission.liveControl}
            mission={demoMission.mission}
            tasks={demoMission.tasks}
          />
        </main>
      );
    }

    notFound();
  }

  return (
    <main className="shell">
      <MissionCard
        approvalCards={mission.approvalCards}
        artifacts={mission.artifacts}
        discoveryAnswer={mission.discoveryAnswer}
        liveControl={mission.liveControl}
        mission={mission.mission}
        proofBundle={mission.proofBundle}
        tasks={mission.tasks}
      />
      <MissionActions
        approvalCards={mission.approvalCards}
        liveControl={mission.liveControl}
        mission={mission.mission}
        tasks={mission.tasks}
      />
    </main>
  );
}

function buildDemoMissionDetail(): MissionDetailView {
  const now = new Date().toISOString();

  return {
    mission: {
      id: "00000000-0000-4000-8000-000000000001",
      type: "build",
      status: "planned",
      title: "Implement passkeys for sign-in",
      objective: "Ship passkeys without breaking email login.",
      sourceKind: "manual_text",
      sourceRef: null,
      createdBy: "demo-operator",
      primaryRepo: "web",
      spec: {
        acceptance: ["Ship passkeys without breaking email login."],
        constraints: {
          allowedPaths: [],
          mustNot: [],
        },
        deliverables: [
          "Updated mission detail route with approvals and artifacts.",
        ],
        evidenceRequirements: ["approval ledger", "artifact ledger"],
        objective: "Ship passkeys without breaking email login.",
        repos: ["web"],
        riskBudget: {
          allowNetwork: false,
          maxCostUsd: 5,
          maxWallClockMinutes: 30,
          requiresHumanApprovalFor: [],
          sandboxMode: "patch-only",
        },
        title: "Implement passkeys for sign-in",
        type: "build",
      },
      createdAt: now,
      updatedAt: now,
    },
    tasks: [
      {
        id: "00000000-0000-4000-8000-000000000011",
        missionId: "00000000-0000-4000-8000-000000000001",
        role: "planner",
        sequence: 0,
        status: "pending",
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        workspaceId: null,
        dependsOnTaskId: null,
        summary: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "00000000-0000-4000-8000-000000000012",
        missionId: "00000000-0000-4000-8000-000000000001",
        role: "executor",
        sequence: 1,
        status: "pending",
        attemptCount: 0,
        codexThreadId: null,
        codexTurnId: null,
        workspaceId: null,
        dependsOnTaskId: "00000000-0000-4000-8000-000000000011",
        summary: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    proofBundle: {
      missionId: "00000000-0000-4000-8000-000000000001",
      missionTitle: "Implement passkeys for sign-in",
      objective: "Ship passkeys without breaking email login.",
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
        expectedArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
        presentArtifactKinds: [],
        missingArtifactKinds: ["plan", "diff_summary", "test_report", "pr_link"],
        notes: [
          "Planner evidence is missing.",
          "Change-summary evidence is missing.",
          "Validation evidence is missing.",
          "GitHub pull request evidence is missing.",
        ],
      },
      decisionTrace: [],
      artifactIds: [],
      artifacts: [],
      replayEventCount: 0,
      timestamps: {
        missionCreatedAt: now,
        latestPlannerEvidenceAt: null,
        latestExecutorEvidenceAt: null,
        latestPullRequestAt: null,
        latestApprovalAt: null,
        latestArtifactAt: null,
      },
      status: "placeholder",
    },
    discoveryAnswer: null,
    approvals: [],
    approvalCards: [],
    artifacts: [],
    liveControl: {
      enabled: false,
      limitation: "single_process_only",
      mode: "api_only",
    },
  };
}
