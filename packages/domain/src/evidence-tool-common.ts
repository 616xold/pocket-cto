import { z } from "zod";
import { FinanceCompanyKeySchema } from "./finance-twin";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexIdSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";

export const EVIDENCE_TOOL_SCHEMA_VERSION = "v2c.evidence-tool.v1";

export const AppModeSchema = z.enum([
  "local_proof",
  "internal_developer_mode",
  "future_chatgpt_app_alpha",
]);

export const ToolPermissionSchema = z.enum([
  "read_search",
  "read_fetch",
  "read_inspect",
]);

export const ForbiddenToolActionSchema = z.enum([
  "create_mission",
  "upload_source",
  "sync_source",
  "mutate_source",
  "update_ledger",
  "write_finance_twin_fact",
  "send_report",
  "release_report",
  "circulate_report",
  "approve_report",
  "certify_close",
  "mark_close_complete",
  "sign_off",
  "attest",
  "assure",
  "provider_connect",
  "provider_call",
  "provider_job",
  "contact_customer",
  "contact_vendor",
  "issue_payment_instruction",
  "collect_payment",
  "file_tax",
  "give_legal_advice",
  "give_audit_opinion",
  "generate_finance_advice",
  "generate_external_communication",
  "use_runtime_codex_as_finance_output",
  "run_ocr",
  "run_vector_search",
  "use_openai_file_search",
  "use_page_index",
  "take_autonomous_action",
]);

export const EvidenceToolNameSchema = z.enum([
  "search_evidence",
  "fetch_evidence_card",
  "fetch_source_anchor",
  "fetch_document_map",
  "fetch_source_coverage",
  "fetch_company_posture",
  "fetch_capability_boundaries",
]);

export const EvidenceToolCitationSchema = z.object({
  citationType: z.enum([
    "source_anchor",
    "evidence_card",
    "document_map",
    "source_coverage",
    "finance_twin_ref",
    "cfo_wiki_ref",
    "mission_answer_ref",
    "proof_bundle_ref",
    "capability_boundary",
  ]),
  id: z.string().min(1),
  sourceAnchorId: EvidenceIndexIdSchema.nullable().default(null),
  sourceId: z.string().uuid().nullable().default(null),
  sourceSnapshotId: z.string().uuid().nullable().default(null),
  checksumSha256: z.string().min(1).nullable().default(null),
  locator: z.string().min(1).nullable().default(null),
  summary: z.string().min(1),
});

export const RedactionRecordSchema = z.object({
  applied: z.boolean(),
  reason: z.string().min(1),
  pattern: z.enum([
    "secret",
    "credential",
    "token",
    "private_finance_identifier",
  ]),
});

export const ExcerptPolicySchema = z.object({
  maxCharacters: z.number().int().positive(),
  fullFileDumpsAllowed: z.literal(false),
  sourceTextTreatedAsUntrustedData: z.literal(true),
  requireCitation: z.literal(true),
});

export const CitationPolicySchema = z.object({
  sourceAnchorRequiredForPositiveResults: z.literal(true),
  unsupportedResultsExplainReason: z.literal(true),
  distinguishDerivedRefs: z.literal(true),
});

export const RedactionPolicySchema = z.object({
  secretsRedacted: z.literal(true),
  credentialsRedacted: z.literal(true),
  tokensRedacted: z.literal(true),
  privateFinanceIdentifiersRedacted: z.literal(true),
});

export const PromptInjectionBoundarySchema = z.object({
  sourceTextTreatedAsData: z.literal(true),
  sourceInstructionsIgnored: z.literal(true),
  externalUrlFetchingAllowed: z.literal(false),
});

export const ToolSafetyBoundarySchema = z.object({
  readOnly: z.literal(true),
  allowedPermissions: z.array(ToolPermissionSchema),
  forbiddenActions: z.array(ForbiddenToolActionSchema),
  excerptPolicy: ExcerptPolicySchema,
  citationPolicy: CitationPolicySchema,
  redactionPolicy: RedactionPolicySchema,
  promptInjectionBoundary: PromptInjectionBoundarySchema,
  localInternalOnly: z.literal(true),
});

export const AgentQueryAuditEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
  appMode: AppModeSchema,
  toolName: EvidenceToolNameSchema,
  companyKey: FinanceCompanyKeySchema,
  normalizedQuery: z.string().min(1).nullable().default(null),
  artifactIds: z.array(z.string().min(1)).default([]),
  sourceAnchorIds: z.array(EvidenceIndexIdSchema).default([]),
  excerptCharacterCount: z.number().int().nonnegative(),
  redactionCount: z.number().int().nonnegative(),
  unsupportedReason: z.string().min(1).nullable().default(null),
  forbiddenRequestBlocked: z.boolean(),
});

export const EvidenceToolResponseSchema = z.object({
  schemaVersion: z.literal(EVIDENCE_TOOL_SCHEMA_VERSION),
  toolName: EvidenceToolNameSchema,
  appMode: AppModeSchema,
  companyKey: FinanceCompanyKeySchema,
  ok: z.boolean(),
  result: z.unknown().nullable(),
  evidence: z.array(EvidenceToolCitationSchema),
  freshness: EvidenceIndexFreshnessPostureSchema,
  limitations: z.array(EvidenceIndexLimitationPostureSchema),
  capabilityBoundaries: z.array(EvidenceIndexLimitationPostureSchema),
  permittedNextActions: z.array(PermittedNextActionSchema),
  forbiddenActions: z.array(ForbiddenToolActionSchema),
  citations: z.array(EvidenceToolCitationSchema),
  redactions: z.array(RedactionRecordSchema),
  audit: AgentQueryAuditEventSchema,
  unsupportedReason: z.string().min(1).nullable().default(null),
});

export const ReadOnlyToolDescriptorSchema = z.object({
  name: EvidenceToolNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  readOnly: z.literal(true),
  permissions: z.array(ToolPermissionSchema).min(1),
  safetyBoundary: ToolSafetyBoundarySchema,
});

export const ReadOnlyToolManifestSchema = z.object({
  schemaVersion: z.literal(EVIDENCE_TOOL_SCHEMA_VERSION),
  appModes: z.array(AppModeSchema),
  localInternalOnly: z.literal(true),
  tools: z.array(ReadOnlyToolDescriptorSchema).min(1),
  forbiddenActions: z.array(ForbiddenToolActionSchema).min(1),
  noWriteToolsRegistered: z.literal(true),
  noMcpServerStarted: z.literal(true),
});

export type AppMode = z.infer<typeof AppModeSchema>;
export type ToolPermission = z.infer<typeof ToolPermissionSchema>;
export type ForbiddenToolAction = z.infer<typeof ForbiddenToolActionSchema>;
export type EvidenceToolName = z.infer<typeof EvidenceToolNameSchema>;
export type EvidenceToolCitation = z.infer<
  typeof EvidenceToolCitationSchema
>;
export type RedactionRecord = z.infer<typeof RedactionRecordSchema>;
export type ExcerptPolicy = z.infer<typeof ExcerptPolicySchema>;
export type CitationPolicy = z.infer<typeof CitationPolicySchema>;
export type RedactionPolicy = z.infer<typeof RedactionPolicySchema>;
export type PromptInjectionBoundary = z.infer<
  typeof PromptInjectionBoundarySchema
>;
export type ToolSafetyBoundary = z.infer<typeof ToolSafetyBoundarySchema>;
export type AgentQueryAuditEvent = z.infer<typeof AgentQueryAuditEventSchema>;
export type EvidenceToolResponse<T> = Omit<
  z.infer<typeof EvidenceToolResponseSchema>,
  "result"
> & {
  result: T | null;
};
export type ReadOnlyToolDescriptor = z.infer<
  typeof ReadOnlyToolDescriptorSchema
>;
export type ReadOnlyToolManifest = z.infer<typeof ReadOnlyToolManifestSchema>;
