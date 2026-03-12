import type {
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import type { PersistenceSession } from "../../lib/persistence";
import type { MissionRepository } from "../missions/repository";
import type { ReplayService } from "../replay/service";
import type { PlannerPromptContext } from "../runtime-codex/planner-context";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type {
  EvidenceArtifactDraft,
  EvidenceService,
  PlannerArtifactCapture,
} from "./service";

const PLANNER_CAPTURE_STRATEGY = "completed_text_outputs.plan_agent_message.v1";
const PLANNER_TEXT_OUTPUT_TYPES = new Set(["plan", "agentMessage"]);

export type PreparedPlannerTurnEvidence = {
  artifactDraft: EvidenceArtifactDraft;
  proofBundle: ProofBundleManifest | null;
  summary: string;
};

type PlannerOutputDeps = {
  evidenceService: Pick<EvidenceService, "attachPlannerArtifactToProofBundle">;
  missionRepository: Pick<
    MissionRepository,
    | "saveArtifact"
    | "upsertProofBundle"
  >;
  replayService: Pick<ReplayService, "append">;
};

export async function persistPlannerTurnEvidence(input: {
  deps: PlannerOutputDeps;
  preparedEvidence: PreparedPlannerTurnEvidence;
  session: PersistenceSession;
  task: MissionTaskRecord;
  turn: RuntimeCodexRunTurnResult;
}): Promise<MissionTaskRecord> {
  if (input.task.role !== "planner" || input.turn.status !== "completed") {
    return input.task;
  }
  const artifact = await input.deps.missionRepository.saveArtifact(
    input.preparedEvidence.artifactDraft,
    input.session,
  );

  await input.deps.replayService.append(
    {
      missionId: input.task.missionId,
      taskId: input.task.id,
      type: "artifact.created",
      payload: {
        artifactId: artifact.id,
        kind: artifact.kind,
      },
    },
    input.session,
  );

  if (input.preparedEvidence.proofBundle) {
    await input.deps.missionRepository.upsertProofBundle(
      input.deps.evidenceService.attachPlannerArtifactToProofBundle(
        input.preparedEvidence.proofBundle,
        {
          artifactId: artifact.id,
          task: input.task,
        },
      ),
      input.session,
    );
  }

  return input.task;
}

export function preparePlannerTurnEvidence(input: {
  evidenceService: Pick<
    EvidenceService,
    "buildPlannerArtifact" | "buildPlannerTaskSummary"
  >;
  mission: MissionRecord;
  plannerContext: PlannerPromptContext | null;
  proofBundle: ProofBundleManifest | null;
  task: MissionTaskRecord;
  turn: RuntimeCodexRunTurnResult;
}): PreparedPlannerTurnEvidence | null {
  if (
    input.task.role !== "planner" ||
    input.turn.status !== "completed" ||
    !input.plannerContext
  ) {
    return null;
  }

  const plannerCapture = buildPlannerArtifactCapture(input.turn);

  if (!plannerCapture) {
    return null;
  }

  const summary = input.evidenceService.buildPlannerTaskSummary(plannerCapture.body);

  return {
    artifactDraft: input.evidenceService.buildPlannerArtifact({
      mission: input.mission,
      plannerCapture,
      plannerContext: input.plannerContext,
      summary,
      task: input.task,
      turn: input.turn,
    }),
    proofBundle: input.proofBundle,
    summary,
  };
}

export function buildPlannerEvidenceFailureSummary(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return truncate(
    `Planner completed a runtime turn, but planner evidence persistence failed: ${message}.`,
    240,
  );
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

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
