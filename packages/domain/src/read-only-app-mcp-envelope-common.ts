import { z } from "zod";
import { AppPrivacyBoundarySchema } from "./read-only-app-mcp-boundaries";
import {
  AppAuthorityBoundarySchema,
  AppNoRuntimeBoundarySchema,
} from "./read-only-app-mcp-runtime";
import {
  AppRefusalReasonSchema,
  McpForbiddenToolSchema,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
  type AppRefusalReason,
} from "./read-only-app-mcp-boundaries";

const trueLiteral = z.literal(true);

export type AppMcpEnvelopeRefusalReason = Exclude<
  AppRefusalReason,
  "conflicting_evidence" | "real_finance_data_public_demo_boundary_violation"
>;

export const APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS = [
  "evidence",
  "freshness",
  "limitations",
  "permittedNextActions",
  "citations",
  "refusalPosture",
  "forbiddenActions",
  "privacyBoundary",
  "noRuntimeBoundary",
  "authorityBoundary",
] as const;

export const APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES = [
  "rawFullText",
  "rawFileText",
  "fullText",
  "fullFileText",
  "fileContents",
  "rawMarkdown",
  "pageTextDump",
  "privateSourceText",
  "private_source_text",
  "credentials",
  "tokens",
  "oauthMaterial",
  "oauth_material",
  "apiKeys",
  "api_keys",
  "objectStoreDumps",
  "object_store_dumps",
  "databaseDumps",
  "database_dumps",
  "providerCredentials",
  "provider_credentials",
] as const;

export const AppMcpEvidenceRefSchema = z
  .object({
    evidenceCardId: z.string().min(1),
    sourceAnchorIds: z.array(z.string().min(1)).min(1),
    syntheticProofOnly: trueLiteral,
  })
  .strict();

export const AppMcpCitationSchema = z
  .object({
    citationId: z.string().min(1),
    sourceAnchorId: z.string().min(1),
    boundedExcerptOnly: trueLiteral,
  })
  .strict();

export const AppMcpFreshnessSchema = z
  .object({
    state: z.enum(["fresh", "stale", "unsupported", "missing"]),
    checkedAt: z.string().datetime(),
    failClosedIfStale: trueLiteral,
  })
  .strict();

export const AppMcpLimitationSchema = z
  .object({
    code: z.enum([
      "local_proof_only",
      "missing_citation",
      "unsupported_evidence",
      "stale_evidence",
      "prompt_injection",
      "data_exfiltration",
      "raw_full_file_dump_request",
      "unsafe_action",
    ]),
    summary: z.string().min(1),
  })
  .strict();

export const AppMcpPermittedNextActionSchema = z
  .object({
    action: z.literal("request_human_review"),
    label: z.string().min(1),
  })
  .strict();

export const AppMcpRefusalPostureSchema = z
  .object({
    failClosed: trueLiteral,
    refused: z.boolean(),
    reason: AppRefusalReasonSchema.nullable(),
    sourceInstructionsTreatedAsData: trueLiteral,
    noActionTaken: trueLiteral,
    noToolCallPlanned: trueLiteral,
  })
  .strict();

export const appMcpEvidencePostureSchema = AppMcpRefusalPostureSchema.extend({
  reason: z.null(),
  refused: z.literal(false),
});

export function appMcpRefusalPostureSchema(
  reason: AppMcpEnvelopeRefusalReason,
) {
  return AppMcpRefusalPostureSchema.extend({
    reason: z.literal(reason),
    refused: z.literal(true),
  });
}

export const appMcpBaseEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    localProofOnly: trueLiteral,
    evidence: z.array(AppMcpEvidenceRefSchema),
    freshness: AppMcpFreshnessSchema,
    limitations: z.array(AppMcpLimitationSchema).min(1),
    permittedNextActions: z.array(AppMcpPermittedNextActionSchema).min(1),
    citations: z.array(AppMcpCitationSchema),
    refusalPosture: AppMcpRefusalPostureSchema,
    forbiddenActions: z.array(McpForbiddenToolSchema).min(1),
    privacyBoundary: AppPrivacyBoundarySchema,
    noRuntimeBoundary: AppNoRuntimeBoundarySchema,
    authorityBoundary: AppAuthorityBoundarySchema,
  })
  .strict();

export type AppMcpEnvelopeBase = {
  schemaVersion: typeof READ_ONLY_APP_MCP_SCHEMA_VERSION;
  localProofOnly: true;
  evidence: Array<z.infer<typeof AppMcpEvidenceRefSchema>>;
  freshness: z.infer<typeof AppMcpFreshnessSchema>;
  limitations: Array<z.infer<typeof AppMcpLimitationSchema>>;
  permittedNextActions: Array<z.infer<typeof AppMcpPermittedNextActionSchema>>;
  citations: Array<z.infer<typeof AppMcpCitationSchema>>;
  refusalPosture: z.infer<typeof AppMcpRefusalPostureSchema>;
  forbiddenActions: Array<z.infer<typeof McpForbiddenToolSchema>>;
  privacyBoundary: z.infer<typeof AppPrivacyBoundarySchema>;
  noRuntimeBoundary: z.infer<typeof AppNoRuntimeBoundarySchema>;
  authorityBoundary: z.infer<typeof AppAuthorityBoundarySchema>;
};

export type AppMcpSpecificRefusalEnvelope<
  Kind extends string,
  Reason extends AppMcpEnvelopeRefusalReason,
> = AppMcpEnvelopeBase & {
  responseKind: Kind;
  evidence: [];
  citations: [];
  refusalPosture: z.infer<typeof AppMcpRefusalPostureSchema> & {
    refused: true;
    reason: Reason;
  };
};

export function containsForbiddenResponseField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsForbiddenResponseField(item));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([key, nested]) =>
        APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES.some(
          (forbidden) =>
            normalizeFieldName(forbidden) === normalizeFieldName(key),
        ) || containsForbiddenResponseField(nested),
    );
  }
  return false;
}

function normalizeFieldName(fieldName: string) {
  return fieldName.toLowerCase().replace(/[^a-z0-9]+/gu, "");
}
