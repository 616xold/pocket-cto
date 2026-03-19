import type {
  TwinRepositoryCiSummary,
  TwinRepositoryDocSectionsView,
  TwinRepositoryDocsSyncResult,
  TwinRepositoryDocsView,
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
import type { GitHubRepositoryDetailResult } from "../github-app/schema";
import {
  buildTwinRepositoryDocSectionsView,
  buildTwinRepositoryDocsView,
} from "./docs-formatter";
import { docsExtractorName, syncRepositoryDocs } from "./docs-sync";
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
import { syncRepositoryMetadata } from "./metadata-sync";
import type { TwinRepositorySourceResolver } from "./source-resolver";
import { readOwnershipTargets } from "./ownership-targets";
import { buildTwinRepositoryWorkflowsView } from "./workflow-formatter";
import {
  buildTwinRepositoryCiSummary,
  buildTwinRepositoryTestSuitesView,
} from "./test-suite-formatter";
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

  async getRepositoryMetadataSummary(
    repoFullName: string,
  ): Promise<TwinRepositoryMetadataSummary> {
    const repository = await this.getRepositorySummary(repoFullName);
    const [entities, edges, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryEdges(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);

    return buildTwinRepositoryMetadataSummary({
      repository,
      entities,
      edges,
      latestRun: runs[0] ?? null,
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

    return buildTwinRepositoryCiSummary({
      repository,
      latestWorkflowRun: workflowSnapshot.latestRun,
      latestTestSuiteRun: testSuiteSnapshot.latestRun,
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

  private async getOwnershipReadSnapshot(repoFullName: string) {
    const [entities, edges, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryEdges(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);
    const ownershipRuns = runs.filter(
      (candidate) => candidate.extractor === ownershipExtractorName,
    );
    const latestRun = ownershipRuns[0] ?? null;
    const latestSucceededRun =
      ownershipRuns.find((candidate) => candidate.status === "succeeded") ??
      null;
    const targetEntities = readOwnershipTargets(entities);

    if (!latestSucceededRun) {
      return {
        latestRun,
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
        latestSucceededRun.stats,
        "codeownersFileCount",
      ) === 0
    ) {
      return {
        latestRun,
        ownershipState: "no_codeowners_file" as const,
        codeownersFileEntity: null,
        effectiveOwnershipEdges: [],
        ownerEntities: [],
        ruleEntities: [],
        ruleAssignOwnerEdges: [],
        targetEntities,
      };
    }

    const snapshotEntities = entities.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );
    const snapshotEdges = edges.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );

    return {
      latestRun,
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
    const [entities, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);
    const docsRuns = runs.filter(
      (candidate) => candidate.extractor === docsExtractorName,
    );
    const latestRun = docsRuns[0] ?? null;
    const latestSucceededRun =
      docsRuns.find((candidate) => candidate.status === "succeeded") ?? null;

    if (!latestSucceededRun) {
      return {
        latestRun,
        docsState: "not_synced" as const,
        docFileEntities: [],
        docSectionEntities: [],
      };
    }

    if (readNonNegativeInteger(latestSucceededRun.stats, "docFileCount") === 0) {
      return {
        latestRun,
        docsState: "no_docs" as const,
        docFileEntities: [],
        docSectionEntities: [],
      };
    }

    const snapshotEntities = entities.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );

    return {
      latestRun,
      docsState: "docs_available" as const,
      docFileEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "doc_file",
      ),
      docSectionEntities: snapshotEntities.filter(
        (candidate) => candidate.kind === "doc_section",
      ),
    };
  }

  private async getWorkflowReadSnapshot(repoFullName: string) {
    const [entities, edges, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryEdges(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);
    const workflowRuns = runs.filter(
      (candidate) => candidate.extractor === workflowExtractorName,
    );
    const latestRun = workflowRuns[0] ?? null;
    const latestSucceededRun =
      workflowRuns.find((candidate) => candidate.status === "succeeded") ??
      null;

    if (!latestSucceededRun) {
      return {
        latestRun,
        workflowState: "not_synced" as const,
        fileEntities: [],
        workflowEntities: [],
        jobEntities: [],
        fileWorkflowEdges: [],
        workflowJobEdges: [],
      };
    }

    if (
      readNonNegativeInteger(latestSucceededRun.stats, "workflowFileCount") ===
      0
    ) {
      return {
        latestRun,
        workflowState: "no_workflow_files" as const,
        fileEntities: [],
        workflowEntities: [],
        jobEntities: [],
        fileWorkflowEdges: [],
        workflowJobEdges: [],
      };
    }

    const snapshotEntities = entities.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );
    const snapshotEdges = edges.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );

    return {
      latestRun,
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
    const [entities, edges, runs] = await Promise.all([
      this.input.repository.listRepositoryEntities(repoFullName),
      this.input.repository.listRepositoryEdges(repoFullName),
      this.input.repository.listRepositoryRuns(repoFullName),
    ]);
    const testSuiteRuns = runs.filter(
      (candidate) => candidate.extractor === testSuiteExtractorName,
    );
    const latestRun = testSuiteRuns[0] ?? null;
    const latestSucceededRun =
      testSuiteRuns.find((candidate) => candidate.status === "succeeded") ??
      null;

    if (!latestSucceededRun) {
      return {
        latestRun,
        testSuiteState: "not_synced" as const,
        testSuiteEntities: [],
        jobSuiteEdges: [],
      };
    }

    if (
      readNonNegativeInteger(latestSucceededRun.stats, "testSuiteCount") === 0
    ) {
      return {
        latestRun,
        testSuiteState: "no_test_suites" as const,
        testSuiteEntities: [],
        jobSuiteEdges: [],
      };
    }

    const snapshotEntities = entities.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );
    const snapshotEdges = edges.filter(
      (candidate) => candidate.sourceRunId === latestSucceededRun.id,
    );

    return {
      latestRun,
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
