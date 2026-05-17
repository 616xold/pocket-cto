import {
  buildProtectedResourceMetadataDocument,
  deriveProtectedResourceMetadataRouteResponseContract,
  textHasProtectedResourceMetadataBuilderTokenLeakage,
  validateProtectedResourceMetadataBuilderInput,
} from "./read-only-app-mcp-protected-resource-metadata-builder";
import {
  tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri,
  validateMcpCanonicalPublicResourceUriCandidate,
} from "./read-only-app-mcp-canonical-resource-validator";
import {
  MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
  MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
  McpProtectedResourceMetadataRouteInputBuilderInputSchema,
  McpProtectedResourceMetadataRouteInputEvidenceBundleSchema,
  McpProtectedResourceMetadataRoutePathDecisionSchema,
  type McpProtectedResourceMetadataRouteInputBuilderInput,
  type McpProtectedResourceMetadataRouteInputEvidenceBundle,
  type McpProtectedResourceMetadataRoutePathDecision,
} from "./read-only-app-mcp-protected-resource-metadata-route-input-contracts";
import {
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES,
  MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS,
  type McpProtectedResourceMetadataBuilderDocument,
} from "./read-only-app-mcp-protected-resource-metadata-builder-contracts";

export type McpProtectedResourceMetadataRouteInputEvidenceBundleValidation = {
  accepted: boolean;
  canonicalUriEvidenceAccepted: boolean;
  authorizationServerEvidenceAccepted: boolean;
  routePathDecisionAccepted: boolean;
  builderOutputBoundaryAccepted: boolean;
  noTokenLeakageAccepted: boolean;
  companyBindingPrerequisiteAccepted: boolean;
  mcpUnchangedPrerequisiteAccepted: boolean;
  noRuntimeAccepted: boolean;
  rejectionReasons: readonly string[];
};

export type McpProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence =
  {
    accepted: boolean;
    routeInputEvidenceSemanticCoherenceVerified: boolean;
    routeInputEvidenceSchemaVersionVerified: boolean;
    metadataDocumentResourceMatchesCanonicalUriEvidence: boolean;
    pathDecisionCanonicalUriMatchesEvidence: boolean;
    pathDecisionMetadataUrlMatchesEvidence: boolean;
    routePathMatchesPathDecision: boolean;
    metadataDocumentAuthorizationServersMatchEvidence: boolean;
    metadataDocumentScopesRemainReadOnly: boolean;
    metadataDocumentBearerMethodsRemainHeaderOnly: boolean;
    metadataDocumentFp0122BuilderPostureAccepted: boolean;
    rejectionReasons: readonly string[];
  };

export function validateProtectedResourceMetadataRouteInputEvidenceBundle(
  input: unknown,
): McpProtectedResourceMetadataRouteInputEvidenceBundleValidation {
  const parsed =
    McpProtectedResourceMetadataRouteInputBuilderInputSchema.safeParse(input);
  if (!parsed.success) {
    return rejected(["input_shape_invalid"]);
  }

  const builderInput = toBuilderInput(parsed.data);
  const canonicalValidation = validateMcpCanonicalPublicResourceUriCandidate(
    parsed.data.canonicalResourceUri,
  );
  const builderValidation =
    validateProtectedResourceMetadataBuilderInput(builderInput);
  const routePathDecisionAccepted = routePathDecisionCanBeDerived(
    parsed.data.canonicalResourceUri,
  );
  const builderOutputBoundaryAccepted = builderOutputAccepted(parsed.data);
  const noTokenLeakageAccepted =
    parsed.data.noTokenLeakageAccepted &&
    builderValidation.noTokenLeakageAccepted &&
    !textHasProtectedResourceMetadataBuilderTokenLeakage(
      JSON.stringify(parsed.data),
    );
  const canonicalUriEvidenceAccepted =
    parsed.data.canonicalUriEvidenceAccepted &&
    canonicalValidation.accepted &&
    canonicalValidation.noUserinfoCredentials &&
    canonicalValidation.noCredentialLikeAuthorityOrPath;
  const authorizationServerEvidenceAccepted =
    parsed.data.authorizationServerEvidenceAccepted &&
    builderValidation.authorizationServersAccepted &&
    builderValidation.scopesAccepted &&
    builderValidation.bearerMethodsAccepted;
  const companyBindingPrerequisiteAccepted =
    parsed.data.authenticatedCompanyBindingPrerequisiteAccepted;
  const mcpUnchangedPrerequisiteAccepted =
    parsed.data.mcpUnchangedBehaviorPrerequisiteAccepted;
  const noRuntimeAccepted =
    parsed.data.routeImplementationDeferred &&
    parsed.data.wwwAuthenticateBehaviorDeferred;

  const rejectionReasons = [
    canonicalUriEvidenceAccepted ? "" : "canonical_uri_evidence_unaccepted",
    authorizationServerEvidenceAccepted
      ? ""
      : "authorization_server_evidence_unaccepted",
    routePathDecisionAccepted ? "" : "route_path_decision_unaccepted",
    builderOutputBoundaryAccepted ? "" : "builder_output_unaccepted",
    noTokenLeakageAccepted ? "" : "token_or_private_material_detected",
    companyBindingPrerequisiteAccepted
      ? ""
      : "company_binding_prerequisite_missing",
    mcpUnchangedPrerequisiteAccepted
      ? ""
      : "mcp_unchanged_prerequisite_missing",
    noRuntimeAccepted ? "" : "route_or_www_authenticate_runtime_not_deferred",
  ].filter(Boolean);

  return {
    accepted: rejectionReasons.length === 0,
    authorizationServerEvidenceAccepted,
    builderOutputBoundaryAccepted,
    canonicalUriEvidenceAccepted,
    companyBindingPrerequisiteAccepted,
    mcpUnchangedPrerequisiteAccepted,
    noRuntimeAccepted,
    noTokenLeakageAccepted,
    rejectionReasons,
    routePathDecisionAccepted,
  };
}

export function validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
  bundle: McpProtectedResourceMetadataRouteInputEvidenceBundle,
): McpProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence {
  const document = bundle.builderOutput.document;
  const canonicalResourceUri =
    bundle.canonicalUriEvidence.canonicalResourceUri;
  const metadataDocumentResourceMatchesCanonicalUriEvidence =
    document.resource === canonicalResourceUri;
  const pathDecisionCanonicalUriMatchesEvidence =
    bundle.pathDecision.canonicalResourceUri === canonicalResourceUri;
  const pathDecisionMetadataUrlMatchesEvidence =
    bundle.pathDecision.metadataUrl ===
    bundle.canonicalUriEvidence.metadataUrl;
  const routePathMatchesPathDecision =
    bundle.pathDecision.metadataRoutePath ===
    MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH;
  const metadataDocumentAuthorizationServersMatchEvidence = sameList(
    document.authorization_servers,
    bundle.authorizationServerEvidence.authorizationServers,
  );
  const metadataDocumentScopesRemainReadOnly =
    document.scopes_supported.length > 0 &&
    document.scopes_supported.every((scope) =>
      MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES.includes(
        scope as (typeof MCP_PROTECTED_RESOURCE_METADATA_BUILDER_ALLOWED_SCOPES)[number],
      ),
    );
  const metadataDocumentBearerMethodsRemainHeaderOnly =
    document.bearer_methods_supported.length > 0 &&
    document.bearer_methods_supported.every(
      (method) =>
        method === MCP_PROTECTED_RESOURCE_METADATA_BUILDER_BEARER_METHODS[0],
    );
  const metadataDocumentFp0122BuilderPostureAccepted =
    validateProtectedResourceMetadataBuilderInput({
      authorizationServers: [...document.authorization_servers],
      bearerMethodsSupported: [...document.bearer_methods_supported],
      canonicalResourceUri: document.resource,
      scopesSupported: [...document.scopes_supported],
    }).accepted;
  const routeInputEvidenceSchemaVersionVerified =
    bundle.schemaVersion ===
    MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION;
  const rejectionReasons = [
    routeInputEvidenceSchemaVersionVerified ? "" : "schema_version_mismatch",
    metadataDocumentResourceMatchesCanonicalUriEvidence
      ? ""
      : "metadata_document_resource_mismatch",
    pathDecisionCanonicalUriMatchesEvidence
      ? ""
      : "path_decision_canonical_uri_mismatch",
    pathDecisionMetadataUrlMatchesEvidence
      ? ""
      : "path_decision_metadata_url_mismatch",
    routePathMatchesPathDecision ? "" : "metadata_route_path_mismatch",
    metadataDocumentAuthorizationServersMatchEvidence
      ? ""
      : "metadata_document_authorization_servers_mismatch",
    metadataDocumentScopesRemainReadOnly
      ? ""
      : "metadata_document_scopes_unaccepted",
    metadataDocumentBearerMethodsRemainHeaderOnly
      ? ""
      : "metadata_document_bearer_methods_unaccepted",
    metadataDocumentFp0122BuilderPostureAccepted
      ? ""
      : "metadata_document_fp0122_builder_posture_unaccepted",
  ].filter(Boolean);
  const routeInputEvidenceSemanticCoherenceVerified =
    rejectionReasons.length === 0;

  return {
    accepted: routeInputEvidenceSemanticCoherenceVerified,
    metadataDocumentAuthorizationServersMatchEvidence,
    metadataDocumentBearerMethodsRemainHeaderOnly,
    metadataDocumentFp0122BuilderPostureAccepted,
    metadataDocumentResourceMatchesCanonicalUriEvidence,
    metadataDocumentScopesRemainReadOnly,
    pathDecisionCanonicalUriMatchesEvidence,
    pathDecisionMetadataUrlMatchesEvidence,
    rejectionReasons,
    routeInputEvidenceSchemaVersionVerified,
    routeInputEvidenceSemanticCoherenceVerified,
    routePathMatchesPathDecision,
  };
}

export function assertProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
  bundle: McpProtectedResourceMetadataRouteInputEvidenceBundle,
) {
  const coherence =
    validateProtectedResourceMetadataRouteInputEvidenceBundleSemanticCoherence(
      bundle,
    );

  if (!coherence.accepted) {
    throw new Error(
      `Protected-resource metadata route evidence dependency is semantically incoherent: ${coherence.rejectionReasons.join(", ")}`,
    );
  }
}

export function deriveProtectedResourceMetadataRoutePathDecision(
  input: string | { canonicalResourceUri: string },
): McpProtectedResourceMetadataRoutePathDecision {
  const canonicalResourceUri =
    typeof input === "string" ? input : input.canonicalResourceUri;
  const derivation =
    tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
      canonicalResourceUri,
    );

  if (!derivation.derived) {
    throw new Error(
      "Cannot derive protected-resource metadata route path from unaccepted canonical MCP resource URI evidence",
    );
  }

  return McpProtectedResourceMetadataRoutePathDecisionSchema.parse({
    canonicalResourceUri,
    expectedForMcpCanonicalResource:
      MCP_ROUTE_INPUT_EXPECTED_MCP_METADATA_ROUTE_PATH,
    metadataRoutePath: derivation.derivation.metadataRoutePath,
    metadataUrl: derivation.derivation.metadataUrl,
    rfc9728WellKnownPath: derivation.derivation.rfc9728WellKnownPath,
    routeImplementationDeferred: true,
    routePathDerivedFromCanonicalResourceUri: true,
  });
}

export function buildProtectedResourceMetadataRouteInputEvidenceBundle(
  input: McpProtectedResourceMetadataRouteInputBuilderInput,
): McpProtectedResourceMetadataRouteInputEvidenceBundle {
  const validation =
    validateProtectedResourceMetadataRouteInputEvidenceBundle(input);
  if (!validation.accepted) {
    throw new Error(
      `Protected-resource metadata route-input evidence bundle rejected: ${validation.rejectionReasons.join(", ")}`,
    );
  }

  const builderInput = toBuilderInput(input);
  const document = buildProtectedResourceMetadataDocument(builderInput);
  const routeContract =
    deriveProtectedResourceMetadataRouteResponseContract(builderInput);
  const pathDecision = deriveProtectedResourceMetadataRoutePathDecision({
    canonicalResourceUri: input.canonicalResourceUri,
  });

  return McpProtectedResourceMetadataRouteInputEvidenceBundleSchema.parse({
    authorizationServerEvidence: {
      accepted: true,
      authorizationServers: [...input.authorizationServers],
      credentialFree: true,
      providerNeutralUntilLaterPlan: true,
    },
    builderOutput: {
      accepted: true,
      builderInputAccepted: true,
      builderOutputValid: true,
      document,
      routeRegistered: routeContract.routeRegistered,
      routeResponseContractOnly: routeContract.routeResponseContractOnly,
    },
    canonicalUriEvidence: {
      accepted: true,
      canonicalResourceUri: input.canonicalResourceUri,
      credentialFree: true,
      metadataUrl: pathDecision.metadataUrl,
    },
    companyBindingPrerequisite: {
      accepted: true,
      authenticatedCompanyBindingImplemented: false,
      authenticatedCompanyBindingRequired: true,
      unauthenticatedCompanyKeyAuthorityAllowed: false,
    },
    localProofOnly: true,
    mcpUnchanged: {
      accepted: true,
      localMcpRouteBehaviorChanged: false,
      localMcpRouteUnchangedRequired: true,
      protectedResourceMetadataRouteRegistered: false,
      wwwAuthenticateBehaviorImplemented: false,
    },
    noRuntime: {
      accepted: true,
      noAppsSdkResourceRuntime: true,
      noAuthMiddlewareRuntime: true,
      noDbRuntime: true,
      noOauthRuntime: true,
      noProtectedResourceMetadataRouteRuntime: true,
      noRemoteMcpRuntime: true,
      noRouteRuntime: true,
      noTokenSessionRuntime: true,
      noWwwAuthenticateRuntime: true,
    },
    noTokenLeakage: {
      accepted: true,
      companyKeyAuthorityDetected: false,
      cookiesSessionsSecretsCredentialsDetected: false,
      credentialBearingUrlsDetected: false,
      rawFinanceDataDetected: false,
      rawSourceDumpsDetected: false,
      tokenValuesDetected: false,
    },
    pathDecision,
    readOnly: true,
    routeImplementationStillDeferred: true,
    routeInputEvidenceBundleOnly: true,
    schemaVersion: MCP_PROTECTED_RESOURCE_METADATA_ROUTE_INPUT_SCHEMA_VERSION,
    wwwAuthenticateBehaviorStillDeferred: true,
  });
}

function rejected(
  rejectionReasons: readonly string[],
): McpProtectedResourceMetadataRouteInputEvidenceBundleValidation {
  return {
    accepted: false,
    authorizationServerEvidenceAccepted: false,
    builderOutputBoundaryAccepted: false,
    canonicalUriEvidenceAccepted: false,
    companyBindingPrerequisiteAccepted: false,
    mcpUnchangedPrerequisiteAccepted: false,
    noRuntimeAccepted: false,
    noTokenLeakageAccepted: false,
    rejectionReasons,
    routePathDecisionAccepted: false,
  };
}

function toBuilderInput(
  input: McpProtectedResourceMetadataRouteInputBuilderInput,
) {
  return {
    authorizationServers: [...input.authorizationServers],
    bearerMethodsSupported: [...input.bearerMethodsSupported],
    canonicalResourceUri: input.canonicalResourceUri,
    scopesSupported: [...input.scopesSupported],
  };
}

function routePathDecisionCanBeDerived(canonicalResourceUri: string) {
  const derivation =
    tryDeriveMcpProtectedResourceMetadataUrlFromCanonicalUri(
      canonicalResourceUri,
    );
  return derivation.derived && derivation.validation.accepted;
}

function builderOutputAccepted(
  input: McpProtectedResourceMetadataRouteInputBuilderInput,
) {
  const builderInput = toBuilderInput(input);
  const builderValidation =
    validateProtectedResourceMetadataBuilderInput(builderInput);
  if (!builderValidation.accepted) return false;

  const expectedDocument = safeBuildDocument(builderInput);
  if (!expectedDocument) return false;
  if (!input.builderOutput) return true;

  return (
    JSON.stringify(input.builderOutput) === JSON.stringify(expectedDocument)
  );
}

function sameList(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function safeBuildDocument(
  input: ReturnType<typeof toBuilderInput>,
): McpProtectedResourceMetadataBuilderDocument | null {
  try {
    return buildProtectedResourceMetadataDocument(input);
  } catch {
    return null;
  }
}
