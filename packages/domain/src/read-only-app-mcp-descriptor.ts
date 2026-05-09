import { z } from "zod";
import {
  APP_RESPONSE_REQUIRED_FIELDS,
  baseForbiddenTools,
} from "./read-only-app-mcp-contracts";
import {
  MCP_FORBIDDEN_TOOL_NAMES,
  MCP_TOOL_ALLOWLIST,
  McpForbiddenToolSchema,
  McpToolNameSchema,
  READ_ONLY_APP_MCP_SCHEMA_VERSION,
  type McpToolName,
} from "./read-only-app-mcp-boundaries";

const trueLiteral = z.literal(true);
const falseLiteral = z.literal(false);

export const MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS = [
  "upload",
  "sourceUpload",
  "uploadSource",
  "sourceMutation",
  "mutateSource",
  "rewriteSource",
  "financeWrite",
  "ledgerWrite",
  "provider",
  "providerCredential",
  "payment",
  "customerContact",
  "externalCommunication",
  "appSubmission",
  "oauth",
  "endpoint",
  "route",
  "schemaMigration",
  "model",
  "openAiApiKey",
] as const;

export const MCP_DESCRIPTOR_ALLOWED_INPUT_FIELDS = [
  "companyKey",
  "query",
  "limit",
  "evidenceCardId",
  "sourceAnchorId",
  "documentMapId",
  "sourceId",
  "periodKey",
] as const;

export const MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS = [
  ...APP_RESPONSE_REQUIRED_FIELDS,
  "privacyBoundary",
  "noRuntimeBoundary",
  "authorityBoundary",
] as const;

export const MCP_DESCRIPTOR_INPUT_FIELDS_BY_TOOL: Record<
  McpToolName,
  readonly (typeof MCP_DESCRIPTOR_ALLOWED_INPUT_FIELDS)[number][]
> = {
  fetch_capability_boundaries: ["companyKey"],
  fetch_company_posture: ["companyKey", "periodKey"],
  fetch_document_map: ["companyKey", "documentMapId"],
  fetch_evidence_card: ["companyKey", "evidenceCardId"],
  fetch_source_anchor: ["companyKey", "sourceAnchorId"],
  fetch_source_coverage: ["companyKey", "sourceId"],
  search_evidence: ["companyKey", "query", "limit"],
};

const McpDescriptorAllowedInputFieldSchema = z.enum(
  MCP_DESCRIPTOR_ALLOWED_INPUT_FIELDS,
);
const McpDescriptorForbiddenInputFieldSchema = z.enum(
  MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS,
);

export const McpDescriptorInputSchemaContractSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    contractKind: z.literal("McpDescriptorInputSchemaContract"),
    toolName: McpToolNameSchema,
    strict: trueLiteral,
    fields: z.array(McpDescriptorAllowedInputFieldSchema).min(1),
    forbiddenFields: z.array(McpDescriptorForbiddenInputFieldSchema).min(1),
    acceptsUploads: falseLiteral,
    acceptsSourceMutation: falseLiteral,
    acceptsFinanceWrites: falseLiteral,
    acceptsProviderCredentials: falseLiteral,
    acceptsPaymentOrCustomerContact: falseLiteral,
    acceptsOauthOrAppSubmission: falseLiteral,
  })
  .strict()
  .superRefine((value, ctx) => {
    const expectedFields = MCP_DESCRIPTOR_INPUT_FIELDS_BY_TOOL[value.toolName];
    if (!sameList(value.fields, expectedFields)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descriptor input fields must match the exact tool contract.",
        path: ["fields"],
      });
    }
    if (
      !sameList(value.forbiddenFields, MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descriptor forbidden fields must match the exact contract.",
        path: ["forbiddenFields"],
      });
    }
  });

export const McpDescriptorOutputSchemaContractSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    contractKind: z.literal("McpDescriptorOutputSchemaContract"),
    toolName: McpToolNameSchema,
    strict: trueLiteral,
    envelopeSchema: z.literal("AppMcpResponseEnvelope"),
    requiredFields: z.tuple([
      z.literal("evidence"),
      z.literal("freshness"),
      z.literal("limitations"),
      z.literal("permittedNextActions"),
      z.literal("citations"),
      z.literal("refusalPosture"),
      z.literal("forbiddenActions"),
      z.literal("privacyBoundary"),
      z.literal("noRuntimeBoundary"),
      z.literal("authorityBoundary"),
    ]),
    rawFullFileDumpFieldsAllowed: falseLiteral,
    privateDataFieldsAllowed: falseLiteral,
    sourceMutationAllowed: falseLiteral,
    financeWriteAllowed: falseLiteral,
    generatedAdviceAllowed: falseLiteral,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      !sameList(value.requiredFields, MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descriptor output fields must match the response envelope.",
        path: ["requiredFields"],
      });
    }
  });

export const McpDescriptorAnnotationsSchema = z
  .object({
    readOnlyHint: trueLiteral,
    destructiveHint: falseLiteral,
    idempotentHint: trueLiteral,
    openWorldHint: falseLiteral,
    localProofOnly: trueLiteral,
  })
  .strict();

export const McpDescriptorCapabilityMetadataSchema = z
  .object({
    readOnly: trueLiteral,
    writesSources: falseLiteral,
    writesFinanceTwin: falseLiteral,
    mutatesEvidenceIndex: falseLiteral,
    mutatesCfoWiki: falseLiteral,
    callsProvider: falseLiteral,
    startsServer: falseLiteral,
    exposesEndpoint: falseLiteral,
    deploysRemoteMcp: falseLiteral,
    opensOauthFlow: falseLiteral,
    submitsApp: falseLiteral,
    givesLegalAuditTaxAdvice: falseLiteral,
    issuesPaymentOrCustomerContact: falseLiteral,
    takesAutonomousAction: falseLiteral,
  })
  .strict();

export const McpToolDescriptorContractSchema = z
  .object({
    schemaVersion: z.literal(READ_ONLY_APP_MCP_SCHEMA_VERSION),
    contractKind: z.literal("McpToolDescriptorContract"),
    toolName: McpToolNameSchema,
    descriptorUse: z.literal("local_proof_contract_only"),
    localProofOnly: trueLiteral,
    usableAsLiveServerDescriptor: falseLiteral,
    serverRuntimeImplemented: falseLiteral,
    endpointImplemented: falseLiteral,
    remoteDeploymentImplemented: falseLiteral,
    readOnly: trueLiteral,
    annotations: McpDescriptorAnnotationsSchema,
    capabilityMetadata: McpDescriptorCapabilityMetadataSchema,
    inputSchema: McpDescriptorInputSchemaContractSchema,
    outputSchema: McpDescriptorOutputSchemaContractSchema,
    forbiddenTools: z.array(McpForbiddenToolSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.inputSchema.toolName !== value.toolName ||
      value.outputSchema.toolName !== value.toolName
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descriptor nested schemas must describe the same tool.",
        path: ["toolName"],
      });
    }
    if (!sameList(value.forbiddenTools, MCP_FORBIDDEN_TOOL_NAMES)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descriptor forbidden tools must match the exact contract.",
        path: ["forbiddenTools"],
      });
    }
  });

export function buildMcpDescriptorInputSchemaContract(toolName: McpToolName) {
  return McpDescriptorInputSchemaContractSchema.parse({
    acceptsFinanceWrites: false,
    acceptsOauthOrAppSubmission: false,
    acceptsPaymentOrCustomerContact: false,
    acceptsProviderCredentials: false,
    acceptsSourceMutation: false,
    acceptsUploads: false,
    contractKind: "McpDescriptorInputSchemaContract",
    fields: [...MCP_DESCRIPTOR_INPUT_FIELDS_BY_TOOL[toolName]],
    forbiddenFields: [...MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS],
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    strict: true,
    toolName,
  });
}

export function buildMcpDescriptorOutputSchemaContract(toolName: McpToolName) {
  return McpDescriptorOutputSchemaContractSchema.parse({
    contractKind: "McpDescriptorOutputSchemaContract",
    envelopeSchema: "AppMcpResponseEnvelope",
    financeWriteAllowed: false,
    generatedAdviceAllowed: false,
    privateDataFieldsAllowed: false,
    rawFullFileDumpFieldsAllowed: false,
    requiredFields: [...MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS],
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    sourceMutationAllowed: false,
    strict: true,
    toolName,
  });
}

export function buildMcpToolDescriptorContract(toolName: McpToolName) {
  return McpToolDescriptorContractSchema.parse({
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      localProofOnly: true,
      openWorldHint: false,
      readOnlyHint: true,
    },
    capabilityMetadata: {
      callsProvider: false,
      deploysRemoteMcp: false,
      exposesEndpoint: false,
      givesLegalAuditTaxAdvice: false,
      issuesPaymentOrCustomerContact: false,
      mutatesCfoWiki: false,
      mutatesEvidenceIndex: false,
      opensOauthFlow: false,
      readOnly: true,
      startsServer: false,
      submitsApp: false,
      takesAutonomousAction: false,
      writesFinanceTwin: false,
      writesSources: false,
    },
    contractKind: "McpToolDescriptorContract",
    descriptorUse: "local_proof_contract_only",
    endpointImplemented: false,
    forbiddenTools: baseForbiddenTools(),
    inputSchema: buildMcpDescriptorInputSchemaContract(toolName),
    localProofOnly: true,
    outputSchema: buildMcpDescriptorOutputSchemaContract(toolName),
    readOnly: true,
    remoteDeploymentImplemented: false,
    schemaVersion: READ_ONLY_APP_MCP_SCHEMA_VERSION,
    serverRuntimeImplemented: false,
    toolName,
    usableAsLiveServerDescriptor: false,
  });
}

export function buildMcpToolDescriptorContracts() {
  return MCP_TOOL_ALLOWLIST.map((toolName) =>
    buildMcpToolDescriptorContract(toolName),
  );
}

export function descriptorInputRejectsForbiddenFields(toolName: McpToolName) {
  const inputSchema = buildMcpDescriptorInputSchemaContract(toolName);
  return MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS.every(
    (field) =>
      !McpDescriptorInputSchemaContractSchema.safeParse({
        ...inputSchema,
        fields: [...inputSchema.fields, field],
      }).success,
  );
}

export function descriptorForbiddenFieldsExactVerified(toolName: McpToolName) {
  const inputSchema = buildMcpDescriptorInputSchemaContract(toolName);
  return (
    sameList(
      inputSchema.forbiddenFields,
      MCP_DESCRIPTOR_FORBIDDEN_INPUT_FIELDS,
    ) &&
    !McpDescriptorInputSchemaContractSchema.safeParse({
      ...inputSchema,
      forbiddenFields: inputSchema.forbiddenFields.slice(0, -1),
    }).success &&
    !McpDescriptorInputSchemaContractSchema.safeParse({
      ...inputSchema,
      forbiddenFields: [
        inputSchema.forbiddenFields[1],
        inputSchema.forbiddenFields[0],
        ...inputSchema.forbiddenFields.slice(2),
      ],
    }).success
  );
}

export function descriptorForbiddenToolsExactVerified(toolName: McpToolName) {
  const descriptor = buildMcpToolDescriptorContract(toolName);
  return (
    sameList(descriptor.forbiddenTools, MCP_FORBIDDEN_TOOL_NAMES) &&
    !McpToolDescriptorContractSchema.safeParse({
      ...descriptor,
      forbiddenTools: descriptor.forbiddenTools.slice(0, -1),
    }).success &&
    !McpToolDescriptorContractSchema.safeParse({
      ...descriptor,
      forbiddenTools: [
        descriptor.forbiddenTools[1],
        descriptor.forbiddenTools[0],
        ...descriptor.forbiddenTools.slice(2),
      ],
    }).success
  );
}

export function descriptorOutputRequiresEnvelopeFields(toolName: McpToolName) {
  return sameList(
    buildMcpDescriptorOutputSchemaContract(toolName).requiredFields,
    MCP_DESCRIPTOR_OUTPUT_REQUIRED_FIELDS,
  );
}

function sameList(left: readonly unknown[], right: readonly unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export type McpDescriptorInputSchemaContract = z.infer<
  typeof McpDescriptorInputSchemaContractSchema
>;
export type McpDescriptorOutputSchemaContract = z.infer<
  typeof McpDescriptorOutputSchemaContractSchema
>;
export type McpToolDescriptorContract = z.infer<
  typeof McpToolDescriptorContractSchema
>;
