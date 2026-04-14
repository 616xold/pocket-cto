import type { CfoWikiPageKey } from "@pocket-cto/domain";
import type {
  PersistCfoWikiPageInput,
  PersistCfoWikiPageLinkInput,
  PersistCfoWikiPageRefInput,
} from "../repository";
import { buildWikiPageLinks } from "./links";
import {
  buildWikiPageRegistry,
  type WikiCompileState,
  type WikiRegistryEntry,
} from "./page-registry";
import { buildWikiPageRefs } from "./refs";
import { renderWikiPages } from "./render";

export type CompiledCfoWikiFoundation = {
  freshnessSummary: WikiCompileState["overallFreshnessSummary"];
  limitations: string[];
  links: PersistCfoWikiPageLinkInput[];
  pageKeys: CfoWikiPageKey[];
  pages: PersistCfoWikiPageInput[];
  refs: PersistCfoWikiPageRefInput[];
  registry: WikiRegistryEntry[];
  stats: Record<string, unknown>;
};

export function compileCfoWikiPages(input: {
  compiledAt: string;
  currentRun: {
    id: string;
    startedAt: string;
    triggeredBy: string;
  };
  state: WikiCompileState;
}): CompiledCfoWikiFoundation {
  const registry = buildWikiPageRegistry(
    input.state.company,
    input.state.reportingPeriods,
    input.state.compiledDocumentSources,
  );
  const links = buildWikiPageLinks({ registry });
  const refs = buildWikiPageRefs({
    registry,
    state: input.state,
  });
  const stats = buildCompileStats({
    links,
    refs,
    registry,
    state: input.state,
  });
  const pages = renderWikiPages({
    compiledAt: input.compiledAt,
    currentRun: {
      completedAt: input.compiledAt,
      id: input.currentRun.id,
      startedAt: input.currentRun.startedAt,
      stats,
      triggeredBy: input.currentRun.triggeredBy,
    },
    backlinksByPageKey: groupBacklinksByPageKey(links),
    linksByPageKey: groupLinksByFromPageKey(links),
    refsByPageKey: groupRefsByPageKey(refs),
    registry,
    state: input.state,
  });

  return {
    freshnessSummary: input.state.overallFreshnessSummary,
    limitations: input.state.generalLimitations,
    links,
    pageKeys: registry.map((entry) => entry.pageKey),
    pages,
    refs,
    registry,
    stats,
  };
}

function buildCompileStats(input: {
  links: PersistCfoWikiPageLinkInput[];
  refs: PersistCfoWikiPageRefInput[];
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  return {
    attemptedSliceCount: input.state.slices.filter(
      (slice) => slice.latestAttemptedRun !== null,
    ).length,
    boundDocumentSourceCount: input.state.compiledDocumentSources.length,
    conceptPageCount: input.registry.filter((entry) => entry.pageKind === "concept")
      .length,
    extractedDocumentCount: countDocumentExtracts(
      input.state.compiledDocumentSources,
      "extracted",
    ),
    failedSliceCount: input.state.slices.filter(
      (slice) => slice.latestAttemptedRun?.status === "failed",
    ).length,
    failedDocumentCount: countDocumentExtracts(
      input.state.compiledDocumentSources,
      "failed",
    ),
    linkCount: input.links.length,
    metricDefinitionPageCount: input.registry.filter(
      (entry) => entry.pageKind === "metric_definition",
    ).length,
    pageCount: input.registry.length,
    policyPageCount: input.registry.filter((entry) => entry.pageKind === "policy")
      .length,
    refCount: input.refs.length,
    reportingPeriodCount: input.state.reportingPeriods.length,
    sourceDigestPageCount: input.registry.filter(
      (entry) => entry.pageKind === "source_digest",
    ).length,
    successfulSliceCount: input.state.slices.filter(
      (slice) => slice.latestSuccessfulRun !== null,
    ).length,
    unsupportedDocumentCount: countDocumentExtracts(
      input.state.compiledDocumentSources,
      "unsupported",
    ),
  } satisfies Record<string, unknown>;
}

function groupLinksByFromPageKey(values: PersistCfoWikiPageLinkInput[]) {
  const grouped = new Map<CfoWikiPageKey, PersistCfoWikiPageLinkInput[]>();

  for (const value of values) {
    const pageKey = value.fromPageKey;
    const current = grouped.get(pageKey);

    if (current) {
      current.push(value);
      continue;
    }

    grouped.set(pageKey, [value]);
  }

  return grouped;
}

function groupRefsByPageKey(values: PersistCfoWikiPageRefInput[]) {
  const grouped = new Map<CfoWikiPageKey, PersistCfoWikiPageRefInput[]>();

  for (const value of values) {
    const pageKey = value.pageKey;
    const current = grouped.get(pageKey);

    if (current) {
      current.push(value);
      continue;
    }

    grouped.set(pageKey, [value]);
  }

  return grouped;
}

function groupBacklinksByPageKey(values: PersistCfoWikiPageLinkInput[]) {
  const grouped = new Map<CfoWikiPageKey, PersistCfoWikiPageLinkInput[]>();

  for (const value of values) {
    const pageKey = value.toPageKey;
    const current = grouped.get(pageKey);

    if (current) {
      current.push(value);
      continue;
    }

    grouped.set(pageKey, [value]);
  }

  return grouped;
}

function countDocumentExtracts(
  documentSources: WikiCompileState["compiledDocumentSources"],
  status: "extracted" | "failed" | "unsupported",
) {
  return documentSources.reduce(
    (count, documentSource) =>
      count +
      documentSource.snapshots.filter(
        (snapshot) => snapshot.extract.extractStatus === status,
      ).length,
    0,
  );
}

export const compileCfoWikiFoundation = compileCfoWikiPages;
