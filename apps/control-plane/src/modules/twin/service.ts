import type {
  TwinRepositoryBlastRadiusQuery,
  TwinRepositoryBlastRadiusQueryResult,
  TwinRepositoryFreshnessView,
  TwinRepositoryCiSummary,
  TwinRepositoryDocSectionsView,
  TwinRepositoryDocsSyncResult,
  TwinRepositoryDocsView,
  TwinRepositoryRunbooksSyncResult,
  TwinRepositoryRunbooksView,
  TwinEdgeListView,
  TwinEntityListView,
  TwinRepositoryOwnersView,
  TwinRepositoryMetadataSummary,
  TwinRepositoryMetadataSyncResult,
  TwinRepositoryTestSuiteSyncResult,
  TwinRepositoryTestSuitesView,
  TwinRepositoryWorkflowSyncResult,
  TwinRepositoryWorkflowsView,
  TwinRepositoryOwnershipRulesView,
  TwinRepositoryOwnershipSummary,
  TwinRepositoryOwnershipSyncResult,
  TwinSyncRunListView,
} from "@pocket-cto/domain";
import { buildTwinRepositoryBlastRadiusQueryResult } from "./blast-radius-query";
import type { GitHubRepositoryDetailResult } from "../github-app/schema";
import {
  buildTwinRepositoryDocSectionsView,
  buildTwinRepositoryDocsView,
} from "./docs-formatter";
import { docsExtractorName, syncRepositoryDocs } from "./docs-sync";
import {
  buildTwinFreshnessSummary,
  buildTwinFreshnessSlice,
  buildTwinFreshnessRollupForEntries,
  buildTwinRepositoryFreshnessView,
} from "./freshness";
import type { TwinRepository } from "./repository";
import {
  buildTwinEdgeListView,
  buildTwinEntityListView,
  buildTwinRepositoryMetadataSummary,
  buildTwinSyncRunListView,
  toTwinRepositorySummary,
} from "./formatter";
import {
  buildTwinRepositoryOwnersView,
  buildTwinRepositoryOwnershipRulesView,
} from "./ownership-formatter";
import {
  ownershipExtractorName,
  ownershipTwinEdgeKinds,
  syncRepositoryOwnership,
} from "./ownership-sync";
import { buildTwinRepositoryOwnershipSummary } from "./ownership-summary-formatter";
import type { TwinRepositoryMetadataExtractor } from "./repository-metadata-extractor";
import { metadataExtractorName, syncRepositoryMetadata } from "./metadata-sync";
import type { TwinRepositorySourceResolver } from "./source-resolver";
import { readOwnershipTargets } from "./ownership-targets";
import { buildTwinRepositoryWorkflowsView } from "./workflow-formatter";
import {
  buildTwinRepositoryCiSummary,
  buildTwinRepositoryTestSuitesView,
} from "./test-suite-formatter";
import { buildTwinRepositoryRunbooksView } from "./runbook-formatter";
import { runbookExtractorName, syncRepositoryRunbooks } from "./runbook-sync";
import {
  syncRepositoryTestSuites,
  testSuiteExtractorName,
} from "./test-suite-sync";
import {
  syncRepositoryWorkflows,
  workflowExtractorName,
} from "./workflow-sync";
import {
  TwinEdgeUpsertInputSchema,
  TwinEntityUpsertInputSchema,
  TwinSyncRunFinishInputSchema,
  TwinSyncRunStartInputSchema,
  type TwinEdgeRecord,
  type TwinEdgeUpsertInput,
  type TwinEntityRecord,
  type TwinEntityUpsertInput,
  type TwinSyncRunFinishInput,
  type TwinSyncRunRecord,
  type TwinSyncRunStartInput,
} from "./types";

type TwinRepositoryRegistryPort = {
  getRepository(fullName: string): Promise<GitHubRepositoryDetailResult>;
  resolveWritableRepository(fullName: string): Promise<unknown>;
};

type TwinRepositoryStoredState = {
  edges: TwinEdgeRecord[];
  entities: TwinEntityRecord[];
  runs: TwinSyncRunRecord[];
};

export class TwinService {
  private readonly now: () => Date;

  constructor(
    private readonly input: {
      metadataExtractor: TwinRepositoryMetadataExtractor;
      repository: TwinRepository;
      repositoryRegistry: TwinRepositoryRegistryPort;
      sourceResolver: TwinRepositorySourceResolver;
      now?: () => Date;
    },
  ) {
    this.now = input.now ?? (() => new Date());
  }

  async listRepositoryEdges(repoFullName: string): Promise<TwinEdgeListView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const edges = await this.input.repository.listRepositoryEdges(repoFullName);

    return buildTwinEdgeListView({
      repository,
      edges,
    });
  }

  async listRepositoryEntities(
    repoFullName: string,
  ): Promise<TwinEntityListView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const entities =
      await this.input.repository.listRepositoryEntities(repoFullName);

    return buildTwinEntityListView({
      repository,
      entities,
    });
  }

  async listRepositoryRuns(repoFullName: string): Promise<TwinSyncRunListView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const runs = await this.input.repository.listRepositoryRuns(repoFullName);

    return buildTwinSyncRunListView({
      repository,
      runs,
    });
  }

  async getRepositoryFreshness(
    repoFullName: string,
  ): Promise<TwinRepositoryFreshnessView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const storedState = await this.loadRepositoryStoredState(repoFullName);

    return buildTwinRepositoryFreshnessView({
      repository,
      slices: this.buildFreshnessSlices(storedState),
    });
  }

  async getRepositoryMetadataSummary(
    repoFullName: string,
  ): Promise<TwinRepositoryMetadataSummary> {
    const repository = await this.getRepositorySummary(repoFullName);
    const storedState = await this.loadRepositoryStoredState(repoFullName);
    const metadataSnapshot = this.buildMetadataReadSnapshot(storedState);
    const freshnessSlices = this.buildFreshnessSlices(storedState);

    return buildTwinRepositoryMetadataSummary({
      repository,
      entities: storedState.entities,
      edges: storedState.edges,
      latestRun: metadataSnapshot.latestRun,
      freshness: buildTwinFreshnessSummary(freshnessSlices.metadata),
    });
  }

  async getRepositoryDocs(
    repoFullName: string,
  ): Promise<TwinRepositoryDocsView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getDocsReadSnapshot(repoFullName);

    return buildTwinRepositoryDocsView({
      repository,
      latestRun: snapshot.latestRun,
      freshness: buildTwinFreshnessSummary(
        buildTwinFreshnessSlice({
          slice: "docs",
          latestRun: snapshot.latestRun,
          latestSuccessfulRun: snapshot.latestSuccessfulRun,
          now: this.now(),
          emptySnapshotReason:
            snapshot.docsState === "no_docs"
              ? {
                  reasonCode: "no_docs",
                  summaryFragment: "found no approved docs.",
                }
              : null,
        }),
      ),
      docsState: snapshot.docsState,
      docFileEntities: snapshot.docFileEntities,
      docSectionEntities: snapshot.docSectionEntities,
    });
  }

  async getRepositoryDocSections(
    repoFullName: string,
  ): Promise<TwinRepositoryDocSectionsView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getDocsReadSnapshot(repoFullName);

    return buildTwinRepositoryDocSectionsView({
      repository,
      latestRun: snapshot.latestRun,
      docsState: snapshot.docsState,
      docFileEntities: snapshot.docFileEntities,
      docSectionEntities: snapshot.docSectionEntities,
    });
  }

  async getRepositoryRunbooks(
    repoFullName: string,
  ): Promise<TwinRepositoryRunbooksView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getRunbookReadSnapshot(repoFullName);

    return buildTwinRepositoryRunbooksView({
      repository,
      latestRun: snapshot.latestRun,
      freshness: buildTwinFreshnessSummary(
        buildTwinFreshnessSlice({
          slice: "runbooks",
          latestRun: snapshot.latestRun,
          latestSuccessfulRun: snapshot.latestSuccessfulRun,
          now: this.now(),
          emptySnapshotReason:
            snapshot.runbookState === "no_runbooks"
              ? {
                  reasonCode: "no_runbooks",
                  summaryFragment: "found no classified runbooks.",
                }
              : null,
        }),
      ),
      runbookState: snapshot.runbookState,
      runbookDocumentEntities: snapshot.runbookDocumentEntities,
      runbookStepEntities: snapshot.runbookStepEntities,
    });
  }

  async getRepositoryWorkflows(
    repoFullName: string,
  ): Promise<TwinRepositoryWorkflowsView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getWorkflowReadSnapshot(repoFullName);

    return buildTwinRepositoryWorkflowsView({
      repository,
      latestRun: snapshot.latestRun,
      workflowState: snapshot.workflowState,
      fileEntities: snapshot.fileEntities,
      workflowEntities: snapshot.workflowEntities,
      jobEntities: snapshot.jobEntities,
      fileWorkflowEdges: snapshot.fileWorkflowEdges,
      workflowJobEdges: snapshot.workflowJobEdges,
    });
  }

  async getRepositoryTestSuites(
    repoFullName: string,
  ): Promise<TwinRepositoryTestSuitesView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const [workflowSnapshot, testSuiteSnapshot] = await Promise.all([
      this.getWorkflowReadSnapshot(repoFullName),
      this.getTestSuiteReadSnapshot(repoFullName),
    ]);

    return buildTwinRepositoryTestSuitesView({
      repository,
      latestRun: testSuiteSnapshot.latestRun,
      testSuiteState: testSuiteSnapshot.testSuiteState,
      testSuiteEntities: testSuiteSnapshot.testSuiteEntities,
      workflowState: workflowSnapshot.workflowState,
      workflowEntities: workflowSnapshot.workflowEntities,
      jobEntities: workflowSnapshot.jobEntities,
      jobSuiteEdges: testSuiteSnapshot.jobSuiteEdges,
    });
  }

  async getRepositoryCiSummary(
    repoFullName: string,
  ): Promise<TwinRepositoryCiSummary> {
    const repository = await this.getRepositorySummary(repoFullName);
    const [workflowSnapshot, testSuiteSnapshot] = await Promise.all([
      this.getWorkflowReadSnapshot(repoFullName),
      this.getTestSuiteReadSnapshot(repoFullName),
    ]);
    const workflowFreshness = buildTwinFreshnessSlice({
      slice: "workflows",
      latestRun: workflowSnapshot.latestRun,
      latestSuccessfulRun: workflowSnapshot.latestSuccessfulRun,
      now: this.now(),
      emptySnapshotReason:
        workflowSnapshot.workflowState === "no_workflow_files"
          ? {
              reasonCode: "no_workflow_files",
              summaryFragment: "found no workflow files.",
            }
          : null,
    });
    const testSuiteFreshness = buildTwinFreshnessSlice({
      slice: "testSuites",
      latestRun: testSuiteSnapshot.latestRun,
      latestSuccessfulRun: testSuiteSnapshot.latestSuccessfulRun,
      now: this.now(),
      emptySnapshotReason:
        testSuiteSnapshot.testSuiteState === "no_test_suites"
          ? {
              reasonCode: "no_test_suites",
              summaryFragment: "found no stored test suites.",
            }
          : null,
    });

    return buildTwinRepositoryCiSummary({
      repository,
      latestWorkflowRun: workflowSnapshot.latestRun,
      latestTestSuiteRun: testSuiteSnapshot.latestRun,
      freshness: buildTwinFreshnessSummary(
        buildTwinFreshnessRollupForEntries([
          {
            sliceName: "workflows",
            slice: workflowFreshness,
          },
          {
            sliceName: "testSuites",
            slice: testSuiteFreshness,
          },
        ]),
      ),
      workflowState: workflowSnapshot.workflowState,
      workflowFileCount: workflowSnapshot.fileEntities.length,
      workflowCount: workflowSnapshot.workflowEntities.length,
      workflowEntities: workflowSnapshot.workflowEntities,
      jobEntities: workflowSnapshot.jobEntities,
      testSuiteState: testSuiteSnapshot.testSuiteState,
      testSuiteEntities: testSuiteSnapshot.testSuiteEntities,
      jobSuiteEdges: testSuiteSnapshot.jobSuiteEdges,
    });
  }

  async queryRepositoryBlastRadius(
    repoFullName: string,
    query: TwinRepositoryBlastRadiusQuery,
  ): Promise<TwinRepositoryBlastRadiusQueryResult> {
    const repository = await this.getRepositorySummary(repoFullName);
    const storedState = await this.loadRepositoryStoredState(repoFullName);
    const freshnessSlices = this.buildFreshnessSlices(storedState);
    const metadataSnapshot = this.buildMetadataReadSnapshot(storedState);
    const ownershipSnapshot = this.buildOwnershipReadSnapshot(storedState);
    const workflowSnapshot = this.buildWorkflowReadSnapshot(storedState);
    const testSuiteSnapshot = this.buildTestSuiteReadSnapshot(storedState);

    return buildTwinRepositoryBlastRadiusQueryResult({
      query,
      metadataSummary: buildTwinRepositoryMetadataSummary({
        repository,
        entities: storedState.entities,
        edges: storedState.edges,
        latestRun: metadataSnapshot.latestRun,
        freshness: buildTwinFreshnessSummary(freshnessSlices.metadata),
      }),
      ownershipSummary: buildTwinRepositoryOwnershipSummary({
        repository,
        latestRun: ownershipSnapshot.latestRun,
        freshness: buildTwinFreshnessSummary(freshnessSlices.ownership),
        ownershipState: ownershipSnapshot.ownershipState,
        codeownersFileEntity: ownershipSnapshot.codeownersFileEntity,
        ownerEntities: ownershipSnapshot.ownerEntities,
        ruleEntities: ownershipSnapshot.ruleEntities,
        effectiveOwnershipEdges: ownershipSnapshot.effectiveOwnershipEdges,
        targetEntities: ownershipSnapshot.targetEntities,
      }),
      ciSummary: buildTwinRepositoryCiSummary({
        repository,
        latestWorkflowRun: workflowSnapshot.latestRun,
        latestTestSuiteRun: testSuiteSnapshot.latestRun,
        freshness: buildTwinFreshnessSummary(
          buildTwinFreshnessRollupForEntries([
            {
              sliceName: "workflows",
              slice: freshnessSlices.workflows,
            },
            {
              sliceName: "testSuites",
              slice: freshnessSlices.testSuites,
            },
          ]),
        ),
        workflowState: workflowSnapshot.workflowState,
        workflowFileCount: workflowSnapshot.fileEntities.length,
        workflowCount: workflowSnapshot.workflowEntities.length,
        workflowEntities: workflowSnapshot.workflowEntities,
        jobEntities: workflowSnapshot.jobEntities,
        testSuiteState: testSuiteSnapshot.testSuiteState,
        testSuiteEntities: testSuiteSnapshot.testSuiteEntities,
        jobSuiteEdges: testSuiteSnapshot.jobSuiteEdges,
      }),
      freshnessView: buildTwinRepositoryFreshnessView({
        repository,
        slices: freshnessSlices,
      }),
    });
  }

  async getRepositoryOwners(
    repoFullName: string,
  ): Promise<TwinRepositoryOwnersView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getOwnershipReadSnapshot(repoFullName);

    return buildTwinRepositoryOwnersView({
      repository,
      latestRun: snapshot.latestRun,
      codeownersFileEntity: snapshot.codeownersFileEntity,
      ownerEntities: snapshot.ownerEntities,
      ruleAssignOwnerEdges: snapshot.ruleAssignOwnerEdges,
    });
  }

  async getRepositoryOwnershipRules(
    repoFullName: string,
  ): Promise<TwinRepositoryOwnershipRulesView> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getOwnershipReadSnapshot(repoFullName);

    return buildTwinRepositoryOwnershipRulesView({
      repository,
      latestRun: snapshot.latestRun,
      codeownersFileEntity: snapshot.codeownersFileEntity,
      ownerEntities: snapshot.ownerEntities,
      ruleEntities: snapshot.ruleEntities,
    });
  }

  async getRepositoryOwnershipSummary(
    repoFullName: string,
  ): Promise<TwinRepositoryOwnershipSummary> {
    const repository = await this.getRepositorySummary(repoFullName);
    const snapshot = await this.getOwnershipReadSnapshot(repoFullName);

    return buildTwinRepositoryOwnershipSummary({
      repository,
      latestRun: snapshot.latestRun,
      freshness: buildTwinFreshnessSummary(
        buildTwinFreshnessSlice({
          slice: "ownership",
          latestRun: snapshot.latestRun,
          latestSuccessfulRun: snapshot.latestSuccessfulRun,
          now: this.now(),
          emptySnapshotReason:
            snapshot.ownershipState === "no_codeowners_file"
              ? {
                  reasonCode: "no_codeowners_file",
                  summaryFragment: "found no CODEOWNERS file.",
                }
              : null,
        }),
      ),
      ownershipState: snapshot.ownershipState,
      codeownersFileEntity: snapshot.codeownersFileEntity,
      ownerEntities: snapshot.ownerEntities,
      ruleEntities: snapshot.ruleEntities,
      effectiveOwnershipEdges: snapshot.effectiveOwnershipEdges,
      targetEntities: snapshot.targetEntities,
    });
  }

  async finishSyncRun(
    input: TwinSyncRunFinishInput,
  ): Promise<TwinSyncRunRecord> {
    const parsed = TwinSyncRunFinishInputSchema.parse(input);

    return this.input.repository.transaction(async (session) => {
      const existingRun = await this.requireSyncRun(parsed.runId, session);

      return this.input.repository.finishSyncRun(
        {
          ...parsed,
          completedAt: parsed.completedAt ?? this.now().toISOString(),
          stats: parsed.stats ?? existingRun.stats,
          errorSummary: parsed.errorSummary ?? null,
        },
        session,
      );
    });
  }

  async syncRepositoryMetadata(
    repoFullName: string,
  ): Promise<TwinRepositoryMetadataSyncResult> {
    return syncRepositoryMetadata({
      metadataExtractor: this.input.metadataExtractor,
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
      sourceResolver: this.input.sourceResolver,
    });
  }

  async syncRepositoryDocs(
    repoFullName: string,
  ): Promise<TwinRepositoryDocsSyncResult> {
    return syncRepositoryDocs({
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
      sourceResolver: this.input.sourceResolver,
    });
  }

  async syncRepositoryRunbooks(
    repoFullName: string,
  ): Promise<TwinRepositoryRunbooksSyncResult> {
    return syncRepositoryRunbooks({
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
      sourceResolver: this.input.sourceResolver,
    });
  }

  async syncRepositoryWorkflows(
    repoFullName: string,
  ): Promise<TwinRepositoryWorkflowSyncResult> {
    return syncRepositoryWorkflows({
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
      sourceResolver: this.input.sourceResolver,
    });
  }

  async syncRepositoryTestSuites(
    repoFullName: string,
  ): Promise<TwinRepositoryTestSuiteSyncResult> {
    return syncRepositoryTestSuites({
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
    });
  }

  async syncRepositoryOwnership(
    repoFullName: string,
  ): Promise<TwinRepositoryOwnershipSyncResult> {
    return syncRepositoryOwnership({
      now: this.now,
      repoFullName,
      repository: this.input.repository,
      repositoryRegistry: this.input.repositoryRegistry,
      sourceResolver: this.input.sourceResolver,
    });
  }

  async startSyncRun(input: TwinSyncRunStartInput): Promise<TwinSyncRunRecord> {
    const parsed = TwinSyncRunStartInputSchema.parse(input);
    await this.input.repositoryRegistry.resolveWritableRepository(
      parsed.repoFullName,
    );

    return this.input.repository.startSyncRun({
      ...parsed,
      startedAt: parsed.startedAt ?? this.now().toISOString(),
      stats: parsed.stats ?? {},
    });
  }

  async upsertEdge(input: TwinEdgeUpsertInput): Promise<TwinEdgeRecord> {
    const parsed = TwinEdgeUpsertInputSchema.parse(input);
    await this.requireRepositoryExists(parsed.repoFullName);

    return this.input.repository.transaction(async (session) => {
      await this.requireSourceRunMatchesRepo(
        parsed.sourceRunId ?? null,
        parsed.repoFullName,
        session,
      );
      await this.requireEntityMatchesRepo(
        parsed.fromEntityId,
        parsed.repoFullName,
        session,
      );
      await this.requireEntityMatchesRepo(
        parsed.toEntityId,
        parsed.repoFullName,
        session,
      );

      return this.input.repository.upsertEdge(
        {
          ...parsed,
          payload: parsed.payload ?? {},
          sourceRunId: parsed.sourceRunId ?? null,
        },
        session,
      );
    });
  }

  async upsertEntity(input: TwinEntityUpsertInput): Promise<TwinEntityRecord> {
    const parsed = TwinEntityUpsertInputSchema.parse(input);
    await this.requireRepositoryExists(parsed.repoFullName);

    return this.input.repository.transaction(async (session) => {
      await this.requireSourceRunMatchesRepo(
        parsed.sourceRunId ?? null,
        parsed.repoFullName,
        session,
      );

      return this.input.repository.upsertEntity(
        {
          ...parsed,
          summary: parsed.summary ?? null,
          payload: parsed.payload ?? {},
          staleAfter: parsed.staleAfter ?? null,
          sourceRunId: parsed.sourceRunId ?? null,
        },
        session,
      );
    });
  }

  private async getRepositorySummary(repoFullName: string) {
    return toTwinRepositorySummary(
      await this.input.repositoryRegistry.getRepository(repoFullName),
    );
  }

  private async loadRepositoryStoredState(
    repoFullName: string,
  ): Promise<TwinRepositoryStoredState> {
    const [entities, edges, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryEdges(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);

    return {
      edges,
      entities,
      runs,
    };
  }

  private buildFreshnessSlices(storedState: TwinRepositoryStoredState) {
    const now = this.now();
    const metadataSnapshot = this.buildMetadataReadSnapshot(storedState);
    const ownershipSnapshot = this.buildOwnershipReadSnapshot(storedState);
    const workflowSnapshot = this.buildWorkflowReadSnapshot(storedState);
    const testSuiteSnapshot = this.buildTestSuiteReadSnapshot(storedState);
    const docsSnapshot = this.buildDocsReadSnapshot(storedState);
    const runbookSnapshot = this.buildRunbookReadSnapshot(storedState);

    return {
      metadata: buildTwinFreshnessSlice({
        slice: "metadata",
        latestRun: metadataSnapshot.latestRun,
        latestSuccessfulRun: metadataSnapshot.latestSuccessfulRun,
        now,
      }),
      ownership: buildTwinFreshnessSlice({
        slice: "ownership",
        latestRun: ownershipSnapshot.latestRun,
        latestSuccessfulRun: ownershipSnapshot.latestSuccessfulRun,
        now,
        emptySnapshotReason:
          ownershipSnapshot.ownershipState === "no_codeowners_file"
            ? {
                reasonCode: "no_codeowners_file",
                summaryFragment: "found no CODEOWNERS file.",
              }
            : null,
      }),
      workflows: buildTwinFreshnessSlice({
        slice: "workflows",
        latestRun: workflowSnapshot.latestRun,
        latestSuccessfulRun: workflowSnapshot.latestSuccessfulRun,
        now,
        emptySnapshotReason:
          workflowSnapshot.workflowState === "no_workflow_files"
            ? {
                reasonCode: "no_workflow_files",
                summaryFragment: "found no workflow files.",
              }
            : null,
      }),
      testSuites: buildTwinFreshnessSlice({
        slice: "testSuites",
        latestRun: testSuiteSnapshot.latestRun,
        latestSuccessfulRun: testSuiteSnapshot.latestSuccessfulRun,
        now,
        emptySnapshotReason:
          testSuiteSnapshot.testSuiteState === "no_test_suites"
            ? {
                reasonCode: "no_test_suites",
                summaryFragment: "found no stored test suites.",
              }
            : null,
      }),
      docs: buildTwinFreshnessSlice({
        slice: "docs",
        latestRun: docsSnapshot.latestRun,
        latestSuccessfulRun: docsSnapshot.latestSuccessfulRun,
        now,
        emptySnapshotReason:
          docsSnapshot.docsState === "no_docs"
            ? {
                reasonCode: "no_docs",
                summaryFragment: "found no approved docs.",
              }
            : null,
      }),
      runbooks: buildTwinFreshnessSlice({
        slice: "runbooks",
        latestRun: runbookSnapshot.latestRun,
        latestSuccessfulRun: runbookSnapshot.latestSuccessfulRun,
        now,
        emptySnapshotReason:
          runbookSnapshot.runbookState === "no_runbooks"
            ? {
                reasonCode: "no_runbooks",
                summaryFragment: "found no classified runbooks.",
              }
            : null,
      }),
    };
  }

  private buildMetadataReadSnapshot(storedState: TwinRepositoryStoredState) {
    const metadataRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === metadataExtractorName,
    );

    return {
      latestRun: metadataRuns[0] ?? null,
      latestSuccessfulRun:
        metadataRuns.find((candidate) => candidate.status === "succeeded") ??
        null,
    };
  }

  private async getOwnershipReadSnapshot(repoFullName: string) {
    return this.buildOwnershipReadSnapshot(
      await this.loadRepositoryStoredState(repoFullName),
    );
  }

  private buildOwnershipReadSnapshot(storedState: TwinRepositoryStoredState) {
    const ownershipRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === ownershipExtractorName,
    );
    const latestRun = ownershipRuns[0] ?? null;
    const latestSuccessfulRun =
      ownershipRuns.find((candidate) => candidate.status === "succeeded") ??
      null;
    const targetEntities = readOwnershipTargets(storedState.entities);

    if (!latestSuccessfulRun) {
      return {
        latestRun,
        latestSuccessfulRun,
        ownershipState: "not_synced" as const,
        codeownersFileEntity: null,
        effectiveOwnershipEdges: [],
        ownerEntities: [],
        ruleEntities: [],
        ruleAssignOwnerEdges: [],
        targetEntities,
      };
    }

    if (
      readNonNegativeInteger(
        latestSuccessfulRun.stats,
        "codeownersFileCount",
      ) === 0
    ) {
      return {
        latestRun,
        latestSuccessfulRun,
        ownershipState: "no_codeowners_file" as const,
        codeownersFileEntity: null,
        effectiveOwnershipEdges: [],
        ownerEntities: [],
        ruleEntities: [],
        ruleAssignOwnerEdges: [],
        targetEntities,
      };
    }

    const snapshotEntities = storedState.entities.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );
    const snapshotEdges = storedState.edges.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );

    return {
      latestRun,
      latestSuccessfulRun,
      ownershipState: "effective_ownership_available" as const,
      codeownersFileEntity:
        snapshotEntities.find(
          (candidate) => candidate.kind === "codeowners_file",
        ) ?? null,
      effectiveOwnershipEdges: snapshotEdges.filter(
        (candidate) =>
          ownershipTwinEdgeKinds.includes(
            candidate.kind as (typeof ownershipTwinEdgeKinds)[number],
          ) &&
          (candidate.kind === "rule_owns_directory" ||
            candidate.kind === "rule_owns_manifest"),
      ),
      ownerEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "owner_principal",
      ),
      ruleEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "ownership_rule",
      ),
      ruleAssignOwnerEdges: snapshotEdges.filter(
        (candidate) => candidate.kind === "rule_assigns_owner",
      ),
      targetEntities,
    };
  }

  private async getDocsReadSnapshot(repoFullName: string) {
    return this.buildDocsReadSnapshot(
      await this.loadRepositoryStoredState(repoFullName),
    );
  }

  private buildDocsReadSnapshot(storedState: TwinRepositoryStoredState) {
    const docsRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === docsExtractorName,
    );
    const latestRun = docsRuns[0] ?? null;
    const latestSuccessfulRun =
      docsRuns.find((candidate) => candidate.status === "succeeded") ?? null;

    if (!latestSuccessfulRun) {
      return {
        latestRun,
        latestSuccessfulRun,
        docsState: "not_synced" as const,
        docFileEntities: [],
        docSectionEntities: [],
      };
    }

    if (
      readNonNegativeInteger(latestSuccessfulRun.stats, "docFileCount") === 0
    ) {
      return {
        latestRun,
        latestSuccessfulRun,
        docsState: "no_docs" as const,
        docFileEntities: [],
        docSectionEntities: [],
      };
    }

    const snapshotEntities = storedState.entities.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );

    return {
      latestRun,
      latestSuccessfulRun,
      docsState: "docs_available" as const,
      docFileEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "doc_file",
      ),
      docSectionEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "doc_section",
      ),
    };
  }

  private async getRunbookReadSnapshot(repoFullName: string) {
    return this.buildRunbookReadSnapshot(
      await this.loadRepositoryStoredState(repoFullName),
    );
  }

  private buildRunbookReadSnapshot(storedState: TwinRepositoryStoredState) {
    const runbookRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === runbookExtractorName,
    );
    const latestRun = runbookRuns[0] ?? null;
    const latestSuccessfulRun =
      runbookRuns.find((candidate) => candidate.status === "succeeded") ?? null;

    if (!latestSuccessfulRun) {
      return {
        latestRun,
        latestSuccessfulRun,
        runbookState: "not_synced" as const,
        runbookDocumentEntities: [],
        runbookStepEntities: [],
      };
    }

    if (
      readNonNegativeInteger(
        latestSuccessfulRun.stats,
        "runbookDocumentCount",
      ) === 0
    ) {
      return {
        latestRun,
        latestSuccessfulRun,
        runbookState: "no_runbooks" as const,
        runbookDocumentEntities: [],
        runbookStepEntities: [],
      };
    }

    const snapshotEntities = storedState.entities.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );

    return {
      latestRun,
      latestSuccessfulRun,
      runbookState: "runbooks_available" as const,
      runbookDocumentEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "runbook_document",
      ),
      runbookStepEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "runbook_step",
      ),
    };
  }

  private async getWorkflowReadSnapshot(repoFullName: string) {
    return this.buildWorkflowReadSnapshot(
      await this.loadRepositoryStoredState(repoFullName),
    );
  }

  private buildWorkflowReadSnapshot(storedState: TwinRepositoryStoredState) {
    const workflowRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === workflowExtractorName,
    );
    const latestRun = workflowRuns[0] ?? null;
    const latestSuccessfulRun =
      workflowRuns.find((candidate) => candidate.status === "succeeded") ??
      null;

    if (!latestSuccessfulRun) {
      return {
        latestRun,
        latestSuccessfulRun,
        workflowState: "not_synced" as const,
        fileEntities: [],
        workflowEntities: [],
        jobEntities: [],
        fileWorkflowEdges: [],
        workflowJobEdges: [],
      };
    }

    if (
      readNonNegativeInteger(latestSuccessfulRun.stats, "workflowFileCount") ===
      0
    ) {
      return {
        latestRun,
        latestSuccessfulRun,
        workflowState: "no_workflow_files" as const,
        fileEntities: [],
        workflowEntities: [],
        jobEntities: [],
        fileWorkflowEdges: [],
        workflowJobEdges: [],
      };
    }

    const snapshotEntities = storedState.entities.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );
    const snapshotEdges = storedState.edges.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );

    return {
      latestRun,
      latestSuccessfulRun,
      workflowState: "workflows_available" as const,
      fileEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "ci_workflow_file",
      ),
      workflowEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "ci_workflow",
      ),
      jobEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "ci_job",
      ),
      fileWorkflowEdges: snapshotEdges.filter(
        (candidate) => candidate.kind === "workflow_file_defines_workflow",
      ),
      workflowJobEdges: snapshotEdges.filter(
        (candidate) => candidate.kind === "workflow_contains_job",
      ),
    };
  }

  private async getTestSuiteReadSnapshot(repoFullName: string) {
    return this.buildTestSuiteReadSnapshot(
      await this.loadRepositoryStoredState(repoFullName),
    );
  }

  private buildTestSuiteReadSnapshot(storedState: TwinRepositoryStoredState) {
    const testSuiteRuns = storedState.runs.filter(
      (candidate) => candidate.extractor === testSuiteExtractorName,
    );
    const latestRun = testSuiteRuns[0] ?? null;
    const latestSuccessfulRun =
      testSuiteRuns.find((candidate) => candidate.status === "succeeded") ??
      null;

    if (!latestSuccessfulRun) {
      return {
        latestRun,
        latestSuccessfulRun,
        testSuiteState: "not_synced" as const,
        testSuiteEntities: [],
        jobSuiteEdges: [],
      };
    }

    if (
      readNonNegativeInteger(latestSuccessfulRun.stats, "testSuiteCount") === 0
    ) {
      return {
        latestRun,
        latestSuccessfulRun,
        testSuiteState: "no_test_suites" as const,
        testSuiteEntities: [],
        jobSuiteEdges: [],
      };
    }

    const snapshotEntities = storedState.entities.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );
    const snapshotEdges = storedState.edges.filter(
      (candidate) => candidate.sourceRunId === latestSuccessfulRun.id,
    );

    return {
      latestRun,
      latestSuccessfulRun,
      testSuiteState: "test_suites_available" as const,
      testSuiteEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "test_suite",
      ),
      jobSuiteEdges: snapshotEdges.filter(
        (candidate) => candidate.kind === "ci_job_runs_test_suite",
      ),
    };
  }

  private async requireEntityMatchesRepo(
    entityId: string,
    repoFullName: string,
    session?: Parameters<TwinRepository["getEntityById"]>[1],
  ) {
    const entity = await this.input.repository.getEntityById(entityId, session);

    if (!entity) {
      throw new Error(`Twin entity ${entityId} not found`);
    }

    if (entity.repoFullName !== repoFullName) {
      throw new Error(
        `Twin entity ${entityId} belongs to ${entity.repoFullName}, expected ${repoFullName}`,
      );
    }

    return entity;
  }

  private async requireRepositoryExists(repoFullName: string) {
    await this.input.repositoryRegistry.getRepository(repoFullName);
  }

  private async requireSourceRunMatchesRepo(
    sourceRunId: string | null,
    repoFullName: string,
    session?: Parameters<TwinRepository["getSyncRunById"]>[1],
  ) {
    if (!sourceRunId) {
      return null;
    }

    const run = await this.requireSyncRun(sourceRunId, session);

    if (run.repoFullName !== repoFullName) {
      throw new Error(
        `Twin sync run ${sourceRunId} belongs to ${run.repoFullName}, expected ${repoFullName}`,
      );
    }

    return run;
  }

  private async requireSyncRun(
    runId: string,
    session?: Parameters<TwinRepository["getSyncRunById"]>[1],
  ) {
    const run = await this.input.repository.getSyncRunById(runId, session);

    if (!run) {
      throw new Error(`Twin sync run ${runId} not found`);
    }

    return run;
  }
}

function readNonNegativeInteger(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return Number.isInteger(value) && typeof value === "number" && value >= 0
    ? value
    : null;
}
