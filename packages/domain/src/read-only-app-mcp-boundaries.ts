import { z } from "zod";
import { BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST } from "./bounded-llm-common";
import type { EvidenceToolName } from "./evidence-tool-common";

export const READ_ONLY_APP_MCP_SCHEMA_VERSION = "v2g.read-only-app-mcp.v1";

export const MCP_TOOL_ALLOWLIST = [
  ...BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
] as const satisfies readonly EvidenceToolName[];

export const McpToolNameSchema = z.enum(MCP_TOOL_ALLOWLIST);

export const McpToolAllowlistSchema = z.tuple([
  z.literal("search_evidence"),
  z.literal("fetch_evidence_card"),
  z.literal("fetch_source_anchor"),
  z.literal("fetch_document_map"),
  z.literal("fetch_source_coverage"),
  z.literal("fetch_company_posture"),
  z.literal("fetch_capability_boundaries"),
]);

export const MCP_FORBIDDEN_TOOL_NAMES = [
  "create",
  "update",
  "delete",
  "create_mission",
  "upload_source",
  "sync_source",
  "mutate_source",
  "rewrite_source",
  "update_ledger",
  "write_finance_twin_fact",
  "write_accounting_record",
  "write_bank_record",
  "create_report",
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
  "create_provider_job",
  "contact_customer",
  "contact_vendor",
  "send_customer_email",
  "issue_payment_instruction",
  "collect_payment",
  "pay",
  "move_money",
  "file_tax",
  "give_legal_advice",
  "give_audit_opinion",
  "generate_finance_advice",
  "generate_external_communication",
  "release_external_communication",
  "use_runtime_codex_as_finance_output",
  "run_ocr",
  "run_vector_search",
  "use_openai_file_search",
  "use_page_index",
  "call_openai_api",
  "call_model",
  "use_hosted_tool",
  "deploy_public_app",
  "start_mcp_server",
  "start_remote_mcp_server",
  "create_endpoint",
  "add_route",
  "add_schema_migration",
  "create_oauth_flow",
  "submit_app",
  "create_apps_sdk_ui",
  "take_autonomous_action",
] as const;

export const McpForbiddenToolSchema = z.enum(MCP_FORBIDDEN_TOOL_NAMES);

export type McpToolName = z.infer<typeof McpToolNameSchema>;
export type McpToolAllowlist = z.infer<typeof McpToolAllowlistSchema>;
export type McpForbiddenTool = z.infer<typeof McpForbiddenToolSchema>;

export const MCP_FORBIDDEN_TOOL_ALIASES: ReadonlyArray<{
  canonical: McpForbiddenTool;
  aliases: readonly string[];
}> = [
  {
    canonical: "create_mission",
    aliases: ["start mission", "open mission", "launch mission"],
  },
  {
    canonical: "upload_source",
    aliases: ["add source", "import source", "ingest source", "send file"],
  },
  {
    canonical: "mutate_source",
    aliases: ["change source", "edit source", "modify source"],
  },
  {
    canonical: "update_ledger",
    aliases: ["write ledger", "adjust ledger", "post journal entry"],
  },
  {
    canonical: "write_finance_twin_fact",
    aliases: ["write finance twin", "change finance fact"],
  },
  {
    canonical: "send_report",
    aliases: ["email report", "share report", "send memo"],
  },
  {
    canonical: "release_report",
    aliases: ["publish report", "release memo", "issue report"],
  },
  {
    canonical: "approve_report",
    aliases: ["approve memo", "mark approved", "approval"],
  },
  {
    canonical: "provider_call",
    aliases: ["call provider", "connect bank", "provider integration"],
  },
  {
    canonical: "deploy_public_app",
    aliases: ["deploy app", "publish app", "production deploy"],
  },
  {
    canonical: "start_remote_mcp_server",
    aliases: ["remote mcp", "host mcp", "mcp deployment"],
  },
  {
    canonical: "create_endpoint",
    aliases: ["add endpoint", "create route", "api route"],
  },
  {
    canonical: "create_oauth_flow",
    aliases: ["oauth", "connect oauth", "authorization flow"],
  },
  {
    canonical: "submit_app",
    aliases: ["app submission", "submit to openai", "publish chatgpt app"],
  },
  {
    canonical: "contact_customer",
    aliases: ["customer contact", "email customer", "message customer"],
  },
  {
    canonical: "issue_payment_instruction",
    aliases: ["pay vendor", "make payment", "wire funds"],
  },
  {
    canonical: "file_tax",
    aliases: ["tax filing", "file tax", "file return", "submit tax"],
  },
  {
    canonical: "give_legal_advice",
    aliases: ["legal advice", "legal opinion"],
  },
  {
    canonical: "give_audit_opinion",
    aliases: ["audit opinion", "assurance opinion"],
  },
  {
    canonical: "generate_finance_advice",
    aliases: ["finance advice", "recommend action", "advise cfo"],
  },
  {
    canonical: "take_autonomous_action",
    aliases: ["autonomous action", "do it automatically", "remediate"],
  },
];

export function normalizeMcpToolCandidate(candidate: string): string {
  return candidate
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

function compact(candidate: string): string {
  return normalizeMcpToolCandidate(candidate).replace(/_/gu, "");
}

export function classifyMcpToolCandidate(candidate: string): {
  allowedReadOnlyTool: boolean;
  canonicalForbiddenTool: McpForbiddenTool | null;
  forbidden: boolean;
  normalized: string;
} {
  const exactCandidate = candidate.trim();
  const normalized = normalizeMcpToolCandidate(candidate);
  const compactCandidate = compact(candidate);
  const exactForbidden = MCP_FORBIDDEN_TOOL_NAMES.find(
    (tool) => tool === normalized,
  );
  const aliasForbidden = MCP_FORBIDDEN_TOOL_ALIASES.find((entry) =>
    entry.aliases.some((alias) => compactCandidate.includes(compact(alias))),
  );
  const canonicalForbiddenTool =
    exactForbidden ?? aliasForbidden?.canonical ?? null;

  return {
    allowedReadOnlyTool: MCP_TOOL_ALLOWLIST.includes(
      exactCandidate as McpToolName,
    ),
    canonicalForbiddenTool,
    forbidden: canonicalForbiddenTool !== null,
    normalized,
  };
}

export function isMcpToolAllowed(candidate: string): candidate is McpToolName {
  const classification = classifyMcpToolCandidate(candidate);
  return classification.allowedReadOnlyTool && !classification.forbidden;
}

export const APP_REFUSAL_REASONS = [
  "missing_citation",
  "unsupported_evidence",
  "stale_evidence",
  "conflicting_evidence",
  "unsafe_action",
  "prompt_injection",
  "data_exfiltration",
  "raw_full_file_dump_request",
  "real_finance_data_public_demo_boundary_violation",
] as const;

export const AppRefusalReasonSchema = z.enum(APP_REFUSAL_REASONS);
export type AppRefusalReason = z.infer<typeof AppRefusalReasonSchema>;

export const AppRequiredRefusalReasonsSchema = z.tuple([
  z.literal("missing_citation"),
  z.literal("unsupported_evidence"),
  z.literal("stale_evidence"),
  z.literal("conflicting_evidence"),
  z.literal("unsafe_action"),
  z.literal("prompt_injection"),
  z.literal("data_exfiltration"),
  z.literal("raw_full_file_dump_request"),
  z.literal("real_finance_data_public_demo_boundary_violation"),
]);

export const AppPromptInjectionBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    sourceTextTrust: z.literal("untrusted_data"),
    userTextTrust: z.literal("untrusted_data"),
    toolOutputTrust: z.literal("untrusted_data"),
    modelVisibleContextTrust: z.literal("untrusted_data"),
    appMcpMetadataTrust: z.literal("untrusted_data"),
    sourceInstructionsCanAuthorizeTools: z.literal(false),
    userTextCanWidenScope: z.literal(false),
    toolOutputCanBypassBoundaries: z.literal(false),
    explicitFuturePlanRequiredForTrustedInputs: z.literal(true),
  })
  .strict();

export const APP_PRIVACY_FORBIDDEN_ARTIFACTS = [
  "raw_full_file_dumps",
  "real_finance_public_demo_data",
  "copied_or_lightly_anonymized_real_finance_data",
  "credentials",
  "tokens",
  "oauth_material",
  "provider_credentials",
  "api_keys",
  "private_screenshots",
  "private_source_text",
  "object_store_dumps",
  "database_dumps",
] as const;

export const AppPrivacyForbiddenArtifactSchema = z.enum(
  APP_PRIVACY_FORBIDDEN_ARTIFACTS,
);

export const AppPrivacyBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    forbiddenArtifacts: z.tuple([
      z.literal("raw_full_file_dumps"),
      z.literal("real_finance_public_demo_data"),
      z.literal("copied_or_lightly_anonymized_real_finance_data"),
      z.literal("credentials"),
      z.literal("tokens"),
      z.literal("oauth_material"),
      z.literal("provider_credentials"),
      z.literal("api_keys"),
      z.literal("private_screenshots"),
      z.literal("private_source_text"),
      z.literal("object_store_dumps"),
      z.literal("database_dumps"),
    ]),
    boundedCitedExcerptsOnly: z.literal(true),
    noRawFullFileDumps: z.literal(true),
    noRealFinanceDataInPublicDemo: z.literal(true),
    noCopiedOrLightlyAnonymizedRealFinanceData: z.literal(true),
  })
  .strict();

export type AppPromptInjectionBoundary = z.infer<
  typeof AppPromptInjectionBoundarySchema
>;
export type AppPrivacyBoundary = z.infer<typeof AppPrivacyBoundarySchema>;
