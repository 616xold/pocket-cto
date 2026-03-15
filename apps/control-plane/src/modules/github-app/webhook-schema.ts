import type { IncomingHttpHeaders } from "node:http";
import {
  GitHubWebhookMissingDeliveryIdError,
  GitHubWebhookMissingEventNameError,
  GitHubWebhookMissingSignatureError,
} from "./errors";
import {
  GitHubWebhookHeaderEnvelopeSchema,
  GitHubWebhookIngressResultSchema,
} from "./webhook-types";

export { GitHubWebhookIngressResultSchema };

export function parseGitHubWebhookHeaders(
  headers: IncomingHttpHeaders,
) {
  const deliveryId = getRequiredHeader(
    headers["x-github-delivery"],
    () => new GitHubWebhookMissingDeliveryIdError(),
  );
  const eventName = getRequiredHeader(
    headers["x-github-event"],
    () => new GitHubWebhookMissingEventNameError(),
  );
  const signature = getRequiredHeader(
    headers["x-hub-signature-256"],
    () => new GitHubWebhookMissingSignatureError(),
  );

  return GitHubWebhookHeaderEnvelopeSchema.parse({
    deliveryId,
    eventName,
    signature,
  });
}

function getRequiredHeader(
  value: string | string[] | undefined,
  createError: () => Error,
) {
  const normalized = normalizeHeader(value);

  if (!normalized) {
    throw createError();
  }

  return normalized;
}

function normalizeHeader(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : null;
}
