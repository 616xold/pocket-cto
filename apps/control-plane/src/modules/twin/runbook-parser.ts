import type { DiscoveredDocumentationFile } from "./docs-discovery";
import type { ParsedDocumentationFile } from "./docs-parser";

export const runbookCommandFamilies = [
  "curl",
  "pnpm",
  "node",
  "git",
  "docker",
  "other",
] as const;

export type RunbookCommandFamily = (typeof runbookCommandFamilies)[number];

export type ExtractedRunbookStep = {
  commandFamily: RunbookCommandFamily;
  commandText: string;
  headingContext: string;
  ordinal: number;
  purposeLabel: string | null;
  sourceDocPath: string;
  stableKey: string;
};

export type ExtractedRunbookDocument = {
  classificationReason: string;
  commandFamilyCounts: Record<string, number>;
  contentDigest: string;
  headingCount: number;
  lineCount: number;
  modifiedAt: string | null;
  path: string;
  sizeBytes: number;
  stepCount: number;
  steps: ExtractedRunbookStep[];
  title: string;
};

type ScanRange = {
  contentStartLineIndex: number;
  endLineIndexExclusive: number;
  headingContext: string;
};

type FenceMarker = {
  character: "`" | "~";
  infoString: string;
  length: number;
};

const commandLikeBulletPrefixPattern =
  /^(?:env\b|[A-Za-z_][A-Za-z0-9_]*=|curl\b|pnpm\b|node\b|git\b|docker\b|bash\b|sh\b|export\b)/;

export function extractRunbookDocument(input: {
  classificationReason: string;
  discoveredFile: DiscoveredDocumentationFile;
  parsedFile: ParsedDocumentationFile;
}): ExtractedRunbookDocument {
  const lines = input.discoveredFile.content.split(/\r?\n/);
  const scanRanges =
    input.parsedFile.sections.length > 0
      ? input.parsedFile.sections.map((section) => ({
          contentStartLineIndex: section.contentStartLineIndex,
          endLineIndexExclusive: section.endLineIndexExclusive,
          headingContext: section.headingPath,
        }))
      : [
          {
            contentStartLineIndex: 0,
            endLineIndexExclusive: lines.length,
            headingContext: input.parsedFile.titleFallback,
          },
        ];

  const steps: ExtractedRunbookStep[] = [];
  let ordinal = 0;

  for (const range of scanRanges) {
    for (const commandText of extractCommandsFromRange({
      lines,
      range,
    })) {
      ordinal += 1;
      steps.push({
        commandFamily: classifyRunbookCommandFamily(commandText),
        commandText,
        headingContext: range.headingContext,
        ordinal,
        purposeLabel: readPurposeLabel(range.headingContext),
        sourceDocPath: input.parsedFile.path,
        stableKey: buildRunbookStepStableKey(input.parsedFile.path, ordinal),
      });
    }
  }

  return {
    classificationReason: input.classificationReason,
    commandFamilyCounts: buildCommandFamilyCounts(steps),
    contentDigest: input.parsedFile.contentDigest,
    headingCount: input.parsedFile.headingCount,
    lineCount: input.parsedFile.lineCount,
    modifiedAt: input.parsedFile.modifiedAt,
    path: input.parsedFile.path,
    sizeBytes: input.parsedFile.sizeBytes,
    stepCount: steps.length,
    steps,
    title: input.parsedFile.titleFallback,
  };
}

export function buildRunbookStepStableKey(path: string, ordinal: number) {
  return `${path}#step:${ordinal}`;
}

function extractCommandsFromRange(input: {
  lines: string[];
  range: ScanRange;
}) {
  const commands: string[] = [];
  let index = input.range.contentStartLineIndex;

  while (index < input.range.endLineIndexExclusive) {
    const line = input.lines[index] ?? "";
    const marker = readFenceMarker(line);

    if (marker) {
      const closingFenceIndex = findClosingFenceIndex({
        lines: input.lines,
        openingFence: marker,
        searchStartIndex: index + 1,
        sectionEndIndexExclusive: input.range.endLineIndexExclusive,
      });

      if (isShellFence(marker.infoString)) {
        commands.push(
          ...extractShellBlockCommands(
            input.lines.slice(index + 1, closingFenceIndex),
          ),
        );
      }

      index = Math.min(
        closingFenceIndex + 1,
        input.range.endLineIndexExclusive,
      );
      continue;
    }

    const bulletCommand = readCommandLikeBullet(line);

    if (bulletCommand) {
      commands.push(bulletCommand);
    }

    index += 1;
  }

  return commands;
}

function extractShellBlockCommands(lines: string[]) {
  const commands: string[] = [];
  const current: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      flushCommand(current, commands);
      continue;
    }

    current.push(trimmed);

    if (!trimmed.endsWith("\\")) {
      flushCommand(current, commands);
    }
  }

  flushCommand(current, commands);

  return commands;
}

function flushCommand(current: string[], commands: string[]) {
  if (current.length === 0) {
    return;
  }

  const commandText = current.join("\n");
  current.length = 0;

  if (readCommandToken(commandText) !== null) {
    commands.push(commandText);
  }
}

function readCommandLikeBullet(line: string) {
  const match = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);

  if (!match) {
    return null;
  }

  const rawContent = match[1]?.trim() ?? "";

  if (!rawContent) {
    return null;
  }

  const inlineCodeMatch = rawContent.match(/^`([^`]+)`$/);
  const candidate = inlineCodeMatch?.[1]?.trim() ?? rawContent;

  if (!candidate) {
    return null;
  }

  if (inlineCodeMatch) {
    return readCommandToken(candidate) !== null ? candidate : null;
  }

  if (
    !commandLikeBulletPrefixPattern.test(candidate) ||
    /[`[\]]/.test(candidate) ||
    candidate.endsWith(":")
  ) {
    return null;
  }

  return readCommandToken(candidate) !== null ? candidate : null;
}

function readFenceMarker(line: string): FenceMarker | null {
  const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/);

  if (!match) {
    return null;
  }

  return {
    character: match[1]![0] as "`" | "~",
    infoString: match[2]?.trim().toLowerCase() ?? "",
    length: match[1]!.length,
  };
}

function findClosingFenceIndex(input: {
  lines: string[];
  openingFence: FenceMarker;
  searchStartIndex: number;
  sectionEndIndexExclusive: number;
}) {
  for (
    let index = input.searchStartIndex;
    index < input.sectionEndIndexExclusive;
    index += 1
  ) {
    const marker = readFenceMarker(input.lines[index] ?? "");

    if (
      marker &&
      marker.character === input.openingFence.character &&
      marker.length >= input.openingFence.length
    ) {
      return index;
    }
  }

  return input.sectionEndIndexExclusive;
}

function isShellFence(infoString: string) {
  const language = infoString.split(/\s+/)[0] ?? "";

  return language === "bash" || language === "sh" || language === "shell";
}

function classifyRunbookCommandFamily(
  commandText: string,
): RunbookCommandFamily {
  const token = readCommandToken(commandText)?.toLowerCase();

  if (token === "curl") {
    return "curl";
  }

  if (token === "pnpm") {
    return "pnpm";
  }

  if (token === "node") {
    return "node";
  }

  if (token === "git") {
    return "git";
  }

  if (token === "docker" || token === "docker-compose") {
    return "docker";
  }

  return "other";
}

function readCommandToken(commandText: string) {
  const tokens = commandText
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  let index = 0;

  while (tokens[index] === "\\") {
    index += 1;
  }

  if (tokens[index] === "env") {
    index += 1;

    while (index < tokens.length) {
      const token = tokens[index]!;

      if (
        token === "\\" ||
        token.startsWith("-") ||
        isEnvironmentAssignmentToken(token)
      ) {
        index += 1;
        continue;
      }

      break;
    }
  } else {
    while (
      index < tokens.length &&
      (tokens[index] === "\\" || isEnvironmentAssignmentToken(tokens[index]!))
    ) {
      index += 1;
    }
  }

  const token = tokens[index] ?? null;

  return token && token !== "\\" ? token : null;
}

function isEnvironmentAssignmentToken(token: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token);
}

function readPurposeLabel(headingContext: string) {
  const segments = headingContext
    .split(" > ")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  return segments.length > 0 ? segments[segments.length - 1]! : null;
}

function buildCommandFamilyCounts(
  steps: Array<Pick<ExtractedRunbookStep, "commandFamily">>,
) {
  const counts: Record<string, number> = {};

  for (const step of steps) {
    counts[step.commandFamily] = (counts[step.commandFamily] ?? 0) + 1;
  }

  return counts;
}
