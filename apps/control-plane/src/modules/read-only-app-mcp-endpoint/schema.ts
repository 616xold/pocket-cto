import { z } from "zod";
import { McpToolNameSchema } from "@pocket-cto/domain";
import type { MCP_TOOL_ALLOWLIST } from "@pocket-cto/domain";

export const jsonRpcIdSchema = z.union([z.string(), z.number().int()]);

export const jsonRpcEnvelopeSchema = z
  .object({
    id: jsonRpcIdSchema.optional(),
    jsonrpc: z.literal("2.0"),
    method: z.string().min(1),
    params: z.unknown().optional(),
  })
  .strict();

const optionalEmptyParamsSchema = z.object({}).strict().optional();

export const initializeParamsSchema = z
  .object({
    capabilities: z.record(z.unknown()).optional(),
    clientInfo: z.record(z.unknown()).optional(),
    protocolVersion: z.string().optional(),
  })
  .strict()
  .optional();

export const pingParamsSchema = optionalEmptyParamsSchema;

export const toolsListParamsSchema = z
  .object({
    cursor: z.string().optional(),
  })
  .strict()
  .optional();

const companyKeySchema = z.string().min(1);
const optionalPeriodKeySchema = z.string().min(1).optional();

export const toolArgumentSchemas = {
  fetch_capability_boundaries: z
    .object({
      companyKey: companyKeySchema,
    })
    .strict(),
  fetch_company_posture: z
    .object({
      companyKey: companyKeySchema,
      periodKey: optionalPeriodKeySchema,
    })
    .strict(),
  fetch_document_map: z
    .object({
      companyKey: companyKeySchema,
      documentMapId: z.string().min(1),
    })
    .strict(),
  fetch_evidence_card: z
    .object({
      companyKey: companyKeySchema,
      evidenceCardId: z.string().min(1),
    })
    .strict(),
  fetch_source_anchor: z
    .object({
      companyKey: companyKeySchema,
      sourceAnchorId: z.string().min(1),
    })
    .strict(),
  fetch_source_coverage: z
    .object({
      companyKey: companyKeySchema,
      sourceId: z.string().min(1),
    })
    .strict(),
  search_evidence: z
    .object({
      companyKey: companyKeySchema,
      limit: z.number().int().positive().max(25).optional(),
      query: z.string().min(1),
    })
    .strict(),
} as const satisfies Record<
  (typeof MCP_TOOL_ALLOWLIST)[number],
  z.ZodType<Record<string, unknown>>
>;

export const toolsCallParamsSchema = z
  .object({
    arguments: z.record(z.unknown()).optional(),
    name: McpToolNameSchema,
  })
  .strict();

export type McpOriginValidationResult =
  | {
      allowed: true;
      reason: "absent_origin" | "loopback_origin";
    }
  | {
      allowed: false;
      reason: "invalid_origin" | "multiple_origin_headers";
    };

export function validateLocalMcpOriginHeader(
  originHeader: string | string[] | undefined,
): McpOriginValidationResult {
  if (originHeader === undefined) {
    return {
      allowed: true,
      reason: "absent_origin",
    };
  }

  if (Array.isArray(originHeader)) {
    return {
      allowed: false,
      reason: "multiple_origin_headers",
    };
  }

  const trimmedOrigin = originHeader.trim();
  if (trimmedOrigin.length === 0) {
    return {
      allowed: false,
      reason: "invalid_origin",
    };
  }

  try {
    const parsed = new URL(trimmedOrigin);
    const hostname = parsed.hostname.toLowerCase();
    const protocolAllowed =
      parsed.protocol === "http:" || parsed.protocol === "https:";
    const loopbackHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]";

    if (protocolAllowed && loopbackHost) {
      return {
        allowed: true,
        reason: "loopback_origin",
      };
    }
  } catch {
    return {
      allowed: false,
      reason: "invalid_origin",
    };
  }

  return {
    allowed: false,
    reason: "invalid_origin",
  };
}

export type JsonRpcEnvelope = z.infer<typeof jsonRpcEnvelopeSchema>;
export type JsonRpcId = z.infer<typeof jsonRpcIdSchema>;
export type ToolName = keyof typeof toolArgumentSchemas;
