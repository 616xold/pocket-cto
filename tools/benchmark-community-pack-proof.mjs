import { existsSync, readFileSync } from "node:fs";
import {
  ArchitectureMapSchema,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
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
} from "../packages/domain/src/index.ts";
import {
  architectureMap,
  baseTask,
  benchmarkCase,
  contributorChallenge,
  noRuntimeBoundary,
  privacyBoundary,
  safeDemoDataPolicy,
  syntheticFinanceSourcePolicy,
} from "../packages/domain/src/benchmark-community-test-data.ts";

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
  [EvidenceRecallTaskSchema, "evidence_recall", { recallsExistingEvidenceOnly: true }],
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
    {},
    "missing_citation_refusal",
  ],
  [
    EvidenceFaithfulnessTaskSchema,
    "evidence_faithfulness",
    {
      rejectsConflictingEvidence: true,
      rejectsMissingEvidence: true,
      rejectsRawFullFileDumpLikePosture: true,
      rejectsStaleEvidence: true,
      rejectsUncitedClaims: true,
      rejectsUnsupportedEvidence: true,
    },
  ],
];

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
const manifest = CommunityPackManifestSchema.parse({
  allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
  architectureMap: architecture,
  benchmarkCase: placeholder,
  contributorChallenge: challenge,
  dataFiles: [],
  describesFutureCommunityPackOnly: true,
  evalDatasetFiles: [],
  fixtureFiles: [],
  manifestKind: "CommunityPackManifest",
  noRuntimeBoundary: noRuntime,
  owningFinancePlan: "FP-0086",
  privacyBoundary: privacy,
  safeDemoDataPolicy: safePolicy,
  schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  sourcePackFiles: [],
  syntheticFinanceSourcePolicy: syntheticPolicy,
  validationPosture: {
    directProofCommandOnly: true,
    inMemorySyntheticExamplesOnly: true,
    noPackageScriptOrSmokeAlias: true,
  },
});

const proof = BenchmarkProofSchema.parse({
  ...noRuntime,
  architectureMapBoundaryVerified: architecture.v2fContractsNotTruthRuntimeOrData,
  benchmarkCasePlaceholderOnlyVerified: placeholder.placeholderOnly,
  benchmarkNoRuntimeBoundaryVerified: noRuntime.noProductRuntime,
  benchmarkPrivacyBoundaryVerified: privacy.noRealCompanyData,
  benchmarkTaskTaxonomyVerified:
    JSON.stringify(tasks.map((task) => task.taskKind)) ===
    JSON.stringify(BENCHMARK_TASK_KINDS),
  communityPackManifestVerified:
    manifest.dataFiles.length === 0 &&
    manifest.sourcePackFiles.length === 0 &&
    manifest.evalDatasetFiles.length === 0 &&
    manifest.fixtureFiles.length === 0,
  contributorChallengeBoundaryVerified:
    challenge.noPublicLaunchImplied &&
    challenge.noSaasDeploymentImplied &&
    challenge.noProviderIntegrationImplied,
  evidenceFaithfulnessTaskVerified:
    taskFor("evidence_faithfulness")?.proofExpectations.noDatasetRequired === true,
  evidenceFreshnessLimitationsPermittedActionFieldsVerified: tasks.every(
    (task) =>
      task.freshnessPosture.summary &&
      task.limitationPosture.length > 0 &&
      task.permittedNextActions.length > 0,
  ),
  evidenceRecallTaskVerified:
    taskFor("evidence_recall")?.evidenceRequirements.evidenceIndexAllowed === true,
  forbiddenActionsVerified: tasks.every((task) =>
    ["openai_api_call", "finance_write", "autonomous_action"].every((action) =>
      task.forbiddenActions.includes(action),
    ),
  ),
  fp0087Absent: !existsSync("plans/FP-0087.md"),
  missingCitationTaskVerified:
    taskFor("missing_citation")?.expectedRefusalPosture.expectedRefusalKind ===
    "missing_citation_refusal",
  monitorBoundaryTaskVerified:
    taskFor("monitor_boundary")?.noRuntimeBoundary.noProductRuntime === true,
  noCredentialTokenSecretPolicyVerified: ["credentials", "tokens", "secrets"].every(
    (artifact) => safePolicy.forbiddenPrivateArtifacts.includes(artifact),
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
    taskFor("source_coverage")?.expectedRefusalPosture.whenEvidenceUnsupported ===
    "unsupported_evidence_refusal",
  syntheticFinanceSourcePolicyVerified:
    syntheticPolicy.requiresInventedCompanyFacts &&
    syntheticPolicy.requiresInventedSourceFacts &&
    syntheticPolicy.requiresClearSyntheticLabeling,
  unsafeActionRefusalTaskVerified:
    taskFor("unsafe_action_refusal")?.expectedRefusalPosture.expectedRefusalKind ===
    "unsafe_action_refusal",
});

for (const [key, value] of Object.entries(proof)) {
  if (typeof value === "boolean" && value !== true) {
    throw new Error(`V2F benchmark community proof failed: ${key}`);
  }
}

console.log(JSON.stringify(proof, null, 2));
