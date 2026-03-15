import type { MissionRecord, MissionTaskRecord } from "@pocket-cto/domain";

const MAX_PR_TITLE_LENGTH = 120;

export function buildGitHubPublishCommitMessage(input: {
  mission: Pick<MissionRecord, "id">;
  task: Pick<MissionTaskRecord, "role" | "sequence">;
}) {
  return `pocket-cto: mission ${input.mission.id} task ${input.task.sequence}-${input.task.role}`;
}

export function buildGitHubPublishPullRequestTitle(input: {
  mission: Pick<MissionRecord, "title">;
}) {
  return truncate(`Pocket CTO: ${input.mission.title.trim()}`, MAX_PR_TITLE_LENGTH);
}

export function buildGitHubPublishPullRequestBody(input: {
  baseBranch: string;
  branchName: string;
  executorSummary: string | null;
  mission: Pick<MissionRecord, "id" | "objective" | "title">;
  repoFullName: string;
  task: Pick<MissionTaskRecord, "role" | "sequence">;
}) {
  const summary =
    input.executorSummary?.trim() ||
    "Pocket CTO completed validated workspace changes for this task.";
  const proofBundleUri = `pocket-cto://missions/${input.mission.id}/proof-bundle-manifest`;

  return [
    "## Mission",
    `- Title: ${input.mission.title}`,
    `- Objective: ${input.mission.objective}`,
    `- Mission ID: ${input.mission.id}`,
    `- Task: ${input.task.sequence}-${input.task.role}`,
    "",
    "## Summary",
    summary,
    "",
    "## Evidence",
    `- Repository: ${input.repoFullName}`,
    `- Head branch: ${input.branchName}`,
    `- Base branch: ${input.baseBranch}`,
    `- Proof bundle: ${proofBundleUri}`,
    "",
    "## Operator review",
    "- This pull request was opened as a draft by Pocket CTO through the GitHub App installation.",
    "- Review the linked proof bundle and local validation artifacts before any manual follow-up.",
    "- Pocket CTO will not merge this pull request automatically.",
  ].join("\n");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
