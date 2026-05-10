import { describe, expect, it } from "vitest";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
} from "./read-only-app-mcp";
import {
  PUBLIC_APP_AUDIT_LOGGING_QUESTIONS,
  PUBLIC_APP_CONSENT_RBAC_QUESTIONS,
  PublicAppAppsSdkResourceDeferredBoundarySchema,
  PublicAppDataExfiltrationBoundarySchema,
  PublicAppEndpointDeferredBoundarySchema,
  PublicAppMcpDescriptorDriftBoundarySchema,
  PublicAppOAuthDeferredBoundarySchema,
  PublicAppPlatformBoundarySchema,
  PublicAppPrivacyNoRealFinanceDataBoundarySchema,
  PublicAppPromptInjectionBoundarySchema,
  PublicAppPublicVisibilityDeferredBoundarySchema,
  PublicAppRawDumpRefusalBoundarySchema,
  PublicAppRemoteMcpDeferredBoundarySchema,
  PublicAppSecurityProofSchema,
  PublicAppSubmissionDeferredBoundarySchema,
  PublicAppToolAllowlistDriftBoundarySchema,
  PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema,
  PublicAppWriteActionImpossibleBoundarySchema,
  buildPublicAppSecurityContracts,
  buildPublicAppSecurityProof,
} from "./read-only-app-mcp-public-security";

describe("FP-0100 public app security boundary contracts", () => {
  it("builds local proof-only public-app security contracts", () => {
    const contracts = buildPublicAppSecurityContracts();

    expect(contracts.securityThreatModelContract.localProofOnly).toBe(true);
    expect(contracts.securityThreatModelContract.publicAppImplemented).toBe(
      false,
    );
    expect(contracts.securityThreatModelContract.writeActionsImpossible).toBe(
      true,
    );
    expect(
      contracts.securityThreatModelContract
        .promptInjectionTreatedAsUntrustedData,
    ).toBe(true);
    expect(
      contracts.securityThreatModelContract
        .unsupportedStaleConflictingEvidenceRefuses,
    ).toBe(true);
  });

  it("keeps platform and deferred boundaries closed", () => {
    const contracts = buildPublicAppSecurityContracts();

    expect(
      PublicAppPlatformBoundarySchema.safeParse(contracts.platformBoundary)
        .success,
    ).toBe(true);
    expect(contracts.platformBoundary.endpointWorkDeferred).toBe(true);
    expect(contracts.platformBoundary.oauthTokenSessionWorkDeferred).toBe(true);
    expect(contracts.platformBoundary.remoteMcpDeploymentDeferred).toBe(true);
    expect(contracts.platformBoundary.appsSdkResourceImplementationDeferred).toBe(
      true,
    );
    expect(contracts.platformBoundary.publicAppImplementationDeferred).toBe(
      true,
    );
    expect(contracts.platformBoundary.noOpenAiApiCalls).toBe(true);
    expect(contracts.platformBoundary.noModelCalls).toBe(true);
    expect(contracts.platformBoundary.noRoutesAdded).toBe(true);
    expect(contracts.platformBoundary.noEndpointsAdded).toBe(true);

    for (const boundary of [
      [PublicAppEndpointDeferredBoundarySchema, contracts.endpointDeferredBoundary],
      [
        PublicAppRemoteMcpDeferredBoundarySchema,
        contracts.remoteMcpDeferredBoundary,
      ],
      [PublicAppOAuthDeferredBoundarySchema, contracts.oauthDeferredBoundary],
      [
        PublicAppAppsSdkResourceDeferredBoundarySchema,
        contracts.appsSdkResourceDeferredBoundary,
      ],
      [
        PublicAppSubmissionDeferredBoundarySchema,
        contracts.submissionDeferredBoundary,
      ],
    ] as const) {
      expect(boundary[0].safeParse(boundary[1]).success).toBe(true);
      expect(boundary[1].implemented).toBe(false);
      expect(boundary[1].deferred).toBe(true);
    }
  });

  it("treats prompt injection as data and refuses exfiltration or raw dumps", () => {
    const contracts = buildPublicAppSecurityContracts();

    expect(
      PublicAppPromptInjectionBoundarySchema.safeParse(
        contracts.promptInjectionBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.promptInjectionBoundary.sourceTextTrust).toBe(
      "untrusted_data",
    );
    expect(
      contracts.promptInjectionBoundary.sourceInstructionsCanAuthorizeTools,
    ).toBe(false);
    expect(
      PublicAppDataExfiltrationBoundarySchema.safeParse({
        ...contracts.dataExfiltrationBoundary,
        rawPrivateDataExfiltrationAllowed: true,
      }).success,
    ).toBe(false);
    expect(
      PublicAppRawDumpRefusalBoundarySchema.safeParse({
        ...contracts.rawDumpRefusalBoundary,
        rawFullFileDumpsAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps the V2G allowlist exact and write tools impossible", () => {
    const contracts = buildPublicAppSecurityContracts();

    expect(contracts.toolAllowlistDriftBoundary.allowedTools).toEqual([
      ...MCP_TOOL_ALLOWLIST,
    ]);
    expect(contracts.writeActionImpossibleBoundary.forbiddenTools).toEqual([
      ...MCP_FORBIDDEN_TOOL_NAMES,
    ]);
    expect(
      PublicAppToolAllowlistDriftBoundarySchema.safeParse({
        ...contracts.toolAllowlistDriftBoundary,
        allowedTools: [...MCP_TOOL_ALLOWLIST, "send_report"],
      }).success,
    ).toBe(false);
    expect(
      PublicAppWriteActionImpossibleBoundarySchema.safeParse({
        ...contracts.writeActionImpossibleBoundary,
        forbiddenTools:
          contracts.writeActionImpossibleBoundary.forbiddenTools.slice(0, -1),
      }).success,
    ).toBe(false);
    expect(
      PublicAppMcpDescriptorDriftBoundarySchema.safeParse({
        ...contracts.mcpDescriptorDriftBoundary,
        liveServerDescriptorAllowed: true,
      }).success,
    ).toBe(false);
  });

  it("keeps visibility, privacy, consent, audit, and evidence limits future-only", () => {
    const contracts = buildPublicAppSecurityContracts();

    expect(
      PublicAppPublicVisibilityDeferredBoundarySchema.safeParse(
        contracts.publicVisibilityDeferredBoundary,
      ).success,
    ).toBe(true);
    expect(
      PublicAppPrivacyNoRealFinanceDataBoundarySchema.safeParse(
        contracts.privacyNoRealFinanceDataBoundary,
      ).success,
    ).toBe(true);
    expect(contracts.publicVisibilityDeferredBoundary.listingCopyDeferred).toBe(
      true,
    );
    expect(contracts.privacyNoRealFinanceDataBoundary.noRealFinanceData).toBe(
      true,
    );
    expect(contracts.consentAndRbacQuestions.questions).toHaveLength(
      PUBLIC_APP_CONSENT_RBAC_QUESTIONS.length,
    );
    expect(contracts.auditLoggingQuestions.questions).toHaveLength(
      PUBLIC_APP_AUDIT_LOGGING_QUESTIONS.length,
    );
    expect(
      PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema
        .safeParse(contracts.unsupportedStaleConflictingEvidenceRefusalBoundary)
        .success,
    ).toBe(true);
  });

  it("builds a machine-readable FP-0100 security proof", () => {
    const proof = buildPublicAppSecurityProof();

    expect(PublicAppSecurityProofSchema.safeParse(proof).success).toBe(true);
    expect(proof.localProofOnly).toBe(true);
    expect(proof.publicAppSecurityThreatModelContractVerified).toBe(true);
    expect(proof.promptInjectionBoundaryVerified).toBe(true);
    expect(proof.dataExfiltrationBoundaryVerified).toBe(true);
    expect(proof.rawDumpRefusalBoundaryVerified).toBe(true);
    expect(proof.writeActionImpossibleBoundaryVerified).toBe(true);
    expect(proof.endpointDeferredBoundaryVerified).toBe(true);
    expect(proof.remoteMcpDeferredBoundaryVerified).toBe(true);
    expect(proof.oauthDeferredBoundaryVerified).toBe(true);
    expect(proof.appsSdkResourceDeferredBoundaryVerified).toBe(true);
    expect(proof.submissionDeferredBoundaryVerified).toBe(true);
    expect(proof.noOpenAiApiCalls).toBe(true);
    expect(proof.noModelCalls).toBe(true);
    expect(proof.noRoutesAdded).toBe(true);
    expect(proof.noEndpointsAdded).toBe(true);
    expect(proof.noSourceMutation).toBe(true);
    expect(proof.noFinanceWrite).toBe(true);
    expect(proof.fp0100BoundaryVerified).toBe(true);
    expect(proof.fp0101Absent).toBe(true);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        fp0101Absent: false,
      }).success,
    ).toBe(false);
  });
});
