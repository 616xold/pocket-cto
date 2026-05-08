import {
  EVIDENCE_TOOL_SCHEMA_VERSION,
  ReadOnlyToolManifestSchema,
  type ForbiddenToolAction,
  type ReadOnlyToolManifest,
  type ToolPermission,
} from "@pocket-cto/domain";

export const V2C_FORBIDDEN_ACTIONS: ForbiddenToolAction[] = [
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
];

const EXCERPT_POLICY = {
  fullFileDumpsAllowed: false,
  maxCharacters: 240,
  requireCitation: true,
  sourceTextTreatedAsUntrustedData: true,
} as const;

const SAFETY_BOUNDARY = {
  citationPolicy: {
    distinguishDerivedRefs: true,
    sourceAnchorRequiredForPositiveResults: true,
    unsupportedResultsExplainReason: true,
  },
  excerptPolicy: EXCERPT_POLICY,
  forbiddenActions: V2C_FORBIDDEN_ACTIONS,
  localInternalOnly: true,
  promptInjectionBoundary: {
    externalUrlFetchingAllowed: false,
    sourceInstructionsIgnored: true,
    sourceTextTreatedAsData: true,
  },
  readOnly: true,
  redactionPolicy: {
    credentialsRedacted: true,
    privateFinanceIdentifiersRedacted: true,
    secretsRedacted: true,
    tokensRedacted: true,
  },
} as const;

const TOOL_DESCRIPTORS: Array<{
  name: ReadOnlyToolManifest["tools"][number]["name"];
  title: string;
  description: string;
  permissions: ToolPermission[];
}> = [
  {
    description: "Search existing EvidenceIndex artifacts only.",
    name: "search_evidence",
    permissions: ["read_search"],
    title: "Search Evidence",
  },
  {
    description: "Fetch one existing EvidenceCard by id.",
    name: "fetch_evidence_card",
    permissions: ["read_fetch"],
    title: "Fetch Evidence Card",
  },
  {
    description: "Fetch one existing SourceAnchor with bounded excerpt data.",
    name: "fetch_source_anchor",
    permissions: ["read_fetch"],
    title: "Fetch Source Anchor",
  },
  {
    description: "Fetch one existing DocumentMap by id or source id.",
    name: "fetch_document_map",
    permissions: ["read_fetch"],
    title: "Fetch Document Map",
  },
  {
    description: "Inspect read-only SourceCoverageMatrix posture.",
    name: "fetch_source_coverage",
    permissions: ["read_inspect"],
    title: "Fetch Source Coverage",
  },
  {
    description: "Inspect structured company evidence posture references.",
    name: "fetch_company_posture",
    permissions: ["read_inspect"],
    title: "Fetch Company Posture",
  },
  {
    description: "Inspect read-only capability and forbidden-action posture.",
    name: "fetch_capability_boundaries",
    permissions: ["read_inspect"],
    title: "Fetch Capability Boundaries",
  },
];

export function buildReadOnlyToolManifest(): ReadOnlyToolManifest {
  return ReadOnlyToolManifestSchema.parse({
    appModes: [
      "local_proof",
      "internal_developer_mode",
      "future_chatgpt_app_alpha",
    ],
    forbiddenActions: V2C_FORBIDDEN_ACTIONS,
    localInternalOnly: true,
    noMcpServerStarted: true,
    noWriteToolsRegistered: true,
    schemaVersion: EVIDENCE_TOOL_SCHEMA_VERSION,
    tools: TOOL_DESCRIPTORS.map((tool) => ({
      ...tool,
      readOnly: true,
      safetyBoundary: {
        ...SAFETY_BOUNDARY,
        allowedPermissions: tool.permissions,
      },
    })),
  });
}

export function isV2CForbiddenAction(
  action: string,
): action is ForbiddenToolAction {
  return (V2C_FORBIDDEN_ACTIONS as readonly string[]).includes(action);
}

export function isV2CReadOnlyToolName(
  action: string,
): action is ReadOnlyToolManifest["tools"][number]["name"] {
  return TOOL_DESCRIPTORS.some((tool) => tool.name === action);
}
