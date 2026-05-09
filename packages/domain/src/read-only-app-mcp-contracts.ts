import { z } from "zod";
import {
  EvidenceIndexFreshnessPostureSchema,
  EvidenceIndexLimitationPostureSchema,
  PermittedNextActionSchema,
} from "./evidence-index-common";
import {
  AppPromptInjectionBoundarySchema,
  AppRequiredRefusalReasonsSchema,
  AppPrivacyBoundarySchema,
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
  McpForbiddenToolSchema,
  McpToolAllowlistSchema,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
} from "./read-only-app-mcp-boundaries";
import {
  AppAuthorityBoundarySchema,
  AppNoRuntimeBoundarySchema,
} from "./read-only-app-mcp-runtime";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const APP_RESPONSE_REQUIRED_FIELDS = [
  "evidence",
  "freshness",
  "limitations",
  "permittedNextActions",
  "citations",
  "refusalPosture",
  "forbiddenActions",
] as const;

export const AppResponseRequiredFieldsSchema = z.tuple([
  z.literal("evidence"),
  z.literal("freshness"),
  z.literal("limitations"),
  z.literal("permittedNextActions"),
  z.literal("citations"),
  z.literal("refusalPosture"),
  z.literal("forbiddenActions"),
]);

export const ReadOnlyChatGptAppPlanSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    planKind: z.literal("ReadOnlyChatGptAppPlan"),
    contractOnly: trueLiteral,
    localProofOnly: trueLiteral,
    publicChatGptAppImplemented: falseLiteral,
    appsSdkUiImplemented: falseLiteral,
    oauthImplemented: falseLiteral,
    appSubmissionStarted: falseLiteral,
    openAiApiCallsAllowed: falseLiteral,
    modelCallsAllowed: falseLiteral,
    hostedToolsAllowed: falseLiteral,
    allowedTools: McpToolAllowlistSchema,
    forbiddenTools: z.array(McpForbiddenToolSchema).min(1),
    authorityBoundary: AppAuthorityBoundarySchema,
    responseRequiredFields: AppResponseRequiredFieldsSchema,
    noRuntimeBoundary: AppNoRuntimeBoundarySchema,
  })
  .strict();

export const ReadOnlyMcpServerPlanSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    planKind: z.literal("ReadOnlyMcpServerPlan"),
    contractOnly: trueLiteral,
    localProofOnly: trueLiteral,
    serverImplemented: falseLiteral,
    remoteDeploymentImplemented: falseLiteral,
    endpointsImplemented: falseLiteral,
    toolAllowlist: McpToolAllowlistSchema,
    forbiddenTools: z.array(McpForbiddenToolSchema).min(1),
    noMcpServerRuntime: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
  })
  .strict();

export const AppEvidenceQuerySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    queryKind: z.literal("AppEvidenceQuery"),
    queryText: z.string().min(1),
    readsEvidenceMetadataOnly: trueLiteral,
    boundedExcerptsOnly: trueLiteral,
    maxExcerptCharacters: z.number().int().positive().max(500),
    rawFullFileDumpsAllowed: falseLiteral,
    modelCallsAllowed: falseLiteral,
    openAiApiCallsAllowed: falseLiteral,
    vectorFileSearchAllowed: falseLiteral,
    requiresCitations: trueLiteral,
    responseRequiredFields: AppResponseRequiredFieldsSchema,
  })
  .strict();

export const AppEvidenceFetchSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    fetchKind: z.enum(["evidence_card", "source_anchor", "document_map"]),
    artifactId: z.string().min(1),
    existingArtifactOnly: trueLiteral,
    boundedExcerptsOnly: trueLiteral,
    rawFullFileDumpsAllowed: falseLiteral,
    sourceMutationAllowed: falseLiteral,
    requiresCitations: trueLiteral,
    responseRequiredFields: AppResponseRequiredFieldsSchema,
  })
  .strict();

export const AppSourceCoverageFetchSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    fetchKind: z.literal("source_coverage"),
    existingCoverageOnly: trueLiteral,
    returnsFreshnessPosture: trueLiteral,
    returnsUnsupportedMissingStalePosture: trueLiteral,
    createsSourceCoverage: falseLiteral,
    mutatesSourcePacks: falseLiteral,
    freshness: EvidenceIndexFreshnessPostureSchema,
    limitations: z.array(EvidenceIndexLimitationPostureSchema),
  })
  .strict();

export const AppCapabilityBoundaryFetchSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    fetchKind: z.literal("capability_boundaries"),
    allowedTools: McpToolAllowlistSchema,
    forbiddenTools: z.array(McpForbiddenToolSchema).min(1),
    returnsLimitations: trueLiteral,
    returnsForbiddenActions: trueLiteral,
    returnsPermittedNextActions: trueLiteral,
    permittedNextActions: z.array(PermittedNextActionSchema).min(1),
    noWriteOrActionTools: trueLiteral,
  })
  .strict();

export const AppRefusalPostureSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    failClosed: trueLiteral,
    requiredFailClosedReasons: AppRequiredRefusalReasonsSchema,
    missingCitationRefuses: trueLiteral,
    unsupportedEvidenceRefuses: trueLiteral,
    staleEvidenceRefuses: trueLiteral,
    conflictingEvidenceRefuses: trueLiteral,
    unsafeActionRefuses: trueLiteral,
    promptInjectionRefuses: trueLiteral,
    dataExfiltrationRefuses: trueLiteral,
    rawFullFileDumpRequestRefuses: trueLiteral,
    realFinanceDataPublicDemoBoundaryRefuses: trueLiteral,
  })
  .strict();

export const AppOAuthDeferredBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    oauthImplemented: falseLiteral,
    oauthDeferred: trueLiteral,
    requiresLaterThreatModel: trueLiteral,
    requiresLaterFinancePlan: trueLiteral,
  })
  .strict();

export const AppSubmissionDeferredBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    appSubmissionStarted: falseLiteral,
    appSubmissionDeferred: trueLiteral,
    requiresLocalProofGreen: trueLiteral,
    requiresV2fBenchmarkPostureGreen: trueLiteral,
    requiresSecurityDocsGreen: trueLiteral,
    requiresPrivacyDocsGreen: trueLiteral,
    requiresLaterAppSubmissionFinancePlan: trueLiteral,
  })
  .strict();

export const AppProviderCertificationDeferredBoundarySchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    providerIntegrationDeferred: trueLiteral,
    certificationDeferred: trueLiteral,
    deliveryDeferred: trueLiteral,
    legalAuditTaxAdviceDeferred: trueLiteral,
    paymentDeferred: trueLiteral,
    customerContactDeferred: trueLiteral,
    externalCommunicationsDeferred: trueLiteral,
  })
  .strict();

export const AppProofPlanSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    proofKind: z.literal("AppProofPlan"),
    directProofCommand: z.literal("tools/read-only-chatgpt-app-mcp-proof.mjs"),
    machineReadableJson: trueLiteral,
    noPackageScriptOrSmokeAlias: trueLiteral,
    inMemorySyntheticExamplesOnly: trueLiteral,
    provesExactAllowlist: trueLiteral,
    provesForbiddenTools: trueLiteral,
    provesRefusalPrivacyNoRuntimeBoundaries: trueLiteral,
    provesNoOpenAiApiOrModelCalls: trueLiteral,
    provesNoFixturesDatasetsSampleDataOrSourcePacks: trueLiteral,
  })
  .strict();

export const APP_THREAT_MODEL_QUESTIONS = [
  "Which exact read-only tools are exposed, and how is the allowlist enforced outside prompts?",
  "How are source text, user text, tool output, model-visible context, and app/MCP metadata treated as untrusted data?",
  "How are citations, bounded excerpts, freshness, limitations, and permitted next actions guaranteed?",
  "How are missing citations, unsupported evidence, stale evidence, conflicting evidence, and unsafe actions refused?",
  "How are prompt injection, data exfiltration, and raw full-file dump requests refused?",
  "How is no-real-finance-data posture preserved for any public demo or community-facing proof?",
  "What redaction posture applies before any app/MCP output leaves local proof context?",
  "What logs or audit events are safe without storing sensitive source text?",
  "What must happen before remote endpoints, OAuth, Apps SDK UI, or app submission are allowed?",
  "How is provider, certification, delivery, payment, customer contact, legal, audit, and tax scope blocked?",
] as const;

export const AppThreatModelQuestionsSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    contractOnlyQuestionList: trueLiteral,
    implementationStarted: falseLiteral,
    questions: z.tuple([
      z.literal(APP_THREAT_MODEL_QUESTIONS[0]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[1]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[2]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[3]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[4]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[5]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[6]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[7]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[8]),
      z.literal(APP_THREAT_MODEL_QUESTIONS[9]),
    ]),
  })
  .strict();

export function baseForbiddenTools() {
  return [...MCP_FORBIDDEN_TOOL_NAMES];
}

export function baseAllowedTools() {
  return [...MCP_TOOL_ALLOWLIST];
}

export const BaseAppPromptInjectionBoundary =
  AppPromptInjectionBoundarySchema.parse({
    appMcpMetadataTrust: "untrusted_data",
    explicitFuturePlanRequiredForTrustedInputs: true,
    modelVisibleContextTrust: "untrusted_data",
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    sourceInstructionsCanAuthorizeTools: false,
    sourceTextTrust: "untrusted_data",
    toolOutputCanBypassBoundaries: false,
    toolOutputTrust: "untrusted_data",
    userTextCanWidenScope: false,
    userTextTrust: "untrusted_data",
  });

export const BaseAppPrivacyBoundary = AppPrivacyBoundarySchema.parse({
  boundedCitedExcerptsOnly: true,
  forbiddenArtifacts: [
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
  ],
  noCopiedOrLightlyAnonymizedRealFinanceData: true,
  noRawFullFileDumps: true,
  noRealFinanceDataInPublicDemo: true,
  schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
});

export type ReadOnlyChatGptAppPlan = z.infer<
  typeof ReadOnlyChatGptAppPlanSchema
>;
export type ReadOnlyMcpServerPlan = z.infer<typeof ReadOnlyMcpServerPlanSchema>;
export type AppEvidenceQuery = z.infer<typeof AppEvidenceQuerySchema>;
export type AppEvidenceFetch = z.infer<typeof AppEvidenceFetchSchema>;
export type AppSourceCoverageFetch = z.infer<
  typeof AppSourceCoverageFetchSchema
>;
export type AppCapabilityBoundaryFetch = z.infer<
  typeof AppCapabilityBoundaryFetchSchema
>;
export type AppRefusalPosture = z.infer<typeof AppRefusalPostureSchema>;
export type AppProofPlan = z.infer<typeof AppProofPlanSchema>;
export type AppThreatModelQuestions = z.infer<
  typeof AppThreatModelQuestionsSchema
>;
