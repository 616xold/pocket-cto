import { z } from "zod";

export const JsonRpcIdSchema = z.union([z.string(), z.number()]);

export const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0").optional(),
  id: JsonRpcIdSchema,
  method: z.string(),
  params: z.unknown().optional(),
});

export const JsonRpcSuccessSchema = z.object({
  jsonrpc: z.literal("2.0").optional(),
  id: JsonRpcIdSchema,
  result: z.unknown(),
}).superRefine((value, context) => {
  if (!Object.prototype.hasOwnProperty.call(value, "result")) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "result is required",
      path: ["result"],
    });
  }
});

export const JsonRpcErrorSchema = z.object({
  jsonrpc: z.literal("2.0").optional(),
  id: JsonRpcIdSchema.nullable().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }),
});

export const JsonRpcNotificationSchema = z.object({
  jsonrpc: z.literal("2.0").optional(),
  method: z.string(),
  params: z.unknown().optional(),
});

export const ClientInfoSchema = z.object({
  name: z.string().min(1),
  title: z.string().nullable(),
  version: z.string().min(1),
});

export const InitializeCapabilitiesSchema = z.object({
  experimentalApi: z.boolean(),
  optOutNotificationMethods: z.array(z.string()).nullable().optional(),
});

export const InitializeParamsSchema = z.object({
  clientInfo: ClientInfoSchema,
  capabilities: InitializeCapabilitiesSchema.nullable(),
});

export const InitializeResponseSchema = z.object({
  userAgent: z.string(),
});

export const AskForApprovalSchema = z.union([
  z.literal("untrusted"),
  z.literal("on-failure"),
  z.literal("on-request"),
  z.literal("never"),
  z.object({
    reject: z.object({
      sandbox_approval: z.boolean(),
      rules: z.boolean(),
      mcp_elicitations: z.boolean(),
    }),
  }),
]);

export const SandboxModeSchema = z.union([
  z.literal("read-only"),
  z.literal("workspace-write"),
  z.literal("danger-full-access"),
]);

export const ServiceTierSchema = z.union([
  z.literal("fast"),
  z.literal("flex"),
]);

export const NetworkAccessSchema = z.union([
  z.literal("restricted"),
  z.literal("enabled"),
]);

export const ReadOnlyAccessSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("restricted"),
    includePlatformDefaults: z.boolean(),
    readableRoots: z.array(z.string()),
  }),
  z.object({
    type: z.literal("fullAccess"),
  }),
]);

export const SandboxPolicySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("dangerFullAccess"),
  }),
  z.object({
    type: z.literal("readOnly"),
    access: ReadOnlyAccessSchema,
    networkAccess: z.boolean(),
  }),
  z.object({
    type: z.literal("externalSandbox"),
    networkAccess: NetworkAccessSchema,
  }),
  z.object({
    type: z.literal("workspaceWrite"),
    writableRoots: z.array(z.string()),
    readOnlyAccess: ReadOnlyAccessSchema,
    networkAccess: z.boolean(),
    excludeTmpdirEnvVar: z.boolean(),
    excludeSlashTmp: z.boolean(),
  }),
]);

export const GitInfoSchema = z.object({
  sha: z.string().nullable(),
  branch: z.string().nullable(),
  originUrl: z.string().nullable(),
});

export const SessionSourceSchema = z.union([
  z.literal("cli"),
  z.literal("vscode"),
  z.literal("exec"),
  z.literal("appServer"),
  z.literal("unknown"),
  z.object({
    subAgent: z.unknown(),
  }),
]);

export const ThreadActiveFlagSchema = z.union([
  z.literal("waitingOnApproval"),
  z.literal("waitingOnUserInput"),
]);

export const ThreadStatusSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("notLoaded") }),
  z.object({ type: z.literal("idle") }),
  z.object({ type: z.literal("systemError") }),
  z.object({
    type: z.literal("active"),
    activeFlags: z.array(ThreadActiveFlagSchema),
  }),
]);

export const TurnStatusSchema = z.union([
  z.literal("completed"),
  z.literal("interrupted"),
  z.literal("failed"),
  z.literal("inProgress"),
]);

export const TerminalTurnStatusSchema = z.union([
  z.literal("completed"),
  z.literal("interrupted"),
  z.literal("failed"),
]);

export const TurnErrorSchema = z.object({
  message: z.string(),
  codexErrorInfo: z.unknown().nullable(),
  additionalDetails: z.string().nullable(),
});

export const ThreadItemSchema = z
  .object({
    type: z.string().min(1),
    id: z.string(),
  })
  .passthrough();

export const AgentMessageThreadItemSchema = z
  .object({
    type: z.literal("agentMessage"),
    id: z.string(),
    text: z.string(),
    phase: z.unknown().nullable().optional(),
  })
  .passthrough();

export const PlanThreadItemSchema = z
  .object({
    type: z.literal("plan"),
    id: z.string(),
    text: z.string(),
  })
  .passthrough();

export const TextualThreadItemSchema = z.union([
  AgentMessageThreadItemSchema,
  PlanThreadItemSchema,
]);

export const TurnSchema = z.object({
  id: z.string(),
  items: z.array(ThreadItemSchema),
  status: TurnStatusSchema,
  error: TurnErrorSchema.nullable(),
});

export const ThreadSchema = z.object({
  id: z.string(),
  preview: z.string(),
  ephemeral: z.boolean(),
  modelProvider: z.string(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
  status: ThreadStatusSchema,
  path: z.string().nullable(),
  cwd: z.string(),
  cliVersion: z.string(),
  source: SessionSourceSchema,
  agentNickname: z.string().nullable(),
  agentRole: z.string().nullable(),
  gitInfo: GitInfoSchema.nullable(),
  name: z.string().nullable(),
  turns: z.array(TurnSchema),
});

export const ThreadStartParamsSchema = z.object({
  model: z.string().nullable().optional(),
  modelProvider: z.string().nullable().optional(),
  serviceTier: ServiceTierSchema.nullable().optional(),
  cwd: z.string().nullable().optional(),
  approvalPolicy: AskForApprovalSchema.nullable().optional(),
  sandbox: SandboxModeSchema.nullable().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
  serviceName: z.string().nullable().optional(),
  baseInstructions: z.string().nullable().optional(),
  developerInstructions: z.string().nullable().optional(),
  personality: z.unknown().nullable().optional(),
  ephemeral: z.boolean().nullable().optional(),
  experimentalRawEvents: z.boolean().default(false),
  persistExtendedHistory: z.boolean().default(false),
});

export const ThreadStartResponseSchema = z.object({
  thread: ThreadSchema,
  model: z.string(),
  modelProvider: z.string(),
  serviceTier: ServiceTierSchema.nullable(),
  cwd: z.string(),
  approvalPolicy: AskForApprovalSchema,
  sandbox: SandboxPolicySchema,
  reasoningEffort: z.unknown().nullable(),
});

export const ThreadResumeParamsSchema = z.object({
  threadId: z.string(),
  history: z.array(z.unknown()).nullable().optional(),
  path: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  modelProvider: z.string().nullable().optional(),
  serviceTier: ServiceTierSchema.nullable().optional(),
  cwd: z.string().nullable().optional(),
  approvalPolicy: AskForApprovalSchema.nullable().optional(),
  sandbox: SandboxModeSchema.nullable().optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
  baseInstructions: z.string().nullable().optional(),
  developerInstructions: z.string().nullable().optional(),
  personality: z.unknown().nullable().optional(),
  persistExtendedHistory: z.boolean().default(false),
});

export const ThreadResumeResponseSchema = z.object({
  thread: ThreadSchema,
  model: z.string(),
  modelProvider: z.string(),
  serviceTier: ServiceTierSchema.nullable(),
  cwd: z.string(),
  approvalPolicy: AskForApprovalSchema,
  sandbox: SandboxPolicySchema,
  reasoningEffort: z.unknown().nullable(),
});

export const TextElementSchema = z.object({
  byteRange: z.object({
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
  }),
  placeholder: z.string().nullable(),
});

export const UserInputSchema = z.union([
  z.object({
    type: z.literal("text"),
    text: z.string(),
    text_elements: z.array(TextElementSchema).default([]),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string(),
  }),
  z.object({
    type: z.literal("localImage"),
    path: z.string(),
  }),
  z.object({
    type: z.literal("skill"),
    name: z.string(),
    path: z.string(),
  }),
  z.object({
    type: z.literal("mention"),
    name: z.string(),
    path: z.string(),
  }),
]);

export const TurnStartParamsSchema = z.object({
  threadId: z.string(),
  input: z.array(UserInputSchema),
  cwd: z.string().nullable().optional(),
  approvalPolicy: AskForApprovalSchema.nullable().optional(),
  sandboxPolicy: SandboxPolicySchema.nullable().optional(),
  model: z.string().nullable().optional(),
  serviceTier: ServiceTierSchema.nullable().optional(),
  effort: z.string().nullable().optional(),
  summary: z.unknown().nullable().optional(),
  personality: z.unknown().nullable().optional(),
  outputSchema: z.unknown().nullable().optional(),
  collaborationMode: z.unknown().nullable().optional(),
});

export const TurnStartResponseSchema = z.object({
  turn: TurnSchema,
});

export const TurnInterruptParamsSchema = z.object({
  threadId: z.string(),
  turnId: z.string(),
});

export const TurnInterruptResponseSchema = z.object({});

export const ThreadStartedNotificationSchema = z.object({
  thread: ThreadSchema,
});

export const TurnStartedNotificationSchema = z.object({
  threadId: z.string(),
  turn: TurnSchema,
});

export const TurnCompletedNotificationSchema = z.object({
  threadId: z.string(),
  turn: TurnSchema,
});

export const ItemStartedNotificationSchema = z.object({
  item: ThreadItemSchema,
  threadId: z.string(),
  turnId: z.string(),
});

export const ItemCompletedNotificationSchema = z.object({
  item: ThreadItemSchema,
  threadId: z.string(),
  turnId: z.string(),
});

export const TerminalInteractionNotificationSchema = z.object({
  threadId: z.string(),
  turnId: z.string(),
  itemId: z.string(),
  processId: z.string(),
  stdin: z.string(),
});

export const ErrorNotificationSchema = z.object({
  error: TurnErrorSchema,
  willRetry: z.boolean(),
  threadId: z.string(),
  turnId: z.string(),
});

export const KnownServerNotificationSchema = z.union([
  z.object({
    method: z.literal("thread/started"),
    params: ThreadStartedNotificationSchema,
  }),
  z.object({
    method: z.literal("turn/started"),
    params: TurnStartedNotificationSchema,
  }),
  z.object({
    method: z.literal("turn/completed"),
    params: TurnCompletedNotificationSchema,
  }),
  z.object({
    method: z.literal("item/started"),
    params: ItemStartedNotificationSchema,
  }),
  z.object({
    method: z.literal("item/completed"),
    params: ItemCompletedNotificationSchema,
  }),
  z.object({
    method: z.literal("item/commandExecution/terminalInteraction"),
    params: TerminalInteractionNotificationSchema,
  }),
  z.object({
    method: z.literal("error"),
    params: ErrorNotificationSchema,
  }),
]);

export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;
export type JsonRpcSuccess = z.infer<typeof JsonRpcSuccessSchema>;
export type JsonRpcError = z.infer<typeof JsonRpcErrorSchema>;
export type JsonRpcNotification = z.infer<typeof JsonRpcNotificationSchema>;
export type ClientInfo = z.infer<typeof ClientInfoSchema>;
export type InitializeParams = z.infer<typeof InitializeParamsSchema>;
export type InitializeResponse = z.infer<typeof InitializeResponseSchema>;
export type AskForApproval = z.infer<typeof AskForApprovalSchema>;
export type SandboxMode = z.infer<typeof SandboxModeSchema>;
export type SandboxPolicy = z.infer<typeof SandboxPolicySchema>;
export type ThreadItem = z.infer<typeof ThreadItemSchema>;
export type AgentMessageThreadItem = z.infer<
  typeof AgentMessageThreadItemSchema
>;
export type PlanThreadItem = z.infer<typeof PlanThreadItemSchema>;
export type TextualThreadItem = z.infer<typeof TextualThreadItemSchema>;
export type Thread = z.infer<typeof ThreadSchema>;
export type ThreadStartParams = z.infer<typeof ThreadStartParamsSchema>;
export type ThreadStartResponse = z.infer<typeof ThreadStartResponseSchema>;
export type ThreadResumeParams = z.infer<typeof ThreadResumeParamsSchema>;
export type ThreadResumeResponse = z.infer<typeof ThreadResumeResponseSchema>;
export type Turn = z.infer<typeof TurnSchema>;
export type TerminalTurnStatus = z.infer<typeof TerminalTurnStatusSchema>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type TurnStartParams = z.infer<typeof TurnStartParamsSchema>;
export type TurnStartResponse = z.infer<typeof TurnStartResponseSchema>;
export type TurnInterruptParams = z.infer<typeof TurnInterruptParamsSchema>;
export type TurnInterruptResponse = z.infer<typeof TurnInterruptResponseSchema>;
export type KnownServerNotification = z.infer<
  typeof KnownServerNotificationSchema
>;

export function readTextualThreadItem(
  item: ThreadItem,
): TextualThreadItem | null {
  const parsed = TextualThreadItemSchema.safeParse(item);
  return parsed.success ? parsed.data : null;
}

export function readAgentMessageThreadItem(
  item: ThreadItem,
): AgentMessageThreadItem | null {
  const parsed = AgentMessageThreadItemSchema.safeParse(item);
  return parsed.success ? parsed.data : null;
}
