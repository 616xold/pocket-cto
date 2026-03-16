import { loadEnv } from "@pocket-cto/config";
import { describe, expect, it, vi } from "vitest";
import type { AppContainer, EmbeddedWorkerContainer } from "./lib/types";
import { createServerContainer, resolveServerControlMode } from "./bootstrap";
import { createRawEnv } from "./test/env";

describe("server control mode", () => {
  it("parses CONTROL_PLANE_EMBEDDED_WORKER and defaults it to false", () => {
    expect(loadEnv(createRawEnv()).CONTROL_PLANE_EMBEDDED_WORKER).toBe(false);
    expect(
      loadEnv(
        createRawEnv({
          CONTROL_PLANE_EMBEDDED_WORKER: "true",
        }),
      ).CONTROL_PLANE_EMBEDDED_WORKER,
    ).toBe(true);
  });

  it("keeps the server in api_only mode when the flag is unset", () => {
    const env = loadEnv(createRawEnv());

    expect(resolveServerControlMode(env)).toBe("api_only");
  });

  it("selects the api-only container when embedded mode is disabled", async () => {
    const createApiOnlyContainer = vi.fn(async () => createAppContainer("api_only"));
    const createEmbeddedWorkerContainer = vi.fn(
      async () => createEmbeddedAppContainer(),
    );

    const container = await createServerContainer({
      env: {
        CONTROL_PLANE_EMBEDDED_WORKER: false,
      },
      factories: {
        createApiOnlyContainer,
        createEmbeddedWorkerContainer,
      },
    });

    expect(createApiOnlyContainer).toHaveBeenCalledOnce();
    expect(createEmbeddedWorkerContainer).not.toHaveBeenCalled();
    expect(container.operatorControl.liveControl.mode).toBe("api_only");
  });

  it("selects the embedded worker container when embedded mode is enabled", async () => {
    const createApiOnlyContainer = vi.fn(async () => createAppContainer("api_only"));
    const createEmbeddedWorkerContainer = vi.fn(
      async () => createEmbeddedAppContainer(),
    );

    const container = await createServerContainer({
      env: {
        CONTROL_PLANE_EMBEDDED_WORKER: true,
      },
      factories: {
        createApiOnlyContainer,
        createEmbeddedWorkerContainer,
      },
    });

    expect(createApiOnlyContainer).not.toHaveBeenCalled();
    expect(createEmbeddedWorkerContainer).toHaveBeenCalledOnce();
    expect(container.operatorControl.liveControl.mode).toBe("embedded_worker");
    expect("worker" in container).toBe(true);
  });
});

function createAppContainer(
  mode: AppContainer["operatorControl"]["liveControl"]["mode"],
): AppContainer {
  return {
    githubAppService: {
      async getRepository() {
        return {
          repository: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            installationId: "12345",
            githubRepositoryId: "100",
            fullName: "616xold/pocket-cto",
            ownerLogin: "616xold",
            name: "pocket-cto",
            defaultBranch: "main",
            visibility: "private" as const,
            archived: false,
            disabled: false,
            isActive: true,
            language: "TypeScript",
            lastSyncedAt: "2026-03-15T00:00:00.000Z",
            removedFromInstallationAt: null,
            updatedAt: "2026-03-15T00:00:00.000Z",
          },
          writeReadiness: {
            ready: true,
            failureCode: null,
          },
        };
      },
      async listInstallationRepositories() {
        return {
          installation: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            installationId: "12345",
            appId: "98765",
            accountLogin: "616xold",
            accountType: "Organization",
            targetType: "Organization",
            targetId: "6161234",
            suspendedAt: null,
            permissions: {
              metadata: "read",
            },
            lastSyncedAt: "2026-03-15T00:00:00.000Z",
            createdAt: "2026-03-15T00:00:00.000Z",
            updatedAt: "2026-03-15T00:00:00.000Z",
          },
          repositories: [],
        };
      },
      async listInstallations() {
        return [];
      },
      async listRepositories() {
        return {
          repositories: [],
        };
      },
      async resolveWritableRepository() {
        return {
          installation: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            installationId: "12345",
            appId: "98765",
            accountLogin: "616xold",
            accountType: "Organization",
            targetType: "Organization",
            targetId: "6161234",
            suspendedAt: null,
            permissions: {
              metadata: "read",
            },
            lastSyncedAt: "2026-03-15T00:00:00.000Z",
            createdAt: "2026-03-15T00:00:00.000Z",
            updatedAt: "2026-03-15T00:00:00.000Z",
          },
          repository: {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            installationId: "12345",
            installationRefId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            githubRepositoryId: "100",
            fullName: "616xold/pocket-cto",
            ownerLogin: "616xold",
            name: "pocket-cto",
            defaultBranch: "main",
            isPrivate: true,
            archived: false,
            disabled: false,
            isActive: true,
            lastSyncedAt: "2026-03-15T00:00:00.000Z",
            removedFromInstallationAt: null,
            language: "TypeScript",
            createdAt: "2026-03-15T00:00:00.000Z",
            updatedAt: "2026-03-15T00:00:00.000Z",
          },
        };
      },
      async syncInstallationRepositories() {
        return {
          installation: {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            installationId: "12345",
            appId: "98765",
            accountLogin: "616xold",
            accountType: "Organization",
            targetType: "Organization",
            targetId: "6161234",
            suspendedAt: null,
            permissions: {
              metadata: "read",
            },
            lastSyncedAt: "2026-03-15T00:00:00.000Z",
            createdAt: "2026-03-15T00:00:00.000Z",
            updatedAt: "2026-03-15T00:00:00.000Z",
          },
          syncedAt: "2026-03-15T00:00:00.000Z",
          syncedRepositoryCount: 0,
          activeRepositoryCount: 0,
          inactiveRepositoryCount: 0,
        };
      },
      async syncInstallations() {
        return {
          installations: [],
          syncedAt: "2026-03-15T00:00:00.000Z",
          syncedCount: 0,
        };
      },
      async syncRepositories() {
        return {
          installations: [],
          syncedAt: "2026-03-15T00:00:00.000Z",
          syncedInstallationCount: 0,
          syncedRepositoryCount: 0,
        };
      },
    } as AppContainer["githubAppService"],
    githubIssueIntakeService: {
      async createMissionFromDelivery() {
        throw new Error(
          "createMissionFromDelivery should not be called in this test",
        );
      },
      async listIssues() {
        return {
          issues: [],
        };
      },
    } as AppContainer["githubIssueIntakeService"],
    githubWebhookService: {
      async getDelivery() {
        return {
          delivery: {
            deliveryId: "delivery-test",
            eventName: "installation",
            action: "created",
            installationId: "12345",
            handledAs: "installation_state_updated" as const,
            receivedAt: "2026-03-15T00:00:00.000Z",
            persistedAt: "2026-03-15T00:00:00.000Z",
            payloadPreview: {
              accountLogin: "616xold",
              accountType: "Organization",
              targetType: "Organization",
            },
          },
        };
      },
      async ingest() {
        return {
          accepted: true,
          duplicate: false,
          deliveryId: "delivery-test",
          eventName: "installation",
          action: "created",
          handledAs: "installation_state_updated",
          persistedAt: "2026-03-15T00:00:00.000Z",
        };
      },
      async listDeliveries() {
        return {
          deliveries: [],
        };
      },
    } as AppContainer["githubWebhookService"],
    missionService: {
      async createFromText() {
        throw new Error("createFromText should not be called in this test");
      },
      async getMissionDetail() {
        throw new Error("getMissionDetail should not be called in this test");
      },
      async listMissions() {
        throw new Error("listMissions should not be called in this test");
      },
    } as AppContainer["missionService"],
    operatorControl: {
      approvalService: {
        async listMissionApprovals() {
          return [];
        },
        async resolveApproval() {
          throw new Error("resolveApproval should not be called in this test");
        },
      } as AppContainer["operatorControl"]["approvalService"],
      liveControl: {
        enabled: mode === "embedded_worker",
        limitation: "single_process_only",
        mode,
      },
      runtimeControlService: {
        async interruptActiveTurn() {
          throw new Error(
            "interruptActiveTurn should not be called in this test",
          );
        },
      } as AppContainer["operatorControl"]["runtimeControlService"],
    },
    replayService: {
      async getMissionEvents() {
        return [];
      },
    } as AppContainer["replayService"],
    twinService: {
      async finishSyncRun() {
        throw new Error("finishSyncRun should not be called in this test");
      },
      async getRepositoryMetadataSummary() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          latestRun: null,
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
          metadata: {
            repository: null,
            defaultBranch: null,
            rootReadme: null,
            manifests: [],
            directories: [],
          },
        };
      },
      async listRepositoryEdges() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          edgeCount: 0,
          edges: [],
        };
      },
      async listRepositoryEntities() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          entityCount: 0,
          entities: [],
        };
      },
      async listRepositoryRuns() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          runCount: 0,
          runs: [],
        };
      },
      async startSyncRun() {
        return {
          id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          repoFullName: "616xold/pocket-cto",
          extractor: "synthetic",
          status: "running",
          startedAt: "2026-03-15T00:00:00.000Z",
          completedAt: null,
          stats: {},
          errorSummary: null,
          createdAt: "2026-03-15T00:00:00.000Z",
        };
      },
      async syncRepositoryMetadata() {
        return {
          repository: {
            fullName: "616xold/pocket-cto",
            installationId: "12345",
            defaultBranch: "main",
            archived: false,
            disabled: false,
            isActive: true,
            writeReadiness: {
              ready: true,
              failureCode: null,
            },
          },
          syncRun: {
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            repoFullName: "616xold/pocket-cto",
            extractor: "repository_metadata",
            status: "succeeded",
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
        };
      },
      async upsertEdge() {
        throw new Error("upsertEdge should not be called in this test");
      },
      async upsertEntity() {
        throw new Error("upsertEntity should not be called in this test");
      },
    } as AppContainer["twinService"],
  };
}

function createEmbeddedAppContainer(): EmbeddedWorkerContainer {
  return {
    ...createAppContainer("embedded_worker"),
    worker: {} as EmbeddedWorkerContainer["worker"],
  };
}
