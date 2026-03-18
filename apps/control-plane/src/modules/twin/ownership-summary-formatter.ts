import type {
  TwinEdge,
  TwinEntity,
  TwinRepositoryOwnershipSummary,
  TwinRepositorySummary,
  TwinSyncRun,
} from "@pocket-cto/domain";
import {
  readCodeownersFile,
  readOwnershipRule,
} from "./ownership-formatter";
import {
  splitOwnershipTargets,
  type OwnershipDirectoryTarget,
  type OwnershipManifestTarget,
  type OwnershipTarget,
} from "./ownership-targets";

type OwnershipSummaryState =
  | "effective_ownership_available"
  | "no_codeowners_file"
  | "not_synced";

export function buildTwinRepositoryOwnershipSummary(input: {
  codeownersFileEntity: TwinEntity | null;
  effectiveOwnershipEdges: TwinEdge[];
  latestRun: TwinSyncRun | null;
  ownerEntities: TwinEntity[];
  ownershipState: OwnershipSummaryState;
  repository: TwinRepositorySummary;
  ruleEntities: TwinEntity[];
  targetEntities: OwnershipTarget[];
}): TwinRepositoryOwnershipSummary {
  const targets = splitOwnershipTargets(input.targetEntities);

  if (input.ownershipState === "not_synced") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      ownershipState: "not_synced",
      codeownersFile: null,
      counts: {
        ruleCount: 0,
        ownerCount: 0,
        directoryCount: targets.directories.length,
        manifestCount: targets.manifests.length,
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
  }

  if (input.ownershipState === "no_codeowners_file") {
    return {
      repository: input.repository,
      latestRun: input.latestRun,
      ownershipState: "no_codeowners_file",
      codeownersFile: null,
      counts: {
        ruleCount: 0,
        ownerCount: 0,
        directoryCount: targets.directories.length,
        manifestCount: targets.manifests.length,
        ownedDirectoryCount: 0,
        ownedManifestCount: 0,
        unownedDirectoryCount: targets.directories.length,
        unownedManifestCount: targets.manifests.length,
      },
      ownedDirectories: [],
      ownedManifests: [],
      unownedDirectories: targets.directories,
      unownedManifests: targets.manifests,
    };
  }

  const ruleById = new Map(
    input.ruleEntities.map((entity) => [entity.id, readOwnershipRule(entity)]),
  );
  const winningRuleByTargetId = buildWinningRuleByTargetId(
    input.effectiveOwnershipEdges,
    ruleById,
  );
  const ownedDirectories: TwinRepositoryOwnershipSummary["ownedDirectories"] = [];
  const ownedManifests: TwinRepositoryOwnershipSummary["ownedManifests"] = [];
  const unownedDirectories: TwinRepositoryOwnershipSummary["unownedDirectories"] = [];
  const unownedManifests: TwinRepositoryOwnershipSummary["unownedManifests"] = [];

  for (const directory of targets.directories) {
    const rule = winningRuleByTargetId.get(directory.entityId);

    if (!rule) {
      unownedDirectories.push(directory);
      continue;
    }

    ownedDirectories.push(toOwnedDirectory(directory, rule));
  }

  for (const manifest of targets.manifests) {
    const rule = winningRuleByTargetId.get(manifest.entityId);

    if (!rule) {
      unownedManifests.push(manifest);
      continue;
    }

    ownedManifests.push(toOwnedManifest(manifest, rule));
  }

  return {
    repository: input.repository,
    latestRun: input.latestRun,
    ownershipState: "effective_ownership_available",
    codeownersFile: readCodeownersFile(input.codeownersFileEntity),
    counts: {
      ruleCount: input.ruleEntities.length,
      ownerCount: input.ownerEntities.length,
      directoryCount: targets.directories.length,
      manifestCount: targets.manifests.length,
      ownedDirectoryCount: ownedDirectories.length,
      ownedManifestCount: ownedManifests.length,
      unownedDirectoryCount: unownedDirectories.length,
      unownedManifestCount: unownedManifests.length,
    },
    ownedDirectories,
    ownedManifests,
    unownedDirectories,
    unownedManifests,
  };
}

function buildWinningRuleByTargetId(
  edges: TwinEdge[],
  ruleById: Map<string, ReturnType<typeof readOwnershipRule>>,
) {
  const winningRuleByTargetId = new Map<string, ReturnType<typeof readOwnershipRule>>();

  for (const edge of edges) {
    const rule = ruleById.get(edge.fromEntityId);

    if (!rule) {
      continue;
    }

    const existing = winningRuleByTargetId.get(edge.toEntityId);

    if (!existing || rule.ordinal >= existing.ordinal) {
      winningRuleByTargetId.set(edge.toEntityId, rule);
    }
  }

  return winningRuleByTargetId;
}

function toOwnedDirectory(
  target: OwnershipDirectoryTarget,
  rule: ReturnType<typeof readOwnershipRule>,
) {
  return {
    path: target.path,
    label: target.label,
    classification: target.classification,
    effectiveOwners: rule.normalizedOwners,
    appliedRule: {
      sourceFilePath: rule.sourceFilePath,
      ordinal: rule.ordinal,
      rawPattern: rule.rawPattern,
      patternShape: rule.patternShape,
    },
  };
}

function toOwnedManifest(
  target: OwnershipManifestTarget,
  rule: ReturnType<typeof readOwnershipRule>,
) {
  return {
    path: target.path,
    packageName: target.packageName,
    private: target.private,
    hasWorkspaces: target.hasWorkspaces,
    scriptNames: target.scriptNames,
    effectiveOwners: rule.normalizedOwners,
    appliedRule: {
      sourceFilePath: rule.sourceFilePath,
      ordinal: rule.ordinal,
      rawPattern: rule.rawPattern,
      patternShape: rule.patternShape,
    },
  };
}
