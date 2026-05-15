import type { z } from "zod";
import type {
  McpCanonicalResourceUriBoundarySchema,
  McpCorsPolicyBoundarySchema,
  McpCspResourcePolicyBoundarySchema,
  McpGetSseDeferredBoundarySchema,
  McpHealthReadinessDeferredBoundarySchema,
  McpHttpsTlsFutureRequirementBoundarySchema,
  McpLoggingRedactionBoundarySchema,
  McpNoRealFinanceDataPublicDemoBoundarySchema,
  McpNoRemoteRuntimeBoundarySchema,
  McpObservabilityAuditCorrelationBoundarySchema,
  McpOauthSecurityPrerequisiteBoundarySchema,
  McpOriginValidationBoundarySchema,
  McpRateLimitAbuseControlBoundarySchema,
  McpRemoteDeploymentDeferredBoundarySchema,
  McpRemoteHostInventoryBoundarySchema,
  McpRemoteHostReadinessProofContractSchema,
  McpRemoteMcpPathBoundarySchema,
  McpRollbackIncidentResponseBoundarySchema,
  McpStreamableHttpTransportBoundarySchema,
} from "./read-only-app-mcp-remote-host-readiness-contracts";

export type McpRemoteHostReadinessProofContract = z.infer<
  typeof McpRemoteHostReadinessProofContractSchema
>;
export type McpRemoteDeploymentDeferredBoundary = z.infer<
  typeof McpRemoteDeploymentDeferredBoundarySchema
>;
export type McpRemoteHostInventoryBoundary = z.infer<
  typeof McpRemoteHostInventoryBoundarySchema
>;
export type McpCanonicalResourceUriBoundary = z.infer<
  typeof McpCanonicalResourceUriBoundarySchema
>;
export type McpRemoteMcpPathBoundary = z.infer<
  typeof McpRemoteMcpPathBoundarySchema
>;
export type McpHttpsTlsFutureRequirementBoundary = z.infer<
  typeof McpHttpsTlsFutureRequirementBoundarySchema
>;
export type McpStreamableHttpTransportBoundary = z.infer<
  typeof McpStreamableHttpTransportBoundarySchema
>;
export type McpGetSseDeferredBoundary = z.infer<
  typeof McpGetSseDeferredBoundarySchema
>;
export type McpOriginValidationBoundary = z.infer<
  typeof McpOriginValidationBoundarySchema
>;
export type McpCorsPolicyBoundary = z.infer<typeof McpCorsPolicyBoundarySchema>;
export type McpCspResourcePolicyBoundary = z.infer<
  typeof McpCspResourcePolicyBoundarySchema
>;
export type McpRateLimitAbuseControlBoundary = z.infer<
  typeof McpRateLimitAbuseControlBoundarySchema
>;
export type McpLoggingRedactionBoundary = z.infer<
  typeof McpLoggingRedactionBoundarySchema
>;
export type McpObservabilityAuditCorrelationBoundary = z.infer<
  typeof McpObservabilityAuditCorrelationBoundarySchema
>;
export type McpRollbackIncidentResponseBoundary = z.infer<
  typeof McpRollbackIncidentResponseBoundarySchema
>;
export type McpHealthReadinessDeferredBoundary = z.infer<
  typeof McpHealthReadinessDeferredBoundarySchema
>;
export type McpNoRealFinanceDataPublicDemoBoundary = z.infer<
  typeof McpNoRealFinanceDataPublicDemoBoundarySchema
>;
export type McpOauthSecurityPrerequisiteBoundary = z.infer<
  typeof McpOauthSecurityPrerequisiteBoundarySchema
>;
export type McpNoRemoteRuntimeBoundary = z.infer<
  typeof McpNoRemoteRuntimeBoundarySchema
>;
