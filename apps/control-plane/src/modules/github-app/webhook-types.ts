import { z } from "zod";
import {
  GitHubIdSchema,
  GitHubInstallationApiSchema,
  GitHubInstallationSnapshotSchema,
  GitHubRepositoryApiSchema,
} from "./types";

export const GitHubWebhookOutcomeSchema = z.enum([
  "installation_state_updated",
  "installation_repositories_updated",
  "issue_envelope_recorded",
  "issue_comment_envelope_recorded",
  "ignored_event",
]);

export const GitHubWebhookPayloadSchema = z.record(z.string(), z.unknown());

export const GitHubWebhookInstallationPayloadSchema = z.object({
  action: z.string().min(1),
  installation: GitHubInstallationApiSchema,
});

export const GitHubWebhookInstallationRepositoriesPayloadSchema = z.object({
  action: z.string().min(1),
  installation: GitHubInstallationApiSchema,
  repositories_added: z.array(GitHubRepositoryApiSchema).default([]),
  repositories_removed: z.array(GitHubRepositoryApiSchema).default([]),
});

export const GitHubWebhookIssuesPayloadSchema = z.object({
  action: z.string().min(1),
  installation: z.object({
    id: GitHubIdSchema,
  }),
  repository: GitHubRepositoryApiSchema,
  issue: z.object({
    id: GitHubIdSchema,
    number: z.number().int().nonnegative(),
  }),
});

export const GitHubWebhookIssueCommentPayloadSchema = z.object({
  action: z.string().min(1),
  installation: z.object({
    id: GitHubIdSchema,
  }),
  repository: GitHubRepositoryApiSchema,
  issue: z.object({
    id: GitHubIdSchema,
    number: z.number().int().nonnegative(),
  }),
  comment: z.object({
    id: GitHubIdSchema,
  }),
});

export const GitHubWebhookDeliveryInsertSchema = z.object({
  deliveryId: z.string().min(1),
  eventName: z.string().min(1),
  action: z.string().min(1).nullable(),
  installationId: z.string().min(1).nullable(),
  payload: GitHubWebhookPayloadSchema,
});

export const PersistedGitHubWebhookDeliverySchema =
  GitHubWebhookDeliveryInsertSchema.extend({
    id: z.string().uuid(),
    outcome: GitHubWebhookOutcomeSchema.nullable(),
    processedAt: z.string().datetime({ offset: true }).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  });

export const GitHubWebhookIngressResultSchema = z.object({
  accepted: z.literal(true),
  duplicate: z.boolean(),
  deliveryId: z.string().min(1),
  eventName: z.string().min(1),
  action: z.string().min(1).nullable(),
  handledAs: GitHubWebhookOutcomeSchema,
  persistedAt: z.string().datetime({ offset: true }),
});

const GitHubWebhookPayloadPreviewValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.array(z.number()),
]);

export const GitHubWebhookDeliveryListQuerySchema = z.object({
  eventName: z.string().min(1).optional(),
  handledAs: GitHubWebhookOutcomeSchema.optional(),
  installationId: z.string().min(1).optional(),
});

export const GitHubWebhookDeliveryParamsSchema = z.object({
  deliveryId: z.string().min(1),
});

export const GitHubWebhookDeliverySummarySchema = z.object({
  deliveryId: z.string().min(1),
  eventName: z.string().min(1),
  action: z.string().min(1).nullable(),
  installationId: z.string().min(1).nullable(),
  handledAs: GitHubWebhookOutcomeSchema.nullable(),
  receivedAt: z.string().datetime({ offset: true }),
  persistedAt: z.string().datetime({ offset: true }).nullable(),
  payloadPreview: z.record(z.string(), GitHubWebhookPayloadPreviewValueSchema),
});

export const GitHubWebhookDeliveryListResultSchema = z.object({
  deliveries: z.array(GitHubWebhookDeliverySummarySchema),
});

export const GitHubWebhookDeliveryResultSchema = z.object({
  delivery: GitHubWebhookDeliverySummarySchema,
});

export const GitHubWebhookHeaderEnvelopeSchema = z.object({
  deliveryId: z.string().min(1),
  eventName: z.string().min(1),
  signature: z.string().min(1),
});

export const GitHubWebhookInstallationEventInputSchema = z.object({
  action: z.string().min(1),
  installation: GitHubInstallationSnapshotSchema,
});

export type GitHubWebhookOutcome = z.infer<typeof GitHubWebhookOutcomeSchema>;
export type GitHubWebhookPayload = z.infer<typeof GitHubWebhookPayloadSchema>;
export type GitHubWebhookInstallationPayload = z.infer<
  typeof GitHubWebhookInstallationPayloadSchema
>;
export type GitHubWebhookInstallationRepositoriesPayload = z.infer<
  typeof GitHubWebhookInstallationRepositoriesPayloadSchema
>;
export type GitHubWebhookIssuesPayload = z.infer<
  typeof GitHubWebhookIssuesPayloadSchema
>;
export type GitHubWebhookIssueCommentPayload = z.infer<
  typeof GitHubWebhookIssueCommentPayloadSchema
>;
export type GitHubWebhookDeliveryInsert = z.infer<
  typeof GitHubWebhookDeliveryInsertSchema
>;
export type PersistedGitHubWebhookDelivery = z.infer<
  typeof PersistedGitHubWebhookDeliverySchema
>;
export type GitHubWebhookIngressResult = z.infer<
  typeof GitHubWebhookIngressResultSchema
>;
export type GitHubWebhookDeliveryListQuery = z.infer<
  typeof GitHubWebhookDeliveryListQuerySchema
>;
export type GitHubWebhookDeliveryLookupFilters =
  GitHubWebhookDeliveryListQuery & {
    limit?: number;
  };
export type GitHubWebhookDeliverySummary = z.infer<
  typeof GitHubWebhookDeliverySummarySchema
>;
export type GitHubWebhookDeliveryListResult = z.infer<
  typeof GitHubWebhookDeliveryListResultSchema
>;
export type GitHubWebhookDeliveryResult = z.infer<
  typeof GitHubWebhookDeliveryResultSchema
>;
export type GitHubWebhookHeaderEnvelope = z.infer<
  typeof GitHubWebhookHeaderEnvelopeSchema
>;
export type GitHubWebhookDeliveryParams = z.infer<
  typeof GitHubWebhookDeliveryParamsSchema
>;
