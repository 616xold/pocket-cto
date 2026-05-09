import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ArchitectureMapSchema,
  BENCHMARK_AUTHORITY_LAYERS,
  BENCHMARK_COMMUNITY_SCHEMA_VERSION,
  BENCHMARK_TASK_KINDS,
  BenchmarkCaseSchema,
  BenchmarkNoRuntimeBoundarySchema,
  BenchmarkProofSchema,
  COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS,
  BenchmarkTaskKindSchema,
  BenchmarkTaskTaxonomySchema,
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
  AppProofSchema,
  buildReadOnlyChatGptAppMcpProof,
} from "./read-only-app-mcp";

const checkedAt = "2026-05-09T00:30:00.000Z";
const FP0088_PLAN_FILE =
  "FP-0088-read-only-chatgpt-app-mcp-premium-ui-security-master-plan.md";
const FP0089_PLAN_FILE =
  "FP-0089-read-only-chatgpt-app-mcp-premium-ui-design-system-master-plan.md";
const FP0090_PLAN_FILE =
  "FP-0090-read-only-chatgpt-app-mcp-premium-ui-implementation-master-plan.md";

function safeDemoDataPolicy() {
  return {
    firstGate: true,
    forbiddenFinanceData: [
      "customer_data",
      "vendor_data",
      "payroll_data",
      "tax_data",
      "bank_data",
      "legal_data",
      "board_data",
      "lender_data",
    ],
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

function baseTask(
  taskKind: (typeof BENCHMARK_TASK_KINDS)[number],
  expectedRefusalKind:
    | "none"
    | "missing_citation_refusal"
    | "unsupported_evidence_refusal"
    | "unsafe_action_refusal" = "unsupported_evidence_refusal",
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
      state: "fresh" as const,
      summary: "Fresh synthetic benchmark contract posture.",
    },
    limitationPosture: [
      {
        affectedAnchorIds: [],
        affectedSourceIds: [],
        code: "not_source_truth" as const,
        severity: "blocking" as const,
        summary: "V2F benchmark contracts are not source truth.",
      },
    ],
    noRuntimeBoundary: noRuntimeBoundary(),
    permittedNextActions: [
      {
        action: "request_human_review" as const,
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

function communityPackManifest() {
  return {
    allowedTaskKinds: [...BENCHMARK_TASK_KINDS],
    architectureMap: architectureMap(),
    benchmarkCase: benchmarkCase(),
    containsNoDataOrSourcePackReferences: true,
    contributorChallenge: contributorChallenge(),
    describesFutureCommunityPackOnly: true,
    manifestKind: "CommunityPackManifest",
    noRuntimeBoundary: noRuntimeBoundary(),
    owningFinancePlan: "FP-0086",
    privacyBoundary: privacyBoundary(),
    safeDemoDataPolicy: safeDemoDataPolicy(),
    schemaVersion: BENCHMARK_COMMUNITY_SCHEMA_VERSION,
    syntheticFinanceSourcePolicy: syntheticFinanceSourcePolicy(),
    validationPosture: {
      directProofCommandOnly: true,
      inMemorySyntheticExamplesOnly: true,
      noDataFileAliasesAllowed: true,
      noPackageScriptOrSmokeAlias: true,
    },
  };
}

function fp0087AbsentOrDocsOnlyBoundaryVerified() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0087Files = readdirSync(plansPath).filter((name) =>
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

  const planText = readFileSync(`${plansPath}/${fp0087Files[0]}`, "utf8");
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
        fp0088DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0091Absent: fp0091Absent(),
      premiumUiSecurityPlanBoundaryVerified:
        fp0088DocsOnlyBoundary().premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089DocsOnlyBoundary().premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090DocsOnlyBoundary().premiumUiImplementationPlanBoundaryVerified,
      noUiImplementationFromFp0088:
        fp0088DocsOnlyBoundary().noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089DocsOnlyBoundary().noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089DocsOnlyBoundary().noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090DocsOnlyBoundary().noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090DocsOnlyBoundary().noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090DocsOnlyBoundary().noPublicAppImplementationFromFp0090,
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

function fp0088DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0088Files = readdirSync(plansPath).filter((name) =>
    /^FP-0088/u.test(name),
  );

  if (fp0088Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noEndpointOauthSubmissionFromFp0088: true,
      noUiImplementationFromFp0088: true,
      premiumUiSecurityPlanBoundaryVerified: true,
    };
  }

  if (fp0088Files.length !== 1 || fp0088Files[0] !== FP0088_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noEndpointOauthSubmissionFromFp0088: false,
      noUiImplementationFromFp0088: false,
      premiumUiSecurityPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0088_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0088 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0088: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiImplementationFromFp0088: [
      "does not authorize apps sdk iframe/ui code",
      "future ui polish/design-system implementation plan",
      "do not implement ui",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiSecurityPlanBoundaryVerified: [
      "premium ui readiness requirements only",
      "app/mcp security readiness requirements only",
      "evidenceanswerpanel",
      "privacyboundarypanel",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0089DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0089Files = readdirSync(plansPath).filter((name) =>
    /^FP-0089/u.test(name),
  );

  if (fp0089Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0089: true,
      noEndpointOauthSubmissionFromFp0089: true,
      noUiImplementationFromFp0089: true,
      premiumUiDesignSystemPlanBoundaryVerified: true,
    };
  }

  if (fp0089Files.length !== 1 || fp0089Files[0] !== FP0089_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0089: false,
      noEndpointOauthSubmissionFromFp0089: false,
      noUiImplementationFromFp0089: false,
      premiumUiDesignSystemPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0089_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0089 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "premium ui design-system readiness plan only",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noAppsSdkIframeFromFp0089: [
      "does not authorize apps sdk iframe/ui code",
      "does not authorize public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0089: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize endpoint implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiImplementationFromFp0089: [
      "does not authorize ui code",
      "later ui implementation finance plan before any component code",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiDesignSystemPlanBoundaryVerified: [
      "premium ui design-system readiness plan only",
      "design tokens",
      "semantic color tokens",
      "evidence-card hierarchy",
      "citation/source-anchor affordances",
      "refusal-state visual grammar",
      "keyboard/focus behavior",
      "evidenceanswerpanel",
      "privacyboundarypanel",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0090DocsOnlyBoundary() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  const fp0090Files = readdirSync(plansPath).filter((name) =>
    /^FP-0090/u.test(name),
  );

  if (fp0090Files.length === 0) {
    return {
      absentOrDocsOnlyBoundaryVerified: true,
      noAppsSdkIframeFromFp0090: true,
      noEndpointOauthSubmissionFromFp0090: true,
      noPublicAppImplementationFromFp0090: true,
      noUiCodeFromFp0090: true,
      premiumUiImplementationPlanBoundaryVerified: true,
    };
  }

  if (fp0090Files.length !== 1 || fp0090Files[0] !== FP0090_PLAN_FILE) {
    return {
      absentOrDocsOnlyBoundaryVerified: false,
      noAppsSdkIframeFromFp0090: false,
      noEndpointOauthSubmissionFromFp0090: false,
      noPublicAppImplementationFromFp0090: false,
      noUiCodeFromFp0090: false,
      premiumUiImplementationPlanBoundaryVerified: false,
    };
  }

  const lowerPlanText = readFileSync(
    `${plansPath}/${FP0090_PLAN_FILE}`,
    "utf8",
  ).toLowerCase();

  return {
    absentOrDocsOnlyBoundaryVerified: [
      "fp-0090 is not implementation",
      "docs-and-plan plus proof-gate compatibility",
      "premium ui implementation master-plan only",
      "no product code",
      "no ui implementation",
      "no routes or endpoints",
      "no oauth",
      "no app submission",
      "no public app implementation",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noAppsSdkIframeFromFp0090: [
      "does not authorize apps sdk iframe/ui code yet",
      "apps sdk iframe/ui implementation remains future-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noEndpointOauthSubmissionFromFp0090: [
      "does not authorize remote mcp deployment",
      "does not authorize oauth implementation",
      "does not authorize endpoint implementation",
      "does not authorize public app submission",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noPublicAppImplementationFromFp0090: [
      "does not authorize public app implementation",
      "public chatgpt app implementation remains future-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    noUiCodeFromFp0090: [
      "does not authorize ui code yet",
      "this is not ui implementation",
      "future implementation slice may add ui components only if it remains local/proof-only/read-only",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
    premiumUiImplementationPlanBoundaryVerified: [
      "future ui implementation boundary",
      "screenshot review before merge",
      "accessibility acceptance criteria",
      "evidence hierarchy acceptance",
      "appshell",
      "evidenceanswerpanel",
      "citationrail",
      "apps/web/components/read-only-app-mcp",
    ].every((requiredText) => lowerPlanText.includes(requiredText)),
  };
}

function fp0091Absent() {
  const plansPath = existsSync("plans") ? "plans" : "../../plans";
  return !readdirSync(plansPath).some((name) => /^FP-0091/u.test(name));
}

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

  it("rejects partial or duplicated SafeDemoDataPolicy category lists", () => {
    const safe = safeDemoDataPolicy();

    expect(() =>
      SafeDemoDataPolicySchema.parse({
        ...safe,
        forbiddenFinanceData: [
          "customer_data",
          "vendor_data",
          "payroll_data",
          "tax_data",
          "bank_data",
          "legal_data",
          "board_data",
          "customer_data",
        ],
      }),
    ).toThrow();
    expect(() =>
      SafeDemoDataPolicySchema.parse({
        ...safe,
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
          "credentials",
        ],
      }),
    ).toThrow();
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
    expect(
      BenchmarkTaskTaxonomySchema.parse([...BENCHMARK_TASK_KINDS]),
    ).toEqual(BENCHMARK_TASK_KINDS);
    expect(() =>
      BenchmarkTaskTaxonomySchema.parse([
        "evidence_recall",
        "source_coverage",
        "policy_lookup",
        "report_traceability",
        "monitor_boundary",
        "unsafe_action_refusal",
        "missing_citation",
        "evidence_recall",
      ]),
    ).toThrow();
  });

  it("rejects unknown keys on V2F boundary-bearing schemas", () => {
    const strictSchemas = [
      [SafeDemoDataPolicySchema, safeDemoDataPolicy()],
      [SyntheticFinanceSourcePolicySchema, syntheticFinanceSourcePolicy()],
      [BenchmarkNoRuntimeBoundarySchema, noRuntimeBoundary()],
      [ContributorChallengeSchema, contributorChallenge()],
      [ArchitectureMapSchema, architectureMap()],
      [BenchmarkCaseSchema, benchmarkCase()],
      [CommunityPackManifestSchema, communityPackManifest()],
    ] as const;

    for (const [schema, sample] of strictSchemas) {
      expect(() =>
        schema.parse({
          ...sample,
          runtimeBehaviorSmuggledThroughUnknownKey: true,
        }),
      ).toThrow();
    }
  });

  it("rejects CommunityPackManifest data, source-pack, raw-text, URL, and example aliases", () => {
    for (const field of COMMUNITY_PACK_MANIFEST_FORBIDDEN_DATA_FIELDS) {
      expect(() =>
        CommunityPackManifestSchema.parse({
          ...communityPackManifest(),
          [field]: [],
        }),
      ).toThrow();
      expect(() =>
        CommunityPackManifestSchema.parse({
          ...communityPackManifest(),
          [field]: ["synthetic alias payload"],
        }),
      ).toThrow();
    }
  });

  it("requires the exact V2F architecture authority layer order", () => {
    expect(
      ArchitectureMapSchema.parse(architectureMap()).authorityLayers,
    ).toEqual(BENCHMARK_AUTHORITY_LAYERS);
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [
          ...BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
          "raw_sources",
        ],
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: BENCHMARK_AUTHORITY_LAYERS.slice(0, 7),
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [...BENCHMARK_AUTHORITY_LAYERS, "raw_sources"],
      }),
    ).toThrow();
    expect(() =>
      ArchitectureMapSchema.parse({
        ...architectureMap(),
        authorityLayers: [
          "finance_twin",
          "raw_sources",
          ...BENCHMARK_AUTHORITY_LAYERS.slice(2),
        ],
      }),
    ).toThrow();
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
        readOnlyProofOnly: true,
      }),
      EvidenceFaithfulnessTaskSchema.parse({
        ...baseTask("evidence_faithfulness"),
        readOnlyProofOnly: true,
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

  it("rejects unknown keys on benchmark tasks and nested task posture", () => {
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        recallsExistingEvidenceOnly: true,
        route: "/should-not-exist",
      }),
    ).toThrow();
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        companyContext: {
          ...baseTask("evidence_recall").companyContext,
          rawFullText: "synthetic but forbidden raw text posture",
        },
        recallsExistingEvidenceOnly: true,
      }),
    ).toThrow();
    expect(() =>
      EvidenceRecallTaskSchema.parse({
        ...baseTask("evidence_recall"),
        freshnessPosture: {
          ...baseTask("evidence_recall").freshnessPosture,
          pageTextDump: "synthetic but forbidden page text dump posture",
        },
        recallsExistingEvidenceOnly: true,
      }),
    ).toThrow();
    expect(() =>
      MissingCitationTaskSchema.parse({
        ...baseTask("missing_citation", "missing_citation_refusal"),
        readOnlyProofOnly: true,
        expectedRefusalPosture: {
          ...baseTask("missing_citation", "missing_citation_refusal")
            .expectedRefusalPosture,
          unsafeBypass: true,
        },
      }),
    ).toThrow();
  });

  it("keeps community manifests and benchmark cases as data-free placeholders", () => {
    const manifest = CommunityPackManifestSchema.parse(communityPackManifest());
    const placeholder = BenchmarkCaseSchema.parse(benchmarkCase());

    expect(manifest.containsNoDataOrSourcePackReferences).toBe(true);
    expect(placeholder.placeholderOnly).toBe(true);
    expect(placeholder.noBenchmarkCasesCheckedIn).toBe(true);
  });

  it("proves no-runtime, contributor, architecture, and final proof posture", () => {
    const boundary =
      BenchmarkNoRuntimeBoundarySchema.parse(noRuntimeBoundary());
    const challenge = ContributorChallengeSchema.parse(contributorChallenge());
    const architecture = ArchitectureMapSchema.parse(architectureMap());
    const proof = BenchmarkProofSchema.parse({
      ...boundary,
      architectureMapBoundaryVerified:
        architecture.v2fContractsNotTruthRuntimeOrData,
      authorityLayerDuplicatesRejected: true,
      authorityLayerExtraRejected: true,
      authorityLayerMissingRejected: true,
      authorityLayerReorderRejected: true,
      authorityLayersExactOrderVerified:
        JSON.stringify(architecture.authorityLayers) ===
        JSON.stringify(BENCHMARK_AUTHORITY_LAYERS),
      benchmarkCasePlaceholderOnlyVerified:
        BenchmarkCaseSchema.parse(benchmarkCase()).placeholderOnly,
      benchmarkNoRuntimeBoundaryVerified: boundary.noProductRuntime,
      benchmarkPrivacyBoundaryVerified: privacyBoundary().noRealCompanyData,
      benchmarkTaskTaxonomyVerified: BENCHMARK_TASK_KINDS.length === 8,
      benchmarkProofUnknownKeysRejected: true,
      benchmarkTaskNestedUnknownKeysRejected: true,
      benchmarkTaskUnknownKeysRejected: true,
      communityPackManifestDataAliasesRejected: true,
      communityPackManifestExplicitDataFieldsRejected: true,
      communityPackManifestVerified: true,
      contributorChallengeBoundaryVerified: challenge.noPublicLaunchImplied,
      evidenceFaithfulnessTaskVerified: true,
      evidenceFreshnessLimitationsPermittedActionFieldsVerified: true,
      evidenceRecallTaskVerified: true,
      forbiddenActionsVerified: true,
      fp0087AbsentOrDocsOnlyBoundaryVerified:
        fp0087AbsentOrDocsOnlyBoundaryVerified(),
      fp0088AbsentOrDocsOnlyBoundaryVerified:
        fp0088DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0089AbsentOrDocsOnlyBoundaryVerified:
        fp0089DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0090AbsentOrDocsOnlyBoundaryVerified:
        fp0090DocsOnlyBoundary().absentOrDocsOnlyBoundaryVerified,
      fp0091Absent: fp0091Absent(),
      premiumUiSecurityPlanBoundaryVerified:
        fp0088DocsOnlyBoundary().premiumUiSecurityPlanBoundaryVerified,
      premiumUiDesignSystemPlanBoundaryVerified:
        fp0089DocsOnlyBoundary().premiumUiDesignSystemPlanBoundaryVerified,
      premiumUiImplementationPlanBoundaryVerified:
        fp0090DocsOnlyBoundary().premiumUiImplementationPlanBoundaryVerified,
      noUiImplementationFromFp0088:
        fp0088DocsOnlyBoundary().noUiImplementationFromFp0088,
      noUiImplementationFromFp0089:
        fp0089DocsOnlyBoundary().noUiImplementationFromFp0089,
      noAppsSdkIframeFromFp0089:
        fp0089DocsOnlyBoundary().noAppsSdkIframeFromFp0089,
      noUiCodeFromFp0090: fp0090DocsOnlyBoundary().noUiCodeFromFp0090,
      noAppsSdkIframeFromFp0090:
        fp0090DocsOnlyBoundary().noAppsSdkIframeFromFp0090,
      noEndpointOauthSubmissionFromFp0088:
        fp0088DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0088,
      noEndpointOauthSubmissionFromFp0089:
        fp0089DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0089,
      noEndpointOauthSubmissionFromFp0090:
        fp0090DocsOnlyBoundary().noEndpointOauthSubmissionFromFp0090,
      noPublicAppImplementationFromFp0090:
        fp0090DocsOnlyBoundary().noPublicAppImplementationFromFp0090,
      inMemorySyntheticExamplesOnlyVerified: true,
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
      syntheticExamplesClearlyLabeledVerified: true,
      syntheticFinanceSourcePolicyVerified: true,
      unknownKeysRejected: true,
      unsafeActionRefusalTaskVerified: true,
    });

    expect(proof.localProofOnly).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.fp0087AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0088AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0089AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0090AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0091Absent).toBe(true);
    expect(proof.premiumUiSecurityPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiDesignSystemPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiImplementationPlanBoundaryVerified).toBe(true);
    expect(proof.noUiImplementationFromFp0088).toBe(true);
    expect(proof.noUiImplementationFromFp0089).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0089).toBe(true);
    expect(proof.noUiCodeFromFp0090).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0090).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0088).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0089).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0090).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0090).toBe(true);
    expect(() =>
      BenchmarkProofSchema.parse({
        ...proof,
        rawFullText: "synthetic but forbidden proof field",
      }),
    ).toThrow();
  });
});
