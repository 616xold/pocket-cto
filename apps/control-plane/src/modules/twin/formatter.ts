import type {
  TwinEdge,
  TwinEdgeListView,
  TwinEntity,
  TwinEntityListView,
  TwinRepositorySummary,
  TwinSyncRun,
  TwinSyncRunListView,
} from "@pocket-cto/domain";
import type { GitHubRepositoryDetailResult } from "../github-app/schema";

export function toTwinRepositorySummary(
  detail: GitHubRepositoryDetailResult,
): TwinRepositorySummary {
  return {
    fullName: detail.repository.fullName,
    installationId: detail.repository.installationId,
    defaultBranch: detail.repository.defaultBranch,
    archived: detail.repository.archived,
    disabled: detail.repository.disabled,
    isActive: detail.repository.isActive,
    writeReadiness: detail.writeReadiness,
  };
}

export function buildTwinEntityListView(input: {
  entities: TwinEntity[];
  repository: TwinRepositorySummary;
}): TwinEntityListView {
  return {
    repository: input.repository,
    entityCount: input.entities.length,
    entities: input.entities,
  };
}

export function buildTwinEdgeListView(input: {
  edges: TwinEdge[];
  repository: TwinRepositorySummary;
}): TwinEdgeListView {
  return {
    repository: input.repository,
    edgeCount: input.edges.length,
    edges: input.edges,
  };
}

export function buildTwinSyncRunListView(input: {
  repository: TwinRepositorySummary;
  runs: TwinSyncRun[];
}): TwinSyncRunListView {
  return {
    repository: input.repository,
    runCount: input.runs.length,
    runs: input.runs,
  };
}
