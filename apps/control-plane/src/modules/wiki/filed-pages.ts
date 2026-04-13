import type {
  CfoWikiCreateFiledPageRequest,
  CfoWikiFiledArtifactMetadata,
  CfoWikiPageRecord,
} from "@pocket-cto/domain";
import { buildCfoWikiFiledPageKey } from "@pocket-cto/domain";
import type { PersistCfoWikiPageInput } from "./repository";

const FILED_PAGE_LIMITATIONS = [
  "Filed artifact pages are durable operator-filed markdown and are preserved separately from compiler-owned wiki pages.",
  "Filed artifact pages are not automatically refreshed by the wiki compiler; their provenance is manual and explicit.",
] as const;

export function buildFiledPageInput(input: {
  existingPages: CfoWikiPageRecord[];
  filedAt: string;
  request: CfoWikiCreateFiledPageRequest;
}): PersistCfoWikiPageInput {
  const pageKey = buildUniqueFiledPageKey(
    input.existingPages,
    slugifyTitle(input.request.title),
  );
  const filedMetadata: CfoWikiFiledArtifactMetadata = {
    filedAt: input.filedAt,
    filedBy: input.request.filedBy,
    provenanceKind: "manual_markdown_artifact",
    provenanceSummary: input.request.provenanceSummary,
  };
  const summary = summarizeFiledMarkdown(input.request.markdownBody);

  return {
    pageKey,
    pageKind: "filed_artifact",
    ownershipKind: "filed_artifact",
    temporalStatus: "current",
    title: input.request.title,
    summary,
    markdownBody: renderFiledMarkdown({
      filedMetadata,
      pageKey,
      summary,
      title: input.request.title,
      userMarkdownBody: input.request.markdownBody,
    }),
    freshnessSummary: {
      state: "missing",
      summary:
        "Filed artifact pages are manually persisted and do not carry compiler freshness.",
    },
    limitations: [...FILED_PAGE_LIMITATIONS],
    lastCompiledAt: input.filedAt,
    filedMetadata,
  };
}

function renderFiledMarkdown(input: {
  filedMetadata: CfoWikiFiledArtifactMetadata;
  pageKey: string;
  summary: string;
  title: string;
  userMarkdownBody: string;
}) {
  return [
    `# ${input.title}`,
    "",
    `- Page key: \`${input.pageKey}\``,
    "- Page kind: `filed_artifact`",
    "- Ownership: `filed_artifact`",
    `- Filed by: ${input.filedMetadata.filedBy}`,
    `- Filed at: ${input.filedMetadata.filedAt}`,
    `- Provenance: ${input.filedMetadata.provenanceSummary}`,
    "",
    "## Summary",
    input.summary,
    "",
    "## Filed Markdown Body",
    input.userMarkdownBody.trim(),
    "",
  ].join("\n");
}

function buildUniqueFiledPageKey(
  existingPages: CfoWikiPageRecord[],
  baseSlug: string,
) {
  const existingPageKeys = new Set(existingPages.map((page) => page.pageKey));

  for (let suffix = 1; suffix < 10_000; suffix += 1) {
    const slug = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
    const candidate = buildCfoWikiFiledPageKey(slug);

    if (!existingPageKeys.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate a unique filed page key");
}

function summarizeFiledMarkdown(markdownBody: string) {
  const normalized = markdownBody
    .replace(/^#+\s+/gmu, "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function slugifyTitle(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug.length > 0 ? slug : "filed-note";
}
