import type { artifacts, missions, missionTasks } from "@pocket-cto/db";
import {
  ArtifactRecordSchema,
  MissionSpecSchema,
  MissionTaskRecordSchema,
  ProofBundleManifestSchema,
} from "@pocket-cto/domain";
import type {
  ArtifactRecord,
  MissionRecord,
  MissionTaskRecord,
  ProofBundleManifest,
} from "@pocket-cto/domain";

type MissionRow = typeof missions.$inferSelect;
type MissionTaskRow = typeof missionTasks.$inferSelect;
type ArtifactRow = typeof artifacts.$inferSelect;

export function mapMissionRow(row: MissionRow): MissionRecord {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    title: row.title,
    objective: row.objective,
    sourceKind: row.sourceKind,
    sourceRef: row.sourceRef,
    createdBy: row.createdBy,
    primaryRepo: row.primaryRepo,
    spec: MissionSpecSchema.parse(row.spec),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapMissionTaskRow(row: MissionTaskRow): MissionTaskRecord {
  return MissionTaskRecordSchema.parse({
    id: row.id,
    missionId: row.missionId,
    role: row.role,
    sequence: row.sequence,
    status: row.status,
    attemptCount: row.attemptCount,
    codexThreadId: row.codexThreadId,
    codexTurnId: row.codexTurnId,
    workspaceId: row.workspaceId,
    dependsOnTaskId: row.dependsOnTaskId,
    summary: row.summary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function mapArtifactRow(row: ArtifactRow): ArtifactRecord {
  return ArtifactRecordSchema.parse({
    id: row.id,
    missionId: row.missionId,
    taskId: row.taskId,
    kind: row.kind,
    uri: row.uri,
    mimeType: row.mimeType,
    sha256: row.sha256,
    metadata: isRecord(row.metadata) ? row.metadata : {},
    createdAt: row.createdAt.toISOString(),
  });
}

export function readProofBundleManifest(
  metadata: unknown,
): ProofBundleManifest | null {
  if (isRecord(metadata) && "manifest" in metadata) {
    return ProofBundleManifestSchema.parse(metadata.manifest);
  }

  if (isRecord(metadata)) {
    return ProofBundleManifestSchema.parse(metadata);
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
