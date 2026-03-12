import type { MissionTaskRecord } from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { PlannerPromptContext } from "../runtime-codex/planner-context";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { EvidenceService, PlannerArtifactCapture } from "./service";

const PLANNER_CAPTURE_STRATEGY = "completed_text_outputs.plan_agent_message.v1";
const PLANNER_TEXT_OUTPUT_TYPES = new Set(["plan", "agentMessage"]);

type PlannerOutputDeps = {
  evidenceService: Pick<
    EvidenceService,
    | "attachPlannerArtifactToProofBundle"
    | "buildPlannerArtifact"
    | "buildPlannerTaskSummary"
  >;
  missionRepository: Pick<
    MissionRepository,
    | "getMissionById"
    | "getProofBundleByMissionId"
    | "saveArtifact"
    | "updateTaskSummary"
    | "upsertProofBundle"
  >;
  replayService: Pick<ReplayService, "append">;
};

export async function persistPlannerTurnEvidence(input: {
  deps: PlannerOutputDeps;
  plannerContext: PlannerPromptContext | null;
  session: PersistenceSession;
  task: MissionTaskRecord;
  turn: RuntimeCodexRunTurnResult;
}): Promise<MissionTaskRecord> {
  if (input.task.role !== "planner" || input.turn.status !== "completed") {
    return input.task;
  }

  const plannerCapture = buildPlannerArtifactCapture(input.turn);

  if (!plannerCapture || !input.plannerContext) {
    return input.task;
  }

  const mission = await input.deps.missionRepository.getMissionById(
    input.task.missionId,
    input.session,
  );

  if (!mission) {
    throw new Error(`Mission ${input.task.missionId} not found`);
  }

  const summary = input.deps.evidenceService.buildPlannerTaskSummary(
    plannerCapture.body,
  );
  const taskWithSummary = await input.deps.missionRepository.updateTaskSummary(
    input.task.id,
    summary,
    input.session,
  );
  const artifactDraft = input.deps.evidenceService.buildPlannerArtifact({
    mission,
    plannerCapture,
    plannerContext: input.plannerContext,
    summary,
    task: taskWithSummary,
    turn: input.turn,
  });
  const artifact = await input.deps.missionRepository.saveArtifact(
    artifactDraft,
    input.session,
  );

  await input.deps.replayService.append(
    {
      missionId: taskWithSummary.missionId,
      taskId: taskWithSummary.id,
      type: "artifact.created",
      payload: {
        artifactId: artifact.id,
        kind: artifact.kind,
      },
    },
    input.session,
  );

  const proofBundle = await input.deps.missionRepository.getProofBundleByMissionId(
    taskWithSummary.missionId,
    input.session,
  );

  if (proofBundle) {
    await input.deps.missionRepository.upsertProofBundle(
      input.deps.evidenceService.attachPlannerArtifactToProofBundle(
        proofBundle,
        {
          artifactId: artifact.id,
          task: taskWithSummary,
        },
      ),
      input.session,
    );
  }

  return taskWithSummary;
}

export function buildPlannerArtifactCapture(
  turn: RuntimeCodexRunTurnResult,
): PlannerArtifactCapture | null {
  const blocks: string[] = [];
  const sourceItems: PlannerArtifactCapture["sourceItems"] = [];

  for (const output of turn.completedTextOutputs) {
    if (!PLANNER_TEXT_OUTPUT_TYPES.has(output.itemType)) {
      continue;
    }

    const normalizedText = normalizeTextBlock(output.text);

    if (!normalizedText) {
      continue;
    }

    if (blocks[blocks.length - 1] === normalizedText) {
      continue;
    }

    blocks.push(normalizedText);
    sourceItems.push({
      itemId: output.itemId,
      itemType: output.itemType,
    });
  }

  if (blocks.length === 0) {
    return null;
  }

  return {
    body: blocks.join("\n\n"),
    captureStrategy: PLANNER_CAPTURE_STRATEGY,
    sourceItems,
  };
}

function normalizeTextBlock(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}
