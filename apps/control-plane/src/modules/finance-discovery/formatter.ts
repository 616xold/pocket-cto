import type {
  FinanceDiscoveryAnswerArtifactMetadata,
  FinanceDiscoveryEvidenceSection,
  FinanceDiscoveryFreshnessPosture,
  FinanceDiscoveryRelatedWikiPage,
} from "@pocket-cto/domain";
import {
  FinanceDiscoveryAnswerArtifactMetadataSchema,
  readFinanceDiscoveryQuestionKindLabel,
  readFreshnessLabel,
} from "@pocket-cto/domain";
import {
  buildFinanceDiscoveryEvidenceSections,
  buildFinanceDiscoveryStructuredData,
} from "./read-formatters";
import {
  buildFinanceDiscoveryAnswerSummary,
  buildFinanceDiscoveryFreshnessPosture,
  buildFinanceDiscoveryLimitations,
} from "./summary-builders";
import type { FinanceDiscoveryAnswerFormatterInput } from "./types";

export function buildFinanceDiscoveryAnswerMetadata(
  input: FinanceDiscoveryAnswerFormatterInput,
): FinanceDiscoveryAnswerArtifactMetadata {
  const freshnessPosture = buildFinanceDiscoveryFreshnessPosture(input);
  const limitations = buildFinanceDiscoveryLimitations(input);
  const relatedWikiPages = input.wikiPages.map((page) => ({
    pageKey: page.page.pageKey,
    title: page.page.title,
  })) satisfies FinanceDiscoveryRelatedWikiPage[];
  const evidenceSections = buildFinanceDiscoveryEvidenceSections(input);
  const answerSummary = buildFinanceDiscoveryAnswerSummary(input);

  return FinanceDiscoveryAnswerArtifactMetadataSchema.parse({
    source: "stored_finance_twin_and_cfo_wiki",
    summary: answerSummary,
    companyKey: input.question.companyKey,
    questionKind: input.question.questionKind,
    answerSummary,
    freshnessPosture,
    limitations,
    relatedRoutes: input.relatedRoutes.map(({ label, routePath }) => ({
      label,
      routePath,
    })),
    relatedWikiPages,
    evidenceSections,
    bodyMarkdown: buildBodyMarkdown({
      answerSummary,
      evidenceSections,
      freshnessPosture,
      input,
      limitations,
      relatedWikiPages,
    }),
    structuredData: buildFinanceDiscoveryStructuredData(
      input,
      freshnessPosture,
    ),
  });
}

function buildBodyMarkdown(input: {
  answerSummary: string;
  evidenceSections: FinanceDiscoveryEvidenceSection[];
  freshnessPosture: FinanceDiscoveryFreshnessPosture;
  input: FinanceDiscoveryAnswerFormatterInput;
  limitations: string[];
  relatedWikiPages: FinanceDiscoveryRelatedWikiPage[];
}) {
  const lines = [
    `# ${input.input.family.answerTitle}`,
    "",
    input.answerSummary,
    "",
    "## Question",
    `- Company key: \`${input.input.question.companyKey}\``,
    `- Question kind: ${readFinanceDiscoveryQuestionKindLabel(
      input.input.question.questionKind,
    )} (\`${input.input.question.questionKind}\`)`,
    ...(input.input.question.operatorPrompt
      ? [`- Operator prompt: ${input.input.question.operatorPrompt}`]
      : []),
    "",
    "## Freshness posture",
    `- State: ${readFreshnessLabel(input.freshnessPosture.state)}`,
    `- Reason: ${input.freshnessPosture.reasonSummary}`,
    "",
    "## Limitations",
    ...(input.limitations.length > 0
      ? input.limitations.map((entry) => `- ${entry}`)
      : ["- No explicit limitations were recorded."]),
    "",
    "## Related routes",
    ...input.input.relatedRoutes.map(
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
