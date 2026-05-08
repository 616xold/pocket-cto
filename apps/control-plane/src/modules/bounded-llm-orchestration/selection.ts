import {
  BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
  BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
  EvidenceSelectionResultSchema,
  SafeSourceExcerptSchema,
  type EvidenceSelectionResult,
  type EvidenceToolCitation,
  type EvidenceToolResponse,
  type LlmOutput,
  type SafeSourceExcerpt,
} from "@pocket-cto/domain";
import {
  buildAuditEvent,
  fixedReadOnlyToolNames,
  humanReviewAction,
  normalizeQuestion,
} from "./policy";
import { unsupportedEvidenceRefusalOutput } from "./refusals";

export type EvidenceSelectionInput = {
  companyKey: string;
  originalText: string;
  query: string;
  responses: EvidenceToolResponse<unknown>[];
  timestamp: string;
};

export type EvidenceSelectionOutcome =
  | { ok: true; selection: EvidenceSelectionResult }
  | { ok: false; refusal: LlmOutput };

export function selectEvidenceFromToolResponses(
  input: EvidenceSelectionInput,
): EvidenceSelectionOutcome {
  const normalizedQuery = normalizeQuestion(input.query);
  const unsupportedReasons = unsupportedReasonsForResponses(input.responses);
  if (unsupportedReasons.length > 0) {
    return {
      ok: false,
      refusal: unsupportedEvidenceRefusalOutput({
        artifactIds: input.responses.flatMap((response) => response.audit.artifactIds),
        companyKey: input.companyKey,
        normalizedQuery,
        originalText: input.originalText,
        reasons: unsupportedReasons,
        timestamp: input.timestamp,
      }),
    };
  }

  const selectedCitations = uniqueCitations(
    input.responses.flatMap((response) => response.citations),
  );
  if (selectedCitations.length === 0) {
    return {
      ok: false,
      refusal: unsupportedEvidenceRefusalOutput({
        artifactIds: input.responses.flatMap((response) => response.audit.artifactIds),
        companyKey: input.companyKey,
        normalizedQuery,
        originalText: input.originalText,
        reasons: ["no_selected_evidence"],
        timestamp: input.timestamp,
      }),
    };
  }

  const safeExcerpts = input.responses.flatMap((response) =>
    findSafeExcerpts(response.result),
  );
  const sourceAnchorIds = uniqueStrings(
    selectedCitations
      .map((citation) => citation.sourceAnchorId)
      .filter((id): id is string => id !== null),
  );
  const artifactIds = uniqueStrings(
    input.responses.flatMap((response) => response.audit.artifactIds),
  );
  const audit = buildAuditEvent({
    citationCount: selectedCitations.length,
    companyKey: input.companyKey,
    normalizedQuery,
    plannedToolNames: fixedReadOnlyToolNames(),
    redactionCount: safeExcerpts.reduce(
      (sum, excerpt) => sum + excerpt.redactions.length,
      0,
    ),
    responseKind: "bounded_evidence_summary",
    selectedArtifactIds: artifactIds,
    sourceAnchorIds,
    timestamp: input.timestamp,
  });
  const limitations = [
    ...input.responses.flatMap((response) => response.limitations),
    {
      affectedAnchorIds: [],
      affectedSourceIds: [],
      code: "not_source_truth" as const,
      severity: "warning" as const,
      summary:
        "Evidence selection is a deterministic handoff over V2C responses only.",
    },
  ];
  const selection = EvidenceSelectionResultSchema.parse({
    audit,
    companyKey: input.companyKey,
    conflictingEvidenceDetected: false,
    freshness: input.responses[0]!.freshness,
    fullFileDumpsReturned: false,
    limitations,
    normalizedQuery,
    permittedNextActions:
      input.responses.flatMap((response) => response.permittedNextActions)
        .length > 0
        ? input.responses.flatMap((response) => response.permittedNextActions)
        : [humanReviewAction(input.companyKey)],
    promptInjectionTextTreatedAsData: true,
    safeExcerpts,
    schemaVersion: BOUNDED_LLM_ORCHESTRATION_SCHEMA_VERSION,
    selectedCitations,
    selectedCoverageSourceIds: uniqueStrings(
      selectedCitations
        .filter((citation) => citation.citationType === "source_coverage")
        .map((citation) => citation.id),
    ),
    selectedDocumentMapIds: artifactIds.filter((id) =>
      id.startsWith("document-map:"),
    ),
    selectedEvidenceCardIds: artifactIds.filter((id) =>
      id.startsWith("evidence-card:"),
    ),
    selectedEvidenceOnly: true,
    selectedSourceAnchorIds: sourceAnchorIds,
    toolResponses: input.responses,
    unsupportedReasons: [],
  });

  return { ok: true, selection };
}

function unsupportedReasonsForResponses(
  responses: EvidenceToolResponse<unknown>[],
) {
  const reasons = new Set<
    "missing" | "stale" | "unsupported" | "failed" | "outside_tool_coverage"
  >();

  if (responses.length === 0) reasons.add("missing");
  for (const response of responses) {
    if (!BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST.includes(response.toolName)) {
      reasons.add("outside_tool_coverage");
    }
    if (!response.ok || response.unsupportedReason) reasons.add("unsupported");
    if (response.freshness.state === "missing") reasons.add("missing");
    if (response.freshness.state === "stale") reasons.add("stale");
    if (response.freshness.state === "failed") reasons.add("failed");
    if (resultContainsFreshnessState(response.result, "stale")) {
      reasons.add("stale");
    }
    if (resultContainsFreshnessState(response.result, "failed")) {
      reasons.add("failed");
    }
    if (resultContainsCoverageStatus(response.result, "unsupported")) {
      reasons.add("unsupported");
    }
  }

  return [...reasons];
}

function resultContainsFreshnessState(value: unknown, state: string): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => resultContainsFreshnessState(entry, state));
  }
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (
    typeof record.freshness === "object" &&
    record.freshness !== null &&
    (record.freshness as Record<string, unknown>).state === state
  ) {
    return true;
  }
  return Object.values(record).some((entry) =>
    resultContainsFreshnessState(entry, state),
  );
}

function resultContainsCoverageStatus(value: unknown, status: string): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => resultContainsCoverageStatus(entry, status));
  }
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.coverageStatus === status) return true;
  return Object.values(record).some((entry) =>
    resultContainsCoverageStatus(entry, status),
  );
}

function findSafeExcerpts(value: unknown): SafeSourceExcerpt[] {
  if (Array.isArray(value)) return value.flatMap(findSafeExcerpts);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const excerpts = [
    ...(Array.isArray(record.safeExcerpts) ? record.safeExcerpts : []),
    record.safeExcerpt,
  ]
    .filter((excerpt): excerpt is unknown => excerpt !== null)
    .map((excerpt) => SafeSourceExcerptSchema.safeParse(excerpt))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data);

  return [
    ...excerpts,
    ...Object.values(record).flatMap((entry) => findSafeExcerpts(entry)),
  ];
}

function uniqueCitations(citations: EvidenceToolCitation[]) {
  const seen = new Set<string>();
  return citations.filter((citation) => {
    const key = `${citation.citationType}:${citation.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}
