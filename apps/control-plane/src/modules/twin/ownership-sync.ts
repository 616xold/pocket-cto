import type { TwinRepositoryOwnershipSyncResult } from "@pocket-cto/domain";
import type {
  GitHubRepositoryDetailResult,
  GitHubRepositorySummary,
} from "../github-app/schema";
import { discoverCodeownersFile } from "./codeowners-discovery";
import {
  parseCodeownersFile,
  type ParsedCodeownersRule,
  type ParsedOwnerPrincipal,
} from "./codeowners-parser";
import {
  buildTwinRepositoryOwnershipSyncResult,
} from "./ownership-formatter";
import {
  matchOwnershipTargets,
  type MatchableOwnershipRule,
} from "./ownership-matcher";
import type { TwinRepository } from "./repository";
import type { TwinRepositorySourceResolver } from "./source-resolver";
import type { TwinEdgeRecord, TwinEntityRecord, TwinSyncRunRecord } from "./types";
import { toTwinRepositorySummary } from "./formatter";
import { readOwnershipTargets } from "./ownership-targets";

type TwinRepositoryRegistryPort = {
  getRepository(fullName: string): Promise<GitHubRepositoryDetailResult>;
  resolveWritableRepository(fullName: string): Promise<unknown>;
};

type OwnershipEntityDraft = {
  kind: string;
  payload: Record<string, unknown>;
  stableKey: string;
  summary: string | null;
  title: string;
};

type OwnershipEdgeDraft = {
  fromKind: string;
  fromStableKey: string;
  kind: string;
  payload: Record<string, unknown>;
  toKind: string;
  toStableKey: string;
};

type OwnershipSnapshot = {
  codeownersFilePath: string | null;
  directoryTargetCount: number;
  edges: OwnershipEdgeDraft[];
  entities: OwnershipEntityDraft[];
  manifestTargetCount: number;
  ownerCount: number;
  ownedDirectoryCount: number;
  ownedManifestCount: number;
  ruleCount: number;
};

export const ownershipExtractorName = "codeowners_ownership";

export const ownershipTwinEntityKinds = [
  "codeowners_file",
  "ownership_rule",
  "owner_principal",
] as const;

export const ownershipTwinEdgeKinds = [
  "repository_has_codeowners",
  "codeowners_file_defines_rule",
  "rule_assigns_owner",
  "rule_owns_directory",
  "rule_owns_manifest",
] as const;

export async function syncRepositoryOwnership(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
  sourceResolver: TwinRepositorySourceResolver;
}): Promise<TwinRepositoryOwnershipSyncResult> {
  const detail = await input.repositoryRegistry.getRepository(input.repoFullName);
  const run = await startOwnershipRun(input);
  let snapshot: OwnershipSnapshot | null = null;
  const existingEntities = await input.repository.listRepositoryEntities(
    input.repoFullName,
  );

  try {
    const source = await input.sourceResolver.resolveRepositorySource(
      input.repoFullName,
    );
    snapshot = await extractOwnershipSnapshot({
      ownershipTargets: readOwnershipTargets(existingEntities),
      repoRoot: source.repoRoot,
      repository: detail.repository,
    });
    const persisted = await persistOwnershipSnapshot({
      existingEntities,
      observedAt: run.startedAt,
      repoFullName: input.repoFullName,
      repository: input.repository,
      runId: run.id,
      snapshot,
    });
    const finishedRun = await finishOwnershipRun({
      errorSummary: null,
      now: input.now,
      repository: input.repository,
      run,
      status: "succeeded",
      stats: buildOwnershipSyncStats(
        snapshot,
        persisted.entities.length,
        persisted.edges.length,
      ),
    });

    return buildTwinRepositoryOwnershipSyncResult({
      codeownersFilePath: snapshot.codeownersFilePath,
      edgeCount: persisted.edges.length,
      edges: persisted.edges,
      entityCount: persisted.entities.length,
      entities: persisted.entities,
      ownerCount: snapshot.ownerCount,
      repository: toTwinRepositorySummary(detail),
      ruleCount: snapshot.ruleCount,
      syncRun: finishedRun,
    });
  } catch (error) {
    await finishOwnershipRun({
      errorSummary: toErrorSummary(error),
      now: input.now,
      repository: input.repository,
      run,
      status: "failed",
      stats: buildOwnershipSyncStats(snapshot, 0, 0),
    });
    throw error;
  }
}

async function extractOwnershipSnapshot(input: {
  ownershipTargets: ReturnType<typeof readOwnershipTargets>;
  repoRoot: string;
  repository: GitHubRepositorySummary;
}): Promise<OwnershipSnapshot> {
  const targetCounts = summarizeOwnershipTargets(input.ownershipTargets);
  const discovered = await discoverCodeownersFile(input.repoRoot);

  if (!discovered) {
    return {
      codeownersFilePath: null,
      directoryTargetCount: targetCounts.directoryCount,
      edges: [],
      entities: [],
      manifestTargetCount: targetCounts.manifestCount,
      ownerCount: 0,
      ownedDirectoryCount: 0,
      ownedManifestCount: 0,
      ruleCount: 0,
    };
  }

  const parsed = parseCodeownersFile({
    content: discovered.content,
    sourceFilePath: discovered.path,
  });
  const matchableRules = parsed.rules.map((rule) =>
    buildMatchableOwnershipRule(discovered.path, rule),
  );
  const effectiveMatches = matchOwnershipTargets({
    rules: matchableRules,
    targets: input.ownershipTargets,
  });

  return {
    codeownersFilePath: discovered.path,
    directoryTargetCount: targetCounts.directoryCount,
    edges: [
      ...buildOwnershipEdges(discovered.path, parsed.rules),
      ...buildEffectiveOwnershipEdges(effectiveMatches),
    ],
    entities: [
      buildRepositoryEntityDraft(input.repository),
      {
        kind: "codeowners_file",
        payload: {
          path: discovered.path,
          precedenceSlot: discovered.precedenceSlot,
          lineCount: discovered.lineCount,
          sizeBytes: discovered.sizeBytes,
          ruleCount: parsed.rules.length,
          ownerCount: parsed.owners.length,
          skippedBlankOrCommentLineCount: parsed.skippedBlankOrCommentLineCount,
          skippedMalformedLineCount: parsed.skippedMalformedLineCount,
        },
        stableKey: discovered.path,
        summary: "Effective CODEOWNERS file discovered by GitHub precedence.",
        title: discovered.path,
      },
      ...parsed.rules.map((rule) => buildOwnershipRuleEntityDraft(discovered.path, rule)),
      ...parsed.owners.map(buildOwnerPrincipalEntityDraft),
    ],
    manifestTargetCount: targetCounts.manifestCount,
    ownerCount: parsed.owners.length,
    ownedDirectoryCount: effectiveMatches.filter(
      (match) => match.targetKind === "workspace_directory",
    ).length,
    ownedManifestCount: effectiveMatches.filter(
      (match) => match.targetKind === "package_manifest",
    ).length,
    ruleCount: parsed.rules.length,
  };
}

function buildOwnershipEdges(
  codeownersPath: string,
  rules: ParsedCodeownersRule[],
): OwnershipEdgeDraft[] {
  return [
    {
      fromKind: "repository",
      fromStableKey: "repository",
      kind: "repository_has_codeowners",
      payload: {
        path: codeownersPath,
      },
      toKind: "codeowners_file",
      toStableKey: codeownersPath,
    },
    ...rules.map<OwnershipEdgeDraft>((rule) => ({
      fromKind: "codeowners_file",
      fromStableKey: codeownersPath,
      kind: "codeowners_file_defines_rule",
      payload: {
        ordinal: rule.ordinal,
        sourceFilePath: codeownersPath,
      },
      toKind: "ownership_rule",
      toStableKey: buildOwnershipRuleStableKey(codeownersPath, rule.ordinal),
    })),
    ...rules.flatMap((rule) =>
      rule.normalizedOwners.map<OwnershipEdgeDraft>((ownerHandle) => ({
        fromKind: "ownership_rule",
        fromStableKey: buildOwnershipRuleStableKey(codeownersPath, rule.ordinal),
        kind: "rule_assigns_owner",
        payload: {
          ordinal: rule.ordinal,
          sourceFilePath: codeownersPath,
        },
        toKind: "owner_principal",
        toStableKey: ownerHandle,
      })),
    ),
  ];
}

function buildEffectiveOwnershipEdges(matches: ReturnType<typeof matchOwnershipTargets>) {
  return matches.map<OwnershipEdgeDraft>((match) => ({
    fromKind: "ownership_rule",
    fromStableKey: match.ruleStableKey,
    kind:
      match.targetKind === "workspace_directory"
        ? "rule_owns_directory"
        : "rule_owns_manifest",
    payload: {
      sourceFilePath: match.sourceFilePath,
      ordinal: match.ordinal,
      rawPattern: match.rawPattern,
      normalizedOwners: match.normalizedOwners,
      targetPath: match.targetPath,
      targetKind: match.targetKind,
    },
    toKind: match.targetKind,
    toStableKey: match.targetStableKey,
  }));
}

function buildOwnershipRuleEntityDraft(
  codeownersPath: string,
  rule: ParsedCodeownersRule,
): OwnershipEntityDraft {
  return {
    kind: "ownership_rule",
    payload: {
      sourceFilePath: rule.sourceFilePath,
      ordinal: rule.ordinal,
      lineNumber: rule.lineNumber,
      rawPattern: rule.rawPattern,
      rawOwners: rule.rawOwners,
      normalizedOwners: rule.normalizedOwners,
      patternShape: rule.patternShape,
      commentAndBlankLinesIgnored: true,
    },
    stableKey: buildOwnershipRuleStableKey(codeownersPath, rule.ordinal),
    summary: "Parsed durable CODEOWNERS assignment rule.",
    title: `${rule.rawPattern} (#${rule.ordinal})`,
  };
}

function buildOwnerPrincipalEntityDraft(
  owner: ParsedOwnerPrincipal,
): OwnershipEntityDraft {
  return {
    kind: "owner_principal",
    payload: {
      handle: owner.handle,
      principalKind: owner.principalKind,
    },
    stableKey: owner.handle,
    summary: "Normalized owner principal extracted from CODEOWNERS.",
    title: owner.handle,
  };
}

function buildOwnershipRuleStableKey(codeownersPath: string, ordinal: number) {
  return `${codeownersPath}#${ordinal.toString().padStart(4, "0")}`;
}

function buildMatchableOwnershipRule(
  codeownersPath: string,
  rule: ParsedCodeownersRule,
): MatchableOwnershipRule {
  return {
    stableKey: buildOwnershipRuleStableKey(codeownersPath, rule.ordinal),
    sourceFilePath: rule.sourceFilePath,
    ordinal: rule.ordinal,
    rawPattern: rule.rawPattern,
    normalizedOwners: rule.normalizedOwners,
    patternShape: rule.patternShape,
  };
}

function buildRepositoryEntityDraft(
  repository: GitHubRepositorySummary,
): OwnershipEntityDraft {
  return {
    kind: "repository",
    payload: {
      archived: repository.archived,
      defaultBranch: repository.defaultBranch,
      disabled: repository.disabled,
      fullName: repository.fullName,
      isActive: repository.isActive,
      visibility: repository.visibility,
    },
    stableKey: "repository",
    summary: "Synced repository registry metadata.",
    title: repository.fullName,
  };
}

async function finishOwnershipRun(input: {
  errorSummary: string | null;
  now: () => Date;
  repository: TwinRepository;
  run: TwinSyncRunRecord;
  stats: Record<string, number>;
  status: "failed" | "succeeded";
}) {
  return input.repository.finishSyncRun({
    runId: input.run.id,
    status: input.status,
    completedAt: input.now().toISOString(),
    errorSummary: input.errorSummary,
    stats: input.stats,
  });
}

async function persistOwnershipSnapshot(input: {
  existingEntities: TwinEntityRecord[];
  observedAt: string;
  repoFullName: string;
  repository: TwinRepository;
  runId: string;
  snapshot: OwnershipSnapshot;
}) {
  return input.repository.transaction(async (session) => {
    const entityIdByKey = new Map<string, string>();
    const entities: TwinEntityRecord[] = [];
    const edges: TwinEdgeRecord[] = [];

    for (const entity of input.existingEntities) {
      entityIdByKey.set(
        buildEntityLookupKey({
          kind: entity.kind,
          stableKey: entity.stableKey,
        }),
        entity.id,
      );
    }

    for (const entityDraft of input.snapshot.entities) {
      const entity = await input.repository.upsertEntity(
        {
          repoFullName: input.repoFullName,
          kind: entityDraft.kind,
          stableKey: entityDraft.stableKey,
          title: entityDraft.title,
          summary: entityDraft.summary,
          payload: entityDraft.payload,
          observedAt: input.observedAt,
          sourceRunId: input.runId,
        },
        session,
      );

      entityIdByKey.set(buildEntityLookupKey(entityDraft), entity.id);
      entities.push(entity);
    }

    for (const edgeDraft of input.snapshot.edges) {
      const edge = await input.repository.upsertEdge(
        {
          repoFullName: input.repoFullName,
          kind: edgeDraft.kind,
          fromEntityId: getRequiredEntityId(entityIdByKey, {
            kind: edgeDraft.fromKind,
            stableKey: edgeDraft.fromStableKey,
          }),
          toEntityId: getRequiredEntityId(entityIdByKey, {
            kind: edgeDraft.toKind,
            stableKey: edgeDraft.toStableKey,
          }),
          payload: edgeDraft.payload,
          observedAt: input.observedAt,
          sourceRunId: input.runId,
        },
        session,
      );

      edges.push(edge);
    }

    return {
      edges,
      entities,
    };
  });
}

async function startOwnershipRun(input: {
  now: () => Date;
  repoFullName: string;
  repository: TwinRepository;
  repositoryRegistry: TwinRepositoryRegistryPort;
}) {
  await input.repositoryRegistry.resolveWritableRepository(input.repoFullName);

  return input.repository.startSyncRun({
    repoFullName: input.repoFullName,
    extractor: ownershipExtractorName,
    startedAt: input.now().toISOString(),
    stats: {},
  });
}

function buildEntityLookupKey(
  input: Pick<OwnershipEntityDraft, "kind" | "stableKey">,
) {
  return `${input.kind}::${input.stableKey}`;
}

function buildOwnershipSyncStats(
  snapshot: OwnershipSnapshot | null,
  entityCount: number,
  edgeCount: number,
) {
  return {
    entityCount,
    edgeCount,
    codeownersFileCount: snapshot?.codeownersFilePath ? 1 : 0,
    ruleCount: snapshot?.ruleCount ?? 0,
    ownerCount: snapshot?.ownerCount ?? 0,
    directoryTargetCount: snapshot?.directoryTargetCount ?? 0,
    manifestTargetCount: snapshot?.manifestTargetCount ?? 0,
    ownedDirectoryCount: snapshot?.ownedDirectoryCount ?? 0,
    ownedManifestCount: snapshot?.ownedManifestCount ?? 0,
    unownedDirectoryCount:
      (snapshot?.directoryTargetCount ?? 0) - (snapshot?.ownedDirectoryCount ?? 0),
    unownedManifestCount:
      (snapshot?.manifestTargetCount ?? 0) - (snapshot?.ownedManifestCount ?? 0),
  };
}

function summarizeOwnershipTargets(
  ownershipTargets: ReturnType<typeof readOwnershipTargets>,
) {
  return {
    directoryCount: ownershipTargets.filter(
      (target) => target.kind === "workspace_directory",
    ).length,
    manifestCount: ownershipTargets.filter(
      (target) => target.kind === "package_manifest",
    ).length,
  };
}

function getRequiredEntityId(
  entityIdByKey: Map<string, string>,
  input: Pick<OwnershipEntityDraft, "kind" | "stableKey">,
) {
  const entityId = entityIdByKey.get(buildEntityLookupKey(input));

  if (!entityId) {
    throw new Error(
      `Twin ownership entity ${input.kind}:${input.stableKey} was not persisted`,
    );
  }

  return entityId;
}

function toErrorSummary(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
