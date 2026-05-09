import { z } from "zod";
import { BaseAppPrivacyBoundary } from "./read-only-app-mcp-contracts";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
} from "./read-only-app-mcp-boundaries";
import {
  buildAppAuthorityBoundary,
  buildAppNoRuntimeBoundary,
} from "./read-only-app-mcp-runtime";
import {
  APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  AppMcpCitationSchema,
  type AppMcpEnvelopeBase,
  type AppMcpEnvelopeRefusalReason,
  AppMcpEvidenceRefSchema,
  AppMcpFreshnessSchema,
  type AppMcpLimitationSchema,
  type AppMcpRefusalPostureSchema,
  type AppMcpSpecificRefusalEnvelope,
  appMcpBaseEnvelopeSchema,
  appMcpEvidencePostureSchema,
  appMcpRefusalPostureSchema,
  containsForbiddenResponseField,
} from "./read-only-app-mcp-envelope-common";

export {
  APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS,
  AppMcpCitationSchema,
  AppMcpEvidenceRefSchema,
  AppMcpFreshnessSchema,
  AppMcpLimitationSchema,
  AppMcpPermittedNextActionSchema,
  AppMcpRefusalPostureSchema,
  containsForbiddenResponseField,
} from "./read-only-app-mcp-envelope-common";

export const AppMcpEvidenceEnvelopeSchema = appMcpBaseEnvelopeSchema
  .extend({
    responseKind: z.literal("evidence"),
    citations: z.array(AppMcpCitationSchema).min(1),
    evidence: z.array(AppMcpEvidenceRefSchema).min(1),
    freshness: AppMcpFreshnessSchema.extend({ state: z.literal("fresh") }),
    refusalPosture: appMcpEvidencePostureSchema,
  })
  .strict();

export function appMcpRefusalEnvelopeSchema(
  responseKind:
    | "missing_citation_refusal"
    | "unsupported_evidence_refusal"
    | "stale_evidence_refusal"
    | "prompt_injection_refusal"
    | "data_exfiltration_refusal"
    | "raw_full_file_dump_refusal"
    | "unsafe_action_refusal",
  reason: AppMcpEnvelopeRefusalReason,
  freshnessState: "fresh" | "stale" | "unsupported" | "missing",
) {
  return appMcpBaseEnvelopeSchema
    .extend({
      responseKind: z.literal(responseKind),
      citations: z.array(AppMcpCitationSchema).length(0),
      evidence: z.array(AppMcpEvidenceRefSchema).length(0),
      freshness: AppMcpFreshnessSchema.extend({
        state: z.literal(freshnessState),
      }),
      refusalPosture: appMcpRefusalPostureSchema(reason),
    })
    .strict();
}

export const AppMcpMissingCitationEnvelopeSchema =
  appMcpRefusalEnvelopeSchema("missing_citation_refusal", "missing_citation", "missing");
export const AppMcpUnsupportedEvidenceEnvelopeSchema =
  appMcpRefusalEnvelopeSchema(
    "unsupported_evidence_refusal",
    "unsupported_evidence",
    "unsupported",
  );
export const AppMcpStaleEvidenceEnvelopeSchema = appMcpRefusalEnvelopeSchema(
  "stale_evidence_refusal",
  "stale_evidence",
  "stale",
);
export const AppMcpPromptInjectionEnvelopeSchema =
  appMcpRefusalEnvelopeSchema("prompt_injection_refusal", "prompt_injection", "fresh");
export const AppMcpDataExfiltrationEnvelopeSchema =
  appMcpRefusalEnvelopeSchema("data_exfiltration_refusal", "data_exfiltration", "fresh");
export const AppMcpRawFullFileDumpRefusalEnvelopeSchema =
  appMcpRefusalEnvelopeSchema(
    "raw_full_file_dump_refusal",
    "raw_full_file_dump_request",
    "fresh",
  );
export const AppMcpUnsafeActionEnvelopeSchema = appMcpRefusalEnvelopeSchema(
  "unsafe_action_refusal",
  "unsafe_action",
  "fresh",
);

export const AppMcpRefusalEnvelopeSchema = z.union([
  AppMcpMissingCitationEnvelopeSchema,
  AppMcpUnsupportedEvidenceEnvelopeSchema,
  AppMcpStaleEvidenceEnvelopeSchema,
  AppMcpPromptInjectionEnvelopeSchema,
  AppMcpDataExfiltrationEnvelopeSchema,
  AppMcpRawFullFileDumpRefusalEnvelopeSchema,
  AppMcpUnsafeActionEnvelopeSchema,
]);

export const AppMcpResponseEnvelopeSchema = z.union([
  AppMcpEvidenceEnvelopeSchema,
  AppMcpRefusalEnvelopeSchema,
]);

export type AppMcpEvidenceEnvelope = AppMcpEnvelopeBase & {
  responseKind: "evidence";
  refusalPosture: z.infer<typeof AppMcpRefusalPostureSchema> & {
    refused: false;
    reason: null;
  };
};
export type AppMcpMissingCitationEnvelope = AppMcpSpecificRefusalEnvelope<
  "missing_citation_refusal",
  "missing_citation"
>;
export type AppMcpUnsupportedEvidenceEnvelope = AppMcpSpecificRefusalEnvelope<
  "unsupported_evidence_refusal",
  "unsupported_evidence"
>;
export type AppMcpStaleEvidenceEnvelope = AppMcpSpecificRefusalEnvelope<
  "stale_evidence_refusal",
  "stale_evidence"
>;
export type AppMcpPromptInjectionEnvelope = AppMcpSpecificRefusalEnvelope<
  "prompt_injection_refusal",
  "prompt_injection"
>;
export type AppMcpDataExfiltrationEnvelope = AppMcpSpecificRefusalEnvelope<
  "data_exfiltration_refusal",
  "data_exfiltration"
>;
export type AppMcpRawFullFileDumpRefusalEnvelope =
  AppMcpSpecificRefusalEnvelope<
    "raw_full_file_dump_refusal",
    "raw_full_file_dump_request"
  >;
export type AppMcpUnsafeActionEnvelope = AppMcpSpecificRefusalEnvelope<
  "unsafe_action_refusal",
  "unsafe_action"
>;
export type AppMcpRefusalEnvelope =
  | AppMcpMissingCitationEnvelope
  | AppMcpUnsupportedEvidenceEnvelope
  | AppMcpStaleEvidenceEnvelope
  | AppMcpPromptInjectionEnvelope
  | AppMcpDataExfiltrationEnvelope
  | AppMcpRawFullFileDumpRefusalEnvelope
  | AppMcpUnsafeActionEnvelope;
export type AppMcpResponseEnvelope =
  | AppMcpEvidenceEnvelope
  | AppMcpRefusalEnvelope;

export function buildAppMcpEvidenceEnvelope(): AppMcpEvidenceEnvelope {
  return AppMcpEvidenceEnvelopeSchema.parse({
    ...baseEnvelope("fresh", "local_proof_only"),
    citations: [
      {
        boundedExcerptOnly: true,
        citationId: "synthetic-citation-1",
        sourceAnchorId: "synthetic-anchor-1",
      },
    ],
    evidence: [
      {
        evidenceCardId: "synthetic-evidence-card-1",
        sourceAnchorIds: ["synthetic-anchor-1"],
        syntheticProofOnly: true,
      },
    ],
    refusalPosture: responsePosture(null),
    responseKind: "evidence",
  }) as AppMcpEvidenceEnvelope;
}

export function buildAppMcpRefusalEnvelope(
  reason: AppMcpEnvelopeRefusalReason,
): AppMcpRefusalEnvelope {
  const responseKindByReason = {
    data_exfiltration: "data_exfiltration_refusal",
    missing_citation: "missing_citation_refusal",
    prompt_injection: "prompt_injection_refusal",
    raw_full_file_dump_request: "raw_full_file_dump_refusal",
    stale_evidence: "stale_evidence_refusal",
    unsafe_action: "unsafe_action_refusal",
    unsupported_evidence: "unsupported_evidence_refusal",
  } as const;
  const freshnessByReason = {
    data_exfiltration: "fresh",
    missing_citation: "missing",
    prompt_injection: "fresh",
    raw_full_file_dump_request: "fresh",
    stale_evidence: "stale",
    unsafe_action: "fresh",
    unsupported_evidence: "unsupported",
  } as const;
  const limitationCode =
    reason === "raw_full_file_dump_request"
      ? "raw_full_file_dump_request"
      : reason;

  return AppMcpRefusalEnvelopeSchema.parse({
    ...baseEnvelope(freshnessByReason[reason], limitationCode),
    citations: [],
    evidence: [],
    refusalPosture: responsePosture(reason),
    responseKind: responseKindByReason[reason],
  }) as AppMcpRefusalEnvelope;
}

export function responseEnvelopeRejectsForbiddenFields() {
  const evidenceEnvelope = buildAppMcpEvidenceEnvelope();
  return APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES.every((fieldName) => {
    const topLevel = { ...evidenceEnvelope, [fieldName]: "private" };
    const nested = {
      ...evidenceEnvelope,
      evidence: [{ ...evidenceEnvelope.evidence[0], [fieldName]: "private" }],
    };
    return (
      containsForbiddenResponseField(topLevel) &&
      containsForbiddenResponseField(nested) &&
      !AppMcpResponseEnvelopeSchema.safeParse(topLevel).success &&
      !AppMcpResponseEnvelopeSchema.safeParse(nested).success
    );
  });
}

function baseEnvelope(
  freshnessState: "fresh" | "stale" | "unsupported" | "missing",
  limitationCode: z.infer<typeof AppMcpLimitationSchema>["code"],
) {
  return {
    authorityBoundary: buildAppAuthorityBoundary(),
    forbiddenActions: [...MCP_FORBIDDEN_TOOL_NAMES],
    freshness: {
      checkedAt: "2026-05-09T00:00:00.000Z",
      failClosedIfStale: true,
      state: freshnessState,
    },
    limitations: [
      {
        code: limitationCode,
        summary: "Synthetic in-memory V2G descriptor/envelope proof only.",
      },
    ],
    localProofOnly: true,
    noRuntimeBoundary: buildAppNoRuntimeBoundary(),
    permittedNextActions: [
      {
        action: "request_human_review",
        label: "Review the local proof-only V2G envelope posture.",
      },
    ],
    privacyBoundary: BaseAppPrivacyBoundary,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
  };
}

function responsePosture(reason: AppMcpEnvelopeRefusalReason | null) {
  return {
    failClosed: true,
    noActionTaken: true,
    noToolCallPlanned: true,
    reason,
    refused: reason !== null,
    sourceInstructionsTreatedAsData: true,
  };
}
