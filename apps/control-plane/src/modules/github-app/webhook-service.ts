import type { PersistenceSession } from "../../lib/persistence";
import type { GitHubWebhookConfigResolution } from "./config";
import {
  GitHubWebhookBadSignatureError,
  GitHubWebhookNotConfiguredError,
  GitHubWebhookPayloadParseError,
} from "./errors";
import type {
  GitHubInstallationApi,
  GitHubRepositoryApi,
} from "./types";
import { GitHubWebhookPayloadSchema } from "./webhook-types";
import { verifyGitHubWebhookSignature } from "./webhook-signature";
import type { GitHubWebhookRepository } from "./webhook-repository";
import {
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
            installation: mapInstallation(parsed.installation),
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
            installation: mapInstallation(parsed.installation),
            repositoriesAdded: parsed.repositories_added.map(mapRepository),
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

function mapInstallation(installation: GitHubInstallationApi) {
  return {
    installationId: installation.id,
    appId: installation.app_id,
    accountLogin: installation.account.login,
    accountType: installation.account.type,
    targetType: installation.target_type ?? installation.account.type ?? null,
    targetId: installation.target_id ?? installation.account.id ?? null,
    suspendedAt: installation.suspended_at ?? null,
    permissions: installation.permissions,
  };
}

function mapRepository(repository: GitHubRepositoryApi) {
  return {
    githubRepositoryId: repository.id,
    fullName: repository.full_name,
    defaultBranch: repository.default_branch ?? "main",
    language: repository.language ?? null,
  };
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
