import { createHash } from "node:crypto";
import {
  EVIDENCE_TOOL_SCHEMA_VERSION,
  EvidenceToolResponseSchema,
  type AppMode,
  type EvidenceIndexFreshnessPosture,
  type EvidenceIndexLimitationPosture,
  type EvidenceToolCitation,
  type EvidenceToolName,
  type EvidenceToolResponse,
  type PermittedNextAction,
  type RedactionRecord,
} from "@pocket-cto/domain";
import { V2C_FORBIDDEN_ACTIONS } from "./manifest";

export function buildEvidenceToolResponse<T>(input: {
  appMode: AppMode;
  artifactIds?: string[];
  capabilityBoundaries?: EvidenceIndexLimitationPosture[];
  citations: EvidenceToolCitation[];
  companyKey: string;
  excerptCharacterCount?: number;
  freshness: EvidenceIndexFreshnessPosture;
  forbiddenRequestBlocked?: boolean;
  limitations: EvidenceIndexLimitationPosture[];
  normalizedQuery?: string | null;
  ok: boolean;
  permittedNextActions: PermittedNextAction[];
  redactions?: RedactionRecord[];
  result: T | null;
  timestamp: string;
  toolName: EvidenceToolName;
  unsupportedReason?: string | null;
}): EvidenceToolResponse<T> {
  const redactions = input.redactions ?? [];
  const response = EvidenceToolResponseSchema.parse({
    appMode: input.appMode,
    audit: {
      appMode: input.appMode,
      artifactIds: input.artifactIds ?? [],
      companyKey: input.companyKey,
      excerptCharacterCount: input.excerptCharacterCount ?? 0,
      forbiddenRequestBlocked: input.forbiddenRequestBlocked ?? false,
      id: auditId(input),
      normalizedQuery: input.normalizedQuery ?? null,
      redactionCount: redactions.length,
      sourceAnchorIds: input.citations
        .map((citation) => citation.sourceAnchorId)
        .filter((id): id is string => id !== null),
      timestamp: input.timestamp,
      toolName: input.toolName,
      unsupportedReason: input.unsupportedReason ?? null,
    },
    capabilityBoundaries: input.capabilityBoundaries ?? [],
    citations: input.citations,
    companyKey: input.companyKey,
    evidence: input.citations,
    forbiddenActions: V2C_FORBIDDEN_ACTIONS,
    freshness: input.freshness,
    limitations: input.limitations,
    ok: input.ok,
    permittedNextActions: input.permittedNextActions,
    redactions,
    result: input.result,
    schemaVersion: EVIDENCE_TOOL_SCHEMA_VERSION,
    toolName: input.toolName,
    unsupportedReason: input.unsupportedReason ?? null,
  });

  return response as EvidenceToolResponse<T>;
}

function auditId(input: { toolName: string; companyKey: string; timestamp: string }) {
  return `audit:${createHash("sha256")
    .update(`${input.toolName}:${input.companyKey}:${input.timestamp}`)
    .digest("hex")
    .slice(0, 16)}`;
}
