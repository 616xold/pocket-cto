import type {
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import type { UserInput } from "@pocket-cto/codex-runtime";

export function buildReadOnlyTurnInput(input: {
  mission: MissionRecord;
  proofBundle: ProofBundleManifest | null;
  task: MissionTaskRecord;
}): UserInput[] {
  const lines = [
    `Mission objective: ${input.mission.objective}`,
    `Task role: ${input.task.role}`,
    `Mission type: ${input.mission.type}`,
    `Proof bundle status: ${input.proofBundle?.status ?? "placeholder"}`,
    "",
    roleInstructionByTask[input.task.role],
    "",
    "Safety rules:",
    "- Stay read-only.",
    "- Do not create, edit, rename, delete, or stage files.",
    "- Do not apply patches, write code, run formatters, or change git state.",
    "- Do not request or attempt approvals for file mutation, shell mutation, or network actions.",
    "- If a tool would mutate files or state, skip it and explain why.",
    "",
    "Expected output:",
    "- Summarize the current situation relevant to this task.",
    "- Call out blockers, risks, or missing context.",
    "- Suggest next safe steps for a later workspace-isolated turn.",
  ];

  return [
    {
      type: "text",
      text: lines.join("\n"),
      text_elements: [],
    },
  ];
}

const roleInstructionByTask: Record<MissionTaskRecord["role"], string> = {
  planner:
    "Inspect the repository and describe a safe plan only. Do not make changes.",
  scout:
    "Inspect the available context and report findings only. Do not make changes.",
  executor:
    "Inspect the current code and explain what an execution turn would need later. Do not make changes.",
  reviewer:
    "Inspect the current state as a reviewer and note risks or missing evidence only. Do not make changes.",
  sre: "Inspect operational context and describe risks or runbook gaps only. Do not make changes.",
};
