import type { GitHubRepositorySummary } from "../github-app/schema";
import {
  discoverPackageManifests,
  discoverWorkspaceDirectories,
  readRootReadme,
} from "./repository-metadata-discovery";

export const repositoryMetadataEntityKinds = [
  "repository",
  "default_branch",
  "root_readme",
  "package_manifest",
  "workspace_directory",
] as const;

export const repositoryMetadataEdgeKinds = [
  "repository_has_branch",
  "repository_contains_manifest",
  "repository_contains_directory",
  "repository_has_readme",
] as const;

export type RepositoryMetadataEntityKind =
  (typeof repositoryMetadataEntityKinds)[number];
export type RepositoryMetadataEdgeKind =
  (typeof repositoryMetadataEdgeKinds)[number];

export type RepositoryMetadataEntityDraft = {
  kind: RepositoryMetadataEntityKind;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

export type RepositoryMetadataEdgeDraft = {
  fromKind: RepositoryMetadataEntityKind;
  fromStableKey: string;
  kind: RepositoryMetadataEdgeKind;
  payload: Record<string, unknown>;
  toKind: RepositoryMetadataEntityKind;
  toStableKey: string;
};

export type RepositoryMetadataSnapshot = {
  directories: number;
  edges: RepositoryMetadataEdgeDraft[];
  entities: RepositoryMetadataEntityDraft[];
  manifests: number;
};

export interface TwinRepositoryMetadataExtractor {
  extract(input: {
    repository: GitHubRepositorySummary;
    repoRoot: string;
  }): Promise<RepositoryMetadataSnapshot>;
}

export class LocalTwinRepositoryMetadataExtractor
  implements TwinRepositoryMetadataExtractor
{
  async extract(input: {
    repository: GitHubRepositorySummary;
    repoRoot: string;
  }): Promise<RepositoryMetadataSnapshot> {
    const rootReadme = await readRootReadme(input.repoRoot);
    const manifests = await discoverPackageManifests(input.repoRoot);
    const directories = await discoverWorkspaceDirectories(input.repoRoot);
    const entities: RepositoryMetadataEntityDraft[] = [
      {
        kind: "repository",
        payload: {
          archived: input.repository.archived,
          defaultBranch: input.repository.defaultBranch,
          disabled: input.repository.disabled,
          fullName: input.repository.fullName,
          isActive: input.repository.isActive,
          visibility: input.repository.visibility,
        },
        stableKey: "repository",
        summary: "Synced repository registry metadata.",
        title: input.repository.fullName,
      },
      {
        kind: "default_branch",
        payload: {
          name: input.repository.defaultBranch,
        },
        stableKey: "default_branch",
        summary: "Default branch from the synced repository registry.",
        title: input.repository.defaultBranch,
      },
      ...manifests.map<RepositoryMetadataEntityDraft>((manifest) => ({
        kind: "package_manifest",
        payload: {
          hasWorkspaces: manifest.hasWorkspaces,
          packageName: manifest.packageName,
          path: manifest.path,
          private: manifest.private,
          scriptNames: manifest.scriptNames,
        },
        stableKey: manifest.path,
        summary: "Discovered package.json metadata.",
        title: manifest.packageName ?? manifest.path,
      })),
      ...directories.map<RepositoryMetadataEntityDraft>((directory) => ({
        kind: "workspace_directory",
        payload: {
          classification: directory.classification,
          label: directory.label,
          path: directory.path,
        },
        stableKey: directory.path,
        summary: "Top-level workspace directory present in the repository root.",
        title: directory.label,
      })),
    ];
    const edges: RepositoryMetadataEdgeDraft[] = [
      {
        fromKind: "repository",
        fromStableKey: "repository",
        kind: "repository_has_branch",
        payload: {},
        toKind: "default_branch",
        toStableKey: "default_branch",
      },
      ...manifests.map<RepositoryMetadataEdgeDraft>((manifest) => ({
        fromKind: "repository",
        fromStableKey: "repository",
        kind: "repository_contains_manifest",
        payload: {},
        toKind: "package_manifest",
        toStableKey: manifest.path,
      })),
      ...directories.map<RepositoryMetadataEdgeDraft>((directory) => ({
        fromKind: "repository",
        fromStableKey: "repository",
        kind: "repository_contains_directory",
        payload: {},
        toKind: "workspace_directory",
        toStableKey: directory.path,
      })),
    ];

    if (rootReadme) {
      entities.push({
        kind: "root_readme",
        payload: {
          lineCount: rootReadme.lineCount,
          path: rootReadme.path,
          sizeBytes: rootReadme.sizeBytes,
        },
        stableKey: "root_readme",
        summary: "Root repository README metadata.",
        title: rootReadme.path,
      });
      edges.push({
        fromKind: "repository",
        fromStableKey: "repository",
        kind: "repository_has_readme",
        payload: {},
        toKind: "root_readme",
        toStableKey: "root_readme",
      });
    }

    return {
      directories: directories.length,
      edges,
      entities,
      manifests: manifests.length,
    };
  }
}
