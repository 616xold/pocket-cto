import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";
import type { ExecutorPlannerArtifactRecord } from "../missions/planner-artifact";
import type { WorkspaceRecord } from "../workspaces";
import {
  readWorkflowPolicyContext,
  type WorkflowPolicyContext,
} from "./workflow-policy-context";

export type ExecutorPromptContext = {
  mission: {
    acceptance: string[];
    constraints: MissionRecord["spec"]["constraints"];
    evidenceRequirements: string[];
    objective: string;
    type: MissionRecord["type"];
  };
  plannerArtifact: ExecutorPlannerArtifactRecord;
  task: {
    role: MissionTaskRecord["role"];
    sequence: number;
  };
  workflowPolicy: WorkflowPolicyContext | null;
  workspace: {
    branchName: string | null;
    repo: string;
    rootPath: string;
  };
};

export async function loadExecutorPromptContext(input: {
  mission: MissionRecord;
  plannerArtifact: ExecutorPlannerArtifactRecord;
  task: MissionTaskRecord;
  workspace: WorkspaceRecord;
}): Promise<ExecutorPromptContext> {
  return {
    mission: {
      acceptance: [...input.mission.spec.acceptance],
      constraints: input.mission.spec.constraints,
      evidenceRequirements: [...input.mission.spec.evidenceRequirements],
      objective: input.mission.objective,
      type: input.mission.type,
    },
    plannerArtifact: input.plannerArtifact,
    task: {
      role: input.task.role,
      sequence: input.task.sequence,
    },
    workflowPolicy: await readWorkflowPolicyContext(input.workspace.rootPath),
    workspace: {
      branchName: input.workspace.branchName,
      repo: input.workspace.repo,
      rootPath: input.workspace.rootPath,
    },
  };
}
