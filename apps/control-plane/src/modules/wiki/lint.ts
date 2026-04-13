import type {
  CfoWikiLintFindingCounts,
  CfoWikiPageLinkRecord,
  CfoWikiPageRecord,
  CfoWikiPageRefRecord,
} from "@pocket-cto/domain";
import type { PersistCfoWikiLintFindingInput } from "./repository";

const NUMERIC_CLAIM_PATTERN =
  /(?<![a-z])(?:[$€£]?\d[\d,]*(?:\.\d+)?%?|\d+(?:\.\d+)?x)(?![a-z])/iu;
const ALLOWED_ROOT_PAGE_KEYS = new Set(["index"]);

export function lintCfoWikiState(input: {
  backlinksByPageId: Map<string, CfoWikiPageLinkRecord[]>;
  linksByPageId: Map<string, CfoWikiPageLinkRecord[]>;
  pages: CfoWikiPageRecord[];
  refsByPageId: Map<string, CfoWikiPageRefRecord[]>;
}) {
  const pagesById = new Map(input.pages.map((page) => [page.id, page] as const));
  const findings: PersistCfoWikiLintFindingInput[] = [];

  for (const page of input.pages) {
    const refs = input.refsByPageId.get(page.id) ?? [];
    const backlinks = input.backlinksByPageId.get(page.id) ?? [];
    const links = input.linksByPageId.get(page.id) ?? [];
    const evidenceRefs = refs.filter(
      (ref) => ref.refKind === "source_excerpt" || ref.refKind === "twin_fact",
    );

    if (refs.length === 0) {
      findings.push(
        buildFinding(page, "missing_refs", "Page has no persisted wiki refs.", {
          pageKind: page.pageKind,
        }),
      );
    }

    if (
      NUMERIC_CLAIM_PATTERN.test(page.markdownBody) &&
      evidenceRefs.length === 0
    ) {
      findings.push(
        buildFinding(
          page,
          "uncited_numeric_claim",
          "Page contains numeric-looking content without a persisted `twin_fact` or `source_excerpt` ref.",
          {
            pageKind: page.pageKind,
          },
        ),
      );
    }

    if (
      backlinks.length === 0 &&
      !ALLOWED_ROOT_PAGE_KEYS.has(page.pageKey)
    ) {
      findings.push(
        buildFinding(page, "orphan_page", "Page has no inbound wiki links.", {
          pageKind: page.pageKind,
        }),
      );
    }

    if (page.freshnessSummary.state === "stale") {
      findings.push(
        buildFinding(
          page,
          "stale_page",
          "Page freshness posture is stale.",
          {
            freshnessSummary: page.freshnessSummary.summary,
          },
        ),
      );
    }

    if (
      page.pageKind === "source_digest" &&
      (page.freshnessSummary.state === "missing" ||
        page.freshnessSummary.state === "failed")
    ) {
      findings.push(
        buildFinding(
          page,
          "unsupported_document_gap",
          "Source digest page still represents an unsupported or failed document gap.",
          {
            freshnessSummary: page.freshnessSummary.summary,
          },
        ),
      );
    }

    for (const link of links) {
      if (!pagesById.has(link.toPageId)) {
        findings.push(
          buildFinding(
            page,
            "broken_link",
            "Page links to a missing target page.",
            {
              linkId: link.id,
              targetPageId: link.toPageId,
            },
          ),
        );
      }
    }
  }

  for (const duplicatePages of findDuplicateTitleGroups(input.pages)) {
    const duplicateTitles = duplicatePages.map((page) => page.pageKey);

    for (const page of duplicatePages) {
      findings.push(
        buildFinding(
          page,
          "duplicate_title",
          "Page title is duplicated across current wiki pages.",
          {
            duplicatePageKeys: duplicateTitles,
            normalizedTitle: normalizeTitle(page.title),
          },
        ),
      );
    }
  }

  return {
    findingCount: findings.length,
    findingCountsByKind: countLintFindings(findings),
    findings: findings.sort(compareFindings),
  };
}

export function countLintFindings(
  findings: PersistCfoWikiLintFindingInput[],
): CfoWikiLintFindingCounts {
  const counts: CfoWikiLintFindingCounts = {
    missing_refs: 0,
    uncited_numeric_claim: 0,
    orphan_page: 0,
    stale_page: 0,
    broken_link: 0,
    unsupported_document_gap: 0,
    duplicate_title: 0,
  };

  for (const finding of findings) {
    counts[finding.findingKind] += 1;
  }

  return counts;
}

export function emptyLintFindingCounts(): CfoWikiLintFindingCounts {
  return countLintFindings([]);
}

function buildFinding(
  page: CfoWikiPageRecord,
  findingKind: PersistCfoWikiLintFindingInput["findingKind"],
  message: string,
  details: Record<string, unknown>,
): PersistCfoWikiLintFindingInput {
  return {
    pageId: page.id,
    pageKey: page.pageKey,
    pageTitle: page.title,
    findingKind,
    message,
    details,
  };
}

function compareFindings(
  left: PersistCfoWikiLintFindingInput,
  right: PersistCfoWikiLintFindingInput,
) {
  return [
    left.findingKind,
    left.pageKey ?? "",
    left.message,
  ].join("::").localeCompare(
    [right.findingKind, right.pageKey ?? "", right.message].join("::"),
  );
}

function findDuplicateTitleGroups(pages: CfoWikiPageRecord[]) {
  const groups = new Map<string, CfoWikiPageRecord[]>();

  for (const page of pages) {
    const key = normalizeTitle(page.title);
    const current = groups.get(key);

    if (current) {
      current.push(page);
      continue;
    }

    groups.set(key, [page]);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => group.sort((left, right) => left.pageKey.localeCompare(right.pageKey)));
}

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}
