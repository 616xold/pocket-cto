export function extractMarkdownSection(text: string | null, heading: string) {
  if (!text) {
    return null;
  }

  const escapedHeading = escapeRegExp(heading);
  const match = text.match(
    new RegExp(
      `(?:^|\\n)##\\s*${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
      "i",
    ),
  );

  return match?.[1]?.trim() || null;
}

export function flattenMarkdownText(text: string | null) {
  if (!text) {
    return null;
  }

  const flattened = text
    .split("\n")
    .map((line) => stripMarkdownPrefix(line.trim()))
    .filter(Boolean)
    .join(" ")
    .trim();

  return flattened || null;
}

export function normalizeSentence(value: string | null) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return null;
  }

  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

export function normalizeTextBlock(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

export function stripMarkdownPrefix(value: string) {
  return value.replace(/^[-*]\s+/, "").trim();
}

export function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
