import { z } from "zod";
import {
  APP_REFUSAL_REASONS,
  MCP_FORBIDDEN_TOOL_NAMES,
  McpForbiddenToolSchema,
  McpToolAllowlistSchema,
} from "./read-only-app-mcp-boundaries";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const PUBLIC_APP_SECURITY_SCHEMA_VERSION =
  "v2t.public-app-security.v1";

export const PublicAppSecurityContractKindSchema = z.enum([
  "PublicAppSecurityThreatModelContract",
  "PublicAppPlatformBoundary",
  "PublicAppPromptInjectionBoundary",
  "PublicAppDataExfiltrationBoundary",
  "PublicAppRawDumpRefusalBoundary",
  "PublicAppWriteActionImpossibleBoundary",
  "PublicAppToolAllowlistDriftBoundary",
  "PublicAppMcpDescriptorDriftBoundary",
  "PublicAppEndpointDeferredBoundary",
  "PublicAppRemoteMcpDeferredBoundary",
  "PublicAppOAuthDeferredBoundary",
  "PublicAppAppsSdkResourceDeferredBoundary",
  "PublicAppSubmissionDeferredBoundary",
  "PublicAppPublicVisibilityDeferredBoundary",
  "PublicAppConsentAndRbacQuestions",
  "PublicAppAuditLoggingQuestions",
  "PublicAppPrivacyNoRealFinanceDataBoundary",
  "PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundary",
]);

const PublicAppSecurityBaseSchema = z
  .object({
    schemaVersion: z.literal(PUBLIC_APP_SECURITY_SCHEMA_VERSION),
    contractKind: PublicAppSecurityContractKindSchema,
    localProofOnly: trueLiteral,
    publicAppImplemented: falseLiteral,
  })
  .strict();

export const PUBLIC_APP_CONSENT_RBAC_QUESTIONS = [
  "Which user consent is required before any app-visible source summary leaves local proof context?",
  "Which admin controls must exist before public directory visibility is considered?",
  "Which enterprise RBAC posture blocks unsupported companies, users, and actions?",
  "How are read-only tool permissions shown without implying write authority?",
  "Which future plan accepts consent, RBAC, and action-control behavior?",
] as const;

export const PUBLIC_APP_AUDIT_LOGGING_QUESTIONS = [
  "Which app-visible actions, refusals, and source-coverage boundaries require audit records?",
  "Which logs must avoid raw source text, credentials, OAuth material, and private finance data?",
  "How are prompt-injection, exfiltration, stale, unsupported, and conflicting-evidence refusals reviewable?",
  "Which future plan accepts retention, access, replay, and privacy controls?",
] as const;

export const PublicAppSecurityThreatModelContractSchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppSecurityThreatModelContract"),
    promptInjectionTreatedAsUntrustedData: trueLiteral,
    dataExfiltrationRequestsFailClosed: trueLiteral,
    rawDumpRequestsFailClosed: trueLiteral,
    writeActionsImpossible: trueLiteral,
    unsupportedStaleConflictingEvidenceRefuses: trueLiteral,
    noGeneratedFinanceAdvice: trueLiteral,
    noAutonomousAction: trueLiteral,
  }).strict();

export const PublicAppPlatformBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppPlatformBoundary"),
    endpointWorkDeferred: trueLiteral,
    oauthTokenSessionWorkDeferred: trueLiteral,
    remoteMcpDeploymentDeferred: trueLiteral,
    appsSdkResourceImplementationDeferred: trueLiteral,
    publicAppImplementationDeferred: trueLiteral,
    appSubmissionListingPublicAssetsDeferred: trueLiteral,
    noOpenAiApiCalls: trueLiteral,
    noModelCalls: trueLiteral,
    noRoutesAdded: trueLiteral,
    noEndpointsAdded: trueLiteral,
    noAppsSdkResourcesAdded: trueLiteral,
    noRemoteMcpDeployment: trueLiteral,
    noOauth: trueLiteral,
    noAppSubmission: trueLiteral,
    noPublicAssets: trueLiteral,
    noListingCopy: trueLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
  }).strict();

export const PublicAppPromptInjectionBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppPromptInjectionBoundary"),
    sourceTextTrust: z.literal("untrusted_data"),
    userTextTrust: z.literal("untrusted_data"),
    toolOutputTrust: z.literal("untrusted_data"),
    modelVisibleContextTrust: z.literal("untrusted_data"),
    appMcpMetadataTrust: z.literal("untrusted_data"),
    sourceInstructionsCanAuthorizeTools: falseLiteral,
    userTextCanWidenScope: falseLiteral,
    toolOutputCanBypassBoundaries: falseLiteral,
    promptInjectionDisplayedAsData: trueLiteral,
    instructionOverrideRefuses: trueLiteral,
  }).strict();

export const PublicAppDataExfiltrationBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppDataExfiltrationBoundary"),
    failClosed: trueLiteral,
    rawPrivateDataExfiltrationAllowed: falseLiteral,
    credentialTokenOauthMaterialAllowed: falseLiteral,
    objectStoreDatabaseDumpAllowed: falseLiteral,
    broadExportAllowed: falseLiteral,
    fullSourceTextAllowed: falseLiteral,
    requiresBoundedCitedExcerpts: trueLiteral,
  }).strict();

export const PublicAppRawDumpRefusalBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppRawDumpRefusalBoundary"),
    failClosed: trueLiteral,
    rawFullFileDumpsAllowed: falseLiteral,
    fullSourceTextOutputAllowed: falseLiteral,
    boundedExcerptsOnly: trueLiteral,
    requiresCitations: trueLiteral,
    refusesSourcePackDumpRequests: trueLiteral,
  }).strict();

export const PublicAppWriteActionImpossibleBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppWriteActionImpossibleBoundary"),
    writeModifyToolsAllowed: falseLiteral,
    noSourceMutation: trueLiteral,
    noFinanceWrite: trueLiteral,
    noProviderPaymentCustomerContact: trueLiteral,
    noAutonomousAction: trueLiteral,
    forbiddenTools: z.array(McpForbiddenToolSchema).min(1),
  })
    .strict()
    .superRefine((value, ctx) => {
      if (!sameList(value.forbiddenTools, MCP_FORBIDDEN_TOOL_NAMES)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Forbidden tools must match the exact V2G contract.",
          path: ["forbiddenTools"],
        });
      }
    });

export const PublicAppToolAllowlistDriftBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppToolAllowlistDriftBoundary"),
    allowedTools: McpToolAllowlistSchema,
    dynamicToolsAllowed: falseLiteral,
    allowlistExpansionRequiresFuturePlan: trueLiteral,
    renamedWriteToolsRejected: trueLiteral,
    toolAllowlistDriftFailsClosed: trueLiteral,
  }).strict();

export const PublicAppMcpDescriptorDriftBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppMcpDescriptorDriftBoundary"),
    descriptorUse: z.literal("local_proof_contract_only"),
    liveServerDescriptorAllowed: falseLiteral,
    descriptorAllowlistMustMatchToolAllowlist: trueLiteral,
    descriptorInputOutputMustRemainStrict: trueLiteral,
    descriptorDriftFailsClosed: trueLiteral,
  }).strict();

function deferredBoundary(
  kind: z.infer<typeof PublicAppSecurityContractKindSchema>,
) {
  return PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal(kind),
    implemented: falseLiteral,
    deferred: trueLiteral,
    requiresLaterFinancePlan: trueLiteral,
    requiresLaterSecurityReview: trueLiteral,
  }).strict();
}

export const PublicAppEndpointDeferredBoundarySchema = deferredBoundary(
  "PublicAppEndpointDeferredBoundary",
);
export const PublicAppRemoteMcpDeferredBoundarySchema = deferredBoundary(
  "PublicAppRemoteMcpDeferredBoundary",
);
export const PublicAppOAuthDeferredBoundarySchema = deferredBoundary(
  "PublicAppOAuthDeferredBoundary",
);
export const PublicAppAppsSdkResourceDeferredBoundarySchema = deferredBoundary(
  "PublicAppAppsSdkResourceDeferredBoundary",
);
export const PublicAppSubmissionDeferredBoundarySchema = deferredBoundary(
  "PublicAppSubmissionDeferredBoundary",
);

export const PublicAppPublicVisibilityDeferredBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppPublicVisibilityDeferredBoundary"),
    publicDirectoryListingStarted: falseLiteral,
    publicVisibilityDeferred: trueLiteral,
    publicAssetsDeferred: trueLiteral,
    listingCopyDeferred: trueLiteral,
    appSubmissionArtifactsDeferred: trueLiteral,
    requiresLaterSubmissionPlan: trueLiteral,
  }).strict();

export const PublicAppConsentAndRbacQuestionsSchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppConsentAndRbacQuestions"),
    questionListOnly: trueLiteral,
    implementationStarted: falseLiteral,
    questions: z.tuple([
      z.literal(PUBLIC_APP_CONSENT_RBAC_QUESTIONS[0]),
      z.literal(PUBLIC_APP_CONSENT_RBAC_QUESTIONS[1]),
      z.literal(PUBLIC_APP_CONSENT_RBAC_QUESTIONS[2]),
      z.literal(PUBLIC_APP_CONSENT_RBAC_QUESTIONS[3]),
      z.literal(PUBLIC_APP_CONSENT_RBAC_QUESTIONS[4]),
    ]),
  }).strict();

export const PublicAppAuditLoggingQuestionsSchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppAuditLoggingQuestions"),
    questionListOnly: trueLiteral,
    implementationStarted: falseLiteral,
    questions: z.tuple([
      z.literal(PUBLIC_APP_AUDIT_LOGGING_QUESTIONS[0]),
      z.literal(PUBLIC_APP_AUDIT_LOGGING_QUESTIONS[1]),
      z.literal(PUBLIC_APP_AUDIT_LOGGING_QUESTIONS[2]),
      z.literal(PUBLIC_APP_AUDIT_LOGGING_QUESTIONS[3]),
    ]),
  }).strict();

export const PublicAppPrivacyNoRealFinanceDataBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal("PublicAppPrivacyNoRealFinanceDataBoundary"),
    noRealFinanceData: trueLiteral,
    noCopiedOrLightlyAnonymizedRealFinanceData: trueLiteral,
    noPublicDemoSourcePacks: trueLiteral,
    noSampleDataAdded: trueLiteral,
    noFixturesAdded: trueLiteral,
    sourcePackMutationAllowed: falseLiteral,
    screenshotsOrPublicAssetsAllowed: falseLiteral,
  }).strict();

export const PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema =
  PublicAppSecurityBaseSchema.extend({
    contractKind: z.literal(
      "PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundary",
    ),
    failClosed: trueLiteral,
    unsupportedEvidenceRefuses: trueLiteral,
    staleEvidenceRefuses: trueLiteral,
    conflictingEvidenceRefuses: trueLiteral,
    generatedFinanceAdviceAllowed: falseLiteral,
    requiresFreshnessLimitations: trueLiteral,
    requiredRefusalReasons: z.array(z.enum(APP_REFUSAL_REASONS)).min(1),
  }).strict();

function sameList(left: readonly unknown[], right: readonly unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export type PublicAppSecurityThreatModelContract = z.infer<
  typeof PublicAppSecurityThreatModelContractSchema
>;
export type PublicAppPlatformBoundary = z.infer<
  typeof PublicAppPlatformBoundarySchema
>;
export type PublicAppPromptInjectionBoundary = z.infer<
  typeof PublicAppPromptInjectionBoundarySchema
>;
export type PublicAppDataExfiltrationBoundary = z.infer<
  typeof PublicAppDataExfiltrationBoundarySchema
>;
export type PublicAppRawDumpRefusalBoundary = z.infer<
  typeof PublicAppRawDumpRefusalBoundarySchema
>;
export type PublicAppWriteActionImpossibleBoundary = z.infer<
  typeof PublicAppWriteActionImpossibleBoundarySchema
>;
export type PublicAppToolAllowlistDriftBoundary = z.infer<
  typeof PublicAppToolAllowlistDriftBoundarySchema
>;
export type PublicAppMcpDescriptorDriftBoundary = z.infer<
  typeof PublicAppMcpDescriptorDriftBoundarySchema
>;
export type PublicAppPrivacyNoRealFinanceDataBoundary = z.infer<
  typeof PublicAppPrivacyNoRealFinanceDataBoundarySchema
>;
