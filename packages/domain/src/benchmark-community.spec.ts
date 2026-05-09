import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ArchitectureMapSchema,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
  BenchmarkTaskKindSchema,
  CommunityPackManifestSchema,
  ContributorChallengeSchema,
  EvidenceFaithfulnessTaskSchema,
  EvidenceRecallTaskSchema,
  MissingCitationTaskSchema,
  PolicyLookupTaskSchema,
  ReportTraceabilityTaskSchema,
  SafeDemoDataPolicySchema,
  SourceCoverageTaskSchema,
  SyntheticFinanceSourcePolicySchema,
  UnsafeActionRefusalTaskSchema,
  MonitorBoundaryTaskSchema,
} from "./benchmark-community";
import {
  architectureMap,
  baseTask,
  benchmarkCase,
  contributorChallenge,
  noRuntimeBoundary,
  privacyBoundary,
  safeDemoDataPolicy,
  syntheticFinanceSourcePolicy,
} from "./benchmark-community-test-data";

describe("benchmark community pack foundation contracts", () => {
  it("puts SafeDemoDataPolicy first and forbids real or lightly anonymized finance data", () => {
    const safe = SafeDemoDataPolicySchema.parse(safeDemoDataPolicy());
    const synthetic = SyntheticFinanceSourcePolicySchema.parse(
      syntheticFinanceSourcePolicy(),
    );

    expect(safe.firstGate).toBe(true);
    expect(safe.forbidsRealCompanyData).toBe(true);
    expect(safe.forbidsLightlyAnonymizedRealFinanceData).toBe(true);
    expect(safe.forbiddenFinanceData).toEqual(
      expect.arrayContaining([
        "customer_data",
        "vendor_data",
        "payroll_data",
        "tax_data",
        "bank_data",
        "legal_data",
        "board_data",
        "lender_data",
      ]),
    );
    expect(safe.forbiddenPrivateArtifacts).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(synthetic.gatedBySafeDemoDataPolicyFirst).toBe(true);
    expect(synthetic.requiresInventedCompanyFacts).toBe(true);
    expect(synthetic.requiresInventedSourceFacts).toBe(true);
    expect(synthetic.requiresClearSyntheticLabeling).toBe(true);
  });

  it("defines only the allowed read-only benchmark task taxonomy", () => {
    expect(BENCHMARK_TASK_KINDS).toEqual([
      "evidence_recall",
      "source_coverage",
      "policy_lookup",
      "report_traceability",
      "monitor_boundary",
      "unsafe_action_refusal",
      "missing_citation",
      "evidence_faithfulness",
    ]);
    expect(
      BENCHMARK_TASK_KINDS.map((kind) => BenchmarkTaskKindSchema.parse(kind)),
    ).toHaveLength(8);
  });

  it("parses all task contracts with evidence, freshness, limitations, actions, and refusal posture", () => {
    const tasks = [
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        recallsExistingEvidenceOnly: true,
      }),
      SourceCoverageTaskSchema.parse({
        ...baseTask("source_coverage"),
        checksSupportedUnsupportedMissingStaleFailedNotIndexed: true,
      }),
      PolicyLookupTaskSchema.parse({
        ...baseTask("policy_lookup"),
        explicitPolicySourceScopeRequired: true,
        noLegalOrPolicyAdvice: true,
      }),
      ReportTraceabilityTaskSchema.parse({
        ...baseTask("report_traceability"),
        createsOrReleasesReports: false,
        tracesStoredArtifactsOnly: true,
      }),
      MonitorBoundaryTaskSchema.parse({
        ...baseTask("monitor_boundary"),
        createsAlertsOrMissions: false,
        deterministicStoredStateOnly: true,
      }),
      UnsafeActionRefusalTaskSchema.parse({
        ...baseTask("unsafe_action_refusal", "unsafe_action_refusal"),
        readOnlyProofOnly: true,
      }),
      MissingCitationTaskSchema.parse({
        ...baseTask("missing_citation", "missing_citation_refusal"),
      }),
      EvidenceFaithfulnessTaskSchema.parse({
        ...baseTask("evidence_faithfulness"),
        rejectsConflictingEvidence: true,
        rejectsMissingEvidence: true,
        rejectsRawFullFileDumpLikePosture: true,
        rejectsStaleEvidence: true,
        rejectsUncitedClaims: true,
        rejectsUnsupportedEvidence: true,
      }),
    ];

    expect(tasks.map((task) => task.taskKind)).toEqual(BENCHMARK_TASK_KINDS);
    expect(
      tasks.every(
        (task) =>
          task.readOnlyDefinitionOnly &&
          task.evidenceRequirements.noFullFileDumps &&
          task.freshnessPosture.state === "fresh" &&
          task.limitationPosture.length > 0 &&
          task.permittedNextActions.length > 0 &&
          task.citationRequirements.sourceAnchorOrAcceptedDerivedRefRequired &&
          task.privacyBoundary.noRealCompanyData &&
          task.noRuntimeBoundary.noProductRuntime,
      ),
    ).toBe(true);
  });

  it("keeps community manifests and benchmark cases as data-free placeholders", () => {
    const manifest = CommunityPackManifestSchema.parse({
      allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
      architectureMap: architectureMap(),
      benchmarkCase: benchmarkCase(),
      contributorChallenge: contributorChallenge(),
      dataFiles: [],
      describesFutureCommunityPackOnly: true,
      evalDatasetFiles: [],
      fixtureFiles: [],
      manifestKind: "CommunityPackManifest",
      noRuntimeBoundary: noRuntimeBoundary(),
      owningFinancePlan: "FP-0086",
      privacyBoundary: privacyBoundary(),
      safeDemoDataPolicy: safeDemoDataPolicy(),
      schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
      sourcePackFiles: [],
      syntheticFinanceSourcePolicy: syntheticFinanceSourcePolicy(),
      validationPosture: {
        directProofCommandOnly: true,
        inMemorySyntheticExamplesOnly: true,
        noPackageScriptOrSmokeAlias: true,
      },
    });
    const placeholder = BenchmarkCaseSchema.parse(benchmarkCase());

    expect(manifest.dataFiles).toEqual([]);
    expect(manifest.sourcePackFiles).toEqual([]);
    expect(manifest.evalDatasetFiles).toEqual([]);
    expect(placeholder.placeholderOnly).toBe(true);
    expect(placeholder.noBenchmarkCasesCheckedIn).toBe(true);
  });

  it("proves no-runtime, contributor, architecture, and final proof posture", () => {
    const boundary = BenchmarkNoRuntimeBoundarySchema.parse(noRuntimeBoundary());
    const challenge = ContributorChallengeSchema.parse(contributorChallenge());
    const architecture = ArchitectureMapSchema.parse(architectureMap());
    const proof = BenchmarkProofSchema.parse({
      ...boundary,
      architectureMapBoundaryVerified:
        architecture.v2fContractsNotTruthRuntimeOrData,
      benchmarkCasePlaceholderOnlyVerified:
        BenchmarkCaseSchema.parse(benchmarkCase()).placeholderOnly,
      benchmarkNoRuntimeBoundaryVerified: boundary.noProductRuntime,
      benchmarkPrivacyBoundaryVerified: privacyBoundary().noRealCompanyData,
      benchmarkTaskTaxonomyVerified: BENCHMARK_TASK_KINDS.length === 8,
      communityPackManifestVerified: true,
      contributorChallengeBoundaryVerified: challenge.noPublicLaunchImplied,
      evidenceFaithfulnessTaskVerified: true,
      evidenceFreshnessLimitationsPermittedActionFieldsVerified: true,
      evidenceRecallTaskVerified: true,
      forbiddenActionsVerified: true,
      fp0087Absent: !existsSync("plans/FP-0087.md"),
      missingCitationTaskVerified: true,
      monitorBoundaryTaskVerified: true,
      noCredentialTokenSecretPolicyVerified:
        safeDemoDataPolicy().forbiddenPrivateArtifacts.includes("secrets"),
      noPrivateCustomerVendorPayrollTaxBankLegalBoardLenderDataVerified:
        safeDemoDataPolicy().forbiddenFinanceData.includes("payroll_data"),
      noRealFinanceDataPolicyVerified:
        safeDemoDataPolicy().forbidsRealCompanyData,
      policyLookupTaskVerified: true,
      reportTraceabilityTaskVerified: true,
      safeDemoDataPolicyVerified: true,
      sourceCoverageTaskVerified: true,
      syntheticFinanceSourcePolicyVerified: true,
      unsafeActionRefusalTaskVerified: true,
    });

    expect(proof.localProofOnly).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.fp0087Absent).toBe(true);
  });
});
