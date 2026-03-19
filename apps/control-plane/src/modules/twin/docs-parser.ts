import { createHash } from "node:crypto";
import { basename, extname } from "node:path";
import type { DiscoveredDocumentationFile } from "./docs-discovery";

export type ParsedDocumentationSection = {
  anchor: string;
  contentStartLineIndex: number;
  endLineIndexExclusive: number;
  excerpt: string | null;
  headingLevel: number;
  headingPath: string;
  headingText: string;
  ordinal: number;
  sourceFilePath: string;
  stableKey: string;
};

export type ParsedDocumentationFile = {
  contentDigest: string;
  headingCount: number;
  lineCount: number;
  modifiedAt: string | null;
  path: string;
  sections: ParsedDocumentationSection[];
  sizeBytes: number;
  titleFallback: string;
};

type HeadingMatch = {
  consumedLineCount: number;
  index: number;
  level: number;
  text: string;
};

export function parseDocumentationFile(
  input: DiscoveredDocumentationFile,
): ParsedDocumentationFile {
  const lines = input.content.split(/\r?\n/);
  const headingMatches = findHeadingMatches(lines);
  const anchorCounts = new Map<string, number>();
  const headingStack: Array<{ level: number; text: string }> = [];
  const sections = headingMatches.map((heading, index) => {
    while (
      headingStack.length > 0 &&
      headingStack[headingStack.length - 1]!.level >= heading.level
    ) {
      headingStack.pop();
    }

    headingStack.push({
      level: heading.level,
      text: heading.text,
    });

    const ordinal = index + 1;
    const baseAnchor = normalizeHeadingAnchor(heading.text) || `section-${ordinal}`;
    const duplicateCount = anchorCounts.get(baseAnchor) ?? 0;
    const anchor =
      duplicateCount === 0 ? baseAnchor : `${baseAnchor}-${duplicateCount}`;

    anchorCounts.set(baseAnchor, duplicateCount + 1);

    return {
      anchor,
      contentStartLineIndex: heading.index + heading.consumedLineCount,
      endLineIndexExclusive: headingMatches[index + 1]?.index ?? lines.length,
      excerpt: buildSectionExcerpt(
        lines,
        heading.index + heading.consumedLineCount,
        headingMatches[index + 1]?.index ?? lines.length,
      ),
      headingLevel: heading.level,
      headingPath: headingStack.map((candidate) => candidate.text).join(" > "),
      headingText: heading.text,
      ordinal,
      sourceFilePath: input.path,
      stableKey: buildDocSectionStableKey(input.path, ordinal),
    };
  });

  return {
    contentDigest: createHash("sha1").update(input.content).digest("hex").slice(0, 12),
    headingCount: sections.length,
    lineCount: input.lineCount,
    modifiedAt: input.modifiedAt,
    path: input.path,
    sections,
    sizeBytes: input.sizeBytes,
    titleFallback: sections[0]?.headingText ?? buildTitleFallback(input.path),
  };
}

export function buildDocSectionStableKey(path: string, ordinal: number) {
  return `${path}#section:${ordinal}`;
}

function findHeadingMatches(lines: string[]): HeadingMatch[] {
  const matches: HeadingMatch[] = [];
  const bodyStartIndex = readFrontMatterEndIndex(lines);
  let fence: { character: "`" | "~"; length: number } | null = null;

  for (let index = bodyStartIndex; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const fenceState = readFenceState(line);

    if (fenceState) {
      if (!fence) {
        fence = fenceState;
        continue;
      }

      if (
        fence.character === fenceState.character &&
        fenceState.length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    if (fence) {
      continue;
    }

    const atxHeading = parseAtxHeading(line);

    if (atxHeading) {
      matches.push({
        consumedLineCount: 1,
        index,
        level: atxHeading.level,
        text: atxHeading.text,
      });
      continue;
    }

    const setextHeading = parseSetextHeading(lines, index);

    if (setextHeading) {
      matches.push({
        consumedLineCount: 2,
        index,
        level: setextHeading.level,
        text: setextHeading.text,
      });
      index += 1;
    }
  }

  return matches;
}

function readFrontMatterEndIndex(lines: string[]) {
  if ((lines[0] ?? "").trim() !== "---") {
    return 0;
  }

  for (let index = 1; index < lines.length; index += 1) {
    if ((lines[index] ?? "").trim() === "---") {
      return index + 1;
    }
  }

  return 0;
}

function readFenceState(line: string) {
  const match = line.match(/^\s*(`{3,}|~{3,})/);

  if (!match) {
    return null;
  }

  return {
    character: match[1]![0] as "`" | "~",
    length: match[1]!.length,
  };
}

function parseAtxHeading(line: string) {
  const match = line.match(/^\s{0,3}(#{1,6})[ \t]+(.+?)\s*#*\s*$/);

  if (!match) {
    return null;
  }

  const text = match[2]?.trim();

  if (!text) {
    return null;
  }

  return {
    level: match[1]!.length,
    text,
  };
}

function parseSetextHeading(lines: string[], index: number) {
  const line = lines[index]?.trim() ?? "";
  const underline = lines[index + 1]?.trim() ?? "";

  if (!line || /^#{1,6}\s/.test(line)) {
    return null;
  }

  if (/^=+$/.test(underline)) {
    return {
      level: 1,
      text: line,
    };
  }

  if (/^-+$/.test(underline)) {
    return {
      level: 2,
      text: line,
    };
  }

  return null;
}

function buildSectionExcerpt(
  lines: string[],
  startIndex: number,
  endIndex: number,
) {
  const excerptLines: string[] = [];
  let fence: { character: "`" | "~"; length: number } | null = null;

  for (let index = startIndex; index < endIndex; index += 1) {
    const line = lines[index] ?? "";
    const fenceState = readFenceState(line);

    if (fenceState) {
      if (!fence) {
        fence = fenceState;
        continue;
      }

      if (
        fence.character === fenceState.character &&
        fenceState.length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    if (fence) {
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      if (excerptLines.length > 0) {
        break;
      }
      continue;
    }

    excerptLines.push(trimmed);

    if (excerptLines.join(" ").length >= 220) {
      break;
    }
  }

  if (excerptLines.length === 0) {
    return null;
  }

  return truncate(excerptLines.join(" "), 220);
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function normalizeHeadingAnchor(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[`~!@#$%^&*()+=[\]{}|\\:;"'<>,.?/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildTitleFallback(path: string) {
  const fileName = basename(path);
  const extension = extname(fileName);
  const withoutExtension =
    extension.length > 0 ? fileName.slice(0, -extension.length) : fileName;

  return withoutExtension || path;
}
