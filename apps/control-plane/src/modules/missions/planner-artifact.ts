export type ExecutorPlannerArtifactResolution =
  | "dependency_task"
  | "mission_latest_planner";

export type ExecutorPlannerArtifactRecord = {
  artifactId: string;
  body: string;
  justification: string;
  sourceTaskId: string;
  sourceTaskSequence: number;
  summary: string | null;
  uri: string;
  resolution: ExecutorPlannerArtifactResolution;
};

export function readPlannerArtifactMetadata(metadata: unknown): {
  body: string;
  summary: string | null;
} | null {
  if (!isRecord(metadata)) {
    return null;
  }

  const body = metadata.body;
  const summary = metadata.summary;

  if (typeof body !== "string" || body.trim().length === 0) {
    return null;
  }

  return {
    body: body.trim(),
    summary: typeof summary === "string" && summary.trim().length > 0 ? summary : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
