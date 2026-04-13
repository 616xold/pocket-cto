import { dirname, posix } from "node:path";
import {
  buildCfoWikiMarkdownPath,
  type CfoWikiFreshnessSummary,
  type CfoWikiPageKey,
} from "@pocket-cto/domain";
import type {
  PersistCfoWikiPageInput,
  PersistCfoWikiPageLinkInput,
  PersistCfoWikiPageRefInput,
} from "../repository";
import type { WikiCompileState, WikiRegistryEntry, WikiSliceState } from "./page-registry";

type RenderCurrentRun = {
  completedAt: string;
  id: string;
  startedAt: string;
  stats: Record<string, unknown>;
  triggeredBy: string;
};

export function renderWikiPages(input: {
  compiledAt: string;
  currentRun: RenderCurrentRun;
  linksByPageKey: Map<CfoWikiPageKey, PersistCfoWikiPageLinkInput[]>;
  refsByPageKey: Map<CfoWikiPageKey, PersistCfoWikiPageRefInput[]>;
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  const registryByKey = new Map(
    input.registry.map((entry) => [entry.pageKey, entry] as const),
  );

  return input.registry.map((entry) => {
    const refs = input.refsByPageKey.get(entry.pageKey) ?? [];
    const links = input.linksByPageKey.get(entry.pageKey) ?? [];
    const freshnessSummary = buildPageFreshnessSummary(entry, input.state);
    const limitations = buildPageLimitations(entry, input.state);
    const summary = buildPageSummary(entry, input.state);

    return {
      pageKey: entry.pageKey,
      pageKind: entry.pageKind,
      ownershipKind: "compiler_owned",
      temporalStatus: entry.temporalStatus,
      title: entry.title,
      summary,
      markdownBody: renderPageMarkdown({
        currentRun: input.currentRun,
        entry,
        freshnessSummary,
        limitations,
        links,
        refs,
        registry: input.registry,
        registryByKey,
        state: input.state,
      }),
      freshnessSummary,
      limitations,
      lastCompiledAt: input.compiledAt,
    } satisfies PersistCfoWikiPageInput;
  });
}

function renderPageMarkdown(input: {
  currentRun: RenderCurrentRun;
  entry: WikiRegistryEntry;
  freshnessSummary: CfoWikiFreshnessSummary;
  limitations: string[];
  links: PersistCfoWikiPageLinkInput[];
  refs: PersistCfoWikiPageRefInput[];
  registry: WikiRegistryEntry[];
  registryByKey: Map<CfoWikiPageKey, WikiRegistryEntry>;
  state: WikiCompileState;
}) {
  return compactLines([
    `# ${input.entry.title}`,
    "",
    `- Page key: \`${input.entry.pageKey}\``,
    `- Page kind: \`${input.entry.pageKind}\``,
    `- Temporal status: \`${input.entry.temporalStatus}\``,
    `- Scope: ${buildScopeLine(input.entry, input.state)}`,
    input.entry.period ? `- Reporting period: ${input.entry.period.label}` : null,
    "",
    "## Summary",
    buildPageSummary(input.entry, input.state),
    "",
    "## Freshness Posture",
    `- \`${input.freshnessSummary.state}\`: ${input.freshnessSummary.summary}`,
    "",
    "## Limitations",
    ...renderBullets(input.limitations),
    "",
    ...renderPageSpecificSection(input),
    "",
    "## Evidence",
    ...renderEvidenceSection(input.refs),
    "",
    "## Related Links",
    ...renderRelatedLinks(input.entry.pageKey, input.links, input.registryByKey),
  ]).join("\n");
}

function buildPageSummary(entry: WikiRegistryEntry, state: WikiCompileState) {
  switch (entry.pageKind) {
    case "index":
      return `Deterministic entrypoint for ${state.company.displayName} covering company overview, source coverage, compile history, and ${state.reportingPeriods.length} stored reporting period page(s).`;
    case "log":
      return `Compiler-owned compile history for ${state.company.displayName}, preserving prior completed runs while keeping the current wiki state tied to the latest successful compile.`;
    case "company_overview":
      return `Deterministic company overview compiled from stored Finance Twin totals, reporting periods, and source-linked finance slice freshness.`;
    case "source_coverage":
      return `Source-backed finance coverage derived from linked Finance Twin sync runs plus source inventory metadata, without parsing document bodies in F3A.`;
    case "period_index":
      return `Deterministic period index for ${entry.period?.label ?? "the stored period"} based only on persisted reporting-period records and linked Finance Twin coverage.`;
  }
}

function buildPageFreshnessSummary(
  entry: WikiRegistryEntry,
  state: WikiCompileState,
): CfoWikiFreshnessSummary {
  if (entry.pageKind !== "period_index" || !entry.period) {
    return state.overallFreshnessSummary;
  }

  const relevantSlices = state.slices.filter(
    (slice) => slice.reportingPeriod?.id === entry.period?.id,
  );

  if (relevantSlices.length === 0) {
    return {
      state: "missing",
      summary: `No stored finance slice currently maps to reporting period ${entry.period.periodKey}.`,
    };
  }

  const states = new Set(relevantSlices.map((slice) => slice.freshness.state));
  const pageFreshnessState =
    states.size === 1
      ? toWikiFreshnessState(relevantSlices[0]!.freshness.state)
      : ("mixed" as const);

  return {
    state: pageFreshnessState,
    summary: relevantSlices
      .map((slice) => `${slice.descriptor.pageLabel}: ${slice.freshness.state}`)
      .join("; "),
  };
}

function buildPageLimitations(entry: WikiRegistryEntry, state: WikiCompileState) {
  const limitations = [...state.generalLimitations];

  if (entry.pageKind === "index" && state.reportingPeriods.length === 0) {
    limitations.push("The page registry contains no period index pages because no reporting periods are stored yet.");
  }

  if (entry.pageKind === "log" && state.priorCompletedRuns.length === 0) {
    limitations.push("This compile establishes the first completed CFO Wiki log entry for the company.");
  }

  if (entry.pageKind === "source_coverage") {
    limitations.push(state.derivedSourceCoverageLimitation);
  }

  if (entry.pageKind === "period_index" && entry.period) {
    const hasCoverage = state.slices.some(
      (slice) => slice.reportingPeriod?.id === entry.period?.id,
    );

    if (!hasCoverage) {
      limitations.push(
        `No stored Finance Twin slice currently maps to reporting period ${entry.period.periodKey}.`,
      );
    }
  }

  return [...new Set(limitations)];
}

function renderPageSpecificSection(input: {
  currentRun: RenderCurrentRun;
  entry: WikiRegistryEntry;
  state: WikiCompileState;
  registry: WikiRegistryEntry[];
}) {
  switch (input.entry.pageKind) {
    case "index":
      return [
        "## Page Registry",
        ...input.registry.map(
          (entry) =>
            `- \`${buildCfoWikiMarkdownPath(entry.pageKey)}\` (${entry.pageKind}): ${buildPageSummary(entry, input.state)}`,
        ),
      ];
    case "log":
      return [
        "## Compile Runs",
        ...renderCompileRuns(input.currentRun, input.state.priorCompletedRuns),
      ];
    case "company_overview":
      return [
        "## Company State",
        `- Ledger accounts: ${input.state.companyTotals.ledgerAccountCount}`,
        `- Reporting periods: ${input.state.companyTotals.reportingPeriodCount}`,
        "",
        "## Finance Slice Coverage",
        ...renderSliceCoverage(input.state.slices),
      ];
    case "source_coverage":
      return [
        "## Source-Backed Coverage",
        ...renderSourceCoverage(input.state.slices),
      ];
    case "period_index":
      return [
        "## Period State",
        `- Period key: \`${input.entry.period?.periodKey ?? "unknown"}\``,
        `- Period end: ${input.entry.period?.periodEnd ?? "unknown"}`,
        "",
        "## Matching Finance Slice Coverage",
        ...renderSliceCoverage(
          input.state.slices.filter(
            (slice) => slice.reportingPeriod?.id === input.entry.period?.id,
          ),
          "No linked finance slice currently maps to this stored reporting period.",
        ),
      ];
  }
}

function renderCompileRuns(
  currentRun: RenderCurrentRun,
  priorCompletedRuns: WikiCompileState["priorCompletedRuns"],
) {
  const runs = [
    {
      ...currentRun,
      errorSummary: null,
      status: "succeeded" as const,
    },
    ...[...priorCompletedRuns].reverse(),
  ];

  return runs.map((run) => {
    const pageCount = typeof run.stats.pageCount === "number" ? run.stats.pageCount : "n/a";
    const linkCount = typeof run.stats.linkCount === "number" ? run.stats.linkCount : "n/a";
    const refCount = typeof run.stats.refCount === "number" ? run.stats.refCount : "n/a";

    return `- ${run.startedAt}: \`${run.status}\` by ${run.triggeredBy}; pages ${pageCount}, links ${linkCount}, refs ${refCount}${run.errorSummary ? `; error: ${run.errorSummary}` : ""}`;
  });
}

function renderSliceCoverage(
  slices: WikiSliceState[],
  emptyMessage = "No supported finance slice coverage is stored yet.",
) {
  if (slices.length === 0) {
    return [`- ${emptyMessage}`];
  }

  return slices.map((slice) => {
    const latestRun = slice.latestSuccessfulRun ?? slice.latestAttemptedRun;

    return `- ${slice.descriptor.label}: \`${slice.freshness.state}\`${latestRun ? `; latest run ${latestRun.status} at ${latestRun.startedAt}` : ""}${slice.reportingPeriod ? `; period ${slice.reportingPeriod.periodKey}` : ""}`;
  });
}

function renderSourceCoverage(slices: WikiSliceState[]) {
  return slices.map((slice) => {
    const successfulFile = slice.latestSuccessfulSource?.sourceFile.originalFileName;
    const attemptedFile = slice.latestAttemptedSource?.sourceFile.originalFileName;

    return `- ${slice.descriptor.label}: \`${slice.freshness.state}\`; successful file ${successfulFile ?? "none"}; latest attempted file ${attemptedFile ?? "none"}`;
  });
}

function renderEvidenceSection(refs: PersistCfoWikiPageRefInput[]) {
  const groups: Array<[PersistCfoWikiPageRefInput["refKind"], string]> = [
    ["twin_fact", "### Twin Facts"],
    ["source_excerpt", "### Source Inventory Excerpts"],
    ["compiled_inference", "### Compiled Inferences"],
    ["ambiguous", "### Ambiguities"],
  ];
  const lines: string[] = [];

  for (const [kind, heading] of groups) {
    const groupRefs = refs.filter((ref) => ref.refKind === kind);

    if (groupRefs.length === 0) {
      continue;
    }

    lines.push(heading);
    lines.push(
      ...groupRefs.map((ref) =>
        `- ${ref.label}${ref.excerpt ? `: ${ref.excerpt}` : ""}${ref.notes ? ` (${ref.notes})` : ""}`,
      ),
    );
    lines.push("");
  }

  return lines.length > 0 ? trimTrailingBlank(lines) : ["- No persisted evidence refs were generated for this page."];
}

function renderRelatedLinks(
  fromPageKey: CfoWikiPageKey,
  links: PersistCfoWikiPageLinkInput[],
  registryByKey: Map<CfoWikiPageKey, WikiRegistryEntry>,
) {
  if (links.length === 0) {
    return ["- No related links are registered for this page."];
  }

  return links.map((link) => {
    const target = registryByKey.get(link.toPageKey);
    const href = buildRelativeMarkdownPath(fromPageKey, link.toPageKey);

    return `- [${link.label}](${href})${target ? `: ${target.title}` : ""}`;
  });
}

function buildScopeLine(entry: WikiRegistryEntry, state: WikiCompileState) {
  if (entry.period) {
    return `reporting period \`${entry.period.periodKey}\` for ${state.company.displayName}`;
  }

  return `company \`${state.company.companyKey}\` for ${state.company.displayName}`;
}

function buildRelativeMarkdownPath(
  fromPageKey: CfoWikiPageKey,
  toPageKey: CfoWikiPageKey,
) {
  const fromPath = buildCfoWikiMarkdownPath(fromPageKey);
  const toPath = buildCfoWikiMarkdownPath(toPageKey);
  const relativePath = posix.relative(dirname(fromPath), toPath);

  return relativePath.length > 0 ? relativePath : "./";
}

function compactLines(lines: Array<string | null>) {
  return lines.filter((line): line is string => line !== null);
}

function renderBullets(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`) : ["- None recorded."];
}

function trimTrailingBlank(lines: string[]) {
  while (lines.at(-1) === "") {
    lines.pop();
  }

  return lines;
}

function toWikiFreshnessState(
  state: WikiSliceState["freshness"]["state"],
): CfoWikiFreshnessSummary["state"] {
  switch (state) {
    case "fresh":
      return "fresh";
    case "stale":
      return "stale";
    case "missing":
      return "missing";
    case "failed":
      return "failed";
  }
}
