import { describe, expect, it } from "vitest";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
} from "./read-only-app-mcp";
import {
  PUBLIC_APP_AUDIT_LOGGING_QUESTIONS,
  PUBLIC_APP_CONSENT_RBAC_QUESTIONS,
  PUBLIC_APP_REQUIRED_EVIDENCE_REFUSAL_REASONS,
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
    expect(
      contracts.platformBoundary.appsSdkResourceImplementationDeferred,
    ).toBe(true);
    expect(contracts.platformBoundary.publicAppImplementationDeferred).toBe(
      true,
    );
    expect(contracts.platformBoundary.noOpenAiApiCalls).toBe(true);
    expect(contracts.platformBoundary.noModelCalls).toBe(true);
    expect(contracts.platformBoundary.noRoutesAdded).toBe(true);
    expect(contracts.platformBoundary.noEndpointsAdded).toBe(true);

    for (const boundary of [
      [
        PublicAppEndpointDeferredBoundarySchema,
        contracts.endpointDeferredBoundary,
      ],
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
      PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema.safeParse(
        contracts.unsupportedStaleConflictingEvidenceRefusalBoundary,
      ).success,
    ).toBe(true);
    expect(
      contracts.unsupportedStaleConflictingEvidenceRefusalBoundary
        .requiredRefusalReasons,
    ).toEqual([...PUBLIC_APP_REQUIRED_EVIDENCE_REFUSAL_REASONS]);
    expect(
      PublicAppUnsupportedStaleConflictingEvidenceRefusalBoundarySchema.safeParse(
        {
          ...contracts.unsupportedStaleConflictingEvidenceRefusalBoundary,
          requiredRefusalReasons: [
            "unsupported_evidence",
            "stale_evidence",
            "conflicting_evidence",
          ],
        },
      ).success,
    ).toBe(false);
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
    expect(proof.localPreviewRouteExists).toBe(true);
    expect(proof.routeMetadataNoIndexBoundaryVerified).toBe(true);
    expect(proof.localPreviewRouteRemainsLocalNoindexOnly).toBe(true);
    expect(proof.requiredEvidenceRefusalReasonsVerified).toBe(true);
    expect(proof.publicSecurityNoOpenAiApiSourceScanVerified).toBe(true);
    expect(proof.fp0100BoundaryVerified).toBe(true);
    expect(
      proof
        .fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified,
    ).toBe(true);
    expect(
      proof
        .fp0102AbsentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified,
    ).toBe(true);
    expect(proof.fp0103Absent).toBe(true);
    expect(
      proof.endpointOauthRemoteMcpArchitecturePlanBoundaryVerified,
    ).toBe(true);
    expect(proof.noEndpointImplementationFromFp0102).toBe(true);
    expect(proof.noOauthTokenSessionImplementationFromFp0102).toBe(true);
    expect(proof.noRemoteMcpImplementationOrDeploymentFromFp0102).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0102).toBe(true);
    expect(proof.noAppSubmissionFromFp0102).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0102).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0102).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0102).toBe(true);
    expect(proof.fp0101ImplementationSequencingBoundaryStillVerified).toBe(
      true,
    );
    expect(proof.fp0100PublicSecurityBoundaryStillVerified).toBe(true);
    expect(
      proof.publicAppImplementationSequencingPlanBoundaryVerified,
    ).toBe(true);
    expect(proof.noEndpointImplementationFromFp0101).toBe(true);
    expect(proof.noOauthImplementationFromFp0101).toBe(true);
    expect(proof.noRemoteMcpDeploymentFromFp0101).toBe(true);
    expect(proof.noAppsSdkResourceFromFp0101).toBe(true);
    expect(proof.noAppSubmissionFromFp0101).toBe(true);
    expect(proof.noOpenAiApiCallsFromFp0101).toBe(true);
    expect(proof.noSourceMutationFinanceWriteFromFp0101).toBe(true);
    expect(proof.noPublicAssetsSubmissionArtifactsFromFp0101).toBe(true);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        fp0101AbsentOrDocsOnlyPublicAppImplementationSequencingBoundaryVerified:
          false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        fp0102AbsentOrDocsOnlyEndpointOauthRemoteMcpArchitectureBoundaryVerified:
          false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        fp0103Absent: false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        noEndpointImplementationFromFp0102: false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        localPreviewRouteExists: false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        routeMetadataNoIndexBoundaryVerified: false,
      }).success,
    ).toBe(false);
    expect(
      PublicAppSecurityProofSchema.safeParse({
        ...proof,
        publicSecurityNoOpenAiApiSourceScanVerified: false,
      }).success,
    ).toBe(false);
  });
});
