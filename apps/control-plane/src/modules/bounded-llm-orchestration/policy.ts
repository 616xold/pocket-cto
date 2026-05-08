import { createHash } from "node:crypto";
import {
  BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST,
  BoundedLlmForbiddenActionSchema,
  type BoundedLlmAuditEvent,
  type BoundedLlmForbiddenAction,
  type BoundedLlmResponseKind,
  type BoundedLlmToolName,
  type CitationRequirement,
  type EvidenceIndexFreshnessPosture,
  type EvidenceIndexLimitationPosture,
  type PermittedNextAction,
} from "@pocket-cto/domain";

export const V2E_FORBIDDEN_ACTIONS: BoundedLlmForbiddenAction[] = [
  ...BoundedLlmForbiddenActionSchema.options,
];

const UNSAFE_ACTION_PATTERNS: Array<{
  action: BoundedLlmForbiddenAction;
  pattern: RegExp;
}> = [
  { action: "create_mission", pattern: /\b(create|open)\s+a?\s*mission\b/u },
  { action: "upload_source", pattern: /\b(upload|attach)\s+(a\s+)?source\b/u },
  { action: "sync_source", pattern: /\b(sync|ingest)\s+(a\s+)?source\b/u },
  { action: "mutate_source", pattern: /\b(mutate|rewrite|edit)\s+(raw\s+)?source\b/u },
  { action: "update_ledger", pattern: /\b(update|adjust)\s+(the\s+)?ledger\b/u },
  { action: "write_finance_twin_fact", pattern: /\bwrite\b.*\bfinance twin\b/u },
  { action: "write_accounting_record", pattern: /\bwrite\b.*\baccounting\b/u },
  { action: "write_bank_record", pattern: /\bwrite\b.*\bbank\b/u },
  { action: "send_report", pattern: /\b(send|email|slack)\b.*\breport\b/u },
  { action: "release_report", pattern: /\b(release|publish)\b.*\breport\b/u },
  { action: "circulate_report", pattern: /\bcirculate\b.*\breport\b/u },
  { action: "approve_report", pattern: /\bapprove\b.*\breport\b/u },
  { action: "certify_close", pattern: /\bcertif(y|ication)\b.*\bclose\b/u },
  { action: "mark_close_complete", pattern: /\bmark\b.*\bclose\b.*\bcomplete\b/u },
  { action: "sign_off", pattern: /\bsign[- ]?off\b/u },
  { action: "attest", pattern: /\battest\b/u },
  { action: "assure", pattern: /\bassurance|assure\b/u },
  { action: "provider_call", pattern: /\b(call|connect|run)\b.*\bprovider\b/u },
  { action: "create_provider_job", pattern: /\bcreate\b.*\bprovider\b.*\bjob\b/u },
  { action: "contact_customer", pattern: /\bcontact\b.*\bcustomer\b/u },
  { action: "contact_vendor", pattern: /\bcontact\b.*\bvendor\b/u },
  { action: "issue_payment_instruction", pattern: /\bpayment instruction\b/u },
  { action: "collect_payment", pattern: /\bcollect\b.*\bpayment\b/u },
  { action: "pay", pattern: /\bpay\b.*\b(vendor|invoice|bill)\b/u },
  { action: "move_money", pattern: /\bmove money\b/u },
  { action: "file_tax", pattern: /\b(file|submit)\b.*\btax\b/u },
  { action: "give_legal_advice", pattern: /\blegal advice\b/u },
  { action: "give_audit_opinion", pattern: /\baudit opinion\b/u },
  { action: "generate_finance_advice", pattern: /\b(give|generate)\b.*\badvice\b/u },
  {
    action: "generate_external_communication",
    pattern: /\b(generate|draft)\b.*\b(customer|vendor|external)\b/u,
  },
  { action: "use_runtime_codex_as_finance_output", pattern: /\bruntime[- ]codex\b/u },
  { action: "run_ocr", pattern: /\b(run|use)\b.*\bocr\b/u },
  { action: "run_vector_search", pattern: /\b(run|use)\b.*\bvector\b/u },
  { action: "use_openai_file_search", pattern: /\b(openai|file)[- ]search\b/u },
  { action: "use_page_index", pattern: /\bpageindex|page index\b/u },
  { action: "take_autonomous_action", pattern: /\bautonomous|without human\b/u },
  { action: "deploy_public_app", pattern: /\bdeploy\b.*\b(public|app|mcp)\b/u },
];

export function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/gu, " ").toLowerCase();
}

export function detectUnsafeActions(
  normalizedQuery: string,
): BoundedLlmForbiddenAction[] {
  const matches = new Set<BoundedLlmForbiddenAction>();
  for (const entry of UNSAFE_ACTION_PATTERNS) {
    if (entry.pattern.test(normalizedQuery)) matches.add(entry.action);
  }
  return [...matches];
}

export function defaultCitationRequirements(): CitationRequirement[] {
  return [
    {
      acceptedCitationTypes: [
        "source_anchor",
        "finance_twin_ref",
        "cfo_wiki_ref",
        "mission_answer_ref",
        "proof_bundle_ref",
      ],
      claimKind: "positive_claim",
      positiveClaimRequiresCitation: true,
      requirementId: "citation:positive-claim",
      sourceAnchorOrAcceptedDerivedRefRequired: true,
      summary:
        "Every positive claim must cite a SourceAnchor or accepted derived ref from selected evidence.",
    },
  ];
}

export function planFreshness(
  checkedAt: string,
): EvidenceIndexFreshnessPosture {
  return {
    checkedAt,
    compiledAt: null,
    extractedAt: null,
    sourceCapturedAt: null,
    state: "missing",
    summary:
      "V2E planning has not selected evidence yet; V2C tool responses must provide freshness before any summary.",
  };
}

export function boundaryLimitations(): EvidenceIndexLimitationPosture[] {
  return [
    {
      affectedAnchorIds: [],
      affectedSourceIds: [],
      code: "not_source_truth",
      severity: "blocking",
      summary:
        "V2E orchestration is planning/refusal/validation only and is not raw source, Finance Twin, CFO Wiki, EvidenceIndex, or V2C tool truth.",
    },
  ];
}

export function humanReviewAction(targetId: string): PermittedNextAction {
  return {
    action: "request_human_review",
    label: "Request human review of evidence, limitations, and next steps.",
    targetId,
  };
}

export function buildAuditEvent(input: {
  citationCount?: number;
  companyKey: string;
  forbiddenActionRequested?: string | null;
  forbiddenActionsBlocked?: BoundedLlmForbiddenAction[];
  normalizedQuery: string;
  outputSchemaValid?: boolean;
  plannedToolNames?: BoundedLlmToolName[];
  redactionCount?: number;
  refusalReason?: string | null;
  responseKind: BoundedLlmResponseKind;
  selectedArtifactIds?: string[];
  sourceAnchorIds?: string[];
  timestamp: string;
}): BoundedLlmAuditEvent {
  const plannedToolNames = input.plannedToolNames ?? [];
  const selectedArtifactIds = input.selectedArtifactIds ?? [];
  const sourceAnchorIds = input.sourceAnchorIds ?? [];
  const forbiddenActionsBlocked = input.forbiddenActionsBlocked ?? [];
  const id = createHash("sha256")
    .update(
      [
        input.companyKey,
        input.normalizedQuery,
        input.responseKind,
        plannedToolNames.join(","),
        selectedArtifactIds.join(","),
        input.timestamp,
      ].join(":"),
    )
    .digest("hex")
    .slice(0, 16);

  return {
    citationCount: input.citationCount ?? 0,
    companyKey: input.companyKey,
    forbiddenActionRequested: input.forbiddenActionRequested ?? null,
    forbiddenActionsBlocked,
    id: `v2e-audit:${id}`,
    localProofOnly: true,
    noModelCalls: true,
    noOpenAiApiCalls: true,
    noRuntimePersistence: true,
    normalizedQuery: input.normalizedQuery,
    outputSchemaValid: input.outputSchemaValid ?? true,
    plannedToolNames,
    redactionCount: input.redactionCount ?? 0,
    refusalReason: input.refusalReason ?? null,
    responseKind: input.responseKind,
    selectedArtifactIds,
    sourceAnchorIds,
    timestamp: input.timestamp,
  };
}

export function fixedReadOnlyToolNames(): BoundedLlmToolName[] {
  return [...BOUNDED_LLM_READ_ONLY_TOOL_ALLOWLIST];
}
