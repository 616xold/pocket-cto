import { describe, expect, it } from "vitest";
import {
  APP_FORBIDDEN_TOOL_PROOF_CANDIDATES,
  APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
  APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS,
  AppMcpDataExfiltrationEnvelopeSchema,
  AppMcpDescriptorEnvelopeProofSchema,
  AppMcpEvidenceEnvelopeSchema,
  AppMcpMissingCitationEnvelopeSchema,
  AppMcpPromptInjectionEnvelopeSchema,
  AppMcpRawFullFileDumpRefusalEnvelopeSchema,
  AppMcpResponseEnvelopeSchema,
  AppMcpStaleEvidenceEnvelopeSchema,
  AppMcpUnsafeActionEnvelopeSchema,
  AppMcpUnsupportedEvidenceEnvelopeSchema,
  MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS,
  MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS,
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
  McpDescriptorAnnotationsSchema,
  McpDescriptorCapabilityMetadataSchema,
  McpDescriptorInputSchemaContractSchema,
  McpDescriptorOutputSchemaContractSchema,
  McpToolDescriptorContractSchema,
  buildAppMcpDescriptorEnvelopeProof,
  buildAppMcpEvidenceEnvelope,
  buildAppMcpRefusalEnvelope,
  buildMcpToolDescriptorContracts,
  classifyMcpToolCandidate,
  containsForbiddenResponseField,
  responseEnvelopeRejectsForbiddenFields,
} from "./read-only-app-mcp";

describe("V2G read-only MCP descriptors and app/MCP envelopes", () => {
  it("builds exact local proof-only read-only MCP descriptors", () => {
    const descriptors = buildMcpToolDescriptorContracts();

    expect(descriptors.map((descriptor) => descriptor.toolName)).toEqual([
      "search_evidence",
      "fetch_evidence_card",
      "fetch_source_anchor",
      "fetch_document_map",
      "fetch_source_coverage",
      "fetch_company_posture",
      "fetch_capability_boundaries",
    ]);

    for (const descriptor of descriptors) {
      expect(
        McpToolDescriptorContractSchema.safeParse(descriptor).success,
      ).toBe(true);
      expect(descriptor.localProofOnly).toBe(true);
      expect(descriptor.usableAsLiveServerDescriptor).toBe(false);
      expect(descriptor.serverRuntimeImplemented).toBe(false);
      expect(descriptor.endpointImplemented).toBe(false);
      expect(descriptor.remoteDeploymentImplemented).toBe(false);
      expect(descriptor.annotations.readOnlyHint).toBe(true);
      expect(descriptor.annotations.destructiveHint).toBe(false);
      expect(descriptor.capabilityMetadata.readOnly).toBe(true);
      expect(descriptor.capabilityMetadata.callsProvider).toBe(false);
      expect(descriptor.capabilityMetadata.issuesPaymentOrCustomerContact).toBe(
        false,
      );
      expect(descriptor.capabilityMetadata.takesAutonomousAction).toBe(false);
      expect(descriptor.forbiddenTools).toEqual([...MCP_FORBIDDEN_TOOL_NAMES]);
      expect(
        McpToolDescriptorContractSchema.safeParse({
          ...descriptor,
          forbiddenTools: descriptor.forbiddenTools.slice(0, -1),
        }).success,
      ).toBe(false);
      expect(
        McpToolDescriptorContractSchema.safeParse({
          ...descriptor,
          forbiddenTools: [
            descriptor.forbiddenTools[1],
            descriptor.forbiddenTools[0],
            ...descriptor.forbiddenTools.slice(2),
          ],
        }).success,
      ).toBe(false);
    }
  });

  it("keeps descriptor input schemas strict and free of write/action fields", () => {
    for (const descriptor of buildMcpToolDescriptorContracts()) {
      expect(descriptor.inputSchema.strict).toBe(true);
      expect(
        descriptor.inputSchema.fields.some((field) =>
          MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS.includes(field as never),
        ),
      ).toBe(false);
      expect(
        McpDescriptorInputSchemaContractSchema.safeParse({
          ...descriptor.inputSchema,
          acceptsFinanceWrites: true,
        }).success,
      ).toBe(false);
      expect(descriptor.inputSchema.forbiddenFields).toEqual([
        ...MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS,
      ]);
      expect(
        McpDescriptorInputSchemaContractSchema.safeParse({
          ...descriptor.inputSchema,
          forbiddenFields: descriptor.inputSchema.forbiddenFields.slice(0, -1),
        }).success,
      ).toBe(false);
      expect(
        McpDescriptorInputSchemaContractSchema.safeParse({
          ...descriptor.inputSchema,
          forbiddenFields: [
            descriptor.inputSchema.forbiddenFields[1],
            descriptor.inputSchema.forbiddenFields[0],
            ...descriptor.inputSchema.forbiddenFields.slice(2),
          ],
        }).success,
      ).toBe(false);

      for (const forbiddenField of MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS) {
        expect(
          McpDescriptorInputSchemaContractSchema.safeParse({
            ...descriptor.inputSchema,
            fields: [...descriptor.inputSchema.fields, forbiddenField],
          }).success,
        ).toBe(false);
      }
    }
  });

  it("requires strict output response envelopes for every descriptor", () => {
    for (const descriptor of buildMcpToolDescriptorContracts()) {
      expect(descriptor.outputSchema.requiredFields).toEqual([
        ...MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS,
      ]);
      expect(descriptor.outputSchema.rawFullFileDumpFieldsAllowed).toBe(false);
      expect(descriptor.outputSchema.privateDataFieldsAllowed).toBe(false);
      expect(
        descriptor.outputSchema.requiredFields.includes("privacyBoundary"),
      ).toBe(true);
      expect(
        descriptor.outputSchema.requiredFields.includes("authorityBoundary"),
      ).toBe(true);
    }
  });

  it("parses evidence and fail-closed response envelope variants", () => {
    const evidence = buildAppMcpEvidenceEnvelope();
    const missingCitation = buildAppMcpRefusalEnvelope("missing_citation");
    const unsupportedEvidence = buildAppMcpRefusalEnvelope(
      "unsupported_evidence",
    );
    const staleEvidence = buildAppMcpRefusalEnvelope("stale_evidence");
    const promptInjection = buildAppMcpRefusalEnvelope("prompt_injection");
    const dataExfiltration = buildAppMcpRefusalEnvelope("data_exfiltration");
    const rawFullFileDump = buildAppMcpRefusalEnvelope(
      "raw_full_file_dump_request",
    );
    const unsafeAction = buildAppMcpRefusalEnvelope("unsafe_action");

    expect(AppMcpEvidenceEnvelopeSchema.safeParse(evidence).success).toBe(true);
    expect(AppMcpResponseEnvelopeSchema.safeParse(evidence).success).toBe(true);
    expect(
      AppMcpMissingCitationEnvelopeSchema.safeParse(missingCitation).success,
    ).toBe(true);
    expect(
      AppMcpUnsupportedEvidenceEnvelopeSchema.safeParse(unsupportedEvidence)
        .success,
    ).toBe(true);
    expect(
      AppMcpStaleEvidenceEnvelopeSchema.safeParse(staleEvidence).success,
    ).toBe(true);
    expect(
      AppMcpPromptInjectionEnvelopeSchema.safeParse(promptInjection).success,
    ).toBe(true);
    expect(
      AppMcpDataExfiltrationEnvelopeSchema.safeParse(dataExfiltration).success,
    ).toBe(true);
    expect(
      AppMcpRawFullFileDumpRefusalEnvelopeSchema.safeParse(rawFullFileDump)
        .success,
    ).toBe(true);
    expect(
      AppMcpUnsafeActionEnvelopeSchema.safeParse(unsafeAction).success,
    ).toBe(true);

    expect(missingCitation.refusalPosture.failClosed).toBe(true);
    expect(unsupportedEvidence.freshness.state).toBe("unsupported");
    expect(staleEvidence.freshness.state).toBe("stale");
    expect(promptInjection.refusalPosture.sourceInstructionsTreatedAsData).toBe(
      true,
    );
    expect(rawFullFileDump.refusalPosture.reason).toBe(
      "raw_full_file_dump_request",
    );
    expect(unsafeAction.refusalPosture.noActionTaken).toBe(true);
  });

  it("rejects raw full-file and private data fields in response envelopes", () => {
    const evidence = buildAppMcpEvidenceEnvelope();
    const withRawFullText = { ...evidence, rawFullText: "private source text" };
    const withNestedToken = {
      ...evidence,
      evidence: [{ ...evidence.evidence[0], tokens: "secret" }],
    };

    expect(containsForbiddenResponseField(withRawFullText)).toBe(true);
    expect(containsForbiddenResponseField(withNestedToken)).toBe(true);
    expect(
      AppMcpResponseEnvelopeSchema.safeParse(withRawFullText).success,
    ).toBe(false);
    expect(
      AppMcpResponseEnvelopeSchema.safeParse(withNestedToken).success,
    ).toBe(false);
    expect(responseEnvelopeRejectsForbiddenFields()).toBe(true);

    expect(APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES).toEqual([
      "rawFullText",
      "rawFileText",
      "fullText",
      "fullFileText",
      "fileContents",
      "unboundedText",
      "originalFullText",
      "sourceText",
      "rawMarkdown",
      "documentText",
      "pageTextDump",
      "privateSourceText",
      "private_source_text",
      "credentials",
      "tokens",
      "oauthMaterial",
      "oauth_material",
      "apiKeys",
      "api_keys",
      "objectStoreDumps",
      "object_store_dumps",
      "databaseDumps",
      "database_dumps",
      "providerCredentials",
      "provider_credentials",
    ]);
    for (const fieldName of APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES) {
      expect(
        AppMcpResponseEnvelopeSchema.safeParse({
          ...evidence,
          [fieldName]: "private",
        }).success,
      ).toBe(false);
      expect(
        AppMcpResponseEnvelopeSchema.safeParse({
          ...evidence,
          evidence: [{ ...evidence.evidence[0], [fieldName]: "private" }],
        }).success,
      ).toBe(false);
    }
  });

  it("requires exact forbidden actions on response envelopes", () => {
    const evidence = buildAppMcpEvidenceEnvelope();

    expect(evidence.forbiddenActions).toEqual([...MCP_FORBIDDEN_TOOL_NAMES]);
    expect(
      AppMcpResponseEnvelopeSchema.safeParse({
        ...evidence,
        forbiddenActions: evidence.forbiddenActions.slice(0, -1),
      }).success,
    ).toBe(false);
    expect(
      AppMcpResponseEnvelopeSchema.safeParse({
        ...evidence,
        forbiddenActions: [
          evidence.forbiddenActions[1],
          evidence.forbiddenActions[0],
          ...evidence.forbiddenActions.slice(2),
        ],
      }).success,
    ).toBe(false);
    for (const actionName of MCP_FORBIDDEN_TOOL_NAMES) {
      expect(
        AppMcpResponseEnvelopeSchema.safeParse({
          ...evidence,
          [actionName]: "unsafe action key",
        }).success,
      ).toBe(false);
      expect(
        AppMcpResponseEnvelopeSchema.safeParse({
          ...evidence,
          evidence: [
            { ...evidence.evidence[0], [actionName]: "unsafe action key" },
          ],
        }).success,
      ).toBe(false);
    }
  });

  it("rejects forbidden action names and raw aliases on descriptor surfaces", () => {
    for (const descriptor of buildMcpToolDescriptorContracts()) {
      for (const fieldName of [
        ...MCP_FORBIDDEN_TOOL_NAMES,
        ...APP_MCP_FORBIDDEN_RESPONSE_FIELD_NAMES,
      ]) {
        expect(
          McpDescriptorAnnotationsSchema.safeParse({
            ...descriptor.annotations,
            [fieldName]: true,
          }).success,
        ).toBe(false);
        expect(
          McpDescriptorCapabilityMetadataSchema.safeParse({
            ...descriptor.capabilityMetadata,
            [fieldName]: true,
          }).success,
        ).toBe(false);
        expect(
          McpDescriptorInputSchemaContractSchema.safeParse({
            ...descriptor.inputSchema,
            fields: [...descriptor.inputSchema.fields, fieldName],
          }).success,
        ).toBe(false);
        expect(
          McpDescriptorOutputSchemaContractSchema.safeParse({
            ...descriptor.outputSchema,
            requiredFields: [
              ...descriptor.outputSchema.requiredFields,
              fieldName,
            ],
          }).success,
        ).toBe(false);
      }
    }
  });

  it("proves descriptor/envelope posture with machine-readable booleans", () => {
    const proof = AppMcpDescriptorEnvelopeProofSchema.parse(
      buildAppMcpDescriptorEnvelopeProof(),
    );

    expect(proof.localProofOnly).toBe(true);
    expect(proof.descriptorContractsVerified).toBe(true);
    expect(proof.descriptorAllowlistExactVerified).toBe(true);
    expect(proof.descriptorForbiddenFieldsExactVerified).toBe(true);
    expect(proof.descriptorForbiddenToolsExactVerified).toBe(true);
    expect(proof.responseForbiddenActionsExactVerified).toBe(true);
    expect(proof.rawPrivateDataAliasFamilyRejected).toBe(true);
    expect(proof.descriptorRejectsForbiddenActionNames).toBe(true);
    expect(proof.descriptorsVerified).toEqual([...MCP_TOOL_ALLOWLIST]);
    expect(proof.responseEnvelopeRequiredFields).toEqual([
      ...APP_MCP_RESPONSE_ENVELOPE_REQUIRED_FIELDS,
    ]);
    expect(proof.rawFullFileDumpFieldsRejected).toBe(true);
    expect(proof.privateDataFieldsRejected).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noRoutesAdded).toBe(true);
    expect(proof.noSchemaMigrationsAdded).toBe(true);
    expect(proof.noFixturesAdded).toBe(true);
    expect(proof.fp0088AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0089AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0090AbsentOrDocsOnlyBoundaryVerified).toBe(true);
    expect(proof.fp0091AbsentOrLocalUiComponentBoundaryVerified).toBe(true);
    expect(
      proof.fp0092AbsentOrLocalUiCompositionAccessibilityBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0093AbsentOrDocsOnlyPreviewRouteBoundaryVerified).toBe(true);
    expect(proof.fp0094AbsentOrLocalPreviewRouteBoundaryVerified).toBe(true);
    expect(
      proof.fp0095AbsentOrDocsOnlyPreviewRouteStateMatrixBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0096AbsentOrLocalPreviewRouteStateMatrixBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0097AbsentOrLocalPreviewRouteVisualQaBoundaryVerified,
    ).toBe(true);
    expect(
      proof.fp0098AbsentOrDocsOnlyPublicAppReadinessBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0099Absent).toBe(true);
    expect(proof.publicAppReadinessPlanBoundaryVerified).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0098).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0098).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0098).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0098).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0098).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0098).toBe(true);
    expect(proof.noScreenshotListingSubmissionAssetsFromFp0098).toBe(true);
    expect(proof.premiumUiSecurityPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiDesignSystemPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiImplementationPlanBoundaryVerified).toBe(true);
    expect(proof.premiumUiComponentFoundationVerified).toBe(true);
    expect(proof.premiumUiCompositionAccessibilityFoundationVerified).toBe(true);
    expect(proof.localUiPreviewRoutePlanBoundaryVerified).toBe(true);
    expect(proof.localPreviewRouteFoundationVerified).toBe(true);
    expect(proof.localPreviewRouteStateMatrixPlanBoundaryVerified).toBe(true);
    expect(proof.localPreviewRouteStateMatrixFoundationVerified).toBe(true);
    expect(proof.localPreviewRouteVisualQaFoundationVerified).toBe(true);
    expect(proof.noAdditionalRoutesFromFp0096).toBe(true);
    expect(proof.noApiRoutesFromFp0096).toBe(true);
    expect(proof.noBackendRoutesFromFp0096).toBe(true);
    expect(proof.noEndpointsFromFp0096).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0096).toBe(true);
    expect(proof.noOauthSubmissionFromFp0096).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0096).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0096).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0096).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0096).toBe(true);
    expect(proof.noPublicAssetsFromFp0096).toBe(true);
    expect(proof.routeMetadataNoIndexBoundaryVerified).toBe(true);
    expect(proof.noAdditionalRoutesFromFp0097).toBe(true);
    expect(proof.noApiRoutesFromFp0097).toBe(true);
    expect(proof.noBackendRoutesFromFp0097).toBe(true);
    expect(proof.noEndpointsFromFp0097).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0097).toBe(true);
    expect(proof.noOauthSubmissionFromFp0097).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0097).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0097).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0097).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0097).toBe(true);
    expect(proof.noPublicAssetsFromFp0097).toBe(true);
    expect(proof.screenshotlessVisualQaVerified).toBe(true);
    expect(proof.accessibilityStateMatrixVerified).toBe(true);
    expect(proof.noUiImplementationFromFp0088).toBe(true);
    expect(proof.noUiImplementationFromFp0089).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0089).toBe(true);
    expect(proof.noUiCodeFromFp0090).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0090).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0088).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0089).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0090).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0090).toBe(true);
    expect(proof.noRoutesFromFp0091).toBe(true);
    expect(proof.noEndpointsFromFp0091).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0091).toBe(true);
    expect(proof.noOauthSubmissionFromFp0091).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0091).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0091).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0091).toBe(true);
    expect(proof.noRoutesFromFp0092).toBe(true);
    expect(proof.noEndpointsFromFp0092).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0092).toBe(true);
    expect(proof.noOauthSubmissionFromFp0092).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0092).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0092).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0092).toBe(true);
    expect(proof.noRouteImplementationFromFp0093).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0093).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0093).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0093).toBe(true);
    expect(proof.noOpenAiApiModelCallsFromFp0093).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0093).toBe(true);
    expect(proof.noGeneratedProductProseRuntimeCodexFromFp0093).toBe(true);
    expect(proof.noApiRoutesFromFp0094).toBe(true);
    expect(proof.noBackendRoutesFromFp0094).toBe(true);
    expect(proof.noEndpointsFromFp0094).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0094).toBe(true);
    expect(proof.noOauthSubmissionFromFp0094).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0094).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0094).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0094).toBe(true);
    expect(proof.noRouteImplementationFromFp0095).toBe(true);
    expect(proof.noScreenshotAssetsFromFp0095).toBe(true);
    expect(proof.noEndpointOauthSubmissionFromFp0095).toBe(true);
    expect(proof.noPublicAppImplementationFromFp0095).toBe(true);
    expect(proof.noAppsSdkIframeFromFp0095).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0095).toBe(true);
    expect(proof.noOpenAiApiModelCallsFromFp0095).toBe(true);
    expect(proof.noProviderCertificationDeploymentFromFp0095).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0095).toBe(true);
    expect(proof.noGeneratedProductProseRuntimeCodexFromFp0095).toBe(true);
    expect(proof.noPublicAssetsFromFp0095).toBe(true);

    for (const candidate of APP_FORBIDDEN_TOOL_PROOF_CANDIDATES) {
      expect(classifyMcpToolCandidate(candidate).forbidden).toBe(true);
    }
  });
});
