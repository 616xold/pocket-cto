import { describe, expect, it } from "vitest";
import {
  APP_FORBIDDEN_TOOL_PROOF_CANDIDATES,
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
  MCP_TOOL_ALLOWLIST,
  McpDescriptorInputSchemaContractSchema,
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
      expect(McpToolDescriptorContractSchema.safeParse(descriptor).success).toBe(
        true,
      );
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
    expect(AppMcpStaleEvidenceEnvelopeSchema.safeParse(staleEvidence).success).toBe(
      true,
    );
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
    expect(AppMcpUnsafeActionEnvelopeSchema.safeParse(unsafeAction).success).toBe(
      true,
    );

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
    expect(AppMcpResponseEnvelopeSchema.safeParse(withRawFullText).success).toBe(
      false,
    );
    expect(AppMcpResponseEnvelopeSchema.safeParse(withNestedToken).success).toBe(
      false,
    );
    expect(responseEnvelopeRejectsForbiddenFields()).toBe(true);
  });

  it("proves descriptor/envelope posture with machine-readable booleans", () => {
    const proof = AppMcpDescriptorEnvelopeProofSchema.parse(
      buildAppMcpDescriptorEnvelopeProof(),
    );

    expect(proof.localProofOnly).toBe(true);
    expect(proof.descriptorContractsVerified).toBe(true);
    expect(proof.descriptorAllowlistExactVerified).toBe(true);
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
    expect(proof.fp0088Absent).toBe(true);

    for (const candidate of APP_FORBIDDEN_TOOL_PROOF_CANDIDATES) {
      expect(classifyMcpToolCandidate(candidate).forbidden).toBe(true);
    }
  });
});
