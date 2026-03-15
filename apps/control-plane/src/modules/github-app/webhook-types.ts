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
export type GitHubWebhookHeaderEnvelope = z.infer<
  typeof GitHubWebhookHeaderEnvelopeSchema
>;
