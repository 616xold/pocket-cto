import type { UserInput } from "@pocket-cto/codex-runtime";
import type { PlannerPromptContext } from "./planner-context";

export function buildPlannerTurnInput(
  context: PlannerPromptContext,
): UserInput[] {
  const lines = [
    "You are the Pocket CTO planner task. Produce a read-only implementation plan only.",
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
    `- Task branch: ${context.workspace.branchName ?? "(not assigned)"}`,
    "",
    context.workflowPolicy
      ? `Repository workflow policy excerpt (${context.workflowPolicy.path}):`
      : "Repository workflow policy excerpt:",
    context.workflowPolicy?.excerpt ??
      "- No WORKFLOW.md file was found at the workspace root.",
    "",
    "Strict read-only rules:",
    "- Do not create, edit, rename, delete, or stage files.",
    "- Do not apply patches or modify git state.",
    "- Do not run installs, generators, formatters, or other mutating setup steps.",
    "- Do not request approvals for mutation, network escalation, or any other state-changing action.",
    "- If a tool would mutate files or repository state, skip it and explain why.",
    "",
    "Respond concisely in plain text using exactly these sections:",
    "## Objective understanding",
    "## Relevant context",
    "## Risks and unknowns",
    "## Proposed steps",
    "## Validation plan",
    "## Handoff notes",
  ];

  return [
    {
      type: "text",
      text: lines.join("\n"),
      text_elements: [],
    },
  ];
}

function formatConstraints(context: PlannerPromptContext) {
  const lines = [
    `- Must not: ${formatInlineList(context.mission.constraints.mustNot)}`,
    `- Allowed paths: ${formatInlineList(context.mission.constraints.allowedPaths)}`,
    `- Target branch: ${context.mission.constraints.targetBranch ?? "(unspecified)"}`,
  ];

  return lines;
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return ["- None specified."];
  }

  return values.map((value) => `- ${value}`);
}

function formatInlineList(values: string[]) {
  return values.length > 0 ? values.join("; ") : "(none)";
}
