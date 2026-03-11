import type {
  ArtifactKind,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";
import { ProofBundleManifestSchema } from "@pocket-cto/domain";
import type { RuntimeCodexRunTurnResult } from "../runtime-codex/types";
import type { PlannerPromptContext } from "../runtime-codex/planner-context";

export type EvidenceArtifactDraft = {
  kind: ArtifactKind;
  metadata: Record<string, unknown>;
  mimeType: string | null;
  missionId: string;
  sha256: string | null;
  taskId: string | null;
  uri: string;
};

export class EvidenceService {
  createPlaceholder(mission: MissionRecord): ProofBundleManifest {
    return {
      missionId: mission.id,
      objective: mission.objective,
      changeSummary: "",
      verificationSummary: "",
      riskSummary: "",
      rollbackSummary: "",
      decisionTrace: [],
      artifactIds: [],
      replayEventCount: 0,
      status: "placeholder",
    };
  }

  buildPlannerArtifact(input: {
    mission: MissionRecord;
    plannerContext: PlannerPromptContext;
    plannerText: string;
    summary: string;
    task: MissionTaskRecord;
    turn: RuntimeCodexRunTurnResult;
  }): EvidenceArtifactDraft {
    return {
      missionId: input.mission.id,
      taskId: input.task.id,
      kind: "plan",
      uri: `pocket-cto://missions/${input.mission.id}/tasks/${input.task.id}/plan`,
      mimeType: "text/markdown",
      sha256: null,
      metadata: {
        body: input.plannerText,
        generatedAt: new Date().toISOString(),
        source: "runtime_codex_planner",
        summary: input.summary,
        taskRole: input.task.role,
        threadId: input.turn.threadId,
        turnId: input.turn.turnId,
        workspace: input.plannerContext.workspace,
        workflowPolicy: input.plannerContext.workflowPolicy
          ? {
              injected: true,
              path: input.plannerContext.workflowPolicy.path,
              truncated: input.plannerContext.workflowPolicy.truncated,
            }
          : {
              injected: false,
              path: null,
              truncated: false,
            },
      },
    };
  }

  buildPlannerTaskSummary(plannerText: string) {
    const normalized = plannerText.replace(/\r\n/g, "\n").trim();
    const objectiveSection =
      extractSection(normalized, "Objective understanding") ??
      extractSection(normalized, "Relevant context") ??
      normalized;
    const firstSentence = objectiveSection
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(stripMarkdownPrefix)
      .join(" ");

    return truncate(firstSentence || "Planner completed with a read-only plan.", 240);
  }

  attachPlannerArtifactToProofBundle(
    bundle: ProofBundleManifest,
    input: {
      artifactId: string;
      task: MissionTaskRecord;
    },
  ): ProofBundleManifest {
    const nextArtifactIds = Array.from(
      new Set([...bundle.artifactIds, input.artifactId]),
    );
    const decisionTraceLine = `Planner task ${input.task.sequence} produced plan artifact ${input.artifactId}.`;
    const nextDecisionTrace = bundle.decisionTrace.includes(decisionTraceLine)
      ? bundle.decisionTrace
      : [...bundle.decisionTrace, decisionTraceLine];

    return ProofBundleManifestSchema.parse({
      ...bundle,
      artifactIds: nextArtifactIds,
      decisionTrace: nextDecisionTrace,
    });
  }
}

function extractSection(text: string, heading: string) {
  const escapedHeading = escapeRegExp(heading);
  const match = text.match(
    new RegExp(
      `(?:^|\\n)##\\s*${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
      "i",
    ),
  );

  return match?.[1]?.trim() || null;
}

function stripMarkdownPrefix(value: string) {
  return value.replace(/^[-*]\s+/, "").trim();
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
