import { dirname, posix } from "node:path";
import {
  buildCfoWikiMarkdownPath,
  type CfoWikiFreshnessSummary,
  type CfoWikiPageKey,
  type FinanceTwinExtractorKey,
} from "@pocket-cto/domain";
import type { WikiDocumentSourceState } from "./document-state";
import type { WikiCompileState, WikiRegistryEntry } from "./page-registry";
import { buildSourceDigestLimitations } from "./source-digest-render";

export function buildKnowledgePageSummary(
  entry: WikiRegistryEntry,
  state: WikiCompileState,
) {
  if (entry.pageKind === "concept" && entry.conceptDefinition) {
    return `${entry.conceptDefinition.title} is a deterministic Pocket CFO concept hub linking the currently supported metric definitions, policy pages, source digests, and foundation pages for ${state.company.displayName}.`;
  }

  if (entry.pageKind === "metric_definition" && entry.metricDefinition) {
    return `${entry.metricDefinition.title} is the current Pocket CFO metric-definition page for a route-backed measure family, grounded only in stored Finance Twin and wiki state.`;
  }

  if (entry.pageKind === "policy" && entry.documentSource) {
    const latestSnapshot = entry.documentSnapshot;

    if (!latestSnapshot) {
      return `Current policy-level compiled view for ${entry.documentSource.source.name}; no bound snapshot is stored yet, so the page keeps the coverage gap explicit.`;
    }

    if (latestSnapshot.extract.extractStatus === "extracted") {
      return `Current policy-level compiled view for ${entry.documentSource.source.name}, using the latest bound deterministic extract and source-digest history without freeform synthesis.`;
    }

    return `Current policy-level compiled gap page for ${entry.documentSource.source.name}; the latest bound policy snapshot is ${latestSnapshot.extract.extractStatus} and stays visible instead of being summarized heuristically.`;
  }

  return null;
}

export function buildKnowledgePageFreshnessSummary(
  entry: WikiRegistryEntry,
  state: WikiCompileState,
): CfoWikiFreshnessSummary | null {
  if (entry.pageKind === "concept" && entry.conceptDefinition) {
    const sliceStates = getRelevantSlices(
      state,
      entry.conceptDefinition.extractorKeys,
    ).map((slice) => ({
      label: slice.descriptor.label,
      state: toWikiFreshnessState(slice.freshness.state),
    }));
    const policyStates = entry.conceptDefinition.includeAllPolicyPages
      ? listPolicyDocumentSources(state).map((documentSource) => ({
          label: documentSource.source.name,
          state: buildPolicyFreshnessState(documentSource),
        }))
      : [];
    const states = [...sliceStates, ...policyStates];

    if (states.length === 0) {
      return {
        state: "missing",
        summary: entry.conceptDefinition.missingCoverageNote,
      };
    }

    return {
      state: mergeFreshnessStates(states.map((value) => value.state)),
      summary: states
        .map((value) => `${value.label}: ${value.state}`)
        .join("; "),
    };
  }

  if (entry.pageKind === "metric_definition" && entry.metricDefinition) {
    const slices = getRelevantSlices(state, entry.metricDefinition.extractorKeys);

    if (slices.length === 0) {
      return {
        state: "missing",
        summary: `No supported Finance Twin slice currently matches ${entry.metricDefinition.title.toLowerCase()} for this company.`,
      };
    }

    return {
      state: mergeFreshnessStates(
        slices.map((slice) => toWikiFreshnessState(slice.freshness.state)),
      ),
      summary: slices
        .map((slice) => `${slice.descriptor.label}: ${slice.freshness.state}`)
        .join("; "),
    };
  }

  if (entry.pageKind === "policy" && entry.documentSource) {
    const latestSnapshot = entry.documentSnapshot;

    if (!latestSnapshot) {
      return {
        state: "missing",
        summary: `${entry.documentSource.source.name} has a bound \`policy_document\` source but no stored snapshot yet.`,
      };
    }

    if (latestSnapshot.extract.extractStatus === "failed") {
      return {
        state: "failed",
        summary: `${entry.documentSource.source.name} latest bound policy snapshot failed deterministic extraction.`,
      };
    }

    if (latestSnapshot.extract.extractStatus === "unsupported") {
      return {
        state: "missing",
        summary: `${entry.documentSource.source.name} latest bound policy snapshot is unsupported for deterministic extraction in the current wiki compiler.`,
      };
    }

    return {
      state: "fresh",
      summary: `${entry.documentSource.source.name} latest bound policy snapshot was extracted deterministically and is the current policy page source.`,
    };
  }

  return null;
}

export function buildKnowledgePageLimitations(
  entry: WikiRegistryEntry,
  state: WikiCompileState,
) {
  if (entry.pageKind === "concept" && entry.conceptDefinition) {
    const limitations = [...entry.conceptDefinition.limitations];
    const relevantSlices = getRelevantSlices(
      state,
      entry.conceptDefinition.extractorKeys,
    );

    if (
      relevantSlices.length === 0 &&
      !entry.conceptDefinition.includeAllPolicyPages
    ) {
      limitations.push(entry.conceptDefinition.missingCoverageNote);
    }

    if (entry.conceptDefinition.includeAllPolicyPages) {
      const policySources = listPolicyDocumentSources(state);

      if (policySources.length === 0) {
        limitations.push(entry.conceptDefinition.missingCoverageNote);
      }
    } else {
      limitations.push(
        "Policy linkage is intentionally narrow in F3D; this concept does not infer policy relevance beyond explicit compiler-owned mappings.",
      );
    }

    return [...new Set(limitations)];
  }

  if (entry.pageKind === "metric_definition" && entry.metricDefinition) {
    const limitations = [...entry.metricDefinition.limitations];
    const relevantSlices = getRelevantSlices(
      state,
      entry.metricDefinition.extractorKeys,
    );

    if (relevantSlices.length === 0) {
      limitations.push(
        `No supported Finance Twin slice currently matches ${entry.metricDefinition.title.toLowerCase()} for this company.`,
      );
    }

    limitations.push(...entry.metricDefinition.nonGoals);

    return [...new Set(limitations)];
  }

  if (entry.pageKind === "policy" && entry.documentSource) {
    const limitations = [
      "Policy pages are compiler-owned current views over explicit `policy_document` bindings; they do not replace raw source evidence or source-digest history.",
      "Policy pages do not infer legal conclusions, control conclusions, approvals, or obligations from weak document signals.",
    ];
    const latestSnapshot = entry.documentSnapshot;

    if (!latestSnapshot) {
      limitations.push(
        "No stored snapshot is linked to this bound policy source yet, so the page can only expose the missing coverage gap.",
      );
    } else {
      limitations.push(
        "Superseded snapshot detail remains reviewable on source digest pages rather than being copied wholesale into the current policy page.",
      );
      limitations.push(
        ...buildSourceDigestLimitations({
          documentSource: entry.documentSource,
          snapshotState: latestSnapshot,
        }),
      );
    }

    return [...new Set(limitations)];
  }

  return [];
}

export function renderKnowledgePageSections(input: {
  entry: WikiRegistryEntry;
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  if (input.entry.pageKind === "concept" && input.entry.conceptDefinition) {
    return renderConceptSections(input);
  }

  if (
    input.entry.pageKind === "metric_definition" &&
    input.entry.metricDefinition
  ) {
    return renderMetricDefinitionSections(input);
  }

  if (input.entry.pageKind === "policy" && input.entry.documentSource) {
    return renderPolicySections(input);
  }

  return null;
}

function renderConceptSections(input: {
  entry: WikiRegistryEntry;
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  const definition = input.entry.conceptDefinition!;
  const foundationPages = resolveRegistryPages(
    input.registry,
    definition.foundationPageKeys,
  );
  const metricPages = definition.relatedMetricKeys
    .map((metricKey) =>
      input.registry.find(
        (entry) => entry.metricDefinition?.metricKey === metricKey,
      ),
    )
    .filter((entry): entry is WikiRegistryEntry => entry !== undefined);
  const policyPages = definition.includeAllPolicyPages
    ? input.registry.filter((entry) => entry.pageKind === "policy")
    : [];
  const sourceDigestPages = definition.includePolicySourceDigests
    ? listPolicySourceDigestPages(input.registry)
    : [];
  const gaps: string[] = [];

  if (metricPages.length === 0) {
    gaps.push("No related metric-definition pages are currently registered.");
  }

  if (policyPages.length === 0) {
    gaps.push(
      definition.includeAllPolicyPages
        ? definition.missingCoverageNote
        : "No policy pages are explicitly mapped to this concept in F3D.",
    );
  }

  if (sourceDigestPages.length === 0) {
    gaps.push(
      definition.includePolicySourceDigests
        ? "No policy source digest pages are currently available for this company."
        : "No source digest pages are explicitly mapped to this concept in F3D.",
    );
  }

  return [
    "## Concept Scope",
    definition.scope,
    "",
    "## Related Metric Definitions",
    ...renderRegistryPageList(input.entry.pageKey, metricPages, "No related metric-definition pages are currently compiled."),
    "",
    "## Related Policy Pages",
    ...renderRegistryPageList(input.entry.pageKey, policyPages, "No related policy pages are currently compiled."),
    "",
    "## Related Source Digests",
    ...renderRegistryPageList(input.entry.pageKey, sourceDigestPages, "No related source digest pages are currently compiled."),
    "",
    "## Foundation Pages",
    ...renderRegistryPageList(input.entry.pageKey, foundationPages, "No related foundation pages are currently available."),
    "",
    "## Coverage Gaps",
    ...renderBullets(gaps.length > 0 ? gaps : ["No additional concept-specific gaps are currently recorded."]),
  ];
}

function renderMetricDefinitionSections(input: {
  entry: WikiRegistryEntry;
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  const definition = input.entry.metricDefinition!;
  const relevantSlices = getRelevantSlices(input.state, definition.extractorKeys);
  const conceptPages = definition.relatedConceptKeys
    .map((conceptKey) =>
      input.registry.find(
        (entry) => entry.conceptDefinition?.conceptKey === conceptKey,
      ),
    )
    .filter((entry): entry is WikiRegistryEntry => entry !== undefined);
  const foundationPages = resolveRegistryPages(
    input.registry,
    definition.foundationPageKeys,
  );
  const periodPages = relevantSlices
    .flatMap((slice) =>
      slice.reportingPeriod
        ? input.registry.find(
            (entry) => entry.period?.id === slice.reportingPeriod?.id,
          ) ?? []
        : [],
    )
    .filter((entry, index, values) => values.indexOf(entry) === index);

  return [
    "## Metric Definition Scope",
    definition.measureMeaning,
    "",
    "## Supported Stored State",
    `- Route-backed read: \`${definition.routePath}\``,
    `- Support posture: ${definition.supportSummary}`,
    ...renderBullets(
      relevantSlices.length > 0
        ? relevantSlices.map(
            (slice) =>
              `${slice.descriptor.label}: ${slice.freshness.state}${slice.reportingPeriod ? `; latest reporting period ${slice.reportingPeriod.periodKey}` : ""}`,
          )
        : ["No supported Finance Twin slice currently matches this metric family."],
    ),
    "",
    "## Freshness Rules",
    ...renderBullets(definition.freshnessRules),
    "",
    "## Related Concept Pages",
    ...renderRegistryPageList(input.entry.pageKey, conceptPages, "No related concept pages are currently compiled."),
    "",
    "## Related Operational Pages",
    ...renderRegistryPageList(
      input.entry.pageKey,
      [...foundationPages, ...periodPages],
      "No related operational wiki pages are currently available.",
    ),
    "",
    "## Non-goals",
    ...renderBullets(definition.nonGoals),
  ];
}

function renderPolicySections(input: {
  entry: WikiRegistryEntry;
  registry: WikiRegistryEntry[];
  state: WikiCompileState;
}) {
  const documentSource = input.entry.documentSource!;
  const latestSnapshot = input.entry.documentSnapshot;
  const sourceDigestPages = input.registry.filter(
    (entry) =>
      entry.pageKind === "source_digest" &&
      entry.documentSource?.source.id === documentSource.source.id,
  );

  if (!latestSnapshot) {
    return [
      "## Policy Source",
      `- Source name: ${documentSource.source.name}`,
      `- Source id: \`${documentSource.source.id}\``,
      "- Latest bound snapshot version: none stored",
      "- Latest bound snapshot captured at: none stored",
      "- Document role: `policy_document`",
      "- Extraction support status: `missing`",
      "",
      "## Policy Gap",
      "- No stored snapshot is linked to this bound policy source yet.",
      "",
      "## Related Policy History",
      ...renderRegistryPageList(input.entry.pageKey, sourceDigestPages, "No source digest pages are currently available for this policy source."),
    ];
  }

  const policySourceSection = [
    "## Policy Source",
    `- Source name: ${documentSource.source.name}`,
    `- Source id: \`${documentSource.source.id}\``,
    `- Latest bound snapshot version: ${latestSnapshot.snapshot.version}`,
    `- Latest bound snapshot captured at: ${latestSnapshot.snapshot.capturedAt}`,
    "- Document role: `policy_document`",
    `- Extraction support status: \`${latestSnapshot.extract.extractStatus}\``,
    latestSnapshot.sourceFile
      ? `- Raw file: ${latestSnapshot.sourceFile.originalFileName} (\`${latestSnapshot.sourceFile.mediaType}\`)`
      : "- Raw file: none linked to this snapshot",
  ];

  if (latestSnapshot.extract.extractStatus !== "extracted") {
    const gapDetails = [
      latestSnapshot.extract.errorSummary,
      ...latestSnapshot.extract.warnings,
    ].filter((value): value is string => value !== null && value.length > 0);

    return [
      ...policySourceSection,
      "",
      "## Policy Gap",
      `- The latest bound policy snapshot remains a visible compiler-owned gap because extraction is \`${latestSnapshot.extract.extractStatus}\`.`,
      ...renderBullets(
        gapDetails.length > 0
          ? gapDetails
          : [
              "No deterministic policy extract content is available for the latest bound snapshot.",
            ],
      ),
      "",
      "## Related Policy History",
      ...renderRegistryPageList(input.entry.pageKey, sourceDigestPages, "No source digest pages are currently available for this policy source."),
    ];
  }

  return [
    ...policySourceSection,
    "",
    "## Deterministic Policy Extract",
    `- Title: ${latestSnapshot.extract.title ?? documentSource.source.name}`,
    `- Parser version: \`${latestSnapshot.extract.parserVersion}\``,
    `- Extracted at: ${latestSnapshot.extract.extractedAt}`,
    "",
    "## Heading Outline",
    ...renderBullets(
      latestSnapshot.extract.headingOutline.length > 0
        ? latestSnapshot.extract.headingOutline.map(
            (heading) => `H${heading.depth}: ${heading.text}`,
          )
        : [
            latestSnapshot.extract.extractStatus === "extracted"
              ? "No heading outline was persisted for the latest policy snapshot."
              : "No heading outline is available because the latest policy snapshot is not extracted.",
          ],
    ),
    "",
    "## Excerpt Blocks",
    ...renderBullets(
      latestSnapshot.extract.excerptBlocks.length > 0
        ? latestSnapshot.extract.excerptBlocks.map((block) =>
            block.heading ? `${block.heading}: ${block.text}` : block.text,
          )
        : [
            latestSnapshot.extract.errorSummary ??
              latestSnapshot.extract.warnings[0] ??
              "No excerpt blocks are available for the latest policy snapshot.",
          ],
    ),
    "",
    "## Related Policy History",
    ...renderRegistryPageList(input.entry.pageKey, sourceDigestPages, "No source digest pages are currently available for this policy source."),
  ];
}

function listPolicyDocumentSources(state: WikiCompileState) {
  return state.compiledDocumentSources.filter(
    (documentSource) => documentSource.binding.documentRole === "policy_document",
  );
}

function listPolicySourceDigestPages(registry: WikiRegistryEntry[]) {
  return registry.filter(
    (entry) =>
      entry.pageKind === "source_digest" &&
      entry.documentSource?.binding.documentRole === "policy_document",
  );
}

function getRelevantSlices(
  state: WikiCompileState,
  extractorKeys: FinanceTwinExtractorKey[],
) {
  return state.slices.filter((slice) =>
    extractorKeys.includes(slice.descriptor.extractorKey),
  );
}

function resolveRegistryPages(
  registry: WikiRegistryEntry[],
  pageKeys: readonly CfoWikiPageKey[],
) {
  return pageKeys
    .map((pageKey) =>
      registry.find((entry) => entry.pageKey === pageKey) ?? null,
    )
    .filter((entry): entry is WikiRegistryEntry => entry !== null);
}

function renderRegistryPageList(
  fromPageKey: CfoWikiPageKey,
  entries: WikiRegistryEntry[],
  emptyMessage: string,
) {
  if (entries.length === 0) {
    return [`- ${emptyMessage}`];
  }

  return entries.map(
    (entry) =>
      `- [${entry.title}](${buildRelativeMarkdownPath(fromPageKey, entry.pageKey)}) (\`${buildCfoWikiMarkdownPath(entry.pageKey)}\`)`,
  );
}

function renderBullets(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`) : ["- None recorded."];
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

function mergeFreshnessStates(
  states: CfoWikiFreshnessSummary["state"][],
): CfoWikiFreshnessSummary["state"] {
  const distinctStates = [...new Set(states)];

  if (distinctStates.length === 0) {
    return "missing";
  }

  if (distinctStates.length === 1) {
    return distinctStates[0]!;
  }

  return "mixed";
}

function buildPolicyFreshnessState(
  documentSource: WikiDocumentSourceState,
): CfoWikiFreshnessSummary["state"] {
  const latestSnapshot = documentSource.snapshots[0];

  if (!latestSnapshot) {
    return "missing";
  }

  if (latestSnapshot.extract.extractStatus === "failed") {
    return "failed";
  }

  if (latestSnapshot.extract.extractStatus === "unsupported") {
    return "missing";
  }

  return "fresh";
}

function toWikiFreshnessState(
  state: WikiCompileState["slices"][number]["freshness"]["state"],
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
