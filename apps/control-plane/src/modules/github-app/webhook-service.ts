import type { PersistenceSession } from "../../lib/persistence";
import type { GitHubWebhookConfigResolution } from "./config";
import {
  GitHubWebhookBadSignatureError,
  GitHubWebhookDeliveryNotFoundError,
  GitHubWebhookNotConfiguredError,
  GitHubWebhookPayloadParseError,
} from "./errors";
import { mapGitHubInstallationApiToSnapshot, mapGitHubRepositoryApiToSnapshot } from "./types";
import { GitHubWebhookPayloadSchema } from "./webhook-types";
import { verifyGitHubWebhookSignature } from "./webhook-signature";
import type { GitHubWebhookRepository } from "./webhook-repository";
import {
  GitHubWebhookDeliveryListResultSchema,
  GitHubWebhookDeliveryResultSchema,
  GitHubWebhookDeliverySummarySchema,
  type GitHubWebhookDeliveryListQuery,
  GitHubWebhookIngressResultSchema,
  GitHubWebhookInstallationPayloadSchema,
  GitHubWebhookInstallationRepositoriesPayloadSchema,
  GitHubWebhookIssueCommentPayloadSchema,
  GitHubWebhookIssuesPayloadSchema,
  type GitHubWebhookHeaderEnvelope,
  type GitHubWebhookIngressResult,
  type GitHubWebhookOutcome,
  type PersistedGitHubWebhookDelivery,
} from "./webhook-types";
import type { GitHubAppService } from "./service";

export class GitHubWebhookService {
  private readonly now: () => Date;

  constructor(
    private readonly input: {
      config: GitHubWebhookConfigResolution;
      githubAppService: Pick<
        GitHubAppService,
        "applyInstallationEvent" | "applyInstallationRepositoriesEvent"
      >;
      repository: GitHubWebhookRepository;
      now?: () => Date;
    },
  ) {
    this.now = input.now ?? (() => new Date());
  }

  async ingest(
    input: GitHubWebhookHeaderEnvelope & {
      rawBody: Buffer;
    },
  ): Promise<GitHubWebhookIngressResult> {
    const config = this.requireConfigured();

    if (
      !verifyGitHubWebhookSignature(config.secret, input.rawBody, input.signature)
    ) {
      throw new GitHubWebhookBadSignatureError();
    }

    const payload = parseWebhookPayload(input.rawBody);
    const action = extractAction(payload);
    const installationId = extractInstallationId(payload);

    return this.input.repository.transaction(async (session) => {
      const created = await this.input.repository.createDeliveryIfAbsent(
        {
          deliveryId: input.deliveryId,
          eventName: input.eventName,
          action,
          installationId,
          payload,
        },
        session,
      );

      if (created.duplicate) {
        return toIngressResult(created.delivery, true);
      }

      const outcome = await this.handleEvent(
        input.eventName,
        payload,
        session,
      );
      const processedAt = this.now().toISOString();
      const delivery = await this.input.repository.finalizeDelivery(
        {
          deliveryId: input.deliveryId,
          outcome,
          processedAt,
        },
        session,
      );

      return toIngressResult(delivery, false);
    });
  }

  async listDeliveries(filters: GitHubWebhookDeliveryListQuery = {}) {
    const deliveries = await this.input.repository.listDeliveries({
      ...filters,
      limit: 50,
    });

    return GitHubWebhookDeliveryListResultSchema.parse({
      deliveries: deliveries.map(toDeliverySummary),
    });
  }

  async getDelivery(deliveryId: string) {
    const delivery = await this.input.repository.getDeliveryByDeliveryId(
      deliveryId,
    );

    if (!delivery) {
      throw new GitHubWebhookDeliveryNotFoundError(deliveryId);
    }

    return GitHubWebhookDeliveryResultSchema.parse({
      delivery: toDeliverySummary(delivery),
    });
  }

  private async handleEvent(
    eventName: string,
    payload: Record<string, unknown>,
    session: PersistenceSession,
  ): Promise<GitHubWebhookOutcome> {
    switch (eventName) {
      case "installation": {
        const parsed = GitHubWebhookInstallationPayloadSchema.parse(payload);

        await this.input.githubAppService.applyInstallationEvent(
          {
            action: parsed.action,
            installation: mapGitHubInstallationApiToSnapshot(
              parsed.installation,
            ),
          },
          session,
        );

        return "installation_state_updated";
      }
      case "installation_repositories": {
        const parsed =
          GitHubWebhookInstallationRepositoriesPayloadSchema.parse(payload);

        await this.input.githubAppService.applyInstallationRepositoriesEvent(
          {
            action: parsed.action,
            installation: mapGitHubInstallationApiToSnapshot(
              parsed.installation,
            ),
            repositoriesAdded: parsed.repositories_added.map(
              mapGitHubRepositoryApiToSnapshot,
            ),
            repositoriesRemoved: parsed.repositories_removed.map(
              (repository) => repository.id,
            ),
          },
          session,
        );

        return "installation_repositories_updated";
      }
      case "issues":
        GitHubWebhookIssuesPayloadSchema.parse(payload);
        return "issue_envelope_recorded";
      case "issue_comment":
        GitHubWebhookIssueCommentPayloadSchema.parse(payload);
        return "issue_comment_envelope_recorded";
      default:
        return "ignored_event";
    }
  }

  private requireConfigured() {
    if (this.input.config.status === "unconfigured") {
      throw new GitHubWebhookNotConfiguredError(this.input.config.missing);
    }

    return this.input.config.config;
  }
}

function parseWebhookPayload(rawBody: Buffer) {
  try {
    const parsed = JSON.parse(rawBody.toString("utf8")) as unknown;
    return GitHubWebhookPayloadSchema.parse(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new GitHubWebhookPayloadParseError();
    }

    throw error;
  }
}

function extractAction(payload: Record<string, unknown>) {
  return typeof payload.action === "string" && payload.action.trim().length > 0
    ? payload.action
    : null;
}

function extractInstallationId(payload: Record<string, unknown>) {
  const installation = payload.installation;

  if (!installation || typeof installation !== "object" || Array.isArray(installation)) {
    return null;
  }

  const id = (installation as { id?: unknown }).id;
  if (typeof id === "number" || typeof id === "string") {
    return String(id);
  }

  return null;
}

function toIngressResult(
  delivery: PersistedGitHubWebhookDelivery,
  duplicate: boolean,
) {
  if (!delivery.outcome || !delivery.processedAt) {
    throw new Error(
      `GitHub webhook delivery ${delivery.deliveryId} is missing a finalized outcome`,
    );
  }

  return GitHubWebhookIngressResultSchema.parse({
    accepted: true,
    duplicate,
    deliveryId: delivery.deliveryId,
    eventName: delivery.eventName,
    action: delivery.action,
    handledAs: delivery.outcome,
    persistedAt: delivery.processedAt,
  });
}

function toDeliverySummary(delivery: PersistedGitHubWebhookDelivery) {
  return GitHubWebhookDeliverySummarySchema.parse({
    deliveryId: delivery.deliveryId,
    eventName: delivery.eventName,
    action: delivery.action,
    installationId: delivery.installationId,
    handledAs: delivery.outcome,
    receivedAt: delivery.createdAt,
    persistedAt: delivery.processedAt,
    payloadPreview: buildPayloadPreview(delivery),
  });
}

function buildPayloadPreview(delivery: PersistedGitHubWebhookDelivery) {
  switch (delivery.eventName) {
    case "installation":
      return summarizeInstallationPayload(delivery.payload);
    case "installation_repositories":
      return summarizeInstallationRepositoriesPayload(delivery.payload);
    case "issues":
      return summarizeIssuePayload(delivery.payload);
    case "issue_comment":
      return summarizeIssueCommentPayload(delivery.payload);
    default:
      return summarizeGenericPayload(delivery.payload);
  }
}

function summarizeInstallationPayload(payload: Record<string, unknown>) {
  const parsed = GitHubWebhookInstallationPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return summarizeGenericPayload(payload);
  }

  return {
    accountLogin: parsed.data.installation.account.login,
    accountType: parsed.data.installation.account.type,
    targetType:
      parsed.data.installation.target_type ??
      parsed.data.installation.account.type,
  };
}

function summarizeInstallationRepositoriesPayload(
  payload: Record<string, unknown>,
) {
  const parsed =
    GitHubWebhookInstallationRepositoriesPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return summarizeGenericPayload(payload);
  }

  return {
    accountLogin: parsed.data.installation.account.login,
    addedCount: parsed.data.repositories_added.length,
    removedCount: parsed.data.repositories_removed.length,
    addedRepositoryNames: parsed.data.repositories_added
      .map((repository) => repository.full_name)
      .slice(0, 5),
    removedRepositoryNames: parsed.data.repositories_removed
      .map((repository) => repository.full_name)
      .slice(0, 5),
  };
}

function summarizeIssuePayload(payload: Record<string, unknown>) {
  const parsed = GitHubWebhookIssuesPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return summarizeGenericPayload(payload);
  }

  return {
    repositoryFullName: parsed.data.repository.full_name,
    issueId: String(parsed.data.issue.id),
    issueNumber: parsed.data.issue.number,
  };
}

function summarizeIssueCommentPayload(payload: Record<string, unknown>) {
  const parsed = GitHubWebhookIssueCommentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return summarizeGenericPayload(payload);
  }

  return {
    repositoryFullName: parsed.data.repository.full_name,
    issueNumber: parsed.data.issue.number,
    commentId: String(parsed.data.comment.id),
  };
}

function summarizeGenericPayload(payload: Record<string, unknown>) {
  return {
    topLevelKeys: Object.keys(payload).sort().slice(0, 8),
  };
}
