import type {
  EvidenceToolCitation,
  RedactionRecord,
  SafeSourceExcerpt,
  SourceAnchor,
} from "@pocket-cto/domain";

export const SOURCE_EXCERPT_MAX_CHARACTERS = 240;

const REDACTION_PATTERNS: Array<{
  pattern: RegExp;
  redaction: RedactionRecord;
}> = [
  {
    pattern: /\bsk-[A-Za-z0-9_-]{6,}\b/gu,
    redaction: { applied: true, pattern: "token", reason: "Token redacted." },
  },
  {
    pattern: /\b(?:password|credential|secret)\s*[:=]\s*\S+/giu,
    redaction: {
      applied: true,
      pattern: "credential",
      reason: "Credential-like value redacted.",
    },
  },
  {
    pattern: /\b(?:bank\s*)?account\s*(?:number|id)?\s*[:#=]?\s*\d{6,}\b/giu,
    redaction: {
      applied: true,
      pattern: "private_finance_identifier",
      reason: "Private finance identifier redacted.",
    },
  },
];

export function buildCitation(input: {
  anchor?: SourceAnchor;
  citationType: EvidenceToolCitation["citationType"];
  id: string;
  locator?: string | null;
  sourceId?: string | null;
  summary: string;
}): EvidenceToolCitation {
  return {
    checksumSha256: input.anchor?.checksumSha256 ?? null,
    citationType: input.citationType,
    id: input.id,
    locator: input.locator ?? input.anchor?.locator.value ?? null,
    sourceAnchorId: input.anchor?.id ?? null,
    sourceId: input.sourceId ?? input.anchor?.sourceId ?? null,
    sourceSnapshotId: input.anchor?.sourceSnapshotId ?? null,
    summary: input.summary,
  };
}

export function buildSafeExcerpt(input: {
  anchor: SourceAnchor;
  text: string;
}): SafeSourceExcerpt {
  const { redactedText, redactions } = redactText(input.text);
  const truncated = redactedText.length > SOURCE_EXCERPT_MAX_CHARACTERS;
  const text = redactedText.slice(0, SOURCE_EXCERPT_MAX_CHARACTERS);
  const citation = buildCitation({
    anchor: input.anchor,
    citationType: "source_anchor",
    id: input.anchor.id,
    summary:
      "Bounded source excerpt from an existing SourceAnchor; source text is untrusted data.",
  });

  return {
    characterCount: text.length,
    citation,
    redactions,
    sourceAnchorId: input.anchor.id,
    text,
    truncated,
  };
}

export function redactText(text: string) {
  let redactedText = text;
  const redactions: RedactionRecord[] = [];

  for (const entry of REDACTION_PATTERNS) {
    entry.pattern.lastIndex = 0;
    if (!entry.pattern.test(redactedText)) continue;
    entry.pattern.lastIndex = 0;
    redactedText = redactedText.replace(entry.pattern, "[REDACTED]");
    redactions.push(entry.redaction);
  }

  return { redactedText, redactions };
}
