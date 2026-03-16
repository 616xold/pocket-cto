import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import {
  artifacts,
  missionInputs,
  missionTasks,
  missions,
  replayEvents,
} from "@pocket-cto/db";
import {
  closeTestDatabase,
  createTestDb,
  getMissionPersistenceTableCounts,
  resetTestDatabase,
} from "../../test/database";
import { EvidenceService } from "../evidence/service";
import { DrizzleReplayRepository } from "../replay/drizzle-repository";
import { ReplayService } from "../replay/service";
import { StubMissionCompiler } from "./compiler";
import { DrizzleMissionRepository } from "./drizzle-repository";
import type { MissionRepository } from "./repository";
import { MissionService } from "./service";

const db = createTestDb();

describe("MissionService (DB-backed)", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("persists the full mission spine for createFromText", async () => {
    const service = createMissionService(new DrizzleMissionRepository(db));
    const created = await service.createFromText({
      text: "Implement passkeys for sign-in",
      sourceKind: "manual_text",
      requestedBy: "operator",
    });

    const [storedMission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, created.mission.id))
      .limit(1);
    const storedInputs = await db
      .select()
      .from(missionInputs)
      .where(eq(missionInputs.missionId, created.mission.id));
    const storedTasks = await db
      .select()
      .from(missionTasks)
      .where(eq(missionTasks.missionId, created.mission.id))
      .orderBy(missionTasks.sequence);
    const storedReplayEvents = await db
      .select()
      .from(replayEvents)
      .where(eq(replayEvents.missionId, created.mission.id))
      .orderBy(replayEvents.sequence);
    const storedArtifacts = await db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.missionId, created.mission.id),
          eq(artifacts.kind, "proof_bundle_manifest"),
        ),
      );

    expect(storedMission?.title).toBe(created.mission.title);
    expect(storedMission?.status).toBe("queued");
    expect(storedInputs).toHaveLength(1);
    expect(storedInputs[0]?.rawText).toBe("Implement passkeys for sign-in");
    expect(storedTasks.map((task) => task.role)).toEqual([
      "planner",
      "executor",
    ]);
    expect(storedReplayEvents.map((event) => event.type)).toEqual([
      "mission.created",
      "task.created",
      "task.created",
      "mission.status_changed",
      "artifact.created",
    ]);
    expect(storedReplayEvents.map((event) => event.sequence)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(storedReplayEvents[3]?.payload).toEqual({
      from: "planned",
      to: "queued",
      reason: "tasks_materialized",
    });
    expect(storedArtifacts).toHaveLength(1);
    expect(readManifest(storedArtifacts[0]?.metadata)?.missionId).toBe(
      created.mission.id,
    );
    expect(readManifest(storedArtifacts[0]?.metadata)?.status).toBe(
      "placeholder",
    );
  });

  it("rolls back all persistence when a mid-transaction write throws", async () => {
    const baseRepository = new DrizzleMissionRepository(db);
    const failingRepository =
      createThrowAfterProofBundleRepository(baseRepository);
    const service = createMissionService(failingRepository);

    await expect(
      service.createFromText({
        text: "Implement passkeys for sign-in",
        sourceKind: "manual_text",
        requestedBy: "operator",
      }),
    ).rejects.toThrow("forced rollback after proof bundle persistence");

    expect(await getMissionPersistenceTableCounts()).toEqual({
      missions: 0,
      missionInputs: 0,
      missionTasks: 0,
      replayEvents: 0,
      artifacts: 0,
    });
  });
});

function createMissionService(repository: MissionRepository) {
  const replayRepository = new DrizzleReplayRepository(db);
  const replayService = new ReplayService(replayRepository, repository);

  return new MissionService(
    new StubMissionCompiler(),
    repository,
    replayService,
    new EvidenceService(),
  );
}

function createThrowAfterProofBundleRepository(
  repository: MissionRepository,
): MissionRepository {
  return {
    transaction: repository.transaction.bind(repository),
    createMission: repository.createMission.bind(repository),
    addMissionInput: repository.addMissionInput.bind(repository),
    createTask: repository.createTask.bind(repository),
    updateMissionStatus: repository.updateMissionStatus.bind(repository),
    claimNextRunnableTask: repository.claimNextRunnableTask.bind(repository),
    findOldestClaimedTaskReadyForTurn:
      repository.findOldestClaimedTaskReadyForTurn.bind(repository),
    findOldestClaimedTaskWithoutThread:
      repository.findOldestClaimedTaskWithoutThread.bind(repository),
    getTaskById: repository.getTaskById.bind(repository),
    getLatestPlannerArtifactForExecutor:
      repository.getLatestPlannerArtifactForExecutor.bind(repository),
    attachCodexThreadId: repository.attachCodexThreadId.bind(repository),
    replaceCodexThreadId: repository.replaceCodexThreadId.bind(repository),
    attachCodexTurnId: repository.attachCodexTurnId.bind(repository),
    clearCodexTurnId: repository.clearCodexTurnId.bind(repository),
    updateTaskSummary: repository.updateTaskSummary.bind(repository),
    updateTaskStatus: repository.updateTaskStatus.bind(repository),
    getMissionById: repository.getMissionById.bind(repository),
    listMissions: repository.listMissions.bind(repository),
    getTasksByMissionId: repository.getTasksByMissionId.bind(repository),
    listArtifactsByMissionId: repository.listArtifactsByMissionId.bind(repository),
    getProofBundleByMissionId:
      repository.getProofBundleByMissionId.bind(repository),
    saveArtifact: repository.saveArtifact.bind(repository),
    saveProofBundle: async (bundle, session) => {
      await repository.saveProofBundle(bundle, session);
      throw new Error("forced rollback after proof bundle persistence");
    },
    upsertProofBundle: repository.upsertProofBundle.bind(repository),
  };
}

function readManifest(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || !("manifest" in metadata)) {
    return null;
  }

  const manifest = metadata.manifest;
  if (!manifest || typeof manifest !== "object") {
    return null;
  }

  return manifest as Record<string, unknown>;
}
