import type { UserInput } from "@pocket-cto/codex-runtime";
import type { ExecutorPromptContext } from "./executor-context";

export function buildExecutorTurnInput(
  context: ExecutorPromptContext,
): UserInput[] {
  const lines = [
    "You are the Pocket CTO executor task. Implement the approved change only inside the assigned task workspace.",
    "",
    "Mission contract:",
    `- Objective: ${context.mission.objective}`,
    `- Mission type: ${context.mission.type}`,
    `- Task role: ${context.task.role}`,
    `- Task sequence: ${context.task.sequence}`,
    "",
    "Constraints:",
    ...formatConstraints(context),
    "",
    "Acceptance criteria:",
    ...formatList(context.mission.acceptance),
    "",
    "Evidence requirements:",
    ...formatList(context.mission.evidenceRequirements),
    "",
    "Workspace context:",
    `- Source repo root: ${context.workspace.repo}`,
    `- Task workspace root: ${context.workspace.rootPath}`,
    `- Current task branch: ${context.workspace.branchName ?? "(not assigned)"}`,
    "",
    "Planner handoff:",
    `- Planner artifact id: ${context.plannerArtifact.artifactId}`,
    `- Planner artifact uri: ${context.plannerArtifact.uri}`,
    `- Resolution strategy: ${context.plannerArtifact.resolution}`,
    `- Resolution justification: ${context.plannerArtifact.justification}`,
    `- Planner summary: ${context.plannerArtifact.summary ?? "(not available)"}`,
    "- Planner artifact body:",
    context.plannerArtifact.body,
    "",
    context.workflowPolicy
      ? `Repository workflow policy excerpt (${context.workflowPolicy.path}):`
      : "Repository workflow policy excerpt:",
    context.workflowPolicy?.excerpt ??
      "- No WORKFLOW.md file was found at the workspace root.",
    "",
    "Mutation boundary:",
    ...formatMutationBoundary(context),
    "",
    "Final report:",
    "Respond concisely in plain text using exactly these sections:",
    "## Intended change",
    "## Files changed",
    "## Validations run",
    "## Remaining risks",
    "## Operator handoff",
  ];

  return [
    {
      type: "text",
      text: lines.join("\n"),
      text_elements: [],
    },
  ];
}

function formatConstraints(context: ExecutorPromptContext) {
  return [
    `- Must not: ${formatInlineList(context.mission.constraints.mustNot)}`,
    `- Allowed paths: ${formatAllowedPaths(context.mission.constraints.allowedPaths)}`,
    `- Target branch: ${context.mission.constraints.targetBranch ?? "(unspecified)"}`,
  ];
}

function formatMutationBoundary(context: ExecutorPromptContext) {
  const allowedPaths = context.mission.constraints.allowedPaths;

  return [
    allowedPaths.length > 0
      ? `- You may mutate only these relative paths under the task workspace root: ${allowedPaths.join(", ")}`
      : "- You may mutate files only inside the task workspace root. There is no narrower mission allowlist for this task.",
    "- Never create, edit, rename, or delete anything outside the task workspace root.",
    "- Never change files outside the allowed paths listed above when an allowed-path list is provided.",
    "- Do not change branches, create commits, push, merge, rebase, cherry-pick, stash, or reset.",
    "- Do not perform destructive cleanup or delete unrelated files.",
    "- Do not use network access.",
    "- Do not run installs, generators, migrations, package manager commands, or formatters.",
    "- If a requested step would require any forbidden action, stop and explain that in the final report.",
  ];
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return ["- None specified."];
  }

  return values.map((value) => `- ${value}`);
}

function formatAllowedPaths(values: string[]) {
  return values.length > 0 ? values.join("; ") : "(workspace root only)";
}

function formatInlineList(values: string[]) {
  return values.length > 0 ? values.join("; ") : "(none)";
}
