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
    const createApiOnlyContainer = vi.fn(async () =>
      createAppContainer("api_only"),
    );
    const createEmbeddedWorkerContainer = vi.fn(async () =>
      createEmbeddedAppContainer(),
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
    const createApiOnlyContainer = vi.fn(async () =>
      createAppContainer("api_only"),
    );
    const createEmbeddedWorkerContainer = vi.fn(async () =>
      createEmbeddedAppContainer(),
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
      async queryRepositoryBlastRadius() {
        throw new Error(
          "queryRepositoryBlastRadius should not be called in this test",
        );
      },
      async getRepositoryDocSections() {
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
          docsState: "not_synced" as const,
          counts: {
            docFileCount: 0,
            docSectionCount: 0,
          },
          sections: [],
        };
      },
      async getRepositoryRunbooks() {
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
          freshness: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 86_400,
            reasonCode: "not_synced",
            reasonSummary: "No successful runbook sync has been recorded yet.",
          },
          runbookState: "not_synced" as const,
          counts: {
            runbookDocumentCount: 0,
            runbookStepCount: 0,
            commandFamilyCounts: {},
          },
          runbooks: [],
        };
      },
      async getRepositoryDocs() {
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
          freshness: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 86_400,
            reasonCode: "not_synced",
            reasonSummary: "No successful docs sync has been recorded yet.",
          },
          docsState: "not_synced" as const,
          counts: {
            docFileCount: 0,
            docSectionCount: 0,
          },
          docs: [],
        };
      },
      async getRepositoryFreshness() {
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
          rollup: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 21_600,
            reasonCode: "rollup_never_synced",
            reasonSummary:
              "No successful twin snapshot exists yet for: metadata, ownership, workflows, test suites, docs, runbooks.",
            freshSliceCount: 0,
            staleSliceCount: 0,
            failedSliceCount: 0,
            neverSyncedSliceCount: 6,
            blockingSlices: [
              "metadata",
              "ownership",
              "workflows",
              "testSuites",
              "docs",
              "runbooks",
            ] as Array<
              | "metadata"
              | "ownership"
              | "workflows"
              | "testSuites"
              | "docs"
              | "runbooks"
            >,
          },
          slices: {
            metadata: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 21_600,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful repository metadata sync has been recorded yet.",
            },
            ownership: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 43_200,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful ownership sync has been recorded yet.",
            },
            workflows: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 43_200,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful workflows sync has been recorded yet.",
            },
            testSuites: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 43_200,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful test suites sync has been recorded yet.",
            },
            docs: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 86_400,
              reasonCode: "not_synced",
              reasonSummary: "No successful docs sync has been recorded yet.",
            },
            runbooks: {
              state: "never_synced" as const,
              scorePercent: 0,
              latestRunId: null,
              latestRunStatus: null,
              latestCompletedAt: null,
              latestSuccessfulRunId: null,
              latestSuccessfulCompletedAt: null,
              ageSeconds: null,
              staleAfterSeconds: 86_400,
              reasonCode: "not_synced",
              reasonSummary:
                "No successful runbooks sync has been recorded yet.",
            },
          },
        };
      },
      async getRepositoryOwners() {
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
          codeownersFile: null,
          ownerCount: 0,
          owners: [],
        };
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
          freshness: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 21_600,
            reasonCode: "not_synced",
            reasonSummary:
              "No successful repository metadata sync has been recorded yet.",
          },
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
      async getRepositoryWorkflows() {
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
          workflowState: "not_synced" as const,
          counts: {
            workflowFileCount: 0,
            workflowCount: 0,
            jobCount: 0,
          },
          workflows: [],
        };
      },
      async getRepositoryTestSuites() {
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
          testSuiteState: "not_synced" as const,
          counts: {
            testSuiteCount: 0,
            mappedJobCount: 0,
            unmappedJobCount: 0,
          },
          testSuites: [],
          unmappedJobs: [],
        };
      },
      async getRepositoryCiSummary() {
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
          latestWorkflowRun: null,
          latestTestSuiteRun: null,
          freshness: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 43_200,
            reasonCode: "rollup_never_synced",
            reasonSummary:
              "No successful twin snapshot exists yet for: workflows, test suites.",
          },
          workflowState: "not_synced" as const,
          testSuiteState: "not_synced" as const,
          counts: {
            workflowFileCount: 0,
            workflowCount: 0,
            jobCount: 0,
            testSuiteCount: 0,
            mappedJobCount: 0,
            unmappedJobCount: 0,
          },
          testSuites: [],
          unmappedJobs: [],
        };
      },
      async getRepositoryOwnershipSummary() {
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
          freshness: {
            state: "never_synced" as const,
            scorePercent: 0,
            latestRunStatus: null,
            ageSeconds: null,
            staleAfterSeconds: 43_200,
            reasonCode: "not_synced",
            reasonSummary:
              "No successful ownership sync has been recorded yet.",
          },
          ownershipState: "not_synced" as const,
          codeownersFile: null,
          counts: {
            ruleCount: 0,
            ownerCount: 0,
            directoryCount: 0,
            manifestCount: 0,
            ownedDirectoryCount: 0,
            ownedManifestCount: 0,
            unownedDirectoryCount: 0,
            unownedManifestCount: 0,
          },
          ownedDirectories: [],
          ownedManifests: [],
          unownedDirectories: [],
          unownedManifests: [],
        };
      },
      async getRepositoryOwnershipRules() {
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
          codeownersFile: null,
          ruleCount: 0,
          ownerCount: 0,
          rules: [],
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
      async syncRepositoryWorkflows() {
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
            extractor: "repository_workflows",
            status: "succeeded",
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
              workflowFileCount: 0,
              workflowCount: 0,
              jobCount: 0,
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          workflowState: "no_workflow_files" as const,
          workflowFileCount: 0,
          workflowCount: 0,
          jobCount: 0,
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
        };
      },
      async syncRepositoryDocs() {
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
            id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            repoFullName: "616xold/pocket-cto",
            extractor: "repository_docs",
            status: "succeeded" as const,
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
              docFileCount: 0,
              docSectionCount: 0,
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          docsState: "no_docs" as const,
          docFileCount: 0,
          docSectionCount: 0,
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
        };
      },
      async syncRepositoryRunbooks() {
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
            id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
            repoFullName: "616xold/pocket-cto",
            extractor: "repository_runbooks",
            status: "succeeded" as const,
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
              runbookDocumentCount: 0,
              runbookStepCount: 0,
              commandFamilyCounts: {},
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          runbookState: "no_runbooks" as const,
          runbookDocumentCount: 0,
          runbookStepCount: 0,
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
          commandFamilyCounts: {},
        };
      },
      async syncRepositoryTestSuites() {
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
            extractor: "repository_test_suites",
            status: "succeeded",
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
              jobCount: 0,
              testSuiteCount: 0,
              mappedJobCount: 0,
              unmappedJobCount: 0,
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          testSuiteState: "no_test_suites" as const,
          testSuiteCount: 0,
          jobCount: 0,
          mappedJobCount: 0,
          unmappedJobCount: 0,
          entityCount: 0,
          edgeCount: 0,
          entityCountsByKind: {},
          edgeCountsByKind: {},
        };
      },
      async syncRepositoryOwnership() {
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
            extractor: "codeowners_ownership",
            status: "succeeded",
            startedAt: "2026-03-15T00:00:00.000Z",
            completedAt: "2026-03-15T00:01:00.000Z",
            stats: {
              entityCount: 0,
              edgeCount: 0,
              codeownersFileCount: 0,
              ruleCount: 0,
              ownerCount: 0,
            },
            errorSummary: null,
            createdAt: "2026-03-15T00:00:00.000Z",
          },
          codeownersFilePath: null,
          ruleCount: 0,
          ownerCount: 0,
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
