import type {
  CfoWikiBoundSourceSummary,
  CfoWikiCompanySourceListView,
  CfoWikiPageKey,
  CfoWikiPageView,
  FinanceDiscoveryAnswerArtifactMetadata,
  FinanceDiscoveryEvidenceSection,
  FinanceDiscoveryFreshnessPosture,
  FinanceDiscoveryRelatedRoute,
  FinanceDiscoveryRelatedWikiPage,
  FinancePolicyLookupQuestion,
} from "@pocket-cto/domain";
import {
  FinancePolicyLookupAnswerArtifactMetadataSchema,
  buildCfoWikiConceptPageKey,
  buildCfoWikiPolicyPageKey,
  buildCfoWikiSourceDigestPageKey,
  readFreshnessLabel,
} from "@pocket-cto/domain";
import { FinanceCompanyNotFoundError } from "../finance-twin/errors";
import { CfoWikiPageNotFoundError } from "../wiki/errors";
import type { CfoWikiService } from "../wiki/service";

type PolicyLookupSourceResolution =
  | {
      status: "ok";
      source: CfoWikiBoundSourceSummary;
    }
  | {
      status: "missing";
      source: null;
    }
  | {
      status: "not_policy_document";
      source: CfoWikiBoundSourceSummary;
    };

export async function answerPolicyLookupQuestion(input: {
  cfoWikiService: Pick<CfoWikiService, "getPage" | "listCompanySources">;
  question: FinancePolicyLookupQuestion;
}): Promise<FinanceDiscoveryAnswerArtifactMetadata> {
  const sourceList = await input.cfoWikiService.listCompanySources(
    input.question.companyKey,
  );
  const sourceResolution = resolvePolicyLookupSource(
    sourceList.sources,
    input.question.policySourceId,
  );
  const boundSource = sourceResolution.source;
  const policyPageKey = buildCfoWikiPolicyPageKey(input.question.policySourceId);
  const policyCorpusPageKey = buildCfoWikiConceptPageKey("policy-corpus");
  const policyPage = await readOptionalPage(
    input.cfoWikiService,
    input.question.companyKey,
    policyPageKey,
  );
  const policyCorpusPage = await readOptionalPage(
    input.cfoWikiService,
    input.question.companyKey,
    policyCorpusPageKey,
  );
  const sourceDigestPageKey = boundSource?.latestSnapshot
    ? buildCfoWikiSourceDigestPageKey(
        boundSource.source.id,
        boundSource.latestSnapshot.version,
      )
    : null;
  const sourceDigestPage =
    sourceDigestPageKey &&
    shouldIncludeSourceDigestPage(boundSource, policyPage)
      ? await readOptionalPage(
          input.cfoWikiService,
          input.question.companyKey,
          sourceDigestPageKey,
        )
      : null;
  const freshnessPosture = buildFreshnessPosture({
    boundSource,
    policyPage,
    policyPageKey,
    question: input.question,
    sourceResolution,
  });
  const relatedRoutes = buildRelatedRoutes({
    boundSource,
    policyPage,
    policyPageKey,
    policyCorpusPage,
    policyCorpusPageKey,
    question: input.question,
    sourceDigestPage,
    sourceDigestPageKey,
    sourceResolution,
  });
  const relatedWikiPages = buildRelatedWikiPages([
    policyPage,
    sourceDigestPage,
    policyCorpusPage,
  ]);
  const missingWikiPages = [
    policyPage ? null : policyPageKey,
    policyCorpusPage ? null : policyCorpusPageKey,
    sourceDigestPageKey && !sourceDigestPage ? sourceDigestPageKey : null,
  ].filter((value): value is CfoWikiPageKey => value !== null);
  const evidenceSections = buildEvidenceSections({
    boundSource,
    policyPage,
    policyPageKey,
    policyCorpusPage,
    question: input.question,
    relatedRoutes,
    sourceDigestPage,
    sourceResolution,
  });
  const limitations = buildLimitations({
    boundSource,
    missingWikiPages,
    policyCorpusPage,
    policyPage,
    question: input.question,
    sourceDigestPage,
    sourceResolution,
  });
  const answerSummary = buildAnswerSummary({
    freshnessPosture,
    policyPage,
    question: input.question,
    sourceResolution,
  });

  return FinancePolicyLookupAnswerArtifactMetadataSchema.parse({
    source: "stored_finance_twin_and_cfo_wiki",
    summary: answerSummary,
    companyKey: input.question.companyKey,
    questionKind: input.question.questionKind,
    policySourceId: input.question.policySourceId,
    answerSummary,
    freshnessPosture,
    limitations,
    relatedRoutes,
    relatedWikiPages,
    evidenceSections,
    bodyMarkdown: buildBodyMarkdown({
      answerSummary,
      evidenceSections,
      freshnessPosture,
      limitations,
      question: input.question,
      relatedRoutes,
      relatedWikiPages,
    }),
    structuredData: {
      boundSource:
        boundSource === null
          ? null
          : {
              documentRole: boundSource.binding.documentRole,
              includeInCompile: boundSource.binding.includeInCompile,
              latestDocumentKind: boundSource.latestExtract?.documentKind ?? null,
              latestExtractErrorSummary:
                boundSource.latestExtract?.errorSummary ?? null,
              latestExtractStatus:
                boundSource.latestExtract?.extractStatus ?? null,
              latestExtractedAt: boundSource.latestExtract?.extractedAt ?? null,
              latestSnapshotId: boundSource.latestSnapshot?.id ?? null,
              latestSnapshotVersion: boundSource.latestSnapshot?.version ?? null,
              latestSourceFileId: boundSource.latestSourceFile?.id ?? null,
              sourceId: boundSource.source.id,
              sourceName: boundSource.source.name,
            },
      companyKey: input.question.companyKey,
      freshnessPosture,
      missingWikiPages,
      operatorPrompt: input.question.operatorPrompt ?? null,
      policySourceId: input.question.policySourceId,
      questionKind: input.question.questionKind,
      sourceResolution: sourceResolution.status,
      wikiPages: relatedWikiPages.map((page) => ({
        pageKey: page.pageKey,
        title: page.title,
      })),
    },
  });
}

export function resolvePolicyLookupSource(
  sources: CfoWikiCompanySourceListView["sources"],
  policySourceId: string,
): PolicyLookupSourceResolution {
  const source = sources.find((candidate) => candidate.source.id === policySourceId);

  if (!source) {
    return {
      status: "missing",
      source: null,
    };
  }

  if (source.binding.documentRole !== "policy_document") {
    return {
      status: "not_policy_document",
      source,
    };
  }

  return {
    status: "ok",
    source,
  };
}

async function readOptionalPage(
  cfoWikiService: Pick<CfoWikiService, "getPage">,
  companyKey: string,
  pageKey: CfoWikiPageKey,
) {
  try {
    return await cfoWikiService.getPage(companyKey, pageKey);
  } catch (error) {
    if (
      error instanceof CfoWikiPageNotFoundError ||
      error instanceof FinanceCompanyNotFoundError
    ) {
      return null;
    }

    throw error;
  }
}

function shouldIncludeSourceDigestPage(
  boundSource: CfoWikiBoundSourceSummary | null,
  policyPage: CfoWikiPageView | null,
) {
  if (!boundSource?.latestSnapshot) {
    return false;
  }

  return (
    boundSource.latestSnapshot.version > 1 ||
    boundSource.latestExtract?.extractStatus !== "extracted" ||
    policyPage === null
  );
}

function buildFreshnessPosture(input: {
  boundSource: CfoWikiBoundSourceSummary | null;
  policyPage: CfoWikiPageView | null;
  policyPageKey: CfoWikiPageKey;
  question: FinancePolicyLookupQuestion;
  sourceResolution: PolicyLookupSourceResolution;
}): FinanceDiscoveryFreshnessPosture {
  if (input.policyPage) {
    return {
      state: input.policyPage.freshnessSummary.state,
      reasonSummary: input.policyPage.freshnessSummary.summary,
    };
  }

  if (input.sourceResolution.status === "missing") {
    return {
      state: "missing",
      reasonSummary: `Policy source ${input.question.policySourceId} is not currently bound for ${input.question.companyKey}, so no scoped policy page could be read.`,
    };
  }

  if (input.sourceResolution.status === "not_policy_document") {
    return {
      state: "missing",
      reasonSummary: `Policy source ${input.question.policySourceId} is bound for ${input.question.companyKey}, but its document role is not \`policy_document\`.`,
    };
  }

  if (!input.boundSource?.latestSnapshot) {
    return {
      state: "missing",
      reasonSummary: `Policy source ${input.question.policySourceId} has no stored snapshot yet for ${input.question.companyKey}.`,
    };
  }

  if (!input.boundSource.latestExtract) {
    return {
      state: "missing",
      reasonSummary: `Policy source ${input.question.policySourceId} has no persisted deterministic extract for latest snapshot version ${input.boundSource.latestSnapshot.version}.`,
    };
  }

  if (input.boundSource.latestExtract.extractStatus === "failed") {
    return {
      state: "failed",
      reasonSummary:
        input.boundSource.latestExtract.errorSummary ??
        `Policy source ${input.question.policySourceId} has a failed deterministic extract for its latest snapshot.`,
    };
  }

  if (input.boundSource.latestExtract.extractStatus === "unsupported") {
    return {
      state: "missing",
      reasonSummary: `Policy source ${input.question.policySourceId} has an unsupported deterministic extract for latest snapshot version ${input.boundSource.latestSnapshot.version}.`,
    };
  }

  return {
    state: "missing",
    reasonSummary: `Compiled policy page ${input.policyPageKey} is not currently available for ${input.question.companyKey}, so the answer is limited to source binding and extract-status posture.`,
  };
}

function buildAnswerSummary(input: {
  freshnessPosture: FinanceDiscoveryFreshnessPosture;
  policyPage: CfoWikiPageView | null;
  question: FinancePolicyLookupQuestion;
  sourceResolution: PolicyLookupSourceResolution;
}) {
  if (input.policyPage) {
    return `Stored policy lookup for ${input.question.companyKey} is scoped to policy source ${input.question.policySourceId}. ${input.policyPage.page.summary}`;
  }

  if (input.sourceResolution.status === "missing") {
    return `Stored policy lookup for ${input.question.companyKey} is limited: policy source ${input.question.policySourceId} is not bound for this company, so no scoped policy page can be reviewed.`;
  }

  if (input.sourceResolution.status === "not_policy_document") {
    return `Stored policy lookup for ${input.question.companyKey} is limited: source ${input.question.policySourceId} is bound, but not as a \`policy_document\`, so this slice will not search or reinterpret other policy pages.`;
  }

  return `Stored policy lookup for ${input.question.companyKey} is limited: ${input.freshnessPosture.reasonSummary}`;
}

function buildRelatedRoutes(input: {
  boundSource: CfoWikiBoundSourceSummary | null;
  policyPage: CfoWikiPageView | null;
  policyPageKey: CfoWikiPageKey;
  policyCorpusPage: CfoWikiPageView | null;
  policyCorpusPageKey: CfoWikiPageKey;
  question: FinancePolicyLookupQuestion;
  sourceDigestPage: CfoWikiPageView | null;
  sourceDigestPageKey: CfoWikiPageKey | null;
  sourceResolution: PolicyLookupSourceResolution;
}): FinanceDiscoveryRelatedRoute[] {
  const routes: FinanceDiscoveryRelatedRoute[] = [
    {
      label: "Scoped policy page",
      routePath: buildWikiPageRoutePath(
        input.question.companyKey,
        input.policyPageKey,
      ),
    },
  ];

  if (input.sourceDigestPage && input.sourceDigestPageKey) {
    routes.push({
      label: "Scoped source digest page",
      routePath: buildWikiPageRoutePath(
        input.question.companyKey,
        input.sourceDigestPageKey,
      ),
    });
  }

  if (input.policyCorpusPage) {
    routes.push({
      label: "Policy corpus concept page",
      routePath: buildWikiPageRoutePath(
        input.question.companyKey,
        input.policyCorpusPageKey,
      ),
    });
  }

  if (
    input.sourceResolution.status !== "ok" ||
    input.policyPage === null ||
    input.boundSource?.limitations.length
  ) {
    routes.push({
      label: "Company bound sources",
      routePath: `/cfo-wiki/companies/${input.question.companyKey}/sources`,
    });
  }

  return routes;
}

function buildRelatedWikiPages(pages: Array<CfoWikiPageView | null>) {
  return pages.flatMap((page) =>
    page
      ? [
          {
            pageKey: page.page.pageKey,
            title: page.page.title,
          } satisfies FinanceDiscoveryRelatedWikiPage,
        ]
      : [],
  );
}

function buildEvidenceSections(input: {
  boundSource: CfoWikiBoundSourceSummary | null;
  policyPage: CfoWikiPageView | null;
  policyPageKey: CfoWikiPageKey;
  policyCorpusPage: CfoWikiPageView | null;
  question: FinancePolicyLookupQuestion;
  relatedRoutes: FinanceDiscoveryRelatedRoute[];
  sourceDigestPage: CfoWikiPageView | null;
  sourceResolution: PolicyLookupSourceResolution;
}) {
  const sections: FinanceDiscoveryEvidenceSection[] = [
    {
      key: "scoped_policy_page",
      title: "Scoped policy page",
      summary:
        input.policyPage?.page.summary ??
        `Compiled policy page ${input.policyPageKey} is not currently available, so the answer stays limited to binding and extract-status posture.`,
      pageKey: input.policyPageKey,
      routePath: input.relatedRoutes[0]?.routePath,
    },
    {
      key: "bound_source_status",
      title: "Bound source status",
      summary: buildBoundSourceStatusSummary(
        input.question.policySourceId,
        input.sourceResolution,
      ),
      routePath: input.relatedRoutes.find(
        (route) => route.label === "Company bound sources",
      )?.routePath,
    },
  ];

  if (input.sourceDigestPage) {
    sections.push({
      key: "scoped_source_digest",
      title: "Scoped source digest page",
      summary: input.sourceDigestPage.page.summary,
      pageKey: input.sourceDigestPage.page.pageKey,
      routePath: input.relatedRoutes.find(
        (route) => route.label === "Scoped source digest page",
      )?.routePath,
    });
  }

  if (input.policyCorpusPage) {
    sections.push({
      key: "policy_corpus_boundary",
      title: "Policy corpus boundary",
      summary: input.policyCorpusPage.page.summary,
      pageKey: input.policyCorpusPage.page.pageKey,
      routePath: input.relatedRoutes.find(
        (route) => route.label === "Policy corpus concept page",
      )?.routePath,
    });
  }

  return sections;
}

function buildLimitations(input: {
  boundSource: CfoWikiBoundSourceSummary | null;
  missingWikiPages: CfoWikiPageKey[];
  policyCorpusPage: CfoWikiPageView | null;
  policyPage: CfoWikiPageView | null;
  question: FinancePolicyLookupQuestion;
  sourceDigestPage: CfoWikiPageView | null;
  sourceResolution: PolicyLookupSourceResolution;
}) {
  const limitations = [
    `This answer is scoped only to policy source ${input.question.policySourceId}; it does not search across other policies or unrelated company documents.`,
    "This answer does not infer legal conclusions, approvals, controls, or obligations beyond the stored scoped policy pages and deterministic extract status.",
    "This F4C1 path remains deterministic and read-only; it does not use runtime-codex, vector search, OCR, or deep-read fallback.",
    ...(!input.boundSource?.latestExtract && input.boundSource?.latestSnapshot
      ? [
          `Policy source ${input.question.policySourceId} has no persisted deterministic extract for latest snapshot version ${input.boundSource.latestSnapshot.version}.`,
        ]
      : []),
    ...(input.boundSource?.latestExtract?.extractStatus === "failed"
      ? [
          input.boundSource.latestExtract.errorSummary ??
            `Policy source ${input.question.policySourceId} has a failed deterministic extract for its latest stored snapshot.`,
        ]
      : []),
    ...(input.boundSource?.latestExtract?.extractStatus === "unsupported"
      ? [
          `Policy source ${input.question.policySourceId} has an unsupported deterministic extract for its latest stored snapshot, so this answer cannot rely on compiled policy prose for that snapshot.`,
        ]
      : []),
    ...readSourceResolutionLimitations(input.sourceResolution),
    ...(input.boundSource?.limitations ?? []),
    ...(input.policyPage?.limitations ?? []),
    ...(input.sourceDigestPage?.limitations ?? []),
    ...(input.policyCorpusPage?.limitations ?? []),
    ...input.missingWikiPages.map(
      (pageKey) =>
        `CFO Wiki page ${pageKey} is not available yet for ${input.question.companyKey}.`,
    ),
  ];

  return Array.from(
    new Set(limitations.filter((entry) => entry.trim().length > 0)),
  );
}

function readSourceResolutionLimitations(
  resolution: PolicyLookupSourceResolution,
) {
  switch (resolution.status) {
    case "missing":
      return [
        "The requested policy source is not currently present in the company's bound-source list.",
      ];
    case "not_policy_document":
      return [
        "The requested source is bound for this company, but not with the explicit `policy_document` role required for `policy_lookup`.",
      ];
    case "ok":
      return [];
  }
}

function buildBoundSourceStatusSummary(
  policySourceId: string,
  resolution: PolicyLookupSourceResolution,
) {
  if (resolution.status === "missing") {
    return `Policy source ${policySourceId} is not currently present in the company bound-source list.`;
  }

  const source = resolution.source;
  const extractStatus = source.latestExtract?.extractStatus ?? "missing";
  const snapshotVersion = source.latestSnapshot?.version ?? "not stored";
  const role = source.binding.documentRole ?? "unscoped";
  const base = `Source "${source.source.name}" is bound with role \`${role}\`, includeInCompile=${source.binding.includeInCompile}, latest snapshot version ${snapshotVersion}, and latest deterministic extract status ${extractStatus}.`;

  if (resolution.status === "not_policy_document") {
    return `${base} This source is outside the explicit \`policy_document\` scope required for policy lookup.`;
  }

  return base;
}

function buildBodyMarkdown(input: {
  answerSummary: string;
  evidenceSections: FinanceDiscoveryEvidenceSection[];
  freshnessPosture: FinanceDiscoveryFreshnessPosture;
  limitations: string[];
  question: FinancePolicyLookupQuestion;
  relatedRoutes: FinanceDiscoveryRelatedRoute[];
  relatedWikiPages: FinanceDiscoveryRelatedWikiPage[];
}) {
  const lines = [
    "# Policy lookup answer",
    "",
    input.answerSummary,
    "",
    "## Question",
    `- Company key: \`${input.question.companyKey}\``,
    "- Question kind: Policy lookup (`policy_lookup`)",
    `- Policy source id: \`${input.question.policySourceId}\``,
    ...(input.question.operatorPrompt
      ? [`- Operator prompt: ${input.question.operatorPrompt}`]
      : []),
    "",
    "## Freshness posture",
    `- State: ${readFreshnessLabel(input.freshnessPosture.state)}`,
    `- Reason: ${input.freshnessPosture.reasonSummary}`,
    "",
    "## Limitations",
    ...input.limitations.map((entry) => `- ${entry}`),
    "",
    "## Related routes",
    ...input.relatedRoutes.map(
      (route) => `- ${route.label}: \`${route.routePath}\``,
    ),
    "",
    "## Related CFO Wiki pages",
    ...(input.relatedWikiPages.length > 0
      ? input.relatedWikiPages.map(
          (page) => `- \`${page.pageKey}\`: ${page.title}`,
        )
      : ["- No related CFO Wiki pages were available."]),
    "",
    "## Evidence sections",
  ];

  for (const section of input.evidenceSections) {
    lines.push(`### ${section.title}`);
    lines.push(section.summary);

    if (section.routePath) {
      lines.push(`Route: \`${section.routePath}\``);
    }

    if (section.pageKey) {
      lines.push(`Wiki page: \`${section.pageKey}\``);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildWikiPageRoutePath(companyKey: string, pageKey: CfoWikiPageKey) {
  return `/cfo-wiki/companies/${companyKey}/pages/${encodeURIComponent(pageKey)}`;
}
