import { describe, expect, it } from "vitest";
import {
  APP_FORBIDDEN_TOOL_PROOF_CANDIDATES,
  APP_REFUSAL_REASONS,
  APP_THREAT_MODEL_QUESTIONS,
  AppCapabilityBoundaryFetchSchema,
  AppEvidenceFetchSchema,
  AppEvidenceQuerySchema,
  AppNoRuntimeBoundarySchema,
  AppOAuthDeferredBoundarySchema,
  AppProofSchema,
  AppProofPlanSchema,
  AppPromptInjectionBoundarySchema,
  AppProviderCertificationDeferredBoundarySchema,
  AppPrivacyBoundarySchema,
  AppRefusalPostureSchema,
  AppSourceCoverageFetchSchema,
  AppSubmissionDeferredBoundarySchema,
  AppThreatModelQuestionsSchema,
  BaseAppPrivacyBoundary,
  BaseAppPromptInjectionBoundary,
  MCP_TOOL_ALLOWLIST,
  McpToolAllowlistSchema,
  ReadOnlyChatGptAppPlanSchema,
  ReadOnlyMcpServerPlanSchema,
  buildAppAuthorityBoundary,
  buildAppNoRuntimeBoundary,
  buildReadOnlyChatGptAppMcpProof,
  classifyMcpToolCandidate,
  isMcpToolAllowed,
} from "./read-only-app-mcp";
import {
  appPlanInput,
  capabilityBoundaryInput,
  evidenceFetchInput,
  evidenceQueryInput,
  freshness,
  humanReviewAction,
  limitation,
  oauthBoundaryInput,
  proofPlanInput,
  providerCertificationBoundaryInput,
  refusalPostureInput,
  responseRequiredFields,
  schemaVersion,
  sourceCoverageInput,
  submissionBoundaryInput,
  threatModelQuestionsInput,
} from "./read-only-app-mcp.spec-support";

describe("V2G read-only ChatGPT App/MCP contracts", () => {
  it("keeps the MCP tool allowlist exact and read-only", () => {
    const parsed = McpToolAllowlistSchema.parse([...MCP_TOOL_ALLOWLIST]);

    expect(parsed).toEqual([
      "search_evidence",
      "fetch_evidence_card",
      "fetch_source_anchor",
      "fetch_document_map",
      "fetch_source_coverage",
      "fetch_company_posture",
      "fetch_capability_boundaries",
    ]);
    expect(isMcpToolAllowed("search_evidence")).toBe(true);
    expect(isMcpToolAllowed("search evidence")).toBe(false);
    expect(
      McpToolAllowlistSchema.safeParse([...MCP_TOOL_ALLOWLIST, "send_report"])
        .success,
    ).toBe(false);
    expect(
      McpToolAllowlistSchema.safeParse([
        ...MCP_TOOL_ALLOWLIST.slice(0, -1),
        MCP_TOOL_ALLOWLIST[0],
      ]).success,
    ).toBe(false);
    expect(
      McpToolAllowlistSchema.safeParse(MCP_TOOL_ALLOWLIST.slice(0, -1))
        .success,
    ).toBe(false);
    expect(
      McpToolAllowlistSchema.safeParse([
        "fetch_evidence_card",
        "search_evidence",
        "fetch_source_anchor",
        "fetch_document_map",
        "fetch_source_coverage",
        "fetch_company_posture",
        "fetch_capability_boundaries",
      ]).success,
    ).toBe(false);
    expect(
      McpToolAllowlistSchema.safeParse([
        ...MCP_TOOL_ALLOWLIST.slice(0, -1),
        "dynamic_tool",
      ]).success,
    ).toBe(false);
    expect(isMcpToolAllowed("dynamic_tool")).toBe(false);
  });

  it("rejects exact and renamed write/action/provider/deployment tools", () => {
    for (const candidate of APP_FORBIDDEN_TOOL_PROOF_CANDIDATES) {
      const classification = classifyMcpToolCandidate(candidate);
      expect(classification.forbidden).toBe(true);
      expect(classification.allowedReadOnlyTool).toBe(false);
      expect(isMcpToolAllowed(candidate)).toBe(false);
    }

    expect(classifyMcpToolCandidate("pay vendor").canonicalForbiddenTool).toBe(
      "issue_payment_instruction",
    );
    expect(
      classifyMcpToolCandidate("remote MCP deployment").canonicalForbiddenTool,
    ).toBe("start_remote_mcp_server");
    expect(
      classifyMcpToolCandidate("legal opinion").canonicalForbiddenTool,
    ).toBe("give_legal_advice");
    expect(classifyMcpToolCandidate("approve this").forbidden).toBe(true);
    expect(classifyMcpToolCandidate("delete source pack").forbidden).toBe(
      true,
    );
    expect(classifyMcpToolCandidate("connect provider").forbidden).toBe(true);
    expect(classifyMcpToolCandidate("certify this close").forbidden).toBe(
      true,
    );
    expect(classifyMcpToolCandidate("send to customer").forbidden).toBe(true);
    expect(classifyMcpToolCandidate("pay invoice").forbidden).toBe(true);
  });

  it("parses plan contracts without implementing an app or server", () => {
    const noRuntimeBoundary = buildAppNoRuntimeBoundary();
    const appPlan = ReadOnlyChatGptAppPlanSchema.parse({
      allowedTools: [...MCP_TOOL_ALLOWLIST],
      appSubmissionStarted: false,
      appsSdkUiImplemented: false,
      authorityBoundary: buildAppAuthorityBoundary(),
      contractOnly: true,
      forbiddenTools: ["send_report", "provider_call", "submit_app"],
      hostedToolsAllowed: false,
      localProofOnly: true,
      modelCallsAllowed: false,
      noRuntimeBoundary,
      oauthImplemented: false,
      openAiApiCallsAllowed: false,
      planKind: "ReadOnlyChatGptAppPlan",
      publicChatGptAppImplemented: false,
      responseRequiredFields: [
        "evidence",
        "freshness",
        "limitations",
        "permittedNextActions",
        "citations",
        "refusalPosture",
        "forbiddenActions",
      ],
      schemaVersion,
    });
    const mcpPlan = ReadOnlyMcpServerPlanSchema.parse({
      contractOnly: true,
      endpointsImplemented: false,
      forbiddenTools: ["send_report", "provider_call", "submit_app"],
      localProofOnly: true,
      noMcpServerRuntime: true,
      noRemoteMcpDeployment: true,
      planKind: "ReadOnlyMcpServerPlan",
      remoteDeploymentImplemented: false,
      schemaVersion,
      serverImplemented: false,
      toolAllowlist: [...MCP_TOOL_ALLOWLIST],
    });

    expect(appPlan.publicChatGptAppImplemented).toBe(false);
    expect(mcpPlan.serverImplemented).toBe(false);
    expect(
      AppNoRuntimeBoundarySchema.safeParse({
        ...noRuntimeBoundary,
        noOpenAiApiCalls: false,
      }).success,
    ).toBe(false);
  });

  it("describes query and fetch contracts without model calls or raw dumps", () => {
    const query = AppEvidenceQuerySchema.parse({
      boundedExcerptsOnly: true,
      maxExcerptCharacters: 240,
      modelCallsAllowed: false,
      openAiApiCallsAllowed: false,
      queryKind: "AppEvidenceQuery",
      queryText: "synthetic evidence posture",
      rawFullFileDumpsAllowed: false,
      readsEvidenceMetadataOnly: true,
      requiresCitations: true,
      responseRequiredFields: responseRequiredFields,
      schemaVersion,
      vectorFileSearchAllowed: false,
    });
    const fetch = AppEvidenceFetchSchema.parse({
      artifactId: "synthetic-evidence-card",
      boundedExcerptsOnly: true,
      existingArtifactOnly: true,
      fetchKind: "evidence_card",
      rawFullFileDumpsAllowed: false,
      requiresCitations: true,
      responseRequiredFields: query.responseRequiredFields,
      schemaVersion,
      sourceMutationAllowed: false,
    });

    expect(query.modelCallsAllowed).toBe(false);
    expect(fetch.rawFullFileDumpsAllowed).toBe(false);
    expect(
      AppEvidenceFetchSchema.safeParse({
        ...fetch,
        rawFullFileDumpsAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("requires full response posture on response-bearing fetch contracts", () => {
    const sourceCoverage = AppSourceCoverageFetchSchema.parse({
      createsSourceCoverage: false,
      existingCoverageOnly: true,
      fetchKind: "source_coverage",
      freshness: freshness(),
      limitations: [limitation()],
      mutatesSourcePacks: false,
      responseRequiredFields,
      returnsFreshnessPosture: true,
      returnsUnsupportedMissingStalePosture: true,
      schemaVersion,
    });
    const capabilityBoundary = AppCapabilityBoundaryFetchSchema.parse({
      allowedTools: [...MCP_TOOL_ALLOWLIST],
      fetchKind: "capability_boundaries",
      forbiddenTools: ["send_report", "provider_call", "submit_app"],
      noWriteOrActionTools: true,
      permittedNextActions: [humanReviewAction()],
      responseRequiredFields,
      returnsForbiddenActions: true,
      returnsLimitations: true,
      returnsPermittedNextActions: true,
      schemaVersion,
    });

    expect(sourceCoverage.responseRequiredFields).toEqual(
      responseRequiredFields,
    );
    expect(capabilityBoundary.responseRequiredFields).toEqual(
      responseRequiredFields,
    );
    expect(
      AppSourceCoverageFetchSchema.safeParse({
        ...sourceCoverage,
        responseRequiredFields: responseRequiredFields.slice(0, -1),
      }).success,
    ).toBe(false);
    expect(
      AppCapabilityBoundaryFetchSchema.safeParse({
        ...capabilityBoundary,
        responseRequiredFields: responseRequiredFields.slice(0, -1),
      }).success,
    ).toBe(false);
  });

  it("rejects unknown keys on V2G boundary-bearing contracts", () => {
    const noRuntimeBoundary = buildAppNoRuntimeBoundary();
    const schemaCases = [
      [ReadOnlyChatGptAppPlanSchema, appPlanInput(noRuntimeBoundary)],
      [AppEvidenceQuerySchema, evidenceQueryInput()],
      [AppEvidenceFetchSchema, evidenceFetchInput()],
      [AppSourceCoverageFetchSchema, sourceCoverageInput()],
      [AppCapabilityBoundaryFetchSchema, capabilityBoundaryInput()],
      [AppRefusalPostureSchema, refusalPostureInput()],
      [AppPromptInjectionBoundarySchema, BaseAppPromptInjectionBoundary],
      [AppPrivacyBoundarySchema, BaseAppPrivacyBoundary],
      [AppNoRuntimeBoundarySchema, noRuntimeBoundary],
      [AppOAuthDeferredBoundarySchema, oauthBoundaryInput()],
      [AppSubmissionDeferredBoundarySchema, submissionBoundaryInput()],
      [
        AppProviderCertificationDeferredBoundarySchema,
        providerCertificationBoundaryInput(),
      ],
      [AppProofPlanSchema, proofPlanInput()],
      [AppThreatModelQuestionsSchema, threatModelQuestionsInput()],
      [AppProofSchema, buildReadOnlyChatGptAppMcpProof()],
    ] as const;

    for (const [schema, value] of schemaCases) {
      expect(schema.safeParse({ ...value, unknownKey: true }).success).toBe(
        false,
      );
    }
  });

  it("builds a machine-readable proof for the full V2G boundary", () => {
    const proof = AppProofSchema.parse(buildReadOnlyChatGptAppMcpProof());

    expect(proof.allowedTools).toEqual([...MCP_TOOL_ALLOWLIST]);
    expect(proof.mcpForbiddenToolsVerified).toBe(true);
    expect(proof.refusalReasons).toEqual([...APP_REFUSAL_REASONS]);
    expect(proof.threatModelQuestionCount).toBe(
      APP_THREAT_MODEL_QUESTIONS.length,
    );
    expect(proof.noProductRuntime).toBe(true);
    expect(proof.noPublicChatGptApp).toBe(true);
    expect(proof.noRemoteMcpDeployment).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noFixturesAdded).toBe(true);
    expect(proof.noSampleDataAdded).toBe(true);
    expect(proof.responseRefusalPostureForbiddenActionsFieldsVerified).toBe(
      true,
    );
    expect(proof.sourceCoverageResponseRequiredFieldsVerified).toBe(true);
    expect(proof.capabilityBoundaryResponseRequiredFieldsVerified).toBe(true);
    expect(proof.appMcpUnknownKeysRejected).toBe(true);
    expect(proof.mcpToolAllowlistDuplicatesRejected).toBe(true);
    expect(proof.mcpToolAllowlistMissingRejected).toBe(true);
    expect(proof.mcpToolAllowlistReorderRejected).toBe(true);
    expect(proof.mcpToolAllowlistExtraRejected).toBe(true);
    expect(proof.mcpDynamicToolsRejected).toBe(true);
    expect(proof.naturalLanguageForbiddenToolsVerified).toBe(true);
    expect(proof.promptInjectionStringsInertDataVerified).toBe(true);
    expect(proof.rawFullFileDumpAndDataExfiltrationRefusalVerified).toBe(true);
    expect(proof.fp0087TypedBoundaryVerified).toBe(true);
    expect(proof.fp0088AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0089AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0090Absent).toBe(true);
    expect(proof.premiumUiSecurityPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiDesignSystemPlanBoundaryVerified).toBe(true);
    expect(proof.noUiImplementationFromFp0088).toBe(true);
    expect(proof.noUiImplementationFromFp0089).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0089).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0088).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0089).toBe(true);
  });
});
