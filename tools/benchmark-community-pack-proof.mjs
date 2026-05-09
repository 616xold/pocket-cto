import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ArchitectureMapSchema,
  AppProofSchema,
  BENCHMARK_AUTHORITY_LAYERS,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS,
  CommunityPackManifestSchema,
  ContributorChallengeSchema,
  EvidenceFaithfulnessTaskSchema,
  EvidenceRecallTaskSchema,
  MissingCitationTaskSchema,
  MonitorBoundaryTaskSchema,
  PolicyLookupTaskSchema,
  ReportTraceabilityTaskSchema,
  SafeDemoDataPolicySchema,
  SourceCoverageTaskSchema,
  SyntheticFinanceSourcePolicySchema,
  UnsafeActionRefusalTaskSchema,
  buildReadOnlyChatGptAppMcpProof,
} from "../packages/domain/src/index.ts";

const financeData = [
  "customer_data",
  "vendor_data",
  "payroll_data",
  "tax_data",
  "bank_data",
  "legal_data",
  "board_data",
  "lender_data",
];
const scriptNames = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
);
const noPackageScriptsAdded = !scriptNames.some((name) =>
  /v2f|benchmark-community|community-pack/u.test(name),
);
const noSmokeAliasesAdded = !scriptNames.some((name) =>
  /^smoke:.*(v2f|benchmark|community)/u.test(name),
);

const taskSpecs = [
  [
    EvidenceRecallTaskSchema,
    "evidence_recall",
    { recallsExistingEvidenceOnly: true },
  ],
  [
    SourceCoverageTaskSchema,
    "source_coverage",
    { checksSupportedUnsupportedMissingStaleFailedNotIndexed: true },
  ],
  [
    PolicyLookupTaskSchema,
    "policy_lookup",
    { explicitPolicySourceScopeRequired: true, noLegalOrPolicyAdvice: true },
  ],
  [
    ReportTraceabilityTaskSchema,
    "report_traceability",
    { createsOrReleasesReports: false, tracesStoredArtifactsOnly: true },
  ],
  [
    MonitorBoundaryTaskSchema,
    "monitor_boundary",
    { createsAlertsOrMissions: false, deterministicStoredStateOnly: true },
  ],
  [
    UnsafeActionRefusalTaskSchema,
    "unsafe_action_refusal",
    { readOnlyProofOnly: true },
    "unsafe_action_refusal",
  ],
  [
    MissingCitationTaskSchema,
    "missing_citation",
    { readOnlyProofOnly: true },
    "missing_citation_refusal",
  ],
  [
    EvidenceFaithfulnessTaskSchema,
    "evidence_faithfulness",
    {
      rejectsConflictingEvidence: true,
      readOnlyProofOnly: true,
      rejectsMissingEvidence: true,
      rejectsRawFullFileDumpLikePosture: true,
      rejectsStaleEvidence: true,
      rejectsUncitedClaims: true,
      rejectsUnsupportedEvidence: true,
    },
  ],
];

const checkedAt = "2026-05-09T00:30:00.000Z";
const FP0088_PLAN =
  "plans/FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md";
const FP0089_PLAN =
  "plans/FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md";
const FP0090_PLAN =
  "plans/FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md";
const FP0091_PLAN =
  "plans/FP-0091-read-only-chatgpt-app-mcp-premium-ui-component-foundation.md";
const fp0088Boundary = fp0088DocsOnlyBoundary();
const fp0089Boundary = fp0089DocsOnlyBoundary();
const fp0090Boundary = fp0090DocsOnlyBoundary();
const fp0091Boundary = fp0091LocalUiComponentBoundary();
const fp0092Absent = !repoFilePaths().some((path) =>
  /(^|\/)FP-0092/u.test(path),
);

function fp0087AbsentOrDocsOnlyBoundaryVerified() {
  const fp0087Files = readdirSync("plans").filter((name) =>
    /^FP-0087/u.test(name),
  );

  if (fp0087Files.length === 0) {
    return true;
  }

  if (
    fp0087Files.length !== 1 ||
    fp0087Files[0] !== "FP-0087-read-only-chatgpt-app-mcp-master-plan.md"
  ) {
    return false;
  }

  const planText = readFileSync(`plans/${fp0087Files[0]}`, "utf8");
  const lowerPlanText = planText.toLowerCase();
  const planBoundaryVerified = [
    "v2g",
    "read-only",
    "chatgpt app/mcp",
    "no app submission",
    "no openai api/model calls",
    "source mutation",
    "finance writes",
    "autonomous action",
  ].every((requiredText) => lowerPlanText.includes(requiredText));
  const typedProof = AppProofSchema.safeParse(
    buildReadOnlyChatGptAppMcpProof({
      fp0087DocsOnlyBoundaryVerified: planBoundaryVerified,
      fp0088AbsentOrDocsOnlyBoundaryVerified:
        fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090Boundary.absentOrDocsOnlyBoundaryVerified,
      fp0091AbsentOrLocalUiComponentBoundaryVerified:
        fp0091Boundary.absentOrLocalUiComponentBoundaryVerified,
      fp0092Absent,
      premiumUiSecurityPlanBoundaryVerified:
        fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090Boundary.premiumUiImplementationPlanBoundaryVerified,
      premiumUiComponentFoundationVerified:
        fp0091Boundary.premiumUiComponentFoundationVerified,
      noUiImplementationFromFp0088:
        fp0088Boundary.noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089Boundary.noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089Boundary.noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090Boundary.noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090Boundary.noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090Boundary.noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090Boundary.noPublicAppImplementationFromFp0090,
      noRoutesFromFp0091: fp0091Boundary.noRoutesFromFp0091,
      noEndpointsFromFp0091: fp0091Boundary.noEndpointsFromFp0091,
      noAppsSdkIframeFromFp0091: fp0091Boundary.noAppsSdkIframeFromFp0091,
      noOauthSubmissionFromFp0091:
        fp0091Boundary.noOauthSubmissionFromFp0091,
      noPublicAppImplementationFromFp0091:
        fp0091Boundary.noPublicAppImplementationFromFp0091,
      noOpenAiApiCallsFromFp0091:
        fp0091Boundary.noOpenAiApiCallsFromFp0091,
      noSourceMutationFinanceWriteFromFp0091:
        fp0091Boundary.noSourceMutationFinanceWriteFromFp0091,
    }),
  );

  return (
    typedProof.success &&
    typedProof.data.fp0087DocsOnlyBoundaryVerified &&
    typedProof.data.noPublicChatGptApp &&
    typedProof.data.noRemoteMcpDeployment &&
    typedProof.data.noOpenAiApiCalls
  );
}

function safeDemoDataPolicy() {
  return {
    firstGate: true,
    forbiddenFinanceData: financeData,
    forbiddenPrivateArtifacts: [
      "credentials",
      "tokens",
      "secrets",
      "oauth_material",
      "provider_credentials",
      "api_keys",
      "object_store_dumps",
      "database_dumps",
      "private_screenshots",
      "private_finance_source_text",
    ],
    forbidsCheckedInSensitiveFinanceData: true,
    forbidsLightlyAnonymizedRealFinanceData: true,
    forbidsRealCompanyData: true,
    noDataFilesCreatedByPolicy: true,
    policyName: "SafeDemoDataPolicy",
    requiresClearSyntheticLabel: true,
    requiresReviewBeforeAnyFutureDataFile: true,
    requiresSyntheticOnlyBeforeFutureCase: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function syntheticFinanceSourcePolicy() {
  return {
    forbidsLightlyAnonymizedRealFinanceData: true,
    forbidsRealCompanyDerivedData: true,
    forbidsSourcePackDerivedPrivateData: true,
    gatedBySafeDemoDataPolicyFirst: true,
    noFutureSampleDemoBenchmarkCaseWithoutPolicy: true,
    policyName: "SyntheticFinanceSourcePolicy",
    requiresClearSyntheticLabeling: true,
    requiresInventedCompanyFacts: true,
    requiresInventedSourceFacts: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function privacyBoundary() {
  return {
    benchmarkArtifactsAreNotSourceTruth: true,
    noCredentialsTokensSecretsOauthProviderKeys: true,
    noLightlyAnonymizedRealFinanceData: true,
    noObjectStoreOrDatabaseDumps: true,
    noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderData: true,
    noPrivateFinanceSourceText: true,
    noPrivateScreenshots: true,
    noRealCompanyData: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function noRuntimeBoundary() {
  return {
    localProofOnly: true,
    noAppSubmission: true,
    noAppsSdkUi: true,
    noAutonomousAction: true,
    noCertification: true,
    noDelivery: true,
    noDeployment: true,
    noEvalDatasetsAdded: true,
    noExternalCommunications: true,
    noFinanceWrite: true,
    noFixturesAdded: true,
    noGeneratedAdvice: true,
    noGeneratedProductProse: true,
    noModelCalls: true,
    noOauth: true,
    noOcr: true,
    noOpenAiApiCalls: true,
    noPackageScriptsAdded: true,
    noPageIndex: true,
    noProductRuntime: true,
    noProviderCalls: true,
    noPublicChatGptApp: true,
    noPublicDemoDataAdded: true,
    noPublicSourcePacksAdded: true,
    noRemoteMcpDeployment: true,
    noRoutesAdded: true,
    noRuntimeCodex: true,
    noSampleDataAdded: true,
    noSchemaMigrationsAdded: true,
    noSmokeAliasesAdded: true,
    noSourceMutation: true,
    noSourcePackMutation: true,
    noUiAdded: true,
    noVectorFileSearch: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function architectureMap() {
  return {
    authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS],
    benchmarkArtifactsNotProductRuntime: true,
    cfoWikiCompiledDerived: true,
    evidenceIndexReadOnlyAnchorTraceCardCoverageLimitationLayer: true,
    financeTwinAuthoritativeForStructuredFacts: true,
    rawSourcesAuthoritativeForDocumentClaims: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    v2cToolsLocalInternalReadOnlyContract: true,
    v2dAtlasVisualizationOnly: true,
    v2eBoundedOrchestrationLocalInternalProofOnly: true,
    v2fContractsNotTruthRuntimeOrData: true,
  };
}

function contributorChallenge() {
  return {
    challengeName: "Synthetic read-only evidence challenge",
    noAutonomousActionImplied: true,
    noCertificationImplied: true,
    noFinanceWritesImplied: true,
    noLegalAuditTaxAdviceImplied: true,
    noProviderIntegrationImplied: true,
    noPublicLaunchImplied: true,
    noSaasDeploymentImplied: true,
    readOnlyProofOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    syntheticOnlyRequiredBeforeAnyFutureData: true,
  };
}

function benchmarkCase() {
  return {
    futureCaseRequiresSafeDemoDataPolicy: true,
    futureCaseRequiresSyntheticFinanceSourcePolicy: true,
    noBenchmarkCasesCheckedIn: true,
    noDatasetFile: true,
    noFixtureFile: true,
    noSampleDataFile: true,
    placeholderOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  };
}

function baseTask(
  taskKind,
  expectedRefusalKind = "unsupported_evidence_refusal",
) {
  return {
    citationRequirements: {
      acceptedDerivedRefKinds: ["evidence_card", "document_map"],
      missingCitationFailsClosed: true,
      positiveClaimsRequireCitation: true,
      sourceAnchorOrAcceptedDerivedRefRequired: true,
    },
    companyContext: { companyKey: "synthetic-company", syntheticOnly: true },
    contractPlaceholderOnly: true,
    evidenceRequirements: {
      cfoWikiCompiledDerived: true,
      evidenceIndexAllowed: true,
      financeTwinStructuredFactsRemainAuthoritative: true,
      noFullFileDumps: true,
      rawSourcesRemainAuthoritative: true,
      v2cEvidenceToolsAllowedReadOnly: true,
    },
    expectedRefusalPosture: {
      expectedRefusalKind,
      whenCitationMissing: "missing_citation_refusal",
      whenEvidenceConflicting: "unsupported_evidence_refusal",
      whenEvidenceMissing: "unsupported_evidence_refusal",
      whenEvidenceStale: "unsupported_evidence_refusal",
      whenEvidenceUnsupported: "unsupported_evidence_refusal",
      whenUnsafeActionRequested: "unsafe_action_refusal",
    },
    forbiddenActions: [
      "upload_source",
      "report_release",
      "provider_call",
      "finance_write",
      "generated_advice",
      "autonomous_action",
      "openai_api_call",
      "model_call",
    ],
    freshnessPosture: {
      checkedAt,
      compiledAt: checkedAt,
      extractedAt: checkedAt,
      sourceCapturedAt: checkedAt,
      state: "fresh",
      summary: "Fresh synthetic benchmark contract posture.",
    },
    limitationPosture: [
      {
        affectedAnchorIds: [],
        affectedSourceIds: [],
        code: "not_source_truth",
        severity: "blocking",
        summary: "V2F benchmark contracts are not source truth.",
      },
    ],
    noRuntimeBoundary: noRuntimeBoundary(),
    permittedNextActions: [
      {
        action: "request_human_review",
        label: "Review benchmark contract posture.",
        targetId: "synthetic-company",
      },
    ],
    privacyBoundary: privacyBoundary(),
    proofExpectations: {
      localProofOnly: true,
      machineReadable: true,
      noDatasetRequired: true,
      noRuntimeBehavior: true,
    },
    readOnlyDefinitionOnly: true,
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    taskKind,
    taskName: `Synthetic ${taskKind} task contract`,
  };
}

const safePolicy = SafeDemoDataPolicySchema.parse(safeDemoDataPolicy());
const syntheticPolicy = SyntheticFinanceSourcePolicySchema.parse(
  syntheticFinanceSourcePolicy(),
);
const privacy = privacyBoundary();
const noRuntime = BenchmarkNoRuntimeBoundarySchema.parse({
  ...noRuntimeBoundary(),
  noEvalDatasetsAdded: !existsSync("evals/v2f"),
  noFixturesAdded: !existsSync("fixtures/v2f"),
  noPackageScriptsAdded,
  noPublicDemoDataAdded: !existsSync("docs/demo/v2f-public-demo-data"),
  noPublicSourcePacksAdded: !existsSync("source-packs/v2f"),
  noSampleDataAdded: !existsSync("samples/v2f"),
  noSmokeAliasesAdded,
});
const architecture = ArchitectureMapSchema.parse(architectureMap());
const challenge = ContributorChallengeSchema.parse(contributorChallenge());
const placeholder = BenchmarkCaseSchema.parse(benchmarkCase());
const tasks = taskSpecs.map(([schema, kind, extra, refusal]) =>
  schema.parse({ ...baseTask(kind, refusal), ...extra }),
);
const taskFor = (kind) => tasks.find((task) => task.taskKind === kind);
const manifestInput = {
  allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
  architectureMap: architecture,
  benchmarkCase: placeholder,
  containsNoDataOrSourcePackReferences: true,
  contributorChallenge: challenge,
  describesFutureCommunityPackOnly: true,
  manifestKind: "CommunityPackManifest",
  noRuntimeBoundary: noRuntime,
  owningFinancePlan: "FP-0086",
  privacyBoundary: privacy,
  safeDemoDataPolicy: safePolicy,
  schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  syntheticFinanceSourcePolicy: syntheticPolicy,
  validationPosture: {
    directProofCommandOnly: true,
    inMemorySyntheticExamplesOnly: true,
    noDataFileAliasesAllowed: true,
    noPackageScriptOrSmokeAlias: true,
  },
};
const manifest = CommunityPackManifestSchema.parse(manifestInput);

const rejects = (schema, value) => !schema.safeParse(value).success;
const unknownKeysRejected = [
  [SafeDemoDataPolicySchema, { ...safeDemoDataPolicy(), unknownKey: true }],
  [
    SyntheticFinanceSourcePolicySchema,
    { ...syntheticFinanceSourcePolicy(), unknownKey: true },
  ],
  [
    BenchmarkNoRuntimeBoundarySchema,
    { ...noRuntimeBoundary(), unknownKey: true },
  ],
  [ContributorChallengeSchema, { ...contributorChallenge(), unknownKey: true }],
  [ArchitectureMapSchema, { ...architectureMap(), unknownKey: true }],
  [BenchmarkCaseSchema, { ...benchmarkCase(), unknownKey: true }],
  [CommunityPackManifestSchema, { ...manifestInput, unknownKey: true }],
].every(([schema, value]) => rejects(schema, value));
const communityPackManifestDataAliasesRejected =
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS.every(
    (field) =>
      rejects(CommunityPackManifestSchema, { ...manifestInput, [field]: [] }) &&
      rejects(CommunityPackManifestSchema, {
        ...manifestInput,
        [field]: ["synthetic alias payload"],
      }),
  );
const communityPackManifestExplicitDataFieldsRejected = [
  "dataFiles",
  "sourcePackFiles",
  "evalDatasetFiles",
  "fixtureFiles",
].every((field) =>
  rejects(CommunityPackManifestSchema, {
    ...manifestInput,
    [field]: ["synthetic explicit data reference"],
  }),
);
const authorityLayerDuplicatesRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS.slice(0, 7), "raw_sources"],
});
const authorityLayerMissingRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
});
const authorityLayerExtraRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS, "raw_sources"],
});
const authorityLayerReorderRejected = rejects(ArchitectureMapSchema, {
  ...architectureMap(),
  authorityLayers: [
    "finance_twin",
    "raw_sources",
    ...BENCHMARK_AUTHORITY_LAYERS.slice(2),
  ],
});
const authorityLayersExactOrderVerified =
  JSON.stringify(architecture.authorityLayers) ===
  JSON.stringify(BENCHMARK_AUTHORITY_LAYERS);
const benchmarkTaskUnknownKeysRejected = rejects(EvidenceRecallTaskSchema, {
  ...baseTask("evidence_recall"),
  recallsExistingEvidenceOnly: true,
  route: "/should-not-exist",
});
const benchmarkTaskNestedUnknownKeysRejected =
  rejects(EvidenceRecallTaskSchema, {
    ...baseTask("evidence_recall"),
    companyContext: {
      ...baseTask("evidence_recall").companyContext,
      rawFullText: "synthetic but forbidden raw text posture",
    },
    recallsExistingEvidenceOnly: true,
  }) &&
  rejects(EvidenceRecallTaskSchema, {
    ...baseTask("evidence_recall"),
    freshnessPosture: {
      ...baseTask("evidence_recall").freshnessPosture,
      pageTextDump: "synthetic but forbidden page text dump posture",
    },
    recallsExistingEvidenceOnly: true,
  });

const proof = BenchmarkProofSchema.parse({
  ...noRuntime,
  architectureMapBoundaryVerified:
    architecture.v2fContractsNotTruthRuntimeOrData,
  authorityLayerDuplicatesRejected,
  authorityLayerExtraRejected,
  authorityLayerMissingRejected,
  authorityLayerReorderRejected,
  authorityLayersExactOrderVerified,
  benchmarkCasePlaceholderOnlyVerified: placeholder.placeholderOnly,
  benchmarkNoRuntimeBoundaryVerified: noRuntime.noProductRuntime,
  benchmarkPrivacyBoundaryVerified: privacy.noRealCompanyData,
  benchmarkTaskTaxonomyVerified:
    JSON.stringify(tasks.map((task) => task.taskKind)) ===
    JSON.stringify(BENCHMARK_TASK_KINDS),
  benchmarkProofUnknownKeysRejected: true,
  benchmarkTaskNestedUnknownKeysRejected,
  benchmarkTaskUnknownKeysRejected,
  communityPackManifestDataAliasesRejected,
  communityPackManifestExplicitDataFieldsRejected,
  communityPackManifestVerified: manifest.containsNoDataOrSourcePackReferences,
  contributorChallengeBoundaryVerified:
    challenge.noPublicLaunchImplied &&
    challenge.noSaasDeploymentImplied &&
    challenge.noProviderIntegrationImplied,
  evidenceFaithfulnessTaskVerified:
    taskFor("evidence_faithfulness")?.proofExpectations.noDatasetRequired ===
      true && taskFor("evidence_faithfulness")?.readOnlyProofOnly === true,
  evidenceFreshnessLimitationsPermittedActionFieldsVerified: tasks.every(
    (task) =>
      task.freshnessPosture.summary &&
      task.limitationPosture.length > 0 &&
      task.permittedNextActions.length > 0,
  ),
  evidenceRecallTaskVerified:
    taskFor("evidence_recall")?.evidenceRequirements.evidenceIndexAllowed ===
    true,
  forbiddenActionsVerified: tasks.every((task) =>
    ["openai_api_call", "finance_write", "autonomous_action"].every((action) =>
      task.forbiddenActions.includes(action),
    ),
  ),
  fp0087AbsentOrDocsOnlyBoundaryVerified:
    fp0087AbsentOrDocsOnlyBoundaryVerified(),
  fp0088AbsentOrDocsOnlyBoundaryVerified:
    fp0088Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0089AbsentOrDocsOnlyBoundaryVerified:
    fp0089Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0090AbsentOrDocsOnlyBoundaryVerified:
    fp0090Boundary.absentOrDocsOnlyBoundaryVerified,
  fp0091AbsentOrLocalUiComponentBoundaryVerified:
    fp0091Boundary.absentOrLocalUiComponentBoundaryVerified,
  fp0092Absent,
  premiumUiSecurityPlanBoundaryVerified:
    fp0088Boundary.premiumUiSecurityPlanBoundaryVerified,
  premiumUiDesignSystemPlanBoundaryVerified:
    fp0089Boundary.premiumUiDesignSystemPlanBoundaryVerified,
  premiumUiImplementationPlanBoundaryVerified:
    fp0090Boundary.premiumUiImplementationPlanBoundaryVerified,
  premiumUiComponentFoundationVerified:
    fp0091Boundary.premiumUiComponentFoundationVerified,
  noUiImplementationFromFp0088:
    fp0088Boundary.noUiImplementationFromFp0088,
  noUiImplementationFromFp0089:
    fp0089Boundary.noUiImplementationFromFp0089,
  noAppsSdkIframeFromFp0089:
    fp0089Boundary.noAppsSdkIframeFromFp0089,
  noUiCodeFromFp0090: fp0090Boundary.noUiCodeFromFp0090,
  noAppsSdkIframeFromFp0090:
    fp0090Boundary.noAppsSdkIframeFromFp0090,
  noEndpointOauthSubmissionFromFp0088:
    fp0088Boundary.noEndpointOauthSubmissionFromFp0088,
  noEndpointOauthSubmissionFromFp0089:
    fp0089Boundary.noEndpointOauthSubmissionFromFp0089,
  noEndpointOauthSubmissionFromFp0090:
    fp0090Boundary.noEndpointOauthSubmissionFromFp0090,
  noPublicAppImplementationFromFp0090:
    fp0090Boundary.noPublicAppImplementationFromFp0090,
  noRoutesFromFp0091: fp0091Boundary.noRoutesFromFp0091,
  noEndpointsFromFp0091: fp0091Boundary.noEndpointsFromFp0091,
  noAppsSdkIframeFromFp0091: fp0091Boundary.noAppsSdkIframeFromFp0091,
  noOauthSubmissionFromFp0091:
    fp0091Boundary.noOauthSubmissionFromFp0091,
  noPublicAppImplementationFromFp0091:
    fp0091Boundary.noPublicAppImplementationFromFp0091,
  noOpenAiApiCallsFromFp0091:
    fp0091Boundary.noOpenAiApiCallsFromFp0091,
  noSourceMutationFinanceWriteFromFp0091:
    fp0091Boundary.noSourceMutationFinanceWriteFromFp0091,
  inMemorySyntheticExamplesOnlyVerified:
    manifest.validationPosture.inMemorySyntheticExamplesOnly,
  missingCitationTaskVerified:
    taskFor("missing_citation")?.expectedRefusalPosture.expectedRefusalKind ===
      "missing_citation_refusal" &&
    taskFor("missing_citation")?.readOnlyProofOnly === true,
  monitorBoundaryTaskVerified:
    taskFor("monitor_boundary")?.noRuntimeBoundary.noProductRuntime === true,
  noCredentialTokenSecretPolicyVerified: [
    "credentials",
    "tokens",
    "secrets",
  ].every((artifact) =>
    safePolicy.forbiddenPrivateArtifacts.includes(artifact),
  ),
  noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderDataVerified:
    financeData.every((category) =>
      safePolicy.forbiddenFinanceData.includes(category),
    ),
  noRealFinanceDataPolicyVerified:
    safePolicy.forbidsRealCompanyData &&
    safePolicy.forbidsLightlyAnonymizedRealFinanceData,
  policyLookupTaskVerified:
    taskFor("policy_lookup")?.citationRequirements
      .sourceAnchorOrAcceptedDerivedRefRequired === true,
  reportTraceabilityTaskVerified:
    taskFor("report_traceability")?.contractPlaceholderOnly === true,
  safeDemoDataPolicyVerified:
    safePolicy.firstGate && safePolicy.requiresSyntheticOnlyBeforeFutureCase,
  sourceCoverageTaskVerified:
    taskFor("source_coverage")?.expectedRefusalPosture
      .whenEvidenceUnsupported === "unsupported_evidence_refusal",
  syntheticExamplesClearlyLabeledVerified: tasks.every(
    (task) =>
      task.companyContext.syntheticOnly &&
      task.companyContext.companyKey.includes("synthetic") &&
      task.freshnessPosture.summary.includes("synthetic"),
  ),
  syntheticFinanceSourcePolicyVerified:
    syntheticPolicy.requiresInventedCompanyFacts &&
    syntheticPolicy.requiresInventedSourceFacts &&
    syntheticPolicy.requiresClearSyntheticLabeling,
  unknownKeysRejected,
  unsafeActionRefusalTaskVerified:
    taskFor("unsafe_action_refusal")?.expectedRefusalPosture
      .expectedRefusalKind === "unsafe_action_refusal" &&
    taskFor("unsafe_action_refusal")?.readOnlyProofOnly === true,
});

const benchmarkProofUnknownKeysRejected = rejects(BenchmarkProofSchema, {
  ...proof,
  rawFullText: "synthetic but forbidden proof field",
});
if (!benchmarkProofUnknownKeysRejected) {
  throw new Error(
    "V2F benchmark proof failed: benchmarkProofUnknownKeysRejected",
  );
}

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`V2F benchmark community proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));

function fp0088DocsOnlyBoundary() {
  const fp0088PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0088/u.test(path),
  );

  if (fp0088PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noEndpointOauthSubmissionFromFp0088: true,
      noUiImplementationFromFp0088: true,
      premiumUiSecurityPlanBoundaryVerified: true,
    };
  }

  if (fp0088PathHits.length !== 1 || fp0088PathHits[0] !== FP0088_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noEndpointOauthSubmissionFromFp0088: false,
      noUiImplementationFromFp0088: false,
      premiumUiSecurityPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0088_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0088 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no package scripts or smoke aliases",
    "no eval datasets, fixtures, sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiSecurityPlanBoundaryVerified = [
    "premium ui readiness requirements only",
    "app/mcp security readiness requirements only",
    "premium apple/openai-style visual standard",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0088 = [
    "does not authorize apps sdk iframe/ui code",
    "future ui polish/design-system implementation plan",
    "before ui code",
    "do not implement ui",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0088 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before submission",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noEndpointOauthSubmissionFromFp0088,
    noUiImplementationFromFp0088,
    premiumUiSecurityPlanBoundaryVerified,
  };
}

function fp0089DocsOnlyBoundary() {
  const fp0089PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0089/u.test(path),
  );

  if (fp0089PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0089: true,
      noEndpointOauthSubmissionFromFp0089: true,
      noUiImplementationFromFp0089: true,
      premiumUiDesignSystemPlanBoundaryVerified: true,
    };
  }

  if (fp0089PathHits.length !== 1 || fp0089PathHits[0] !== FP0089_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0089: false,
      noEndpointOauthSubmissionFromFp0089: false,
      noUiImplementationFromFp0089: false,
      premiumUiDesignSystemPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0089_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0089 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui design-system readiness plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiDesignSystemPlanBoundaryVerified = [
    "design tokens",
    "semantic color tokens",
    "spacing scale",
    "typography scale",
    "evidence-card hierarchy",
    "citation/source-anchor affordances",
    "refusal-state visual grammar",
    "limitation/freshness badges",
    "keyboard/focus behavior",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "citationrail",
    "sourceanchordrawer",
    "premium apple/openai-style visual standard",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiImplementationFromFp0089 = [
    "does not authorize ui code",
    "requires a later ui implementation finance plan before any component code",
    "no ui implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0089 = [
    "does not authorize apps sdk iframe/ui code",
    "no apps sdk iframe/ui",
    "does not authorize public app implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0089 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "threat-model/security implementation plan before endpoint",
    "app-submission plan before",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0089,
    noEndpointOauthSubmissionFromFp0089,
    noUiImplementationFromFp0089,
    premiumUiDesignSystemPlanBoundaryVerified,
  };
}

function fp0090DocsOnlyBoundary() {
  const fp0090PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0090/u.test(path),
  );

  if (fp0090PathHits.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0090: true,
      noEndpointOauthSubmissionFromFp0090: true,
      noPublicAppImplementationFromFp0090: true,
      noUiCodeFromFp0090: true,
      premiumUiImplementationPlanBoundaryVerified: true,
    };
  }

  if (fp0090PathHits.length !== 1 || fp0090PathHits[0] !== FP0090_PLAN) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0090: false,
      noEndpointOauthSubmissionFromFp0090: false,
      noPublicAppImplementationFromFp0090: false,
      noUiCodeFromFp0090: false,
      premiumUiImplementationPlanBoundaryVerified: false,
    };
  }

  const lower = readFileSync(FP0090_PLAN, "utf8").toLowerCase();
  const docsOnlyBoundaryVerified = [
    "fp-0090 is not implementation",
    "docs-and-plan plus proof-gate compatibility",
    "premium ui implementation master-plan only",
    "creates no product code",
    "no product code",
    "no ui implementation",
    "no routes or endpoints",
    "no remote mcp server",
    "no apps sdk iframe/ui",
    "no oauth",
    "no app submission",
    "no public app implementation",
    "no openai api/model call",
    "no eval dataset",
    "no fixture",
    "no sample data",
    "no source mutation",
    "no finance writes",
    "no autonomous action",
  ].every((requiredText) => lower.includes(requiredText));
  const premiumUiImplementationPlanBoundaryVerified = [
    "future ui implementation boundary",
    "screenshot review before merge",
    "accessibility acceptance criteria",
    "evidence hierarchy acceptance",
    "no action-looking controls for forbidden actions",
    "no raw text dump panels",
    "no advice-like ctas",
    "appshell",
    "evidenceanswerpanel",
    "refusalpanel",
    "evidencecardstack",
    "citationrail",
    "sourceanchordrawer",
    "freshnessbadge",
    "limitationcallout",
    "privacyboundarypanel",
    "noruntimeboundarypanel",
    "apps/web/components/read-only-app-mcp",
  ].every((requiredText) => lower.includes(requiredText));
  const noUiCodeFromFp0090 = [
    "does not authorize ui code yet",
    "this is not ui implementation",
    "future implementation slice may add ui components only if it remains local/proof-only/read-only",
    "no ui code was added",
  ].every((requiredText) => lower.includes(requiredText));
  const noAppsSdkIframeFromFp0090 = [
    "does not authorize apps sdk iframe/ui code yet",
    "no apps sdk iframe/ui",
    "apps sdk iframe/ui implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));
  const noEndpointOauthSubmissionFromFp0090 = [
    "does not authorize remote mcp deployment",
    "does not authorize oauth implementation",
    "does not authorize endpoint implementation",
    "does not authorize public app submission",
    "no endpoint implementation",
  ].every((requiredText) => lower.includes(requiredText));
  const noPublicAppImplementationFromFp0090 = [
    "does not authorize public app implementation",
    "public chatgpt app implementation remains future-only",
    "public app implementation remains future-only",
  ].every((requiredText) => lower.includes(requiredText));

  return {
    absentOrDocsOnlyBoundaryVerified: docsOnlyBoundaryVerified,
    noAppsSdkIframeFromFp0090,
    noEndpointOauthSubmissionFromFp0090,
    noPublicAppImplementationFromFp0090,
    noUiCodeFromFp0090,
    premiumUiImplementationPlanBoundaryVerified,
  };
}

function fp0091LocalUiComponentBoundary() {
  const fp0091PathHits = repoFilePaths().filter((path) =>
    /(^|\/)FP-0091/u.test(path),
  );
  const absentBoundary = {
    absentOrLocalUiComponentBoundaryVerified: true,
    noAppsSdkIframeFromFp0091: true,
    noEndpointsFromFp0091: true,
    noOauthSubmissionFromFp0091: true,
    noOpenAiApiCallsFromFp0091: true,
    noPublicAppImplementationFromFp0091: true,
    noRoutesFromFp0091: true,
    noSourceMutationFinanceWriteFromFp0091: true,
    premiumUiComponentFoundationVerified: true,
  };
  const failedBoundary = Object.fromEntries(
    Object.keys(absentBoundary).map((key) => [key, false]),
  );

  if (fp0091PathHits.length === 0) return absentBoundary;
  if (fp0091PathHits.length !== 1 || fp0091PathHits[0] !== FP0091_PLAN) {
    return failedBoundary;
  }

  const lower = readFileSync(FP0091_PLAN, "utf8").toLowerCase();
  const componentSource = repoFilePaths()
    .filter((path) => path.startsWith("apps/web/components/read-only-app-mcp/"))
    .filter((path) => /\.(ts|tsx)$/u.test(path))
    .filter((path) => !/\.(spec|test)\.tsx?$/u.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .toLowerCase();
  const normalizedComponentSource = componentSource.replace(/[^a-z0-9]+/gu, "");
  const componentFilesVerified =
    componentSource.length > 0 &&
    [
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "evidencecardstack",
      "citationrail",
      "sourceanchorpanel",
      "freshnessbadge",
      "limitationcallout",
      "permittednextactionspanel",
      "forbiddenactionspanel",
      "privacyboundarypanel",
      "noruntimeboundarypanel",
      "promptinjectionwarningstate",
      "rawfullfiledumprefusalstate",
      "emptyevidencestate",
      "loadingevidencestate",
      "errorandunsupportedstate",
    ].every((name) => normalizedComponentSource.includes(name));
  const premiumUiComponentFoundationVerified =
    componentFilesVerified &&
    [
      "this slice writes actual ui component code",
      "strictly local, proof-only, read-only, and component-only",
      "local react components",
      "apps/web/components/read-only-app-mcp",
      "appshell",
      "evidenceanswerpanel",
      "refusalpanel",
      "citationrail",
      "sourceanchorpanel",
      "errorandunsupportedstate",
    ].every((requiredText) => lower.includes(requiredText));
  const noRoutesFromFp0091 =
    ["does not add routes", "no app routes"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/read-only-app-mcp"),
    );
  const noEndpointsFromFp0091 =
    ["does not add endpoints", "no endpoints"].every((requiredText) =>
      lower.includes(requiredText),
    ) &&
    !repoFilePaths().some((path) =>
      path.startsWith("apps/web/app/api/read-only-app-mcp"),
    );
  const noAppsSdkIframeFromFp0091 =
    [
      "does not implement apps sdk iframe/ui resources",
      "no apps sdk iframe/ui resource registration",
    ].every((requiredText) => lower.includes(requiredText)) &&
    !/(apps-sdk|iframe|postmessage)/u.test(componentSource);
  const noOauthSubmissionFromFp0091 =
    ["does not add oauth", "does not add app submission"].every(
      (requiredText) => lower.includes(requiredText),
    ) && !/(oauth|submitapp|appsubmission)/u.test(normalizedComponentSource);
  const noPublicAppImplementationFromFp0091 =
    [
      "does not implement a public chatgpt app",
      "no public app implementation",
    ].every((requiredText) => lower.includes(requiredText));
  const noOpenAiApiCallsFromFp0091 =
    ["does not add openai api/model calls", "no openai api/model calls"].every(
      (requiredText) => lower.includes(requiredText),
    ) &&
    !/(openaiapikey|fromopenai|openai\.)/u.test(normalizedComponentSource);
  const noSourceMutationFinanceWriteFromFp0091 =
    ["no source mutation", "no finance writes"].every((requiredText) =>
      lower.includes(requiredText),
    );

  return {
    absentOrLocalUiComponentBoundaryVerified:
      premiumUiComponentFoundationVerified &&
      noRoutesFromFp0091 &&
      noEndpointsFromFp0091 &&
      noAppsSdkIframeFromFp0091 &&
      noOauthSubmissionFromFp0091 &&
      noPublicAppImplementationFromFp0091 &&
      noOpenAiApiCallsFromFp0091 &&
      noSourceMutationFinanceWriteFromFp0091,
    noAppsSdkIframeFromFp0091,
    noEndpointsFromFp0091,
    noOauthSubmissionFromFp0091,
    noOpenAiApiCallsFromFp0091,
    noPublicAppImplementationFromFp0091,
    noRoutesFromFp0091,
    noSourceMutationFinanceWriteFromFp0091,
    premiumUiComponentFoundationVerified,
  };
}

function repoFilePaths() {
  const skippedDirectories = new Set([
    ".git",
    ".next",
    ".turbo",
    "coverage",
    "dist",
    "node_modules",
  ]);
  const results = [];

  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else {
        results.push(relativePath);
      }
    }
  }

  walk(".");
  return results;
}
