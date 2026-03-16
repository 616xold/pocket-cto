import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  buildMissionFixture,
  proofBundlePlaceholderFixture,
} from "@pocket-cto/testkit";
import {
  closeTestDatabase,
  createTestDb,
  resetTestDatabase,
} from "../../test/database";
import { DrizzleMissionRepository } from "./drizzle-repository";

const db = createTestDb();

describe("DrizzleMissionRepository", () => {
  const repository = new DrizzleMissionRepository(db);

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("persists missions, tasks, and proof bundle artifacts", async () => {
    const missionSpec = buildMissionFixture();

    const created = await repository.transaction(async (session) => {
      const mission = await repository.createMission(
        {
          type: missionSpec.type,
          title: missionSpec.title,
          objective: missionSpec.objective,
          sourceKind: "manual_text",
          sourceRef: null,
          createdBy: "operator",
          primaryRepo: missionSpec.repos[0] ?? null,
          spec: missionSpec,
        },
        session,
      );

      await repository.addMissionInput(
        {
          missionId: mission.id,
          rawText: missionSpec.objective,
          compilerName: "stub-compiler",
          compilerVersion: "0.1.0",
          compilerConfidence: 30,
          compilerOutput: missionSpec as unknown as Record<string, unknown>,
        },
        session,
      );

      const plannerTask = await repository.createTask(
        {
          missionId: mission.id,
          role: "planner",
          sequence: 0,
          status: "pending",
        },
        session,
      );

      const executorTask = await repository.createTask(
        {
          missionId: mission.id,
          role: "executor",
          sequence: 1,
          status: "pending",
          dependsOnTaskId: plannerTask.id,
        },
        session,
      );

      const proofBundle = proofBundlePlaceholderFixture(mission.id);
      const proofArtifact = await repository.saveProofBundle(
        proofBundle,
        session,
      );

      return {
        mission,
        executorTask,
        plannerTask,
        proofArtifact,
      };
    });

    const storedMission = await repository.getMissionById(created.mission.id);
    const storedTasks = await repository.getTasksByMissionId(
      created.mission.id,
    );
    const storedProofBundle = await repository.getProofBundleByMissionId(
      created.mission.id,
    );

    expect(storedMission?.title).toBe(missionSpec.title);
    expect(storedTasks.map((task) => task.role)).toEqual([
      "planner",
      "executor",
    ]);
    expect(created.executorTask.dependsOnTaskId).toBe(created.plannerTask.id);
    expect(created.proofArtifact.kind).toBe("proof_bundle_manifest");
    expect(storedProofBundle?.missionId).toBe(created.mission.id);
    expect(storedProofBundle?.status).toBe("placeholder");
  });

  it("prefers the dependency plan artifact and otherwise falls back to the latest planner artifact in the mission", async () => {
    const missionSpec = buildMissionFixture();

    const created = await repository.transaction(async (session) => {
      const mission = await repository.createMission(
        {
          type: missionSpec.type,
          title: missionSpec.title,
          objective: missionSpec.objective,
          sourceKind: "manual_text",
          sourceRef: null,
          createdBy: "operator",
          primaryRepo: missionSpec.repos[0] ?? null,
          spec: missionSpec,
        },
        session,
      );

      const dependencyPlanner = await repository.createTask(
        {
          missionId: mission.id,
          role: "planner",
          sequence: 0,
          status: "succeeded",
        },
        session,
      );
      const fallbackPlanner = await repository.createTask(
        {
          missionId: mission.id,
          role: "planner",
          sequence: 2,
          status: "succeeded",
        },
        session,
      );
      const executorTask = await repository.createTask(
        {
          missionId: mission.id,
          role: "executor",
          sequence: 3,
          status: "claimed",
          dependsOnTaskId: dependencyPlanner.id,
        },
        session,
      );

      return {
        dependencyPlanner,
        executorTask,
        fallbackPlanner,
        mission,
      };
    });

    const fallbackArtifact = await repository.saveArtifact({
      kind: "plan",
      metadata: {
        body: "fallback planner body",
        summary: "fallback planner summary",
      },
      missionId: created.mission.id,
      mimeType: "text/markdown",
      taskId: created.fallbackPlanner.id,
      uri: `pocket-cto://missions/${created.mission.id}/tasks/${created.fallbackPlanner.id}/plan`,
    });

    const fallbackLookup = await repository.getLatestPlannerArtifactForExecutor(
      created.executorTask.id,
    );

    expect(fallbackLookup).toMatchObject({
      artifactId: fallbackArtifact.id,
      resolution: "mission_latest_planner",
      sourceTaskId: created.fallbackPlanner.id,
      summary: "fallback planner summary",
    });

    const dependencyArtifact = await repository.saveArtifact({
      kind: "plan",
      metadata: {
        body: "dependency planner body",
        summary: "dependency planner summary",
      },
      missionId: created.mission.id,
      mimeType: "text/markdown",
      taskId: created.dependencyPlanner.id,
      uri: `pocket-cto://missions/${created.mission.id}/tasks/${created.dependencyPlanner.id}/plan`,
    });

    const dependencyLookup = await repository.getLatestPlannerArtifactForExecutor(
      created.executorTask.id,
    );

    expect(dependencyLookup).toMatchObject({
      artifactId: dependencyArtifact.id,
      resolution: "dependency_task",
      sourceTaskId: created.dependencyPlanner.id,
      summary: "dependency planner summary",
    });
  });

  it("lists newest-first missions and applies status and source-kind filters", async () => {
    const missionSpec = buildMissionFixture();

    const first = await repository.createMission({
      type: missionSpec.type,
      title: "First mission",
      objective: "Ship the first mission",
      sourceKind: "manual_text",
      sourceRef: null,
      createdBy: "operator",
      primaryRepo: missionSpec.repos[0] ?? null,
      spec: {
        ...missionSpec,
        objective: "Ship the first mission",
        title: "First mission",
      },
    });

    await repository.updateMissionStatus(first.id, "succeeded");

    const second = await repository.createMission({
      type: missionSpec.type,
      title: "Second mission",
      objective: "Ship the second mission",
      sourceKind: "github_issue",
      sourceRef: "https://github.com/acme/web/issues/19",
      createdBy: "operator",
      primaryRepo: missionSpec.repos[0] ?? null,
      spec: {
        ...missionSpec,
        objective: "Ship the second mission",
        title: "Second mission",
      },
    });

    const listed = await repository.listMissions({ limit: 10 });

    expect(listed.map((mission) => mission.id)).toEqual([second.id, first.id]);

    const filteredByStatus = await repository.listMissions({
      limit: 10,
      status: "succeeded",
    });

    expect(filteredByStatus.map((mission) => mission.id)).toEqual([first.id]);

    const filteredBySourceKind = await repository.listMissions({
      limit: 10,
      sourceKind: "github_issue",
    });

    expect(filteredBySourceKind.map((mission) => mission.id)).toEqual([
      second.id,
    ]);
  });
});
